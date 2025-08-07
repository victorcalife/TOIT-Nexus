const fs = require('fs');
const path = require('path');

console.log('File Path Test:');
console.log('Current directory:', __dirname);

// Test if landing page exists
const landingPath = path.join(__dirname, 'nexus-quantum-landing.html');
console.log('Landing page exists:', fs.existsSync(landingPath));

// Test if client/dist exists
const clientDistPath = path.join(__dirname, 'client', 'dist');
console.log('Client/dist directory exists:', fs.existsSync(clientDistPath));

// Test if client/dist/index.html exists
const clientIndexPath = path.join(__dirname, 'client', 'dist', 'index.html');
console.log('Client/dist/index.html exists:', fs.existsSync(clientIndexPath));

// Test if railway.json exists
const railwayConfigPath = path.join(__dirname, 'railway.json');
console.log('railway.json exists:', fs.existsSync(railwayConfigPath));

if (fs.existsSync(clientDistPath)) {
  console.log('Client/dist contents:');
  const files = fs.readdirSync(clientDistPath);
  files.forEach(file => console.log('  -', file));
}

console.log('Path test completed');