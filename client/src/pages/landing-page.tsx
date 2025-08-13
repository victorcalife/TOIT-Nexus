import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import
{
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
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccessProfile
{
  slug: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  description: string;
  available_modules: string[];
  is_active: boolean;
  limits: any;
}

export function LandingPage()
{
  const [ profiles, setProfiles ] = useState<AccessProfile[]>( [] );
  const [ selectedPlan, setSelectedPlan ] = useState<string>( 'standard' );
  const [ billingCycle, setBillingCycle ] = useState<'monthly' | 'yearly'>( 'monthly' );
  const [ loading, setLoading ] = useState( true );
  const [ showCheckout, setShowCheckout ] = useState( false );
  const [ showEnterpriseForm, setShowEnterpriseForm ] = useState( false );
  const { toast } = useToast();

  // Estados do formulário
  const [ customerData, setCustomerData ] = useState( {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cpf: ''
  } );

  // Estados do formulário enterprise
  const [ enterpriseData, setEnterpriseData ] = useState( {
    firstName: '',
    lastName: '',
    companyName: '',
    cnpj: '',
    employees: '',
    sector: '',
    email: '',
    phone: ''
  } );

  useEffect( () =>
  {
    fetchProfiles();
  }, [] );

  const fetchProfiles = async () =>
  {
    try
    {
      const response = await fetch( '/api/stripe/profiles' );
      const data = await response.json();

      if ( data.success )
      {
        // Filtrar apenas perfis ativos e não enterprise
        const activeProfiles = data.data.filter( ( profile: AccessProfile ) =>
          profile.is_active && profile.slug !== 'enterprise'
        );
        setProfiles( activeProfiles );
      }
    } catch ( error )
    {
      console.error( 'Erro ao carregar perfis:', error );
    } finally
    {
      setLoading( false );
    }
  };

  const handleSelectPlan = ( planSlug: string ) =>
  {
    setSelectedPlan( planSlug );
    setShowCheckout( true );
  };

  const handleEnterpriseContact = () =>
  {
    setShowEnterpriseForm( true );
  };

  const submitEnterpriseForm = async () =>
  {
    try
    {
      const response = await fetch( '/api/enterprise/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( enterpriseData )
      } );

      const data = await response.json();

      if ( data.success )
      {
        toast( {
          title: "Solicitação Enviada!",
          description: "Nossa equipe entrará em contato em até 24 horas.",
          variant: "default"
        } );
        setShowEnterpriseForm( false );
        setEnterpriseData( {
          firstName: '',
          lastName: '',
          companyName: '',
          cnpj: '',
          employees: '',
          sector: '',
          email: '',
          phone: ''
        } );
      } else
      {
        toast( {
          title: "Erro",
          description: data.message,
          variant: "destructive"
        } );
      }
    } catch ( error )
    {
      toast( {
        title: "Erro",
        description: "Erro ao enviar solicitação. Tente novamente.",
        variant: "destructive"
      } );
    }
  };

  const handleCheckout = async () =>
  {
    const selectedProfile = profiles.find( p => p.slug === selectedPlan );
    if ( !selectedProfile ) return;

    try
    {
      // Criar Payment Intent
      const response = await fetch( '/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {
          profileSlug: selectedPlan,
          billingCycle,
          customerData: {
            name: `${ customerData.firstName } ${ customerData.lastName }`,
            email: customerData.email,
            phone: customerData.phone,
            cpf: customerData.cpf
          }
        } )
      } );

      const data = await response.json();

      if ( data.success )
      {
        // Redirecionar para página de checkout do Stripe
        window.location.href = `/checkout?payment_intent=${ data.data.paymentIntentId }`;
      } else
      {
        toast( {
          title: "Erro",
          description: data.message,
          variant: "destructive"
        } );
      }
    } catch ( error )
    {
      toast( {
        title: "Erro",
        description: "Erro ao processar checkout. Tente novamente.",
        variant: "destructive"
      } );
    }
  };

  const formatCurrency = ( value: number ) =>
  {
    return new Intl.NumberFormat( 'pt-BR', {
      style: 'currency',
      currency: 'BRL'
    } ).format( value );
  };

  const calculateYearlySavings = ( monthly: number, yearly: number ) =>
  {
    const monthlyCost = monthly * 12;
    const savings = monthlyCost - yearly;
    return Math.round( savings );
  };

  const getPlanIcon = ( slug: string ) =>
  {
    switch ( slug )
    {
      case 'basico': return <Shield className="w-8 h-8 text-blue-600" />;
      case 'standard': return <Star className="w-8 h-8 text-purple-600" />;
      case 'premium': return <Crown className="w-8 h-8 text-yellow-600" />;
      default: return <Zap className="w-8 h-8 text-green-600" />;
    }
  };

  const getModuleIcon = ( module: string ) =>
  {
    if ( module.toLowerCase().includes( 'banco' ) || module.toLowerCase().includes( 'dados' ) )
    {
      return <Database className="w-5 h-5" />;
    }
    if ( module.toLowerCase().includes( 'workflow' ) )
    {
      return <Workflow className="w-5 h-5" />;
    }
    if ( module.toLowerCase().includes( 'agenda' ) || module.toLowerCase().includes( 'calendar' ) )
    {
      return <Calendar className="w-5 h-5" />;
    }
    if ( module.toLowerCase().includes( 'relatório' ) || module.toLowerCase().includes( 'kpi' ) )
    {
      return <BarChart3 className="w-5 h-5" />;
    }
    return <FileText className="w-5 h-5" />;
  };

  if ( loading )
  {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TOIT NEXUS</h1>
                <p className="text-xs text-gray-500">The One in Tech</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">Sobre</Button>
              <Button variant="ghost" size="sm">Recursos</Button>
              <Button variant="ghost" size="sm">Contato</Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/login'}>
                <Users className="w-4 h-4 mr-2" />
                Fazer Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-blue-100 text-blue-800 px-4 py-2">
              🚀 Revolucione sua gestão de dados
            </Badge>
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              A Plataforma de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Business Intelligence</span><br />
              em Português que você precisa
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Conecte seus dados, crie workflows inteligentes e tome decisões baseadas em insights reais.
              Tudo em português, sem complicação.
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3" onClick={() => document.getElementById( 'pricing' )?.scrollIntoView( { behavior: 'smooth' } )}>
                Começar Grátis por 7 dias
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={handleEnterpriseContact}>
                <Building2 className="mr-2 w-5 h-5" />
                Soluções Enterprise
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime Garantido</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">10x</div>
              <div className="text-gray-600">Mais Rápido que SQL</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-600">em Português</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Funcionalidades que fazem a diferença
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tudo que você precisa para transformar dados em resultados, em uma única plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Conectividade Total</CardTitle>
                <CardDescription>
                  Conecte bancos de dados, APIs, planilhas e muito mais em um só lugar.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Workflow className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Workflows Inteligentes</CardTitle>
                <CardDescription>
                  Automatize processos complexos com nosso builder visual de workflows.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>BI em Português</CardTitle>
                <CardDescription>
                  Sistema TQL revolucionário - faça consultas complexas em português simples.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-yellow-600" />
                </div>
                <CardTitle>Gestão de Tarefas</CardTitle>
                <CardDescription>
                  Organize equipes e projetos com templates personalizáveis e rastreamento completo.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Integração Calendário</CardTitle>
                <CardDescription>
                  Sincronize com Google, Outlook e Apple Calendar para workflows temporais.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Segurança Enterprise</CardTitle>
                <CardDescription>
                  Multi-tenant com isolamento completo, permissões granulares e auditoria.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Planos que crescem com seu negócio
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Comece grátis por 7 dias. Sem compromisso, sem cartão de crédito.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-8">
              <span className={`mr-3 ${ billingCycle === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500' }`}>
                Mensal
              </span>
              <button
                onClick={() => setBillingCycle( billingCycle === 'monthly' ? 'yearly' : 'monthly' )}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${ billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
              <span className={`ml-3 ${ billingCycle === 'yearly' ? 'text-gray-900 font-medium' : 'text-gray-500' }`}>
                Anual
              </span>
              {billingCycle === 'yearly' && (
                <Badge className="ml-2 bg-green-100 text-green-800">
                  Economize até 25%
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Planos Regulares */}
            {profiles.map( ( profile ) =>
            {
              const isPopular = profile.slug === 'standard';
              const price = billingCycle === 'monthly' ? profile.price_monthly : profile.price_yearly;
              const savings = billingCycle === 'yearly' ? calculateYearlySavings( profile.price_monthly, profile.price_yearly ) : 0;

              return (
                <Card
                  key={profile.slug}
                  className={`relative border-2 transition-all duration-200 hover:shadow-xl ${ isPopular
                    ? 'border-purple-500 shadow-lg ring-2 ring-purple-200'
                    : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white px-4 py-1">
                        🔥 Mais Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-6">
                    <div className="flex justify-center mb-4">
                      {getPlanIcon( profile.slug )}
                    </div>
                    <CardTitle className="text-2xl font-bold capitalize">
                      {profile.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {profile.description}
                    </CardDescription>

                    <div className="mt-6">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-gray-900">
                          {formatCurrency( price )}
                        </span>
                        <span className="text-gray-500 ml-1">
                          /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                        </span>
                      </div>
                      {billingCycle === 'yearly' && savings > 0 && (
                        <div className="text-sm text-green-600 mt-2">
                          Economize {formatCurrency( savings )} por ano!
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3 mb-6">
                      {profile.available_modules.slice( 0, 5 ).map( ( module, index ) => (
                        <div key={index} className="flex items-center">
                          <Check className="w-4 h-4 text-green-500 mr-3" />
                          <span className="text-sm text-gray-700">{module}</span>
                        </div>
                      ) )}
                      {profile.available_modules.length > 5 && (
                        <div className="text-sm text-gray-500 pl-7">
                          +{profile.available_modules.length - 5} módulos adicionais
                        </div>
                      )}
                    </div>

                    <Button
                      className={`w-full ${ isPopular
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      onClick={() => handleSelectPlan( profile.slug )}
                    >
                      Começar Teste Grátis
                    </Button>

                    <p className="text-xs text-gray-500 text-center mt-2">
                      7 dias grátis, depois {formatCurrency( billingCycle === 'monthly' ? profile.price_monthly : profile.price_yearly )}/{billingCycle === 'monthly' ? 'mês' : 'ano'}
                    </p>
                  </CardContent>
                </Card>
              );
            } )}

            {/* Plano Enterprise */}
            <Card className="relative border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <Building2 className="w-8 h-8 text-gray-600" />
                </div>
                <CardTitle className="text-2xl font-bold">Enterprise</CardTitle>
                <CardDescription className="mt-2">
                  Soluções personalizadas para grandes empresas
                </CardDescription>

                <div className="mt-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold text-gray-900">Sob consulta</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    A partir de R$ 29/usuário
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3" />
                    <span className="text-sm text-gray-700">Todos os módulos inclusos</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3" />
                    <span className="text-sm text-gray-700">Usuários ilimitados</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3" />
                    <span className="text-sm text-gray-700">Suporte dedicado 24/7</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3" />
                    <span className="text-sm text-gray-700">SLA 99.9% garantido</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3" />
                    <span className="text-sm text-gray-700">Implementação personalizada</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-gray-400 hover:bg-gray-100"
                  onClick={handleEnterpriseContact}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Falar com Vendas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para revolucionar sua gestão de dados?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a centenas de empresas que já transformaram seus processos com o TOIT NEXUS
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
              onClick={() => document.getElementById( 'pricing' )?.scrollIntoView( { behavior: 'smooth' } )}
            >
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600"
              onClick={handleEnterpriseContact}
            >
              <Phone className="mr-2 w-5 h-5" />
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <span className="text-xl font-bold">TOIT NEXUS</span>
              </div>
              <p className="text-gray-400 text-sm">
                A plataforma de Business Intelligence em português que revoluciona a gestão de dados.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Recursos</a></li>
                <li><a href="#" className="hover:text-white">Preços</a></li>
                <li><a href="#" className="hover:text-white">Documentação</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carreiras</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">Comunidade</a></li>
                <li><a href="mailto:toit@suporte.toit.com.br" className="hover:text-white">toit@suporte.toit.com.br</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 TOIT Enterprise. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          selectedProfile={profiles.find( p => p.slug === selectedPlan )!}
          billingCycle={billingCycle}
          customerData={customerData}
          setCustomerData={setCustomerData}
          onClose={() => setShowCheckout( false )}
          onCheckout={handleCheckout}
        />
      )}

      {/* Enterprise Form Modal */}
      {showEnterpriseForm && (
        <EnterpriseFormModal
          enterpriseData={enterpriseData}
          setEnterpriseData={setEnterpriseData}
          onClose={() => setShowEnterpriseForm( false )}
          onSubmit={submitEnterpriseForm}
        />
      )}
    </div>
  );
}

// Checkout Modal Component
function CheckoutModal( {
  selectedProfile,
  billingCycle,
  customerData,
  setCustomerData,
  onClose,
  onCheckout
}: any )
{
  const price = billingCycle === 'monthly' ? selectedProfile.price_monthly : selectedProfile.price_yearly;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Finalizar Assinatura</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium capitalize">{selectedProfile.name}</div>
              <div className="text-sm text-gray-500">
                {billingCycle === 'monthly' ? 'Mensal' : 'Anual'}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold">{new Intl.NumberFormat( 'pt-BR', { style: 'currency', currency: 'BRL' } ).format( price )}</div>
              <div className="text-sm text-gray-500">
                /{billingCycle === 'monthly' ? 'mês' : 'ano'}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Nome"
              value={customerData.firstName}
              onChange={( e ) => setCustomerData( { ...customerData, firstName: e.target.value } )}
            />
            <Input
              placeholder="Sobrenome"
              value={customerData.lastName}
              onChange={( e ) => setCustomerData( { ...customerData, lastName: e.target.value } )}
            />
          </div>
          <Input
            type="email"
            placeholder="Email"
            value={customerData.email}
            onChange={( e ) => setCustomerData( { ...customerData, email: e.target.value } )}
          />
          <Input
            placeholder="Telefone"
            value={customerData.phone}
            onChange={( e ) => setCustomerData( { ...customerData, phone: e.target.value } )}
          />
          <Input
            placeholder="CPF"
            value={customerData.cpf}
            onChange={( e ) => setCustomerData( { ...customerData, cpf: e.target.value } )}
          />
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600 mb-4">
            ✅ 7 dias grátis<br />
            ✅ Cancele quando quiser<br />
            ✅ Suporte 24/7
          </p>
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            onClick={onCheckout}
          >
            Começar Teste Grátis
          </Button>
        </div>
      </div>
    </div>
  );
}

