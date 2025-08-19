# Orkut Consultas 2025 - Sistema de Consulta de Dados

## 🎯 Visão Geral

O **Orkut Consultas 2025** é um sistema avançado de consulta de dados integrado com o bot do Telegram **@consultabrpro_bot**. O sistema oferece uma interface moderna e responsiva para realizar consultas de dados pessoais e empresariais através de uma integração perfeita com o Telegram.

## 🚀 Características Principais

### 📱 Interface Moderna
- Design responsivo e intuitivo
- Animações fluidas e interativas
- Suporte a modo escuro automático
- Interface otimizada para desktop e mobile

### 🤖 Integração com Telegram
- Comunicação direta com @consultabrpro_bot
- Sistema de chat em tempo real
- Validação antes do envio das consultas
- Histórico completo de consultas

### 🛡️ Validação Avançada
- Validação de CPF com algoritmo oficial
- Validação de CNPJ com dígitos verificadores
- Verificação de email, telefone e CEP
- Sistema de blacklist para dados inválidos
- Feedback visual em tempo real

### 📊 Tipos de Consulta Disponíveis

1. **📄 CPF** - Consulta dados pessoais por CPF
2. **🏢 CNPJ** - Consulta dados empresariais
3. **📞 Telefone** - Consulta titular da linha telefônica
4. **📧 Email** - Consulta dados associados ao email
5. **📮 CEP** - Consulta endereço e residentes
6. **👤 Nome** - Busca por nome completo
7. **🗳️ Título de Eleitor** - Consulta dados eleitorais
8. **👩 Nome da Mãe** - Busca filhos pelo nome da mãe

## 🏗️ Arquitetura do Sistema

### Componentes Principais

```
Orkut Consultas 2025/
├── scripts/
│   ├── telegram-bot-api.js          # API de comunicação com Telegram
│   ├── data-consultation-chat.js    # Sistema de chat integrado
│   ├── data-consultation-interface.js # Interface principal
│   └── data-validation.js           # Sistema de validação
├── styles/
│   └── consultation-styles.css      # Estilos CSS modernos
├── consultation-demo.html           # Página de demonstração
└── README-CONSULTATION-SYSTEM.md   # Documentação
```

### 1. **Telegram Bot API** (`telegram-bot-api.js`)
Gerencia toda a comunicação com o bot do Telegram:

```javascript
// Exemplo de uso
const response = await window.telegramBotAPI.sendQuery('cpf', '12345678901');
```

**Recursos:**
- Simulação de comunicação com @consultabrpro_bot
- Geração de dados fictícios para demonstração
- Validação prévia dos dados
- Formatação das respostas
- Sistema de retry em caso de falhas

### 2. **Sistema de Chat** (`data-consultation-chat.js`)
Interface de chat em tempo real:

```javascript
// Iniciar uma consulta
window.dataConsultationChat.startQuery('cpf');
```

**Funcionalidades:**
- Chat com mensagens em tempo real
- Interface similar a aplicativos de mensagem
- Sistema de loading durante consultas
- Histórico de conversas
- Suporte a múltiplos tipos de mensagem

### 3. **Interface Principal** (`data-consultation-interface.js`)
Interface gráfica principal do sistema:

```javascript
// Acessar status do sistema
const status = window.consultationInterface.getSystemStatus();
```

**Características:**
- Grid responsivo de tipos de consulta
- Painel de estatísticas em tempo real
- Sistema de histórico e configurações
- Exportação de dados
- Atalhos de teclado

### 4. **Sistema de Validação** (`data-validation.js`)
Validação avançada de dados:

```javascript
// Validar dados
const result = window.dataValidation.validateQuery('cpf', '12345678901');
```

**Algoritmos Implementados:**
- Validação de CPF com dígitos verificadores
- Validação de CNPJ empresarial
- Verificação de DDD e formato de telefone
- Validação de email RFC compliant
- Verificação de CEP brasileiro
- Validação de título de eleitor

## 🔧 Como Usar

### 1. **Instalação**
```bash
# Clone ou baixe os arquivos do sistema
# Abra consultation-demo.html em um servidor web
```

