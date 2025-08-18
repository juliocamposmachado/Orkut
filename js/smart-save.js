/**
 * 🧠 SISTEMA DE SALVAMENTO INTELIGENTE
 * 
 * Sistema avançado que:
 * - Salva dados localmente primeiro (performance)
 * - Sincroniza em segundo plano com o banco
 * - Mostra notificações de status
 * - Funciona offline
 * - Retry automático em caso de erro
 */

class SmartSaveSystem {
    constructor() {
        this.isOnline = navigator.onLine;
        this.pendingSync = new Set();
        this.syncQueue = [];
        this.currentUser = null;
        this.saveInProgress = false;
        
        this.init();
    }
    
    init() {
        this.setupOnlineListener();
        this.loadCurrentUser();
        this.startPeriodicSync();
        this.setupVisibilityListener();
        this.registerAIListener();
    }
    
    // 🌐 Monitor de conectividade
    setupOnlineListener() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNotification('Conectado!', 'Sincronizando dados...', '🟢');
            this.processSyncQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNotification('Offline', 'Salvando localmente...', '🔴');
        });
    }
    
    // 👤 Carregar usuário atual
    loadCurrentUser() {
        const savedUser = localStorage.getItem('orkutUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                console.log('👤 Usuário carregado do localStorage:', this.currentUser.name);
            } catch (error) {
                console.error('❌ Erro ao carregar usuário:', error);
                this.currentUser = this.createDefaultUser();
            }
        } else {
            this.currentUser = this.createDefaultUser();
        }
        
        return this.currentUser;
    }
    
    // 👤 Criar usuário padrão
    createDefaultUser() {
        const username = this.generateUsername();
        return {
            id: this.generateId(),
            name: 'Novo Usuário',
            username: username,
            email: '',
            photo: '/images/orkutblack.png',
            status: 'Bem-vindo ao Orkut 2025! 🎉',
            bio: '',
            location: '',
            age: null,
            relationship: '',
            birthday: '',
            profileViews: 0,
            friendsCount: 0,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            syncStatus: 'local' // local, syncing, synced, error
        };
    }
    
    // 💾 Salvar perfil (principal)
    async saveProfile(profileData, options = {}) {
        const {
            showNotification = true,
            forceSync = false,
            updateURL = true
        } = options;
        
        try {
            // 1. Salvar localmente PRIMEIRO
            const updatedProfile = await this.saveLocally(profileData);
            
            if (showNotification) {
                this.showSaveIndicator('💾 Salvo localmente');
            }
            
            // 2. Atualizar URL se necessário
            if (updateURL && updatedProfile.username) {
                this.updateProfileURL(updatedProfile.username);
            }
            
            // 3. NOTIFICAR IA BACKEND MANAGER que dados foram atualizados
            this.notifyAIBackend('profile_updated', updatedProfile);
            
            // 4. Tentar sincronizar em segundo plano
            if (this.isOnline || forceSync) {
                this.scheduleSync(updatedProfile, 'profile');
            } else {
                this.addToSyncQueue('profile', updatedProfile);
                if (showNotification) {
                    this.showNotification('Salvo offline', 'Será sincronizado quando conectar', '📱');
                }
            }
            
            return updatedProfile;
            
        } catch (error) {
            console.error('❌ Erro ao salvar perfil:', error);
            this.showNotification('Erro ao salvar', 'Tente novamente', '❌');
            throw error;
        }
    }
    
    // 💾 Salvar localmente
    async saveLocally(profileData) {
        return new Promise((resolve) => {
            try {
                // Mesclar com dados existentes
                const current = this.currentUser || {};
                const updated = {
                    ...current,
                    ...profileData,
                    lastModified: new Date().toISOString(),
                    syncStatus: this.isOnline ? 'pending' : 'local'
                };
                
                // Salvar no localStorage
                localStorage.setItem('orkutUser', JSON.stringify(updated));
                localStorage.setItem('orkutUserBackup', JSON.stringify(updated));
                
                // Atualizar instância atual
                this.currentUser = updated;
                
                console.log('💾 Perfil salvo localmente:', updated);
                resolve(updated);
                
            } catch (error) {
                console.error('❌ Erro no salvamento local:', error);
                resolve(profileData);
            }
        });
    }
    
    // 🔄 Agendar sincronização
    async scheduleSync(data, type, delay = 2000) {
        if (this.saveInProgress) return;
        
        setTimeout(async () => {
            await this.syncToServer(data, type);
        }, delay);
    }
    
    // ☁️ Sincronizar com servidor
    async syncToServer(data, type) {
        if (!this.isOnline) {
            this.addToSyncQueue(type, data);
            return;
        }
        
        try {
            this.saveInProgress = true;
            this.updateSyncStatus('syncing');
            this.showSaveIndicator('☁️ Sincronizando...');
            
            // Determinar endpoint
            let endpoint, method;
            switch (type) {
                case 'profile':
                    endpoint = '/api/profile';
                    method = 'PUT';
                    break;
                case 'user':
                    endpoint = '/api/register';
                    method = 'POST';
                    break;
                default:
                    throw new Error(`Tipo de sincronização desconhecido: ${type}`);
            }
            
            // Fazer requisição
            const response = await this.makeRequest(endpoint, method, data);
            
            if (response.success) {
                this.updateSyncStatus('synced');
                this.showSaveIndicator('✅ Sincronizado', 'success');
                console.log('✅ Dados sincronizados com servidor');
                
                // Atualizar dados locais com resposta do servidor
                if (response.user || response.profile) {
                    const serverData = response.user || response.profile;
                    this.currentUser = { ...this.currentUser, ...serverData };
                    localStorage.setItem('orkutUser', JSON.stringify(this.currentUser));
                }
                
            } else {
                throw new Error(response.message || 'Erro na sincronização');
            }
            
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
            this.updateSyncStatus('error');
            this.showSaveIndicator('⚠️ Erro na sincronização', 'error');
            
            // Adicionar à fila para retry
            this.addToSyncQueue(type, data);
            
        } finally {
            this.saveInProgress = false;
        }
    }
    
    // 📡 Fazer requisição HTTP
    async makeRequest(endpoint, method, data) {
        const token = localStorage.getItem('orkutToken');
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        };
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(endpoint, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || `HTTP ${response.status}`);
        }
        
        return result;
    }
    
    // 📋 Adicionar à fila de sincronização
    addToSyncQueue(type, data) {
        const queueItem = {
            id: this.generateId(),
            type,
            data,
            timestamp: Date.now(),
            attempts: 0
        };
        
        this.syncQueue.push(queueItem);
        this.saveSyncQueue();
        
        console.log(`📋 Item adicionado à fila de sincronização:`, queueItem);
    }
    
    // 🔄 Processar fila de sincronização
    async processSyncQueue() {
        if (!this.isOnline || this.syncQueue.length === 0) return;
        
        console.log(`🔄 Processando ${this.syncQueue.length} item(s) da fila`);
        
        const queue = [...this.syncQueue];
        this.syncQueue = [];
        
        for (const item of queue) {
            try {
                await this.syncToServer(item.data, item.type);
                console.log(`✅ Item sincronizado:`, item.id);
                
            } catch (error) {
                console.error(`❌ Erro ao sincronizar item ${item.id}:`, error);
                
                // Retry logic
                item.attempts++;
                if (item.attempts < 3) {
                    this.syncQueue.push(item);
                    console.log(`🔄 Item ${item.id} reagendado (tentativa ${item.attempts}/3)`);
                } else {
                    console.log(`❌ Item ${item.id} descartado após 3 tentativas`);
                }
            }
        }
        
        this.saveSyncQueue();
    }
    
    // 💾 Salvar fila de sincronização
    saveSyncQueue() {
        localStorage.setItem('orkutSyncQueue', JSON.stringify(this.syncQueue));
    }
    
    // 📥 Carregar fila de sincronização
    loadSyncQueue() {
        const saved = localStorage.getItem('orkutSyncQueue');
        if (saved) {
            try {
                this.syncQueue = JSON.parse(saved);
                console.log(`📥 Fila de sincronização carregada: ${this.syncQueue.length} item(s)`);
            } catch (error) {
                console.error('❌ Erro ao carregar fila de sincronização:', error);
                this.syncQueue = [];
            }
        }
    }
    
    // 🔄 Atualizar status de sincronização
    updateSyncStatus(status) {
        if (this.currentUser) {
            this.currentUser.syncStatus = status;
            localStorage.setItem('orkutUser', JSON.stringify(this.currentUser));
        }
        
        this.updateSyncIndicator(status);
    }
    
    // 🔮 Atualizar indicador visual de sincronização
    updateSyncIndicator(status) {
        const indicator = document.getElementById('syncIndicator') || this.createSyncIndicator();
        
        const statusConfig = {
            'local': { text: '📱 Local', class: 'local', title: 'Dados salvos apenas localmente' },
            'pending': { text: '⏳ Pendente', class: 'pending', title: 'Aguardando sincronização' },
            'syncing': { text: '☁️ Sincronizando', class: 'syncing', title: 'Sincronizando com servidor' },
            'synced': { text: '✅ Sincronizado', class: 'synced', title: 'Dados sincronizados com servidor' },
            'error': { text: '⚠️ Erro', class: 'error', title: 'Erro na sincronização' }
        };
        
        const config = statusConfig[status] || statusConfig['local'];
        
        indicator.textContent = config.text;
        indicator.className = `sync-indicator ${config.class}`;
        indicator.title = config.title;
    }
    
    // 🔮 Criar indicador de sincronização
    createSyncIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'syncIndicator';
        indicator.className = 'sync-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid #ddd;
            border-radius: 20px;
            padding: 8px 16px;
            font-size: 12px;
            font-weight: bold;
            z-index: 1001;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;
        
        // Cores para diferentes status
        const style = document.createElement('style');
        style.textContent = `
            .sync-indicator.local { border-color: #6c757d; color: #6c757d; }
            .sync-indicator.pending { border-color: #ffc107; color: #ffc107; }
            .sync-indicator.syncing { border-color: #17a2b8; color: #17a2b8; animation: pulse 1s infinite; }
            .sync-indicator.synced { border-color: #28a745; color: #28a745; }
            .sync-indicator.error { border-color: #dc3545; color: #dc3545; }
            
            .sync-indicator:hover {
                background: rgba(255, 255, 255, 1);
                transform: scale(1.05);
            }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Click para mostrar detalhes
        indicator.addEventListener('click', () => {
            this.showSyncDetails();
        });
        
        document.body.appendChild(indicator);
        return indicator;
    }
    
    // 📊 Mostrar detalhes de sincronização
    showSyncDetails() {
        const details = {
            status: this.currentUser?.syncStatus || 'unknown',
            lastModified: this.currentUser?.lastModified || 'never',
            queueSize: this.syncQueue.length,
            isOnline: this.isOnline,
            user: this.currentUser?.name || 'Desconhecido'
        };
        
        const formattedDate = details.lastModified !== 'never' ? 
            new Date(details.lastModified).toLocaleString('pt-BR') : 
            'Nunca';
        
        const message = `
            👤 Usuário: ${details.user}
            🔄 Status: ${details.status}
            ⏰ Última modificação: ${formattedDate}
            📋 Fila: ${details.queueSize} item(s)
            🌐 Online: ${details.isOnline ? 'Sim' : 'Não'}
        `;
        
        this.showNotification('Status de Sincronização', message, '📊');
    }
    
    // 💾 Indicador de salvamento temporário
    showSaveIndicator(message, type = 'info') {
        const indicator = document.createElement('div');
        indicator.className = `save-indicator ${type}`;
        indicator.textContent = message;
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(40, 167, 69, 0.95);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: bold;
            z-index: 1002;
            transform: translateY(100px);
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        
        if (type === 'error') {
            indicator.style.background = 'rgba(220, 53, 69, 0.95)';
        } else if (type === 'success') {
            indicator.style.background = 'rgba(40, 167, 69, 0.95)';
        }
        
        document.body.appendChild(indicator);
        
        // Animação de entrada
        requestAnimationFrame(() => {
            indicator.style.transform = 'translateY(0)';
        });
        
        // Remover após 3 segundos
        setTimeout(() => {
            indicator.style.transform = 'translateY(100px)';
            setTimeout(() => indicator.remove(), 300);
        }, 3000);
    }
    
    // 🔗 Atualizar URL do perfil
    updateProfileURL(username) {
        if (!username) return;
        
        const newUrl = `/profile/${username.toLowerCase()}`;
        const currentPath = window.location.pathname;
        
        if (currentPath !== newUrl) {
            window.history.replaceState(
                { username: username, page: 'profile' },
                `Perfil de ${this.currentUser.name} (@${username})`,
                newUrl
            );
            
            document.title = `${this.currentUser.name} (@${username}) - Orkut 2025`;
            console.log(`🔗 URL atualizada para: ${newUrl}`);
        }
    }
    
    // ⏰ Sincronização periódica
    startPeriodicSync() {
        // Sincronizar a cada 5 minutos se online
        setInterval(() => {
            if (this.isOnline && this.syncQueue.length > 0) {
                console.log('⏰ Sincronização periódica iniciada');
                this.processSyncQueue();
            }
        }, 5 * 60 * 1000); // 5 minutos
        
        // Carregar fila salva
        this.loadSyncQueue();
    }
    
    // 👁️ Monitor de visibilidade da página
    setupVisibilityListener() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isOnline) {
                // Página ficou visível, processar fila
                setTimeout(() => {
                    this.processSyncQueue();
                }, 1000);
            }
        });
    }
    
    // 🆔 Gerar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // 👤 Gerar username único
    generateUsername() {
        const adjectives = ['cool', 'smart', 'happy', 'bright', 'swift', 'bold', 'kind'];
        const nouns = ['tiger', 'eagle', 'dolphin', 'lion', 'wolf', 'bear', 'fox'];
        
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const num = Math.floor(Math.random() * 1000);
        
        return `${adj}_${noun}_${num}`;
    }
    
    // 📢 Sistema de notificações
    showNotification(title, message, icon = '📢') {
        if (typeof showNotification === 'function') {
            showNotification(title, message, icon);
        } else {
            console.log(`${icon} ${title}: ${message}`);
        }
    }
    
    // 🧹 Limpar dados locais
    clearLocalData() {
        localStorage.removeItem('orkutUser');
        localStorage.removeItem('orkutUserBackup');
        localStorage.removeItem('orkutSyncQueue');
        this.currentUser = null;
        this.syncQueue = [];
        console.log('🧹 Dados locais limpos');
    }
    
    // 📤 Exportar dados
    exportData() {
        const data = {
            user: this.currentUser,
            syncQueue: this.syncQueue,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `orkut-backup-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Backup criado!', 'Dados exportados com sucesso', '💾');
    }
    
    // 📥 Importar dados
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.user && data.version) {
                    this.currentUser = data.user;
                    this.syncQueue = data.syncQueue || [];
                    
                    localStorage.setItem('orkutUser', JSON.stringify(this.currentUser));
                    this.saveSyncQueue();
                    
                    this.showNotification('Backup restaurado!', 'Dados importados com sucesso', '📥');
                    
                    // Recarregar página para aplicar mudanças
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    throw new Error('Formato inválido');
                }
                
            } catch (error) {
                this.showNotification('Erro na importação', 'Arquivo inválido', '❌');
                console.error('❌ Erro ao importar:', error);
            }
        };
        
        reader.readAsText(file);
    }
    
    // 📊 Estatísticas do sistema
    getStats() {
        return {
            user: this.currentUser?.name || 'N/A',
            syncStatus: this.currentUser?.syncStatus || 'unknown',
            queueSize: this.syncQueue.length,
            isOnline: this.isOnline,
            lastModified: this.currentUser?.lastModified,
            totalAttempts: this.syncQueue.reduce((sum, item) => sum + item.attempts, 0)
        };
    }
    
    // 🤖 Notificar IA Backend Manager sobre mudanças nos dados
    notifyAIBackend(eventType, data) {
        try {
            // Verificar se a IA Backend Manager está disponível
            if (window.AIBackendManager && typeof window.AIBackendManager.onDataUpdate === 'function') {
                console.log(`🤖 Notificando IA Backend Manager: ${eventType}`);
                window.AIBackendManager.onDataUpdate(eventType, data, {
                    timestamp: new Date().toISOString(),
                    source: 'SmartSave',
                    userId: this.currentUser?.id,
                    userName: this.currentUser?.name
                });
            } else {
                // IA não está disponível ainda, aguardar e tentar novamente
                setTimeout(() => {
                    this.notifyAIBackend(eventType, data);
                }, 1000);
            }
        } catch (error) {
            console.warn('⚠️ Erro ao notificar IA Backend Manager:', error);
        }
    }
    
    // 📡 Registrar listener para eventos da IA
    registerAIListener() {
        // Expor método para IA consultar dados
        window.SmartSaveAPI = {
            getCurrentUser: () => this.currentUser,
            getStats: () => this.getStats(),
            getSyncQueue: () => this.syncQueue,
            forcSync: (data, type) => this.scheduleSync(data, type, 0),
            clearData: () => this.clearLocalData(),
            // Métodos de interação social
            notifyNewPost: (postData) => this.notifyNewPost(postData),
            notifyNewScrap: (scrapData) => this.notifyNewScrap(scrapData),
            notifyNewLike: (likeData) => this.notifyNewLike(likeData),
            notifyNewFriendship: (friendshipData) => this.notifyNewFriendship(friendshipData),
            notifyProfileView: (profileUserId) => this.notifyProfileView(profileUserId)
        };
        
        console.log('📡 API SmartSave registrada para IA Backend Manager');
    }
    
    // =============================================================================
    // 📱 MÉTODOS PARA INTERAÇÕES SOCIAIS
    // =============================================================================
    
    // 📝 Notificar nova postagem
    notifyNewPost(postData) {
        try {
            console.log('📝 SmartSave: Notificando nova postagem...');
            
            const enrichedPostData = {
                id: postData.id || this.generateId(),
                content: postData.content,
                type: postData.type || 'status',
                communityId: postData.communityId || null,
                userId: this.currentUser?.id || this.generateId(),
                timestamp: Date.now()
            };
            
            // Salvar localmente primeiro
            this.saveToLocal('recent_posts', enrichedPostData);
            
            // Notificar ORKY-DB-AI
            if (window.AIBackendManager && window.AIBackendManager.handleNewPost) {
                window.AIBackendManager.handleNewPost(enrichedPostData, {
                    userId: this.currentUser?.id || 'unknown',
                    source: 'smart_save',
                    timestamp: Date.now()
                });
            }
            
            this.showSaveIndicator('📝 Post publicado!', 'success');
            return enrichedPostData;
            
        } catch (error) {
            console.error('❌ SmartSave: Erro ao notificar postagem:', error);
            this.showSaveIndicator('❌ Erro ao publicar post', 'error');
            throw error;
        }
    }
    
    // 💬 Notificar novo scrap
    notifyNewScrap(scrapData) {
        try {
            console.log('💬 SmartSave: Notificando novo scrap...');
            
            const enrichedScrapData = {
                id: scrapData.id || this.generateId(),
                content: scrapData.content,
                toUserId: scrapData.toUserId,
                fromUserId: this.currentUser?.id || this.generateId(),
                isPublic: scrapData.isPublic !== false,
                timestamp: Date.now()
            };
            
            // Salvar localmente
            this.saveToLocal('recent_scraps', enrichedScrapData);
            
            // Notificar ORKY-DB-AI
            if (window.AIBackendManager && window.AIBackendManager.handleNewScrap) {
                window.AIBackendManager.handleNewScrap(enrichedScrapData, {
                    userId: this.currentUser?.id || 'unknown',
                    source: 'smart_save',
                    timestamp: Date.now()
                });
            }
            
            this.showSaveIndicator('💬 Scrap enviado!', 'success');
            return enrichedScrapData;
            
        } catch (error) {
            console.error('❌ SmartSave: Erro ao notificar scrap:', error);
            this.showSaveIndicator('❌ Erro ao enviar scrap', 'error');
            throw error;
        }
    }
    
    // ❤️ Notificar curtida
    notifyNewLike(likeData) {
        try {
            console.log('❤️ SmartSave: Notificando nova curtida...');
            
            const enrichedLikeData = {
                id: likeData.id || this.generateId(),
                postId: likeData.postId,
                userId: this.currentUser?.id || this.generateId(),
                timestamp: Date.now()
            };
            
            // Salvar localmente
            this.saveToLocal('recent_likes', enrichedLikeData);
            
            // Notificar ORKY-DB-AI
            if (window.AIBackendManager && window.AIBackendManager.handleNewLike) {
                window.AIBackendManager.handleNewLike(enrichedLikeData, {
                    userId: this.currentUser?.id || 'unknown',
                    source: 'smart_save',
                    timestamp: Date.now()
                });
            }
            
            this.showSaveIndicator('❤️ Curtida registrada!', 'success');
            return enrichedLikeData;
            
        } catch (error) {
            console.error('❌ SmartSave: Erro ao notificar curtida:', error);
            this.showSaveIndicator('❌ Erro ao curtir', 'error');
            throw error;
        }
    }
    
    // 👥 Notificar nova amizade
    notifyNewFriendship(friendshipData) {
        try {
            console.log('👥 SmartSave: Notificando nova amizade...');
            
            const enrichedFriendshipData = {
                id: friendshipData.id || this.generateId(),
                requesterId: this.currentUser?.id || this.generateId(),
                addresseeId: friendshipData.addresseeId,
                status: friendshipData.status || 'pending',
                timestamp: Date.now()
            };
            
            // Salvar localmente
            this.saveToLocal('recent_friendships', enrichedFriendshipData);
            
            // Notificar ORKY-DB-AI
            if (window.AIBackendManager && window.AIBackendManager.handleNewFriendship) {
                window.AIBackendManager.handleNewFriendship(enrichedFriendshipData, {
                    userId: this.currentUser?.id || 'unknown',
                    source: 'smart_save',
                    timestamp: Date.now()
                });
            }
            
            const statusMessages = {
                'pending': '👥 Pedido de amizade enviado!',
                'accepted': '🎉 Amizade aceita!',
                'declined': '❌ Pedido recusado'
            };
            
            this.showSaveIndicator(statusMessages[friendshipData.status] || '👥 Amizade processada!', 'success');
            return enrichedFriendshipData;
            
        } catch (error) {
            console.error('❌ SmartSave: Erro ao notificar amizade:', error);
            this.showSaveIndicator('❌ Erro ao processar amizade', 'error');
            throw error;
        }
    }
    
    // 👁️ Notificar visualização de perfil
    notifyProfileView(profileUserId) {
        try {
            const currentUserId = this.currentUser?.id;
            if (!profileUserId || profileUserId === currentUserId) {
                return; // Não contar próprias visualizações
            }
            
            console.log('👁️ SmartSave: Notificando visualização de perfil...');
            
            const profileViewData = {
                profileUserId: profileUserId,
                viewerId: currentUserId,
                timestamp: Date.now()
            };
            
            // Notificar ORKY-DB-AI
            if (window.AIBackendManager && window.AIBackendManager.handleProfileView) {
                window.AIBackendManager.handleProfileView(profileViewData, {
                    userId: currentUserId || 'unknown',
                    source: 'smart_save',
                    timestamp: Date.now()
                });
            }
            
            console.log('✅ SmartSave: Visualização de perfil registrada');
            return profileViewData;
            
        } catch (error) {
            console.error('❌ SmartSave: Erro ao notificar visualização:', error);
        }
    }
    
    // 💾 Salvar dados localmente em categorias
    saveToLocal(category, data) {
        try {
            const existingData = JSON.parse(localStorage.getItem(`orkut_${category}`) || '[]');
            existingData.push(data);
            
            // Manter apenas os últimos 50 itens por categoria
            if (existingData.length > 50) {
                existingData.splice(0, existingData.length - 50);
            }
            
            localStorage.setItem(`orkut_${category}`, JSON.stringify(existingData));
            console.log(`💾 SmartSave: Dados salvos localmente (${category}):`, data.id);
            
        } catch (error) {
            console.error(`❌ SmartSave: Erro ao salvar localmente (${category}):`, error);
        }
    }
}

// 🚀 Instância global
window.SmartSave = new SmartSaveSystem();

// 📱 API simplificada para uso nos formulários
window.saveProfile = async function(profileData, options = {}) {
    return await window.SmartSave.saveProfile(profileData, options);
};

window.getCurrentUser = function() {
    return window.SmartSave.currentUser;
};

window.clearUserData = function() {
    window.SmartSave.clearLocalData();
};

// 🔄 Auto-inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧠 Sistema de Salvamento Inteligente iniciado');
    
    // Atualizar status inicial
    window.SmartSave.updateSyncStatus(window.SmartSave.currentUser?.syncStatus || 'local');
    
    // Processar fila de sincronização se online
    if (navigator.onLine) {
        setTimeout(() => {
            window.SmartSave.processSyncQueue();
        }, 2000);
    }
});

console.log('🧠 SmartSave System carregado - v1.0');
