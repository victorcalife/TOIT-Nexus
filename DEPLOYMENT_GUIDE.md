# 🚀 GUIA DE DEPLOY - TOIT NEXUS

## 📋 **PRÉ-REQUISITOS**

### **Software Necessário:**
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (para desenvolvimento)
- Git

### **Recursos Mínimos:**
- **CPU:** 4 cores
- **RAM:** 8GB
- **Disco:** 50GB SSD
- **Rede:** 100Mbps

---

## 🔧 **CONFIGURAÇÃO INICIAL**

### **1. Clone do Repositório:**
```bash
git clone https://github.com/victorcalife/TOIT-Nexus.git
cd TOIT-Nexus
```

### **2. Configuração de Ambiente:**
```bash
# Copiar arquivo de exemplo
cp .env.example .env.production

# Editar configurações
nano .env.production
```

### **3. Variáveis de Ambiente Essenciais:**
```env
# Ambiente
NODE_ENV=production
PORT=5000

# Banco de Dados
POSTGRES_PASSWORD=sua_senha_segura_aqui
REDIS_PASSWORD=sua_senha_redis_aqui
MONGO_PASSWORD=sua_senha_mongo_aqui

# Segurança
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui
ENCRYPTION_KEY=sua_chave_encriptacao_aqui

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app

# Monitoramento
GRAFANA_PASSWORD=senha_admin_grafana
```

---

## 🐳 **DEPLOY COM DOCKER**

### **Deploy Rápido:**
```bash
# Tornar script executável
chmod +x deploy.sh

# Executar deploy
./deploy.sh latest production docker
```

### **Deploy Manual:**
```bash
# 1. Construir imagens
docker build -t toit-nexus/frontend:latest ./client
docker build -t toit-nexus/backend:latest ./server

# 2. Iniciar serviços
docker-compose -f docker-compose.production.yml up -d

# 3. Verificar status
docker-compose -f docker-compose.production.yml ps
```

### **Comandos Úteis:**
```bash
# Ver logs
docker-compose -f docker-compose.production.yml logs -f

# Parar serviços
docker-compose -f docker-compose.production.yml down

# Restart específico
docker-compose -f docker-compose.production.yml restart backend

# Backup banco
docker exec toit-nexus-postgres pg_dump -U postgres toit_nexus > backup.sql
```

---

## ☸️ **DEPLOY COM KUBERNETES**

### **1. Preparar Cluster:**
```bash
# Criar namespace
kubectl create namespace toit-nexus

# Aplicar secrets
kubectl apply -f k8s/secrets.yaml

# Aplicar configmaps
kubectl apply -f k8s/configmap.yaml
```

### **2. Deploy Aplicação:**
```bash
# Deploy completo
kubectl apply -f k8s/deployment.yaml

# Verificar status
kubectl get pods -n toit-nexus
kubectl get services -n toit-nexus
```

### **3. Configurar Ingress:**
```bash
# Instalar NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Aplicar ingress
kubectl apply -f k8s/ingress.yaml
```

---

## 🔍 **VERIFICAÇÃO PÓS-DEPLOY**

### **1. Health Checks:**
```bash
# Frontend
curl http://localhost:3000/health

# Backend
curl http://localhost:5000/health

# Banco de dados
docker exec toit-nexus-postgres pg_isready -U postgres
```

### **2. Testes de Fumaça:**
```bash
# Executar testes
npm run test:smoke

# Verificar APIs principais
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@toit.com","password":"admin123"}'
```

### **3. Monitoramento:**
- **Grafana:** http://localhost:3001 (admin/senha_configurada)
- **Prometheus:** http://localhost:9090
- **Kibana:** http://localhost:5601

---

## 📊 **MONITORAMENTO E LOGS**

### **Dashboards Principais:**
1. **Sistema:** CPU, RAM, Disco, Rede
2. **Aplicação:** Response time, throughput, errors
3. **Banco:** Conexões, queries, performance
4. **Negócio:** Usuários ativos, workflows executados

