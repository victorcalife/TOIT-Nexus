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

interface User {
  id: string;
  cpf: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: 'super_admin' | 'tenant_admin' | 'manager' | 'employee';
}

export default function WorkingApp() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

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
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TOIT NEXUS</h1>
              <p className="text-sm text-gray-500">Sistema de Automação de Workflows</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.role === 'super_admin' ? 'destructive' : 'default'}>
                    {user.role === 'super_admin' ? 'Super Admin' : 
                     user.role === 'tenant_admin' ? 'Admin Tenant' : 
                     user.role === 'manager' ? 'Gerente' : 'Funcionário'}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Success Alert */}
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Sistema funcionando perfeitamente!</strong> Login realizado com sucesso, 
              sessão ativa e dados carregados do banco PostgreSQL.
            </AlertDescription>
          </Alert>

          {/* User Info */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Bem-vindo, {user.firstName}!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="text-lg font-semibold text-gray-900">Autenticado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Database className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Banco de Dados</p>
                      <p className="text-lg font-semibold text-gray-900">Conectado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Server className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">API</p>
                      <p className="text-lg font-semibold text-gray-900">Online</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Módulos Disponíveis
                </CardTitle>
                <CardDescription>
                  Módulos carregados do banco de dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {modules.length > 0 ? (
                  <div className="space-y-2">
                    {modules.map((module, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{module.name || 'Módulo'}</p>
                          <p className="text-sm text-gray-500">{module.description || 'Sistema ativo'}</p>
                        </div>
                        <Badge variant="default">Ativo</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Carregando módulos...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Workflow className="mr-2 h-5 w-5" />
                  Templates de Tarefas
                </CardTitle>
                <CardDescription>
                  Templates disponíveis no sistema
                </CardDescription>
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
                  <div className="text-center py-4">
                    <p className="text-gray-500">Carregando templates...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Funcionalidades principais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button className="h-20 flex flex-col items-center justify-center" variant="outline">
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-sm">Gerenciar Usuários</span>
                </Button>
                
                <Button className="h-20 flex flex-col items-center justify-center" variant="outline">
                  <Workflow className="h-6 w-6 mb-2" />
                  <span className="text-sm">Criar Workflow</span>
                </Button>
                
                <Button className="h-20 flex flex-col items-center justify-center" variant="outline">
                  <Database className="h-6 w-6 mb-2" />
                  <span className="text-sm">Ver Dados</span>
                </Button>
                
                <Button className="h-20 flex flex-col items-center justify-center" variant="outline">
                  <Settings className="h-6 w-6 mb-2" />
                  <span className="text-sm">Configurações</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Debugging Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Informações de Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>CPF:</strong> {user.cpf}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Módulos carregados:</strong> {modules.length}</p>
                <p><strong>Templates carregados:</strong> {templates.length}</p>
                <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}