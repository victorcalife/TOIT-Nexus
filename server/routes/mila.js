const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const MilaService = require('../services/MilaService');
const DatabaseService = require('../services/DatabaseService');

// Inicializar serviços
const milaService = new MilaService();
const db = new DatabaseService();

/**
 * POST /api/mila/chat
 * Chat com MILA AI Assistant
 */
router.post('/chat', authenticateToken, [
  body('message').trim().isLength({ min: 1, max: 5000 }).withMessage('Mensagem deve ter entre 1 e 5000 caracteres'),
  body('sessionId').optional().isString().withMessage('Session ID deve ser uma string'),
  body('context').optional().isObject().withMessage('Contexto deve ser um objeto')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { message, sessionId, context } = req.body;
    const userId = req.user.id;

    // Processar mensagem com MILA
    const milaResponse = await milaService.processMessage({
      message,
      userId,
      sessionId: sessionId || `session_${userId}_${Date.now()}`,
      context: context || {}
    });

    // Salvar conversa no banco
    await db.query(`
      INSERT INTO mila_conversations (
        user_id, session_id, user_message, mila_response, 
        context_data, processing_time, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [
      userId,
      milaResponse.sessionId,
      message,
      milaResponse.response,
      JSON.stringify(context || {}),
      milaResponse.processingTime || 0
    ]);

    res.json({
      success: true,
      data: {
        response: milaResponse.response,
        sessionId: milaResponse.sessionId,
        confidence: milaResponse.confidence || 0.9,
        intent: milaResponse.intent || 'general',
        entities: milaResponse.entities || [],
        suggestions: milaResponse.suggestions || [],
        processingTime: milaResponse.processingTime || 0
      }
    });

  } catch (error) {
    console.error('❌ Erro no chat com MILA:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no processamento da mensagem',
      details: error.message
    });
  }
});

/**
 * POST /api/mila/analyze
 * Análise avançada com MILA
 */
router.post('/analyze', authenticateToken, [
  body('data').notEmpty().withMessage('Dados para análise são obrigatórios'),
  body('analysisType').isIn(['sentiment', 'entities', 'intent', 'business', 'quantum']).withMessage('Tipo de análise inválido'),
  body('options').optional().isObject().withMessage('Opções devem ser um objeto')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { data, analysisType, options } = req.body;
    const userId = req.user.id;

    // Executar análise com MILA
    const analysisResult = await milaService.performAnalysis({
      data,
      type: analysisType,
      options: options || {},
      userId
    });

    // Salvar análise no banco
    await db.query(`
      INSERT INTO mila_analyses (
        user_id, analysis_type, input_data, result_data, 
        confidence_score, processing_time, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [
      userId,
      analysisType,
      JSON.stringify(data),
      JSON.stringify(analysisResult),
      analysisResult.confidence || 0.9,
      analysisResult.processingTime || 0
    ]);

    res.json({
      success: true,
      data: analysisResult,
      analysisType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro na análise MILA:', error);
    res.status(500).json({
      success: false,
      error: 'Erro na análise dos dados',
      details: error.message
    });
  }
});

/**
 * GET /api/mila/models
 * Modelos disponíveis da MILA
 */
router.get('/models', authenticateToken, async (req, res) => {
  try {
    const models = [
      {
        id: 'gpt-4',
        name: 'GPT-4 Turbo',
        type: 'language_model',
        capabilities: ['text_generation', 'conversation', 'analysis'],
        status: 'active',
        description: 'Modelo de linguagem avançado para conversação e análise'
      },
      {
        id: 'claude-3',
        name: 'Claude 3 Sonnet',
        type: 'language_model',
        capabilities: ['text_generation', 'conversation', 'reasoning'],
        status: 'active',
        description: 'Modelo de IA conversacional com raciocínio avançado'
      },
      {
        id: 'quantum-ml',
        name: 'Quantum ML Engine',
        type: 'quantum_model',
        capabilities: ['quantum_analysis', 'optimization', 'prediction'],
        status: 'active',
        description: 'Motor de machine learning quântico para análises avançadas'
      },
      {
        id: 'sentiment-analyzer',
        name: 'Sentiment Analysis',
        type: 'nlp_model',
        capabilities: ['sentiment_analysis', 'emotion_detection'],
        status: 'active',
        description: 'Análise de sentimentos e emoções em texto'
      },
      {
        id: 'entity-extractor',
        name: 'Entity Extraction',
        type: 'nlp_model',
        capabilities: ['entity_extraction', 'named_entity_recognition'],
        status: 'active',
        description: 'Extração de entidades e reconhecimento de nomes'
      }
    ];

    // Verificar status real dos modelos
    try {
      const modelStatus = await milaService.getModelStatus();
      models.forEach(model => {
        if (modelStatus[model.id]) {
          model.status = modelStatus[model.id].status;
          model.lastUsed = modelStatus[model.id].lastUsed;
          model.usage = modelStatus[model.id].usage;
        }
      });
    } catch (error) {
      console.warn('⚠️ Não foi possível obter status dos modelos:', error.message);
    }

    res.json({
      success: true,
      data: {
        models,
        total: models.length,
        active: models.filter(m => m.status === 'active').length
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter modelos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter modelos disponíveis'
    });
  }
});

/**
 * GET /api/mila/sessions
 * Listar sessões de chat do usuário
 */
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    // Buscar sessões do usuário
    const sessions = await db.query(`
      SELECT 
        session_id,
        COUNT(*) as message_count,
        MIN(created_at) as started_at,
        MAX(created_at) as last_activity,
        AVG(processing_time) as avg_processing_time
      FROM mila_conversations 
      WHERE user_id = ?
      GROUP BY session_id
      ORDER BY last_activity DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), offset]);

    // Contar total de sessões
    const totalResult = await db.query(`
      SELECT COUNT(DISTINCT session_id) as total 
      FROM mila_conversations 
      WHERE user_id = ?
    `, [userId]);

    const total = totalResult[0].total;

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter sessões:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter sessões de chat'
    });
  }
});

/**
 * GET /api/mila/sessions/:sessionId/messages
 * Obter mensagens de uma sessão específica
 */
router.get('/sessions/:sessionId/messages', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    // Verificar se a sessão pertence ao usuário
    const sessionCheck = await db.query(`
      SELECT COUNT(*) as count 
      FROM mila_conversations 
      WHERE session_id = ? AND user_id = ?
    `, [sessionId, userId]);

    if (sessionCheck[0].count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sessão não encontrada'
      });
    }

    // Buscar mensagens da sessão
    const messages = await db.query(`
      SELECT 
        id, user_message, mila_response, context_data,
        processing_time, created_at
      FROM mila_conversations 
      WHERE session_id = ? AND user_id = ?
      ORDER BY created_at ASC
      LIMIT ? OFFSET ?
    `, [sessionId, userId, parseInt(limit), offset]);

    // Contar total de mensagens
    const totalResult = await db.query(`
      SELECT COUNT(*) as total 
      FROM mila_conversations 
      WHERE session_id = ? AND user_id = ?
    `, [sessionId, userId]);

    const total = totalResult[0].total;

    res.json({
      success: true,
      data: {
        sessionId,
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter mensagens:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter mensagens da sessão'
    });
  }
});

module.exports = router;
