const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Configurações de conexão
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/orkut';

// Classe para gerenciar o banco de dados PostgreSQL
class PostgreSQLDatabase {
  constructor() {
    this.pool = null;
  }

  // Inicializar pool de conexões
  async init() {
    try {
      this.pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20, // máximo de conexões no pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Testar conexão
      const client = await this.pool.connect();
      console.log('Conectado ao banco de dados PostgreSQL (Supabase)');
      client.release();

      // Criar tabelas
      await this.createTables();
      
    } catch (error) {
      console.error('Erro ao conectar com o banco de dados:', error);
      throw error;
    }
  }

  // Criar tabelas do banco de dados
  async createTables() {
    const queries = [
      // Extensão para UUIDs
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

      // Tabela de usuários
      `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabela de perfis
      `CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        photo_url TEXT,
        status TEXT DEFAULT 'Novo no Orkut Retrô! 🎉',
        age INTEGER,
        location VARCHAR(255),
        relationship_status VARCHAR(100),
        birthday DATE,
        bio TEXT,
        profile_views INTEGER DEFAULT 0,
        join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Tabela de amizades
      `CREATE TABLE IF NOT EXISTS friendships (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        requester_id UUID NOT NULL,
        addressee_id UUID NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (requester_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (addressee_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(requester_id, addressee_id)
      )`,

      // Tabela de scraps/recados
      `CREATE TABLE IF NOT EXISTS scraps (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        from_user_id UUID NOT NULL,
        to_user_id UUID NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_public BOOLEAN DEFAULT true,
        FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (to_user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Tabela de comunidades
      `CREATE TABLE IF NOT EXISTS communities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        creator_id UUID NOT NULL,
        image_url TEXT,
        members_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Tabela de membros de comunidades
      `CREATE TABLE IF NOT EXISTS community_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        community_id UUID NOT NULL,
        user_id UUID NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'admin', 'moderator')),
        FOREIGN KEY (community_id) REFERENCES communities (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(community_id, user_id)
      )`,

      // Tabela de posts/feed
      `CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        content TEXT NOT NULL,
        post_type VARCHAR(20) DEFAULT 'status' CHECK (post_type IN ('status', 'photo', 'community_post')),
        community_id UUID,
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (community_id) REFERENCES communities (id) ON DELETE CASCADE
      )`,

      // Tabela de curtidas
      `CREATE TABLE IF NOT EXISTS likes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        post_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
        UNIQUE(user_id, post_id)
      )`,

      // Tabela de comentários
      `CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        post_id UUID NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
      )`,

      // Tabela de mensagens privadas
      `CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        from_user_id UUID NOT NULL,
        to_user_id UUID NOT NULL,
        subject VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (to_user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Tabela de uploads/arquivos
      `CREATE TABLE IF NOT EXISTS uploads (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        stored_filename VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        file_size INTEGER NOT NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Índices para melhor performance
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`,
      `CREATE INDEX IF NOT EXISTS idx_users_username ON users (username)`,
      `CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles (user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships (requester_id)`,
      `CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships (addressee_id)`,
      `CREATE INDEX IF NOT EXISTS idx_scraps_to_user ON scraps (to_user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_scraps_from_user ON scraps (from_user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts (user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_messages_to_user ON messages (to_user_id)`
    ];

    // Executar todas as queries
    for (const query of queries) {
      await this.query(query);
    }

    console.log('Tabelas PostgreSQL criadas com sucesso');
  }

  // Executar query
  async query(text, params = []) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('Erro na query:', error, 'Query:', text);
      throw error;
    } finally {
      client.release();
    }
  }

  // Buscar uma linha
  async get(query, params = []) {
    const result = await this.query(query, params);
    return result.rows[0] || null;
  }

  // Buscar múltiplas linhas
  async all(query, params = []) {
    const result = await this.query(query, params);
    return result.rows;
  }

  // Executar query sem retorno (INSERT/UPDATE/DELETE)
  async run(query, params = []) {
    const result = await this.query(query, params);
    return {
      rowCount: result.rowCount,
      rows: result.rows
    };
  }

  // Fechar pool de conexões
  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('Pool de conexões PostgreSQL fechado');
    }
  }

  // Gerar ID único (UUID)
  generateId() {
    return uuidv4();
  }

  // Backup do banco de dados
  async backup() {
    // Para PostgreSQL/Supabase, o backup seria feito via pg_dump
    // ou através do painel do Supabase
    console.log('Backup do PostgreSQL deve ser feito via Supabase Dashboard ou pg_dump');
    return null;
  }

  // Função para migrar dados do SQLite para PostgreSQL
  async migrateFromSQLite(sqliteDbPath) {
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    
    return new Promise((resolve, reject) => {
      const sqliteDb = new sqlite3.Database(sqliteDbPath, async (err) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          // Migrar usuários
          console.log('Migrando usuários...');
          sqliteDb.all('SELECT * FROM users', async (err, users) => {
            if (err) {
              reject(err);
              return;
            }

            for (const user of users) {
              await this.run(
                'INSERT INTO users (id, name, email, password_hash, username, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
                [user.id, user.name, user.email, user.password_hash, user.username, user.created_at, user.updated_at]
              );
            }
          });

          // Migrar perfis
          console.log('Migrando perfis...');
          sqliteDb.all('SELECT * FROM profiles', async (err, profiles) => {
            if (err) {
              reject(err);
              return;
            }

            for (const profile of profiles) {
              await this.run(
                `INSERT INTO profiles (id, user_id, photo_url, status, age, location, relationship_status, 
                 birthday, bio, profile_views, join_date, last_active) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (id) DO NOTHING`,
                [profile.id, profile.user_id, profile.photo_url, profile.status, profile.age, 
                 profile.location, profile.relationship_status, profile.birthday, profile.bio,
                 profile.profile_views, profile.join_date, profile.last_active]
              );
            }
          });

          console.log('Migração concluída!');
          sqliteDb.close();
          resolve(true);

        } catch (error) {
          reject(error);
        }
      });
    });
  }
}

// Instância singleton do banco
let dbInstance = null;

// Função para obter instância do banco
async function getDatabase() {
  if (!dbInstance) {
    dbInstance = new PostgreSQLDatabase();
    await dbInstance.init();
  }
  return dbInstance;
}

module.exports = {
  getDatabase,
  PostgreSQLDatabase
};
