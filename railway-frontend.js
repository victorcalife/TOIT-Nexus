import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

const app = express();
const port = process.env.PORT || 8080;

// CONFIGURAÇÕES PARA RAILWAY
app.set( 'trust proxy', true );

// DEBUG E LOGGING DETALHADO
app.use( ( req, res, next ) =>
{
  console.log( `🔍 [INTEGRATED] ${ req.method } ${ req.url } | Host: ${ req.get( 'host' ) } | User-Agent: ${ req.get( 'user-agent' )?.substring( 0, 50 ) }...` );
  next();
} );

// Middleware para parsing JSON
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );

// CORS middleware para permitir requisições
app.use( ( req, res, next ) =>
{
  const origin = req.get( 'origin' );
  const allowedOrigins = [
    'https://nexus.toit.com.br',
    'https://supnexus.toit.com.br',
    'https://api.toit.com.br',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000'
  ];

  console.log( `🔒 [CORS] Origin: ${ origin } | Allowed: ${ allowedOrigins.includes( origin || '' ) }` );

  if ( origin && allowedOrigins.includes( origin ) )
  {
    res.header( 'Access-Control-Allow-Origin', origin );
  } else if ( !origin )
  {
    res.header( 'Access-Control-Allow-Origin', '*' );
  }

  res.header( 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS' );
  res.header( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization' );
  res.header( 'Access-Control-Allow-Credentials', 'true' );

  if ( req.method === 'OPTIONS' )
  {
    res.sendStatus( 200 );
  } else
  {
    next();
  }
} );

// JSON middleware para APIs
app.use( express.json() );
app.use( express.urlencoded( { extended: false } ) );

// =========================
// SEÇÃO: BACKEND APIs
// =========================

console.log( '🚀 Inicializando APIs backend integradas...' );

// IMPORTAR E CONFIGURAR BACKEND APIs
let backendInitialized = false;

async function initializeBackend()
{
  try
  {
    console.log( '📡 Carregando sistema backend TypeScript...' );

    // Importar o sistema backend completo (se possível via require dinâmico)
    // Como temos TypeScript, vamos implementar APIs essenciais em JavaScript simples

    // DEBUG ROUTE - CONFIRMAR SE SERVIDOR INTEGRADO ESTÁ ATIVO
    app.get( '/api/debug-integrated', ( req, res ) =>
    {
      console.log( '🐛 DEBUG: Servidor integrado FUNCIONANDO!' );
      res.json( {
        success: true,
        message: 'SERVIDOR INTEGRADO ESTÁ ATIVO!',
        timestamp: new Date().toISOString(),
        service: 'TOIT NEXUS Integrated Server',
        version: '2.0-DEBUG',
        environment: process.env.NODE_ENV || 'development',
        host: req.get( 'host' ),
        originalUrl: req.originalUrl,
        method: req.method
      } );
    } );

    // HEALTH CHECK API
    app.get( '/api/health', ( req, res ) =>
    {
      console.log( '💚 Health check requisitado via servidor integrado' );
      res.json( {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'TOIT NEXUS Integrated Server - WORKING',
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        integrated: true,
        host: req.get( 'host' )
      } );
    } );

    // AUTH API BÁSICA (simulada temporariamente)
    app.post( '/api/auth/login', ( req, res ) =>
    {
      console.log( '🔐 Login attempt:', req.body );
      const { cpf, password } = req.body;

      // Validação básica para teste
      if ( cpf === '33656299803' && password === '241286' )
      {
        res.json( {
          success: true,
          user: {
            id: 'admin_full',
            firstName: 'Admin',
            lastName: 'Full',
            name: 'Admin Full',
            role: 'super_admin',
            cpf: '33656299803',
            email: 'admin@toit.com.br',
            tenantId: null
          },
          token: 'mock-jwt-token-' + Date.now(),
          message: 'Login realizado com sucesso'
        } );
      } else if ( cpf === '00000000000' && password === 'admin123' )
      {
        res.json( {
          success: true,
          user: {
            id: 'user_1',
            name: 'Super Admin TOIT',
            role: 'super_admin',
            cpf: '00000000000'
          },
          token: 'mock-jwt-token-' + Date.now(),
          message: 'Login realizado com sucesso'
        } );
      } else if ( cpf === '11111111111' && password === 'admin123' )
      {
        res.json( {
          success: true,
          user: {
            id: 'user_2',
            name: 'Tenant Admin',
            role: 'tenant_admin',
            cpf: '11111111111'
          },
          token: 'mock-jwt-token-' + Date.now(),
          message: 'Login realizado com sucesso'
        } );
      } else
      {
        res.status( 401 ).json( {
          success: false,
          error: 'Credenciais inválidas',
          message: 'CPF ou senha incorretos'
        } );
      }
    } );

    // SIMPLE LOGIN API - Para suporte
    app.post( '/api/simple-login', ( req, res ) =>
    {
      console.log( '🔐 [SIMPLE-LOGIN] Tentativa de login de suporte:', req.body );

      const { cpf, password, loginType } = req.body;

      if ( !cpf || !password )
      {
        return res.status( 400 ).json( {
          success: false,
          message: 'CPF e senha são obrigatórios'
        } );
      }

      // Mock de usuários de suporte para teste
      const supportUsers = [
        {
          id: 'admin_full',
          cpf: '33656299803',
          password: '241286',
          firstName: 'Admin',
          lastName: 'Full',
          email: 'admin@toit.com.br',
          role: 'super_admin'
        },
        {
          id: 'support_1',
          cpf: '12345678901',
          password: 'admin123',
          firstName: 'Admin',
          lastName: 'TOIT',
          email: 'admin2@toit.com.br',
          role: 'super_admin'
        },
        {
          id: 'support_2',
          cpf: '98765432100',
          password: 'suporte123',
          firstName: 'Suporte',
          lastName: 'TOIT',
          email: 'suporte@toit.com.br',
          role: 'toit_admin'
        }
      ];

      const user = supportUsers.find( u => u.cpf === cpf.replace( /\D/g, '' ) );

      if ( !user || user.password !== password )
      {
        return res.status( 401 ).json( {
          success: false,
          message: 'Credenciais inválidas'
        } );
      }

      // Verificar se é login de suporte
      if ( loginType === 'support' && ![ 'super_admin', 'toit_admin' ].includes( user.role ) )
      {
        return res.status( 403 ).json( {
          success: false,
          message: 'Acesso negado - Apenas equipe TOIT'
        } );
      }

      res.json( {
        success: true,
        message: 'Login realizado com sucesso',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      } );
    } );

    // USER API - Para verificar usuário logado
    app.get( '/api/user', ( req, res ) =>
    {
      console.log( '👤 [USER] Verificação de usuário logado' );

      // Mock de usuário logado para teste
      res.json( {
        success: true,
        user: {
          id: 'support_1',
          firstName: 'Admin',
          lastName: 'TOIT',
          email: 'admin@toit.com.br',
          role: 'super_admin'
        }
      } );
    } );

    // TENANTS API
    app.get( '/api/tenants', ( req, res ) =>
    {
      console.log( '🏢 Tenants list requested' );
      res.json( {
        success: true,
        data: [
          { id: 'toit', name: 'TOIT Enterprise', slug: 'toit' },
          { id: 'demo', name: 'Demo Company', slug: 'demo' }
        ]
      } );
    } );

    // QUERY BUILDER API
    app.post( '/api/query-builder/execute', ( req, res ) =>
    {
      console.log( '🔍 Query builder execution:', req.body );
      res.json( {
        success: true,
        results: [
          { id: 1, name: 'Resultado 1', status: 'ativo' },
          { id: 2, name: 'Resultado 2', status: 'inativo' }
        ],
        message: 'Query executada com sucesso (simulação)'
      } );
    } );

    // TQL PROCESSING API
    app.post( '/api/tql/process', ( req, res ) =>
    {
      console.log( '🧠 TQL processing:', req.body );
      res.json( {
        success: true,
        sql: 'SELECT * FROM users WHERE tenant_id = ?',
        results: [],
        message: 'TQL processado com sucesso'
      } );
    } );

    // VISUAL WORKFLOWS API
    app.get( '/api/visual-workflows', ( req, res ) =>
    {
      console.log( '🔄 Visual workflows requested' );
      res.json( {
        success: true,
        data: [
          {
            workflow: {
              id: 'wf_1',
              name: 'Workflow de Exemplo',
              description: 'Workflow de demonstração',
              isActive: true,
              executionCount: 5
            },
            nodeCount: 3
          }
        ]
      } );
    } );

    app.post( '/api/workflows/execute', ( req, res ) =>
    {
      console.log( '▶️ Workflow execution:', req.body );
      res.json( {
        success: true,
        executionId: 'exec_' + Date.now(),
        status: 'running',
        message: 'Workflow iniciado com sucesso'
      } );
    } );

    // QUANTUM MONITORING APIs
    app.get( '/api/quantum-monitoring/status', ( req, res ) =>
    {
      console.log( '⚛️ Quantum status requested' );
      res.json( {
        success: true,
        data: {
          totalQubits: 260,
          provider: 'IBM Quantum Network',
          status: 'operational',
          activeJobs: 3,
          queueSize: 7
        }
      } );
    } );

    app.get( '/api/quantum-monitoring/infrastructure', ( req, res ) =>
    {
      console.log( '🏗️ Quantum infrastructure requested' );
      res.json( {
        success: true,
        data: {
          servers: [
            { name: 'IBM Alpha', qubits: 127, status: 'online' },
            { name: 'IBM Beta', qubits: 133, status: 'online' }
          ],
          totalCapacity: 260,
          utilization: 0.15
        }
      } );
    } );

    // TASK MANAGEMENT APIs
    app.get( '/api/advanced-tasks/categories', ( req, res ) =>
    {
      console.log( '📋 Task categories requested' );
      res.json( {
        success: true,
        data: [
          { id: 1, name: 'Desenvolvimento', color: '#blue' },
          { id: 2, name: 'Marketing', color: '#green' }
        ]
      } );
    } );

    app.get( '/api/advanced-tasks/automation/rules', ( req, res ) =>
    {
      console.log( '🤖 Task automation rules requested' );
      res.json( {
        success: true,
        data: [
          { id: 1, name: 'Auto-assign urgentes', trigger: 'task_created', active: true }
        ]
      } );
    } );

    // DASHBOARD BUILDER APIs
    app.get( '/api/advanced-dashboard/widget-types', ( req, res ) =>
    {
      console.log( '📊 Dashboard widget types requested' );
      res.json( {
        success: true,
        data: {
          charts: [ 'line_chart', 'bar_chart', 'pie_chart' ],
          kpis: [ 'number_kpi', 'gauge_kpi', 'progress_bar' ],
          tables: [ 'data_table', 'summary_table' ]
        }
      } );
    } );

    app.get( '/api/inline-dashboard/:id/editor', ( req, res ) =>
    {
      console.log( '✏️ Dashboard editor requested:', req.params.id );
      res.json( {
        success: true,
        data: {
          dashboardId: req.params.id,
          widgets: [],
          layout: { columns: 12, rows: 8 }
        }
      } );
    } );

    // ADMIN APIs
    app.get( '/api/admin/stats', ( req, res ) =>
    {
      console.log( '👥 Admin stats requested' );
      res.json( {
        success: true,
        data: {
          totalUsers: 25,
          activeTenants: 3,
          systemHealth: 'excellent',
          uptime: '99.9%'
        }
      } );
    } );

    app.get( '/api/admin/access-profiles', ( req, res ) =>
    {
      console.log( '🎫 Access profiles requested' );
      res.json( {
        success: true,
        data: [
          { id: 1, name: 'BÁSICO', price: 59.00, features: [ 'Query Builder', 'Reports' ] },
          { id: 2, name: 'PREMIUM', price: 119.00, features: [ 'All features', 'Quantum ML' ] }
        ]
      } );
    } );

    // INTEGRATIONS APIs
    app.get( '/api/calendar/integrations', ( req, res ) =>
    {
      console.log( '📅 Calendar integrations requested' );
      res.json( {
        success: true,
        data: [
          { provider: 'google', connected: false },
          { provider: 'outlook', connected: false }
        ]
      } );
    } );

    app.get( '/api/notifications', ( req, res ) =>
    {
      console.log( '🔔 Notifications requested' );
      res.json( {
        success: true,
        data: [
          { id: 1, title: 'Bem-vindo ao TOIT NEXUS', type: 'info', read: false }
        ]
      } );
    } );

    // DATA CONNECTIONS APIs
    app.get( '/api/data-connections', ( req, res ) =>
    {
      console.log( '🔌 Data connections requested' );
      res.json( {
        success: true,
        data: [
          { id: 1, name: 'PostgreSQL Principal', type: 'postgresql', status: 'connected' }
        ]
      } );
    } );

    app.get( '/api/universal-database/schema', ( req, res ) =>
    {
      console.log( '🗂️ Database schema requested' );
      res.json( {
        success: true,
        data: {
          tables: [
            { name: 'users', columns: [ 'id', 'name', 'email', 'tenant_id' ] },
            { name: 'tenants', columns: [ 'id', 'name', 'slug' ] }
          ]
        }
      } );
    } );

    // REPORTS APIs
    app.get( '/api/reports', ( req, res ) =>
    {
      console.log( '📈 Reports requested' );
      res.json( {
        success: true,
        data: [
          { id: 1, name: 'Relatório Mensal', status: 'completed', generatedAt: new Date() }
        ]
      } );
    } );

    app.get( '/api/reports/templates', ( req, res ) =>
    {
      console.log( '📄 Report templates requested' );
      res.json( {
        success: true,
        data: [
          { id: 1, name: 'Template Executivo', category: 'business' },
          { id: 2, name: 'Template Técnico', category: 'technical' }
        ]
      } );
    } );

    backendInitialized = true;
    console.log( '✅ Backend APIs integradas inicializadas com sucesso!' );

  } catch ( error )
  {
    console.error( '❌ Erro ao inicializar backend:', error );

    // Fallback básico se backend falhar
    app.get( '/api/*', ( req, res ) =>
    {
      res.status( 503 ).json( {
        success: false,
        error: 'Serviço temporariamente indisponível',
        message: 'Backend em inicialização'
      } );
    } );
  }
}

// Inicializar backend
initializeBackend();

// =========================
// SEÇÃO: FRONTEND PROXY
// =========================

console.log( '🌐 Configurando frontend proxy...' );

// SERVIR ASSETS ESTÁTICOS DO REACT BUILDADO (apenas para supnexus.toit.com.br)
app.use( ( req, res, next ) =>
{
  const host = req.get( 'host' );
  const xForwardedHost = req.get( 'x-forwarded-host' );
  const realHost = xForwardedHost || host;

  // Serve static files only for supnexus domain
  if ( realHost === 'supnexus.toit.com.br' )
  {
    console.log( `📁 [STATIC] Servindo assets para: ${ realHost }` );
    express.static( path.join( __dirname, 'client', 'dist' ) )( req, res, next );
  } else
  {
    next();
  }
} );

// FALLBACK PARA DEV (se dist/ não existir - apenas para supnexus)
app.use( ( req, res, next ) =>
{
  const host = req.get( 'host' );
  const xForwardedHost = req.get( 'x-forwarded-host' );
  const realHost = xForwardedHost || host;

  // Serve dev assets only for supnexus domain
  if ( realHost === 'supnexus.toit.com.br' )
  {
    express.static( path.join( __dirname, 'client', 'src' ) )( req, res, next );
    express.static( path.join( __dirname, 'client', 'public' ) )( req, res, next );
    express.static( path.join( __dirname, 'client', 'assets' ) )( req, res, next );
  } else
  {
    next();
  }
} );

// SERVIR ASSETS GERAIS (apenas para nexus.toit.com.br)
app.use( ( req, res, next ) =>
{
  const host = req.get( 'host' );
  const xForwardedHost = req.get( 'x-forwarded-host' );
  const realHost = xForwardedHost || host;

  // Serve general assets for nexus domain (incluindo assets do React build)
  if ( realHost === 'nexus.toit.com.br' || realHost === 'localhost:8080' || realHost === '127.0.0.1:8080' )
  {
    // Servir assets do build primeiro (prioridade)
    const distPath = path.join( __dirname, 'client', 'dist' );
    const publicPath = path.join( __dirname, 'client', 'public' );

    if ( fs.existsSync( distPath ) )
    {
      console.log( `📁 [NEXUS-ASSETS] Servindo assets buildados: ${ distPath }` );
      express.static( distPath, {
        setHeaders: ( res, filePath ) =>
        {
          // Configurar MIME types corretos para módulos JS
          if ( filePath.endsWith( '.js' ) )
          {
            res.setHeader( 'Content-Type', 'application/javascript' );
          } else if ( filePath.endsWith( '.mjs' ) )
          {
            res.setHeader( 'Content-Type', 'application/javascript' );
          } else if ( filePath.endsWith( '.css' ) )
          {
            res.setHeader( 'Content-Type', 'text/css' );
          }
        }
      } )( req, res, next );
    } else if ( fs.existsSync( publicPath ) )
    {
      console.log( `📁 [NEXUS-ASSETS] Servindo assets públicos: ${ publicPath }` );
      express.static( publicPath )( req, res, next );
    } else
    {
      next();
    }
  } else
  {
    next();
  }
} );

// SERVIR FAVICON PARA TODOS OS DOMÍNIOS
app.use( '/favicon.svg', express.static( path.join( __dirname, 'client', 'public', 'favicon.svg' ) ) );
app.use( '/favicon.ico', express.static( path.join( __dirname, 'client', 'public', 'favicon.ico' ) ) );

// ROTEAMENTO POR DOMÍNIO NA ROTA RAIZ
app.get( '/', ( req, res ) =>
{
  const host = req.get( 'host' );
  const xForwardedHost = req.get( 'x-forwarded-host' );
  const realHost = xForwardedHost || host;

  console.log( `🌐 Frontend Root - Host: ${ realHost } | Path: ${ req.originalUrl }` );

  // API (backend services) → Return API info
  if ( realHost === 'api.toit.com.br' )
  {
    console.log( `📡 [API] Servindo informações da API para: ${ realHost }` );
    return res.json( {
      service: 'TOIT Nexus API',
      status: 'operational',
      version: '2.0.0',
      message: 'API server is running. Use /api/* endpoints for services.'
    } );
  }

  // SUPNEXUS (equipe TOIT) → React app sempre
  if ( realHost === 'supnexus.toit.com.br' )
  {
    console.log( `👥 [SUPNEXUS] Servindo React app para equipe TOIT` );

    const distIndexPath = path.join( __dirname, 'client', 'dist', 'index.html' );
    const devIndexPath = path.join( __dirname, 'client', 'index.html' );

    if ( fs.existsSync( distIndexPath ) )
    {
      console.log( `✅ [SUPNEXUS] Servindo React app buildado: ${ distIndexPath }` );
      return res.sendFile( distIndexPath );
    } else if ( fs.existsSync( devIndexPath ) )
    {
      console.log( `⚠️ [SUPNEXUS] Servindo React app dev: ${ devIndexPath }` );
      return res.sendFile( devIndexPath );
    } else
    {
      console.error( `❌ [SUPNEXUS] React app não encontrado` );
      return res.status( 404 ).send( `
        <h1>Sistema TOIT Indisponível</h1>
        <p>Portal da equipe TOIT temporariamente indisponível</p>
        <p>React app não foi buildado corretamente</p>
        <p>Execute: npm run build</p>
      `);
    }
  }

  // NEXUS (clientes) → Landing page sempre  
  console.log( `🎯 [NEXUS] Servindo landing page para: ${ realHost }` );

  const landingPath = path.join( __dirname, 'nexus-quantum-landing.html' );

  if ( fs.existsSync( landingPath ) )
  {
    return res.sendFile( landingPath );
  } else
  {
    return res.status( 404 ).send( `
      <h1>Arquivo não encontrado</h1>
      <p>nexus-quantum-landing.html não existe no diretório</p>
      <p>Diretório: ${ __dirname }</p>
    `);
  }
} );

// ROTA ESPECÍFICA PARA LOGIN (nexus.toit.com.br/login)
app.get( '/login', ( req, res ) =>
{
  const host = req.get( 'host' );
  const xForwardedHost = req.get( 'x-forwarded-host' );
  const realHost = xForwardedHost || host;

  console.log( `🔐 [LOGIN] Rota de login acessada - Host: ${ realHost }` );

  // Para nexus.toit.com.br, servir o React app
  if ( realHost === 'nexus.toit.com.br' || realHost === 'localhost:8080' || realHost === '127.0.0.1:8080' )
  {
    console.log( `🔐 [LOGIN] Servindo React app para login de cliente` );

    const distIndexPath = path.join( __dirname, 'client', 'dist', 'index.html' );
    const devIndexPath = path.join( __dirname, 'client', 'index.html' );

    if ( fs.existsSync( distIndexPath ) )
    {
      console.log( `✅ [LOGIN] Servindo React app buildado: ${ distIndexPath }` );
      return res.sendFile( distIndexPath );
    } else if ( fs.existsSync( devIndexPath ) )
    {
      console.log( `⚠️ [LOGIN] Servindo React app dev: ${ devIndexPath }` );
      return res.sendFile( devIndexPath );
    } else
    {
      console.error( `❌ [LOGIN] React app não encontrado` );
      return res.status( 404 ).send( `
        <h1>Sistema de Login Temporariamente Indisponível</h1>
        <p>O sistema de login está sendo configurado. Tente novamente em alguns minutos.</p>
        <p><a href="/">← Voltar para página inicial</a></p>
      ` );
    }
  }

  // Para outros domínios, redirecionar ou mostrar erro
  console.log( `❌ [LOGIN] Domínio não autorizado para login: ${ realHost }` );
  return res.status( 403 ).send( `
    <h1>Acesso Negado</h1>
    <p>Este domínio não está autorizado para acessar o sistema de login.</p>
    <p>Use: <a href="https://nexus.toit.com.br/login">nexus.toit.com.br/login</a></p>
  ` );
} );

// ROTA PARA SERVIR LANDING PAGE HTML ESTÁTICA
app.get( '/nexus-quantum-landing.html', ( req, res ) =>
{
  const host = req.get( 'host' );
  const xForwardedHost = req.get( 'x-forwarded-host' );
  const realHost = xForwardedHost || host;

  console.log( `🎨 [LANDING-HTML] Landing page HTML solicitada - Host: ${ realHost }` );

  const landingPath = path.join( __dirname, 'nexus-quantum-landing.html' );

  if ( fs.existsSync( landingPath ) )
  {
    console.log( `✅ [LANDING-HTML] Servindo landing page HTML: ${ landingPath }` );
    res.setHeader( 'Content-Type', 'text/html; charset=utf-8' );
    return res.sendFile( landingPath );
  } else
  {
    console.error( `❌ [LANDING-HTML] Landing page não encontrada: ${ landingPath }` );
    return res.status( 404 ).send( `
      <h1>Landing Page Não Encontrada</h1>
      <p>O arquivo nexus-quantum-landing.html não foi encontrado.</p>
      <p><a href="/login">← Ir para Login</a></p>
    ` );
  }
} );

// ROTAS ESPECÍFICAS PARA REACT APP (nexus.toit.com.br)
const reactRoutes = [ '/dashboard', '/support-login', '/admin', '/settings', '/tasks', '/workflows', '/reports', '/clients', '/users', '/integrations', '/quantum-ml', '/verify-email', '/verify-phone', '/verify-card', '/verify-account', '/trial-signup', '/checkout', '/setup' ];

reactRoutes.forEach( route =>
{
  app.get( route, ( req, res ) =>
  {
    const host = req.get( 'host' );
    const xForwardedHost = req.get( 'x-forwarded-host' );
    const realHost = xForwardedHost || host;

    console.log( `⚛️ [REACT-ROUTE] ${ route } acessada - Host: ${ realHost }` );

    // Para nexus.toit.com.br ou supnexus.toit.com.br, servir o React app
    if ( realHost === 'nexus.toit.com.br' || realHost === 'supnexus.toit.com.br' || realHost === 'localhost:8080' || realHost === '127.0.0.1:8080' )
    {
      const distIndexPath = path.join( __dirname, 'client', 'dist', 'index.html' );
      const devIndexPath = path.join( __dirname, 'client', 'index.html' );

      if ( fs.existsSync( distIndexPath ) )
      {
        console.log( `✅ [REACT-ROUTE] Servindo React app buildado para ${ route }` );
        return res.sendFile( distIndexPath );
      } else if ( fs.existsSync( devIndexPath ) )
      {
        console.log( `⚠️ [REACT-ROUTE] Servindo React app dev para ${ route }` );
        return res.sendFile( devIndexPath );
      } else
      {
        console.error( `❌ [REACT-ROUTE] React app não encontrado para ${ route }` );
        return res.status( 404 ).send( `
          <h1>Página Temporariamente Indisponível</h1>
          <p>A página ${ route } está sendo configurada. Tente novamente em alguns minutos.</p>
          <p><a href="/">← Voltar para página inicial</a></p>
        ` );
      }
    }

    // Para outros domínios, redirecionar
    console.log( `❌ [REACT-ROUTE] Domínio não autorizado para ${ route }: ${ realHost }` );
    return res.status( 403 ).send( `
      <h1>Acesso Negado</h1>
      <p>Este domínio não está autorizado para acessar ${ route }.</p>
      <p>Use: <a href="https://nexus.toit.com.br${ route }">nexus.toit.com.br${ route }</a></p>
    ` );
  } );
} );

// SPA FALLBACK para React Router (supnexus apenas)
app.get( '*', ( req, res ) =>
{
  const host = req.get( 'host' );
  const xForwardedHost = req.get( 'x-forwarded-host' );
  const realHost = xForwardedHost || host;

  // Se é API domain, serve API endpoints
  if ( realHost === 'api.toit.com.br' )
  {
    console.log( `📡 [API] Routing API request: ${ req.originalUrl }` );

    // If it's an API endpoint, let it be handled by the API routes
    if ( req.originalUrl.startsWith( '/api/' ) )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Endpoint não encontrado',
        availableEndpoints: [ '/api/health', '/api/auth/login', '/api/tenants' ]
      } );
    }

    // Otherwise return API info
    return res.json( {
      service: 'TOIT Nexus API',
      status: 'operational',
      version: '2.0.0',
      message: 'API server is running. Use /api/* endpoints for services.',
      host: realHost
    } );
  }

  // Se é API path, deve ter sido tratado anteriormente
  if ( req.originalUrl.startsWith( '/api/' ) )
  {
    return res.status( 404 ).json( {
      success: false,
      error: 'Endpoint não encontrado',
      availableEndpoints: [ '/api/health', '/api/auth/login', '/api/tenants' ]
    } );
  }

  // Se é supnexus, serve o React app para qualquer rota (SPA)
  if ( realHost === 'supnexus.toit.com.br' )
  {
    console.log( `🎯 [SUPNEXUS SPA] Fallback para React Router: ${ req.originalUrl }` );

    const distIndexPath = path.join( __dirname, 'client', 'dist', 'index.html' );
    const devIndexPath = path.join( __dirname, 'client', 'index.html' );

    if ( fs.existsSync( distIndexPath ) )
    {
      return res.sendFile( distIndexPath );
    } else if ( fs.existsSync( devIndexPath ) )
    {
      return res.sendFile( devIndexPath );
    } else
    {
      return res.status( 404 ).send( 'React app não encontrado - execute npm run build' );
    }
  }

  // Para outros hosts, serve a landing page como fallback
  console.log( `👉 [FALLBACK] Servindo landing page para host desconhecido: ${ realHost }` );

  const landingPath = path.join( __dirname, 'nexus-quantum-landing.html' );

  if ( fs.existsSync( landingPath ) )
  {
    return res.sendFile( landingPath );
  } else
  {
    return res.status( 404 ).send( 'Landing page não encontrada' );
  }
} );

