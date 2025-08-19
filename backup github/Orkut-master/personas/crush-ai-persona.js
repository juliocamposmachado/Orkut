/**
 * Crush AI Persona - Orkut 2025
 * IA que analisa comportamentos e gera indicações de possíveis crushes
 * Aquela pessoa que vive visitando seu perfil e você nem sabe!
 */

class CrushAIPersona {
    constructor() {
        this.analysisInterval = 60000; // 1 minuto
        this.crushThreshold = 0.7; // Score mínimo para considerar crush
        this.behaviorWeights = {
            profileVisits: 0.25,
            photoLikes: 0.20,
            scrapFrequency: 0.20,
            interactionConsistency: 0.15,
            timeSpentAnalyzing: 0.10,
            mutualInteractions: 0.10
        };
        this.crushDatabase = new Map();
        this.notificationQueue = [];
        
        this.initializeAI();
    }

    initializeAI() {
        console.log('💕 Crush AI Persona ativa - Detectando possíveis amores secretos...');
        this.setupEventListeners();
        this.startAnalysisScheduler();
        this.loadExistingCrushData();
    }

    setupEventListeners() {
        // Escuta análises de comportamento do Data Manager
        document.addEventListener('user-behavior-analyzed', (e) => {
            this.processBehaviorData(e.detail);
        });

        // Escuta mudanças de dados remotos
        document.addEventListener('remote-data-update', (e) => {
            this.handleRemoteUpdate(e.detail);
        });

        // Escuta visitações de perfil em tempo real
        document.addEventListener('profile-visited', (e) => {
            this.recordRealTimeVisit(e.detail);
        });

        // Escuta interações em tempo real
        document.addEventListener('interaction-occurred', (e) => {
            this.recordRealTimeInteraction(e.detail);
        });
    }

    startAnalysisScheduler() {
        setInterval(() => {
            this.performPeriodicAnalysis();
        }, this.analysisInterval);

        console.log(`🧠 IA de Crush ativa - Análise a cada ${this.analysisInterval/1000}s`);
    }

    loadExistingCrushData() {
        const existingData = localStorageManager.getCrushData();
        existingData.forEach(data => {
            this.crushDatabase.set(data.userId, data);
        });
        console.log(`📚 Carregados dados de ${existingData.length} usuários para análise`);
    }

    // ANÁLISE PRINCIPAL DE COMPORTAMENTO
    async processBehaviorData(behaviorData) {
        console.log(`🔍 Analisando comportamento do usuário ${behaviorData.userId}`);
        
        const crushScore = await this.calculateCrushScore(behaviorData);
        const patterns = this.identifyBehaviorPatterns(behaviorData);
        const riskLevel = this.assessRiskLevel(behaviorData);
        
        const analysis = {
            userId: behaviorData.userId,
            crushScore,
            patterns,
            riskLevel,
            lastAnalysis: new Date().toISOString(),
            behaviorData
        };

        this.crushDatabase.set(behaviorData.userId, analysis);
        localStorageManager.updateCrushData(behaviorData.userId, analysis);

        // Gera alertas se necessário
        if (crushScore > this.crushThreshold) {
            this.generateCrushAlert(analysis);
        }

        // Verifica stalking behavior
        if (riskLevel === 'high') {
            this.generateStalkingAlert(analysis);
        }
    }

