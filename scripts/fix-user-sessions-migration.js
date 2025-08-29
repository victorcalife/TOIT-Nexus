#!/usr/bin/env node

/**
 * MIGRAÇÃO CRÍTICA: Adicionar coluna 'data' à tabela user_sessions
 * 
 * Este script resolve o erro: "column data of relation user_sessions does not exist"
 * que está impedindo o sistema de login de funcionar.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.PG_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  console.log('🚀 Iniciando migração crítica: user_sessions.data');
  console.log('📅 Data:', new Date().toISOString());
  
  try {
    // Verificar conexão
    console.log('🔌 Testando conexão com o banco...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Verificar se a tabela user_sessions existe
    console.log('🔍 Verificando se a tabela user_sessions existe...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_sessions'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      throw new Error('❌ ERRO CRÍTICO: Tabela user_sessions não existe!');
    }
    
    console.log('✅ Tabela user_sessions encontrada');
    
    // Verificar se a coluna data já existe
    console.log('🔍 Verificando se a coluna data já existe...');
    const columnCheck = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' 
        AND column_name = 'data'
      )
    `);
    
    if (columnCheck.rows[0].exists) {
      console.log('ℹ️ Coluna data já existe na tabela user_sessions');
      console.log('✅ Migração não necessária - sistema já está atualizado');
      return;
    }
    
    // Executar a migração
    console.log('📝 Executando migração: Adicionando coluna data...');
    
    await pool.query(`
      ALTER TABLE user_sessions 
      ADD COLUMN data JSON DEFAULT '{}'
    `);
    
    console.log('✅ Coluna data adicionada com sucesso!');
    
    // Criar índices se necessário
    console.log('📝 Criando índices de performance...');
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
      ON user_sessions(user_id)
    `);
    
    console.log('✅ Índices criados com sucesso!');
    
    // Verificar estrutura final
    console.log('🔍 Verificando estrutura final da tabela...');
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'user_sessions' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Estrutura da tabela user_sessions:');
    structure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Verificação final
    const finalCheck = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' 
        AND column_name = 'data'
      )
    `);
    
    if (finalCheck.rows[0].exists) {
      console.log('🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
      console.log('✅ Sistema de login agora deve funcionar corretamente');
      console.log('🔄 Reinicie o serviço para aplicar as mudanças');
    } else {
      throw new Error('❌ FALHA NA VERIFICAÇÃO: Coluna data não foi criada!');
    }
    
  } catch (error) {
    console.error('❌ ERRO NA MIGRAÇÃO:', error.message);
    console.error('📋 Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔌 Conexão com banco encerrada');
  }
}

// Executar migração
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('✅ Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Falha na execução:', error.message);
      process.exit(1);
    });
}

module.exports = { runMigration };
