#!/usr/bin/env node

/**
 * 🚨 EXECUÇÃO IMEDIATA DA MIGRAÇÃO CRÍTICA
 * 
 * Este script DEVE ser executado AGORA para resolver o erro:
 * "column data of relation user_sessions does not exist"
 */

const { Pool } = require('pg');

// Configuração do banco - Railway PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.PG_URL,
  ssl: { rejectUnauthorized: false }
});

async function executeMigrationNow() {
  console.log('🚨 EXECUTANDO MIGRAÇÃO CRÍTICA IMEDIATAMENTE');
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  try {
    // Testar conexão
    console.log('🔌 Conectando ao banco Railway...');
    const testConnection = await pool.query('SELECT NOW() as current_time, version()');
    console.log('✅ Conectado ao PostgreSQL:', testConnection.rows[0].current_time);
    
    // Verificar se a tabela user_sessions existe
    console.log('🔍 Verificando tabela user_sessions...');
    const tableExists = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'user_sessions'
    `);
    
    if (tableExists.rows.length === 0) {
      console.log('❌ ERRO: Tabela user_sessions não existe!');
      console.log('📋 Tabelas disponíveis:');
      const allTables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      allTables.rows.forEach(row => console.log(`  - ${row.table_name}`));
      throw new Error('Tabela user_sessions não encontrada');
    }
    
    console.log('✅ Tabela user_sessions encontrada');
    
    // Verificar estrutura atual
    console.log('🔍 Verificando estrutura atual...');
    const currentStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'user_sessions' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Estrutura atual da tabela user_sessions:');
    currentStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Verificar se a coluna data já existe
    const hasDataColumn = currentStructure.rows.some(row => row.column_name === 'data');
    
    if (hasDataColumn) {
      console.log('✅ Coluna data já existe! Migração não necessária.');
      return;
    }
    
    console.log('🚨 COLUNA DATA NÃO EXISTE - EXECUTANDO MIGRAÇÃO...');
    
    // EXECUTAR A MIGRAÇÃO
    console.log('📝 Adicionando coluna data...');
    await pool.query(`
      ALTER TABLE user_sessions 
      ADD COLUMN data JSON DEFAULT '{}'::json
    `);
    
    console.log('✅ Coluna data adicionada!');
    
    // Criar índice para performance
    console.log('📝 Criando índice de performance...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
      ON user_sessions(user_id)
    `);
    
    console.log('✅ Índice criado!');
    
    // Verificar resultado final
    console.log('🔍 Verificando resultado final...');
    const finalStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'user_sessions' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Estrutura FINAL da tabela user_sessions:');
    finalStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });
    
    // Verificação de sucesso
    const hasDataColumnNow = finalStructure.rows.some(row => row.column_name === 'data');
    
    if (hasDataColumnNow) {
      console.log('🎉 MIGRAÇÃO EXECUTADA COM SUCESSO!');
      console.log('✅ Sistema de login deve funcionar agora');
      console.log('🔄 Reinicie o serviço backend para aplicar as mudanças');
    } else {
      throw new Error('❌ FALHA: Coluna data não foi criada!');
    }
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO NA MIGRAÇÃO:');
    console.error('📋 Mensagem:', error.message);
    console.error('📋 Stack:', error.stack);
    throw error;
  } finally {
    await pool.end();
    console.log('🔌 Conexão encerrada');
  }
}

// EXECUTAR IMEDIATAMENTE
executeMigrationNow()
  .then(() => {
    console.log('✅ MIGRAÇÃO CONCLUÍDA - SISTEMA DEVE ESTAR FUNCIONANDO!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ FALHA NA MIGRAÇÃO:', error.message);
    process.exit(1);
  });
