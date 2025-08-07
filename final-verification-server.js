const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

// Log startup information
console.log('🚀 TOIT Nexus Final Verification Server Starting...');
console.log('   Port:', port);
console.log('   Current Directory:', __dirname);
console.log('   Process PID:', process.pid);

// Simple route for the main page
app.get('/', (req, res) => {
  console.log(`[${new Date().toISOString()}] GET / from ${req.get('host')}`);
  res.send(`
    <html>
      <head>
        <title>TOIT Nexus - Final Verification</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #2c3e50; }
          .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
          .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
          .warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
          .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
          ul { line-height: 1.6; }
          a { color: #3498db; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>TOIT Nexus - Final Verification Server</h1>
          <div class="status success">
            <strong>✅ Server is running successfully!</strong>
          </div>
          
          <div class="status info">
            <h2>Deployment Information</h2>
            <ul>
              <li><strong>Port:</strong> ${port}</li>
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
              <li><strong>Host:</strong> ${req.get('host')}</li>
              <li><strong>Process PID:</strong> ${process.pid}</li>
              <li><strong>Node Version:</strong> ${process.version}</li>
            </ul>
          </div>
          
          <div class="status info">
            <h2>File System Check</h2>
            <ul>
              <li><strong>Current Directory:</strong> ${__dirname}</li>
              <li><strong>Landing Page Exists:</strong> ${fs.existsSync(path.join(__dirname, 'nexus-quantum-landing.html')) ? '✅ Yes' : '❌ No'}</li>
              <li><strong>Client Dist Exists:</strong> ${fs.existsSync(path.join(__dirname, 'client', 'dist')) ? '✅ Yes' : '❌ No'}</li>
              <li><strong>Server Dist Exists:</strong> ${fs.existsSync(path.join(__dirname, 'server', 'dist')) ? '✅ Yes' : '❌ No'}</li>
            </ul>
          </div>
          
          <div class="status info">
            <h2>Environment Variables</h2>
            <ul>
              <li><strong>PORT:</strong> ${process.env.PORT ? `✅ ${process.env.PORT}` : '❌ Not Set'}</li>
              <li><strong>SESSION_SECRET:</strong> ${process.env.SESSION_SECRET ? '✅ Set' : '❌ Not Set'}</li>
              <li><strong>DATABASE_URL:</strong> ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not Set'}</li>
            </ul>
          </div>
          
          <div class="status warning">
            <h2>Next Steps</h2>
            <ul>
              <li>Configure <code>STRIPE_SECRET_KEY</code> in Railway dashboard</li>
              <li>Run database migrations with <code>railway run npm run db:push</code></li>
              <li>Test all backend APIs</li>
              <li>Verify React SPA functionality</li>
            </ul>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /api/health from ${req.get('host')}`);
  res.json({ 
    status: 'ok', 
    service: 'TOIT Nexus Final Verification Server',
    timestamp: new Date().toISOString(),
    port: port,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server with explicit binding to 0.0.0.0
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 TOIT Nexus Final Verification Server is running on port ${port}`);
  console.log(`   Access URL: http://localhost:${port}`);
  console.log(`   Health Check: http://localhost:${port}/api/health`);
});