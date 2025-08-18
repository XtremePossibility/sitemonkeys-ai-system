// database_diagnostic.js
// Run this to diagnose database connection issues
// Usage: node database_diagnostic.js

import { getDbPool } from './memory_system/db_singleton.js';
import PersistentMemoryAPI from './memory_system/persistent_memory.js';

console.log('🔍 Starting comprehensive database diagnostic...\n');

async function runDatabaseDiagnostic() {
    console.log('=== ENVIRONMENT VARIABLES ===');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_PRIVATE_URL exists:', !!process.env.DATABASE_PRIVATE_URL);
    
    if (process.env.DATABASE_URL) {
        const url = process.env.DATABASE_URL;
        console.log('DATABASE_URL starts with:', url.substring(0, 20) + '...');
        console.log('DATABASE_URL contains postgres:', url.includes('postgres'));
    }
    
    if (process.env.DATABASE_PRIVATE_URL) {
        const url = process.env.DATABASE_PRIVATE_URL;
        console.log('DATABASE_PRIVATE_URL starts with:', url.substring(0, 20) + '...');
        console.log('DATABASE_PRIVATE_URL contains postgres:', url.includes('postgres'));
    }
    
    console.log('\n=== DATABASE POOL TEST ===');
    
    try {
        console.log('⏳ Testing database pool connection...');
        const pool = await getDbPool();
        console.log('✅ Database pool obtained successfully');
        
        console.log('⏳ Testing database query...');
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
        client.release();
        
        console.log('✅ Database query successful!');
        console.log('   Current time:', result.rows[0].current_time);
        console.log('   PostgreSQL version:', result.rows[0].postgres_version.substring(0, 50) + '...');
        
    } catch (error) {
        console.error('❌ Database connection failed:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            syscall: error.syscall,
            hostname: error.hostname,
            port: error.port
        });
        
        console.log('\n🔧 POTENTIAL FIXES:');
        console.log('1. Check if DATABASE_URL is set in your .env file');
        console.log('2. Verify PostgreSQL database is running and accessible');
        console.log('3. Check if the database URL format is correct');
        console.log('4. Ensure network connectivity to the database server');
        return false;
    }
    
    console.log('\n=== PERSISTENT MEMORY API TEST ===');
    
    try {
        console.log('⏳ Creating PersistentMemoryAPI instance...');
        const memoryAPI = new PersistentMemoryAPI();
        
        console.log('⏳ Initializing persistent memory system...');
        const success = await memoryAPI.initialize();
        
        if (success) {
            console.log('✅ Persistent memory system initialized successfully!');
            
            console.log('⏳ Testing health check...');
            const health = await memoryAPI.healthCheck();
            console.log('   Health status:', health.status);
            console.log('   Initialized:', health.initialized);
            
            console.log('⏳ Testing memory storage...');
            const storeResult = await memoryAPI.storeMemory('diagnostic_user', 'This is a test memory entry for diagnostics', { test: true });
            console.log('   Storage result:', storeResult.success ? 'SUCCESS' : 'FAILED');
            if (storeResult.success) {
                console.log('   Memory ID:', storeResult.memoryId);
                console.log('   Token count:', storeResult.tokenCount);
            }
            
            console.log('⏳ Testing memory retrieval...');
            const retrieveResult = await memoryAPI.getRelevantContext('diagnostic_user', 'test memory', 100);
            console.log('   Retrieval result:', retrieveResult.contextFound ? 'FOUND' : 'NOT_FOUND');
            if (retrieveResult.contextFound) {
                console.log('   Memory content length:', retrieveResult.memories.length);
            }
            
            console.log('\n🎉 ALL TESTS PASSED! Your memory system should be working.');
            
        } else {
            console.error('❌ Persistent memory initialization returned false');
            
            console.log('\n🔧 TROUBLESHOOTING STEPS:');
            console.log('1. Check the initialization logs above for specific errors');
            console.log('2. Verify database schema was created properly');
            console.log('3. Check database permissions for CREATE/INSERT/SELECT operations');
            
            return false;
        }
        
    } catch (error) {
        console.error('❌ Persistent memory system failed:', {
            message: error.message,
            stack: error.stack.split('\n').slice(0, 5).join('\n'),
            name: error.name
        });
        
        console.log('\n🔧 TROUBLESHOOTING STEPS:');
        console.log('1. Check if persistent_memory.js has syntax errors');
        console.log('2. Verify all required imports are available');
        console.log('3. Check database permissions and schema');
        
        return false;
    }
    
    console.log('\n=== DIAGNOSTIC COMPLETE ===');
    console.log('✅ Database connection and persistent memory system are working correctly!');
    console.log('\nIf you\'re still seeing "system not healthy" messages:');
    console.log('1. Restart your application completely');
    console.log('2. Check that memory_bootstrap.js is using the corrected version');
    console.log('3. Verify that server.js is calling memoryBootstrap.initialize() properly');
    
    return true;
}

// Error handling for the diagnostic
runDatabaseDiagnostic()
    .then(success => {
        if (success) {
            console.log('\n🎯 NEXT STEPS: Restart your application and test memory storage/retrieval');
        } else {
            console.log('\n⚠️ ISSUES FOUND: Fix the problems above and run this diagnostic again');
        }
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('\n💥 DIAGNOSTIC CRASHED:', error);
        console.log('\nThis usually means there\'s a critical configuration issue.');
        console.log('Check your DATABASE_URL and make sure all files exist.');
        process.exit(1);
    });
