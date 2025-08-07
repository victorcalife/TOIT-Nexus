#!/usr/bin/env node

/**
 * Script para configurar banco de dados Railway
 * Executa migrations e inicializa dados básicos
 */

import { execSync } from 'child_process';

console.log('🗄️  Configurando banco de dados Railway...');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada!');
  console.error('Certifique-se de que o PostgreSQL está configurado na Railway');
  process.exit(1);
}

console.log('✅ DATABASE_URL encontrada');
console.log('🔗 Conectando ao PostgreSQL Railway...');

try {
  // Executar push do schema (cria tabelas)
  console.log('📋 Executando drizzle-kit push...');
  execSync('npx drizzle-kit push --config=drizzle.config.ts', { stdio: 'inherit' });
  
  console.log('✅ Tabelas criadas com sucesso!');
  console.log('🎉 Banco de dados configurado!');
  
} catch (error) {
  console.error('❌ Erro ao configurar banco:', error.message);
  console.error('Verifique:');
  console.error('- Se DATABASE_URL está correta');
  console.error('- Se PostgreSQL Railway está acessível');
  console.error('- Se as permissões estão corretas');
  process.exit(1);
}