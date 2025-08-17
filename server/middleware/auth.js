const jwt = require('jsonwebtoken');
const DatabaseService = require('../services/DatabaseService');

const db = new DatabaseService();

/**
 * Middleware de autenticação JWT
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acesso requerido'
      });
    }

    // Verificar e decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_change_in_production');
    
    // Buscar usuário no banco
    const users = await db.query(`
      SELECT id, name, email, role, is_active, tenant_id
      FROM users 
      WHERE id = ? AND is_active = 1
    `, [decoded.userId]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado ou inativo'
      });
    }

    // Adicionar usuário ao request
    req.user = users[0];
    req.token = token;

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado'
      });
    }

    console.error('❌ Erro na autenticação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno de autenticação'
    });
  }
};

/**
 * Middleware para verificar roles específicos
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado - permissão insuficiente',
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
};

/**
 * Middleware para verificar se é admin
 */
const requireAdmin = (req, res, next) => {
  return requireRole(['admin', 'super_admin'])(req, res, next);
};

/**
 * Middleware para verificar se é super admin
 */
const requireSuperAdmin = (req, res, next) => {
  return requireRole(['super_admin'])(req, res, next);
};

/**
 * Middleware opcional de autenticação (não falha se não houver token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_change_in_production');
      
      const users = await db.query(`
        SELECT id, name, email, role, is_active, tenant_id
        FROM users 
        WHERE id = ? AND is_active = 1
      `, [decoded.userId]);

      if (users.length > 0) {
        req.user = users[0];
        req.token = token;
      }
    }

    next();

  } catch (error) {
    // Em caso de erro, continua sem autenticação
    next();
  }
};

/**
 * Gerar token JWT
 */
const generateToken = (user, expiresIn = '24h') => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_production',
    { expiresIn }
  );
};

/**
 * Verificar se token é válido
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_change_in_production');
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireSuperAdmin,
  optionalAuth,
  generateToken,
  verifyToken
};
