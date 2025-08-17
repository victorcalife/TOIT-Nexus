const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const DatabaseService = require('../services/DatabaseService');
const QuantumProcessor = require('../services/QuantumProcessor');
const MilaService = require('../services/MilaService');

const db = new DatabaseService();
const quantumProcessor = new QuantumProcessor();
const milaService = new MilaService();

/**
 * GET /api/dashboards
 * Listar dashboards do usuário
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, tags } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE user_id = ?';
    let params = [req.user.id];

    if (search) {
      whereClause += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (tags) {
      whereClause += ' AND JSON_CONTAINS(tags, ?)';
      params.push(JSON.stringify(tags.split(',')));
    }

    const dashboards = await db.query(`
      SELECT 
        id, name, description, layout, theme, color_palette,
        widget_count, is_public, tags, quantum_enhanced,
        created_at, updated_at
      FROM dashboards 
      ${whereClause}
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // Contar total
    const totalResult = await db.query(`
      SELECT COUNT(*) as total FROM dashboards ${whereClause}
    `, params);

    const total = totalResult[0].total;

    res.json({
      success: true,
      data: {
        dashboards: dashboards.map(dashboard => ({
          ...dashboard,
          tags: JSON.parse(dashboard.tags || '[]'),
          colorPalette: JSON.parse(dashboard.color_palette || '{}')
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar dashboards:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter dashboards'
    });
  }
});

/**
 * GET /api/dashboards/:id
 * Obter dashboard específico
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar dashboard
    const dashboards = await db.query(`
      SELECT * FROM dashboards 
      WHERE id = ? AND (user_id = ? OR is_public = 1)
    `, [id, req.user.id]);

    if (dashboards.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard não encontrado'
      });
    }

    const dashboard = dashboards[0];

    // Buscar widgets do dashboard
    const widgets = await db.query(`
      SELECT * FROM dashboard_widgets 
      WHERE dashboard_id = ?
      ORDER BY position_y, position_x
    `, [id]);

    // Buscar filtros
    const filters = await db.query(`
      SELECT * FROM dashboard_filters 
      WHERE dashboard_id = ?
    `, [id]);

    // Processar dados com MILA se habilitado
    let milaInsights = [];
    if (dashboard.quantum_enhanced) {
      milaInsights = await milaService.generateDashboardInsights({
        dashboardId: id,
        widgets: widgets.length,
        userId: req.user.id
      });
    }

    // Registrar visualização
    await db.query(`
      INSERT INTO dashboard_views (dashboard_id, user_id, viewed_at)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE viewed_at = NOW(), view_count = view_count + 1
    `, [id, req.user.id]);

    res.json({
      success: true,
      data: {
        dashboard: {
          ...dashboard,
          tags: JSON.parse(dashboard.tags || '[]'),
          colorPalette: JSON.parse(dashboard.color_palette || '{}'),
          config: JSON.parse(dashboard.config || '{}')
        },
        widgets: widgets.map(widget => ({
          ...widget,
          config: JSON.parse(widget.config || '{}'),
          dataSource: JSON.parse(widget.data_source || '{}')
        })),
        filters: filters.map(filter => ({
          ...filter,
          config: JSON.parse(filter.config || '{}')
        })),
        milaInsights
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter dashboard'
    });
  }
});

/**
 * POST /api/dashboards
 * Criar novo dashboard
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      layout = 'grid',
      theme = 'light',
      colorPalette = {},
      isPublic = false,
      tags = [],
      quantumEnhanced = true,
      refreshInterval = 30000
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Nome do dashboard é obrigatório'
      });
    }

    // Processar criação com algoritmos quânticos se habilitado
    let quantumOptimizations = {};
    if (quantumEnhanced) {
      quantumOptimizations = await quantumProcessor.optimizeDashboardLayout({
        layout,
        theme,
        colorPalette,
        userPreferences: await getUserPreferences(req.user.id)
      });
    }

    // Criar dashboard
    const result = await db.query(`
      INSERT INTO dashboards (
        user_id, name, description, layout, theme, color_palette,
        is_public, tags, quantum_enhanced, refresh_interval,
        config, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      req.user.id,
      name,
      description,
      layout,
      theme,
      JSON.stringify(colorPalette),
      isPublic,
      JSON.stringify(tags),
      quantumEnhanced,
      refreshInterval,
      JSON.stringify(quantumOptimizations)
    ]);

    const dashboardId = result.insertId;

    // Gerar insights MILA para novo dashboard
    const milaInsights = await milaService.generateNewDashboardInsights({
      dashboardId,
      userId: req.user.id,
      config: { layout, theme, quantumEnhanced }
    });

    res.status(201).json({
      success: true,
      data: {
        dashboardId,
        quantumOptimizations,
        milaInsights,
        message: 'Dashboard criado com sucesso'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar dashboard'
    });
  }
});

/**
 * PUT /api/dashboards/:id
 * Atualizar dashboard
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se o dashboard pertence ao usuário
    const dashboards = await db.query(`
      SELECT id FROM dashboards 
      WHERE id = ? AND user_id = ?
    `, [id, req.user.id]);

    if (dashboards.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard não encontrado'
      });
    }

    // Preparar campos para atualização
    const allowedFields = [
      'name', 'description', 'layout', 'theme', 'color_palette',
      'is_public', 'tags', 'quantum_enhanced', 'refresh_interval'
    ];

    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        
        if (key === 'color_palette' || key === 'tags') {
          updateValues.push(JSON.stringify(updateData[key]));
        } else {
          updateValues.push(updateData[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum campo válido para atualização'
      });
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(id);

    // Atualizar dashboard
    await db.query(`
      UPDATE dashboards 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    // Processar otimizações quânticas se habilitado
    let quantumOptimizations = {};
    if (updateData.quantumEnhanced) {
      quantumOptimizations = await quantumProcessor.optimizeDashboardLayout({
        layout: updateData.layout,
        theme: updateData.theme,
        colorPalette: updateData.colorPalette
      });

      // Atualizar configurações quânticas
      await db.query(`
        UPDATE dashboards 
        SET config = JSON_MERGE_PATCH(COALESCE(config, '{}'), ?)
        WHERE id = ?
      `, [JSON.stringify(quantumOptimizations), id]);
    }

    res.json({
      success: true,
      data: {
        dashboardId: id,
        quantumOptimizations,
        message: 'Dashboard atualizado com sucesso'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar dashboard'
    });
  }
});

/**
 * DELETE /api/dashboards/:id
 * Deletar dashboard
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o dashboard pertence ao usuário
    const dashboards = await db.query(`
      SELECT id FROM dashboards 
      WHERE id = ? AND user_id = ?
    `, [id, req.user.id]);

    if (dashboards.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard não encontrado'
      });
    }

    // Deletar widgets relacionados
    await db.query(`DELETE FROM dashboard_widgets WHERE dashboard_id = ?`, [id]);
    
    // Deletar filtros relacionados
    await db.query(`DELETE FROM dashboard_filters WHERE dashboard_id = ?`, [id]);
    
    // Deletar visualizações
    await db.query(`DELETE FROM dashboard_views WHERE dashboard_id = ?`, [id]);
    
    // Deletar dashboard
    await db.query(`DELETE FROM dashboards WHERE id = ?`, [id]);

    res.json({
      success: true,
      message: 'Dashboard deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar dashboard'
    });
  }
});

/**
 * POST /api/dashboards/:id/widgets
 * Adicionar widget ao dashboard
 */
