# 🚀 TOIT NEXUS - Sistema Enterprise Quântico

## 📋 Visão Geral

O **TOIT Nexus** é o primeiro sistema ERP quântico do mundo, combinando computação quântica real, inteligência artificial avançada (MILA) e interfaces modernas para criar uma plataforma empresarial revolucionária.

### 🌟 Características Principais

- **⚛️ Computação Quântica Real**: Algoritmos quânticos implementados (Grover, QAOA, VQE, QFT)
- **🧠 MILA AI Assistant**: Inteligência artificial com processamento de linguagem natural
- **📊 Relatórios Avançados**: Sistema completo com exportação PDF/Excel
- **🔄 Workflows Visuais**: Builder drag-and-drop com automação
- **💬 Chat em Tempo Real**: WebSocket com suporte a arquivos e chamadas
- **📧 Sistema de Email**: Composer completo com templates
- **📅 Calendário Profissional**: Múltiplas visualizações e sincronização
- **🔐 Multi-tenant**: Isolamento completo entre organizações
- **⚡ Performance**: Otimizado para alta carga e concorrência

## 🏗️ Arquitetura

### Frontend
```
client/
├── src/
│   ├── components/     # Componentes React reutilizáveis
│   ├── pages/         # Páginas da aplicação
│   ├── hooks/         # Custom hooks
│   ├── services/      # Serviços de API
│   ├── utils/         # Utilitários
│   └── styles/        # Estilos Tailwind CSS
├── public/            # Arquivos estáticos
└── dist/             # Build de produção
```

### Backend
```
server/
├── routes/           # Rotas da API
├── services/         # Lógica de negócio
├── middleware/       # Middlewares Express
├── quantum/          # Algoritmos quânticos
├── database/         # Schemas e migrações
├── tests/           # Testes automatizados
└── config/          # Configurações
```

### Banco de Dados
```sql
-- Principais tabelas
users              # Usuários do sistema
tenants            # Organizações (multi-tenant)
reports            # Relatórios criados
workflows          # Workflows automatizados
chat_sessions      # Sessões de chat
chat_messages      # Mensagens do chat
quantum_operations # Operações quânticas
system_logs        # Logs de auditoria
```

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- MySQL/PostgreSQL
- Git

### 1. Clone o Repositório
```bash
git clone https://github.com/victorcalife/TOIT-Nexus.git
cd TOIT-Nexus
```

### 2. Instalar Dependências
```bash
# Dependências principais
npm install

# Dependências do cliente
npm run client:install
```

### 3. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar variáveis obrigatórias
DATABASE_URL=postgresql://user:password@railway-host:5432/toit_nexus
JWT_SECRET=your_super_secret_key_here
SENDGRID_API_KEY=your_sendgrid_api_key
IBM_QUANTUM_TOKEN=your_ibm_quantum_token
```

### 4. Configurar Banco de Dados
```bash
# Executar migrações
npm run db:setup
```

### 5. Build e Iniciar
```bash
# Build do frontend
npm run client:build

# Iniciar servidor
npm start
```

## 🔧 Desenvolvimento

### Executar em Modo Desenvolvimento
```bash
# Frontend e backend simultaneamente
npm run dev

# Apenas frontend
npm run client:dev

# Apenas backend
npm run server:dev
```

### Executar Testes
```bash
# Todos os testes
npm test

# Testes específicos
npm run test:routes
npm run test:quantum
npm run test:mila
npm run test:database

# Testes com coverage
npm run test:coverage
```

## 📡 API Endpoints

### Autenticação
```http
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
POST /api/auth/logout
```

### Usuários
```http
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
PUT    /api/users/:id/password
```

### Relatórios
```http
GET    /api/reports
POST   /api/reports
GET    /api/reports/:id
PUT    /api/reports/:id
DELETE /api/reports/:id
POST   /api/reports/:id/execute
POST   /api/reports/:id/export
```

### Workflows
```http
GET    /api/workflows
POST   /api/workflows
GET    /api/workflows/:id
PUT    /api/workflows/:id
DELETE /api/workflows/:id
POST   /api/workflows/:id/execute
```

### Chat
```http
GET    /api/chat/sessions
POST   /api/chat/sessions
GET    /api/chat/sessions/:id/messages
POST   /api/chat/sessions/:id/messages
```

### Sistema Quântico
```http
POST   /api/quantum/process
GET    /api/quantum/algorithms
POST   /api/quantum/optimize
GET    /api/quantum/metrics
```

### MILA AI
```http
POST   /api/mila/chat
POST   /api/mila/analyze
POST   /api/mila/predict
GET    /api/mila/models
```

## ⚛️ Sistema Quântico

### Algoritmos Implementados

#### Algoritmo de Grover
```javascript
const grover = new GroversAlgorithm();
const result = await grover.search(database, target);
// Speedup: O(√N) vs O(N) clássico
```

#### QAOA (Quantum Approximate Optimization Algorithm)
```javascript
const qaoa = new QAOAAlgorithm();
const result = await qaoa.optimize(costFunction, constraints);
// Otimização combinatorial quântica
```

#### VQE (Variational Quantum Eigensolver)
```javascript
const vqe = new VQEAlgorithm();
const result = await vqe.findGroundState(hamiltonian);
// Química quântica e simulação molecular
```

#### Rede Neural Quântica
```javascript
const qnn = new QuantumNeuralNetwork({
  inputSize: 3,
  hiddenLayers: [4, 4],
  outputSize: 2,
  quantumLayers: 2
});
const result = await qnn.train(trainingData);
```

### Integração IBM Quantum
```javascript
const ibmQuantum = new IBMQuantumService();
await ibmQuantum.connect(process.env.IBM_QUANTUM_TOKEN);
const result = await ibmQuantum.executeCircuit(circuit, 'ibmq_qasm_simulator');
```

## 🧠 MILA AI Assistant

### Processamento de Linguagem Natural
```javascript
const mila = new MilaService();

