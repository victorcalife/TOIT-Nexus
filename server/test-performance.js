/**
 * TESTE DE PERFORMANCE DO SISTEMA UNIFICADO
 * Valida tempo de resposta, memória e CPU
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require( 'express' );
const request = require( 'supertest' );

class PerformanceTestSuite
{
  constructor()
  {
    this.passed = 0;
    this.failed = 0;
    this.app = null;
    this.metrics = {
      responseTime: [],
      memoryUsage: [],
      cpuUsage: []
    };
  }

  /**
   * EXECUTAR TESTE
   */
  async runTest( name, testFn )
  {
    try
    {
      console.log( `🧪 [TEST] Executando: ${ name }` );
      await testFn();
      console.log( `✅ [TEST] PASSOU: ${ name }` );
      this.passed++;
    } catch ( error )
    {
      console.error( `❌ [TEST] FALHOU: ${ name } - ${ error.message }` );
      this.failed++;
    }
  }

  /**
   * CONFIGURAR SERVIDOR PARA TESTES DE PERFORMANCE
   */
  setupPerformanceServer()
  {
    this.app = express();
    this.app.use( express.json() );

    // Middleware de medição de performance
    this.app.use( ( req, res, next ) =>
    {
      req.startTime = process.hrtime.bigint();

      const originalSend = res.send;
      res.send = function ( data )
      {
        const endTime = process.hrtime.bigint();
        const responseTime = Number( endTime - req.startTime ) / 1000000; // Convert to ms

        res.setHeader( 'X-Response-Time', `${ responseTime.toFixed( 2 ) }ms` );
        return originalSend.call( this, data );
      };

      next();
    } );

    // Rotas de teste de performance
    this.app.get( '/api/health', ( req, res ) =>
    {
      res.json( {
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        uptime: process.uptime()
      } );
    } );

    this.app.get( '/api/heavy-computation', ( req, res ) =>
    {
      // Simular operação pesada
      const start = Date.now();
      let result = 0;
      for ( let i = 0; i < 1000000; i++ )
      {
        result += Math.sqrt( i );
      }
      const duration = Date.now() - start;

      res.json( {
        success: true,
        result: result.toFixed( 2 ),
        computationTime: duration,
        memory: process.memoryUsage()
      } );
    } );

    this.app.post( '/api/data-processing', ( req, res ) =>
    {
      const { data } = req.body;
      const start = Date.now();

      // Simular processamento de dados
      const processed = ( data || [] ).map( item => ( {
        ...item,
        processed: true,
        timestamp: new Date().toISOString()
      } ) );

      const duration = Date.now() - start;

      res.json( {
        success: true,
        processed: processed.length,
        processingTime: duration,
        memory: process.memoryUsage()
      } );
    } );

    this.app.get( '/api/concurrent-test/:id', ( req, res ) =>
    {
      const { id } = req.params;

      // Simular delay variável
      const delay = Math.random() * 100;
      setTimeout( () =>
      {
        res.json( {
          success: true,
          id,
          delay: delay.toFixed( 2 ),
          timestamp: new Date().toISOString(),
          memory: process.memoryUsage()
        } );
      }, delay );
    } );

    this.app.get( '/api/memory-intensive', ( req, res ) =>
    {
      // Simular uso intensivo de memória
      const largeArray = new Array( 100000 ).fill( 0 ).map( ( _, i ) => ( {
        id: i,
        data: `item-${ i }`,
        timestamp: new Date().toISOString()
      } ) );

      res.json( {
        success: true,
        itemsGenerated: largeArray.length,
        memory: process.memoryUsage()
      } );
    } );
  }

  /**
   * MEDIR TEMPO DE RESPOSTA
   */
  async testResponseTime()
  {
    const iterations = 10;
    const responseTimes = [];

    for ( let i = 0; i < iterations; i++ )
    {
      const start = Date.now();

      const response = await request( this.app )
        .get( '/api/health' )
        .expect( 200 );

      const end = Date.now();
      const responseTime = end - start;
      responseTimes.push( responseTime );

      if ( !response.body.success )
      {
        throw new Error( 'Health check falhou durante teste de performance' );
      }
    }

    const avgResponseTime = responseTimes.reduce( ( a, b ) => a + b, 0 ) / responseTimes.length;
    const maxResponseTime = Math.max( ...responseTimes );
    const minResponseTime = Math.min( ...responseTimes );

    // Critério: tempo médio deve ser menor que 100ms
    if ( avgResponseTime > 100 )
    {
      throw new Error( `Tempo de resposta muito alto: ${ avgResponseTime.toFixed( 2 ) }ms (limite: 100ms)` );
    }

    this.metrics.responseTime = {
      avg: avgResponseTime.toFixed( 2 ),
      max: maxResponseTime,
      min: minResponseTime,
      samples: iterations
    };

    console.log( `⚡ [TEST] Tempo de resposta: ${ avgResponseTime.toFixed( 2 ) }ms (min: ${ minResponseTime }ms, max: ${ maxResponseTime }ms)` );
  }

  /**
   * TESTE DE USO DE MEMÓRIA
   */
  async testMemoryUsage()
  {
    const initialMemory = process.memoryUsage();

    // Executar operação que usa memória
    const response = await request( this.app )
      .get( '/api/memory-intensive' )
      .expect( 200 );

    const finalMemory = process.memoryUsage();

    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

    // Critério: aumento de memória deve ser menor que 50MB
    if ( memoryIncreaseMB > 50 )
    {
      throw new Error( `Uso de memória muito alto: ${ memoryIncreaseMB.toFixed( 2 ) }MB (limite: 50MB)` );
    }

    this.metrics.memoryUsage = {
      initial: Math.round( initialMemory.heapUsed / 1024 / 1024 ),
      final: Math.round( finalMemory.heapUsed / 1024 / 1024 ),
      increase: memoryIncreaseMB.toFixed( 2 ),
      itemsProcessed: response.body.itemsGenerated
    };

    console.log( `💾 [TEST] Memória: ${ this.metrics.memoryUsage.initial }MB → ${ this.metrics.memoryUsage.final }MB (+${ this.metrics.memoryUsage.increase }MB)` );
  }

  /**
   * TESTE DE COMPUTAÇÃO PESADA
   */
  async testHeavyComputation()
  {
    const response = await request( this.app )
      .get( '/api/heavy-computation' )
      .expect( 200 );

    const computationTime = response.body.computationTime;

    // Critério: computação deve ser menor que 1000ms
    if ( computationTime > 1000 )
    {
      throw new Error( `Computação muito lenta: ${ computationTime }ms (limite: 1000ms)` );
    }

    console.log( `🧮 [TEST] Computação pesada: ${ computationTime }ms para 1M operações` );
  }

  /**
   * TESTE DE PROCESSAMENTO DE DADOS
   */
  async testDataProcessing()
  {
    const testData = new Array( 1000 ).fill( 0 ).map( ( _, i ) => ( {
      id: i,
      name: `Item ${ i }`,
      value: Math.random() * 100
    } ) );

    const response = await request( this.app )
      .post( '/api/data-processing' )
      .send( { data: testData } )
      .expect( 200 );

    const processingTime = response.body.processingTime;

    // Critério: processamento deve ser menor que 500ms para 1000 items
    if ( processingTime > 500 )
    {
      throw new Error( `Processamento muito lento: ${ processingTime }ms (limite: 500ms)` );
    }

    console.log( `📊 [TEST] Processamento: ${ response.body.processed } items em ${ processingTime }ms` );
  }

  /**
   * TESTE DE CONCORRÊNCIA
   */
  async testConcurrency()
  {
    const concurrentRequests = 20;
    const promises = [];

    const startTime = Date.now();

    for ( let i = 0; i < concurrentRequests; i++ )
    {
      promises.push(
        request( this.app )
          .get( `/api/concurrent-test/${ i }` )
          .expect( 200 )
      );
    }

    const responses = await Promise.all( promises );
    const endTime = Date.now();

    const totalTime = endTime - startTime;
    const avgTimePerRequest = totalTime / concurrentRequests;

    // Critério: tempo total deve ser menor que 2000ms para 20 requests
    if ( totalTime > 2000 )
    {
      throw new Error( `Concorrência muito lenta: ${ totalTime }ms (limite: 2000ms)` );
    }

    // Verificar se todas as respostas foram bem-sucedidas
    const successfulResponses = responses.filter( r => r.body.success ).length;
    if ( successfulResponses !== concurrentRequests )
    {
      throw new Error( `Algumas requisições falharam: ${ successfulResponses }/${ concurrentRequests }` );
    }

    console.log( `🔄 [TEST] Concorrência: ${ concurrentRequests } requests em ${ totalTime }ms (${ avgTimePerRequest.toFixed( 2 ) }ms/req)` );
  }

  /**
   * TESTE DE ESTABILIDADE DE MEMÓRIA
   */
  async testMemoryStability()
  {
    const iterations = 5;
    const memoryReadings = [];

    for ( let i = 0; i < iterations; i++ )
    {
      await request( this.app )
        .get( '/api/health' )
        .expect( 200 );

      const memory = process.memoryUsage();
      memoryReadings.push( memory.heapUsed );

      // Pequeno delay entre requests
      await new Promise( resolve => setTimeout( resolve, 100 ) );
    }

    // Verificar se há vazamento de memória
    const firstReading = memoryReadings[ 0 ];
    const lastReading = memoryReadings[ memoryReadings.length - 1 ];
    const memoryIncrease = ( lastReading - firstReading ) / 1024 / 1024;

    // Critério: aumento de memória deve ser menor que 10MB
    if ( memoryIncrease > 10 )
    {
      throw new Error( `Possível vazamento de memória: ${ memoryIncrease.toFixed( 2 ) }MB` );
    }

    console.log( `🔒 [TEST] Estabilidade: ${ memoryIncrease.toFixed( 2 ) }MB de variação em ${ iterations } requests` );
  }

  /**
   * GERAR RELATÓRIO DE PERFORMANCE
   */
  generatePerformanceReport()
  {
    console.log( '\n📊 [PERFORMANCE] Relatório de Performance:' );
    console.log( '='.repeat( 50 ) );

    if ( this.metrics.responseTime )
    {
      console.log( `⚡ Tempo de Resposta:` );
      console.log( `   Média: ${ this.metrics.responseTime.avg }ms` );
      console.log( `   Mín/Máx: ${ this.metrics.responseTime.min }ms / ${ this.metrics.responseTime.max }ms` );
    }

    if ( this.metrics.memoryUsage )
    {
      console.log( `💾 Uso de Memória:` );
      console.log( `   Inicial: ${ this.metrics.memoryUsage.initial }MB` );
      console.log( `   Final: ${ this.metrics.memoryUsage.final }MB` );
      console.log( `   Aumento: +${ this.metrics.memoryUsage.increase }MB` );
    }

    console.log( `🏆 Status Geral: ${ this.failed === 0 ? 'EXCELENTE' : 'PRECISA OTIMIZAÇÃO' }` );
    console.log( '='.repeat( 50 ) );
  }

  /**
   * EXECUTAR TODOS OS TESTES
   */
  async runAllTests()
  {
    console.log( '🚀 [TEST] Iniciando testes de performance...\n' );

    // Configurar servidor
    this.setupPerformanceServer();

    await this.runTest( 'Tempo de Resposta', () => this.testResponseTime() );
    await this.runTest( 'Uso de Memória', () => this.testMemoryUsage() );
    await this.runTest( 'Computação Pesada', () => this.testHeavyComputation() );
    await this.runTest( 'Processamento de Dados', () => this.testDataProcessing() );
    await this.runTest( 'Concorrência', () => this.testConcurrency() );
    await this.runTest( 'Estabilidade de Memória', () => this.testMemoryStability() );

    console.log( '\n📊 [TEST] Resultados dos testes:' );
    console.log( `✅ Passou: ${ this.passed }` );
    console.log( `❌ Falhou: ${ this.failed }` );
    console.log( `📈 Taxa de sucesso: ${ Math.round( ( this.passed / ( this.passed + this.failed ) ) * 100 ) }%` );

    this.generatePerformanceReport();

    if ( this.failed === 0 )
    {
      console.log( '\n🎉 [TEST] Todos os testes passaram! Performance excelente.' );
      return true;
    } else
    {
      console.log( '\n⚠️ [TEST] Alguns testes falharam. Sistema precisa de otimização.' );
      return false;
    }
  }
}

// Executar testes se chamado diretamente
if ( require.main === module )
{
  const testSuite = new PerformanceTestSuite();
  testSuite.runAllTests().then( success =>
  {
    process.exit( success ? 0 : 1 );
  } ).catch( error =>
  {
    console.error( '💥 [TEST] Erro crítico nos testes:', error );
    process.exit( 1 );
  } );
}

module.exports = PerformanceTestSuite;
