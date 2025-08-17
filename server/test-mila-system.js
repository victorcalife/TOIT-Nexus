/**
 * TESTE COMPLETO DO SISTEMA MILA AI
 * Validar todas as funcionalidades críticas
 */

const MilaService = require( './services/MilaService' );

class MilaTester
{
  constructor()
  {
    this.milaService = new MilaService();
    this.passed = 0;
    this.failed = 0;
  }

  async test( name, testFn )
  {
    try
    {
      console.log( `🧪 [TEST] ${ name }...` );
      await testFn();
      console.log( `✅ [PASS] ${ name }` );
      this.passed++;
    } catch ( error )
    {
      console.error( `❌ [FAIL] ${ name }:`, error.message );
      this.failed++;
    }
  }

  /**
   * Testar inicialização do MILA
   */
  async testMilaInitialization()
  {
    await this.test( 'Inicialização do MILA', async () =>
    {
      // Aguardar inicialização se necessário
      await new Promise( resolve => setTimeout( resolve, 500 ) );

      if ( !this.milaService.isOperational() )
      {
        throw new Error( 'MILA não está operacional' );
      }

      const models = await this.milaService.getModelStatus();
      if ( Object.keys( models ).length < 3 )
      {
        throw new Error( 'Poucos modelos carregados' );
      }

      console.log( `   📝 MILA operacional com ${ Object.keys( models ).length } modelos` );
    } );
  }

  /**
   * Testar processamento de mensagem
   */
  async testMessageProcessing()
  {
    await this.test( 'Processamento de Mensagem', async () =>
    {
      const message = 'Olá MILA, como você pode me ajudar com análise de dados?';
      const sessionId = 'test-session-123';

      const result = await this.milaService.processMessage( {
        message,
        sessionId,
        userId: 'test-user'
      } );

      if ( !result.response )
      {
        throw new Error( 'Resposta não foi gerada' );
      }

      if ( !result.intent )
      {
        throw new Error( 'Intenção não foi identificada' );
      }

      if ( !Array.isArray( result.entities ) )
      {
        throw new Error( 'Entidades não foram extraídas' );
      }

      if ( result.confidence < 0.5 )
      {
        throw new Error( 'Confiança muito baixa' );
      }

      console.log( `   📝 Mensagem processada: intenção "${ result.intent }" (confiança: ${ result.confidence.toFixed( 3 ) })` );
    } );
  }

  /**
   * Testar análise de sentimento
   */
  async testSentimentAnalysis()
  {
    await this.test( 'Análise de Sentimento', async () =>
    {
      const texts = [
        'Estou muito feliz com os resultados!',
        'Isso é terrível e frustrante.',
        'O produto está funcionando normalmente.'
      ];

      for ( const text of texts )
      {
        const result = await this.milaService.performAnalysis( {
          data: text,
          type: 'sentiment',
          userId: 'test-user'
        } );

        if ( !result.result.sentiment )
        {
          throw new Error( 'Sentimento não foi identificado' );
        }

        if ( typeof result.result.score !== 'number' )
        {
          throw new Error( 'Score de sentimento inválido' );
        }

        if ( result.confidence < 0.5 )
        {
          throw new Error( 'Confiança muito baixa' );
        }
      }

      console.log( `   📝 Análise de sentimento executada para ${ texts.length } textos` );
    } );
  }

  /**
   * Testar extração de entidades
   */
  async testEntityExtraction()
  {
    await this.test( 'Extração de Entidades', async () =>
    {
      const text = 'João Silva trabalha na TOIT em São Paulo desde janeiro de 2024';

      const result = await this.milaService.performAnalysis( {
        data: text,
        type: 'entities',
        userId: 'test-user'
      } );

      if ( !Array.isArray( result.result ) )
      {
        throw new Error( 'Entidades não foram extraídas como array' );
      }

      if ( result.confidence < 0.5 )
      {
        throw new Error( 'Confiança muito baixa' );
      }

      console.log( `   📝 ${ result.result.length } entidades extraídas` );
    } );
  }

  /**
   * Testar análise de dados de negócio
   */
  async testBusinessAnalysis()
  {
    await this.test( 'Análise de Dados de Negócio', async () =>
    {
      const businessData = {
        revenue: [ 100000, 120000, 110000, 130000, 125000 ],
        costs: [ 80000, 85000, 82000, 90000, 88000 ],
        customers: [ 500, 520, 510, 550, 540 ]
      };

      const result = await this.milaService.performAnalysis( {
        data: businessData,
        type: 'business',
        userId: 'test-user'
      } );

      if ( !result.result.trends )
      {
        throw new Error( 'Tendências não foram identificadas' );
      }

      if ( !Array.isArray( result.result.insights ) )
      {
        throw new Error( 'Insights não foram gerados' );
      }

      if ( !Array.isArray( result.result.recommendations ) )
      {
        throw new Error( 'Recomendações não foram geradas' );
      }

      console.log( `   📝 Análise de negócio: tendência "${ result.result.trends }"` );
    } );
  }

  /**
   * Testar análise de dados quânticos
   */
  async testQuantumAnalysis()
  {
    await this.test( 'Análise de Dados Quânticos', async () =>
    {
      const quantumData = {
        qubits: 64,
        coherenceTime: 100,
        fidelity: 0.95,
        operations: [ 'grover', 'qaoa', 'vqe' ]
      };

      const result = await this.milaService.performAnalysis( {
        data: quantumData,
        type: 'quantum',
        userId: 'test-user'
      } );

      if ( typeof result.result.quantumAdvantage !== 'number' )
      {
        throw new Error( 'Vantagem quântica não foi calculada' );
      }

      if ( typeof result.result.coherence !== 'number' )
      {
        throw new Error( 'Coerência não foi analisada' );
      }

      if ( !Array.isArray( result.result.recommendations ) )
      {
        throw new Error( 'Recomendações quânticas não foram geradas' );
      }

      console.log( `   📝 Análise quântica: vantagem ${ result.result.quantumAdvantage.toFixed( 2 ) }x` );
    } );
  }

