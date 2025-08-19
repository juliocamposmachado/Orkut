// Orkut Retrô - Sistema de Fotos de Perfil
// Gerenciamento de imagens usando pasta local e integração Supabase

// Configuração de imagens disponíveis
const PROFILE_IMAGES = {
    default: [
        'images/orkutblack.png',
        'images/orkut.png',
        'images/julio.webp', 
        'images/juliette.jpg',
        'images/Abujamra.jpg'
    ],
    test_users: [
        'images/orkutblack.png'
    ],
    categories: {
        masculine: ['images/julio.webp', 'images/Abujamra.jpg'],
        feminine: ['images/juliette.jpg'],
        default: ['images/orkutblack.png', 'images/orkut.png']
    }
};

// Inicializar sistema de fotos
document.addEventListener('DOMContentLoaded', function() {
    initializeProfilePhotos();
    setupProfilePhotoEvents();
});

// Inicializar fotos de perfil
function initializeProfilePhotos() {
    // Aplicar foto correta baseada no usuário
    applyCorrectProfilePhoto();
    
    // Atualizar mock data com imagens corretas
    updateAllMockImages();
    
    // Configurar seletor de fotos se existir
    setupPhotoSelector();
}

// Aplicar foto correta baseada no usuário atual
function applyCorrectProfilePhoto() {
    const user = JSON.parse(localStorage.getItem('orkutUser') || '{}');
    
    if (!user.id) return;
    
    // Verificar se é usuário de teste
    if (isTestUser(user)) {
        user.photo = 'images/orkutblack.png';
    } else if (!user.photo || user.photo.includes('placeholder') || user.photo.includes('via.placeholder')) {
        // Aplicar foto baseada no gênero/nome se possível
        user.photo = getPhotoByUserProfile(user);
    }
    
    // Salvar alterações
    localStorage.setItem('orkutUser', JSON.stringify(user));
    
    // Atualizar na página
    updatePageUserInfo(user);
}

// Verificar se é usuário de teste
function isTestUser(user) {
    const testKeywords = ['test', 'teste', 'demo', 'admin', 'exemplo'];
    
    return testKeywords.some(keyword => 
        user.name?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.username?.toLowerCase().includes(keyword)
    );
}

// Obter foto baseada no perfil do usuário
function getPhotoByUserProfile(user) {
    // Para usuários de teste, sempre usar orkutblack.png
    if (isTestUser(user)) {
        return 'images/orkutblack.png';
    }
    
    // Tentar detectar gênero pelo nome
    const name = user.name?.toLowerCase() || '';
    
    // Nomes tipicamente femininos
    const feminineNames = ['ana', 'maria', 'julia', 'carla', 'laura', 'amanda', 'fernanda', 'patricia', 'sandra', 'paula', 'carolina', 'camila', 'rafaela', 'tatiana', 'helena', 'juliette'];
    
    // Nomes tipicamente masculinos  
    const masculineNames = ['joão', 'carlos', 'ricardo', 'bruno', 'diego', 'pedro', 'paulo', 'marcos', 'andré', 'lucas', 'gabriel', 'rafael', 'julio', 'abujamra'];
    
    if (feminineNames.some(n => name.includes(n))) {
        return getRandomFromArray(PROFILE_IMAGES.categories.feminine.concat(PROFILE_IMAGES.categories.default));
    } else if (masculineNames.some(n => name.includes(n))) {
        return getRandomFromArray(PROFILE_IMAGES.categories.masculine.concat(PROFILE_IMAGES.categories.default));
    }
    
    // Default: escolher aleatoriamente
    return getRandomFromArray(PROFILE_IMAGES.default);
}

// Obter imagem aleatória de um array
function getRandomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Atualizar todas as imagens mock
function updateAllMockImages() {
    // Atualizar mockData se existir
    if (window.mockData) {
        updateMockDataImages();
    }
    
    // Atualizar imagens de posts existentes na página
    updateExistingPostImages();
    
    // Atualizar imagens de amigos
    updateFriendImages();
}

