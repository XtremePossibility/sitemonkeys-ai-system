// Run this to verify your fixes worked
const { Pool } = require('pg');

async function verifyFix() {
    console.log('🔍 Verifying Site Monkeys memory system fix...');
    
    const pool = new Pool({ 
        connectionString: process.env.DATABASE_URL || process.env.DATABASE_PRIVATE_URL 
    });
    
    try {
        // Test that we can query the corrected columns
        const result = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'persistent_memories' 
            AND column_name IN ('category', 'category_name')
        `);
        
        console.log('✅ Available columns:', result.rows.map(r => r.column_name));
        
        if (result.rows.some(r => r.column_name === 'category')) {
            console.log('✅ CORRECT: Database uses "category" column');
            console.log('✅ Your code fixes should work now!');
        } else {
            console.log('⚠️  Database still uses "category_name" - you may need to update schema instead');
        }
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    } finally {
        await pool.end();
    }
}

verifyFix();
