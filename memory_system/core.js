// ================================================================
// core.js - Database & Infrastructure Management Hub
// Consolidates database logic from 4+ sources into unified system
// ================================================================

import { Pool } from 'pg';

class CoreSystem {
  constructor() {
    this.pool = null;
    this.isInitialized = false;
    this.fallbackMemory = new Map();
    this.healthStatus = {
      overall: false,
      database: { healthy: false },
      initialized: false,
      lastCheck: null
    };
    
    // Valid category names (underscore format)
    this.validCategories = [
      'mental_emotional',
      'health_wellness', 
      'relationships_social',
      'work_career',
      'money_income_debt',
      'money_spending_goals',
      'goals_active_current',
      'goals_future_dreams',
      'tools_tech_workflow',
      'daily_routines_habits',
      'personal_life_interests'
    ];

    this.categoryLimits = {
      tokenLimit: 50000,
      memoryLimit: 1000
    };

    this.logger = {
      log: (message) => console.log(`[CORE] ${new Date().toISOString()} ${message}`),
      error: (message, error) => console.error(`[CORE ERROR] ${new Date().toISOString()} ${message}`, error),
      warn: (message) => console.warn(`[CORE WARN] ${new Date().toISOString()} ${message}`)
    };
  }

  async initialize() {
    this.logger.log('Initializing Core System...');
    
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable not found');
      }

