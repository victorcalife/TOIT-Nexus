import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, CheckSquare, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

type TaskTemplateForm = z.infer<typeof taskTemplateSchema>;

export default function TaskManagement() {
  const [open, setOpen] = useState(false);
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

  // Fetch task templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/tasks/templates"],
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

  const onSubmit = (data: TaskTemplateForm) => {
    createTemplateMutation.mutate(data);
  };

  const handleExecuteTemplate = (templateId: string) => {
    // Simplified - in real app would show assignment dialog
    const assignedToId = users[0]?.id;
    const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    if (assignedToId) {
      executeTemplateMutation.mutate({ templateId, assignedToId, dueDate });
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Tarefas</h1>
          <p className="text-muted-foreground">
            Crie e gerencie tarefas para sua equipe
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Template de Tarefa</DialogTitle>
              <DialogDescription>
                Crie um template que pode ser reutilizado para atribuir tarefas aos funcionários.
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
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
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

                <Button 
                  className="w-full mt-4" 
                  onClick={() => handleExecuteTemplate(template.id)}
                  disabled={executeTemplateMutation.isPending}
                >
                  {executeTemplateMutation.isPending ? "Atribuindo..." : "Atribuir Tarefa"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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