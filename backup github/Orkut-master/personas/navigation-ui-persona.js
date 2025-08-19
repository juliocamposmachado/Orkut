/**
 * Navigation UI Persona - Orkut 2025
 * Gerencia a navegação, renderização de páginas e componentes da UI
 */

class NavigationUIPersona {
    constructor() {
        this.currentPage = 'home';
        this.currentUser = null;
        this.viewingUser = null;
        this.components = new Map();
        this.pageHistory = [];
        this.renderQueue = [];
        
        this.initializePersona();
    }

    initializePersona() {
        console.log('🎨 Navigation UI Persona ativa - Gerenciando interface e navegação');
        this.setupEventListeners();
        this.loadInitialPage();
    }

    setupEventListeners() {
        // Navegação entre páginas
        document.addEventListener('click', (e) => {
            if (e.target.dataset.navigate) {
                this.navigateTo(e.target.dataset.navigate, e.target.dataset.params);
            }
        });

        // Formulários de interação
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('orkut-form')) {
                e.preventDefault();
                this.handleFormSubmission(e.target);
            }
        });

        // Upload de imagens
        document.addEventListener('change', (e) => {
            if (e.target.type === 'file' && e.target.accept.includes('image')) {
                this.handleImageUpload(e.target);
            }
        });
    }

    // NAVEGAÇÃO
    navigateTo(page, params = {}) {
        this.pageHistory.push({
            page: this.currentPage,
            params: this.currentParams,
            timestamp: Date.now()
        });

        this.currentPage = page;
        this.currentParams = params;
        
        console.log(`🧭 Navegando para: ${page}`, params);
        this.renderPage(page, params);
    }

    goBack() {
        if (this.pageHistory.length > 0) {
            const previous = this.pageHistory.pop();
            this.currentPage = previous.page;
            this.currentParams = previous.params;
            this.renderPage(previous.page, previous.params);
        }
    }

    // RENDERIZAÇÃO DE PÁGINAS
    renderPage(page, params = {}) {
        const container = document.getElementById('main-content');
        if (!container) {
            console.error('Container main-content não encontrado');
            return;
        }

        // Registra visita se estiver vendo perfil de outro usuário
        if (page === 'profile' && params.userId && params.userId !== this.currentUser?.id) {
            this.recordProfileVisit(params.userId);
        }

        switch (page) {
            case 'home':
                this.renderHomePage(container);
                break;
            case 'profile':
                this.renderProfilePage(container, params.userId);
                break;
            case 'edit-profile':
                this.renderEditProfilePage(container);
                break;
            case 'scraps':
                this.renderScrapsPage(container, params.userId);
                break;
            case 'photos':
                this.renderPhotosPage(container, params.userId);
                break;
            case 'testimonials':
                this.renderTestimonialsPage(container, params.userId);
                break;
            case 'friends':
                this.renderFriendsPage(container, params.userId);
                break;
            case 'crush-alerts':
                this.renderCrushAlertsPage(container);
                break;
            default:
                this.renderNotFoundPage(container);
        }

        // Atualiza URL sem recarregar página
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        if (params.userId) url.searchParams.set('userId', params.userId);
        window.history.pushState({}, '', url);
    }

    renderHomePage(container) {
        container.innerHTML = `
            <div class="home-page">
                <div class="orkut-header">
                    <h1>🌟 Orkut 2025 - Bem-vindo de volta!</h1>
                    <div class="user-info">
                        <img src="${this.currentUser?.avatar || '/assets/default-avatar.png'}" alt="Avatar" class="avatar">
                        <span>Olá, ${this.currentUser?.name || 'Usuário'}!</span>
                    </div>
                </div>
                
                <div class="main-navigation">
                    <button class="nav-btn" data-navigate="profile" data-params='{"userId": "${this.currentUser?.id}"}'>
                        👤 Meu Perfil
                    </button>
                    <button class="nav-btn" data-navigate="scraps">
                        💌 Meus Scraps
                    </button>
                    <button class="nav-btn" data-navigate="photos">
                        📸 Minhas Fotos
                    </button>
                    <button class="nav-btn" data-navigate="friends">
                        👥 Meus Amigos
                    </button>
                    <button class="nav-btn crush-alert" data-navigate="crush-alerts">
                        💕 Alertas de Crush
                    </button>
                </div>

                <div class="recent-activity">
                    <h3>💫 Atividade Recente</h3>
                    <div id="activity-feed">
                        ${this.renderActivityFeed()}
                    </div>
                </div>
            </div>
        `;
    }

    renderProfilePage(container, userId) {
        const user = userId ? this.getUserData(userId) : this.currentUser;
        const isOwnProfile = !userId || userId === this.currentUser?.id;
        
        container.innerHTML = `
            <div class="profile-page">
                <div class="profile-header">
                    <img src="${user?.avatar || '/assets/default-avatar.png'}" alt="Avatar" class="profile-avatar">
                    <div class="profile-info">
                        <h2>${user?.name || 'Usuário'}</h2>
                        <p class="bio">${user?.bio || 'Nenhuma bio definida'}</p>
                        <div class="profile-stats">
                            <span>👥 ${user?.friends?.length || 0} amigos</span>
                            <span>📸 ${user?.photos?.length || 0} fotos</span>
                            <span>💌 ${this.getScrapCount(user?.id)} scraps</span>
                        </div>
                    </div>
                    <div class="profile-actions">
                        ${isOwnProfile ? 
                            '<button class="btn-primary" data-navigate="edit-profile">✏️ Editar Perfil</button>' :
                            `<button class="btn-secondary" onclick="this.sendScrap('${user?.id}')">💌 Enviar Scrap</button>
                             <button class="btn-secondary" onclick="this.writeTestimonial('${user?.id}')">✍️ Depoimento</button>`
                        }
                    </div>
                </div>

                <div class="profile-content">
                    <div class="profile-section">
                        <h3>📸 Fotos Recentes</h3>
                        <div class="photos-grid">
                            ${this.renderPhotosGrid(user?.id, 6)}
                        </div>
                        <button class="view-all" data-navigate="photos" data-params='{"userId": "${user?.id}"}'>
                            Ver todas as fotos
                        </button>
                    </div>

                    <div class="profile-section">
                        <h3>💌 Scraps Recentes</h3>
                        <div class="scraps-list">
                            ${this.renderRecentScraps(user?.id, 5)}
                        </div>
                        <button class="view-all" data-navigate="scraps" data-params='{"userId": "${user?.id}"}'>
                            Ver todos os scraps
                        </button>
                    </div>

                    <div class="profile-section">
                        <h3>✍️ Depoimentos</h3>
                        <div class="testimonials-list">
                            ${this.renderRecentTestimonials(user?.id, 3)}
                        </div>
                        <button class="view-all" data-navigate="testimonials" data-params='{"userId": "${user?.id}"}'>
                            Ver todos os depoimentos
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderEditProfilePage(container) {
        const user = this.currentUser;
        
        container.innerHTML = `
            <div class="edit-profile-page">
                <h2>✏️ Editar Perfil</h2>
                
                <form class="orkut-form edit-profile-form" data-action="update-profile">
                    <div class="form-group">
                        <label for="name">Nome:</label>
                        <input type="text" id="name" name="name" value="${user?.name || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="bio">Bio:</label>
                        <textarea id="bio" name="bio" rows="4">${user?.bio || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="avatar">Foto de Perfil:</label>
                        <input type="file" id="avatar" name="avatar" accept="image/*">
                        <img src="${user?.avatar || '/assets/default-avatar.png'}" alt="Preview" class="avatar-preview">
                    </div>
                    
                    <div class="form-group">
                        <label for="location">Localização:</label>
                        <input type="text" id="location" name="location" value="${user?.location || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="interests">Interesses:</label>
                        <input type="text" id="interests" name="interests" value="${user?.interests?.join(', ') || ''}" 
                               placeholder="Separe por vírgulas">
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">💾 Salvar Alterações</button>
                        <button type="button" class="btn-secondary" onclick="history.back()">❌ Cancelar</button>
                    </div>
                </form>
            </div>
        `;
    }

    renderScrapsPage(container, userId) {
        const user = userId ? this.getUserData(userId) : this.currentUser;
        const scraps = localStorageManager.getScrapsByUser(user?.id);
        
        container.innerHTML = `
            <div class="scraps-page">
                <div class="page-header">
                    <h2>💌 Scraps de ${user?.name}</h2>
                    ${userId !== this.currentUser?.id ? 
                        `<button class="btn-primary" onclick="this.showScrapForm('${userId}')">✍️ Escrever Scrap</button>` :
                        ''
                    }
                </div>
                
                <div class="scraps-container">
                    ${scraps.length > 0 ? 
                        scraps.map(scrap => this.renderScrapItem(scrap)).join('') :
                        '<p class="no-content">Nenhum scrap ainda 😢</p>'
                    }
                </div>
                
                <div id="scrap-form-container" style="display: none;">
                    <form class="orkut-form scrap-form" data-action="send-scrap">
                        <input type="hidden" name="toUserId" value="${userId}">
                        <div class="form-group">
                            <textarea name="message" placeholder="Escreva seu scrap aqui..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" name="isPrivate"> Scrap privado
                            </label>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">📤 Enviar Scrap</button>
                            <button type="button" class="btn-secondary" onclick="this.hideScrapForm()">❌ Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    renderPhotosPage(container, userId) {
        const user = userId ? this.getUserData(userId) : this.currentUser;
        const photos = localStorageManager.getPhotosByUser(user?.id);
        
        container.innerHTML = `
            <div class="photos-page">
                <div class="page-header">
                    <h2>📸 Fotos de ${user?.name}</h2>
                    ${userId === this.currentUser?.id ? 
                        '<button class="btn-primary" onclick="this.showPhotoUpload()">📤 Adicionar Foto</button>' :
                        ''
                    }
                </div>
                
                <div class="photos-grid">
                    ${photos.length > 0 ? 
                        photos.map(photo => this.renderPhotoItem(photo)).join('') :
                        '<p class="no-content">Nenhuma foto ainda 📷</p>'
                    }
                </div>
                
                <div id="photo-upload-container" style="display: none;">
                    <form class="orkut-form photo-upload-form" data-action="upload-photo">
                        <div class="form-group">
                            <input type="file" name="photo" accept="image/*" required>
                        </div>
                        <div class="form-group">
                            <input type="text" name="caption" placeholder="Legenda da foto...">
                        </div>
                        <div class="form-group">
                            <select name="album">
                                <option value="default">Álbum Padrão</option>
                                <option value="profile">Fotos do Perfil</option>
                                <option value="memories">Memórias</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">📤 Enviar Foto</button>
                            <button type="button" class="btn-secondary" onclick="this.hidePhotoUpload()">❌ Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    renderCrushAlertsPage(container) {
        const crushData = localStorageManager.getCrushDataForUser(this.currentUser?.id);
        const visits = localStorageManager.getVisitsForUser(this.currentUser?.id);
        
        container.innerHTML = `
            <div class="crush-alerts-page">
                <div class="page-header">
                    <h2>💕 Alertas de Crush</h2>
                    <p class="subtitle">Descubra quem está interessado em você!</p>
                </div>
                
                <div class="crush-sections">
                    <div class="crush-section">
                        <h3>👀 Quem visitou seu perfil</h3>
                        <div class="visitors-list">
                            ${visits.length > 0 ? 
                                visits.slice(0, 10).map(visit => this.renderVisitorItem(visit)).join('') :
                                '<p class="no-content">Ninguém visitou seu perfil ainda 😔</p>'
                            }
                        </div>
                    </div>
                    
                    <div class="crush-section">
                        <h3>💘 Possíveis Crushes</h3>
                        <div class="crush-suggestions">
                            ${crushData?.suggestions ? 
                                crushData.suggestions.map(crush => this.renderCrushSuggestion(crush)).join('') :
                                '<p class="no-content">A IA está analisando... 🤖</p>'
                            }
                        </div>
                    </div>
                    
                    <div class="crush-section">
                        <h3>🔥 Interações Quentes</h3>
                        <div class="hot-interactions">
                            ${this.renderHotInteractions()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // COMPONENTES DE RENDERIZAÇÃO
    renderActivityFeed() {
        const interactions = localStorageManager.getInteractions().slice(-10).reverse();
        return interactions.map(interaction => `
            <div class="activity-item">
                <span class="activity-icon">${this.getActivityIcon(interaction.type)}</span>
                <span class="activity-text">${this.getActivityText(interaction)}</span>
                <span class="activity-time">${this.formatTimeAgo(interaction.timestamp)}</span>
            </div>
        `).join('');
    }

    renderPhotosGrid(userId, limit = 6) {
        const photos = localStorageManager.getPhotosByUser(userId).slice(-limit);
        return photos.map(photo => `
            <div class="photo-item" onclick="this.openPhotoModal('${photo.id}')">
                <img src="${photo.photoData}" alt="${photo.caption}">
                <div class="photo-overlay">
                    <span class="likes">❤️ ${photo.likes.length}</span>
                </div>
            </div>
        `).join('');
    }

    renderScrapItem(scrap) {
        const fromUser = this.getUserData(scrap.fromUserId);
        return `
            <div class="scrap-item ${scrap.isPrivate ? 'private' : ''}">
                <div class="scrap-header">
                    <img src="${fromUser?.avatar || '/assets/default-avatar.png'}" alt="Avatar" class="scrap-avatar">
                    <div class="scrap-info">
                        <strong>${fromUser?.name || 'Usuário'}</strong>
                        <span class="scrap-date">${this.formatDate(scrap.timestamp)}</span>
                        ${scrap.isPrivate ? '<span class="private-label">🔒 Privado</span>' : ''}
                    </div>
                </div>
                <div class="scrap-content">${scrap.message}</div>
            </div>
        `;
    }

    // MANIPULAÇÃO DE EVENTOS
    handleFormSubmission(form) {
        const formData = new FormData(form);
        const action = form.dataset.action;
        
        switch (action) {
            case 'update-profile':
                this.updateProfile(formData);
                break;
            case 'send-scrap':
                this.sendScrap(formData);
                break;
            case 'upload-photo':
                this.uploadPhoto(formData);
                break;
            case 'write-testimonial':
                this.writeTestimonial(formData);
                break;
        }
    }

    handleImageUpload(input) {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = input.parentElement.querySelector('.avatar-preview, .photo-preview');
                if (preview) {
                    preview.src = e.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
    }

    // AÇÕES DO USUÁRIO
    updateProfile(formData) {
        const profileData = {
            name: formData.get('name'),
            bio: formData.get('bio'),
            location: formData.get('location'),
            interests: formData.get('interests').split(',').map(i => i.trim()).filter(i => i)
        };

        // Se há avatar novo, converter para base64
        if (formData.get('avatar').size > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profileData.avatar = e.target.result;
                localStorageManager.updateUserProfile(profileData);
                this.showNotification('✅ Perfil atualizado com sucesso!');
                this.navigateTo('profile');
            };
            reader.readAsDataURL(formData.get('avatar'));
        } else {
            localStorageManager.updateUserProfile(profileData);
            this.showNotification('✅ Perfil atualizado com sucesso!');
            this.navigateTo('profile');
        }
    }

    recordProfileVisit(userId) {
        if (this.currentUser?.id && userId !== this.currentUser.id) {
            localStorageManager.recordProfileVisit(this.currentUser.id, userId);
            localStorageManager.recordInteraction(this.currentUser.id, userId, 'profile_visit');
        }
    }

    // UTILITÁRIOS
    loadInitialPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page') || 'home';
        const userId = urlParams.get('userId');
        
        this.renderPage(page, { userId });
    }

    getUserData(userId) {
        // Por enquanto retorna dados mockados, depois será integrado com o backend
        if (userId === this.currentUser?.id) {
            return this.currentUser;
        }
        
        return {
            id: userId,
            name: `Usuário ${userId.slice(0, 8)}`,
            bio: 'Bio do usuário',
            avatar: '/assets/default-avatar.png',
            friends: [],
            photos: []
        };
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'agora';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
        return `${Math.floor(diffMins / 1440)}d`;
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleString('pt-BR');
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getActivityIcon(type) {
        const icons = {
            'like': '❤️',
            'comment': '💬',
            'visit': '👀',
            'scrap': '💌',
            'photo': '📸',
            'testimonial': '✍️'
        };
        return icons[type] || '📱';
    }

    getActivityText(interaction) {
        const user = this.getUserData(interaction.fromUserId);
        const actions = {
            'like': `${user?.name} curtiu sua foto`,
            'comment': `${user?.name} comentou em sua foto`,
            'visit': `${user?.name} visitou seu perfil`,
            'scrap': `${user?.name} enviou um scrap`,
            'photo': `Você adicionou uma nova foto`,
            'testimonial': `${user?.name} escreveu um depoimento`
        };
        return actions[interaction.type] || 'Nova interação';
    }
}

// Inicialização
window.navigationUI = new NavigationUIPersona();

export default NavigationUIPersona;
