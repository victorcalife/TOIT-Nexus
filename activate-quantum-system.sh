#!/bin/bash

# TOIT NEXUS - QUANTUM SYSTEM ACTIVATION SCRIPT
# Script para ativar completamente o sistema quântico

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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

log_quantum() {
    echo -e "${PURPLE}⚛️  $1${NC}"
}

log_step() {
    echo -e "${CYAN}🔧 $1${NC}"
}

echo -e "${PURPLE}"
echo "⚛️ =========================================="
echo "⚛️  TOIT NEXUS QUANTUM SYSTEM ACTIVATION"
echo "⚛️ =========================================="
echo -e "${NC}"

# Step 1: Check Prerequisites
log_step "STEP 1: Verificando pré-requisitos..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    log_error "Python 3 não está instalado"
    log_info "Instale Python 3.8+ para continuar"
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    log_error "pip3 não está instalado"
    log_info "Instale pip3 para continuar"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    log_error "Node.js não está instalado"
    log_info "Instale Node.js 18+ para continuar"
    exit 1
fi

log_success "Pré-requisitos verificados"

# Step 2: Check IBM_SECRET
log_step "STEP 2: Verificando configuração IBM_SECRET..."

if [ -z "$IBM_SECRET" ]; then
    log_warning "IBM_SECRET não está configurada como variável de ambiente"
    log_info "Verificando arquivo .env..."
    
    if [ -f ".env" ]; then
        if grep -q "IBM_SECRET" .env; then
            log_success "IBM_SECRET encontrada no arquivo .env"
        else
            log_error "IBM_SECRET não encontrada no arquivo .env"
            log_info "Configure IBM_SECRET no arquivo .env ou como variável de ambiente"
            exit 1
        fi
    else
        log_error "Arquivo .env não encontrado e IBM_SECRET não está configurada"
        log_info "Crie um arquivo .env com IBM_SECRET=sua_chave_ibm"
        exit 1
    fi
else
    log_success "IBM_SECRET configurada como variável de ambiente"
fi

# Step 3: Install Python Dependencies
log_step "STEP 3: Instalando dependências Python..."

log_info "Atualizando pip..."
pip3 install --upgrade pip

log_info "Instalando dependências quânticas..."
if [ -f "requirements.txt" ]; then
    pip3 install -r requirements.txt
    log_success "Dependências Python instaladas"
else
    log_error "Arquivo requirements.txt não encontrado"
    exit 1
fi

# Step 4: Install Node.js Dependencies
log_step "STEP 4: Verificando dependências Node.js..."

log_info "Instalando dependências do servidor..."
cd server
npm install
cd ..

log_info "Instalando dependências do cliente..."
cd client
npm install
cd ..

log_success "Dependências Node.js verificadas"

# Step 5: Test Quantum Connection
log_step "STEP 5: Testando conexão quântica..."

log_info "Criando script de teste..."
cat > test_quantum_connection.py << 'EOF'
#!/usr/bin/env python3
import os
import sys

def test_qiskit_import():
    try:
        import qiskit
        print(f"✅ Qiskit {qiskit.__version__} importado com sucesso")
        return True
    except ImportError as e:
        print(f"❌ Erro ao importar Qiskit: {e}")
        return False

def test_ibm_runtime():
    try:
        from qiskit_ibm_runtime import QiskitRuntimeService
        print("✅ IBM Runtime importado com sucesso")
        return True
    except ImportError as e:
        print(f"❌ Erro ao importar IBM Runtime: {e}")
        return False

def test_ibm_connection():
    try:
        from qiskit_ibm_runtime import QiskitRuntimeService
        
        # Try to get IBM_SECRET from environment
        ibm_token = os.getenv('IBM_SECRET')
        if not ibm_token:
            # Try to read from .env file
            if os.path.exists('.env'):
                with open('.env', 'r') as f:
                    for line in f:
                        if line.startswith('IBM_SECRET='):
                            ibm_token = line.split('=', 1)[1].strip().strip('"\'')
                            break
        
        if not ibm_token:
            print("⚠️  IBM_SECRET não encontrada - modo simulação")
            return False
            
        # Test connection
        service = QiskitRuntimeService(token=ibm_token)
        backends = service.backends()
        print(f"✅ Conexão IBM Quantum estabelecida - {len(backends)} backends disponíveis")
        
        # List some backends
        for backend in list(backends)[:3]:
            print(f"   • {backend.name} - {backend.num_qubits} qubits")
            
        return True
    except Exception as e:
        print(f"⚠️  Erro na conexão IBM Quantum: {e}")
        print("   Sistema funcionará em modo simulação")
        return False

def main():
    print("🔬 Testando sistema quântico TOIT NEXUS...")
    print()
    
    success = True
    
    # Test imports
    if not test_qiskit_import():
        success = False
    
    if not test_ibm_runtime():
        success = False
    
    # Test IBM connection
    ibm_connected = test_ibm_connection()
    
    print()
    if success:
        if ibm_connected:
            print("🎉 Sistema quântico TOTALMENTE ATIVO - Hardware IBM conectado!")
        else:
            print("✅ Sistema quântico ATIVO - Modo simulação (configure IBM_SECRET para hardware real)")
    else:
        print("❌ Falha na ativação do sistema quântico")
        sys.exit(1)

if __name__ == "__main__":
    main()
EOF

log_info "Executando teste de conexão quântica..."
python3 test_quantum_connection.py

# Step 6: Initialize Quantum Modules
log_step "STEP 6: Inicializando módulos quânticos..."

log_info "Verificando estrutura de diretórios..."
mkdir -p qlib/notebooks
mkdir -p qlib/data
mkdir -p qlib/results
mkdir -p quantum_cache
mkdir -p quantum_logs

