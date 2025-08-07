const fs = require('fs');
const path = require('path');

console.log('🚀 TOIT Nexus Diagnostic Script');
console.log('===============================');
console.log('Current directory:', __dirname);
console.log('Process cwd:', process.cwd());
console.log('');

// Check if landing page exists
const landingPath = path.join(__dirname, 'nexus-quantum-landing.html');
console.log('Checking landing page:', landingPath);
console.log('Landing page exists:', fs.existsSync(landingPath));
console.log('');

// List files in current directory
console.log('Files in current directory:');
const files = fs.readdirSync(__dirname);
files.forEach(file => {
  const stats = fs.statSync(path.join(__dirname, file));
  console.log(`  ${stats.isDirectory() ? '[DIR]' : '[FILE]'} ${file}`);
});
console.log('');

// Check client/dist directory
const clientDistPath = path.join(__dirname, 'client', 'dist');
console.log('Checking client/dist directory:', clientDistPath);
console.log('client/dist exists:', fs.existsSync(clientDistPath));

if (fs.existsSync(clientDistPath)) {
  console.log('Files in client/dist:');
  const clientDistFiles = fs.readdirSync(clientDistPath);
  clientDistFiles.forEach(file => {
    console.log(`  - ${file}`);
  });
}
console.log('');

console.log('🎯 Diagnostic completed!');