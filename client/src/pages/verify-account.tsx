import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Mail, 
  Phone, 
  Clock,
  RefreshCw,
  AlertCircle,
  Zap
} from 'lucide-react';

export default function VerifyAccount() {
  const [verificationStatus, setVerificationStatus] = useState({
    email: false,
    phone: false
  });
  const [phoneCode, setPhoneCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);

  // Verificar se há dados do usuário recém-criado
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const email = urlParams.get('email');
    const phone = urlParams.get('phone');
    
    if (userId && email && phone) {
      setUser({ userId, email, phone });
    } else {
      // Redirecionar se não há dados de verificação
      window.location.href = '/login';
    }
  }, []);

  // Verificar token de email automaticamente se presente na URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailToken = urlParams.get('token');
    
    if (emailToken) {
      verifyEmailToken(emailToken);
    }
  }, []);

  // Countdown para reenvio
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const verifyEmailToken = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email/${token}`);
      const result = await response.json();
      
      if (result.success) {
        setVerificationStatus(prev => ({ ...prev, email: true }));
        setMessage('Email verificado com sucesso!');
        
        if (result.accountActivated) {
          setTimeout(() => {
            window.location.href = '/login?verified=true';
          }, 2000);
        }
      } else {
        setMessage(result.message || 'Token de email inválido');
      }
    } catch (error) {
      setMessage('Erro ao verificar email');
    }
  };

  const verifyPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneCode || phoneCode.length !== 6) {
      setMessage('Código deve ter 6 dígitos');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user?.phone,
          code: phoneCode
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setVerificationStatus(prev => ({ ...prev, phone: true }));
        setMessage('Telefone verificado com sucesso!');
        
        if (result.accountActivated) {
          setTimeout(() => {
            window.location.href = '/login?verified=true';
          }, 2000);
        }
      } else {
        setMessage(result.message || 'Código inválido');
      }
    } catch (error) {
      setMessage('Erro ao verificar código');
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (type: 'email' | 'phone') => {
    setCountdown(60); // 60 segundos de cooldown
    
    try {
      // TODO: Implementar reenvio
      setMessage(`Código ${type === 'email' ? 'de email' : 'SMS'} reenviado!`);
    } catch (error) {
      setMessage('Erro ao reenviar código');
    }
  };

  const accountActivated = verificationStatus.email && verificationStatus.phone;

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
          {/* Status da Conta */}
          <div className="text-center mb-8">
            <div className="mb-4">
              {accountActivated ? (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="h-10 w-10 text-blue-600" />
                </div>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {accountActivated ? 'Conta Ativada!' : 'Verifique sua Conta'}
            </h1>
            
            <p className="text-gray-600 mb-4">
              {accountActivated 
                ? 'Sua conta foi ativada com sucesso. Redirecionando para login...'
                : 'Para ativar sua conta, verifique seu email e telefone'
              }
            </p>

            {user && (
              <div className="text-sm text-gray-500">
                Conta criada para: <strong>{user.email}</strong>
              </div>
            )}
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('sucesso') || message.includes('reenviado')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <div className="flex items-center">
                {message.includes('sucesso') ? 
                  <CheckCircle className="h-5 w-5 mr-2" /> : 
                  <AlertCircle className="h-5 w-5 mr-2" />
                }
                {message}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Verificação de Email */}
            <Card className={`relative ${verificationStatus.email ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className={`h-6 w-6 ${verificationStatus.email ? 'text-green-600' : 'text-gray-600'}`} />
                    <CardTitle className="text-lg">Verificação de Email</CardTitle>
                  </div>
                  {verificationStatus.email && (
                    <Badge className="bg-green-600">
                      Verificado
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Clique no link enviado para seu email
                </CardDescription>
              </CardHeader>
              <CardContent>
                {verificationStatus.email ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Email verificado com sucesso!
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Um link de verificação foi enviado para:
                      <br />
                      <strong>{user?.email}</strong>
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => resendVerification('email')}
                      disabled={countdown > 0}
                      className="w-full"
                    >
                      {countdown > 0 ? (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          Reenviar em {countdown}s
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reenviar Email
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verificação de Telefone */}
            <Card className={`relative ${verificationStatus.phone ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Phone className={`h-6 w-6 ${verificationStatus.phone ? 'text-green-600' : 'text-gray-600'}`} />
                    <CardTitle className="text-lg">Verificação de Telefone</CardTitle>
                  </div>
                  {verificationStatus.phone && (
                    <Badge className="bg-green-600">
                      Verificado
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Digite o código enviado via SMS
                </CardDescription>
              </CardHeader>
              <CardContent>
                {verificationStatus.phone ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Telefone verificado com sucesso!
                  </div>
                ) : (
                  <form onSubmit={verifyPhoneCode} className="space-y-4">
                    <div>
                      <Label htmlFor="phoneCode">Código SMS</Label>
                      <Input
                        id="phoneCode"
                        type="text"
                        placeholder="000000"
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Código enviado para: <strong>{user?.phone}</strong>
                      </p>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading || phoneCode.length !== 6}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Verificando...
                        </div>
                      ) : (
                        'Verificar Código'
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => resendVerification('phone')}
                      disabled={countdown > 0}
                      className="w-full"
                    >
                      {countdown > 0 ? (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          Reenviar em {countdown}s
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reenviar SMS
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Próximos Passos */}
          {accountActivated && (
            <Card className="mt-6 border-green-500 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Conta Ativada com Sucesso!
                  </h3>
                  <p className="text-green-700 mb-4">
                    Sua conta foi verificada e está pronta para uso. 
                    Você será redirecionado para fazer login em alguns segundos.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/login?verified=true'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Fazer Login Agora
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ajuda */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Problemas com a verificação? 
              <a href="mailto:suporte@toit.com.br" className="text-blue-600 hover:underline ml-1">
                Entre em contato com nosso suporte
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}