import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, useNavigate } from 'react-router-dom';
import {  
  ShieldX, 
  ArrowLeft, 
  Home, 
  AlertTriangle,
  Lock,
  Mail
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    if (user) {
      // Redirecionar para dashboard baseado no role
      if (user.roles?.includes('super_admin') || user.roles?.includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Main Error Card */}
        <Card className="shadow-xl border-0 mb-6">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <ShieldX className="h-12 w-12 text-red-600" />
            </div>
            <CardTitle className="text-3xl text-red-600 mb-2">
              Acesso Negado
            </CardTitle>
            <CardDescription className="text-lg">
              Você não tem permissão para acessar esta página
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Erro 403 - Forbidden:</strong> Suas permissões atuais não permitem o acesso a este recurso.
              </AlertDescription>
            </Alert>

            {/* User Info */}
            {user && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  Informações da Conta
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Usuário:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  {user.tenant && (
                    <p><strong>Organização:</strong> {user.tenant.name}</p>
                  )}
                  {user.roles && user.roles.length > 0 && (
                    <p><strong>Permissões:</strong> {user.roles.join(', ')}</p>
                  )}
                </div>
              </div>
            )}

            {/* Possible Reasons */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">Possíveis motivos:</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  Você não possui as permissões necessárias para esta funcionalidade
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  Sua conta pode estar com acesso limitado ou suspenso
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  O recurso pode estar disponível apenas para administradores
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  Você pode estar tentando acessar dados de outra organização
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleGoBack}
                variant="outline" 
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>

              <Button 
                onClick={handleGoHome}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Home className="h-4 w-4 mr-2" />
                Ir para Início
              </Button>
              
              {user && (
                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  Sair da Conta
                </Button>
              )}
            </div>

            {/* Login Link for Non-authenticated Users */}
            {!user && (
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600 mb-3">
                  Não está logado? Faça login para acessar o sistema.
                </p>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link to="/login">
                    Fazer Login
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <Mail className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Precisa de ajuda?</h3>
              </div>
              
              <p className="text-sm text-gray-600">
                Se você acredita que deveria ter acesso a esta página, entre em contato com:
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/support">
                    Suporte Técnico
                  </Link>
                </Button>
                
                {user?.tenant && (
                  <Button variant="outline" size="sm">
                    Administrador da Organização
                  </Button>
                )}
              </div>
              
              <div className="text-xs text-gray-500 pt-2">
                <p>Código do erro: 403 - Forbidden</p>
                <p>Timestamp: {new Date().toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 TOIT Nexus. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;