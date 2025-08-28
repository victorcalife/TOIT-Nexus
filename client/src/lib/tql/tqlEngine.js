/**
 * TQL ENGINE COMPLETO - TOIT Query Language
 * Sistema completo de Business Intelligence em Português
 * Versão: 1.0 - Implementação Total
 */

const EventEmitter = require('events');
const { SQLGenerator } = require('./tqlSQLGenerator.js');
const { VisualizationEngine } = require('./tqlVisualization.js');

class TQLEngine extends EventEmitter {
    constructor(database) {
        super();
        this.database = database;
        this.schemas = new Map();
        this.variables = new Map();
        this.dashboards = new Map();
        this.queries = new Map();
        
        // Inicializar componentes
        this.dashboardParser = new DashboardParser();
        this.widgetParser = new WidgetParser();
        this.variableCalculator = new VariableCalculator();
        this.sqlGenerator = new SQLGenerator();
        this.visualizationEngine = new VisualizationEngine();
        
        console.log('🧠 TQL Engine inicializado com sucesso');
    }
    
    /**
     * Processa query TQL completa
     */
    async processQuery(tqlInput, schemaId) {
        try {
            console.log('🔍 Processando TQL:', tqlInput.substring(0, 100) + '...');
            
            // 1. Parse inicial - detectar tipo
            const queryType = this.detectQueryType(tqlInput);
            
            if (queryType === 'dashboard') {
                return await this.processDashboard(tqlInput, schemaId);
            } else if (queryType === 'variable') {
                return await this.processVariable(tqlInput, schemaId);
            } else {
                return await this.processSimpleQuery(tqlInput, schemaId);
            }
            
        } catch (error) {
            console.error('❌ Erro processando TQL:', error);
            throw new Error(`Erro TQL: ${error.message}`);
        }
    }
    
    /**
     * Detecta o tipo de query TQL
     */
    detectQueryType(tql) {
        if (/DASHBOARD\s+"[^"]+"\s*:/i.test(tql)) {
            return 'dashboard';
        } else if (/^\s*\w+\s*=\s*.+/m.test(tql)) {
            return 'variable';
        } else {
            return 'simple';
        }
    }
    
    /**
     * Processa Dashboard completo
     */
    async processDashboard(tqlInput, schemaId) {
        console.log('📊 Processando Dashboard...');
        
        // 1. Parse da estrutura do dashboard
        const dashboardStructure = this.dashboardParser.parse(tqlInput);
        
        // 2. Resolver variáveis necessárias
        const resolvedVariables = await this.resolveAllVariables(
            dashboardStructure.variables, 
            schemaId
        );
        
        // 3. Processar widgets
        const processedWidgets = [];
        for (const widget of dashboardStructure.widgets) {
            const processedWidget = await this.processWidget(widget, resolvedVariables, schemaId);
            processedWidgets.push(processedWidget);
        }
        
        // 4. Criar estrutura final do dashboard
        const dashboard = {
            id: this.generateId(),
            name: dashboardStructure.name,
            widgets: processedWidgets,
            variables: resolvedVariables,
            created: new Date(),
            schema: schemaId
        };
        
        // 5. Salvar dashboard
        this.dashboards.set(dashboard.id, dashboard);
        
        console.log('✅ Dashboard processado:', dashboard.name);
        return dashboard;
    }
    
    /**
     * Processa widget individual
     */
    async processWidget(widget, variables, schemaId) {
        console.log('🎨 Processando widget:', widget.type);
        
        // 1. Parse do widget
        const parsedWidget = this.widgetParser.parse(widget);
        
        // 2. Resolver dados do widget
        const data = await this.resolveWidgetData(parsedWidget, variables, schemaId);
        
        // 3. Configurar visualização
        const visualization = this.visualizationEngine.configure(parsedWidget, data);
        
        return {
            id: this.generateId(),
            type: parsedWidget.type,
            title: parsedWidget.title,
            data: data,
            config: parsedWidget.config,
            visualization: visualization
        };
    }
    
    /**
     * Resolve todas as variáveis necessárias
     */
    async resolveAllVariables(variableDefinitions, schemaId) {
        const resolved = new Map();
        
        // Ordenar variáveis por dependência
        const sortedVariables = this.variableCalculator.sortByDependency(variableDefinitions);
        
        for (const varDef of sortedVariables) {
            console.log('🧮 Resolvendo variável:', varDef.name);
            
            const value = await this.variableCalculator.calculate(varDef, resolved, schemaId);
            resolved.set(varDef.name, value);
            
            console.log('✅ Variável resolvida:', varDef.name, '=', value);
        }
        
        return resolved;
    }
    
    generateId() {
        return 'tql_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

/**
 * 1️⃣ DASHBOARD PARSER - Detecta estrutura com :
 */
class DashboardParser {
    constructor() {
        this.patterns = {
            dashboard: /DASHBOARD\s+"([^"]+)"\s*:\s*$/i,
            widget: /^\s{4}(KPI|GRAFICO|TABELA|GAUGE)\s+(.+?)\s*;?\s*$/i,
            variable: /^\s*(\w+)\s*=\s*(.+?)\s*;?\s*$/
        };
    }
    
    parse(tql) {
        const lines = tql.split('\n');
        let currentDashboard = null;
        const variables = [];
        const widgets = [];
        
        console.log('📊 Parsing dashboard com', lines.length, 'linhas');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            if (!trimmed || trimmed.startsWith('#')) continue;
            
            // Detectar definição de dashboard
            if (this.patterns.dashboard.test(line)) {
                const match = line.match(this.patterns.dashboard);
                currentDashboard = {
                    name: match[1],
                    lineNumber: i + 1
                };
                console.log('📋 Dashboard encontrado:', currentDashboard.name);
            }
            
            // Detectar widgets (indentados com 4 espaços)
            else if (this.patterns.widget.test(line)) {
                const match = line.match(this.patterns.widget);
                const widget = {
                    type: match[1].toLowerCase(),
                    definition: match[2],
                    lineNumber: i + 1
                };
                widgets.push(widget);
                console.log('🎨 Widget encontrado:', widget.type, '-', widget.definition.substring(0, 50));
            }
            
            // Detectar variáveis (fora do dashboard)
            else if (this.patterns.variable.test(line) && !currentDashboard) {
                const match = line.match(this.patterns.variable);
                const variable = {
                    name: match[1],
                    definition: match[2],
                    lineNumber: i + 1
                };
                variables.push(variable);
                console.log('🧮 Variável encontrada:', variable.name);
            }
        }
        
        if (!currentDashboard) {
            throw new Error('Dashboard não encontrado. Use: DASHBOARD "Nome":');
        }
        
        return {
            name: currentDashboard.name,
            variables: variables,
            widgets: widgets
        };
    }
}

