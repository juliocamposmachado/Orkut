/**
 * 🔧 Bot Gestor de Rede Social (LLM)
 * Sistema completo de monitoramento, registro e atualização de perfis
 * 
 * Ciclo: Observe → Analise → Atue
 */

class SocialNetworkManager {
    constructor() {
        this.monitoringInterval = 10 * 60 * 1000; // 10 minutos em ms
        this.isActive = true;
        this.lastCheck = null;
        this.profileCompletionTasks = [];
        this.interactionHistory = [];
        this.profileAnalytics = {};
        
        this.initializeManager();
    }

    // 🚀 Inicialização do sistema
    initializeManager() {
        console.log('🤖 Bot Gestor de Rede Social iniciado');
        
        // Iniciar ciclo de monitoramento
        this.startMonitoringCycle();
        
        // Registrar eventos de interação
        this.registerInteractionListeners();
        
        // Executar primeira análise
        setTimeout(() => this.executeAnalysisCycle(), 2000);
        
        // Criar interface de status
        this.createStatusInterface();
    }

    // 🔄 CICLO 1: OBSERVAR
    async observe() {
        console.log('👁️ Iniciando observação...');
        
        const observations = {
            timestamp: new Date().toISOString(),
            userData: this.collectUserData(),
            interactions: this.collectRecentInteractions(),
            profileState: this.analyzeProfileState(),
            systemStatus: this.getSystemStatus()
        };

        // Registrar observação no localStorage
        this.saveObservation(observations);
        
        return observations;
    }

    // 📊 Coleta dados salvos do usuário
    collectUserData() {
        const userData = {
            profile: JSON.parse(localStorage.getItem('userProfile') || '{}'),
            preferences: JSON.parse(localStorage.getItem('userPreferences') || '{}'),
            settings: JSON.parse(localStorage.getItem('appSettings') || '{}'),
            friends: JSON.parse(localStorage.getItem('friendsList') || '[]'),
            communities: JSON.parse(localStorage.getItem('userCommunities') || '[]'),
            photos: JSON.parse(localStorage.getItem('userPhotos') || '[]')
        };

        return userData;
    }

    // 📝 Coleta interações recentes
    collectRecentInteractions() {
        const interactions = JSON.parse(localStorage.getItem('recentInteractions') || '[]');
        const lastHour = new Date(Date.now() - 60 * 60 * 1000);
        
        return interactions.filter(interaction => 
            new Date(interaction.timestamp) > lastHour
        );
    }

    // 🔍 CICLO 2: ANALISAR
    async analyze(observations) {
        console.log('🔍 Iniciando análise...');
        
        const analysis = {
            profileCompleteness: this.analyzeProfileCompleteness(observations.userData),
            missingFields: this.identifyMissingFields(observations.userData),
            interactionPatterns: this.analyzeInteractionPatterns(observations.interactions),
            recommendations: this.generateRecommendations(observations.userData),
            urgentTasks: this.identifyUrgentTasks(observations.userData),
            timestamp: new Date().toISOString()
        };

        // Salvar análise
        this.saveAnalysis(analysis);
        
        return analysis;
    }

    // 📈 Análise de completude do perfil
    analyzeProfileCompleteness(userData) {
        const profile = userData.profile;
        const requiredFields = [
            'name', 'email', 'photo', 'bio', 'age', 
            'location', 'relationship', 'birthday'
        ];
        
        const completedFields = requiredFields.filter(field => 
            profile[field] && profile[field].toString().trim() !== ''
        );
        
        const completeness = (completedFields.length / requiredFields.length) * 100;
        
        return {
            percentage: Math.round(completeness),
            completedFields: completedFields,
            totalFields: requiredFields.length,
            status: completeness >= 80 ? 'complete' : completeness >= 50 ? 'partial' : 'incomplete'
        };
    }

