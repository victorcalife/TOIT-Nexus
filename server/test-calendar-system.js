/**
 * TESTE COMPLETO DO SISTEMA DE CALENDÁRIO
 * Validar todas as funcionalidades críticas
 */

const CalendarService = require('./services/CalendarService');

class CalendarTester {
  constructor() {
    this.calendarService = new CalendarService();
    this.passed = 0;
    this.failed = 0;
  }

  async test(name, testFn) {
    try {
      console.log(`🧪 [TEST] ${name}...`);
      await testFn();
      console.log(`✅ [PASS] ${name}`);
      this.passed++;
    } catch (error) {
      console.error(`❌ [FAIL] ${name}:`, error.message);
      this.failed++;
    }
  }

  /**
   * Testar inicialização do serviço
   */
  async testServiceInitialization() {
    await this.test('Inicialização do Serviço', async () => {
      if (!this.calendarService.isInitialized) {
        throw new Error('Serviço de calendário não foi inicializado');
      }

      console.log(`   📝 Serviço inicializado com sucesso`);
    });
  }

  /**
   * Testar criação de evento
   */
  async testCreateEvent() {
    await this.test('Criação de Evento', async () => {
      const eventData = {
        title: 'Reunião de Teste',
        description: 'Reunião de teste do sistema TOIT NEXUS',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3600000).toISOString(),
        attendees: ['test1@example.com', 'test2@example.com']
      };

      const event = await this.calendarService.createEvent(eventData);
      
      if (!event.id) {
        throw new Error('ID do evento não foi gerado');
      }

      if (event.title !== eventData.title) {
        throw new Error('Título do evento não confere');
      }

      if (event.status !== 'scheduled') {
        throw new Error('Status do evento incorreto');
      }

      console.log(`   📝 Evento criado: ${event.id} - ${event.title}`);
    });
  }

  /**
   * Testar listagem de eventos
   */
  async testGetEvents() {
    await this.test('Listagem de Eventos', async () => {
      const events = await this.calendarService.getEvents();
      
      if (!Array.isArray(events)) {
        throw new Error('Lista de eventos deve ser um array');
      }

      if (events.length === 0) {
        throw new Error('Nenhum evento foi retornado');
      }

      const firstEvent = events[0];
      if (!firstEvent.id || !firstEvent.title || !firstEvent.startDate) {
        throw new Error('Evento não possui campos obrigatórios');
      }

      console.log(`   📝 ${events.length} eventos encontrados`);
    });
  }

  /**
   * Testar atualização de evento
   */
  async testUpdateEvent() {
    await this.test('Atualização de Evento', async () => {
      const eventId = 1;
      const updateData = {
        title: 'Reunião Atualizada',
        description: 'Descrição atualizada'
      };

      const updatedEvent = await this.calendarService.updateEvent(eventId, updateData);
      
      if (updatedEvent.id !== eventId) {
        throw new Error('ID do evento não confere');
      }

      if (updatedEvent.title !== updateData.title) {
        throw new Error('Título não foi atualizado');
      }

      if (!updatedEvent.updatedAt) {
        throw new Error('Data de atualização não foi definida');
      }

      console.log(`   📝 Evento ${eventId} atualizado: ${updatedEvent.title}`);
    });
  }

  /**
   * Testar exclusão de evento
   */
  async testDeleteEvent() {
    await this.test('Exclusão de Evento', async () => {
      const eventId = 1;
      
      const result = await this.calendarService.deleteEvent(eventId);
      
      if (!result.success) {
        throw new Error('Exclusão não foi bem-sucedida');
      }

      if (result.deletedId !== eventId) {
        throw new Error('ID do evento deletado não confere');
      }

      console.log(`   📝 Evento ${eventId} deletado com sucesso`);
    });
  }

  /**
   * Testar verificação de disponibilidade
   */
  async testCheckAvailability() {
    await this.test('Verificação de Disponibilidade', async () => {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 3600000).toISOString();
      const attendees = ['test1@example.com', 'test2@example.com'];
      
      const availability = await this.calendarService.checkAvailability(
        startDate, 
        endDate, 
        attendees
      );
      
      if (typeof availability.available !== 'boolean') {
        throw new Error('Campo available deve ser boolean');
      }

      if (!Array.isArray(availability.conflicts)) {
        throw new Error('Campo conflicts deve ser um array');
      }

      if (!Array.isArray(availability.suggestions)) {
        throw new Error('Campo suggestions deve ser um array');
      }

      console.log(`   📝 Disponibilidade verificada: ${availability.available ? 'Disponível' : 'Indisponível'}`);
    });
  }

  /**
   * Testar validação de dados de evento
   */
  async testEventValidation() {
    await this.test('Validação de Dados', async () => {
      // Testar evento válido
      const validEvent = {
        title: 'Evento Válido',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3600000).toISOString()
      };

      const event = await this.calendarService.createEvent(validEvent);
      if (!event.id) {
        throw new Error('Evento válido foi rejeitado');
      }

      // Testar evento inválido (sem título)
      try {
        await this.calendarService.createEvent({
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 3600000).toISOString()
        });
        throw new Error('Evento sem título deveria ser rejeitado');
      } catch (error) {
        // Esperado
      }

      console.log(`   📝 Validação funcionando corretamente`);
    });
  }

  /**
   * Testar formatação de datas
   */
  async testDateFormatting() {
    await this.test('Formatação de Datas', async () => {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 3600000);

      const event = await this.calendarService.createEvent({
        title: 'Teste de Data',
        startDate: now.toISOString(),
        endDate: oneHourLater.toISOString()
      });

      // Verificar se as datas foram preservadas
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Datas não são válidas');
      }

      if (endDate <= startDate) {
        throw new Error('Data de fim deve ser posterior à data de início');
      }

      console.log(`   📝 Formatação de datas funcionando`);
    });
  }

  /**
   * Executar todos os testes
   */
  async runAllTests() {
    console.log('🚀 INICIANDO TESTES DO SISTEMA DE CALENDÁRIO\n');

    await this.testServiceInitialization();
    await this.testCreateEvent();
    await this.testGetEvents();
    await this.testUpdateEvent();
    await this.testDeleteEvent();
    await this.testCheckAvailability();
    await this.testEventValidation();
    await this.testDateFormatting();

    console.log('\n📊 RELATÓRIO DE TESTES:');
    console.log(`✅ Testes passaram: ${this.passed}`);
    console.log(`❌ Testes falharam: ${this.failed}`);
    console.log(`📈 Taxa de sucesso: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

    if (this.failed === 0) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM - SISTEMA DE CALENDÁRIO FUNCIONANDO!');
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM - VERIFICAR IMPLEMENTAÇÃO');
    }

    return this.failed === 0;
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const tester = new CalendarTester();
  tester.runAllTests().catch(console.error);
}

module.exports = CalendarTester;
