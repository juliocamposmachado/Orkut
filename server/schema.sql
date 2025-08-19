-- Schema para compatibilidade com banco Supabase existente
-- Este script verifica e cria apenas tabelas que não existem

-- Extensão para UUID (caso não exista)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabelas já existem no Supabase, apenas verificar/criar faltantes

-- Logs de testes do Orky (nossa adição)
CREATE TABLE IF NOT EXISTS test_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  test_type varchar NOT NULL,
  status varchar NOT NULL,
  details jsonb
);

-- Índices para logs de teste
CREATE INDEX IF NOT EXISTS idx_test_logs_created_at ON test_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_logs_type ON test_logs(test_type);

-- View para estatísticas rápidas (opcional)
CREATE OR REPLACE VIEW stats_overview AS
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM posts) as total_posts,
  (SELECT COUNT(*) FROM communities) as total_communities,
  (SELECT COUNT(*) FROM messages) as total_messages,
  (SELECT COUNT(*) FROM test_logs WHERE created_at > NOW() - INTERVAL '24 hours') as tests_last_24h;