router.post('/:id/widgets', authenticateToken, async (req, res) => {
  try {
    const { id: dashboardId } = req.params;
    const {
      type,
      title,
      chartType,
      dataSource,
      query,
      positionX = 0,
      positionY = 0,
      width = 4,
      height = 3,
      config = {}
    } = req.body;

    // Verificar se o dashboard pertence ao usuário
    const dashboards = await db.query(`
      SELECT id FROM dashboards 
      WHERE id = ? AND user_id = ?
    `, [dashboardId, req.user.id]);

    if (dashboards.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard não encontrado'
      });
    }

    // Otimizar widget com algoritmos quânticos
    const quantumOptimizedConfig = await quantumProcessor.optimizeWidget({
      type,
      chartType,
      dataSource,
      query,
      config
    });

    // Criar widget
    const result = await db.query(`
      INSERT INTO dashboard_widgets (
        dashboard_id, type, title, chart_type, data_source,
        query, position_x, position_y, width, height,
        config, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      dashboardId,
      type,
      title,
      chartType,
      JSON.stringify(dataSource),
      query,
      positionX,
      positionY,
      width,
      height,
      JSON.stringify({ ...config, ...quantumOptimizedConfig })
    ]);

    // Atualizar contador de widgets no dashboard
    await db.query(`
      UPDATE dashboards 
      SET widget_count = (
        SELECT COUNT(*) FROM dashboard_widgets WHERE dashboard_id = ?
      ), updated_at = NOW()
      WHERE id = ?
    `, [dashboardId, dashboardId]);

    res.status(201).json({
      success: true,
      data: {
        widgetId: result.insertId,
        quantumOptimizations: quantumOptimizedConfig,
        message: 'Widget adicionado com sucesso'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar widget:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao adicionar widget'
    });
  }
});

/**
 * PUT /api/dashboards/:id/widgets/:widgetId
 * Atualizar widget
 */
router.put('/:id/widgets/:widgetId', authenticateToken, async (req, res) => {
  try {
    const { id: dashboardId, widgetId } = req.params;
    const updateData = req.body;

    // Verificar se o widget pertence ao dashboard do usuário
    const widgets = await db.query(`
      SELECT w.id 
      FROM dashboard_widgets w
      JOIN dashboards d ON w.dashboard_id = d.id
      WHERE w.id = ? AND d.id = ? AND d.user_id = ?
    `, [widgetId, dashboardId, req.user.id]);

    if (widgets.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Widget não encontrado'
      });
    }

    // Preparar campos para atualização
    const allowedFields = [
      'title', 'chart_type', 'data_source', 'query',
      'position_x', 'position_y', 'width', 'height', 'config'
    ];

    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        
        if (key === 'data_source' || key === 'config') {
          updateValues.push(JSON.stringify(updateData[key]));
        } else {
          updateValues.push(updateData[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum campo válido para atualização'
      });
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(widgetId);

    // Atualizar widget
    await db.query(`
      UPDATE dashboard_widgets 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    // Atualizar timestamp do dashboard
    await db.query(`
      UPDATE dashboards SET updated_at = NOW() WHERE id = ?
    `, [dashboardId]);

    res.json({
      success: true,
      message: 'Widget atualizado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar widget:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar widget'
    });
  }
});

