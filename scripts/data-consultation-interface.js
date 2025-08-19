/**
 * Data Consultation Interface - Orkut 2025
 * Interface moderna para consultas de dados via @consultabrpro_bot
 */

class DataConsultationInterface {
    constructor() {
        this.isInitialized = false;
        this.currentView = 'main';
        this.consultationHistory = [];
        
        this.queryTypes = {
            cpf: { name: 'CPF', icon: '📄', color: '#4285F4', description: 'Consulta dados pessoais por CPF' },
            cnpj: { name: 'CNPJ', icon: '🏢', color: '#34A853', description: 'Consulta dados empresariais' },
            telefone: { name: 'Telefone', icon: '📞', color: '#EA4335', description: 'Consulta titular da linha telefônica' },
            email: { name: 'Email', icon: '📧', color: '#FBBC04', description: 'Consulta dados associados ao email' },
            cep: { name: 'CEP', icon: '📮', color: '#9C27B0', description: 'Consulta endereço e residentes' },
            nome: { name: 'Nome', icon: '👤', color: '#FF5722', description: 'Busca por nome completo' },
            titulo_eleitor: { name: 'Título de Eleitor', icon: '🗳️', color: '#607D8B', description: 'Consulta dados eleitorais' },
            nome_mae: { name: 'Nome da Mãe', icon: '👩', color: '#E91E63', description: 'Busca filhos pelo nome da mãe' }
        };

        this.initialize();
    }

    initialize() {
        if (this.isInitialized) return;
        
        console.log('🎯 Inicializando interface de consultas...');
        this.createMainInterface();
        this.setupEventListeners();
        this.loadConsultationHistory();
        this.isInitialized = true;
        
        // Inicializa mensagem de boas-vindas no chat
        if (window.dataConsultationChat) {
            window.dataConsultationChat.initializeWelcomeMessage();
        }
    }

