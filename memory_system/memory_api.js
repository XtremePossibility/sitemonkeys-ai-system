import MemoryCore from './memory_core.js';
import RoutingIntelligence from './routing_intelligence.js';
import ExtractionEngine from './extraction_engine.js';
import CategoryManager from './category_manager.js';
import DatabaseManager from './database_manager.js';

// Simple logger for memory system
const memoryLogger = {
    log: (message) => console.log(`[MEMORY] ${new Date().toISOString()} ${message}`),
    error: (message, error) => console.error(`[MEMORY ERROR] ${new Date().toISOString()} ${message}`, error),
    warn: (message) => console.warn(`[MEMORY WARN] ${new Date().toISOString()} ${message}`)
};

class MemoryAPI {
    constructor() {
        this.memoryCore = new MemoryCore();
        this.router = new RoutingIntelligence();
        this.extractor = new ExtractionEngine();
        this.dbManager = new DatabaseManager();
        this.categoryManager = new CategoryManager(this.dbManager.pool);
        
        this.initialized = false;
        this.initialize();
    }

    async initialize() {
        try {
            const health = await this.dbManager.healthCheck();
            if (health.healthy) {
                this.initialized = true;
                memoryLogger.log('✅ Memory API initialized successfully');
                
                // Schedule periodic maintenance
                setInterval(() => this.performMaintenance(), 60 * 60 * 1000); // Every hour
            }
        } catch (error) {
            memoryLogger.error('❌ Memory API initialization failed:', error);
        }
    }

    async getRelevantContext(userId, query, maxTokens = 2400) {
        try {
            if (!this.initialized) {
                return { contextFound: false, memories: '', error: 'Memory system not initialized' };
            }

            // Ensure user memory space exists
            await this.memoryCore.provisionUserMemory(userId);

            // Route query to appropriate categories
            const routing = this.router.routeToCategory(query, userId);
            
            // Extract relevant memories
            const client = await this.dbManager.pool.connect();
            const extraction = await this.extractor.extractRelevantMemories(userId, query, routing, client);
            client.release();

            if (!extraction.success) {
                return { contextFound: false, memories: '', error: extraction.error };
            }

            // Format for AI consumption
            const formattedMemories = this.extractor.formatForAI(extraction.memories);
            
            // Trigger dynamic category management (async)
            this.categoryManager.manageDynamicCategories(userId).catch(error => {
                memoryLogger.error(`Background category management failed for ${userId}:`, error);
            });

            memoryLogger.log(`📋 Retrieved ${extraction.memories.length} memories (${extraction.tokenCount} tokens) for ${userId}`);
            
            return formattedMemories;

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

            // Ensure user memory space exists
            await this.memoryCore.provisionUserMemory(userId);

            // Route to appropriate category
            const routing = this.router.routeToCategory(content, userId);
            
            // Store memory
            const result = await this.dbManager.storeMemory(
                userId,
                routing.primaryCategory,
                routing.subcategory,
                content,
                {
                    ...metadata,
                    routingConfidence: routing.confidence,
                    timestamp: new Date().toISOString(),
                    allCategoryScores: routing.allScores
                }
            );

            if (result.success) {
                memoryLogger.log(`💾 Stored memory ${result.memoryId} in ${routing.primaryCategory}/${routing.subcategory} for ${userId}`);
            }

            return result;

        } catch (error) {
            memoryLogger.error(`Error storing memory for ${userId}:`, error);
            return { success: false, error: error.message };
        }
    }

    async initializeUser(userId) {
        try {
            if (!this.initialized) {
                return { success: false, error: 'Memory system not initialized' };
            }

            const result = await this.memoryCore.provisionUserMemory(userId);
            
            if (result) {
                memoryLogger.log(`👤 User ${userId} memory system initialized`);
                return { success: true, message: 'User memory system ready' };
            } else {
                return { success: false, error: 'Failed to initialize user memory' };
            }

        } catch (error) {
            memoryLogger.error(`Error initializing user ${userId}:`, error);
            return { success: false, error: error.message };
        }
    }

    async getUserMemoryStats(userId) {
        try {
            if (!this.initialized) {
                return { success: false, error: 'Memory system not initialized' };
            }

            const stats = await this.dbManager.getUserStats(userId);
            const categoryHealth = await this.categoryManager.getCategoryHealth(userId);
            
            return {
                success: true,
                stats: stats,
                categoryHealth: categoryHealth,
                systemHealth: await this.getSystemHealth()
            };

        } catch (error) {
            memoryLogger.error(`Error getting stats for ${userId}:`, error);
            return { success: false, error: error.message };
        }
    }

    async searchMemories(userId, searchTerm, categoryFilter = null) {
        try {
            if (!this.initialized) {
                return { success: false, memories: [], error: 'Memory system not initialized' };
            }

            const memories = await this.dbManager.searchMemories(userId, searchTerm, categoryFilter);
            
            return {
                success: true,
                memories: memories,
                count: memories.length
            };

        } catch (error) {
            memoryLogger.error(`Error searching memories for ${userId}:`, error);
            return { success: false, memories: [], error: error.message };
        }
    }

    async getSystemHealth() {
        try {
            const dbHealth = await this.dbManager.healthCheck();
            const coreHealth = await this.memoryCore.healthCheck();
            
            return {
                overall: dbHealth.healthy && coreHealth.healthy && this.initialized,
                database: dbHealth,
                core: coreHealth,
                initialized: this.initialized,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            return {
                overall: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async performMaintenance() {
        try {
            memoryLogger.log('🔧 Starting scheduled maintenance...');
            
            // Database health check
            const dbHealth = await this.dbManager.healthCheck();
            if (!dbHealth.healthy) {
                await this.dbManager.initializeConnection();
            }

            // TODO: Add more maintenance tasks as needed
            // - Cleanup old low-relevance memories
            // - Optimize database indexes
            // - Update relevance scores
            
            memoryLogger.log('✅ Scheduled maintenance completed');

        } catch (error) {
            memoryLogger.error('❌ Maintenance failed:', error);
        }
    }

    async shutdown() {
        try {
            await this.dbManager.cleanup();
            memoryLogger.log('✅ Memory API shutdown completed');
        } catch (error) {
            memoryLogger.error('❌ Error during shutdown:', error);
        }
    }
}

// Export singleton instance
const memorySystemInstance = new MemoryAPI();
export default memorySystemInstance;
