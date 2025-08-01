/**
 * CALENDAR INTEGRATION ROUTES - APIs para integração com calendários externos
 * Endpoints: OAuth flow, sincronização, gestão de eventos
 * Suporte: Google Calendar, Apple iCloud, Outlook/Microsoft Exchange
 */

import { Router } from 'express';
import { authMiddleware } from './authMiddleware';
import { CalendarIntegrationService } from './calendarIntegrationService';

const router = Router();

/**
 * GET /api/calendar/providers
 * Listar provedores de calendário disponíveis
 */
router.get('/providers', authMiddleware, async (req, res) => {
  try {
    const providers = [
      {
        id: 'google',
        name: 'Google Calendar',
        icon: '/icons/google-calendar.svg',
        description: 'Sincronize com seu Google Calendar',
        available: !!process.env.GOOGLE_CALENDAR_CLIENT_ID,
        features: ['Sincronização bidirecional', 'Criação de eventos', 'Lembretes']
      },
      {
        id: 'outlook',
        name: 'Microsoft Outlook',
        icon: '/icons/outlook-calendar.svg', 
        description: 'Conecte com Outlook/Exchange',
        available: !!process.env.MICROSOFT_CALENDAR_CLIENT_ID,
        features: ['Sincronização completa', 'Eventos corporativos', 'Compartilhamento']
      },
      {
        id: 'apple',
        name: 'Apple iCloud',
        icon: '/icons/apple-calendar.svg',
        description: 'Integração com iCloud Calendar',
        available: false, // Implementação futura
        features: ['Sincronização iOS/macOS', 'Eventos pessoais', 'Lembretes nativos']
      }
    ];

    res.status(200).json({
      success: true,
      providers: providers.filter(p => p.available) // Apenas disponíveis
    });

  } catch (error) {
    console.error('❌ Erro ao listar provedores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /api/calendar/integrations
 * Listar integrações ativas do usuário
 */
router.get('/integrations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        error: 'UNAUTHORIZED'
      });
    }

    console.log('📅 Buscando integrações de calendário para usuário:', userId);

    const integrations = await CalendarIntegrationService.getUserIntegrations(userId);

    // Remover tokens sensíveis da resposta
    const safeIntegrations = integrations.map(integration => ({
      id: integration.id,
      provider: integration.provider,
      calendarName: integration.calendarName,
      isActive: integration.isActive,
      lastSyncAt: integration.lastSyncAt,
      syncErrors: integration.syncErrors,
      createdAt: integration.createdAt
    }));

    res.status(200).json({
      success: true,
      integrations: safeIntegrations,
      count: safeIntegrations.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar integrações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /api/calendar/connect/:provider
 * Iniciar processo de conexão OAuth com provedor
 */
router.post('/connect/:provider', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const provider = req.params.provider as 'google' | 'apple' | 'outlook';

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        error: 'UNAUTHORIZED'
      });
    }

    if (!['google', 'apple', 'outlook'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Provedor inválido. Use: google, apple ou outlook',
        error: 'INVALID_PROVIDER'
      });
    }

    console.log(`📅 Iniciando conexão ${provider} para usuário ${userId}`);

    // URL de callback (ajustar conforme ambiente)
    const baseUrl = process.env.FRONTEND_URL || req.headers.origin || 'http://localhost:5173';
    const redirectUri = `${baseUrl}/calendar-callback`;

    const authUrl = CalendarIntegrationService.getAuthorizationUrl(provider, userId, redirectUri);

    res.status(200).json({
      success: true,
      authUrl,
      provider,
      redirectUri
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar conexão:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao conectar com provedor',
      error: 'CONNECTION_FAILED'
    });
  }
});

/**
 * POST /api/calendar/callback
 * Processar callback OAuth e finalizar integração
 */
router.post('/callback', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { code, state, provider } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        error: 'UNAUTHORIZED'
      });
    }

    if (!code || !state || !provider) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros obrigatórios: code, state, provider',
        error: 'MISSING_PARAMETERS'
      });
    }

    // Validar state por segurança
    if (state !== `${provider}_${userId}`) {
      return res.status(400).json({
        success: false,
        message: 'State inválido - possível ataque CSRF',
        error: 'INVALID_STATE'
      });
    }

    console.log(`📅 Processando callback ${provider} para usuário ${userId}`);

    const baseUrl = process.env.FRONTEND_URL || req.headers.origin || 'http://localhost:5173';
    const redirectUri = `${baseUrl}/calendar-callback`;

    const integration = await CalendarIntegrationService.processAuthCallback(
      provider as 'google' | 'apple' | 'outlook',
      code,
      userId,
      redirectUri
    );

    res.status(201).json({
      success: true,
      message: `${provider} conectado com sucesso`,
      integration: {
        id: integration.id,
        provider: integration.provider,
        calendarName: integration.calendarName,
        createdAt: integration.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Erro no callback:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao processar callback',
      error: 'CALLBACK_FAILED'
    });
  }
});

/**
 * POST /api/calendar/sync/:integrationId
 * Sincronizar eventos de uma integração específica
 */
router.post('/sync/:integrationId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const integrationId = req.params.integrationId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        error: 'UNAUTHORIZED'
      });
    }

    if (!integrationId) {
      return res.status(400).json({
        success: false,
        message: 'ID da integração é obrigatório',
        error: 'INTEGRATION_ID_REQUIRED'
      });
    }

    console.log(`🔄 Sincronizando calendário ${integrationId} para usuário ${userId}`);

    const result = await CalendarIntegrationService.syncCalendarEvents(userId, integrationId);

    res.status(200).json({
      success: true,
      message: 'Sincronização concluída',
      result: {
        imported: result.imported,
        errors: result.errors,
        syncedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro na sincronização',
      error: 'SYNC_FAILED'
    });
  }
});

