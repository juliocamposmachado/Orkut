// Integração do Sistema Interativo de IA do Orkut 2025
class OrkutAIIntegration {
    constructor(options = {}) {
        this.options = {
            enableAIButton: true,
            enableLogs: true,
            enableTabMonitor: true,
            enableAutoProfileUpdate: true,
            logLevel: 'all', // all, important, errors
            ...options
        };
        
        this.isInitialized = false;
        this.init();
    }

    async init() {
        if (this.isInitialized) return;

        try {
            // Aguardar DOM estar pronto
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Inicializar componentes conforme configuração
            if (this.options.enableLogs) {
                this.initializeLogSystem();
            }

            if (this.options.enableAIButton) {
                this.initializeAIButton();
            }

            if (this.options.enableTabMonitor) {
                this.initializeTabMonitor();
            }

            // Configurar integrações automáticas
            this.setupAutomaticIntegrations();

            this.isInitialized = true;
            this.log('Sistema Orkut AI Integration inicializado', 'success');

        } catch (error) {
            console.error('Erro ao inicializar Orkut AI Integration:', error);
            this.log('Erro na inicialização do sistema', 'error');
        }
    }

    initializeLogSystem() {
        if (typeof LogSystem === 'undefined') {
            console.warn('LogSystem não encontrado. Certifique-se de incluir log-system.js');
            return;
        }

        // Configurar nível de logs
        if (window.logSystem) {
            window.logSystem.logLevel = this.options.logLevel;
        }
    }

    initializeAIButton() {
        if (typeof AIStatusButton === 'undefined') {
            console.warn('AIStatusButton não encontrado. Certifique-se de incluir ai-status-button.js');
            return;
        }

        // Sistema já inicializa automaticamente
    }

    initializeTabMonitor() {
        if (typeof TabMonitor === 'undefined') {
            console.warn('TabMonitor não encontrado. Certifique-se de incluir tab-monitor.js');
            return;
        }

        // Sistema já inicializa automaticamente
    }

    setupAutomaticIntegrations() {
        // Interceptar mudanças no perfil
        this.setupProfileIntegration();
        
        // Interceptar uploads de arquivos
        this.setupFileUploadIntegration();
        
        // Interceptar ações de comunidades
        this.setupCommunityIntegration();
        
        // Interceptar scraps/recados
        this.setupScrapIntegration();
        
        // Interceptar interações sociais
        this.setupSocialIntegration();
    }

