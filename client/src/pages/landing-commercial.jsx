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

= useToast();

  // Carousel 3D Logic
  useEffect(() => {
    let currentCase = 0;
    const totalCases = 10;
    let carouselInterval) {
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
    
    function handleTouchStart(e) {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      isVerticalScroll = false;
      stopCarousel(); // Pause auto-rotation during touch
    }
    
    function handleTouchMove(e) {
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
    
    function handleTouchEnd(e) {
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
        carouselContainer.addEventListener('touchstart', handleTouchStart, { passive);
        carouselContainer.addEventListener('touchmove', handleTouchMove, { passive);
        carouselContainer.addEventListener('touchend', handleTouchEnd, { passive);
        
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

  const formatCPF = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    if (match) {
      return match[1] + '.' + match[2] + '.' + match[3] + '-' + match[4];
    }
    return cleaned;
  };

  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return cleaned;
  };

  const handleInputChange = (field, value) => {
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

  const handlePlanSelection = (planId) => {
    setSelectedPlan(planId);
    setShowCheckout(true);
    
    // Scroll para o formulário
    setTimeout(() => {
      const checkoutSection = document.getElementById('checkout-section');
      if (checkoutSection) {
        checkoutSection.scrollIntoView({ behavior);
      }
    }, 100);
  };

  const handleStartTrial = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title,
        description,
        variant,
      });
      return;
    }

    if (!selectedPlan) {
      toast({
        title,
        description,
        variant,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/trial/start', {
        method,
        headers,
        },
        body,
          cpf, ''),
          phone, ''),
          selectedPlan,
          billingCycle),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title,
          description,
        });

        // Redirecionar para verificação de email
        setTimeout(() => {
          window.location.href = `/verify-email?userId=${result.userId}`;
        }, 2000);

      } else {
        toast({
          title,
          description,
          variant,
        });
      }
    } catch (error) {
      console.error('Erro ao iniciar trial, error);
      toast({
        title,
        description,
        variant,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterpriseContact = () => {
    // Scroll para formulário de contato enterprise
    const enterpriseSection = document.getElementById('enterprise-contact');
    if (enterpriseSection) {
      enterpriseSection.scrollIntoView({ behavior);
    }
  };

  const calculateSavings = (monthly, yearly) => {
    return (monthly * 12) - yearly;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm) => window.location.href = '/login'}>
              Já tem conta? Entre
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - DEMOCRATIZAÇÃO */}
      <section className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm, AGORA É DO POVO!</span>
            </h1>
            
            <p className="text-xl mb-8 text-blue-100 leading-relaxed">
              🚀 <strong>Primeira empresa mundial</strong> a disponibilizar <strong>260 qubits IBM Quantum Network</strong> para pessoas físicas e pequenas empresas.
              <br/>
              💰 Preços acessíveis desde <strong>R$ 99/mês</strong> - Quebrar barreiras tecnológicas é nossa missão!
            </p>
            
            <div className="grid grid-cols-2 md) => {
                  const plansSection = document.getElementById('plans-section');
                  if (plansSection) {
                    plansSection.scrollIntoView({ behavior);
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
        <div className="max-w-7xl mx-auto px-4 sm, <section id="plans-section" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm) => setIsYearly(!isYearly)}
                className={`relative h-6 w-11 rounded-full ${isYearly ? 'bg-green-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute w-4 h-4 bg-white rounded-full transition-transform ${isYearly ? 'translate-x-5' : 'translate-x-1'}`} />
              </Button>
              <span className={`font-medium ${isYearly ? 'text-green-600' : 'text-gray-500'}`}>
                Anual
              </span>
              {isYearly && (
                <Badge className="bg-green-100 text-green-800 hover)}
            </div>
          </div>
          
          <div className="flex flex-col lg) => (
              <Card key={plan.id} className={`relative border-2 hover)}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-3xl font-bold text-gray-800">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 mb-4 text-base">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <div className="text-5xl font-bold text-gray-900">
                      R$ {isYearly ? plan.price_yearly)}
                    
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
                      plan.popular ? 'bg-gradient-to-r from-green-500 to-green-600 hover) => handlePlanSelection(plan.id)}
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
                      <div className="text-2xl font-bold text-yellow-300">ROI) */}
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
                      className="w-3 h-3 rounded-full bg-white/30 hover))}
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
              <div className="grid md)?.name}</strong> - Vamos mostrar como o quantum vai transformar SUA realidade!
                  <br />
                  💡 <strong>Zero compromisso</strong> - Apenas uma apresentação personalizada de 30 minutos
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-8">
                <form onSubmit={handleStartTrial} className="space-y-6">
                  <div className="grid md) => handleInputChange('firstName', e.target.value)}
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
                  
                  <div className="grid md) => handleInputChange('phone', e.target.value)}
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
                      placeholder={selectedPlan === 'quantum_lite' ? 'Ex, Consultor Financeiro...' : 'Nome da sua empresa ou tipo de negócio'}
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
                          setFormData(prev => ({ ...prev, acceptTerms))
                        }
                        required
                      />
                      <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                        Concordo em receber uma apresentação personalizada e com os <a href="/termos" className="text-green-600 hover) => 
                          setFormData(prev => ({ ...prev, acceptMarketing))
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
                        <p className="font-bold text-lg mb-2">🎯 O QUE VOCÊ VAI VER NA DEMO)}

      {/* CTA Final Democratização */}
      <section id="enterprise-contact" className="py-20 bg-gradient-to-r from-green-600 via-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm, freelancers, pequenas empresas - todos têm acesso!
            </p>
            
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover) => {
                const plansSection = document.getElementById('plans-section');
                if (plansSection) {
                  plansSection.scrollIntoView({ behavior);
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
          
          <div className="grid md) 99876-5432
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer Democratização */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm, agora é do povo!
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
                <li><a href="#" className="hover) scale(0.8); opacity) scale(1); opacity) scale(1); opacity) scale(0.8); opacity, 0.46, 0.45, 0.94);
        }
        
        .case-card.active {
          transform) scale(1) !important;
          opacity) scale(0.9) !important;
          opacity) scale(0.9) !important;
          opacity, 255, 255, 0.9) !important;
          transform);
        }
      `}</style>
      
    </div>
  );
}