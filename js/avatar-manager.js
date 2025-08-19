// ===================================================================
// ORKUT RETRÔ - GERENCIADOR DE AVATARES
// ===================================================================
// Sistema para gerenciar avatares padrão e persistência de fotos
// Data: 19 de Agosto de 2025
// ===================================================================

// Configurações do sistema de avatares
const AvatarManager = {
    defaultAvatar: 'images/orkutblack.png',
    avatarKey: 'orkut_user_avatar',
    fallbackAvatars: [
        'images/orkutblack.png',
        'images/orkut.png'
    ],
    
    // Seletores comuns de elementos de avatar
    selectors: [
        'img[id*="Photo"]',
        'img[id*="Avatar"]', 
        'img[class*="avatar"]',
        'img[class*="profile-photo"]',
        'img[class*="user-photo"]',
        'img[alt*="Foto"]',
        'img[alt*="Avatar"]',
        '.profile-photo img',
        '.user-avatar img',
        '#profilePhoto',
        '#headerUserPhoto',
        '#sidebarUserPhoto'
    ]
};

// ===================================================================
// FUNÇÕES PRINCIPAIS
// ===================================================================

/**
 * Inicializa o sistema de gerenciamento de avatares
 */
function initializeAvatarManager() {
    console.log('🖼️ Inicializando Avatar Manager...');
    
    // Verificar se há avatar salvo
    const savedAvatar = getSavedAvatar();
    
    // Aplicar avatar padrão ou salvo em todos os elementos
    updateAllAvatars(savedAvatar || AvatarManager.defaultAvatar);
    
    // Configurar observadores para novos elementos
    setupAvatarObserver();
    
    // Configurar listeners para upload de foto
    setupPhotoUploadListeners();
    
    console.log('✅ Avatar Manager inicializado com sucesso');
}

/**
 * Atualiza todos os avatares na página
 */
function updateAllAvatars(avatarUrl) {
    if (!avatarUrl || avatarUrl === '') {
        avatarUrl = AvatarManager.defaultAvatar;
    }
    
    // Atualizar elementos existentes
    AvatarManager.selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(img => {
            updateSingleAvatar(img, avatarUrl);
        });
    });
    
    // Atualizar placeholders específicos
    updatePlaceholderAvatars(avatarUrl);
    
    console.log(`🖼️ ${document.querySelectorAll(AvatarManager.selectors.join(',')).length} avatares atualizados`);
}

/**
 * Atualiza um único elemento de avatar
 */
function updateSingleAvatar(imgElement, avatarUrl) {
    if (!imgElement || imgElement.tagName !== 'IMG') return;
    
    // Verificar se é uma imagem de placeholder
    const currentSrc = imgElement.src;
    const isPlaceholder = currentSrc.includes('placeholder.com') || 
                         currentSrc.includes('via.placeholder') ||
                         currentSrc === '' ||
                         currentSrc === AvatarManager.defaultAvatar;
    
    // Só atualizar se for placeholder ou se for explicitamente solicitado
    if (isPlaceholder || avatarUrl !== AvatarManager.defaultAvatar) {
        imgElement.src = avatarUrl;
        
        // Adicionar fallback em caso de erro
        imgElement.onerror = function() {
            this.onerror = null; // Evitar loop infinito
            this.src = AvatarManager.defaultAvatar;
        };
        
        // Atualizar data attributes para rastreamento
        imgElement.setAttribute('data-avatar-managed', 'true');
        imgElement.setAttribute('data-avatar-updated', new Date().toISOString());
    }
}

/**
 * Atualiza placeholders específicos baseados em texto/padrões
 */
function updatePlaceholderAvatars(avatarUrl) {
    // Procurar por imagens com src contendo placeholder
    const placeholders = document.querySelectorAll('img[src*="placeholder"], img[src*="via.placeholder"]');
    placeholders.forEach(img => {
        updateSingleAvatar(img, avatarUrl);
    });
    
    // Procurar por imagens vazias ou inválidas
    const emptyImages = document.querySelectorAll('img:not([src]), img[src=""], img[src="#"]');
    emptyImages.forEach(img => {
        updateSingleAvatar(img, avatarUrl);
    });
}

/**
 * Configura observador para detectar novos elementos de avatar
 */
