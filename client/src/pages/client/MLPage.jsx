/**
 * Página de Machine Learning
 * Permite aos usuários gerenciar modelos de ML, treinar algoritmos e visualizar resultados
 */
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Brain, Play, Square, Download, Upload, BarChart3, Settings, Database } from 'lucide-react';
import { toast } from 'sonner';

const MLPage = () => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const queryClient = useQueryClient();

  // Dados simulados para modelos de ML
  const mockModels = [
    {
      id: 1,
      name: 'Classificador de Sentimentos',
      type: 'classification',
      status: 'trained',
      accuracy: 0.92,
      lastTrained: '2024-01-15T10:30:00Z',
      description: 'Modelo para análise de sentimentos em textos'
    },
    {
      id: 2,
      name: 'Preditor de Vendas',
      type: 'regression',
      status: 'training',
      accuracy: 0.87,
      lastTrained: '2024-01-14T15:45:00Z',
      description: 'Modelo para previsão de vendas baseado em dados históricos'
    },
    {
      id: 3,
      name: 'Detector de Anomalias',
      type: 'anomaly_detection',
      status: 'draft',
      accuracy: null,
      lastTrained: null,
      description: 'Modelo para detecção de anomalias em dados de sistema'
    }
  ];

  // Dados simulados para datasets
  const mockDatasets = [
    {
      id: 1,
      name: 'Dataset de Reviews',
      size: '2.5 MB',
      rows: 10000,
      columns: 5,
      lastUpdated: '2024-01-15T08:00:00Z'
    },
    {
      id: 2,
      name: 'Dados de Vendas Históricas',
      size: '15.2 MB',
      rows: 50000,
      columns: 12,
      lastUpdated: '2024-01-14T16:30:00Z'
    },
    {
      id: 3,
      name: 'Logs do Sistema',
      size: '8.7 MB',
      rows: 25000,
      columns: 8,
      lastUpdated: '2024-01-15T12:15:00Z'
    }
  ];

  // Query para buscar modelos
  const { data: models, isLoading: modelsLoading } = useQuery(({ queryKey: ['ml-models'],
    queryFn: async ( }) => {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockModels;
    }
  });

  // Query para buscar datasets
  const { data: datasets, isLoading: datasetsLoading } = useQuery(({ queryKey: ['ml-datasets'],
    queryFn: async ( }) => {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockDatasets;
    }
  });

  // Mutation para treinar modelo
  const trainModelMutation = useMutation(({ mutationFn: async (modelId }) => {
      setIsTraining(true);
      setTrainingProgress(0);
      
      // Simular progresso de treinamento
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setTrainingProgress(i);
      }
      
      setIsTraining(false);
      return { success: true, modelId };
    },
    onSuccess: () => {
      toast.success('Modelo treinado com sucesso!');
      queryClient.invalidateQueries(['ml-models']);
    },
    onError: () => {
      toast.error('Erro ao treinar modelo');
      setIsTraining(false);
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'trained': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'trained': return 'Treinado';
      case 'training': return 'Treinando';
      case 'draft': return 'Rascunho';
      default: return 'Desconhecido';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (modelsLoading || datasetsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Machine Learning</h1>
          <p className="text-muted-foreground">
            Gerencie modelos de ML, treine algoritmos e visualize resultados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar Modelo
          </Button>
          <Button>
            <Brain className="h-4 w-4 mr-2" />
            Novo Modelo
          </Button>
        </div>
      </div>

      {/* Progress de treinamento */}
      {isTraining && (
        <Alert>
          <Brain className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Treinando modelo...</span>
                <span>{trainingProgress}%</span>
              </div>
              <Progress value={trainingProgress} className="w-full" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">Modelos</TabsTrigger>
          <TabsTrigger value="datasets">Datasets</TabsTrigger>
          <TabsTrigger value="experiments">Experimentos</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        {/* Aba de Modelos */}
        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            ({ models?.map((model }) => (
              <Card key={model.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick=({ ( }) => setSelectedModel(model)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <Badge className={getStatusColor(model.status)}>
                      {getStatusText(model.status)}
                    </Badge>
                  </div>
                  <CardDescription>{model.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="capitalize">{model.type.replace('_', ' ')}</span>
                    </div>
                    {model.accuracy && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Precisão:</span>
                        <span>{(model.accuracy * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Último treino:</span>
                      <span>{formatDate(model.lastTrained)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {model.status === 'trained' && (
                      <Button size="sm" variant="outline" className="flex-1">
                        <Play className="h-3 w-3 mr-1" />

                    )}
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick=({ (e }) => {
                        e.stopPropagation();
                        trainModelMutation.mutate(model.id);
                      }}
                      disabled={isTraining}
                    >
                      <Brain className="h-3 w-3 mr-1" />

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Aba de Datasets */}
        <TabsContent value="datasets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            ({ datasets?.map((dataset }) => (
              <Card key={dataset.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{dataset.name}</CardTitle>
                  <CardDescription>
                    {dataset.rows.toLocaleString()} linhas • {dataset.columns} colunas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tamanho:</span>
                      <span>{dataset.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Atualizado:</span>
                      <span>{formatDate(dataset.lastUpdated)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <BarChart3 className="h-3 w-3 mr-1" />

                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="h-3 w-3 mr-1" />

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Aba de Experimentos */}
        <TabsContent value="experiments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Experimentos de ML</CardTitle>
              <CardDescription>
                Gerencie e compare diferentes experimentos de machine learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum experimento encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Crie seu primeiro experimento para começar a treinar modelos
                </p>
                <Button>
                  <Brain className="h-4 w-4 mr-2" />
                  Criar Experimento
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Monitoramento */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance dos Modelos</CardTitle>
                <CardDescription>
                  Monitore a performance dos modelos em produção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Classificador de Sentimentos</span>
                    <Badge className="bg-green-100 text-green-800">92% precisão</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Preditor de Vendas</span>
                    <Badge className="bg-yellow-100 text-yellow-800">87% precisão</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Detector de Anomalias</span>
                    <Badge className="bg-gray-100 text-gray-800">Não treinado</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uso de Recursos</CardTitle>
                <CardDescription>
                  Monitore o uso de CPU e memória dos modelos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memória</span>
                      <span>62%</span>
                    </div>
                    <Progress value={62} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>GPU</span>
                      <span>23%</span>
                    </div>
                    <Progress value={23} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MLPage;