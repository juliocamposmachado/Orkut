// Orkut Retrô - Sistema de Autenticação
// Funções para login, cadastro e gerenciamento de usuários

// Configurações de autenticação
const AuthConfig = {
    minPasswordLength: 6,
    maxLoginAttempts: 5,
    loginAttemptWindow: 15 * 60 * 1000, // 15 minutos
    sessionDuration: 24 * 60 * 60 * 1000 // 24 horas
};

// Estado de tentativas de login
let loginAttempts = {
    count: 0,
    lastAttempt: 0
};

// Inicialização do sistema de auth
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    setupAuthEventListeners();
});

// Inicializar sistema de autenticação
function initializeAuth() {
    // Verificar tentativas de login salvas
    const savedAttempts = localStorage.getItem('loginAttempts');
    if (savedAttempts) {
        loginAttempts = JSON.parse(savedAttempts);
        
        // Limpar tentativas antigas
        const now = Date.now();
        if (now - loginAttempts.lastAttempt > AuthConfig.loginAttemptWindow) {
            loginAttempts = { count: 0, lastAttempt: 0 };
            localStorage.removeItem('loginAttempts');
        }
    }
    
    // Verificar se já está logado
    checkExistingSession();
}

// Configurar event listeners de autenticação
function setupAuthEventListeners() {
    // Alternar entre login e cadastro
    const loginToggle = document.querySelectorAll('[data-toggle="login"]');
    const registerToggle = document.querySelectorAll('[data-toggle="register"]');
    
    loginToggle.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showLogin();
        });
    });
    
    registerToggle.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showRegister();
        });
    });
    
    // Validação em tempo real
    setupRealTimeValidation();
    
    // Auto-completar campos salvos
    setupAutoComplete();
}

// Verificar sessão existente
function checkExistingSession() {
    const savedUser = localStorage.getItem('orkutUser');
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    
    if (savedUser && sessionExpiry) {
        const now = Date.now();
        if (now < parseInt(sessionExpiry)) {
            // Sessão válida, redirecionar para home
            if (getCurrentPage() === 'index') {
                window.location.href = 'home.html';
            }
            return true;
        } else {
            // Sessão expirada
            clearSession();
        }
    }
    
    return false;
}

