const http = require('http');

const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url} from ${req.headers.host}`);
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <h1>TOIT NEXUS - Basic HTTP Server</h1>
    <p>Server is running successfully!</p>
    <p>Port: ${port}</p>
    <p>Timestamp: ${new Date().toISOString()}</p>
    <p>Host: ${req.headers.host}</p>
    <p>URL: ${req.url}</p>
  `);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Basic HTTP server running on port ${port}`);
  console.log(`Process PID: ${process.pid}`);
  console.log(`Node version: ${process.version}`);
});