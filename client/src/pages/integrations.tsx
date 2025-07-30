import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Database, 
  Mail, 
  Webhook,
  BarChart3,
  Settings,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Integrations() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: "",
    type: "",
    config: {}
  });

  const { toast } = useToast();

  const { data: integrations, isLoading: integrationsLoading } = useQuery({
    queryKey: ['/api/integrations'],
    retry: false,
  });

  const createIntegrationMutation = useMutation({
    mutationFn: async (integrationData: any) => {
      await apiRequest('POST', '/api/integrations', integrationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setIsCreateDialogOpen(false);
      setNewIntegration({
        name: "",
        type: "",
        config: {}
      });
      toast({
        title: "Integração criada",
        description: "Integração foi criada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar integração.",
        variant: "destructive",
      });
    },
  });

  const deleteIntegrationMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      await apiRequest('DELETE', `/api/integrations/${integrationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      toast({
        title: "Integração excluída",
        description: "Integração foi excluída com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao excluir integração.",
        variant: "destructive",
      });
    },
  });

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'database':
        return Database;
      case 'email':
        return Mail;
      case 'webhook':
        return Webhook;
      case 'api':
        return BarChart3;
      default:
        return Settings;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case 'offline':
        return <XCircle className="w-4 h-4 text-error-500" />;
      case 'lento':
        return <AlertCircle className="w-4 h-4 text-warning-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'online':
        return 'bg-success-100 text-success-800';
      case 'offline':
        return 'bg-error-100 text-error-800';
      case 'lento':
        return 'bg-warning-100 text-warning-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'lento':
        return 'Lento';
      default:
        return 'Desconhecido';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'database':
        return 'Banco de Dados';
      case 'email':
        return 'Email API';
      case 'webhook':
        return 'Webhook';
      case 'api':
        return 'API REST';
      default:
        return 'Personalizado';
    }
  };

  const handleCreateIntegration = () => {
    if (!newIntegration.name || !newIntegration.type) {
      toast({
        title: "Erro",
        description: "Nome e tipo da integração são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    createIntegrationMutation.mutate(newIntegration);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Integrações Externas</h1>
            <p className="text-sm text-gray-600 mt-1">
              Gerencie conexões com APIs, bancos de dados e webhooks externos
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary-500 hover:bg-primary-600">
                <Plus className="w-4 h-4 mr-2" />
                Nova Integração
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Integração</DialogTitle>
                <DialogDescription>
                  Configure uma nova integração externa para sincronizar dados.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="integration-name">Nome da Integração *</Label>
                  <Input
                    id="integration-name"
                    value={newIntegration.name}
                    onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                    placeholder="Ex: Banco XYZ API"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="integration-type">Tipo *</Label>
                  <Select 
                    value={newIntegration.type} 
                    onValueChange={(value) => setNewIntegration({ ...newIntegration, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api">API REST</SelectItem>
                      <SelectItem value="database">Banco de Dados</SelectItem>
                      <SelectItem value="email">Email API</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
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
                  onClick={handleCreateIntegration}
                  disabled={createIntegrationMutation.isPending}
                >
                  {createIntegrationMutation.isPending ? "Criando..." : "Criar Integração"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Integration Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Integrações</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-2">
                    {integrations?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-primary-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Online</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-2">
                    {integrations?.filter((i: any) => i.lastStatus === 'online').length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-success-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-success-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Com Problemas</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-2">
                    {integrations?.filter((i: any) => i.lastStatus === 'offline' || i.lastStatus === 'lento').length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-warning-50 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-warning-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-2">
                    {integrations?.length ? 
                      Math.round((integrations.filter((i: any) => i.lastStatus === 'online').length / integrations.length) * 100) 
                      : 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integrations Grid */}
        {integrationsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div>
                        <Skeleton className="h-5 w-24 mb-1" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : integrations && integrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration: any) => {
              const IconComponent = getIntegrationIcon(integration.type);
              return (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <p className="text-sm text-gray-500">{getTypeLabel(integration.type)}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(integration.lastStatus || 'unknown')}>
                        {getStatusLabel(integration.lastStatus || 'unknown')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(integration.lastStatus || 'unknown')}
                        <span className="text-sm text-gray-600">
                          Status: {getStatusLabel(integration.lastStatus || 'unknown')}
                        </span>
                      </div>
                      
                      {integration.lastChecked && (
                        <div className="text-sm text-gray-500">
                          Última verificação: {new Date(integration.lastChecked).toLocaleString('pt-BR')}
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-4 border-t">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Configurar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteIntegrationMutation.mutate(integration.id)}
                          disabled={deleteIntegrationMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma integração configurada
            </h3>
            <p className="text-gray-500 mb-6">
              Comece adicionando integrações para conectar sistemas externos.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Integração
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
