const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy all .js files from server directory to dist directory
const serverDir = __dirname;
const files = fs.readdirSync(serverDir);

files.forEach(file => {
  if (path.extname(file) === '.js') {
    const srcPath = path.join(serverDir, file);
    const destPath = path.join(distDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} to dist directory`);
  }
});

console.log('Build completed successfully!');