-- Tabelas mínimas para sincronização
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id text PRIMARY KEY REFERENCES users(id),
  name text,
  bio text,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS statuses (
  id bigserial PRIMARY KEY,
  user_id text REFERENCES users(id),
  text text,
  created_at timestamptz DEFAULT now()
);

-- Logs de testes/health do Orky
CREATE TABLE IF NOT EXISTS test_logs (
  id bigserial PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  test_type text NOT NULL,
  status text NOT NULL,
  details jsonb
);

