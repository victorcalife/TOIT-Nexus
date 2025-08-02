import type { Express } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { requireAuth } from "./authMiddleware";
import { tenantMiddleware } from "./tenantMiddleware";

// Schema validation for query builder
const queryBuilderSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  tables: z.array(z.string()),
  fields: z.array(z.object({
    table: z.string(),
    field: z.string(),
    alias: z.string().optional(),
    aggregation: z.enum(['SUM', 'COUNT', 'AVG', 'MAX', 'MIN']).optional()
  })),
  filters: z.array(z.object({
    field: z.string(),
    operator: z.enum(['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN']),
    value: z.string()
  })),
  joins: z.array(z.any()),
  groupBy: z.array(z.string()),
  orderBy: z.array(z.string()),
  limit: z.number().optional()
});

const visualizationSchema = z.object({
  type: z.enum(['table', 'bar', 'line', 'pie', 'area']),
  title: z.string(),
  xAxis: z.string().optional(),
  yAxis: z.string().optional(),
  colors: z.array(z.string()),
  width: z.number(),
  height: z.number(),
  showLegend: z.boolean(),
  showGrid: z.boolean()
});

export function registerQueryBuilderRoutes(app: Express) {
  // Apply middleware for all query builder routes
  app.use('/api/query-builder', requireAuth);
  app.use('/api/query-builder', tenantMiddleware);

  // Execute query
  app.post('/api/query-builder/execute', async (req: any, res) => {
    try {
      const { query } = req.body;
      const tenantId = req.tenant.id;
      const userId = req.user.id;
      
      console.log(`🔍 Executing query - User: ${userId}, Tenant: ${tenantId}`);
      
      const validatedQuery = queryBuilderSchema.parse(query);
      
      // Generate SQL from query builder config with tenant filtering
      const sql = generateSQL(validatedQuery, tenantId);
      
      // Execute query using storage with tenant context
      const results = await storage.executeRawQuery(sql, tenantId);
      
      res.json({ 
        success: true, 
        results,
        query: sql,
        metadata: {
          tenantId,
          executedBy: userId,
          executedAt: new Date()
        }
      });
    } catch (error: any) {
      console.error('Query execution error:', error);
      
      // Enhanced error handling with type checking
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Dados de query inválidos',
          details: error.errors,
          type: 'validation_error'
        });
      } else if (error instanceof Error) {
        return res.status(400).json({ 
          success: false, 
          error: error.message,
          type: 'execution_error'
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          error: 'Erro interno do servidor',
          type: 'internal_error'
        });
      }
    }
  });

  // Save query
  app.post('/api/query-builder/queries', async (req: any, res) => {
    try {
      const { query, visualization } = req.body;
      const tenantId = req.tenant.id;
      const userId = req.user.id;
      
      console.log(`💾 Saving query - User: ${userId}, Tenant: ${tenantId}`);
      
      const validatedQuery = queryBuilderSchema.parse(query);
      const validatedVisualization = visualizationSchema.parse(visualization);
      
      const savedQuery = await storage.saveQuery({
        tenantId,
        name: validatedQuery.name,
        description: validatedQuery.description,
        queryConfig: validatedQuery,
        visualizationConfig: validatedVisualization,
        createdBy: userId
      });
      
      res.json({
        success: true,
        data: savedQuery,
        message: 'Query salva com sucesso'
      });
    } catch (error: any) {
      console.error('Save query error:', error);
      
      // Enhanced error handling with type checking
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          error: 'Dados de query inválidos',
          details: error.errors,
          type: 'validation_error'
        });
      } else if (error instanceof Error) {
        return res.status(500).json({ 
          success: false,
          error: error.message,
          type: 'database_error'
        });
      } else {
        return res.status(500).json({ 
          success: false,
          error: 'Erro interno do servidor',
          type: 'internal_error'
        });
      }
    }
  });

  // Get saved queries
  app.get('/api/query-builder/queries', async (req: any, res) => {
    try {
      const tenantId = req.tenant.id;
      const userId = req.user.id;
      
      console.log(`📋 Getting saved queries - User: ${userId}, Tenant: ${tenantId}`);
      
      const queries = await storage.getSavedQueries(tenantId);
      
      res.json({
        success: true,
        data: queries,
        total: queries.length
      });
    } catch (error: any) {
      console.error('Get queries error:', error);
      
      // Enhanced error handling with type checking
      if (error instanceof Error) {
        return res.status(500).json({ 
          success: false,
          error: error.message,
          type: 'database_error'
        });
      } else {
        return res.status(500).json({ 
          success: false,
          error: 'Falha ao buscar queries salvas',
          type: 'internal_error'
        });
      }
    }
  });

  // Get database schema
  app.get('/api/query-builder/schema', async (req: any, res) => {
    try {
      const tenantId = req.tenant.id;
      const userId = req.user.id;
      
      console.log(`🗂️ Getting database schema - User: ${userId}, Tenant: ${tenantId}`);
      
      // Get schema with tenant-specific context
      const schema = await storage.getDatabaseSchema(tenantId);
      
      res.json({
        success: true,
        data: schema,
        metadata: {
          tenantId,
          requestedBy: userId
        }
      });
    } catch (error: any) {
      console.error('Get schema error:', error);
      
      // Enhanced error handling with type checking
      if (error instanceof Error) {
        return res.status(500).json({ 
          success: false,
          error: error.message,
          type: 'database_error'
        });
      } else {
        return res.status(500).json({ 
          success: false,
          error: 'Falha ao buscar schema do banco de dados',
          type: 'internal_error'
        });
      }
    }
  });

  // Update saved query
  app.put('/api/query-builder/queries/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const { query, visualization } = req.body;
      const tenantId = req.tenant.id;
      const userId = req.user.id;
      
      console.log(`✏️ Updating query ${id} - User: ${userId}, Tenant: ${tenantId}`);
      
      const validatedQuery = queryBuilderSchema.parse(query);
      const validatedVisualization = visualizationSchema.parse(visualization);
      
      const updatedQuery = await storage.updateSavedQuery(id, {
        name: validatedQuery.name,
        description: validatedQuery.description,
        queryConfig: validatedQuery,
        visualizationConfig: validatedVisualization,
        updatedBy: userId
      }, tenantId);
      
      res.json({
        success: true,
        data: updatedQuery,
        message: 'Query atualizada com sucesso'
      });
    } catch (error: any) {
      console.error('Update query error:', error);
      
      // Enhanced error handling with type checking
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          error: 'Dados de query inválidos',
          details: error.errors,
          type: 'validation_error'
        });
      } else if (error instanceof Error) {
        return res.status(500).json({ 
          success: false,
          error: error.message,
          type: 'database_error'
        });
      } else {
        return res.status(500).json({ 
          success: false,
          error: 'Erro interno do servidor',
          type: 'internal_error'
        });
      }
    }
  });

  // Delete saved query
  app.delete('/api/query-builder/queries/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenant.id;
      const userId = req.user.id;
      
      console.log(`🗑️ Deleting query ${id} - User: ${userId}, Tenant: ${tenantId}`);
      
      await storage.deleteSavedQuery(id, tenantId);
      
      res.json({ 
        success: true,
        message: 'Query removida com sucesso'
      });
    } catch (error: any) {
      console.error('Delete query error:', error);
      
      // Enhanced error handling with type checking
      if (error instanceof Error) {
        return res.status(500).json({ 
          success: false,
          error: error.message,
          type: 'database_error'
        });
      } else {
        return res.status(500).json({ 
          success: false,
          error: 'Falha ao deletar query',
          type: 'internal_error'
        });
      }
    }
  });

  // Execute saved query
  app.post('/api/query-builder/queries/:id/execute', async (req: any, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenant.id;
      const userId = req.user.id;
      
      console.log(`▶️ Executing saved query ${id} - User: ${userId}, Tenant: ${tenantId}`);
      
      const savedQuery = await storage.getSavedQuery(id, tenantId);
      
      if (!savedQuery) {
        return res.status(404).json({ 
          success: false,
          error: 'Query não encontrada'
        });
      }
      
      const sql = generateSQL(savedQuery.queryConfig, tenantId);
      const results = await storage.executeRawQuery(sql, tenantId);
      
      res.json({ 
        success: true, 
        results,
        query: sql,
        visualization: savedQuery.visualizationConfig,
        metadata: {
          tenantId,
          executedBy: userId,
          executedAt: new Date()
        }
      });
    } catch (error: any) {
      console.error('Execute saved query error:', error);
      
      // Enhanced error handling with type checking
      if (error instanceof Error) {
        return res.status(400).json({ 
          success: false,
          error: error.message,
          type: 'execution_error'
        });
      } else {
        return res.status(500).json({ 
          success: false,
          error: 'Falha ao executar query salva',
          type: 'internal_error'
        });
      }
    }
  });

  // Generate KPI from query
  app.post('/api/query-builder/queries/:id/create-kpi', async (req: any, res) => {
    try {
      const { id } = req.params;
      const { kpiConfig } = req.body;
      const tenantId = req.tenant.id;
      const userId = req.user.id;
      
      console.log(`📈 Creating KPI from query ${id} - User: ${userId}, Tenant: ${tenantId}`);
      
      const savedQuery = await storage.getSavedQuery(id, tenantId);
      if (!savedQuery) {
        return res.status(404).json({ 
          success: false,
          error: 'Query não encontrada'
        });
      }
      
      const kpi = await storage.createKPI({
        tenantId,
        name: kpiConfig.name,
        description: kpiConfig.description,
        category: kpiConfig.category,
        calculationType: 'custom',
        dataSource: {
          type: 'saved_query',
          queryId: id,
          field: kpiConfig.field
        },
        calculationFormula: generateSQL(savedQuery.queryConfig, tenantId),
        targetValue: kpiConfig.targetValue,
        alertThresholds: kpiConfig.alertThresholds,
        createdBy: userId
      });
      
      res.json({
        success: true,
        data: kpi,
        message: 'KPI criado com sucesso'
      });
    } catch (error: any) {
      console.error('Create KPI error:', error);
      
      // Enhanced error handling with type checking
      if (error instanceof Error) {
        return res.status(400).json({ 
          success: false,
          error: error.message,
          type: 'kpi_creation_error'
        });
      } else {
        return res.status(500).json({ 
          success: false,
          error: 'Falha ao criar KPI',
          type: 'internal_error'
        });
      }
    }
  });
}

