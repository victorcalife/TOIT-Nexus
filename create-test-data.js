/**
 * Script para criar dados de teste no TOIT NEXUS
 * Executa: node create-test-data.js
 */

import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

// Simulador de banco em memória para desenvolvimento local
const mockDatabase = {
  tenants: [],
  users: [],
  departments: [],
  clients: []
};

/**
 * Criar dados de teste completos
 */
async function createTestData() {
  console.log('🧪 Criando dados de teste para TOIT NEXUS...\n');

  try {
    // 1. EMPRESAS (TENANTS)
    console.log('🏢 Criando empresas...');
    await createTenants();

    // 2. USUÁRIOS
    console.log('👥 Criando usuários...');
    await createUsers();

    // 3. DEPARTAMENTOS
    console.log('🏛️ Criando departamentos...');
    await createDepartments();

    // 4. CLIENTES
    console.log('📞 Criando clientes...');
    await createClients();

    // 5. EXIBIR RESUMO
    displaySummary();

    console.log('\n✅ Dados de teste criados com sucesso!');
    console.log('📁 Dados salvos em: mock-database.json');

    // Salvar em arquivo para importação
    await saveToFile();

  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error);
    process.exit(1);
  }
}

/**
 * Criar empresas (tenants)
 */
async function createTenants() {
  const tenants = [
    // 1. TOIT Enterprise (super admin)
    {
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
    },
    
    // 2. Tech Solutions Ltda (empresa cliente)
    {
      id: 'tech-solutions',
      name: 'Tech Solutions Ltda',
      slug: 'tech-solutions',
      domain: 'techsolutions.com.br',
      status: 'active',
      subscriptionPlan: 'business',
      settings: {
        theme: 'light',
        features: ['workflows', 'reports', 'task-management'],
        maxUsers: 25,
        maxStorage: '500GB'
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // 3. Inovação Digital (empresa cliente)
    {
      id: 'inovacao-digital',
      name: 'Inovação Digital',
      slug: 'inovacao-digital',
      domain: 'inovacaodigital.com.br',
      status: 'active',
      subscriptionPlan: 'professional',
      settings: {
        theme: 'blue',
        features: ['basic', 'workflows', 'reports'],
        maxUsers: 15,
        maxStorage: '250GB'
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // 4. StartUp Nexus (empresa cliente)
    {
      id: 'startup-nexus',
      name: 'StartUp Nexus',
      slug: 'startup-nexus',
      domain: 'startupnexus.com.br',
      status: 'active',
      subscriptionPlan: 'starter',
      settings: {
        theme: 'purple',
        features: ['basic', 'task-management'],
        maxUsers: 5,
        maxStorage: '50GB'
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  for (const tenant of tenants) {
    mockDatabase.tenants.push(tenant);
    console.log(`  ✅ ${tenant.name} (${tenant.subscriptionPlan})`);
  }
}

/**
 * Criar usuários
 */
async function createUsers() {
  const users = [
    // SUPER ADMIN - TOIT
    {
      id: nanoid(),
      cpf: '00000000000',
      email: 'admin@toit.com.br',
      passwordHash: await bcrypt.hash('admin123', 10),
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+5511999999999',
      role: 'super_admin',
      tenantId: 'toit-enterprise',
      departmentId: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // TENANT ADMIN - TECH SOLUTIONS
    {
      id: nanoid(),
      cpf: '11111111111',
      email: 'admin@techsolutions.com.br',
      passwordHash: await bcrypt.hash('admin123', 10),
      firstName: 'Carlos',
      lastName: 'Silva',
      phone: '+5511888888888',
      role: 'tenant_admin',
      tenantId: 'tech-solutions',
      departmentId: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // MANAGER - TECH SOLUTIONS
    {
      id: nanoid(),
      cpf: '22222222222',
      email: 'manager@techsolutions.com.br',
      passwordHash: await bcrypt.hash('manager123', 10),
      firstName: 'Ana',
      lastName: 'Santos',
      phone: '+5511777777777',
      role: 'manager',
      tenantId: 'tech-solutions',
      departmentId: null, // será atribuído depois
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // EMPLOYEE - TECH SOLUTIONS
    {
      id: nanoid(),
      cpf: '33333333333',
      email: 'funcionario@techsolutions.com.br',
      passwordHash: await bcrypt.hash('func123', 10),
      firstName: 'João',
      lastName: 'Oliveira',
      phone: '+5511666666666',
      role: 'employee',
      tenantId: 'tech-solutions',
      departmentId: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // TENANT ADMIN - INOVAÇÃO DIGITAL
    {
      id: nanoid(),
      cpf: '44444444444',
      email: 'admin@inovacaodigital.com.br',
      passwordHash: await bcrypt.hash('inova123', 10),
      firstName: 'Maria',
      lastName: 'Costa',
      phone: '+5511555555555',
      role: 'tenant_admin',
      tenantId: 'inovacao-digital',
      departmentId: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // MANAGER - INOVAÇÃO DIGITAL
    {
      id: nanoid(),
      cpf: '55555555555',
      email: 'gerente@inovacaodigital.com.br',
      passwordHash: await bcrypt.hash('gerente123', 10),
      firstName: 'Pedro',
      lastName: 'Rodrigues',
      phone: '+5511444444444',
      role: 'manager',
      tenantId: 'inovacao-digital',
      departmentId: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // TENANT ADMIN - STARTUP NEXUS
    {
      id: nanoid(),
      cpf: '66666666666',
      email: 'founder@startupnexus.com.br',
      passwordHash: await bcrypt.hash('startup123', 10),
      firstName: 'Lucas',
      lastName: 'Fernandes',
      phone: '+5511333333333',
      role: 'tenant_admin',
      tenantId: 'startup-nexus',
      departmentId: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // EMPLOYEE - STARTUP NEXUS
    {
      id: nanoid(),
      cpf: '77777777777',
      email: 'dev@startupnexus.com.br',
      passwordHash: await bcrypt.hash('dev123', 10),
      firstName: 'Julia',
      lastName: 'Mendes',
      phone: '+5511222222222',
      role: 'employee',
      tenantId: 'startup-nexus',
      departmentId: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  for (const user of users) {
    mockDatabase.users.push(user);
    console.log(`  ✅ ${user.firstName} ${user.lastName} (${user.role}) - CPF: ${user.cpf}`);
  }
}

/**
 * Criar departamentos
 */
async function createDepartments() {
  const departments = [
    // TECH SOLUTIONS
    {
      id: nanoid(),
      name: 'TI e Desenvolvimento',
      description: 'Departamento de tecnologia e desenvolvimento de software',
      tenantId: 'tech-solutions',
      managerId: null, // será atribuído depois
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: nanoid(),
      name: 'Comercial',
      description: 'Departamento comercial e vendas',
      tenantId: 'tech-solutions',
      managerId: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: nanoid(),
      name: 'Administrativo',
      description: 'Departamento administrativo e financeiro',
      tenantId: 'tech-solutions',
      managerId: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // INOVAÇÃO DIGITAL
    {
      id: nanoid(),
      name: 'Inovação',
      description: 'Departamento de pesquisa e desenvolvimento',
      tenantId: 'inovacao-digital',
      managerId: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: nanoid(),
      name: 'Projetos',
      description: 'Departamento de gestão de projetos',
      tenantId: 'inovacao-digital',
      managerId: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // STARTUP NEXUS
    {
      id: nanoid(),
      name: 'Produto',
      description: 'Departamento de desenvolvimento de produto',
      tenantId: 'startup-nexus',
      managerId: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  for (const dept of departments) {
    mockDatabase.departments.push(dept);
    console.log(`  ✅ ${dept.name} (${dept.tenantId})`);
  }
}

/**
 * Criar clientes
 */
async function createClients() {
  const clients = [
    // CLIENTES TECH SOLUTIONS
    {
      id: nanoid(),
      name: 'Empresa ABC Ltda',
      email: 'contato@empresaabc.com.br',
      phone: '+5511987654321',
      cpfCnpj: '12.345.678/0001-90',
      type: 'empresa',
      address: 'Rua das Flores, 123 - São Paulo/SP',
      tenantId: 'tech-solutions',
      assignedUserId: null,
      status: 'ativo',
      notes: 'Cliente estratégico com potencial de crescimento',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: nanoid(),
      name: 'João da Silva',
      email: 'joao.silva@email.com',
      phone: '+5511876543210',
      cpfCnpj: '123.456.789-00',
      type: 'pessoa_fisica',
      address: 'Av. Principal, 456 - Rio de Janeiro/RJ',
      tenantId: 'tech-solutions',
      assignedUserId: null,
      status: 'ativo',
      notes: 'Cliente pessoa física interessado em consultoria',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: nanoid(),
      name: 'Inovação Corp',
      email: 'contato@inovacaocorp.com.br',
      phone: '+5511765432109',
      cpfCnpj: '98.765.432/0001-10',
      type: 'empresa',
      address: 'Rua da Tecnologia, 789 - Belo Horizonte/MG',
      tenantId: 'tech-solutions',
      assignedUserId: null,
      status: 'prospecto',
      notes: 'Prospecto com interesse em soluções enterprise',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // CLIENTES INOVAÇÃO DIGITAL
    {
      id: nanoid(),
      name: 'Startup X',
      email: 'hello@startupx.com.br',
      phone: '+5511654321098',
      cpfCnpj: '11.222.333/0001-44',
      type: 'empresa',
      address: 'Hub de Inovação, 100 - Florianópolis/SC',
      tenantId: 'inovacao-digital',
      assignedUserId: null,
      status: 'ativo',
      notes: 'Startup em crescimento acelerado',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: nanoid(),
      name: 'Maria Fernanda',
      email: 'maria.fernanda@email.com',
      phone: '+5511543210987',
      cpfCnpj: '987.654.321-00',
      type: 'pessoa_fisica',
      address: 'Rua dos Empreendedores, 200 - Porto Alegre/RS',
      tenantId: 'inovacao-digital',
      assignedUserId: null,
      status: 'ativo',
      notes: 'Empreendedora individual buscando digitalização',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // CLIENTES STARTUP NEXUS
    {
      id: nanoid(),
      name: 'Tech Boost',
      email: 'team@techboost.com.br',
      phone: '+5511432109876',
      cpfCnpj: '55.666.777/0001-88',
      type: 'empresa',
      address: 'Distrito Tecnológico, 300 - Recife/PE',
      tenantId: 'startup-nexus',
      assignedUserId: null,
      status: 'ativo',
      notes: 'Aceleradora de startups parceira',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: nanoid(),
      name: 'Carlos Eduardo',
      email: 'carlos.eduardo@email.com',
      phone: '+5511321098765',
      cpfCnpj: '456.789.123-00',
      type: 'pessoa_fisica',
      address: 'Av. da Inovação, 400 - Brasília/DF',
      tenantId: 'startup-nexus',
      assignedUserId: null,
      status: 'prospecto',
      notes: 'Investidor interessado em soluções tech',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  for (const client of clients) {
    mockDatabase.clients.push(client);
    console.log(`  ✅ ${client.name} (${client.type}) - ${client.tenantId}`);
  }
}

/**
 * Exibir resumo dos dados criados
 */
function displaySummary() {
  console.log('\n📊 RESUMO DOS DADOS CRIADOS:');
  console.log('================================');
  console.log(`🏢 Empresas: ${mockDatabase.tenants.length}`);
  console.log(`👥 Usuários: ${mockDatabase.users.length}`);
  console.log(`🏛️ Departamentos: ${mockDatabase.departments.length}`);
  console.log(`📞 Clientes: ${mockDatabase.clients.length}`);
  
  console.log('\n👤 CREDENCIAIS DE ACESSO:');
  console.log('==========================');
  console.log('🔐 Super Admin (TOIT):');
  console.log('   CPF: 00000000000 | Senha: admin123');
  console.log('');
  console.log('🏢 Tech Solutions:');
  console.log('   Admin - CPF: 11111111111 | Senha: admin123');
  console.log('   Manager - CPF: 22222222222 | Senha: manager123');
  console.log('   Employee - CPF: 33333333333 | Senha: func123');
  console.log('');
  console.log('🚀 Inovação Digital:');
  console.log('   Admin - CPF: 44444444444 | Senha: inova123');
  console.log('   Manager - CPF: 55555555555 | Senha: gerente123');
  console.log('');
  console.log('⭐ StartUp Nexus:');
  console.log('   Founder - CPF: 66666666666 | Senha: startup123');
  console.log('   Developer - CPF: 77777777777 | Senha: dev123');
}

/**
 * Salvar dados em arquivo JSON
 */
async function saveToFile() {
  const fs = await import('fs/promises');
  
  const dataToSave = {
    created_at: new Date().toISOString(),
    summary: {
      tenants: mockDatabase.tenants.length,
      users: mockDatabase.users.length,
      departments: mockDatabase.departments.length,
      clients: mockDatabase.clients.length
    },
    data: mockDatabase
  };

  await fs.writeFile(
    'mock-database.json', 
    JSON.stringify(dataToSave, null, 2),
    'utf8'
  );
}

// Executar se arquivo for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestData();
}

export { createTestData, mockDatabase };