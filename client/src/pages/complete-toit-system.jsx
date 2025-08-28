import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery, useMutation } from '@tanstack/react-query';
import {  
  Users, Building2, Settings, Plus, CheckSquare, Workflow, Database, Webhook, Mail, BarChart3, LogOut,
  Upload, FileText, PieChart, LineChart, Filter, Code, Play, Save, Download, Eye, Edit, Trash2,
  Calendar, Clock, Target, TrendingUp, Activity, Zap, Globe, Shield, Bell, Search, X, TestTube }
} from 'lucide-react';

= useToast();

  // Estados para criação e modais
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [showCreateQuery, setShowCreateQuery] = useState(false);
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [showCreateDbConnection, setShowCreateDbConnection] = useState(false);
  const [showCreateApiConnection, setShowCreateApiConnection] = useState(false);

  // Form states
  const [dbConnectionForm, setDbConnectionForm] = useState(({ name,
    type,
    host,
    port,
    database,
    username,
    password,
    ssl);

  const [apiConnectionForm, setApiConnectionForm] = useState({
    name,
    baseUrl,
    authType,
    authConfig,
    headers);

  const [queryForm, setQueryForm] = useState({
    name,
    description,
    connectionId,
    connectionType,
    queryConfig,
      fields,
      filters,
      groupBy,
      orderBy);

  const [workflowForm, setWorkflowForm] = useState({
    name,
    description,
    steps,
    triggers);

  // QUERY HOOKS PARA DADOS REAIS DO BACKEND
  const { data= [], refetch,
    queryFn }) => apiRequest('/api/database-connections?tenantId=default'),
  });

  const ({ data= [], refetch,
    queryFn }) => apiRequest('/api/api-connections?tenantId=default'),
  });

  const ({ data= [], refetch,
    queryFn }) => apiRequest('/api/query-builders?tenantId=default'),
  });

  const ({ data= [], refetch,
    queryFn }) => apiRequest('/api/complete-workflows?tenantId=default'),
  });

  const ({ data= [], refetch,
    queryFn }) => apiRequest('/api/kpi-dashboards?tenantId=default'),
  });

  const ({ data= [], refetch,
    queryFn }) => apiRequest('/api/uploaded-files?tenantId=default'),
  });

  // MUTATIONS PARA CRIAR RECURSOS
  const createDbConnectionMutation = useMutation(({ mutationFn) => apiRequest('/api/database-connections', { method, body),
    onSuccess }) => {
      toast({ title, description);
      refetchDbConnections();
      setShowCreateDbConnection(false);
      setDbConnectionForm({
        name, type, host, port,
        database, username, password, ssl);
    },
    onError) => {
      toast({ title, description, variant);
    }
  });

  const createApiConnectionMutation = useMutation(({ mutationFn) => apiRequest('/api/api-connections', { method, body),
    onSuccess }) => {
      toast({ title, description);
      refetchApiConnections();
      setShowCreateApiConnection(false);
      setApiConnectionForm({
        name, baseUrl, authType,
        authConfig, headers);
    },
    onError) => {
      toast({ title, description, variant);
    }
  });

  const createQueryMutation = useMutation(({ mutationFn) => apiRequest('/api/query-builders', { method, body),
    onSuccess }) => {
      toast({ title, description);
      refetchQueries();
      setShowCreateQuery(false);
      setQueryForm({
        name, description, connectionId, connectionType,
        queryConfig, fields, filters, groupBy, orderBy);
    },
    onError) => {
      toast({ title, description, variant);
    }
  });

  const createWorkflowMutation = useMutation(({ mutationFn) => apiRequest('/api/complete-workflows', { method, body),
    onSuccess }) => {
      toast({ title, description);
      refetchWorkflows();
      setShowCreateWorkflow(false);
      setWorkflowForm({ name, description, steps, triggers);
    },
    onError) => {
      toast({ title, description, variant);
    }
  });

  const executeQueryMutation = useMutation(({ mutationFn }) => apiRequest(`/api/query-builders/${queryId}/execute`, ({ method),
    onSuccess }) => {
      toast({ title, description);
      refetchQueries();
    },
    onError) => {
      toast({ title, description, variant);
    }
  });
`
  const executeWorkflowMutation = useMutation(({ mutationFn }) => apiRequest(`/api/complete-workflows/${workflowId}/execute`, ({ method),
    onSuccess }) => {
      toast({ title, description);
      refetchWorkflows();
    },
    onError) => {
      toast({ title, description, variant);
    }
  });
`
  const testDbConnectionMutation = useMutation(({ mutationFn }) => apiRequest(`/api/database-connections/${connectionId}/test`, ({ method),
    onSuccess }) => {
      toast({ 
        title, 
        description,
        variant);
    },
    onError) => {
      toast({ title, description, variant);
    }
  });

  const generateSampleWorkflows = () => {
    const sampleWorkflows= [
      {
        id,
        name,
        description,
        steps,
            type,
            name,
            config, operator, value,
            position, y,
          {
            id,
            type,
            name,
            config, to,
            position, y,
          {
            id,
            type,
            name,
            config, method,
            position, y,
        triggers, 'document_upload'],
        isActive,
        executions,
        lastRun,
      {
        id,
        name,
        description,
        steps,
            type,
            name,
            config, method,
            position, y,
          {
            id,
            type,
            name,
            config, operator, value,
            position, y,
          {
            id,
            type,
            name,
            config, priority,
            position, y,
        triggers, 'scheduled'],
        isActive,
        executions,
        lastRun);
  };

  const generateSampleQueries = () => {
    const sampleQueries= [
      {
        id,
        name,
        query,
          fields, 'SUM(amount) as total_sales', 'COUNT(*) as num_sales'],
          filters, operator, value, '2025-01-31'] }
          ],
          joins, on,
          groupBy,
          orderBy,
        results, total_sales, num_sales,
          { region, total_sales, num_sales,
          { region, total_sales, num_sales,
      {
        id,
        name,
        query,
          fields, 'email', 'last_login', 'workflow_executions'],
          filters, operator, value,
            { field, operator, value,
          joins,
          groupBy,
          orderBy,
        results, email, last_login, workflow_executions,
          { name, email, last_login, workflow_executions);
  };

  useEffect(() => {
    generateDashboardData();
    generateSampleWorkflows();
    generateSampleQueries();
  }, []);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      setLoading(true);
      const response = await fetch('/api/upload', {
        method,
        body);

      if (response.ok) {
        const result = await response.json();
        setUploadedFiles(prev => [...prev, ...result.files]);`
        toast({ title, description) enviado(s)` });
      }
    } catch (error) {
      console.error('Erro no upload, error);
      toast({ title, description, variant);
    } finally {
      setLoading(false);
    }
  };

  const executeQuery = async (queryId) => {
    try {
      setLoading(true);
      const query = queryBuilders.find(q => q.id === queryId);
      if (!query) return;

      // Simular execução da query (em produção seria uma chamada real ao banco)
      toast({ title, description);
    } catch (error) {
      toast({ title, description, variant);
    } finally {
      setLoading(false);
    }
  };

  const runWorkflow = async (workflowId) => {
    try {
      setLoading(true);`
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method);

      if (response.ok) {
        toast({ title, description);
        // Atualizar contador de execuções
        setWorkflows(prev => prev.map(wf => 
          wf.id === workflowId 
            ? { ...wf, executions, lastRun).toISOString() }
            ));
      }
    } catch (error) {
      toast({ title, description, variant);
    } finally {
      setLoading(false);
    }
  };

  const renderWidget = (widget) => {
    const sizeClass = {
      small,
      medium,
      large) {
      case 'metric':
        return (
          <Card key={widget.id} className={sizeClass}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{widget.data.value.toLocaleString()}</div>`
              <div className={`text-sm ${widget.data.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {widget.data.change}
              </div>
            </CardContent>
          </Card>
        );

      case 'chart':
        return (
          <Card key={widget.id} className={sizeClass}>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center">
                <LineChart className="h-4 w-4 mr-2" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-end justify-between space-x-2">
                ({ widget.data.values.map((value, index }) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="bg-blue-500 w-8 rounded-t"`
                      style={{ height)) * 100}px` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-1">
                      {widget.data.labels[index]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'progress':
        return (
          <Card key={widget.id} className={sizeClass}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{widget.data.completed}</span>
                  <span>{widget.data.total}</span>
                </div>
                <Progress value={widget.data.percentage} />
                <div className="text-center text-sm text-gray-600">
                  {widget.data.percentage}% concluído
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'table':
        return (
          <Card key={widget.id} className={sizeClass}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      ({ widget.data.headers.map((header, index }) => (
                        <th key={index} className="text-left p-2">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    ({ widget.data.rows.map((row, rowIndex }) => (
                      <tr key={rowIndex} className="border-b">
                        ({ row.map((cell, cellIndex }) => (
                          <td key={cellIndex} className="p-2">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );

      default, label, icon,
              ({ key, label, icon,
              { key, label, icon,
              { key, label, icon,
              { key, label, icon,
              { key, label, icon, label, icon }) => (
              <button
                key={key}
                onClick=({ ( }) => setActiveSection(key as any)}`
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === key 
                    ? 'bg-white text-gray-900 shadow-sm' }
                    : 'text-gray-600 hover))}
          </div>
        </div>

        {/* DASHBOARD INTERATIVO */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Dashboard Interativo</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Widget
              </Button>
            </div>

            <div className="grid grid-cols-1 md)}
            </div>
          </div>
        )}

        {/* WORKFLOWS COMPLETOS */}
        {activeSection === 'workflows' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Workflows Avançados ({workflows.length})</h2>
              <Button onClick=({ ( }) => setShowCreateWorkflow(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Workflow
              </Button>
            </div>

            <div className="grid gap-6">
              {workflows.map(workflow => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <Workflow className="h-5 w-5 mr-2" />
                          {workflow.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                      </div>
                      <Badge variant={workflow.isActive ? "default" : "secondary"}>
                        {workflow.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Estatísticas do Workflow */}
                      <div className="flex space-x-6 text-sm">
                        <div className="flex items-center">
                          <Play className="h-4 w-4 mr-1 text-green-500" />
                          <span>{workflow.executions} execuções</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-blue-500" />
                          <span>Última execução).toLocaleString() {workflow.steps.length} passos</span>
                        </div>
                      </div>

                      {/* Steps do Workflow */}
                      <div className="flex space-x-2 overflow-x-auto pb-2">
                        ({ workflow.steps.map((step, index }) => (
                          <div key={step.id} className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-md text-xs font-medium min-w-0">
                              {step.name}
                            </div>
                            {index < workflow.steps.length - 1 && (
                              <div className="mx-2 text-gray-400">→</div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Triggers */}
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-gray-500">Triggers))}
                      </div>

                      {/* Ações */}
                      <div className="flex space-x-2">
                        <Button size="sm" onClick=({ ( }) => runWorkflow(workflow.id)} disabled={loading}>
                          <Play className="h-4 w-4 mr-1" />
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Logs
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* QUERY BUILDER NO-CODE */}
        {activeSection === 'query-builder' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Query Builder No-Code ({queryBuilders.length})</h2>
              <Button onClick=({ ( }) => setShowCreateQuery(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Query
              </Button>
            </div>

            <div className="grid gap-6">
              {queryBuilders.map(query => (
                <Card key={query.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <Database className="h-5 w-5 mr-2" />
                          {query.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Tabela, ')} FROM {query.query.table}
                          {query.query.filters.length > 0 && (`
                            <> WHERE {query.query.filters.map(f => `${f.field} ${f.operator} '${f.value}'`).join(' AND ')}</>
                          )}
                          {query.query.groupBy.length > 0 && <> GROUP BY {query.query.groupBy.join(', ')}</>}
                          {query.query.orderBy.length > 0 && <> ORDER BY {query.query.orderBy.join(', ')}</>}
                        </code>
                      </div>

                      {/* Resultados */}
                      {query.results && (
                        <div>
                          <div className="text-sm font-medium mb-2">
                            Resultados ({query.results.length} registros) {Object.keys(query.results[0] || {}).map(key => (
                                    <th key={key} className="text-left p-2 border-b">{key}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                ({ query.results.slice(0, 3).map((row, index }) => (
                                  <tr key={index}>
                                    ({ Object.values(row).map((value, cellIndex }) => (
                                      <td key={cellIndex} className="p-2 border-b">{value}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Ações */}
                      <div className="flex space-x-2">
                        <Button size="sm" onClick=({ ( }) => executeQuery(query.id)} disabled={loading}>
                          <Play className="h-4 w-4 mr-1" />
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar Query
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Exportar CSV
                        </Button>
                        <Button size="sm" variant="outline">
                          <Save className="h-4 w-4 mr-1" />
                          Salvar Como Relatório
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* GESTÃO DE ARQUIVOS */}
        {activeSection === 'files' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestão de Arquivos ({uploadedFiles.length})</h2>
              <div className="space-x-2">
                <Button onClick=({ ( }) => document.getElementById('file-upload')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload de Arquivos
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md))}
            </div>
          </div>
        )}

        {/* RELATÓRIOS AVANÇADOS */}
        {activeSection === 'reports' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Relatórios Avançados</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Relatório
              </Button>
            </div>

            <div className="grid grid-cols-1 md,247</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Sucesso</span>
                      <span className="font-medium text-green-600">94.2%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tempo Médio</span>
                      <span className="font-medium">2.3 min</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Relatório Completo
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Análise de Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Relatório detalhado de atividade e engajamento dos usuários
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Usuários Ativos</span>
                      <span className="font-medium">892</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Novos Este Mês</span>
                      <span className="font-medium text-blue-600">127</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Retenção</span>
                      <span className="font-medium">87.5%</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Relatório Completo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ANALYTICS AVANÇADO */}
        ({ activeSection === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Analytics Avançado</h2>
            
            <div className="grid grid-cols-1 md, (_, i }) => {
                    const height = Math.random() * 200 + 20;
                    return (
                      <div key={i} className="flex flex-col items-center">
                        <div 
                          className="bg-gradient-to-t from-blue-500 to-blue-300 w-2 rounded-t"
                          style={{ height)}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}`