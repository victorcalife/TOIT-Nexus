#!/bin/bash

# DEPLOY SCRIPT - TOIT NEXUS
# Script automatizado para deploy em produção
# Suporta Docker Compose e Kubernetes

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="toit-nexus"
DOCKER_REGISTRY="your-registry.com"
VERSION=${1:-latest}
ENVIRONMENT=${2:-production}
DEPLOY_TYPE=${3:-docker}  # docker or k8s

echo -e "${BLUE}🚀 TOIT NEXUS DEPLOYMENT SCRIPT${NC}"
echo -e "${BLUE}=================================${NC}"
echo -e "Version: ${GREEN}${VERSION}${NC}"
echo -e "Environment: ${GREEN}${ENVIRONMENT}${NC}"
echo -e "Deploy Type: ${GREEN}${DEPLOY_TYPE}${NC}"
echo ""

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Verificando pré-requisitos..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose não está instalado"
        exit 1
    fi
    
    # Check kubectl for Kubernetes deployment
    if [ "$DEPLOY_TYPE" = "k8s" ] && ! command -v kubectl &> /dev/null; then
        log_error "kubectl não está instalado"
        exit 1
    fi
    
    log_success "Pré-requisitos verificados"
}

# Build Docker images
build_images() {
    log_info "Construindo imagens Docker..."
    
    # Build frontend
    log_info "Construindo frontend..."
    docker build -t ${PROJECT_NAME}/frontend:${VERSION} ./client
    
    # Build backend
    log_info "Construindo backend..."
    docker build -t ${PROJECT_NAME}/backend:${VERSION} ./server
    
    # Tag images for registry
    if [ "$ENVIRONMENT" = "production" ]; then
        docker tag ${PROJECT_NAME}/frontend:${VERSION} ${DOCKER_REGISTRY}/${PROJECT_NAME}/frontend:${VERSION}
        docker tag ${PROJECT_NAME}/backend:${VERSION} ${DOCKER_REGISTRY}/${PROJECT_NAME}/backend:${VERSION}
    fi
    
    log_success "Imagens construídas com sucesso"
}

# Push images to registry
push_images() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Enviando imagens para o registry..."
        
        docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}/frontend:${VERSION}
        docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}/backend:${VERSION}
        
        log_success "Imagens enviadas para o registry"
    fi
}

# Setup environment files
setup_environment() {
    log_info "Configurando arquivos de ambiente..."
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env.${ENVIRONMENT}" ]; then
        log_warning "Arquivo .env.${ENVIRONMENT} não encontrado, criando template..."
        cat > .env.${ENVIRONMENT} << EOF
# TOIT NEXUS - ${ENVIRONMENT} Environment
NODE_ENV=${ENVIRONMENT}
PORT=5000

# Database
POSTGRES_PASSWORD=your_secure_password_here
REDIS_PASSWORD=your_redis_password_here
MONGO_PASSWORD=your_mongo_password_here

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# External Services
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Monitoring
GRAFANA_PASSWORD=admin_password_here

# Storage
MINIO_USER=admin
MINIO_PASSWORD=admin_password_here

# Backup
BACKUP_S3_BUCKET=toit-nexus-backups
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret

# InfluxDB
INFLUXDB_USER=admin
INFLUXDB_PASSWORD=admin_password_here
EOF
        log_warning "Por favor, edite o arquivo .env.${ENVIRONMENT} com suas configurações"
        exit 1
    fi
    
    # Copy environment file
    cp .env.${ENVIRONMENT} .env
    
    log_success "Ambiente configurado"
}

# Deploy with Docker Compose
deploy_docker() {
    log_info "Iniciando deploy com Docker Compose..."
    
    # Stop existing containers
    log_info "Parando containers existentes..."
    docker-compose -f docker-compose.production.yml down || true
    
    # Remove old images
    log_info "Removendo imagens antigas..."
    docker image prune -f || true
    
    # Start services
    log_info "Iniciando serviços..."
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for services to be ready
    log_info "Aguardando serviços ficarem prontos..."
    sleep 30
    
    # Check service health
    check_docker_health
    
    log_success "Deploy Docker concluído com sucesso"
}

