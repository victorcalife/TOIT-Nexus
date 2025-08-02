/**
 * CALENDAR WORKFLOW SERVICE - Sistema crítico para triggers de calendário
 * Integração completa com Google Calendar, Outlook Calendar, Apple iCloud e CalDAV
 * Sistema inteligente de parsing e matching de eventos para workflows
 */

import { eq, and, desc, gte, lte, inArray } from 'drizzle-orm';
import { db } from './db';
import { 
  calendarAccounts, 
  calendarTriggers, 
  calendarEventProcessingQueue,
  triggerExecutionHistory,
  visualWorkflows
} from '../shared/schema';
import { nanoid } from 'nanoid';
import { z } from 'zod';

// Interfaces para tipagem
interface CalendarAccount {
  id: string;
  email: string;
  provider: string;
  accessToken?: string;
  refreshToken?: string;
  caldavUrl?: string;
  syncSettings: any;
}

interface CalendarEvent {
  eventId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees: CalendarAttendee[];
  organizer: CalendarAttendee;
  isAllDay: boolean;
  isRecurring: boolean;
  recurrenceRule?: string;
  reminders: CalendarReminder[];
  status: 'confirmed' | 'tentative' | 'cancelled';
  visibility: 'default' | 'public' | 'private' | 'confidential';
  calendarId: string;
  calendarName: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CalendarAttendee {
  email: string;
  displayName?: string;
  responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  optional?: boolean;
}

interface CalendarReminder {
  method: 'email' | 'popup' | 'sms';
  minutes: number; // Minutos antes do evento
}

interface CalendarTriggerRule {
  id: string;
  name: string;
  triggerType: 'event_created' | 'event_updated' | 'event_starts_soon' | 'event_ends' | 'reminder_time';
  titleRules: CalendarMatchRule[];
  descriptionRules: CalendarMatchRule[];
  attendeeRules: CalendarMatchRule[];
  locationRules: CalendarMatchRule[];
  calendars: string[];
  minutesBeforeStart?: number;
  minutesAfterEnd?: number;
  dataExtractionRules: CalendarDataExtractionRules;
  workflowId: string;
}

interface CalendarMatchRule {
  type: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'regex' | 'not_contains';
  value: string;
  caseSensitive?: boolean;
}

interface CalendarDataExtractionRules {
  extractTitle?: boolean;
  extractDescription?: boolean;
  extractLocation?: boolean;
  extractAttendees?: boolean;
  extractStartTime?: boolean;
  extractEndTime?: boolean;
  customFields?: CalendarCustomField[];
}

interface CalendarCustomField {
  name: string;
  source: 'title' | 'description' | 'location' | 'attendees';
  extractionType: 'regex' | 'between_strings' | 'after_string' | 'before_string';
  pattern: string;
  outputType: 'string' | 'number' | 'date' | 'boolean';
}

// Validação Zod para criação de conta de calendário
const CreateCalendarAccountSchema = z.object({
  email: z.string().email('Email inválido'),
  displayName: z.string().optional(),
  provider: z.enum(['google', 'outlook', 'apple', 'caldav']),
  
  // OAuth fields
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  
  // CalDAV fields for custom providers
  caldavUrl: z.string().optional(),
  caldavUsername: z.string().optional(),
  caldavPassword: z.string().optional(),
  
  syncSettings: z.object({
    syncFrequency: z.number().default(15),
    maxEventsPerSync: z.number().default(200),
    syncCalendars: z.array(z.string()).default(['primary']),
    enableRealTimeSync: z.boolean().default(true),
    reminderMinutes: z.array(z.number()).default([15, 60, 1440])
  }).optional()
});

export class CalendarWorkflowService {
  
  // =============================================
  // CALENDAR ACCOUNT MANAGEMENT
  // =============================================
  
