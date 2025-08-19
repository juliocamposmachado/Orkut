-- =========================================
-- 🗄️ ORKUT RETRÔ - MIGRATIONS SCRIPT
-- =========================================
-- Sistema de migração de banco de dados
-- Controla atualizações de schema de forma segura
-- Data: 19 de Agosto de 2025
-- =========================================

-- Tabela para controle de versões de migração
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP DEFAULT NOW(),
    applied_by VARCHAR(100) DEFAULT 'system'
);

-- =========================================
-- MIGRATION v1.0.0 - Schema Inicial
-- =========================================

-- Verificar se a migração já foi aplicada
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM migrations WHERE version = '1.0.0') THEN
        -- Criar tabela de usuários
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            profile_photo VARCHAR(500),
            bio TEXT,
            location VARCHAR(100),
            website VARCHAR(255),
            birth_date DATE,
            gender VARCHAR(20),
            relationship_status VARCHAR(30),
            is_private BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            last_login TIMESTAMP
        );

        -- Criar tabela de posts
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            media_url VARCHAR(500),
            media_type VARCHAR(20),
            visibility VARCHAR(20) DEFAULT 'friends',
            likes_count INTEGER DEFAULT 0,
            comments_count INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

        -- Criar tabela de amizades
        CREATE TABLE IF NOT EXISTS friendships (
            id SERIAL PRIMARY KEY,
            requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            addressee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(requester_id, addressee_id)
        );

        -- Registrar migração
        INSERT INTO migrations (version, name) VALUES ('1.0.0', 'Schema inicial - usuarios, posts, amizades');
    END IF;
END $$;

-- =========================================
-- MIGRATION v1.1.0 - Comunidades
-- =========================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM migrations WHERE version = '1.1.0') THEN
        -- Criar tabela de comunidades
        CREATE TABLE IF NOT EXISTS communities (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            category VARCHAR(50),
            cover_photo VARCHAR(500),
            owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            members_count INTEGER DEFAULT 0,
            is_private BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

        -- Criar tabela de membros de comunidades
        CREATE TABLE IF NOT EXISTS community_members (
            id SERIAL PRIMARY KEY,
            community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            role VARCHAR(20) DEFAULT 'member',
            joined_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(community_id, user_id)
        );

        -- Registrar migração
        INSERT INTO migrations (version, name) VALUES ('1.1.0', 'Sistema de comunidades');
    END IF;
END $$;

-- =========================================
-- MIGRATION v1.2.0 - Sistema de Mensagens
-- =========================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM migrations WHERE version = '1.2.0') THEN
        -- Criar tabela de conversas
        CREATE TABLE IF NOT EXISTS conversations (
            id SERIAL PRIMARY KEY,
            participant_1 INTEGER REFERENCES users(id) ON DELETE CASCADE,
            participant_2 INTEGER REFERENCES users(id) ON DELETE CASCADE,
            last_message_at TIMESTAMP DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(participant_1, participant_2)
        );

        -- Criar tabela de mensagens
        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
            sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            message_type VARCHAR(20) DEFAULT 'text',
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW()
        );

        -- Criar tabela de scraps (recados)
        CREATE TABLE IF NOT EXISTS scraps (
            id SERIAL PRIMARY KEY,
            from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            is_public BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT NOW()
        );

        -- Registrar migração
        INSERT INTO migrations (version, name) VALUES ('1.2.0', 'Sistema de mensagens e scraps');
    END IF;
END $$;

-- =========================================
-- MIGRATION v1.3.0 - Integração Spotify
-- =========================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM migrations WHERE version = '1.3.0') THEN
        -- Adicionar campos musicais ao perfil do usuário
        ALTER TABLE users ADD COLUMN IF NOT EXISTS spotify_connected BOOLEAN DEFAULT FALSE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS spotify_user_id VARCHAR(100);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS spotify_access_token TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS spotify_refresh_token TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS spotify_token_expires_at TIMESTAMP;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_music_track_id VARCHAR(100);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_music_track_name VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_music_artist_name VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_music_preview_url VARCHAR(500);

        -- Criar tabela de atividade musical
        CREATE TABLE IF NOT EXISTS user_music_activity (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            track_id VARCHAR(100) NOT NULL,
            track_name VARCHAR(255) NOT NULL,
            artist_name VARCHAR(255) NOT NULL,
            album_name VARCHAR(255),
            preview_url VARCHAR(500),
            listened_at TIMESTAMP DEFAULT NOW()
        );

        -- Criar tabela de playlists compartilhadas
        CREATE TABLE IF NOT EXISTS shared_playlists (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            spotify_playlist_id VARCHAR(100) NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            cover_url VARCHAR(500),
            tracks_count INTEGER DEFAULT 0,
            is_public BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT NOW()
        );

        -- Registrar migração
        INSERT INTO migrations (version, name) VALUES ('1.3.0', 'Integração Spotify e sistema musical');
    END IF;
