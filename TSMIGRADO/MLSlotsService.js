/**
 * SERVIÇO DE SLOTS ML
 * Gerencia slots ML ao invés de créditos mensais
 * 100% JavaScript - SEM TYPESCRIPT
 */

import { Pool } from 'pg';
import QUANTUM_CONFIG from '../../config/quantum-config.js';

class MLSlotsService
{
  constructor()
  {
    this.pool = new Pool( {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    } );
  }

  /**
   * Verificar slots ML de um tenant
   * @param {string} tenantId - ID do tenant
   * @returns {Object} Informações dos slots ML
   */
  async checkTenantSlots( tenantId )
  {
    try
    {
      console.log( `🎯 [ML-SLOTS] Verificando slots do tenant: ${ tenantId }` );

      // Buscar plano do tenant
      const planResult = await this.pool.query( `
        SELECT sp.name as plan_name
        FROM tenant_subscriptions ts
        JOIN subscription_plans sp ON ts.plan_id = sp.id
        WHERE ts.tenant_id = $1 AND ts.is_active = true
      `, [ tenantId ] );

      if ( planResult.rows.length === 0 )
      {
        throw new Error( `Plano não encontrado para tenant: ${ tenantId }` );
      }

      const planName = planResult.rows[ 0 ].plan_name;
      const planConfig = QUANTUM_CONFIG.PLANS[ planName.toUpperCase() ];

      if ( !planConfig )
      {
        throw new Error( `Configuração de plano não encontrada: ${ planName }` );
      }

      // Buscar slots atualmente em uso
      const slotsResult = await this.pool.query( `
        SELECT 
          slot_type,
          slot_name,
          slot_location,
          is_active,
          created_at,
          last_used_at,
          usage_count
        FROM ml_slots 
        WHERE tenant_id = $1 
        ORDER BY created_at DESC
      `, [ tenantId ] );

      const usedSlots = slotsResult.rows;
      const activeSlots = usedSlots.filter( slot => slot.is_active );

      return {
        tenantId,
        planName,
        totalSlots: planConfig.mlSlots,
        usedSlots: activeSlots.length,
        availableSlots: planConfig.mlSlots - activeSlots.length,
        slots: usedSlots,
        canCreateNew: activeSlots.length < planConfig.mlSlots,
        timestamp: new Date().toISOString()
      };

    } catch ( error )
    {
      console.error( `❌ [ML-SLOTS] Erro ao verificar slots:`, error );
      throw error;
    }
  }

  /**
   * Criar novo slot ML
   * @param {string} tenantId - ID do tenant
   * @param {string} slotType - Tipo do slot
   * @param {string} slotName - Nome do slot
   * @param {string} slotLocation - Localização (ex: "dashboard_1", "report_sales")
   * @param {Object} config - Configuração específica do slot
   * @returns {Object} Resultado da criação
   */
  async createSlot( tenantId, slotType, slotName, slotLocation, config = {} )
  {
    try
    {
      console.log( `➕ [ML-SLOTS] Criando slot: ${ tenantId } - ${ slotType } - ${ slotName }` );

      // Verificar se tenant pode criar mais slots
      const slotsInfo = await this.checkTenantSlots( tenantId );

      if ( !slotsInfo.canCreateNew )
      {
        throw new Error( `Limite de slots ML atingido (${ slotsInfo.totalSlots })` );
      }

      // Verificar se tipo de slot é válido
      if ( !QUANTUM_CONFIG.ML_SLOT_TYPES[ slotType ] )
      {
        throw new Error( `Tipo de slot inválido: ${ slotType }` );
      }

      // Verificar se já existe slot na mesma localização
      const existingResult = await this.pool.query( `
        SELECT id FROM ml_slots 
        WHERE tenant_id = $1 AND slot_location = $2 AND is_active = true
      `, [ tenantId, slotLocation ] );

      if ( existingResult.rows.length > 0 )
      {
        throw new Error( `Já existe um slot ML ativo na localização: ${ slotLocation }` );
      }

      // Criar slot
      const insertResult = await this.pool.query( `
        INSERT INTO ml_slots (
          tenant_id,
          slot_type,
          slot_name,
          slot_location,
          slot_config,
          is_active,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
        RETURNING id, created_at
      `, [ tenantId, slotType, slotName, slotLocation, JSON.stringify( config ) ] );

      const slotId = insertResult.rows[ 0 ].id;

      console.log( `✅ [ML-SLOTS] Slot criado: ${ slotId }` );

      return {
        success: true,
        slotId,
        slotType,
        slotName,
        slotLocation,
        config,
        createdAt: insertResult.rows[ 0 ].created_at,
        remainingSlots: slotsInfo.availableSlots - 1
      };

    } catch ( error )
    {
      console.error( `❌ [ML-SLOTS] Erro ao criar slot:`, error );
      throw error;
    }
  }

