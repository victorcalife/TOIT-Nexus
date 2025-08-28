/**
 * TQL (TOIT Query Language) Service
 * Sistema de BI interativo e adaptativo para construção de indicadores e dashboards
 * Permite queries complexas através de linguagem simplificada para usuários não técnicos
 */

const EventEmitter = require('events');

class TQLService extends EventEmitter {
    constructor(database) {
        super();
        this.database = database;
        this.savedQueries = new Map();
        this.dashboards = new Map();
        this.widgets = new Map();
        this.dataConnections = new Map();
        this.queryCache = new Map();
        this.auditLog = [];
        
        // Sistema de cores inteligente integrado
        this.colorService = null;
        
        // Schema de dados ITSM disponível
        this.dataSchema = {
            tickets: {
                fields: ['id', 'title', 'status', 'priority', 'assignee', 'client', 'created_at', 'due_date', 'resolved_at'],
                relations: ['problems', 'changes', 'activities'],
                aggregations: ['count', 'avg_resolution_time', 'sla_compliance']
            },
            problems: {
                fields: ['id', 'title', 'status', 'root_cause', 'impact', 'urgency', 'created_at', 'resolved_at'],
                relations: ['tickets', 'changes', 'known_errors'],
                aggregations: ['count', 'recurrence_rate', 'time_to_resolve']
            },
            changes: {
                fields: ['id', 'title', 'type', 'risk', 'status', 'planned_start', 'planned_end', 'actual_start', 'actual_end'],
                relations: ['problems', 'releases', 'approvals'],
                aggregations: ['success_rate', 'avg_duration', 'risk_distribution']
            },
            releases: {
                fields: ['id', 'version', 'status', 'planned_date', 'actual_date', 'environment', 'rollback_plan'],
                relations: ['changes', 'deployments'],
                aggregations: ['deployment_frequency', 'lead_time', 'mttr']
            },
            users: {
                fields: ['id', 'name', 'role', 'department', 'workload', 'performance_rating'],
                relations: ['tickets', 'changes', 'approvals'],
                aggregations: ['productivity', 'resolution_rate', 'satisfaction_score']
            }
        };
        
        // Funções TQL pré-definidas
        this.tqlFunctions = ({ // Tempo
            'THIS_MONTH': () => this.getTimeRange('current_month'),
            'LAST_MONTH': () => this.getTimeRange('last_month'),
            'THIS_QUARTER': () => this.getTimeRange('current_quarter'),
            'LAST_QUARTER': () => this.getTimeRange('last_quarter'),
            'THIS_YEAR': () => this.getTimeRange('current_year'),
            'LAST_7_DAYS': () => this.getTimeRange('last_7_days'),
            'LAST_30_DAYS': () => this.getTimeRange('last_30_days'),
            
            // Agregações
            'COUNT': (field }) => ({ type: 'count', field }),
            'AVG': (field) => ({ type: 'avg', field }),
            'MEDIA': (field) => ({ type: 'avg', field }),
            'SUM': (field) => ({ type: 'sum', field }),
            'SOMAR': (field) => ({ type: 'sum', field }),
            'MIN': (field, quantity) => ({ type: 'min', field, quantity }),
            'MAX': (field, quantity) => ({ type: 'max', field, quantity }),
            'PERCENTAGE': (numerator, denominator) => ({ type: 'percentage', numerator, denominator }),
            
            // SLA e métricas específicas
            'SLA_COMPLIANCE': (entity) => this.calculateSLACompliance(entity),
            'MTTR': (entity) => this.calculateMTTR(entity),
            'FIRST_CALL_RESOLUTION': () => this.calculateFCR(),
            'CUSTOMER_SATISFACTION': (period) => this.calculateCSAT(period),
            
            // Comparações
            'TREND': (metric, period) => this.calculateTrend(metric, period),
            'COMPARE_PERIOD': (metric, period1, period2) => this.comparePeriods(metric, period1, period2),
            'GROWTH_RATE': (metric, period) => this.calculateGrowthRate(metric, period)
        };
        
        this.initialize();
    }
    
    async initialize() {
        console.log('🔄 Inicializando TQL Service...');
        
        // Inicializar sistema de cores inteligente
        const ColorService = require('./colorService');
        this.colorService = new ColorService(this.database);
        console.log('🎨 Color Service integrado ao TQL');
        
        // Carregar queries salvas e dashboards
        await this.loadSavedQueries();
        await this.loadDashboards();
        
        // Registrar exemplos de queries para demonstração
        await this.registerExampleQueries();
        
        // Testar TQL 2.0
        await this.testTQL2();
        
        console.log('✅ TQL Service inicializado com sucesso');
        this.emit('initialized');
    }
    