### 2. **Inicialização**
O sistema carrega automaticamente todos os componentes:

1. **API do Telegram** - Conecta com o bot
2. **Sistema de Validação** - Carrega regras de validação
3. **Interface de Chat** - Inicializa o chat
4. **Interface Principal** - Renderiza a tela principal

### 3. **Realizando Consultas**

#### Método 1: Interface Visual
1. Clique em um dos cards de consulta (CPF, CNPJ, etc.)
2. Digite os dados no campo de entrada
3. Aguarde a validação em tempo real
4. Clique em "Consultar" para enviar
5. Visualize a resposta no chat

#### Método 2: Atalhos de Teclado
- `Ctrl + 1`: Consulta CPF
- `Ctrl + 2`: Consulta CNPJ
- `Ctrl + H`: Acessar histórico
- `Ctrl + Shift + D`: Mostrar estatísticas
- `Ctrl + Shift + C`: Limpar dados
- `Ctrl + Shift + E`: Exportar histórico

### 4. **Demonstração**
Use os controles de demonstração na parte superior:

- **📄 Testar CPF**: Preenche um CPF válido
- **🏢 Testar CNPJ**: Preenche um CNPJ válido
- **📞 Testar Telefone**: Preenche um telefone válido
- **📧 Testar Email**: Preenche um email válido
- **❌ Simular Erro**: Testa validação com dados inválidos
- **🗑️ Limpar Tudo**: Remove todos os dados
- **📊 Ver Stats**: Mostra estatísticas do sistema
- **📥 Exportar**: Exporta histórico em JSON

## 📊 Validação de Dados

### CPF (Cadastro de Pessoa Física)
```javascript
// Formato aceito: apenas números
// Exemplo: 12345678901
// Validação: Algoritmo oficial com dígitos verificadores
```

### CNPJ (Cadastro Nacional da Pessoa Jurídica)
```javascript
// Formato aceito: apenas números
// Exemplo: 12345678000123
// Validação: Algoritmo oficial com dígitos verificadores
```

### Telefone
```javascript
// Formato aceito: DDD + número
// Celular: 11987654321 (11 dígitos)
// Fixo: 1187654321 (10 dígitos)
// Validação: DDD válido + formato brasileiro
```

### Email
```javascript
// Formato aceito: email@dominio.com
// Validação: RFC 5322 compliant
// Verifica: domínio, caracteres válidos, formato
```

### CEP
```javascript
// Formato aceito: apenas números
// Exemplo: 12345678
// Validação: 8 dígitos, não repetitivos
```

### Nome/Nome da Mãe
```javascript
// Formato aceito: apenas letras e espaços
// Exemplo: João da Silva
// Validação: mínimo 2 palavras, caracteres válidos
```

### Título de Eleitor
```javascript
// Formato aceito: apenas números
// Exemplo: 123456789012
// Validação: algoritmo oficial, código do estado
```

## 🎨 Personalização

### Modificar Cores
Edite as variáveis CSS em `consultation-styles.css`:

```css
:root {
    --primary-color: #4285F4;
    --secondary-color: #34A853;
    --accent-color: #EA4335;
    /* ... outras cores */
}
```

### Adicionar Novos Tipos de Consulta
1. Adicione em `data-consultation-interface.js`:
```javascript
queryTypes: {
    // ... tipos existentes
    novo_tipo: {
        name: 'Novo Tipo',
        icon: '🆕',
        color: '#FF5722',
        description: 'Descrição do novo tipo'
    }
}
```

2. Implemente validação em `data-validation.js`:
```javascript
validationRules: {
    // ... regras existentes
    novo_tipo: {
        pattern: /^padrão_regex$/,
        // ... outras configurações
    }
}
```

3. Adicione gerador de dados fictícios em `telegram-bot-api.js`

## 🔒 Segurança e Privacidade

### Dados Sensíveis
- CPFs são mascarados no histórico (123.***.*01)
- Emails são parcialmente ocultados (usr***@dominio.com)
- Dados não são enviados para servidores externos
- Sistema funciona 100% no frontend