  /**
   * Usar um slot ML (registrar uso)
   * @param {string} tenantId - ID do tenant
   * @param {string} slotLocation - Localização do slot
   * @param {Object} usageData - Dados do uso
   * @returns {Object} Resultado do uso
   */
  async useSlot( tenantId, slotLocation, usageData = {} )
  {
    try
    {
      console.log( `🎯 [ML-SLOTS] Usando slot: ${ tenantId } - ${ slotLocation }` );

      // Verificar se slot existe e está ativo
      const slotResult = await this.pool.query( `
        SELECT id, slot_type, slot_name, usage_count
        FROM ml_slots 
        WHERE tenant_id = $1 AND slot_location = $2 AND is_active = true
      `, [ tenantId, slotLocation ] );

      if ( slotResult.rows.length === 0 )
      {
        throw new Error( `Slot ML não encontrado ou inativo: ${ slotLocation }` );
      }

      const slot = slotResult.rows[ 0 ];

      // Atualizar contador de uso
      await this.pool.query( `
        UPDATE ml_slots 
        SET 
          usage_count = usage_count + 1,
          last_used_at = NOW(),
          updated_at = NOW()
        WHERE id = $1
      `, [ slot.id ] );

      // Registrar uso detalhado
      await this.pool.query( `
        INSERT INTO ml_slot_usage (
          slot_id,
          tenant_id,
          usage_data,
          created_at
        ) VALUES ($1, $2, $3, NOW())
      `, [ slot.id, tenantId, JSON.stringify( usageData ) ] );

      console.log( `✅ [ML-SLOTS] Slot usado: ${ slot.slot_name } (${ slot.usage_count + 1 } usos)` );

      return {
        success: true,
        slotId: slot.id,
        slotType: slot.slot_type,
        slotName: slot.slot_name,
        usageCount: slot.usage_count + 1,
        usageData
      };

    } catch ( error )
    {
      console.error( `❌ [ML-SLOTS] Erro ao usar slot:`, error );
      throw error;
    }
  }

  /**
   * Desativar slot ML
   * @param {string} tenantId - ID do tenant
   * @param {string} slotLocation - Localização do slot
   * @returns {Object} Resultado da desativação
   */
  async deactivateSlot( tenantId, slotLocation )
  {
    try
    {
      console.log( `🔴 [ML-SLOTS] Desativando slot: ${ tenantId } - ${ slotLocation }` );

      const result = await this.pool.query( `
        UPDATE ml_slots 
        SET 
          is_active = false,
          updated_at = NOW()
        WHERE tenant_id = $1 AND slot_location = $2 AND is_active = true
        RETURNING id, slot_name
      `, [ tenantId, slotLocation ] );

      if ( result.rows.length === 0 )
      {
        throw new Error( `Slot ML não encontrado: ${ slotLocation }` );
      }

      const slot = result.rows[ 0 ];

      console.log( `✅ [ML-SLOTS] Slot desativado: ${ slot.slot_name }` );

      return {
        success: true,
        slotId: slot.id,
        slotName: slot.slot_name,
        deactivatedAt: new Date().toISOString()
      };

    } catch ( error )
    {
      console.error( `❌ [ML-SLOTS] Erro ao desativar slot:`, error );
      throw error;
    }
  }

