console.log('=== TOIT Nexus Simple Check ===');
console.log('Current working directory:', process.cwd());
console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL);
console.log('SESSION_SECRET defined:', !!process.env.SESSION_SECRET);
console.log('PORT defined:', !!process.env.PORT);
console.log('================================');
