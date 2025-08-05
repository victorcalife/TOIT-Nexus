/**
 * TQL Controller
 * Controlador para o sistema de BI interativo com TQL (TOIT Query Language)
 */

const TQLService = require('../services/tqlService');

class TQLController {
    constructor(database) {
        this.database = database;
        this.tqlService = null;
    }
    
    async initialize() {
        this.tqlService = new TQLService(this.database);
        await this.tqlService.initialize();
        console.log('✅ TQL Controller inicializado');
    }
    
    /**
     * Executar query TQL
     */
    async executeQuery(req, res) {
        try {
            const { tql, options = {} } = req.body;
            
            if (!tql) {
                return res.status(400).json({
                    success: false,
                    error: 'Query TQL é obrigatória'
                });
            }
            
            const result = await this.tqlService.executeTQL(tql, {
                ...options,
                user: req.user?.id || 'anonymous'
            });
            
            res.json(result);
            
        } catch (error) {
            console.error('❌ Erro ao executar query TQL:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Validar e parsear query TQL
     */
    async parseQuery(req, res) {
        try {
            const { tql } = req.body;
            
            if (!tql) {
                return res.status(400).json({
                    success: false,
                    error: 'Query TQL é obrigatória'
                });
            }
            
            const parseResult = this.tqlService.parseTQL(tql);
            res.json(parseResult);
            
        } catch (error) {
            console.error('❌ Erro ao parsear query TQL:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Obter sugestões de autocomplete TQL 3.0 PLUS - INTELIGENTE
     */
    async getAutocompleteSuggestions(req, res) {
        try {
            const { query = '', position = 0 } = req.query;
            
            const suggestions = this.tqlService.getAutocompleteSuggestions(query, parseInt(position));
            
            // 🎯 Enriquecer sugestões com metadados para UI
            const enrichedSuggestions = suggestions.map(suggestion => ({
                ...suggestion,
                // Ícones por tipo
                icon: this.getSuggestionIcon(suggestion.type),
                // Categorias para agrupamento
                category: this.getSuggestionCategory(suggestion.type),
                // Ranking de relevância
                priority: this.getSuggestionPriority(suggestion.type, query)
            }));
            
            // 📊 Agrupar por categoria para UI melhor
            const grouped = this.groupSuggestionsByCategory(enrichedSuggestions);
            
            res.json({
                success: true,
                suggestions: enrichedSuggestions,
                grouped,
                query,
                total: enrichedSuggestions.length
            });
            
        } catch (error) {
            console.error('❌ Erro ao obter sugestões:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Obter ícone por tipo de sugestão
     */
    getSuggestionIcon(type) {
        const icons = {
            'function': '⚙️',
            'entity': '📋',
            'field': '🏷️',
            'temporal': '📅',
            'number': '🔢',
            'list': '📝',
            'keyword': '🔤'
        };
        return icons[type] || '💡';
    }
    
    /**
     * Obter categoria da sugestão
     */
    getSuggestionCategory(type) {
        const categories = {
            'function': 'Funções',
            'entity': 'Tabelas',
            'field': 'Campos',
            'temporal': 'Tempo',
            'number': 'Números',
            'list': 'Listas',
            'keyword': 'Palavras-chave'
        };
        return categories[type] || 'Geral';
    }
    
    /**
     * Calcular prioridade da sugestão
     */
    getSuggestionPriority(type, query) {
        const priorities = {
            'function': 10,
            'entity': 8,
            'field': 6,
            'temporal': 7,
            'number': 5,
            'list': 4,
            'keyword': 3
        };
        
        // Boost se corresponde exatamente ao início
        const boost = query && type === 'function' ? 2 : 0;
        return (priorities[type] || 1) + boost;
    }
    
    /**
     * Agrupar sugestões por categoria
     */
    groupSuggestionsByCategory(suggestions) {
        const grouped = {};
        
        suggestions.forEach(suggestion => {
            const category = suggestion.category;
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(suggestion);
        });
        
        // Ordenar cada categoria por prioridade
        Object.keys(grouped).forEach(category => {
            grouped[category].sort((a, b) => b.priority - a.priority);
        });
        
        return grouped;
    }
    
    /**
     * Salvar query TQL
     */
    async saveQuery(req, res) {
        try {
            const { name, tql, description = '', tags = [] } = req.body;
            
            if (!name || !tql) {
                return res.status(400).json({
                    success: false,
                    error: 'Nome e query TQL são obrigatórios'
                });
            }
            
            const savedQuery = await this.tqlService.saveQuery(name, tql, description, tags);
            
            res.json({
                success: true,
                query: savedQuery
            });
            
        } catch (error) {
            console.error('❌ Erro ao salvar query:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Listar queries salvas
     */
    async getSavedQueries(req, res) {
        try {
            const queries = Array.from(this.tqlService.savedQueries.values());
            
            res.json({
                success: true,
                queries
            });
            
        } catch (error) {
            console.error('❌ Erro ao listar queries:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Obter query salva por ID
     */
    async getSavedQuery(req, res) {
        try {
            const { id } = req.params;
            const query = this.tqlService.savedQueries.get(id);
            
            if (!query) {
                return res.status(404).json({
                    success: false,
                    error: 'Query não encontrada'
                });
            }
            
            res.json({
                success: true,
                query
            });
            
        } catch (error) {
            console.error('❌ Erro ao obter query:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Deletar query salva
     */
    async deleteQuery(req, res) {
        try {
            const { id } = req.params;
            
            if (!this.tqlService.savedQueries.has(id)) {
                return res.status(404).json({
                    success: false,
                    error: 'Query não encontrada'
                });
            }
            
            this.tqlService.savedQueries.delete(id);
            
            res.json({
                success: true,
                message: 'Query deletada com sucesso'
            });
            
        } catch (error) {
            console.error('❌ Erro ao deletar query:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Criar dashboard
     */
    async createDashboard(req, res) {
        try {
            const { name, description = '', widgets = [] } = req.body;
            
            if (!name) {
                return res.status(400).json({
                    success: false,
                    error: 'Nome do dashboard é obrigatório'
                });
            }
            
            const dashboard = await this.tqlService.createDashboard(name, description, widgets);
            
            res.json({
                success: true,
                dashboard
            });
            
        } catch (error) {
            console.error('❌ Erro ao criar dashboard:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Listar dashboards
     */
    async getDashboards(req, res) {
        try {
            const dashboards = Array.from(this.tqlService.dashboards.values());
            
            res.json({
                success: true,
                dashboards
            });
            
        } catch (error) {
            console.error('❌ Erro ao listar dashboards:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Obter dashboard por ID
     */
    async getDashboard(req, res) {
        try {
            const { id } = req.params;
            const dashboard = this.tqlService.dashboards.get(id);
            
            if (!dashboard) {
                return res.status(404).json({
                    success: false,
                    error: 'Dashboard não encontrado'
                });
            }
            
            res.json({
                success: true,
                dashboard
            });
            
        } catch (error) {
            console.error('❌ Erro ao obter dashboard:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Executar dashboard (todos os widgets)
     */
    async executeDashboard(req, res) {
        try {
            const { id } = req.params;
            
            const result = await this.tqlService.executeDashboard(id);
            
            res.json({
                success: true,
                ...result
            });
            
        } catch (error) {
            console.error('❌ Erro ao executar dashboard:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Atualizar dashboard
     */
    async updateDashboard(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            
            const dashboard = this.tqlService.dashboards.get(id);
            if (!dashboard) {
                return res.status(404).json({
                    success: false,
                    error: 'Dashboard não encontrado'
                });
            }
            
            // Atualizar campos permitidos
            const allowedFields = ['name', 'description', 'widgets', 'layout', 'shared'];
            for (const field of allowedFields) {
                if (updates[field] !== undefined) {
                    dashboard[field] = updates[field];
                }
            }
            
            dashboard.updated_at = new Date();
            this.tqlService.dashboards.set(id, dashboard);
            
            res.json({
                success: true,
                dashboard
            });
            
        } catch (error) {
            console.error('❌ Erro ao atualizar dashboard:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Deletar dashboard
     */
    async deleteDashboard(req, res) {
        try {
            const { id } = req.params;
            
            if (!this.tqlService.dashboards.has(id)) {
                return res.status(404).json({
                    success: false,
                    error: 'Dashboard não encontrado'
                });
            }
            
            // Deletar widgets associados
            const dashboard = this.tqlService.dashboards.get(id);
            for (const widgetId of dashboard.widgets) {
                this.tqlService.widgets.delete(widgetId);
            }
            
            this.tqlService.dashboards.delete(id);
            
            res.json({
                success: true,
                message: 'Dashboard deletado com sucesso'
            });
            
        } catch (error) {
            console.error('❌ Erro ao deletar dashboard:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Criar widget
     */
    async createWidget(req, res) {
        try {
            const widgetConfig = req.body;
            
            if (!widgetConfig.title || !widgetConfig.tql) {
                return res.status(400).json({
                    success: false,
                    error: 'Título e query TQL do widget são obrigatórios'
                });
            }
            
            const widget = await this.tqlService.createWidget(widgetConfig);
            
            res.json({
                success: true,
                widget
            });
            
        } catch (error) {
            console.error('❌ Erro ao criar widget:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Obter widget por ID
     */
    async getWidget(req, res) {
        try {
            const { id } = req.params;
            const widget = this.tqlService.widgets.get(id);
            
            if (!widget) {
                return res.status(404).json({
                    success: false,
                    error: 'Widget não encontrado'
                });
            }
            
            res.json({
                success: true,
                widget
            });
            
        } catch (error) {
            console.error('❌ Erro ao obter widget:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Executar widget específico
     */
    async executeWidget(req, res) {
        try {
            const { id } = req.params;
            const widget = this.tqlService.widgets.get(id);
            
            if (!widget) {
                return res.status(404).json({
                    success: false,
                    error: 'Widget não encontrado'
                });
            }
            
            const result = await this.tqlService.executeTQL(widget.tql);
            
            res.json({
                success: true,
                widget,
                data: result.data,
                metadata: result.metadata
            });
            
        } catch (error) {
            console.error('❌ Erro ao executar widget:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Obter schema de dados disponível
     */
    async getDataSchema(req, res) {
        try {
            res.json({
                success: true,
                schema: this.tqlService.dataSchema
            });
            
        } catch (error) {
            console.error('❌ Erro ao obter schema:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Obter funções TQL disponíveis
     */
    async getTQLFunctions(req, res) {
        try {
            const functions = Object.keys(this.tqlService.tqlFunctions).map(name => ({
                name,
                description: this.tqlService.getFunctionDescription(name)
            }));
            
            res.json({
                success: true,
                functions
            });
            
        } catch (error) {
            console.error('❌ Erro ao obter funções:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Obter histórico de queries (auditoria)
     */
    async getQueryHistory(req, res) {
        try {
            const { limit = 50, offset = 0 } = req.query;
            
            const history = this.tqlService.auditLog
                .slice(-parseInt(limit) - parseInt(offset))
                .slice(-parseInt(limit));
            
            res.json({
                success: true,
                history,
                total: this.tqlService.auditLog.length
            });
            
        } catch (error) {
            console.error('❌ Erro ao obter histórico:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Limpar cache de queries
     */
    async clearCache(req, res) {
        try {
            this.tqlService.queryCache.clear();
            
            res.json({
                success: true,
                message: 'Cache limpo com sucesso'
            });
            
        } catch (error) {
            console.error('❌ Erro ao limpar cache:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
    
    /**
     * Obter estatísticas do sistema TQL
     */
    async getStats(req, res) {
        try {
            const stats = {
                savedQueries: this.tqlService.savedQueries.size,
                dashboards: this.tqlService.dashboards.size,
                widgets: this.tqlService.widgets.size,
                cacheSize: this.tqlService.queryCache.size,
                totalExecutions: this.tqlService.auditLog.length,
                lastExecution: this.tqlService.auditLog[this.tqlService.auditLog.length - 1]?.timestamp
            };
            
            res.json({
                success: true,
                stats
            });
            
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
}

module.exports = TQLController;