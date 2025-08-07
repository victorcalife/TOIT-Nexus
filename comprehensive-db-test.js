import { writeFileSync, appendFileSync } from 'fs';
import { Pool } from 'pg';

const logFile = 'comprehensive-db-test.log';

// Function to log messages to both console and file
const log = (message) => {
  console.log(message);
  appendFileSync(logFile, `${new Date().toISOString()}: ${message}\n`);
};

log('=== Comprehensive Database Test Started ===');

// Check environment
log(`NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
log(`RAILWAY_PROJECT_ID: ${process.env.RAILWAY_PROJECT_ID ? 'SET' : 'NOT SET'}`);
log(`RAILWAY_SERVICE_NAME: ${process.env.RAILWAY_SERVICE_NAME ? 'SET' : 'NOT SET'}`);

// Check DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
log(`DATABASE_URL present: ${!!databaseUrl}`);
if (databaseUrl) {
  log(`DATABASE_URL length: ${databaseUrl.length}`);
  log(`DATABASE_URL contains railway: ${databaseUrl.includes('railway')}`);
  log(`DATABASE_URL preview: ${databaseUrl.substring(0, Math.min(100, databaseUrl.length))}`);
}

// Try to create and test database connection
const testDatabaseConnection = async () => {
  try {
    log('Creating database pool...');
    const pool = new Pool({
      connectionString: databaseUrl || 'postgresql://localhost:5432/toitnexus',
    });
    log('Pool created successfully');
    
    log('Attempting to connect to database...');
    const client = await pool.connect();
    log('Connected to database successfully');
    
    log('Running version query...');
    const result = await client.query('SELECT version()');
    log(`Database version: ${result.rows[0].version}`);
    
    log('Running simple NOW query...');
    const nowResult = await client.query('SELECT NOW()');
    log(`Current time: ${nowResult.rows[0].now}`);
    
    log('Releasing client...');
    client.release();
    
    log('Closing pool...');
    await pool.end();
    log('Pool closed successfully');
    
    log('✅ Database connection test PASSED');
    return true;
  } catch (error) {
    log(`❌ Database connection test FAILED: ${error.message}`);
    log(`Error code: ${error.code || 'NO CODE'}`);
    log(`Stack trace: ${error.stack || 'NO STACK'}`);
    
    // Try to close pool if it exists
    try {
      await pool.end();
    } catch (closeError) {
      log(`Error closing pool: ${closeError.message}`);
    }
    
    return false;
  }
};

// Run the test
testDatabaseConnection()
  .then(success => {
    log(`Test completed with success: ${success}`);
    log('=== Comprehensive Database Test Completed ===');
  })
  .catch(error => {
    log(`Test failed with error: ${error.message}`);
    log('=== Comprehensive Database Test Completed (with errors) ===');
  });