/**
 * POST /api/calendar/sync-all
 * Sincronizar todas as integrações ativas do usuário
 */
router.post('/sync-all', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        error: 'UNAUTHORIZED'
      });
    }

    console.log(`🔄 Sincronizando todos os calendários para usuário ${userId}`);

    const integrations = await CalendarIntegrationService.getUserIntegrations(userId);
    const results = [];

    for (const integration of integrations) {
      try {
        const result = await CalendarIntegrationService.syncCalendarEvents(userId, integration.id);
        results.push({
          integrationId: integration.id,
          provider: integration.provider,
          calendarName: integration.calendarName,
          ...result
        });
      } catch (error) {
        console.error(`Erro na sincronização da integração ${integration.id}:`, error);
        results.push({
          integrationId: integration.id,
          provider: integration.provider,
          calendarName: integration.calendarName,
          imported: 0,
          errors: 1,
          error: error.message
        });
      }
    }

    const totalImported = results.reduce((sum, r) => sum + r.imported, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);

    res.status(200).json({
      success: true,
      message: 'Sincronização de todos os calendários concluída',
      summary: {
        totalIntegrations: integrations.length,
        totalImported,
        totalErrors,
        syncedAt: new Date().toISOString()
      },
      details: results
    });

  } catch (error) {
    console.error('❌ Erro na sincronização geral:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na sincronização geral',
      error: 'SYNC_ALL_FAILED'
    });
  }
});

/**
 * POST /api/calendar/create-event
 * Criar evento em calendário externo
 */
router.post('/create-event', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { integrationId, event } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        error: 'UNAUTHORIZED'
      });
    }

    if (!integrationId || !event) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros obrigatórios: integrationId, event',
        error: 'MISSING_PARAMETERS'
      });
    }

    // Validar dados do evento
    if (!event.title || !event.startTime || !event.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Dados do evento obrigatórios: title, startTime, endTime',
        error: 'INVALID_EVENT_DATA'
      });
    }

    console.log(`📅 Criando evento "${event.title}" na integração ${integrationId}`);

    // Converter strings de data para Date objects
    const eventData = {
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime)
    };

    const externalEventId = await CalendarIntegrationService.createExternalEvent(
      userId,
      integrationId,
      eventData
    );

    res.status(201).json({
      success: true,
      message: 'Evento criado com sucesso',
      externalEventId,
      event: {
        title: eventData.title,
        startTime: eventData.startTime,
        endTime: eventData.endTime
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar evento:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao criar evento',
      error: 'CREATE_EVENT_FAILED'
    });
  }
});

/**
 * DELETE /api/calendar/disconnect/:integrationId
 * Desconectar integração de calendário
 */
router.delete('/disconnect/:integrationId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const integrationId = req.params.integrationId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        error: 'UNAUTHORIZED'
      });
    }

    if (!integrationId) {
      return res.status(400).json({
        success: false,
        message: 'ID da integração é obrigatório',
        error: 'INTEGRATION_ID_REQUIRED'
      });
    }

    console.log(`🔌 Desconectando integração ${integrationId} para usuário ${userId}`);

    await CalendarIntegrationService.disconnectIntegration(userId, integrationId);

    res.status(200).json({
      success: true,
      message: 'Integração desconectada com sucesso',
      integrationId
    });

  } catch (error) {
    console.error('❌ Erro ao desconectar:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao desconectar integração',
      error: 'DISCONNECT_FAILED'
    });
  }
});

/**
 * GET /api/calendar/events
 * Listar eventos sincronizados do usuário
 */
router.get('/events', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate, integrationId } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        error: 'UNAUTHORIZED'
      });
    }

    console.log(`📅 Buscando eventos para usuário ${userId}`);

    // TODO: Implementar busca de eventos no banco
    // Por enquanto, retornar array vazio
    const events = [];

    res.status(200).json({
      success: true,
      events,
      count: events.length,
      filters: {
        startDate,
        endDate,
        integrationId
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar eventos',
      error: 'FETCH_EVENTS_FAILED'
    });
  }
});

/**
 * GET /api/calendar/status
 * Status geral das integrações de calendário
 */
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        error: 'UNAUTHORIZED'
      });
    }

    const integrations = await CalendarIntegrationService.getUserIntegrations(userId);

    const status = {
      connected: integrations.length,
      active: integrations.filter(i => i.isActive).length,
      withErrors: integrations.filter(i => i.syncErrors > 0).length,
      lastSyncAt: integrations.length > 0 
        ? Math.max(...integrations.map(i => i.lastSyncAt ? new Date(i.lastSyncAt).getTime() : 0))
        : null,
      providers: integrations.reduce((acc, i) => {
        acc[i.provider] = (acc[i.provider] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    res.status(200).json({
      success: true,
      status,
      integrations: integrations.map(i => ({
        id: i.id,
        provider: i.provider,
        calendarName: i.calendarName,
        isActive: i.isActive,
        syncErrors: i.syncErrors,
        lastSyncAt: i.lastSyncAt
      }))
    });

  } catch (error) {
    console.error('❌ Erro ao buscar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar status',
      error: 'STATUS_FAILED'
    });
  }
});

export default router;