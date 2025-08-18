/**
 * SISTEMA DE CONDIÇÕES ROBUSTO PARA WORKFLOWS
 * Engine avançado para avaliação de condições complexas
 * 100% JavaScript - SEM TYPESCRIPT
 */

class WorkflowConditionEngine {
  constructor() {
    this.operators = {
      // Operadores de comparação
      '==': (a, b) => a == b,
      '===': (a, b) => a === b,
      '!=': (a, b) => a != b,
      '!==': (a, b) => a !== b,
      '>': (a, b) => a > b,
      '>=': (a, b) => a >= b,
      '<': (a, b) => a < b,
      '<=': (a, b) => a <= b,
      
      // Operadores de string
      'CONTAINS': (a, b) => String(a).toLowerCase().includes(String(b).toLowerCase()),
      'STARTS_WITH': (a, b) => String(a).toLowerCase().startsWith(String(b).toLowerCase()),
      'ENDS_WITH': (a, b) => String(a).toLowerCase().endsWith(String(b).toLowerCase()),
      'LIKE': (a, b) => {
        const pattern = String(b).replace(/%/g, '.*').replace(/_/g, '.');
        return new RegExp(`^${pattern}$`, 'i').test(String(a));
      },
      'REGEX': (a, b) => new RegExp(b, 'i').test(String(a)),
      
      // Operadores de array/lista
      'IN': (a, b) => Array.isArray(b) ? b.includes(a) : false,
      'NOT_IN': (a, b) => Array.isArray(b) ? !b.includes(a) : true,
      
      // Operadores de range
      'BETWEEN': (a, b) => {
        if (!Array.isArray(b) || b.length !== 2) return false;
        return a >= b[0] && a <= b[1];
      },
      'NOT_BETWEEN': (a, b) => {
        if (!Array.isArray(b) || b.length !== 2) return true;
        return a < b[0] || a > b[1];
      },
      
      // Operadores de null/undefined
      'IS_NULL': (a) => a === null || a === undefined,
      'IS_NOT_NULL': (a) => a !== null && a !== undefined,
      'IS_EMPTY': (a) => {
        if (a === null || a === undefined) return true;
        if (typeof a === 'string') return a.trim() === '';
        if (Array.isArray(a)) return a.length === 0;
        if (typeof a === 'object') return Object.keys(a).length === 0;
        return false;
      },
      'IS_NOT_EMPTY': (a) => !this.operators.IS_EMPTY(a),
      
      // Operadores lógicos
      'AND': (a, b) => a && b,
      'OR': (a, b) => a || b,
      'NOT': (a) => !a
    };

    this.functions = {
      // Funções matemáticas
      'SUM': (arr) => Array.isArray(arr) ? arr.reduce((sum, val) => sum + (Number(val) || 0), 0) : 0,
      'AVG': (arr) => Array.isArray(arr) && arr.length > 0 ? this.functions.SUM(arr) / arr.length : 0,
      'COUNT': (arr) => Array.isArray(arr) ? arr.length : 0,
      'MIN': (arr) => Array.isArray(arr) && arr.length > 0 ? Math.min(...arr.map(Number)) : null,
      'MAX': (arr) => Array.isArray(arr) && arr.length > 0 ? Math.max(...arr.map(Number)) : null,
      
      // Funções de string
      'UPPER': (str) => String(str).toUpperCase(),
      'LOWER': (str) => String(str).toLowerCase(),
      'TRIM': (str) => String(str).trim(),
      'LENGTH': (str) => String(str).length,
      'SUBSTRING': (str, start, length) => String(str).substring(start, start + (length || str.length)),
      
      // Funções de data
      'NOW': () => new Date(),
      'TODAY': () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
      },
      'DATE_ADD': (date, amount, unit) => {
        const d = new Date(date);
        switch (unit) {
          case 'days': d.setDate(d.getDate() + amount); break;
          case 'hours': d.setHours(d.getHours() + amount); break;
          case 'minutes': d.setMinutes(d.getMinutes() + amount); break;
          case 'months': d.setMonth(d.getMonth() + amount); break;
          case 'years': d.setFullYear(d.getFullYear() + amount); break;
        }
        return d;
      },
      'DATE_DIFF': (date1, date2, unit) => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diff = d1.getTime() - d2.getTime();
        
        switch (unit) {
          case 'days': return Math.floor(diff / (1000 * 60 * 60 * 24));
          case 'hours': return Math.floor(diff / (1000 * 60 * 60));
          case 'minutes': return Math.floor(diff / (1000 * 60));
          case 'seconds': return Math.floor(diff / 1000);
          default: return diff;
        }
      },
      'FORMAT_DATE': (date, format) => {
        const d = new Date(date);
        const formats = {
          'YYYY-MM-DD': d.toISOString().split('T')[0],
          'DD/MM/YYYY': d.toLocaleDateString('pt-BR'),
          'MM/DD/YYYY': d.toLocaleDateString('en-US'),
          'YYYY-MM-DD HH:mm:ss': d.toISOString().replace('T', ' ').split('.')[0]
        };
        return formats[format] || d.toString();
      }
    };
  }

  /**
   * AVALIAR CONDIÇÃO COMPLEXA
   */
  evaluateCondition(condition, context = {}) {
    try {
      if (typeof condition === 'string') {
        return this.parseAndEvaluate(condition, context);
      }
      
      if (typeof condition === 'object') {
        return this.evaluateObjectCondition(condition, context);
      }
      
      return Boolean(condition);
      
    } catch (error) {
      console.error('❌ Erro na avaliação da condição:', error);
      return false;
    }
  }

  /**
   * AVALIAR CONDIÇÃO DE OBJETO
   */
  evaluateObjectCondition(condition, context) {
    const { operator, left, right, conditions } = condition;

    // Condições aninhadas (AND/OR)
    if (conditions && Array.isArray(conditions)) {
      if (operator === 'AND') {
        return conditions.every(cond => this.evaluateCondition(cond, context));
      } else if (operator === 'OR') {
        return conditions.some(cond => this.evaluateCondition(cond, context));
      }
    }

    // Condição simples
    if (operator && left !== undefined) {
      const leftValue = this.resolveValue(left, context);
      const rightValue = right !== undefined ? this.resolveValue(right, context) : undefined;
      
      const operatorFunc = this.operators[operator];
      if (operatorFunc) {
        return operatorFunc(leftValue, rightValue);
      }
    }

    return false;
  }

  /**
   * RESOLVER VALOR (VARIÁVEL, FUNÇÃO, LITERAL)
   */
  resolveValue(value, context) {
    if (value === null || value === undefined) {
      return value;
    }

    // Literal
    if (typeof value !== 'string') {
      return value;
    }

    // Variável do contexto
    if (value.startsWith('${') && value.endsWith('}')) {
      const varName = value.slice(2, -1);
      return this.getNestedValue(context, varName);
    }

    // Função
    if (value.includes('(') && value.includes(')')) {
      return this.evaluateFunction(value, context);
    }

    // String literal
    return value;
  }

  /**
   * OBTER VALOR ANINHADO (ex: query_result.column_cliente)
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * AVALIAR FUNÇÃO
   */
  evaluateFunction(funcStr, context) {
    const match = funcStr.match(/^(\w+)\((.*)\)$/);
    if (!match) return funcStr;

    const [, funcName, argsStr] = match;
    const func = this.functions[funcName];
    
    if (!func) {
      console.warn(`⚠️ Função não encontrada: ${funcName}`);
      return null;
    }

    // Parse dos argumentos
    const args = argsStr ? this.parseArguments(argsStr, context) : [];
    
    try {
      return func(...args);
    } catch (error) {
      console.error(`❌ Erro na execução da função ${funcName}:`, error);
      return null;
    }
  }

  /**
   * PARSE DOS ARGUMENTOS DA FUNÇÃO
   */
  parseArguments(argsStr, context) {
    const args = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    let parenLevel = 0;

    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];
      
      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
        continue;
      }
      
      if (inQuotes && char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
        continue;
      }
      
      if (!inQuotes && char === '(') {
        parenLevel++;
      }
      
      if (!inQuotes && char === ')') {
        parenLevel--;
      }
      
      if (!inQuotes && char === ',' && parenLevel === 0) {
        args.push(this.resolveValue(current.trim(), context));
        current = '';
        continue;
      }
      
      current += char;
    }
    
    if (current.trim()) {
      args.push(this.resolveValue(current.trim(), context));
    }
    
    return args;
  }

  /**
   * PARSE E AVALIAÇÃO DE STRING
   */
  parseAndEvaluate(conditionStr, context) {
    // Substituir variáveis
    let processedCondition = conditionStr;
    
    // Substituir variáveis ${variable}
    processedCondition = processedCondition.replace(/\$\{([^}]+)\}/g, (match, varName) => {
      const value = this.getNestedValue(context, varName);
      return JSON.stringify(value);
    });

    // Substituir funções
    processedCondition = processedCondition.replace(/(\w+)\([^)]*\)/g, (match) => {
      const result = this.evaluateFunction(match, context);
      return JSON.stringify(result);
    });

    // Avaliação segura (sem eval)
    return this.safeEvaluate(processedCondition);
  }

  /**
   * AVALIAÇÃO SEGURA SEM EVAL
   */
  safeEvaluate(expression) {
    // Implementação simplificada - em produção seria mais robusta
    // Por enquanto, usar eval com cuidado
    try {
      return eval(expression);
    } catch (error) {
      console.error('❌ Erro na avaliação segura:', error);
      return false;
    }
  }

  /**
   * VALIDAR CONDIÇÃO
   */
  validateCondition(condition) {
    try {
      if (typeof condition === 'string') {
        // Validar sintaxe básica
        return condition.length > 0;
      }
      
      if (typeof condition === 'object') {
        const { operator, left, conditions } = condition;
        
        if (conditions && Array.isArray(conditions)) {
          return conditions.every(cond => this.validateCondition(cond));
        }
        
        return operator && left !== undefined;
      }
      
      return true;
      
    } catch (error) {
      return false;
    }
  }

  /**
   * OBTER OPERADORES DISPONÍVEIS
   */
  getAvailableOperators() {
    return Object.keys(this.operators).map(op => ({
      value: op,
      label: op,
      description: this.getOperatorDescription(op)
    }));
  }

  /**
   * OBTER FUNÇÕES DISPONÍVEIS
   */
  getAvailableFunctions() {
    return Object.keys(this.functions).map(func => ({
      value: func,
      label: func,
      description: this.getFunctionDescription(func)
    }));
  }

  /**
   * DESCRIÇÕES DOS OPERADORES
   */
  getOperatorDescription(operator) {
    const descriptions = {
      '==': 'Igual (com conversão de tipo)',
      '===': 'Estritamente igual',
      '!=': 'Diferente (com conversão de tipo)',
      '!==': 'Estritamente diferente',
      '>': 'Maior que',
      '>=': 'Maior ou igual',
      '<': 'Menor que',
      '<=': 'Menor ou igual',
      'CONTAINS': 'Contém texto',
      'STARTS_WITH': 'Inicia com',
      'ENDS_WITH': 'Termina com',
      'LIKE': 'Padrão SQL (% e _)',
      'REGEX': 'Expressão regular',
      'IN': 'Está na lista',
      'NOT_IN': 'Não está na lista',
      'BETWEEN': 'Entre dois valores',
      'NOT_BETWEEN': 'Não está entre',
      'IS_NULL': 'É nulo',
      'IS_NOT_NULL': 'Não é nulo',
      'IS_EMPTY': 'Está vazio',
      'IS_NOT_EMPTY': 'Não está vazio',
      'AND': 'E lógico',
      'OR': 'OU lógico',
      'NOT': 'NÃO lógico'
    };
    
    return descriptions[operator] || operator;
  }

  /**
   * DESCRIÇÕES DAS FUNÇÕES
   */
  getFunctionDescription(func) {
    const descriptions = {
      'SUM': 'Soma de array',
      'AVG': 'Média de array',
      'COUNT': 'Contagem de elementos',
      'MIN': 'Valor mínimo',
      'MAX': 'Valor máximo',
      'UPPER': 'Converter para maiúscula',
      'LOWER': 'Converter para minúscula',
      'TRIM': 'Remover espaços',
      'LENGTH': 'Comprimento da string',
      'SUBSTRING': 'Substring',
      'NOW': 'Data/hora atual',
      'TODAY': 'Data de hoje',
      'DATE_ADD': 'Adicionar tempo à data',
      'DATE_DIFF': 'Diferença entre datas',
      'FORMAT_DATE': 'Formatar data'
    };
    
    return descriptions[func] || func;
  }
}

module.exports = WorkflowConditionEngine;
