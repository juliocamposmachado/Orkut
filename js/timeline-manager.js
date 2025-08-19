/**
 * 📱 Timeline Manager - Sistema de Postagens Automáticas
 * Gerencia notificações e postagens automáticas na timeline do usuário
 */

class TimelineManager {
    constructor() {
        this.timelinePosts = [];
        this.notificationQueue = [];
        this.autoPostInterval = 30 * 60 * 1000; // 30 minutos
        
        this.initialize();
    }

    initialize() {
        console.log('📱 Timeline Manager iniciado');
        
        // Carregar posts existentes
        this.loadExistingPosts();
        
        // Iniciar sistema de posts automáticos
        this.startAutoPosting();
        
        // Registrar eventos
        this.registerTimelineEvents();
    }

    // 📝 Postar na timeline do usuário
    postToTimeline(postData) {
        const post = {
            id: this.generatePostId(),
            type: postData.type || 'bot_notification',
            title: postData.title,
            message: postData.message,
            action: postData.action || null,
            priority: postData.priority || 'medium',
            timestamp: new Date().toISOString(),
            read: false,
            source: 'social_network_bot',
            userId: this.getCurrentUserId()
        };

        // Adicionar à timeline
        this.timelinePosts.unshift(post);
        
        // Salvar no localStorage
        this.saveTimelinePosts();
        
        // Exibir na interface se estiver na página certa
        this.displayPostInTimeline(post);
        
        console.log('📱 Post adicionado à timeline:', post.title);
        
        return post;
    }

    // 🤖 Posts automáticos do bot
    createBotPost(type, data) {
        let post = {};
        
        switch (type) {
            case 'profile_incomplete':
                post = {
                    type: 'profile_reminder',
                    title: '📋 Complete seu perfil!',
                    message: `Seu perfil está ${data.percentage}% completo. Perfis completos recebem 3x mais visitas! Complete agora e se destaque na comunidade.`,
                    action: {
                        type: 'edit_profile',
                        text: 'Completar Perfil',
                        url: 'profile.html'
                    },
                    priority: 'high',
                    tags: ['perfil', 'configuração']
                };
                break;
                
            case 'add_friends':
                post = {
                    type: 'social_reminder',
                    title: '👥 Que tal adicionar mais amigos?',
                    message: `Você tem apenas ${data.friendsCount} amigos. Pessoas com mais amigos têm uma experiência mais rica no Orkut! Busque por antigos colegas e conhecidos.`,
                    action: {
                        type: 'search_friends',
                        text: 'Buscar Amigos',
                        url: 'search.html'
                    },
                    priority: 'medium',
                    tags: ['amigos', 'social']
                };
                break;
                
            case 'join_communities':
                post = {
                    type: 'community_reminder',
                    title: '🏠 Explore comunidades!',
                    message: 'Participe de comunidades para encontrar pessoas com interesses similares aos seus. É uma ótima forma de fazer novos amigos!',
                    action: {
                        type: 'browse_communities',
                        text: 'Ver Comunidades',
                        url: 'communities.html'
                    },
                    priority: 'medium',
                    tags: ['comunidades', 'interesses']
                };
                break;
                
            case 'engagement_reminder':
                post = {
                    type: 'engagement',
                    title: '💬 Interaja com seus amigos!',
                    message: 'Que tal deixar um scrap ou depoimento para seus amigos? Isso fortalece suas conexões e mantém sua rede social ativa!',
                    action: {
                        type: 'view_friends',
                        text: 'Ver Amigos',
                        url: 'friends.html'
                    },
                    priority: 'low',
                    tags: ['interação', 'scraps']
                };
                break;
                
            case 'photo_reminder':
                post = {
                    type: 'media_reminder',
                    title: '📸 Adicione fotos ao seu perfil!',
                    message: 'Perfis com fotos são 5x mais visitados! Compartilhe momentos especiais e deixe seu perfil mais atrativo.',
                    action: {
                        type: 'upload_photo',
                        text: 'Adicionar Fotos',
                        url: 'profile.html#photos'
                    },
                    priority: 'medium',
                    tags: ['fotos', 'mídia']
                };
                break;
                
            case 'weekly_summary':
                post = {
                    type: 'analytics',
                    title: '📊 Seu resumo semanal',
                    message: `Esta semana: ${data.profileViews} visualizações, ${data.newFriends} novos amigos, ${data.scrapsReceived} scraps recebidos. Continue assim!`,
                    action: {
                        type: 'view_stats',
                        text: 'Ver Estatísticas',
                        url: 'profile.html'
                    },
                    priority: 'low',
                    tags: ['estatísticas', 'resumo']
                };
                break;
                
            case 'achievement':
                post = {
                    type: 'achievement',
                    title: `🏆 Conquista desbloqueada: ${data.achievement}`,
                    message: data.description,
                    action: {
                        type: 'view_achievements',
                        text: 'Ver Conquistas',
                        url: 'profile.html#achievements'
                    },
                    priority: 'high',
                    tags: ['conquista', 'gamificação']
                };
                break;
                
            default:
                post = {
                    type: 'general',
                    title: '🤖 Dica do Orkut Bot',
                    message: data.message || 'Continue explorando e aproveitando sua experiência no Orkut!',
                    action: null,
                    priority: 'low',
                    tags: ['geral']
                };
        }
        
        return this.postToTimeline(post);
    }

