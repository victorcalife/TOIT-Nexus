#!/usr/bin/env node

/**
 * Script de diagnóstico detalhado para Railway
 */

console.log('🔍 DIAGNÓSTICO DETALHADO - RAILWAY');
console.log('==================================\n');

// Verificar todas as variáveis de ambiente
console.log('📋 TODAS AS VARIÁVEIS DE AMBIENTE:');
console.log('==================================');
Object.keys(process.env).forEach(key => {
  if (key.includes('RAILWAY') || key.includes('DATABASE') || key.includes('PORT') || key.includes('SESSION')) {
    console.log(`${key}: ${process.env[key]}`);
  }
});

console.log('\n🔧 INFORMAÇÕES ESPECÍFICAS:');
console.log('==========================');

// Verificar Railway project info
console.log('Railway Project ID:', process.env.RAILWAY_PROJECT_ID || 'NÃO ENCONTRADO');
console.log('Railway Service Name:', process.env.RAILWAY_SERVICE_NAME || 'NÃO ENCONTRADO');
console.log('Railway Environment Name:', process.env.RAILWAY_ENVIRONMENT_NAME || 'NÃO ENCONTRADO');

// Verificar variáveis críticas
console.log('\n🔐 VARIÁVEIS CRÍTICAS:');
console.log('=====================');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'DEFINIDA' : '❌ NÃO DEFINIDA');
console.log('PORT:', process.env.PORT || 'NÃO DEFINIDA (usando padrão)');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? 'DEFINIDA' : '❌ NÃO DEFINIDA');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NÃO DEFINIDA (usando padrão)');

// Verificar se está em ambiente Railway
const isRailway = !!process.env.RAILWAY_PROJECT_ID || !!process.env.RAILWAY_SERVICE_NAME;
console.log('\n📍 AMBIENTE:');
console.log('=============');
console.log('Executando em Railway:', isRailway ? '✅ SIM' : '❌ NÃO');

if (!process.env.DATABASE_URL) {
  console.log('\n⚠️  ALERTA CRÍTICO:');
  console.log('==================');
  console.log('DATABASE_URL não está definida!');
  console.log('Isso causará erros de conexão com o banco de dados.');
  console.log('\nSOLUÇÃO:');
  console.log('1. Acesse o painel do Railway');
  console.log('2. Verifique se o serviço PostgreSQL está adicionado ao projeto');
  console.log('3. Na aba "Variables", adicione DATABASE_URL com o valor fornecido pelo Railway');
}

console.log('\n🔧 DIAGNÓSTICO COMPLETO');
console.log('=======================');