// Generate SQL from query builder configuration with tenant isolation
function generateSQL(query: any, tenantId?: string): string {
  let sql = 'SELECT ';
  
  // Fields
  if (query.fields.length === 0) {
    sql += '*';
  } else {
    const fieldStrings = query.fields.map((field: any) => {
      let fieldStr = `${field.table}.${field.field}`;
      if (field.aggregation) {
        fieldStr = `${field.aggregation}(${fieldStr})`;
      }
      if (field.alias) {
        fieldStr += ` AS ${field.alias}`;
      }
      return fieldStr;
    });
    sql += fieldStrings.join(', ');
  }
  
  // FROM
  sql += ` FROM ${query.tables[0]}`;
  
  // JOINs (simplified for now)
  for (let i = 1; i < query.tables.length; i++) {
    sql += ` LEFT JOIN ${query.tables[i]} ON ${query.tables[0]}.id = ${query.tables[i]}.${query.tables[0].slice(0, -1)}_id`;
  }
  
  // WHERE - Always include tenant isolation
  const whereConditions: string[] = [];
  
  // Add tenant isolation filter - CRITICAL MULTI-TENANT SECURITY
  if (tenantId) {
    const primaryTable = query.tables[0];
    // Force tenant isolation on all queries - security critical
    whereConditions.push(`${primaryTable}.tenant_id = '${tenantId}'`);
    
    // Also apply to joined tables for complete isolation
    for (let i = 1; i < query.tables.length; i++) {
      whereConditions.push(`${query.tables[i]}.tenant_id = '${tenantId}'`);
    }
  }
  
  // Add user-defined filters
  if (query.filters && query.filters.length > 0) {
    const userFilters = query.filters.map((filter: any) => {
      let condition = `${filter.field} ${filter.operator}`;
      if (filter.operator === 'LIKE') {
        condition += ` '%${filter.value}%'`;
      } else if (filter.operator === 'IN') {
        condition += ` (${filter.value})`;
      } else {
        condition += ` '${filter.value}'`;
      }
      return condition;
    });
    whereConditions.push(...userFilters);
  }
  
  if (whereConditions.length > 0) {
    sql += ` WHERE ${whereConditions.join(' AND ')}`;
  }
  
  // GROUP BY
  if (query.groupBy && query.groupBy.length > 0) {
    sql += ` GROUP BY ${query.groupBy.join(', ')}`;
  }
  
  // ORDER BY
  if (query.orderBy && query.orderBy.length > 0) {
    sql += ` ORDER BY ${query.orderBy.join(', ')}`;
  }
  
  // LIMIT - Default limit for performance
  const limit = query.limit || 1000; // Default 1000 rows max
  sql += ` LIMIT ${limit}`;
  
  return sql;
}