END $$;

-- =========================================
-- MIGRATION v1.4.0 - Sistema de IA
-- =========================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM migrations WHERE version = '1.4.0') THEN
        -- Criar tabela de logs de IA
        CREATE TABLE IF NOT EXISTS ai_logs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            operation_type VARCHAR(50) NOT NULL,
            operation_data JSONB,
            ai_response JSONB,
            status VARCHAR(20) DEFAULT 'pending',
            processing_time_ms INTEGER,
            created_at TIMESTAMP DEFAULT NOW()
        );

        -- Criar tabela de operações de sincronização
        CREATE TABLE IF NOT EXISTS sync_operations (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            operation_type VARCHAR(50) NOT NULL,
            local_data JSONB NOT NULL,
            sync_status VARCHAR(20) DEFAULT 'pending',
            error_message TEXT,
            retry_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW(),
            processed_at TIMESTAMP
        );

        -- Criar tabela de métricas de performance
        CREATE TABLE IF NOT EXISTS performance_metrics (
            id SERIAL PRIMARY KEY,
            metric_name VARCHAR(100) NOT NULL,
            metric_value DECIMAL(10, 3),
            metric_unit VARCHAR(20),
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            recorded_at TIMESTAMP DEFAULT NOW()
        );

        -- Registrar migração
        INSERT INTO migrations (version, name) VALUES ('1.4.0', 'Sistema de IA e métricas de performance');
    END IF;
END $$;

-- =========================================
-- MIGRATION v1.5.0 - Sistema de Notificações
-- =========================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM migrations WHERE version = '1.5.0') THEN
        -- Criar tabela de notificações
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT,
            related_id INTEGER,
            related_type VARCHAR(50),
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW()
        );

        -- Criar tabela de configurações de usuário
        CREATE TABLE IF NOT EXISTS user_settings (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
            email_notifications BOOLEAN DEFAULT TRUE,
            push_notifications BOOLEAN DEFAULT TRUE,
            music_auto_share BOOLEAN DEFAULT FALSE,
            privacy_level VARCHAR(20) DEFAULT 'friends',
            theme VARCHAR(20) DEFAULT 'retro-purple',
            language VARCHAR(10) DEFAULT 'pt-BR',
            timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

        -- Registrar migração
        INSERT INTO migrations (version, name) VALUES ('1.5.0', 'Sistema de notificações e configurações');
    END IF;
END $$;

-- =========================================
-- MIGRATION v1.6.0 - Sistema de Logs Interativo
-- =========================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM migrations WHERE version = '1.6.0') THEN
        -- Criar tabela de logs de atividade do usuário
        CREATE TABLE IF NOT EXISTS user_activity_logs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            action_type VARCHAR(50) NOT NULL,
            action_description TEXT,
            page_url VARCHAR(500),
            user_agent TEXT,
            ip_address INET,
            session_id VARCHAR(100),
            additional_data JSONB,
            created_at TIMESTAMP DEFAULT NOW()
        );

        -- Criar tabela de monitoramento de abas
        CREATE TABLE IF NOT EXISTS tab_activity (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            tab_url VARCHAR(500) NOT NULL,
            tab_title VARCHAR(500),
            activity_type VARCHAR(50),
            detected_content JSONB,
            started_at TIMESTAMP DEFAULT NOW(),
            ended_at TIMESTAMP
        );

        -- Registrar migração
        INSERT INTO migrations (version, name) VALUES ('1.6.0', 'Sistema de logs interativo e monitoramento de abas');
    END IF;
