/**
 * UNIVERSAL DATABASE ROUTES - API completa para conectividade
 * Endpoints: CRUD conexões, teste, execução de queries, cache
 */

import express from 'express';
import { eq, desc, and, or, ilike } from 'drizzle-orm';
import { db } from './db';
import { 
  externalDatabaseConnections,
  databaseQueryCache,
  users,
  tenants
} from '../shared/schema';
import { requireAuth } from './authMiddleware';
import { tenantMiddleware } from './tenantMiddleware';
import { universalDatabaseConnector, DatabaseConnectionSchema, QueryExecutionSchema } from './universalDatabaseConnector';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const router = express.Router();

// Middleware para autenticação e tenant
router.use(requireAuth);
router.use(tenantMiddleware);

// ==========================================
// DATABASE CONNECTIONS - GESTÃO DE CONEXÕES
// ==========================================

// GET /api/database/connections - Listar conexões do tenant
router.get('/connections', async (req: any, res) => {
  try {
    const { search, type, isActive, limit = 20, offset = 0 } = req.query;
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
      .where(eq(externalDatabaseConnections.tenantId, tenantId));

    // Aplicar filtros
    if (search) {
      query = query.where(
        or(
          ilike(externalDatabaseConnections.name, `%${search}%`),
          ilike(externalDatabaseConnections.description, `%${search}%`)
        )
      );
    }

    if (type) {
      query = query.where(eq(externalDatabaseConnections.type, type));
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
          password: item.connection.config && (item.connection.config as any).password ? '***masked***' : undefined,
          apiKey: item.connection.config && (item.connection.config as any).apiKey ? '***masked***' : undefined,
          webhookSecret: item.connection.config && (item.connection.config as any).webhookSecret ? '***masked***' : undefined,
        }
      }
    }));

    res.json({
      success: true,
      data: sanitizedConnections,
      total: connections.length
    });

  } catch (error) {
    console.error('Error fetching database connections:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar conexões de banco de dados'
    });
  }
});

// POST /api/database/connections - Criar nova conexão
router.post('/connections', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;

    // Validar dados de entrada
    const validatedData = DatabaseConnectionSchema.parse(req.body);

    // Criar conexão usando o connector
    const result = await universalDatabaseConnector.createConnection(tenantId, {
      ...validatedData,
      // Adicionar informações do usuário
    });

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

    res.status(201).json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Error creating database connection:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha ao criar conexão de banco de dados'
      });
    }
  }
});

// PUT /api/database/connections/:id - Atualizar conexão
router.put('/connections/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    // Verificar se a conexão existe e pertence ao tenant
    const existingConnection = await db
      .select()
      .from(externalDatabaseConnections)
      .where(and(
        eq(externalDatabaseConnections.id, id),
        eq(externalDatabaseConnections.tenantId, tenantId)
      ))
      .limit(1);

    if (existingConnection.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conexão não encontrada'
      });
    }

    // Validar dados de entrada
    const validatedData = DatabaseConnectionSchema.parse(req.body);

    // Testar a conexão se os dados mudaram
    const testResult = await universalDatabaseConnector.testConnection(validatedData);

    // Atualizar conexão
    const updatedConnection = await db
      .update(externalDatabaseConnections)
      .set({
        name: validatedData.name,
        type: validatedData.type,
        description: validatedData.description,
        config: validatedData.config as any,
        isActive: validatedData.isActive,
        lastTestedAt: new Date(),
        testResult: testResult,
        updatedAt: new Date(),
      })
      .where(eq(externalDatabaseConnections.id, id))
      .returning();

    res.json({
      success: true,
      data: updatedConnection[0],
      message: testResult.success ? 
        'Conexão atualizada e testada com sucesso' : 
        `Conexão atualizada, mas teste falhou: ${testResult.error}`
    });

  } catch (error) {
    console.error('Error updating database connection:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha ao atualizar conexão'
      });
    }
  }
});

// DELETE /api/database/connections/:id - Deletar conexão
router.delete('/connections/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    // Verificar se a conexão existe e pertence ao tenant
    const existingConnection = await db
      .select()
      .from(externalDatabaseConnections)
      .where(and(
        eq(externalDatabaseConnections.id, id),
        eq(externalDatabaseConnections.tenantId, tenantId)
      ))
      .limit(1);

    if (existingConnection.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conexão não encontrada'
      });
    }

    // Deletar conexão (soft delete - marcar como inativa)
    await db
      .update(externalDatabaseConnections)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(externalDatabaseConnections.id, id));

    res.json({
      success: true,
      message: 'Conexão removida com sucesso'
    });

  } catch (error) {
    console.error('Error deleting database connection:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao remover conexão'
    });
  }
});

