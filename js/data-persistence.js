/**
 * ===================================
 * 💾 ORKUT RETRÔ - DATA PERSISTENCE
 * ===================================
 * Sistema de persistência e sincronização de dados
 * LocalStorage ↔ Supabase sync manager
 * Data: 19 de Agosto de 2025
 * ===================================
 */

class DataPersistenceManager {
    constructor() {
        this.config = {
            localStoragePrefix: 'orkut_retro_',
            maxRetries: 3,
            retryDelay: 1000,
            batchSize: 50,
            compressionEnabled: true
        };

        this.syncQueue = [];
        this.isOnline = navigator.onLine;
        this.lastSyncTimestamp = this.getLastSyncTime();
        
        this.setupEventListeners();
        this.initializeSync();
    }

    // ===================================
    // CONFIGURAÇÃO E INICIALIZAÇÃO
    // ===================================

    setupEventListeners() {
        // Monitorar conexão
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processSyncQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // Auto-sync periódico
        setInterval(() => this.autoSync(), 30000); // 30 segundos

        // Sync ao fechar a página
        window.addEventListener('beforeunload', () => {
            this.emergencySync();
        });
    }

    async initializeSync() {
        console.log('🔄 Iniciando sistema de persistência...');
        
        try {
            await this.loadOfflineData();
            if (this.isOnline) {
                await this.processSyncQueue();
            }
            console.log('✅ Sistema de persistência inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar persistência:', error);
        }
    }

    // ===================================
    // OPERAÇÕES LOCALSTORAGE
    // ===================================

    setLocal(key, data, options = {}) {
        try {
            const fullKey = this.config.localStoragePrefix + key;
            const payload = {
                data,
                timestamp: Date.now(),
                version: options.version || '1.0',
                compressed: false
            };

            // Comprimir dados grandes se habilitado
            if (this.config.compressionEnabled && JSON.stringify(data).length > 1000) {
                payload.data = this.compressData(data);
                payload.compressed = true;
            }

            localStorage.setItem(fullKey, JSON.stringify(payload));
            
            // Adicionar à fila de sync se necessário
            if (options.sync !== false) {
                this.addToSyncQueue({
                    action: 'update',
                    key,
                    data,
                    timestamp: payload.timestamp
                });
            }

            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar no localStorage:', error);
            return false;
        }
    }

    getLocal(key, defaultValue = null) {
        try {
            const fullKey = this.config.localStoragePrefix + key;
            const stored = localStorage.getItem(fullKey);
            
            if (!stored) return defaultValue;

            const payload = JSON.parse(stored);
            
            // Descomprimir se necessário
            if (payload.compressed) {
                payload.data = this.decompressData(payload.data);
            }

            return payload.data;
        } catch (error) {
            console.error('❌ Erro ao ler localStorage:', error);
            return defaultValue;
        }
    }

    removeLocal(key, options = {}) {
        try {
            const fullKey = this.config.localStoragePrefix + key;
            localStorage.removeItem(fullKey);

            // Adicionar remoção à fila de sync
            if (options.sync !== false) {
                this.addToSyncQueue({
                    action: 'delete',
                    key,
                    timestamp: Date.now()
                });
            }

            return true;
        } catch (error) {
            console.error('❌ Erro ao remover do localStorage:', error);
            return false;
        }
    }

    // ===================================
    // SISTEMA DE COMPRESSÃO
    // ===================================

    compressData(data) {
        try {
            // Implementação básica de compressão
            const jsonString = JSON.stringify(data);
            return btoa(jsonString); // Base64 encoding
        } catch (error) {
            console.error('❌ Erro na compressão:', error);
            return data;
        }
    }

    decompressData(compressedData) {
        try {
            const jsonString = atob(compressedData); // Base64 decoding
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('❌ Erro na descompressão:', error);
            return compressedData;
        }
    }

    // ===================================
    // OPERAÇÕES SUPABASE
    // ===================================

    async syncToSupabase(key, data, action = 'update') {
        if (!this.isOnline) {
            console.log('📡 Offline - dados serão sincronizados quando possível');
            return false;
        }

        try {
            const endpoint = this.getSupabaseEndpoint(key);
            const response = await this.makeSupabaseRequest(endpoint, {
                action,
                key,
                data,
                user_id: this.getCurrentUserId(),
                timestamp: Date.now()
            });

            if (response.success) {
                console.log(`✅ Dados sincronizados: ${key}`);
                return true;
            } else {
                throw new Error(response.error || 'Erro na sincronização');
            }
        } catch (error) {
            console.error('❌ Erro na sincronização Supabase:', error);
            
            // Reagendar para retry
            this.addToSyncQueue({
                action,
                key,
                data,
                timestamp: Date.now(),
                retryCount: (data.retryCount || 0) + 1
            });
            
            return false;
        }
    }

