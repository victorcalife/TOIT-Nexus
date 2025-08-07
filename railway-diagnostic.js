// Railway diagnostic script
console.log('🚀 TOIT Nexus Railway Diagnostic');
console.log('=================================');
console.log('Process PID:', process.pid);
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', __dirname);
console.log('Working directory:', process.cwd());
console.log('');

// Check environment variables
console.log('Environment Variables:');
console.log('PORT:', process.env.PORT || 'Not set');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'Not set');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? 'SET' : 'Not set');
console.log('');

// Check if required files exist
const fs = require('fs');
const path = require('path');

console.log('File System Check:');
const requiredPaths = [
  '.',
  'nexus-quantum-landing.html',
  'client',
  'client/dist',
  'server',
  'server/dist'
];

requiredPaths.forEach(p => {
  const fullPath = path.join(__dirname, p);
  try {
    const exists = fs.existsSync(fullPath);
    const stats = exists ? fs.statSync(fullPath) : null;
    console.log(`  ${exists ? '✅' : '❌'} ${p} (${stats ? (stats.isDirectory() ? 'DIR' : 'FILE') : 'NOT FOUND'})`);
  } catch (error) {
    console.log(`  ❌ ${p} (ERROR: ${error.message})`);
  }
});

console.log('');
console.log('🎯 Diagnostic completed!');