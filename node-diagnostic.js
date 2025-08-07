#!/usr/bin/env node

console.log('Node.js Diagnostic Information:');
console.log('================================');

console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);

console.log('\nEnvironment variables:');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'NOT SET');

console.log('\nCurrent working directory:', process.cwd());

console.log('\nTesting drizzle-kit import...');
try {
  import('drizzle-kit').then((module) => {
    console.log('drizzle-kit imported successfully');
    console.log('Available methods:', Object.keys(module));
  }).catch((error) => {
    console.error('Error importing drizzle-kit:', error.message);
  });
} catch (error) {
  console.error('Error importing drizzle-kit:', error.message);
}

console.log('\nDiagnostic complete');