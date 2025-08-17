import express from 'express';
import { eq, desc, and } from 'drizzle-orm';
import { db } from './db';
import { accessProfiles, moduleDefinitions } from '../shared/schema';
import { requireRole } from './authMiddleware';

const router = express.Router();

// Middleware para verificar se é super_admin (somente equipe TOIT pode gerenciar perfis)
router.use(requireRole(['super_admin']));

// GET /api/admin/access-profiles - Listar todos os perfis de acesso
router.get('/', async (req, res) => {
  try {
    const profiles = await db
      .select()
      .from(accessProfiles)
      .orderBy(desc(accessProfiles.sort_order), accessProfiles.name);

    res.json(profiles);
  } catch (error) {
    console.error('Error fetching access profiles:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar perfis de acesso' 
    });
  }
});

// GET /api/admin/access-profiles/:id - Buscar perfil específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = await db
      .select()
      .from(accessProfiles)
      .where(eq(accessProfiles.id, id))
      .limit(1);

    if (profile.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Perfil de acesso não encontrado' 
      });
    }

    res.json(profile[0]);
  } catch (error) {
    console.error('Error fetching access profile:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar perfil de acesso' 
    });
  }
});

// GET /api/admin/access-profiles/modules/available - Listar módulos disponíveis
router.get('/modules/available', async (req, res) => {
  try {
    const modules = await db
      .select()
      .from(moduleDefinitions)
      .where(eq(moduleDefinitions.isActive, true))
      .orderBy(moduleDefinitions.category, moduleDefinitions.displayName);

    // Agrupar módulos por categoria
    const modulesByCategory = modules.reduce((acc, module) => {
      const category = module.category || 'core';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(module);
      return acc;
    }, {} as Record<string, typeof modules>);

    res.json({
      success: true,
      data: modulesByCategory,
      total: modules.length
    });
  } catch (error) {
    console.error('Error fetching available modules:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar módulos disponíveis' 
    });
  }
});

// POST /api/admin/access-profiles - Criar novo perfil de acesso
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      price_monthly,
      price_yearly,
      max_users,
      max_storage_gb,
      modules,
      features,
      is_active = true
    } = req.body;

    // Validações básicas
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Nome do perfil é obrigatório'
      });
    }

    if (price_monthly < 0 || price_yearly < 0) {
      return res.status(400).json({
        success: false,
        error: 'Preços devem ser valores positivos'
      });
    }

    // Gerar slug baseado no nome
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Verificar se slug já existe
    const existingProfile = await db
      .select()
      .from(accessProfiles)
      .where(eq(accessProfiles.slug, slug))
      .limit(1);

    if (existingProfile.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Já existe um perfil com este nome'
      });
    }

    const newProfile = await db
      .insert(accessProfiles)
      .values({
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        price_monthly: String(price_monthly),
        price_yearly: String(price_yearly),
        max_users: max_users || 1,
        max_storage_gb: max_storage_gb || 1,
        modules: modules || {},
        features: features || [],
        is_active
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newProfile[0],
      message: 'Perfil de acesso criado com sucesso'
    });
  } catch (error) {
    console.error('Error creating access profile:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao criar perfil de acesso' 
    });
  }
});

// PUT /api/admin/access-profiles/:id - Atualizar perfil de acesso
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price_monthly,
      price_yearly,
      max_users,
      max_storage_gb,
      modules,
      features,
      is_active
    } = req.body;

    // Verificar se perfil existe
    const existingProfile = await db
      .select()
      .from(accessProfiles)
      .where(eq(accessProfiles.id, id))
      .limit(1);

    if (existingProfile.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Perfil de acesso não encontrado'
      });
    }

    // Preparar dados para atualização
    const updateData: any = {
      updated_at: new Date()
    };

    if (name && name.trim()) {
      updateData.name = name.trim();
      // Gerar novo slug se nome mudou
      if (name.trim() !== existingProfile[0].name) {
        updateData.slug = name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (price_monthly !== undefined) {
      if (price_monthly < 0) {
        return res.status(400).json({
          success: false,
          error: 'Preço mensal deve ser positivo'
        });
      }
      updateData.price_monthly = String(price_monthly);
    }

    if (price_yearly !== undefined) {
      if (price_yearly < 0) {
        return res.status(400).json({
          success: false,
          error: 'Preço anual deve ser positivo'
        });
      }
      updateData.price_yearly = String(price_yearly);
    }

    if (max_users !== undefined) {
      updateData.max_users = max_users;
    }

    if (max_storage_gb !== undefined) {
      updateData.max_storage_gb = max_storage_gb;
    }

    if (modules !== undefined) {
      updateData.modules = modules;
    }

    if (features !== undefined) {
      updateData.features = features;
    }

    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    const updatedProfile = await db
      .update(accessProfiles)
      .set(updateData)
      .where(eq(accessProfiles.id, id))
      .returning();

    res.json({
      success: true,
      data: updatedProfile[0],
      message: 'Perfil de acesso atualizado com sucesso'
    });
  } catch (error) {
    console.error('Error updating access profile:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao atualizar perfil de acesso' 
    });
  }
});

// DELETE /api/admin/access-profiles/:id - Excluir perfil de acesso
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se perfil existe
    const existingProfile = await db
      .select()
      .from(accessProfiles)
      .where(eq(accessProfiles.id, id))
      .limit(1);

    if (existingProfile.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Perfil de acesso não encontrado'
      });
    }

    // TODO: Verificar se existem tenants usando este perfil
    // Se existir, talvez bloquear exclusão ou migrar para perfil padrão

    await db
      .delete(accessProfiles)
      .where(eq(accessProfiles.id, id));

    res.json({
      success: true,
      message: 'Perfil de acesso excluído com sucesso'
    });
  } catch (error) {
    console.error('Error deleting access profile:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao excluir perfil de acesso' 
    });
  }
});

// POST /api/admin/access-profiles/:id/duplicate - Duplicar perfil
router.post('/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Buscar perfil original
    const originalProfile = await db
      .select()
      .from(accessProfiles)
      .where(eq(accessProfiles.id, id))
      .limit(1);

    if (originalProfile.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Perfil original não encontrado'
      });
    }

    const profile = originalProfile[0];
    const newName = name || `${profile.name} (Cópia)`;
    
    // Gerar slug único
    const baseSlug = newName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existing = await db
        .select()
        .from(accessProfiles)
        .where(eq(accessProfiles.slug, slug))
        .limit(1);
      
      if (existing.length === 0) break;
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const duplicatedProfile = await db
      .insert(accessProfiles)
      .values({
        name: newName,
        slug,
        description: profile.description,
        price_monthly: profile.price_monthly,
        price_yearly: profile.price_yearly,
        max_users: profile.max_users,
        max_storage_gb: profile.max_storage_gb,
        modules: profile.modules,
        features: profile.features,
        is_active: false, // Novo perfil inativo por padrão
        sort_order: profile.sort_order
      })
      .returning();

    res.status(201).json({
      success: true,
      data: duplicatedProfile[0],
      message: 'Perfil duplicado com sucesso'
    });
  } catch (error) {
    console.error('Error duplicating access profile:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao duplicar perfil de acesso' 
    });
  }
});

export default router;