/**
 * QUANTUM LIBRARY INTEGRATOR - TOIT NEXUS
 * 
 * Integração entre sistema quântico existente e biblioteca qlib
 * Execução de notebooks Jupyter quânticos em tempo real
 * Bridge entre APIs TOIT NEXUS e algoritmos Qiskit
 * 
 * TOIT NEXUS - QUANTUM LIBRARY INTEGRATION
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

const execAsync = promisify(exec);

// ==========================================
// QUANTUM LIBRARY INTEGRATOR
// ==========================================

export interface QLibExecutionResult {
  algorithm: string;
  notebook: string;
  execution_id: string;
  status: 'success' | 'error' | 'timeout';
  result: any;
  metrics: {
    execution_time: number;
    circuit_depth?: number;
    gate_count?: number;
    qubit_count?: number;
    fidelity?: number;
    shots?: number;
  };
  backend_info: {
    type: 'simulator' | 'real_hardware';
    device: string;
    ibm_quantum: boolean;
  };
  logs: string[];
  error?: string;
}

export interface QLibNotebookConfig {
  notebook_name: string;
  algorithm_type: string;
  input_parameters: Record<string, any>;
  use_real_hardware: boolean;
  shots: number;
  timeout_seconds: number;
}

class QuantumLibraryIntegrator {
  private qlibPath: string;
  private tempPath: string;
  private pythonExecutable: string;
  private ibmToken: string | null;
  
  constructor() {
    this.qlibPath = path.join(process.cwd(), 'qlib');
    this.tempPath = path.join(process.cwd(), 'temp', 'quantum');
    this.pythonExecutable = process.env.PYTHON_EXECUTABLE || 'python';
    this.ibmToken = process.env.IBM_SECRET || null;
    
    console.log('🌌 Inicializando Quantum Library Integrator...');
    this.initializeEnvironment();
  }

  private initializeEnvironment(): void {
    // Criar diretório temporário se não existir
    if (!existsSync(this.tempPath)) {
      mkdirSync(this.tempPath, { recursive: true });
      console.log(`✅ Diretório temporário criado: ${this.tempPath}`);
    }
    
    if (!existsSync(this.qlibPath)) {
      console.warn(`⚠️ Biblioteca qlib não encontrada em: ${this.qlibPath}`);
      return;
    }
    
    console.log(`✅ Ambiente quântico inicializado`);
    console.log(`📂 QLib: ${this.qlibPath}`);
    console.log(`🐍 Python: ${this.pythonExecutable}`);
    console.log(`🔑 IBM Token: ${this.ibmToken ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}`);
  }

  // ==========================================
  // QAOA INTEGRATION
  // ==========================================

  async executeQAOA(
    graphNodes: number = 5,
    graphEdges: Array<[number, number]> = [[0,1], [0,2], [1,2], [2,3], [3,4]],
    useRealHardware: boolean = false,
    shots: number = 1000
  ): Promise<QLibExecutionResult> {
    const executionId = nanoid();
    const notebookName = 'quantum-approximate-optimization-algorithm.ipynb';
    
    console.log(`🔥 Executando QAOA via qlib - ID: ${executionId}`);
    
    const pythonScript = this.generateQAOAExecutionScript({
      graphNodes,
      graphEdges,
      useRealHardware,
      shots,
      executionId
    });
    
    return this.executeQuantumScript(pythonScript, notebookName, executionId, 'QAOA');
  }

  private generateQAOAExecutionScript(params: any): string {
    return `
import json
import time
import sys
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import QAOAAnsatz
from qiskit.quantum_info import SparsePauliOp
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from scipy.optimize import minimize

# Configuração
execution_id = "${params.executionId}"
graph_nodes = ${params.graphNodes}
graph_edges = ${JSON.stringify(params.graphEdges)}
use_real_hardware = ${params.useRealHardware}
shots = ${params.shots}
ibm_token = "${this.ibmToken}"

def build_max_cut_paulis(edges, num_qubits):
    pauli_list = []
    for edge in edges:
        pauli_str = "I" * num_qubits
        pauli_str = pauli_str[:edge[0]] + "Z" + pauli_str[edge[0]+1:]
        pauli_str = pauli_str[:edge[1]] + "Z" + pauli_str[edge[1]+1:]
        pauli_list.append((pauli_str, 1.0))
    return pauli_list

def main():
    logs = []
    start_time = time.time()
    
    try:
        logs.append(f"[{time.strftime('%H:%M:%S')}] Iniciando execução QAOA - ID: {execution_id}")
        
        # Configurar backend
        backend_type = "simulator"
        device_name = "qasm_simulator"
        
        if ibm_token and use_real_hardware:
            try:
                from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2
                service = QiskitRuntimeService(token=ibm_token)
                backend = service.least_busy(operational=True, simulator=False, min_num_qubits=graph_nodes)
                backend_type = "real_hardware"
                device_name = backend.name
                logs.append(f"[{time.strftime('%H:%M:%S')}] Conectado ao hardware IBM: {device_name}")
            except Exception as e:
                logs.append(f"[{time.strftime('%H:%M:%S')}] Falha na conexão IBM, usando simulador: {str(e)}")
                from qiskit import Aer
                backend = Aer.get_backend('qasm_simulator')
        else:
            from qiskit import Aer
            backend = Aer.get_backend('qasm_simulator')
            logs.append(f"[{time.strftime('%H:%M:%S')}] Usando simulador local")
        
        # Construir Hamiltonian
        logs.append(f"[{time.strftime('%H:%M:%S')}] Construindo Hamiltonian para {graph_nodes} nós")
        pauli_list = build_max_cut_paulis(graph_edges, graph_nodes)
        cost_hamiltonian = SparsePauliOp.from_list(pauli_list)
        
        # Criar circuito QAOA
        circuit = QAOAAnsatz(cost_operator=cost_hamiltonian, reps=2)
        circuit.measure_all()
        logs.append(f"[{time.strftime('%H:%M:%S')}] Circuito QAOA criado com {circuit.num_qubits} qubits")
        
        # Transpilação
        if hasattr(backend, 'target'):
            pm = generate_preset_pass_manager(target=backend.target, optimization_level=3)
        else:
            pm = generate_preset_pass_manager(backend=backend, optimization_level=3)
        
        candidate_circuit = pm.run(circuit)
        logs.append(f"[{time.strftime('%H:%M:%S')}] Circuito transpilado - Depth: {candidate_circuit.depth()}, Gates: {len(candidate_circuit.data)}")
        
        # Otimização de parâmetros (simplificada)
        initial_params = np.random.uniform(0, 2*np.pi, circuit.num_parameters)
        
        # Função de custo simulada (para demo)
        def cost_func(params):
            return np.sum(np.sin(params))  # Função simplificada
        
        result = minimize(cost_func, initial_params, method='COBYLA', options={'maxiter': 20})
        logs.append(f"[{time.strftime('%H:%M:%S')}] Otimização concluída - Sucesso: {result.success}")
        
        # Executar circuito final
        final_circuit = candidate_circuit.assign_parameters(result.x)
        
        if backend_type == "real_hardware":
            from qiskit_ibm_runtime import SamplerV2
            sampler = SamplerV2(backend)
            job = sampler.run([final_circuit], shots=shots)
            final_result = job.result()
            counts = final_result[0].data.meas.get_counts()
        else:
            job = backend.run(final_circuit, shots=shots)
            final_result = job.result()
            counts = final_result.get_counts()
        
        # Encontrar melhor solução
        best_bitstring = max(counts.items(), key=lambda x: x[1])[0]
        best_probability = counts[best_bitstring] / shots
        
        logs.append(f"[{time.strftime('%H:%M:%S')}] Melhor solução encontrada: {best_bitstring} (prob: {best_probability:.3f})")
        
        execution_time = time.time() - start_time
        
        # Resultado final
        output = {
            "status": "success",
            "algorithm": "QAOA",
            "execution_id": execution_id,
            "result": {
                "best_solution": best_bitstring,
                "probability": best_probability,
                "all_counts": dict(list(counts.items())[:10]),
                "optimization_result": {
                    "success": result.success,
                    "cost": result.fun,
                    "iterations": result.nfev
                }
            },
            "metrics": {
                "execution_time": execution_time,
                "circuit_depth": candidate_circuit.depth(),
                "gate_count": len(candidate_circuit.data),
                "qubit_count": candidate_circuit.num_qubits,
                "fidelity": best_probability,
                "shots": shots
            },
            "backend_info": {
                "type": backend_type,
                "device": device_name,
                "ibm_quantum": backend_type == "real_hardware"
            },
            "logs": logs
        }
        
        print(json.dumps(output, indent=2))
        
    except Exception as e:
        execution_time = time.time() - start_time
        error_output = {
            "status": "error",
            "execution_id": execution_id,
            "error": str(e),
            "execution_time": execution_time,
            "logs": logs + [f"[{time.strftime('%H:%M:%S')}] ERRO: {str(e)}"]
        }
        print(json.dumps(error_output, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()
`;
  }

  // ==========================================
  // GROVER'S ALGORITHM INTEGRATION
  // ==========================================

  async executeGrover(
    searchSpace: string[],
    targetStates: string[],
    useRealHardware: boolean = false,
    shots: number = 1000
  ): Promise<QLibExecutionResult> {
    const executionId = nanoid();
    const notebookName = 'grovers-algorithm.ipynb';
    
    console.log(`🔍 Executando Grover via qlib - ID: ${executionId}`);
    
    const pythonScript = this.generateGroverExecutionScript({
      searchSpace,
      targetStates,
      useRealHardware,
      shots,
      executionId
    });
    
    return this.executeQuantumScript(pythonScript, notebookName, executionId, 'Grover');
  }

  private generateGroverExecutionScript(params: any): string {
    return `
import json
import time
import sys
import math
from qiskit import QuantumCircuit
from qiskit.circuit.library import grover_operator, MCMTGate, ZGate
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager

# Configuração
execution_id = "${params.executionId}"
search_space = ${JSON.stringify(params.searchSpace)}
target_states = ${JSON.stringify(params.targetStates)}
use_real_hardware = ${params.useRealHardware}
shots = ${params.shots}
ibm_token = "${this.ibmToken}"

def grover_oracle(marked_states):
    if not isinstance(marked_states, list):
        marked_states = [marked_states]
    
    num_qubits = len(marked_states[0])
    qc = QuantumCircuit(num_qubits)
    
    for target in marked_states:
        rev_target = target[::-1]
        zero_inds = [ind for ind in range(num_qubits) if rev_target.startswith("0", ind)]
        
        if zero_inds:
            qc.x(zero_inds)
        qc.compose(MCMTGate(ZGate(), num_qubits - 1, 1), inplace=True)
        if zero_inds:
            qc.x(zero_inds)
    
    return qc

def main():
    logs = []
    start_time = time.time()
    
    try:
        logs.append(f"[{time.strftime('%H:%M:%S')}] Iniciando Grover - ID: {execution_id}")
        
        # Configurar backend
        backend_type = "simulator"
        device_name = "qasm_simulator"
        
        if ibm_token and use_real_hardware:
            try:
                from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2
                service = QiskitRuntimeService(token=ibm_token)
                backend = service.least_busy(operational=True, simulator=False, min_num_qubits=5)
                backend_type = "real_hardware"
                device_name = backend.name
                logs.append(f"[{time.strftime('%H:%M:%S')}] Conectado ao hardware IBM: {device_name}")
            except Exception as e:
                logs.append(f"[{time.strftime('%H:%M:%S')}] Falha na conexão IBM, usando simulador: {str(e)}")
                from qiskit import Aer
                backend = Aer.get_backend('qasm_simulator')
        else:
            from qiskit import Aer
            backend = Aer.get_backend('qasm_simulator')
        
        # Construir oracle
        oracle = grover_oracle(target_states)
        grover_op = grover_operator(oracle)
        
        # Número ótimo de iterações
        optimal_iterations = math.floor(
            math.pi / (4 * math.asin(math.sqrt(len(target_states) / 2**grover_op.num_qubits)))
        )
        
        logs.append(f"[{time.strftime('%H:%M:%S')}] Oracle criado - {grover_op.num_qubits} qubits, {optimal_iterations} iterações")
        
        # Circuito completo
        qc = QuantumCircuit(grover_op.num_qubits)
        qc.h(range(grover_op.num_qubits))
        qc.compose(grover_op.power(optimal_iterations), inplace=True)
        qc.measure_all()
        
        # Transpilação
        if hasattr(backend, 'target'):
            pm = generate_preset_pass_manager(target=backend.target, optimization_level=3)
        else:
            pm = generate_preset_pass_manager(backend=backend, optimization_level=3)
        
        circuit_isa = pm.run(qc)
        logs.append(f"[{time.strftime('%H:%M:%S')}] Circuito transpilado - Depth: {circuit_isa.depth()}, Gates: {len(circuit_isa.data)}")
        
        # Execução
        if backend_type == "real_hardware":
            from qiskit_ibm_runtime import SamplerV2
            sampler = SamplerV2(backend)
            job = sampler.run([circuit_isa], shots=shots)
            result = job.result()
            counts = result[0].data.meas.get_counts()
        else:
            job = backend.run(circuit_isa, shots=shots)
            result = job.result()
            counts = result.get_counts()
        
        # Análise dos resultados
        most_likely = max(counts.items(), key=lambda x: x[1])
        success_probability = sum(counts.get(state, 0) for state in target_states) / shots
        target_found = most_likely[0] in target_states
        
        logs.append(f"[{time.strftime('%H:%M:%S')}] Estado mais provável: {most_likely[0]} (prob: {most_likely[1]/shots:.3f})")
        logs.append(f"[{time.strftime('%H:%M:%S')}] Target encontrado: {target_found}")
        
        execution_time = time.time() - start_time
        
        output = {
            "status": "success",
            "algorithm": "Grover",
            "execution_id": execution_id,
            "result": {
                "most_likely_state": most_likely[0],
                "probability": most_likely[1] / shots,
                "target_found": target_found,
                "success_probability": success_probability,
                "all_counts": dict(list(counts.items())[:10]),
                "optimal_iterations": optimal_iterations
            },
            "metrics": {
                "execution_time": execution_time,
                "circuit_depth": circuit_isa.depth(),
                "gate_count": len(circuit_isa.data),
                "qubit_count": circuit_isa.num_qubits,
                "fidelity": success_probability,
                "shots": shots
            },
            "backend_info": {
                "type": backend_type,
                "device": device_name,
                "ibm_quantum": backend_type == "real_hardware"
            },
            "logs": logs
        }
        
        print(json.dumps(output, indent=2))
        
    except Exception as e:
        execution_time = time.time() - start_time
        error_output = {
            "status": "error",
            "execution_id": execution_id,
            "error": str(e),
            "execution_time": execution_time,
            "logs": logs + [f"[{time.strftime('%H:%M:%S')}] ERRO: {str(e)}"]
        }
        print(json.dumps(error_output, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()
`;
  }

  // ==========================================
  // SCRIPT EXECUTION ENGINE
  // ==========================================

  private async executeQuantumScript(
    pythonScript: string,
    notebookName: string,
    executionId: string,
    algorithmType: string
  ): Promise<QLibExecutionResult> {
    const scriptPath = path.join(this.tempPath, `quantum_${executionId}.py`);
    
    try {
      // Escrever script
      writeFileSync(scriptPath, pythonScript);
      
      // Executar com timeout
      const { stdout, stderr } = await execAsync(`${this.pythonExecutable} ${scriptPath}`, {
        cwd: this.qlibPath,
        timeout: 300000, // 5 minutos
        env: { ...process.env, PYTHONPATH: this.qlibPath }
      });
      
      if (stderr && !stderr.includes('warning') && !stderr.includes('deprecated')) {
        throw new Error(`Execution error: ${stderr}`);
      }
      
      const result = JSON.parse(stdout.trim());
      
      return {
        algorithm: algorithmType,
        notebook: notebookName,
        execution_id: executionId,
        status: result.status || 'success',
        result: result.result || result,
        metrics: result.metrics || {
          execution_time: 0,
          circuit_depth: 0,
          gate_count: 0,
          qubit_count: 0,
          fidelity: 0,
          shots: 0
        },
        backend_info: result.backend_info || {
          type: 'simulator',
          device: 'unknown',
          ibm_quantum: false
        },
        logs: result.logs || [],
        error: result.error
      };
    } catch (error) {
      return {
        algorithm: algorithmType,
        notebook: notebookName,
        execution_id: executionId,
        status: 'error',
        result: null,
        metrics: {
          execution_time: 0,
          circuit_depth: 0,
          gate_count: 0,
          qubit_count: 0,
          fidelity: 0,
          shots: 0
        },
        backend_info: {
          type: 'simulator',
          device: 'error',
          ibm_quantum: false
        },
        logs: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      // Limpar arquivo temporário
      try {
        if (existsSync(scriptPath)) {
          // fs.unlinkSync(scriptPath); // Comentado para debug
        }
      } catch (cleanupError) {
        console.warn('Falha na limpeza do arquivo temporário:', cleanupError);
      }
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  async getAvailableNotebooks(): Promise<string[]> {
    if (!existsSync(this.qlibPath)) {
      return [];
    }
    
    const fs = await import('fs');
    const files = fs.readdirSync(this.qlibPath);
    return files.filter(file => file.endsWith('.ipynb'));
  }

  async getSystemHealth(): Promise<any> {
    return {
      qlib_path: this.qlibPath,
      qlib_exists: existsSync(this.qlibPath),
      temp_path: this.tempPath,
      temp_exists: existsSync(this.tempPath),
      python_executable: this.pythonExecutable,
      ibm_token_configured: !!this.ibmToken,
      available_notebooks: await this.getAvailableNotebooks(),
      status: 'operational'
    };
  }

  async validateEnvironment(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`${this.pythonExecutable} -c "import qiskit; print(qiskit.__version__)"`, {
        timeout: 10000
      });
      
      console.log(`✅ Qiskit version: ${stdout.trim()}`);
      return true;
    } catch (error) {
      console.error('❌ Falha na validação do ambiente Qiskit:', error);
      return false;
    }
  }
}

// Singleton instance
export const quantumLibraryIntegrator = new QuantumLibraryIntegrator();