import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedHeader } from '@/components/unified-header';
import { 
  User, 
  Building2, 
  Database, 
  BarChart3, 
  Shield, 
  Users, 
  Check,
  ArrowRight,
  Globe,
  Lock,
  Zap,
  Target
} from 'lucide-react';

export default function TenantDemo() {
  const [selectedModel, setSelectedModel] = useState<'individual' | 'enterprise'>('individual');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <UnifiedHeader 
        title="Modelos de Venda TOIT Nexus" 
        subtitle="Plataforma de Business Intelligence Multi-Tenant"
        showUserActions={false} 
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Overview Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Duas Formas de <span className="text-blue-600">Oferecer Valor</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nossa plataforma suporta dois modelos de negócio distintos com isolamento completo de dados 
            e configurações personalizadas para cada necessidade.
          </p>
        </div>

        {/* Model Selection */}
        <div className="flex justify-center">
          <div className="bg-white rounded-lg p-2 shadow-sm border">
            <div className="flex space-x-1">
              <Button
                variant={selectedModel === 'individual' ? 'default' : 'ghost'}
                onClick={() => setSelectedModel('individual')}
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Pessoa Física (B2C)</span>
              </Button>
              <Button
                variant={selectedModel === 'enterprise' ? 'default' : 'ghost'}
                onClick={() => setSelectedModel('enterprise')}
                className="flex items-center space-x-2"
              >
                <Building2 className="h-4 w-4" />
                <span>Empresas (B2B)</span>
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={selectedModel} className="space-y-6">
          {/* Individual Model */}
          <TabsContent value="individual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Features */}
              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-6 w-6 mr-2" />
                      Modelo Pessoa Física (B2C)
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      Ambiente individual e isolado para cada assinante
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-green-300" />
                        <span>Ambiente completamente isolado</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-green-300" />
                        <span>Self-service total</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-green-300" />
                        <span>Configuração própria de conexões</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-green-300" />
                        <span>Query builder sem código</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lock className="h-5 w-5 mr-2 text-green-600" />
                      Isolamento Garantido
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start space-x-2">
                        <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span><strong>Tenant ID único:</strong> Cada usuário tem seu próprio ambiente isolado</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span><strong>Dados separados:</strong> Zero acesso entre usuários diferentes</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span><strong>Configurações próprias:</strong> APIs, webhooks, bancos independentes</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span><strong>Limites por plano:</strong> Controle de recursos baseado na assinatura</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                      Funcionalidades Principais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Conexões de Dados</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Dashboards Personalizados</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">KPIs Customizados</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm">APIs e Webhooks</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Demo */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Simulação: Usuário Individual</CardTitle>
                    <CardDescription>
                      Como funciona na prática para uma pessoa física
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                          JS
                        </div>
                        <div>
                          <div className="font-medium">João Silva</div>
                          <div className="text-sm text-gray-500">Tenant ID: tenant_123abc</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                          <div className="font-medium text-sm">Suas Conexões:</div>
                          <ul className="text-xs text-gray-600 mt-1 space-y-1">
                            <li>• PostgreSQL da Empresa</li>
                            <li>• API do Google Analytics</li>
                            <li>• Webhook do Stripe</li>
                          </ul>
                        </div>
                        
                        <div className="bg-white p-3 rounded border-l-4 border-green-500">
                          <div className="font-medium text-sm">Queries Salvas:</div>
                          <ul className="text-xs text-gray-600 mt-1 space-y-1">
                            <li>• Vendas por Mês</li>
                            <li>• Tráfego do Site</li>
                            <li>• Receita Recorrente</li>
                          </ul>
                        </div>
                        
                        <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                          <div className="font-medium text-sm">Dashboards:</div>
                          <ul className="text-xs text-gray-600 mt-1 space-y-1">
                            <li>• Dashboard Financeiro</li>
                            <li>• Métricas de Marketing</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="w-full justify-center py-2">
                      <Lock className="h-3 w-3 mr-1" />
                      Dados 100% isolados de outros usuários
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Planos Disponíveis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">Básico</div>
                          <div className="text-sm text-gray-500">2 bancos, 5 APIs</div>
                        </div>
                        <Badge>R$ 49/mês</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-200">
                        <div>
                          <div className="font-medium">Pro</div>
                          <div className="text-sm text-gray-500">5 bancos, 15 APIs</div>
                        </div>
                        <Badge variant="default">R$ 99/mês</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">Enterprise</div>
                          <div className="text-sm text-gray-500">Ilimitado</div>
                        </div>
                        <Badge variant="outline">R$ 199/mês</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Enterprise Model */}
          <TabsContent value="enterprise" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Features */}
              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="h-6 w-6 mr-2" />
                      Modelo Empresas (B2B)
                    </CardTitle>
                    <CardDescription className="text-purple-100">
                      Ambiente dedicado com múltiplos usuários e permissões
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-green-300" />
                        <span>Tenant dedicado por empresa</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-green-300" />
                        <span>Múltiplos usuários com roles</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-green-300" />
                        <span>TOIT configura conexões</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-green-300" />
                        <span>Controle granular de permissões</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-orange-600" />
                      Controle de Acesso
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start space-x-2">
                        <ArrowRight className="h-4 w-4 text-purple-500 mt-0.5" />
                        <span><strong>Roles hierárquicos:</strong> Admin, Manager, Employee</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <ArrowRight className="h-4 w-4 text-purple-500 mt-0.5" />
                        <span><strong>Departamentos:</strong> Vendas, Finanças, Operações, etc.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <ArrowRight className="h-4 w-4 text-purple-500 mt-0.5" />
                        <span><strong>Permissões granulares:</strong> Read, Write, Delete, Admin</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <ArrowRight className="h-4 w-4 text-purple-500 mt-0.5" />
                        <span><strong>Filtros de dados:</strong> Cada departamento vê apenas dados relevantes</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      Gerenciamento TOIT
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="font-medium text-blue-900">Setup Inicial</div>
                        <div className="text-blue-700 mt-1">TOIT configura todas as conexões e estrutura inicial</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <div className="font-medium text-green-900">Suporte Dedicado</div>
                        <div className="text-green-700 mt-1">Acompanhamento técnico e treinamento dos usuários</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <div className="font-medium text-purple-900">Customizações</div>
                        <div className="text-purple-700 mt-1">Dashboards e relatórios específicos para a empresa</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Demo */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Simulação: Empresa TechCorp</CardTitle>
                    <CardDescription>
                      Como funciona para uma empresa com múltiplos usuários
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                          TC
                        </div>
                        <div>
                          <div className="font-medium">TechCorp Ltda</div>
                          <div className="text-sm text-gray-500">Tenant ID: techcorp_enterprise</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                          <div className="font-medium text-sm mb-2">Usuários por Departamento:</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className="font-medium">Vendas (3 usuários)</div>
                              <div className="text-gray-600">• Maria (Manager)</div>
                              <div className="text-gray-600">• João (Employee)</div>
                              <div className="text-gray-600">• Ana (Employee)</div>
                            </div>
                            <div>
                              <div className="font-medium">Finanças (2 usuários)</div>
                              <div className="text-gray-600">• Carlos (Manager)</div>
                              <div className="text-gray-600">• Paula (Employee)</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white p-3 rounded border-l-4 border-green-500">
                          <div className="font-medium text-sm mb-2">Conexões Configuradas:</div>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• ERP SAP (configurado pela TOIT)</li>
                            <li>• CRM Salesforce (configurado pela TOIT)</li>
                            <li>• API do Banco (configurado pela TOIT)</li>
                            <li>• Webhook do E-commerce</li>
                          </ul>
                        </div>
                        
                        <div className="bg-white p-3 rounded border-l-4 border-orange-500">
                          <div className="font-medium text-sm mb-2">Permissões por Departamento:</div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>• <strong>Vendas:</strong> CRM (read/write), Relatórios de vendas</div>
                            <div>• <strong>Finanças:</strong> ERP (read/write), Dados bancários, P&L</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="w-full justify-center py-2">
                      <Shield className="h-3 w-3 mr-1" />
                      Isolamento total de outras empresas
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Modelos de Contrato</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">Startup</div>
                          <div className="text-sm text-gray-500">Até 10 usuários</div>
                        </div>
                        <Badge>R$ 500/mês</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded border border-purple-200">
                        <div>
                          <div className="font-medium">Empresarial</div>
                          <div className="text-sm text-gray-500">Até 50 usuários</div>
                        </div>
                        <Badge variant="default">R$ 1.500/mês</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">Enterprise</div>
                          <div className="text-sm text-gray-500">Usuários ilimitados</div>
                        </div>
                        <Badge variant="outline">Sob consulta</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Technical Architecture */}
        <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-6 w-6 mr-2" />
              Arquitetura Técnica: Isolamento Garantido
            </CardTitle>
            <CardDescription className="text-gray-300">
              Como garantimos a separação completa dos dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Isolamento por Tenant ID</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Cada registro tem tenant_id obrigatório</li>
                  <li>• Middleware filtra automaticamente</li>
                  <li>• Impossível acessar dados de outro tenant</li>
                  <li>• Auditoria completa de acesso</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Estrutura Multi-Tenant</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Tabelas: tenants, users, connections</li>
                  <li>• Queries, dashboards, workflows isolados</li>
                  <li>• Permissões granulares por departamento</li>
                  <li>• Configurações independentes por tenant</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Pronto para começar?
          </h2>
          <p className="text-gray-600">
            Escolha o modelo que melhor se adapta ao seu negócio
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Teste Pessoa Física</span>
            </Button>
            <Button size="lg" variant="outline" className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Solicitar Demo Empresarial</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}