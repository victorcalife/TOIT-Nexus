/**
 * 🔗 TQL ROUTES - Integração Completa
 * Sistema de BI interativo com TQL Engine
 */

const express = require('express');
const router = express.Router();

// Importar componentes TQL
const { TQLEngine } = require('../services/tqlEngine');
const { SQLGenerator } = require('../services/tqlSQLGenerator');
const { VisualizationEngine } = require('../services/tqlVisualization');

// Instância global do TQL Engine
let tqlEngine = null;

/**
 * Inicializar TQL Engine
 */
function initializeTQLEngine(database) {
    if (!tqlEngine) {
        tqlEngine = new TQLEngine(database);
        console.log('🧠 TQL Engine inicializado nas rotas');
    }
    return tqlEngine;
}

// Middleware de validação TQL
const validateTQLRequest = (req, res, next) => {
    const { tql } = req.body;
    if (!tql) {
        return res.status(400).json({
            success: false,
            error: 'TQL query é obrigatória'
        });
    }
    next();
};

// Middleware de autenticação 
const requireAuth = (req, res, next) => {
    // Usar sistema de auth existente ou mock para desenvolvimento
    req.user = req.user || { id: 'demo_user', role: 'admin' };
    next();
};

/**
 * Configurar rotas TQL
 */
