import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Shield, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Star,
  ArrowRight,
  Play,
  Workflow,
  BarChart3,
  Brain,
  Layers,
  Settings,
  Building
} from "lucide-react";
import { UnifiedHeader } from "@/components/unified-header";
import { motion } from "framer-motion";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFreeTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      window.location.href = '/register?trial=true&email=' + encodeURIComponent(email);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      <UnifiedHeader />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <div className="relative container mx-auto px-6">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="mb-6 bg-blue-50 text-blue-700 border-blue-200">
                🚀 Tecnologia de ponta não é mais exclusividade dos grandes
              </Badge>
              
              <h1 className="text-6xl font-bold text-gray-900 mb-8 leading-tight">
                Workflows mais fáceis{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  impossível
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Sistema regenerativo e adaptativo que automatiza seus processos empresariais 
                sem necessidade de programação. Crie workflows inteligentes em minutos, 
                não em meses.
              </p>
              
              <form onSubmit={handleFreeTrial} className="max-w-md mx-auto mb-8">
                <div className="flex gap-3">
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-lg py-3"
                    required
                  />
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Iniciando..." : "7 Dias Grátis"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
              
              <p className="text-sm text-gray-500 mb-8">
                ✅ Sem cartão de crédito • ✅ Configuração em 2 minutos • ✅ Cancele a qualquer momento
              </p>
              
              <div className="flex justify-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Mais de 10.000 empresas confiam
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  4.9/5 em satisfação
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-blue-500 mr-2" />
                  Segurança enterprise
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Pare de perder tempo com processos manuais
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-white border-red-100">
                <CardContent className="pt-6">
                  <div className="text-red-500 mb-4">
                    <Clock className="h-8 w-8 mx-auto" />
                  </div>
                  <h3 className="font-semibold mb-2">Horas desperdiçadas diariamente</h3>
                  <p className="text-gray-600 text-sm">
                    Tarefas repetitivas consomem 40% do tempo da sua equipe
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-orange-100">
                <CardContent className="pt-6">
                  <div className="text-orange-500 mb-4">
                    <TrendingUp className="h-8 w-8 mx-auto" />
                  </div>
                  <h3 className="font-semibold mb-2">Crescimento limitado</h3>
                  <p className="text-gray-600 text-sm">
                    Processos manuais impedem a escalabilidade do negócio
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-yellow-100">
                <CardContent className="pt-6">
                  <div className="text-yellow-600 mb-4">
                    <Users className="h-8 w-8 mx-auto" />
                  </div>
                  <h3 className="font-semibold mb-2">Equipe sobrecarregada</h3>
                  <p className="text-gray-600 text-sm">
                    Funcionários frustrados com trabalho repetitivo e sem valor
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                A plataforma mais intuitiva do mercado
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Construa automações poderosas sem escrever uma linha de código. 
                Nossa IA aprende com seu negócio e sugere melhorias continuamente.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Workflow className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Query Builder Visual</h3>
                      <p className="text-gray-600">
                        Interface épica de arrastar e soltar para criar consultas complexas 
                        sem conhecimento técnico.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">KPIs Personalizados</h3>
                      <p className="text-gray-600">
                        Crie indicadores únicos para seu negócio e visualize 
                        em dashboards interativos e personalizáveis.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Zap className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Notificações Inteligentes</h3>
                      <p className="text-gray-600">
                        Sistema de alertas em tempo real que aprende suas prioridades 
                        e notifica apenas o que importa.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <Brain className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">IA Regenerativa</h3>
                      <p className="text-gray-600">
                        Sistema que se adapta continuamente ao seu negócio, 
                        sugerindo otimizações e automatizando melhorias.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-2xl text-white">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white/20 p-2 rounded">
                          <Settings className="h-5 w-5" />
                        </div>
                        <span className="font-medium">Workflow Builder</span>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        IA Ativa
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 p-4 rounded-lg">
                        <div className="text-2xl font-bold">2.3s</div>
                        <div className="text-sm opacity-80">Tempo médio de execução</div>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg">
                        <div className="text-2xl font-bold">99.9%</div>
                        <div className="text-sm opacity-80">Taxa de sucesso</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Conectado a 50+ integrações</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Workspace pessoal configurado</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Notificações em tempo real ativas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Empresas que já automatizaram seus processos
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">5.0</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    "Reduzimos 80% do tempo gasto em processos manuais. 
                    O TOIT Nexus transformou nossa operação completamente."
                  </p>
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Building className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">TechCorp</div>
                      <div className="text-sm text-gray-500">CEO, Startup</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">5.0</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    "Interface mais intuitiva que já usei. Criamos workflows 
                    complexos em minutos, não semanas."
                  </p>
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <Building className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">InvestPlus</div>
                      <div className="text-sm text-gray-500">CTO, Fintech</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">5.0</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    "ROI de 300% no primeiro ano. A IA realmente aprende 
                    e melhora nossos processos automaticamente."
                  </p>
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-full mr-3">
                      <Building className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">FinanceFlow</div>
                      <div className="text-sm text-gray-500">COO, Enterprise</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-6">
              Pronto para automatizar seu negócio?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Junte-se a milhares de empresas que já descobriram o poder 
              da automação inteligente. Comece hoje mesmo, sem riscos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
                onClick={() => window.location.href = '/register?trial=true'}
              >
                Começar Teste Grátis
                <Play className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-4"
                onClick={() => window.location.href = '/demo'}
              >
                Ver Demonstração
              </Button>
            </div>
            
            <p className="text-sm opacity-75">
              Sem compromisso • Configuração instantânea • Suporte dedicado
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4">TOIT Nexus</h3>
                <p className="text-gray-400 text-sm">
                  A plataforma de workflow automation que democratiza a tecnologia empresarial.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Produto</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white">Features</a></li>
                  <li><a href="#" className="hover:text-white">Integrações</a></li>
                  <li><a href="#" className="hover:text-white">Segurança</a></li>
                  <li><a href="#" className="hover:text-white">API</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Recursos</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white">Documentação</a></li>
                  <li><a href="#" className="hover:text-white">Tutoriais</a></li>
                  <li><a href="#" className="hover:text-white">Blog</a></li>
                  <li><a href="#" className="hover:text-white">Comunidade</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Empresa</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white">Sobre</a></li>
                  <li><a href="#" className="hover:text-white">Carreiras</a></li>
                  <li><a href="#" className="hover:text-white">Contato</a></li>
                  <li><a href="#" className="hover:text-white">Privacidade</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
              <p>&copy; 2025 TOIT Nexus. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}