/**
 * MONITOR DE PERFORMANCE EM PRODUÇÃO
 * Monitora métricas de performance do sistema em tempo real
 * 100% JavaScript - SEM TYPESCRIPT
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      responseTimes: [],
      errors: 0,
      memoryUsage: [],
      cpuUsage: [],
      startTime: Date.now()
    };
    
    this.isMonitoring = false;
    this.monitoringInterval = null;
  }

  /**
   * INICIAR MONITORAMENTO
   */
  startMonitoring() {
    if (this.isMonitoring) {
      console.log('📊 [MONITOR] Monitoramento já está ativo');
      return;
    }

    console.log('🚀 [MONITOR] Iniciando monitoramento de performance...');
    this.isMonitoring = true;
    this.metrics.startTime = Date.now();

    // Coletar métricas a cada 30 segundos
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 30000);

    // Relatório a cada 5 minutos
    setInterval(() => {
      this.generateReport();
    }, 300000);

    console.log('✅ [MONITOR] Monitoramento ativo - relatórios a cada 5 minutos');
  }

  /**
   * PARAR MONITORAMENTO
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      console.log('📊 [MONITOR] Monitoramento já está inativo');
      return;
    }

    console.log('🛑 [MONITOR] Parando monitoramento...');
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    // Relatório final
    this.generateFinalReport();
    console.log('✅ [MONITOR] Monitoramento parado');
  }

  /**
   * MIDDLEWARE DE MONITORAMENTO
   */
  middleware() {
    return (req, res, next) => {
      const startTime = process.hrtime.bigint();
      
      // Incrementar contador de requests
      this.metrics.requests++;

      // Interceptar resposta para medir tempo
      const originalSend = res.send;
      res.send = (data) => {
        const endTime = process.hrtime.bigint();
        const responseTime = Number(endTime - startTime) / 1000000; // ms
        
        // Armazenar tempo de resposta
        this.metrics.responseTimes.push(responseTime);
        
        // Manter apenas últimas 1000 medições
        if (this.metrics.responseTimes.length > 1000) {
          this.metrics.responseTimes.shift();
        }

        // Verificar se é erro
        if (res.statusCode >= 400) {
          this.metrics.errors++;
        }

        return originalSend.call(res, data);
      };

      next();
    };
  }

  /**
   * COLETAR MÉTRICAS DO SISTEMA
   */
  collectMetrics() {
    // Métricas de memória
    const memUsage = process.memoryUsage();
    this.metrics.memoryUsage.push({
      timestamp: Date.now(),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      rss: Math.round(memUsage.rss / 1024 / 1024) // MB
    });

    // Manter apenas últimas 100 medições
    if (this.metrics.memoryUsage.length > 100) {
      this.metrics.memoryUsage.shift();
    }

    // Métricas de CPU (aproximação usando uptime)
    const cpuUsage = process.cpuUsage();
    this.metrics.cpuUsage.push({
      timestamp: Date.now(),
      user: cpuUsage.user,
      system: cpuUsage.system
    });

    // Manter apenas últimas 100 medições
    if (this.metrics.cpuUsage.length > 100) {
      this.metrics.cpuUsage.shift();
    }
  }

  /**
   * CALCULAR ESTATÍSTICAS
   */
  calculateStats() {
    const now = Date.now();
    const uptime = Math.round((now - this.metrics.startTime) / 1000); // segundos

    // Estatísticas de tempo de resposta
    const responseTimes = this.metrics.responseTimes;
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;
    const maxResponseTime = responseTimes.length > 0 
      ? Math.max(...responseTimes) 
      : 0;
    const minResponseTime = responseTimes.length > 0 
      ? Math.min(...responseTimes) 
      : 0;

    // Estatísticas de memória
    const memUsage = this.metrics.memoryUsage;
    const currentMemory = memUsage.length > 0 
      ? memUsage[memUsage.length - 1] 
      : { heapUsed: 0, heapTotal: 0, rss: 0 };

    // Taxa de erro
    const errorRate = this.metrics.requests > 0 
      ? (this.metrics.errors / this.metrics.requests * 100).toFixed(2)
      : 0;

    // Requests por segundo
    const requestsPerSecond = uptime > 0 
      ? (this.metrics.requests / uptime).toFixed(2)
      : 0;

    return {
      uptime,
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      errorRate,
      requestsPerSecond,
      responseTime: {
        avg: avgResponseTime.toFixed(2),
        min: minResponseTime.toFixed(2),
        max: maxResponseTime.toFixed(2),
        samples: responseTimes.length
      },
      memory: currentMemory,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * GERAR RELATÓRIO PERIÓDICO
   */
  generateReport() {
    const stats = this.calculateStats();
    
    console.log('\n📊 [MONITOR] Relatório de Performance');
    console.log('=' .repeat(50));
    console.log(`⏱️  Uptime: ${stats.uptime}s`);
    console.log(`📈 Requests: ${stats.requests} (${stats.requestsPerSecond}/s)`);
    console.log(`❌ Erros: ${stats.errors} (${stats.errorRate}%)`);
    console.log(`⚡ Tempo Resposta: ${stats.responseTime.avg}ms (min: ${stats.responseTime.min}ms, max: ${stats.responseTime.max}ms)`);
    console.log(`💾 Memória: ${stats.memory.heapUsed}MB/${stats.memory.heapTotal}MB (RSS: ${stats.memory.rss}MB)`);
    console.log(`📅 Timestamp: ${stats.timestamp}`);
    console.log('=' .repeat(50));

    // Alertas de performance
    this.checkPerformanceAlerts(stats);
  }

  /**
   * VERIFICAR ALERTAS DE PERFORMANCE
   */
  checkPerformanceAlerts(stats) {
    const alerts = [];

    // Alerta de tempo de resposta alto
    if (parseFloat(stats.responseTime.avg) > 100) {
      alerts.push(`⚠️ Tempo de resposta alto: ${stats.responseTime.avg}ms`);
    }

    // Alerta de uso de memória alto
    if (stats.memory.heapUsed > 500) {
      alerts.push(`⚠️ Uso de memória alto: ${stats.memory.heapUsed}MB`);
    }

    // Alerta de taxa de erro alta
    if (parseFloat(stats.errorRate) > 5) {
      alerts.push(`⚠️ Taxa de erro alta: ${stats.errorRate}%`);
    }

    // Alerta de baixo throughput
    if (parseFloat(stats.requestsPerSecond) < 0.1 && stats.requests > 10) {
      alerts.push(`⚠️ Baixo throughput: ${stats.requestsPerSecond} req/s`);
    }

    if (alerts.length > 0) {
      console.log('\n🚨 [ALERTAS] Problemas de performance detectados:');
      alerts.forEach(alert => console.log(alert));
      console.log('');
    }
  }

  /**
   * GERAR RELATÓRIO FINAL
   */
  generateFinalReport() {
    const stats = this.calculateStats();
    
    console.log('\n📋 [MONITOR] Relatório Final de Performance');
    console.log('=' .repeat(60));
    console.log(`🕐 Duração Total: ${stats.uptime}s`);
    console.log(`📊 Total de Requests: ${stats.requests}`);
    console.log(`❌ Total de Erros: ${stats.errors}`);
    console.log(`📈 Taxa de Sucesso: ${(100 - parseFloat(stats.errorRate)).toFixed(2)}%`);
    console.log(`⚡ Performance Média: ${stats.responseTime.avg}ms`);
    console.log(`💾 Pico de Memória: ${Math.max(...this.metrics.memoryUsage.map(m => m.heapUsed))}MB`);
    console.log(`🎯 Throughput Médio: ${stats.requestsPerSecond} req/s`);
    
    // Avaliação geral
    const avgResponseTime = parseFloat(stats.responseTime.avg);
    const errorRate = parseFloat(stats.errorRate);
    
    let performance = 'EXCELENTE';
    if (avgResponseTime > 100 || errorRate > 5) {
      performance = 'PRECISA OTIMIZAÇÃO';
    } else if (avgResponseTime > 50 || errorRate > 1) {
      performance = 'BOA';
    }
    
    console.log(`🏆 Avaliação Geral: ${performance}`);
    console.log('=' .repeat(60));
  }

  /**
   * OBTER MÉTRICAS ATUAIS
   */
  getCurrentMetrics() {
    return this.calculateStats();
  }

  /**
   * RESETAR MÉTRICAS
   */
  resetMetrics() {
    this.metrics = {
      requests: 0,
      responseTimes: [],
      errors: 0,
      memoryUsage: [],
      cpuUsage: [],
      startTime: Date.now()
    };
    console.log('🔄 [MONITOR] Métricas resetadas');
  }
}

// Criar instância global
const performanceMonitor = new PerformanceMonitor();

// Iniciar monitoramento automaticamente em produção
if (process.env.NODE_ENV === 'production') {
  performanceMonitor.startMonitoring();
  
  // Parar monitoramento graciosamente
  process.on('SIGINT', () => {
    console.log('\n🛑 [MONITOR] Recebido SIGINT, parando monitoramento...');
    performanceMonitor.stopMonitoring();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 [MONITOR] Recebido SIGTERM, parando monitoramento...');
    performanceMonitor.stopMonitoring();
    process.exit(0);
  });
}

module.exports = performanceMonitor;
