# 🌟 Orkut Retrô 2025

Recriação nostálgica da icônica rede social dos anos 2000, com funcionalidades modernas e integração com Spotify! Uma experiência completa que combina o melhor do Orkut original com tecnologias atuais.

## 🎯 Sobre o Projeto

O **Orkut Retrô** é uma aplicação web completa que recria a experiência original do Orkut com:
- 💜 Design nostálgico dos anos 2000 (tema roxo/rosa)
- 🤖 Sistema de IA integrado para população automática de dados
- 🎵 Integração completa com Spotify
- 📱 Interface responsiva e moderna
- 🗄️ Sistema de banco de dados robusto
- 🎤 Controle por voz (Web Speech API)

## ✅ Funcionalidades Implementadas

### 🏠 **Core do Sistema**
- ✅ **Sistema de Autenticação**: Login/registro com validação completa
- ✅ **Perfis de Usuário**: Criação, edição e visualização de perfis
- ✅ **Feed de Notícias**: Sistema completo de posts e interações
- ✅ **Sistema de Amigos**: Adicionar, remover e gerenciar amigos
- ✅ **Mensagens**: Sistema de mensagens privadas
- ✅ **Comunidades**: Criação e participação em comunidades

### 🤖 **Sistema de IA**
- ✅ **População Automática**: IA cria usuários, posts e comunidades automaticamente
- ✅ **SmartSave System**: Salvamento inteligente de dados
- ✅ **Integração com APIs**: Suporte para OpenAI, Anthropic, Google AI
- ✅ **Geração de Conteúdo**: Posts, comunidades e perfis gerados por IA

### 🎵 **Integração Spotify**
- ✅ **Conexão com Spotify**: Autenticação OAuth2 completa
- ✅ **Player Integrado**: Web Player do Spotify incorporado
- ✅ **Música no Perfil**: Como no Orkut original!
- ✅ **Compartilhamento Musical**: Posts com tracks do Spotify
- ✅ **Playlists Nostálgicas**: Curadoria dos anos 2000
- ✅ **Now Playing**: Widget de música tocando
- ✅ **Estatísticas Musicais**: Tracking de hábitos musicais

### 🎨 **Interface & UX**
- ✅ **Design Nostálgico**: Tema roxo/rosa fiel ao Orkut original
- ✅ **Layout Responsivo**: Funciona em desktop e mobile
- ✅ **Animações Suaves**: Transições e efeitos modernos
- ✅ **Tipografia Retrô**: Fonte Verdana como no original
- ✅ **Componentes Consistentes**: Design system unificado

### 🎤 **Funcionalidades Avançadas**
- ✅ **Controle por Voz**: Comandos de voz em português
- ✅ **Sistema de Notificações**: Alertas e mensagens em tempo real
- ✅ **Upload de Fotos**: Sistema completo de upload de imagens
- ✅ **Busca Inteligente**: Procurar usuários, comunidades e conteúdo

### 🗄️ **Backend & Database**
- ✅ **API RESTful**: Endpoints completos para todas as funcionalidades
- ✅ **PostgreSQL**: Banco de dados robusto com Supabase
- ✅ **Sistema de Tokens**: Autenticação segura
- ✅ **Sincronização**: Dados sincronizados entre cliente e servidor

## 🚧 Em Desenvolvimento

### 🔄 **Melhorias Prioritárias**
- 🔲 **Chat em Tempo Real**: WebSocket para mensagens instantâneas
- 🔲 **Notificações Push**: Sistema de notificações nativas
- 🔲 **Modo Offline**: PWA com cache offline
- 🔲 **Temas Personalizados**: Múltiplos temas retrô

### 🎵 **Spotify Avançado**
- 🔲 **Playlist Colaborativas**: Criar playlists com amigos
- 🔲 **Recomendações IA**: IA sugere músicas baseada no perfil
- 🔲 **Integração com Posts**: Auto-post da música tocando
- 🔲 **Estatísticas Sociais**: Ranking de músicas dos amigos