    // 🔍 Identificar campos ausentes
    identifyMissingFields(userData) {
        const profile = userData.profile;
        const missingFields = [];
        
        const fieldChecks = {
            photo: !profile.photo || profile.photo === 'images/default-avatar.png',
            bio: !profile.bio || profile.bio.length < 10,
            age: !profile.age || profile.age === '',
            location: !profile.location || profile.location === '',
            relationship: !profile.relationship || profile.relationship === '',
            birthday: !profile.birthday || profile.birthday === '',
            interests: !userData.preferences.interests || userData.preferences.interests.length === 0,
            friends: userData.friends.length < 3,
            communities: userData.communities.length < 1
        };

        Object.entries(fieldChecks).forEach(([field, isMissing]) => {
            if (isMissing) {
                missingFields.push({
                    field: field,
                    priority: this.getFieldPriority(field),
                    description: this.getFieldDescription(field)
                });
            }
        });

        return missingFields.sort((a, b) => b.priority - a.priority);
    }

    // 🎯 CICLO 3: ATUAR
    async act(analysis) {
        console.log('⚡ Iniciando ações...');
        
        const actions = {
            timestamp: new Date().toISOString(),
            databaseSync: await this.syncDatabase(analysis),
            tasksGenerated: await this.generateTasks(analysis),
            notificationsSent: await this.sendNotifications(analysis),
            profileUpdates: await this.suggestProfileUpdates(analysis)
        };

        // Registrar ações executadas
        this.saveActions(actions);
        
        return actions;
    }

    // 💾 Sincronização com banco de dados
    async syncDatabase(analysis) {
        const syncData = {
            timestamp: new Date().toISOString(),
            userId: this.getCurrentUserId(),
            profileData: JSON.parse(localStorage.getItem('userProfile') || '{}'),
            interactions: this.interactionHistory,
            analysis: analysis,
            version: this.generateVersionId()
        };

        // Salvar no "banco de dados" (localStorage central)
        const dbHistory = JSON.parse(localStorage.getItem('centralDatabase') || '[]');
        dbHistory.push(syncData);
        
        // Manter apenas últimas 100 entradas para não sobrecarregar
        if (dbHistory.length > 100) {
            dbHistory.splice(0, dbHistory.length - 100);
        }
        
        localStorage.setItem('centralDatabase', JSON.stringify(dbHistory));
        
        console.log('💾 Dados sincronizados com sucesso');
        return { success: true, recordsCount: dbHistory.length };
    }

    // 📋 Geração de tarefas automáticas
    async generateTasks(analysis) {
        const tasks = [];
        
        analysis.missingFields.forEach(field => {
            const task = {
                id: this.generateTaskId(),
                type: 'profile_completion',
                field: field.field,
                title: this.getTaskTitle(field.field),
                description: field.description,
                priority: field.priority,
                status: 'pending',
                createdAt: new Date().toISOString(),
                dueDate: this.calculateDueDate(field.priority)
            };
            
            tasks.push(task);
        });

        // Adicionar tarefas de engajamento se perfil estiver completo
        if (analysis.profileCompleteness.percentage >= 80) {
            tasks.push(...this.generateEngagementTasks());
        }

        // Salvar tarefas
        localStorage.setItem('profileTasks', JSON.stringify(tasks));
        this.profileCompletionTasks = tasks;
        
        console.log(`📋 ${tasks.length} tarefas geradas`);
        return tasks;
    }

    // 🔔 Sistema de notificações
    async sendNotifications(analysis) {
        const notifications = [];
        
        // Notificação para perfil incompleto
        if (analysis.profileCompleteness.percentage < 80) {
            const notification = this.createNotification({
                type: 'profile_incomplete',
                title: '📋 Complete seu perfil!',
                message: `Seu perfil está ${analysis.profileCompleteness.percentage}% completo. Complete para ter mais visibilidade!`,
                action: 'complete_profile',
                priority: 'high'
            });
            
            notifications.push(notification);
            this.displayNotification(notification);
        }

        // Notificações para tarefas urgentes
        if (analysis.urgentTasks.length > 0) {
            const notification = this.createNotification({
                type: 'urgent_tasks',
                title: '⚡ Tarefas importantes!',
                message: `Você tem ${analysis.urgentTasks.length} tarefas importantes pendentes.`,
                action: 'view_tasks',
                priority: 'medium'
            });
            
            notifications.push(notification);
            this.displayNotification(notification);
        }

        // Salvar histórico de notificações
        const notificationHistory = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
        notificationHistory.push(...notifications);
        localStorage.setItem('notificationHistory', JSON.stringify(notificationHistory));
        
        return notifications;
    }

