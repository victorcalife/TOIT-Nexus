/**
 * MIGRAÇÃO PARA ADICIONAR COLUNA DATA À TABELA USER_SESSIONS
 * Usando a mesma estrutura do database-config.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do pool de conexões (igual ao database-config.js)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/toit_nexus',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function runMigration() {
  console.log('🚀 Iniciando migração para adicionar coluna data à tabela user_sessions...');
  
  try {
    // Verificar se a tabela user_sessions existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_sessions'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Tabela user_sessions não existe. Criando tabela...');
      
      // Criar a tabela user_sessions se não existir
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          session_token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          data JSON,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);
      
      console.log('✅ Tabela user_sessions criada com coluna data');
    } else {
      console.log('✅ Tabela user_sessions existe');
      
      // Verificar se a coluna data já existe
      const columnCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'user_sessions' 
          AND column_name = 'data'
        );
      `);
      
      if (!columnCheck.rows[0].exists) {
        console.log('📝 Adicionando coluna data à tabela user_sessions...');
        
        // Adicionar a coluna data
        await pool.query(`
          ALTER TABLE user_sessions 
          ADD COLUMN data JSON;
        `);
        
        console.log('✅ Coluna data adicionada com sucesso');
      } else {
        console.log('ℹ️ Coluna data já existe na tabela user_sessions');
      }
    }
    
    // Criar índices se não existirem
    console.log('📝 Criando índices...');
    
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
        ON user_sessions(user_id);
      `);
      console.log('✅ Índice idx_user_sessions_user_id criado');
    } catch (error) {
      console.log('ℹ️ Índice idx_user_sessions_user_id já existe');
    }
    
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_user_sessions_token 
        ON user_sessions(session_token);
      `);
      console.log('✅ Índice idx_user_sessions_token criado');
    } catch (error) {
      console.log('ℹ️ Índice idx_user_sessions_token já existe');
    }
    
    // Verificar estrutura final da tabela
    const finalStructure = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'user_sessions'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📊 Estrutura final da tabela user_sessions:');
    finalStructure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    console.log('\n🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar migração
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };