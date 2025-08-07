#!/usr/bin/env node

console.log('=== Environment Variables Test ===');

console.log('All environment variables:');
Object.keys(process.env).forEach(key => {
  console.log(`${key}: ${process.env[key]}`);
});

console.log('\nSpecific variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL || 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('RAILWAY_PROJECT_ID:', process.env.RAILWAY_PROJECT_ID || 'NOT SET');
console.log('RAILWAY_SERVICE_NAME:', process.env.RAILWAY_SERVICE_NAME || 'NOT SET');

console.log('\nChecking for pg package:');
try {
  import('pg').then(() => {
    console.log('✅ pg package imported successfully');
  }).catch(error => {
    console.log('❌ Error importing pg package:', error.message);
  });
} catch (error) {
  console.log('❌ Error importing pg package:', error.message);
}

console.log('\nChecking for drizzle-orm package:');
try {
  import('drizzle-orm').then(() => {
    console.log('✅ drizzle-orm package imported successfully');
  }).catch(error => {
    console.log('❌ Error importing drizzle-orm package:', error.message);
  });
} catch (error) {
  console.log('❌ Error importing drizzle-orm package:', error.message);
}

console.log('=== Environment Test Complete ===');