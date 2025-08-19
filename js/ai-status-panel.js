/**
 * AI Status Panel - Painel de Status da IA Database Manager
 * Mostra informações sobre operações em tempo real
 */

class AIStatusPanel {
    constructor() {
        this.panel = null;
        this.isVisible = false;
        this.refreshInterval = null;
        this.updateFrequency = 2000; // 2 segundos
        
        this.initialize();
    }

    initialize() {
        this.createPanel();
        this.attachEventListeners();
        this.waitForSystems();
    }

    async waitForSystems() {
        const waitForSystem = () => {
            if (window.AIDatabaseManager && window.smartSyncManager) {
                this.startMonitoring();
                console.log('📊 AI Status Panel ativo!');
            } else {
                setTimeout(waitForSystem, 500);
            }
        };
        waitForSystem();
    }

    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'ai-status-panel';
        panel.className = 'ai-status-panel hidden';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>🤖 AI Database Manager Status</h3>
                <button class="close-panel" title="Fechar">×</button>
            </div>
            
            <div class="panel-content">
                <div class="status-section">
                    <h4>📊 Métricas Gerais</h4>
                    <div class="metrics-grid">
                        <div class="metric">
                            <span class="metric-label">Status:</span>
                            <span class="metric-value" id="ai-status">Carregando...</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Operações Processadas:</span>
                            <span class="metric-value" id="operations-count">0</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Sucessos:</span>
                            <span class="metric-value success" id="success-count">0</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Falhas:</span>
                            <span class="metric-value error" id="error-count">0</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Tempo Médio:</span>
                            <span class="metric-value" id="avg-time">0ms</span>
                        </div>
                    </div>
                </div>

                <div class="status-section">
                    <h4>🔄 Sincronização</h4>
                    <div class="sync-info">
                        <div class="sync-item">
                            <span class="label">Fila de Operações:</span>
                            <span class="value" id="queue-length">0</span>
                        </div>
                        <div class="sync-item">
                            <span class="label">Processando:</span>
                            <span class="value" id="processing-status">Não</span>
                        </div>
                        <div class="sync-item">
                            <span class="label">Última Sincronização:</span>
                            <span class="value" id="last-sync">Nunca</span>
                        </div>
                        <div class="sync-item">
                            <span class="label">Mudanças Pendentes:</span>
                            <span class="value" id="pending-changes">0</span>
                        </div>
                    </div>
                </div>

                <div class="status-section">
                    <h4>💾 Dados Locais</h4>
                    <div class="local-data-info">
                        <div class="data-item">
                            <span class="label">Usuário:</span>
                            <span class="value" id="user-status">-</span>
                        </div>
                        <div class="data-item">
                            <span class="label">Posts Locais:</span>
                            <span class="value" id="local-posts-count">0</span>
                        </div>
                        <div class="data-item">
                            <span class="label">Interações:</span>
                            <span class="value" id="interactions-count">0</span>
                        </div>
                        <div class="data-item">
                            <span class="label">Operações Pendentes:</span>
                            <span class="value" id="pending-operations">0</span>
                        </div>
                    </div>
                </div>

                <div class="status-section">
                    <h4>🔧 Ações</h4>
                    <div class="actions">
                        <button class="action-btn" onclick="aiStatusPanel.forceSync()">
                            🔄 Forçar Sincronização
                        </button>
                        <button class="action-btn" onclick="aiStatusPanel.clearLocalData()">
                            🗑️ Limpar Cache Local
                        </button>
                        <button class="action-btn" onclick="aiStatusPanel.exportData()">
                            📤 Exportar Dados
                        </button>
                    </div>
                </div>

                <div class="status-section">
                    <h4>📋 Log de Atividades</h4>
                    <div class="activity-log" id="activity-log">
                        <div class="log-entry">Sistema iniciado</div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        this.panel = panel;

