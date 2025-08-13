import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Gift, Shield, Clock, CheckCircle } from "lucide-react";
import { StandardHeader } from "@/components/standard-header";
import { useToast } from "@/hooks/use-toast";
import workflowLogo from "@/assets/SELOtoit-workflow-logo.svg";

export default function TrialSignup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    cpf: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    if (name === 'cpf') {
      // Formatação CPF: 000.000.000-00
      formattedValue = value.replace(/\D/g, '').slice(0, 11);
      formattedValue = formattedValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (name === 'phone') {
      // Formatação telefone: (00) 00000-0000
      formattedValue = value.replace(/\D/g, '').slice(0, 11);
      if (formattedValue.length <= 10) {
        formattedValue = formattedValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        formattedValue = formattedValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
    } else if (name === 'firstName' || name === 'lastName') {
      // Apenas letras e espaços
      formattedValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').slice(0, 50);
    } else if (name === 'email') {
      // Email em minúsculas
      formattedValue = value.toLowerCase().slice(0, 100);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    // Limpar erros quando usuário digita
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.firstName.trim()) {
      newErrors.push('Nome é obrigatório');
    }
    
    if (!formData.lastName.trim()) {
      newErrors.push('Sobrenome é obrigatório');
    }
    
    if (!formData.cpf || formData.cpf.replace(/\D/g, '').length !== 11) {
      newErrors.push('CPF deve ter 11 dígitos');
    }
    
    if (!formData.email || !formData.email.includes('@')) {
      newErrors.push('Email inválido');
    }
    
    if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.push('Telefone deve ter pelo menos 10 dígitos');
    }
    
    if (!formData.password || formData.password.length < 6) {
      newErrors.push('Senha deve ter pelo menos 6 caracteres');
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Senhas não coincidem');
    }
    
    if (!acceptedTerms) {
      newErrors.push('Você deve aceitar os Termos de Uso');
    }
    
    if (!acceptedPrivacy) {
      newErrors.push('Você deve aceitar a Política de Privacidade');
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      // 1. Criar conta trial
      const signupResponse = await fetch('/api/trial/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          cpf: formData.cpf.replace(/\D/g, ''),
          email: formData.email,
          phone: formData.phone.replace(/\D/g, ''),
          password: formData.password,
          acceptedTerms,
          acceptedPrivacy
        }),
      });

      const signupResult = await signupResponse.json();

      if (signupResponse.ok && signupResult.success) {
        toast({
          title: "Conta criada!",
          description: "Redirecionando para verificação de cartão...",
        });

        // Redirecionar para verificação de cartão
        setTimeout(() => {
          window.location.href = `/verify-card?userId=${signupResult.userId}`;
        }, 2000);

      } else {
        setErrors([signupResult.message || 'Erro ao criar conta']);
      }

    } catch (error) {
      console.error('Erro no cadastro:', error);
      setErrors(['Erro de conexão. Tente novamente.']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <StandardHeader showLoginButton={true} />
      
      <div className="flex items-center justify-center px-4 pt-20 pb-12">
        <div className="w-full max-w-2xl">
          {/* Logo e título */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src={workflowLogo} 
                alt="TOIT Workflow" 
                className="h-20 w-auto opacity-90"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Comece seu trial gratuito
            </h1>
            <p className="text-gray-600">
              7 dias grátis • Sem compromisso • Cancele quando quiser
            </p>
          </div>

          {/* Benefícios do trial */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <Gift className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-semibold text-gray-900">7 dias grátis</p>
                <p className="text-sm text-gray-600">Teste todas as funcionalidades</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <Shield className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-semibold text-gray-900">Dados seguros</p>
                <p className="text-sm text-gray-600">Criptografia de ponta</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <p className="font-semibold text-gray-900">Ativação imediata</p>
                <p className="text-sm text-gray-600">Comece a usar agora</p>
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-semibold text-blue-600">
                Criar conta trial
              </CardTitle>
              <CardDescription>
                Preencha seus dados para começar o trial de 7 dias
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome e Sobrenome */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome *</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome *</Label>
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

                {/* CPF e Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      maxLength={14}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
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
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={15}
                    required
                  />
                </div>

                {/* Senha e Confirmação */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Repita sua senha"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Termos e Privacidade */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      Aceito os <a href="/terms" className="text-blue-600 hover:underline">Termos de Uso</a> *
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="privacy"
                      checked={acceptedPrivacy}
                      onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                    />
                    <Label htmlFor="privacy" className="text-sm">
                      Aceito a <a href="/privacy" className="text-blue-600 hover:underline">Política de Privacidade</a> *
                    </Label>
                  </div>
                </div>

                {/* Erros */}
                {errors.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-red-800 font-medium">Erros encontrados:</p>
                    </div>
                    <ul className="text-red-600 text-sm space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Aviso sobre cartão */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <p className="text-blue-800 text-sm">
                      <strong>Próximo passo:</strong> Validaremos um cartão de crédito ativo para ativar seu trial.
                      Sem cobrança nos primeiros 7 dias.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-lg py-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Criando conta..." : "Começar trial gratuito"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Já tem uma conta?{" "}
                  <a href="/login" className="text-blue-600 hover:underline font-medium">
                    Fazer login
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informações adicionais */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              🔒 <strong>Seus dados estão seguros</strong> • Criptografia SSL • Conformidade LGPD
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
