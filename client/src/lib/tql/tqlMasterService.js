/**
 * TQL MASTER SERVICE - Integração Completa de Todos os Componentes TQL
 * Orquestra: TQLEngine + TQLService + SQLGenerator + Visualization + ColorService
 * Sistema completo de Business Intelligence em Português
 */

const { TQLEngine } = require('./tqlEngine.js');
const TQLService = require('./tqlService.js');
const { SQLGenerator } = require('./tqlSQLGenerator.js');  
const { VisualizationEngine } = require('./tqlVisualization.js');
const ColorService = require('./colorService.js');
const DatabaseConnectionService = require('./databaseConnectionService.js');

class TQLMasterService {
    constructor(database) {
        this.database = database;
        
        // Inicializar todos os componentes
        this.tqlEngine = new TQLEngine(database);
        this.tqlService = new TQLService(database);
        this.sqlGenerator = new SQLGenerator('postgres');
        this.visualizationEngine = new VisualizationEngine();
        this.colorService = new ColorService(database);
        this.dbService = new DatabaseConnectionService();
        
        // Estado de conexões
        this.activeConnections = new Map();
        this.queryCache = new Map();
        
        console.log('🚀 TQL Master Service inicializado com todos os componentes');
    }
    
    /**
     * MÉTODO PRINCIPAL: Processa qualquer tipo de entrada TQL
     */
    async processTQL(input, options = {}) {
        const { 
            userId = 'anonymous', 
            schemaId = 'default',
            connectionId = null,
            format = 'json',
            useCache = true 
        } = options;
        
        try {
            console.log('🧠 Processando TQL Master:', input.substring(0, 100) + '...');
            
            // 1. Detectar tipo de entrada
            const inputType = this.detectInputType(input);
            console.log('🔍 Tipo detectado:', inputType);
            
            // 2. Processar baseado no tipo
            let result;
            switch (inputType) {
                case 'dashboard':
                    result = await this.processDashboard(input, userId, schemaId);
                    break;
                case 'simple_query':
                    result = await this.processSimpleQuery(input, connectionId, userId);
                    break;
                case 'variable_definition':
                    result = await this.processVariable(input, userId, schemaId);
                    break;
                case 'chart_definition':
                    result = await this.processChart(input, connectionId, userId);
                    break;
                default:
                    throw new Error(`Tipo de entrada TQL não reconhecido: ${inputType}`);
            }
            
            // 3. Aplicar formatação se necessário
            if (format !== 'json') {
                result = await this.formatOutput(result, format);
            }
            
            console.log('✅ TQL processado com sucesso');
            return result;
            
        } catch (error) {
            console.error('❌ Erro no TQL Master:', error.message);
            return {
                success: false,
                error: error.message,
                suggestion: this.getSuggestion(error.message),
                inputType: this.detectInputType(input)
            };
        }
    }
    
    /**
     * Detecta o tipo de entrada TQL
     */
    detectInputType(input) {
        const trimmed = input.trim();
        
        // Dashboard completo
        if (/DASHBOARD\s+"[^"]+"\s*:/i.test(trimmed)) {
            return 'dashboard';
        }
        
        // Definição de variável
        if (/^\s*\w+\s*=\s*.+/m.test(trimmed)) {
            return 'variable_definition';
        }
        
        // Definição de gráfico
        if (/^(GRAFICO|CHART)\s+(barras|linha|pizza|area|gauge)\s+/i.test(trimmed)) {
            return 'chart_definition';
        }
        
        // Query simples
        if (/^(BUSCAR|MOSTRAR|SOMAR|CONTAR|MEDIA|MAX|MIN)\s+/i.test(trimmed)) {
            return 'simple_query';
        }
        
