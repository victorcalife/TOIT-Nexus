# 🔗 Guia de Integração Stripe → Perfis de Acesso

## 📋 **Como Funciona a Integração**

### 1. **Fluxo Automático:**
```
Landing Page → Stripe Checkout → Webhook → Perfil Atribuído → Usuário Criado
```

### 2. **Identificação por Price ID:**
- Cada perfil tem `stripe_price_id_monthly` e `stripe_price_id_yearly`
- O webhook identifica qual perfil ativar pelo Price ID recebido
- Sistema atribui automaticamente módulos e limites

---

## ✅ **Passos para Configurar:**

### **PASSO 1: Configurar Produtos no Stripe Dashboard**

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com)
2. Vá em **Produtos** → **Adicionar produto**
3. Crie os produtos conforme os perfis:

#### **Produto GRATUITO:**
- **Nome:** TOIT Nexus - Plano Gratuito
- **Descrição:** Teste gratuito com funcionalidades básicas
- **Preços:**
  - Mensal: R$ 0,00 (apenas para testes)

#### **Produto BÁSICO:**
- **Nome:** TOIT Nexus - Plano Básico  
- **Descrição:** Funcionalidades essenciais para iniciantes
- **Preços:**
  - Mensal: R$ 29,90
  - Anual: R$ 299,00 (equivale a 10 meses)

#### **Produto PREMIUM:**
- **Nome:** TOIT Nexus - Plano Premium
- **Descrição:** Automações e integrações avançadas
- **Preços:**
  - Mensal: R$ 79,90
  - Anual: R$ 799,00 (equivale a 10 meses)

#### **Produto ENTERPRISE:**
- **Nome:** TOIT Nexus - Plano Enterprise
- **Descrição:** Solução completa para grandes empresas
- **Preços:**
  - Mensal: R$ 199,90
  - Anual: R$ 1.999,00 (equivale a 10 meses)

### **PASSO 2: Copiar Price IDs do Stripe**

Após criar os produtos, copie os **Price IDs** (formato: `price_1234abcd...`):

```javascript
// Exemplo de Price IDs que você receberá:
GRATUITO_MENSAL = "price_1ABC123gratuito"
BASICO_MENSAL = "price_1ABC123basico"
BASICO_ANUAL = "price_1ABC123basicoanual"
PREMIUM_MENSAL = "price_1ABC123premium"
PREMIUM_ANUAL = "price_1ABC123premiumanual"
ENTERPRISE_MENSAL = "price_1ABC123enterprise"
ENTERPRISE_ANUAL = "price_1ABC123enterpriseanual"
```

### **PASSO 3: Configurar Perfis no TOIT Admin**

1. Acesse `/admin/profile-builder`
2. Edite cada perfil:
3. Na aba **"Preços e Limites"** → **"Integração Stripe"**:
   - **Product ID:** `prod_1234abcd` (do Stripe)
   - **Price ID Mensal:** `price_1234mensal` (do Stripe)  
   - **Price ID Anual:** `price_1234anual` (do Stripe)

### **PASSO 4: Links da Landing Page**

Na sua landing page, use estes formatos de link:

#### **Links de Checkout Direto:**
```html
<!-- Plano Básico Mensal -->
<a href="https://checkout.stripe.com/pay/cs_test_1234#fidkdWxOYHwnPyd1blpxblp2cHZxWjA0SzN2YnE1THVOTGl%2FVzVhNGd0YUJj" 
   class="btn-basico-mensal">
  Assinar Básico - R$ 29,90/mês
</a>

<!-- Plano Premium Anual -->
<a href="https://checkout.stripe.com/pay/cs_test_5678#fidkdWxOYHwnPyd1blpxblp2cHZxWjA0SzN2YnE1THVOTGl%2FVzVhNGd0YUJj"
   class="btn-premium-anual">
  Assinar Premium - R$ 799,00/ano (2 meses grátis)
</a>
```

#### **Ou usar Stripe Checkout Session programático:**
```javascript
// Exemplo para frontend da landing page
const createCheckoutSession = async (priceId, planName) => {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      priceId: priceId,
      planName: planName,
      successUrl: 'https://nexus.toit.com.br/success',
      cancelUrl: 'https://toit.com.br/pricing'
    })
  });
  
  const session = await response.json();
  window.location.href = session.url;
};

// Botões da landing page
document.getElementById('btn-basico').onclick = () => {
  createCheckoutSession('price_1ABC123basico', 'Básico');
};
```

