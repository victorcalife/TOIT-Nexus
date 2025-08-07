#!/usr/bin/env node

/**
 * Script para testar conexão direta com o banco de dados Railway
 * usando a URL fornecida
 */

console.log('🔍 TESTANDO CONEXÃO DIRETA COM BANCO DE DADOS RAILWAY');
console.log('====================================================\n');

// Usar a URL fornecida diretamente
const DATABASE_URL = 'postgresql://postgres:foalaCypsSEvgsygpcDaySNcGiweMsmv@postgres.railway.internal:5432/railway';

console.log('🔧 Usando DATABASE_URL fornecida:');
console.log('   postgresql://postgres:***@postgres.railway.internal:5432/railway\n');

try {
  const { Pool } = require('pg');
  console.log('✅ Pacote pg carregado com sucesso\n');
  
  // Criar pool com SSL configurado para Railway
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  console.log('🔧 Tentando conectar ao banco de dados...');
  
  // Testar conexão
  pool.query('SELECT version()', (err, res) => {
    if (err) {
      console.log('❌ ERRO AO CONECTAR AO BANCO DE DADOS:');
      console.log('   Código:', err.code);
      console.log('   Mensagem:', err.message);
      console.log('   Detalhes:', err);
      
      // Tentar conexão sem SSL
      console.log('\n🔧 Tentando conexão sem SSL...');
      const poolNoSSL = new Pool({
        connectionString: DATABASE_URL,
        ssl: false
      });
      
      poolNoSSL.query('SELECT version()', (err2, res2) => {
        if (err2) {
          console.log('❌ ERRO AO CONECTAR (sem SSL):');
          console.log('   Código:', err2.code);
          console.log('   Mensagem:', err2.message);
        } else {
          console.log('✅ Conexão bem-sucedida (sem SSL)!');
          console.log('   Versão PostgreSQL:', res2.rows[0].version);
        }
        poolNoSSL.end();
      });
    } else {
      console.log('✅ CONEXÃO BEM-SUCEDIDA!');
      console.log('   Versão PostgreSQL:', res.rows[0].version);
    }
    
    pool.end();
  });
  
} catch (error) {
  console.log('❌ ERRO AO CARREGAR PACOTE pg:');
  console.log('   Mensagem:', error.message);
  console.log('   Stack:', error.stack);
}
