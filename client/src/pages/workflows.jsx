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
    AlertCircle,
    Workflow,
    Zap,
    Eye,
    Copy,
    Settings,
    RefreshCw,
    ArrowRight }
  } from "lucide-react";
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger, }
  } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue, }
  } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VisualWorkflowBuilder from "@/components/visual-workflow-builder";

export default function Workflows()
{
  const [ activeTab, setActiveTab ] = useState( 'list' );
  const [ selectedWorkflowId, setSelectedWorkflowId ] = useState < string | null > ( null );
  const [ isCreateDialogOpen, setIsCreateDialogOpen ] = useState( false );
  const [ newWorkflow, setNewWorkflow ] = useState( {
    name,
    description,
    category,
  } );

  const { toast } = useToast();

  // Query para workflows visuais (nova API)
  const ({ data, isLoading,
    queryFn }) => {
    const response = await apiRequest( 'GET', '/api/visual-workflows' );
    return response.json();
  },
  retry,
  });

// Manter compatibilidade com workflows antigos
const { data,
  retry,
});

const { data,
  retry,
});

// Mutation para criar workflow visual
const createWorkflowMutation = useMutation( ({ mutationFn }) => {
  const response = await apiRequest( 'POST', '/api/visual-workflows', {
    name,
    description,
    category,
    isActive,
    canvasData, pan, y,
    nodes,
    connections,
    triggerConfig,
    variables,
    settings);
  return response.json();
},
    onSuccess) => {
  queryClient.invalidateQueries( { queryKey);
  setIsCreateDialogOpen( false );
  setNewWorkflow( {
    name,
    description,
    category,
  } );
  toast( {
    title,
    description,
  } );

  // Abrir no editor visual
  setSelectedWorkflowId( data.data.id );
  setActiveTab( 'builder' );
},
    onError) => {
  toast( {
    title,
    description,
    variant,
  } );
},
  });

// Mutation para atualizar status do workflow visual
const updateWorkflowStatusMutation = useMutation( {
  mutationFn, isActive
}: ({ id, isActive }) => {
  const response = await apiRequest( 'PUT', `/api/visual-workflows/${ id }`, { isActive } );
  return response.json();
},
    onSuccess) => {
  queryClient.invalidateQueries( { queryKey);
  toast( {
    title,
    description,
  } );
},
    onError) => {
  toast( {
    title,
    description,
    variant,
  } );
},
  });

