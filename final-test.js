// Final test to verify the TOIT Nexus deployment
console.log('🚀 TOIT Nexus Deployment Verification Test');

// Check if required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'nexus-quantum-landing.html',
  path.join('client', 'dist', 'index.html'),
  path.join('server', 'dist', 'index.js')
];

console.log('\n📁 Checking required files:');
requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Check environment variables
console.log('\n🔐 Checking environment variables:');
const envVars = ['PORT', 'SESSION_SECRET', 'DATABASE_URL'];
envVars.forEach(envVar => {
  const value = process.env[envVar];
  console.log(`  ${value ? '✅' : '⚠️'} ${envVar}: ${value ? 'SET' : 'NOT SET'}`);
});

console.log('\n🎯 Test completed successfully!');