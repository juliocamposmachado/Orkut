// Script de População do Banco - Orkut 2025
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do banco (usando URL que funciona)
const pool = new Pool({
  connectionString: 'postgresql://postgres:julio78451200@db.ksskokjrdzqghhuahjpl.supabase.co:5432/postgres',
  ssl: false
});

// Dados dos usuários demo
const demoUsers = [
  {
    id: 'julio-campos-machado',
    username: 'juliocamposmachado',
    email: 'julio@orkut2025.com',
    name: 'Julio Campos Machado',
    password: 'orkut2025',
    profile: {
      bio: 'Criador do novo Orkut! Desenvolvedor apaixonado por nostalgia e código. Trazendo de volta a era dourada das redes sociais com IA! 💜',
      status: 'Criador do novo Orkut! 💜',
      location: 'Brasil',
      photo_url: '/images/orkutblack.png',
      website: 'https://orkut2025.vercel.app'
    }
  },
  {
    id: 'ana-silva-demo',
    username: 'anasilva',
    email: 'ana@orkut2025.com',
    name: 'Ana Silva',
    password: 'orkut123',
    profile: {
      bio: 'Designer UX/UI nostálgica dos anos 2000. Adoro criar interfaces que remetem à era dourada da internet! ✨',
      status: 'Saudades do Orkut original! 🌟',
      location: 'São Paulo, SP',
      photo_url: '/images/orkutblack.png'
    }
  },
  {
    id: 'carlos-santos-demo',
    username: 'carlossantos',
    email: 'carlos@orkut2025.com',
    name: 'Carlos Santos',
    password: 'teste123',
    profile: {
      bio: 'QA Tester profissional e caçador de bugs. Especialista em encontrar problemas que ninguém mais vê! 🐛',
      status: 'Testando o novo Orkut! 🚀',
      location: 'Rio de Janeiro, RJ',
      photo_url: '/images/orkutblack.png'
    }
  },
  {
    id: 'maria-oliveira-demo',
    username: 'mariaoliveira',
    email: 'maria@orkut2025.com',
    name: 'Maria Oliveira',
    password: 'social123',
    profile: {
      bio: 'Community Manager apaixonada por redes sociais retrô. Especialista em engajamento e nostalgia! 📸',
      status: 'Que saudade dessa época! 💫',
      location: 'Belo Horizonte, MG',
      photo_url: '/images/orkutblack.png'
    }
  },
  {
    id: 'pedro-costa-demo',
    username: 'pedrocosta',
    email: 'pedro@orkut2025.com',
    name: 'Pedro Costa',
    password: 'fullstack123',
    profile: {
      bio: 'Full Stack Developer e nostálgico profissional. Desenvolvendo o futuro com a cara do passado! ⚡',
      status: 'Back to the 2000s! ⚡',
      location: 'Porto Alegre, RS',
      photo_url: '/images/orkutblack.png'
    }
  },
  // NPCs da IA
  {
    id: 'ana-nostalgia-npc',
    username: 'anaNostalgia',
    email: 'ana.nostalgia@orkut2025.com',
    name: 'Ana Nostalgia',
    password: 'npc2000',
    profile: {
      bio: '🎵 Apaixonada pelos anos 2000! Escuto Evanescence, Linkin Park e sonho com a era dourada da internet! Orkut forever! 💜',
      status: 'Listening to My Immortal 🎵',
      location: 'Na vibe dos 2000s',
      photo_url: '/images/orkutblack.png',
      is_npc: true
    }
  },
  {
    id: 'joao-gamer-npc',
    username: 'joaoGamer',
    email: 'joao.gamer@orkut2025.com',
    name: 'João Gamer',
    password: 'gamer2000',
    profile: {
      bio: '🎮 Gamer retrô especialista! Jogava GTA Vice City, Need for Speed e passava horas no MSN. Those were the days! 🕹️',
      status: 'Playing classic games 🎮',
      location: 'Arcade dos anos 2000',
      photo_url: '/images/orkutblack.png',
      is_npc: true
    }
  },
  {
    id: 'maria-conecta-npc',
    username: 'mariaConecta',
    email: 'maria.conecta@orkut2025.com',
    name: 'Maria Conecta',
    password: 'social2000',
    profile: {
      bio: '📸 Super sociável e conectada! Adoro fazer novos amigos e reviver a magia dos scraps e depoimentos! Let\'s connect! 🌟',
      status: 'Connecting people 📸',
      location: 'Everywhere!',
      photo_url: '/images/orkutblack.png',
      is_npc: true
    }
  }
];