      // Connection Pool Management with specified configuration
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 30,                      // Increased from 20
        idleTimeoutMillis: 60000,     // Doubled to 60s
        connectionTimeoutMillis: 5000, // Increased from 2s
        allowExitOnIdle: true          // Clean up idle connections
      });
      
      // --- Keep pool healthy between requests ---
      this.pool.on('remove', () => {
        this.logger.warn('[DB] Client removed from pool — reconnecting soon');
      });
      
      this.pool.on('error', (err) => {
        this.logger.error('[DB] Pool error:', err);
      });
      
      // Lightweight keep-alive every 30 s to prevent idle shutdown
      setInterval(async () => {
        try {
          await this.pool.query('SELECT 1');
        } catch (e) {
          this.logger.error('[DB] Keep-alive failed:', e);
        }
      }, 30000);

      // Pool event handling with detailed logging
      this.pool.on('connect', (client) => {
        this.logger.log('Database client connected');
      });

      this.pool.on('error', (err, client) => {
        this.logger.error('Database pool error:', err);
      });

      this.pool.on('remove', (client) => {
        this.logger.log('Database client removed from pool');
      });

      // Test connection - Level 1 Health Check
      await this.executeQuery('SELECT NOW() as current_time');
      this.logger.log('Database connection established');

      // Schema Management & Migration
      await this.createDatabaseSchema();
      
      // Initialize health monitoring
      await this.updateHealthStatus();
      
      this.isInitialized = true;
      this.logger.log('Core System initialized successfully');
      return true;

    } catch (error) {
      this.logger.error('Core System initialization failed:', error);
      this.isInitialized = false;
      return false;
    }
  }

  // ================================================================
  // DATABASE OPERATIONS INTERFACE
  // ================================================================

  async executeQuery(query, params = []) {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(query, params);
      return result;
    } finally {
      client.release();
    }
  }

  // FIXED: Safe database client method that auto-releases
  async withDbClient(callback) {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    
    const client = await this.pool.connect();
    try {
      return await callback(client);
    } finally {
      client.release();
    }
  }

  // ================================================================
  // MEMORY CRUD OPERATIONS
  // ================================================================

  async storeMemory(memoryObject) {
    let { userId, content, category_name, subcategory_name, metadata = {} } = memoryObject;
    
    // Use provided categorization or fallback to default
    if (!category_name || !subcategory_name) {
      this.logger.log('No categorization provided, using fallback');
      category_name = category_name || 'personal_life_interests';
      subcategory_name = subcategory_name || 'General';
    }
    try {
      // Calculate token count
      const tokenCount = Math.ceil(content.length / 4);
      
      // Basic category token check (50K per category limit)
      const tokenCheckQuery = `
        SELECT COALESCE(SUM(token_count), 0) as total_tokens 
        FROM persistent_memories 
        WHERE user_id = $1 AND category_name = $2
      `;
      
      const tokenResult = await this.executeQuery(tokenCheckQuery, [userId, category_name]);
      const currentTokens = parseInt(tokenResult.rows[0].total_tokens);
      
      if (currentTokens + tokenCount > this.categoryLimits.tokenLimit) {
        return {
          success: false,
          error: 'Category token limit exceeded',
          currentTokens: currentTokens,
          requiredTokens: tokenCount,
          maxTokens: this.categoryLimits.tokenLimit
        };
      }
      
      // Store memory with intelligent categorization
      const insertQuery = `
        INSERT INTO persistent_memories 
        (user_id, category_name, subcategory_name, content, token_count, relevance_score, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
        RETURNING id
      `;
      
      const result = await this.executeQuery(insertQuery, [
        userId, 
        category_name,
        subcategory_name,
        content, 
        tokenCount, 
        memoryObject.relevance_score || 0.5, 
        JSON.stringify(metadata)
      ]);
      
      this.logger.log(`Memory stored with intelligent categorization: ID ${result.rows[0].id}, Category: ${category_name}/${subcategory_name}, ${tokenCount} tokens`);
      
      return {
        success: true,
        memoryId: result.rows[0].id,
        tokenCount: tokenCount,
        category: category_name,
        subcategory: subcategory_name
      };
  
    } catch (error) {
      this.logger.error('Storage failed, using fallback:', error);
      // Fallback to in-memory storage
      return await this.fallbackStoreMemory(userId, content, category_name, subcategory_name);
    }
  }

  async getMemoriesByCategory(userId, categoryName, limit = 20) {
    try {
      const query = `
        SELECT id, user_id, category_name, subcategory_name, content, token_count, 
               relevance_score, usage_frequency, created_at, last_accessed, metadata
        FROM persistent_memories 
        WHERE user_id = $1 AND category_name = $2
        AND NOT (
          content::text ~* '\\b(remember anything|do you remember|what did i tell|can you recall)\\b' 
          AND NOT content::text ~* '\\b(i have|i own|my \\w+\\s+(is|are|was)|name is|work at|live in)\\b'
        )
        ORDER BY relevance_score DESC, created_at DESC
        LIMIT $3
      `;

      const result = await this.executeQuery(query, [userId, categoryName, limit]);
      return result.rows;

    } catch (error) {
      this.logger.error('Error getting memories by category:', error);
      return this.fallbackGetMemories(userId, categoryName);
    }
  }

  async updateMemoryAccess(memoryId) {
    try {
      const query = `
        UPDATE persistent_memories 
        SET usage_frequency = usage_frequency + 1,
            last_accessed = NOW()
        WHERE id = $1
      `;
      
      await this.executeQuery(query, [memoryId]);
      
    } catch (error) {
      this.logger.warn(`Failed to update memory access for ID ${memoryId}:`, error.message);
    }
  }

  async deleteMemory(userId, memoryId) {
    try {
      const query = `
        DELETE FROM persistent_memories 
        WHERE id = $1 AND user_id = $2
        RETURNING id
      `;
      
      const result = await this.executeQuery(query, [memoryId, userId]);
      
      return {
        success: true,
        deleted: result.rows.length > 0
      };

    } catch (error) {
      this.logger.error('Error deleting memory:', error);
      return { success: false, error: error.message };
    }
  }

  // ================================================================
  // USER MANAGEMENT OPERATIONS
  // ================================================================

  async provisionUserMemory(userId) {
    try {
      // Check if user already exists
      const existsQuery = `
        SELECT user_id FROM user_memory_profiles WHERE user_id = $1
      `;
      
      const existsResult = await this.executeQuery(existsQuery, [userId]);
      
      if (existsResult.rows.length === 0) {
        // Create user profile
        const createQuery = `
          INSERT INTO user_memory_profiles 
          (user_id, total_memories, total_tokens, active_categories, memory_patterns, created_at)
          VALUES ($1, 0, 0, $2, $3, NOW())
        `;
        
        await this.executeQuery(createQuery, [
          userId,
          JSON.stringify([]),
          JSON.stringify({})
        ]);
        
        this.logger.log(`User memory provisioned: ${userId}`);
      }
      
      return { success: true, message: 'User memory system ready' };

    } catch (error) {
      this.logger.error('Error provisioning user memory:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserStats(userId) {
    try {
      const statsQuery = `
        SELECT 
          category_name,
          COUNT(*) as memory_count,
          SUM(token_count) as total_tokens,
          AVG(relevance_score) as avg_relevance,
          MAX(last_accessed) as last_accessed
        FROM persistent_memories 
        WHERE user_id = $1
        GROUP BY category_name
        ORDER BY memory_count DESC
      `;
      
      const result = await this.executeQuery(statsQuery, [userId]);
      
      const totalMemories = result.rows.reduce((sum, row) => sum + parseInt(row.memory_count), 0);
      const totalTokens = result.rows.reduce((sum, row) => sum + parseInt(row.total_tokens || 0), 0);
      
      return {
        userId: userId,
        totalMemories: totalMemories,
        totalTokens: totalTokens,
        categoriesUsed: result.rows.length,
        categoryBreakdown: result.rows
      };

    } catch (error) {
      this.logger.error('Error getting user stats:', error);
      // Return fallback stats
      const userMemories = this.fallbackMemory.get(userId) || [];
      return {
        userId: userId,
        totalMemories: userMemories.length,
        totalTokens: userMemories.reduce((sum, mem) => sum + Math.ceil(mem.content.length / 4), 0),
        categoriesUsed: 0,
        categoryBreakdown: [],
        mode: 'fallback'
      };
    }
  }

  async optimizeUserMemories(userId) {
    try {
      // Find underused memories (low relevance, old, rarely accessed)
      const cleanupQuery = `
        DELETE FROM persistent_memories 
        WHERE user_id = $1 
        AND relevance_score < 0.3 
        AND last_accessed < NOW() - INTERVAL '90 days'
        AND usage_frequency < 2
        RETURNING id
      `;
      
      const result = await this.executeQuery(cleanupQuery, [userId]);
      
      this.logger.log(`Optimized memories for user ${userId}: removed ${result.rows.length} memories`);
      
      return {
        success: true,
        memoriesRemoved: result.rows.length
      };

    } catch (error) {
      this.logger.error('Error optimizing user memories:', error);
      return { success: false, error: error.message };
    }
  }

  // ================================================================
  // COMPREHENSIVE HEALTH MONITORING & DIAGNOSTICS
  // ================================================================

  async getSystemHealth() {
    try {
      const healthChecks = await this.performMultiLevelHealthChecks();
      
      const overall = healthChecks.level1 && healthChecks.level2 && healthChecks.level3;
      
      this.healthStatus = {
        overall: overall,
        status: overall ? 'healthy' : 'degraded',
        initialized: this.isInitialized,
        database: {
          healthy: healthChecks.level1,
          schemaValid: healthChecks.level2,
          performanceGood: healthChecks.level3
        },
        timestamp: new Date().toISOString(),
        details: healthChecks
      };

      return this.healthStatus;

    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        overall: false,
        status: 'unhealthy',
        initialized: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async performMultiLevelHealthChecks() {
    const checks = {
      level1: false,
      level2: false,
      level3: false,
      level4: false
    };

    try {
      // Level 1: Basic connection test
      const timeCheck = await this.executeQuery('SELECT NOW() as current_time');
      checks.level1 = timeCheck.rows.length > 0;
      
      // Level 2: Table existence and schema validation
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('persistent_memories', 'memory_categories', 'user_memory_profiles')
      `;
      
      const tablesResult = await this.executeQuery(tablesQuery);
      checks.level2 = tablesResult.rows.length >= 3;
      
      // Level 3: Query performance testing
      const startTime = Date.now();
      await this.executeQuery('SELECT COUNT(*) FROM persistent_memories LIMIT 1');
      const queryTime = Date.now() - startTime;
      checks.level3 = queryTime < 1000; // Under 1 second
      
      // Level 4: Data integrity checks
      const integrityQuery = `
        SELECT COUNT(*) as invalid_count 
        FROM persistent_memories 
        WHERE user_id IS NULL OR content IS NULL OR token_count < 0
      `;
      
      const integrityResult = await this.executeQuery(integrityQuery);
      checks.level4 = parseInt(integrityResult.rows[0].invalid_count) === 0;

    } catch (error) {
      this.logger.error('Multi-level health check error:', error);
    }

    return checks;
  }

  async updateHealthStatus() {
    this.healthStatus.lastCheck = new Date().toISOString();
    const health = await this.getSystemHealth();
    return health.overall;
  }

  // ================================================================
  // SCHEMA MANAGEMENT & MIGRATION - FIXED TEXT FIELDS
  // ================================================================

  async createDatabaseSchema() {
    try {
      this.logger.log('Creating database schema...');
      
      // Create main categories table
      await this.executeQuery(`
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, category_name, subcategory_name)
        )
      `);

      // Create memories table
      await this.executeQuery(`
        CREATE TABLE IF NOT EXISTS persistent_memories (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          category_name VARCHAR(100) NOT NULL,
          subcategory_name VARCHAR(100),
          content TEXT NOT NULL,
          token_count INTEGER NOT NULL,
          relevance_score DECIMAL(3,2) DEFAULT 0.50,
          usage_frequency INTEGER DEFAULT 0,
          last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          metadata JSONB
        )
      `);

      // Create user memory profiles
      await this.executeQuery(`
        CREATE TABLE IF NOT EXISTS user_memory_profiles (
          user_id TEXT PRIMARY KEY,
          total_memories INTEGER DEFAULT 0,
          total_tokens INTEGER DEFAULT 0,
          active_categories TEXT[],
          memory_patterns JSONB,
          last_optimization TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create performance indexes
      await this.executeQuery(`
        CREATE INDEX IF NOT EXISTS idx_memory_relevance 
        ON persistent_memories(user_id, category_name, relevance_score DESC, created_at DESC)
      `);
      
      await this.executeQuery(`
        CREATE INDEX IF NOT EXISTS idx_memory_category 
        ON persistent_memories(user_id, category_name, subcategory_name)
      `);
      
      this.logger.log('Database schema and indexes created successfully');

    } catch (error) {
      this.logger.error('Error creating database schema:', error);
      throw error;
    }
  }

  // ================================================================
  // ROBUST FALLBACK SYSTEM
  // ================================================================

  async fallbackStoreMemory(userId, content, category, subcategory) {
    try {
      if (!this.fallbackMemory.has(userId)) {
        this.fallbackMemory.set(userId, []);
      }

      const userMemories = this.fallbackMemory.get(userId);
      const memoryId = Date.now() + Math.random();
      
      const newMemory = {
        id: memoryId,
        content: content,
        category_name: category,
        subcategory_name: subcategory,
        timestamp: Date.now(),
        token_count: Math.ceil(content.length / 4)
      };
        
      userMemories.push(newMemory);

      // 50-memory limit per user with oldest-first eviction
      if (userMemories.length > 50) {
        userMemories.splice(0, userMemories.length - 50);
      }

      this.fallbackMemory.set(userId, userMemories);
        
      this.logger.warn(`Stored in fallback memory - ID: ${memoryId}, Total memories: ${userMemories.length}`);
      
      return { 
        success: true, 
        memoryId: memoryId,
        tokenCount: newMemory.token_count,
        mode: 'fallback' 
      };

    } catch (error) {
      this.logger.error('Fallback storage error:', error);
      return { success: false, error: error.message };
    }
  }

  async fallbackGetMemories(userId, categoryName) {
    try {
      const userMemories = this.fallbackMemory.get(userId) || [];
      
      const categoryMemories = userMemories.filter(mem => 
        mem.category_name === categoryName
      );
      
      return categoryMemories.slice(0, 10); // Limit fallback results

    } catch (error) {
      this.logger.error('Fallback retrieval error:', error);
      return [];
    }
  }

  getFallbackStatus() {
    return {
      active: true,
      userCount: this.fallbackMemory.size,
      totalMemories: Array.from(this.fallbackMemory.values()).reduce((sum, memories) => sum + memories.length, 0)
    };
  }

  // ================================================================
  // SYSTEM MAINTENANCE OPERATIONS
  // ================================================================

  async performMaintenance() {
    try {
      this.logger.log('Starting scheduled maintenance...');
      
      // Update health status
      await this.updateHealthStatus();
      
      // Clean up old memories (older than 1 year, low relevance)
      const cleanupQuery = `
        DELETE FROM persistent_memories 
        WHERE created_at < NOW() - INTERVAL '1 year' 
        AND relevance_score < 0.2 
        AND usage_frequency = 0
      `;
      
      const cleanupResult = await this.executeQuery(cleanupQuery);
      this.logger.log(`Maintenance cleanup: removed ${cleanupResult.rowCount} old memories`);
      
      // Update statistics
      await this.executeQuery('ANALYZE persistent_memories');
      
      this.logger.log('Scheduled maintenance completed');
      
      return { success: true, memoriesRemoved: cleanupResult.rowCount };

    } catch (error) {
      this.logger.error('Maintenance failed:', error);
      return { success: false, error: error.message };
    }
  }

  // ================================================================
  // COMPATIBILITY METHOD FOR SERVER.JS
  // ================================================================

  async storeMemoryForChat(userId, conversationData) {
    try {
      const memoryObject = {
        userId: userId,
        content: conversationData,
        // Let the system auto-categorize this conversation
        relevance_score: 0.6,
        metadata: { source: 'chat_conversation', timestamp: new Date().toISOString() }
      };
      
      return await this.storeMemory(memoryObject);
      
    } catch (error) {
      this.logger.error('Error storing chat memory:', error);
      return { success: false, error: error.message };
    }
  }

  // ================================================================
  // CATEGORY MANAGEMENT SYSTEM
  // ================================================================

  async getCategoryStats(userId) {
    try {
      const query = `
        SELECT 
          category_name,
          subcategory_name,
          COUNT(*) as total_memories,
          SUM(token_count) as total_tokens,
          AVG(relevance_score) as avg_relevance,
          MAX(last_accessed) as last_accessed,
          MAX(created_at) as last_updated
        FROM persistent_memories 
        WHERE user_id = $1
        GROUP BY category_name, subcategory_name
        ORDER BY total_memories DESC
      `;
      
      const result = await this.executeQuery(query, [userId]);
      return result.rows;

    } catch (error) {
      this.logger.error('Error getting category stats:', error);
      return [];
    }
  }

  async getRelatedCategories(primaryCategory) {
    // Category relationship mapping
    const categoryRelations = {
      'mental_emotional': ['health_wellness', 'relationships_social', 'personal_life_interests'],
      'health_wellness': ['mental_emotional', 'daily_routines_habits', 'personal_life_interests'],
      'relationships_social': ['mental_emotional', 'personal_life_interests', 'goals_active_current'],
      'work_career': ['money_income_debt', 'goals_active_current', 'mental_emotional'],
      'money_income_debt': ['work_career', 'money_spending_goals', 'goals_active_current'],
      'money_spending_goals': ['money_income_debt', 'goals_active_current', 'personal_life_interests'],
      'goals_active_current': ['goals_future_dreams', 'work_career', 'personal_life_interests'],
      'goals_future_dreams': ['goals_active_current', 'work_career', 'personal_life_interests'],
      'tools_tech_workflow': ['work_career', 'daily_routines_habits', 'goals_active_current'],
      'daily_routines_habits': ['health_wellness', 'personal_life_interests', 'mental_emotional'],
      'personal_life_interests': ['relationships_social', 'health_wellness', 'mental_emotional']
    };

    return categoryRelations[primaryCategory] || [];
  }

  // ================================================================
  // ERROR HANDLING & LOGGING
  // ================================================================

  async logExtractionError(error, context) {
    this.logger.error('Extraction error logged:', {
      message: error.message,
      context: context,
      timestamp: new Date().toISOString()
    });
    
    // Could store in error log table for production monitoring
  }

  // ================================================================
  // CLEANUP & SHUTDOWN
  // ================================================================

  async shutdown() {
    try {
      this.logger.log('Shutting down Core System...');
      
      if (this.pool) {
        await this.pool.end();
      }
      
      this.fallbackMemory.clear();
      this.isInitialized = false;
      
      this.logger.log('Core System shutdown completed');

    } catch (error) {
      this.logger.error('Error during Core System shutdown:', error);
    }
  }

  cleanup() {
    this.fallbackMemory.clear();
    this.logger.log('Core System cache cleared');
  }
}

// FIXED: Export instance, not class
export default new CoreSystem();
