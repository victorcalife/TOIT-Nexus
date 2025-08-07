#!/usr/bin/env node

/**
 * TOIT Nexus Database Connection Diagnostic
 * This script tests the database connection directly
 */

console.log('=== TOIT Nexus Database Connection Diagnostic ===\n');

// Check if DATABASE_URL is set
console.log('🔐 DATABASE_URL Check:');
const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl) {
  console.log(`  ✅ DATABASE_URL is set: ${databaseUrl.substring(0, 30)}...`);
  
  // Try to import pg and test connection
  try {
    console.log('\n🔌 PostgreSQL Client Test:');
    const { Pool } = await import('pg');
    console.log('  ✅ pg module imported successfully');
    
    const pool = new Pool({ 
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    
    console.log('  📡 Testing database connection...');
    
    // Test connection
    const client = await pool.connect();
    console.log('  ✅ Database connection established');
    
    // Run a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`  🕐 Database time: ${result.rows[0].current_time}`);
    
    client.release();
    await pool.end();
    console.log('  📤 Database connection closed');
    
  } catch (error) {
    console.log(`  ❌ Error testing database connection: ${error.message}`);
  }
  
} else {
  console.log('  ❌ DATABASE_URL is NOT set');
  console.log('  💡 Please set DATABASE_URL in your environment variables');
}

console.log('\n=== Database Diagnostic Complete ===');
