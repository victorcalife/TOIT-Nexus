import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  Shield, 
  BarChart3, 
  Calendar,
  Mail,
  Phone,
  Star,
  CreditCard,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data for checkout
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    password: ''
  });

  // Contact form data  
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    employees: '',
    sector: '',
    message: ''
  });

  // Plans data - pessoa física focus
  const plansData = {
    basico: {
      name: 'TOIT Nexus - Básico',
      description: 'Perfeito para começar a automatizar suas tarefas pessoais',
      monthly: { price: 59.00, total: 59.00 },
      yearly: { price: 549.00, total: 549.00, savings: 159.00 },
      features: [
        'Gestão de tarefas pessoais',
        'Conectar 1 e-mail',
        'Upload de arquivos básico',
        'Relatórios simples',
        'Suporte por e-mail',
        '5GB de armazenamento'
      ],
      badge: null
    },
    standard: {
      name: 'TOIT Nexus - Standard',
      description: 'Ideal para quem quer automações mais poderosas',
      monthly: { price: 89.00, total: 89.00 },
      yearly: { price: 749.00, total: 749.00, savings: 319.00 },
      features: [
        'Tudo do Básico',
        'Workflows automatizados',
        'Conectar múltiplos e-mails',
        'Integração com bancos de dados',
        'Dashboards personalizados',
        'Suporte prioritário',
        '25GB de armazenamento'
      ],
      badge: 'MAIS POPULAR'
    },
    premium: {
      name: 'TOIT Nexus - Premium',
      description: 'Para quem quer o máximo de produtividade pessoal',
      monthly: { price: 119.00, total: 119.00 },
      yearly: { price: 999.00, total: 999.00, savings: 429.00 },
      features: [
        'Tudo do Standard',
        'Integrações avançadas',
        'APIs e Webhooks',
        'Relatórios executivos',
        'Suporte prioritário',
        'Recursos exclusivos',
        '50GB de armazenamento'
      ],
      badge: 'MELHOR VALOR'
    },
    enterprise: {
      name: 'TOIT Nexus Enterprise',
      description: 'Para empresas com 5+ funcionários',
      monthly: { price: 29.00, total: 145.00 }, // 5 usuários mínimo
      yearly: { price: 290.00, total: 1450.00, savings: 290.00 },
      features: [
        'Tudo do Premium',
        'Gestão de equipe',
        'Controle de acesso granular',
        'Relatórios empresariais',
        'Suporte dedicado 24/7',
        'Onboarding personalizado',
        'Usuários ilimitados'
      ],
      badge: 'EMPRESAS',
      isEnterprise: true
    }
  };

  // Format CPF input
  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '');
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
    setFormData(prev => ({ ...prev, cpf: formatted }));
  };

  const handlePlanSelection = (planKey: string) => {
    if (planKey === 'enterprise') {
      setShowContactForm(true);
      return;
    }
    
    setSelectedPlan(planKey);
    setShowCheckout(true);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Implement 7-day trial signup
    try {
      const response = await fetch('/api/auth/trial-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          plan: selectedPlan,
          cycle: selectedCycle,
          cpf: formData.cpf.replace(/\D/g, '')
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        // Redirect to verification page with user data
        window.location.href = `/verify-account?userId=${result.userId}&email=${encodeURIComponent(formData.email)}&phone=${encodeURIComponent(formData.phone)}`;
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erro ao criar conta. Tente novamente.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form
    alert('Obrigado pelo interesse! Nossa equipe entrará em contato em até 24 horas.');
    setShowContactForm(false);
    setContactData({
      name: '', email: '', company: '', phone: '', 
      employees: '', sector: '', message: ''
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Padrão com Login/Logout */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TOIT Nexus</h1>
                <p className="text-sm text-gray-600">Automação Pessoal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/dashboard'}
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Minha Conta
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/login'}
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Automatize Sua Vida
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}Pessoal
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Conecte suas tarefas, e-mails, calendários e dados em um só lugar. 
            Crie workflows inteligentes que trabalham para você automaticamente.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              7 dias grátis
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Sem compromisso
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1" />
              Cancele quando quiser
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - 4 Planos Horizontais */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Escolha Seu Plano
            </h2>
            <p className="text-gray-600 mb-6">
              Comece com 7 dias grátis. Todos os planos incluem teste completo.
            </p>
            
            {/* Cycle Toggle */}
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setSelectedCycle('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Anual (economize até 36%)
              </button>
            </div>
          </div>

          {/* 4 Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {Object.entries(plansData).map(([key, plan]) => {
              const currentPrice = selectedCycle === 'yearly' ? plan.yearly : plan.monthly;
              const monthlyEquivalent = selectedCycle === 'yearly' ? plan.yearly.price / 12 : plan.monthly.price;
              
              return (
                <Card key={key} className={`relative h-full flex flex-col ${
                  plan.badge === 'MAIS POPULAR' ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-200'
                }`}>
                  {plan.badge && (
                    <Badge 
                      className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${
                        plan.badge === 'MAIS POPULAR' ? 'bg-blue-500' :
                        plan.badge === 'MELHOR VALOR' ? 'bg-purple-500' :
                        'bg-gray-600'
                      }`}
                    >
                      {plan.badge}
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg font-bold text-gray-900">
                      {plan.name.replace('TOIT Nexus - ', '')}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 min-h-[2.5rem] flex items-center">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    {/* Pricing */}
                    <div className="text-center mb-6">
                      {plan.isEnterprise ? (
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            A partir de R$ {monthlyEquivalent.toFixed(0)}
                          </div>
                          <div className="text-sm text-gray-600">
                            por usuário/mês (mín. 5 usuários)
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-3xl font-bold text-gray-900">
                            R$ {monthlyEquivalent.toFixed(0)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedCycle === 'yearly' ? 'por mês (cobrado anualmente)' : 'por mês'}
                          </div>
                          {selectedCycle === 'yearly' && plan.yearly.savings > 0 && (
                            <div className="text-xs text-green-600 font-medium">
                              Economize R$ {plan.yearly.savings.toFixed(0)}/ano
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-6 flex-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handlePlanSelection(key)}
                      className={`w-full ${
                        plan.badge === 'MAIS POPULAR' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : plan.isEnterprise
                          ? 'bg-gray-800 hover:bg-gray-900 text-white'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                    >
                      {plan.isEnterprise ? 'Falar com Vendas' : 'Começar Teste Grátis'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    
                    {!plan.isEnterprise && (
                      <p className="text-xs text-gray-500 text-center mt-2">
                        7 dias grátis, depois R$ {currentPrice.total.toFixed(0)}/{selectedCycle === 'yearly' ? 'ano' : 'mês'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal de Checkout - 7 dias grátis */}
      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Teste Grátis - {plansData[selectedPlan as keyof typeof plansData].name.replace('TOIT Nexus - ', '')}
                </h3>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-800">
                  <Shield className="h-5 w-5 mr-2" />
                  <span className="font-medium">7 dias completamente grátis</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Acesso completo ao plano escolhido. Cancel quando quiser.
                </p>
              </div>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      required
                      value={formData.name.split(' ')[0]}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        name: e.target.value + (prev.name.split(' ')[1] ? ' ' + prev.name.split(' ').slice(1).join(' ') : '')
                      }))}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      required
                      value={formData.name.split(' ').slice(1).join(' ')}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        name: prev.name.split(' ')[0] + ' ' + e.target.value
                      }))}
                      placeholder="Seu sobrenome"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    required
                    value={formData.cpf}
                    onChange={handleCpfChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Sua senha de acesso"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Plano selecionado:</span>
                    <span className="text-sm text-gray-600">
                      {plansData[selectedPlan as keyof typeof plansData].name.replace('TOIT Nexus - ', '')} 
                      {' '}({selectedCycle === 'yearly' ? 'Anual' : 'Mensal'})
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    Após 7 dias grátis: R$ {
                      selectedCycle === 'yearly' 
                        ? plansData[selectedPlan as keyof typeof plansData].yearly.total.toFixed(0) 
                        : plansData[selectedPlan as keyof typeof plansData].monthly.total.toFixed(0)
                    }/{selectedCycle === 'yearly' ? 'ano' : 'mês'}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Criando conta...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Começar Teste Grátis
                    </div>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Ao continuar, você concorda com nossos termos de serviço e política de privacidade.
                  Você pode cancelar a qualquer momento durante o período de teste.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Contato - Enterprise */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Contato Enterprise
                </h3>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-blue-800">
                  <Mail className="h-5 w-5 mr-2" />
                  <span className="font-medium">Resposta em até 24 horas</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Nossa equipe comercial entrará em contato para apresentar a solução ideal.
                </p>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactName">Nome</Label>
                    <Input
                      id="contactName"
                      required
                      value={contactData.name}
                      onChange={(e) => setContactData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">E-mail</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      required
                      value={contactData.email}
                      onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="seu@empresa.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    required
                    value={contactData.company}
                    onChange={(e) => setContactData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Nome da empresa"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactPhone">Telefone</Label>
                    <Input
                      id="contactPhone"
                      required
                      value={contactData.phone}
                      onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employees">Funcionários</Label>
                    <select
                      id="employees"
                      required
                      value={contactData.employees}
                      onChange={(e) => setContactData(prev => ({ ...prev, employees: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione</option>
                      <option value="5-10">5-10 funcionários</option>
                      <option value="11-50">11-50 funcionários</option>
                      <option value="51-100">51-100 funcionários</option>
                      <option value="100+">Mais de 100</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="sector">Setor de Atividade</Label>
                  <Input
                    id="sector"
                    value={contactData.sector}
                    onChange={(e) => setContactData(prev => ({ ...prev, sector: e.target.value }))}
                    placeholder="Ex: Tecnologia, Varejo, Consultoria..."
                  />
                </div>

                <div>
                  <Label htmlFor="message">Mensagem (opcional)</Label>
                  <textarea
                    id="message"
                    rows={3}
                    value={contactData.message}
                    onChange={(e) => setContactData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Conte-nos sobre suas necessidades..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Solicitar Contato
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Seus dados serão utilizados apenas para contato comercial e não serão compartilhados.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}