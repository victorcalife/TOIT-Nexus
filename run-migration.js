// Script para executar migração de banco de dados
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

console.log('🔄 Iniciando migração do banco de dados...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'NÃO CONFIGURADA');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não está configurada!');
  process.exit(1);
}

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  try {
    // Ler o arquivo SQL
    const sql = fs.readFileSync('./database/03-adicionar-cpf-users.sql', 'utf8');
    
    console.log('📄 Arquivo SQL carregado com sucesso');
    
    // Executar a migração
    const result = await pool.query(sql);
    
    console.log('✅ Migração executada com sucesso!');
    console.log('📊 Resultado:', result.rowCount || 'Comando executado');
    
    // Verificar se a coluna foi adicionada
    const checkResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'cpf'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Coluna CPF adicionada com sucesso!');
      console.log('📋 Detalhes:', checkResult.rows[0]);
    } else {
      console.log('⚠️  Coluna CPF não encontrada após migração');
    }
    
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    
    // Se o erro for de coluna já existente, isso é OK
    if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
      console.log('ℹ️  Coluna CPF já existe - migração não necessária');
    } else {
      process.exit(1);
    }
  } finally {
    await pool.end();
    console.log('🔚 Conexão com banco encerrada');
  }
}

runMigration();