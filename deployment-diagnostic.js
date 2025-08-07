#!/usr/bin/env node

/**
 * TOIT Nexus Deployment Diagnostic Script
 * This script checks the current deployment status and provides actionable insights
 */

import fs from 'fs';
import path from 'path';

console.log('=== TOIT Nexus Deployment Diagnostic ===\n');

// 1. Check project structure
console.log('📁 Project Structure Check:');
const requiredDirs = ['client', 'server', 'shared', 'drizzle', 'scripts'];
requiredDirs.forEach(dir => {
  const exists = fs.existsSync(path.join(process.cwd(), dir));
  console.log(`  ${exists ? '✅' : '❌'} ${dir} directory: ${exists ? 'FOUND' : 'MISSING'}`);
});

// 2. Check critical files
console.log('\n📄 Critical Files Check:');
const criticalFiles = [
  'package.json',
  'railway.json',
  'drizzle.config.ts',
  'railway-frontend.js',
  'nexus-quantum-landing.html',
  'shared/schema.ts'
];
criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}: ${exists ? 'FOUND' : 'MISSING'}`);
});

// 3. Check client build status
console.log('\n🏗️ Client Build Status:');
const clientDistExists = fs.existsSync(path.join(process.cwd(), 'client', 'dist'));
const clientDistIndexExists = fs.existsSync(path.join(process.cwd(), 'client', 'dist', 'index.html'));
console.log(`  ${clientDistExists ? '✅' : '⚠️'} client/dist directory: ${clientDistExists ? 'FOUND' : 'MISSING'}`);
console.log(`  ${clientDistIndexExists ? '✅' : '⚠️'} client/dist/index.html: ${clientDistIndexExists ? 'FOUND' : 'MISSING'}`);

// 4. Check environment variables
console.log('\n🔐 Environment Variables Check:');
const envVars = ['DATABASE_URL', 'SESSION_SECRET', 'PORT'];
envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: DEFINED`);
  } else {
    console.log(`  ❌ ${varName}: NOT DEFINED`);
  }
});

// 5. Check npm scripts
console.log('\n⚙️ NPM Scripts Check:');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = pkg.scripts || {};
  
  const requiredScripts = ['db:push', 'db:setup', 'railway:start'];
  requiredScripts.forEach(script => {
    const exists = scripts.hasOwnProperty(script);
    console.log(`  ${exists ? '✅' : '❌'} ${script}: ${exists ? 'AVAILABLE' : 'MISSING'}`);
    if (exists) {
      console.log(`      Command: ${scripts[script]}`);
    }
  });
} catch (error) {
  console.log('  ❌ Error reading package.json:', error.message);
}

// 6. Check database migration files
console.log('\n📋 Database Migration Check:');
const drizzleDirExists = fs.existsSync(path.join(process.cwd(), 'drizzle'));
if (drizzleDirExists) {
  const migrationFiles = fs.readdirSync(path.join(process.cwd(), 'drizzle'));
  console.log(`  ✅ Drizzle directory: ${migrationFiles.length} migration file(s) found`);
  migrationFiles.forEach(file => {
    console.log(`      - ${file}`);
  });
} else {
  console.log('  ❌ Drizzle directory: MISSING');
}

// 7. Check database configuration
console.log('\n🗄️ Database Configuration Check:');
try {
  const drizzleConfig = fs.readFileSync('drizzle.config.ts', 'utf8');
  const hasPostgreSQLDialect = drizzleConfig.includes('postgresql');
  const hasSchemaPath = drizzleConfig.includes('./shared/schema.ts');
  const hasOutputPath = drizzleConfig.includes('./drizzle');
  
  console.log(`  ${hasPostgreSQLDialect ? '✅' : '❌'} PostgreSQL dialect: ${hasPostgreSQLDialect ? 'CONFIGURED' : 'MISSING'}`);
  console.log(`  ${hasSchemaPath ? '✅' : '❌'} Schema path: ${hasSchemaPath ? 'CONFIGURED' : 'MISSING'}`);
  console.log(`  ${hasOutputPath ? '✅' : '❌'} Output path: ${hasOutputPath ? 'CONFIGURED' : 'MISSING'}`);
} catch (error) {
  console.log('  ❌ Error reading drizzle.config.ts:', error.message);
}

console.log('\n=== Diagnostic Complete ===');

console.log('\n📋 Recommended Actions:');
console.log('1. If all checks are ✅, you can deploy with: "railway up"');
console.log('2. After deployment, run database setup: "railway run npm run db:setup"');
console.log('3. Check Railway logs for any runtime errors: "railway logs"');
console.log('4. Test API endpoints:');
console.log('   - Health check: https://toit-nexus.up.railway.app/api/health');
console.log('   - Debug endpoint: https://toit-nexus.up.railway.app/api/debug-integrated');