// POST /api/database/connections/:id/test - Testar conexão
router.post('/connections/:id/test', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    // Buscar conexão
    const connection = await db
      .select()
      .from(externalDatabaseConnections)
      .where(and(
        eq(externalDatabaseConnections.id, id),
        eq(externalDatabaseConnections.tenantId, tenantId)
      ))
      .limit(1);

    if (connection.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conexão não encontrada'
      });
    }

    const conn = connection[0];

    // Testar conexão
    const testResult = await universalDatabaseConnector.testConnection({
      name: conn.name,
      type: conn.type as any,
      description: conn.description,
      config: conn.config as any,
      isActive: conn.isActive,
    });

    // Atualizar resultado do teste
    await db
      .update(externalDatabaseConnections)
      .set({
        lastTestedAt: new Date(),
        testResult: testResult,
        updatedAt: new Date(),
      })
      .where(eq(externalDatabaseConnections.id, id));

    res.json({
      success: true,
      data: testResult,
      message: testResult.success ? 
        'Conexão testada com sucesso' : 
        `Teste de conexão falhou: ${testResult.error}`
    });

  } catch (error) {
    console.error('Error testing database connection:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao testar conexão'
    });
  }
});

// ==========================================
// QUERY EXECUTION - EXECUÇÃO DE QUERIES
// ==========================================

// POST /api/database/execute - Executar query
router.post('/execute', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;

    // Validar dados de entrada
    const validatedData = QueryExecutionSchema.parse(req.body);

    // Executar query usando o connector
    const result = await universalDatabaseConnector.executeQuery(tenantId, validatedData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      metadata: result.metadata,
      cached: result.cached,
      cachedAt: result.cachedAt,
      executedAt: result.executedAt
    });

  } catch (error) {
    console.error('Error executing query:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha ao executar query'
      });
    }
  }
});

// POST /api/database/connections/:id/schema - Obter schema do banco
router.post('/connections/:id/schema', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    // Buscar conexão
    const connection = await db
      .select()
      .from(externalDatabaseConnections)
      .where(and(
        eq(externalDatabaseConnections.id, id),
        eq(externalDatabaseConnections.tenantId, tenantId),
        eq(externalDatabaseConnections.isActive, true)
      ))
      .limit(1);

    if (connection.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conexão não encontrada ou inativa'
      });
    }

    const conn = connection[0];

    // Executar query para obter schema baseado no tipo
    let schemaQuery = '';
    
    switch (conn.type) {
      case 'postgresql':
        schemaQuery = `
          SELECT 
            table_name,
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public'
          ORDER BY table_name, ordinal_position
        `;
        break;
      
      case 'mysql':
        schemaQuery = `
          SELECT 
            table_name,
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_schema = '${(conn.config as any).database}'
          ORDER BY table_name, ordinal_position
        `;
        break;
      
      case 'sqlserver':
        schemaQuery = `
          SELECT 
            t.table_name,
            c.column_name,
            c.data_type,
            c.is_nullable,
            c.column_default
          FROM information_schema.tables t
          INNER JOIN information_schema.columns c ON t.table_name = c.table_name
          WHERE t.table_type = 'BASE TABLE'
          ORDER BY t.table_name, c.ordinal_position
        `;
        break;
      
      default:
        return res.status(400).json({
          success: false,
          error: 'Schema discovery não suportado para este tipo de conexão'
        });
    }

    // Executar query de schema
    const result = await universalDatabaseConnector.executeQuery(tenantId, {
      connectionId: id,
      query: schemaQuery,
      cacheKey: `schema_${id}`,
      cacheTTL: 3600, // Cache por 1 hora
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Falha ao obter schema'
      });
    }

    // Organizar dados por tabela
    const tables: any = {};
    (result.data as any[]).forEach(row => {
      if (!tables[row.table_name]) {
        tables[row.table_name] = {
          name: row.table_name,
          columns: []
        };
      }
      
      tables[row.table_name].columns.push({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        default: row.column_default
      });
    });

    res.json({
      success: true,
      data: {
        tables: Object.values(tables),
        totalTables: Object.keys(tables).length,
        totalColumns: (result.data as any[]).length
      },
      cached: result.cached,
      cachedAt: result.cachedAt
    });

  } catch (error) {
    console.error('Error getting database schema:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao obter schema do banco de dados'
    });
  }
});

// ==========================================
// CACHE MANAGEMENT - GESTÃO DE CACHE
// ==========================================

