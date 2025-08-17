import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  Panel,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

import {
  Play,
  Pause,
  Square,
  Save,
  Download,
  Upload,
  Settings,
  Plus,
  Trash2,
  Copy,
  Edit,
  Eye,
  EyeOff,
  Zap,
  Clock,
  Mail,
  MessageSquare,
  Calendar,
  Database,
  Code,
  GitBranch,
  Filter,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  Webhook,
  FileText,
  Users,
  Bell,
  Atom,
  Brain,
  Sparkles,
  Workflow
} from 'lucide-react';

// Importar sistema quântico integrado
import quantumSystemCore from '@/core/QuantumSystemCore';
import milaOmnipresence from '@/core/MilaOmnipresence';
import universalWorkflowEngine from '@/core/UniversalWorkflowEngine';

// Tipos de nós disponíveis
const NODE_TYPES = {
  TRIGGER: {
    category: 'Triggers',
    nodes: [
      { type: 'schedule', label: 'Agendamento', icon: Clock, color: '#10B981' },
      { type: 'webhook', label: 'Webhook', icon: Webhook, color: '#3B82F6' },
      { type: 'email_received', label: 'Email Recebido', icon: Mail, color: '#F59E0B' },
      { type: 'form_submit', label: 'Formulário Enviado', icon: FileText, color: '#8B5CF6' },
      { type: 'data_change', label: 'Mudança de Dados', icon: Database, color: '#EF4444' },
      { type: 'user_action', label: 'Ação do Usuário', icon: Users, color: '#06B6D4' }
    ]
  },
  ACTION: {
    category: 'Ações',
    nodes: [
      { type: 'send_email', label: 'Enviar Email', icon: Mail, color: '#F59E0B' },
      { type: 'send_notification', label: 'Enviar Notificação', icon: Bell, color: '#EF4444' },
      { type: 'create_task', label: 'Criar Tarefa', icon: CheckCircle, color: '#10B981' },
      { type: 'update_data', label: 'Atualizar Dados', icon: Database, color: '#3B82F6' },
      { type: 'call_api', label: 'Chamar API', icon: Code, color: '#8B5CF6' },
      { type: 'generate_report', label: 'Gerar Relatório', icon: FileText, color: '#F59E0B' }
    ]
  },
  LOGIC: {
    category: 'Lógica',
    nodes: [
      { type: 'condition', label: 'Condição', icon: GitBranch, color: '#6B7280' },
      { type: 'filter', label: 'Filtro', icon: Filter, color: '#6B7280' },
      { type: 'delay', label: 'Atraso', icon: Timer, color: '#6B7280' },
      { type: 'loop', label: 'Loop', icon: ArrowRight, color: '#6B7280' }
    ]
  },
  QUANTUM: {
    category: 'Quântico',
    nodes: [
      { type: 'quantum_process', label: 'Processamento Quântico', icon: Atom, color: '#EC4899' },
      { type: 'quantum_optimize', label: 'Otimização Quântica', icon: Zap, color: '#EC4899' },
      { type: 'mila_analyze', label: 'Análise MILA', icon: Brain, color: '#7C3AED' },
      { type: 'mila_predict', label: 'Predição MILA', icon: Sparkles, color: '#7C3AED' }
    ]
  }
};

