const DatabaseService = require( './DatabaseService' );
const QuantumProcessor = require( './QuantumProcessor' );
const MilaService = require( './MilaService' );
const WorkflowNodes = require( './WorkflowNodes' );
const WorkflowConditionEngine = require( './WorkflowConditionEngine' );
const { db } = require( '../database-config' );

class WorkflowService
{
  constructor()
  {
    this.db = new DatabaseService();
    this.quantumProcessor = new QuantumProcessor();
    this.milaService = new MilaService();
    this.workflowNodes = new WorkflowNodes();
    this.conditionEngine = new WorkflowConditionEngine();

    // Tipos de nós suportados (EXPANDIDO)
    this.nodeTypes = {
      // Nós básicos
      'start': this.executeStartNode,
      'end': this.executeEndNode,
      'condition': this.executeConditionNode,
      'action': this.executeActionNode,
      'delay': this.executeDelayNode,

      // Nós de integração profissionais
      'execute_query': this.workflowNodes.executeQueryNode.bind( this.workflowNodes ),
      'create_task': this.workflowNodes.executeCreateTaskNode.bind( this.workflowNodes ),
      'send_email': this.workflowNodes.executeSendEmailNode.bind( this.workflowNodes ),
      'create_calendar_event': this.workflowNodes.executeCreateCalendarEventNode.bind( this.workflowNodes ),
      'generate_report': this.workflowNodes.executeGenerateReportNode.bind( this.workflowNodes ),
      'update_dashboard': this.workflowNodes.executeUpdateDashboardNode.bind( this.workflowNodes ),
      'mila_request': this.workflowNodes.executeMilaRequestNode.bind( this.workflowNodes ),
      'send_chat_message': this.workflowNodes.executeSendChatMessageNode.bind( this.workflowNodes ),

      // Nós legados (mantidos para compatibilidade)
      'email': this.executeEmailNode,
      'database': this.executeDatabaseNode,
      'api_call': this.executeApiCallNode,
      'quantum_process': this.executeQuantumProcessNode,
      'mila_analyze': this.executeMilaAnalyzeNode,
      'user_input': this.executeUserInputNode,
      'file_process': this.executeFileProcessNode,
      'notification': this.executeNotificationNode
    };
  }

  /**
   * Validar estrutura do workflow
   */
  async validateWorkflow( { nodes, edges } )
  {
    try
    {
      const errors = [];

      // Verificar se há pelo menos um nó de início
      const startNodes = nodes.filter( node => node.type === 'start' );
      if ( startNodes.length === 0 )
      {
        errors.push( 'Workflow deve ter pelo menos um nó de início' );
      }

      // Verificar se há pelo menos um nó de fim
      const endNodes = nodes.filter( node => node.type === 'end' );
      if ( endNodes.length === 0 )
      {
        errors.push( 'Workflow deve ter pelo menos um nó de fim' );
      }

      // Verificar se todos os nós têm IDs únicos
      const nodeIds = nodes.map( node => node.id );
      const uniqueIds = [ ...new Set( nodeIds ) ];
      if ( nodeIds.length !== uniqueIds.length )
      {
        errors.push( 'Todos os nós devem ter IDs únicos' );
      }

      // Verificar se todas as conexões são válidas
      edges.forEach( ( edge, index ) =>
      {
        const sourceExists = nodes.some( node => node.id === edge.source );
        const targetExists = nodes.some( node => node.id === edge.target );

        if ( !sourceExists )
        {
          errors.push( `Conexão ${ index + 1 }: nó de origem '${ edge.source }' não existe` );
        }

        if ( !targetExists )
        {
          errors.push( `Conexão ${ index + 1 }: nó de destino '${ edge.target }' não existe` );
        }
      } );

      // Verificar se há ciclos infinitos
      const hasCycles = this.detectCycles( nodes, edges );
      if ( hasCycles )
      {
        errors.push( 'Workflow contém ciclos infinitos' );
      }

      // Verificar se todos os nós são alcançáveis
      const unreachableNodes = this.findUnreachableNodes( nodes, edges );
      if ( unreachableNodes.length > 0 )
      {
        errors.push( `Nós não alcançáveis: ${ unreachableNodes.join( ', ' ) }` );
      }

      return {
        valid: errors.length === 0,
        errors
      };

    } catch ( error )
    {
      console.error( '❌ Erro na validação do workflow:', error );
      return {
        valid: false,
        errors: [ 'Erro na validação do workflow' ]
      };
    }
  }

