const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const DatabaseService = require('../services/DatabaseService');
const VideoCallService = require('../services/VideoCallService');
const QuantumProcessor = require('../services/QuantumProcessor');
const MilaService = require('../services/MilaService');

const db = new DatabaseService();
const videoCallService = new VideoCallService();
const quantumProcessor = new QuantumProcessor();
const milaService = new MilaService();

/**
 * POST /api/video-calls/initiate
 * Iniciar nova chamada de vídeo
 */
router.post('/initiate', authenticateToken, async (req, res) => {
  try {
    const {
      conversationId,
      participants,
      type = 'video', // 'audio', 'video', 'screen_share'
      title,
      scheduledFor = null,
      quantumEnhanced = true
    } = req.body;

    if (!participants || participants.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Participantes são obrigatórios'
      });
    }

    console.log(`📹 Iniciando chamada ${type} com ${participants.length} participantes`);

    // Processar com algoritmos quânticos se habilitado
    let quantumOptimizations = {};
    if (quantumEnhanced) {
      quantumOptimizations = await quantumProcessor.processOperation({
        type: 'video_call_optimization',
        data: {
          participantCount: participants.length,
          callType: type,
          expectedDuration: 30 * 60 // 30 minutos padrão
        },
        complexity: 3,
        userId: req.user.id
      });
    }

    // Criar registro da chamada
    const callResult = await db.query(`
      INSERT INTO video_calls (
        conversation_id, initiated_by, type, status, 
        participants_count, quantum_enhanced, created_at
      ) VALUES (?, ?, ?, 'initiated', ?, ?, NOW())
    `, [
      conversationId,
      req.user.id,
      type,
      participants.length,
      quantumEnhanced
    ]);

    const callId = callResult.insertId;

    // Adicionar participantes
    for (const participantId of participants) {
      await db.query(`
        INSERT INTO call_participants (
          call_id, user_id, connection_quality
        ) VALUES (?, ?, 'excellent')
      `, [callId, participantId]);
    }

    // Gerar room token e configurações WebRTC
    const roomConfig = await videoCallService.createRoom({
      callId,
      participants,
      type,
      quantumOptimizations
    });

    // Gerar insights MILA
    const milaInsights = await milaService.generateCallInsights({
      callId,
      participants,
      type,
      userId: req.user.id
    });

    // Notificar participantes via WebSocket
    await videoCallService.notifyParticipants(callId, participants, {
      type: 'call_invitation',
      callId,
      initiator: req.user,
      roomConfig,
      quantumEnhanced
    });

    res.status(201).json({
      success: true,
      data: {
        callId,
        roomConfig,
        quantumOptimizations,
        milaInsights,
        participants: participants.length,
        type
      }
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar chamada:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao iniciar chamada de vídeo',
      details: error.message
    });
  }
});

/**
 * POST /api/video-calls/:callId/join
 * Entrar em chamada existente
 */
router.post('/:callId/join', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const { audioEnabled = true, videoEnabled = true } = req.body;

    // Verificar se a chamada existe e está ativa
    const calls = await db.query(`
      SELECT * FROM video_calls 
      WHERE id = ? AND status IN ('initiated', 'ringing', 'connected')
    `, [callId]);

    if (calls.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Chamada não encontrada ou já encerrada'
      });
    }

    const call = calls[0];

    // Verificar se o usuário é participante
    const participants = await db.query(`
      SELECT * FROM call_participants 
      WHERE call_id = ? AND user_id = ?
    `, [callId, req.user.id]);

    if (participants.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Usuário não é participante desta chamada'
      });
    }

    // Atualizar participante como conectado
    await db.query(`
      UPDATE call_participants 
      SET joined_at = NOW(), audio_enabled = ?, video_enabled = ?
      WHERE call_id = ? AND user_id = ?
    `, [audioEnabled, videoEnabled, callId, req.user.id]);

    // Atualizar status da chamada se necessário
    if (call.status === 'initiated') {
      await db.query(`
        UPDATE video_calls 
        SET status = 'connected', started_at = NOW()
        WHERE id = ?
      `, [callId]);
    }

    // Obter configurações da sala
    const roomConfig = await videoCallService.getRoomConfig(callId);

    // Notificar outros participantes
    await videoCallService.notifyParticipants(callId, [], {
      type: 'participant_joined',
      callId,
      participant: req.user,
      audioEnabled,
      videoEnabled
    });

    res.json({
      success: true,
      data: {
        callId,
        roomConfig,
        callStatus: 'connected',
        participantCount: await getActiveParticipantCount(callId)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao entrar na chamada:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao entrar na chamada'
    });
  }
});

