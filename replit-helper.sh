#!/bin/bash
# Script helper para comandos Replit comuns

case "$1" in
  "deploy")
    echo "🚀 Para fazer deploy:"
    echo "1. Vá para: https://replit.com/@victorcalife/workspace/deployments"
    echo "2. Ou use: npm run build && npm start"
    ;;
  "build")
    echo "🔨 Fazendo build..."
    npm run build
    ;;
  "start")
    echo "▶️ Iniciando aplicação..."
    npm start
    ;;
  "info")
    echo "📋 Informações do projeto:"
    echo "REPL_OWNER: $REPL_OWNER"
    echo "REPL_SLUG: $REPL_SLUG"
    echo "DEV_DOMAIN: $REPLIT_DEV_DOMAIN"
    ;;
  "token")
    echo "🔑 Criando token de identidade..."
    replit identity create -audience "$2" -json
    ;;
  *)
    echo "🤖 Replit Helper - Comandos disponíveis:"
    echo "  ./replit-helper.sh deploy   - Instruções de deploy"
    echo "  ./replit-helper.sh build    - Build da aplicação"
    echo "  ./replit-helper.sh start    - Iniciar aplicação"
    echo "  ./replit-helper.sh info     - Informações do projeto"
    echo "  ./replit-helper.sh token <audience> - Criar token"
    ;;
esac