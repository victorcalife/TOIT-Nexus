import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { formatCpf, cleanCpf, validateCpf } from '../lib/utils';
import { API_CONFIG } from '../config/env';

export default function Login()
{
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('login');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const nodesRef = useRef([]);
  
  // Detectar se é acesso de suporte baseado no domínio
  const isSupportLogin = window.location.hostname === 'admin.toit.com.br' || 
                        window.location.hostname.includes('supnexus');

  // Redirecionar se já autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get('redirect') || '/dashboard';
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, navigate, searchParams]);

  // Hide loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create nodes
    const nodes = [];
    for (let i = 0; i < 50; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
      });
    }
    nodesRef.current = nodes;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.fill();
        
        // Draw connections
        nodes.forEach(otherNode => {
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
          );
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - distance / 100)})`;
            ctx.stroke();
          }
        });
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handleCpfChange = (e) => {
    const value = formatCpf(e.target.value);
    setCpf(value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (activeTab === 'register') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!cpf || !password) {
      setError('Por favor, preencha todos os campos');
      setIsLoading(false);
      return;
    }

    const cleanedCpf = cleanCpf(cpf);
    if (!validateCpf(cleanedCpf)) {
      setError('CPF inválido');
      setIsLoading(false);
      return;
    }

    try {
      console.log(`🛡️ [LOGIN] Iniciando login ${isSupportLogin ? 'SUPORTE' : 'NORMAL'}:`, { cpf: cleanedCpf });
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.SIMPLE_LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          cpf: cleanedCpf,
          password,
          loginType: isSupportLogin ? 'support' : 'normal',
          rememberMe
        }),
      });

      console.log(`🛡️ [LOGIN] Resposta recebida:`, response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(`🛡️ [LOGIN] Login realizado com sucesso:`, data.user?.name);
      
      // Armazenar dados do usuário
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      navigate(redirectTo);
    } catch (err) {
      console.error('❌ Erro no login:', err);
      setError(err.message || 'Erro no login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!name || !email || !cpf || !phone || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      setIsLoading(false);
      return;
    }

    if (!validateCpf(cleanCpf(cpf))) {
      setError('CPF inválido');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    if (passwordStrength < 75) {
      setError('A senha deve ser mais forte');
      setIsLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError('Você deve aceitar os termos de uso');
      setIsLoading(false);
      return;
    }

    try {
      // Aqui você implementaria a lógica de registro
      console.log('Registrando usuário:', { name, email, cpf: cleanCpf(cpf), phone });
      setError('Registro realizado com sucesso! Faça login.');
      setActiveTab('login');
    } catch (err) {
      console.error('Erro no registro:', err);
      setError(err.message || 'Erro no registro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () =>
  {
    setShowPassword( !showPassword );
  };

  if (showLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-logo">
            <div className="logo-icon">🚀</div>
            <h1>TOIT Nexus</h1>
          </div>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <canvas ref={canvasRef} className="background-canvas"></canvas>
      
      <div className="login-content">
        <div className="login-card">
          <div className="card-header">
            <div className="logo">
              <img 
                src="/assets/SELOtoit-workflow-logo.svg" 
                alt={isSupportLogin ? 'TOIT Nexus - Suporte' : 'TOIT Nexus'} 
                className="logo-image"
              />
            </div>
            <h1>{isSupportLogin ? 'TOIT Nexus - Suporte' : 'TOIT Nexus'}</h1>
            <p className="subtitle">{isSupportLogin ? 'Portal de Suporte Técnico' : 'Sistema de Gestão Empresarial'}</p>
          </div>

          <div className="tab-container">
            {!isSupportLogin && (
              <div className="form-tabs">
                <button 
                  type="button"
                  className={`tab ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => setActiveTab('login')}
                >
                  Entrar
                </button>
                <button 
                  type="button"
                  className={`tab ${activeTab === 'register' ? 'active' : ''}`}
                  onClick={() => setActiveTab('register')}
                >
                  Criar Conta
                </button>
              </div>
            )}
            
            {isSupportLogin && (
              <div className="support-login-title">
                <h2>Acesso ao Portal de Suporte</h2>
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {(activeTab === 'login' || isSupportLogin) ? (
              <form onSubmit={handleLoginSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="cpf">CPF</label>
                  <input
                    type="text"
                    id="cpf"
                    value={cpf}
                    onChange={handleCpfChange}
                    placeholder="000.000.000-00"
                    maxLength="14"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Senha</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Digite sua senha"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Lembrar de mim
                  </label>
                  <a href="#" className="forgot-password">Esqueceu a senha?</a>
                </div>

                <button type="submit" className="submit-button" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="register-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Nome Completo</label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">E-mail</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cpf-register">CPF</label>
                    <input
                      type="text"
                      id="cpf-register"
                      value={cpf}
                      onChange={handleCpfChange}
                      placeholder="000.000.000-00"
                      maxLength="14"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Telefone</label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password-register">Senha</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password-register"
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Crie uma senha forte"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className="strength-fill" 
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                    <span className="strength-text">
                      {passwordStrength < 25 && 'Muito fraca'}
                      {passwordStrength >= 25 && passwordStrength < 50 && 'Fraca'}
                      {passwordStrength >= 50 && passwordStrength < 75 && 'Média'}
                      {passwordStrength >= 75 && 'Forte'}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">Confirmar Senha</label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua senha"
                    required
                  />
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      required
                    />
                    <span className="checkmark"></span>
                    Aceito os <a href="#">termos de uso</a> e <a href="#">política de privacidade</a>
                  </label>
                </div>

                <button type="submit" className="submit-button" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Cadastrando...
                    </>
                  ) : (
                    'Criar Conta'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          position: relative;
          overflow: hidden;
        }

        .background-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .login-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 400px;
          padding: 8px;
        }

        .login-card {
          background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
          backdrop-filter: blur(20px);
          border-radius: 15px;
          padding: 12px 20px 20px 20px;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-header {
          text-align: center;
          margin-bottom: 15px;
        }

        .logo {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }

        .logo-image {
          max-width: 400px;
          max-height: 160px;
          width: auto;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 8px 16px rgba(255, 255, 255, 0.2)) drop-shadow(0 4px 8px rgba(255, 255, 255, 0.1));
          transition: filter 0.3s ease;
        }

        .logo-image:hover {
          filter: drop-shadow(0 12px 24px rgba(255, 255, 255, 0.3)) drop-shadow(0 6px 12px rgba(255, 255, 255, 0.2));
        }

        .subtitle {
          color: #e2e8f0;
          margin: 0;
          font-size: 0.9rem;
        }

        .tab-container {
          width: 100%;
        }

        .support-login-title {
          text-align: center;
          margin-bottom: 2rem;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 150, 255, 0.1));
          border-radius: 8px;
          border: 1px solid rgba(0, 212, 255, 0.2);
        }
        
        .support-login-title h2 {
          color: #00d4ff;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #fcc;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #e2e8f0;
        }

        .form-group input {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          background: white;
          color: #2d3748;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .password-input {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
        }

        .password-strength {
          margin-top: 8px;
        }

        .strength-bar {
          height: 4px;
          background: #4a5568;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 5px;
        }

        .strength-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff4757, #ffa502, #2ed573);
          transition: width 0.3s ease;
        }

        .strength-text {
          font-size: 0.8rem;
          color: #cbd5e0;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-size: 0.9rem;
          color: #e2e8f0;
        }

        .checkbox-label input[type="checkbox"] {
          display: none;
        }

        .checkmark {
          width: 18px;
          height: 18px;
          border: 2px solid #718096;
          border-radius: 4px;
          margin-right: 8px;
          position: relative;
          transition: all 0.3s ease;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark {
          background: #4299e1;
          border-color: #4299e1;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
          content: '✓';
          position: absolute;
          top: -2px;
          left: 2px;
          color: white;
          font-size: 12px;
        }

        .forgot-password {
          color: #90cdf4;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }

        .submit-button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(66, 153, 225, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .loading-content {
          text-align: center;
          color: white;
        }

        .loading-logo {
          margin-bottom: 30px;
        }

        .loading-logo .logo-icon {
          font-size: 4rem;
          margin-bottom: 10px;
        }

        .loading-logo h1 {
          font-size: 2.5rem;
          margin: 0;
          font-weight: 700;
        }

        .loading-spinner {
          margin: 30px 0;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
          .login-card {
            padding: 30px 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-options {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}