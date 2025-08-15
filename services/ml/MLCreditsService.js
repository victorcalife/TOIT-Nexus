/**
 * SERVIÇO DE GERENCIAMENTO DE CRÉDITOS ML
 * Gerencia créditos ML para todos os tenants
 * 100% JavaScript - SEM TYPESCRIPT
 */

const { Pool } = require( 'pg' );
const ML_CONFIG = require( '../../config/ml-config' );

class MLCreditsService
{
  constructor()
  {
    this.pool = new Pool( {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    } );
  }

  /**
   * Verificar créditos disponíveis para um tenant
   * @param {string} tenantId - ID do tenant
   * @returns {Object} Informações dos créditos
   */
  async checkCredits( tenantId )
  {
    try
    {
      const result = await this.pool.query( `
        SELECT 
          mc.credits_total,
          mc.credits_used,
          mc.credits_available,
          mc.reset_date,
          mc.last_reset_date,
          sp.name as plan_name,
          sp.display_name as plan_display_name,
          sp.ml_credits_per_month
        FROM ml_credits mc
        JOIN subscription_plans sp ON mc.subscription_plan_id = sp.id
        WHERE mc.tenant_id = $1 AND mc.is_active = true
      `, [ tenantId ] );

      if ( result.rows.length === 0 )
      {
        // Tenant não tem créditos configurados
        return {
          credits_total: 0,
          credits_used: 0,
          credits_available: 0,
          reset_date: null,
          plan_name: null,
          needs_setup: true
        };
      }

      const credits = result.rows[ 0 ];

      // Verificar se precisa de reset automático
      if ( new Date( credits.reset_date ) <= new Date() )
      {
        console.log( `🔄 [ML-CREDITS] Reset automático necessário para tenant: ${ tenantId }` );
        await this.resetMonthlyCredits( tenantId );

        // Buscar dados atualizados
        return await this.checkCredits( tenantId );
      }

      return {
        credits_total: credits.credits_total,
        credits_used: credits.credits_used,
        credits_available: credits.credits_available,
        reset_date: credits.reset_date,
        last_reset_date: credits.last_reset_date,
        plan_name: credits.plan_name,
        plan_display_name: credits.plan_display_name,
        ml_credits_per_month: credits.ml_credits_per_month,
        needs_setup: false
      };

    } catch ( error )
    {
      console.error( '❌ [ML-CREDITS] Erro ao verificar créditos:', error );
      throw new Error( 'Erro ao verificar créditos ML' );
    }
  }

  /**
   * Consumir créditos ML
   * @param {string} tenantId - ID do tenant
   * @param {number} amount - Quantidade de créditos a consumir
   * @param {string} context - Contexto do uso
   * @param {string} userId - ID do usuário (opcional)
   * @param {Object} metadata - Dados adicionais (opcional)
   * @returns {boolean} Sucesso na operação
   */
  async consumeCredits( tenantId, amount = 1, context = 'manual', userId = null, metadata = {} )
  {
    const client = await this.pool.connect();

    try
    {
      await client.query( 'BEGIN' );

      // Verificar créditos disponíveis com lock
      const creditsResult = await client.query( `
        SELECT credits_available, credits_used, credits_total
        FROM ml_credits 
        WHERE tenant_id = $1 AND is_active = true
        FOR UPDATE
      `, [ tenantId ] );

      if ( creditsResult.rows.length === 0 )
      {
        throw new Error( 'Tenant não possui configuração de créditos ML' );
      }

      const currentCredits = creditsResult.rows[ 0 ];

      if ( currentCredits.credits_available < amount )
      {
        await client.query( 'ROLLBACK' );
        console.log( `❌ [ML-CREDITS] Créditos insuficientes - Tenant: ${ tenantId }, Disponível: ${ currentCredits.credits_available }, Necessário: ${ amount }` );
        return false;
      }

      // Consumir créditos
      const updateResult = await client.query( `
        UPDATE ml_credits 
        SET 
          credits_used = credits_used + $1,
          updated_at = NOW()
        WHERE tenant_id = $2 AND is_active = true
        RETURNING credits_available, credits_used
      `, [ amount, tenantId ] );

      const updatedCredits = updateResult.rows[ 0 ];

      // Registrar uso no histórico
      await this.logUsage( client, {
        tenantId,
        userId,
        usageType: 'manual_insight',
        insightType: metadata.insightType || 'unknown',
        context,
        creditsConsumed: amount,
        inputData: metadata.inputData || null,
        resultData: metadata.resultData || null,
        processingTimeMs: metadata.processingTimeMs || null,
        success: true,
        ipAddress: metadata.ipAddress || null,
        userAgent: metadata.userAgent || null
      } );

      await client.query( 'COMMIT' );

      console.log( `✅ [ML-CREDITS] Créditos consumidos - Tenant: ${ tenantId }, Consumido: ${ amount }, Restante: ${ updatedCredits.credits_available }` );

      return {
        success: true,
        creditsConsumed: amount,
        creditsRemaining: updatedCredits.credits_available,
        creditsUsed: updatedCredits.credits_used
      };

    } catch ( error )
    {
      await client.query( 'ROLLBACK' );
      console.error( '❌ [ML-CREDITS] Erro ao consumir créditos:', error );
      throw error;
    } finally
    {
      client.release();
    }
  }