    // 🔄 Sistema de posts automáticos
    startAutoPosting() {
        // Executar verificação inicial após 5 minutos
        setTimeout(() => {
            this.checkAndCreateAutoPosts();
        }, 5 * 60 * 1000);
        
        // Executar a cada 30 minutos
        setInterval(() => {
            this.checkAndCreateAutoPosts();
        }, this.autoPostInterval);
        
        console.log('🔄 Sistema de posts automáticos iniciado');
    }

    // ✨ Verificar e criar posts automáticos
    async checkAndCreateAutoPosts() {
        try {
            console.log('🔍 Verificando necessidade de posts automáticos...');
            
            // Obter dados do usuário
            const userData = this.getUserData();
            const lastPosts = this.getRecentPosts(24); // Últimas 24 horas
            
            // Verificar se precisa postar sobre perfil
            if (this.shouldPostProfileReminder(userData, lastPosts)) {
                this.createBotPost('profile_incomplete', {
                    percentage: this.calculateProfileCompletion(userData)
                });
            }
            
            // Verificar se precisa postar sobre amigos
            if (this.shouldPostFriendsReminder(userData, lastPosts)) {
                this.createBotPost('add_friends', {
                    friendsCount: userData.friends.length
                });
            }
            
            // Verificar se precisa postar sobre comunidades
            if (this.shouldPostCommunitiesReminder(userData, lastPosts)) {
                this.createBotPost('join_communities', {});
            }
            
            // Verificar se precisa postar sobre interação
            if (this.shouldPostEngagementReminder(userData, lastPosts)) {
                this.createBotPost('engagement_reminder', {});
            }
            
            // Verificar conquistas
            const achievements = this.checkAchievements(userData);
            achievements.forEach(achievement => {
                this.createBotPost('achievement', achievement);
            });
            
            console.log('✅ Verificação de posts automáticos concluída');
            
        } catch (error) {
            console.error('❌ Erro ao verificar posts automáticos:', error);
        }
    }

    // 🎯 Lógicas de verificação para posts automáticos
    shouldPostProfileReminder(userData, recentPosts) {
        const profileCompletion = this.calculateProfileCompletion(userData);
        const hasRecentProfilePost = recentPosts.some(post => post.type === 'profile_reminder');
        
        return profileCompletion < 80 && !hasRecentProfilePost;
    }

    shouldPostFriendsReminder(userData, recentPosts) {
        const hasFewFriends = userData.friends.length < 5;
        const hasRecentFriendsPost = recentPosts.some(post => post.type === 'social_reminder');
        const daysSinceLastFriendsPost = this.getDaysSinceLastPost('social_reminder');
        
        return hasFewFriends && !hasRecentFriendsPost && daysSinceLastFriendsPost > 2;
    }

    shouldPostCommunitiesReminder(userData, recentPosts) {
        const hasNoCommunities = userData.communities.length === 0;
        const hasRecentCommunityPost = recentPosts.some(post => post.type === 'community_reminder');
        const daysSinceLastCommunityPost = this.getDaysSinceLastPost('community_reminder');
        
        return hasNoCommunities && !hasRecentCommunityPost && daysSinceLastCommunityPost > 3;
    }

    shouldPostEngagementReminder(userData, recentPosts) {
        const hasRecentEngagementPost = recentPosts.some(post => post.type === 'engagement');
        const daysSinceLastEngagementPost = this.getDaysSinceLastPost('engagement');
        const hasLowEngagement = this.checkLowEngagement(userData);
        
        return hasLowEngagement && !hasRecentEngagementPost && daysSinceLastEngagementPost > 5;
    }

