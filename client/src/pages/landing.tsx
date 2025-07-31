import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Users, Zap, Shield, BarChart3, CheckCircle, Workflow, Bot, Globe, Sparkles, Database, Bell, Settings, Send, Filter, Calendar, Mail, FileText, Cpu, GitBranch } from "lucide-react";
import { UnifiedHeader } from "@/components/unified-header";
import { useState, useEffect, useRef } from "react";

// Workflow cards for drag and drop
const WORKFLOW_CARDS = [
  { id: 'trigger', icon: '🔔', title: 'Trigger', description: 'Inicia o workflow', category: 'triggers', color: 'from-green-500 to-emerald-500' },
  { id: 'email', icon: '📧', title: 'Send Email', description: 'Envia notificação por email', category: 'actions', color: 'from-blue-500 to-cyan-500' },
  { id: 'database', icon: '🗄️', title: 'Database', description: 'Consulta ou atualiza dados', category: 'data', color: 'from-purple-500 to-pink-500' },
  { id: 'filter', icon: '🔍', title: 'Filter', description: 'Filtra dados baseado em condições', category: 'logic', color: 'from-orange-500 to-red-500' },
  { id: 'webhook', icon: '🔗', title: 'Webhook', description: 'Chama API externa', category: 'integrations', color: 'from-indigo-500 to-blue-500' },
  { id: 'schedule', icon: '⏰', title: 'Schedule', description: 'Agenda execução', category: 'timing', color: 'from-pink-500 to-rose-500' },
  { id: 'notification', icon: '🔔', title: 'Notification', description: 'Envia notificação push', category: 'actions', color: 'from-yellow-500 to-amber-500' },
  { id: 'transform', icon: '🔄', title: 'Transform', description: 'Transforma dados', category: 'data', color: 'from-teal-500 to-green-500' },
];

const DEMO_WORKFLOW = [
  { id: 'start', card: WORKFLOW_CARDS[0], position: { x: 50, y: 100 } },
  { id: 'filter1', card: WORKFLOW_CARDS[3], position: { x: 250, y: 50 } },
  { id: 'email1', card: WORKFLOW_CARDS[1], position: { x: 450, y: 50 } },
  { id: 'db1', card: WORKFLOW_CARDS[2], position: { x: 250, y: 150 } },
];

interface DragItem {
  id: string;
  card: typeof WORKFLOW_CARDS[0];
  position: { x: number; y: number };
}

