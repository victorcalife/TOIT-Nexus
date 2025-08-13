import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  Workflow, 
  Settings, 
  Plus, 
  Activity,
  TrendingUp,
  FileText,
  Calendar,
  Bell
} from 'lucide-react';
import { StandardHeader } from '@/components/standard-header';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const tenant = localStorage.getItem('selectedTenant');
    if (tenant) {
      setSelectedTenant(JSON.parse(tenant));
    } else {
      // Redirect to tenant selection if no tenant is selected
      window.location.href = '/select-tenant';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('selectedTenant');
    window.location.href = '/api/logout';
  };

  const handleBackToSelection = () => {
    localStorage.removeItem('selectedTenant');
    window.location.href = '/select-tenant';
  };

  if (!selectedTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StandardHeader 
        showUserActions={true}
        user={user}
        onLogout={handleLogout}
      />
      
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bem-vindo ao {selectedTenant.name}
            </h1>
            <p className="text-gray-600">
              {selectedTenant.description}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleBackToSelection}>
              Trocar Empresa
            </Button>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {selectedTenant.userCount} usuários ativos
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md, categorização e histórico de interações.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Relatórios e Analytics</h2>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Novo Relatório
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Sistema de relatórios dinâmicos será implementado aqui.
                  <br />
                  Dashboards personalizados e exports automatizados.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-xl font-semibold">Configurações da Empresa</h2>
            <div className="grid grid-cols-1 md, permissões e customizações serão implementadas aqui.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}