    /**
     * Cria a interface principal
     */
    createMainInterface() {
        const existingInterface = document.getElementById('consultation-interface');
        if (existingInterface) {
            existingInterface.remove();
        }

        const interfaceHTML = `
            <div id="consultation-interface" class="consultation-interface">
                <div class="consultation-header">
                    <div class="header-brand">
                        <h1 class="brand-title">
                            <span class="brand-icon">🔍</span>
                            Orkut Consultas 2025
                        </h1>
                        <p class="brand-subtitle">
                            Sistema integrado com @consultabrpro_bot
                        </p>
                    </div>
                    
                    <div class="header-actions">
                        <button class="action-btn telegram-btn" onclick="consultationInterface.openTelegram()">
                            <span class="btn-icon">📱</span>
                            Telegram
                        </button>
                        <button class="action-btn history-btn" onclick="consultationInterface.toggleHistory()">
                            <span class="btn-icon">📊</span>
                            Histórico
                        </button>
                        <button class="action-btn settings-btn" onclick="consultationInterface.toggleSettings()">
                            <span class="btn-icon">⚙️</span>
                            Config
                        </button>
                    </div>
                </div>

                <div class="consultation-content">
                    <div id="main-consultation-view" class="consultation-view active">
                        <div class="consultation-intro">
                            <h2>Escolha o tipo de consulta:</h2>
                            <p>Clique em uma das opções abaixo para começar a busca</p>
                        </div>

                        <div class="consultation-grid">
                            ${this.renderConsultationButtons()}
                        </div>

                        <div class="quick-stats">
                            <div class="stat-card">
                                <div class="stat-icon">📊</div>
                                <div class="stat-content">
                                    <div class="stat-number" id="total-consultations">0</div>
                                    <div class="stat-label">Consultas Totais</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">🎯</div>
                                <div class="stat-content">
                                    <div class="stat-number" id="successful-consultations">0</div>
                                    <div class="stat-label">Sucessos</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">⚡</div>
                                <div class="stat-content">
                                    <div class="stat-number" id="avg-response-time">0ms</div>
                                    <div class="stat-label">Tempo Médio</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="history-view" class="consultation-view">
                        <div class="view-header">
                            <h2>Histórico de Consultas</h2>
                            <button class="close-view-btn" onclick="consultationInterface.showMainView()">✕</button>
                        </div>
                        <div id="history-content" class="history-content">
                            <!-- Histórico será renderizado aqui -->
                        </div>
                    </div>

                    <div id="settings-view" class="consultation-view">
                        <div class="view-header">
                            <h2>Configurações</h2>
                            <button class="close-view-btn" onclick="consultationInterface.showMainView()">✕</button>
                        </div>
                        <div class="settings-content">
                            ${this.renderSettingsPanel()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Adiciona ao DOM
        const targetContainer = document.getElementById('main-content') || document.body;
        targetContainer.insertAdjacentHTML('afterbegin', interfaceHTML);

        // Atualiza estatísticas
        this.updateStats();
    }

    /**
     * Renderiza botões de consulta
     */
    renderConsultationButtons() {
        return Object.entries(this.queryTypes).map(([key, info]) => {
            return `
                <div class="consultation-card" 
                     data-query-type="${key}" 
                     style="--card-color: ${info.color}">
                    <div class="card-header">
                        <span class="card-icon">${info.icon}</span>
                        <h3 class="card-title">${info.name}</h3>
                    </div>
                    <p class="card-description">${info.description}</p>
                    <div class="card-actions">
                        <button class="consultation-btn" 
                                data-query-type="${key}">
                            <span class="btn-text">Consultar ${info.name}</span>
                            <span class="btn-arrow">→</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Renderiza painel de configurações
     */
    renderSettingsPanel() {
        return `
            <div class="settings-panel">
                <div class="setting-group">
                    <h3>Conexão com Telegram</h3>
                    <div class="setting-item">
                        <label>Status do Bot:</label>
                        <span class="status-indicator" id="bot-status">🟢 Conectado</span>
                    </div>
                    <div class="setting-item">
                        <label>Bot ID:</label>
                        <span class="setting-value">@consultabrpro_bot</span>
                    </div>
                </div>

                <div class="setting-group">
                    <h3>Preferências de Interface</h3>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="auto-clear-chat" checked>
                            Auto-limpar chat após consulta
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="show-notifications" checked>
                            Mostrar notificações
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="save-history" checked>
                            Salvar histórico de consultas
                        </label>
                    </div>
                </div>

                <div class="setting-group">
                    <h3>Dados e Privacidade</h3>
                    <div class="setting-actions">
                        <button class="setting-btn danger" onclick="consultationInterface.clearAllData()">
                            🗑️ Limpar Todos os Dados
                        </button>
                        <button class="setting-btn" onclick="consultationInterface.exportHistory()">
                            📥 Exportar Histórico
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Cliques em botões de consulta
        document.addEventListener('click', (e) => {
            if (e.target.closest('.consultation-btn')) {
                const btn = e.target.closest('.consultation-btn');
                const queryType = btn.dataset.queryType;
                this.startConsultation(queryType);
            }
        });

        // Animações de hover nos cards
        document.addEventListener('mouseenter', (e) => {
            if (e.target.closest('.consultation-card')) {
                e.target.closest('.consultation-card').classList.add('hovered');
            }
        });

        document.addEventListener('mouseleave', (e) => {
            if (e.target.closest('.consultation-card')) {
                e.target.closest('.consultation-card').classList.remove('hovered');
            }
        });

        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.startConsultation('cpf');
                        break;
                    case '2':
                        e.preventDefault();
                        this.startConsultation('cnpj');
                        break;
                    case 'h':
                        e.preventDefault();
                        this.toggleHistory();
                        break;
                    case 'Escape':
                        this.showMainView();
                        break;
                }
            }
        });
    }

    /**
     * Inicia consulta
     */
    startConsultation(queryType) {
        console.log(`🚀 Iniciando consulta: ${queryType}`);
        
        // Adiciona efeito visual no botão
        const card = document.querySelector(`[data-query-type="${queryType}"]`);
        if (card) {
            card.classList.add('consulting');
            setTimeout(() => card.classList.remove('consulting'), 1000);
        }

        // Delega para o sistema de chat
        if (window.dataConsultationChat) {
            window.dataConsultationChat.startQuery(queryType);
        } else {
            console.error('Sistema de chat não encontrado!');
            this.showNotification('❌ Sistema de chat não disponível', 'error');
        }

        // Scroll para o chat
        setTimeout(() => {
            const chatContainer = document.getElementById('consultation-chat-container');
            if (chatContainer) {
                chatContainer.scrollIntoView({ behavior: 'smooth' });
            }
        }, 500);
    }

    /**
     * Mostra/oculta histórico
     */
    toggleHistory() {
        const historyView = document.getElementById('history-view');
        const mainView = document.getElementById('main-consultation-view');
        
        if (historyView.classList.contains('active')) {
            this.showMainView();
        } else {
            mainView.classList.remove('active');
            historyView.classList.add('active');
            this.renderHistory();
        }
    }

    /**
     * Mostra/oculta configurações
     */
    toggleSettings() {
        const settingsView = document.getElementById('settings-view');
        const mainView = document.getElementById('main-consultation-view');
        
        if (settingsView.classList.contains('active')) {
            this.showMainView();
        } else {
            mainView.classList.remove('active');
            settingsView.classList.add('active');
        }
    }

    /**
     * Mostra view principal
     */
    showMainView() {
        document.querySelectorAll('.consultation-view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById('main-consultation-view').classList.add('active');
    }

    /**
     * Renderiza histórico
     */
    renderHistory() {
        const historyContainer = document.getElementById('history-content');
        const history = this.getConsultationHistory();

        if (history.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h3>Nenhuma consulta realizada</h3>
                    <p>Suas consultas aparecerão aqui após serem realizadas.</p>
                </div>
            `;
            return;
        }

        const historyHTML = history.map(entry => {
            const queryInfo = this.queryTypes[entry.type];
            const timeString = entry.timestamp ? new Date(entry.timestamp).toLocaleString('pt-BR') : 'Data inválida';
            
            return `
                <div class="history-entry">
                    <div class="entry-header">
                        <span class="entry-icon" style="color: ${queryInfo.color}">${queryInfo.icon}</span>
                        <div class="entry-info">
                            <h4>${queryInfo.name}: ${entry.value}</h4>
                            <span class="entry-time">${timeString}</span>
                        </div>
                        <button class="entry-action" onclick="consultationInterface.repeatConsultation('${entry.type}', '${entry.value}')">
                            🔄 Repetir
                        </button>
                    </div>
                    <div class="entry-result">
                        ${this.formatHistoryResult(entry.response)}
                    </div>
                </div>
            `;
        }).join('');

        historyContainer.innerHTML = historyHTML;
    }

