# 🧠 TOIT NEXUS - Quantum ML System

Sistema completo de Machine Learning integrado ao TOIT NEXUS, oferecendo insights automáticos, predições e otimizações para workflows, dashboards e relatórios.

## 🚀 Características Principais

### ⚡ Insights ML em Tempo Real
- **Predições**: Análise preditiva baseada em dados históricos
- **Otimizações**: Identificação de oportunidades de melhoria
- **Detecção de Anomalias**: Identificação de padrões incomuns
- **Segmentação**: Agrupamento inteligente de dados
- **Recomendações**: Sugestões baseadas em análise de dados

### 🔄 Predições Automáticas
- Execução agendada de predições
- Múltiplas frequências (diária, semanal, mensal)
- Notificações automáticas
- Histórico completo de execuções

### 💳 Sistema de Créditos
- Controle de uso por tenant
- Planos de assinatura flexíveis
- Reset automático mensal
- Monitoramento em tempo real

### 🎯 Integração Completa
- Widgets para dashboards
- Aprimoramento de relatórios
- Integração em workflows
- API REST completa

## 📋 Estrutura do Sistema

```
quantum-ml/
├── backend/
│   ├── config/
│   │   └── ml-config.js              # Configurações ML
│   ├── services/
│   │   ├── ml/
│   │   │   ├── MLCreditsService.js   # Gerenciamento de créditos
│   │   │   ├── QuantumInsightsService.js # Processamento de insights
│   │   │   └── AutoPredictionsService.js # Predições automáticas
│   │   └── scheduler/
│   │       ├── MLSchedulerService.js # Scheduler principal
│   │       └── MLCreditsResetService.js # Reset de créditos
│   ├── middleware/
│   │   └── ml/
│   │       └── checkMLCredits.js     # Middleware de créditos
│   ├── routes/
│   │   └── ml/
│   │       ├── quantumRoutes.js      # Rotas de insights
│   │       ├── autoPredictionsRoutes.js # Rotas de predições
│   │       └── index.js              # Integração principal
│   └── database/
│       ├── migrations/               # Migrations do banco
│       └── seeders/                  # Dados iniciais
├── frontend/
│   ├── hooks/
│   │   └── useMLCredits.js           # Hook de créditos
│   ├── components/
│   │   └── ml/
│   │       ├── QuantumInsightButton.jsx # Botão de insights
│   │       ├── MLCreditsWidget.jsx   # Widget de créditos
│   │       ├── DashboardMLWidget.jsx # Widget para dashboards
│   │       ├── WorkflowMLIntegration.jsx # Integração workflows
│   │       └── ReportMLEnhancer.jsx  # Aprimoramento relatórios
│   └── pages/
│       ├── QuantumMLDashboard.jsx    # Dashboard principal
│       └── MLPlansConfiguration.jsx  # Configuração de planos
└── scripts/
    ├── setup-quantum-ml.js           # Setup completo
    └── health-check-ml.js            # Verificação de saúde
```

## 🛠️ Instalação e Configuração

### 1. Pré-requisitos
- Node.js 18+
- PostgreSQL 13+
- npm ou yarn

### 2. Configuração do Banco de Dados

```sql
-- Criar banco de dados
CREATE DATABASE toit_nexus;

-- Configurar variáveis de ambiente
DATABASE_URL=postgresql://user:password@localhost:5432/toit_nexus
```

### 3. Setup Automático

```bash
# Executar setup completo
node scripts/setup-quantum-ml.js

# Verificar saúde do sistema
node scripts/health-check-ml.js
```

### 4. Inicialização

```bash
# Iniciar servidor
npm start

# O sistema ML será inicializado automaticamente
```

## 📊 Planos de Assinatura

### 🆓 NEXUS Standard (Grátis)
- ❌ 0 créditos ML manuais/mês
- ✅ 3 predições automáticas/dia
- ✅ 5 workflows agendados
- ✅ Dashboards básicos
- ✅ Suporte por email

### ⚡ NEXUS Quantum Plus (R$ 99/mês)
- ✅ 5 créditos ML manuais/mês
- ✅ 6 predições automáticas/dia
- ✅ 15 workflows agendados
- ✅ Dashboards avançados
- ✅ API de predições
- ✅ Suporte prioritário

### 👑 NEXUS Quantum Premium (R$ 199/mês)
- ✅ 15 créditos ML manuais/mês
- ✅ 12 predições automáticas/dia
- ✅ 30 workflows agendados
- ✅ Dashboards premium
- ✅ API ilimitada
- ✅ Suporte dedicado
- ✅ Integrações personalizadas

## 🔧 API Endpoints

