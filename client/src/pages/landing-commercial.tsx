import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Star, Users, Zap, Shield, ArrowRight, Gift, Phone, Mail, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import workflowLogo from "@/assets/SELOtoit-workflow-logo.svg";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  description: string;
  features: PlanFeature[];
  badge?: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'basico',
    name: 'BÁSICO',
    price_monthly: 59,
    price_yearly: 549,
    description: 'Ideal para freelancers e pequenos negócios',
    features: [
      { name: 'Task Management Completo', included: true },
      { name: 'Query Builder Visual', included: true },
      { name: 'Relatórios Básicos', included: true },
      { name: '2 Conexões de Dados', included: true },
      { name: '5GB de Storage', included: true },
      { name: 'Suporte por Email', included: true },
      { name: 'Workflows Avançados', included: false },
      { name: 'Integrações Premium', included: false },
      { name: 'API Access', included: false }
    ]
  },
  {
    id: 'standard',
    name: 'STANDARD',
    price_monthly: 89,
    price_yearly: 749,
    description: 'Para equipes que precisam de mais recursos',
    badge: 'MAIS POPULAR',
    popular: true,
    features: [
      { name: 'Tudo do plano Básico', included: true },
      { name: 'Workflows Avançados', included: true },
      { name: '10 Conexões de Dados', included: true },
      { name: '25GB de Storage', included: true },
      { name: 'Dashboards Personalizados', included: true },
      { name: 'Integrações Calendário', included: true },
      { name: 'Suporte Prioritário', included: true },
      { name: 'API Access Limitado', included: true },
      { name: 'Multi-departamentos', included: false }
    ]
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price_monthly: 119,
    price_yearly: 999,
    description: 'Solução completa para empresas em crescimento',
    badge: 'DESCONTO ESPECIAL',
    features: [
      { name: 'Tudo do plano Standard', included: true },
      { name: 'Conexões Ilimitadas', included: true },
      { name: '100GB de Storage', included: true },
      { name: 'Multi-departamentos', included: true },
      { name: 'API Access Completo', included: true },
      { name: 'Webhooks Personalizados', included: true },
      { name: 'Machine Learning Features', included: true },
      { name: 'Suporte 24/7', included: true },
      { name: 'White Label (Add-on)', included: false }
    ]
  }
];

