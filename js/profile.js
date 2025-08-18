// Orkut Retrô - JavaScript do Perfil
// Funcionalidades para edição de perfil, scraps, depoimentos e fotos

// Estado atual do perfil
let currentProfile = null;
let isEditing = false;

// Inicialização específica do perfil
document.addEventListener('DOMContentLoaded', function() {
    if (getCurrentPage() === 'profile') {
        initializeProfile();
        setupProfileEventListeners();
        loadProfileContent();
    }
});

// Inicializar página de perfil
function initializeProfile() {
    currentProfile = OrkutRetro.currentUser || mockData.currentUser;
    
    // Configurar contador de caracteres para textarea
    setupCharacterCounters();
    
    // Carregar dados salvos em formulários
    loadFormData('editProfileForm');
}

// Event listeners específicos do perfil
function setupProfileEventListeners() {
    // Upload de foto de perfil
    const photoInput = document.getElementById('profilePhotoInput');
    if (photoInput) {
        photoInput.addEventListener('change', handlePhotoUpload);
    }
    
    // Contador de caracteres em tempo real
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', updateCharacterCount);
    });
    
    // Auto-save em campos editáveis
    const editableFields = document.querySelectorAll('[data-editable]');
    editableFields.forEach(field => {
        field.addEventListener('blur', autoSaveField);
    });
}

// Carregar conteúdo específico do perfil
function loadProfileContent() {
    loadPhotosGrid();
    loadTestimonials();
    updateProfileStats();
}

// FUNÇÕES DE EDIÇÃO DE PERFIL

// Abrir modal de edição de perfil
function editProfile() {
    const modal = document.getElementById('editProfileModal');
    if (!modal) return;
    
    // Preencher formulário com dados atuais
    populateEditForm();
    showModal('editProfileModal');
}

// Preencher formulário de edição
function populateEditForm() {
    if (!currentProfile) return;
    
    const fields = {
        'editName': currentProfile.name,
        'editStatus': currentProfile.status.replace(/"/g, ''),
        'editAge': currentProfile.age,
        'editRelationship': currentProfile.relationship,
        'editLocation': currentProfile.location,
        'editBirthday': formatDateForInput(currentProfile.birthday)
    };
    
    Object.keys(fields).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && fields[fieldId]) {
            field.value = fields[fieldId];
        }
    });
}

// Salvar alterações do perfil
function saveProfile(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validações
    const name = formData.get('name').trim();
    if (name.length < 2) {
        showError('Nome deve ter pelo menos 2 caracteres.');
        return;
    }
    
    // Mostrar loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Salvando...';
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Simular salvamento
    setTimeout(() => {
        // Atualizar dados do perfil
        currentProfile.name = name;
        currentProfile.status = formData.get('status') || '';
        currentProfile.age = formData.get('age') || null;
        currentProfile.relationship = formData.get('relationship') || '';
        currentProfile.location = formData.get('location') || '';
        currentProfile.birthday = formatDateForDisplay(formData.get('birthday'));
        
        // Salvar no localStorage
        localStorage.setItem('orkutUser', JSON.stringify(currentProfile));
        
        // Atualizar interface
        updateProfileDisplay();
        
        // Restaurar botão e fechar modal
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        closeModal('editProfileModal');
        showNotification('Perfil atualizado!', 'Suas informações foram salvas com sucesso.', '✅');
        
    }, 1500);
}

// Atualizar exibição do perfil
function updateProfileDisplay() {
    updateElement('profileName', currentProfile.name);
    updateElement('profileStatus', `"${currentProfile.status}"`);
    updateElement('profileAge', currentProfile.age ? `${currentProfile.age} anos` : '');
    updateElement('profileLocation', currentProfile.location);
    updateElement('profileRelationship', currentProfile.relationship);
    updateElement('profileBirthday', currentProfile.birthday);
    
    // Atualizar foto se mudou
    const profilePhoto = document.getElementById('profilePhoto');
    if (profilePhoto && currentProfile.photo) {
        profilePhoto.src = currentProfile.photo;
    }
}

