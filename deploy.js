#!/usr/bin/env node

/**
 * Deployment script for TOIT Nexus
 * Builds both frontend and backend, then starts the integrated server
 */

import { execSync } from 'child_process';

console.log('🚀 Iniciando deployment TOIT Nexus...');

try {
  // Build frontend
  console.log('🎨 Building frontend...');
  execSync('npm run client:build', { stdio: 'inherit' });
  console.log('✅ Frontend build completed');
  
  // Build backend
  console.log('⚙️  Building backend...');
  execSync('npm run server:build', { stdio: 'inherit' });
  console.log('✅ Backend build completed');
  
  // Setup database (if DATABASE_URL is available)
  if (process.env.DATABASE_URL) {
    console.log('🗄️  Setting up database...');
    execSync('npm run db:setup', { stdio: 'inherit' });
    console.log('✅ Database setup completed');
  } else {
    console.log('⚠️  DATABASE_URL not available, skipping database setup');
  }
  
  console.log('🎉 Deployment preparation completed!');
  console.log('🚀 Starting integrated server...');
  
} catch (error) {
  console.error('❌ Deployment error:', error.message);
  process.exit(1);
}