// Componente de nó customizado
const CustomNode = ({ data, selected }) => {
  const nodeConfig = Object.values(NODE_TYPES)
    .flatMap(category => category.nodes)
    .find(node => node.type === data.type);

  if (!nodeConfig) return null;

  const IconComponent = nodeConfig.icon;

  return (
    <div 
      className={`
        px-4 py-3 shadow-lg rounded-lg bg-white border-2 min-w-[200px]
        ${selected ? 'border-blue-500' : 'border-gray-200'}
        hover:shadow-xl transition-all duration-200
      `}
      style={{ borderLeftColor: nodeConfig.color, borderLeftWidth: '4px' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <IconComponent 
          className="w-4 h-4" 
          style={{ color: nodeConfig.color }} 
        />
        <span className="font-medium text-sm text-gray-900">
          {data.label || nodeConfig.label}
        </span>
      </div>
      
      {data.description && (
        <p className="text-xs text-gray-600 mb-2">{data.description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <Badge 
          variant="outline" 
          className="text-xs"
          style={{ borderColor: nodeConfig.color, color: nodeConfig.color }}
        >
          {nodeConfig.category}
        </Badge>
        
        {data.status && (
          <div className="flex items-center gap-1">
            {data.status === 'success' && <CheckCircle className="w-3 h-3 text-green-500" />}
            {data.status === 'error' && <XCircle className="w-3 h-3 text-red-500" />}
            {data.status === 'running' && <AlertCircle className="w-3 h-3 text-yellow-500" />}
          </div>
        )}
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode
};

export default function WorkflowBuilder({ 
  isOpen = true, 
  onClose,
  currentUser = null,
  workflowId = null 
}) {
  const { toast } = useToast();
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  // Estado do workflow
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflow, setWorkflow] = useState({
    id: workflowId,
    name: 'Novo Workflow',
    description: '',
    isActive: false,
    trigger: null,
    quantumEnhanced: true,
    milaAssisted: true
  });
  
  // Estado da interface
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodePanel, setShowNodePanel] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLog, setExecutionLog] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  
  // Estado MILA e Quantum
  const [milaActive, setMilaActive] = useState(true);
  const [milaInsights, setMilaInsights] = useState([]);
  const [quantumOptimizations, setQuantumOptimizations] = useState({});

  useEffect(() => {
    if (isOpen) {
      initializeQuantumWorkflow();
      loadWorkflow();
      setupMilaObservation();
    }
  }, [isOpen, workflowId]);

  const initializeQuantumWorkflow = async () => {
    try {
      console.log('🔄⚛️ Inicializando Workflow Quântico...');
      
      // Conectar ao sistema quântico
      quantumSystemCore.connectModule('workflow', {
        receiveQuantumUpdate: (result) => {
          if (result.workflowOptimizations) {
            setQuantumOptimizations(result.workflowOptimizations);
            applyQuantumOptimizations(result.workflowOptimizations);
          }
          
          if (result.automaticInsights) {
            setMilaInsights(prev => [...prev, ...result.automaticInsights]);
          }
        }
      });

      // Processar otimizações de workflow
      const quantumResult = await quantumSystemCore.processQuantumOperation({
        type: 'workflow_optimization',
        data: {
          nodeCount: nodes.length,
          edgeCount: edges.length,
          complexity: calculateWorkflowComplexity()
        },
        complexity: 3
      });

      setQuantumOptimizations(quantumResult);

      console.log('✅ Workflow Quântico inicializado');
      
    } catch (error) {
      console.error('❌ Erro na inicialização do workflow:', error);
    }
  };

  const setupMilaObservation = () => {
    // Observar interações do workflow
    const observeWorkflowInteraction = (action, data) => {
      milaOmnipresence.observeUserInteraction({
        type: 'workflow_interaction',
        module: 'workflow',
        action,
        data,
        userId: currentUser?.id,
        timestamp: new Date()
      });
    };

    // Configurar observadores
    window.workflowObserver = observeWorkflowInteraction;
  };

  const loadWorkflow = async () => {
    try {
      if (workflowId) {
        // Simular carregamento de workflow existente
        const mockWorkflow = {
          id: workflowId,
          name: 'Workflow de Exemplo',
          description: 'Workflow automático para processamento de emails',
          isActive: true,
          nodes: [
            {
              id: '1',
              type: 'custom',
              position: { x: 100, y: 100 },
              data: { 
                type: 'email_received', 
                label: 'Email Recebido',
                description: 'Trigger quando email é recebido'
              }
            },
            {
              id: '2',
              type: 'custom',
              position: { x: 400, y: 100 },
              data: { 
                type: 'mila_analyze', 
                label: 'Análise MILA',
                description: 'Analisar conteúdo do email'
              }
            },
            {
              id: '3',
              type: 'custom',
              position: { x: 700, y: 100 },
              data: { 
                type: 'create_task', 
                label: 'Criar Tarefa',
                description: 'Criar tarefa baseada no email'
              }
            }
          ],
          edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
            { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' }
          ]
        };
        
        setWorkflow(mockWorkflow);
        setNodes(mockWorkflow.nodes);
        setEdges(mockWorkflow.edges);
      }
      
      // Gerar insights MILA
      if (milaActive) {
        const insights = await generateWorkflowInsights();
        setMilaInsights(insights);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar workflow:', error);
    }
  };

  const generateWorkflowInsights = async () => {
    try {
      // Simular insights MILA
      const insights = [
        {
          type: 'optimization',
          message: 'Detectei 2 oportunidades de otimização no seu workflow',
          confidence: 0.87,
          action: 'optimize_workflow'
        },
        {
          type: 'efficiency',
          message: 'Este workflow pode ser 40% mais rápido com processamento quântico',
          confidence: 0.92,
          action: 'enable_quantum'
        },
        {
          type: 'automation',
          message: 'Sugiro adicionar condições automáticas para filtrar emails',
          confidence: 0.78,
          action: 'add_conditions'
        }
      ];
      
      return insights;
    } catch (error) {
      console.error('❌ Erro ao gerar insights:', error);
      return [];
    }
  };

  const calculateWorkflowComplexity = () => {
    const nodeComplexity = nodes.length * 0.5;
    const edgeComplexity = edges.length * 0.3;
    const logicNodes = nodes.filter(n => 
      ['condition', 'filter', 'loop'].includes(n.data.type)
    ).length * 1.5;
    
    return Math.min(nodeComplexity + edgeComplexity + logicNodes, 5);
  };

  const applyQuantumOptimizations = (optimizations) => {
    // Aplicar otimizações quânticas no workflow
    if (optimizations.suggestedNodes) {
      console.log('Aplicando otimizações de nós:', optimizations.suggestedNodes);
    }
    
    if (optimizations.parallelExecution) {
      console.log('Habilitando execução paralela:', optimizations.parallelExecution);
    }
  };

  const onConnect = useCallback((params) => {
    // Observar conexão de nós
    window.workflowObserver?.('nodes_connected', {
      source: params.source,
      target: params.target
    });

    setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3B82F6', strokeWidth: 2 }
    }, eds));
  }, []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const nodeData = JSON.parse(event.dataTransfer.getData('application/reactflow'));

      if (typeof nodeData === 'undefined' || !nodeData) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `node_${Date.now()}`,
        type: 'custom',
        position,
        data: {
          ...nodeData,
          label: nodeData.label,
          description: `Configurar ${nodeData.label.toLowerCase()}`
        },
      };

      // Observar adição de nó
      window.workflowObserver?.('node_added', {
        nodeType: nodeData.type,
        position
      });

      setNodes((nds) => nds.concat(newNode));

      toast({
        title: "Nó adicionado",
        description: `${nodeData.label} foi adicionado ao workflow`
      });
    },
    [reactFlowInstance, toast]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setShowNodePanel(true);
    
    // Observar clique em nó
    window.workflowObserver?.('node_clicked', {
      nodeId: node.id,
      nodeType: node.data.type
    });
  }, []);

  const executeWorkflow = async () => {
    try {
      setIsExecuting(true);
      setExecutionLog([]);
      
      console.log('🔄 Executando workflow...');
      
      // Observar execução
      window.workflowObserver?.('workflow_execute', {
        workflowId: workflow.id,
        nodeCount: nodes.length
      });

      // Simular execução dos nós
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        
        // Atualizar status do nó
        setNodes(nds => nds.map(n => 
          n.id === node.id 
            ? { ...n, data: { ...n.data, status: 'running' } }
            : n
        ));

        // Simular processamento
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Processar com algoritmos quânticos se habilitado
        if (workflow.quantumEnhanced) {
          const quantumResult = await quantumSystemCore.processQuantumOperation({
            type: 'workflow_node_execution',
            data: {
              nodeType: node.data.type,
              nodeData: node.data
            },
            complexity: 2
          });
          
          console.log(`⚛️ Nó ${node.id} processado com speedup: ${quantumResult.speedup}x`);
        }

        // Atualizar log
        setExecutionLog(prev => [...prev, {
          timestamp: new Date(),
          nodeId: node.id,
          nodeName: node.data.label,
          status: 'success',
          message: `${node.data.label} executado com sucesso`
        }]);

        // Atualizar status do nó
        setNodes(nds => nds.map(n => 
          n.id === node.id 
            ? { ...n, data: { ...n.data, status: 'success' } }
            : n
        ));
      }

      toast({
        title: "🔄 Workflow executado",
        description: "Workflow concluído com sucesso"
      });

    } catch (error) {
      console.error('❌ Erro na execução:', error);
      
      setExecutionLog(prev => [...prev, {
        timestamp: new Date(),
        status: 'error',
        message: `Erro na execução: ${error.message}`
      }]);

      toast({
        title: "Erro na execução",
        description: "Falha ao executar workflow",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const saveWorkflow = async () => {
    try {
      const workflowData = {
        ...workflow,
        nodes,
        edges,
        updatedAt: new Date()
      };

      // Simular salvamento
      console.log('💾 Salvando workflow:', workflowData);

      // Observar salvamento
      window.workflowObserver?.('workflow_save', {
        workflowId: workflow.id,
        nodeCount: nodes.length,
        edgeCount: edges.length
      });

      toast({
        title: "💾 Workflow salvo",
        description: "Workflow salvo com sucesso"
      });

    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Falha ao salvar workflow",
        variant: "destructive"
      });
    }
  };

  const exportWorkflow = async () => {
    try {
      const exportData = {
        workflow,
        nodes,
        edges,
        exportedAt: new Date(),
        version: '1.0'
      };

      // Simular exportação
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow_${workflow.name.replace(/\s+/g, '_')}.json`;
      a.click();
      
      URL.revokeObjectURL(url);

      toast({
        title: "📥 Workflow exportado",
        description: "Arquivo JSON gerado com sucesso"
      });

    } catch (error) {
      console.error('❌ Erro na exportação:', error);
    }
  };

  const onDragStart = (event, nodeData) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  if (!isOpen) return null;

  return (
    <div className="h-full flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Paleta de Nós */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            🔄 Workflow Builder
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Arraste os nós para criar seu workflow
          </p>
        </div>

        {/* MILA Insights */}
        {milaInsights.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                MILA Insights
              </span>
            </div>
            <div className="space-y-1">
              {milaInsights.slice(0, 2).map((insight, index) => (
                <p key={index} className="text-xs text-purple-700 dark:text-purple-300">
                  💡 {insight.message}
                </p>
              ))}
            </div>
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {Object.entries(NODE_TYPES).map(([categoryKey, category]) => (
              <div key={categoryKey}>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.nodes.map((node) => {
                    const IconComponent = node.icon;
                    return (
                      <div
                        key={node.type}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-move hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        draggable
                        onDragStart={(event) => onDragStart(event, node)}
                      >
                        <IconComponent 
                          className="w-4 h-4" 
                          style={{ color: node.color }} 
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {node.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Área Principal - Canvas do Workflow */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b">
          <div className="flex items-center gap-4">
            <Input
              value={workflow.name}
              onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
              className="text-lg font-semibold bg-transparent border-none p-0 h-auto"
              placeholder="Nome do Workflow"
            />
            
            {workflow.quantumEnhanced && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Atom className="w-3 h-3 mr-1" />
                Quantum Enhanced
              </Badge>
            )}
            
            {workflow.milaAssisted && (
              <Badge variant="outline" className="border-blue-500 text-blue-600">
                <Brain className="w-3 h-3 mr-1" />
                MILA Assisted
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={executeWorkflow}
              disabled={isExecuting || nodes.length === 0}
            >
              {isExecuting ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Executando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Executar
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={saveWorkflow}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportWorkflow}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
            className="bg-gray-50 dark:bg-gray-900"
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
            
            <Panel position="top-right">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Nós: {nodes.length} | Conexões: {edges.length}
                </div>
                {quantumOptimizations.enabled && (
                  <div className="text-xs text-purple-600 mt-1">
                    ⚛️ Otimização Quântica Ativa
                  </div>
                )}
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Log de Execução */}
        {executionLog.length > 0 && (
          <div className="h-48 bg-white dark:bg-gray-800 border-t">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Log de Execução
              </h3>
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {executionLog.map((log, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      {log.status === 'success' && <CheckCircle className="w-3 h-3 text-green-500" />}
                      {log.status === 'error' && <XCircle className="w-3 h-3 text-red-500" />}
                      <span className="text-gray-700 dark:text-gray-300">
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>

      {/* Panel de Configuração do Nó */}
      {showNodePanel && selectedNode && (
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configurar Nó
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNodePanel(false)}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <Label htmlFor="node-label">Nome</Label>
              <Input
                id="node-label"
                value={selectedNode.data.label}
                onChange={(e) => {
                  const updatedNode = {
                    ...selectedNode,
                    data: { ...selectedNode.data, label: e.target.value }
                  };
                  setSelectedNode(updatedNode);
                  setNodes(nds => nds.map(n => 
                    n.id === selectedNode.id ? updatedNode : n
                  ));
                }}
              />
            </div>

            <div>
              <Label htmlFor="node-description">Descrição</Label>
              <Textarea
                id="node-description"
                value={selectedNode.data.description || ''}
                onChange={(e) => {
                  const updatedNode = {
                    ...selectedNode,
                    data: { ...selectedNode.data, description: e.target.value }
                  };
                  setSelectedNode(updatedNode);
                  setNodes(nds => nds.map(n => 
                    n.id === selectedNode.id ? updatedNode : n
                  ));
                }}
                rows={3}
              />
            </div>

            {/* Configurações específicas por tipo de nó */}
            {selectedNode.data.type === 'schedule' && (
              <div>
                <Label htmlFor="schedule-cron">Expressão Cron</Label>
                <Input
                  id="schedule-cron"
                  placeholder="0 9 * * 1-5"
                  value={selectedNode.data.cronExpression || ''}
                  onChange={(e) => {
                    const updatedNode = {
                      ...selectedNode,
                      data: { ...selectedNode.data, cronExpression: e.target.value }
                    };
                    setSelectedNode(updatedNode);
                    setNodes(nds => nds.map(n => 
                      n.id === selectedNode.id ? updatedNode : n
                    ));
                  }}
                />
              </div>
            )}

            {selectedNode.data.type === 'send_email' && (
              <>
                <div>
                  <Label htmlFor="email-template">Template</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Boas-vindas</SelectItem>
                      <SelectItem value="notification">Notificação</SelectItem>
                      <SelectItem value="reminder">Lembrete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
                  setEdges(eds => eds.filter(e => 
                    e.source !== selectedNode.id && e.target !== selectedNode.id
                  ));
                  setShowNodePanel(false);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remover Nó
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de Configurações */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurações do Workflow</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="quantum">Quântico</TabsTrigger>
              <TabsTrigger value="mila">MILA</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div>
                <Label htmlFor="workflow-name">Nome do Workflow</Label>
                <Input
                  id="workflow-name"
                  value={workflow.name}
                  onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="workflow-description">Descrição</Label>
                <Textarea
                  id="workflow-description"
                  value={workflow.description}
                  onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="workflow-active"
                  checked={workflow.isActive}
                  onChange={(e) => setWorkflow({ ...workflow, isActive: e.target.checked })}
                />
                <Label htmlFor="workflow-active">Workflow Ativo</Label>
              </div>
            </TabsContent>

            <TabsContent value="quantum" className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="quantum-enhanced"
                  checked={workflow.quantumEnhanced}
                  onChange={(e) => setWorkflow({ ...workflow, quantumEnhanced: e.target.checked })}
                />
                <Label htmlFor="quantum-enhanced">
                  <Atom className="w-4 h-4 inline mr-1" />
                  Otimização Quântica
                </Label>
              </div>

              <p className="text-sm text-gray-600">
                Habilita processamento quântico para acelerar a execução do workflow
              </p>
            </TabsContent>

            <TabsContent value="mila" className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mila-assisted"
                  checked={workflow.milaAssisted}
                  onChange={(e) => setWorkflow({ ...workflow, milaAssisted: e.target.checked })}
                />
                <Label htmlFor="mila-assisted">
                  <Brain className="w-4 h-4 inline mr-1" />
                  Assistência MILA
                </Label>
              </div>

              <p className="text-sm text-gray-600">
                Habilita insights e otimizações automáticas da MILA
              </p>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Wrapper com ReactFlowProvider
const WorkflowBuilderWrapper = (props) => (
  <ReactFlowProvider>
    <WorkflowBuilder {...props} />
  </ReactFlowProvider>
);
