require( 'dotenv/config' );
const express = require( "express" );
const session = require( "express-session" );
const path = require( "path" );
const { setupRoutes } = require( "./routes-unified.js" );
const { setupVite, serveStatic, log } = require( "./vite.js" );
const paymentRoutes = require( "./paymentRoutes.js" );
const webhookRoutes = require( "./webhookRoutes.js" );
const { quantumActivator } = require( "./quantumSystemActivator.js" );

const app = express();


// Configure raw body processing for Stripe webhooks BEFORE other middleware
app.use( '/api/webhooks/stripe', express.raw( { type: 'application/json' } ) );

// Standard JSON middleware for other routes
app.use( express.json() );
app.use( express.urlencoded( { extended: false } ) );

// Configure session
app.use( session( {
  secret: process.env.SESSION_SECRET || 'development-secret-key-toit-nexus-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
} ) );

// Rota para servir a landing page
app.get( '/', ( req, res, next ) =>
{
  const hostname = req.hostname;

  // Se for o domínio principal, serve a nova landing page
  if ( hostname === 'nexus.toit.com.br' || hostname === 'localhost' )
  {
    return res.sendFile( path.join( __dirname, '..', 'client', 'public', 'nexus-landing-new.html' ) );
  }

  // Se for o domínio de suporte, redireciona para o login de suporte
  if ( hostname === 'supnexus.toit.com.br' )
  {
    return res.redirect( '/support-login' );
  }

  // Para qualquer outro caso, continua com o roteamento normal
  next();
} );

// Rota específica para login de suporte
app.get( '/support-login', ( req, res ) =>
{
  // Serve a aplicação React que irá renderizar o componente SupportLogin
  return res.sendFile( path.join( __dirname, '..', 'client', 'dist', 'index.html' ) );
} );

app.use( ( req, res, next ) =>
{
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function ( bodyJson, ...args )
  {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply( res, [ bodyJson, ...args ] );
  };

  res.on( "finish", () =>
  {
    const duration = Date.now() - start;
    if ( path.startsWith( "/api" ) )
    {
      let logLine = `${ req.method } ${ path } ${ res.statusCode } in ${ duration }ms`;
      if ( capturedJsonResponse )
      {
        logLine += ` :: ${ JSON.stringify( capturedJsonResponse ) }`;
      }

      if ( logLine.length > 80 )
      {
        logLine = logLine.slice( 0, 79 ) + "…";
      }

      log( logLine );
    }
  } );

  next();
} );

