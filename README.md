# Orkut2025

Rede social estática com scripts centrais em JavaScript que usam localStorage e sincronizam com um backend Node.js/Express e PostgreSQL (Supabase). Agora com controle por voz (Web Speech API).

## Status
- Produção (MVP):
  - Páginas estáticas (Início, Feed, Perfil, Configurações)
  - Cache local (localStorage)
  - Sincronização via API: POST /api/sync (Express + pg)
  - Esquema mínimo no Postgres (users, profiles, statuses)
  - Controle por voz (abrir perfil, postar, ligar – simulado)
- Em desenvolvimento (Futuras):
  - Confirmação de comandos por voz ("você quis dizer…?")
  - Ampliação do parser de voz (mais variações/intenções)
  - Listagem do feed a partir do banco (GET) e paginação
  - Autenticação leve (token por usuário simples)
  - Notificações no cliente (toasts/unread)

## Como rodar
- Requisitos: Node.js 18+
- Instalar deps: `npm install`
- Configurar variáveis de ambiente: copie `.env.example` para `.env` e preencha `DATABASE_URL` (com `sslmode=require` para Supabase) e `PORT`.
- Iniciar: `npm run dev` (ou `npm start`)
- Acessar: http://localhost:3000

Exemplo (PowerShell - Windows):
```
$env:DATABASE_URL="postgresql://usuario:{{SENHA}}@host:5432/postgres?sslmode=require"
$env:PORT="3000"
node server/index.js
```
Observação: nunca exponha senhas/segredos em arquivos versionados.

## Comandos de Voz (pt-BR)
- "abrir perfil de Fulano" → redireciona para `/profile.html?user=Fulano`
- "poste no perfil de Fulano, festa sexta às 22:00" → cria post no feed e sincroniza
- "ligue para Fulano" → abre modal de ligação simulado (frontend)

Compatibilidade: Web Speech API funciona melhor no Chrome/Edge modernos.

## Estrutura
- `public/` – arquivos estáticos
  - `index.html`, `feed.html`, `profile.html`, `settings.html`
  - `css/styles.css`
  - `js/api.js` (fetch JSON), `js/app.js` (localStorage + sync), `js/voice.js` (voz)
- `server/` – backend Express
  - `index.js` (server + estáticos)
  - `routes/sync.js` (POST /api/sync com pg Pool)
  - `schema.sql` (tabelas mínimas)

## Banco de Dados
Execute `server/schema.sql` no Postgres:
```
CREATE TABLE IF NOT EXISTS users (id text PRIMARY KEY);
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
```
A API atual insere/atualiza perfis e cria status. A leitura do feed a partir do banco virá nas próximas versões.

## Segurança
- Não commitamos `.env` (listado no `.gitignore`).
- Conexão ao Postgres via `DATABASE_URL` (env). Para Supabase, use `sslmode=require`.
- Dados do navegador permanecem em `localStorage` até sincronizar com o backend.

## Roadmap (Futuras)
- [ ] Confirmar comandos por voz antes de executar
- [ ] Suporte a mais intenções (apagar post, editar bio, navegar para comunidades)
- [ ] API de leitura do feed e do perfil (GET)
- [ ] Autenticação e autorização básicas
- [ ] Telemetria de erros do cliente (opt-in)
- [ ] Melhorias de acessibilidade e i18n

## Contribuição
- Branch de feature: `git checkout -b feat/nome`
- Commit sem segredos e com mensagem clara
- Pull Request com resumo do que mudou

## Licença
MIT