    /**
     * Método simplificado para traduzir TQL para SQL
     * Usado pelo BiAsy para conversão rápida
     */
    translateTQL(tqlQuery) {
        try {
            console.log('🔄 Traduzindo TQL para SQL:', tqlQuery);
            
            // Normalizar query
            let sql = tqlQuery.trim();
            
            // Traduções básicas TQL → SQL
            const translations = {
                // Comandos principais
                'BUSCAR': 'SELECT',
                'MOSTRAR': 'SELECT',
                'SHOW': 'SELECT',
                'DE': 'FROM',
                'FROM': 'FROM',
                'ONDE': 'WHERE', 
                'WHERE': 'WHERE',
                'AGRUPAR POR': 'GROUP BY',
                'GROUP BY': 'GROUP BY',
                'ORDENAR POR': 'ORDER BY',
                'ORDER BY': 'ORDER BY',
                'LIMITE': 'LIMIT',
                'LIMIT': 'LIMIT',
                
                // Funções de agregação
                'CONTAR': 'COUNT',
                'COUNT': 'COUNT',
                'SOMAR': 'SUM',
                'SUM': 'SUM',
                'MEDIA': 'AVG',
                'AVG': 'AVG',
                'MAXIMO': 'MAX',
                'MAX': 'MAX',
                'MINIMO': 'MIN',
                'MIN': 'MIN',
                
                // Operadores lógicos
                ' E ': ' AND ',
                ' AND ': ' AND ',
                ' OU ': ' OR ',
                ' OR ': ' OR ',
                ' NAO ': ' NOT ',
                ' NOT ': ' NOT ',
                
                // Funções temporais básicas
                'DIA\\(0\\)': 'CURRENT_DATE',
                'MES\\(0\\)': 'DATE_TRUNC(\'month\', CURRENT_DATE)',
                'ANO\\(0\\)': 'DATE_TRUNC(\'year\', CURRENT_DATE)',
                'AGORA\\(\\)': 'NOW()',
                'NOW\\(\\)': 'NOW()',
                
                // Ordenação
                'ASC': 'ASC',
                'DESC': 'DESC',
                'CRESCENTE': 'ASC',
                'DECRESCENTE': 'DESC'
            };
            
            // Aplicar traduções
            for (const [tql, sqlEquivalent] of Object.entries(translations)) {
                const regex = new RegExp(`\\b${tql}\\b`, 'gi');
                sql = sql.replace(regex, sqlEquivalent);
            }
            
            // Correções específicas
            sql = this.applySQLCorrections(sql);
            
            console.log('✅ SQL traduzido:', sql);
            return sql;
            
        } catch (error) {
            console.error('❌ Erro na tradução TQL:', error.message);
            // Fallback: retornar query original se falhar
            return tqlQuery;
        }
    }
    
    /**
     * Aplicar correções específicas ao SQL gerado
     */
    applySQLCorrections(sql) {
        // Corrigir COUNT(*) se necessário
        sql = sql.replace(/COUNT\s*\(\s*\)/gi, 'COUNT(*)');
        
        // Corrigir FROM duplicado
        sql = sql.replace(/FROM\s+FROM/gi, 'FROM');
        
        // Garantir espaços adequados
        sql = sql.replace(/\s+/g, ' ').trim();
        
        // Se não começar com SELECT, adicionar
        if (!sql.toUpperCase().startsWith('SELECT')) {
            sql = 'SELECT ' + sql;
        }
        
        return sql;
    }

    /**
     * Parser principal da linguagem TQL
     * Converte queries TQL em queries SQL otimizadas
     */
    parseTQL(tqlQuery) {
        try {
            const normalizedQuery = tqlQuery.trim().toUpperCase();
            
            // Análise léxica básica
            const tokens = this.tokenize(normalizedQuery);
            
            // Análise sintática
            const ast = this.parseTokens(tokens);
            
            // Validação semântica
            this.validateQuery(ast);
            
            // Geração de SQL
            const sqlQuery = this.generateSQL(ast);
            
            // Cache da query
            const queryId = this.generateQueryId(tqlQuery);
            this.queryCache.set(queryId, { tql: tqlQuery, sql: sqlQuery, ast, timestamp: Date.now() });
            
            return {
                success: true,
                tql: tqlQuery,
                sql: sqlQuery,
                ast,
                queryId,
                estimatedRows: this.estimateResultSize(ast)
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                suggestion: this.suggestCorrection(tqlQuery, error)
            };
        }
    }
    
    /**
     * Tokenizador para TQL
     */
    tokenize(query) {
        // Regex patterns para diferentes tipos de tokens TQL 2.0
        const patterns = {
            KEYWORD: /\b(SHOW|MOSTRAR|FROM|DE|WHERE|ONDE|GROUP BY|AGRUPAR POR|ORDER BY|ORDENAR POR|HAVING|AS|COMO|AND|E|OR|OU|NOT|NAO|BETWEEN|ENTRE|LIKE|IS|NULL|ASC|DESC|LIMIT|SOMAR|CONTAR|MEDIA|MAX|MIN)\b/g,
            MAX_MIN_FUNCTION: /\b(MAX|MIN)\s*\(\s*\d+\s*\)/g,
            FUNCTION: /\b[A-Z_]+\s*\(/g,
            IDENTIFIER: /\b[a-zA-ZÀ-ÿ_][a-zA-ZÀ-ÿ0-9_]*\b/g,
            NUMBER: /\b\d+(\.\d+)?\b/g,
            STRING: /'[^']*'|"[^"]*"/g,
            OPERATOR: /[=<>!]+|>=|<=|!=|AND|OR|NOT|E|OU|NAO/g,
            LIST_START: /\(/g,
            LIST_END: /\)/g,
            LIST_SEPARATOR: /,/g,
            DELIMITER: /[();]/g,
            WHITESPACE: /\s+/g
        };
        
        const tokens = [];
        let position = 0;
        
        while (position < query.length) {
            let matched = false;
            
            for (const [type, pattern] of Object.entries(patterns)) {
                pattern.lastIndex = position;
                const match = pattern.exec(query);
                
                if (match && match.index === position) {
                    if (type !== 'WHITESPACE') {
                        tokens.push({
                            type,
                            value: match[0],
                            position
                        });
                    }
                    position = pattern.lastIndex;
                    matched = true;
                    break;
                }
            }
            
            if (!matched) {
                position++;
            }
        }
        
        return tokens;
    }
    
