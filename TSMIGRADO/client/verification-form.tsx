/**
 * VERIFICATION FORM - Componente completo para verificação Email/Telefone
 * Funcionalidades: Envio códigos, validação, reenvio, timer, UX premium
 * Integração: APIs backend + Estados gerenciados + Feedback visual
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mail, 
  Phone, 
  Send, 
  Check, 
  Clock, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';

interface VerificationStatus {
  email_verified: boolean;
  phone_verified: boolean;
  has_email: boolean;
  has_phone: boolean;
}

interface VerificationFormProps {
  onVerificationComplete?: () => void;
  showTitle?: boolean;
  mode?: 'email' | 'phone' | 'both';
  email?: string;
  phone?: string;
}

export default function VerificationForm({ 
  onVerificationComplete, 
  showTitle = true, 
  mode = 'both',
  email: initialEmail = '',
  phone: initialPhone = ''
}: VerificationFormProps) {
  const { toast } = useToast();
  
  // Estados gerais
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);
  const [phoneTimer, setPhoneTimer] = useState(0);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  // Query para status de verificação
  const { data: verificationStatus, refetch: refetchStatus } = useQuery<VerificationStatus>({
    queryKey: ['/api/verification/status'],
    retry: false
  });

  // Mutations para envio de códigos
  const sendEmailMutation = useMutation({
    mutationFn: async (emailAddress: string) => {
      return await apiRequest('/api/verification/send-email', 'POST', { email: emailAddress });
    },
    onSuccess: (data) => {
      setEmailSent(true);
      setEmailTimer(600); // 10 minutos em segundos
      toast({
        title: "Código enviado!",
        description: "Verifique sua caixa de entrada e spam",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar email",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const sendPhoneMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      return await apiRequest('/api/verification/send-phone', 'POST', { phone: phoneNumber });
    },
    onSuccess: (data) => {
      setPhoneSent(true);
      setPhoneTimer(600); // 10 minutos em segundos
      toast({
        title: "SMS enviado!",
        description: "Verifique suas mensagens",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar SMS",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutations para verificação
  const verifyEmailMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest('/api/verification/verify', 'POST', { type: 'email', code });
    },
    onSuccess: (data) => {
      setIsEmailVerified(true);
      setEmailCode('');
      toast({
        title: "Email verificado!",
        description: "Seu email foi confirmado com sucesso",
      });
      refetchStatus();
      checkCompleteVerification();
    },
    onError: (error: any) => {
      toast({
        title: "Código inválido",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const verifyPhoneMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest('/api/verification/verify', 'POST', { type: 'phone', code });
    },
    onSuccess: (data) => {
      setIsPhoneVerified(true);
      setPhoneCode('');
      toast({
        title: "Telefone verificado!",
        description: "Seu telefone foi confirmado com sucesso",
      });
      refetchStatus();
      checkCompleteVerification();
    },
    onError: (error: any) => {
      toast({
        title: "Código inválido",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutations para reenvio
  const resendEmailMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/verification/resend', 'POST', { type: 'email' });
    },
    onSuccess: () => {
      setEmailTimer(600);
      toast({
        title: "Código reenviado!",
        description: "Novo código enviado por email",
      });
    }
  });

  const resendPhoneMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/verification/resend', 'POST', { type: 'phone' });
    },
    onSuccess: () => {
      setPhoneTimer(600);
      toast({
        title: "SMS reenviado!",
        description: "Novo código enviado por SMS",
      });
    }
  });

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      if (emailTimer > 0) {
        setEmailTimer(prev => prev - 1);
      }
      if (phoneTimer > 0) {
        setPhoneTimer(prev => prev - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [emailTimer, phoneTimer]);

  // Verificar se verificação está completa
  const checkCompleteVerification = () => {
    const emailDone = mode === 'phone' || isEmailVerified || verificationStatus?.email_verified;
    const phoneDone = mode === 'email' || isPhoneVerified || verificationStatus?.phone_verified;
    
    if (emailDone && phoneDone && onVerificationComplete) {
      onVerificationComplete();
    }
  };

  // Atualizar status quando dados chegarem
  useEffect(() => {
    if (verificationStatus) {
      setIsEmailVerified(verificationStatus.email_verified);
      setIsPhoneVerified(verificationStatus.phone_verified);
    }
  }, [verificationStatus]);

  // Formatação de telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendEmail = () => {
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Digite seu email para continuar",
        variant: "destructive",
      });
      return;
    }
    sendEmailMutation.mutate(email);
  };

  const handleSendPhone = () => {
    if (!phone) {
      toast({
        title: "Telefone obrigatório",
        description: "Digite seu telefone para continuar",
        variant: "destructive",
      });
      return;
    }
    sendPhoneMutation.mutate(phone.replace(/\D/g, ''));
  };

  const handleVerifyEmail = () => {
    if (emailCode.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Digite o código de 6 dígitos",
        variant: "destructive",
      });
      return;
    }
    verifyEmailMutation.mutate(emailCode);
  };

  const handleVerifyPhone = () => {
    if (phoneCode.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Digite o código de 6 dígitos",
        variant: "destructive",
      });
      return;
    }
    verifyPhoneMutation.mutate(phoneCode);
  };

  const progress = () => {
    let completed = 0;
    let total = 0;
    
    if (mode === 'both' || mode === 'email') {
      total++;
      if (isEmailVerified || verificationStatus?.email_verified) completed++;
    }
    
    if (mode === 'both' || mode === 'phone') {
      total++;
      if (isPhoneVerified || verificationStatus?.phone_verified) completed++;
    }
    
    return (completed / total) * 100;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        {showTitle && (
          <>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Verificação de Conta
            </CardTitle>
            <div className="space-y-2">
              <Progress value={progress()} className="w-full" />
              <p className="text-sm text-gray-600">
                {Math.round(progress())}% concluído
              </p>
            </div>
          </>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Verificação de Email */}
        {(mode === 'both' || mode === 'email') && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <Label>Verificação de Email</Label>
              {(isEmailVerified || verificationStatus?.email_verified) && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>
              )}
            </div>
            
            {!(isEmailVerified || verificationStatus?.email_verified) && (
              <>
                {!emailSent ? (
                  <div className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Digite seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button 
                      onClick={handleSendEmail}
                      disabled={sendEmailMutation.isPending}
                      className="w-full"
                    >
                      {sendEmailMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Enviar Código por Email
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Alert>
                      <Mail className="h-4 w-4" />
                      <AlertDescription>
                        Código enviado para <strong>{email}</strong>
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="000000"
                        value={emailCode}
                        onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-lg tracking-widest"
                      />
                      <Button 
                        onClick={handleVerifyEmail}
                        disabled={verifyEmailMutation.isPending || emailCode.length !== 6}
                      >
                        {verifyEmailMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      {emailTimer > 0 ? (
                        <div className="flex items-center gap-1 text-orange-600">
                          <Clock className="w-3 h-3" />
                          {formatTime(emailTimer)}
                        </div>
                      ) : (
                        <Button 
                          variant="link" 
                          size="sm"
                          onClick={() => resendEmailMutation.mutate()}
                          disabled={resendEmailMutation.isPending}
                        >
                          Reenviar código
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Verificação de Telefone */}
        {(mode === 'both' || mode === 'phone') && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <Label>Verificação de Telefone</Label>
              {(isPhoneVerified || verificationStatus?.phone_verified) && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>
              )}
            </div>
            
            {!(isPhoneVerified || verificationStatus?.phone_verified) && (
              <>
                {!phoneSent ? (
                  <div className="space-y-3">
                    <Input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formatPhone(phone)}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <Button 
                      onClick={handleSendPhone}
                      disabled={sendPhoneMutation.isPending}
                      className="w-full"
                    >
                      {sendPhoneMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Enviar Código por SMS
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Alert>
                      <Phone className="h-4 w-4" />
                      <AlertDescription>
                        SMS enviado para <strong>{formatPhone(phone)}</strong>
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="000000"
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-lg tracking-widest"
                      />
                      <Button 
                        onClick={handleVerifyPhone}
                        disabled={verifyPhoneMutation.isPending || phoneCode.length !== 6}
                      >
                        {verifyPhoneMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      {phoneTimer > 0 ? (
                        <div className="flex items-center gap-1 text-orange-600">
                          <Clock className="w-3 h-3" />
                          {formatTime(phoneTimer)}
                        </div>
                      ) : (
                        <Button 
                          variant="link" 
                          size="sm"
                          onClick={() => resendPhoneMutation.mutate()}
                          disabled={resendPhoneMutation.isPending}
                        >
                          Reenviar SMS
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Status de Progresso */}
        {progress() === 100 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Verificação completa!</strong> Sua conta foi verificada com sucesso.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}