export default function LandingCommercial() {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cpf: '',
    company: '',
    acceptTerms: false,
    acceptMarketing: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { toast } = useToast();

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    if (match) {
      return match[1] + '.' + match[2] + '.' + match[3] + '-' + match[4];
    }
    return cleaned;
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return cleaned;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.firstName.trim()) errors.push('Nome é obrigatório');
    if (!formData.lastName.trim()) errors.push('Sobrenome é obrigatório');
    if (!formData.email.trim()) errors.push('Email é obrigatório');
    if (!formData.phone.trim()) errors.push('Telefone é obrigatório');
    if (!formData.cpf.trim()) errors.push('CPF é obrigatório');
    if (!formData.acceptTerms) errors.push('Você deve aceitar os termos de uso');
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Email inválido');
    }
    
    // Validar CPF (11 dígitos limpos)
    const cleanCPF = formData.cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) {
      errors.push('CPF deve ter 11 dígitos');
    }
    
    // Validar telefone (10 ou 11 dígitos limpos)
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      errors.push('Telefone inválido');
    }
    
    return errors;
  };

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    setShowCheckout(true);
    
    // Scroll para o formulário
    setTimeout(() => {
      const checkoutSection = document.getElementById('checkout-section');
      if (checkoutSection) {
        checkoutSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleStartTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Dados inválidos",
        description: validationErrors[0],
        variant: "destructive",
      });
      return;
    }

    if (!selectedPlan) {
      toast({
        title: "Selecione um plano",
        description: "Escolha um plano para continuar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/trial/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          cpf: formData.cpf.replace(/\D/g, ''),
          phone: formData.phone.replace(/\D/g, ''),
          selectedPlan,
          billingCycle: isYearly ? 'yearly' : 'monthly'
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para ativar sua conta.",
        });

        // Redirecionar para verificação de email
        setTimeout(() => {
          window.location.href = `/verify-email?userId=${result.userId}`;
        }, 2000);

      } else {
        toast({
          title: "Erro ao criar conta",
          description: result.message || "Tente novamente mais tarde",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao iniciar trial:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível criar sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterpriseContact = () => {
    // Scroll para formulário de contato enterprise
    const enterpriseSection = document.getElementById('enterprise-contact');
    if (enterpriseSection) {
      enterpriseSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const calculateSavings = (monthly: number, yearly: number) => {
    return (monthly * 12) - yearly;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src={workflowLogo} alt="TOIT Nexus" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">TOIT Nexus</h1>
                <p className="text-sm text-gray-600">Plataforma Empresarial Inteligente</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/login'}>
              Já tem conta? Entre
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge className="mb-6 bg-green-500 hover:bg-green-600 text-white">
              <Gift className="w-4 h-4 mr-2" />
              Trial Gratuito de 7 Dias
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6">
              Transforme Dados em 
              <span className="text-yellow-300"> Resultados</span>
            </h1>
            
            <p className="text-xl mb-8 text-blue-100">
              A única plataforma que você precisa para gestão de tarefas, análise de dados e automação de processos. 
              <strong> Sem código, sem complicação.</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Setup em 5 minutos</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Suporte em português</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg px-8 py-4"
              onClick={() => {
                const plansSection = document.getElementById('plans-section');
                if (plansSection) {
                  plansSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Começar Trial Gratuito
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que mais de 1000+ empresas escolhem o TOIT Nexus?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma plataforma completa que cresce com seu negócio
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Automação Inteligente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Workflows visuais que automatizam tarefas repetitivas e conectam seus sistemas sem código.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Colaboração em Equipe</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Gestão de tarefas, departamentos e permissões que escalam com sua equipe.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Segurança Enterprise</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Dados criptografados, backups automáticos e conformidade com LGPD.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="plans-section" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Escolha o plano ideal para seu negócio
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Todos os planos incluem trial gratuito de 7 dias
            </p>
            
            {/* Toggle Anual/Mensal */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`font-medium ${!isYearly ? 'text-blue-600' : 'text-gray-500'}`}>
                Mensal
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsYearly(!isYearly)}
                className={`relative h-6 w-11 rounded-full ${isYearly ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute w-4 h-4 bg-white rounded-full transition-transform ${isYearly ? 'translate-x-5' : 'translate-x-1'}`} />
              </Button>
              <span className={`font-medium ${isYearly ? 'text-blue-600' : 'text-gray-500'}`}>
                Anual
              </span>
              {isYearly && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  Economize até 25%
                </Badge>
              )}
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative border-2 hover:shadow-xl transition-all ${plan.popular ? 'border-blue-500 scale-105' : 'border-gray-200'}`}>
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium ${plan.popular ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                    {plan.badge}
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 mb-4">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-gray-900">
                      R$ {isYearly ? plan.price_yearly : plan.price_monthly}
                      <span className="text-lg font-normal text-gray-600">
                        /{isYearly ? 'ano' : 'mês'}
                      </span>
                    </div>
                    
                    {isYearly && (
                      <div className="text-sm text-green-600 font-medium">
                        Economize R$ {calculateSavings(plan.price_monthly, plan.price_yearly)} por ano
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <CheckCircle className={`w-5 h-5 ${feature.included ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full py-3 text-lg font-semibold ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'}`}
                    onClick={() => handlePlanSelection(plan.id)}
                  >
                    <Gift className="w-5 h-5 mr-2" />
                    Começar Trial Gratuito
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Enterprise Card */}
          <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white border-0">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Building className="w-8 h-8 text-yellow-400" />
                <CardTitle className="text-3xl font-bold">ENTERPRISE</CardTitle>
              </div>
              <CardDescription className="text-gray-300 text-lg">
                Soluções personalizadas para grandes empresas
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center space-y-6">
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Recursos Ilimitados</h4>
                  <p className="text-gray-300">Usuários, storage e conexões sem limite</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Suporte Dedicado</h4>
                  <p className="text-gray-300">Customer Success Manager exclusivo</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Integração Personalizada</h4>
                  <p className="text-gray-300">APIs customizadas e white label</p>
                </div>
              </div>
              
              <div className="text-2xl font-bold">
                A partir de R$ 29/mês por usuário
                <div className="text-sm font-normal text-gray-400 mt-1">
                  Mínimo de 5 usuários
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                onClick={handleEnterpriseContact}
              >
                Falar com Vendas
                <Phone className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Checkout Form */}
      {showCheckout && selectedPlan && (
        <section id="checkout-section" className="py-20 bg-white">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-gray-900">
                  🎁 Comece seu trial gratuito
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Plano <strong>{plans.find(p => p.id === selectedPlan)?.name}</strong> selecionado
                  <br />
                  7 dias grátis, depois R$ {isYearly 
                    ? plans.find(p => p.id === selectedPlan)?.price_yearly 
                    : plans.find(p => p.id === selectedPlan)?.price_monthly
                  }/{isYearly ? 'ano' : 'mês'}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleStartTrial} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Sobrenome *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input
                        id="cpf"
                        value={formData.cpf}
                        onChange={(e) => handleInputChange('cpf', e.target.value)}
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa (opcional)</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Nome da sua empresa"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptTerms"
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, acceptTerms: checked as boolean }))
                        }
                        required
                      />
                      <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                        Concordo com os <a href="/termos" className="text-blue-600 hover:underline">Termos de Uso</a> e 
                        <a href="/privacidade" className="text-blue-600 hover:underline ml-1">Política de Privacidade</a> *
                      </label>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptMarketing"
                        checked={formData.acceptMarketing}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, acceptMarketing: checked as boolean }))
                        }
                      />
                      <label htmlFor="acceptMarketing" className="text-sm text-gray-600">
                        Quero receber dicas e novidades por email
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <Gift className="w-5 h-5 text-green-500 mt-0.5" />
                      <div className="text-sm text-green-800">
                        <p className="font-medium">🎉 Trial 100% gratuito por 7 dias</p>
                        <p className="mt-1 text-green-600">
                          Acesso completo à plataforma. Cancele quando quiser, sem multas.
                          Após o trial, cobrança automática conforme plano selecionado.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-4 font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando sua conta..." : "Começar Trial Gratuito"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Enterprise Contact Section */}
      <section id="enterprise-contact" className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Precisa de uma solução Enterprise?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Fale com nossa equipe de vendas e descubra como podemos 
            personalizar a plataforma para sua empresa.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 text-center">
              <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p className="text-gray-600 mb-4">Resposta em até 4 horas</p>
              <Button variant="outline" className="w-full">
                vendas@toit.com.br
              </Button>
            </Card>
            
            <Card className="p-6 text-center">
              <Phone className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Telefone</h3>
              <p className="text-gray-600 mb-4">Segunda a sexta, 9h às 18h</p>
              <Button variant="outline" className="w-full">
                (11) 99999-9999
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src={workflowLogo} alt="TOIT" className="h-8 w-auto" />
                <span className="text-xl font-bold">TOIT Nexus</span>
              </div>
              <p className="text-gray-400">
                A plataforma que transforma dados em resultados para seu negócio.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white">Preços</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Integrações</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carreira</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Documentação</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">Comunidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TOIT Nexus. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}