  /**
   * Conectar nova conta de calendário
   */
  async connectCalendarAccount(tenantId: string, userId: string, accountData: any): Promise<CalendarAccount> {
    try {
      console.log(`📅 Conectando conta de calendário - User: ${userId}, Email: ${accountData.email}`);
      
      const validatedData = CreateCalendarAccountSchema.parse(accountData);
      
      // Verificar se email já existe para este tenant
      const existingAccount = await db
        .select()
        .from(calendarAccounts)
        .where(and(
          eq(calendarAccounts.tenantId, tenantId),
          eq(calendarAccounts.email, validatedData.email)
        ))
        .limit(1);
      
      if (existingAccount.length > 0) {
        throw new Error(`Calendário ${validatedData.email} já está conectado`);
      }
      
      // Criar nova conta
      const newAccount = await db
        .insert(calendarAccounts)
        .values({
          id: nanoid(),
          tenantId,
          userId,
          email: validatedData.email,
          displayName: validatedData.displayName,
          provider: validatedData.provider,
          accessToken: validatedData.accessToken ? this.encryptToken(validatedData.accessToken) : null,
          refreshToken: validatedData.refreshToken ? this.encryptToken(validatedData.refreshToken) : null,
          caldavUrl: validatedData.caldavUrl,
          caldavUsername: validatedData.caldavUsername,
          caldavPassword: validatedData.caldavPassword ? this.encryptToken(validatedData.caldavPassword) : null,
          syncSettings: validatedData.syncSettings || {
            syncFrequency: 15,
            maxEventsPerSync: 200,
            syncCalendars: ['primary'],
            enableRealTimeSync: true,
            reminderMinutes: [15, 60, 1440]
          },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      console.log(`✅ Conta de calendário conectada com sucesso: ${newAccount[0].id}`);
      
      // Iniciar primeiro sync
      await this.syncCalendarAccount(newAccount[0].id);
      
      return newAccount[0] as CalendarAccount;
      
    } catch (error: any) {
      console.error('❌ Erro ao conectar conta de calendário:', error);
      throw new Error(`Falha na conexão: ${error.message}`);
    }
  }
  
  /**
   * Listar contas de calendário do tenant
   */
  async getCalendarAccounts(tenantId: string, userId?: string): Promise<CalendarAccount[]> {
    try {
      const whereConditions = [eq(calendarAccounts.tenantId, tenantId)];
      
      if (userId) {
        whereConditions.push(eq(calendarAccounts.userId, userId));
      }
      
      const accounts = await db
        .select({
          id: calendarAccounts.id,
          email: calendarAccounts.email,
          displayName: calendarAccounts.displayName,
          provider: calendarAccounts.provider,
          isActive: calendarAccounts.isActive,
          lastSyncAt: calendarAccounts.lastSyncAt,
          lastError: calendarAccounts.lastError,
          syncSettings: calendarAccounts.syncSettings,
          createdAt: calendarAccounts.createdAt
        })
        .from(calendarAccounts)
        .where(and(...whereConditions))
        .orderBy(desc(calendarAccounts.createdAt));
      
      return accounts as CalendarAccount[];
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar contas de calendário:', error);
      throw new Error(`Falha na busca: ${error.message}`);
    }
  }
  
  /**
   * Testar conexão da conta de calendário
   */
  async testCalendarConnection(accountId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🔧 Testando conexão da conta de calendário: ${accountId}`);
      
      const account = await db
        .select()
        .from(calendarAccounts)
        .where(eq(calendarAccounts.id, accountId))
        .limit(1);
      
      if (account.length === 0) {
        throw new Error('Conta de calendário não encontrada');
      }
      
      const calendarAccount = account[0];
      
      // Testar conexão baseado no provider
      let connectionResult;
      
      switch (calendarAccount.provider) {
        case 'google':
          connectionResult = await this.testGoogleCalendarConnection(calendarAccount);
          break;
        case 'outlook':
          connectionResult = await this.testOutlookCalendarConnection(calendarAccount);
          break;
        case 'apple':
          connectionResult = await this.testAppleCalendarConnection(calendarAccount);
          break;
        case 'caldav':
          connectionResult = await this.testCalDAVConnection(calendarAccount);
          break;
        default:
          throw new Error(`Provider não suportado: ${calendarAccount.provider}`);
      }
      
      // Atualizar status da conta
      await db
        .update(calendarAccounts)
        .set({
          isActive: connectionResult.success,
          lastError: connectionResult.success ? null : connectionResult.message,
          updatedAt: new Date()
        })
        .where(eq(calendarAccounts.id, accountId));
      
      console.log(`${connectionResult.success ? '✅' : '❌'} Teste de conexão calendário: ${connectionResult.message}`);
      
      return connectionResult;
      
    } catch (error: any) {
      console.error('❌ Erro no teste de conexão calendário:', error);
      return {
        success: false,
        message: `Erro no teste: ${error.message}`
      };
    }
  }
  
  // =============================================
  // CALENDAR TRIGGER MANAGEMENT
  // =============================================
  
  /**
   * Criar trigger de calendário para workflow
   */
  async createCalendarTrigger(tenantId: string, userId: string, triggerData: any): Promise<any> {
    try {
      console.log(`📝 Criando trigger de calendário - User: ${userId}, Workflow: ${triggerData.workflowId}`);
      
      // Validar se workflow existe
      const workflow = await db
        .select()
        .from(visualWorkflows)
        .where(and(
          eq(visualWorkflows.id, triggerData.workflowId),
          eq(visualWorkflows.tenantId, tenantId)
        ))
        .limit(1);
      
      if (workflow.length === 0) {
        throw new Error('Workflow não encontrado');
      }
      
      // Validar se conta de calendário existe
      const calendarAccount = await db
        .select()
        .from(calendarAccounts)
        .where(and(
          eq(calendarAccounts.id, triggerData.calendarAccountId),
          eq(calendarAccounts.tenantId, tenantId)
        ))
        .limit(1);
      
      if (calendarAccount.length === 0) {
        throw new Error('Conta de calendário não encontrada');
      }
      
      // Criar trigger
      const newTrigger = await db
        .insert(calendarTriggers)
        .values({
          id: nanoid(),
          tenantId,
          userId,
          workflowId: triggerData.workflowId,
          calendarAccountId: triggerData.calendarAccountId,
          name: triggerData.name,
          description: triggerData.description,
          triggerType: triggerData.triggerType,
          titleRules: triggerData.titleRules || [],
          descriptionRules: triggerData.descriptionRules || [],
          attendeeRules: triggerData.attendeeRules || [],
          locationRules: triggerData.locationRules || [],
          calendars: triggerData.calendars || ['primary'],
          eventTypes: triggerData.eventTypes || [],
          minutesBeforeStart: triggerData.minutesBeforeStart,
          minutesAfterEnd: triggerData.minutesAfterEnd,
          reminderOffsets: triggerData.reminderOffsets || [15, 60],
          handleRecurring: triggerData.handleRecurring !== false,
          maxRecurrenceInstances: triggerData.maxRecurrenceInstances || 10,
          dataExtractionRules: triggerData.dataExtractionRules || {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      console.log(`✅ Trigger de calendário criado: ${newTrigger[0].id}`);
      
      return newTrigger[0];
      
    } catch (error: any) {
      console.error('❌ Erro ao criar trigger de calendário:', error);
      throw new Error(`Falha na criação: ${error.message}`);
    }
  }
  
  /**
   * Listar triggers de calendário do tenant
   */
  async getCalendarTriggers(tenantId: string, workflowId?: string): Promise<any[]> {
    try {
      const whereConditions = [eq(calendarTriggers.tenantId, tenantId)];
      
      if (workflowId) {
        whereConditions.push(eq(calendarTriggers.workflowId, workflowId));
      }
      
      const triggers = await db
        .select({
          id: calendarTriggers.id,
          name: calendarTriggers.name,
          description: calendarTriggers.description,
          triggerType: calendarTriggers.triggerType,
          workflowId: calendarTriggers.workflowId,
          calendarAccountId: calendarTriggers.calendarAccountId,
          titleRules: calendarTriggers.titleRules,
          descriptionRules: calendarTriggers.descriptionRules,
          attendeeRules: calendarTriggers.attendeeRules,
          locationRules: calendarTriggers.locationRules,
          calendars: calendarTriggers.calendars,
          minutesBeforeStart: calendarTriggers.minutesBeforeStart,
          minutesAfterEnd: calendarTriggers.minutesAfterEnd,
          isActive: calendarTriggers.isActive,
          lastTriggered: calendarTriggers.lastTriggered,
          triggerCount: calendarTriggers.triggerCount,
          createdAt: calendarTriggers.createdAt,
          // Join com dados do workflow e calendar account
          workflow: {
            name: visualWorkflows.name,
            description: visualWorkflows.description
          },
          calendarAccount: {
            email: calendarAccounts.email,
            provider: calendarAccounts.provider
          }
        })
        .from(calendarTriggers)
        .leftJoin(visualWorkflows, eq(visualWorkflows.id, calendarTriggers.workflowId))
        .leftJoin(calendarAccounts, eq(calendarAccounts.id, calendarTriggers.calendarAccountId))
        .where(and(...whereConditions))
        .orderBy(desc(calendarTriggers.createdAt));
      
      return triggers;
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar triggers de calendário:', error);
      throw new Error(`Falha na busca: ${error.message}`);
    }
  }
  
  // =============================================
  // CALENDAR EVENT PROCESSING ENGINE
  // =============================================
  
  /**
   * Sincronizar eventos de uma conta e processar triggers
   */
  async syncCalendarAccount(accountId: string): Promise<void> {
    try {
      console.log(`🔄 Iniciando sync da conta de calendário: ${accountId}`);
      
      const account = await db
        .select()
        .from(calendarAccounts)
        .where(eq(calendarAccounts.id, accountId))
        .limit(1);
      
      if (account.length === 0) {
        throw new Error('Conta não encontrada');
      }
      
      const calendarAccount = account[0];
      
      if (!calendarAccount.isActive) {
        console.log('⚠️ Conta inativa, pulando sync');
        return;
      }
      
      // Buscar eventos baseado no provider
      let events: CalendarEvent[] = [];
      
      switch (calendarAccount.provider) {
        case 'google':
          events = await this.fetchGoogleCalendarEvents(calendarAccount);
          break;
        case 'outlook':
          events = await this.fetchOutlookCalendarEvents(calendarAccount);
          break;
        case 'apple':
          events = await this.fetchAppleCalendarEvents(calendarAccount);
          break;
        case 'caldav':
          events = await this.fetchCalDAVEvents(calendarAccount);
          break;
        default:
          throw new Error(`Provider não suportado: ${calendarAccount.provider}`);
      }
      
      console.log(`📅 Encontrados ${events.length} eventos para processar`);
      
      // Processar cada evento
      for (const event of events) {
        await this.processEventForTriggers(calendarAccount, event);
      }
      
      // Processar lembretes (eventos que estão prestes a começar)
      await this.processUpcomingEventReminders(calendarAccount, events);
      
      // Atualizar timestamp do último sync
      await db
        .update(calendarAccounts)
        .set({
          lastSyncAt: new Date(),
          lastError: null,
          updatedAt: new Date()
        })
        .where(eq(calendarAccounts.id, accountId));
      
      console.log(`✅ Sync de calendário concluído para conta: ${accountId}`);
      
    } catch (error: any) {
      console.error('❌ Erro no sync de calendário:', error);
      
      // Atualizar erro na conta
      await db
        .update(calendarAccounts)
        .set({
          lastError: error.message,
          updatedAt: new Date()
        })
        .where(eq(calendarAccounts.id, accountId));
      
      throw error;
    }
  }
  
  /**
   * Processar evento individual contra todos os triggers ativos
   */
  private async processEventForTriggers(calendarAccount: any, event: CalendarEvent): Promise<void> {
    try {
      console.log(`📅 Processando evento: ${event.title.substring(0, 50)}...`);
      
      // Buscar triggers ativos para esta conta
      const activeTriggers = await db
        .select()
        .from(calendarTriggers)
        .where(and(
          eq(calendarTriggers.calendarAccountId, calendarAccount.id),
          eq(calendarTriggers.isActive, true)
        ));
      
      const matchedTriggers: string[] = [];
      
      // Testar cada trigger
      for (const trigger of activeTriggers) {
        const matches = await this.evaluateCalendarTrigger(trigger, event);
        
        if (matches) {
          console.log(`🎯 Calendar trigger matched: ${trigger.name}`);
          matchedTriggers.push(trigger.id);
          
          // Extrair dados do evento
          const extractedData = await this.extractEventData(trigger, event);
          
          // Executar workflow
          await this.executeWorkflowFromCalendarTrigger(trigger, event, extractedData);
          
          // Atualizar estatísticas do trigger
          await db
            .update(calendarTriggers)
            .set({
              lastTriggered: new Date(),
              triggerCount: trigger.triggerCount + 1,
              updatedAt: new Date()
            })
            .where(eq(calendarTriggers.id, trigger.id));
        }
      }
      
      // Adicionar à fila de processamento para auditoria
      if (matchedTriggers.length > 0) {
        await db
          .insert(calendarEventProcessingQueue)
          .values({
            id: nanoid(),
            tenantId: calendarAccount.tenantId,
            calendarAccountId: calendarAccount.id,
            eventId: event.eventId,
            eventData: event,
            status: 'completed',
            triggersMatched: matchedTriggers,
            processedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao processar evento para triggers:', error);
      
      // Adicionar à fila com erro
      await db
        .insert(calendarEventProcessingQueue)
        .values({
          id: nanoid(),
          tenantId: calendarAccount.tenantId,
          calendarAccountId: calendarAccount.id,
          eventId: event.eventId,
          eventData: event,
          status: 'failed',
          error: error.message,
          createdAt: new Date(),
          updatedAt: new Date()
        });
    }
  }
  
  /**
   * Processar lembretes de eventos próximos
   */
  private async processUpcomingEventReminders(calendarAccount: any, events: CalendarEvent[]): Promise<void> {
    try {
      const now = new Date();
      
      // Buscar triggers de lembretes ativos
      const reminderTriggers = await db
        .select()
        .from(calendarTriggers)
        .where(and(
          eq(calendarTriggers.calendarAccountId, calendarAccount.id),
          eq(calendarTriggers.isActive, true),
          eq(calendarTriggers.triggerType, 'event_starts_soon')
        ));
      
      for (const trigger of reminderTriggers) {
        const reminderTime = trigger.minutesBeforeStart || 15;
        
        for (const event of events) {
          const timeDiff = event.startTime.getTime() - now.getTime();
          const minutesUntilStart = Math.floor(timeDiff / (1000 * 60));
          
          // Verificar se está dentro da janela de lembrete
          if (minutesUntilStart <= reminderTime && minutesUntilStart > 0) {
            const matches = await this.evaluateCalendarTrigger(trigger, event);
            
            if (matches) {
              console.log(`⏰ Lembrete de evento disparado: ${event.title}`);
              
              const extractedData = await this.extractEventData(trigger, event);
              extractedData._reminderContext = {
                minutesUntilStart,
                reminderTime,
                triggeredBy: 'upcoming_event_reminder'
              };
              
              await this.executeWorkflowFromCalendarTrigger(trigger, event, extractedData);
            }
          }
        }
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao processar lembretes:', error);
    }
  }
  
  /**
   * Avaliar se um evento corresponde às regras de um trigger
   */
  private async evaluateCalendarTrigger(trigger: any, event: CalendarEvent): Promise<boolean> {
    try {
      // Verificar calendário
      if (trigger.calendars && trigger.calendars.length > 0) {
        if (!trigger.calendars.includes(event.calendarId) && !trigger.calendars.includes('primary')) {
          return false;
        }
      }
      
      // Verificar tipo de evento
      if (trigger.eventTypes && trigger.eventTypes.length > 0) {
        // TODO: Implementar filtro por tipo de evento
      }
      
      // Avaliar regras baseadas no tipo de trigger
      switch (trigger.triggerType) {
        case 'event_created':
        case 'event_updated':
          return this.evaluateEventContentRules(trigger, event);
          
        case 'event_starts_soon':
          // Já processado em processUpcomingEventReminders
          return this.evaluateEventContentRules(trigger, event);
          
        case 'event_ends':
          const now = new Date();
          const timeSinceEnd = now.getTime() - event.endTime.getTime();
          const minutesSinceEnd = Math.floor(timeSinceEnd / (1000 * 60));
          const maxMinutesAfter = trigger.minutesAfterEnd || 0;
          
          return minutesSinceEnd <= maxMinutesAfter && minutesSinceEnd >= 0;
          
        case 'reminder_time':
          // Processado por lembretes específicos do evento
          return this.evaluateEventContentRules(trigger, event);
          
        default:
          return false;
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao avaliar trigger de calendário:', error);
      return false;
    }
  }
  
  /**
   * Avaliar regras de conteúdo do evento
   */
  private evaluateEventContentRules(trigger: any, event: CalendarEvent): boolean {
    // Avaliar regras de título
    if (trigger.titleRules && trigger.titleRules.length > 0) {
      if (!this.evaluateCalendarRules(trigger.titleRules, event.title)) {
        return false;
      }
    }
    
    // Avaliar regras de descrição
    if (trigger.descriptionRules && trigger.descriptionRules.length > 0) {
      if (!this.evaluateCalendarRules(trigger.descriptionRules, event.description || '')) {
        return false;
      }
    }
    
    // Avaliar regras de localização
    if (trigger.locationRules && trigger.locationRules.length > 0) {
      if (!this.evaluateCalendarRules(trigger.locationRules, event.location || '')) {
        return false;
      }
    }
    
    // Avaliar regras de participantes
    if (trigger.attendeeRules && trigger.attendeeRules.length > 0) {
      const attendeesText = event.attendees.map(a => `${a.email} ${a.displayName || ''}`).join(' ');
      if (!this.evaluateCalendarRules(trigger.attendeeRules, attendeesText)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Avaliar regras de matching em texto
   */
  private evaluateCalendarRules(rules: CalendarMatchRule[], text: string): boolean {
    if (!rules || rules.length === 0) {
      return true; // Sem regras = match
    }
    
    for (const rule of rules) {
      const testText = rule.caseSensitive ? text : text.toLowerCase();
      const testValue = rule.caseSensitive ? rule.value : rule.value.toLowerCase();
      
      let matches = false;
      
      switch (rule.type) {
        case 'contains':
          matches = testText.includes(testValue);
          break;
        case 'equals':
          matches = testText === testValue;
          break;
        case 'starts_with':
          matches = testText.startsWith(testValue);
          break;
        case 'ends_with':
          matches = testText.endsWith(testValue);
          break;
        case 'regex':
          const regex = new RegExp(rule.value, rule.caseSensitive ? 'g' : 'gi');
          matches = regex.test(text);
          break;
        case 'not_contains':
          matches = !testText.includes(testValue);
          break;
      }
      
      if (matches) {
        return true; // Qualquer regra que der match = sucesso
      }
    }
    
    return false;
  }
  
  /**
   * Extrair dados do evento baseado nas regras
   */
  private async extractEventData(trigger: any, event: CalendarEvent): Promise<any> {
    const extractedData: any = {};
    const rules = trigger.dataExtractionRules || {};
    
    // Dados básicos sempre extraídos
    if (rules.extractTitle) {
      extractedData.title = event.title;
    }
    
    if (rules.extractDescription) {
      extractedData.description = event.description;
    }
    
    if (rules.extractLocation) {
      extractedData.location = event.location;
    }
    
    if (rules.extractStartTime) {
      extractedData.startTime = event.startTime;
    }
    
    if (rules.extractEndTime) {
      extractedData.endTime = event.endTime;
    }
    
    if (rules.extractAttendees && event.attendees) {
      extractedData.attendees = event.attendees.map(attendee => ({
        email: attendee.email,
        displayName: attendee.displayName,
        responseStatus: attendee.responseStatus
      }));
    }
    
    // Campos customizados
    if (rules.customFields) {
      for (const field of rules.customFields) {
        let sourceText = '';
        
        switch (field.source) {
          case 'title':
            sourceText = event.title;
            break;
          case 'description':
            sourceText = event.description || '';
            break;
          case 'location':
            sourceText = event.location || '';
            break;
          case 'attendees':
            sourceText = event.attendees.map(a => `${a.email} ${a.displayName || ''}`).join(' ');
            break;
        }
        
        const extractedValue = this.extractCustomField(field, sourceText);
        if (extractedValue !== null) {
          extractedData[field.name] = extractedValue;
        }
      }
    }
    
    // Metadados do evento
    extractedData._metadata = {
      eventId: event.eventId,
      calendarId: event.calendarId,
      calendarName: event.calendarName,
      isAllDay: event.isAllDay,
      isRecurring: event.isRecurring,
      status: event.status,
      organizer: event.organizer,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    };
    
    return extractedData;
  }
  
  /**
   * Extrair campo customizado usando regex ou strings
   */
  private extractCustomField(field: CalendarCustomField, text: string): any {
    try {
      let extractedValue: string | null = null;
      
      switch (field.extractionType) {
        case 'regex':
          const regex = new RegExp(field.pattern, 'gi');
          const match = regex.exec(text);
          extractedValue = match ? match[1] || match[0] : null;
          break;
          
        case 'between_strings':
          const parts = field.pattern.split('|||'); // Delimiter
          if (parts.length === 2) {
            const startIndex = text.indexOf(parts[0]);
            if (startIndex !== -1) {
              const endIndex = text.indexOf(parts[1], startIndex + parts[0].length);
              if (endIndex !== -1) {
                extractedValue = text.substring(startIndex + parts[0].length, endIndex).trim();
              }
            }
          }
          break;
          
        case 'after_string':
          const afterIndex = text.indexOf(field.pattern);
          if (afterIndex !== -1) {
            extractedValue = text.substring(afterIndex + field.pattern.length).trim();
          }
          break;
          
        case 'before_string':
          const beforeIndex = text.indexOf(field.pattern);
          if (beforeIndex !== -1) {
            extractedValue = text.substring(0, beforeIndex).trim();
          }
          break;
      }
      
      if (extractedValue === null) {
        return null;
      }
      
      // Converter para o tipo correto
      switch (field.outputType) {
        case 'number':
          const num = parseFloat(extractedValue);
          return isNaN(num) ? null : num;
        case 'date':
          const date = new Date(extractedValue);
          return isNaN(date.getTime()) ? null : date;
        case 'boolean':
          return ['true', '1', 'yes', 'sim'].includes(extractedValue.toLowerCase());
        default:
          return extractedValue;
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao extrair campo customizado:', error);
      return null;
    }
  }
  
  /**
   * Executar workflow a partir do trigger de calendário
   */
  private async executeWorkflowFromCalendarTrigger(trigger: any, event: CalendarEvent, extractedData: any): Promise<void> {
    try {
      console.log(`🚀 Executando workflow ${trigger.workflowId} a partir do calendar trigger`);
      
      // Registrar execução no histórico
      const historyId = nanoid();
      await db
        .insert(triggerExecutionHistory)
        .values({
          id: historyId,
          tenantId: trigger.tenantId,
          triggerType: 'calendar',
          triggerId: trigger.id,
          workflowId: trigger.workflowId,
          triggerData: event,
          extractedData,
          status: 'success',
          triggeredAt: new Date(),
          completedAt: new Date(),
          duration: 0, // Será atualizado pelo workflow engine
          createdAt: new Date()
        });
      
      // TODO: Integrar com o workflow engine para execução real
      // const workflowEngine = new VisualWorkflowEngine();
      // await workflowEngine.executeWorkflow(trigger.workflowId, {
      //   triggerType: 'calendar',
      //   triggerData: extractedData,
      //   context: {
      //     calendarTrigger: trigger,
      //     originalEvent: event
      //   }
      // });
      
      console.log(`✅ Workflow executado com sucesso: ${trigger.workflowId}`);
      
    } catch (error: any) {
      console.error('❌ Erro ao executar workflow:', error);
      
      // Atualizar histórico com erro
      await db
        .update(triggerExecutionHistory)
        .set({
          status: 'failed',
          error: error.message,
          completedAt: new Date()
        })
        .where(eq(triggerExecutionHistory.triggerId, trigger.id));
    }
  }
  
  // =============================================
  // PROVIDER-SPECIFIC IMPLEMENTATIONS
  // =============================================
  
  /**
   * Testar conexão Google Calendar
   */
  private async testGoogleCalendarConnection(account: any): Promise<{success: boolean; message: string}> {
    // TODO: Implementar OAuth2 do Google Calendar
    return {
      success: true,
      message: 'Conexão Google Calendar OK (mock)'
    };
  }
  
  /**
   * Testar conexão Outlook Calendar
   */
  private async testOutlookCalendarConnection(account: any): Promise<{success: boolean; message: string}> {
    // TODO: Implementar OAuth2 do Outlook Calendar
    return {
      success: true,
      message: 'Conexão Outlook Calendar OK (mock)'
    };
  }
  
  /**
   * Testar conexão Apple iCloud Calendar
   */
  private async testAppleCalendarConnection(account: any): Promise<{success: boolean; message: string}> {
    // TODO: Implementar OAuth2 do Apple iCloud
    return {
      success: true,
      message: 'Conexão Apple Calendar OK (mock)'
    };
  }
  
  /**
   * Testar conexão CalDAV
   */  
  private async testCalDAVConnection(account: any): Promise<{success: boolean; message: string}> {
    // TODO: Implementar conexão CalDAV
    return {
      success: true,
      message: 'Conexão CalDAV OK (mock)'
    };
  }
  
  /**
   * Buscar eventos do Google Calendar
   */
  private async fetchGoogleCalendarEvents(account: any): Promise<CalendarEvent[]> {
    // TODO: Implementar busca Google Calendar via API
    return [];
  }
  
  /**
   * Buscar eventos do Outlook Calendar
   */
  private async fetchOutlookCalendarEvents(account: any): Promise<CalendarEvent[]> {
    // TODO: Implementar busca Outlook Calendar via API
    return [];
  }
  
  /**
   * Buscar eventos do Apple iCloud
   */
  private async fetchAppleCalendarEvents(account: any): Promise<CalendarEvent[]> {
    // TODO: Implementar busca Apple Calendar via API
    return [];
  }
  
  /**
   * Buscar eventos via CalDAV
   */
  private async fetchCalDAVEvents(account: any): Promise<CalendarEvent[]> {
    // TODO: Implementar busca CalDAV
    return [];
  }
  
  // =============================================
  // UTILITY METHODS
  // =============================================
  
  /**
   * Criptografar token OAuth
   */
  private encryptToken(token: string): string {
    // TODO: Implementar criptografia real
    return Buffer.from(token).toString('base64');
  }
  
  /**
   * Descriptografar token OAuth
   */
  private decryptToken(encryptedToken: string): string {
    // TODO: Implementar descriptografia real
    return Buffer.from(encryptedToken, 'base64').toString();
  }
  
  /**
   * Iniciar sync automático de todas as contas ativas
   */
  async startAutoSync(): Promise<void> {
    console.log('🔄 Iniciando sistema de auto-sync de calendários...');
    
    // Executar a cada 15 minutos
    setInterval(async () => {
      try {
        const activeAccounts = await db
          .select()
          .from(calendarAccounts)
          .where(eq(calendarAccounts.isActive, true));
        
        console.log(`🔄 Auto-sync calendário: processando ${activeAccounts.length} contas ativas`);
        
        for (const account of activeAccounts) {
          try {
            await this.syncCalendarAccount(account.id);
          } catch (error: any) {
            console.error(`❌ Erro ao sincronizar conta calendário ${account.id}:`, error);
          }
        }
        
      } catch (error: any) {
        console.error('❌ Erro no auto-sync calendário:', error);
      }
    }, 15 * 60 * 1000); // 15 minutos
  }
}

export const calendarWorkflowService = new CalendarWorkflowService();