# 🎵 Configuração da Integração com Spotify - Orkut 2025

Este documento detalha como configurar a integração completa com o Spotify para o projeto Orkut 2025.

## 📋 Pré-requisitos

1. Conta no Spotify (gratuita ou premium)
2. Acesso ao [Spotify for Developers](https://developer.spotify.com/)
3. Domínio ou localhost configurado para desenvolvimento

## 🚀 Passo a Passo da Configuração

### 1. Criar App no Spotify for Developers

1. Acesse https://developer.spotify.com/dashboard
2. Faça login com sua conta Spotify
3. Clique em "Create an App"
4. Preencha as informações:
   - **App name**: `Orkut 2025`
   - **App description**: `Integração musical nostálgica para o Orkut 2025`
   - **Website**: Seu domínio ou `http://localhost:3000`
   - **Redirect URIs**: 
     - `http://localhost:3000/spotify.html` (desenvolvimento)
     - `https://seudominio.com/spotify.html` (produção)
5. Aceite os termos e clique em "Create"

### 2. Configurar Variáveis de Ambiente

Após criar o app, você terá acesso ao **Client ID** e **Client Secret**:

```bash
# .env ou variáveis do sistema
SPOTIFY_CLIENT_ID=seu_client_id_aqui
SPOTIFY_CLIENT_SECRET=seu_client_secret_aqui
```

### 3. Configurar Redirect URIs no Spotify

Na página do seu app no Spotify Dashboard:

1. Clique em "Settings"
2. Em "Redirect URIs", adicione:
   - `http://localhost:3000/spotify.html` (desenvolvimento)
   - `https://seudominio.vercel.app/spotify.html` (produção Vercel)
   - `https://seudominio.com/spotify.html` (produção custom)
3. Salve as alterações

### 4. Atualizar Client ID no Frontend

Edite o arquivo `js/spotify-integration.js`:

```javascript
// Linha aproximadamente 6
this.clientId = 'SEU_CLIENT_ID_AQUI'; // Substitua pela sua Client ID
```

### 5. Configurar APIs Backend

Certifique-se que as variáveis de ambiente estão configuradas no seu ambiente de produção (Vercel, Netlify, etc.).

#### Para Vercel:
```bash
vercel env add SPOTIFY_CLIENT_ID
vercel env add SPOTIFY_CLIENT_SECRET
```

#### Para outras plataformas:
Configure as variáveis através do painel de controle da sua plataforma.

## 🔧 Estrutura dos Arquivos

```
/
├── js/
│   └── spotify-integration.js        # Lógica principal do frontend
├── css/
│   └── spotify-integration.css       # Estilos para a integração
├── api/
│   ├── spotify/
│   │   ├── token.js                 # OAuth2 - troca de código por tokens
│   │   └── refresh.js               # Renovação de tokens
│   └── user/
│       └── profile-music.js         # API para música do perfil
├── db/
│   └── add-profile-music-fields.sql # Script SQL para campos da música
└── spotify.html                     # Página principal da integração
```

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação OAuth2
- Login seguro via Spotify
- Gerenciamento automático de tokens
- Refresh automático quando necessário

### ✅ Player Web
- Reprodução de músicas diretamente no site
- Controles de player integrados
- Estado de reprodução em tempo real

### ✅ Funcionalidades Nostálgicas
- Criação automática de playlists dos anos 2000
- Busca por músicas nostálgicas por era
- Música do perfil (como no Orkut original)
- Compartilhamento de músicas no feed

### ✅ Interface Retrô
- Design nostálgico dos anos 2000
- Cores e estilo do Orkut original
- Animações e transições suaves
- Responsivo para mobile

## 🔐 Segurança

1. **Client Secret**: Nunca exponha no frontend
2. **Tokens**: Armazenados localmente com rotação automática
3. **HTTPS**: Obrigatório em produção
4. **Validação**: Todos os dados são validados no backend

## 🧪 Testando a Integração

1. **Desenvolvimento Local**:
   ```bash
   # Inicie o servidor local
   http-server . -p 3000
   # Acesse: http://localhost:3000/spotify.html
   ```

2. **Testar Funcionalidades**:
   - ✅ Conexão com Spotify
   - ✅ Criação de playlist nostálgica
   - ✅ Definir música do perfil  
   - ✅ Compartilhar música no feed
   - ✅ Visualizar estatísticas musicais

## 📊 Monitoramento

### Logs Importantes:
- `✅ Spotify tokens exchanged successfully`
- `✅ Profile music updated for user`
- `✅ Playlist created successfully`

### Erros Comuns:
- `Spotify configuration missing` → Variáveis de ambiente não configuradas
- `Invalid redirect URI` → URI não cadastrada no Spotify Dashboard
- `Token expired` → Implementar refresh automático

## 🎵 Playlists Nostálgicas Pré-configuradas

As seguintes playlists do Spotify são utilizadas por padrão:

- **Anos 2000**: `37i9dQZF1DX4o1oenSJRJd`
- **Emo Rock**: `37i9dQZF1DWXRqgorJj26U`
- **Pop Punk**: `37i9dQZF1DWY4xmpBXqCx1`
- **Nu Metal**: `37i9dQZF1DX1jqPwCJObdk`

## 🚀 Deploy em Produção

### Vercel (Recomendado):
```bash
# Configure as variáveis
vercel env add SPOTIFY_CLIENT_ID
vercel env add SPOTIFY_CLIENT_SECRET

# Deploy
vercel --prod
```

### Netlify:
```bash
# Configure no arquivo netlify.toml ou no painel
[build.environment]
SPOTIFY_CLIENT_ID = "seu_client_id"
SPOTIFY_CLIENT_SECRET = "seu_client_secret"
```

## 🤝 Suporte

Para problemas com a integração:

1. Verifique se todas as variáveis estão configuradas
2. Confirme os Redirect URIs no Spotify Dashboard
3. Teste primeiro em desenvolvimento local
4. Verifique os logs do console do navegador

## 📝 Próximas Funcionalidades

- [ ] Playlists colaborativas entre amigos
- [ ] Recomendações baseadas em IA
- [ ] Top músicas da semana no Orkut
- [ ] Integração com Last.fm
- [ ] Player de rádio nostálgica 24/7
- [ ] Sistema de conquistas musicais

---

**🎵 Com amor nostálgico, Orkut 2025** 💜
