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
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Database, 
  Server, 
  Wifi,
  Globe,
  RefreshCw,
  TestTube
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Connectivity() {
  const [isTestingDatabase, setIsTestingDatabase] = useState(false);
  const [isTestingIntegration, setIsTestingIntegration] = useState(false);
  const [testResults, setTestResults] = useState<any>({});
  
  const [customTest, setCustomTest] = useState({
    type,
    url,
    method,
    headers,
    body,
    timeout);

  const { toast } = useToast();

  const { data, isLoading, refetch,
    retry,
  });

  const { data,
    retry,
  });

  const testDatabaseMutation = useMutation({
    mutationFn) => {
      return await apiRequest('POST', '/api/system/test-database');
    },
    onSuccess) => {
      setTestResults(prev => ({ ...prev, database));
      toast({
        title,
        description,
      });
    },
    onError) => {
      setTestResults(prev => ({ ...prev, database, message));
      toast({
        title,
        description,
        variant,
      });
    },
    onSettled) => {
      setIsTestingDatabase(false);
    }
  });

  const testIntegrationMutation = useMutation({
    mutationFn) => {
      return await apiRequest('POST', `/api/integrations/${integrationId}/test`);
    },
    onSuccess, integrationId) => {
      setTestResults(prev => ({ 
        ...prev, 
        integrations, 
          [integrationId]: data 
        } 
      }));
      toast({
        title,
        description,
      });
    },
    onError, integrationId) => {
      setTestResults(prev => ({ 
        ...prev, 
        integrations, 
          [integrationId]: { status, message));
      toast({
        title,
        description,
        variant,
      });
    },
    onSettled) => {
      setIsTestingIntegration(false);
    }
  });

  const customTestMutation = useMutation({
    mutationFn) => {
      return await apiRequest('POST', '/api/system/custom-test', testConfig);
    },
    onSuccess) => {
      setTestResults(prev => ({ ...prev, custom));
      toast({
        title,
        description,
      });
    },
    onError) => {
      setTestResults(prev => ({ ...prev, custom, message));
      toast({
        title,
        description,
        variant,
      });
    }
  });

  const handleDatabaseTest = () => {
    setIsTestingDatabase(true);
    testDatabaseMutation.mutate();
  };

  const handleIntegrationTest = (integrationId) => {
    setIsTestingIntegration(true);
    testIntegrationMutation.mutate(integrationId);
  };

  const handleCustomTest = () => {
    if (!customTest.url.trim()) {
      toast({
        title,
        description,
        variant,
      });
      return;
    }

    const testConfig = {
      ...customTest,
      timeout),
      headers) {},
      body) {
    switch (status) {
      case 'online':
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'offline':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default) => {
    switch (status) {
      case 'online':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'offline':
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'success':
        return 'Sucesso';
      case 'error':
        return 'Erro';
      case 'warning':
        return 'Atenção';
      default) => refetchStatus()} disabled={statusLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${statusLoading ? 'animate-spin' : ''}`} />
            Atualizar Status
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="w-5 h-5" />
              <span>Status do Sistema</span>
            </CardTitle>
            <CardDescription>
              Visão geral da saúde dos componentes principais
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <div className="grid grid-cols-1 md)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) {getStatusColor(systemStatus?.server || 'online')}>
                        {getStatusLabel(systemStatus?.server || 'online')}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Banco de Dados</p>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(systemStatus?.database || 'online')}
                      <Badge className={getStatusColor(systemStatus?.database || 'online')}>
                        {getStatusLabel(systemStatus?.database || 'online')}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Wifi className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">API Externa</p>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(systemStatus?.api || 'warning')}
                      <Badge className={getStatusColor(systemStatus?.api || 'warning')}>
                        {getStatusLabel(systemStatus?.api || 'warning')}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Integrações</p>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(systemStatus?.integrations || 'warning')}
                      <Badge className={getStatusColor(systemStatus?.integrations || 'warning')}>
                        {getStatusLabel(systemStatus?.integrations || 'warning')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Teste de Banco de Dados</span>
            </CardTitle>
            <CardDescription>
              Teste a conectividade e performance do banco de dados PostgreSQL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Teste de conexão, latência e operações básicas do banco
                </p>
                {testResults.database && (
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(testResults.database.status)}
                    <span className="text-sm">
                      {testResults.database.message || 'Teste executado'}
                    </span>
                    {testResults.database.latency && (
                      <Badge variant="outline">
                        {testResults.database.latency}ms
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <Button
                onClick={handleDatabaseTest}
                disabled={isTestingDatabase}
                variant="outline"
              >
                {isTestingDatabase ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) {/* Integration Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Teste de Integrações</span>
            </CardTitle>
            <CardDescription>
              Teste a conectividade com integrações externas configuradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(integrations || []).length > 0 ? (
              <div className="space-y-4">
                {(integrations || []).map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                        {integration.type === 'api' && <Globe className="w-5 h-5" />}
                        {integration.type === 'database' && <Database className="w-5 h-5" />}
                        {integration.type === 'webhook' && <Wifi className="w-5 h-5" />}
                        {integration.type === 'email' && <Server className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        <p className="text-sm text-gray-500">{integration.type.toUpperCase()}</p>
                        {testResults.integrations?.[integration.id] && (
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusIcon(testResults.integrations[integration.id].status)}
                            <span className="text-xs text-gray-600">
                              {testResults.integrations[integration.id].message}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleIntegrationTest(integration.id)}
                      disabled={isTestingIntegration}
                      variant="outline"
                      size="sm"
                    >
                      {isTestingIntegration ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Testando...
                        </>
                      ) {/* Custom Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="w-5 h-5" />
              <span>Teste Personalizado</span>
            </CardTitle>
            <CardDescription>
              Execute testes personalizados de conectividade e API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md) => setCustomTest(prev => ({ ...prev, type))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api">API REST</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                      <SelectItem value="ping">Ping</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="method">Método HTTP</Label>
                  <Select value={customTest.method} onValueChange={(value) => setCustomTest(prev => ({ ...prev, method))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={customTest.url}
                  onChange={(e) => setCustomTest(prev => ({ ...prev, url))}
                  placeholder="https)</Label>
                  <Textarea
                    id="headers"
                    value={customTest.headers}
                    onChange={(e) => setCustomTest(prev => ({ ...prev, headers))}
                    placeholder='{"Authorization": "Bearer token"}'
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="body">Body (JSON)</Label>
                  <Textarea
                    id="body"
                    value={customTest.body}
                    onChange={(e) => setCustomTest(prev => ({ ...prev, body))}
                    placeholder='{"key": "value"}'
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="timeout">Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={customTest.timeout}
                  onChange={(e) => setCustomTest(prev => ({ ...prev, timeout))}
                  placeholder="5000"
                />
              </div>

              {testResults.custom && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(testResults.custom.status)}
                    <span className="font-medium">Resultado do Teste</span>
                  </div>
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(testResults.custom, null, 2)}
                  </pre>
                </div>
              )}

              <Button
                onClick={handleCustomTest}
                disabled={customTestMutation.isPending}
                className="w-full"
              >
                {customTestMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Executando Teste...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4 mr-2" />
                    Executar Teste
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}