    /**
     * Parser de tokens em AST (Abstract Syntax Tree)
     */
    parseTokens(tokens) {
        const ast = {
            type: 'query',
            select: [],
            from: [],
            where: [],
            groupBy: [],
            orderBy: [],
            having: [],
            limit: null,
            functions: []
        };
        
        let currentSection = 'select';
        let i = 0;
        
        while (i < tokens.length) {
            const token = tokens[i];
            
            switch (token.type) {
                case 'KEYWORD':
                    switch (token.value.toUpperCase()) {
                        case 'SHOW':
                        case 'MOSTRAR':
                            currentSection = 'select';
                            break;
                        case 'FROM':
                        case 'DE':
                            currentSection = 'from';
                            break;
                        case 'WHERE':
                        case 'ONDE':
                            currentSection = 'where';
                            break;
                        case 'GROUP BY':
                        case 'AGRUPAR POR':
                            currentSection = 'groupBy';
                            i++; // Skip 'BY' or 'POR'
                            break;
                        case 'ORDER BY':
                        case 'ORDENAR POR':
                            currentSection = 'orderBy';
                            i++; // Skip 'BY' or 'POR'
                            break;
                        case 'HAVING':
                            currentSection = 'having';
                            break;
                        case 'LIMIT':
                        case 'TOP':
                            currentSection = 'limit';
                            break;
                    }
                    break;
                    
                case 'MAX_MIN_FUNCTION':
                    const maxMinFunc = this.parseMaxMinFunction(token);
                    ast.functions.push(maxMinFunc);
                    ast[currentSection].push(maxMinFunc);
                    break;
                    
                case 'FUNCTION':
                    const func = this.parseFunction(tokens, i);
                    ast.functions.push(func.function);
                    ast[currentSection].push(func.function);
                    i = func.nextIndex - 1;
                    break;
                    
                case 'IDENTIFIER':
                    // TQL 2.0: Detectar se próximo token é = e se há lista
                    if (i + 1 < tokens.length && tokens[i + 1].value === '=' && currentSection === 'where') {
                        const condition = this.parseConditionTQL2(tokens, i);
                        ast.where.push(condition.condition);
                        i = condition.nextIndex - 1;
                    } else {
                        ast[currentSection].push({
                            type: 'identifier',
                            value: token.value
                        });
                    }
                    break;
                    
                case 'NUMBER':
                    if (currentSection === 'limit') {
                        ast.limit = parseInt(token.value);
                    } else {
                        ast[currentSection].push({
                            type: 'number',
                            value: parseFloat(token.value)
                        });
                    }
                    break;
                    
                case 'STRING':
                    ast[currentSection].push({
                        type: 'string',
                        value: token.value.slice(1, -1) // Remove quotes
                    });
                    break;
            }
            
            i++;
        }
        
        return ast;
    }
    
    /**
     * Parser TQL 2.0 - Detecção automática = valor vs = (lista)
     */
    parseConditionTQL2(tokens, startIndex) {
        const field = tokens[startIndex].value;
        const operator = tokens[startIndex + 1].value; // Sempre =
        let i = startIndex + 2;
        
        // Pular espaços
        while (i < tokens.length && tokens[i].type === 'WHITESPACE') {
            i++;
        }
        
        // TQL 2.0 REVOLUÇÃO: Detectar automaticamente valor vs lista
        if (i < tokens.length && tokens[i].value === '(') {
            // 🔥 LISTA DETECTADA! = (val1, val2, val3) → IN
            const listResult = this.parseListTQL2(tokens, i);
            return {
                condition: {
                    type: 'condition_in', // SQL IN
                    field: field,
                    operator: 'IN',
                    values: listResult.values
                },
                nextIndex: listResult.nextIndex
            };
        } else {
            // 🔥 VALOR ÚNICO! = valor → =
            const value = tokens[i].value;
            return {
                condition: {
                    type: 'condition_equals', // SQL =
                    field: field,
                    operator: '=',
                    value: this.cleanValue(value)
                },
                nextIndex: i + 1
            };
        }
    }
    
    /**
     * Parser de lista TQL 2.0: (val1, val2, val3)
     */
    parseListTQL2(tokens, startIndex) {
        const values = [];
        let i = startIndex + 1; // Pular (
        
        while (i < tokens.length && tokens[i].value !== ')') {
            if (tokens[i].type !== 'WHITESPACE' && tokens[i].value !== ',') {
                values.push(this.cleanValue(tokens[i].value));
            }
            i++;
        }
        
        return {
            values: values,
            nextIndex: i + 1 // Pular )
        };
    }
    