( async () =>
{
  try
  {
    // Inicializar sistema e módulos
    console.log( '🚀 Inicializando sistema TOIT NEXUS...' );

    // Executar migrations automaticamente
    console.log( '🗄️  Executando database migrations...' );
    try
    {
      const { DatabaseManager } = require( './database-config' );
      const dbManager = new DatabaseManager();
      await dbManager.runMigrations();
      console.log( '✅ Migrations executadas com sucesso' );
    } catch ( error )
    {
      console.warn( '⚠️  Erro ao executar migrations:', error.message );
      console.log( 'Continuando sem migrations - assumindo tabelas já existem' );
    }

    await import( './initializeSystem.js' );


    // Inicializar sistema de autenticação
    console.log( '🔐 Inicializando sistema de autenticação...' );
    const { initializeAuth } = await import( './initializeAuth.js' );
    await initializeAuth();

    // Register authentication routes FIRST (highest priority)
    const authRoutes = require( './routes/auth.js' );
    app.use( '/api/auth', authRoutes );

    // Register tenant user routes
    const tenantUserRoutes = require( './tenantUserRoutes' );
    app.use( '/api/users', tenantUserRoutes );

    // Quantum System Status Endpoint
    app.get( '/api/quantum/status', async ( req, res ) =>
    {
      try
      {
        console.log( '⚛️ [QUANTUM-STATUS] Verificando status do sistema quântico...' );
        const status = await quantumActivator.checkQuantumSystemStatus();
        res.json( {
          success: true,
          status: 'active',
          timestamp: new Date().toISOString(),
          quantum: status,
          message: 'Sistema quântico TOIT NEXUS operacional'
        } );
      } catch ( error )
      {
        console.error( '❌ [QUANTUM-STATUS] Erro:', error );
        res.status( 500 ).json( {
          success: false,
          status: 'error',
          timestamp: new Date().toISOString(),
          error: error.message,
          message: 'Erro no sistema quântico'
        } );
      }
    } );

    // Quantum System Activation Endpoint
    app.post( '/api/quantum/activate', async ( req, res ) =>
    {
      try
      {
        console.log( '🚀 [QUANTUM-ACTIVATE] Ativando sistema quântico...' );
        const result = await quantumActivator.activateQuantumSystem();
        res.json( {
          success: true,
          status: 'activated',
          timestamp: new Date().toISOString(),
          result,
          message: 'Sistema quântico ativado com sucesso'
        } );
      } catch ( error )
      {
        console.error( '❌ [QUANTUM-ACTIVATE] Erro:', error );
        res.status( 500 ).json( {
          success: false,
          status: 'error',
          timestamp: new Date().toISOString(),
          error: error.message,
          message: 'Falha na ativação do sistema quântico'
        } );
      }
    } );

    // Register payment and webhook routes
    app.use( '/api/payment', paymentRoutes );
    app.use( '/api/webhooks', webhookRoutes );

    // Register MILA AI Assistant routes
    const milaRoutes = await import( './milaRoutes.js' );
    app.use( '/api/mila', milaRoutes.default );

    // Register other routes after
    const server = await setupRoutes( app );

    app.use( ( err, _req, res, _next ) =>
    {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status( status ).json( { message } );
      console.error( 'Server error:', err );
    } );

    // Add a simple test route first
    app.get( '/test', ( req, res ) =>
    {
      res.sendFile( path.resolve( process.cwd(), 'simple_test.html' ) );
    } );

    // Debug route to check server status
    app.get( '/debug', ( req, res ) =>
    {
      res.json( {
        status: 'Server is running',
        environment: process.env.NODE_ENV,
        port: process.env.PORT,
        railway_domain: process.env.RAILWAY_PUBLIC_DOMAIN,
        headers: req.headers,
        url: req.url,
        timestamp: new Date().toISOString()
      } );
    } );

    // Add a simple health check route
    app.get( '/health', ( req, res ) =>
    {
      res.send( 'OK - TOIT NEXUS Server Running' );
    } );



    // Payment system health check
    app.get( '/api/payment/health', ( req, res ) =>
    {
      const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
      res.json( {
        status: 'Payment system ready',
        stripe_configured: stripeConfigured,
        timestamp: new Date().toISOString()
      } );
    } );

    // System setup route - creates initial super admin (no auth required)
    app.post( '/api/setup-system', async ( req, res ) =>
    {
      try
      {
        const { storage } = await import( './storage.js' );

        // Check if any super admin already exists
        const existingSuperAdmins = await storage.getAllUsers();
        const hasSuperAdmin = existingSuperAdmins.some( user => user.role === 'super_admin' );

        if ( hasSuperAdmin )
        {
          return res.status( 400 ).json( {
            error: 'Sistema já foi configurado. Super admin já existe.'
          } );
        }

        const { email, firstName, lastName, password } = req.body;

        if ( !email || !firstName || !lastName || !password )
        {
          return res.status( 400 ).json( {
            error: 'Dados obrigatórios: email, firstName, lastName, password'
          } );
        }

        const superAdmin = await storage.upsertUser( {
          cpf: `super_admin_${ Date.now() }`,
          password,
          email,
          firstName,
          lastName,
          role: 'super_admin',
          tenantId: null,
          isActive: true,
        } );

        // Initialize default payment plans
        try
        {
          const { paymentService } = await import( './paymentService.js' );
          const plans = await paymentService.createDefaultPlans();
          console.log( `✅ ${ plans.length } planos de pagamento padrão criados` );
        } catch ( error )
        {
          console.warn( '⚠️  Erro ao criar planos padrão:', error.message );
          // Continue without failing the setup
        }

        res.json( {
          success: true,
          message: 'Sistema configurado com sucesso! Super admin criado e planos de pagamento inicializados.',
          user: {
            id: superAdmin.id,
            email: superAdmin.email,
            role: superAdmin.role
          }
        } );
      } catch ( error )
      {
        console.error( 'Error setting up system:', error );
        res.status( 500 ).json( { error: 'Falha ao configurar sistema' } );
      }
    } );

    // Check if system needs setup
    app.get( '/api/setup-status', async ( req, res ) =>
    {
      try
      {
        const { storage } = await import( './storage.js' );
        const existingSuperAdmins = await storage.getAllUsers();
        const needsSetup = !existingSuperAdmins.some( user => user.role === 'super_admin' );

        res.json( { needsSetup } );
      } catch ( error )
      {
        console.error( 'Error checking setup status:', error );
        res.status( 500 ).json( { error: 'Falha ao verificar status do sistema' } );
      }
    } );


    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if ( app.get( "env" ) === "development" )
    {
      await setupVite( app, server );
    } else
    {
      serveStatic( app );
    }

    // Inicializar WebSocket Service
    const WebSocketService = require( './websocketService' );
    const wsService = new WebSocketService( server );

    // Disponibilizar WebSocket service globalmente
    app.set( 'wsService', wsService );

    console.log( '🔌 WebSocket Service inicializado' );

  } catch ( error )
  {
    console.error( 'Failed to start server:', error );
    process.exit( 1 );
  }
} )();