    setupProfileIntegration() {
        // Monitorar edições de perfil
        const profileForms = document.querySelectorAll('form[name*="profile"], .profile-form, #profile-form');
        
        profileForms.forEach(form => {
            // Monitorar mudanças em campos
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('change', (e) => {
                    const field = e.target.name || e.target.id || 'campo';
                    const value = e.target.value;
                    
                    this.log(`Editou ${field}: ${value}`, 'edit');
                    
                    if (this.options.enableAutoProfileUpdate && window.aiStatusButton) {
                        window.aiStatusButton.processUpdate(`Editar ${field}`, {
                            field: field,
                            value: value,
                            action: 'profile_edit'
                        });
                    }
                });
            });

            // Monitorar envio do formulário
            form.addEventListener('submit', (e) => {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                this.log('Salvando perfil do usuário', 'save');
                
                if (window.aiStatusButton) {
                    window.aiStatusButton.processUpdate('Atualizar perfil completo', {
                        action: 'profile_update',
                        data: data
                    });
                }
            });
        });

        // Monitorar upload de foto de perfil
        const photoUploadInputs = document.querySelectorAll('input[type="file"][name*="photo"], input[type="file"][name*="avatar"], .photo-upload input');
        
        photoUploadInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    const file = e.target.files[0];
                    this.log(`Upload de foto: ${file.name}`, 'upload');
                    
                    if (window.aiStatusButton) {
                        window.aiStatusButton.processUpdate('Upload foto do perfil', {
                            fileName: file.name,
                            fileSize: this.formatFileSize(file.size),
                            fileType: file.type,
                            action: 'photo_upload'
                        });
                    }
                }
            });
        });
    }

    setupFileUploadIntegration() {
        // Monitorar todos os uploads de arquivo
        document.addEventListener('change', (e) => {
            if (e.target.type === 'file' && e.target.files.length > 0) {
                const file = e.target.files[0];
                const uploadType = this.getUploadType(e.target);
                
                this.log(`Upload ${uploadType}: ${file.name}`, 'upload');
                
                if (window.aiStatusButton) {
                    window.aiStatusButton.processUpdate(`Upload ${uploadType}`, {
                        fileName: file.name,
                        fileSize: this.formatFileSize(file.size),
                        fileType: file.type,
                        action: 'file_upload'
                    });
                }
            }
        });
    }

    setupCommunityIntegration() {
        // Monitorar ações de comunidade
        const communityActions = document.querySelectorAll('.join-community, .leave-community, .create-community');
        
        communityActions.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.classList.contains('join-community') ? 'Entrou na comunidade' :
                              e.target.classList.contains('leave-community') ? 'Saiu da comunidade' :
                              'Criou comunidade';
                
                const communityName = e.target.dataset.community || 'comunidade';
                
                this.log(`${action}: ${communityName}`, 'user');
                
                if (window.aiStatusButton) {
                    window.aiStatusButton.processUpdate(action, {
                        community: communityName,
                        action: 'community_action'
                    });
                }
            });
        });
    }

    setupScrapIntegration() {
        // Monitorar envio de scraps/recados
        const scrapForms = document.querySelectorAll('.scrap-form, form[name*="scrap"], #scrap-form');
        
        scrapForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const messageField = form.querySelector('textarea, input[name*="message"]');
                const recipientField = form.querySelector('input[name*="recipient"], input[name*="to"]');
                
                const message = messageField ? messageField.value.substring(0, 50) + '...' : 'recado';
                const recipient = recipientField ? recipientField.value : 'amigo';
                
                this.log(`Enviou recado para ${recipient}`, 'user');
                
                if (window.aiStatusButton) {
                    window.aiStatusButton.processUpdate('Enviar recado', {
                        recipient: recipient,
                        messagePreview: message,
                        action: 'scrap_send'
                    });
                }
            });
        });
    }

    setupSocialIntegration() {
        // Monitorar curtidas, comentários, etc.
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Curtidas
            if (target.matches('.like-button, .btn-like, [data-action="like"]')) {
                this.log('Curtiu uma publicação', 'user');
                
                if (window.aiStatusButton) {
                    window.aiStatusButton.processUpdate('Registrar curtida', {
                        action: 'like_post'
                    });
                }
            }
            
            // Adicionar amigo
            if (target.matches('.add-friend, .btn-add-friend, [data-action="add-friend"]')) {
                const friendName = target.dataset.friend || 'usuário';
                this.log(`Enviou solicitação de amizade para ${friendName}`, 'user');
                
                if (window.aiStatusButton) {
                    window.aiStatusButton.processUpdate('Adicionar amigo', {
                        friend: friendName,
                        action: 'friend_request'
                    });
                }
            }
            
            // Aceitar amizade
            if (target.matches('.accept-friend, .btn-accept, [data-action="accept-friend"]')) {
                const friendName = target.dataset.friend || 'usuário';
                this.log(`Aceitou amizade de ${friendName}`, 'user');
                
                if (window.aiStatusButton) {
                    window.aiStatusButton.processUpdate('Aceitar amizade', {
                        friend: friendName,
                        action: 'friend_accept'
                    });
                }
            }
        });

        // Monitorar comentários
        const commentForms = document.querySelectorAll('.comment-form, form[name*="comment"]');
        
        commentForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                this.log('Enviou comentário', 'user');
                
                if (window.aiStatusButton) {
                    window.aiStatusButton.processUpdate('Enviar comentário', {
                        action: 'comment_post'
                    });
                }
            });
        });
    }

    // Métodos de utilidade
    getUploadType(input) {
        const name = input.name?.toLowerCase() || '';
        const className = input.className?.toLowerCase() || '';
        
        if (name.includes('photo') || name.includes('avatar') || className.includes('photo')) {
            return 'foto';
        } else if (name.includes('video') || className.includes('video')) {
            return 'vídeo';
        } else if (name.includes('audio') || className.includes('audio')) {
            return 'áudio';
        } else if (name.includes('document') || className.includes('document')) {
            return 'documento';
        }
        
        return 'arquivo';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    log(message, type = 'info', data = null) {
        if (window.LogSystem) {
            LogSystem.addLog(message, type, data);
        }
    }

    // Métodos públicos para integração manual
    trackCustomAction(action, type = 'user', data = null) {
        this.log(action, type, data);
        
        if (window.aiStatusButton) {
            window.aiStatusButton.processUpdate(action, {
                ...data,
                action: 'custom_action'
            });
        }
    }

    trackProfileChange(field, oldValue, newValue) {
        const message = `Atualizou ${field}: "${oldValue}" → "${newValue}"`;
        this.log(message, 'edit', { field, oldValue, newValue });
        
        if (window.aiStatusButton) {
            window.aiStatusButton.processUpdate(`Atualizar ${field}`, {
                field,
                oldValue,
                newValue,
                action: 'profile_field_update'
            });
        }
    }

    trackActivity(activity) {
        if (window.TabMonitor) {
            TabMonitor.addCustomActivity(activity);
        }
    }

    showDatabaseBusy(reason = 'Sistema ocupado') {
        if (window.aiStatusButton) {
            window.aiStatusButton.dbStatus = 'busy';
            window.aiStatusButton.updateVisualStatus('queued', reason);
        }
    }

    showDatabaseFree() {
        if (window.aiStatusButton) {
            window.aiStatusButton.dbStatus = 'free';
            window.aiStatusButton.updateVisualStatus('idle');
        }
    }

    showError(message) {
        this.log(message, 'error');
        
        if (window.aiStatusButton) {
            window.aiStatusButton.updateVisualStatus('error', message);
        }
    }

    showSuccess(message) {
        this.log(message, 'success');
        
        if (window.aiStatusButton) {
            window.aiStatusButton.updateVisualStatus('idle');
        }
    }
}

// Inicializar automaticamente
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se já não foi inicializado manualmente
    if (!window.orkutAI) {
        window.orkutAI = new OrkutAIIntegration();
    }
});

// Exportar para uso manual
window.OrkutAIIntegration = OrkutAIIntegration;