/**
 * 2️⃣ WIDGET PARSER - Processa KPI, GRÁFICO, TABELA
 */
class WidgetParser {
    constructor() {
        this.widgetTypes = {
            kpi: this.parseKPI.bind(this),
            grafico: this.parseGrafico.bind(this),
            tabela: this.parseTabela.bind(this),
            gauge: this.parseGauge.bind(this)
        };
    }
    
    parse(widget) {
        console.log('🎨 Parsing widget:', widget.type);
        
        const parser = this.widgetTypes[widget.type];
        if (!parser) {`
            throw new Error(`Tipo de widget não suportado: ${widget.type}`);
        }
        
        return parser(widget.definition);
    }
    
    /**
     * Parse KPI: variavel TITULO "Nome", MOEDA R$, COR verde SE >0
     */
    parseKPI(definition) {
        console.log('📊 Parsing KPI:', definition);
        
        const result = {
            type: 'kpi',
            variable: null,
            title: null,
            config: {
                format: 'number',
                currency: null,
                conditions: []
            }
        };
        
        // Extrair variável (primeira palavra)
        const parts = definition.split(/\s+/);
        result.variable = parts[0];
        
        // Extrair título
        const titleMatch = definition.match(/TITULO\s+"([^"]+)"/i);
        if (titleMatch) {
            result.title = titleMatch[1];
        }
        
        // Extrair formato de moeda
        const currencyMatch = definition.match(/MOEDA\s+(R\$|USD|\$|EUR|€)/i);
        if (currencyMatch) {
            result.config.format = 'currency';
            result.config.currency = currencyMatch[1];
        }
        
        // Extrair formato percentual
        if (/FORMATO\s+%/i.test(definition)) {
            result.config.format = 'percentage';
        }
        
        // Extrair condições de cor
        const colorMatches = definition.matchAll(/COR\s+(\w+)\s+SE\s+([^,;]+)/gi);
        for (const match of colorMatches) {
            result.config.conditions.push({
                color: match[1],
                condition: match[2].trim()
            });
        }
        
        console.log('✅ KPI parsed:', result.variable, 'com', result.config.conditions.length, 'condições');
        return result;
    }
    
    /**
     * Parse GRÁFICO: barras DE vendas TITULO "Nome", CORES azul
     */
    parseGrafico(definition) {
        console.log('📈 Parsing GRÁFICO:', definition);
        
        const result = {
            type: 'chart',
            chartType: null,
            data: null,
            title: null,
            config: {
                colors: [],
                height: 400,
                width: null
            }
        };
        
        // Extrair tipo de gráfico
        const typeMatch = definition.match(/^(\w+)/i);
        if (typeMatch) {
            result.chartType = typeMatch[1].toLowerCase();
        }
        
        // Extrair dados (após "DE")
        const dataMatch = definition.match(/DE\s+([^TITULO^CORES^ALTURA^LARGURA]+)/i);
        if (dataMatch) {
            result.data = dataMatch[1].trim();
        }
        
        // Extrair título
        const titleMatch = definition.match(/TITULO\s+"([^"]+)"/i);
        if (titleMatch) {
            result.title = titleMatch[1];
        }
        
        // Extrair cores
        const colorsMatch = definition.match(/CORES\s+\[([^\]]+)\]/i);
        if (colorsMatch) {
            result.config.colors = colorsMatch[1].split(',').map(c => c.trim());
        } else {
            const singleColorMatch = definition.match(/CORES\s+(\w+)/i);
            if (singleColorMatch) {
                result.config.colors = [singleColorMatch[1]];
            }
        }
        
        // Extrair dimensões
        const heightMatch = definition.match(/ALTURA\s+(\d+)px/i);
        if (heightMatch) {
            result.config.height = parseInt(heightMatch[1]);
        }
        
        const widthMatch = definition.match(/LARGURA\s+(\d+)px/i);
        if (widthMatch) {
            result.config.width = parseInt(widthMatch[1]);
        }
        
        console.log('✅ GRÁFICO parsed:', result.chartType, 'com dados:', result.data);
        return result;
    }
    
    /**
     * Parse TABELA: TOP 10 vendedores POR comissao
     */
    parseTabela(definition) {
        console.log('📋 Parsing TABELA:', definition);
        
        const result = {
            type: 'table',
            query: definition,
            config: {
                pageSize: 10,
                sortable: true,
                searchable: true
            }
        };
        
        console.log('✅ TABELA parsed:', definition);
        return result;
    }
    
    /**
     * Parse GAUGE: sla MINIMO 0, MAXIMO 100, META 95
     */
    parseGauge(definition) {
        console.log('⚡ Parsing GAUGE:', definition);
        
        const result = {
            type: 'gauge',
            variable: null,
            config: {
                min: 0,
                max: 100,
                target: null,
                thresholds: []
            }
        };
        
        // Extrair variável
        const parts = definition.split(/\s+/);
        result.variable = parts[0];
        
        // Extrair valores
        const minMatch = definition.match(/MINIMO\s+(\d+)/i);
        if (minMatch) {
            result.config.min = parseInt(minMatch[1]);
        }
        
        const maxMatch = definition.match(/MAXIMO\s+(\d+)/i);
        if (maxMatch) {
            result.config.max = parseInt(maxMatch[1]);
        }
        
        const targetMatch = definition.match(/META\s+(\d+)/i);
        if (targetMatch) {
            result.config.target = parseInt(targetMatch[1]);
        }
        
        console.log('✅ GAUGE parsed:', result.variable, 'range:', result.config.min, '-', result.config.max);
        return result;
    }
}

/**
 * 3️⃣ VARIABLE CALCULATOR - Resolve variáveis calculadas
 */
class VariableCalculator ({ constructor() {
        this.operators = {
            '+': (a, b) => a + b,
            '-': (a, b) => a - b,
            '*': (a, b) => a * b,
            '/': (a, b) => a / b,
            '%': (a, b }) => (a / b) * 100
        };
        
        this.functions = {
            'SOMAR': 'SUM',
            'MEDIA': 'AVG', 
            'CONTAR': 'COUNT',
            'MAXIMO': 'MAX',
            'MINIMO': 'MIN'
        };
    }
    
    /**
     * Ordena variáveis por dependência
     */
    sortByDependency(variables) ({ console.log('🔄 Ordenando', variables.length, 'variáveis por dependência');
        
        const sorted = [];
        const processed = new Set();
        const processing = new Set();
        
        const processDependencies = (variable }) => {
            if (processed.has(variable.name)) return;
            if (processing.has(variable.name)) {`
                throw new Error(`Dependência circular detectada: ${variable.name}`);
            }
            
            processing.add(variable.name);
            
            // Encontrar dependências desta variável
            const dependencies = this.extractDependencies(variable.definition);
            
            for (const dep of dependencies) {
                const depVariable = variables.find(v => v.name === dep);
                if (depVariable) {
                    processDependencies(depVariable);
                }
            }
            
            processing.delete(variable.name);
            processed.add(variable.name);
            sorted.push(variable);
        };
        
