import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Database, Globe, Code, Workflow, Upload, BarChart3, Play, TestTube, 
  Plus, X, Save, Settings, Eye, Trash2, LogOut, RefreshCw
} from 'lucide-react';

// SISTEMA COMPLETO TOIT NEXUS - PRONTO PARA GO-LIVE
export default function ToitNexusComplete() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showCreateDbConnection, setShowCreateDbConnection] = useState(false);
  const [showCreateApiConnection, setShowCreateApiConnection] = useState(false);
  const [showCreateQuery, setShowCreateQuery] = useState(false);
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const { toast } = useToast();

  // FORMS STATE
  const [dbForm, setDbForm] = useState({
    name, type, host, port,
    database, username, password, ssl);

  const [apiForm, setApiForm] = useState({
    name, baseUrl, authType,
    authConfig, headers);

  const [queryForm, setQueryForm] = useState({
    name, description, connectionId, connectionType,
    queryConfig, fields, filters, groupBy, orderBy);

  const [workflowForm, setWorkflowForm] = useState({
    name, description, 
    steps, config,
    triggers, config);

  // QUERIES - DADOS REAIS DO BACKEND
  const { data= [], refetch,
    queryFn) => apiRequest('/api/database-connections?tenantId=default'),
  });

  const { data= [], refetch,
    queryFn) => apiRequest('/api/api-connections?tenantId=default'),
  });

  const { data= [], refetch,
    queryFn) => apiRequest('/api/query-builders?tenantId=default'),
  });

  const { data= [], refetch,
    queryFn) => apiRequest('/api/complete-workflows?tenantId=default'),
  });

  const { data= [] } = useQuery({
    queryKey,
    queryFn) => apiRequest('/api/kpi-dashboards?tenantId=default'),
  });

  const { data= [] } = useQuery({
    queryKey,
    queryFn) => apiRequest('/api/uploaded-files?tenantId=default'),
  });

  // MUTATIONS
  const createDbMutation = useMutation({
    mutationFn) => apiRequest('/api/database-connections', { method, body, tenantId),
    onSuccess) => {
      toast({ title, description);
      refetchDb();
      setShowCreateDbConnection(false);
      setDbForm({ name, type, host, port, database, username, password, ssl);
    }
  });

  const createApiMutation = useMutation({
    mutationFn) => apiRequest('/api/api-connections', { method, body, tenantId),
    onSuccess) => {
      toast({ title, description);
      refetchApi();
      setShowCreateApiConnection(false);
      setApiForm({ name, baseUrl, authType, authConfig, headers);
    }
  });

  const createQueryMutation = useMutation({
    mutationFn) => apiRequest('/api/query-builders', { method, body, tenantId, userId),
    onSuccess) => {
      toast({ title, description);
      refetchQueries();
      setShowCreateQuery(false);
      setQueryForm({ name, description, connectionId, connectionType, queryConfig, fields, filters, groupBy, orderBy);
    }
  });

  const createWorkflowMutation = useMutation({
    mutationFn) => apiRequest('/api/complete-workflows', { method, body, tenantId, userId),
    onSuccess) => {
      toast({ title, description);
      refetchWorkflows();
      setShowCreateWorkflow(false);
      setWorkflowForm({ name, description, steps, config, triggers, config);
    }
  });

  const testDbMutation = useMutation({
    mutationFn) => apiRequest(`/api/database-connections/${id}/test`, { method),
    onSuccess) => {
      toast({ 
        title, 
        description,
        variant);
    }
  });

  const executeQueryMutation = useMutation({
    mutationFn) => apiRequest(`/api/query-builders/${id}/execute`, { method),
    onSuccess) => {
      toast({ title, description);
      refetchQueries();
    }
  });

  const executeWorkflowMutation = useMutation({
    mutationFn) => apiRequest(`/api/complete-workflows/${id}/execute`, { method),
    onSuccess) => {
      toast({ title, description);
      refetchWorkflows();
    }
  });

  // LOGOUT
  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* HEADER */}
      <div className="bg-white shadow-lg border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TOIT NEXUS</h1>
                <p className="text-sm text-gray-600">Sistema Completo de Automação</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 py-3">
            {[
              { key, label, icon,
              { key, label, icon,
              { key, label, icon,
              { key, label, icon,
              { key, label, icon, label, icon) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeSection === key 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-600 hover))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* DASHBOARD */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md, PostgreSQL, SQL Server, Oracle)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Conexão com QUALQUER API (REST, Bearer, API Key)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Query Builder visual no-code</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Workflows avançados automatizados</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Dashboard KPI integrado</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Upload e processamento de arquivos</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3">🚀 Pronto para Produção</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Backend completo com PostgreSQL</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Frontend React + TypeScript funcional</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Autenticação e multi-tenancy</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>APIs funcionais e testadas</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{activeSection === 'connections' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Conexões Universais</h2>
              <div className="flex space-x-3">
                <Button onClick={() => setShowCreateDbConnection(true)} className="bg-blue-600 hover) => setShowCreateApiConnection(true)} className="bg-green-600 hover)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dbConnections.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Nenhuma conexão de banco configurada</p>
                    ) {conn.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{conn.name}</p>
                            <p className="text-sm text-gray-600">{conn.type} • {conn.host}:{conn.port}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => testDbMutation.mutate(conn.id)}
                              disabled={testDbMutation.isPending}
                            >
                              <TestTube className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* API CONNECTIONS */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>APIs Externas ({apiConnections.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {apiConnections.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Nenhuma conexão API configurada</p>
                    ) {conn.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{conn.name}</p>
                            <p className="text-sm text-gray-600">{conn.authType} • {conn.baseUrl}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <TestTube className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* QUERY BUILDER */}
        {activeSection === 'queries' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Query Builder No-Code</h2>
              <Button onClick={() => setShowCreateQuery(true)} className="bg-purple-600 hover) {query.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{query.name}</CardTitle>
                      <p className="text-sm text-gray-600">{query.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Tipo) => executeQueryMutation.mutate(query.id)}
                            disabled={executeQueryMutation.isPending}
                            className="flex-1"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Executar
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* WORKFLOWS */}
        {activeSection === 'workflows' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Workflows Automatizados</h2>
              <Button onClick={() => setShowCreateWorkflow(true)} className="bg-orange-600 hover) {workflow.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <p className="text-sm text-gray-600">{workflow.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Status) => executeWorkflowMutation.mutate(workflow.id)}
                            disabled={executeWorkflowMutation.isPending}
                            className="flex-1"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Executar
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* FILES */}
        {activeSection === 'files' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestão de Arquivos</h2>
              <Button className="bg-indigo-600 hover)}
      </div>

      {/* MODALS */}
      
      {/* CREATE DB CONNECTION MODAL */}
      {showCreateDbConnection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Nova Conexão de Banco</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateDbConnection(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome da Conexão</Label>
                <Input 
                  value={dbForm.name}
                  onChange={(e) => setDbForm({...dbForm, name)}
                  placeholder="Meu Banco MySQL"
                />
              </div>
              <div>
                <Label>Tipo do Banco</Label>
                <Select value={dbForm.type} onValueChange={(value) => setDbForm({...dbForm, type)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="mssql">SQL Server</SelectItem>
                    <SelectItem value="oracle">Oracle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Host</Label>
                  <Input 
                    value={dbForm.host}
                    onChange={(e) => setDbForm({...dbForm, host)}
                    placeholder="api.toit.com.br"
                  />
                </div>
                <div>
                  <Label>Porta</Label>
                  <Input 
                    type="number"
                    value={dbForm.port}
                    onChange={(e) => setDbForm({...dbForm, port)})}
                  />
                </div>
              </div>
              <div>
                <Label>Banco de Dados</Label>
                <Input 
                  value={dbForm.database}
                  onChange={(e) => setDbForm({...dbForm, database)}
                  placeholder="nome_do_banco"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Usuário</Label>
                  <Input 
                    value={dbForm.username}
                    onChange={(e) => setDbForm({...dbForm, username)}
                    placeholder="usuario"
                  />
                </div>
                <div>
                  <Label>Senha</Label>
                  <Input 
                    type="password"
                    value={dbForm.password}
                    onChange={(e) => setDbForm({...dbForm, password)}
                    placeholder="senha"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowCreateDbConnection(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => createDbMutation.mutate(dbForm)}
                  disabled={createDbMutation.isPending}
                >
                  {createDbMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Criar Conexão
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CREATE API CONNECTION MODAL */}
      {showCreateApiConnection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Nova Conexão API</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateApiConnection(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome da API</Label>
                <Input 
                  value={apiForm.name}
                  onChange={(e) => setApiForm({...apiForm, name)}
                  placeholder="Minha API"
                />
              </div>
              <div>
                <Label>URL Base</Label>
                <Input 
                  value={apiForm.baseUrl}
                  onChange={(e) => setApiForm({...apiForm, baseUrl)}
                  placeholder="https) => setApiForm({...apiForm, authType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="apikey">API Key</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="oauth">OAuth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Token/Chave</Label>
                <Input 
                  type="password"
                  value={apiForm.authConfig.token}
                  onChange={(e) => setApiForm({...apiForm, authConfig)}
                  placeholder="seu_token_aqui"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowCreateApiConnection(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => createApiMutation.mutate(apiForm)}
                  disabled={createApiMutation.isPending}
                >
                  {createApiMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Criar Conexão
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CREATE QUERY MODAL */}
      {showCreateQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Novo Query Builder</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateQuery(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome da Query</Label>
                <Input 
                  value={queryForm.name}
                  onChange={(e) => setQueryForm({...queryForm, name)}
                  placeholder="Relatório de Vendas"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea 
                  value={queryForm.description}
                  onChange={(e) => setQueryForm({...queryForm, description)}
                  placeholder="Descreva o que esta query faz..."
                />
              </div>
              <div>
                <Label>Tipo de Conexão</Label>
                <Select value={queryForm.connectionType} onValueChange={(value) => setQueryForm({...queryForm, connectionType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="database">Banco de Dados</SelectItem>
                    <SelectItem value="api">API Externa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Conexão</Label>
                <Select value={queryForm.connectionId} onValueChange={(value) => setQueryForm({...queryForm, connectionId)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar conexão" />
                  </SelectTrigger>
                  <SelectContent>
                    {queryForm.connectionType === 'database' ? (
                      dbConnections.map((conn) => (
                        <SelectItem key={conn.id} value={conn.id}>
                          {conn.name} ({conn.type})
                        </SelectItem>
                      ))
                    ) {conn.id} value={conn.id}>
                          {conn.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowCreateQuery(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => createQueryMutation.mutate(queryForm)}
                  disabled={createQueryMutation.isPending}
                >
                  {createQueryMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Criar Query
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CREATE WORKFLOW MODAL */}
      {showCreateWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Novo Workflow</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateWorkflow(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome do Workflow</Label>
                <Input 
                  value={workflowForm.name}
                  onChange={(e) => setWorkflowForm({...workflowForm, name)}
                  placeholder="Processamento Automático"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea 
                  value={workflowForm.description}
                  onChange={(e) => setWorkflowForm({...workflowForm, description)}
                  placeholder="Descreva o workflow..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowCreateWorkflow(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => createWorkflowMutation.mutate(workflowForm)}
                  disabled={createWorkflowMutation.isPending}
                >
                  {createWorkflowMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Criar Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}