function setupAvatarObserver() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // Verificar novos nós adicionados
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // ELEMENT_NODE
                    // Verificar se o próprio nó é um avatar
                    if (node.tagName === 'IMG' && isAvatarElement(node)) {
                        updateSingleAvatar(node, getSavedAvatar() || AvatarManager.defaultAvatar);
                    }
                    
                    // Verificar filhos do nó
                    if (node.querySelectorAll) {
                        AvatarManager.selectors.forEach(selector => {
                            const avatars = node.querySelectorAll(selector);
                            avatars.forEach(img => {
                                updateSingleAvatar(img, getSavedAvatar() || AvatarManager.defaultAvatar);
                            });
                        });
                    }
                }
            });
            
            // Verificar atributos modificados
            if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                const img = mutation.target;
                if (img.tagName === 'IMG' && isAvatarElement(img)) {
                    const currentSrc = img.src;
                    if (currentSrc.includes('placeholder') || currentSrc === '') {
                        updateSingleAvatar(img, getSavedAvatar() || AvatarManager.defaultAvatar);
                    }
                }
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src']
    });
    
    console.log('👁️ Observer de avatares configurado');
}

/**
 * Verifica se um elemento é um avatar baseado em ID, classe ou alt
 */
function isAvatarElement(img) {
    const id = img.id?.toLowerCase() || '';
    const className = img.className?.toLowerCase() || '';
    const alt = img.alt?.toLowerCase() || '';
    
    const avatarKeywords = ['photo', 'avatar', 'profile', 'user', 'foto'];
    
    return avatarKeywords.some(keyword => 
        id.includes(keyword) || 
        className.includes(keyword) || 
        alt.includes(keyword)
    );
}

/**
 * Configura listeners para upload de fotos
 */
function setupPhotoUploadListeners() {
    // Listener para input de arquivo
    document.addEventListener('change', function(e) {
        if (e.target.type === 'file' && e.target.accept && e.target.accept.includes('image')) {
            handlePhotoUpload(e.target);
        }
    });
    
    // Listener para botões de alterar foto
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('change-photo-btn') || 
            e.target.textContent.toLowerCase().includes('alterar foto')) {
            handleChangePhotoClick(e.target);
        }
    });
}

/**
 * Manipula upload de nova foto de perfil
 */
function handlePhotoUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem válido.');
        return;
    }
    
    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
    }
    
    // Converter para base64 e salvar
    const reader = new FileReader();
    reader.onload = function(e) {
        const avatarUrl = e.target.result;
        
        // Salvar no localStorage
        saveAvatar(avatarUrl);
        
        // Atualizar todos os avatares
        updateAllAvatars(avatarUrl);
        
        // Atualizar dados do usuário se disponível
        updateUserPhotoData(avatarUrl);
        
        console.log('📷 Nova foto de perfil salva e aplicada');
        
        // Mostrar notificação
        if (typeof showNotification === 'function') {
            showNotification('Foto atualizada!', 'Sua foto de perfil foi atualizada com sucesso.', '📷');
        }
    };
    
    reader.onerror = function() {
        alert('Erro ao carregar a imagem. Tente novamente.');
    };
    
    reader.readAsDataURL(file);
}

/**
 * Manipula clique no botão de alterar foto
 */
function handleChangePhotoClick(button) {
    // Procurar por input de arquivo existente ou criar um
    let fileInput = document.getElementById('avatarFileInput');
    
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'avatarFileInput';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
    }
    
    // Trigger do input
    fileInput.click();
}

// ===================================================================
// FUNÇÕES DE PERSISTÊNCIA
// ===================================================================

/**
 * Salva avatar no localStorage
 */
function saveAvatar(avatarUrl) {
    try {
        localStorage.setItem(AvatarManager.avatarKey, avatarUrl);
        
        // Também salvar com timestamp
        const avatarData = {
            url: avatarUrl,
            timestamp: new Date().toISOString(),
            version: 1
        };
        localStorage.setItem(AvatarManager.avatarKey + '_data', JSON.stringify(avatarData));
        
    } catch (error) {
        console.warn('⚠️ Erro ao salvar avatar:', error);
        // Se der erro (storage cheio), usar apenas a URL simples
        try {
            localStorage.setItem(AvatarManager.avatarKey, avatarUrl);
        } catch (e) {
            console.error('❌ Não foi possível salvar avatar:', e);
        }
    }
}

/**
 * Recupera avatar salvo do localStorage
 */
