import { createRequire } from 'module';
import { eq, or, isNull } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const require = createRequire( import.meta.url );
const { db } = require( './dist/db.js' );
const { users, tenants, permissions, rolePermissions, userPermissions } = require( './dist/shared/schema.js' );

/**
 * Script para inicializar Super Admins com acesso global
 * Resolve o problema de tabelas vazias impedindo acesso do admin
 */

async function initializeSuperAdminAccess()
{
  console.log( '🚀 [SUPER-ADMIN] Iniciando configuração de acesso global...' );

  try
  {
    // 1. Verificar se existem super_admins ou toit_admins
    const adminUsers = await db
      .select()
      .from( users )
      .where( or(
        eq( users.role, 'super_admin' ),
        eq( users.role, 'toit_admin' )
      ) );

    console.log( `👑 [SUPER-ADMIN] Encontrados ${ adminUsers.length } usuários admin` );

    if ( adminUsers.length === 0 )
    {
      console.log( '⚠️ [SUPER-ADMIN] Nenhum super admin encontrado. Criando admin padrão...' );
      await createDefaultSuperAdmin();
    }

    // 2. Criar permissões básicas se não existirem
    await ensureBasicPermissions();

    // 3. Garantir acesso global para todos os admins
    for ( const admin of adminUsers )
    {
      await ensureGlobalAccess( admin );
    }

    console.log( '✅ [SUPER-ADMIN] Configuração de acesso global concluída!' );

  } catch ( error )
  {
    console.error( '❌ [SUPER-ADMIN] Erro ao configurar acesso global:', error );
    throw error;
  }
}

async function createDefaultSuperAdmin()
{

  // Criar tenant especial para TOIT (se não existir)
  let toitTenant = await db
    .select()
    .from( tenants )
    .where( eq( tenants.slug, 'toit-admin' ) )
    .limit( 1 );

  if ( toitTenant.length === 0 )
  {
    console.log( '🏢 [SUPER-ADMIN] Criando tenant TOIT...' );
    await db.insert( tenants ).values( {
      name: 'TOIT - Administração Global',
      slug: 'toit-admin',
      domain: 'admin.toit.com.br',
      status: 'active',
      subscriptionPlan: 'enterprise'
    } );

    toitTenant = await db
      .select()
      .from( tenants )
      .where( eq( tenants.slug, 'toit-admin' ) )
      .limit( 1 );
  }

  // Criar super admin padrão
  const hashedPassword = await bcrypt.hash( 'admin123', 10 );

  await db.insert( users ).values( {
    cpf: '00000000000', // CPF especial para admin
    email: 'admin@toit.com.br',
    password: hashedPassword,
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super_admin',
    tenantId: toitTenant[ 0 ].id,
    isActive: true,
    emailVerified: true
  } );

  console.log( '👑 [SUPER-ADMIN] Super admin padrão criado!' );
  console.log( '📧 Email: admin@toit.com.br' );
  console.log( '🔑 Senha: admin123' );
  console.log( '📱 CPF: 000.000.000-00' );
}

async function ensureBasicPermissions()
{
  console.log( '🔐 [PERMISSIONS] Verificando permissões básicas...' );

  const basicPermissions = [
    { name: 'global_access', description: 'Acesso global a todos os tenants' },
    { name: 'tenant_management', description: 'Gerenciar tenants' },
    { name: 'user_management', description: 'Gerenciar usuários' },
    { name: 'system_admin', description: 'Administração do sistema' },
    { name: 'support_access', description: 'Acesso para suporte técnico' },
    { name: 'read_all', description: 'Leitura em todos os módulos' },
    { name: 'write_all', description: 'Escrita em todos os módulos' },
    { name: 'delete_all', description: 'Exclusão em todos os módulos' }
  ];

  for ( const perm of basicPermissions )
  {
    const existing = await db
      .select()
      .from( permissions )
      .where( eq( permissions.name, perm.name ) )
      .limit( 1 );

    if ( existing.length === 0 )
    {
      await db.insert( permissions ).values( {
        name: perm.name,
        description: perm.description,
        module: 'system'
      } );
      console.log( `✅ [PERMISSIONS] Criada permissão: ${ perm.name }` );
    }
  }
}

async function ensureGlobalAccess( admin )
{
  console.log( `🔑 [ACCESS] Configurando acesso global para ${ admin.email || admin.cpf }...` );

  // Buscar todas as permissões
  const allPermissions = await db.select().from( permissions );

  // Buscar todos os tenants
  const allTenants = await db.select().from( tenants );

  // Para super_admin e toit_admin, dar acesso a TODAS as permissões em TODOS os tenants
  if ( admin.role === 'super_admin' || admin.role === 'toit_admin' )
  {

    // 1. Permissões diretas do usuário (globais)
    for ( const permission of allPermissions )
    {
      const existingUserPerm = await db
        .select()
        .from( userPermissions )
        .where( eq( userPermissions.userId, admin.id ) )
        .where( eq( userPermissions.permissionId, permission.id ) )
        .where( isNull( userPermissions.tenantId ) ) // Permissão global
        .limit( 1 );

      if ( existingUserPerm.length === 0 )
      {
        await db.insert( userPermissions ).values( {
          userId: admin.id,
          permissionId: permission.id,
          tenantId: null, // NULL = acesso global
          grantedById: admin.id
        } );
      }
    }

    // 2. Permissões por role em cada tenant
    for ( const tenant of allTenants )
    {
      for ( const permission of allPermissions )
      {
        const existingRolePerm = await db
          .select()
          .from( rolePermissions )
          .where( eq( rolePermissions.tenantId, tenant.id ) )
          .where( eq( rolePermissions.role, admin.role ) )
          .where( eq( rolePermissions.permissionId, permission.id ) )
          .limit( 1 );

        if ( existingRolePerm.length === 0 )
        {
          await db.insert( rolePermissions ).values( {
            tenantId: tenant.id,
            role: admin.role,
            permissionId: permission.id
          } );
        }
      }
    }

    console.log( `✅ [ACCESS] Acesso global configurado para ${ admin.email || admin.cpf }` );
  }
}

// Executar se chamado diretamente
if ( import.meta.url === `file://${ process.argv[ 1 ] }` )
{
  initializeSuperAdminAccess()
    .then( () =>
    {
      console.log( '🎉 [SUPER-ADMIN] Inicialização concluída com sucesso!' );
      process.exit( 0 );
    } )
    .catch( ( error ) =>
    {
      console.error( '💥 [SUPER-ADMIN] Erro na inicialização:', error );
      process.exit( 1 );
    } );
}

export { initializeSuperAdminAccess };
