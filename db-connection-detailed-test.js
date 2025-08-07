#!/usr/bin/env node

/**
 * Detailed database connection test script
 */

console.log('🔍 DETAILED DATABASE CONNECTION TEST');
console.log('====================================\n');

// Test if DATABASE_URL is accessible
console.log('🔧 Checking DATABASE_URL environment variable...');
console.log('   Value:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('   Length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0);

if (process.env.DATABASE_URL) {
  console.log('   Preview:', process.env.DATABASE_URL.substring(0, 50) + (process.env.DATABASE_URL.length > 50 ? '...' : ''));
  
  // Try to parse the URL
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log('   Host:', url.hostname);
    console.log('   Port:', url.port);
    console.log('   Database:', url.pathname.substring(1));
    console.log('   Username:', url.username ? 'SET' : 'NOT SET');
  } catch (error) {
    console.log('   ❌ Error parsing DATABASE_URL:', error.message);
  }
}

// Test importing the database module
console.log('\n🔧 Testing database module import...');
try {
  const { pool, db } = require('./server/dist/db.js');
  console.log('   ✅ Database module imported successfully');
  console.log('   🗄️  Pool object exists:', !!pool);
  console.log('   🗄️  DB object exists:', !!db);
  
  if (pool) {
    console.log('\n🔧 Testing database connection...');
    pool.query('SELECT 1 as test', (err, res) => {
      if (err) {
        console.log('   ❌ Database connection failed:', err.message);
        console.log('   Code:', err.code);
      } else {
        console.log('   ✅ Database connection successful!');
        console.log('   Result:', res.rows[0].test);
      }
      
      // Close the pool
      pool.end(() => {
        console.log('\n✅ Database connection test completed!');
      });
    });
  }
} catch (error) {
  console.log('   ❌ Error importing database module:', error.message);
  console.log('   Stack:', error.stack);
}
