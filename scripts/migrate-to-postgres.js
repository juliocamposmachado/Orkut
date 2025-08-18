const { Database } = require('../api/database'); // SQLite (antigo)
const { PostgreSQLDatabase } = require('../api/database-postgres'); // PostgreSQL (novo)
const path = require('path');

async function migrateData() {
  console.log('🔄 Iniciando migração de SQLite para PostgreSQL...');
  
  try {
    // Inicializar bancos
    const sqliteDb = new Database();
    const postgresDb = new PostgreSQLDatabase();
    
    await sqliteDb.init();
    await postgresDb.init();
    
    console.log('✅ Conexões estabelecidas com sucesso');
    
    // Migrar usuários
    console.log('📊 Migrando usuários...');
    const users = await sqliteDb.all('SELECT * FROM users');
    console.log(`Encontrados ${users.length} usuários`);
    
    for (const user of users) {
      try {
        await postgresDb.run(
          `INSERT INTO users (id, name, email, password_hash, username, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) 
           ON CONFLICT (id) DO NOTHING`,
          [user.id, user.name, user.email, user.password_hash, user.username, user.created_at, user.updated_at]
        );
      } catch (error) {
        console.error(`Erro ao migrar usuário ${user.email}:`, error.message);
      }
    }
    
    // Migrar perfis
    console.log('👤 Migrando perfis...');
    const profiles = await sqliteDb.all('SELECT * FROM profiles');
    console.log(`Encontrados ${profiles.length} perfis`);
    
    for (const profile of profiles) {
      try {
        await postgresDb.run(
          `INSERT INTO profiles (id, user_id, photo_url, status, age, location, relationship_status, 
           birthday, bio, profile_views, join_date, last_active) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
           ON CONFLICT (id) DO NOTHING`,
          [
            profile.id, profile.user_id, profile.photo_url, profile.status, profile.age,
            profile.location, profile.relationship_status, profile.birthday, profile.bio,
            profile.profile_views, profile.join_date, profile.last_active
          ]
        );
      } catch (error) {
        console.error(`Erro ao migrar perfil ${profile.id}:`, error.message);
      }
    }
    
    // Migrar amizades
    console.log('👥 Migrando amizades...');
    const friendships = await sqliteDb.all('SELECT * FROM friendships');
    console.log(`Encontradas ${friendships.length} amizades`);
    
    for (const friendship of friendships) {
      try {
        await postgresDb.run(
          `INSERT INTO friendships (id, requester_id, addressee_id, status, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           ON CONFLICT (id) DO NOTHING`,
          [friendship.id, friendship.requester_id, friendship.addressee_id, friendship.status, friendship.created_at, friendship.updated_at]
        );
      } catch (error) {
        console.error(`Erro ao migrar amizade ${friendship.id}:`, error.message);
      }
    }
    
    // Migrar scraps
    console.log('💬 Migrando scraps...');
    const scraps = await sqliteDb.all('SELECT * FROM scraps');
    console.log(`Encontrados ${scraps.length} scraps`);
    
    for (const scrap of scraps) {
      try {
        await postgresDb.run(
          `INSERT INTO scraps (id, from_user_id, to_user_id, content, created_at, is_public) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           ON CONFLICT (id) DO NOTHING`,
          [scrap.id, scrap.from_user_id, scrap.to_user_id, scrap.content, scrap.created_at, scrap.is_public]
        );
      } catch (error) {
        console.error(`Erro ao migrar scrap ${scrap.id}:`, error.message);
      }
    }
    
    // Migrar posts (se existirem)
    try {
      console.log('📝 Migrando posts...');
      const posts = await sqliteDb.all('SELECT * FROM posts');
      console.log(`Encontrados ${posts.length} posts`);
      
      for (const post of posts) {
        try {
          await postgresDb.run(
            `INSERT INTO posts (id, user_id, content, post_type, community_id, likes_count, comments_count, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             ON CONFLICT (id) DO NOTHING`,
            [post.id, post.user_id, post.content, post.post_type, post.community_id, post.likes_count, post.comments_count, post.created_at]
          );
        } catch (error) {
          console.error(`Erro ao migrar post ${post.id}:`, error.message);
        }
      }
    } catch (error) {
      console.log('⚠️  Tabela posts não encontrada, pulando...');
    }
    
    // Migrar mensagens (se existirem)
    try {
      console.log('📧 Migrando mensagens...');
      const messages = await sqliteDb.all('SELECT * FROM messages');
      console.log(`Encontradas ${messages.length} mensagens`);
      
      for (const message of messages) {
        try {
          await postgresDb.run(
            `INSERT INTO messages (id, from_user_id, to_user_id, subject, content, is_read, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             ON CONFLICT (id) DO NOTHING`,
            [message.id, message.from_user_id, message.to_user_id, message.subject, message.content, message.is_read, message.created_at]
          );
        } catch (error) {
          console.error(`Erro ao migrar mensagem ${message.id}:`, error.message);
        }
      }
    } catch (error) {
      console.log('⚠️  Tabela messages não encontrada, pulando...');
    }
    
    // Fechar conexões
    await sqliteDb.close();
    await postgresDb.close();
    
    console.log('🎉 Migração concluída com sucesso!');
    console.log('📋 Resumo:');
    console.log(`   • ${users.length} usuários migrados`);
    console.log(`   • ${profiles.length} perfis migrados`);
    console.log(`   • ${friendships.length} amizades migradas`);
    console.log(`   • ${scraps.length} scraps migrados`);
    
    console.log('\n⚠️  IMPORTANTE: Teste a aplicação antes de remover o banco SQLite!');
    console.log('💡 Você pode renomear o arquivo database.js para database-sqlite.js como backup.');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

// Executar migração se este arquivo for executado diretamente
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };
