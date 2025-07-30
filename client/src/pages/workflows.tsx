import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Workflows() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    description: "",
    categoryId: "",
    trigger: {
      type: "client_condition",
      conditions: []
    },
    actions: []
  });

  const { toast } = useToast();

  const { data: workflows, isLoading: workflowsLoading } = useQuery({
    queryKey: ['/api/workflows'],
    retry: false,
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    retry: false,
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async (workflowData: any) => {
      await apiRequest('POST', '/api/workflows', workflowData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      setIsCreateDialogOpen(false);
      setNewWorkflow({
        name: "",
        description: "",
        categoryId: "",
        trigger: {
          type: "client_condition",
          conditions: []
        },
        actions: []
      });
      toast({
        title: "Workflow criado",
        description: "Workflow foi criado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar workflow.",
        variant: "destructive",
      });
    },
  });

  const updateWorkflowStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await apiRequest('PUT', `/api/workflows/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      toast({
        title: "Status atualizado",
        description: "Status do workflow foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do workflow.",
        variant: "destructive",
      });
    },
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      await apiRequest('DELETE', `/api/workflows/${workflowId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      toast({
        title: "Workflow excluído",
        description: "Workflow foi excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao excluir workflow.",
        variant: "destructive",
      });
    },
  });

  const getCategoryName = (categoryId: string) => {
    return categories?.find((cat: any) => cat.id === categoryId)?.name || 'Geral';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-warning-100 text-warning-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'draft':
        return 'Rascunho';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case 'inactive':
        return <Pause className="w-4 h-4 text-gray-500" />;
      case 'draft':
        return <AlertCircle className="w-4 h-4 text-warning-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleCreateWorkflow = () => {
    if (!newWorkflow.name) {
      toast({
        title: "Erro",
        description: "Nome do workflow é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    const workflowData = {
      ...newWorkflow,
      status: 'draft'
    };

    createWorkflowMutation.mutate(workflowData);
  };

  const toggleWorkflowStatus = (workflow: any) => {
    const newStatus = workflow.status === 'active' ? 'inactive' : 'active';
    updateWorkflowStatusMutation.mutate({
      id: workflow.id,
      status: newStatus
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Workflows Automatizados</h1>
            <p className="text-sm text-gray-600 mt-1">
              Gerencie os workflows que automatizam processos baseados nos perfis dos clientes
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary-500 hover:bg-primary-600">
                <Plus className="w-4 h-4 mr-2" />
                Novo Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Workflow</DialogTitle>
                <DialogDescription>
                  Configure um novo workflow automatizado para seus clientes.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="workflow-name">Nome do Workflow *</Label>
                  <Input
                    id="workflow-name"
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                    placeholder="Ex: Análise Mensal Premium"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="workflow-description">Descrição</Label>
                  <Textarea
                    id="workflow-description"
                    value={newWorkflow.description}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                    placeholder="Descreva o que este workflow faz..."
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="workflow-category">Categoria de Cliente</Label>
                  <Select 
                    value={newWorkflow.categoryId} 
                    onValueChange={(value) => setNewWorkflow({ ...newWorkflow, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateWorkflow}
                  disabled={createWorkflowMutation.isPending}
                >
                  {createWorkflowMutation.isPending ? "Criando..." : "Criar Workflow"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Workflows Grid */}
        {workflowsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : workflows && workflows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow: any) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Categoria: {getCategoryName(workflow.categoryId)}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(workflow.status)}>
                      {getStatusLabel(workflow.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workflow.description && (
                      <p className="text-sm text-gray-600">{workflow.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Activity className="w-4 h-4" />
                        <span>Execuções: {workflow.executionCount || 0}</span>
                      </div>
                      {workflow.lastExecuted && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            Última: {new Date(workflow.lastExecuted).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWorkflowStatus(workflow)}
                          disabled={updateWorkflowStatusMutation.isPending}
                        >
                          {workflow.status === 'active' ? (
                            <>
                              <Pause className="w-4 h-4 mr-1" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-1" />
                              Ativar
                            </>
                          )}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteWorkflowMutation.mutate(workflow.id)}
                        disabled={deleteWorkflowMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum workflow configurado
            </h3>
            <p className="text-gray-500 mb-6">
              Comece criando workflows automatizados para otimizar seus processos.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Workflow
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
