import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Smartphone, Clock, AlertCircle } from "lucide-react";
import { StandardHeader } from "@/components/standard-header";
import { useToast } from "@/hooks/use-toast";
import workflowLogo from "@/assets/SELOtoit-workflow-logo.svg";

export default function VerifyPhone() {
  const [verificationCode, setVerificationCode] = useState('');
  const [userId, setUserId] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [accountActivated, setAccountActivated] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userIdParam = urlParams.get('userId');
    const phoneParam = urlParams.get('phone');

    if (userIdParam) {
      setUserId(userIdParam);
    }
    
    if (phoneParam) {
      setPhone(phoneParam);
    }

    // Iniciar countdown de 60 segundos para reenvio
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || !userId) {
      toast({
        title: "Erro",
        description: "Código de verificação é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (verificationCode.length !== 6) {
      toast({
        title: "Código inválido",
        description: "O código deve ter 6 dígitos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/trial/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          code: verificationCode
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsVerified(true);
        setAccountActivated(result.accountActivated);
        
        toast({
          title: "Telefone verificado!",
          description: result.accountActivated 
            ? "Sua conta foi ativada com sucesso!"
            : "Telefone verificado. Aguardando verificação de email.",
        });

        // Redirecionar após 3 segundos
        setTimeout(() => {
          if (result.accountActivated) {
            window.location.href = '/login?verified=true&activated=true';
          } else {
            window.location.href = '/verify-email?userId=' + userId;
          }
        }, 3000);

      } else {
        toast({
          title: "Código inválido",
          description: result.message || "Código incorreto ou expirado",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro na verificação:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível verificar o código. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendSMS = async () => {
    if (!userId || resendLoading || countdown > 0) return;

    setResendLoading(true);
    try {
      const response = await fetch('/api/trial/resend-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          phone: phone
        })
      });

      if (response.ok) {
        toast({
          title: "SMS reenviado",
          description: "Novo código enviado para seu telefone",
        });
        
        // Reiniciar countdown
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível reenviar o SMS",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível reenviar o SMS",
        variant: "destructive",
      });
    }
    setResendLoading(false);
  };

  const formatCode = (value: string) => {
    // Apenas números, máximo 6 dígitos
    return value.replace(/\D/g, '').slice(0, 6);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCode(e.target.value);
    setVerificationCode(formatted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <StandardHeader showLoginButton={false} />
      
      <div className="flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src={workflowLogo} 
                alt="TOIT Workflow" 
                className="h-20 w-auto opacity-90"
              />
            </div>
            <p className="text-gray-600 mt-2">
              {isVerified ? "Telefone verificado!" : "Verificação de telefone"}
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                {isVerified ? (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                ) : (
                  <Smartphone className="h-16 w-16 text-blue-500" />
                )}
              </div>
              
              <CardTitle className={`text-2xl font-semibold ${isVerified ? 'text-green-600' : 'text-blue-600'}`}>
                {isVerified ? "Verificação concluída!" : "Digite o código SMS"}
              </CardTitle>
              
              <CardDescription className="text-center">
                {isVerified ? (
                  accountActivated ? (
                    "Sua conta foi ativada com sucesso! Redirecionando..."
                  ) : (
                    "Telefone verificado. Aguardando verificação de email."
                  )
                ) : (
                  <>
                    Enviamos um código de 6 dígitos para o telefone
                    {phone && <><br /><strong>{phone}</strong></>}
                  </>
                )}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!isVerified ? (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Código de verificação</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={handleCodeChange}
                      maxLength={6}
                      className="text-center text-2xl tracking-widest font-mono"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-lg py-6"
                    disabled={isLoading || verificationCode.length !== 6}
                  >
                    {isLoading ? "Verificando..." : "Verificar Código"}
                  </Button>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">
                      Não recebeu o código?
                    </p>
                    
                    {countdown > 0 ? (
                      <p className="text-sm text-gray-500">
                        Reenviar em {countdown}s
                      </p>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleResendSMS}
                        disabled={resendLoading}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        {resendLoading ? "Reenviando..." : "Reenviar SMS"}
                      </Button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  {accountActivated ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">🎉 Conta totalmente ativada!</p>
                      <p className="text-green-600 text-sm mt-1">
                        Redirecionando para login em 3 segundos...
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 font-medium">📧 Email pendente</p>
                      <p className="text-yellow-600 text-sm mt-1">
                        Verificação de telefone concluída. Agora verifique seu email.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-center">
                    <Clock className="h-6 w-6 text-gray-400 animate-spin" />
                  </div>
                </div>
              )}

              {!isVerified && (
                <div className="mt-6 text-center">
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                    className="text-sm"
                  >
                    Voltar ao Início
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trial info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              🎁 <strong>Trial de 7 dias ativo!</strong><br />
              Complete a verificação para acessar a plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}