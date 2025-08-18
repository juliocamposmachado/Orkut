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

// Processar login
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
    
    if (!password) {
        showError('Por favor, insira sua senha.');
        return;
    }
    
    // Mostrar loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Entrando...';
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Simular requisição de login
    setTimeout(() => {
        const success = simulateLogin(email, password);
        
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        if (success) {
            // Login bem-sucedido
            const user = createUserSession(email);
            
            if (rememberMe) {
                localStorage.setItem('rememberEmail', email);
            } else {
                localStorage.removeItem('rememberEmail');
            }
            
            // Reset tentativas de login
            loginAttempts = { count: 0, lastAttempt: 0 };
            localStorage.removeItem('loginAttempts');
            
            // Notificação de sucesso
            showSuccess('Login realizado com sucesso! Bem-vindo(a) de volta!');
            
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
                showError(`E-mail ou senha incorretos. ${remainingAttempts} tentativas restantes.`);
            } else {
                showError('Muitas tentativas de login incorretas. Conta temporariamente bloqueada.');
            }
        }
    }, 1500); // Simular delay de rede
}

// Processar cadastro
function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const photo = formData.get('photo');
    
    // Validações
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
    
    // Verificar se email já existe (simulação)
    if (emailExists(email)) {
        validationErrors.push('Este e-mail já está cadastrado.');
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
    
    // Simular criação de conta
    setTimeout(() => {
        const success = simulateRegister(name, email, password, photo);
        
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        if (success) {
            // Cadastro bem-sucedido
            showSuccess('Conta criada com sucesso! Seja bem-vindo(a) ao Orkut Retrô!');
            
            // Criar sessão
            const user = createUserSession(email, name);
            
            // Redirecionar
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 2000);
            
        } else {
            showError('Erro ao criar conta. Tente novamente.');
        }
    }, 2000);
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
function createUserSession(email, name = null) {
    const user = {
        id: generateUserId(),
        name: name || getUserNameFromEmail(email),
        email: email,
        photo: `https://via.placeholder.com/150x150/a855c7/ffffff?text=${name ? name.charAt(0) : 'U'}`,
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
    
    // Definir expiração da sessão
    const sessionExpiry = Date.now() + AuthConfig.sessionDuration;
    localStorage.setItem('sessionExpiry', sessionExpiry.toString());
    
    // Atualizar estado global
    if (window.OrkutRetro) {
        window.OrkutRetro.currentUser = user;
        window.OrkutRetro.isLoggedIn = true;
    }
    
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
