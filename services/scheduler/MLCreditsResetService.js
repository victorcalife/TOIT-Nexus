/**
 * SERVIÇO DE RESET MENSAL DE CRÉDITOS ML
 * Sistema automático para resetar créditos ML mensalmente
 * 100% JavaScript - SEM TYPESCRIPT
 */

import cron from 'node-cron';
import { Pool } from 'pg';
import MLCreditsService from '../ml/MLCreditsService.js';

class MLCreditsResetService
{
  constructor()
  {
    this.pool = new Pool( {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    } );

    this.resetJob = null;
    this.isRunning = false;
    this.stats = {
      lastReset: null,
      totalResets: 0,
      successfulResets: 0,
      failedResets: 0,
      nextScheduledReset: null
    };
  }

  /**
   * Inicializar o serviço de reset
   */
  async initialize()
  {
    if ( this.isRunning )
    {
      console.log( '⚠️ [ML-CREDITS-RESET] Serviço já está rodando' );
      return;
    }

    console.log( '🚀 [ML-CREDITS-RESET] Inicializando serviço de reset...' );

    try
    {
      // Verificar conexão com banco
      await this.pool.query( 'SELECT 1' );

      // Configurar job de reset mensal
      await this.setupResetJob();

      // Verificar se há resets pendentes
      await this.checkPendingResets();

      this.isRunning = true;
      console.log( '✅ [ML-CREDITS-RESET] Serviço inicializado com sucesso' );

    } catch ( error )
    {
      console.error( '❌ [ML-CREDITS-RESET] Erro ao inicializar serviço:', error );
      throw error;
    }
  }

  /**
   * Configurar job de reset mensal
   */
  async setupResetJob()
  {
    // Executar todo dia 1º do mês às 00:01
    this.resetJob = cron.schedule( '1 0 1 * *', async () =>
    {
      await this.performMonthlyReset();
    }, {
      scheduled: false,
      name: 'monthly-credits-reset',
      timezone: 'America/Sao_Paulo'
    } );

    // Também executar diariamente para verificar resets pendentes
    this.dailyCheckJob = cron.schedule( '0 1 * * *', async () =>
    {
      await this.checkPendingResets();
    }, {
      scheduled: false,
      name: 'daily-reset-check',
      timezone: 'America/Sao_Paulo'
    } );

    this.resetJob.start();
    this.dailyCheckJob.start();

    // Calcular próximo reset
    const nextReset = this.calculateNextResetDate();
    this.stats.nextScheduledReset = nextReset;

    console.log( `✅ [ML-CREDITS-RESET] Job configurado - Próximo reset: ${ nextReset }` );
  }

  /**
   * Calcular próxima data de reset
   */
  calculateNextResetDate()
  {
    const now = new Date();
    const nextMonth = new Date( now.getFullYear(), now.getMonth() + 1, 1, 0, 1, 0 );
    return nextMonth.toISOString();
  }

  /**
   * Verificar resets pendentes
   */
  async checkPendingResets()
  {
    try
    {
      console.log( '🔍 [ML-CREDITS-RESET] Verificando resets pendentes...' );

      // Buscar tenants que precisam de reset
      const result = await this.pool.query( `
        SELECT 
          tenant_id,
          reset_date,
          last_reset_date,
          credits_total
        FROM ml_credits 
        WHERE is_active = true 
        AND reset_date <= NOW()
        AND (last_reset_date IS NULL OR last_reset_date < reset_date)
      `);

      const pendingResets = result.rows;

      if ( pendingResets.length > 0 )
      {
        console.log( `📋 [ML-CREDITS-RESET] ${ pendingResets.length } resets pendentes encontrados` );

        for ( const tenant of pendingResets )
        {
          await this.resetTenantCredits( tenant.tenant_id );
        }
      } else
      {
        console.log( '✅ [ML-CREDITS-RESET] Nenhum reset pendente' );
      }

    } catch ( error )
    {
      console.error( '❌ [ML-CREDITS-RESET] Erro ao verificar resets pendentes:', error );
    }
  }

  /**
   * Executar reset mensal completo
   */
  async performMonthlyReset()
  {
    const startTime = Date.now();

    try
    {
      console.log( '🔄 [ML-CREDITS-RESET] Iniciando reset mensal de créditos...' );

      // Buscar todos os tenants ativos
      const result = await this.pool.query( `
        SELECT DISTINCT tenant_id 
        FROM ml_credits 
        WHERE is_active = true
      `);

      const tenants = result.rows;
      let successCount = 0;
      let failCount = 0;

      console.log( `📊 [ML-CREDITS-RESET] Processando ${ tenants.length } tenants...` );

      // Processar cada tenant
      for ( const tenant of tenants )
      {
        try
        {
          await this.resetTenantCredits( tenant.tenant_id );
          successCount++;
        } catch ( error )
        {
          console.error( `❌ [ML-CREDITS-RESET] Erro no reset do tenant ${ tenant.tenant_id }:`, error );
          failCount++;
        }
      }

      const duration = Date.now() - startTime;

      // Atualizar estatísticas
      this.stats.lastReset = new Date().toISOString();
      this.stats.totalResets += tenants.length;
      this.stats.successfulResets += successCount;
      this.stats.failedResets += failCount;
      this.stats.nextScheduledReset = this.calculateNextResetDate();

      // Log de resultado
      console.log( `✅ [ML-CREDITS-RESET] Reset mensal concluído em ${ duration }ms` );
      console.log( `📊 [ML-CREDITS-RESET] Sucessos: ${ successCount }, Falhas: ${ failCount }` );

      // Registrar no banco para auditoria
      await this.logResetEvent( 'monthly_reset', {
        totalTenants: tenants.length,
        successCount,
        failCount,
        duration
      } );

    } catch ( error )
    {
      console.error( '❌ [ML-CREDITS-RESET] Erro no reset mensal:', error );

      await this.logResetEvent( 'monthly_reset_error', {
        error: error.message,
        timestamp: new Date().toISOString()
      } );
    }
  }