    async calculateCrushScore(behaviorData) {
        const currentUserId = localStorageManager.getUserProfile().id;
        const interactions = localStorageManager.getInteractions()
            .filter(i => i.fromUserId === behaviorData.userId && i.toUserId === currentUserId);
        
        const visits = localStorageManager.getProfileVisits()
            .filter(v => v.visitorId === behaviorData.userId && v.visitedUserId === currentUserId);

        const photos = localStorageManager.getPhotosByUser(currentUserId);
        const myPhotoLikes = photos.reduce((count, photo) => {
            return count + (photo.likes.includes(behaviorData.userId) ? 1 : 0);
        }, 0);

        const scraps = localStorageManager.getScrapsByUser(currentUserId)
            .filter(s => s.fromUserId === behaviorData.userId);

        // CÁLCULO DOS SCORES INDIVIDUAIS
        
        // 1. Frequência de visitas ao perfil
        const visitScore = Math.min(
            (visits.reduce((sum, v) => sum + v.count, 0) / 10), 1
        );

        // 2. Curtidas nas fotos
        const photoLikeScore = Math.min((myPhotoLikes / Math.max(photos.length, 1)), 1);

        // 3. Frequência de scraps
        const scrapScore = Math.min((scraps.length / 5), 1);

        // 4. Consistência temporal das interações
        const consistencyScore = this.calculateConsistencyScore(interactions);

        // 5. Tempo gasto analisando perfil (baseado em visitas longas)
        const timeAnalysisScore = this.calculateTimeAnalysisScore(visits);

        // 6. Mutualidade das interações
        const mutualScore = this.calculateMutualityScore(behaviorData.userId, currentUserId);

        const totalScore = (
            visitScore * this.behaviorWeights.profileVisits +
            photoLikeScore * this.behaviorWeights.photoLikes +
            scrapScore * this.behaviorWeights.scrapFrequency +
            consistencyScore * this.behaviorWeights.interactionConsistency +
            timeAnalysisScore * this.behaviorWeights.timeSpentAnalyzing +
            mutualScore * this.behaviorWeights.mutualInteractions
        );

        console.log(`📊 Score de crush para ${behaviorData.userId}:`, {
            visitScore: visitScore.toFixed(2),
            photoLikeScore: photoLikeScore.toFixed(2),
            scrapScore: scrapScore.toFixed(2),
            consistencyScore: consistencyScore.toFixed(2),
            timeAnalysisScore: timeAnalysisScore.toFixed(2),
            mutualScore: mutualScore.toFixed(2),
            totalScore: totalScore.toFixed(2)
        });

        return Math.min(totalScore, 1);
    }

    calculateConsistencyScore(interactions) {
        if (interactions.length < 2) return 0;

        const timeIntervals = [];
        for (let i = 1; i < interactions.length; i++) {
            const interval = new Date(interactions[i].timestamp) - new Date(interactions[i-1].timestamp);
            timeIntervals.push(interval);
        }

        const avgInterval = timeIntervals.reduce((sum, interval) => sum + interval, 0) / timeIntervals.length;
        const variance = timeIntervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / timeIntervals.length;
        
        // Menor variância = maior consistência
        return Math.max(0, 1 - (Math.sqrt(variance) / avgInterval));
    }

    calculateTimeAnalysisScore(visits) {
        // Assume que visitas múltiplas em pouco tempo = tempo gasto olhando perfil
        const recentVisits = visits.filter(v => {
            const visitTime = new Date(v.lastVisit);
            const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return visitTime > hourAgo;
        });

        const totalRecentVisits = recentVisits.reduce((sum, v) => sum + v.count, 0);
        return Math.min(totalRecentVisits / 5, 1);
    }

    calculateMutualityScore(userId, currentUserId) {
        const interactionsTo = localStorageManager.getInteractions()
            .filter(i => i.fromUserId === currentUserId && i.toUserId === userId).length;
        
        const interactionsFrom = localStorageManager.getInteractions()
            .filter(i => i.fromUserId === userId && i.toUserId === currentUserId).length;

        if (interactionsFrom === 0) return 0;
        
        return Math.min(interactionsTo / interactionsFrom, 1);
    }

    identifyBehaviorPatterns(behaviorData) {
        const patterns = [];
        const currentUserId = localStorageManager.getUserProfile().id;

        // Padrão: Visitador Frequente
        if (behaviorData.visitFrequency > 2) {
            patterns.push({
                type: 'frequent_visitor',
                description: 'Visita seu perfil várias vezes por semana',
                intensity: 'high'
            });
        }

        // Padrão: Curtidor de Fotos
        const photos = localStorageManager.getPhotosByUser(currentUserId);
        const likesCount = photos.reduce((count, photo) => {
            return count + (photo.likes.includes(behaviorData.userId) ? 1 : 0);
        }, 0);
        
        if (likesCount > photos.length * 0.7) {
            patterns.push({
                type: 'photo_enthusiast',
                description: 'Curte a maioria das suas fotos',
                intensity: 'high'
            });
        }

        // Padrão: Comunicador Ativo
        if (behaviorData.communicationStyle.totalMessages > 5) {
            patterns.push({
                type: 'active_communicator',
                description: 'Envia scraps com frequência',
                intensity: behaviorData.communicationStyle.emojiUsage > 2 ? 'high' : 'medium'
            });
        }

        // Padrão: Observador Silencioso
        const interactions = localStorageManager.getInteractions()
            .filter(i => i.fromUserId === behaviorData.userId);
        
        if (behaviorData.visitFrequency > 1 && interactions.length < 3) {
            patterns.push({
                type: 'silent_observer',
                description: 'Visita frequentemente mas interage pouco',
                intensity: 'medium'
            });
        }

        // Padrão: Horário Específico
        const visitTimes = this.analyzeVisitTimes(behaviorData.userId);
        if (visitTimes.pattern) {
            patterns.push({
                type: 'scheduled_visitor',
                description: `Geralmente visita ${visitTimes.pattern}`,
                intensity: 'low'
            });
        }

        return patterns;
    }

