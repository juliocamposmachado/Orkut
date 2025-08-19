/**
 * Sistema de Logs em Tempo Real
 * Monitora todas as atividades do sistema e exibe erros/eventos
 */

class SystemLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 50; // Máximo de logs para manter na memória
        this.isPaused = false;
        this.container = null;
        this.statsElements = {
            count: null,
            status: null
        };
        
        this.logTypes = {
            'info': { color: '#4CAF50', icon: 'ℹ️' },
            'warn': { color: '#FF9800', icon: '⚠️' },
            'error': { color: '#F44336', icon: '❌' },
            'success': { color: '#8BC34A', icon: '✅' },
            'debug': { color: '#2196F3', icon: '🔍' },
            'ai': { color: '#9C27B0', icon: '🤖' },
            'sync': { color: '#00BCD4', icon: '🔄' },
            'user': { color: '#FF5722', icon: '👤' }
        };

        this.initialize();
    }

    initialize() {
        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.container = document.getElementById('systemLogsContainer');
        this.statsElements.count = document.getElementById('logsCount');
        this.statsElements.status = document.getElementById('logsStatus');

        if (!this.container) {
            console.warn('Sistema de logs: Container não encontrado');
            return;
        }

        this.setupEventListeners();
        this.interceptConsole();
        this.startSystemMonitoring();
        
        this.log('Sistema de logs inicializado', 'success');
        console.log('📋 Sistema de logs em tempo real ativo!');
    }

    setupEventListeners() {
        // Interceptar eventos do sistema AI
        window.addEventListener('database_operation_success', (event) => {
            this.log(`Operação AI bem-sucedida: ${event.detail.operation.type}`, 'ai');
        });

        window.addEventListener('database_operation_failed', (event) => {
            this.log(`Operação AI falhou: ${event.detail.error}`, 'error');
        });

        // Interceptar eventos de sincronização
        window.addEventListener('sync_started', (event) => {
            this.log('Sincronização iniciada', 'sync');
        });

        window.addEventListener('sync_completed', (event) => {
            this.log('Sincronização concluída', 'sync');
        });

        // Interceptar erros JavaScript
        window.addEventListener('error', (event) => {
            this.log(`Erro JavaScript: ${event.error?.message || event.message}`, 'error');
        });

        // Interceptar erros de promessas rejeitadas
        window.addEventListener('unhandledrejection', (event) => {
            this.log(`Promise rejeitada: ${event.reason}`, 'error');
        });

        // Interceptar eventos de rede
        this.monitorNetworkEvents();
    }

    interceptConsole() {
        // Backup das funções originais
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        // Interceptar console.log
        console.log = (...args) => {
            originalLog.apply(console, args);
            const message = args.join(' ');
            if (message.includes('🤖') || message.includes('AI') || message.includes('IA')) {
                this.log(message, 'ai');
            } else if (message.includes('✅') || message.includes('sucesso')) {
                this.log(message, 'success');
            } else {
                this.log(message, 'info');
            }
        };

        // Interceptar console.warn
        console.warn = (...args) => {
            originalWarn.apply(console, args);
            this.log(args.join(' '), 'warn');
        };

        // Interceptar console.error
        console.error = (...args) => {
            originalError.apply(console, args);
            this.log(args.join(' '), 'error');
        };
    }

    monitorNetworkEvents() {
        // Interceptar fetch
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const url = args[0];
            this.log(`Requisição: ${url}`, 'debug');
            
            try {
                const response = await originalFetch.apply(window, args);
                
                if (response.ok) {
                    this.log(`✅ ${response.status} ${url}`, 'success');
                } else {
                    this.log(`❌ ${response.status} ${url}`, 'error');
                }
                
                return response;
            } catch (error) {
                this.log(`❌ Falha na requisição: ${url} - ${error.message}`, 'error');
                throw error;
            }
        };
    }

    startSystemMonitoring() {
        // Monitorar status dos sistemas
        setInterval(() => {
            if (this.isPaused) return;

            this.checkSystemHealth();
        }, 10000); // A cada 10 segundos

        // Monitorar mudanças no localStorage
        this.monitorLocalStorage();

        // Monitorar conexão
        this.monitorConnection();
    }

    checkSystemHealth() {
        let healthStatus = 'Saudável';
        
        // Verificar AI Database Manager
        if (window.AIDatabaseManager) {
            if (window.AIDatabaseManager.initialized) {
                const metrics = window.AIDatabaseManager.getMetrics();
                const queueStatus = window.AIDatabaseManager.getQueueStatus();
                
                if (queueStatus.queueLength > 10) {
                    this.log(`⚠️ Fila AI muito grande: ${queueStatus.queueLength} operações`, 'warn');
                }
                
                if (metrics.failedSyncs > 5) {
                    this.log(`⚠️ Muitas falhas na sincronização: ${metrics.failedSyncs}`, 'warn');
                    healthStatus = 'Instável';
                }
            } else {
                this.log('⚠️ AI Database Manager não inicializado', 'warn');
                healthStatus = 'Degradado';
            }
        } else {
            this.log('❌ AI Database Manager não carregado', 'error');
            healthStatus = 'Crítico';
        }

        // Verificar Smart Sync
        if (window.smartSyncManager) {
            const syncStatus = window.smartSyncManager.getStatus();
            if (!syncStatus.isMonitoring) {
                this.log('⚠️ Smart Sync não está monitorando', 'warn');
            }
        }

        // Atualizar status na UI
        if (this.statsElements.status) {
            this.statsElements.status.textContent = healthStatus;
            this.statsElements.status.className = healthStatus.toLowerCase();
        }
    }

    monitorLocalStorage() {
        let lastStorageSize = this.getStorageSize();
        
        setInterval(() => {
            if (this.isPaused) return;
            
            const currentSize = this.getStorageSize();
            if (Math.abs(currentSize - lastStorageSize) > 1000) { // Mudança > 1KB
                this.log(`💾 LocalStorage alterado: ${this.formatBytes(currentSize)}`, 'debug');
                lastStorageSize = currentSize;
            }
        }, 5000);
    }

    monitorConnection() {
        window.addEventListener('online', () => {
            this.log('🌐 Conexão restaurada', 'success');
        });

        window.addEventListener('offline', () => {
            this.log('🔌 Conexão perdida - modo offline ativo', 'warn');
        });
    }

    log(message, type = 'info') {
        if (this.isPaused) return;

        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            id: Date.now() + Math.random(),
            timestamp,
            message,
            type,
            fullTimestamp: new Date().toISOString()
        };

        // Adicionar à lista
        this.logs.unshift(logEntry);

        // Manter apenas os últimos logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }

        // Atualizar UI
        this.updateUI();
        this.updateStats();
    }

    updateUI() {
        if (!this.container) return;

        // Limpar container
        this.container.innerHTML = '';

        // Mostrar apenas os últimos 15 logs para performance
        const recentLogs = this.logs.slice(0, 15);

        recentLogs.forEach(log => {
            const logElement = this.createLogElement(log);
            this.container.appendChild(logElement);
        });

        // Auto-scroll para o último log
        this.container.scrollTop = 0;
    }

    createLogElement(log) {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${log.type}`;
        
        const typeInfo = this.logTypes[log.type] || this.logTypes['info'];
        
        logEntry.innerHTML = `
            <span class="log-time">${log.timestamp}</span>
            <span class="log-type" style="color: ${typeInfo.color}">${typeInfo.icon}</span>
            <span class="log-message">${this.escapeHtml(log.message)}</span>
        `;

        logEntry.title = `${log.fullTimestamp} - ${log.type.toUpperCase()}: ${log.message}`;

        return logEntry;
    }

    updateStats() {
        if (this.statsElements.count) {
            this.statsElements.count.textContent = `${this.logs.length} log${this.logs.length !== 1 ? 's' : ''}`;
        }
    }

    // Funções públicas para controle
    clearSystemLogs() {
        this.logs = [];
        this.updateUI();
        this.updateStats();
        this.log('Logs limpos pelo usuário', 'info');
    }

    toggleLogsPause() {
        this.isPaused = !this.isPaused;
        const button = event.target;
        
        if (this.isPaused) {
            button.innerHTML = '▶️ Retomar';
            this.statsElements.status.textContent = 'Pausado';
            this.statsElements.status.className = 'paused';
        } else {
            button.innerHTML = '⏸️ Pausar';
            this.log('Logs retomados', 'info');
        }
    }

    exportLogs() {
        const exportData = {
            timestamp: new Date().toISOString(),
            totalLogs: this.logs.length,
            logs: this.logs,
            systemInfo: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                aiDatabaseManager: window.AIDatabaseManager ? 'loaded' : 'not-loaded',
                smartSyncManager: window.smartSyncManager ? 'loaded' : 'not-loaded'
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orkut-system-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.log('Logs exportados pelo usuário', 'success');
    }

    // Métodos utilitários
    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length;
            }
        }
        return total;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // API pública
    info(message) { this.log(message, 'info'); }
    warn(message) { this.log(message, 'warn'); }
    error(message) { this.log(message, 'error'); }
    success(message) { this.log(message, 'success'); }
    debug(message) { this.log(message, 'debug'); }
    ai(message) { this.log(message, 'ai'); }
    sync(message) { this.log(message, 'sync'); }
    user(message) { this.log(message, 'user'); }
}

// Funções globais para uso nos botões
function clearSystemLogs() {
    if (window.systemLogger) {
        window.systemLogger.clearSystemLogs();
    }
}

function toggleLogsPause() {
    if (window.systemLogger) {
        window.systemLogger.toggleLogsPause();
    }
}

function exportLogs() {
    if (window.systemLogger) {
        window.systemLogger.exportLogs();
    }
}

// Inicializar sistema de logs
window.systemLogger = new SystemLogger();

// API global para outros scripts usarem
window.SystemLog = {
    info: (msg) => window.systemLogger?.info(msg),
    warn: (msg) => window.systemLogger?.warn(msg),
    error: (msg) => window.systemLogger?.error(msg),
    success: (msg) => window.systemLogger?.success(msg),
    debug: (msg) => window.systemLogger?.debug(msg),
    ai: (msg) => window.systemLogger?.ai(msg),
    sync: (msg) => window.systemLogger?.sync(msg),
    user: (msg) => window.systemLogger?.user(msg)
};

console.log('📋 Sistema de logs em tempo real carregado!');
