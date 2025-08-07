#!/usr/bin/env node

/**
 * Script para testar conexão com banco de dados Railway
 * Este script deve ser executado com railway run
 */

console.log('=== Railway Database Connection Test ===');

// Verificar variáveis de ambiente do Railway
console.log('PORT:', process.env.PORT || 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');

// DATABASE_URL é definida automaticamente pelo serviço PostgreSQL da Railway
if (!process.env.DATABASE_URL) {
  console.log('❌ DATABASE_URL não está definida');
  console.log('Certifique-se de executar este script com "railway run node railway-db-test.js"');
  process.exit(1);
} else {
  console.log('✅ DATABASE_URL está definida');
  console.log('URL length:', process.env.DATABASE_URL.length);
  
  // Não mostrar a URL completa por segurança
  const urlParts = process.env.DATABASE_URL.split('@');
  if (urlParts.length > 1) {
    const hostPart = urlParts[1].split('/')[0];
    console.log('Database host:', hostPart);
  }
}

// Testar drizzle-kit push
import { execSync } from 'child_process';

try {
  console.log('🚀 Executando drizzle-kit push...');
  execSync('npx drizzle-kit push --config=drizzle.config.ts', { 
    stdio: 'inherit'
  });
  
  console.log('✅ Drizzle-kit push executado com sucesso!');
  
} catch (error) {
  console.log('❌ Erro ao executar drizzle-kit push:');
  console.log('Exit code:', error.status);
  console.log('Error message:', error.message);
  console.log('Stdout:', error.stdout ? error.stdout.toString() : 'None');
  console.log('Stderr:', error.stderr ? error.stderr.toString() : 'None');
  process.exit(1);
}