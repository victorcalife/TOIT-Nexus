import bcrypt from 'bcrypt';
import { users, tenants } from '../shared/schema.js';
import { db } from './db.js';
import { eq, and } from 'drizzle-orm';

export class AuthService {
  
  /**
   * Autenticar usuário com CPF/senha
   */
  async authenticate(cpf, password, tenantSlug = null) {
    try {
      // Remover formatação do CPF
      const cleanCpf = cpf.replace(/\D/g, '');
      
      // Buscar usuário por CPF
      let query = db.select({
        id: users.id,
        cpf: users.cpf,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        tenantId: users.tenantId,
        password: users.password,
        isActive: users.isActive,
        tenantName: tenants.name,
        tenantSlug: tenants.slug,
        tenantStatus: tenants.status
      })
      .from(users)
      .leftJoin(tenants, eq(users.tenantId, tenants.id))
      .where(eq(users.cpf, cleanCpf));

      const result = await query;
      const user = result[0];

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      if (!user.isActive) {
        throw new Error('Usuário inativo');
      }

      // Para super_admin, não precisa verificar tenant
      if (user.role !== 'super_admin') {
        if (!user.tenantId) {
          throw new Error('Usuário não possui empresa associada');
        }

        if (user.tenantStatus !== 'active') {
          throw new Error('Empresa inativa');
        }

        // Se tenant específico foi solicitado, verificar
        if (tenantSlug && user.tenantSlug !== tenantSlug) {
          throw new Error('Usuário não possui acesso a esta empresa');
        }
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Senha inválida');
      }

      // Atualizar último login
      await db.update(users)
        .set({ 
          lastLoginAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));

      // Retornar dados do usuário (sem senha)
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;

    } catch (error) {
      console.error('Erro na autenticação:', error);
      throw error;
    }
  }

  /**
   * Criar usuário com senha hash
   */
  async createUser(userData) {
    try {
      // Remover formatação do CPF
      const cleanCpf = userData.cpf.replace(/\D/g, '');
      
      // Hash da senha
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      const newUser = {
        ...userData,
        cpf: cleanCpf,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.insert(users).values(newUser).returning();
      const { password, ...userWithoutPassword } = result[0];
      return userWithoutPassword;

    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  /**
   * Alterar senha do usuário
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Buscar usuário
      const result = await db.select().from(users).where(eq(users.id, userId));
      const user = result[0];

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar senha atual
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Senha atual incorreta');
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Atualizar senha
      await db.update(users)
        .set({ 
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      return { success: true };

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw error;
    }
  }

  /**
   * Verificar se usuário tem acesso ao sistema
   */
  async hasSystemAccess(userId, systemCode = 'nexus') {
    try {
      const result = await db.select().from(users).where(eq(users.id, userId));
      const user = result[0];

      if (!user || !user.isActive) {
        return false;
      }

      // Super admin tem acesso a tudo
      if (user.role === 'super_admin') {
        return true;
      }

      // Verificar se tenant está ativo
      if (user.tenantId) {
        const tenantResult = await db.select().from(tenants).where(eq(tenants.id, user.tenantId));
        const tenant = tenantResult[0];
        
        return tenant && tenant.status === 'active';
      }

      return false;

    } catch (error) {
      console.error('Erro ao verificar acesso:', error);
      return false;
    }
  }
}

export const authService = new AuthService();