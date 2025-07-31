import type { Express } from "express";
import { z } from "zod";
import { storage } from "./storage";

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
  // Execute query
  app.post('/api/query-builder/execute', async (req, res) => {
    try {
      const { query } = req.body;
      const validatedQuery = queryBuilderSchema.parse(query);
      
      // Generate SQL from query builder config
      const sql = generateSQL(validatedQuery);
      
      // Execute query using storage
      const results = await storage.executeRawQuery(sql);
      
      res.json({ 
        success: true, 
        results,
        query: sql 
      });
    } catch (error: any) {
      console.error('Query execution error:', error);
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // Save query
  app.post('/api/query-builder/queries', async (req, res) => {
    try {
      const { query, visualization } = req.body;
      
      const validatedQuery = queryBuilderSchema.parse(query);
      const validatedVisualization = visualizationSchema.parse(visualization);
      
      // Get tenant ID from request
      const tenantId = (req as any).tenantId || 'default';
      
      const savedQuery = await storage.saveQuery({
        tenantId,
        name: validatedQuery.name,
        description: validatedQuery.description,
        queryConfig: validatedQuery,
        visualizationConfig: validatedVisualization
      });
      
      res.json(savedQuery);
    } catch (error: any) {
      console.error('Save query error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get saved queries
  app.get('/api/query-builder/queries', async (req, res) => {
    try {
      const tenantId = (req as any).tenantId || 'default';
      const queries = await storage.getSavedQueries(tenantId);
      res.json(queries);
    } catch (error: any) {
      console.error('Get queries error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get database schema
  app.get('/api/query-builder/schema', async (req, res) => {
    try {
      const schema = await storage.getDatabaseSchema();
      res.json(schema);
    } catch (error: any) {
      console.error('Get schema error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update saved query
  app.put('/api/query-builder/queries/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { query, visualization } = req.body;
      
      const validatedQuery = queryBuilderSchema.parse(query);
      const validatedVisualization = visualizationSchema.parse(visualization);
      
      const updatedQuery = await storage.updateSavedQuery(id, {
        name: validatedQuery.name,
        description: validatedQuery.description,
        queryConfig: validatedQuery,
        visualizationConfig: validatedVisualization
      });
      
      res.json(updatedQuery);
    } catch (error: any) {
      console.error('Update query error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete saved query
  app.delete('/api/query-builder/queries/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSavedQuery(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete query error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Execute saved query
  app.post('/api/query-builder/queries/:id/execute', async (req, res) => {
    try {
      const { id } = req.params;
      const savedQuery = await storage.getSavedQuery(id);
      
      if (!savedQuery) {
        return res.status(404).json({ error: 'Query not found' });
      }
      
      const sql = generateSQL(savedQuery.queryConfig);
      const results = await storage.executeRawQuery(sql);
      
      res.json({ 
        success: true, 
        results,
        query: sql,
        visualization: savedQuery.visualizationConfig
      });
    } catch (error: any) {
      console.error('Execute saved query error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Generate KPI from query
  app.post('/api/query-builder/queries/:id/create-kpi', async (req, res) => {
    try {
      const { id } = req.params;
      const { kpiConfig } = req.body;
      
      const savedQuery = await storage.getSavedQuery(id);
      if (!savedQuery) {
        return res.status(404).json({ error: 'Query not found' });
      }
      
      const tenantId = (req as any).tenantId || 'default';
      
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
        calculationFormula: generateSQL(savedQuery.queryConfig),
        targetValue: kpiConfig.targetValue,
        alertThresholds: kpiConfig.alertThresholds
      });
      
      res.json(kpi);
    } catch (error: any) {
      console.error('Create KPI error:', error);
      res.status(400).json({ error: error.message });
    }
  });
}

// Generate SQL from query builder configuration
function generateSQL(query: any): string {
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
  
  // WHERE
  if (query.filters && query.filters.length > 0) {
    const whereConditions = query.filters.map((filter: any) => {
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
  
  // LIMIT
  if (query.limit) {
    sql += ` LIMIT ${query.limit}`;
  }
  
  return sql;
}