  /**
   * Registrar uso no histórico
   * @param {Object} client - Cliente de banco de dados
   * @param {Object} usageData - Dados do uso
   */
  async logUsage( client, usageData )
  {
    await client.query( `
      INSERT INTO ml_usage_history (
        tenant_id,
        user_id,
        usage_type,
        insight_type,
        context,
        credits_consumed,
        input_data,
        result_data,
        processing_time_ms,
        success,
        error_message,
        ip_address,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      usageData.tenantId,
      usageData.userId,
      usageData.usageType,
      usageData.insightType,
      usageData.context,
      usageData.creditsConsumed,
      usageData.inputData ? JSON.stringify( usageData.inputData ) : null,
      usageData.resultData ? JSON.stringify( usageData.resultData ) : null,
      usageData.processingTimeMs,
      usageData.success,
      usageData.errorMessage || null,
      usageData.ipAddress,
      usageData.userAgent
    ] );
  }

  /**
   * Reset mensal de créditos para um tenant
   * @param {string} tenantId - ID do tenant
   * @returns {Object} Resultado do reset
   */
  async resetMonthlyCredits( tenantId )
  {
    try
    {
      const result = await this.pool.query( `
        UPDATE ml_credits 
        SET 
          credits_used = 0,
          last_reset_date = CURRENT_DATE,
          reset_date = CURRENT_DATE + INTERVAL '1 month',
          updated_at = NOW()
        WHERE tenant_id = $1 AND is_active = true
        RETURNING credits_total, reset_date
      `, [ tenantId ] );

      if ( result.rows.length === 0 )
      {
        throw new Error( 'Tenant não encontrado para reset de créditos' );
      }

      const resetData = result.rows[ 0 ];

      console.log( `🔄 [ML-CREDITS] Reset realizado - Tenant: ${ tenantId }, Créditos: ${ resetData.credits_total }, Próximo reset: ${ resetData.reset_date }` );

      return {
        success: true,
        creditsTotal: resetData.credits_total,
        nextResetDate: resetData.reset_date
      };

    } catch ( error )
    {
      console.error( '❌ [ML-CREDITS] Erro no reset mensal:', error );
      throw error;
    }
  }

  /**
   * Configurar créditos para um tenant (primeira vez ou mudança de plano)
   * @param {string} tenantId - ID do tenant
   * @param {string} planName - Nome do plano
   * @returns {Object} Configuração criada
   */
  async setupCreditsForTenant( tenantId, planName )
  {
    try
    {
      // Buscar plano
      const planResult = await this.pool.query( `
        SELECT id, ml_credits_per_month, display_name
        FROM subscription_plans 
        WHERE name = $1 AND is_active = true
      `, [ planName ] );

      if ( planResult.rows.length === 0 )
      {
        throw new Error( `Plano não encontrado: ${ planName }` );
      }

      const plan = planResult.rows[ 0 ];

      // Criar ou atualizar configuração de créditos
      const result = await this.pool.query( `
        INSERT INTO ml_credits (
          tenant_id,
          subscription_plan_id,
          credits_total,
          credits_used,
          reset_date,
          last_reset_date
        ) VALUES ($1, $2, $3, 0, CURRENT_DATE + INTERVAL '1 month', CURRENT_DATE)
        ON CONFLICT (tenant_id) 
        DO UPDATE SET
          subscription_plan_id = $2,
          credits_total = $3,
          credits_used = 0,
          reset_date = CURRENT_DATE + INTERVAL '1 month',
          last_reset_date = CURRENT_DATE,
          updated_at = NOW()
        RETURNING *
      `, [ tenantId, plan.id, plan.ml_credits_per_month ] );

      const credits = result.rows[ 0 ];

      console.log( `🎯 [ML-CREDITS] Configuração criada - Tenant: ${ tenantId }, Plano: ${ plan.display_name }, Créditos: ${ plan.ml_credits_per_month }` );

      return {
        success: true,
        tenantId: credits.tenant_id,
        planName: planName,
        planDisplayName: plan.display_name,
        creditsTotal: credits.credits_total,
        creditsAvailable: credits.credits_available,
        resetDate: credits.reset_date
      };

    } catch ( error )
    {
      console.error( '❌ [ML-CREDITS] Erro ao configurar créditos:', error );
      throw error;
    }
  }

  /**
   * Obter histórico de uso de um tenant
   * @param {string} tenantId - ID do tenant
   * @param {Object} options - Opções de filtro
   * @returns {Array} Histórico de uso
   */
  async getUsageHistory( tenantId, options = {} )
  {
    try
    {
      const {
        limit = 50,
        offset = 0,
        startDate = null,
        endDate = null,
        usageType = null,
        context = null
      } = options;

      let query = `
        SELECT 
          usage_type,
          insight_type,
          context,
          credits_consumed,
          processing_time_ms,
          success,
          created_at
        FROM ml_usage_history
        WHERE tenant_id = $1
      `;

      const params = [ tenantId ];
      let paramIndex = 2;

      if ( startDate )
      {
        query += ` AND created_at >= $${ paramIndex }`;
        params.push( startDate );
        paramIndex++;
      }

      if ( endDate )
      {
        query += ` AND created_at <= $${ paramIndex }`;
        params.push( endDate );
        paramIndex++;
      }

      if ( usageType )
      {
        query += ` AND usage_type = $${ paramIndex }`;
        params.push( usageType );
        paramIndex++;
      }

      if ( context )
      {
        query += ` AND context = $${ paramIndex }`;
        params.push( context );
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC LIMIT $${ paramIndex } OFFSET $${ paramIndex + 1 }`;
      params.push( limit, offset );

      const result = await this.pool.query( query, params );

      return result.rows;

    } catch ( error )
    {
      console.error( '❌ [ML-CREDITS] Erro ao buscar histórico:', error );
      throw error;
    }
  }

