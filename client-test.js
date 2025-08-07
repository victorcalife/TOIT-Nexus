const http = require('http');

// Function to test if server is running
function testServer(port, path, callback) {
  const options = {
    hostname: 'localhost',
    port: port,
    path: path,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    callback(null, { statusCode: res.statusCode, headers: res.headers });
  });

  req.on('error', (error) => {
    callback(error, null);
  });

  req.end();
}

// Test different endpoints
console.log('Testing if server is running on port 8080...');

testServer(8080, '/api/health', (error, result) => {
  if (error) {
    console.log('Server test result: Server is not running on port 8080');
    console.log('Error details:', error.message);
  } else {
    console.log('Server test result: Server is running on port 8080');
    console.log('Status code:', result.statusCode);
    console.log('Headers:', result.headers);
  }
});