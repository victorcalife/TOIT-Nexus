import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Users, Building2, Settings, Plus, CheckSquare, Workflow, Database, Webhook, Mail, BarChart3, LogOut,
  Upload, FileText, PieChart, LineChart, Filter, Code, Play, Save, Download, Eye, Edit, Trash2,
  Calendar, Clock, Target, TrendingUp, Activity, Zap, Globe, Shield, Bell, Search, X, TestTube
} from 'lucide-react';

interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'progress';
  title: string;
  data: any;
  size: 'small' | 'medium' | 'large';
}

interface QueryBuilder {
  id: string;
  name: string;
  query: {
    table: string;
    fields: string[];
    filters: any[];
    joins: any[];
    groupBy: string[];
    orderBy: string[];
  };
  results?: any[];
}

interface WorkflowStep {
  id: string;
  type: 'condition' | 'action' | 'webhook' | 'email' | 'api_call' | 'file_process';
  name: string;
  config: any;
  position: { x: number; y: number };
}

interface CompleteWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: string[];
  isActive: boolean;
  executions: number;
  lastRun?: string;
}

export default function CompleteToitSystem() {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'workflows' | 'query-builder' | 'files' | 'reports' | 'analytics' | 'connections'>('dashboard');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Estados para criação e modais
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [showCreateQuery, setShowCreateQuery] = useState(false);
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [showCreateDbConnection, setShowCreateDbConnection] = useState(false);
  const [showCreateApiConnection, setShowCreateApiConnection] = useState(false);

  // Form states
  const [dbConnectionForm, setDbConnectionForm] = useState({
    name: '',
    type: 'postgresql',
    host: '',
    port: 5432,
    database: '',
    username: '',
    password: '',
    ssl: false
  });

  const [apiConnectionForm, setApiConnectionForm] = useState({
    name: '',
    baseUrl: '',
    authType: 'bearer',
    authConfig: { token: '' },
    headers: {}
  });

  const [queryForm, setQueryForm] = useState({
    name: '',
    description: '',
    connectionId: '',
    connectionType: 'database',
    queryConfig: {
      table: '',
      fields: [],
      filters: [],
      groupBy: [],
      orderBy: []
    }
  });

  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    description: '',
    steps: [],
    triggers: []
  });

  // QUERY HOOKS PARA DADOS REAIS DO BACKEND
  const { data: databaseConnections = [], refetch: refetchDbConnections } = useQuery({
    queryKey: ['/api/database-connections'],
    queryFn: () => apiRequest('/api/database-connections?tenantId=default'),
  });

  const { data: apiConnections = [], refetch: refetchApiConnections } = useQuery({
    queryKey: ['/api/api-connections'],
    queryFn: () => apiRequest('/api/api-connections?tenantId=default'),
  });

  const { data: queryBuilders = [], refetch: refetchQueries } = useQuery({
    queryKey: ['/api/query-builders'],
    queryFn: () => apiRequest('/api/query-builders?tenantId=default'),
  });

  const { data: workflows = [], refetch: refetchWorkflows } = useQuery({
    queryKey: ['/api/complete-workflows'],
    queryFn: () => apiRequest('/api/complete-workflows?tenantId=default'),
  });

  const { data: kpiDashboards = [], refetch: refetchDashboards } = useQuery({
    queryKey: ['/api/kpi-dashboards'],
    queryFn: () => apiRequest('/api/kpi-dashboards?tenantId=default'),
  });

  const { data: uploadedFiles = [], refetch: refetchFiles } = useQuery({
    queryKey: ['/api/uploaded-files'],
    queryFn: () => apiRequest('/api/uploaded-files?tenantId=default'),
  });

  // MUTATIONS PARA CRIAR RECURSOS
  const createDbConnectionMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/database-connections', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Conexão de banco criada" });
      refetchDbConnections();
      setShowCreateDbConnection(false);
      setDbConnectionForm({
        name: '', type: 'postgresql', host: '', port: 5432,
        database: '', username: '', password: '', ssl: false
      });
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao criar conexão", variant: "destructive" });
    }
  });

  const createApiConnectionMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/api-connections', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Conexão API criada" });
      refetchApiConnections();
      setShowCreateApiConnection(false);
      setApiConnectionForm({
        name: '', baseUrl: '', authType: 'bearer',
        authConfig: { token: '' }, headers: {}
      });
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao criar conexão API", variant: "destructive" });
    }
  });

  const createQueryMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/query-builders', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Query Builder criado" });
      refetchQueries();
      setShowCreateQuery(false);
      setQueryForm({
        name: '', description: '', connectionId: '', connectionType: 'database',
        queryConfig: { table: '', fields: [], filters: [], groupBy: [], orderBy: [] }
      });
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao criar Query Builder", variant: "destructive" });
    }
  });

  const createWorkflowMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/complete-workflows', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Workflow criado" });
      refetchWorkflows();
      setShowCreateWorkflow(false);
      setWorkflowForm({ name: '', description: '', steps: [], triggers: [] });
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao criar workflow", variant: "destructive" });
    }
  });

  const executeQueryMutation = useMutation({
    mutationFn: (queryId: string) => apiRequest(`/api/query-builders/${queryId}/execute`, { method: 'POST' }),
    onSuccess: (data) => {
      toast({ title: "Query Executada", description: `${data.results?.length || 0} resultados` });
      refetchQueries();
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao executar query", variant: "destructive" });
    }
  });

  const executeWorkflowMutation = useMutation({
    mutationFn: (workflowId: string) => apiRequest(`/api/complete-workflows/${workflowId}/execute`, { method: 'POST' }),
    onSuccess: () => {
      toast({ title: "Workflow Executado", description: "Workflow iniciado com sucesso" });
      refetchWorkflows();
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao executar workflow", variant: "destructive" });
    }
  });

  const testDbConnectionMutation = useMutation({
    mutationFn: (connectionId: string) => apiRequest(`/api/database-connections/${connectionId}/test`, { method: 'POST' }),
    onSuccess: (data) => {
      toast({ 
        title: data.connected ? "Conexão OK" : "Falha na Conexão", 
        description: data.connected ? "Banco conectado com sucesso" : "Não foi possível conectar",
        variant: data.connected ? "default" : "destructive"
      });
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao testar conexão", variant: "destructive" });
    }
  });

  const generateSampleWorkflows = () => {
    const sampleWorkflows: CompleteWorkflow[] = [
      {
        id: 'wf-1',
        name: 'Processo de Onboarding',
        description: 'Automatiza o processo completo de integração de novos clientes',
        steps: [
          {
            id: 'step-1',
            type: 'condition',
            name: 'Verificar Documentos',
            config: { field: 'documents_complete', operator: 'equals', value: true },
            position: { x: 100, y: 100 }
          },
          {
            id: 'step-2',
            type: 'email',
            name: 'Enviar Boas-vindas',
            config: { template: 'welcome', to: '{{client.email}}' },
            position: { x: 300, y: 100 }
          },
          {
            id: 'step-3',
            type: 'webhook',
            name: 'Notificar CRM',
            config: { url: 'https://api.crm.com/webhook', method: 'POST' },
            position: { x: 500, y: 100 }
          }
        ],
        triggers: ['new_client', 'document_upload'],
        isActive: true,
        executions: 156,
        lastRun: '2025-01-31T10:30:00Z'
      },
      {
        id: 'wf-2',
        name: 'Análise de Satisfação',
        description: 'Coleta e processa feedback dos clientes automaticamente',
        steps: [
          {
            id: 'step-1',
            type: 'api_call',
            name: 'Buscar Dados NPS',
            config: { url: 'https://api.survey.com/nps', method: 'GET' },
            position: { x: 100, y: 200 }
          },
          {
            id: 'step-2',
            type: 'condition',
            name: 'Score < 7?',
            config: { field: 'nps_score', operator: 'less_than', value: 7 },
            position: { x: 300, y: 200 }
          },
          {
            id: 'step-3',
            type: 'action',
            name: 'Criar Ticket Suporte',
            config: { system: 'helpdesk', priority: 'high' },
            position: { x: 500, y: 200 }
          }
        ],
        triggers: ['survey_completed', 'scheduled'],
        isActive: true,
        executions: 89,
        lastRun: '2025-01-31T09:15:00Z'
      }
    ];
    setWorkflows(sampleWorkflows);
  };

  const generateSampleQueries = () => {
    const sampleQueries: QueryBuilder[] = [
      {
        id: 'query-1',
        name: 'Relatório de Vendas por Região',
        query: {
          table: 'sales',
          fields: ['region', 'SUM(amount) as total_sales', 'COUNT(*) as num_sales'],
          filters: [
            { field: 'date', operator: 'between', value: ['2025-01-01', '2025-01-31'] }
          ],
          joins: [
            { table: 'regions', on: 'sales.region_id = regions.id' }
          ],
          groupBy: ['region'],
          orderBy: ['total_sales DESC']
        },
        results: [
          { region: 'Sudeste', total_sales: 450000, num_sales: 156 },
          { region: 'Sul', total_sales: 320000, num_sales: 98 },
          { region: 'Nordeste', total_sales: 280000, num_sales: 87 }
        ]
      },
      {
        id: 'query-2',
        name: 'Usuários Mais Ativos',
        query: {
          table: 'users',
          fields: ['name', 'email', 'last_login', 'workflow_executions'],
          filters: [
            { field: 'is_active', operator: 'equals', value: true },
            { field: 'workflow_executions', operator: 'greater_than', value: 10 }
          ],
          joins: [],
          groupBy: [],
          orderBy: ['workflow_executions DESC']
        },
        results: [
          { name: 'João Silva', email: 'joao@empresa.com', last_login: '2025-01-31', workflow_executions: 45 },
          { name: 'Maria Santos', email: 'maria@empresa.com', last_login: '2025-01-30', workflow_executions: 38 }
        ]
      }
    ];
    setQueryBuilders(sampleQueries);
  };

  useEffect(() => {
    generateDashboardData();
    generateSampleWorkflows();
    generateSampleQueries();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      setLoading(true);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedFiles(prev => [...prev, ...result.files]);
        toast({ title: "Sucesso", description: `${files.length} arquivo(s) enviado(s)` });
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({ title: "Erro", description: "Erro ao enviar arquivos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const executeQuery = async (queryId: string) => {
    try {
      setLoading(true);
      const query = queryBuilders.find(q => q.id === queryId);
      if (!query) return;

      // Simular execução da query (em produção seria uma chamada real ao banco)
      toast({ title: "Query Executada", description: `${query.results?.length || 0} resultados encontrados` });
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao executar query", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const runWorkflow = async (workflowId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: 'POST'
      });

      if (response.ok) {
        toast({ title: "Workflow Executado", description: "Workflow iniciado com sucesso" });
        // Atualizar contador de execuções
        setWorkflows(prev => prev.map(wf => 
          wf.id === workflowId 
            ? { ...wf, executions: wf.executions + 1, lastRun: new Date().toISOString() }
            : wf
        ));
      }
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao executar workflow", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const renderWidget = (widget: DashboardWidget) => {
    const sizeClass = {
      small: 'col-span-1',
      medium: 'col-span-2',
      large: 'col-span-3'
    }[widget.size];

    switch (widget.type) {
      case 'metric':
        return (
          <Card key={widget.id} className={sizeClass}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{widget.data.value.toLocaleString()}</div>
              <div className={`text-sm ${widget.data.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {widget.data.change}
              </div>
            </CardContent>
          </Card>
        );

      case 'chart':
        return (
          <Card key={widget.id} className={sizeClass}>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center">
                <LineChart className="h-4 w-4 mr-2" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-end justify-between space-x-2">
                {widget.data.values.map((value: number, index: number) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="bg-blue-500 w-8 rounded-t"
                      style={{ height: `${(value / Math.max(...widget.data.values)) * 100}px` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-1">
                      {widget.data.labels[index]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'progress':
        return (
          <Card key={widget.id} className={sizeClass}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{widget.data.completed}</span>
                  <span>{widget.data.total}</span>
                </div>
                <Progress value={widget.data.percentage} />
                <div className="text-center text-sm text-gray-600">
                  {widget.data.percentage}% concluído
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'table':
        return (
          <Card key={widget.id} className={sizeClass}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {widget.data.headers.map((header: string, index: number) => (
                        <th key={index} className="text-left p-2">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {widget.data.rows.map((row: string[], rowIndex: number) => (
                      <tr key={rowIndex} className="border-b">
                        {row.map((cell: string, cellIndex: number) => (
                          <td key={cellIndex} className="p-2">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER TOIT NEXUS */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TOIT NEXUS</h1>
              <p className="text-sm text-gray-600">Sistema Completo de Automação</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="destructive">SUPER ADMIN</Badge>
              <Button variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* NAVEGAÇÃO COMPLETA */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-lg">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { key: 'workflows', label: 'Workflows', icon: Workflow },
              { key: 'query-builder', label: 'Query Builder', icon: Database },
              { key: 'files', label: 'Arquivos', icon: Upload },
              { key: 'reports', label: 'Relatórios', icon: FileText },
              { key: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key as any)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === key 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* DASHBOARD INTERATIVO */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Dashboard Interativo</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Widget
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dashboardWidgets.map(renderWidget)}
            </div>
          </div>
        )}

        {/* WORKFLOWS COMPLETOS */}
        {activeSection === 'workflows' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Workflows Avançados ({workflows.length})</h2>
              <Button onClick={() => setShowCreateWorkflow(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Workflow
              </Button>
            </div>

            <div className="grid gap-6">
              {workflows.map(workflow => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <Workflow className="h-5 w-5 mr-2" />
                          {workflow.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                      </div>
                      <Badge variant={workflow.isActive ? "default" : "secondary"}>
                        {workflow.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Estatísticas do Workflow */}
                      <div className="flex space-x-6 text-sm">
                        <div className="flex items-center">
                          <Play className="h-4 w-4 mr-1 text-green-500" />
                          <span>{workflow.executions} execuções</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-blue-500" />
                          <span>Última execução: {workflow.lastRun ? new Date(workflow.lastRun).toLocaleString() : 'Nunca'}</span>
                        </div>
                        <div className="flex items-center">
                          <Target className="h-4 w-4 mr-1 text-purple-500" />
                          <span>{workflow.steps.length} passos</span>
                        </div>
                      </div>

                      {/* Steps do Workflow */}
                      <div className="flex space-x-2 overflow-x-auto pb-2">
                        {workflow.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-md text-xs font-medium min-w-0">
                              {step.name}
                            </div>
                            {index < workflow.steps.length - 1 && (
                              <div className="mx-2 text-gray-400">→</div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Triggers */}
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-gray-500">Triggers:</span>
                        {workflow.triggers.map(trigger => (
                          <Badge key={trigger} variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            {trigger}
                          </Badge>
                        ))}
                      </div>

                      {/* Ações */}
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => runWorkflow(workflow.id)} disabled={loading}>
                          <Play className="h-4 w-4 mr-1" />
                          Executar
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Logs
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* QUERY BUILDER NO-CODE */}
        {activeSection === 'query-builder' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Query Builder No-Code ({queryBuilders.length})</h2>
              <Button onClick={() => setShowCreateQuery(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Query
              </Button>
            </div>

            <div className="grid gap-6">
              {queryBuilders.map(query => (
                <Card key={query.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <Database className="h-5 w-5 mr-2" />
                          {query.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Tabela: {query.query.table} | Campos: {query.query.fields.length} | Filtros: {query.query.filters.length}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* SQL Gerado */}
                      <div className="bg-gray-100 p-3 rounded-md">
                        <div className="text-xs text-gray-600 mb-1">SQL Gerado:</div>
                        <code className="text-sm font-mono">
                          SELECT {query.query.fields.join(', ')} FROM {query.query.table}
                          {query.query.filters.length > 0 && (
                            <> WHERE {query.query.filters.map(f => `${f.field} ${f.operator} '${f.value}'`).join(' AND ')}</>
                          )}
                          {query.query.groupBy.length > 0 && <> GROUP BY {query.query.groupBy.join(', ')}</>}
                          {query.query.orderBy.length > 0 && <> ORDER BY {query.query.orderBy.join(', ')}</>}
                        </code>
                      </div>

                      {/* Resultados */}
                      {query.results && (
                        <div>
                          <div className="text-sm font-medium mb-2">
                            Resultados ({query.results.length} registros):
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm border">
                              <thead>
                                <tr className="bg-gray-50">
                                  {Object.keys(query.results[0] || {}).map(key => (
                                    <th key={key} className="text-left p-2 border-b">{key}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {query.results.slice(0, 3).map((row, index) => (
                                  <tr key={index}>
                                    {Object.values(row).map((value: any, cellIndex) => (
                                      <td key={cellIndex} className="p-2 border-b">{value}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Ações */}
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => executeQuery(query.id)} disabled={loading}>
                          <Play className="h-4 w-4 mr-1" />
                          Executar
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar Query
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Exportar CSV
                        </Button>
                        <Button size="sm" variant="outline">
                          <Save className="h-4 w-4 mr-1" />
                          Salvar Como Relatório
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* GESTÃO DE ARQUIVOS */}
        {activeSection === 'files' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestão de Arquivos ({uploadedFiles.length})</h2>
              <div className="space-x-2">
                <Button onClick={() => document.getElementById('file-upload')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload de Arquivos
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Área de Upload */}
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Arraste arquivos aqui ou clique para selecionar</p>
                  </div>
                </CardContent>
              </Card>

              {/* Arquivos Uploaded */}
              {uploadedFiles.map(file => (
                <Card key={file.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-blue-500 mr-3" />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.size} | {file.type}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* RELATÓRIOS AVANÇADOS */}
        {activeSection === 'reports' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Relatórios Avançados</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Relatório
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Relatório de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Análise completa de performance dos workflows por empresa
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Workflows Executados</span>
                      <span className="font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Sucesso</span>
                      <span className="font-medium text-green-600">94.2%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tempo Médio</span>
                      <span className="font-medium">2.3 min</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Relatório Completo
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Análise de Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Relatório detalhado de atividade e engajamento dos usuários
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Usuários Ativos</span>
                      <span className="font-medium">892</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Novos Este Mês</span>
                      <span className="font-medium text-blue-600">127</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Retenção</span>
                      <span className="font-medium">87.5%</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Relatório Completo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ANALYTICS AVANÇADO */}
        {activeSection === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Analytics Avançado</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-green-500" />
                    Atividade em Tempo Real
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">342</div>
                  <p className="text-xs text-gray-500">Workflows executando agora</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                    Crescimento Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+23.5%</div>
                  <p className="text-xs text-gray-500">vs mês anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-purple-500" />
                    Integrações Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-xs text-gray-500">APIs conectadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-red-500" />
                    Score de Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">98.2%</div>
                  <p className="text-xs text-gray-500">Todas as verificações</p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Tendências */}
            <Card>
              <CardHeader>
                <CardTitle>Tendências de Uso - Últimos 30 Dias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {Array.from({ length: 30 }, (_, i) => {
                    const height = Math.random() * 200 + 20;
                    return (
                      <div key={i} className="flex flex-col items-center">
                        <div 
                          className="bg-gradient-to-t from-blue-500 to-blue-300 w-2 rounded-t"
                          style={{ height: `${height}px` }}
                        ></div>
                        {i % 5 === 0 && (
                          <span className="text-xs text-gray-500 mt-1">{i + 1}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}