    analyzeVisitTimes(userId) {
        const visits = localStorageManager.getProfileVisits()
            .filter(v => v.visitorId === userId);

        const timeSlots = { morning: 0, afternoon: 0, evening: 0, night: 0 };

        visits.forEach(visit => {
            const hour = new Date(visit.lastVisit).getHours();
            if (hour < 12) timeSlots.morning++;
            else if (hour < 18) timeSlots.afternoon++;
            else if (hour < 22) timeSlots.evening++;
            else timeSlots.night++;
        });

        const maxSlot = Object.keys(timeSlots).reduce((a, b) => 
            timeSlots[a] > timeSlots[b] ? a : b
        );

        const patterns = {
            morning: 'de manhã',
            afternoon: 'à tarde',
            evening: 'no início da noite',
            night: 'tarde da noite'
        };

        return {
            pattern: timeSlots[maxSlot] > visits.length * 0.6 ? patterns[maxSlot] : null,
            distribution: timeSlots
        };
    }

    assessRiskLevel(behaviorData) {
        let riskScore = 0;

        // Visitações excessivas
        if (behaviorData.visitFrequency > 5) riskScore += 2;
        else if (behaviorData.visitFrequency > 3) riskScore += 1;

        // Interações muito desequilibradas
        if (behaviorData.totalInteractions > 20 && this.calculateMutualityScore(behaviorData.userId, localStorageManager.getUserProfile().id) < 0.2) {
            riskScore += 2;
        }

        // Horários estranhos
        const nightVisits = this.countNightVisits(behaviorData.userId);
        if (nightVisits > 5) riskScore += 1;

        if (riskScore >= 3) return 'high';
        if (riskScore >= 2) return 'medium';
        return 'low';
    }

    countNightVisits(userId) {
        const visits = localStorageManager.getProfileVisits()
            .filter(v => v.visitorId === userId);
        
        return visits.filter(visit => {
            const hour = new Date(visit.lastVisit).getHours();
            return hour >= 23 || hour <= 5;
        }).length;
    }

    // GERAÇÃO DE ALERTAS
    generateCrushAlert(analysis) {
        const alert = {
            id: `crush_${analysis.userId}_${Date.now()}`,
            type: 'crush_detected',
            userId: analysis.userId,
            crushScore: analysis.crushScore,
            patterns: analysis.patterns,
            message: this.generateCrushMessage(analysis),
            timestamp: new Date().toISOString(),
            read: false,
            priority: this.getCrushPriority(analysis.crushScore)
        };

        this.notificationQueue.push(alert);
        this.saveAlert(alert);
        this.showCrushNotification(alert);

        console.log(`💘 CRUSH DETECTADO!`, alert);
    }

    generateStalkingAlert(analysis) {
        const alert = {
            id: `stalking_${analysis.userId}_${Date.now()}`,
            type: 'potential_stalking',
            userId: analysis.userId,
            riskLevel: analysis.riskLevel,
            patterns: analysis.patterns,
            message: '⚠️ Comportamento suspeito detectado! Este usuário pode estar te observando demais.',
            timestamp: new Date().toISOString(),
            read: false,
            priority: 'high'
        };

        this.notificationQueue.push(alert);
        this.saveAlert(alert);
        this.showStalkingNotification(alert);

        console.log(`⚠️ POSSÍVEL STALKING DETECTADO!`, alert);
    }

    generateCrushMessage(analysis) {
        const user = this.getUserInfo(analysis.userId);
        const score = Math.round(analysis.crushScore * 100);
        
        const messages = [
            `💕 ${user.name || 'Alguém'} parece estar interessado em você! (${score}% de chance)`,
            `👀 ${user.name || 'Uma pessoa'} tem visitado muito seu perfil ultimamente...`,
            `💘 Detectei sinais de crush! ${user.name || 'Alguém'} pode estar apaixonado por você!`,
            `🔥 ${user.name || 'Uma pessoa especial'} está demonstrando muito interesse em você!`,
            `💖 Acho que você tem um admirador secreto: ${user.name || 'alguém especial'}!`
        ];

        return messages[Math.floor(Math.random() * messages.length)];
    }

