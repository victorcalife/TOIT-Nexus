import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  PieChart, 
  Activity, 
  Zap, 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Lightbulb,
  RefreshCw,
  Cpu
} from 'lucide-react';

interface AdaptiveInsight {
  type: 'kpi_suggestion' | 'workflow_rule' | 'alert_threshold' | 'report_optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  autoApplicable: boolean;
  metadata: Record<string, any>;
}

interface DataPattern {
  clientPatterns?: {
    totalClients: number;
    avgInvestment: number;
    riskDistribution: Record<string, number>;
    suggestedKPIs: string[];
  };
  investmentPatterns?: {
    suggestedThresholds: Record<string, any>;
    adaptiveRules: any[];
  };
  workflowPatterns?: {
    totalWorkflows: number;
    activeWorkflows: number;
    suggestedOptimizations: string[];
  };
}

interface AdaptiveInsightsProps {
  tenantId: string;
  userRole: string;
}

export function AdaptiveInsights({ tenantId, userRole }: AdaptiveInsightsProps) {
  const [loading, setLoading] = useState(false);
  const [patterns, setPatterns] = useState<DataPattern | null>(null);
  const [insights, setInsights] = useState<AdaptiveInsight[]>([]);
  const [adaptiveKPIs, setAdaptiveKPIs] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);

  // Executar análise adaptativa
  const runAdaptiveAnalysis = async () => {
    setLoading(true);
    try {
      console.log('🧠 Executando análise adaptativa...');
      
      const response = await fetch(`/api/adaptive/analyze/${tenantId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro na análise adaptativa');
      }

      const data = await response.json();
      
      if (data.success) {
        setPatterns(data.data.patterns);
        setAdaptiveKPIs(data.data.adaptiveKPIs);
        setLastAnalysis(data.data.analysisTimestamp);
        
        // Simular insights para demonstração
        const mockInsights: AdaptiveInsight[] = [
          {
            type: 'kpi_suggestion',
            title: 'KPI: Ticket Médio Adaptativo',
            description: 'Detectado padrão de crescimento no valor médio de investimentos. Recomendamos KPI adaptativo.',
            confidence: 92,
            impact: 'high',
            autoApplicable: true,
            metadata: { suggestedValue: data.data.summary.avgInvestment }
          },
          {
            type: 'workflow_rule',
            title: 'Regra: Clientes Alto Valor',
            description: 'Identificamos padrão para automatizar tratamento de clientes de alto valor.',
            confidence: 85,
            impact: 'medium',
            autoApplicable: false,
            metadata: { threshold: data.data.summary.avgInvestment * 2 }
          }
        ];
        setInsights(mockInsights);
      }
    } catch (error) {
      console.error('❌ Erro na análise adaptativa:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar saúde do sistema adaptativo
  const checkAdaptiveHealth = async () => {
    try {
      const response = await fetch(`/api/adaptive/health/${tenantId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHealth(data.data);
        }
      }
    } catch (error) {
      console.error('❌ Erro no health check:', error);
    }
  };

  // Aplicar KPI sugerido
  const applyKPI = async (kpiData: any) => {
    try {
      const response = await fetch('/api/adaptive/kpis/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tenantId,
          kpiData
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ KPI aplicado com sucesso');
          // Remover insight aplicado
          setInsights(prev => prev.filter(insight => insight.title !== kpiData.name));
        }
      }
    } catch (error) {
      console.error('❌ Erro ao aplicar KPI:', error);
    }
  };

  useEffect(() => {
    checkAdaptiveHealth();
  }, [tenantId]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'kpi_suggestion': return <BarChart3 className="h-4 w-4" />;
      case 'workflow_rule': return <Zap className="h-4 w-4" />;
      case 'alert_threshold': return <AlertTriangle className="h-4 w-4" />;
      case 'report_optimization': return <PieChart className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header com Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Sistema Adaptativo</h2>
            <p className="text-sm text-muted-foreground">
              Machine Learning e adaptação automática para seu negócio
            </p>
          </div>
        </div>
        
        <Button 
          onClick={runAdaptiveAnalysis}
          disabled={loading}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Cpu className="mr-2 h-4 w-4" />
              Executar Análise
            </>
          )}
        </Button>
      </div>

      {/* Status de Saúde */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Status do Sistema Adaptativo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {health.adaptiveFeatures?.adaptiveKPIs?.count || 0}
                </div>
                <div className="text-sm text-muted-foreground">KPIs Adaptativos</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {health.adaptiveFeatures?.workflows?.activeCount || 0}
                </div>
                <div className="text-sm text-muted-foreground">Workflows Ativos</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {health.adaptiveFeatures?.adaptationLevel || 'Básico'}
                </div>
                <div className="text-sm text-muted-foreground">Nível de Adaptação</div>
              </div>
            </div>
            
            {health.recommendations && health.recommendations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Recomendações:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {health.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <Target className="h-3 w-3 mt-0.5 text-blue-500" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">
            <Lightbulb className="mr-2 h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="patterns">
            <TrendingUp className="mr-2 h-4 w-4" />
            Padrões
          </TabsTrigger>
          <TabsTrigger value="kpis">
            <BarChart3 className="mr-2 h-4 w-4" />
            KPIs Adaptativos
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Zap className="mr-2 h-4 w-4" />
            Automação
          </TabsTrigger>
        </TabsList>

        {/* Aba de Insights */}
        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Execute uma análise adaptativa para ver insights inteligentes</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            insights.map((insight, index) => (
              <Card key={index} className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getInsightIcon(insight.type)}
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription>{insight.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getImpactColor(insight.impact)}>
                        {insight.impact === 'high' ? 'Alto Impacto' : insight.impact === 'medium' ? 'Médio Impacto' : 'Baixo Impacto'}
                      </Badge>
                      <div className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                        {insight.confidence}% confiança
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={insight.confidence} className="w-full" />
                    
                    {insight.autoApplicable ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Aplicação automática disponível</span>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => applyKPI(insight.metadata)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Aplicar Agora
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-sm text-yellow-600">
                        <Clock className="h-4 w-4" />
                        <span>Requer revisão manual</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Aba de Padrões */}
        <TabsContent value="patterns" className="space-y-4">
          {patterns ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Padrões de Clientes */}
              {patterns.clientPatterns && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Padrões de Clientes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Total de Clientes</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {patterns.clientPatterns.totalClients}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Investimento Médio</div>
                        <div className="text-2xl font-bold text-green-600">
                          R$ {patterns.clientPatterns.avgInvestment.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {patterns.clientPatterns.riskDistribution && (
                      <div>
                        <div className="font-medium mb-2">Distribuição de Risco</div>
                        {Object.entries(patterns.clientPatterns.riskDistribution).map(([risk, count]) => (
                          <div key={risk} className="flex justify-between items-center py-1">
                            <span className="capitalize">{risk}</span>
                            <Badge variant="outline">{count} clientes</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Padrões de Workflows */}
              {patterns.workflowPatterns && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <span>Padrões de Workflows</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Total</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {patterns.workflowPatterns.totalWorkflows}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Ativos</div>
                        <div className="text-2xl font-bold text-green-600">
                          {patterns.workflowPatterns.activeWorkflows}
                        </div>
                      </div>
                    </div>
                    
                    {patterns.workflowPatterns.suggestedOptimizations && 
                     patterns.workflowPatterns.suggestedOptimizations.length > 0 && (
                      <div>
                        <div className="font-medium mb-2">Otimizações Sugeridas</div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {patterns.workflowPatterns.suggestedOptimizations.map((opt, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <Target className="h-3 w-3 mt-0.5 text-blue-500" />
                              <span>{opt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Execute uma análise para ver padrões dos seus dados</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba de KPIs Adaptativos */}
        <TabsContent value="kpis" className="space-y-4">
          {adaptiveKPIs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum KPI adaptativo gerado ainda</p>
                  <p className="mt-2">Execute uma análise para gerar KPIs inteligentes</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            adaptiveKPIs.map((kpi, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>{kpi.name}</span>
                  </CardTitle>
                  <CardDescription>{kpi.type === 'metric' ? 'Métrica' : 'Gráfico'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {kpi.adaptiveRules && (
                      <div className="text-sm text-muted-foreground">
                        <div>Regras de Adaptação:</div>
                        <ul className="mt-1 space-y-1">
                          {kpi.adaptiveRules.autoAdjust && <li>• Ajuste automático ativado</li>}
                          {kpi.adaptiveRules.recalculateFrequency && 
                           <li>• Recálculo: {kpi.adaptiveRules.recalculateFrequency}</li>}
                          {kpi.adaptiveRules.alertIfDeviationOver && 
                           <li>• Alerta se desvio > {kpi.adaptiveRules.alertIfDeviationOver}%</li>}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Aba de Automação */}
        <TabsContent value="automation" className="space-y-4">
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              O sistema monitora continuamente seus dados e aplica adaptações automáticas quando necessário.
              {lastAnalysis && (
                <span className="block mt-2 text-sm">
                  Última análise: {new Date(lastAnalysis).toLocaleString('pt-BR')}
                </span>
              )}
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Adaptações Automáticas Ativas</CardTitle>
              <CardDescription>
                Funcionalidades que se ajustam automaticamente aos seus dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">Thresholds Adaptativos</div>
                      <div className="text-sm text-muted-foreground">
                        Limites de alerta ajustados automaticamente
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">Ativo</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">Sugestões de KPIs</div>
                      <div className="text-sm text-muted-foreground">
                        Novos KPIs sugeridos baseados em padrões
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">Ativo</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">Análise de Risco</div>
                      <div className="text-sm text-muted-foreground">
                        Detecta incompatibilidades de perfil automaticamente
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">Ativo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}