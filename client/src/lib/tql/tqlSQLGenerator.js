/**
 * 4️⃣ SQL GENERATOR - Traduz TQL para queries executáveis
 * Suporte completo para PostgreSQL, MySQL, SQLite
 */

class SQLGenerator {
    constructor(dbType = 'postgres') {
        this.dbType = dbType;
        
        // Mapeamento de funções TQL para SQL
        this.functionMap = {
            'SOMAR': 'SUM',
            'MEDIA': 'AVG', 
            'CONTAR': 'COUNT',
            'MAXIMO': 'MAX',
            'MINIMO': 'MIN',
            'MOSTRAR': 'SELECT'
        };
        
        // Operadores de comparação
        this.operatorMap = {
            '=': '=',
            '!=': '!=',
            '>': '>',
            '<': '<',
            '>=': '>=',
            '<=': '<=',
            'TEM': 'LIKE',
            'NTEM': 'NOT LIKE',
            'EM': 'IN'
        };
        
        // Padrões de parsing
        this.patterns = {
            basicQuery: /^(SOMAR|MEDIA|CONTAR|MAXIMO|MINIMO|MOSTRAR)\s+(.+?)\s+DE\s+(\w+)(?:\s+ONDE\s+(.+?))?(?:\s+AGRUPADO\s+POR\s+(.+?))?(?:\s+(ASC|DESC))?$/i,
            ranking: /^RANKING\s+(\w+)\s+POR\s+(.+?)(?:\s+(ASC|DESC))?$/i,
            top: /^(TOP|PIOR)\s+(\d+)\s+(\w+)\s+POR\s+(.+?)$/i,
            temporal: /(DIA|MES|ANO)\(([+-]?\d+)\)/g,
            whereClause: /(.+?)\s*(=|!=|>|<|>=|<=|TEM|NTEM|EM)\s*(.+)/,
            logicalOp: /\s+(E|OU)\s+/g
        };
        
        console.log('🛠️ SQL Generator inicializado para:', dbType);
    }
    
    /**
     * Traduz query TQL para SQL
     */
    generateSQL(tqlQuery, schema) {
        console.log('🔄 Gerando SQL para:', tqlQuery);
        
        try {
            // Detectar tipo de query
            if (this.patterns.basicQuery.test(tqlQuery)) {
                return this.generateBasicQuery(tqlQuery, schema);
            } else if (this.patterns.ranking.test(tqlQuery)) {
                return this.generateRankingQuery(tqlQuery, schema);
            } else if (this.patterns.top.test(tqlQuery)) {
                return this.generateTopQuery(tqlQuery, schema);
            } else {
                throw new Error(`Padrão de query não reconhecido: ${tqlQuery}`);
            }
        } catch (error) {
            console.error('❌ Erro gerando SQL:', error.message);
            throw error;
        }
    }
    
