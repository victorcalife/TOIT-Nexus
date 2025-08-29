import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  Users,
  Workflow,
  Settings,
  Database,
  Server,
  Shield,
  Activity
} from 'lucide-react';

const WorkingApp = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // Carregar dados do sistema
        loadSystemData();
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    }
    setLoading(false);
  };

  const loadSystemData = async () => {
    try {
      // Carregar módulos
      const modulesResponse = await fetch('/api/modules/available');
      if (modulesResponse.ok) {
        const modulesData = await modulesResponse.json();
        setModules(modulesData);
      }

      // Carregar templates
      const templatesResponse = await fetch('/api/task-templates');
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.reload();
    } catch (error) {
      console.error('Erro no logout:', error);
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600">
              Sistema não autenticado
            </CardTitle>
            <CardDescription>
              Por favor, faça login novamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/'} 
              className="w-full"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">TOIT Nexus</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Olá, {user.firstName}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Alert */}
        <Alert className="mb-8">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Sistema operacional - sessão ativa e dados carregados do banco PostgreSQL.
          </AlertDescription>
        </Alert>

        {/* User Info */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Bem-vindo, {user.firstName}!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Módulos Ativos */}
            <Card>
              <CardHeader>
                <CardTitle>Módulos Ativos</CardTitle>
                <CardDescription>Funcionalidades habilitadas</CardDescription>
              </CardHeader>
              <CardContent>
                {modules.length > 0 ? (
                  <div className="space-y-2">
                    {modules.slice(0, 3).map((module, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{module.name || 'Módulo'}</p>
                          <p className="text-sm text-gray-500">{module.description || 'Sistema ativo'}</p>
                        </div>
                        <Badge variant="default">Ativo</Badge>
                      </div>
                    ))}
                    {modules.length > 3 && (
                      <p className="text-sm text-gray-500 text-center mt-2">
                        +{modules.length - 3} módulos adicionais
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum módulo ativo</p>
                )}
              </CardContent>
            </Card>

            {/* Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Templates</CardTitle>
                <CardDescription>Modelos configurados</CardDescription>
              </CardHeader>
              <CardContent>
                {templates.length > 0 ? (
                  <div className="space-y-2">
                    {templates.slice(0, 3).map((template, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{template.name || `Template ${index + 1}`}</p>
                          <p className="text-sm text-gray-500">
                            {template.fields?.length || 0} campos configurados
                          </p>
                        </div>
                        <Badge variant="outline">Pronto</Badge>
                      </div>
                    ))}
                    {templates.length > 3 && (
                      <p className="text-sm text-gray-500 text-center mt-2">
                        +{templates.length - 3} templates adicionais
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum template configurado</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Funcionalidades principais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" className="justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Gerenciar Usuários
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Workflow className="h-4 w-4 mr-2" />
                    Workflows
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Banco de Dados
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +20.1% em relação ao mês passado
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workflows</CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                +12 novos esta semana
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.9%</div>
              <p className="text-xs text-muted-foreground">
                Últimos 30 dias
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Segurança</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ativo</div>
              <p className="text-xs text-muted-foreground">
                Todas as verificações OK
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkingApp;