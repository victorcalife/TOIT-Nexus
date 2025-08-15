#!/bin/bash

# 🚀 DEPLOY PRODUCTION - QUANTUM ML SYSTEM
# Script completo para deploy em produção do TOIT NEXUS 3.0

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="toit-nexus"
BACKUP_DIR="/backups/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="/var/log/deploy-$(date +%Y%m%d_%H%M%S).log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a $LOG_FILE
    exit 1
}

# Pre-deployment checks
pre_deploy_checks() {
    log "🔍 Executando verificações pré-deploy..."
    
    # Check if required environment variables are set
    required_vars=(
        "DATABASE_URL"
        "REDIS_URL"
        "JWT_SECRET"
        "ML_CREDITS_ENABLED"
        "QUANTUM_ALGORITHMS_ENABLED"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Variável de ambiente obrigatória não definida: $var"
        fi
    done
    
    # Check database connection
    log "Verificando conexão com banco de dados..."
    if ! npm run db:check; then
        error "Falha na conexão com banco de dados"
    fi
    
    # Check Redis connection
    log "Verificando conexão com Redis..."
    if ! npm run redis:check; then
        error "Falha na conexão com Redis"
    fi
    
    success "Verificações pré-deploy concluídas"
}

# Backup current system
backup_system() {
    log "💾 Criando backup do sistema atual..."
    
    mkdir -p $BACKUP_DIR
    
    # Backup database
    log "Backup do banco de dados..."
    pg_dump $DATABASE_URL > $BACKUP_DIR/database.sql
    
    # Backup application files
    log "Backup dos arquivos da aplicação..."
    tar -czf $BACKUP_DIR/app-files.tar.gz \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=logs \
        .
    
    # Backup environment variables
    log "Backup das variáveis de ambiente..."
    env | grep -E "(DATABASE_|REDIS_|JWT_|ML_|QUANTUM_)" > $BACKUP_DIR/env-vars.txt
    
    success "Backup criado em: $BACKUP_DIR"
}

# Install dependencies
install_dependencies() {
    log "📦 Instalando dependências..."
    
    # Clean install
    rm -rf node_modules package-lock.json
    npm ci --only=production
    
    success "Dependências instaladas"
}

# Run database migrations
run_migrations() {
    log "🗄️  Executando migrations do banco de dados..."
    
    # ML System migrations
    npm run migrate:ml
    
    # Verify migrations
    if ! npm run migrate:verify; then
        error "Falha na verificação das migrations"
    fi
    
    success "Migrations executadas com sucesso"
}

# Seed initial data
seed_data() {
    log "🌱 Inserindo dados iniciais..."
    
    # Seed ML plans
    npm run seed:ml-plans
    
    # Seed default configurations
    npm run seed:ml-config
    
    success "Dados iniciais inseridos"
}

# Build application
build_application() {
    log "🔨 Compilando aplicação..."
    
    # Build frontend
    npm run build:frontend
    
    # Build backend
    npm run build:backend
    
    # Verify build
    if [ ! -d "dist" ] || [ ! -d "build" ]; then
        error "Falha na compilação da aplicação"
    fi
    
    success "Aplicação compilada com sucesso"
}

# Deploy application
deploy_application() {
    log "🚀 Fazendo deploy da aplicação..."
    
    # Stop current application
    log "Parando aplicação atual..."
    pm2 stop $APP_NAME || true
    
    # Copy new files
    log "Copiando novos arquivos..."
    cp -r dist/* /var/www/$APP_NAME/
    cp -r build/* /var/www/$APP_NAME/
    
    # Update permissions
    chown -R www-data:www-data /var/www/$APP_NAME/
    chmod -R 755 /var/www/$APP_NAME/
    
    # Start application
    log "Iniciando nova versão..."
    pm2 start ecosystem.config.js --env production
    
    success "Deploy da aplicação concluído"
}

# Start schedulers
start_schedulers() {
    log "⏰ Iniciando schedulers..."
    
    # Start ML schedulers
    pm2 start scripts/ml-scheduler.js --name "ml-scheduler"
    
    # Start auto predictions
    pm2 start scripts/auto-predictions.js --name "auto-predictions"
    
    # Start monthly reset
    pm2 start scripts/monthly-reset.js --name "monthly-reset"
    
    success "Schedulers iniciados"
}

# Health checks
health_checks() {
    log "🏥 Executando verificações de saúde..."
    
    # Wait for application to start
    sleep 30
    
    # Check application health
    if ! curl -f http://localhost:3000/health; then
        error "Aplicação não está respondendo"
    fi
    
    # Check ML APIs
    if ! curl -f http://localhost:3000/api/ml-credits; then
        error "APIs ML não estão funcionando"
    fi
    
    # Check quantum engine
    if ! curl -f http://localhost:3000/api/quantum/health; then
        error "Quantum engine não está funcionando"
    fi
    
    success "Verificações de saúde concluídas"
}

# Run smoke tests
smoke_tests() {
    log "🧪 Executando smoke tests..."
    
    npm run test:smoke
    
    if [ $? -ne 0 ]; then
        error "Smoke tests falharam"
    fi
    
    success "Smoke tests concluídos"
}

# Setup monitoring
setup_monitoring() {
    log "📊 Configurando monitoramento..."
    
    # Setup log rotation
    logrotate -f /etc/logrotate.d/$APP_NAME
    
    # Setup monitoring alerts
    npm run setup:monitoring
    
    # Setup performance monitoring
    npm run setup:performance
    
    success "Monitoramento configurado"
}

# Cleanup
cleanup() {
    log "🧹 Limpando arquivos temporários..."
    
    # Clean old logs
    find /var/log -name "*.log" -mtime +30 -delete
    
    # Clean old backups (keep last 10)
    ls -t /backups/ | tail -n +11 | xargs -r rm -rf
    
    # Clean npm cache
    npm cache clean --force
    
    success "Limpeza concluída"
}

# Main deployment function
main() {
    log "🚀 Iniciando deploy do TOIT NEXUS 3.0 - Quantum ML System"
    log "Timestamp: $(date)"
    log "User: $(whoami)"
    log "Host: $(hostname)"
    
    # Execute deployment steps
    pre_deploy_checks
    backup_system
    install_dependencies
    run_migrations
    seed_data
    build_application
    deploy_application
    start_schedulers
    health_checks
    smoke_tests
    setup_monitoring
    cleanup
    
    success "🎉 Deploy concluído com sucesso!"
    log "📊 Estatísticas do deploy:"
    log "   - Backup criado em: $BACKUP_DIR"
    log "   - Log do deploy: $LOG_FILE"
    log "   - Aplicação disponível em: http://localhost:3000"
    log "   - Dashboard ML: http://localhost:3000/quantum-ml"
    
    # Send notification
    if [ ! -z "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"🚀 TOIT NEXUS 3.0 deploy concluído com sucesso!"}' \
            $SLACK_WEBHOOK
    fi
}

# Rollback function
rollback() {
    log "🔄 Iniciando rollback..."
    
    if [ -z "$1" ]; then
        error "Especifique o diretório de backup para rollback"
    fi
    
    ROLLBACK_DIR=$1
    
    if [ ! -d "$ROLLBACK_DIR" ]; then
        error "Diretório de backup não encontrado: $ROLLBACK_DIR"
    fi
    
    # Stop current application
    pm2 stop $APP_NAME
    
    # Restore database
    psql $DATABASE_URL < $ROLLBACK_DIR/database.sql
    
    # Restore application files
    tar -xzf $ROLLBACK_DIR/app-files.tar.gz -C /var/www/$APP_NAME/
    
    # Restart application
    pm2 start $APP_NAME
    
    success "Rollback concluído"
}

# Handle script arguments
case "$1" in
    "deploy")
        main
        ;;
    "rollback")
        rollback $2
        ;;
    "health")
        health_checks
        ;;
    "backup")
        backup_system
        ;;
    *)
        echo "Uso: $0 {deploy|rollback|health|backup}"
        echo "  deploy  - Executa deploy completo"
        echo "  rollback <backup_dir> - Executa rollback"
        echo "  health  - Verifica saúde do sistema"
        echo "  backup  - Cria backup do sistema"
        exit 1
        ;;
esac