    /**
     * Gera query básica: SOMAR campo DE tabela ONDE condições
     */
    generateBasicQuery(tqlQuery, schema) {
        console.log('📊 Gerando query básica...');
        
        const match = tqlQuery.match(this.patterns.basicQuery);
        if (!match) {
            throw new Error('Padrão de query básica inválido');
        }
        
        const [, action, field, table, whereClause, groupBy, orderBy] = match;
        
        // Construir SELECT
        let sql = 'SELECT ';
        
        if (action.toUpperCase() === 'MOSTRAR') {
            sql += field === '*' ? '*' : field;
        } else {
            const sqlFunction = this.functionMap[action.toUpperCase()];`
            sql += `${sqlFunction}(${field}) as result`;
        }
        
        // FROM`
        sql += ` FROM ${table}`;
        
        // WHERE
        if (whereClause) {
            const whereSQL = this.generateWhereClause(whereClause, schema);`
            sql += ` WHERE ${whereSQL}`;
        }
        
        // GROUP BY
        if (groupBy) {`
            sql += ` GROUP BY ${groupBy}`;
        }
        
        // ORDER BY
        if (orderBy) {`
            sql += ` ORDER BY ${field} ${orderBy}`;
        }
        
        console.log('✅ SQL gerado:', sql);
        return {
            sql: sql,
            type: 'basic',
            action: action.toLowerCase(),
            table: table,
            field: field
        };
    }
    
    /**
     * Gera query de ranking: RANKING tabela POR campo DESC
     */
    generateRankingQuery(tqlQuery, schema) {
        console.log('🏆 Gerando query de ranking...');
        
        const match = tqlQuery.match(this.patterns.ranking);
        if (!match) {
            throw new Error('Padrão de ranking inválido');
        }
        
        const [, table, field, order = 'DESC'] = match;
        `
        const sql = `SELECT *, ROW_NUMBER() OVER (ORDER BY ${field} ${order}) as ranking 
                     FROM ${table} `
                     ORDER BY ${field} ${order}`;
        
        console.log('✅ SQL ranking gerado:', sql);
        return {
            sql: sql,
            type: 'ranking',
            table: table,
            field: field,
            order: order
        };
    }
    
    /**
     * Gera query TOP/PIOR: TOP 10 tabela POR campo
     */
    generateTopQuery(tqlQuery, schema) {
        console.log('🔝 Gerando query TOP/PIOR...');
        
        const match = tqlQuery.match(this.patterns.top);
        if (!match) {
            throw new Error('Padrão TOP/PIOR inválido');
        }
        
        const [, type, limit, table, field] = match;
        const order = type.toUpperCase() === 'TOP' ? 'DESC' : 'ASC';
        `
        let sql = `SELECT * FROM ${table} ORDER BY ${field} ${order}`;
        
        // Adicionar LIMIT baseado no SGBD
        if (this.dbType === 'postgres' || this.dbType === 'mysql') {`
            sql += ` LIMIT ${limit}`;
        } else if (this.dbType === 'sqlserver') {`
            sql = `SELECT TOP ${limit} * FROM ${table} ORDER BY ${field} ${order}`;
        }
        
        console.log('✅ SQL TOP/PIOR gerado:', sql);
        return {
            sql: sql,
            type: 'top',
            table: table,
            field: field,
            limit: parseInt(limit),
            order: order
        };
    }
    
    /**
     * Gera cláusula WHERE
     */
    generateWhereClause(whereClause, schema) {
        console.log('🔍 Gerando WHERE:', whereClause);
        
        // Processar funções temporais primeiro
        let processedWhere = this.processTemporalFunctions(whereClause);
        
        // Dividir por operadores lógicos (E, OU)
        const conditions = this.splitLogicalConditions(processedWhere);
        
        // Processar cada condição
        const sqlConditions = conditions.map(condition => {
            return this.processCondition(condition.condition, schema);
        });
        
        // Reconstruir com operadores SQL
        let result = sqlConditions[0];
        for (let i = 1; i < conditions.length; i++) {
            const operator = conditions[i].operator === 'E' ? 'AND' : 'OR';`
            result += ` ${operator} ${sqlConditions[i]}`;
        }
        
        console.log('✅ WHERE gerado:', result);
        return result;
    }
    
    /**
     * Processa funções temporais
     */
    processTemporalFunctions(whereClause) ({ console.log('📅 Processando funções temporais...');
        
        return whereClause.replace(this.patterns.temporal, (match, unit, offset }) => {
            const num = parseInt(offset);
            
            switch (this.dbType) {
                case 'postgres':
                    return this.generatePostgresTemporal(unit, num);
                case 'mysql':
                    return this.generateMySQLTemporal(unit, num);
                default:
                    return this.generateGenericTemporal(unit, num);
            }
        });
    }
    
    generatePostgresTemporal(unit, offset) {
        const unitMap = {
            'DIA': 'days',
            'MES': 'months', 
            'ANO': 'years'
        };
        
        const sqlUnit = unitMap[unit];
        if (offset === 0) {
            return unit === 'DIA' ? 'CURRENT_DATE' : 
                   unit === 'MES' ? 'DATE_TRUNC(\'month\', CURRENT_DATE)' :
                   'DATE_TRUNC(\'year\', CURRENT_DATE)';
        }
        
        const operator = offset > 0 ? '+' : '';`
        return `CURRENT_DATE ${operator} INTERVAL '${offset} ${sqlUnit}'`;
    }
    
    generateMySQLTemporal(unit, offset) {
        const unitMap = {
            'DIA': 'DAY',
            'MES': 'MONTH',
            'ANO': 'YEAR'
        };
        
        const sqlUnit = unitMap[unit];
        if (offset === 0) {
            return 'CURDATE()';
        }
        `
        return `DATE_ADD(CURDATE(), INTERVAL ${offset} ${sqlUnit})`;
    }
    
    generateGenericTemporal(unit, offset) {
        // Fallback para outros SGBDs`
        return `DATE('now', '${offset > 0 ? '+' : ''}${offset} ${unit.toLowerCase()}')`;
    }
    
    /**
     * Divide condições lógicas (E, OU)
     */
    splitLogicalConditions(whereClause) {
        const conditions = [];
        const parts = whereClause.split(/\s+(E|OU)\s+/i);
        
        conditions.push({ condition: parts[0], operator: null });
        
        for (let i = 1; i < parts.length; i += 2) {
            conditions.push({
                operator: parts[i].toUpperCase(),
                condition: parts[i + 1]
            });
        }
        
        return conditions;
    }
    
    /**
     * Processa condição individual
     */
    processCondition(condition, schema) {
        console.log('🔍 Processando condição:', condition);
        
        const match = condition.match(this.patterns.whereClause);
        if (!match) {`
            throw new Error(`Condição inválida: ${condition}`);
        }
        
        const [, field, operator, value] = match;
        const sqlOperator = this.operatorMap[operator] || operator;
        
        // Processar valor
        let processedValue = this.processValue(value, operator);
        
        // Validar campo no schema (se disponível)
        if (schema && !this.validateField(field, schema)) {
            console.warn('⚠️ Campo não encontrado no schema:', field);
        }
        `
        return `${field.trim()} ${sqlOperator} ${processedValue}`;
    }
    
    /**
     * Processa valor da condição
     */
    processValue(value, operator) {
        value = value.trim();
        
        // Remover aspas se existirem
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        
        // Processar baseado no operador
        switch (operator) {
            case 'TEM':`
                return `'%${value}%'`;
            case 'NTEM':`
                return `'%${value}%'`;
            case 'EM':
                // Lista de valores: (val1, val2, val3)
                if (value.startsWith('(') && value.endsWith(')')) {
                    return value;
                }`
                return `('${value}')`;
            default:
                // Número ou string
                if (/^\d+(\.\d+)?$/.test(value)) {
                    return value; // Número
                } else {`
                    return `'${value}'`; // String
                }
        }
    }
    
    /**
     * Valida campo no schema
     */
    validateField(field, schema) {
        // Implementar validação baseada no schema descoberto
        // Por enquanto, sempre retornar true
        return true;
    }
    
    /**
     * Gera SQL otimizado para diferentes SGBDs
     */
    optimizeForDatabase(sql, dbType) {
        console.log('⚡ Otimizando SQL para:', dbType);
        
        switch (dbType) {
            case 'postgres':
                return this.optimizePostgreSQL(sql);
            case 'mysql':
                return this.optimizeMySQL(sql);
            case 'sqlserver':
                return this.optimizeSQLServer(sql);
            default:
                return sql;
        }
    }
    
    optimizePostgreSQL(sql) {
        // Otimizações específicas do PostgreSQL
        // Usar ILIKE para case-insensitive
        sql = sql.replace(/LIKE/g, 'ILIKE');
        
        // Usar DATE_TRUNC para datas
        sql = sql.replace(/DATE\(/g, 'DATE_TRUNC(\'day\', ');
        
        return sql;
    }
    
    optimizeMySQL(sql) {
        // Otimizações específicas do MySQL
        // Usar backticks para nomes de colunas reservadas`
        sql = sql.replace(/\b(order|group|index)\b/gi, '`$1`');
        
        return sql;
    }
    
    optimizeSQLServer(sql) {
        // Otimizações específicas do SQL Server
        // Usar TOP ao invés de LIMIT
        sql = sql.replace(/LIMIT (\d+)/g, 'TOP $1');
        
        return sql;
    }
    
    /**
     * Gera query de agregação para dashboard
     */
    generateAggregationQuery(widgets, schema) {
        console.log('📊 Gerando query de agregação para dashboard...');
        
        const queries = [];
        
        for (const widget of widgets) {
            if (widget.type === 'kpi') {
                const sql = this.generateKPIQuery(widget, schema);
                queries.push({
                    widget: widget.id,
                    sql: sql,
                    type: 'kpi'
                });
            } else if (widget.type === 'chart') {
                const sql = this.generateChartQuery(widget, schema);
                queries.push({
                    widget: widget.id,
                    sql: sql,
                    type: 'chart'
                });
            }
        }
        
        console.log('✅ Queries de agregação geradas:', queries.length);
        return queries;
    }
    
    /**
     * Gera query para KPI
     */
    generateKPIQuery(widget, schema) {
        // Widget KPI já tem a variável resolvida
        // Retornar query simples para buscar o valor
        return {`
            sql: `SELECT ${widget.variable} as value`,
            params: [],
            format: widget.config.format
        };
    }
    
    /**
     * Gera query para gráfico
     */
    generateChartQuery(widget, schema) {
        console.log('📈 Gerando query para gráfico:', widget.chartType);
        
        // Processar dados do gráfico
        const dataQuery = widget.data;
        
        // Se dados são variáveis, usar subquery
        if (this.isVariable(dataQuery)) {
            return {`
                sql: `SELECT value FROM variables WHERE name = '${dataQuery}'`,
                params: [],
                chartType: widget.chartType
            };
        }
        
        // Se dados são query TQL, converter para SQL
        const sqlResult = this.generateSQL(dataQuery, schema);
        return {
            sql: sqlResult.sql,
            params: [],
            chartType: widget.chartType
        };
    }
    
    isVariable(data) {
        return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(data.trim());
    }
}

module.exports = { SQLGenerator };`