// FUNÇÕES DE UPLOAD DE FOTO

// Alterar foto de perfil
function changePhoto() {
    // Criar input file temporário
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handlePhotoUpload;
    input.click();
}

// Processar upload de foto
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
    
    // Mostrar preview e salvar
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        // Atualizar foto no perfil
        currentProfile.photo = imageData;
        localStorage.setItem('orkutUser', JSON.stringify(currentProfile));
        
        // Atualizar interface
        const profilePhoto = document.getElementById('profilePhoto');
        if (profilePhoto) {
            profilePhoto.src = imageData;
        }
        
        showNotification('Foto atualizada!', 'Sua nova foto de perfil foi salva.', '📸');
    };
    
    reader.readAsDataURL(file);
}

// FUNÇÕES DE BIOGRAFIA

// Editar biografia
function editBio() {
    const bioElement = document.getElementById('profileBio');
    if (!bioElement) return;
    
    const currentBio = bioElement.textContent;
    
    // Criar textarea temporário
    const textarea = document.createElement('textarea');
    textarea.value = currentBio;
    textarea.className = 'bio-editor';
    textarea.style.cssText = `
        width: 100%;
        min-height: 80px;
        padding: 10px;
        border: 2px solid var(--primary-purple);
        border-radius: 8px;
        font-family: Verdana, Arial, sans-serif;
        font-size: 11px;
        resize: vertical;
    `;
    textarea.maxLength = 500;
    
    // Substituir elemento
    const parent = bioElement.parentNode;
    parent.replaceChild(textarea, bioElement);
    textarea.focus();
    
    // Adicionar botões de ação
    const actions = document.createElement('div');
    actions.className = 'bio-actions';
    actions.style.cssText = 'margin-top: 10px; display: flex; gap: 10px;';
    actions.innerHTML = `
        <button class="btn btn-primary btn-sm" onclick="saveBio()">Salvar</button>
        <button class="btn btn-light btn-sm" onclick="cancelBioEdit()">Cancelar</button>
        <div class="char-counter" style="margin-left: auto;">
            <span id="bioCharCount">${textarea.value.length}</span>/500
        </div>
    `;
    
    parent.appendChild(actions);
    
    // Contador de caracteres
    textarea.addEventListener('input', function() {
        document.getElementById('bioCharCount').textContent = this.value.length;
    });
    
    // Salvar com Enter + Ctrl
    textarea.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            saveBio();
        }
        if (e.key === 'Escape') {
            cancelBioEdit();
        }
    });
}

// Salvar biografia
function saveBio() {
    const textarea = document.querySelector('.bio-editor');
    const actions = document.querySelector('.bio-actions');
    
    if (!textarea || !actions) return;
    
    const newBio = textarea.value.trim();
    
    // Atualizar dados
    currentProfile.bio = newBio;
    localStorage.setItem('orkutUser', JSON.stringify(currentProfile));
    
    // Restaurar interface
    const bioElement = document.createElement('p');
    bioElement.id = 'profileBio';
    bioElement.textContent = newBio || 'Nenhuma biografia adicionada ainda.';
    
    const parent = textarea.parentNode;
    parent.replaceChild(bioElement, textarea);
    actions.remove();
    
    showNotification('Biografia salva!', 'Sua biografia foi atualizada.', '📝');
}

// Cancelar edição de biografia
function cancelBioEdit() {
    const textarea = document.querySelector('.bio-editor');
    const actions = document.querySelector('.bio-actions');
    
    if (!textarea || !actions) return;
    
    // Restaurar texto original
    const bioElement = document.createElement('p');
    bioElement.id = 'profileBio';
    bioElement.textContent = currentProfile.bio || 'Nenhuma biografia adicionada ainda.';
    
    const parent = textarea.parentNode;
    parent.replaceChild(bioElement, textarea);
    actions.remove();
}

// FUNÇÕES DE SCRAPS

