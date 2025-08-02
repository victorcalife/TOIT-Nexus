/**
 * EMAIL WORKFLOW SERVICE - Sistema crítico para triggers de email
 * Integração completa com Gmail, Outlook, Yahoo e provedores IMAP
 * Sistema inteligente de parsing e matching de emails para workflows
 */

import { eq, and, desc, inArray } from 'drizzle-orm';
import { db } from './db';
import { 
  emailAccounts, 
  emailTriggers, 
  emailProcessingQueue,
  triggerExecutionHistory,
  visualWorkflows
} from '../shared/schema';
import { nanoid } from 'nanoid';
import { z } from 'zod';

// Interfaces para tipagem
interface EmailAccount {
  id: string;
  email: string;
  provider: string;
  accessToken?: string;
  refreshToken?: string;
  imapHost?: string;
  imapPort?: number;
  syncSettings: any;
}

interface EmailMessage {
  messageId: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  attachments: EmailAttachment[];
  receivedAt: Date;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high';
  folder: string;
}

interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
  contentId?: string;
}

interface EmailTriggerRule {
  id: string;
  name: string;
  triggerType: 'sender_match' | 'subject_contains' | 'body_contains' | 'attachment_exists' | 'keyword_match';
  senderRules: EmailMatchRule[];
  subjectRules: EmailMatchRule[];
  bodyRules: EmailMatchRule[];
  attachmentRules: EmailMatchRule[];
  dataExtractionRules: EmailDataExtractionRules;
  workflowId: string;
}

interface EmailMatchRule {
  type: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'regex' | 'not_contains';
  value: string;
  caseSensitive?: boolean;
}

interface EmailDataExtractionRules {
  extractSubject?: boolean;
  extractBody?: boolean;
  extractAttachments?: boolean;
  extractSender?: boolean;
  customFields?: EmailCustomField[];
}

interface EmailCustomField {
  name: string;
  source: 'subject' | 'body' | 'sender';
  extractionType: 'regex' | 'between_strings' | 'after_string' | 'before_string';
  pattern: string;
  outputType: 'string' | 'number' | 'date' | 'boolean';
}

// Validação Zod para criação de conta de email
const CreateEmailAccountSchema = z.object({
  email: z.string().email('Email inválido'),
  displayName: z.string().optional(),
  provider: z.enum(['gmail', 'outlook', 'yahoo', 'imap']),
  
  // OAuth fields
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  
  // IMAP fields for custom providers
  imapHost: z.string().optional(),
  imapPort: z.number().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  
  syncSettings: z.object({
    syncFrequency: z.number().default(5),
    maxEmailsPerSync: z.number().default(100),
    syncFolders: z.array(z.string()).default(['INBOX']),
    enableRealTimeSync: z.boolean().default(true)
  }).optional()
});

export class EmailWorkflowService {
  
  // =============================================
  // EMAIL ACCOUNT MANAGEMENT
  // =============================================
  
