// Test if express can be imported and used
try {
  const express = require('express');
  console.log('Express imported successfully');
  
  const app = express();
  console.log('Express app created successfully');
  
  app.get('/', (req, res) => {
    res.send('Express working');
  });
  
  console.log('Route defined successfully');
  console.log('Express test completed successfully');
} catch (error) {
  console.log('Error in express test:', error.message);
}