### 🤖 **IA & Automação**
- 🔲 **Moderação Automática**: IA modera conteúdo inadequado
- 🔲 **Sugestões Personalizadas**: IA sugere amigos e comunidades
- 🔲 **Geração de Memes**: IA cria memes nostálgicos
- 🔲 **Chatbot Nostálgico**: Assistant AI com personalidade anos 2000

### 📱 **Mobile & PWA**
- 🔲 **App Mobile**: Versão React Native
- 🔲 **PWA Completo**: Instalável como app
- 🔲 **Gestos Touch**: Navegação por gestos
- 🔲 **Modo Escuro**: Tema escuro nostálgico

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

## 🎤 Comandos de Voz (Português)

### **Navegação:**
- 🏠 "ir para início" / "abrir feed"
- 👤 "abrir perfil" / "ver meu perfil" 
- 💬 "abrir mensagens" / "ver mensagens"
- 🏘️ "ir para comunidades"
- 🎵 "abrir spotify" / "ir para música"

### **Ações Sociais:**
- 📝 "fazer post" / "criar publicação"
- 👫 "adicionar amigo [nome]"
- 💬 "enviar mensagem para [nome]"
- 🔍 "procurar [termo]"

### **Spotify:**
- 🎵 "conectar spotify"
- ▶️ "tocar música" / "pausar música"
- 📤 "compartilhar música"
- 💿 "criar playlist nostálgica"

### **Sistema:**
- 🚪 "fazer logout" / "sair"
- ⚙️ "abrir configurações"
- 🔄 "atualizar página"

> 💡 **Compatibilidade**: Funciona melhor no Chrome/Edge. Requer microfone ativo.

## 📁 Estrutura do Projeto

```
Orkut2025/
├── 📄 index.html              # Página de login
├── 🏠 home.html               # Feed principal
├── 👤 profile.html            # Perfil do usuário
├── 💬 messages.html           # Sistema de mensagens
├── 👥 communities.html        # Comunidades
├── 🎵 spotify.html            # Central musical Spotify
├── 📁 css/
│   ├── 🎨 style.css           # Estilos principais
│   ├── 📰 feed.css            # Estilos do feed
│   ├── 🎵 spotify-integration.css # Estilos Spotify
│   └── 🤖 ai-system.css       # Estilos do sistema IA
├── 📁 js/
│   ├── 🚀 app.js              # Core da aplicação
│   ├── 📰 feed.js             # Sistema de feed
│   ├── 🎵 spotify-integration.js # Integração Spotify
│   ├── 🤖 ai-backend-manager.js # Sistema IA
│   ├── 💾 smart-save.js       # Sistema SmartSave
│   └── 🎤 voice.js            # Controle por voz
├── 📁 api/
│   ├── 🎵 spotify/            # APIs Spotify
│   └── 👤 user/               # APIs de usuário
├── 📁 config/
│   └── 🤖 ai-credentials.js   # Configurações IA
├── 📁 db/
│   └── 🗄️ schema.sql          # Schema do banco
└── 📁 docs/
    └── 📖 SPOTIFY_SETUP.md    # Documentação Spotify
```

## 🗄️ Sistema de Banco de Dados

### **PostgreSQL + Supabase**
O projeto usa PostgreSQL hospedado no Supabase com schema completo:

#### **Tabelas Principais:**
- 👥 **users** - Dados de autenticação e perfil
- 📰 **posts** - Sistema de posts e feed
- 👫 **friendships** - Relacionamentos entre usuários
- 💬 **messages** - Sistema de mensagens privadas
- 🏘️ **communities** - Comunidades e memberships
- 🎵 **user_music** - Integração com dados musicais do Spotify
- 📷 **photos** - Sistema de upload de imagens
- 🔔 **notifications** - Sistema de notificações

#### **Configuração:**
```sql
-- Execute db/schema.sql para criar todas as tabelas
-- Inclui índices otimizados e constraints de segurança
-- Suporte completo para todas as funcionalidades
```