    // 🔄 Ciclo principal de execução
    async executeAnalysisCycle() {
        if (!this.isActive) return;
        
        try {
            console.log('🤖 Executando ciclo de análise...');
            
            // 1. Observar
            const observations = await this.observe();
            
            // 2. Analisar
            const analysis = await this.analyze(observations);
            
            // 3. Atuar
            const actions = await this.act(analysis);
            
            // Atualizar status
            this.updateManagerStatus({
                lastExecution: new Date().toISOString(),
                cycleResults: { observations, analysis, actions },
                status: 'active'
            });
            
            console.log('✅ Ciclo executado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro no ciclo de análise:', error);
            this.updateManagerStatus({
                lastError: error.message,
                status: 'error'
            });
        }
    }

    // ⏰ Iniciar monitoramento contínuo
    startMonitoringCycle() {
        // Executar imediatamente
        this.executeAnalysisCycle();
        
        // Configurar execução a cada 10 minutos
        setInterval(() => {
            this.executeAnalysisCycle();
        }, this.monitoringInterval);
        
        console.log('⏰ Monitoramento iniciado (executa a cada 10 minutos)');
    }

    // 🎧 Registrar listeners para interações
    registerInteractionListeners() {
        // Capturar cliques em elementos importantes
        document.addEventListener('click', (event) => {
            this.logInteraction({
                type: 'click',
                element: event.target.tagName,
                elementId: event.target.id,
                elementClass: event.target.className,
                timestamp: new Date().toISOString()
            });
        });

        // Capturar envio de formulários
        document.addEventListener('submit', (event) => {
            this.logInteraction({
                type: 'form_submit',
                formId: event.target.id,
                timestamp: new Date().toISOString()
            });
        });

        // Capturar mudanças em inputs importantes
        const importantInputs = ['input[type="text"]', 'textarea', 'select'];
        importantInputs.forEach(selector => {
            document.querySelectorAll(selector).forEach(input => {
                input.addEventListener('change', (event) => {
                    this.logInteraction({
                        type: 'input_change',
                        inputId: event.target.id,
                        inputName: event.target.name,
                        timestamp: new Date().toISOString()
                    });
                });
            });
        });
    }

    // 📝 Registrar interação
    logInteraction(interaction) {
        this.interactionHistory.push(interaction);
        
        // Manter apenas últimas 1000 interações
        if (this.interactionHistory.length > 1000) {
            this.interactionHistory.splice(0, this.interactionHistory.length - 1000);
        }
        
        // Salvar no localStorage
        const recentInteractions = JSON.parse(localStorage.getItem('recentInteractions') || '[]');
        recentInteractions.push(interaction);
        
        // Manter apenas últimas 100 interações recentes
        if (recentInteractions.length > 100) {
            recentInteractions.splice(0, recentInteractions.length - 100);
        }
        
        localStorage.setItem('recentInteractions', JSON.stringify(recentInteractions));
    }

    // 🖥️ Interface de status do bot
    createStatusInterface() {
        // Criar botão de status se não existir
        if (!document.getElementById('bot-status-indicator')) {
            const statusButton = document.createElement('div');
            statusButton.id = 'bot-status-indicator';
            statusButton.innerHTML = `
                <div class="bot-status-button" onclick="window.socialNetworkManager.toggleStatusPanel()">
                    <span class="bot-icon">🤖</span>
                    <span class="bot-status">Ativo</span>
                </div>
            `;
            
            document.body.appendChild(statusButton);
        }

        // Criar painel de status
        if (!document.getElementById('bot-status-panel')) {
            const statusPanel = document.createElement('div');
            statusPanel.id = 'bot-status-panel';
            statusPanel.className = 'bot-status-panel hidden';
            statusPanel.innerHTML = this.generateStatusPanelHTML();
            
            document.body.appendChild(statusPanel);
        }

        // Adicionar estilos
        this.addStatusStyles();
    }

