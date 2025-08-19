/**
 * Data Consultation Chat - Orkut 2025
 * Sistema de chat para consultas de dados via @consultabrpro_bot
 */

class DataConsultationChat {
    constructor() {
        this.chatContainer = null;
        this.messageHistory = [];
        this.currentQuery = null;
        this.isWaitingResponse = false;
        
        this.queryTypes = {
            cpf: {
                name: 'CPF',
                icon: '📄',
                placeholder: 'Digite o CPF (apenas números): 12345678901',
                example: '12345678901'
            },
            cnpj: {
                name: 'CNPJ',
                icon: '🏢',
                placeholder: 'Digite o CNPJ (apenas números): 12345678000123',
                example: '12345678000123'
            },
            telefone: {
                name: 'Telefone',
                icon: '📞',
                placeholder: 'Digite o telefone com DDD: 11987654321',
                example: '11987654321'
            },
            email: {
                name: 'Email',
                icon: '📧',
                placeholder: 'Digite o email: exemplo@email.com',
                example: 'exemplo@email.com'
            },
            cep: {
                name: 'CEP',
                icon: '📮',
                placeholder: 'Digite o CEP (apenas números): 01234567',
                example: '01234567'
            },
            nome: {
                name: 'Nome',
                icon: '👤',
                placeholder: 'Digite o nome completo: João da Silva',
                example: 'João da Silva'
            },
            titulo_eleitor: {
                name: 'Título de Eleitor',
                icon: '🗳️',
                placeholder: 'Digite o título (apenas números): 123456780191',
                example: '123456780191'
            },
            nome_mae: {
                name: 'Nome da Mãe',
                icon: '👩',
                placeholder: 'Digite o nome da mãe: Maria da Silva',
                example: 'Maria da Silva'
            }
        };
        
        this.initializeChat();
    }

