const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const DatabaseService = require('../services/DatabaseService');
const CalendarService = require('../services/CalendarService');
const QuantumProcessor = require('../services/QuantumProcessor');
const MilaService = require('../services/MilaService');

const db = new DatabaseService();
const calendarService = new CalendarService();
const quantumProcessor = new QuantumProcessor();
const milaService = new MilaService();

/**
 * GET /api/calendar/events
 * Listar eventos do calendário
 */
router.get('/events', authenticateToken, async (req, res) => {
  try {
    const { start, end, view, type, search } = req.query;

    let whereClause = 'WHERE user_id = ?';
    let params = [req.user.id];

    if (start && end) {
      whereClause += ' AND ((start_date BETWEEN ? AND ?) OR (end_date BETWEEN ? AND ?) OR (start_date <= ? AND end_date >= ?))';
      params.push(start, end, start, end, start, end);
    }

    if (type) {
      whereClause += ' AND event_type = ?';
      params.push(type);
    }

    if (search) {
      whereClause += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const events = await db.query(`
      SELECT 
        id, title, description, start_date, end_date, event_type,
        location, attendees, is_all_day, is_private, is_recurring,
        recurrence_rule, reminders, quantum_enhanced, mila_assisted,
        quantum_data, mila_data, color, created_at, updated_at
      FROM calendar_events 
      ${whereClause}
      ORDER BY start_date ASC
    `, params);

    // Processar eventos com dados adicionais
    const processedEvents = events.map(event => ({
      ...event,
      attendees: event.attendees ? JSON.parse(event.attendees) : [],
      reminders: event.reminders ? JSON.parse(event.reminders) : [],
      quantumData: event.quantum_data ? JSON.parse(event.quantum_data) : null,
      milaData: event.mila_data ? JSON.parse(event.mila_data) : null
    }));

    res.json({
      success: true,
      data: { events: processedEvents }
    });

  } catch (error) {
    console.error('❌ Erro ao listar eventos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter eventos do calendário'
    });
  }
});

/**
 * POST /api/calendar/events
 * Criar novo evento
 */
router.post('/events', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description = '',
      startDate,
      endDate,
      eventType = 'meeting',
      location = '',
      attendees = [],
      isAllDay = false,
      isPrivate = false,
      isRecurring = false,
      recurrenceRule = '',
      reminders = [15],
      quantumEnhanced = true,
      milaAssisted = true,
      color = '#3B82F6'
    } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Título, data de início e fim são obrigatórios'
      });
    }

    console.log(`📅 Criando evento: ${title} para usuário ${req.user.id}`);

    // Processar com algoritmos quânticos se habilitado
    let quantumData = null;
    if (quantumEnhanced) {
      quantumData = await quantumProcessor.processOperation({
        type: 'event_optimization',
        data: {
          title,
          duration: new Date(endDate) - new Date(startDate),
          attendees: attendees.length,
          eventType,
          timeSlot: new Date(startDate).getHours()
        },
        complexity: 2,
        userId: req.user.id
      });
    }

    // Processar com MILA se habilitado
    let milaData = null;
    if (milaAssisted) {
      milaData = await milaService.enhanceEvent({
        title,
        description,
        eventType,
        attendees,
        userId: req.user.id
      });
    }

    // Verificar conflitos
    const conflicts = await calendarService.checkConflicts({
      userId: req.user.id,
      startDate,
      endDate,
      excludeEventId: null
    });

    if (conflicts.length > 0 && quantumEnhanced) {
      // Usar algoritmos quânticos para resolver conflitos
      const conflictResolution = await quantumProcessor.processOperation({
        type: 'conflict_resolution',
        data: {
          newEvent: { startDate, endDate, title },
          conflicts,
          userPreferences: await getUserPreferences(req.user.id)
        },
        complexity: 3,
        userId: req.user.id
      });

      if (conflictResolution.suggestedAlternatives) {
        return res.json({
          success: false,
          conflicts: true,
          alternatives: conflictResolution.suggestedAlternatives,
          message: 'Conflitos detectados. Sugestões de horários alternativos disponíveis.'
        });
      }
    }

    // Criar evento
    const eventResult = await db.query(`
      INSERT INTO calendar_events (
        user_id, title, description, start_date, end_date, event_type,
        location, attendees, is_all_day, is_private, is_recurring,
        recurrence_rule, reminders, quantum_enhanced, mila_assisted,
        quantum_data, mila_data, color, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      req.user.id,
      title,
      description,
      startDate,
      endDate,
      eventType,
      location,
      JSON.stringify(attendees),
      isAllDay,
      isPrivate,
      isRecurring,
      recurrenceRule,
      JSON.stringify(reminders),
      quantumEnhanced,
      milaAssisted,
      quantumData ? JSON.stringify(quantumData) : null,
      milaData ? JSON.stringify(milaData) : null,
      color
    ]);

    const eventId = eventResult.insertId;

    // Criar eventos recorrentes se necessário
    if (isRecurring && recurrenceRule) {
      await calendarService.createRecurringEvents({
        baseEventId: eventId,
        recurrenceRule,
        startDate,
        endDate,
        maxOccurrences: 100
      });
    }

    // Enviar convites se houver participantes
    if (attendees.length > 0) {
      await calendarService.sendInvitations({
        eventId,
        attendees,
        eventDetails: {
          title,
          startDate,
          endDate,
          location,
          description
        },
        organizer: req.user
      });
    }

    // Configurar lembretes
    if (reminders.length > 0) {
      await calendarService.scheduleReminders({
        eventId,
        reminders,
        eventDate: startDate,
        userId: req.user.id
      });
    }

    res.status(201).json({
      success: true,
      data: {
        eventId,
        quantumData,
        milaData,
        conflicts: conflicts.length,
        message: 'Evento criado com sucesso'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar evento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar evento'
    });
  }
});

/**
 * PUT /api/calendar/events/:id
 * Atualizar evento
 */
router.put('/events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se o evento pertence ao usuário
    const events = await db.query(`
      SELECT id FROM calendar_events 
      WHERE id = ? AND user_id = ?
    `, [id, req.user.id]);

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Evento não encontrado'
      });
    }

    // Verificar conflitos se as datas foram alteradas
    let conflicts = [];
    if (updateData.startDate || updateData.endDate) {
      conflicts = await calendarService.checkConflicts({
        userId: req.user.id,
        startDate: updateData.startDate,
        endDate: updateData.endDate,
        excludeEventId: id
      });
    }

    // Processar otimizações se habilitado
    let quantumData = null;
    if (updateData.quantumEnhanced) {
      quantumData = await quantumProcessor.processOperation({
        type: 'event_update_optimization',
        data: {
          eventId: id,
          changes: updateData,
          conflicts
        },
        complexity: 2,
        userId: req.user.id
      });
    }

    // Preparar campos para atualização
    const allowedFields = [
      'title', 'description', 'start_date', 'end_date', 'event_type',
      'location', 'attendees', 'is_all_day', 'is_private', 'is_recurring',
      'recurrence_rule', 'reminders', 'quantum_enhanced', 'mila_assisted', 'color'
    ];

    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbField)) {
        updateFields.push(`${dbField} = ?`);
        
        if (key === 'attendees' || key === 'reminders') {
          updateValues.push(JSON.stringify(updateData[key]));
        } else {
          updateValues.push(updateData[key]);
        }
      }
    });

    if (quantumData) {
      updateFields.push('quantum_data = ?');
      updateValues.push(JSON.stringify(quantumData));
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(id);

    // Atualizar evento
    await db.query(`
      UPDATE calendar_events 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    res.json({
      success: true,
      data: {
        eventId: id,
        quantumData,
        conflicts: conflicts.length,
        message: 'Evento atualizado com sucesso'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar evento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar evento'
    });
  }
});

