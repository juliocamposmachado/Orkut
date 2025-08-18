/**
 * 🎯 SCRIPT DE POPULAÇÃO DO BANCO
 * 
 * Este script popula o banco Supabase com usuários iniciais,
 * amizades e conteúdo para dar vida ao projeto.
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config();

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 👥 USUÁRIOS DEMO
const DEMO_USERS = [
  {
    name: "Julio Campos Machado",
    username: "juliocamposmachado",
    email: "julio@orkut2025.com",
    password: "123456",
    bio: "Desenvolvedor apaixonado por nostalgia e código",
    status: "Criador do novo Orkut! 💜",
    location: "São Paulo, SP",
    age: 28,
    is_admin: true
  },
  {
    name: "Ana Silva",
    username: "anasilva",
    email: "ana@orkut2025.com", 
    password: "123456",
    bio: "Designer UX/UI | Nostálgica dos anos 2000",
    status: "Saudades do Orkut original! 🌟",
    location: "Rio de Janeiro, RJ",
    age: 26
  },
  {
    name: "Carlos Santos",
    username: "carlossantos",
    email: "carlos@orkut2025.com",
    password: "123456", 
    bio: "QA Tester | Caçador de bugs",
    status: "Testando o novo Orkut! 🚀",
    location: "Belo Horizonte, MG",
    age: 30
  },
  {
    name: "Maria Oliveira", 
    username: "mariaoliveira",
    email: "maria@orkut2025.com",
    password: "123456",
    bio: "Community Manager | Lover das redes sociais retrô",
    status: "Que saudade dessa época! 💫",
    location: "Porto Alegre, RS", 
    age: 24
  },
  {
    name: "Pedro Costa",
    username: "pedrocosta", 
    email: "pedro@orkut2025.com",
    password: "123456",
    bio: "Full Stack Developer | Nostálgico profissional",
    status: "Back to the 2000s! ⚡",
    location: "Recife, PE",
    age: 27
  },
  {
    name: "Luiza Ferreira",
    username: "luizaferreira",
    email: "luiza@orkut2025.com",
    password: "123456",
    bio: "Product Manager | Amante de tecnologia retrô",
    status: "Saudades das comunidades! 🏠",
    location: "Brasília, DF",
    age: 29
  },
  {
    name: "Rafael Almeida",
    username: "rafaelalmeida", 
    email: "rafael@orkut2025.com",
    password: "123456",
    bio: "DevOps Engineer | Construindo pontes entre código e infraestrutura",
    status: "Deploy sem drama! 🔧",
    location: "Curitiba, PR",
    age: 31
  },
  {
    name: "Beatriz Lima",
    username: "beatrizlima",
    email: "beatriz@orkut2025.com", 
    password: "123456",
    bio: "Social Media Manager | Expert em viralizar conteúdo",
    status: "Vamos viralizar o novo Orkut! 📈",
    location: "Salvador, BA",
    age: 25
  }
];

// 💬 POSTS INICIAIS
const DEMO_POSTS = [
  {
    username: "juliocamposmachado",
    content: "🎉 O novo Orkut está no ar! Que saudades dessa vibe dos anos 2000. Vamos relembrar os bons tempos juntos! 💜",
    image_url: null
  },
  {
    username: "anasilva", 
    content: "Gente, que nostalgia! Já estou me sentindo em 2005 novamente. Quem mais sente falta dos scraps e das comunidades? 🌟",
    image_url: null
  },
  {
    username: "carlossantos",
    content: "Como QA, já estou testando tudo por aqui! Por enquanto está 10/10. Parabéns para a equipe! 🚀",
    image_url: null
  },
  {
    username: "mariaoliveira",
    content: "Community Manager aprovada! Já estou planejando as primeiras comunidades. Sugestões? 💫",
    image_url: null
  },
  {
    username: "pedrocosta", 
    content: "Stack moderna com vibe retrô = combinação perfeita! Parabéns pelo projeto incrível! ⚡",
    image_url: null
  },
  {
    username: "luizaferreira",
    content: "Como Product Manager, só posso dizer: produto sensacional! A experiência do usuário está incrível! 🏠",
    image_url: null
  },
  {
    username: "rafaelalmeida",
    content: "A infra está rodando liso! Vercel + Supabase = dupla perfeita para projetos modernos! 🔧",
    image_url: null
  },
  {
    username: "beatrizlima",
    content: "Isso vai viralizar! Já estou planejando a estratégia de crescimento. Let's go! 📈",
    image_url: null
  }
];

// 📝 SCRAPS INICIAIS
const DEMO_SCRAPS = [
  {
    from_username: "anasilva",
    to_username: "juliocamposmachado", 
    content: "Parabéns pelo lançamento, Julio! Projeto incrível! 🎉"
  },
  {
    from_username: "carlossantos",
    to_username: "juliocamposmachado",
    content: "Testando os scraps... funcionando perfeitamente! 🧪"
  },
  {
    from_username: "mariaoliveira", 
    to_username: "anasilva",
    content: "Ana, suas ideias de design estão sensacionais! 💜"
  },
  {
    from_username: "pedrocosta",
    to_username: "rafaelalmeida", 
    content: "Rafael, a infra está impecável! Parabéns! 🚀"
  },
  {
    from_username: "beatrizlima",
    to_username: "mariaoliveira",
    content: "Maria, vamos fazer parceria nas comunidades? 🤝"
  },
  {
    from_username: "luizaferreira", 
    to_username: "pedrocosta",
    content: "Pedro, adorei o código! Clean e bem estruturado! 👨‍💻"
  }
];

// 🤝 AMIZADES INICIAIS 
const DEMO_FRIENDSHIPS = [
  // Julio é amigo de todos (criador)
  { user1: "juliocamposmachado", user2: "anasilva" },
  { user1: "juliocamposmachado", user2: "carlossantos" },
  { user1: "juliocamposmachado", user2: "mariaoliveira" },
  { user1: "juliocamposmachado", user2: "pedrocosta" },
  { user1: "juliocamposmachado", user2: "luizaferreira" },
  { user1: "juliocamposmachado", user2: "rafaelalmeida" },
  { user1: "juliocamposmachado", user2: "beatrizlima" },
  
  // Conexões entre os outros usuários
  { user1: "anasilva", user2: "mariaoliveira" },
  { user1: "anasilva", user2: "beatrizlima" },
  { user1: "carlossantos", user2: "pedrocosta" },
  { user1: "carlossantos", user2: "rafaelalmeida" },
  { user1: "mariaoliveira", user2: "beatrizlima" },
  { user1: "mariaoliveira", user2: "luizaferreira" },
  { user1: "pedrocosta", user2: "rafaelalmeida" },
  { user1: "luizaferreira", user2: "beatrizlima" }
];

/**
 * 🔐 Função para hash da senha
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

/**
 * 👤 Criar usuários no banco
 */
