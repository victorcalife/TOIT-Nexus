// Test Drizzle ORM
try {
  console.log('Testing Drizzle ORM import...');
  const { drizzle } = require('drizzle-orm/node-postgres');
  console.log('✅ Drizzle ORM imported successfully');
} catch (error) {
  console.error('❌ Drizzle ORM import failed:', error.message);
  console.error('Stack trace:', error.stack);
}