const express = require( 'express' );
const { body, validationResult } = require( 'express-validator' );
const multer = require( 'multer' );
const path = require( 'path' );
const router = express.Router();
const DatabaseService = require( '../services/DatabaseService' );
const { authenticateToken } = require( '../middleware/auth' );
const { requirePermission, requireAnyPermission } = require( '../middleware/permissions' );
const QuantumProcessor = require( '../services/QuantumProcessor' );
const MilaService = require( '../services/MilaService' );

const db = new DatabaseService();
const quantumProcessor = new QuantumProcessor();
const milaService = new MilaService();

// Configurar multer para anexos de chat
const storage = multer.diskStorage( {
  destination: ( req, file, cb ) =>
  {
    cb( null, 'uploads/chat-attachments/' );
  },
  filename: ( req, file, cb ) =>
  {
    const uniqueSuffix = Date.now() + '-' + Math.round( Math.random() * 1E9 );
    cb( null, file.fieldname + '-' + uniqueSuffix + path.extname( file.originalname ) );
  }
} );

const upload = multer( {
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
} );

/**
 * GET /api/chat/conversations
 * Listar conversas do usuário
 */
router.get( '/conversations', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { page = 1, limit = 20, search, type } = req.query;
    const offset = ( page - 1 ) * limit;

    let whereClause = `WHERE cp.user_id = ?`;
    let params = [ req.user.id ];

    if ( search )
    {
      whereClause += ` AND (cc.name LIKE ? OR cc.description LIKE ?)`;
      params.push( `%${ search }%`, `%${ search }%` );
    }

    if ( type )
    {
      whereClause += ` AND cc.type = ?`;
      params.push( type );
    }

    const conversations = await db.query( `
      SELECT 
        cc.id,
        cc.name,
        cc.type,
        cc.description,
        cc.avatar,
        cc.last_message_at,
        cc.message_count,
        cc.created_at,
        cp.role as user_role,
        cp.last_read_at,
        cp.is_muted,
        u.name as created_by_name,
        u.avatar as created_by_avatar,
        (
          SELECT COUNT(*) 
          FROM chat_messages cm 
          WHERE cm.conversation_id = cc.id 
          AND cm.created_at > COALESCE(cp.last_read_at, '1970-01-01')
        ) as unread_count,
        (
          SELECT cm.content 
          FROM chat_messages cm 
          WHERE cm.conversation_id = cc.id 
          ORDER BY cm.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT cm.created_at 
          FROM chat_messages cm 
          WHERE cm.conversation_id = cc.id 
          ORDER BY cm.created_at DESC 
          LIMIT 1
        ) as last_message_time
      FROM chat_conversations cc
      JOIN chat_participants cp ON cc.id = cp.conversation_id
      JOIN users u ON cc.created_by = u.id
      ${ whereClause }
      ORDER BY cc.last_message_at DESC
      LIMIT ? OFFSET ?
    `, [ ...params, parseInt( limit ), offset ] );

    // Contar total
    const totalResult = await db.query( `
      SELECT COUNT(*) as total 
      FROM chat_conversations cc
      JOIN chat_participants cp ON cc.id = cp.conversation_id
      ${ whereClause }
    `, params );

    const total = totalResult[ 0 ].total;

    res.json( {
      success: true,
      data: {
        conversations: conversations.map( conv => ( {
          ...conv,
          settings: conv.settings ? JSON.parse( conv.settings ) : {}
        } ) ),
        pagination: {
          page: parseInt( page ),
          limit: parseInt( limit ),
          total,
          totalPages: Math.ceil( total / limit )
        }
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao listar conversas:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter conversas'
    } );
  }
} );

/**
 * POST /api/chat/conversations
 * Criar nova conversa
 */
