#!/usr/bin/env node

/**
 * Script para testar conexão direta com o banco de dados Railway
 * usando a URL fornecida diretamente (não via variável de ambiente)
 */

console.log('🔍 TESTANDO CONEXÃO DIRETA COM BANCO DE DADOS RAILWAY');
console.log('====================================================\n');

// Usar a URL fornecida diretamente, sem depender da variável de ambiente
const DIRECT_DATABASE_URL = 'postgresql://postgres:foalaCypsSEvgsygpcDaySNcGiweMsmv@postgres.railway.internal:5432/railway';

console.log('🔧 Usando DATABASE_URL fornecida diretamente:');
console.log('   postgresql://postgres:***@postgres.railway.internal:5432/railway\n');

try {
  const { Pool } = require('pg');
  console.log('✅ Pacote pg carregado com sucesso\n');
  
  // Criar pool com SSL configurado para Railway
  const pool = new Pool({
    connectionString: DIRECT_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  console.log('🔧 Tentando conectar ao banco de dados...');
  
  // Testar conexão com query simples
  pool.query('SELECT 1 as connection_test', (err, res) => {
    if (err) {
      console.log('❌ ERRO AO CONECTAR AO BANCO DE DADOS:');
      console.log('   Código:', err.code);
      console.log('   Mensagem:', err.message);
      console.log('   Detalhes:', err);
      
      // Tentar conexão sem SSL
      console.log('\n🔧 Tentando conexão sem SSL...');
      const poolNoSSL = new Pool({
        connectionString: DIRECT_DATABASE_URL,
        ssl: false
      });
      
      poolNoSSL.query('SELECT 1 as connection_test', (err2, res2) => {
        if (err2) {
          console.log('❌ ERRO AO CONECTAR (sem SSL):');
          console.log('   Código:', err2.code);
          console.log('   Mensagem:', err2.message);
        } else {
          console.log('✅ Conexão bem-sucedida (sem SSL)!');
          console.log('   Test result:', res2.rows[0].connection_test);
        }
        poolNoSSL.end();
      });
    } else {
      console.log('✅ CONEXÃO BEM-SUCEDIDA!');
      console.log('   Test result:', res.rows[0].connection_test);
    }
    
    pool.end();
  });
  
} catch (error) {
  console.log('❌ ERRO AO CARREGAR PACOTE pg:');
  console.log('   Mensagem:', error.message);
  console.log('   Stack:', error.stack);
}

console.log('\n📋 Se esta conexão funcionar mas a via variável de ambiente não,');
console.log('   então o problema é que DATABASE_URL não está acessível no Railway.');
