/**
 * API & WEBHOOK ROUTES - API completa para integrações externas
 * Endpoints: APIs REST, Webhooks, monitoramento, logs, automação
 * Funcionalidades: Integrações, callbacks, rate limiting, retry logic
 */

import express from 'express';
import { eq, desc, and, or, ilike, gte, lte, sql } from 'drizzle-orm';
import { db } from './db';
import { 
  apiWebhooks,
  webhookLogs,
  externalDatabaseConnections,
  users
} from '../shared/schema';
import { requireAuth } from './authMiddleware';
import { tenantMiddleware } from './tenantMiddleware';
import { 
  apiWebhookService, 
  APIConnectionSchema,
  WebhookSchema,
  APIRequestSchema,
  WebhookCallSchema 
} from './apiWebhookService';
import { z } from 'zod';

const router = express.Router();

// Middleware para autenticação e tenant
router.use(requireAuth);
router.use(tenantMiddleware);

// ==========================================
// API CONNECTIONS - GESTÃO DE CONEXÕES DE API
// ==========================================

// GET /api/integrations/apis - Listar conexões de API
router.get('/apis', async (req: any, res) => {
  try {
    const { 
      search, 
      isActive, 
      limit = 20, 
      offset = 0 
    } = req.query;
    const tenantId = req.tenant.id;

    let query = db
      .select({
        connection: externalDatabaseConnections,
        createdByUser: {
          id: users.id,
          name: users.name,
          email: users.email
        }
      })
      .from(externalDatabaseConnections)
      .leftJoin(users, eq(users.id, externalDatabaseConnections.createdBy))
      .where(and(
        eq(externalDatabaseConnections.tenantId, tenantId),
        eq(externalDatabaseConnections.type, 'rest_api')
      ));

    // Aplicar filtros
    if (search) {
      query = query.where(
        or(
          ilike(externalDatabaseConnections.name, `%${search}%`),
          ilike(externalDatabaseConnections.description, `%${search}%`)
        )
      );
    }

    if (isActive !== undefined) {
      query = query.where(eq(externalDatabaseConnections.isActive, isActive === 'true'));
    }

    const connections = await query
      .orderBy(desc(externalDatabaseConnections.createdAt))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    // Remover dados sensíveis da config
    const sanitizedConnections = connections.map(item => ({
      ...item,
      connection: {
        ...item.connection,
        config: {
          ...(item.connection.config as any),
          authConfig: {
            ...((item.connection.config as any)?.authConfig || {}),
            apiKey: (item.connection.config as any)?.authConfig?.apiKey ? '***masked***' : undefined,
            bearerToken: (item.connection.config as any)?.authConfig?.bearerToken ? '***masked***' : undefined,
            password: (item.connection.config as any)?.authConfig?.password ? '***masked***' : undefined,
          }
        }
      }
    }));

    res.json({
      success: true,
      data: sanitizedConnections,
      total: connections.length,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error fetching API connections:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar conexões de API'
    });
  }
});

// POST /api/integrations/apis - Criar conexão de API
router.post('/apis', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;

    console.log(`🔗 Criando conexão de API - User: ${userId}, Tenant: ${tenantId}`);

    // Validar dados de entrada
    const validatedData = APIConnectionSchema.parse(req.body);

    const result = await apiWebhookService.createAPIConnection(
      tenantId,
      validatedData
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    // Atualizar com o usuário que criou
    await db
      .update(externalDatabaseConnections)
      .set({ createdBy: userId })
      .where(eq(externalDatabaseConnections.id, result.data.id));

    console.log(`✅ Conexão de API criada: ${result.data.id}`);
    res.status(201).json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Error creating API connection:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha ao criar conexão de API'
      });
    }
  }
});

