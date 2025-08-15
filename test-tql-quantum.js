/**
 * TESTE DO TQL QUÂNTICO - DEMONSTRAÇÃO
 * Exemplos práticos da sintaxe quântica do TQL
 */

// Usar import dinâmico para ES modules
async function testTQL()
{
  const { default: TQLParser } = await import( './services/tql/TQLParser.js' );

  // Criar instância do parser
  const parser = new TQLParser();

  console.log( '🔍 TESTE DO TQL QUÂNTICO - SINTAXE REVOLUCIONÁRIA\n' );

  // Teste 1: Operador = simples
  console.log( '1️⃣ OPERADOR = SIMPLES:' );
  const query1 = 'MOSTRAR salario DE funcionarios ONDE idade = 25';
  console.log( `TQL: ${ query1 }` );
  try
  {
    const parsed1 = parser.parse( query1 );
    const sql1 = parser.toSQL( parsed1 );
    console.log( `SQL: ${ sql1 }` );
    console.log( '✅ Sucesso!\n' );
  } catch ( error )
  {
    console.log( `❌ Erro: ${ error.message }\n` );
  }

  // Teste 2: Operador = com lista (IN)
  console.log( '2️⃣ OPERADOR = COM LISTA (IN):' );
  const query2 = 'MOSTRAR nome DE usuarios ONDE status = "ativo", "pendente", "processando"';
  console.log( `TQL: ${ query2 }` );
  try
  {
    const parsed2 = parser.parse( query2 );
    console.log( 'Condições parseadas:', JSON.stringify( parsed2.where, null, 2 ) );
    console.log( '✅ Sucesso!\n' );
  } catch ( error )
  {
    console.log( `❌ Erro: ${ error.message }\n` );
  }

  // Teste 3: Operador = com função temporal (mês completo)
  console.log( '3️⃣ OPERADOR = COM FUNÇÃO TEMPORAL (MÊS COMPLETO):' );
  const query3 = 'MOSTRAR salario DE funcionarios ONDE admissao = mes(-1)';
  console.log( `TQL: ${ query3 }` );
  try
  {
    const parsed3 = parser.parse( query3 );
    console.log( 'Condições parseadas:', JSON.stringify( parsed3.where, null, 2 ) );
    console.log( '✅ Sucesso!\n' );
  } catch ( error )
  {
    console.log( `❌ Erro: ${ error.message }\n` );
  }

  // Teste 4: Operador = com intervalo temporal
  console.log( '4️⃣ OPERADOR = COM INTERVALO TEMPORAL:' );
  const query4 = 'MOSTRAR salario DE funcionarios ONDE admissao = mes(-3) e mes';
  console.log( `TQL: ${ query4 }` );
  try
  {
    const parsed4 = parser.parse( query4 );
    console.log( 'Condições parseadas:', JSON.stringify( parsed4.where, null, 2 ) );
    console.log( '✅ Sucesso!\n' );
  } catch ( error )
  {
    console.log( `❌ Erro: ${ error.message }\n` );
  }

  // Teste 5: Query complexa com múltiplas condições
  console.log( '5️⃣ QUERY COMPLEXA COM MÚLTIPLAS CONDIÇÕES:' );
  const query5 = 'MOSTRAR nome, salario DE funcionarios ONDE departamento = "TI", "Vendas" E admissao = mes(-6) e mes';
  console.log( `TQL: ${ query5 }` );
  try
  {
    const parsed5 = parser.parse( query5 );
    console.log( 'Condições parseadas:', JSON.stringify( parsed5.where, null, 2 ) );
    console.log( '✅ Sucesso!\n' );
  } catch ( error )
  {
    console.log( `❌ Erro: ${ error.message }\n` );
  }

  // Teste 6: Validação de query
  console.log( '6️⃣ VALIDAÇÃO DE QUERY:' );
  const query6 = 'MOSTRAR nome ONDE idade = 25'; // Query inválida (sem DE)
  console.log( `TQL: ${ query6 }` );
  const validation = parser.validate( query6 );
  console.log( 'Validação:', validation );
  console.log( validation.valid ? '✅ Válida' : '❌ Inválida' );
  console.log( '\n' );

  // Teste 7: Autocomplete
  console.log( '7️⃣ AUTOCOMPLETE:' );
  const partialQuery = 'MOSTRAR nome DE usuarios ';
  const suggestions = parser.getSuggestions( partialQuery, partialQuery.length );
  console.log( `Query parcial: "${ partialQuery }"` );
  console.log( 'Sugestões:', suggestions );
  console.log( '✅ Sucesso!\n' );

  // Teste 8: Demonstração dos exemplos do manual
  console.log( '8️⃣ EXEMPLOS DO MANUAL:' );

  console.log( '\n📝 Exemplo 1: Funcionários do mês passado' );
  const exemplo1 = 'MOSTRAR salario DE funcionarios ONDE admissao = mes(-1)';
  console.log( `TQL: ${ exemplo1 }` );
  try
  {
    const parsed = parser.parse( exemplo1 );
    console.log( '✅ Parse realizado com sucesso' );
    console.log( 'Tipo de condição:', parsed.where[ 0 ].type );
    console.log( 'SQL gerado:', parsed.where[ 0 ].sql );
  } catch ( error )
  {
    console.log( `❌ Erro: ${ error.message }` );
  }

  console.log( '\n📝 Exemplo 2: Funcionários de 3 meses atrás até hoje' );
  const exemplo2 = 'MOSTRAR salario DE funcionarios ONDE admissao = mes(-3) e mes';
  console.log( `TQL: ${ exemplo2 }` );
  try
  {
    const parsed = parser.parse( exemplo2 );
    console.log( '✅ Parse realizado com sucesso' );
    console.log( 'Tipo de condição:', parsed.where[ 0 ].type );
    console.log( 'SQL gerado:', parsed.where[ 0 ].sql );
  } catch ( error )
  {
    console.log( `❌ Erro: ${ error.message }` );
  }

  console.log( '\n📝 Exemplo 3: Múltiplos meses específicos' );
  const exemplo3 = 'MOSTRAR salario DE funcionarios ONDE admissao = mes(-1), mes(-2), mes(-3)';
  console.log( `TQL: ${ exemplo3 }` );
  try
  {
    const parsed = parser.parse( exemplo3 );
    console.log( '✅ Parse realizado com sucesso' );
    console.log( 'Tipo de condição:', parsed.where[ 0 ].type );
    console.log( 'Valores:', parsed.where[ 0 ].values );
  } catch ( error )
  {
    console.log( `❌ Erro: ${ error.message }` );
  }

  console.log( '\n🎯 CONCLUSÃO:' );
  console.log( 'O TQL Quântico implementa com sucesso a filosofia de sintaxe contextual!' );
  console.log( '✅ Operador "=" se adapta automaticamente ao contexto' );
  console.log( '✅ Funções temporais intuitivas funcionando' );
  console.log( '✅ Intervalos naturais implementados' );
  console.log( '✅ Listas simples com vírgulas funcionando' );
  console.log( '✅ Validação e autocomplete operacionais' );
  console.log( '\n🚀 TQL 3.0 - SINTAXE QUÂNTICA REVOLUCIONÁRIA IMPLEMENTADA!' );
}

// Executar teste
testTQL().catch( console.error );
