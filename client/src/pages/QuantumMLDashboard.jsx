/**
 * PÁGINA QUANTUM ML DASHBOARD
 * Página principal para gerenciar sistema ML
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useMLCredits } from '../hooks/useMLCredits';
import { MLCreditsWidget } from '../components/ml/MLCreditsWidget';
import { QuantumInsightButton } from '../components/ml/QuantumInsightButton';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  BarChart3, 
  Calendar,
  Settings,
  History,
  Plus,
  Play,
  Pause,
  Trash2,
  Eye
} from 'lucide-react';

/**
 * Dashboard principal do Quantum ML
 * @returns {React.ReactElement} Página do dashboard
 */
export function QuantumMLDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [usageHistory, setUsageHistory] = useState([]);
  const [usageStats, setUsageStats] = useState([]);
  const [autoPredictions, setAutoPredictions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);

  const {
    credits,
    isLoading,
    needsSetup,
    getUsageHistory,
    getUsageStats
  } = useMLCredits();

  /**
   * Carregar histórico de uso
   */
  const loadUsageHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const history = await getUsageHistory({ limit: 20 });
      setUsageHistory(history);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [getUsageHistory]);

  /**
   * Carregar estatísticas de uso
   */
  const loadUsageStats = useCallback(async () => {
    try {
      const stats = await getUsageStats('month');
      setUsageStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, [getUsageStats]);

  /**
   * Carregar predições automáticas
   */
  const loadAutoPredictions = useCallback(async () => {
    setIsLoadingPredictions(true);
    try {
      const baseURL = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${baseURL}/api/auto-predictions`, {
        headers: {
          'X-Tenant-ID': 'default' // TODO: Pegar do contexto
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAutoPredictions(result.data.predictions);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar predições automáticas:', error);
    } finally {
      setIsLoadingPredictions(false);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    if (!needsSetup) {
      loadUsageHistory();
      loadUsageStats();
      loadAutoPredictions();
    }
  }, [needsSetup, loadUsageHistory, loadUsageStats, loadAutoPredictions]);

  /**
   * Renderizar overview
   */
  const renderOverview = useCallback(() => {
    // Dados de exemplo para demonstração
    const sampleData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 1000) + 500
    }));

    return (
      <div className="space-y-6">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Insights Executados</p>
                <p className="text-2xl font-bold text-gray-900">{credits.used}</p>
              </div>
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Créditos Restantes</p>
                <p className="text-2xl font-bold text-gray-900">{credits.available}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Predições Ativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {autoPredictions.filter(p => p.is_active).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-gray-900">98%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Seção de insights rápidos */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Insights Rápidos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Predição de Vendas</h4>
              <p className="text-sm text-gray-600 mb-3">
                Analise tendências e preveja vendas futuras
              </p>
              <QuantumInsightButton
                data={sampleData}
                insightType="prediction"
                variant="secondary"
                size="sm"
                onSuccess={(result) => {
                  console.log('Predição executada:', result);
                  loadUsageHistory();
                }}
              >
                Executar Predição
              </QuantumInsightButton>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Otimização</h4>
              <p className="text-sm text-gray-600 mb-3">
                Identifique oportunidades de melhoria
              </p>
              <QuantumInsightButton
                data={sampleData}
                insightType="optimization"
                variant="secondary"
                size="sm"
                onSuccess={(result) => {
                  console.log('Otimização executada:', result);
                  loadUsageHistory();
                }}
              >
                Otimizar
              </QuantumInsightButton>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Detecção de Anomalias</h4>
              <p className="text-sm text-gray-600 mb-3">
                Encontre padrões anômalos nos dados
              </p>
              <QuantumInsightButton
                data={sampleData}
                insightType="anomaly"
                variant="secondary"
                size="sm"
                onSuccess={(result) => {
                  console.log('Detecção executada:', result);
                  loadUsageHistory();
                }}
              >
                Detectar Anomalias
              </QuantumInsightButton>
            </div>
          </div>
        </div>

        {/* Widget de créditos */}
        <MLCreditsWidget 
          variant="card"
          showDetails={true}
          showActions={true}
        />
      </div>
    );
  }, [credits, autoPredictions, loadUsageHistory]);

  /**
   * Renderizar histórico
   */
  const renderHistory = useCallback(() => {
    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Histórico de Uso
            </h3>
            <button
              onClick={loadUsageHistory}
              disabled={isLoadingHistory}
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoadingHistory ? 'Carregando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoadingHistory ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Carregando histórico...</p>
            </div>
          ) : usageHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum uso registrado ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {usageHistory.map((usage, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      usage.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {usage.usage_type === 'manual_insight' ? <Brain className="w-4 h-4" /> :
                       usage.usage_type === 'auto_prediction' ? <Calendar className="w-4 h-4" /> :
                       <Zap className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {usage.insight_type || usage.usage_type}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(usage.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {usage.credits_consumed} crédito{usage.credits_consumed !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-gray-500">
                      {usage.processing_time_ms}ms
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }, [usageHistory, isLoadingHistory, loadUsageHistory]);

  /**
   * Renderizar predições automáticas
   */
  const renderAutoPredictions = useCallback(() => {
    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Predições Automáticas
            </h3>
            <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700">
              <Plus className="w-4 h-4 inline mr-2" />
              Nova Predição
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoadingPredictions ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Carregando predições...</p>
            </div>
          ) : autoPredictions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Nenhuma predição automática configurada</p>
              <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700">
                Criar Primeira Predição
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {autoPredictions.map((prediction) => (
                <div key={prediction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      prediction.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {prediction.prediction_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {prediction.prediction_type} • {prediction.schedule_frequency}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      prediction.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {prediction.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      {prediction.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }, [autoPredictions, isLoadingPredictions]);

  // Se precisa de configuração, mostrar tela de setup
  if (needsSetup) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quantum ML Dashboard
            </h1>
            <p className="text-gray-600 mb-8">
              Configure seu plano ML para começar a usar insights avançados
            </p>
            
            <div className="max-w-md mx-auto">
              <MLCreditsWidget 
                variant="card"
                showDetails={false}
                showActions={true}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quantum ML Dashboard
              </h1>
              <p className="text-gray-600">
                Gerencie seus insights e predições de Machine Learning
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <MLCreditsWidget variant="compact" />
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
                { id: 'history', label: 'Histórico', icon: History },
                { id: 'predictions', label: 'Predições Automáticas', icon: Calendar },
                { id: 'settings', label: 'Configurações', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'predictions' && renderAutoPredictions()}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Configurações ML
            </h3>
            <p className="text-gray-600">
              Configurações avançadas em desenvolvimento...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuantumMLDashboard;
