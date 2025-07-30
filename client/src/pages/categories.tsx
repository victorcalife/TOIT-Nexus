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
  Tag, 
  Edit, 
  Trash2, 
  TrendingUp,
  DollarSign,
  Settings,
  AlertTriangle
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
import { Checkbox } from "@/components/ui/checkbox";

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    minInvestment: "",
    maxInvestment: "",
    riskProfile: "",
    autoAssignRules: {
      minAmount: "",
      maxAmount: "",
      riskProfiles: [] as string[],
      hasActivePortfolio: false,
      lastActivityDays: ""
    },
    workflowTriggers: [] as string[],
    isActive: true
  });

  const { toast } = useToast();

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    retry: false,
  });

  const { data: workflows } = useQuery({
    queryKey: ['/api/workflows'],
    retry: false,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      const processedData = {
        ...categoryData,
        minInvestment: categoryData.minInvestment ? parseFloat(categoryData.minInvestment) : null,
        maxInvestment: categoryData.maxInvestment ? parseFloat(categoryData.maxInvestment) : null,
        autoAssignRules: {
          ...categoryData.autoAssignRules,
          minAmount: categoryData.autoAssignRules.minAmount ? parseFloat(categoryData.autoAssignRules.minAmount) : null,
          maxAmount: categoryData.autoAssignRules.maxAmount ? parseFloat(categoryData.autoAssignRules.maxAmount) : null,
          lastActivityDays: categoryData.autoAssignRules.lastActivityDays ? parseInt(categoryData.autoAssignRules.lastActivityDays) : null,
        }
      };
      await apiRequest('POST', '/api/categories', processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Categoria criada",
        description: "Categoria de cliente foi criada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar categoria.",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const processedData = {
        ...data,
        minInvestment: data.minInvestment ? parseFloat(data.minInvestment) : null,
        maxInvestment: data.maxInvestment ? parseFloat(data.maxInvestment) : null,
        autoAssignRules: {
          ...data.autoAssignRules,
          minAmount: data.autoAssignRules.minAmount ? parseFloat(data.autoAssignRules.minAmount) : null,
          maxAmount: data.autoAssignRules.maxAmount ? parseFloat(data.autoAssignRules.maxAmount) : null,
          lastActivityDays: data.autoAssignRules.lastActivityDays ? parseInt(data.autoAssignRules.lastActivityDays) : null,
        }
      };
      await apiRequest('PUT', `/api/categories/${id}`, processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setEditingCategory(null);
      resetForm();
      toast({
        title: "Categoria atualizada",
        description: "Categoria foi atualizada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar categoria.",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      await apiRequest('DELETE', `/api/categories/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Categoria excluída",
        description: "Categoria foi excluída com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao excluir categoria.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNewCategory({
      name: "",
      description: "",
      minInvestment: "",
      maxInvestment: "",
      riskProfile: "",
      autoAssignRules: {
        minAmount: "",
        maxAmount: "",
        riskProfiles: [],
        hasActivePortfolio: false,
        lastActivityDays: ""
      },
      workflowTriggers: [],
      isActive: true
    });
  };

  const handleEdit = (category: any) => {
    setNewCategory({
      name: category.name || "",
      description: category.description || "",
      minInvestment: category.minInvestment?.toString() || "",
      maxInvestment: category.maxInvestment?.toString() || "",
      riskProfile: category.riskProfile || "",
      autoAssignRules: {
        minAmount: category.autoAssignRules?.minAmount?.toString() || "",
        maxAmount: category.autoAssignRules?.maxAmount?.toString() || "",
        riskProfiles: category.autoAssignRules?.riskProfiles || [],
        hasActivePortfolio: category.autoAssignRules?.hasActivePortfolio || false,
        lastActivityDays: category.autoAssignRules?.lastActivityDays?.toString() || ""
      },
      workflowTriggers: category.workflowTriggers || [],
      isActive: category.isActive !== false
    });
    setEditingCategory(category);
  };

  const handleSubmit = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: newCategory });
    } else {
      createCategoryMutation.mutate(newCategory);
    }
  };

  const handleRiskProfileToggle = (profile: string) => {
    setNewCategory(prev => ({
      ...prev,
      autoAssignRules: {
        ...prev.autoAssignRules,
        riskProfiles: prev.autoAssignRules.riskProfiles.includes(profile)
          ? prev.autoAssignRules.riskProfiles.filter(p => p !== profile)
          : [...prev.autoAssignRules.riskProfiles, profile]
      }
    }));
  };

  const handleWorkflowToggle = (workflowId: string) => {
    setNewCategory(prev => ({
      ...prev,
      workflowTriggers: prev.workflowTriggers.includes(workflowId)
        ? prev.workflowTriggers.filter(w => w !== workflowId)
        : [...prev.workflowTriggers, workflowId]
    }));
  };

  const filteredCategories = (categories || []).filter((category: any) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        return profile;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Categorias de Clientes</h1>
            <p className="text-sm text-gray-600 mt-1">
              Configure categorias com regras de auto-atribuição e workflows
            </p>
          </div>
          <Dialog open={isCreateDialogOpen || !!editingCategory} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              setEditingCategory(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Editar' : 'Criar'} Categoria</DialogTitle>
                <DialogDescription>
                  Configure uma categoria de cliente com regras automáticas de atribuição.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações Básicas</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="name">Nome da Categoria</Label>
                      <Input
                        id="name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Clientes Premium"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva os critérios desta categoria..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minInvestment">Investimento Mínimo</Label>
                        <Input
                          id="minInvestment"
                          type="number"
                          value={newCategory.minInvestment}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, minInvestment: e.target.value }))}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxInvestment">Investimento Máximo</Label>
                        <Input
                          id="maxInvestment"
                          type="number"
                          value={newCategory.maxInvestment}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, maxInvestment: e.target.value }))}
                          placeholder="Deixe vazio para ilimitado"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="riskProfile">Perfil de Risco Padrão</Label>
                      <Select value={newCategory.riskProfile} onValueChange={(value) => setNewCategory(prev => ({ ...prev, riskProfile: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o perfil de risco" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conservative">Conservador</SelectItem>
                          <SelectItem value="moderate">Moderado</SelectItem>
                          <SelectItem value="aggressive">Agressivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Auto-assign Rules */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Regras de Auto-Atribuição</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minAmount">Valor Mínimo</Label>
                      <Input
                        id="minAmount"
                        type="number"
                        value={newCategory.autoAssignRules.minAmount}
                        onChange={(e) => setNewCategory(prev => ({
                          ...prev,
                          autoAssignRules: { ...prev.autoAssignRules, minAmount: e.target.value }
                        }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxAmount">Valor Máximo</Label>
                      <Input
                        id="maxAmount"
                        type="number"
                        value={newCategory.autoAssignRules.maxAmount}
                        onChange={(e) => setNewCategory(prev => ({
                          ...prev,
                          autoAssignRules: { ...prev.autoAssignRules, maxAmount: e.target.value }
                        }))}
                        placeholder="Deixe vazio para ilimitado"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Perfis de Risco Aceitos</Label>
                    <div className="flex gap-4 mt-2">
                      {['conservative', 'moderate', 'aggressive'].map((profile) => (
                        <div key={profile} className="flex items-center space-x-2">
                          <Checkbox
                            id={profile}
                            checked={newCategory.autoAssignRules.riskProfiles.includes(profile)}
                            onCheckedChange={() => handleRiskProfileToggle(profile)}
                          />
                          <Label htmlFor={profile}>{getRiskProfileLabel(profile)}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasActivePortfolio"
                      checked={newCategory.autoAssignRules.hasActivePortfolio}
                      onCheckedChange={(checked) => setNewCategory(prev => ({
                        ...prev,
                        autoAssignRules: { ...prev.autoAssignRules, hasActivePortfolio: !!checked }
                      }))}
                    />
                    <Label htmlFor="hasActivePortfolio">Requer portfólio ativo</Label>
                  </div>
                  <div>
                    <Label htmlFor="lastActivityDays">Atividade nos últimos (dias)</Label>
                    <Input
                      id="lastActivityDays"
                      type="number"
                      value={newCategory.autoAssignRules.lastActivityDays}
                      onChange={(e) => setNewCategory(prev => ({
                        ...prev,
                        autoAssignRules: { ...prev.autoAssignRules, lastActivityDays: e.target.value }
                      }))}
                      placeholder="30"
                    />
                  </div>
                </div>

                {/* Workflow Triggers */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Workflows Automatizados</h3>
                  <div className="space-y-2">
                    {(workflows || []).map((workflow: any) => (
                      <div key={workflow.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={workflow.id}
                          checked={newCategory.workflowTriggers.includes(workflow.id)}
                          onCheckedChange={() => handleWorkflowToggle(workflow.id)}
                        />
                        <Label htmlFor={workflow.id}>{workflow.name}</Label>
                        <Badge variant="outline">{workflow.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={newCategory.isActive}
                    onCheckedChange={(checked) => setNewCategory(prev => ({ ...prev, isActive: !!checked }))}
                  />
                  <Label htmlFor="isActive">Categoria ativa</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSubmit} disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                    {editingCategory ? 'Atualizar' : 'Criar'} Categoria
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingCategory(null);
                    resetForm();
                  }}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Search */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar categorias..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories List */}
      <main className="flex-1 overflow-y-auto p-6">
        {categoriesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category: any) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-5 h-5 text-primary-500" />
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        {!category.isActive && (
                          <Badge variant="secondary" className="mt-1">Inativa</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCategoryMutation.mutate(category.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {category.description || 'Sem descrição'}
                  </p>
                  
                  <div className="space-y-3">
                    {category.riskProfile && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Perfil de Risco:</span>
                        <Badge className={getRiskProfileColor(category.riskProfile)}>
                          {getRiskProfileLabel(category.riskProfile)}
                        </Badge>
                      </div>
                    )}
                    
                    {(category.minInvestment || category.maxInvestment) && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Investimento:</span>
                        <span className="text-sm font-medium">
                          {category.minInvestment && `R$ ${category.minInvestment.toLocaleString()}`}
                          {category.minInvestment && category.maxInvestment && ' - '}
                          {category.maxInvestment && `R$ ${category.maxInvestment.toLocaleString()}`}
                          {!category.maxInvestment && category.minInvestment && '+'}
                        </span>
                      </div>
                    )}
                    
                    {category.workflowTriggers && category.workflowTriggers.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Workflows:</span>
                        <span className="text-sm font-medium">{category.workflowTriggers.length}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma categoria encontrada</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Nenhuma categoria corresponde aos critérios de busca.' : 'Crie sua primeira categoria de cliente.'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}