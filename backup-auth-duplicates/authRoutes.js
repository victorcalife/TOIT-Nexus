import { Router } from 'express';
import { authService } from './authService.js';
import { requireAuth, requireSuperAdmin, optionalAuth } from './authMiddleware.js';

const router = Router();

/**
 * POST /api/auth/login
 * Login com CPF/senha
 */
router.post('/login', async (req, res) => {
  try {
    const { cpf, password, tenantSlug } = req.body;

    // Validações básicas
    if (!cpf || !password) {
      return res.status(400).json({
        error: 'CPF e senha são obrigatórios',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Tentar autenticar
    const user = await authService.authenticate(cpf, password, tenantSlug);

    // Criar sessão
    req.session.user = {
      id: user.id,
      cpf: user.cpf,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenantId,
      tenantName: user.tenantName,
      tenantSlug: user.tenantSlug
    };

    // Determinar redirect baseado no role
    let redirectTo = '/dashboard';
    if (user.role === 'super_admin') {
      redirectTo = '/admin/dashboard';
    } else if (user.role === 'tenant_admin') {
      redirectTo = '/admin/dashboard';
    } else {
      redirectTo = '/dashboard';
    }

    res.json({
      success: true,
      user: req.session.user,
      redirectTo,
      message: 'Login realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no login:', error);
    
    let statusCode = 401;
    let errorCode = 'AUTHENTICATION_FAILED';
    
    if (error.message.includes('não encontrado')) {
      errorCode = 'USER_NOT_FOUND';
    } else if (error.message.includes('inativo')) {
      errorCode = 'USER_INACTIVE';
    } else if (error.message.includes('senha')) {
      errorCode = 'INVALID_PASSWORD';
    } else if (error.message.includes('empresa')) {
      errorCode = 'TENANT_ISSUE';
    }

    res.status(statusCode).json({
      error: error.message,
      code: errorCode
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout do usuário
 */
router.post('/logout', requireAuth, (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Erro ao destruir sessão:', err);
        return res.status(500).json({
          error: 'Erro ao fazer logout',
          code: 'LOGOUT_FAILED'
        });
      }

      res.clearCookie('connect.sid');
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/auth/me
 * Obter dados do usuário logado
 */
router.get('/me', requireAuth, (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/auth/check
 * Verificar se usuário está autenticado
 */
router.get('/check', optionalAuth, (req, res) => {
  try {
    if (req.user) {
      res.json({
        authenticated: true,
        user: req.user
      });
    } else {
      res.json({
        authenticated: false
      });
    }
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/auth/change-password
 * Alterar senha do usuário logado
 */
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validações
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: 'Todos os campos são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: 'Nova senha e confirmação não conferem',
        code: 'PASSWORD_MISMATCH'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Nova senha deve ter pelo menos 6 caracteres',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    // Alterar senha
    await authService.changePassword(req.user.id, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    
    let statusCode = 400;
    let errorCode = 'PASSWORD_CHANGE_FAILED';
    
    if (error.message.includes('atual incorreta')) {
      errorCode = 'CURRENT_PASSWORD_INVALID';
    }

    res.status(statusCode).json({
      error: error.message,
      code: errorCode
    });
  }
});

/**
 * POST /api/auth/create-user
 * Criar novo usuário (apenas super admin)
 */
router.post('/create-user', requireSuperAdmin, async (req, res) => {
  try {
    const userData = req.body;

    // Validações básicas
    if (!userData.cpf || !userData.password || !userData.email) {
      return res.status(400).json({
        error: 'CPF, email e senha são obrigatórios',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Criar usuário
    const newUser = await authService.createUser(userData);

    res.json({
      success: true,
      user: newUser,
      message: 'Usuário criado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    
    let statusCode = 400;
    let errorCode = 'USER_CREATION_FAILED';
    
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      errorCode = 'USER_ALREADY_EXISTS';
    }

    res.status(statusCode).json({
      error: error.message,
      code: errorCode
    });
  }
});

export default router;