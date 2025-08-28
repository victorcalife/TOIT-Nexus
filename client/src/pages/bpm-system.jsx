/**
 * SISTEMA BPM COMPLETO - TOIT NEXUS
 * Sistema completo de gestão de processos de negócio
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {  
  GitBranch, 
  Workflow,
  Play,
  Pause,
  Square,
  RotateCcw,
  FastForward,
  SkipForward,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Target,
  Activity,
  Zap,
  Star,
  Flag,
  Tag,
  Hash,
  User,
  Users,
  Calendar,
  MapPin,
  Building,
  Briefcase,
  FileText,
  Clipboard,
  ClipboardCheck,
  ClipboardList,
  MessageSquare,
  Mail,
  Phone,
  Bell,
  Settings,
  Edit,
  Trash2,
  Eye,
  Plus,
  Minus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Archive,
  Share,
  Copy,
  Move,
  Link,
  ExternalLink,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Globe,
  Smartphone,
  Monitor,
  Database,
  Server,
  Cloud,
  Shield,
  Lock,
  Unlock,
  Key }
} from 'lucide-react';

const BPMSystem = () => {
  const [processes, setProcesses] = useState([]);
  const [instances, setInstances] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [forms, setForms] = useState([]);
  const [rules, setRules] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    category: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('processes');
  
  const { toast } = useToast();

  // Status dos processos
  const processStatuses = {
    draft: { name: 'Rascunho', color: 'text-gray-600 bg-gray-100', icon: <FileText className="h-3 w-3" /> },
    active: { name: 'Ativo', color: 'text-green-600 bg-green-100', icon: <Play className="h-3 w-3" /> },
    paused: { name: 'Pausado', color: 'text-yellow-600 bg-yellow-100', icon: <Pause className="h-3 w-3" /> },
    completed: { name: 'Concluído', color: 'text-blue-600 bg-blue-100', icon: <CheckCircle className="h-3 w-3" /> },
    cancelled: { name: 'Cancelado', color: 'text-red-600 bg-red-100', icon: <XCircle className="h-3 w-3" /> }
  };

  // Status das tarefas
  const taskStatuses = {
    pending: { name: 'Pendente', color: 'text-orange-600 bg-orange-100', icon: <Clock className="h-3 w-3" /> },
    in_progress: { name: 'Em Progresso', color: 'text-blue-600 bg-blue-100', icon: <Activity className="h-3 w-3" /> },
    waiting_approval: { name: 'Aguardando Aprovação', color: 'text-purple-600 bg-purple-100', icon: <User className="h-3 w-3" /> },
    completed: { name: 'Concluída', color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-3 w-3" /> },
    rejected: { name: 'Rejeitada', color: 'text-red-600 bg-red-100', icon: <XCircle className="h-3 w-3" /> }
  };

  // Prioridades
  const priorities = {
    low: { name: 'Baixa', color: 'text-green-600 bg-green-100' },
    medium: { name: 'Média', color: 'text-yellow-600 bg-yellow-100' },
    high: { name: 'Alta', color: 'text-orange-600 bg-orange-100' },
    urgent: { name: 'Urgente', color: 'text-red-600 bg-red-100' }
  };

  /**
   * CARREGAR DADOS DO BPM
   */
  const loadBPMData = async () => {
    setLoading(true);
    try {
      const [processesRes, instancesRes, tasksRes, templatesRes, approvalsRes, formsRes, rulesRes] = await Promise.all([
        fetch('/api/bpm/processes', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/bpm/instances', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/bpm/tasks', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/bpm/templates', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/bpm/approvals', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/bpm/forms', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/bpm/rules', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (processesRes.ok) {
        const processesData = await processesRes.json();
        setProcesses(processesData.processes || []);
      }

      if (instancesRes.ok) {
        const instancesData = await instancesRes.json();
        setInstances(instancesData.instances || []);
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks || []);
      }

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData.templates || []);
      }

      if (approvalsRes.ok) {
        const approvalsData = await approvalsRes.json();
        setApprovals(approvalsData.approvals || []);
      }

      if (formsRes.ok) {
        const formsData = await formsRes.json();
        setForms(formsData.forms || []);
      }

      if (rulesRes.ok) {
        const rulesData = await rulesRes.json();
        setRules(rulesData.rules || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do BPM:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do BPM",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * CRIAR PROCESSO
   */
  const createProcess = async (processData) => {
    try {
      const response = await fetch('/api/bpm/processes', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...processData,
          status: 'draft',
          createdAt: new Date().toISOString(),`
          processId: `PROC-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar processo');
      }

      const data = await response.json();
      setProcesses(prev => [data.process, ...prev]);
      setShowProcessModal(false);
      
      toast({
        title: "Processo criado",`
        description: `Processo ${data.process.name} criado com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao criar processo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o processo",
        variant: "destructive"
      });
    }
  };

  /**
   * INICIAR PROCESSO
   */
  const startProcess = async (processId, instanceData) => {
    try {`
      const response = await fetch(`/api/bpm/processes/${processId}/start`, {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...instanceData,
          startedAt: new Date().toISOString(),`
          instanceId: `INST-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao iniciar processo');
      }

      const data = await response.json();
      setInstances(prev => [data.instance, ...prev]);
      
      toast({
        title: "Processo iniciado",`
        description: `Instância ${data.instance.instanceId} iniciada com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao iniciar processo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o processo",
        variant: "destructive"
      });
    }
  };

  /**
   * COMPLETAR TAREFA
   */
  const completeTask = async (taskId, taskData) => {
    try {`
      const response = await fetch(`/api/bpm/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...taskData,
          completedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao completar tarefa');
      }

      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed', completedAt: new Date().toISOString() }
          : task
      ));
      
      toast({
        title: "Tarefa concluída",
        description: "Tarefa concluída com sucesso",
      });
    } catch (error) {
      console.error('Erro ao completar tarefa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível completar a tarefa",
        variant: "destructive"
      });
    }
  };

  /**
   * RENDERIZAR CARD DE PROCESSO
   */
  const renderProcessCard = (process) => {
    const status = processStatuses[process.status] || processStatuses.draft;
    const priority = priorities[process.priority] || priorities.medium;
    const processInstances = instances.filter(i => i.processId === process.id);
    const activeTasks = tasks.filter(t => t.processId === process.id && t.status !== 'completed');
    
    return (
      <Card key={process.id} className="hover:shadow-lg transition-shadow group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{process.name}</h3>
                <Badge className={priority.color}>
                  {priority.name}
                </Badge>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">{process.description}</p>
              <p className="text-xs text-gray-500 mt-1">{process.processId}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={status.color}>
                {status.icon}
                <span className="ml-1">{status.name}</span>
              </Badge>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Criado por: {process.createdBy || 'Sistema'}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(process.createdAt).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Categoria: {process.category || 'Geral'}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{processInstances.length}</div>
              <div className="text-xs text-gray-600">Instâncias</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-orange-600">{activeTasks.length}</div>
              <div className="text-xs text-gray-600">Tarefas Ativas</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">
                {process.version || '1.0'}
              </div>
              <div className="text-xs text-gray-600">Versão</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            ({ process.status === 'active' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={( }) => startProcess(process.id, { processId: process.id })}
              >
                <Play className="h-3 w-3 mr-1" />

            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick=({ ( }) => {
                  // Implementar ativação
                }}
              >
                <Play className="h-3 w-3 mr-1" />

            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick=({ ( }) => setSelectedProcess(process)}
            >
              <Eye className="h-3 w-3 mr-1" />

            <Button
              variant="outline"
              size="sm"
              onClick=({ ( }) => {
                // Implementar edição
              }}
            >
              <Edit className="h-3 w-3 mr-1" />

          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR INSTÂNCIA
   */
  const renderInstance = (instance) => {
    const status = processStatuses[instance.status] || processStatuses.active;
    const process = processes.find(p => p.id === instance.processId);
    const instanceTasks = tasks.filter(t => t.instanceId === instance.id);
    const completedTasks = instanceTasks.filter(t => t.status === 'completed').length;
    const progress = instanceTasks.length > 0 ? (completedTasks / instanceTasks.length * 100).toFixed(0) : 0;
    
    return (
      <Card key={instance.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">
                {process ? process.name : 'Processo não encontrado'}
              </h3>
              <p className="text-gray-600 text-sm">{instance.instanceId}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={status.color}>
                {status.icon}
                <span className="ml-1">{status.name}</span>
              </Badge>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Progresso */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progresso</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"`
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Iniciado em:</span>
              <span>{new Date(instance.startedAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Iniciado por:</span>
              <span>{instance.startedBy || 'Sistema'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tarefas:</span>
              <span>{completedTasks}/{instanceTasks.length}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Ver Detalhes
            </Button>
            {instance.status === 'active' && (
              <Button variant="outline" size="sm">
                <Pause className="h-3 w-3 mr-1" />

            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR TAREFA
   */
  const renderTask = (task) => {
    const status = taskStatuses[task.status] || taskStatuses.pending;
    const priority = priorities[task.priority] || priorities.medium;
    const process = processes.find(p => p.id === task.processId);
    const instance = instances.find(i => i.id === task.instanceId);
    
    return (
      <Card key={task.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{task.name}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{task.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={priority.color}>
                {priority.name}
              </Badge>
              <Badge className={status.color}>
                {status.icon}
                <span className="ml-1">{status.name}</span>
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              {process ? process.name : 'Processo não encontrado'}
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              {instance ? instance.instanceId : 'Instância não encontrada'}
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Responsável: {task.assignee || 'Não atribuído'}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Prazo: {task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : 'Não definido'}
            </div>
          </div>
          
          <div className="flex gap-2">
            ({ task.status === 'pending' || task.status === 'in_progress' ? (
              <Button
                variant="default"
                size="sm"
                onClick={( }) => completeTask(task.id, { taskId: task.id })}
              >
                <CheckCircle className="h-3 w-3 mr-1" />

            ) : null}
            
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Ver Detalhes
            </Button>
            
            {task.status !== 'completed' && (
              <Button variant="outline" size="sm">
                <Edit className="h-3 w-3 mr-1" />

            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR TEMPLATE
   */
  const renderTemplate = (template) => {
    return (
      <Card key={template.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{template.name}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{template.description}</p>
            </div>
            <Badge variant="outline">
              {template.category || 'Geral'}
            </Badge>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Versão:</span>
              <span>{template.version || '1.0'}</span>
            </div>
            <div className="flex justify-between">
              <span>Criado em:</span>
              <span>{new Date(template.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span>Usado:</span>
              <span>{template.usageCount || 0} vezes</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="default" size="sm">
              <Plus className="h-3 w-3 mr-1" />
              Usar Template
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />

            <Button variant="outline" size="sm">
              <Copy className="h-3 w-3 mr-1" />

          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * OBTER ESTATÍSTICAS
   */
  const getStats = () => {
    const totalProcesses = processes.length;
    const activeProcesses = processes.filter(p => p.status === 'active').length;
    const totalInstances = instances.length;
    const activeInstances = instances.filter(i => i.status === 'active').length;
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
    ).length;
    
    return { 
      totalProcesses, 
      activeProcesses, 
      totalInstances, 
      activeInstances, 
      totalTasks, 
      pendingTasks, 
      completedTasks, 
      overdueTasks 
    };
  };

  const stats = getStats();

  /**
   * FILTRAR PROCESSOS
   */
  const filteredProcesses = processes.filter(process => {
    const matchesSearch = process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         process.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         process.processId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || process.status === filters.status;
    const matchesPriority = filters.priority === 'all' || process.priority === filters.priority;
    const matchesCategory = filters.category === 'all' || process.category === filters.category;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  /**
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadBPMData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <GitBranch className="h-8 w-8 text-blue-600" />
                BPM System
              </h1>
              <p className="text-gray-600 mt-2">
                Sistema completo de gestão de processos de negócio
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadBPMData}
                disabled={loading}
              >`
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />

              <Button
                variant="outline"
                onClick=({ ( }) => setShowTaskModal(true)}
              >
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
              <Button
                onClick=({ ( }) => setShowProcessModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Processo
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProcesses}</p>
                  <p className="text-xs text-gray-500">{stats.activeProcesses} ativos</p>
                </div>
                <Workflow className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Instâncias</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalInstances}</p>
                  <p className="text-xs text-gray-500">{stats.activeInstances} ativas</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tarefas</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalTasks}</p>
                  <p className="text-xs text-gray-500">{stats.pendingTasks} pendentes</p>
                </div>
                <ClipboardList className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Atrasadas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdueTasks}</p>
                  <p className="text-xs text-gray-500">{stats.completedTasks} concluídas</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs do BPM */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="processes">Processos</TabsTrigger>
            <TabsTrigger value="instances">Instâncias</TabsTrigger>
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="processes" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar processos..."
                        value={searchTerm}
                        onChange=({ (e }) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <select
                      value={filters.status}
                      onChange=({ (e }) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Status</option>
                      ({ Object.entries(processStatuses).map(([key, status] }) => (
                        <option key={key} value={key}>{status.name}</option>
                      ))}
                    </select>

                    <select
                      value={filters.priority}
                      onChange=({ (e }) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todas as Prioridades</option>
                      ({ Object.entries(priorities).map(([key, priority] }) => (
                        <option key={key} value={key}>{priority.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Processos */}
            ({ loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando processos...</span>
              </div>
            ) : filteredProcesses.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Workflow className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum processo encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comece criando seu primeiro processo de negócio
                  </p>
                  <Button onClick={( }) => setShowProcessModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Processo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProcesses.map(renderProcessCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="instances" className="space-y-6">
            {/* Lista de Instâncias */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando instâncias...</span>
              </div>
            ) : instances.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma instância encontrada
                  </h3>
                  <p className="text-gray-500">
                    As instâncias de processo aparecerão aqui quando iniciadas
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {instances.map(renderInstance)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            {/* Lista de Tarefas */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando tarefas...</span>
              </div>
            ) : tasks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma tarefa encontrada
                  </h3>
                  <p className="text-gray-500">
                    As tarefas aparecerão aqui quando os processos forem executados
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map(renderTask)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            {/* Lista de Templates */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando templates...</span>
              </div>
            ) : templates.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum template encontrado
                  </h3>
                  <p className="text-gray-500">
                    Crie templates para acelerar a criação de processos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(renderTemplate)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Analytics de Processos
                </h3>
                <p className="text-gray-500">
                  Relatórios e métricas de processos serão implementados aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modais serão implementados na próxima parte */}
        {showProcessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Novo Processo</h2>
              {/* Formulário será implementado */}
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick=({ ( }) => setShowProcessModal(false)}>

                <Button disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Processo'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BPMSystem;
`