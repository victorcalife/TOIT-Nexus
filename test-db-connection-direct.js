#!/usr/bin/env node

/**
 * Script para testar conexão direta com banco de dados Railway
 */

console.log('🔍 Testando conexão direta com banco de dados Railway...\n');

// Usar a URL que você forneceu diretamente
const DATABASE_URL = 'postgresql://postgres:foalaCypsSEvgsygpcDaySNcGiweMsmv@postgres.railway.internal:5432/railway';

console.log('🔧 Usando DATABASE_URL:');
console.log(DATABASE_URL);
console.log();

console.log('🔧 Verificando componentes da URL:');
const url = new URL(DATABASE_URL);
console.log('- Host:', url.hostname);
console.log('- Port:', url.port || '5432 (default)');
console.log('- Database:', url.pathname.substring(1));
console.log('- Username:', url.username);
console.log('- Password:', url.password ? 'DEFINIDA' : 'NÃO DEFINIDA');
console.log();

// Verificar se o pacote pg está instalado
try {
  const { Pool } = require('pg');
  console.log('✅ Pacote pg encontrado');
  
  // Criar pool de conexão com a URL fornecida
  console.log('🔧 Criando pool de conexão...');
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  
  console.log('🔧 Testando conexão com o banco de dados...');
  
  // Testar conexão
  pool.query('SELECT version()', (err, res) => {
    if (err) {
      console.error('❌ Erro ao conectar ao banco de dados:');
      console.error('   Mensagem:', err.message);
      console.error('   Código:', err.code);
      console.error('   Detalhes:', err);
      
      // Tentar conexão sem SSL
      console.log('\n🔧 Tentando conexão sem SSL...');
      const poolNoSSL = new Pool({
        connectionString: DATABASE_URL,
        ssl: false,
      });
      
      poolNoSSL.query('SELECT version()', (err2, res2) => {
        if (err2) {
          console.error('❌ Erro ao conectar ao banco de dados (sem SSL):');
          console.error('   Mensagem:', err2.message);
          console.error('   Código:', err2.code);
        } else {
          console.log('✅ Conexão bem-sucedida (sem SSL)!');
          console.log('   Versão do PostgreSQL:', res2.rows[0].version);
        }
        
        poolNoSSL.end();
      });
    } else {
      console.log('✅ Conexão bem-sucedida!');
      console.log('   Versão do PostgreSQL:', res.rows[0].version);
    }
    
    // Fechar pool
    pool.end();
  });
  
} catch (error) {
  console.error('❌ Erro ao importar pg:', error.message);
  console.log('\n🔧 Solução: Instale o pacote pg');
  console.log('   Execute: npm install pg');
}
