/**
 * SCRIPT DE SETUP COMPLETO DO QUANTUM ML
 * Configura todo o sistema ML do zero
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

/**
 * Executar setup completo do Quantum ML
 */
async function setupQuantumML() {
  console.log('🚀 INICIANDO SETUP COMPLETO DO QUANTUM ML');
  console.log('='.repeat(60));

  try {
    // 1. Verificar conexão com banco
    await checkDatabaseConnection();

    // 2. Executar migrations
    await runMigrations();

    // 3. Executar seeders
    await runSeeders();

    // 4. Verificar estrutura
    await verifyStructure();

    // 5. Configurar tenant padrão
    await setupDefaultTenant();

    // 6. Executar testes básicos
    await runBasicTests();

    console.log('\n' + '='.repeat(60));
    console.log('✅ SETUP COMPLETO DO QUANTUM ML FINALIZADO COM SUCESSO!');
    console.log('='.repeat(60));

    // Mostrar próximos passos
    showNextSteps();

  } catch (error) {
    console.error('\n❌ ERRO NO SETUP:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

/**
 * Verificar conexão com banco de dados
 */
async function checkDatabaseConnection() {
  console.log('\n1️⃣ Verificando conexão com banco de dados...');
  
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    const { current_time, pg_version } = result.rows[0];
    
    console.log(`✅ Conexão estabelecida com sucesso`);
    console.log(`   📅 Hora do servidor: ${current_time}`);
    console.log(`   🐘 PostgreSQL: ${pg_version.split(' ')[1]}`);
    
  } catch (error) {
    throw new Error(`Falha na conexão com banco: ${error.message}`);
  }
}

/**
 * Executar migrations
 */
async function runMigrations() {
  console.log('\n2️⃣ Executando migrations...');
  
  const migrationFiles = [
    '001_create_subscription_plans.sql',
    '002_create_ml_credits.sql',
    '003_create_auto_predictions.sql',
    '004_create_ml_usage_history.sql',
    '005_create_ml_functions.sql'
  ];

  for (const filename of migrationFiles) {
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', filename);
    
    if (!fs.existsSync(migrationPath)) {
      console.log(`⚠️  Migration não encontrada: ${filename}`);
      continue;
    }

    try {
      console.log(`   📄 Executando: ${filename}`);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      await pool.query(sql);
      console.log(`   ✅ Concluída: ${filename}`);
      
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`   ⏭️  Já existe: ${filename}`);
      } else {
        throw new Error(`Erro na migration ${filename}: ${error.message}`);
      }
    }
  }
}

/**
 * Executar seeders
 */
async function runSeeders() {
  console.log('\n3️⃣ Executando seeders...');
  
  const seederFiles = [
    '001_seed_subscription_plans.sql',
    '002_seed_default_predictions.sql'
  ];

  for (const filename of seederFiles) {
    const seederPath = path.join(__dirname, '..', 'database', 'seeders', filename);
    
    if (!fs.existsSync(seederPath)) {
      console.log(`⚠️  Seeder não encontrado: ${filename}`);
      continue;
    }

    try {
      console.log(`   🌱 Executando: ${filename}`);
      const sql = fs.readFileSync(seederPath, 'utf8');
      await pool.query(sql);
      console.log(`   ✅ Concluído: ${filename}`);
      
    } catch (error) {
      if (error.message.includes('duplicate key')) {
        console.log(`   ⏭️  Dados já existem: ${filename}`);
      } else {
        throw new Error(`Erro no seeder ${filename}: ${error.message}`);
      }
    }
  }
}

/**
 * Verificar estrutura do banco
 */
