/**
 * CALENDAR INTEGRATION SERVICE - Integração com calendários externos
 * Suporte: Google Calendar, Apple iCloud, Outlook/Microsoft Exchange
 * Funcionalidades: Sincronização bidirecional, criação de eventos, lembretes
 */

import { db } from './db';
import { users, calendarIntegrations, calendarEvents } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Tipos para integração de calendários
export interface CalendarProvider {
  type: 'google' | 'apple' | 'outlook';
  name: string;
  authUrl: string;
  scopes: string[];
  clientId: string;
  clientSecret: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
  location?: string;
  reminders?: {
    method: 'email' | 'popup';
    minutes: number;
  }[];
  recurrence?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
}

export interface CalendarIntegration {
  id: string;
  userId: string;
  provider: 'google' | 'apple' | 'outlook';
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  calendarId: string;
  calendarName: string;
  isActive: boolean;
  lastSyncAt?: Date;
  syncErrors?: number;
}

/**
 * CONFIGURAÇÕES DOS PROVEDORES DE CALENDÁRIO
 */
const CALENDAR_PROVIDERS: Record<string, CalendarProvider> = {
  google: {
    type: 'google',
    name: 'Google Calendar',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET || ''
  },
  apple: {
    type: 'apple',
    name: 'Apple iCloud',
    authUrl: 'https://idmsa.apple.com/appleauth/auth/signin',
    scopes: ['https://www.icloud.com/calendar'],
    clientId: process.env.APPLE_CALENDAR_CLIENT_ID || '',
    clientSecret: process.env.APPLE_CALENDAR_CLIENT_SECRET || ''
  },
  outlook: {
    type: 'outlook',
    name: 'Microsoft Outlook',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scopes: [
      'https://graph.microsoft.com/calendars.readwrite',
      'https://graph.microsoft.com/user.read'
    ],
    clientId: process.env.MICROSOFT_CALENDAR_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CALENDAR_CLIENT_SECRET || ''
  }
};

export class CalendarIntegrationService {
  
