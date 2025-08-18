import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import
{
  Plus, Users, CheckSquare, Clock, AlertTriangle, Play, Pause,
  Settings, Calendar, MessageCircle, BarChart3, Target,
  Timer, Activity, UserCheck, Zap, Filter, Search, Edit, Trash2,
  Eye, Flag, Square, Kanban, List, TrendingUp, RefreshCw, Download
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Task Management Constants
const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
  CANCELLED: 'cancelled'
};

const TASK_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

const KANBAN_COLUMNS = [
  { id: 'todo', title: 'A Fazer', status: TASK_STATUS.TODO },
  { id: 'in_progress', title: 'Em Progresso', status: TASK_STATUS.IN_PROGRESS },
  { id: 'review', title: 'Em Revisão', status: TASK_STATUS.REVIEW },
  { id: 'done', title: 'Concluído', status: TASK_STATUS.DONE }
];

function TaskManagement()
{
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [ activeView, setActiveView ] = useState( 'kanban' );
  const [ selectedTask, setSelectedTask ] = useState( null );
  const [ showTaskModal, setShowTaskModal ] = useState( false );
  const [ searchTerm, setSearchTerm ] = useState( '' );
  const [ filterStatus, setFilterStatus ] = useState( 'all' );
  const [ filterPriority, setFilterPriority ] = useState( 'all' );

  // Query para tarefas
  const { data: tasksData, isLoading } = useQuery( {
    queryKey: [ 'tasks', searchTerm, filterStatus, filterPriority ],
    queryFn: async () =>
    {
      const params = new URLSearchParams( {
        ...( searchTerm && { search: searchTerm } ),
        ...( filterStatus !== 'all' && { status: filterStatus } ),
        ...( filterPriority !== 'all' && { priority: filterPriority } ),
        limit: 100
      } );

      const response = await fetch( `/api/tasks?${ params }`, {
        headers: {
          'Authorization': `Bearer ${ localStorage.getItem( 'accessToken' ) }`
        }
      } );

      if ( !response.ok )
      {
        throw new Error( 'Erro ao carregar tarefas' );
      }

      return response.json();
    },
    enabled: !!user
  } );

  // Mutation para atualizar status (drag and drop)
  const updateTaskStatusMutation = useMutation( {
    mutationFn: async ( { taskId, status } ) =>
    {
      const response = await fetch( `/api/tasks/${ taskId }/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ localStorage.getItem( 'accessToken' ) }`
        },
        body: JSON.stringify( { status } )
      } );

      if ( !response.ok )
      {
        const error = await response.json();
        throw new Error( error.error || 'Erro ao atualizar status' );
      }

      return response.json();
    },
    onSuccess: () =>
    {
      queryClient.invalidateQueries( [ 'tasks' ] );
    },
    onError: ( error ) =>
    {
      toast( {
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive'
      } );
    }
  } );

  const tasks = tasksData?.data?.tasks || [];

  // Filtrar tarefas
  const filteredTasks = tasks.filter( task =>
  {
    const matchesSearch = task.title.toLowerCase().includes( searchTerm.toLowerCase() );
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  } );

  // Drag and drop handler
  const handleDragEnd = ( result ) =>
  {
    if ( !result.destination ) return;

    const { draggableId, destination } = result;
    const taskId = draggableId;
    const newStatus = destination.droppableId;

    updateTaskStatusMutation.mutate( { taskId, status: newStatus } );
  };

  const form = useForm < TaskTemplateForm > ( {
    resolver),
    defaultValues,
    description,
    category,
    priority,
    instructions,
    assignedTo,
    tags);

  const createTemplateMutation = useMutation( {
    mutationFn) => {
    const response = await apiRequest( '/api/tasks/templates', {
      method,
      body)
  });
  return response;
},
    onSuccess) => {
  toast( {
    title,
    description);
  setOpen( false );
  form.reset();
}
  });

const onSubmit = ( data ) =>
{
  createTemplateMutation.mutate( data );
};

return (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
        <p className="text-muted-foreground">
          Sistema completo de gerenciamento de tarefas
        </p>
      </div>
      <Button onClick={ () => setOpen( true ) }>
        <Plus className="h-4 w-4 mr-2" />
        Criar Template
      </Button>
    </div>

    { templates.length === 0 && (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
          <p className="text-muted-foreground text-center mb-4">
            Comece criando seu primeiro template de tarefa para organizar o trabalho da sua equipe.
          </p>
          <Button onClick={ () => setOpen( true ) }>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Template
          </Button>
        </CardContent>
      </Card>
    ) }

    <Dialog open={ open } onOpenChange={ setOpen }>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Template de Tarefa</DialogTitle>
          <DialogDescription>
            Defina um template reutilizável para organizar o trabalho da sua equipe.
          </DialogDescription>
        </DialogHeader>
        <Form { ...form }>
          <form onSubmit={ form.handleSubmit( onSubmit ) } className="space-y-4">
            <FormField
              control={ form.control }
              name="title"
              render={ ( { field } ) => (
                <FormItem>
                  <FormLabel>Título do Template</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex, Análise de Bug..." { ...field } />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              ) }
            />

            <FormField
              control={ form.control }
              name="description"
              render={ ( { field } ) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o propósito e escopo deste template..."
                      className="resize-none"
                      { ...field }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              ) }
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={ form.control }
                name="priority"
                render={ ( { field } ) => (
                  <FormItem>
                    <FormLabel>Prioridade Padrão</FormLabel>
                    <Select onValueChange={ field.onChange } defaultValue={ field.value }>
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
                ) }
              />

              <FormField
                control={ form.control }
                name="estimatedDuration"
                render={ ( { field } ) => (
                  <FormItem>
                    <FormLabel>Tempo Estimado (horas)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.5" { ...field } />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ) }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" type="button" onClick={ () => setOpen( false ) }>
                Cancelar
              </Button>
              <Button type="submit" disabled={ createTemplateMutation.isPending }>
                { createTemplateMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Template
                  </>
                ) }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  </div>
);
}

export default TaskManagement;