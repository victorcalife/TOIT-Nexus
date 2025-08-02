/**
 * VISUAL WORKFLOW BUILDER - Interface drag-and-drop para construção visual de workflows
 * Sistema estilo Zapier/Make com nodes, connections e execução em tempo real
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Pause, 
  Square, 
  Save, 
  Plus, 
  Zap, 
  Mail, 
  Database, 
  Settings, 
  Code, 
  Clock, 
  GitBranch, 
  RefreshCw,
  Trash2,
  Copy,
  Eye,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Target,
  Workflow,
  Calendar,
  Filter,
  Search,
  ArrowRight,
  MousePointer,
  Move,
  Link,
  Unlink
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface VisualNode {
  id: string;
  nodeKey: string;
  nodeType: 'trigger' | 'action' | 'condition' | 'delay' | 'email' | 'webhook' | 'data_transform' | 'loop';
  name: string;
  description?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: Record<string, any>;
  config: Record<string, any>;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  timeout: number;
  retryCount: number;
}

interface VisualConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  style: Record<string, any>;
  condition?: string;
  priority: number;
}

interface VisualWorkflow {
  id?: string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  canvasData: Record<string, any>;
  nodes: VisualNode[];
  connections: VisualConnection[];
  triggerConfig: Record<string, any>;
  variables: Record<string, any>;
  settings: Record<string, any>;
  executionCount?: number;
  lastExecuted?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface NodePalette {
  category: string;
  items: Array<{
    type: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    defaultConfig: Record<string, any>;
  }>;
}

const NODE_PALETTE: NodePalette[] = [
  {
    category: 'Triggers',
    items: [
      {
        type: 'trigger',
        name: 'Manual Trigger',
        description: 'Executar workflow manualmente',
        icon: <Play className="w-4 h-4" />,
        color: 'bg-green-100 border-green-300 text-green-800',
        defaultConfig: { triggerType: 'manual' }
      },
      {
        type: 'schedule',
        name: 'Schedule',
        description: 'Executar em horários definidos',
        icon: <Clock className="w-4 h-4" />,
        color: 'bg-blue-100 border-blue-300 text-blue-800',
        defaultConfig: { cron: '0 9 * * *', timezone: 'America/Sao_Paulo' }
      },
      {
        type: 'webhook',
        name: 'Webhook',
        description: 'Executar via requisição HTTP',
        icon: <Zap className="w-4 h-4" />,
        color: 'bg-purple-100 border-purple-300 text-purple-800',
        defaultConfig: { method: 'POST', url: '' }
      }
    ]
  },
  {
    category: 'Actions',
    items: [
      {
        type: 'email',
        name: 'Send Email',
        description: 'Enviar email',
        icon: <Mail className="w-4 h-4" />,
        color: 'bg-orange-100 border-orange-300 text-orange-800',
        defaultConfig: { to: '', subject: '', body: '' }
      },
      {
        type: 'database',
        name: 'Database Query',
        description: 'Executar consulta no banco',
        icon: <Database className="w-4 h-4" />,
        color: 'bg-cyan-100 border-cyan-300 text-cyan-800',
        defaultConfig: { query: 'SELECT * FROM table', timeout: 30000 }
      },
      {
        type: 'api_call',
        name: 'API Call',
        description: 'Fazer chamada para API externa',
        icon: <Code className="w-4 h-4" />,
        color: 'bg-indigo-100 border-indigo-300 text-indigo-800',
        defaultConfig: { method: 'GET', url: '', headers: {} }
      }
    ]
  },
  {
    category: 'Logic',
    items: [
      {
        type: 'condition',
        name: 'Condition',
        description: 'Condição if/else',
        icon: <GitBranch className="w-4 h-4" />,
        color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
        defaultConfig: { condition: 'data.status === "active"' }
      },
      {
        type: 'delay',
        name: 'Delay',
        description: 'Aguardar tempo específico',
        icon: <Clock className="w-4 h-4" />,
        color: 'bg-gray-100 border-gray-300 text-gray-800',
        defaultConfig: { duration: 5000, unit: 'seconds' }
      },
      {
        type: 'loop',
        name: 'Loop',
        description: 'Repetir ações',
        icon: <RefreshCw className="w-4 h-4" />,
        color: 'bg-pink-100 border-pink-300 text-pink-800',
        defaultConfig: { iterations: 5, condition: '' }
      }
    ]
  }
];

interface VisualWorkflowBuilderProps {
  workflowId?: string;
  onSave?: (workflow: VisualWorkflow) => void;
  readOnly?: boolean;
}

export default function VisualWorkflowBuilder({ workflowId, onSave, readOnly = false }: VisualWorkflowBuilderProps) {
  const [workflow, setWorkflow] = useState<VisualWorkflow>({
    name: '',
    description: '',
    category: '',
    isActive: false,
    canvasData: { zoom: 1, pan: { x: 0, y: 0 } },
    nodes: [],
    connections: [],
    triggerConfig: {},
    variables: {},
    settings: {}
  });

  const [selectedNode, setSelectedNode] = useState<VisualNode | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<VisualConnection | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ nodeId: string; handle?: string } | null>(null);
  const [showExecutionHistory, setShowExecutionHistory] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para carregar workflow existente
  const { data: existingWorkflow, isLoading } = useQuery({
    queryKey: ['/api/visual-workflows', workflowId],
    queryFn: async () => {
      if (!workflowId) return null;
      const response = await apiRequest('GET', `/api/visual-workflows/${workflowId}`);
      return response.json();
    },
    enabled: !!workflowId
  });

  // Query para histórico de execuções
  const { data: executionHistory } = useQuery({
    queryKey: ['/api/visual-workflows', workflowId, 'executions'],
    queryFn: async () => {
      if (!workflowId) return [];
      const response = await apiRequest('GET', `/api/visual-workflows/${workflowId}/executions`);
      return response.json();
    },
    enabled: !!workflowId && showExecutionHistory
  });

  // Mutation para salvar workflow
  const saveWorkflowMutation = useMutation({
    mutationFn: async (workflowData: VisualWorkflow) => {
      const method = workflowData.id ? 'PUT' : 'POST';
      const url = workflowData.id 
        ? `/api/visual-workflows/${workflowData.id}` 
        : '/api/visual-workflows';
      
      const response = await apiRequest(method, url, workflowData);
      return response.json();
    },
    onSuccess: (data) => {
      setWorkflow(prev => ({ ...prev, id: data.data.id }));
      queryClient.invalidateQueries({ queryKey: ['/api/visual-workflows'] });
      toast({ title: 'Sucesso', description: 'Workflow salvo com sucesso!' });
      onSave?.(data.data);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro', 
        description: error.message || 'Falha ao salvar workflow',
        variant: 'destructive' 
      });
    }
  });

  // Mutation para executar workflow
  const executeWorkflowMutation = useMutation({
    mutationFn: async (input: Record<string, any>) => {
      if (!workflow.id) throw new Error('Workflow deve ser salvo antes de executar');
      
      const response = await apiRequest('POST', `/api/visual-workflows/${workflow.id}/execute`, {
        input,
        triggerData: { source: 'manual_execution', timestamp: new Date().toISOString() }
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsExecuting(false);
      toast({ 
        title: 'Execução Concluída', 
        description: `Workflow executado com sucesso. ${data.data.nodesExecuted} nodes processados.` 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/visual-workflows', workflowId, 'executions'] });
    },
    onError: (error: any) => {
      setIsExecuting(false);
      toast({ 
        title: 'Erro na Execução', 
        description: error.message || 'Falha ao executar workflow',
        variant: 'destructive' 
      });
    }
  });

  // Carregar workflow existente
  useEffect(() => {
    if (existingWorkflow?.data) {
      const data = existingWorkflow.data.workflow;
      setWorkflow({
        id: data.id,
        name: data.name,
        description: data.description || '',
        category: data.category || '',
        isActive: data.isActive,
        canvasData: data.canvasData || { zoom: 1, pan: { x: 0, y: 0 } },
        nodes: data.nodes || [],
        connections: data.connections || [],
        triggerConfig: data.triggerConfig || {},
        variables: data.variables || {},
        settings: data.settings || {},
        executionCount: data.executionCount,
        lastExecuted: data.lastExecuted,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    }
  }, [existingWorkflow]);

  // Adicionar node ao canvas
  const addNode = useCallback((nodeType: string, position: { x: number; y: number }) => {
    const nodeTemplate = NODE_PALETTE
      .flatMap(category => category.items)
      .find(item => item.type === nodeType);

    if (!nodeTemplate) return;

    const newNode: VisualNode = {
      id: `node_${Date.now()}`,
      nodeKey: `${nodeType}_${Date.now()}`,
      nodeType: nodeType as any,
      name: nodeTemplate.name,
      description: nodeTemplate.description,
      position,
      size: { width: 200, height: 100 },
      style: { backgroundColor: nodeTemplate.color },
      config: { ...nodeTemplate.defaultConfig },
      inputSchema: {},
      outputSchema: {},
      timeout: 30000,
      retryCount: 0
    };

    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
  }, []);

  // Atualizar posição do node
  const updateNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, position } : node
      )
    }));
  }, []);

  // Conectar nodes
  const connectNodes = useCallback((sourceNodeId: string, targetNodeId: string) => {
    const newConnection: VisualConnection = {
      id: `conn_${Date.now()}`,
      sourceNodeId,
      targetNodeId,
      style: { stroke: '#666', strokeWidth: 2 },
      priority: 0
    };

    setWorkflow(prev => ({
      ...prev,
      connections: [...prev.connections, newConnection]
    }));
  }, []);

  // Remover node
  const removeNode = useCallback((nodeId: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(conn => 
        conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
      )
    }));
    setSelectedNode(null);
  }, []);

  // Remover conexão
  const removeConnection = useCallback((connectionId: string) => {
    setWorkflow(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== connectionId)
    }));
    setSelectedConnection(null);
  }, []);

  // Handler para drag & drop
  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (readOnly) return;
    
    const node = workflow.nodes.find(n => n.id === nodeId);
    if (!node) return;

    setIsDragging(true);
    setSelectedNode(node);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - node.position.x,
        y: e.clientY - rect.top - node.position.y
      });
    }
  }, [workflow.nodes, readOnly]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedNode || readOnly) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const newPosition = {
        x: e.clientX - rect.left - dragOffset.x,
        y: e.clientY - rect.top - dragOffset.y
      };
      updateNodePosition(selectedNode.id, newPosition);
    }
  }, [isDragging, selectedNode, dragOffset, updateNodePosition, readOnly]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handler para drop de novos nodes
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (readOnly) return;

    const nodeType = e.dataTransfer.getData('text/plain');
    const rect = canvasRef.current?.getBoundingClientRect();
    
    if (rect) {
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      addNode(nodeType, position);
    }
  }, [addNode, readOnly]);

  // Salvar workflow
  const handleSave = useCallback(() => {
    if (!workflow.name.trim()) {
      toast({ 
        title: 'Erro', 
        description: 'Nome do workflow é obrigatório',
        variant: 'destructive' 
      });
      return;
    }

    saveWorkflowMutation.mutate(workflow);
  }, [workflow, saveWorkflowMutation, toast]);

  // Executar workflow
  const handleExecute = useCallback(() => {
    if (!workflow.id) {
      toast({ 
        title: 'Erro', 
        description: 'Salve o workflow antes de executar',
        variant: 'destructive' 
      });
      return;
    }

    setIsExecuting(true);
    executeWorkflowMutation.mutate({
      source: 'manual_test',
      timestamp: new Date().toISOString()
    });
  }, [workflow.id, executeWorkflowMutation, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Carregando workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Node Palette */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold mb-2">Componentes</h3>
          <p className="text-sm text-gray-600">Arraste os componentes para o canvas</p>
        </div>
        
        <div className="p-4 space-y-4">
          {NODE_PALETTE.map((category) => (
            <div key={category.category}>
              <h4 className="font-medium text-gray-900 mb-2">{category.category}</h4>
              <div className="space-y-2">
                {category.items.map((item) => (
                  <div
                    key={item.type}
                    draggable={!readOnly}
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', item.type)}
                    className={`p-3 rounded-lg border-2 border-dashed cursor-move transition-colors ${
                      readOnly 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-gray-50'
                    } ${item.color}`}
                  >
                    <div className="flex items-center space-x-2">
                      {item.icon}
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-gray-600">{item.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Nome do workflow"
                value={workflow.name}
                onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                className="w-64"
                disabled={readOnly}
              />
              <Input
                placeholder="Descrição (opcional)"
                value={workflow.description}
                onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
                className="w-80"
                disabled={readOnly}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  checked={workflow.isActive}
                  onCheckedChange={(checked) => setWorkflow(prev => ({ ...prev, isActive: checked }))}
                  disabled={readOnly}
                />
                <Label className="text-sm">Ativo</Label>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {workflow.executionCount !== undefined && (
                <Badge variant="outline">
                  <Activity className="w-3 h-3 mr-1" />
                  {workflow.executionCount} execuções
                </Badge>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowExecutionHistory(!showExecutionHistory)}
                disabled={!workflow.id}
              >
                <Eye className="w-4 h-4 mr-2" />
                Histórico
              </Button>
              
              <Button
                onClick={handleExecute}
                disabled={!workflow.id || isExecuting || readOnly}
                className="bg-green-600 hover:bg-green-700"
              >
                {isExecuting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isExecuting ? 'Executando...' : 'Executar'}
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={saveWorkflowMutation.isPending || readOnly}
              >
                {saveWorkflowMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full bg-gray-100 relative"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            style={{
              backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          >
            {/* Render Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              {workflow.connections.map((connection) => {
                const sourceNode = workflow.nodes.find(n => n.id === connection.sourceNodeId);
                const targetNode = workflow.nodes.find(n => n.id === connection.targetNodeId);
                
                if (!sourceNode || !targetNode) return null;
                
                const startX = sourceNode.position.x + sourceNode.size.width;
                const startY = sourceNode.position.y + sourceNode.size.height / 2;
                const endX = targetNode.position.x;
                const endY = targetNode.position.y + targetNode.size.height / 2;
                
                const midX = (startX + endX) / 2;
                
                return (
                  <g key={connection.id}>
                    <path
                      d={`M ${startX} ${startY} C ${midX} ${startY} ${midX} ${endY} ${endX} ${endY}`}
                      stroke={connection.style?.stroke || '#666'}
                      strokeWidth={connection.style?.strokeWidth || 2}
                      fill="none"
                      className="cursor-pointer"
                      onClick={() => setSelectedConnection(connection)}
                    />
                    <polygon
                      points={`${endX-8},${endY-4} ${endX},${endY} ${endX-8},${endY+4}`}
                      fill={connection.style?.stroke || '#666'}
                    />
                    {connection.label && (
                      <text
                        x={midX}
                        y={(startY + endY) / 2 - 10}
                        textAnchor="middle"
                        className="text-xs fill-gray-600"
                      >
                        {connection.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Render Nodes */}
            {workflow.nodes.map((node) => (
              <div
                key={node.id}
                className={`absolute border-2 rounded-lg shadow-lg cursor-move transition-all ${
                  selectedNode?.id === node.id ? 'ring-2 ring-blue-500' : ''
                } ${node.style?.backgroundColor || 'bg-white border-gray-300'}`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  width: node.size.width,
                  height: node.size.height,
                  zIndex: 2
                }}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                onClick={() => setSelectedNode(node)}
              >
                <div className="p-3 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {NODE_PALETTE
                        .flatMap(cat => cat.items)
                        .find(item => item.type === node.nodeType)?.icon}
                      <span className="font-medium text-sm">{node.name}</span>
                    </div>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNode(node.id);
                        }}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 flex-1">
                    {node.description}
                  </div>
                  
                  {/* Connection handles */}
                  <div className="absolute -left-2 top-1/2 w-4 h-4 bg-blue-500 rounded-full transform -translate-y-1/2 cursor-pointer" />
                  <div className="absolute -right-2 top-1/2 w-4 h-4 bg-blue-500 rounded-full transform -translate-y-1/2 cursor-pointer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {(selectedNode || selectedConnection) && (
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            {selectedNode && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Configurar Node
                  </CardTitle>
                  <CardDescription>
                    {selectedNode.nodeType} - {selectedNode.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Nome</Label>
                    <Input
                      value={selectedNode.name}
                      onChange={(e) => {
                        const updatedNode = { ...selectedNode, name: e.target.value };
                        setSelectedNode(updatedNode);
                        setWorkflow(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? updatedNode : n)
                        }));
                      }}
                      disabled={readOnly}
                    />
                  </div>
                  
                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      value={selectedNode.description || ''}
                      onChange={(e) => {
                        const updatedNode = { ...selectedNode, description: e.target.value };
                        setSelectedNode(updatedNode);
                        setWorkflow(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? updatedNode : n)
                        }));
                      }}
                      disabled={readOnly}
                      rows={3}
                    />
                  </div>

                  {/* Configurações específicas por tipo de node */}
                  {selectedNode.nodeType === 'email' && (
                    <>
                      <div>
                        <Label>Para</Label>
                        <Input
                          value={selectedNode.config.to || ''}
                          onChange={(e) => {
                            const updatedNode = { 
                              ...selectedNode, 
                              config: { ...selectedNode.config, to: e.target.value }
                            };
                            setSelectedNode(updatedNode);
                            setWorkflow(prev => ({
                              ...prev,
                              nodes: prev.nodes.map(n => n.id === selectedNode.id ? updatedNode : n)
                            }));
                          }}
                          placeholder="email@exemplo.com"
                          disabled={readOnly}
                        />
                      </div>
                      <div>
                        <Label>Assunto</Label>
                        <Input
                          value={selectedNode.config.subject || ''}
                          onChange={(e) => {
                            const updatedNode = { 
                              ...selectedNode, 
                              config: { ...selectedNode.config, subject: e.target.value }
                            };
                            setSelectedNode(updatedNode);
                            setWorkflow(prev => ({
                              ...prev,
                              nodes: prev.nodes.map(n => n.id === selectedNode.id ? updatedNode : n)
                            }));
                          }}
                          disabled={readOnly}
                        />
                      </div>
                    </>
                  )}

                  {selectedNode.nodeType === 'delay' && (
                    <div>
                      <Label>Duração (segundos)</Label>
                      <Input
                        type="number"
                        value={selectedNode.config.duration ? selectedNode.config.duration / 1000 : 0}
                        onChange={(e) => {
                          const updatedNode = { 
                            ...selectedNode, 
                            config: { ...selectedNode.config, duration: parseInt(e.target.value) * 1000 }
                          };
                          setSelectedNode(updatedNode);
                          setWorkflow(prev => ({
                            ...prev,
                            nodes: prev.nodes.map(n => n.id === selectedNode.id ? updatedNode : n)
                          }));
                        }}
                        disabled={readOnly}
                      />
                    </div>
                  )}

                  {selectedNode.nodeType === 'condition' && (
                    <div>
                      <Label>Condição</Label>
                      <Textarea
                        value={selectedNode.config.condition || ''}
                        onChange={(e) => {
                          const updatedNode = { 
                            ...selectedNode, 
                            config: { ...selectedNode.config, condition: e.target.value }
                          };
                          setSelectedNode(updatedNode);
                          setWorkflow(prev => ({
                            ...prev,
                            nodes: prev.nodes.map(n => n.id === selectedNode.id ? updatedNode : n)
                          }));
                        }}
                        placeholder="data.status === 'active'"
                        disabled={readOnly}
                        rows={3}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {selectedConnection && !readOnly && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Link className="w-5 h-5 mr-2" />
                    Configurar Conexão
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Label</Label>
                    <Input
                      value={selectedConnection.label || ''}
                      onChange={(e) => {
                        const updatedConnection = { ...selectedConnection, label: e.target.value };
                        setSelectedConnection(updatedConnection);
                        setWorkflow(prev => ({
                          ...prev,
                          connections: prev.connections.map(c => 
                            c.id === selectedConnection.id ? updatedConnection : c
                          )
                        }));
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label>Condição</Label>
                    <Input
                      value={selectedConnection.condition || ''}
                      onChange={(e) => {
                        const updatedConnection = { ...selectedConnection, condition: e.target.value };
                        setSelectedConnection(updatedConnection);
                        setWorkflow(prev => ({
                          ...prev,
                          connections: prev.connections.map(c => 
                            c.id === selectedConnection.id ? updatedConnection : c
                          )
                        }));
                      }}
                      placeholder="success === true"
                    />
                  </div>

                  <Button
                    variant="destructive"
                    onClick={() => removeConnection(selectedConnection.id)}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover Conexão
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Execution History Modal */}
      <Dialog open={showExecutionHistory} onOpenChange={setShowExecutionHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Execuções</DialogTitle>
            <DialogDescription>
              Últimas execuções do workflow "{workflow.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {executionHistory?.data?.map((execution: any) => (
              <Card key={execution.executionId}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {execution.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : execution.status === 'failed' ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                      )}
                      <span className="font-medium">{execution.status.toUpperCase()}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(execution.startedAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Nodes executados: {execution.nodesExecuted}/{execution.totalNodes}</div>
                    {execution.duration && (
                      <div>Duração: {(execution.duration / 1000).toFixed(2)}s</div>
                    )}
                    {execution.error && (
                      <div className="text-red-600">Erro: {execution.error}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {!executionHistory?.data?.length && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma execução encontrada
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}