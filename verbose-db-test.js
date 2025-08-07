import { execSync } from 'child_process';

console.log('=== Verbose Database Test ===');

// Check if DATABASE_URL is set
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
if (process.env.DATABASE_URL) {
  console.log('Database URL length:', process.env.DATABASE_URL.length);
}

// Check current directory
console.log('Current directory:', process.cwd());

// Check if drizzle.config.ts exists
import { existsSync } from 'fs';
console.log('drizzle.config.ts exists:', existsSync('./drizzle.config.ts'));

// Try to run drizzle-kit with verbose output
try {
  console.log('Running drizzle-kit push...');
  const output = execSync('npx drizzle-kit push --config=drizzle.config.ts', { 
    stdio: 'pipe',
    encoding: 'utf-8'
  });
  console.log('Output:', output);
  console.log('Database push completed');
} catch (error) {
  console.log('Error occurred:');
  console.log('Exit code:', error.status);
  console.log('Stdout:', error.stdout ? error.stdout.toString() : 'None');
  console.log('Stderr:', error.stderr ? error.stderr.toString() : 'None');
  console.log('Error message:', error.message);
}