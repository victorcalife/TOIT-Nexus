/**
 * SERVIÇO DE GESTÃO DE STORAGE
 * Controla uso de espaço/memória/HD por tenant e plano
 * 100% JavaScript - SEM TYPESCRIPT
 */

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const QUANTUM_CONFIG = require('../../config/quantum-config');

class StorageManagementService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  /**
   * Verificar uso de storage de um tenant
   * @param {string} tenantId - ID do tenant
   * @returns {Object} Informações de uso de storage
   */
  async checkTenantStorage(tenantId) {
    try {
      console.log(`📊 [STORAGE] Verificando storage do tenant: ${tenantId}`);

      // Buscar plano do tenant
      const planResult = await this.pool.query(`
        SELECT sp.name as plan_name, sp.storage_limits
        FROM tenant_subscriptions ts
        JOIN subscription_plans sp ON ts.plan_id = sp.id
        WHERE ts.tenant_id = $1 AND ts.is_active = true
      `, [tenantId]);

      if (planResult.rows.length === 0) {
        throw new Error(`Plano não encontrado para tenant: ${tenantId}`);
      }

      const planName = planResult.rows[0].plan_name;
      const planConfig = QUANTUM_CONFIG.PLANS[planName.toUpperCase()];

      if (!planConfig) {
        throw new Error(`Configuração de plano não encontrada: ${planName}`);
      }

      // Calcular uso atual por categoria
      const usage = await this.calculateStorageUsage(tenantId);

      // Comparar com limites do plano
      const limits = planConfig.storage;
      const analysis = this.analyzeStorageUsage(usage, limits);

      return {
        tenantId,
        planName,
        usage,
        limits,
        analysis,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ [STORAGE] Erro ao verificar storage:`, error);
      throw error;
    }
  }

  /**
   * Calcular uso atual de storage por categoria
   * @param {string} tenantId - ID do tenant
   * @returns {Object} Uso por categoria
   */
  async calculateStorageUsage(tenantId) {
    const usage = {
      total: 0,
      uploads: 0,
      database: 0,
      cache: 0,
      logs: 0,
      emails: 0,
      calendar: 0,
      chat: 0
    };

    try {
      // 1. UPLOADS - Arquivos enviados
      const uploadsResult = await this.pool.query(`
        SELECT COALESCE(SUM(file_size), 0) as total_size
        FROM file_uploads 
        WHERE tenant_id = $1
      `, [tenantId]);
      usage.uploads = parseInt(uploadsResult.rows[0].total_size) || 0;

      // 2. DATABASE - Dados de queries, relatórios, workflows
      const dbResult = await this.pool.query(`
        SELECT 
          COALESCE(SUM(pg_column_size(query_result)), 0) as query_data,
          COALESCE(SUM(pg_column_size(report_data)), 0) as report_data,
          COALESCE(SUM(pg_column_size(workflow_data)), 0) as workflow_data
        FROM (
          SELECT query_result FROM query_history WHERE tenant_id = $1
          UNION ALL
          SELECT report_data FROM report_history WHERE tenant_id = $1
          UNION ALL
          SELECT workflow_data FROM workflow_executions WHERE tenant_id = $1
        ) as combined_data
      `, [tenantId]);
      
      if (dbResult.rows.length > 0) {
        const dbData = dbResult.rows[0];
        usage.database = (parseInt(dbData.query_data) || 0) + 
                        (parseInt(dbData.report_data) || 0) + 
                        (parseInt(dbData.workflow_data) || 0);
      }

      // 3. CACHE - Cache ML e sistema
      const cacheResult = await this.pool.query(`
        SELECT COALESCE(SUM(pg_column_size(cache_data)), 0) as total_cache
        FROM system_cache 
        WHERE tenant_id = $1
      `, [tenantId]);
      usage.cache = parseInt(cacheResult.rows[0].total_cache) || 0;

      // 4. LOGS - Logs de sistema e auditoria
      const logsResult = await this.pool.query(`
        SELECT COALESCE(SUM(pg_column_size(log_data)), 0) as total_logs
        FROM system_logs 
        WHERE tenant_id = $1
      `, [tenantId]);
      usage.logs = parseInt(logsResult.rows[0].total_logs) || 0;

      // 5. EMAILS - Emails enviados
      const emailsResult = await this.pool.query(`
        SELECT COALESCE(SUM(pg_column_size(email_content) + pg_column_size(attachments)), 0) as total_emails
        FROM email_history 
        WHERE tenant_id = $1
      `, [tenantId]);
      usage.emails = parseInt(emailsResult.rows[0].total_emails) || 0;

      // 6. CALENDAR - Eventos e agendamentos
      const calendarResult = await this.pool.query(`
        SELECT COALESCE(SUM(pg_column_size(event_data)), 0) as total_calendar
        FROM calendar_events 
        WHERE tenant_id = $1
      `, [tenantId]);
      usage.calendar = parseInt(calendarResult.rows[0].total_calendar) || 0;

      // 7. CHAT - Mensagens e histórico
      const chatResult = await this.pool.query(`
        SELECT COALESCE(SUM(pg_column_size(message_content) + pg_column_size(attachments)), 0) as total_chat
        FROM chat_messages 
        WHERE tenant_id = $1
      `, [tenantId]);
      usage.chat = parseInt(chatResult.rows[0].total_chat) || 0;

      // Calcular total
      usage.total = usage.uploads + usage.database + usage.cache + 
                   usage.logs + usage.emails + usage.calendar + usage.chat;

      console.log(`📊 [STORAGE] Uso calculado para ${tenantId}: ${this.formatBytes(usage.total)}`);

      return usage;

    } catch (error) {
      console.error(`❌ [STORAGE] Erro ao calcular uso:`, error);
      // Retornar uso zerado em caso de erro
      return usage;
    }
  }

  /**
   * Analisar uso de storage vs limites
   * @param {Object} usage - Uso atual
   * @param {Object} limits - Limites do plano
   * @returns {Object} Análise detalhada
   */
  analyzeStorageUsage(usage, limits) {
    const analysis = {
      status: 'ok',
      warnings: [],
      critical: [],
      recommendations: [],
      percentages: {}
    };

    // Calcular percentuais por categoria
    Object.keys(usage).forEach(category => {
      if (category === 'total') {
        analysis.percentages[category] = limits.total > 0 ? 
          Math.round((usage.total / limits.total) * 100) : 0;
      } else if (limits[category]) {
        analysis.percentages[category] = limits[category] > 0 ? 
          Math.round((usage[category] / limits[category]) * 100) : 0;
      }
    });

    // Verificar status geral
    const totalPercentage = analysis.percentages.total;
    
    if (totalPercentage >= 95) {
      analysis.status = 'critical';
      analysis.critical.push('Storage quase esgotado (95%+)');
    } else if (totalPercentage >= 80) {
      analysis.status = 'warning';
      analysis.warnings.push('Storage em nível alto (80%+)');
    }

    // Verificar categorias específicas
    Object.keys(analysis.percentages).forEach(category => {
      const percentage = analysis.percentages[category];
      
      if (percentage >= 90 && category !== 'total') {
        analysis.warnings.push(`${category} em nível crítico (${percentage}%)`);
      } else if (percentage >= 75 && category !== 'total') {
        analysis.warnings.push(`${category} em nível alto (${percentage}%)`);
      }
    });

    // Gerar recomendações
    if (analysis.percentages.uploads > 70) {
      analysis.recommendations.push('Considere limpar arquivos antigos de upload');
    }
    if (analysis.percentages.logs > 60) {
      analysis.recommendations.push('Execute limpeza de logs antigos');
    }
    if (analysis.percentages.cache > 50) {
      analysis.recommendations.push('Limpe o cache do sistema');
    }
    if (totalPercentage > 80) {
      analysis.recommendations.push('Considere fazer upgrade do plano');
    }

    return analysis;
  }

  /**
   * Verificar se tenant pode usar mais storage
   * @param {string} tenantId - ID do tenant
   * @param {number} additionalBytes - Bytes adicionais necessários
   * @param {string} category - Categoria de storage
   * @returns {Object} Resultado da verificação
   */
  async canUseStorage(tenantId, additionalBytes, category = 'uploads') {
    try {
      const storageInfo = await this.checkTenantStorage(tenantId);
      const currentUsage = storageInfo.usage[category] || 0;
      const limit = storageInfo.limits[category] || 0;
      const totalLimit = storageInfo.limits.total || 0;
      const totalUsage = storageInfo.usage.total || 0;

      const canUseCategory = (currentUsage + additionalBytes) <= limit;
      const canUseTotal = (totalUsage + additionalBytes) <= totalLimit;

      return {
        allowed: canUseCategory && canUseTotal,
        reason: !canUseCategory ? `Limite da categoria ${category} excedido` :
                !canUseTotal ? 'Limite total de storage excedido' : 'OK',
        currentUsage: {
          category: currentUsage,
          total: totalUsage
        },
        limits: {
          category: limit,
          total: totalLimit
        },
        afterUsage: {
          category: currentUsage + additionalBytes,
          total: totalUsage + additionalBytes
        }
      };

    } catch (error) {
      console.error(`❌ [STORAGE] Erro ao verificar disponibilidade:`, error);
      return {
        allowed: false,
        reason: 'Erro ao verificar storage',
        error: error.message
      };
    }
  }

  /**
   * Registrar uso de storage
   * @param {string} tenantId - ID do tenant
   * @param {number} bytes - Bytes utilizados
   * @param {string} category - Categoria
   * @param {string} description - Descrição do uso
   */
  async recordStorageUsage(tenantId, bytes, category, description) {
    try {
      await this.pool.query(`
        INSERT INTO storage_usage_log (
          tenant_id,
          category,
          bytes_used,
          description,
          created_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `, [tenantId, category, bytes, description]);

      console.log(`📝 [STORAGE] Uso registrado: ${tenantId} - ${category} - ${this.formatBytes(bytes)}`);

    } catch (error) {
      console.error(`❌ [STORAGE] Erro ao registrar uso:`, error);
    }
  }

  /**
   * Limpeza automática de storage
   * @param {string} tenantId - ID do tenant
   * @returns {Object} Resultado da limpeza
   */
  async performCleanup(tenantId) {
    try {
      console.log(`🧹 [STORAGE] Iniciando limpeza para tenant: ${tenantId}`);

      const cleanupResults = {
        logsDeleted: 0,
        cacheCleared: 0,
        oldFilesDeleted: 0,
        totalBytesFreed: 0
      };

      // 1. Limpar logs antigos (> 30 dias)
      const logsResult = await this.pool.query(`
        DELETE FROM system_logs 
        WHERE tenant_id = $1 
        AND created_at < NOW() - INTERVAL '30 days'
        RETURNING pg_column_size(log_data) as size
      `, [tenantId]);

      cleanupResults.logsDeleted = logsResult.rows.length;
      cleanupResults.totalBytesFreed += logsResult.rows.reduce((sum, row) => sum + (row.size || 0), 0);

      // 2. Limpar cache antigo (> 24 horas)
      const cacheResult = await this.pool.query(`
        DELETE FROM system_cache 
        WHERE tenant_id = $1 
        AND created_at < NOW() - INTERVAL '24 hours'
        RETURNING pg_column_size(cache_data) as size
      `, [tenantId]);

      cleanupResults.cacheCleared = cacheResult.rows.length;
      cleanupResults.totalBytesFreed += cacheResult.rows.reduce((sum, row) => sum + (row.size || 0), 0);

      // 3. Limpar arquivos temporários antigos (> 7 dias)
      const filesResult = await this.pool.query(`
        DELETE FROM file_uploads 
        WHERE tenant_id = $1 
        AND is_temporary = true 
        AND created_at < NOW() - INTERVAL '7 days'
        RETURNING file_size
      `, [tenantId]);

      cleanupResults.oldFilesDeleted = filesResult.rows.length;
      cleanupResults.totalBytesFreed += filesResult.rows.reduce((sum, row) => sum + (row.file_size || 0), 0);

      console.log(`✅ [STORAGE] Limpeza concluída: ${this.formatBytes(cleanupResults.totalBytesFreed)} liberados`);

      return cleanupResults;

    } catch (error) {
      console.error(`❌ [STORAGE] Erro na limpeza:`, error);
      throw error;
    }
  }

  /**
   * Formatar bytes em formato legível
   * @param {number} bytes - Bytes
   * @returns {string} Formato legível
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Obter relatório de storage
   * @param {string} tenantId - ID do tenant
   * @returns {Object} Relatório detalhado
   */
  async getStorageReport(tenantId) {
    try {
      const storageInfo = await this.checkTenantStorage(tenantId);
      
      // Buscar histórico de uso
      const historyResult = await this.pool.query(`
        SELECT 
          category,
          SUM(bytes_used) as total_bytes,
          COUNT(*) as operations,
          DATE(created_at) as date
        FROM storage_usage_log 
        WHERE tenant_id = $1 
        AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY category, DATE(created_at)
        ORDER BY date DESC
      `, [tenantId]);

      return {
        ...storageInfo,
        history: historyResult.rows,
        recommendations: this.generateStorageRecommendations(storageInfo)
      };

    } catch (error) {
      console.error(`❌ [STORAGE] Erro ao gerar relatório:`, error);
      throw error;
    }
  }

  /**
   * Gerar recomendações de storage
   * @param {Object} storageInfo - Informações de storage
   * @returns {Array} Lista de recomendações
   */
  generateStorageRecommendations(storageInfo) {
    const recommendations = [];
    const { analysis, usage, limits } = storageInfo;

    if (analysis.percentages.total > 80) {
      recommendations.push({
        type: 'upgrade',
        priority: 'high',
        title: 'Considere fazer upgrade do plano',
        description: 'Seu storage está quase no limite. Um plano superior ofereceria mais espaço.'
      });
    }

    if (analysis.percentages.uploads > 70) {
      recommendations.push({
        type: 'cleanup',
        priority: 'medium',
        title: 'Limpe arquivos antigos',
        description: 'Remova uploads desnecessários para liberar espaço.'
      });
    }

    if (analysis.percentages.logs > 60) {
      recommendations.push({
        type: 'maintenance',
        priority: 'low',
        title: 'Execute limpeza de logs',
        description: 'Logs antigos podem ser removidos automaticamente.'
      });
    }

    return recommendations;
  }

  /**
   * Fechar conexões
   */
  async close() {
    await this.pool.end();
    console.log('🔌 [STORAGE] Conexões fechadas');
  }
}

module.exports = new StorageManagementService();
