/**
 * SCRIPT PARA EXECUTAR MIGRATIONS DO SISTEMA ML
 * Executa todas as migrations necessárias para o Quantum ML
 * 100% JavaScript - SEM TYPESCRIPT
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Configuração do banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/toit_nexus',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Lista de migrations na ordem correta
const MIGRATIONS = [
  '001_create_subscription_plans.sql',
  '002_create_ml_credits.sql', 
  '003_create_ml_usage_history.sql',
  '004_create_auto_predictions.sql'
];

/**
 * Executar uma migration específica
 */
async function runMigration(filename) {
  const migrationPath = path.join(__dirname, 'migrations', filename);
  
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration não encontrada: ${filename}`);
  }
  
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log(`🔄 Executando migration: ${filename}`);
  
  try {
    await pool.query(sql);
    console.log(`✅ Migration executada com sucesso: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro na migration ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Verificar se uma tabela existe
 */
async function tableExists(tableName) {
  const result = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );
  `, [tableName]);
  
  return result.rows[0].exists;
}

/**
 * Criar tabela de controle de migrations se não existir
 */
async function createMigrationsTable() {
  const exists = await tableExists('ml_migrations');
  
  if (!exists) {
    console.log('📋 Criando tabela de controle de migrations...');
    
    await pool.query(`
      CREATE TABLE ml_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        success BOOLEAN NOT NULL DEFAULT true
      );
    `);
    
    console.log('✅ Tabela ml_migrations criada');
  }
}

/**
 * Verificar se uma migration já foi executada
 */
async function migrationExecuted(filename) {
  const result = await pool.query(`
    SELECT EXISTS (
      SELECT 1 FROM ml_migrations 
      WHERE filename = $1 AND success = true
    );
  `, [filename]);
  
  return result.rows[0].exists;
}

/**
 * Registrar execução de migration
 */
async function recordMigration(filename, success = true) {
  await pool.query(`
    INSERT INTO ml_migrations (filename, success)
    VALUES ($1, $2)
    ON CONFLICT (filename) 
    DO UPDATE SET 
      executed_at = NOW(),
      success = $2;
  `, [filename, success]);
}

/**
 * Executar todas as migrations
 */
async function runAllMigrations() {
  console.log('🚀 Iniciando execução das migrations ML...\n');
  
  try {
    // Criar tabela de controle
    await createMigrationsTable();
    
    let executedCount = 0;
    let skippedCount = 0;
    
    // Executar cada migration
    for (const filename of MIGRATIONS) {
      const alreadyExecuted = await migrationExecuted(filename);
      
      if (alreadyExecuted) {
        console.log(`⏭️  Migration já executada: ${filename}`);
        skippedCount++;
        continue;
      }
      
      try {
        await runMigration(filename);
        await recordMigration(filename, true);
        executedCount++;
      } catch (error) {
        await recordMigration(filename, false);
        throw error;
      }
    }
    
    console.log('\n🎉 Migrations ML executadas com sucesso!');
    console.log(`📊 Estatísticas:`);
    console.log(`   - Executadas: ${executedCount}`);
    console.log(`   - Puladas: ${skippedCount}`);
    console.log(`   - Total: ${MIGRATIONS.length}`);
    
  } catch (error) {
    console.error('\n❌ Erro durante execução das migrations:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

/**
 * Verificar status das migrations
 */
async function checkMigrationsStatus() {
  console.log('📋 Status das migrations ML:\n');
  
  try {
    const tableExistsResult = await tableExists('ml_migrations');
    
    if (!tableExistsResult) {
      console.log('⚠️  Tabela de controle não existe. Execute as migrations primeiro.');
      return;
    }
    
    for (const filename of MIGRATIONS) {
      const executed = await migrationExecuted(filename);
      const status = executed ? '✅ Executada' : '❌ Pendente';
      console.log(`   ${filename}: ${status}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error.message);
  } finally {
    await pool.end();
  }
}

// Executar baseado no argumento da linha de comando
const command = process.argv[2];

switch (command) {
  case 'run':
    runAllMigrations();
    break;
  case 'status':
    checkMigrationsStatus();
    break;
  default:
    console.log('📖 Uso:');
    console.log('   node run-ml-migrations.js run     - Executar migrations');
    console.log('   node run-ml-migrations.js status  - Verificar status');
    process.exit(1);
}