// POST /api/integrations/apis/:id/execute - Executar chamada de API
router.post('/apis/:id/execute', async (req: any, res) => {
  try {
    const { id: connectionId } = req.params;
    const tenantId = req.tenant.id;

    console.log(`🚀 Executando API call - Connection: ${connectionId}`);

    // Validar dados do request
    const requestData = APIRequestSchema.parse({
      connectionId,
      ...req.body
    });

    const result = await apiWebhookService.executeAPIRequest(
      tenantId,
      requestData
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        responseTime: result.responseTime,
        retryCount: result.retryCount
      });
    }

    res.json({
      success: true,
      data: result.data,
      metadata: {
        status: result.status,
        statusText: result.statusText,
        responseTime: result.responseTime,
        retryCount: result.retryCount
      }
    });

  } catch (error) {
    console.error('Error executing API request:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Parâmetros de requisição inválidos',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha na execução da API'
      });
    }
  }
});

// ==========================================
// WEBHOOKS - GESTÃO DE WEBHOOKS
// ==========================================

// GET /api/integrations/webhooks - Listar webhooks
router.get('/webhooks', async (req: any, res) => {
  try {
    const { 
      search, 
      isActive, 
      trigger,
      limit = 20, 
      offset = 0 
    } = req.query;
    const tenantId = req.tenant.id;

    let query = db
      .select({
        webhook: apiWebhooks,
        recentLogs: sql<number>`
          (SELECT COUNT(*) FROM ${webhookLogs} 
           WHERE ${webhookLogs.webhookId} = ${apiWebhooks.id} 
           AND ${webhookLogs.createdAt} > NOW() - INTERVAL '24 hours')
        `
      })
      .from(apiWebhooks)
      .where(eq(apiWebhooks.tenantId, tenantId));

    // Aplicar filtros
    if (search) {
      query = query.where(
        or(
          ilike(apiWebhooks.name, `%${search}%`),
          ilike(apiWebhooks.description, `%${search}%`)
        )
      );
    }

    if (isActive !== undefined) {
      query = query.where(eq(apiWebhooks.isActive, isActive === 'true'));
    }

    if (trigger) {
      query = query.where(sql`${trigger} = ANY(${apiWebhooks.triggers})`);
    }

    const webhooks = await query
      .orderBy(desc(apiWebhooks.createdAt))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    // Remover dados sensíveis
    const sanitizedWebhooks = webhooks.map(item => ({
      ...item.webhook,
      authConfig: {
        ...((item.webhook.authConfig as any) || {}),
        apiKey: (item.webhook.authConfig as any)?.apiKey ? '***masked***' : undefined,
        bearerToken: (item.webhook.authConfig as any)?.bearerToken ? '***masked***' : undefined,
        secretKey: (item.webhook.authConfig as any)?.secretKey ? '***masked***' : undefined,
      },
      recentLogs: item.recentLogs
    }));

    res.json({
      success: true,
      data: sanitizedWebhooks,
      total: webhooks.length,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error fetching webhooks:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar webhooks'
    });
  }
});

// POST /api/integrations/webhooks - Criar webhook
router.post('/webhooks', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;

    console.log(`🪝 Criando webhook - Tenant: ${tenantId}`);

    // Validar dados de entrada
    const validatedData = WebhookSchema.parse(req.body);

    const result = await apiWebhookService.createWebhook(
      tenantId,
      validatedData
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    console.log(`✅ Webhook criado: ${result.data.id}`);
    res.status(201).json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Error creating webhook:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha ao criar webhook'
      });
    }
  }
});

