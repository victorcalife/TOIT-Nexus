/**
 * SISTEMA PROJECT MANAGEMENT AVANÇADO - TOIT NEXUS
 * Sistema completo de gestão de projetos
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
  FolderKanban, 
  Calendar,
  Users,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Flag,
  Bookmark,
  Tag,
  MessageSquare,
  FileText,
  Paperclip,
  Upload,
  Download,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  Square,
  RotateCcw,
  FastForward,
  SkipForward,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Award,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  RefreshCw,
  Settings,
  Bell,
  Archive,
  Share,
  Copy,
  Move,
  Link,
  ExternalLink,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  BarChart3,
  PieChart,
  LineChart,
  Globe,
  Smartphone,
  Monitor,
  Layers,
  GitBranch,
  GitCommit,
  GitMerge,
  Code,
  Database,
  Server,
  Cloud,
  Shield,
  Lock,
  Unlock,
  Key }
} from 'lucide-react';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [timeTracking, setTimeTracking] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // kanban, gantt, calendar
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    project: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('projects');
  
  const { toast } = useToast();

  // Status dos projetos
  const projectStatuses = {
    planning: { name: 'Planejamento', color: 'text-blue-600 bg-blue-100', icon: <FileText className="h-3 w-3" /> },
    active: { name: 'Ativo', color: 'text-green-600 bg-green-100', icon: <Play className="h-3 w-3" /> },
    on_hold: { name: 'Em Espera', color: 'text-yellow-600 bg-yellow-100', icon: <Pause className="h-3 w-3" /> },
    completed: { name: 'Concluído', color: 'text-purple-600 bg-purple-100', icon: <CheckCircle className="h-3 w-3" /> },
    cancelled: { name: 'Cancelado', color: 'text-red-600 bg-red-100', icon: <XCircle className="h-3 w-3" /> }
  };

  // Prioridades
  const priorities = {
    low: { name: 'Baixa', color: 'text-green-600 bg-green-100' },
    medium: { name: 'Média', color: 'text-yellow-600 bg-yellow-100' },
    high: { name: 'Alta', color: 'text-orange-600 bg-orange-100' },
    critical: { name: 'Crítica', color: 'text-red-600 bg-red-100' }
  };

  // Status das tarefas
  const taskStatuses = {
    todo: { name: 'A Fazer', color: 'text-gray-600 bg-gray-100' },
    in_progress: { name: 'Em Progresso', color: 'text-blue-600 bg-blue-100' },
    review: { name: 'Em Revisão', color: 'text-yellow-600 bg-yellow-100' },
    done: { name: 'Concluído', color: 'text-green-600 bg-green-100' },
    blocked: { name: 'Bloqueado', color: 'text-red-600 bg-red-100' }
  };

  /**
   * CARREGAR DADOS DO PROJECT MANAGEMENT
   */
  const loadProjectData = async () => {
    setLoading(true);
    try {
      const [projectsRes, tasksRes, teamsRes, milestonesRes, timeRes, resourcesRes] = await Promise.all([
        fetch('/api/projects', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/projects/tasks', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/projects/teams', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/projects/milestones', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/projects/time-tracking', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/projects/resources', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData.projects || []);
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks || []);
      }

      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        setTeams(teamsData.teams || []);
      }

      if (milestonesRes.ok) {
        const milestonesData = await milestonesRes.json();
        setMilestones(milestonesData.milestones || []);
      }

      if (timeRes.ok) {
        const timeData = await timeRes.json();
        setTimeTracking(timeData.timeTracking || []);
      }

      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json();
        setResources(resourcesData.resources || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados dos projetos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos projetos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * CRIAR PROJETO
   */
  const createProject = async (projectData) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...projectData,
          status: 'planning',
          createdAt: new Date().toISOString(),`
          projectCode: `PRJ-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar projeto');
      }

      const data = await response.json();
      setProjects(prev => [data.project, ...prev]);
      setShowProjectModal(false);
      
      toast({
        title: "Projeto criado",`
        description: `Projeto ${data.project.name} criado com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o projeto",
        variant: "destructive"
      });
    }
  };

  /**
   * CRIAR TAREFA
   */
  const createTask = async (taskData) => {
    try {
      const response = await fetch('/api/projects/tasks', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...taskData,
          status: 'todo',
          createdAt: new Date().toISOString(),`
          taskCode: `TSK-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar tarefa');
      }

      const data = await response.json();
      setTasks(prev => [data.task, ...prev]);
      setShowTaskModal(false);
      
      toast({
        title: "Tarefa criada",`
        description: `Tarefa ${data.task.title} criada com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a tarefa",
        variant: "destructive"
      });
    }
  };

  /**
   * ATUALIZAR STATUS DO PROJETO
   */
  const updateProjectStatus = async (projectId, newStatus) => {
    try {`
      const response = await fetch(`/api/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }

      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, status: newStatus, updatedAt: new Date().toISOString() }
          : project
      ));
      
      toast({
        title: "Status atualizado",
        description: "Status do projeto atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
    }
  };

  /**
   * ATUALIZAR STATUS DA TAREFA
   */
  const updateTaskStatus = async (taskId, newStatus) => {
    try {`
      const response = await fetch(`/api/projects/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status da tarefa');
      }

      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
          : task
      ));
      
      toast({
        title: "Status atualizado",
        description: "Status da tarefa atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da tarefa",
        variant: "destructive"
      });
    }
  };

  /**
   * RENDERIZAR CARD DE PROJETO
   */
  const renderProjectCard = (project) => {
    const status = projectStatuses[project.status] || projectStatuses.planning;
    const priority = priorities[project.priority] || priorities.medium;
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    const completedTasks = projectTasks.filter(t => t.status === 'done').length;
    const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length * 100).toFixed(0) : 0;
    
    return (
      <Card key={project.id} className="hover:shadow-lg transition-shadow group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{project.name}</h3>
                <Badge className={priority.color}>
                  {priority.name}
                </Badge>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
              <p className="text-xs text-gray-500 mt-1">{project.projectCode}</p>
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
          
          <div className="space-y-3 mb-4">
            {/* Progresso */}
            <div>
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
            
            {/* Informações do projeto */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {project.startDate ? new Date(project.startDate).toLocaleDateString('pt-BR') : 'Não definido'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                <span>
                  {project.endDate ? new Date(project.endDate).toLocaleDateString('pt-BR') : 'Não definido'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{project.teamSize || 0} membros</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>{projectTasks.length} tarefas</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{projectTasks.length}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">{completedTasks}</div>
              <div className="text-xs text-gray-600">Concluídas</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-orange-600">
                {projectTasks.filter(t => t.status === 'in_progress').length}
              </div>
              <div className="text-xs text-gray-600">Em Progresso</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={project.status}
              onChange=({ (e }) => updateProjectStatus(project.id, e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            >
              ({ Object.entries(projectStatuses).map(([key, status] }) => (
                <option key={key} value={key}>{status.name}</option>
              ))}
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick=({ ( }) => setSelectedProject(project)}
            >
              <Eye className="h-3 w-3 mr-1" />

          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR KANBAN BOARD
   */
  const renderKanbanBoard = () => ({ const statusColumns = Object.entries(taskStatuses);
    
    return (
      <div className="grid grid-cols-5 gap-6">
        {statusColumns.map(([statusKey, statusInfo] }) => {
          const columnTasks = tasks.filter(task => task.status === statusKey);
          
          return (
            <div key={statusKey} className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{statusInfo.name}</h3>
                <Badge variant="outline">{columnTasks.length}</Badge>
              </div>
              
              <div className="space-y-3">
                {columnTasks.map(task => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                        {task.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={priorities[task.priority]?.color || 'text-gray-600 bg-gray-100'}>
                          {priorities[task.priority]?.name || 'Média'}
                        </Badge>
                        
                        <div className="flex items-center gap-1">
                          {task.assigneeId && (
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs text-blue-600">
                                {task.assigneeName?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                          {task.dueDate && (
                            <div className="text-xs text-gray-500">
                              {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Button
                  variant="ghost"
                  className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400"
                  onClick=({ ( }) => setShowTaskModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Tarefa
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * RENDERIZAR EQUIPE
   */
  const renderTeam = (team) => {
    const teamProjects = projects.filter(p => p.teamId === team.id);
    const teamTasks = tasks.filter(t => teamProjects.some(p => p.id === t.projectId));
    const completedTasks = teamTasks.filter(t => t.status === 'done').length;
    
    return (
      <Card key={team.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{team.name}</h3>
              <p className="text-gray-600 text-sm">{team.description}</p>
            </div>
            <Badge variant="outline">
              {team.members?.length || 0} membros
            </Badge>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              Líder: {team.leader || 'Não definido'}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building className="h-4 w-4" />
              Departamento: {team.department || 'Não definido'}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FolderKanban className="h-4 w-4" />
              Projetos: {teamProjects.length}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{teamTasks.length}</div>
              <div className="text-xs text-gray-600">Tarefas</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">{completedTasks}</div>
              <div className="text-xs text-gray-600">Concluídas</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Ver Detalhes
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-3 w-3 mr-1" />

          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * OBTER ESTATÍSTICAS
   */
  const getStats = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const overdueTasks = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;
    
    return { totalProjects, activeProjects, completedProjects, totalTasks, completedTasks, overdueTasks };
  };

  const stats = getStats();

  /**
   * FILTRAR PROJETOS
   */
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.projectCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || project.status === filters.status;
    const matchesPriority = filters.priority === 'all' || project.priority === filters.priority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  /**
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadProjectData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FolderKanban className="h-8 w-8 text-blue-600" />
                Project Management
              </h1>
              <p className="text-gray-600 mt-2">
                Sistema avançado de gestão de projetos
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadProjectData}
                disabled={loading}
              >`
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />

              <Button
                variant="outline"
                onClick=({ ( }) => setShowTaskModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
              <Button
                onClick=({ ( }) => setShowProjectModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Projetos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                </div>
                <FolderKanban className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeProjects}</p>
                </div>
                <Play className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Concluídos</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.completedProjects}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tarefas</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalTasks}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Finalizadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Atrasadas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdueTasks}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs do Project Management */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="teams">Equipes</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar projetos..."
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
                      ({ Object.entries(projectStatuses).map(([key, status] }) => (
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

            {/* Lista de Projetos */}
            ({ loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando projetos...</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FolderKanban className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum projeto encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comece criando seu primeiro projeto
                  </p>
                  <Button onClick={( }) => setShowProjectModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Projeto
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(renderProjectCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="kanban" className="space-y-6">
            {/* Kanban Board */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Quadro Kanban
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />

                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />

                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderKanbanBoard()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            {/* Lista de Equipes */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando equipes...</span>
              </div>
            ) : teams.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma equipe encontrada
                  </h3>
                  <p className="text-gray-500">
                    Crie equipes para organizar seus projetos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map(renderTeam)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Relatórios de Projetos
                </h3>
                <p className="text-gray-500">
                  Relatórios e métricas de projetos serão implementados aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modais serão implementados na próxima parte */}
        {showProjectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Novo Projeto</h2>
              {/* Formulário será implementado */}
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick=({ ( }) => setShowProjectModal(false)}>

                <Button disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Projeto'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManagement;
`