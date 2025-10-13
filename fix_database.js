// fix_database.js - Complete Database Schema Fix
// Run this ONCE to fix your persistent_memories table

import pg from 'pg';
const { Client } = pg;

async function fixDatabase() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        await client.connect();
        console.log('🔌 Connected to database');

        // Step 1: Check current table structure
        console.log('📋 Checking current table structure...');
        const tableInfo = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'persistent_memories'
            ORDER BY ordinal_position;
        `);
        
        console.log('Current columns:', tableInfo.rows.map(r => r.column_name));

        // Step 2: Fix column names if needed
        const hasCorrectColumns = tableInfo.rows.some(r => r.column_name === 'category_name');
        
        if (!hasCorrectColumns) {
            console.log('🔧 Fixing column names...');
            
            // Rename columns to match code expectations
            await client.query('ALTER TABLE persistent_memories RENAME COLUMN category TO category_name;');
            await client.query('ALTER TABLE persistent_memories RENAME COLUMN subcategory TO subcategory_name;');
            
            console.log('✅ Column names fixed');
        }

        // Step 3: Ensure all required columns exist
        console.log('📋 Ensuring all required columns exist...');
        
        await client.query(`
            -- Add missing columns if they don't exist
            DO $$ 
            BEGIN
                -- Add relevance_score if missing
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name = 'persistent_memories' AND column_name = 'relevance_score') THEN
                    ALTER TABLE persistent_memories ADD COLUMN relevance_score DECIMAL(3,2) DEFAULT 0.50;
                END IF;
                
                -- Add usage_frequency if missing
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name = 'persistent_memories' AND column_name = 'usage_frequency') THEN
                    ALTER TABLE persistent_memories ADD COLUMN usage_frequency INTEGER DEFAULT 0;
                END IF;
                
                -- Add last_accessed if missing
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name = 'persistent_memories' AND column_name = 'last_accessed') THEN
                    ALTER TABLE persistent_memories ADD COLUMN last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
                END IF;
                
                -- Add metadata if missing
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name = 'persistent_memories' AND column_name = 'metadata') THEN
                    ALTER TABLE persistent_memories ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
                END IF;
            END $$;
        `);

        // Step 4: Create memory_categories table if missing
        console.log('📋 Creating memory_categories table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS memory_categories (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                category_name VARCHAR(100) NOT NULL,
                subcategory_name VARCHAR(100),
                current_tokens INTEGER DEFAULT 0,
                max_tokens INTEGER DEFAULT 50000,
                is_dynamic BOOLEAN DEFAULT FALSE,
                dynamic_focus VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Step 4.5: Safely add UNIQUE constraint after checking for violations
        console.log('📋 Checking for constraint violations before adding UNIQUE constraint...');
        const violations = await client.query(`
            SELECT user_id, category_name, subcategory_name, COUNT(*) as count
            FROM memory_categories
            GROUP BY user_id, category_name, subcategory_name
            HAVING COUNT(*) > 1
        `);
        
        if (violations.rows.length > 0) {
            console.warn(`⚠️ Found ${violations.rows.length} duplicate entries. Cleaning up...`);
            // Keep only the most recent entry for each duplicate group
            await client.query(`
                DELETE FROM memory_categories a USING memory_categories b
                WHERE a.id < b.id 
                AND a.user_id = b.user_id 
                AND a.category_name = b.category_name
                AND COALESCE(a.subcategory_name, '') = COALESCE(b.subcategory_name, '')
            `);
            console.log('✅ Duplicate entries cleaned up');
        } else {
            console.log('✅ No constraint violations found');
        }
        
        // Now safely add the constraint
        await client.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'memory_categories_user_id_category_name_subcategory_name_key'
                ) THEN
                    ALTER TABLE memory_categories 
                    ADD CONSTRAINT memory_categories_user_id_category_name_subcategory_name_key 
                    UNIQUE(user_id, category_name, subcategory_name);
                END IF;
            END $$;
        `);
        console.log('✅ UNIQUE constraint added safely');

        // Step 5: Create user_memory_profiles table if missing
        console.log('📋 Creating user_memory_profiles table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_memory_profiles (
                user_id TEXT PRIMARY KEY,
                total_memories INTEGER DEFAULT 0,
                total_tokens INTEGER DEFAULT 0,
                active_categories TEXT[] DEFAULT '{}',
                memory_patterns JSONB DEFAULT '{}'::jsonb,
                last_optimization TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Step 6: Create indexes for performance
        console.log('📋 Creating performance indexes...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_pm_user_cat_rel_created
                ON persistent_memories (user_id, category_name, relevance_score DESC, created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_pm_last_accessed
                ON persistent_memories (user_id, last_accessed DESC);
        `);

        // Step 7: Migrate data from memory_entries if it exists
        console.log('📋 Checking for data migration...');
        const legacyCheck = await client.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'memory_entries'
            );
        `);

        if (legacyCheck.rows[0].exists) {
            console.log('🔄 Migrating data from memory_entries...');
            await client.query(`
                INSERT INTO persistent_memories 
                (user_id, category_name, subcategory_name, content, token_count, relevance_score, usage_frequency, last_accessed, created_at, metadata)
                SELECT 
                    COALESCE(user_id, 'unknown'),
                    COALESCE(category_name, 'personal_development'),
                    COALESCE(subcategory_name, 'general'),
                    COALESCE(content, ''),
                    COALESCE(token_count, CEIL(LENGTH(content)::float / 4)::integer),
                    COALESCE(relevance_score, 0.5),
                    COALESCE(usage_frequency, 0),
                    COALESCE(last_accessed, created_at, CURRENT_TIMESTAMP),
                    COALESCE(created_at, CURRENT_TIMESTAMP),
                    COALESCE(metadata, '{}'::jsonb)
                FROM memory_entries
                WHERE content IS NOT NULL 
                AND LENGTH(TRIM(content)) > 0
                ON CONFLICT DO NOTHING;
            `);

            // Rename old table for safety
            await client.query('ALTER TABLE memory_entries RENAME TO memory_entries_backup;');
            console.log('✅ Data migration completed');
        }

        console.log('🎉 Database fix completed successfully!');
        
        // Verify final structure
        const finalCheck = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'persistent_memories'
            ORDER BY ordinal_position;
        `);
        
        console.log('✅ Final table structure:', finalCheck.rows.map(r => r.column_name));

    } catch (error) {
        console.error('❌ Database fix failed:', error);
        throw error;
    } finally {
        await client.end();
    }
}

// Run the fix
fixDatabase()
    .then(() => {
        console.log('🎉 DATABASE FIX COMPLETE - Your persistent memory should now work!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 FIX FAILED:', error);
        process.exit(1);
    });
