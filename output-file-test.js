#!/usr/bin/env node

import { writeFileSync } from 'fs';

console.log('=== Output File Test ===');
console.log('Writing output to test-output.txt');

// Write to file instead of console
const output = `
Output File Test Results:
========================

Environment Variables:
DATABASE_URL: ${process.env.DATABASE_URL || 'NOT SET'}
NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}
RAILWAY_PROJECT_ID: ${process.env.RAILWAY_PROJECT_ID || 'NOT SET'}
RAILWAY_SERVICE_NAME: ${process.env.RAILWAY_SERVICE_NAME || 'NOT SET'}

Current Time: ${new Date().toISOString()}
`;

writeFileSync('test-output.txt', output);

console.log('✅ Output written to test-output.txt');
console.log('=== Output File Test Complete ===');