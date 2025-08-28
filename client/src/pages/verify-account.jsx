import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {  
  CheckCircle, 
  Mail, 
  Phone, 
  Clock,
  RefreshCw,
  AlertCircle,
  Zap }
} from 'lucide-react';
import VerificationForm from '@/components/verification-form';

export default function VerifyAccount() ({ const [user, setUser] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Verificar se há dados do usuário recém-criado
  useEffect(( }) => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const email = urlParams.get('email');
    const phone = urlParams.get('phone');
    
    if (userId) {
      setUser({ userId, email, phone });
    } else {
      // Redirecionar se não há dados de verificação
      window.location.href = '/login';
    }
  }, []);

  const handleVerificationComplete = () => ({ setIsCompleted(true);
    setTimeout(( }) => {
      window.location.href = '/login?verified=true&activated=true';
    }, 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TOIT Nexus</h1>
              <p className="text-sm text-gray-600">Verificação de Conta</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Título e Contexto */}
          <div className="text-center mb-8">
            <div className="mb-4">
              {isCompleted ? (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              ) {isCompleted ? 'Conta Ativada!' : 'Verifique sua Conta'}
            </h1>
            
            <p className="text-gray-600 mb-4">
              {isCompleted 
                ? 'Sua conta foi ativada com sucesso. Redirecionando para login...'
                : 'Para ativar sua conta trial de 7 dias, verifique seu email e telefone'
              }
            </p>

            {user?.email && (
              <div className="text-sm text-gray-500">
                Conta criada para)}
          </div>

          {/* Sistema de Verificação Moderno */}
          {!isCompleted && (
            <VerificationForm 
              onVerificationComplete={handleVerificationComplete}
              showTitle={false}
              mode="both"
              email={user?.email}
              phone={user?.phone}
            />
          )}

          {/* Conta Ativada */}
          ({ isCompleted && (
            <Card className="border-green-500 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Conta Trial Ativada com Sucesso!
                  </h3>
                  <p className="text-green-700 mb-4">
                    Sua conta trial de 7 dias foi verificada e está pronta para uso. 
                    Você será redirecionado para fazer login em alguns segundos.
                  </p>
                  <Button
                    onClick={( }) => window.location.href = '/login?verified=true&activated=true'}
                    className="bg-green-600 hover)}

          {/* Ajuda */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Problemas com a verificação? 
              <a href="mailto);
}