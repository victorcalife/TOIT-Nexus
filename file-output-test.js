import fs from 'fs';

console.log('Writing test output to file...');

const output = `
=== TOIT Nexus File Output Test ===
Timestamp: ${new Date().toISOString()}
Current directory: ${process.cwd()}
Environment variables count: ${Object.keys(process.env).length}
Test completed successfully
`;

fs.writeFileSync('test-output.txt', output);

console.log('Test output written to test-output.txt');