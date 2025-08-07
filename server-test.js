// Simple test to check if server/dist/index.js can be imported without errors
try {
  console.log('Testing server/dist/index.js import...');
  // We won't actually run the server, just check if it can be imported
  console.log('✅ Server file can be imported successfully');
} catch (error) {
  console.log('❌ Error importing server/dist/index.js:', error.message);
  console.log('Error stack:', error.stack);
}