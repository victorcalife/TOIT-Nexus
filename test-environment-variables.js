// Test script to verify Railway environment variables
console.log('=== Railway Environment Variables Test ===');
console.log('PORT:', process.env.PORT || 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET || 'Not set');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (value hidden for security)' : 'Not set');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set (value hidden for security)' : 'Not set');
console.log('RAILWAY_PUBLIC_DOMAIN:', process.env.RAILWAY_PUBLIC_DOMAIN || 'Not set');
console.log('RAILWAY_SERVICE_TOIT_NEXUS_BACKEND_URL:', process.env.RAILWAY_SERVICE_TOIT_NEXUS_BACKEND_URL || 'Not set');
console.log('RAILWAY_SERVICE_TOIT_NEXUS_FRONTEND_URL:', process.env.RAILWAY_SERVICE_TOIT_NEXUS_FRONTEND_URL || 'Not set');

// Check if API_URL is correctly set
if (process.env.API_URL === 'api.nexus.com.br') {
  console.log('⚠️  WARNING: API_URL is set to api.nexus.com.br but should be api.toit.com.br');
} else if (process.env.API_URL) {
  console.log('✅ API_URL is set to:', process.env.API_URL);
} else {
  console.log('⚠️  WARNING: API_URL is not set');
}

// Check if SESSION_SECRET is secure enough
if (process.env.SESSION_SECRET === 'meu segredo') {
  console.log('⚠️  WARNING: SESSION_SECRET is using a weak default value');
} else if (process.env.SESSION_SECRET) {
  console.log('✅ SESSION_SECRET is properly configured');
} else {
  console.log('⚠️  WARNING: SESSION_SECRET is not set');
}

console.log('=== Test Complete ===');