// Alternar para tela de login
function showLogin() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm && registerForm) {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        
        // Focus no primeiro campo
        const firstInput = loginForm.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

// Alternar para tela de cadastro
function showRegister() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm && registerForm) {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        
        // Focus no primeiro campo
        const firstInput = registerForm.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

// Processar login (funcionamento offline)
function handleLogin(event) {
    event.preventDefault();
    
    // Verificar se não há muitas tentativas
    if (loginAttempts.count >= AuthConfig.maxLoginAttempts) {
        const timeLeft = AuthConfig.loginAttemptWindow - (Date.now() - loginAttempts.lastAttempt);
        if (timeLeft > 0) {
            const minutesLeft = Math.ceil(timeLeft / 60000);
            showError('Muitas tentativas de login. Tente novamente em ' + minutesLeft + ' minutos.');
            return;
        } else {
            // Reset tentativas
            loginAttempts = { count: 0, lastAttempt: 0 };
            localStorage.removeItem('loginAttempts');
        }
    }
    
    const form = event.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = formData.get('remember');
    
    // Validações básicas
    if (!validateEmail(email)) {
        showError('Por favor, insira um e-mail válido.');
        return;
    }
    
    if (!password || password.length < AuthConfig.minPasswordLength) {
        showError('Por favor, insira uma senha válida.');
        return;
    }
    
    // Mostrar loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Entrando...';
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Simular processo de login (funciona offline)
    setTimeout(() => {
        // Para demo, aceitar qualquer email/senha válida
        if (simulateLogin(email, password)) {
            // Criar sessão local
            const user = createUserSession(email);
            
            if (rememberMe) {
                localStorage.setItem('rememberEmail', email);
            } else {
                localStorage.removeItem('rememberEmail');
            }
            
            // Reset tentativas de login
            loginAttempts = { count: 0, lastAttempt: 0 };
            localStorage.removeItem('loginAttempts');
            
            // Definir expiração da sessão (7 dias ou 30 dias se remember)
            const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
            const sessionExpiry = Date.now() + sessionDuration;
            localStorage.setItem('sessionExpiry', sessionExpiry.toString());
            
            // Notificação de sucesso
            showSuccess('Login realizado com sucesso! Bem-vindo(a) de volta!');
            
            console.log('✅ Login realizado para:', user.name);
            
            // Redirecionar após pequeno delay
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
            
        } else {
            // Login falhou
            loginAttempts.count++;
            loginAttempts.lastAttempt = Date.now();
            localStorage.setItem('loginAttempts', JSON.stringify(loginAttempts));
            
            const remainingAttempts = AuthConfig.maxLoginAttempts - loginAttempts.count;
            if (remainingAttempts > 0) {
                showError(`Credenciais inválidas. ${remainingAttempts} tentativas restantes.`);
            } else {
                showError('Muitas tentativas de login incorretas. Conta temporariamente bloqueada.');
            }
        }
        
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
    }, 1200); // Simular delay de rede
}

// Processar cadastro usando AI Database Manager
function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const photo = formData.get('photo');
    
    // Validações básicas
    const validationErrors = [];
    
    if (!name || name.length < 2) {
        validationErrors.push('Nome deve ter pelo menos 2 caracteres.');
    }
    
    if (!validateEmail(email)) {
        validationErrors.push('Por favor, insira um e-mail válido.');
    }
    
    if (!password || password.length < AuthConfig.minPasswordLength) {
        validationErrors.push(`Senha deve ter pelo menos ${AuthConfig.minPasswordLength} caracteres.`);
    }
    
    if (password !== confirmPassword) {
        validationErrors.push('Senhas não conferem.');
    }
    
    if (!validatePassword(password)) {
        validationErrors.push('Senha deve conter pelo menos uma letra e um número.');
    }
    
    // Verificar se já existe usuário com este email localmente
    const existingUser = localStorage.getItem('orkut_user');
    if (existingUser) {
        const user = JSON.parse(existingUser);
        if (user.email === email) {
            validationErrors.push('Já existe um usuário com este email.');
        }
    }
    
    if (validationErrors.length > 0) {
        showError(validationErrors.join('<br>'));
        return;
    }
    
    // Mostrar loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Criando conta...';
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Processar foto se houver
    if (photo && photo.size > 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
            processRegisterWithAI(name, email, password, e.target.result, submitBtn, originalText);
        };
        reader.readAsDataURL(photo);
    } else {
        processRegisterWithAI(name, email, password, null, submitBtn, originalText);
    }
}

// Processar registro com AI Database Manager
function processRegisterWithAI(name, email, password, photo, submitBtn, originalText) {
    const userData = {
        name: name,
        email: email,
        password: password,
        photo: photo,
        username: generateUsername(name),
        status: 'Novo no Orkut Retrô! 🎉',
        created_at: new Date().toISOString(),
        profile_views: 0,
        friends_count: 0,
        fans_count: 0
    };
    
    // Salvar dados localmente primeiro (UX rápida)
    const user = createUserSession(email, name, userData);
    
    console.log('👤 Usuário criado localmente, processando com IA...');
    
    // Disparar evento para AI Database Manager
    window.dispatchEvent(new CustomEvent('user_register_attempt', {
        detail: userData
    }));
    
    // Simular sucesso imediato
    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        showSuccess('Conta criada com sucesso! Processando no servidor...');
        
        // Redirecionar para home
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1500);
    }, 1000);
}

