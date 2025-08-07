const fs = require('fs');
const path = require('path');

// Test file system operations
const testFile = path.join(__dirname, 'fs-test-result.txt');

try {
  // Write test result to file
  fs.writeFileSync(testFile, 'File system test successful\n');
  fs.appendFileSync(testFile, 'Node.js version: ' + process.version + '\n');
  fs.appendFileSync(testFile, 'Current directory: ' + __dirname + '\n');
  
  // Read test result back
  const content = fs.readFileSync(testFile, 'utf8');
  console.log(content);
  
  console.log('File system operations working correctly');
} catch (error) {
  console.log('File system error:', error.message);
}