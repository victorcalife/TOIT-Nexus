/**
 * SERVIÇO DE PREDIÇÕES AUTOMÁTICAS
 * Gerencia execução automática de predições ML em background
 * 100% JavaScript - SEM TYPESCRIPT
 */

const { Pool } = require('pg');
const cron = require('node-cron');
const QuantumInsightsService = require('./QuantumInsightsService');
const MLCreditsService = require('./MLCreditsService');
const ML_CONFIG = require('../../config/ml-config');

class AutoPredictionsService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    this.isRunning = false;
    this.schedulerInterval = null;
    this.processingQueue = new Map();
  }

  /**
   * Inicializar o scheduler de predições automáticas
   */
  async initialize() {
    if (this.isRunning) {
      console.log('⚠️ [AUTO-PREDICTIONS] Scheduler já está rodando');
      return;
    }

    console.log('🚀 [AUTO-PREDICTIONS] Inicializando scheduler...');

    // Executar a cada 5 minutos
    this.schedulerInterval = cron.schedule('*/5 * * * *', async () => {
      await this.processPendingPredictions();
    }, {
      scheduled: false
    });

    // Iniciar o scheduler
    this.schedulerInterval.start();
    this.isRunning = true;

    console.log('✅ [AUTO-PREDICTIONS] Scheduler inicializado (executa a cada 5 minutos)');

    // Executar uma vez imediatamente para processar predições pendentes
    setTimeout(() => {
      this.processPendingPredictions();
    }, 5000);
  }

  /**
   * Parar o scheduler
   */
  stop() {
    if (this.schedulerInterval) {
      this.schedulerInterval.stop();
      this.schedulerInterval = null;
    }
    
    this.isRunning = false;
    console.log('🛑 [AUTO-PREDICTIONS] Scheduler parado');
  }

  /**
   * Processar predições pendentes
   */
  async processPendingPredictions() {
    if (this.processingQueue.size > 0) {
      console.log(`⏳ [AUTO-PREDICTIONS] Processamento em andamento (${this.processingQueue.size} na fila)`);
      return;
    }

    try {
      console.log('🔍 [AUTO-PREDICTIONS] Verificando predições pendentes...');

      // Buscar predições prontas para execução
      const result = await this.pool.query(`
        SELECT * FROM get_predictions_ready_to_run()
        LIMIT 10
      `);

      const pendingPredictions = result.rows;

      if (pendingPredictions.length === 0) {
        console.log('✅ [AUTO-PREDICTIONS] Nenhuma predição pendente');
        return;
      }

      console.log(`📋 [AUTO-PREDICTIONS] ${pendingPredictions.length} predições pendentes encontradas`);

      // Processar cada predição
      for (const prediction of pendingPredictions) {
        this.processingQueue.set(prediction.id, {
          startTime: Date.now(),
          status: 'processing'
        });

        // Processar em background (não bloquear)
        this.processSinglePrediction(prediction)
          .then(() => {
            this.processingQueue.delete(prediction.id);
          })
          .catch((error) => {
            console.error(`❌ [AUTO-PREDICTIONS] Erro na predição ${prediction.id}:`, error);
            this.processingQueue.delete(prediction.id);
          });
      }

    } catch (error) {
      console.error('❌ [AUTO-PREDICTIONS] Erro ao processar predições pendentes:', error);
    }
  }

  /**
   * Processar uma predição específica
   * @param {Object} prediction - Dados da predição
   */
  async processSinglePrediction(prediction) {
    const startTime = Date.now();
    
    try {
      console.log(`🔮 [AUTO-PREDICTIONS] Processando predição: ${prediction.prediction_name} (${prediction.prediction_type})`);

      // Verificar se o tenant tem créditos (para predições que consomem créditos)
      const needsCredits = this.predictionNeedsCredits(prediction.prediction_type);
      
      if (needsCredits) {
        const credits = await MLCreditsService.checkCredits(prediction.tenant_id);
        if (credits.credits_available < 1) {
          throw new Error('Créditos ML insuficientes para predição automática');
        }
      }

      // Obter dados para a predição
      const data = await this.getPredictionData(prediction);

      if (!data || data.length === 0) {
        throw new Error('Dados insuficientes para predição');
      }

      // Executar predição baseada no tipo
      let result;
      switch (prediction.prediction_type) {
        case 'sales_forecast':
          result = await this.processSalesForecast(data, prediction);
          break;
        case 'churn_prediction':
          result = await this.processChurnPrediction(data, prediction);
          break;
        case 'demand_forecast':
          result = await this.processDemandForecast(data, prediction);
          break;
        case 'cash_flow':
          result = await this.processCashFlow(data, prediction);
          break;
        case 'performance_analysis':
          result = await this.processPerformanceAnalysis(data, prediction);
          break;
        default:
          throw new Error(`Tipo de predição não suportado: ${prediction.prediction_type}`);
      }

      const processingTime = Date.now() - startTime;

      // Consumir créditos se necessário
      if (needsCredits) {
        await MLCreditsService.consumeCredits(
          prediction.tenant_id,
          1,
          'auto_prediction',
          null,
          {
            insightType: prediction.prediction_type,
            inputData: { dataPoints: data.length },
            resultData: result,
            processingTimeMs: processingTime
          }
        );
      }

      // Atualizar registro da predição
      await this.updatePredictionResult(prediction.id, {
        success: true,
        result,
        processingTime,
        error: null
      });

      // Processar saídas configuradas (notificações, webhooks, etc.)
      await this.processOutputs(prediction, result);

      console.log(`✅ [AUTO-PREDICTIONS] Predição concluída: ${prediction.prediction_name} (${processingTime}ms)`);

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      console.error(`❌ [AUTO-PREDICTIONS] Erro na predição ${prediction.prediction_name}:`, error.message);

      // Atualizar registro com erro
      await this.updatePredictionResult(prediction.id, {
        success: false,
        result: null,
        processingTime,
        error: error.message
      });
    }
  }

  /**
   * Verificar se predição precisa de créditos
   * @param {string} predictionType - Tipo da predição
   * @returns {boolean} Se precisa de créditos
   */
  predictionNeedsCredits(predictionType) {
    // Predições básicas não consomem créditos, apenas as avançadas
    const freeTypes = ['performance_analysis'];
    return !freeTypes.includes(predictionType);
  }

  /**
   * Obter dados para predição
   * @param {Object} prediction - Configuração da predição
   * @returns {Array} Dados para análise
   */
  async getPredictionData(prediction) {
    try {
      const config = prediction.data_source_config;
      
      // Simular obtenção de dados baseada na configuração
      // Em implementação real, conectaria com fontes de dados reais
      
      const mockData = this.generateMockData(prediction.prediction_type, config);
      
      console.log(`📊 [AUTO-PREDICTIONS] Dados obtidos: ${mockData.length} registros para ${prediction.prediction_name}`);
      
      return mockData;

    } catch (error) {
      console.error(`❌ [AUTO-PREDICTIONS] Erro ao obter dados para ${prediction.prediction_name}:`, error);
      throw error;
    }
  }

  /**
   * Gerar dados mock para teste
   * @param {string} predictionType - Tipo da predição
   * @param {Object} config - Configuração da fonte de dados
   * @returns {Array} Dados mock
   */
  generateMockData(predictionType, config) {
    const days = config.lookback_days || 90;
    const data = [];
    const baseValue = 1000;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Gerar valor com tendência e variação
      const trend = (days - i) * 0.5; // Tendência de crescimento
      const seasonal = Math.sin((i / 7) * Math.PI) * 50; // Variação semanal
      const random = (Math.random() - 0.5) * 100; // Variação aleatória
      
      const value = Math.max(0, baseValue + trend + seasonal + random);
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100
      });
    }
    
    return data;
  }

  /**
   * Processar previsão de vendas
   * @param {Array} data - Dados históricos
   * @param {Object} prediction - Configuração da predição
   * @returns {Object} Resultado da predição
   */
  async processSalesForecast(data, prediction) {
    const config = prediction.data_source_config;
    const forecastDays = config.forecast_days || 30;
    
    return await QuantumInsightsService.processInsight(data, 'prediction', {
      forecastDays,
      useCache: false
    });
  }

  /**
   * Processar predição de churn
   * @param {Array} data - Dados de clientes
   * @param {Object} prediction - Configuração da predição
   * @returns {Object} Resultado da predição
   */
  async processChurnPrediction(data, prediction) {
    return await QuantumInsightsService.processInsight(data, 'anomaly', {
      threshold: prediction.data_source_config.risk_threshold || 0.7,
      useCache: false
    });
  }

  /**
   * Processar previsão de demanda
   * @param {Array} data - Dados de produtos
   * @param {Object} prediction - Configuração da predição
   * @returns {Object} Resultado da predição
   */
  async processDemandForecast(data, prediction) {
    const config = prediction.data_source_config;
    const forecastDays = config.forecast_days || 14;
    
    return await QuantumInsightsService.processInsight(data, 'prediction', {
      forecastDays,
      seasonalAdjustment: config.seasonal_adjustment || false,
      useCache: false
    });
  }

  /**
   * Processar fluxo de caixa
   * @param {Array} data - Dados financeiros
   * @param {Object} prediction - Configuração da predição
   * @returns {Object} Resultado da predição
   */
  async processCashFlow(data, prediction) {
    const config = prediction.data_source_config;
    const forecastDays = config.forecast_days || 60;
    
    return await QuantumInsightsService.processInsight(data, 'prediction', {
      forecastDays,
      useCache: false
    });
  }

  /**
   * Processar análise de performance
   * @param {Array} data - Dados de performance
   * @param {Object} prediction - Configuração da predição
   * @returns {Object} Resultado da análise
   */
  async processPerformanceAnalysis(data, prediction) {
    return await QuantumInsightsService.processInsight(data, 'optimization', {
      useCache: false
    });
  }

  /**
   * Atualizar resultado da predição
   * @param {string} predictionId - ID da predição
   * @param {Object} resultData - Dados do resultado
   */
  async updatePredictionResult(predictionId, resultData) {
    try {
      await this.pool.query(`
        UPDATE auto_predictions 
        SET 
          last_run_at = NOW(),
          next_run_at = calculate_next_run(schedule_frequency, schedule_time, NOW()),
          last_result = $2,
          last_error = $3,
          run_count = run_count + 1,
          success_count = success_count + CASE WHEN $4 THEN 1 ELSE 0 END,
          updated_at = NOW()
        WHERE id = $1
      `, [
        predictionId,
        resultData.result ? JSON.stringify(resultData.result) : null,
        resultData.error,
        resultData.success
      ]);

      console.log(`📝 [AUTO-PREDICTIONS] Resultado atualizado para predição ${predictionId}`);

    } catch (error) {
      console.error(`❌ [AUTO-PREDICTIONS] Erro ao atualizar resultado:`, error);
    }
  }

  /**
   * Processar saídas configuradas (notificações, webhooks, etc.)
   * @param {Object} prediction - Configuração da predição
   * @param {Object} result - Resultado da predição
   */
  async processOutputs(prediction, result) {
    try {
      const outputConfig = prediction.output_config;
      
      if (outputConfig.notifications?.email) {
        console.log(`📧 [AUTO-PREDICTIONS] Enviando notificação por email para ${prediction.prediction_name}`);
        // Implementar envio de email
      }
      
      if (outputConfig.notifications?.webhook) {
        console.log(`🔗 [AUTO-PREDICTIONS] Enviando webhook para ${prediction.prediction_name}`);
        // Implementar webhook
      }
      
      if (outputConfig.notifications?.dashboard) {
        console.log(`📊 [AUTO-PREDICTIONS] Atualizando dashboard para ${prediction.prediction_name}`);
        // Implementar atualização de dashboard
      }

    } catch (error) {
      console.error(`❌ [AUTO-PREDICTIONS] Erro ao processar saídas:`, error);
    }
  }

  /**
   * Obter estatísticas do scheduler
   * @returns {Object} Estatísticas
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      processingQueueSize: this.processingQueue.size,
      currentlyProcessing: Array.from(this.processingQueue.entries()).map(([id, data]) => ({
        predictionId: id,
        startTime: data.startTime,
        duration: Date.now() - data.startTime,
        status: data.status
      }))
    };
  }

  /**
   * Fechar conexões
   */
  async close() {
    this.stop();
    await this.pool.end();
    console.log('🔌 [AUTO-PREDICTIONS] Conexões fechadas');
  }
}

module.exports = new AutoPredictionsService();
