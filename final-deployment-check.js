import fs from 'fs';
import path from 'path';

console.log('=== TOIT Nexus Final Deployment Verification ===\n');

// Check if critical files exist
const criticalFiles = [
  'package.json',
  'package-lock.json',
  'railway.json',
  'drizzle.config.ts',
  'railway-frontend.js',
  'shared/schema.js',
  'client/dist/index.html',
  'server/dist/index.js'
];

console.log('1. Critical Files Check:');
let allFilesExist = true;
criticalFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file} - Found`);
  } else {
    console.log(`❌ ${file} - Missing`);
    allFilesExist = false;
  }
});

console.log('\n2. Environment Variables Check:');
const criticalEnvVars = ['DATABASE_URL', 'SESSION_SECRET', 'PORT'];
let allEnvVarsExist = true;
criticalEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} - Defined`);
  } else {
    console.log(`❌ ${envVar} - Not defined`);
    allEnvVarsExist = false;
  }
});

console.log('\n3. Dependencies Verification:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const packageLock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
  
  const deps = packageJson.dependencies || {};
  const lockDeps = packageLock.dependencies || {};
  
  const requiredDeps = ['express', 'drizzle-kit', 'drizzle-orm', 'pg'];
  requiredDeps.forEach(dep => {
    if (deps[dep] && lockDeps[dep]) {
      console.log(`✅ ${dep} - ${deps[dep]} (locked: ${lockDeps[dep].version || 'present'})`);
    } else {
      console.log(`❌ ${dep} - Missing in package.json or package-lock.json`);
    }
  });
} catch (error) {
  console.log('❌ Error reading package files:', error.message);
}

console.log('\n=== Deployment Readiness Summary ===');
if (allFilesExist && allEnvVarsExist) {
  console.log('✅ ALL CRITICAL FILES AND ENVIRONMENT VARIABLES ARE PRESENT');
  console.log('✅ YOUR PROJECT IS READY FOR RAILWAY DEPLOYMENT');
  console.log('\nNext steps:');
  console.log('1. Run: railway up');
  console.log('2. After deployment completes, run: railway run npm run db:setup');
  console.log('3. Then run: railway run npm run db:push');
  console.log('4. Finally, configure your custom domains in the Railway dashboard');
} else {
  console.log('❌ Some critical files or environment variables are missing');
  console.log('Please check the issues listed above before deploying');
}