### Créditos ML
```http
GET    /api/ml-credits              # Verificar créditos
POST   /api/ml-credits/setup        # Configurar plano
GET    /api/ml-credits/history      # Histórico de uso
GET    /api/ml-credits/stats        # Estatísticas
```

### Insights ML
```http
POST   /api/quantum/insight         # Executar insight
POST   /api/quantum/predict         # Predição específica
POST   /api/quantum/optimize        # Otimização
```

### Predições Automáticas
```http
GET    /api/auto-predictions        # Listar predições
POST   /api/auto-predictions        # Criar predição
GET    /api/auto-predictions/:id    # Detalhes
PUT    /api/auto-predictions/:id    # Atualizar
DELETE /api/auto-predictions/:id    # Remover
POST   /api/auto-predictions/:id/toggle # Ativar/desativar
```

### Status do Sistema
```http
GET    /api/quantum-ml/status       # Status dos serviços ML
```

## 💻 Uso no Frontend

### Hook de Créditos
```javascript
import { useMLCredits } from '../hooks/useMLCredits';

function MyComponent() {
  const {
    credits,
    hasEnoughCredits,
    setupCredits,
    isLoading
  } = useMLCredits();

  return (
    <div>
      <p>Créditos: {credits.available}/{credits.total}</p>
      {hasEnoughCredits(1) && <button>Executar Insight</button>}
    </div>
  );
}
```

### Botão de Insight
```javascript
import { QuantumInsightButton } from '../components/ml/QuantumInsightButton';

function Dashboard() {
  const data = [
    { date: '2024-01-01', value: 100 },
    { date: '2024-01-02', value: 110 }
  ];

  return (
    <QuantumInsightButton
      data={data}
      insightType="prediction"
      onSuccess={(result) => console.log(result)}
    >
      Gerar Predição
    </QuantumInsightButton>
  );
}
```

### Widget de Dashboard
```javascript
import { DashboardMLWidget } from '../components/ml/DashboardMLWidget';

function Dashboard() {
  return (
    <DashboardMLWidget
      title="Vendas ML"
      data={salesData}
      dataType="sales"
      autoInsights={true}
    />
  );
}
```

## 🔄 Scheduler e Automação

### Configuração de Predições Automáticas
```javascript
// Criar predição automática
const prediction = {
  predictionType: 'sales_forecast',
  predictionName: 'Previsão de Vendas Diária',
  scheduleFrequency: 'daily',
  scheduleTime: '09:00:00',
  dataSourceConfig: {
    lookback_days: 30,
    forecast_days: 7
  }
};
```

### Jobs do Scheduler
- **Verificação de Predições**: A cada 5 minutos
- **Limpeza Diária**: Todos os dias às 2h
- **Estatísticas**: A cada hora
- **Health Check**: A cada 15 minutos
- **Reset de Créditos**: Todo dia 1º do mês

## 📈 Monitoramento

### Health Check
```bash
# Verificação completa
node scripts/health-check-ml.js

# Verificação via API
curl http://localhost:3000/api/quantum-ml/status
```

### Logs do Sistema
```bash
# Logs do scheduler
grep "ML-SCHEDULER" logs/app.log

# Logs de créditos
grep "ML-CREDITS" logs/app.log

# Logs de insights
grep "QUANTUM-INSIGHTS" logs/app.log
```

## 🛡️ Segurança

### Validações
- Verificação de créditos antes de cada operação
- Validação de dados de entrada
- Rate limiting por tenant
- Logs de auditoria completos

### Controle de Acesso
- Middleware de autenticação
- Verificação de tenant ID
- Controle por plano de assinatura

## 🚨 Troubleshooting

### Problemas Comuns

#### Créditos não resetando
```bash
# Verificar serviço de reset
node scripts/health-check-ml.js

# Reset manual
node -e "require('./services/scheduler/MLCreditsResetService').forceResetTenant('tenant-id')"
```

#### Predições não executando
```bash
# Verificar scheduler
curl http://localhost:3000/api/quantum-ml/status

# Reconfigurar jobs
# (Reiniciar servidor)
```

#### Insights falhando
```bash
# Verificar logs
grep "QUANTUM-INSIGHTS" logs/app.log

# Testar manualmente
curl -X POST http://localhost:3000/api/quantum/insight \
  -H "Content-Type: application/json" \
  -d '{"data":[{"date":"2024-01-01","value":100}],"insightType":"prediction"}'
```

## 📞 Suporte

Para suporte técnico:
- 📧 Email: suporte@toit.com.br
- 📱 WhatsApp: +55 11 99999-9999
- 🌐 Portal: https://suporte.toit.com.br

## 📄 Licença

Copyright © 2024 TOIT. Todos os direitos reservados.

---

🎯 **O sistema Quantum ML está pronto para revolucionar seus dados com inteligência artificial!**
