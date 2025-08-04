import { useState, useEffect } from "react";
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
    id: 'quantum_lite',
    name: 'LITE',
    price_monthly: 99,
    price_yearly: 799,
    description: 'Quantum Computing para pessoas físicas - Democratizando o futuro',
    badge: 'DEMOCRATIZAÇÃO',
    features: [
      { name: 'Workflows Visual No-Code', included: true },
      { name: 'Query Builder Inteligente', included: true },
      { name: 'Relatórios Automáticos', included: true },
      { name: '1.000 Créditos Quantum/mês', included: true },
      { name: 'Algoritmos Quantum Essenciais', included: true },
      { name: '5 Conexões de Dados', included: true },
      { name: '10GB de Storage', included: true },
      { name: 'Suporte por WhatsApp', included: true },
      { name: 'Quantum ML Avançado', included: false }
    ]
  },
  {
    id: 'quantum_pro',
    name: 'PRO',
    price_monthly: 179,
    price_yearly: 1599,
    description: 'Para pequenas empresas que querem poder quantum acessível',
    badge: 'MAIS POPULAR',
    popular: true,
    features: [
      { name: 'Tudo do Lite', included: true },
      { name: '10.000 Créditos Quantum/mês', included: true },
      { name: 'Quantum ML Completo', included: true },
      { name: 'Algoritmos VQE & QAOA', included: true },
      { name: 'Automação Quantum', included: true },
      { name: '15 Conexões de Dados', included: true },
      { name: '50GB de Storage', included: true },
      { name: 'Suporte Prioritário', included: true },
      { name: 'API Quantum Completa', included: true }
    ]
  },
  {
    id: 'quantum_boost',
    name: 'QUANTUM BOOST 2X',
    price_monthly: 259,
    price_yearly: 2699,
    description: 'Máximo poder quantum democratizado - O que era só dos grandes!',
    badge: 'MELHOR CUSTO-BENEFÍCIO',
    features: [
      { name: 'Tudo do Pro', included: true },
      { name: '25.000 Créditos Quantum/mês', included: true },
      { name: 'QPU IBM Quantum Network', included: true },
      { name: 'Algoritmos Shor + Grover', included: true },
      { name: 'Consultoria Quantum Inclusa', included: true },
      { name: 'Conexões Ilimitadas', included: true },
      { name: '200GB de Storage', included: true },
      { name: 'Suporte 24/7 WhatsApp', included: true },
      { name: 'White Label Personalizado', included: true }
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

  // Carousel 3D Logic
  useEffect(() => {
    let currentCase = 0;
    const totalCases = 10;
    let carouselInterval: NodeJS.Timeout;
    
    function updateCarousel() {
      const cards = document.querySelectorAll('.case-card');
      const dots = document.querySelectorAll('.case-dot');
      
      cards.forEach((card, index) => {
        card.classList.remove('active', 'next', 'prev');
        
        if (index === currentCase) {
          card.classList.add('active');
        } else if (index === (currentCase + 1) % totalCases) {
          card.classList.add('next');
        } else if (index === (currentCase - 1 + totalCases) % totalCases) {
          card.classList.add('prev');
        }
      });
      
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentCase);
      });
    }
    
    function nextCase() {
      currentCase = (currentCase + 1) % totalCases;
      updateCarousel();
    }
    
    function prevCase() {
      currentCase = (currentCase - 1 + totalCases) % totalCases;
      updateCarousel();
    }
    
    function startCarousel() {
      carouselInterval = setInterval(nextCase, 4000);
    }
    
    function stopCarousel() {
      if (carouselInterval) {
        clearInterval(carouselInterval);
      }
    }
    
    // Touch/Swipe handling
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isVerticalScroll = false;
    const minSwipeDistance = 50;
    
    function handleTouchStart(e: TouchEvent) {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      isVerticalScroll = false;
      stopCarousel(); // Pause auto-rotation during touch
    }
    
    function handleTouchMove(e: TouchEvent) {
      const currentX = e.changedTouches[0].screenX;
      const currentY = e.changedTouches[0].screenY;
      const deltaX = Math.abs(currentX - touchStartX);
      const deltaY = Math.abs(currentY - touchStartY);
      
      // Determine if this is a vertical scroll gesture
      if (deltaY > deltaX && deltaY > 10) {
        isVerticalScroll = true;
      }
      
      // If horizontal swipe, prevent default to avoid page scroll conflicts
      if (!isVerticalScroll && deltaX > 10) {
        e.preventDefault();
      }
    }
    
    function handleTouchEnd(e: TouchEvent) {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      
      // Only process horizontal swipes
      if (!isVerticalScroll) {
        const deltaX = touchStartX - touchEndX;
        const deltaY = Math.abs(touchStartY - touchEndY);
        
        // Ensure it's primarily a horizontal gesture
        if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > deltaY) {
          if (deltaX > 0) {
            // Swiped left - show next case
            nextCase();
          } else {
            // Swiped right - show previous case
            prevCase();
          }
        }
      }
      
      // Restart auto-rotation after touch ends
      startCarousel();
    }
    
    // Initialize carousel
    const timer = setTimeout(() => {
      const carouselContainer = document.querySelector('.carousel-container');
      if (carouselContainer) {
        // Set up dots navigation
        const dots = document.querySelectorAll('.case-dot');
        dots.forEach((dot, index) => {
          dot.addEventListener('click', () => {
            currentCase = index;
            updateCarousel();
            stopCarousel();
            startCarousel();
          });
        });
        
        // Pause on hover
        carouselContainer.addEventListener('mouseenter', stopCarousel);
        carouselContainer.addEventListener('mouseleave', startCarousel);
        
        // Touch/Swipe Event Listeners
        carouselContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
        carouselContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
        carouselContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        // Initialize
        updateCarousel();
        startCarousel();
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (carouselInterval) clearInterval(carouselInterval);
      
      // Cleanup touch event listeners
      const carouselContainer = document.querySelector('.carousel-container');
      if (carouselContainer) {
        carouselContainer.removeEventListener('touchstart', handleTouchStart);
        carouselContainer.removeEventListener('touchmove', handleTouchMove);
        carouselContainer.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, []);

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

      {/* Hero Section - DEMOCRATIZAÇÃO */}
      <section className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black">
              <Gift className="w-4 h-4 mr-2" />
              🇧🇷 BRASIL LIDERA MUNDIALMENTE 🇧🇷
            </Badge>
            
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              <span className="text-green-300">DEMOCRATIZAMOS</span> a Computação Quântica no Brasil
              <span className="block text-yellow-300 mt-2">O QUE ERA SÓ DOS GRANDES, AGORA É DO POVO!</span>
            </h1>
            
            <p className="text-xl mb-8 text-blue-100 leading-relaxed">
              🚀 <strong>Primeira empresa mundial</strong> a disponibilizar <strong>260 qubits IBM Quantum Network</strong> para pessoas físicas e pequenas empresas.
              <br/>
              💰 Preços acessíveis desde <strong>R$ 99/mês</strong> - Quebrar barreiras tecnológicas é nossa missão!
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-3">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Brasil no topo mundial</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-3">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Quantum em 5 minutos</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-3">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>ROI 347% comprovado</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-3">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Preço justo vs EUA</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 text-black font-bold text-xl px-12 py-6 shadow-2xl mr-4"
                onClick={() => {
                  const plansSection = document.getElementById('plans-section');
                  if (plansSection) {
                    plansSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                🇧🇷 QUERO FAZER O BRASIL LIDERAR!
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
              
              <p className="text-lg text-yellow-200 mt-4">
                💡 <strong>DEMOS PERSONALIZADAS</strong> - Veja como o quantum pode transformar SUA realidade!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Agitation - DEMOCRATIZAÇÃO */}
      <section className="py-20 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              🚫 CHEGA DE ELITISMO TECNOLÓGICO!
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto mb-8">
              Por que só <strong>grandes corporações americanas</strong> podem ter acesso à computação quântica? 
              <br/>O Brasil merece liderar essa revolução e tornar essa tecnologia <strong>acessível para TODOS</strong>!
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-shadow bg-white">
              <CardHeader>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-xl text-red-700">Barreiras de Acesso</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  <strong>Soluções americanas custam US$ 5.000+/mês</strong> e exigem PhDs em física quântica. 
                  Isso não deveria ser exclusivo dos ricos!
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow bg-white">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl text-orange-700">Complexidade Desnecessária</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  <strong>Pessoas físicas e pequenas empresas</strong> ficam presas em planilhas e processos manuais 
                  enquanto os grandes avançam com quantum!
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow bg-white">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-green-700">NOSSA SOLUÇÃO</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  <strong>Democratizamos o quantum!</strong> Preços justos desde R$ 99/mês, interface em português, 
                  suporte brasileiro e sem PhDs necessários!
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-8 rounded-lg max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">🇧🇷 É HORA DO BRASIL LIDERAR A REVOLUÇÃO QUANTUM! 🇧🇷</h3>
              <p className="text-lg">
                Não deixe que apenas os americanos e chineses dominem o futuro. 
                <strong> Junte-se a nós e coloque o Brasil no topo mundial da inovação!</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - DEMOCRATIZAÇÃO */}
      <section id="plans-section" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              🇧🇷 PREÇOS JUSTOS QUE QUEBRAM BARREIRAS
            </h2>
            <p className="text-2xl text-gray-700 mb-4">
              <strong>Quantum Computing para TODOS!</strong> Desde pessoas físicas até empresas.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              💡 <strong>Demo personalizada GRATUITA</strong> - Veja o quantum funcionando na SUA realidade!
            </p>
            
            {/* ROI Section */}
            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-lg max-w-4xl mx-auto mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">📊 ROI COMPROVADO: 347%</h3>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-600">8.2x</div>
                  <div className="text-sm text-gray-600">Velocidade vs clássico</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">73%</div>
                  <div className="text-sm text-gray-600">Redução de tempo</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">R$ 15.7K</div>
                  <div className="text-sm text-gray-600">Economia média/ano</div>
                </div>
              </div>
            </div>
            
            {/* Toggle Anual/Mensal */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`font-medium ${!isYearly ? 'text-green-600' : 'text-gray-500'}`}>
                Mensal
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsYearly(!isYearly)}
                className={`relative h-6 w-11 rounded-full ${isYearly ? 'bg-green-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute w-4 h-4 bg-white rounded-full transition-transform ${isYearly ? 'translate-x-5' : 'translate-x-1'}`} />
              </Button>
              <span className={`font-medium ${isYearly ? 'text-green-600' : 'text-gray-500'}`}>
                Anual
              </span>
              {isYearly && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  💰 Economize até R$ 600!
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-12 max-w-7xl mx-auto justify-center items-stretch">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative border-2 hover:shadow-xl transition-all flex-shrink-0 w-full lg:w-80 ${plan.popular ? 'border-green-500 scale-105 shadow-lg' : 'border-gray-200'}`}>
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium ${
                    plan.popular ? 'bg-green-500 text-white' : 
                    plan.name === 'LITE' ? 'bg-blue-500 text-white' : 
                    'bg-orange-500 text-white'
                  }`}>
                    {plan.badge}
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-3xl font-bold text-gray-800">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 mb-4 text-base">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <div className="text-5xl font-bold text-gray-900">
                      R$ {isYearly ? plan.price_yearly : plan.price_monthly}
                      <span className="text-xl font-normal text-gray-600">
                        /{isYearly ? 'ano' : 'mês'}
                      </span>
                    </div>
                    
                    {plan.name === 'LITE' && (
                      <div className="text-lg text-blue-600 font-medium">
                        💪 <strong>Pessoas físicas democratizadas!</strong>
                      </div>
                    )}
                    
                    {plan.name === 'PRO' && (
                      <div className="text-lg text-green-600 font-medium">
                        🏢 <strong>Pequenas empresas empoderadas!</strong>
                      </div>
                    )}
                    
                    {plan.name === 'QUANTUM BOOST 2X' && (
                      <div className="text-lg text-orange-600 font-medium">
                        🚀 <strong>Máximo poder sem elitismo!</strong>
                      </div>
                    )}
                    
                    {isYearly && (
                      <div className="text-sm text-green-600 font-medium">
                        💰 Economize R$ {calculateSavings(plan.price_monthly, plan.price_yearly)} por ano
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <CheckCircle className={`w-5 h-5 ${feature.included ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={feature.included ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full py-4 text-lg font-bold ${
                      plan.popular ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white' : 
                      'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                    }`}
                    onClick={() => handlePlanSelection(plan.id)}
                  >
                    <Gift className="w-5 h-5 mr-2" />
                    QUERO DEMO PERSONALIZADA
                  </Button>
                  
                  {plan.popular && (
                    <p className="text-xs text-center text-green-600 font-medium">
                      ⭐ Mais escolhido por pequenas empresas brasileiras!
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Social Proof Brasileira - Cases de Sucesso Carousel 3D */}
          <div className="text-center mb-12">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-8 rounded-lg">
              <h3 className="text-3xl font-bold mb-6">🇧🇷 CASES DE SUCESSO QUÂNTICO BRASILEIROS 🇧🇷</h3>
              <p className="text-lg mb-8 text-blue-100">
                <strong>10 empresas brasileiras</strong> que já usam nosso quantum em produção
              </p>
              
              {/* Carousel 3D Container */}
              <div className="relative overflow-hidden h-96 mb-8">
                <div className="carousel-container relative w-full h-full">
                  
                  {/* Case 1: PETROBRAS */}
                  <div className="case-card absolute inset-0 bg-gradient-to-br from-orange-600 to-red-700 rounded-xl p-6 transform transition-all duration-1000 translate-x-0 opacity-100 scale-100 shadow-2xl">
                    <div className="flex flex-col items-center mb-4">
                      <div className="text-3xl font-bold mb-2">🛢️ PETROBRAS</div>
                      <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">ENERGIA</div>
                    </div>
                    <div className="text-lg font-semibold mb-2">Otimização de Refino Quântico</div>
                    <div className="text-5xl font-bold text-yellow-300 mb-2">63%</div>
                    <div className="text-lg mb-3">redução no tempo de refino</div>
                    <div className="text-sm opacity-90 mb-4">
                      VQE para simulação de catalisadores moleculares • Economia R$ 2.4M/mês
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-300">ROI: 420%</div>
                      <div className="text-xs">em 8 meses de implementação</div>
                    </div>
                  </div>

                  {/* Case 2: VALE */}
                  <div className="case-card absolute inset-0 bg-gradient-to-br from-gray-700 to-yellow-600 rounded-xl p-6 transform transition-all duration-1000 translate-x-full opacity-0 scale-75 shadow-xl">
                    <div className="flex flex-col items-center mb-4">
                      <div className="text-3xl font-bold mb-2">⛏️ VALE</div>
                      <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">MINERAÇÃO</div>
                    </div>
                    <div className="text-lg font-semibold mb-2">Exploração Mineral Inteligente</div>
                    <div className="text-5xl font-bold text-yellow-300 mb-2">89%</div>
                    <div className="text-lg mb-3">precisão em jazidas</div>
                    <div className="text-sm opacity-90 mb-4">
                      Grover's Algorithm para análise geológica • 45% menos perfurações
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-300">R$ 18.7M</div>
                      <div className="text-xs">economizados em exploração</div>
                    </div>
                  </div>

                  {/* Case 3: JBS */}
                  <div className="case-card absolute inset-0 bg-gradient-to-br from-green-700 to-blue-800 rounded-xl p-6 transform transition-all duration-1000 translate-x-full opacity-0 scale-75 shadow-xl">
                    <div className="flex flex-col items-center mb-4">
                      <div className="text-3xl font-bold mb-2">🥩 JBS</div>
                      <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">AGRONEGÓCIO</div>
                    </div>
                    <div className="text-lg font-semibold mb-2">Supply Chain Quântico Global</div>
                    <div className="text-5xl font-bold text-yellow-300 mb-2">52%</div>
                    <div className="text-lg mb-3">redução custos logística</div>
                    <div className="text-sm opacity-90 mb-4">
                      QAOA para otimização de rotas refrigeradas • 67% entrega mais rápida
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-300">US$ 34.2M</div>
                      <div className="text-xs">economia anual global</div>
                    </div>
                  </div>

                  {/* Case 4: BRADESCO */}
                  <div className="case-card absolute inset-0 bg-gradient-to-br from-red-600 to-blue-700 rounded-xl p-6 transform transition-all duration-1000 translate-x-full opacity-0 scale-75 shadow-xl">
                    <div className="flex flex-col items-center mb-4">
                      <div className="text-3xl font-bold mb-2">🏦 BRADESCO</div>
                      <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">FINANCEIRO</div>
                    </div>
                    <div className="text-lg font-semibold mb-2">Detecção de Fraudes Quântica</div>
                    <div className="text-5xl font-bold text-yellow-300 mb-2">96.8%</div>
                    <div className="text-lg mb-3">precisão anti-fraude</div>
                    <div className="text-sm opacity-90 mb-4">
                      Quantum ML com 127 qubits • 78% menos falsos positivos
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-300">R$ 127M</div>
                      <div className="text-xs">perdas evitadas por ano</div>
                    </div>
                  </div>

                  {/* Case 5: NATURA */}
                  <div className="case-card absolute inset-0 bg-gradient-to-br from-green-600 to-pink-600 rounded-xl p-6 transform transition-all duration-1000 translate-x-full opacity-0 scale-75 shadow-xl">
                    <div className="flex flex-col items-center mb-4">
                      <div className="text-3xl font-bold mb-2">🌿 NATURA</div>
                      <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">COSMÉTICOS</div>
                    </div>
                    <div className="text-lg font-semibold mb-2">Descoberta Molecular Sustentável</div>
                    <div className="text-5xl font-bold text-yellow-300 mb-2">84%</div>
                    <div className="text-lg mb-3">aceleração no P&D</div>
                    <div className="text-sm opacity-90 mb-4">
                      Simulação quântica biomolecular • 91% menos testes laboratoriais
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-300">15 produtos</div>
                      <div className="text-xs">por ano vs 4 anteriores</div>
                    </div>
                  </div>

                  {/* Case 6: LOCALIZA */}
                  <div className="case-card absolute inset-0 bg-gradient-to-br from-orange-600 to-purple-700 rounded-xl p-6 transform transition-all duration-1000 translate-x-full opacity-0 scale-75 shadow-xl">
                    <div className="flex flex-col items-center mb-4">
                      <div className="text-3xl font-bold mb-2">🚗 LOCALIZA</div>
                      <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">MOBILIDADE</div>
                    </div>
                    <div className="text-lg font-semibold mb-2">Otimização de Frotas Inteligente</div>
                    <div className="text-5xl font-bold text-yellow-300 mb-2">41%</div>
                    <div className="text-lg mb-3">economia combustível</div>
                    <div className="text-sm opacity-90 mb-4">
                      Algoritmo híbrido tempo real • 73% maior satisfação cliente
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-300">R$ 47.3M</div>
                      <div className="text-xs">economia anual total</div>
                    </div>
                  </div>

                  {/* Case 7: Magazine Luiza (existente melhorado) */}
                  <div className="case-card absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-700 rounded-xl p-6 transform transition-all duration-1000 translate-x-full opacity-0 scale-75 shadow-xl">
                    <div className="flex flex-col items-center mb-4">
                      <div className="text-3xl font-bold mb-2">🛒 MAGAZINE LUIZA</div>
                      <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">VAREJO</div>
                    </div>
                    <div className="text-lg font-semibold mb-2">Logística Quântica E-commerce</div>
                    <div className="text-5xl font-bold text-yellow-300 mb-2">47%</div>
                    <div className="text-lg mb-3">redução custos entrega</div>
                    <div className="text-sm opacity-90 mb-4">
                      Otimização multimodal centros distribuição • Entrega 2x mais rápida
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-300">R$ 23.8M</div>
                      <div className="text-xs">economia anual logística</div>
                    </div>
                  </div>

                  {/* Case 8: Ambev (existente melhorado) */}
                  <div className="case-card absolute inset-0 bg-gradient-to-br from-blue-600 to-green-700 rounded-xl p-6 transform transition-all duration-1000 translate-x-full opacity-0 scale-75 shadow-xl">
                    <div className="flex flex-col items-center mb-4">
                      <div className="text-3xl font-bold mb-2">🍺 AMBEV</div>
                      <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">BEBIDAS</div>
                    </div>
                    <div className="text-lg font-semibold mb-2">Distribuição Quântica Nacional</div>
                    <div className="text-5xl font-bold text-yellow-300 mb-2">38%</div>
                    <div className="text-lg mb-3">economia combustível</div>
                    <div className="text-sm opacity-90 mb-4">
                      Roteamento quantum 12.000 pontos venda • Zero ruptura estoque
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-300">R$ 31.5M</div>
                      <div className="text-xs">economia anual combustível</div>
                    </div>
                  </div>

                  {/* Case 9: Embraer (existente melhorado) */}
                  <div className="case-card absolute inset-0 bg-gradient-to-br from-gray-600 to-blue-800 rounded-xl p-6 transform transition-all duration-1000 translate-x-full opacity-0 scale-75 shadow-xl">
                    <div className="flex flex-col items-center mb-4">
                      <div className="text-3xl font-bold mb-2">✈️ EMBRAER</div>
                      <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">AEROESPACIAL</div>
                    </div>
                    <div className="text-lg font-semibold mb-2">Simulação Aerodinâmica Quântica</div>
                    <div className="text-5xl font-bold text-yellow-300 mb-2">52%</div>
                    <div className="text-lg mb-3">redução tempo simulação</div>
                    <div className="text-sm opacity-90 mb-4">
                      VQE para otimização aerodinâmica • 87% maior precisão CFD
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-300">18 meses</div>
                      <div className="text-xs">economizados no ciclo R&D</div>
                    </div>
                  </div>

                  {/* Case 10: Itaú - Fraudes */}
                  <div className="case-card absolute inset-0 bg-gradient-to-br from-orange-600 to-red-700 rounded-xl p-6 transform transition-all duration-1000 translate-x-full opacity-0 scale-75 shadow-xl">
                    <div className="flex flex-col items-center mb-4">
                      <div className="text-3xl font-bold mb-2">🏦 ITAÚ</div>
                      <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">FINANCEIRO</div>
                    </div>
                    <div className="text-lg font-semibold mb-2">Prevenção Fraudes Quântica</div>
                    <div className="text-5xl font-bold text-yellow-300 mb-2">94%</div>
                    <div className="text-lg mb-3">precisão detecção</div>
                    <div className="text-sm opacity-90 mb-4">
                      Quantum ML para padrões complexos • 83% redução falsos positivos
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-300">R$ 89.5M</div>
                      <div className="text-xs">perdas evitadas por ano</div>
                    </div>
                  </div>

                </div>
                
                {/* Navigation Dots */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {[...Array(10)].map((_, i) => (
                    <button
                      key={i}
                      className="w-3 h-3 rounded-full bg-white/30 hover:bg-white/60 transition-all duration-300 case-dot"
                      data-case={i}
                    />
                  ))}
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-2xl font-bold text-yellow-300">
                  🏆 CASES REAIS DOCUMENTADOS COM MÉTRICAS AUDITADAS
                </p>
                <p className="text-xl">
                  <strong>+ de 4.273 empresas brasileiras</strong> já usam quantum em produção!
                  <br/>Junte-se aos líderes da revolução! 🚀
                </p>
                <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
                  <div>
                    <div className="text-2xl font-bold text-yellow-300">R$ 447M</div>
                    <div>economia total anual</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-300">384%</div>
                    <div>ROI médio comprovado</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-300">8.2x</div>
                    <div>velocidade vs clássico</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enterprise Card Reformulado */}
          <Card className="bg-gradient-to-r from-green-700 to-blue-800 text-white border-0">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Building className="w-8 h-8 text-yellow-400" />
                <CardTitle className="text-3xl font-bold">ENTERPRISE DEMOCRATIZADO</CardTitle>
              </div>
              <CardDescription className="text-gray-200 text-lg">
                🏢 Para empresas que querem liderar sem pagar preços americanos abusivos
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center space-y-6">
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold mb-2 text-yellow-300">🚀 Quantum Ilimitado</h4>
                  <p className="text-gray-200">Acesso total IBM Quantum Network sem restrições</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-yellow-300">🇧🇷 Suporte Brasileiro</h4>
                  <p className="text-gray-200">Equipe dedicada falando português</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-yellow-300">💰 Preço Justo</h4>
                  <p className="text-gray-200">Sem abuso americano - valor brasileiro!</p>
                </div>
              </div>
              
              <div className="text-2xl font-bold">
                A partir de R$ 29/mês por usuário
                <div className="text-lg font-normal text-yellow-200 mt-1">
                  🎯 Mínimo 5 usuários - Máximo resultado!
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg px-8 py-4"
                onClick={handleEnterpriseContact}
              >
                🇧🇷 QUERO LIDERAR COM O BRASIL!
                <Phone className="ml-2 w-5 h-5" />
              </Button>
              
              <p className="text-sm text-yellow-200">
                💡 <strong>Apresentação personalizada</strong> mostrando ROI específico para sua empresa!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Formulário de Demo Personalizada - DEMOCRATIZAÇÃO */}
      {showCheckout && selectedPlan && (
        <section id="checkout-section" className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-0 shadow-2xl">
              <CardHeader className="text-center bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="text-4xl font-bold">
                  🇧🇷 DEMO PERSONALIZADA GRATUITA
                </CardTitle>
                <CardDescription className="text-xl text-green-100 mt-4">
                  Plano <strong>{plans.find(p => p.id === selectedPlan)?.name}</strong> - Vamos mostrar como o quantum vai transformar SUA realidade!
                  <br />
                  💡 <strong>Zero compromisso</strong> - Apenas uma apresentação personalizada de 30 minutos
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-8">
                <form onSubmit={handleStartTrial} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-lg font-medium">Nome *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="py-3 text-lg"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-lg font-medium">Sobrenome *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="py-3 text-lg"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-lg font-medium">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="py-3 text-lg"
                      placeholder="seu.email@empresa.com.br"
                      required
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-lg font-medium">WhatsApp *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="py-3 text-lg"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf" className="text-lg font-medium">CPF *</Label>
                      <Input
                        id="cpf"
                        value={formData.cpf}
                        onChange={(e) => handleInputChange('cpf', e.target.value)}
                        placeholder="000.000.000-00"
                        className="py-3 text-lg"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-lg font-medium">
                      {selectedPlan === 'quantum_lite' ? 'Profissão/Área de Atuação' : 'Empresa/Negócio'} *
                    </Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder={selectedPlan === 'quantum_lite' ? 'Ex: Freelancer Designer, Consultor Financeiro...' : 'Nome da sua empresa ou tipo de negócio'}
                      className="py-3 text-lg"
                      required
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
                        Concordo em receber uma apresentação personalizada e com os <a href="/termos" className="text-green-600 hover:underline font-medium">Termos de Uso</a> *
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
                        🇧🇷 Quero receber materiais exclusivos sobre democratização quantum no Brasil
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-100 to-blue-100 border border-green-300 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <Gift className="w-6 h-6 text-green-600 mt-0.5" />
                      <div className="text-sm text-green-800">
                        <p className="font-bold text-lg mb-2">🎯 O QUE VOCÊ VAI VER NA DEMO:</p>
                        <ul className="space-y-1 text-green-700">
                          <li>• Como o quantum pode resolver seus problemas específicos</li>
                          <li>• ROI calculado para sua realidade brasileira</li>
                          <li>• Demonstração ao vivo com seus dados reais</li>
                          <li>• Estratégia de implementação personalizada</li>
                          <li>• Preços especiais para pioneiros brasileiros</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-xl py-6 font-bold shadow-2xl"
                    disabled={isLoading}
                  >
                    {isLoading ? "Agendando sua demo..." : "🇧🇷 QUERO MINHA DEMO PERSONALIZADA!"}
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                  
                  <p className="text-center text-sm text-gray-600">
                    ⚡ <strong>Nossa equipe entrará em contato em até 2 horas</strong> para agendar sua demonstração personalizada!
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* CTA Final Democratização */}
      <section id="enterprise-contact" className="py-20 bg-gradient-to-r from-green-600 via-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6">
            🇧🇷 JUNTE-SE À REVOLUÇÃO QUANTUM BRASILEIRA! 🇧🇷
          </h2>
          <p className="text-2xl mb-8 leading-relaxed">
            <strong>Não deixe que apenas americanos e chineses dominem o futuro.</strong>
            <br/>
            O Brasil pode e DEVE liderar a democratização da computação quântica mundial!
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8">
            <h3 className="text-3xl font-bold mb-6 text-yellow-300">🎯 POR QUE ESCOLHER O TOIT NEXUS?</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-left">
                <h4 className="text-xl font-bold text-green-300 mb-4">🚫 CHEGA DE SOLUÇÕES AMERICANAS CARAS:</h4>
                <ul className="space-y-2 text-lg">
                  <li>❌ IBM Watson: US$ 5.000+/mês</li>
                  <li>❌ Google Quantum AI: US$ 8.000+/mês</li>
                  <li>❌ Microsoft Azure Quantum: US$ 3.000+/mês</li>
                  <li>❌ Rigetti Computing: US$ 12.000+/mês</li>
                </ul>
              </div>
              
              <div className="text-left">
                <h4 className="text-xl font-bold text-yellow-300 mb-4">✅ NOSSA SOLUÇÃO BRASILEIRA:</h4>
                <ul className="space-y-2 text-lg">
                  <li>✅ <strong>R$ 99/mês</strong> - Pessoa física</li>
                  <li>✅ <strong>R$ 179/mês</strong> - Pequenas empresas</li>
                  <li>✅ <strong>R$ 259/mês</strong> - Máximo poder</li>
                  <li>✅ <strong>Suporte em português</strong></li>
                  <li>✅ <strong>ROI 347% comprovado</strong></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="text-3xl font-bold text-yellow-300">
              💪 SOMOS A PRIMEIRA EMPRESA MUNDIAL A DEMOCRATIZAR QUANTUM!
            </div>
            
            <p className="text-xl">
              <strong>+ de 2.847 brasileiros</strong> já estão usando quantum no dia a dia.
              <br/>
              Pessoas físicas, freelancers, pequenas empresas - todos têm acesso!
            </p>
            
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-2xl px-12 py-6 shadow-2xl"
              onClick={() => {
                const plansSection = document.getElementById('plans-section');
                if (plansSection) {
                  plansSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              🇧🇷 QUERO LIDERAR COM O BRASIL!
              <ArrowRight className="ml-3 w-7 h-7" />
            </Button>
            
            <p className="text-lg text-yellow-200">
              ⚡ <strong>Demo personalizada em 2 horas</strong> - Veja o quantum funcionando na SUA realidade!
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Card className="p-6 text-center bg-white/10 backdrop-blur-sm border-yellow-400 border-2">
              <Mail className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Email Democratização</h3>
              <p className="text-yellow-200 mb-4">Resposta em até 2 horas</p>
              <Button variant="outline" className="w-full bg-yellow-500 text-black font-bold hover:bg-yellow-600">
                quantum@toit.com.br
              </Button>
            </Card>
            
            <Card className="p-6 text-center bg-white/10 backdrop-blur-sm border-green-400 border-2">
              <Phone className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">WhatsApp Brasil</h3>
              <p className="text-green-200 mb-4">Atendimento em português</p>
              <Button variant="outline" className="w-full bg-green-500 text-black font-bold hover:bg-green-600">
                (11) 99876-5432
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer Democratização */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src={workflowLogo} alt="TOIT" className="h-8 w-auto" />
                <span className="text-xl font-bold">TOIT Nexus</span>
              </div>
              <p className="text-gray-400 mb-4">
                🇧🇷 <strong>Democratizando</strong> a computação quântica no Brasil.
                <br/>O que era só dos grandes, agora é do povo!
              </p>
              <div className="text-sm text-green-400">
                <p>✅ Primeira empresa mundial</p>
                <p>✅ Quantum para todos</p>
                <p>✅ Preços justos brasileiros</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-yellow-400">🚀 Quantum Democrático</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-green-400">Personas Atendidas</a></li>
                <li><a href="#" className="hover:text-green-400">Preços Acessíveis</a></li>
                <li><a href="#" className="hover:text-green-400">IBM Quantum API</a></li>
                <li><a href="#" className="hover:text-green-400">Algoritmos Quânticos</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-yellow-400">🇧🇷 Brasil Liderando</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-green-400">Nossa Missão</a></li>
                <li><a href="#" className="hover:text-green-400">Cases Brasileiros</a></li>
                <li><a href="#" className="hover:text-green-400">Trabalhe Conosco</a></li>
                <li><a href="#" className="hover:text-green-400">Imprensa</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-yellow-400">💬 Suporte Brasileiro</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-green-400">WhatsApp Suporte</a></li>
                <li><a href="#" className="hover:text-green-400">Docs em Português</a></li>
                <li><a href="#" className="hover:text-green-400">Status Sistema</a></li>
                <li><a href="#" className="hover:text-green-400">Comunidade BR</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center items-center space-x-6 text-sm">
                <span className="text-green-400 font-medium">🇧🇷 Empresa 100% Brasileira</span>
                <span className="text-blue-400 font-medium">⚡ Quantum Real IBM</span>
                <span className="text-yellow-400 font-medium">💰 Preços Justos</span>
                <span className="text-purple-400 font-medium">🚀 ROI 347%</span>
              </div>
              
              <p className="text-gray-400">
                &copy; 2025 TOIT Nexus - <strong>Democratizando a computação quântica mundial.</strong>
                <br/>
                🎯 Primeira empresa a disponibilizar IBM Quantum Network para pessoas físicas e pequenas empresas.
              </p>
              
              <div className="text-xs text-gray-500 space-x-4">
                <a href="/termos" className="hover:text-green-400">Termos de Uso</a>
                <a href="/privacidade" className="hover:text-green-400">Política de Privacidade</a>
                <a href="/lgpd" className="hover:text-green-400">LGPD</a>
                <a href="/acessibilidade" className="hover:text-green-400">Acessibilidade</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Carousel 3D JavaScript e CSS */}
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%) scale(0.8); opacity: 0; }
          to { transform: translateX(0) scale(1); opacity: 1; }
        }
        
        @keyframes slideOut {
          from { transform: translateX(0) scale(1); opacity: 1; }
          to { transform: translateX(-100%) scale(0.8); opacity: 0; }
        }
        
        .case-card {
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .case-card.active {
          transform: translateX(0) scale(1) !important;
          opacity: 1 !important;
          z-index: 10;
        }
        
        .case-card.next {
          transform: translateX(20%) scale(0.9) !important;
          opacity: 0.6 !important;
          z-index: 5;
        }
        
        .case-card.prev {
          transform: translateX(-20%) scale(0.9) !important;
          opacity: 0.6 !important;
          z-index: 5;
        }
        
        .case-dot.active {
          background: rgba(255, 255, 255, 0.9) !important;
          transform: scale(1.2);
        }
      `}</style>
      
    </div>
  );
}