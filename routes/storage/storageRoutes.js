/**
 * ROTAS API PARA GESTÃO DE STORAGE
 * Endpoints para gerenciar storage por tenant
 * 100% JavaScript - SEM TYPESCRIPT
 */

import express from 'express';
const router = express.Router();
import StorageManagementService from '../../services/storage/StorageManagementService.js';

/**
 * GET /api/storage
 * Verificar uso de storage do tenant
 */
router.get( '/storage', async ( req, res ) =>
{
  try
  {
    const tenantId = req.headers[ 'x-tenant-id' ] || 'default';

    console.log( `📊 [API] Verificando storage - Tenant: ${ tenantId }` );

    const storageInfo = await StorageManagementService.checkTenantStorage( tenantId );

    res.json( {
      success: true,
      data: storageInfo,
      timestamp: new Date().toISOString()
    } );

  } catch ( error )
  {
    console.error( '❌ [API] Erro ao verificar storage:', error );
    res.status( 500 ).json( {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    } );
  }
} );

/**
 * POST /api/storage/check
 * Verificar se pode usar storage adicional
 */
router.post( '/storage/check', async ( req, res ) =>
{
  try
  {
    const tenantId = req.headers[ 'x-tenant-id' ] || 'default';
    const { bytes, category = 'uploads' } = req.body;

    console.log( `🔍 [API] Verificando disponibilidade de storage - Tenant: ${ tenantId }, Bytes: ${ bytes }` );

    if ( !bytes || bytes <= 0 )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Quantidade de bytes deve ser maior que zero'
      } );
    }

    const result = await StorageManagementService.canUseStorage( tenantId, bytes, category );

    res.json( {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    } );

  } catch ( error )
  {
    console.error( '❌ [API] Erro ao verificar disponibilidade:', error );
    res.status( 500 ).json( {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    } );
  }
} );

/**
 * POST /api/storage/record
 * Registrar uso de storage
 */
router.post( '/storage/record', async ( req, res ) =>
{
  try
  {
    const tenantId = req.headers[ 'x-tenant-id' ] || 'default';
    const { bytes, category, description } = req.body;

    console.log( `📝 [API] Registrando uso de storage - Tenant: ${ tenantId }, Categoria: ${ category }` );

    if ( !bytes || !category )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Campos obrigatórios: bytes, category'
      } );
    }

    await StorageManagementService.recordStorageUsage( tenantId, bytes, category, description );

    res.json( {
      success: true,
      message: 'Uso de storage registrado com sucesso',
      timestamp: new Date().toISOString()
    } );

  } catch ( error )
  {
    console.error( '❌ [API] Erro ao registrar uso:', error );
    res.status( 500 ).json( {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    } );
  }
} );

/**
 * POST /api/storage/cleanup
 * Executar limpeza de storage
 */
router.post( '/storage/cleanup', async ( req, res ) =>
{
  try
  {
    const tenantId = req.headers[ 'x-tenant-id' ] || 'default';

    console.log( `🧹 [API] Executando limpeza de storage - Tenant: ${ tenantId }` );

    const cleanupResult = await StorageManagementService.performCleanup( tenantId );

    res.json( {
      success: true,
      data: cleanupResult,
      message: `Limpeza concluída: ${ StorageManagementService.formatBytes( cleanupResult.totalBytesFreed ) } liberados`,
      timestamp: new Date().toISOString()
    } );

  } catch ( error )
  {
    console.error( '❌ [API] Erro na limpeza:', error );
    res.status( 500 ).json( {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    } );
  }
} );

/**
 * GET /api/storage/report
 * Relatório detalhado de storage
 */
router.get( '/storage/report', async ( req, res ) =>
{
  try
  {
    const tenantId = req.headers[ 'x-tenant-id' ] || 'default';

    console.log( `📋 [API] Gerando relatório de storage - Tenant: ${ tenantId }` );

    const report = await StorageManagementService.getStorageReport( tenantId );

    res.json( {
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    } );

  } catch ( error )
  {
    console.error( '❌ [API] Erro ao gerar relatório:', error );
    res.status( 500 ).json( {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    } );
  }
} );

/**
 * GET /api/storage/categories
 * Listar categorias de storage disponíveis
 */
router.get( '/storage/categories', async ( req, res ) =>
{
  try
  {
    const QUANTUM_CONFIG = require( '../../config/quantum-config' );

    res.json( {
      success: true,
      data: QUANTUM_CONFIG.STORAGE_CATEGORIES,
      timestamp: new Date().toISOString()
    } );

  } catch ( error )
  {
    console.error( '❌ [API] Erro ao listar categorias:', error );
    res.status( 500 ).json( {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    } );
  }
} );

/**
 * GET /api/storage/stats
 * Estatísticas de uso de storage
 */
router.get( '/storage/stats', async ( req, res ) =>
{
  try
  {
    const tenantId = req.headers[ 'x-tenant-id' ] || 'default';
    const { days = 30 } = req.query;

    console.log( `📊 [API] Estatísticas de storage - Tenant: ${ tenantId }` );

    // Buscar informações básicas
    const storageInfo = await StorageManagementService.checkTenantStorage( tenantId );

    // Buscar histórico de uso (simulado por enquanto)
    const stats = {
      current: storageInfo,
      trends: {
        period: `${ days } dias`,
        growth: {
          uploads: 0,
          database: 0,
          cache: 0,
          total: 0
        }
      },
      topCategories: Object.entries( storageInfo.usage )
        .filter( ( [ key ] ) => key !== 'total' )
        .sort( ( [ , a ], [ , b ] ) => b - a )
        .slice( 0, 5 )
        .map( ( [ category, bytes ] ) => ( {
          category,
          bytes,
          formatted: StorageManagementService.formatBytes( bytes ),
          percentage: storageInfo.usage.total > 0 ?
            Math.round( ( bytes / storageInfo.usage.total ) * 100 ) : 0
        } ) )
    };

    res.json( {
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    } );

  } catch ( error )
  {
    console.error( '❌ [API] Erro ao obter estatísticas:', error );
    res.status( 500 ).json( {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    } );
  }
} );

/**
 * POST /api/storage/optimize
 * Otimizar uso de storage
 */
router.post( '/storage/optimize', async ( req, res ) =>
{
  try
  {
    const tenantId = req.headers[ 'x-tenant-id' ] || 'default';

    console.log( `⚡ [API] Otimizando storage - Tenant: ${ tenantId }` );

    // Executar limpeza
    const cleanupResult = await StorageManagementService.performCleanup( tenantId );

    // Verificar status após limpeza
    const storageInfo = await StorageManagementService.checkTenantStorage( tenantId );

    const optimizationResult = {
      cleanup: cleanupResult,
      afterOptimization: storageInfo,
      recommendations: StorageManagementService.generateStorageRecommendations( storageInfo )
    };

    res.json( {
      success: true,
      data: optimizationResult,
      message: `Otimização concluída: ${ StorageManagementService.formatBytes( cleanupResult.totalBytesFreed ) } liberados`,
      timestamp: new Date().toISOString()
    } );

  } catch ( error )
  {
    console.error( '❌ [API] Erro na otimização:', error );
    res.status( 500 ).json( {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    } );
  }
} );

export default router;
