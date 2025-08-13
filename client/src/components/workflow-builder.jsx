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

export function WorkflowBuilder({ workflow, onSave }) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(workflow?.nodes || [
    {
      id,
      type,
      title,
      description,
      config,
        threshold,
        operator);

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isExpanded, setIsExpanded] = useState<{ [key);

  const nodeTypes = {
    trigger,
      color,
      options, label,
        { value, label,
        { value, label,
        { value, label,
    condition,
      color,
      options, label,
        { value, label,
        { value, label,
        { value, label,
    action,
      color,
      options, label,
        { value, label,
        { value, label,
        { value, label,
        { value, label, parentId?) => {
    const newNode= {
      id).toString(),
      type,
      title,
      description,
      config) {
      // Add as child node
      setNodes(prevNodes => 
        prevNodes.map(node => 
          node.id === parentId 
            ? { ...node, children), newNode] }
            )
      );
    } else {
      // Add as root node
      setNodes(prevNodes => [...prevNodes, newNode]);
    }
  };

  const updateNode = (nodeId, updates) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } )
    );
  };

  const removeNode = (nodeId) => {
    setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
  };

  const toggleExpanded = (nodeId) => {
    setIsExpanded(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const renderNode = (node, level = 0) => {
    const NodeIcon = nodeTypes[node.type].icon;
    const hasChildren = node.children && node.children.length > 0;
    const expanded = isExpanded[node.id];

    return (
      <div key={node.id} className="space-y-2" style={{ marginLeft) => toggleExpanded(node.id)}
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
                  className="text-red-600 hover)}

        {/* Child Nodes */}
        {hasChildren && expanded && (
          <div className="space-y-2">
            {node.children.map(child => renderNode(child, level + 1))}
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
              onChange={(e) => updateNode(selectedNode.id, { title)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="node-description">Descrição</Label>
            <Textarea
              id="node-description"
              value={selectedNode.description}
              onChange={(e) => updateNode(selectedNode.id, { description)}
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

          {/* Conditional config based on node };

  return (
    <div className="grid grid-cols-1 lg) => addNode('trigger')}
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
              ) {() => addNode('trigger')}
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
