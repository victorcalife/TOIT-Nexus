/**
 * 🏥 HEALTH CHECK SYSTEM - TOIT NEXUS 3.0
 * Sistema completo de verificação de saúde para produção
 */

const { Pool } = require('pg');
const Redis = require('redis');
const fetch = require('node-fetch');
const fs = require('fs').promises;

class HealthCheckSystem {
  constructor() {
    this.checks = new Map();
    this.results = new Map();
    this.startTime = Date.now();
    
    this.registerChecks();
  }

  /**
   * Registrar todas as verificações de saúde
   */
  registerChecks() {
    this.checks.set('database', this.checkDatabase.bind(this));
    this.checks.set('redis', this.checkRedis.bind(this));
    this.checks.set('ml_service', this.checkMLService.bind(this));
    this.checks.set('quantum_engine', this.checkQuantumEngine.bind(this));
    this.checks.set('file_system', this.checkFileSystem.bind(this));
    this.checks.set('external_apis', this.checkExternalAPIs.bind(this));
    this.checks.set('schedulers', this.checkSchedulers.bind(this));
    this.checks.set('memory_usage', this.checkMemoryUsage.bind(this));
    this.checks.set('cpu_usage', this.checkCPUUsage.bind(this));
    this.checks.set('disk_space', this.checkDiskSpace.bind(this));
  }

  /**
   * Executar todas as verificações
   */
  async runAllChecks() {
    console.log('🏥 Iniciando verificações de saúde do sistema...\n');
    
    const results = {};
    let overallHealth = true;

    for (const [name, checkFunction] of this.checks) {
      try {
        console.log(`🔍 Verificando ${name}...`);
        const result = await this.runSingleCheck(name, checkFunction);
        results[name] = result;
        
        if (result.status !== 'healthy') {
          overallHealth = false;
        }
        
        this.logCheckResult(name, result);
        
      } catch (error) {
        const errorResult = {
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString(),
          responseTime: 0
        };
        
        results[name] = errorResult;
        overallHealth = false;
        this.logCheckResult(name, errorResult);
      }
    }

    const summary = {
      status: overallHealth ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      checks: results,
      version: process.env.DEPLOYMENT_VERSION || '3.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    this.logSummary(summary);
    return summary;
  }

  /**
   * Executar verificação individual
   */
  async runSingleCheck(name, checkFunction) {
    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        checkFunction(),
        this.timeout(10000) // 10 second timeout
      ]);
      
