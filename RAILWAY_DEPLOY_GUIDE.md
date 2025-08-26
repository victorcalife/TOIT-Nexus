# 🚀 GUIA DE DEPLOY NO RAILWAY - TOIT NEXUS

## 📋 PRÉ-REQUISITOS

### 1. Conta Railway
- Acesse [railway.app](https://railway.app)
- Faça login com GitHub
- Conecte seu repositório

### 2. Serviços Necessários
Você precisará criar os seguintes serviços no Railway:

#### 🗄️ **PostgreSQL Database**
- Nome: `toit-nexus-postgres`
- Versão: PostgreSQL 15+

#### 🔴 **Redis Cache**
- Nome: `toit-nexus-redis`
- Versão: Redis 7+

#### 🖥️ **Backend Service**
- Nome: `toit-nexus-backend`
- Repositório: Conectar ao seu GitHub
- Root Directory: `/server`

#### 🌐 **Frontend Service**
- Nome: `toit-nexus-frontend`
- Repositório: Conectar ao seu GitHub
- Root Directory: `/client`

---

## 🔧 CONFIGURAÇÃO PASSO A PASSO

### PASSO 1: Criar Projeto no Railway

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Fazer login
railway login

# 3. Criar novo projeto
railway new
```

### PASSO 2: Adicionar Serviços

#### PostgreSQL
```bash
railway add postgresql
```

#### Redis
```bash
railway add redis
```

### PASSO 3: Configurar Variáveis de Ambiente

#### 🖥️ **Backend Service Variables**

No painel do Railway, configure as seguintes variáveis para o serviço backend:

```env
# CONFIGURAÇÕES BÁSICAS
NODE_ENV=production
PORT=8080

# BANCO DE DADOS (será preenchido automaticamente pelo Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# CACHE REDIS (será preenchido automaticamente pelo Railway)
REDIS_URL=${{Redis.REDIS_URL}}

# AUTENTICAÇÃO E SEGURANÇA
JWT_SECRET=toit_nexus_super_secret_key_2024_MUDE_EM_PRODUCAO
JWT_REFRESH_SECRET=toit_nexus_refresh_secret_2024_MUDE_EM_PRODUCAO
SESSION_SECRET=toit_nexus_session_secret_2024_MUDE_EM_PRODUCAO

# DURAÇÃO DOS TOKENS
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS E DOMÍNIOS
ALLOWED_ORIGINS=https://toit-nexus-frontend.up.railway.app,https://nexus.toit.com.br
PRODUCTION_DOMAIN=https://nexus.toit.com.br

# UPLOAD DE ARQUIVOS
MAX_FILE_SIZE=50
UPLOAD_DIR=uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,application/msword

# RATE LIMITING
RATE_LIMIT_MAX=1000
LOGIN_RATE_LIMIT_MAX=5

# LOGGING
LOG_LEVEL=info
LOG_FORMAT=json

# MONITORAMENTO
ENABLE_METRICS=true
HEALTH_CHECK_PATH=/health

# CACHE
CACHE_TTL=3600

# CONFIGURAÇÕES DE PRODUÇÃO
TRUST_PROXY=true
ENABLE_COMPRESSION=true

# FEATURES FLAGS
ENABLE_REGISTRATION=false
ENABLE_PASSWORD_RESET=true
ENABLE_EMAIL_VERIFICATION=true
ENABLE_TWO_FACTOR=false

# TENANT PADRÃO
DEFAULT_TENANT_SLUG=toit
DEFAULT_TENANT_NAME=TOIT - Tecnologia e Inovação
DEFAULT_MAX_USERS=10
DEFAULT_MAX_WORKSPACES=5
DEFAULT_MAX_STORAGE_GB=1

# WEBHOOK
WEBHOOK_SECRET=toit_nexus_webhook_secret_2024_MUDE_EM_PRODUCAO
```

#### 🌐 **Frontend Service Variables**

```env
# CONFIGURAÇÕES BÁSICAS
NODE_ENV=production

# URL DO BACKEND (será preenchida após deploy do backend)
VITE_API_URL=https://toit-nexus-backend.up.railway.app
VITE_API_BASE_URL=https://toit-nexus-backend.up.railway.app/api

# CONFIGURAÇÕES DE BUILD
VITE_APP_NAME=TOIT Nexus
VITE_APP_VERSION=1.0.0
```

### PASSO 4: Configurar Build Commands

#### Backend Service
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

#### Frontend Service
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm run preview"
  }
}
```

---

## 🚀 DEPLOY

### 1. Fazer Push do Código
```bash
git add .
git commit -m "feat: configuração para deploy Railway"
git push origin main
```

### 2. Deploy Automático
O Railway detectará automaticamente as mudanças e iniciará o deploy.

### 3. Verificar Logs
```bash
# Ver logs do backend
railway logs --service toit-nexus-backend

# Ver logs do frontend
railway logs --service toit-nexus-frontend
```

---

## 🔗 URLS DE ACESSO

Após o deploy, você terá:

- **Backend API**: `https://toit-nexus-backend.up.railway.app`
- **Frontend**: `https://toit-nexus-frontend.up.railway.app`
- **Health Check**: `https://toit-nexus-backend.up.railway.app/health`

---

## 🌐 CONFIGURAR DOMÍNIO PERSONALIZADO

### 1. No Railway Dashboard
- Acesse o serviço frontend
- Vá em "Settings" > "Domains"
- Adicione: `nexus.toit.com.br`

### 2. No seu DNS
Adicione um registro CNAME:
```
nexus.toit.com.br CNAME toit-nexus-frontend.up.railway.app
```

### 3. Atualizar Variáveis
Atualize as variáveis de ambiente com o novo domínio:
```env
ALLOWED_ORIGINS=https://nexus.toit.com.br
PRODUCTION_DOMAIN=https://nexus.toit.com.br
```

---

## 🔍 MONITORAMENTO

### Health Checks
- Backend: `https://toit-nexus-backend.up.railway.app/health`
- Logs: Disponíveis no dashboard do Railway

### Métricas
- CPU, Memória e Rede disponíveis no Railway
- Logs estruturados em JSON para análise

---

## 🛠️ TROUBLESHOOTING

### Problemas Comuns

1. **Erro de Conexão com Banco**
   - Verifique se `DATABASE_URL` está configurada
   - Confirme se o serviço PostgreSQL está rodando

2. **CORS Error**
   - Verifique `ALLOWED_ORIGINS`
   - Confirme se as URLs estão corretas

3. **Build Failure**
   - Verifique os logs de build
   - Confirme se todas as dependências estão no package.json

### Comandos Úteis
```bash
# Ver status dos serviços
railway status

# Reiniciar serviço
railway restart --service toit-nexus-backend

# Conectar ao banco
railway connect postgres

# Ver variáveis de ambiente
railway variables
```

---

## ✅ CHECKLIST DE DEPLOY

- [ ] Serviços criados no Railway (Postgres, Redis, Backend, Frontend)
- [ ] Variáveis de ambiente configuradas
- [ ] Código commitado e enviado para GitHub
- [ ] Deploy realizado com sucesso
- [ ] Health check funcionando
- [ ] Frontend carregando corretamente
- [ ] Autenticação funcionando
- [ ] Banco de dados populado com dados iniciais
- [ ] Domínio personalizado configurado (opcional)
- [ ] Monitoramento ativo

---

## 🎯 PRÓXIMOS PASSOS

1. **Configurar CI/CD**: Automatizar deploys com GitHub Actions
2. **Backup**: Configurar backup automático do PostgreSQL
3. **Monitoring**: Integrar com ferramentas de monitoramento
4. **SSL**: Configurar certificados SSL personalizados
5. **CDN**: Configurar CDN para assets estáticos

---

**🚀 Seu TOIT Nexus estará rodando em produção no Railway!**