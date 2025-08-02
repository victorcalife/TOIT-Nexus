import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, Users, CheckSquare, Clock, AlertTriangle, Play, Pause, 
  Settings, Calendar, MessageCircle, BarChart3, Target, 
  Timer, Activity, UserCheck, Zap, Filter
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Advanced Task Management Schemas
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

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  color: z.string().default("#3B82F6"),
  icon: z.string().default("Folder"),
  defaultPriority: z.string().default("medium"),
  defaultDuration: z.number().optional(),
});

const automationRuleSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  triggerType: z.string(),
  triggerConfig: z.record(z.any()),
  conditions: z.array(z.record(z.any())).optional(),
  actions: z.array(z.record(z.any())).min(1, "Pelo menos uma ação é necessária"),
});

const collaborationSchema = z.object({
  taskInstanceId: z.string(),
  collaborationType: z.string(),
  collaboratorId: z.string(),
  requestMessage: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.string().default("normal"),
  requiredDeliverables: z.array(z.string()).optional(),
});

type TaskTemplateForm = z.infer<typeof taskTemplateSchema>;
type CategoryForm = z.infer<typeof categorySchema>;
type AutomationRuleForm = z.infer<typeof automationRuleSchema>;
type CollaborationForm = z.infer<typeof collaborationSchema>;

