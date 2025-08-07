const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
console.log('Dist directory path:', distDir);
if (!fs.existsSync(distDir)) {
  console.log('Creating dist directory');
  fs.mkdirSync(distDir);
} else {
  console.log('Dist directory already exists');
}

// Copy all .js files from server directory to dist directory
const serverDir = __dirname;
console.log('Server directory path:', serverDir);
const files = fs.readdirSync(serverDir);
console.log('Files in server directory:', files);

files.forEach(file => {
  console.log('Processing file:', file);
  console.log('File extension:', path.extname(file));
  if (path.extname(file) === '.js') {
    const srcPath = path.join(serverDir, file);
    const destPath = path.join(distDir, file);
    console.log(`Copying ${srcPath} to ${destPath}`);
    try {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ Copied ${file} to dist directory`);
    } catch (error) {
      console.log(`❌ Error copying ${file}:`, error.message);
    }
  } else {
    console.log(`⏭️  Skipping ${file} - not a .js file`);
  }
});

console.log('Build completed successfully!');