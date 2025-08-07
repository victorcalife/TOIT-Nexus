try {
  console.log('Starting TOIT Nexus server...');
  require('./railway-frontend.js');
  console.log('Server started successfully');
} catch (error) {
  console.error('Error starting server:', error.message);
  console.error('Stack trace:', error.stack);
}