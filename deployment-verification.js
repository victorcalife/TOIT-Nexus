// Deployment Verification Script for TOIT Nexus
console.log('🚀 TOIT Nexus Deployment Verification');
console.log('=====================================');
console.log('Process PID:', process.pid);
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', __dirname);
console.log('');

// Check environment variables
console.log('Environment Variables Check:');
const requiredEnvVars = ['PORT', 'SESSION_SECRET', 'DATABASE_URL'];
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  console.log(`  ${value ? '✅' : '❌'} ${envVar}: ${value ? 'SET' : 'NOT SET'}`);
});
console.log('');

// Check if required files exist
const fs = require('fs');
const path = require('path');

console.log('File System Verification:');
const requiredFiles = [
  'nexus-quantum-landing.html',
  path.join('client', 'dist', 'index.html'),
  path.join('server', 'dist', 'index.js')
];

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});
console.log('');

// Test database connection
console.log('Database Connection Test:');
try {
  const { db } = require('./server/dist/db.js');
  console.log('  ✅ Database module loaded successfully');
} catch (error) {
  console.log('  ❌ Database module failed to load:', error.message);
}
console.log('');

console.log('🎯 Deployment verification completed!');
console.log('Next steps:');
console.log('1. Check Railway logs for any runtime errors');
console.log('2. Access the deployed application at https://toit-nexus.up.railway.app');
console.log('3. Verify health endpoint at https://toit-nexus.up.railway.app/api/health');
console.log('4. Configure STRIPE_SECRET_KEY in Railway dashboard if not already done');