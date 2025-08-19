/**
 * TASK MANAGEMENT AVANÇADO - TOIT NEXUS
 * Sistema completo de gestão de tarefas com Kanban
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckSquare, 
  Plus, 
  Edit,
  Trash2,
  Clock,
  User,
  Calendar,
  Flag,
  MessageSquare,
  Paperclip,
  Eye,
  Filter,
  Search,
  MoreHorizontal,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Circle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Users,
  Tag,
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  RefreshCw
} from 'lucide-react';

const TaskManagementAdvanced = () => {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([
    { id: 'todo', name: 'A Fazer', color: '#6B7280', tasks: [] },
    { id: 'in_progress', name: 'Em Progresso', color: '#3B82F6', tasks: [] },
    { id: 'review', name: 'Em Revisão', color: '#F59E0B', tasks: [] },
    { id: 'done', name: 'Concluído', color: '#10B981', tasks: [] }
  ]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [view, setView] = useState('kanban'); // kanban, list, calendar
  const [filters, setFilters] = useState({
    assignee: 'all',
    priority: 'all',
    status: 'all',
    dueDate: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  
  const { toast } = useToast();

  // Formulário de tarefa
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    project: '',
    tags: [],
    estimatedHours: '',
    attachments: [],
    subtasks: [],
    dependencies: []
  });

  /**
   * CARREGAR TAREFAS
   */
  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar tarefas');
      }

      const data = await response.json();
      const tasksData = data.tasks || [];
      setTasks(tasksData);
      
      // Organizar tarefas por coluna
      const updatedColumns = columns.map(column => ({
        ...column,
        tasks: tasksData.filter(task => task.status === column.id)
      }));
      setColumns(updatedColumns);
      
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * CARREGAR MEMBROS DA EQUIPE
   */
  const loadTeamMembers = async () => {
    try {
      const response = await fetch('/api/team/members', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar membros');
      }

      const data = await response.json();
      setTeamMembers(data.members || []);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    }
  };

  /**
   * CRIAR TAREFA
   */
  const createTask = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...taskForm,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar tarefa');
      }

      const data = await response.json();
      const newTask = data.task;
      
      setTasks(prev => [...prev, newTask]);
      setColumns(prev => prev.map(column => 
        column.id === newTask.status 
          ? { ...column, tasks: [...column.tasks, newTask] }
          : column
      ));
      
      setShowCreateModal(false);
      resetTaskForm();
      
      toast({
        title: "Tarefa criada",
        description: "Tarefa criada com sucesso",
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
   * ATUALIZAR TAREFA
   */
  const updateTask = async (taskId, updates) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...updates,
          updatedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar tarefa');
      }

      const data = await response.json();
      const updatedTask = data.task;
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      
      // Atualizar colunas se o status mudou
      if (updates.status) {
        setColumns(prev => prev.map(column => ({
          ...column,
          tasks: column.tasks.filter(task => task.id !== taskId)
        })).map(column => 
          column.id === updates.status 
            ? { ...column, tasks: [...column.tasks, updatedTask] }
            : column
        ));
      }
      
      toast({
        title: "Tarefa atualizada",
        description: "Tarefa atualizada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tarefa",
        variant: "destructive"
      });
    }
  };

  /**
   * DELETAR TAREFA
   */
  const deleteTask = async (taskId) => {
    if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar tarefa');
      }

      setTasks(prev => prev.filter(task => task.id !== taskId));
      setColumns(prev => prev.map(column => ({
        ...column,
        tasks: column.tasks.filter(task => task.id !== taskId)
      })));
      
      setSelectedTask(null);
      setShowTaskModal(false);
      
      toast({
        title: "Tarefa deletada",
        description: "Tarefa removida com sucesso",
      });
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a tarefa",
        variant: "destructive"
      });
    }
  };

  /**
   * MOVER TAREFA ENTRE COLUNAS
   */
  const moveTask = (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    updateTask(taskId, { status: newStatus });
  };

  /**
   * RESETAR FORMULÁRIO
   */
  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      assignee: '',
      priority: 'medium',
      status: 'todo',
      dueDate: '',
      project: '',
      tags: [],
      estimatedHours: '',
      attachments: [],
      subtasks: [],
      dependencies: []
    });
  };

  /**
   * OBTER COR DA PRIORIDADE
   */
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  /**
   * OBTER ÍCONE DA PRIORIDADE
   */
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <ArrowUp className="h-3 w-3" />;
      case 'medium': return <ArrowRight className="h-3 w-3" />;
      case 'low': return <ArrowDown className="h-3 w-3" />;
      default: return <Circle className="h-3 w-3" />;
    }
  };

  /**
   * RENDERIZAR TAREFA NO KANBAN
   */
  const renderTaskCard = (task) => {
    const assignee = teamMembers.find(member => member.id === task.assignee);
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
    
    return (
      <div
        key={task.id}
        className={`bg-white border border-gray-200 rounded-lg p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow ${
          isOverdue ? 'border-red-300 bg-red-50' : ''
        }`}
        onClick={() => {
          setSelectedTask(task);
          setShowTaskModal(true);
        }}
        draggable
        onDragStart={() => setDraggedTask(task)}
      >
        {/* Header da tarefa */}
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
            {task.title}
          </h4>
          <div className="flex items-center gap-1 ml-2">
            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
              {getPriorityIcon(task.priority)}
            </Badge>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Descrição */}
        {task.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Informações adicionais */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {/* Assignee */}
            {assignee && (
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xs font-medium">
                    {assignee.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            
            {/* Comentários */}
            {task.commentsCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{task.commentsCount}</span>
              </div>
            )}
            
            {/* Anexos */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                <span>{task.attachments.length}</span>
              </div>
            )}
            
            {/* Subtarefas */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                <span>
                  {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                </span>
              </div>
            )}
          </div>
          
          {/* Data de vencimento */}
          {task.dueDate && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
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

        {/* Barra de progresso para subtarefas */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-blue-600 h-1 rounded-full transition-all"
                style={{
                  width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%`
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * RENDERIZAR COLUNA DO KANBAN
   */
  const renderKanbanColumn = (column) => {
    return (
      <div key={column.id} className="flex-1 min-w-[300px]">
        <div className="bg-gray-50 rounded-lg p-4">
          {/* Header da coluna */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: column.color }}
              ></div>
              <h3 className="font-medium text-gray-900">{column.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {column.tasks.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTaskForm(prev => ({ ...prev, status: column.id }));
                setShowCreateModal(true);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Drop zone */}
          <div
            className="min-h-[500px]"
            onDrop={(e) => {
              e.preventDefault();
              if (draggedTask && draggedTask.status !== column.id) {
                moveTask(draggedTask.id, column.id);
              }
              setDraggedTask(null);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {column.tasks.map(renderTaskCard)}
            
            {column.tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma tarefa</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * CALCULAR ESTATÍSTICAS
   */
  const getStatistics = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'done').length;
    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    const overdue = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
    ).length;
    
    return { total, completed, inProgress, overdue };
  };

  const stats = getStatistics();

  /**
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadTasks();
    loadTeamMembers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <CheckSquare className="h-8 w-8 text-blue-600" />
                Task Management
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie tarefas e projetos da equipe
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setView(view === 'kanban' ? 'list' : 'kanban')}
              >
                {view === 'kanban' ? <BarChart3 className="h-4 w-4 mr-2" /> : <CheckSquare className="h-4 w-4 mr-2" />}
                {view === 'kanban' ? 'Lista' : 'Kanban'}
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
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
                  <p className="text-sm font-medium text-gray-600">Total de Tarefas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Progresso</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Concluídas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
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
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar tarefas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={filters.assignee}
                  onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os Responsáveis</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>

                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas as Prioridades</option>
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os Status</option>
                  <option value="todo">A Fazer</option>
                  <option value="in_progress">Em Progresso</option>
                  <option value="review">Em Revisão</option>
                  <option value="done">Concluído</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kanban Board */}
        {view === 'kanban' && (
          <div className="flex gap-6 overflow-x-auto pb-6">
            {columns.map(renderKanbanColumn)}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando tarefas...</span>
          </div>
        )}
      </div>

      {/* Modal de Criação de Tarefa - Será implementado na próxima parte */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Criar Nova Tarefa</h2>
            {/* Formulário será implementado na próxima parte */}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button onClick={createTask} disabled={loading}>
                {loading ? 'Criando...' : 'Criar Tarefa'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagementAdvanced;