  /**
   * Obter URL de autorização para conectar calendário
   */
  static getAuthorizationUrl(provider: 'google' | 'apple' | 'outlook', userId: string, redirectUri: string): string {
    const config = CALENDAR_PROVIDERS[provider];
    
    if (!config || !config.clientId) {
      throw new Error(`Provider ${provider} não configurado`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      scope: config.scopes.join(' '),
      redirect_uri: redirectUri,
      state: `${provider}_${userId}`, // Para validação de segurança
      access_type: 'offline', // Para obter refresh token
      prompt: 'consent'
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  /**
   * Processar callback de autorização e salvar tokens
   */
  static async processAuthCallback(
    provider: 'google' | 'apple' | 'outlook',
    authCode: string,
    userId: string,
    redirectUri: string
  ): Promise<CalendarIntegration> {
    const config = CALENDAR_PROVIDERS[provider];
    
    try {
      // Trocar código por tokens de acesso
      const tokenResponse = await this.exchangeCodeForTokens(provider, authCode, redirectUri);
      
      // Obter informações do calendário principal
      const calendarInfo = await this.getCalendarInfo(provider, tokenResponse.access_token);
      
      // Salvar integração no banco
      const [integration] = await db
        .insert(calendarIntegrations)
        .values({
          userId,
          provider,
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          tokenExpiresAt: tokenResponse.expires_at ? new Date(tokenResponse.expires_at) : null,
          calendarId: calendarInfo.id,
          calendarName: calendarInfo.name,
          isActive: true,
          lastSyncAt: new Date(),
          syncErrors: 0
        })
        .returning();

      console.log(`✅ Integração ${provider} criada para usuário ${userId}`);
      
      return integration as CalendarIntegration;
      
    } catch (error) {
      console.error(`❌ Erro ao processar callback ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Trocar código de autorização por tokens
   */
  private static async exchangeCodeForTokens(
    provider: 'google' | 'apple' | 'outlook',
    authCode: string,
    redirectUri: string
  ): Promise<any> {
    const config = CALENDAR_PROVIDERS[provider];
    
    let tokenUrl = '';
    let requestBody: any = {};
    
    switch (provider) {
      case 'google':
        tokenUrl = 'https://oauth2.googleapis.com/token';
        requestBody = {
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code: authCode,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri
        };
        break;
        
      case 'outlook':
        tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
        requestBody = {
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code: authCode,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri
        };
        break;
        
      case 'apple':
        // Apple usa um fluxo diferente - requer JWT
        throw new Error('Apple Calendar integration not yet implemented');
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(requestBody).toString()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    return await response.json();
  }

  /**
   * Obter informações do calendário principal
   */
  private static async getCalendarInfo(provider: 'google' | 'apple' | 'outlook', accessToken: string): Promise<{id: string, name: string}> {
    let apiUrl = '';
    let headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`
    };

    switch (provider) {
      case 'google':
        apiUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary';
        break;
        
      case 'outlook':
        apiUrl = 'https://graph.microsoft.com/v1.0/me/calendar';
        break;
        
      case 'apple':
        throw new Error('Apple Calendar integration not yet implemented');
    }

    const response = await fetch(apiUrl, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to get calendar info: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      id: data.id,
      name: data.name || data.summary || 'Calendário Principal'
    };
  }

  /**
   * Sincronizar eventos do calendário externo
   */
  static async syncCalendarEvents(userId: string, integrationId: string): Promise<{imported: number, errors: number}> {
    try {
      // Buscar integração ativa
      const integration = await db
        .select()
        .from(calendarIntegrations)
        .where(
          and(
            eq(calendarIntegrations.id, integrationId),
            eq(calendarIntegrations.userId, userId),
            eq(calendarIntegrations.isActive, true)
          )
        )
        .then(rows => rows[0]);

      if (!integration) {
        throw new Error('Integração não encontrada ou inativa');
      }

      // Verificar se token precisa ser renovado
      if (integration.tokenExpiresAt && new Date() > integration.tokenExpiresAt) {
        await this.refreshAccessToken(integration);
      }

      // Buscar eventos do calendário externo
      const events = await this.fetchExternalEvents(integration);
      
      let imported = 0;
      let errors = 0;

      // Importar eventos para o banco
      for (const event of events) {
        try {
          await this.importCalendarEvent(userId, integrationId, event);
          imported++;
        } catch (error) {
          console.error('Erro ao importar evento:', error);
          errors++;
        }
      }

      // Atualizar última sincronização
      await db
        .update(calendarIntegrations)
        .set({
          lastSyncAt: new Date(),
          syncErrors: errors
        })
        .where(eq(calendarIntegrations.id, integrationId));

      console.log(`📅 Sincronização completa: ${imported} importados, ${errors} erros`);
      
      return { imported, errors };
      
    } catch (error) {
      console.error('❌ Erro na sincronização de calendário:', error);
      throw error;
    }
  }

  /**
   * Buscar eventos do calendário externo
   */
  private static async fetchExternalEvents(integration: any): Promise<CalendarEvent[]> {
    const headers = {
      'Authorization': `Bearer ${integration.accessToken}`
    };

    let apiUrl = '';
    
    // Data de início (últimos 30 dias) e fim (próximos 90 dias)
    const timeMin = new Date();
    timeMin.setDate(timeMin.getDate() - 30);
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 90);

    switch (integration.provider) {
      case 'google':
        apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${integration.calendarId}/events?` +
                 `timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime`;
        break;
        
      case 'outlook':
        apiUrl = `https://graph.microsoft.com/v1.0/me/calendars/${integration.calendarId}/events?` +
                 `$filter=start/dateTime ge '${timeMin.toISOString()}' and start/dateTime le '${timeMax.toISOString()}'&$orderby=start/dateTime`;
        break;
    }

    const response = await fetch(apiUrl, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const data = await response.json();
    const events = data.items || data.value || [];
    
    return events.map((event: any) => this.normalizeEvent(integration.provider, event));
  }

  /**
   * Normalizar evento de diferentes provedores para formato padrão
   */
  private static normalizeEvent(provider: string, event: any): CalendarEvent {
    switch (provider) {
      case 'google':
        return {
          id: event.id,
          title: event.summary || 'Sem título',
          description: event.description,
          startTime: new Date(event.start.dateTime || event.start.date),
          endTime: new Date(event.end.dateTime || event.end.date),
          attendees: event.attendees?.map((a: any) => a.email) || [],
          location: event.location,
          reminders: event.reminders?.overrides?.map((r: any) => ({
            method: r.method,
            minutes: r.minutes
          })) || [],
          recurrence: event.recurrence?.join(','),
          status: event.status
        };
        
      case 'outlook':
        return {
          id: event.id,
          title: event.subject || 'Sem título',
          description: event.body?.content,
          startTime: new Date(event.start.dateTime),
          endTime: new Date(event.end.dateTime),
          attendees: event.attendees?.map((a: any) => a.emailAddress.address) || [],
          location: event.location?.displayName,
          reminders: [], // Outlook tem estrutura diferente para lembretes
          recurrence: event.recurrence?.pattern ? JSON.stringify(event.recurrence) : undefined,
          status: event.responseStatus?.response === 'accepted' ? 'confirmed' : 'tentative'
        };
        
      default:
        throw new Error(`Provider ${provider} not supported`);
    }
  }

  /**
   * Importar evento para o banco local
   */
  private static async importCalendarEvent(userId: string, integrationId: string, event: CalendarEvent): Promise<void> {
    // Verificar se evento já existe
    const existingEvent = await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.externalId, event.id),
          eq(calendarEvents.integrationId, integrationId)
        )
      )
      .then(rows => rows[0]);

    const eventData = {
      userId,
      integrationId,
      externalId: event.id,
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      attendees: event.attendees,
      location: event.location,
      reminders: event.reminders,
      recurrence: event.recurrence,
      status: event.status,
      lastSyncAt: new Date()
    };

    if (existingEvent) {
      // Atualizar evento existente
      await db
        .update(calendarEvents)
        .set(eventData)
        .where(eq(calendarEvents.id, existingEvent.id));
    } else {
      // Criar novo evento
      await db
        .insert(calendarEvents)
        .values(eventData);
    }
  }

  /**
   * Renovar token de acesso expirado
   */
  private static async refreshAccessToken(integration: any): Promise<void> {
    if (!integration.refreshToken) {
      throw new Error('Refresh token not available - reauthorization required');
    }

    const config = CALENDAR_PROVIDERS[integration.provider];
    let tokenUrl = '';
    let requestBody: any = {};

    switch (integration.provider) {
      case 'google':
        tokenUrl = 'https://oauth2.googleapis.com/token';
        requestBody = {
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: integration.refreshToken,
          grant_type: 'refresh_token'
        };
        break;
        
      case 'outlook':
        tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
        requestBody = {
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: integration.refreshToken,
          grant_type: 'refresh_token'
        };
        break;
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(requestBody).toString()
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const tokens = await response.json();
    
    // Atualizar tokens no banco
    await db
      .update(calendarIntegrations)
      .set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || integration.refreshToken,
        tokenExpiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null
      })
      .where(eq(calendarIntegrations.id, integration.id));
  }

