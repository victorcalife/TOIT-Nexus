/**
 * ROTAS ML - SISTEMA QUANTUM
 * Integração das rotas ML com o servidor principal
 * 100% JavaScript - SEM TYPESCRIPT
 */

// Importar rotas usando dynamic imports (compatível com ES modules)
let quantumRoutes, autoPredictionsRoutes, slotsRoutes, storageRoutes;
let AutoPredictionsService, MLSchedulerService, MLCreditsResetService, MLSlotsService, StorageManagementService;

// Função para carregar módulos dinamicamente
async function loadModules()
{
  try
  {
    // Carregar rotas
    const quantumModule = await import( './quantumRoutes.js' );
    quantumRoutes = quantumModule.default;

    const autoPredictionsModule = await import( './autoPredictionsRoutes.js' );
    autoPredictionsRoutes = autoPredictionsModule.default;

    const slotsModule = await import( './slotsRoutes.js' );
    slotsRoutes = slotsModule.default;

    const storageModule = await import( '../storage/storageRoutes.js' );
    storageRoutes = storageModule.default;

    // Carregar serviços
    const autoPredService = await import( '../../services/ml/AutoPredictionsService.js' );
    AutoPredictionsService = autoPredService.default;

    const mlSchedulerService = await import( '../../services/scheduler/MLSchedulerService.js' );
    MLSchedulerService = mlSchedulerService.default;

    const mlCreditsResetService = await import( '../../services/scheduler/MLCreditsResetService.js' );
    MLCreditsResetService = mlCreditsResetService.default;

    const mlSlotsService = await import( '../../services/ml/MLSlotsService.js' );
    MLSlotsService = mlSlotsService.default;

    const storageManagementService = await import( '../../services/storage/StorageManagementService.js' );
    StorageManagementService = storageManagementService.default;

    console.log( '✅ [ML-MODULES] Todos os módulos ML carregados com sucesso' );

  } catch ( error )
  {
    console.error( '❌ [ML-MODULES] Erro ao carregar módulos ML:', error );
    throw error;
  }
}

/**
 * Configurar rotas ML no app Express
 * @param {Object} app - Instância do Express
 */
export async function setupMLRoutes( app )
{
  console.log( '🔧 [ML-ROUTES] Configurando rotas ML...' );

  // Carregar módulos primeiro
  await loadModules();

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
    // Carregar módulos se ainda não foram carregados
    if ( !AutoPredictionsService )
    {
      await loadModules();
    }

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
