/**
 * ROTAS ML - SISTEMA QUANTUM
 * Integração das rotas ML com o servidor principal
 * 100% JavaScript - SEM TYPESCRIPT
 */

import { createRequire } from 'module';
const require = createRequire( import.meta.url );

// Importar rotas usando CommonJS
const quantumRoutes = require( './quantumRoutes.js' );
const autoPredictionsRoutes = require( './autoPredictionsRoutes.js' );
const slotsRoutes = require( './slotsRoutes.js' );
const storageRoutes = require( '../storage/storageRoutes.js' );

// Importar serviços
const AutoPredictionsService = require( '../../services/ml/AutoPredictionsService.js' );
const MLSchedulerService = require( '../../services/scheduler/MLSchedulerService.js' );
const MLCreditsResetService = require( '../../services/scheduler/MLCreditsResetService.js' );
const MLSlotsService = require( '../../services/ml/MLSlotsService.js' );
const StorageManagementService = require( '../../services/storage/StorageManagementService.js' );

/**
 * Configurar rotas ML no app Express
 * @param {Object} app - Instância do Express
 */
export function setupMLRoutes( app )
{
  console.log( '🔧 [ML-ROUTES] Configurando rotas ML...' );

  // Middleware para extrair tenant ID das requisições
  app.use( '/api', ( req, res, next ) =>
  {
    // Extrair tenant ID do header, query ou token
    const tenantId = req.headers[ 'x-tenant-id' ] ||
      req.query.tenantId ||
      req.user?.tenantId;

    if ( tenantId )
    {
      req.tenantId = tenantId;
    }

    next();
  } );

  // Registrar rotas ML
  app.use( '/api', quantumRoutes );
  app.use( '/api', autoPredictionsRoutes );
  app.use( '/api', slotsRoutes );
  app.use( '/api', storageRoutes );

  console.log( '✅ [ML-ROUTES] Rotas ML configuradas:' );
  console.log( '   • /api/ml-credits - Gerenciamento de créditos (legacy)' );
  console.log( '   • /api/ml-slots - Gerenciamento de slots ML' );
  console.log( '   • /api/storage - Gestão de storage por tenant' );
  console.log( '   • /api/quantum/* - Insights ML manuais' );
  console.log( '   • /api/auto-predictions - Predições automáticas' );
}

/**
 * Inicializar serviços ML
 */
export async function initializeMLServices()
{
  console.log( '🚀 [ML-SERVICES] Inicializando serviços ML...' );

  try
  {
    // Inicializar scheduler de predições automáticas
    await AutoPredictionsService.initialize();

    // Inicializar scheduler principal
    await MLSchedulerService.initialize();

    // Inicializar serviço de reset de créditos
    await MLCreditsResetService.initialize();

    console.log( '✅ [ML-SERVICES] Serviços ML inicializados com sucesso' );

    return {
      autoPredictionsService: AutoPredictionsService,
      mlSchedulerService: MLSchedulerService,
      mlCreditsResetService: MLCreditsResetService,
      mlSlotsService: MLSlotsService,
      storageManagementService: StorageManagementService
    };

  } catch ( error )
  {
    console.error( '❌ [ML-SERVICES] Erro ao inicializar serviços ML:', error );
    throw error;
  }
}

/**
 * Parar serviços ML
 */
export async function stopMLServices()
{
  console.log( '🛑 [ML-SERVICES] Parando serviços ML...' );

  try
  {
    await AutoPredictionsService.close();
    await MLSchedulerService.close();
    await MLCreditsResetService.close();
    console.log( '✅ [ML-SERVICES] Serviços ML parados com sucesso' );

  } catch ( error )
  {
    console.error( '❌ [ML-SERVICES] Erro ao parar serviços ML:', error );
  }
}

/**
 * Obter estatísticas dos serviços ML
 */
export function getMLStats()
{
  return {
    autoPredictions: AutoPredictionsService.getStats(),
    scheduler: MLSchedulerService.getStats(),
    creditsReset: MLCreditsResetService.getStats(),
    timestamp: new Date().toISOString()
  };
}

export default {
  setupMLRoutes,
  initializeMLServices,
  stopMLServices,
  getMLStats
};
