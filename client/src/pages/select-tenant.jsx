import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Building2, Search, Users, Workflow } from 'lucide-react';
import { StandardHeader } from '@/components/standard-header';
import { useAuth } from '@/hooks/useAuth';

export default function SelectTenant()
{
  const [ searchTerm, setSearchTerm ] = useState( '' );
  const { user } = useAuth();

  // Fetch real tenants from API
  const { data,
    queryFn) => fetch( '/api/user/tenants' ).then( res => res.json() )
});

const handleSelectTenant = ( tenant ) =>
{
  // Set tenant context and redirect to dashboard
  localStorage.setItem( 'selectedTenant', JSON.stringify( tenant ) );
  window.location.href = '/dashboard';
};

const filteredTenants = ( tenants || [] ).filter( ( tenant ) =>
  tenant.name?.toLowerCase().includes( searchTerm.toLowerCase() ) ||
  tenant.description?.toLowerCase().includes( searchTerm.toLowerCase() )
);

return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <StandardHeader
      showUserActions={ true }
      user={ user }
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
              value={ searchTerm }
              onChange={ ( e ) => setSearchTerm( e.target.value ) }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md) => (
              <Card key={tenant.id} className="hover) => handleSelectTenant(tenant)}
                      >
        Acessar { tenant.name }
      </Button>
    </div>
  </div>
                </CardContent >
              </Card >
            ))}
          </div >

{
  filteredTenants.length === 0 && (
    <div className="text-center py-12">
      <p className="text-gray-500 text-lg">
        Nenhuma empresa encontrada com os termos de busca.
      </p>
    </div>
  )
}

  < div className = "text-center mt-8" >
    <Button
      variant="outline"
      onClick={ () => window.location.href = '/admin/dashboard' }
    >
      Voltar ao Painel Administrativo
    </Button>
          </div >
        </div >
      </div >
    </div >
  );
}