    // 📊 Gerar HTML do painel de status
    generateStatusPanelHTML() {
        const status = JSON.parse(localStorage.getItem('managerStatus') || '{}');
        const tasks = JSON.parse(localStorage.getItem('profileTasks') || '[]');
        const pendingTasks = tasks.filter(task => task.status === 'pending');
        
        return `
            <div class="status-header">
                <h3>🤖 Bot Gestor de Rede Social</h3>
                <button onclick="window.socialNetworkManager.toggleStatusPanel()">✕</button>
            </div>
            
            <div class="status-content">
                <div class="status-section">
                    <h4>📊 Status Atual</h4>
                    <p><strong>Estado:</strong> <span class="status-active">Ativo</span></p>
                    <p><strong>Última execução:</strong> ${status.lastExecution ? new Date(status.lastExecution).toLocaleString() : 'Nunca'}</p>
                    <p><strong>Próxima execução:</strong> ${this.getNextExecutionTime()}</p>
                </div>
                
                <div class="status-section">
                    <h4>📋 Tarefas Pendentes</h4>
                    <p><strong>Total:</strong> ${pendingTasks.length} tarefas</p>
                    <div class="tasks-list">
                        ${pendingTasks.slice(0, 5).map(task => `
                            <div class="task-item">
                                <span class="task-priority priority-${task.priority}">●</span>
                                ${task.title}
                            </div>
                        `).join('')}
                        ${pendingTasks.length > 5 ? `<p>... e mais ${pendingTasks.length - 5} tarefas</p>` : ''}
                    </div>
                </div>
                
                <div class="status-section">
                    <h4>⚙️ Ações</h4>
                    <button onclick="window.socialNetworkManager.executeAnalysisCycle()" class="action-btn">
                        🔄 Executar Análise
                    </button>
                    <button onclick="window.socialNetworkManager.showTasks()" class="action-btn">
                        📋 Ver Tarefas
                    </button>
                    <button onclick="window.socialNetworkManager.clearData()" class="action-btn danger">
                        🗑️ Limpar Dados
                    </button>
                </div>
            </div>
        `;
    }

