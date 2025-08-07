import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './shared/schema.js';

console.log('=== TOIT Nexus Database Connection Test ===');

// Check if DATABASE_URL is defined
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.log('❌ DATABASE_URL environment variable is not defined');
  console.log('Please set DATABASE_URL in your environment variables');
  process.exit(1);
}

console.log('✅ DATABASE_URL is defined');
console.log('Database URL:', DATABASE_URL.substring(0, 50) + '...');

try {
  // Create a new pool
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  // Create drizzle client
  const db = drizzle({ client: pool, schema });

  console.log('✅ Database connection established successfully');
  
  // Close the pool
  await pool.end();
  console.log('📤 Database connection closed');
  console.log('=== Test Complete ===');
  
} catch (error) {
  console.log('❌ Database connection failed:', error.message);
  process.exit(1);
}