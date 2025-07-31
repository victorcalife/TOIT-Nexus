# 🗄️ RAILWAY DATABASE SETUP - EXECUTAR MIGRATIONS

## 🚨 **PROBLEMA IDENTIFICADO:**
Banco PostgreSQL Railway está vazio - sem tabelas criadas.

## ✅ **SOLUÇÕES DISPONÍVEIS:**

### **🔧 SOLUÇÃO 1: AUTO-MIGRATIONS NO DEPLOY (Recomendado)**
Já configurado! As migrations executarão automaticamente no próximo deploy.

**Backend Service Start Command:**
```bash
npm run railway:start
```
*Executa: `npm run db:setup && npm start`*

### **🔧 SOLUÇÃO 2: RAILWAY CLI (Execução Manual)**
Se tiver Railway CLI instalado:

```bash
# Conectar ao projeto
railway login
railway link

# Executar migrations manualmente
railway run npm run db:setup
```

### **🔧 SOLUÇÃO 3: COMMIT E REDEPLOY (Mais Simples)**
1. Fazer commit das mudanças (já preparado)
2. Push para GitHub
3. Railway auto-deploy executará migrations

## 📋 **O QUE AS MIGRATIONS CRIAM:**

### **Tabelas Principais:**
- `tenants` - Empresas/clientes
- `users` - Usuários do sistema  
- `departments` - Departamentos organizacionais
- `permissions` - Permissões granulares
- `clients` - Clientes das empresas
- `workflows` - Workflows automatizados
- `reports` - Relatórios personalizados
- `task_templates` - Templates de tarefas
- `task_instances` - Instâncias de tarefas
- `database_connections` - Conexões de banco
- `api_connections` - Conexões de API
- `query_builders` - Construtor de queries
- `kpi_dashboards` - Dashboards de KPIs

### **Schema Completo:**
- 25+ tabelas com relacionamentos
- Indices otimizados
- Constraints de integridade
- Enums para tipos específicos

## 🎯 **RESULTADO ESPERADO:**
```
🗄️  Executando database migrations...
📋 Executando drizzle-kit push...
✅ Tabelas criadas com sucesso!
🎉 Banco de dados configurado!
🚀 Server running on port [PORT]
```

## ⚠️ **SE HOUVER ERRO:**
- Verificar se DATABASE_URL está correta
- Verificar se PostgreSQL Railway está acessível
- Verificar logs detalhados no Railway Dashboard

## 🚀 **PRÓXIMO PASSO:**
Fazer commit e push para executar auto-setup!