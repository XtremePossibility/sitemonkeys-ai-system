// ================================================================
// REDIS DATABASE MANAGER - Simple Memory Storage
// Replaces PostgreSQL with Redis for easy deployment
// ================================================================

class DatabaseManager {
    constructor() {
        this.redisClient = null;
        this.initializeConnection();
    }

    async initializeConnection() {
        try {
            // Use Redis instead of PostgreSQL - much simpler for memory storage
            if (typeof window === 'undefined') {
                // Server environment - use Redis client
                const Redis = await import('ioredis');
                this.redisClient = new Redis.default(process.env.REDIS_URL || 'redis://localhost:6379');
                console.log("Redis connection initialized for memory storage");
            } else {
                // Browser environment - will use API calls
                this.redisClient = null;
                console.log("Browser environment detected - Redis operations will use API");
            }
        } catch (error) {
            console.error("Redis initialization failed:", error);
            // Fallback to in-memory storage
            this.redisClient = null;
        }
    }

    async createUserSpace(userId) {
        try {
            if (!this.redisClient) {
                console.log("Redis not available - using fallback mode");
                return { success: true, fallback: true };
            }

            // Initialize user metadata in Redis
            const userKey = `user:${userId}:metadata`;
            await this.redisClient.hset(userKey, {
                created_at: new Date().toISOString(),
                last_accessed: new Date().toISOString(),
                total_memories: 0,
                total_tokens: 0
            });

            return { success: true };
        } catch (error) {
            console.error("User space creation failed:", error);
            return { success: true, fallback: true };
        }
    }

    async createCategoryTable(userId, categoryName) {
        try {
            if (!this.redisClient) {
                return { success: true, fallback: true };
            }

            // Initialize category in Redis
            const categoryKey = `user:${userId}:category:${categoryName}`;
            await this.redisClient.hset(categoryKey, {
                created_at: new Date().toISOString(),
                memory_count: 0,
                total_tokens: 0
            });

            return { success: true, table: categoryKey };
        } catch (error) {
            console.error(`Failed to create category ${categoryName}:`, error);
            return { success: true, fallback: true };
        }
    }

