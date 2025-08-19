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

    // 2. Verificar tenants existentes
    await checkExistingTenants();

    // 3. Verificar usuários existentes no banco
    await checkExistingUsers();

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
 * Verificar tenants existentes
 */
async function checkExistingTenants() {
  try {
    // Buscar todos os tenants
    const allTenants = await db.select().from(tenants);
    
    console.log(`🏢 Encontrados ${allTenants.length} tenants no banco de dados`);
    
    // Verificar tenant TOIT especificamente
    const toitTenant = allTenants.find(tenant => tenant.slug === 'toit');
    if (toitTenant) {
      console.log(`✅ Tenant TOIT encontrado - Status: ${toitTenant.status}`);
    } else {
      console.log('⚠️  Tenant TOIT não encontrado');
    }

  } catch (error) {
    console.error('Erro ao verificar tenants:', error);
    throw error;
  }
}

/**
 * Verificar usuários existentes no banco
 */
async function checkExistingUsers() {
  try {
    // Buscar todos os usuários no banco
    const allUsers = await db.select().from(users);
    
    console.log(`📊 Encontrados ${allUsers.length} usuários no banco de dados`);
    
    // Buscar super admins
    const superAdmins = allUsers.filter(user => user.role === 'super_admin');
    if (superAdmins.length > 0) {
      console.log(`👑 Super Admins encontrados: ${superAdmins.length}`);
    } else {
      console.log('⚠️  Nenhum Super Admin encontrado no sistema');
    }

    // Verificar usuário Victor especificamente
    const victor = allUsers.find(user => user.cpf === '33656299803');
    if (victor) {
      console.log(`✅ Victor Calife encontrado - Role: ${victor.role}`);
    } else {
      console.log('⚠️  Victor Calife não encontrado no sistema');
    }

  } catch (error) {
    console.error('Erro ao verificar usuários:', error);
    throw error;
  }
}

/**
 * Sistema limpo - sem dados demo
 */
async function createDemoData() {
  // Sistema limpo - sem dados hardcoded de demonstração
  console.log('🧹 Sistema configurado sem dados demo');
}

/**
 * Verificar integridade do sistema de auth
 */
export async function validateAuthSystem() {
  try {
    console.log('🔍 Validando sistema de autenticação...');

    // Verificar se super admin existe
    const superAdmin = await db.select().from(users).where(eq(users.cpf, '33656299803'));
    if (superAdmin.length === 0) {
      console.log('⚠️  Super admin Victor não encontrado no sistema');
      return false;
    }

    if (superAdmin[0].role !== 'super_admin') {
      console.log('⚠️  Usuário Victor encontrado mas não é super_admin');
      return false;
    }

    console.log('✅ Sistema de autenticação validado - Super Admin Victor ativo');
    return true;

  } catch (error) {
    console.error('❌ Erro na validação do sistema de auth:', error);
    throw error;
  }
}