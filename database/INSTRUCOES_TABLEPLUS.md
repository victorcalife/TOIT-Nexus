# 📋 INSTRUÇÕES PARA EXECUÇÃO DAS MIGRAÇÕES NO TABLEPLUS

## 🎯 Objetivo
Executar manualmente as migrações do banco de dados TOIT Nexus usando o TablePlus.

## 📁 Arquivos de Migração Disponíveis

### 1. **TABLEPLUS_MIGRATION_COMPLETA.sql** ⭐ (RECOMENDADO)
**Localização:** `database/TABLEPLUS_MIGRATION_COMPLETA.sql`

**Conteúdo:**
- ✅ Adiciona coluna `data` (JSONB) à tabela `user_sessions`
- ✅ Cria todas as tabelas do sistema Quantum ML
- ✅ Insere planos de assinatura
- ✅ Cria índices de performance
- ✅ Verificações de integridade

### 2. **complete-schema-migration-fixed.sql**
**Localização:** `database/complete-schema-migration-fixed.sql`

**Conteúdo:**
- Schema completo do sistema (tenants, users, workspaces, teams, departments)
- ⚠️ **ATENÇÃO:** Remove todas as tabelas existentes (DROP CASCADE)

### 3. **essential-seeders.sql**
**Localização:** `database/essential-seeders.sql`

**Conteúdo:**
- Dados iniciais essenciais
- Permissões do sistema
- Tenant TOIT
- Usuário Victor (super_admin)
- Workspace padrão

## 🚀 EXECUÇÃO RECOMENDADA

### Opção A: Migração Incremental (SEGURA)

1. **Conecte ao banco Railway no TablePlus**
   ```
   Host: Seu host Railway
   Database: railway
   User: postgres
   Password: Sua senha Railway
   ```

2. **Execute APENAS o arquivo principal:**
   ```sql
   -- Copie e cole todo o conteúdo de:
   database/TABLEPLUS_MIGRATION_COMPLETA.sql
   ```

3. **Verifique os resultados:**
   - Procure pelas mensagens de confirmação
   - Verifique se a coluna `data` foi adicionada em `user_sessions`
   - Confirme que as 7 tabelas Quantum ML foram criadas

### Opção B: Migração Completa (CUIDADO - REMOVE DADOS)

⚠️ **ATENÇÃO:** Esta opção remove TODOS os dados existentes!

1. **Backup do banco atual (OBRIGATÓRIO)**
   ```sql
   -- No TablePlus, vá em File > Export > SQL Dump
   ```

2. **Execute em ordem:**
   ```sql
   -- 1. Schema completo (REMOVE TUDO)
   database/complete-schema-migration-fixed.sql
   
   -- 2. Dados essenciais
   database/essential-seeders.sql
   
   -- 3. Sistema Quantum ML
   database/TABLEPLUS_MIGRATION_COMPLETA.sql
   ```

## 🔍 VERIFICAÇÕES PÓS-MIGRAÇÃO

### 1. Verificar coluna `data` em `user_sessions`
```sql
-- Verificar estrutura da tabela
\d user_sessions;

-- Ou consultar information_schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
AND column_name = 'data';
```

### 2. Verificar tabelas Quantum ML
```sql
-- Listar todas as tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN (
    'subscription_plans', 'ml_slots', 'ml_slot_usage',
    'tenant_subscriptions', 'storage_usage_log',
    'system_cache', 'file_uploads'
)
ORDER BY table_name;
```

### 3. Verificar planos de assinatura
```sql
-- Verificar se os planos foram inseridos
SELECT name, display_name, price_monthly, ml_slots
FROM subscription_plans
ORDER BY price_monthly;
```

## 🛠️ RESOLUÇÃO DE PROBLEMAS

### Erro: "relation does not exist"
- A tabela `user_sessions` não existe
- Execute primeiro o schema completo: `complete-schema-migration-fixed.sql`

### Erro: "column already exists"
- A coluna `data` já existe
- A migração foi executada anteriormente
- Verifique com: `\d user_sessions`

### Erro: "permission denied"
- Verifique as credenciais do Railway
- Confirme que o usuário tem permissões de DDL

### Erro: "syntax error"
- Copie o arquivo completo, não apenas partes
- Verifique se não há caracteres especiais

## 📊 STATUS ESPERADO APÓS MIGRAÇÃO

✅ **Sucesso:**
```
MIGRAÇÃO TABLEPLUS CONCLUÍDA COM SUCESSO!
Todas as tabelas Quantum ML foram criadas e a coluna data foi adicionada à user_sessions
```

✅ **Tabelas criadas:**
- `subscription_plans` (3 planos inseridos)
- `ml_slots` (sistema de slots ML)
- `ml_slot_usage` (histórico de uso)
- `tenant_subscriptions` (assinaturas)
- `storage_usage_log` (log de storage)
- `system_cache` (cache do sistema)
- `file_uploads` (controle de arquivos)

✅ **Coluna adicionada:**
- `user_sessions.data` (JSONB, default '{}')

## 🔄 ROLLBACK (se necessário)

### Para reverter apenas as tabelas Quantum ML:
```sql
DROP TABLE IF EXISTS ml_slot_usage CASCADE;
DROP TABLE IF EXISTS ml_slots CASCADE;
DROP TABLE IF EXISTS tenant_subscriptions CASCADE;
DROP TABLE IF EXISTS storage_usage_log CASCADE;
DROP TABLE IF EXISTS system_cache CASCADE;
DROP TABLE IF EXISTS file_uploads CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
```

### Para reverter a coluna `data`:
```sql
ALTER TABLE user_sessions DROP COLUMN IF EXISTS data;
```

## 📞 SUPORTE

Em caso de problemas:
1. Verifique os logs do TablePlus
2. Confirme a conexão com o Railway
3. Execute as verificações pós-migração
4. Consulte a documentação do Railway

---

**Última atualização:** $(date)
**Versão:** 2.0 - Quantum ML System
**Responsável:** Victor Calife - TOIT