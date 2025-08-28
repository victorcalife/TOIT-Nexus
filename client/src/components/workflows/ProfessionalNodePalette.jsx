/**
 * PALETA DE NÓIS PROFISSIONAIS PARA WORKFLOWS
 * Componente com todos os nós necessários para competir
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React from 'react';
import {  
  Play, Square, GitBranch, Clock, Database, CheckSquare,
  Mail, Calendar, FileText, BarChart3, MessageSquare,
  Bot, Webhook, FileUp, Bell, Code, Repeat, Zap,
  Users, Settings, Filter, Link, Plus, Search }
} from 'lucide-react';

export const PROFESSIONAL_NODE_TYPES = {
  TRIGGERS: {
    category: 'Gatilhos',
    color: '#10B981',
    nodes: [
      {
        type: 'schedule_trigger',
        label: 'Agendamento',
        icon: Clock,
        description: 'Executar em horários específicos',
        config: {
          schedule: '0 9 * * 1-5', // Cron expression
          timezone: 'America/Sao_Paulo'
        }
      },
      {
        type: 'webhook_trigger',
        label: 'Webhook',
        icon: Webhook,
        description: 'Executar via chamada HTTP',
        config: {
          method: 'POST',
          authentication: 'bearer'
        }
      },
      {
        type: 'data_change_trigger',
        label: 'Mudança de Dados',
        icon: Database,
        description: 'Executar quando dados mudarem',
        config: {
          table: '',
          operation: 'INSERT', // INSERT, UPDATE, DELETE
          conditions: []
        }
      },
      {
        type: 'email_received_trigger',
        label: 'Email Recebido',
        icon: Mail,
        description: 'Executar ao receber email',
        config: {
          from: '',
          subject_contains: '',
          folder: 'inbox'
        }
      }
    ]
  },

  CONDITIONS: {
    category: 'Condições',
    color: '#F59E0B',
    nodes: [
      {
        type: 'condition',
        label: 'Condição Simples',
        icon: GitBranch,
        description: 'Decisão baseada em uma condição',
        config: {
          condition: '',
          operator: '==',
          value: '',
          trueValue: 'Verdadeiro',
          falseValue: 'Falso'
        }
      },
      {
        type: 'multi_condition',
        label: 'Condições Múltiplas',
        icon: Filter,
        description: 'Decisão baseada em múltiplas condições',
        config: {
          conditions: [],
          operator: 'AND', // AND, OR
          trueValue: 'Verdadeiro',
          falseValue: 'Falso'
        }
      },
      {
        type: 'query_condition',
        label: 'Condição de Query',
        icon: Database,
        description: 'Decisão baseada em resultado de query',
        config: {
          query: '',
          column: '',
          operator: '==',
          value: '',
          connectionId: ''
        }
      }
    ]
  },

  INTEGRATIONS: {
    category: 'Integrações',
    color: '#3B82F6',
    nodes: [
      {
        type: 'execute_query',
        label: 'Executar Query',
        icon: Database,
        description: 'Executar query SQL em banco de dados',
        config: {
          connectionId: '',
          query: '',
          parameters: {},
          saveAs: 'query_result',
          timeout: 30000
        }
      },
      {
        type: 'create_task',
        label: 'Criar Tarefa',
        icon: CheckSquare,
        description: 'Criar tarefa para usuário específico',
        config: {
          title: '',
          description: '',
          assigneeId: '',
          assigneeMapping: {
            field: '${query_result.cliente}',
            mapping: {
              'Cliente_A': 'user_id_funcionario_a',
              'Cliente_B': 'user_id_funcionario_b',
              'Cliente_C': 'user_id_funcionario_c'
            }
          },
          priority: 'medium',
          dueDate: '',
          projectId: '',
          tags: [],
          conditions: []
        }
      },
      {
        type: 'send_email',
        label: 'Enviar Email',
        icon: Mail,
        description: 'Enviar email personalizado',
        config: {
          to: '',
          cc: '',
          bcc: '',
          subject: '',
          body: '',
          template: '',
          priority: 'normal',
          scheduledSend: null,
          conditions: []
        }
      },
      {
        type: 'create_calendar_event',
        label: 'Criar Evento',
        icon: Calendar,
        description: 'Criar evento no calendário',
        config: {
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          attendees: [],
          location: '',
          isOnline: false,
          reminders: [],
          conditions: []
        }
      },
      {
        type: 'generate_report',
        label: 'Gerar Relatório',
        icon: FileText,
        description: 'Gerar relatório personalizado',
        config: {
          reportType: '',
          dataSource: '',
          filters: {},
          format: 'pdf',
          recipients: [],
          conditions: []
        }
      },
      {
        type: 'update_dashboard',
        label: 'Atualizar Dashboard',
        icon: BarChart3,
        description: 'Atualizar widget do dashboard',
        config: {
          dashboardId: '',
          widgetId: '',
          action: 'update', // update, add, remove
          widgetConfig: {},
          dataSource: '',
          conditions: []
        }
      },
      {
        type: 'mila_request',
        label: 'Solicitar MILA',
        icon: Bot,
        description: 'Fazer solicitação para MILA AI',
        config: {
          requestType: 'analyze',
          prompt: '',
          data: '',
          useQuantum: true,
          saveAs: 'mila_response',
          conditions: []
        }
      },
      {
        type: 'send_chat_message',
        label: 'Enviar Mensagem',
        icon: MessageSquare,
        description: 'Enviar mensagem no chat',
        config: {
          recipients: [], // Array de user IDs
          message: '',
          channel: '',
          messageType: 'text',
          attachments: [],
          conditions: []
        }
      }
    ]
  },

  ACTIONS: {
    category: 'Ações',
    color: '#8B5CF6',
    nodes: [
      {
        type: 'api_call',
        label: 'Chamada API',
        icon: Code,
        description: 'Fazer chamada para API externa',
        config: {
          url: '',
          method: 'GET',
          headers: {},
          body: {},
          authentication: 'none',
          timeout: 30000
        }
      },
      {
        type: 'webhook',
        label: 'Webhook',
        icon: Webhook,
        description: 'Enviar dados via webhook',
        config: {
          url: '',
          method: 'POST',
          headers: {},
          body: {},
          retries: 3
        }
      },
      {
        type: 'file_process',
        label: 'Processar Arquivo',
        icon: FileUp,
        description: 'Processar arquivo (upload/download)',
        config: {
          action: 'upload', // upload, download, process
          source: '',
          destination: '',
          format: 'auto'
        }
      },
      {
        type: 'notification',
        label: 'Notificação',
        icon: Bell,
        description: 'Enviar notificação push',
        config: {
          title: '',
          message: '',
          recipients: [],
          type: 'info', // info, success, warning, error
          actions: []
        }
      },
      {
        type: 'delay',
        label: 'Aguardar',
        icon: Clock,
        description: 'Aguardar tempo específico',
        config: {
          duration: 5000, // milliseconds
          unit: 'seconds' // seconds, minutes, hours
        }
      }
    ]
  },

  CONTROL: {
    category: 'Controle',
    color: '#EF4444',
    nodes: [
      {
        type: 'loop',
        label: 'Loop',
        icon: Repeat,
        description: 'Repetir ações em loop',
        config: {
          type: 'for', // for, while, forEach
          iterations: 10,
          condition: '',
          dataSource: ''
        }
      },
      {
        type: 'parallel',
        label: 'Paralelo',
        icon: Zap,
        description: 'Executar ações em paralelo',
        config: {
          branches: [],
          waitForAll: true,
          timeout: 60000
        }
      },
      {
        type: 'user_input',
        label: 'Entrada do Usuário',
        icon: Users,
        description: 'Aguardar entrada do usuário',
        config: {
          prompt: '',
          inputType: 'text', // text, number, select, boolean
          options: [],
          required: true,
          timeout: 300000 // 5 minutes
        }
      },
      {
        type: 'data_transform',
        label: 'Transformar Dados',
        icon: Settings,
        description: 'Transformar/mapear dados',
        config: {
          inputData: '',
          transformations: [],
          outputFormat: 'json'
        }
      }
    ]
  }
};

export const ProfessionalNodePalette = ({ onNodeSelect, searchQuery = '' }) => ({ const filteredCategories = Object.entries(PROFESSIONAL_NODE_TYPES).map(([key, category] }) => ({
    key,
    ...category,
    nodes: category.nodes.filter(node => 
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.nodes.length > 0);

  return (
    <div className="space-y-4">
      {filteredCategories.map(category => (
        <div key={category.key} className="space-y-2">
          <h3 
            className="font-semibold text-sm text-gray-700 flex items-center gap-2"
            style={{ color: category.color }}
          >
            {category.category}
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {category.nodes.length}
            </span>
          </h3>
          
          <div className="grid grid-cols-1 gap-2">
            {category.nodes.map(node => {
              const Icon = node.icon;
              return (
                <div
                  key={node.type}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all group"
                  onClick=({ ( }) => onNodeSelect(node)}
                  draggable
                  onDragStart=({ (e }) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(node));
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="p-2 rounded-lg group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 group-hover:text-gray-700">
                        {node.label}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {node.description}
                      </p>
                      
                      {/* Indicadores de funcionalidades */}
                      <div className="flex items-center gap-1 mt-2">
                        {node.config.conditions && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">

                          </span>
                        )}
                        {node.config.saveAs && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                            Salva Dados
                          </span>
                        )}
                        {node.config.useQuantum && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                            Quântico
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {filteredCategories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum nó encontrado</p>
          <p className="text-sm">Tente uma busca diferente</p>
        </div>
      )}
    </div>
  );
};

export default ProfessionalNodePalette;
`