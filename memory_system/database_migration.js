// memory_system/database_migration.js
// SAFE MIGRATION: Adds missing columns to existing table without data loss

import { Pool } from 'pg';

class DatabaseMigration {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }

  async runMigration() {
    console.log('[MIGRATION] 🔄 Starting safe database migration...');
    
    try {
      // Check if table exists first
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        console.log('[MIGRATION] ❌ Table persistent_memories does not exist');
        return false;
      }

      // Get current table structure
      const currentColumns = await this.getCurrentColumns();
      console.log('[MIGRATION] 📋 Current columns:', currentColumns);

      // Add missing columns one by one
      const columnsToAdd = [
        {
          name: 'emotional_weight',
          definition: 'emotional_weight DECIMAL(3,2) DEFAULT 0.00'
        },
        {
          name: 'is_question',
          definition: 'is_question BOOLEAN DEFAULT false'
        },
        {
          name: 'user_priority',
          definition: 'user_priority BOOLEAN DEFAULT false'
        },
        {
          name: 'usage_frequency',
          definition: 'usage_frequency INTEGER DEFAULT 0'
        },
        {
          name: 'metadata',
          definition: 'metadata JSONB DEFAULT \'{}\''
        },
        {
          name: 'archived',
          definition: 'archived BOOLEAN DEFAULT false'
        }
      ];

      let addedColumns = 0;
      for (const column of columnsToAdd) {
        if (!currentColumns.includes(column.name)) {
          await this.addColumn(column.definition);
          addedColumns++;
          console.log(`[MIGRATION] ✅ Added column: ${column.name}`);
        } else {
          console.log(`[MIGRATION] ⏭️ Column ${column.name} already exists`);
        }
      }

      // Add indexes safely
      await this.addIndexesSafely();

      console.log(`[MIGRATION] 🎉 Migration complete! Added ${addedColumns} columns`);
      
      // Verify the migration
      const finalColumns = await this.getCurrentColumns();
      console.log('[MIGRATION] 📋 Final columns:', finalColumns);
      
      return true;

    } catch (error) {
      console.error('[MIGRATION] ❌ Migration failed:', error);
      return false;
    }
  }

  async checkTableExists() {
    try {
      const result = await this.pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'persistent_memories'
        );
      `);
      return result.rows[0].exists;
    } catch (error) {
      console.error('[MIGRATION] Error checking table existence:', error);
      return false;
    }
  }

  async getCurrentColumns() {
    try {
      const result = await this.pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'persistent_memories'
        ORDER BY ordinal_position;
      `);
      return result.rows.map(row => row.column_name);
    } catch (error) {
      console.error('[MIGRATION] Error getting columns:', error);
      return [];
    }
  }

  async addColumn(columnDefinition) {
    try {
      await this.pool.query(`ALTER TABLE persistent_memories ADD COLUMN IF NOT EXISTS ${columnDefinition};`);
    } catch (error) {
      console.error(`[MIGRATION] Error adding column ${columnDefinition}:`, error);
      throw error;
    }
  }

  async addIndexesSafely() {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_memories_user_category ON persistent_memories(user_id, category);',
      'CREATE INDEX IF NOT EXISTS idx_memories_relevance ON persistent_memories(relevance_score DESC);',
      'CREATE INDEX IF NOT EXISTS idx_memories_created_at ON persistent_memories(created_at DESC);',
      'CREATE INDEX IF NOT EXISTS idx_memories_usage ON persistent_memories(usage_frequency DESC);',
      'CREATE INDEX IF NOT EXISTS idx_memories_archived ON persistent_memories(archived);'
    ];

    for (const indexSQL of indexes) {
      try {
        await this.pool.query(indexSQL);
        console.log('[MIGRATION] ✅ Index created successfully');
      } catch (error) {
        console.warn('[MIGRATION] ⚠️ Index creation failed (non-critical):', error.message);
      }
    }
  }

  async verifyMigration() {
    try {
      // Test insert with new columns
      const testMemory = {
        user_id: 'test_migration',
        content: 'Migration test',
        category: 'test',
        relevance_score: 0.75,
        token_count: 10,
        emotional_weight: 0.5,
        is_question: false,
        user_priority: false,
        usage_frequency: 0,
        metadata: JSON.stringify({ test: true })
      };

      const result = await this.pool.query(`
        INSERT INTO persistent_memories 
        (user_id, content, category, relevance_score, token_count, 
         emotional_weight, is_question, user_priority, usage_frequency, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `, [
        testMemory.user_id,
        testMemory.content,
        testMemory.category,
        testMemory.relevance_score,
        testMemory.token_count,
        testMemory.emotional_weight,
        testMemory.is_question,
        testMemory.user_priority,
        testMemory.usage_frequency,
        testMemory.metadata
      ]);

      // Clean up test record
      await this.pool.query('DELETE FROM persistent_memories WHERE user_id = $1', ['test_migration']);

      console.log('[MIGRATION] ✅ Verification successful - new columns working');
      return true;

    } catch (error) {
      console.error('[MIGRATION] ❌ Verification failed:', error);
      return false;
    }
  }

  async close() {
    await this.pool.end();
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const migration = new DatabaseMigration();
  migration.runMigration()
    .then(success => {
      if (success) {
        console.log('✅ Migration completed successfully');
        return migration.verifyMigration();
      } else {
        console.log('❌ Migration failed');
        process.exit(1);
      }
    })
    .then(verified => {
      if (verified) {
        console.log('✅ Migration verified successfully');
      } else {
        console.log('⚠️ Migration completed but verification failed');
      }
      migration.close();
    })
    .catch(error => {
      console.error('❌ Migration error:', error);
      migration.close();
      process.exit(1);
    });
}

export default DatabaseMigration;
