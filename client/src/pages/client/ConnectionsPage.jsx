/**
 * Página de Conexões
 * Permite aos usuários gerenciar conexões com bancos de dados e APIs externas
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Database, Plus, Settings, Trash2, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const ConnectionsPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const queryClient = useQueryClient();

  // Dados simulados para conexões
  const mockConnections = [
    {
      id: 1,
      name: 'Banco Principal',
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      database: 'toit_nexus',
      status: 'connected',
      lastTested: '2024-01-15T10:30:00Z',
      description: 'Banco de dados principal do sistema'
    },
    {
      id: 2,
      name: 'API Externa CRM',
      type: 'api',
      url: 'https://api.crm.exemplo.com',
      status: 'connected',
      lastTested: '2024-01-15T09:15:00Z',
      description: 'Integração com sistema CRM externo'
    },
    {
      id: 3,
      name: 'Redis Cache',
      type: 'redis',
      host: 'redis.railway.app',
      port: 6379,
      status: 'disconnected',
      lastTested: '2024-01-14T16:45:00Z',
      description: 'Cache distribuído para sessões'
    },
    {
      id: 4,
      name: 'MongoDB Analytics',
      type: 'mongodb',
      host: 'mongodb.railway.app',
      port: 27017,
      database: 'analytics',
      status: 'connected',
      lastTested: '2024-01-15T08:20:00Z',
      description: 'Banco de dados para analytics e logs'
    }
  ];

  // Query para buscar conexões
  const { data: connections, isLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: async () => {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockConnections;
    }
  });

  // Mutation para testar conexão
  const testConnectionMutation = useMutation({
    mutationFn: async (connectionId) => {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: Math.random() > 0.3, connectionId };
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Conexão testada com sucesso!');
      } else {
        toast.error('Falha ao conectar');
      }
      queryClient.invalidateQueries(['connections']);
    },
    onError: () => {
      toast.error('Erro ao testar conexão');
    }
  });

  // Mutation para deletar conexão
  const deleteConnectionMutation = useMutation({
    mutationFn: async (connectionId) => {
      // Simular delete
      await new Promise(resolve => setTimeout(resolve, 1000));
      return connectionId;
    },
    onSuccess: () => {
      toast.success('Conexão removida com sucesso!');
      queryClient.invalidateQueries(['connections']);
    },
    onError: () => {
      toast.error('Erro ao remover conexão');
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'disconnected': return 'Desconectado';
      case 'testing': return 'Testando';
      default: return 'Desconhecido';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Database className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type) => {
    return <Database className="h-5 w-5" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conexões</h1>
          <p className="text-muted-foreground">
            Gerencie conexões com bancos de dados e APIs externas
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conexão
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nova Conexão</DialogTitle>
              <DialogDescription>
                Configure uma nova conexão com banco de dados ou API externa
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input id="name" className="col-span-3" placeholder="Nome da conexão" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Tipo
                </Label>

                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="mongodb">MongoDB</SelectItem>
                    <SelectItem value="redis">Redis</SelectItem>
                    <SelectItem value="api">API REST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="host" className="text-right">
                  Host
                </Label>
                <Input id="host" className="col-span-3" placeholder="localhost" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="port" className="text-right">
                  Porta
                </Label>
                <Input id="port" className="col-span-3" placeholder="5432" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsCreateDialogOpen(false)}>
                Criar Conexão
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="databases">Bancos de Dados</TabsTrigger>
          <TabsTrigger value="apis">APIs</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connections?.map((connection) => (
              <Card key={connection.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(connection.type)}
                      <CardTitle className="text-lg">{connection.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(connection.status)}
                      <Badge className={getStatusColor(connection.status)}>
                        {getStatusText(connection.status)}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{connection.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="capitalize">{connection.type}</span>
                    </div>
                    {connection.host && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Host:</span>
                        <span>{connection.host}:{connection.port}</span>
                      </div>
                    )}
                    {connection.url && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">URL:</span>
                        <span className="truncate">{connection.url}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Último teste:</span>
                      <span>{formatDate(connection.lastTested)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => testConnectionMutation.mutate(connection.id)}
                      disabled={testConnectionMutation.isPending}
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      Testar
                    </Button>

                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => deleteConnectionMutation.mutate(connection.id)}
                      disabled={deleteConnectionMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="databases" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connections?.filter(conn => ['postgresql', 'mysql', 'mongodb'].includes(conn.type)).map((connection) => (
              <Card key={connection.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(connection.type)}
                      <CardTitle className="text-lg">{connection.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(connection.status)}>
                      {getStatusText(connection.status)}
                    </Badge>
                  </div>
                  <CardDescription>{connection.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="capitalize">{connection.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Host:</span>
                      <span>{connection.host}:{connection.port}</span>
                    </div>
                    {connection.database && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Database:</span>
                        <span>{connection.database}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <TestTube className="h-3 w-3 mr-1" />
                      Testar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="apis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connections?.filter(conn => conn.type === 'api').map((connection) => (
              <Card key={connection.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(connection.type)}
                      <CardTitle className="text-lg">{connection.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(connection.status)}>
                      {getStatusText(connection.status)}
                    </Badge>
                  </div>
                  <CardDescription>{connection.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">URL:</span>
                      <span className="truncate">{connection.url}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <TestTube className="h-3 w-3 mr-1" />
                      Testar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connections?.filter(conn => conn.type === 'redis').map((connection) => (
              <Card key={connection.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(connection.type)}
                      <CardTitle className="text-lg">{connection.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(connection.status)}>
                      {getStatusText(connection.status)}
                    </Badge>
                  </div>
                  <CardDescription>{connection.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Host:</span>
                      <span>{connection.host}:{connection.port}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <TestTube className="h-3 w-3 mr-1" />
                      Testar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConnectionsPage;