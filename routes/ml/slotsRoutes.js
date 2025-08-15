/**
 * ROTAS API PARA SLOTS ML
 * Endpoints para gerenciar slots ML por tenant
 * 100% JavaScript - SEM TYPESCRIPT
 */

import express from 'express';
const router = express.Router();
import MLSlotsService from '../../services/ml/MLSlotsService.js';

/**
 * GET /api/ml-slots
 * Verificar slots ML do tenant
 */
router.get( '/ml-slots', async ( req, res ) =>
{
  try
  {
    const tenantId = req.headers[ 'x-tenant-id' ] || 'default';

    console.log( `📊 [API] Verificando slots ML - Tenant: ${ tenantId }` );

    const slotsInfo = await MLSlotsService.checkTenantSlots( tenantId );

    res.json( {
      success: true,
      data: slotsInfo,
      timestamp: new Date().toISOString()
    } );

  } catch ( error )
  {
    console.error( '❌ [API] Erro ao verificar slots:', error );
    res.status( 500 ).json( {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    } );
  }
} );

/**
 * POST /api/ml-slots
 * Criar novo slot ML
 */
router.post( '/ml-slots', async ( req, res ) =>
{
  try
  {
    const tenantId = req.headers[ 'x-tenant-id' ] || 'default';
    const { slotType, slotName, slotLocation, config } = req.body;

    console.log( `➕ [API] Criando slot ML - Tenant: ${ tenantId }, Tipo: ${ slotType }` );

    // Validações
    if ( !slotType || !slotName || !slotLocation )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Campos obrigatórios: slotType, slotName, slotLocation'
      } );
    }

    const result = await MLSlotsService.createSlot(
      tenantId,
      slotType,
      slotName,
      slotLocation,
      config || {}
    );

    res.status( 201 ).json( {
      success: true,
      data: result,
      message: 'Slot ML criado com sucesso',
      timestamp: new Date().toISOString()
    } );

  } catch ( error )
  {
    console.error( '❌ [API] Erro ao criar slot:', error );
    res.status( 400 ).json( {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    } );
  }
} );

/**
 * POST /api/ml-slots/:location/use
 * Usar um slot ML
 */
router.post( '/ml-slots/:location/use', async ( req, res ) =>
{
  try
  {
    const tenantId = req.headers[ 'x-tenant-id' ] || 'default';
    const { location } = req.params;
    const usageData = req.body;

    console.log( `🎯 [API] Usando slot ML - Tenant: ${ tenantId }, Location: ${ location }` );

    const result = await MLSlotsService.useSlot( tenantId, location, usageData );

    res.json( {
      success: true,
      data: result,
      message: 'Slot ML usado com sucesso',
      timestamp: new Date().toISOString()
    } );

  } catch ( error )
  {
    console.error( '❌ [API] Erro ao usar slot:', error );
    res.status( 400 ).json( {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    } );
  }
} );

/**
 * DELETE /api/ml-slots/:location
 * Desativar slot ML
 */
router.delete( '/ml-slots/:location', async ( req, res ) =>
{
  try
  {
    const tenantId = req.headers[ 'x-tenant-id' ] || 'default';
    const { location } = req.params;

    console.log( `🔴 [API] Desativando slot ML - Tenant: ${ tenantId }, Location: ${ location }` );

    const result = await MLSlotsService.deactivateSlot( tenantId, location );

    res.json( {
      success: true,
      data: result,
      message: 'Slot ML desativado com sucesso',
      timestamp: new Date().toISOString()
    } );

  } catch ( error )
  {
    console.error( '❌ [API] Erro ao desativar slot:', error );
    res.status( 400 ).json( {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    } );
  }
} );

/**
 * GET /api/ml-slots/list
 * Listar todos os slots do tenant
 */
router.get( '/ml-slots/list', async ( req, res ) =>
{
  try
  {
    const tenantId = req.headers[ 'x-tenant-id' ] || 'default';
    const { active_only } = req.query;

    console.log( `📋 [API] Listando slots ML - Tenant: ${ tenantId }` );

    const slots = await MLSlotsService.listSlots( tenantId, active_only === 'true' );

    res.json( {
      success: true,
      data: slots,
      count: slots.length,
      timestamp: new Date().toISOString()
    } );

  } catch ( error )
  {
    console.error( '❌ [API] Erro ao listar slots:', error );
    res.status( 500 ).json( {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    } );
  }
} );

/**
 * GET /api/ml-slots/stats
 * Estatísticas de uso dos slots
 */
router.get( '/ml-slots/stats', async ( req, res ) =>
{
  try
  {
    const tenantId = req.headers[ 'x-tenant-id' ] || 'default';
    const { days } = req.query;

    console.log( `📊 [API] Estatísticas de slots ML - Tenant: ${ tenantId }` );

    const stats = await MLSlotsService.getSlotStats( tenantId, parseInt( days ) || 30 );

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
 * POST /api/ml-slots/setup
 * Configurar plano e migrar de créditos para slots
 */
router.post( '/ml-slots/setup', async ( req, res ) =>
{
  try
  {
    const tenantId = req.headers[ 'x-tenant-id' ] || 'default';
    const { planName } = req.body;

    console.log( `🔧 [API] Configurando plano - Tenant: ${ tenantId }, Plano: ${ planName }` );

    if ( !planName )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Nome do plano é obrigatório'
      } );
    }

    // Migrar de créditos para slots se necessário
    const migrationResult = await MLSlotsService.migrateFromCreditsToSlots( tenantId );

    // Verificar slots após migração
    const slotsInfo = await MLSlotsService.checkTenantSlots( tenantId );

    res.json( {
      success: true,
      data: {
        migration: migrationResult,
        slots: slotsInfo
      },
      message: 'Plano configurado e migração concluída',
      timestamp: new Date().toISOString()
    } );

  } catch ( error )
  {
    console.error( '❌ [API] Erro ao configurar plano:', error );
    res.status( 400 ).json( {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    } );
  }
} );

/**
 * GET /api/ml-slots/types
 * Listar tipos de slots disponíveis
 */
router.get( '/ml-slots/types', async ( req, res ) =>
{
  try
  {
    const { default: QUANTUM_CONFIG } = await import( '../../config/quantum-config.js' );

    res.json( {
      success: true,
      data: QUANTUM_CONFIG.ML_SLOT_TYPES,
      timestamp: new Date().toISOString()
    } );

  } catch ( error )
  {
    console.error( '❌ [API] Erro ao listar tipos de slots:', error );
    res.status( 500 ).json( {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    } );
  }
} );

export default router;
