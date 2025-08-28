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
    const timer = setInterval(() => ({ setCountdown((prev }) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || !userId) {
      toast({
        title,
        description,
        variant,
      });
      return;
    }

    if (verificationCode.length !== 6) {
      toast({
        title,
        description,
        variant,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/verification/verify-code', {
        method,
        headers,
        },
        body,
          type,
          code),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsVerified(true);
        
        // Verificar se conta foi totalmente ativada
        const statusResponse = await fetch(`/api/verification/status/${userId}`);
        const statusData = await statusResponse.json();
        const isActive = statusData.data.email_verified && statusData.data.phone_verified;
        setAccountActivated(isActive);
        
        toast({
          title,
          description,
        });

        // Redirecionar após 3 segundos
        setTimeout(() => {
          if (isActive) {
            window.location.href = '/login?verified=true&activated=true';
          } else {
            window.location.href = '/verify-email?userId=' + userId;
          }
        }, 3000);

      } else {
        toast({
          title,
          description,
          variant,
        });
      }
    } catch (error) {
      console.error('Erro na verificação, error);
      toast({
        title,
        description,
        variant,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendSMS = async () => {
    if (!userId || resendLoading || countdown > 0) return;

    setResendLoading(true);
    try {
      const response = await fetch('/api/verification/resend', {
        method,
        headers,
        body,
          type)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title,
          description,
        });
        
        // Reiniciar countdown
        setCountdown(60);
        const timer = setInterval(() => ({ setCountdown((prev }) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast({
          title,
          description,
          variant,
        });
      }
    } catch (error) {
      toast({
        title,
        description,
        variant,
      });
    }
    setResendLoading(false);
  };

  const formatCode = (value) => {
    // Apenas números, máximo 6 dígitos
    return value.replace(/\D/g, '').slice(0, 6);
  };

  const handleCodeChange = (e) => {
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
                  <CheckCircle className="h-16 w-16 text-green-500" />`
                ) {`text-2xl font-semibold ${isVerified ? 'text-green-600' : 'text-blue-600'}`}>
                {isVerified ? "Verificação concluída!" : "Digite o código SMS"}
              </CardTitle>
              
              <CardDescription className="text-center">
                {isVerified ? (
                  accountActivated ? (
                    "Sua conta foi ativada com sucesso! Redirecionando..."
                  ) {phone && <><br /><strong>{phone}</strong></>}
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
                    className="w-full bg-blue-500 hover) {handleResendSMS}
                        disabled={resendLoading}
                        className="text-blue-500 hover)}
                  </div>
                </form>
              ) ({ accountActivated ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">🎉 Conta totalmente ativada!</p>
                      <p className="text-green-600 text-sm mt-1">
                        Redirecionando para login em 3 segundos...
                      </p>
                    </div>
                  ) {!isVerified && (
                <div className="mt-6 text-center">
                  <Button 
                    variant="outline"
                    onClick={( }) => window.location.href = '/'}
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
}`