/**
 * SERVIDOR EXPRESS PRINCIPAL ROBUSTO
 * Sistema completo e unificado para TOIT Nexus
 * 100% JavaScript - SEM TYPESCRIPT
 */

// Carregar variáveis de ambiente - priorizar .env.local para desenvolvimento
const fs = require('fs');
const path = require('path');

// Verificar se existe .env.local e carregar primeiro
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('🔧 Carregando configurações de desenvolvimento (.env.local)');
  require('dotenv').config({ path: envLocalPath });
} else {
  console.log('🔧 Carregando configurações padrão (.env)');
  require('dotenv').config();
}
const express = require( 'express' );
const cors = require( 'cors' );
const helmet = require( 'helmet' );
const compression = require( 'compression' );
const cookieParser = require( 'cookie-parser' );
const rateLimit = require( 'express-rate-limit' );

// Importar configurações e sistemas
const { db } = require( './database-config' );
const { setupRoutes } = require( './routes/index' );

/**
 * CLASSE PRINCIPAL DO SERVIDOR
 */
class TOITNexusServer
{
  constructor()
  {
    this.app = express();
    this.port = process.env.PORT || 8080;
    this.environment = process.env.NODE_ENV || 'development';
    this.server = null;

    console.log( '🚀 Inicializando TOIT Nexus Server...' );
    console.log( `📍 Ambiente: ${ this.environment }` );
    console.log( `🔧 Porta: ${ this.port }` );
  }

