import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Users, 
  Edit, 
  Trash2, 
  TrendingUp,
  Mail,
  Phone
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    currentInvestment: "",
    riskProfile: "",
    categoryId: "",
    metadata: {}
  });

  const { toast } = useToast();

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['/api/clients'],
    retry: false,
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    retry: false,
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: any) => {
      await apiRequest('POST', '/api/clients', clientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsCreateDialogOpen(false);
      setNewClient({
        name: "",
        email: "",
        phone: "",
        currentInvestment: "",
        riskProfile: "",
        categoryId: "",
        metadata: {}
      });
      toast({
        title: "Cliente criado",
        description: "Cliente foi criado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: "Falha ao criar cliente.",
        variant: "destructive",
      });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      await apiRequest('DELETE', `/api/clients/${clientId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Cliente excluído",
        description: "Cliente foi excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao excluir cliente.",
        variant: "destructive",
      });
    },
  });

  const filteredClients = (clients || []).filter((client: any) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryName = (categoryId: string) => {
    return (categories || []).find((cat: any) => cat.id === categoryId)?.name || 'Não categorizado';
  };

  const getRiskProfileColor = (profile: string) => {
    switch (profile) {
      case 'conservative':
        return 'bg-blue-100 text-blue-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'aggressive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskProfileLabel = (profile: string) => {
    switch (profile) {
      case 'conservative':
        return 'Conservador';
      case 'moderate':
        return 'Moderado';
      case 'aggressive':
        return 'Agressivo';
      default:
        return 'Não definido';
    }
  };

  const handleCreateClient = () => {
    if (!newClient.name) {
      toast({
        title: "Erro",
        description: "Nome do cliente é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    const clientData = {
      ...newClient,
      currentInvestment: newClient.currentInvestment ? parseFloat(newClient.currentInvestment) : null,
    };

    createClientMutation.mutate(clientData);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Gestão de Clientes</h1>
            <p className="text-sm text-gray-600 mt-1">
              Gerencie seus clientes e suas categorizações
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary-500 hover:bg-primary-600">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                <DialogDescription>
                  Preencha as informações do cliente abaixo.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    placeholder="Nome completo do cliente"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="investment">Investimento Atual (R$)</Label>
                  <Input
                    id="investment"
                    type="number"
                    value={newClient.currentInvestment}
                    onChange={(e) => setNewClient({ ...newClient, currentInvestment: e.target.value })}
                    placeholder="100000"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="risk">Perfil de Risco</Label>
                  <Select 
                    value={newClient.riskProfile} 
                    onValueChange={(value) => setNewClient({ ...newClient, riskProfile: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservador</SelectItem>
                      <SelectItem value="moderate">Moderado</SelectItem>
                      <SelectItem value="aggressive">Agressivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={newClient.categoryId} 
                    onValueChange={(value) => setNewClient({ ...newClient, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateClient}
                  disabled={createClientMutation.isPending}
                >
                  {createClientMutation.isPending ? "Criando..." : "Criar Cliente"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar clientes por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Clients Grid */}
        {clientsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="flex justify-between mt-4">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client: any) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{client.name}</h3>
                      {client.email && (
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Mail className="w-4 h-4 mr-2" />
                          {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {client.phone}
                        </div>
                      )}
                    </div>
                    <Badge className={getRiskProfileColor(client.riskProfile)}>
                      {getRiskProfileLabel(client.riskProfile)}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    {client.currentInvestment && (
                      <div className="flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                        <span className="text-gray-600">
                          Investimento: R$ {Number(client.currentInvestment).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="text-gray-600">
                        Categoria: {getCategoryName(client.categoryId)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteClientMutation.mutate(client.id)}
                      disabled={deleteClientMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Tente buscar com outros termos ou limpe o filtro.'
                : 'Comece adicionando seus primeiros clientes ao sistema.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Cliente
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