    async loadFromSupabase(key) {
        if (!this.isOnline) {
            return null;
        }

        try {
            const endpoint = this.getSupabaseEndpoint(key);
            const response = await this.makeSupabaseRequest(endpoint, {
                action: 'read',
                key,
                user_id: this.getCurrentUserId()
            });

            if (response.success && response.data) {
                console.log(`📥 Dados carregados do Supabase: ${key}`);
                return response.data;
            }
            
            return null;
        } catch (error) {
            console.error('❌ Erro ao carregar do Supabase:', error);
            return null;
        }
    }

    // ===================================
    // FILA DE SINCRONIZAÇÃO
    // ===================================

    addToSyncQueue(operation) {
        // Evitar duplicatas
        const existingIndex = this.syncQueue.findIndex(
            item => item.key === operation.key && item.action === operation.action
        );

        if (existingIndex !== -1) {
            this.syncQueue[existingIndex] = operation;
        } else {
            this.syncQueue.push(operation);
        }

        // Limitar tamanho da fila
        if (this.syncQueue.length > 1000) {
            this.syncQueue = this.syncQueue.slice(-500); // Manter apenas os 500 mais recentes
        }

        this.saveQueueToStorage();
    }

    async processSyncQueue() {
        if (!this.isOnline || this.syncQueue.length === 0) {
            return;
        }

        console.log(`🔄 Processando fila de sincronização: ${this.syncQueue.length} itens`);
        
        const batch = this.syncQueue.splice(0, this.config.batchSize);
        const failures = [];

        for (const operation of batch) {
            // Verificar se deve tentar novamente
            if (operation.retryCount >= this.config.maxRetries) {
                console.warn(`⚠️ Operação descartada após ${this.config.maxRetries} tentativas:`, operation.key);
                continue;
            }

            const success = await this.syncToSupabase(operation.key, operation.data, operation.action);
            
            if (!success) {
                failures.push(operation);
                await this.delay(this.config.retryDelay);
            }
        }

        // Reagendar falhas
        this.syncQueue.unshift(...failures);
        this.saveQueueToStorage();

        // Continuar processando se há mais itens
        if (this.syncQueue.length > 0) {
            setTimeout(() => this.processSyncQueue(), 1000);
        } else {
            this.setLastSyncTime(Date.now());
            console.log('✅ Fila de sincronização processada');
        }
    }

    // ===================================
    // OPERAÇÕES DE ALTO NÍVEL
    // ===================================

    async save(key, data, options = {}) {
        const localSuccess = this.setLocal(key, data, options);
        
        if (this.isOnline && options.immediate !== false) {
            await this.syncToSupabase(key, data, 'update');
        }

        return localSuccess;
    }

    async load(key, options = {}) {
        let data = this.getLocal(key);

        // Se dados locais não existem ou estão desatualizados, tentar carregar do servidor
        if (!data || (options.forceRemote && this.isOnline)) {
            const remoteData = await this.loadFromSupabase(key);
            
            if (remoteData) {
                this.setLocal(key, remoteData, { sync: false });
                return remoteData;
            }
        }

        return data;
    }

    async remove(key, options = {}) {
        const localSuccess = this.removeLocal(key, options);
        
        if (this.isOnline && options.immediate !== false) {
            await this.syncToSupabase(key, null, 'delete');
        }

        return localSuccess;
    }

    // ===================================
    // BACKUP E RESTORE
    // ===================================

