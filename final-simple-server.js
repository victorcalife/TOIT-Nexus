const http = require('http');
const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      service: 'TOIT NEXUS Simple Server',
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>TOIT NEXUS - Simple Server</h1>
      <p>Server is running successfully!</p>
      <p>Port: ${port}</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
      <p><a href="/api/health">Health Check</a></p>
    `);
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Final simple server running on port ${port}`);
  console.log(`URL: http://localhost:${port}`);
  console.log(`Health: http://localhost:${port}/api/health`);
});