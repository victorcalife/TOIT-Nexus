-- TOIT NEXUS - SCHEMA COMPLETO DO BANCO DE DADOS
-- Todas as tabelas necessárias para o sistema funcionar 100%

-- Usuários e Autenticação
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT,
  cpf VARCHAR(11) UNIQUE,
  email VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  avatar VARCHAR(500),
  role ENUM('user', 'manager', 'admin', 'super_admin') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
  UNIQUE KEY unique_email_tenant (email, tenant_id),
  UNIQUE KEY unique_cpf (cpf),
  INDEX idx_email (email),
  INDEX idx_cpf (cpf),
  INDEX idx_tenant (tenant_id),
  INDEX idx_active (is_active),
  INDEX idx_role (role)
);

-- Tenants/Organizações
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

-- Logs do sistema
CREATE TABLE IF NOT EXISTS system_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  details JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_logs (user_id, created_at),
  INDEX idx_action (action, created_at),
  INDEX idx_created_at (created_at)
);

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

-- Dashboards
CREATE TABLE IF NOT EXISTS dashboards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  layout ENUM('grid', 'masonry', 'flex') DEFAULT 'grid',
  theme ENUM('light', 'dark', 'auto') DEFAULT 'light',
  color_palette JSON,
  is_public BOOLEAN DEFAULT FALSE,
  tags JSON,
  quantum_enhanced BOOLEAN DEFAULT TRUE,
  refresh_interval INT DEFAULT 30000,
  widget_count INT DEFAULT 0,
  config JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_dashboards (user_id, updated_at),
  INDEX idx_public (is_public)
);

-- Widgets dos Dashboards
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dashboard_id INT NOT NULL,
  type ENUM('chart', 'metric', 'table', 'text', 'image', 'iframe') NOT NULL,
  title VARCHAR(255) NOT NULL,
  chart_type VARCHAR(50),
  data_source JSON,
  query TEXT,
  position_x INT DEFAULT 0,
  position_y INT DEFAULT 0,
  width INT DEFAULT 4,
  height INT DEFAULT 3,
  config JSON,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE,
  INDEX idx_dashboard_widgets (dashboard_id, position_y, position_x)
);

-- Visualizações de Dashboard
CREATE TABLE IF NOT EXISTS dashboard_views (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dashboard_id INT NOT NULL,
  user_id INT NOT NULL,
  view_count INT DEFAULT 1,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_dashboard_user (dashboard_id, user_id)
);

-- Queries Salvas
CREATE TABLE IF NOT EXISTS saved_queries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  query_text TEXT NOT NULL,
  data_source VARCHAR(100),
  parameters JSON,
  quantum_optimized BOOLEAN DEFAULT TRUE,
  execution_count INT DEFAULT 0,
  avg_execution_time DECIMAL(10,2) DEFAULT 0.00,
  tags JSON,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_queries (user_id, updated_at),
  INDEX idx_public_queries (is_public, updated_at)
);

-- Execuções de Query
CREATE TABLE IF NOT EXISTS query_executions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  query_id INT,
  query_text TEXT NOT NULL,
  data_source VARCHAR(100),
  execution_time DECIMAL(10,2),
  quantum_speedup DECIMAL(10,2) DEFAULT 1.00,
  result_rows INT DEFAULT 0,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (query_id) REFERENCES saved_queries(id) ON DELETE SET NULL,
  INDEX idx_user_executions (user_id, created_at),
  INDEX idx_query_executions (query_id, created_at)
);

-- Relatórios
CREATE TABLE IF NOT EXISTS reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('sales', 'analytics', 'financial', 'operational', 'custom') NOT NULL,
  template_id INT,
  data_source VARCHAR(100),
  query_text TEXT,
  parameters JSON,
  schedule_config JSON,
  output_format ENUM('pdf', 'excel', 'csv', 'html') DEFAULT 'pdf',
  quantum_enhanced BOOLEAN DEFAULT TRUE,
  is_scheduled BOOLEAN DEFAULT FALSE,
  last_generated DATETIME,
  generation_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_reports (user_id, updated_at),
  INDEX idx_scheduled (is_scheduled, last_generated)
);