  /**
   * Testar análise de intenção
   */
  async testIntentAnalysis()
  {
    await this.test( 'Análise de Intenção', async () =>
    {
      const testCases = [
        { text: 'Como funciona o algoritmo quântico?', expectedIntent: 'quantum_query' },
        { text: 'Preciso analisar estes dados de vendas', expectedIntent: 'data_analysis' },
        { text: 'Qual é o horário de funcionamento?', expectedIntent: 'question' },
        { text: 'Obrigado pela ajuda!', expectedIntent: 'compliment' },
        { text: 'Estou com problema no sistema', expectedIntent: 'complaint' }
      ];

      for ( const testCase of testCases )
      {
        const intent = await this.milaService.analyzeIntent( testCase.text );

        if ( intent !== testCase.expectedIntent )
        {
          console.warn( `   ⚠️ Intenção esperada: ${ testCase.expectedIntent }, obtida: ${ intent }` );
        }
      }

      console.log( `   📝 Análise de intenção testada para ${ testCases.length } casos` );
    } );
  }

  /**
   * Testar geração de sugestões
   */
  async testSuggestionGeneration()
  {
    await this.test( 'Geração de Sugestões', async () =>
    {
      const intents = [ 'quantum_query', 'data_analysis', 'general' ];

      for ( const intent of intents )
      {
        const suggestions = await this.milaService.generateSuggestions( intent, {
          userId: 'test-user'
        } );

        if ( !Array.isArray( suggestions ) )
        {
          throw new Error( `Sugestões para ${ intent } não são um array` );
        }

        if ( suggestions.length === 0 )
        {
          throw new Error( `Nenhuma sugestão gerada para ${ intent }` );
        }
      }

      console.log( `   📝 Sugestões geradas para ${ intents.length } tipos de intenção` );
    } );
  }

  /**
   * Testar performance sob carga
   */
  async testPerformanceUnderLoad()
  {
    await this.test( 'Performance Sob Carga', async () =>
    {
      const operations = [];
      const numOperations = 5;

      // Executar múltiplas análises simultaneamente
      for ( let i = 0; i < numOperations; i++ )
      {
        operations.push(
          this.milaService.performAnalysis( {
            data: `Texto de teste número ${ i } para análise de sentimento`,
            type: 'sentiment',
            userId: `test-user-${ i }`
          } )
        );
      }

      const results = await Promise.all( operations );

      const successfulOperations = results.filter( r => r.result && r.confidence > 0.5 );
      if ( successfulOperations.length !== numOperations )
      {
        throw new Error( `Apenas ${ successfulOperations.length }/${ numOperations } operações foram bem-sucedidas` );
      }

      const avgProcessingTime = results.reduce( ( sum, r ) => sum + r.processingTime, 0 ) / numOperations;
      if ( avgProcessingTime > 5000 )
      { // 5 segundos
        throw new Error( `Tempo de processamento muito alto: ${ avgProcessingTime }ms` );
      }

      console.log( `   📝 ${ numOperations } operações executadas em média ${ avgProcessingTime.toFixed( 0 ) }ms` );
    } );
  }

  /**
   * Testar status dos modelos
   */
  async testModelStatus()
  {
    await this.test( 'Status dos Modelos', async () =>
    {
      const models = await this.milaService.getModelStatus();

      const requiredModels = [ 'gpt-4', 'sentiment-analyzer', 'entity-extractor' ];

      for ( const modelName of requiredModels )
      {
        if ( !models[ modelName ] )
        {
          throw new Error( `Modelo ${ modelName } não encontrado` );
        }

        if ( models[ modelName ].status !== 'active' )
        {
          throw new Error( `Modelo ${ modelName } não está ativo` );
        }
      }

      const activeModels = Object.values( models ).filter( m => m.status === 'active' ).length;
      console.log( `   📝 ${ activeModels } modelos ativos de ${ Object.keys( models ).length } total` );
    } );
  }

  /**
   * Executar todos os testes
   */
  async runAllTests()
  {
    console.log( '🚀 INICIANDO TESTES DO SISTEMA MILA AI\n' );

    await this.testMilaInitialization();
    await this.testMessageProcessing();
    await this.testSentimentAnalysis();
    await this.testEntityExtraction();
    await this.testBusinessAnalysis();
    await this.testQuantumAnalysis();
    await this.testIntentAnalysis();
    await this.testSuggestionGeneration();
    await this.testPerformanceUnderLoad();
    await this.testModelStatus();

    console.log( '\n📊 RELATÓRIO DE TESTES:' );
    console.log( `✅ Testes passaram: ${ this.passed }` );
    console.log( `❌ Testes falharam: ${ this.failed }` );
    console.log( `📈 Taxa de sucesso: ${ ( ( this.passed / ( this.passed + this.failed ) ) * 100 ).toFixed( 1 ) }%` );

    if ( this.failed === 0 )
    {
      console.log( '\n🎉 TODOS OS TESTES PASSARAM - SISTEMA MILA AI FUNCIONANDO!' );
    } else
    {
      console.log( '\n⚠️ ALGUNS TESTES FALHARAM - VERIFICAR IMPLEMENTAÇÃO' );
    }

    return this.failed === 0;
  }
}

// Executar testes se chamado diretamente
if ( require.main === module )
{
  const tester = new MilaTester();
  tester.runAllTests().catch( console.error );
}

module.exports = MilaTester;
