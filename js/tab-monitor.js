// Sistema de Monitoramento de Abas
class TabMonitor {
    constructor() {
        this.isActive = true;
        this.currentActivity = null;
        this.activities = [];
        this.detectionInterval = 3000; // 3 segundos
        this.supportedSites = {
            'netflix.com': {
                name: 'Netflix',
                icon: '🎬',
                detector: this.detectNetflix.bind(this),
                color: '#E50914'
            },
            'youtube.com': {
                name: 'YouTube',
                icon: '📺',
                detector: this.detectYoutube.bind(this),
                color: '#FF0000'
            },
            'spotify.com': {
                name: 'Spotify',
                icon: '🎵',
                detector: this.detectSpotify.bind(this),
                color: '#1DB954'
            },
            'primevideo.com': {
                name: 'Prime Video',
                icon: '🎥',
                detector: this.detectPrimeVideo.bind(this),
                color: '#00A8E1'
            },
            'disney': {
                name: 'Disney+',
                icon: '🏰',
                detector: this.detectDisneyPlus.bind(this),
                color: '#113CCF'
            }
        };
        
        this.init();
    }

    init() {
        this.createActivityDisplay();
        this.startMonitoring();
        this.setupEventListeners();
    }

    createActivityDisplay() {
        // Criar display de atividade no perfil
        const profileSection = document.querySelector('.profile-info') || document.querySelector('#profile') || document.body;
        
        const activityDiv = document.createElement('div');
        activityDiv.id = 'user-activity-display';
        activityDiv.className = 'user-activity-display';
        activityDiv.innerHTML = `
            <div class="activity-header">
                <span class="activity-icon">🔍</span>
                <span class="activity-title">Atividade Atual</span>
                <button class="activity-toggle" title="Ativar/Desativar Monitoramento">👁️</button>
            </div>
            <div class="activity-content">
                <div class="current-activity">
                    <div class="activity-status">Monitorando...</div>
                    <div class="activity-details"></div>
                </div>
                <div class="activity-history">
                    <h4>Atividades Recentes:</h4>
                    <div class="activity-list"></div>
                </div>
            </div>
        `;

        profileSection.appendChild(activityDiv);
        this.activityDisplay = activityDiv;

        this.updateActivityDisplay('Aguardando atividade...', null);
    }

    setupEventListeners() {
        const toggleBtn = this.activityDisplay.querySelector('.activity-toggle');
        toggleBtn.addEventListener('click', () => {
            this.toggleMonitoring();
        });

        // Escutar mudanças de foco na janela
        window.addEventListener('focus', () => {
            this.checkCurrentTab();
        });

        window.addEventListener('blur', () => {
            setTimeout(() => this.detectOtherTabActivity(), 1000);
        });
    }

    startMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        this.monitoringInterval = setInterval(() => {
            if (this.isActive) {
                this.detectOtherTabActivity();
            }
        }, this.detectionInterval);

