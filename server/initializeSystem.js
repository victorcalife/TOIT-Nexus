/**
 * INITIALIZE SYSTEM - JavaScript Puro
 * Inicialização do sistema TOIT NEXUS
 */

const { scrypt, randomBytes } = require("crypto");
const { promisify } = require("util");
const DatabaseService = require('./services/DatabaseService');

const scryptAsync = promisify(scrypt);
const db = new DatabaseService();

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function initializeSystem() {
  try {
    console.log("🚀 Inicializando sistema TOIT NEXUS...");

    // 1. Criar tenant padrão TOIT
    let toitTenant;
    try {
      const tenants = await db.query(`
        SELECT * FROM tenants WHERE domain = 'toit' LIMIT 1
      `);
      
      toitTenant = tenants[0];
      
      if (!toitTenant) {
        console.log("📝 Criando tenant TOIT...");
        await db.query(`
          INSERT INTO tenants (name, domain, status, created_at)
          VALUES (?, ?, ?, ?)
        `, ['TOIT - Administração', 'toit', 'active', new Date().toISOString()]);
        
        const newTenants = await db.query(`
          SELECT * FROM tenants WHERE domain = 'toit' LIMIT 1
        `);
        toitTenant = newTenants[0];
        console.log("✅ Tenant TOIT criado");
      } else {
        console.log("✅ Tenant TOIT já existe");
      }
    } catch (error) {
      console.error("❌ Erro ao criar tenant TOIT:", error);
    }

    // 2. Criar usuário Victor como super admin
    try {
      const users = await db.query(`
        SELECT * FROM users WHERE email = 'victorcalife@gmail.com' LIMIT 1
      `);
      
      if (users.length === 0) {
        console.log("👤 Criando usuário Victor...");
        const hashedPassword = await hashPassword('241286');
        
        await db.query(`
          INSERT INTO users (name, email, password, role, tenant_id, is_active, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          'Victor Calife',
          'victorcalife@gmail.com',
          hashedPassword,
          'super_admin',
          toitTenant?.id || 1,
          1,
          new Date().toISOString()
        ]);
        
        console.log("✅ Usuário Victor criado como super_admin");
      } else {
        console.log("✅ Usuário Victor já existe");
      }
    } catch (error) {
      console.error("❌ Erro ao criar usuário Victor:", error);
    }

    // 3. Criar planos de pagamento básicos
    try {
      const plans = await db.query(`
        SELECT * FROM payment_plans LIMIT 1
      `);
      
      if (plans.length === 0) {
        console.log("💳 Criando planos de pagamento...");
        
        const basicPlans = [
          ['plan_basic', 'Básico', 'Plano básico para pequenas empresas', 99.90, 'BRL', 'monthly', 1],
          ['plan_pro', 'Profissional', 'Plano profissional para empresas médias', 299.90, 'BRL', 'monthly', 1],
          ['plan_enterprise', 'Enterprise', 'Plano enterprise para grandes empresas', 999.90, 'BRL', 'monthly', 1]
        ];
        
        for (const plan of basicPlans) {
          await db.query(`
            INSERT INTO payment_plans (id, name, description, price, currency, interval, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, plan);
        }
        
        console.log("✅ Planos de pagamento criados");
      } else {
        console.log("✅ Planos de pagamento já existem");
      }
    } catch (error) {
      console.error("❌ Erro ao criar planos:", error);
    }

    console.log("🎉 Sistema TOIT NEXUS inicializado com sucesso!");
    
    return {
      success: true,
      tenant: toitTenant,
      message: "Sistema inicializado"
    };

  } catch (error) {
    console.error("❌ Erro na inicialização do sistema:", error);
    throw error;
  }
}

module.exports = { initializeSystem, hashPassword };
