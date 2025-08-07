// Environment variables test
console.log('🚀 Environment Variables Test');
console.log('============================');

console.log('PORT:', process.env.PORT || 'Not set (defaulting to 8080)');
console.log('SESSION_SECRET set:', !!process.env.SESSION_SECRET);
console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
console.log('STRIPE_SECRET_KEY set:', !!process.env.STRIPE_SECRET_KEY);

console.log('\n🎯 Environment variables test completed!');