/**
 * INITIALIZE AUTH - JavaScript Puro
 * Inicialização do sistema de autenticação
 */

const DatabaseService = require('./services/DatabaseService');
const db = new DatabaseService();

async function initializeAuth() {
  try {
    console.log("🔐 Inicializando sistema de autenticação...");

    // Verificar se as tabelas de auth existem
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          sid TEXT PRIMARY KEY,
          sess TEXT NOT NULL,
          expire DATETIME NOT NULL
        )
      `);
      
      console.log("✅ Tabela de sessões verificada");
    } catch (error) {
      console.error("❌ Erro ao criar tabela de sessões:", error);
    }

    // Configurações de autenticação
    const authConfig = {
      jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key_change_in_production',
      sessionSecret: process.env.SESSION_SECRET || 'fallback_session_secret',
      tokenExpiration: '24h',
      refreshTokenExpiration: '7d'
    };

    console.log("✅ Sistema de autenticação inicializado");
    
    return {
      success: true,
      config: authConfig
    };

  } catch (error) {
    console.error("❌ Erro na inicialização da autenticação:", error);
    throw error;
  }
}

module.exports = { initializeAuth };
