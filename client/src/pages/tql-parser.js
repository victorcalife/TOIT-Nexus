// TQL Parser - TOIT Query Language
// Sistema de filtros simplificado específico para o TOIT Portal

class TQLParser {
    constructor() {
        // Campos disponíveis no sistema TOIT
        this.fields = {
            'titulo': 'Título da tarefa',
            'responsavel': 'Responsável',
            'status': 'Status atual',
            'prioridade': 'Nível de prioridade',
            'cliente': 'Cliente/Empresa',
            'sistema': 'Sistema (Portal, OMS, etc)',
            'criado': 'Data de criação',
            'vencimento': 'Data de vencimento',
            'tipo': 'Tipo (tarefa, bug, feature)',
            'projeto': 'Projeto relacionado',
            'tags': 'Tags/Labels'
        };

        // Operadores simples
        this.operators = {
            ':': 'contém',
            '=': 'igual a',
            '!=': 'diferente de',
            '>': 'maior que',
            '<': 'menor que',
            'é': 'igual a',
            'não': 'diferente de',
            'tem': 'contém'
        };

        // Valores comuns
        this.values = {
            status: ['todo', 'fazendo', 'revisao', 'pronto', 'bloqueado'],
            prioridade: ['critica', 'alta', 'media', 'baixa'],
            cliente: ['blueworld', 'demo', 'toit'],
            sistema: ['portal', 'oms', 'tradia', 'easis'],
            tipo: ['tarefa', 'bug', 'feature', 'melhoria']
        };

        // Exemplos de uso
        this.examples = [
            'responsavel:victor',
            'status=fazendo',
            'prioridade:alta',
            'cliente:blueworld',
            'titulo:login',
            'sistema=portal',
            'vencimento<hoje',
            'criado>ontem'
        ];
    }

    // Parser principal - muito mais simples que JQL
    parse(query) {
        if (!query || !query.trim()) {
            return { 
                isValid: true, 
                filters: [],
                error: null 
            };
        }

        try {
            const filters = this.parseQuery(query.trim());
            
            return {
                isValid: true,
                filters: filters,
                error: null
            };
        } catch (error) {
            return {
                isValid: false,
                filters: [],
                error: error.message
            };
        }
    }

    // Quebrar query em filtros individuais
    parseQuery(query) {
        const filters = [];
        
        // Separar por espaços, mas manter strings entre aspas
        const parts = this.splitQuery(query);
        
        for (const part of parts) {
            if (part.trim()) {
                const filter = this.parseFilter(part.trim());
                if (filter) {
                    filters.push(filter);
                }
            }
        }
        
        return filters;
    }

