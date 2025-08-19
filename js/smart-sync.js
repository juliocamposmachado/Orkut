/**
 * Smart Sync System - Sistema de Sincronização Inteligente
 * Detecta mudanças locais e dispara atualizações via AI Database Manager
 */

class SmartSyncManager {
    constructor() {
        this.syncInterval = 15000; // 15 segundos
        this.observers = new Map();
        this.changeLog = [];
        this.lastSync = null;
        this.isMonitoring = false;
        
        this.initialize();
    }

    initialize() {
        console.log('🔄 Inicializando Smart Sync Manager...');
        
        // Aguardar AI Database Manager estar pronto
        this.waitForAIDatabaseManager().then(() => {
            this.setupChangeDetection();
            this.startMonitoring();
            this.setupEventListeners();
            console.log('✅ Smart Sync Manager iniciado!');
        });
    }

    async waitForAIDatabaseManager() {
        return new Promise((resolve) => {
            const checkAI = () => {
                if (window.AIDatabaseManager && window.AIDatabaseManager.initialized) {
                    resolve();
                } else {
                    setTimeout(checkAI, 100);
                }
            };
            checkAI();
        });
    }

    setupChangeDetection() {
        // Detectar mudanças no perfil do usuário
        this.observeUserProfile();
        
        // Detectar mudanças em posts locais
        this.observeLocalPosts();
        
        // Detectar mudanças em interações
        this.observeInteractions();
        
        // Detectar mudanças em configurações
        this.observeSettings();
    }

    observeUserProfile() {
        const key = 'orkut_user';
        let lastData = this.getStorageSnapshot(key);
        
        const observer = () => {
            const currentData = this.getStorageSnapshot(key);
            if (this.hasDataChanged(lastData, currentData)) {
                this.logChange('user_profile', lastData, currentData);
                lastData = currentData;
                
                // Disparar atualização via AI
                if (currentData) {
                    this.queueProfileUpdate(currentData);
                }
            }
        };
        
        this.observers.set(key, observer);
        
        // Observar mudanças no localStorage para esta chave
        this.watchStorageKey(key);
    }

    observeLocalPosts() {
        const key = 'local_posts';
        let lastData = this.getStorageSnapshot(key);
        
        const observer = () => {
            const currentData = this.getStorageSnapshot(key);
            if (this.hasDataChanged(lastData, currentData)) {
                this.logChange('local_posts', lastData, currentData);
                
                // Detectar novos posts
                const newPosts = this.findNewItems(lastData || [], currentData || []);
                newPosts.forEach(post => {
                    if (!post.synced) {
                        this.queuePostCreation(post);
                    }
                });
                
                lastData = currentData;
            }
        };
        
        this.observers.set(key, observer);
        this.watchStorageKey(key);
    }

    observeInteractions() {
        const key = 'local_interactions';
        let lastData = this.getStorageSnapshot(key);
        
        const observer = () => {
            const currentData = this.getStorageSnapshot(key);
            if (this.hasDataChanged(lastData, currentData)) {
                this.logChange('interactions', lastData, currentData);
                
                // Processar novas interações
                const newInteractions = this.findNewItems(lastData || [], currentData || []);
                newInteractions.forEach(interaction => {
                    this.queueInteraction(interaction);
                });
                
                lastData = currentData;
            }
        };
        
        this.observers.set(key, observer);
        this.watchStorageKey(key);
    }

    observeSettings() {
        const key = 'orkut_settings';
        let lastData = this.getStorageSnapshot(key);
        
        const observer = () => {
            const currentData = this.getStorageSnapshot(key);
            if (this.hasDataChanged(lastData, currentData)) {
                this.logChange('settings', lastData, currentData);
                lastData = currentData;
                
                // Aplicar configurações
                if (currentData) {
                    this.applySettings(currentData);
                }
            }
        };
        
        this.observers.set(key, observer);
        this.watchStorageKey(key);
    }

