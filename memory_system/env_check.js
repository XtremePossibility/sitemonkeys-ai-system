// env_check.js
// Quick environment check for DATABASE_URL

console.log('=== ENVIRONMENT CHECK ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_PRIVATE_URL exists:', !!process.env.DATABASE_PRIVATE_URL);

if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    console.log('DATABASE_URL protocol:', url.split('://')[0]);
    console.log('DATABASE_URL length:', url.length);
} else {
    console.log('❌ DATABASE_URL is missing!');
    console.log('Add this to your .env file:');
    console.log('DATABASE_URL=postgresql://username:password@host:port/database');
}

if (process.env.DATABASE_PRIVATE_URL) {
    const url = process.env.DATABASE_PRIVATE_URL;
    console.log('DATABASE_PRIVATE_URL protocol:', url.split('://')[0]);
    console.log('DATABASE_PRIVATE_URL length:', url.length);
}

console.log('\nOther important env vars:');
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('ANTHROPIC_API_KEY exists:', !!process.env.ANTHROPIC_API_KEY);
