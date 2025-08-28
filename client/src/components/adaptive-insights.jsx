import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import {  
  BarChart3, }
} from 'lucide-react';

) ({ const [loading, setLoading] = useState(false);
  const [patterns, setPatterns] = useState<DataPattern | null>(null);
  const [insights, setInsights] = useState<AdaptiveInsight[]>([]);
  const [adaptiveKPIs, setAdaptiveKPIs] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);

  // Executar análise adaptativa
  const runAdaptiveAnalysis = async ( }) => {
    setLoading(true);
    try {
      console.log('🧠 Executando análise adaptativa...');
      
      const response = await fetch(`/api/adaptive/analyze/${tenantId}`, {`
        headers)}`
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
        const mockInsights= [
          {
            type,
            title,
            description,
            confidence,
            impact,
            autoApplicable,
            metadata,
          {
            type,
            title,
            description,
            confidence,
            impact,
            autoApplicable,
            metadata);
      }
    } catch (error) {
      console.error('❌ Erro na análise adaptativa, error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar saúde do sistema adaptativo
  const checkAdaptiveHealth = async () => {
    try {`
      const response = await fetch(`/api/adaptive/health/${tenantId}`, {`
        headers)}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHealth(data.data);
        }
      }
    } catch (error) {
      console.error('❌ Erro no health check, error);
    }
  };

  // Aplicar KPI sugerido
  const applyKPI = async (kpiData) => {
    try {
      const response = await fetch('/api/adaptive/kpis/apply', {
        method,
        headers,`
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body,
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
      console.error('❌ Erro ao aplicar KPI, error);
    }
  };

  useEffect(() => {
    checkAdaptiveHealth();
  }, [tenantId]);

  const getInsightIcon = (type) => {
    switch (type) {
      case 'kpi_suggestion'="h-4 w-4" />;
      case 'workflow_rule'="h-4 w-4" />;
      case 'alert_threshold'="h-4 w-4" />;
      case 'report_optimization'="h-4 w-4" />;
      default="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact) => ({ switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default }) => {
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
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover) {/* Status de Saúde */}
      ({ health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Status do Sistema Adaptativo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md, idx }) => (
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
          ) {index} className="border-l-4 border-l-purple-500">
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
                      </Badge>`
                      <div className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                        {insight.confidence}% confiança
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={insight.confidence} className="w-full" />
                    
                    ({ insight.autoApplicable ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Aplicação automática disponível</span>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={( }) => applyKPI(insight.metadata)}
                          className="bg-green-600 hover) {/* Aba de Padrões */}
        <TabsContent value="patterns" className="space-y-4">
          {patterns ? (
            <div className="grid grid-cols-1 md)}
                        </div>
                      </div>
                    </div>
                    
                    ({ patterns.clientPatterns.riskDistribution && (
                      <div>
                        <div className="font-medium mb-2">Distribuição de Risco</div>
                        {Object.entries(patterns.clientPatterns.riskDistribution).map(([risk, count] }) => (
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
                    
                    ({ patterns.workflowPatterns.suggestedOptimizations && 
                     patterns.workflowPatterns.suggestedOptimizations.length > 0 && (
                      <div>
                        <div className="font-medium mb-2">Otimizações Sugeridas</div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {patterns.workflowPatterns.suggestedOptimizations.map((opt, idx }) => (
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
          ) {/* Aba de KPIs Adaptativos */}
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
          ) {index}>
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
                        <div>Regras de Adaptação)}
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
                  Última análise).toLocaleString('pt-BR')}
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
}`