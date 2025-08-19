import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle, Clock, AlertCircle, MessageSquare, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MyTasks() {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/tasks/my-tasks"],
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/tasks/notifications"],
  });

  // Start task mutation
  const startTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return await apiRequest(`/api/tasks/instances/${taskId}/start`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/my-tasks"] });
      toast({
        title: "Tarefa iniciada!",
        description: "Você pode agora trabalhar nesta tarefa.",
      });
    },
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId, notes }: { taskId: string; notes: string }) => {
      return await apiRequest(`/api/tasks/instances/${taskId}/complete`, {
        method: "POST",
        body: JSON.stringify({
          completionData: { completed: true },
          notes,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/my-tasks"] });
      toast({
        title: "Tarefa completada!",
        description: "Sua tarefa foi marcada como concluída.",
      });
      setSelectedTask(null);
      setCompletionNotes("");
    },
  });

  // Mark notification as read
  const markNotificationRead = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiRequest(`/api/tasks/notifications/${notificationId}/read`, {
        method: "PUT",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/notifications"] });
    },
  });

  const handleStartTask = (taskId: string) => {
    startTaskMutation.mutate(taskId);
  };

  const handleCompleteTask = () => {
    if (selectedTask) {
      completeTaskMutation.mutate({
        taskId: selectedTask.id,
        notes: completionNotes,
      });
    }
  };

  const handleNotificationClick = (notification: any) => {
    markNotificationRead.mutate(notification.id);
    if (notification.actionUrl) {
      // In a real app, would navigate to the task
      const taskId = notification.data?.taskInstanceId;
      const task = tasks.find((t: any) => t.id === taskId);
      if (task) {
        setSelectedTask(task);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadNotifications = notifications.filter((n: any) => !n.isRead);

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
          <h1 className="text-3xl font-bold tracking-tight">Minhas Tarefas</h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas e acompanhe seu progresso
          </p>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
            {unreadNotifications.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadNotifications.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {unreadNotifications.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações ({unreadNotifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unreadNotifications.slice(0, 3).map((notification: any) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task: any) => (
          <Card key={task.id} className={`relative ${task.status === 'overdue' ? 'border-red-200' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <Badge variant={getPriorityColor(task.priority)}>
                  {task.priority === 'urgent' ? 'Urgente' :
                   task.priority === 'high' ? 'Alta' :
                   task.priority === 'medium' ? 'Média' : 'Baixa'}
                </Badge>
              </div>
              <CardDescription>
                {task.description || "Sem descrição"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status === 'pending' ? 'Pendente' :
                   task.status === 'in_progress' ? 'Em Progresso' :
                   task.status === 'completed' ? 'Concluída' :
                   task.status === 'overdue' ? 'Atrasada' : task.status}
                </div>

                {task.dueDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Vence em {formatDistanceToNow(new Date(task.dueDate), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  {task.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleStartTask(task.id)}
                      disabled={startTaskMutation.isPending}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar
                    </Button>
                  )}
                  
                  {task.status === 'in_progress' && (
                    <Button 
                      size="sm" 
                      onClick={() => setSelectedTask(task)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Concluir
                    </Button>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedTask(task)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-muted-foreground text-center">
              Suas tarefas aparecerão aqui quando forem atribuídas pelo seu gerente.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Task Details/Completion Dialog */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedTask.title}</DialogTitle>
              <DialogDescription>
                {selectedTask.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Status</Label>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status === 'pending' ? 'Pendente' :
                     selectedTask.status === 'in_progress' ? 'Em Progresso' :
                     selectedTask.status === 'completed' ? 'Concluída' :
                     selectedTask.status === 'overdue' ? 'Atrasada' : selectedTask.status}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Prioridade</Label>
                  <Badge variant={getPriorityColor(selectedTask.priority)} className="mt-1">
                    {selectedTask.priority === 'urgent' ? 'Urgente' :
                     selectedTask.priority === 'high' ? 'Alta' :
                     selectedTask.priority === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                </div>
              </div>

              {selectedTask.status === 'in_progress' && (
                <div className="space-y-3">
                  <Label htmlFor="completion-notes">Observações sobre a conclusão</Label>
                  <Textarea
                    id="completion-notes"
                    placeholder="Descreva o que foi realizado, resultados obtidos, observações importantes..."
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setSelectedTask(null)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCompleteTask}
                      disabled={completeTaskMutation.isPending}
                    >
                      {completeTaskMutation.isPending ? "Concluindo..." : "Marcar como Concluída"}
                    </Button>
                  </div>
                </div>
              )}

              {selectedTask.status !== 'in_progress' && (
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedTask(null)}>
                    Fechar
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}