  /**
   * CONFIGURAR MIDDLEWARES DE SEGURANÇA
   */
  setupSecurity()
  {
    console.log( '🛡️ Configurando segurança...' );

    // Helmet para headers de segurança
    this.app.use( helmet( {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [ "'self'" ],
          styleSrc: [ "'self'", "'unsafe-inline'", "https://fonts.googleapis.com" ],
          fontSrc: [ "'self'", "https://fonts.gstatic.com" ],
          imgSrc: [ "'self'", "data:", "https:" ],
          scriptSrc: [ "'self'", "'unsafe-inline'", "'unsafe-eval'" ],
          connectSrc: [ "'self'", "ws:", "wss:", "https:" ],
          objectSrc: [ "'none'" ],
          mediaSrc: [ "'self'" ],
          frameSrc: [ "'none'" ]
        }
      },
      crossOriginEmbedderPolicy: false
    } ) );

    // CORS configurado
    const corsOptions = {
      origin: ( origin, callback ) =>
      {
        const allowedOrigins = this.environment === 'production'
          ? [
            'https://nexus.toit.com.br',
            'https://supnexus.toit.com.br',
            'https://api.toit.com.br'
          ]
          : [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:8080',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:8080'
          ];

        // Permitir requisições sem origin (Postman, mobile apps, etc.)
        if ( !origin ) return callback( null, true );

        if ( allowedOrigins.includes( origin ) )
        {
          callback( null, true );
        } else
        {
          console.warn( `🚫 CORS bloqueado para origin: ${ origin }` );
          callback( new Error( 'Não permitido pelo CORS' ) );
        }
      },
      credentials: true,
      methods: [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS' ],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Cache-Control',
        'X-File-Name'
      ],
      exposedHeaders: [ 'X-Total-Count', 'X-Page-Count' ],
      maxAge: 86400 // 24 horas
    };

    this.app.use( cors( corsOptions ) );

    // Trust proxy para Railway/Heroku
    this.app.set( 'trust proxy', 1 );

    console.log( '✅ Segurança configurada' );
  }

  /**
   * CONFIGURAR MIDDLEWARES BÁSICOS
   */
  setupMiddlewares()
  {
    console.log( '🔧 Configurando middlewares...' );

    // Compressão
    this.app.use( compression() );

    // Cookie parser
    this.app.use( cookieParser() );

    // Rate limiting global
    const globalLimiter = rateLimit( {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: this.environment === 'production' ? 1000 : 10000, // Mais permissivo em dev
      message: {
        success: false,
        error: 'Muitas requisições. Tente novamente em 15 minutos.',
        code: 'RATE_LIMIT_EXCEEDED'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: ( req ) =>
      {
        // Pular rate limiting para health checks
        return req.path === '/api/health' || req.path === '/health';
      }
    } );

    this.app.use( '/api', globalLimiter );

    // Parsing de dados
    this.app.use( express.json( {
      limit: '50mb',
      verify: ( req, res, buf ) =>
      {
        // Salvar raw body para webhooks
        if ( req.path.includes( '/webhooks/' ) )
        {
          req.rawBody = buf;
        }
      }
    } ) );

    this.app.use( express.urlencoded( {
      extended: true,
      limit: '50mb'
    } ) );

    // Middleware de logging
    this.app.use( ( req, res, next ) =>
    {
      const start = Date.now();
      const requestId = Math.random().toString( 36 ).substr( 2, 9 );

      req.requestId = requestId;
      req.startTime = start;

      // Log da requisição
      console.log( `📥 [${ requestId }] ${ req.method } ${ req.path } - ${ req.ip }` );

      // Log da resposta
      const originalSend = res.send;
      res.send = function ( data )
      {
        const duration = Date.now() - start;
        console.log( `📤 [${ requestId }] ${ res.statusCode } - ${ duration }ms` );
        originalSend.call( this, data );
      };

      next();
    } );

    // Middleware para adicionar headers úteis
    this.app.use( ( req, res, next ) =>
    {
      res.setHeader( 'X-Powered-By', 'TOIT-Nexus' );
      res.setHeader( 'X-API-Version', '2.0.0' );
      res.setHeader( 'X-Request-ID', req.requestId );
      next();
    } );

    console.log( '✅ Middlewares configurados' );
  }

  /**
   * CONFIGURAR ROTAS
   */
  setupRoutes()
  {
    console.log( '🛣️ Configurando rotas...' );

    // Health check básico
    this.app.get( '/health', ( req, res ) =>
    {
      res.json( {
        success: true,
        service: 'TOIT Nexus',
        version: '2.0.0',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: this.environment,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        requestId: req.requestId
      } );
    } );

    // Rota raiz
    this.app.get( '/', ( req, res ) =>
    {
      res.json( {
        success: true,
        message: 'TOIT Nexus API está funcionando',
        version: '2.0.0',
        environment: this.environment,
        documentation: '/api/docs',
        health: '/health',
        timestamp: new Date().toISOString()
      } );
    } );

    // Configurar todas as rotas da API
    setupRoutes( this.app );

    // Servir arquivos estáticos (sempre, não apenas em produção)
    const clientPath = path.join( __dirname, '../client/dist' );

    console.log( `📁 Servindo arquivos estáticos de: ${ clientPath }` );

    this.app.use( express.static( clientPath, {
      maxAge: this.environment === 'production' ? '1d' : '0',
      etag: true,
      lastModified: true,
      index: false // Não servir index.html automaticamente
    } ) );

    // Catch-all para SPA (Single Page Application)
    this.app.get( '*', ( req, res ) =>
    {
      // Não interceptar rotas da API
      if ( req.path.startsWith( '/api/' ) )
      {
        return res.status( 404 ).json( {
          success: false,
          error: 'Endpoint da API não encontrado',
          code: 'API_NOT_FOUND',
          path: req.path
        } );
      }

      // Servir index.html para todas as outras rotas (SPA)
      const indexPath = path.join( clientPath, 'index.html' );
      console.log( `📄 Servindo SPA: ${ req.path } -> ${ indexPath }` );
      res.sendFile( indexPath );
    } );

    console.log( '✅ Rotas configuradas' );
  }

  /**
   * CONFIGURAR TRATAMENTO DE ERROS
   */
  setupErrorHandling()
  {
    console.log( '🛡️ Configurando tratamento de erros...' );

    // 404 para rotas não encontradas
    this.app.use( '*', ( req, res ) =>
    {
      res.status( 404 ).json( {
        success: false,
        error: 'Rota não encontrada',
        code: 'NOT_FOUND',
        path: req.originalUrl,
        method: req.method,
        requestId: req.requestId
      } );
    } );

    // Error handler global
    this.app.use( ( error, req, res, next ) =>
    {
      console.error( `💥 [ERROR] ${ req.requestId || 'unknown' } - ${ error.stack }` );

      // Erro de CORS
      if ( error.message.includes( 'CORS' ) )
      {
        return res.status( 403 ).json( {
          success: false,
          error: 'Acesso negado pelo CORS',
          code: 'CORS_ERROR',
          requestId: req.requestId
        } );
      }

      // Erro de parsing JSON
      if ( error.type === 'entity.parse.failed' )
      {
        return res.status( 400 ).json( {
          success: false,
          error: 'JSON inválido na requisição',
          code: 'INVALID_JSON',
          requestId: req.requestId
        } );
      }

      // Erro de limite de tamanho
      if ( error.code === 'LIMIT_FILE_SIZE' )
      {
        return res.status( 413 ).json( {
          success: false,
          error: 'Arquivo muito grande',
          code: 'FILE_TOO_LARGE',
          requestId: req.requestId
        } );
      }

      // Erro genérico
      const statusCode = error.statusCode || error.status || 500;

      res.status( statusCode ).json( {
        success: false,
        error: this.environment === 'production'
          ? 'Erro interno do servidor'
          : error.message,
        code: 'INTERNAL_ERROR',
        requestId: req.requestId,
        ...( this.environment === 'development' && {
          stack: error.stack,
          details: error
        } )
      } );
    } );

    console.log( '✅ Tratamento de erros configurado' );
  }

  /**
   * VERIFICAR CONEXÃO COM BANCO DE DADOS
   */
  async checkDatabase()
  {
    try
    {
      console.log( '🗄️ Verificando conexão com banco de dados...' );

      await db.connect();

      // Verificar integridade do banco
      const integrity = await db.checkIntegrity();

      if ( integrity.missingTables.length > 0 )
      {
        console.warn( '⚠️ Algumas tabelas estão faltando:', integrity.missingTables );
        console.log( '🔧 Executando migrations...' );
        await db.runMigrations();
      }

      console.log( '✅ Banco de dados conectado e verificado' );
      return true;
    } catch ( error )
    {
      console.error( '❌ Erro na conexão com banco de dados:', error.message );
      throw error;
    }
  }

  /**
   * CONFIGURAR GRACEFUL SHUTDOWN
   */
  setupGracefulShutdown()
  {
    const shutdown = async ( signal ) =>
    {
      console.log( `\n🛑 Recebido sinal ${ signal }. Iniciando shutdown graceful...` );

      if ( this.server )
      {
        this.server.close( async () =>
        {
          console.log( '🔒 Servidor HTTP fechado' );

          try
          {
            await db.close();
            console.log( '🗄️ Conexão com banco fechada' );
          } catch ( error )
          {
            console.error( '❌ Erro ao fechar banco:', error );
          }

          console.log( '✅ Shutdown completo' );
          process.exit( 0 );
        } );
      } else
      {
        process.exit( 0 );
      }
    };

    process.on( 'SIGTERM', () => shutdown( 'SIGTERM' ) );
    process.on( 'SIGINT', () => shutdown( 'SIGINT' ) );

    // Capturar erros não tratados
    process.on( 'uncaughtException', ( error ) =>
    {
      console.error( '💥 Erro não capturado:', error );
      shutdown( 'uncaughtException' );
    } );

    process.on( 'unhandledRejection', ( reason, promise ) =>
    {
      console.error( '💥 Promise rejeitada não tratada:', reason );
      shutdown( 'unhandledRejection' );
    } );
  }

  /**
   * INICIAR SERVIDOR
   */
  async start()
  {
    try
    {
      console.log( '🚀 Iniciando TOIT Nexus Server...' );

      // Verificar banco de dados
      await this.checkDatabase();

      // Configurar servidor
      this.setupSecurity();
      this.setupMiddlewares();
      this.setupRoutes();
      this.setupErrorHandling();
      this.setupGracefulShutdown();

      // Iniciar servidor
      this.server = this.app.listen( this.port, '0.0.0.0', () =>
      {
        console.log( '\n🎉 TOIT NEXUS SERVER INICIADO COM SUCESSO!' );
        console.log( '═══════════════════════════════════════════' );
        console.log( `🌐 URL: https://api.toit.com.br:${ this.port }` );
        console.log( `📊 Health: https://api.toit.com.br:${ this.port }/health` );
        console.log( `🔐 API: https://api.toit.com.br:${ this.port }` );
        console.log( `📋 Ambiente: ${ this.environment }` );
        console.log( '═══════════════════════════════════════════\n' );
      } );

      return this.server;

    } catch ( error )
    {
      console.error( '💥 Erro ao iniciar servidor:', error );
      process.exit( 1 );
    }
  }
}

// Iniciar servidor se executado diretamente
if ( require.main === module )
{
  const server = new TOITNexusServer();
  server.start();
}

module.exports = { TOITNexusServer };
