const http = require('http');

// Get port from environment or default to 8080
const port = process.env.PORT || 8080;

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Log the request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} from ${req.headers.host}`);
  
  // Send a response
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head><title>TOIT NEXUS - Explicit Server</title></head>
      <body>
        <h1>TOIT NEXUS - Explicit Server</h1>
        <p>Server is running successfully!</p>
        <ul>
          <li><strong>Port:</strong> ${port}</li>
          <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
          <li><strong>Host:</strong> ${req.headers.host}</li>
          <li><strong>URL:</strong> ${req.url}</li>
          <li><strong>Method:</strong> ${req.method}</li>
        </ul>
      </body>
    </html>
  `);
});

// Listen on all interfaces
server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 TOIT NEXUS Explicit Server running on port ${port}`);
  console.log(`   Process PID: ${process.pid}`);
  console.log(`   Node version: ${process.version}`);
  console.log(`   Platform: ${process.platform}`);
  
  // Also listen for errors
  server.on('error', (error) => {
    console.error('Server error:', error);
  });
});

// Handle process signals
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});