async function createUsers() {
  console.log('📝 Criando usuários...');
  
  const createdUsers = [];
  
  for (const user of DEMO_USERS) {
    try {
      // Hash da senha
      const hashedPassword = await hashPassword(user.password);
      
      // Inserir usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          name: user.name,
          username: user.username, 
          email: user.email,
          password_hash: hashedPassword,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (userError) {
        console.error(`❌ Erro ao criar usuário ${user.username}:`, userError.message);
        continue;
      }
      
      // Inserir perfil  
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          user_id: userData.id,
          bio: user.bio,
          status: user.status,
          location: user.location,
          age: user.age,
          photo_url: '/images/orkutblack.png',
          profile_views: 0
        }]);
        
      if (profileError) {
        console.error(`❌ Erro ao criar perfil de ${user.username}:`, profileError.message);
        continue;
      }
      
      createdUsers.push({
        id: userData.id,
        username: user.username
      });
      
      console.log(`✅ Usuário ${user.username} criado com sucesso!`);
      
    } catch (error) {
      console.error(`❌ Erro geral ao criar ${user.username}:`, error.message);
    }
  }
  
  return createdUsers;
}

/**
 * 📝 Criar posts iniciais
 */
async function createPosts(users) {
  console.log('\n📝 Criando posts...');
  
  for (const post of DEMO_POSTS) {
    try {
      const user = users.find(u => u.username === post.username);
      if (!user) {
        console.error(`❌ Usuário ${post.username} não encontrado`);
        continue;
      }
      
      const { error } = await supabase
        .from('posts')
        .insert([{
          user_id: user.id,
          content: post.content,
          post_type: 'status',
          likes_count: 0,
          comments_count: 0,
          created_at: new Date().toISOString()
        }]);
        
      if (error) {
        console.error(`❌ Erro ao criar post de ${post.username}:`, error.message);
        continue;
      }
      
      console.log(`✅ Post de ${post.username} criado!`);
      
    } catch (error) {
      console.error(`❌ Erro geral ao criar post:`, error.message);
    }
  }
}

/**
 * 💬 Criar scraps iniciais
 */
