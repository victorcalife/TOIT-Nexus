#!/usr/bin/env node

console.log('=== Railway Environment Variables Check ===');

// Check if we're in Railway environment
const isRailway = !!process.env.RAILWAY_PROJECT_ID || !!process.env.RAILWAY_SERVICE_NAME;

console.log('Railway Environment Detected:', isRailway);

if (isRailway) {
  console.log('Railway Project ID:', process.env.RAILWAY_PROJECT_ID || 'NOT SET');
  console.log('Railway Service Name:', process.env.RAILWAY_SERVICE_NAME || 'NOT SET');
}

// Check database connection variables
console.log('\nDatabase Connection Variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL Length:', process.env.DATABASE_URL.length);
  console.log('DATABASE_URL Preview:', process.env.DATABASE_URL.substring(0, 50) + '...');
}

console.log('\nAll Railway-related Environment Variables:');
Object.keys(process.env).filter(key => key.includes('RAILWAY')).forEach(key => {
  console.log(`${key}: ${process.env[key]}`);
});

console.log('\n=== Check Complete ===');