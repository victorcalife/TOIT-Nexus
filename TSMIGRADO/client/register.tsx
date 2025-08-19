import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Building, User, Mail, Lock, Phone } from "lucide-react";
import { UnifiedHeader } from "@/components/unified-header";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [formData, setFormData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const trial = urlParams.get('trial') === 'true';
    const email = urlParams.get('email');
    
    setIsTrial(trial);
    if (email) {
      setFormData(prev => ({ ...prev, email: decodeURIComponent(email) }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          isTrial
        }),
      });

      if (response.ok) {
        toast({
          title: "Conta criada com sucesso!",
          description: isTrial ? "Seu teste gratuito de 7 dias começou!" : "Bem-vindo ao TOIT Nexus!",
        });
        
        // Redirect to onboarding or dashboard
        window.location.href = '/onboarding';
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro no cadastro",
          description: errorData.message || "Não foi possível criar a conta.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <UnifiedHeader />
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            {isTrial && (
              <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
                🎉 Teste Gratuito por 7 Dias
              </Badge>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {isTrial ? "Comece seu teste gratuito" : "Crie sua conta"}
            </h1>
            <p className="text-gray-600">
              Configure sua empresa e comece a automatizar em minutos
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Registration Form */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Informações da Conta</CardTitle>
                <CardDescription>
                  Preencha os dados para criar sua conta no TOIT Nexus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Company Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Dados da Empresa
                    </h3>
                    
                    <div>
                      <Label htmlFor="companyName">Nome da Empresa</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        type="text"
                        placeholder="Sua Empresa Ltda"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Seus Dados
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nome</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          placeholder="Seu nome"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Sobrenome</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          placeholder="Seu sobrenome"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Security */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Segurança
                    </h3>
                    
                    <div>
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={handleInputChange}
                        minLength={8}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Digite a senha novamente"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        minLength={8}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting 
                      ? "Criando conta..." 
                      : isTrial 
                        ? "Iniciar Teste Grátis" 
                        : "Criar Conta"
                    }
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Já tem uma conta?{" "}
                    <button 
                      className="text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => window.location.href = '/login'}
                    >
                      Fazer login
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Benefits Sidebar */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">
                    {isTrial ? "Incluso no seu teste:" : "O que você terá:"}
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="text-sm">Workflows ilimitados</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="text-sm">Query Builder visual e intuitivo</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="text-sm">Dashboards personalizáveis</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="text-sm">Notificações em tempo real</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="text-sm">IA regenerativa e adaptativa</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="text-sm">Workspace pessoal configurável</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="text-sm">Suporte técnico dedicado</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {isTrial && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-green-800 mb-2">
                      🎯 Teste sem riscos
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Sem cartão de crédito necessário</li>
                      <li>• Cancele a qualquer momento</li>
                      <li>• Acesso completo por 7 dias</li>
                      <li>• Suporte prioritário</li>
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">🔒 Segurança Enterprise</h4>
                  <p className="text-sm text-gray-600">
                    Seus dados estão protegidos com criptografia de ponta, 
                    backups automáticos e conformidade com LGPD.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}