    getCrushPriority(score) {
        if (score > 0.9) return 'urgent';
        if (score > 0.8) return 'high';
        if (score > 0.7) return 'medium';
        return 'low';
    }

    // ANÁLISE PERIÓDICA
    async performPeriodicAnalysis() {
        console.log('🔄 Realizando análise periódica de crushes...');
        
        const currentUserId = localStorageManager.getUserProfile().id;
        const allVisits = localStorageManager.getProfileVisits()
            .filter(v => v.visitedUserId === currentUserId);

        // Agrupa visitas por usuário
        const userVisits = allVisits.reduce((groups, visit) => {
            if (!groups[visit.visitorId]) {
                groups[visit.visitorId] = [];
            }
            groups[visit.visitorId].push(visit);
            return groups;
        }, {});

        // Analisa cada usuário que visitou o perfil
        for (const [userId, visits] of Object.entries(userVisits)) {
            if (userId === currentUserId) continue; // Pula o próprio usuário
            
            const behaviorData = dataManager.analyzeUserBehavior(userId);
            await this.processBehaviorData(behaviorData);
        }

        // Gera relatório de insights
        this.generateInsightsReport();
    }

    generateInsightsReport() {
        const crushData = Array.from(this.crushDatabase.values());
        const totalAnalyzed = crushData.length;
        const crushDetected = crushData.filter(d => d.crushScore > this.crushThreshold).length;
        const highRisk = crushData.filter(d => d.riskLevel === 'high').length;

        const report = {
            timestamp: new Date().toISOString(),
            totalUsersAnalyzed: totalAnalyzed,
            crushesDetected: crushDetected,
            highRiskBehaviors: highRisk,
            topCrushes: crushData
                .sort((a, b) => b.crushScore - a.crushScore)
                .slice(0, 5)
                .map(d => ({
                    userId: d.userId,
                    score: Math.round(d.crushScore * 100),
                    patterns: d.patterns.length
                })),
            insights: this.generateInsights(crushData)
        };

        console.log('📊 Relatório de Insights de Crush:', report);
        localStorage.setItem('orkut_crush_insights', JSON.stringify(report));
        
        return report;
    }

    generateInsights(crushData) {
        const insights = [];
        
        // Insight sobre horários
        const allPatterns = crushData.flatMap(d => d.patterns);
        const scheduledVisitors = allPatterns.filter(p => p.type === 'scheduled_visitor').length;
        if (scheduledVisitors > 0) {
            insights.push(`${scheduledVisitors} pessoas visitam seu perfil em horários específicos`);
        }

        // Insight sobre comunicação
        const activeCommunicators = allPatterns.filter(p => p.type === 'active_communicator').length;
        if (activeCommunicators > 0) {
            insights.push(`${activeCommunicators} pessoas são muito ativas em se comunicar com você`);
        }

        // Insight sobre observadores silenciosos
        const silentObservers = allPatterns.filter(p => p.type === 'silent_observer').length;
        if (silentObservers > 0) {
            insights.push(`${silentObservers} pessoas te observam mas não interagem muito`);
        }

        return insights;
    }

