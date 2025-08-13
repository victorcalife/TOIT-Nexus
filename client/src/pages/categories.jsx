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
    name,
    description,
    minInvestment,
    maxInvestment,
    riskProfile,
    autoAssignRules,
      maxAmount,
      riskProfiles,
      hasActivePortfolio,
      lastActivityDays,
    workflowTriggers,
    isActive);

  const { toast } = useToast();

  const { data, isLoading,
    retry,
  });

  const { data,
    retry,
  });

  const createCategoryMutation = useMutation({
    mutationFn) => {
      const processedData = {
        ...categoryData,
        minInvestment) {
      queryClient.invalidateQueries({ queryKey);
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title,
        description,
      });
    },
    onError) => {
      toast({
        title,
        description,
        variant,
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn, data }: { id, data) => {
      const processedData = {
        ...data,
        minInvestment) {id}`, processedData);
    },
    onSuccess) => {
      queryClient.invalidateQueries({ queryKey);
      setEditingCategory(null);
      resetForm();
      toast({
        title,
        description,
      });
    },
    onError) => {
      toast({
        title,
        description,
        variant,
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn) => {
      await apiRequest('DELETE', `/api/categories/${categoryId}`);
    },
    onSuccess) => {
      queryClient.invalidateQueries({ queryKey);
      toast({
        title,
        description,
      });
    },
    onError) => {
      toast({
        title,
        description,
        variant,
      });
    },
  });

  const resetForm = () => {
    setNewCategory({
      name,
      description,
      minInvestment,
      maxInvestment,
      riskProfile,
      autoAssignRules,
        maxAmount,
        riskProfiles,
        hasActivePortfolio,
        lastActivityDays,
      workflowTriggers,
      isActive);
  };

  const handleEdit = (category) => {
    setNewCategory({
      name,
      description,
      minInvestment) || "",
      maxInvestment) || "",
      riskProfile,
      autoAssignRules) || "",
        maxAmount) || "",
        riskProfiles,
        hasActivePortfolio,
        lastActivityDays) || ""
      },
      workflowTriggers,
      isActive);
    setEditingCategory(category);
  };

  const handleSubmit = () => {
    if (!newCategory.name.trim()) {
      toast({
        title,
        description,
        variant,
      });
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({ id, data);
    } else {
      createCategoryMutation.mutate(newCategory);
    }
  };

  const handleRiskProfileToggle = (profile) => {
    setNewCategory(prev => ({
      ...prev,
      autoAssignRules,
        riskProfiles)
          ? prev.autoAssignRules.riskProfiles.filter(p => p !== profile) {
    setNewCategory(prev => ({
      ...prev,
      workflowTriggers)
        ? prev.workflowTriggers.filter(w => w !== workflowId) {
    switch (profile) {
      case 'conservative':
        return 'bg-blue-100 text-blue-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'aggressive':
        return 'bg-red-100 text-red-800';
      default) => {
    switch (profile) {
      case 'conservative':
        return 'Conservador';
      case 'moderate':
        return 'Moderado';
      case 'aggressive':
        return 'Agressivo';
      default) => {
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
                        onChange={(e) => setNewCategory(prev => ({ ...prev, name))}
                        placeholder="Ex) => setNewCategory(prev => ({ ...prev, description))}
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
                          onChange={(e) => setNewCategory(prev => ({ ...prev, minInvestment))}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxInvestment">Investimento Máximo</Label>
                        <Input
                          id="maxInvestment"
                          type="number"
                          value={newCategory.maxInvestment}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, maxInvestment))}
                          placeholder="Deixe vazio para ilimitado"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="riskProfile">Perfil de Risco Padrão</Label>
                      <Select value={newCategory.riskProfile} onValueChange={(value) => setNewCategory(prev => ({ ...prev, riskProfile))}>
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
                          autoAssignRules, minAmount))}
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
                          autoAssignRules, maxAmount))}
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
                        autoAssignRules, hasActivePortfolio))}
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
                        autoAssignRules, lastActivityDays))}
                      placeholder="30"
                    />
                  </div>
                </div>

                {/* Workflow Triggers */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Workflows Automatizados</h3>
                  <div className="space-y-2">
                    {(workflows || []).map((workflow) => (
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
                    onCheckedChange={(checked) => setNewCategory(prev => ({ ...prev, isActive))}
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
          <div className="grid grid-cols-1 md)].map((_, i) => (
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
        ) {category.id} className="hover)}
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
                        <span className="text-sm text-gray-500">Perfil de Risco)}>
                          {getRiskProfileLabel(category.riskProfile)}
                        </Badge>
                      </div>
                    )}
                    
                    {(category.minInvestment || category.maxInvestment) && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Investimento)}`}
                          {category.minInvestment && category.maxInvestment && ' - '}
                          {category.maxInvestment && `R$ ${category.maxInvestment.toLocaleString()}`}
                          {!category.maxInvestment && category.minInvestment && '+'}
                        </span>
                      </div>
                    )}
                    
                    {category.workflowTriggers && category.workflowTriggers.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Workflows)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) {searchTerm ? 'Nenhuma categoria corresponde aos critérios de busca.' : 'Crie sua primeira categoria de cliente.'}
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