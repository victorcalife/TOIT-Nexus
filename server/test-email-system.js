/**
 * TESTE COMPLETO DO SISTEMA DE EMAIL
 * Validar todas as funcionalidades críticas
 */

const EmailService = require('./services/EmailService');

class EmailTester {
  constructor() {
    this.emailService = new EmailService();
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
      if (!this.emailService.transporter) {
        throw new Error('Transportador de email não foi inicializado');
      }

      if (typeof this.emailService.transporter.sendMail !== 'function') {
        throw new Error('Método sendMail não está disponível');
      }

      console.log(`   📝 Transportador inicializado com sucesso`);
    });
  }

  /**
   * Testar envio de email simples
   */
  async testSendSimpleEmail() {
    await this.test('Envio de Email Simples', async () => {
      const emailData = {
        to: ['test@example.com'],
        subject: 'Teste de Email - TOIT NEXUS',
        body: 'Este é um email de teste do sistema TOIT NEXUS.',
        from: {
          name: 'TOIT NEXUS',
          email: 'noreply@toit.com.br'
        }
      };

      const result = await this.emailService.sendEmail(emailData);
      
      if (!result.success) {
        throw new Error(`Falha no envio: ${result.error}`);
      }

      if (!result.messageId) {
        throw new Error('Message ID não foi retornado');
      }

      console.log(`   📝 Email enviado: ${result.messageId}`);
    });
  }

  /**
   * Testar formatação de corpo de email
   */
  async testEmailFormatting() {
    await this.test('Formatação de Email', async () => {
      const htmlBody = '<h1>Título</h1><p>Parágrafo com <strong>negrito</strong></p>';
      
      const formatted = this.emailService.formatEmailBody(htmlBody);
      if (!formatted.includes('<h1>')) {
        throw new Error('Formatação HTML não preservada');
      }

      const stripped = this.emailService.stripHtml(htmlBody);
      if (stripped.includes('<h1>')) {
        throw new Error('HTML não foi removido corretamente');
      }

      console.log(`   📝 Formatação funcionando: HTML preservado, texto limpo`);
    });
  }

  /**
   * Testar aplicação de template
   */
  async testEmailTemplate() {
    await this.test('Aplicação de Template', async () => {
      const templateData = {
        template: 'welcome',
        variables: {
          userName: 'João Silva',
          companyName: 'TOIT NEXUS',
          activationLink: 'https://toit.com.br/activate'
        }
      };

      const result = await this.emailService.applyTemplate(templateData);
      
      if (!result.success) {
        throw new Error(`Falha na aplicação do template: ${result.error}`);
      }

      if (!result.subject || !result.body) {
        throw new Error('Template não gerou subject ou body');
      }

      if (!result.body.includes('João Silva')) {
        throw new Error('Variáveis do template não foram substituídas');
      }

      console.log(`   📝 Template aplicado: ${result.subject}`);
    });
  }

  /**
   * Testar verificação de status
   */
  async testDeliveryStatus() {
    await this.test('Verificação de Status', async () => {
      const messageId = 'test_message_123';
      
      const status = await this.emailService.checkDeliveryStatus(messageId);
      
      if (!status.messageId) {
        throw new Error('Message ID não retornado no status');
      }

      if (!status.status) {
        throw new Error('Status não foi retornado');
      }

      console.log(`   📝 Status verificado: ${status.status} para ${messageId}`);
    });
  }

  /**
   * Testar criação de pastas
   */
  async testFolderCreation() {
    await this.test('Criação de Pastas', async () => {
      const userId = 1;
      
      await this.emailService.initializeUserFolders(userId);
      
      // Verificar se as pastas foram criadas (simulação)
      console.log(`   📝 Pastas inicializadas para usuário ${userId}`);
    });
  }

  /**
   * Testar limpeza de emails antigos
   */
  async testEmailCleanup() {
    await this.test('Limpeza de Emails', async () => {
      const deletedCount = await this.emailService.cleanupOldEmails();
      
      if (typeof deletedCount !== 'number') {
        throw new Error('Contagem de emails deletados deve ser um número');
      }

      console.log(`   📝 Limpeza executada: ${deletedCount} emails removidos`);
    });
  }

  /**
   * Testar validação de email
   */
  async testEmailValidation() {
    await this.test('Validação de Email', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        ''
      ];

      for (const email of validEmails) {
        const isValid = this.emailService.validateEmail(email);
        if (!isValid) {
          throw new Error(`Email válido rejeitado: ${email}`);
        }
      }

      for (const email of invalidEmails) {
        const isValid = this.emailService.validateEmail(email);
        if (isValid) {
          throw new Error(`Email inválido aceito: ${email}`);
        }
      }

      console.log(`   📝 Validação funcionando: ${validEmails.length} válidos, ${invalidEmails.length} inválidos`);
    });
  }

  /**
   * Executar todos os testes
   */
  async runAllTests() {
    console.log('🚀 INICIANDO TESTES DO SISTEMA DE EMAIL\n');

    await this.testServiceInitialization();
    await this.testSendSimpleEmail();
    await this.testEmailFormatting();
    await this.testEmailTemplate();
    await this.testDeliveryStatus();
    await this.testFolderCreation();
    await this.testEmailCleanup();
    await this.testEmailValidation();

    console.log('\n📊 RELATÓRIO DE TESTES:');
    console.log(`✅ Testes passaram: ${this.passed}`);
    console.log(`❌ Testes falharam: ${this.failed}`);
    console.log(`📈 Taxa de sucesso: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

    if (this.failed === 0) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM - SISTEMA DE EMAIL FUNCIONANDO!');
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM - VERIFICAR IMPLEMENTAÇÃO');
    }

    return this.failed === 0;
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const tester = new EmailTester();
  tester.runAllTests().catch(console.error);
}

module.exports = EmailTester;
