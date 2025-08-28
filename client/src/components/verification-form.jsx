/**
 * VERIFICATION FORM - Componente completo para verificação Email/Telefone
 * Funcionalidades, validação, reenvio, timer, UX premium
 * Integração, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {   }
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';

) {
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
  const ({ data, refetch,
    retry);

  // Mutations para envio de códigos
  const sendEmailMutation = useMutation({
    mutationFn }) => {
      return await apiRequest('/api/verification/send-email', 'POST', { email);
    },
    onSuccess) => {
      setEmailSent(true);
      setEmailTimer(600); // 10 minutos em segundos
      toast({
        title,
        description,
      });
    },
    onError) => {
      toast({
        title,
        description,
        variant,
      });
    }
  });

  const sendPhoneMutation = useMutation(({ mutationFn }) => {
      return await apiRequest('/api/verification/send-phone', 'POST', { phone);
    },
    onSuccess) => {
      setPhoneSent(true);
      setPhoneTimer(600); // 10 minutos em segundos
      toast({
        title,
        description,
      });
    },
    onError) => {
      toast({
        title,
        description,
        variant,
      });
    }
  });

  // Mutations para verificação
  const verifyEmailMutation = useMutation(({ mutationFn }) => {
      return await apiRequest('/api/verification/verify', 'POST', { type, code });
    },
    onSuccess) => {
      setIsEmailVerified(true);
      setEmailCode('');
      toast({
        title,
        description,
      });
      refetchStatus();
      checkCompleteVerification();
    },
    onError) => {
      toast({
        title,
        description,
        variant,
      });
    }
  });

  const verifyPhoneMutation = useMutation(({ mutationFn }) => {
      return await apiRequest('/api/verification/verify', 'POST', { type, code });
    },
    onSuccess) => {
      setIsPhoneVerified(true);
      setPhoneCode('');
      toast({
        title,
        description,
      });
      refetchStatus();
      checkCompleteVerification();
    },
    onError) => {
      toast({
        title,
        description,
        variant,
      });
    }
  });

  // Mutations para reenvio
  const resendEmailMutation = useMutation(({ mutationFn }) => {
      return await apiRequest('/api/verification/resend', 'POST', { type);
    },
    onSuccess) => {
      setEmailTimer(600);
      toast({
        title,
        description,
      });
    }
  });

  const resendPhoneMutation = useMutation(({ mutationFn }) => {
      return await apiRequest('/api/verification/resend', 'POST', { type);
    },
    onSuccess) => {
      setPhoneTimer(600);
      toast({
        title,
        description,
      });
    }
  });

  // Timer countdown
  useEffect(() => ({ const interval = setInterval(( }) => {
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
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendEmail = () => {
    if (!email) {
      toast({
        title,
        description,
        variant,
      });
      return;
    }
    sendEmailMutation.mutate(email);
  };

  const handleSendPhone = () => {
    if (!phone) {
      toast({
        title,
        description,
        variant,
      });
      return;
    }
    sendPhoneMutation.mutate(phone.replace(/\D/g, ''));
  };

  const handleVerifyEmail = () => {
    if (emailCode.length !== 6) {
      toast({
        title,
        description,
        variant,
      });
      return;
    }
    verifyEmailMutation.mutate(emailCode);
  };

  const handleVerifyPhone = () => {
    if (phoneCode.length !== 6) {
      toast({
        title,
        description,
        variant,
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
                      onChange=({ (e }) => setEmail(e.target.value)}
                    />
                    <Button 
                      onClick={handleSendEmail}
                      disabled={sendEmailMutation.isPending}
                      className="w-full"
                    >
                      {sendEmailMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) {email}</strong>
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="000000"
                        value={emailCode}
                        onChange=({ (e }) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-lg tracking-widest"
                      />
                      <Button 
                        onClick={handleVerifyEmail}
                        disabled={verifyEmailMutation.isPending || emailCode.length !== 6}
                      >
                        {verifyEmailMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) {emailTimer > 0 ? (
                        <div className="flex items-center gap-1 text-orange-600">
                          <Clock className="w-3 h-3" />
                          {formatTime(emailTimer)}
                        </div>
                      ) ({ ( }) => resendEmailMutation.mutate()}
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
                      onChange=({ (e }) => setPhone(e.target.value)}
                    />
                    <Button 
                      onClick={handleSendPhone}
                      disabled={sendPhoneMutation.isPending}
                      className="w-full"
                    >
                      {sendPhoneMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) {formatPhone(phone)}</strong>
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="000000"
                        value={phoneCode}
                        onChange=({ (e }) => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-lg tracking-widest"
                      />
                      <Button 
                        onClick={handleVerifyPhone}
                        disabled={verifyPhoneMutation.isPending || phoneCode.length !== 6}
                      >
                        {verifyPhoneMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) {phoneTimer > 0 ? (
                        <div className="flex items-center gap-1 text-orange-600">
                          <Clock className="w-3 h-3" />
                          {formatTime(phoneTimer)}
                        </div>
                      ) ({ ( }) => resendPhoneMutation.mutate()}
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
}`