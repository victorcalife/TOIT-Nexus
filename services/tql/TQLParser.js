/**
 * TQL PARSER QUÂNTICO - TOIT NEXUS
 * Parser para TQL com sintaxe quântica e contextual
 * 
 * Filosofia TQL:
 * - Operador "=" quântico que se adapta ao contexto
 * - Sintaxe temporal intuitiva (mes(-1), dia(-7))
 * - Intervalos naturais (mes(-3) e mes)
 * - Listas simples (valor1, valor2, valor3)
 */

class TQLParser
{
  constructor()
  {
    // Keywords básicas do TQL
    this.keywords = {
      'MOSTRAR': 'SELECT',
      'SOMAR': 'SUM',
      'CONTAR': 'COUNT',
      'MEDIA': 'AVG',
      'MAX': 'MAX',
      'MIN': 'MIN',
      'DE': 'FROM',
      'ONDE': 'WHERE',
      'AGRUPADO': 'GROUP BY',
      'ORDENADO': 'ORDER BY',
      'POR': 'BY',
      'LIMITE': 'LIMIT',
      'E': 'AND',
      'OU': 'OR'
    };

    // Operador quântico único
    this.quantumOperator = '=';

    // Padrões temporais quânticos
    this.temporalPatterns = {
      'mes': /^mes\((-?\d+)\)$/,
      'dia': /^dia\((-?\d+)\)$/,
      'ano': /^ano\((-?\d+)\)$/,
      'mesRange': /^mes\((-?\d+)\)\s+e\s+mes$/,
      'diaRange': /^dia\((-?\d+)\)\s+e\s+dia$/,
      'anoRange': /^ano\((-?\d+)\)\s+e\s+ano$/
    };
  }

  /**
   * Parse principal da query TQL quântica
   */
  parse( tqlQuery )
  {
    try
    {
      // Limpar e normalizar query
      const normalizedQuery = this.normalizeQuery( tqlQuery );

      // Parse da estrutura básica
      const parsed = this.parseBasicStructure( normalizedQuery );

      // Processar condições quânticas
      if ( parsed.where )
      {
        parsed.where = this.parseQuantumConditions( parsed.where );
      }

      return parsed;

    } catch ( error )
    {
      throw new Error( `Erro no parse TQL: ${ error.message }` );
    }
  }

  /**
   * Normalizar query
   */
  normalizeQuery( query )
  {
    return query
      .trim()
      .replace( /\s+/g, ' ' )
      .replace( /;$/, '' );
  }

  /**
   * Parse estrutura básica TQL
   */
  parseBasicStructure( query )
  {
    const tokens = this.tokenize( query );
    const parsed = {
      type: 'SELECT',
      action: null,
      fields: [],
      table: null,
      where: null,
      groupBy: [],
      orderBy: [],
      limit: null
    };

    let currentIndex = 0;

    // Parse ação principal
    const action = tokens[ currentIndex ];
    parsed.action = this.keywords[ action ] || action;
    currentIndex++;

    // Parse campos
    const deIndex = tokens.indexOf( 'DE' );
    if ( deIndex > currentIndex )
    {
      parsed.fields = tokens.slice( currentIndex, deIndex );
      currentIndex = deIndex;
    }

    // Parse tabela
    if ( tokens[ currentIndex ] === 'DE' )
    {
      currentIndex++;
      parsed.table = tokens[ currentIndex ];
      currentIndex++;
    }

    // Parse WHERE
    const whereIndex = tokens.indexOf( 'ONDE' );
    if ( whereIndex !== -1 )
    {
      const whereEnd = this.findKeywordIndex( tokens, [ 'AGRUPADO', 'ORDENADO', 'LIMITE' ], whereIndex + 1 );
      parsed.where = tokens.slice( whereIndex + 1, whereEnd === -1 ? tokens.length : whereEnd ).join( ' ' );
    }

    return parsed;
  }

  /**
   * Parse condições quânticas - O coração do TQL
   */
  parseQuantumConditions( whereClause )
  {
    const conditions = [];

    // Dividir por E/OU mantendo a lógica
    const parts = this.splitByLogicalOperators( whereClause );

    for ( const part of parts )
    {
      const condition = this.parseQuantumCondition( part.condition );
      condition.logical = part.operator;
      conditions.push( condition );
    }

    return conditions;
  }

  /**
   * Parse uma condição quântica individual
   */
  parseQuantumCondition( conditionStr )
  {
    const parts = conditionStr.split( '=' ).map( p => p.trim() );

    if ( parts.length !== 2 )
    {
      throw new Error( `Condição inválida: ${ conditionStr }` );
    }

    const field = parts[ 0 ];
    const value = parts[ 1 ];

    // Detectar tipo de condição baseado no valor
    return this.analyzeQuantumValue( field, value );
  }

