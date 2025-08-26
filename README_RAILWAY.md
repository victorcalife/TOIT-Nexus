# 🚀 TOIT Nexus - Deploy Railway

## 📋 Resumo do Deploy

Este projeto está configurado para deploy automático no Railway com monorepo separado:

- **Backend**: `server/` - Node.js + Express + PostgreSQL
- **Frontend**: `client/` - React + Vite
- **Database**: PostgreSQL + Redis

## 🏗️ Estrutura Railway

```
Railway Project
├── 🗄️ PostgreSQL Database
├── 🔴 Redis Cache  
├── 🖥️ Backend Service (server/)
└── 🌐 Frontend Service (client/)
```

## ⚡ Deploy Rápido

### 1. Criar Projeto Railway
```bash
# Conectar repositório GitHub ao Railway
# Criar 4 serviços: PostgreSQL, Redis, Backend, Frontend
```

### 2. Configurar Serviços

#### Backend Service
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Port**: `8080`

#### Frontend Service  
- **Root Directory**: `client`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run preview`
- **Port**: `4173`

### 3. Variáveis de Ambiente

#### Backend (Essenciais)
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=seu_jwt_secret_aqui
SESSION_SECRET=seu_session_secret_aqui
BACKEND_PUBLIC_URL=https://seu-backend.railway.app
FRONTEND_PUBLIC_URL=https://seu-frontend.railway.app
CORS_ORIGIN=https://seu-frontend.railway.app
```

#### Frontend (Essenciais)
```env
VITE_API_URL=https://seu-backend.railway.app
VITE_BACKEND_URL=https://seu-backend.railway.app
```

### 4. Executar Migrações

```bash
# No terminal do Backend Service no Railway:
npm run railway:migrate
```

### 5. Verificar Deploy

```bash
# Health check
npm run railway:health

# URLs de teste
https://seu-backend.railway.app/health
https://seu-frontend.railway.app
```

## 🔧 Scripts Disponíveis

### Backend
- `npm run railway:migrate` - Executar migrações
- `npm run railway:health` - Verificar saúde do sistema
- `npm run railway:health:json` - Health check em JSON

### Frontend
- `npm run build` - Build para produção
- `npm run preview` - Servidor de preview

## 📊 Monitoramento

- **Backend Health**: `/health`
- **API Status**: `/api/v1/`
- **Logs**: Railway Dashboard
- **Métricas**: Railway Analytics

## 🆘 Troubleshooting

### Problemas Comuns

1. **Erro de Build**
   ```bash
   # Verificar logs no Railway
   # Confirmar variáveis de ambiente
   ```

2. **Erro de Conexão DB**
   ```bash
   # Verificar DATABASE_URL
   npm run railway:health
   ```

3. **CORS Error**
   ```bash
   # Verificar CORS_ORIGIN no backend
   # Confirmar VITE_API_URL no frontend
   ```

## 📚 Documentação Completa

Para instruções detalhadas, consulte:
- `RAILWAY_DEPLOY_INSTRUCTIONS.md` - Guia completo
- `RAILWAY_DEPLOY_GUIDE.md` - Documentação técnica

## 🎯 URLs de Produção

- **API**: https://api.toit.com.br
- **App**: https://app.toit.com.br
- **Health**: https://api.toit.com.br/health

---

**🚀 Deploy automatizado via GitHub → Railway**