export default function Landing() {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [workflowItems, setWorkflowItems] = useState<DragItem[]>(DEMO_WORKFLOW);
  const [connections, setConnections] = useState<Array<{from: string, to: string}>>([
    { from: 'start', to: 'filter1' },
    { from: 'filter1', to: 'email1' },
    { from: 'start', to: 'db1' }
  ]);
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Auto demo animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedItem(cardId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 60; // Center the card
    const y = e.clientY - rect.top - 40;

    const card = WORKFLOW_CARDS.find(c => c.id === draggedItem);
    if (card) {
      const newItem: DragItem = {
        id: `${card.id}-${Date.now()}`,
        card,
        position: { x, y }
      };
      setWorkflowItems(prev => [...prev, newItem]);
    }
    setDraggedItem(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <UnifiedHeader />
      
      {/* Particle Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/5 via-transparent to-[#6a0dad]/5"></div>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#00d4ff] rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-[#00d4ff]/20 to-[#6a0dad]/20 text-[#00d4ff] border-[#00d4ff]/30 px-6 py-2 text-sm font-semibold">
              ✨ Revolução em Automação No-Code
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-[#00d4ff] via-[#6a0dad] to-[#0099ff] bg-clip-text text-transparent">
                TOIT NEXUS
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-[#b0b0b8] mb-12 max-w-4xl mx-auto leading-relaxed">
              Democratize a automação empresarial. Crie workflows inteligentes arrastando e soltando - 
              sem código, sem complexidade, apenas resultados extraordinários.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
              <Button size="lg" className="bg-gradient-to-r from-[#00d4ff] to-[#6a0dad] hover:from-[#00b8e6] hover:to-[#5a0999] text-white px-10 py-6 text-lg font-bold rounded-xl shadow-2xl shadow-[#00d4ff]/20 transition-all hover:scale-105">
                🚀 Teste Grátis 7 Dias
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/10 px-10 py-6 text-lg rounded-xl backdrop-blur-sm">
                <Play className="mr-3 h-6 w-6" />
                Demo Interativa
              </Button>
            </div>
          </div>
          
          {/* Stats with glow effect */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {[
              { value: "15K+", label: "Empresas Ativas", color: "#00d4ff" },
              { value: "99.9%", label: "Uptime SLA", color: "#6a0dad" },
              { value: "5M+", label: "Workflows", color: "#10b981" },
              { value: "2min", label: "Setup Médio", color: "#0099ff" }
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl bg-gradient-to-b from-white/5 to-white/2 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all">
                <div className="text-4xl font-black mb-2" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-[#b0b0b8] text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Workflow Builder Demo */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#141420]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Arrastar. Soltar. <span className="bg-gradient-to-r from-[#00d4ff] to-[#6a0dad] bg-clip-text text-transparent">Automatizar.</span>
            </h2>
            <p className="text-xl text-[#b0b0b8] max-w-3xl mx-auto mb-8">
              Veja como é fácil criar workflows complexos com nossa interface drag-and-drop. 
              Experimente arrastar os cards abaixo para o canvas!
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Card Palette */}
            <div className="lg:col-span-1">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Sparkles className="mr-3 h-6 w-6 text-[#00d4ff]" />
                Componentes
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                {WORKFLOW_CARDS.map((card) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card.id)}
                    className="group p-4 rounded-xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-[#00d4ff]/30 cursor-grab active:cursor-grabbing hover:scale-105 transition-all backdrop-blur-sm"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform`}>
                      {card.icon}
                    </div>
                    <div className="text-white font-semibold text-sm mb-1">{card.title}</div>
                    <div className="text-[#b0b0b8] text-xs">{card.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Canvas */}
            <div className="lg:col-span-3">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Workflow className="mr-3 h-6 w-6 text-[#00d4ff]" />
                Canvas de Workflow
                <Badge className="ml-3 bg-[#00d4ff]/20 text-[#00d4ff] text-xs">Demo Interativa</Badge>
              </h3>
              
              <div
                ref={canvasRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="relative h-96 bg-gradient-to-br from-[#1e1e2e]/80 to-[#0a0a0f]/80 rounded-2xl border-2 border-dashed border-[#00d4ff]/30 backdrop-blur-sm overflow-hidden"
              >
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `
                      linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}></div>
                </div>

                {/* Workflow Items */}
                {workflowItems.map((item) => (
                  <div
                    key={item.id}
                    className={`absolute transform transition-all duration-300 ${isAnimating ? 'animate-pulse scale-110' : ''}`}
                    style={{
                      left: item.position.x,
                      top: item.position.y
                    }}
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${item.card.color} shadow-lg hover:scale-105 transition-all cursor-pointer`}>
                      <div className="text-white text-xl mb-1">{item.card.icon}</div>
                      <div className="text-white text-xs font-semibold">{item.card.title}</div>
                    </div>
                  </div>
                ))}

                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {connections.map((conn, i) => {
                    const fromItem = workflowItems.find(item => item.id === conn.from);
                    const toItem = workflowItems.find(item => item.id === conn.to);
                    if (!fromItem || !toItem) return null;

                    return (
                      <line
                        key={i}
                        x1={fromItem.position.x + 60}
                        y1={fromItem.position.y + 30}
                        x2={toItem.position.x + 60}
                        y2={toItem.position.y + 30}
                        stroke="#00d4ff"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        className={isAnimating ? 'animate-pulse' : ''}
                      />
                    );
                  })}
                </svg>

                {/* Drop hint */}
                {workflowItems.length === DEMO_WORKFLOW.length && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 backdrop-blur-sm">
                      <div className="text-4xl mb-4">🎯</div>
                      <div className="text-[#00d4ff] font-semibold mb-2">Arraste componentes aqui!</div>
                      <div className="text-[#b0b0b8] text-sm">Experimente arrastar qualquer card da esquerda</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-[#b0b0b8] text-sm mb-4">
                  ✨ Este é apenas um exemplo simples. Na plataforma real, você pode criar workflows com centenas de componentes!
                </p>
                <Button className="bg-gradient-to-r from-[#00d4ff] to-[#6a0dad] text-white px-6 py-3 rounded-lg hover:scale-105 transition-all">
                  Ver Workflow Builder Completo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features with Floating Cards */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Recursos que <span className="bg-gradient-to-r from-[#00d4ff] to-[#6a0dad] bg-clip-text text-transparent">Impressionam</span>
            </h2>
            <p className="text-xl text-[#b0b0b8] max-w-3xl mx-auto">
              Funcionalidades enterprise em uma interface simples e intuitiva
            </p>
          </div>

          {/* Floating Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
            {[
              {
                icon: <Bot className="h-10 w-10" />,
                title: "IA Inteligente",
                description: "Assistente que otimiza workflows automaticamente e sugere melhorias baseadas em padrões de uso",
                color: "from-[#00d4ff] to-[#0099ff]",
                features: ["Auto-otimização", "Sugestões IA", "Predições", "Machine Learning"]
              },
              {
                icon: <BarChart3 className="h-10 w-10" />,
                title: "Analytics Avançado",
                description: "KPIs personalizáveis, relatórios em tempo real e dashboards interativos para decisões data-driven",
                color: "from-[#6a0dad] to-[#9333ea]",
                features: ["KPIs customizados", "Real-time", "Dashboards", "Alertas inteligentes"]
              },
              {
                icon: <Shield className="h-10 w-10" />,
                title: "Segurança Enterprise",
                description: "Criptografia de ponta, compliance LGPD/GDPR e auditoria completa de todas as operações",
                color: "from-[#10b981] to-[#059669]",
                features: ["Criptografia AES-256", "LGPD/GDPR", "Auditoria 360°", "SSO/SAML"]
              },
              {
                icon: <Globe className="h-10 w-10" />,
                title: "Integrações Universais",
                description: "Conecte com 1000+ apps, APIs REST, webhooks e sistemas legados sem esforço",
                color: "from-[#f59e0b] to-[#d97706]",
                features: ["1000+ integrações", "APIs REST", "Webhooks", "Sistemas legados"]
              },
              {
                icon: <Bell className="h-10 w-10" />,
                title: "Notificações Inteligentes",
                description: "Sistema avançado de alertas multi-canal com filtros inteligentes e escalação automática",
                color: "from-[#ef4444] to-[#dc2626]",
                features: ["Multi-canal", "Filtros IA", "Escalação auto", "Templates"]
              },
              {
                icon: <Database className="h-10 w-10" />,
                title: "Query Builder Visual",
                description: "Construa consultas complexas sem SQL usando interface drag-and-drop intuitiva",
                color: "from-[#8b5cf6] to-[#7c3aed]",
                features: ["Zero SQL", "Drag & Drop", "Preview live", "Consultas complexas"]
              }
            ].map((feature, index) => (
              <Card key={index} className="group relative overflow-hidden bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-[#00d4ff]/30 transition-all duration-500 backdrop-blur-sm hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#00d4ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white text-xl font-bold group-hover:text-[#00d4ff] transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription className="text-[#b0b0b8] leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  
                  <div className="flex flex-wrap gap-2">
                    {feature.features.map((feat, i) => (
                      <Badge key={i} variant="secondary" className="bg-white/10 text-[#00d4ff] border-none text-xs">
                        ⚡ {feat}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Epic CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/10 via-[#6a0dad]/10 to-[#0099ff]/10 rounded-3xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="mb-12">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8 leading-tight">
              Pronto para a 
              <span className="bg-gradient-to-r from-[#00d4ff] to-[#6a0dad] bg-clip-text text-transparent block">
                Revolução?
              </span>
            </h2>
            <p className="text-xl text-[#b0b0b8] mb-12 max-w-3xl mx-auto">
              Junte-se a mais de 15.000 empresas que já transformaram seus processos 
              com automação inteligente
            </p>
          </div>

          <div className="bg-gradient-to-r from-white/10 to-white/5 rounded-3xl p-12 border border-white/20 backdrop-blur-sm">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-left">
                <h3 className="text-3xl font-black text-white mb-4">
                  Teste <span className="text-[#00d4ff]">Gratuito</span> por 7 Dias
                </h3>
                <p className="text-[#b0b0b8] mb-6 text-lg">
                  Sem cartão de crédito • Cancelamento fácil • Suporte 24/7
                </p>
                <div className="space-y-3">
                  {[
                    "⚡ Setup em 2 minutos",
                    "🎯 Templates prontos para usar",
                    "🤝 Suporte técnico dedicado",
                    "📊 Analytics inclusos"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center text-[#b0b0b8]">
                      <CheckCircle className="h-5 w-5 text-[#10b981] mr-3" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                <Link href="/login">
                  <Button size="lg" className="w-full bg-gradient-to-r from-[#00d4ff] to-[#6a0dad] hover:from-[#00b8e6] hover:to-[#5a0999] text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl shadow-[#00d4ff]/30 hover:scale-105 transition-all">
                    🚀 Começar Agora
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </Link>
                
                <div className="text-center">
                  <p className="text-sm text-[#808088] mb-2">Mais de 50 workflows criados na última hora</p>
                  <div className="flex justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-gradient-to-b from-transparent to-[#050508]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-3xl font-black bg-gradient-to-r from-[#00d4ff] to-[#6a0dad] bg-clip-text text-transparent mb-4">
              TOIT NEXUS
            </div>
            <p className="text-[#b0b0b8] max-w-2xl mx-auto">
              Democratizando a automação empresarial. Transformando processos complexos 
              em soluções simples e inteligentes.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm text-[#808088]">
            <a href="#" className="hover:text-[#00d4ff] transition-colors">Privacidade</a>
            <a href="#" className="hover:text-[#00d4ff] transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-[#00d4ff] transition-colors">Documentação</a>
            <a href="#" className="hover:text-[#00d4ff] transition-colors">API</a>
            <a href="#" className="hover:text-[#00d4ff] transition-colors">Suporte</a>
            <a href="#" className="hover:text-[#00d4ff] transition-colors">Status</a>
          </div>
          
          <div className="text-center mt-8 pt-8 border-t border-white/5">
            <p className="text-[#808088] text-sm">
              © 2025 TOIT NEXUS. Todos os direitos reservados. Feito com ❤️ para democratizar a automação.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}