# 📚 DOCUMENTAÇÃO TÉCNICA COMPLETA - TOIT NEXUS

## 📋 **ÍNDICE**

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Arquitetura](#arquitetura)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [APIs e Endpoints](#apis-e-endpoints)
6. [Banco de Dados](#banco-de-dados)
7. [Autenticação e Autorização](#autenticação-e-autorização)
8. [Módulos Principais](#módulos-principais)
9. [Integração de Sistemas](#integração-de-sistemas)
10. [Testes](#testes)
11. [Deploy e DevOps](#deploy-e-devops)
12. [Monitoramento](#monitoramento)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 **VISÃO GERAL DO SISTEMA**

O **TOIT NEXUS** é uma plataforma empresarial completa que integra:

- **Gestão de Clientes (CRM)**
- **Automação de Workflows**
- **Machine Learning Adaptativo**
- **Computação Quântica**
- **Comunicação Integrada (Chat/Email/Calendário)**
- **Dashboards Personalizados por Persona**
- **Sistema Multi-tenant**

### 🎯 **Objetivos Principais:**
- Centralizar operações empresariais
- Automatizar processos repetitivos
- Fornecer insights inteligentes via ML/IA
- Acelerar computações com tecnologia quântica
- Personalizar experiência por tipo de usuário

---

## 🏗️ **ARQUITETURA**

### **Arquitetura Geral:**
```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│                    API GATEWAY                              │
├─────────────────────────────────────────────────────────────┤
│  AUTH    │  USER   │  TENANT │  CLIENT │  WORKFLOW │  ML    │
│ SERVICE  │ SERVICE │ SERVICE │ SERVICE │  SERVICE  │SERVICE │
├─────────────────────────────────────────────────────────────┤
│ QUANTUM  │  EMAIL  │  CHAT   │CALENDAR │ANALYTICS  │NOTIF   │
│ SERVICE  │ SERVICE │ SERVICE │ SERVICE │  SERVICE  │SERVICE │
├─────────────────────────────────────────────────────────────┤
│              INTEGRATION HUB (Event Bus)                   │
├─────────────────────────────────────────────────────────────┤
│                    DATABASE LAYER                           │
│  PostgreSQL │  Redis  │  MongoDB │  InfluxDB │  MinIO      │
└─────────────────────────────────────────────────────────────┘
```

### **Padrões Arquiteturais:**
- **Microserviços:** Serviços independentes e escaláveis
- **Event-Driven:** Comunicação via eventos assíncronos
- **Multi-tenant:** Isolamento de dados por empresa
- **API-First:** APIs RESTful bem definidas
- **Responsive Design:** Interface adaptável

---

## 💻 **TECNOLOGIAS UTILIZADAS**

### **Frontend:**
- **React 18** - Framework principal
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework de estilos
- **shadcn/ui** - Componentes de UI
- **Radix UI** - Primitivos acessíveis
- **Recharts** - Gráficos e visualizações
- **date-fns** - Manipulação de datas
- **Lucide React** - Ícones

### **Backend:**
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco principal
- **Redis** - Cache e sessões
- **MongoDB** - Dados não-relacionais
- **InfluxDB** - Métricas e time-series
- **MinIO** - Storage de arquivos

### **Infraestrutura:**
- **Docker** - Containerização
- **Kubernetes** - Orquestração
- **Nginx** - Proxy reverso
- **Prometheus** - Monitoramento
- **Grafana** - Dashboards de métricas
- **ELK Stack** - Logs centralizados

---

## 📁 **ESTRUTURA DO PROJETO**

```
TOIT-Nexus/
├── client/                     # Frontend React
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   │   ├── auth/          # Autenticação
│   │   │   ├── dashboard/     # Dashboards
│   │   │   ├── calendar/      # Calendário
│   │   │   ├── email/         # Email
│   │   │   ├── chat/          # Chat
│   │   │   └── ui/            # Componentes base
│   │   ├── pages/             # Páginas principais
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Utilitários
│   │   └── styles/            # Estilos globais
│   ├── public/                # Arquivos estáticos
│   └── package.json           # Dependências frontend
├── server/                     # Backend Node.js
│   ├── routes/                # Rotas da API
│   ├── models/                # Modelos de dados
│   ├── middleware/            # Middlewares
│   ├── services/              # Lógica de negócio
│   ├── utils/                 # Utilitários backend
│   ├── config/                # Configurações
│   └── package.json           # Dependências backend
├── tests/                      # Testes automatizados
├── docs/                       # Documentação
├── docker/                     # Configurações Docker
├── k8s/                        # Manifests Kubernetes
└── README.md                   # Documentação principal
```

---

## 🔌 **APIS E ENDPOINTS**

### **Autenticação:**
```
POST   /api/auth/login          # Login de usuário
POST   /api/auth/logout         # Logout
POST   /api/auth/refresh        # Refresh token
POST   /api/auth/forgot         # Esqueci senha
POST   /api/auth/reset          # Reset senha
```

### **Usuários:**
```
GET    /api/users               # Listar usuários
POST   /api/users               # Criar usuário
GET    /api/users/:id           # Obter usuário
PUT    /api/users/:id           # Atualizar usuário
DELETE /api/users/:id           # Deletar usuário
```

### **Tenants:**
```
GET    /api/tenants             # Listar tenants
POST   /api/tenants             # Criar tenant
GET    /api/tenants/:id         # Obter tenant
PUT    /api/tenants/:id         # Atualizar tenant
DELETE /api/tenants/:id         # Deletar tenant
```

### **Clientes:**
```
GET    /api/clients             # Listar clientes
POST   /api/clients             # Criar cliente
GET    /api/clients/:id         # Obter cliente
PUT    /api/clients/:id         # Atualizar cliente
DELETE /api/clients/:id         # Deletar cliente
```

### **Workflows:**
```
GET    /api/workflows           # Listar workflows
POST   /api/workflows           # Criar workflow
GET    /api/workflows/:id       # Obter workflow
PUT    /api/workflows/:id       # Atualizar workflow
POST   /api/workflows/:id/execute # Executar workflow
```

### **Machine Learning:**
```
POST   /api/ml/predict          # Fazer predição
POST   /api/ml/train            # Treinar modelo
GET    /api/ml/models           # Listar modelos
POST   /api/ml/analyze          # Análise de dados
```

### **Quantum:**
```
POST   /api/quantum/optimize    # Otimização quântica
POST   /api/quantum/search      # Busca quântica
POST   /api/quantum/simulate    # Simulação quântica
GET    /api/quantum/status      # Status do sistema
```

### **Email:**
```
POST   /api/email/send          # Enviar email
GET    /api/email/inbox         # Caixa de entrada
GET    /api/email/:id           # Obter email
POST   /api/email/templates     # Criar template
```

### **Chat:**
```
GET    /api/chat/conversations  # Listar conversas
POST   /api/chat/messages       # Enviar mensagem
GET    /api/chat/messages/:id   # Obter mensagens
POST   /api/chat/call           # Iniciar chamada
```

### **Calendário:**
```
GET    /api/calendar/events     # Listar eventos
POST   /api/calendar/events     # Criar evento
PUT    /api/calendar/events/:id # Atualizar evento
DELETE /api/calendar/events/:id # Deletar evento
```

---

## 🗄️ **BANCO DE DADOS**

### **PostgreSQL (Dados Principais):**

#### **Tabela: users**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Tabela: tenants**
```sql
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Tabela: clients**
```sql
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Tabela: workflows**
```sql
CREATE TABLE workflows (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Redis (Cache e Sessões):**
```
# Sessões de usuário
session:{sessionId} -> {userId, tenantId, expires}

# Cache de dados
cache:users:{tenantId} -> [user objects]
cache:clients:{tenantId} -> [client objects]

# Rate limiting
rate_limit:{userId}:{endpoint} -> {count, expires}
```

### **MongoDB (Dados Não-Relacionais):**
```javascript
// Coleção: ml_predictions
{
  _id: ObjectId,
  userId: Number,
  tenantId: Number,
  model: String,
  input: Object,
  prediction: Object,
  confidence: Number,
  timestamp: Date
}

// Coleção: quantum_computations
{
  _id: ObjectId,
  userId: Number,
  tenantId: Number,
  problem: String,
  input: Object,
  result: Object,
  speedup: Number,
  timestamp: Date
}

// Coleção: chat_messages
{
  _id: ObjectId,
  conversationId: String,
  senderId: Number,
  content: String,
  type: String,
  timestamp: Date,
  metadata: Object
}
```

---

## 🔐 **AUTENTICAÇÃO E AUTORIZAÇÃO**

### **Fluxo de Autenticação:**
1. **Login:** Usuário fornece email/senha
2. **Validação:** Verificação no banco de dados
3. **JWT:** Geração de token JWT com claims
4. **Refresh:** Token de refresh para renovação
5. **Logout:** Invalidação do token

### **Estrutura do JWT:**
```javascript
{
  "sub": "user_id",
  "tenant_id": "tenant_id",
  "role": "user_role",
  "permissions": ["read", "write", "admin"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

### **Níveis de Autorização:**
- **SUPER_ADMIN:** Acesso total ao sistema
- **TENANT_ADMIN:** Administrador da empresa
- **MANAGER:** Gerente de departamento
- **EMPLOYEE:** Funcionário padrão

### **Middleware de Autorização:**
```javascript
const authorize = (requiredRole) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const hasPermission = checkPermission(userRole, requiredRole);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    next();
  };
};
```

---

## 🧩 **MÓDULOS PRINCIPAIS**

### **1. Sistema de Autenticação**
- **Localização:** `server/auth-system.js`
- **Funcionalidades:** Login, logout, refresh tokens, recuperação de senha
- **Segurança:** Bcrypt, JWT, rate limiting

### **2. Gestão Multi-tenant**
- **Localização:** `server/tenant-management.js`
- **Funcionalidades:** Isolamento de dados, configurações por tenant
- **Escalabilidade:** Suporte a milhares de tenants

### **3. Engine de Workflows**
- **Localização:** `server/workflow-engine.js`
- **Funcionalidades:** Criação, execução, monitoramento de workflows
- **Flexibilidade:** Drag-and-drop, condições, loops

### **4. ML Adaptativo**
- **Localização:** `server/enhanced-ml-adaptive.js`
- **Funcionalidades:** Predições personalizadas, aprendizado contínuo
- **Personalização:** Adaptação por persona de usuário

### **5. Interface Quântica**
- **Localização:** `server/quantum-simplified-interface.js`
- **Funcionalidades:** Otimização, busca, simulação quântica
- **Usabilidade:** Interface simplificada para usuários finais

### **6. Sistema de Comunicação**
- **Localização:** `client/src/components/chat/`
- **Funcionalidades:** Chat, vídeo, áudio, compartilhamento
- **Tempo Real:** WebSockets, notificações push

### **7. Calendário Profissional**
- **Localização:** `client/src/components/calendar/`
- **Funcionalidades:** Eventos, agendamento, sincronização
- **Integração:** Email, notificações, workflows

### **8. Email Avançado**
- **Localização:** `client/src/components/email/`
- **Funcionalidades:** Templates, filtros, anexos
- **Automação:** Integração com workflows

### **9. Dashboards Personalizados**
- **Localização:** `client/src/components/dashboard/`
- **Funcionalidades:** KPIs por persona, widgets customizáveis
- **Visualização:** Gráficos interativos, métricas em tempo real

---

## 🔗 **INTEGRAÇÃO DE SISTEMAS**

### **Integration Hub:**
- **Localização:** `server/integration-hub.js`
- **Função:** Orquestração central de todos os serviços
- **Padrão:** Event-driven architecture

### **Event Bus:**
```javascript
// Eventos de sistema
system:startup
system:shutdown
service:health
service:error

// Eventos de negócio
user:created
tenant:created
workflow:executed
ml:prediction
quantum:computation
```

### **Health Checks:**
- **Frequência:** A cada 30 segundos
- **Métricas:** Response time, uptime, error rate
- **Alertas:** Notificações automáticas para problemas

### **Cache Strategy:**
- **L1 Cache:** Redis para dados frequentes
- **L2 Cache:** Aplicação para objetos computados
- **TTL:** Configurável por tipo de dado

---

## 🧪 **TESTES**

### **Suíte de Testes:**
- **Localização:** `tests/comprehensive-test-suite.js`
- **Cobertura:** Unit, Integration, E2E, Performance, Security

### **Tipos de Teste:**

#### **Unit Tests:**
- Modelos de dados
- Funções utilitárias
- Componentes isolados
- Lógica de negócio

#### **Integration Tests:**
- APIs entre serviços
- Banco de dados
- Cache
- Event bus

#### **E2E Tests:**
- Jornadas de usuário
- Fluxos completos
- Interface de usuário
- Workflows end-to-end

#### **Performance Tests:**
- Tempo de resposta
- Throughput
- Uso de memória
- Concorrência

#### **Security Tests:**
- Autenticação
- Autorização
- Injeção SQL
- XSS Protection

### **Execução dos Testes em Produção Railway:**
```bash
# Todos os testes em produção
node tests/comprehensive-system-test.js

# Teste 6-Sigma completo
node test-6sigma-complete.js

# Verificar status Railway
curl https://api.toit.com.br/api/health
```

---

## 🚀 **DEPLOY E DEVOPS**

### **Deploy Railway:**
```yaml
# railway.toml para frontend
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm run preview"
restartPolicyType = "ON_FAILURE"
```

### **Configuração Railway:**
```yaml
# Variáveis de Ambiente Railway
VITE_API_URL=https://api.toit.com.br
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
BACKEND_PUBLIC_URL=https://api.toit.com.br
FRONTEND_PUBLIC_URL=https://nexus.toit.com.br
```

### **Deploy Automático Railway:**
```yaml
# Auto-deploy via GitHub
# Railway detecta mudanças no branch main
# Deploy automático para:
# - Frontend: https://nexus.toit.com.br
# - Backend: https://api.toit.com.br
# - Suporte: https://supnexus.toit.com.br
```

---

## 📊 **MONITORAMENTO**

### **Métricas Principais:**
- **Performance:** Response time, throughput
- **Disponibilidade:** Uptime, health checks
- **Recursos:** CPU, memória, disco
- **Negócio:** Usuários ativos, workflows executados

### **Alertas:**
- **Críticos:** Sistema indisponível
- **Warnings:** Performance degradada
- **Info:** Eventos de negócio importantes

### **Dashboards:**
- **Operacional:** Métricas técnicas
- **Negócio:** KPIs empresariais
- **Segurança:** Tentativas de acesso, anomalias

---

## 🔧 **TROUBLESHOOTING**

### **Problemas Comuns:**

#### **1. Erro de Autenticação**
```
Sintoma: 401 Unauthorized
Causa: Token expirado ou inválido
Solução: Renovar token ou fazer login novamente
```

#### **2. Performance Lenta**
```
Sintoma: Resposta > 2 segundos
Causa: Cache inválido ou query lenta
Solução: Verificar cache Redis e otimizar queries
```

#### **3. Erro de Integração**
```
Sintoma: Serviço não responde
Causa: Serviço indisponível ou timeout
Solução: Verificar health checks e logs
```

### **Logs Importantes:**
```bash
# Logs de aplicação
tail -f /var/log/toit-nexus/app.log

# Logs de erro
tail -f /var/log/toit-nexus/error.log

# Logs de acesso
tail -f /var/log/nginx/access.log
```

### **Comandos Úteis:**
```bash
# Status dos serviços
kubectl get pods

# Logs de um pod
kubectl logs -f pod-name

# Restart de serviço
kubectl rollout restart deployment/service-name

# Verificar recursos
kubectl top nodes
kubectl top pods
```

---

**📋 Documentação gerada automaticamente em 16 de Agosto de 2025**  
**🔧 Status: DOCUMENTAÇÃO TÉCNICA COMPLETA**