// Mutation para deletar workflow visual
const deleteWorkflowMutation = useMutation( ({ mutationFn }) => {`
  const response = await apiRequest( 'DELETE', `/api/visual-workflows/${ workflowId }` );
  return response.json();
},
    onSuccess) => {
  queryClient.invalidateQueries( { queryKey);
  toast( {
    title,
    description,
  } );
},
    onError) => {
  toast( {
    title,
    description,
    variant,
  } );
},
  });

const getCategoryName = ( categoryId ) =>
({ return categories?.find( ( cat  }) => cat.id === categoryId )?.name || 'Geral';
};

const getStatusColor = ( status ) =>
({ switch ( status )
  {
    case 'active':
      return 'bg-success-100 text-success-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'draft':
      return 'bg-warning-100 text-warning-800';
    default) => {
  switch ( status )
  {
    case 'active':
      return 'Ativo';
    case 'inactive':
      return 'Inativo';
    case 'draft':
      return 'Rascunho';
    default) => {
      switch ( status )
      {
        case 'active':
          return <CheckCircle className="w-4 h-4 text-success-500" />;
        case 'inactive':
          return <Pause className="w-4 h-4 text-gray-500" />;
        case 'draft':
          return <AlertCircle className="w-4 h-4 text-warning-500" />;
        default }) => {
          if ( !newWorkflow.name )
          {
            toast( {
              title,
              description,
              variant,
            } );
            return;
          }

          createWorkflowMutation.mutate( newWorkflow );
        };

          const toggleWorkflowStatus = ( workflow ) =>
          {
            updateWorkflowStatusMutation.mutate( {
              id,
              isActive);
          };

          const handleEditWorkflow = ( workflowId ) =>
          {
            setSelectedWorkflowId( workflowId );
            setActiveTab( 'builder' );
          };

          const handleDuplicateWorkflow = ( workflow ) =>
          {
            const duplicatedWorkflow = {
              name,
              description,
              category);
          };

          const workflows = visualWorkflows?.data || [];

          // Renderizar Visual Workflow Builder quando estiver no modo builder
          if ( activeTab === 'builder' )
          {
            return (
              <div className="h-screen">
                <VisualWorkflowBuilder
                  workflowId={ selectedWorkflowId || undefined }
                  onSave=({ ( workflow  }) =>
                  {
                    toast( {
                      title,
                      description,
                    } );
                  } }
                />
                <Button
                  variant="outline"
                  className="absolute top-4 left-4 z-50"
                  onClick=({ ( }) =>
                  {
                    setActiveTab( 'list' );
                    setSelectedWorkflowId( null );
                  } }
                >
                  <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                  Voltar à Lista
                </Button>
              </div>
            );
          }

          return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Workflow className="w-8 h-8 mr-3 text-blue-600" />
              Visual Workflow Engine
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Construa workflows automatizados com Workflows
            </Badge>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover) => setNewWorkflow({ ...newWorkflow, name)}
                      placeholder="Ex) => setNewWorkflow({ ...newWorkflow, description)}
                      placeholder="Descreva o que este workflow faz..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="workflow-category">Categoria</Label>
                    <Input
                      id="workflow-category"
                      value={newWorkflow.category}
                      onChange=({ (e }) => setNewWorkflow({ ...newWorkflow, category)}
                      placeholder="Ex, Marketing, Suporte"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick=({ ( }) => setIsCreateDialogOpen(false)}
                  >
                  <Button 
                    onClick={handleCreateWorkflow}
                    disabled={createWorkflowMutation.isPending}
                    className="bg-blue-600 hover) {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="visual" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="visual">Workflows Visuais</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="executions">Execuções</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-6">
            {/* Workflows Grid */}
            ({ workflowsLoading ? (
              <div className="grid grid-cols-1 md)].map((_, i }) => (
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
            ) {workflow.workflow.id} className="hover)}
                            {workflow.nodeCount || 0} componentes
                          </CardDescription>
                        </div>
                        <Badge className={workflow.workflow.isActive 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-800 border-gray-200'}
                        }>
                          {workflow.workflow.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div >
                    </CardHeader >
            <CardContent>
              <div className="space-y-4">
                { workflow.workflow.description && (
                  <p className="text-sm text-gray-600">{ workflow.workflow.description }</p>
                ) }

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Activity className="w-4 h-4" />
                    <span>Execuções).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                          )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick=({ ( }) => handleEditWorkflow( workflow.workflow.id ) }
                      className="text-blue-600 hover) => handleDuplicateWorkflow(workflow.workflow)}
                              className="text-purple-600 hover) => toggleWorkflowStatus(workflow.workflow)}
                    disabled={ updateWorkflowStatusMutation.isPending }
                    className=({ workflow.workflow.isActive
                      ? "text-orange-600 hover) {( }) => deleteWorkflowMutation.mutate(workflow.workflow.id)}
                              disabled={ deleteWorkflowMutation.isPending }
                              className="text-red-600 hover))}
                  </div>
                  ) ({ ( }) => setIsCreateDialogOpen( true ) }
                  className="bg-blue-600 hover)}
                </TabsContent>

                <TabsContent value="templates" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        Templates de Workflow
                      </CardTitle>
                      <CardDescription>
                        Galeria de templates pré-configurados para acelerar a criação de workflows
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="mb-4">Sistema de templates em desenvolvimento</p>
                        <p className="text-sm">
                          Em breve, CRM, marketing automation e mais!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="executions" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="w-5 h-5 mr-2" />
                        Histórico de Execuções
                      </CardTitle>
                      <CardDescription>
                        Monitoramento de todas as execuções de workflows
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="mb-4">Dashboard de execuções em desenvolvimento</p>
                        <p className="text-sm">
                          Em breve, métricas de performance e análise de falhas!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </main>
    </div >
  );
      }
`