/**
 * DELETE /api/calendar/events/:id
 * Deletar evento
 */
router.delete('/events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteRecurring = false } = req.query;

    // Verificar se o evento pertence ao usuário
    const events = await db.query(`
      SELECT * FROM calendar_events 
      WHERE id = ? AND user_id = ?
    `, [id, req.user.id]);

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Evento não encontrado'
      });
    }

    const event = events[0];

    // Deletar eventos recorrentes se solicitado
    if (deleteRecurring && event.is_recurring) {
      await db.query(`
        DELETE FROM calendar_events 
        WHERE (id = ? OR parent_event_id = ?) AND user_id = ?
      `, [id, id, req.user.id]);
    } else {
      // Deletar apenas este evento
      await db.query(`
        DELETE FROM calendar_events 
        WHERE id = ? AND user_id = ?
      `, [id, req.user.id]);
    }

    // Cancelar lembretes
    await calendarService.cancelReminders(id);

    // Notificar participantes sobre cancelamento
    if (event.attendees) {
      const attendees = JSON.parse(event.attendees);
      if (attendees.length > 0) {
        await calendarService.sendCancellationNotices({
          eventId: id,
          attendees,
          eventDetails: {
            title: event.title,
            startDate: event.start_date
          },
          organizer: req.user
        });
      }
    }

    res.json({
      success: true,
      message: 'Evento deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar evento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar evento'
    });
  }
});

/**
 * GET /api/calendar/conflicts
 * Verificar conflitos de agenda
 */
router.get('/conflicts', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, excludeEventId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Data de início e fim são obrigatórias'
      });
    }

    const conflicts = await calendarService.checkConflicts({
      userId: req.user.id,
      startDate,
      endDate,
      excludeEventId
    });

    // Gerar sugestões quânticas se houver conflitos
    let quantumSuggestions = null;
    if (conflicts.length > 0) {
      quantumSuggestions = await quantumProcessor.processOperation({
        type: 'schedule_optimization',
        data: {
          requestedTime: { startDate, endDate },
          conflicts,
          userPreferences: await getUserPreferences(req.user.id)
        },
        complexity: 3,
        userId: req.user.id
      });
    }

    res.json({
      success: true,
      data: {
        hasConflicts: conflicts.length > 0,
        conflicts,
        quantumSuggestions
      }
    });

  } catch (error) {
    console.error('❌ Erro ao verificar conflitos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar conflitos'
    });
  }
});

