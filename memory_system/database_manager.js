const { Pool } = require('pg');

class DatabaseManager {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        this.connectionHealthy = false;
        this.lastHealthCheck = 0;
        this.healthCheckInterval = 30000; // 30 seconds
        
        this.initializeConnection();
    }

    async initializeConnection() {
        try {
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            this.connectionHealthy = true;
            memoryLogger.log('✅ Database connection established');
        } catch (error) {
            this.connectionHealthy = false;
            memoryLogger.error('❌ Database connection failed:', error);
        }
    }

    async healthCheck() {
        const now = Date.now();
        if (now - this.lastHealthCheck < this.healthCheckInterval && this.connectionHealthy) {
            return { healthy: true, cached: true };
        }

        try {
            const client = await this.pool.connect();
            const result = await client.query('SELECT NOW() as current_time, pg_database_size(current_database()) as db_size');
            client.release();
            
            this.connectionHealthy = true;
            this.lastHealthCheck = now;
            
            return {
                healthy: true,
                timestamp: result.rows[0].current_time,
                databaseSize: result.rows[0].db_size,
                poolTotal: this.pool.totalCount,
                poolIdle: this.pool.idleCount,
                poolWaiting: this.pool.waitingCount
            };
        } catch (error) {
            this.connectionHealthy = false;
            return {
                healthy: false,
                error: error.message,
                lastHealthy: new Date(this.lastHealthCheck)
            };
        }
    }

    async storeMemory(userId, categoryName, subcategoryName, content, metadata = {}) {
        if (!this.connectionHealthy) {
            await this.initializeConnection();
            if (!this.connectionHealthy) {
                throw new Error('Database unavailable');
            }
        }

        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // Calculate token count
            const tokenCount = Math.ceil(content.length / 4);

            // Check category capacity
            const capacityCheck = await client.query(`
                SELECT current_tokens, max_tokens 
                FROM memory_categories 
                WHERE user_id = $1 AND category_name = $2 AND subcategory_name = $3
            `, [userId, categoryName, subcategoryName]);

            if (capacityCheck.rows.length === 0) {
                // Create category if doesn't exist
                await this.createCategoryIfNotExists(userId, categoryName, subcategoryName, client);
            } else {
                const { current_tokens, max_tokens } = capacityCheck.rows[0];
                if (current_tokens + tokenCount > max_tokens) {
                    // Trigger cleanup before storing
                    await this.makeSpace(userId, categoryName, subcategoryName, tokenCount, client);
                }
            }

            // Calculate relevance score
            const relevanceScore = this.calculateInitialRelevance(content, metadata);

            // Store memory
            const insertResult = await client.query(`
                INSERT INTO memory_entries 
                (user_id, category_name, subcategory_name, content, token_count, relevance_score, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `, [userId, categoryName, subcategoryName, content, tokenCount, relevanceScore, metadata]);

            // Update category token count
            await client.query(`
                UPDATE memory_categories 
                SET current_tokens = current_tokens + $1, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $2 AND category_name = $3 AND subcategory_name = $4
            `, [tokenCount, userId, categoryName, subcategoryName]);

            await client.query('COMMIT');

            memoryLogger.log(`✅ Memory stored: ${insertResult.rows[0].id} (${tokenCount} tokens)`);
            
            return {
                success: true,
                memoryId: insertResult.rows[0].id,
                tokenCount: tokenCount,
                relevanceScore: relevanceScore
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async createCategoryIfNotExists(userId, categoryName, subcategoryName, client) {
        const maxTokens = 50000; // Standard category size
        const isDynamic = categoryName.startsWith('dynamic_category_');
        
        await client.query(`
            INSERT INTO memory_categories 
            (user_id, category_name, subcategory_name, max_tokens, is_dynamic)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id, category_name, subcategory_name) DO NOTHING
        `, [userId, categoryName, subcategoryName, maxTokens, isDynamic]);
    }

    async makeSpace(userId, categoryName, subcategoryName, neededTokens, client) {
        // Strategy: Remove lowest relevance memories until we have space
        const spaceNeeded = neededTokens + 1000; // Buffer space

        const deletedTokens = await client.query(`
            WITH deleted_memories AS (
                DELETE FROM memory_entries 
                WHERE user_id = $1 AND category_name = $2 AND subcategory_name = $3
                AND id IN (
                    SELECT id FROM memory_entries 
                    WHERE user_id = $1 AND category_name = $2 AND subcategory_name = $3
                    ORDER BY relevance_score ASC, usage_frequency ASC, created_at ASC
                    LIMIT (
                        SELECT COUNT(*) FROM memory_entries 
                        WHERE user_id = $1 AND category_name = $2 AND subcategory_name = $3
                        ORDER BY relevance_score ASC
                        LIMIT 20
                    )
                )
                RETURNING token_count
            )
            SELECT COALESCE(SUM(token_count), 0) as freed_tokens FROM deleted_memories
        `, [userId, categoryName, subcategoryName]);

        const freedTokens = parseInt(deletedTokens.rows[0].freed_tokens);

        // Update category token count
        await client.query(`
            UPDATE memory_categories 
            SET current_tokens = current_tokens - $1
            WHERE user_id = $2 AND category_name = $3 AND subcategory_name = $4
        `, [freedTokens, userId, categoryName, subcategoryName]);

        memoryLogger.log(`🧹 Made space in ${categoryName}/${subcategoryName}: freed ${freedTokens} tokens`);
    }

    calculateInitialRelevance(content, metadata) {
        let relevance = 0.5; // Base relevance

        // Boost for emotional content
        const emotionalWords = ['excited', 'worried', 'happy', 'stressed', 'important', 'urgent', 'critical'];
        const emotionalMatches = emotionalWords.filter(word => 
            content.toLowerCase().includes(word)
        ).length;
        relevance += emotionalMatches * 0.05;

        // Boost for questions (likely important for future reference)
        if (content.includes('?')) {
            relevance += 0.1;
        }

        // Boost for specific numbers/dates (concrete information)
        const numberMatches = content.match(/\d+/g);
        if (numberMatches && numberMatches.length > 0) {
            relevance += Math.min(numberMatches.length * 0.02, 0.1);
        }

        // Metadata-based boosts
        if (metadata.userMarkedImportant) {
            relevance += 0.2;
        }
        
        if (metadata.followUpRequired) {
            relevance += 0.15;
        }

        return Math.min(relevance, 1.0);
    }

    async getMemoriesByCategory(userId, categoryName, subcategoryName = null, limit = 50) {
        const client = await this.pool.connect();
        try {
            let query = `
                SELECT id, content, token_count, relevance_score, usage_frequency,
                       created_at, last_accessed, metadata
                FROM memory_entries 
                WHERE user_id = $1 AND category_name = $2
            `;
            const params = [userId, categoryName];

            if (subcategoryName) {
                query += ` AND subcategory_name = $3`;
                params.push(subcategoryName);
            }

            query += ` ORDER BY relevance_score DESC, created_at DESC LIMIT $${params.length + 1}`;
            params.push(limit);

            const result = await client.query(query, params);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async searchMemories(userId, searchTerm, categoryFilter = null) {
        const client = await this.pool.connect();
        try {
            let query = `
                SELECT id, category_name, subcategory_name, content, token_count, 
                       relevance_score, created_at,
                       ts_rank(to_tsvector('english', content), plainto_tsquery('english', $2)) as search_rank
                FROM memory_entries 
                WHERE user_id = $1 
                AND to_tsvector('english', content) @@ plainto_tsquery('english', $2)
            `;
            const params = [userId, searchTerm];

            if (categoryFilter) {
                query += ` AND category_name = $3`;
                params.push(categoryFilter);
            }

            query += ` ORDER BY search_rank DESC, relevance_score DESC LIMIT 20`;

            const result = await client.query(query, params);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async getUserStats(userId) {
        const client = await this.pool.connect();
        try {
            const stats = await client.query(`
                SELECT 
                    COUNT(*) as total_memories,
                    SUM(token_count) as total_tokens,
                    AVG(relevance_score) as avg_relevance,
                    COUNT(DISTINCT category_name) as categories_used,
                    MAX(created_at) as last_memory,
                    MIN(created_at) as first_memory
                FROM memory_entries 
                WHERE user_id = $1
            `, [userId]);

            const categoryBreakdown = await client.query(`
                SELECT 
                    category_name,
                    COUNT(*) as memory_count,
                    SUM(token_count) as token_count,
                    AVG(relevance_score) as avg_relevance
                FROM memory_entries 
                WHERE user_id = $1
                GROUP BY category_name
                ORDER BY token_count DESC
            `, [userId]);

            return {
                overall: stats.rows[0],
                byCategory: categoryBreakdown.rows
            };
        } finally {
            client.release();
        }
    }

    async cleanup() {
        try {
            await this.pool.end();
            memoryLogger.log('✅ Database connections closed');
        } catch (error) {
            memoryLogger.error('❌ Error closing database connections:', error);
        }
    }
}

module.exports = DatabaseManager;
