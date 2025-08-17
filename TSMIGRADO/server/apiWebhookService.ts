/**
 * API & WEBHOOK SERVICE - Sistema completo de APIs REST e Webhooks
 * Funcionalidades: Integrações externas, callbacks, automação, monitoramento
 * Suporta: REST APIs, Webhooks, rate limiting, retry logic, logs de auditoria
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import crypto from 'crypto';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { db } from './db';
import { 
  apiWebhooks,
  webhookLogs,
  externalDatabaseConnections,
  insertApiWebhookSchema,
  insertWebhookLogSchema
} from '../shared/schema';
import { eq, desc, and, or, ilike, gte, lte, sql } from 'drizzle-orm';

// Validation Schemas
export const APIConnectionSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  baseUrl: z.string().url('URL base deve ser válida'),
  authType: z.enum(['none', 'api_key', 'bearer_token', 'basic_auth', 'oauth2']),
  authConfig: z.object({
    apiKey: z.string().optional(),
    apiKeyHeader: z.string().default('X-API-Key'),
    bearerToken: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    oauthConfig: z.object({
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
      tokenUrl: z.string().optional(),
      scope: z.string().optional(),
    }).optional(),
  }).default({}),
  headers: z.record(z.string()).default({}),
  timeout: z.number().min(1000).max(300000).default(30000), // 30 segundos
  retryConfig: z.object({
    maxRetries: z.number().min(0).max(10).default(3),
    retryDelay: z.number().min(100).max(10000).default(1000), // 1 segundo
    exponentialBackoff: z.boolean().default(true),
  }).default({}),
  rateLimiting: z.object({
    requestsPerMinute: z.number().min(1).max(10000).default(100),
    requestsPerHour: z.number().min(1).max(100000).default(1000),
  }).default({}),
  isActive: z.boolean().default(true),
});

export const WebhookSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  url: z.string().url('URL deve ser válida'),
  method: z.enum(['POST', 'PUT', 'PATCH']).default('POST'),
  headers: z.record(z.string()).default({}),
  authType: z.enum(['none', 'api_key', 'bearer_token', 'hmac_signature']),
  authConfig: z.object({
    apiKey: z.string().optional(),
    apiKeyHeader: z.string().default('X-API-Key'),
    bearerToken: z.string().optional(),
    secretKey: z.string().optional(), // Para HMAC
    signatureHeader: z.string().default('X-Signature'),
  }).default({}),
  triggers: z.array(z.enum([
    'file_uploaded', 'file_processed', 'dashboard_updated', 
    'query_executed', 'user_created', 'tenant_created',
    'task_completed', 'workflow_finished', 'custom_event'
  ])),
  retryConfig: z.object({
    maxRetries: z.number().min(0).max(10).default(3),
    retryDelay: z.number().min(100).max(10000).default(2000),
    exponentialBackoff: z.boolean().default(true),
  }).default({}),
  timeout: z.number().min(1000).max(120000).default(30000),
  isActive: z.boolean().default(true),
});

export const APIRequestSchema = z.object({
  connectionId: z.string(),
  endpoint: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET'),
  headers: z.record(z.string()).optional(),
  queryParams: z.record(z.any()).optional(),
  body: z.any().optional(),
  timeout: z.number().optional(),
});

export const WebhookCallSchema = z.object({
  webhookId: z.string(),
  eventType: z.string(),
  payload: z.any(),
  metadata: z.record(z.any()).optional(),
});

// Interface para resposta de API
interface APIResponse {
  success: boolean;
  data?: any;
  status?: number;
  statusText?: string;
  headers?: any;
  responseTime: number;
  error?: string;
  retryCount?: number;
}

// Interface para resposta de Webhook
interface WebhookResponse {
  success: boolean;
  status?: number;
  statusText?: string;
  responseTime: number;
  error?: string;
  retryCount: number;
  webhookId: string;
  eventType: string;
}

export class APIWebhookService {
  private rateLimitCache: Map<string, { count: number; resetTime: number }> = new Map();

  /**
   * CRIAR CONEXÃO DE API
   */
  async createAPIConnection(
    tenantId: string, 
    connectionData: z.infer<typeof APIConnectionSchema>
  ) {
    try {
      const validatedData = APIConnectionSchema.parse(connectionData);

      // Testar conexão antes de salvar
      const testResult = await this.testAPIConnection(validatedData);
      
      if (!testResult.success) {
        return {
          success: false,
          error: `Falha no teste de conexão: ${testResult.error}`
        };
      }

      // Salvar como External Database Connection com tipo 'rest_api'
      const connection = await db
        .insert(externalDatabaseConnections)
        .values({
          tenantId,
          name: validatedData.name,
          type: 'rest_api',
          description: validatedData.description || null,
          config: {
            apiUrl: validatedData.baseUrl,
            authType: validatedData.authType,
            authConfig: validatedData.authConfig,
            headers: validatedData.headers,
            timeout: validatedData.timeout,
            retryConfig: validatedData.retryConfig,
            rateLimiting: validatedData.rateLimiting,
          } as any,
          isActive: validatedData.isActive,
          lastTestedAt: new Date(),
          testResult: testResult,
          createdAt: new Date(),
        })
        .returning();

      return {
        success: true,
        data: connection[0],
        message: 'Conexão de API criada e testada com sucesso'
      };

    } catch (error) {
      console.error('Error creating API connection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar conexão de API'
      };
    }
  }

  /**
   * CRIAR WEBHOOK
   */
  async createWebhook(
    tenantId: string, 
    webhookData: z.infer<typeof WebhookSchema>
  ) {
    try {
      const validatedData = WebhookSchema.parse(webhookData);

      // Testar webhook antes de salvar
      const testResult = await this.testWebhook(validatedData);

      const webhook = await db
        .insert(apiWebhooks)
        .values({
          tenantId,
          name: validatedData.name,
          description: validatedData.description || null,
          url: validatedData.url,
          method: validatedData.method,
          headers: validatedData.headers as any,
          authType: validatedData.authType,
          authConfig: validatedData.authConfig as any,
          triggers: validatedData.triggers,
          retryConfig: validatedData.retryConfig as any,
          timeout: validatedData.timeout,
          isActive: validatedData.isActive,
          lastTriggeredAt: null,
          successCount: 0,
          failureCount: 0,
          createdAt: new Date(),
        })
        .returning();

      // Log do teste
      await this.logWebhookCall(webhook[0].id, 'webhook_test', { test: true }, testResult);

      return {
        success: true,
        data: webhook[0],
        message: testResult.success ? 
          'Webhook criado e testado com sucesso' : 
          `Webhook criado, mas teste falhou: ${testResult.error}`
      };

    } catch (error) {
      console.error('Error creating webhook:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar webhook'
      };
    }
  }

  /**
   * EXECUTAR CHAMADA DE API
   */
  async executeAPIRequest(
    tenantId: string, 
    requestData: z.infer<typeof APIRequestSchema>
  ): Promise<APIResponse> {
    const startTime = Date.now();
    let retryCount = 0;

    try {
      const validatedData = APIRequestSchema.parse(requestData);

      // Buscar conexão
      const connection = await db
        .select()
        .from(externalDatabaseConnections)
        .where(and(
          eq(externalDatabaseConnections.id, validatedData.connectionId),
          eq(externalDatabaseConnections.tenantId, tenantId),
          eq(externalDatabaseConnections.type, 'rest_api'),
          eq(externalDatabaseConnections.isActive, true)
        ))
        .limit(1);

      if (connection.length === 0) {
        throw new Error('Conexão de API não encontrada ou inativa');
      }

      const conn = connection[0];
      const config = conn.config as any;

      // Verificar rate limiting
      const rateLimitResult = this.checkRateLimit(conn.id, config.rateLimiting);
      if (!rateLimitResult.allowed) {
        throw new Error(`Rate limit excedido. Tente novamente em ${rateLimitResult.retryAfter} segundos`);
      }

      // Preparar request
      const axiosConfig: AxiosRequestConfig = {
        method: validatedData.method.toLowerCase() as any,
        url: `${config.apiUrl}${validatedData.endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
          ...validatedData.headers,
        },
        params: validatedData.queryParams,
        data: validatedData.body,
        timeout: validatedData.timeout || config.timeout || 30000,
      };

      // Aplicar autenticação
      this.applyAuthentication(axiosConfig, config.authType, config.authConfig);

      // Executar request com retry logic
      const maxRetries = config.retryConfig?.maxRetries || 3;
      let lastError: any = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          retryCount = attempt;
          const response: AxiosResponse = await axios(axiosConfig);

          // Atualizar contadores
          await this.updateConnectionStats(conn.id, true);

          return {
            success: true,
            data: response.data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            responseTime: Date.now() - startTime,
            retryCount
          };

        } catch (error: any) {
          lastError = error;
          
          // Se não é um erro que vale a pena retry, falhar imediatamente
          if (attempt === maxRetries || !this.shouldRetry(error)) {
            break;
          }

          // Aguardar antes do próximo retry
          const delay = this.calculateRetryDelay(attempt, config.retryConfig);
          await this.sleep(delay);
        }
      }

      // Atualizar contadores de falha
      await this.updateConnectionStats(conn.id, false);

      throw lastError;

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        responseTime,
        retryCount,
        error: error.response?.data?.message || 
               error.message || 
               'Erro na execução da API'
      };
    }
  }

  /**
   * EXECUTAR WEBHOOK
   */
  async executeWebhook(
    tenantId: string, 
    callData: z.infer<typeof WebhookCallSchema>
  ): Promise<WebhookResponse> {
    const startTime = Date.now();
    let retryCount = 0;

    try {
      const validatedData = WebhookCallSchema.parse(callData);

      // Buscar webhook
      const webhook = await db
        .select()
        .from(apiWebhooks)
        .where(and(
          eq(apiWebhooks.id, validatedData.webhookId),
          eq(apiWebhooks.tenantId, tenantId),
          eq(apiWebhooks.isActive, true)
        ))
        .limit(1);

      if (webhook.length === 0) {
        throw new Error('Webhook não encontrado ou inativo');
      }

      const webhookConfig = webhook[0];

      // Verificar se webhook suporta este tipo de evento
      if (!webhookConfig.triggers.includes(validatedData.eventType as any)) {
        throw new Error(`Webhook não está configurado para o evento: ${validatedData.eventType}`);
      }

      // Preparar payload
      const payload = {
        event: validatedData.eventType,
        timestamp: new Date().toISOString(),
        data: validatedData.payload,
        metadata: {
          tenantId,
          webhookId: webhookConfig.id,
          source: 'TOIT_NEXUS',
          ...validatedData.metadata
        }
      };

      // Preparar headers
      const headers: any = {
        'Content-Type': 'application/json',
        'User-Agent': 'TOIT-NEXUS-Webhook/1.0',
        ...webhookConfig.headers
      };

      // Aplicar autenticação
      this.applyWebhookAuth(headers, payload, webhookConfig.authType, webhookConfig.authConfig as any);

      // Executar webhook com retry logic
      const maxRetries = (webhookConfig.retryConfig as any)?.maxRetries || 3;
      let lastError: any = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          retryCount = attempt;
          
          const response: AxiosResponse = await axios({
            method: webhookConfig.method.toLowerCase() as any,
            url: webhookConfig.url,
            headers,
            data: payload,
            timeout: webhookConfig.timeout,
          });

          // Atualizar contadores de sucesso
          await db
            .update(apiWebhooks)
            .set({
              lastTriggeredAt: new Date(),
              successCount: sql`${apiWebhooks.successCount} + 1`,
              updatedAt: new Date(),
            })
            .where(eq(apiWebhooks.id, webhookConfig.id));

          const result: WebhookResponse = {
            success: true,
            status: response.status,
            statusText: response.statusText,
            responseTime: Date.now() - startTime,
            retryCount,
            webhookId: webhookConfig.id,
            eventType: validatedData.eventType
          };

          // Log de sucesso
          await this.logWebhookCall(webhookConfig.id, validatedData.eventType, payload, result);

          return result;

        } catch (error: any) {
          lastError = error;
          
          // Se não é um erro que vale a pena retry, falhar imediatamente
          if (attempt === maxRetries || !this.shouldRetry(error)) {
            break;
          }

          // Aguardar antes do próximo retry
          const delay = this.calculateRetryDelay(attempt, webhookConfig.retryConfig as any);
          await this.sleep(delay);
        }
      }

      // Atualizar contadores de falha
      await db
        .update(apiWebhooks)
        .set({
          failureCount: sql`${apiWebhooks.failureCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(apiWebhooks.id, webhookConfig.id));

      throw lastError;

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      const result: WebhookResponse = {
        success: false,
        responseTime,
        retryCount,
        webhookId: callData.webhookId,
        eventType: callData.eventType,
        error: error.response?.data?.message || 
               error.message || 
               'Erro na execução do webhook'
      };

      // Log de erro
      await this.logWebhookCall(callData.webhookId, callData.eventType, callData.payload, result);

      return result;
    }
  }

  /**
   * TESTAR CONEXÃO DE API
   */
  private async testAPIConnection(connectionData: z.infer<typeof APIConnectionSchema>) {
    try {
      const axiosConfig: AxiosRequestConfig = {
        method: 'GET',
        url: connectionData.baseUrl,
        headers: {
          'Content-Type': 'application/json',
          ...connectionData.headers,
        },
        timeout: connectionData.timeout,
      };

      this.applyAuthentication(axiosConfig, connectionData.authType, connectionData.authConfig);

      const startTime = Date.now();
      const response = await axios(axiosConfig);
      const responseTime = Date.now() - startTime;

      return {
        success: true,
        responseTime,
        status: response.status,
        statusText: response.statusText,
        testedAt: new Date()
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erro no teste de conexão',
        testedAt: new Date()
      };
    }
  }

  /**
   * TESTAR WEBHOOK
   */
  private async testWebhook(webhookData: z.infer<typeof WebhookSchema>) {
    try {
      const testPayload = {
        event: 'webhook_test',
        timestamp: new Date().toISOString(),
        data: { test: true, message: 'Teste de webhook do TOIT NEXUS' },
        metadata: { source: 'TOIT_NEXUS', test: true }
      };

      const headers: any = {
        'Content-Type': 'application/json',
        'User-Agent': 'TOIT-NEXUS-Webhook/1.0',
        ...webhookData.headers
      };

      this.applyWebhookAuth(headers, testPayload, webhookData.authType, webhookData.authConfig);

      const startTime = Date.now();
      const response = await axios({
        method: webhookData.method.toLowerCase() as any,
        url: webhookData.url,
        headers,
        data: testPayload,
        timeout: webhookData.timeout,
      });

      return {
        success: true,
        responseTime: Date.now() - startTime,
        status: response.status,
        statusText: response.statusText,
        testedAt: new Date()
      };

    } catch (error: any) {
      return {
        success: false,
        responseTime: Date.now() - Date.now(),
        error: error.response?.data?.message || error.message || 'Erro no teste de webhook',
        testedAt: new Date()
      };
    }
  }

  /**
   * APLICAR AUTENTICAÇÃO PARA API
   */
  private applyAuthentication(
    config: AxiosRequestConfig, 
    authType: string, 
    authConfig: any
  ) {
    switch (authType) {
      case 'api_key':
        if (authConfig.apiKey) {
          config.headers![authConfig.apiKeyHeader || 'X-API-Key'] = authConfig.apiKey;
        }
        break;
      
      case 'bearer_token':
        if (authConfig.bearerToken) {
          config.headers!['Authorization'] = `Bearer ${authConfig.bearerToken}`;
        }
        break;
      
      case 'basic_auth':
        if (authConfig.username && authConfig.password) {
          const credentials = Buffer.from(`${authConfig.username}:${authConfig.password}`).toString('base64');
          config.headers!['Authorization'] = `Basic ${credentials}`;
        }
        break;
      
      case 'oauth2':
        // Implementação OAuth2 simplificada - assumindo token já obtido
        if (authConfig.bearerToken) {
          config.headers!['Authorization'] = `Bearer ${authConfig.bearerToken}`;
        }
        break;
    }
  }

  /**
   * APLICAR AUTENTICAÇÃO PARA WEBHOOK
   */
  private applyWebhookAuth(
    headers: any, 
    payload: any, 
    authType: string, 
    authConfig: any
  ) {
    switch (authType) {
      case 'api_key':
        if (authConfig.apiKey) {
          headers[authConfig.apiKeyHeader || 'X-API-Key'] = authConfig.apiKey;
        }
        break;
      
      case 'bearer_token':
        if (authConfig.bearerToken) {
          headers['Authorization'] = `Bearer ${authConfig.bearerToken}`;
        }
        break;
      
      case 'hmac_signature':
        if (authConfig.secretKey) {
          const signature = crypto
            .createHmac('sha256', authConfig.secretKey)
            .update(JSON.stringify(payload))
            .digest('hex');
          headers[authConfig.signatureHeader || 'X-Signature'] = `sha256=${signature}`;
        }
        break;
    }
  }

  /**
   * VERIFICAR RATE LIMITING
   */
  private checkRateLimit(connectionId: string, rateLimiting: any) {
    const now = Date.now();
    const key = `rate_limit_${connectionId}`;
    const current = this.rateLimitCache.get(key);

    const requestsPerMinute = rateLimiting?.requestsPerMinute || 100;
    const resetInterval = 60 * 1000; // 1 minuto

    if (!current || now > current.resetTime) {
      // Reset ou primeira vez
      this.rateLimitCache.set(key, {
        count: 1,
        resetTime: now + resetInterval
      });
      return { allowed: true };
    }

    if (current.count >= requestsPerMinute) {
      const retryAfter = Math.ceil((current.resetTime - now) / 1000);
      return { allowed: false, retryAfter };
    }

    // Incrementar contador
    current.count++;
    this.rateLimitCache.set(key, current);
    return { allowed: true };
  }

  /**
   * VERIFICAR SE DEVE TENTAR NOVAMENTE
   */
  private shouldRetry(error: any): boolean {
    // Não retry para erros 4xx (exceto 429 - rate limit)
    if (error.response?.status) {
      const status = error.response.status;
      return status >= 500 || status === 429 || status === 408; // Server errors, rate limit, timeout
    }
    
    // Retry para erros de rede
    return error.code === 'ECONNRESET' || 
           error.code === 'ETIMEDOUT' || 
           error.code === 'ENOTFOUND';
  }

  /**
   * CALCULAR DELAY DE RETRY
   */
  private calculateRetryDelay(attempt: number, retryConfig: any): number {
    const baseDelay = retryConfig?.retryDelay || 1000;
    const exponentialBackoff = retryConfig?.exponentialBackoff ?? true;
    
    if (exponentialBackoff) {
      return baseDelay * Math.pow(2, attempt);
    }
    
    return baseDelay;
  }

  /**
   * ATUALIZAR ESTATÍSTICAS DA CONEXÃO
   */
  private async updateConnectionStats(connectionId: string, success: boolean) {
    try {
      await db
        .update(externalDatabaseConnections)
        .set({
          totalQueries: sql`${externalDatabaseConnections.totalQueries} + 1`,
          lastUsedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(externalDatabaseConnections.id, connectionId));
    } catch (error) {
      console.error('Error updating connection stats:', error);
    }
  }

  /**
   * LOG DE CHAMADA DE WEBHOOK
   */
  private async logWebhookCall(
    webhookId: string, 
    eventType: string, 
    payload: any, 
    result: any
  ) {
    try {
      await db
        .insert(webhookLogs)
        .values({
          webhookId,
          eventType,
          payload: payload,
          response: result,
          status: result.success ? 'success' : 'failed',
          responseTime: result.responseTime,
          retryCount: result.retryCount || 0,
          errorMessage: result.error || null,
          createdAt: new Date(),
        });
    } catch (error) {
      console.error('Error logging webhook call:', error);
    }
  }

  /**
   * SLEEP UTILITY
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * TRIGGER WEBHOOK POR EVENTO
   */
  async triggerWebhooksByEvent(tenantId: string, eventType: string, payload: any, metadata?: any) {
    try {
      // Buscar webhooks ativos para este evento
      const webhooks = await db
        .select()
        .from(apiWebhooks)
        .where(and(
          eq(apiWebhooks.tenantId, tenantId),
          eq(apiWebhooks.isActive, true),
          sql`${eventType} = ANY(${apiWebhooks.triggers})`
        ));

      const results: WebhookResponse[] = [];

      // Executar todos os webhooks em paralelo
      const promises = webhooks.map(webhook => 
        this.executeWebhook(tenantId, {
          webhookId: webhook.id,
          eventType,
          payload,
          metadata
        })
      );

      const responses = await Promise.allSettled(promises);

      responses.forEach((response, index) => {
        if (response.status === 'fulfilled') {
          results.push(response.value);
        } else {
          console.error(`Webhook ${webhooks[index].id} failed:`, response.reason);
          results.push({
            success: false,
            responseTime: 0,
            retryCount: 0,
            webhookId: webhooks[index].id,
            eventType,
            error: response.reason?.message || 'Erro desconhecido'
          });
        }
      });

      return {
        success: true,
        data: results,
        message: `${results.filter(r => r.success).length}/${results.length} webhooks executados com sucesso`
      };

    } catch (error) {
      console.error('Error triggering webhooks:', error);
      return {
        success: false,
        error: 'Erro ao executar webhooks'
      };
    }
  }
}

// Instância singleton
export const apiWebhookService = new APIWebhookService();