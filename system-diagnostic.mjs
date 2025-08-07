import fs from 'fs';
import path from 'path';

// Function to write diagnostic results to a file
function writeDiagnosticToFile() {
  const results = [];
  
  results.push('=== TOIT Nexus System Diagnostic ===\n');
  
  // Check current working directory
  results.push('Current Working Directory:');
  results.push(process.cwd() + '\n');
  
  // Check project structure
  results.push('Project Structure Check:');
  const requiredDirs = ['client', 'server', 'shared', 'drizzle', 'scripts'];
  requiredDirs.forEach(dir => {
    const exists = fs.existsSync(path.join(process.cwd(), dir));
    results.push(`  ${exists ? '✅' : '❌'} ${dir}: ${exists ? 'FOUND' : 'MISSING'}`);
  });
  
  results.push('\nCritical Files Check:');
  const criticalFiles = [
    'package.json',
    'railway.json',
    'drizzle.config.ts',
    'railway-frontend.js',
    'nexus-quantum-landing.html'
  ];
  criticalFiles.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    results.push(`  ${exists ? '✅' : '❌'} ${file}: ${exists ? 'FOUND' : 'MISSING'}`);
  });
  
  // Check environment variables
  results.push('\nEnvironment Variables Check:');
  results.push(`  DATABASE_URL: ${process.env.DATABASE_URL ? 'DEFINED' : 'NOT DEFINED'}`);
  results.push(`  SESSION_SECRET: ${process.env.SESSION_SECRET ? 'DEFINED' : 'NOT DEFINED'}`);
  results.push(`  PORT: ${process.env.PORT ? 'DEFINED' : 'NOT DEFINED'}`);
  results.push(`  NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
  
  // Write results to file
  const outputPath = path.join(process.cwd(), 'system-diagnostic-results.txt');
  fs.writeFileSync(outputPath, results.join('\n'));
  
  console.log('Diagnostic complete. Results written to:', outputPath);
  return outputPath;
}

// Run the diagnostic
const outputPath = writeDiagnosticToFile();
console.log('Diagnostic results saved to:', outputPath);