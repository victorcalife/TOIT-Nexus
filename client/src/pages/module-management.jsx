import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Shield, Settings, Users, CreditCard, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ModuleManagement() {
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available modules
  const { data= [], isLoading,
  });

  // Fetch tenant modules
  const { data= [], isLoading,
  });

  // Fetch usage statistics
  const { data= {}, isLoading,
  });

  // Toggle module mutation
  const toggleModuleMutation = useMutation({
    mutationFn, enabled }: ({ moduleId }) => {
      return await apiRequest(`/api/modules/${moduleId}/toggle`, {
        method,
        body),
      });
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

  // Activate module mutation
  const activateModuleMutation = useMutation({
    mutationFn, plan }: ({ moduleId }) => {
`
      return await apiRequest(`/api/modules/${moduleId}/activate`, {
        method,
        body),
      });
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

  const getModuleStatus = (module) => ({ if (!module.isEnabled) return { status, color, text) > new Date(module.trialEndsAt)) {
      return { status, color, text) return { status, color, text) return { status, color, text, color, text }) => {
    if (module.priceModel === 'free') return 'Gratuito';
`
    if (module.priceModel === 'per_user') return `R$ ${module.pricePerUser}/usuário/mês`;
`
    if (module.priceModel === 'monthly') return `R$ ${module.basePrice}/mês`;
`
    return `R$ ${module.basePrice}`;
  };

  const getUsagePercentage = (current, limit) => {
    if (!limit || limit === -1) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loadingModules || loadingTenantModules) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Módulos</h1>
          <p className="text-muted-foreground">
            Gerencie os módulos ativos da sua empresa e controle funcionalidades
          </p>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Módulos Ativos</TabsTrigger>
          <TabsTrigger value="available">Módulos Disponíveis</TabsTrigger>
          <TabsTrigger value="usage">Uso e Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md) => {
              const status = getModuleStatus(module);
              return (
                <Card key={module.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">{module.displayName}</CardTitle>
                      </div>
                      <Badge variant={status.color as any}>{status.text}</Badge>
                    </div>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Status e controles */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Ativo</span>
                        <Switch
                          checked={module.isEnabled}
                          onCheckedChange={(enabled) => 
                            toggleModuleMutation.mutate({ moduleId: module.id, enabled })
                          }
                          disabled={toggleModuleMutation.isPending}
                        />
                      </div>

                      {/* Informações de plano */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Plano), { 
                                addSuffix, 
                                locale)}
                            </span>
                          </div>
                        )}

                        {module.maxUsers && module.maxUsers !== -1 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Usuários, module.maxUsers)} 
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>

                      {/* Limites de uso */}
                      ({ module.usageLimits && Object.keys(module.usageLimits).length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Limites de Uso</h4>
                          {Object.entries(module.usageLimits).map(([key, limit]: [string, any] }) => {
                            const current = module.currentUsage?.[key] || 0;
                            const percentage = getUsagePercentage(current, limit);
                            
                            return (
                              <div key={key} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="capitalize">{key.replace('_', ' ')}</span>
                                  <span>{current}/{limit === -1 ? '∞' : limit}</span>
                                </div>
                                {limit !== -1 && (
                                  <Progress 
                                    value={percentage} 
                                    className="h-1"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setSelectedModule(module)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md) => 
              !tenantModules.find((tm) => tm.moduleId === module.id)
            ).map((module) => (
              <Card key={module.id} className="relative">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-gray-400" />
                    <CardTitle className="text-lg">{module.displayName}</CardTitle>
                  </div>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {getPriceDisplay(module)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {module.category === 'premium' ? 'Módulo Premium' : 
                         module.category === 'enterprise' ? 'Módulo Enterprise' : 'Módulo Padrão'}
                      </p>
                    </div>

                    {/* Funcionalidades */}
                    ({ module.features && module.features.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Funcionalidades, 3).map((feature, index }) => (
                            <li key={index} className="flex items-center space-x-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {module.features.length > 3 && (
                            <li className="text-muted-foreground">
                              +{module.features.length - 3} funcionalidades
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <Button 
                      className="w-full"
                      onClick={() => activateModuleMutation.mutate({ 
                        moduleId: module.id, 
                        plan: 'trial' })}
                      disabled={activateModuleMutation.isPending}
                    >
                      {activateModuleMutation.isPending ? "Ativando..." : 
                       module.priceModel === 'free' ? "Ativar Gratuito" : "Iniciar Avaliação"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid gap-4 md).map(([moduleName, stats]: [string, any]) => (
              <Card key={moduleName}>
                <CardHeader>
                  <CardTitle className="text-lg capitalize">{moduleName.replace('_', ' ')}</CardTitle>
                  <CardDescription>Estatísticas de uso do módulo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Uso Total), { 
                          addSuffix, 
                          locale) {/* Module Details Dialog */}
      {selectedModule && (
        <Dialog open={!!selectedModule} onOpenChange={() => setSelectedModule(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedModule.displayName}</DialogTitle>
              <DialogDescription>
                Configurações detalhadas do módulo
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Status).color as any} className="ml-2">
                    {getModuleStatus(selectedModule).text}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Plano).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="capitalize">{key.replace('_', ' ')}</span>
                        <span className="font-medium">{value === -1 ? 'Ilimitado' : value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedModule(null)}>
                <Button>
                  Fazer Upgrade
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}`