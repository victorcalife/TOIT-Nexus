import { storage } from "./storage.js";

export async function initializeSystem() {
  try {
    console.log("🚀 Inicializando sistema TOIT NEXUS...");

    // 1. Verificar se já existem usuários
    const existingUsers = await storage.getAllUsers();
    if (existingUsers.length > 0) {
      console.log("✅ Sistema já inicializado - usuários existem");
      return;
    }

    // 2. Criar tenant padrão TOIT
    let toitTenant;
    try {
      const tenants = await storage.getAllTenants();
      toitTenant = tenants.find(t => t.slug === 'toit');
      
      if (!toitTenant) {
        toitTenant = await storage.createTenant({
          name: 'TOIT - Administração',
          slug: 'toit',
          status: 'active',
          isActive: true
        });
        console.log("✅ Tenant TOIT criado");
      }
    } catch (error) {
      console.log("⚠️ Erro ao criar tenant TOIT:", error.message);
    }

    // 3. Criar super admin padrão
    const adminCPF = '00000000000';
    try {
      const superAdmin = await storage.createUser({
        cpf: adminCPF,
        email: 'admin@toit.nexus',
        password: 'admin123', // Usando senha simples para teste
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        tenantId: null, // Super admin não pertence a tenant específico
        isActive: true
      });
      console.log("✅ Super Admin criado:", superAdmin.email);
    } catch (error) {
      console.log("⚠️ Erro ao criar super admin:", error.message);
    }

    // 4. Criar tenant admin de exemplo
    const tenantAdminCPF = '11111111111';
    try {
      const tenantAdmin = await storage.createUser({
        cpf: tenantAdminCPF,
        email: 'admin@cliente.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'Cliente',
        role: 'tenant_admin',
        tenantId: toitTenant?.id,
        isActive: true
      });
      console.log("✅ Tenant Admin criado:", tenantAdmin.email);
    } catch (error) {
      console.log("⚠️ Erro ao criar tenant admin:", error.message);
    }

    console.log("🎉 Sistema inicializado com sucesso!");
    console.log("👤 Credenciais de acesso:");
    console.log("   Super Admin: CPF 00000000000 / Senha admin123");
    console.log("   Tenant Admin: CPF 11111111111 / Senha admin123");

  } catch (error) {
    console.error("❌ Erro ao inicializar sistema:", error);
  }
}

// Auto-inicializar quando importado
initializeSystem();