// POST /api/integrations/webhooks/:id/trigger - Executar webhook manualmente
router.post('/webhooks/:id/trigger', async (req: any, res) => {
  try {
    const { id: webhookId } = req.params;
    const tenantId = req.tenant.id;

    console.log(`🚀 Executando webhook manualmente: ${webhookId}`);

    // Validar dados do call
    const callData = WebhookCallSchema.parse({
      webhookId,
      eventType: req.body.eventType || 'manual_trigger',
      payload: req.body.payload || {},
      metadata: { ...req.body.metadata, manual: true, triggeredBy: req.user.id }
    });

    const result = await apiWebhookService.executeWebhook(
      tenantId,
      callData
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        responseTime: result.responseTime,
        retryCount: result.retryCount
      });
    }

    res.json({
      success: true,
      data: {
        status: result.status,
        statusText: result.statusText,
        responseTime: result.responseTime,
        retryCount: result.retryCount
      },
      message: 'Webhook executado com sucesso'
    });

  } catch (error) {
    console.error('Error triggering webhook:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados de trigger inválidos',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha na execução do webhook'
      });
    }
  }
});

// PUT /api/integrations/webhooks/:id - Atualizar webhook
router.put('/webhooks/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    // Verificar se webhook existe
    const existing = await db
      .select()
      .from(apiWebhooks)
      .where(and(
        eq(apiWebhooks.id, id),
        eq(apiWebhooks.tenantId, tenantId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Webhook não encontrado'
      });
    }

    // Validar dados
    const validatedData = WebhookSchema.partial().parse(req.body);

    // Atualizar webhook
    const updated = await db
      .update(apiWebhooks)
      .set({
        ...validatedData,
        authConfig: validatedData.authConfig as any,
        retryConfig: validatedData.retryConfig as any,
        updatedAt: new Date(),
      })
      .where(eq(apiWebhooks.id, id))
      .returning();

    console.log(`🪝 Webhook atualizado: ${id}`);
    res.json({
      success: true,
      data: updated[0],
      message: 'Webhook atualizado com sucesso'
    });

  } catch (error) {
    console.error('Error updating webhook:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha ao atualizar webhook'
      });
    }
  }
});

// DELETE /api/integrations/webhooks/:id - Deletar webhook
router.delete('/webhooks/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    // Verificar se webhook existe
    const existing = await db
      .select()
      .from(apiWebhooks)
      .where(and(
        eq(apiWebhooks.id, id),
        eq(apiWebhooks.tenantId, tenantId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Webhook não encontrado'
      });
    }

    // Marcar como inativo
    await db
      .update(apiWebhooks)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(apiWebhooks.id, id));

    console.log(`🗑️ Webhook deletado: ${id}`);
    res.json({
      success: true,
      message: 'Webhook removido com sucesso'
    });

  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao deletar webhook'
    });
  }
});

// ==========================================
// WEBHOOK LOGS - MONITORAMENTO E LOGS
// ==========================================

// GET /api/integrations/webhooks/:id/logs - Logs do webhook
router.get('/webhooks/:id/logs', async (req: any, res) => {
  try {
    const { id: webhookId } = req.params;
    const { 
      status, 
      eventType,
      startDate,
      endDate,
      limit = 50, 
      offset = 0 
    } = req.query;
    const tenantId = req.tenant.id;

    // Verificar se webhook pertence ao tenant
    const webhook = await db
      .select()
      .from(apiWebhooks)
      .where(and(
        eq(apiWebhooks.id, webhookId),
        eq(apiWebhooks.tenantId, tenantId)
      ))
      .limit(1);

    if (webhook.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Webhook não encontrado'
      });
    }

    let query = db
      .select()
      .from(webhookLogs)
      .where(eq(webhookLogs.webhookId, webhookId));

    // Aplicar filtros
    if (status) {
      query = query.where(eq(webhookLogs.status, status));
    }

    if (eventType) {
      query = query.where(eq(webhookLogs.eventType, eventType));
    }

    if (startDate) {
      query = query.where(gte(webhookLogs.createdAt, new Date(startDate)));
    }

    if (endDate) {
      query = query.where(lte(webhookLogs.createdAt, new Date(endDate)));
    }

    const logs = await query
      .orderBy(desc(webhookLogs.createdAt))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    res.json({
      success: true,
      data: logs,
      total: logs.length,
      webhook: {
        id: webhook[0].id,
        name: webhook[0].name,
        url: webhook[0].url
      }
    });

  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar logs do webhook'
    });
  }
});