---

## 🔄 **Fluxo Automático Completo:**

### **1. Cliente na Landing Page:**
- Escolhe plano (Básico, Premium, Enterprise)
- Clica em "Assinar"
- Vai para Stripe Checkout

### **2. Stripe Checkout:**
- Cliente preenche dados de pagamento
- Stripe processa pagamento
- Envia webhook para TOIT

### **3. Webhook TOIT (Automático):**
```typescript
// O que acontece automaticamente:
1. Recebe Price ID do Stripe (ex: "price_1ABC123premium")
2. Identifica perfil correspondente (PREMIUM) 
3. Cria tenant + usuário automaticamente
4. Atribui módulos configurados no perfil
5. Envia email com dados de acesso
6. Cliente já pode fazer login
```

### **4. Dados Criados Automaticamente:**
```javascript
// Tenant criado:
{
  name: "João Silva - Premium",
  slug: "joao-silva-premium",
  accessProfileId: "profile_premium_id",
  subscriptionPlan: "premium"
}

// Usuário criado:
{
  cpf: "12345678901", // do checkout
  email: "joao@email.com", // do checkout  
  firstName: "João",
  lastName: "Silva",
  password: "123456", // temporária
  role: "tenant_admin"
}

// Módulos ativos (automático baseado no perfil):
{
  email: true,
  apis: true,
  calendars: true,
  database: true,
  // ... conforme configuração do perfil Premium
}
```

---

## 📧 **Dados que o Cliente Recebe:**

### **Email Automático de Boas-vindas:**
```
Assunto: Bem-vindo ao TOIT Nexus - Sua conta foi criada!

Olá João Silva,

Sua assinatura do plano PREMIUM foi processada com sucesso!

DADOS DE ACESSO:
🌐 URL: https://nexus.toit.com.br  
👤 CPF: 123.456.789-01
🔑 Senha temporária: 123456

MÓDULOS INCLUSOS NO SEU PLANO:
✅ Gestão de Tarefas
✅ Query Builder  
✅ Construtor de Workflows
✅ Dashboards Personalizados
✅ Integração com APIs
✅ Conectividade E-mail
✅ Até 5 usuários
✅ 25GB de armazenamento

Faça login e altere sua senha no primeiro acesso.
```

---

## ✅ **Resultado Final:**

### **Para o CLIENTE:**
- ✅ Compra na landing page
- ✅ Dados de acesso por email em 2 minutos
- ✅ Login funcionando imediatamente  
- ✅ Apenas módulos do plano contratado visíveis
- ✅ Zero configuração manual necessária

### **Para a EQUIPE TOIT:**
- ✅ Zero trabalho manual
- ✅ Cliente já criado e configurado
- ✅ Pagamento processado automaticamente
- ✅ Perfil correto atribuído
- ✅ Relatórios de vendas automáticos

---

## 🚨 **Configurações Obrigatórias:**

### **Variáveis de Ambiente:**
```bash
# .env
STRIPE_SECRET_KEY=sk_test_51ABC123...
STRIPE_WEBHOOK_SECRET=whsec_1ABC123...
STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...
```

### **Webhook Endpoint:**
```
URL: https://nexus.toit.com.br/api/stripe/webhook
Eventos: invoice.payment_succeeded, customer.subscription.updated
```

### **Metadata Obrigatório no Checkout:**
```javascript
// Quando criar checkout session, incluir:
metadata: {
  tenant_id: "gerado_automaticamente",
  customer_name: "João Silva",
  customer_cpf: "12345678901", // se tiver
  subscription_type: "individual" // ou "company"
}
```

---

## 🎯 **Próximos Passos:**

1. ✅ **Configurar produtos no Stripe** (você faz)
2. ✅ **Copiar Price IDs** (você faz)  
3. ✅ **Configurar perfis no Admin** (você faz)
4. ✅ **Atualizar links da landing page** (você faz)
5. ✅ **Testar fluxo completo** (nós testamos juntos)

**O sistema já está 100% pronto para receber pagamentos e criar usuários automaticamente!** 🚀