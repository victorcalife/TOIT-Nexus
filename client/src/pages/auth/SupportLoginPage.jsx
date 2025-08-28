import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {  
  Shield, 
  Mail, 
  Lock, 
  ArrowLeft, 
  AlertCircle,
  Headphones,
  Users
} from 'lucide-react';

const SupportLoginPage = () => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login({
        ...formData,
        loginType: 'support'
      });
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Headphones className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Portal de Suporte</h1>
          <p className="text-gray-600 mt-2">
            Acesso exclusivo para equipe de suporte
          </p>
          <Badge variant="secondary" className="mt-2">
            <Shield className="h-3 w-3 mr-1" />
            Área Restrita
          </Badge>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Login de Suporte</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais de suporte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email de Suporte</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="suporte@empresa.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar no Suporte'}
              </Button>
            </form>

            {/* Support Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center text-blue-800 text-sm">
                <Users className="h-4 w-4 mr-2" />
                <span className="font-medium">Acesso de Suporte</span>
              </div>
              <p className="text-blue-700 text-xs mt-1">
                Este portal é exclusivo para membros da equipe de suporte técnico.
                Você terá acesso a ferramentas administrativas e de diagnóstico.
              </p>
            </div>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar ao login principal
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 TOIT Nexus. Todos os direitos reservados.</p>
          <p className="mt-1">
            Portal seguro para equipe de suporte técnico
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportLoginPage;