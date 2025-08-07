#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Testing drizzle-kit with full schema path...');

try {
  // Run drizzle-kit push with full path to schema
  const schemaPath = path.join(__dirname, 'shared', 'schema.ts');
  const outputPath = path.join(__dirname, 'drizzle');
  
  console.log('Schema path:', schemaPath);
  console.log('Output path:', outputPath);
  
  const command = `npx drizzle-kit push --dialect=postgresql --schema=${schemaPath} --out=${outputPath}`;
  console.log('Running command:', command);
  
  const output = execSync(command, { 
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('Drizzle-kit push completed successfully');
} catch (error) {
  console.error('Error running drizzle-kit push:', error.message);
  if (error.stdout) console.log('stdout:', error.stdout.toString());
  if (error.stderr) console.log('stderr:', error.stderr.toString());
}