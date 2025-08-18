# 🌟 Orkut Retrô - Rede Social Nostálgica

Uma rede social inspirada no clássico Orkut dos anos 2000, recriada com design retrô e funcionalidades modernas.

## 📋 Sobre o Projeto

O **Orkut Retrô** é uma homenagem nostálgica à famosa rede social que marcou os anos 2000. O projeto recria a experiência clássica do Orkut com um design fiel ao original, mas adaptado para navegadores modernos e dispositivos atuais.

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

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Estilização avançada com gradientes e animações
- **JavaScript Vanilla**: Funcionalidades dinâmicas sem frameworks
- **LocalStorage**: Armazenamento local de dados do usuário
- **Responsive Design**: Layout adaptável para todos os dispositivos

## 📁 Estrutura do Projeto

```
Orkut2025/
├── index.html              # Página de login/cadastro
├── profile.html            # Perfil do usuário
├── communities.html        # Página de comunidades
├── messages.html           # Sistema de mensagens
├── css/
│   ├── style.css          # Estilos principais
│   ├── login.css          # Estilos da página de login
│   ├── profile.css        # Estilos do perfil
│   └── communities.css    # Estilos das comunidades
├── js/
│   ├── main.js            # JavaScript principal
│   └── auth.js            # Sistema de autenticação
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
