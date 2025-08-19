/**
 * Data Manager Persona - Orkut 2025
 * Gerencia sincronização entre localStorage e backend/banco de dados
 */

class DataManagerPersona {
    constructor() {
        this.syncInterval = 30000; // 30 segundos
        this.syncTimeout = null;
        this.isSyncing = false;
        this.syncQueue = [];
        this.retryAttempts = 3;
        this.backendUrl = 'http://localhost:3001/api'; // URL do backend
        
        this.initializePersona();
    }

    initializePersona() {
        console.log('🔄 Data Manager Persona ativa - Gerenciando sincronização de dados');
        this.startSyncScheduler();
        this.setupEventListeners();
        this.performInitialSync();
    }

    setupEventListeners() {
        // Escuta mudanças no localStorage para sincronização automática
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('orkut_')) {
                this.scheduleSync();
            }
        });

        // Sincronização quando a aplicação ganha foco
        window.addEventListener('focus', () => {
            this.performSync();
        });

        // Sincronização antes de fechar a página
        window.addEventListener('beforeunload', () => {
            this.performSync(true); // Sync síncrono
        });

        // Escuta eventos personalizados de dados
        document.addEventListener('orkut-data-change', (e) => {
            this.handleDataChange(e.detail);
        });
    }

    // SINCRONIZAÇÃO AUTOMÁTICA
    startSyncScheduler() {
        this.syncTimeout = setInterval(() => {
            this.performSync();
        }, this.syncInterval);

        console.log(`📅 Agendador de sincronização ativo - Intervalo: ${this.syncInterval/1000}s`);
    }

    scheduleSync() {
        // Agenda uma sincronização para evitar muitas chamadas
        if (this.scheduleTimeout) {
            clearTimeout(this.scheduleTimeout);
        }

        this.scheduleTimeout = setTimeout(() => {
            this.performSync();
        }, 5000); // 5 segundos de delay
    }

    async performSync(forceSynchronous = false) {
        if (this.isSyncing && !forceSynchronous) {
            console.log('🔄 Sincronização já em andamento, aguardando...');
            return;
        }

        this.isSyncing = true;
        console.log('🔄 Iniciando sincronização de dados...');

        try {
            await this.syncPendingData();
            await this.pullRemoteUpdates();
            this.updateSyncStatus('success');
            console.log('✅ Sincronização concluída com sucesso');
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
            this.updateSyncStatus('error', error.message);
        } finally {
            this.isSyncing = false;
        }
    }

    async performInitialSync() {
        console.log('🚀 Realizando sincronização inicial...');
        await this.pullUserProfile();
        await this.pullRecentData();
    }

    // SINCRONIZAÇÃO DE DADOS PENDENTES
    async syncPendingData() {
        const pendingItems = localStorageManager.getPendingSync();
        console.log(`📤 Sincronizando ${pendingItems.length} itens pendentes`);

        for (const item of pendingItems) {
            try {
                await this.syncItem(item);
                localStorageManager.markAsSynced(item.id);
            } catch (error) {
                console.error(`❌ Erro ao sincronizar item ${item.id}:`, error);
                
                // Retry logic
                if (!item.retryCount) item.retryCount = 0;
                if (item.retryCount < this.retryAttempts) {
                    item.retryCount++;
                    console.log(`🔄 Tentativa ${item.retryCount}/${this.retryAttempts} para item ${item.id}`);
                } else {
                    console.error(`💀 Item ${item.id} falhou após ${this.retryAttempts} tentativas`);
                }
            }
        }
    }

    async syncItem(item) {
        const endpoint = this.getEndpointForType(item.type);
        const method = this.getMethodForType(item.type);
        const url = `${this.backendUrl}${endpoint}`;

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify({
                type: item.type,
                data: item.data,
                timestamp: item.timestamp,
                clientId: this.getClientId()
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`✅ Item ${item.id} sincronizado:`, result);
        
        return result;
    }

    // BUSCA ATUALIZAÇÕES REMOTAS
    async pullRemoteUpdates() {
        console.log('📥 Buscando atualizações remotas...');
        
        const lastSync = localStorage.getItem('orkut_last_sync') || '1970-01-01T00:00:00Z';
        const url = `${this.backendUrl}/sync/updates?since=${lastSync}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });

            if (response.ok) {
                const updates = await response.json();
                await this.applyRemoteUpdates(updates);
                localStorage.setItem('orkut_last_sync', new Date().toISOString());
            }
        } catch (error) {
            console.error('❌ Erro ao buscar atualizações:', error);
        }
    }

    async applyRemoteUpdates(updates) {
        console.log(`📥 Aplicando ${updates.length} atualizações remotas`);

        for (const update of updates) {
            try {
                await this.applyUpdate(update);
            } catch (error) {
                console.error('❌ Erro ao aplicar atualização:', error);
            }
        }
    }

    async applyUpdate(update) {
        switch (update.type) {
            case 'scrap':
                this.updateLocalScraps(update.data);
                break;
            case 'testimonial':
                this.updateLocalTestimonials(update.data);
                break;
            case 'photo':
                this.updateLocalPhotos(update.data);
                break;
            case 'profile_visit':
                this.updateLocalVisits(update.data);
                break;
            case 'interaction':
                this.updateLocalInteractions(update.data);
                break;
            case 'profile_update':
                this.updateLocalProfile(update.data);
                break;
        }

        // Notifica outras personas sobre a atualização
        this.notifyDataUpdate(update.type, update.data);
    }

    // BUSCA PERFIL DO USUÁRIO
    async pullUserProfile() {
        try {
            const response = await fetch(`${this.backendUrl}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });

            if (response.ok) {
                const profile = await response.json();
                localStorageManager.updateUserProfile(profile);
                console.log('👤 Perfil do usuário atualizado');
            }
        } catch (error) {
            console.error('❌ Erro ao buscar perfil:', error);
        }
    }

    async pullRecentData() {
        const dataTypes = ['scraps', 'testimonials', 'photos', 'interactions'];
        
        for (const dataType of dataTypes) {
            try {
                await this.pullDataType(dataType);
            } catch (error) {
                console.error(`❌ Erro ao buscar ${dataType}:`, error);
            }
        }
    }

    async pullDataType(dataType) {
        const response = await fetch(`${this.backendUrl}/${dataType}/recent`, {
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            this.updateLocalData(dataType, data);
        }
    }

    // ATUALIZAÇÃO DE DADOS LOCAIS
    updateLocalScraps(scraps) {
        const existing = localStorageManager.getScraps();
        const merged = this.mergeArrays(existing, scraps, 'id');
        localStorage.setItem(localStorageManager.keys.SCRAPS, JSON.stringify(merged));
    }

    updateLocalTestimonials(testimonials) {
        const existing = localStorageManager.getTestimonials();
        const merged = this.mergeArrays(existing, testimonials, 'id');
        localStorage.setItem(localStorageManager.keys.TESTIMONIALS, JSON.stringify(merged));
    }

    updateLocalPhotos(photos) {
        const existing = localStorageManager.getPhotos();
        const merged = this.mergeArrays(existing, photos, 'id');
        localStorage.setItem(localStorageManager.keys.PHOTOS, JSON.stringify(merged));
    }

    updateLocalVisits(visits) {
        const existing = localStorageManager.getProfileVisits();
        const merged = this.mergeArrays(existing, visits, 'id');
        localStorage.setItem(localStorageManager.keys.PROFILE_VISITS, JSON.stringify(merged));
    }

    updateLocalInteractions(interactions) {
        const existing = localStorageManager.getInteractions();
        const merged = this.mergeArrays(existing, interactions, 'id');
        localStorage.setItem(localStorageManager.keys.INTERACTIONS, JSON.stringify(merged));
    }

    updateLocalProfile(profileData) {
        const current = localStorageManager.getUserProfile();
        const updated = { ...current, ...profileData };
        localStorage.setItem(localStorageManager.keys.USER_PROFILE, JSON.stringify(updated));
    }

    updateLocalData(dataType, data) {
        switch (dataType) {
            case 'scraps':
                this.updateLocalScraps(data);
                break;
            case 'testimonials':
                this.updateLocalTestimonials(data);
                break;
            case 'photos':
                this.updateLocalPhotos(data);
                break;
            case 'interactions':
                this.updateLocalInteractions(data);
                break;
        }
    }

    // GERENCIAMENTO DE CONFLITOS
    mergeArrays(local, remote, keyField) {
        const merged = [...local];
        const localKeys = new Set(local.map(item => item[keyField]));

        for (const remoteItem of remote) {
            if (!localKeys.has(remoteItem[keyField])) {
                merged.push(remoteItem);
            } else {
                // Resolve conflito - prioriza a versão mais recente
                const localIndex = merged.findIndex(item => item[keyField] === remoteItem[keyField]);
                const localItem = merged[localIndex];
                
                if (new Date(remoteItem.timestamp) > new Date(localItem.timestamp)) {
                    merged[localIndex] = remoteItem;
                }
            }
        }

        return merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // UPLOAD DE ARQUIVOS
    async uploadFile(file, type = 'photo') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const response = await fetch(`${this.backendUrl}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Erro no upload do arquivo');
        }

        return await response.json();
    }

    // BACKUP E RESTAURAÇÃO
    async createBackup() {
        console.log('💾 Criando backup dos dados...');
        
        const backupData = {
            timestamp: new Date().toISOString(),
            scraps: localStorageManager.getScraps(),
            testimonials: localStorageManager.getTestimonials(),
            photos: localStorageManager.getPhotos(),
            interactions: localStorageManager.getInteractions(),
            profileVisits: localStorageManager.getProfileVisits(),
            userProfile: localStorageManager.getUserProfile(),
            crushData: localStorageManager.getCrushData()
        };

        // Salva backup localmente
        localStorage.setItem('orkut_backup', JSON.stringify(backupData));

        // Envia backup para o servidor
        try {
            await fetch(`${this.backendUrl}/backup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(backupData)
            });
            
            console.log('✅ Backup criado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao enviar backup:', error);
        }

        return backupData;
    }

    async restoreFromBackup() {
        try {
            const response = await fetch(`${this.backendUrl}/backup/latest`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });

            if (response.ok) {
                const backupData = await response.json();
                this.applyBackupData(backupData);
                console.log('✅ Dados restaurados do backup');
            }
        } catch (error) {
            console.error('❌ Erro ao restaurar backup:', error);
            
            // Tenta backup local como fallback
            const localBackup = localStorage.getItem('orkut_backup');
            if (localBackup) {
                this.applyBackupData(JSON.parse(localBackup));
                console.log('✅ Dados restaurados do backup local');
            }
        }
    }

    applyBackupData(backupData) {
        Object.entries(localStorageManager.keys).forEach(([key, storageKey]) => {
            const dataKey = key.toLowerCase();
            if (backupData[dataKey]) {
                localStorage.setItem(storageKey, JSON.stringify(backupData[dataKey]));
            }
        });

        // Força atualização da UI
        this.notifyDataUpdate('backup_restore', backupData);
    }

    // ANÁLISE DE DADOS PARA CRUSH IA
    analyzeUserBehavior(userId) {
        const interactions = localStorageManager.getInteractions()
            .filter(i => i.fromUserId === userId || i.toUserId === userId);
        
        const visits = localStorageManager.getProfileVisits()
            .filter(v => v.visitorId === userId);
        
        const scraps = localStorageManager.getScrapsByUser(userId);
        const photos = localStorageManager.getPhotosByUser(userId);

        const behaviorData = {
            userId,
            totalInteractions: interactions.length,
            interactionTypes: this.countInteractionTypes(interactions),
            visitFrequency: this.calculateVisitFrequency(visits),
            communicationStyle: this.analyzeCommunicationStyle(scraps),
            photoActivity: this.analyzePhotoActivity(photos),
            timestamp: new Date().toISOString()
        };

        // Envia para crush IA
        this.sendToCrushAI(behaviorData);
        
        return behaviorData;
    }

    countInteractionTypes(interactions) {
        return interactions.reduce((counts, interaction) => {
            counts[interaction.type] = (counts[interaction.type] || 0) + 1;
            return counts;
        }, {});
    }

    calculateVisitFrequency(visits) {
        if (visits.length === 0) return 0;
        
        const now = new Date();
        const recentVisits = visits.filter(v => 
            new Date(v.lastVisit) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        );
        
        return recentVisits.length / 7; // visitas por dia na última semana
    }

    analyzeCommunicationStyle(scraps) {
        const totalChars = scraps.reduce((total, scrap) => total + scrap.message.length, 0);
        const avgLength = scraps.length > 0 ? totalChars / scraps.length : 0;
        const emojiCount = scraps.reduce((total, scrap) => 
            total + (scrap.message.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length, 0
        );

        return {
            averageLength: avgLength,
            totalMessages: scraps.length,
            emojiUsage: emojiCount / Math.max(scraps.length, 1)
        };
    }

    analyzePhotoActivity(photos) {
        return {
            totalPhotos: photos.length,
            totalLikes: photos.reduce((total, photo) => total + photo.likes.length, 0),
            averageLikes: photos.length > 0 ? photos.reduce((total, photo) => total + photo.likes.length, 0) / photos.length : 0,
            mostPopularPhoto: photos.sort((a, b) => b.likes.length - a.likes.length)[0]?.id || null
        };
    }

    sendToCrushAI(behaviorData) {
        // Envia dados para a Crush IA analisar
        document.dispatchEvent(new CustomEvent('user-behavior-analyzed', {
            detail: behaviorData
        }));
    }

    // UTILITÁRIOS
    getEndpointForType(type) {
        const endpoints = {
            'scrap': '/scraps',
            'testimonial': '/testimonials',
            'photo': '/photos',
            'profile_visit': '/visits',
            'interaction': '/interactions',
            'profile_update': '/user/profile',
            'photo_like': '/photos/like'
        };
        return endpoints[type] || '/data';
    }

    getMethodForType(type) {
        return type.includes('update') ? 'PUT' : 'POST';
    }

    getAuthToken() {
        return localStorage.getItem('orkut_auth_token') || 'demo-token';
    }

    getClientId() {
        let clientId = localStorage.getItem('orkut_client_id');
        if (!clientId) {
            clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2);
            localStorage.setItem('orkut_client_id', clientId);
        }
        return clientId;
    }

    updateSyncStatus(status, message = '') {
        const statusData = {
            status,
            message,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('orkut_sync_status', JSON.stringify(statusData));
        
        document.dispatchEvent(new CustomEvent('sync-status-update', {
            detail: statusData
        }));
    }

    handleDataChange(changeData) {
        console.log('📝 Mudança de dados detectada:', changeData);
        
        // Agenda análise de comportamento se necessário
        if (changeData.type === 'interaction') {
            setTimeout(() => {
                this.analyzeUserBehavior(changeData.userId);
            }, 1000);
        }
        
        // Agenda sincronização
        this.scheduleSync();
    }

    notifyDataUpdate(type, data) {
        document.dispatchEvent(new CustomEvent('remote-data-update', {
            detail: { type, data }
        }));
    }

    // LIMPEZA
    destroy() {
        if (this.syncTimeout) {
            clearInterval(this.syncTimeout);
        }
        
        if (this.scheduleTimeout) {
            clearTimeout(this.scheduleTimeout);
        }
        
        console.log('🛑 Data Manager Persona desativada');
    }
}

// Singleton instance
window.dataManager = new DataManagerPersona();

export default DataManagerPersona;