    // 🏆 Sistema de conquistas
    checkAchievements(userData) {
        const achievements = [];
        const existingAchievements = JSON.parse(localStorage.getItem('userAchievements') || '[]');
        
        // Conquista: Primeiro amigo
        if (userData.friends.length >= 1 && !this.hasAchievement('first_friend', existingAchievements)) {
            achievements.push({
                achievement: 'Primeiro Amigo',
                description: 'Você fez seu primeiro amigo no Orkut! Continue expandindo sua rede social.',
                id: 'first_friend'
            });
        }
        
        // Conquista: 10 amigos
        if (userData.friends.length >= 10 && !this.hasAchievement('ten_friends', existingAchievements)) {
            achievements.push({
                achievement: 'Rede Social',
                description: 'Parabéns! Você já tem 10 amigos em sua rede. Sua popularidade está crescendo!',
                id: 'ten_friends'
            });
        }
        
        // Conquista: Perfil completo
        if (this.calculateProfileCompletion(userData) >= 100 && !this.hasAchievement('complete_profile', existingAchievements)) {
            achievements.push({
                achievement: 'Perfil Completo',
                description: 'Seu perfil está 100% completo! Isso aumentará significativamente sua visibilidade.',
                id: 'complete_profile'
            });
        }
        
        // Conquista: Primeira comunidade
        if (userData.communities.length >= 1 && !this.hasAchievement('first_community', existingAchievements)) {
            achievements.push({
                achievement: 'Membro da Comunidade',
                description: 'Você se juntou à sua primeira comunidade! Explore mais e encontre seus grupos favoritos.',
                id: 'first_community'
            });
        }
        
        // Salvar novas conquistas
        if (achievements.length > 0) {
            const updatedAchievements = [...existingAchievements, ...achievements];
            localStorage.setItem('userAchievements', JSON.stringify(updatedAchievements));
        }
        
        return achievements;
    }

