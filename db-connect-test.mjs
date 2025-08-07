import pg from 'pg';

console.log('=== PostgreSQL Connection Test ===');

// Check if DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  console.log('❌ DATABASE_URL environment variable is not defined');
  process.exit(1);
}

console.log('✅ DATABASE_URL is defined');
console.log('Database URL:', process.env.DATABASE_URL);

// Create a new pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

console.log('🔌 Attempting to connect to database...');

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('❌ Database connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Database connection successful');
    console.log('Current time from database:', res.rows[0].now);
    
    // Close the pool
    pool.end(() => {
      console.log('📤 Database connection closed');
      console.log('=== Connection Test Complete ===');
    });
  }
});