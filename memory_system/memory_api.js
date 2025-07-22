// ================================================================
// FILE: memory_system/memory_api.js - Clean Interface to Main System  
// ES6 MODULE VERSION - Works with "type": "module" projects
// ================================================================

// Simple logger for memory system
const memoryLogger = {
    log: (message) => console.log(`[MEMORY] ${new Date().toISOString()} ${message}`),
    error: (message, error) => console.error(`[MEMORY ERROR] ${new Date().toISOString()} ${message}`, error),
    warn: (message) => console.warn(`[MEMORY WARN] ${new Date().toISOString()} ${message}`)
};

// Simplified Memory System for ES6 compatibility
class MemoryAPI {
    constructor() {
        this.initialized = false;
        this.mockMode = true; // Start in mock mode for safety
        this.initialize();
    }

    async initialize() {
        try {
            // Check if we have DATABASE_URL
            if (!process.env.DATABASE_URL) {
                memoryLogger.warn('⚠️  DATABASE_URL not found - running in mock mode');
                this.mockMode = true;
                this.initialized = true;
                memoryLogger.log('✅ Memory API initialized in mock mode');
                return;
            }

            // Try to load PostgreSQL
            try {
                const { Pool } = await import('pg');
                
                this.pool = new Pool({
                    connectionString: process.env.DATABASE_URL,
                    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
                    max: 5,
                    idleTimeoutMillis: 30000,
                    connectionTimeoutMillis: 2000,
                });

                // Test connection
                const client = await this.pool.connect();
                await client.query('SELECT NOW()');
                client.release();

                this.mockMode = false;
                memoryLogger.log('✅ Database connection established');
                
                // Create basic schema
                await this.createBasicSchema();
                
                this.initialized = true;
                memoryLogger.log('✅ Memory API initialized successfully');
                
            } catch (dbError) {
                memoryLogger.error('❌ Database setup failed:', dbError);
                this.mockMode = true;
                this.initialized = true;
                memoryLogger.log('✅ Memory API initialized in mock mode (DB failed)');
            }
        } catch (error) {
            memoryLogger.error('❌ Memory API initialization failed:', error);
            this.mockMode = true;
            this.initialized = true;
            memoryLogger.log('✅ Memory API initialized in mock mode (fallback)');
        }
    }

    async createBasicSchema() {
        if (this.mockMode) return;
        
        const client = await this.pool.connect();
        try {
            // Create basic memory table
            await client.query(`
                CREATE TABLE IF NOT EXISTS simple_memories (
                    id SERIAL PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            memoryLogger.log('✅ Database schema created');
        } finally {
            client.release();
        }
    }

    async getRelevantContext(userId, query, maxTokens = 2400) {
        try {
            if (!this.initialized) {
                return { contextFound: false, memories: '', error: 'Memory system not initialized' };
            }

            if (this.mockMode) {
                memoryLogger.log(`📋 Mock memory retrieval for user ${userId}`);
                return { 
                    contextFound: false, 
                    memories: '',
                    note: 'Running in mock mode - no persistent memory yet'
                };
            }

            // Route query to category
            const category = this.routeToCategory(query);
            
            // Get memories from database
            const client = await this.pool.connect();
            const result = await client.query(`
                SELECT content, created_at 
                FROM simple_memories 
                WHERE user_id = $1 AND category = $2
                ORDER BY created_at DESC 
                LIMIT 10
            `, [userId, category]);
            client.release();

            if (result.rows.length === 0) {
                return { contextFound: false, memories: '' };
            }

            const memories = result.rows
                .map(row => `[${this.formatTimeAgo(row.created_at)}] ${row.content}`)
                .join('\n\n');

            memoryLogger.log(`📋 Retrieved ${result.rows.length} memories for ${userId}`);
            
            return {
                contextFound: true,
                memories: memories,
                totalMemories: result.rows.length
            };

        } catch (error) {
            memoryLogger.error(`Error retrieving context for ${userId}:`, error);
            return { contextFound: false, memories: '', error: error.message };
        }
    }

    async storeMemory(userId, content, metadata = {}) {
        try {
            if (!this.initialized) {
                return { success: false, error: 'Memory system not initialized' };
            }

            if (!content || content.trim().length === 0) {
                return { success: false, error: 'Empty content cannot be stored' };
            }

            if (this.mockMode) {
                memoryLogger.log(`💾 Mock memory storage for user ${userId}: ${content.substring(0, 50)}...`);
                return { 
                    success: true, 
                    memoryId: 'mock-' + Date.now(),
                    note: 'Stored in mock mode - not persistent'
                };
            }

            // Route to category
            const category = this.routeToCategory(content);
            
            // Store in database
            const client = await this.pool.connect();
            const result = await client.query(`
                INSERT INTO simple_memories (user_id, category, content)
                VALUES ($1, $2, $3)
                RETURNING id
            `, [userId, category, content]);
            client.release();

            memoryLogger.log(`💾 Stored memory ${result.rows[0].id} in ${category} for ${userId}`);
            
            return {
                success: true,
                memoryId: result.rows[0].id,
                category: category
            };

        } catch (error) {
            memoryLogger.error(`Error storing memory for ${userId}:`, error);
            return { success: false, error: error.message };
        }
    }

    routeToCategory(text) {
        const content = text.toLowerCase();
        
        // Simple routing logic
        if (content.includes('health') || content.includes('doctor') || content.includes('medical')) {
            return 'health_wellness';
        }
        if (content.includes('work') || content.includes('job') || content.includes('business') || content.includes('career')) {
            return 'business_career';
        }
        if (content.includes('money') || content.includes('budget') || content.includes('financial')) {
            return 'financial_management';
        }
        if (content.includes('family') || content.includes('relationship') || content.includes('friend')) {
            return 'relationships_social';
        }
        if (content.includes('software') || content.includes('app') || content.includes('computer')) {
            return 'technology_tools';
        }
        
        return 'personal_development'; // Default category
    }

    formatTimeAgo(timestamp) {
        const days = Math.floor((Date.now() - new Date(timestamp)) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'today';
        if (days === 1) return 'yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days/7)} weeks ago`;
        return `${Math.floor(days/30)} months ago`;
    }

    async getSystemHealth() {
        return {
            overall: this.initialized,
            initialized: this.initialized,
            mockMode: this.mockMode,
            timestamp: new Date().toISOString()
        };
    }

    async initializeUser(userId) {
        if (!this.initialized) {
            return { success: false, error: 'Memory system not initialized' };
        }

        memoryLogger.log(`👤 User ${userId} memory system ready`);
        return { success: true, message: 'User memory system ready' };
    }
}

// Export singleton instance
const memorySystemInstance = new MemoryAPI();
export default memorySystemInstance;