        // Adicionar CSS
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ai-status-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 400px;
                max-height: 80vh;
                background: #1a1a1a;
                border: 2px solid #333;
                border-radius: 8px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.5);
                z-index: 10000;
                font-family: 'Courier New', monospace;
                color: #fff;
                overflow-y: auto;
            }

            .ai-status-panel.hidden {
                display: none;
            }

            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid #333;
                background: #2a2a2a;
            }

            .panel-header h3 {
                margin: 0;
                font-size: 16px;
                color: #4CAF50;
            }

            .close-panel {
                background: none;
                border: none;
                color: #fff;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                transition: background 0.3s;
            }

            .close-panel:hover {
                background: #444;
            }

            .panel-content {
                padding: 15px;
            }

            .status-section {
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #333;
            }

            .status-section:last-child {
                border-bottom: none;
            }

            .status-section h4 {
                margin: 0 0 10px 0;
                font-size: 14px;
                color: #FFD700;
            }

            .metrics-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }

            .metric {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .metric-label {
                font-size: 11px;
                color: #aaa;
            }

            .metric-value {
                font-size: 14px;
                font-weight: bold;
                color: #fff;
            }

            .metric-value.success {
                color: #4CAF50;
            }

            .metric-value.error {
                color: #f44336;
            }

            .sync-info, .local-data-info {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .sync-item, .data-item {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
            }

            .sync-item .label, .data-item .label {
                color: #aaa;
            }

            .sync-item .value, .data-item .value {
                color: #fff;
                font-weight: bold;
            }

            .actions {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .action-btn {
                background: #444;
                border: 1px solid #666;
                color: #fff;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: background 0.3s;
            }

            .action-btn:hover {
                background: #555;
            }

            .activity-log {
                background: #000;
                border: 1px solid #333;
                border-radius: 4px;
                height: 120px;
                overflow-y: auto;
                padding: 8px;
                font-size: 11px;
            }

            .log-entry {
                padding: 2px 0;
                border-bottom: 1px solid #222;
                color: #ccc;
            }

            .log-entry:last-child {
                border-bottom: none;
            }

            .log-entry.success {
                color: #4CAF50;
            }

            .log-entry.error {
                color: #f44336;
            }

            .log-entry.warning {
                color: #ff9800;
            }

            /* Toggle button */
            .ai-toggle-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 50%;
                width: 60px;
                height: 60px;
                font-size: 24px;
                cursor: pointer;
                z-index: 9999;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                transition: transform 0.3s, background 0.3s;
            }

            .ai-toggle-btn:hover {
                transform: scale(1.1);
                background: #45a049;
            }
        `;
        document.head.appendChild(style);

        // Adicionar botão de toggle
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'ai-toggle-btn';
        toggleBtn.innerHTML = '🤖';
        toggleBtn.title = 'AI Status Panel';
        toggleBtn.onclick = () => this.togglePanel();
        document.body.appendChild(toggleBtn);
    }

    attachEventListeners() {
        // Fechar painel
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-panel')) {
                this.hidePanel();
            }
        });

        // Escutar eventos do AI Database Manager
        window.addEventListener('database_operation_success', (event) => {
            this.logActivity(`✅ Operação ${event.detail.operation.type} concluída`, 'success');
        });

        window.addEventListener('database_operation_failed', (event) => {
            this.logActivity(`❌ Operação falhou: ${event.detail.error}`, 'error');
        });

        // Atalho de teclado para toggle (Ctrl+Shift+A)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.togglePanel();
            }
        });
    }

    startMonitoring() {
        this.refreshInterval = setInterval(() => {
            this.updateStatus();
        }, this.updateFrequency);
        
        this.updateStatus();
    }

    updateStatus() {
        if (!this.isVisible || !this.panel) return;

        try {
            // Métricas do AI Database Manager
            if (window.AIDatabaseManager) {
                const metrics = window.AIDatabaseManager.getMetrics();
                const queueStatus = window.AIDatabaseManager.getQueueStatus();
                
                document.getElementById('ai-status').textContent = 
                    window.AIDatabaseManager.initialized ? 'Ativo' : 'Inicializando';
                document.getElementById('operations-count').textContent = metrics.operationsProcessed;
                document.getElementById('success-count').textContent = metrics.successfulSyncs;
                document.getElementById('error-count').textContent = metrics.failedSyncs;
                document.getElementById('avg-time').textContent = Math.round(metrics.averageResponseTime) + 'ms';
                
                document.getElementById('queue-length').textContent = queueStatus.queueLength;
                document.getElementById('processing-status').textContent = 
                    queueStatus.isProcessing ? 'Sim' : 'Não';
                document.getElementById('last-sync').textContent = 
                    queueStatus.lastSyncTime ? new Date(queueStatus.lastSyncTime).toLocaleTimeString() : 'Nunca';
            }

            // Smart Sync Status
            if (window.smartSyncManager) {
                const syncStatus = window.smartSyncManager.getStatus();
                document.getElementById('pending-changes').textContent = syncStatus.pendingChanges;
            }

            // Dados locais
            const userData = localStorage.getItem('orkut_user');
            document.getElementById('user-status').textContent = userData ? 'Logado' : 'Não logado';
            
            const localPosts = JSON.parse(localStorage.getItem('local_posts') || '[]');
            document.getElementById('local-posts-count').textContent = localPosts.length;
            
            const interactions = JSON.parse(localStorage.getItem('local_interactions') || '[]');
            document.getElementById('interactions-count').textContent = interactions.length;
            
            const pendingOps = JSON.parse(localStorage.getItem('pending_operations') || '[]');
            document.getElementById('pending-operations').textContent = pendingOps.length;

        } catch (error) {
            console.error('Erro ao atualizar status panel:', error);
        }
    }

    logActivity(message, type = 'info') {
        const log = document.getElementById('activity-log');
        if (!log) return;

        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
        
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;

        // Manter apenas últimas 50 entradas
        while (log.children.length > 50) {
            log.removeChild(log.firstChild);
        }
    }

    togglePanel() {
        if (this.isVisible) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }

    showPanel() {
        if (!this.panel) return;
        
        this.panel.classList.remove('hidden');
        this.isVisible = true;
        this.updateStatus();
        this.logActivity('Painel de status aberto');
    }

    hidePanel() {
        if (!this.panel) return;
        
        this.panel.classList.add('hidden');
        this.isVisible = false;
        this.logActivity('Painel de status fechado');
    }

    // Ações do painel
    forceSync() {
        this.logActivity('🔄 Sincronização forçada iniciada', 'warning');
        
        if (window.AIDatabaseManager && window.AIDatabaseManager.forcSync) {
            window.AIDatabaseManager.forcSync();
        }
        
        if (window.smartSyncManager) {
            window.smartSyncManager.forceSyncNow();
        }
    }

    clearLocalData() {
        const confirmed = confirm('Tem certeza que deseja limpar todos os dados locais? Isso removerá posts não sincronizados e configurações.');
        
        if (confirmed) {
            localStorage.removeItem('local_posts');
            localStorage.removeItem('local_interactions');
            localStorage.removeItem('pending_operations');
            localStorage.removeItem('failed_operations');
            
            this.logActivity('🗑️ Dados locais limpos', 'warning');
            this.updateStatus();
        }
    }

    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            user: JSON.parse(localStorage.getItem('orkut_user') || 'null'),
            localPosts: JSON.parse(localStorage.getItem('local_posts') || '[]'),
            interactions: JSON.parse(localStorage.getItem('local_interactions') || '[]'),
            pendingOperations: JSON.parse(localStorage.getItem('pending_operations') || '[]'),
            settings: JSON.parse(localStorage.getItem('orkut_settings') || '{}')
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `orkut-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        this.logActivity('📤 Dados exportados', 'success');
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        if (this.panel) {
            this.panel.remove();
        }
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para outros scripts carregarem
    setTimeout(() => {
        window.aiStatusPanel = new AIStatusPanel();
    }, 3000);
});

console.log('📊 AI Status Panel carregado!');
