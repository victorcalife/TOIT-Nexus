const fs = require('fs');
const path = require('path');

console.log('=== TOIT Nexus Simple Verification ===');

// Check if required directories exist
console.log('\n📁 Checking directories:');
const dirs = ['client', 'server', 'shared', 'drizzle', 'scripts'];
dirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(`  ${exists ? '✅' : '❌'} ${dir}`);
});

// Check if required files exist
console.log('\n📄 Checking critical files:');
const files = [
  'package.json',
  'drizzle.config.ts',
  'railway.json',
  'shared/schema.ts'
];
files.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Check environment variables
console.log('\n🔐 Checking environment variables:');
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? 'DEFINED' : 'NOT DEFINED');
console.log('  SESSION_SECRET:', process.env.SESSION_SECRET ? 'DEFINED' : 'NOT DEFINED');
console.log('  PORT:', process.env.PORT || 'NOT SET (will use default)');

// Check package.json scripts
console.log('\n⚙️  Checking npm scripts:');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = pkg.scripts || {};
  console.log('  db:push:', scripts['db:push'] || 'NOT FOUND');
  console.log('  db:setup:', scripts['db:setup'] || 'NOT FOUND');
  console.log('  railway:start:', scripts['railway:start'] || 'NOT FOUND');
} catch (error) {
  console.log('  ❌ Error reading package.json:', error.message);
}

console.log('\n=== Verification Complete ===');
