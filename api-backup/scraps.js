const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'orkut-retro-secret-2025';

// Cliente Supabase
const supabaseUrl = 'https://ksskokjrdzqghhuahjpl.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - Listar scraps
    if (req.method === 'GET') {
      const { username, to_user_id, limit = 20, offset = 0 } = req.query;
      const limitNum = Math.min(parseInt(limit), 50);
      const offsetNum = parseInt(offset) || 0;

      let toUserId = to_user_id;

      // Se foi fornecido username, buscar o ID
      if (username && !to_user_id) {
        const { data: user, error } = await supabase
          .from('users')
          .select('id')
          .eq('username', username.toLowerCase())
          .single();

        if (error || !user) {
          return res.status(404).json({
            error: 'Usuário não encontrado',
            details: 'O usuário especificado não existe'
          });
        }

        toUserId = user.id;
      }

      // Buscar scraps
      let query = supabase
        .from('scraps')
        .select(`
          id,
          content,
          created_at,
          is_public,
          from_user:users!scraps_from_user_id_fkey(id, name, username, profiles(photo_url)),
          to_user:users!scraps_to_user_id_fkey(id, name, username)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offsetNum, offsetNum + limitNum - 1);

      if (toUserId) {
        query = query.eq('to_user_id', toUserId);
      }

      const { data: scraps, error } = await query;

      if (error) throw error;

      // Formatar scraps
      const formattedScraps = scraps.map(scrap => ({
        id: scrap.id,
        content: scrap.content,
        createdAt: scrap.created_at,
        isPublic: scrap.is_public,
        from: {
          id: scrap.from_user.id,
          name: scrap.from_user.name,
          username: scrap.from_user.username,
          photo: scrap.from_user.profiles?.photo_url || generateDefaultAvatar(scrap.from_user.name)
        },
        to: {
          id: scrap.to_user.id,
          name: scrap.to_user.name,
          username: scrap.to_user.username
        }
      }));

      return res.status(200).json({
        success: true,
        scraps: formattedScraps,
        pagination: {
          limit: limitNum,
          offset: offsetNum,
          hasMore: formattedScraps.length === limitNum
        }
      });
    }

    // POST - Criar novo scrap (requer autenticação)
    if (req.method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          error: 'Token não fornecido',
          details: 'É necessário estar logado para enviar recados'
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        return res.status(401).json({
          error: 'Token inválido',
          details: 'Faça login novamente'
        });
      }

      const { to_username, to_user_id, content, is_public = true } = req.body;

      // Validar conteúdo
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          error: 'Conteúdo obrigatório',
          details: 'O recado deve ter algum conteúdo'
        });
      }

      if (content.length > 1000) {
        return res.status(400).json({
          error: 'Recado muito longo',
          details: 'O recado deve ter no máximo 1000 caracteres'
        });
      }

      let toUserId = to_user_id;

      // Se foi fornecido username, buscar o ID
      if (to_username && !to_user_id) {
        const { data: user, error } = await supabase
          .from('users')
          .select('id')
          .eq('username', to_username.toLowerCase())
          .single();

        if (error || !user) {
          return res.status(404).json({
            error: 'Usuário não encontrado',
            details: 'O usuário especificado não existe'
          });
        }

        toUserId = user.id;
      }

      if (!toUserId) {
        return res.status(400).json({
          error: 'Destinatário obrigatório',
          details: 'É necessário especificar to_username ou to_user_id'
        });
      }

      // Não pode enviar para si mesmo
      if (toUserId === decoded.userId) {
        return res.status(400).json({
          error: 'Operação inválida',
          details: 'Você não pode enviar recados para si mesmo'
        });
      }

      // Criar scrap
      const { data: newScrap, error: insertError } = await supabase
        .from('scraps')
        .insert({
          from_user_id: decoded.userId,
          to_user_id: toUserId,
          content: content.trim(),
          is_public: is_public
        })
        .select(`
          id,
          content,
          created_at,
          is_public,
          from_user:users!scraps_from_user_id_fkey(id, name, username, profiles(photo_url)),
          to_user:users!scraps_to_user_id_fkey(id, name, username)
        `)
        .single();

      if (insertError) throw insertError;

      return res.status(201).json({
        success: true,
        message: 'Recado enviado com sucesso!',
        scrap: {
          id: newScrap.id,
          content: newScrap.content,
          createdAt: newScrap.created_at,
          isPublic: newScrap.is_public,
          from: {
            id: newScrap.from_user.id,
            name: newScrap.from_user.name,
            username: newScrap.from_user.username,
            photo: newScrap.from_user.profiles?.photo_url || generateDefaultAvatar(newScrap.from_user.name)
          },
          to: {
            id: newScrap.to_user.id,
            name: newScrap.to_user.name,
            username: newScrap.to_user.username
          }
        }
      });
    }

    // DELETE - Remover scrap (requer autenticação)
    if (req.method === 'DELETE') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { scrap_id } = req.query;
      
      if (!token) {
        return res.status(401).json({
          error: 'Token não fornecido',
          details: 'É necessário estar logado para excluir recados'
        });
      }

      if (!scrap_id) {
        return res.status(400).json({
          error: 'ID do recado não fornecido',
          details: 'É necessário especificar qual recado excluir'
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        return res.status(401).json({
          error: 'Token inválido',
          details: 'Faça login novamente'
        });
      }

      // Verificar se o scrap existe e se o usuário tem permissão para excluir
      const { data: existingScrap, error: findError } = await supabase
        .from('scraps')
        .select('from_user_id, to_user_id')
        .eq('id', scrap_id)
        .single();

      if (findError || !existingScrap) {
        return res.status(404).json({
          error: 'Recado não encontrado',
          details: 'O recado especificado não existe'
        });
      }

      // Usuário pode excluir se for o autor ou o destinatário
      if (existingScrap.from_user_id !== decoded.userId && existingScrap.to_user_id !== decoded.userId) {
        return res.status(403).json({
          error: 'Sem permissão',
          details: 'Você só pode excluir seus próprios recados ou recados no seu perfil'
        });
      }

      // Excluir scrap
      const { error: deleteError } = await supabase
        .from('scraps')
        .delete()
        .eq('id', scrap_id);

      if (deleteError) throw deleteError;

      return res.status(200).json({
        success: true,
        message: 'Recado excluído com sucesso!'
      });
    }

    return res.status(405).json({
      error: 'Método não permitido',
      details: 'Este endpoint aceita GET, POST e DELETE'
    });

  } catch (error) {
    console.error('Erro no endpoint de scraps:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: 'Não foi possível processar a solicitação'
    });
  }
}

// Função para gerar avatar padrão
function generateDefaultAvatar(name) {
  const firstLetter = name ? name.charAt(0).toUpperCase() : 'U';
  const colors = ['a855c7', '28a745', 'ff6bb3', '5bc0de', 'ffc107', 'dc3545', '6f42c1', 'fd7e14', 'e83e8c', '20c997'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return `https://via.placeholder.com/150x150/${randomColor}/ffffff?text=${firstLetter}`;
}
