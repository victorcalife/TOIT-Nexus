/**
 * CHAT ROUTES - APIs para sistema de chat completo
 */

const express = require( 'express' );
const multer = require( 'multer' );
const { chatService } = require( './chatService.js' );

const router = express.Router();

// Configurar multer para upload de arquivos
const upload = multer( {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: ( req, file, cb ) =>
  {
    // Permitir todos os tipos de arquivo
    cb( null, true );
  }
} );

/**
 * POST /api/chat/conversations - Criar nova conversa
 */
router.post( '/conversations', async ( req, res ) =>
{
  try
  {
    const { participants, type, name } = req.body;

    if ( !participants || participants.length === 0 )
    {
      return res.status( 400 ).json( {
        success: false,
        message: 'Participantes são obrigatórios'
      } );
    }

    const conversation = await chatService.createConversation( participants, type, name );

    res.json( {
      success: true,
      data: conversation,
      message: 'Conversa criada com sucesso'
    } );
  } catch ( error )
  {
    console.error( 'Erro ao criar conversa:', error );
    res.status( 500 ).json( {
      success: false,
      message: error.message
    } );
  }
} );

/**
 * GET /api/chat/conversations/:id/messages - Buscar mensagens
 */
router.get( '/conversations/:id/messages', async ( req, res ) =>
{
  try
  {
    const { id: conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await chatService.getMessages( conversationId, parseInt( limit ), parseInt( offset ) );

    res.json( {
      success: true,
      data: result,
      message: 'Mensagens carregadas com sucesso'
    } );
  } catch ( error )
  {
    console.error( 'Erro ao buscar mensagens:', error );
    res.status( 500 ).json( {
      success: false,
      message: error.message
    } );
  }
} );

/**
 * POST /api/chat/conversations/:id/messages - Enviar mensagem
 */
router.post( '/conversations/:id/messages', async ( req, res ) =>
{
  try
  {
    const { id: conversationId } = req.params;
    const { content, type = 'text', senderId } = req.body;

    if ( !content || !senderId )
    {
      return res.status( 400 ).json( {
        success: false,
        message: 'Conteúdo e remetente são obrigatórios'
      } );
    }

    const message = await chatService.sendMessage( conversationId, senderId, content, type );

    res.json( {
      success: true,
      data: message,
      message: 'Mensagem enviada com sucesso'
    } );
  } catch ( error )
  {
    console.error( 'Erro ao enviar mensagem:', error );
    res.status( 500 ).json( {
      success: false,
      message: error.message
    } );
  }
} );

/**
 * POST /api/chat/conversations/:id/upload - Upload de arquivo
 */
router.post( '/conversations/:id/upload', upload.single( 'file' ), async ( req, res ) =>
{
  try
  {
    const { id: conversationId } = req.params;
    const { senderId } = req.body;
    const file = req.file;

    if ( !file )
    {
      return res.status( 400 ).json( {
        success: false,
        message: 'Arquivo é obrigatório'
      } );
    }

    if ( !senderId )
    {
      return res.status( 400 ).json( {
        success: false,
        message: 'Remetente é obrigatório'
      } );
    }

    // Upload do arquivo
    const fileInfo = await chatService.uploadChatFile( file, senderId, conversationId );

    // Enviar mensagem com o arquivo
    const message = await chatService.sendMessage(
      conversationId,
      senderId,
      `Arquivo enviado: ${ file.originalname }`,
      'file',
      [ fileInfo ]
    );

    res.json( {
      success: true,
      data: {
        message,
        file: fileInfo
      },
      message: 'Arquivo enviado com sucesso'
    } );
  } catch ( error )
  {
    console.error( 'Erro ao enviar arquivo:', error );
    res.status( 500 ).json( {
      success: false,
      message: error.message
    } );
  }
} );

/**
 * POST /api/chat/voice-calls - Iniciar chamada de voz
 */
router.post( '/voice-calls', async ( req, res ) =>
{
  try
  {
    const { conversationId, callerId, participants } = req.body;

    if ( !conversationId || !callerId || !participants )
    {
      return res.status( 400 ).json( {
        success: false,
        message: 'Conversa, chamador e participantes são obrigatórios'
      } );
    }

    const voiceCall = await chatService.startVoiceCall( conversationId, callerId, participants );

    res.json( {
      success: true,
      data: voiceCall,
      message: 'Chamada de voz iniciada'
    } );
  } catch ( error )
  {
    console.error( 'Erro ao iniciar chamada:', error );
    res.status( 500 ).json( {
      success: false,
      message: error.message
    } );
  }
} );

/**
 * PUT /api/chat/voice-calls/:id/accept - Aceitar chamada
 */
router.put( '/voice-calls/:id/accept', async ( req, res ) =>
{
  try
  {
    const { id: callId } = req.params;
    const { userId } = req.body;

    if ( !userId )
    {
      return res.status( 400 ).json( {
        success: false,
        message: 'ID do usuário é obrigatório'
      } );
    }

    const voiceCall = await chatService.acceptVoiceCall( callId, userId );

    res.json( {
      success: true,
      data: voiceCall,
      message: 'Chamada aceita'
    } );
  } catch ( error )
  {
    console.error( 'Erro ao aceitar chamada:', error );
    res.status( 500 ).json( {
      success: false,
      message: error.message
    } );
  }
} );

/**
 * PUT /api/chat/voice-calls/:id/end - Finalizar chamada
 */
router.put( '/voice-calls/:id/end', async ( req, res ) =>
{
  try
  {
    const { id: callId } = req.params;
    const { userId } = req.body;

    if ( !userId )
    {
      return res.status( 400 ).json( {
        success: false,
        message: 'ID do usuário é obrigatório'
      } );
    }

    const voiceCall = await chatService.endVoiceCall( callId, userId );

    res.json( {
      success: true,
      data: voiceCall,
      message: 'Chamada finalizada'
    } );
  } catch ( error )
  {
    console.error( 'Erro ao finalizar chamada:', error );
    res.status( 500 ).json( {
      success: false,
      message: error.message
    } );
  }
} );

/**
 * PUT /api/chat/presence - Atualizar presença
 */
router.put( '/presence', async ( req, res ) =>
{
  try
  {
    const { userId, status } = req.body;

    if ( !userId )
    {
      return res.status( 400 ).json( {
        success: false,
        message: 'ID do usuário é obrigatório'
      } );
    }

    const presence = await chatService.updateUserPresence( userId, status );

    res.json( {
      success: true,
      data: presence,
      message: 'Presença atualizada'
    } );
  } catch ( error )
  {
    console.error( 'Erro ao atualizar presença:', error );
    res.status( 500 ).json( {
      success: false,
      message: error.message
    } );
  }
} );

/**
 * PUT /api/chat/conversations/:id/typing - Marcar como digitando
 */
router.put( '/conversations/:id/typing', async ( req, res ) =>
{
  try
  {
    const { id: conversationId } = req.params;
    const { userId, isTyping } = req.body;

    if ( !userId )
    {
      return res.status( 400 ).json( {
        success: false,
        message: 'ID do usuário é obrigatório'
      } );
    }

    await chatService.setTyping( conversationId, userId, isTyping );

    res.json( {
      success: true,
      message: 'Status de digitação atualizado'
    } );
  } catch ( error )
  {
    console.error( 'Erro ao atualizar digitação:', error );
    res.status( 500 ).json( {
      success: false,
      message: error.message
    } );
  }
} );

/**
 * GET /api/chat/online-users - Usuários online
 */
router.get( '/online-users', async ( req, res ) =>
{
  try
  {
    const onlineUsers = chatService.getOnlineUsers();

    res.json( {
      success: true,
      data: onlineUsers,
      message: 'Usuários online carregados'
    } );
  } catch ( error )
  {
    console.error( 'Erro ao buscar usuários online:', error );
    res.status( 500 ).json( {
      success: false,
      message: error.message
    } );
  }
} );

/**
 * GET /api/chat/active-calls - Chamadas ativas
 */
router.get( '/active-calls', async ( req, res ) =>
{
  try
  {
    const activeCalls = chatService.getActiveCalls();

    res.json( {
      success: true,
      data: activeCalls,
      message: 'Chamadas ativas carregadas'
    } );
  } catch ( error )
  {
    console.error( 'Erro ao buscar chamadas ativas:', error );
    res.status( 500 ).json( {
      success: false,
      message: error.message
    } );
  }
} );

module.exports = router;
