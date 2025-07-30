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

export async function sendWelcomeEmail(clientEmail: string, clientName: string, categoryName: string): Promise<boolean> {
  const emailTemplates = {
    premium: {
      subject: 'Bem-vindo ao InvestFlow - Cliente Premium',
      html: `
        <h2>Bem-vindo ao InvestFlow, ${clientName}!</h2>
        <p>É um prazer tê-lo como nosso cliente premium. Você foi categorizado como <strong>${categoryName}</strong>.</p>
        <p>Nossa equipe especializada entrará em contato em breve para apresentar nossos serviços exclusivos.</p>
        <p>Atenciosamente,<br>Equipe InvestFlow</p>
      `
    },
    standard: {
      subject: 'Bem-vindo ao InvestFlow',
      html: `
        <h2>Bem-vindo ao InvestFlow, ${clientName}!</h2>
        <p>Obrigado por escolher nossos serviços. Você foi categorizado como <strong>${categoryName}</strong>.</p>
        <p>Em breve você receberá mais informações sobre como aproveitar ao máximo nossa plataforma.</p>
        <p>Atenciosamente,<br>Equipe InvestFlow</p>
      `
    }
  };

  const template = categoryName.toLowerCase().includes('premium') ? emailTemplates.premium : emailTemplates.standard;

  return await sendEmail({
    to: clientEmail,
    from: 'no-reply@investflow.com',
    subject: template.subject,
    html: template.html
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