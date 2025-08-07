const fs = require('fs');
const path = require('path');

console.log('Current directory:', __dirname);
console.log('Dist directory path:', path.join(__dirname, 'dist'));

// Check if dist directory exists
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  console.log('Dist directory exists');
} else {
  console.log('Dist directory does not exist');
}

// Try to create a file in dist directory
const testFile = path.join(distDir, 'simple-test.txt');
try {
  fs.writeFileSync(testFile, 'Simple test content');
  console.log('Successfully created test file in dist directory');
} catch (error) {
  console.log('Error creating test file:', error.message);
}