// Função para enviar requisição de cadastro
function sendRegisterRequest(registerData, submitBtn, originalText) {
    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
    })
    .then(response => response.json())
    .then(data => {
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        if (data.success) {
            // Cadastro bem-sucedido
            const user = data.data.user;
            const token = data.data.token;
            
            // Salvar token e usuário
            localStorage.setItem('orkutToken', token);
            localStorage.setItem('orkutUser', JSON.stringify(user));
            
            // Definir expiração da sessão (7 dias)
            const sessionExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000);
            localStorage.setItem('sessionExpiry', sessionExpiry.toString());
            
            showSuccess(data.message || 'Conta criada com sucesso! Seja bem-vindo(a) ao Orkut Retrô!');
            
            // Redirecionar
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 2000);
            
        } else {
            showError(data.details || 'Erro ao criar conta. Tente novamente.');
        }
    })
    .catch(error => {
        console.error('Erro no cadastro:', error);
        
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        showError('Erro de conexão. Verifique sua internet e tente novamente.');
    });
}

// Simular login (em produção, seria uma chamada para API)
function simulateLogin(email, password) {
    // Aceitar qualquer email/senha válido para demo
    return validateEmail(email) && password.length >= AuthConfig.minPasswordLength;
}

// Simular cadastro
function simulateRegister(name, email, password, photo) {
    // Simular sucesso para demo
    return true;
}

// Verificar se email existe (simulação)
function emailExists(email) {
    // Para demo, simular que alguns emails já existem
    const existingEmails = ['admin@orkut.com', 'teste@teste.com'];
    return existingEmails.includes(email.toLowerCase());
}

// Criar sessão de usuário
function createUserSession(email, name = null, userData = null) {
    const userName = name || getUserNameFromEmail(email);
    
    // Usar dados fornecidos ou criar padrão
    const user = userData ? {
        ...userData,
        id: generateUserId(),
        username: userData.username || generateUsername(userName),
        email: email,
        name: userName,
        joinDate: new Date().toISOString()
    } : {
        id: generateUserId(),
        name: userName,
        username: generateUsername(userName),
        email: email,
        photo: `images/orkutblack.png`, // Usar foto padrão local
        status: 'Novo no Orkut Retrô! 🎉',
        age: null,
        location: '',
        relationship: '',
        birthday: '',
        bio: '',
        profileViews: Math.floor(Math.random() * 50) + 1,
        friendsCount: 0,
        fansCount: 0,
        joinDate: new Date().toISOString()
    };
    
    // Salvar usuário
    localStorage.setItem('orkutUser', JSON.stringify(user));
    localStorage.setItem('orkut_user', JSON.stringify(user)); // Para compatibilidade
    
    // Definir expiração da sessão
    const sessionExpiry = Date.now() + AuthConfig.sessionDuration;
    localStorage.setItem('sessionExpiry', sessionExpiry.toString());
    
    // Atualizar estado global
    if (window.OrkutApp) {
        window.OrkutApp.user = user;
        window.OrkutApp.initialized = true;
    }
    
    console.log('💾 Sessão de usuário criada:', user.name);
    return user;
}

// Gerar ID único para usuário
function generateUserId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Extrair nome do email
function getUserNameFromEmail(email) {
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
}

// Gerar username único
function generateUsername(name) {
    if (!name) return 'user' + Math.random().toString(36).substr(2, 6);
    
    // Remover acentos e caracteres especiais
    const baseUsername = name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9]/g, '_') // Substitui caracteres especiais por _
        .replace(/_+/g, '_') // Remove underscores duplicados
        .replace(/^_|_$/g, '') // Remove underscores do início e fim
        .substring(0, 15); // Limita a 15 caracteres
    
    // Se o username já existe, adicionar números
    let username = baseUsername;
    let counter = 1;
    
    while (usernameExists(username)) {
        username = baseUsername + counter;
        counter++;
        if (counter > 999) break; // Evitar loop infinito
    }
    
    return username || 'user' + Math.random().toString(36).substr(2, 6);
}

// Verificar se username existe (simulação)
function usernameExists(username) {
    // Lista de usernames reservados/existentes para simulação
    const existingUsernames = ['admin', 'root', 'orkut', 'ana_silva', 'carlos_santos', 'maria_oliveira'];
    return existingUsernames.includes(username.toLowerCase());
}

