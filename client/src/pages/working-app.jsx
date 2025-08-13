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

, []);

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
      console.error('Erro ao verificar autenticação, error);
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
      console.error('Erro ao carregar dados, error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method);
      window.location.reload();
    } catch (error) {
      console.error('Erro no logout, error);
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
        <div className="max-w-7xl mx-auto px-4 sm, 
              sessão ativa e dados carregados do banco PostgreSQL.
            </AlertDescription>
          </Alert>

          {/* User Info */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Bem-vindo, {user.firstName}!
            </h2>
            <div className="grid grid-cols-1 md, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{module.name || 'Módulo'}</p>
                          <p className="text-sm text-gray-500">{module.description || 'Sistema ativo'}</p>
                        </div>
                        <Badge variant="default">Ativo</Badge>
                      </div>
                    ))}
                  </div>
                ) {templates.length > 0 ? (
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
                ) {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Funcionalidades principais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}