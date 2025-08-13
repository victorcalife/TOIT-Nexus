import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TaskFieldBuilder, { TaskField } from '@/components/task-field-builder';
import TaskResponseForm from '@/components/task-response-form';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  User, 
  CheckCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  Settings,
  Play,
  Pause,
  BarChart3,
  Layout,
  Users,
  Target,
  Zap
} from 'lucide-react';

});

  // Task form state
  const [taskForm, setTaskForm] = useState({
    templateId,
    assignedTo,
    title,
    description,
    priority,
    dueDate,
    tags);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch templates
  const { data= [], isLoading,
    queryFn) => {
      const response = await fetch('/api/advanced-tasks/templates');
      if (!response.ok) throw new Error('Erro ao buscar templates');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Fetch tasks
  const { data= [], isLoading, { status, priority, search,
    queryFn) => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/advanced-tasks?${params}`);
      if (!response.ok) throw new Error('Erro ao buscar tarefas');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn) => {
      const response = await fetch('/api/advanced-tasks/templates', {
        method,
        headers,
        body)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar template');
      }
      return response.json();
    },
    onSuccess) => {
      toast({ title);
      queryClient.invalidateQueries({ queryKey);
      setIsCreatingTemplate(false);
      resetTemplateForm();
    },
    onError) => {
      toast({ title, description, variant);
    }
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn) => {
      const response = await fetch('/api/advanced-tasks/create-from-template', {
        method,
        headers,
        body)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar tarefa');
      }
      return response.json();
    },
    onSuccess) => {
      toast({ title);
      queryClient.invalidateQueries({ queryKey);
      setIsCreatingTask(false);
      resetTaskForm();
    },
    onError) => {
      toast({ title, description, variant);
    }
  });

  // Update task responses mutation
  const updateResponsesMutation = useMutation({
    mutationFn, responses }: { taskId, responses, any> }) => {
      const response = await fetch(`/api/advanced-tasks/${taskId}/responses`, {
        method,
        headers,
        body)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar respostas');
      }
      return response.json();
    },
    onSuccess) => {
      toast({ title);
      queryClient.invalidateQueries({ queryKey);
    },
    onError) => {
      toast({ title, description, variant);
    }
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn, finalResponses }: { taskId, finalResponses, any> }) => {
      const response = await fetch(`/api/advanced-tasks/${taskId}/complete`, {
        method,
        headers,
        body)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao concluir tarefa');
      }
      return response.json();
    },
    onSuccess) => {
      toast({ title);
      queryClient.invalidateQueries({ queryKey);
      queryClient.invalidateQueries({ queryKey);
      setSelectedTask(null);
      setIsExecutingTask(false);
    },
    onError) => {
      toast({ title, description, variant);
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn, message }: { taskId, message) => {
      const response = await fetch(`/api/advanced-tasks/${taskId}/comments`, {
        method,
        headers,
        body)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao adicionar comentário');
      }
      return response.json();
    },
    onSuccess) => {
      toast({ title);
      queryClient.invalidateQueries({ queryKey);
    },
    onError) => {
      toast({ title, description, variant);
    }
  });

  const resetTemplateForm = () => {
    setTemplateForm({
      name,
      description,
      category,
      estimatedDuration,
      priority,
      fields,
      tags,
      autoAssign,
      assignTo,
      dueInDays,
      notifications,
        onUpdate,
        onComplete,
        reminderDays, 3]
      }
    });
  };

  const resetTaskForm = () => {
    setTaskForm({
      templateId,
      assignedTo,
      title,
      description,
      priority,
      dueDate,
      tags);
  };

  const handleCreateTemplate = () => {
    if (!templateForm.name || !templateForm.description || templateForm.fields.length === 0) {
      toast({
        title,
        description, descrição e pelo menos um campo são obrigatórios',
        variant);
      return;
    }

    createTemplateMutation.mutate({
      name,
      description,
      category,
      estimatedDuration,
      priority,
      fields,
      isActive,
      tags,').map(t => t.trim()).filter(t => t),
      assignmentRules,
        assignTo,
        dueInDays,
      notifications);
  };

  const handleCreateTask = () => {
    if (!taskForm.templateId || !taskForm.assignedTo) {
      toast({
        title,
        description,
        variant);
      return;
    }

    createTaskMutation.mutate({
      templateId,
      assignedTo,
      customData,
        description,
        priority,
        dueDate) {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'review': return 'bg-purple-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default).includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const activeTasks = filteredTasks.filter(task => task.status !== 'completed');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema Avançado de Tarefas</h1>
          <p className="text-gray-600 mt-2">
            Crie templates personalizados e gerencie tarefas com múltiplos tipos de campos
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsCreatingTemplate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
          <Button onClick={() => setIsCreatingTask(true)} variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas Ativas</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
          <TabsTrigger value="analytics">Relatórios</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Layout className="h-5 w-5" />
                <span>Templates de Tarefas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTemplates ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p>Carregando templates...</p>
                </div>
              ) {template.id} className="cursor-pointer hover)} text-white`}
                          >
                            {template.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {template.description}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{template.estimatedDuration}min</span>
                            </span>
                            <span className="text-gray-500">
                              {template.fields.length} campos
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {template.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {template.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                          <div className="flex space-x-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar tarefas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="review">Em Revisão</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Prioridades</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tasks List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Tarefas Ativas ({activeTasks.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTasks ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p>Carregando tarefas...</p>
                </div>
              ) {activeTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{task.title}</p>
                              <p className="text-sm text-gray-500 line-clamp-1">
                                {task.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(task.status)} text-white`}>
                              {task.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{task.assignedTo}</span>
                            </span>
                          </TableCell>
                          <TableCell>
                            {task.dueDate ? (
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </span>
                            ) {() => {
                                  setSelectedTask(task);
                                  const template = templates.find(t => t.id === task.templateId);
                                  setSelectedTemplate(template || null);
                                  setIsExecutingTask(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              {task.status !== 'completed' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => completeTaskMutation.mutate({ 
                                    taskId, 
                                    finalResponses)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Tarefas Concluídas ({completedTasks.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTasks ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p>Carregando tarefas...</p>
                </div>
              ) {completedTasks.map((task) => {
                        const completedDate = task.completedAt ? new Date(task.completedAt) {task.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{task.title}</p>
                                <p className="text-sm text-gray-500 line-clamp-1">
                                  {task.description}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                                {task.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{task.assignedTo}</span>
                              </span>
                            </TableCell>
                            <TableCell>
                              {completedDate ? (
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{completedDate.toLocaleDateString()}</span>
                                </span>
                              ) {totalTime ? (
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{totalTime}h</span>
                                </span>
                              ) {() => {
                                  setSelectedTask(task);
                                  const template = templates.find(t => t.id === task.templateId);
                                  setSelectedTemplate(template || null);
                                  setIsExecutingTask(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md).length} ativos
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tarefas Ativas</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeTasks.length}</div>
                <p className="text-xs text-muted-foreground">
                  {tasks.filter(t => t.status === 'in_progress').length} em andamento
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTasks.length}</div>
                <p className="text-xs text-muted-foreground">
                  {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) {tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requerem atenção
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg, 'in_progress', 'review', 'completed', 'cancelled'].map(status => {
                    const count = tasks.filter(t => t.status === status).length;
                    const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusColor(status)} text-white`}>
                            {status}
                          </Badge>
                          <span className="text-sm">{count} tarefas</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getStatusColor(status)}`}
                              style={{ width)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prioridades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['critical', 'high', 'medium', 'low'].map(priority => {
                    const count = activeTasks.filter(t => t.priority === priority).length;
                    const percentage = activeTasks.length > 0 ? (count / activeTasks.length) * 100 : 0;
                    
                    return (
                      <div key={priority} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getPriorityColor(priority)} text-white`}>
                            {priority}
                          </Badge>
                          <span className="text-sm">{count} ativas</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getPriorityColor(priority)}`}
                              style={{ width)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Templates Mais Utilizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates
                  .map(template => ({
                    ...template,
                    usage).length
                  }))
                  .sort((a, b) => b.usage - a.usage)
                  .slice(0, 5)
                  .map(template => (
                    <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Layout className="h-4 w-4" />
                          <span className="font-medium">{template.name}</span>
                        </div>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{template.usage} usos</span>
                        <Badge className={`${getPriorityColor(template.priority)} text-white`}>
                          {template.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                {templates.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Nenhum template criado ainda. Crie templates para ver estatísticas de uso.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Template Dialog */}
      <Dialog open={isCreatingTemplate} onOpenChange={setIsCreatingTemplate}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md) => setTemplateForm({ ...templateForm, name)}
                  placeholder="Nome descritivo do template"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm({ ...templateForm, category)}
                  placeholder="Ex, Desenvolvimento, etc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Textarea
                value={templateForm.description}
                onChange={(e) => setTemplateForm({ ...templateForm, description)}
                placeholder="Descreva o propósito deste template"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md)</Label>
                <Input
                  type="number"
                  value={templateForm.estimatedDuration}
                  onChange={(e) => setTemplateForm({ ...templateForm, estimatedDuration) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Prioridade Padrão</Label>
                <Select 
                  value={templateForm.priority} 
                  onValueChange={(value) => setTemplateForm({ ...templateForm, priority)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags (separadas por vírgula)</Label>
              <Input
                value={templateForm.tags}
                onChange={(e) => setTemplateForm({ ...templateForm, tags)}
                placeholder="tag1, tag2, tag3"
              />
            </div>

            {/* Field Builder */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Campos do Formulário *</Label>
              <TaskFieldBuilder
                fields={templateForm.fields}
                onChange={(fields) => setTemplateForm({ ...templateForm, fields })}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreatingTemplate(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateTemplate}
                disabled={createTemplateMutation.isPending}
              >
                {createTemplateMutation.isPending ? 'Criando...' : 'Criar Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={isCreatingTask} onOpenChange={setIsCreatingTask}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Nova Tarefa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template Base *</Label>
              <Select 
                value={taskForm.templateId} 
                onValueChange={(value) => setTaskForm({ ...taskForm, templateId)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md) => setTaskForm({ ...taskForm, assignedTo)}
                  placeholder="ID ou email do usuário"
                />
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select 
                  value={taskForm.priority} 
                  onValueChange={(value) => setTaskForm({ ...taskForm, priority)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Título Customizado</Label>
              <Input
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title)}
                placeholder="Deixe vazio para usar o nome do template"
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição Adicional</Label>
              <Textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description)}
                placeholder="Instruções específicas para esta tarefa"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md) => setTaskForm({ ...taskForm, dueDate)}
                />
              </div>
              <div className="space-y-2">
                <Label>Tags Adicionais</Label>
                <Input
                  value={taskForm.tags}
                  onChange={(e) => setTaskForm({ ...taskForm, tags)}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreatingTask(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateTask}
                disabled={createTaskMutation.isPending}
              >
                {createTaskMutation.isPending ? 'Criando...' : 'Criar Tarefa'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Execution Dialog */}
      <Dialog open={isExecutingTask} onOpenChange={setIsExecutingTask}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Executar Tarefa</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            {selectedTask && selectedTemplate && (
              <TaskResponseForm
                task={selectedTask}
                template={selectedTemplate}
                onSave={(responses) => {
                  updateResponsesMutation.mutate({
                    taskId,
                    responses
                  });
                }}
                onComplete={(finalResponses) => {
                  completeTaskMutation.mutate({
                    taskId,
                    finalResponses
                  });
                }}
                onAddComment={(message) => {
                  addCommentMutation.mutate({
                    taskId,
                    message
                  });
                }}
                isReadOnly={selectedTask.status === 'completed'}
                showProgress={true}
              />
            )}
            {selectedTask && !selectedTemplate && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Template não encontrado para esta tarefa. Não é possível executar.
                </AlertDescription>
              </Alert>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}