/**
 * PUT /api/video-calls/:callId/media
 * Atualizar configurações de mídia (áudio/vídeo)
 */
router.put('/:callId/media', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const { audioEnabled, videoEnabled, screenSharing } = req.body;

    // Atualizar configurações do participante
    const result = await db.query(`
      UPDATE call_participants 
      SET audio_enabled = COALESCE(?, audio_enabled),
          video_enabled = COALESCE(?, video_enabled),
          screen_sharing = COALESCE(?, screen_sharing)
      WHERE call_id = ? AND user_id = ?
    `, [audioEnabled, videoEnabled, screenSharing, callId, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Participante não encontrado na chamada'
      });
    }

    // Notificar outros participantes sobre mudança
    await videoCallService.notifyParticipants(callId, [], {
      type: 'media_changed',
      callId,
      participant: req.user.id,
      audioEnabled,
      videoEnabled,
      screenSharing
    });

    res.json({
      success: true,
      message: 'Configurações de mídia atualizadas'
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar mídia:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar configurações de mídia'
    });
  }
});

/**
 * POST /api/video-calls/:callId/recording/start
 * Iniciar gravação da chamada
 */
router.post('/:callId/recording/start', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;

    // Verificar permissões (apenas iniciador ou admin)
    const calls = await db.query(`
      SELECT * FROM video_calls 
      WHERE id = ? AND (initiated_by = ? OR ? IN (
        SELECT user_id FROM users WHERE role IN ('admin', 'super_admin')
      ))
    `, [callId, req.user.id, req.user.id]);

    if (calls.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão para gravar esta chamada'
      });
    }

    // Iniciar gravação
    const recordingResult = await videoCallService.startRecording(callId);

    // Atualizar banco de dados
    await db.query(`
      UPDATE video_calls 
      SET recording_path = ?
      WHERE id = ?
    `, [recordingResult.recordingPath, callId]);

    // Notificar participantes
    await videoCallService.notifyParticipants(callId, [], {
      type: 'recording_started',
      callId,
      startedBy: req.user.id
    });

    res.json({
      success: true,
      data: {
        recordingId: recordingResult.recordingId,
        message: 'Gravação iniciada'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar gravação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao iniciar gravação'
    });
  }
});

/**
 * POST /api/video-calls/:callId/recording/stop
 * Parar gravação da chamada
 */
router.post('/:callId/recording/stop', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;

    // Parar gravação
    const recordingResult = await videoCallService.stopRecording(callId);

    // Notificar participantes
    await videoCallService.notifyParticipants(callId, [], {
      type: 'recording_stopped',
      callId,
      stoppedBy: req.user.id,
      recordingPath: recordingResult.recordingPath
    });

    res.json({
      success: true,
      data: {
        recordingPath: recordingResult.recordingPath,
        duration: recordingResult.duration,
        message: 'Gravação finalizada'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao parar gravação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao parar gravação'
    });
  }
});

/**
 * POST /api/video-calls/:callId/end
 * Encerrar chamada
 */
router.post('/:callId/end', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;

    // Verificar se a chamada existe
    const calls = await db.query(`
      SELECT * FROM video_calls WHERE id = ?
    `, [callId]);

    if (calls.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Chamada não encontrada'
      });
    }

    const call = calls[0];
    const endTime = new Date();
    const duration = call.started_at ? 
      Math.floor((endTime - new Date(call.started_at)) / 1000) : 0;

    // Atualizar chamada como encerrada
    await db.query(`
      UPDATE video_calls 
      SET status = 'ended', ended_at = NOW(), duration = ?
      WHERE id = ?
    `, [duration, callId]);

    // Atualizar participantes
    await db.query(`
      UPDATE call_participants 
      SET left_at = NOW(), 
          duration = CASE 
            WHEN joined_at IS NOT NULL 
            THEN TIMESTAMPDIFF(SECOND, joined_at, NOW())
            ELSE 0 
          END
      WHERE call_id = ? AND left_at IS NULL
    `, [callId]);

    // Parar gravação se estiver ativa
    if (call.recording_path) {
      await videoCallService.stopRecording(callId);
    }

    // Limpar recursos da sala
    await videoCallService.cleanupRoom(callId);

    // Gerar relatório da chamada
    const callReport = await generateCallReport(callId);

    // Notificar participantes
    await videoCallService.notifyParticipants(callId, [], {
      type: 'call_ended',
      callId,
      endedBy: req.user.id,
      duration,
      report: callReport
    });

    res.json({
      success: true,
      data: {
        callId,
        duration,
        report: callReport,
        message: 'Chamada encerrada'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao encerrar chamada:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao encerrar chamada'
    });
  }
});