log_success "Estrutura de diretórios criada"

# Step 7: Test API Endpoints
log_step "STEP 7: Preparando testes de API..."

log_info "Criando script de teste de APIs..."
cat > test_quantum_apis.js << 'EOF'
const axios = require('axios');

const BASE_URL = 'https://api.toit.com.br';

async function testQuantumAPIs() {
    console.log('🧪 Testando APIs quânticas...\n');
    
    const endpoints = [
        '/api/native-quantum/status',
        '/api/real-quantum/health',
        '/api/quantum-ml/status',
        '/api/quantum-commercial/status',
        '/api/quantum-billing/status'
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`🔍 Testando ${endpoint}...`);
            const response = await axios.get(`${BASE_URL}${endpoint}`, {
                timeout: 5000,
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            
            if (response.status === 200) {
                console.log(`✅ ${endpoint} - OK`);
            } else {
                console.log(`⚠️  ${endpoint} - Status ${response.status}`);
            }
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log(`⚠️  ${endpoint} - Servidor não está rodando`);
            } else if (error.response?.status === 401) {
                console.log(`✅ ${endpoint} - OK (requer autenticação)`);
            } else {
                console.log(`❌ ${endpoint} - Erro: ${error.message}`);
            }
        }
    }
    
    console.log('\n🎯 Para verificar status do sistema Railway: railway status');
}

testQuantumAPIs().catch(console.error);
EOF

log_info "Script de teste criado (execute após iniciar o servidor)"

# Step 8: Create Quantum Status Dashboard
log_step "STEP 8: Criando dashboard de status quântico..."

cat > quantum_status.py << 'EOF'
#!/usr/bin/env python3
import os
import json
from datetime import datetime

def get_quantum_status():
    status = {
        "timestamp": datetime.now().isoformat(),
        "system": "TOIT NEXUS Quantum System",
        "version": "1.0.0",
        "components": {}
    }
    
    # Check Qiskit
    try:
        import qiskit
        status["components"]["qiskit"] = {
            "status": "active",
            "version": qiskit.__version__
        }
    except ImportError:
        status["components"]["qiskit"] = {
            "status": "error",
            "message": "Not installed"
        }
    
    # Check IBM Runtime
    try:
        from qiskit_ibm_runtime import QiskitRuntimeService
        status["components"]["ibm_runtime"] = {
            "status": "active"
        }
    except ImportError:
        status["components"]["ibm_runtime"] = {
            "status": "error",
            "message": "Not installed"
        }
    
    # Check IBM Connection
    ibm_token = os.getenv('IBM_SECRET')
    if not ibm_token and os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                if line.startswith('IBM_SECRET='):
                    ibm_token = line.split('=', 1)[1].strip().strip('"\'')
                    break
    
    if ibm_token:
        try:
            from qiskit_ibm_runtime import QiskitRuntimeService
            service = QiskitRuntimeService(token=ibm_token)
            backends = service.backends()
            status["components"]["ibm_quantum"] = {
                "status": "connected",
                "backends_available": len(backends),
                "hardware_access": True
            }
        except Exception as e:
            status["components"]["ibm_quantum"] = {
                "status": "error",
                "message": str(e),
                "hardware_access": False
            }
    else:
        status["components"]["ibm_quantum"] = {
            "status": "simulation_mode",
            "message": "IBM_SECRET not configured",
            "hardware_access": False
        }
    
    return status

def main():
    status = get_quantum_status()
    
    print("⚛️  TOIT NEXUS QUANTUM SYSTEM STATUS")
    print("=" * 50)
    print(f"Timestamp: {status['timestamp']}")
    print(f"System: {status['system']}")
    print(f"Version: {status['version']}")
    print()
    
    for component, info in status["components"].items():
        status_icon = "✅" if info["status"] == "active" or info["status"] == "connected" else "⚠️" if info["status"] == "simulation_mode" else "❌"
        print(f"{status_icon} {component.upper()}: {info['status']}")
        
        if "version" in info:
            print(f"   Version: {info['version']}")
        if "message" in info:
            print(f"   Message: {info['message']}")
        if "backends_available" in info:
            print(f"   Backends: {info['backends_available']}")
        if "hardware_access" in info:
            print(f"   Hardware Access: {'Yes' if info['hardware_access'] else 'No'}")
        print()
    
    # Save status to file
    with open('quantum_status.json', 'w') as f:
        json.dump(status, f, indent=2)
    
    print("📄 Status salvo em quantum_status.json")

if __name__ == "__main__":
    main()
EOF

chmod +x quantum_status.py

log_success "Dashboard de status criado"

# Step 9: Final Verification
log_step "STEP 9: Verificação final..."

log_info "Executando status do sistema quântico..."
python3 quantum_status.py

# Cleanup test files
rm -f test_quantum_connection.py

log_success "Sistema quântico ativado com sucesso!"

echo
echo -e "${PURPLE}⚛️ =========================================="
echo -e "⚛️  QUANTUM SYSTEM ACTIVATION COMPLETE!"
echo -e "⚛️ ==========================================${NC}"
echo
log_quantum "PRÓXIMOS PASSOS:"
echo -e "${CYAN}1. Verifique status Railway: ${YELLOW}railway status${NC}"
echo -e "${CYAN}2. Teste as APIs: ${YELLOW}node test_quantum_apis.js${NC}"
echo -e "${CYAN}3. Verifique status: ${YELLOW}python3 quantum_status.py${NC}"
echo -e "${CYAN}4. Acesse: ${YELLOW}https://api.toit.com.br/api/native-quantum/status${NC}"
echo
log_quantum "SISTEMA QUÂNTICO TOIT NEXUS ESTÁ ATIVO! 🚀"