    // 🎨 Adicionar estilos para interface
    addStatusStyles() {
        if (document.getElementById('bot-manager-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'bot-manager-styles';
        styles.textContent = `
            #bot-status-indicator {
                position: fixed;
                bottom: 80px;
                right: 20px;
                z-index: 10000;
            }
            
            .bot-status-button {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 10px 15px;
                border-radius: 25px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.3s ease;
            }
            
            .bot-status-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            }
            
            .bot-status-panel {
                position: fixed;
                bottom: 140px;
                right: 20px;
                width: 350px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                z-index: 10001;
                border: 1px solid #e0e0e0;
                max-height: 500px;
                overflow-y: auto;
            }
            
            .bot-status-panel.hidden {
                display: none;
            }
            
            .status-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px;
                border-radius: 15px 15px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .status-header h3 {
                margin: 0;
                font-size: 16px;
            }
            
            .status-header button {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 25px;
                height: 25px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s;
            }
            
            .status-header button:hover {
                background: rgba(255,255,255,0.2);
            }
            
            .status-content {
                padding: 15px;
            }
            
            .status-section {
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .status-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            
            .status-section h4 {
                margin: 0 0 10px 0;
                font-size: 14px;
                color: #333;
            }
            
            .status-section p {
                margin: 5px 0;
                font-size: 13px;
                color: #666;
            }
            
            .status-active {
                color: #22c55e;
                font-weight: 600;
            }
            
            .tasks-list {
                margin-top: 10px;
            }
            
            .task-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 5px 0;
                font-size: 12px;
                color: #555;
            }
            
            .task-priority {
                font-size: 10px;
            }
            
            .priority-high { color: #ef4444; }
            .priority-medium { color: #f59e0b; }
            .priority-low { color: #10b981; }
            
            .action-btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 12px;
                cursor: pointer;
                margin: 3px;
                transition: background 0.2s;
            }
            
            .action-btn:hover {
                background: #5a67d8;
            }
            
            .action-btn.danger {
                background: #ef4444;
            }
            
            .action-btn.danger:hover {
                background: #dc2626;
            }
        `;
        
        document.head.appendChild(styles);
    }

    // 🔄 Toggle do painel de status
    toggleStatusPanel() {
        const panel = document.getElementById('bot-status-panel');
        if (panel) {
            panel.classList.toggle('hidden');
            
            // Atualizar conteúdo se estiver abrindo
            if (!panel.classList.contains('hidden')) {
                panel.innerHTML = this.generateStatusPanelHTML();
            }
        }
    }

    // ⏰ Calcular próxima execução
    getNextExecutionTime() {
        const now = new Date();
        const next = new Date(now.getTime() + this.monitoringInterval);
        return next.toLocaleTimeString();
    }

    // 📋 Mostrar tarefas
    showTasks() {
        const tasks = JSON.parse(localStorage.getItem('profileTasks') || '[]');
        alert(`Você tem ${tasks.length} tarefas. Verifique o console para detalhes.`);
        console.table(tasks);
    }

    // 🗑️ Limpar dados do bot
    clearData() {
        if (confirm('Tem certeza que deseja limpar todos os dados do bot? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem('centralDatabase');
            localStorage.removeItem('profileTasks');
            localStorage.removeItem('recentInteractions');
            localStorage.removeItem('notificationHistory');
            localStorage.removeItem('managerStatus');
            
            this.interactionHistory = [];
            this.profileCompletionTasks = [];
            
            alert('Dados limpos com sucesso!');
            this.toggleStatusPanel();
        }
    }

    // 🆔 Utilitários
    getCurrentUserId() {
        return localStorage.getItem('currentUserId') || 'user_' + Date.now();
    }
    
    generateTaskId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateVersionId() {
        return 'v_' + Date.now();
    }

    getFieldPriority(field) {
        const priorities = {
            photo: 10, bio: 9, name: 8, age: 7,
            location: 6, relationship: 5, birthday: 4,
            interests: 6, friends: 3, communities: 2
        };
        return priorities[field] || 1;
    }

    getFieldDescription(field) {
        const descriptions = {
            photo: 'Adicione uma foto de perfil para se destacar',
            bio: 'Escreva uma biografia interessante sobre você',
            age: 'Informe sua idade para encontrar pessoas da sua faixa etária',
            location: 'Adicione sua localização para encontrar pessoas próximas',
            relationship: 'Defina seu status de relacionamento',
            birthday: 'Adicione sua data de aniversário',
            interests: 'Selecione seus interesses e hobbies',
            friends: 'Adicione pelo menos 3 amigos para ter uma rede social ativa',
            communities: 'Participe de pelo menos 1 comunidade'
        };
        return descriptions[field] || 'Complete este campo do seu perfil';
    }

    getTaskTitle(field) {
        const titles = {
            photo: 'Adicionar foto de perfil',
            bio: 'Escrever biografia',
            age: 'Informar idade',
            location: 'Adicionar localização',
            relationship: 'Definir status de relacionamento',
            birthday: 'Adicionar data de aniversário',
            interests: 'Selecionar interesses',
            friends: 'Adicionar mais amigos',
            communities: 'Participar de comunidades'
        };
        return titles[field] || 'Completar perfil';
    }

    calculateDueDate(priority) {
        const daysFromNow = priority >= 8 ? 1 : priority >= 5 ? 3 : 7;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + daysFromNow);
        return dueDate.toISOString();
    }

    // Métodos auxiliares de análise e ação
    analyzeProfileState() {
        // Implementação da análise do estado do perfil
        return { complete: true, lastUpdate: new Date().toISOString() };
    }

    getSystemStatus() {
        return { 
            active: this.isActive, 
            memoryUsage: this.calculateMemoryUsage(),
            lastError: null 
        };
    }

    calculateMemoryUsage() {
        // Simular uso de memória baseado no localStorage
        const totalData = Object.keys(localStorage).reduce((total, key) => {
            return total + localStorage.getItem(key).length;
        }, 0);
        return Math.round(totalData / 1024) + ' KB';
    }

    analyzeInteractionPatterns(interactions) {
        return {
            totalInteractions: interactions.length,
            mostCommonType: this.getMostCommonInteractionType(interactions),
            engagementLevel: interactions.length > 10 ? 'high' : interactions.length > 5 ? 'medium' : 'low'
        };
    }

    getMostCommonInteractionType(interactions) {
        const typeCounts = {};
        interactions.forEach(interaction => {
            typeCounts[interaction.type] = (typeCounts[interaction.type] || 0) + 1;
        });
        
        return Object.keys(typeCounts).reduce((a, b) => 
            typeCounts[a] > typeCounts[b] ? a : b, 'none'
        );
    }

    generateRecommendations(userData) {
        const recommendations = [];
        
        if (userData.friends.length < 5) {
            recommendations.push('Adicione mais amigos para expandir sua rede');
        }
        
        if (userData.communities.length === 0) {
            recommendations.push('Participe de comunidades com seus interesses');
        }
        
        return recommendations;
    }

    identifyUrgentTasks(userData) {
        const urgentTasks = [];
        const profile = userData.profile;
        
        if (!profile.photo || profile.photo === 'images/default-avatar.png') {
            urgentTasks.push('Adicionar foto de perfil');
        }
        
        if (!profile.bio || profile.bio.length < 10) {
            urgentTasks.push('Escrever biografia');
        }
        
        return urgentTasks;
    }

    generateEngagementTasks() {
        return [
            {
                id: this.generateTaskId(),
                type: 'engagement',
                title: 'Interagir com amigos',
                description: 'Deixe scraps ou depoimentos para seus amigos',
                priority: 'medium',
                status: 'pending',
                createdAt: new Date().toISOString()
            }
        ];
    }

    createNotification(notification) {
        return {
            id: 'notif_' + Date.now(),
            ...notification,
            timestamp: new Date().toISOString(),
            read: false
        };
    }

    displayNotification(notification) {
        // Criar elemento de notificação visual
        const notifElement = document.createElement('div');
        notifElement.className = 'bot-notification';
        notifElement.innerHTML = `
            <div class="notification-content">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
                <button onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        
        // Adicionar estilos se não existirem
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .bot-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-left: 4px solid #667eea;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    padding: 15px;
                    max-width: 300px;
                    z-index: 10002;
                    animation: slideIn 0.3s ease;
                }
                
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                .notification-content h4 {
                    margin: 0 0 8px 0;
                    color: #333;
                    font-size: 14px;
                }
                
                .notification-content p {
                    margin: 0 0 12px 0;
                    color: #666;
                    font-size: 12px;
                    line-height: 1.4;
                }
                
                .notification-content button {
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-size: 11px;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notifElement);
        
        // Remover após 5 segundos
        setTimeout(() => {
            if (notifElement.parentNode) {
                notifElement.remove();
            }
        }, 5000);
    }

    saveObservation(observation) {
        const observations = JSON.parse(localStorage.getItem('botObservations') || '[]');
        observations.push(observation);
        
        // Manter apenas últimas 50 observações
        if (observations.length > 50) {
            observations.splice(0, observations.length - 50);
        }
        
        localStorage.setItem('botObservations', JSON.stringify(observations));
    }

    saveAnalysis(analysis) {
        const analyses = JSON.parse(localStorage.getItem('botAnalyses') || '[]');
        analyses.push(analysis);
        
        // Manter apenas últimas 30 análises
        if (analyses.length > 30) {
            analyses.splice(0, analyses.length - 30);
        }
        
        localStorage.setItem('botAnalyses', JSON.stringify(analyses));
    }

    saveActions(actions) {
        const actionHistory = JSON.parse(localStorage.getItem('botActions') || '[]');
        actionHistory.push(actions);
        
        // Manter apenas últimas 30 ações
        if (actionHistory.length > 30) {
            actionHistory.splice(0, actionHistory.length - 30);
        }
        
        localStorage.setItem('botActions', JSON.stringify(actionHistory));
    }

    updateManagerStatus(status) {
        const currentStatus = JSON.parse(localStorage.getItem('managerStatus') || '{}');
        const updatedStatus = { ...currentStatus, ...status };
        localStorage.setItem('managerStatus', JSON.stringify(updatedStatus));
    }

    // 🛑 Parar o bot
    stop() {
        this.isActive = false;
        console.log('🛑 Bot Gestor de Rede Social parado');
    }

    // ▶️ Reiniciar o bot
    start() {
        this.isActive = true;
        this.startMonitoringCycle();
        console.log('▶️ Bot Gestor de Rede Social reiniciado');
    }
}

// 🚀 Inicializar automaticamente quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar 2 segundos para garantir que outros scripts carreguem
    setTimeout(() => {
        window.socialNetworkManager = new SocialNetworkManager();
        console.log('🤖 Bot Gestor de Rede Social está funcionando!');
    }, 2000);
});

// Exportar para uso global
window.SocialNetworkManager = SocialNetworkManager;
