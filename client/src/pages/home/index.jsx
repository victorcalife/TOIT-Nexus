import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';

// Componente Modal
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

// Componente principal da página inicial
const HomePage = () => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);

  // Dados dos cards do Nexus
  const nexusCards = [
    {
      id: 1,
      title: 'Login',
      description: 'Acesse sua conta no TOIT Nexus',
      icon: '🔐',
      action: () => navigate('/login'),
      isSpecial: true // Login é especial pois muda URL
    },
    {
      id: 2,
      title: 'Dashboard',
      description: 'Painel principal com métricas e KPIs',
      icon: '📊',
      content: (
        <div className="modal-dashboard">
          <h3>Dashboard Executivo</h3>
          <p>Visualize métricas em tempo real, KPIs de performance e relatórios analíticos.</p>
          <div className="feature-list">
            <div className="feature-item">📈 Métricas em Tempo Real</div>
            <div className="feature-item">📋 Relatórios Personalizados</div>
            <div className="feature-item">🎯 KPIs de Performance</div>
            <div className="feature-item">📱 Acesso Mobile</div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Quantum AI',
      description: 'Inteligência Artificial Quântica',
      icon: '🔬',
      content: (
        <div className="modal-quantum">
          <h3>Quantum AI Engine</h3>
          <p>Processamento quântico para análises avançadas e predições precisas.</p>
          <div className="feature-list">
            <div className="feature-item">⚛️ Computação Quântica</div>
            <div className="feature-item">🧠 Machine Learning Avançado</div>
            <div className="feature-item">🔮 Análise Preditiva</div>
            <div className="feature-item">🚀 Performance Otimizada</div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'TQL',
      description: 'TOIT Query Language',
      icon: '💻',
      content: (
        <div className="modal-tql">
          <h3>TOIT Query Language</h3>
          <p>Linguagem de consulta proprietária para análises complexas de dados.</p>
          <div className="feature-list">
            <div className="feature-item">🔍 Consultas Avançadas</div>
            <div className="feature-item">⚡ Performance Otimizada</div>
            <div className="feature-item">🔗 Integração Nativa</div>
            <div className="feature-item">📝 Sintaxe Intuitiva</div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: 'NoCode',
      description: 'Desenvolvimento sem código',
      icon: '🎨',
      content: (
        <div className="modal-nocode">
          <h3>Plataforma NoCode</h3>
          <p>Crie aplicações e automações sem necessidade de programação.</p>
          <div className="feature-list">
            <div className="feature-item">🎯 Interface Visual</div>
            <div className="feature-item">🔧 Automações Inteligentes</div>
            <div className="feature-item">📱 Apps Responsivos</div>
            <div className="feature-item">🔄 Integração Fácil</div>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: 'Analytics',
      description: 'Análises avançadas de dados',
      icon: '📈',
      content: (
        <div className="modal-analytics">
          <h3>Analytics Avançado</h3>
          <p>Transforme dados em insights acionáveis com nossa plataforma de analytics.</p>
          <div className="feature-list">
            <div className="feature-item">📊 Visualizações Interativas</div>
            <div className="feature-item">🔍 Data Mining</div>
            <div className="feature-item">📋 Relatórios Automáticos</div>
            <div className="feature-item">🎯 Segmentação Avançada</div>
          </div>
        </div>
      )
    },
    {
      id: 7,
      title: 'Workflows',
      description: 'Automação de processos',
      icon: '⚙️',
      content: (
        <div className="modal-workflows">
          <h3>Automação de Workflows</h3>
          <p>Automatize processos complexos com nossa engine de workflows inteligente.</p>
          <div className="feature-list">
            <div className="feature-item">🔄 Automação Inteligente</div>
            <div className="feature-item">📋 Templates Prontos</div>
            <div className="feature-item">🔗 Integrações Nativas</div>
            <div className="feature-item">📊 Monitoramento em Tempo Real</div>
          </div>
        </div>
      )
    },
    {
      id: 8,
      title: 'Suporte',
      description: 'Central de ajuda e suporte',
      icon: '🎧',
      content: (
        <div className="modal-support">
          <h3>Central de Suporte</h3>
          <p>Suporte especializado 24/7 para garantir o melhor uso da plataforma.</p>
          <div className="feature-list">
            <div className="feature-item">🎧 Suporte 24/7</div>
            <div className="feature-item">📚 Base de Conhecimento</div>
            <div className="feature-item">🎥 Tutoriais em Vídeo</div>
            <div className="feature-item">💬 Chat em Tempo Real</div>
          </div>
        </div>
      )
    }
  ];

  const handleCardClick = (card) => {
    if (card.isSpecial) {
      card.action();
      return;
    }

    setSelectedCard(card);
    setIsAnimationPaused(true);
    
    // Pequeno delay para mostrar o card expandido antes do modal
    setTimeout(() => {
      setIsModalOpen(true);
    }, 300);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
    setIsAnimationPaused(false);
  };

  useEffect(() => {
    // Carregar bibliotecas externas
    const loadExternalLibs = () => {
      // Typed.js
      if (!window.Typed) {
        const typedScript = document.createElement('script');
        typedScript.src = 'https://cdn.jsdelivr.net/npm/typed.js@2.0.12';
        document.head.appendChild(typedScript);
      }

      // GSAP
      if (!window.gsap) {
        const gsapScript = document.createElement('script');
        gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
        document.head.appendChild(gsapScript);
      }

      // SplitType
      if (!window.SplitType) {
        const splitScript = document.createElement('script');
        splitScript.src = 'https://unpkg.com/split-type';
        document.head.appendChild(splitScript);
      }
    };

    loadExternalLibs();

    // Inicializar animações após carregar as bibliotecas
    const initAnimations = () => {
      if (window.Typed && window.gsap && window.SplitType) {
        // Typed.js para o texto animado
        new window.Typed('.text', {
          strings: ['', 'inovação.', 'tecnologia.', 'futuro.'],
          typeSpeed: 100,
          backSpeed: 40,
          loop: true
        });

        // GSAP para animação do título
        window.gsap.registerPlugin(window.ScrollTrigger);
        const introsplitTypes = document.querySelectorAll('.left-part h1');
        introsplitTypes.forEach((char, i) => {
          const i_text = new window.SplitType(char);
          window.gsap.to(i_text.chars, {
            y: 0,
            stagger: 0.05, // Animação mais suave
            duration: 0.6
          });
        });
      } else {
        setTimeout(initAnimations, 100);
      }
    };

    setTimeout(initAnimations, 500);
  }, []);

  return (
    <div className="nexus-home">
      <main>
        <section className="info-section">
          <div className="left-part">
            <div className="nexus-logo">
              <img src="/toit-nexus-logo.svg" alt="TOIT Nexus" className="logo-animation" />
            </div>
            <h1>
              <span className="d-flex">nós criamos</span>
              <span className="text"></span>
            </h1>
            <p>Transformamos ideias em realidade através de tecnologia quântica e inteligência artificial avançada</p>
            <div className="cta-section">
              <span className="cta-text">Explore nossas soluções</span>
              <div className="arrow-indicator">
                <span></span>
              </div>
            </div>
          </div>
          
          <div className="right-part">
            <div className="bg-line">
              <div className="wave-line"></div>
              <div className="wave-line"></div>
            </div>

            <div className={`main-grid d-flex ${isAnimationPaused ? 'paused' : ''}`}>
              {nexusCards.map((card, index) => (
                <div 
                  key={card.id}
                  className={`box box-${index + 1} ${selectedCard?.id === card.id ? 'selected' : ''}`}
                  onClick={() => handleCardClick(card)}
                >
                  <div className="card-content">
                    <div className="card-icon">{card.icon}</div>
                    <span className="card-title">{card.title}</span>
                    {selectedCard?.id === card.id && (
                      <div className="card-expanded">
                        <p className="card-description">{card.description}</p>
                        <div className="access-icon">→</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-circle-h-line">
              <div className="circle-ring"></div>
              <div className="circle-ring"></div>
              <div className="circle-ring"></div>
            </div>
            <div className="bg-dash-circle">
              <div className="dash-circle"></div>
            </div>
          </div>
        </section>
      </main>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleModalClose}
        title={selectedCard?.title}
      >
        {selectedCard?.content}
      </Modal>
    </div>
  );
};

export default HomePage;