### Validações de Segurança
- Blacklist de CPFs inválidos conhecidos
- Verificação de padrões suspeitos
- Limite de tentativas de validação
- Limpeza automática de dados temporários

## 📈 Monitoramento e Estatísticas

### Status do Sistema
O sistema monitora em tempo real:
- Status da interface
- Status do chat
- Status da validação
- Conexão com bot do Telegram
- Número de consultas realizadas

### Estatísticas Disponíveis
- Total de validações realizadas
- Taxa de sucesso das validações
- Estatísticas por tipo de consulta
- Histórico de erros
- Tempo médio de resposta

### Exportação de Dados
Exporte o histórico em formato JSON:
```json
{
    "type": "cpf",
    "value": "123.***.*01",
    "timestamp": "2025-01-03T10:30:00.000Z",
    "response": { "data": "response_data" }
}
```

## 🛠️ Desenvolvimento

### Estrutura de Desenvolvimento
```javascript
// Exemplo de extensão do sistema
class MinhaConsulta extends DataConsultationInterface {
    constructor() {
        super();
        this.setupCustomValidation();
    }
    
    setupCustomValidation() {
        // Implementar validações customizadas
    }
}
```

### Debugging
Ative o debug no console:
```javascript
// Mostrar logs detalhados
localStorage.setItem('orkut_debug', 'true');

// Ver status completo do sistema
console.log(window.consultationInterface.getSystemStatus());
```

### Testes
Execute testes manuais:
```javascript
// Testar validação
window.dataValidation.validateQuery('cpf', '12345678901');

// Testar chat
window.dataConsultationChat.startQuery('cpf');

// Testar interface
window.consultationInterface.startConsultation('cpf');
```

## 🌐 Compatibilidade

### Navegadores Suportados
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ⚠️ Internet Explorer (não suportado)

### Dispositivos
- ✅ Desktop (Windows, Mac, Linux)
- ✅ Tablets (iPad, Android)
- ✅ Smartphones (iOS, Android)
- ✅ PWA ready

## 📞 Suporte e Contribuição

### Issues e Bugs
Para reportar problemas:
1. Abra as ferramentas do desenvolvedor (F12)
2. Verifique o console por erros
3. Colete informações do sistema:
```javascript
console.log('=== DIAGNÓSTICO DO SISTEMA ===');
console.log('Interface:', window.consultationInterface?.getSystemStatus());
console.log('Chat:', window.dataConsultationChat?.getSystemStatus());
console.log('Validação:', window.dataValidation?.getValidationStats());
console.log('Bot API:', window.telegramBotAPI?.getConnectionStatus());
```

### Contribuições
Contribuições são bem-vindas! Áreas de interesse:
- 🎨 Melhorias na interface
- 🔒 Aprimoramentos de segurança
- 📊 Novas funcionalidades de relatório
- 🌐 Internacionalização
- 📱 Otimizações mobile

## 📋 Changelog

### v1.0.0 (Janeiro 2025)
- ✨ Lançamento inicial do sistema
- 🚀 Interface moderna e responsiva
- 🤖 Integração com Telegram Bot
- 🛡️ Sistema de validação avançado
- 📊 8 tipos de consulta disponíveis
- 💾 Sistema de histórico e exportação
- 🎯 Demonstração interativa completa

---

## 🎉 Conclusão

O **Orkut Consultas 2025** representa uma evolução moderna dos sistemas de consulta de dados, combinando:

- **Interface intuitiva** e moderna
- **Validação rigorosa** de dados
- **Integração perfeita** com Telegram
- **Experiência do usuário** otimizada
- **Código limpo** e extensível

### 🔗 Links Úteis
- **Demonstração**: `consultation-demo.html`
- **Telegram Bot**: [@consultabrpro_bot](https://web.telegram.org/k/#@consultabrpro_bot)
- **Código Fonte**: Arquivos JavaScript modulares
- **Documentação**: Este arquivo README

### 📬 Contato
Para dúvidas, sugestões ou suporte técnico, utilize os canais apropriados do projeto.

---

**Desenvolvido com ❤️ para a comunidade Orkut 2025**
