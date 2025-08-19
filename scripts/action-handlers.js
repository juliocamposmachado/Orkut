/**
 * Action Handlers - Orkut 2025
 * Scripts para todas as ações principais do usuário
 * Scraps, depoimentos, fotos, e outras interações
 */

class ActionHandlers {
    constructor() {
        this.currentUser = null;
        this.uploadProgress = new Map();
        this.pendingActions = [];
        
        this.initializeHandlers();
    }

    initializeHandlers() {
        console.log('⚡ Action Handlers ativo - Gerenciando ações do usuário');
        this.setupEventListeners();
        this.loadCurrentUser();
    }

    setupEventListeners() {
        // Formulários de ação
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('action-form')) {
                e.preventDefault();
                this.handleFormAction(e.target);
            }
        });

        // Cliques em botões de ação
        document.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action) {
                e.preventDefault();
                this.handleButtonAction(action, e.target);
            }
        });

        // Upload de arquivos
        document.addEventListener('change', (e) => {
            if (e.target.type === 'file' && e.target.dataset.actionType) {
                this.handleFileUpload(e.target);
            }
        });

        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                this.handleKeyboardShortcuts(e);
            }
        });
    }

    loadCurrentUser() {
        this.currentUser = localStorageManager.getUserProfile();
    }

    // MANIPULAÇÃO DE FORMULÁRIOS
    async handleFormAction(form) {
        const action = form.dataset.actionType;
        const formData = new FormData(form);
        
        console.log(`🎯 Processando ação: ${action}`);

        try {
            switch (action) {
                case 'send-scrap':
                    await this.sendScrap(formData);
                    break;
                case 'write-testimonial':
                    await this.writeTestimonial(formData);
                    break;
                case 'upload-photo':
                    await this.uploadPhoto(formData);
                    break;
                case 'update-profile':
                    await this.updateProfile(formData);
                    break;
                case 'add-friend':
                    await this.addFriend(formData);
                    break;
                case 'send-message':
                    await this.sendMessage(formData);
                    break;
                default:
                    console.warn(`Ação não reconhecida: ${action}`);
            }
            
            this.showSuccessMessage(`${action} realizada com sucesso!`);
            form.reset();
            
        } catch (error) {
            console.error(`Erro ao executar ${action}:`, error);
            this.showErrorMessage(`Erro ao ${action}: ${error.message}`);
        }
    }

    // MANIPULAÇÃO DE BOTÕES
    async handleButtonAction(action, button) {
        const targetId = button.dataset.targetId;
        const extraData = button.dataset.extraData ? JSON.parse(button.dataset.extraData) : {};
        
        console.log(`🎯 Ação de botão: ${action}`, { targetId, extraData });

        try {
            switch (action) {
                case 'like-photo':
                    await this.likePhoto(targetId);
                    break;
                case 'unlike-photo':
                    await this.unlikePhoto(targetId);
                    break;
                case 'delete-scrap':
                    await this.deleteScrap(targetId);
                    break;
                case 'reply-scrap':
                    await this.replyToScrap(targetId);
                    break;
                case 'block-user':
                    await this.blockUser(targetId);
                    break;
                case 'unblock-user':
                    await this.unblockUser(targetId);
                    break;
                case 'add-friend':
                    await this.addFriendById(targetId);
                    break;
                case 'remove-friend':
                    await this.removeFriend(targetId);
                    break;
                case 'view-profile':
                    await this.viewProfile(targetId);
                    break;
                case 'open-chat':
                    await this.openChat(targetId);
                    break;
                default:
                    console.warn(`Ação de botão não reconhecida: ${action}`);
            }
            
        } catch (error) {
            console.error(`Erro na ação ${action}:`, error);
            this.showErrorMessage(`Erro: ${error.message}`);
        }
    }

    // AÇÕES DE SCRAP
    async sendScrap(formData) {
        const toUserId = formData.get('toUserId');
        const message = formData.get('message');
        const isPrivate = formData.has('isPrivate');

        if (!toUserId || !message.trim()) {
            throw new Error('Destinatário e mensagem são obrigatórios');
        }

        const scrap = localStorageManager.addScrap(
            this.currentUser.id,
            toUserId,
            message.trim(),
            isPrivate
        );

        // Registra interação
        localStorageManager.recordInteraction(
            this.currentUser.id,
            toUserId,
            'scrap',
            { scrapId: scrap.id, message: message.slice(0, 50) + '...' }
        );

        // Dispara evento para análise
        document.dispatchEvent(new CustomEvent('interaction-occurred', {
            detail: {
                type: 'scrap',
                fromUserId: this.currentUser.id,
                toUserId: toUserId,
                timestamp: scrap.timestamp
            }
        }));

        console.log('💌 Scrap enviado:', scrap);
        return scrap;
    }

    async replyToScrap(scrapId) {
        const scraps = localStorageManager.getScraps();
        const originalScrap = scraps.find(s => s.id === scrapId);
        
        if (!originalScrap) {
            throw new Error('Scrap não encontrado');
        }

        // Abre modal de resposta
        this.showScrapReplyModal(originalScrap);
    }

    async deleteScrap(scrapId) {
        if (!confirm('Tem certeza que deseja excluir este scrap?')) {
            return;
        }

        const scraps = localStorageManager.getScraps();
        const scrapIndex = scraps.findIndex(s => s.id === scrapId);
        
        if (scrapIndex === -1) {
            throw new Error('Scrap não encontrado');
        }

        const scrap = scraps[scrapIndex];
        
        // Verifica se o usuário pode excluir
        if (scrap.fromUserId !== this.currentUser.id && scrap.toUserId !== this.currentUser.id) {
            throw new Error('Você não tem permissão para excluir este scrap');
        }

        scraps.splice(scrapIndex, 1);
        localStorage.setItem(localStorageManager.keys.SCRAPS, JSON.stringify(scraps));

        // Adiciona à fila de sincronização
        localStorageManager.addToPendingSync('scrap_delete', { scrapId });

        console.log('🗑️ Scrap excluído:', scrapId);
        this.refreshCurrentView();
    }

    // AÇÕES DE DEPOIMENTOS
    async writeTestimonial(formData) {
        const toUserId = formData.get('toUserId');
        const message = formData.get('message');
        const rating = parseInt(formData.get('rating') || '5');

        if (!toUserId || !message.trim()) {
            throw new Error('Destinatário e mensagem são obrigatórios');
        }

        if (toUserId === this.currentUser.id) {
            throw new Error('Você não pode escrever um depoimento para si mesmo');
        }

        const testimonial = localStorageManager.addTestimonial(
            this.currentUser.id,
            toUserId,
            message.trim(),
            rating
        );

        // Registra interação
        localStorageManager.recordInteraction(
            this.currentUser.id,
            toUserId,
            'testimonial',
            { testimonialId: testimonial.id, rating }
        );

        console.log('✍️ Depoimento escrito:', testimonial);
        return testimonial;
    }

    // AÇÕES DE FOTOS
    async uploadPhoto(formData) {
        const file = formData.get('photo');
        const caption = formData.get('caption') || '';
        const album = formData.get('album') || 'default';

        if (!file || file.size === 0) {
            throw new Error('Selecione uma foto para enviar');
        }

        // Validações
        this.validatePhotoFile(file);

        // Converte para base64
        const photoData = await this.fileToBase64(file);

        // Redimensiona se necessário
        const resizedPhoto = await this.resizePhoto(photoData, 800, 600);

        const photo = localStorageManager.addPhoto(
            this.currentUser.id,
            resizedPhoto,
            caption.trim(),
            album
        );

        // Registra interação
        localStorageManager.recordInteraction(
            this.currentUser.id,
            this.currentUser.id,
            'photo',
            { photoId: photo.id, album }
        );

        console.log('📸 Foto enviada:', photo);
        return photo;
    }

    validatePhotoFile(file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
            throw new Error('Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP');
        }

        if (file.size > maxSize) {
            throw new Error('Arquivo muito grande. Máximo: 5MB');
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    resizePhoto(base64, maxWidth, maxHeight) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Calcula dimensões mantendo aspecto
                let { width, height } = img;
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = base64;
        });
    }

    async likePhoto(photoId) {
        const photos = localStorageManager.getPhotos();
        const photo = photos.find(p => p.id === photoId);

        if (!photo) {
            throw new Error('Foto não encontrada');
        }

        // Verifica se já curtiu
        if (photo.likes.includes(this.currentUser.id)) {
            throw new Error('Você já curtiu esta foto');
        }

        localStorageManager.likePhoto(photoId, this.currentUser.id);

        // Registra interação
        localStorageManager.recordInteraction(
            this.currentUser.id,
            photo.userId,
            'like',
            { photoId }
        );

        // Atualiza botão
        this.updateLikeButton(photoId, true);

        // Dispara evento
        document.dispatchEvent(new CustomEvent('interaction-occurred', {
            detail: {
                type: 'like',
                fromUserId: this.currentUser.id,
                toUserId: photo.userId,
                photoId
            }
        }));

        console.log('❤️ Foto curtida:', photoId);
    }

    async unlikePhoto(photoId) {
        const photos = localStorageManager.getPhotos();
        const photo = photos.find(p => p.id === photoId);

        if (!photo) {
            throw new Error('Foto não encontrada');
        }

        const likeIndex = photo.likes.indexOf(this.currentUser.id);
        if (likeIndex === -1) {
            throw new Error('Você não curtiu esta foto');
        }

        photo.likes.splice(likeIndex, 1);
        localStorage.setItem(localStorageManager.keys.PHOTOS, JSON.stringify(photos));

        // Adiciona à sincronização
        localStorageManager.addToPendingSync('photo_unlike', { photoId, userId: this.currentUser.id });

        // Atualiza botão
        this.updateLikeButton(photoId, false);

        console.log('💔 Like removido:', photoId);
    }

    updateLikeButton(photoId, isLiked) {
        const buttons = document.querySelectorAll(`[data-action="${isLiked ? 'unlike-photo' : 'like-photo'}"][data-target-id="${photoId}"]`);
        buttons.forEach(button => {
            button.dataset.action = isLiked ? 'unlike-photo' : 'like-photo';
            button.innerHTML = isLiked ? '💔 Descurtir' : '❤️ Curtir';
            button.classList.toggle('liked', isLiked);
        });

        // Atualiza contador
        const counters = document.querySelectorAll(`.like-count[data-photo-id="${photoId}"]`);
        const photos = localStorageManager.getPhotos();
        const photo = photos.find(p => p.id === photoId);
        if (photo) {
            counters.forEach(counter => {
                counter.textContent = photo.likes.length;
            });
        }
    }

    // AÇÕES DE AMIZADE
    async addFriendById(userId) {
        if (userId === this.currentUser.id) {
            throw new Error('Você não pode adicionar a si mesmo como amigo');
        }

        const profile = localStorageManager.getUserProfile();
        
        // Verifica se já são amigos
        if (profile.friends.includes(userId)) {
            throw new Error('Vocês já são amigos');
        }

        profile.friends.push(userId);
        localStorageManager.updateUserProfile(profile);

        // Registra interação
        localStorageManager.recordInteraction(
            this.currentUser.id,
            userId,
            'friend_request',
            { status: 'sent' }
        );

        console.log('👥 Solicitação de amizade enviada para:', userId);
        this.showSuccessMessage('Solicitação de amizade enviada!');
    }

    async removeFriend(userId) {
        if (!confirm('Tem certeza que deseja remover esta pessoa da sua lista de amigos?')) {
            return;
        }

        const profile = localStorageManager.getUserProfile();
        const friendIndex = profile.friends.indexOf(userId);
        
        if (friendIndex === -1) {
            throw new Error('Esta pessoa não está na sua lista de amigos');
        }

        profile.friends.splice(friendIndex, 1);
        localStorageManager.updateUserProfile(profile);

        // Registra interação
        localStorageManager.recordInteraction(
            this.currentUser.id,
            userId,
            'friend_remove',
            { timestamp: new Date().toISOString() }
        );

        console.log('💔 Amigo removido:', userId);
        this.showSuccessMessage('Amigo removido da sua lista');
    }

    // AÇÕES DE BLOQUEIO
    async blockUser(userId) {
        if (!confirm('Tem certeza que deseja bloquear este usuário? Ele não poderá mais interagir com você.')) {
            return;
        }

        const profile = localStorageManager.getUserProfile();
        
        if (!profile.blockedUsers) {
            profile.blockedUsers = [];
        }

        if (profile.blockedUsers.includes(userId)) {
            throw new Error('Este usuário já está bloqueado');
        }

        profile.blockedUsers.push(userId);
        
        // Remove da lista de amigos se existir
        const friendIndex = profile.friends.indexOf(userId);
        if (friendIndex !== -1) {
            profile.friends.splice(friendIndex, 1);
        }

        localStorageManager.updateUserProfile(profile);

        // Registra ação
        localStorageManager.addToPendingSync('user_block', { 
            blockedUserId: userId,
            timestamp: new Date().toISOString()
        });

        console.log('🚫 Usuário bloqueado:', userId);
        this.showSuccessMessage('Usuário bloqueado com sucesso');
    }

    async unblockUser(userId) {
        const profile = localStorageManager.getUserProfile();
        
        if (!profile.blockedUsers || !profile.blockedUsers.includes(userId)) {
            throw new Error('Este usuário não está bloqueado');
        }

        const blockIndex = profile.blockedUsers.indexOf(userId);
        profile.blockedUsers.splice(blockIndex, 1);
        
        localStorageManager.updateUserProfile(profile);

        // Registra ação
        localStorageManager.addToPendingSync('user_unblock', { 
            unblockedUserId: userId,
            timestamp: new Date().toISOString()
        });

        console.log('✅ Usuário desbloqueado:', userId);
        this.showSuccessMessage('Usuário desbloqueado');
    }

    // AÇÕES DE PERFIL
    async viewProfile(userId) {
        // Registra visita
        localStorageManager.recordProfileVisit(this.currentUser.id, userId);

        // Dispara evento para Crush AI
        document.dispatchEvent(new CustomEvent('profile-visited', {
            detail: {
                visitorId: this.currentUser.id,
                visitedUserId: userId,
                timestamp: new Date().toISOString()
            }
        }));

        // Navega para o perfil
        if (window.navigationUI) {
            window.navigationUI.navigateTo('profile', { userId });
        }

        console.log('👤 Visualizando perfil:', userId);
    }

    async updateProfile(formData) {
        const profileData = {
            name: formData.get('name'),
            bio: formData.get('bio'),
            location: formData.get('location'),
            interests: formData.get('interests').split(',').map(i => i.trim()).filter(i => i),
            relationship: formData.get('relationship'),
            birthday: formData.get('birthday')
        };

        // Processa avatar se fornecido
        const avatarFile = formData.get('avatar');
        if (avatarFile && avatarFile.size > 0) {
            this.validatePhotoFile(avatarFile);
            profileData.avatar = await this.fileToBase64(avatarFile);
        }

        localStorageManager.updateUserProfile(profileData);
        this.currentUser = localStorageManager.getUserProfile();

        console.log('👤 Perfil atualizado:', profileData);
        this.refreshCurrentView();
    }

    // AÇÕES DE MENSAGEM/CHAT
    async sendMessage(formData) {
        const toUserId = formData.get('toUserId');
        const message = formData.get('message');

        if (!toUserId || !message.trim()) {
            throw new Error('Destinatário e mensagem são obrigatórios');
        }

        // Por enquanto, trata como scrap privado
        return await this.sendScrap(new FormData([
            ['toUserId', toUserId],
            ['message', message],
            ['isPrivate', 'true']
        ]));
    }

    async openChat(userId) {
        // Abre modal de chat ou navega para página de chat
        this.showChatModal(userId);
    }

    // UPLOAD DE ARQUIVOS
    async handleFileUpload(input) {
        const file = input.files[0];
        const actionType = input.dataset.actionType;
        
        if (!file) return;

        console.log(`📁 Processando upload: ${actionType}`, file.name);

        try {
            // Mostra progresso
            this.showUploadProgress(input.id, 0);

            switch (actionType) {
                case 'avatar':
                    await this.processAvatarUpload(file, input);
                    break;
                case 'photo':
                    await this.processPhotoUpload(file, input);
                    break;
                default:
                    throw new Error(`Tipo de upload não suportado: ${actionType}`);
            }

            this.showUploadProgress(input.id, 100);
            setTimeout(() => this.hideUploadProgress(input.id), 2000);

        } catch (error) {
            console.error('Erro no upload:', error);
            this.showErrorMessage(`Erro no upload: ${error.message}`);
            this.hideUploadProgress(input.id);
        }
    }

    async processAvatarUpload(file, input) {
        this.validatePhotoFile(file);
        const base64 = await this.fileToBase64(file);
        
        // Mostra preview
        const preview = input.parentElement.querySelector('.avatar-preview');
        if (preview) {
            preview.src = base64;
        }

        console.log('👤 Avatar carregado');
    }

    async processPhotoUpload(file, input) {
        this.validatePhotoFile(file);
        const base64 = await this.fileToBase64(file);
        const resized = await this.resizePhoto(base64, 800, 600);
        
        // Mostra preview
        const preview = input.parentElement.querySelector('.photo-preview');
        if (preview) {
            preview.src = resized;
        }

        console.log('📸 Foto carregada');
    }

    showUploadProgress(inputId, progress) {
        let progressBar = document.getElementById(`progress-${inputId}`);
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = `progress-${inputId}`;
            progressBar.className = 'upload-progress';
            progressBar.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">${progress}%</span>
            `;
            
            const input = document.getElementById(inputId);
            if (input) {
                input.parentElement.appendChild(progressBar);
            }
        } else {
            const fill = progressBar.querySelector('.progress-fill');
            const text = progressBar.querySelector('.progress-text');
            if (fill) fill.style.width = `${progress}%`;
            if (text) text.textContent = `${progress}%`;
        }
    }

    hideUploadProgress(inputId) {
        const progressBar = document.getElementById(`progress-${inputId}`);
        if (progressBar) {
            progressBar.remove();
        }
    }

    // ATALHOS DE TECLADO
    handleKeyboardShortcuts(e) {
        switch (e.key.toLowerCase()) {
            case 'n': // Ctrl+N - Novo scrap
                if (!e.shiftKey) {
                    e.preventDefault();
                    this.showNewScrapModal();
                }
                break;
            case 'u': // Ctrl+U - Upload foto
                e.preventDefault();
                this.triggerPhotoUpload();
                break;
            case 'h': // Ctrl+H - Home
                e.preventDefault();
                if (window.navigationUI) {
                    window.navigationUI.navigateTo('home');
                }
                break;
            case 'p': // Ctrl+P - Perfil
                e.preventDefault();
                if (window.navigationUI) {
                    window.navigationUI.navigateTo('profile');
                }
                break;
        }
    }

    // MODAIS E UI
    showScrapReplyModal(originalScrap) {
        const modal = this.createModal('reply-scrap', 'Responder Scrap', `
            <form class="action-form" data-action-type="send-scrap">
                <input type="hidden" name="toUserId" value="${originalScrap.fromUserId}">
                
                <div class="original-scrap">
                    <h4>Respondendo a:</h4>
                    <p>"${originalScrap.message}"</p>
                </div>
                
                <div class="form-group">
                    <textarea name="message" placeholder="Sua resposta..." required></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary">📤 Responder</button>
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">❌ Cancelar</button>
                </div>
            </form>
        `);
        
        document.body.appendChild(modal);
        modal.querySelector('textarea').focus();
    }

    showNewScrapModal() {
        const modal = this.createModal('new-scrap', 'Novo Scrap', `
            <form class="action-form" data-action-type="send-scrap">
                <div class="form-group">
                    <label for="scrap-to">Para:</label>
                    <input type="text" id="scrap-to" name="toUserId" placeholder="ID do usuário" required>
                </div>
                
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
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">❌ Cancelar</button>
                </div>
            </form>
        `);
        
        document.body.appendChild(modal);
        modal.querySelector('input').focus();
    }

    showChatModal(userId) {
        const modal = this.createModal('chat', `Chat com ${userId}`, `
            <div class="chat-container">
                <div class="chat-messages" id="chat-messages-${userId}">
                    <!-- Mensagens serão carregadas aqui -->
                </div>
                
                <form class="action-form chat-form" data-action-type="send-message">
                    <input type="hidden" name="toUserId" value="${userId}">
                    <div class="chat-input-group">
                        <input type="text" name="message" placeholder="Digite sua mensagem..." required>
                        <button type="submit">📤</button>
                    </div>
                </form>
            </div>
        `);
        
        document.body.appendChild(modal);
        this.loadChatMessages(userId);
        modal.querySelector('input[name="message"]').focus();
    }

    createModal(id, title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = `modal-${id}`;
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">❌</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        return modal;
    }

    triggerPhotoUpload() {
        let fileInput = document.getElementById('quick-photo-upload');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.id = 'quick-photo-upload';
            fileInput.style.display = 'none';
            fileInput.dataset.actionType = 'photo';
            document.body.appendChild(fileInput);
        }
        fileInput.click();
    }

    loadChatMessages(userId) {
        // Por enquanto, mostra scraps como mensagens
        const scraps = localStorageManager.getScrapsByUser(userId)
            .filter(s => s.isPrivate)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const container = document.getElementById(`chat-messages-${userId}`);
        if (container) {
            container.innerHTML = scraps.map(scrap => `
                <div class="chat-message ${scrap.fromUserId === this.currentUser.id ? 'sent' : 'received'}">
                    <div class="message-content">${scrap.message}</div>
                    <div class="message-time">${this.formatTime(scrap.timestamp)}</div>
                </div>
            `).join('');
            
            container.scrollTop = container.scrollHeight;
        }
    }

    // UTILITÁRIOS
    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    refreshCurrentView() {
        // Recarrega a página atual
        if (window.navigationUI) {
            window.navigationUI.renderPage(
                window.navigationUI.currentPage, 
                window.navigationUI.currentParams
            );
        }
    }

    // INTERFACE PÚBLICA
    isUserBlocked(userId) {
        const profile = localStorageManager.getUserProfile();
        return profile.blockedUsers && profile.blockedUsers.includes(userId);
    }

    isFriend(userId) {
        const profile = localStorageManager.getUserProfile();
        return profile.friends && profile.friends.includes(userId);
    }

    getUserStats() {
        return {
            scraps: localStorageManager.getScraps().filter(s => s.fromUserId === this.currentUser.id).length,
            photos: localStorageManager.getPhotosByUser(this.currentUser.id).length,
            friends: localStorageManager.getUserProfile().friends?.length || 0,
            testimonials: localStorageManager.getTestimonials().filter(t => t.fromUserId === this.currentUser.id).length
        };
    }

    // LIMPEZA
    destroy() {
        console.log('🛑 Action Handlers desativado');
    }
}

// Singleton instance
window.actionHandlers = new ActionHandlers();

export default ActionHandlers;
