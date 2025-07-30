import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Plus, 
  Settings, 
  Code, 
  Mail, 
  Database,
  Users,
  Calendar,
  ChevronDown,
  ChevronRight,
  Trash2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  title: string;
  description: string;
  config: any;
  children?: WorkflowNode[];
}

interface WorkflowBuilderProps {
  workflow?: any;
  onSave?: (workflow: any) => void;
}

export function WorkflowBuilder({ workflow, onSave }: WorkflowBuilderProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(workflow?.nodes || [
    {
      id: '1',
      type: 'trigger',
      title: 'Cliente com movimentação > R$ 100k',
      description: 'Dispara quando cliente faz movimentação acima do limite',
      config: {
        condition: 'investment_change',
        threshold: 100000,
        operator: 'greater_than'
      }
    }
  ]);

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isExpanded, setIsExpanded] = useState<{ [key: string]: boolean }>({});

  const nodeTypes = {
    trigger: {
      icon: Play,
      color: 'bg-primary-500',
      options: [
        { value: 'client_investment', label: 'Mudança no Investimento' },
        { value: 'client_category', label: 'Mudança de Categoria' },
        { value: 'time_based', label: 'Baseado em Tempo' },
        { value: 'external_event', label: 'Evento Externo' }
      ]
    },
    condition: {
      icon: Code,
      color: 'bg-warning-500',
      options: [
        { value: 'investment_amount', label: 'Valor do Investimento' },
        { value: 'risk_profile', label: 'Perfil de Risco' },
        { value: 'client_age', label: 'Tempo como Cliente' },
        { value: 'portfolio_performance', label: 'Performance da Carteira' }
      ]
    },
    action: {
      icon: Settings,
      color: 'bg-success-500',
      options: [
        { value: 'send_email', label: 'Enviar Email' },
        { value: 'generate_report', label: 'Gerar Relatório' },
        { value: 'create_task', label: 'Criar Tarefa' },
        { value: 'update_category', label: 'Atualizar Categoria' },
        { value: 'send_notification', label: 'Enviar Notificação' }
      ]
    }
  };

  const addNode = (type: 'trigger' | 'condition' | 'action', parentId?: string) => {
    const newNode: WorkflowNode = {
      id: Date.now().toString(),
      type,
      title: `Novo ${type === 'trigger' ? 'Gatilho' : type === 'condition' ? 'Condição' : 'Ação'}`,
      description: 'Configure este nó',
      config: {}
    };

    if (parentId) {
      // Add as child node
      setNodes(prevNodes => 
        prevNodes.map(node => 
          node.id === parentId 
            ? { ...node, children: [...(node.children || []), newNode] }
            : node
        )
      );
    } else {
      // Add as root node
      setNodes(prevNodes => [...prevNodes, newNode]);
    }
  };

  const updateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    );
  };

  const removeNode = (nodeId: string) => {
    setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
  };

  const toggleExpanded = (nodeId: string) => {
    setIsExpanded(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const renderNode = (node: WorkflowNode, level = 0) => {
    const NodeIcon = nodeTypes[node.type].icon;
    const hasChildren = node.children && node.children.length > 0;
    const expanded = isExpanded[node.id];

    return (
      <div key={node.id} className="space-y-2" style={{ marginLeft: `${level * 20}px` }}>
        <Card className={`border-l-4 ${
          node.type === 'trigger' ? 'border-l-primary-500' :
          node.type === 'condition' ? 'border-l-warning-500' :
          'border-l-success-500'
        } ${selectedNode?.id === node.id ? 'ring-2 ring-primary-500' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(node.id)}
                  className="p-1 h-6 w-6"
                >
                  {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              )}
              
              <div className={`w-10 h-10 ${nodeTypes[node.type].color} rounded-lg flex items-center justify-center`}>
                <NodeIcon className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{node.title}</h4>
                <p className="text-sm text-gray-600">{node.description}</p>
              </div>
              
              <Badge variant={
                node.type === 'trigger' ? 'default' :
                node.type === 'condition' ? 'secondary' :
                'outline'
              }>
                {node.type === 'trigger' ? 'Gatilho' :
                 node.type === 'condition' ? 'Condição' :
                 'Ação'}
              </Badge>
              
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNode(node)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNode(node.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Line */}
        {level === 0 && (
          <div className="ml-5 w-0.5 h-6 bg-gray-300"></div>
        )}

        {/* Child Nodes */}
        {hasChildren && expanded && (
          <div className="space-y-2">
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderNodeConfig = () => {
    if (!selectedNode) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurar {selectedNode.title}</CardTitle>
          <CardDescription>
            Configure os parâmetros para este {
              selectedNode.type === 'trigger' ? 'gatilho' :
              selectedNode.type === 'condition' ? 'condição' :
              'ação'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="node-title">Título</Label>
            <Input
              id="node-title"
              value={selectedNode.title}
              onChange={(e) => updateNode(selectedNode.id, { title: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="node-description">Descrição</Label>
            <Textarea
              id="node-description"
              value={selectedNode.description}
              onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="node-type-config">Tipo de {
              selectedNode.type === 'trigger' ? 'Gatilho' :
              selectedNode.type === 'condition' ? 'Condição' :
              'Ação'
            }</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={`Selecione o tipo de ${selectedNode.type}`} />
              </SelectTrigger>
              <SelectContent>
                {nodeTypes[selectedNode.type].options.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conditional config based on node type */}
          {selectedNode.type === 'trigger' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="threshold">Valor Limite (R$)</Label>
                <Input
                  id="threshold"
                  type="number"
                  placeholder="100000"
                />
              </div>
            </div>
          )}

          {selectedNode.type === 'condition' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="operator">Operador</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o operador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Igual a</SelectItem>
                    <SelectItem value="greater_than">Maior que</SelectItem>
                    <SelectItem value="less_than">Menor que</SelectItem>
                    <SelectItem value="contains">Contém</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {selectedNode.type === 'action' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="action-config">Template/Configuração</Label>
                <Textarea
                  id="action-config"
                  placeholder="Configure os parâmetros da ação..."
                  rows={4}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Workflow Canvas */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Editor de Workflow</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addNode('trigger')}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Gatilho
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addNode('condition')}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Condição
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addNode('action')}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ação
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nodes.length > 0 ? (
                nodes.map(node => renderNode(node))
              ) : (
                <div className="text-center py-8">
                  <Play className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Comece adicionando um gatilho ao workflow</p>
                  <Button
                    className="mt-4"
                    onClick={() => addNode('trigger')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Gatilho
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Panel */}
      <div>
        {selectedNode ? (
          renderNodeConfig()
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Configuração</CardTitle>
              <CardDescription>
                Selecione um nó no workflow para configurá-lo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  Clique em um nó do workflow para ver suas opções de configuração
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