### **Logs Centralizados:**
```bash
# Ver logs em tempo real
docker-compose logs -f backend frontend

# Buscar erros
docker-compose logs backend | grep ERROR

# Logs específicos
docker logs toit-nexus-backend --tail 100
```

### **Alertas Configurados:**
- Sistema indisponível
- CPU > 80%
- RAM > 90%
- Disco > 85%
- Response time > 2s
- Error rate > 5%

---

## 🔒 **SEGURANÇA**

### **SSL/TLS:**
```bash
# Gerar certificados (Let's Encrypt)
certbot certonly --webroot -w /var/www/html -d toit-nexus.com

# Configurar no Nginx
cp /etc/letsencrypt/live/toit-nexus.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/toit-nexus.com/privkey.pem nginx/ssl/
```

### **Firewall:**
```bash
# Portas necessárias
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### **Backup Automático:**
```bash
# Configurar cron para backup diário
0 2 * * * /path/to/backup-script.sh
```

---

## 🔄 **ATUALIZAÇÕES**

### **Rolling Update:**
```bash
# Docker
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d

# Kubernetes
kubectl set image deployment/backend-deployment backend=toit-nexus/backend:v2.0 -n toit-nexus
kubectl rollout status deployment/backend-deployment -n toit-nexus
```

### **Rollback:**
```bash
# Docker
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d

# Kubernetes
kubectl rollout undo deployment/backend-deployment -n toit-nexus
```

---

## 🆘 **TROUBLESHOOTING**

### **Problemas Comuns:**

#### **1. Containers não iniciam:**
```bash
# Verificar logs
docker-compose logs

# Verificar recursos
docker system df
docker system prune
```

#### **2. Banco não conecta:**
```bash
# Verificar status
docker exec toit-nexus-postgres pg_isready

# Resetar senha
docker exec -it toit-nexus-postgres psql -U postgres -c "ALTER USER postgres PASSWORD 'nova_senha';"
```

#### **3. Performance lenta:**
```bash
# Verificar recursos
docker stats

# Limpar cache
docker exec toit-nexus-redis redis-cli FLUSHALL
```

#### **4. SSL não funciona:**
```bash
# Verificar certificados
openssl x509 -in nginx/ssl/toit-nexus.crt -text -noout

# Renovar certificados
certbot renew
```

---

## 📈 **ESCALABILIDADE**

### **Horizontal Scaling:**
```bash
# Docker Compose
docker-compose -f docker-compose.production.yml up -d --scale backend=3

# Kubernetes
kubectl scale deployment backend-deployment --replicas=5 -n toit-nexus
```

### **Load Balancing:**
- Nginx configurado para round-robin
- Health checks automáticos
- Failover automático

### **Auto-scaling (K8s):**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## 🎯 **CHECKLIST DE DEPLOY**

### **Pré-Deploy:**
- [ ] Backup dos dados
- [ ] Testes passando
- [ ] Configurações validadas
- [ ] Certificados válidos
- [ ] Recursos suficientes

### **Durante Deploy:**
- [ ] Monitorar logs
- [ ] Verificar health checks
- [ ] Testar funcionalidades críticas
- [ ] Validar performance

### **Pós-Deploy:**
- [ ] Testes de fumaça
- [ ] Verificar monitoramento
- [ ] Notificar equipe
- [ ] Documentar mudanças
- [ ] Configurar alertas

---

## 📞 **SUPORTE**

### **Contatos:**
- **DevOps:** devops@toit.com.br
- **Desenvolvimento:** dev@toit.com.br
- **Emergência:** +55 11 99999-9999

### **Documentação:**
- **API:** https://api.toit-nexus.com/docs
- **Wiki:** https://wiki.toit-nexus.com
- **Status:** https://status.toit-nexus.com

---

**📋 Guia gerado em 16 de Agosto de 2025**  
**🚀 Status: PRONTO PARA PRODUÇÃO**
