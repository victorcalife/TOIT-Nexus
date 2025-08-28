import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail, Clock, AlertCircle } from "lucide-react";
import { StandardHeader } from "@/components/standard-header";
import workflowLogo from "@/assets/SELOtoit-workflow-logo.svg";
  
function VerifyEmail() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [accountActivated, setAccountActivated] = useState(false);
  const [userId, setUserId] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userIdParam = urlParams.get('userId');

    if (userIdParam) {
      setUserId(userIdParam);
    }

    // Auto-verificar se token estiver presente
    if (token && userIdParam) {
      verifyEmailToken(token, userIdParam);
    } else {
      setStatus('error');
      setMessage('Link de verificação inválido');
    }
  }, []);

  const verifyEmailToken = async (token, userId) => {
    try {
      const response = await fetch(`/api/verification/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'email',
          code: token,
          userId: userId
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus('success');
        setMessage('Email verificado com sucesso!');
        
        // Verificar se conta já foi totalmente ativada
        const checkActivation = async () => {
          try {
            const statusResponse = await fetch(`/api/verification/status/${userId}`);
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              // Conta ativa se email E telefone verificados (ou telefone não obrigatório)
              const isActive = statusData.data.email_verified && (statusData.data.phone_verified || !statusData.data.has_phone);
              setAccountActivated(isActive);
            }
          } catch (error) {
            console.error('Erro ao verificar status da conta:', error);
          }
        };
        
        checkActivation();
      } else if (result.error === 'CODE_NOT_FOUND' || result.error === 'MAX_ATTEMPTS_EXCEEDED') {
        setStatus('expired');
        setMessage(result.message || 'Código expirado ou inválido');
      } else {
        setStatus('error');
        setMessage(result.message || 'Erro ao verificar email');
      }
    } catch (error) {
      console.error('Erro na verificação:', error);
      setStatus('error');
      setMessage('Erro de conexão');
    }
  };

  const handleResendEmail = async () => {
    if (!userId || resendLoading) return;

    setResendLoading(true);
    try {
      const response = await fetch('/api/verification/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'email',
          userId: userId
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage('Email de verificação reenviado! Verifique sua caixa de entrada.');
        setStatus('loading');
      } else {
        setMessage(result.message || 'Erro ao reenviar email');
      }
    } catch (error) {
      setMessage('Erro de conexão');
    }
    setResendLoading(false);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Clock className="h-16 w-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
      case 'expired':
        return <AlertCircle className="h-16 w-16 text-red-500" />;
      default:
        return <Clock className="h-16 w-16 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
      case 'expired':
        return 'text-red-600';
      case 'loading':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TOIT Nexus</h1>
          <p className="text-gray-600">Verificação de Email</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              {getStatusIcon()}
            </div>
            
            <CardTitle className={`text-2xl font-semibold ${getStatusColor()}`}>
              {status === 'loading' && 'Verificando email...'}
              {status === 'success' && 'Email verificado!'}
              {status === 'error' && 'Erro na verificação'}
              {status === 'expired' && 'Link expirado'}
            </CardTitle>
            
            <CardDescription className="text-center">
              {message}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
              {status === 'success' && (
                <div className="text-center space-y-4">
                  {accountActivated ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">🎉 Conta totalmente ativada!</p>
                      <p className="text-green-600 text-sm mt-1">
                        Você já pode fazer login e usar a plataforma.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 font-medium">📱 Verificação de telefone pendente</p>
                      <p className="text-yellow-600 text-sm mt-1">
                        Para ativar completamente sua conta, verifique seu telefone.
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => window.location.href = accountActivated ? '/login' : `/verify-phone?userId=${userId}`}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    {accountActivated ? 'Fazer Login' : 'Verificar Telefone'}
                  </Button>
                </div>
              )}

              {(status === 'error' || status === 'expired') && (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">
                      {status === 'expired' 
                        ? 'O link de verificação expirou. Solicite um novo email.'
                        : 'Houve um problema na verificação do seu email.'
                      }
                    </p>
                  </div>
                  
                  {userId && (
                    <Button 
                      onClick={handleResendEmail}
                      disabled={resendLoading}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      {resendLoading ? 'Reenviando...' : 'Reenviar Email'}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                    className="w-full"
                  >
                    Voltar ao Início
                  </Button>
                </div>
              )}

              {status === 'loading' && (
                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    Aguarde enquanto verificamos seus dados...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trial info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              🎁 <strong>Trial de 7 dias ativo!</strong><br />
              Após verificação, você terá acesso completo à plataforma.
            </p>
          </div>
        </div>
      </div>
    
  )
  
};

export default VerifyEmail;