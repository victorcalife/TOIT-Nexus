import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, Users, CheckSquare, Clock, AlertTriangle, Play, Pause,
  Settings, Calendar, MessageCircle, BarChart3, Target,
  Timer, Activity, UserCheck, Zap, Filter, Search,
  Edit, Trash2, Copy, Eye, MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// Schema de validação para templates de tarefa
const taskTemplateSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  category: z.string().default("general"),
  priority: z.string().default("medium"),
  estimatedDuration: z.number().optional(),
  instructions: z.array(z.string()).min(1, "Pelo menos uma instrução é necessária"),
  assignedTo: z.array(z.string()).min(1, "Selecione pelo menos um funcionário"),
  tags: z.array(z.string()).optional(),
});

// TaskTemplateForm será inferido automaticamente pelo Zod

// Dados simulados para demonstração
const mockTasks = [
  {
    id: "1",
    title: "Análise de Bug Crítico",
    description: "Investigar e corrigir bug que está afetando o login de usuários",
    status: "em_andamento",
    priority: "critical",
    assignee: "João Silva",
    dueDate: "2024-01-20",
    progress: 65,
    category: "desenvolvimento",
    tags: ["bug", "crítico", "login"]
  },
  {
    id: "2",
    title: "Implementar Dashboard de Relatórios",
    description: "Criar nova interface para visualização de relatórios gerenciais",
    status: "pendente",
    priority: "high",
    assignee: "Maria Santos",
    dueDate: "2024-01-25",
    progress: 0,
    category: "desenvolvimento",
    tags: ["dashboard", "relatórios", "ui"]
  },
  {
    id: "3",
    title: "Revisão de Código - Módulo de Pagamentos",
    description: "Revisar implementação do novo módulo de processamento de pagamentos",
    status: "concluida",
    priority: "medium",
    assignee: "Pedro Costa",
    dueDate: "2024-01-18",
    progress: 100,
    category: "revisao",
    tags: ["code-review", "pagamentos", "segurança"]
  }
];

const mockStats = {
  total: 45,
  pendentes: 12,
  emAndamento: 18,
  concluidas: 15,
  atrasadas: 3,
  taxaConclusao: 78
};

function TasksPage() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [priorityFilter, setPriorityFilter] = useState("todas");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm({
    resolver: zodResolver(taskTemplateSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "general",
      priority: "medium",
      instructions: [""],
      assignedTo: [],
      tags: []
    }
  });

  const createTemplateMutation = useMutation({mutationFn: async (data) => {
      const response = await apiRequest('/api/tasks/templates', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Template criado com sucesso!",
        description: "O template de tarefa foi criado e está disponível para uso."
      });
      setOpen(false);
      form.reset();
    }
  });

  const onSubmit = (data) => {
    createTemplateMutation.mutate(data);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'concluida': return 'bg-green-500';
      case 'em_andamento': return 'bg-blue-500';
      case 'pendente': return 'bg-gray-500';
      case 'atrasada': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'todas' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Tarefas</h1>
          <p className="text-muted-foreground">
            Sistema completo de gerenciamento de tarefas e templates
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.total}</div>
            <p className="text-xs text-muted-foreground">tarefas no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.pendentes}</div>
            <p className="text-xs text-muted-foreground">aguardando início</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.emAndamento}</div>
            <p className="text-xs text-muted-foreground">sendo executadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.concluidas}</div>
            <p className="text-xs text-muted-foreground">finalizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.atrasadas}</div>
            <p className="text-xs text-muted-foreground">fora do prazo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.taxaConclusao}%</div>
            <p className="text-xs text-muted-foreground">eficiência geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="atrasada">Atrasada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Prioridades</SelectItem>
                <SelectItem value="low">🔵 Baixa</SelectItem>
                <SelectItem value="medium">🟡 Média</SelectItem>
                <SelectItem value="high">🟠 Alta</SelectItem>
                <SelectItem value="critical">🔴 Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tarefas */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== 'todos' || priorityFilter !== 'todas'
                ? "Tente ajustar os filtros para encontrar tarefas."
                : "Comece criando sua primeira tarefa para organizar o trabalho da sua equipe."
              }
            </p>
            <Button onClick=({ ( }) => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Tarefa
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          ({ filteredTasks.map((task }) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <CardDescription>{task.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                        {task.priority === 'critical' && '🔴'}
                        {task.priority === 'high' && '🟠'}
                        {task.priority === 'medium' && '🟡'}
                        {task.priority === 'low' && '🔵'}
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Badge>
`
                      <Badge variant="outline" className={`${getStatusColor(task.status)} text-white`}>
                        {task.status === 'concluida' && 'Concluída'}
                        {task.status === 'em_andamento' && 'Em Andamento'}
                        {task.status === 'pendente' && 'Pendente'}
                        {task.status === 'atrasada' && 'Atrasada'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{task.assignee}</span>
                      <Calendar className="h-4 w-4 ml-4" />
                      <span>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    ({ task.tags.map((tag, index }) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para criar nova tarefa */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Nova Tarefa</DialogTitle>
            <DialogDescription>
              Defina uma nova tarefa para organizar o trabalho da sua equipe.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Tarefa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Análise de Bug..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o propósito e escopo desta tarefa..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">🔵 Baixa</SelectItem>
                          <SelectItem value="medium">🟡 Média</SelectItem>
                          <SelectItem value="high">🟠 Alta</SelectItem>
                          <SelectItem value="critical">🔴 Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempo Estimado (horas)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick=({ ( }) => setOpen(false)}>
                <Button type="submit" disabled={createTemplateMutation.isPending}>
                  {createTemplateMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Tarefa
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TasksPage;`