    /**
     * Limpar valores (remover aspas, etc.)
     */
    cleanValue(value) {
        if (typeof value === 'string') {
            // Remover aspas se existirem
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
                return value.slice(1, -1);
            }
        }
        return value;
    }
    
    /**
     * Parser para MAX(N) e MIN(N) - TQL 3.0 PLUS
     */
    parseMaxMinFunction(token) {
        // Extrair: MAX(5) → function: MAX, quantity: 5
        const match = token.value.match(/^(MAX|MIN)\s*\(\s*(\d+)\s*\)$/i);
        
        if (match) {
            const [, functionName, quantity] = match;
            return {
                type: 'max_min_function',
                name: functionName.toUpperCase(),
                quantity: parseInt(quantity),
                tqlFunction: this.tqlFunctions[functionName.toUpperCase()]
            };
        }
        `
        throw new Error(`Função MAX/MIN inválida: ${token.value}`);
    }
    
    /**
     * Parser de funções TQL
     */
    parseFunction(tokens, startIndex) {
        const functionName = tokens[startIndex].value.replace('(', '').trim();
        const args = [];
        let i = startIndex + 1;
        let parenCount = 1;
        
        while (i < tokens.length && parenCount > 0) {
            const token = tokens[i];
            
            if (token.value === '(') {
                parenCount++;
            } else if (token.value === ')') {
                parenCount--;
            } else if (token.value !== ',' && parenCount === 1) {
                args.push(token.value);
            }
            
            i++;
        }
        
        return {
            function: {
                type: 'function',
                name: functionName,
                args,
                tqlFunction: this.tqlFunctions[functionName]
            },
            nextIndex: i
        };
    }
    
    /**
     * Validador de queries TQL
     */
    validateQuery(ast) {
        // Validar entidades referenciadas
        for (const fromClause of ast.from) {
            if (fromClause.type === 'identifier' && !this.dataSchema[fromClause.value]) {`
                throw new Error(`Entidade '${fromClause.value}' não encontrada. Entidades disponíveis: ${Object.keys(this.dataSchema).join(', ')}`);
            }
        }
        
        // Validar campos referenciados
        for (const selectClause of ast.select) {
            if (selectClause.type === 'identifier') {
                const isValidField = ast.from.some(fromClause => {
                    const entity = this.dataSchema[fromClause.value];
                    return entity && entity.fields.includes(selectClause.value);
                });
                
                if (!isValidField) {`
                    throw new Error(`Campo '${selectClause.value}' não encontrado nas entidades especificadas`);
                }
            }
        }
        
        // Validar funções TQL
        for (const func of ast.functions) {
            if (!this.tqlFunctions[func.name]) {`
                throw new Error(`Função '${func.name}' não reconhecida. Funções disponíveis: ${Object.keys(this.tqlFunctions).join(', ')}`);
            }
        }
    }
    
    /**
     * Gerador de SQL a partir do AST
     */
    generateSQL(ast) {
        let sql = 'SELECT ';
        
        // Cláusula SELECT
        if (ast.select.length === 0) {
            sql += '*';
        } else {
            const selectParts = ast.select.map(item => {
                if (item.type === 'function') {
                    return this.generateFunctionSQL(item);
                } else if (item.type === 'max_min_function') {
                    return this.generateMaxMinFunctionSQL(item);
                } else if (item.type === 'identifier') {
                    return item.value;
                }
                return item.value;
            });
            sql += selectParts.join(', ');
        }
        
        // Cláusula FROM
        if (ast.from.length > 0) {
            const fromParts = ast.from.map(item => item.value);`
            sql += ` FROM ${fromParts.join(', ')}`;
        }
        
        // Cláusula WHERE TQL 2.0
        if (ast.where.length > 0) {
            const whereParts = ast.where.map(item => {
                if (item.type === 'condition_equals') {
                    // 🔥 TQL 2.0: campo = valor → campo = 'valor'`
                    return `${item.field} = '${item.value}'`;
                } else if (item.type === 'condition_in') {
                    // 🔥 TQL 2.0: campo = (val1, val2) → campo IN ('val1', 'val2')`
                    const valuesList = item.values.map(v => `'${v}'`).join(', ');`
                    return `${item.field} IN (${valuesList})`;
                } else if (item.type === 'function') {
                    return this.generateFunctionSQL(item);
                }
                return item.value;
            });`
            sql += ` WHERE ${whereParts.join(' AND ')}`;
        }
        
        // Cláusula GROUP BY
        if (ast.groupBy.length > 0) {
            const groupParts = ast.groupBy.map(item => item.value);`
            sql += ` GROUP BY ${groupParts.join(', ')}`;
        }
        
        // Cláusula HAVING
        if (ast.having.length > 0) {
            const havingParts = ast.having.map(item => item.value);`
            sql += ` HAVING ${havingParts.join(' ')}`;
        }
        
        // Cláusula ORDER BY
        if (ast.orderBy.length > 0) {
            const orderParts = ast.orderBy.map(item => item.value);`
            sql += ` ORDER BY ${orderParts.join(', ')}`;
        }
        
        // Cláusula LIMIT
        if (ast.limit) {`
            sql += ` LIMIT ${ast.limit}`;
        }
        
        return sql;
    }
    
    /**
     * 🔥 TESTE TQL 2.0 - REVOLUÇÃO DO OPERADOR UNIVERSAL
     */
    async testTQL2() {
        console.log('🔥 TESTANDO TQL 3.0 PLUS REVOLUÇÃO...');
        
        const testQueries = [
            // Valor único
            'MOSTRAR funcionarios ONDE departamento = TI',
            'CONTAR vendas ONDE data = DIA(0)',
            'MAX salario DE funcionarios',
            'MIN idade DE funcionarios',
            
            // Lista automática TQL 2.0
            'MOSTRAR funcionarios ONDE departamento = (TI, RH, Vendas)',
            'CONTAR tickets ONDE prioridade = (alta, crítica)',
            'SOMAR vendas ONDE região = (SP, RJ, MG, RS)',
            
            // TQL 3.0 PLUS - MAX(N) e MIN(N)
            'MAX(5) funcionarios POR salario',
            'MIN(3) produtos POR vendas',
            'MAX(10) vendedores POR comissao'
        ];
        
        for (const query of testQueries) {
            try {`
                console.log(`\n🧪 Testando: ${query}`);
                const result = this.parseTQL(query);
                if (result.success) {`
                    console.log(`✅ SQL: ${result.sql}`);
                } else {`
                    console.log(`❌ Erro: ${result.error}`);
                }
            } catch (error) {`
                console.log(`❌ Exception: ${error.message}`);
            }
        }
        
        console.log('\n🎊 TQL 3.0 PLUS REVOLUTION TESTADO!');
    }
    
    /**
     * Geração de SQL para MAX(N) e MIN(N) - TQL 3.0 PLUS
     */
    generateMaxMinFunctionSQL(func) {
        // TQL 3.0: MAX(5) funcionarios POR salario
        if (func.quantity && func.quantity > 1) {
            // Múltiplos registros - usar LIMIT com ORDER BY
            const orderDir = func.name === 'MAX' ? 'DESC' : 'ASC';`
            return `* ORDER BY ${func.field || 'id'} ${orderDir} LIMIT ${func.quantity}`;
        } else {
            // Registro único ou valor
            return func.name === 'MAX' ? `
                `MAX(${func.field || '*'})` : `
                `MIN(${func.field || '*'})`;
        }
    }
    
    /**
     * Geração de SQL para funções TQL específicas
     */
    generateFunctionSQL(func) {
        switch (func.name) {
            case 'COUNT':`
                return func.args.length > 0 ? `COUNT(${func.args[0]})` : 'COUNT(*)';
            case 'AVG':`
                return `AVG(${func.args[0]})`;
            case 'SUM':`
                return `SUM(${func.args[0]})`;
            case 'MIN':`
                return `MIN(${func.args[0]})`;
            case 'MAX':`
                return `MAX(${func.args[0]})`;
            case 'THIS_MONTH':`
                return `created_at >= DATE_TRUNC('month', CURRENT_DATE) AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'`;
            case 'LAST_MONTH':`
                return `created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' AND created_at < DATE_TRUNC('month', CURRENT_DATE)`;
            case 'SLA_COMPLIANCE':`
                return `(CASE WHEN resolved_at <= due_date THEN 1 ELSE 0 END)`;
            default:
                return func.name + '(' + func.args.join(', ') + ')';
        }
    }
    
    /**
     * Execução de queries TQL
     */
    async executeTQL(tqlQuery, options = {}) {
        try {
            const parseResult = this.parseTQL(tqlQuery);
            
            if (!parseResult.success) {
                return parseResult;
            }
            
            // Verificar cache
            if (!options.bypassCache && this.queryCache.has(parseResult.queryId)) {
                const cached = this.queryCache.get(parseResult.queryId);
                if (Date.now() - cached.timestamp < (options.cacheTimeout || 300000)) { // 5 min default
                    return {
                        success: true,
                        data: cached.result,
                        cached: true,
                        queryId: parseResult.queryId
                    };
                }
            }
            
            // Executar query SQL
            const result = await this.database.query(parseResult.sql);
            
            // Processar resultado
            const processedResult = this.processQueryResult(result, parseResult.ast);
            
            // Atualizar cache
            if (this.queryCache.has(parseResult.queryId)) {
                this.queryCache.get(parseResult.queryId).result = processedResult;
                this.queryCache.get(parseResult.queryId).timestamp = Date.now();
            }
            
            // Log de auditoria
            this.auditLog.push({
                timestamp: new Date(),
                tql: tqlQuery,
                sql: parseResult.sql,
                rows: processedResult.length,
                user: options.user || 'system'
            });
            
            this.emit('queryExecuted', {
                tql: tqlQuery,
                sql: parseResult.sql,
                rows: processedResult.length,
                duration: result.duration
            });
            
            // 🎨 SISTEMA INTELIGENTE DE CORES - Geração automática
            let colors = [];
            if (this.colorService && processedResult.length > 0) {
                try {
                    const userId = options.user || 'anonymous';
                    const userPalette = await this.colorService.getUserColorPalette(userId);
                    
                    // Gerar cores baseadas no tamanho do dataset
                    colors = this.colorService.generateColorsForDataset(
                        processedResult.length,
                        userPalette,
                        {
                            transparency: 0.8,
                            brightnessVariation: processedResult.length > userPalette.colors.length * 2
                        }
                    );
                    
                    // Registrar uso para estatísticas
                    await this.colorService.recordPaletteUsage(
                        userId,
                        userPalette.name,
                        processedResult.length
                    );
                    `
                    console.log(`🎨 Cores geradas automaticamente: ${colors.length} cores para ${processedResult.length} dados`);
                } catch (colorError) {
                    console.warn('⚠️ Erro na geração de cores:', colorError.message);
                    // Fallback para cores padrão se falhar
                    const defaultColors = ['#64748b', '#6b7280', '#78716c', '#84cc16', '#06b6d4'];
                    colors = Array.from({length: processedResult.length}, (_, i) => 
                        defaultColors[i % defaultColors.length]
                    );
                }
            }

            return {
                success: true,
                data: processedResult,
                queryId: parseResult.queryId,
                colors: colors, // 🎨 Cores geradas automaticamente
                metadata: {
                    rows: processedResult.length,
                    duration: result.duration,
                    sql: parseResult.sql,
                    colorsGenerated: colors.length,
                    colorRotations: colors.length > 0 ? Math.ceil(colors.length / 5) : 0
                }
            };
            
        } catch (error) {
            this.emit('queryError', { tql: tqlQuery, error: error.message });
            
            return {
                success: false,
                error: error.message,
                suggestion: this.suggestCorrection(tqlQuery, error)
            };
        }
    }
    
    /**
     * Processamento de resultados de query
     */
    processQueryResult(result, ast) {
        if (!result.rows) return [];
        
        // Aplicar transformações específicas baseadas no AST
        return result.rows.map(row => {
            const processedRow = { ...row };
            
            // Processar funções especiais
            for (const func of ast.functions) {
                if (func.tqlFunction) {
                    const funcResult = func.tqlFunction(...func.args);
                    if (funcResult && typeof funcResult === 'object') {
                        Object.assign(processedRow, funcResult);
                    }
                }
            }
            
            return processedRow;
        });
    }
    
    /**
     * Salvar query TQL para reutilização
     */
    async saveQuery(name, tqlQuery, description = '', tags = []) {
        const queryData = {
            id: this.generateId(),
            name,
            tql: tqlQuery,
            description,
            tags,
            created_at: new Date(),
            updated_at: new Date(),
            usage_count: 0
        };
        
        this.savedQueries.set(queryData.id, queryData);
        
        this.emit('querySaved', queryData);
        
        return queryData;
    }
    
    /**
     * Criar dashboard customizado
     */
    async createDashboard(name, description = '', widgets = []) {
        const dashboard = {
            id: this.generateId(),
            name,
            description,
            widgets: [],
            layout: { columns: 12, rows: [] },
            created_at: new Date(),
            updated_at: new Date(),
            shared: false,
            owner: 'system'
        };
        
        // Adicionar widgets
        for (const widgetConfig of widgets) {
            const widget = await this.createWidget(widgetConfig);
            dashboard.widgets.push(widget.id);
        }
        
        this.dashboards.set(dashboard.id, dashboard);
        
        this.emit('dashboardCreated', dashboard);
        
        return dashboard;
    }
    
    /**
     * Criar widget para dashboard
     */
    async createWidget(config) {
        const widget = {
            id: this.generateId(),
            type: config.type || 'chart',
            title: config.title || 'Novo Widget',
            tql: config.tql || '',
            visualization: config.visualization || 'bar',
            options: config.options || {},
            position: config.position || { x: 0, y: 0, w: 6, h: 4 },
            created_at: new Date(),
            updated_at: new Date()
        };
        
        this.widgets.set(widget.id, widget);
        
        return widget;
    }
    
    /**
     * Executar dashboard (todos os widgets)
     */
    async executeDashboard(dashboardId) {
        const dashboard = this.dashboards.get(dashboardId);
        if (!dashboard) {`
            throw new Error(`Dashboard '${dashboardId}' não encontrado`);
        }
        
        const results = [];
        
        for (const widgetId of dashboard.widgets) {
            const widget = this.widgets.get(widgetId);
            if (widget && widget.tql) {
                try {
                    const result = await this.executeTQL(widget.tql);
                    results.push({
                        widgetId,
                        widget,
                        data: result.data,
                        success: result.success,
                        error: result.error
                    });
                } catch (error) {
                    results.push({
                        widgetId,
                        widget,
                        data: [],
                        success: false,
                        error: error.message
                    });
                }
            }
        }
        
        return {
            dashboard,
            widgets: results,
            generatedAt: new Date()
        };
    }
    
    /**
     * Sugestões de autocomplete TQL 3.0 PLUS - INTELIGENTE E CONTEXTUAL
     */
    getAutocompleteSuggestions(partialQuery, cursorPosition) {
        const suggestions = [];
        const query = partialQuery.toLowerCase();
        const beforeCursor = partialQuery.substring(0, cursorPosition).toLowerCase().trim();
        const afterCursor = partialQuery.substring(cursorPosition).toLowerCase().trim();
        const words = beforeCursor.split(/\s+/);
        const lastWord = words[words.length - 1] || '';
        
        // 🎯 CONTEXTO INTELIGENTE TQL 3.0
        const context = this.analyzeQueryContext(beforeCursor, lastWord);
        
        switch (context.stage) {
            case 'start':
                // Início da query - sugerir funções principais
                suggestions.push(
                    { type: 'function', value: 'MAX', description: '📈 Encontrar valores máximos', example: 'MAX salario DE funcionarios' },
                    { type: 'function', value: 'MIN', description: '📉 Encontrar valores mínimos', example: 'MIN idade DE clientes' },
                    { type: 'function', value: 'SOMAR', description: '➕ Somar valores', example: 'SOMAR vendas DE pedidos' },
                    { type: 'function', value: 'CONTAR', description: '🔢 Contar registros', example: 'CONTAR funcionarios' },
                    { type: 'function', value: 'MEDIA', description: '📊 Calcular média', example: 'MEDIA salario DE funcionarios' },
                    { type: 'function', value: 'MOSTRAR', description: '👁️ Exibir dados', example: 'MOSTRAR funcionarios' },
                    { type: 'function', value: 'RANKING', description: '🏆 Classificar registros', example: 'RANKING vendedores POR vendas' }
                );
                break;
                
            case 'max_min_function':
                // Após MAX(5) ou MIN(3) - sugerir tabelas
                const entities = Object.keys(this.dataSchema);
                suggestions.push(...entities.map(e => ({
                    type: 'entity',
                    value: e,`
                    description: `📋 ${this.getEntityDescription(e)}`,`
                    example: `${context.functionName}${context.quantity ? `(${context.quantity})` : ''} ${e} POR campo`
                })));
                break;
                
            case 'after_por':
                // Após "POR" - sugerir campos da tabela mencionada
                if (context.table && this.dataSchema[context.table]) {
                    const fields = this.dataSchema[context.table].fields;
                    suggestions.push(...fields.map(f => ({
                        type: 'field',
                        value: f,`
                        description: `🏷️ Campo: ${f}`,
                        entity: context.table,`
                        example: `${beforeCursor} ${f}`
                    })));
                }
                break;
                
            case 'after_de':
                // Após "DE" - sugerir tabelas
                const entitiesDE = Object.keys(this.dataSchema);
                suggestions.push(...entitiesDE.map(e => ({
                    type: 'entity',
                    value: e,`
                    description: `📋 ${this.getEntityDescription(e)}`,`
                    example: `${beforeCursor} ${e}`
                })));
                break;
                
            case 'after_onde':
                // Após "ONDE" - sugerir campos para filtros
                const usedEntities = this.extractEntitiesFromQuery(beforeCursor);
                for (const entity of usedEntities) {
                    if (this.dataSchema[entity]) {
                        suggestions.push(...this.dataSchema[entity].fields.map(f => ({
                            type: 'field',
                            value: f,`
                            description: `🔍 Filtrar por: ${f}`,
                            entity,`
                            example: `${beforeCursor} ${f} = valor`
                        })));
                    }
                }
                break;
                
            case 'after_equals':
                // Após "=" - sugerir valores comuns ou funções temporais
                suggestions.push(`
                    { type: 'temporal', value: 'DIA(0)', description: '📅 Hoje', example: `${beforeCursor} DIA(0)` },`
                    { type: 'temporal', value: 'MES(0)', description: '📅 Este mês', example: `${beforeCursor} MES(0)` },`
                    { type: 'temporal', value: 'ANO(0)', description: '📅 Este ano', example: `${beforeCursor} ANO(0)` },`
                    { type: 'temporal', value: 'DIA(-7)', description: '📅 7 dias atrás', example: `${beforeCursor} DIA(-7)` },`
                    { type: 'list', value: '(valor1, valor2)', description: '📝 Lista de valores', example: `${beforeCursor} (TI, RH, Vendas)` }
                );
                break;
                
            case 'numbers':
                // Contexto de números - sugerir quantidades comuns
                if (context.expectingNumber) {
                    suggestions.push(`
                        { type: 'number', value: '5', description: '🔢 Top 5', example: `${beforeCursor}5` },`
                        { type: 'number', value: '10', description: '🔢 Top 10', example: `${beforeCursor}10` },`
                        { type: 'number', value: '3', description: '🔢 Top 3', example: `${beforeCursor}3` },`
                        { type: 'number', value: '1', description: '🔢 Melhor', example: `${beforeCursor}1` }
                    );
                }
                break;
        }
        
        // 🔍 FILTRAR POR CORRESPONDÊNCIA PARCIAL
        const filtered = suggestions.filter(s => 
            s.value.toLowerCase().includes(lastWord) || 
            lastWord === '' ||
            s.description.toLowerCase().includes(lastWord)
        );
        
        // 📊 ORDENAR POR RELEVÂNCIA
        return filtered
            .sort((a, b) => {
                // Priorizar correspondência exata
                const aExact = a.value.toLowerCase().startsWith(lastWord);
                const bExact = b.value.toLowerCase().startsWith(lastWord);
                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;
                return a.value.localeCompare(b.value);
            })
            .slice(0, 15); // Limitar a 15 sugestões mais relevantes
    }
    
    /**
     * Analisar contexto da query para autocomplete inteligente
     */
    analyzeQueryContext(beforeCursor, lastWord) {
        const trimmed = beforeCursor.trim();
        const words = trimmed.split(/\s+/);
        
        // Detectar estágio da query
        if (!trimmed || trimmed === lastWord) {
            return { stage: 'start' };
        }
        
        // Detectar MAX(N) ou MIN(N)
        const maxMinMatch = trimmed.match(/^(MAX|MIN)(\(\d+\))?\s*$/i);
        if (maxMinMatch) {
            const [, functionName, quantityPart] = maxMinMatch;
            const quantity = quantityPart ? quantityPart.match(/\d+/)[0] : null;
            return { 
                stage: 'max_min_function', 
                functionName: functionName.toUpperCase(),
                quantity 
            };
        }
        
        // Detectar "POR" - usuário quer escolher campo de ordenação
        if (trimmed.includes(' POR ') || trimmed.endsWith(' POR')) {
            const tablePart = trimmed.split(' POR ')[0];
            const tableMatch = tablePart.match(/(?:MAX|MIN)(?:\(\d+\))?\s+(\w+)/i);
            const table = tableMatch ? tableMatch[1] : null;
            return { stage: 'after_por', table };
        }
        
        // Detectar "DE" - usuário quer escolher tabela
        if (trimmed.endsWith(' DE') || (trimmed.includes(' DE ') && !trimmed.includes(' POR '))) {
            return { stage: 'after_de' };
        }
        
        // Detectar "ONDE" - usuário quer filtrar
        if (trimmed.includes(' ONDE ') || trimmed.endsWith(' ONDE')) {
            return { stage: 'after_onde' };
        }
        
        // Detectar "=" - usuário quer valor
        if (trimmed.endsWith(' =') || (trimmed.includes(' = ') && !trimmed.match(/=\s*\S/))) {
            return { stage: 'after_equals' };
        }
        
        // Detectar contexto numérico MAX( ou MIN(
        if (lastWord.match(/^(MAX|MIN)\(/i)) {
            return { stage: 'numbers', expectingNumber: true };
        }
        
        return { stage: 'general' };
    }
    
    /**
     * Funções de utilidade
     */
    generateId() {
        return 'tql_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateQueryId(tqlQuery) {
        return 'query_' + Buffer.from(tqlQuery).toString('base64').substr(0, 16);
    }
    
    getTimeRange(period) {
        const now = new Date();
        switch (period) {
            case 'current_month':
                return {
                    start: new Date(now.getFullYear(), now.getMonth(), 1),
                    end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
                };
            case 'last_month':
                return {
                    start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
                    end: new Date(now.getFullYear(), now.getMonth(), 0)
                };
            // Adicionar outros períodos conforme necessário
            default:
                return { start: now, end: now };
        }
    }
    
    suggestCorrection(tqlQuery, error) {
        // Sistema básico de sugestões baseado em erros comuns
        const suggestions = [
            'Verifique a sintaxe da query',
            'Consulte a documentação TQL para exemplos',
            'Use SHOW para ver entidades disponíveis'
        ];
        
        if (error.message.includes('não encontrada')) {
            suggestions.unshift('Verifique se a entidade ou campo está escrito corretamente');
        }
        
        return suggestions[0];
    }
    
    getFunctionDescription(functionName) {
        const descriptions = {
            'COUNT': 'Conta o número de registros',
            'AVG': 'Calcula a média de um campo numérico',
            'SUM': 'Soma os valores de um campo numérico',
            'THIS_MONTH': 'Filtra dados do mês atual',
            'SLA_COMPLIANCE': 'Calcula compliance de SLA',
            'MTTR': 'Calcula Mean Time To Repair'
        };
        return descriptions[functionName] || 'Função TQL';
    }
    
    getEntityDescription(entityName) {
        const descriptions = {
            'tickets': 'Tickets de suporte e incidentes',
            'problems': 'Problemas e análise de causa raiz',
            'changes': 'Requests de mudança',
            'releases': 'Releases e deployments',
            'users': 'Usuários e colaboradores'
        };
        return descriptions[entityName] || 'Entidade de dados';
    }
    
    extractEntitiesFromQuery(query) {
        const entities = [];
        const fromMatch = query.match(/from\s+([a-zA-Z_,\s]+)/);
        if (fromMatch) {
            const entityList = fromMatch[1].split(',').map(e => e.trim());
            entities.push(...entityList);
        }
        return entities;
    }
    
    async loadSavedQueries() {
        // Em implementação real, carregar do banco de dados
        console.log('📊 Carregando queries salvas...');
    }
    
    async loadDashboards() {
        // Em implementação real, carregar do banco de dados
        console.log('📈 Carregando dashboards...');
    }
    
    async registerExampleQueries() {
        // Registrar exemplos de queries TQL para demonstração
        const examples = [
            {
                name: 'Tickets por Status',
                tql: 'SHOW status, COUNT(*) FROM tickets GROUP BY status',
                description: 'Conta tickets agrupados por status'
            },
            {
                name: 'SLA Compliance Mensal',
                tql: 'SHOW SLA_COMPLIANCE(tickets) FROM tickets WHERE THIS_MONTH()',
                description: 'Compliance de SLA no mês atual'
            },
            {
                name: 'Top 5 Usuários por Resolução',
                tql: 'SHOW assignee, COUNT(*) FROM tickets WHERE status = "resolved" GROUP BY assignee ORDER BY COUNT(*) DESC LIMIT 5',
                description: 'Top 5 usuários que mais resolvem tickets'
            }
        ];
        
        for (const example of examples) {
            await this.saveQuery(example.name, example.tql, example.description, ['example']);
        }
    }
    
    /**
     * Cálculos específicos de métricas ITSM
     */
    async calculateSLACompliance(entity) {`
        const query = `
            SELECT 
                COUNT(CASE WHEN resolved_at <= due_date THEN 1 END) * 100.0 / COUNT(*) as compliance_rate
            FROM ${entity}
            WHERE resolved_at IS NOT NULL`
        `;
        
        const result = await this.database.query(query);
        return result.rows[0]?.compliance_rate || 0;
    }
    
    async calculateMTTR(entity) {`
        const query = `
            SELECT 
                AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as mttr_hours
            FROM ${entity}
            WHERE resolved_at IS NOT NULL`
        `;
        
        const result = await this.database.query(query);
        return result.rows[0]?.mttr_hours || 0;
    }
    
    async calculateFCR() {`
        const query = `
            SELECT 
                COUNT(CASE WHEN resolution_attempts = 1 THEN 1 END) * 100.0 / COUNT(*) as fcr_rate
            FROM tickets
            WHERE status = 'resolved'`
        `;
        
        const result = await this.database.query(query);
        return result.rows[0]?.fcr_rate || 0;
    }
    
    async calculateCSAT(period) {
        const timeFilter = this.getTimeRange(period);`
        const query = `
            SELECT AVG(satisfaction_rating) as csat_score
            FROM tickets
            WHERE resolved_at BETWEEN $1 AND $2
            AND satisfaction_rating IS NOT NULL`
        `;
        
        const result = await this.database.query(query, [timeFilter.start, timeFilter.end]);
        return result.rows[0]?.csat_score || 0;
    }
    
    calculateTrend(metric, period) {
        // Implementar cálculo de tendência
        return { trend: 'up', percentage: 5.2 };
    }
    
    comparePeriods(metric, period1, period2) {
        // Implementar comparação entre períodos
        return { difference: 12.5, direction: 'increase' };
    }
    
    calculateGrowthRate(metric, period) {
        // Implementar cálculo de taxa de crescimento
        return { rate: 8.3, period };
    }
    
    estimateResultSize(ast) {
        // Estimativa básica baseada no AST
        if (ast.limit) {
            return Math.min(ast.limit, 1000);
        }
        return 1000; // Estimativa padrão
    }
}

module.exports = TQLService;`