# 🧪 Testando Webhooks Stripe - TOIT NEXUS

## Pré-requisitos

1. **Instalar Stripe CLI:**
   ```bash
   # Windows
   scoop install stripe
   
   # ou baixar de: https://github.com/stripe/stripe-cli/releases
   ```

2. **Login na Stripe:**
   ```bash
   stripe login
   ```

## Testando Localmente

### 1. Executar o servidor
```bash
railway status
# Servidor rodando em https://api.toit.com.br
```

### 2. Configurar forwarding do Stripe CLI
```bash
# Terminal 2
stripe listen --forward-to https://api.toit.com.br/api/webhooks/stripe
```

**⚠️ IMPORTANTE:** Copie o webhook secret que aparece:
```
whsec_1234567890abcdef...
```

### 3. Configurar webhook secret localmente
```bash
# Criar .env local para teste
echo "STRIPE_WEBHOOK_SECRET=whsec_seu_secret_aqui" >> .env
```

### 4. Simular eventos
```bash
# Terminal 3 - Simular eventos
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger customer.subscription.resumed
```

## Verificar Funcionamento

### 1. Logs do Servidor
Deve aparecer:
```
✅ Webhook processed successfully
POST /api/webhooks/stripe 200 in 45ms
```

### 2. Banco de Dados
Verificar tabelas criadas:
```sql
-- Eventos processados
SELECT * FROM webhook_events ORDER BY created_at DESC LIMIT 5;

-- Transações registradas  
SELECT * FROM payment_transactions ORDER BY created_at DESC LIMIT 5;

-- Status de assinaturas
SELECT * FROM subscriptions ORDER BY updated_at DESC LIMIT 5;
```

### 3. Endpoint de teste
```bash
curl https://api.toit.com.br/api/webhooks/stripe/test
```

## Deploy na Railway

### 1. Configurar Webhook no Stripe Dashboard
```
URL: https://your-app.up.railway.app/api/webhooks/stripe
Eventos: invoice.payment_succeeded, invoice.payment_failed, 
         customer.subscription.updated, customer.subscription.deleted
```

### 2. Configurar Secret na Railway
```bash
# Railway Dashboard > Variables
STRIPE_WEBHOOK_SECRET=whsec_seu_secret_de_producao
```

### 3. Testar em Produção
```bash
# Testar conectividade
curl https://your-app.up.railway.app/api/webhooks/stripe/test

# Verificar health
curl https://your-app.up.railway.app/api/payment/health
```

## Eventos Suportados

### ✅ invoice.payment_succeeded
- Registra transação como 'succeeded'
- Atualiza assinatura para 'active'
- Tabelas: payment_transactions, subscriptions

### ✅ invoice.payment_failed  
- Registra transação como 'failed'
- Atualiza assinatura para 'past_due'
- Tabelas: payment_transactions, subscriptions

### ✅ customer.subscription.created
- **NOVO!** Registra nova assinatura no banco
- Evita duplicação com verificação
- Usa metadata do Stripe para tenant/plan
- Tabela: subscriptions

### ✅ customer.subscription.updated
- Atualiza dados da assinatura
- Período atual, status, cancelamento
- Tabela: subscriptions

### ✅ customer.subscription.deleted
- Marca assinatura como 'canceled'
- Define data de cancelamento
- Tabela: subscriptions

### ✅ customer.subscription.resumed
- **NOVO!** Reativa assinatura pausada
- Limpa cancelAtPeriodEnd e canceledAt
- Atualiza status para 'active'
- Tabela: subscriptions

## Troubleshooting

### Erro: "Invalid signature"
- Verificar STRIPE_WEBHOOK_SECRET
- Confirmar raw body middleware
- Checar Stripe-Signature header

### Erro: "Webhook not found"
- Verificar URL no Stripe Dashboard
- Confirmar Railway domain
- Testar endpoint /test

### Webhook não processa
- Verificar logs do servidor
- Checar tabela webhook_events
- Confirmar eventos configurados no Dashboard