  /**
   * Analisar valor quântico e determinar tipo de condição
   */
  analyzeQuantumValue( field, value )
  {
    // Verificar se é lista (vírgulas)
    if ( value.includes( ',' ) )
    {
      return this.createListCondition( field, value );
    }

    // Verificar se é intervalo temporal (padrão "e")
    if ( value.includes( ' e ' ) )
    {
      return this.createRangeCondition( field, value );
    }

    // Verificar se é função temporal
    if ( this.isTemporalFunction( value ) )
    {
      return this.createTemporalCondition( field, value );
    }

    // Condição simples de igualdade
    return this.createSimpleCondition( field, value );
  }

  /**
   * Criar condição de lista (IN)
   * Exemplo: status = "ativo", "pendente", "processando"
   */
  createListCondition( field, value )
  {
    const values = value.split( ',' ).map( v => v.trim().replace( /['"]/g, '' ) );
    return {
      type: 'list',
      field: field,
      operator: 'IN',
      values: values,
      sql: `${ field } IN (${ values.map( v => `'${ v }'` ).join( ', ' ) })`
    };
  }

  /**
   * Criar condição de intervalo temporal
   * Exemplo: admissao = mes(-3) e mes
   */
  createRangeCondition( field, value )
  {
    const parts = value.split( ' e ' ).map( p => p.trim() );
    const startValue = parts[ 0 ];
    const endValue = parts[ 1 ] || 'hoje';

    const startDate = this.calculateTemporalValue( startValue );
    const endDate = this.calculateTemporalValue( endValue );

    return {
      type: 'range',
      field: field,
      operator: 'BETWEEN',
      startValue: startDate,
      endValue: endDate,
      sql: `${ field } BETWEEN '${ startDate }' AND '${ endDate }'`
    };
  }

  /**
   * Criar condição temporal
   * Exemplo: admissao = mes(-1)
   */
  createTemporalCondition( field, value )
  {
    const temporalValue = this.calculateTemporalValue( value );

    // Se é uma função que retorna intervalo (como mes(-1))
    if ( value.match( /^mes\((-?\d+)\)$/ ) )
    {
      const monthOffset = parseInt( value.match( /^mes\((-?\d+)\)$/ )[ 1 ] );
      const { start, end } = this.getMonthRange( monthOffset );

      return {
        type: 'temporal_range',
        field: field,
        operator: 'BETWEEN',
        startValue: start,
        endValue: end,
        sql: `${ field } BETWEEN '${ start }' AND '${ end }'`
      };
    }

    // Condição temporal simples
    return {
      type: 'temporal',
      field: field,
      operator: '=',
      value: temporalValue,
      sql: `${ field } = '${ temporalValue }'`
    };
  }

  /**
   * Criar condição simples
   * Exemplo: idade = 25
   */
  createSimpleCondition( field, value )
  {
    const cleanValue = value.replace( /['"]/g, '' );

    return {
      type: 'simple',
      field: field,
      operator: '=',
      value: cleanValue,
      sql: `${ field } = '${ cleanValue }'`
    };
  }

  /**
   * Verificar se é função temporal
   */
  isTemporalFunction( value )
  {
    return value.match( /^(mes|dia|ano)\((-?\d+)\)$/ ) ||
      [ 'hoje', 'ontem', 'amanha' ].includes( value.toLowerCase() );
  }

  /**
   * Calcular valor temporal
   */
  calculateTemporalValue( value )
  {
    const now = new Date();

    // Funções temporais
    if ( value === 'hoje' )
    {
      return this.formatDate( now );
    }

    if ( value === 'ontem' )
    {
      const yesterday = new Date( now );
      yesterday.setDate( now.getDate() - 1 );
      return this.formatDate( yesterday );
    }

    if ( value === 'amanha' )
    {
      const tomorrow = new Date( now );
      tomorrow.setDate( now.getDate() + 1 );
      return this.formatDate( tomorrow );
    }

    if ( value === 'mes' )
    {
      return this.formatDate( now );
    }

    // Funções com offset
    const mesMatch = value.match( /^mes\((-?\d+)\)$/ );
    if ( mesMatch )
    {
      const offset = parseInt( mesMatch[ 1 ] );
      const targetDate = new Date( now );
      targetDate.setMonth( now.getMonth() + offset );
      return this.formatDate( targetDate );
    }

    const diaMatch = value.match( /^dia\((-?\d+)\)$/ );
    if ( diaMatch )
    {
      const offset = parseInt( diaMatch[ 1 ] );
      const targetDate = new Date( now );
      targetDate.setDate( now.getDate() + offset );
      return this.formatDate( targetDate );
    }

    const anoMatch = value.match( /^ano\((-?\d+)\)$/ );
    if ( anoMatch )
    {
      const offset = parseInt( anoMatch[ 1 ] );
      const targetDate = new Date( now );
      targetDate.setFullYear( now.getFullYear() + offset );
      return this.formatDate( targetDate );
    }

    return value;
  }

  /**
   * Obter intervalo de um mês
   */
  getMonthRange( monthOffset )
  {
    const now = new Date();
    const targetDate = new Date( now.getFullYear(), now.getMonth() + monthOffset, 1 );

    const start = new Date( targetDate.getFullYear(), targetDate.getMonth(), 1 );
    const end = new Date( targetDate.getFullYear(), targetDate.getMonth() + 1, 0 );

    return {
      start: this.formatDate( start ),
      end: this.formatDate( end )
    };
  }

  /**
   * Formatar data para SQL
   */
  formatDate( date )
  {
    return date.toISOString().split( 'T' )[ 0 ];
  }

  /**
   * Dividir por operadores lógicos
   */
  splitByLogicalOperators( whereClause )
  {
    const parts = [];
    const tokens = whereClause.split( /\s+(E|OU)\s+/ );

    for ( let i = 0; i < tokens.length; i += 2 )
    {
      const condition = tokens[ i ];
      const operator = tokens[ i + 1 ] || null;

      parts.push( {
        condition: condition.trim(),
        operator: operator
      } );
    }

    return parts;
  }

  /**
   * Tokenizar query
   */
  tokenize( query )
  {
    return query.split( /\s+/ ).filter( token => token.length > 0 );
  }

  /**
   * Encontrar índice de palavra-chave
   */
  findKeywordIndex( tokens, keywords, startIndex = 0 )
  {
    for ( let i = startIndex; i < tokens.length; i++ )
    {
      if ( keywords.includes( tokens[ i ] ) )
      {
        return i;
      }
    }
    return -1;
  }

  /**
   * Converter TQL para SQL
   */
  toSQL( parsed )
  {
    let sql = 'SELECT ';

    // Campos
    if ( parsed.action === 'COUNT' )
    {
      sql += 'COUNT(*)';
    } else if ( parsed.action === 'SUM' )
    {
      sql += `SUM(${ parsed.fields[ 0 ] || '*' })`;
    } else if ( parsed.action === 'AVG' )
    {
      sql += `AVG(${ parsed.fields[ 0 ] || '*' })`;
    } else if ( parsed.action === 'MAX' )
    {
      sql += `MAX(${ parsed.fields[ 0 ] || '*' })`;
    } else if ( parsed.action === 'MIN' )
    {
      sql += `MIN(${ parsed.fields[ 0 ] || '*' })`;
    } else
    {
      sql += parsed.fields.length > 0 ? parsed.fields.join( ', ' ) : '*';
    }

    // FROM
    if ( parsed.table )
    {
      sql += ` FROM ${ parsed.table }`;
    }

    // WHERE com condições quânticas
    if ( parsed.where && parsed.where.length > 0 )
    {
      const whereSQL = parsed.where.map( condition => condition.sql ).join( ' AND ' );
      sql += ` WHERE ${ whereSQL }`;
    }

    // GROUP BY
    if ( parsed.groupBy && parsed.groupBy.length > 0 )
    {
      sql += ` GROUP BY ${ parsed.groupBy.join( ', ' ) }`;
    }

    // ORDER BY
    if ( parsed.orderBy && parsed.orderBy.length > 0 )
    {
      sql += ` ORDER BY ${ parsed.orderBy.join( ', ' ) }`;
    }

    // LIMIT
    if ( parsed.limit )
    {
      sql += ` LIMIT ${ parsed.limit }`;
    }

    return sql;
  }

  /**
   * Validar query TQL
   */
  validate( tqlQuery )
  {
    const errors = [];

    try
    {
      const parsed = this.parse( tqlQuery );

      if ( !parsed.table )
      {
        errors.push( 'Query deve especificar uma tabela com DE' );
      }

    } catch ( error )
    {
      errors.push( error.message );
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Obter sugestões de autocomplete
   */
  getSuggestions( partialQuery, cursorPosition )
  {
    const suggestions = [];
    const beforeCursor = partialQuery.substring( 0, cursorPosition ).toUpperCase();

    if ( beforeCursor === '' || beforeCursor.endsWith( ' ' ) )
    {
      if ( beforeCursor === '' )
      {
        suggestions.push( ...[ 'MOSTRAR', 'SOMAR', 'CONTAR', 'MEDIA', 'MAX', 'MIN' ] );
      }

      if ( beforeCursor.match( /^(MOSTRAR|SOMAR|CONTAR|MEDIA|MAX|MIN)\s+/ ) )
      {
        suggestions.push( 'DE' );
      }

      if ( beforeCursor.includes( ' DE ' ) && !beforeCursor.includes( ' ONDE ' ) )
      {
        suggestions.push( 'ONDE' );
      }

      if ( beforeCursor.includes( ' ONDE ' ) )
      {
        suggestions.push( ...[ 'E', 'OU' ] );
      }
    }

    return suggestions;
  }
}

export default TQLParser;
