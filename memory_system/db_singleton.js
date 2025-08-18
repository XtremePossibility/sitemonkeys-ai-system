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
        DatabaseSingleton.instance = this;
    }

    async initialize() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this._performInitialization();
        return this.initializationPromise;
    }

    async _performInitialization() {
        if (this.isInitialized && this.pool) {
            return this.pool;
        }

        const connectionString = process.env.DATABASE_PRIVATE_URL || 
                               process.env.DATABASE_URL;
        
        if (!connectionString) {
            throw new Error('No database URL found in environment');
        }

        this.pool = new Pool({
            connectionString: connectionString.replace('postgres://', 'postgresql://'),
            max: 5, // Railway limit
            idleTimeoutMillis: 10000,
            connectionTimeoutMillis: 5000,
            ssl: process.env.NODE_ENV === 'production' ? { 
                rejectUnauthorized: false 
            } : false
        });

        // Critical error recovery for Railway
        this.pool.on('error', (err, client) => {
            console.error('Database pool error:', err);
            this.isInitialized = false;
        });

        // Verify connection works
        try {
            const client = await this.pool.connect();
            await client.query('SELECT 1');
            client.release();
            this.isInitialized = true;
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Database initialization failed:', error);
            throw error;
        }

        return this.pool;
    }

    async getPool() {
        if (!this.isInitialized || !this.pool) {
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
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Safe query for reads only
    async query(text, params) {
        const pool = await this.getPool();
        return pool.query(text, params);
    }
}

const dbSingleton = new DatabaseSingleton();
export default dbSingleton;
export const getDbPool = async () => dbSingleton.getPool();
