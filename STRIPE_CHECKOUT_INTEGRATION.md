# 🚀 Integração Stripe API - Checkout Interno

**Sistema completo de pagamento integrado sem redirecionamento externo**

---

## 🎯 **COMO FUNCIONA**

### **Fluxo Completamente Interno:**
```
Landing Page → API TOIT → Stripe API → Payment Intent → Usuário Criado Automaticamente
```

**✅ VANTAGENS:**
- Cliente nunca sai do seu site
- Controle total sobre a experiência
- Criação automática de usuário
- Integração metadata-driven (não depende de Price IDs)
- Suporte a múltiplos perfis

---

## 🔧 **CONFIGURAÇÃO INICIAL**

### **1. Variáveis de Ambiente (.env):**
```bash
# Chaves Stripe (que você já tem)
STRIPE_SECRET_KEY=sk_live_ou_test_...
STRIPE_PUBLISHABLE_KEY=pk_live_ou_test_...

# Webhook (se você ainda usar)
STRIPE_WEBHOOK_SECRET=whsec_... # Opcional
```

### **2. Instalar dependência Stripe no frontend:**
```bash
npm install @stripe/stripe-js
```

---

## 💳 **IMPLEMENTAÇÃO FRONTEND (Landing Page)**

### **JavaScript para Landing Page:**

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://js.stripe.com/v3/"></script>
</head>
<body>
    <!-- Seção de Preços -->
    <div class="pricing-section">
        <div class="plan-card" data-profile="basico">
            <h3>Plano Básico</h3>
            <p>R$ 29,90/mês</p>
            <button class="btn-checkout" data-profile="basico" data-cycle="monthly">
                Assinar Mensal
            </button>
            <button class="btn-checkout" data-profile="basico" data-cycle="yearly">
                Assinar Anual - R$ 299,00 (2 meses grátis)
            </button>
        </div>
        
        <div class="plan-card" data-profile="premium">
            <h3>Plano Premium</h3>
            <p>R$ 79,90/mês</p>
            <button class="btn-checkout" data-profile="premium" data-cycle="monthly">
                Assinar Mensal
            </button>
            <button class="btn-checkout" data-profile="premium" data-cycle="yearly">
                Assinar Anual - R$ 799,00 (2 meses grátis)
            </button>
        </div>
    </div>

    <!-- Modal de Checkout Integrado -->
    <div id="checkout-modal" class="modal">
        <div class="modal-content">
            <h3>Finalizar Assinatura</h3>
            
            <form id="customer-form">
                <input type="text" id="customer-name" placeholder="Nome completo" required>
                <input type="email" id="customer-email" placeholder="E-mail" required>
                <input type="tel" id="customer-phone" placeholder="Telefone (opcional)">
                <input type="text" id="customer-cpf" placeholder="CPF (opcional)">
            </form>
            
            <!-- Elemento do cartão Stripe -->
            <div id="card-element">
                <!-- Stripe Elements injeta aqui -->
            </div>
            <div id="card-errors" role="alert"></div>
            
            <button id="submit-payment" disabled>
                <span id="payment-text">Processar Pagamento</span>
                <span id="payment-spinner" class="hidden">Processando...</span>
            </button>
            
            <button id="close-modal">Cancelar</button>
        </div>
    </div>

    <script>
        // Configuração Stripe
        const stripe = Stripe('pk_test_ou_live_SUA_CHAVE_PUBLICA');
        const elements = stripe.elements();

        // Configurar elemento do cartão
        const cardElement = elements.create('card');
        cardElement.mount('#card-element');

        let currentProfile = null;
        let currentCycle = null;
        let paymentIntentClientSecret = null;

        // Event listeners dos botões de checkout
        document.querySelectorAll('.btn-checkout').forEach(button => {
            button.addEventListener('click', async (e) => {
                currentProfile = e.target.dataset.profile;
                currentCycle = e.target.dataset.cycle;
                
                // Mostrar modal
                document.getElementById('checkout-modal').style.display = 'block';
                
                // Buscar dados do perfil
                await loadProfileData(currentProfile);
            });
        });

        // Carregar dados do perfil selecionado
        async function loadProfileData(profileSlug) {
            try {
                const response = await fetch('/api/stripe/profiles');
                const data = await response.json();
                
                const profile = data.profiles.find(p => p.slug === profileSlug);
                if (profile) {
                    const price = currentCycle === 'yearly' ? profile.price_yearly : profile.price_monthly;
                    document.querySelector('.modal h3').textContent = 
                        `${profile.name} - R$ ${price.toFixed(2)} (${currentCycle === 'yearly' ? 'Anual' : 'Mensal'})`;
                }
            } catch (error) {
                console.error('Erro ao carregar perfil:', error);
            }
        }

        // Processar pagamento
        document.getElementById('submit-payment').addEventListener('click', async (e) => {
            e.preventDefault();
            
            const submitButton = document.getElementById('submit-payment');
            const paymentText = document.getElementById('payment-text');
            const paymentSpinner = document.getElementById('payment-spinner');
            
            // Validar formulário
            const customerName = document.getElementById('customer-name').value;
            const customerEmail = document.getElementById('customer-email').value;
            
            if (!customerName || !customerEmail) {
                alert('Nome e e-mail são obrigatórios');
                return;
            }
            
            // Desabilitar botão e mostrar loading
            submitButton.disabled = true;
            paymentText.classList.add('hidden');
            paymentSpinner.classList.remove('hidden');
            
            try {
                // 1. Criar Payment Intent
                const paymentIntentResponse = await fetch('/api/stripe/create-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        profile_slug: currentProfile,
                        billing_cycle: currentCycle,
                        customer_name: customerName,
                        customer_email: customerEmail,
                        customer_phone: document.getElementById('customer-phone').value,
                        customer_cpf: document.getElementById('customer-cpf').value
                    })
                });
                
                const paymentIntentData = await paymentIntentResponse.json();
                
                if (!paymentIntentData.success) {
                    throw new Error(paymentIntentData.error || 'Erro ao criar pagamento');
                }
                
                // 2. Confirmar pagamento com Stripe
                const { error, paymentIntent } = await stripe.confirmCardPayment(
                    paymentIntentData.client_secret,
                    {
                        payment_method: {
                            card: cardElement,
                            billing_details: {
                                name: customerName,
                                email: customerEmail,
                                phone: document.getElementById('customer-phone').value
                            }
                        }
                    }
                );
                
                if (error) {
                    throw new Error(error.message);
                }
                
                // 3. Confirmar no backend e criar usuário
                const confirmResponse = await fetch('/api/stripe/confirm-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        payment_intent_id: paymentIntent.id
                    })
                });
                
                const confirmData = await confirmResponse.json();
                
                if (!confirmData.success) {
                    throw new Error(confirmData.error || 'Erro ao confirmar pagamento');
                }
                
                // 4. Sucesso! Mostrar dados de acesso
                showSuccessMessage(confirmData.user);
                
            } catch (error) {
                console.error('Erro no pagamento:', error);
                alert(`Erro: ${error.message}`);
                
                // Reabilitar botão
                submitButton.disabled = false;
                paymentText.classList.remove('hidden');
                paymentSpinner.classList.add('hidden');
            }
        });

        // Mostrar mensagem de sucesso
        function showSuccessMessage(userData) {
            document.getElementById('checkout-modal').innerHTML = `
                <div class="modal-content success">
                    <h3>🎉 Pagamento Realizado com Sucesso!</h3>
                    <p><strong>Sua conta foi criada automaticamente!</strong></p>
                    
                    <div class="access-info">
                        <h4>Dados de Acesso:</h4>
                        <p><strong>URL:</strong> <a href="${userData.login_url}" target="_blank">${userData.login_url}</a></p>
                        <p><strong>E-mail:</strong> ${userData.email}</p>
                        <p><strong>Senha temporária:</strong> <code>${userData.temporary_password}</code></p>
                        <p><strong>Plano:</strong> ${userData.profile.toUpperCase()}</p>
                    </div>
                    
                    <div class="next-steps">
                        <h4>Próximos Passos:</h4>
                        <ol>
                            <li>Faça login usando os dados acima</li>
                            <li>Altere sua senha no primeiro acesso</li>
                            <li>Explore suas funcionalidades disponíveis</li>
                        </ol>
                    </div>
                    
                    <button onclick="window.open('${userData.login_url}', '_blank')" class="btn-primary">
                        Acessar Minha Conta
                    </button>
                    <button onclick="location.reload()" class="btn-secondary">
                        Fechar
                    </button>
                </div>
            `;
        }

        // Fechar modal
        document.getElementById('close-modal').addEventListener('click', () => {
            document.getElementById('checkout-modal').style.display = 'none';
        });

        // Validação em tempo real do cartão
        cardElement.on('change', ({error}) => {
            const displayError = document.getElementById('card-errors');
            if (error) {
                displayError.textContent = error.message;
                document.getElementById('submit-payment').disabled = true;
            } else {
                displayError.textContent = '';
                document.getElementById('submit-payment').disabled = false;
            }
        });

    </script>

    <style>
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.4);
        }

        .modal-content {
            background-color: #fefefe;
            margin: 5% auto;
            padding: 30px;
            border-radius: 10px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .modal-content.success {
            max-width: 600px;
            text-align: center;
        }

        #customer-form {
            margin-bottom: 20px;
        }

        #customer-form input {
            width: 100%;
            padding: 12px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }

        #card-element {
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-bottom: 20px;
        }

        #card-errors {
            color: #fa755a;
            margin-bottom: 10px;
        }

        #submit-payment {
            width: 100%;
            padding: 15px;
            background-color: #007cba;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            margin-bottom: 10px;
        }

        #submit-payment:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }

        .hidden {
            display: none;
        }

        .access-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
        }

        .next-steps {
            text-align: left;
            margin: 20px 0;
        }

        .btn-primary, .btn-secondary {
            padding: 12px 24px;
            margin: 5px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }

        .btn-primary {
            background-color: #28a745;
            color: white;
        }

        .btn-secondary {
            background-color: #6c757d;
            color: white;
        }
    </style>
