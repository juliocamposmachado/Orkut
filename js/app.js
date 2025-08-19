// Orkut Retrô - Aplicação Principal
// Sistema básico de rede social estática integrada com Supabase

// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

function generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
}

// Estado global da aplicação
window.OrkutApp = {
    initialized: false,
    user: null,
    notifications: [],
    lastActivity: new Date(),
    sessionId: generateId(),
    
    // Métricas de engajamento
    metrics: {
        profileViews: 0,
        postsCreated: 0,
        interactions: 0,
        timeSpent: 0,
        lastLogin: new Date()
    }
};

// =============================================================================
// INICIALIZAÇÃO DO SISTEMA
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Orkut Retrô...');
    initializeOrkutApp();
});

async function initializeOrkutApp() {
    try {
        // 1. Carregar dados do usuário
        await loadUserData();
        
        // 2. Configurar interações básicas
        setupBasicInteractions();
        
        // 3. Configurar monitoramento de atividade
        setupActivityMonitoring();
        
        console.log('✅ Orkut Retrô inicializado com sucesso!');
        OrkutApp.initialized = true;
        
    } catch (error) {
        console.error('❌ Erro ao inicializar Orkut App:', error);
        showError('Erro ao inicializar sistema');
    }
}

// =============================================================================
// FUNÇÕES BÁSICAS
// =============================================================================

async function loadUserData() {
    // Tenta carregar dados do usuário do localStorage primeiro
    const savedUser = localStorage.getItem('orkut_user');
    if (savedUser) {
        OrkutApp.user = JSON.parse(savedUser);
        console.log('👤 Dados do usuário carregados do localStorage');
        return;
    }
    
    // Se não há usuário salvo, cria um usuário padrão
    OrkutApp.user = {
        id: generateId(),
        name: 'Usuário',
        email: 'user@orkut.com',
        status: 'Bem-vindo ao Orkut Retrô! 💜',
        age: null,
        location: null,
        friendsCount: 0,
        profileViews: Math.floor(Math.random() * 100) + 50,
        avatar: 'images/orkutblack.png',
        createdAt: new Date().toISOString()
    };
    
    // Salva no localStorage
    localStorage.setItem('orkut_user', JSON.stringify(OrkutApp.user));
    console.log('👤 Usuário padrão criado');
}

function setupBasicInteractions() {
    // Configurar listeners para funcionalidades básicas
    setupNavigationListeners();
    setupModalListeners();
    setupFormListeners();
}

function setupNavigationListeners() {
    // Monitorar cliques em links de navegação
    const navLinks = document.querySelectorAll('.nav-menu a, .sidebar-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            updateLastActivity();
        });
    });
}

function setupModalListeners() {
    // Configurar modais
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-bg') || e.target.classList.contains('close-btn')) {
            closeModal(e.target.closest('.modal'));
        }
    });
    
    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal:not(.hidden)');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });
}

function setupFormListeners() {
    // Listeners para formulários básicos
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            updateLastActivity();
            // Adicionar lógica de formulário aqui se necessário
        });
    });
}

function setupActivityMonitoring() {
    // Monitorar atividade do usuário
    let activityTimer;
    
    function resetActivityTimer() {
        clearTimeout(activityTimer);
        updateLastActivity();
        
        // Auto-save dados do usuário a cada 5 minutos de atividade
        activityTimer = setTimeout(() => {
            saveUserActivity();
        }, 5 * 60 * 1000);
    }
    
    // Eventos que indicam atividade
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
        document.addEventListener(event, resetActivityTimer, true);
    });
    
    // Salvar dados ao sair da página
    window.addEventListener('beforeunload', () => {
        saveUserActivity();
    });
}

// =============================================================================
// FUNÇÕES AUXILIARES (CONTINUAÇÃO)
// =============================================================================

function updateLastActivity() {
    OrkutApp.lastActivity = new Date();
    OrkutApp.metrics.timeSpent += 1;
}

function saveUserActivity() {
    if (OrkutApp.user) {
        localStorage.setItem('orkut_user', JSON.stringify(OrkutApp.user));
        localStorage.setItem('orkut_metrics', JSON.stringify(OrkutApp.metrics));
    }
}

function showError(message) {
    console.error('❌', message);
    
    // Mostrar erro na interface se houver um elemento para isso
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(message) {
    console.log('✅', message);
    
    // Mostrar sucesso na interface se houver um elemento para isso
    const successElement = document.getElementById('successMessage');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }
}

function closeModal(modal) {
    if (typeof modal === 'string') {
        modal = document.getElementById(modal);
    }
    if (modal) {
        modal.classList.add('hidden');
    }
}

function openModal(modal) {
    if (typeof modal === 'string') {
        modal = document.getElementById(modal);
    }
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// =============================================================================
// FUNÇÕES DE PERFIL BÁSICAS
// =============================================================================

function updateProfileStats() {
    const user = OrkutApp.user;
    if (!user) return;
    
    // Atualizar estatísticas na interface
    const profileViews = document.getElementById('profileViews');
    const friendsCount = document.getElementById('friendsCount');
    const profileName = document.getElementById('profileName');
    const profileStatus = document.getElementById('profileStatus');
    
    if (profileViews) profileViews.textContent = user.profileViews || 0;
    if (friendsCount) friendsCount.textContent = user.friendsCount || 0;
    if (profileName) profileName.textContent = user.name || 'Usuário';
    if (profileStatus) profileStatus.textContent = user.status || 'Bem-vindo ao Orkut!';
}

// =============================================================================
// FUNÇÕES DE NAVEGAÇÃO
// =============================================================================

function logout() {
    // Salvar dados antes de sair
    saveUserActivity();
    
    // Limpar dados da sessão
    OrkutApp.user = null;
    OrkutApp.initialized = false;
    
    // Redirecionar para página de login
    window.location.href = 'index.html';
}

// =============================================================================
// INICIALIZAÇÃO DE FUNCIONALIDADES ESPECÍFICAS DE PÁGINA
// =============================================================================

// Função chamada quando a página carrega completamente
window.addEventListener('load', () => {
    // Atualizar interface com dados do usuário
    updateProfileStats();
    
    // Aplicar foto de perfil se houver
    const profilePhoto = document.getElementById('profilePhoto');
    if (profilePhoto && OrkutApp.user && OrkutApp.user.avatar) {
        profilePhoto.src = OrkutApp.user.avatar;
    }
});

// Exportar funções para uso global
window.OrkutUtils = {
    generateId,
    showError,
    showSuccess,
    closeModal,
    openModal,
    updateProfileStats,
    logout
};
