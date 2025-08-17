# 🗄️ INSTRUÇÕES DE EXECUÇÃO - BANCO DE DADOS TOIT NEXUS

## 📋 SEQUÊNCIA OBRIGATÓRIA DE EXECUÇÃO

Execute os arquivos SQL **EXATAMENTE** nesta ordem no TablePlus:

### **1️⃣ PRIMEIRO: Schema Completo**
```sql
-- Arquivo: 01-schema-completo.sql
-- Cria todas as tabelas, índices, triggers e estrutura do banco
```

### **2️⃣ SEGUNDO: Dados Essenciais**
```sql
-- Arquivo: 02-dados-essenciais.sql  
-- Insere dados iniciais: TOIT, Victor, workspaces, etc.
```

## 🔐 DADOS DE ACESSO APÓS EXECUÇÃO

### **👤 USUÁRIO VICTOR (SUPER ADMIN)**
- **Email:** `victor@toit.com.br`
- **CPF:** `33656299803`
- **Senha:** `241286`
- **Role:** `super_admin`
- **Tenant:** `TOIT`

### **🏢 TENANT PRINCIPAL**
- **Nome:** `TOIT - Tecnologia e Inovação`
- **Slug:** `toit`
- **Status:** `active`
- **Plano:** `enterprise`

## 📊 VERIFICAÇÃO PÓS-EXECUÇÃO

Execute esta query para verificar se tudo foi criado:

```sql
-- Verificar estrutura criada
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar dados inseridos
SELECT 
    'TENANTS' as tabela,
    COUNT(*) as registros
FROM tenants
UNION ALL
SELECT 
    'USERS' as tabela,
    COUNT(*) as registros
FROM users
UNION ALL
SELECT 
    'WORKSPACES' as tabela,
    COUNT(*) as registros
FROM workspaces;

-- Verificar Victor
SELECT 
    id,
    name,
    email,
    cpf,
    role,
    is_active
FROM users 
WHERE email = 'victor@toit.com.br';
```

## ⚠️ IMPORTANTE

1. **Execute os arquivos na ordem correta**
2. **Não pule nenhum arquivo**
3. **Aguarde cada execução terminar antes da próxima**
4. **Verifique se não há erros antes de continuar**

## 🚀 APÓS EXECUÇÃO

O sistema estará pronto para:
- ✅ Login do Victor funcionando
- ✅ Multi-tenant configurado
- ✅ Workspaces criados
- ✅ Estrutura completa do banco

## 🔧 CONFIGURAÇÃO DO SISTEMA

Após executar os SQLs, configure o arquivo `.env` do servidor:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/nome_do_banco
JWT_SECRET=sua_chave_secreta_super_forte
NODE_ENV=development
PORT=8080
```

## 🎯 TESTE FINAL

Para testar se tudo funcionou:

1. Execute os SQLs no TablePlus
2. Configure o `.env` do servidor
3. Execute: `cd server && npm run dev`
4. Acesse: `http://localhost:8080/health`
5. Teste login com dados do Victor

## 📞 SUPORTE

Se houver algum erro na execução:
1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais de conexão
3. Execute os arquivos na ordem correta
4. Verifique logs de erro no TablePlus

---

**🎉 SISTEMA PRONTO PARA USO APÓS EXECUÇÃO CORRETA!**