// Enterprise Form Modal Component
function EnterpriseFormModal( {
  enterpriseData,
  setEnterpriseData,
  onClose,
  onSubmit
}: any )
{
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Contato Enterprise</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Nome"
              value={enterpriseData.firstName}
              onChange={( e ) => setEnterpriseData( { ...enterpriseData, firstName: e.target.value } )}
            />
            <Input
              placeholder="Sobrenome"
              value={enterpriseData.lastName}
              onChange={( e ) => setEnterpriseData( { ...enterpriseData, lastName: e.target.value } )}
            />
          </div>
          <Input
            placeholder="Nome da Empresa"
            value={enterpriseData.companyName}
            onChange={( e ) => setEnterpriseData( { ...enterpriseData, companyName: e.target.value } )}
          />
          <Input
            placeholder="CNPJ"
            value={enterpriseData.cnpj}
            onChange={( e ) => setEnterpriseData( { ...enterpriseData, cnpj: e.target.value } )}
          />
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={enterpriseData.employees}
            onChange={( e ) => setEnterpriseData( { ...enterpriseData, employees: e.target.value } )}
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
            value={enterpriseData.sector}
            onChange={( e ) => setEnterpriseData( { ...enterpriseData, sector: e.target.value } )}
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
            value={enterpriseData.email}
            onChange={( e ) => setEnterpriseData( { ...enterpriseData, email: e.target.value } )}
          />
          <Input
            placeholder="Telefone para contato"
            value={enterpriseData.phone}
            onChange={( e ) => setEnterpriseData( { ...enterpriseData, phone: e.target.value } )}
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
}

export default LandingPage;