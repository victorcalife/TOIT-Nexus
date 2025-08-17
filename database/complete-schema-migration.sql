-- ====================================================================
-- MIGRATION COMPLETA - SCHEMA ROBUSTO TOIT NEXUS
-- Sistema completo: Users, Tenants, Workspaces, Teams, Departments
-- Execute este script no TablePlus para criar estrutura completa
-- ====================================================================

-- Verificar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. CRIAR ENUMS
-- ====================================================================

-- Enum para roles de usuário
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'tenant_admin', 'manager', 'user', 'guest');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para status de tenant
DO $$ BEGIN
    CREATE TYPE tenant_status AS ENUM ('active', 'inactive', 'suspended', 'trial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para planos de assinatura
DO $$ BEGIN
    CREATE TYPE subscription_plan AS ENUM ('free', 'standard', 'pro', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ====================================================================
-- 2. TABELA TENANTS (ORGANIZAÇÕES)
-- ====================================================================

CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255) UNIQUE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    logo_url VARCHAR(500),
    website VARCHAR(255),
    
    -- Configurações
    settings JSONB DEFAULT '{}',
    features JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}',
    
    -- Limites e planos
    max_users INTEGER DEFAULT 10,
    max_workspaces INTEGER DEFAULT 5,
    max_storage_gb INTEGER DEFAULT 1,
    subscription_plan subscription_plan DEFAULT 'free',
    subscription_expires TIMESTAMP,
    
    -- Status e controle
    status tenant_status DEFAULT 'active',
    is_verified BOOLEAN DEFAULT FALSE,
    trial_ends_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Índices
    CONSTRAINT tenants_slug_check CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT tenants_email_check CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$')
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription ON tenants(subscription_plan);

-- ====================================================================
-- 3. TABELA USERS (USUÁRIOS)
-- ====================================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Dados pessoais
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    
    -- Autenticação
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    
    -- Perfil e permissões
    role user_role DEFAULT 'user',
    permissions JSONB DEFAULT '[]',
    preferences JSONB DEFAULT '{}',
    
    -- Status e controle
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT users_email_check CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$'),
    CONSTRAINT users_cpf_check CHECK (cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$' OR cpf ~ '^\d{11}$')
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- ====================================================================
-- 4. TABELA WORKSPACES (ESPAÇOS DE TRABALHO)
-- ====================================================================

CREATE TABLE IF NOT EXISTS workspaces (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Dados básicos
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50) DEFAULT 'folder',
    
    -- Configurações
    settings JSONB DEFAULT '{}',
    is_default BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Constraints
    UNIQUE(tenant_id, slug),
    CONSTRAINT workspaces_slug_check CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_workspaces_tenant ON workspaces(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(tenant_id, slug);

-- ====================================================================
-- 5. TABELA TEAMS (EQUIPES)
-- ====================================================================

CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
    leader_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Dados básicos
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#10B981',
    
    -- Configurações
    settings JSONB DEFAULT '{}',
    max_members INTEGER DEFAULT 50,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Constraints
    UNIQUE(workspace_id, slug),
    CONSTRAINT teams_slug_check CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_teams_tenant ON teams(tenant_id);
CREATE INDEX IF NOT EXISTS idx_teams_workspace ON teams(workspace_id);
CREATE INDEX IF NOT EXISTS idx_teams_leader ON teams(leader_id);

-- ====================================================================
-- 6. TABELA DEPARTMENTS (DEPARTAMENTOS)
-- ====================================================================

CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Dados básicos
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    code VARCHAR(20) UNIQUE,
    
    -- Hierarquia
    level INTEGER DEFAULT 0,
    path VARCHAR(500),
    
    -- Configurações
    settings JSONB DEFAULT '{}',
    budget DECIMAL(15,2),
    cost_center VARCHAR(50),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Constraints
    UNIQUE(tenant_id, slug),
    CONSTRAINT departments_slug_check CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_departments_tenant ON departments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent ON departments(parent_id);
CREATE INDEX IF NOT EXISTS idx_departments_manager ON departments(manager_id);
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);

-- ====================================================================
-- 7. TABELAS DE RELACIONAMENTO
-- ====================================================================

-- Usuários em Workspaces
CREATE TABLE IF NOT EXISTS workspace_members (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    permissions JSONB DEFAULT '[]',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(workspace_id, user_id)
);

-- Usuários em Teams
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(team_id, user_id)
);

-- Usuários em Departments
CREATE TABLE IF NOT EXISTS department_members (
    id SERIAL PRIMARY KEY,
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    position VARCHAR(100),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(department_id, user_id)
);

-- ====================================================================
-- 8. TABELA DE PERMISSÕES
-- ====================================================================

CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissões de usuários
CREATE TABLE IF NOT EXISTS user_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    granted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, permission_id)
);

-- ====================================================================
-- 9. TABELA DE SESSÕES
-- ====================================================================

CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para sessões
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ====================================================================
-- 10. TRIGGERS PARA UPDATED_AT
-- ====================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
