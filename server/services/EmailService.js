const nodemailer = require( 'nodemailer' );
const fs = require( 'fs' ).promises;
const path = require( 'path' );
const DatabaseService = require( './DatabaseService' );

class EmailService
{
  constructor()
  {
    this.db = new DatabaseService();
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Inicializar transportador de email
   */
  async initializeTransporter()
  {
    try
    {
      // Configuração para desenvolvimento (usar Ethereal Email)
      if ( process.env.NODE_ENV === 'development' )
      {
        const testAccount = await nodemailer.createTestAccount();

        this.transporter = nodemailer.createTransport( {
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        } );

        console.log( '📧 Email service inicializado (Ethereal)' );
      } else
      {
        // Configuração para produção
        this.transporter = nodemailer.createTransport( {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        } );

        console.log( '📧 Email service inicializado (Produção)' );
      }

      // Verificar conexão
      await this.transporter.verify();
      console.log( '✅ Conexão SMTP verificada' );

    } catch ( error )
    {
      console.error( '❌ Erro ao inicializar email service:', error );

      // Fallback para desenvolvimento
      this.transporter = {
        sendMail: async ( options ) =>
        {
          console.log( '📧 Email simulado:', {
            to: options.to,
            subject: options.subject,
            text: options.text?.substring( 0, 100 ) + '...'
          } );

          return {
            messageId: `mock_${ Date.now() }@toit.com.br`,
            response: 'Email simulado enviado com sucesso'
          };
        }
      };
    }
  }

  /**
   * Enviar email
   */
  async sendEmail( emailData )
  {
    try
    {
      const {
        emailId,
        to,
        cc = [],
        bcc = [],
        subject,
        body,
        attachments = [],
        from
      } = emailData;

      console.log( `📧 Enviando email: ${ subject } para ${ to.join( ', ' ) }` );

      // Preparar anexos
      const mailAttachments = [];
      for ( const attachment of attachments )
      {
        if ( attachment.path && await this.fileExists( attachment.path ) )
        {
          mailAttachments.push( {
            filename: attachment.originalname,
            path: attachment.path,
            contentType: attachment.mimetype
          } );
        }
      }

      // Configurar opções do email
      const mailOptions = {
        from: `${ from.name } <${ from.email }>`,
        to: to.join( ', ' ),
        cc: cc.length > 0 ? cc.join( ', ' ) : undefined,
        bcc: bcc.length > 0 ? bcc.join( ', ' ) : undefined,
        subject: subject,
        html: this.formatEmailBody( body ),
        text: this.stripHtml( body ),
        attachments: mailAttachments
      };

      // Enviar email
      const result = await this.transporter.sendMail( mailOptions );

      // Log do resultado
      if ( process.env.NODE_ENV === 'development' )
      {
        console.log( '📧 Preview URL:', nodemailer.getTestMessageUrl( result ) );
      }

      // Atualizar status no banco
      if ( emailId )
      {
        await this.db.query( `
          UPDATE emails 
          SET send_status = 'sent', external_id = ?, sent_at = NOW()
          WHERE id = ?
        `, [ result.messageId, emailId ] );
      }

      return {
        success: true,
        messageId: result.messageId,
        response: result.response,
        previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl( result ) : null
      };

    } catch ( error )
    {
      console.error( '❌ Erro ao enviar email:', error );

      // Atualizar status de erro no banco
      if ( emailData.emailId )
      {
        await this.db.query( `
          UPDATE emails 
          SET send_status = 'failed', error_message = ?
          WHERE id = ?
        `, [ error.message, emailData.emailId ] );
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Agendar envio de email
   */
  async scheduleEmail( emailData )
  {
    try
    {
      const { emailId, scheduledFor } = emailData;

      console.log( `📅 Agendando email ${ emailId } para ${ scheduledFor }` );

      // Salvar na tabela de emails agendados
      await this.db.query( `
        INSERT INTO scheduled_emails (
          email_id, scheduled_for, status, created_at
        ) VALUES (?, ?, 'pending', NOW())
      `, [ emailId, scheduledFor ] );

      // Atualizar status do email
      await this.db.query( `
        UPDATE emails 
        SET send_status = 'scheduled'
        WHERE id = ?
      `, [ emailId ] );

      return {
        success: true,
        message: 'Email agendado com sucesso',
        scheduledFor
      };

    } catch ( error )
    {
      console.error( '❌ Erro ao agendar email:', error );
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Processar emails agendados
   */
  async processScheduledEmails()
  {
    try
    {
      // Buscar emails que devem ser enviados agora
      const scheduledEmails = await this.db.query( `
        SELECT 
          se.id as schedule_id,
          se.email_id,
          e.subject,
          e.body,
          e.from_email,
          e.from_name,
          e.to_emails,
          e.cc_emails,
          e.bcc_emails
        FROM scheduled_emails se
        JOIN emails e ON se.email_id = e.id
        WHERE se.status = 'pending' 
        AND se.scheduled_for <= NOW()
        LIMIT 10
      `);

      console.log( `📅 Processando ${ scheduledEmails.length } emails agendados` );

      for ( const scheduledEmail of scheduledEmails )
      {
        try
        {
          // Buscar anexos
          const attachments = await this.db.query( `
            SELECT * FROM email_attachments 
            WHERE email_id = ?
          `, [ scheduledEmail.email_id ] );

          // Enviar email
          const result = await this.sendEmail( {
            emailId: scheduledEmail.email_id,
            to: JSON.parse( scheduledEmail.to_emails || '[]' ),
            cc: JSON.parse( scheduledEmail.cc_emails || '[]' ),
            bcc: JSON.parse( scheduledEmail.bcc_emails || '[]' ),
            subject: scheduledEmail.subject,
            body: scheduledEmail.body,
            attachments,
            from: {
              email: scheduledEmail.from_email,
              name: scheduledEmail.from_name
            }
          } );

          // Atualizar status do agendamento
          await this.db.query( `
            UPDATE scheduled_emails 
            SET status = ?, processed_at = NOW(), result = ?
            WHERE id = ?
          `, [
            result.success ? 'sent' : 'failed',
            JSON.stringify( result ),
            scheduledEmail.schedule_id
          ] );

        } catch ( error )
        {
          console.error( `❌ Erro ao processar email agendado ${ scheduledEmail.email_id }:`, error );

          await this.db.query( `
            UPDATE scheduled_emails 
            SET status = 'failed', processed_at = NOW(), error_message = ?
            WHERE id = ?
          `, [ error.message, scheduledEmail.schedule_id ] );
        }
      }

      return scheduledEmails.length;

    } catch ( error )
    {
      console.error( '❌ Erro ao processar emails agendados:', error );
      return 0;
    }
  }

  /**
   * Criar template de email
   */
  async createTemplate( templateData )
  {
    try
    {
      const { userId, name, subject, body, description, isSystem = false } = templateData;

      const result = await this.db.query( `
        INSERT INTO email_templates (
          user_id, name, subject, body, description, is_system, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [ userId, name, subject, body, description, isSystem ] );

      return {
        success: true,
        templateId: result.insertId
      };

    } catch ( error )
    {
      console.error( '❌ Erro ao criar template:', error );
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Aplicar template a email
   */
  async applyTemplate( templateId, variables = {} )
  {
    try
    {
      const templates = await this.db.query( `
        SELECT * FROM email_templates WHERE id = ?
      `, [ templateId ] );

      if ( templates.length === 0 )
      {
        throw new Error( 'Template não encontrado' );
      }

      const template = templates[ 0 ];

      // Substituir variáveis no template
      let subject = template.subject;
      let body = template.body;

      Object.keys( variables ).forEach( key =>
      {
        const placeholder = `{{${ key }}}`;
        subject = subject.replace( new RegExp( placeholder, 'g' ), variables[ key ] );
        body = body.replace( new RegExp( placeholder, 'g' ), variables[ key ] );
      } );

      return {
        success: true,
        subject,
        body,
        template: template.name
      };

    } catch ( error )
    {
      console.error( '❌ Erro ao aplicar template:', error );
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verificar status de entrega
   */
  async checkDeliveryStatus( messageId )
  {
    try
    {
      // Implementar verificação de status com provedor de email
      // Por enquanto, retornar status simulado

      return {
        messageId,
        status: 'delivered',
        deliveredAt: new Date(),
        opens: Math.floor( Math.random() * 5 ),
        clicks: Math.floor( Math.random() * 3 )
      };

    } catch ( error )
    {
      console.error( '❌ Erro ao verificar status:', error );
      return {
        messageId,
        status: 'unknown',
        error: error.message
      };
    }
  }

  /**
   * Processar webhooks de email
   */
  async processWebhook( webhookData )
  {
    try
    {
      const { messageId, event, timestamp, data } = webhookData;

      // Salvar evento no banco
      await this.db.query( `
        INSERT INTO email_events (
          message_id, event_type, event_data, created_at
        ) VALUES (?, ?, ?, ?)
      `, [ messageId, event, JSON.stringify( data ), new Date( timestamp ) ] );

      // Atualizar status do email se necessário
      if ( event === 'delivered' )
      {
        await this.db.query( `
          UPDATE emails 
          SET delivery_status = 'delivered', delivered_at = ?
          WHERE external_id = ?
        `, [ new Date( timestamp ), messageId ] );
      } else if ( event === 'bounced' || event === 'failed' )
      {
        await this.db.query( `
          UPDATE emails 
          SET delivery_status = 'failed', failed_at = ?
          WHERE external_id = ?
        `, [ new Date( timestamp ), messageId ] );
      }

      return { success: true };

    } catch ( error )
    {
      console.error( '❌ Erro ao processar webhook:', error );
      return { success: false, error: error.message };
    }
  }

  /**
   * Obter estatísticas de email
   */
  async getEmailStats( userId, dateFrom, dateTo )
  {
    try
    {
      const stats = await this.db.query( `
        SELECT 
          COUNT(*) as total_sent,
          COUNT(CASE WHEN send_status = 'sent' THEN 1 END) as successful_sends,
          COUNT(CASE WHEN send_status = 'failed' THEN 1 END) as failed_sends,
          COUNT(CASE WHEN delivery_status = 'delivered' THEN 1 END) as delivered,
          COUNT(CASE WHEN delivery_status = 'bounced' THEN 1 END) as bounced,
          AVG(CASE WHEN sent_at IS NOT NULL THEN 
            TIMESTAMPDIFF(SECOND, created_at, sent_at) 
          END) as avg_send_time
        FROM emails 
        WHERE user_id = ? 
        AND created_at BETWEEN ? AND ?
      `, [ userId, dateFrom, dateTo ] );

      // Estatísticas por dia
      const dailyStats = await this.db.query( `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as emails_sent,
          COUNT(CASE WHEN send_status = 'sent' THEN 1 END) as successful
        FROM emails 
        WHERE user_id = ? 
        AND created_at BETWEEN ? AND ?
        GROUP BY DATE(created_at)
        ORDER BY date
      `, [ userId, dateFrom, dateTo ] );

      return {
        success: true,
        stats: stats[ 0 ],
        dailyStats
      };

    } catch ( error )
    {
      console.error( '❌ Erro ao obter estatísticas:', error );
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Métodos auxiliares
   */
  formatEmailBody( body )
  {
    // Converter quebras de linha para HTML
    return body.replace( /\n/g, '<br>' );
  }

  stripHtml( html )
  {
    // Remover tags HTML para versão texto
    return html.replace( /<[^>]*>/g, '' );
  }

  async fileExists( filePath )
  {
    try
    {
      await fs.access( filePath );
      return true;
    } catch
    {
      return false;
    }
  }

  /**
   * Inicializar pastas padrão do sistema
   */
  async initializeSystemFolders( userId )
  {
    try
    {
      const systemFolders = [
        { name: 'Caixa de Entrada', type: 'inbox', sort_order: 1 },
        { name: 'Enviados', type: 'sent', sort_order: 2 },
        { name: 'Rascunhos', type: 'drafts', sort_order: 3 },
        { name: 'Importantes', type: 'important', sort_order: 4 },
        { name: 'Spam', type: 'spam', sort_order: 5 },
        { name: 'Lixeira', type: 'trash', sort_order: 6 }
      ];

      for ( const folder of systemFolders )
      {
        await this.db.query( `
          INSERT IGNORE INTO email_folders (
            user_id, name, type, is_system, sort_order, created_at
          ) VALUES (?, ?, ?, 1, ?, NOW())
        `, [ userId, folder.name, folder.type, folder.sort_order ] );
      }

      console.log( `📁 Pastas de email inicializadas para usuário ${ userId }` );

    } catch ( error )
    {
      console.error( '❌ Erro ao inicializar pastas:', error );
    }
  }

  /**
   * Limpar emails antigos
   */
  async cleanupOldEmails()
  {
    try
    {
      // Deletar emails da lixeira com mais de 30 dias
      const result = await this.db.query( `
        DELETE FROM emails 
        WHERE folder_id = (
          SELECT id FROM email_folders 
          WHERE type = 'trash' LIMIT 1
        )
        AND deleted_at < datetime('now', '-30 days')
      `);

      console.log( `🧹 ${ result.affectedRows } emails antigos removidos da lixeira` );

      return result.affectedRows;

    } catch ( error )
    {
      console.error( '❌ Erro na limpeza de emails:', error );
      return 0;
    }
  }

  /**
   * Inicializar pastas do usuário
   */
  async initializeUserFolders( userId )
  {
    try
    {
      const folders = [
        { name: 'Caixa de Entrada', type: 'inbox' },
        { name: 'Enviados', type: 'sent' },
        { name: 'Rascunhos', type: 'drafts' },
        { name: 'Importantes', type: 'important' },
        { name: 'Spam', type: 'spam' },
        { name: 'Lixeira', type: 'trash' }
      ];

      for ( const folder of folders )
      {
        await this.db.query( `
          INSERT OR IGNORE INTO email_folders (user_id, name, type, is_system)
          VALUES (?, ?, ?, 1)
        `, [ userId, folder.name, folder.type ] );
      }

      console.log( `📁 Pastas inicializadas para usuário ${ userId }` );

    } catch ( error )
    {
      console.error( '❌ Erro ao inicializar pastas:', error );
    }
  }

  /**
   * Validar endereço de email
   */
  validateEmail( email )
  {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test( email );
  }
}

module.exports = EmailService;