// Posts iniciais
const demoPosts = [
  {
    user_id: 'julio-campos-machado',
    content: 'Bem-vindos ao novo Orkut! 🎉 Depois de anos de saudade, trouxe de volta nossa rede social favorita dos anos 2000, agora com o poder da IA! Que comecem as conexões nostálgicas! 💜 #OrkutIsBack #Nostalgia',
    type: 'status'
  },
  {
    user_id: 'ana-silva-demo',
    content: 'Gente, que alegria estar aqui de novo! 😍 Já estou sentindo aquela vibe gostosa do Orkut original. Quem mais está morrendo de saudade dos scraps e depoimentos? 🥺✨',
    type: 'status'
  },
  {
    user_id: 'carlos-santos-demo',
    content: 'Testando, testando... 1, 2, 3! 🎙️ Como QA, posso dizer: este novo Orkut está incrível! A nostalgia bateu forte aqui. Parabéns ao Julio pela iniciativa! 🚀',
    type: 'status'
  },
  {
    user_id: 'maria-oliveira-demo',
    content: 'Que feeling mais gostoso! 💫 Lembro quando passávamos horas personalizando o perfil e escolhendo as músicas. Alguém mais lembra dos temas coloridos? #ThrowbackThursday',
    type: 'status'
  },
  {
    user_id: 'pedro-costa-demo',
    content: 'Do ponto de vista técnico, este projeto está show! ⚡ Banco PostgreSQL, IA integrada, interface nostálgica... É o futuro encontrando o passado de forma linda! 👨‍💻',
    type: 'status'
  },
  // Posts dos NPCs
  {
    user_id: 'ana-nostalgia-npc',
    content: 'Acabei de colocar "Bring Me To Life" do Evanescence para tocar! 🎵 Alguém mais aqui é da época que ficava horas no Orkut ouvindo rock alternativo? Amy Lee forever! 🖤✨',
    type: 'status'
  },
  {
    user_id: 'joao-gamer-npc',
    content: 'Quem aqui jogava GTA Vice City em 2002? 🎮 Que saudade daquela trilha sonora! "I ran so far away..." 🎵 Os anos 2000 foram épicos para os games! #RetroGaming',
    type: 'status'
  },
  {
    user_id: 'maria-conecta-npc',
    content: 'Oi pessoal! 📸 Que alegria ver todo mundo aqui de novo! Já adicionei vocês como amigos, espero que aceitem! Vamos fazer desta rede o lugar mais conectado da internet! 🌟💜',
    type: 'status'
  }
];

// Amizades iniciais (rede conectada)
const friendships = [
  // Julio amigo de todos
  { user_id: 'julio-campos-machado', friend_id: 'ana-silva-demo' },
  { user_id: 'julio-campos-machado', friend_id: 'carlos-santos-demo' },
  { user_id: 'julio-campos-machado', friend_id: 'maria-oliveira-demo' },
  { user_id: 'julio-campos-machado', friend_id: 'pedro-costa-demo' },
  
  // Amizades cruzadas
  { user_id: 'ana-silva-demo', friend_id: 'maria-oliveira-demo' },
  { user_id: 'carlos-santos-demo', friend_id: 'pedro-costa-demo' },
  { user_id: 'maria-oliveira-demo', friend_id: 'pedro-costa-demo' },
  
  // NPCs conectados
  { user_id: 'ana-nostalgia-npc', friend_id: 'julio-campos-machado' },
  { user_id: 'ana-nostalgia-npc', friend_id: 'ana-silva-demo' },
  { user_id: 'joao-gamer-npc', friend_id: 'carlos-santos-demo' },
  { user_id: 'joao-gamer-npc', friend_id: 'pedro-costa-demo' },
  { user_id: 'maria-conecta-npc', friend_id: 'maria-oliveira-demo' },
  { user_id: 'maria-conecta-npc', friend_id: 'ana-silva-demo' }
];

// Scraps iniciais
const scraps = [
  {
    sender_id: 'ana-silva-demo',
    receiver_id: 'julio-campos-machado',
    content: 'Julio, parabéns pelo projeto incrível! 🎉 Estou apaixonada pelo novo Orkut! A nostalgia está batendo forte aqui! 💜',
  },
  {
    sender_id: 'carlos-santos-demo',
    receiver_id: 'julio-campos-machado',
    content: 'Cara, como desenvolvedor, só tenho uma palavra: SHOW! 🚀 A integração com IA está perfeita! Parabéns!',
  },
  {
    sender_id: 'maria-conecta-npc',
    receiver_id: 'ana-silva-demo',
    content: 'Ana! 📸 Que alegria ter você aqui! Suas ideias de design são sempre incríveis! Vamos nos conectar mais! ✨',
  },
  {
    sender_id: 'ana-nostalgia-npc',
    receiver_id: 'maria-oliveira-demo',
    content: 'Maria! 🎵 Vi que você também ama os anos 2000! Temos muito em comum! Que tal trocarmos playlists nostálgicas? 😍',
  }
];

