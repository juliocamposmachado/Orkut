Orkut2025

Projeto: Site estático com scripts centrais que usam localStorage e sincronizam com um backend Node.js para gravar no PostgreSQL (Supabase).

Como rodar
- Requisitos: Node.js 18+
- Instalar deps: npm install
- Configurar variável de ambiente DATABASE_URL
- Iniciar: npm run dev (ou npm start)

Segurança
- Não coloque credenciais diretamente no código.
- Use variáveis de ambiente. Veja .env.example.

Estrutura
- public/: arquivos estáticos (HTML, CSS, JS)
- server/: backend Express + rotas

# 🌟 Orkut 2025 - Rede Social Nostálgica + Sistema de Consultas

Uma rede social inspirada no clássico Orkut dos anos 2000 com funcionalidades modernas + Sistema avançado de consultas de dados integrado com Telegram.

## 📋 Sobre o Projeto

O **Orkut 2025** combina nostalgia e modernidade, oferecendo:
- **Rede Social Retrô**: Experiência clássica do Orkut original
- **Sistema de Consultas**: Integração com bot Telegram @consultabrpro_bot
- **IA Avançada**: Detecção de crushes e análise comportamental

## 🚀 Novidades - Sistema de Consultas 2025

### 🤖 Integração com Telegram Bot
- **Bot**: [@consultabrpro_bot](https://web.telegram.org/k/#@consultabrpro_bot)
- **Chat em Tempo Real**: Interface similar WhatsApp/Telegram
- **8 Tipos de Consulta**: CPF, CNPJ, Telefone, Email, CEP, Nome, Título Eleitor
- **Validação Avançada**: Algoritmos oficiais brasileiros

### 📊 Funcionalidades de Consulta
- 📄 **CPF**: Validação com dígitos verificadores
- 🏢 **CNPJ**: Algoritmo oficial empresarial
- 📞 **Telefone**: Validação DDD + formato brasileiro
- 📧 **Email**: RFC 5322 compliant
- 📮 **CEP**: Formato brasileiro + validação
- 👤 **Nome**: Busca completa por pessoa
- 🗳️ **Título Eleitor**: Algoritmo oficial TSE
- 👩 **Nome da Mãe**: Busca por filiação

### 🔒 Segurança e Privacidade
- **Mascaramento**: Dados sensíveis são protegidos
- **Blacklist**: CPFs/CNPJs inválidos bloqueados
- **Frontend Only**: Nenhum dado enviado para servidores
- **Histórico Local**: Armazenamento seguro no navegador

### 🎯 Demonstrações Disponíveis
- **[Sistema de Consultas](/consultation-demo.html)**: Demo completa das consultas
- **[Personas IA](/demo.html)**: Sistema de IA avançado
- **[Orkut Retrô](/)**: Rede social nostálgica

### ✨ Características Principais

- **Design Retrô Autêntico**: Cores lilás, rosa e azul claro característicos do Orkut original
- **Interface Nostálgica**: Layout que remete aos anos 2000 com bordas arredondadas e botões coloridos
- **Totalmente Responsivo**: Funciona perfeitamente em desktop, tablet e celular
- **Experiência Completa**: Perfis, scraps, depoimentos, comunidades e mensagens privadas

## 🎨 Funcionalidades

### 🔐 Sistema de Autenticação
- **Login/Cadastro**: Formulários estilizados com validação em tempo real
- **Validação de Senha**: Indicador de força da senha
- **Lembrar Login**: Opção para manter usuário conectado
- **Proteção**: Sistema anti-spam com limite de tentativas

### 👤 Perfil do Usuário
- **Foto de Perfil**: Upload e exibição de foto pessoal
- **Informações Pessoais**: Idade, localização, relacionamento, aniversário
- **"Quem Sou Eu"**: Seção de biografia personalizada
- **Estatísticas**: Contador de visualizações, amigos e fãs
- **Status Personalizado**: Frase de status customizável

### 💬 Scraps e Depoimentos
- **Scraps**: Mural público de mensagens (similar ao "mural" do Facebook)
- **Depoimentos**: Mensagens especiais que precisam ser aprovadas
- **Sistema de Aprovação**: Controle sobre depoimentos exibidos
- **Interação Social**: Comentários e respostas

### 👥 Sistema de Amigos
- **Top 10 Amigos**: Lista destacada de melhores amigos
- **Lista Completa**: Visualização de todos os amigos
- **Sugestões**: Sistema de sugestão de novas amizades
- **Status Online**: Indicador de amigos conectados
- **Busca de Amigos**: Sistema de busca por username ou nome
- **Gerenciamento**: Envio, aceitação e rejeição de solicitações
- **Abas Organizadas**: Amigos, solicitações recebidas e enviadas

### 🎵 Sistema de Chamadas de Áudio
- **Interface Moderna**: Modal elegante com gradientes e animações
- **Controles Completos**: Mute/unmute, alto-falante, volume ajustável
- **Feedback Visual**: Animações de ondas sonoras e indicadores de status
- **Áudio Simulado**: Web Audio API com sons de toque e beeps
- **Timer em Tempo Real**: Cronômetro da duração da chamada
- **Atalhos de Teclado**: Controle rápido via teclas
- **Design Responsivo**: Otimizado para desktop e mobile
- **Acessibilidade**: Suporte a preferências de movimento reduzido

### 🏠 Comunidades
- **Criação**: Interface para criar novas comunidades
- **Categorização**: Comunidades organizadas por categorias
- **Fóruns**: Sistema de discussão com tópicos e respostas
- **Gerenciamento**: Controle de membros e moderação
- **Busca e Filtros**: Encontre comunidades por interesse

### 📨 Mensagens Privadas
- **Caixa de Entrada**: Interface clássica estilo Orkut
- **Composição**: Editor de mensagens com destinatários
- **Organização**: Filtros por tipo (não lidas, enviadas, arquivadas)
- **Busca**: Procurar mensagens por remetente ou conteúdo

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Estilização avançada com gradientes e animações
- **JavaScript Vanilla**: Funcionalidades dinâmicas sem frameworks
- **Web Audio API**: Sistema de áudio para chamadas e efeitos sonoros
- **getUserMedia API**: Acesso ao microfone para chamadas de áudio
- **LocalStorage**: Armazenamento local de dados do usuário
- **Responsive Design**: Layout adaptável para todos os dispositivos

## 📁 Estrutura do Projeto

```
# Orkut Retrô 🎉

Uma recriação nostálgica da famosa rede social dos anos 2000, construída com tecnologias modernas e hospedada no Vercel com banco de dados SQLite e backup no Google Drive.

## 🚀 Funcionalidades

- **Autenticação completa**: Cadastro e login com validações
- **Perfis de usuário**: Fotos, status, informações pessoais
- **Sistema de amizades**: Adicionar, aceitar e gerenciar amigos
- **Scraps**: Sistema clássico de recados do Orkut
- **Comunidades**: Criar e participar de grupos
- **Feed de atividades**: Timeline com posts dos amigos
- **Upload de fotos**: Sistema completo de upload e processamento
- **Backup automático**: Sincronização com Google Drive
- **Interface nostálgica**: Visual fiel ao Orkut original

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Node.js com APIs serverless (Vercel)
- **Banco de dados**: SQLite com ORM personalizado
- **Upload**: Multer + Sharp para processamento de imagens
- **Backup**: Google Drive API
- **Autenticação**: JWT (JSON Web Tokens)
- **Deploy**: Vercel (automatizado)

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Vercel
- Conta no Google Cloud (para backup)
- Git

## 🔧 Instalação Local

1. **Clone o repositório**
```bash
git clone [URL_DO_SEU_REPOSITORIO]
cd Orkut2025
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
- `JWT_SECRET`: Uma string aleatória e segura
- `GOOGLE_DRIVE_FOLDER_ID`: ID da pasta no Google Drive para backup
- `GOOGLE_SERVICE_ACCOUNT_KEY`: Chave JSON da conta de serviço

4. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

5. **Acesse o site**
```
http://localhost:3000
```

## 🚀 Deploy no Vercel

1. **Conecte seu repositório**
   - Faça login no [Vercel](https://vercel.com)
   - Importe seu repositório do GitHub

2. **Configure as variáveis de ambiente**
   - No painel do Vercel, vá em Settings > Environment Variables
   - Adicione todas as variáveis do arquivo `.env.example`

3. **Deploy automático**
   - O Vercel fará deploy automaticamente a cada push
   - Seu site estará disponível em: `https://seu-projeto.vercel.app`

## 🗄️ Estrutura do Banco de Dados

O sistema utiliza SQLite com as seguintes tabelas principais:

- **users**: Informações básicas dos usuários
- **profiles**: Dados do perfil (foto, status, bio, etc.)
- **friendships**: Relacionamentos entre usuários
- **scraps**: Sistema de recados
- **communities**: Comunidades criadas
- **posts**: Feed de atividades
- **uploads**: Controle de arquivos enviados

## 🔐 Configuração do Google Drive

Para habilitar o backup automático:

1. **Crie um projeto no Google Cloud Console**
2. **Ative a Google Drive API**
3. **Crie uma conta de serviço**
4. **Baixe o arquivo JSON das credenciais**
5. **Adicione a chave como variável de ambiente**

## 📡 APIs Disponíveis

- `POST /api/register` - Cadastro de usuários
- `POST /api/login` - Autenticação
- `POST /api/upload-photo` - Upload de fotos
- `GET /api/backup?action=list` - Listar backups
- `POST /api/backup?action=create` - Criar backup

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Tokens JWT com expiração
- Validação de dados no frontend e backend
- Proteção contra tentativas de login excessivas
- Sanitização de uploads de arquivos

## 🎨 Personalização

O visual pode ser customizado editando os arquivos CSS em `/css/`. O tema mantém a nostalgia do Orkut original com:

- Cores roxas características
- Layout familiar
- Ícones e elementos visuais nostálgicos

## 🔄 Backup Automático

O sistema faz backup automático diário para o Google Drive:

- Mantém os 10 backups mais recentes
- Remove automaticamente backups antigos
- Notificações de sucesso/erro via console

## 📱 Responsividade

O site é totalmente responsivo e funciona em:
- Desktop (todas as resoluções)
- Tablets 
- Smartphones
- Navegadores modernos

## 🐛 Solução de Problemas

**Erro de conexão com banco:**
- Verifique se o diretório `/data` existe
- Permissões de escrita na pasta

**Upload não funciona:**
- Verifique o limite de tamanho (5MB)
- Formatos aceitos: JPG, PNG, GIF, WebP

**Backup falha:**
- Verifique as credenciais do Google Drive
- Confirme as permissões da conta de serviço

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🎯 Roadmap

- [ ] Sistema de mensagens privadas
- [ ] Notificações em tempo real
- [ ] Chat integrado
- [ ] Temas customizáveis
- [ ] App móvel
- [ ] Integração com redes sociais

## 👥 Créditos

- Inspirado no Orkut original (2004-2014)
- Interface nostálgica recriada com carinho
- Desenvolvimento moderno para uma experiência clássica

---

**Feito com 💜 em memória do Orkut original**

🌐 **Site**: https://orkut-br.vercel.app
📧 **Contato**: [seu-email@exemplo.com]
🐙 **GitHub**: [seu-github]
├── index.html              # Página de login/cadastro
├── profile.html            # Perfil do usuário
├── communities.html        # Página de comunidades
├── messages.html           # Sistema de mensagens
├── css/
│   ├── style.css          # Estilos principais
│   ├── login.css          # Estilos da página de login
│   ├── profile.css        # Estilos do perfil
│   ├── communities.css    # Estilos das comunidades
│   ├── friends-system.css # Sistema de amigos
│   └── audio-call.css     # Sistema de chamadas de áudio
├── js/
│   ├── main.js            # JavaScript principal
│   ├── auth.js            # Sistema de autenticação
│   ├── profile.js         # Funcionalidades do perfil
│   └── audio-call.js      # Sistema de chamadas de áudio
├── images/                # Imagens e recursos
└── README.md              # Este arquivo
```

## 🚀 Como Usar

### 1. **Abrir o Projeto**
   - Navegue até a pasta do projeto
   - Abra o arquivo `index.html` no seu navegador

### 2. **Fazer Login ou Cadastro**
   - **Cadastro**: Clique em "Cadastre-se" e preencha seus dados
   - **Login**: Use qualquer email válido e senha com pelo menos 6 caracteres
   - *Para demonstração, qualquer email/senha válidos funcionarão*

### 3. **Explorar o Perfil**
   - Edite suas informações pessoais
   - Adicione uma biografia no "Quem Sou Eu"
   - Personalize seu status

### 4. **Interagir Socialmente**
   - Envie scraps para o seu próprio perfil (modo demonstração)
   - Explore as comunidades disponíveis
   - Teste o sistema de mensagens

### 5. **Navegar pelas Funcionalidades**
   - Use o menu superior para navegar entre seções
   - Explore as diferentes funcionalidades de cada página
   - Teste a responsividade em diferentes tamanhos de tela

### 6. **Testar Chamadas de Áudio**
   - No perfil, clique no botão "Chamada de Áudio" (📞)
   - Permita acesso ao microfone quando solicitado
   - Teste os controles: mute/unmute, alto-falante, volume
   - Use atalhos de teclado: M (mute), S (speaker), Esc (encerrar)
   - Observe as animações de ondas sonoras durante a "conexão"

## 🎯 Funcionalidades em Demonstração

Este é um projeto de demonstração, então algumas funcionalidades usam dados simulados:

- **Usuários**: Perfis de exemplo pré-carregados
- **Comunidades**: Comunidades populares já criadas
- **Mensagens**: Conversas simuladas
- **Amigos**: Lista de amigos de exemplo

## 🔧 Personalização

### Cores do Tema
As cores podem ser facilmente alteradas no arquivo `css/style.css` na seção `:root`:

```css
:root {
    --primary-purple: #a855c7;
    --light-purple: #e6d8f5;
    --primary-pink: #ff6bb3;
    --light-pink: #ffe1f1;
    --primary-blue: #5bc0de;
    --light-blue: #d8f0ff;
}
```

### Dados Simulados
Para alterar os dados de demonstração, edite o objeto `mockData` no arquivo `js/main.js`.

## 📱 Compatibilidade

- **Navegadores**: Chrome, Firefox, Safari, Edge (versões modernas)
- **Dispositivos**: Desktop, tablet e celular
- **Resolução**: Otimizado para 320px até 1920px de largura

## 🎨 Design e UX

### Paleta de Cores
- **Roxo Principal**: #a855c7 (botões e destaques)
- **Rosa Claro**: #ff6bb3 (acentos e gradientes)
- **Azul Suave**: #5bc0de (elementos secundários)
- **Fundos**: Gradientes suaves entre essas cores

### Tipografia
- **Fonte Principal**: Verdana, Arial (fontes clássicas dos anos 2000)
- **Tamanhos**: 12px para texto, 11px para botões, escalável para mobile

### Elementos Visuais
- **Bordas Arredondadas**: 10-15px de raio para suavidade
- **Sombras Suaves**: Box-shadow para profundidade sutil
- **Animações**: Transições suaves de 0.3s
- **Gradientes**: Uso extensivo para botões e backgrounds

## 🌟 Destaques Técnicos

### JavaScript Modular
- Código organizado em módulos funcionais
- Sistema de eventos centralizado
- Gerenciamento de estado simples mas eficaz

### CSS Avançado
- Uso de CSS Grid e Flexbox para layouts
- Variáveis CSS para facilitar customização
- Media queries para responsividade completa

### Experiência do Usuário
- Carregamento rápido (apenas arquivos estáticos)
- Feedback visual para todas as ações
- Navegação intuitiva e familiar

## 🤝 Contribuindo

Este é um projeto de demonstração, mas sugestões e melhorias são bem-vindas! Algumas ideias para expansão:

- Adicionar mais páginas (busca, configurações)
- Implementar backend real
- Adicionar mais animações e efeitos
- Criar sistema de notificações push
- Implementar chat em tempo real

## 📜 Licença

Este projeto é uma homenagem nostálgica e está disponível para uso educacional e demonstração. Não possui fins comerciais.

## 🎊 Créditos

Criado com muito carinho e nostalgia pelos anos 2000! 

**Desenvolvido em 2025** - Uma homenagem ao Orkut original (2004-2014)

---

*"Quem tem saudades dos anos 2000? 💜"*

Aproveite sua viagem no tempo e relembre os bons tempos das redes sociais! 🌟
