import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {  
  Check, 
  Star,
  Crown,
  Shield,
  Zap,
  ArrowRight,
  DollarSign,
  Users,
  Building2,
  Phone,
  Mail,
  Globe,
  BarChart3,
  Database,
  Workflow,
  Calendar,
  FileText,
  Target,
  TrendingUp,
  Clock,
  Award,
  X,
  Atom,
  Brain }
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

= useToast();

  // Estados do formulário
  const [customerData, setCustomerData] = useState(({ firstName,
    lastName,
    email,
    phone,
    cpf);

  // Estados do formulário enterprise
  const [enterpriseData, setEnterpriseData] = useState({
    firstName,
    lastName,
    companyName,
    cnpj,
    employees,
    sector,
    email,
    phone);

  useEffect(( }) => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => ({ try {
      const response = await fetch('/api/stripe/profiles');
      const data = await response.json();
      
      if (data.success) {
        // Filtrar apenas perfis ativos e não enterprise
        const activeProfiles = data.data.filter((profile }) => 
          profile.is_active && profile.slug !== 'enterprise'
        );
        setProfiles(activeProfiles);
      }
    } catch (error) {
      console.error('Erro ao carregar perfis, error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planSlug) => {
    setSelectedPlan(planSlug);
    setShowCheckout(true);
  };

  const handleEnterpriseContact = () => {
    setShowEnterpriseForm(true);
  };

  const submitEnterpriseForm = async () => {
    try {
      const response = await fetch('/api/enterprise/contact', {
        method,
        headers,
        body)
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title,
          description,
          variant);
        setShowEnterpriseForm(false);
        setEnterpriseData({
          firstName,
          lastName,
          companyName,
          cnpj,
          employees,
          sector,
          email,
          phone);
      } else {
        toast({
          title,
          description,
          variant);
      }
    } catch (error) {
      toast({
        title,
        description,
        variant);
    }
  };

  const handleCheckout = async () => {
    const selectedProfile = profiles.find(p => p.slug === selectedPlan);
    if (!selectedProfile) return;

    try {
      // Criar Payment Intent
      const response = await fetch('/api/stripe/create-payment-intent', {
        method,
        headers,
        body,
          billingCycle,
          customerData,
            email,
            phone,
            cpf)
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirecionar para página de checkout do Stripe
        window.location.href = `/checkout?payment_intent=${data.data.paymentIntentId}`;
      } else {
        toast({
          title,
          description,
          variant);
      }
    } catch (error) {
      toast({
        title,
        description,
        variant);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style,
      currency).format(value);
  };

  const calculateYearlySavings = (monthly, yearly) => {
    const monthlyCost = monthly * 12;
    const savings = monthlyCost - yearly;
    return Math.round(savings);
  };

  const getPlanIcon = (slug) => {
    switch (slug) {
      case 'basico'="w-8 h-8 text-blue-600" />;
      case 'standard'="w-8 h-8 text-purple-600" />;
      case 'premium'="w-8 h-8 text-yellow-600" />;
      default="w-8 h-8 text-green-600" />;
    }
  };

  const getModuleIcon = (module) => {
    if (module.toLowerCase().includes('banco') || module.toLowerCase().includes('dados')) {
      return <Database className="w-5 h-5" />;
    }
    if (module.toLowerCase().includes('workflow')) {
      return <Workflow className="w-5 h-5" />;
    }
    if (module.toLowerCase().includes('agenda') || module.toLowerCase().includes('calendar')) {
      return <Calendar className="w-5 h-5" />;
    }
    if (module.toLowerCase().includes('relatório') || module.toLowerCase().includes('kpi')) {
      return <BarChart3 className="w-5 h-5" />;
    }
    return <FileText className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm) => window.location.href = '/login'}>
                <Users className="w-4 h-4 mr-2" />
                Já tenho conta
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm, crie workflows, gere relatórios e gerencie equipes com a primeira 
              plataforma de automação 100% brasileira. Sem código, sem complicação.
            </p>

            <div className="flex flex-col sm) => document.getElementById('pricing')?.scrollIntoView({ behavior)}
              >
                <Target className="w-5 h-5 mr-2" />
                Começar Agora - 7 Dias Grátis
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-4 text-lg"
                onClick={handleEnterpriseContact}
              >
                <Building2 className="w-5 h-5 mr-2" />
                Soluções Enterprise
              </Button>
            </div>

            {/* Logos de confiança */}
            <div className="flex items-center justify-center space-x-8 opacity-70">
              <Badge variant="outline" className="px-4 py-2">
                <Award className="w-4 h-4 mr-1" />
                100% Brasileiro
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <Shield className="w-4 h-4 mr-1" />
                LGPD Compliance
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <Clock className="w-4 h-4 mr-1" />
                Suporte 24/7
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm, conecte sistemas e automatize processos com ferramentas intuitivas
            </p>
          </div>

          <div className="grid grid-cols-1 md, APIs, planilhas Excel/CSV, Google Sheets. 
                  Centralize informações sem downloads.
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" />PostgreSQL, MySQL, SQL Server</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" />APIs REST e GraphQL</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" />Upload Excel, CSV</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover, processe dados, gere relatórios.
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" />Drag & Drop visual</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" />Condições inteligentes</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" />Triggers automáticos</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover, KPIs em tempo real, 
                  gráficos interativos e exportação automática.
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" />12 tipos de gráficos</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" />Filtros dinâmicos</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" />Export PDF/Excel</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover, permissões granulares, 
                  controle de acesso e auditoria completa.
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" />Roles personalizados</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" />Multi-departamental</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" />Log de atividades</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover, Outlook, Gmail, WhatsApp. 
                  Centralize comunicação e agenda.
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" />Calendários sincronizados</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" />Email marketing</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" />Webhooks personalizados</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover, análise preditiva 
                  e recomendações inteligentes.
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" />TQL - Query em português</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" />Análise preditiva</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" />Insights automáticos</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm) => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}`
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                  billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-300'`}
                }`}
              >
                <span`
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-1'`}
                  }`}
                />
              </button>`
              <span className={`${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              {billingCycle === 'yearly' && (
                <Badge className="bg-green-100 text-green-800">
                  Economize até 30%
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md) => {`
              const price = billingCycle === 'monthly' ? profile.price_monthly, profile.price_yearly) {profile.slug} className={`relative ${isPopular ? 'border-purple-500 border-2 shadow-lg scale-105' : 'border-gray-200'}`}>
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white px-4 py-1">
                        🔥 MAIS POPULAR
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      {getPlanIcon(profile.slug)}
                    </div>
                    <CardTitle className="text-2xl">{profile.name}</CardTitle>
                    <CardDescription className="h-12">{profile.description}</CardDescription>
                    
                    <div className="mt-4">
                      <div className="text-4xl font-bold text-gray-900">
                        {formatCurrency(price)}
                        <span className="text-lg font-normal text-gray-500">
                          /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                        </span>
                      </div>
                      {billingCycle === 'yearly' && savings > 0 && (
                        <p className="text-sm text-green-600 font-medium">
                          Economize {formatCurrency(savings)}/ano
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <Button `
                      className=({ `w-full mb-6 ${isPopular ? 'bg-purple-600 hover }) => handleSelectPlan(profile.slug)}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Começar Teste Grátis
                    </Button>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 mb-3">Módulos inclusos, 6).map((module, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                          <span className="flex items-center">
                            {getModuleIcon(module)}
                            <span className="ml-2">{module}</span>
                          </span>
                        </div>
                      ))}
                      {profile.available_modules.length > 6 && (
                        <div className="text-sm text-gray-500">
                          +{profile.available_modules.length - 6} módulos adicionais
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Enterprise Plan */}
            <Card className="border-2 border-gray-300 relative">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Building2 className="w-8 h-8 text-gray-600" />
                </div>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription className="h-12">
                  Soluções personalizadas para grandes corporações
                </CardDescription>
                
                <div className="mt-4">
                  <div className="text-3xl font-bold text-gray-900">
                    A partir de {formatCurrency(29)}
                    <span className="text-lg font-normal text-gray-500">/usuário/mês</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Mínimo de 5 usuários
                  </p>
                </div>
              </CardHeader>
              
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full mb-6"
                  onClick={handleEnterpriseContact}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Falar com Vendas
                </Button>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 mb-3">Tudo dos outros planos +</h4>
                  <div className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>Usuários ilimitados</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>SLA garantido 99.9%</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>Onboarding dedicado</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>Suporte prioritário 24/7</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>Integrações customizadas</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>Infraestrutura dedicada</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm) => handleSelectPlan('standard')}
            >
              <Zap className="w-5 h-5 mr-2" />
              Começar Teste Grátis
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover) => setShowCheckout(false)}
                className="text-gray-400 hover)?.name}</strong>
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(billingCycle === 'monthly' ? 
                  profiles.find(p => p.slug === selectedPlan)?.price_monthly || 0 :
                  profiles.find(p => p.slug === selectedPlan)?.price_yearly || 0
                )}
                <span className="text-lg font-normal text-gray-500">
                  /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                </span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Nome"
                  value={customerData.firstName}
                  onChange=({ (e }) => setCustomerData({...customerData, firstName)}
                />
                <Input
                  placeholder="Sobrenome"
                  value={customerData.lastName}
                  onChange=({ (e }) => setCustomerData({...customerData, lastName)}
                />
              </div>
              <Input
                type="email"
                placeholder="Email"
                value={customerData.email}
                onChange=({ (e }) => setCustomerData({...customerData, email)}
              />
              <Input
                placeholder="Telefone"
                value={customerData.phone}
                onChange=({ (e }) => setCustomerData({...customerData, phone)}
              />
              <Input
                placeholder="CPF"
                value={customerData.cpf}
                onChange=({ (e }) => setCustomerData({...customerData, cpf)}
              />
            </div>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-4">
                Teste grátis por 7 dias. Após o período, sua assinatura será renovada automaticamente. 
                Cancele quando quiser.
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                onClick={handleCheckout}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Iniciar Teste Grátis
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Form Modal */}
      ({ showEnterpriseForm && (
        <EnterpriseContactForm 
          onClose={( }) => setShowEnterpriseForm(false)}
          onSubmit={submitEnterpriseForm}
          data={enterpriseData}
          setData={setEnterpriseData}
        />
      )}
    </div>
  );
}

// Enterprise Contact Form Component
function EnterpriseContactForm({ 
  onClose, 
  onSubmit, 
  data, 
  setData 
}: ({ onClose) => void;
  onSubmit) => void;
  data }) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Soluções Enterprise</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover) => setData({...data, firstName)}
            />
            <Input
              placeholder="Sobrenome"
              value={data.lastName}
              onChange=({ (e }) => setData({...data, lastName)}
            />
          </div>
          <Input
            placeholder="Nome da Empresa"
            value={data.companyName}
            onChange=({ (e }) => setData({...data, companyName)}
          />
          <Input
            placeholder="CNPJ"
            value={data.cnpj}
            onChange=({ (e }) => setData({...data, cnpj)}
          />
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={data.employees}
            onChange=({ (e }) => setData({...data, employees)}
          >
            <option value="">Quantidade de Funcionários</option>
            <option value="5-10">5-10</option>
            <option value="11-50">11-50</option>
            <option value="51-200">51-200</option>
            <option value="201-1000">201-1000</option>
            <option value="1000+">1000+</option>
          </select>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={data.sector}
            onChange=({ (e }) => setData({...data, sector)}
          >
            <option value="">Setor de Atividade</option>
            <option value="Tecnologia">Tecnologia</option>
            <option value="Financeiro">Financeiro</option>
            <option value="Saúde">Saúde</option>
            <option value="Educação">Educação</option>
            <option value="Varejo">Varejo</option>
            <option value="Indústria">Indústria</option>
            <option value="Serviços">Serviços</option>
            <option value="Outro">Outro</option>
          </select>
          <Input
            type="email"
            placeholder="Email para contato"
            value={data.email}
            onChange=({ (e }) => setData({...data, email)}
          />
          <Input
            placeholder="Telefone para contato"
            value={data.phone}
            onChange=({ (e }) => setData({...data, phone)}
          />
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600 mb-4">
            Nossa equipe entrará em contato em até 24 horas para apresentar uma proposta personalizada.
          </p>
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            onClick={onSubmit}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Solicitar Contato
          </Button>
        </div>
      </div>
    </div>
  );
}`