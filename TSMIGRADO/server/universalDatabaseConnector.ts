/**
 * UNIVERSAL DATABASE CONNECTOR - Sistema completo de conectividade
 * Suporta: PostgreSQL, MySQL, SQL Server, APIs REST, Webhooks
 * Funcionalidades: Conexão, teste, queries, schema discovery, cache
 */

import { Pool as PostgreSQLPool } from 'pg';
import mysql from 'mysql2/promise';
import sql from 'mssql';
import axios from 'axios';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { db } from './db';
import { 
  externalDatabaseConnections, 
  databaseQueryCache,
  insertExternalDatabaseConnectionSchema,
  insertDatabaseQueryCacheSchema
} from '../shared/schema';
import { eq, and, desc, gte } from 'drizzle-orm';

// Validation Schemas
export const DatabaseConnectionSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['postgresql', 'mysql', 'sqlserver', 'rest_api', 'webhook']),
  config: z.object({
    host: z.string().optional(),
    port: z.number().optional(),
    database: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    ssl: z.boolean().optional(),
    apiUrl: z.string().optional(),
    apiKey: z.string().optional(),
    headers: z.record(z.string()).optional(),
    webhookUrl: z.string().optional(),
    webhookSecret: z.string().optional(),
  }),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

export const QueryExecutionSchema = z.object({
  connectionId: z.string(),
  query: z.string().min(1, 'Query é obrigatória'),
  parameters: z.array(z.any()).optional(),
  cacheKey: z.string().optional(),
  cacheTTL: z.number().default(300), // 5 minutos
});

// Interface para conexões ativas
interface ActiveConnection {
  id: string;
  type: string;
  connection: any;
  lastUsed: Date;
}

export class UniversalDatabaseConnector {
  private activeConnections: Map<string, ActiveConnection> = new Map();
  private connectionPool: Map<string, any> = new Map();

