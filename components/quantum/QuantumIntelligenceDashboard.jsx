/**
 * QUANTUM INTELLIGENCE DASHBOARD - TOIT NEXUS 3.0
 * Dashboard avançado com inteligência quântica e aprendizado adaptativo
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter
} from 'recharts';
import './QuantumIntelligenceDashboard.css';

const QuantumIntelligenceDashboard = ({ tenantId, onQuantumInsight }) => {
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [quantumMetrics, setQuantumMetrics] = useState(null);
  const [learningEvolution, setLearningEvolution] = useState([]);
  const [quantumCorrelations, setQuantumCorrelations] = useState([]);
  const [behaviorPatterns, setBehaviorPatterns] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantumProcessing, setQuantumProcessing] = useState(false);

  // Carregar dados da inteligência
  const loadIntelligenceData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Carregar métricas de inteligência
      const intelligenceResponse = await fetch(`/api/quantum/intelligence/${tenantId}`);
      const intelligence = await intelligenceResponse.json();
      setIntelligenceData(intelligence);

      // Carregar métricas quânticas
      const quantumResponse = await fetch(`/api/quantum/metrics/${tenantId}`);
      const quantum = await quantumResponse.json();
      setQuantumMetrics(quantum);

      // Carregar evolução do aprendizado
      const evolutionResponse = await fetch(`/api/quantum/evolution/${tenantId}`);
      const evolution = await evolutionResponse.json();
      setLearningEvolution(evolution);

      // Carregar correlações quânticas
      const correlationsResponse = await fetch(`/api/quantum/correlations/${tenantId}`);
      const correlations = await correlationsResponse.json();
      setQuantumCorrelations(correlations);

      // Carregar padrões de comportamento
      const patternsResponse = await fetch(`/api/quantum/patterns/${tenantId}`);
      const patterns = await patternsResponse.json();
      setBehaviorPatterns(patterns);

      // Carregar predições
      const predictionsResponse = await fetch(`/api/quantum/predictions/${tenantId}`);
      const predictionsData = await predictionsResponse.json();
      setPredictions(predictionsData);

    } catch (error) {
      console.error('Erro ao carregar dados de inteligência:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  // Executar análise quântica
  const executeQuantumAnalysis = async () => {
    try {
      setQuantumProcessing(true);
      
      const response = await fetch(`/api/quantum/analyze/${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          includeCorrelations: true,
          includePredictions: true,
          quantumAlgorithms: ['qaoa', 'grover', 'sqd']
        })
      });

      const analysis = await response.json();
      
      if (onQuantumInsight) {
        onQuantumInsight(analysis);
      }

      // Recarregar dados após análise
      await loadIntelligenceData();

    } catch (error) {
      console.error('Erro na análise quântica:', error);
    } finally {
      setQuantumProcessing(false);
    }
  };

  useEffect(() => {
    loadIntelligenceData();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadIntelligenceData, 30000);
    return () => clearInterval(interval);
  }, [loadIntelligenceData]);

  if (loading) {
    return (
      <div className="quantum-dashboard-loading">
        <div className="quantum-spinner">
          <div className="quantum-particle"></div>
          <div className="quantum-particle"></div>
          <div className="quantum-particle"></div>
        </div>
        <p>Inicializando Inteligência Quântica...</p>
      </div>
    );
  }

  return (
    <div className="quantum-intelligence-dashboard">
      {/* Header com métricas principais */}
      <div className="quantum-header">
        <div className="quantum-title">
          <h1>🧠 Quantum Intelligence Dashboard</h1>
          <div className="quantum-status">
            <span className={`status-indicator ${intelligenceData?.status || 'active'}`}>
              ⚛️ Quantum Active
            </span>
          </div>
        </div>
        
        <button 
          className="quantum-analyze-btn"
          onClick={executeQuantumAnalysis}
          disabled={quantumProcessing}
        >
          {quantumProcessing ? (
            <>⏳ Processando Quantum...</>
          ) : (
            <>🔬 Executar Análise Quântica</>
          )}
        </button>
      </div>

      {/* Métricas de Inteligência */}
      <div className="intelligence-metrics">
        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <h3>Precisão</h3>
            <div className="metric-value">
              {(intelligenceData?.accuracy * 100 || 0).toFixed(1)}%
            </div>
            <div className="metric-trend">
              +{(intelligenceData?.accuracyGrowth * 100 || 0).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🔄</div>
          <div className="metric-content">
            <h3>Adaptabilidade</h3>
            <div className="metric-value">
              {(intelligenceData?.adaptability * 100 || 0).toFixed(1)}%
            </div>
            <div className="metric-trend">
              +{(intelligenceData?.adaptabilityGrowth * 100 || 0).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🔮</div>
          <div className="metric-content">
            <h3>Poder Preditivo</h3>
            <div className="metric-value">
              {(intelligenceData?.predictionPower * 100 || 0).toFixed(1)}%
            </div>
            <div className="metric-trend">
              +{(intelligenceData?.predictionGrowth * 100 || 0).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⚡</div>
          <div className="metric-content">
            <h3>Velocidade de Aprendizado</h3>
            <div className="metric-value">
              {(intelligenceData?.learningSpeed * 100 || 0).toFixed(1)}%
            </div>
            <div className="metric-trend">
              +{(intelligenceData?.learningSpeedGrowth * 100 || 0).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="metric-card quantum-efficiency">
          <div className="metric-icon">⚛️</div>
          <div className="metric-content">
            <h3>Eficiência Quântica</h3>
            <div className="metric-value">
              {(intelligenceData?.quantumEfficiency * 100 || 0).toFixed(1)}%
            </div>
            <div className="metric-trend">
              +{(intelligenceData?.quantumGrowth * 100 || 0).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos de Evolução */}
      <div className="dashboard-charts">
        {/* Evolução da Inteligência */}
        <div className="chart-container">
          <h3>📈 Evolução da Inteligência</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={learningEvolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="overallIntelligence" 
                stackId="1" 
                stroke="#8884d8" 
                fill="#8884d8" 
                name="Inteligência Geral"
              />
              <Area 
                type="monotone" 
                dataKey="quantumEfficiency" 
                stackId="2" 
                stroke="#82ca9d" 
                fill="#82ca9d" 
                name="Eficiência Quântica"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radar de Capacidades */}
        <div className="chart-container">
          <h3>🎯 Radar de Capacidades</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={[intelligenceData]}>
              <PolarGrid />
              <PolarAngleAxis dataKey="capability" />
              <PolarRadiusAxis angle={90} domain={[0, 1]} />
              <Radar
                name="Capacidades"
                dataKey="accuracy"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Radar
                name="Quantum"
                dataKey="quantumEfficiency"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.6}
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Correlações Quânticas */}
        <div className="chart-container">
          <h3>🔗 Correlações Quânticas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={quantumCorrelations}>
              <CartesianGrid />
              <XAxis dataKey="x" name="Entidade A" />
              <YAxis dataKey="y" name="Entidade B" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter 
                name="Correlações" 
                data={quantumCorrelations} 
                fill="#8884d8"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Padrões de Comportamento */}
        <div className="chart-container">
          <h3>🧩 Padrões Descobertos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={behaviorPatterns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="pattern" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="frequency" fill="#8884d8" name="Frequência" />
              <Bar dataKey="confidence" fill="#82ca9d" name="Confiança" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Predições Inteligentes */}
      <div className="predictions-section">
        <h3>🔮 Predições Inteligentes</h3>
        <div className="predictions-grid">
          {predictions.slice(0, 6).map((prediction, index) => (
            <div key={index} className={`prediction-card ${prediction.quantumOrigin ? 'quantum' : 'classical'}`}>
              <div className="prediction-header">
                <span className="prediction-type">
                  {prediction.quantumOrigin ? '⚛️' : '🧠'} {prediction.type}
                </span>
                <span className="prediction-confidence">
                  {(prediction.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="prediction-content">
                <p>{prediction.description}</p>
                {prediction.impact && (
                  <div className="prediction-impact">
                    Impacto: <strong>{prediction.impact}</strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Métricas Quânticas Detalhadas */}
      {quantumMetrics && (
        <div className="quantum-metrics-detail">
          <h3>⚛️ Métricas Quânticas Detalhadas</h3>
          <div className="quantum-stats">
            <div className="quantum-stat">
              <label>Algoritmos Ativos:</label>
              <span>{quantumMetrics.activeAlgorithms?.join(', ') || 'Nenhum'}</span>
            </div>
            <div className="quantum-stat">
              <label>Operações Quânticas:</label>
              <span>{quantumMetrics.quantumOperations || 0}</span>
            </div>
            <div className="quantum-stat">
              <label>Cache Quântico:</label>
              <span>{quantumMetrics.cacheHitRate || 0}% hit rate</span>
            </div>
            <div className="quantum-stat">
              <label>Emaranhamento Ativo:</label>
              <span>{quantumMetrics.entanglementActive ? 'Sim' : 'Não'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantumIntelligenceDashboard;