    // 🖥️ Interface de timeline
    displayPostInTimeline(post) {
        // Verificar se estamos na página home
        const timelineContainer = document.getElementById('timeline-posts') || 
                                  document.getElementById('feed-container') ||
                                  document.querySelector('.timeline');
        
        if (!timelineContainer) return;
        
        const postElement = this.createPostElement(post);
        
        // Adicionar no início da timeline
        timelineContainer.insertBefore(postElement, timelineContainer.firstChild);
        
        // Animação de entrada
        postElement.style.opacity = '0';
        postElement.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            postElement.style.transition = 'all 0.3s ease';
            postElement.style.opacity = '1';
            postElement.style.transform = 'translateY(0)';
        }, 100);
    }

    createPostElement(post) {
        const postDiv = document.createElement('div');
        postDiv.className = 'timeline-post bot-post';
        postDiv.setAttribute('data-post-id', post.id);
        
        const priorityClass = `priority-${post.priority}`;
        const actionButton = post.action ? 
            `<button class="post-action-btn" onclick="timelineManager.handlePostAction('${post.action.type}', '${post.action.url}')">${post.action.text}</button>` : 
            '';
        
        postDiv.innerHTML = `
            <div class="post-header ${priorityClass}">
                <div class="post-source">
                    <img src="images/orkut-bot-avatar.png" alt="Orkut Bot" class="bot-avatar" onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"%23667eea\"/><text x=\"50\" y=\"60\" text-anchor=\"middle\" fill=\"white\" font-size=\"40\">🤖</text></svg>'">
                    <div class="post-info">
                        <strong>Orkut Bot</strong>
                        <span class="post-time">${this.formatTimeAgo(post.timestamp)}</span>
                    </div>
                </div>
                <button class="post-dismiss" onclick="timelineManager.dismissPost('${post.id}')" title="Dispensar">✕</button>
            </div>
            
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-message">${post.message}</p>
                ${actionButton}
                
                <div class="post-tags">
                    ${(post.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
            
            <div class="post-footer">
                <button class="post-like" onclick="timelineManager.likePost('${post.id}')">👍 Útil</button>
                <button class="post-share" onclick="timelineManager.sharePost('${post.id}')">📤 Compartilhar</button>
            </div>
        `;
        
        return postDiv;
    }

    // 🎬 Ações de posts
    handlePostAction(actionType, actionUrl) {
        switch (actionType) {
            case 'edit_profile':
                window.location.href = 'profile.html';
                break;
            case 'search_friends':
                window.location.href = 'search.html';
                break;
            case 'browse_communities':
                window.location.href = 'communities.html';
                break;
            case 'view_friends':
                window.location.href = 'friends.html';
                break;
            case 'upload_photo':
                window.location.href = actionUrl;
                break;
            default:
                if (actionUrl) {
                    window.location.href = actionUrl;
                }
        }
        
        // Registrar interação
        this.logPostInteraction(actionType, 'action_click');
    }

    dismissPost(postId) {
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (postElement) {
            postElement.style.transition = 'all 0.3s ease';
            postElement.style.opacity = '0';
            postElement.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                postElement.remove();
            }, 300);
        }
        
        // Marcar como dispensado
        this.markPostAsDismissed(postId);
        this.logPostInteraction(postId, 'dismiss');
    }

    likePost(postId) {
        const post = this.timelinePosts.find(p => p.id === postId);
        if (post) {
            post.liked = true;
            this.saveTimelinePosts();
            
            // Atualizar visual
            const likeBtn = document.querySelector(`[data-post-id="${postId}"] .post-like`);
            if (likeBtn) {
                likeBtn.innerHTML = '👍 Útil ✓';
                likeBtn.style.background = '#22c55e';
                likeBtn.disabled = true;
            }
            
            this.logPostInteraction(postId, 'like');
        }
    }

    sharePost(postId) {
        const post = this.timelinePosts.find(p => p.id === postId);
        if (post) {
            // Simular compartilhamento
            if (navigator.share) {
                navigator.share({
                    title: post.title,
                    text: post.message,
                    url: window.location.href
                });
            } else {
                // Copiar para clipboard
                navigator.clipboard.writeText(`${post.title}: ${post.message}`);
                alert('Post copiado para a área de transferência!');
            }
            
            this.logPostInteraction(postId, 'share');
        }
    }

    // 💾 Gerenciamento de dados
    saveTimelinePosts() {
        localStorage.setItem('timelinePosts', JSON.stringify(this.timelinePosts));
    }

    loadExistingPosts() {
        this.timelinePosts = JSON.parse(localStorage.getItem('timelinePosts') || '[]');
        console.log(`📱 Carregados ${this.timelinePosts.length} posts da timeline`);
    }

    getUserData() {
        return {
            profile: JSON.parse(localStorage.getItem('userProfile') || '{}'),
            friends: JSON.parse(localStorage.getItem('friendsList') || '[]'),
            communities: JSON.parse(localStorage.getItem('userCommunities') || '[]'),
            photos: JSON.parse(localStorage.getItem('userPhotos') || '[]'),
            interactions: JSON.parse(localStorage.getItem('recentInteractions') || '[]')
        };
    }

    // 📊 Utilitários e cálculos
    calculateProfileCompletion(userData) {
        const profile = userData.profile;
        const requiredFields = ['name', 'email', 'photo', 'bio', 'age', 'location', 'relationship', 'birthday'];
        
        const completedFields = requiredFields.filter(field => 
            profile[field] && profile[field].toString().trim() !== ''
        );
        
        return Math.round((completedFields.length / requiredFields.length) * 100);
    }

    getRecentPosts(hours = 24) {
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.timelinePosts.filter(post => 
            new Date(post.timestamp) > cutoffTime
        );
    }

    getDaysSinceLastPost(type) {
        const posts = this.timelinePosts.filter(post => post.type === type);
        if (posts.length === 0) return Infinity;
        
        const lastPost = posts[0]; // Posts são ordenados por data decrescente
        const daysSince = Math.floor((Date.now() - new Date(lastPost.timestamp)) / (24 * 60 * 60 * 1000));
        
        return daysSince;
    }

    checkLowEngagement(userData) {
        const recentInteractions = userData.interactions.filter(interaction => {
            const hoursSince = (Date.now() - new Date(interaction.timestamp)) / (60 * 60 * 1000);
            return hoursSince <= 48; // Últimas 48 horas
        });
        
        return recentInteractions.length < 5;
    }

    hasAchievement(achievementId, achievements) {
        return achievements.some(achievement => achievement.id === achievementId);
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const postTime = new Date(timestamp);
        const diffMs = now - postTime;
        const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
        const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
        
        if (diffDays > 0) {
            return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
        } else if (diffHours > 0) {
            return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
        } else {
            const diffMinutes = Math.floor(diffMs / (60 * 1000));
            return `${Math.max(diffMinutes, 1)} minuto${diffMinutes > 1 ? 's' : ''} atrás`;
        }
    }

    markPostAsDismissed(postId) {
        const post = this.timelinePosts.find(p => p.id === postId);
        if (post) {
            post.dismissed = true;
            post.dismissedAt = new Date().toISOString();
            this.saveTimelinePosts();
        }
    }

    logPostInteraction(postId, interactionType) {
        const interaction = {
            type: 'timeline_post_interaction',
            postId: postId,
            interactionType: interactionType,
            timestamp: new Date().toISOString()
        };
        
        // Adicionar ao log de interações
        const interactions = JSON.parse(localStorage.getItem('recentInteractions') || '[]');
        interactions.push(interaction);
        
        // Manter apenas últimas 100 interações
        if (interactions.length > 100) {
            interactions.splice(0, interactions.length - 100);
        }
        
        localStorage.setItem('recentInteractions', JSON.stringify(interactions));
    }

    registerTimelineEvents() {
        // Escutar mudanças na página para recarregar posts
        window.addEventListener('focus', () => {
            this.loadExistingPosts();
        });
        
        // Escutar atualizações do perfil
        window.addEventListener('profileUpdated', () => {
            setTimeout(() => {
                this.checkAndCreateAutoPosts();
            }, 2000);
        });
    }

    // Utilitários
    generatePostId() {
        return 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getCurrentUserId() {
        return localStorage.getItem('currentUserId') || 'user_' + Date.now();
    }

    // API pública para outros sistemas
    createCustomPost(title, message, type = 'custom', priority = 'medium') {
        return this.postToTimeline({
            title,
            message,
            type,
            priority
        });
    }

    getTimelineStats() {
        return {
            totalPosts: this.timelinePosts.length,
            recentPosts: this.getRecentPosts(24).length,
            dismissedPosts: this.timelinePosts.filter(p => p.dismissed).length,
            likedPosts: this.timelinePosts.filter(p => p.liked).length
        };
    }
}

