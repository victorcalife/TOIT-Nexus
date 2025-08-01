import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StandardHeader } from "@/components/standard-header";
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Zap, 
  Shield, 
  BarChart3, 
  Bot, 
  Globe,
  Mail,
  Phone,
  Building,
  Star
} from "lucide-react";
import { useState } from "react";

export default function Landing() {
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);
  const [isWorkflowPlaying, setIsWorkflowPlaying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar envio do formulário
    console.log('Form submitted:', formData);
    alert('Obrigado pelo interesse! Nossa equipe entrará em contato em breve.');
    setShowContactForm(false);
    setFormData({ name: '', email: '', company: '', phone: '', message: '' });
  };

  // Workflow Demo Data
  const workflowSteps = [
    { 
      id: 1, 
      title: "Cliente Faz Pedido", 
      description: "E-commerce recebe novo pedido automaticamente",
      icon: "🛒",
      status: "trigger",
      metrics: { time: "0s", success: "100%" },
      position: { x: 50, y: 100 }
    },
    { 
      id: 2, 
      title: "Verificar Estoque", 
      description: "Consulta automática no sistema de inventário",
      icon: "📦",
      status: "processing",
      metrics: { time: "0.3s", success: "99.9%" },
      position: { x: 280, y: 80 }
    },
    { 
      id: 3, 
      title: "Confirmar Pagamento", 
      description: "Validação com gateway de pagamento",
      icon: "💳",
      status: "processing", 
      metrics: { time: "1.2s", success: "98.5%" },
      position: { x: 280, y: 160 }
    },
    { 
      id: 4, 
      title: "Notificar Cliente", 
      description: "Email e SMS de confirmação automáticos",
      icon: "📧",
      status: "action",
      metrics: { time: "0.1s", success: "100%" },
      position: { x: 510, y: 100 }
    },
    { 
      id: 5, 
      title: "Gerar Etiqueta", 
      description: "Integração com transportadora para envio",
      icon: "📮",
      status: "completed",
      metrics: { time: "0.5s", success: "99.7%" },
      position: { x: 740, y: 120 }
    }
  ];

  const playWorkflowDemo = () => {
    setIsWorkflowPlaying(true);
    setActiveWorkflowStep(0);
    
    workflowSteps.forEach((_, index) => {
      setTimeout(() => {
        setActiveWorkflowStep(index);
        if (index === workflowSteps.length - 1) {
          setTimeout(() => {
            setIsWorkflowPlaying(false);
            setActiveWorkflowStep(0);
          }, 1500);
        }
      }, index * 1000);
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Padronizado */}
      <StandardHeader 
        showLoginButton={true}
        showNavigation={true}
        onContactClick={() => setShowContactForm(true)}
      />

      {/* Hero Section - Moderno + Profissional */}
      <section className="relative overflow-hidden">
        {/* Background Gradient Sofisticado */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20"></div>
        
        {/* Elementos Visuais Inovadores */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Geometric Shapes - Moderno mas Sutil */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Neural Network Pattern - Sutil e Elegante */}
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 1000 800">
            <defs>
              <linearGradient id="networkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
            
            {/* Pontos de Conexão */}
            <circle cx="100" cy="150" r="3" fill="#3b82f6" opacity="0.4">
              <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="300" cy="100" r="3" fill="#8b5cf6" opacity="0.4">
              <animate attributeName="r" values="3;5;3" dur="3s" begin="1s" repeatCount="indefinite"/>
            </circle>
            <circle cx="500" cy="200" r="3" fill="#10b981" opacity="0.4">
              <animate attributeName="r" values="3;5;3" dur="3s" begin="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="700" cy="120" r="3" fill="#3b82f6" opacity="0.4">
              <animate attributeName="r" values="3;5;3" dur="3s" begin="0.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="800" cy="180" r="3" fill="#8b5cf6" opacity="0.4">
              <animate attributeName="r" values="3;5;3" dur="3s" begin="1.5s" repeatCount="indefinite"/>
            </circle>
            
            {/* Linhas de Conexão Animadas */}
            <line x1="100" y1="150" x2="300" y2="100" stroke="url(#networkGradient)" strokeWidth="1" opacity="0.3">
              <animate attributeName="opacity" values="0.1;0.5;0.1" dur="4s" repeatCount="indefinite"/>
            </line>
            <line x1="300" y1="100" x2="500" y2="200" stroke="url(#networkGradient)" strokeWidth="1" opacity="0.3">
              <animate attributeName="opacity" values="0.1;0.5;0.1" dur="4s" begin="1s" repeatCount="indefinite"/>
            </line>
            <line x1="500" y1="200" x2="700" y2="120" stroke="url(#networkGradient)" strokeWidth="1" opacity="0.3">
              <animate attributeName="opacity" values="0.1;0.5;0.1" dur="4s" begin="2s" repeatCount="indefinite"/>
            </line>
            <line x1="700" y1="120" x2="800" y2="180" stroke="url(#networkGradient)" strokeWidth="1" opacity="0.3">
              <animate attributeName="opacity" values="0.1;0.5;0.1" dur="4s" begin="3s" repeatCount="indefinite"/>
            </line>
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-5xl mx-auto">
            
            {/* Badge Inovador */}
            <div className="mb-8 inline-flex items-center">
              <Badge className="bg-white/80 backdrop-blur-sm text-blue-700 border border-blue-200/50 px-6 py-3 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                🚀 Plataforma Líder em Automação Empresarial
                <div className="ml-3 w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </Badge>
            </div>
            
            {/* Título Impactante com Efeito Gradient */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight tracking-tight">
              <span className="text-gray-900">Transforme</span>
              <br/>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent relative">
                Processos
                {/* Underline Animado */}
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transform scale-x-0 animate-pulse opacity-60" style={{ animation: 'scaleX 3s ease-in-out infinite' }}></div>
              </span>
              <br/>
              <span className="text-gray-900">em </span>
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                Resultados
              </span>
            </h1>
            
            {/* Subtítulo Sofisticado */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-4xl mx-auto">
              Democratize a automação empresarial com nossa plataforma 
              <span className="font-semibold text-gray-800"> no-code inteligente</span>. 
              Mais de <span className="font-bold text-blue-600">15.000 empresas</span> já aceleram 
              resultados com workflows que <span className="font-semibold text-gray-800">pensam por si só</span>.
            </p>

            {/* CTAs Sofisticados */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button 
                onClick={() => setShowContactForm(true)}
                size="lg" 
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 text-lg font-bold rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></div>
                  🎯 Demonstração ao Vivo
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>
              
              <Link href="/simple-login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="group border-2 border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-700 px-10 py-5 text-lg rounded-2xl backdrop-blur-sm bg-white/80 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center">
                    Acessar Plataforma
                    <div className="ml-3 w-6 h-6 rounded-full border-2 border-current group-hover:rotate-90 transition-transform duration-300 flex items-center justify-center">
                      <div className="w-2 h-2 bg-current rounded-full"></div>
                    </div>
                  </div>
                </Button>
              </Link>
            </div>

            {/* Stats Modernos com Animação */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { value: "15K+", label: "Empresas Ativas", icon: "🏢", color: "from-blue-500 to-cyan-500" },
                { value: "99.9%", label: "Uptime SLA", icon: "⚡", color: "from-green-500 to-emerald-500" },
                { value: "5M+", label: "Workflows Criados", icon: "🔄", color: "from-purple-500 to-pink-500" },
                { value: "2min", label: "Setup Médio", icon: "⏱️", color: "from-orange-500 to-red-500" }
              ].map((stat, i) => (
                <div key={i} className="group relative">
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <div className="text-center">
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <div className={`text-4xl font-black mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </div>
                      <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
                    </div>
                    
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 pt-8 border-t border-gray-200/50">
              <p className="text-sm text-gray-500 mb-6">Confiado por empresas de todos os segmentos</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                {['FinTech', 'E-commerce', 'SaaS', 'Healthcare', 'Manufacturing', 'Retail'].map((industry, i) => (
                  <div key={i} className="px-4 py-2 bg-white/40 rounded-full text-sm text-gray-600 font-medium">
                    {industry}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes scaleX {
            0%, 100% { transform: scaleX(0); }
            50% { transform: scaleX(1); }
          }
        `}</style>
      </section>

      {/* Interactive Workflow Demo Section - Inovador + Profissional */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background Pattern Sutil */}
        <div className="absolute inset-0 opacity-5">
          <div style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)`,
            backgroundSize: '50% 50%',
            height: '100%'
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center mb-6">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200/50">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700">Demo Interativa</span>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="text-gray-900">Workflow Builder</span>
              <br/>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Inteligente
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Veja como é <span className="font-semibold text-gray-800">simples e poderoso</span> criar automações 
              complexas. Nossa interface visual transforma <span className="font-semibold text-blue-600">processos 
              manuais</span> em <span className="font-semibold text-purple-600">inteligência automatizada</span>.
            </p>
          </div>

          {/* Demo: Da Criação aos Resultados */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 relative">
            {/* Header Inteligente */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 px-8 py-6 border-b border-gray-200/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Nexus Workflow Studio</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Cenário:</strong> Automatizar processo de aprovação de orçamentos
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                        ⚡ Tempo: 2.3s
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                        📊 ROI: +340%
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Era manual: 2h → Agora: 2.3s
                    </div>
                  </div>
                  
                  <Button 
                    onClick={playWorkflowDemo}
                    disabled={isWorkflowPlaying}
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg transition-all duration-300"
                  >
                    {isWorkflowPlaying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Criando & Executando...
                      </>
                    ) : (
                      <>
                        🚀 Ver Criação + Execução
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Interface do Sistema Nexus */}
            <div className="p-8 min-h-[600px] relative">
              {/* Simulação da Interface Real */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 min-h-[550px] relative overflow-hidden">
                
                {/* Barra Superior (Como no Sistema Real) */}
                <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">N</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Novo Workflow</h4>
                      <p className="text-xs text-gray-500">Aprovação de Orçamentos</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>Última execução: há 2 min</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                {/* Área Principal Dividida */}
                <div className="grid lg:grid-cols-3 h-full">
                  
                  {/* 1. Criação do Workflow (Esquerda) */}
                  <div className="bg-gray-50 border-r border-gray-200 p-6">
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center mr-2">1</span>
                        Montagem Visual
                      </h5>
                      <p className="text-xs text-gray-600 mb-4">Arrastar componentes para criar o fluxo</p>
                    </div>

                    {/* Componentes Disponíveis */}
                    <div className="space-y-2">
                      {[
                        { icon: "📝", name: "Formulário", desc: "Solicitar orçamento", active: activeWorkflowStep >= 0 },
                        { icon: "🔍", name: "Validação", desc: "Verificar dados", active: activeWorkflowStep >= 1 },
                        { icon: "👤", name: "Aprovador", desc: "Enviar p/ gestor", active: activeWorkflowStep >= 2 },
                        { icon: "✅", name: "Decisão", desc: "Aprovar/Rejeitar", active: activeWorkflowStep >= 3 },
                        { icon: "📧", name: "Notificar", desc: "Informar resultado", active: activeWorkflowStep >= 4 }
                      ].map((comp, i) => (
                        <div key={i} className={`p-3 rounded-lg border transition-all duration-300 ${
                          comp.active 
                            ? 'bg-blue-50 border-blue-200 shadow-sm' 
                            : 'bg-white border-gray-200 opacity-50'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{comp.icon}</span>
                            <div>
                              <div className="text-xs font-semibold text-gray-900">{comp.name}</div>
                              <div className="text-xs text-gray-600">{comp.desc}</div>
                            </div>
                            {comp.active && (
                              <div className="ml-auto">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {isWorkflowPlaying && activeWorkflowStep < 5 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center text-xs text-blue-700">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                          Conectando automaticamente...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Execução em Tempo Real (Centro) */}
                  <div className="p-6 bg-white">
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="w-6 h-6 bg-green-500 text-white rounded-full text-xs flex items-center justify-center mr-2">2</span>
                        Execução ao Vivo
                      </h5>
                      <p className="text-xs text-gray-600 mb-4">Workflow processando dados reais</p>
                    </div>

                    {/* Log de Execução */}
                    <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-xs h-64 overflow-y-auto">
                      {isWorkflowPlaying ? (
                        <div className="space-y-1">
                          {workflowSteps.slice(0, activeWorkflowStep + 1).map((step, i) => (
                            <div key={i} className={`transition-all duration-300 ${i === activeWorkflowStep ? 'text-yellow-400' : 'text-green-400'}`}>
                              <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {step.title}
                              {i === activeWorkflowStep && <span className="animate-pulse">_</span>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-center pt-20">
                          <span>Aguardando execução...</span>
                          <br />
                          <span className="text-xs">Clique em 'Ver Criação + Execução' para iniciar</span>
                        </div>
                      )}
                    </div>

                    {isWorkflowPlaying && (
                      <div className="mt-3 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Status:</span>
                          <span className="text-green-600 font-semibold">✓ Executando</span>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-gray-600">Progresso:</span>
                          <span className="text-blue-600 font-semibold">{Math.round((activeWorkflowStep + 1) / workflowSteps.length * 100)}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Resultados & ROI (Direita) */}
                  <div className="bg-gradient-to-b from-gray-50 to-gray-100 border-l border-gray-200 p-6">
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="w-6 h-6 bg-purple-500 text-white rounded-full text-xs flex items-center justify-center mr-2">3</span>
                        Impacto nos Negócios
                      </h5>
                      <p className="text-xs text-gray-600 mb-4">Resultados em tempo real</p>
                    </div>

                    {/* Métricas de Impacto */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border shadow-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600 mb-1">2h → 2.3s</div>
                          <div className="text-xs text-gray-600">Tempo de Aprovação</div>
                          <div className="text-xs text-green-600 font-semibold mt-1">99.8% mais rápido</div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border shadow-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">R$ 125K</div>
                          <div className="text-xs text-gray-600">Economia Anual</div>
                          <div className="text-xs text-blue-600 font-semibold mt-1">ROI de 340%</div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border shadow-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-1">847</div>
                          <div className="text-xs text-gray-600">Aprovações/Mês</div>
                          <div className="text-xs text-purple-600 font-semibold mt-1">+2,240% volume</div>
                        </div>
                      </div>

                      {isWorkflowPlaying && activeWorkflowStep >= workflowSteps.length - 1 && (
                        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 border border-green-200 animate-pulse">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-700 mb-1">✅ Workflow Ativo</div>
                            <div className="text-xs text-green-600">Processando novos orçamentos automaticamente</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {!isWorkflowPlaying && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-center">
                          <p className="text-xs text-blue-700 mb-2">
                            <strong>Resultado esperado:</strong> Economia de 99.8% no tempo + ROI de 340%
                          </p>
                          <Button 
                            onClick={playWorkflowDemo}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          >
                            ▶️ Ver em Ação
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA de Impacto */}
              <div className="mt-8 text-center">
                <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 border border-blue-200/50 shadow-lg">
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">
                    Do Manual ao Automatizado em <span className="text-blue-600">Minutos</span>
                  </h4>
                  <p className="text-gray-700 mb-6 max-w-3xl mx-auto">
                    Viu como é <strong>simples criar</strong> e <strong>poderoso executar</strong>? 
                    Essa demo representa <strong>milhares de empresas</strong> que já transformaram 
                    processos de horas em segundos, economizando tempo e multiplicando resultados.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                    <Button 
                      onClick={() => setShowContactForm(true)}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 shadow-lg"
                    >
                      🚀 Quero Essa Transformação
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button 
                      onClick={playWorkflowDemo}
                      size="lg"
                      variant="outline"
                      className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-4"
                    >
                      🔄 Ver Demo Novamente
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm text-gray-600">
                    <div>
                      <div className="font-semibold text-green-600">✓ Sem código necessário</div>
                      <div>Interface visual intuitiva</div>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-600">✓ Resultados imediatos</div>
                      <div>Economia desde o primeiro dia</div>
                    </div>
                    <div>
                      <div className="font-semibold text-purple-600">✓ ROI comprovado</div>
                      <div>Média de 340% de retorno</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos Section */}
      <section id="recursos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Recursos que Fazem a Diferença
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tudo que sua empresa precisa para automatizar processos e acelerar resultados
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Bot className="h-8 w-8 text-blue-600" />,
                title: "Automação Inteligente",
                description: "Workflows visuais drag-and-drop que conectam sistemas e automatizam processos complexos sem código."
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
                title: "Analytics Avançado",
                description: "Dashboards em tempo real, KPIs personalizados e relatórios que orientam decisões estratégicas."
              },
              {
                icon: <Shield className="h-8 w-8 text-green-600" />,
                title: "Segurança Enterprise",
                description: "Criptografia AES-256, compliance LGPD/GDPR e controles de acesso granulares."
              },
              {
                icon: <Globe className="h-8 w-8 text-orange-600" />,
                title: "Integrações Ilimitadas",
                description: "Conecte com 1000+ aplicações, APIs REST, webhooks e sistemas legados facilmente."
              },
              {
                icon: <Users className="h-8 w-8 text-red-600" />,
                title: "Colaboração em Equipe",
                description: "Permissões granulares, workspaces compartilhados e aprovações automatizadas."
              },
              {
                icon: <Zap className="h-8 w-8 text-yellow-600" />,
                title: "Performance Otimizada",
                description: "Execução em nuvem escalável com 99.9% de uptime e resposta em milissegundos."
              }
            ].map((feature, i) => (
              <Card key={i} className="border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Soluções por Segmento */}
      <section id="solucoes" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Soluções para Cada Segmento
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Processos otimizados para diferentes indústrias e necessidades empresariais
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "E-commerce & Varejo",
                description: "Automatize pedidos, estoque, logística e atendimento ao cliente.",
                benefits: ["Gestão de Estoque", "Pedidos Automatizados", "CRM Integrado", "Relatórios de Vendas"]
              },
              {
                title: "Serviços Financeiros",
                description: "Compliance automatizado, análise de risco e aprovações inteligentes.",
                benefits: ["Compliance BACEN", "Análise de Crédito", "Aprovações Automáticas", "Auditoria Digital"]
              },
              {
                title: "Saúde & Bem-estar",
                description: "Agendamentos, prontuários digitais e gestão de consultórios.",
                benefits: ["Agendamento Online", "Prontuário Digital", "Telemedicina", "LGPD Compliance"]
              }
            ].map((solution, i) => (
              <Card key={i} className="bg-white border-2 border-gray-100 hover:border-blue-300 transition-all">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {solution.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    {solution.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {solution.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-center text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => setShowContactForm(true)}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                  >
                    Solicitar Demo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que Nossos Clientes Dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Maria Silva",
                role: "CTO, TechCorp",
                content: "Reduziu em 70% o tempo de processamento de pedidos. A automação é impressionante!",
                rating: 5
              },
              {
                name: "João Santos",
                role: "CEO, StartupX",
                content: "Interface intuitiva e suporte excepcional. Economizamos R$ 50k/mês em processos manuais.",
                rating: 5
              },
              {
                name: "Ana Costa",
                role: "Diretora, FinanceMax",
                content: "Compliance automático e relatórios em tempo real. Transformou nossa operação financeira.",
                rating: 5
              }
            ].map((testimonial, i) => (
              <Card key={i} className="bg-gray-50 border-none">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para Transformar sua Empresa?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Junte-se a milhares de empresas que já automatizaram seus processos 
            e aceleram resultados todos os dias.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowContactForm(true)}
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold rounded-lg shadow-lg"
            >
              🎯 Agendar Demonstração
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link href="/simple-login">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-4 text-lg rounded-lg"
              >
                Fazer Login
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-blue-100 text-sm">
            ✅ Teste grátis por 7 dias • ✅ Cancelamento fácil • ✅ Suporte 24/7
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                TOIT NEXUS
              </div>
              <p className="text-gray-400 mb-4">
                Democratizando a automação empresarial com tecnologia de ponta e simplicidade.
              </p>
              <div className="flex space-x-4">
                <Mail className="h-5 w-5 text-gray-400" />
                <Phone className="h-5 w-5 text-gray-400" />
                <Building className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#recursos" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#solucoes" className="hover:text-white transition-colors">Soluções</a></li>
                <li><a href="#precos" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#contato" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><Link href="/simple-login" className="hover:text-white transition-colors">Portal do Cliente</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 TOIT NEXUS. Todos os direitos reservados. Feito com ❤️ para automatizar o futuro.</p>
          </div>
        </div>
      </footer>

      {/* Modal de Contato */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Solicitar Demonstração</h3>
              <button 
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Corporativo *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Como podemos ajudar?
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descreva suas necessidades de automação..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Enviar Solicitação
                </Button>
              </div>
            </form>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              Nossa equipe entrará em contato em até 2 horas úteis
            </p>
          </div>
        </div>
      )}
    </div>
  );
}