// schema_migration.js - Run this ONCE to fix all table issues
import pg from 'pg';
const { Pool } = pg;

export async function unifyDatabaseSchema() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Drop conflicting tables
        await client.query('DROP TABLE IF EXISTS memory_entries CASCADE');
        
        // Create unified table with correct schema
        await client.query(`
            CREATE TABLE IF NOT EXISTS persistent_memories (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                subcategory VARCHAR(100),
                content TEXT NOT NULL,
                metadata JSONB DEFAULT '{}',
                relevance_score DECIMAL(3,2) DEFAULT 0.50,
                token_count INTEGER NOT NULL DEFAULT 0,
                usage_frequency INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                last_accessed TIMESTAMP DEFAULT NOW(),
                emotional_weight DECIMAL(3,2) DEFAULT 0.0,
                user_priority BOOLEAN DEFAULT FALSE,
                is_question BOOLEAN DEFAULT FALSE
            );
        `);
        
        // Create indexes for performance
        await client.query('CREATE INDEX IF NOT EXISTS idx_user_category ON persistent_memories(user_id, category)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_relevance ON persistent_memories(relevance_score DESC)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_created ON persistent_memories(created_at DESC)');
        
        await client.query('COMMIT');
        console.log('✅ Database schema unified successfully');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Schema migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run migration
unifyDatabaseSchema().catch(console.error);
