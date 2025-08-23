// Redeploy
import pg from 'pg';
const { Pool } = pg;

class DatabaseSingleton {
    constructor() {
        if (DatabaseSingleton.instance) {
            return DatabaseSingleton.instance;
        }
        
        this.pool = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        this.lastError = null;
        DatabaseSingleton.instance = this;
        
        // Enhanced logging
        console.log('[DB_SINGLETON] 🏗️ Database singleton created');
    }

    async initialize() {
        if (this.initializationPromise) {
            console.log('[DB_SINGLETON] ⏳ Waiting for existing initialization...');
            return this.initializationPromise;
        }

        this.initializationPromise = this._performInitialization();
        return this.initializationPromise;
    }

    async _performInitialization() {
        if (this.isInitialized && this.pool) {
            console.log('[DB_SINGLETON] ✅ Already initialized, returning existing pool');
            return this.pool;
        }

        try {
            console.log('[DB_SINGLETON] 🔍 Checking environment variables...');
            
            // Enhanced environment variable checking
            const connectionString = process.env.DATABASE_PRIVATE_URL || 
                                   process.env.DATABASE_URL ||
                                   process.env.POSTGRES_URL ||
                                   process.env.POSTGRESQL_URL;
            
            if (!connectionString) {
                const availableEnvVars = Object.keys(process.env).filter(key => 
                    key.toLowerCase().includes('database') || 
                    key.toLowerCase().includes('postgres')
                );
                
                this.lastError = `No database URL found. Available database-related env vars: ${availableEnvVars.join(', ')}`;
                console.error('[DB_SINGLETON] ❌', this.lastError);
                throw new Error(this.lastError);
            }

            console.log('[DB_SINGLETON] ✅ Found database URL, creating connection pool...');
            console.log('[DB_SINGLETON] 🔗 Connection string starts with:', connectionString.substring(0, 20) + '...');

            // Enhanced pool configuration
            const poolConfig = {
                connectionString: connectionString.replace('postgres://', 'postgresql://'),
                max: process.env.NODE_ENV === 'production' ? 5 : 2, // Railway limit vs development
                idleTimeoutMillis: 10000,
                connectionTimeoutMillis: 10000, // Increased timeout
                statement_timeout: 30000, // 30 second query timeout
                query_timeout: 30000,
                application_name: 'sitemonkeys_memory_system',
                ssl: this._getSSLConfig(connectionString)
            };

            console.log('[DB_SINGLETON] 📋 Pool config:', {
                max: poolConfig.max,
                ssl: !!poolConfig.ssl,
                timeout: poolConfig.connectionTimeoutMillis
            });

            this.pool = new Pool(poolConfig);

            // Enhanced error recovery for Railway
            this.pool.on('error', (err, client) => {
                console.error('[DB_SINGLETON] 💥 Pool error:', {
                    message: err.message,
                    code: err.code,
                    errno: err.errno
                });
                this.isInitialized = false;
                this.lastError = err.message;
            });

            this.pool.on('connect', (client) => {
                console.log('[DB_SINGLETON] 🔌 New client connected');
            });

            this.pool.on('remove', (client) => {
                console.log('[DB_SINGLETON] 📤 Client removed from pool');
            });

            // Enhanced connection verification
            console.log('[DB_SINGLETON] ⏳ Testing database connection...');
            const client = await this.pool.connect();
            
            try {
                const result = await client.query('SELECT NOW() as time, version() as version');
                console.log('[DB_SINGLETON] ✅ Connection test successful');
                console.log('[DB_SINGLETON] 📅 Database time:', result.rows[0].time);
                console.log('[DB_SINGLETON] 🗄️ PostgreSQL version:', result.rows[0].version.substring(0, 50) + '...');
                
                // Test basic operations
                await client.query('CREATE TABLE IF NOT EXISTS _connection_test (id SERIAL PRIMARY KEY, test_time TIMESTAMP DEFAULT NOW())');
                await client.query('INSERT INTO _connection_test DEFAULT VALUES');
                const testResult = await client.query('SELECT COUNT(*) as count FROM _connection_test');
                console.log('[DB_SINGLETON] 🧪 Test table operations successful, row count:', testResult.rows[0].count);
                
                // Clean up test
                await client.query('DROP TABLE IF EXISTS _connection_test');
                
            } finally {
                client.release();
            }
            
            this.isInitialized = true;
            this.lastError = null;
            console.log('[DB_SINGLETON] 🎉 Database initialized successfully');
            
            return this.pool;

        } catch (error) {
            this.lastError = error.message;
            console.error('[DB_SINGLETON] ❌ Database initialization failed:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                syscall: error.syscall,
                hostname: error.hostname,
                port: error.port,
                detail: error.detail
            });
            
            // Provide helpful error messages
            if (error.code === 'ECONNREFUSED') {
                console.error('[DB_SINGLETON] 💡 Database connection refused. Check if PostgreSQL is running and accessible.');
            } else if (error.code === 'ENOTFOUND') {
                console.error('[DB_SINGLETON] 💡 Database host not found. Check the hostname in your DATABASE_URL.');
            } else if (error.message.includes('password authentication failed')) {
                console.error('[DB_SINGLETON] 💡 Authentication failed. Check username/password in DATABASE_URL.');
            } else if (error.message.includes('database') && error.message.includes('does not exist')) {
                console.error('[DB_SINGLETON] 💡 Database does not exist. Create the database first.');
            }
            
            throw error;
        }
    }

    _getSSLConfig(connectionString) {
        // Enhanced SSL configuration
        if (process.env.NODE_ENV === 'production') {
            return { rejectUnauthorized: false };
        }
        
        // Check if the connection string explicitly requires SSL
        if (connectionString.includes('sslmode=require') || 
            connectionString.includes('ssl=true') ||
            connectionString.includes('.railway.app') ||
            connectionString.includes('.herokuapp.com')) {
            return { rejectUnauthorized: false };
        }
        
        return false;
    }

    async getPool() {
        if (!this.isInitialized || !this.pool) {
            console.log('[DB_SINGLETON] 🔄 Pool not ready, initializing...');
            return await this.initialize();
        }
        return this.pool;
    }

    // CRITICAL: Transaction method for writes
    async transaction(callback) {
        const pool = await this.getPool();
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            console.log('[DB_SINGLETON] 📝 Transaction started');
            const result = await callback(client);
            await client.query('COMMIT');
            console.log('[DB_SINGLETON] ✅ Transaction committed');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('[DB_SINGLETON] 🔄 Transaction rolled back:', error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    // Safe query for reads only
    async query(text, params) {
        const pool = await this.getPool();
        console.log('[DB_SINGLETON] 📊 Executing query:', text.substring(0, 50) + '...');
        const result = await pool.query(text, params);
        console.log('[DB_SINGLETON] ✅ Query completed, rows:', result.rows.length);
        return result;
    }

    // Health check method
    async healthCheck() {
        try {
            if (!this.pool || !this.isInitialized) {
                return {
                    status: 'unhealthy',
                    error: 'Pool not initialized',
                    lastError: this.lastError
                };
            }

            const client = await this.pool.connect();
            await client.query('SELECT 1');
            client.release();
            
            return {
                status: 'healthy',
                initialized: this.isInitialized,
                totalCount: this.pool.totalCount,
                idleCount: this.pool.idleCount,
                waitingCount: this.pool.waitingCount
            };

        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                lastError: this.lastError
            };
        }
    }

    // Get detailed status for debugging
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            hasPool: !!this.pool,
            lastError: this.lastError,
            poolStats: this.pool ? {
                totalCount: this.pool.totalCount,
                idleCount: this.pool.idleCount,
                waitingCount: this.pool.waitingCount
            } : null
        };
    }

    // Graceful shutdown
    async shutdown() {
        console.log('[DB_SINGLETON] 🔄 Shutting down database connection...');
        try {
            if (this.pool) {
                await this.pool.end();
                console.log('[DB_SINGLETON] ✅ Database pool closed successfully');
            }
            this.isInitialized = false;
            this.pool = null;
            this.initializationPromise = null;
        } catch (error) {
            console.error('[DB_SINGLETON] ❌ Error during shutdown:', error);
        }
    }
}

const dbSingleton = new DatabaseSingleton();
export default dbSingleton;
export const getDbPool = async () => dbSingleton.getPool();
