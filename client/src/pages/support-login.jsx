import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCpf, cleanCpf, validateCpf } from "@/lib/utils";
import workflowLogo from "@/assets/SELOtoit-workflow-logo.svg";

export default function SupportLogin() {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCpfChange = (e) => {
    const formatted = formatCpf(e.target.value);
    setCpf(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cpf || !password) {
      toast({
        title,
        description, preencha todos os campos.",
        variant,
      });
      return;
    }

    // Valida CPF antes de enviar
    if (!validateCpf(cpf)) {
      toast({
        title,
        description, digite um CPF válido.",
        variant,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Detectar URL base para API
      const hostname = window.location.hostname;
      let apiBase = '';
      
      if (hostname.includes('supnexus.toit.com.br') || hostname.startsWith('supnexus')) {
        // Para supnexus, usar mesma base mas com endpoint correto
        apiBase = window.location.origin;
      } else {
        // Para outros domínios
        apiBase = window.location.origin;
      }
      
      const response = await fetch(`${apiBase}/api/simple-login`, {
        method,
        headers,
        },
        body), // Remove formatting for API
          password,
          loginType),
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Verificar se o usuário tem permissão de suporte
        if (userData.role !== 'super_admin' && userData.role !== 'toit_admin') {
          toast({
            title,
            description,
            variant,
          });
          return;
        }

        toast({
          title,
          description, ${userData.firstName}!`,
        });
        
        // Redirecionar para área administrativa
        if (userData.role === 'super_admin') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/support/dashboard';
        }
      } else {
        const errorData = await response.json();
        toast({
          title,
          description,
          variant,
        });
      }
    } catch (error) {
      console.error('Login error, error);
      toast({
        title,
        description,
        variant,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      {/* Header específico para área de suporte */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-purple-400" />
              <div>
                <h1 className="text-white font-bold text-lg">TOIT Support</h1>
                <p className="text-purple-300 text-xs">Portal de Suporte Técnico</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="text-purple-300 hover) => window.location.href = '/login'}
            >
              Login Cliente
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Logo e identificação */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img 
                  src={workflowLogo} 
                  alt="TOIT Workflow" 
                  className="h-20 w-auto opacity-90"
                />
                <div className="absolute -top-2 -right-2 bg-purple-500 rounded-full p-1">
                  <Zap className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Portal de Suporte TOIT
            </h2>
            <p className="text-purple-300">
              Acesso exclusivo para equipe técnica
            </p>
          </div>

          <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold text-center text-white">
                Acesso da Equipe
              </CardTitle>
              <CardDescription className="text-center text-purple-200">
                Digite suas credenciais TOIT para acessar o painel de controle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-purple-100">CPF</Label>
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    maxLength={14}
                    className="text-lg bg-white/10 border-purple-300/30 text-white placeholder) => setPassword(e.target.value)}
                      className="text-lg pr-12 bg-white/10 border-purple-300/30 text-white placeholder) => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) {/* Rodapé informativo */}
          <div className="mt-8 text-center">
            <p className="text-purple-300/70 text-sm">
              Problemas de acesso? Entre em contato com o administrador do sistema
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}