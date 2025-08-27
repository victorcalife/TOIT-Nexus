import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Database,
  Edit,
  Trash2,
  Globe,
  Mail,
  Webhook,
  TestTube,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Settings
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Integrations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: 'api',
    config: {},
    isActive: true
  });

  const { toast } = useToast();

  const { data: integrations, isLoading, refetch } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => apiRequest('GET', '/api/integrations')
  });

  const createIntegrationMutation = useMutation({
    mutationFn: (integrationData) => {
      return apiRequest('POST', '/api/integrations', integrationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Integração criada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar integração.',
        variant: 'destructive',
      });
    },
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: ({ id, data }) => {
      return apiRequest('PUT', `/api/integrations/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setEditingIntegration(null);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Integração atualizada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar integração.',
        variant: 'destructive',
      });
    },
  });

  const deleteIntegrationMutation = useMutation({
    mutationFn: (integrationId) => {
      return apiRequest('DELETE', `/api/integrations/${integrationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast({
        title: 'Sucesso',
        description: 'Integração removida com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao remover integração.',
        variant: 'destructive',
      });
    },
  });

  const testIntegrationMutation = useMutation({
    mutationFn: (integrationId) => {
      return apiRequest('POST', `/api/integrations/${integrationId}/test`);
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Teste de integração realizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro no teste de integração.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setNewIntegration({
      name: '',
      type: 'api',
      config: {},
      isActive: true
    });
  };

  const handleEdit = (integration) => {
    setNewIntegration({
      name: integration.name,
      type: integration.type,
      config: integration.config,
      isActive: integration.isActive
    });
    setEditingIntegration(integration);
  };

  const handleSubmit = () => {
    if (!newIntegration.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome da integração é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    const integrationData = {
      ...newIntegration,
      config: newIntegration.config
    };

    if (editingIntegration) {
      updateIntegrationMutation.mutate({ id: editingIntegration.id, data: integrationData });
    } else {
      createIntegrationMutation.mutate(integrationData);
    }
  };

  const updateConfig = (field, value) => {
    setNewIntegration(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [prev.type]: {
          ...prev.config[prev.type],
          [field]: value
        }
      }
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const filteredIntegrations = (integrations || []).filter((integration) =>
    integration.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    integration.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type) => {
    switch (type) {
      case 'api':
        return <Globe className="w-5 h-5" />;
      case 'database':
        return <Database className="w-5 h-5" />;
      case 'webhook':
        return <Webhook className="w-5 h-5" />;
      case 'email':
        return <Mail className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'api':
        return 'API REST';
      case 'database':
        return 'Banco de Dados';
      case 'webhook':
        return 'Webhook';
      case 'email':
        return 'Email';
      default:
        return 'Outro';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'warning':
        return 'Atenção';
      case 'error':
        return 'Erro';
      default:
        return 'Desconhecido';
    }
  };

  const renderConfigForm = () => {
    const currentConfig = (newIntegration.config)[newIntegration.type] || {};

    switch (newIntegration.type) {
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider">Provedor de Email</Label>
              <Select
                value={currentConfig.provider || 'smtp'}
                onValueChange={(value) => updateConfig('provider', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o provedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smtp">SMTP</SelectItem>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                  <SelectItem value="mailgun">Mailgun</SelectItem>
                  <SelectItem value="aws_ses">Amazon SES</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {currentConfig.provider === 'smtp' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpHost">Servidor SMTP</Label>
                    <Input
                      id="smtpHost"
                      value={currentConfig.smtpHost || ''}
                      onChange={(e) => updateConfig('smtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">Porta</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={currentConfig.smtpPort || '587'}
                      onChange={(e) => updateConfig('smtpPort', parseInt(e.target.value))}
                      placeholder="587"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smtpSecure"
                    checked={currentConfig.smtpSecure || false}
                    onCheckedChange={(checked) => updateConfig('smtpSecure', checked)}
                  />
                  <Label htmlFor="smtpSecure">Usar SSL/TLS</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Usuário</Label>
                    <Input
                      id="username"
                      type="email"
                      value={currentConfig.username || ''}
                      onChange={(e) => updateConfig('username', e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPasswords.password ? "text" : "password"}
                        value={currentConfig.password || ''}
                        onChange={(e) => updateConfig('password', e.target.value)}
                        placeholder="Sua senha ou app password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => togglePasswordVisibility('password')}
                      >
                        {showPasswords.password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {(currentConfig.provider === 'sendgrid' || currentConfig.provider === 'mailgun') && (
              <div>
                <Label htmlFor="apiKey">Chave da API</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showPasswords.apiKey ? "text" : "password"}
                    value={currentConfig.apiKey || ''}
                    onChange={(e) => updateConfig('apiKey', e.target.value)}
                    placeholder={`Chave da API do ${currentConfig.provider === 'sendgrid' ? 'SendGrid' : 'Mailgun'}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => togglePasswordVisibility('apiKey')}
                  >
                    {showPasswords.apiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fromEmail">Email do Remetente</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={currentConfig.fromEmail || ''}
                  onChange={(e) => updateConfig('fromEmail', e.target.value)}
                  placeholder="no-reply@suaempresa.com"
                />
              </div>
              <div>
                <Label htmlFor="fromName">Nome do Remetente</Label>
                <Input
                  id="fromName"
                  value={currentConfig.fromName || ''}
                  onChange={(e) => updateConfig('fromName', e.target.value)}
                  placeholder="Sua Empresa"
                />
              </div>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="endpoint">URL do Endpoint</Label>
              <Input
                id="endpoint"
                value={currentConfig.endpoint || ''}
                onChange={(e) => updateConfig('endpoint', e.target.value)}
                placeholder="https://api.exemplo.com"
              />
            </div>

            <div>
              <Label htmlFor="authentication">Tipo de Autenticação</Label>
              <Select
                value={currentConfig.authentication || 'none'}
                onValueChange={(value) => updateConfig('authentication', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="api_key">API Key</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {currentConfig.authentication === 'basic' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Usuário</Label>
                  <Input
                    id="username"
                    value={currentConfig.username || ''}
                    onChange={(e) => updateConfig('username', e.target.value)}
                    placeholder="Usuário"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPasswords.password ? "text" : "password"}
                      value={currentConfig.password || ''}
                      onChange={(e) => updateConfig('password', e.target.value)}
                      placeholder="Senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => togglePasswordVisibility('password')}
                    >
                      {showPasswords.password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {currentConfig.authentication === 'bearer' && (
              <div>
                <Label htmlFor="token">Token</Label>
                <div className="relative">
                  <Input
                    id="token"
                    type={showPasswords.token ? "text" : "password"}
                    value={currentConfig.token || ''}
                    onChange={(e) => updateConfig('token', e.target.value)}
                    placeholder="Bearer token"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => togglePasswordVisibility('token')}
                  >
                    {showPasswords.token ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}

            {currentConfig.authentication === 'api_key' && (
              <div>
                <Label htmlFor="apiKey">Chave da API</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showPasswords.apiKey ? "text" : "password"}
                    value={currentConfig.apiKey || ''}
                    onChange={(e) => updateConfig('apiKey', e.target.value)}
                    placeholder="Chave da API"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => togglePasswordVisibility('apiKey')}
                  >
                    {showPasswords.apiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="headers">Headers Customizados (JSON)</Label>
              <Textarea
                id="headers"
                value={JSON.stringify(currentConfig.headers || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    updateConfig('headers', parsed);
                  } catch {
                    // Ignore invalid JSON during typing
                  }
                }}
                placeholder='{"Content-Type": "application/json"}'
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="timeout">Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={currentConfig.timeout || 5000}
                onChange={(e) => updateConfig('timeout', parseInt(e.target.value))}
                placeholder="5000"
              />
            </div>
          </div>
        );

      case 'database':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="host">Host</Label>
                <Input
                  id="host"
                  value={currentConfig.host || ''}
                  onChange={(e) => updateConfig('host', e.target.value)}
                  placeholder="api.toit.com.br"
                />
              </div>
              <div>
                <Label htmlFor="port">Porta</Label>
                <Input
                  id="port"
                  type="number"
                  value={currentConfig.port || 5432}
                  onChange={(e) => updateConfig('port', parseInt(e.target.value))}
                  placeholder="5432"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="database">Nome do Banco</Label>
              <Input
                id="database"
                value={currentConfig.database || ''}
                onChange={(e) => updateConfig('database', e.target.value)}
                placeholder="nome_do_banco"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  value={currentConfig.username || ''}
                  onChange={(e) => updateConfig('username', e.target.value)}
                  placeholder="usuario"
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPasswords.password ? "text" : "password"}
                    value={currentConfig.password || ''}
                    onChange={(e) => updateConfig('password', e.target.value)}
                    placeholder="senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => togglePasswordVisibility('password')}
                  >
                    {showPasswords.password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="ssl">SSL</Label>
              <Checkbox
                id="ssl"
                checked={currentConfig.ssl || false}
                onCheckedChange={(checked) => updateConfig('ssl', checked)}
              />
            </div>
          </div>
        );

      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">URL do Webhook</Label>
              <Input
                id="url"
                value={currentConfig.url || ''}
                onChange={(e) => updateConfig('url', e.target.value)}
                placeholder="https://webhook.exemplo.com"
              />
            </div>

            <div>
              <Label htmlFor="secret">Secret (opcional)</Label>
              <div className="relative">
                <Input
                  id="secret"
                  type={showPasswords.secret ? "text" : "password"}
                  value={currentConfig.secret || ''}
                  onChange={(e) => updateConfig('secret', e.target.value)}
                  placeholder="Secret para validação"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => togglePasswordVisibility('secret')}
                >
                  {showPasswords.secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="events">Eventos (separados por vírgula)</Label>
              <Input
                id="events"
                value={currentConfig.events || ''}
                onChange={(e) => updateConfig('events', e.target.value)}
                placeholder="user.created, order.updated"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500">
            Selecione um tipo de integração para configurar
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Integrações</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Integração
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingIntegration ? 'Editar Integração' : 'Nova Integração'}
              </DialogTitle>
              <DialogDescription>
                Configure uma nova integração para conectar sistemas externos.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Integração</Label>
                  <Input
                    id="name"
                    value={newIntegration.name}
                    onChange={(e) => setNewIntegration(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome da integração"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={newIntegration.type}
                    onValueChange={(value) => setNewIntegration(prev => ({ ...prev, type: value, config: {} }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api">API REST</SelectItem>
                      <SelectItem value="database">Banco de Dados</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={newIntegration.isActive}
                  onCheckedChange={(checked) => setNewIntegration(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Ativar integração</Label>
              </div>

              {renderConfigForm()}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingIntegration(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingIntegration ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar integrações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredIntegrations.map((integration) => (
          <Card key={integration.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(integration.type)}
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                </div>
                <Badge className={getStatusColor(integration.status)}>
                  {getStatusLabel(integration.status)}
                </Badge>
              </div>
              <CardDescription>
                {getTypeLabel(integration.type)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleEdit(integration);
                      setIsCreateDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testIntegrationMutation.mutate(integration.id)}
                  >
                    <TestTube className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteIntegrationMutation.mutate(integration.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-1">
                  {integration.status === 'active' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {integration.status === 'error' && (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  {integration.status === 'warning' && (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma integração encontrada
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando sua primeira integração.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Integração
            </Button>
          )}
        </div>
      )}
    </div>
  );
}