-- Gerações de Relatório
CREATE TABLE IF NOT EXISTS report_generations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  report_id INT NOT NULL,
  user_id INT NOT NULL,
  file_path VARCHAR(500),
  file_size INT,
  generation_time DECIMAL(10,2),
  quantum_speedup DECIMAL(10,2) DEFAULT 1.00,
  status ENUM('pending', 'generating', 'completed', 'failed') DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_report_generations (report_id, created_at),
  INDEX idx_user_generations (user_id, created_at)
);

-- Tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  assigned_to INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('todo', 'in_progress', 'review', 'done', 'cancelled') DEFAULT 'todo',
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  category VARCHAR(100),
  tags JSON,
  due_date DATETIME,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  progress INT DEFAULT 0,
  parent_task_id INT,
  project_id INT,
  quantum_optimized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  INDEX idx_user_tasks (user_id, status, due_date),
  INDEX idx_assigned_tasks (assigned_to, status),
  INDEX idx_parent_tasks (parent_task_id)
);

-- Comentários de Tarefas
CREATE TABLE IF NOT EXISTS task_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_task_comments (task_id, created_at)
);

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

-- Anexos de Email
CREATE TABLE IF NOT EXISTS email_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100),
  is_inline BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
  INDEX idx_email_attachments (email_id)
);

-- Templates de Email
CREATE TABLE IF NOT EXISTS email_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body LONGTEXT NOT NULL,
  description TEXT,
  category VARCHAR(100),
  is_system BOOLEAN DEFAULT FALSE,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_templates (user_id, category),
  INDEX idx_system_templates (is_system, category)
);

-- Emails Agendados
CREATE TABLE IF NOT EXISTS scheduled_emails (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email_id INT NOT NULL,
  scheduled_for DATETIME NOT NULL,
  status ENUM('pending', 'processing', 'sent', 'failed') DEFAULT 'pending',
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  result JSON,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
  INDEX idx_scheduled_emails (scheduled_for, status)
);

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

-- Anexos de Chat
CREATE TABLE IF NOT EXISTS chat_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  message_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100),
  thumbnail_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
  INDEX idx_message_attachments (message_id)
);

-- Reações de Mensagem
CREATE TABLE IF NOT EXISTS message_reactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  message_id INT NOT NULL,
  user_id INT NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_reaction (message_id, user_id, emoji),
  INDEX idx_message_reactions (message_id, emoji)
);

