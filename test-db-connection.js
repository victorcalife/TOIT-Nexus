import { execSync } from 'child_process';

console.log('Testing database connection...');

try {
  // Test if DATABASE_URL environment variable is accessible
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL environment variable is not set');
    process.exit(1);
  } else {
    console.log('DATABASE_URL is set');
  }

  // Test drizzle-kit push command directly
  console.log('Running drizzle-kit push command...');
  execSync('npx drizzle-kit push --config=drizzle.config.ts', { stdio: 'inherit' });
  
  console.log('Database push completed successfully');
  process.exit(0);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}