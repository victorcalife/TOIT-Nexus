import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY not configured. Email sending will be disabled.");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string | string[];
  from: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  templateData?: any;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid API key not configured');
    return false;
  }

  try {
    const emailData = {
      to: Array.isArray(params.to) ? params.to : [params.to],
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    };

    if (params.templateId) {
      Object.assign(emailData, {
        templateId: params.templateId,
        dynamicTemplateData: params.templateData || {},
      });
    }

    await mailService.send(emailData);
    console.log(`Email sent successfully to ${Array.isArray(params.to) ? params.to.join(', ') : params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// TOIT NEXUS Welcome Email Templates
export async function sendToitNexusWelcomeEmail(
  userEmail: string, 
  userName: string, 
  planType: string, 
  temporaryPassword?: string,
  tenantId?: string,
  isTrialUser: boolean = false
): Promise<boolean> {
  
  const planNames = {
    'gratuito': 'GRATUITO',
    'basico': 'BÁSICO', 
    'standard': 'STANDARD',
    'premium': 'PREMIUM',
    'enterprise': 'ENTERPRISE'
  };

  const planName = planNames[planType as keyof typeof planNames] || planType.toUpperCase();
  const loginUrl = isTrialUser ? 'https://nexus.toit.com.br/login' : 'https://nexus.toit.com.br/login';
  
  const emailTemplates = {
    trial: {
      subject: `🎉 Bem-vindo ao TOIT NEXUS - Trial ${planName} Ativado!`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; padding: 20px;">
          <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <!-- Header TOIT -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1e40af; font-size: 32px; margin: 0; font-weight: 700;">TOIT NEXUS</h1>
              <p style="color: #64748b; margin: 8px 0 0 0; font-size: 16px; font-weight: 500;">The One in Tech</p>
            </div>

            <!-- Welcome Message -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 16px 0;">🎉 Bem-vindo, ${userName}!</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0;">
                Sua conta trial <strong>${planName}</strong> foi ativada com sucesso!<br>
                Você tem <strong>7 dias grátis</strong> para explorar todas as funcionalidades.
              </p>
            </div>

            <!-- Access Info -->
            <div style="background: #f1f5f9; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
              <h3 style="color: #1e293b; font-size: 18px; margin: 0 0 16px 0;">🔑 Seus Dados de Acesso:</h3>
              <p style="margin: 8px 0; color: #475569;"><strong>Email:</strong> ${userEmail}</p>
              <p style="margin: 8px 0; color: #475569;"><strong>Plano:</strong> ${planName} (Trial)</p>
              <p style="margin: 8px 0; color: #475569;"><strong>Portal:</strong> <a href="${loginUrl}" style="color: #1e40af; text-decoration: none;">${loginUrl}</a></p>
            </div>

            <!-- Features Preview -->
            <div style="margin-bottom: 30px;">
              <h3 style="color: #1e293b; font-size: 18px; margin: 0 0 16px 0;">✨ O que você pode fazer:</h3>
              <ul style="color: #475569; line-height: 1.8; padding-left: 20px;">
                <li>📊 <strong>Query Builder TQL:</strong> Crie relatórios em português brasileiro</li>
                <li>🔄 <strong>Workflows Automatizados:</strong> Automatize seus processos</li>
                <li>📈 <strong>Dashboards Dinâmicos:</strong> Visualize seus dados em tempo real</li>
                <li>🗃️ <strong>Conectividade Total:</strong> Bancos, APIs, Excel, CSV</li>
                <li>⚡ <strong>Task Management:</strong> Gestão completa de tarefas</li>
              </ul>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${loginUrl}" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);">
                🚀 Acessar TOIT NEXUS
              </a>
            </div>

            <!-- Trial Warning -->
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 30px;">
              <p style="margin: 0; color: #92400e; font-size: 14px; text-align: center;">
                ⏰ <strong>Lembrete:</strong> Seu trial expira em 7 dias. Para continuar, escolha um plano antes do vencimento.
              </p>
            </div>

            <!-- Support -->
            <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">Precisa de ajuda? Nossa equipe está pronta!</p>
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                📧 <a href="mailto:suporte@toit.com.br" style="color: #1e40af; text-decoration: none;">suporte@toit.com.br</a> | 
                💬 WhatsApp: <a href="https://wa.me/5511999999999" style="color: #1e40af; text-decoration: none;">(11) 99999-9999</a>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © 2025 TOIT - The One in Tech. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      `
    },
    paid: {
      subject: `🎯 Conta TOIT NEXUS ${planName} Ativada - Bem-vindo!`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; padding: 20px;">
          <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <!-- Header TOIT -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #059669; font-size: 32px; margin: 0; font-weight: 700;">TOIT NEXUS</h1>
              <p style="color: #64748b; margin: 8px 0 0 0; font-size: 16px; font-weight: 500;">The One in Tech</p>
            </div>

            <!-- Welcome Message -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 16px 0;">🎯 Bem-vindo, ${userName}!</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0;">
                Sua conta <strong>${planName}</strong> foi ativada com sucesso!<br>
                Agora você tem acesso completo a todas as funcionalidades do seu plano.
              </p>
            </div>

            <!-- Access Info -->
            <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
              <h3 style="color: #1e293b; font-size: 18px; margin: 0 0 16px 0;">🔑 Seus Dados de Acesso:</h3>
              <p style="margin: 8px 0; color: #475569;"><strong>Email:</strong> ${userEmail}</p>
              <p style="margin: 8px 0; color: #475569;"><strong>Plano:</strong> ${planName}</p>
              ${temporaryPassword ? `<p style="margin: 8px 0; color: #dc2626;"><strong>Senha Temporária:</strong> ${temporaryPassword}</p>` : ''}
              <p style="margin: 8px 0; color: #475569;"><strong>Portal:</strong> <a href="${loginUrl}" style="color: #059669; text-decoration: none;">${loginUrl}</a></p>
              ${temporaryPassword ? `<p style="margin: 16px 0 0 0; color: #dc2626; font-size: 14px;"><strong>⚠️ IMPORTANTE:</strong> Altere sua senha no primeiro acesso!</p>` : ''}
            </div>

            <!-- Features -->
            <div style="margin-bottom: 30px;">
              <h3 style="color: #1e293b; font-size: 18px; margin: 0 0 16px 0;">🚀 Recursos Disponíveis:</h3>
              <ul style="color: #475569; line-height: 1.8; padding-left: 20px;">
                <li>📊 <strong>Query Builder TQL:</strong> Sistema BI revolucionário em português</li>
                <li>🔄 <strong>Workflows Avançados:</strong> Automação inteligente de processos</li>
                <li>📈 <strong>Dashboards Premium:</strong> Visualizações interativas e personalizáveis</li>
                <li>🗃️ <strong>Conectividade Completa:</strong> Integração com qualquer fonte de dados</li>
                <li>⚡ <strong>Task Management Pro:</strong> Gestão colaborativa de projetos</li>
                <li>🛡️ <strong>Suporte Prioritário:</strong> Atendimento especializado</li>
              </ul>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${loginUrl}" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">
                🎯 Começar Agora
              </a>
            </div>

            <!-- Support -->
            <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">Suporte especializado à sua disposição!</p>
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                📧 <a href="mailto:suporte@toit.com.br" style="color: #059669; text-decoration: none;">suporte@toit.com.br</a> | 
                💬 WhatsApp: <a href="https://wa.me/5511999999999" style="color: #059669; text-decoration: none;">(11) 99999-9999</a>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © 2025 TOIT - The One in Tech. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      `
    }
  };

  const template = isTrialUser ? emailTemplates.trial : emailTemplates.paid;

  return await sendEmail({
    to: userEmail,
    from: 'toit@suporte.toit.com.br',
    subject: template.subject,
    html: template.html
  });
}

// Email de Trial Expirado
export async function sendTrialExpiredEmail(
  userEmail: string,
  userName: string,
  planType: string
): Promise<boolean> {
  
  const planName = planType.toUpperCase();
  
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; padding: 20px;">
      <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header TOIT -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; font-size: 32px; margin: 0; font-weight: 700;">TOIT NEXUS</h1>
          <p style="color: #64748b; margin: 8px 0 0 0; font-size: 16px; font-weight: 500;">The One in Tech</p>
        </div>

        <!-- Trial Expired Message -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 16px 0;">⏰ Seu trial expirou</h2>
          <p style="color: #dc2626; font-size: 16px; line-height: 1.6; margin: 0;">
            Olá ${userName},<br>
            Seu trial ${planName} de 7 dias chegou ao fim.
          </p>
        </div>

        <!-- Continue Message -->
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
          <h3 style="color: #1e293b; font-size: 18px; margin: 0 0 16px 0;">💎 Continue aproveitando o TOIT NEXUS!</h3>
          <p style="margin: 0; color: #92400e; line-height: 1.6;">
            Escolha um plano e mantenha acesso a todas as funcionalidades que você explorou durante seu trial.
          </p>
        </div>

        <!-- Features Reminder -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1e293b; font-size: 18px; margin: 0 0 16px 0;">🚀 O que você vai continuar tendo:</h3>
          <ul style="color: #475569; line-height: 1.8; padding-left: 20px;">
            <li>📊 <strong>Query Builder TQL:</strong> Sistema BI em português brasileiro</li>
            <li>🔄 <strong>Workflows Automatizados:</strong> Automação de processos</li>
            <li>📈 <strong>Dashboards Dinâmicos:</strong> Visualizações em tempo real</li>
            <li>🗃️ <strong>Conectividade Total:</strong> Integração com qualquer fonte</li>
            <li>🛡️ <strong>Suporte Especializado:</strong> Equipe TOIT dedicada</li>
          </ul>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="https://nexus.toit.com.br/pricing" style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
            💎 Escolher Plano
          </a>
        </div>

        <!-- Support -->
        <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">Dúvidas sobre planos? Fale conosco!</p>
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            📧 <a href="mailto:toit@suporte.toit.com.br" style="color: #dc2626; text-decoration: none;">toit@suporte.toit.com.br</a> | 
            💬 WhatsApp: <a href="https://wa.me/5511999999999" style="color: #dc2626; text-decoration: none;">(11) 99999-9999</a>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            © 2025 TOIT - The One in Tech. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    from: 'toit@suporte.toit.com.br',
    subject: `⏰ Seu trial TOIT NEXUS expirou - Continue com um plano!`,
    html: html
  });
}

export async function sendReportEmail(
  recipients: string[], 
  reportName: string, 
  reportData: any,
  categoryName?: string
): Promise<boolean> {
  const reportHtml = `
    <h2>Relatório: ${reportName}</h2>
    ${categoryName ? `<p><strong>Categoria:</strong> ${categoryName}</p>` : ''}
    <p><strong>Data de Geração:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
    
    <h3>Dados do Relatório:</h3>
    <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
${JSON.stringify(reportData, null, 2)}
    </pre>
    
    <p>Este relatório foi gerado automaticamente pelo sistema InvestFlow.</p>
    <p>Atenciosamente,<br>Sistema InvestFlow</p>
  `;

  return await sendEmail({
    to: recipients,
    from: 'reports@investflow.com',
    subject: `Relatório InvestFlow: ${reportName}`,
    html: reportHtml
  });
}

// Test email function
export async function testEmailConfiguration(): Promise<{ success: boolean; message: string }> {
  if (!process.env.SENDGRID_API_KEY) {
    return {
      success: false,
      message: 'SendGrid API key not configured'
    };
  }

  try {
    const testResult = await sendEmail({
      to: 'test@example.com',
      from: 'test@investflow.com',
      subject: 'Teste de Configuração InvestFlow',
      html: '<p>Este é um email de teste para verificar a configuração do SendGrid.</p>'
    });

    return {
      success: testResult,
      message: testResult ? 'Email configuration is working' : 'Failed to send test email'
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Unknown error occurred'
    };
  }
}