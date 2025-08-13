/**
 * CALENDAR OAUTH CALLBACK PAGE - Processa callback OAuth dos calendários externos
 * Captura código de autorização e finaliza integração
 */

import { useState, useEffect } from 'react';
import { StandardHeader } from '@/components/standard-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { CheckCircle, AlertCircle, RefreshCw, Calendar } from 'lucide-react';

export default function CalendarCallback() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processando autorização...');
  const [integrationDetails, setIntegrationDetails] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    processCallback();
  }, []);

  const processCallback = async () => {
    try {
      // Extrair parâmetros da URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      // Verificar se houve erro na autorização
      if (error) {
        setStatus('error');
        setMessage(`Erro na autorização);
        return;
      }

      // Validar parâmetros obrigatórios
      if (!code || !state) {
        setStatus('error');
        setMessage('Parâmetros de autorização inválidos');
        return;
      }

      // Extrair provider do state
      const provider = state.split('_')[0];
      
      if (!['google', 'apple', 'outlook'].includes(provider)) {
        setStatus('error');
        setMessage('Provedor de calendário inválido');
        return;
      }

      setMessage(`Finalizando integração com ${provider}...`);

      // Processar callback no backend
      const response = await apiRequest('POST', '/api/calendar/callback', {
        code,
        state,
        provider
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(`${provider} conectado com sucesso!`);
        setIntegrationDetails(data.integration);
        
        // Fechar popup após sucesso (se aberto em popup)
        if (window.opener) {
          setTimeout(() => {
            window.close();
          }, 3000);
        }
      } else {
        throw new Error(data.message || 'Erro ao processar callback');
      }

    } catch (error) {
      console.error('Erro no callback, error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message);
    }
  };

  const handleReturnToDashboard = () => {
    if (window.opener) {
      window.close();
    } else {
      window.location.href = '/calendar-integrations';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StandardHeader showUserActions={true} user={user} />
      
      <div className="flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {status === 'processing' && (
                  <RefreshCw className="h-16 w-16 text-blue-500 animate-spin" />
                )}
                {status === 'success' && (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                )}
                {status === 'error' && (
                  <AlertCircle className="h-16 w-16 text-red-500" />
                )}
              </div>
              
              <CardTitle className={`text-2xl ${
                status === 'success' ? 'text-green-600' : 
                status === 'error' ? 'text-red-600' : 
                'text-blue-600'
              }`}>
                {status === 'processing' && 'Conectando Calendário'}
                {status === 'success' && 'Conexão Bem-sucedida!'}
                {status === 'error' && 'Erro na Conexão'}
              </CardTitle>
            </CardHeader>

            <CardContent className="text-center space-y-6">
              <p className="text-gray-600">
                {message}
              </p>

              {integrationDetails && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">
                      {integrationDetails.calendarName}
                    </span>
                  </div>
                  <p className="text-sm text-green-600 capitalize">
                    Provedor)}

              {status !== 'processing' && (
                <div className="space-y-3">
                  <Button
                    onClick={handleReturnToDashboard}
                    className="w-full"
                    variant={status === 'success' ? 'default' : 'outline'}
                  >
                    {window.opener ? 'Fechar' : 'Voltar às Integrações'}
                  </Button>
                  
                  {status === 'error' && (
                    <Button
                      onClick={processCallback}
                      variant="outline"
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Tentar Novamente
                    </Button>
                  )}
                </div>
              )}

              {status === 'success' && window.opener && (
                <div className="text-sm text-gray-500">
                  Esta janela será fechada automaticamente em 3 segundos...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações técnicas para debug (apenas em desenvolvimento) */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="mt-4 border-gray-200">
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-700 mb-2">Debug Info)}
        </div>
      </div>
    </div>
  );
}