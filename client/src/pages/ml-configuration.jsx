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

// Remove duplicate toast declaration since it's already declared below

  const [config, setConfig] = useState({
    adaptiveEngine: {
      enabled: true,
      sensitivity: 70,
      autoApply: false,
      learningRate: 15
    },
    behaviorAnalysis: {
      enabled: true,
      trackingLevel: 'detailed',
      anomalyDetection: true,
      predictionHorizon: 30
    },
    kpiAdaptation: {
      enabled: true,
      autoGenerate: false,
      recalculationFrequency: 'weekly',
      confidenceThreshold: 80
    },
    workflowOptimization: {
      enabled: true,
      autoSuggest: true,
      ruleGeneration: false,
      performanceTracking: true
    }
  });

  const [metrics, setMetrics] = useState({
    accuracy: 0,
    predictions: 0,
    adaptations: 0,
    lastUpdate: new Date().toISOString(),
    status: 'good'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
const { toast } = useToast();

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
      console.error('Erro ao carregar configuração:', error);
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
            accuracy: data.data.accuracy || 0,
            predictions: data.data.predictions || 0,
            adaptations: data.data.adaptations || 0,
            lastUpdate: data.data.lastUpdate || new Date().toISOString(),
            status: data.data.status || 'good'
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  };

  const saveConfiguration = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/adaptive-engine/configuration', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        toast({
          title: 'Configuração salva',
          description: 'As configurações foram salvas com sucesso.'
        });
      } else {
        throw new Error('Erro ao salvar configuração');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const runAdaptationCycle = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/adaptive-engine/execute-cycle', {
        method: 'POST'
      });

      if (response.ok) {
        toast({
          title: 'Ciclo executado',
          description: 'O ciclo de adaptação foi executado com sucesso.'
        });
        await loadMetrics();
      } else {
        throw new Error('Erro ao executar ciclo');
      }
    } catch (error) {
      console.error('Erro ao executar ciclo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível executar o ciclo de adaptação.',
        variant: 'destructive'
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
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'optimal':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'needs_attention':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Engine Adaptativo</h1>
          <p className="text-gray-600">Configure e monitore o sistema de adaptação automática</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className={getStatusBadgeClass(metrics.status)}>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Precisão</p>
                <p className="text-2xl font-bold text-green-600">{metrics.accuracy}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Predições</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.predictions}</p>
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
                      adaptiveEngine: { ...prev.adaptiveEngine, enabled: checked }
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Sensibilidade de Adaptação</Label>
                <Slider
                  value={[config.adaptiveEngine.sensitivity]}
                  onValueChange={(value) =>
                    setConfig(prev => ({
                      ...prev,
                      adaptiveEngine: { ...prev.adaptiveEngine, sensitivity: value[0] }
                    }))
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
                      adaptiveEngine: { ...prev.adaptiveEngine, autoApply: checked }
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Taxa de Aprendizado</Label>
                <Slider
                  value={[config.adaptiveEngine.learningRate]}
                  onValueChange={(value) =>
                    setConfig(prev => ({
                      ...prev,
                      adaptiveEngine: { ...prev.adaptiveEngine, learningRate: value[0] }
                    }))
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
                      behaviorAnalysis: { ...prev.behaviorAnalysis, enabled: checked }
                    }))
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
                      behaviorAnalysis: { ...prev.behaviorAnalysis, trackingLevel: value }
                    }))
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
                      behaviorAnalysis: { ...prev.behaviorAnalysis, anomalyDetection: checked }
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Horizonte de Predição (dias)</Label>
                <Slider
                  value={[config.behaviorAnalysis.predictionHorizon]}
                  onValueChange={(value) =>
                    setConfig(prev => ({
                      ...prev,
                      behaviorAnalysis: { ...prev.behaviorAnalysis, predictionHorizon: value[0] }
                    }))
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
                      kpiAdaptation: { ...prev.kpiAdaptation, enabled: checked }
                    }))
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
                      kpiAdaptation: { ...prev.kpiAdaptation, autoGenerate: checked }
                    }))
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
                      kpiAdaptation: { ...prev.kpiAdaptation, recalculationFrequency: value }
                    }))
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
                <Label>Limite de Confiança (%)</Label>
                <Slider
                  value={[config.kpiAdaptation.confidenceThreshold]}
                  onValueChange={(value) =>
                    setConfig(prev => ({
                      ...prev,
                      kpiAdaptation: { ...prev.kpiAdaptation, confidenceThreshold: value[0] }
                    }))
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
                      workflowOptimization: { ...prev.workflowOptimization, enabled: checked }
                    }))
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
                      workflowOptimization: { ...prev.workflowOptimization, autoSuggest: checked }
                    }))
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
                      workflowOptimization: { ...prev.workflowOptimization, ruleGeneration: checked }
                    }))
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
                      workflowOptimization: { ...prev.workflowOptimization, performanceTracking: checked }
                    }))
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
          {isLoading ? "Carregando..." : "Recarregar"}
        </Button>
        <Button onClick={saveConfiguration} disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );

