const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Caminho do banco de dados
const DB_PATH = path.join(process.cwd(), 'data', 'orkut.db');

// Classe para gerenciar o banco de dados
class Database {
  constructor() {
    this.db = null;
  }

  // Inicializar conexão com o banco
  async init() {
    return new Promise((resolve, reject) => {
      // Criar diretório se não existir
      const fs = require('fs');
      const dataDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('Erro ao conectar com o banco de dados:', err);
          reject(err);
        } else {
          console.log('Conectado ao banco de dados SQLite');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  // Criar tabelas do banco de dados
  async createTables() {
    const queries = [
      // Tabela de usuários
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabela de perfis
      `CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        photo_url TEXT,
        status TEXT DEFAULT 'Novo no Orkut Retrô! 🎉',
        age INTEGER,
        location TEXT,
        relationship_status TEXT,
        birthday DATE,
        bio TEXT,
        profile_views INTEGER DEFAULT 0,
        join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Tabela de amizades
      `CREATE TABLE IF NOT EXISTS friendships (
        id TEXT PRIMARY KEY,
        requester_id TEXT NOT NULL,
        addressee_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (requester_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (addressee_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(requester_id, addressee_id)
      )`,

      // Tabela de scraps/recados
      `CREATE TABLE IF NOT EXISTS scraps (
        id TEXT PRIMARY KEY,
        from_user_id TEXT NOT NULL,
        to_user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_public BOOLEAN DEFAULT 1,
        FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (to_user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Tabela de comunidades
      `CREATE TABLE IF NOT EXISTS communities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        creator_id TEXT NOT NULL,
        image_url TEXT,
        members_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Tabela de membros de comunidades
      `CREATE TABLE IF NOT EXISTS community_members (
        id TEXT PRIMARY KEY,
        community_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'moderator')),
        FOREIGN KEY (community_id) REFERENCES communities (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(community_id, user_id)
      )`,

      // Tabela de posts/feed
      `CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        post_type TEXT DEFAULT 'status' CHECK (post_type IN ('status', 'photo', 'community_post')),
        community_id TEXT,
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (community_id) REFERENCES communities (id) ON DELETE CASCADE
      )`,

      // Tabela de curtidas
      `CREATE TABLE IF NOT EXISTS likes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        post_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
        UNIQUE(user_id, post_id)
      )`,

      // Tabela de comentários
      `CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        post_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
      )`,

      // Tabela de mensagens privadas
      `CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        from_user_id TEXT NOT NULL,
        to_user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (to_user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Tabela de uploads/arquivos
      `CREATE TABLE IF NOT EXISTS uploads (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        stored_filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
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
      await this.run(query);
    }

    console.log('Tabelas criadas com sucesso');
  }

  // Executar query sem retorno
  run(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function(err) {
        if (err) {
          console.error('Erro na query:', err, 'Query:', query);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  // Buscar uma linha
  get(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) {
          console.error('Erro na query:', err, 'Query:', query);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Buscar múltiplas linhas
  all(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) {
          console.error('Erro na query:', err, 'Query:', query);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Fechar conexão
  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Conexão com banco de dados fechada');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  // Gerar ID único
  generateId() {
    return uuidv4();
  }

  // Backup do banco de dados
  async backup() {
    const fs = require('fs');
    const backupPath = path.join(process.cwd(), 'data', `backup_orkut_${Date.now()}.db`);
    
    return new Promise((resolve, reject) => {
      const source = fs.createReadStream(DB_PATH);
      const dest = fs.createWriteStream(backupPath);
      
      source.pipe(dest);
      
      dest.on('close', () => {
        console.log(`Backup criado em: ${backupPath}`);
        resolve(backupPath);
      });
      
      dest.on('error', reject);
      source.on('error', reject);
    });
  }
}

// Instância singleton do banco
let dbInstance = null;

// Função para obter instância do banco
async function getDatabase() {
  if (!dbInstance) {
    dbInstance = new Database();
    await dbInstance.init();
  }
  return dbInstance;
}

module.exports = {
  getDatabase,
  Database
};
