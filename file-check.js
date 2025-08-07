const fs = require('fs');
const path = require('path');

console.log('Checking for required files...');

const filesToCheck = [
  'client/dist/index.html',
  'nexus-quantum-landing.html',
  'client/dist/assets'
];

filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  console.log(`${file}: ${exists ? 'FOUND' : 'NOT FOUND'}`);
  if (exists) {
    const stats = fs.statSync(fullPath);
    console.log(`  Type: ${stats.isDirectory() ? 'Directory' : 'File'}`);
    console.log(`  Size: ${stats.size} bytes`);
  }
});

console.log('Current directory:', __dirname);