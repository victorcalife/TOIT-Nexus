import { authService } from './authService.js';
import { db } from './db.js';
import { users, tenants } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Inicializar dados padrão de autenticação
 */
export async function initializeAuth() {
  try {
    console.log('🔐 Inicializando sistema de autenticação...');

    // 1. Executar migrations de performance
    const { runAuthMigrations } = await import('./migrations.js');
    await runAuthMigrations();

    // 2. Criar tenant TOIT (super admin)
    await createDefaultTenant();

    // 3. Criar usuário super_admin padrão
    await createSuperAdmin();

    // 4. Criar tenant e usuário demo
    await createDemoData();

    // 5. Validar sistema
    await validateAuthSystem();

    console.log('✅ Sistema de autenticação inicializado com sucesso');

  } catch (error) {
    console.error('❌ Erro ao inicializar sistema de autenticação:', error);
    throw error;
  }
}

/**
 * Criar tenant TOIT padrão
 */
async function createDefaultTenant() {
  try {
    // Verificar se já existe
    const existing = await db.select().from(tenants).where(eq(tenants.slug, 'toit'));
    
    if (existing.length === 0) {
      const toitTenant = {
        id: 'toit-enterprise',
        name: 'TOIT Enterprise',
        slug: 'toit',
        domain: 'toit.com.br',
        status: 'active',
        subscriptionPlan: 'enterprise',
        settings: {
          theme: 'dark',
          features: ['all'],
          maxUsers: null,
          maxStorage: null
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.insert(tenants).values(toitTenant);
      console.log('✅ Tenant TOIT criado');
    } else {
      console.log('ℹ️  Tenant TOIT já existe');
    }
  } catch (error) {
    console.error('Erro ao criar tenant TOIT:', error);
    throw error;
  }
}

/**
 * Criar usuário super_admin padrão
 */
async function createSuperAdmin() {
  try {
    // Verificar se já existe
    const existing = await db.select().from(users).where(eq(users.cpf, '33656299803'));
    
    if (existing.length === 0) {
      const superAdmin = {
        cpf: '33656299803',
        email: 'victor@toit.com.br',
        password: '15151515', // Será hasheada pelo authService
        firstName: 'Victor',
        lastName: 'Calife',
        phone: '+5511999999999',
        role: 'super_admin',
        tenantId: 'toit-enterprise',
        isActive: true
      };

      await authService.createUser(superAdmin);
      console.log('✅ Super Admin criado - Victor Calife - CPF: 33656299803 / Senha: 15151515');
    } else {
      console.log('ℹ️  Super Admin já existe');
    }
  } catch (error) {
    console.error('Erro ao criar super admin:', error);
    throw error;
  }
}

/**
 * Criar dados demo para teste
 */
async function createDemoData() {
  try {
    // Criar tenant demo
    const existingTenant = await db.select().from(tenants).where(eq(tenants.slug, 'demo'));
    
    if (existingTenant.length === 0) {
      const demoTenant = {
        id: 'demo-company',
        name: 'Demo Company',
        slug: 'demo',
        status: 'active',
        subscriptionPlan: 'business',
        settings: {
          theme: 'light',
          features: ['basic', 'workflows', 'reports'],
          maxUsers: 10,
          maxStorage: '100GB'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.insert(tenants).values(demoTenant);
      console.log('✅ Tenant Demo criado');
    }

    // Criar usuário tenant_admin demo
    const existingUser = await db.select().from(users).where(eq(users.cpf, '11111111111'));
    
    if (existingUser.length === 0) {
      const demoAdmin = {
        cpf: '11111111111',
        email: 'demo@demo.com',
        password: 'demo123', // Será hasheada pelo authService
        firstName: 'Demo',
        lastName: 'Admin',
        phone: '+5511888888888',
        role: 'tenant_admin',
        tenantId: 'demo-company',
        isActive: true
      };

      await authService.createUser(demoAdmin);
      console.log('✅ Demo Admin criado - CPF: 11111111111 / Senha: demo123');
    } else {
      console.log('ℹ️  Demo Admin já existe');
    }

    // Criar usuário employee demo
    const existingEmployee = await db.select().from(users).where(eq(users.cpf, '22222222222'));
    
    if (existingEmployee.length === 0) {
      const demoEmployee = {
        cpf: '22222222222',
        email: 'employee@demo.com',
        password: 'employee123', // Será hasheada pelo authService
        firstName: 'Demo',
        lastName: 'Employee',
        phone: '+5511777777777',
        role: 'employee',
        tenantId: 'demo-company',
        isActive: true
      };

      await authService.createUser(demoEmployee);
      console.log('✅ Demo Employee criado - CPF: 22222222222 / Senha: employee123');
    } else {
      console.log('ℹ️  Demo Employee já existe');
    }

  } catch (error) {
    console.error('Erro ao criar dados demo:', error);
    throw error;
  }
}

/**
 * Verificar integridade do sistema de auth
 */
export async function validateAuthSystem() {
  try {
    console.log('🔍 Validando sistema de autenticação...');

    // Verificar se super admin pode fazer login
    const superAdmin = await authService.authenticate('33656299803', '15151515');
    if (!superAdmin) {
      throw new Error('Super admin Victor Calife não consegue fazer login');
    }

    // Verificar se demo admin pode fazer login
    const demoAdmin = await authService.authenticate('11111111111', 'demo123');
    if (!demoAdmin) {
      throw new Error('Demo admin não consegue fazer login');
    }

    console.log('✅ Sistema de autenticação validado');
    return true;

  } catch (error) {
    console.error('❌ Erro na validação do sistema de auth:', error);
    throw error;
  }
}