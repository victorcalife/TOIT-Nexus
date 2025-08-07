const fs = require('fs');
const path = require('path');

// Write output to a file instead of console
const outputPath = path.join(__dirname, 'diagnostic-output.txt');
let output = '';

output += '=== TOIT Nexus Diagnostic Output ===\n\n';
output += 'Project Structure Check:\n';
output += '========================\n';

const dirs = ['client', 'server', 'shared', 'drizzle', 'scripts'];
dirs.forEach(dir => {
  const exists = fs.existsSync(path.join(__dirname, dir));
  output += `${exists ? '✅' : '❌'} ${dir}: ${exists ? 'FOUND' : 'MISSING'}\n`;
});

output += '\nCritical Files Check:\n';
output += '=====================\n';

const files = [
  'package.json',
  'railway.json',
  'drizzle.config.ts',
  'railway-frontend.js',
  'nexus-quantum-landing.html'
];
files.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  output += `${exists ? '✅' : '❌'} ${file}: ${exists ? 'FOUND' : 'MISSING'}\n`;
});

output += '\nEnvironment Variables Check:\n';
output += '============================\n';
output += `DATABASE_URL: ${process.env.DATABASE_URL ? 'DEFINED' : 'NOT DEFINED'}\n`;
output += `SESSION_SECRET: ${process.env.SESSION_SECRET ? 'DEFINED' : 'NOT DEFINED'}\n`;
output += `PORT: ${process.env.PORT ? 'DEFINED' : 'NOT DEFINED'}\n`;

output += '\n=== Diagnostic Complete ===\n';

fs.writeFileSync(outputPath, output);
console.log('Diagnostic output written to:', outputPath);