/**
 * QUANTUM SYSTEM ACTIVATOR
 * Ativador e verificador do sistema quântico TOIT NEXUS
 */

const { spawn, exec } = require( 'child_process' );
const { promisify } = require( 'util' );
const fs = require( 'fs/promises' );
const path = require( 'path' );

const execAsync = promisify( exec );

class QuantumSystemActivator
{
  constructor()
  {
    this.status = {
      initialized: false,
      pythonDependencies: false,
      ibmConnection: false,
      quantumModules: false,
      lastCheck: null
    };
  }

  /**
   * VERIFICAR STATUS COMPLETO DO SISTEMA QUÂNTICO
   */
  async checkQuantumSystemStatus()
  {
    console.log( '⚛️ [QUANTUM-ACTIVATOR] Verificando status do sistema quântico...' );

    try
    {
      // 1. Verificar Python e dependências
      await this.checkPythonDependencies();

      // 2. Verificar conexão IBM
      await this.checkIBMConnection();

      // 3. Verificar módulos quânticos
      await this.checkQuantumModules();

      // 4. Atualizar status
      this.status.lastCheck = new Date().toISOString();
      this.status.initialized = true;

      console.log( '✅ [QUANTUM-ACTIVATOR] Sistema quântico verificado com sucesso' );
      return this.status;

    } catch ( error )
    {
      console.error( '❌ [QUANTUM-ACTIVATOR] Erro na verificação:', error );
      throw error;
    }
  }

  /**
   * VERIFICAR DEPENDÊNCIAS PYTHON
   */
  async checkPythonDependencies()
  {
    try
    {
      console.log( '🐍 [QUANTUM-ACTIVATOR] Verificando dependências Python...' );

      // Verificar se Python está disponível
      try
      {
        await execAsync( 'python3 --version' );
        console.log( '✅ Python 3 disponível' );
      } catch ( error )
      {
        throw new Error( 'Python 3 não está instalado ou não está no PATH' );
      }

      // Verificar Qiskit
      try
      {
        const { stdout } = await execAsync( 'python3 -c "import qiskit; print(qiskit.__version__)"' );
        console.log( `✅ Qiskit ${ stdout.trim() } instalado` );
      } catch ( error )
      {
        console.log( '⚠️ Qiskit não instalado - instalando...' );
        await this.installPythonDependencies();
      }

      // Verificar IBM Runtime
      try
      {
        await execAsync( 'python3 -c "from qiskit_ibm_runtime import QiskitRuntimeService"' );
        console.log( '✅ IBM Runtime disponível' );
      } catch ( error )
      {
        console.log( '⚠️ IBM Runtime não disponível - instalando...' );
        await this.installPythonDependencies();
      }

      this.status.pythonDependencies = true;

    } catch ( error )
    {
      console.error( '❌ Erro nas dependências Python:', error );
      this.status.pythonDependencies = false;
      throw error;
    }
  }

  /**
   * INSTALAR DEPENDÊNCIAS PYTHON
   */
  async installPythonDependencies()
  {
    console.log( '📦 [QUANTUM-ACTIVATOR] Instalando dependências Python...' );

    try
    {
      // Verificar se requirements.txt existe
      const requirementsPath = path.join( process.cwd(), 'requirements.txt' );
      await fs.access( requirementsPath );

      // Instalar dependências
      const { stdout, stderr } = await execAsync( 'pip3 install -r requirements.txt' );

      if ( stderr && !stderr.includes( 'WARNING' ) )
      {
        throw new Error( `Erro na instalação: ${ stderr }` );
      }

      console.log( '✅ Dependências Python instaladas com sucesso' );

    } catch ( error )
    {
      console.error( '❌ Erro na instalação das dependências:', error );
      throw error;
    }
  }

  /**
   * VERIFICAR CONEXÃO IBM QUANTUM
   */
  async checkIBMConnection()
  {
    try
    {
      console.log( '🔗 [QUANTUM-ACTIVATOR] Verificando conexão IBM Quantum...' );

      // Verificar se IBM_SECRET está configurada
      const ibmSecret = process.env.IBM_SECRET;
      if ( !ibmSecret )
      {
        console.log( '⚠️ IBM_SECRET não configurada - modo simulação' );
        this.status.ibmConnection = false;
        return;
      }

      // Testar conexão com IBM Quantum
      const testScript = `
import os
from qiskit_ibm_runtime import QiskitRuntimeService

try:
    service = QiskitRuntimeService(token="${ ibmSecret }")
    backends = service.backends()
    print(f"SUCCESS:{len(backends)}")
except Exception as e:
    print(f"ERROR:{str(e)}")
`;

      const { stdout } = await execAsync( `python3 -c "${ testScript }"` );

      if ( stdout.startsWith( 'SUCCESS:' ) )
      {
        const backendCount = stdout.split( ':' )[ 1 ].trim();
        console.log( `✅ Conexão IBM Quantum estabelecida - ${ backendCount } backends disponíveis` );
        this.status.ibmConnection = true;
      } else
      {
        console.log( `⚠️ Erro na conexão IBM: ${ stdout }` );
        this.status.ibmConnection = false;
      }

    } catch ( error )
    {
      console.error( '❌ Erro na verificação IBM:', error );
      this.status.ibmConnection = false;
    }
  }