// Atualizar imagens no mock data
function updateMockDataImages() {
    const mockData = window.mockData;
    
    // Atualizar usuário atual
    if (mockData.currentUser) {
        mockData.currentUser.photo = isTestUser(mockData.currentUser) ? 
            'images/orkutblack.png' : 
            getPhotoByUserProfile(mockData.currentUser);
    }
    
    // Atualizar amigos
    if (mockData.friends) {
        mockData.friends.forEach((friend, index) => {
            friend.photo = getPhotoByUserProfile(friend);
        });
    }
    
    // Atualizar posts do feed
    if (mockData.feedPosts) {
        mockData.feedPosts.forEach((post, index) => {
            const author = { name: post.author, email: `${post.author}@test.com` };
            post.authorPhoto = getPhotoByUserProfile(author);
        });
    }
    
    // Atualizar scraps
    if (mockData.scraps) {
        mockData.scraps.forEach((scrap, index) => {
            const author = { name: scrap.author, email: `${scrap.author}@test.com` };
            scrap.authorPhoto = getPhotoByUserProfile(author);
        });
    }
    
    // Atualizar mensagens
    if (mockData.messages) {
        mockData.messages.forEach((message, index) => {
            const from = { name: message.from, email: `${message.from}@test.com` };
            message.fromPhoto = getPhotoByUserProfile(from);
        });
    }
}

// Atualizar imagens de posts existentes
function updateExistingPostImages() {
    const feedItems = document.querySelectorAll('.feed-item');
    
    feedItems.forEach(item => {
        const avatar = item.querySelector('.feed-avatar');
        if (avatar && avatar.src.includes('placeholder')) {
            const authorName = item.querySelector('.feed-author')?.textContent || '';
            const author = { name: authorName, email: `${authorName}@test.com` };
            avatar.src = getPhotoByUserProfile(author);
        }
    });
}

// Atualizar imagens de amigos
function updateFriendImages() {
    const friendItems = document.querySelectorAll('.friend-item, .friend-photo, .online-friend');
    
    friendItems.forEach(item => {
        const img = item.querySelector('img') || item;
        if (img && img.src && img.src.includes('placeholder')) {
            const name = item.querySelector('.friend-name')?.textContent || 
                         item.getAttribute('data-name') || 
                         'usuário';
            const friend = { name: name, email: `${name}@test.com` };
            img.src = getPhotoByUserProfile(friend);
        }
    });
}

// Configurar eventos de fotos de perfil
function setupProfilePhotoEvents() {
    // Botão alterar foto
    const changePhotoBtn = document.querySelector('.change-photo-btn');
    if (changePhotoBtn) {
        changePhotoBtn.addEventListener('click', showPhotoSelector);
    }
    
    // Click na foto de perfil
    const profilePhoto = document.getElementById('profilePhoto');
    if (profilePhoto) {
        profilePhoto.addEventListener('click', showPhotoSelector);
        profilePhoto.style.cursor = 'pointer';
        profilePhoto.title = 'Clique para alterar foto';
    }
}

// Configurar seletor de fotos
function setupPhotoSelector() {
    // Verificar se modal já existe
    if (document.getElementById('photoSelectorModal')) {
        return;
    }
    
    createPhotoSelectorModal();
}

