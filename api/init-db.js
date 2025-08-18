const bcrypt = require('bcryptjs');
const { getDatabase } = require('./database');

// Função para inicializar o banco com dados de exemplo
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const db = await getDatabase();

    // Verificar se já existem dados
    const existingUsers = await db.get('SELECT COUNT(*) as count FROM users');
    if (existingUsers.count > 0) {
      return res.status(400).json({ 
        error: 'Banco de dados já inicializado',
        message: 'Use este endpoint apenas para inicialização inicial'
      });
    }

    // Usuários de exemplo
    const sampleUsers = [
      {
        name: 'Ana Silva',
        email: 'ana@orkut.com',
        username: 'ana_silva',
        status: 'Revivendo os anos 2000! 💜',
        age: 28,
        location: 'São Paulo, SP',
        relationship: 'solteira',
        bio: 'Apaixonada por nostalgia e tecnologia!'
      },
      {
        name: 'Carlos Santos',
        email: 'carlos@orkut.com',
        username: 'carlos_santos',
        status: 'Que nostalgia estar aqui no Orkut novamente! 😄',
        age: 32,
        location: 'Rio de Janeiro, RJ',
        relationship: 'casado',
        bio: 'Desenvolvedor e fã dos anos 2000'
      },
      {
        name: 'Maria Oliveira',
        email: 'maria@orkut.com',
        username: 'maria_oliveira',
        status: 'Orkut foi onde conheci meus melhores amigos! 🥺❤️',
        age: 29,
        location: 'Belo Horizonte, MG',
        relationship: 'namorando',
        bio: 'Designer gráfica e nostálgica'
      },
      {
        name: 'João Silva',
        email: 'joao@orkut.com',
        username: 'joao_silva',
        status: 'Lembra quando passávamos horas customizando perfis? 😄',
        age: 35,
        location: 'Salvador, BA',
        relationship: 'solteiro',
        bio: 'Professor de história e colecionador de memórias'
      },
      {
        name: 'Paula Costa',
        email: 'paula@orkut.com',
        username: 'paula_costa',
        status: 'MSN e Orkut... que tempos! 💜',
        age: 26,
        location: 'Fortaleza, CE',
        relationship: 'solteira',
        bio: 'Jornalista apaixonada pelos anos 2000'
      }
    ];

    const password = 'orkut123'; // Senha padrão para todos os usuários de teste
    const passwordHash = await bcrypt.hash(password, 12);

    const userIds = [];

    // Inserir usuários
    for (const user of sampleUsers) {
      const userId = db.generateId();
      userIds.push(userId);

      await db.run(`
        INSERT INTO users (id, name, email, password_hash, username)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, user.name, user.email, passwordHash, user.username]);

      // Criar perfil
      const profileId = db.generateId();
      const photoUrl = generateAvatar(user.name);

      await db.run(`
        INSERT INTO profiles (
          id, user_id, photo_url, status, age, location, 
          relationship_status, bio, profile_views
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        profileId, userId, photoUrl, user.status, user.age,
        user.location, user.relationship, user.bio, Math.floor(Math.random() * 100) + 10
      ]);
    }

    // Criar algumas amizades
    const friendships = [
      [0, 1], // Ana <-> Carlos
      [0, 2], // Ana <-> Maria
      [1, 3], // Carlos <-> João
      [2, 4], // Maria <-> Paula
      [0, 4]  // Ana <-> Paula
    ];

    for (const [i, j] of friendships) {
      const friendshipId = db.generateId();
      await db.run(`
        INSERT INTO friendships (id, requester_id, addressee_id, status)
        VALUES (?, ?, ?, 'accepted')
      `, [friendshipId, userIds[i], userIds[j]]);
    }

    // Criar alguns scraps
    const scraps = [
      {
        from: 1, to: 0,
        content: 'Que saudades dos anos 2000! Adorei seu perfil retrô! 😍'
      },
      {
        from: 2, to: 0,
        content: 'Oiee! Vamos ser amigas? Tenho certeza que vamos nos dar super bem! 💕'
      },
      {
        from: 3, to: 0,
        content: 'E aí! Como está sendo essa volta ao passado? Orkut era demais mesmo! 😄'
      }
    ];

    for (const scrap of scraps) {
      const scrapId = db.generateId();
      await db.run(`
        INSERT INTO scraps (id, from_user_id, to_user_id, content, is_public)
        VALUES (?, ?, ?, ?, 1)
      `, [scrapId, userIds[scrap.from], userIds[scrap.to], scrap.content]);
    }

    // Criar comunidades de exemplo
    const communities = [
      {
        name: 'Nostalgia dos Anos 2000',
        description: 'Para quem sente saudades dos anos 2000! Músicas, filmes, moda e lembranças.',
        category: 'nostalgia',
        creator: 0
      },
      {
        name: 'Orkut Memories',
        description: 'Relembrando os bons tempos do Orkut original.',
        category: 'tecnologia',
        creator: 1
      },
      {
        name: 'Pop Rock Nacional',
        description: 'As melhores bandas de pop rock do Brasil.',
        category: 'música',
        creator: 2
      }
    ];

    for (const community of communities) {
      const communityId = db.generateId();
      const imageUrl = 'https://via.placeholder.com/100x100/a855c7/ffffff?text=C';

      await db.run(`
        INSERT INTO communities (id, name, description, category, creator_id, image_url, members_count)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        communityId, community.name, community.description, 
        community.category, userIds[community.creator], imageUrl, Math.floor(Math.random() * 2000) + 100
      ]);

      // Adicionar criador como membro
      const memberId = db.generateId();
      await db.run(`
        INSERT INTO community_members (id, community_id, user_id, role)
        VALUES (?, ?, ?, 'admin')
      `, [memberId, communityId, userIds[community.creator]]);
    }

    // Criar alguns posts para o feed
    const posts = [
      {
        user: 0,
        content: 'Acabei de me cadastrar no Orkut Retrô! Que nostalgia! 💜'
      },
      {
        user: 1,
        content: 'Alguém mais sente falta dos tempos do MSN? 😢'
      },
      {
        user: 2,
        content: 'Criando uma playlist com hits dos anos 2000! Sugestões?'
      }
    ];

    for (const post of posts) {
      const postId = db.generateId();
      await db.run(`
        INSERT INTO posts (id, user_id, content, post_type, likes_count, comments_count)
        VALUES (?, ?, ?, 'status', ?, ?)
      `, [
        postId, userIds[post.user], post.content, 
        Math.floor(Math.random() * 20), Math.floor(Math.random() * 5)
      ]);
    }

    res.status(200).json({
      success: true,
      message: 'Banco de dados inicializado com sucesso!',
      data: {
        users: sampleUsers.length,
        friendships: friendships.length,
        scraps: scraps.length,
        communities: communities.length,
        posts: posts.length,
        defaultPassword: password,
        note: 'Use email e senha "orkut123" para fazer login com qualquer usuário de exemplo'
      }
    });

  } catch (error) {
    console.error('Erro ao inicializar banco:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
}

function generateAvatar(name) {
  const firstLetter = name.charAt(0).toUpperCase();
  const colors = ['a855c7', '28a745', 'ff6bb3', '5bc0de', 'ffc107', 'dc3545', '6f42c1', 'fd7e14', 'e83e8c', '20c997'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return `https://via.placeholder.com/150x150/${randomColor}/ffffff?text=${firstLetter}`;
}