  /**
   * VERIFICAR MÓDULOS QUÂNTICOS
   */
  async checkQuantumModules()
  {
    try
    {
      console.log( '🧩 [QUANTUM-ACTIVATOR] Verificando módulos quânticos...' );

      // Verificar se os arquivos de módulos existem
      const quantumModules = [
        'realQuantumEngine.ts',
        'realQuantumComputing.ts',
        'quantumLibraryIntegrator.ts',
        'enterpriseQuantumInfrastructure.ts'
      ];

      let modulesFound = 0;
      for ( const module of quantumModules )
      {
        try
        {
          const modulePath = path.join( process.cwd(), 'server', module );
          await fs.access( modulePath );
          modulesFound++;
          console.log( `✅ Módulo ${ module } encontrado` );
        } catch ( error )
        {
          console.log( `⚠️ Módulo ${ module } não encontrado` );
        }
      }

      // Verificar diretório qlib
      try
      {
        const qlibPath = path.join( process.cwd(), 'qlib' );
        await fs.access( qlibPath );
        console.log( '✅ Diretório qlib encontrado' );
        modulesFound++;
      } catch ( error )
      {
        console.log( '⚠️ Diretório qlib não encontrado' );
      }

      this.status.quantumModules = modulesFound >= 3;

      if ( this.status.quantumModules )
      {
        console.log( '✅ Módulos quânticos verificados' );
      } else
      {
        console.log( '⚠️ Alguns módulos quânticos estão faltando' );
      }

    } catch ( error )
    {
      console.error( '❌ Erro na verificação dos módulos:', error );
      this.status.quantumModules = false;
    }
  }

  /**
   * ATIVAR SISTEMA QUÂNTICO COMPLETO
   */
  async activateQuantumSystem()
  {
    console.log( '🚀 [QUANTUM-ACTIVATOR] Ativando sistema quântico completo...' );

    try
    {
      // 1. Verificar status atual
      await this.checkQuantumSystemStatus();

      // 2. Criar diretórios necessários
      await this.createQuantumDirectories();

      // 3. Inicializar cache quântico
      await this.initializeQuantumCache();

      // 4. Configurar monitoramento
      await this.setupQuantumMonitoring();

      console.log( '🎉 [QUANTUM-ACTIVATOR] Sistema quântico ativado com sucesso!' );
      return this.getActivationSummary();

    } catch ( error )
    {
      console.error( '❌ [QUANTUM-ACTIVATOR] Falha na ativação:', error );
      throw error;
    }
  }

  /**
   * CRIAR DIRETÓRIOS NECESSÁRIOS
   */
  async createQuantumDirectories()
  {
    const directories = [
      'qlib/notebooks',
      'qlib/data',
      'qlib/results',
      'quantum_cache',
      'quantum_logs',
      'quantum_temp'
    ];

    for ( const dir of directories )
    {
      try
      {
        await fs.mkdir( path.join( process.cwd(), dir ), { recursive: true } );
        console.log( `✅ Diretório ${ dir } criado` );
      } catch ( error )
      {
        console.log( `⚠️ Erro ao criar ${ dir }:`, error.message );
      }
    }
  }

  /**
   * INICIALIZAR CACHE QUÂNTICO
   */
  async initializeQuantumCache()
  {
    const cacheConfig = {
      version: '1.0.0',
      initialized: new Date().toISOString(),
      settings: {
        maxCacheSize: '1GB',
        ttl: 3600000, // 1 hora
        compression: true
      }
    };

    try
    {
      const cachePath = path.join( process.cwd(), 'quantum_cache', 'config.json' );
      await fs.writeFile( cachePath, JSON.stringify( cacheConfig, null, 2 ) );
      console.log( '✅ Cache quântico inicializado' );
    } catch ( error )
    {
      console.log( '⚠️ Erro ao inicializar cache:', error.message );
    }
  }

  /**
   * CONFIGURAR MONITORAMENTO
   */
  async setupQuantumMonitoring()
  {
    const monitoringConfig = {
      enabled: true,
      metrics: {
        quantumOperations: true,
        ibmUsage: true,
        performance: true,
        errors: true
      },
      alerts: {
        highLatency: true,
        connectionLoss: true,
        quotaExceeded: true
      }
    };

    try
    {
      const monitoringPath = path.join( process.cwd(), 'quantum_logs', 'monitoring.json' );
      await fs.writeFile( monitoringPath, JSON.stringify( monitoringConfig, null, 2 ) );
      console.log( '✅ Monitoramento quântico configurado' );
    } catch ( error )
    {
      console.log( '⚠️ Erro ao configurar monitoramento:', error.message );
    }
  }

  /**
   * OBTER RESUMO DA ATIVAÇÃO
   */
  getActivationSummary()
  {
    return {
      status: 'activated',
      timestamp: new Date().toISOString(),
      components: {
        pythonDependencies: this.status.pythonDependencies,
        ibmConnection: this.status.ibmConnection,
        quantumModules: this.status.quantumModules
      },
      capabilities: {
        realQuantumComputing: this.status.ibmConnection,
        simulationMode: true,
        batchProcessing: true,
        enterpriseModules: this.status.quantumModules
      },
      nextSteps: [
        'Testar APIs quânticas',
        'Configurar billing por tenant',
        'Demonstrar vantagem quântica',
        'Ativar monitoramento em produção'
      ]
    };
  }

  /**
   * OBTER STATUS ATUAL
   */
  getStatus()
  {
    return {
      ...this.status,
      summary: this.status.initialized ? 'Sistema quântico ativo' : 'Sistema quântico não inicializado'
    };
  }
}

// Instância global
const quantumActivator = new QuantumSystemActivator();

// Auto-ativação na inicialização
if ( process.env.NODE_ENV !== 'test' )
{
  quantumActivator.activateQuantumSystem().catch( error =>
  {
    console.error( '❌ Falha na auto-ativação do sistema quântico:', error );
  } );
}

module.exports = { QuantumSystemActivator, quantumActivator };
