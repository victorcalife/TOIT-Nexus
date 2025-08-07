#!/usr/bin/env node

/**
 * Script para corrigir as migrações do banco de dados
 * Este script irá:
 * 1. Verificar se DATABASE_URL está definida
 * 2. Executar drizzle-kit push com a configuração correta
 * 3. Criar tabelas no banco de dados Railway
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 CORRIGINDO MIGRAÇÕES DO BANCO DE DADOS');
console.log('========================================\n');

// Verificar se drizzle.config.ts existe
const drizzleConfigPath = path.join(process.cwd(), 'drizzle.config.ts');
if (!fs.existsSync(drizzleConfigPath)) {
  console.error('❌ drizzle.config.ts não encontrado!');
  process.exit(1);
}

console.log('✅ drizzle.config.ts encontrado');

// Verificar DATABASE_URL
console.log('\n🔧 Verificando DATABASE_URL...');
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL não está definida localmente');
  console.warn('   Isso é esperado se estiver rodando no Railway');
} else {
  console.log('✅ DATABASE_URL encontrada localmente');
  console.log('   Length:', process.env.DATABASE_URL.length);
  console.log('   Preview:', process.env.DATABASE_URL.substring(0, 50) + (process.env.DATABASE_URL.length > 50 ? '...' : ''));
}

// Tentar executar drizzle-kit push
console.log('\n🔧 Executando drizzle-kit push...');
try {
  execSync('npx drizzle-kit push --config=drizzle.config.ts', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ drizzle-kit push executado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao executar drizzle-kit push:', error.message);
  console.log('\n🔧 Tentando executar drizzle-kit push com configuração explícita...');
  
  // Tentar com comando mais explícito
  try {
    execSync('npx drizzle-kit push --dialect=postgresql --schema=./shared/schema.ts', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('✅ drizzle-kit push executado com sucesso usando configuração explícita!');
  } catch (error2) {
    console.error('❌ Erro ao executar drizzle-kit push com configuração explícita:', error2.message);
    process.exit(1);
  }
}

console.log('\n🎉 Processo de migração concluído!');
console.log('\n📋 Próximos passos:');
console.log('   1. Verifique se as tabelas foram criadas no banco de dados');
console.log('   2. Execute o script de setup do banco de dados se necessário');
console.log('   3. Faça deploy para o Railway com "railway up"');
