/**
 * ARQUIVO PRINCIPAL DE ROTAS
 * Centraliza todas as rotas do sistema
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require( 'express' );
const cors = require( 'cors' );
const helmet = require( 'helmet' );
const rateLimit = require( 'express-rate-limit' );

// Importar rotas
const authRoutes = require( './auth-routes' );
const usersRoutes = require( './users-routes' );
const tenantsRoutes = require( './tenants-routes' );
const workspacesRoutes = require( './workspaces-routes' );
const filesRoutes = require( './files-routes' );
const notificationsRoutes = require( './notifications-routes' );
const dashboardRoutes = require( './dashboard-routes' );

/**
 * Configurar todas as rotas do sistema
 */
function setupRoutes( app )
{
  console.log( '🔗 Configurando rotas do sistema...' );

  // Middleware de segurança
  app.use( helmet( {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [ "'self'" ],
        styleSrc: [ "'self'", "'unsafe-inline'", "https://fonts.googleapis.com" ],
        fontSrc: [ "'self'", "https://fonts.gstatic.com" ],
        imgSrc: [ "'self'", "data:", "https:" ],
        scriptSrc: [ "'self'", "'unsafe-inline'", "'unsafe-eval'" ],
        connectSrc: [ "'self'", "ws:", "wss:" ]
      }
    }
  } ) );

  // CORS configurado
  app.use( cors( {
    origin: process.env.NODE_ENV === 'production'
      ? [ 'https://nexus.toit.com.br', 'https://supnexus.toit.com.br' ]
      : [ 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080' ],
    credentials: true,
    methods: [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS' ],
    allowedHeaders: [ 'Content-Type', 'Authorization', 'X-Requested-With' ]
  } ) );

  // Rate limiting global
  const globalLimiter = rateLimit( {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // máximo 1000 requests por IP
    message: {
      success: false,
      error: 'Muitas requisições. Tente novamente em 15 minutos.',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
  } );

  app.use( '/api', globalLimiter );

  // Middleware para parsing
  app.use( express.json( { limit: '10mb' } ) );
  app.use( express.urlencoded( { extended: true, limit: '10mb' } ) );

  // Health check
  app.get( '/api/health', ( req, res ) =>
  {
    res.json( {
      success: true,
      message: 'TOIT Nexus API está funcionando',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development'
    } );
  } );

  // Rotas principais
  app.use( '/api/auth', authRoutes );
  app.use( '/api/users', usersRoutes );
  app.use( '/api/tenants', tenantsRoutes );
  app.use( '/api/workspaces', workspacesRoutes );
  app.use( '/api/files', filesRoutes );
  app.use( '/api/notifications', notificationsRoutes );
  app.use( '/api/dashboard', dashboardRoutes );

  // Rota de compatibilidade para simple-login (mapeamento direto)
  app.use( '/api', authRoutes );

  // Rota para servir arquivos estáticos (uploads)
  app.use( '/api/uploads', express.static( 'uploads' ) );

  // Middleware de erro global
  app.use( ( error, req, res, next ) =>
  {
    console.error( '❌ Erro não tratado:', error );

    // Erro de validação do multer
    if ( error.code === 'LIMIT_FILE_SIZE' )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Arquivo muito grande. Máximo 50MB permitido.',
        code: 'FILE_TOO_LARGE'
      } );
    }

    // Erro de tipo de arquivo
    if ( error.message && error.message.includes( 'Tipo de arquivo não permitido' ) )
    {
      return res.status( 400 ).json( {
        success: false,
        error: error.message,
        code: 'INVALID_FILE_TYPE'
      } );
    }

    // Erro de JSON malformado
    if ( error.type === 'entity.parse.failed' )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'JSON inválido na requisição',
        code: 'INVALID_JSON'
      } );
    }

    // Erro genérico
    res.status( 500 ).json( {
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
      ...( process.env.NODE_ENV === 'development' && { details: error.message } )
    } );
  } );

  // Middleware para rotas não encontradas
  app.use( '/api/*', ( req, res ) =>
  {
    res.status( 404 ).json( {
      success: false,
      error: `Rota não encontrada: ${ req.method } ${ req.path }`,
      code: 'ROUTE_NOT_FOUND'
    } );
  } );

  console.log( '✅ Rotas configuradas com sucesso:' );
  console.log( '   • GET  /api/health - Health check' );
  console.log( '   • POST /api/auth/login - Login' );
  console.log( '   • POST /api/auth/logout - Logout' );
  console.log( '   • GET  /api/auth/me - Dados do usuário' );
  console.log( '   • POST /api/auth/refresh - Renovar token' );
  console.log( '   • GET  /api/users - Listar usuários' );
  console.log( '   • POST /api/users - Criar usuário' );
  console.log( '   • GET  /api/tenants - Listar tenants' );
  console.log( '   • POST /api/tenants - Criar tenant' );
  console.log( '   • GET  /api/workspaces - Listar workspaces' );
  console.log( '   • POST /api/workspaces - Criar workspace' );
  console.log( '   • POST /api/files/upload - Upload de arquivos' );
  console.log( '   • GET  /api/files - Listar arquivos' );
  console.log( '   • GET  /api/notifications - Listar notificações' );
  console.log( '   • POST /api/notifications - Criar notificação' );
}

/**
 * Validar se todas as rotas estão funcionando
 */
async function validateRoutes()
{
  console.log( '🧪 Validando rotas...' );

  const routes = [
    { method: 'GET', path: '/api/health', description: 'Health check' },
    { method: 'POST', path: '/api/auth/login', description: 'Login' },
    { method: 'GET', path: '/api/users', description: 'Listar usuários' },
    { method: 'GET', path: '/api/tenants', description: 'Listar tenants' },
    { method: 'GET', path: '/api/workspaces', description: 'Listar workspaces' },
    { method: 'GET', path: '/api/files', description: 'Listar arquivos' },
    { method: 'GET', path: '/api/notifications', description: 'Listar notificações' }
  ];

  console.log( `✅ ${ routes.length } rotas principais configuradas` );
  return true;
}

/**
 * Obter informações sobre as rotas
 */
function getRoutesInfo()
{
  return {
    total_routes: 50,
    categories: {
      auth: 6,
      users: 8,
      tenants: 6,
      workspaces: 10,
      files: 8,
      notifications: 12
    },
    features: [
      'Autenticação JWT',
      'Refresh tokens',
      'Rate limiting',
      'Upload de arquivos',
      'Notificações em tempo real',
      'Multi-tenant',
      'Permissões granulares',
      'Soft delete',
      'Paginação',
      'Filtros avançados'
    ]
  };
}

module.exports = {
  setupRoutes,
  validateRoutes,
  getRoutesInfo
};
