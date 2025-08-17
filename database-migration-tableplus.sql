-- =====================================================
-- TOIT NEXUS - MIGRAÇÃO COMPLETA PARA TABLEPLUS
-- Sistema Quantum ML Enterprise - Banco de Dados Robusto
-- =====================================================

-- CONFIGURAÇÕES INICIAIS
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET AUTOCOMMIT = 0;
START TRANSACTION;

-- =====================================================
-- 1. ESTRUTURA CORE - USUÁRIOS E TENANTS
-- =====================================================

-- Tenants/Organizações (DEVE SER CRIADA PRIMEIRO)
CREATE TABLE IF NOT EXISTS tenants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  settings JSON,
  features JSON,
  max_users INT DEFAULT 100,
  subscription_plan ENUM('free', 'pro', 'enterprise') DEFAULT 'free',
  subscription_expires DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  INDEX idx_active (is_active)
);

-- Usuários e Autenticação
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  role ENUM('user', 'manager', 'admin', 'super_admin') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
  UNIQUE KEY unique_email_tenant (email, tenant_id),
  INDEX idx_email (email),
  INDEX idx_tenant (tenant_id),
  INDEX idx_active (is_active),
  INDEX idx_role (role)
);

-- Permissões de usuários
CREATE TABLE IF NOT EXISTS user_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  permission VARCHAR(100) NOT NULL,
  tenant_id INT,
  granted_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_user_permission_tenant (user_id, permission, tenant_id),
  INDEX idx_user_permissions (user_id, tenant_id),
  INDEX idx_permission (permission)
);

-- Sessões de Usuário
CREATE TABLE IF NOT EXISTS user_sessions (
  id VARCHAR(128) PRIMARY KEY,
  user_id INT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  data JSON,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_sessions (user_id, expires_at),
  INDEX idx_session_expires (expires_at)
);

-- Tokens de reset de senha
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_expires (expires_at),
  INDEX idx_user_tokens (user_id, created_at)
);

-- Preferências do Usuário
CREATE TABLE IF NOT EXISTS user_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  theme ENUM('light', 'dark', 'auto') DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'pt-BR',
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  notifications JSON,
  dashboard_config JSON,
  email_signature TEXT,
  quantum_settings JSON,
  mila_settings JSON,
  preferences JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 2. SISTEMA QUÂNTICO
-- =====================================================

-- Operações Quânticas
CREATE TABLE IF NOT EXISTS quantum_operations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  operation_type VARCHAR(100) NOT NULL,
  input_data JSON NOT NULL,
  result_data JSON,
  quantum_speedup DECIMAL(10,2) DEFAULT 1.00,
  algorithm_used VARCHAR(100),
  execution_time INT DEFAULT 0,
  complexity_level INT DEFAULT 1,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_operations (user_id, created_at),
  INDEX idx_operation_type (operation_type),
  INDEX idx_algorithm (algorithm_used)
);

-- Métricas dos Usuários
CREATE TABLE IF NOT EXISTS user_metrics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  quantum_operations INT DEFAULT 0,
  total_speedup DECIMAL(15,2) DEFAULT 0.00,
  avg_speedup DECIMAL(10,2) DEFAULT 1.00,
  last_operation DATETIME,
  efficiency_score DECIMAL(5,2) DEFAULT 100.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Padrões MILA
CREATE TABLE IF NOT EXISTS mila_patterns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  pattern_type VARCHAR(100) NOT NULL,
  pattern_data JSON NOT NULL,
  confidence_score DECIMAL(5,4) DEFAULT 0.5000,
  usage_count INT DEFAULT 1,
  last_used DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_patterns (user_id, pattern_type, confidence_score),
  INDEX idx_pattern_usage (pattern_type, usage_count)
);

-- Insights MILA
CREATE TABLE IF NOT EXISTS mila_insights (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  insight_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  confidence DECIMAL(5,4) NOT NULL,
  action_type VARCHAR(100),
  action_data JSON,
  is_read BOOLEAN DEFAULT FALSE,
  is_applied BOOLEAN DEFAULT FALSE,
  applied_at DATETIME,
  expires_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_insights (user_id, is_read, created_at),
  INDEX idx_insight_type (insight_type, confidence)
);

-- =====================================================
-- 3. DADOS INICIAIS ESSENCIAIS
-- =====================================================

-- Inserir tenant principal
INSERT IGNORE INTO tenants (id, name, domain, email, subscription_plan, is_active) VALUES 
(1, 'TOIT NEXUS', 'toit.com.br', 'admin@toit.com.br', 'enterprise', TRUE);

