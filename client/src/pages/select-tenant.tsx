import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Building2, Search, Users, Workflow } from 'lucide-react';
import { UnifiedHeader } from '@/components/unified-header';

export default function SelectTenant() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration
  const mockTenants = [
    { 
      id: '1', 
      name: 'TechCorp', 
      domain: 'techcorp', 
      description: 'Empresa de tecnologia e inovação',
      userCount: 25, 
      workflowCount: 12,
      isActive: true
    },
    { 
      id: '2', 
      name: 'InvestPlus', 
      domain: 'investplus', 
      description: 'Gestora de investimentos e fundos',
      userCount: 18, 
      workflowCount: 8,
      isActive: true
    },
    { 
      id: '3', 
      name: 'FinanceFlow', 
      domain: 'financeflow', 
      description: 'Consultoria financeira corporativa',
      userCount: 15, 
      workflowCount: 6,
      isActive: true
    }
  ];

  const handleSelectTenant = (tenant: any) => {
    // Set tenant context and redirect to dashboard
    localStorage.setItem('selectedTenant', JSON.stringify(tenant));
    window.location.href = '/dashboard';
  };

  const filteredTenants = mockTenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <UnifiedHeader 
        title="Selecionar Empresa" 
        subtitle="Escolha a empresa para acessar"
        showUserActions={true}
        user={{ firstName: 'Usuário', lastName: 'Sistema' }}
      />
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Selecione sua Empresa
            </h1>
            <p className="text-gray-600 text-lg">
              Você tem acesso a múltiplas empresas. Escolha uma para continuar.
            </p>
          </div>

          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar empresa..."
                className="pl-10 text-lg py-3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenants.map((tenant) => (
              <Card key={tenant.id} className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Building2 className="w-8 h-8 text-primary-500" />
                    <Badge variant={tenant.isActive ? "default" : "secondary"}>
                      {tenant.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{tenant.name}</CardTitle>
                  <CardDescription className="text-base">
                    {tenant.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{tenant.userCount} usuários</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Workflow className="w-4 h-4 text-gray-400" />
                        <span>{tenant.workflowCount} workflows</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-500 mb-3">
                        Domínio: {tenant.domain}.toitflow.com
                      </p>
                      <Button 
                        className="w-full bg-primary-500 hover:bg-primary-600"
                        onClick={() => handleSelectTenant(tenant)}
                      >
                        Acessar {tenant.name}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTenants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Nenhuma empresa encontrada com os termos de busca.
              </p>
            </div>
          )}

          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/admin/dashboard'}
            >
              Voltar ao Painel Administrativo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}