END $$;

-- =========================================
-- ÍNDICES PARA PERFORMANCE
-- =========================================

-- Índices para tabela users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Índices para tabela posts
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_active ON posts(is_active);

-- Índices para tabela friendships
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- Índices para tabela communities
CREATE INDEX IF NOT EXISTS idx_communities_owner ON communities(owner_id);
CREATE INDEX IF NOT EXISTS idx_communities_category ON communities(category);
CREATE INDEX IF NOT EXISTS idx_communities_active ON communities(is_active);

-- Índices para tabela messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Índices para tabela notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Índices para logs de atividade
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action ON user_activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);

-- =========================================
-- VIEWS PARA RELATÓRIOS
-- =========================================

-- View para estatísticas de usuários
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
    COUNT(*) FILTER (WHERE last_login >= NOW() - INTERVAL '7 days') as active_users_7d,
    COUNT(*) FILTER (WHERE spotify_connected = true) as spotify_connected_users
FROM users;

-- View para estatísticas de conteúdo
CREATE OR REPLACE VIEW content_stats AS
SELECT 
    (SELECT COUNT(*) FROM posts WHERE is_active = true) as total_posts,
    (SELECT COUNT(*) FROM communities WHERE is_active = true) as total_communities,
    (SELECT COUNT(*) FROM messages) as total_messages,
    (SELECT COUNT(*) FROM scraps) as total_scraps;

-- View para atividade recente
CREATE OR REPLACE VIEW recent_activity AS
SELECT 
    'post' as activity_type,
    id,
    user_id,
    content as description,
    created_at
FROM posts 
WHERE is_active = true AND created_at >= NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
    'community' as activity_type,
    id,
    owner_id as user_id,
    name as description,
    created_at
FROM communities 
WHERE is_active = true AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- =========================================
-- TRIGGERS PARA MANUTENÇÃO AUTOMÁTICA
-- =========================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas relevantes
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- FUNÇÃO PARA LIMPEZA DE DADOS ANTIGOS
-- =========================================

CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Limpar logs de atividade mais antigos que 90 dias
    DELETE FROM user_activity_logs WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Limpar métricas de performance mais antigas que 30 dias
    DELETE FROM performance_metrics WHERE recorded_at < NOW() - INTERVAL '30 days';
    
    -- Limpar tokens Spotify expirados há mais de 1 dia
    UPDATE users SET 
        spotify_access_token = NULL,
        spotify_refresh_token = NULL,
        spotify_token_expires_at = NULL
    WHERE spotify_token_expires_at < NOW() - INTERVAL '1 day';
    
    -- Log da limpeza
    INSERT INTO ai_logs (operation_type, operation_data, status) 
    VALUES ('cleanup', '{"type": "scheduled_cleanup", "timestamp": "' || NOW() || '"}', 'completed');
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- FUNÇÃO PARA BACKUP DE CONFIGURAÇÕES
-- =========================================

CREATE OR REPLACE FUNCTION backup_user_data(user_id_param INTEGER)
RETURNS jsonb AS $$
DECLARE
    user_backup jsonb;
BEGIN
    SELECT jsonb_build_object(
        'user_info', row_to_json(u.*),
        'settings', row_to_json(s.*),
        'posts_count', (SELECT COUNT(*) FROM posts WHERE user_id = user_id_param),
        'friends_count', (SELECT COUNT(*) FROM friendships WHERE (requester_id = user_id_param OR addressee_id = user_id_param) AND status = 'accepted'),
        'communities_count', (SELECT COUNT(*) FROM community_members WHERE user_id = user_id_param),
        'backup_date', NOW()
    ) INTO user_backup
    FROM users u
    LEFT JOIN user_settings s ON s.user_id = u.id
    WHERE u.id = user_id_param;
    
    RETURN user_backup;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- STATUS FINAL DA MIGRAÇÃO
-- =========================================

DO $$
DECLARE
    migration_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO migration_count FROM migrations;
    RAISE NOTICE '🎉 Migrações concluídas com sucesso! Total: % migrações aplicadas', migration_count;
    RAISE NOTICE '✅ Schema do Orkut Retrô está atualizado e pronto para uso!';
END $$;
