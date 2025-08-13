import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Brain, Settings, Zap, TrendingUp, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

= useToast();

  useEffect(() => {
    loadConfiguration();
    loadMetrics();
  }, []);

  const loadConfiguration = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/adaptive-engine/configuration');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setConfig(data.data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configuração, error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/adaptive-engine/health');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setMetrics({
            accuracy,
            predictions,
            adaptations,
            lastUpdate).toISOString(),
            status);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar métricas, error);
    }
  };

  const saveConfiguration = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/adaptive-engine/configuration', {
        method,
        headers,
        },
        body),
      });

      if (response.ok) {
        toast({
          title,
          description,
        });
      } else {
        throw new Error('Erro ao salvar configuração');
      }
    } catch (error) {
      console.error('Erro ao salvar, error);
      toast({
        title,
        description,
        variant,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const runAdaptationCycle = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/adaptive-engine/execute-cycle', {
        method,
      });

      if (response.ok) {
        toast({
          title,
          description,
        });
        await loadMetrics();
      } else {
        throw new Error('Erro ao executar ciclo');
      }
    } catch (error) {
      console.error('Erro ao executar ciclo, error);
      toast({
        title,
        description,
        variant,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'good':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'needs_attention':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default) => {
    switch (status) {
      case 'optimal':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'needs_attention':
        return 'bg-yellow-100 text-yellow-800';
      default)}>
            {getStatusIcon(metrics.status)}
            <span className="ml-1 capitalize">{metrics.status.replace('_', ' ')}</span>
          </Badge>
          <Button onClick={runAdaptationCycle} disabled={isLoading}>
            <Zap className="h-4 w-4 mr-2" />
            Executar Ciclo
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md)}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Adaptações</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.adaptations}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Última Atualização</p>
                <p className="text-sm font-bold text-gray-600">
                  {new Date(metrics.lastUpdate).toLocaleDateString()}
                </p>
              </div>
              <Activity className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações */}
      <Tabs defaultValue="engine" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="engine">
            <Settings className="mr-2 h-4 w-4" />
            Engine Adaptativo
          </TabsTrigger>
          <TabsTrigger value="behavior">
            <Activity className="mr-2 h-4 w-4" />
            Análise Comportamental
          </TabsTrigger>
          <TabsTrigger value="kpis">
            <TrendingUp className="mr-2 h-4 w-4" />
            KPIs Adaptativos
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <Zap className="mr-2 h-4 w-4" />
            Otimização Workflows
          </TabsTrigger>
        </TabsList>

        {/* Engine Adaptativo */}
        <TabsContent value="engine" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Engine Adaptativo</CardTitle>
              <CardDescription>
                Configure como o sistema aprende e se adapta aos padrões de uso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="engine-enabled">Engine Adaptativo Ativo</Label>
                  <p className="text-sm text-gray-600">Ativar sistema de adaptação automática</p>
                </div>
                <Switch
                  id="engine-enabled"
                  checked={config.adaptiveEngine.enabled}
                  onCheckedChange={(checked) =>
                    setConfig(prev => ({
                      ...prev,
                      adaptiveEngine, enabled))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Sensibilidade de Adaptação) =>
                    setConfig(prev => ({
                      ...prev,
                      adaptiveEngine, sensitivity))
                  }
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
                <p className="text-sm text-gray-600">
                  Maior sensibilidade = mais adaptações automáticas
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-apply">Aplicação Automática</Label>
                  <p className="text-sm text-gray-600">Aplicar adaptações sem confirmação</p>
                </div>
                <Switch
                  id="auto-apply"
                  checked={config.adaptiveEngine.autoApply}
                  onCheckedChange={(checked) =>
                    setConfig(prev => ({
                      ...prev,
                      adaptiveEngine, autoApply))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Taxa de Aprendizado) =>
                    setConfig(prev => ({
                      ...prev,
                      adaptiveEngine, learningRate))
                  }
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-gray-600">
                  Controla a velocidade de aprendizado do sistema
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análise Comportamental */}
        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise Comportamental</CardTitle>
              <CardDescription>
                Configure como o sistema analisa e aprende com o comportamento dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="behavior-enabled">Análise Comportamental Ativa</Label>
                  <p className="text-sm text-gray-600">Analisar padrões de uso dos usuários</p>
                </div>
                <Switch
                  id="behavior-enabled"
                  checked={config.behaviorAnalysis.enabled}
                  onCheckedChange={(checked) =>
                    setConfig(prev => ({
                      ...prev,
                      behaviorAnalysis, enabled))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tracking-level">Nível de Rastreamento</Label>
                <Select
                  value={config.behaviorAnalysis.trackingLevel}
                  onValueChange={(value) =>
                    setConfig(prev => ({
                      ...prev,
                      behaviorAnalysis, trackingLevel))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="detailed">Detalhado</SelectItem>
                    <SelectItem value="comprehensive">Abrangente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="anomaly-detection">Detecção de Anomalias</Label>
                  <p className="text-sm text-gray-600">Identificar comportamentos anômalos</p>
                </div>
                <Switch
                  id="anomaly-detection"
                  checked={config.behaviorAnalysis.anomalyDetection}
                  onCheckedChange={(checked) =>
                    setConfig(prev => ({
                      ...prev,
                      behaviorAnalysis, anomalyDetection))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Horizonte de Predição) =>
                    setConfig(prev => ({
                      ...prev,
                      behaviorAnalysis, predictionHorizon))
                  }
                  max={90}
                  min={7}
                  step={7}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KPIs Adaptativos */}
        <TabsContent value="kpis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>KPIs Adaptativos</CardTitle>
              <CardDescription>
                Configure como o sistema gera e adapta KPIs automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="kpi-enabled">KPIs Adaptativos Ativos</Label>
                  <p className="text-sm text-gray-600">Gerar KPIs baseados nos dados</p>
                </div>
                <Switch
                  id="kpi-enabled"
                  checked={config.kpiAdaptation.enabled}
                  onCheckedChange={(checked) =>
                    setConfig(prev => ({
                      ...prev,
                      kpiAdaptation, enabled))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-generate">Geração Automática</Label>
                  <p className="text-sm text-gray-600">Criar novos KPIs automaticamente</p>
                </div>
                <Switch
                  id="auto-generate"
                  checked={config.kpiAdaptation.autoGenerate}
                  onCheckedChange={(checked) =>
                    setConfig(prev => ({
                      ...prev,
                      kpiAdaptation, autoGenerate))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recalc-frequency">Frequência de Recálculo</Label>
                <Select
                  value={config.kpiAdaptation.recalculationFrequency}
                  onValueChange={(value) =>
                    setConfig(prev => ({
                      ...prev,
                      kpiAdaptation, recalculationFrequency))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Limite de Confiança) =>
                    setConfig(prev => ({
                      ...prev,
                      kpiAdaptation, confidenceThreshold))
                  }
                  max={95}
                  min={50}
                  step={5}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Otimização de Workflows */}
        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Otimização de Workflows</CardTitle>
              <CardDescription>
                Configure como o sistema otimiza e sugere melhorias nos workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="workflow-enabled">Otimização Ativa</Label>
                  <p className="text-sm text-gray-600">Analisar e otimizar workflows</p>
                </div>
                <Switch
                  id="workflow-enabled"
                  checked={config.workflowOptimization.enabled}
                  onCheckedChange={(checked) =>
                    setConfig(prev => ({
                      ...prev,
                      workflowOptimization, enabled))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-suggest">Sugestões Automáticas</Label>
                  <p className="text-sm text-gray-600">Sugerir melhorias automaticamente</p>
                </div>
                <Switch
                  id="auto-suggest"
                  checked={config.workflowOptimization.autoSuggest}
                  onCheckedChange={(checked) =>
                    setConfig(prev => ({
                      ...prev,
                      workflowOptimization, autoSuggest))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="rule-generation">Geração de Regras</Label>
                  <p className="text-sm text-gray-600">Criar regras baseadas em padrões</p>
                </div>
                <Switch
                  id="rule-generation"
                  checked={config.workflowOptimization.ruleGeneration}
                  onCheckedChange={(checked) =>
                    setConfig(prev => ({
                      ...prev,
                      workflowOptimization, ruleGeneration))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="performance-tracking">Rastreamento de Performance</Label>
                  <p className="text-sm text-gray-600">Monitorar eficácia dos workflows</p>
                </div>
                <Switch
                  id="performance-tracking"
                  checked={config.workflowOptimization.performanceTracking}
                  onCheckedChange={(checked) =>
                    setConfig(prev => ({
                      ...prev,
                      workflowOptimization, performanceTracking))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botões de ação */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={loadConfiguration} disabled={isLoading}>
          Resetar
        </Button>
        <Button onClick={saveConfiguration} disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
}
