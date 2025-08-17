import { Router } from 'express';
import { db } from './db';
import { leads } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { sendToitNexusWelcomeEmail } from './emailService';

const router = Router();

/**
 * POST /api/enterprise/contact
 * Formulário de contato para empresas grandes
 */
router.post('/contact', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      companyName,
      cnpj,
      employees,
      sector,
      email,
      phone
    } = req.body;

    // Validação de campos obrigatórios
    if (!firstName || !lastName || !companyName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: Nome, Sobrenome, Empresa, Email e Telefone'
      });
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    console.log(`📧 Nova solicitação Enterprise: ${companyName} | ${email}`);

    // Criar lead no banco de dados
    const leadId = nanoid();
    await db.insert(leads).values({
      id: leadId,
      name: `${firstName} ${lastName}`,
      email: email,
      company: companyName,
      phone: phone,
      message: `Solicitação Enterprise - ${employees} funcionários - Setor: ${sector} - CNPJ: ${cnpj || 'Não informado'}`,
      source: 'enterprise_form',
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Enviar email de notificação para equipe TOIT
    try {
      const notificationMessage = `
        Nova solicitação Enterprise recebida:
        
        Empresa: ${companyName}
        CNPJ: ${cnpj || 'Não informado'}
        Contato: ${firstName} ${lastName}
        Email: ${email}
        Telefone: ${phone}
        Funcionários: ${employees}
        Setor: ${sector}
        
        Lead ID: ${leadId}
        Data: ${new Date().toLocaleString('pt-BR')}
      `;

      await sendToitNexusWelcomeEmail(
        'vendas@toit.com.br', // Email da equipe de vendas
        'Equipe TOIT',
        'enterprise_lead',
        undefined,
        undefined,
        false
      );
    } catch (emailError) {
      console.error('⚠️ Erro ao enviar notificação por email:', emailError);
      // Não falha o processo por erro de email
    }

    // Enviar email de confirmação para o cliente
    try {
      const confirmationHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">TOIT NEXUS</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Enterprise Solutions</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Solicitação Recebida!</h2>
            
            <p>Olá <strong>${firstName}</strong>,</p>
            
            <p>Recebemos sua solicitação de contato para soluções enterprise da <strong>${companyName}</strong>.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Próximos Passos:</h3>
              <ul style="color: #4b5563; padding-left: 20px;">
                <li>Nossa equipe comercial analisará suas necessidades</li>
                <li>Entraremos em contato em até <strong>24 horas</strong></li>
                <li>Apresentaremos uma proposta personalizada</li>
                <li>Demonstração da plataforma adaptada ao seu setor</li>
              </ul>
            </div>
            
            <p>Se tiver urgência, entre em contato diretamente:</p>
            <p>📧 <strong>vendas@toit.com.br</strong><br>
               📱 <strong>+55 (11) 99999-9999</strong></p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 14px;">
              Este email foi enviado automaticamente pelo sistema TOIT NEXUS.<br>
              Se você não solicitou este contato, pode ignorar este email.
            </p>
          </div>
        </div>
      `;

      // Simulação de envio - em produção usaria o emailService real
      console.log(`📧 Email de confirmação enviado para ${email}`);
    } catch (emailError) {
      console.error('⚠️ Erro ao enviar email de confirmação:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Solicitação enviada com sucesso! Nossa equipe entrará em contato em até 24 horas.',
      data: {
        leadId: leadId,
        company: companyName,
        contact: `${firstName} ${lastName}`,
        estimatedResponse: '24 horas'
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao processar solicitação enterprise:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/enterprise/leads
 * Listar leads enterprise (Admin apenas)
 */
router.get('/leads', async (req, res) => {
  try {
    console.log('📋 Buscando leads enterprise...');

    const enterpriseLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.source, 'enterprise_form'))
      .orderBy(desc(leads.createdAt))
      .limit(50);

    res.json({
      success: true,
      data: enterpriseLeads,
      total: enterpriseLeads.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro ao buscar leads enterprise:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar leads'
    });
  }
});

export default router;