    // NOTIFICAÇÕES E UI
    showCrushNotification(alert) {
        // Cria notificação visual
        const notification = document.createElement('div');
        notification.className = 'crush-notification';
        notification.innerHTML = `
            <div class="crush-alert ${alert.priority}">
                <div class="crush-icon">💕</div>
                <div class="crush-content">
                    <h4>Possível Crush Detectado!</h4>
                    <p>${alert.message}</p>
                    <div class="crush-actions">
                        <button onclick="this.viewCrushProfile('${alert.userId}')">👤 Ver Perfil</button>
                        <button onclick="this.dismissAlert('${alert.id}')">❌ Dispensar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);
        
        // Auto-remove após 10 segundos se não for urgente
        if (alert.priority !== 'urgent') {
            setTimeout(() => {
                notification.remove();
            }, 10000);
        }

        // Efeito sonoro (se disponível)
        this.playNotificationSound('crush');
    }

    showStalkingNotification(alert) {
        const notification = document.createElement('div');
        notification.className = 'stalking-notification warning';
        notification.innerHTML = `
            <div class="stalking-alert">
                <div class="warning-icon">⚠️</div>
                <div class="warning-content">
                    <h4>Comportamento Suspeito</h4>
                    <p>${alert.message}</p>
                    <div class="warning-actions">
                        <button onclick="this.blockUser('${alert.userId}')">🚫 Bloquear</button>
                        <button onclick="this.viewUserBehavior('${alert.userId}')">📊 Ver Detalhes</button>
                        <button onclick="this.dismissAlert('${alert.id}')">❌ Ignorar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);
    }

    // GERENCIAMENTO DE DADOS
    saveAlert(alert) {
        const alerts = JSON.parse(localStorage.getItem('orkut_crush_alerts') || '[]');
        alerts.push(alert);
        
        // Mantém apenas os últimos 50 alertas
        if (alerts.length > 50) {
            alerts.splice(0, alerts.length - 50);
        }
        
        localStorage.setItem('orkut_crush_alerts', JSON.stringify(alerts));
    }

    getAllAlerts() {
        return JSON.parse(localStorage.getItem('orkut_crush_alerts') || '[]');
    }

    getUnreadAlerts() {
        return this.getAllAlerts().filter(alert => !alert.read);
    }

    markAlertAsRead(alertId) {
        const alerts = this.getAllAlerts();
        const alert = alerts.find(a => a.id === alertId);
        if (alert) {
            alert.read = true;
            localStorage.setItem('orkut_crush_alerts', JSON.stringify(alerts));
        }
    }

    // EVENTOS EM TEMPO REAL
    recordRealTimeVisit(visitData) {
        console.log('👀 Visita em tempo real detectada:', visitData);
        
        // Se é uma visita repetida em pouco tempo, pode ser interesse especial
        const recentVisits = localStorageManager.getProfileVisits()
            .filter(v => 
                v.visitorId === visitData.visitorId && 
                new Date(v.lastVisit) > new Date(Date.now() - 10 * 60 * 1000) // últimos 10 minutos
            );

        if (recentVisits.length > 2) {
            console.log('🔍 Possível interesse especial detectado - visitas frequentes');
            setTimeout(() => {
                dataManager.analyzeUserBehavior(visitData.visitorId);
            }, 5000);
        }
    }

    recordRealTimeInteraction(interactionData) {
        console.log('💬 Interação em tempo real:', interactionData);
        
        // Agenda análise se é uma interação significativa
        if (['like', 'comment', 'scrap'].includes(interactionData.type)) {
            setTimeout(() => {
                dataManager.analyzeUserBehavior(interactionData.fromUserId);
            }, 2000);
        }
    }

    handleRemoteUpdate(updateData) {
        // Re-analisa quando recebe dados remotos
        if (updateData.type === 'profile_visit' || updateData.type === 'interaction') {
            setTimeout(() => {
                this.performPeriodicAnalysis();
            }, 5000);
        }
    }

    // UTILITÁRIOS
    getUserInfo(userId) {
        // Busca informações básicas do usuário
        return {
            id: userId,
            name: `Usuário ${userId.slice(0, 8)}`,
            avatar: '/assets/default-avatar.png'
        };
    }

    playNotificationSound(type) {
        try {
            const audio = new Audio(`/assets/sounds/${type}-alert.mp3`);
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Som não disponível'));
        } catch (e) {
            // Sons não disponíveis
        }
    }

    // INTERFACE PÚBLICA
    getCrushSuggestions(limit = 10) {
        const suggestions = Array.from(this.crushDatabase.values())
            .filter(data => data.crushScore > this.crushThreshold)
            .sort((a, b) => b.crushScore - a.crushScore)
            .slice(0, limit);

        return suggestions.map(suggestion => ({
            userId: suggestion.userId,
            user: this.getUserInfo(suggestion.userId),
            crushScore: Math.round(suggestion.crushScore * 100),
            patterns: suggestion.patterns,
            message: this.generateCrushMessage(suggestion)
        }));
    }

    getStalkingAlerts() {
        return this.getAllAlerts().filter(alert => alert.type === 'potential_stalking');
    }

    getUserAnalysis(userId) {
        return this.crushDatabase.get(userId) || null;
    }

    // LIMPEZA
    destroy() {
        console.log('🛑 Crush AI Persona desativada');
    }
}

// Singleton instance
window.crushAI = new CrushAIPersona();

export default CrushAIPersona;