// ==========================================
// STATISTICS - ESTATÍSTICAS E MONITORAMENTO
// ==========================================

// GET /api/integrations/stats - Estatísticas de integrações
router.get('/stats', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;

    // Estatísticas de APIs
    const apiStats = await db
      .select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(case when ${externalDatabaseConnections.isActive} then 1 end)`,
        totalRequests: sql<number>`sum(${externalDatabaseConnections.totalQueries})`,
      })
      .from(externalDatabaseConnections)
      .where(and(
        eq(externalDatabaseConnections.tenantId, tenantId),
        eq(externalDatabaseConnections.type, 'rest_api')
      ));

    // Estatísticas de Webhooks
    const webhookStats = await db
      .select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(case when ${apiWebhooks.isActive} then 1 end)`,
        totalSuccess: sql<number>`sum(${apiWebhooks.successCount})`,
        totalFailures: sql<number>`sum(${apiWebhooks.failureCount})`,
      })
      .from(apiWebhooks)
      .where(eq(apiWebhooks.tenantId, tenantId));

    // Logs recentes
    const recentLogs = await db
      .select({
        log: webhookLogs,
        webhook: {
          name: apiWebhooks.name,
          url: apiWebhooks.url
        }
      })
      .from(webhookLogs)
      .leftJoin(apiWebhooks, eq(apiWebhooks.id, webhookLogs.webhookId))
      .where(eq(apiWebhooks.tenantId, tenantId))
      .orderBy(desc(webhookLogs.createdAt))
      .limit(10);

    // Webhooks mais ativos
    const topWebhooks = await db
      .select({
        id: apiWebhooks.id,
        name: apiWebhooks.name,
        url: apiWebhooks.url,
        successCount: apiWebhooks.successCount,
        failureCount: apiWebhooks.failureCount,
        lastTriggeredAt: apiWebhooks.lastTriggeredAt
      })
      .from(apiWebhooks)
      .where(and(
        eq(apiWebhooks.tenantId, tenantId),
        eq(apiWebhooks.isActive, true)
      ))
      .orderBy(desc(sql`${apiWebhooks.successCount} + ${apiWebhooks.failureCount}`))
      .limit(5);

    res.json({
      success: true,
      data: {
        apis: apiStats[0] || { total: 0, active: 0, totalRequests: 0 },
        webhooks: webhookStats[0] || { total: 0, active: 0, totalSuccess: 0, totalFailures: 0 },
        recentLogs: recentLogs.map(item => ({
          ...item.log,
          webhook: item.webhook
        })),
        topWebhooks,
        summary: {
          totalIntegrations: (apiStats[0]?.total || 0) + (webhookStats[0]?.total || 0),
          activeIntegrations: (apiStats[0]?.active || 0) + (webhookStats[0]?.active || 0),
          successRate: webhookStats[0] ? 
            (webhookStats[0].totalSuccess / (webhookStats[0].totalSuccess + webhookStats[0].totalFailures) * 100) || 0 : 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching integration stats:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar estatísticas de integrações'
    });
  }
});

// ==========================================
// EVENT SYSTEM - SISTEMA DE EVENTOS
// ==========================================

// POST /api/integrations/events/trigger - Disparar evento para webhooks
router.post('/events/trigger', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const { eventType, payload, metadata } = req.body;

    if (!eventType) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de evento é obrigatório'
      });
    }

    console.log(`📡 Disparando evento: ${eventType} - Tenant: ${tenantId}`);

    const result = await apiWebhookService.triggerWebhooksByEvent(
      tenantId,
      eventType,
      payload || {},
      { ...metadata, triggeredBy: req.user.id, manual: true }
    );

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Error triggering event:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao disparar evento'
    });
  }
});

export { router as apiWebhookRoutes };