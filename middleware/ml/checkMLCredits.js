/**
 * MIDDLEWARE PARA VERIFICAÇÃO DE CRÉDITOS ML
 * Verifica se o tenant tem créditos suficientes antes de executar operações ML
 * 100% JavaScript - SEM TYPESCRIPT
 */

import MLCreditsService from '../../services/ml/MLCreditsService.js';
import ML_CONFIG from '../../config/ml-config.js';

/**
 * Middleware para verificar créditos ML
 * @param {number} creditsRequired - Quantidade de créditos necessários
 * @param {Object} options - Opções adicionais
 * @returns {Function} Middleware function
 */
function checkMLCredits( creditsRequired = 1, options = {} )
{
  const {
    allowZeroCredits = false,
    skipForAdmin = false,
    logAttempt = true
  } = options;

  return async ( req, res, next ) =>
  {
    try
    {
      // Extrair informações da requisição
      const tenantId = req.tenantId || req.user?.tenantId || req.body?.tenantId;
      const userId = req.user?.id || req.userId;
      const userRole = req.user?.role;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get( 'User-Agent' );

      // Validar tenant ID
      if ( !tenantId )
      {
        console.log( '❌ [ML-CREDITS-MW] Tenant ID não encontrado na requisição' );
        return res.status( 400 ).json( {
          success: false,
          error: 'Tenant ID é obrigatório',
          code: 'MISSING_TENANT_ID'
        } );
      }

      // Log da tentativa se habilitado
      if ( logAttempt )
      {
        console.log( `🔍 [ML-CREDITS-MW] Verificando créditos - Tenant: ${ tenantId }, Necessário: ${ creditsRequired }, User: ${ userId || 'N/A' }` );
      }

      // Pular verificação para admin se configurado
      if ( skipForAdmin && userRole === 'admin' )
      {
        console.log( `⚡ [ML-CREDITS-MW] Pulando verificação para admin - User: ${ userId }` );
        req.mlCreditsSkipped = true;
        return next();
      }

      // Verificar créditos disponíveis
      const credits = await MLCreditsService.checkCredits( tenantId );

      // Se tenant precisa de configuração inicial
      if ( credits.needs_setup )
      {
        console.log( `⚠️ [ML-CREDITS-MW] Tenant precisa de configuração inicial: ${ tenantId }` );
        return res.status( 402 ).json( {
          success: false,
          error: 'Configuração de créditos ML necessária',
          code: 'CREDITS_SETUP_REQUIRED',
          data: {
            tenantId,
            needsSetup: true,
            availablePlans: Object.keys( ML_CONFIG.PLANS )
          }
        } );
      }

      // Verificar se tem créditos suficientes
      const hasEnoughCredits = credits.credits_available >= creditsRequired;
      const hasZeroCreditsAllowed = allowZeroCredits && credits.credits_available === 0;

      if ( !hasEnoughCredits && !hasZeroCreditsAllowed )
      {
        console.log( `❌ [ML-CREDITS-MW] Créditos insuficientes - Tenant: ${ tenantId }, Disponível: ${ credits.credits_available }, Necessário: ${ creditsRequired }` );

        // Log da tentativa negada
        await MLCreditsService.logUsage( null, {
          tenantId,
          userId,
          usageType: 'denied_attempt',
          insightType: req.body?.insightType || 'unknown',
          context: req.route?.path || 'unknown',
          creditsConsumed: 0,
          success: false,
          errorMessage: ML_CONFIG.MESSAGES.INSUFFICIENT_CREDITS,
          ipAddress,
          userAgent
        } );

        return res.status( 402 ).json( {
          success: false,
          error: ML_CONFIG.MESSAGES.INSUFFICIENT_CREDITS,
          code: 'INSUFFICIENT_CREDITS',
          data: {
            creditsRequired,
            creditsAvailable: credits.credits_available,
            creditsUsed: credits.credits_used,
            creditsTotal: credits.credits_total,
            resetDate: credits.reset_date,
            planName: credits.plan_name,
            planDisplayName: credits.plan_display_name
          }
        } );
      }

      // Adicionar informações de créditos ao request
      req.mlCredits = {
        available: credits.credits_available,
        used: credits.credits_used,
        total: credits.credits_total,
        resetDate: credits.reset_date,
        planName: credits.plan_name,
        planDisplayName: credits.plan_display_name,
        creditsRequired,
        tenantId
      };

      // Log de sucesso na verificação
      if ( logAttempt )
      {
        console.log( `✅ [ML-CREDITS-MW] Créditos verificados com sucesso - Tenant: ${ tenantId }, Disponível: ${ credits.credits_available }` );
      }

      next();

    } catch ( error )
    {
      console.error( '❌ [ML-CREDITS-MW] Erro na verificação de créditos:', error );

      // Log do erro
      try
      {
        await MLCreditsService.logUsage( null, {
          tenantId: req.tenantId || 'unknown',
          userId: req.user?.id || null,
          usageType: 'error',
          insightType: 'verification_error',
          context: req.route?.path || 'unknown',
          creditsConsumed: 0,
          success: false,
          errorMessage: error.message,
          ipAddress: req.ip,
          userAgent: req.get( 'User-Agent' )
        } );
      } catch ( logError )
      {
        console.error( '❌ [ML-CREDITS-MW] Erro ao registrar log:', logError );
      }

      return res.status( 500 ).json( {
        success: false,
        error: 'Erro interno na verificação de créditos ML',
        code: 'CREDITS_CHECK_ERROR'
      } );
    }
  };
}