async function createScraps(users) {
  console.log('\n💬 Criando scraps...');
  
  for (const scrap of DEMO_SCRAPS) {
    try {
      const fromUser = users.find(u => u.username === scrap.from_username);
      const toUser = users.find(u => u.username === scrap.to_username);
      
      if (!fromUser || !toUser) {
        console.error(`❌ Usuário não encontrado para scrap`);
        continue;
      }
      
      const { error } = await supabase
        .from('scraps')
        .insert([{
          from_user_id: fromUser.id,
          to_user_id: toUser.id, 
          content: scrap.content,
          created_at: new Date().toISOString()
        }]);
        
      if (error) {
        console.error(`❌ Erro ao criar scrap:`, error.message);
        continue;
      }
      
      console.log(`✅ Scrap de ${scrap.from_username} para ${scrap.to_username} criado!`);
      
    } catch (error) {
      console.error(`❌ Erro geral ao criar scrap:`, error.message);
    }
  }
}

/**
 * 🤝 Criar amizades iniciais
 */
async function createFriendships(users) {
  console.log('\n🤝 Criando amizades...');
  
  for (const friendship of DEMO_FRIENDSHIPS) {
    try {
      const user1 = users.find(u => u.username === friendship.user1);
      const user2 = users.find(u => u.username === friendship.user2);
      
      if (!user1 || !user2) {
        console.error(`❌ Usuários não encontrados para amizade`);
        continue;
      }
      
      const { error } = await supabase
        .from('friendships')
        .insert([{
          requester_id: user1.id,
          addressee_id: user2.id,
          status: 'accepted', // Todas as amizades já aceitas
          created_at: new Date().toISOString()
        }]);
        
      if (error) {
        console.error(`❌ Erro ao criar amizade:`, error.message);
        continue;
      }
      
      console.log(`✅ Amizade entre ${friendship.user1} e ${friendship.user2} criada!`);
      
    } catch (error) {
      console.error(`❌ Erro geral ao criar amizade:`, error.message);
    }
  }
}

/**
 * 🧹 Limpar dados existentes (CUIDADO!)
 */
async function clearExistingData() {
  console.log('⚠️  Limpando dados existentes...');
  
  try {
    // Buscar todos os registros e deletar usando SQL raw se necessário
    console.log('Deletando scraps...');
    const { data: scraps } = await supabase.from('scraps').select('id');
    if (scraps && scraps.length > 0) {
      await supabase.from('scraps').delete().in('id', scraps.map(s => s.id));
      console.log('✅ Scraps limpos');
    }
    
    console.log('Deletando posts...');
    const { data: posts } = await supabase.from('posts').select('id');
    if (posts && posts.length > 0) {
      await supabase.from('posts').delete().in('id', posts.map(p => p.id));
      console.log('✅ Posts limpos');
    }
    
    console.log('Deletando amizades...');
    const { data: friendships } = await supabase.from('friendships').select('id');
    if (friendships && friendships.length > 0) {
      await supabase.from('friendships').delete().in('id', friendships.map(f => f.id));
      console.log('✅ Friendships limpos');
    }
    
    console.log('Deletando perfis...');
    const { data: profiles } = await supabase.from('profiles').select('id');
    if (profiles && profiles.length > 0) {
      await supabase.from('profiles').delete().in('id', profiles.map(p => p.id));
      console.log('✅ Profiles limpos');
    }
    
    console.log('Deletando usuários...');
    const { data: users } = await supabase.from('users').select('id');
    if (users && users.length > 0) {
      await supabase.from('users').delete().in('id', users.map(u => u.id));
      console.log('✅ Users limpos');
    }
    
    console.log('\n✅ Limpeza concluída!');
    
    // Aguardar um pouco para garantir que a limpeza foi aplicada
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error.message);
  }
}

/**
 * 🚀 Função principal
 */
async function main() {
  console.log('🎯 INICIANDO POPULAÇÃO DO BANCO');
  console.log('================================\n');
  
  try {
    // Verificar conexão com Supabase
    const { data, error } = await supabase.from('users').select('count').single();
    if (error) {
      console.error('❌ Erro de conexão com Supabase:', error.message);
      return;
    }
    console.log('✅ Conectado ao Supabase com sucesso!\n');
    
    // Perguntar se quer limpar dados existentes
    const shouldClear = process.argv.includes('--clear');
    if (shouldClear) {
      await clearExistingData();
    }
    
    // Executar população
    const users = await createUsers();
    if (users.length === 0) {
      console.error('❌ Nenhum usuário foi criado. Abortando...');
      return;
    }
    
    await createPosts(users);
    await createScraps(users);  
    await createFriendships(users);
    
    console.log('\n🎉 POPULAÇÃO COMPLETA!');
    console.log('======================');
    console.log(`✅ ${users.length} usuários criados`);
    console.log(`✅ ${DEMO_POSTS.length} posts criados`);
    console.log(`✅ ${DEMO_SCRAPS.length} scraps criados`);
    console.log(`✅ ${DEMO_FRIENDSHIPS.length} amizades criadas`);
    console.log('\n🚀 O banco está populado e pronto para testes!');
    
  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };
