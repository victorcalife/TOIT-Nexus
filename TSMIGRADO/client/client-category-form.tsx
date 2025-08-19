import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";

interface ClientCategoryFormProps {
  category?: any;
  onSave?: () => void;
  onCancel?: () => void;
}

export function ClientCategoryForm({ category, onSave, onCancel }: ClientCategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    minInvestment: category?.minInvestment || "",
    maxInvestment: category?.maxInvestment || "",
    riskProfile: category?.riskProfile || "",
    reportFrequency: category?.reportFrequency || "",
    rules: category?.rules || {},
    isActive: category?.isActive ?? true,
  });

  const [customRules, setCustomRules] = useState([
    { key: "min_portfolio_value", label: "Valor Mínimo da Carteira", value: "", operator: "greater_than" },
    { key: "activity_frequency", label: "Frequência de Atividade", value: "", operator: "equals" }
  ]);

  const { toast } = useToast();

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      if (category?.id) {
        await apiRequest('PUT', `/api/categories/${category.id}`, categoryData);
      } else {
        await apiRequest('POST', '/api/categories', categoryData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: category?.id ? "Categoria atualizada" : "Categoria criada",
        description: "Categoria foi salva com sucesso.",
      });
      onSave?.();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar categoria.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    const categoryData = {
      ...formData,
      minInvestment: formData.minInvestment ? parseFloat(formData.minInvestment) : null,
      maxInvestment: formData.maxInvestment ? parseFloat(formData.maxInvestment) : null,
      rules: customRules.reduce((acc, rule) => {
        if (rule.value) {
          acc[rule.key] = {
            operator: rule.operator,
            value: rule.value
          };
        }
        return acc;
      }, {} as any)
    };

    createCategoryMutation.mutate(categoryData);
  };

  const addCustomRule = () => {
    setCustomRules([...customRules, { key: "", label: "", value: "", operator: "equals" }]);
  };

  const updateCustomRule = (index: number, field: string, value: string) => {
    const updatedRules = customRules.map((rule, i) => 
      i === index ? { ...rule, [field]: value } : rule
    );
    setCustomRules(updatedRules);
  };

  const removeCustomRule = (index: number) => {
    setCustomRules(customRules.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>
            Configure os dados fundamentais da categoria de cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Categoria *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Premium, VIP, Iniciante"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="riskProfile">Perfil de Risco</Label>
              <Select 
                value={formData.riskProfile} 
                onValueChange={(value) => setFormData({ ...formData, riskProfile: value })}
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva esta categoria de cliente..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Investment Ranges */}
      <Card>
        <CardHeader>
          <CardTitle>Faixas de Investimento</CardTitle>
          <CardDescription>
            Configure os valores mínimos e máximos para esta categoria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minInvestment">Investimento Mínimo (R$)</Label>
              <Input
                id="minInvestment"
                type="number"
                value={formData.minInvestment}
                onChange={(e) => setFormData({ ...formData, minInvestment: e.target.value })}
                placeholder="50000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxInvestment">Investimento Máximo (R$)</Label>
              <Input
                id="maxInvestment"
                type="number"
                value={formData.maxInvestment}
                onChange={(e) => setFormData({ ...formData, maxInvestment: e.target.value })}
                placeholder="500000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reporting Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Relatórios</CardTitle>
          <CardDescription>
            Configure a frequência de relatórios para esta categoria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportFrequency">Frequência de Relatórios</Label>
            <Select 
              value={formData.reportFrequency} 
              onValueChange={(value) => setFormData({ ...formData, reportFrequency: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a frequência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Custom Business Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Regras de Negócio Customizadas</CardTitle>
              <CardDescription>
                Configure regras específicas para workflows automáticos
              </CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={addCustomRule}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Regra
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {customRules.map((rule, index) => (
            <div key={index} className="flex items-end space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex-1 space-y-2">
                <Label>Nome da Regra</Label>
                <Input
                  value={rule.label}
                  onChange={(e) => updateCustomRule(index, 'label', e.target.value)}
                  placeholder="Ex: Valor Mínimo da Carteira"
                />
              </div>
              
              <div className="flex-1 space-y-2">
                <Label>Operador</Label>
                <Select 
                  value={rule.operator} 
                  onValueChange={(value) => updateCustomRule(index, 'operator', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Igual a</SelectItem>
                    <SelectItem value="greater_than">Maior que</SelectItem>
                    <SelectItem value="less_than">Menor que</SelectItem>
                    <SelectItem value="contains">Contém</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 space-y-2">
                <Label>Valor</Label>
                <Input
                  value={rule.value}
                  onChange={(e) => updateCustomRule(index, 'value', e.target.value)}
                  placeholder="Digite o valor"
                />
              </div>
              
              <Button 
                type="button"
                variant="ghost" 
                size="sm"
                onClick={() => removeCustomRule(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          {customRules.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma regra customizada configurada</p>
              <p className="text-sm">Clique em "Adicionar Regra" para criar regras específicas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status da Categoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isActive">Categoria Ativa</Label>
              <p className="text-sm text-gray-500">
                Categorias inativas não serão aplicadas aos workflows
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          disabled={createCategoryMutation.isPending}
          className="bg-primary-500 hover:bg-primary-600"
        >
          {createCategoryMutation.isPending 
            ? "Salvando..." 
            : category?.id 
              ? "Atualizar Categoria" 
              : "Criar Categoria"
          }
        </Button>
      </div>
    </form>
  );
}