-- Chamadas de Vídeo
CREATE TABLE IF NOT EXISTS video_calls (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT,
  initiated_by INT NOT NULL,
  type ENUM('audio', 'video', 'screen_share') DEFAULT 'video',
  status ENUM('initiated', 'ringing', 'connected', 'ended', 'failed') DEFAULT 'initiated',
  started_at DATETIME,
  ended_at DATETIME,
  duration INT DEFAULT 0,
  recording_path VARCHAR(500),
  quantum_enhanced BOOLEAN DEFAULT FALSE,
  quality_score DECIMAL(3,2),
  participants_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE SET NULL,
  FOREIGN KEY (initiated_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_call_status (status, started_at),
  INDEX idx_user_calls (initiated_by, created_at)
);

-- Participantes de Chamada
CREATE TABLE IF NOT EXISTS call_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  call_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at DATETIME,
  left_at DATETIME,
  duration INT DEFAULT 0,
  audio_enabled BOOLEAN DEFAULT TRUE,
  video_enabled BOOLEAN DEFAULT TRUE,
  screen_sharing BOOLEAN DEFAULT FALSE,
  connection_quality ENUM('excellent', 'good', 'poor', 'very_poor') DEFAULT 'excellent',
  FOREIGN KEY (call_id) REFERENCES video_calls(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_call_participants (call_id, joined_at)
);

-- Workflows
CREATE TABLE IF NOT EXISTS workflows (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('manual', 'automatic', 'scheduled', 'triggered') DEFAULT 'manual',
  trigger_config JSON,
  steps JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  quantum_optimized BOOLEAN DEFAULT TRUE,
  execution_count INT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 100.00,
  avg_execution_time DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_workflows (user_id, is_active),
  INDEX idx_workflow_type (type, is_active)
);

-- Execuções de Workflow
CREATE TABLE IF NOT EXISTS workflow_executions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workflow_id INT NOT NULL,
  user_id INT NOT NULL,
  trigger_data JSON,
  execution_steps JSON,
  status ENUM('pending', 'running', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  started_at DATETIME,
  completed_at DATETIME,
  execution_time DECIMAL(10,2),
  quantum_speedup DECIMAL(10,2) DEFAULT 1.00,
  error_message TEXT,
  result_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_workflow_executions (workflow_id, created_at),
  INDEX idx_execution_status (status, started_at)
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

-- Backup de Padrões Quânticos
CREATE TABLE IF NOT EXISTS quantum_pattern_backups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  patterns_data JSON NOT NULL,
  system_metrics JSON,
  backup_size INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_backups (user_id, created_at)
);

-- Logs do Sistema
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

-- Eventos de Email
CREATE TABLE IF NOT EXISTS email_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  message_id VARCHAR(255) NOT NULL,
  event_type ENUM('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed') NOT NULL,
  event_data JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_message_events (message_id, event_type),
  INDEX idx_event_type (event_type, created_at)
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  description TEXT,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_tag (user_id, name),
  INDEX idx_user_tags (user_id, usage_count)
);

-- Tags de Email
CREATE TABLE IF NOT EXISTS email_tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email_id INT NOT NULL,
  tag_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE KEY unique_email_tag (email_id, tag_id)
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

-- Tokens de Reset de Senha
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_expires (expires_at)
);

-- Inserir dados iniciais
INSERT IGNORE INTO tenants (id, name, domain, subscription_plan) VALUES 
(1, 'TOIT NEXUS', 'toit.com.br', 'enterprise');

-- Inserir usuário admin padrão
INSERT IGNORE INTO users (id, email, password_hash, name, role, tenant_id, is_active, email_verified) VALUES 
(1, 'admin@toit.com.br', '$2b$10$rQZ8kHWKQVnqVQZ8kHWKQVnqVQZ8kHWKQVnqVQZ8kHWKQVnqVQZ8k', 'Administrador', 'super_admin', 1, TRUE, TRUE);

-- Inserir métricas iniciais para o admin
INSERT IGNORE INTO user_metrics (user_id) VALUES (1);

-- Inserir preferências iniciais para o admin
INSERT IGNORE INTO user_preferences (user_id) VALUES (1);

-- Tabelas para Calendário
CREATE TABLE IF NOT EXISTS calendar_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  event_type ENUM('meeting', 'call', 'video_call', 'task', 'reminder', 'personal', 'quantum', 'mila') DEFAULT 'meeting',
  location VARCHAR(255),
  attendees JSON,
  is_all_day BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule VARCHAR(255),
  reminders JSON,
  quantum_enhanced BOOLEAN DEFAULT FALSE,
  mila_assisted BOOLEAN DEFAULT FALSE,
  quantum_data JSON,
  mila_data JSON,
  color VARCHAR(7) DEFAULT '#3B82F6',
  parent_event_id INT,
  is_template BOOLEAN DEFAULT FALSE,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_event_id) REFERENCES calendar_events(id) ON DELETE CASCADE,
  INDEX idx_user_events (user_id, start_date, end_date),
  INDEX idx_event_type (event_type),
  INDEX idx_recurring (is_recurring, parent_event_id)
);

