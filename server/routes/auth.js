/**
 * ROTAS DE AUTENTICAÇÃO
 * Módulo unificado para login, logout, sessões
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require('express');
const { authSystem } = require('../auth-unified');
const router = express.Router();

/**
 * POST /api/auth/login
 * Login com CPF e senha
 */
router.post('/login', async (req, res) => {
  try {
    const { cpf, password, tenantSlug } = req.body;

    if (!cpf || !password) {
      return res.status(400).json({
        success: false,
        error: 'CPF e senha são obrigatórios'
      });
    }

    // Autenticar usuário
    const user = await authSystem.authenticateUser(cpf, password, tenantSlug);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    // Gerar JWT
    const token = authSystem.generateJWT(user);

    // Configurar sessão se usando Passport
    if (req.login) {
      req.login(user, (err) => {
        if (err) {
          console.error('Erro ao configurar sessão:', err);
        }
      });
    }

    // Determinar redirecionamento
    let redirectUrl = '/dashboard';
    if (user.role === 'super_admin' || user.role === 'toit_admin') {
      redirectUrl = '/admin/dashboard';
    } else if (!user.tenantId) {
      redirectUrl = '/select-tenant';
    }

    res.json({
      success: true,
      token,
      user,
      redirectUrl,
      message: 'Login realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout e limpeza de sessão
 */
router.post('/logout', (req, res) => {
  try {
    // Limpar sessão se usando Passport
    if (req.logout) {
      req.logout((err) => {
        if (err) {
          console.error('Erro ao fazer logout:', err);
        }
      });
    }

    // Limpar sessão
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Erro ao destruir sessão:', err);
        }
      });
    }

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/auth/me
 * Verificar usuário atual
 */
router.get('/me', authSystem.optionalAuth(), (req, res) => {
  try {
    if (req.user) {
      res.json({
        success: true,
        user: req.user,
        authenticated: true
      });
    } else {
      res.status(401).json({
        success: false,
        authenticated: false,
        message: 'Não autenticado'
      });
    }
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/auth/check
 * Health check da autenticação
 */
router.get('/check', (req, res) => {
  res.json({
    success: true,
    service: 'auth',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/auth/verify-token
 * Verificar validade de token JWT
 */
router.post('/verify-token', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token é obrigatório'
      });
    }

    const decoded = authSystem.verifyJWT(token);
    
    if (decoded) {
      res.json({
        success: true,
        valid: true,
        decoded,
        expiresAt: new Date(decoded.exp * 1000)
      });
    } else {
      res.status(401).json({
        success: false,
        valid: false,
        error: 'Token inválido ou expirado'
      });
    }

  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/auth/refresh-token
 * Renovar token JWT
 */
router.post('/refresh-token', authSystem.requireAuth(), (req, res) => {
  try {
    // Gerar novo token
    const newToken = authSystem.generateJWT(req.user);

    res.json({
      success: true,
      token: newToken,
      user: req.user,
      message: 'Token renovado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao renovar token:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
