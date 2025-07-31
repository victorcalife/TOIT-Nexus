import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartLine, Users, Workflow, Shield, Database, BarChart3 } from "lucide-react";
import { UnifiedHeader } from "@/components/unified-header";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      <UnifiedHeader 
        title="TOIT Nexus" 
        subtitle="Plataforma de Automação Empresarial"
      />

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="h-20 w-20 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">TOIT</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Automatize seu escritório de investimentos com 
              <span className="text-primary-500"> workflows inteligentes</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Plataforma completa para criar workflows automatizados, gerenciar clientes por perfil 
              e gerar relatórios personalizados sem necessidade de programação.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => window.location.href = '/login'}
                className="bg-primary-500 hover:bg-primary-600 text-lg px-8"
              >
                Começar Agora
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8"
              >
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para automatizar seu escritório
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma oferece ferramentas completas para gestão de clientes, 
              criação de workflows e automação de processos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <CardTitle>Gestão de Clientes</CardTitle>
                <CardDescription>
                  Categorize clientes por perfil de investimento, valor investido e comportamento
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
                  <Workflow className="w-6 h-6 text-success-600" />
                </div>
                <CardTitle>Workflows Automatizados</CardTitle>
                <CardDescription>
                  Crie regras de negócio que disparam ações automáticas baseadas no perfil do cliente
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-warning-600" />
                </div>
                <CardTitle>Relatórios Dinâmicos</CardTitle>
                <CardDescription>
                  Gere relatórios personalizados automaticamente de acordo com as regras configuradas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Integrações Externas</CardTitle>
                <CardDescription>
                  Conecte APIs, bancos de dados e webhooks para sincronizar dados automaticamente
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Controle de Acesso</CardTitle>
                <CardDescription>
                  Sistema completo de usuários com diferentes níveis de permissão e acesso
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                  <ChartLine className="w-6 h-6 text-rose-600" />
                </div>
                <CardTitle>Dashboard Executivo</CardTitle>
                <CardDescription>
                  Visualize métricas importantes e acompanhe o desempenho dos workflows em tempo real
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-500">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para automatizar seu escritório?
            </h2>
            <p className="text-lg text-primary-100 mb-8">
              Comece hoje mesmo e transforme a forma como você gerencia seus clientes e processos.
            </p>
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/login'}
              className="bg-white text-primary-500 hover:bg-gray-50 text-lg px-8"
            >
              Acessar Plataforma
            </Button>
            

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 bg-primary-500 rounded-lg flex items-center justify-center">
              <ChartLine className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold">InvestFlow</span>
          </div>
          <p className="text-center text-gray-400 mt-4">
            © 2024 InvestFlow. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
