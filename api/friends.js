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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Verificar autenticação
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Token não fornecido',
        details: 'É necessário estar logado'
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

    const userId = decoded.userId;

    // GET - Listar amigos
    if (req.method === 'GET') {
      const { status = 'accepted', search } = req.query;

      let query = supabase
        .from('friendships')
        .select(`
          id,
          status,
          created_at,
          requester:users!friendships_requester_id_fkey(id, name, username, profiles(photo_url)),
          addressee:users!friendships_addressee_id_fkey(id, name, username, profiles(photo_url))
        `)
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data: friendships, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Formatar dados dos amigos
      const friends = friendships.map(friendship => {
        const isRequester = friendship.requester.id === userId;
        const friend = isRequester ? friendship.addressee : friendship.requester;
        
        return {
          friendshipId: friendship.id,
          status: friendship.status,
          createdAt: friendship.created_at,
          isRequester,
          friend: {
            id: friend.id,
            name: friend.name,
            username: friend.username,
            photo: friend.profiles?.photo_url || generateDefaultAvatar(friend.name)
          }
        };
      });

      // Filtrar por busca se fornecido
      let filteredFriends = friends;
      if (search) {
        filteredFriends = friends.filter(item => 
          item.friend.name.toLowerCase().includes(search.toLowerCase()) ||
          item.friend.username.toLowerCase().includes(search.toLowerCase())
        );
      }

      return res.status(200).json({
        success: true,
        friends: filteredFriends,
        total: filteredFriends.length
      });
    }

    // POST - Enviar solicitação de amizade
    if (req.method === 'POST') {
      const { friend_username, friend_id } = req.body;

      let friendId = friend_id;
      
      // Se foi fornecido username, buscar o ID
      if (friend_username && !friend_id) {
        const { data: friend, error } = await supabase
          .from('users')
          .select('id')
          .eq('username', friend_username.toLowerCase())
          .single();

        if (error || !friend) {
          return res.status(404).json({
            error: 'Usuário não encontrado',
            details: 'O usuário especificado não existe'
          });
        }

        friendId = friend.id;
      }

      if (!friendId) {
        return res.status(400).json({
          error: 'Dados incompletos',
          details: 'É necessário fornecer friend_username ou friend_id'
        });
      }

      // Não pode adicionar a si mesmo
      if (friendId === userId) {
        return res.status(400).json({
          error: 'Operação inválida',
          details: 'Você não pode adicionar a si mesmo como amigo'
        });
      }

      // Verificar se já existe amizade
      const { data: existingFriendship } = await supabase
        .from('friendships')
        .select('id, status')
        .or(`and(requester_id.eq.${userId},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${userId})`)
        .single();

      if (existingFriendship) {
        const statusMessages = {
          pending: 'Já existe uma solicitação pendente',
          accepted: 'Vocês já são amigos',
          blocked: 'Não é possível enviar solicitação'
        };

        return res.status(409).json({
          error: 'Solicitação já existe',
          details: statusMessages[existingFriendship.status]
        });
      }

      // Criar solicitação de amizade
      const { data: newFriendship, error } = await supabase
        .from('friendships')
        .insert({
          requester_id: userId,
          addressee_id: friendId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: 'Solicitação de amizade enviada!',
        friendship: newFriendship
      });
    }

    // PUT - Aceitar/rejeitar solicitação
    if (req.method === 'PUT') {
      const { friendship_id, action } = req.body; // action: 'accept' | 'reject'

      if (!friendship_id || !action) {
        return res.status(400).json({
          error: 'Dados incompletos',
          details: 'É necessário fornecer friendship_id e action'
        });
      }

      // Verificar se a amizade existe e o usuário é o destinatário
      const { data: friendship, error: findError } = await supabase
        .from('friendships')
        .select('*')
        .eq('id', friendship_id)
        .eq('addressee_id', userId)
        .eq('status', 'pending')
        .single();

      if (findError || !friendship) {
        return res.status(404).json({
          error: 'Solicitação não encontrada',
          details: 'Solicitação inexistente ou você não tem permissão'
        });
      }

      const newStatus = action === 'accept' ? 'accepted' : 'blocked';

      // Atualizar status
      const { error: updateError } = await supabase
        .from('friendships')
        .update({ status: newStatus })
        .eq('id', friendship_id);

      if (updateError) throw updateError;

      return res.status(200).json({
        success: true,
        message: action === 'accept' ? 'Amizade aceita!' : 'Solicitação rejeitada'
      });
    }

    // DELETE - Remover amizade
    if (req.method === 'DELETE') {
      const { friendship_id } = req.query;

      if (!friendship_id) {
        return res.status(400).json({
          error: 'ID não fornecido',
          details: 'É necessário fornecer o friendship_id'
        });
      }

      // Verificar se a amizade existe e o usuário tem permissão
      const { data: friendship, error: findError } = await supabase
        .from('friendships')
        .select('*')
        .eq('id', friendship_id)
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .single();

      if (findError || !friendship) {
        return res.status(404).json({
          error: 'Amizade não encontrada',
          details: 'Amizade inexistente ou você não tem permissão'
        });
      }

      // Remover amizade
      const { error: deleteError } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendship_id);

      if (deleteError) throw deleteError;

      return res.status(200).json({
        success: true,
        message: 'Amizade removida'
      });
    }

    return res.status(405).json({
      error: 'Método não permitido'
    });

  } catch (error) {
    console.error('Erro na API de amizades:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: 'Não foi possível processar a solicitação'
    });
  }
}

function generateDefaultAvatar(name) {
  const firstLetter = name ? name.charAt(0).toUpperCase() : 'U';
  const colors = ['a855c7', '28a745', 'ff6bb3', '5bc0de', 'ffc107', 'dc3545'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return `https://via.placeholder.com/150x150/${randomColor}/ffffff?text=${firstLetter}`;
}