async function populateDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🗄️ POPULAÇÃO DO BANCO - ORKUT 2025');
    console.log('=======================================\n');
    
    await client.query('BEGIN');
    
    // 1. Limpar dados existentes (apenas demo)
    console.log('🧹 Limpando dados de demonstração...');
    await client.query('DELETE FROM scraps WHERE sender_id LIKE \'%-demo\' OR sender_id LIKE \'%-npc\'');
    await client.query('DELETE FROM friendships WHERE user_id LIKE \'%-demo\' OR user_id LIKE \'%-npc\'');
    await client.query('DELETE FROM likes WHERE user_id LIKE \'%-demo\' OR user_id LIKE \'%-npc\'');
    await client.query('DELETE FROM posts WHERE user_id LIKE \'%-demo\' OR user_id LIKE \'%-npc\'');
    await client.query('DELETE FROM profiles WHERE user_id LIKE \'%-demo\' OR user_id LIKE \'%-npc\'');
    await client.query('DELETE FROM users WHERE id LIKE \'%-demo\' OR id LIKE \'%-npc\'');
    
    // 2. Inserir usuários demo
    console.log('👥 Criando usuários demo...');
    for (const user of demoUsers) {
      const passwordHash = await bcrypt.hash(user.password, 12);
      
      // Inserir usuário
      await client.query(`
        INSERT INTO users (id, username, email, password_hash, name, created_at, updated_at, is_active)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), true)
      `, [user.id, user.username, user.email, passwordHash, user.name]);
      
      // Inserir perfil
      await client.query(`
        INSERT INTO profiles (user_id, bio, status, location, photo_url, website, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `, [
        user.id,
        user.profile.bio,
        user.profile.status,
        user.profile.location,
        user.profile.photo_url,
        user.profile.website || null
      ]);
      
      console.log(`   ✅ ${user.name} (@${user.username})`);
    }
    
    // 3. Criar amizades
    console.log('\n🤝 Criando rede de amizades...');
    for (const friendship of friendships) {
      // Amizade bidirecional
      await client.query(`
        INSERT INTO friendships (user_id, friend_id, status, created_at)
        VALUES ($1, $2, 'accepted', NOW())
        ON CONFLICT (user_id, friend_id) DO NOTHING
      `, [friendship.user_id, friendship.friend_id]);
      
      await client.query(`
        INSERT INTO friendships (friend_id, user_id, status, created_at)
        VALUES ($1, $2, 'accepted', NOW())
        ON CONFLICT (user_id, friend_id) DO NOTHING
      `, [friendship.user_id, friendship.friend_id]);
    }
    console.log(`   ✅ ${friendships.length} conexões criadas`);
    
    // 4. Criar posts iniciais
    console.log('\n📝 Criando posts iniciais...');
    for (const post of demoPosts) {
      const postId = 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      await client.query(`
        INSERT INTO posts (id, user_id, content, type, created_at, updated_at, is_active)
        VALUES ($1, $2, $3, $4, NOW(), NOW(), true)
      `, [postId, post.user_id, post.content, post.type]);
    }
    console.log(`   ✅ ${demoPosts.length} posts criados`);
    
    // 5. Criar scraps iniciais
    console.log('\n💬 Criando scraps iniciais...');
    for (const scrap of scraps) {
      const scrapId = 'scrap_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      await client.query(`
        INSERT INTO scraps (id, sender_id, receiver_id, content, created_at, is_active)
        VALUES ($1, $2, $3, $4, NOW(), true)
      `, [scrapId, scrap.sender_id, scrap.receiver_id, scrap.content]);
    }
    console.log(`   ✅ ${scraps.length} scraps criados`);
    
    // 6. Estatísticas finais
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE id LIKE '%-demo' OR id LIKE '%-npc') as users,
        (SELECT COUNT(*) FROM posts WHERE user_id LIKE '%-demo' OR user_id LIKE '%-npc') as posts,
        (SELECT COUNT(*) FROM friendships WHERE user_id LIKE '%-demo' OR user_id LIKE '%-npc') as friendships,
        (SELECT COUNT(*) FROM scraps WHERE sender_id LIKE '%-demo' OR sender_id LIKE '%-npc') as scraps
    `);
    
    await client.query('COMMIT');
    
    console.log('\n📊 POPULAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('===================================');
    console.log(`👥 Usuários demo: ${stats.rows[0].users}`);
    console.log(`📝 Posts iniciais: ${stats.rows[0].posts}`);
    console.log(`🤝 Amizades: ${Math.floor(stats.rows[0].friendships / 2)} conexões`);
    console.log(`💬 Scraps: ${stats.rows[0].scraps}`);
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. Testar login com: julio@orkut2025.com / senha: orkut2025');
    console.log('2. Verificar conexões de amizade funcionando');
    console.log('3. Confirmar que NPCs estão ativos no sistema');
    console.log('4. Testar criação de novos posts e scraps');
    
    console.log('\n🚀 BANCO POPULADO E PRONTO PARA USO!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na população:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  populateDatabase().catch(console.error);
}

module.exports = populateDatabase;
