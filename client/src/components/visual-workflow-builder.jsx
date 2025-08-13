/**
 * VISUAL WORKFLOW BUILDER - from 'react';
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

>;
}

const NODE_PALETTE= [
  {
    category,
    items,
        name,
        description,
        icon,
        color,
        defaultConfig,
      {
        type,
        name,
        description,
        icon,
        color,
        defaultConfig, timezone,
      {
        type,
        name,
        description,
        icon,
        color,
        defaultConfig, url,
  {
    category,
    items,
        name,
        description,
        icon,
        color,
        defaultConfig, subject, body,
      {
        type,
        name,
        description,
        icon,
        color,
        defaultConfig, timeout,
      {
        type,
        name,
        description,
        icon,
        color,
        defaultConfig, url, headers,
  {
    category,
    items,
        name,
        description,
        icon,
        color,
        defaultConfig,
      {
        type,
        name,
        description,
        icon,
        color,
        defaultConfig, unit,
      {
        type,
        name,
        description,
        icon,
        color,
        defaultConfig, condition) => void;
  readOnly, onSave, readOnly = false }) {
  const [workflow, setWorkflow] = useState<VisualWorkflow>({
    name,
    description,
    category,
    isActive,
    canvasData, pan, y,
    nodes,
    connections,
    triggerConfig,
    variables,
    settings);

  const [selectedNode, setSelectedNode] = useState<VisualNode | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<VisualConnection | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x, y);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ nodeId);
  const [showExecutionHistory, setShowExecutionHistory] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para carregar workflow existente
  const { data, isLoading } = useQuery({
    queryKey, workflowId],
    queryFn) => {
      if (!workflowId) return null;
      const response = await apiRequest('GET', `/api/visual-workflows/${workflowId}`);
      return response.json();
    },
    enabled);

  // Query para histórico de execuções
  const { data, workflowId, 'executions'],
    queryFn) => {
      if (!workflowId) return [];
      const response = await apiRequest('GET', `/api/visual-workflows/${workflowId}/executions`);
      return response.json();
    },
    enabled);

  // Mutation para salvar workflow
  const saveWorkflowMutation = useMutation({
    mutationFn) => {
      const method = workflowData.id ? 'PUT' : 'POST';
      const url = workflowData.id 
        ? `/api/visual-workflows/${workflowData.id}` 
        : '/api/visual-workflows';
      
      const response = await apiRequest(method, url, workflowData);
      return response.json();
    },
    onSuccess) => {
      setWorkflow(prev => ({ ...prev, id));
      queryClient.invalidateQueries({ queryKey);
      toast({ title, description);
      onSave?.(data.data);
    },
    onError) => {
      toast({ 
        title, 
        description,
        variant);
    }
  });

  // Mutation para executar workflow
  const executeWorkflowMutation = useMutation({
    mutationFn, any>) => {
      if (!workflow.id) throw new Error('Workflow deve ser salvo antes de executar');
      
      const response = await apiRequest('POST', `/api/visual-workflows/${workflow.id}/execute`, {
        input,
        triggerData, timestamp).toISOString() }
      });
      return response.json();
    },
    onSuccess) => {
      setIsExecuting(false);
      toast({ 
        title, 
        description);
      queryClient.invalidateQueries({ queryKey, workflowId, 'executions'] });
    },
    onError) => {
      setIsExecuting(false);
      toast({ 
        title, 
        description,
        variant);
    }
  });

  // Carregar workflow existente
  useEffect(() => {
    if (existingWorkflow?.data) {
      const data = existingWorkflow.data.workflow;
      setWorkflow({
        id,
        name,
        description,
        category,
        isActive,
        canvasData, pan, y,
        nodes,
        connections,
        triggerConfig,
        variables,
        settings,
        executionCount,
        lastExecuted,
        createdAt,
        updatedAt);
    }
  }, [existingWorkflow]);

  // Adicionar node ao canvas
  const addNode = useCallback((nodeType, position) => {
    const nodeTemplate = NODE_PALETTE
      .flatMap(category => category.items)
      .find(item => item.type === nodeType);

    if (!nodeTemplate) return;

    const newNode= {
      id)}`,
      nodeKey)}`,
      nodeType,
      name,
      description,
      position,
      size, height,
      style,
      config,
      inputSchema,
      outputSchema,
      timeout,
      retryCount,
      nodes, newNode]
    }));
  }, []);

  // Atualizar posição do node
  const updateNodePosition = useCallback((nodeId, position) => {
    setWorkflow(prev => ({
      ...prev,
      nodes, position } )
    }));
  }, []);

  // Conectar nodes
  const connectNodes = useCallback((sourceNodeId, targetNodeId) => {
    const newConnection= {
      id)}`,
      sourceNodeId,
      targetNodeId,
      style, strokeWidth,
      priority,
      connections, newConnection]
    }));
  }, []);

  // Remover node
  const removeNode = useCallback((nodeId) => {
    setWorkflow(prev => ({
      ...prev,
      nodes),
      connections)
    }));
    setSelectedNode(null);
  }, []);

  // Remover conexão
  const removeConnection = useCallback((connectionId) => {
    setWorkflow(prev => ({
      ...prev,
      connections)
    }));
    setSelectedConnection(null);
  }, []);

  // Handler para drag & drop
  const handleMouseDown = useCallback((e, nodeId) => {
    if (readOnly) return;
    
    const node = workflow.nodes.find(n => n.id === nodeId);
    if (!node) return;

    setIsDragging(true);
    setSelectedNode(node);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x,
        y);
    }
  }, [workflow.nodes, readOnly]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !selectedNode || readOnly) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const newPosition = {
        x,
        y, newPosition);
    }
  }, [isDragging, selectedNode, dragOffset, updateNodePosition, readOnly]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handler para drop de novos nodes
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (readOnly) return;

    const nodeType = e.dataTransfer.getData('text/plain');
    const rect = canvasRef.current?.getBoundingClientRect();
    
    if (rect) {
      const position = {
        x,
        y, position);
    }
  }, [addNode, readOnly]);

  // Salvar workflow
  const handleSave = useCallback(() => {
    if (!workflow.name.trim()) {
      toast({ 
        title, 
        description,
        variant);
      return;
    }

    saveWorkflowMutation.mutate(workflow);
  }, [workflow, saveWorkflowMutation, toast]);

  // Executar workflow
  const handleExecute = useCallback(() => {
    if (!workflow.id) {
      toast({ 
        title, 
        description,
        variant);
      return;
    }

    setIsExecuting(true);
    executeWorkflowMutation.mutate({
      source,
      timestamp).toISOString()
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
                        : 'hover))}
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
                onChange={(e) => setWorkflow(prev => ({ ...prev, name))}
                className="w-64"
                disabled={readOnly}
              />
              <Input
                placeholder="Descrição (opcional)"
                value={workflow.description}
                onChange={(e) => setWorkflow(prev => ({ ...prev, description))}
                className="w-80"
                disabled={readOnly}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  checked={workflow.isActive}
                  onCheckedChange={(checked) => setWorkflow(prev => ({ ...prev, isActive))}
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
                className="bg-green-600 hover) {isExecuting ? 'Executando...' : 'Executar'}
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={saveWorkflowMutation.isPending || readOnly}
              >
                {saveWorkflowMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full bg-gray-100 relative"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            style={{
              backgroundImage, #d1d5db 1px, transparent 1px)',
              backgroundSize) => {
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
                  left,
                  top,
                  width,
                  height,
                  zIndex) => handleMouseDown(e, node.id)}
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
                        className="h-6 w-6 p-0 text-red-500 hover)}
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
                        const updatedNode = { ...selectedNode, name);
                        setWorkflow(prev => ({
                          ...prev,
                          nodes)
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
                        const updatedNode = { ...selectedNode, description);
                        setWorkflow(prev => ({
                          ...prev,
                          nodes)
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
                              config, to);
                            setWorkflow(prev => ({
                              ...prev,
                              nodes)
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
                              config, subject);
                            setWorkflow(prev => ({
                              ...prev,
                              nodes)
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
                            config, duration) * 1000 }
                          };
                          setSelectedNode(updatedNode);
                          setWorkflow(prev => ({
                            ...prev,
                            nodes)
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
                            config, condition);
                          setWorkflow(prev => ({
                            ...prev,
                            nodes)
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
                        const updatedConnection = { ...selectedConnection, label);
                        setWorkflow(prev => ({
                          ...prev,
                          connections)
                        }));
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label>Condição</Label>
                    <Input
                      value={selectedConnection.condition || ''}
                      onChange={(e) => {
                        const updatedConnection = { ...selectedConnection, condition);
                        setWorkflow(prev => ({
                          ...prev,
                          connections)
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
            {executionHistory?.data?.map((execution) => (
              <Card key={execution.executionId}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {execution.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) {execution.status.toUpperCase()}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(execution.startedAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Nodes executados).toFixed(2)}s</div>
                    )}
                    {execution.error && (
                      <div className="text-red-600">Erro)}
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