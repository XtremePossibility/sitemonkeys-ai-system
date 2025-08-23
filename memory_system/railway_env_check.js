// Redeploy
// railway_env_check.js
// Run this to check what Railway environment variables are actually available

console.log('🚂 RAILWAY ENVIRONMENT CHECK');
console.log('='.repeat(50));

// Check if we're running on Railway
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
console.log('RAILWAY_PROJECT_ID:', process.env.RAILWAY_PROJECT_ID ? 'SET' : 'NOT SET');
console.log('RAILWAY_SERVICE_ID:', process.env.RAILWAY_SERVICE_ID ? 'SET' : 'NOT SET');

console.log('\n📊 DATABASE ENVIRONMENT VARIABLES:');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_PUBLIC_URL exists:', !!process.env.DATABASE_PUBLIC_URL);
console.log('DATABASE_PRIVATE_URL exists:', !!process.env.DATABASE_PRIVATE_URL);

// Check individual PostgreSQL variables
console.log('\n🔧 INDIVIDUAL POSTGRES VARIABLES:');
console.log('PGHOST:', process.env.PGHOST || 'NOT SET');
console.log('PGPORT:', process.env.PGPORT || 'NOT SET');
console.log('PGUSER:', process.env.PGUSER || 'NOT SET');
console.log('PGPASSWORD exists:', !!process.env.PGPASSWORD);
console.log('PGDATABASE:', process.env.PGDATABASE || 'NOT SET');
console.log('POSTGRES_DB:', process.env.POSTGRES_DB || 'NOT SET');
console.log('POSTGRES_USER:', process.env.POSTGRES_USER || 'NOT SET');
console.log('POSTGRES_PASSWORD exists:', !!process.env.POSTGRES_PASSWORD);

// Show the actual DATABASE_URL format (safely)
if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    const urlObj = new URL(url);
    console.log('\n🔗 DATABASE_URL ANALYSIS:');
    console.log('Protocol:', urlObj.protocol);
    console.log('Host:', urlObj.hostname);
    console.log('Port:', urlObj.port);
    console.log('Database:', urlObj.pathname.substring(1));
    console.log('Username:', urlObj.username);
    console.log('Password length:', urlObj.password ? urlObj.password.length : 0);
    console.log('Full URL length:', url.length);
    console.log('URL starts with:', url.substring(0, 25) + '...');
} else {
    console.log('\n❌ DATABASE_URL is not set!');
}

// Check other important variables
console.log('\n🔑 OTHER IMPORTANT VARIABLES:');
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('ANTHROPIC_API_KEY exists:', !!process.env.ANTHROPIC_API_KEY);

// Try to construct a manual connection string if individual vars exist
if (process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE) {
    const manualUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE}`;
    console.log('\n🔧 MANUAL URL CONSTRUCTION:');
    console.log('Could construct URL from individual variables: YES');
    console.log('Manual URL starts with:', manualUrl.substring(0, 25) + '...');
}

console.log('\n' + '='.repeat(50));

// Attempt a quick connection test using node-postgres
console.log('\n🧪 QUICK CONNECTION TEST:');

try {
    // Simple connection test without importing the full system
    if (process.env.DATABASE_URL) {
        console.log('✅ DATABASE_URL is available for connection testing');
        console.log('✅ Proceeding to full diagnostic...');
        console.log('\n💡 NEXT STEP: Run the full database diagnostic:');
        console.log('   node database_diagnostic.js');
    } else {
        console.log('❌ No DATABASE_URL available');
        console.log('\n🔧 TROUBLESHOOTING:');
        console.log('1. Make sure your PostgreSQL service is running in Railway');
        console.log('2. Check that your service is properly linked to the database');
        console.log('3. Restart your Railway service');
        console.log('4. Check Railway logs for database connection errors');
    }
} catch (error) {
    console.log('❌ Error during environment check:', error.message);
}

console.log('\n📋 SUMMARY:');
console.log('- Railway detected:', !!process.env.RAILWAY_PROJECT_ID);
console.log('- Database URL available:', !!process.env.DATABASE_URL);
console.log('- Individual DB vars available:', !!(process.env.PGHOST && process.env.PGUSER));
console.log('- Ready for connection test:', !!process.env.DATABASE_URL);
