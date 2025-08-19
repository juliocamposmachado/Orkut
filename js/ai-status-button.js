// Sistema de Botão de IA com Indicadores Visuais
class AIStatusButton {
    constructor() {
        this.currentStatus = 'idle'; // idle, updating, queued, error
        this.updateQueue = [];
        this.isProcessing = false;
        this.dbStatus = 'free'; // free, busy
        
        this.init();
    }

    init() {
        this.createButton();
        this.setupEventListeners();
        this.startStatusMonitoring();
    }

    createButton() {
        // Remove botão existente se houver
        const existingButton = document.getElementById('ai-status-button');
        if (existingButton) {
            existingButton.remove();
        }

        const button = document.createElement('div');
        button.id = 'ai-status-button';
        button.className = 'ai-status-button';
        button.innerHTML = `
            <div class="ai-button-container">
                <div class="ai-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                        <path d="M19.5 8.5L20.5 12L19.5 15.5L16 14.5L19.5 8.5Z" fill="currentColor"/>
                        <path d="M4.5 8.5L8 14.5L4.5 15.5L3.5 12L4.5 8.5Z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="ai-status-text">IA</div>
                <div class="ai-status-indicator"></div>
                <div class="ai-pulse-ring"></div>
            </div>
            <div class="ai-tooltip">
                <div class="tooltip-content">
                    <div class="tooltip-title">Status da IA</div>
                    <div class="tooltip-status">Sistema Pronto</div>
                    <div class="tooltip-queue">Fila: 0 tarefas</div>
                </div>
            </div>
        `;

        // Adicionar ao header ou local específico
        const header = document.querySelector('header') || document.querySelector('.header') || document.body;
        header.appendChild(button);

        this.button = button;
        this.updateVisualStatus('idle');
    }

    setupEventListeners() {
        this.button.addEventListener('click', () => {
            this.showDetailedStatus();
        });

        this.button.addEventListener('mouseenter', () => {
            this.showTooltip();
        });

        this.button.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
    }

    updateVisualStatus(status, message = '') {
        this.currentStatus = status;
        const button = this.button;
        const indicator = button.querySelector('.ai-status-indicator');
        const tooltip = button.querySelector('.tooltip-status');
        const queueInfo = button.querySelector('.tooltip-queue');

        // Remove todas as classes de status
        button.classList.remove('status-idle', 'status-updating', 'status-queued', 'status-error');
        
        switch (status) {
            case 'idle':
                button.classList.add('status-idle');
                tooltip.textContent = 'Sistema Pronto';
                break;
            case 'updating':
                button.classList.add('status-updating');
                tooltip.textContent = message || 'Atualizando Banco de Dados...';
                break;
            case 'queued':
                button.classList.add('status-queued');
                tooltip.textContent = 'Na Fila de Atualizações';
                break;
            case 'error':
                button.classList.add('status-error');
                tooltip.textContent = message || 'Erro no Sistema';
                break;
        }

        queueInfo.textContent = `Fila: ${this.updateQueue.length} tarefas`;
    }

    async processUpdate(action, data) {
        const updateId = Date.now() + Math.random();
        const updateInfo = {
            id: updateId,
            action: action,
            data: data,
            timestamp: new Date(),
            status: 'pending'
        };

        this.updateQueue.push(updateInfo);
        this.updateVisualStatus('queued');

        // Log da ação
        LogSystem.addLog(`Adicionado à fila: ${action}`, 'info');

        if (!this.isProcessing) {
            await this.processQueue();
        }

        return updateId;
    }

    async processQueue() {
        if (this.isProcessing || this.updateQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        while (this.updateQueue.length > 0) {
            const update = this.updateQueue.shift();
            
            try {
                this.updateVisualStatus('updating', `Processando: ${update.action}`);
                LogSystem.addLog(`Ativando backend para: ${update.action}`, 'system');

                // Simular verificação de status do banco
                await this.checkDatabaseStatus();

                if (this.dbStatus === 'busy') {
                    // Recolocar na fila se banco estiver ocupado
                    this.updateQueue.unshift(update);
                    this.updateVisualStatus('queued', 'Banco de dados ocupado');
                    LogSystem.addLog('Banco de dados ocupado, aguardando...', 'warning');
                    await this.wait(2000);
                    continue;
                }

                // Processar a atualização
                LogSystem.addLog('Atualizando banco de dados...', 'system');
                await this.executeUpdate(update);
                
                LogSystem.addLog(`Banco de dados atualizado: ${update.action}`, 'success');

            } catch (error) {
                console.error('Erro ao processar atualização:', error);
                this.updateVisualStatus('error', `Erro: ${update.action}`);
                LogSystem.addLog(`Erro ao processar: ${update.action} - ${error.message}`, 'error');
                await this.wait(3000);
            }
        }

        this.isProcessing = false;
        this.updateVisualStatus('idle');
        LogSystem.addLog('Todas as atualizações processadas', 'success');
    }

    async checkDatabaseStatus() {
        // Simular verificação do status do banco
        // Em produção, isso faria uma requisição real
        this.dbStatus = Math.random() > 0.8 ? 'busy' : 'free';
        return this.dbStatus;
    }

    async executeUpdate(update) {
        // Simular tempo de processamento
        await this.wait(1000 + Math.random() * 2000);

        // Aqui seria feita a requisição real para o backend
        const response = await fetch('/api/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(update)
        }).catch(() => {
            // Simular sucesso se não houver backend
            return { ok: true };
        });

        if (!response.ok) {
            throw new Error('Falha na atualização do banco de dados');
        }

        return response;
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showDetailedStatus() {
        const modal = document.createElement('div');
        modal.className = 'ai-status-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Status do Sistema IA</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="status-info">
                        <div class="status-item">
                            <label>Status Atual:</label>
                            <span class="status-value ${this.currentStatus}">${this.getStatusText()}</span>
                        </div>
                        <div class="status-item">
                            <label>Banco de Dados:</label>
                            <span class="db-status ${this.dbStatus}">${this.dbStatus === 'free' ? 'Livre' : 'Ocupado'}</span>
                        </div>
                        <div class="status-item">
                            <label>Fila de Atualizações:</label>
                            <span class="queue-count">${this.updateQueue.length} tarefas</span>
                        </div>
                    </div>
                    <div class="queue-details">
                        <h4>Próximas Atualizações:</h4>
                        <div class="queue-list">
                            ${this.updateQueue.map((item, index) => `
                                <div class="queue-item">
                                    <span class="queue-position">${index + 1}.</span>
                                    <span class="queue-action">${item.action}</span>
                                    <span class="queue-time">${this.formatTime(item.timestamp)}</span>
                                </div>
                            `).join('') || '<div class="no-queue">Nenhuma tarefa na fila</div>'}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    getStatusText() {
        switch (this.currentStatus) {
            case 'idle': return 'Sistema Pronto';
            case 'updating': return 'Atualizando';
            case 'queued': return 'Na Fila';
            case 'error': return 'Erro';
            default: return 'Desconhecido';
        }
    }

    showTooltip() {
        const tooltip = this.button.querySelector('.ai-tooltip');
        tooltip.style.display = 'block';
    }

    hideTooltip() {
        const tooltip = this.button.querySelector('.ai-tooltip');
        tooltip.style.display = 'none';
    }

    formatTime(date) {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    startStatusMonitoring() {
        // Monitorar status do banco periodicamente
        setInterval(async () => {
            if (!this.isProcessing) {
                await this.checkDatabaseStatus();
            }
        }, 5000);
    }
}

// Instanciar o sistema quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.aiStatusButton = new AIStatusButton();
});
