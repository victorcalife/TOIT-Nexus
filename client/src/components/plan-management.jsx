import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  Check,
  X,
  AlertTriangle,
  Crown,
  Zap,
  Shield,
  Star,
  Calendar,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

) {
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [comparison, setComparison] = useState<PlanComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [eligibility, setEligibility] = useState<{ allowed);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailablePlans();
  }, [currentPlan]);

  useEffect(() => {
    if (selectedPlan) {
      comparePlans(selectedPlan);
      checkEligibility(selectedPlan);
    }
  }, [selectedPlan]);

  const fetchAvailablePlans = async () => {
    try {
      const response = await fetch(`/api/plan-management/available/${currentPlan}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailablePlans(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar planos, error);
      toast({
        title,
        description,
        variant);
    } finally {
      setLoading(false);
    }
  };

  const comparePlans = async (targetPlan) => {
    try {
      const response = await fetch('/api/plan-management/compare', {
        method,
        headers,
        body, targetPlan })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setComparison(data.data);
      }
    } catch (error) {
      console.error('Erro ao comparar planos, error);
    }
  };

  const checkEligibility = async (targetPlan) => {
    try {
      const response = await fetch('/api/plan-management/check-eligibility', {
        method,
        headers,
        body, targetPlan })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEligibility(data.data);
      }
    } catch (error) {
      console.error('Erro ao verificar elegibilidade, error);
    }
  };

  const executePlanChange = async (reason?) => {
    if (!selectedPlan || !comparison) return;

    setProcessing(true);
    
    try {
      const response = await fetch('/api/plan-management/change-plan', {
        method,
        headers,
        body,
          currentPlan,
          targetPlan,
          reason)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title,
          description,
          variant);
        
        // Recarregar página após alguns segundos para refletir mudanças
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title,
          description,
          variant);
      }
    } catch (error) {
      console.error('Erro ao alterar plano, error);
      toast({
        title,
        description,
        variant);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style,
      currency).format(value);
  };

  const getPlanIcon = (planSlug) => {
    switch (planSlug.toLowerCase()) {
      case 'basico':
        return <Shield className="w-6 h-6" />;
      case 'standard':
        return <Star className="w-6 h-6" />;
      case 'premium':
        return <Crown className="w-6 h-6" />;
      case 'enterprise':
        return <Zap className="w-6 h-6" />;
      default) => {
    switch (changeType) {
      case 'upgrade':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'downgrade':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Carregando planos disponíveis...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Plano</h2>
        <p className="text-gray-600 mt-2">
          Seu plano atual)}</Badge>
        </p>
      </div>

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plans">Alterar Plano</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 md) => (
              <Card 
                key={plan.slug} 
                className={`cursor-pointer transition-all duration-200 ${
                  selectedPlan === plan.slug 
                    ? 'ring-2 ring-blue-500 shadow-lg' 
                    : 'hover) => setSelectedPlan(plan.slug)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getPlanIcon(plan.slug)}
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                    </div>
                    {plan.isPopular && (
                      <Badge className="bg-blue-100 text-blue-800">Popular</Badge>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(plan.priceMonthly)}
                        <span className="text-sm font-normal text-gray-500">/mês</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        ou {formatCurrency(plan.priceYearly)}/ano
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Módulos inclusos, 4).map((module) => (
                          <div key={module} className="flex items-center text-sm">
                            <Check className="w-4 h-4 text-green-500 mr-2" />
                            {module}
                          </div>
                        ))}
                        {plan.modules.length > 4 && (
                          <div className="text-sm text-gray-500">
                            +{plan.modules.length - 4} módulos adicionais
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedPlan && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Confirmar Mudança de Plano
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eligibility && !eligibility.allowed ? (
                  <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700">{eligibility.reason}</span>
                  </div>
                ) {getChangeTypeIcon(comparison.changes.changeType)}
                        <span className="ml-2 font-medium">
                          {comparison.changes.changeType === 'upgrade' ? 'Upgrade' :
                           comparison.changes.changeType === 'downgrade' ? 'Downgrade' : 'Mudança'} 
                          para {comparison.targetPlan.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {comparison.changes.priceChange > 0 ? '+' : ''}
                          {formatCurrency(comparison.changes.priceChange)}/mês
                        </div>
                      </div>
                    </div>

                    {comparison.changes.addedModules.length > 0 && (
                      <div>
                        <p className="font-medium text-green-700 mb-2">Módulos adicionados) => (
                            <div key={module} className="flex items-center text-sm text-green-600">
                              <Check className="w-4 h-4 mr-2" />
                              {module}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {comparison.changes.removedModules.length > 0 && (
                      <div>
                        <p className="font-medium text-red-700 mb-2">Módulos removidos) => (
                            <div key={module} className="flex items-center text-sm text-red-600">
                              <X className="w-4 h-4 mr-2" />
                              {module}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => executePlanChange()}
                        disabled={processing}
                        className="flex-1"
                      >
                        {processing ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) {() => setSelectedPlan(null)}
                        disabled={processing}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) {comparison ? (
            <div className="grid grid-cols-1 lg)}
                    <span className="ml-2">Plano Atual</span>
                  </CardTitle>
                  <CardDescription>{comparison.currentPlan.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-2xl font-bold">
                      {formatCurrency(comparison.currentPlan.priceMonthly)}
                      <span className="text-sm font-normal text-gray-500">/mês</span>
                    </div>
                    
                    <div>
                      <p className="font-medium mb-2">Módulos) => (
                          <div key={module} className="flex items-center text-sm">
                            <Check className="w-4 h-4 text-green-500 mr-2" />
                            {module}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plano Alvo */}
              <Card className="border-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {getPlanIcon(comparison.targetPlan.slug)}
                    <span className="ml-2">Novo Plano</span>
                  </CardTitle>
                  <CardDescription>{comparison.targetPlan.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(comparison.targetPlan.priceMonthly)}
                      <span className="text-sm font-normal text-gray-500">/mês</span>
                    </div>
                    
                    <div>
                      <p className="font-medium mb-2">Módulos) => {
                          const isNew = comparison.changes.addedModules.includes(module);
                          const isRemoved = comparison.changes.removedModules.includes(module);
                          
                          return (
                            <div key={module} className={`flex items-center text-sm ${
                              isNew ? 'text-green-600 font-medium' :
                              isRemoved ? 'text-red-600 line-through' : ''
                            }`}>
                              <Check className={`w-4 h-4 mr-2 ${
                                isNew ? 'text-green-500' :
                                isRemoved ? 'text-red-500' : 'text-green-500'
                              }`} />
                              {module}
                              {isNew && <Badge className="ml-2 text-xs bg-green-100 text-green-800">Novo</Badge>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">Selecione um plano para ver a comparação detalhada.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PlanManagement;