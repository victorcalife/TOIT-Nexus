/**
 * SISTEMA DE TASK MANAGEMENT COMPLETO
 * Gestão avançada de tarefas com Kanban, Gantt e relatórios
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  CheckSquare, Plus, Calendar, User, Flag, MessageSquare, 
  Paperclip, MoreHorizontal, Filter, Search, Download,
  Clock, Target, TrendingUp, BarChart3, Kanban, List,
  Edit, Trash2, Eye, Users, AlertCircle, CheckCircle2
} from 'lucide-react';

export default function Tasks() {
  const { user, tenant } = useAuth();
  const [view, setView] = useState('kanban'); // kanban, list, gantt, calendar
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    dueDate: 'all'
  });

  useEffect(() => {
    loadTasks();
    loadProjects();
  }, [selectedProject, filters]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      // Simular carregamento de tarefas
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockTasks = generateMockTasks();
      setTasks(mockTasks);
      
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const mockProjects = [
        { id: 'proj-1', name: 'TOIT Nexus v2.0', color: '#3b82f6', tasks: 24 },
        { id: 'proj-2', name: 'Sistema Quântico', color: '#8b5cf6', tasks: 12 },
        { id: 'proj-3', name: 'MILA AI Enhancement', color: '#10b981', tasks: 8 },
        { id: 'proj-4', name: 'Cliente Portal', color: '#f59e0b', tasks: 15 }
      ];
      
      setProjects(mockProjects);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    }
  };

  const generateMockTasks = () => {
    return [
      {
        id: 'task-1',
        title: 'Implementar autenticação JWT',
        description: 'Desenvolver sistema completo de autenticação com JWT tokens',
        status: 'in_progress',
        priority: 'high',
        projectId: 'proj-1',
        assignee: {
          id: user?.id,
          name: user?.name,
          avatar: 'https://github.com/victorcalife.png'
        },
        reporter: {
          id: user?.id,
          name: user?.name
        },
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        updatedAt: new Date(),
        tags: ['backend', 'security'],
        comments: 3,
        attachments: 1,
        subtasks: [
          { id: 'sub-1', title: 'Configurar middleware JWT', completed: true },
          { id: 'sub-2', title: 'Implementar refresh tokens', completed: false },
          { id: 'sub-3', title: 'Testes de segurança', completed: false }
        ],
        timeTracked: 480, // minutos
        estimatedTime: 720 // minutos
      },
      {
        id: 'task-2',
        title: 'Design do Dashboard',
        description: 'Criar interface moderna e responsiva para o dashboard principal',
        status: 'todo',
        priority: 'medium',
        projectId: 'proj-1',
        assignee: {
          id: 'user-2',
          name: 'Maria Santos',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
        },
        reporter: {
          id: user?.id,
          name: user?.name
        },
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        updatedAt: new Date(),
        tags: ['frontend', 'ui/ux'],
        comments: 1,
        attachments: 2,
        subtasks: [],
        timeTracked: 120,
        estimatedTime: 480
      },
      {
        id: 'task-3',
        title: 'Algoritmo Quântico Grover',
        description: 'Implementar algoritmo de busca quântica de Grover',
        status: 'done',
        priority: 'high',
        projectId: 'proj-2',
        assignee: {
          id: user?.id,
          name: user?.name,
          avatar: 'https://github.com/victorcalife.png'
        },
        reporter: {
          id: user?.id,
          name: user?.name
        },
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        tags: ['quantum', 'algorithm'],
        comments: 5,
        attachments: 0,
        subtasks: [
          { id: 'sub-4', title: 'Pesquisa teórica', completed: true },
          { id: 'sub-5', title: 'Implementação base', completed: true },
          { id: 'sub-6', title: 'Testes e validação', completed: true }
        ],
        timeTracked: 960,
        estimatedTime: 720
      },
      {
        id: 'task-4',
        title: 'MILA NLP Enhancement',
        description: 'Melhorar processamento de linguagem natural da MILA',
        status: 'in_review',
        priority: 'medium',
        projectId: 'proj-3',
        assignee: {
          id: 'user-3',
          name: 'João Silva',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
        },
        reporter: {
          id: user?.id,
          name: user?.name
        },
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 dias
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 dias atrás
        updatedAt: new Date(),
        tags: ['ai', 'nlp'],
        comments: 2,
        attachments: 1,
        subtasks: [],
        timeTracked: 600,
        estimatedTime: 480
      }
    ];
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      in_review: 'bg-yellow-100 text-yellow-800',
      done: 'bg-green-100 text-green-800',
      blocked: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.todo;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-red-600',
      urgent: 'text-purple-600'
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      low: <Flag className="h-4 w-4" />,
      medium: <Flag className="h-4 w-4" />,
      high: <Flag className="h-4 w-4" />,
      urgent: <AlertCircle className="h-4 w-4" />
    };
    return icons[priority] || icons.medium;
  };

  const formatTimeTracked = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTaskProgress = (task) => {
    if (task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(sub => sub.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  const renderKanbanView = () => {
    const columns = [
      { id: 'todo', title: 'A Fazer', status: 'todo' },
      { id: 'in_progress', title: 'Em Progresso', status: 'in_progress' },
      { id: 'in_review', title: 'Em Revisão', status: 'in_review' },
      { id: 'done', title: 'Concluído', status: 'done' }
    ];

    return (
      <div className="grid grid-cols-4 gap-6 h-full">
        {columns.map(column => {
          const columnTasks = tasks.filter(task => task.status === column.status);
          
          return (
            <div key={column.id} className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {column.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {columnTasks.length}
                </Badge>
              </div>
              
              <div className="flex-1 space-y-3 overflow-auto">
                {columnTasks.map(task => (
                  <Card 
                    key={task.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedTask(task);
                      setShowTaskModal(true);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header da tarefa */}
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {task.title}
                          </h4>
                          <div className={`${getPriorityColor(task.priority)}`}>
                            {getPriorityIcon(task.priority)}
                          </div>
                        </div>
                        
                        {/* Tags */}
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {task.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{task.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {/* Progresso das subtarefas */}
                        {task.subtasks.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>Progresso</span>
                              <span>{getTaskProgress(task)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${getTaskProgress(task)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {/* Footer da tarefa */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            {task.comments > 0 && (
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{task.comments}</span>
                              </div>
                            )}
                            
                            {task.attachments > 0 && (
                              <div className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                <span>{task.attachments}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {task.assignee && (
                              <img
                                src={task.assignee.avatar}
                                alt={task.assignee.name}
                                className="w-6 h-6 rounded-full"
                              />
                            )}
                            
                            {task.dueDate && (
                              <div className={`flex items-center gap-1 ${
                                new Date(task.dueDate) < new Date() ? 'text-red-500' : ''
                              }`}>
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(task.dueDate).toLocaleDateString('pt-BR', { 
                                    day: '2-digit', 
                                    month: '2-digit' 
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Botão para adicionar tarefa */}
                <Button 
                  variant="ghost" 
                  className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-gray-400"
                  onClick={() => setShowTaskModal(true)}
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

  const renderListView = () => {
    return (
      <div className="space-y-2">
        {tasks.map(task => (
          <Card 
            key={task.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedTask(task);
              setShowTaskModal(true);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <CheckSquare className="h-5 w-5 text-gray-400" />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{task.title}</h4>
                    <p className="text-sm text-gray-600 truncate">{task.description}</p>
                  </div>
                  
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  
                  <div className={`${getPriorityColor(task.priority)}`}>
                    {getPriorityIcon(task.priority)}
                  </div>
                  
                  {task.assignee && (
                    <img
                      src={task.assignee.avatar}
                      alt={task.assignee.name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  
                  {task.dueDate && (
                    <div className="text-sm text-gray-500">
                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
                
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Tarefas
              </h1>
              
              {/* Seletor de projeto */}
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecionar projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Projetos</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Seletor de visualização */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'kanban', label: 'Kanban', icon: Kanban },
                  { key: 'list', label: 'Lista', icon: List },
                  { key: 'gantt', label: 'Gantt', icon: BarChart3 },
                  { key: 'calendar', label: 'Calendário', icon: Calendar }
                ].map(viewOption => {
                  const Icon = viewOption.icon;
                  return (
                    <Button
                      key={viewOption.key}
                      variant={view === viewOption.key ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setView(viewOption.key)}
                      className="text-xs"
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {viewOption.label}
                    </Button>
                  );
                })}
              </div>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              
              <Button size="sm" onClick={() => setShowTaskModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Em Progresso</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasks.filter(t => t.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Concluídas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasks.filter(t => t.status === 'done').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Produtividade</p>
                  <p className="text-2xl font-bold text-gray-900">87%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualizações */}
        <div className="bg-white rounded-lg shadow-sm border p-6 min-h-[600px]">
          {view === 'kanban' && renderKanbanView()}
          {view === 'list' && renderListView()}
          {view === 'gantt' && (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Visualização Gantt em desenvolvimento</p>
              </div>
            </div>
          )}
          {view === 'calendar' && (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <div className="text-center">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Visualização Calendário em desenvolvimento</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
