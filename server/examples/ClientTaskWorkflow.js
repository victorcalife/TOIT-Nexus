/**
 * EXEMPLO PRÁTICO: WORKFLOW CLIENTE → FUNCIONÁRIO
 * Implementação do caso de uso específico solicitado
 * Executar query → Analisar coluna → Criar tasks por funcionário
 */

const CLIENTE_FUNCIONARIO_WORKFLOW = {
  id: 'cliente-funcionario-workflow',
  name: 'Distribuição de Tarefas por Cliente',
  description: 'Executa query, analisa coluna cliente e cria tasks para funcionários específicos',
  version: '1.0.0',
  
  // Configuração do workflow
  config: {
    schedule: '0 9 * * 1-5', // Segunda a sexta, 9h
    enabled: true,
    timeout: 300000, // 5 minutos
    retryAttempts: 3
  },

  // Variáveis globais
  variables: {
    connectionId: 'postgres-principal',
    funcionarios: {
      'Cliente_A': 'user_id_joao_silva',
      'Cliente_B': 'user_id_maria_santos', 
      'Cliente_C': 'user_id_pedro_costa',
      'Cliente_D': 'user_id_ana_oliveira'
    },
    projectId: 'proj-atendimento-clientes'
  },

  // Definição dos nós
  nodes: [
    {
      id: 'start',
      type: 'start',
      position: { x: 100, y: 100 },
      data: {
        label: 'Início do Workflow'
      }
    },

    {
      id: 'query-clientes-pendentes',
      type: 'execute_query',
      position: { x: 100, y: 200 },
      data: {
        label: 'Buscar Clientes Pendentes',
        connectionId: '${connectionId}',
        query: `
          SELECT 
            c.id,
            c.nome as cliente,
            c.status,
            c.valor_pendente,
            c.data_ultimo_contato,
            c.prioridade,
            c.observacoes
          FROM clientes c
          WHERE c.status IN ('pendente', 'aguardando_contato')
            AND c.valor_pendente > 0
            AND (c.data_ultimo_contato IS NULL 
                 OR c.data_ultimo_contato < NOW() - INTERVAL '7 days')
          ORDER BY c.prioridade DESC, c.valor_pendente DESC
        `,
        parameters: {},
        saveAs: 'clientes_pendentes',
        timeout: 30000
      }
    },

    {
      id: 'verificar-resultados',
      type: 'condition',
      position: { x: 100, y: 300 },
      data: {
        label: 'Verificar se há clientes',
        condition: {
          operator: '>',
          left: '${clientes_pendentes.rowCount}',
          right: 0
        },
        trueValue: 'Há clientes para processar',
        falseValue: 'Nenhum cliente pendente',
        truePath: 'processar-clientes',
        falsePath: 'enviar-relatorio-vazio'
      }
    },

    {
      id: 'processar-clientes',
      type: 'loop',
      position: { x: 100, y: 400 },
      data: {
        label: 'Processar Cada Cliente',
        type: 'forEach',
        dataSource: '${clientes_pendentes.rows}',
        itemVariable: 'cliente_atual',
        indexVariable: 'cliente_index'
      }
    },

    {
      id: 'determinar-funcionario',
      type: 'condition',
      position: { x: 100, y: 500 },
      data: {
        label: 'Determinar Funcionário Responsável',
        conditions: [
          {
            operator: '==',
            left: '${cliente_atual.cliente}',
            right: 'Cliente_A'
          },
          {
            operator: '==',
            left: '${cliente_atual.cliente}',
            right: 'Cliente_B'
          },
          {
            operator: '==',
            left: '${cliente_atual.cliente}',
            right: 'Cliente_C'
          },
          {
            operator: '==',
            left: '${cliente_atual.cliente}',
            right: 'Cliente_D'
          }
        ],
        operator: 'OR'
      }
    },

    {
      id: 'criar-task-cliente-a',
      type: 'create_task',
      position: { x: 50, y: 600 },
      data: {
        label: 'Criar Task - Cliente A',
        title: 'Contatar ${cliente_atual.cliente} - Valor: R$ ${cliente_atual.valor_pendente}',
        description: `
          Cliente: ${cliente_atual.cliente}
          Status: ${cliente_atual.status}
          Valor Pendente: R$ ${cliente_atual.valor_pendente}
          Último Contato: ${cliente_atual.data_ultimo_contato}
          Prioridade: ${cliente_atual.prioridade}
          
          Observações: ${cliente_atual.observacoes}
          
          Ações necessárias:
          - Entrar em contato com o cliente
          - Verificar status do pagamento
          - Atualizar informações no sistema
          - Agendar follow-up se necessário
        `,
        assigneeId: '${funcionarios.Cliente_A}',
        priority: '${cliente_atual.prioridade}',
        dueDate: '${DATE_ADD(NOW(), 1, "days")}', // Prazo: 1 dia
        projectId: '${projectId}',
        tags: ['cliente', 'cobranca', 'urgente'],
        conditions: [
          {
            operator: '==',
            left: '${cliente_atual.cliente}',
            right: 'Cliente_A'
          }
        ]
      }
    },

    {
      id: 'criar-task-cliente-b',
      type: 'create_task',
      position: { x: 150, y: 600 },
      data: {
        label: 'Criar Task - Cliente B',
        title: 'Contatar ${cliente_atual.cliente} - Valor: R$ ${cliente_atual.valor_pendente}',
        description: `
          Cliente: ${cliente_atual.cliente}
          Status: ${cliente_atual.status}
          Valor Pendente: R$ ${cliente_atual.valor_pendente}
          Último Contato: ${cliente_atual.data_ultimo_contato}
          Prioridade: ${cliente_atual.prioridade}
          
          Observações: ${cliente_atual.observacoes}
          
          Ações necessárias:
          - Entrar em contato com o cliente
          - Verificar status do pagamento
          - Atualizar informações no sistema
          - Agendar follow-up se necessário
        `,
        assigneeId: '${funcionarios.Cliente_B}',
        priority: '${cliente_atual.prioridade}',
        dueDate: '${DATE_ADD(NOW(), 1, "days")}',
        projectId: '${projectId}',
        tags: ['cliente', 'cobranca', 'urgente'],
        conditions: [
          {
            operator: '==',
            left: '${cliente_atual.cliente}',
            right: 'Cliente_B'
          }
        ]
      }
    },

    {
      id: 'criar-task-cliente-c',
      type: 'create_task',
      position: { x: 250, y: 600 },
      data: {
        label: 'Criar Task - Cliente C',
        title: 'Contatar ${cliente_atual.cliente} - Valor: R$ ${cliente_atual.valor_pendente}',
        description: `
          Cliente: ${cliente_atual.cliente}
          Status: ${cliente_atual.status}
          Valor Pendente: R$ ${cliente_atual.valor_pendente}
          Último Contato: ${cliente_atual.data_ultimo_contato}
          Prioridade: ${cliente_atual.prioridade}
          
          Observações: ${cliente_atual.observacoes}
          
          Ações necessárias:
          - Entrar em contato com o cliente
          - Verificar status do pagamento
          - Atualizar informações no sistema
          - Agendar follow-up se necessário
        `,
        assigneeId: '${funcionarios.Cliente_C}',
        priority: '${cliente_atual.prioridade}',
        dueDate: '${DATE_ADD(NOW(), 1, "days")}',
        projectId: '${projectId}',
        tags: ['cliente', 'cobranca', 'urgente'],
        conditions: [
          {
            operator: '==',
            left: '${cliente_atual.cliente}',
            right: 'Cliente_C'
          }
        ]
      }
    },

    {
      id: 'criar-task-cliente-d',
      type: 'create_task',
      position: { x: 350, y: 600 },
      data: {
        label: 'Criar Task - Cliente D',
        title: 'Contatar ${cliente_atual.cliente} - Valor: R$ ${cliente_atual.valor_pendente}',
        description: `
          Cliente: ${cliente_atual.cliente}
          Status: ${cliente_atual.status}
          Valor Pendente: R$ ${cliente_atual.valor_pendente}
          Último Contato: ${cliente_atual.data_ultimo_contato}
          Prioridade: ${cliente_atual.prioridade}
          
          Observações: ${cliente_atual.observacoes}
          
          Ações necessárias:
          - Entrar em contato com o cliente
          - Verificar status do pagamento
          - Atualizar informações no sistema
          - Agendar follow-up se necessário
        `,
        assigneeId: '${funcionarios.Cliente_D}',
        priority: '${cliente_atual.prioridade}',
        dueDate: '${DATE_ADD(NOW(), 1, "days")}',
        projectId: '${projectId}',
        tags: ['cliente', 'cobranca', 'urgente'],
        conditions: [
          {
            operator: '==',
            left: '${cliente_atual.cliente}',
            right: 'Cliente_D'
          }
        ]
      }
    },

    {
      id: 'enviar-notificacao-funcionario',
      type: 'send_email',
      position: { x: 200, y: 700 },
      data: {
        label: 'Notificar Funcionário',
        to: '${LOOKUP_USER_EMAIL(funcionarios[cliente_atual.cliente])}',
        subject: 'Nova tarefa: Contatar ${cliente_atual.cliente}',
        body: `
          Olá!
          
          Uma nova tarefa foi criada para você:
          
          Cliente: ${cliente_atual.cliente}
          Valor Pendente: R$ ${cliente_atual.valor_pendente}
          Prioridade: ${cliente_atual.prioridade}
          Prazo: ${FORMAT_DATE(DATE_ADD(NOW(), 1, "days"), "DD/MM/YYYY")}
          
          Por favor, entre em contato com o cliente o mais breve possível.
          
          Acesse o sistema para mais detalhes.
          
          Atenciosamente,
          Sistema TOIT Nexus
        `,
        priority: 'high'
      }
    },

    {
      id: 'gerar-relatorio-final',
      type: 'generate_report',
      position: { x: 100, y: 800 },
      data: {
        label: 'Gerar Relatório Final',
        reportType: 'cliente-tasks-distribuidas',
        dataSource: '${clientes_pendentes}',
        format: 'pdf',
        recipients: ['gerencia@toit.com.br'],
        filters: {
          data_execucao: '${NOW()}',
          total_clientes: '${clientes_pendentes.rowCount}',
          funcionarios_envolvidos: '${UNIQUE(funcionarios)}'
        }
      }
    },

    {
      id: 'enviar-relatorio-vazio',
      type: 'send_email',
      position: { x: 300, y: 400 },
      data: {
        label: 'Relatório - Nenhum Cliente',
        to: 'gerencia@toit.com.br',
        subject: 'Workflow Clientes - Nenhum cliente pendente',
        body: `
          Relatório do Workflow de Distribuição de Tarefas
          
          Data/Hora: ${FORMAT_DATE(NOW(), "DD/MM/YYYY HH:mm:ss")}
          
          Status: Nenhum cliente pendente encontrado
          
          Critérios utilizados:
          - Status: pendente ou aguardando_contato
          - Valor pendente > 0
          - Último contato há mais de 7 dias
          
          Próxima execução: ${FORMAT_DATE(DATE_ADD(NOW(), 1, "days"), "DD/MM/YYYY 09:00")}
        `,
        priority: 'normal'
      }
    },

    {
      id: 'end',
      type: 'end',
      position: { x: 100, y: 900 },
      data: {
        label: 'Fim do Workflow'
      }
    }
  ],

  // Conexões entre nós
  edges: [
    { id: 'e1', source: 'start', target: 'query-clientes-pendentes' },
    { id: 'e2', source: 'query-clientes-pendentes', target: 'verificar-resultados' },
    { id: 'e3', source: 'verificar-resultados', target: 'processar-clientes', condition: 'true' },
    { id: 'e4', source: 'verificar-resultados', target: 'enviar-relatorio-vazio', condition: 'false' },
    { id: 'e5', source: 'processar-clientes', target: 'determinar-funcionario' },
    { id: 'e6', source: 'determinar-funcionario', target: 'criar-task-cliente-a', condition: 'Cliente_A' },
    { id: 'e7', source: 'determinar-funcionario', target: 'criar-task-cliente-b', condition: 'Cliente_B' },
    { id: 'e8', source: 'determinar-funcionario', target: 'criar-task-cliente-c', condition: 'Cliente_C' },
    { id: 'e9', source: 'determinar-funcionario', target: 'criar-task-cliente-d', condition: 'Cliente_D' },
    { id: 'e10', source: 'criar-task-cliente-a', target: 'enviar-notificacao-funcionario' },
    { id: 'e11', source: 'criar-task-cliente-b', target: 'enviar-notificacao-funcionario' },
    { id: 'e12', source: 'criar-task-cliente-c', target: 'enviar-notificacao-funcionario' },
    { id: 'e13', source: 'criar-task-cliente-d', target: 'enviar-notificacao-funcionario' },
    { id: 'e14', source: 'enviar-notificacao-funcionario', target: 'gerar-relatorio-final' },
    { id: 'e15', source: 'gerar-relatorio-final', target: 'end' },
    { id: 'e16', source: 'enviar-relatorio-vazio', target: 'end' }
  ]
};

module.exports = CLIENTE_FUNCIONARIO_WORKFLOW;