router.post( '/conversations', authenticateToken, async ( req, res ) =>
{
  try
  {
    const {
      name,
      type = 'direct',
      description,
      participants = [],
      isPrivate = true
    } = req.body;

    if ( type === 'direct' && participants.length !== 1 )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Conversa direta deve ter exatamente 1 participante além do criador'
      } );
    }

    if ( type === 'group' && !name )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Nome é obrigatório para grupos'
      } );
    }

    // Verificar se conversa direta já existe
    if ( type === 'direct' )
    {
      const existingConv = await db.query( `
        SELECT cc.id 
        FROM chat_conversations cc
        JOIN chat_participants cp1 ON cc.id = cp1.conversation_id
        JOIN chat_participants cp2 ON cc.id = cp2.conversation_id
        WHERE cc.type = 'direct'
        AND cp1.user_id = ? AND cp2.user_id = ?
        AND cc.id IN (
          SELECT conversation_id 
          FROM chat_participants 
          GROUP BY conversation_id 
          HAVING COUNT(*) = 2
        )
      `, [ req.user.id, participants[ 0 ] ] );

      if ( existingConv.length > 0 )
      {
        return res.json( {
          success: true,
          data: {
            conversationId: existingConv[ 0 ].id,
            isExisting: true
          }
        } );
      }
    }

    // Criar conversa
    const conversationResult = await db.query( `
      INSERT INTO chat_conversations (
        name, type, description, is_private, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `, [ name, type, description, isPrivate, req.user.id ] );

    const conversationId = conversationResult.insertId;

    // Adicionar criador como owner
    await db.query( `
      INSERT INTO chat_participants (
        conversation_id, user_id, role, joined_at
      ) VALUES (?, ?, 'owner', NOW())
    `, [ conversationId, req.user.id ] );

    // Adicionar outros participantes
    for ( const participantId of participants )
    {
      await db.query( `
        INSERT INTO chat_participants (
          conversation_id, user_id, role, joined_at
        ) VALUES (?, ?, 'member', NOW())
      `, [ conversationId, participantId ] );
    }

    // Criar mensagem de sistema
    await db.query( `
      INSERT INTO chat_messages (
        conversation_id, user_id, message_type, content, created_at
      ) VALUES (?, ?, 'system', ?, NOW())
    `, [
      conversationId,
      req.user.id,
      type === 'direct' ? 'Conversa iniciada' : `${ req.user.name } criou o grupo "${ name }"`
    ] );

    // Notificar participantes via WebSocket
    await chatService.notifyParticipants( conversationId, {
      type: 'conversation_created',
      conversationId,
      creator: req.user,
      participants
    } );

    res.status( 201 ).json( {
      success: true,
      data: {
        conversationId,
        message: 'Conversa criada com sucesso'
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao criar conversa:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao criar conversa'
    } );
  }
} );

/**
 * GET /api/chat/conversations/:id/messages
 * Obter mensagens de uma conversa
 */
router.get( '/conversations/:id/messages', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { id: conversationId } = req.params;
    const { page = 1, limit = 50, before, after } = req.query;
    const offset = ( page - 1 ) * limit;

    // Verificar se usuário é participante
    const isParticipant = await db.query( `
      SELECT id FROM chat_participants 
      WHERE conversation_id = ? AND user_id = ?
    `, [ conversationId, req.user.id ] );

    if ( isParticipant.length === 0 )
    {
      return res.status( 403 ).json( {
        success: false,
        error: 'Acesso negado a esta conversa'
      } );
    }

    let whereClause = 'WHERE cm.conversation_id = ?';
    let params = [ conversationId ];

    if ( before )
    {
      whereClause += ' AND cm.created_at < ?';
      params.push( before );
    }

    if ( after )
    {
      whereClause += ' AND cm.created_at > ?';
      params.push( after );
    }

    const messages = await db.query( `
      SELECT 
        cm.id,
        cm.message_type,
        cm.content,
        cm.reply_to_id,
        cm.edited_at,
        cm.quantum_processed,
        cm.quantum_data,
        cm.mila_generated,
        cm.has_attachments,
        cm.created_at,
        u.id as user_id,
        u.name as user_name,
        u.avatar as user_avatar,
        reply_msg.content as reply_content,
        reply_user.name as reply_user_name
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      LEFT JOIN chat_messages reply_msg ON cm.reply_to_id = reply_msg.id
      LEFT JOIN users reply_user ON reply_msg.user_id = reply_user.id
      ${ whereClause }
      ORDER BY cm.created_at DESC
      LIMIT ? OFFSET ?
    `, [ ...params, parseInt( limit ), offset ] );

    // Buscar anexos para mensagens que têm
    const messageIds = messages.filter( m => m.has_attachments ).map( m => m.id );
    let attachments = [];

    if ( messageIds.length > 0 )
    {
      attachments = await db.query( `
        SELECT * FROM chat_attachments 
        WHERE message_id IN (${ messageIds.map( () => '?' ).join( ',' ) })
      `, messageIds );
    }

    // Buscar reações
    const reactions = await db.query( `
      SELECT 
        mr.message_id,
        mr.emoji,
        mr.user_id,
        u.name as user_name,
        mr.created_at
      FROM message_reactions mr
      JOIN users u ON mr.user_id = u.id
      WHERE mr.message_id IN (${ messages.map( () => '?' ).join( ',' ) })
    `, messages.map( m => m.id ) );

    // Organizar dados
    const messagesWithData = messages.map( message => ( {
      ...message,
      quantumData: message.quantum_data ? JSON.parse( message.quantum_data ) : null,
      attachments: attachments.filter( a => a.message_id === message.id ),
      reactions: reactions.filter( r => r.message_id === message.id )
    } ) );

    // Marcar mensagens como lidas
    await db.query( `
      UPDATE chat_participants 
      SET last_read_at = NOW()
      WHERE conversation_id = ? AND user_id = ?
    `, [ conversationId, req.user.id ] );

    res.json( {
      success: true,
      data: {
        messages: messagesWithData.reverse(), // Ordem cronológica
        hasMore: messages.length === parseInt( limit )
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao obter mensagens:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter mensagens'
    } );
  }
} );

