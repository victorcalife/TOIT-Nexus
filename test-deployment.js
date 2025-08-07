// Test script to verify Railway deployment
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Simple test endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'TOIT Nexus Deployment Test', 
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'TOIT Nexus Test',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
});