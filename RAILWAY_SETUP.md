# 🚂 RAILWAY DEPLOYMENT GUIDE - TOIT NEXUS

## 📋 CONFIGURAÇÃO RAILWAY - PASSO A PASSO

### **🎯 ESTRUTURA DO PROJETO RAILWAY**
```
TOIT-Nexus (Railway Project)
├── 🗄️  PostgreSQL Database
├── 🖥️  Backend Service  
└── 🌐 Frontend Service
```

### **🔧 PASSO 1: CONFIGURAR POSTGRESQL DATABASE**

1. **No Railway Dashboard do projeto TOIT-Nexus:**
   - Clique em **"+ Add Service"**
   - Selecione **"Database"** → **"PostgreSQL"**
   - Nome: `toit-nexus-db` (ou deixe padrão)

2. **Após criação da database:**
   - A Railway irá gerar automaticamente a `DATABASE_URL`
   - Anote a `DATABASE_URL` (será usada nos serviços)

### **🔧 PASSO 2: CONFIGURAR BACKEND SERVICE**

**Configurações no Railway Dashboard:**

**Build Settings:**
- **Root Directory:** `/` (raiz do projeto)
- **Build Command:** (deixar vazio - Railway auto-detecta)
- **Start Command:** (deixar vazio - Railway auto-detecta)

**Environment Variables:**
```bash
NODE_ENV=production
DATABASE_URL=${{PostgreSQL.DATABASE_URL}}
SESSION_SECRET=toit-nexus-session-secret-2025-railway
# PORT é automaticamente definida pela Railway (não precisa definir)
```

**Deploy Settings:**
- **Source:** GitHub Repository
- **Branch:** main
- **Auto Deploy:** Enabled

### **🔧 PASSO 3: CONFIGURAR FRONTEND SERVICE**

**Configurações no Railway Dashboard:**

**Build Settings:**
- **Root Directory:** `/` (raiz do projeto)  
- **Build Command:** (deixar vazio - Railway auto-detecta)
- **Start Command:** (deixar vazio - Railway auto-detecta)

**Environment Variables:**
```bash
NODE_ENV=production
VITE_API_URL=${{Backend.RAILWAY_PUBLIC_DOMAIN}}
```

**Deploy Settings:**
- **Source:** GitHub Repository
- **Branch:** main
- **Auto Deploy:** Enabled

### **🔧 PASSO 4: CONECTAR GITHUB REPOSITORY**

1. **No Railway Dashboard:**
   - Conecte o repositório: `https://github.com/victorcalife/TOIT-Nexus`
   - Branch: `main`
   - Enable Auto Deploy em ambos os serviços

2. **Push do código para GitHub:**
   ```bash
   git add .
   git commit -m "feat: Configure Railway deployment setup"
   git push origin main
   ```

### **🎯 PASSO 5: VERIFICAR DEPLOY**

**Ordem de Deploy:**
1. 🗄️  **Database** (já criada)
2. 🖥️  **Backend** (executará migrations automaticamente)
3. 🌐 **Frontend** (conectará ao backend)

**URLs Finais:**
- **Backend API:** `https://[backend-service].railway.app/api`
- **Frontend:** `https://[frontend-service].railway.app`
- **Database:** Interno (via DATABASE_URL)

### **🔍 COMANDOS DE VERIFICAÇÃO**

**Testar Backend:**
```bash
curl https://[backend-url]/health
curl https://[backend-url]/debug
```

**Testar Database Connection:**
```bash
# No Railway Backend logs, procurar por:
# "🗄️ Connecting to PostgreSQL database..."
# "📍 Database host: Railway PostgreSQL"
```

### **🐛 TROUBLESHOOTING**

**Problema: DATABASE_URL não encontrada**
- Verificar se PostgreSQL database foi criada
- Verificar variável de ambiente `DATABASE_URL`

**Problema: Migrations não executam**
- Verificar logs do Backend service
- Executar manualmente: `railway run npm run db:push`

**Problema: Frontend não conecta Backend**
- Verificar variável `VITE_API_URL`
- Usar Railway Public Domain do Backend

## ✅ CHECKLIST FINAL

- [ ] PostgreSQL Database criada
- [ ] Backend Service configurado com DATABASE_URL
- [ ] Frontend Service configurado com VITE_API_URL
- [ ] GitHub Repository conectado
- [ ] Auto Deploy habilitado
- [ ] Deploy realizado com sucesso
- [ ] Aplicação acessível nas URLs Railway

## 🎉 RESULTADO ESPERADO

Após seguir todos os passos:
- ✅ Sistema TOIT NEXUS 100% funcional na Railway
- ✅ Database PostgreSQL Railway nativa
- ✅ Backend e Frontend em serviços separados
- ✅ Auto deploy do GitHub
- ✅ URLs públicas acessíveis

**Credenciais de Teste:**
- **Super Admin:** CPF `00000000000` / Senha `admin123`
- **Tenant Admin:** CPF `11111111111` / Senha `admin123`