  /**
   * Listar slots de um tenant
   * @param {string} tenantId - ID do tenant
   * @param {boolean} activeOnly - Apenas slots ativos
   * @returns {Array} Lista de slots
   */
  async listSlots( tenantId, activeOnly = false )
  {
    try
    {
      const whereClause = activeOnly ?
        'WHERE tenant_id = $1 AND is_active = true' :
        'WHERE tenant_id = $1';

      const result = await this.pool.query( `
        SELECT 
          id,
          slot_type,
          slot_name,
          slot_location,
          slot_config,
          is_active,
          usage_count,
          created_at,
          last_used_at,
          updated_at
        FROM ml_slots 
        ${ whereClause }
        ORDER BY created_at DESC
      `, [ tenantId ] );

      return result.rows.map( slot => ( {
        ...slot,
        slot_config: JSON.parse( slot.slot_config || '{}' ),
        typeInfo: QUANTUM_CONFIG.ML_SLOT_TYPES[ slot.slot_type ] || {}
      } ) );

    } catch ( error )
    {
      console.error( `❌ [ML-SLOTS] Erro ao listar slots:`, error );
      throw error;
    }
  }

  /**
   * Obter estatísticas de uso de slots
   * @param {string} tenantId - ID do tenant
   * @param {number} days - Dias para análise (padrão: 30)
   * @returns {Object} Estatísticas
   */
  async getSlotStats( tenantId, days = 30 )
  {
    try
    {
      const result = await this.pool.query( `
        SELECT 
          s.slot_type,
          s.slot_name,
          s.slot_location,
          s.usage_count,
          COUNT(su.id) as recent_uses,
          MAX(su.created_at) as last_use
        FROM ml_slots s
        LEFT JOIN ml_slot_usage su ON s.id = su.slot_id 
          AND su.created_at >= NOW() - INTERVAL '${ days } days'
        WHERE s.tenant_id = $1 AND s.is_active = true
        GROUP BY s.id, s.slot_type, s.slot_name, s.slot_location, s.usage_count
        ORDER BY s.usage_count DESC
      `, [ tenantId ] );

      const slotsInfo = await this.checkTenantSlots( tenantId );

      return {
        summary: {
          totalSlots: slotsInfo.totalSlots,
          usedSlots: slotsInfo.usedSlots,
          availableSlots: slotsInfo.availableSlots,
          utilizationRate: slotsInfo.totalSlots > 0 ?
            Math.round( ( slotsInfo.usedSlots / slotsInfo.totalSlots ) * 100 ) : 0
        },
        slots: result.rows,
        period: `${ days } dias`,
        timestamp: new Date().toISOString()
      };

    } catch ( error )
    {
      console.error( `❌ [ML-SLOTS] Erro ao obter estatísticas:`, error );
      throw error;
    }
  }

  /**
   * Migrar de sistema de créditos para slots
   * @param {string} tenantId - ID do tenant
   * @returns {Object} Resultado da migração
   */
  async migrateFromCreditsToSlots( tenantId )
  {
    try
    {
      console.log( `🔄 [ML-SLOTS] Migrando tenant para sistema de slots: ${ tenantId }` );

      // Buscar uso histórico de créditos
      const creditsHistory = await this.pool.query( `
        SELECT 
          usage_type,
          insight_type,
          COUNT(*) as usage_count,
          MAX(created_at) as last_used
        FROM ml_usage_history 
        WHERE tenant_id = $1 
        AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY usage_type, insight_type
        ORDER BY usage_count DESC
      `, [ tenantId ] );

      const migrationResults = {
        slotsCreated: 0,
        errors: []
      };

      // Criar slots baseados no histórico de uso
      for ( const usage of creditsHistory.rows )
      {
        try
        {
          if ( usage.usage_type === 'manual_insight' )
          {
            // Criar slot genérico para insights manuais
            await this.createSlot(
              tenantId,
              'dashboard_widget',
              `Insight ${ usage.insight_type }`,
              `migrated_${ usage.insight_type }_${ Date.now() }`,
              {
                migrated: true,
                originalType: usage.insight_type,
                historicalUsage: usage.usage_count
              }
            );
            migrationResults.slotsCreated++;
          }
        } catch ( error )
        {
          migrationResults.errors.push( `Erro ao migrar ${ usage.usage_type }: ${ error.message }` );
        }
      }

      console.log( `✅ [ML-SLOTS] Migração concluída: ${ migrationResults.slotsCreated } slots criados` );

      return migrationResults;

    } catch ( error )
    {
      console.error( `❌ [ML-SLOTS] Erro na migração:`, error );
      throw error;
    }
  }

  /**
   * Fechar conexões
   */
  async close()
  {
    await this.pool.end();
    console.log( '🔌 [ML-SLOTS] Conexões fechadas' );
  }
}

export default new MLSlotsService();