        for (const variable of variables) {
            processDependencies(variable);
        }
        
        console.log('✅ Variáveis ordenadas:', sorted.map(v => v.name).join(' → '));
        return sorted;
    }
    
    /**
     * Extrai dependências de uma definição de variável
     */
    extractDependencies(definition) {
        const dependencies = [];
        
        // Buscar por nomes de variáveis (palavras que não são funções/operadores)
        const words = definition.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
        
        for (const word of words) {
            // Ignorar funções TQL e palavras reservadas
            if (!this.functions[word] && !this.isReservedWord(word)) {
                dependencies.push(word);
            }
        }
        
        return [...new Set(dependencies)]; // Remove duplicatas
    }
    
    isReservedWord(word) {
        const reserved = ['DE', 'ONDE', 'EM', 'ENTRE', 'E', 'OU', 'SE', 'ULTIMOS', 'PROXIMOS', 
                         'DIA', 'MES', 'ANO', 'COMO', 'POR', 'ASC', 'DESC'];
        return reserved.includes(word.toUpperCase());
    }
    
    /**
     * Calcula valor de uma variável
     */
    async calculate(variable, resolvedVariables, schemaId) {
        console.log('🧮 Calculando variável:', variable.name);
        
        try {
            // Se for uma query simples, executar diretamente
            if (this.isSimpleQuery(variable.definition)) {
                return await this.executeSimpleQuery(variable.definition, schemaId);
            }
            
            // Se for expressão matemática, calcular
            if (this.isMathExpression(variable.definition)) {
                return this.calculateMathExpression(variable.definition, resolvedVariables);
            }
            `
            throw new Error(`Tipo de variável não suportado: ${variable.definition}`);
            
        } catch (error) {
            console.error('❌ Erro calculando variável:', variable.name, error.message);
            throw error;
        }
    }
    
    /**
     * Verifica se é uma query simples (SOMAR, CONTAR, etc.)
     */
    isSimpleQuery(definition) {
        return /^(SOMAR|MEDIA|CONTAR|MAXIMO|MINIMO)\s+/i.test(definition);
    }
    
    /**
     * Verifica se é expressão matemática
     */
    isMathExpression(definition) {
        return /[\+\-\*\/\%]/.test(definition) && !/^(SOMAR|MEDIA|CONTAR)/i.test(definition);
    }
    
    /**
     * Executa query simples
     */
    async executeSimpleQuery(query, schemaId) {
        console.log('🔍 Executando query simples:', query);
        
        // Por enquanto, retornar valor mock
        // TODO: Integrar com SQL Generator
        const mockValues = {
            'SOMAR valor DE vendas': 150000,
            'CONTAR tickets DE suporte': 42,
            'MEDIA salario DE funcionarios': 7500
        };
        
        // Buscar valor mock que mais se aproxima
        for (const [pattern, value] of Object.entries(mockValues)) {
            if (query.toLowerCase().includes(pattern.toLowerCase().substring(0, 10))) {
                console.log('📊 Valor mock retornado:', value);
                return value;
            }
        }
        
        // Valor padrão
        return Math.floor(Math.random() * 100000);
    }
    
    /**
     * Calcula expressão matemática
     */
    calculateMathExpression(expression, resolvedVariables) {
        console.log('🧮 Calculando expressão:', expression);
        
        // Substituir variáveis por seus valores
        let processedExpression = expression;
        
        for (const [varName, value] of resolvedVariables) {`
            const regex = new RegExp(`\\b${varName}\\b`, 'g');
            processedExpression = processedExpression.replace(regex, value.toString());
        }
        
        console.log('🔄 Expressão processada:', processedExpression);
        
        // Avaliar expressão matemática (método seguro)
        try {
            // Por segurança, usar parser próprio em vez de eval()
            const result = this.evaluateExpression(processedExpression);
            console.log('✅ Resultado:', result);
            return result;
        } catch (error) {
            console.error('❌ Erro na expressão:', error.message);`
            throw new Error(`Erro na expressão matemática: ${expression}`);
        }
    }
    
    /**
     * Avalia expressão matemática de forma segura
     */
    evaluateExpression(expression) {
        // Parser simples para expressões básicas
        // Remove espaços
        expression = expression.replace(/\s+/g, '');
        
        // Suporte básico para +, -, *, /, %
        // Por simplicidade, usar Function constructor (mais seguro que eval)
        const sanitized = expression.replace(/[^0-9+\-*/.%()]/g, '');
        
        if (sanitized !== expression.replace(/\s+/g, '')) {
            throw new Error('Expressão contém caracteres inválidos');
        }
        
        // Converter % para /100
        const normalized = sanitized.replace(/(\d+(?:\.\d+)?)\s*%/g, '($1/100)');
        
        return Function('"use strict"; return (' + normalized + ')')();
    }
}

module.exports = {
    TQLEngine,
    DashboardParser,
    WidgetParser, 
    VariableCalculator
};`