const express = require('express');
const path = require('path');
const fs = require('fs');

// Write to a file instead of console to bypass terminal issues
const logFile = path.join(__dirname, 'server-startup.log');
fs.writeFileSync(logFile, 'Starting TOIT Nexus Server...\n');

const app = express();
const port = process.env.PORT || 8080;

// Health check endpoint
app.get('/api/health', (req, res) => {
  fs.appendFileSync(logFile, 'Health check endpoint accessed\n');
  res.json({
    status: 'ok',
    message: 'TOIT Nexus server is running',
    port: port,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  const host = req.get('host') || 'localhost';
  fs.appendFileSync(logFile, `Root endpoint accessed with host: ${host}\n`);
  
  // Serve landing page for all requests
  const landingPath = path.join(__dirname, 'nexus-quantum-landing.html');
  if (fs.existsSync(landingPath)) {
    fs.appendFileSync(logFile, 'Serving landing page\n');
    return res.sendFile(landingPath);
  } else {
    fs.appendFileSync(logFile, 'Landing page not found\n');
    return res.status(404).send('Landing page not found');
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  const startupMessage = `🚀 TOIT NEXUS SERVER - SUCCESSFULLY STARTED\n🌐 Server running on port: ${port}\n`;
  fs.appendFileSync(logFile, startupMessage);
});

// Error handling
app.use((err, req, res, next) => {
  fs.appendFileSync(logFile, `Error occurred: ${err.message}\n`);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});