const fs = require('fs');
const path = require('path');

// Function to check environment variables
function checkEnvVars() {
  console.log('=== Environment Variables Check ===');
  
  // Check if .env file exists
  const envPath = path.join(__dirname, '.env');
  const envExists = fs.existsSync(envPath);
  console.log(`.env file exists: ${envExists}`);
  
  if (envExists) {
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      console.log('.env file content:');
      console.log(envContent);
    } catch (err) {
      console.log('Error reading .env file:', err.message);
    }
  }
  
  // Check process environment variables
  console.log('\nProcess environment variables:');
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL || 'Not set'}`);
  console.log(`SESSION_SECRET: ${process.env.SESSION_SECRET || 'Not set'}`);
  console.log(`PORT: ${process.env.PORT || 'Not set'}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
  
  console.log('===================================');
}

checkEnvVars();