// Adicionar estilos CSS para os posts
const timelineStyles = document.createElement('style');
timelineStyles.id = 'timeline-manager-styles';
timelineStyles.textContent = `
    .timeline-post.bot-post {
        background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
        border: 1px solid #e0e7ff;
        border-left: 4px solid #667eea;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
        position: relative;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
    }
    
    .timeline-post.bot-post:hover {
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
        transform: translateY(-2px);
    }
    
    .post-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
    }
    
    .post-source {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .bot-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid #667eea;
    }
    
    .post-info strong {
        color: #667eea;
        font-size: 14px;
        font-weight: 600;
    }
    
    .post-time {
        color: #6b7280;
        font-size: 12px;
        display: block;
    }
    
    .post-dismiss {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        font-size: 16px;
        padding: 4px;
        border-radius: 50%;
        transition: all 0.2s;
    }
    
    .post-dismiss:hover {
        background: #fee2e2;
        color: #dc2626;
    }
    
    .post-title {
        color: #1f2937;
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 8px 0;
    }
    
    .post-message {
        color: #4b5563;
        font-size: 14px;
        line-height: 1.5;
        margin: 0 0 12px 0;
    }
    
    .post-action-btn {
        background: #667eea;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
        margin-bottom: 12px;
    }
    
    .post-action-btn:hover {
        background: #5a67d8;
    }
    
    .post-tags {
        margin-bottom: 12px;
    }
    
    .tag {
        background: #e0e7ff;
        color: #5b21b6;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        margin-right: 6px;
    }
    
    .post-footer {
        display: flex;
        gap: 12px;
        border-top: 1px solid #e5e7eb;
        padding-top: 12px;
    }
    
    .post-like, .post-share {
        background: none;
        border: none;
        color: #6b7280;
        font-size: 12px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s;
    }
    
    .post-like:hover, .post-share:hover {
        background: #f3f4f6;
        color: #374151;
    }
    
    .priority-high {
        background: linear-gradient(135deg, #fef3c7 0%, #fde047 100%);
        border-left-color: #f59e0b;
    }
    
    .priority-medium {
        background: linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%);
        border-left-color: #3b82f6;
    }
    
    .priority-low {
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        border-left-color: #22c55e;
    }
`;

document.head.appendChild(timelineStyles);

// Inicializar automaticamente
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.timelineManager = new TimelineManager();
        console.log('📱 Timeline Manager está funcionando!');
    }, 3000);
});

window.TimelineManager = TimelineManager;