    async createFullBackup() {
        console.log('💾 Criando backup completo...');
        
        const backup = {
            timestamp: Date.now(),
            version: '2.1.0',
            data: {}
        };

        // Coletar todos os dados do localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.config.localStoragePrefix)) {
                const cleanKey = key.replace(this.config.localStoragePrefix, '');
                backup.data[cleanKey] = this.getLocal(cleanKey);
            }
        }

        // Salvar backup
        const backupKey = `backup_${new Date().toISOString().split('T')[0]}`;
        this.setLocal(backupKey, backup, { sync: true });

        console.log(`✅ Backup criado: ${backupKey}`);
        return backup;
    }

    async restoreFromBackup(backupData) {
        console.log('🔄 Restaurando backup...');
        
        try {
            if (!backupData || !backupData.data) {
                throw new Error('Dados de backup inválidos');
            }

            let restored = 0;
            for (const [key, data] of Object.entries(backupData.data)) {
                if (key.startsWith('backup_')) continue; // Pular outros backups
                
                this.setLocal(key, data, { sync: false });
                restored++;
            }

            console.log(`✅ Backup restaurado: ${restored} itens`);
            
            // Sincronizar dados restaurados
            if (this.isOnline) {
                await this.processSyncQueue();
            }
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao restaurar backup:', error);
            return false;
        }
    }

    // ===================================
    // UTILITÁRIOS
    // ===================================

    async autoSync() {
        if (this.isOnline && this.syncQueue.length > 0) {
            await this.processSyncQueue();
        }
    }

    emergencySync() {
        // Sync síncrono para quando a página está sendo fechada
        if (this.syncQueue.length > 0) {
            const data = {
                queue: this.syncQueue,
                timestamp: Date.now()
            };
            
            localStorage.setItem(`${this.config.localStoragePrefix}emergency_sync`, JSON.stringify(data));
        }
    }

    async loadOfflineData() {
        // Carregar dados de sync de emergência
        const emergencyData = localStorage.getItem(`${this.config.localStoragePrefix}emergency_sync`);
        if (emergencyData) {
            const { queue } = JSON.parse(emergencyData);
            this.syncQueue.unshift(...queue);
            localStorage.removeItem(`${this.config.localStoragePrefix}emergency_sync`);
        }

        // Carregar fila salva
        const savedQueue = this.getLocal('sync_queue');
        if (savedQueue && Array.isArray(savedQueue)) {
            this.syncQueue.unshift(...savedQueue);
        }
    }

    saveQueueToStorage() {
        this.setLocal('sync_queue', this.syncQueue, { sync: false });
    }

    getSupabaseEndpoint(key) {
        // Mapear chaves para endpoints específicos
        const endpointMap = {
            'user_profile': '/api/user/profile',
            'user_posts': '/api/posts',
            'user_friends': '/api/friends',
            'user_communities': '/api/communities',
            'user_settings': '/api/user/settings',
            'spotify_data': '/api/spotify/sync'
        };

        return endpointMap[key] || '/api/sync';
    }

    async makeSupabaseRequest(endpoint, data) {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify(data)
        });

        return await response.json();
    }

    getCurrentUserId() {
        const currentUser = this.getLocal('current_user');
        return currentUser ? currentUser.id : null;
    }

    getAuthToken() {
        return this.getLocal('auth_token') || '';
    }

    getLastSyncTime() {
        return this.getLocal('last_sync_time') || 0;
    }

    setLastSyncTime(timestamp) {
        this.setLocal('last_sync_time', timestamp, { sync: false });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===================================
    // API PÚBLICA
    // ===================================

    getStats() {
        return {
            isOnline: this.isOnline,
            syncQueueLength: this.syncQueue.length,
            lastSync: new Date(this.lastSyncTimestamp).toLocaleString(),
            localStorageUsage: this.getLocalStorageUsage()
        };
    }

    getLocalStorageUsage() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.config.localStoragePrefix)) {
                total += localStorage.getItem(key).length;
            }
        }
        
        return {
            bytes: total,
            kb: (total / 1024).toFixed(2),
            mb: (total / (1024 * 1024)).toFixed(2)
        };
    }

    async clearAllData(confirmationText = '') {
        if (confirmationText !== 'CLEAR_ALL_DATA') {
            throw new Error('Confirmação necessária');
        }

        console.log('🗑️ Limpando todos os dados...');
        
        // Limpar localStorage
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.config.localStoragePrefix)) {
                keys.push(key);
            }
        }

        keys.forEach(key => localStorage.removeItem(key));
        
        // Limpar fila
        this.syncQueue = [];
        
        console.log('✅ Todos os dados foram limpos');
    }
}

// ===================================
// INSTÂNCIA GLOBAL
// ===================================

// Criar instância global
window.DataPersistence = new DataPersistenceManager();

// Aliases para facilidade de uso
window.saveData = (key, data, options) => window.DataPersistence.save(key, data, options);
window.loadData = (key, options) => window.DataPersistence.load(key, options);
window.removeData = (key, options) => window.DataPersistence.remove(key, options);

console.log('💾 Sistema de Persistência de Dados carregado');
console.log('📖 Uso: saveData("key", data), loadData("key"), removeData("key")');
console.log('📊 Stats: DataPersistence.getStats()');
