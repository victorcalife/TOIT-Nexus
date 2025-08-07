#!/usr/bin/env node

/**
 * Simple database connection test script
 */

console.log('🔍 SIMPLE DATABASE CONNECTION TEST');
console.log('===================================\n');

// Test if DATABASE_URL is accessible
console.log('🔧 Checking DATABASE_URL environment variable...');
console.log('   Value:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('   Length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0);

if (process.env.DATABASE_URL) {
  console.log('   Preview:', process.env.DATABASE_URL.substring(0, 50) + (process.env.DATABASE_URL.length > 50 ? '...' : ''));
}

// Test importing the database module
console.log('\n🔧 Testing database module import...');
try {
  const dbModule = require('./server/dist/db.js');
  console.log('   ✅ Database module imported successfully');
  console.log('   🗄️  Pool object exists:', !!dbModule.pool);
  console.log('   🗄️  DB object exists:', !!dbModule.db);
} catch (error) {
  console.log('   ❌ Error importing database module:', error.message);
  console.log('   Stack:', error.stack);
}

console.log('\n✅ Test completed!');