        LogSystem.addLog('Monitoramento de abas iniciado', 'system');
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        LogSystem.addLog('Monitoramento de abas pausado', 'system');
    }

    toggleMonitoring() {
        this.isActive = !this.isActive;
        
        const toggleBtn = this.activityDisplay.querySelector('.activity-toggle');
        toggleBtn.textContent = this.isActive ? '👁️' : '🚫';
        toggleBtn.title = this.isActive ? 'Desativar Monitoramento' : 'Ativar Monitoramento';

        if (this.isActive) {
            this.startMonitoring();
            this.updateActivityDisplay('Monitoramento reativado', null);
        } else {
            this.stopMonitoring();
            this.updateActivityDisplay('Monitoramento pausado', null);
        }
    }

    async detectOtherTabActivity() {
        if (!this.isActive) return;

        try {
            // Verificar se há outras abas abertas
            const tabs = await this.getOpenTabs();
            
            for (const tab of tabs) {
                const activity = await this.analyzeTab(tab);
                if (activity) {
                    this.recordActivity(activity);
                    break;
                }
            }
        } catch (error) {
            // Fallback para detecção por URL da aba atual
            this.detectCurrentTabActivity();
        }
    }

    async getOpenTabs() {
        // Simular obtenção de abas abertas
        // Em um ambiente real, isso requer extensão do navegador
        return [
            {
                url: 'https://www.netflix.com/watch/80052809?trackId=14170286',
                title: 'The Witcher - Netflix',
                active: false
            },
            {
                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                title: 'Rick Roll - YouTube',
                active: false
            }
        ];
    }

    async analyzeTab(tab) {
        const url = new URL(tab.url);
        const domain = url.hostname.toLowerCase();

        // Encontrar detector compatível
        for (const [siteDomain, siteInfo] of Object.entries(this.supportedSites)) {
            if (domain.includes(siteDomain)) {
                return await siteInfo.detector(tab);
            }
        }

        return null;
    }

    detectCurrentTabActivity() {
        const currentUrl = window.location.href;
        const domain = window.location.hostname.toLowerCase();
        
        // Se estivermos em um site monitorado
        for (const [siteDomain, siteInfo] of Object.entries(this.supportedSites)) {
            if (domain.includes(siteDomain)) {
                const activity = siteInfo.detector({ url: currentUrl, title: document.title });
                if (activity) {
                    this.recordActivity(activity);
                }
                break;
            }
        }
    }

    async detectNetflix(tab) {
        const url = new URL(tab.url);
        
        if (url.pathname.includes('/watch/')) {
            // Extrair ID do conteúdo da URL
            const contentId = url.pathname.split('/watch/')[1].split('?')[0];
            
            try {
                // Simular obtenção de informações do conteúdo
                const contentInfo = await this.getNetflixContent(contentId);
                
                return {
                    site: 'Netflix',
                    icon: '🎬',
                    activity: 'Assistindo',
                    content: contentInfo.title || 'Conteúdo desconhecido',
                    details: {
                        type: contentInfo.type || 'video',
                        season: contentInfo.season,
                        episode: contentInfo.episode,
                        genre: contentInfo.genre
                    },
                    url: tab.url,
                    color: '#E50914'
                };
            } catch (error) {
                return {
                    site: 'Netflix',
                    icon: '🎬',
                    activity: 'Assistindo',
                    content: 'Conteúdo no Netflix',
                    url: tab.url,
                    color: '#E50914'
                };
            }
        }
        
        return null;
    }

    async detectYoutube(tab) {
        const url = new URL(tab.url);
        
        if (url.pathname.includes('/watch')) {
            const videoId = url.searchParams.get('v');
            
            try {
                const videoInfo = await this.getYoutubeVideo(videoId);
                
                return {
                    site: 'YouTube',
                    icon: '📺',
                    activity: 'Assistindo',
                    content: videoInfo.title || 'Vídeo do YouTube',
                    details: {
                        channel: videoInfo.channel,
                        duration: videoInfo.duration,
                        views: videoInfo.views
                    },
                    url: tab.url,
                    color: '#FF0000'
                };
            } catch (error) {
                return {
                    site: 'YouTube',
                    icon: '📺',
                    activity: 'Assistindo',
                    content: 'Vídeo do YouTube',
                    url: tab.url,
                    color: '#FF0000'
                };
            }
        }
        
        return null;
    }

    async detectSpotify(tab) {
        const url = new URL(tab.url);
        
        if (url.pathname.includes('/track/') || url.pathname.includes('/album/')) {
            try {
                const musicInfo = await this.getSpotifyTrack(tab.url);
                
                return {
                    site: 'Spotify',
                    icon: '🎵',
                    activity: 'Ouvindo',
                    content: `${musicInfo.track} - ${musicInfo.artist}`,
                    details: {
                        album: musicInfo.album,
                        duration: musicInfo.duration
                    },
                    url: tab.url,
                    color: '#1DB954'
                };
            } catch (error) {
                return {
                    site: 'Spotify',
                    icon: '🎵',
                    activity: 'Ouvindo música',
                    content: 'Spotify',
                    url: tab.url,
                    color: '#1DB954'
                };
            }
        }
        
        return null;
    }

    async detectPrimeVideo(tab) {
        const url = new URL(tab.url);
        
        if (url.pathname.includes('/detail/') || url.pathname.includes('/watch/')) {
            return {
                site: 'Prime Video',
                icon: '🎥',
                activity: 'Assistindo',
                content: 'Conteúdo no Prime Video',
                url: tab.url,
                color: '#00A8E1'
            };
        }
        
        return null;
    }

    async detectDisneyPlus(tab) {
        const url = new URL(tab.url);
        
        if (url.pathname.includes('/movies/') || url.pathname.includes('/series/')) {
            return {
                site: 'Disney+',
                icon: '🏰',
                activity: 'Assistindo',
                content: 'Conteúdo no Disney+',
                url: tab.url,
                color: '#113CCF'
            };
        }
        
        return null;
    }

    // Métodos auxiliares para buscar informações
    async getNetflixContent(contentId) {
        // Simulação - em produção seria uma API real
        const mockContent = {
            '80052809': {
                title: 'The Witcher',
                type: 'series',
                season: 'Temporada 1',
                episode: 'Episódio 1',
                genre: 'Fantasia'
            },
            '80100172': {
                title: 'Stranger Things',
                type: 'series',
                season: 'Temporada 4',
                episode: 'Episódio 9',
                genre: 'Ficção Científica'
            }
        };
        
        return mockContent[contentId] || { title: 'Conteúdo Netflix' };
    }

    async getYoutubeVideo(videoId) {
        // Simulação - em produção usaria YouTube API
        return {
            title: 'Vídeo interessante',
            channel: 'Canal Legal',
            duration: '10:30',
            views: '1.2M'
        };
    }

    async getSpotifyTrack(url) {
        // Simulação - em produção usaria Spotify API
        return {
            track: 'Música Legal',
            artist: 'Artista Famoso',
            album: 'Álbum Incrível',
            duration: '3:45'
        };
    }

    recordActivity(activity) {
        // Verificar se é uma nova atividade
        if (this.currentActivity && 
            this.currentActivity.site === activity.site && 
            this.currentActivity.content === activity.content) {
            return; // Mesma atividade, não duplicar
        }

        this.currentActivity = {
            ...activity,
            timestamp: new Date(),
            id: Date.now() + Math.random()
        };

        // Adicionar ao histórico
        this.activities.unshift(this.currentActivity);
        
        // Limitar histórico
        if (this.activities.length > 20) {
            this.activities = this.activities.slice(0, 20);
        }

        // Atualizar display
        this.updateActivityDisplay(activity.activity, activity);

        // Log da atividade
        LogSystem.addLog(`${activity.activity} ${activity.content} no ${activity.site}`, 'user', activity);

        // Tentar atualizar perfil no servidor
        if (window.aiStatusButton) {
            window.aiStatusButton.processUpdate('Atualizar atividade do perfil', {
                activity: `${activity.activity} ${activity.content}`,
                site: activity.site,
                timestamp: this.currentActivity.timestamp
            });
        }
    }

    updateActivityDisplay(status, activity) {
        const statusElement = this.activityDisplay.querySelector('.activity-status');
        const detailsElement = this.activityDisplay.querySelector('.activity-details');
        const listElement = this.activityDisplay.querySelector('.activity-list');

        statusElement.textContent = status;

        if (activity) {
            detailsElement.innerHTML = `
                <div class="current-activity-item">
                    <span class="activity-icon" style="color: ${activity.color}">${activity.icon}</span>
                    <div class="activity-info">
                        <div class="activity-title">${activity.content}</div>
                        <div class="activity-site">no ${activity.site}</div>
                        ${activity.details ? `<div class="activity-extra">${Object.values(activity.details).join(' • ')}</div>` : ''}
                    </div>
                </div>
            `;
        } else {
            detailsElement.innerHTML = '';
        }

        // Atualizar lista de atividades
        listElement.innerHTML = this.activities.slice(0, 5).map(act => `
            <div class="history-item">
                <span class="history-icon" style="color: ${act.color}">${act.icon}</span>
                <div class="history-info">
                    <div class="history-content">${act.content}</div>
                    <div class="history-time">${this.formatTime(act.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    checkCurrentTab() {
        // Verificar se voltou para a aba do Orkut
        if (document.hasFocus()) {
            LogSystem.addLog('Retornou ao Orkut', 'user');
        }
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return 'agora mesmo';
        if (minutes < 60) return `${minutes} min atrás`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h atrás`;
        
        return date.toLocaleDateString('pt-BR');
    }

    // Métodos públicos para integração
    static getCurrentActivity() {
        return window.tabMonitor?.currentActivity || null;
    }

    static getActivityHistory() {
        return window.tabMonitor?.activities || [];
    }

    static addCustomActivity(activity) {
        if (window.tabMonitor) {
            window.tabMonitor.recordActivity(activity);
        }
    }
}

// Instanciar o sistema quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.tabMonitor = new TabMonitor();
});
