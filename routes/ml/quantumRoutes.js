/**
 * ROTAS API QUANTUM ML
 * Todas as rotas relacionadas ao sistema de Machine Learning
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require( 'express' );
const router = express.Router();

// Importar serviços
const MLCreditsService = require( '../../services/ml/MLCreditsService.js' );
const QuantumInsightsService = require( '../../services/ml/QuantumInsightsService.js' );

// Importar middlewares
const {
  checkMLCredits,
  checkForManualInsight,
  checkForAdvancedInsight,
  checkForViewOnly,
  checkPlanLimits,
  consumeCreditsAfterSuccess
} = require( '../../middleware/ml/checkMLCredits.js' );

// Importar configurações
const ML_CONFIG = require( '../../config/ml-config.js' );

// ====================================================================
// ROTAS DE CRÉDITOS ML
// ====================================================================

/**
 * GET /api/ml-credits
 * Verificar créditos disponíveis do tenant
 */
router.get( '/ml-credits', async ( req, res ) =>
{
  try
  {
    const tenantId = req.tenantId || req.user?.tenantId;

    if ( !tenantId )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Tenant ID é obrigatório'
      } );
    }

    console.log( `🔍 [API-ML-CREDITS] Verificando créditos - Tenant: ${ tenantId }` );

    const credits = await MLCreditsService.checkCredits( tenantId );

    res.json( {
      success: true,
      data: {
        credits: {
          available: credits.credits_available,
          used: credits.credits_used,
          total: credits.credits_total,
          resetDate: credits.reset_date,
          lastResetDate: credits.last_reset_date
        },
        plan: {
          name: credits.plan_name,
          displayName: credits.plan_display_name,
          creditsPerMonth: credits.ml_credits_per_month
        },
        needsSetup: credits.needs_setup
      }
    } );

  } catch ( error )
  {
    console.error( '❌ [API-ML-CREDITS] Erro:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao verificar créditos ML'
    } );
  }
} );

/**
 * POST /api/ml-credits/setup
 * Configurar créditos para um tenant
 */
router.post( '/ml-credits/setup', async ( req, res ) =>
{
  try
  {
    const tenantId = req.tenantId || req.user?.tenantId;
    const { planName } = req.body;

    if ( !tenantId || !planName )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Tenant ID e nome do plano são obrigatórios'
      } );
    }

    console.log( `⚙️ [API-ML-SETUP] Configurando créditos - Tenant: ${ tenantId }, Plano: ${ planName }` );

    const result = await MLCreditsService.setupCreditsForTenant( tenantId, planName );

    res.json( {
      success: true,
      message: 'Créditos configurados com sucesso',
      data: result
    } );

  } catch ( error )
  {
    console.error( '❌ [API-ML-SETUP] Erro:', error );
    res.status( 500 ).json( {
      success: false,
      error: error.message || 'Erro ao configurar créditos ML'
    } );
  }
} );

/**
 * GET /api/ml-credits/history
 * Obter histórico de uso de créditos
 */
router.get( '/ml-credits/history', checkForViewOnly, async ( req, res ) =>
{
  try
  {
    const tenantId = req.tenantId || req.user?.tenantId;
    const {
      limit = 50,
      offset = 0,
      startDate,
      endDate,
      usageType,
      context
    } = req.query;

    console.log( `📊 [API-ML-HISTORY] Buscando histórico - Tenant: ${ tenantId }` );

    const history = await MLCreditsService.getUsageHistory( tenantId, {
      limit: parseInt( limit ),
      offset: parseInt( offset ),
      startDate,
      endDate,
      usageType,
      context
    } );

    res.json( {
      success: true,
      data: {
        history,
        pagination: {
          limit: parseInt( limit ),
          offset: parseInt( offset ),
          total: history.length
        }
      }
    } );

  } catch ( error )
  {
    console.error( '❌ [API-ML-HISTORY] Erro:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao buscar histórico de uso'
    } );
  }
} );

/**
 * GET /api/ml-credits/stats
 * Obter estatísticas de uso
 */
router.get( '/ml-credits/stats', checkForViewOnly, async ( req, res ) =>
{
  try
  {
    const tenantId = req.tenantId || req.user?.tenantId;
    const { period = 'month' } = req.query;

    console.log( `📈 [API-ML-STATS] Buscando estatísticas - Tenant: ${ tenantId }, Período: ${ period }` );

    const stats = await MLCreditsService.getUsageStats( tenantId, period );

    res.json( {
      success: true,
      data: {
        period,
        stats
      }
    } );

  } catch ( error )
  {
    console.error( '❌ [API-ML-STATS] Erro:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao buscar estatísticas de uso'
    } );
  }
} );

