import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Database, 
  Webhook, 
  Globe, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  TestTube,
  Plus,
  Settings,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UnifiedHeader } from "@/components/unified-header";

interface DataConnection {
  id: string;
  name: string;
  type: 'database' | 'webhook' | 'api' | 'file';
  config: any;
  isActive: boolean;
  lastStatus?: string;
  createdAt: string;
}

interface DatabaseConfig {
  name: string;
  type: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

interface WebhookConfig {
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  payload?: any;
  authentication?: {
    type: 'none' | 'basic' | 'bearer' | 'api_key';
    credentials?: Record<string, string>;
  };
}

interface ApiConfig {
  name: string;
  baseUrl: string;
  authentication: {
    type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2';
    credentials: Record<string, string>;
  };
  headers?: Record<string, string>;
  rateLimit?: {
    requests: number;
    period: number;
  };
}

export default function DataConnectionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [selectedTab, setSelectedTab] = useState('database');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Database connection form
  const [databaseConfig, setDatabaseConfig] = useState<DatabaseConfig>({
    name: '',
    type: 'postgresql',
    host: '',
    port: 5432,
    database: '',
    username: '',
    password: '',
    ssl: false
  });

  // Webhook configuration form
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    name: '',
    url: '',
    method: 'POST',
    headers: {},
    authentication: { type: 'none' }
  });

  // API configuration form
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    name: '',
    baseUrl: '',
    authentication: { type: 'none', credentials: {} },
    headers: {}
  });

  // Fetch data connections
  const { data: connections = [] } = useQuery<DataConnection[]>({
    queryKey: ['/api/data-connections'],
    retry: false
  });

  // Test database connection
  const testDatabaseMutation = useMutation({
    mutationFn: async (config: DatabaseConfig) => {
      const response = await fetch('/api/data-connections/database/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: data.success ? "Conexão bem-sucedida" : "Falha na conexão",
        description: data.success ? "Banco de dados conectado com sucesso" : data.error,
        variant: data.success ? "default" : "destructive",
      });
    }
  });

  // Create database connection
  const createDatabaseMutation = useMutation({
    mutationFn: async (config: DatabaseConfig) => {
      const response = await fetch('/api/data-connections/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/data-connections'] });
      setDialogOpen(false);
      toast({
        title: "Conexão criada",
        description: "Conexão com banco de dados criada com sucesso",
      });
    }
  });

  // Test webhook
  const testWebhookMutation = useMutation({
    mutationFn: async (config: WebhookConfig) => {
      const response = await fetch('/api/data-connections/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: data.success ? "Webhook testado" : "Falha no webhook",
        description: data.success ? "Webhook respondeu corretamente" : data.error,
        variant: data.success ? "default" : "destructive",
      });
    }
  });

  // Create webhook
  const createWebhookMutation = useMutation({
    mutationFn: async (config: WebhookConfig) => {
      const response = await fetch('/api/data-connections/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/data-connections'] });
      setDialogOpen(false);
      toast({
        title: "Webhook criado",
        description: "Webhook criado com sucesso",
      });
    }
  });

  // Test API connection
  const testApiMutation = useMutation({
    mutationFn: async (config: ApiConfig) => {
      const response = await fetch('/api/data-connections/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: data.success ? "API testada" : "Falha na API",
        description: data.success ? "API respondeu corretamente" : data.error,
        variant: data.success ? "default" : "destructive",
      });
    }
  });

  // Create API connection
  const createApiMutation = useMutation({
    mutationFn: async (config: ApiConfig) => {
      const response = await fetch('/api/data-connections/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/data-connections'] });
      setDialogOpen(false);
      toast({
        title: "Conexão API criada",
        description: "Conexão com API criada com sucesso",
      });
    }
  });

  // Upload file
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/data-connections/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/data-connections'] });
      toast({
        title: "Arquivo carregado",
        description: `${data.totalRows} registros processados`,
      });
    }
  });

  // Delete connection
  const deleteConnectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/data-connections/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/data-connections'] });
      toast({
        title: "Conexão removida",
        description: "Conexão removida com sucesso",
      });
    }
  });

  // Export data to PDF
  const exportToPdf = async (data: any[], title: string, columns: string[]) => {
    try {
      const response = await fetch('/api/data-connections/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, title, columns }),
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}_export.pdf`;
      a.click();
      
      toast({
        title: "Export concluído",
        description: "Dados exportados para PDF com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro no export",
        description: "Falha ao exportar dados para PDF",
        variant: "destructive",
      });
    }
  };

  // Export data to Excel
  const exportToExcel = async (data: any[], title: string) => {
    try {
      const response = await fetch('/api/data-connections/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, title, sheetName: 'Dados' }),
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}_export.xlsx`;
      a.click();
      
      toast({
        title: "Export concluído",
        description: "Dados exportados para Excel com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro no export",
        description: "Falha ao exportar dados para Excel",
        variant: "destructive",
      });
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'database': return <Database className="w-5 h-5" />;
      case 'webhook': return <Webhook className="w-5 h-5" />;
      case 'api': return <Globe className="w-5 h-5" />;
      case 'file': return <FileSpreadsheet className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <UnifiedHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Conexões de Dados
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Conecte com bancos de dados, APIs, webhooks e carregue arquivos
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Connections List */}
          <div className="col-span-12 lg:col-span-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Conexões Ativas</CardTitle>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Conexão
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Criar Nova Conexão</DialogTitle>
                      </DialogHeader>
                      
                      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="database">
                            <Database className="w-4 h-4 mr-2" />
                            Banco
                          </TabsTrigger>
                          <TabsTrigger value="webhook">
                            <Webhook className="w-4 h-4 mr-2" />
                            Webhook
                          </TabsTrigger>
                          <TabsTrigger value="api">
                            <Globe className="w-4 h-4 mr-2" />
                            API
                          </TabsTrigger>
                          <TabsTrigger value="file">
                            <Upload className="w-4 h-4 mr-2" />
                            Arquivo
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="database" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="dbName">Nome da Conexão</Label>
                              <Input
                                id="dbName"
                                value={databaseConfig.name}
                                onChange={(e) => setDatabaseConfig(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="dbType">Tipo</Label>
                              <Select
                                value={databaseConfig.type}
                                onValueChange={(type: any) => setDatabaseConfig(prev => ({ ...prev, type }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                                  <SelectItem value="mysql">MySQL</SelectItem>
                                  <SelectItem value="sqlite">SQLite</SelectItem>
                                  <SelectItem value="mongodb">MongoDB</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="dbHost">Host</Label>
                              <Input
                                id="dbHost"
                                value={databaseConfig.host}
                                onChange={(e) => setDatabaseConfig(prev => ({ ...prev, host: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="dbPort">Porta</Label>
                              <Input
                                id="dbPort"
                                type="number"
                                value={databaseConfig.port}
                                onChange={(e) => setDatabaseConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="dbDatabase">Database</Label>
                              <Input
                                id="dbDatabase"
                                value={databaseConfig.database}
                                onChange={(e) => setDatabaseConfig(prev => ({ ...prev, database: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="dbUsername">Usuário</Label>
                              <Input
                                id="dbUsername"
                                value={databaseConfig.username}
                                onChange={(e) => setDatabaseConfig(prev => ({ ...prev, username: e.target.value }))}
                              />
                            </div>
                            <div className="col-span-2">
                              <Label htmlFor="dbPassword">Senha</Label>
                              <Input
                                id="dbPassword"
                                type="password"
                                value={databaseConfig.password}
                                onChange={(e) => setDatabaseConfig(prev => ({ ...prev, password: e.target.value }))}
                              />
                            </div>
                            <div className="col-span-2">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={databaseConfig.ssl}
                                  onCheckedChange={(ssl) => setDatabaseConfig(prev => ({ ...prev, ssl }))}
                                />
                                <Label>Usar SSL</Label>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => testDatabaseMutation.mutate(databaseConfig)}
                              disabled={testDatabaseMutation.isPending}
                              variant="outline"
                            >
                              <TestTube className="w-4 h-4 mr-2" />
                              Testar Conexão
                            </Button>
                            <Button
                              onClick={() => createDatabaseMutation.mutate(databaseConfig)}
                              disabled={createDatabaseMutation.isPending}
                            >
                              Criar Conexão
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="webhook" className="space-y-4">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="webhookName">Nome</Label>
                              <Input
                                id="webhookName"
                                value={webhookConfig.name}
                                onChange={(e) => setWebhookConfig(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="webhookUrl">URL</Label>
                              <Input
                                id="webhookUrl"
                                value={webhookConfig.url}
                                onChange={(e) => setWebhookConfig(prev => ({ ...prev, url: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="webhookMethod">Método HTTP</Label>
                              <Select
                                value={webhookConfig.method}
                                onValueChange={(method: any) => setWebhookConfig(prev => ({ ...prev, method }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
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
                              <Label htmlFor="webhookPayload">Payload (JSON)</Label>
                              <Textarea
                                id="webhookPayload"
                                placeholder='{"key": "value"}'
                                onChange={(e) => {
                                  try {
                                    const payload = JSON.parse(e.target.value);
                                    setWebhookConfig(prev => ({ ...prev, payload }));
                                  } catch {
                                    // Invalid JSON, ignore
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => testWebhookMutation.mutate(webhookConfig)}
                              disabled={testWebhookMutation.isPending}
                              variant="outline"
                            >
                              <TestTube className="w-4 h-4 mr-2" />
                              Testar Webhook
                            </Button>
                            <Button
                              onClick={() => createWebhookMutation.mutate(webhookConfig)}
                              disabled={createWebhookMutation.isPending}
                            >
                              Criar Webhook
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="api" className="space-y-4">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="apiName">Nome</Label>
                              <Input
                                id="apiName"
                                value={apiConfig.name}
                                onChange={(e) => setApiConfig(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="apiUrl">URL Base</Label>
                              <Input
                                id="apiUrl"
                                value={apiConfig.baseUrl}
                                onChange={(e) => setApiConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="apiAuthType">Tipo de Autenticação</Label>
                              <Select
                                value={apiConfig.authentication.type}
                                onValueChange={(type: any) => setApiConfig(prev => ({ 
                                  ...prev, 
                                  authentication: { ...prev.authentication, type } 
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Nenhuma</SelectItem>
                                  <SelectItem value="basic">Basic Auth</SelectItem>
                                  <SelectItem value="bearer">Bearer Token</SelectItem>
                                  <SelectItem value="api_key">API Key</SelectItem>
                                  <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {apiConfig.authentication.type !== 'none' && (
                              <div>
                                <Label htmlFor="apiToken">Token/Key</Label>
                                <Input
                                  id="apiToken"
                                  type="password"
                                  onChange={(e) => setApiConfig(prev => ({ 
                                    ...prev, 
                                    authentication: { 
                                      ...prev.authentication, 
                                      credentials: { token: e.target.value }
                                    } 
                                  }))}
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => testApiMutation.mutate(apiConfig)}
                              disabled={testApiMutation.isPending}
                              variant="outline"
                            >
                              <TestTube className="w-4 h-4 mr-2" />
                              Testar API
                            </Button>
                            <Button
                              onClick={() => createApiMutation.mutate(apiConfig)}
                              disabled={createApiMutation.isPending}
                            >
                              Criar Conexão
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="file" className="space-y-4">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium mb-2">
                              Arraste arquivos aqui ou clique para selecionar
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                              Suporte para Excel (.xlsx, .xls) e CSV
                            </p>
                            <input
                              type="file"
                              accept=".xlsx,.xls,.csv"
                              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                              className="hidden"
                              id="file-upload"
                            />
                            <label htmlFor="file-upload">
                              <Button variant="outline" asChild>
                                <span>Selecionar Arquivo</span>
                              </Button>
                            </label>
                            {selectedFile && (
                              <div className="mt-4">
                                <p className="text-sm">Arquivo selecionado: {selectedFile.name}</p>
                                <Button
                                  onClick={() => uploadFileMutation.mutate(selectedFile)}
                                  disabled={uploadFileMutation.isPending}
                                  className="mt-2"
                                >
                                  {uploadFileMutation.isPending ? 'Carregando...' : 'Carregar Arquivo'}
                                </Button>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connections.map((connection) => (
                    <div
                      key={connection.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        {getConnectionIcon(connection.type)}
                        <div>
                          <div className="font-medium">{connection.name}</div>
                          <div className="text-sm text-gray-500 capitalize">
                            {connection.type}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(connection.lastStatus)}
                        <Badge variant={connection.isActive ? "default" : "secondary"}>
                          {connection.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteConnectionMutation.mutate(connection.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Tools */}
          <div className="col-span-12 lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Ferramentas de Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => exportToPdf([], 'Dados Exemplo', ['id', 'name', 'value'])}
                  className="w-full"
                  variant="outline"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Exportar para PDF
                </Button>
                <Button
                  onClick={() => exportToExcel([], 'Dados Exemplo')}
                  className="w-full"
                  variant="outline"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Exportar para Excel
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Conexões Ativas:</span>
                    <span className="font-medium">
                      {connections.filter(c => c.isActive).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total de Conexões:</span>
                    <span className="font-medium">{connections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bancos de Dados:</span>
                    <span className="font-medium">
                      {connections.filter(c => c.type === 'database').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>APIs:</span>
                    <span className="font-medium">
                      {connections.filter(c => c.type === 'api').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}