  /**
   * CRIAR NOVA CONEXÃO COM BANCO/API
   */
  async createConnection(tenantId: string, connectionData: z.infer<typeof DatabaseConnectionSchema>) {
    try {
      // Validar dados de entrada
      const validatedData = DatabaseConnectionSchema.parse(connectionData);

      // Testar conexão antes de salvar
      const testResult = await this.testConnection(validatedData);
      
      if (!testResult.success) {
        throw new Error(`Falha no teste de conexão: ${testResult.error}`);
      }

      // Salvar no banco
      const newConnection = await db
        .insert(externalDatabaseConnections)
        .values({
          tenantId,
          name: validatedData.name,
          type: validatedData.type,
          config: validatedData.config as any,
          isActive: validatedData.isActive,
          description: validatedData.description || null,
          lastTestedAt: new Date(),
          testResult: testResult,
          createdAt: new Date(),
        })
        .returning();

      return {
        success: true,
        data: newConnection[0],
        message: 'Conexão criada e testada com sucesso'
      };

    } catch (error) {
      console.error('Error creating database connection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * TESTAR CONEXÃO COM BANCO/API
   */
  async testConnection(connectionData: z.infer<typeof DatabaseConnectionSchema>) {
    try {
      const startTime = Date.now();
      let result: any = {};

      switch (connectionData.type) {
        case 'postgresql':
          result = await this.testPostgreSQLConnection(connectionData.config);
          break;
        
        case 'mysql':
          result = await this.testMySQLConnection(connectionData.config);
          break;
        
        case 'sqlserver':
          result = await this.testSQLServerConnection(connectionData.config);
          break;
        
        case 'rest_api':
          result = await this.testRESTAPIConnection(connectionData.config);
          break;
        
        case 'webhook':
          result = await this.testWebhookConnection(connectionData.config);
          break;
        
        default:
          throw new Error(`Tipo de conexão não suportado: ${connectionData.type}`);
      }

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        responseTime,
        metadata: result,
        testedAt: new Date()
      };

    } catch (error) {
      console.error('Error testing connection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no teste de conexão',
        testedAt: new Date()
      };
    }
  }

  /**
   * TESTAR CONEXÃO POSTGRESQL
   */
  private async testPostgreSQLConnection(config: any) {
    const pool = new PostgreSQLPool({
      host: config.host,
      port: config.port || 5432,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl || false,
      connectionTimeoutMillis: 10000,
    });

    try {
      const client = await pool.connect();
      const result = await client.query('SELECT version(), current_database(), current_user;');
      client.release();
      await pool.end();

      return {
        version: result.rows[0].version,
        database: result.rows[0].current_database,
        user: result.rows[0].current_user,
        tables: await this.getPostgreSQLTables(config)
      };
    } catch (error) {
      await pool.end();
      throw error;
    }
  }

  /**
   * TESTAR CONEXÃO MYSQL
   */
  private async testMySQLConnection(config: any) {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port || 3306,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl || false,
      connectTimeout: 10000,
    });

    try {
      const [rows] = await connection.execute('SELECT version(), database(), user();');
      const result = rows as any[];
      
      await connection.end();

      return {
        version: result[0]['version()'],
        database: result[0]['database()'],
        user: result[0]['user()'],
        tables: await this.getMySQLTables(config)
      };
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  /**
   * TESTAR CONEXÃO SQL SERVER
   */
  private async testSQLServerConnection(config: any) {
    const pool = new sql.ConnectionPool({
      server: config.host,
      port: config.port || 1433,
      database: config.database,
      user: config.username,
      password: config.password,
      options: {
        encrypt: config.ssl || false,
        trustServerCertificate: true,
        connectTimeout: 10000,
      }
    });

    try {
      await pool.connect();
      const result = await pool.request().query(`
        SELECT 
          @@VERSION as version,
          DB_NAME() as database_name,
          SYSTEM_USER as current_user
      `);
      
      await pool.close();

      return {
        version: result.recordset[0].version,
        database: result.recordset[0].database_name,
        user: result.recordset[0].current_user,
        tables: await this.getSQLServerTables(config)
      };
    } catch (error) {
      await pool.close();
      throw error;
    }
  }

  /**
   * TESTAR CONEXÃO REST API
   */
  private async testRESTAPIConnection(config: any) {
    const headers: any = {
      'Content-Type': 'application/json',
      ...config.headers
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const response = await axios.get(config.apiUrl, {
      headers,
      timeout: 10000,
      validateStatus: (status) => status < 500 // Aceitar códigos < 500
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      dataPreview: typeof response.data === 'object' ? 
        JSON.stringify(response.data).substring(0, 200) + '...' : 
        String(response.data).substring(0, 200) + '...'
    };
  }

  /**
   * TESTAR WEBHOOK
   */
  private async testWebhookConnection(config: any) {
    // Para webhook, apenas validamos a URL e configurações
    const testPayload = {
      test: true,
      timestamp: new Date().toISOString(),
      source: 'TOIT_NEXUS'
    };

    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (config.webhookSecret) {
      headers['X-Webhook-Secret'] = config.webhookSecret;
    }

    const response = await axios.post(config.webhookUrl, testPayload, {
      headers,
      timeout: 10000,
      validateStatus: (status) => status < 500
    });

    return {
      status: response.status,
      statusText: response.statusText,
      testPayload: testPayload,
      response: response.data
    };
  }

  /**
   * EXECUTAR QUERY COM CACHE
   */
  async executeQuery(tenantId: string, queryData: z.infer<typeof QueryExecutionSchema>) {
    try {
      const validatedData = QueryExecutionSchema.parse(queryData);

      // Verificar cache primeiro
      if (validatedData.cacheKey) {
        const cachedResult = await this.getCachedQuery(tenantId, validatedData.cacheKey);
        if (cachedResult) {
          return {
            success: true,
            data: cachedResult.result,
            cached: true,
            cachedAt: cachedResult.cachedAt
          };
        }
      }

      // Buscar conexão
      const connection = await db
        .select()
        .from(externalDatabaseConnections)
        .where(and(
          eq(externalDatabaseConnections.id, validatedData.connectionId),
          eq(externalDatabaseConnections.tenantId, tenantId),
          eq(externalDatabaseConnections.isActive, true)
        ))
        .limit(1);

      if (connection.length === 0) {
        throw new Error('Conexão não encontrada ou inativa');
      }

      const conn = connection[0];
      let result: any;

      // Executar query baseado no tipo
      switch (conn.type) {
        case 'postgresql':
          result = await this.executePostgreSQLQuery(conn.config, validatedData.query, validatedData.parameters);
          break;
        
        case 'mysql':
          result = await this.executeMySQLQuery(conn.config, validatedData.query, validatedData.parameters);
          break;
        
        case 'sqlserver':
          result = await this.executeSQLServerQuery(conn.config, validatedData.query, validatedData.parameters);
          break;
        
        case 'rest_api':
          result = await this.executeAPICall(conn.config, validatedData.query);
          break;
        
        default:
          throw new Error(`Execução não suportada para tipo: ${conn.type}`);
      }

      // Salvar no cache se especificado
      if (validatedData.cacheKey && result.success) {
        await this.cacheQueryResult(
          tenantId, 
          validatedData.cacheKey, 
          result.data, 
          validatedData.cacheTTL
        );
      }

      return {
        success: true,
        data: result.data,
        metadata: result.metadata,
        cached: false,
        executedAt: new Date()
      };

    } catch (error) {
      console.error('Error executing query:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro na execução da query'
      };
    }
  }

  /**
   * EXECUTAR QUERY POSTGRESQL
   */
  private async executePostgreSQLQuery(config: any, query: string, parameters?: any[]) {
    const pool = new PostgreSQLPool({
      host: config.host,
      port: config.port || 5432,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl || false,
    });

    try {
      const client = await pool.connect();
      const startTime = Date.now();
      const result = await client.query(query, parameters);
      const executionTime = Date.now() - startTime;
      
      client.release();
      await pool.end();

      return {
        success: true,
        data: result.rows,
        metadata: {
          rowCount: result.rowCount,
          fields: result.fields?.map(f => ({ name: f.name, dataTypeID: f.dataTypeID })),
          executionTime
        }
      };
    } catch (error) {
      await pool.end();
      throw error;
    }
  }

  /**
   * EXECUTAR QUERY MYSQL
   */
  private async executeMySQLQuery(config: any, query: string, parameters?: any[]) {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port || 3306,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl || false,
    });

    try {
      const startTime = Date.now();
      const [rows, fields] = await connection.execute(query, parameters);
      const executionTime = Date.now() - startTime;
      
      await connection.end();

      return {
        success: true,
        data: rows,
        metadata: {
          rowCount: Array.isArray(rows) ? rows.length : 0,
          fields: Array.isArray(fields) ? fields.map((f: any) => ({ name: f.name, type: f.type })) : [],
          executionTime
        }
      };
    } catch (error) {
      await connection.end();
      throw error;
    }
  }

  /**
   * EXECUTAR QUERY SQL SERVER
   */
  private async executeSQLServerQuery(config: any, query: string, parameters?: any[]) {
    const pool = new sql.ConnectionPool({
      server: config.host,
      port: config.port || 1433,
      database: config.database,
      user: config.username,
      password: config.password,
      options: {
        encrypt: config.ssl || false,
        trustServerCertificate: true,
      }
    });

    try {
      await pool.connect();
      const request = pool.request();
      
      // Adicionar parâmetros se fornecidos
      if (parameters) {
        parameters.forEach((param, index) => {
          request.input(`param${index}`, param);
        });
      }

      const startTime = Date.now();
      const result = await request.query(query);
      const executionTime = Date.now() - startTime;
      
      await pool.close();

      return {
        success: true,
        data: result.recordset,
        metadata: {
          rowCount: result.rowsAffected[0] || 0,
          fields: result.recordset.columns ? Object.keys(result.recordset.columns) : [],
          executionTime
        }
      };
    } catch (error) {
      await pool.close();
      throw error;
    }
  }

  /**
   * EXECUTAR CHAMADA API
   */
  private async executeAPICall(config: any, endpoint: string) {
    const headers: any = {
      'Content-Type': 'application/json',
      ...config.headers
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const fullUrl = `${config.apiUrl}${endpoint}`;
    const startTime = Date.now();
    
    const response = await axios.get(fullUrl, {
      headers,
      timeout: 30000,
    });

    const executionTime = Date.now() - startTime;

    return {
      success: true,
      data: response.data,
      metadata: {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        executionTime
      }
    };
  }

  /**
   * CACHE DE QUERIES
   */
  private async cacheQueryResult(tenantId: string, cacheKey: string, result: any, ttlSeconds: number) {
    try {
      const expiresAt = new Date(Date.now() + (ttlSeconds * 1000));
      
      await db
        .insert(databaseQueryCache)
        .values({
          tenantId,
          cacheKey,
          result: result,
          expiresAt,
          createdAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [databaseQueryCache.tenantId, databaseQueryCache.cacheKey],
          set: {
            result: result,
            expiresAt: expiresAt,
            updatedAt: new Date(),
          }
        });

    } catch (error) {
      console.error('Error caching query result:', error);
    }
  }

  /**
   * BUSCAR RESULTADO DO CACHE
   */
  private async getCachedQuery(tenantId: string, cacheKey: string) {
    try {
      const cached = await db
        .select()
        .from(databaseQueryCache)
        .where(and(
          eq(databaseQueryCache.tenantId, tenantId),
          eq(databaseQueryCache.cacheKey, cacheKey),
          gte(databaseQueryCache.expiresAt, new Date())
        ))
        .limit(1);

      if (cached.length > 0) {
        return {
          result: cached[0].result,
          cachedAt: cached[0].createdAt
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting cached query:', error);
      return null;
    }
  }

  /**
   * LISTAR TABELAS POSTGRESQL
   */
  private async getPostgreSQLTables(config: any): Promise<string[]> {
    try {
      const pool = new PostgreSQLPool({
        host: config.host,
        port: config.port || 5432,
        database: config.database,
        user: config.username,
        password: config.password,
        ssl: config.ssl || false,
      });

      const client = await pool.connect();
      const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      client.release();
      await pool.end();

      return result.rows.map(row => row.table_name);
    } catch (error) {
      console.error('Error getting PostgreSQL tables:', error);
      return [];
    }
  }

  /**
   * LISTAR TABELAS MYSQL
   */
  private async getMySQLTables(config: any): Promise<string[]> {
    try {
      const connection = await mysql.createConnection({
        host: config.host,
        port: config.port || 3306,
        database: config.database,
        user: config.username,
        password: config.password,
        ssl: config.ssl || false,
      });

      const [rows] = await connection.execute('SHOW TABLES');
      await connection.end();

      return (rows as any[]).map(row => Object.values(row)[0] as string);
    } catch (error) {
      console.error('Error getting MySQL tables:', error);
      return [];
    }
  }

  /**
   * LISTAR TABELAS SQL SERVER
   */
  private async getSQLServerTables(config: any): Promise<string[]> {
    try {
      const pool = new sql.ConnectionPool({
        server: config.host,
        port: config.port || 1433,
        database: config.database,
        user: config.username,
        password: config.password,
        options: {
          encrypt: config.ssl || false,
          trustServerCertificate: true,
        }
      });

      await pool.connect();
      const result = await pool.request().query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      await pool.close();

      return result.recordset.map(row => row.table_name);
    } catch (error) {
      console.error('Error getting SQL Server tables:', error);
      return [];
    }
  }

  /**
   * LISTAR CONEXÕES ATIVAS DO TENANT
   */
  async getActiveConnections(tenantId: string) {
    try {
      const connections = await db
        .select()
        .from(externalDatabaseConnections)
        .where(and(
          eq(externalDatabaseConnections.tenantId, tenantId),
          eq(externalDatabaseConnections.isActive, true)
        ))
        .orderBy(desc(externalDatabaseConnections.createdAt));

      return {
        success: true,
        data: connections.map(conn => ({
          id: conn.id,
          name: conn.name,
          type: conn.type,
          description: conn.description,
          lastTestedAt: conn.lastTestedAt,
          isActive: conn.isActive,
          createdAt: conn.createdAt,
          // Não retornar dados sensíveis da config
          hasCredentials: !!(conn.config as any)?.password || !!(conn.config as any)?.apiKey
        }))
      };
    } catch (error) {
      console.error('Error getting active connections:', error);
      return {
        success: false,
        error: 'Erro ao buscar conexões ativas'
      };
    }
  }
}

// Instância singleton
export const universalDatabaseConnector = new UniversalDatabaseConnector();