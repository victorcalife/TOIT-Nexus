#!/usr/bin/env node

/**
 * Script de Health Check para Railway
 * Verifica a saúde de todos os componentes do sistema
 */

const { Pool } = require('pg');
const Redis = require('ioredis');
const fs = require('fs');
const path = require('path');

// Configurações
const config = {
  database: {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },
  redis: {
    url: process.env.REDIS_URL
  },
  timeouts: {
    database: 5000,
    redis: 3000
  }
};

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Função para log colorido
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Verificar conexão com PostgreSQL
async function checkDatabase() {
  let pool;
  try {
    log('🔍 Verificando PostgreSQL...', 'blue');
    
    if (!config.database.connectionString) {
      throw new Error('DATABASE_URL não configurada');
    }

    pool = new Pool(config.database);
    
    // Timeout para a conexão
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout na conexão')), config.timeouts.database);
    });

    // Testar conexão básica
    const queryPromise = pool.query('SELECT NOW() as current_time, version() as pg_version');
    const result = await Promise.race([queryPromise, timeoutPromise]);
    
    // Verificar tabelas essenciais
    const tablesResult = await pool.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tableCount = parseInt(tablesResult.rows[0].table_count);
    
    log(`✅ PostgreSQL: Conectado`, 'green');
    log(`   📊 Versão: ${result.rows[0].pg_version.split(' ')[0]}`);
    log(`   📋 Tabelas: ${tableCount}`);
    log(`   ⏰ Hora do servidor: ${result.rows[0].current_time}`);
    
    return {
      status: 'healthy',
      version: result.rows[0].pg_version,
      tables: tableCount,
      timestamp: result.rows[0].current_time
    };
    
  } catch (error) {
    log(`❌ PostgreSQL: ${error.message}`, 'red');
    return {
      status: 'unhealthy',
      error: error.message
    };
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Verificar conexão com Redis
async function checkRedis() {
  let redis;
  try {
    log('🔍 Verificando Redis...', 'blue');
    
    if (!config.redis.url) {
      log(`⚠️  Redis: URL não configurada (opcional)`, 'yellow');
      return {
        status: 'not_configured',
        message: 'Redis URL não configurada'
      };
    }

    redis = new Redis(config.redis.url, {
      connectTimeout: config.timeouts.redis,
      lazyConnect: true
    });

    await redis.connect();
    
    // Testar operações básicas
    const testKey = 'health_check_' + Date.now();
    await redis.set(testKey, 'test_value', 'EX', 10);
    const value = await redis.get(testKey);
    await redis.del(testKey);
    
    if (value !== 'test_value') {
      throw new Error('Falha no teste de read/write');
    }
    
    // Obter informações do Redis
    const info = await redis.info('server');
    const version = info.match(/redis_version:([^\r\n]+)/)?.[1] || 'unknown';
    
    log(`✅ Redis: Conectado`, 'green');
    log(`   📊 Versão: ${version}`);
    
    return {
      status: 'healthy',
      version: version
    };
    
  } catch (error) {
    log(`❌ Redis: ${error.message}`, 'red');
    return {
      status: 'unhealthy',
      error: error.message
    };
  } finally {
    if (redis) {
      redis.disconnect();
    }
  }
}

// Verificar sistema de arquivos
async function checkFileSystem() {
  try {
    log('🔍 Verificando sistema de arquivos...', 'blue');
    
    const uploadsDir = path.join(__dirname, '../uploads');
    const tempDir = path.join(__dirname, '../temp');
    
    // Verificar se diretórios existem
    const uploadsExists = fs.existsSync(uploadsDir);
    const tempExists = fs.existsSync(tempDir);
    
    // Testar escrita
    const testFile = path.join(__dirname, '../temp_health_check.txt');
    fs.writeFileSync(testFile, 'health check test');
    const content = fs.readFileSync(testFile, 'utf8');
    fs.unlinkSync(testFile);
    
    if (content !== 'health check test') {
      throw new Error('Falha no teste de escrita/leitura');
    }
    
    log(`✅ Sistema de arquivos: OK`, 'green');
    log(`   📁 Uploads: ${uploadsExists ? 'Existe' : 'Não existe'}`);
    log(`   📁 Temp: ${tempExists ? 'Existe' : 'Não existe'}`);
    
    return {
      status: 'healthy',
      uploads_dir: uploadsExists,
      temp_dir: tempExists
    };
    
  } catch (error) {
    log(`❌ Sistema de arquivos: ${error.message}`, 'red');
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

// Verificar variáveis de ambiente essenciais
function checkEnvironment() {
  log('🔍 Verificando variáveis de ambiente...', 'blue');
  
  const required = [
    'NODE_ENV',
    'DATABASE_URL',
    'JWT_SECRET',
    'SESSION_SECRET'
  ];
  
  const optional = [
    'REDIS_URL',
    'BACKEND_PUBLIC_URL',
    'FRONTEND_PUBLIC_URL',
    'CORS_ORIGIN'
  ];
  
  const missing = [];
  const present = [];
  
  // Verificar variáveis obrigatórias
  required.forEach(key => {
    if (process.env[key]) {
      present.push(key);
    } else {
      missing.push(key);
    }
  });
  
  // Verificar variáveis opcionais
  const optionalPresent = [];
  optional.forEach(key => {
    if (process.env[key]) {
      optionalPresent.push(key);
    }
  });
  
  if (missing.length === 0) {
    log(`✅ Variáveis de ambiente: OK`, 'green');
  } else {
    log(`❌ Variáveis de ambiente: ${missing.length} faltando`, 'red');
  }
  
  log(`   ✅ Obrigatórias: ${present.length}/${required.length}`);
  log(`   📋 Opcionais: ${optionalPresent.length}/${optional.length}`);
  
  if (missing.length > 0) {
    log(`   ❌ Faltando: ${missing.join(', ')}`, 'red');
  }
  
  return {
    status: missing.length === 0 ? 'healthy' : 'unhealthy',
    required: {
      present: present.length,
      total: required.length,
      missing: missing
    },
    optional: {
      present: optionalPresent.length,
      total: optional.length
    }
  };
}

// Função principal
async function runHealthCheck() {
  const startTime = Date.now();
  
  log('🏥 TOIT Nexus - Health Check', 'blue');
  log('=' .repeat(50));
  log(`🕐 Iniciado em: ${new Date().toISOString()}`);
  log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  log('');
  
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks: {}
  };
  
  try {
    // Executar verificações
    results.checks.environment = checkEnvironment();
    results.checks.database = await checkDatabase();
    results.checks.redis = await checkRedis();
    results.checks.filesystem = await checkFileSystem();
    
    // Calcular status geral
    const healthyChecks = Object.values(results.checks)
      .filter(check => check.status === 'healthy').length;
    const totalChecks = Object.values(results.checks)
      .filter(check => check.status !== 'not_configured').length;
    
    const isHealthy = healthyChecks === totalChecks;
    results.overall_status = isHealthy ? 'healthy' : 'unhealthy';
    
    const duration = Date.now() - startTime;
    results.duration_ms = duration;
    
    log('');
    log('=' .repeat(50));
    
    if (isHealthy) {
      log(`🎉 Status Geral: SAUDÁVEL`, 'green');
    } else {
      log(`⚠️  Status Geral: PROBLEMAS DETECTADOS`, 'yellow');
    }
    
    log(`📊 Verificações: ${healthyChecks}/${totalChecks} OK`);
    log(`⏱️  Duração: ${duration}ms`);
    
    // Output JSON para integração
    if (process.argv.includes('--json')) {
      console.log('');
      console.log('JSON Output:');
      console.log(JSON.stringify(results, null, 2));
    }
    
    // Exit code baseado no status
    process.exit(isHealthy ? 0 : 1);
    
  } catch (error) {
    log(`💥 Erro durante health check: ${error.message}`, 'red');
    results.overall_status = 'error';
    results.error = error.message;
    
    if (process.argv.includes('--json')) {
      console.log(JSON.stringify(results, null, 2));
    }
    
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runHealthCheck();
}

module.exports = { runHealthCheck };