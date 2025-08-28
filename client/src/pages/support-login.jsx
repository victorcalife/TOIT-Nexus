import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatCpf, cleanCpf, validateCpf } from "@/lib/utils";
import { API_CONFIG } from "@/config/env";

export default function SupportLogin()
{
  const [ cpf, setCpf ] = useState( "" );
  const [ password, setPassword ] = useState( "" );
  const [ rememberMe, setRememberMe ] = useState( false );
  const [ isLoading, setIsLoading ] = useState( false );
  const [ showLoading, setShowLoading ] = useState( true );
  const { toast } = useToast();
  const canvasRef = useRef( null );
  const mouseRef = useRef( { x: 0, y: 0 } );
  const nodesRef = useRef( [] );

  console.log( '🛡️ [SUPPORT-LOGIN] Componente renderizado' );

  // Animação de background
  useEffect( () =>
  ({ const canvas = canvasRef.current;
    if ( !canvas ) return;

    const ctx = canvas.getContext( '2d' );
    let animationId;

    const resizeCanvas = ( }) =>
    {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createNodes();
    };

    const createNodes = () =>
    {
      const nodeCount = Math.floor( ( canvas.width * canvas.height ) / 20000 );
      nodesRef.current = [];

      for ( let i = 0; i < nodeCount; i++ )
      {
        nodesRef.current.push( {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: ( Math.random() - 0.5 ) * 0.3,
          vy: ( Math.random() - 0.5 ) * 0.3,
          radius: Math.random() * 1.5 + 0.5
        } );
      }
    };

    const animateNetwork = () =>
    {
      ctx.clearRect( 0, 0, canvas.width, canvas.height );
      const mouse = mouseRef.current;
      const nodes = nodesRef.current;

      // Update and draw nodes
      nodes.forEach( node =>
      {
        // Move nodes
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if ( node.x < 0 || node.x > canvas.width ) node.vx *= -1;
        if ( node.y < 0 || node.y > canvas.height ) node.vy *= -1;

        // Mouse interaction
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const distance = Math.sqrt( dx * dx + dy * dy );

        if ( distance < 100 )
        {
          const force = ( 100 - distance ) / 100;
          node.x -= dx * force * 0.005;
          node.y -= dy * force * 0.005;
        }

        // Draw node
        ctx.beginPath();
        ctx.arc( node.x, node.y, node.radius, 0, Math.PI * 2 );
        ctx.fillStyle = `rgba(0, 212, 255, ${ 0.4 + Math.sin( Date.now() * 0.001 + node.x * 0.01 ) * 0.2 })`;
        ctx.fill();
      } );

      // Draw connections
      for ( let i = 0; i < nodes.length; i++ )
      {
        for ( let j = i + 1; j < nodes.length; j++ )
        {
          const dx = nodes[ i ].x - nodes[ j ].x;
          const dy = nodes[ i ].y - nodes[ j ].y;
          const distance = Math.sqrt( dx * dx + dy * dy );

          if ( distance < 80 )
          {
            const opacity = ( 80 - distance ) / 80 * 0.3;
            ctx.beginPath();
            ctx.moveTo( nodes[ i ].x, nodes[ i ].y );
            ctx.lineTo( nodes[ j ].x, nodes[ j ].y );`
            ctx.strokeStyle = `rgba(0, 212, 255, ${ opacity })`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame( animateNetwork );
    };

    const handleMouseMove = ( e ) =>
    {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    resizeCanvas();
    animateNetwork();

    window.addEventListener( 'resize', resizeCanvas );
    document.addEventListener( 'mousemove', handleMouseMove );

    // Hide loading screen
    setTimeout( () =>
    {
      setShowLoading( false );
    }, 1500 );

    return () =>
    {
      cancelAnimationFrame( animationId );
      window.removeEventListener( 'resize', resizeCanvas );
      document.removeEventListener( 'mousemove', handleMouseMove );
    };
  }, [] );

  const handleCpfChange = ( e ) =>
  {
    let value = e.target.value.replace( /\D/g, '' );
    value = value.replace( /(\d{3})(\d)/, '$1.$2' );
    value = value.replace( /(\d{3})(\d)/, '$1.$2' );
    value = value.replace( /(\d{3})(\d{1,2})$/, '$1-$2' );
    setCpf( value );
  };

  const handleSubmit = async ( e ) =>
  {
    e.preventDefault();

    if ( !cpf || !password )
    {
      toast( {
        title: "Campos obrigatórios",
        description: "Por favor, preencha CPF e senha.",
        variant: "destructive",
      } );
      return;
    }

    const cleanedCpf = cleanCpf( cpf );
    if ( !validateCpf( cleanedCpf ) )
    {
      toast( {
        title: "CPF inválido",
        description: "Por favor, verifique o CPF informado.",
        variant: "destructive",
      } );
      return;
    }

    setIsLoading( true );

    try
    {
      console.log( '🛡️ [SUPPORT-LOGIN] Iniciando login:', { cpf: cleanedCpf } );
`
      const response = await fetch( `${ API_CONFIG.BASE_URL }${ API_CONFIG.ENDPOINTS.AUTH.SIMPLE_LOGIN }`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify( {
          cpf: cleanCpf( cpf ),
          password,
          loginType: 'support'
        } ),
      } );

      console.log( '🛡️ [SUPPORT-LOGIN] Resposta recebida:', response.status );

      if ( !response.ok )
      ({ const errorData = await response.json().catch( ( }) => ( { error: 'Erro desconhecido' } ) );`
        throw new Error( errorData.error || `Erro HTTP ${ response.status }` );
      }

      const data = await response.json();
      console.log( '✅ [SUPPORT-LOGIN] Login realizado com sucesso:', data );

      toast( {
        title: "Login realizado com sucesso!",`
        description: `Bem-vindo, ${ data.user?.firstName || 'Usuário' }!`,
        variant: "default",
      } );

      // Redirecionar para dashboard de suporte
      window.location.href = '/support/dashboard';

    } catch ( error )
    {
      console.error( 'Login error:', error );
      toast( {
        title: "Erro no login",
        description: error.message || "Erro interno do servidor",
        variant: "destructive",
      } );
    } finally
    {
      setIsLoading( false );
    }
  };

  const goBack = () =>
  {
    if ( window.confirm( 'Deseja voltar à página principal do TOIT?' ) )
    {
      window.history.back();
    }
  };

  const forgotPassword = () =>
  {
    const email = window.prompt( 'Digite seu email para recuperar a senha:' );
    if ( email )
    {
      toast( {
        title: "Email de recuperação enviado!",`
        description: `Enviamos instruções para ${ email } sobre como redefinir sua senha.`,
        variant: "default",
      } );
    }
  };

  return (
    <>`
      <style jsx>{ `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
          color: white;
          overflow: hidden;
          height: 100vh;
        }

        .bg-animation {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          overflow: hidden;
          pointer-events: none;
        }

        #networkCanvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.4;
        }

        .login-container {
          position: relative;
          z-index: 10;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .back-button {
          position: fixed;
          top: 22px;
          left: 22px;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 38px;
          padding: 9px 15px;
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.68rem;
          transition: all 0.4s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .back-button:hover {
          background: rgba(0, 212, 255, 0.2);
          border-color: #00d4ff;
          transform: translateX(-5px);
          box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
        }

        .back-button::before {
          content: '←';
          font-size: 1.2rem;
          transition: transform 0.3s ease;
        }

        .back-button:hover::before {
          transform: translateX(-3px);
        }`
      `}</style>

      {/* Loading Screen */ }
      { showLoading && (
        <div style={ {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#000',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'opacity 1s ease'}
        } }>
          <div style={ {
            fontSize: '1.5rem',
            background: 'linear-gradient(45deg, #00d4ff, #4a148c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'pulse 2s ease-in-out infinite'}
          } }>
            Inicializando Nexus...
          </div>
        </div>
      ) }

      {/* Interactive Network Background */ }
      <div className="bg-animation">
        <canvas ref={ canvasRef } id="networkCanvas"></canvas>
      </div>

      {/* Login Container */ }
      <div className="login-container">
        <div style={ {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '19px',
          padding: '30px',
          width: '100%',
          maxWidth: '338px',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideIn 0.8s ease-out'}
        } }>
          {/* Header Gradient */ }
          <div style={ {
            content: '',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #00d4ff, #4a148c, #00ff88)',
            backgroundSize: '200% 100%',
            animation: 'gradientFlow 3s ease-in-out infinite'}
          } }></div>

          {/* Header */ }
          <div style={ { textAlign: 'center', marginBottom: '30px' } }>
            <div style={ {
              fontSize: '2.63rem',
              fontWeight: 900,
              background: 'linear-gradient(45deg, #00d4ff, #4a148c)',
              backgroundSize: '400% 400%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradientShift 3s ease-in-out infinite',
              marginBottom: '8px',
              textShadow: '0 0 23px rgba(0, 212, 255, 0.5)'}
            } }>

            <div style={ {
              fontSize: '0.83rem',
              opacity: 0.8,
              marginBottom: '4px'}
            } }>
              Acesso da Equipe de Suporte
            </div>
            <div style={ {
              fontSize: '0.68rem',
              color: '#00d4ff',
              opacity: 0.7}
            } }>
              Plataforma NO-CODE + Machine Learning + Quantum
            </div>
          </div>

          {/* Login Form */ }
          <form onSubmit={ handleSubmit }>
            <div style={ { marginBottom: '15px', position: 'relative' } }>
              <label style={ {
                display: 'block',
                marginBottom: '6px',
                color: '#00d4ff',
                fontWeight: 600,
                fontSize: '0.68rem'}
              } }>

              <input
                type="text"
                value={ cpf }
                onChange={ handleCpfChange }
                placeholder="000.000.000-00"
                maxLength="14"
                required
                style={ {
                  width: '100%',
                  padding: '9px 15px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '9px',
                  color: 'white',
                  fontSize: '0.75rem',
                  transition: 'all 0.3s ease',
                  position: 'relative'}
                } }
                onFocus=({ ( e  }) =>
                {
                  e.target.style.borderColor = '#00d4ff';
                  e.target.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.3)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                } }
                onBlur=({ ( e  }) =>
                {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                } }
              />
            </div>

            <div style={ { marginBottom: '15px', position: 'relative' } }>
              <label style={ {
                display: 'block',
                marginBottom: '6px',
                color: '#00d4ff',
                fontWeight: 600,
                fontSize: '0.68rem'}
              } }>

              <input
                type="password"
                value={ password }
                onChange=({ ( e  }) => setPassword( e.target.value ) }
                placeholder="Sua senha segura"
                required
                style={ {
                  width: '100%',
                  padding: '9px 15px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '9px',
                  color: 'white',
                  fontSize: '0.75rem',
                  transition: 'all 0.3s ease',
                  position: 'relative'}
                } }
                onFocus=({ ( e  }) =>
                {
                  e.target.style.borderColor = '#00d4ff';
                  e.target.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.3)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                } }
                onBlur=({ ( e  }) =>
                {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                } }
              />
            </div>

            <div style={ {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '19px',
              fontSize: '0.68rem'}
            } }>
              <label style={ {
                display: 'flex',
                alignItems: 'center',
                gap: '8px'}
              } }>
                <input
                  type="checkbox"
                  checked={ rememberMe }
                  onChange=({ ( e  }) => setRememberMe( e.target.checked ) }
                  style={ { width: 'auto', margin: 0 } }
                />
                Lembrar-me
              </label>
              <button
                type="button"
                onClick={ forgotPassword }
                style={ {
                  background: 'none',
                  border: 'none',
                  color: '#4a148c',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  fontSize: '0.68rem'}
                } }
                onMouseEnter=({ ( e  }) =>
                {
                  e.target.style.color = '#00d4ff';
                  e.target.style.textShadow = '0 0 10px rgba(0, 212, 255, 0.5)';
                } }
                onMouseLeave=({ ( e  }) =>
                {
                  e.target.style.color = '#4a148c';
                  e.target.style.textShadow = 'none';
                } }
              >
                Esqueci minha senha
              </button>
            </div>

            <button
              type="submit"
              disabled={ isLoading }
              style={ {
                width: '100%',
                padding: '9px',
                background: 'linear-gradient(135deg, #00d4ff, #4a148c)',
                color: 'white',
                border: 'none',
                borderRadius: '9px',
                fontSize: '0.83rem',
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.4s ease',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '15px',
                opacity: isLoading ? 0.6 : 1}
              } }
              onMouseEnter=({ ( e  }) =>
              {
                if ( !isLoading )
                {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 20px 40px rgba(0, 212, 255, 0.4)';
                }
              } }
              onMouseLeave=({ ( e  }) =>
              {
                if ( !isLoading )
                {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              } }
            >
              { isLoading ? 'Conectando ao Nexus...' : 'Acessar Nexus' }
            </button>
          </form>

          {/* Security Notice */ }
          <div style={ {
            background: 'rgba(0, 255, 136, 0.1)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: '8px',
            padding: '11px',
            marginTop: '15px',
            textAlign: 'center'}
          } }>
            <h4 style={ {
              color: '#00ff88',
              marginBottom: '4px',
              fontSize: '0.68rem'}
            } }>
              🔒 Acesso Seguro
            </h4>
            <p style={ {
              fontSize: '0.6rem',
              opacity: 0.8,
              lineHeight: 1.4}
            } }>
              Este é o portal exclusivo da equipe de suporte TOIT. Todas as ações são monitoradas e registradas para garantir a segurança dos dados.
            </p>
          </div>
        </div>
      </div>
`
      <style jsx>{ `
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes gradientFlow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 200% 50%;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 768px) {
          .login-container > div {
            padding: 23px 19px !important;
            margin: 15px !important;
          }

          .login-container h1 {
            font-size: 2.1rem !important;
          }

          .back-button {
            top: 15px !important;
            left: 15px !important;
            padding: 8px 11px !important;
            font-size: 0.6rem !important;
          }
        }

        @media (max-width: 480px) {
          .login-container > div {
            padding: 19px 15px !important;
          }

          .login-container h1 {
            font-size: 1.65rem !important;
          }
        }`
      `}</style>
    </>
  );
}
`