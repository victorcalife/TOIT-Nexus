import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import workflowLogo from "@/assets/SELOtoit-workflow-logo.svg";

export default function SupportLogin() {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const formatCpf = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Apply CPF formatting: 123.456.789-01
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }
    return numbers.slice(0, 11)
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value);
    setCpf(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cpf || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ''), // Remove formatting for API
          password,
          loginType: 'support' // Identificar como login de suporte
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Verificar se o usuário tem permissão de suporte
        if (userData.role !== 'super_admin' && userData.role !== 'toit_admin') {
          toast({
            title: "Acesso Negado",
            description: "Apenas membros da equipe TOIT podem acessar esta área.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo à área de suporte, ${userData.firstName}!`,
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
          title: "Erro no login",
          description: errorData.message || "CPF ou senha incorretos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Tente novamente.",
        variant: "destructive",
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
              className="text-purple-300 hover:text-white hover:bg-purple-800/50"
              onClick={() => window.location.href = '/login'}
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
                    className="text-lg bg-white/10 border-purple-300/30 text-white placeholder:text-purple-300/70 focus:border-purple-400 focus:ring-purple-400"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-purple-100">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="text-lg pr-12 bg-white/10 border-purple-300/30 text-white placeholder:text-purple-300/70 focus:border-purple-400 focus:ring-purple-400"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-purple-300 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg py-6 shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Autenticando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Acessar Portal de Suporte</span>
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-purple-300">
                  <Shield className="h-4 w-4" />
                  <span>Área restrita - Apenas equipe TOIT</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rodapé informativo */}
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