const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// Serve static files from current directory
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.send(`
    <h1>TOIT NEXUS - Static Server Test</h1>
    <p>Server is running on port ${port}</p>
    <p>Timestamp: ${new Date().toISOString()}</p>
  `);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Static server running on port ${port}`);
  console.log(`Current directory: ${__dirname}`);
});