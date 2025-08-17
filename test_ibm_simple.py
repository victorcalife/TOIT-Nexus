#!/usr/bin/env python3
"""
TESTE SIMPLES IBM QUANTUM - TOIT NEXUS
Teste básico de conexão com IBM Quantum usando token real
"""

import os
import sys

def test_basic_imports():
    """Testar importações básicas"""
    print("TESTANDO IMPORTACOES BASICAS...")

    try:
        import qiskit
        print(f"OK Qiskit {qiskit.__version__} - OK")
    except ImportError as e:
        print(f"ERROR Erro Qiskit: {e}")
        return False

    try:
        from qiskit import QuantumCircuit, transpile
        print("OK QuantumCircuit - OK")
    except ImportError as e:
        print(f"ERROR Erro QuantumCircuit: {e}")
        return False

    try:
        from qiskit_aer import AerSimulator
        print("OK AerSimulator - OK")
    except ImportError as e:
        print(f"ERROR Erro AerSimulator: {e}")
        print("WARNING Continuando sem simulador Aer...")

    return True

def test_ibm_connection():
    """Testar conexão IBM Quantum"""
    print("\nTESTANDO CONEXAO IBM QUANTUM...")
    
    # Obter token
    ibm_token = os.getenv('IBM_SECRET')
    if not ibm_token:
        # Tentar ler do .env
        if os.path.exists('.env'):
            with open('.env', 'r') as f:
                for line in f:
                    if line.startswith('IBM_SECRET='):
                        ibm_token = line.split('=', 1)[1].strip().strip('"\'')
                        break
    
    if not ibm_token or ibm_token == 'your_ibm_quantum_token_here':
        print("ERROR Token IBM nao configurado")
        return False

    print(f"OK Token encontrado: {ibm_token[:10]}...")
    
    # Testar conexão
    try:
        from qiskit_ibm_runtime import QiskitRuntimeService
        
        # Configurar serviço
        service = QiskitRuntimeService(
            channel='ibm_quantum_platform',
            token=ibm_token
        )
        
        # Listar backends
        backends = service.backends()
        print(f"OK Conexao IBM estabelecida - {len(backends)} backends disponiveis")

        # Mostrar alguns backends
        for i, backend in enumerate(backends[:3]):
            print(f"   BACKEND {backend.name} - {backend.num_qubits} qubits")

        return True

    except Exception as e:
        print(f"ERROR Erro na conexao IBM: {e}")
        return False

def test_simple_circuit():
    """Testar circuito quantico simples"""
    print("\nTESTANDO CIRCUITO QUANTICO SIMPLES...")
    
    try:
        from qiskit import QuantumCircuit, transpile
        
        # Criar circuito simples
        qc = QuantumCircuit(2, 2)
        qc.h(0)  # Hadamard gate
        qc.cx(0, 1)  # CNOT gate
        qc.measure_all()
        
        print("OK Circuito quantico criado")
        print(f"   INFO {qc.num_qubits} qubits, {qc.depth()} profundidade")
        
        # Tentar usar simulador local
        try:
            from qiskit_aer import AerSimulator
            simulator = AerSimulator()
            
            # Transpile e executar
            transpiled_qc = transpile(qc, simulator)
            job = simulator.run(transpiled_qc, shots=1000)
            result = job.result()
            counts = result.get_counts()
            
            print("✅ Simulação local executada")
            print(f"   📈 Resultados: {counts}")
            
        except ImportError:
            print("⚠️  Simulador Aer não disponível - usando BasicAer")
            from qiskit import BasicAer
            simulator = BasicAer.get_backend('qasm_simulator')
            
            job = simulator.run(transpile(qc, simulator), shots=1000)
            result = job.result()
            counts = result.get_counts()
            
            print("✅ Simulação BasicAer executada")
            print(f"   📈 Resultados: {counts}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro no circuito: {e}")
        return False

def main():
    """Função principal"""
    print("TOIT NEXUS - TESTE IBM QUANTUM SIMPLES")
    print("=" * 50)
    
    # Teste 1: Importações
    if not test_basic_imports():
        print("\n❌ FALHA NAS IMPORTAÇÕES")
        return False
    
    # Teste 2: Conexão IBM
    ibm_ok = test_ibm_connection()
    
    # Teste 3: Circuito simples
    circuit_ok = test_simple_circuit()
    
    # Resultado final
    print("\n" + "=" * 50)
    if ibm_ok and circuit_ok:
        print("🎉 TODOS OS TESTES PASSARAM!")
        print("✅ Sistema quântico operacional")
        return True
    elif circuit_ok:
        print("⚠️  TESTES PARCIAIS - SEM IBM HARDWARE")
        print("✅ Simulação local funcionando")
        print("❌ IBM Quantum offline")
        return True
    else:
        print("❌ FALHA NOS TESTES")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
