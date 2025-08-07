const http = require('http');

console.log('Testing server access...');

// Test health endpoint
const healthOptions = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/health',
  method: 'GET'
};

const healthReq = http.request(healthOptions, healthRes => {
  console.log(`Health check status code: ${healthRes.statusCode}`);
  
  healthRes.on('data', d => {
    console.log('Health check response:');
    console.log(d.toString());
  });
});

healthReq.on('error', error => {
  console.log('Health check error:', error.message);
});

healthReq.end();

// Test root endpoint
const rootOptions = {
  hostname: 'localhost',
  port: 8080,
  path: '/',
  method: 'GET'
};

const rootReq = http.request(rootOptions, rootRes => {
  console.log(`Root endpoint status code: ${rootRes.statusCode}`);
  
  rootRes.on('data', d => {
    console.log('Root endpoint response length:', d.length);
  });
});

rootReq.on('error', error => {
  console.log('Root endpoint error:', error.message);
});

rootReq.end();