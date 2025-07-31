# 🚀 Railway Deployment - TOIT NEXUS

## Configuração de Variáveis de Ambiente na Railway

### 1. Variáveis Obrigatórias

Configure estas variáveis no **Railway Dashboard > Your Project > Variables**:

```bash
# Database (Railway PostgreSQL)
DATABASE_URL=postgresql://... # Auto-configurada pela Railway

# Session
SESSION_SECRET=toit-nexus-production-secret-key-2025

# Stripe (Sistema de Pagamentos)
STRIPE_SECRET_KEY=sk_test_51RoTIGAFG0EXcFge4zoGiAyg0y4oRsre0XXBiyjQMNJ7g7Uc4Jd4lvgjPlCbrxYZJDdmNzhrhFczhgxTpdKxsVqt00vk0spwZH

# Aplicação
NODE_ENV=production
```

### 2. Variáveis Automáticas (Railway define automaticamente)

```bash
PORT=8080        # Railway define automaticamente
RAILWAY_PUBLIC_DOMAIN=your-app.up.railway.app
```

### 3. Configurar Webhook no Stripe Dashboard

**OBRIGATÓRIO para pagamentos funcionarem:**

1. **Acesse:** [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. **Clique:** "Add endpoint"  
3. **Configure:**
   - **URL:** `https://your-app.up.railway.app/api/webhooks/stripe`
   - **Eventos:** `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.resumed`
4. **Copie o Signing Secret:** `whsec_...`
5. **Configure na Railway:**

```bash
# Obrigatório para webhooks
STRIPE_WEBHOOK_SECRET=whsec_seu_signing_secret_aqui

# Opcional (para frontend)
STRIPE_PUBLISHABLE_KEY=pk_test_...
SUPPORT_EMAIL=suporte@toit.com.br
```

## Deploy Railway

### 1. Conectar Repositório
```bash
# Railway CLI
railway login
railway link
railway up
```

### 2. Configurar Build
```bash
Build Command: npm install && npm run build
Start Command: npm start
Root Directory: / (deixar vazio)
```

### 3. Testar Deploy
```bash
# Health check geral
GET https://your-app.up.railway.app/health

# Health check sistema pagamentos
GET https://your-app.up.railway.app/api/payment/health

# Planos disponíveis
GET https://your-app.up.railway.app/api/payment/plans
```

## Configuração Pós-Deploy

### 1. Inicializar Sistema
```bash
POST https://your-app.up.railway.app/api/setup-system
Content-Type: application/json

{
  "email": "admin@toit.com.br",
  "firstName": "Admin",
  "lastName": "TOIT", 
  "password": "sua_senha_admin"
}
```

### 2. Criar Planos Padrão
Os planos são criados automaticamente no setup. Caso precise recriar:

```bash
POST https://your-app.up.railway.app/api/payment/admin/create-default-plans
# Requer autenticação como super_admin
```

## Estrutura de Planos Criados

### Individual - R$ 29,90/mês
- Até 1 usuário
- Workflows ilimitados  
- Query Builder avançado
- 10GB de armazenamento

### Business - R$ 89,90/mês
- Até 10 usuários
- Gestão departamental
- Integrações avançadas
- 100GB de armazenamento

### Enterprise - R$ 299,90/mês
- Usuários ilimitados
- Gestão departamental avançada
- Integrações customizadas
- Armazenamento ilimitado

## Endpoints Disponíveis

### Públicos
- `GET /api/payment/plans` - Planos disponíveis
- `POST /api/payment/business-lead` - Capturar leads empresariais

### Autenticados  
- `POST /api/payment/create-subscription` - Criar assinatura
- `GET /api/payment/subscription` - Obter assinatura atual
- `POST /api/payment/cancel-subscription` - Cancelar assinatura
- `GET /api/payment/billing-status` - Status de cobrança

### Super Admin
- `GET /api/payment/admin/business-leads` - Listar leads
- `PUT /api/payment/admin/business-lead/:id` - Atualizar lead

### Webhooks Stripe
- `POST /api/webhooks/stripe` - Processar eventos Stripe
- `GET /api/webhooks/stripe/test` - Testar conectividade

## Monitoramento

### Logs Importantes
```bash
✅ Stripe initialized successfully
🚀 Server running on port XXXX
✅ Migrations executadas com sucesso
🎉 Sistema inicializado com sucesso!
```

### Troubleshooting
- Se Stripe não inicializar: verificar `STRIPE_SECRET_KEY`
- Se banco falhar: verificar `DATABASE_URL`
- Se porta não funcionar: Railway define automaticamente `PORT`