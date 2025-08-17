#!/usr/bin/env python3
"""
SETUP QISKIT LOCAL - TOIT NEXUS
Configurar Qiskit 2.1.1 local para evitar conflitos de dependências
"""

import os
import sys
import subprocess

def setup_local_qiskit():
    """Configurar Qiskit local"""
    print("CONFIGURANDO QISKIT LOCAL...")
    
    # Adicionar qlib ao Python path
    qlib_path = os.path.join(os.getcwd(), 'qlib', 'qiskit-2.1.1')
    
    if not os.path.exists(qlib_path):
        print(f"ERROR Qiskit local nao encontrado: {qlib_path}")
        return False

    # Adicionar ao sys.path
    if qlib_path not in sys.path:
        sys.path.insert(0, qlib_path)
        print(f"OK Qiskit local adicionado: {qlib_path}")

    # Testar importação
    try:
        import qiskit
        print(f"OK Qiskit {qiskit.__version__} importado com sucesso")

        # Testar QuantumCircuit
        from qiskit import QuantumCircuit
        qc = QuantumCircuit(2, 2)
        qc.h(0)
        qc.cx(0, 1)
        qc.measure_all()
        print("OK QuantumCircuit funcionando")

        # Testar BasicAer (simulador simples)
        try:
            from qiskit.providers.basic_provider import BasicProvider
            provider = BasicProvider()
            backend = provider.get_backend('basic_simulator')
            print("OK BasicProvider funcionando")
        except Exception as e:
            print(f"WARNING BasicProvider: {e}")

        return True

    except Exception as e:
        print(f"ERROR Erro na importacao: {e}")
        return False

def test_ibm_connection_local():
    """Testar conexão IBM com Qiskit local"""
    print("\n🔗 TESTANDO IBM QUANTUM COM QISKIT LOCAL...")
    
    try:
        # Usar Qiskit local
        setup_local_qiskit()
        
        # Importar IBM Runtime
        from qiskit_ibm_runtime import QiskitRuntimeService
        
        # Obter token
        ibm_token = os.getenv('IBM_SECRET')
        if not ibm_token:
            with open('.env', 'r') as f:
                for line in f:
                    if line.startswith('IBM_SECRET='):
                        ibm_token = line.split('=', 1)[1].strip().strip('"\'')
                        break
        
        if not ibm_token or ibm_token == 'your_ibm_quantum_token_here':
            print("❌ Token IBM não configurado")
            return False
        
        # Conectar
        service = QiskitRuntimeService(
            channel='ibm_quantum_platform',
            token=ibm_token
        )
        
        backends = service.backends()
        print(f"✅ IBM Quantum conectado - {len(backends)} backends")
        
        for backend in backends[:2]:
            print(f"   🖥️ {backend.name} - {backend.num_qubits} qubits")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro IBM: {e}")
        return False

def create_quantum_test():
    """Criar teste quântico usando Qiskit local"""
    print("\n⚛️ CRIANDO TESTE QUÂNTICO...")
    
    try:
        setup_local_qiskit()
        
        from qiskit import QuantumCircuit, transpile
        from qiskit.providers.basic_provider import BasicProvider
        
        # Criar circuito Bell State
        qc = QuantumCircuit(2, 2)
        qc.h(0)  # Hadamard
        qc.cx(0, 1)  # CNOT
        qc.measure_all()
        
        print("✅ Circuito Bell State criado")
        
        # Executar no simulador básico
        provider = BasicProvider()
        backend = provider.get_backend('basic_simulator')
        
        transpiled_qc = transpile(qc, backend)
        job = backend.run(transpiled_qc, shots=1000)
        result = job.result()
        counts = result.get_counts()
        
        print(f"✅ Simulação executada: {counts}")
        
        # Verificar entrelaçamento
        if '00' in counts and '11' in counts:
            print("✅ Entrelaçamento quântico detectado!")
            return True
        else:
            print("⚠️ Entrelaçamento não detectado")
            return False
            
    except Exception as e:
        print(f"❌ Erro no teste: {e}")
        return False

def main():
    """Função principal"""
    print("SETUP QISKIT LOCAL - TOIT NEXUS")
    print("=" * 50)
    
    # Teste 1: Setup local
    local_ok = setup_local_qiskit()
    
    # Teste 2: IBM connection
    ibm_ok = test_ibm_connection_local()
    
    # Teste 3: Quantum test
    quantum_ok = create_quantum_test()
    
    # Resultado
    print("\n" + "=" * 50)
    if local_ok and quantum_ok:
        print("🎉 QISKIT LOCAL CONFIGURADO COM SUCESSO!")
        if ibm_ok:
            print("✅ IBM Quantum Hardware disponível")
        else:
            print("⚠️ IBM Quantum offline - usando simulação")
        return True
    else:
        print("❌ FALHA NA CONFIGURAÇÃO")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