/**
 * POST /api/chat/conversations/:id/messages
 * Enviar mensagem
 */
router.post( '/conversations/:id/messages', authenticateToken, upload.array( 'attachments', 5 ), async ( req, res ) =>
{
  try
  {
    const { id: conversationId } = req.params;
    const {
      content,
      messageType = 'text',
      replyToId = null,
      quantumEnhanced = true
    } = req.body;

    if ( !content && ( !req.files || req.files.length === 0 ) )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Conteúdo ou anexos são obrigatórios'
      } );
    }

    // Verificar se usuário é participante
    const isParticipant = await db.query( `
      SELECT id FROM chat_participants 
      WHERE conversation_id = ? AND user_id = ?
    `, [ conversationId, req.user.id ] );

    if ( isParticipant.length === 0 )
    {
      return res.status( 403 ).json( {
        success: false,
        error: 'Acesso negado a esta conversa'
      } );
    }

    // Processar com algoritmos quânticos se habilitado
    let quantumData = null;
    if ( quantumEnhanced && content )
    {
      quantumData = await quantumProcessor.processOperation( {
        type: 'chat_message_analysis',
        data: {
          content,
          conversationId,
          messageType
        },
        complexity: 1,
        userId: req.user.id
      } );
    }

    // Gerar insights MILA
    const milaInsights = await milaService.generateChatInsights( {
      content,
      conversationId,
      userId: req.user.id,
      messageType
    } );

    // Criar mensagem
    const messageResult = await db.query( `
      INSERT INTO chat_messages (
        conversation_id, user_id, message_type, content, reply_to_id,
        quantum_processed, quantum_data, mila_generated, has_attachments, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      conversationId,
      req.user.id,
      messageType,
      content || '',
      replyToId,
      quantumEnhanced,
      quantumData ? JSON.stringify( quantumData ) : null,
      milaInsights.length > 0,
      req.files && req.files.length > 0
    ] );

    const messageId = messageResult.insertId;

    // Salvar anexos se houver
    if ( req.files && req.files.length > 0 )
    {
      for ( const file of req.files )
      {
        await db.query( `
          INSERT INTO chat_attachments (
            message_id, filename, original_name, file_path, file_size, mime_type, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [
          messageId,
          file.filename,
          file.originalname,
          file.path,
          file.size,
          file.mimetype
        ] );
      }
    }

    // Atualizar conversa
    await db.query( `
      UPDATE chat_conversations 
      SET last_message_at = NOW(), message_count = message_count + 1
      WHERE id = ?
    `, [ conversationId ] );

    // Buscar dados completos da mensagem
    const fullMessage = await db.query( `
      SELECT 
        cm.*,
        u.name as user_name,
        u.avatar as user_avatar
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.id = ?
    `, [ messageId ] );

    const message = {
      ...fullMessage[ 0 ],
      quantumData: quantumData,
      milaInsights,
      attachments: req.files || []
    };

    // Notificar participantes via WebSocket
    await chatService.notifyParticipants( conversationId, {
      type: 'new_message',
      message,
      conversationId
    }, req.user.id );

    res.status( 201 ).json( {
      success: true,
      data: {
        messageId,
        message,
        quantumData,
        milaInsights
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao enviar mensagem:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao enviar mensagem'
    } );
  }
} );

/**
 * POST /api/chat/messages/:id/reactions
 * Adicionar reação a mensagem
 */