/**
 * Middleware específico para insights manuais (1 crédito)
 */
const checkForManualInsight = checkMLCredits( 1, {
  logAttempt: true,
  skipForAdmin: false
} );

/**
 * Middleware específico para operações que consomem múltiplos créditos
 */
const checkForAdvancedInsight = checkMLCredits( 2, {
  logAttempt: true,
  skipForAdmin: false
} );

/**
 * Middleware que permite operações mesmo sem créditos (para visualizações)
 */
const checkForViewOnly = checkMLCredits( 0, {
  allowZeroCredits: true,
  logAttempt: false,
  skipForAdmin: true
} );

/**
 * Middleware para verificar limites de plano (não consome créditos)
 */
function checkPlanLimits( feature )
{
  return async ( req, res, next ) =>
  {
    try
    {
      const tenantId = req.tenantId || req.user?.tenantId;

      if ( !tenantId )
      {
        return res.status( 400 ).json( {
          success: false,
          error: 'Tenant ID é obrigatório',
          code: 'MISSING_TENANT_ID'
        } );
      }

      const credits = await MLCreditsService.checkCredits( tenantId );

      if ( credits.needs_setup )
      {
        return res.status( 402 ).json( {
          success: false,
          error: 'Configuração de plano necessária',
          code: 'PLAN_SETUP_REQUIRED'
        } );
      }

      // Buscar configuração do plano
      const planConfig = ML_CONFIG.PLANS[ credits.plan_name?.toUpperCase() ];

      if ( !planConfig )
      {
        return res.status( 400 ).json( {
          success: false,
          error: 'Plano não reconhecido',
          code: 'INVALID_PLAN'
        } );
      }

      // Verificar se o plano suporta a feature
      if ( !planConfig.features.includes( feature ) )
      {
        console.log( `❌ [PLAN-LIMITS] Feature não disponível - Tenant: ${ tenantId }, Plano: ${ credits.plan_name }, Feature: ${ feature }` );

        return res.status( 403 ).json( {
          success: false,
          error: `Feature '${ feature }' não disponível no seu plano`,
          code: 'FEATURE_NOT_AVAILABLE',
          data: {
            currentPlan: credits.plan_display_name,
            requiredFeature: feature,
            availableFeatures: planConfig.features
          }
        } );
      }

      // Adicionar informações do plano ao request
      req.planConfig = planConfig;
      req.planLimits = {
        maxScheduledWorkflows: planConfig.maxScheduledWorkflows,
        mlCreditsPerMonth: planConfig.mlCreditsPerMonth,
        autoPredictionsPerDay: planConfig.autoPredictionsPerDay,
        features: planConfig.features
      };

      console.log( `✅ [PLAN-LIMITS] Feature autorizada - Tenant: ${ tenantId }, Plano: ${ credits.plan_name }, Feature: ${ feature }` );

      next();

    } catch ( error )
    {
      console.error( '❌ [PLAN-LIMITS] Erro na verificação de limites:', error );

      return res.status( 500 ).json( {
        success: false,
        error: 'Erro interno na verificação de limites do plano',
        code: 'PLAN_CHECK_ERROR'
      } );
    }
  };
}

/**
 * Middleware para consumir créditos após operação bem-sucedida
 */
function consumeCreditsAfterSuccess( creditsToConsume = 1 )
{
  return async ( req, res, next ) =>
  {
    // Interceptar o res.json para consumir créditos apenas em caso de sucesso
    const originalJson = res.json;

    res.json = async function ( data )
    {
      try
      {
        // Só consumir créditos se a operação foi bem-sucedida
        if ( data && data.success && !req.mlCreditsSkipped )
        {
          const tenantId = req.mlCredits?.tenantId || req.tenantId;
          const userId = req.user?.id;

          if ( tenantId )
          {
            const consumeResult = await MLCreditsService.consumeCredits(
              tenantId,
              creditsToConsume,
              req.route?.path || 'unknown',
              userId,
              {
                insightType: req.body?.insightType || data.insightType,
                inputData: req.body,
                resultData: data,
                processingTimeMs: data.processingTime,
                ipAddress: req.ip,
                userAgent: req.get( 'User-Agent' )
              }
            );

            // Adicionar informações de créditos à resposta
            if ( consumeResult && consumeResult.success )
            {
              data.creditsConsumed = consumeResult.creditsConsumed;
              data.creditsRemaining = consumeResult.creditsRemaining;
            }
          }
        }
      } catch ( error )
      {
        console.error( '❌ [CONSUME-CREDITS] Erro ao consumir créditos:', error );
        // Não falhar a requisição por erro no consumo de créditos
      }

      // Chamar o método original
      return originalJson.call( this, data );
    };

    next();
  };
}

export
{
  checkMLCredits,
  checkForManualInsight,
  checkForAdvancedInsight,
  checkForViewOnly,
  checkPlanLimits,
  consumeCreditsAfterSuccess
};
