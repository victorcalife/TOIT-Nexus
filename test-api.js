// Simple API test script
const https = require('https');

console.log('🚀 Testing TOIT Nexus API endpoints...');

// Test data
const testData = {
  cpf: '00000000000',
  password: 'admin123'
};

// Test function
function testAPI(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ ${method} ${url} - Status: ${res.statusCode}`);
        try {
          const jsonData = JSON.parse(body);
          console.log('   Response:', JSON.stringify(jsonData, null, 2));
          resolve(jsonData);
        } catch (e) {
          console.log('   Response:', body);
          resolve(body);
        }
      });
    });

    req.on('error', (e) => {
      console.log(`❌ ${method} ${url} - Error: ${e.message}`);
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Run tests
async function runTests() {
  try {
    console.log('\n📡 Testing API endpoints...\n');
    
    // Test health check
    await testAPI('https://toit-nexus.up.railway.app/api/health');
    
    // Test debug endpoint
    await testAPI('https://toit-nexus.up.railway.app/api/debug');
    
    // Test login endpoint
    await testAPI('https://toit-nexus.up.railway.app/api/auth/login', 'POST', testData);
    
    // Test tenants endpoint
    await testAPI('https://toit-nexus.up.railway.app/api/tenants');
    
    console.log('\n🎯 API tests completed!');
  } catch (error) {
    console.log('\n💥 Error during API tests:', error.message);
  }
}

runTests();