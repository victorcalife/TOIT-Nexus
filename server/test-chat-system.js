/**
 * TESTE COMPLETO DO SISTEMA DE CHAT
 * Validar todas as funcionalidades críticas
 */

const { ChatService } = require( './chatService' );

class ChatTester
{
  constructor()
  {
    this.chatService = new ChatService();
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
   * Testar criação de conversa
   */
  async testCreateConversation()
  {
    await this.test( 'Criar Conversa', async () =>
    {
      const participants = [ 'user1', 'user2' ];
      const conversation = await this.chatService.createConversation( participants, 'direct' );

      if ( !conversation.id )
      {
        throw new Error( 'ID da conversa não foi gerado' );
      }

      if ( conversation.type !== 'direct' )
      {
        throw new Error( 'Tipo da conversa incorreto' );
      }

      if ( conversation.participants.length !== 2 )
      {
        throw new Error( 'Número de participantes incorreto' );
      }

      console.log( `   📝 Conversa criada: ${ conversation.id }` );
    } );
  }

  /**
   * Testar envio de mensagem
   */
  async testSendMessage()
  {
    await this.test( 'Enviar Mensagem', async () =>
    {
      const participants = [ 'user1', 'user2' ];
      const conversation = await this.chatService.createConversation( participants, 'direct' );

      const message = await this.chatService.sendMessage(
        conversation.id,
        'user1',
        'Olá! Esta é uma mensagem de teste.',
        'text'
      );

      if ( !message.id )
      {
        throw new Error( 'ID da mensagem não foi gerado' );
      }

      if ( message.content !== 'Olá! Esta é uma mensagem de teste.' )
      {
        throw new Error( 'Conteúdo da mensagem incorreto' );
      }

      if ( message.senderId !== 'user1' )
      {
        throw new Error( 'Sender ID incorreto' );
      }

      console.log( `   📝 Mensagem enviada: ${ message.id }` );
    } );
  }

  /**
   * Testar status de usuário online
   */
  async testUserPresence()
  {
    await this.test( 'Status de Presença', async () =>
    {
      // Marcar usuário como online
      await this.chatService.setUserOnline( 'user1', { name: 'Usuário Teste' } );

      const isOnline = this.chatService.isUserOnline( 'user1' );
      if ( !isOnline )
      {
        throw new Error( 'Usuário deveria estar online' );
      }

      // Marcar usuário como offline
      await this.chatService.setUserOffline( 'user1' );

      const isOffline = !this.chatService.isUserOnline( 'user1' );
      if ( !isOffline )
      {
        throw new Error( 'Usuário deveria estar offline' );
      }

      console.log( `   📝 Status de presença funcionando` );
    } );
  }

  /**
   * Testar chamada de voz
   */
  async testVoiceCall()
  {
    await this.test( 'Chamada de Voz', async () =>
    {
      const participants = [ 'user1', 'user2' ];
      const conversation = await this.chatService.createConversation( participants, 'direct' );

      // Iniciar chamada
      const call = await this.chatService.startVoiceCall(
        conversation.id,
        'user1',
        participants
      );

      if ( !call.id )
      {
        throw new Error( 'ID da chamada não foi gerado' );
      }

      if ( call.status !== 'ringing' )
      {
        throw new Error( 'Status inicial da chamada incorreto' );
      }

      // Aceitar chamada
      const acceptedCall = await this.chatService.acceptVoiceCall( call.id, 'user2' );

      if ( acceptedCall.status !== 'active' )
      {
        throw new Error( 'Status da chamada aceita incorreto' );
      }

      // Finalizar chamada
      const endedCall = await this.chatService.endVoiceCall( call.id, 'user1' );

      if ( endedCall.status !== 'ended' )
      {
        throw new Error( 'Status da chamada finalizada incorreto' );
      }

      console.log( `   📝 Chamada de voz: ${ call.id } (${ endedCall.duration }ms)` );
    } );
  }

  /**
   * Testar busca de mensagens
   */
  async testSearchMessages()
  {
    await this.test( 'Busca de Mensagens', async () =>
    {
      const participants = [ 'user1', 'user2' ];
      const conversation = await this.chatService.createConversation( participants, 'direct' );

      // Enviar algumas mensagens
      await this.chatService.sendMessage( conversation.id, 'user1', 'Primeira mensagem', 'text' );
      await this.chatService.sendMessage( conversation.id, 'user2', 'Segunda mensagem', 'text' );
      await this.chatService.sendMessage( conversation.id, 'user1', 'Terceira mensagem', 'text' );

      const results = await this.chatService.searchMessages( conversation.id, 'mensagem' );

      if ( results.length !== 3 )
      {
        throw new Error( `Esperado 3 resultados, encontrado ${ results.length }` );
      }

      console.log( `   📝 Busca encontrou ${ results.length } mensagens` );
    } );
  }

  /**
   * Testar histórico de conversa
   */
  async testConversationHistory()
  {
    await this.test( 'Histórico de Conversa', async () =>
    {
      const participants = [ 'user1', 'user2' ];
      const conversation = await this.chatService.createConversation( participants, 'direct' );

      // Enviar mensagens
      await this.chatService.sendMessage( conversation.id, 'user1', 'Mensagem 1', 'text' );
      await this.chatService.sendMessage( conversation.id, 'user2', 'Mensagem 2', 'text' );

      const history = await this.chatService.getConversationHistory( conversation.id, 10 );

      if ( history.length !== 2 )
      {
        throw new Error( `Esperado 2 mensagens no histórico, encontrado ${ history.length }` );
      }

      console.log( `   📝 Histórico carregado: ${ history.length } mensagens` );
    } );
  }

  /**
   * Executar todos os testes
   */
  async runAllTests()
  {
    console.log( '🚀 INICIANDO TESTES DO SISTEMA DE CHAT\n' );

    await this.testCreateConversation();
    await this.testSendMessage();
    await this.testUserPresence();
    await this.testVoiceCall();
    await this.testSearchMessages();
    await this.testConversationHistory();

    console.log( '\n📊 RELATÓRIO DE TESTES:' );
    console.log( `✅ Testes passaram: ${ this.passed }` );
    console.log( `❌ Testes falharam: ${ this.failed }` );
    console.log( `📈 Taxa de sucesso: ${ ( ( this.passed / ( this.passed + this.failed ) ) * 100 ).toFixed( 1 ) }%` );

    if ( this.failed === 0 )
    {
      console.log( '\n🎉 TODOS OS TESTES PASSARAM - SISTEMA DE CHAT FUNCIONANDO!' );
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
  const tester = new ChatTester();
  tester.runAllTests().catch( console.error );
}

module.exports = ChatTester;
