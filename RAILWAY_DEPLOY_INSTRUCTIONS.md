# 🚀 Instruções de Deploy TOIT Nexus no Railway

## 📋 Pré-requisitos

1. Conta no Railway (https://railway.app)
2. Repositório GitHub conectado
3. Projeto TOIT Nexus commitado no GitHub

## 🏗️ Estrutura do Monorepo

```
TOIT-Nexus/
├── server/          # Backend (Node.js + Express)
│   ├── railway.toml  # Configuração Railway Backend
│   └── .env.example  # Variáveis de ambiente Backend
├── client/          # Frontend (React + Vite)
│   ├── railway.toml  # Configuração Railway Frontend
│   └── .env.example  # Variáveis de ambiente Frontend
└── database/        # Migrações SQL
```

## 🎯 Passo a Passo do Deploy

### 1️⃣ Criar Projeto no Railway

1. Acesse https://railway.app
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Conecte o repositório TOIT-Nexus

### 2️⃣ Configurar Serviços

#### 🗄️ PostgreSQL Database

1. No projeto Railway, clique em "+ New"
2. Selecione "Database" → "PostgreSQL"
3. Aguarde a criação do banco
4. Copie a `DATABASE_URL` gerada

#### 🔴 Redis Cache

1. No projeto Railway, clique em "+ New"
2. Selecione "Database" → "Redis"
3. Aguarde a criação do Redis
4. Copie a `REDIS_URL` gerada

#### 🖥️ Backend Service

1. No projeto Railway, clique em "+ New"
2. Selecione "GitHub Repo" → Escolha o repositório
3. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

#### 🌐 Frontend Service

1. No projeto Railway, clique em "+ New"
2. Selecione "GitHub Repo" → Escolha o repositório
3. Configure:
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`

### 3️⃣ Configurar Variáveis de Ambiente

#### 🖥️ Backend Variables

```env
# Configurações Básicas
NODE_ENV=production
PORT=8080

# Banco de Dados
DATABASE_URL=postgresql://user:pass@host:port/db
DB_POOL_MIN=2
DB_POOL_MAX=10

# Cache Redis
REDIS_URL=redis://user:pass@host:port

# Autenticação e Segurança
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
SESSION_SECRET=seu_session_secret_super_seguro_aqui
ENCRYPTION_KEY=sua_chave_de_criptografia_32_chars

# URLs dos Serviços
BACKEND_PUBLIC_URL=https://api.toit.com.br
FRONTEND_PUBLIC_URL=https://app.toit.com.br
CORS_ORIGIN=https://app.toit.com.br

# Configurações de Produção
TRUST_PROXY=true
ENABLE_COMPRESSION=true
LOG_FORMAT=json
LOG_LEVEL=info
ENABLE_METRICS=true

# Rate Limiting
RATE_LIMIT_MAX=1000
LOGIN_RATE_LIMIT_MAX=5

# Upload de Arquivos
MAX_FILE_SIZE=50
UPLOAD_DIR=uploads

# Configurações JWT
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Features
ENABLE_REGISTRATION=false
ENABLE_PASSWORD_RESET=true
ENABLE_EMAIL_VERIFICATION=true
ENABLE_TWO_FACTOR=false

# Tenant Padrão
DEFAULT_TENANT_SLUG=toit
DEFAULT_TENANT_NAME=TOIT - Tecnologia e Inovação
DEFAULT_MAX_USERS=10
DEFAULT_MAX_WORKSPACES=5
DEFAULT_MAX_STORAGE_GB=1
```

#### 🌐 Frontend Variables

```env
# Configurações da Aplicação
VITE_APP_NAME=TOIT Nexus
VITE_APP_VERSION=1.0.0

# URLs da API
VITE_API_URL=https://api.toit.com.br
VITE_BACKEND_URL=https://api.toit.com.br

# Configurações de Ambiente
NODE_ENV=production

# URL do Frontend
VITE_FRONTEND_URL=https://app.toit.com.br
```

### 4️⃣ Executar Migrações

1. Acesse o terminal do serviço Backend no Railway
2. Execute as migrações:

```bash
# Executar migração do esquema
node database/migrate-schema.js

# Executar seeders essenciais
node database/run-seeders.js
```

### 5️⃣ Configurar Domínios

#### Backend (API)
1. No serviço Backend, vá em "Settings" → "Domains"
2. Adicione domínio personalizado: `api.toit.com.br`
3. Configure DNS CNAME apontando para o domínio Railway

#### Frontend (App)
1. No serviço Frontend, vá em "Settings" → "Domains"
2. Adicione domínio personalizado: `app.toit.com.br`
3. Configure DNS CNAME apontando para o domínio Railway

### 6️⃣ Verificar Deploy

#### ✅ Checklist de Verificação

- [ ] PostgreSQL criado e conectado
- [ ] Redis criado e conectado
- [ ] Backend deployado e rodando
- [ ] Frontend deployado e rodando
- [ ] Migrações executadas com sucesso
- [ ] Seeders executados com sucesso
- [ ] Variáveis de ambiente configuradas
- [ ] Domínios configurados
- [ ] SSL ativo nos domínios
- [ ] Health check do backend funcionando
- [ ] Frontend carregando corretamente
- [ ] Login funcionando
- [ ] APIs respondendo

#### 🔍 URLs de Teste

- **Backend Health**: `https://api.toit.com.br/health`
- **Backend API**: `https://api.toit.com.br/api/v1/`
- **Frontend**: `https://app.toit.com.br`

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de Conexão com Banco**
   - Verifique se `DATABASE_URL` está correta
   - Confirme se PostgreSQL está rodando

2. **Erro de Build Frontend**
   - Verifique se todas as variáveis `VITE_*` estão configuradas
   - Confirme se `npm run build` funciona localmente

3. **Erro 500 no Backend**
   - Verifique logs no Railway
   - Confirme se migrações foram executadas
   - Verifique se `JWT_SECRET` está configurado

4. **CORS Error**
   - Verifique se `CORS_ORIGIN` aponta para o domínio do frontend
   - Confirme se `FRONTEND_PUBLIC_URL` está correto

### 📊 Monitoramento

- Use os logs do Railway para monitorar erros
- Configure alertas para downtime
- Monitore uso de recursos (CPU, RAM, Disco)
- Acompanhe métricas de performance

## 🔄 Atualizações

Para atualizar o sistema:

1. Faça commit das mudanças no GitHub
2. Railway fará deploy automático
3. Execute migrações se necessário
4. Teste as funcionalidades

## 🆘 Suporte

Em caso de problemas:

1. Verifique logs no Railway
2. Consulte documentação do Railway
3. Verifique status dos serviços
4. Entre em contato com suporte técnico

---

**🎉 Parabéns! Seu TOIT Nexus está agora rodando em produção no Railway!**