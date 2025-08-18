// Orkut Retrô - JavaScript Principal
// Arquivo com funcionalidades básicas e utilitárias

// Configurações globais
const OrkutRetro = {
    currentUser: null,
    isLoggedIn: false,
    version: '1.0.0',
    settings: {
        theme: 'default',
        notifications: true,
        autoSave: true
    }
};

// Dados simulados para desenvolvimento
const mockData = {
    currentUser: {
        id: 1,
        name: 'Ana Silva',
        email: 'ana@example.com',
        photo: 'https://via.placeholder.com/150x150/a855c7/ffffff?text=Ana',
        status: 'Revivendo os anos 2000! 💜',
        age: 28,
        location: 'São Paulo, SP',
        relationship: 'solteira',
        birthday: '15 de março',
        bio: 'Apaixonada por nostalgia e tecnologia! Adoro relembrar os anos 2000 e conectar com pessoas que compartilham as mesmas memórias.',
        profileViews: 142,
        friendsCount: 89,
        fansCount: 23
    },
    
    friends: [
        { id: 2, name: 'Carlos Santos', photo: 'https://via.placeholder.com/40x40/5bc0de/ffffff?text=C', online: true },
        { id: 3, name: 'Maria Oliveira', photo: 'https://via.placeholder.com/40x40/ff6bb3/ffffff?text=M', online: false },
        { id: 4, name: 'João Silva', photo: 'https://via.placeholder.com/40x40/28a745/ffffff?text=J', online: true },
        { id: 5, name: 'Paula Costa', photo: 'https://via.placeholder.com/40x40/ffc107/ffffff?text=P', online: false },
        { id: 6, name: 'Ricardo Lima', photo: 'https://via.placeholder.com/40x40/dc3545/ffffff?text=R', online: true }
    ],
    
    communities: [
        {
            id: 1,
            name: 'Nostalgia dos Anos 2000',
            description: 'Para quem sente saudades dos anos 2000! Músicas, filmes, moda e lembranças.',
            category: 'nostalgia',
            members: 1523,
            image: 'https://via.placeholder.com/200x140/a855c7/ffffff?text=2000s',
            joined: true
        },
        {
            id: 2,
            name: 'Orkut Memories',
            description: 'Relembrando os bons tempos do Orkut original.',
            category: 'tecnologia',
            members: 892,
            image: 'https://via.placeholder.com/200x140/ff6bb3/ffffff?text=Orkut',
            joined: false
        },
        {
            id: 3,
            name: 'Pop Rock Nacional',
            description: 'As melhores bandas de pop rock do Brasil.',
            category: 'música',
            members: 2341,
            image: 'https://via.placeholder.com/200x140/5bc0de/ffffff?text=Rock',
            joined: true
        }
    ],
    
    scraps: [
        {
            id: 1,
            author: 'Carlos Santos',
            authorPhoto: 'https://via.placeholder.com/32x32/5bc0de/ffffff?text=C',
            content: 'Que saudades dos anos 2000! Adorei seu perfil retrô! 😍',
            date: '2 horas atrás'
        },
        {
            id: 2,
            author: 'Maria Oliveira',
            authorPhoto: 'https://via.placeholder.com/32x32/ff6bb3/ffffff?text=M',
            content: 'Oiee! Vamos ser amigas? Tenho certeza que vamos nos dar super bem! 💕',
            date: '1 dia atrás'
        }
    ],
    
    messages: [
        {
            id: 1,
            from: 'Carlos Santos',
            fromPhoto: 'https://via.placeholder.com/40x40/5bc0de/ffffff?text=C',
            subject: 'Que tal se encontrarmos?',
            preview: 'Oi Ana! Como vai? Estava pensando se você...',
            date: '2 horas atrás',
            unread: true
        },
        {
            id: 2,
            from: 'João Silva',
            fromPhoto: 'https://via.placeholder.com/40x40/28a745/ffffff?text=J',
            subject: 'Re: Festa de aniversário',
            preview: 'Obrigado pelo convite! Vou estar lá sim...',
            date: '1 dia atrás',
            unread: false
        }
    ]
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadPageContent();
});

// Inicializar aplicação
function initializeApp() {
    // Verificar se está logado
    const saved = localStorage.getItem('orkutUser');
    if (saved) {
        OrkutRetro.currentUser = JSON.parse(saved);
        OrkutRetro.isLoggedIn = true;
    } else {
        // Para desenvolvimento, usar dados mock
        OrkutRetro.currentUser = mockData.currentUser;
        OrkutRetro.isLoggedIn = true;
    }
    
    // Aplicar tema
    applyTheme();
    
    // Setup notificações
    setupNotifications();
}

// Configurar event listeners globais
function setupEventListeners() {
    // Fechar modals ao clicar fora
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    // Tecla ESC fecha modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal:not(.hidden)');
            if (openModal) {
                closeModal(openModal.id);
            }
        }
    });
    
    // Auto-save em formulários
    setupAutoSave();
}

// Carregar conteúdo da página
function loadPageContent() {
    const currentPage = getCurrentPage();
    
    switch(currentPage) {
        case 'profile':
            loadProfileData();
            break;
        case 'communities':
            loadCommunitiesData();
            break;
        case 'messages':
            loadMessagesData();
            break;
        case 'friends':
            loadFriendsData();
            break;
    }
}

// Obter página atual
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1).replace('.html', '');
    return page || 'index';
}

// Funções de Modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Focus no primeiro input se existir
        const firstInput = modal.querySelector('input, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Limpar formulários se existirem
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => {
            if (!form.getAttribute('data-keep-values')) {
                form.reset();
            }
        });
    }
}

