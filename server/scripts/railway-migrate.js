#!/usr/bin/env node

/**
 * Script de Migração para Railway
 * Executa migrações do banco de dados em produção
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Configuração do banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Função para executar SQL
async function executeSQLFile(filePath) {
  try {
    console.log(`📄 Executando: ${filePath}`);
    
    const sql = fs.readFileSync(filePath, 'utf8');
    
    if (!sql.trim()) {
      console.log(`⚠️  Arquivo vazio: ${filePath}`);
      return;
    }

    await pool.query(sql);
    console.log(`✅ Sucesso: ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Erro em ${filePath}:`, error.message);
    throw error;
  }
}

// Função principal
async function runMigrations() {
  try {
    console.log('🚀 Iniciando migrações do TOIT Nexus...');
    console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
    console.log(`🔗 Banco: ${process.env.DATABASE_URL ? 'Conectado' : 'Não configurado'}`);
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL não configurada');
    }

    // Testar conexão
    console.log('🔍 Testando conexão com banco...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexão estabelecida');

    // Diretório das migrações
    const databaseDir = path.join(__dirname, '../../database');
    
    // 1. Executar esquema principal
    const schemaFile = path.join(databaseDir, 'complete-schema-migration-fixed.sql');
    if (fs.existsSync(schemaFile)) {
      console.log('\n📋 Executando esquema principal...');
      await executeSQLFile(schemaFile);
    } else {
      console.log('⚠️  Arquivo de esquema não encontrado');
    }

    // 2. Executar seeders essenciais
    const seedersFile = path.join(databaseDir, 'essential-seeders.sql');
    if (fs.existsSync(seedersFile)) {
      console.log('\n🌱 Executando seeders essenciais...');
      await executeSQLFile(seedersFile);
    } else {
      console.log('⚠️  Arquivo de seeders não encontrado');
    }

    // 3. Executar migrações incrementais (se existirem)
    const migrationsDir = path.join(databaseDir, 'migrations');
    if (fs.existsSync(migrationsDir)) {
      console.log('\n🔄 Verificando migrações incrementais...');
      
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      for (const file of migrationFiles) {
        const filePath = path.join(migrationsDir, file);
        await executeSQLFile(filePath);
      }
    }

    // 4. Verificar tabelas criadas
    console.log('\n🔍 Verificando tabelas criadas...');
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Tabelas no banco:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    console.log('\n🎉 Migrações concluídas com sucesso!');
    
  } catch (error) {
    console.error('💥 Erro durante migrações:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };