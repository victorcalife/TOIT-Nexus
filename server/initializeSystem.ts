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

    // 2. Verificar se Victor (único super admin) existe
    const adminCPF = '33656299803';
    let superAdmin;
    try {
      superAdmin = await storage.getUserByCPF(adminCPF);
      if (!superAdmin) {
        console.log("⚠️ SUPER ADMIN Victor não encontrado. Usuário deve ser criado via interface ou cadastro.");
        console.log("📝 Para criar: CPF 33656299803, Role: super_admin");
      } else {
        console.log("✅ Super Admin Victor encontrado e ativo");
      }
    } catch (error) {
      console.log("⚠️ Erro ao verificar Super Admin Victor:", error);
    }

    // Sistema limpo - sem dados de exemplo hardcoded
    console.log("🧹 Sistema inicializado sem dados de exemplo");

    console.log("🎉 Sistema inicializado com sucesso!");
    console.log("📋 ÚNICO SUPER ADMIN:");
    console.log("   Victor Calife - CPF: 33656299803, Senha: 241286");

  } catch (error) {
    console.error("❌ Erro inicializando sistema:", error);
  }
}