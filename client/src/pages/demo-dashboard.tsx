import { UnifiedHeader } from '@/components/unified-header';
import { NotificationDemo } from '@/components/notifications/NotificationDemo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Users, Workflow, BarChart3, Settings } from 'lucide-react';
import { DemoAuthProvider } from '@/contexts/DemoAuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ToastContainer } from '@/components/notifications/ToastContainer';

export default function DemoDashboard() {
  return (
    <DemoAuthProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50">
          <UnifiedHeader title="TOIT-Nexus - Demo Notificações" showUserActions={true} />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            TOIT-Nexus - Sistema de Notificações
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Demonstração completa do sistema de notificações em tempo real com WebSocket, 
            animações sutis e diferentes tipos de alertas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notificações Ativas</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">+2 desde ontem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Online</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+5% desde a última hora</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workflows Ativos</CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">3 concluídos hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.2%</div>
              <p className="text-xs text-muted-foreground">+0.3% desde ontem</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <NotificationDemo />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status do Sistema</CardTitle>
                <CardDescription>Monitoramento em tempo real</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">WebSocket Server</span>
                  <Badge className="bg-green-500">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge className="bg-green-500">Conectado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Gateway</span>
                  <Badge className="bg-green-500">Funcionando</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notification Service</span>
                  <Badge className="bg-green-500">Ativo</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recursos Implementados</CardTitle>
                <CardDescription>Sistema completo de notificações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Notificações em tempo real via WebSocket</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Sino de notificações no header</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Toast notifications com auto-dismiss</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Animações sutis de entrada/saída</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Diferentes tipos visuais</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Ações customizáveis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Contador de não lidas</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Instruções de Teste</CardTitle>
            <CardDescription>Como testar o sistema de notificações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">1. Testar Notificações</h4>
                  <p className="text-gray-600">Use os botões à esquerda para enviar diferentes tipos de notificações e observe as animações.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">2. Sino de Notificações</h4>
                  <p className="text-gray-600">Clique no sino no header para ver todas as notificações e gerenciar as não lidas.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">3. WebSocket</h4>
                  <p className="text-gray-600">O sistema conecta automaticamente via WebSocket para receber notificações em tempo real.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">4. Animações</h4>
                  <p className="text-gray-600">Observe as animações sutis: bounce no sino, fade-in nos toasts e slide nas notificações.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
        </div>
        <ToastContainer />
      </NotificationProvider>
    </DemoAuthProvider>
  );
}