export default function TaskManagement() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("templates");
  const [timeTrackingActive, setTimeTrackingActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TaskTemplateForm>({
    resolver: zodResolver(taskTemplateSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "general",
      priority: "medium",
      instructions: [""],
      assignedTo: [],
      tags: [],
    },
  });

  const categoryForm = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6",
      icon: "Folder",
      defaultPriority: "medium",
    },
  });

  const automationForm = useForm<AutomationRuleForm>({
    resolver: zodResolver(automationRuleSchema),
    defaultValues: {
      name: "",
      description: "",
      triggerType: "task_completed",
      triggerConfig: {},
      conditions: [],
      actions: [{ type: "send_notification", config: {} }],
    },
  });

  const collaborationForm = useForm<CollaborationForm>({
    resolver: zodResolver(collaborationSchema),
    defaultValues: {
      taskInstanceId: "",
      collaborationType: "review",
      collaboratorId: "",
      priority: "normal",
      requiredDeliverables: [],
    },
  });

  // Fetch task templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/tasks/templates"],
  });

  // Fetch advanced task management data
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/advanced-tasks/categories"],
  });

  const { data: automationRules = [] } = useQuery({
    queryKey: ["/api/advanced-tasks/automation/rules"],
  });

  const { data: collaborations = [] } = useQuery({
    queryKey: ["/api/advanced-tasks/collaborations"],
  });

  const { data: activeTimeTracking } = useQuery({
    queryKey: ["/api/advanced-tasks/time-tracking/active"],
    refetchInterval: 1000, // Atualizar a cada segundo
  });

  const { data: productivityMetrics } = useQuery({
    queryKey: ["/api/advanced-tasks/productivity/user/current"],
  });

  // Fetch department users
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users/department"],
  });

  // Create task template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: TaskTemplateForm) => {
      return await apiRequest("/api/tasks/templates", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/templates"] });
      toast({
        title: "Template criado!",
        description: "Template de tarefa criado com sucesso.",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao criar template de tarefa.",
        variant: "destructive",
      });
    },
  });

  // Advanced Task Management Mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryForm) => {
      return await apiRequest("/api/advanced-tasks/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advanced-tasks/categories"] });
      toast({
        title: "Categoria criada!",
        description: "Categoria de tarefa criada com sucesso.",
      });
      categoryForm.reset();
    },
  });

  const createAutomationRuleMutation = useMutation({
    mutationFn: async (data: AutomationRuleForm) => {
      return await apiRequest("/api/advanced-tasks/automation/rules", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advanced-tasks/automation/rules"] });
      toast({
        title: "Regra de automação criada!",
        description: "Regra de automação criada com sucesso.",
      });
      automationForm.reset();
    },
  });

  const startTimeTrackingMutation = useMutation({
    mutationFn: async ({ taskInstanceId, activityType, description }: any) => {
      return await apiRequest("/api/advanced-tasks/time-tracking/start", {
        method: "POST",
        body: JSON.stringify({ taskInstanceId, activityType, description }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/advanced-tasks/time-tracking/active"] });
      setTimeTrackingActive(true);
      setCurrentTaskId(data.taskInstanceId);
      toast({
        title: "Time tracking iniciado!",
        description: "Cronômetro iniciado para a tarefa.",
      });
    },
  });

  const stopTimeTrackingMutation = useMutation({
    mutationFn: async ({ id, productivityScore, focusLevel, finalDescription }: any) => {
      return await apiRequest(`/api/advanced-tasks/time-tracking/${id}/stop`, {
        method: "POST",
        body: JSON.stringify({ productivityScore, focusLevel, finalDescription }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advanced-tasks/time-tracking/active"] });
      setTimeTrackingActive(false);
      setCurrentTaskId(null);
      setElapsedTime(0);
      toast({
        title: "Time tracking finalizado!",
        description: "Cronômetro parado e dados salvos.",
      });
    },
  });

  const createCollaborationMutation = useMutation({
    mutationFn: async (data: CollaborationForm) => {
      return await apiRequest("/api/advanced-tasks/collaborations", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advanced-tasks/collaborations"] });
      toast({
        title: "Colaboração solicitada!",
        description: "Solicitação de colaboração enviada.",
      });
      collaborationForm.reset();
    },
  });

  // Execute template mutation
  const executeTemplateMutation = useMutation({
    mutationFn: async ({ templateId, assignedToId, dueDate }: any) => {
      return await apiRequest(`/api/tasks/templates/${templateId}/execute`, {
        method: "POST",
        body: JSON.stringify({ assignedToId, dueDate }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Tarefa atribuída!",
        description: "Tarefa foi atribuída ao funcionário.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atribuir tarefa.",
        variant: "destructive",
      });
    },
  });

  // Time tracking effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeTrackingActive && activeTimeTracking?.data) {
      interval = setInterval(() => {
        const startTime = new Date(activeTimeTracking.data.tracking.startTime).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeTrackingActive, activeTimeTracking]);

  // Form handlers
  const onSubmit = (data: TaskTemplateForm) => {
    createTemplateMutation.mutate(data);
  };

  const onCategorySubmit = (data: CategoryForm) => {
    createCategoryMutation.mutate(data);
  };

  const onAutomationSubmit = (data: AutomationRuleForm) => {
    createAutomationRuleMutation.mutate(data);
  };

  const onCollaborationSubmit = (data: CollaborationForm) => {
    createCollaborationMutation.mutate(data);
  };

  const handleExecuteTemplate = (templateId: string) => {
    // Simplified - in real app would show assignment dialog
    const assignedToId = users[0]?.id;
    const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    if (assignedToId) {
      executeTemplateMutation.mutate({ templateId, assignedToId, dueDate });
    }
  };

  const handleStartTimeTracking = (taskId: string) => {
    startTimeTrackingMutation.mutate({
      taskInstanceId: taskId,
      activityType: "work",
      description: "Iniciando trabalho na tarefa"
    });
  };

  const handleStopTimeTracking = () => {
    if (activeTimeTracking?.data) {
      stopTimeTrackingMutation.mutate({
        id: activeTimeTracking.data.tracking.id,
        productivityScore: 8,
        focusLevel: 7,
        finalDescription: "Trabalho finalizado"
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addInstruction = () => {
    const current = form.getValues("instructions");
    form.setValue("instructions", [...current, ""]);
  };

  const removeInstruction = (index: number) => {
    const current = form.getValues("instructions");
    form.setValue("instructions", current.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Time Tracking */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management Avançado</h1>
          <p className="text-muted-foreground">
            Sistema completo de gerenciamento, automação e colaboração de tarefas
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Time Tracking Widget */}
          {timeTrackingActive && (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <Timer className="h-4 w-4" />
                </div>
                <div className="text-lg font-mono font-bold">
                  {formatTime(elapsedTime)}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStopTimeTracking}
                >
                  <Pause className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Template de Tarefa Avançado</DialogTitle>
              <DialogDescription>
                Crie um template reutilizável com automação, categorização e tracking avançado.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="automation">Automação</TabsTrigger>
                <TabsTrigger value="advanced">Avançado</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da Tarefa</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Ligar para cliente investidor" {...field} />
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
                          placeholder="Descreva o objetivo da tarefa..."
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
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general">Geral</SelectItem>
                            <SelectItem value="client_follow_up">Follow-up Cliente</SelectItem>
                            <SelectItem value="reporting">Relatórios</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione prioridade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="urgent">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormLabel>Instruções</FormLabel>
                  <div className="space-y-2 mt-2">
                    {form.watch("instructions").map((_, index) => (
                      <div key={index} className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`instructions.${index}`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input 
                                  placeholder={`Instrução ${index + 1}`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {form.watch("instructions").length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeInstruction(index)}
                          >
                            Remover
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addInstruction}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Instrução
                    </Button>
                  </div>
                </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createTemplateMutation.isPending}
                      >
                        {createTemplateMutation.isPending ? "Criando..." : "Criar Template"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="automation" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Triggers Automáticos</h4>
                    <div className="grid gap-3">
                      <div className="flex items-center space-x-2">
                        <Switch id="auto-assign" />
                        <label htmlFor="auto-assign" className="text-sm">
                          Atribuir automaticamente quando criada
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch id="auto-notify" />
                        <label htmlFor="auto-notify" className="text-sm">
                          Notificar gerente quando completada
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch id="auto-reminder" />
                        <label htmlFor="auto-reminder" className="text-sm">
                          Lembrete automático antes do prazo
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Ações Condicionais</h4>
                    <div className="space-y-2">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Quando prioridade = Alta" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high-priority">Quando prioridade = Alta</SelectItem>
                          <SelectItem value="overdue">Quando prazo vencido</SelectItem>
                          <SelectItem value="completed">Quando completada</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Ação a executar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="notify-manager">Notificar Gerente</SelectItem>
                          <SelectItem value="create-follow-up">Criar Follow-up</SelectItem>
                          <SelectItem value="update-status">Atualizar Status</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Skills Necessárias</h4>
                    <div className="flex flex-wrap gap-2">
                      {["JavaScript", "React", "Node.js", "SQL", "Design", "Comunicação"].map((skill) => (
                        <Badge key={skill} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Dependências</h4>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione templates dependentes" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((t: any) => (
                          <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Metas de Produtividade</h4>
                    <div className="grid gap-3">
                      <div>
                        <label className="text-sm font-medium">Tempo Máximo Esperado (horas)</label>
                        <Input type="number" placeholder="4" className="mt-1" />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Score Mínimo de Qualidade (1-10)</label>
                        <Slider defaultValue={[7]} max={10} min={1} step={1} className="mt-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Advanced Task Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
          <TabsTrigger value="collaboration">Colaboração</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template: any) => (
              <Card key={template.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <Badge variant={
                      template.priority === 'urgent' ? 'destructive' :
                      template.priority === 'high' ? 'default' :
                      template.priority === 'medium' ? 'secondary' : 'outline'
                    }>
                      {template.priority === 'urgent' ? 'Urgente' :
                       template.priority === 'high' ? 'Alta' :
                       template.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {template.description || "Sem descrição"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckSquare className="h-4 w-4" />
                      {template.instructions?.length || 0} instruções
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {template.assignedTo?.length || 0} funcionários
                    </div>

                    {template.estimatedDuration && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {template.estimatedDuration} min
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => handleExecuteTemplate(template.id)}
                        disabled={executeTemplateMutation.isPending}
                      >
                        Atribuir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartTimeTracking(template.id)}
                        disabled={timeTrackingActive}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Regras de Automação</h3>
              <p className="text-sm text-muted-foreground">
                Configure disparos automáticos baseados em eventos
              </p>
            </div>
            <Button onClick={() => createAutomationRuleMutation.mutate({
              name: "Notificar quando tarefa completada",
              triggerType: "task_completed",
              triggerConfig: { status: "completed" },
              actions: [{ type: "send_notification", config: { message: "Tarefa completada!" } }]
            })}>
              <Zap className="h-4 w-4 mr-2" />
              Nova Regra
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {automationRules.map((rule: any) => (
              <Card key={rule.rule?.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <CardTitle className="text-base">{rule.rule?.name}</CardTitle>
                    <Badge variant={rule.rule?.isActive ? "default" : "secondary"}>
                      {rule.rule?.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Trigger: {rule.rule?.triggerType} | {rule.rule?.actions?.length || 0} ações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Execuções: {rule.rule?.totalExecutions || 0}</span>
                    <span>Sucesso: {rule.rule?.successfulExecutions || 0}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Collaboration Tab */}
        <TabsContent value="collaboration" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Sistema de Colaboração</h3>
              <p className="text-sm text-muted-foreground">
                Gerencie atribuições, revisões e aprovações
              </p>
            </div>
            <Button onClick={() => setActiveTab("templates")}>
              <UserCheck className="h-4 w-4 mr-2" />
              Nova Colaboração
            </Button>
          </div>
          
          <div className="grid gap-4">
            {collaborations.map((collab: any) => (
              <Card key={collab.collaboration?.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      <CardTitle className="text-base">
                        {collab.collaboration?.collaborationType === 'review' ? 'Revisão' :
                         collab.collaboration?.collaborationType === 'approval' ? 'Aprovação' :
                         collab.collaboration?.collaborationType === 'consultation' ? 'Consulta' : 'Atribuição'}
                      </CardTitle>
                    </div>
                    <Badge variant={
                      collab.collaboration?.status === 'pending' ? 'outline' :
                      collab.collaboration?.status === 'accepted' ? 'default' : 'destructive'
                    }>
                      {collab.collaboration?.status === 'pending' ? 'Pendente' :
                       collab.collaboration?.status === 'accepted' ? 'Aceito' : 'Rejeitado'}
                    </Badge>
                  </div>
                  <CardDescription>
                    Tarefa: {collab.task?.title} | Solicitante: {collab.requester?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{collab.collaboration?.requestMessage || "Sem mensagem"}</p>
                  <div className="flex justify-end gap-2 mt-4">
                    {collab.collaboration?.status === 'pending' && (
                      <>
                        <Button size="sm" variant="outline">
                          Rejeitar
                        </Button>
                        <Button size="sm">
                          Aceitar
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tarefas Completadas</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {productivityMetrics?.summary?.totalTasks || 0}
                </div>
                <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Trabalhado</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((productivityMetrics?.summary?.totalTimeWorked || 0) / 3600)}h
                </div>
                <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produtividade</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {productivityMetrics?.summary?.averageProductivityScore || 0}/10
                </div>
                <Progress 
                  value={(parseFloat(productivityMetrics?.summary?.averageProductivityScore || '0') / 10) * 100} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Automações Ativas</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {automationRules.filter((r: any) => r.rule?.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">De {automationRules.length} total</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Categorias de Tarefas</h3>
              <p className="text-sm text-muted-foreground">
                Organize templates por categorias personalizadas
              </p>
            </div>
            <Button onClick={() => createCategoryMutation.mutate({
              name: "Nova Categoria",
              description: "Categoria criada automaticamente",
              color: "#10B981",
              icon: "Target"
            })}>
              <Target className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category: any) => (
              <Card key={category.id}>
                <CardContent className="p-6 text-center">
                  <div 
                    className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <Target className="h-6 w-6" style={{ color: category.color }} />
                  </div>
                  <h4 className="font-semibold mb-2">{category.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {category.description || "Sem descrição"}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    Prioridade: {category.defaultPriority}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {templates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece criando seu primeiro template de tarefa para organizar o trabalho da sua equipe.
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}