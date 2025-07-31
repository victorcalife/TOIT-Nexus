import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartLine, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UnifiedHeader } from "@/components/unified-header";
import workflowLogo from "@/assets/SELOtoit-workflow-logo.svg";
import toitNexusLogo from "@/assets/toit-nexus-logo.svg";

export default function Login() {
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
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${userData.firstName}!`,
        });
        
        // Redirect based on user role
        if (userData.role === 'super_admin') {
          window.location.href = '/admin/dashboard';
        } else if (userData.tenantId) {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/select-tenant';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <UnifiedHeader 
        title="TOIT-Nexus" 
        subtitle="Plataforma de Automação Empresarial"
      />
      
      <div className="flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">
          {/* Logo no container de login */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src={workflowLogo} 
                alt="TOIT Workflow" 
                className="h-20 w-auto opacity-90"
              />
            </div>
            <p className="text-gray-600 mt-2">
              Faça login em sua conta
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold text-center">
                Entrar na Plataforma
              </CardTitle>
              <CardDescription className="text-center">
                Digite seu CPF e senha para acessar a plataforma TOIT Nexus
              </CardDescription>
            </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  maxLength={14}
                  className="text-lg"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-lg pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary-500 hover:bg-primary-600 text-lg py-6"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <button 
                  className="text-primary-500 hover:text-primary-600 font-medium"
                  onClick={() => window.location.href = '/'}
                >
                  Entre em contato
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}