function getSavedAvatar() {
    try {
        // Tentar buscar versão completa primeiro
        const avatarDataStr = localStorage.getItem(AvatarManager.avatarKey + '_data');
        if (avatarDataStr) {
            const avatarData = JSON.parse(avatarDataStr);
            return avatarData.url;
        }
        
        // Fallback para versão simples
        return localStorage.getItem(AvatarManager.avatarKey);
        
    } catch (error) {
        console.warn('⚠️ Erro ao recuperar avatar salvo:', error);
        return null;
    }
}

/**
 * Remove avatar salvo (volta ao padrão)
 */
function resetAvatar() {
    try {
        localStorage.removeItem(AvatarManager.avatarKey);
        localStorage.removeItem(AvatarManager.avatarKey + '_data');
        
        // Aplicar avatar padrão
        updateAllAvatars(AvatarManager.defaultAvatar);
        
        console.log('🔄 Avatar resetado para padrão');
        
        if (typeof showNotification === 'function') {
            showNotification('Avatar resetado', 'Foto de perfil voltou ao padrão.', '🔄');
        }
        
    } catch (error) {
        console.error('❌ Erro ao resetar avatar:', error);
    }
}

/**
 * Atualiza dados do usuário com nova foto
 */
function updateUserPhotoData(avatarUrl) {
    // Atualizar no OrkutRetro se disponível
    if (typeof window.OrkutRetro !== 'undefined' && window.OrkutRetro.currentUser) {
        window.OrkutRetro.currentUser.photo = avatarUrl;
        
        // Salvar dados atualizados
        if (typeof saveUserData === 'function') {
            saveUserData();
        } else {
            localStorage.setItem('orkutUser', JSON.stringify(window.OrkutRetro.currentUser));
        }
    }
    
    // Atualizar no mockData se disponível
    if (typeof window.mockData !== 'undefined' && window.mockData.currentUser) {
        window.mockData.currentUser.photo = avatarUrl;
    }
}

// ===================================================================
// FUNÇÕES UTILITÁRIAS
// ===================================================================

/**
 * Pré-carrega o avatar padrão para melhor performance
 */
function preloadDefaultAvatar() {
    const img = new Image();
    img.src = AvatarManager.defaultAvatar;
    img.onload = function() {
        console.log('✅ Avatar padrão pré-carregado');
    };
    img.onerror = function() {
        console.warn('⚠️ Erro ao pré-carregar avatar padrão');
    };
}

/**
 * Valida se uma URL de avatar é válida
 */
function isValidAvatarUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    // Verificar se é data URL (base64)
    if (url.startsWith('data:image/')) return true;
    
    // Verificar se é URL relativa válida
    if (url.startsWith('images/') && url.includes('.')) return true;
    
    // Verificar se é URL absoluta válida
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Limpa cache de avatares antigos
 */
function cleanupAvatarCache() {
    try {
        const keys = Object.keys(localStorage);
        const avatarKeys = keys.filter(key => 
            key.startsWith('orkut_') && 
            (key.includes('avatar') || key.includes('photo'))
        );
        
        let cleaned = 0;
        avatarKeys.forEach(key => {
            try {
                const data = localStorage.getItem(key);
                // Se for muito antigo (mais de 30 dias), limpar
                if (data && data.includes('timestamp')) {
                    const avatarData = JSON.parse(data);
                    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                    if (new Date(avatarData.timestamp).getTime() < thirtyDaysAgo) {
                        localStorage.removeItem(key);
                        cleaned++;
                    }
                }
            } catch (e) {
                // Se não conseguir parsear, remover
                localStorage.removeItem(key);
                cleaned++;
            }
        });
        
        if (cleaned > 0) {
            console.log(`🧹 ${cleaned} avatares antigos limpos do cache`);
        }
    } catch (error) {
        console.warn('⚠️ Erro ao limpar cache de avatares:', error);
    }
}

// ===================================================================
// INICIALIZAÇÃO E EXPORT
// ===================================================================

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initializeAvatarManager();
        preloadDefaultAvatar();
        cleanupAvatarCache();
    });
} else {
    // DOM já está pronto
    initializeAvatarManager();
    preloadDefaultAvatar();
    cleanupAvatarCache();
}

// Exportar funções para uso global
window.AvatarManager = {
    ...AvatarManager,
    updateAllAvatars,
    updateSingleAvatar,
    handlePhotoUpload,
    saveAvatar,
    getSavedAvatar,
    resetAvatar,
    isValidAvatarUrl,
    cleanupAvatarCache
};

console.log('🖼️ Avatar Manager carregado e pronto para uso');
