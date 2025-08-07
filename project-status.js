const fs = require('fs');
const path = require('path');

console.log('=== TOIT Nexus Project Status ===');

// Check project structure
console.log('\n📁 Project Structure:');
const projectDirs = ['client', 'server', 'shared', 'drizzle', 'scripts'];
projectDirs.forEach(dir => {
  const exists = fs.existsSync(path.join(__dirname, dir));
  console.log(`  ${exists ? '✅' : '❌'} ${dir}: ${exists ? 'Present' : 'Missing'}`);
});

// Check critical files
console.log('\n📄 Critical Files:');
const criticalFiles = [
  'package.json',
  'railway.json',
  'drizzle.config.ts',
  'railway-frontend.js',
  'nexus-quantum-landing.html'
];
criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}: ${exists ? 'Present' : 'Missing'}`);
});

// Check client build
console.log('\n🏗️ Client Build Status:');
const clientDistExists = fs.existsSync(path.join(__dirname, 'client', 'dist'));
const clientDistIndexExists = fs.existsSync(path.join(__dirname, 'client', 'dist', 'index.html'));
console.log(`  ${clientDistExists ? '✅' : '⚠️'} client/dist directory: ${clientDistExists ? 'Present' : 'Missing'}`);
console.log(`  ${clientDistIndexExists ? '✅' : '⚠️'} client/dist/index.html: ${clientDistIndexExists ? 'Present' : 'Missing'}`);

// Check database migrations
console.log('\n📋 Database Migrations:');
const drizzleDirExists = fs.existsSync(path.join(__dirname, 'drizzle'));
if (drizzleDirExists) {
  try {
    const files = fs.readdirSync(path.join(__dirname, 'drizzle'));
    console.log(`  ✅ Drizzle directory: ${files.length} file(s) found`);
    files.forEach(file => console.log(`    - ${file}`));
  } catch (err) {
    console.log('  ❌ Error reading drizzle directory:', err.message);
  }
} else {
  console.log('  ❌ Drizzle directory: Missing');
}

// Check environment variables
console.log('\n🔐 Environment Variables:');
console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? 'Defined' : 'Not defined'}`);
console.log(`  SESSION_SECRET: ${process.env.SESSION_SECRET ? 'Defined' : 'Not defined'}`);
console.log(`  PORT: ${process.env.PORT ? process.env.PORT : 'Not set (will use default)'}`);

// Check npm scripts
console.log('\n⚙️ NPM Scripts:');
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const scripts = pkg.scripts || {};
  
  const requiredScripts = ['db:push', 'db:setup', 'railway:start', 'server:build', 'client:build'];
  requiredScripts.forEach(script => {
    const exists = !!scripts[script];
    console.log(`  ${exists ? '✅' : '❌'} ${script}: ${exists ? scripts[script] : 'Missing'}`);
  });
} catch (err) {
  console.log('  ❌ Error reading package.json:', err.message);
}

console.log('\n=== Status Check Complete ===');