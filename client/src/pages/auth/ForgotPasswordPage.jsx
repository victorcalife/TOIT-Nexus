import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import {  
  Mail, 
  ArrowLeft, 
  AlertCircle,
  CheckCircle,
  Send
} from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Por favor, insira seu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um email válido');
      return;
    }

    setIsLoading(true);

    try {
      // Simular envio de email
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess('Email de recuperação enviado com sucesso!');
      setEmailSent(true);
    } catch (err) {
      setError(err.message || 'Erro ao enviar email de recuperação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Simular reenvio de email
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess('Email reenviado com sucesso!');
    } catch (err) {
      setError('Erro ao reenviar email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Recuperar Senha</h1>
          <p className="text-gray-600 mt-2">
            {emailSent 
              ? 'Verifique seu email para continuar'
              : 'Insira seu email para receber instruções de recuperação'
            }
          </p>
        </div>

        {/* Forgot Password Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {emailSent ? 'Email Enviado' : 'Esqueceu a Senha?'}
            </CardTitle>
            <CardDescription className="text-center">
              {emailSent 
                ? 'Enviamos instruções para recuperar sua senha'
                : 'Não se preocupe, isso acontece com todos'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Instruções
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="text-center space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-green-800">
                      Enviamos um email para <strong>{email}</strong> com instruções para redefinir sua senha.
                    </p>
                  </div>

                  <div className="text-sm text-gray-600 space-y-2">
                    <p>Não recebeu o email?</p>
                    <ul className="list-disc list-inside text-left space-y-1">
                      <li>Verifique sua caixa de spam</li>
                      <li>Aguarde alguns minutos</li>
                      <li>Verifique se o email está correto</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={handleResendEmail}
                    variant="outline" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Reenviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Reenviar Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Lembrou da senha?{' '}
                <Link to="/login" className="text-blue-600 hover:underline font-medium">
                  Fazer login
                </Link>
              </p>
            </div>

            {/* Back to Home */}
            <div className="mt-4 text-center">
              <Link 
                to="/" 
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar ao início
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Precisa de ajuda?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Se você continuar tendo problemas para acessar sua conta, nossa equipe de suporte está aqui para ajudar.
              </p>
              <Link 
                to="/support" 
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Entrar em contato com o suporte
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 TOIT Nexus. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;