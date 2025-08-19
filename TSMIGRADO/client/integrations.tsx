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

interface IntegrationConfig {
  api?: {
    endpoint: string;
    authentication: 'none' | 'basic' | 'bearer' | 'api_key';
    username?: string;
    password?: string;
    token?: string;
    apiKey?: string;
    headers?: Record<string, string>;
    timeout?: number;
  };
  database?: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
    connectionPool?: number;
  };
  webhook?: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    authentication?: string;
    retryAttempts?: number;
  };
  email?: {
    provider: 'smtp' | 'sendgrid' | 'mailgun' | 'aws_ses';
    smtpHost?: string;
    smtpPort?: number;
    smtpSecure?: boolean;
    username?: string;
    password?: string;
    apiKey?: string;
    fromEmail: string;
    fromName?: string;
  };
}

export default function Integrations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<any>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [newIntegration, setNewIntegration] = useState({
    name: "",
    type: "email" as "api" | "database" | "webhook" | "email",
    config: {} as IntegrationConfig,
    isActive: true
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
      resetForm();
      toast({
        title: "Integração criada",
        description: "Integração foi configurada com sucesso.",
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

  const updateIntegrationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      await apiRequest('PUT', `/api/integrations/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setEditingIntegration(null);
      resetForm();
      toast({
        title: "Integração atualizada",
        description: "Integração foi atualizada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar integração.",
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

  const testIntegrationMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      return await apiRequest('POST', `/api/integrations/${integrationId}/test`);
    },
    onSuccess: () => {
      toast({
        title: "Teste realizado",
        description: "Integração testada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro no teste",
        description: "Falha ao testar integração.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNewIntegration({
      name: "",
      type: "email",
      config: {},
      isActive: true
    });
  };

  const handleEdit = (integration: any) => {
    setNewIntegration({
      name: integration.name || "",
      type: integration.type || "email",
      config: integration.config || {},
      isActive: integration.isActive !== false
    });
    setEditingIntegration(integration);
  };

  const handleSubmit = () => {
    if (!newIntegration.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da integração é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    const integrationData = {
      ...newIntegration,
      config: { [newIntegration.type]: newIntegration.config[newIntegration.type] }
    };

    if (editingIntegration) {
      updateIntegrationMutation.mutate({ id: editingIntegration.id, data: integrationData });
    } else {
      createIntegrationMutation.mutate(integrationData);
    }
  };

  const updateConfig = (field: string, value: any) => {
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

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const filteredIntegrations = (integrations || []).filter((integration: any) =>
    integration.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    integration.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
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

  const getTypeLabel = (type: string) => {
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
        return type;
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusLabel = (status: string) => {
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
    const currentConfig = (newIntegration.config as any)[newIntegration.type] || {};

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
                placeholder="https://api.exemplo.com/v1"
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
                  placeholder="localhost"
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
                  placeholder="postgres"
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
                    placeholder="Senha do banco"
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ssl"
                checked={currentConfig.ssl || false}
                onCheckedChange={(checked) => updateConfig('ssl', checked)}
              />
              <Label htmlFor="ssl">Usar SSL</Label>
            </div>

            <div>
              <Label htmlFor="connectionPool">Pool de Conexões</Label>
              <Input
                id="connectionPool"
                type="number"
                value={currentConfig.connectionPool || 10}
                onChange={(e) => updateConfig('connectionPool', parseInt(e.target.value))}
                placeholder="10"
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
                placeholder="https://exemplo.com/webhook"
              />
            </div>

            <div>
              <Label htmlFor="method">Método HTTP</Label>
              <Select 
                value={currentConfig.method || 'POST'} 
                onValueChange={(value) => updateConfig('method', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="headers">Headers (JSON)</Label>
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
                placeholder='{"Authorization": "Bearer token"}'
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="authentication">Token de Autenticação</Label>
              <div className="relative">
                <Input
                  id="authentication"
                  type={showPasswords.authentication ? "text" : "password"}
                  value={currentConfig.authentication || ''}
                  onChange={(e) => updateConfig('authentication', e.target.value)}
                  placeholder="Token (opcional)"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => togglePasswordVisibility('authentication')}
                >
                  {showPasswords.authentication ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="retryAttempts">Tentativas de Retry</Label>
              <Input
                id="retryAttempts"
                type="number"
                value={currentConfig.retryAttempts || 3}
                onChange={(e) => updateConfig('retryAttempts', parseInt(e.target.value))}
                placeholder="3"
              />
            </div>
          </div>
        );

      default:
        return <div>Selecione um tipo de integração</div>;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Integrações</h1>
            <p className="text-sm text-gray-600 mt-1">
              Configure contas de email, APIs e outras integrações externas
            </p>
          </div>
          <Dialog open={isCreateDialogOpen || !!editingIntegration} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              setEditingIntegration(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Integração
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingIntegration ? 'Editar' : 'Criar'} Integração</DialogTitle>
                <DialogDescription>
                  Configure uma nova integração para conectar com sistemas externos.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome da Integração</Label>
                    <Input
                      id="name"
                      value={newIntegration.name}
                      onChange={(e) => setNewIntegration(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Email Principal da Empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo de Integração</Label>
                    <Select 
                      value={newIntegration.type} 
                      onValueChange={(value: any) => setNewIntegration(prev => ({ ...prev, type: value, config: {} }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email / SMTP</SelectItem>
                        <SelectItem value="api">API REST</SelectItem>
                        <SelectItem value="database">Banco de Dados</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Configuration Form */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Configuração</h3>
                  {renderConfigForm()}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={newIntegration.isActive}
                    onCheckedChange={(checked) => setNewIntegration(prev => ({ ...prev, isActive: !!checked }))}
                  />
                  <Label htmlFor="isActive">Integração ativa</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSubmit} disabled={createIntegrationMutation.isPending || updateIntegrationMutation.isPending}>
                    {editingIntegration ? 'Atualizar' : 'Criar'} Integração
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingIntegration(null);
                    resetForm();
                  }}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Search */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar integrações..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Integrations List */}
      <main className="flex-1 overflow-y-auto p-6">
        {integrationsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredIntegrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration: any) => (
              <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(integration.type)}
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{getTypeLabel(integration.type)}</Badge>
                          {!integration.isActive && (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => testIntegrationMutation.mutate(integration.id)}
                        disabled={testIntegrationMutation.isPending}
                      >
                        <TestTube className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(integration)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteIntegrationMutation.mutate(integration.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      <Badge className={getStatusColor(integration.lastStatus || 'unknown')}>
                        {getStatusLabel(integration.lastStatus || 'unknown')}
                      </Badge>
                    </div>
                    
                    {integration.lastChecked && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Último teste:</span>
                        <span className="text-sm font-medium">
                          {new Date(integration.lastChecked).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                    
                    {integration.config && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-400">
                          {integration.type === 'email' && integration.config.email?.fromEmail && 
                            `De: ${integration.config.email.fromEmail}`}
                          {integration.type === 'api' && integration.config.api?.endpoint && 
                            `Endpoint: ${integration.config.api.endpoint}`}
                          {integration.type === 'database' && integration.config.database?.host && 
                            `Host: ${integration.config.database.host}`}
                          {integration.type === 'webhook' && integration.config.webhook?.url && 
                            `URL: ${integration.config.webhook.url}`}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma integração encontrada</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Nenhuma integração corresponde aos critérios de busca.' : 'Configure sua primeira integração para conectar com sistemas externos.'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Integração
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}