#!/usr/bin/env node

console.log('=== Drizzle Kit API Test ===');

try {
  // Try to import drizzle-kit programmatically
  import('drizzle-kit').then((module) => {
    console.log('✅ Drizzle Kit imported successfully');
    console.log('Available methods:', Object.keys(module));
    
    // Try to access the push method
    if (module.push) {
      console.log('✅ Push method available');
    } else {
      console.log('❌ Push method not available');
    }
    
    // Try to access the cli method
    if (module.cli) {
      console.log('✅ CLI method available');
    } else {
      console.log('❌ CLI method not available');
    }
  }).catch((error) => {
    console.log('❌ Error importing drizzle-kit:', error.message);
  });
} catch (error) {
  console.log('❌ Error importing drizzle-kit:', error.message);
}

console.log('=== Test Complete ===');