### **APIs Implementadas:**
- ✅ **POST** `/api/sync` - Sincronização de dados
- ✅ **GET/POST** `/api/user/*` - Gerenciamento de usuários
- ✅ **GET/POST** `/api/spotify/*` - Integração musical
- ✅ **GET/POST** `/api/posts/*` - Sistema de posts
- ✅ **GET/POST** `/api/friends/*` - Sistema de amigos

## Segurança
- Não commitamos `.env` (listado no `.gitignore`).
- Conexão ao Postgres via `DATABASE_URL` (env). Para Supabase, use `sslmode=require`.
- Dados do navegador permanecem em `localStorage` até sincronizar com o backend.

## 🚀 Como Executar

### **Pré-requisitos:**
- 📦 Node.js 18+
- 🗄️ PostgreSQL (recomendado: Supabase)
- 🎵 Conta Spotify Developer (para integração musical)

### **Instalação:**
```bash
# 1. Clone o repositório
git clone https://github.com/juliocamposmachado/Orkut.git
cd Orkut

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 4. Execute o schema do banco
# Importe db/schema.sql no seu PostgreSQL

# 5. Inicie o servidor
npm run dev
# ou npm start para produção

# 6. Acesse http://localhost:3000
```

### **Configuração Spotify:**
1. 🔗 Acesse [Spotify for Developers](https://developer.spotify.com/)
2. 📱 Crie uma nova aplicação
3. ➕ Adicione `http://localhost:3000/spotify.html` nos Redirect URIs
4. 🔑 Configure `SPOTIFY_CLIENT_ID` no arquivo de configuração
5. 📖 Consulte `docs/SPOTIFY_SETUP.md` para detalhes

### **Sistema de IA:**
- 🤖 Configure credenciais de IA em `config/ai-credentials.js`
- 🔗 Suporte para OpenAI, Anthropic, Google AI
- 🎲 População automática de dados para desenvolvimento

## 🎯 Características Únicas

### **💜 Nostalgia Autêntica**
- Design fielmente recriado do Orkut original
- Cores, tipografia e layout nostálgicos
- Easter eggs e referências dos anos 2000
- Experiência imersiva retrô

### **🤖 IA Integrada**
- População automática de dados realísticos
- Sistema SmartSave inteligente
- Geração de conteúdo contextual
- Múltiplos providers de IA suportados

### **🎵 Revolução Musical**
- Integração Spotify mais completa que o original
- Playlists curadas dos anos 2000
- Música no perfil como no Orkut clássico
- Compartilhamento musical social

### **📱 Tecnologia Moderna**
- PWA com instalação nativa
- Responsivo para todas as telas
- APIs RESTful modernas
- Arquitetura escalável

## 🤝 Contribuição

### **Como Contribuir:**
```bash
# 1. Fork o projeto
# 2. Crie sua feature branch
git checkout -b feat/nova-funcionalidade

# 3. Commit suas mudanças
git commit -m "✨ feat: adicionar nova funcionalidade"

# 4. Push para a branch
git push origin feat/nova-funcionalidade

# 5. Abra um Pull Request
```

### **Padrões:**
- 📝 Commits semânticos (feat, fix, docs, style, refactor)
- 🔒 Nunca commite credenciais ou segredos
- 🧪 Teste suas mudanças localmente
- 📖 Documente funcionalidades novas

## 📊 Status do Projeto

- 🟢 **Core Features**: 100% Completo
- 🟢 **Sistema de IA**: 100% Completo  
- 🟢 **Integração Spotify**: 100% Completo
- 🟡 **Features Avançadas**: 80% Completo
- 🟡 **Mobile/PWA**: 60% Completo
- 🔴 **Chat Tempo Real**: 0% Completo

## 📄 Licença

**MIT License** - Sinta-se livre para usar, modificar e distribuir!

---

### 💝 **Feito com nostalgia e muito código por [@juliocamposmachado](https://github.com/juliocamposmachado)**

> *"Reliving the golden age of social media, one line of code at a time."* 🌟