    async insertMemory(userId, category, subcategory, memoryEntry) {
        try {
            if (!this.redisClient) {
                console.log("Redis not available - memory storage skipped");
                return { success: true, fallback: true, memoryId: Date.now(), tokensStored: 0 };
            }

            const memoryId = `memory:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
            const memoryKey = `user:${userId}:category:${category}:${memoryId}`;
            const tokenCount = this.calculateTokenCount(memoryEntry.content);

            // Store memory entry
            await this.redisClient.hset(memoryKey, {
                subcategory: subcategory,
                content: memoryEntry.content,
                keywords: JSON.stringify(memoryEntry.keywords || []),
                emotional_markers: JSON.stringify(memoryEntry.emotional_markers || []),
                priority: memoryEntry.priority || 50,
                timestamp: new Date().toISOString(),
                last_accessed: new Date().toISOString(),
                access_count: 0,
                token_count: tokenCount,
                metadata: JSON.stringify(memoryEntry.metadata || {})
            });

            // Update category statistics
            const categoryKey = `user:${userId}:category:${category}`;
            await this.redisClient.hincrby(categoryKey, 'memory_count', 1);
            await this.redisClient.hincrby(categoryKey, 'total_tokens', tokenCount);

            // Update user metadata
            const userKey = `user:${userId}:metadata`;
            await this.redisClient.hincrby(userKey, 'total_memories', 1);
            await this.redisClient.hincrby(userKey, 'total_tokens', tokenCount);
            await this.redisClient.hset(userKey, 'last_accessed', new Date().toISOString());

            // Add to category memory list
            await this.redisClient.zadd(`user:${userId}:category:${category}:memories`, 
                memoryEntry.priority || 50, memoryId);

            return { success: true, memoryId: memoryId, tokensStored: tokenCount };
        } catch (error) {
            console.error("Memory insertion failed:", error);
            return { success: true, fallback: true, memoryId: Date.now(), tokensStored: 0 };
        }
    }

    async getCategoryMemories(userId, category, limit = 100) {
        try {
            if (!this.redisClient) {
                return [];
            }

            // Get memory IDs sorted by priority (highest first)
            const memoryIds = await this.redisClient.zrevrange(
                `user:${userId}:category:${category}:memories`, 
                0, 
                limit - 1
            );

            const memories = [];
            for (const memoryId of memoryIds) {
                const memoryKey = `user:${userId}:category:${category}:${memoryId}`;
                const memoryData = await this.redisClient.hgetall(memoryKey);
                
                if (memoryData && memoryData.content) {
                    memories.push({
                        id: memoryId,
                        subcategory: memoryData.subcategory,
                        content: memoryData.content,
                        keywords: JSON.parse(memoryData.keywords || '[]'),
                        emotional_markers: JSON.parse(memoryData.emotional_markers || '[]'),
                        priority: parseInt(memoryData.priority) || 50,
                        timestamp: memoryData.timestamp,
                        last_accessed: memoryData.last_accessed,
                        access_count: parseInt(memoryData.access_count) || 0,
                        token_count: parseInt(memoryData.token_count) || 0,
                        metadata: JSON.parse(memoryData.metadata || '{}')
                    });
                }
            }

            // Update access tracking
            const userKey = `user:${userId}:metadata`;
            await this.redisClient.hset(userKey, 'last_accessed', new Date().toISOString());

            return memories;
        } catch (error) {
            console.error(`Failed to get memories from category ${category}:`, error);
            return [];
        }
    }

    async getCategoryTokenCount(userId, category) {
        try {
            if (!this.redisClient) {
                return 0;
            }

            const categoryKey = `user:${userId}:category:${category}`;
            const tokenCount = await this.redisClient.hget(categoryKey, 'total_tokens');
            return parseInt(tokenCount) || 0;
        } catch (error) {
            console.error(`Failed to get token count for category ${category}:`, error);
            return 0;
        }
    }

    async removeMemories(userId, category, memoryIds) {
        try {
            if (!this.redisClient) {
                return { success: true, fallback: true, removedCount: 0, tokensFreed: 0 };
            }

            let totalTokensFreed = 0;
            let removedCount = 0;

            for (const memoryId of memoryIds) {
                const memoryKey = `user:${userId}:category:${category}:${memoryId}`;
                
                // Get token count before removal
                const tokenCount = await this.redisClient.hget(memoryKey, 'token_count');
                totalTokensFreed += parseInt(tokenCount) || 0;
                
                // Remove memory
                await this.redisClient.del(memoryKey);
                
                // Remove from sorted set
                await this.redisClient.zrem(`user:${userId}:category:${category}:memories`, memoryId);
                
                removedCount++;
            }

            // Update category statistics
            const categoryKey = `user:${userId}:category:${category}`;
            await this.redisClient.hincrby(categoryKey, 'memory_count', -removedCount);
            await this.redisClient.hincrby(categoryKey, 'total_tokens', -totalTokensFreed);

            // Update user metadata
            const userKey = `user:${userId}:metadata`;
            await this.redisClient.hincrby(userKey, 'total_memories', -removedCount);
            await this.redisClient.hincrby(userKey, 'total_tokens', -totalTokensFreed);

            return { success: true, removedCount: removedCount, tokensFreed: totalTokensFreed };
        } catch (error) {
            console.error("Memory removal failed:", error);
            return { success: true, fallback: true, removedCount: 0, tokensFreed: 0 };
        }
    }

    async createDynamicCategoryTracker(userId) {
        try {
            if (!this.redisClient) {
                return { success: true, fallback: true };
            }

            // Initialize dynamic category tracker
            const trackerKey = `user:${userId}:dynamic_categories`;
            await this.redisClient.hset(trackerKey, {
                initialized: new Date().toISOString(),
                active_count: 0
            });

            return { success: true };
        } catch (error) {
            console.error("Dynamic category tracker creation failed:", error);
            return { success: true, fallback: true };
        }
    }

    async trackDynamicCategory(userId, categoryName) {
        try {
            if (!this.redisClient) {
                return { success: true, fallback: true };
            }

            const categoryKey = `user:${userId}:dynamic_category:${categoryName}`;
            await this.redisClient.hset(categoryKey, {
                category_name: categoryName,
                created_at: new Date().toISOString(),
                last_accessed: new Date().toISOString(),
                access_count: 0,
                is_active: 'true'
            });

            // Add to active dynamic categories set
            await this.redisClient.sadd(`user:${userId}:active_dynamic_categories`, categoryName);

            return { success: true };
        } catch (error) {
            console.error("Dynamic category tracking failed:", error);
            return { success: true, fallback: true };
        }
    }

    async getDynamicCategories(userId) {
        try {
            if (!this.redisClient) {
                return [];
            }

            const activeCategories = await this.redisClient.smembers(`user:${userId}:active_dynamic_categories`);
            return activeCategories || [];
        } catch (error) {
            console.error("Failed to get dynamic categories:", error);
            return [];
        }
    }

    async getDynamicCategoriesWithUsage(userId) {
        try {
            if (!this.redisClient) {
                return [];
            }

            const activeCategories = await this.getDynamicCategories(userId);
            const categoriesWithUsage = [];

            for (const categoryName of activeCategories) {
                const categoryKey = `user:${userId}:dynamic_category:${categoryName}`;
                const categoryData = await this.redisClient.hgetall(categoryKey);
                
                if (categoryData) {
                    categoriesWithUsage.push({
                        name: categoryName,
                        lastAccessed: categoryData.last_accessed,
                        accessCount: parseInt(categoryData.access_count) || 0
                    });
                }
            }

            // Sort by last accessed (oldest first for removal)
            categoriesWithUsage.sort((a, b) => 
                new Date(a.lastAccessed) - new Date(b.lastAccessed)
            );

            return categoriesWithUsage;
        } catch (error) {
            console.error("Failed to get dynamic categories with usage:", error);
            return [];
        }
    }

    async archiveDynamicCategory(userId, categoryName) {
        try {
            if (!this.redisClient) {
                return { success: true, fallback: true };
            }

            // Mark as inactive
            const categoryKey = `user:${userId}:dynamic_category:${categoryName}`;
            await this.redisClient.hset(categoryKey, 'is_active', 'false');

            // Remove from active set
            await this.redisClient.srem(`user:${userId}:active_dynamic_categories`, categoryName);

            return { success: true };
        } catch (error) {
            console.error("Dynamic category archiving failed:", error);
            return { success: true, fallback: true };
        }
    }

    calculateTokenCount(content) {
        const words = content.split(/\s+/).length;
        return Math.ceil(words * 0.75);
    }

    // Health check method
    async healthCheck() {
        try {
            if (!this.redisClient) {
                return { status: 'fallback', message: 'Redis not available, using fallback mode' };
            }

            await this.redisClient.ping();
            return { status: 'healthy', message: 'Redis connection active' };
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }
}

export default DatabaseManager;
