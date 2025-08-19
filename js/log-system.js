// Sistema de Logs em Tempo Real
class LogSystem {
    constructor() {
        this.logs = [];
        this.maxLogs = 100;
        this.isVisible = true;
        
        this.init();
    }

    init() {
        this.createLogPanel();
        this.setupEventListeners();
        this.startUserActionTracking();
    }

    createLogPanel() {
        // Remove painel existente se houver
        const existingPanel = document.getElementById('log-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        const panel = document.createElement('div');
        panel.id = 'log-panel';
        panel.className = 'log-panel';
        panel.innerHTML = `
            <div class="log-header">
                <div class="log-title">
                    <span class="log-icon">📋</span>
                    Logs do Sistema
                </div>
                <div class="log-controls">
                    <button class="log-filter" data-filter="all" title="Todos">🔍</button>
                    <button class="log-clear" title="Limpar Logs">🗑️</button>
                    <button class="log-toggle" title="Minimizar/Expandir">📌</button>
                </div>
            </div>
            <div class="log-filters">
                <button class="filter-btn active" data-filter="all">Todos</button>
                <button class="filter-btn" data-filter="user">Usuário</button>
                <button class="filter-btn" data-filter="system">Sistema</button>
                <button class="filter-btn" data-filter="success">Sucesso</button>
                <button class="filter-btn" data-filter="warning">Avisos</button>
                <button class="filter-btn" data-filter="error">Erros</button>
            </div>
            <div class="log-content">
                <div class="log-list"></div>
            </div>
            <div class="log-stats">
                <span class="log-count">0 logs</span>
                <span class="log-time">Última atividade: --:--:--</span>
            </div>
        `;

        document.body.appendChild(panel);
        this.panel = panel;
        this.logList = panel.querySelector('.log-list');
        this.currentFilter = 'all';

        this.addLog('Sistema de logs iniciado', 'system');
    }

    setupEventListeners() {
        // Controles do painel
        this.panel.querySelector('.log-clear').addEventListener('click', () => {
            this.clearLogs();
        });

        this.panel.querySelector('.log-toggle').addEventListener('click', () => {
            this.togglePanel();
        });

        // Filtros
        this.panel.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Auto-scroll quando novos logs são adicionados
        this.logList.addEventListener('DOMNodeInserted', () => {
            this.scrollToBottom();
        });
    }

    addLog(message, type = 'info', data = null) {
        const timestamp = new Date();
        const logEntry = {
            id: Date.now() + Math.random(),
            message: message,
            type: type,
            timestamp: timestamp,
            data: data
        };

        this.logs.unshift(logEntry);

        // Limitar número de logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }

        this.renderLog(logEntry);
        this.updateStats();

        // Scroll automático para novos logs
        setTimeout(() => this.scrollToBottom(), 100);
    }

    renderLog(logEntry) {
        const logElement = document.createElement('div');
        logElement.className = `log-entry log-${logEntry.type}`;
        logElement.dataset.type = logEntry.type;
        logElement.dataset.id = logEntry.id;

        const timeStr = logEntry.timestamp.toLocaleTimeString('pt-BR');
        
        logElement.innerHTML = `
            <div class="log-time">${timeStr}</div>
            <div class="log-type-icon">${this.getTypeIcon(logEntry.type)}</div>
            <div class="log-message">${logEntry.message}</div>
            ${logEntry.data ? `<div class="log-data">${JSON.stringify(logEntry.data, null, 2)}</div>` : ''}
        `;

        // Adicionar no topo da lista
        this.logList.insertBefore(logElement, this.logList.firstChild);

        // Aplicar filtro atual
        if (this.currentFilter !== 'all' && this.currentFilter !== logEntry.type) {
            logElement.style.display = 'none';
        }

        // Remover logs antigos do DOM
        const logElements = this.logList.querySelectorAll('.log-entry');
        if (logElements.length > this.maxLogs) {
            for (let i = this.maxLogs; i < logElements.length; i++) {
                logElements[i].remove();
            }
        }
    }

    getTypeIcon(type) {
        const icons = {
            'user': '👤',
            'system': '⚙️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'info': 'ℹ️',
            'click': '🖱️',
            'edit': '✏️',
            'save': '💾',
            'delete': '🗑️',
            'upload': '📤',
            'download': '📥'
        };
        return icons[type] || 'ℹ️';
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Atualizar botões de filtro
        this.panel.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Aplicar filtro
        this.logList.querySelectorAll('.log-entry').forEach(entry => {
            if (filter === 'all' || entry.dataset.type === filter) {
                entry.style.display = 'flex';
            } else {
                entry.style.display = 'none';
            }
        });
    }

    clearLogs() {
        this.logs = [];
        this.logList.innerHTML = '';
        this.updateStats();
        this.addLog('Logs limpos', 'system');
    }

    togglePanel() {
        this.panel.classList.toggle('minimized');
        this.isVisible = !this.panel.classList.contains('minimized');
    }

    updateStats() {
        const countElement = this.panel.querySelector('.log-count');
        const timeElement = this.panel.querySelector('.log-time');
        
        countElement.textContent = `${this.logs.length} logs`;
        
        if (this.logs.length > 0) {
            const lastTime = this.logs[0].timestamp.toLocaleTimeString('pt-BR');
            timeElement.textContent = `Última atividade: ${lastTime}`;
        }
    }

    scrollToBottom() {
        this.logList.scrollTop = this.logList.scrollHeight;
    }

    startUserActionTracking() {
        // Rastrear cliques
        document.addEventListener('click', (e) => {
            const element = e.target;
            const tagName = element.tagName.toLowerCase();
            let description = `Clicou em ${tagName}`;

            // Identificar melhor o elemento clicado
            if (element.id) {
                description += ` (id: ${element.id})`;
            } else if (element.className) {
                description += ` (class: ${element.className})`;
            } else if (element.textContent && element.textContent.length < 50) {
                description += ` ("${element.textContent.trim()}")`;
            }

            // Ações específicas
            if (element.matches('button, [role="button"]')) {
                this.addLog(`Clicou no botão: ${element.textContent || element.title || 'sem texto'}`, 'click');
            } else if (element.matches('a')) {
                this.addLog(`Clicou no link: ${element.href || element.textContent}`, 'click');
            } else if (element.matches('.profile-edit, .edit-profile')) {
                this.addLog('Acessou edição de perfil', 'user');
            } else if (element.matches('.save, [type="submit"]')) {
                this.addLog('Clicou em salvar', 'save');
            } else {
                this.addLog(description, 'click');
            }
        });

        // Rastrear mudanças em formulários
        document.addEventListener('input', (e) => {
            const element = e.target;
            
            if (element.matches('input, textarea, select')) {
                let fieldName = element.name || element.id || element.placeholder || 'campo';
                let action = 'editou';
                
                if (element.type === 'file') {
                    action = 'selecionou arquivo para';
                } else if (element.type === 'checkbox' || element.type === 'radio') {
                    action = element.checked ? 'marcou' : 'desmarcou';
                }
                
                this.addLog(`${action.charAt(0).toUpperCase() + action.slice(1)} ${fieldName}`, 'edit');
            }
        });

        // Rastrear submissões de formulário
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const formName = form.name || form.id || 'formulário';
            
            this.addLog(`Enviou ${formName}`, 'save');
            
            // Simular processo de backend
            setTimeout(() => {
                this.addLog('Ativando backend para atualizar banco de dados', 'system');
                
                setTimeout(() => {
                    this.addLog('Atualizando banco de dados', 'system');
                    
                    setTimeout(() => {
                        this.addLog(`Banco de dados atualizado com as informações do ${formName}`, 'success');
                    }, 1000);
                }, 500);
            }, 200);
        });

        // Rastrear navegação
        let currentPage = window.location.pathname;
        setInterval(() => {
            if (window.location.pathname !== currentPage) {
                this.addLog(`Navegou para: ${window.location.pathname}`, 'user');
                currentPage = window.location.pathname;
            }
        }, 1000);
    }

    // Métodos públicos para integração
    static addLog(message, type = 'info', data = null) {
        if (window.logSystem) {
            window.logSystem.addLog(message, type, data);
        }
    }

    static logUserAction(action, details = {}) {
        if (window.logSystem) {
            window.logSystem.addLog(action, 'user', details);
        }
    }

    static logSystemAction(action, details = {}) {
        if (window.logSystem) {
            window.logSystem.addLog(action, 'system', details);
        }
    }

    static logProfileEdit(field, oldValue, newValue) {
        if (window.logSystem) {
            const message = `Editou ${field}: "${oldValue}" → "${newValue}"`;
            window.logSystem.addLog(message, 'edit', { field, oldValue, newValue });
        }
    }
}

// Instanciar o sistema quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.logSystem = new LogSystem();
});