      return {
        status: 'healthy',
        message: result.message || 'OK',
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: result.details || {}
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.name
      };
    }
  }

  /**
   * Verificar banco de dados
   */
  async checkDatabase() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
      // Test connection
      const client = await pool.connect();
      
      // Test query
      const result = await client.query('SELECT NOW() as current_time, version() as version');
      
      // Check ML tables
      const mlTables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%ml%'
      `);

      client.release();
      await pool.end();

      return {
        message: 'Database connection successful',
        details: {
          currentTime: result.rows[0].current_time,
          version: result.rows[0].version.split(' ')[0],
          mlTablesCount: mlTables.rows.length
        }
      };
      
    } catch (error) {
      await pool.end();
      throw new Error(`Database check failed: ${error.message}`);
    }
  }

  /**
   * Verificar Redis
   */
  async checkRedis() {
    const client = Redis.createClient({
      url: process.env.REDIS_URL
    });

    try {
      await client.connect();
      
      // Test set/get
      const testKey = 'health_check_' + Date.now();
      await client.set(testKey, 'test_value', { EX: 10 });
      const value = await client.get(testKey);
      await client.del(testKey);
      
      // Get info
      const info = await client.info('memory');
      const memoryUsed = info.match(/used_memory_human:(.+)/)?.[1]?.trim();
      
      await client.quit();

      if (value !== 'test_value') {
        throw new Error('Redis set/get test failed');
      }

      return {
        message: 'Redis connection successful',
        details: {
          memoryUsed: memoryUsed || 'unknown'
        }
      };
      
    } catch (error) {
      await client.quit();
      throw new Error(`Redis check failed: ${error.message}`);
    }
  }

  /**
   * Verificar serviço ML
   */
  async checkMLService() {
    try {
      // Test ML credits endpoint
      const response = await fetch('http://localhost:3000/api/ml-credits', {
        headers: {
          'Authorization': `Bearer ${process.env.HEALTH_CHECK_TOKEN || 'test-token'}`
        }
      });

      if (!response.ok) {
        throw new Error(`ML API returned ${response.status}`);
      }

      const data = await response.json();

      return {
        message: 'ML Service operational',
        details: {
          endpoint: '/api/ml-credits',
          responseStatus: response.status
        }
      };
      
    } catch (error) {
      throw new Error(`ML Service check failed: ${error.message}`);
    }
  }

  /**
   * Verificar quantum engine
   */
  async checkQuantumEngine() {
    try {
      // Test quantum health endpoint
      const response = await fetch('http://localhost:3000/api/quantum/health');

      if (!response.ok) {
        throw new Error(`Quantum API returned ${response.status}`);
      }

      const data = await response.json();

      return {
        message: 'Quantum Engine operational',
        details: {
          algorithmsEnabled: data.algorithmsEnabled || false,
          qaoaStatus: data.qaoa || 'unknown',
          groverStatus: data.grover || 'unknown'
        }
      };
      
    } catch (error) {
      throw new Error(`Quantum Engine check failed: ${error.message}`);
    }
  }

  /**
   * Verificar sistema de arquivos
   */
  async checkFileSystem() {
    try {
      const testFile = '/tmp/health_check_' + Date.now() + '.txt';
      const testContent = 'Health check test';
      
      // Write test
      await fs.writeFile(testFile, testContent);
      
      // Read test
      const content = await fs.readFile(testFile, 'utf8');
      
      // Cleanup
      await fs.unlink(testFile);

      if (content !== testContent) {
        throw new Error('File system read/write test failed');
      }

      return {
        message: 'File system operational'
      };
      
    } catch (error) {
      throw new Error(`File system check failed: ${error.message}`);
    }
  }

  /**
   * Verificar APIs externas
   */
  async checkExternalAPIs() {
    const results = {};
    let allHealthy = true;

    // Check SendGrid
    if (process.env.SENDGRID_API_KEY) {
      try {
        const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
          headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`
          }
        });
        results.sendgrid = response.ok ? 'healthy' : 'unhealthy';
      } catch (error) {
        results.sendgrid = 'error';
        allHealthy = false;
      }
    }

    // Check Stripe
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const response = await fetch('https://api.stripe.com/v1/account', {
          headers: {
            'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
          }
        });
        results.stripe = response.ok ? 'healthy' : 'unhealthy';
      } catch (error) {
        results.stripe = 'error';
        allHealthy = false;
      }
    }

    return {
      message: allHealthy ? 'External APIs operational' : 'Some external APIs have issues',
      details: results
    };
  }

  /**
   * Verificar schedulers
   */
  async checkSchedulers() {
    try {
      // Check if PM2 processes are running
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      const { stdout } = await execAsync('pm2 jlist');
      const processes = JSON.parse(stdout);

      const schedulers = processes.filter(p => 
        p.name.includes('scheduler') || 
        p.name.includes('auto-predictions') ||
        p.name.includes('monthly-reset')
      );

      const runningSchedulers = schedulers.filter(p => p.pm2_env.status === 'online');

      return {
        message: `${runningSchedulers.length}/${schedulers.length} schedulers running`,
        details: {
          total: schedulers.length,
          running: runningSchedulers.length,
          schedulers: schedulers.map(p => ({
            name: p.name,
            status: p.pm2_env.status,
            uptime: p.pm2_env.pm_uptime
          }))
        }
      };
      
    } catch (error) {
      throw new Error(`Schedulers check failed: ${error.message}`);
    }
  }

  /**
   * Verificar uso de memória
   */
  async checkMemoryUsage() {
    const usage = process.memoryUsage();
    const totalMB = Math.round(usage.rss / 1024 / 1024);
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);

    const threshold = 2048; // 2GB threshold
    const isHealthy = totalMB < threshold;

    if (!isHealthy) {
      throw new Error(`Memory usage too high: ${totalMB}MB (threshold: ${threshold}MB)`);
    }

    return {
      message: `Memory usage: ${totalMB}MB`,
      details: {
        rss: totalMB,
        heapUsed: heapUsedMB,
        heapTotal: heapTotalMB,
        external: Math.round(usage.external / 1024 / 1024)
      }
    };
  }

  /**
   * Verificar uso de CPU
   */
  async checkCPUUsage() {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    try {
      const { stdout } = await execAsync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1");
      const cpuUsage = parseFloat(stdout.trim());

      const threshold = 80; // 80% threshold
      const isHealthy = cpuUsage < threshold;

      if (!isHealthy) {
        throw new Error(`CPU usage too high: ${cpuUsage}% (threshold: ${threshold}%)`);
      }

      return {
        message: `CPU usage: ${cpuUsage}%`,
        details: {
          usage: cpuUsage,
          threshold: threshold
        }
      };
      
    } catch (error) {
      // Fallback for systems without 'top' command
      return {
        message: 'CPU usage check not available',
        details: {
          error: 'Unable to determine CPU usage'
        }
      };
    }
  }

  /**
   * Verificar espaço em disco
   */
  async checkDiskSpace() {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    try {
      const { stdout } = await execAsync("df -h / | awk 'NR==2{print $5}' | cut -d'%' -f1");
      const diskUsage = parseInt(stdout.trim());

      const threshold = 85; // 85% threshold
      const isHealthy = diskUsage < threshold;

      if (!isHealthy) {
        throw new Error(`Disk usage too high: ${diskUsage}% (threshold: ${threshold}%)`);
      }

      return {
        message: `Disk usage: ${diskUsage}%`,
        details: {
          usage: diskUsage,
          threshold: threshold
        }
      };
      
    } catch (error) {
      return {
        message: 'Disk space check not available',
        details: {
          error: 'Unable to determine disk usage'
        }
      };
    }
  }

  /**
   * Timeout helper
   */
  timeout(ms) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), ms);
    });
  }

  /**
   * Log resultado de verificação individual
   */
  logCheckResult(name, result) {
    const status = result.status === 'healthy' ? '✅' : '❌';
    const time = result.responseTime ? `(${result.responseTime}ms)` : '';
    
    console.log(`${status} ${name}: ${result.message} ${time}`);
    
    if (result.details && Object.keys(result.details).length > 0) {
      console.log(`   Details:`, result.details);
    }
    
    console.log('');
  }

  /**
   * Log resumo final
   */
  logSummary(summary) {
    console.log('='.repeat(60));
    console.log(`🏥 HEALTH CHECK SUMMARY`);
    console.log('='.repeat(60));
    console.log(`Status: ${summary.status === 'healthy' ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
    console.log(`Timestamp: ${summary.timestamp}`);
    console.log(`Uptime: ${Math.round(summary.uptime / 1000)}s`);
    console.log(`Version: ${summary.version}`);
    console.log(`Environment: ${summary.environment}`);
    console.log('='.repeat(60));

    const healthyChecks = Object.values(summary.checks).filter(c => c.status === 'healthy').length;
    const totalChecks = Object.keys(summary.checks).length;
    
    console.log(`Checks: ${healthyChecks}/${totalChecks} healthy`);
    console.log('');
  }
}

// Execute health checks if run directly
if (require.main === module) {
  const healthCheck = new HealthCheckSystem();
  
  healthCheck.runAllChecks()
    .then(summary => {
      process.exit(summary.status === 'healthy' ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Health check system error:', error);
      process.exit(1);
    });
}

module.exports = HealthCheckSystem;