function setupTQLRoutes(tqlController) {
    
    // ===== QUERIES =====
    
    /**
     * Executar query TQL
     * POST /api/tql/execute
     */
    router.post('/execute', requireAuth, validateTQLRequest, async (req, res) => {
        try {
            console.log('🔍 Executando query TQL');
            
            const { tql, schemaId = 'default', format = 'dashboard' } = req.body;
            
            // Inicializar engine
            const engine = initializeTQLEngine(req.database);
            
            // Processar query TQL
            const result = await engine.processQuery(tql, schemaId);
            
            console.log('✅ TQL processado com sucesso');
            res.json({
                success: true,
                data: result,
                queryType: engine.detectQueryType(tql),
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Erro executando TQL:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    /**
     * Parsear e validar query TQL
     * POST /api/tql/parse
     */
    router.post('/parse', requireAuth, async (req, res) => {
        try {
            const { tql } = req.body;
            
            if (!tql) {
                return res.status(400).json({
                    success: false,
                    error: 'TQL query é obrigatória'
                });
            }
            
            const engine = initializeTQLEngine(req.database);
            
            // Detectar tipo e fazer parse
            const queryType = engine.detectQueryType(tql);
            
            let parseResult = {};
            
            if (queryType === 'dashboard') {
                parseResult = engine.dashboardParser.parse(tql);
            } else if (queryType === 'variable') {
                parseResult = {
                    type: 'variable',
                    definition: tql.trim()
                };
            } else {
                parseResult = {
                    type: 'simple',
                    query: tql.trim()
                };
            }
            
            res.json({
                success: true,
                queryType: queryType,
                parsed: parseResult,
                valid: true
            });
            
        } catch (error) {
            console.error('❌ Erro no parse TQL:', error);
            res.json({
                success: false,
                queryType: 'unknown',
                parsed: null,
                valid: false,
                error: error.message
            });
        }
    });
    
    /**
     * Obter sugestões de autocomplete
     * GET /api/tql/autocomplete?query=...&position=...
     */
    router.get('/autocomplete', requireAuth, async (req, res) => {
        await tqlController.getAutocompleteSuggestions(req, res);
    });
    
    // ===== QUERIES SALVAS =====
    
    /**
     * Listar queries salvas
     * GET /api/tql/queries
     */
    router.get('/queries', requireAuth, async (req, res) => {
        await tqlController.getSavedQueries(req, res);
    });
    
    /**
     * Obter query salva específica
     * GET /api/tql/queries/:id
     */
    router.get('/queries/:id', requireAuth, async (req, res) => {
        await tqlController.getSavedQuery(req, res);
    });
    
    /**
     * Salvar nova query
     * POST /api/tql/queries
     */
    router.post('/queries', requireAuth, validateTQLRequest, async (req, res) => {
        await tqlController.saveQuery(req, res);
    });
    
    /**
     * Deletar query salva
     * DELETE /api/tql/queries/:id
     */
    router.delete('/queries/:id', requireAuth, async (req, res) => {
        await tqlController.deleteQuery(req, res);
    });
    
    // ===== DASHBOARDS =====
    
    /**
     * Listar dashboards
     * GET /api/tql/dashboards
     */
    router.get('/dashboards', requireAuth, async (req, res) => {
        await tqlController.getDashboards(req, res);
    });
    
    /**
     * Obter dashboard específico
     * GET /api/tql/dashboards/:id
     */
    router.get('/dashboards/:id', requireAuth, async (req, res) => {
        await tqlController.getDashboard(req, res);
    });
    
    /**
     * Criar novo dashboard
     * POST /api/tql/dashboards
     */
    router.post('/dashboards', requireAuth, validateTQLRequest, async (req, res) => {
        await tqlController.createDashboard(req, res);
    });
    
    /**
     * Atualizar dashboard
     * PUT /api/tql/dashboards/:id
     */
    router.put('/dashboards/:id', requireAuth, validateTQLRequest, async (req, res) => {
        await tqlController.updateDashboard(req, res);
    });
    
    /**
     * Deletar dashboard
     * DELETE /api/tql/dashboards/:id
     */
    router.delete('/dashboards/:id', requireAuth, async (req, res) => {
        await tqlController.deleteDashboard(req, res);
    });
    
    /**
     * Executar dashboard (todos os widgets)
     * POST /api/tql/dashboards/:id/execute
     */
    router.post('/dashboards/:id/execute', requireAuth, async (req, res) => {
        await tqlController.executeDashboard(req, res);
    });
    
    // ===== WIDGETS =====
    
    /**
     * Criar widget
     * POST /api/tql/widgets
     */
    router.post('/widgets', requireAuth, validateTQLRequest, async (req, res) => {
        await tqlController.createWidget(req, res);
    });
    
    /**
     * Obter widget específico
     * GET /api/tql/widgets/:id
     */
    router.get('/widgets/:id', requireAuth, async (req, res) => {
        await tqlController.getWidget(req, res);
    });
    
    /**
     * Executar widget específico
     * POST /api/tql/widgets/:id/execute
     */
    router.post('/widgets/:id/execute', requireAuth, async (req, res) => {
        await tqlController.executeWidget(req, res);
    });
    
    // ===== SISTEMA E METADADOS =====
    
    /**
     * Obter schema de dados disponível
     * GET /api/tql/schema
     */
    router.get('/schema', requireAuth, async (req, res) => {
        try {
            // Schema discovery - listar tabelas disponíveis
            const client = req.database || req.app.locals.database;
            
            if (!client) {
                return res.status(500).json({
                    success: false,
                    error: 'Conexão com banco de dados não disponível'
                });
            }
            
            const tablesResult = await client.query(`
                SELECT table_name, table_schema 
                FROM information_schema.tables 
                WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
                ORDER BY table_name
            `);
            
            const schemas = {};
            
            for (const table of tablesResult.rows) {
                const tableName = table.table_name;
                
                // Descobrir colunas da tabela
                const columnsResult = await client.query(`
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns 
                    WHERE table_name = $1 AND table_schema = $2
                    ORDER BY ordinal_position
                `, [tableName, table.table_schema]);
                
                schemas[tableName] = {
                    name: tableName,
                    schema: table.table_schema,
                    columns: columnsResult.rows.map(col => ({
                        name: col.column_name,
                        type: col.data_type,
                        nullable: col.is_nullable === 'YES'
                    }))
                };
            }
            
            console.log('📊 Schemas descobertos:', Object.keys(schemas).length, 'tabelas');
            
            res.json({
                success: true,
                schemas: schemas,
                count: Object.keys(schemas).length
            });
            
        } catch (error) {
            console.error('❌ Erro descobrindo schemas:', error);
            res.status(500).json({
                success: false,
                error: 'Erro ao descobrir schemas do banco de dados'
            });
        }
    });
    
    /**
     * Obter funções TQL disponíveis
     * GET /api/tql/functions
     */
    router.get('/functions', requireAuth, async (req, res) => {
        await tqlController.getTQLFunctions(req, res);
    });
    
    /**
     * Obter histórico de queries executadas
     * GET /api/tql/history?limit=50&offset=0
     */
    router.get('/history', requireAuth, async (req, res) => {
        await tqlController.getQueryHistory(req, res);
    });
    
    /**
     * Obter estatísticas do sistema TQL
     * GET /api/tql/stats
     */
    router.get('/stats', requireAuth, async (req, res) => {
        await tqlController.getStats(req, res);
    });
    
    /**
     * Limpar cache de queries
     * POST /api/tql/cache/clear
     */
    router.post('/cache/clear', requireAuth, async (req, res) => {
        await tqlController.clearCache(req, res);
    });
    
    // ===== ENDPOINTS DE DEMONSTRAÇÃO =====
    
    /**
     * Endpoint de demonstração com exemplos TQL
     * GET /api/tql/examples
     */
    router.get('/examples', async (req, res) => {
        try {
            const examples = [
                {
                    name: 'KPI Simples - Vendas do Mês',
                    description: 'KPI básico com valor monetário',
                    tql: 'vendas_mes = SOMAR valor DE vendas ONDE data EM MES(0);\nDASHBOARD "Vendas Mensais":\n    KPI vendas_mes TITULO "Vendas do Mês", MOEDA R$;',
                    category: 'básico'
                },
                {
                    name: 'Dashboard RH Completo',
                    description: 'Dashboard com múltiplos KPIs e gráficos',
                    tql: 'total_funcionarios = CONTAR funcionarios ONDE status = "ativo";\nsalario_medio = MEDIA salario DE funcionarios;\nturnover = CONTAR demissoes DE funcionarios ONDE data EM MES(0);\n\nDASHBOARD "Recursos Humanos":\n    KPI total_funcionarios TITULO "Funcionários Ativos";\n    KPI salario_medio TITULO "Salário Médio", MOEDA R$;\n    KPI turnover TITULO "Demissões este Mês", COR vermelho;\n    GRAFICO pizza DE funcionarios AGRUPADO POR departamento;',
                    category: 'dashboard'
                },
                {
                    name: 'Top Vendedores',
                    description: 'Ranking de melhores vendedores',
                    tql: 'TOP 10 vendedores POR comissao DE vendas ONDE data EM ANO(0);',
                    category: 'ranking'
                },
                {
                    name: 'Análise Temporal',
                    description: 'Comparação de períodos com funções temporais',
                    tql: 'vendas_atual = SOMAR valor DE vendas ONDE data EM MES(0);\nvendas_anterior = SOMAR valor DE vendas ONDE data EM MES(-1);\ncrescimento = (vendas_atual - vendas_anterior) / vendas_anterior * 100;\n\nDASHBOARD "Crescimento Mensal":\n    KPI vendas_atual TITULO "Vendas Atuais", MOEDA R$;\n    KPI crescimento TITULO "Crescimento %", FORMATO %, COR verde SE >0, COR vermelho SE <0;',
                    category: 'temporal'
                },
                {
                    name: 'Gráficos Diversos',
                    description: 'Diferentes tipos de visualização',
                    tql: 'DASHBOARD "Visualizações":\n    GRAFICO barras DE vendas AGRUPADO POR trimestre TITULO "Vendas Trimestrais";\n    GRAFICO linha DE crescimento PERIODO ULTIMOS MES(12) TITULO "Tendência Anual";\n    GRAFICO gauge DE sla MINIMO 0, MAXIMO 100, META 95 TITULO "SLA Compliance";',
                    category: 'gráficos'
                },
                {
                    name: 'Análise ITSM',
                    description: 'Dashboard para suporte técnico',
                    tql: 'tickets_abertos = CONTAR tickets DE suporte ONDE status = "aberto";\nsla_compliance = MEDIA sla_ok DE tickets ONDE resolucao EM MES(0) * 100;\nsatisfacao = MEDIA nota_satisfacao DE pesquisas ONDE data EM MES(0);\n\nDASHBOARD "Suporte Técnico":\n    KPI tickets_abertos TITULO "Tickets Abertos", COR vermelho SE >50;\n    KPI sla_compliance TITULO "SLA Compliance", FORMATO %, COR verde SE >95;\n    KPI satisfacao TITULO "Satisfação Cliente", FORMATO decimal;\n    GRAFICO pizza DE tickets AGRUPADO POR categoria;',
                    category: 'itsm'
                },
                {
                    name: 'Métricas Financeiras',
                    description: 'KPIs financeiros com condições',
                    tql: 'receita_mes = SOMAR receita DE financeiro ONDE data EM MES(0);\ndespesas_mes = SOMAR despesas DE gastos ONDE data EM MES(0);\nlucro_bruto = receita_mes - despesas_mes;\nmargem_lucro = lucro_bruto / receita_mes * 100;\n\nDASHBOARD "Financeiro":\n    KPI receita_mes TITULO "Receita Mensal", MOEDA R$;\n    KPI lucro_bruto TITULO "Lucro Bruto", MOEDA R$;\n    KPI margem_lucro TITULO "Margem de Lucro", FORMATO %, COR verde SE >20, COR amarelo SE >10, COR vermelho SE <=10;',
                    category: 'financeiro'
                },
                {
                    name: 'Query Simples',
                    description: 'Consulta básica sem dashboard',
                    tql: 'CONTAR funcionarios ONDE departamento = "TI" E salario > 5000;',
                    category: 'simples'
                }
            ];
            
            res.json({
                success: true,
                examples,
                totalExamples: examples.length,
                categories: ['básico', 'dashboard', 'ranking', 'temporal', 'gráficos', 'itsm', 'financeiro', 'simples']
            });
            
        } catch (error) {
            console.error('❌ Erro ao obter exemplos:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    });
    
    /**
     * Endpoint de teste com dados mock
     * POST /api/tql/test
     */
    router.post('/test', async (req, res) => {
        try {
            const { tql } = req.body;
            
            if (!tql) {
                return res.status(400).json({
                    success: false,
                    error: 'TQL query é obrigatória'
                });
            }
            
            console.log('🧪 Teste TQL com dados mock:', tql);
            
            // Mock database para testes
            const mockDatabase = {
                query: async (sql) => {
                    console.log('📊 Mock query:', sql);
                    // Retornar dados mock baseados na query
                    return {
                        rows: [
                            { value: Math.floor(Math.random() * 100000) }
                        ]
                    };
                }
            };
            
            const engine = new TQLEngine(mockDatabase);
            const result = await engine.processQuery(tql, 'mock-schema');
            
            res.json({
                success: true,
                data: result,
                mock: true,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Erro no teste TQL:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                mock: true
            });
        }
    });
    
    /**
     * Endpoint de documentação TQL
     * GET /api/tql/documentation
     */
    router.get('/documentation', async (req, res) => {
        try {
            const documentation = {
                overview: {
                    title: 'TQL - TOIT Query Language',
                    description: 'Linguagem de consulta simplificada para análises complexas de dados ITSM',
                    version: '1.0.0'
                },
                syntax: {
                    basic: 'SHOW [campos] FROM [entidade] WHERE [condições]',
                    aggregation: 'SHOW [função(campo)] FROM [entidade] GROUP BY [campo]',
                    filtering: 'SHOW [campos] FROM [entidade] WHERE [campo] = [valor]',
                    sorting: 'SHOW [campos] FROM [entidade] ORDER BY [campo] [ASC|DESC]',
                    limiting: 'SHOW [campos] FROM [entidade] LIMIT [número]'
                },
                entities: {
                    tickets: 'Tickets de suporte e incidentes',
                    problems: 'Problemas e análise de causa raiz',
                    changes: 'Requests de mudança',
                    releases: 'Releases e deployments',
                    users: 'Usuários e colaboradores'
                },
                functions: {
                    aggregation: ['COUNT(*)', 'AVG(campo)', 'SUM(campo)', 'MIN(campo)', 'MAX(campo)'],
                    time: ['THIS_MONTH()', 'LAST_MONTH()', 'THIS_QUARTER()', 'LAST_7_DAYS()'],
                    itsm: ['SLA_COMPLIANCE(entity)', 'MTTR(entity)', 'FIRST_CALL_RESOLUTION()', 'CUSTOMER_SATISFACTION(period)'],
                    analytics: ['TREND(metric, period)', 'COMPARE_PERIOD(metric, p1, p2)', 'GROWTH_RATE(metric, period)']
                },
                examples: {
                    basic: 'SHOW title, status FROM tickets',
                    filtered: 'SHOW * FROM tickets WHERE priority = "high"',
                    aggregated: 'SHOW status, COUNT(*) FROM tickets GROUP BY status',
                    time_based: 'SHOW COUNT(*) FROM tickets WHERE THIS_MONTH()',
                    complex: 'SHOW assignee, AVG(resolution_time) FROM tickets WHERE resolved_at IS NOT NULL AND THIS_QUARTER() GROUP BY assignee ORDER BY AVG(resolution_time) ASC'
                }
            };
            
            res.json({
                success: true,
                documentation
            });
            
        } catch (error) {
            console.error('❌ Erro ao obter documentação:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    });
    
    return router;
}

module.exports = setupTQLRoutes;