  /**
   * Resetar créditos de um tenant específico
   */
  async resetTenantCredits( tenantId )
  {
    try
    {
      console.log( `🔄 [ML-CREDITS-RESET] Resetando créditos do tenant: ${ tenantId }` );

      const result = await MLCreditsService.resetMonthlyCredits( tenantId );

      if ( result.success )
      {
        console.log( `✅ [ML-CREDITS-RESET] Reset concluído - Tenant: ${ tenantId }, Créditos: ${ result.creditsTotal }` );
        return result;
      } else
      {
        throw new Error( 'Reset falhou no MLCreditsService' );
      }

    } catch ( error )
    {
      console.error( `❌ [ML-CREDITS-RESET] Erro no reset do tenant ${ tenantId }:`, error );
      throw error;
    }
  }

  /**
   * Registrar evento de reset para auditoria
   */
  async logResetEvent( eventType, data )
  {
    try
    {
      await this.pool.query( `
        INSERT INTO ml_usage_history (
          tenant_id,
          usage_type,
          context,
          credits_consumed,
          success,
          result_data,
          created_at
        ) VALUES (
          'system',
          'credits_reset',
          $1,
          0,
          $2,
          $3,
          NOW()
        )
      `, [
        eventType,
        eventType.includes( 'error' ) ? false : true,
        JSON.stringify( data )
      ] );

    } catch ( error )
    {
      console.error( '❌ [ML-CREDITS-RESET] Erro ao registrar evento:', error );
    }
  }

  /**
   * Forçar reset de um tenant específico
   */
  async forceResetTenant( tenantId )
  {
    try
    {
      console.log( `🔧 [ML-CREDITS-RESET] Reset forçado para tenant: ${ tenantId }` );

      const result = await this.resetTenantCredits( tenantId );

      await this.logResetEvent( 'forced_reset', {
        tenantId,
        timestamp: new Date().toISOString(),
        result
      } );

      return result;

    } catch ( error )
    {
      console.error( `❌ [ML-CREDITS-RESET] Erro no reset forçado:`, error );
      throw error;
    }
  }

  /**
   * Obter relatório de resets
   */
  async getResetReport( period = 'month' )
  {
    try
    {
      let dateFilter;
      switch ( period )
      {
        case 'week':
          dateFilter = "created_at >= NOW() - INTERVAL '7 days'";
          break;
        case 'month':
          dateFilter = "created_at >= NOW() - INTERVAL '30 days'";
          break;
        case 'year':
          dateFilter = "created_at >= NOW() - INTERVAL '1 year'";
          break;
        default:
          dateFilter = "created_at >= NOW() - INTERVAL '30 days'";
      }

      const result = await this.pool.query( `
        SELECT 
          context,
          success,
          result_data,
          created_at
        FROM ml_usage_history
        WHERE usage_type = 'credits_reset'
        AND ${ dateFilter }
        ORDER BY created_at DESC
      `);

      return {
        period,
        events: result.rows,
        summary: {
          totalEvents: result.rows.length,
          successfulEvents: result.rows.filter( r => r.success ).length,
          failedEvents: result.rows.filter( r => !r.success ).length
        }
      };

    } catch ( error )
    {
      console.error( '❌ [ML-CREDITS-RESET] Erro ao gerar relatório:', error );
      throw error;
    }
  }

  /**
   * Obter próximas datas de reset por tenant
   */
  async getUpcomingResets()
  {
    try
    {
      const result = await this.pool.query( `
        SELECT 
          mc.tenant_id,
          mc.reset_date,
          mc.last_reset_date,
          mc.credits_total,
          sp.display_name as plan_name
        FROM ml_credits mc
        JOIN subscription_plans sp ON mc.subscription_plan_id = sp.id
        WHERE mc.is_active = true
        ORDER BY mc.reset_date ASC
      `);

      return result.rows.map( row => ( {
        tenantId: row.tenant_id,
        planName: row.plan_name,
        nextReset: row.reset_date,
        lastReset: row.last_reset_date,
        creditsTotal: row.credits_total,
        daysUntilReset: Math.ceil( ( new Date( row.reset_date ) - new Date() ) / ( 1000 * 60 * 60 * 24 ) )
      } ) );

    } catch ( error )
    {
      console.error( '❌ [ML-CREDITS-RESET] Erro ao buscar próximos resets:', error );
      throw error;
    }
  }

  /**
   * Obter estatísticas do serviço
   */
  getStats()
  {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      hasResetJob: !!this.resetJob,
      hasDailyCheckJob: !!this.dailyCheckJob,
      uptime: this.isRunning ? Date.now() - this.stats.startTime : 0
    };
  }

  /**
   * Parar o serviço
   */
  async stop()
  {
    console.log( '🛑 [ML-CREDITS-RESET] Parando serviço de reset...' );

    if ( this.resetJob )
    {
      this.resetJob.stop();
      this.resetJob = null;
    }

    if ( this.dailyCheckJob )
    {
      this.dailyCheckJob.stop();
      this.dailyCheckJob = null;
    }

    this.isRunning = false;
    console.log( '✅ [ML-CREDITS-RESET] Serviço parado com sucesso' );
  }

  /**
   * Fechar conexões
   */
  async close()
  {
    await this.stop();
    await this.pool.end();
    console.log( '🔌 [ML-CREDITS-RESET] Conexões fechadas' );
  }
}

export default new MLCreditsResetService();
