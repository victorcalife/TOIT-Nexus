import { Pool } from 'pg';
import 'dotenv/config';

console.log('Testing database connection...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query executed successfully:', result.rows[0]);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', error);
  }
}

testConnection();