// Sistema de tabs
function showTab(tabName) {
    // Desativar todas as tabs
    const allTabs = document.querySelectorAll('.tab-btn');
    const allContent = document.querySelectorAll('.tab-content');
    
    allTabs.forEach(tab => tab.classList.remove('active'));
    allContent.forEach(content => content.classList.remove('active'));
    
    // Ativar tab selecionada
    const activeTab = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    const activeContent = document.getElementById(`${tabName}Tab`);
    
    if (activeTab) activeTab.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
}

// Sistema de notificações
function setupNotifications() {
    if ('Notification' in window && OrkutRetro.settings.notifications) {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

function showNotification(title, message, icon = '💜') {
    if (!OrkutRetro.settings.notifications) return;
    
    // Notificação no navegador
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: '/images/favicon.ico'
        });
    }
    
    // Notificação na página
    showInPageNotification(title, message, icon);
}

function showInPageNotification(title, message, icon) {
    const notification = document.createElement('div');
    notification.className = 'in-page-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icon}</span>
            <div class="notification-text">
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Sistema de temas
function applyTheme(themeName = OrkutRetro.settings.theme) {
    document.documentElement.setAttribute('data-theme', themeName);
    OrkutRetro.settings.theme = themeName;
    saveSettings();
}

// Auto-save
function setupAutoSave() {
    const forms = document.querySelectorAll('form[data-autosave]');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', debounce(() => {
                saveFormData(form.id);
            }, 1000));
        });
    });
}

function saveFormData(formId) {
    const form = document.getElementById(formId);
    if (!form || !OrkutRetro.settings.autoSave) return;
    
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    localStorage.setItem(`form_${formId}`, JSON.stringify(data));
}

function loadFormData(formId) {
    const saved = localStorage.getItem(`form_${formId}`);
    if (!saved) return;
    
    const data = JSON.parse(saved);
    const form = document.getElementById(formId);
    if (!form) return;
    
    Object.keys(data).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            input.value = data[key];
        }
    });
}

// Utilitários
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDate(date) {
    const now = new Date();
    const messageDate = new Date(date);
    const diffTime = Math.abs(now - messageDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} semanas atrás`;
    
    return messageDate.toLocaleDateString('pt-BR');
}

function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Storage functions
function saveSettings() {
    localStorage.setItem('orkutSettings', JSON.stringify(OrkutRetro.settings));
}

function loadSettings() {
    const saved = localStorage.getItem('orkutSettings');
    if (saved) {
        OrkutRetro.settings = { ...OrkutRetro.settings, ...JSON.parse(saved) };
    }
}

function saveUserData() {
    if (OrkutRetro.currentUser) {
        localStorage.setItem('orkutUser', JSON.stringify(OrkutRetro.currentUser));
    }
}

// Funções específicas das páginas
function loadProfileData() {
    if (!OrkutRetro.currentUser) return;
    
    const user = OrkutRetro.currentUser;
    
    // Atualizar dados do perfil
    updateElement('profileName', user.name);
    updateElement('profileStatus', `"${user.status}"`);
    updateElement('profileAge', `${user.age} anos`);
    updateElement('profileLocation', user.location);
    updateElement('profileRelationship', user.relationship);
    updateElement('profileBirthday', user.birthday);
    updateElement('profileBio', user.bio);
    updateElement('profileViews', user.profileViews);
    updateElement('friendsCount', user.friendsCount);
    updateElement('fansCount', user.fansCount);
    
    // Carregar foto de perfil
    const profilePhoto = document.getElementById('profilePhoto');
    if (profilePhoto) {
        profilePhoto.src = user.photo;
    }
    
    // Carregar amigos
    loadTopFriends();
    
    // Carregar scraps
    loadScraps();
    
    // Carregar comunidades
    loadMyCommunities();
}

function loadTopFriends() {
    const container = document.getElementById('topFriends');
    if (!container) return;
    
    const topFriends = mockData.friends.slice(0, 10);
    container.innerHTML = topFriends.map(friend => `
        <div class="friend-item" onclick="viewProfile(${friend.id})">
            <img src="${friend.photo}" alt="${friend.name}">
            <span>${friend.name}</span>
        </div>
    `).join('');
}

function loadScraps() {
    const container = document.getElementById('scrapsList');
    if (!container) return;
    
    container.innerHTML = mockData.scraps.map(scrap => `
        <div class="scrap-item">
            <div class="scrap-header">
                <img src="${scrap.authorPhoto}" alt="${scrap.author}">
                <span class="scrap-author">${scrap.author}</span>
                <span class="scrap-date">${scrap.date}</span>
            </div>
            <div class="scrap-content">${scrap.content}</div>
        </div>
    `).join('');
}

function loadMyCommunities() {
    const container = document.getElementById('myCommunities');
    if (!container) return;
    
    const myCommunities = mockData.communities.filter(c => c.joined);
    container.innerHTML = myCommunities.map(community => `
        <div class="community-item" onclick="viewCommunity(${community.id})">
            <img src="${community.image}" alt="${community.name}">
            <div class="community-info">
                <span class="community-name">${community.name}</span>
                <span class="community-members">${community.members} membros</span>
            </div>
        </div>
    `).join('');
}

// Funções auxiliares
function updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
    }
}

function viewProfile(userId) {
    // Implementar visualização de perfil
    console.log('Viewing profile:', userId);
}

function viewCommunity(communityId) {
    // Implementar visualização de comunidade
    console.log('Viewing community:', communityId);
}

// Funções de logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('orkutUser');
        localStorage.removeItem('orkutSettings');
        window.location.href = 'index.html';
    }
}

// Exportar para uso global
window.OrkutRetro = OrkutRetro;
window.mockData = mockData;
