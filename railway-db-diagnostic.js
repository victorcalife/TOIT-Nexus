#!/usr/bin/env node

/**
 * Script de diagnóstico para conexão Railway PostgreSQL
 */

console.log('🔍 DIAGNÓSTICO - CONEXÃO RAILWAY POSTGRESQL');
console.log('==========================================\n');

// Verificar se estamos em ambiente Railway
const isRailway = !!process.env.RAILWAY_PROJECT_ID;
console.log('🔧 Ambiente Railway detectado:', isRailway ? '✅ SIM' : '❌ NÃO');

if (isRailway) {
  console.log('   Railway Project ID:', process.env.RAILWAY_PROJECT_ID || '❌ NÃO DEFINIDO');
  console.log('   Railway Service ID:', process.env.RAILWAY_SERVICE_ID || '❌ NÃO DEFINIDO');
  console.log('   Railway Environment:', process.env.RAILWAY_ENVIRONMENT_NAME || '❌ NÃO DEFINIDO');
}

// Verificar variáveis de ambiente críticas
console.log('\n📋 VARIÁVEIS DE AMBIENTE CRÍTICAS:');
console.log('----------------------------------');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ DEFINIDA' : '❌ NÃO DEFINIDA');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ DEFINIDA' : '❌ NÃO DEFINIDA');
console.log('PORT:', process.env.PORT || '8080 (default)');

// Se DATABASE_URL estiver definida, verificar seu formato
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log('\n🔧 COMPONENTES DA DATABASE_URL:');
    console.log('   Protocolo:', url.protocol);
    console.log('   Usuário:', url.username ? '✅ DEFINIDO' : '❌ NÃO DEFINIDO');
    console.log('   Senha:', url.password ? '✅ DEFINIDA' : '❌ NÃO DEFINIDA');
    console.log('   Host:', url.hostname);
    console.log('   Porta:', url.port || '5432 (default)');
    console.log('   Banco:', url.pathname.substring(1));
    
    const isRailwayDb = process.env.DATABASE_URL.includes('railway.internal');
    console.log('   Banco Railway:', isRailwayDb ? '✅ SIM' : '❌ NÃO');
  } catch (error) {
    console.log('❌ Erro ao parsear DATABASE_URL:', error.message);
  }
}

// Testar conexão com o banco de dados
console.log('\n🔌 TESTE DE CONEXÃO COM BANCO DE DADOS:');
console.log('---------------------------------------');

try {
  const { Pool } = require('pg');
  console.log('✅ Pacote pg carregado com sucesso');
  
  // Usar DATABASE_URL do ambiente ou uma padrão
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:foalaCypsSEvgsygpcDaySNcGiweMsmv@postgres.railway.internal:5432/railway';
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('railway') ? { rejectUnauthorized: false } : false,
  });
  
  console.log('✅ Pool de conexão criado');
  
  // Testar conexão simples
  pool.query('SELECT 1 as test', (err, res) => {
    if (err) {
      console.log('❌ Erro no teste de conexão:');
      console.log('   Mensagem:', err.message);
      console.log('   Código:', err.code);
      
      // Se estivermos em ambiente Railway, mostrar erro detalhado
      if (isRailway) {
        console.log('\n🚨 PROBLEMA CRÍTICO:');
        console.log('   Em ambiente Railway, mas DATABASE_URL não está acessível');
        console.log('   Verifique se o serviço PostgreSQL foi adicionado ao projeto');
      }
    } else {
      console.log('✅ Teste de conexão bem-sucedido!');
      console.log('   Resultado:', res.rows[0].test);
    }
    
    pool.end();
  });
  
} catch (error) {
  console.log('❌ Erro ao carregar pg ou criar pool:', error.message);
  
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('🔧 Solução: Instale o pacote pg');
    console.log('   Execute: npm install pg');
  }
}

console.log('\n📋 INSTRUÇÕES PARA RESOLVER:');
console.log('============================');

console.log('\n🔧 Se estiver executando localmente:');
console.log('   1. Certifique-se de que o pacote pg está instalado');
console.log('   2. Configure as variáveis de ambiente manualmente');
console.log('   3. Execute: npm install pg');

console.log('\n🔧 Se estiver executando no Railway:');
console.log('   1. Acesse o painel do Railway');
console.log('   2. Vá para Settings → Variables');
console.log('   3. Adicione estas variáveis:');
console.log('      - DATABASE_URL: postgresql://postgres:foalaCypsSEvgsygpcDaySNcGiweMsmv@postgres.railway.internal:5432/railway');
console.log('      - SESSION_SECRET: toit-nexus-session-secret-2025');
console.log('   4. Certifique-se de que o serviço PostgreSQL foi adicionado');
console.log('   5. Redeploy sua aplicação');

console.log('\n🔧 Comandos para executar após configuração:');
console.log('   railway run npm run db:push');
console.log('   railway run npm run db:setup\n');