/**
 * POST /api/calendar/optimize
 * Otimizar agenda com algoritmos quânticos
 */
router.post('/optimize', authenticateToken, async (req, res) => {
  try {
    const { dateRange, preferences, constraints } = req.body;

    console.log(`⚛️ Otimizando agenda para usuário ${req.user.id}`);

    // Buscar eventos no período
    const events = await db.query(`
      SELECT * FROM calendar_events 
      WHERE user_id = ? 
      AND start_date >= ? 
      AND end_date <= ?
      ORDER BY start_date
    `, [req.user.id, dateRange.start, dateRange.end]);

    // Processar otimização quântica
    const optimizationResult = await quantumProcessor.processOperation({
      type: 'comprehensive_schedule_optimization',
      data: {
        events,
        preferences: preferences || await getUserPreferences(req.user.id),
        constraints: constraints || {},
        timeRange: dateRange
      },
      complexity: 4,
      userId: req.user.id
    });

    // Gerar insights MILA
    const milaInsights = await milaService.generateScheduleInsights({
      events,
      optimization: optimizationResult,
      userId: req.user.id
    });

    res.json({
      success: true,
      data: {
        optimization: optimizationResult,
        milaInsights,
        eventsAnalyzed: events.length,
        potentialImprovements: optimizationResult.improvements || []
      }
    });

  } catch (error) {
    console.error('❌ Erro na otimização:', error);
    res.status(500).json({
      success: false,
      error: 'Erro na otimização da agenda'
    });
  }
});

/**
 * GET /api/calendar/analytics
 * Obter analytics do calendário
 */
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter = '';
    switch (period) {
      case '7d':
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 7 DAY)';
        break;
      case '30d':
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 30 DAY)';
        break;
      case '90d':
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 90 DAY)';
        break;
      default:
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }

    // Estatísticas gerais
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN event_type = 'meeting' THEN 1 END) as meetings,
        COUNT(CASE WHEN event_type = 'task' THEN 1 END) as tasks,
        COUNT(CASE WHEN quantum_enhanced = 1 THEN 1 END) as quantum_enhanced,
        COUNT(CASE WHEN mila_assisted = 1 THEN 1 END) as mila_assisted,
        AVG(TIMESTAMPDIFF(MINUTE, start_date, end_date)) as avg_duration
      FROM calendar_events 
      WHERE user_id = ? AND created_at >= ${dateFilter}
    `, [req.user.id]);

    // Distribuição por tipo
    const typeDistribution = await db.query(`
      SELECT 
        event_type,
        COUNT(*) as count,
        AVG(TIMESTAMPDIFF(MINUTE, start_date, end_date)) as avg_duration
      FROM calendar_events 
      WHERE user_id = ? AND created_at >= ${dateFilter}
      GROUP BY event_type
    `, [req.user.id]);

    // Padrões de horário
    const timePatterns = await db.query(`
      SELECT 
        HOUR(start_date) as hour,
        COUNT(*) as event_count
      FROM calendar_events 
      WHERE user_id = ? AND created_at >= ${dateFilter}
      GROUP BY HOUR(start_date)
      ORDER BY hour
    `, [req.user.id]);

    res.json({
      success: true,
      data: {
        period,
        stats: stats[0],
        typeDistribution,
        timePatterns,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter analytics do calendário'
    });
  }
});

/**
 * POST /api/calendar/export
 * Exportar calendário
 */
router.post('/export', authenticateToken, async (req, res) => {
  try {
    const { format = 'ics', dateRange, eventTypes } = req.body;

    const exportResult = await calendarService.exportCalendar({
      userId: req.user.id,
      format,
      dateRange,
      eventTypes
    });

    res.json({
      success: true,
      data: {
        downloadUrl: exportResult.downloadUrl,
        filename: exportResult.filename,
        eventCount: exportResult.eventCount
      }
    });

  } catch (error) {
    console.error('❌ Erro na exportação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao exportar calendário'
    });
  }
});

// Função auxiliar para obter preferências do usuário
async function getUserPreferences(userId) {
  try {
    const prefs = await db.query(`
      SELECT preferences FROM user_preferences 
      WHERE user_id = ?
    `, [userId]);
    
    return prefs.length > 0 ? JSON.parse(prefs[0].preferences) : {
      workingHours: { start: '09:00', end: '18:00' },
      preferredMeetingDuration: 60,
      bufferTime: 15,
      maxMeetingsPerDay: 8
    };
  } catch (error) {
    return {
      workingHours: { start: '09:00', end: '18:00' },
      preferredMeetingDuration: 60,
      bufferTime: 15,
      maxMeetingsPerDay: 8
    };
  }
}

module.exports = router;