# Deploy with Kubernetes
deploy_kubernetes() {
    log_info "Iniciando deploy com Kubernetes..."
    
    # Apply namespace
    kubectl apply -f k8s/namespace.yaml || true
    
    # Apply secrets and configmaps
    log_info "Aplicando secrets e configmaps..."
    kubectl apply -f k8s/secrets.yaml
    kubectl apply -f k8s/configmap.yaml
    
    # Apply persistent volumes
    log_info "Aplicando volumes persistentes..."
    kubectl apply -f k8s/pv.yaml
    
    # Apply deployments
    log_info "Aplicando deployments..."
    kubectl apply -f k8s/deployment.yaml
    
    # Apply services
    log_info "Aplicando services..."
    kubectl apply -f k8s/services.yaml
    
    # Apply ingress
    log_info "Aplicando ingress..."
    kubectl apply -f k8s/ingress.yaml
    
    # Wait for rollout
    log_info "Aguardando rollout dos deployments..."
    kubectl rollout status deployment/frontend-deployment -n toit-nexus
    kubectl rollout status deployment/backend-deployment -n toit-nexus
    
    # Check pod health
    check_k8s_health
    
    log_success "Deploy Kubernetes concluído com sucesso"
}

# Check Docker health
check_docker_health() {
    log_info "Verificando saúde dos serviços Docker..."
    
    # Check if containers are running
    if docker-compose -f docker-compose.production.yml ps | grep -q "Up"; then
        log_success "Containers estão rodando"
    else
        log_error "Alguns containers não estão rodando"
        docker-compose -f docker-compose.production.yml ps
        exit 1
    fi
    
    # Check frontend health
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        log_success "Frontend está saudável"
    else
        log_warning "Frontend pode não estar totalmente pronto"
    fi
    
    # Check backend health
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        log_success "Backend está saudável"
    else
        log_warning "Backend pode não estar totalmente pronto"
    fi
}

# Check Kubernetes health
check_k8s_health() {
    log_info "Verificando saúde dos pods Kubernetes..."
    
    # Check pod status
    kubectl get pods -n toit-nexus
    
    # Check if all pods are ready
    if kubectl get pods -n toit-nexus | grep -q "0/"; then
        log_warning "Alguns pods podem não estar prontos"
    else
        log_success "Todos os pods estão prontos"
    fi
}

# Run database migrations
run_migrations() {
    log_info "Executando migrações do banco de dados..."
    
    if [ "$DEPLOY_TYPE" = "docker" ]; then
        docker-compose -f docker-compose.production.yml exec backend npm run migrate
    else
        kubectl exec -n toit-nexus deployment/backend-deployment -- npm run migrate
    fi
    
    log_success "Migrações executadas"
}

# Setup monitoring
setup_monitoring() {
    log_info "Configurando monitoramento..."
    
    # Create monitoring directories
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    mkdir -p monitoring/prometheus
    
    # Copy monitoring configs
    if [ -f "monitoring/prometheus.yml" ]; then
        log_success "Configuração do Prometheus encontrada"
    else
        log_warning "Configuração do Prometheus não encontrada"
    fi
    
    log_success "Monitoramento configurado"
}

# Backup before deploy
backup_data() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Criando backup antes do deploy..."
        
        # Create backup directory
        BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p $BACKUP_DIR
        
        # Backup database (if running)
        if docker ps | grep -q postgres; then
            docker exec toit-nexus-postgres pg_dump -U postgres toit_nexus > $BACKUP_DIR/database.sql
            log_success "Backup do banco de dados criado"
        fi
        
        # Backup uploads
        if [ -d "uploads" ]; then
            cp -r uploads $BACKUP_DIR/
            log_success "Backup dos uploads criado"
        fi
        
        log_success "Backup concluído em $BACKUP_DIR"
    fi
}

# Main deployment function
main() {
    echo -e "${BLUE}🚀 Iniciando processo de deploy...${NC}"
    
    # Run all deployment steps
    check_prerequisites
    setup_environment
    backup_data
    build_images
    push_images
    setup_monitoring
    
    # Deploy based on type
    if [ "$DEPLOY_TYPE" = "k8s" ]; then
        deploy_kubernetes
    else
        deploy_docker
    fi
    
    # Run post-deploy tasks
    sleep 10
    run_migrations
    
    echo ""
    echo -e "${GREEN}🎉 DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
    echo -e "${GREEN}=================================${NC}"
    echo -e "Aplicação: ${BLUE}https://toit-nexus.com${NC}"
    echo -e "Monitoramento: ${BLUE}https://monitoring.toit-nexus.com${NC}"
    echo -e "Admin: ${BLUE}https://admin.toit-nexus.com${NC}"
    echo ""
    echo -e "${YELLOW}📋 Próximos passos:${NC}"
    echo -e "1. Verificar logs dos serviços"
    echo -e "2. Executar testes de fumaça"
    echo -e "3. Configurar alertas de monitoramento"
    echo -e "4. Notificar equipe sobre o deploy"
    echo ""
}

# Run main function
main
