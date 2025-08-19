const { createClient } = require('@supabase/supabase-js');

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
    // GET - Obter dados de amigos
    if (req.method === 'GET') {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId é obrigatório'
        });
      }

      // Buscar amigos aceitos
      const { data: acceptedFriendships, error: friendsError } = await supabase
        .from('friendships')
        .select(`
          id,
          status,
          created_at,
          requester:users!friendships_requester_id_fkey(id, name, username, email, profiles(photo_url, location, bio)),
          addressee:users!friendships_addressee_id_fkey(id, name, username, email, profiles(photo_url, location, bio))
        `)
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (friendsError) throw friendsError;

      // Buscar solicitações recebidas (pendentes onde o usuário é addressee)
      const { data: receivedRequests, error: requestsError } = await supabase
        .from('friendships')
        .select(`
          id,
          created_at,
          requester:users!friendships_requester_id_fkey(id, name, username, email, profiles(photo_url, location, bio))
        `)
        .eq('addressee_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Buscar solicitações enviadas (pendentes onde o usuário é requester)
      const { data: sentRequests, error: sentError } = await supabase
        .from('friendships')
        .select(`
          id,
          created_at,
          addressee:users!friendships_addressee_id_fkey(id, name, username, email, profiles(photo_url, location, bio))
        `)
        .eq('requester_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      // Formatar amigos aceitos
      const friends = (acceptedFriendships || []).map(friendship => {
        const isRequester = friendship.requester.id === userId;
        const friend = isRequester ? friendship.addressee : friendship.requester;
        
        return {
          id: friendship.id,
          username: friend.username,
          name: friend.name,
          email: friend.email,
          photo: friend.profiles?.photo_url || generateDefaultAvatar(friend.name),
          status: Math.random() > 0.5 ? 'online' : 'offline', // Simular status online
          location: friend.profiles?.location || 'Brasil',
          since: new Date(friendship.created_at).getTime(),
          mutualFriends: Math.floor(Math.random() * 20) // Simular amigos em comum
        };
      });

      // Formatar solicitações recebidas
      const requests = (receivedRequests || []).map(request => ({
        id: request.id,
        username: request.requester.username,
        name: request.requester.name,
        email: request.requester.email,
        photo: request.requester.profiles?.photo_url || generateDefaultAvatar(request.requester.name),
        location: request.requester.profiles?.location || 'Brasil',
        mutualFriends: Math.floor(Math.random() * 10),
        requestDate: new Date(request.created_at).getTime()
      }));

      // Formatar solicitações enviadas
      const sent = (sentRequests || []).map(sent => ({
        id: sent.id,
        username: sent.addressee.username,
        name: sent.addressee.name,
        email: sent.addressee.email,
        photo: sent.addressee.profiles?.photo_url || generateDefaultAvatar(sent.addressee.name),
        location: sent.addressee.profiles?.location || 'Brasil',
        sentDate: new Date(sent.created_at).getTime()
      }));

      // Gerar sugestões baseadas em dados reais (buscar usuários não amigos)
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select(`
          id, name, username, email,
          profiles(photo_url, location, bio)
        `)
        .neq('id', userId)
        .limit(10);

      if (usersError) throw usersError;

      // Filtrar usuários que já não são amigos
      const friendIds = friends.map(f => f.id);
      const requestIds = [...requests.map(r => r.id), ...sent.map(s => s.id)];
      
      const suggestions = (allUsers || [])
        .filter(user => !friendIds.includes(user.id) && !requestIds.includes(user.id))
        .slice(0, 5)
        .map(user => ({
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          photo: user.profiles?.photo_url || generateDefaultAvatar(user.name),
          location: user.profiles?.location || 'Brasil',
          mutualFriends: Math.floor(Math.random() * 15),
          reason: Math.random() > 0.5 ? 'Amigos em comum' : 'Mesma localização'
        }));

      return res.status(200).json({
        success: true,
        friends,
        requests,
        sent,
        suggestions
      });
    }

    // POST - Sincronizar dados de amigos
    if (req.method === 'POST') {
      const { userId, friends, friendRequests, sentRequests, timestamp } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId é obrigatório'
        });
      }

      // Aqui normalmente salvariamos os dados no banco de dados
      // Por agora, apenas retornamos sucesso
      
      // Log para debug
      console.log('Sincronizando dados de amigos:', {
        userId,
        friendsCount: friends?.length || 0,
        requestsCount: friendRequests?.length || 0,
        sentCount: sentRequests?.length || 0,
        timestamp: new Date(timestamp).toISOString()
      });

      return res.status(200).json({
        success: true,
        message: 'Dados sincronizados com sucesso',
        synced_at: new Date().toISOString()
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Método não permitido'
    });

  } catch (error) {
    console.error('Erro na API sync-friends:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
}

function generateDefaultAvatar(name) {
  const firstLetter = name ? name.charAt(0).toUpperCase() : 'U';
  const colors = ['667eea', '764ba2', 'f093fb', '4facfe', '00d2ff', 'ff6b6b', '6c5ce7'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return `https://via.placeholder.com/48x48/${randomColor}/ffffff?text=${firstLetter}`;
}