    initializeChat() {
        console.log('💬 Inicializando sistema de chat de consultas...');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Escuta cliques em botões de consulta
        document.addEventListener('click', (e) => {
            if (e.target.dataset.queryType) {
                this.startQuery(e.target.dataset.queryType);
            }
        });

        // Escuta envio de formulários
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('consultation-form')) {
                e.preventDefault();
                this.handleQuerySubmission(e.target);
            }
        });

        // Escuta tecla Enter no input
        document.addEventListener('keypress', (e) => {
            if (e.target.classList.contains('query-input') && e.key === 'Enter') {
                e.preventDefault();
                const form = e.target.closest('form');
                if (form) {
                    this.handleQuerySubmission(form);
                }
            }
        });
    }

    /**
     * Inicia uma nova consulta
     */
    startQuery(queryType) {
        if (!this.queryTypes[queryType]) {
            console.error('Tipo de consulta inválido:', queryType);
            return;
        }

        this.currentQuery = {
            type: queryType,
            startTime: new Date()
        };

        console.log(`🔍 Iniciando consulta: ${queryType}`);
        this.showQueryInput(queryType);
        this.addSystemMessage(`🤖 Consulta ${this.queryTypes[queryType].name} iniciada! 
        
${this.queryTypes[queryType].placeholder}`);
    }

    /**
     * Mostra input para consulta
     */
    showQueryInput(queryType) {
        const queryInfo = this.queryTypes[queryType];
        
        const inputHTML = `
            <div class="consultation-form-container">
                <form class="consultation-form" data-query-type="${queryType}">
                    <div class="query-input-group">
                        <div class="query-type-indicator">
                            <span class="query-icon">${queryInfo.icon}</span>
                            <span class="query-name">Consulta ${queryInfo.name}</span>
                        </div>
                        
                        <div class="input-container">
                            <input 
                                type="text" 
                                name="queryValue" 
                                class="query-input" 
                                placeholder="${queryInfo.placeholder}"
                                autocomplete="off"
                                required>
                            <button type="submit" class="query-submit-btn" ${this.isWaitingResponse ? 'disabled' : ''}>
                                ${this.isWaitingResponse ? '⏳' : '🔍'} Consultar
                            </button>
                        </div>
                        
                        <div class="query-example">
                            💡 Exemplo: ${queryInfo.example}
                        </div>
                    </div>
                </form>
            </div>
        `;
        
        this.updateChatContainer(inputHTML);
        
        // Foca no input
        setTimeout(() => {
            const input = document.querySelector('.query-input');
            if (input) input.focus();
        }, 100);
    }

    /**
     * Manipula envio da consulta
     */
    async handleQuerySubmission(form) {
        if (this.isWaitingResponse) {
            console.log('⏳ Já existe uma consulta em andamento...');
            return;
        }

        const formData = new FormData(form);
        const queryValue = formData.get('queryValue').trim();
        const queryType = form.dataset.queryType;

        if (!queryValue) {
            this.showError('Por favor, digite um valor para consultar.');
            return;
        }

        try {
            // Valida dados antes de enviar
            window.telegramBotAPI.validateQuery(queryType, queryValue);
            
            this.isWaitingResponse = true;
            this.updateSubmitButton(true);
            
            // Adiciona mensagem do usuário
            this.addUserMessage(`${this.queryTypes[queryType].icon} ${queryValue}`);
            
            // Adiciona mensagem de loading
            const loadingId = this.addBotMessage('🔄 Enviando consulta para @consultabrpro_bot...', true);
            
            // Envia consulta para o bot do Telegram
            const response = await window.telegramBotAPI.sendQuery(queryType, queryValue);
            
            // Remove mensagem de loading
            this.removeMessage(loadingId);
            
            // Formata e exibe resposta
            const formattedResponse = window.telegramBotAPI.formatResponse(queryType, response);
            this.addBotMessage(formattedResponse);
            
            // Atualiza histórico
            this.updateQueryHistory(queryType, queryValue, response);
            
        } catch (error) {
            console.error('Erro na consulta:', error);
            this.showError(`❌ Erro: ${error.message}`);
        } finally {
            this.isWaitingResponse = false;
            this.updateSubmitButton(false);
        }
    }

    /**
     * Adiciona mensagem do sistema
     */
    addSystemMessage(message) {
        return this.addMessage({
            type: 'system',
            content: message,
            timestamp: new Date()
        });
    }

    /**
     * Adiciona mensagem do usuário
     */
    addUserMessage(message) {
        return this.addMessage({
            type: 'user',
            content: message,
            timestamp: new Date()
        });
    }

    /**
     * Adiciona mensagem do bot
     */
    addBotMessage(message, isLoading = false) {
        return this.addMessage({
            type: 'bot',
            content: message,
            timestamp: new Date(),
            isLoading
        });
    }

    /**
     * Adiciona mensagem ao chat
     */
    addMessage(messageData) {
        const messageId = this.generateMessageId();
        const message = { ...messageData, id: messageId };
        
        this.messageHistory.push(message);
        this.renderMessages();
        
        return messageId;
    }

    /**
     * Remove mensagem específica
     */
    removeMessage(messageId) {
        this.messageHistory = this.messageHistory.filter(msg => msg.id !== messageId);
        this.renderMessages();
    }

    /**
     * Renderiza todas as mensagens
     */
    renderMessages() {
        const chatContainer = document.getElementById('consultation-chat-messages');
        if (!chatContainer) return;

        const messagesHTML = this.messageHistory.map(message => {
            return this.renderMessage(message);
        }).join('');

        chatContainer.innerHTML = messagesHTML;
        
        // Scroll para o final
        setTimeout(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 100);
    }

    /**
     * Renderiza uma mensagem individual
     */
    renderMessage(message) {
        const timeString = message.timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const messageClass = `chat-message ${message.type}${message.isLoading ? ' loading' : ''}`;

        return `
            <div class="${messageClass}" data-message-id="${message.id}">
                <div class="message-content">
                    <div class="message-text">${this.formatMessageContent(message.content)}</div>
                    <div class="message-time">${timeString}</div>
                </div>
            </div>
        `;
    }

    /**
     * Formata conteúdo da mensagem
     */
    formatMessageContent(content) {
        // Converte quebras de linha em <br>
        let formatted = content.replace(/\n/g, '<br>');
        
        // Destaca texto em negrito (**texto**)
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Adiciona estilo para seções
        formatted = formatted.replace(/^(🆔|📍|📞|🗳️|🏢|📧|📮|👤|👩|🗺️) \*\*(.*?)\*\*/gm, 
            '<div class="section-header">$1 <strong>$2</strong></div>');
        
        return formatted;
    }

    /**
     * Atualiza container do chat
     */
    updateChatContainer(additionalHTML = '') {
        let container = document.getElementById('consultation-chat-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'consultation-chat-container';
            container.className = 'consultation-chat-container';
            
            // Adiciona ao DOM
            const targetContainer = document.getElementById('main-content') || document.body;
            targetContainer.appendChild(container);
        }

        container.innerHTML = `
            <div class="consultation-chat">
                <div class="chat-header">
                    <div class="bot-info">
                        <span class="bot-avatar">🤖</span>
                        <div class="bot-details">
                            <span class="bot-name">Sistema de Consultas</span>
                            <span class="bot-status">Conectado via @consultabrpro_bot</span>
                        </div>
                    </div>
                    <div class="chat-actions">
                        <button class="btn-telegram" onclick="window.telegramBotAPI.openTelegramBot()">
                            📱 Abrir Telegram
                        </button>
                        <button class="btn-clear" onclick="dataConsultationChat.clearChat()">
                            🗑️ Limpar
                        </button>
                    </div>
                </div>
                
                <div id="consultation-chat-messages" class="chat-messages">
                    <!-- Mensagens são renderizadas aqui -->
                </div>
                
                <div class="chat-input-area">
                    ${additionalHTML}
                </div>
            </div>
        `;

        this.renderMessages();
    }

    /**
     * Atualiza botão de envio
     */
    updateSubmitButton(isLoading) {
        const button = document.querySelector('.query-submit-btn');
        if (button) {
            button.disabled = isLoading;
            button.innerHTML = isLoading ? '⏳ Consultando...' : '🔍 Consultar';
        }
    }

    /**
     * Mostra erro
     */
    showError(message) {
        this.addBotMessage(`❌ ${message}`);
    }

    /**
     * Atualiza histórico de consultas
     */
    updateQueryHistory(queryType, queryValue, response) {
        const historyEntry = {
            type: queryType,
            value: queryValue,
            response,
            timestamp: new Date()
        };

        // Salva no localStorage
        let history = JSON.parse(localStorage.getItem('orkut_consultation_history') || '[]');
        history.unshift(historyEntry);
        
        // Mantém apenas os últimos 50 itens
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
        
        localStorage.setItem('orkut_consultation_history', JSON.stringify(history));
    }

    /**
     * Limpa chat
     */
    clearChat() {
        if (confirm('Deseja limpar o chat?')) {
            this.messageHistory = [];
            this.currentQuery = null;
            this.isWaitingResponse = false;
            this.renderMessages();
            
            // Adiciona mensagem de boas-vindas
            setTimeout(() => {
                this.addSystemMessage(`💬 Chat limpo! Selecione um tipo de consulta para começar.`);
            }, 100);
        }
    }

    /**
     * Obtém histórico de consultas
     */
    getConsultationHistory() {
        return JSON.parse(localStorage.getItem('orkut_consultation_history') || '[]');
    }

    /**
     * Gera ID único para mensagem
     */
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Inicializa chat com mensagem de boas-vindas
     */
    initializeWelcomeMessage() {
        this.updateChatContainer();
        this.addSystemMessage(`🤖 Olá! Eu sou o sistema de consultas integrado com @consultabrpro_bot.

Clique em um dos botões de consulta abaixo para começar:

📄 CPF - Consulta dados pessoais
🏢 CNPJ - Consulta dados empresariais  
📞 Telefone - Consulta titular da linha
📧 Email - Consulta dados do email
📮 CEP - Consulta endereço e residentes
👤 Nome - Busca por nome completo
🗳️ Título de Eleitor - Dados eleitorais
👩 Nome da Mãe - Busca filhos`);
    }

    /**
     * Status do sistema
     */
    getSystemStatus() {
        return {
            isActive: true,
            messageCount: this.messageHistory.length,
            currentQuery: this.currentQuery,
            waitingResponse: this.isWaitingResponse,
            botStatus: window.telegramBotAPI?.getConnectionStatus() || null
        };
    }
}

// Instância global
window.dataConsultationChat = new DataConsultationChat();

export default DataConsultationChat;