// Validar username
function validateUsername(username) {
    if (!username) return { valid: false, message: 'Nome de usuário é obrigatório.' };
    
    // Verificar padrão
    const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernamePattern.test(username)) {
        return { 
            valid: false, 
            message: 'Nome de usuário deve ter 3-20 caracteres, apenas letras, números e underline (_).' 
        };
    }
    
    // Verificar se não começa ou termina com underscore
    if (username.startsWith('_') || username.endsWith('_')) {
        return { valid: false, message: 'Nome de usuário não pode começar ou terminar com _.' };
    }
    
    // Verificar se não é apenas números
    if (/^[0-9]+$/.test(username)) {
        return { valid: false, message: 'Nome de usuário deve conter pelo menos uma letra.' };
    }
    
    // Verificar palavras reservadas
    const reservedWords = ['admin', 'root', 'api', 'www', 'mail', 'ftp', 'orkut', 'moderador'];
    if (reservedWords.includes(username.toLowerCase())) {
        return { valid: false, message: 'Este nome de usuário está reservado.' };
    }
    
    // Verificar se já existe
    if (usernameExists(username)) {
        return { valid: false, message: 'Este nome de usuário já está em uso.' };
    }
    
    return { valid: true, message: 'Nome de usuário disponível!' };
}

// Limpar sessão
function clearSession() {
    localStorage.removeItem('orkutUser');
    localStorage.removeItem('sessionExpiry');
    
    if (window.OrkutRetro) {
        window.OrkutRetro.currentUser = null;
        window.OrkutRetro.isLoggedIn = false;
    }
}

// Validações
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    // Deve ter pelo menos uma letra e um número
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasLetter && hasNumber;
}

// Validação em tempo real
function setupRealTimeValidation() {
    // Email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                showFieldError(this, 'E-mail inválido');
            } else {
                clearFieldError(this);
            }
        });
    });
    
    // Password validation
    const passwordInputs = document.querySelectorAll('input[name="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', function() {
            const strength = getPasswordStrength(this.value);
            showPasswordStrength(this, strength);
        });
    });
    
    // Confirm password validation
    const confirmInputs = document.querySelectorAll('input[name="confirmPassword"]');
    confirmInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const password = this.form.querySelector('input[name="password"]').value;
            if (this.value && this.value !== password) {
                showFieldError(this, 'Senhas não conferem');
            } else {
                clearFieldError(this);
            }
        });
    });
}

// Mostrar erro em campo específico
function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
    field.classList.add('error');
}

// Limpar erro de campo
function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.classList.remove('error');
}

// Mostrar força da senha
function showPasswordStrength(field, strength) {
    let existingMeter = field.parentNode.querySelector('.password-strength');
    
    if (!existingMeter) {
        existingMeter = document.createElement('div');
        existingMeter.className = 'password-strength';
        field.parentNode.appendChild(existingMeter);
    }
    
    existingMeter.innerHTML = `
        <div class="strength-meter">
            <div class="strength-bar strength-${strength.level}"></div>
        </div>
        <span class="strength-text">${strength.text}</span>
    `;
}

// Calcular força da senha
function getPasswordStrength(password) {
    if (!password) return { level: 0, text: '' };
    
    let score = 0;
    
    // Comprimento
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Caracteres
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 3) return { level: 'weak', text: 'Fraca' };
    if (score < 5) return { level: 'medium', text: 'Média' };
    return { level: 'strong', text: 'Forte' };
}

// Auto-completar
function setupAutoComplete() {
    const rememberEmail = localStorage.getItem('rememberEmail');
    const emailInput = document.querySelector('input[name="email"]');
    
    if (rememberEmail && emailInput && getCurrentPage() === 'index') {
        emailInput.value = rememberEmail;
    }
}

// Funções de feedback visual
function showSuccess(message) {
    showMessage(message, 'success');
}

function showError(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    // Remover mensagens existentes
    const existing = document.querySelector('.auth-message');
    if (existing) existing.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message ${type}`;
    messageDiv.innerHTML = message;
    
    // Inserir no topo da página
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(messageDiv, container.firstChild);
        
        // Auto-remover após 5 segundos (apenas para sucessos)
        if (type === 'success') {
            setTimeout(() => {
                if (messageDiv.parentElement) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }
}