</body>
</html>
```

---

## 🎯 **ENDPOINTS API DISPONÍVEIS**

### **1. GET /api/stripe/config**
Retorna chave pública do Stripe para o frontend.

### **2. GET /api/stripe/profiles**
Lista todos os perfis de acesso disponíveis com preços e desconto anual calculado.

### **3. POST /api/stripe/create-payment-intent**
Cria Payment Intent e Customer no Stripe.

**Body:**
```json
{
  "profile_slug": "basico",
  "billing_cycle": "monthly",
  "customer_name": "João Silva",
  "customer_email": "joao@email.com",
  "customer_phone": "+5511999999999",
  "customer_cpf": "12345678901"
}
```

### **4. POST /api/stripe/confirm-payment**
Confirma pagamento e cria usuário automaticamente.

**Body:**
```json
{
  "payment_intent_id": "pi_1234567890abcdef"
}
```

---

## ✅ **RESULTADO FINAL**

### **Para o Cliente:**
1. **Escolhe plano** na landing page
2. **Preenche dados** no modal
3. **Insere cartão** (Stripe Elements)
4. **Clica pagar** - tudo interno
5. **Recebe dados de acesso** imediatamente
6. **Faz login** e usa o sistema

### **Para Você:**
1. **Zero trabalho manual**
2. **Cliente já criado e configurado**
3. **Perfil correto atribuído**
4. **Módulos ativados automaticamente**
5. **Controle total da experiência**

---

## 🚀 **PRÓXIMOS PASSOS**

1. ✅ **Configurar perfis** no `/admin/profile-builder`
2. ✅ **Implementar HTML/JS** da landing page  
3. ✅ **Testar fluxo completo** com cartão de teste
4. ✅ **Configurar email** de boas-vindas (opcional)
5. ✅ **Deploy em produção**

**O sistema está 100% pronto para receber pagamentos e criar usuários automaticamente sem sair do seu domínio!** 🎉

---

## 🧪 **TESTE COM CARTÃO STRIPE**

**Cartões de Teste:**
- **Sucesso:** `4242424242424242`
- **Falha:** `4000000000000002`
- **CVC:** Qualquer 3 dígitos
- **Data:** Qualquer data futura