// Enviar scrap
function sendScrap(event) {
    event.preventDefault();
    
    const form = event.target;
    const messageInput = form.querySelector('#scrapMessage');
    const message = messageInput.value.trim();
    
    if (!message) {
        showError('Digite uma mensagem para o scrap.');
        return;
    }
    
    // Criar novo scrap
    const newScrap = {
        id: generateId(),
        author: currentProfile.name,
        authorPhoto: currentProfile.photo,
        content: message,
        date: 'agora'
    };
    
    // Adicionar à lista
    addScrapToList(newScrap);
    
    // Limpar formulário
    messageInput.value = '';
    
    showNotification('Scrap enviado!', 'Sua mensagem foi publicada.', '💬');
}

// Adicionar scrap à lista
function addScrapToList(scrap) {
    const container = document.getElementById('scrapsList');
    if (!container) return;
    
    const scrapHTML = `
        <div class="scrap-item fade-in">
            <div class="scrap-header">
                <img src="${scrap.authorPhoto}" alt="${scrap.author}">
                <span class="scrap-author">${scrap.author}</span>
                <span class="scrap-date">${scrap.date}</span>
                <div class="scrap-actions">
                    <button class="btn-icon" onclick="deleteScrap('${scrap.id}')" title="Excluir">🗑️</button>
                </div>
            </div>
            <div class="scrap-content">${sanitizeHTML(scrap.content)}</div>
        </div>
    `;
    
    container.insertAdjacentHTML('afterbegin', scrapHTML);
}

// Excluir scrap
function deleteScrap(scrapId) {
    if (!confirm('Tem certeza que deseja excluir este scrap?')) return;
    
    const scrapElement = document.querySelector(`[onclick="deleteScrap('${scrapId}')"]`).closest('.scrap-item');
    if (scrapElement) {
        scrapElement.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => scrapElement.remove(), 300);
        showNotification('Scrap excluído', 'A mensagem foi removida.', '🗑️');
    }
}

// FUNÇÕES DE DEPOIMENTOS

// Enviar depoimento
function sendTestimonial(event) {
    event.preventDefault();
    
    const form = event.target;
    const messageInput = form.querySelector('#testimonialMessage');
    const message = messageInput.value.trim();
    
    if (!message) {
        showError('Digite uma mensagem para o depoimento.');
        return;
    }
    
    // Simular envio (normalmente seria para outro usuário)
    showNotification('Depoimento enviado!', 'O depoimento foi enviado e aguarda aprovação.', '⭐');
    messageInput.value = '';
}

// Carregar depoimentos
function loadTestimonials() {
    const container = document.getElementById('testimonialsList');
    if (!container) return;
    
    const testimonials = [
        {
            id: 1,
            author: 'Maria Santos',
            authorPhoto: 'https://via.placeholder.com/48x48/ff6bb3/ffffff?text=M',
            content: 'Uma pessoa incrível! Sempre disposta a ajudar e com um coração enorme. É um privilégio ter você como amiga! 💜',
            date: '2 dias atrás'
        },
        {
            id: 2,
            author: 'João Silva',
            authorPhoto: 'https://via.placeholder.com/48x48/28a745/ffffff?text=J',
            content: 'Conheci essa pessoa há alguns anos e posso dizer que é uma das mais especiais que já encontrei. Inteligente, divertida e leal!',
            date: '1 semana atrás'
        }
    ];
    
    container.innerHTML = testimonials.map(testimonial => `
        <div class="testimonial-item">
            <div class="testimonial-header">
                <img src="${testimonial.authorPhoto}" alt="${testimonial.author}">
                <div>
                    <span class="testimonial-author">${testimonial.author}</span>
                    <span class="testimonial-date">${testimonial.date}</span>
                </div>
            </div>
            <div class="testimonial-content">${testimonial.content}</div>
        </div>
    `).join('');
}

// FUNÇÕES DE FOTOS

