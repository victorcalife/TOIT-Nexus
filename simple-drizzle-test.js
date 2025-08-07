console.log('Testing drizzle-orm import...');

try {
  // Test importing drizzle-orm
  import { sql } from 'drizzle-orm';
  console.log('- drizzle-orm sql import successful');
} catch (error) {
  console.log('- Error importing drizzle-orm sql:', error.message);
}

try {
  // Test importing drizzle-orm pg-core
  import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
  console.log('- drizzle-orm pg-core import successful');
} catch (error) {
  console.log('- Error importing drizzle-orm pg-core:', error.message);
}

console.log('Drizzle-orm test completed');