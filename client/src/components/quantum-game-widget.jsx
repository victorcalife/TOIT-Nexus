import React, { useState, useEffect, useRef } from 'react';

const QuantumGameWidget = () => {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [gameState, setGameState] = useState({
    strategy: null,
    processing: false,
    timeElapsed: 0,
    totalCost: 0,
    savings: 0,
    progress: 0,
    timer: null
  });

  const particlesRef = useRef(null);

  // Criar partículas de fundo
  useEffect(() => {
    if (particlesRef.current) {
      const particlesContainer = particlesRef.current;
      particlesContainer.innerHTML = '';
      
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'quantum-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (8 + Math.random() * 5) + 's';
        particlesContainer.appendChild(particle);
      }
    }
  }, []);

  const nextScreen = () => {
    if (currentScreen < 6) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const goToScreen = (screenNumber) => {
    setCurrentScreen(screenNumber);
  };

  const selectStrategy = (strategy) => {
    setGameState(prev => ({ ...prev, strategy }));
  };

  const startProcessing = () => {
    if (!gameState.strategy) {
      alert('Selecione uma estratégia primeiro!');
      return;
    }
    
    if (gameState.processing) return;
    
    setGameState(prev => ({ ...prev, processing: true, timeElapsed: 0, progress: 0 }));
    
    let duration = 1000;
    let finalCost = 0;
    
    if (gameState.strategy === 'individual') {
      duration = 5000;
      finalCost = 1600.00;
    } else if (gameState.strategy === 'batch') {
      duration = 1000;
      finalCost = 1.60;
    } else if (gameState.strategy === 'collab') {
      duration = 1000;
      finalCost = 0.16;
    }
    
    const individualCost = 1600.00;
    const savings = individualCost - finalCost;
    
    const updateInterval = 100;
    const steps = duration / updateInterval;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const progress = (currentStep / steps) * 100;
      const timeElapsed = (currentStep * updateInterval) / 1000;
      
      let totalCost = finalCost;
      if (gameState.strategy === 'individual') {
        totalCost = (progress / 100) * finalCost;
      }
      
      setGameState(prev => ({
        ...prev,
        progress,
        timeElapsed,
        totalCost,
        savings
      }));
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setGameState(prev => ({ ...prev, processing: false }));
        setTimeout(() => setCurrentScreen(6), 1000);
      }
    }, updateInterval);
  };

  const restart = () => {
    setGameState({
      strategy: null,
      processing: false,
      timeElapsed: 0,
      totalCost: 0,
      savings: 0,
      progress: 0,
      timer: null
    });
    setCurrentScreen(1);
  };

  return (
    <div className="quantum-game-container">
      <style jsx>{`
        .quantum-game-container {
          width: 100%;
          height: 100%;
          background: rgba(10, 15, 28, 0.95);
          border-radius: 15px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(0, 255, 255, 0.2);
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.1);
        }

        .quantum-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .quantum-particle {
          position: absolute;
          width: 1px;
          height: 1px;
          background: #00ffff;
          border-radius: 50%;
          opacity: 0.3;
          animation: quantumFloat 15s infinite linear;
        }

        @keyframes quantumFloat {
          from {
            transform: translateY(100%) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          to {
            transform: translateY(-100%) translateX(50px);
            opacity: 0;
          }
        }

        .game-screen {
          position: absolute;
          width: 100%;
          height: 100%;
          padding: 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0;
          transform: translateX(100%);
          transition: all 0.4s ease;
          overflow-y: auto;
          z-index: 10;
        }

        .game-screen.active {
          opacity: 1;
          transform: translateX(0);
        }

        .game-screen::-webkit-scrollbar {
          width: 4px;
        }

        .game-screen::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .game-screen::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 255, 0.3);
          border-radius: 2px;
        }

        .game-logo {
          font-size: 1.5em;
          font-weight: 900;
          background: linear-gradient(135deg, #00ffff, #0080ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-align: center;
          margin-bottom: 10px;
        }

        .game-title {
          font-size: 1.1em;
          color: #00ffff;
          text-align: center;
          margin-bottom: 10px;
        }

        .game-card {
          background: rgba(0, 40, 80, 0.3);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 8px;
          padding: 12px;
          margin: 8px 0;
          width: 100%;
          font-size: 0.85em;
          line-height: 1.4;
        }

        .game-btn {
          padding: 8px 20px;
          background: linear-gradient(135deg, #0080ff, #00ffff);
          border: none;
          border-radius: 15px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 8px;
          font-size: 0.9em;
        }

        .game-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 255, 255, 0.4);
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          width: 100%;
          margin: 10px 0;
        }

        .code-block {
          background: rgba(0, 0, 0, 0.5);
          border-radius: 6px;
          padding: 8px;
          font-family: monospace;
          font-size: 0.7em;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .code-block.bad {
          border-color: #ff4444;
          background: rgba(255, 68, 68, 0.05);
        }

        .code-block.good {
          border-color: #00ff88;
          background: rgba(0, 255, 136, 0.05);
        }

        .strategies {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin: 10px 0;
          width: 100%;
        }

        .strategy-card {
          background: rgba(0, 40, 80, 0.4);
          border: 2px solid rgba(0, 255, 255, 0.2);
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          font-size: 0.8em;
        }

        .strategy-card:hover {
          transform: translateY(-2px);
          border-color: #00ffff;
        }

        .strategy-card.active {
          background: rgba(0, 255, 255, 0.1);
          border-color: #00ff88;
          box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
        }

        .strategy-icon {
          font-size: 1.5em;
          margin-bottom: 5px;
        }

        .strategy-name {
          font-weight: bold;
          color: #00ffff;
          margin-bottom: 3px;
        }

        .strategy-cost {
          font-size: 0.8em;
          opacity: 0.8;
        }

        .game-area {
          width: 100%;
          background: rgba(0, 20, 40, 0.5);
          border: 2px solid rgba(0, 255, 255, 0.3);
          border-radius: 10px;
          padding: 10px;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .game-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(0, 255, 255, 0.2);
          font-size: 0.8em;
        }

        .game-stats {
          display: flex;
          gap: 15px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-label {
          font-size: 0.7em;
          opacity: 0.7;
          margin-bottom: 3px;
        }

        .stat-value {
          font-size: 1em;
          font-weight: bold;
          color: #00ffff;
        }

        .progress-bar {
          width: 100%;
          height: 20px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          margin: 8px 0;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0080ff, #00ffff);
          transition: width 0.5s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 0.8em;
        }

        .navigation {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          z-index: 100;
        }

        .nav-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-dot.active {
          background: #00ffff;
          transform: scale(1.3);
          box-shadow: 0 0 6px #00ffff;
        }

        @media (max-width: 768px) {
          .comparison-grid {
            grid-template-columns: 1fr;
          }
          
          .strategies {
            grid-template-columns: 1fr;
          }
          
          .game-stats {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>

      {/* Partículas de fundo */}
      <div className="quantum-particles" ref={particlesRef}></div>

      {/* Tela 1: Introdução */}
      <div className={`game-screen ${currentScreen === 1 ? 'active' : ''}`}>
        <div className="game-logo">TOITNEXUS</div>
        <h2 className="game-title">Revolução Quântica + TQL</h2>
        
        <div className="game-card">
          <h3 style={{ textAlign: 'center', color: '#00ff88', margin: '0 0 8px 0' }}>
            🚀 Primeira Aplicação Comercial Quântica
          </h3>
          <p style={{ textAlign: 'center', margin: '8px 0', fontSize: '0.8em' }}>
            Combinamos o poder da <strong>computação quântica</strong> com a simplicidade da 
            <strong> TQL (TOIT Query Language)</strong> - uma linguagem 100% em português.
          </p>
          <p style={{ textAlign: 'center', fontSize: '0.75em', opacity: 0.8 }}>
            💡 Descubra como economizar até 99.99% em custos computacionais!
          </p>
        </div>

        <button className="game-btn" onClick={nextScreen}>
          Começar Jornada →
        </button>
      </div>

      {/* Tela 2: O que é TQL */}
      <div className={`game-screen ${currentScreen === 2 ? 'active' : ''}`}>
        <h2 className="game-title">TQL: Linguagem em Português</h2>
        
        <div className="comparison-grid">
          <div className="code-block bad">
            <h4 style={{ color: '#ff4444', margin: '0 0 5px 0', fontSize: '0.8em' }}>❌ SQL Tradicional</h4>
            <pre style={{ margin: 0, fontSize: '0.65em' }}>{`SELECT SUM(sales.value)
FROM sales
WHERE date >= '2025-01-01'
GROUP BY product_id
-- Complexo e em inglês`}</pre>
          </div>

          <div className="code-block good">
            <h4 style={{ color: '#00ff88', margin: '0 0 5px 0', fontSize: '0.8em' }}>✅ TQL em Português</h4>
            <pre style={{ margin: 0, fontSize: '0.65em' }}>{`vendas_mes = SOMAR valor 
    DE vendas ONDE data = MES(0);

MAX(10) produtos POR vendas;

# Simples e intuitivo!`}</pre>
          </div>
        </div>

        <div className="game-card">
          <h3 style={{ margin: '0 0 8px 0' }}>🎯 Vantagens da TQL:</h3>
          <ul style={{ lineHeight: 1.4, marginLeft: '15px', fontSize: '0.8em' }}>
            <li>📝 <strong>100% em português</strong></li>
            <li>⚡ <strong>10x mais simples</strong> que SQL</li>
            <li>🚀 <strong>Otimizada para quantum</strong></li>
          </ul>
        </div>

        <button className="game-btn" onClick={nextScreen}>
          Ver Quando Usar Quantum →
        </button>
      </div>

      {/* Tela 3: Quando usar Quantum */}
      <div className={`game-screen ${currentScreen === 3 ? 'active' : ''}`}>
        <h2 className="game-title">Quando TQL Ativa Modo Quântico?</h2>

        <div className="strategies">
          <div className="strategy-card">
            <div className="strategy-icon">📊</div>
            <div className="strategy-name">Pequeno</div>
            <div className="strategy-cost">&lt; 1GB</div>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.7em' }}>
              Local<br/>
              <strong style={{ color: '#00ff88' }}>R$ 0</strong>
            </p>
          </div>

          <div className="strategy-card">
            <div className="strategy-icon">☁️</div>
            <div className="strategy-name">Médio</div>
            <div className="strategy-cost">1GB-1TB</div>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.7em' }}>
              Cloud<br/>
              <strong style={{ color: '#ffaa00' }}>R$ 0.10/GB</strong>
            </p>
          </div>

          <div className="strategy-card active">
            <div className="strategy-icon">⚛️</div>
            <div className="strategy-name">Big Data</div>
            <div className="strategy-cost">&gt; 1TB</div>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.7em' }}>
              Quantum!<br/>
              <strong style={{ color: '#ff4444' }}>R$ 1.60/seg</strong>
            </p>
          </div>
        </div>

        <div className="game-card">
          <h3 style={{ margin: '0 0 8px 0' }}>⚠️ Importante sobre Quantum:</h3>
          <ul style={{ lineHeight: 1.4, marginLeft: '15px', fontSize: '0.75em' }}>
            <li>💸 <strong>Custo mínimo:</strong> R$ 1.60/segundo</li>
            <li>📊 <strong>Só compensa:</strong> Big Data, ML complexo</li>
            <li>🎯 <strong>TQL otimiza automaticamente</strong></li>
          </ul>
        </div>

        <button className="game-btn" onClick={nextScreen}>
          Jogar Simulação →
        </button>
      </div>

      {/* Tela 4: Game Interativo */}
      <div className={`game-screen ${currentScreen === 4 ? 'active' : ''}`}>
        <h2 className="game-title">Simulador de Economia Quântica</h2>

        <div className="game-area">
          <div className="game-header">
            <div>
              <h3 style={{ margin: 0, fontSize: '0.9em' }}>1.000 Consultas TQL (5TB)</h3>
              <p style={{ fontSize: '0.7em', opacity: 0.7, margin: '2px 0 0 0' }}>
                Cada consulta analisa 5TB
              </p>
            </div>
            <div className="game-stats">
              <div className="stat">
                <span className="stat-label">Tempo</span>
                <span className="stat-value">{gameState.timeElapsed.toFixed(1)}s</span>
              </div>
              <div className="stat">
                <span className="stat-label">Custo</span>
                <span className="stat-value">R$ {gameState.totalCost.toFixed(2)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Economia</span>
                <span className="stat-value" style={{ color: '#00ff88' }}>R$ {gameState.savings.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9em' }}>Escolha sua Estratégia:</h4>
            
            <div className="strategies">
              <div 
                className={`strategy-card ${gameState.strategy === 'individual' ? 'active' : ''}`}
                onClick={() => selectStrategy('individual')}
              >
                <div className="strategy-icon">🚶</div>
                <div className="strategy-name">Individual</div>
                <div className="strategy-cost">1 query = 1 seg</div>
                <p style={{ fontSize: '0.7em', margin: '3px 0 0 0' }}>
                  R$ 1.600,00
                </p>
              </div>

              <div 
                className={`strategy-card ${gameState.strategy === 'batch' ? 'active' : ''}`}
                onClick={() => selectStrategy('batch')}
              >
                <div className="strategy-icon">📦</div>
                <div className="strategy-name">Batch TQL</div>
                <div className="strategy-cost">1000 = 1 seg</div>
                <p style={{ fontSize: '0.7em', margin: '3px 0 0 0' }}>
                  R$ 1,60
                </p>
              </div>

              <div 
                className={`strategy-card ${gameState.strategy === 'collab' ? 'active' : ''}`}
                onClick={() => selectStrategy('collab')}
              >
                <div className="strategy-icon">🤝</div>
                <div className="strategy-name">Colaborativo</div>
                <div className="strategy-cost">10 empresas</div>
                <p style={{ fontSize: '0.7em', margin: '3px 0 0 0' }}>
                  R$ 0,16
                </p>
              </div>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${gameState.progress}%` }}>
                {Math.floor(gameState.progress)}%
              </div>
            </div>

            <button 
              className="game-btn" 
              onClick={startProcessing}
              disabled={gameState.processing}
            >
              {gameState.processing ? '⏳ Processando...' : '▶️ Processar Consultas'}
            </button>
          </div>
        </div>
      </div>

      {/* Tela 5: Resultados */}
      <div className={`game-screen ${currentScreen === 5 ? 'active' : ''}`}>
        <div className="game-logo">TOITNEXUS</div>
        <h2 className="game-title">🎉 Você Domina TQL + Quantum!</h2>

        <div className="game-card">
          <h3 style={{ textAlign: 'center', color: '#00ff88', margin: '0 0 10px 0' }}>📊 Seus Resultados:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '10px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5em', color: '#00ffff' }}>{gameState.timeElapsed.toFixed(1)}s</div>
              <div style={{ fontSize: '0.7em', opacity: 0.7 }}>Tempo Total</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5em', color: '#ff4444' }}>R$ {gameState.totalCost.toFixed(2)}</div>
              <div style={{ fontSize: '0.7em', opacity: 0.7 }}>Custo Final</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5em', color: '#00ff88' }}>R$ {gameState.savings.toFixed(2)}</div>
              <div style={{ fontSize: '0.7em', opacity: 0.7 }}>Economia</div>
            </div>
          </div>
        </div>

        <div className="game-card">
          <h3 style={{ margin: '0 0 8px 0' }}>✅ O que você aprendeu:</h3>
          <ul style={{ lineHeight: 1.4, marginLeft: '15px', fontSize: '0.75em' }}>
            <li>📝 <strong>TQL:</strong> Consultas 100% em português</li>
            <li>⚡ <strong>Otimização:</strong> TQL detecta volume automaticamente</li>
            <li>💰 <strong>Economia:</strong> Batch economiza 99.9%</li>
            <li>🤝 <strong>Colaboração:</strong> Dividir custos economiza 99.99%</li>
          </ul>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button className="game-btn" onClick={restart}>
            🔄 Jogar Novamente
          </button>
        </div>
      </div>

      {/* Navegação */}
      <div className="navigation">
        {[1, 2, 3, 4, 5].map(num => (
          <div 
            key={num}
            className={`nav-dot ${currentScreen === num ? 'active' : ''}`}
            onClick={() => goToScreen(num)}
          />
        ))}
      </div>
    </div>
  );
};

export default QuantumGameWidget;