// Carregar grid de fotos
function loadPhotosGrid() {
    const container = document.getElementById('photosGrid');
    if (!container) return;
    
    const photos = [
        'https://via.placeholder.com/150x150/a855c7/ffffff?text=Foto1',
        'https://via.placeholder.com/150x150/ff6bb3/ffffff?text=Foto2',
        'https://via.placeholder.com/150x150/5bc0de/ffffff?text=Foto3',
        'https://via.placeholder.com/150x150/28a745/ffffff?text=Foto4',
        'https://via.placeholder.com/150x150/ffc107/ffffff?text=Foto5',
        'https://via.placeholder.com/150x150/dc3545/ffffff?text=Foto6'
    ];
    
    container.innerHTML = photos.map((photo, index) => `
        <div class="photo-item" onclick="viewPhoto('${photo}')">
            <img src="${photo}" alt="Foto ${index + 1}">
            <div class="photo-overlay">
                <span>👁️</span>
            </div>
        </div>
    `).join('');
}

// Upload de nova foto
function uploadPhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = handlePhotosBulkUpload;
    input.click();
}

// Upload múltiplo de fotos
function handlePhotosBulkUpload(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    files.forEach(file => {
        if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onload = function(e) {
                addPhotoToGrid(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
    
    showNotification('Fotos adicionadas!', `${files.length} foto(s) foram adicionadas ao seu álbum.`, '📷');
}

// Adicionar foto ao grid
function addPhotoToGrid(photoData) {
    const container = document.getElementById('photosGrid');
    if (!container) return;
    
    const photoHTML = `
        <div class="photo-item fade-in" onclick="viewPhoto('${photoData}')">
            <img src="${photoData}" alt="Nova foto">
            <div class="photo-overlay">
                <span>👁️</span>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('afterbegin', photoHTML);
}

// Visualizar foto
function viewPhoto(photoSrc) {
    // Criar modal de visualização
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 90%; max-height: 90%;">
            <div class="modal-header">
                <h3>Visualizar Foto</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body" style="text-align: center;">
                <img src="${photoSrc}" alt="Foto" style="max-width: 100%; max-height: 70vh; border-radius: 10px;">
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Fechar ao clicar fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    });
}

// FUNÇÕES AUXILIARES

// Configurar contadores de caracteres
function setupCharacterCounters() {
    const textareas = document.querySelectorAll('textarea[maxlength]');
    textareas.forEach(textarea => {
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.innerHTML = `<span class="current">0</span>/${textarea.maxLength} caracteres`;
        textarea.parentNode.appendChild(counter);
        
        textarea.addEventListener('input', function() {
            const current = counter.querySelector('.current');
            current.textContent = this.value.length;
            
            if (this.value.length > this.maxLength * 0.9) {
                counter.style.color = '#dc3545';
            } else {
                counter.style.color = 'var(--text-light)';
            }
        });
    });
}

// Atualizar contador de caracteres
function updateCharacterCount(event) {
    const textarea = event.target;
    const counter = textarea.parentNode.querySelector('.char-counter .current');
    if (counter) {
        counter.textContent = textarea.value.length;
    }
}

// Auto-save para campos editáveis
function autoSaveField(event) {
    const field = event.target;
    const fieldName = field.getAttribute('data-field');
    
    if (fieldName && currentProfile && field.value !== currentProfile[fieldName]) {
        currentProfile[fieldName] = field.value;
        localStorage.setItem('orkutUser', JSON.stringify(currentProfile));
        
        // Feedback visual sutil
        field.style.backgroundColor = '#d4edda';
        setTimeout(() => {
            field.style.backgroundColor = '';
        }, 1000);
    }
}

// Atualizar estatísticas do perfil
function updateProfileStats() {
    // Simular incremento de visualizações
    if (currentProfile) {
        currentProfile.profileViews = (currentProfile.profileViews || 0) + 1;
        updateElement('profileViews', currentProfile.profileViews);
        localStorage.setItem('orkutUser', JSON.stringify(currentProfile));
    }
}

// Formatar data para input
function formatDateForInput(dateString) {
    if (!dateString) return '';
    
    // Converter "15 de março" para formato YYYY-MM-DD
    const months = {
        'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
        'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
        'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
    };
    
    const parts = dateString.toLowerCase().split(' de ');
    if (parts.length === 2) {
        const day = parts[0].padStart(2, '0');
        const month = months[parts[1]] || '01';
        const year = new Date().getFullYear();
        return `${year}-${month}-${day}`;
    }
    
    return '';
}

// Formatar data para exibição
function formatDateForDisplay(dateInput) {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    
    return `${day} de ${month}`;
}

// Visualizar perfil completo
function viewFullProfile() {
    showNotification('Em breve!', 'A visualização completa do perfil estará disponível em breve.', '🔍');
}

// Gerenciar amigos
function manageFriends() {
    showNotification('Em desenvolvimento', 'A funcionalidade de gerenciar amigos está sendo desenvolvida.', '👥');
}

// Navegar para comunidades
function browseCommunities() {
    window.location.href = 'communities.html';
}

// Mostrar erro
function showError(message) {
    showNotification('Erro', message, '❌');
}

// FUNCIONALIDADES AVANÇADAS

// Configurar drag & drop para fotos
function setupDragAndDrop() {
    const photosGrid = document.getElementById('photosGrid');
    if (!photosGrid) return;
    
    // Criar zona de drop
    const dropZone = document.createElement('div');
    dropZone.className = 'photo-dropzone';
    dropZone.innerHTML = `
        <div class="upload-icon">📷</div>
        <p>Arraste fotos aqui ou <button class="btn btn-light btn-sm" onclick="uploadPhoto()">clique para escolher</button></p>
        <small>Máximo 5MB por foto</small>
    `;
    
    photosGrid.parentNode.insertBefore(dropZone, photosGrid);
    
    // Event listeners para drag & drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight(e) {
        dropZone.classList.add('dragover');
    }
    
    function unhighlight(e) {
        dropZone.classList.remove('dragover');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        handlePhotosBulkUpload({ target: { files } });
    }
}

// Edição inline de campos
function setupInlineEditing() {
    const editableFields = ['profileName', 'profileStatus', 'profileLocation'];
    
    editableFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.classList.add('editable-field');
            element.setAttribute('data-tooltip', 'Clique para editar');
            element.addEventListener('click', () => enableInlineEdit(fieldId));
        }
    });
}

// Habilitar edição inline
function enableInlineEdit(fieldId) {
    const element = document.getElementById(fieldId);
    if (!element || element.classList.contains('editing')) return;
    
    const currentValue = element.textContent.replace(/"/g, ''); // Remove aspas do status
    const isTextarea = fieldId === 'profileBio';
    
    // Criar input/textarea
    const input = document.createElement(isTextarea ? 'textarea' : 'input');
    input.value = currentValue;
    input.className = 'inline-editor';
    input.style.cssText = `
        width: 100%;
        border: 2px solid var(--primary-purple);
        border-radius: 4px;
        padding: 4px 8px;
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        color: inherit;
        background: white;
        outline: none;
    `;
    
    if (isTextarea) {
        input.rows = 3;
        input.maxLength = 500;
    }
    
    // Substituir elemento
    element.classList.add('editing');
    element.style.display = 'none';
    element.parentNode.insertBefore(input, element.nextSibling);
    
    input.focus();
    input.select();
    
    // Salvar com Enter ou perder foco
    input.addEventListener('blur', () => saveInlineEdit(fieldId, input));
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveInlineEdit(fieldId, input);
        }
        if (e.key === 'Escape') {
            cancelInlineEdit(fieldId, input);
        }
    });
}

// Salvar edição inline
function saveInlineEdit(fieldId, input) {
    const element = document.getElementById(fieldId);
    const newValue = input.value.trim();
    
    if (newValue && newValue !== element.textContent.replace(/"/g, '')) {
        // Atualizar dados do perfil
        const fieldMap = {
            'profileName': 'name',
            'profileStatus': 'status',
            'profileLocation': 'location'
        };
        
        const profileField = fieldMap[fieldId];
        if (profileField && currentProfile) {
            currentProfile[profileField] = newValue;
            localStorage.setItem('orkutUser', JSON.stringify(currentProfile));
            
            // Atualizar exibição
            const displayValue = profileField === 'status' ? `"${newValue}"` : newValue;
            element.textContent = displayValue;
            
            // Feedback visual
            showSavingIndicator();
        }
    }
    
    // Restaurar interface
    element.style.display = '';
    element.classList.remove('editing');
    input.remove();
}

// Cancelar edição inline
function cancelInlineEdit(fieldId, input) {
    const element = document.getElementById(fieldId);
    element.style.display = '';
    element.classList.remove('editing');
    input.remove();
}

// Mostrar indicador de salvamento
function showSavingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'saving-indicator';
    indicator.textContent = '✅ Salvo automaticamente';
    
    document.body.appendChild(indicator);
    
    setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 300);
    }, 2000);
}

// Configurar teclas de atalho
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + E = Editar perfil
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            editProfile();
        }
        
        // Ctrl/Cmd + U = Upload foto
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            uploadPhoto();
        }
        
        // Ctrl/Cmd + B = Editar bio
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            editBio();
        }
    });
}

// Validação avançada de fotos
function validatePhoto(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const errors = [];
    
    if (!validTypes.includes(file.type)) {
        errors.push('Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP.');
    }
    
    if (file.size > maxSize) {
        errors.push('Arquivo muito grande. Máximo 5MB.');
    }
    
    return errors;
}

// Redimensionar foto antes do upload
function resizePhoto(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calcular novas dimensões
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }
            
            // Redimensionar
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
}

// Exportar dados do perfil
function exportProfile() {
    if (!currentProfile) return;
    
    const exportData = {
        ...currentProfile,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `perfil-orkut-${currentProfile.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    
    showNotification('Perfil exportado!', 'Seus dados foram salvos em arquivo JSON.', '💾');
}

// Importar dados do perfil
function importProfile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.name && data.email) {
                    currentProfile = { ...currentProfile, ...data };
                    localStorage.setItem('orkutUser', JSON.stringify(currentProfile));
                    
                    updateProfileDisplay();
                    showNotification('Perfil importado!', 'Seus dados foram carregados com sucesso.', '📥');
                } else {
                    throw new Error('Arquivo inválido');
                }
            } catch (error) {
                showError('Erro ao importar perfil. Verifique se o arquivo é válido.');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Estatísticas do perfil
function updateDetailedStats() {
    if (!currentProfile) return;
    
    // Simular dados mais detalhados
    const stats = {
        profileViews: currentProfile.profileViews || 0,
        scrapsReceived: Math.floor(Math.random() * 50) + 10,
        testimonialsReceived: Math.floor(Math.random() * 20) + 5,
        photosUploaded: Math.floor(Math.random() * 30) + 10,
        communitiesJoined: Math.floor(Math.random() * 15) + 5,
        friendsAdded: currentProfile.friendsCount || 0
    };
    
    // Atualizar contadores se existirem elementos específicos
    Object.keys(stats).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = stats[key];
        }
    });
}

// Inicializar funcionalidades avançadas
function initializeAdvancedFeatures() {
    setupDragAndDrop();
    setupInlineEditing();
    setupKeyboardShortcuts();
    updateDetailedStats();
}

// Chamar funcionalidades avançadas após carregamento
if (getCurrentPage() === 'profile') {
    setTimeout(initializeAdvancedFeatures, 1000);
}

// Adicionar estilos dinâmicos
const profileStyles = `
    .bio-editor {
        animation: fadeIn 0.3s ease-out;
    }
    
    .bio-actions {
        animation: slideUp 0.3s ease-out;
    }
    
    .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.3s ease;
        margin-left: 10px;
    }
    
    .btn-icon:hover {
        opacity: 1;
    }
    
    .scrap-actions {
        margin-left: auto;
    }
    
    .inline-editor {
        animation: fadeIn 0.2s ease-out;
    }
    
    .editable-field {
        transition: all 0.3s ease;
        border-radius: 4px;
        padding: 2px 4px;
        margin: -2px -4px;
    }
    
    .editable-field:hover {
        background: rgba(168, 85, 199, 0.1);
        cursor: pointer;
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.9); }
    }
`;

// Adicionar estilos ao documento
const styleSheet = document.createElement('style');
styleSheet.textContent = profileStyles;
document.head.appendChild(styleSheet);