router.post( '/messages/:id/reactions', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { id: messageId } = req.params;
    const { emoji } = req.body;

    if ( !emoji )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Emoji é obrigatório'
      } );
    }

    // Verificar se mensagem existe e usuário tem acesso
    const messages = await db.query( `
      SELECT cm.conversation_id 
      FROM chat_messages cm
      JOIN chat_participants cp ON cm.conversation_id = cp.conversation_id
      WHERE cm.id = ? AND cp.user_id = ?
    `, [ messageId, req.user.id ] );

    if ( messages.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Mensagem não encontrada'
      } );
    }

    const conversationId = messages[ 0 ].conversation_id;

    // Verificar se reação já existe
    const existingReaction = await db.query( `
      SELECT id FROM message_reactions 
      WHERE message_id = ? AND user_id = ? AND emoji = ?
    `, [ messageId, req.user.id, emoji ] );

    if ( existingReaction.length > 0 )
    {
      // Remover reação existente
      await db.query( `
        DELETE FROM message_reactions 
        WHERE id = ?
      `, [ existingReaction[ 0 ].id ] );

      var action = 'removed';
    } else
    {
      // Adicionar nova reação
      await db.query( `
        INSERT INTO message_reactions (
          message_id, user_id, emoji, created_at
        ) VALUES (?, ?, ?, NOW())
      `, [ messageId, req.user.id, emoji ] );

      var action = 'added';
    }

    // Notificar participantes
    await chatService.notifyParticipants( conversationId, {
      type: 'reaction_changed',
      messageId,
      emoji,
      userId: req.user.id,
      action
    }, req.user.id );

    res.json( {
      success: true,
      data: {
        action,
        emoji,
        messageId
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao processar reação:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao processar reação'
    } );
  }
} );

/**
 * PUT /api/chat/messages/:id
 * Editar mensagem
 */
router.put( '/messages/:id', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { id: messageId } = req.params;
    const { content } = req.body;

    if ( !content )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Conteúdo é obrigatório'
      } );
    }

    // Verificar se mensagem pertence ao usuário
    const messages = await db.query( `
      SELECT conversation_id FROM chat_messages 
      WHERE id = ? AND user_id = ?
    `, [ messageId, req.user.id ] );

    if ( messages.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Mensagem não encontrada'
      } );
    }

    const conversationId = messages[ 0 ].conversation_id;

    // Atualizar mensagem
    await db.query( `
      UPDATE chat_messages 
      SET content = ?, edited_at = NOW()
      WHERE id = ?
    `, [ content, messageId ] );

    // Notificar participantes
    await chatService.notifyParticipants( conversationId, {
      type: 'message_edited',
      messageId,
      newContent: content,
      editedBy: req.user.id
    }, req.user.id );

    res.json( {
      success: true,
      message: 'Mensagem editada com sucesso'
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao editar mensagem:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao editar mensagem'
    } );
  }
} );

/**
 * DELETE /api/chat/messages/:id
 * Deletar mensagem
 */
router.delete( '/messages/:id', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { id: messageId } = req.params;

    // Verificar se mensagem pertence ao usuário
    const messages = await db.query( `
      SELECT conversation_id FROM chat_messages 
      WHERE id = ? AND user_id = ?
    `, [ messageId, req.user.id ] );

    if ( messages.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Mensagem não encontrada'
      } );
    }

    const conversationId = messages[ 0 ].conversation_id;

    // Deletar anexos
    await db.query( `DELETE FROM chat_attachments WHERE message_id = ?`, [ messageId ] );

    // Deletar reações
    await db.query( `DELETE FROM message_reactions WHERE message_id = ?`, [ messageId ] );

    // Deletar mensagem
    await db.query( `DELETE FROM chat_messages WHERE id = ?`, [ messageId ] );

    // Atualizar contador da conversa
    await db.query( `
      UPDATE chat_conversations 
      SET message_count = message_count - 1
      WHERE id = ?
    `, [ conversationId ] );

    // Notificar participantes
    await chatService.notifyParticipants( conversationId, {
      type: 'message_deleted',
      messageId,
      deletedBy: req.user.id
    }, req.user.id );

    res.json( {
      success: true,
      message: 'Mensagem deletada com sucesso'
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao deletar mensagem:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao deletar mensagem'
    } );
  }
} );

/**
 * GET /api/chat/attachments/:id/download
 * Download de anexo
 */
router.get( '/attachments/:id/download', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { id } = req.params;

    const attachments = await db.query( `
      SELECT ca.*, cm.conversation_id 
      FROM chat_attachments ca
      JOIN chat_messages cm ON ca.message_id = cm.id
      JOIN chat_participants cp ON cm.conversation_id = cp.conversation_id
      WHERE ca.id = ? AND cp.user_id = ?
    `, [ id, req.user.id ] );

    if ( attachments.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Anexo não encontrado'
      } );
    }

    const attachment = attachments[ 0 ];

    res.download( attachment.file_path, attachment.original_name, ( err ) =>
    {
      if ( err )
      {
        console.error( '❌ Erro no download:', err );
        res.status( 500 ).json( {
          success: false,
          error: 'Erro no download do anexo'
        } );
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro no download:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro no download do anexo'
    } );
  }
} );

module.exports = router;