    // Separar query respeitando aspas
    splitQuery(query) {
        const parts = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        
        for (let i = 0; i < query.length; i++) {
            const char = query[i];
            
            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
                current += char;
            } else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                quoteChar = '';
                current += char;
            } else if (char === ' ' && !inQuotes) {
                if (current.trim()) {
                    parts.push(current.trim());
                    current = '';
                }
            } else {
                current += char;
            }
        }
        
        if (current.trim()) {
            parts.push(current.trim());
        }
        
        return parts;
    }

    // Parser individual de cada filtro
    parseFilter(filterStr) {
        // Detectar operador
        let operator = null;
        let field = null;
        let value = null;
        
        // Tentar operadores de dois caracteres primeiro
        for (const op of ['!=', '>=', '<=']) {
            if (filterStr.includes(op)) {
                const parts = filterStr.split(op);
                if (parts.length === 2) {
                    field = parts[0].trim();
                    value = parts[1].trim();
                    operator = op;
                    break;
                }
            }
        }
        
        // Depois operadores de um caractere
        if (!operator) {
            for (const op of [':', '=', '>', '<']) {
                if (filterStr.includes(op)) {
                    const parts = filterStr.split(op);
                    if (parts.length === 2) {
                        field = parts[0].trim();
                        value = parts[1].trim();
                        operator = op;
                        break;
                    }
                }
            }
        }
        
        // Se não encontrou operador, tratar como busca geral
        if (!operator) {
            return {
                type: 'search',
                field: 'titulo',
                operator: ':',
                value: filterStr,
                description: `Buscar "${filterStr}" no título`
            };
        }
        
        // Limpar aspas do valor
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }
        if (value.startsWith("'") && value.endsWith("'")) {
            value = value.slice(1, -1);
        }
        
        // Validar campo
        if (!this.fields[field.toLowerCase()]) {
            throw new Error(`Campo desconhecido: ${field}`);
        }
        
        return {
            type: 'filter',
            field: field.toLowerCase(),
            operator: operator,
            value: value,
            description: `${this.fields[field.toLowerCase()]} ${this.operators[operator]} "${value}"`
        };
    }

    // Executar filtros nos dados
    execute(filters, data) {
        if (!filters || !filters.length) {
            return data;
        }
        
        return data.filter(item => {
            return filters.every(filter => this.evaluateFilter(filter, item));
        });
    }

    // Avaliar um filtro individual
    evaluateFilter(filter, item) {
        const fieldValue = this.getFieldValue(item, filter.field);
        const filterValue = filter.value.toLowerCase();
        
        if (!fieldValue) {
            return false;
        }
        
        const itemValue = String(fieldValue).toLowerCase();
        
        switch (filter.operator) {
            case ':':
            case 'tem':
                return itemValue.includes(filterValue);
            case '=':
            case 'é':
                return itemValue === filterValue;
            case '!=':
            case 'não':
                return itemValue !== filterValue;
            case '>':
                return this.compareValues(fieldValue, filter.value) > 0;
            case '<':
                return this.compareValues(fieldValue, filter.value) < 0;
            case '>=':
                return this.compareValues(fieldValue, filter.value) >= 0;
            case '<=':
                return this.compareValues(fieldValue, filter.value) <= 0;
            default:
                return true;
        }
    }

    // Obter valor do campo do item
    getFieldValue(item, field) {
        const fieldMap = {
            'titulo': item.title || item.titulo,
            'responsavel': item.assignee || item.responsavel,
            'status': item.status,
            'prioridade': item.priority || item.prioridade,
            'cliente': item.client || item.cliente,
            'sistema': item.system || item.sistema,
            'criado': item.created || item.criado,
            'vencimento': item.due || item.vencimento,
            'tipo': item.type || item.tipo,
            'projeto': item.project || item.projeto,
            'tags': item.labels || item.tags
        };
        
        return fieldMap[field];
    }

    // Comparar valores (numérico quando possível)
    compareValues(a, b) {
        // Tentar comparação numérica
        const numA = Number(a);
        const numB = Number(b);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        
        // Comparação de string
        return String(a).localeCompare(String(b));
    }

    // Sugestões baseadas no contexto
    getSuggestions(query, cursorPosition) {
        const beforeCursor = query.substring(0, cursorPosition);
        const suggestions = [];
        
        // Se está vazio, mostrar exemplos
        if (!beforeCursor.trim()) {
            this.examples.forEach(example => {
                suggestions.push({
                    type: 'example',
                    text: example,
                    description: 'Exemplo de filtro',
                    insertText: example
                });
            });
            return suggestions;
        }
        
        // Se está digitando um campo
        const lastWord = beforeCursor.split(' ').pop();
        if (!lastWord.includes(':') && !lastWord.includes('=')) {
            Object.keys(this.fields).forEach(field => {
                if (field.toLowerCase().startsWith(lastWord.toLowerCase())) {
                    suggestions.push({
                        type: 'field',
                        text: field,
                        description: this.fields[field],
                        insertText: field + ':'
                    });
                }
            });
        }
        
        // Se acabou de digitar um campo, sugerir valores
        if (lastWord.includes(':') || lastWord.includes('=')) {
            const parts = lastWord.split(/[:=]/);
            if (parts.length === 2) {
                const field = parts[0];
                const partialValue = parts[1];
                
                if (this.values[field]) {
                    this.values[field].forEach(value => {
                        if (value.toLowerCase().startsWith(partialValue.toLowerCase())) {
                            suggestions.push({
                                type: 'value',
                                text: value,
                                description: `${this.fields[field]}: ${value}`,
                                insertText: value
                            });
                        }
                    });
                }
            }
        }
        
        return suggestions.slice(0, 8); // Máximo 8 sugestões
    }

    // Validar query em tempo real
    validateRealtime(query) {
        if (!query.trim()) {
            return { isValid: true, message: 'Digite um filtro...' };
        }
        
        try {
            const result = this.parse(query);
            if (result.isValid) {
                const filterCount = result.filters.length;
                return { 
                    isValid: true, 
                    message: `${filterCount} filtro${filterCount !== 1 ? 's' : ''} aplicado${filterCount !== 1 ? 's' : ''}` 
                };
            } else {
                return { isValid: false, message: result.error };
            }
        } catch (error) {
            return { isValid: false, message: error.message };
        }
    }
}

// Tornar disponível globalmente
window.TQLParser = TQLParser;

// Criar instância global
window.tqlParser = new TQLParser();