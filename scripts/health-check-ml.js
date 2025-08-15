/**
 * SCRIPT DE HEALTH CHECK DO QUANTUM ML
 * Verifica saúde de todos os componentes ML
 * 100% JavaScript - SEM TYPESCRIPT
 */

const { Pool } = require('pg');
const fetch = require('node-fetch');

// Configuração
const config = {
  database: {
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/toit_nexus',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },
  api: {
    baseUrl: process.env.API_URL || 'http://localhost:3000',
    timeout: 10000
  }
};

const pool = new Pool(config.database);

/**
 * Executar health check completo
 */
async function runHealthCheck() {
  console.log('🏥 HEALTH CHECK DO QUANTUM ML');
  console.log('='.repeat(50));
  
  const results = {
    timestamp: new Date().toISOString(),
    overall: 'unknown',
    components: {}
  };

  try {
    // 1. Verificar banco de dados
    results.components.database = await checkDatabase();

    // 2. Verificar API
    results.components.api = await checkAPI();

    // 3. Verificar serviços ML
    results.components.mlServices = await checkMLServices();

    // 4. Verificar créditos
    results.components.credits = await checkCredits();

    // 5. Verificar predições automáticas
    results.components.autoPredictions = await checkAutoPredictions();

    // 6. Verificar scheduler
    results.components.scheduler = await checkScheduler();

    // Determinar status geral
    results.overall = determineOverallHealth(results.components);

    // Mostrar resultados
    displayResults(results);

    // Retornar código de saída apropriado
    process.exit(results.overall === 'healthy' ? 0 : 1);

  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO NO HEALTH CHECK:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

/**
 * Verificar banco de dados
 */
async function checkDatabase() {
  console.log('\n🗄️  Verificando banco de dados...');
  
  try {
    // Teste de conexão
    const connectionTest = await pool.query('SELECT NOW() as current_time');
    console.log('   ✅ Conexão estabelecida');

    // Verificar tabelas essenciais
    const tables = ['subscription_plans', 'ml_credits', 'auto_predictions', 'ml_usage_history'];
    const tableChecks = await Promise.all(
      tables.map(async (table) => {
        const result = await pool.query(`
          SELECT COUNT(*) as count FROM ${table}
        `);
        return { table, count: parseInt(result.rows[0].count) };
      })
    );

    console.log('   ✅ Tabelas verificadas:');
    tableChecks.forEach(({ table, count }) => {
      console.log(`      📋 ${table}: ${count} registros`);
    });

    // Verificar funções
    const functionsResult = await pool.query(`
      SELECT proname FROM pg_proc 
      WHERE proname IN ('calculate_next_run', 'cleanup_old_ml_usage', 'get_predictions_ready_to_run')
    `);

    console.log(`   ✅ Funções encontradas: ${functionsResult.rows.length}/3`);

    return {
      status: 'healthy',
      details: {
        connection: 'ok',
        tables: tableChecks,
        functions: functionsResult.rows.length,
        timestamp: connectionTest.rows[0].current_time
      }
    };

  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

/**
 * Verificar API
 */
async function checkAPI() {
  console.log('\n🌐 Verificando API...');
  
  try {
    // Health check geral
    const healthResponse = await fetch(`${config.api.baseUrl}/api/health`, {
      timeout: config.api.timeout
    });

    if (!healthResponse.ok) {
      throw new Error(`API retornou status ${healthResponse.status}`);
    }

    const healthData = await healthResponse.json();
    console.log('   ✅ API principal funcionando');
    console.log(`   📊 Status: ${healthData.status}`);

    // Health check ML específico
    const mlHealthResponse = await fetch(`${config.api.baseUrl}/api/quantum-ml/status`, {
      timeout: config.api.timeout
    });

    let mlStatus = 'unknown';
    if (mlHealthResponse.ok) {
      const mlHealthData = await mlHealthResponse.json();
      mlStatus = mlHealthData.status;
      console.log('   ✅ API ML funcionando');
      console.log(`   🧠 Status ML: ${mlStatus}`);
    } else {
      console.log('   ⚠️  API ML não disponível');
    }

    return {
      status: healthResponse.ok ? 'healthy' : 'degraded',
      details: {
        general: healthData,
        ml: mlStatus,
        responseTime: Date.now()
      }
    };

  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

/**
 * Verificar serviços ML
 */
async function checkMLServices() {
  console.log('\n🧠 Verificando serviços ML...');
  
  try {
    // Teste de insight simples
    const testData = [
      { date: '2024-01-01', value: 100 },
      { date: '2024-01-02', value: 110 },
      { date: '2024-01-03', value: 105 },
      { date: '2024-01-04', value: 120 },
      { date: '2024-01-05', value: 115 }
    ];

    const insightResponse = await fetch(`${config.api.baseUrl}/api/quantum/insight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': 'health-check'
      },
      body: JSON.stringify({
        data: testData,
        insightType: 'prediction',
        options: { healthCheck: true }
      }),
      timeout: config.api.timeout
    });

    if (insightResponse.ok) {
      const insightData = await insightResponse.json();
      console.log('   ✅ Serviço de insights funcionando');
      console.log(`   ⚡ Tempo de processamento: ${insightData.data?.processingTime || 'N/A'}ms`);
      
      return {
        status: 'healthy',
        details: {
          insightService: 'ok',
          processingTime: insightData.data?.processingTime,
          testData: testData.length
        }
      };
    } else {
      throw new Error(`Serviço de insights retornou status ${insightResponse.status}`);
    }

  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

/**
 * Verificar sistema de créditos
 */
async function checkCredits() {
  console.log('\n⚡ Verificando sistema de créditos...');
  
  try {
    // Verificar créditos ativos
    const creditsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_tenants,
        SUM(credits_total) as total_credits,
        SUM(credits_used) as used_credits,
        SUM(credits_available) as available_credits
      FROM ml_credits 
      WHERE is_active = true
    `);

    const stats = creditsResult.rows[0];
    console.log('   ✅ Sistema de créditos ativo');
    console.log(`   👥 Tenants: ${stats.total_tenants}`);
    console.log(`   ⚡ Créditos totais: ${stats.total_credits}`);
    console.log(`   📊 Utilizados: ${stats.used_credits}`);
    console.log(`   💰 Disponíveis: ${stats.available_credits}`);

    // Verificar próximos resets
    const resetResult = await pool.query(`
      SELECT COUNT(*) as pending_resets
      FROM ml_credits 
      WHERE is_active = true 
      AND reset_date <= NOW() + INTERVAL '7 days'
    `);

    const pendingResets = parseInt(resetResult.rows[0].pending_resets);
    console.log(`   📅 Resets nos próximos 7 dias: ${pendingResets}`);

    return {
      status: 'healthy',
      details: {
        totalTenants: parseInt(stats.total_tenants),
        totalCredits: parseInt(stats.total_credits),
        usedCredits: parseInt(stats.used_credits),
        availableCredits: parseInt(stats.available_credits),
        pendingResets
      }
    };

  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

/**
 * Verificar predições automáticas
 */
async function checkAutoPredictions() {
  console.log('\n🔮 Verificando predições automáticas...');
  
  try {
    const predictionsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_predictions,
        COUNT(*) FILTER (WHERE is_active = true) as active_predictions,
        COUNT(*) FILTER (WHERE next_run_at <= NOW()) as pending_predictions,
        COUNT(*) FILTER (WHERE last_run_at > NOW() - INTERVAL '24 hours') as recent_runs
      FROM auto_predictions
    `);

    const stats = predictionsResult.rows[0];
    console.log('   ✅ Sistema de predições ativo');
    console.log(`   📊 Total: ${stats.total_predictions}`);
    console.log(`   🟢 Ativas: ${stats.active_predictions}`);
    console.log(`   ⏰ Pendentes: ${stats.pending_predictions}`);
    console.log(`   🕐 Executadas (24h): ${stats.recent_runs}`);

    return {
      status: 'healthy',
      details: {
        totalPredictions: parseInt(stats.total_predictions),
        activePredictions: parseInt(stats.active_predictions),
        pendingPredictions: parseInt(stats.pending_predictions),
        recentRuns: parseInt(stats.recent_runs)
      }
    };

  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

/**
 * Verificar scheduler
 */
async function checkScheduler() {
  console.log('\n⏰ Verificando scheduler...');
  
  try {
    // Verificar através da API de status
    const statusResponse = await fetch(`${config.api.baseUrl}/api/quantum-ml/status`, {
      timeout: config.api.timeout
    });

    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      const schedulerStats = statusData.stats?.scheduler;

      if (schedulerStats) {
        console.log('   ✅ Scheduler funcionando');
        console.log(`   🔄 Jobs ativos: ${schedulerStats.activeJobs || 0}`);
        console.log(`   📈 Total executados: ${schedulerStats.totalJobs || 0}`);
        console.log(`   ✅ Sucessos: ${schedulerStats.successfulJobs || 0}`);
        console.log(`   ❌ Falhas: ${schedulerStats.failedJobs || 0}`);

        return {
          status: schedulerStats.isRunning ? 'healthy' : 'degraded',
          details: schedulerStats
        };
      }
    }

    throw new Error('Scheduler status não disponível');

  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

/**
 * Determinar saúde geral
 */
function determineOverallHealth(components) {
  const statuses = Object.values(components).map(c => c.status);
  
  if (statuses.every(s => s === 'healthy')) {
    return 'healthy';
  } else if (statuses.some(s => s === 'unhealthy')) {
    return 'unhealthy';
  } else {
    return 'degraded';
  }
}

/**
 * Exibir resultados
 */
function displayResults(results) {
  console.log('\n' + '='.repeat(50));
  console.log('📋 RESUMO DO HEALTH CHECK');
  console.log('='.repeat(50));

  const statusEmoji = {
    healthy: '✅',
    degraded: '⚠️',
    unhealthy: '❌',
    unknown: '❓'
  };

  console.log(`\n🎯 STATUS GERAL: ${statusEmoji[results.overall]} ${results.overall.toUpperCase()}`);
  console.log(`📅 Timestamp: ${results.timestamp}`);

  console.log('\n📊 COMPONENTES:');
  Object.entries(results.components).forEach(([name, component]) => {
    console.log(`   ${statusEmoji[component.status]} ${name}: ${component.status}`);
    if (component.error) {
      console.log(`      ❌ Erro: ${component.error}`);
    }
  });

  if (results.overall === 'healthy') {
    console.log('\n🎉 Todos os sistemas estão funcionando corretamente!');
  } else if (results.overall === 'degraded') {
    console.log('\n⚠️  Alguns sistemas apresentam problemas, mas o serviço está operacional.');
  } else {
    console.log('\n🚨 Problemas críticos detectados! Intervenção necessária.');
  }
}

// Executar health check se chamado diretamente
if (require.main === module) {
  runHealthCheck();
}

module.exports = {
  runHealthCheck,
  checkDatabase,
  checkAPI,
  checkMLServices,
  checkCredits,
  checkAutoPredictions,
  checkScheduler
};
