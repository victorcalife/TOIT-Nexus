import { writeFileSync } from 'fs';

// Diagnostic script to check environment and write to file
const diagnosticInfo = [];

diagnosticInfo.push('=== TOIT Nexus Diagnostic Report ===');
diagnosticInfo.push(new Date().toISOString());
diagnosticInfo.push('');

// Check if we're in Railway environment
diagnosticInfo.push('RAILWAY_PROJECT_ID: ' + (process.env.RAILWAY_PROJECT_ID || 'NOT SET'));
diagnosticInfo.push('RAILWAY_SERVICE_NAME: ' + (process.env.RAILWAY_SERVICE_NAME || 'NOT SET'));

// Check database URL
diagnosticInfo.push('DATABASE_URL present: ' + !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  diagnosticInfo.push('DATABASE_URL length: ' + process.env.DATABASE_URL.length);
  diagnosticInfo.push('DATABASE_URL sample: ' + process.env.DATABASE_URL.substring(0, 50) + '...');
}

// Check other environment variables
diagnosticInfo.push('NODE_ENV: ' + (process.env.NODE_ENV || 'NOT SET'));
diagnosticInfo.push('PORT: ' + (process.env.PORT || 'NOT SET'));

// Write to file
writeFileSync('diagnostic-report.txt', diagnosticInfo.join('\n'));

console.log('Diagnostic report written to diagnostic-report.txt');