/**
 * DELETE /api/dashboards/:id/widgets/:widgetId
 * Deletar widget
 */
router.delete('/:id/widgets/:widgetId', authenticateToken, async (req, res) => {
  try {
    const { id: dashboardId, widgetId } = req.params;

    // Verificar se o widget pertence ao dashboard do usuário
    const widgets = await db.query(`
      SELECT w.id 
      FROM dashboard_widgets w
      JOIN dashboards d ON w.dashboard_id = d.id
      WHERE w.id = ? AND d.id = ? AND d.user_id = ?
    `, [widgetId, dashboardId, req.user.id]);

    if (widgets.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Widget não encontrado'
      });
    }

    // Deletar widget
    await db.query(`DELETE FROM dashboard_widgets WHERE id = ?`, [widgetId]);

    // Atualizar contador de widgets no dashboard
    await db.query(`
      UPDATE dashboards 
      SET widget_count = (
        SELECT COUNT(*) FROM dashboard_widgets WHERE dashboard_id = ?
      ), updated_at = NOW()
      WHERE id = ?
    `, [dashboardId, dashboardId]);

    res.json({
      success: true,
      message: 'Widget deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar widget:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar widget'
    });
  }
});

/**
 * GET /api/dashboards/:id/data
 * Obter dados do dashboard
 */
router.get('/:id/data', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { refresh = false } = req.query;

    // Verificar acesso ao dashboard
    const dashboards = await db.query(`
      SELECT * FROM dashboards 
      WHERE id = ? AND (user_id = ? OR is_public = 1)
    `, [id, req.user.id]);

    if (dashboards.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard não encontrado'
      });
    }

    const dashboard = dashboards[0];

    // Buscar widgets
    const widgets = await db.query(`
      SELECT * FROM dashboard_widgets 
      WHERE dashboard_id = ?
    `, [id]);

    // Executar queries dos widgets
    const widgetData = await Promise.all(
      widgets.map(async (widget) => {
        try {
          let data = [];
          
          if (widget.query) {
            // Executar query com otimização quântica se habilitado
            if (dashboard.quantum_enhanced) {
              const quantumResult = await quantumProcessor.optimizeQuery({
                query: widget.query,
                dataSource: JSON.parse(widget.data_source || '{}')
              });
              
              data = await executeOptimizedQuery(quantumResult.optimizedQuery);
            } else {
              data = await executeQuery(widget.query);
            }
          }

          return {
            widgetId: widget.id,
            type: widget.type,
            title: widget.title,
            data,
            lastUpdated: new Date()
          };
        } catch (error) {
          console.error(`❌ Erro ao executar query do widget ${widget.id}:`, error);
          return {
            widgetId: widget.id,
            type: widget.type,
            title: widget.title,
            data: [],
            error: error.message,
            lastUpdated: new Date()
          };
        }
      })
    );

    res.json({
      success: true,
      data: {
        dashboardId: id,
        widgets: widgetData,
        lastRefresh: new Date(),
        quantumEnhanced: dashboard.quantum_enhanced
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter dados do dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter dados do dashboard'
    });
  }
});

// Funções auxiliares
async function getUserPreferences(userId) {
  try {
    const prefs = await db.query(`
      SELECT preferences FROM user_preferences 
      WHERE user_id = ?
    `, [userId]);
    
    return prefs.length > 0 ? JSON.parse(prefs[0].preferences) : {};
  } catch (error) {
    return {};
  }
}

async function executeQuery(query) {
  // Implementar execução de query segura
  // Por enquanto, retornar dados mock
  return [
    { name: 'Jan', value: 400 },
    { name: 'Fev', value: 300 },
    { name: 'Mar', value: 500 },
    { name: 'Abr', value: 450 }
  ];
}

async function executeOptimizedQuery(query) {
  // Implementar execução de query otimizada
  return executeQuery(query);
}

module.exports = router;