  /**
   * Executar workflow
   */
  async executeWorkflow( { workflow, parameters = {}, dryRun = false, executionId, userId } )
  {
    try
    {
      console.log( `🔄 Iniciando execução do workflow: ${ workflow.name }` );

      const context = {
        workflowId: workflow.id,
        executionId,
        userId,
        parameters,
        dryRun,
        variables: {},
        results: {},
        startTime: Date.now()
      };

      // Encontrar nó de início
      const startNodes = workflow.nodes.filter( node => node.type === 'start' );
      if ( startNodes.length === 0 )
      {
        throw new Error( 'Nenhum nó de início encontrado' );
      }

      // Executar a partir do primeiro nó de início
      const result = await this.executeNode( startNodes[ 0 ], workflow, context );

      const endTime = Date.now();
      const executionTime = ( endTime - context.startTime ) / 1000;

      console.log( `✅ Workflow executado com sucesso em ${ executionTime }s` );

      return {
        success: true,
        result,
        context: {
          variables: context.variables,
          results: context.results,
          executionTime
        },
        dryRun
      };

    } catch ( error )
    {
      console.error( '❌ Erro na execução do workflow:', error );
      return {
        success: false,
        error: error.message,
        context: {
          variables: context?.variables || {},
          results: context?.results || {}
        },
        dryRun
      };
    }
  }

  /**
   * Executar nó específico
   */
  async executeNode( node, workflow, context )
  {
    try
    {
      console.log( `🔄 Executando nó: ${ node.id } (${ node.type })` );

      // Verificar se o tipo de nó é suportado
      const executor = this.nodeTypes[ node.type ];
      if ( !executor )
      {
        throw new Error( `Tipo de nó não suportado: ${ node.type }` );
      }

      // Executar nó
      const result = await executor.call( this, node, workflow, context );

      // Salvar resultado no contexto
      context.results[ node.id ] = result;

      // Se não é um nó de fim, continuar para próximos nós
      if ( node.type !== 'end' )
      {
        const nextNodes = this.getNextNodes( node.id, workflow.edges, workflow.nodes );

        for ( const nextNode of nextNodes )
        {
          await this.executeNode( nextNode, workflow, context );
        }
      }

      return result;

    } catch ( error )
    {
      console.error( `❌ Erro na execução do nó ${ node.id }:`, error );
      throw error;
    }
  }

  /**
   * Obter próximos nós
   */
  getNextNodes( currentNodeId, edges, nodes )
  {
    const nextNodeIds = edges
      .filter( edge => edge.source === currentNodeId )
      .map( edge => edge.target );

    return nodes.filter( node => nextNodeIds.includes( node.id ) );
  }