// GET /api/database/cache - Listar cache de queries
router.get('/cache', async (req: any, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const tenantId = req.tenant.id;

    const cacheEntries = await db
      .select({
        cache: databaseQueryCache,
        connection: {
          id: externalDatabaseConnections.id,
          name: externalDatabaseConnections.name,
          type: externalDatabaseConnections.type
        }
      })
      .from(databaseQueryCache)
      .leftJoin(externalDatabaseConnections, eq(externalDatabaseConnections.id, databaseQueryCache.connectionId))
      .where(eq(databaseQueryCache.tenantId, tenantId))
      .orderBy(desc(databaseQueryCache.createdAt))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    res.json({
      success: true,
      data: cacheEntries.map(entry => ({
        ...entry.cache,
        connection: entry.connection,
        // Não retornar o resultado completo na listagem
        result: undefined,
        resultPreview: typeof entry.cache.result === 'object' ? 
          JSON.stringify(entry.cache.result).substring(0, 100) + '...' : 
          String(entry.cache.result).substring(0, 100) + '...'
      })),
      total: cacheEntries.length
    });

  } catch (error) {
    console.error('Error fetching query cache:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar cache de queries'
    });
  }
});

// DELETE /api/database/cache/:cacheKey - Limpar cache específico
router.delete('/cache/:cacheKey', async (req: any, res) => {
  try {
    const { cacheKey } = req.params;
    const tenantId = req.tenant.id;

    await db
      .delete(databaseQueryCache)
      .where(and(
        eq(databaseQueryCache.tenantId, tenantId),
        eq(databaseQueryCache.cacheKey, cacheKey)
      ));

    res.json({
      success: true,
      message: 'Entry de cache removida com sucesso'
    });

  } catch (error) {
    console.error('Error clearing cache entry:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao limpar entry de cache'
    });
  }
});

// DELETE /api/database/cache - Limpar todo o cache do tenant
router.delete('/cache', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;

    const result = await db
      .delete(databaseQueryCache)
      .where(eq(databaseQueryCache.tenantId, tenantId));

    res.json({
      success: true,
      message: `Cache limpo com sucesso`,
      deletedEntries: result.rowCount || 0
    });

  } catch (error) {
    console.error('Error clearing all cache:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao limpar cache'
    });
  }
});

// ==========================================
// STATISTICS - ESTATÍSTICAS DE USO
// ==========================================

// GET /api/database/stats - Estatísticas de conexões e uso
router.get('/stats', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;

    // Contar conexões por tipo
    const connectionStats = await db
      .select({
        type: externalDatabaseConnections.type,
        count: sql<number>`count(*)`,
        active: sql<number>`count(case when ${externalDatabaseConnections.isActive} then 1 end)`
      })
      .from(externalDatabaseConnections)
      .where(eq(externalDatabaseConnections.tenantId, tenantId))
      .groupBy(externalDatabaseConnections.type);

    // Estatísticas de cache
    const cacheStats = await db
      .select({
        totalEntries: sql<number>`count(*)`,
        totalHits: sql<number>`sum(${databaseQueryCache.hitCount})`,
        avgResultSize: sql<number>`avg(${databaseQueryCache.resultSize})`,
        oldestEntry: sql<Date>`min(${databaseQueryCache.createdAt})`,
        newestEntry: sql<Date>`max(${databaseQueryCache.createdAt})`
      })
      .from(databaseQueryCache)
      .where(eq(databaseQueryCache.tenantId, tenantId));

    // Conexões mais usadas
    const topConnections = await db
      .select({
        id: externalDatabaseConnections.id,
        name: externalDatabaseConnections.name,
        type: externalDatabaseConnections.type,
        totalQueries: externalDatabaseConnections.totalQueries,
        lastUsedAt: externalDatabaseConnections.lastUsedAt
      })
      .from(externalDatabaseConnections)
      .where(and(
        eq(externalDatabaseConnections.tenantId, tenantId),
        eq(externalDatabaseConnections.isActive, true)
      ))
      .orderBy(desc(externalDatabaseConnections.totalQueries))
      .limit(5);

    res.json({
      success: true,
      data: {
        connectionStats,
        cacheStats: cacheStats[0] || {},
        topConnections,
        summary: {
          totalConnections: connectionStats.reduce((sum, stat) => sum + stat.count, 0),
          activeConnections: connectionStats.reduce((sum, stat) => sum + stat.active, 0),
          totalCacheEntries: cacheStats[0]?.totalEntries || 0,
          totalCacheHits: cacheStats[0]?.totalHits || 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching database stats:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar estatísticas'
    });
  }
});

export { router as universalDatabaseRoutes };