-- Tabelas para Relatórios
CREATE TABLE IF NOT EXISTS reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('sales', 'analytics', 'financial', 'operational', 'custom') NOT NULL,
  template_id INT,
  data_source VARCHAR(100) NOT NULL,
  query_text TEXT,
  parameters JSON,
  schedule_config JSON,
  output_format ENUM('pdf', 'excel', 'csv', 'html') DEFAULT 'pdf',
  quantum_enhanced BOOLEAN DEFAULT TRUE,
  is_scheduled BOOLEAN DEFAULT FALSE,
  is_template BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  generation_count INT DEFAULT 0,
  last_generated DATETIME,
  quantum_data JSON,
  mila_data JSON,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES reports(id) ON DELETE SET NULL,
  INDEX idx_user_reports (user_id, type, status),
  INDEX idx_scheduled (is_scheduled, last_generated),
  INDEX idx_templates (is_template, is_public)
);

CREATE TABLE IF NOT EXISTS report_generations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  report_id INT NOT NULL,
  user_id INT NOT NULL,
  file_path VARCHAR(500),
  file_size INT,
  generation_time DECIMAL(10,2),
  quantum_speedup DECIMAL(10,2) DEFAULT 1.00,
  status ENUM('pending', 'generating', 'completed', 'failed') DEFAULT 'pending',
  error_message TEXT,
  parameters_used JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_report_generations (report_id, created_at),
  INDEX idx_user_generations (user_id, created_at),
  INDEX idx_status (status, created_at)
);

-- Tabela para presença de usuários (chat)
CREATE TABLE IF NOT EXISTS user_presence (
  user_id INT PRIMARY KEY,
  status ENUM('online', 'away', 'busy', 'offline') DEFAULT 'offline',
  last_seen DATETIME,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Inserir dados iniciais para relatórios
INSERT IGNORE INTO reports (id, user_id, name, description, type, data_source, query_text, is_template, is_public) VALUES
(1, 1, 'Relatório de Vendas Mensal', 'Relatório padrão de vendas mensais', 'sales', 'sales_db', 'SELECT * FROM sales WHERE MONTH(date) = MONTH(CURRENT_DATE)', TRUE, TRUE),
(2, 1, 'Analytics de Performance', 'Métricas de performance do sistema', 'analytics', 'analytics_db', 'SELECT * FROM metrics WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY)', TRUE, TRUE),
(3, 1, 'Relatório Financeiro', 'Demonstrativo financeiro completo', 'financial', 'finance_db', 'SELECT * FROM transactions WHERE date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)', TRUE, TRUE);

-- Tabelas para Workflows
CREATE TABLE IF NOT EXISTS workflows (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  nodes JSON NOT NULL,
  edges JSON NOT NULL,
  config JSON,
  is_active BOOLEAN DEFAULT FALSE,
  quantum_enhanced BOOLEAN DEFAULT TRUE,
  mila_assisted BOOLEAN DEFAULT TRUE,
  is_template BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  template_id INT,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  execution_count INT DEFAULT 0,
  last_executed DATETIME,
  quantum_data JSON,
  mila_data JSON,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES workflows(id) ON DELETE SET NULL,
  INDEX idx_user_workflows (user_id, category, status),
  INDEX idx_active_workflows (is_active, last_executed),
  INDEX idx_templates (is_template, is_public)
);

CREATE TABLE IF NOT EXISTS workflow_executions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workflow_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('pending', 'running', 'completed', 'failed') DEFAULT 'pending',
  result JSON,
  execution_time DECIMAL(10,2),
  error_message TEXT,
  parameters JSON,
  dry_run BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_workflow_executions (workflow_id, created_at),
  INDEX idx_user_executions (user_id, created_at),
  INDEX idx_status (status, created_at)
);

-- Tabela para tokens de reset de senha
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

-- Tabela para logs do sistema
CREATE TABLE IF NOT EXISTS system_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  details JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_logs (user_id, created_at),
  INDEX idx_action (action, created_at),
  INDEX idx_created_at (created_at)
);

-- Tabela para sessões de chat
CREATE TABLE IF NOT EXISTS chat_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  quantum_enhanced BOOLEAN DEFAULT TRUE,
  mila_assisted BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_sessions (user_id, is_active, updated_at)
);