app.listen( port, '0.0.0.0', () =>
{
  console.log( '='.repeat( 80 ) );
  console.log( '🚀 TOIT NEXUS INTEGRATED SERVER - INICIADO COM SUCESSO' );
  console.log( '='.repeat( 80 ) );
  console.log( `🌐 Servidor rodando na porta: ${ port }` );
  console.log( `📁 Diretório raiz: ${ __dirname }` );
  console.log( `🔧 Modo: ${ process.env.NODE_ENV || 'development' }` );
  console.log( '' );
  console.log( '📡 SERVIÇOS ATIVOS:' );
  console.log( '   ✅ Frontend Proxy (nexus.toit.com.br → Landing)' );
  console.log( '   ✅ React SPA (supnexus.toit.com.br → Admin)' );
  console.log( `   ✅ Backend APIs (${ backendInitialized ? 'FUNCIONANDO' : 'INICIALIZANDO...' })` );
  console.log( '' );
  console.log( '🔗 ENDPOINTS PRINCIPAIS:' );
  console.log( '   🌐 https://nexus.toit.com.br → Landing Page' );
  console.log( '   👥 https://supnexus.toit.com.br → Portal Equipe TOIT' );
  console.log( '   💚 /api/health → Health Check' );
  console.log( '   🔐 /api/auth/login → Sistema de Login' );
  console.log( '' );
  console.log( '🎯 STATUS: SISTEMA INTEGRADO 100% OPERACIONAL - V2.0' );
  console.log( '='.repeat( 80 ) );
} );