    watchStorageKey(key) {
        // Usar MutationObserver para detectar mudanças no DOM que podem afetar localStorage
        // ou polling para detectar mudanças
        
        setInterval(() => {
            const observer = this.observers.get(key);
            if (observer) {
                observer();
            }
        }, 2000); // Verificar a cada 2 segundos
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        
        // Sincronização periódica
        setInterval(() => {
            this.performIntelligentSync();
        }, this.syncInterval);
        
        // Sincronização quando página fica visível
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(() => this.performIntelligentSync(), 1000);
            }
        });
        
        // Sincronização quando volta conectividade
        window.addEventListener('online', () => {
            console.log('🌐 Conectividade restaurada, sincronizando...');
            setTimeout(() => this.performIntelligentSync(), 2000);
        });
    }

    setupEventListeners() {
        // Interceptar eventos de formulários
        document.addEventListener('submit', (event) => {
            const form = event.target;
            
            if (form.classList.contains('profile-form')) {
                this.handleProfileFormSubmit(form);
            }
            
            if (form.classList.contains('post-form')) {
                this.handlePostFormSubmit(form);
            }
        });
        
        // Interceptar cliques em botões de ação
        document.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            
            if (button.dataset.action === 'like-post') {
                this.handleLikeAction(button);
            }
            
            if (button.dataset.action === 'add-friend') {
                this.handleFriendRequest(button);
            }
        });
        
        // Interceptar mudanças em inputs importantes
        document.addEventListener('input', (event) => {
            const input = event.target;
            
            if (input.name === 'status' || input.name === 'bio') {
                // Debounce para evitar muitas atualizações
                clearTimeout(input.updateTimer);
                input.updateTimer = setTimeout(() => {
                    this.handleProfileFieldUpdate(input);
                }, 3000);
            }
        });
    }

    handleProfileFormSubmit(form) {
        const formData = new FormData(form);
        const profileData = {};
        
        for (let [key, value] of formData.entries()) {
            profileData[key] = value;
        }
        
        this.queueProfileUpdate(profileData);
    }

    handlePostFormSubmit(form) {
        const formData = new FormData(form);
        const postData = {
            content: formData.get('content'),
            timestamp: new Date().toISOString(),
            author: this.getCurrentUser()?.name || 'Usuário'
        };
        
        this.queuePostCreation(postData);
    }

    handleLikeAction(button) {
        const postId = button.dataset.postId;
        const isLiked = button.classList.contains('liked');
        
        const interaction = {
            type: 'like',
            postId: postId,
            action: isLiked ? 'unlike' : 'like',
            timestamp: new Date().toISOString()
        };
        
        this.queueInteraction(interaction);
    }

    handleFriendRequest(button) {
        const userId = button.dataset.userId;
        
        const interaction = {
            type: 'friend_request',
            targetUserId: userId,
            timestamp: new Date().toISOString()
        };
        
        this.queueInteraction(interaction);
    }

    handleProfileFieldUpdate(input) {
        const user = this.getCurrentUser();
        if (!user) return;
        
        const updatedData = {
            ...user,
            [input.name]: input.value,
            updated_at: new Date().toISOString()
        };
        
        // Salvar localmente
        localStorage.setItem('orkut_user', JSON.stringify(updatedData));
    }

    queueProfileUpdate(profileData) {
        if (window.AIDatabaseManager && window.AIDatabaseManager.queueOperation) {
            window.AIDatabaseManager.queueOperation('user_profile_update', profileData);
        }
    }

    queuePostCreation(postData) {
        if (window.AIDatabaseManager && window.AIDatabaseManager.queueOperation) {
            window.AIDatabaseManager.queueOperation('post_creation', postData);
        }
    }

    queueInteraction(interactionData) {
        if (window.AIDatabaseManager && window.AIDatabaseManager.queueOperation) {
            window.AIDatabaseManager.queueOperation('user_interaction', interactionData);
        }
    }

    performIntelligentSync() {
        console.log('🔄 Executando sincronização inteligente...');
        
        // Verificar se há mudanças pendentes
        const pendingChanges = this.getPendingChanges();
        
        if (pendingChanges.length > 0) {
            console.log(`📊 Encontradas ${pendingChanges.length} mudanças pendentes`);
            
            // Priorizar sincronizações por importância
            pendingChanges.sort((a, b) => this.getChangePriority(b) - this.getChangePriority(a));
            
            // Processar mudanças
            pendingChanges.forEach(change => {
                this.processChange(change);
            });
            
            this.lastSync = new Date().toISOString();
        }
        
        // Força sincronização via AI Database Manager
        if (window.AIDatabaseManager && window.AIDatabaseManager.forcSync) {
            window.AIDatabaseManager.forcSync();
        }
    }

    getPendingChanges() {
        const recentChanges = this.changeLog.filter(change => {
            if (!this.lastSync) return true;
            return new Date(change.timestamp) > new Date(this.lastSync);
        });
        
        return recentChanges;
    }

    getChangePriority(change) {
        const priorities = {
            'user_profile': 10,
            'local_posts': 8,
            'interactions': 6,
            'settings': 4
        };
        
        return priorities[change.type] || 1;
    }

    processChange(change) {
        console.log('⚙️ Processando mudança:', change.type);
        
        switch (change.type) {
            case 'user_profile':
                this.syncUserProfile(change.currentData);
                break;
            case 'local_posts':
                this.syncLocalPosts();
                break;
            case 'interactions':
                this.syncInteractions();
                break;
            case 'settings':
                this.syncSettings(change.currentData);
                break;
        }
    }

    syncUserProfile(profileData) {
        if (profileData) {
            this.queueProfileUpdate(profileData);
        }
    }

    syncLocalPosts() {
        const localPosts = JSON.parse(localStorage.getItem('local_posts') || '[]');
        const unsyncedPosts = localPosts.filter(post => !post.synced);
        
        unsyncedPosts.forEach(post => {
            this.queuePostCreation(post);
        });
    }

    syncInteractions() {
        const localInteractions = JSON.parse(localStorage.getItem('local_interactions') || '[]');
        const unsyncedInteractions = localInteractions.filter(interaction => !interaction.synced);
        
        unsyncedInteractions.forEach(interaction => {
            this.queueInteraction(interaction);
        });
    }

    syncSettings(settingsData) {
        // Aplicar configurações localmente
        this.applySettings(settingsData);
        
        // Sincronizar com servidor via AI
        if (window.AIDatabaseManager && window.AIDatabaseManager.queueOperation) {
            window.AIDatabaseManager.queueOperation('user_settings_update', settingsData);
        }
    }

    applySettings(settings) {
        if (!settings) return;
        
        // Aplicar tema
        if (settings.theme) {
            document.body.className = document.body.className.replace(/theme-\w+/g, '');
            document.body.classList.add(`theme-${settings.theme}`);
        }
        
        // Aplicar configurações de notificação
        if (settings.notifications) {
            this.configureNotifications(settings.notifications);
        }
        
        // Aplicar configurações de privacidade
        if (settings.privacy) {
            this.configurePrivacy(settings.privacy);
        }
    }

    configureNotifications(notificationSettings) {
        // Implementar configurações de notificação
        console.log('🔔 Configurando notificações:', notificationSettings);
    }

    configurePrivacy(privacySettings) {
        // Implementar configurações de privacidade
        console.log('🔒 Configurando privacidade:', privacySettings);
    }

    // Utility methods
    getStorageSnapshot(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    hasDataChanged(oldData, newData) {
        return JSON.stringify(oldData) !== JSON.stringify(newData);
    }

    findNewItems(oldArray, newArray) {
        if (!Array.isArray(oldArray) || !Array.isArray(newArray)) return [];
        
        return newArray.filter(newItem => {
            return !oldArray.some(oldItem => 
                oldItem.id === newItem.id || 
                (oldItem.timestamp && oldItem.timestamp === newItem.timestamp)
            );
        });
    }

    logChange(type, oldData, newData) {
        const change = {
            type,
            timestamp: new Date().toISOString(),
            oldData,
            currentData: newData
        };
        
        this.changeLog.push(change);
        
        // Manter apenas últimas 100 mudanças
        if (this.changeLog.length > 100) {
            this.changeLog = this.changeLog.slice(-100);
        }
        
        console.log(`📝 Mudança detectada [${type}]:`, change);
    }

    getCurrentUser() {
        const userData = localStorage.getItem('orkut_user');
        return userData ? JSON.parse(userData) : null;
    }

    // Public API
    forceSyncNow() {
        console.log('🚀 Forçando sincronização imediata...');
        this.performIntelligentSync();
    }

    getStatus() {
        return {
            isMonitoring: this.isMonitoring,
            changeLogSize: this.changeLog.length,
            lastSync: this.lastSync,
            observers: this.observers.size,
            pendingChanges: this.getPendingChanges().length
        };
    }

    pauseMonitoring() {
        this.isMonitoring = false;
        console.log('⏸️ Monitoramento pausado');
    }

    resumeMonitoring() {
        if (!this.isMonitoring) {
            this.startMonitoring();
            console.log('▶️ Monitoramento retomado');
        }
    }
}

// Initialize Smart Sync Manager
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que outros scripts carreguem
    setTimeout(() => {
        window.smartSyncManager = new SmartSyncManager();
        
        // Adicionar à API pública
        window.SmartSync = {
            forceSyncNow: () => window.smartSyncManager.forceSyncNow(),
            getStatus: () => window.smartSyncManager.getStatus(),
            pauseMonitoring: () => window.smartSyncManager.pauseMonitoring(),
            resumeMonitoring: () => window.smartSyncManager.resumeMonitoring()
        };
    }, 2000);
});

console.log('🔄 Smart Sync System carregado!');
