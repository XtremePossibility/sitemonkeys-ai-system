class DatabaseManager {
    constructor() {
        this.connectionPool = null;
        this.initializeConnection();
    }

    async initializeConnection() {
        try {
            // Initialize Railway PostgreSQL connection
            // This would use your Railway database URL from environment variables
            const { Pool } = require('pg');
            
            this.connectionPool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });

            console.log("Database connection pool initialized");
        } catch (error) {
            console.error("Database initialization failed:", error);
            throw error;
        }
    }

    async createUserSpace(userId) {
        const client = await this.connectionPool.connect();
        try {
            await client.query('BEGIN');
            
            // Create user metadata table
            await client.query(`
                CREATE TABLE IF NOT EXISTS user_${userId}_metadata (
                    id SERIAL PRIMARY KEY,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    total_memories INTEGER DEFAULT 0,
                    total_tokens INTEGER DEFAULT 0
                )
            `);

            // Insert initial metadata
            await client.query(`
                INSERT INTO user_${userId}_metadata (total_memories, total_tokens) 
                VALUES (0, 0)
                ON CONFLICT DO NOTHING
            `);

            await client.query('COMMIT');
            return { success: true };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async createCategoryTable(userId, categoryName) {
        const client = await this.connectionPool.connect();
        try {
            const tableName = `user_${userId}_${categoryName}`;
            
            await client.query(`
                CREATE TABLE IF NOT EXISTS ${tableName} (
                    id SERIAL PRIMARY KEY,
                    subcategory VARCHAR(100),
                    content TEXT NOT NULL,
                    keywords TEXT[],
                    emotional_markers TEXT[],
                    priority INTEGER DEFAULT 50,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    access_count INTEGER DEFAULT 0,
                    token_count INTEGER,
                    metadata JSONB
                )
            `);

            // Create indexes for performance
            await client.query(`
                CREATE INDEX IF NOT EXISTS ${tableName}_priority_idx ON ${tableName} (priority DESC);
                CREATE INDEX IF NOT EXISTS ${tableName}_timestamp_idx ON ${tableName} (timestamp DESC);
                CREATE INDEX IF NOT EXISTS ${tableName}_keywords_idx ON ${tableName} USING GIN (keywords);
            `);

            return { success: true, table: tableName };
        } catch (error) {
            console.error(`Failed to create category table ${categoryName}:`, error);
            throw error;
        } finally {
            client.release();
        }
    }

    async insertMemory(userId, category, subcategory, memoryEntry) {
        const client = await this.connectionPool.connect();
        try {
            const tableName = `user_${userId}_${category}`;
            const tokenCount = this.calculateTokenCount(memoryEntry.content);
            
            const result = await client.query(`
                INSERT INTO ${tableName} 
                (subcategory, content, keywords, emotional_markers, priority, token_count, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `, [
                subcategory,
                memoryEntry.content,
                memoryEntry.keywords || [],
                memoryEntry.emotional_markers || [],
                memoryEntry.priority || 50,
                tokenCount,
                memoryEntry.metadata || {}
            ]);

            // Update user metadata
            await client.query(`
                UPDATE user_${userId}_metadata 
                SET total_memories = total_memories + 1,
                    total_tokens = total_tokens + $1,
                    last_accessed = CURRENT_TIMESTAMP
            `, [tokenCount]);

            return { success: true, memoryId: result.rows[0].id, tokensStored: tokenCount };
        } catch (error) {
            console.error("Memory insertion failed:", error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getCategoryMemories(userId, category, limit = 1000) {
        const client = await this.connectionPool.connect();
        try {
            const tableName = `user_${userId}_${category}`;
            
            const result = await client.query(`
                SELECT * FROM ${tableName}
                ORDER BY priority DESC, timestamp DESC
                LIMIT $1
            `, [limit]);

            // Update access tracking
            await client.query(`
                UPDATE user_${userId}_metadata 
                SET last_accessed = CURRENT_TIMESTAMP
            `);

            return result.rows;
        } catch (error) {
            console.error(`Failed to get memories from category ${category}:`, error);
            return [];
        } finally {
            client.release();
        }
    }

    async getCategoryTokenCount(userId, category) {
        const client = await this.connectionPool.connect();
        try {
            const tableName = `user_${userId}_${category}`;
            
            const result = await client.query(`
                SELECT COALESCE(SUM(token_count), 0) as total_tokens FROM ${tableName}
            `);

            return result.rows[0].total_tokens;
        } catch (error) {
            console.error(`Failed to get token count for category ${category}:`, error);
            return 0;
        } finally {
            client.release();
        }
    }

    async removeMemories(userId, category, memoryIds) {
        const client = await this.connectionPool.connect();
        try {
            const tableName = `user_${userId}_${category}`;
            
            // Get token count of memories being removed
            const tokenResult = await client.query(`
                SELECT SUM(token_count) as removed_tokens FROM ${tableName}
                WHERE id = ANY($1)
            `, [memoryIds]);

            // Remove memories
            await client.query(`
                DELETE FROM ${tableName} WHERE id = ANY($1)
            `, [memoryIds]);

            // Update user metadata
            const removedTokens = tokenResult.rows[0].removed_tokens || 0;
            await client.query(`
                UPDATE user_${userId}_metadata 
                SET total_memories = total_memories - $1,
                    total_tokens = total_tokens - $2
            `, [memoryIds.length, removedTokens]);

            return { success: true, removedCount: memoryIds.length, tokensFreed: removedTokens };
        } catch (error) {
            console.error("Memory removal failed:", error);
            throw error;
        } finally {
            client.release();
        }
    }

    async createDynamicCategoryTracker(userId) {
        const client = await this.connectionPool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS user_${userId}_dynamic_categories (
                    id SERIAL PRIMARY KEY,
                    category_name VARCHAR(100) UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    access_count INTEGER DEFAULT 0,
                    is_active BOOLEAN DEFAULT true
                )
            `);

            return { success: true };
        } catch (error) {
            console.error("Dynamic category tracker creation failed:", error);
            throw error;
        } finally {
            client.release();
        }
    }

    async trackDynamicCategory(userId, categoryName) {
        const client = await this.connectionPool.connect();
        try {
            await client.query(`
                INSERT INTO user_${userId}_dynamic_categories (category_name)
                VALUES ($1)
                ON CONFLICT (category_name) DO UPDATE SET
                    last_accessed = CURRENT_TIMESTAMP,
                    is_active = true
            `, [categoryName]);

            return { success: true };
        } catch (error) {
            console.error("Dynamic category tracking failed:", error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getDynamicCategories(userId) {
        const client = await this.connectionPool.connect();
        try {
            const result = await client.query(`
                SELECT category_name FROM user_${userId}_dynamic_categories
                WHERE is_active = true
                ORDER BY last_accessed DESC
            `);

            return result.rows.map(row => row.category_name);
        } catch (error) {
            console.error("Failed to get dynamic categories:", error);
            return [];
        } finally {
            client.release();
        }
    }

    async getDynamicCategoriesWithUsage(userId) {
        const client = await this.connectionPool.connect();
        try {
            const result = await client.query(`
                SELECT category_name, last_accessed, access_count 
                FROM user_${userId}_dynamic_categories
                WHERE is_active = true
                ORDER BY last_accessed ASC
            `);

            return result.rows.map(row => ({
                name: row.category_name,
                lastAccessed: row.last_accessed,
                accessCount: row.access_count
            }));
        } catch (error) {
            console.error("Failed to get dynamic categories with usage:", error);
            return [];
        } finally {
            client.release();
        }
    }

    async archiveDynamicCategory(userId, categoryName) {
        const client = await this.connectionPool.connect();
        try {
            await client.query(`
                UPDATE user_${userId}_dynamic_categories 
                SET is_active = false 
                WHERE category_name = $1
            `, [categoryName]);

            return { success: true };
        } catch (error) {
            console.error("Dynamic category archiving failed:", error);
            throw error;
        } finally {
            client.release();
        }
    }

    calculateTokenCount(content) {
        const words = content.split(/\s+/).length;
        return Math.ceil(words * 0.75);
    }
}
