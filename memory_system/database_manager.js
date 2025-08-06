// memory_system/database_manager.js
// Production-grade PostgreSQL database manager for Site Monkeys AI Memory System

import { Pool } from 'pg';

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.isInitialized = false;
    this.initializePool();
  }

  initializePool() {
    const config = {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    this.pool = new Pool(config);

    this.pool.on('error', (err) => {
      console.error('Database pool error:', err);
    });

    this.pool.on('connect', () => {
      console.log('Database connection established');
    });
  }

  async initialize() {
    if (this.isInitialized) return true;

    try {
      await this.createTables();
      this.isInitialized = true;
      console.log('Database initialized successfully');
      return true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      return false;
    }
  }

  async createTables() {
    const createMemoriesTable = `
      CREATE TABLE IF NOT EXISTS persistent_memories (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        subcategory VARCHAR(100),
        relevance_score DECIMAL(3,2) DEFAULT 0.50,
        token_count INTEGER NOT NULL DEFAULT 0,
        emotional_weight DECIMAL(3,2) DEFAULT 0.00,
        is_question BOOLEAN DEFAULT false,
        user_priority BOOLEAN DEFAULT false,
        usage_frequency INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        archived BOOLEAN DEFAULT false
      );
    `;

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_memories_user_category ON persistent_memories(user_id, category);
      CREATE INDEX IF NOT EXISTS idx_memories_relevance ON persistent_memories(relevance_score DESC);
      CREATE INDEX IF NOT EXISTS idx_memories_created_at ON persistent_memories(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_memories_usage ON persistent_memories(usage_frequency DESC);
      CREATE INDEX IF NOT EXISTS idx_memories_archived ON persistent_memories(archived);
      CREATE INDEX IF NOT EXISTS idx_memories_compound ON persistent_memories(user_id, category, archived, relevance_score DESC);
    `;

    const createCategoryStatsTable = `
      CREATE TABLE IF NOT EXISTS category_stats (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        total_memories INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        avg_relevance DECIMAL(3,2) DEFAULT 0.00,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, category)
      );
    `;

    await this.pool.query(createMemoriesTable);
    await this.pool.query(createIndexes);
    await this.pool.query(createCategoryStatsTable);
  }

  async storeMemory(memory) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO persistent_memories 
        (user_id, content, category, subcategory, relevance_score, token_count, 
         emotional_weight, is_question, user_priority, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, created_at
      `;

      const values = [
        memory.userId,
        memory.content,
        memory.category,
        memory.subcategory || null,
        memory.relevanceScore || 0.50,
        memory.tokenCount || 0,
        memory.emotionalWeight || 0.00,
        memory.isQuestion || false,
        memory.userPriority || false,
        JSON.stringify(memory.metadata || {})
      ];

      const result = await client.query(insertQuery, values);
      
      // Update category stats
      await this.updateCategoryStats(client, memory.userId, memory.category);
      
      await client.query('COMMIT');
      
      return {
        id: result.rows[0].id,
        createdAt: result.rows[0].created_at,
        success: true
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error storing memory:', error);
      return { success: false, error: error.message };
    } finally {
      client.release();
    }
  }

  async getRelevantMemories(userId, category, queryText = '', limit = 10, tokenBudget = 2400) {
    try {
      const searchQuery = `
        SELECT id, content, category, subcategory, relevance_score, 
               token_count, emotional_weight, is_question, usage_frequency,
               created_at, last_accessed_at, metadata,
               CASE 
                 WHEN $3 != '' THEN 
                   (CASE 
                     WHEN LOWER(content) LIKE LOWER('%' || $3 || '%') THEN relevance_score + 0.3
                     ELSE relevance_score
                   END)
                 ELSE relevance_score 
               END as computed_relevance
        FROM persistent_memories 
        WHERE user_id = $1 AND category = $2 AND archived = false
        ORDER BY computed_relevance DESC, usage_frequency DESC, created_at DESC
        LIMIT $4
      `;

      const result = await this.pool.query(searchQuery, [userId, category, queryText, limit * 2]);
      
      // Filter by token budget
      const memories = [];
      let totalTokens = 0;
      
      for (const row of result.rows) {
        if (totalTokens + row.token_count <= tokenBudget) {
          memories.push({
            id: row.id,
            content: row.content,
            category: row.category,
            subcategory: row.subcategory,
            relevanceScore: row.computed_relevance,
            tokenCount: row.token_count,
            emotionalWeight: row.emotional_weight,
            isQuestion: row.is_question,
            usageFrequency: row.usage_frequency,
            createdAt: row.created_at,
            lastAccessedAt: row.last_accessed_at,
            metadata: row.metadata
          });
          totalTokens += row.token_count;
        }
        
        if (memories.length >= limit) break;
      }

      // Update access tracking
      if (memories.length > 0) {
        const memoryIds = memories.map(m => m.id);
        await this.updateMemoryAccess(memoryIds);
      }

      return memories;
    } catch (error) {
      console.error('Error retrieving memories:', error);
      return [];
    }
  }

  async updateMemoryAccess(memoryIds) {
    if (!memoryIds || memoryIds.length === 0) return;

    try {
      const updateQuery = `
        UPDATE persistent_memories 
        SET usage_frequency = usage_frequency + 1,
            last_accessed_at = CURRENT_TIMESTAMP
        WHERE id = ANY($1)
      `;
      await this.pool.query(updateQuery, [memoryIds]);
    } catch (error) {
      console.error('Error updating memory access:', error);
    }
  }

  async getCategoryTokenCount(userId, category) {
    try {
      const result = await this.pool.query(
        'SELECT COALESCE(SUM(token_count), 0) as total FROM persistent_memories WHERE user_id = $1 AND category = $2 AND archived = false',
        [userId, category]
      );
      return parseInt(result.rows[0].total);
    } catch (error) {
      console.error('Error getting category token count:', error);
      return 0;
    }
  }

  async cleanupCategory(userId, category, maxTokens = 50000) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Get current token count
      const tokenCount = await this.getCategoryTokenCount(userId, category);
      
      if (tokenCount <= maxTokens) {
        await client.query('COMMIT');
        return { cleaned: 0, tokensFreed: 0 };
      }

      // Archive lowest relevance, oldest memories
      const cleanupQuery = `
        UPDATE persistent_memories 
        SET archived = true
        WHERE id IN (
          SELECT id FROM persistent_memories 
          WHERE user_id = $1 AND category = $2 AND archived = false
          ORDER BY relevance_score ASC, usage_frequency ASC, created_at ASC
          LIMIT (
            SELECT COUNT(*) FROM persistent_memories 
            WHERE user_id = $1 AND category = $2 AND archived = false
          ) / 4
        )
        RETURNING token_count
      `;

      const result = await client.query(cleanupQuery, [userId, category]);
      const tokensFreed = result.rows.reduce((sum, row) => sum + row.token_count, 0);
      
      await this.updateCategoryStats(client, userId, category);
      await client.query('COMMIT');

      console.log(`Cleaned up category ${category} for user ${userId}: archived ${result.rowCount} memories, freed ${tokensFreed} tokens`);
      
      return {
        cleaned: result.rowCount,
        tokensFreed: tokensFreed
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error cleaning up category:', error);
      return { cleaned: 0, tokensFreed: 0 };
    } finally {
      client.release();
    }
  }

  async updateCategoryStats(client, userId, category) {
    const statsQuery = `
      INSERT INTO category_stats (user_id, category, total_memories, total_tokens, avg_relevance, last_updated)
      SELECT 
        $1 as user_id,
        $2 as category,
        COUNT(*) as total_memories,
        COALESCE(SUM(token_count), 0) as total_tokens,
        COALESCE(AVG(relevance_score), 0.00) as avg_relevance,
        CURRENT_TIMESTAMP as last_updated
      FROM persistent_memories 
      WHERE user_id = $1 AND category = $2 AND archived = false
      ON CONFLICT (user_id, category) 
      DO UPDATE SET 
        total_memories = EXCLUDED.total_memories,
        total_tokens = EXCLUDED.total_tokens,
        avg_relevance = EXCLUDED.avg_relevance,
        last_updated = EXCLUDED.last_updated
    `;

    await client.query(statsQuery, [userId, category]);
  }

  async getCategoryStats(userId, category = null) {
    try {
      let query = 'SELECT * FROM category_stats WHERE user_id = $1';
      let params = [userId];
      
      if (category) {
        query += ' AND category = $2';
        params.push(category);
      }
      
      query += ' ORDER BY total_tokens DESC';
      
      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting category stats:', error);
      return [];
    }
  }

  async getUserMemoryCount(userId) {
    try {
      const result = await this.pool.query(
        'SELECT COUNT(*) as count FROM persistent_memories WHERE user_id = $1 AND archived = false',
        [userId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting user memory count:', error);
      return 0;
    }
  }

  async deleteMemory(userId, memoryId) {
    try {
      const result = await this.pool.query(
        'UPDATE persistent_memories SET archived = true WHERE user_id = $1 AND id = $2 RETURNING category',
        [userId, memoryId]
      );
      
      if (result.rows.length > 0) {
        const category = result.rows[0].category;
        const client = await this.pool.connect();
        try {
          await this.updateCategoryStats(client, userId, category);
        } finally {
          client.release();
        }
      }
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting memory:', error);
      return false;
    }
  }

  async getMemoriesByCategory(userId, category, limit = 50) {
    try {
      const result = await this.pool.query(`
        SELECT id, content, subcategory, relevance_score, token_count, 
               created_at, usage_frequency, metadata
        FROM persistent_memories 
        WHERE user_id = $1 AND category = $2 AND archived = false
        ORDER BY created_at DESC
        LIMIT $3
      `, [userId, category, limit]);
      
      return result.rows.map(row => ({
        id: row.id,
        content: row.content,
        subcategory: row.subcategory,
        relevanceScore: row.relevance_score,
        tokenCount: row.token_count,
        createdAt: row.created_at,
        usageFrequency: row.usage_frequency,
        metadata: row.metadata
      }));
    } catch (error) {
      console.error('Error getting memories by category:', error);
      return [];
    }
  }

  async searchMemories(userId, searchTerm, limit = 20) {
    try {
      const result = await this.pool.query(`
        SELECT id, content, category, subcategory, relevance_score, token_count,
               created_at, usage_frequency
        FROM persistent_memories 
        WHERE user_id = $1 AND archived = false 
          AND LOWER(content) LIKE LOWER('%' || $2 || '%')
        ORDER BY relevance_score DESC, created_at DESC
        LIMIT $3
      `, [userId, searchTerm, limit]);
      
      return result.rows.map(row => ({
        id: row.id,
        content: row.content,
        category: row.category,
        subcategory: row.subcategory,
        relevanceScore: row.relevance_score,
        tokenCount: row.token_count,
        createdAt: row.created_at,
        usageFrequency: row.usage_frequency
      }));
    } catch (error) {
      console.error('Error searching memories:', error);
      return [];
    }
  }

  async healthCheck() {
    try {
      await this.pool.query('SELECT 1');
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        pool: {
          total: this.pool.totalCount,
          idle: this.pool.idleCount,
          waiting: this.pool.waitingCount
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('Database connection pool closed');
    }
  }
}

export default new DatabaseManager();
