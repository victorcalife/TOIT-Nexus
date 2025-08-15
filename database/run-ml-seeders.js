/**
 * SCRIPT PARA EXECUTAR SEEDERS DO SISTEMA ML
 * Popula dados iniciais para o Quantum ML
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

// Lista de seeders na ordem correta
const SEEDERS = [
  '001_seed_subscription_plans.sql',
  '002_seed_default_predictions.sql'
];

/**
 * Executar um seeder específico
 */
async function runSeeder(filename) {
  const seederPath = path.join(__dirname, 'seeders', filename);
  
  if (!fs.existsSync(seederPath)) {
    throw new Error(`Seeder não encontrado: ${filename}`);
  }
  
  const sql = fs.readFileSync(seederPath, 'utf8');
  
  console.log(`🌱 Executando seeder: ${filename}`);
  
  try {
    await pool.query(sql);
    console.log(`✅ Seeder executado com sucesso: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro no seeder ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Verificar se as tabelas necessárias existem
 */
async function checkRequiredTables() {
  const requiredTables = [
    'subscription_plans',
    'auto_predictions'
  ];
  
  for (const tableName of requiredTables) {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    
    if (!result.rows[0].exists) {
      throw new Error(`Tabela necessária não encontrada: ${tableName}. Execute as migrations primeiro.`);
    }
  }
  
  console.log('✅ Todas as tabelas necessárias existem');
}

/**
 * Criar tabela de controle de seeders se não existir
 */
async function createSeedersTable() {
  const result = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'ml_seeders'
    );
  `);
  
  if (!result.rows[0].exists) {
    console.log('📋 Criando tabela de controle de seeders...');
    
    await pool.query(`
      CREATE TABLE ml_seeders (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        success BOOLEAN NOT NULL DEFAULT true
      );
    `);
    
    console.log('✅ Tabela ml_seeders criada');
  }
}

/**
 * Verificar se um seeder já foi executado
 */
async function seederExecuted(filename) {
  const result = await pool.query(`
    SELECT EXISTS (
      SELECT 1 FROM ml_seeders 
      WHERE filename = $1 AND success = true
    );
  `, [filename]);
  
  return result.rows[0].exists;
}

/**
 * Registrar execução de seeder
 */
async function recordSeeder(filename, success = true) {
  await pool.query(`
    INSERT INTO ml_seeders (filename, success)
    VALUES ($1, $2)
    ON CONFLICT (filename) 
    DO UPDATE SET 
      executed_at = NOW(),
      success = $2;
  `, [filename, success]);
}

/**
 * Executar todos os seeders
 */
async function runAllSeeders() {
  console.log('🌱 Iniciando execução dos seeders ML...\n');
  
  try {
    // Verificar tabelas necessárias
    await checkRequiredTables();
    
    // Criar tabela de controle
    await createSeedersTable();
    
    let executedCount = 0;
    let skippedCount = 0;
    
    // Executar cada seeder
    for (const filename of SEEDERS) {
      const alreadyExecuted = await seederExecuted(filename);
      
      if (alreadyExecuted) {
        console.log(`⏭️  Seeder já executado: ${filename}`);
        skippedCount++;
        continue;
      }
      
      try {
        await runSeeder(filename);
        await recordSeeder(filename, true);
        executedCount++;
      } catch (error) {
        await recordSeeder(filename, false);
        throw error;
      }
    }
    
    console.log('\n🎉 Seeders ML executados com sucesso!');
    console.log(`📊 Estatísticas:`);
    console.log(`   - Executados: ${executedCount}`);
    console.log(`   - Pulados: ${skippedCount}`);
    console.log(`   - Total: ${SEEDERS.length}`);
    
    // Mostrar dados criados
    await showCreatedData();
    
  } catch (error) {
    console.error('\n❌ Erro durante execução dos seeders:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

/**
 * Mostrar dados criados pelos seeders
 */
async function showCreatedData() {
  console.log('\n📊 Dados criados:');
  
  // Planos de assinatura
  const plansResult = await pool.query(`
    SELECT name, display_name, ml_credits_per_month, max_scheduled_workflows
    FROM subscription_plans 
    WHERE is_active = true
    ORDER BY ml_credits_per_month ASC;
  `);
  
  console.log('\n📋 Planos de Assinatura:');
  plansResult.rows.forEach(plan => {
    console.log(`   • ${plan.display_name}`);
    console.log(`     - Créditos ML: ${plan.ml_credits_per_month}/mês`);
    console.log(`     - Workflows: ${plan.max_scheduled_workflows} agendados`);
  });
  
  // Verificar se função de predições foi criada
  const functionResult = await pool.query(`
    SELECT EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'create_default_predictions_for_tenant'
    );
  `);
  
  if (functionResult.rows[0].exists) {
    console.log('\n🔧 Funções criadas:');
    console.log('   • create_default_predictions_for_tenant() - Criar predições padrão');
  }
}

/**
 * Verificar status dos seeders
 */
async function checkSeedersStatus() {
  console.log('📋 Status dos seeders ML:\n');
  
  try {
    const tableExistsResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ml_seeders'
      );
    `);
    
    if (!tableExistsResult.rows[0].exists) {
      console.log('⚠️  Tabela de controle não existe. Execute os seeders primeiro.');
      return;
    }
    
    for (const filename of SEEDERS) {
      const executed = await seederExecuted(filename);
      const status = executed ? '✅ Executado' : '❌ Pendente';
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
    runAllSeeders();
    break;
  case 'status':
    checkSeedersStatus();
    break;
  default:
    console.log('📖 Uso:');
    console.log('   node run-ml-seeders.js run     - Executar seeders');
    console.log('   node run-ml-seeders.js status  - Verificar status');
    process.exit(1);
}
