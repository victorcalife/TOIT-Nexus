import fs from 'fs';
import path from 'path';

console.log('=== TOIT Nexus Deployment Verification ===\n');

// 1. Check project structure
console.log('1. Project Structure Verification:');
const requiredPaths = [
  'client/dist',
  'server/dist',
  'shared/schema.js',
  'drizzle',
  'package.json',
  'package-lock.json',
  'railway.json'
];

requiredPaths.forEach(p => {
  const fullPath = path.join(process.cwd(), p);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${p} - Found`);
  } else {
    console.log(`❌ ${p} - Missing`);
  }
});

// 2. Check environment variables
console.log('\n2. Environment Variables Check:');
const requiredEnvVars = [
  'DATABASE_URL',
  'SESSION_SECRET',
  'PORT'
];

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} - Defined`);
  } else {
    console.log(`❌ ${envVar} - Not defined`);
  }
});

// 3. Check package.json dependencies
console.log('\n3. Package Dependencies Verification:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = packageJson.dependencies || {};
  
  const requiredDeps = ['express', 'drizzle-kit', 'drizzle-orm', 'pg'];
  requiredDeps.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`✅ ${dep} - ${dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - Missing`);
    }
  });
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// 4. Check package-lock.json
console.log('\n4. Package Lock Verification:');
try {
  const packageLock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
  if (packageLock.lockfileVersion) {
    console.log(`✅ Lockfile version: ${packageLock.lockfileVersion}`);
  } else {
    console.log('❌ Invalid package-lock.json');
  }
} catch (error) {
  console.log('❌ Error reading package-lock.json:', error.message);
}

// 5. Check Railway configuration
console.log('\n5. Railway Configuration Check:');
try {
  const railwayConfig = JSON.parse(fs.readFileSync('railway.json', 'utf8'));
  console.log(`✅ Builder: ${railwayConfig.builder}`);
  console.log(`✅ Build command: ${railwayConfig.buildCommand}`);
  console.log(`✅ Start command: ${railwayConfig.startCommand}`);
} catch (error) {
  console.log('❌ Error reading railway.json:', error.message);
}

// 6. Check Drizzle configuration
console.log('\n6. Drizzle Configuration Check:');
try {
  if (fs.existsSync('drizzle.config.ts')) {
    console.log('✅ drizzle.config.ts - Found');
  } else {
    console.log('❌ drizzle.config.ts - Missing');
  }
} catch (error) {
  console.log('❌ Error checking drizzle config:', error.message);
}

console.log('\n=== Verification Complete ===');