// Análise de sentimento
const sentiment = await mila.analyzeSentiment({
  text: 'Estou muito satisfeito com os resultados!',
  language: 'pt-BR'
});

// Extração de entidades
const entities = await mila.extractEntities({
  text: 'João Silva trabalha na TOIT em São Paulo',
  language: 'pt-BR'
});

// Classificação de intenção
const intent = await mila.classifyIntent({
  text: 'Gostaria de criar um novo relatório',
  language: 'pt-BR'
});
```

### Análise de Dados Empresariais
```javascript
// Análise de vendas
const analysis = await mila.analyzeBusinessData({
  data: salesData,
  type: 'sales_analysis',
  metrics: ['revenue', 'profit', 'growth']
});

// Detecção de anomalias
const anomalies = await mila.detectAnomalies({
  data: timeSeriesData,
  threshold: 0.95,
  algorithm: 'isolation_forest'
});

// Predições
const predictions = await mila.generatePredictions({
  data: historicalData,
  horizon: 30, // 30 dias
  confidence: 0.95
});
```

### Integração Quântica
```javascript
// Processamento com enhancement quântico
const result = await mila.processWithQuantum({
  message: 'Otimize a alocação de recursos',
  data: resourceData,
  quantumEnhanced: true
});

// Treinamento de modelo quântico
const model = await mila.trainQuantumModel({
  data: trainingData,
  modelType: 'quantum_neural_network',
  quantumLayers: 3
});
```

## 🔐 Segurança

### Autenticação
- JWT tokens com expiração
- Refresh tokens
- Rate limiting
- Proteção contra ataques de força bruta

### Autorização
- Sistema de roles (super_admin, tenant_admin, user)
- Permissões granulares
- Isolamento multi-tenant
- Middleware de autorização

### Validação
- Validação de entrada com express-validator
- Sanitização de dados
- Proteção contra SQL injection
- Proteção contra XSS

### Criptografia
- Senhas com bcrypt (12 rounds)
- Dados sensíveis criptografados
- HTTPS obrigatório em produção
- Headers de segurança

## 📊 Monitoramento

### Métricas
- Tempo de resposta das APIs
- Uso de CPU e memória
- Operações quânticas por segundo
- Interações com MILA
- Erros e exceções

### Logs
- Logs estruturados em JSON
- Níveis de log configuráveis
- Rotação automática
- Integração com sistemas de monitoramento

### Health Checks
```http
GET /health
GET /api/auth/health
GET /api/quantum/health
GET /api/mila/health
```

## 🚀 Deploy

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
# Build completo
npm run build

# Deploy no Railway
npm run deploy

# Deploy com script completo
node deploy-production.js
```

### Docker
```bash
# Build da imagem
docker build -t toit-nexus .

# Executar container
docker run -p 3000:3000 toit-nexus
```

## 🧪 Testes

### Estrutura de Testes
```
server/tests/
├── routes.test.js      # Testes de rotas
├── quantum.test.js     # Testes quânticos
├── mila.test.js        # Testes MILA
├── database.test.js    # Testes de banco
├── auth.test.js        # Testes de autenticação
├── performance.test.js # Testes de performance
└── e2e.test.js        # Testes end-to-end
```

### Executar Testes
```bash
# Todos os testes
npm test

# Testes específicos
npm run test:routes
npm run test:quantum
npm run test:mila

# Testes em modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 📚 Documentação Adicional

- [🔧 Guia de Configuração](./configuration.md)
- [⚛️ Documentação Quântica](./quantum.md)
- [🧠 Guia da MILA](./mila.md)
- [🔐 Segurança](./security.md)
- [📊 Monitoramento](./monitoring.md)
- [🚀 Deploy](./deployment.md)
- [🧪 Testes](./testing.md)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- **Email**: suporte@toit.com.br
- **Website**: https://toit.com.br
- **Documentação**: https://docs.toit.com.br

---

**TOIT Nexus** - O futuro da gestão empresarial é quântico! 🚀⚛️