  /**
   * Executar nó de início
   */
  async executeStartNode( node, workflow, context )
  {
    console.log( `🚀 Iniciando workflow: ${ workflow.name }` );

    // Inicializar variáveis do contexto
    if ( node.data?.variables )
    {
      Object.assign( context.variables, node.data.variables );
    }

    return {
      type: 'start',
      status: 'completed',
      message: 'Workflow iniciado',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Executar nó de fim
   */
  async executeEndNode( node, workflow, context )
  {
    console.log( `🏁 Finalizando workflow: ${ workflow.name }` );

    return {
      type: 'end',
      status: 'completed',
      message: 'Workflow finalizado',
      timestamp: new Date().toISOString(),
      finalResults: context.results
    };
  }

  /**
   * Executar nó de condição (MELHORADO)
   */
  async executeConditionNode( node, workflow, context )
  {
    const {
      condition,
      conditions = [], // Para condições múltiplas
      operator = 'AND', // AND/OR para múltiplas condições
      trueValue,
      falseValue,
      truePath,
      falsePath
    } = node.data || {};

    if ( !condition && conditions.length === 0 )
    {
      throw new Error( 'Condição não definida' );
    }

    let result;

    // Avaliar condição única ou múltiplas
    if ( condition )
    {
      result = this.conditionEngine.evaluateCondition( condition, context );
    } else if ( conditions.length > 0 )
    {
      if ( operator === 'AND' )
      {
        result = conditions.every( cond => this.conditionEngine.evaluateCondition( cond, context ) );
      } else if ( operator === 'OR' )
      {
        result = conditions.some( cond => this.conditionEngine.evaluateCondition( cond, context ) );
      } else
      {
        result = this.conditionEngine.evaluateCondition( conditions[ 0 ], context );
      }
    }

    context.variables[ `${ node.id }_result` ] = result;
    context.variables[ `${ node.id }_value` ] = result ? trueValue : falseValue;

    return {
      type: 'condition',
      status: 'completed',
      result,
      value: result ? trueValue : falseValue,
      nextPath: result ? truePath : falsePath,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Executar nó de ação
   */
  async executeActionNode( node, workflow, context )
  {
    const { action, parameters } = node.data || {};

    if ( !action )
    {
      throw new Error( 'Ação não definida' );
    }

    if ( context.dryRun )
    {
      return {
        type: 'action',
        status: 'simulated',
        action,
        parameters,
        message: 'Ação simulada (dry run)',
        timestamp: new Date().toISOString()
      };
    }

    // Executar ação específica
    let result;
    switch ( action )
    {
      case 'create_record':
        result = await this.createRecord( parameters, context );
        break;
      case 'update_record':
        result = await this.updateRecord( parameters, context );
        break;
      case 'delete_record':
        result = await this.deleteRecord( parameters, context );
        break;
      case 'send_notification':
        result = await this.sendNotification( parameters, context );
        break;
      default:
        throw new Error( `Ação não suportada: ${ action }` );
    }

    return {
      type: 'action',
      status: 'completed',
      action,
      result,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Executar nó de email
   */
  async executeEmailNode( node, workflow, context )
  {
    const { to, subject, body, template } = node.data || {};

    if ( !to || !subject )
    {
      throw new Error( 'Destinatário e assunto são obrigatórios' );
    }

    if ( context.dryRun )
    {
      return {
        type: 'email',
        status: 'simulated',
        to,
        subject,
        message: 'Email simulado (dry run)',
        timestamp: new Date().toISOString()
      };
    }

    // Processar template se fornecido
    const processedBody = template ?
      this.processTemplate( template, context.variables ) : body;

    // Enviar email (implementação real seria integrada com serviço de email)
    console.log( `📧 Enviando email para: ${ to }` );
    console.log( `📧 Assunto: ${ subject }` );
    console.log( `📧 Corpo: ${ processedBody }` );

    return {
      type: 'email',
      status: 'completed',
      to,
      subject,
      body: processedBody,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Executar nó de banco de dados
   */
  async executeDatabaseNode( node, workflow, context )
  {
    const { operation, table, data, conditions } = node.data || {};

    if ( !operation || !table )
    {
      throw new Error( 'Operação e tabela são obrigatórias' );
    }

    if ( context.dryRun )
    {
      return {
        type: 'database',
        status: 'simulated',
        operation,
        table,
        message: 'Operação de banco simulada (dry run)',
        timestamp: new Date().toISOString()
      };
    }

    let result;
    switch ( operation )
    {
      case 'select':
        result = await this.db.query( `SELECT * FROM ${ table } WHERE ${ conditions || '1=1' }` );
        break;
      case 'insert':
        result = await this.db.query( `INSERT INTO ${ table } SET ?`, [ data ] );
        break;
      case 'update':
        result = await this.db.query( `UPDATE ${ table } SET ? WHERE ${ conditions }`, [ data ] );
        break;
      case 'delete':
        result = await this.db.query( `DELETE FROM ${ table } WHERE ${ conditions }` );
        break;
      default:
        throw new Error( `Operação não suportada: ${ operation }` );
    }

    return {
      type: 'database',
      status: 'completed',
      operation,
      table,
      result,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Executar nó de processamento quântico
   */
  async executeQuantumProcessNode( node, workflow, context )
  {
    const { algorithm, parameters, complexity = 2 } = node.data || {};

    if ( !algorithm )
    {
      throw new Error( 'Algoritmo quântico não especificado' );
    }

    if ( context.dryRun )
    {
      return {
        type: 'quantum_process',
        status: 'simulated',
        algorithm,
        message: 'Processamento quântico simulado (dry run)',
        timestamp: new Date().toISOString()
      };
    }

    const result = await this.quantumProcessor.processOperation( {
      type: algorithm,
      data: parameters,
      complexity,
      userId: context.userId
    } );

    return {
      type: 'quantum_process',
      status: result.success ? 'completed' : 'failed',
      algorithm,
      result,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Executar nó de análise MILA
   */
  async executeMilaAnalyzeNode( node, workflow, context )
  {
    const { analysisType, data, parameters } = node.data || {};

    if ( !analysisType )
    {
      throw new Error( 'Tipo de análise não especificado' );
    }

    if ( context.dryRun )
    {
      return {
        type: 'mila_analyze',
        status: 'simulated',
        analysisType,
        message: 'Análise MILA simulada (dry run)',
        timestamp: new Date().toISOString()
      };
    }

    const result = await this.milaService.processAnalysis( {
      type: analysisType,
      data,
      parameters,
      userId: context.userId
    } );

    return {
      type: 'mila_analyze',
      status: result.success ? 'completed' : 'failed',
      analysisType,
      result,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Detectar ciclos no workflow
   */
  detectCycles( nodes, edges )
  {
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycleDFS = ( nodeId ) =>
    {
      if ( recursionStack.has( nodeId ) )
      {
        return true;
      }

      if ( visited.has( nodeId ) )
      {
        return false;
      }

      visited.add( nodeId );
      recursionStack.add( nodeId );

      const neighbors = edges
        .filter( edge => edge.source === nodeId )
        .map( edge => edge.target );

      for ( const neighbor of neighbors )
      {
        if ( hasCycleDFS( neighbor ) )
        {
          return true;
        }
      }

      recursionStack.delete( nodeId );
      return false;
    };

    for ( const node of nodes )
    {
      if ( hasCycleDFS( node.id ) )
      {
        return true;
      }
    }

    return false;
  }

  /**
   * Encontrar nós não alcançáveis
   */
  findUnreachableNodes( nodes, edges )
  {
    const startNodes = nodes.filter( node => node.type === 'start' );
    const reachable = new Set();

    const markReachable = ( nodeId ) =>
    {
      if ( reachable.has( nodeId ) )
      {
        return;
      }

      reachable.add( nodeId );

      const neighbors = edges
        .filter( edge => edge.source === nodeId )
        .map( edge => edge.target );

      for ( const neighbor of neighbors )
      {
        markReachable( neighbor );
      }
    };

    // Marcar todos os nós alcançáveis a partir dos nós de início
    for ( const startNode of startNodes )
    {
      markReachable( startNode.id );
    }

    // Encontrar nós não alcançáveis
    return nodes
      .filter( node => !reachable.has( node.id ) )
      .map( node => node.id );
  }

  /**
   * Avaliar condição
   */
  evaluateCondition( condition, context )
  {
    try
    {
      // Implementação simplificada - em produção seria mais robusta
      const variables = context.variables;

      // Substituir variáveis na condição
      let processedCondition = condition;
      Object.keys( variables ).forEach( key =>
      {
        const regex = new RegExp( `\\$\\{${ key }\\}`, 'g' );
        processedCondition = processedCondition.replace( regex, variables[ key ] );
      } );

      // Avaliar condição (cuidado com eval em produção!)
      return eval( processedCondition );

    } catch ( error )
    {
      console.error( '❌ Erro na avaliação da condição:', error );
      return false;
    }
  }

  /**
   * Processar template
   */
  processTemplate( template, variables )
  {
    let processed = template;

    Object.keys( variables ).forEach( key =>
    {
      const regex = new RegExp( `\\$\\{${ key }\\}`, 'g' );
      processed = processed.replace( regex, variables[ key ] );
    } );

    return processed;
  }
}

module.exports = WorkflowService;
