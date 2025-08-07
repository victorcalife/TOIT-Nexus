// Test script to verify Railway configuration and domain routing
const fs = require('fs');
const path = require('path');

console.log('=== Railway Configuration Test ===');

// Check if required files exist
const requiredFiles = [
  'railway-frontend.js',
  'nexus-quantum-landing.html',
  'client/dist/index.html'
];

console.log('Checking required files:');
requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${file}: ${exists ? '✅ FOUND' : '❌ MISSING'}`);
  if (!exists) {
    console.log(`    Expected path: ${fullPath}`);
  }
});

// Check environment variables
console.log('\nEnvironment Variables:');
const envVars = [
  'PORT',
  'NODE_ENV',
  'SESSION_SECRET',
  'DATABASE_URL',
  'STRIPE_SECRET_KEY',
  'RAILWAY_PUBLIC_DOMAIN',
  'RAILWAY_SERVICE_TOIT_NEXUS_BACKEND_URL',
  'RAILWAY_SERVICE_TOIT_NEXUS_FRONTEND_URL'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Hide sensitive values
    if (varName.includes('SECRET') || varName.includes('KEY') || varName.includes('DATABASE_URL')) {
      console.log(`  ${varName}: ✅ SET (value hidden for security)`);
    } else {
      console.log(`  ${varName}: ✅ ${value}`);
    }
  } else {
    console.log(`  ${varName}: ⚠️  NOT SET`);
  }
});

// Check for problematic configurations
console.log('\nConfiguration Issues:');
if (process.env.API_URL === 'api.nexus.com.br') {
  console.log('  ⚠️  API_URL is set to api.nexus.com.br but should be api.toit.com.br');
} else {
  console.log('  ✅ API_URL is correctly configured or not set');
}

if (process.env.SESSION_SECRET === 'meu segredo') {
  console.log('  ⚠️  SESSION_SECRET is using a weak default value');
} else if (process.env.SESSION_SECRET) {
  console.log('  ✅ SESSION_SECRET is properly configured');
} else {
  console.log('  ⚠️  SESSION_SECRET is not set');
}

console.log('\n=== Test Complete ===');