  /**
   * Obter estatísticas de uso de um tenant
   * @param {string} tenantId - ID do tenant
   * @param {string} period - Período (month, week, day)
   * @returns {Object} Estatísticas
   */
  async getUsageStats( tenantId, period = 'month' )
  {
    try
    {
      let dateFilter;
      switch ( period )
      {
        case 'day':
          dateFilter = "created_at >= CURRENT_DATE";
          break;
        case 'week':
          dateFilter = "created_at >= CURRENT_DATE - INTERVAL '7 days'";
          break;
        case 'month':
        default:
          dateFilter = "created_at >= CURRENT_DATE - INTERVAL '30 days'";
          break;
      }

      const result = await this.pool.query( `
        SELECT 
          COUNT(*) as total_uses,
          SUM(credits_consumed) as total_credits,
          AVG(processing_time_ms) as avg_processing_time,
          COUNT(*) FILTER (WHERE success = true) as successful_uses,
          COUNT(*) FILTER (WHERE success = false) as failed_uses,
          usage_type,
          context
        FROM ml_usage_history
        WHERE tenant_id = $1 AND ${ dateFilter }
        GROUP BY usage_type, context
        ORDER BY total_credits DESC
      `, [ tenantId ] );

      return result.rows;

    } catch ( error )
    {
      console.error( '❌ [ML-CREDITS] Erro ao buscar estatísticas:', error );
      throw error;
    }
  }

  /**
   * Fechar conexões do pool
   */
  async close()
  {
    await this.pool.end();
  }
}

export default new MLCreditsService();
