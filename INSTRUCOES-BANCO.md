# 🗄️ INSTRUÇÕES PARA CONFIGURAR BANCO DE DADOS

## 🚨 PROBLEMA IDENTIFICADO
A conexão com o banco PostgreSQL Railway está falhando (ECONNRESET). Precisamos:
1. **Atualizar credenciais** do banco Railway
2. **Executar script SQL** para inserir dados de teste
3. **Testar autenticação** com novos usuários

---

## 📋 PASSO A PASSO PARA EXECUÇÃO

### **1. ATUALIZAR VARIÁVEIS DE AMBIENTE NO RAILWAY**

No **Railway Dashboard** → **Projeto TOIT-Nexus** → **Variables**:

```bash
DATABASE_URL=postgresql://[NOVA_URL_DO_RAILWAY]
```

⚠️ **IMPORTANTE:** A URL atual pode estar expirada:
```
postgresql://postgres:foalaCypsSEvgsygpcDaySNcGiweMsmv@crossover.proxy.rlwy.net:41834/railway
```

### **2. EXECUTAR SCRIPT SQL NO POSTGRESQL**

1. **Acessar Railway Dashboard**
2. **Abrir PostgreSQL Database**
3. **Clicar em "Query"**
4. **Copiar e executar** o conteúdo do arquivo `insert-test-data.sql`

### **3. VERIFICAR INSERÇÃO DOS DADOS**

Após executar o script, deve retornar:
```
tipo         | total
-------------|-------
Empresas     | 4
Usuários     | 8
Departamentos| 6
Clientes     | 7
Workflows    | 2
Templates    | 4
```

---

## 👤 CREDENCIAIS DE TESTE CRIADAS

### **🔐 SUPER ADMIN (VICTOR CALIFE - TOIT):**
- **CPF:** `33656299803`
- **Senha:** `15151515`
- **Email:** victor@toit.com.br
- **Role:** super_admin

### **🏢 TECH SOLUTIONS LTDA:**
- **Admin:** CPF `11111111111` | Senha `admin123`
- **Manager:** CPF `22222222222` | Senha `manager123`
- **Employee:** CPF `33333333333` | Senha `func123`

### **🚀 INOVAÇÃO DIGITAL:**
- **Admin:** CPF `44444444444` | Senha `inova123`
- **Manager:** CPF `55555555555` | Senha `gerente123`

### **⭐ STARTUP NEXUS:**
- **Founder:** CPF `66666666666` | Senha `startup123`
- **Developer:** CPF `77777777777` | Senha `dev123`

---

## 📊 DADOS CRIADOS

### **🏢 EMPRESAS (4):**
1. **TOIT Enterprise** - super admin (enterprise plan)
2. **Tech Solutions Ltda** - cliente business (25 usuários)
3. **Inovação Digital** - cliente professional (15 usuários)
4. **StartUp Nexus** - cliente starter (5 usuários)

### **👥 USUÁRIOS (8):**
- 1 Super Admin (TOIT)
- 3 Tech Solutions (admin, manager, employee)
- 2 Inovação Digital (admin, manager)
- 2 StartUp Nexus (admin, employee)

### **🏛️ DEPARTAMENTOS (6):**
- **Tech Solutions:** TI/Desenvolvimento, Comercial, Administrativo
- **Inovação Digital:** Inovação, Projetos
- **StartUp Nexus:** Produto

### **📞 CLIENTES (7):**
- **Tech Solutions:** Empresa ABC, João Silva (PF), Inovação Corp
- **Inovação Digital:** Startup X, Maria Fernanda (PF)
- **StartUp Nexus:** Tech Boost, Carlos Eduardo (PF)

### **🔄 WORKFLOWS (2):**
- **Tech Solutions:** Onboarding Cliente
- **Inovação Digital:** Gestão de Projeto

### **📝 TEMPLATES DE TASKS (4):**
- **Tech Solutions:** Desenvolvimento Feature, Correção Bug
- **Inovação Digital:** Pesquisa & Desenvolvimento
- **StartUp Nexus:** Desenvolvimento MVP

---

## 🧪 COMO TESTAR

### **1. TESTAR AUTENTICAÇÃO:**
```bash
# No diretório do projeto:
node test-auth.js
```

### **2. TESTAR LOGIN FRONTEND:**
1. **Acessar:** https://[SEU-DOMINIO-RAILWAY]/login
2. **Usar qualquer CPF/senha** da lista acima
3. **Verificar redirecionamento** baseado no role

### **3. TESTAR MULTI-TENANT:**
- **Super Admin** → Vê todos os dados
- **Tenant Admin** → Vê apenas dados da empresa
- **Manager/Employee** → Vê dados limitados

---

## 🔧 TROUBLESHOOTING

### **Se der erro de conexão:**
1. **Verificar** se DATABASE_URL está correta
2. **Recriar** banco PostgreSQL no Railway se necessário
3. **Executar** migration novamente: `npm run db:push`

### **Se usuários não aparecerem:**
1. **Executar** novamente o script SQL
2. **Verificar** logs do servidor Railway
3. **Testar** conexão manual

### **Se autenticação falhar:**
1. **Verificar** se senhas foram hasheadas corretamente
2. **Checar** bcrypt funcionando
3. **Validar** middleware de sessão

---

## 📚 PRÓXIMOS PASSOS

Após configurar o banco:

1. ✅ **Testar todas as credenciais**
2. ✅ **Validar multi-tenant funcionando**
3. ✅ **Confirmar separação de dados por empresa**
4. ✅ **Testar workflows e templates**
5. ✅ **Iniciar MÓDULO 2: Dashboard com Dados Reais**

---

**🎯 OBJETIVO:** Banco populado com dados realistas para desenvolvimento e testes do sistema TOIT NEXUS completo.