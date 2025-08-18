// db_singleton.js - Single database connection for entire app
import pg from 'pg';
const { Pool } = pg;

let poolInstance = null;

export function getDbPool() {
    if (!poolInstance) {
        poolInstance = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? 
                { rejectUnauthorized: false } : false,
            max: 10,  // Railway optimized
            min: 2,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
            acquireTimeoutMillis: 10000,
            createTimeoutMillis: 10000,
            // Railway-specific WAL optimization
            statement_timeout: 30000,
            query_timeout: 30000
        });
        
        poolInstance.on('error', (err) => {
            console.error('Unexpected pool error:', err);
        });
        
        poolInstance.on('connect', () => {
            console.log('Database pool: client connected');
        });
    }
    
    return poolInstance;
} 

export async function closeDbPool() {
    if (poolInstance) {
        await poolInstance.end();
        poolInstance = null;
    }
}