  /**
   * Criar evento no calendário externo
   */
  static async createExternalEvent(userId: string, integrationId: string, event: Partial<CalendarEvent>): Promise<string> {
    try {
      const integration = await db
        .select()
        .from(calendarIntegrations)
        .where(
          and(
            eq(calendarIntegrations.id, integrationId),
            eq(calendarIntegrations.userId, userId),
            eq(calendarIntegrations.isActive, true)
          )
        )
        .then(rows => rows[0]);

      if (!integration) {
        throw new Error('Integração não encontrada');
      }

      // Verificar token
      if (integration.tokenExpiresAt && new Date() > integration.tokenExpiresAt) {
        await this.refreshAccessToken(integration);
      }

      const headers = {
        'Authorization': `Bearer ${integration.accessToken}`,
        'Content-Type': 'application/json'
      };

      let apiUrl = '';
      let eventPayload: any = {};

      switch (integration.provider) {
        case 'google':
          apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${integration.calendarId}/events`;
          eventPayload = {
            summary: event.title,
            description: event.description,
            start: {
              dateTime: event.startTime?.toISOString(),
              timeZone: 'America/Sao_Paulo'
            },
            end: {
              dateTime: event.endTime?.toISOString(),
              timeZone: 'America/Sao_Paulo'
            },
            location: event.location,
            attendees: event.attendees?.map(email => ({ email }))
          };
          break;
          
        case 'outlook':
          apiUrl = `https://graph.microsoft.com/v1.0/me/calendars/${integration.calendarId}/events`;
          eventPayload = {
            subject: event.title,
            body: {
              contentType: 'Text',
              content: event.description
            },
            start: {
              dateTime: event.startTime?.toISOString(),
              timeZone: 'America/Sao_Paulo'
            },
            end: {
              dateTime: event.endTime?.toISOString(),
              timeZone: 'America/Sao_Paulo'
            },
            location: {
              displayName: event.location
            },
            attendees: event.attendees?.map(email => ({
              emailAddress: { address: email, name: email }
            }))
          };
          break;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(eventPayload)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create event: ${error}`);
      }

      const createdEvent = await response.json();
      console.log(`✅ Evento criado no ${integration.provider}: ${createdEvent.id}`);
      
      return createdEvent.id;
      
    } catch (error) {
      console.error('❌ Erro ao criar evento externo:', error);
      throw error;
    }
  }

  /**
   * Listar integrações ativas do usuário
   */
  static async getUserIntegrations(userId: string): Promise<CalendarIntegration[]> {
    const integrations = await db
      .select()
      .from(calendarIntegrations)
      .where(
        and(
          eq(calendarIntegrations.userId, userId),
          eq(calendarIntegrations.isActive, true)
        )
      );

    return integrations as CalendarIntegration[];
  }

  /**
   * Desconectar integração de calendário
   */
  static async disconnectIntegration(userId: string, integrationId: string): Promise<void> {
    await db
      .update(calendarIntegrations)
      .set({
        isActive: false,
        accessToken: '', // Limpar tokens por segurança
        refreshToken: ''
      })
      .where(
        and(
          eq(calendarIntegrations.id, integrationId),
          eq(calendarIntegrations.userId, userId)
        )
      );

    console.log(`🔌 Integração ${integrationId} desconectada`);
  }
}

// Função para processar sincronização automática (cron job)
export function startCalendarSyncCron() {
  // Executar sincronização a cada 30 minutos
  setInterval(async () => {
    try {
      console.log('🔄 Iniciando sincronização automática de calendários...');
      
      // Buscar todas as integrações ativas
      const activeIntegrations = await db
        .select()
        .from(calendarIntegrations)
        .where(eq(calendarIntegrations.isActive, true));

      for (const integration of activeIntegrations) {
        try {
          await CalendarIntegrationService.syncCalendarEvents(integration.userId, integration.id);
        } catch (error) {
          console.error(`Erro na sincronização da integração ${integration.id}:`, error);
        }
      }
      
      console.log('✅ Sincronização automática de calendários concluída');
    } catch (error) {
      console.error('❌ Erro na sincronização automática:', error);
    }
  }, 30 * 60 * 1000); // 30 minutos

  console.log('📅 Cron de sincronização de calendários iniciado - processamento a cada 30 minutos');
}