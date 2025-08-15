/**
 * SERVIÇO DE SCHEDULER PARA ML
 * Sistema avançado de agendamento para predições automáticas
 * 100% JavaScript - SEM TYPESCRIPT
 */

const cron = require('node-cron');
const { Pool } = require('pg');
const AutoPredictionsService = require('../ml/AutoPredictionsService');
const MLCreditsService = require('../ml/MLCreditsService');

class MLSchedulerService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    this.scheduledJobs = new Map();
    this.isRunning = false;
    this.stats = {
      totalJobs: 0,
      successfulJobs: 0,
      failedJobs: 0,
      lastRun: null,
      uptime: Date.now()
    };
  }

  /**
   * Inicializar o scheduler
   */
  async initialize() {
    if (this.isRunning) {
      console.log('⚠️ [ML-SCHEDULER] Scheduler já está rodando');
      return;
    }

    console.log('🚀 [ML-SCHEDULER] Inicializando scheduler ML...');

    try {
      // Verificar conexão com banco
      await this.pool.query('SELECT 1');
      
      // Configurar jobs principais
      await this.setupMainJobs();
      
      // Configurar jobs dinâmicos
      await this.setupDynamicJobs();
      
      this.isRunning = true;
      console.log('✅ [ML-SCHEDULER] Scheduler ML inicializado com sucesso');

    } catch (error) {
      console.error('❌ [ML-SCHEDULER] Erro ao inicializar scheduler:', error);
      throw error;
    }
  }

  /**
   * Configurar jobs principais do sistema
   */
  async setupMainJobs() {
    // Job principal: verificar predições pendentes a cada 5 minutos
    const mainJob = cron.schedule('*/5 * * * *', async () => {
      await this.processPendingPredictions();
    }, {
      scheduled: false,
      name: 'main-predictions-check'
    });

    // Job de limpeza: executar diariamente às 2h da manhã
    const cleanupJob = cron.schedule('0 2 * * *', async () => {
      await this.performDailyCleanup();
    }, {
      scheduled: false,
      name: 'daily-cleanup'
    });

    // Job de estatísticas: executar a cada hora
    const statsJob = cron.schedule('0 * * * *', async () => {
      await this.updateStatistics();
    }, {
      scheduled: false,
      name: 'hourly-stats'
    });

    // Job de health check: executar a cada 15 minutos
    const healthJob = cron.schedule('*/15 * * * *', async () => {
      await this.performHealthCheck();
    }, {
      scheduled: false,
      name: 'health-check'
    });

    // Armazenar jobs
    this.scheduledJobs.set('main-predictions', mainJob);
    this.scheduledJobs.set('daily-cleanup', cleanupJob);
    this.scheduledJobs.set('hourly-stats', statsJob);
    this.scheduledJobs.set('health-check', healthJob);

    // Iniciar jobs
    mainJob.start();
    cleanupJob.start();
    statsJob.start();
    healthJob.start();

    console.log('✅ [ML-SCHEDULER] Jobs principais configurados');
  }

  /**
   * Configurar jobs dinâmicos baseados nas predições
   */
  async setupDynamicJobs() {
    try {
      // Buscar predições com horários específicos
      const result = await this.pool.query(`
        SELECT 
          id,
          tenant_id,
          prediction_name,
          schedule_frequency,
          schedule_time,
          next_run_at
        FROM auto_predictions 
        WHERE is_active = true 
        AND schedule_frequency IN ('daily', 'weekly', 'monthly')
        AND schedule_time IS NOT NULL
      `);

      for (const prediction of result.rows) {
        await this.createDynamicJob(prediction);
      }

      console.log(`✅ [ML-SCHEDULER] ${result.rows.length} jobs dinâmicos configurados`);

    } catch (error) {
      console.error('❌ [ML-SCHEDULER] Erro ao configurar jobs dinâmicos:', error);
    }
  }

  /**
   * Criar job dinâmico para predição específica
   */
  async createDynamicJob(prediction) {
    const jobId = `prediction-${prediction.id}`;
    
    // Remover job existente se houver
    if (this.scheduledJobs.has(jobId)) {
      this.scheduledJobs.get(jobId).stop();
      this.scheduledJobs.delete(jobId);
    }

    try {
      // Converter horário para cron expression
      const cronExpression = this.convertToCronExpression(
        prediction.schedule_frequency,
        prediction.schedule_time
      );

      if (!cronExpression) {
        console.log(`⚠️ [ML-SCHEDULER] Não foi possível criar cron para predição ${prediction.id}`);
        return;
      }

      // Criar job
      const job = cron.schedule(cronExpression, async () => {
        await this.executePrediction(prediction.id);
      }, {
        scheduled: false,
        name: jobId
      });

      this.scheduledJobs.set(jobId, job);
      job.start();

      console.log(`✅ [ML-SCHEDULER] Job dinâmico criado: ${prediction.prediction_name} (${cronExpression})`);

    } catch (error) {
      console.error(`❌ [ML-SCHEDULER] Erro ao criar job para predição ${prediction.id}:`, error);
    }
  }

  /**
   * Converter frequência e horário para cron expression
   */
  convertToCronExpression(frequency, time) {
    if (!time) return null;

    const [hours, minutes] = time.split(':').map(Number);
    
    switch (frequency) {
      case 'daily':
        return `${minutes} ${hours} * * *`;
      case 'weekly':
        return `${minutes} ${hours} * * 1`; // Segunda-feira
      case 'monthly':
        return `${minutes} ${hours} 1 * *`; // Dia 1 do mês
      default:
        return null;
    }
  }

  /**
   * Processar predições pendentes
   */
  async processPendingPredictions() {
    try {
      console.log('🔍 [ML-SCHEDULER] Verificando predições pendentes...');

      const result = await this.pool.query(`
        SELECT COUNT(*) as pending_count
        FROM auto_predictions 
        WHERE is_active = true 
        AND next_run_at <= NOW()
      `);

      const pendingCount = parseInt(result.rows[0].pending_count);

      if (pendingCount > 0) {
        console.log(`📋 [ML-SCHEDULER] ${pendingCount} predições pendentes encontradas`);
        
        // Delegar para AutoPredictionsService
        await AutoPredictionsService.processPendingPredictions();
        
        this.stats.totalJobs += pendingCount;
        this.stats.lastRun = new Date().toISOString();
      }

    } catch (error) {
      console.error('❌ [ML-SCHEDULER] Erro ao processar predições pendentes:', error);
      this.stats.failedJobs++;
    }
  }

  /**
   * Executar predição específica
   */
  async executePrediction(predictionId) {
    try {
      console.log(`🔮 [ML-SCHEDULER] Executando predição específica: ${predictionId}`);

      // Buscar dados da predição
      const result = await this.pool.query(`
        SELECT * FROM auto_predictions 
        WHERE id = $1 AND is_active = true
      `, [predictionId]);

      if (result.rows.length === 0) {
        console.log(`⚠️ [ML-SCHEDULER] Predição ${predictionId} não encontrada ou inativa`);
        return;
      }

      const prediction = result.rows[0];

      // Executar através do AutoPredictionsService
      await AutoPredictionsService.processSinglePrediction(prediction);

      this.stats.successfulJobs++;
      console.log(`✅ [ML-SCHEDULER] Predição ${predictionId} executada com sucesso`);

    } catch (error) {
      console.error(`❌ [ML-SCHEDULER] Erro ao executar predição ${predictionId}:`, error);
      this.stats.failedJobs++;
    }
  }

  /**
   * Limpeza diária
   */
  async performDailyCleanup() {
    try {
      console.log('🧹 [ML-SCHEDULER] Iniciando limpeza diária...');

      // Limpar histórico antigo
      const cleanupResult = await this.pool.query(`
        SELECT cleanup_old_ml_usage() as deleted_count
      `);

      const deletedCount = cleanupResult.rows[0].deleted_count;

      // Atualizar estatísticas
      await this.pool.query(`
        UPDATE auto_predictions 
        SET updated_at = NOW() 
        WHERE last_run_at < NOW() - INTERVAL '7 days'
        AND is_active = false
      `);

      console.log(`✅ [ML-SCHEDULER] Limpeza concluída: ${deletedCount} registros removidos`);

    } catch (error) {
      console.error('❌ [ML-SCHEDULER] Erro na limpeza diária:', error);
    }
  }

  /**
   * Atualizar estatísticas
   */
  async updateStatistics() {
    try {
      // Buscar estatísticas do banco
      const statsResult = await this.pool.query(`
        SELECT 
          COUNT(*) as total_predictions,
          COUNT(*) FILTER (WHERE is_active = true) as active_predictions,
          COUNT(*) FILTER (WHERE last_run_at > NOW() - INTERVAL '24 hours') as recent_runs,
          AVG(success_count::DECIMAL / NULLIF(run_count, 0)) as avg_success_rate
        FROM auto_predictions
      `);

      const dbStats = statsResult.rows[0];

      // Atualizar estatísticas internas
      this.stats.totalPredictions = parseInt(dbStats.total_predictions);
      this.stats.activePredictions = parseInt(dbStats.active_predictions);
      this.stats.recentRuns = parseInt(dbStats.recent_runs);
      this.stats.avgSuccessRate = parseFloat(dbStats.avg_success_rate) || 0;
      this.stats.lastStatsUpdate = new Date().toISOString();

      console.log(`📊 [ML-SCHEDULER] Estatísticas atualizadas: ${this.stats.activePredictions} predições ativas`);

    } catch (error) {
      console.error('❌ [ML-SCHEDULER] Erro ao atualizar estatísticas:', error);
    }
  }

  /**
   * Health check do sistema
   */
  async performHealthCheck() {
    try {
      // Verificar conexão com banco
      await this.pool.query('SELECT 1');

      // Verificar se AutoPredictionsService está funcionando
      const serviceStats = AutoPredictionsService.getStats();

      // Verificar jobs ativos
      const activeJobs = Array.from(this.scheduledJobs.values()).filter(job => job.running).length;

      this.stats.healthCheck = {
        database: 'ok',
        autoPredictionsService: serviceStats.isRunning ? 'ok' : 'error',
        activeJobs,
        timestamp: new Date().toISOString()
      };

      if (!serviceStats.isRunning) {
        console.log('⚠️ [ML-SCHEDULER] AutoPredictionsService não está rodando, tentando reiniciar...');
        await AutoPredictionsService.initialize();
      }

    } catch (error) {
      console.error('❌ [ML-SCHEDULER] Erro no health check:', error);
      this.stats.healthCheck = {
        database: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Reconfigurar jobs dinâmicos
   */
  async reconfigureDynamicJobs() {
    console.log('🔄 [ML-SCHEDULER] Reconfigurando jobs dinâmicos...');

    // Parar todos os jobs dinâmicos
    for (const [jobId, job] of this.scheduledJobs.entries()) {
      if (jobId.startsWith('prediction-')) {
        job.stop();
        this.scheduledJobs.delete(jobId);
      }
    }

    // Reconfigurar
    await this.setupDynamicJobs();
  }

  /**
   * Obter estatísticas do scheduler
   */
  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      activeJobs: this.scheduledJobs.size,
      uptime: Date.now() - this.stats.uptime,
      jobs: Array.from(this.scheduledJobs.keys())
    };
  }

  /**
   * Parar o scheduler
   */
  async stop() {
    console.log('🛑 [ML-SCHEDULER] Parando scheduler...');

    // Parar todos os jobs
    for (const [jobId, job] of this.scheduledJobs.entries()) {
      job.stop();
      console.log(`🛑 [ML-SCHEDULER] Job parado: ${jobId}`);
    }

    this.scheduledJobs.clear();
    this.isRunning = false;

    console.log('✅ [ML-SCHEDULER] Scheduler parado com sucesso');
  }

  /**
   * Fechar conexões
   */
  async close() {
    await this.stop();
    await this.pool.end();
    console.log('🔌 [ML-SCHEDULER] Conexões fechadas');
  }
}

module.exports = new MLSchedulerService();
