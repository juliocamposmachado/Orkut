-- Adicionar campos de música do perfil à tabela de usuários
-- Execute este script no Supabase ou na sua instância PostgreSQL

-- Campos para armazenar a música do perfil do usuário
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_music_spotify_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS profile_music_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS profile_music_artist VARCHAR(255),
ADD COLUMN IF NOT EXISTS profile_music_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS profile_music_preview_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS profile_music_updated_at TIMESTAMP WITH TIME ZONE;

-- Comentários para documentação
COMMENT ON COLUMN users.profile_music_spotify_id IS 'ID da música do Spotify definida no perfil do usuário';
COMMENT ON COLUMN users.profile_music_name IS 'Nome da música do perfil';
COMMENT ON COLUMN users.profile_music_artist IS 'Artista da música do perfil';
COMMENT ON COLUMN users.profile_music_url IS 'URL da música no Spotify';
COMMENT ON COLUMN users.profile_music_preview_url IS 'URL do preview de 30 segundos da música';
COMMENT ON COLUMN users.profile_music_updated_at IS 'Data da última atualização da música do perfil';

-- Índice para melhorar performance das consultas por música
CREATE INDEX IF NOT EXISTS idx_users_profile_music_spotify_id ON users(profile_music_spotify_id);

-- Verificar se os campos foram adicionados corretamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name LIKE 'profile_music%'
ORDER BY ordinal_position;