        return 'unknown';
    }
    
    /**
     * Processa dashboard completo usando TQLEngine
     */
    async processDashboard(input, userId, schemaId) {
        console.log('📊 Processando dashboard completo...');
        
        // 1. Usar TQLEngine para parse completo
        const dashboard = await this.tqlEngine.processDashboard(input, schemaId);
        
        // 2. Executar queries de cada widget
        for (const widget of dashboard.widgets) {
            if (widget.data) {
                const queryResult = await this.executeWidgetQuery(widget, userId);
                widget.executedData = queryResult.data;
                widget.sql = queryResult.sql;
            }
        }
        
        // 3. Gerar configurações visuais
        for (const widget of dashboard.widgets) {
            const visualConfig = this.visualizationEngine.configure(widget, widget.executedData || []);
            widget.visualization = visualConfig;
            
            // 4. Aplicar cores personalizadas do usuário
            if (widget.type === 'chart') {
                const userPalette = await this.colorService.getUserColorPalette(userId);
                const colors = this.colorService.generateColorsForDataset(
                    widget.executedData?.length || 5,
                    userPalette
                );
                widget.visualization.colors = colors;
            }
        }
        
        return {
            success: true,
            type: 'dashboard',
            dashboard: dashboard,
            renderReady: true
        };
    }
    
    /**
     * Processa query simples
     */
    async processSimpleQuery(input, connectionId, userId) {
        console.log('🔍 Processando query simples...');
        
        // 1. Traduzir TQL para SQL
        const sql = this.tqlService.translateTQL(input);
        console.log('📝 SQL gerado:', sql);
        
        // 2. Executar query
        let result;
        if (connectionId && this.activeConnections.has(connectionId)) {
            // Usar conexão específica
            result = await this.executeOnConnection(sql, connectionId);
        } else {
            // Usar conexão padrão ou mock data
            result = await this.executeWithFallback(sql, input);
        }
        
        // 3. Aplicar visualização se necessário
        const visualization = this.shouldAutoVisualize(result.data) ?
            this.createAutoVisualization(result.data, userId) : null;
        
        return {
            success: true,
            type: 'simple_query',
            originalTQL: input,
            sql: sql,
            data: result.data,
            count: result.count,
            visualization: visualization
        };
    }
    
    /**
     * Processa definição de variável
     */
    async processVariable(input, userId, schemaId) {
        console.log('🧮 Processando variável...');
        
        // Parse da definição
        const match = input.match(/^\s*(\w+)\s*=\s*(.+)/);
        if (!match) {
            throw new Error('Formato de variável inválido. Use: variavel = definição');
        }
        
        const [, varName, definition] = match;
        
        // Calcular valor
        const calculator = this.tqlEngine.variableCalculator;
        const value = await calculator.calculate(
            { name: varName, definition: definition },
            new Map(),
            schemaId
        );
        
        return {
            success: true,
            type: 'variable',
            name: varName,
            definition: definition,
            value: value,
            formatted: this.formatNumber(value)
        };
    }
    
    /**
     * Processa definição de gráfico
     */
    async processChart(input, connectionId, userId) {
        console.log('📈 Processando gráfico...');
        
        // Parse da definição do gráfico
        const chartConfig = this.parseChartDefinition(input);
        
        // Executar query de dados
        const dataResult = await this.processSimpleQuery(chartConfig.dataQuery, connectionId, userId);
        
        // Configurar visualização
        const widget = {
            type: 'chart',
            chartType: chartConfig.type,
            title: chartConfig.title,
            config: chartConfig.config
        };
        
        const visualization = this.visualizationEngine.configure(widget, dataResult.data);
        
        // Aplicar cores personalizadas
        const userPalette = await this.colorService.getUserColorPalette(userId);
        const colors = this.colorService.generateColorsForDataset(
            dataResult.data.length,
            userPalette
        );
        visualization.colors = colors;
        
        return {
            success: true,
            type: 'chart',
            chartType: chartConfig.type,
            data: dataResult.data,
            visualization: visualization,
            renderReady: true
        };
    }
    
    /**
     * Parse de definição de gráfico
     */
    parseChartDefinition(input) {
        // GRAFICO barras DE vendas TITULO "Vendas por Mês" CORES azul
        const match = input.match(/^(?:GRAFICO|CHART)\s+(\w+)\s+DE\s+(.+?)(?:\s+TITULO\s+"([^"]+)")?(?:\s+CORES\s+(\w+|\[[^\]]+\]))?/i);
        
        if (!match) {
            throw new Error('Formato de gráfico inválido');
        }
        
        const [, type, dataQuery, title, colors] = match;
        
        return {
            type: type.toLowerCase(),
            dataQuery: dataQuery.trim(),
            title: title || 'Gráfico',
            config: {
                colors: colors ? this.parseColors(colors) : ['corporativa']
            }
        };
    }
    
    /**
     * Parse de cores
     */
    parseColors(colorStr) {
        if (colorStr.startsWith('[') && colorStr.endsWith(']')) {
            return colorStr.slice(1, -1).split(',').map(c => c.trim());
        }
        return [colorStr];
    }
    
    /**
     * Executa query em widget específico
     */
    async executeWidgetQuery(widget, userId) {
        try {
            if (widget.type === 'kpi') {
                // KPI usa variável já calculada
                return {
                    data: { value: widget.data || 0 },`
                    sql: `-- KPI: ${widget.variable}`
                };
            }
            
            if (widget.data && typeof widget.data === 'string') {
                // Widget tem query de dados
                return await this.processSimpleQuery(widget.data, null, userId);
            }
            
            return { data: [], sql: '-- No data query' };
            
        } catch (error) {
            console.error('❌ Erro executando widget query:', error.message);
            return { 
                data: [], 
                sql: '-- Error in query',
                error: error.message 
            };
        }
    }
    
    /**
     * Executa query na conexão específica
     */
    async executeOnConnection(sql, connectionId) {
        const connection = this.activeConnections.get(connectionId);
        if (!connection) {
            throw new Error('Conexão não encontrada');
        }
        
        return await this.dbService.executeQuery(sql);
    }
    
    /**
     * Executa query com fallback para mock data
     */
    async executeWithFallback(sql, originalTQL) {
        try {
            // Tentar executar no banco ativo
            if (this.dbService.activeConnection) {
                return await this.dbService.executeQuery(sql);
            }
            
            // Fallback para mock data baseado na query original
            return this.generateMockData(originalTQL);
            
        } catch (error) {
            console.warn('⚠️ Fallback para mock data:', error.message);
            return this.generateMockData(originalTQL);
        }
    }
    
    /**
     * Gera dados mock baseados na query
     */
    generateMockData(tqlQuery) {
        const query = tqlQuery.toLowerCase();
        
        if (query.includes('vendas')) {
            return {
                data: [
                    { mes: 'Janeiro', valor: 15000 },
                    { mes: 'Fevereiro', valor: 18000 },
                    { mes: 'Março', valor: 22000 },
                    { mes: 'Abril', valor: 19000 },
                    { mes: 'Maio', valor: 25000 }
                ],
                count: 5
            };
        }
        
        if (query.includes('funcionarios') || query.includes('users')) {
            return {
                data: [
                    { nome: 'Victor Calife', departamento: 'TI', salario: 8500 },
                    { nome: 'Ana Silva', departamento: 'RH', salario: 7200 },
                    { nome: 'João Santos', departamento: 'Vendas', salario: 6800 },
                    { nome: 'Maria Costa', departamento: 'TI', salario: 7800 }
                ],
                count: 4
            };
        }
        
        if (query.includes('tickets')) {
            return {
                data: [
                    { status: 'Aberto', quantidade: 12 },
                    { status: 'Em Andamento', quantidade: 8 },
                    { status: 'Resolvido', quantidade: 45 },
                    { status: 'Fechado', quantidade: 32 }
                ],
                count: 4
            };
        }
        
        // Mock genérico
        return {
            data: [
                { categoria: 'A', valor: 100 },
                { categoria: 'B', valor: 200 },
                { categoria: 'C', valor: 150 }
            ],
            count: 3
        };
    }
    
    /**
     * Verifica se deve criar visualização automática
     */
    shouldAutoVisualize(data) {
        return Array.isArray(data) && 
               data.length > 0 && 
               data.length <= 20 &&
               data.every(row => typeof row === 'object');
    }
    
    /**
     * Cria visualização automática
     */
    async createAutoVisualization(data, userId) {
        const keys = Object.keys(data[0] || {});
        const hasNumericData = keys.some(key => 
            data.every(row => typeof row[key] === 'number')
        );
        
        if (!hasNumericData) return null;
        
        // Criar widget automático
        const widget = {
            type: 'chart',
            chartType: data.length <= 10 ? 'barras' : 'linha',
            title: 'Visualização Automática',
            config: { colors: ['corporativa'] }
        };
        
        const visualization = this.visualizationEngine.configure(widget, data);
        
        // Aplicar cores do usuário
        const userPalette = await this.colorService.getUserColorPalette(userId);
        const colors = this.colorService.generateColorsForDataset(data.length, userPalette);
        visualization.colors = colors;
        
        return visualization;
    }
    
    /**
     * Formatar saída
     */
    async formatOutput(result, format) {
        switch (format) {
            case 'csv':
                return this.toCSV(result.data);
            case 'excel':
                return this.toExcel(result.data);
            case 'pdf':
                return this.toPDF(result);
            case 'html':
                return this.toHTML(result);
            default:
                return result;
        }
    }
    
    /**
     * Converter para CSV
     */
    toCSV(data) {
        if (!Array.isArray(data) || data.length === 0) return '';
        
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(',')).join('\n');
        
        return headers + '\n' + rows;
    }
    
    /**
     * Formatar número
     */
    formatNumber(value) {
        if (typeof value === 'number') {
            return new Intl.NumberFormat('pt-BR').format(value);
        }
        return value;
    }
    
    /**
     * Obter sugestão para erro
     */
    getSuggestion(errorMessage) {
        if (errorMessage.includes('não encontrada') || errorMessage.includes('not found')) {
            return 'Verifique se o nome da tabela ou campo está correto';
        }
        if (errorMessage.includes('sintaxe') || errorMessage.includes('syntax')) {
            return 'Verifique a sintaxe TQL. Use: AÇÃO campo DE tabela ONDE condições';
        }
        if (errorMessage.includes('conexão') || errorMessage.includes('connection')) {
            return 'Configure uma conexão de banco de dados primeiro';
        }
        return 'Consulte o manual TQL ou entre em contato com o suporte';
    }
    
    /**
     * Obter estatísticas do sistema
     */
    getSystemStats() {
        return {
            activeConnections: this.activeConnections.size,
            cacheSize: this.queryCache.size,
            componentsLoaded: {
                tqlEngine: !!this.tqlEngine,
                tqlService: !!this.tqlService,
                sqlGenerator: !!this.sqlGenerator,
                visualizationEngine: !!this.visualizationEngine,
                colorService: !!this.colorService
            }
        };
    }
}

module.exports = TQLMasterService;`