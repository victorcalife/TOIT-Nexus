/**
 * TQL API ROUTES - TOIT NEXUS
 * APIs para sistema TQL avançado com helper em tempo real
 */

const express = require('express');
const router = express.Router();
const TQLEngine = require('../services/tql/TQLEngine');
const TQLParser = require('../services/tql/TQLParser');
const { authenticateToken } = require('../middleware/auth');
const { performance } = require('perf_hooks');

// Configuração do banco de dados
const databaseConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Fallback para configuração individual se DATABASE_URL não estiver disponível
if (!process.env.DATABASE_URL) {
  databaseConfig.host = process.env.DB_HOST;
  databaseConfig.port = process.env.DB_PORT || 5432;
  databaseConfig.database = process.env.DB_NAME;
  databaseConfig.user = process.env.DB_USER;
  databaseConfig.password = process.env.DB_PASSWORD;
}

// Inicializar TQL Engine
const tqlEngine = new TQLEngine(databaseConfig);
const tqlParser = new TQLParser();

/**
 * Executar query TQL
 */
router.post('/tql/execute', authenticateToken, async (req, res) => {
  try {
    const { query, options = {} } = req.body;
    
    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Query TQL é obrigatória'
      });
    }

    const startTime = performance.now();

    // Executar query
    const result = await tqlEngine.execute(query, {
      ...options,
      userId: req.user.id
    });

    res.json({
      success: true,
      ...result,
      metadata: {
        ...result.metadata,
        totalTime: performance.now() - startTime
      }
    });

  } catch (error) {
    console.error('❌ TQL Execute Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'execution_error'
    });
  }
});

/**
 * Validar query TQL
 */
router.post('/tql/validate', authenticateToken, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.json({
        valid: true,
        errors: [],
        suggestions: []
      });
    }

    // Validar sintaxe
    const validation = tqlParser.validate(query);
    
    // Analisar e sugerir melhorias
    const analysis = await tqlEngine.analyze(query);

    res.json({
      valid: validation.valid && analysis.valid,
      errors: [...validation.errors, ...analysis.errors],
      suggestions: analysis.suggestions || [],
      complexity: analysis.complexity
    });

  } catch (error) {
    console.error('❌ TQL Validate Error:', error);
    res.json({
      valid: false,
      errors: [error.message],
      suggestions: []
    });
  }
});

/**
 * Obter sugestões de autocomplete
 */
router.post('/tql/suggestions', authenticateToken, async (req, res) => {
  try {
    const { query, cursorPosition } = req.body;
    
    const suggestions = tqlParser.getSuggestions(query || '', cursorPosition || 0);
    
    // Adicionar sugestões de tabelas e campos
    const tableSuggestions = await getTableSuggestions(query);
    const fieldSuggestions = await getFieldSuggestions(query);
    
    res.json({
      success: true,
      suggestions: {
        keywords: suggestions,
        tables: tableSuggestions,
        fields: fieldSuggestions
      }
    });

  } catch (error) {
    console.error('❌ TQL Suggestions Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Explicar plano de execução
 */
router.post('/tql/explain', authenticateToken, async (req, res) => {
  try {
    const { query, options = {} } = req.body;
    
    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Query TQL é obrigatória'
      });
    }

    const explanation = await tqlEngine.explain(query, options);

    res.json({
      success: true,
      explanation
    });

  } catch (error) {
    console.error('❌ TQL Explain Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Converter TQL para SQL
 */
router.post('/tql/convert', authenticateToken, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Query TQL é obrigatória'
      });
    }

    // Parse da query
    const parsed = tqlParser.parse(query);
    
    // Converter para SQL
    const sql = tqlParser.toSQL(parsed);

    res.json({
      success: true,
      tql: query,
      sql: sql,
      parsed: parsed
    });

  } catch (error) {
    console.error('❌ TQL Convert Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Obter histórico de queries
 */
router.get('/tql/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const history = tqlEngine.getQueryHistory(parseInt(limit));
    
    res.json({
      success: true,
      history: history.map(entry => ({
        ...entry,
        userId: req.user.id // Filtrar por usuário em produção
      }))
    });

  } catch (error) {
    console.error('❌ TQL History Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Obter estatísticas de performance
 */
router.get('/tql/stats', authenticateToken, async (req, res) => {
  try {
    const stats = tqlEngine.getPerformanceStats();
    
    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ TQL Stats Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Limpar cache TQL
 */
router.post('/tql/cache/clear', authenticateToken, async (req, res) => {
  try {
    tqlEngine.clearCache();
    
    res.json({
      success: true,
      message: 'Cache TQL limpo com sucesso'
    });

  } catch (error) {
    console.error('❌ TQL Clear Cache Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Obter tabelas disponíveis
 */
router.get('/tql/tables', authenticateToken, async (req, res) => {
  try {
    // Consultar tabelas do banco
    const result = await tqlEngine.executeSQL(`
      SELECT table_name, table_type, table_comment
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tables = result.rows.map(row => ({
      name: row.table_name,
      type: row.table_type,
      comment: row.table_comment
    }));

    res.json({
      success: true,
      tables
    });

  } catch (error) {
    console.error('❌ TQL Tables Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Obter campos de uma tabela
 */
router.get('/tql/tables/:tableName/fields', authenticateToken, async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Consultar campos da tabela
    const result = await tqlEngine.executeSQL(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        column_comment
      FROM information_schema.columns 
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [tableName]);

    const fields = result.rows.map(row => ({
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === 'YES',
      default: row.column_default,
      maxLength: row.character_maximum_length,
      comment: row.column_comment
    }));

    res.json({
      success: true,
      table: tableName,
      fields
    });

  } catch (error) {
    console.error('❌ TQL Table Fields Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Salvar query favorita
 */
router.post('/tql/favorites', authenticateToken, async (req, res) => {
  try {
    const { name, query, description } = req.body;
    
    if (!name || !query) {
      return res.status(400).json({
        success: false,
        error: 'Nome e query são obrigatórios'
      });
    }

    // Simular salvamento (implementar com banco real)
    const favorite = {
      id: Date.now(),
      name,
      query,
      description,
      userId: req.user.id,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      favorite,
      message: 'Query salva nos favoritos'
    });

  } catch (error) {
    console.error('❌ TQL Save Favorite Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Obter queries favoritas
 */
router.get('/tql/favorites', authenticateToken, async (req, res) => {
  try {
    // Simular carregamento de favoritos
    const favorites = [
      {
        id: 1,
        name: 'Vendas do Mês',
        query: 'SOMAR valor DE vendas ONDE data MAIOR DIA(-30)',
        description: 'Total de vendas dos últimos 30 dias',
        userId: req.user.id,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ];

    res.json({
      success: true,
      favorites
    });

  } catch (error) {
    console.error('❌ TQL Favorites Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Funções auxiliares
 */

// Obter sugestões de tabelas
async function getTableSuggestions(query) {
  try {
    const result = await tqlEngine.executeSQL(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
      LIMIT 20
    `);

    return result.rows.map(row => row.table_name);
  } catch (error) {
    return [];
  }
}

// Obter sugestões de campos
async function getFieldSuggestions(query) {
  try {
    // Extrair nome da tabela da query
    const tableMatch = query.match(/DE\s+(\w+)/i);
    if (!tableMatch) return [];

    const tableName = tableMatch[1];
    
    const result = await tqlEngine.executeSQL(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [tableName]);

    return result.rows.map(row => row.column_name);
  } catch (error) {
    return [];
  }
}

module.exports = router;