async function verifyStructure() {
  console.log('\n4️⃣ Verificando estrutura do banco...');
  
  const requiredTables = [
    'subscription_plans',
    'ml_credits',
    'auto_predictions',
    'ml_usage_history'
  ];

  const requiredFunctions = [
    'calculate_next_run',
    'cleanup_old_ml_usage',
    'get_predictions_ready_to_run',
    'create_default_predictions_for_tenant'
  ];

  // Verificar tabelas
  for (const tableName of requiredTables) {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    
    if (result.rows[0].exists) {
      console.log(`   ✅ Tabela: ${tableName}`);
    } else {
      throw new Error(`Tabela obrigatória não encontrada: ${tableName}`);
    }
  }

  // Verificar funções
  for (const functionName of requiredFunctions) {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM pg_proc 
        WHERE proname = $1
      );
    `, [functionName]);
    
    if (result.rows[0].exists) {
      console.log(`   ✅ Função: ${functionName}()`);
    } else {
      console.log(`   ⚠️  Função não encontrada: ${functionName}()`);
    }
  }
}

/**
 * Configurar tenant padrão
 */
async function setupDefaultTenant() {
  console.log('\n5️⃣ Configurando tenant padrão...');
  
  const defaultTenantId = 'default';
  const defaultPlan = 'quantum_plus';

  try {
    // Verificar se já existe
    const existsResult = await pool.query(`
      SELECT tenant_id FROM ml_credits WHERE tenant_id = $1
    `, [defaultTenantId]);

    if (existsResult.rows.length > 0) {
      console.log(`   ⏭️  Tenant padrão já configurado: ${defaultTenantId}`);
      return;
    }

    // Buscar plano
    const planResult = await pool.query(`
      SELECT id, display_name, ml_credits_per_month
      FROM subscription_plans 
      WHERE name = $1 AND is_active = true
    `, [defaultPlan]);

    if (planResult.rows.length === 0) {
      throw new Error(`Plano não encontrado: ${defaultPlan}`);
    }

    const plan = planResult.rows[0];

    // Criar configuração de créditos
    await pool.query(`
      INSERT INTO ml_credits (
        tenant_id,
        subscription_plan_id,
        credits_total,
        credits_used,
        reset_date,
        last_reset_date
      ) VALUES ($1, $2, $3, 0, CURRENT_DATE + INTERVAL '1 month', CURRENT_DATE)
    `, [defaultTenantId, plan.id, plan.ml_credits_per_month]);

    console.log(`   ✅ Tenant configurado: ${defaultTenantId}`);
    console.log(`   📋 Plano: ${plan.display_name}`);
    console.log(`   ⚡ Créditos: ${plan.ml_credits_per_month}/mês`);

  } catch (error) {
    throw new Error(`Erro ao configurar tenant padrão: ${error.message}`);
  }
}

/**
 * Executar testes básicos
 */
async function runBasicTests() {
  console.log('\n6️⃣ Executando testes básicos...');
  
  try {
    // Teste 1: Verificar créditos do tenant padrão
    const creditsResult = await pool.query(`
      SELECT credits_total, credits_available 
      FROM ml_credits 
      WHERE tenant_id = 'default'
    `);

    if (creditsResult.rows.length > 0) {
      const credits = creditsResult.rows[0];
      console.log(`   ✅ Créditos do tenant padrão: ${credits.credits_available}/${credits.credits_total}`);
    } else {
      throw new Error('Créditos do tenant padrão não encontrados');
    }

    // Teste 2: Verificar planos ativos
    const plansResult = await pool.query(`
      SELECT COUNT(*) as count FROM subscription_plans WHERE is_active = true
    `);

    const plansCount = parseInt(plansResult.rows[0].count);
    if (plansCount >= 3) {
      console.log(`   ✅ Planos de assinatura: ${plansCount} ativos`);
    } else {
      throw new Error(`Poucos planos ativos: ${plansCount}`);
    }

    // Teste 3: Testar função de próxima execução
    const nextRunResult = await pool.query(`
      SELECT calculate_next_run('daily', '09:00:00') as next_run
    `);

    if (nextRunResult.rows[0].next_run) {
      console.log(`   ✅ Função calculate_next_run funcionando`);
    } else {
      throw new Error('Função calculate_next_run não está funcionando');
    }

    console.log(`   ✅ Todos os testes básicos passaram`);

  } catch (error) {
    throw new Error(`Falha nos testes básicos: ${error.message}`);
  }
}

/**
 * Mostrar próximos passos
 */
function showNextSteps() {
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('');
  console.log('1. Iniciar o servidor:');
  console.log('   npm start');
  console.log('');
  console.log('2. Acessar o dashboard ML:');
  console.log('   http://localhost:3000/quantum-ml');
  console.log('');
  console.log('3. Verificar status dos serviços:');
  console.log('   GET /api/quantum-ml/status');
  console.log('');
  console.log('4. Testar insights ML:');
  console.log('   POST /api/quantum/insight');
  console.log('');
  console.log('5. Configurar predições automáticas:');
  console.log('   POST /api/auto-predictions');
  console.log('');
  console.log('🎯 O sistema Quantum ML está pronto para uso!');
}

// Executar setup se chamado diretamente
if (require.main === module) {
  setupQuantumML();
}

module.exports = {
  setupQuantumML,
  checkDatabaseConnection,
  runMigrations,
  runSeeders,
  verifyStructure,
  setupDefaultTenant,
  runBasicTests
};
