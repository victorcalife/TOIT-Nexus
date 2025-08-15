/**
 * QUANTUM WORKFLOW OPTIMIZER - TOIT NEXUS
 * Componente para otimização quântica de workflows
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Progress, 
  Timeline, 
  Statistic, 
  Row, 
  Col, 
  Alert, 
  Badge,
  Tooltip,
  Spin,
  Divider
} from 'antd';
import { 
  ThunderboltOutlined, 
  BranchesOutlined, 
  ClockCircleOutlined,
  RocketOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import useQuantumSystem from '../../hooks/useQuantumSystem';
import './QuantumWorkflowOptimizer.css';

const QuantumWorkflowOptimizer = ({ workflowData, onOptimizationComplete }) => {
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationHistory, setOptimizationHistory] = useState([]);
  
  const { 
    optimizeWorkflow, 
    loading, 
    error, 
    quantumStatus,
    systemHealth 
  } = useQuantumSystem();

  // Otimizar workflow com algoritmos quânticos
  const handleOptimizeWorkflow = async () => {
    if (!workflowData || !workflowData.tasks) {
      return;
    }

    setIsOptimizing(true);
    try {
      const constraints = {
        maxExecutionTime: workflowData.maxExecutionTime || 3600,
        resourceLimits: workflowData.resourceLimits || {},
        priorityWeights: workflowData.priorityWeights || { time: 0.4, cost: 0.3, quality: 0.3 }
      };

      const result = await optimizeWorkflow(workflowData, constraints);
      
      setOptimizationResult(result);
      
      // Adicionar ao histórico
      const historyEntry = {
        timestamp: new Date().toISOString(),
        algorithm: 'QAOA',
        speedup: result.quantumAdvantage?.speedup || 1,
        confidence: result.confidence || 0.95,
        tasksOptimized: workflowData.tasks.length
      };
      
      setOptimizationHistory(prev => [historyEntry, ...prev.slice(0, 4)]);
      
      if (onOptimizationComplete) {
        onOptimizationComplete(result);
      }
      
    } catch (err) {
      console.error('Workflow optimization error:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Renderizar sequência otimizada
  const renderOptimizedSequence = () => {
    if (!optimizationResult?.optimizedSequence) return null;

    return (
      <Card title="🔬 Sequência Otimizada" className="quantum-optimization-card">
        <Timeline>
          {optimizationResult.optimizedSequence.map((task, index) => (
            <Timeline.Item
              key={task.id || index}
              dot={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              color="green"
            >
              <div className="timeline-task">
                <h4>{task.name || task.title || `Tarefa ${index + 1}`}</h4>
                <p>
                  <ClockCircleOutlined /> Duração: {task.estimatedDuration || task.duration || 'N/A'}min
                  {task.priority && (
                    <Badge 
                      count={task.priority} 
                      style={{ backgroundColor: '#1890ff', marginLeft: 8 }} 
                    />
                  )}
                </p>
                {task.quantumOptimization && (
                  <div className="quantum-optimization-info">
                    <Badge status="processing" text="Otimizado Quanticamente" />
                    <span className="optimization-benefit">
                      Melhoria: {Math.round((task.quantumOptimization.improvement || 0) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    );
  };

  // Renderizar métricas de otimização
  const renderOptimizationMetrics = () => {
    if (!optimizationResult) return null;

    const { quantumAdvantage, confidence, predictedExecutionTime } = optimizationResult;

    return (
      <Card title="📊 Métricas de Otimização" className="quantum-metrics-card">
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Speedup Quântico"
              value={quantumAdvantage?.speedup || 1}
              precision={2}
              suffix="x"
              valueStyle={{ color: '#3f8600' }}
              prefix={<RocketOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Confiança"
              value={Math.round((confidence || 0.95) * 100)}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
              prefix={<ExperimentOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Tempo Previsto"
              value={predictedExecutionTime || 0}
              suffix="min"
              valueStyle={{ color: '#722ed1' }}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
        </Row>

        <Divider />

        <div className="quantum-advantages">
          <h4>🌟 Vantagens Quânticas Identificadas:</h4>
          {optimizationResult.quantumEnhancements?.parallelExecution && (
            <div className="advantage-item">
              <BranchesOutlined style={{ color: '#52c41a' }} />
              <span>Execução Paralela Otimizada</span>
              <Badge 
                count={optimizationResult.quantumEnhancements.parallelExecution.length} 
                style={{ backgroundColor: '#52c41a' }} 
              />
            </div>
          )}
          
          {optimizationResult.quantumEnhancements?.resourceOptimization && (
            <div className="advantage-item">
              <ThunderboltOutlined style={{ color: '#1890ff' }} />
              <span>Otimização de Recursos</span>
              <span className="efficiency-gain">
                +{Math.round((optimizationResult.quantumEnhancements.resourceOptimization.efficiency || 0) * 100)}%
              </span>
            </div>
          )}
          
          {optimizationResult.quantumEnhancements?.predictiveScheduling && (
            <div className="advantage-item">
              <ClockCircleOutlined style={{ color: '#722ed1' }} />
              <span>Agendamento Preditivo</span>
              <span className="prediction-accuracy">
                {Math.round((optimizationResult.quantumEnhancements.predictiveScheduling.accuracy || 0) * 100)}% precisão
              </span>
            </div>
          )}
        </div>
      </Card>
    );
  };

  // Renderizar dependências quânticas
  const renderQuantumDependencies = () => {
    if (!optimizationResult?.dependencies?.entangledPairs) return null;

    return (
      <Card title="🔗 Dependências Quânticas" className="quantum-dependencies-card">
        <div className="entangled-pairs">
          {optimizationResult.dependencies.entangledPairs.map((pair, index) => (
            <div key={index} className="entangled-pair">
              <div className="pair-connection">
                <span className="task-node">{pair.task1}</span>
                <div className="entanglement-line">
                  <div className="entanglement-strength">
                    {Math.round(pair.strength * 100)}%
                  </div>
                </div>
                <span className="task-node">{pair.task2}</span>
              </div>
              <Badge 
                status={pair.type === 'dependency' ? 'processing' : 'success'} 
                text={pair.type}
              />
            </div>
          ))}
        </div>
        
        {optimizationResult.dependencies.criticalPath && (
          <div className="critical-path">
            <h4>🎯 Caminho Crítico Quântico:</h4>
            <div className="critical-path-tasks">
              {optimizationResult.dependencies.criticalPath.map((taskId, index) => (
                <Badge 
                  key={taskId} 
                  count={index + 1} 
                  style={{ backgroundColor: '#ff4d4f' }}
                >
                  <span className="critical-task">{taskId}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  // Renderizar histórico de otimizações
  const renderOptimizationHistory = () => {
    if (optimizationHistory.length === 0) return null;

    return (
      <Card title="📈 Histórico de Otimizações" className="optimization-history-card">
        <Timeline size="small">
          {optimizationHistory.map((entry, index) => (
            <Timeline.Item
              key={index}
              dot={<ExperimentOutlined style={{ color: '#1890ff' }} />}
            >
              <div className="history-entry">
                <div className="entry-header">
                  <span className="entry-time">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <Badge status="success" text={entry.algorithm} />
                </div>
                <div className="entry-metrics">
                  <span>Speedup: {entry.speedup.toFixed(2)}x</span>
                  <span>Confiança: {Math.round(entry.confidence * 100)}%</span>
                  <span>Tarefas: {entry.tasksOptimized}</span>
                </div>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    );
  };

  // Renderizar status do sistema
  const renderSystemStatus = () => {
    if (!quantumStatus) return null;

    const coherencePercent = Math.round(quantumStatus.systemCoherence * 100);
    
    return (
      <Card title="⚛️ Status do Sistema Quântico" size="small" className="system-status-card">
        <Row gutter={8}>
          <Col span={12}>
            <div className="status-item">
              <span>Coerência:</span>
              <Progress 
                percent={coherencePercent} 
                size="small" 
                status={coherencePercent > 80 ? 'success' : 'active'}
              />
            </div>
          </Col>
          <Col span={12}>
            <div className="status-item">
              <span>Entrelaçamento:</span>
              <Progress 
                percent={Math.round(quantumStatus.networkEntanglement * 100)} 
                size="small" 
                strokeColor="#1890ff"
              />
            </div>
          </Col>
        </Row>
        
        {systemHealth && systemHealth.status !== 'excellent' && (
          <Alert
            message="Sistema Quântico"
            description={`Status: ${systemHealth.status} - Considere otimização`}
            type="warning"
            size="small"
            showIcon
            style={{ marginTop: 8 }}
          />
        )}
      </Card>
    );
  };

  return (
    <div className="quantum-workflow-optimizer">
      <div className="optimizer-header">
        <h2>
          <ExperimentOutlined /> Otimizador Quântico de Workflows
        </h2>
        <div className="optimizer-controls">
          <Tooltip title="Otimizar usando algoritmos quânticos QAOA">
            <Button
              type="primary"
              icon={isOptimizing ? <SyncOutlined spin /> : <ThunderboltOutlined />}
              onClick={handleOptimizeWorkflow}
              loading={loading || isOptimizing}
              disabled={!workflowData?.tasks || workflowData.tasks.length === 0}
            >
              {isOptimizing ? 'Otimizando...' : 'Otimizar Workflow'}
            </Button>
          </Tooltip>
        </div>
      </div>

      {error && (
        <Alert
          message="Erro na Otimização Quântica"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          {isOptimizing && (
            <Card className="optimization-progress-card">
              <div className="optimization-progress">
                <Spin size="large" />
                <h3>Processando com Algoritmos Quânticos...</h3>
                <p>Aplicando QAOA para otimização combinatória</p>
                <Progress percent={75} status="active" />
              </div>
            </Card>
          )}
          
          {renderOptimizedSequence()}
          {renderOptimizationMetrics()}
          {renderQuantumDependencies()}
        </Col>
        
        <Col xs={24} lg={8}>
          {renderSystemStatus()}
          {renderOptimizationHistory()}
          
          {optimizationResult?.recommendations && (
            <Card title="💡 Recomendações" size="small">
              {optimizationResult.recommendations.map((rec, index) => (
                <Alert
                  key={index}
                  message={rec.message}
                  type={rec.impact === 'high' ? 'warning' : 'info'}
                  size="small"
                  showIcon
                  style={{ marginBottom: 8 }}
                />
              ))}
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default QuantumWorkflowOptimizer;
