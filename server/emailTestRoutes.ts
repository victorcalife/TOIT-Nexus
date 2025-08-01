import { Router } from 'express';
import { sendToitNexusWelcomeEmail, sendTrialExpiredEmail, testEmailConfiguration } from './emailService';

const router = Router();

/**
 * GET /api/email-test/config
 * Testar configuração do SendGrid
 */
router.get('/config', async (req, res) => {
  try {
    const result = await testEmailConfiguration();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao testar configuração de email'
    });
  }
});

/**
 * POST /api/email-test/welcome-trial
 * Testar email de boas-vindas trial
 */
router.post('/welcome-trial', async (req, res) => {
  try {
    const { email, name, plan = 'premium' } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email e nome são obrigatórios'
      });
    }

    console.log(`📧 Enviando email de teste de boas-vindas trial para: ${email}`);
    
    const emailSent = await sendToitNexusWelcomeEmail(
      email,
      name,
      plan,
      undefined, // sem senha temporária
      undefined, // sem tenant
      true // é trial
    );

    res.json({
      success: emailSent,
      message: emailSent ? 
        'Email de boas-vindas trial enviado com sucesso!' : 
        'Falha ao enviar email de boas-vindas trial'
    });

  } catch (error: any) {
    console.error('❌ Erro ao enviar email de teste:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao enviar email de teste'
    });
  }
});

/**
 * POST /api/email-test/welcome-paid
 * Testar email de boas-vindas pago
 */
router.post('/welcome-paid', async (req, res) => {
  try {
    const { email, name, plan = 'standard', temporaryPassword } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email e nome são obrigatórios'
      });
    }

    console.log(`📧 Enviando email de teste de boas-vindas pago para: ${email}`);
    
    const emailSent = await sendToitNexusWelcomeEmail(
      email,
      name,
      plan,
      temporaryPassword,
      undefined, // sem tenant
      false // não é trial
    );

    res.json({
      success: emailSent,
      message: emailSent ? 
        'Email de boas-vindas pago enviado com sucesso!' : 
        'Falha ao enviar email de boas-vindas pago'
    });

  } catch (error: any) {
    console.error('❌ Erro ao enviar email de teste:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao enviar email de teste'
    });
  }
});

/**
 * POST /api/email-test/trial-expired
 * Testar email de trial expirado
 */
router.post('/trial-expired', async (req, res) => {
  try {
    const { email, name, plan = 'premium' } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email e nome são obrigatórios'
      });
    }

    console.log(`📧 Enviando email de teste de trial expirado para: ${email}`);
    
    const emailSent = await sendTrialExpiredEmail(email, name, plan);

    res.json({
      success: emailSent,
      message: emailSent ? 
        'Email de trial expirado enviado com sucesso!' : 
        'Falha ao enviar email de trial expirado'
    });

  } catch (error: any) {
    console.error('❌ Erro ao enviar email de teste:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao enviar email de teste'
    });
  }
});

/**
 * GET /api/email-test/preview/welcome-trial
 * Preview HTML do email de boas-vindas trial
 */
router.get('/preview/welcome-trial', async (req, res) => {
  try {
    // Para preview, vamos extrair o HTML do template
    const testName = 'João Silva';
    const testPlan = 'PREMIUM';
    const testEmail = 'teste@exemplo.com';
    
    // Simulamos o conteúdo do template trial
    const previewHtml = `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; padding: 20px;">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 32px; margin: 0; font-weight: 700;">TOIT NEXUS</h1>
            <p style="color: #64748b; margin: 8px 0 0 0; font-size: 16px; font-weight: 500;">The One in Tech</p>
          </div>
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 16px 0;">🎉 Bem-vindo, ${testName}!</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0;">
              Sua conta trial <strong>${testPlan}</strong> foi ativada com sucesso!<br>
              Você tem <strong>7 dias grátis</strong> para explorar todas as funcionalidades.
            </p>
          </div>
          <div style="text-align: center;">
            <p style="color: #64748b; font-size: 14px;">
              📧 Email de Preview: ${testEmail}<br>
              🎯 Este é um preview do template de boas-vindas trial
            </p>
          </div>
        </div>
      </div>
    `;
    
    res.send(previewHtml);
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao gerar preview'
    });
  }
});

export default router;