// Criar modal seletor de fotos
function createPhotoSelectorModal() {
    const modalHTML = `
        <div class="modal hidden" id="photoSelectorModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Escolher Foto de Perfil</h3>
                    <button class="close-btn" onclick="closeModal('photoSelectorModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="photo-grid" id="photoGrid">
                        ${generatePhotoOptions()}
                    </div>
                    
                    <div class="photo-upload-section">
                        <h4>Ou faça upload de uma foto:</h4>
                        <input type="file" id="photoUpload" accept="image/*" onchange="handlePhotoUpload(event)">
                        <label for="photoUpload" class="btn btn-secondary">Escolher Arquivo</label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-light" onclick="closeModal('photoSelectorModal')">Cancelar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Adicionar estilos se não existirem
    addPhotoSelectorStyles();
}

// Gerar opções de fotos
function generatePhotoOptions() {
    return PROFILE_IMAGES.default.map(imageUrl => `
        <div class="photo-option" onclick="selectPhoto('${imageUrl}')">
            <img src="${imageUrl}" alt="Opção de foto" onerror="this.style.display='none'">
        </div>
    `).join('');
}

// Mostrar seletor de fotos
function showPhotoSelector() {
    const modal = document.getElementById('photoSelectorModal');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        createPhotoSelectorModal();
        setTimeout(() => showPhotoSelector(), 100);
    }
}

// Selecionar foto
async function selectPhoto(imageUrl) {
    try {
        // Mostrar loading
        showPhotoUpdateLoading();
        
        // Atualizar foto no Supabase e localmente
        const result = await updateProfilePhoto(null, imageUrl.replace('images/', ''));
        
        if (result.success) {
            // Fechar modal
            closeModal('photoSelectorModal');
            
            // Atualizar todas as ocorrências da foto na página
            updateAllUserPhotoInstances(result.photoUrl);
            
            showSuccess('Foto de perfil atualizada com sucesso! 📸');
        } else {
            showError('Erro ao atualizar foto. Tente novamente.');
        }
        
    } catch (error) {
        console.error('Erro ao selecionar foto:', error);
        showError('Erro ao atualizar foto. Tente novamente.');
    } finally {
        hidePhotoUpdateLoading();
    }
}

// Lidar com upload de foto
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar arquivo
    if (!file.type.startsWith('image/')) {
        showError('Por favor, selecione apenas arquivos de imagem.');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
        showError('A imagem deve ter no máximo 5MB.');
        return;
    }
    
    // Converter para base64 e usar como foto
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            showPhotoUpdateLoading();
            
            // Por enquanto, usar uma das imagens padrão aleatoriamente
            // Em uma implementação real, você salvaria a imagem no servidor
            const randomPhoto = getRandomFromArray(PROFILE_IMAGES.default);
            const result = await updateProfilePhoto(null, randomPhoto.replace('images/', ''));
            
            if (result.success) {
                closeModal('photoSelectorModal');
                updateAllUserPhotoInstances(result.photoUrl);
                showSuccess('Foto de perfil atualizada com sucesso! 📸');
            }
            
        } catch (error) {
            console.error('Erro no upload:', error);
            showError('Erro ao fazer upload da foto.');
        } finally {
            hidePhotoUpdateLoading();
        }
    };
    
    reader.readAsDataURL(file);
}

// Atualizar todas as instâncias da foto do usuário na página
function updateAllUserPhotoInstances(newPhotoUrl) {
    const user = JSON.parse(localStorage.getItem('orkutUser') || '{}');
    
    // Selecionar todos os elementos que mostram a foto do usuário
    const photoSelectors = [
        '#profilePhoto',
        '#headerUserPhoto', 
        '#sidebarUserPhoto',
        '.user-photo',
        '.profile-photo'
    ];
    
    photoSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (element.tagName === 'IMG') {
                element.src = newPhotoUrl;
            }
        });
    });
    
    // Atualizar posts do usuário no feed
    const userPosts = document.querySelectorAll(`.feed-item[data-author="${user.id}"] .feed-avatar`);
    userPosts.forEach(avatar => {
        avatar.src = newPhotoUrl;
    });
}

// Mostrar loading de atualização de foto
function showPhotoUpdateLoading() {
    const modal = document.getElementById('photoSelectorModal');
    if (modal) {
        const overlay = document.createElement('div');
        overlay.className = 'photo-loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>Atualizando foto...</p>
            </div>
        `;
        modal.appendChild(overlay);
    }
}

// Esconder loading de atualização de foto
function hidePhotoUpdateLoading() {
    const overlay = document.querySelector('.photo-loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Adicionar estilos do seletor de fotos
function addPhotoSelectorStyles() {
    if (document.getElementById('photoSelectorStyles')) return;
    
    const styles = `
        <style id="photoSelectorStyles">
        .photo-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .photo-option {
            border: 2px solid transparent;
            border-radius: 50%;
            padding: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100px;
            height: 100px;
            overflow: hidden;
        }
        
        .photo-option:hover {
            border-color: var(--primary-color, #d63384);
            transform: scale(1.05);
        }
        
        .photo-option img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
        }
        
        .photo-upload-section {
            border-top: 1px solid #eee;
            padding-top: 20px;
            text-align: center;
        }
        
        .photo-upload-section h4 {
            margin-bottom: 15px;
            color: #666;
        }
        
        #photoUpload {
            display: none;
        }
        
        .photo-loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .loading-content {
            text-align: center;
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid var(--primary-color, #d63384);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// Inicializar fotos em posts existentes
function initializeExistingPostPhotos() {
    setTimeout(() => {
        updateExistingPostImages();
        updateFriendImages();
    }, 1000);
}

// Auto-inicialização quando a página carrega
window.addEventListener('load', function() {
    setTimeout(() => {
        initializeExistingPostPhotos();
    }, 2000);
});

// Função para atualizar foto de um usuário específico (para uso em outras partes do código)
function updateUserPhoto(userId, photoUrl) {
    const elements = document.querySelectorAll(`[data-user-id="${userId}"] img, img[data-user-id="${userId}"]`);
    elements.forEach(img => {
        img.src = photoUrl;
    });
}

// Função para garantir que todas as imagens tenham fallback correto
function ensureImageFallbacks() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.hasAttribute('onerror')) {
            img.setAttribute('onerror', "this.src='images/orkutblack.png'");
        }
    });
}

// Executar fallback de imagens periodicamente
setInterval(ensureImageFallbacks, 5000);

console.log('📷 Sistema de fotos de perfil carregado');
