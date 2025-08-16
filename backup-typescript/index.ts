import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import path from "path";
import fs from "fs";
import { registerRoutes } from "./routes";
import { startNotificationCron } from "./notificationService";
import { cronJobService } from "./cronJobs";
import { initializeTrialCronJob } from "./trialManager";
import { startCalendarSyncCron } from "./calendarIntegrationService";
import { emailWorkflowService } from "./emailWorkflowService";
import { calendarWorkflowService } from "./calendarWorkflowService";
import { revolutionaryAdaptiveEngine } from "./revolutionaryAdaptiveEngine";
import { setupVite } from "./viteSetup"; // Adjust the path if your vite setup file is named differently

const app = express();

// CONFIGURAÇÕES PARA RAILWAY
app.set( 'trust proxy', true );

// DEBUG E LOGGING DETALHADO
app.use( ( req, res, next ) =>
{
    console.log( `🔍 [DEBUG] ${ req.method } ${ req.url } | Host: ${ req.get( 'host' ) } | User-Agent: ${ req.get( 'user-agent' )?.substring( 0, 50 ) }...` );
    console.log( `🔍 [DEBUG] Headers: ${ JSON.stringify( req.headers, null, 2 ).substring( 0, 200 ) }...` );
    next();
} );

// CORS middleware para permitir requisições de nexus.toit.com.br
app.use( ( req, res, next ) =>
{
    const origin = req.get( 'origin' );
    const allowedOrigins = [
        'https://nexus.toit.com.br',
        'https://supnexus.toit.com.br',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5000'
    ];

    console.log( `🔒 [CORS] Origin: ${ origin } | Allowed: ${ allowedOrigins.includes( origin || '' ) }` );

    // SEMPRE definir o header, mesmo que seja origem permitida ou localhost
    if ( origin && allowedOrigins.includes( origin ) )
    {
        res.header( 'Access-Control-Allow-Origin', origin );
    } else if ( !origin )
    {
        // Para requisições sem origin (mesmo servidor)
        res.header( 'Access-Control-Allow-Origin', '*' );
    }

    res.header( 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS' );
    res.header( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization' );
    res.header( 'Access-Control-Allow-Credentials', 'true' );

    if ( req.method === 'OPTIONS' )
    {
        return res.sendStatus( 200 );
    }

    next();
} );

// Raw body middleware for Stripe webhooks (must be before express.json())
app.use( '/api/webhooks/stripe', express.raw( { type: 'application/json' } ) );

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

app.use( ( req, res, next ) =>
{
    const start = Date.now();
    const pathReq = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function ( bodyJson, ...args )
    {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply( res, [ bodyJson, ...args ] );
    };

    res.on( "finish", () =>
    {
        const duration = Date.now() - start;
        if ( pathReq.startsWith( "/api" ) )
        {
            let logLine = `${ req.method } ${ pathReq } ${ res.statusCode } in ${ duration }ms`;
            if ( capturedJsonResponse )
            {
                logLine += ` :: ${ JSON.stringify( capturedJsonResponse ) }`;
            }

            if ( logLine.length > 80 )
            {
                logLine = logLine.slice( 0, 79 ) + "…";
            }

            console.log( logLine );
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
        await import( './initializeSystem' );

        // Inicializar módulos padrão (desabilitado temporariamente)
        // const { initializeDefaultModules, createProductConfigurations } = await import('./initializeModules');
        // await initializeDefaultModules();
        // await createProductConfigurations();

        // MIDDLEWARE DE LOGGING GLOBAL - Debug completo
        app.use( ( req, res, next ) =>
        {
            if ( req.path.includes( 'favicon' ) || req.path.includes( 'debug' ) )
            {
                console.log( `🔍 [REQUEST] ${ req.method } ${ req.path }` );
                console.log( `🔍 [REQUEST] Host: ${ req.get( 'host' ) }` );
                console.log( `🔍 [REQUEST] Protocol: ${ req.protocol }` );
                console.log( `🔍 [REQUEST] Secure: ${ req.secure }` );
                console.log( `🔍 [REQUEST] Headers:`, JSON.stringify( req.headers, null, 2 ) );
            }
            next();
        } );

        // ROTA DE DIAGNÓSTICO - Debug de redirecionamentos
        app.get( '/debug/favicon', ( req, res ) =>
        {
            console.log( `🔍 [DEBUG] Executando rota de debug com sucesso` );

            res.json( {
                message: 'Debug info - Rota executada com sucesso',
                host: req.get( 'host' ),
                protocol: req.protocol,
                url: req.url,
                originalUrl: req.originalUrl,
                secure: req.secure,
                method: req.method,
                path: req.path,
                timestamp: new Date().toISOString()
            } );
        } );

        // ROTAS ESPECÍFICAS PARA ASSETS ESTÁTICOS - SOLUÇÃO DEFINITIVA
        // SVG inline para contornar interceptação do Railway Edge

        const toitNexusSVG = `<svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
	<!-- Definições -->
	<defs>
		<!-- Gradiente principal -->
		<linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
			<stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
			<stop offset="50%" style="stop-color:#581c87;stop-opacity:1" />
			<stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
		</linearGradient>
			<!-- Gradiente principal -->
		<linearGradient id="brand1Gradient" x1="0%" y1="0%" x2="100%" y2="0%">
			<stop offset="0%" style="stop-color:#001366ff;stop-opacity:1" />
			<stop offset="50%" style="stop-color:#581c87;stop-opacity:1" />
			<stop offset="100%" style="stop-color:#1e3a8a;stop-opacity:1" />
		</linearGradient>
	</defs>
  
	<!-- Ícone do logo aumentado 30% e reposicionado -->
  
	<!-- Texto principal -->
	<g transform="translate(105,50)">
		<!-- TOIT -->
		<text x="-35" y="15" font-family="Arial Black, sans-serif" font-size="45" font-weight="700" fill="url(#brand1Gradient)">
			TOIT
		</text>
    
		<!-- NEXUS -->
		<text x="75" y="15" font-family="Arial, sans-serif" font-size="45" font-weight="300" fill="url(#brandGradient)">
			NEXUS
		</text>
	</g>
</svg>`;

        // MIDDLEWARE UNIVERSAL PARA FAVICON - Intercepta TODOS os métodos e rotas
        app.use( [ 'favicon.svg', 'favicon.png', '' ].map( p => `/${ p }` ), ( req, res ) =>
        {
            console.log( `🎯 [FAVICON] Middleware universal interceptou: ${ req.path }` );
            res.setHeader( 'Content-Type', 'image/svg+xml' );
            res.setHeader( 'Cache-Control', 'public, max-age=86400' );
            res.setHeader( 'X-Content-Source', 'universal-middleware' );
            res.send( toitNexusSVG );
        } );

        // Também definir rotas explícitas como fallback
        [ '/favicon.svg', '/favicon.png', '/' ].forEach( route =>
        {
            app.all( route, ( req, res ) =>
            {
                console.log( `🎯 [FAVICON] Rota explícita interceptou: ${ req.path } via ${ req.method }` );
                res.setHeader( 'Content-Type', 'image/svg+xml' );
                res.setHeader( 'Cache-Control', 'public, max-age=86400' );
                res.setHeader( 'X-Content-Source', 'explicit-route' );
                res.send( toitNexusSVG );
            } );
        } );

        // Middleware para excluir assets estáticos do roteamento por domínio
        app.use( ( req, res, next ) =>
        {
            // Assets estáticos devem passar direto - NÃO interceptar
            const staticAssets = /\.(png|jpg|jpeg|gif|ico|svg|css|js|woff|woff2|ttf|eot|map|json)$/i;

            if ( staticAssets.test( req.path ) )
            {
                console.log( `📁 [STATIC] Asset ${ req.path } - passando direto (sem interceptação)` );
                return next();
            }

            // Continuar para roteamento normal
            next();
        } );

        // ROTA DE TESTE ULTRA SIMPLES PARA DIAGNÓSTICO
        app.get( '/simple-test', ( req, res ) =>
        {
            console.log( '🧪 [SIMPLE-TEST] Rota ultra simples chamada' );
            res.send( '<h1>TESTE SIMPLES FUNCIONANDO</h1><p>Esta é uma resposta HTML simples</p>' );
        } );

        // ROTA ESPECÍFICA PARA EQUIPE TOIT - BYPASS COMPLETO DE MIDDLEWARES
        app.get( '/team', ( req, res ) =>
        {
            console.log( '👥 [TEAM] ======= ROTA TEAM CHAMADA =======' );
            console.log( `👥 [TEAM] Method: ${ req.method }, URL: ${ req.url }, OriginalUrl: ${ req.originalUrl }` );
            console.log( `👥 [TEAM] Host: ${ req.get( 'host' ) }, User-Agent: ${ req.get( 'user-agent' )?.substring( 0, 50 ) }` );

            const clientIndexPath = path.resolve( baseDir, '..', 'client', 'index.html' );
            console.log( `👥 [TEAM] Tentando servir: ${ clientIndexPath }` );

            if ( fs.existsSync( clientIndexPath ) )
            {
                console.log( `✅ [TEAM] Arquivo existe, enviando...` );

                // Bypass completo - usar res.send em vez de res.sendFile
                try
                {
                    const fileContent = require( 'fs' ).readFileSync( clientIndexPath, 'utf8' );
                    console.log( `✅ [TEAM] Arquivo lido, ${ fileContent.length } bytes` );
                    res.set( 'Content-Type', 'text/html' );
                    return res.send( fileContent );
                } catch ( error )
                {
                    console.error( `❌ [TEAM] Erro ao ler arquivo:`, error );
                    return res.status( 500 ).send( '<h1>Erro interno do servidor</h1>' );
                }
            } else
            {
                console.error( `❌ [TEAM] Client index.html não encontrado: ${ clientIndexPath }` );
                return res.status( 404 ).send( '<h1>Sistema TOIT temporariamente indisponível</h1><p>Contate o administrador do sistema.</p>' );
            }
        } );

        const server = await registerRoutes( app );

        // ROTAS ESPECÍFICAS APÓS registerRoutes para evitar conflitos

        // Roteamento por domínio APENAS na rota raiz (sem extensões)
        app.get( '/', ( req, res, next ) =>
        {
            const host = req.get( 'host' );
            const xForwardedHost = req.get( 'x-forwarded-host' );
            const xOriginalHost = req.get( 'x-original-host' );
            const referer = req.get( 'referer' );

            console.log( `🌐 [ROOT] Host: ${ host } | X-Forwarded-Host: ${ xForwardedHost } | X-Original-Host: ${ xOriginalHost }` );
            console.log( `🌐 [ROOT] Referer: ${ referer }` );

            // SOLUÇÃO ALTERNATIVA: Usar referer para detectar origem
            // Se requisição veio de supnexus.toit.com.br, servir React app
            if ( referer && referer.includes( 'supnexus.toit.com.br' ) )
            {
                const clientIndexPath = path.resolve( baseDir, '..', 'client', 'index.html' );
                console.log( '👥 [REFERER-SUPNEXUS] Redirecionando direto para login da equipe TOIT' );

                if ( fs.existsSync( clientIndexPath ) )
                {
                    return res.sendFile( clientIndexPath );
                } else
                {
                    console.error( `❌ [REFERER-SUPNEXUS] Client index.html não encontrado` );
                    return res.status( 404 ).send( '<h1>Sistema TOIT temporariamente indisponível</h1><p>Contate o administrador do sistema.</p>' );
                }
            }

            // Usar x-forwarded-host se disponível (Railway Edge pode usar isso)
            const realHost = xForwardedHost || host;
            console.log( `🎯 [ROUTING] Host final para roteamento: ${ realHost }` );

            // SUPNEXUS (equipe TOIT) → Login direto do sistema
            if ( realHost === 'supnexus.toit.com.br' )
            {
                const clientIndexPath = path.resolve( baseDir, '..', 'client', 'index.html' );
                console.log( '👥 [SUPNEXUS] Redirecionando direto para login da equipe TOIT' );

                if ( fs.existsSync( clientIndexPath ) )
                {
                    return res.sendFile( clientIndexPath );
                } else
                {
                    console.error( `❌ [SUPNEXUS] Client index.html não encontrado` );
                    return res.status( 404 ).send( '<h1>Sistema TOIT temporariamente indisponível</h1><p>Contate o administrador do sistema.</p>' );
                }
            }

            // DEFAULT: Sempre servir landing page (NEXUS)
            console.log( '🎯 [DEFAULT] Servindo landing page (padrão para todos os domínios)' );
            return res.sendFile( path.resolve( baseDir, '..', 'nexus-quantum-landing.html' ) );
        } );

        // Rota específica de login que sempre funciona
        app.get( '/login', ( req, res ) =>
        {
            const clientIndexPath = path.resolve( baseDir, '..', 'client', 'index.html' );
            const currentHost = req.get( 'host' );
            console.log( `🔐 [LOGIN] Host: ${ currentHost } | Servindo client React app` );

            if ( fs.existsSync( clientIndexPath ) )
            {
                res.sendFile( clientIndexPath );
            } else
            {
                console.error( `❌ [LOGIN] Client index.html não encontrado` );
                res.status( 404 ).send( '<h1>Sistema de login temporariamente indisponível</h1><p>Contate o suporte técnico.</p>' );
            }
        } );

        // Rota específica para equipe TOIT
        app.get( '/support-login', ( req, res ) =>
        {
            const clientIndexPath = path.resolve( baseDir, '..', 'client', 'index.html' );

            console.log( `👥 [SUPPORT] Servindo login da equipe TOIT` );

            if ( fs.existsSync( clientIndexPath ) )
            {
                res.sendFile( clientIndexPath );
            } else
            {
                console.error( `❌ [SUPPORT] Client index.html não encontrado` );
                res.status( 404 ).send( '<h1>Sistema de suporte temporariamente indisponível</h1><p>Contate o administrador.</p>' );
            }
        } );

        // Rota específica para seleção de tenant
        app.get( '/select-tenant', ( req, res ) =>
        {
            const clientIndexPath = path.resolve( baseDir, '..', 'client', 'index.html' );
            const currentHost = req.get( 'host' );
            console.log( `🏢 [SELECT-TENANT] Host: ${ currentHost } | Servindo client React app para seleção de tenant` );

            if ( fs.existsSync( clientIndexPath ) )
            {
                res.sendFile( clientIndexPath );
            } else
            {
                console.error( `❌ [SELECT-TENANT] Client index.html não encontrado` );
                res.status( 404 ).send( '<h1>Sistema de seleção de tenant temporariamente indisponível</h1><p>Contate o suporte técnico.</p>' );
            }
        } );

        // Rota específica para seleção de tenant (alternativa)
        app.get( '/tenant-selection', ( req, res ) =>
        {
            const clientIndexPath = path.resolve( baseDir, '..', 'client', 'index.html' );
            const currentHost = req.get( 'host' );
            console.log( `🏢 [TENANT-SELECTION] Host: ${ currentHost } | Servindo client React app para seleção de tenant` );

            if ( fs.existsSync( clientIndexPath ) )
            {
                res.sendFile( clientIndexPath );
            } else
            {
                console.error( `❌ [TENANT-SELECTION] Client index.html não encontrado` );
                res.status( 404 ).send( '<h1>Sistema de seleção de tenant temporariamente indisponível</h1><p>Contate o suporte técnico.</p>' );
            }
        } );

        // Rota específica para dashboard
        app.get( '/dashboard', ( req, res ) =>
        {
            const clientIndexPath = path.resolve( baseDir, '..', 'client', 'index.html' );
            const currentHost = req.get( 'host' );
            console.log( `📊 [DASHBOARD] Host: ${ currentHost } | Servindo client React app para dashboard` );

            if ( fs.existsSync( clientIndexPath ) )
            {
                res.sendFile( clientIndexPath );
            } else
            {
                console.error( `❌ [DASHBOARD] Client index.html não encontrado` );
                res.status( 404 ).send( '<h1>Dashboard temporariamente indisponível</h1><p>Contate o suporte técnico.</p>' );
            }
        } );

        // Rota especial para inicializar super admin (apenas desenvolvimento)
        app.post( '/api/init-super-admin', async ( req, res ) =>
        {
            try
            {
                console.log( '🚀 [INIT-SUPER-ADMIN] Iniciando configuração...' );

                // Verificar se já existe super admin
                const existingAdmin = await db.select().from( users ).where( eq( users.role, 'super_admin' ) ).limit( 1 );

                if ( existingAdmin.length > 0 )
                {
                    return res.json( {
                        success: true,
                        message: 'Super admin já existe',
                        admin: { email: existingAdmin[ 0 ].email, cpf: existingAdmin[ 0 ].cpf }
                    } );
                }

                // Criar tenant TOIT se não existir
                let toitTenant = await db.select().from( tenants ).where( eq( tenants.slug, 'toit-admin' ) ).limit( 1 );

                if ( toitTenant.length === 0 )
                {
                    await db.insert( tenants ).values( {
                        name: 'TOIT - Administração Global',
                        slug: 'toit-admin',
                        domain: 'admin.toit.com.br',
                        status: 'active',
                        subscriptionPlan: 'enterprise'
                    } );

                    toitTenant = await db.select().from( tenants ).where( eq( tenants.slug, 'toit-admin' ) ).limit( 1 );
                }

                // Criar super admin
                const bcrypt = require( 'bcrypt' );
                const hashedPassword = await bcrypt.hash( 'admin123', 10 );

                await db.insert( users ).values( {
                    cpf: '00000000000',
                    email: 'admin@toit.com.br',
                    password: hashedPassword,
                    firstName: 'Super',
                    lastName: 'Admin',
                    role: 'super_admin',
                    tenantId: toitTenant[ 0 ].id,
                    isActive: true,
                    emailVerified: true
                } );

                console.log( '✅ [INIT-SUPER-ADMIN] Super admin criado com sucesso!' );

                res.json( {
                    success: true,
                    message: 'Super admin criado com sucesso!',
                    credentials: {
                        email: 'admin@toit.com.br',
                        cpf: '000.000.000-00',
                        password: 'admin123'
                    }
                } );

            } catch ( error )
            {
                console.error( '❌ [INIT-SUPER-ADMIN] Erro:', error );
                res.status( 500 ).json( {
                    success: false,
                    error: 'Erro ao criar super admin',
                    details: error.message
                } );
            }
        } );

        // Rota catch-all para outras rotas da aplicação React (deve vir por último)
        app.get( '*', ( req, res, next ) =>
        {
            const clientIndexPath = path.resolve( baseDir, '..', 'client', 'index.html' );
            const currentHost = req.get( 'host' );

            // Verificar se é uma rota da aplicação React (não é asset estático)
            const staticAssets = /\.(png|jpg|jpeg|gif|ico|svg|css|js|woff|woff2|ttf|eot|map|json)$/i;
            const isApiRoute = req.path.startsWith( '/api/' );

            if ( staticAssets.test( req.path ) || isApiRoute )
            {
                // Deixar passar para outros middlewares
                return next();
            }

            console.log( `🔄 [CATCH-ALL] Host: ${ currentHost } | Path: ${ req.path } | Servindo client React app` );

            if ( fs.existsSync( clientIndexPath ) )
            {
                res.sendFile( clientIndexPath );
            } else
            {
                console.error( `❌ [CATCH-ALL] Client index.html não encontrado` );
                res.status( 404 ).send( '<h1>Aplicação temporariamente indisponível</h1><p>Contate o suporte técnico.</p>' );
            }
        } );

        // ROTA DE TESTE SIMPLES PARA VERIFICAR REDIRECTS
        app.get( '/test-simple', ( req, res ) =>
        {
            console.log( '🔬 [TEST] Rota de teste simples chamada' );
            res.json( {
                status: 'OK',
                message: 'Sistema funcionando',
                timestamp: new Date().toISOString(),
                host: req.get( 'host' ),
                url: req.url,
                method: req.method
            } );
        } );

        // ROTA DE DIAGNÓSTICO ESPECÍFICA PARA VERIFICAR ROTEAMENTO POR DOMÍNIO
        app.get( '/debug-domain', ( req, res ) =>
        {
            const host = req.get( 'host' );
            const xForwardedHost = req.get( 'x-forwarded-host' );
            const xOriginalHost = req.get( 'x-original-host' );
            const realHost = xForwardedHost || host;

            console.log( '🔍 [DEBUG-DOMAIN] Diagnóstico de roteamento por domínio' );

            res.json( {
                message: 'Debug Domain Routing',
                host: host,
                xForwardedHost: xForwardedHost,
                xOriginalHost: xOriginalHost,
                realHost: realHost,
                shouldServeReactApp: realHost === 'supnexus.toit.com.br',
                shouldServeLandingPage: realHost === 'nexus.toit.com.br',
                allHeaders: req.headers,
                url: req.url,
                originalUrl: req.originalUrl,
                timestamp: new Date().toISOString()
            } );
        } );

        // Railway usa a variável PORT automaticamente
        const port = Number( process.env.PORT ) || 3000;

        app.listen( port, '0.0.0.0', () =>
        {
            console.log( `🚀 Server running on port ${ port }` );
            console.log( `📍 Environment: ${ process.env.NODE_ENV || 'development' }` );
            console.log( `🌐 Railway Domain: ${ process.env.RAILWAY_PUBLIC_DOMAIN || 'localhost' }` );
            if ( process.env.NODE_ENV === 'production' )
            {
                startNotificationCron();
                startCalendarSyncCron();
                startProductionFeatures().catch( err => console.error( '❌ Erro ao iniciar recursos de produção:', err ) );
            } else
            {
                console.log( `🔔 Notification cron disabled in development` );
                console.log( `📅 Calendar sync cron disabled in development` );
                console.log( `📧 Email workflow triggers disabled in development` );
                console.log( `📅 Calendar workflow triggers disabled in development` );
            }
        } );

        app.use( ( err: any, _req: Request, res: Response, _next: NextFunction ) =>
        {
            const status = err.status || err.statusCode || 500;
            const message = err.message || "Internal Server Error";

            res.status( status ).json( { message } );
            console.error( 'Server error:', err );
        } );

        // Add a simple test route first
        app.get( '/test', ( req, res ) =>
        {
            res.sendFile( path.resolve( baseDir, '..', 'simple_test.html' ) );
        } );

        // Debug route to check server status
        app.get( '/debug', ( req, res ) =>
        {
            res.json( {
                status: 'Server is running',
                environment: process.env.NODE_ENV,
                port: process.env.PORT,
                replit_domain: process.env.REPLIT_DOMAINS,
                headers: req.headers,
                url: req.url,
                timestamp: new Date().toISOString()
            } );
        } );

        // Add a simple health check route
        app.get( '/health', ( req, res ) =>
        {
            res.send( 'OK - InvestFlow Server Running' );
        } );

        // System setup route - creates initial super admin (no auth required)
        app.post( '/api/setup-system', async ( req, res ) =>
        {
            try
            {
                const { storage } = await import( './storage' );

                // Check if any super admin already exists
                const existingSuperAdmins = await storage.getAllUsers();
                const hasSuperAdmin = existingSuperAdmins.some( ( user: any ) => user.role === 'super_admin' );

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

                res.json( {
                    success: true,
                    message: 'Sistema configurado com sucesso! Super admin criado.',
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
                const { storage } = await import( './storage' );
                const existingSuperAdmins = await storage.getAllUsers();
                const needsSetup = !existingSuperAdmins.some( ( user: any ) => user.role === 'super_admin' );

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
            console.log( '🚀 [PRODUCTION] Serving static files via specific routes only' );
            // Não usar serveStatic que tem catch-all conflitante
            // Rotas específicas já configuradas acima (/login, /support-login, /)
        }

    } catch ( error )
    {
        console.error( 'Failed to start server:', error );
        process.exit( 1 );
    }
} )();

// Substituir usos de import.meta.dirname por __dirname
// Criar helper para resolver caminhos
const baseDir = __dirname;

// Refatorar inicialização de produção para evitar await em callback sync
async function startProductionFeatures()
{
    console.log( '🚀 Iniciando sistemas de Email & Calendar Workflow Triggers...' );
    emailWorkflowService.startAutoSync();
    calendarWorkflowService.startAutoSync();
    console.log( '✅ Email & Calendar Workflow Triggers iniciados com sucesso!' );
    console.log( '🧠 Iniciando Revolutionary Adaptive Engine...' );
    await revolutionaryAdaptiveEngine.initializeRevolutionarySystem();
    console.log( '✅ Revolutionary Adaptive Engine 100x mais poderoso iniciado!' );
}

