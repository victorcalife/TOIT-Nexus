import { execSync } from 'child_process';
import fs from 'fs';

console.log('=== TOIT Nexus Railway Deployment Helper ===\n');

try {
  // Check if Railway CLI is installed
  console.log('1. Checking Railway CLI installation...');
  const railwayVersion = execSync('railway --version', { encoding: 'utf8' });
  console.log(`✅ Railway CLI version: ${railwayVersion.trim()}`);
} catch (error) {
  console.log('❌ Railway CLI not found. Please install it with:');
  console.log('   npm install -g @railway/cli\n');
  process.exit(1);
}

try {
  // Check if we're logged in to Railway
  console.log('2. Checking Railway login status...');
  const railwayUser = execSync('railway whoami', { encoding: 'utf8' });
  console.log(`✅ Logged in as: ${railwayUser.trim()}`);
} catch (error) {
  console.log('❌ Not logged in to Railway. Please login with:');
  console.log('   railway login\n');
  process.exit(1);
}

// Check critical files
console.log('3. Verifying critical files...');
const criticalFiles = [
  'package.json',
  'package-lock.json',
  'railway.json',
  'drizzle.config.ts',
  'railway-frontend.js',
  'shared/schema.js'
];

let missingFiles = [];
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - Found`);
  } else {
    console.log(`❌ ${file} - Missing`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log(`\n❌ Missing critical files: ${missingFiles.join(', ')}`);
  process.exit(1);
}

console.log('\n✅ All critical files present');

// Check if client is built
console.log('4. Checking client build...');
if (fs.existsSync('client/dist/index.html')) {
  console.log('✅ Client application built successfully');
} else {
  console.log('❌ Client application not built. Building now...');
  try {
    execSync('cd client && npm run build', { stdio: 'inherit' });
    console.log('✅ Client build completed');
  } catch (error) {
    console.log('❌ Client build failed:', error.message);
    process.exit(1);
  }
}

// Check if server is built
console.log('5. Checking server build...');
if (fs.existsSync('server/dist/index.js')) {
  console.log('✅ Server application compiled successfully');
} else {
  console.log('❌ Server application not compiled. Compiling now...');
  try {
    execSync('npm run server:build', { stdio: 'inherit' });
    console.log('✅ Server compilation completed');
  } catch (error) {
    console.log('❌ Server compilation failed:', error.message);
    process.exit(1);
  }
}

console.log('\n=== Deployment Ready ===');
console.log('You can now deploy to Railway with:');
console.log('railway up\n');

console.log('After deployment completes, run these commands:');
console.log('railway run npm run db:setup');
console.log('railway run npm run db:push\n');

console.log('For manual deployment steps, check MANUAL_DEPLOYMENT_GUIDE.md');