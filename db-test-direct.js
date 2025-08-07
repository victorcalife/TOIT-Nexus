#!/usr/bin/env node

console.log('=== Direct Database Test ===');

// Import the database connection directly
import { db } from './server/dist/db.js';

console.log('Database connection imported');

// Try to run a simple query
try {
  const result = await db.execute('SELECT NOW() as current_time');
  console.log('✅ Query executed successfully');
  console.log('Result:', result);
} catch (error) {
  console.log('❌ Error executing query:', error.message);
  console.log('Error stack:', error.stack);
}

console.log('=== Direct Database Test Complete ===');