// ====================================================================
// ROTAS DE QUANTUM INSIGHTS
// ====================================================================

/**
 * POST /api/quantum/insight
 * Executar insight ML manual (consome 1 crédito)
 */
router.post( '/quantum/insight',
  checkForManualInsight,
  consumeCreditsAfterSuccess( 1 ),
  async ( req, res ) =>
  {
    const startTime = Date.now();

    try
    {
      const { data, insightType, options = {} } = req.body;

      if ( !data || !Array.isArray( data ) || !insightType )
      {
        return res.status( 400 ).json( {
          success: false,
          error: 'Dados (array) e tipo de insight são obrigatórios'
        } );
      }

      console.log( `🧠 [API-QUANTUM-INSIGHT] Processando - Tipo: ${ insightType }, Registros: ${ data.length }` );

      // Validar tipo de insight
      const validTypes = Object.keys( ML_CONFIG.INSIGHT_TYPES );
      if ( !validTypes.includes( insightType ) )
      {
        return res.status( 400 ).json( {
          success: false,
          error: `Tipo de insight inválido. Tipos válidos: ${ validTypes.join( ', ' ) }`
        } );
      }

      // Processar insight
      const result = await QuantumInsightsService.processInsight( data, insightType, {
        ...options,
        useCache: options.useCache !== false // Cache habilitado por padrão
      } );

      const processingTime = Date.now() - startTime;

      res.json( {
        success: true,
        message: 'Insight gerado com sucesso',
        data: {
          insight: result,
          insightType,
          processingTime,
          dataPoints: data.length,
          timestamp: new Date().toISOString()
        }
      } );

    } catch ( error )
    {
      const processingTime = Date.now() - startTime;
      console.error( '❌ [API-QUANTUM-INSIGHT] Erro:', error );

      res.status( 500 ).json( {
        success: false,
        error: error.error || error.message || 'Erro no processamento do insight',
        processingTime,
        timestamp: new Date().toISOString()
      } );
    }
  }
);

/**
 * POST /api/quantum/predict
 * Executar predição específica (consome 1 crédito)
 */
router.post( '/quantum/predict',
  checkForManualInsight,
  consumeCreditsAfterSuccess( 1 ),
  async ( req, res ) =>
  {
    try
    {
      const { data, forecastDays = 30, options = {} } = req.body;

      if ( !data || !Array.isArray( data ) )
      {
        return res.status( 400 ).json( {
          success: false,
          error: 'Dados (array) são obrigatórios'
        } );
      }

      console.log( `🔮 [API-QUANTUM-PREDICT] Predição - Dias: ${ forecastDays }, Registros: ${ data.length }` );

      const result = await QuantumInsightsService.processInsight( data, 'prediction', {
        forecastDays,
        ...options
      } );

      res.json( {
        success: true,
        message: 'Predição gerada com sucesso',
        data: {
          prediction: result,
          forecastDays,
          dataPoints: data.length,
          timestamp: new Date().toISOString()
        }
      } );

    } catch ( error )
    {
      console.error( '❌ [API-QUANTUM-PREDICT] Erro:', error );

      res.status( 500 ).json( {
        success: false,
        error: error.error || error.message || 'Erro na predição'
      } );
    }
  }
);

/**
 * POST /api/quantum/optimize
 * Executar otimização (consome 1 crédito)
 */
router.post( '/quantum/optimize',
  checkForManualInsight,
  consumeCreditsAfterSuccess( 1 ),
  async ( req, res ) =>
  {
    try
    {
      const { data, options = {} } = req.body;

      if ( !data || !Array.isArray( data ) )
      {
        return res.status( 400 ).json( {
          success: false,
          error: 'Dados (array) são obrigatórios'
        } );
      }

      console.log( `⚡ [API-QUANTUM-OPTIMIZE] Otimização - Registros: ${ data.length }` );

      const result = await QuantumInsightsService.processInsight( data, 'optimization', options );

      res.json( {
        success: true,
        message: 'Otimização gerada com sucesso',
        data: {
          optimization: result,
          dataPoints: data.length,
          timestamp: new Date().toISOString()
        }
      } );

    } catch ( error )
    {
      console.error( '❌ [API-QUANTUM-OPTIMIZE] Erro:', error );

      res.status( 500 ).json( {
        success: false,
        error: error.error || error.message || 'Erro na otimização'
      } );
    }
  }
);

module.exports = router;
