import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function initializeSystem() {
  try {
    console.log("🚀 Inicializando sistema TOIT NEXUS...");

    // 1. Criar tenant padrão TOIT
    let toitTenant;
    try {
      toitTenant = await storage.getTenantBySlug('toit');
      if (!toitTenant) {
        toitTenant = await storage.createTenant({
          name: 'TOIT - Administração',
          slug: 'toit',
          settings: {
            allowMultipleTenants: true,
            systemAdmin: true
          },
          status: 'active'
        });
        console.log("✅ Tenant TOIT criado");
      }
    } catch (error) {
      console.log("⚠️ Tenant TOIT já existe ou erro:", error);
    }

    // 2. Criar super admin padrão
    const adminCPF = '00000000000';
    let superAdmin;
    try {
      superAdmin = await storage.getUserByCPF(adminCPF);
      if (!superAdmin) {
        const hashedPassword = await hashPassword('admin123');
        superAdmin = await storage.createUser({
          cpf: adminCPF,
          email: 'admin@toit.nexus',
          password: hashedPassword,
          firstName: 'Super',
          lastName: 'Admin',
          role: 'super_admin',
          tenantId: null, // Super admin não pertence a tenant específico
          isActive: true
        });
        console.log("✅ Super Admin criado - CPF: 00000000000, Senha: admin123");
      }
    } catch (error) {
      console.log("⚠️ Super Admin já existe ou erro:", error);
    }

    // 3. Criar tenant exemplo
    let exampleTenant;
    try {
      exampleTenant = await storage.getTenantBySlug('empresa-exemplo');
      if (!exampleTenant) {
        exampleTenant = await storage.createTenant({
          name: 'Empresa Exemplo Ltda',
          slug: 'empresa-exemplo',
          settings: {
            maxUsers: 50,
            features: ['query_builder', 'data_connections', 'reports']
          },
          status: 'active'
        });
        console.log("✅ Tenant exemplo criado");
      }
    } catch (error) {
      console.log("⚠️ Tenant exemplo já existe ou erro:", error);
    }

    // 4. Criar departamentos padrão para tenant exemplo
    if (exampleTenant) {
      try {
        const departments = [
          { name: 'Vendas', type: 'sales' },
          { name: 'Compras', type: 'purchases' },
          { name: 'Financeiro', type: 'finance' },
          { name: 'Operações', type: 'operations' },
          { name: 'TI', type: 'it' }
        ];

        for (const dept of departments) {
          try {
            await storage.createDepartment({
              tenantId: exampleTenant.id,
              name: dept.name,
              type: dept.type as any,
              description: `Departamento de ${dept.name}`,
              settings: {},
              dataFilters: {
                accessLevel: dept.type === 'finance' ? 'full' : 'departmental'
              },
              isActive: true
            });
          } catch (error) {
            // Departamento já existe
          }
        }
        console.log("✅ Departamentos padrão criados");
      } catch (error) {
        console.log("⚠️ Erro criando departamentos:", error);
      }
    }

    // 5. Criar usuário admin do tenant
    if (exampleTenant) {
      try {
        const tenantAdminCPF = '11111111111';
        const tenantAdmin = await storage.getUserByCPF(tenantAdminCPF);
        if (!tenantAdmin) {
          const hashedPassword = await hashPassword('admin123');
          await storage.createUser({
            cpf: tenantAdminCPF,
            email: 'admin@empresa-exemplo.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'Empresa',
            role: 'tenant_admin',
            tenantId: exampleTenant.id,
            isActive: true
          });
          console.log("✅ Admin do tenant criado - CPF: 11111111111, Senha: admin123");
        }
      } catch (error) {
        console.log("⚠️ Admin do tenant já existe ou erro:", error);
      }
    }

    // 6. Criar permissões básicas
    if (exampleTenant) {
      try {
        const basicPermissions = [
          { resource: 'clients', action: 'read' },
          { resource: 'clients', action: 'write' },
          { resource: 'reports', action: 'read' },
          { resource: 'reports', action: 'write' },
          { resource: 'workflows', action: 'read' },
          { resource: 'workflows', action: 'admin' },
          { resource: 'query_builder', action: 'read' },
          { resource: 'query_builder', action: 'write' },
          { resource: 'data_connections', action: 'read' },
          { resource: 'data_connections', action: 'admin' }
        ];

        for (const perm of basicPermissions) {
          try {
            await storage.createPermission({
              tenantId: exampleTenant.id,
              name: `${perm.resource}_${perm.action}`,
              resource: perm.resource,
              action: perm.action as any,
              description: `Permissão de ${perm.action} para ${perm.resource}`
            });
          } catch (error) {
            // Permissão já existe
          }
        }
        console.log("✅ Permissões básicas criadas");
      } catch (error) {
        console.log("⚠️ Erro criando permissões:", error);
      }
    }

    console.log("🎉 Sistema inicializado com sucesso!");
    console.log("📋 Credenciais de acesso:");
    console.log("   Super Admin - CPF: 00000000000, Senha: admin123");
    console.log("   Tenant Admin - CPF: 11111111111, Senha: admin123");

  } catch (error) {
    console.error("❌ Erro inicializando sistema:", error);
  }
}