    /**
     * Formata resultado no histórico
     */
    formatHistoryResult(response) {
        if (!response) return '<em>Sem resultado</em>';
        
        if (typeof response === 'string') return response;
        
        return Object.entries(response)
            .filter(([key, value]) => value)
            .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
            .join('<br>');
    }

    /**
     * Repete consulta do histórico
     */
    repeatConsultation(queryType, queryValue) {
        this.showMainView();
        
        // Simula preenchimento e envio
        setTimeout(() => {
            if (window.dataConsultationChat) {
                window.dataConsultationChat.startQuery(queryType);
                
                setTimeout(() => {
                    const input = document.querySelector('.query-input');
                    if (input) {
                        input.value = queryValue;
                        const form = input.closest('form');
                        if (form) {
                            form.dispatchEvent(new Event('submit'));
                        }
                    }
                }, 500);
            }
        }, 100);
    }

    /**
     * Atualiza estatísticas
     */
    updateStats() {
        const history = this.getConsultationHistory();
        const totalElement = document.getElementById('total-consultations');
        const successElement = document.getElementById('successful-consultations');
        const timeElement = document.getElementById('avg-response-time');

        if (totalElement) totalElement.textContent = history.length;
        if (successElement) successElement.textContent = history.filter(h => h.response).length;
        if (timeElement) timeElement.textContent = '250ms'; // Simulado
    }

    /**
     * Carrega histórico de consultas
     */
    loadConsultationHistory() {
        try {
            const history = localStorage.getItem('orkut_consultation_history');
            this.consultationHistory = history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            this.consultationHistory = [];
        }
    }

    /**
     * Obtém histórico de consultas
     */
    getConsultationHistory() {
        if (window.dataConsultationChat) {
            return window.dataConsultationChat.getConsultationHistory();
        }
        return this.consultationHistory;
    }

    /**
     * Abre Telegram
     */
    openTelegram() {
        if (window.telegramBotAPI) {
            window.telegramBotAPI.openTelegramBot();
        } else {
            window.open('https://web.telegram.org/k/#@consultabrpro_bot', '_blank');
        }
    }

    /**
     * Limpa todos os dados
     */
    clearAllData() {
        if (confirm('⚠️ Isso irá remover todo o histórico e dados salvos. Continuar?')) {
            localStorage.removeItem('orkut_consultation_history');
            this.consultationHistory = [];
            
            if (window.dataConsultationChat) {
                window.dataConsultationChat.clearChat();
            }
            
            this.updateStats();
            this.showNotification('✅ Dados removidos com sucesso', 'success');
        }
    }

    /**
     * Exporta histórico
     */
    exportHistory() {
        const history = this.getConsultationHistory();
        const dataStr = JSON.stringify(history, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `orkut-consultas-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('✅ Histórico exportado', 'success');
    }

    /**
     * Mostra notificação
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            zIndex: '10000',
            backgroundColor: type === 'error' ? '#f44336' : 
                           type === 'success' ? '#4caf50' : '#2196f3'
        });
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Status do sistema
     */
    getSystemStatus() {
        return {
            isInitialized: this.isInitialized,
            currentView: this.currentView,
            totalConsultations: this.getConsultationHistory().length,
            availableQueryTypes: Object.keys(this.queryTypes),
            chatSystem: window.dataConsultationChat?.getSystemStatus() || null
        };
    }
}

// Instância global
window.consultationInterface = new DataConsultationInterface();

export default DataConsultationInterface;