/**
 * GET /api/video-calls/:callId
 * Obter detalhes da chamada
 */
router.get('/:callId', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;

    // Buscar chamada
    const calls = await db.query(`
      SELECT 
        vc.*,
        u.name as initiator_name,
        u.avatar as initiator_avatar
      FROM video_calls vc
      JOIN users u ON vc.initiated_by = u.id
      WHERE vc.id = ?
    `, [callId]);

    if (calls.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Chamada não encontrada'
      });
    }

    const call = calls[0];

    // Buscar participantes
    const participants = await db.query(`
      SELECT 
        cp.*,
        u.name,
        u.avatar,
        u.email
      FROM call_participants cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.call_id = ?
      ORDER BY cp.joined_at
    `, [callId]);

    res.json({
      success: true,
      data: {
        call: {
          ...call,
          quantumData: call.quantum_data ? JSON.parse(call.quantum_data) : null
        },
        participants
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter chamada:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter detalhes da chamada'
    });
  }
});

/**
 * GET /api/video-calls/user/history
 * Histórico de chamadas do usuário
 */
router.get('/user/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = `WHERE (vc.initiated_by = ? OR cp.user_id = ?)`;
    let params = [req.user.id, req.user.id];

    if (type) {
      whereClause += ` AND vc.type = ?`;
      params.push(type);
    }

    if (status) {
      whereClause += ` AND vc.status = ?`;
      params.push(status);
    }

    const calls = await db.query(`
      SELECT DISTINCT
        vc.id,
        vc.type,
        vc.status,
        vc.duration,
        vc.created_at,
        vc.started_at,
        vc.ended_at,
        vc.participants_count,
        vc.quantum_enhanced,
        u.name as initiator_name,
        u.avatar as initiator_avatar,
        CASE WHEN vc.initiated_by = ? THEN 'outgoing' ELSE 'incoming' END as direction
      FROM video_calls vc
      JOIN users u ON vc.initiated_by = u.id
      LEFT JOIN call_participants cp ON vc.id = cp.call_id
      ${whereClause}
      ORDER BY vc.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, req.user.id, parseInt(limit), offset]);

    // Contar total
    const totalResult = await db.query(`
      SELECT COUNT(DISTINCT vc.id) as total
      FROM video_calls vc
      LEFT JOIN call_participants cp ON vc.id = cp.call_id
      ${whereClause}
    `, params);

    const total = totalResult[0].total;

    res.json({
      success: true,
      data: {
        calls,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter histórico:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter histórico de chamadas'
    });
  }
});

/**
 * GET /api/video-calls/active
 * Listar chamadas ativas
 */
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const activeCalls = await db.query(`
      SELECT 
        vc.id,
        vc.type,
        vc.status,
        vc.participants_count,
        vc.started_at,
        u.name as initiator_name,
        COUNT(cp.user_id) as active_participants
      FROM video_calls vc
      JOIN users u ON vc.initiated_by = u.id
      LEFT JOIN call_participants cp ON vc.id = cp.call_id AND cp.joined_at IS NOT NULL AND cp.left_at IS NULL
      WHERE vc.status IN ('initiated', 'ringing', 'connected')
      AND (vc.initiated_by = ? OR vc.id IN (
        SELECT call_id FROM call_participants WHERE user_id = ?
      ))
      GROUP BY vc.id
      ORDER BY vc.created_at DESC
    `, [req.user.id, req.user.id]);

    res.json({
      success: true,
      data: { activeCalls }
    });

  } catch (error) {
    console.error('❌ Erro ao listar chamadas ativas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter chamadas ativas'
    });
  }
});

// Funções auxiliares
async function getActiveParticipantCount(callId) {
  const result = await db.query(`
    SELECT COUNT(*) as count 
    FROM call_participants 
    WHERE call_id = ? AND joined_at IS NOT NULL AND left_at IS NULL
  `, [callId]);
  
  return result[0].count;
}

async function generateCallReport(callId) {
  try {
    const participants = await db.query(`
      SELECT 
        u.name,
        cp.joined_at,
        cp.left_at,
        cp.duration,
        cp.connection_quality
      FROM call_participants cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.call_id = ?
    `, [callId]);

    const totalDuration = participants.reduce((sum, p) => sum + (p.duration || 0), 0);
    const avgQuality = participants.length > 0 ? 
      participants.filter(p => p.connection_quality).length / participants.length : 0;

    return {
      participantCount: participants.length,
      totalDuration,
      averageQuality: avgQuality,
      participants: participants.map(p => ({
        name: p.name,
        duration: p.duration,
        quality: p.connection_quality
      }))
    };

  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    return null;
  }
}

module.exports = router;
