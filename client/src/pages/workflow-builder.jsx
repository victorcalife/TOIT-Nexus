/**
 * WORKFLOW BUILDER VISUAL - TOIT NEXUS
 * Sistema completo de criação de workflows visuais
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {  
  Workflow, 
  Play, 
  Pause, 
  Save, 
  Download,
  Upload,
  Settings,
  Plus,
  Trash2,
  Copy,
  Edit,
  Eye,
  GitBranch,
  Clock,
  Mail,
  Database,
  Code,
  Zap,
  Filter,
  ArrowRight,
  ArrowDown,
  Circle,
  Square,
  Diamond,
  Triangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const WorkflowBuilder = () => {
  const [workflows, setWorkflows] = useState([]);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLog, setExecutionLog] = useState([]);
  const [showNodePanel, setShowNodePanel] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
  
  const { toast } = useToast();

  // Tipos de nós disponíveis
  const nodeTypes = [
    {
      type: 'trigger',
      name: 'Trigger',
      icon: <Zap className="h-4 w-4" />,
      color: 'bg-green-500',
      description: 'Inicia o workflow'
    },
    {
      type: 'action',
      name: 'Ação',
      icon: <Play className="h-4 w-4" />,
      color: 'bg-blue-500',
      description: 'Executa uma ação'
    },
    {
      type: 'condition',
      name: 'Condição',
      icon: <GitBranch className="h-4 w-4" />,
      color: 'bg-yellow-500',
      description: 'Decisão condicional'
    },
    {
      type: 'delay',
      name: 'Delay',
      icon: <Clock className="h-4 w-4" />,
      color: 'bg-purple-500',
      description: 'Aguarda um tempo'
    },
    {
      type: 'email',
      name: 'Email',
      icon: <Mail className="h-4 w-4" />,
      color: 'bg-red-500',
      description: 'Envia email'
    },
    {
      type: 'database',
      name: 'Database',
      icon: <Database className="h-4 w-4" />,
      color: 'bg-indigo-500',
      description: 'Operação no banco'
    },
    {
      type: 'api',
      name: 'API Call',
      icon: <Code className="h-4 w-4" />,
      color: 'bg-orange-500',
      description: 'Chamada de API'
    },
    {
      type: 'filter',
      name: 'Filtro',
      icon: <Filter className="h-4 w-4" />,
      color: 'bg-teal-500',
      description: 'Filtra dados'
    }
  ];

  /**
   * CARREGAR WORKFLOWS
   */
  const loadWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar workflows');
      }

      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (error) {
      console.error('Erro ao carregar workflows:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os workflows",
        variant: "destructive"
      });
    }
  };

  /**
   * SALVAR WORKFLOW
   */
  const saveWorkflow = async () => {
    if (!currentWorkflow) return;

    try {
      const workflowData = {
        ...currentWorkflow,
        nodes,
        connections,
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(`/api/workflows/${currentWorkflow.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workflowData)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar workflow');
      }

      const data = await response.json();
      setCurrentWorkflow(data.workflow);
      
      toast({
        title: "Workflow salvo",
        description: "Workflow salvo com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar workflow:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o workflow",
        variant: "destructive"
      });
    }
  };

  /**
   * EXECUTAR WORKFLOW
   */
  const executeWorkflow = async () => {
    if (!currentWorkflow || isExecuting) return;

    setIsExecuting(true);
    setExecutionLog([]);

    try {
      const response = await fetch(`/api/workflows/${currentWorkflow.id}/execute`, {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nodes,
          connections,
          executionMode: 'test'
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao executar workflow');
      }

      // Stream de execução
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const logEntry = JSON.parse(line);
            setExecutionLog(prev => [...prev, logEntry]);
            
            // Atualizar status do nó
            if (logEntry.nodeId) {
              setNodes(prev => prev.map(node => 
                node.id === logEntry.nodeId 
                  ? { ...node, status: logEntry.status }
                  : node
              ));
            }
          } catch (e) {
            console.log('Log line:', line);
          }
        }
      }

      toast({
        title: "Workflow executado",
        description: "Workflow executado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao executar workflow:', error);
      toast({
        title: "Erro",
        description: "Erro na execução do workflow",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  /**
   * ADICIONAR NÓ
   */
  const addNode = (nodeType, position = { x: 100, y: 100 }) => {
    const newNode = {`
      id: `node-${Date.now()}`,
      type: nodeType.type,
      name: nodeType.name,
      position,
      properties: getDefaultProperties(nodeType.type),
      status: 'idle'
    };

    setNodes(prev => [...prev, newNode]);
  };

  /**
   * PROPRIEDADES PADRÃO POR TIPO DE NÓ
   */
  const getDefaultProperties = (type) => {
    switch (type) {
      case 'trigger':
        return {
          triggerType: 'manual',
          schedule: '',
          webhook: ''
        };
      case 'action':
        return {
          actionType: 'custom',
          script: '',
          parameters: {}
        };
      case 'condition':
        return {
          condition: '',
          trueAction: '',
          falseAction: ''
        };
      case 'delay':
        return {
          duration: 1000,
          unit: 'seconds'
        };
      case 'email':
        return {
          to: '',
          subject: '',
          body: '',
          template: ''
        };
      case 'database':
        return {
          operation: 'select',
          table: '',
          query: '',
          parameters: {}
        };
      case 'api':
        return {
          method: 'GET',
          url: '',
          headers: {},
          body: ''
        };
      case 'filter':
        return {
          filterType: 'condition',
          condition: '',
          field: ''
        };
      default:
        return {};
    }
  };

  /**
   * REMOVER NÓ
   */
  const removeNode = (nodeId) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => 
      conn.from !== nodeId && conn.to !== nodeId
    ));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  /**
   * CONECTAR NÓS
   */
  const connectNodes = (fromId, toId) => {
    const existingConnection = connections.find(conn => 
      conn.from === fromId && conn.to === toId
    );

    if (!existingConnection) {
      const newConnection = {`
        id: `conn-${Date.now()}`,
        from: fromId,
        to: toId,
        type: 'default'
      };
      setConnections(prev => [...prev, newConnection]);
    }
  };

  /**
   * RENDERIZAR NÓ
   */
  const renderNode = (node) => {
    const nodeType = nodeTypes.find(type => type.type === node.type);
    if (!nodeType) return null;

    return (
      <div
        key={node.id}`
        className={`absolute bg-white border-2 rounded-lg p-3 cursor-pointer shadow-lg min-w-[120px] ${
          selectedNode?.id === node.id ? 'border-blue-500' : 'border-gray-300'}
        } ${
          node.status === 'running' ? 'animate-pulse border-yellow-500' :
          node.status === 'success' ? 'border-green-500' :
          node.status === 'error' ? 'border-red-500' : ''`
        }`}
        style={{
          left: node.position.x,
          top: node.position.y}
        }}
        onClick=({ ( }) => setSelectedNode(node)}
        onMouseDown=({ (e) => {
          setDraggedNode(node);
          const rect = e.currentTarget.getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          const offsetY = e.clientY - rect.top;
          
          const handleMouseMove = (e }) => {
            const canvas = document.getElementById('workflow-canvas');
            const canvasRect = canvas.getBoundingClientRect();
            const newX = e.clientX - canvasRect.left - offsetX;
            const newY = e.clientY - canvasRect.top - offsetY;
            
            setNodes(prev => prev.map(n => 
              n.id === node.id 
                ? { ...n, position: { x: newX, y: newY } }
                : n
            ));
          };
          
          const handleMouseUp = () => {
            setDraggedNode(null);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      >
        <div className="flex items-center gap-2 mb-2">`
          <div className={`p-1 rounded ${nodeType.color} text-white`}>
            {nodeType.icon}
          </div>
          <span className="font-medium text-sm">{node.name}</span>
          {node.status === 'running' && (
            <RefreshCw className="h-3 w-3 animate-spin text-yellow-500" />
          )}
          {node.status === 'success' && (
            <CheckCircle className="h-3 w-3 text-green-500" />
          )}
          {node.status === 'error' && (
            <XCircle className="h-3 w-3 text-red-500" />
          )}
        </div>
        
        <div className="text-xs text-gray-600">
          {nodeType.description}
        </div>
        
        {/* Pontos de conexão */}
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white cursor-pointer"
             title="Conectar saída"></div>
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white cursor-pointer"
             title="Conectar entrada"></div>
      </div>
    );
  };

  /**
   * RENDERIZAR CONEXÕES
   */
  const renderConnections = () => {
    return connections.map(connection => {
      const fromNode = nodes.find(n => n.id === connection.from);
      const toNode = nodes.find(n => n.id === connection.to);
      
      if (!fromNode || !toNode) return null;
      
      const fromX = fromNode.position.x + 120; // largura do nó
      const fromY = fromNode.position.y + 30; // meio do nó
      const toX = toNode.position.x;
      const toY = toNode.position.y + 30;
      
      return (
        <svg
          key={connection.id}
          className="absolute top-0 left-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#3B82F6"
              />
            </marker>
          </defs>
          <path`
            d={`M ${fromX} ${fromY} Q ${fromX + 50} ${fromY} ${toX} ${toY}`}
            stroke="#3B82F6"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
        </svg>
      );
    });
  };

  /**
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadWorkflows();
  }, []);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Painel de Nós */}
      ({ showNodePanel && (
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Workflow className="h-5 w-5 text-blue-600" />

          <div className="space-y-2">
            {nodeTypes.map((nodeType }) => (
              <div
                key={nodeType.type}
                className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                draggable
                onDragStart=({ (e }) => {
                  e.dataTransfer.setData('nodeType', JSON.stringify(nodeType));
                }}
                onClick=({ ( }) => addNode(nodeType)}
              >
                <div className="flex items-center gap-3">`
                  <div className={`p-2 rounded ${nodeType.color} text-white`}>
                    {nodeType.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{nodeType.name}</div>
                    <div className="text-xs text-gray-500">{nodeType.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Canvas Principal */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">
                {currentWorkflow?.name || 'Novo Workflow'}
              </h2>
              <Badge variant={currentWorkflow?.status === 'active' ? 'default' : 'secondary'}>
                {currentWorkflow?.status || 'draft'}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick=({ ( }) => setShowNodePanel(!showNodePanel)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={saveWorkflow}
                disabled={!currentWorkflow}
              >
                <Save className="h-4 w-4 mr-2" />

              <Button
                onClick={executeWorkflow}
                disabled={!currentWorkflow || isExecuting || nodes.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Executando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />

                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            id="workflow-canvas"
            className="w-full h-full relative bg-gray-50"
            style={{
              backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
              backgroundSize: '20px 20px'}
            }}
            onDrop=({ (e }) => {
              e.preventDefault();
              const nodeTypeData = e.dataTransfer.getData('nodeType');
              if (nodeTypeData) {
                const nodeType = JSON.parse(nodeTypeData);
                const rect = e.currentTarget.getBoundingClientRect();
                const position = {
                  x: e.clientX - rect.left - 60,
                  y: e.clientY - rect.top - 30
                };
                addNode(nodeType, position);
              }
            }}
            onDragOver=({ (e }) => e.preventDefault()}
          >
            {/* Renderizar conexões */}
            {renderConnections()}
            
            {/* Renderizar nós */}
            {nodes.map(renderNode)}
            
            {/* Mensagem quando vazio */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Workflow className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Canvas vazio
                  </h3>
                  <p className="text-gray-500">
                    Arraste componentes da barra lateral ou clique neles para adicionar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Painel de Propriedades */}
      ({ showPropertiesPanel && selectedNode && (
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Propriedades</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={( }) => removeNode(selectedNode.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Nó
              </label>
              <Input
                value={selectedNode.name}
                onChange=({ (e }) => {
                  setNodes(prev => prev.map(node => 
                    node.id === selectedNode.id 
                      ? { ...node, name: e.target.value }
                      : node
                  ));
                  setSelectedNode(prev => ({ ...prev, name: e.target.value }));
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">

              <Badge>{selectedNode.type}</Badge>
            </div>
            
            {/* Propriedades específicas do tipo de nó */}
            {selectedNode.type === 'email' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">

                  <Input
                    value={selectedNode.properties.to || ''}
                    onChange=({ (e }) => {
                      const updatedNode = {
                        ...selectedNode,
                        properties: { ...selectedNode.properties, to: e.target.value }
                      };
                      setSelectedNode(updatedNode);
                      setNodes(prev => prev.map(node => 
                        node.id === selectedNode.id ? updatedNode : node
                      ));
                    }}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">

                  <Input
                    value={selectedNode.properties.subject || ''}
                    onChange=({ (e }) => {
                      const updatedNode = {
                        ...selectedNode,
                        properties: { ...selectedNode.properties, subject: e.target.value }
                      };
                      setSelectedNode(updatedNode);
                      setNodes(prev => prev.map(node => 
                        node.id === selectedNode.id ? updatedNode : node
                      ));
                    }}
                    placeholder="Assunto do email"
                  />
                </div>
              </>
            )}
            
            {selectedNode.type === 'delay' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração (segundos)
                </label>
                <Input
                  type="number"
                  value={selectedNode.properties.duration || 1}
                  onChange=({ (e }) => {
                    const updatedNode = {
                      ...selectedNode,
                      properties: { ...selectedNode.properties, duration: parseInt(e.target.value) }
                    };
                    setSelectedNode(updatedNode);
                    setNodes(prev => prev.map(node => 
                      node.id === selectedNode.id ? updatedNode : node
                    ));
                  }}
                />
              </div>
            )}
            
            {selectedNode.type === 'api' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método
                  </label>
                  <select
                    value={selectedNode.properties.method || 'GET'}
                    onChange=({ (e }) => {
                      const updatedNode = {
                        ...selectedNode,
                        properties: { ...selectedNode.properties, method: e.target.value }
                      };
                      setSelectedNode(updatedNode);
                      setNodes(prev => prev.map(node => 
                        node.id === selectedNode.id ? updatedNode : node
                      ));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">

                  <Input
                    value={selectedNode.properties.url || ''}
                    onChange=({ (e }) => {
                      const updatedNode = {
                        ...selectedNode,
                        properties: { ...selectedNode.properties, url: e.target.value }
                      };
                      setSelectedNode(updatedNode);
                      setNodes(prev => prev.map(node => 
                        node.id === selectedNode.id ? updatedNode : node
                      ));
                    }}
                    placeholder="https://api.exemplo.com/endpoint"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Log de Execução */}
      ({ executionLog.length > 0 && (
        <div className="fixed bottom-4 right-4 w-96 max-h-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <h4 className="font-medium text-sm">Log de Execução</h4>
          </div>
          <div className="p-3 overflow-y-auto max-h-48 space-y-2">
            {executionLog.map((log, index }) => (
              <div key={index} className="text-xs">
                <span className="text-gray-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>`
                <span className={`ml-2 ${
                  log.level === 'error' ? 'text-red-600' :
                  log.level === 'success' ? 'text-green-600' :
                  'text-gray-700'`}
                }`}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowBuilder;
`