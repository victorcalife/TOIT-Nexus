/**
 * VITE INTEGRATION
 * Configuração para servir arquivos estáticos e integração com Vite
 */

const express = require( 'express' );
const path = require( 'path' );

// __dirname já está disponível em CommonJS

/**
 * Configurar Vite para desenvolvimento
 */
async function setupVite( app )
{
  if ( process.env.NODE_ENV === 'development' )
  {
    try
    {
      const { createServer } = await import( 'vite' );
      const vite = await createServer( {
        server: { middlewareMode: true },
        appType: 'spa'
      } );

      app.use( vite.ssrFixStacktrace );
      app.use( vite.middlewares );

      console.log( '🔧 Vite middleware configurado para desenvolvimento' );
    } catch ( error )
    {
      console.log( '⚠️ Vite não disponível, usando arquivos estáticos' );
      serveStatic( app );
    }
  } else
  {
    serveStatic( app );
  }
}

/**
 * Servir arquivos estáticos
 */
function serveStatic( app )
{
  // Servir arquivos do build do cliente
  const clientDistPath = path.join( __dirname, '..', 'client', 'dist' );
  app.use( express.static( clientDistPath ) );

  // Fallback para SPA
  app.get( '*', ( req, res, next ) =>
  {
    // Se for uma rota de API, pular
    if ( req.path.startsWith( '/api/' ) )
    {
      return next();
    }

    // Servir index.html para rotas do frontend
    res.sendFile( path.join( clientDistPath, 'index.html' ) );
  } );

  console.log( '📁 Arquivos estáticos configurados' );
}

/**
 * Logger simples
 */
function log( message, level = 'info' )
{
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '📝';
  console.log( `${ prefix } [${ timestamp }] ${ message }` );
}

module.exports = {
  setupVite,
  serveStatic,
  log
};