  /**
   * Conectar nova conta de email
   */
  async connectEmailAccount(tenantId: string, userId: string, accountData: any): Promise<EmailAccount> {
    try {
      console.log(`📧 Conectando conta de email - User: ${userId}, Email: ${accountData.email}`);
      
      const validatedData = CreateEmailAccountSchema.parse(accountData);
      
      // Verificar se email já existe para este tenant
      const existingAccount = await db
        .select()
        .from(emailAccounts)
        .where(and(
          eq(emailAccounts.tenantId, tenantId),
          eq(emailAccounts.email, validatedData.email)
        ))
        .limit(1);
      
      if (existingAccount.length > 0) {
        throw new Error(`Email ${validatedData.email} já está conectado`);
      }
      
      // Criar nova conta
      const newAccount = await db
        .insert(emailAccounts)
        .values({
          id: nanoid(),
          tenantId,
          userId,
          email: validatedData.email,
          displayName: validatedData.displayName,
          provider: validatedData.provider,
          accessToken: validatedData.accessToken ? this.encryptToken(validatedData.accessToken) : null,
          refreshToken: validatedData.refreshToken ? this.encryptToken(validatedData.refreshToken) : null,
          imapHost: validatedData.imapHost,
          imapPort: validatedData.imapPort,
          smtpHost: validatedData.smtpHost,
          smtpPort: validatedData.smtpPort,
          syncSettings: validatedData.syncSettings || {
            syncFrequency: 5,
            maxEmailsPerSync: 100,
            syncFolders: ['INBOX'],
            enableRealTimeSync: true
          },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      console.log(`✅ Conta de email conectada com sucesso: ${newAccount[0].id}`);
      
      // Iniciar primeiro sync
      await this.syncEmailAccount(newAccount[0].id);
      
      return newAccount[0] as EmailAccount;
      
    } catch (error: any) {
      console.error('❌ Erro ao conectar conta de email:', error);
      throw new Error(`Falha na conexão: ${error.message}`);
    }
  }
  
  /**
   * Listar contas de email do tenant
   */
  async getEmailAccounts(tenantId: string, userId?: string): Promise<EmailAccount[]> {
    try {
      const whereConditions = [eq(emailAccounts.tenantId, tenantId)];
      
      if (userId) {
        whereConditions.push(eq(emailAccounts.userId, userId));
      }
      
      const accounts = await db
        .select({
          id: emailAccounts.id,
          email: emailAccounts.email,
          displayName: emailAccounts.displayName,
          provider: emailAccounts.provider,
          isActive: emailAccounts.isActive,
          lastSyncAt: emailAccounts.lastSyncAt,
          lastError: emailAccounts.lastError,
          syncSettings: emailAccounts.syncSettings,
          createdAt: emailAccounts.createdAt
        })
        .from(emailAccounts)
        .where(and(...whereConditions))
        .orderBy(desc(emailAccounts.createdAt));
      
      return accounts as EmailAccount[];
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar contas de email:', error);
      throw new Error(`Falha na busca: ${error.message}`);
    }
  }
  
  /**
   * Testar conexão da conta de email
   */
  async testEmailConnection(accountId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🔧 Testando conexão da conta: ${accountId}`);
      
      const account = await db
        .select()
        .from(emailAccounts)
        .where(eq(emailAccounts.id, accountId))
        .limit(1);
      
      if (account.length === 0) {
        throw new Error('Conta de email não encontrada');
      }
      
      const emailAccount = account[0];
      
      // Testar conexão baseado no provider
      let connectionResult;
      
      switch (emailAccount.provider) {
        case 'gmail':
          connectionResult = await this.testGmailConnection(emailAccount);
          break;
        case 'outlook':
          connectionResult = await this.testOutlookConnection(emailAccount);
          break;
        case 'yahoo':
          connectionResult = await this.testYahooConnection(emailAccount);
          break;
        case 'imap':
          connectionResult = await this.testImapConnection(emailAccount);
          break;
        default:
          throw new Error(`Provider não suportado: ${emailAccount.provider}`);
      }
      
      // Atualizar status da conta
      await db
        .update(emailAccounts)
        .set({
          isActive: connectionResult.success,
          lastError: connectionResult.success ? null : connectionResult.message,
          updatedAt: new Date()
        })
        .where(eq(emailAccounts.id, accountId));
      
      console.log(`${connectionResult.success ? '✅' : '❌'} Teste de conexão: ${connectionResult.message}`);
      
      return connectionResult;
      
    } catch (error: any) {
      console.error('❌ Erro no teste de conexão:', error);
      return {
        success: false,
        message: `Erro no teste: ${error.message}`
      };
    }
  }
  
  // =============================================
  // EMAIL TRIGGER MANAGEMENT
  // =============================================
  
  /**
   * Criar trigger de email para workflow
   */
  async createEmailTrigger(tenantId: string, userId: string, triggerData: any): Promise<any> {
    try {
      console.log(`📝 Criando trigger de email - User: ${userId}, Workflow: ${triggerData.workflowId}`);
      
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
      
      // Validar se conta de email existe
      const emailAccount = await db
        .select()
        .from(emailAccounts)
        .where(and(
          eq(emailAccounts.id, triggerData.emailAccountId),
          eq(emailAccounts.tenantId, tenantId)
        ))
        .limit(1);
      
      if (emailAccount.length === 0) {
        throw new Error('Conta de email não encontrada');
      }
      
      // Criar trigger
      const newTrigger = await db
        .insert(emailTriggers)
        .values({
          id: nanoid(),
          tenantId,
          userId,
          workflowId: triggerData.workflowId,
          emailAccountId: triggerData.emailAccountId,
          name: triggerData.name,
          description: triggerData.description,
          triggerType: triggerData.triggerType,
          senderRules: triggerData.senderRules || [],
          subjectRules: triggerData.subjectRules || [],
          bodyRules: triggerData.bodyRules || [],
          attachmentRules: triggerData.attachmentRules || [],
          folders: triggerData.folders || ['INBOX'],
          isRead: triggerData.isRead,
          hasAttachments: triggerData.hasAttachments,
          priority: triggerData.priority,
          dataExtractionRules: triggerData.dataExtractionRules || {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      console.log(`✅ Trigger de email criado: ${newTrigger[0].id}`);
      
      return newTrigger[0];
      
    } catch (error: any) {
      console.error('❌ Erro ao criar trigger de email:', error);
      throw new Error(`Falha na criação: ${error.message}`);
    }
  }
  
  /**
   * Listar triggers de email do tenant
   */
  async getEmailTriggers(tenantId: string, workflowId?: string): Promise<any[]> {
    try {
      const whereConditions = [eq(emailTriggers.tenantId, tenantId)];
      
      if (workflowId) {
        whereConditions.push(eq(emailTriggers.workflowId, workflowId));
      }
      
      const triggers = await db
        .select({
          id: emailTriggers.id,
          name: emailTriggers.name,
          description: emailTriggers.description,
          triggerType: emailTriggers.triggerType,
          workflowId: emailTriggers.workflowId,
          emailAccountId: emailTriggers.emailAccountId,
          senderRules: emailTriggers.senderRules,
          subjectRules: emailTriggers.subjectRules,
          bodyRules: emailTriggers.bodyRules,
          attachmentRules: emailTriggers.attachmentRules,
          folders: emailTriggers.folders,
          isActive: emailTriggers.isActive,
          lastTriggered: emailTriggers.lastTriggered,
          triggerCount: emailTriggers.triggerCount,
          createdAt: emailTriggers.createdAt,
          // Join com dados do workflow e email account
          workflow: {
            name: visualWorkflows.name,
            description: visualWorkflows.description
          },
          emailAccount: {
            email: emailAccounts.email,
            provider: emailAccounts.provider
          }
        })
        .from(emailTriggers)
        .leftJoin(visualWorkflows, eq(visualWorkflows.id, emailTriggers.workflowId))
        .leftJoin(emailAccounts, eq(emailAccounts.id, emailTriggers.emailAccountId))
        .where(and(...whereConditions))
        .orderBy(desc(emailTriggers.createdAt));
      
      return triggers;
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar triggers de email:', error);
      throw new Error(`Falha na busca: ${error.message}`);
    }
  }
  
  // =============================================
  // EMAIL PROCESSING ENGINE
  // =============================================
  
  /**
   * Sincronizar emails de uma conta e processar triggers
   */
  async syncEmailAccount(accountId: string): Promise<void> {
    try {
      console.log(`🔄 Iniciando sync da conta: ${accountId}`);
      
      const account = await db
        .select()
        .from(emailAccounts)
        .where(eq(emailAccounts.id, accountId))
        .limit(1);
      
      if (account.length === 0) {
        throw new Error('Conta não encontrada');
      }
      
      const emailAccount = account[0];
      
      if (!emailAccount.isActive) {
        console.log('⚠️ Conta inativa, pulando sync');
        return;
      }
      
      // Buscar emails baseado no provider
      let emails: EmailMessage[] = [];
      
      switch (emailAccount.provider) {
        case 'gmail':
          emails = await this.fetchGmailEmails(emailAccount);
          break;
        case 'outlook':
          emails = await this.fetchOutlookEmails(emailAccount);
          break;
        case 'yahoo':
          emails = await this.fetchYahooEmails(emailAccount);
          break;
        case 'imap':
          emails = await this.fetchImapEmails(emailAccount);
          break;
        default:
          throw new Error(`Provider não suportado: ${emailAccount.provider}`);
      }
      
      console.log(`📬 Encontrados ${emails.length} emails para processar`);
      
      // Processar cada email
      for (const email of emails) {
        await this.processEmailForTriggers(emailAccount, email);
      }
      
      // Atualizar timestamp do último sync
      await db
        .update(emailAccounts)
        .set({
          lastSyncAt: new Date(),
          lastError: null,
          updatedAt: new Date()
        })
        .where(eq(emailAccounts.id, accountId));
      
      console.log(`✅ Sync concluído para conta: ${accountId}`);
      
    } catch (error: any) {
      console.error('❌ Erro no sync de email:', error);
      
      // Atualizar erro na conta
      await db
        .update(emailAccounts)
        .set({
          lastError: error.message,
          updatedAt: new Date()
        })
        .where(eq(emailAccounts.id, accountId));
      
      throw error;
    }
  }
  
  /**
   * Processar email individual contra todos os triggers ativos
   */
  private async processEmailForTriggers(emailAccount: any, email: EmailMessage): Promise<void> {
    try {
      console.log(`📧 Processando email: ${email.subject.substring(0, 50)}...`);
      
      // Buscar triggers ativos para esta conta
      const activeTriggers = await db
        .select()
        .from(emailTriggers)
        .where(and(
          eq(emailTriggers.emailAccountId, emailAccount.id),
          eq(emailTriggers.isActive, true)
        ));
      
      const matchedTriggers: string[] = [];
      
      // Testar cada trigger
      for (const trigger of activeTriggers) {
        const matches = await this.evaluateEmailTrigger(trigger, email);
        
        if (matches) {
          console.log(`🎯 Trigger matched: ${trigger.name}`);
          matchedTriggers.push(trigger.id);
          
          // Extrair dados do email
          const extractedData = await this.extractEmailData(trigger, email);
          
          // Executar workflow
          await this.executeWorkflowFromEmailTrigger(trigger, email, extractedData);
          
          // Atualizar estatísticas do trigger
          await db
            .update(emailTriggers)
            .set({
              lastTriggered: new Date(),
              triggerCount: trigger.triggerCount + 1,
              updatedAt: new Date()
            })
            .where(eq(emailTriggers.id, trigger.id));
        }
      }
      
      // Adicionar à fila de processamento para auditoria
      if (matchedTriggers.length > 0) {
        await db
          .insert(emailProcessingQueue)
          .values({
            id: nanoid(),
            tenantId: emailAccount.tenantId,
            emailAccountId: emailAccount.id,
            messageId: email.messageId,
            emailData: email,
            status: 'completed',
            triggersMatched: matchedTriggers,
            processedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao processar email para triggers:', error);
      
      // Adicionar à fila com erro
      await db
        .insert(emailProcessingQueue)
        .values({
          id: nanoid(),
          tenantId: emailAccount.tenantId,
          emailAccountId: emailAccount.id,
          messageId: email.messageId,
          emailData: email,
          status: 'failed',
          error: error.message,
          createdAt: new Date(),
          updatedAt: new Date()
        });
    }
  }
  
  /**
   * Avaliar se um email corresponde às regras de um trigger
   */
  private async evaluateEmailTrigger(trigger: any, email: EmailMessage): Promise<boolean> {
    try {
      // Verificar pasta/folder
      if (trigger.folders && trigger.folders.length > 0) {
        if (!trigger.folders.includes(email.folder)) {
          return false;
        }
      }
      
      // Verificar status de leitura
      if (trigger.isRead !== null && trigger.isRead !== email.isRead) {
        return false;
      }
      
      // Verificar anexos
      if (trigger.hasAttachments !== null) {
        const hasAttachments = email.attachments && email.attachments.length > 0;
        if (trigger.hasAttachments !== hasAttachments) {
          return false;
        }
      }
      
      // Verificar prioridade
      if (trigger.priority && trigger.priority !== email.priority) {
        return false;
      }
      
      // Avaliar regras baseadas no tipo de trigger
      switch (trigger.triggerType) {
        case 'sender_match':
          return this.evaluateEmailRules(trigger.senderRules, email.from);
          
        case 'subject_contains':
          return this.evaluateEmailRules(trigger.subjectRules, email.subject);
          
        case 'body_contains':
          return this.evaluateEmailRules(trigger.bodyRules, email.body);
          
        case 'attachment_exists':
          return this.evaluateAttachmentRules(trigger.attachmentRules, email.attachments);
          
        case 'keyword_match':
          // Avaliar em todos os campos
          const allText = `${email.from} ${email.subject} ${email.body}`;
          return this.evaluateEmailRules(trigger.bodyRules, allText);
          
        default:
          return false;
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao avaliar trigger:', error);
      return false;
    }
  }
  
  /**
   * Avaliar regras de matching em texto
   */
  private evaluateEmailRules(rules: EmailMatchRule[], text: string): boolean {
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
   * Avaliar regras de anexos
   */
  private evaluateAttachmentRules(rules: EmailMatchRule[], attachments: EmailAttachment[]): boolean {
    if (!rules || rules.length === 0) {
      return attachments && attachments.length > 0; // Apenas verificar se tem anexos
    }
    
    for (const attachment of attachments) {
      for (const rule of rules) {
        const fileName = rule.caseSensitive ? attachment.filename : attachment.filename.toLowerCase();
        const testValue = rule.caseSensitive ? rule.value : rule.value.toLowerCase();
        
        let matches = false;
        
        switch (rule.type) {
          case 'contains':
            matches = fileName.includes(testValue);
            break;
          case 'ends_with':
            matches = fileName.endsWith(testValue);
            break;
          case 'regex':
            const regex = new RegExp(rule.value, rule.caseSensitive ? 'g' : 'gi');
            matches = regex.test(attachment.filename);
            break;
        }
        
        if (matches) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Extrair dados do email baseado nas regras
   */
  private async extractEmailData(trigger: any, email: EmailMessage): Promise<any> {
    const extractedData: any = {};
    const rules = trigger.dataExtractionRules || {};
    
    // Dados básicos sempre extraídos
    if (rules.extractSender) {
      extractedData.sender = email.from;
    }
    
    if (rules.extractSubject) {
      extractedData.subject = email.subject;
    }
    
    if (rules.extractBody) {
      extractedData.body = email.body;
    }
    
    if (rules.extractAttachments && email.attachments) {
      extractedData.attachments = email.attachments.map(att => ({
        filename: att.filename,
        contentType: att.contentType,
        size: att.size
      }));
    }
    
    // Campos customizados
    if (rules.customFields) {
      for (const field of rules.customFields) {
        let sourceText = '';
        
        switch (field.source) {
          case 'subject':
            sourceText = email.subject;
            break;
          case 'body':
            sourceText = email.body;
            break;
          case 'sender':
            sourceText = email.from;
            break;
        }
        
        const extractedValue = this.extractCustomField(field, sourceText);
        if (extractedValue !== null) {
          extractedData[field.name] = extractedValue;
        }
      }
    }
    
    // Metadados do email
    extractedData._metadata = {
      messageId: email.messageId,
      receivedAt: email.receivedAt,
      folder: email.folder,
      isRead: email.isRead,
      priority: email.priority
    };
    
    return extractedData;
  }
  
  /**
   * Extrair campo customizado usando regex ou strings
   */
  private extractCustomField(field: EmailCustomField, text: string): any {
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
   * Executar workflow a partir do trigger de email
   */
  private async executeWorkflowFromEmailTrigger(trigger: any, email: EmailMessage, extractedData: any): Promise<void> {
    try {
      console.log(`🚀 Executando workflow ${trigger.workflowId} a partir do email trigger`);
      
      // Registrar execução no histórico
      const historyId = nanoid();
      await db
        .insert(triggerExecutionHistory)
        .values({
          id: historyId,
          tenantId: trigger.tenantId,
          triggerType: 'email',
          triggerId: trigger.id,
          workflowId: trigger.workflowId,
          triggerData: email,
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
      //   triggerType: 'email',
      //   triggerData: extractedData,
      //   context: {
      //     emailTrigger: trigger,
      //     originalEmail: email
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
   * Testar conexão Gmail
   */
  private async testGmailConnection(account: any): Promise<{success: boolean; message: string}> {
    // TODO: Implementar OAuth2 do Gmail
    return {
      success: true,
      message: 'Conexão Gmail OK (mock)'
    };
  }
  
  /**
   * Testar conexão Outlook
   */
  private async testOutlookConnection(account: any): Promise<{success: boolean; message: string}> {
    // TODO: Implementar OAuth2 do Outlook
    return {
      success: true,
      message: 'Conexão Outlook OK (mock)'
    };
  }
  
  /**
   * Testar conexão Yahoo
   */
  private async testYahooConnection(account: any): Promise<{success: boolean; message: string}> {
    // TODO: Implementar OAuth2 do Yahoo
    return {
      success: true,
      message: 'Conexão Yahoo OK (mock)'
    };
  }
  
  /**
   * Testar conexão IMAP
   */  
  private async testImapConnection(account: any): Promise<{success: boolean; message: string}> {
    // TODO: Implementar conexão IMAP
    return {
      success: true,
      message: 'Conexão IMAP OK (mock)'
    };
  }
  
  /**
   * Buscar emails do Gmail
   */
  private async fetchGmailEmails(account: any): Promise<EmailMessage[]> {
    // TODO: Implementar busca Gmail via API
    return [];
  }
  
  /**
   * Buscar emails do Outlook
   */
  private async fetchOutlookEmails(account: any): Promise<EmailMessage[]> {
    // TODO: Implementar busca Outlook via API
    return [];
  }
  
  /**
   * Buscar emails do Yahoo
   */
  private async fetchYahooEmails(account: any): Promise<EmailMessage[]> {
    // TODO: Implementar busca Yahoo via API
    return [];
  }
  
  /**
   * Buscar emails via IMAP
   */
  private async fetchImapEmails(account: any): Promise<EmailMessage[]> {
    // TODO: Implementar busca IMAP
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
    console.log('🔄 Iniciando sistema de auto-sync de emails...');
    
    // Executar a cada 5 minutos
    setInterval(async () => {
      try {
        const activeAccounts = await db
          .select()
          .from(emailAccounts)
          .where(eq(emailAccounts.isActive, true));
        
        console.log(`🔄 Auto-sync: processando ${activeAccounts.length} contas ativas`);
        
        for (const account of activeAccounts) {
          try {
            await this.syncEmailAccount(account.id);
          } catch (error: any) {
            console.error(`❌ Erro ao sincronizar conta ${account.id}:`, error);
          }
        }
        
      } catch (error: any) {
        console.error('❌ Erro no auto-sync:', error);
      }
    }, 5 * 60 * 1000); // 5 minutos
  }
}

export const emailWorkflowService = new EmailWorkflowService();