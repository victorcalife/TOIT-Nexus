// Simple health check script
console.log('Health check started');

// Check environment variables
console.log('Environment variables present:');
console.log('- DATABASE_URL:', !!process.env.DATABASE_URL);
console.log('- NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('- PORT:', process.env.PORT || 'NOT SET');

// Try database connection
import { Pool } from 'pg';

if (process.env.DATABASE_URL) {
  console.log('Attempting database connection...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  pool.connect()
    .then(client => {
      console.log('Database connection successful');
      client.release();
      pool.end();
    })
    .catch(error => {
      console.log('Database connection failed:', error.message);
    });
} else {
  console.log('No DATABASE_URL found, skipping database check');
}

console.log('Health check completed');