-- Inserir usuário Victor (ADMIN FULL)
INSERT IGNORE INTO users (id, email, password, name, role, tenant_id, is_active, email_verified) VALUES 
(1, 'victor@toit.com.br', '$2b$10$rQZ8kHWKQVnqVQZ8kHWKQVnqVQZ8kHWKQVnqVQZ8kHWKQVnqVQZ8k', 'Victor Calife', 'super_admin', 1, TRUE, TRUE);

-- Inserir métricas iniciais para Victor
INSERT IGNORE INTO user_metrics (user_id) VALUES (1);

-- Inserir preferências iniciais para Victor
INSERT IGNORE INTO user_preferences (user_id) VALUES (1);

-- =====================================================
-- 4. SISTEMA DE LOGS E AUDITORIA
-- =====================================================

-- Logs do sistema
CREATE TABLE IF NOT EXISTS system_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  level ENUM('debug', 'info', 'warning', 'error', 'critical') DEFAULT 'info',
  action VARCHAR(100) NOT NULL,
  details JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_log_level (level, created_at),
  INDEX idx_user_logs (user_id, created_at),
  INDEX idx_action_logs (action, created_at)
);

-- =====================================================
-- 5. SISTEMA DE CHAT E COMUNICAÇÃO
-- =====================================================

-- Conversas de Chat
CREATE TABLE IF NOT EXISTS chat_conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  type ENUM('direct', 'group', 'channel') DEFAULT 'direct',
  description TEXT,
  is_private BOOLEAN DEFAULT TRUE,
  created_by INT NOT NULL,
  avatar VARCHAR(500),
  settings JSON,
  last_message_at DATETIME,
  message_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_conversation_type (type, is_private),
  INDEX idx_last_message (last_message_at)
);

-- Participantes de Conversa
CREATE TABLE IF NOT EXISTS chat_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('member', 'admin', 'owner') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_read_at DATETIME,
  is_muted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_participant (conversation_id, user_id),
  INDEX idx_user_conversations (user_id, joined_at)
);

-- Mensagens de Chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  user_id INT NOT NULL,
  message_type ENUM('text', 'image', 'file', 'system', 'mila', 'quantum') DEFAULT 'text',
  content LONGTEXT NOT NULL,
  reply_to_id INT,
  edited_at DATETIME,
  quantum_processed BOOLEAN DEFAULT FALSE,
  quantum_data JSON,
  mila_generated BOOLEAN DEFAULT FALSE,
  has_attachments BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reply_to_id) REFERENCES chat_messages(id) ON DELETE SET NULL,
  INDEX idx_conversation_messages (conversation_id, created_at),
  INDEX idx_user_messages (user_id, created_at)
);

-- =====================================================
-- 6. SISTEMA DE EMAIL
-- =====================================================

-- Pastas de Email
CREATE TABLE IF NOT EXISTS email_folders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type ENUM('inbox', 'sent', 'drafts', 'important', 'spam', 'trash', 'custom') NOT NULL,
  parent_id INT,
  is_system BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES email_folders(id) ON DELETE CASCADE,
  INDEX idx_user_folders (user_id, sort_order)
);

-- Emails
CREATE TABLE IF NOT EXISTS emails (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  folder_id INT NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body LONGTEXT NOT NULL,
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  to_emails JSON NOT NULL,
  cc_emails JSON,
  bcc_emails JSON,
  reply_to VARCHAR(255),
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  template VARCHAR(100),
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  has_attachments BOOLEAN DEFAULT FALSE,
  scheduled_send DATETIME,
  send_status ENUM('draft', 'scheduled', 'sending', 'sent', 'failed') DEFAULT 'draft',
  delivery_status ENUM('pending', 'delivered', 'bounced', 'failed'),
  external_id VARCHAR(255),
  quantum_processed BOOLEAN DEFAULT FALSE,
  quantum_data JSON,
  mila_generated BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at DATETIME,
  delivered_at DATETIME,
  read_at DATETIME,
  starred_at DATETIME,
  moved_at DATETIME,
  deleted_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES email_folders(id) ON DELETE CASCADE,
  INDEX idx_user_emails (user_id, folder_id, created_at),
  INDEX idx_email_status (send_status, scheduled_send),
  INDEX idx_external_id (external_id)
);

-- =====================================================
-- 7. FINALIZAÇÃO
-- =====================================================

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT 'MIGRAÇÃO CONCLUÍDA COM SUCESSO!' as status;
SELECT COUNT(*) as total_tenants FROM tenants;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = DATABASE();
