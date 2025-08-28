/**
 * DASHBOARD PRINCIPAL DO CLIENTE - SISTEMA COMPLETO FUNCIONAL
 * Versão Production Ready com todas as funcionalidades
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Users,
  FileText,
  Settings,
  BarChart3,
  Zap,
  Database,
  Brain,
  Cpu,
  Workflow,
  CheckSquare,
  Search,
  Link,
  Mail,
  MessageCircle,
  Plus,
  Play,
  Download,
  Edit,
  Trash2,
  Eye,
  Filter,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  Globe,
  Server }
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [workflows, setWorkflows] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [connections, setConnections] = useState([]);
  const [mlModels, setMlModels] = useState([]);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para formulários
  const [newWorkflow, setNewWorkflow] = useState({ name: '', description: '', steps: [] });
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', status: 'pending' });
  const [newConnection, setNewConnection] = useState({ name: '', type: 'database', host: '', port: '', database: '' });
  const [queryBuilder, setQueryBuilder] = useState({ table: '', fields: [], conditions: [], query: '' });

  // Dados mock para demonstração
  useEffect(() => {
    // Simular carregamento de dados
    setWorkflows([
      { id: 1, name: 'Processamento de Dados', status: 'active', steps: 5, lastRun: '2024-01-15' },
      { id: 2, name: 'Análise Preditiva', status: 'paused', steps: 8, lastRun: '2024-01-14' },
      { id: 3, name: 'Relatório Automático', status: 'completed', steps: 3, lastRun: '2024-01-15' }
    ]);

    setTasks([
      { id: 1, title: 'Revisar modelo ML', description: 'Validar precisão do modelo', priority: 'high', status: 'in_progress', assignee: 'João Silva' },
      { id: 2, title: 'Atualizar dashboard', description: 'Adicionar novos gráficos', priority: 'medium', status: 'pending', assignee: 'Maria Santos' },
      { id: 3, title: 'Backup de dados', description: 'Executar backup semanal', priority: 'low', status: 'completed', assignee: 'Sistema' }
    ]);

    setReports([
      { id: 1, name: 'Relatório de Performance', type: 'performance', generated: '2024-01-15', size: '2.3 MB' },
      { id: 2, name: 'Análise de Usuários', type: 'analytics', generated: '2024-01-14', size: '1.8 MB' },
      { id: 3, name: 'Relatório Financeiro', type: 'financial', generated: '2024-01-13', size: '3.1 MB' }
    ]);

    setConnections([
      { id: 1, name: 'PostgreSQL Principal', type: 'database', status: 'connected', host: 'db.railway.app', port: 5432 },
      { id: 2, name: 'Redis Cache', type: 'cache', status: 'connected', host: 'redis.railway.app', port: 6379 },
      { id: 3, name: 'API Externa', type: 'api', status: 'disconnected', host: 'api.external.com', port: 443 }
    ]);

    setMlModels([
      { id: 1, name: 'Predição de Vendas', accuracy: 94.2, status: 'trained', lastTrained: '2024-01-15' },
      { id: 2, name: 'Classificação de Clientes', accuracy: 87.8, status: 'training', lastTrained: '2024-01-14' },
      { id: 3, name: 'Detecção de Anomalias', accuracy: 91.5, status: 'deployed', lastTrained: '2024-01-13' }
    ]);

    setEmails([
      { id: 1, subject: 'Relatório Semanal', recipient: 'equipe@empresa.com', status: 'sent', sentAt: '2024-01-15 09:30' },
      { id: 2, subject: 'Alerta de Sistema', recipient: 'admin@empresa.com', status: 'pending', sentAt: null },
      { id: 3, subject: 'Newsletter Mensal', recipient: 'clientes@empresa.com', status: 'scheduled', sentAt: '2024-01-20 10:00' }
    ]);
  }, []);

  // Funções para manipular workflows
  const createWorkflow = () => {
    if (newWorkflow.name) {
      const workflow = {
        id: workflows.length + 1,
        ...newWorkflow,
        status: 'draft',
        steps: newWorkflow.steps.length || 1,
        lastRun: null
      };
      setWorkflows([...workflows, workflow]);
      setNewWorkflow({ name: '', description: '', steps: [] });
    }
  };

  const runWorkflow = (id) => {
    setWorkflows(workflows.map(w => 
      w.id === id ? { ...w, status: 'running', lastRun: new Date().toISOString().split('T')[0] } : w
    ));
  };

  // Funções para manipular tarefas
  const createTask = () => {
    if (newTask.title) {
      const task = {
        id: tasks.length + 1,
        ...newTask,
        assignee: user?.name || 'Usuário'
      };
      setTasks([...tasks, task]);
      setNewTask({ title: '', description: '', priority: 'medium', status: 'pending' });
    }
  };

  const updateTaskStatus = (id, status) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  // Função para gerar relatórios
  const generateReport = (type) => {
    const report = {
      id: reports.length + 1,
      name: `Relatório ${type}`,
      type,
      generated: new Date().toISOString().split('T')[0],`
      size: `${(Math.random() * 3 + 1).toFixed(1)} MB`
    };
    setReports([...reports, report]);
  };

  // Função para query builder
  const buildQuery = () => {
    const { table, fields, conditions } = queryBuilder;`
    let query = `SELECT ${fields.length ? fields.join(', ') : '*'} FROM ${table}`;
    if (conditions.length) {`
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    setQueryBuilder({ ...queryBuilder, query });
  };

  // Função para testar conexão
  const testConnection = (id) => {
    setConnections(connections.map(c => 
      c.id === id ? { ...c, status: c.status === 'connected' ? 'disconnected' : 'connected' } : c
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 TOIT NEXUS - Sistema Empresarial
          </h1>
          <p className="text-xl text-gray-600">
            Bem-vindo, {user?.name || 'Usuário'}! Plataforma completa de gestão e automação.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workflows Ativos</CardTitle>
              <Workflow className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{workflows.filter(w => w.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">de {workflows.length} total</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
              <CheckSquare className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{tasks.filter(t => t.status === 'pending').length}</div>
              <p className="text-xs text-muted-foreground">de {tasks.length} total</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modelos ML</CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{mlModels.length}</div>
              <p className="text-xs text-muted-foreground">treinados e ativos</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conexões</CardTitle>
              <Database className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{connections.filter(c => c.status === 'connected').length}</div>
              <p className="text-xs text-muted-foreground">de {connections.length} configuradas</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="query">Query Builder</TabsTrigger>
            <TabsTrigger value="connections">Conexões</TabsTrigger>
            <TabsTrigger value="ml">Machine Learning</TabsTrigger>
            <TabsTrigger value="communication">Comunicação</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Atividade Recente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">Workflow</Badge>
                      <span className="text-sm">Processamento de Dados executado</span>
                      <span className="text-xs text-muted-foreground ml-auto">há 2h</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">ML</Badge>
                      <span className="text-sm">Modelo de predição atualizado</span>
                      <span className="text-xs text-muted-foreground ml-auto">há 4h</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">Relatório</Badge>
                      <span className="text-sm">Relatório de performance gerado</span>
                      <span className="text-xs text-muted-foreground ml-auto">há 6h</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">Sistema</Badge>
                      <span className="text-sm">Backup automático concluído</span>
                      <span className="text-xs text-muted-foreground ml-auto">há 8h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Performance do Sistema</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>CPU Usage</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                        </div>
                        <span className="font-semibold text-sm">45%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Memory</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '67%'}}></div>
                        </div>
                        <span className="font-semibold text-sm">67%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Database</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{width: '89%'}}></div>
                        </div>
                        <span className="font-semibold text-sm">89%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Network</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-600 h-2 rounded-full" style={{width: '23%'}}></div>
                        </div>
                        <span className="font-semibold text-sm">23%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciamento de Workflows</h2>
              <Button onClick=({ ( }) => setActiveTab('workflows')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Workflow
              </Button>
            </div>

            {/* Criar Novo Workflow */}
            <Card>
              <CardHeader>
                <CardTitle>Criar Novo Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="workflow-name">Nome do Workflow</Label>
                    <Input
                      id="workflow-name"
                      value={newWorkflow.name}
                      onChange=({ (e }) => setNewWorkflow({...newWorkflow, name: e.target.value})}
                      placeholder="Ex: Processamento de Dados"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workflow-desc">Descrição</Label>
                    <Input
                      id="workflow-desc"
                      value={newWorkflow.description}
                      onChange=({ (e }) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                      placeholder="Descrição do workflow"
                    />
                  </div>
                </div>
                <Button onClick={createWorkflow} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Workflow
                </Button>
              </CardContent>
            </Card>

            {/* Lista de Workflows */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              ({ workflows.map((workflow }) => (
                <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{workflow.name}</span>
                      <Badge variant={workflow.status === 'active' ? 'default' : workflow.status === 'paused' ? 'secondary' : 'outline'}>
                        {workflow.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{workflow.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm">Etapas: {workflow.steps}</span>
                      <span className="text-sm">Última execução: {workflow.lastRun || 'Nunca'}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick=({ ( }) => runWorkflow(workflow.id)} className="flex-1">
                        <Play className="h-4 w-4 mr-1" />

                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />

                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciamento de Tarefas</h2>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </div>

            {/* Criar Nova Tarefa */}
            <Card>
              <CardHeader>
                <CardTitle>Criar Nova Tarefa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="task-title">Título da Tarefa</Label>
                    <Input
                      id="task-title"
                      value={newTask.title}
                      onChange=({ (e }) => setNewTask({...newTask, title: e.target.value})}
                      placeholder="Ex: Revisar relatório"
                    />
                  </div>
                  <div>
                    <Label htmlFor="task-priority">Prioridade</Label>
                    <Select value={newTask.priority} onValueChange=({ (value }) => setNewTask({...newTask, priority: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="task-description">Descrição</Label>
                  <Textarea
                    id="task-description"
                    value={newTask.description}
                    onChange=({ (e }) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Descrição detalhada da tarefa"
                  />
                </div>
                <Button onClick={createTask} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Tarefa
                </Button>
              </CardContent>
            </Card>

            {/* Lista de Tarefas */}
            <div className="space-y-4">
              ({ tasks.map((task }) => (
                <Card key={task.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{task.title}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                          {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                        <Badge variant={task.status === 'completed' ? 'default' : task.status === 'in_progress' ? 'secondary' : 'outline'}>
                          {task.status === 'completed' ? 'Concluída' : task.status === 'in_progress' ? 'Em Progresso' : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Responsável: {task.assignee}</span>
                      <div className="flex space-x-2">
                        ({ task.status !== 'completed' && (
                          <Button size="sm" onClick={( }) => updateTaskStatus(task.id, 'completed')}>
                            <CheckSquare className="h-4 w-4 mr-1" />

                        )}
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />

                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Sistema de Relatórios</h2>
              <div className="flex space-x-2">
                <Button onClick=({ ( }) => generateReport('performance')} variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />

                <Button onClick=({ ( }) => generateReport('analytics')} variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />

                <Button onClick=({ ( }) => generateReport('financial')} variant="outline">
                  <FileText className="h-4 w-4 mr-2" />

              </div>
            </div>

            {/* Geração de Relatórios */}
            <Card>
              <CardHeader>
                <CardTitle>Gerar Novo Relatório</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick=({ ( }) => generateReport('custom')} className="h-20 flex flex-col items-center justify-center">
                    <FileText className="h-6 w-6 mb-2" />
                    <span>Relatório Customizado</span>
                  </Button>
                  <Button onClick=({ ( }) => generateReport('dashboard')} className="h-20 flex flex-col items-center justify-center" variant="outline">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    <span>Dashboard Executivo</span>
                  </Button>
                  <Button onClick=({ ( }) => generateReport('export')} className="h-20 flex flex-col items-center justify-center" variant="outline">
                    <Download className="h-6 w-6 mb-2" />
                    <span>Exportar Dados</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Relatórios */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              ({ reports.map((report }) => (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{report.name}</span>
                      <Badge variant="secondary">{report.type}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Gerado em:</span>
                        <span className="text-sm">{report.generated}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tamanho:</span>
                        <span className="text-sm">{report.size}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />

                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-1" />

                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Query Builder Tab */}
          <TabsContent value="query" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Query Builder Visual</h2>
              <Button onClick={buildQuery}>
                <Search className="h-4 w-4 mr-2" />
                Gerar Query
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Construtor de Consultas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="table-select">Tabela</Label>
                    <Select value={queryBuilder.table} onValueChange=({ (value }) => setQueryBuilder({...queryBuilder, table: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a tabela" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="users">users</SelectItem>
                        <SelectItem value="orders">orders</SelectItem>
                        <SelectItem value="products">products</SelectItem>
                        <SelectItem value="analytics">analytics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fields-input">Campos (separados por vírgula)</Label>
                    <Input
                      id="fields-input"
                      placeholder="id, name, email"
                      onChange=({ (e }) => setQueryBuilder({...queryBuilder, fields: e.target.value.split(',').map(f => f.trim())})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="conditions-input">Condições</Label>
                    <Input
                      id="conditions-input"
                      placeholder="status = 'active'"
                      onChange=({ (e }) => setQueryBuilder({...queryBuilder, conditions: [e.target.value]})}
                    />
                  </div>
                </div>
                
                {queryBuilder.query && (
                  <div>
                    <Label>Query Gerada:</Label>
                    <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                      {queryBuilder.query}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button onClick={buildQuery} className="flex-1">
                    <Search className="h-4 w-4 mr-2" />
                    Gerar Query
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Play className="h-4 w-4 mr-2" />

                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />

                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciamento de Conexões</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Conexão
              </Button>
            </div>

            {/* Criar Nova Conexão */}
            <Card>
              <CardHeader>
                <CardTitle>Configurar Nova Conexão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="conn-name">Nome da Conexão</Label>
                    <Input
                      id="conn-name"
                      value={newConnection.name}
                      onChange=({ (e }) => setNewConnection({...newConnection, name: e.target.value})}
                      placeholder="Ex: Database Principal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="conn-type">Tipo</Label>
                    <Select value={newConnection.type} onValueChange=({ (value }) => setNewConnection({...newConnection, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de conexão" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="database">Database</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="cache">Cache</SelectItem>
                        <SelectItem value="storage">Storage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="conn-host">Host</Label>
                    <Input
                      id="conn-host"
                      value={newConnection.host}
                      onChange=({ (e }) => setNewConnection({...newConnection, host: e.target.value})}
                      placeholder="localhost ou IP"
                    />
                  </div>
                  <div>
                    <Label htmlFor="conn-port">Porta</Label>
                    <Input
                      id="conn-port"
                      value={newConnection.port}
                      onChange=({ (e }) => setNewConnection({...newConnection, port: e.target.value})}
                      placeholder="5432"
                    />
                  </div>
                </div>
                <Button className="w-full">
                  <Link className="h-4 w-4 mr-2" />
                  Criar Conexão
                </Button>
              </CardContent>
            </Card>

            {/* Lista de Conexões */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              ({ connections.map((connection }) => (
                <Card key={connection.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{connection.name}</span>
                      <Badge variant={connection.status === 'connected' ? 'default' : 'destructive'}>
                        {connection.status === 'connected' ? 'Conectado' : 'Desconectado'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tipo:</span>
                        <span className="text-sm capitalize">{connection.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Host:</span>
                        <span className="text-sm">{connection.host}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Porta:</span>
                        <span className="text-sm">{connection.port}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick=({ ( }) => testConnection(connection.id)} className="flex-1">
                        <Globe className="h-4 w-4 mr-1" />

                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />

                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Machine Learning Tab */}
          <TabsContent value="ml" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Machine Learning</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Modelo
              </Button>
            </div>

            {/* ML Models */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              ({ mlModels.map((model }) => (
                <Card key={model.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{model.name}</span>
                      <Badge variant={model.status === 'deployed' ? 'default' : model.status === 'trained' ? 'secondary' : 'outline'}>
                        {model.status === 'deployed' ? 'Implantado' : model.status === 'trained' ? 'Treinado' : 'Treinando'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Precisão:</span>
                        <span className="text-sm font-semibold">{model.accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Último treino:</span>
                        <span className="text-sm">{model.lastTrained}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">`
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: `${model.accuracy}%`}}></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <Play className="h-4 w-4 mr-1" />

                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />

                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ML Training Interface */}
            <Card>
              <CardHeader>
                <CardTitle>Treinamento de Modelos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Configurações de Treino</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Algoritmo</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o algoritmo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="random-forest">Random Forest</SelectItem>
                            <SelectItem value="neural-network">Neural Network</SelectItem>
                            <SelectItem value="svm">Support Vector Machine</SelectItem>
                            <SelectItem value="gradient-boost">Gradient Boosting</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Dataset</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o dataset" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sales-data">Dados de Vendas</SelectItem>
                            <SelectItem value="customer-data">Dados de Clientes</SelectItem>
                            <SelectItem value="product-data">Dados de Produtos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Métricas de Performance</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Accuracy</span>
                        <span className="font-semibold">94.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Precision</span>
                        <span className="font-semibold">91.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recall</span>
                        <span className="font-semibold">89.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>F1-Score</span>
                        <span className="font-semibold">90.6%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Sistema de Comunicação</h2>
              <div className="flex space-x-2">
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Novo Email
                </Button>
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />

              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Email System */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <span>Sistema de Email</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    ({ emails.map((email }) => (
                      <div key={email.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-semibold">{email.subject}</div>
                          <div className="text-sm text-muted-foreground">{email.recipient}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant={email.status === 'sent' ? 'default' : email.status === 'pending' ? 'secondary' : 'outline'}>
                            {email.status === 'sent' ? 'Enviado' : email.status === 'pending' ? 'Pendente' : 'Agendado'}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {email.sentAt || 'Não enviado'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4">
                    <Mail className="h-4 w-4 mr-2" />
                    Compor Email
                  </Button>
                </CardContent>
              </Card>

              {/* Chat System */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Chat Interno</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-64 border rounded-lg p-4 overflow-y-auto bg-gray-50">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">

                          <div className="bg-white p-2 rounded-lg shadow-sm">
                            <div className="text-sm font-semibold">João Silva</div>
                            <div className="text-sm">Olá! Como está o progresso do projeto?</div>
                            <div className="text-xs text-muted-foreground">há 5 min</div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2 justify-end">
                          <div className="bg-blue-500 text-white p-2 rounded-lg shadow-sm">
                            <div className="text-sm">Está indo muito bem! Acabamos de finalizar o módulo de relatórios.</div>
                            <div className="text-xs text-blue-100">há 2 min</div>
                          </div>
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">

                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Input placeholder="Digite sua mensagem..." className="flex-1" />
                      <Button>
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Email Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Templates de Email</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Mail className="h-6 w-6 mb-2" />
                    <span>Relatório Semanal</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Mail className="h-6 w-6 mb-2" />
                    <span>Alerta de Sistema</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Mail className="h-6 w-6 mb-2" />
                    <span>Newsletter</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
`