-- Tabela para mensagens de chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT NOT NULL,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  message_type ENUM('user', 'assistant', 'system') DEFAULT 'user',
  quantum_processed BOOLEAN DEFAULT FALSE,
  mila_processed BOOLEAN DEFAULT FALSE,
  processing_time DECIMAL(10,3),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_session_messages (session_id, created_at),
  INDEX idx_user_messages (user_id, created_at)
);

-- Tabela para emails
CREATE TABLE IF NOT EXISTS emails (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  from_address VARCHAR(255) NOT NULL,
  to_addresses JSON NOT NULL,
  cc_addresses JSON,
  bcc_addresses JSON,
  subject VARCHAR(500) NOT NULL,
  body_text TEXT,
  body_html TEXT,
  attachments JSON,
  is_sent BOOLEAN DEFAULT FALSE,
  is_draft BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  quantum_enhanced BOOLEAN DEFAULT FALSE,
  mila_assisted BOOLEAN DEFAULT FALSE,
  thread_id VARCHAR(100),
  message_id VARCHAR(255),
  in_reply_to VARCHAR(255),
  sent_at DATETIME,
  received_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_emails (user_id, is_deleted, received_at),
  INDEX idx_thread (thread_id),
  INDEX idx_message_id (message_id),
  INDEX idx_sent_status (is_sent, sent_at)
);

-- Tabela para chamadas de vídeo
CREATE TABLE IF NOT EXISTS video_calls (
  id INT PRIMARY KEY AUTO_INCREMENT,
  host_user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  room_id VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100),
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration_minutes INT,
  max_participants INT DEFAULT 10,
  is_recording BOOLEAN DEFAULT FALSE,
  recording_url VARCHAR(500),
  status ENUM('scheduled', 'active', 'ended', 'cancelled') DEFAULT 'scheduled',
  quantum_enhanced BOOLEAN DEFAULT FALSE,
  mila_assisted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (host_user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_host_calls (host_user_id, status, start_time),
  INDEX idx_room_id (room_id),
  INDEX idx_status_time (status, start_time)
);

-- Tabela para participantes de chamadas
CREATE TABLE IF NOT EXISTS video_call_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  call_id INT NOT NULL,
  user_id INT,
  participant_name VARCHAR(255),
  participant_email VARCHAR(255),
  joined_at DATETIME,
  left_at DATETIME,
  duration_minutes INT,
  is_host BOOLEAN DEFAULT FALSE,
  is_moderator BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (call_id) REFERENCES video_calls(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_call_participants (call_id, joined_at),
  INDEX idx_user_participation (user_id, joined_at)
);

-- Inserir dados iniciais de workflows
INSERT IGNORE INTO workflows (id, user_id, name, description, category, nodes, edges, is_template, is_public) VALUES
(1, 1, 'Processamento de Email Automático', 'Workflow para processar emails recebidos automaticamente', 'email',
 '[{"id":"1","type":"email_received","position":{"x":100,"y":100},"data":{"label":"Email Recebido"}},{"id":"2","type":"mila_analyze","position":{"x":400,"y":100},"data":{"label":"Análise MILA"}},{"id":"3","type":"create_task","position":{"x":700,"y":100},"data":{"label":"Criar Tarefa"}}]',
 '[{"id":"e1-2","source":"1","target":"2"},{"id":"e2-3","source":"2","target":"3"}]', TRUE, TRUE),
(2, 1, 'Relatório Quântico Automático', 'Geração automática de relatórios com processamento quântico', 'reports',
 '[{"id":"1","type":"schedule","position":{"x":100,"y":100},"data":{"label":"Agendamento Diário"}},{"id":"2","type":"quantum_process","position":{"x":400,"y":100},"data":{"label":"Processamento Quântico"}},{"id":"3","type":"generate_report","position":{"x":700,"y":100},"data":{"label":"Gerar Relatório"}}]',
 '[{"id":"e1-2","source":"1","target":"2"},{"id":"e2-3","source":"2","target":"3"}]', TRUE, TRUE);
