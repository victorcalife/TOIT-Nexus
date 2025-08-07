#!/usr/bin/env node

console.log('=== Database Connection Test ===');

try {
  // Import the database connection
  import('./server/dist/db.js').then((dbModule) => {
    console.log('✅ Database module imported successfully');
    
    // Try to connect to the database
    const { pool } = dbModule;
    
    if (pool) {
      console.log('✅ Database pool created');
      
      // Try to get a connection from the pool
      pool.connect().then((client) => {
        console.log('✅ Database connection established');
        
        // Run a simple query to test the connection
        client.query('SELECT NOW()').then((result) => {
          console.log('✅ Simple query executed successfully');
          console.log('Current time:', result.rows[0].now);
          
          // Close the client
          client.release();
        }).catch((error) => {
          console.log('❌ Error executing query:', error.message);
          client.release();
        });
      }).catch((error) => {
        console.log('❌ Error connecting to database:', error.message);
      });
    } else {
      console.log('❌ Database pool not found');
    }
  }).catch((error) => {
    console.log('❌ Error importing database module:', error.message);
  });
} catch (error) {
  console.log('❌ Error in database connection test:', error.message);
}

console.log('=== Test Complete ===');