// Integração Supabase para Orkut Retrô
// Sistema híbrido que mantém todas as funcionalidades originais usando Supabase

// Configuração do Supabase
const SUPABASE_CONFIG = {
    url: 'https://ksskokjrdzqghhuahjpl.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzc2tva2pyZHpxZ2hodWFoanBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDUzMTEsImV4cCI6MjA3MTEyMTMxMX0.tyQ15i2ypP7BW5UCKOkptJFCHo5IDdRD4ojzcmHSpK4'
};

// Inicializar cliente Supabase (usando CDN)
let supabaseClient = null;

// Inicializar Supabase quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    initializeSupabase();
});

// Inicializar cliente Supabase
async function initializeSupabase() {
    try {
        // Carregar Supabase via CDN se não estiver carregado
        if (typeof supabase === 'undefined') {
            await loadSupabaseScript();
        }
        
        // Criar cliente
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
        console.log('✅ Supabase inicializado com sucesso');
        
        // Verificar sessão atual
        await checkSupabaseSession();
        
    } catch (error) {
        console.error('❌ Erro ao inicializar Supabase:', error);
        // Fallback para modo local se Supabase falhar
        console.warn('🔄 Usando modo de fallback local');
    }
}

// Carregar script do Supabase via CDN
function loadSupabaseScript() {
    return new Promise((resolve, reject) => {
        if (typeof supabase !== 'undefined') {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@supabase/supabase-js@2';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Verificar sessão atual do Supabase
async function checkSupabaseSession() {
    if (!supabaseClient) return false;
    
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
            console.error('Erro ao verificar sessão:', error);
            return false;
        }
        
        if (session) {
            // Sessão ativa, atualizar dados locais
            const user = session.user;
            await updateLocalUserFromSupabase(user);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        return false;
    }
}

// Função de login com Supabase
async function supabaseLogin(email, password) {
    if (!supabaseClient) {
        throw new Error('Supabase não inicializado');
    }
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            return {
                success: false,
                message: 'Falha no login',
                details: error.message
            };
        }
        
        if (data.user) {
            // Buscar dados completos do perfil
            const profile = await getOrCreateUserProfile(data.user);
            
            return {
                success: true,
                message: 'Login realizado com sucesso!',
                data: {
                    user: profile,
                    token: data.session?.access_token
                }
            };
        }
        
    } catch (error) {
        console.error('Erro no login:', error);
        return {
            success: false,
            message: 'Erro de conexão',
            details: error.message
        };
    }
}

// Função de registro com Supabase
async function supabaseRegister(name, email, password, photo = null) {
    if (!supabaseClient) {
        throw new Error('Supabase não inicializado');
    }
    
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                    photo_url: photo
                }
            }
        });
        
        if (error) {
            return {
                success: false,
                message: 'Falha no registro',
                details: error.message
            };
        }
        
        if (data.user) {
            // Criar perfil completo
            const profile = await createUserProfile(data.user, name, photo);
            
            return {
                success: true,
                message: 'Conta criada com sucesso!',
                data: {
                    user: profile,
                    token: data.session?.access_token
                }
            };
        }
        
    } catch (error) {
        console.error('Erro no registro:', error);
        return {
            success: false,
            message: 'Erro de conexão',
            details: error.message
        };
    }
}

// Buscar ou criar perfil do usuário
async function getOrCreateUserProfile(supabaseUser) {
    try {
        // Verificar se perfil existe
        let { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('user_id', supabaseUser.id)
            .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = não encontrado
            console.error('Erro ao buscar perfil:', error);
        }
        
        // Se não existe, criar
        if (!profile) {
            profile = await createUserProfile(supabaseUser, supabaseUser.user_metadata?.name);
        }
        
        // Converter para formato compatível
        return formatUserForLocal(supabaseUser, profile);
        
    } catch (error) {
        console.error('Erro ao buscar/criar perfil:', error);
        // Retornar perfil básico em caso de erro
        return formatUserForLocal(supabaseUser, null);
    }
}

// Criar perfil do usuário
async function createUserProfile(supabaseUser, name, photo = null) {
    try {
        const profileData = {
            user_id: supabaseUser.id,
            photo_url: photo || `https://via.placeholder.com/150x150/a855c7/ffffff?text=${name ? name.charAt(0) : 'U'}`,
            status: 'Novo no Orkut Retrô! 🎉',
            profile_views: 0,
            last_active: new Date().toISOString()
        };
        
        const { data, error } = await supabaseClient
            .from('profiles')
            .insert(profileData)
            .select()
            .single();
        
        if (error) {
            console.error('Erro ao criar perfil:', error);
            return profileData; // Retornar dados mesmo se falhou inserir
        }
        
        return data;
        
    } catch (error) {
        console.error('Erro ao criar perfil:', error);
        return null;
    }
}

// Formatar usuário para compatibilidade local
function formatUserForLocal(supabaseUser, profile) {
    const name = supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário';
    
    return {
        id: supabaseUser.id,
        name: name,
        username: generateUsernameFromName(name),
        email: supabaseUser.email,
        photo: profile?.photo_url || `https://via.placeholder.com/150x150/a855c7/ffffff?text=${name.charAt(0)}`,
        status: profile?.status || 'Novo no Orkut Retrô! 🎉',
        age: profile?.age || null,
        location: profile?.location || '',
        relationship: profile?.relationship_status || '',
        birthday: profile?.birthday || '',
        bio: profile?.bio || '',
        profileViews: profile?.profile_views || Math.floor(Math.random() * 50) + 1,
        friendsCount: 0, // TODO: buscar do banco
        fansCount: 0,    // TODO: buscar do banco
        joinDate: supabaseUser.created_at || new Date().toISOString()
    };
}

// Gerar username único baseado no nome
function generateUsernameFromName(name) {
    if (!name) return 'user' + Math.random().toString(36).substr(2, 6);
    
    return name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9]/g, '_') // Substitui caracteres especiais
        .replace(/_+/g, '_') // Remove underscores duplicados
        .replace(/^_|_$/g, '') // Remove underscores das extremidades
        .substring(0, 15); // Limita tamanho
}

// Atualizar dados locais com informações do Supabase
async function updateLocalUserFromSupabase(supabaseUser) {
    try {
        const profile = await getOrCreateUserProfile(supabaseUser);
        
        // Salvar no localStorage para manter compatibilidade
        localStorage.setItem('orkutUser', JSON.stringify(profile));
        
        // Atualizar estado global se existir
        if (window.OrkutRetro) {
            window.OrkutRetro.currentUser = profile;
            window.OrkutRetro.isLoggedIn = true;
        }
        
        // Atualizar elementos da página se existirem
        updatePageUserInfo(profile);
        
    } catch (error) {
        console.error('Erro ao atualizar dados locais:', error);
    }
}

// Atualizar informações do usuário na página
function updatePageUserInfo(user) {
    // Header
    const headerUserName = document.getElementById('headerUserName');
    if (headerUserName) headerUserName.textContent = user.name;
    
    const headerUserPhoto = document.getElementById('headerUserPhoto');
    if (headerUserPhoto) headerUserPhoto.src = user.photo;
    
    // Sidebar
    const sidebarUserName = document.getElementById('sidebarUserName');
    if (sidebarUserName) sidebarUserName.textContent = user.name;
    
    const sidebarUserPhoto = document.getElementById('sidebarUserPhoto');
    if (sidebarUserPhoto) sidebarUserPhoto.src = user.photo;
    
    const sidebarUserStatus = document.getElementById('sidebarUserStatus');
    if (sidebarUserStatus) sidebarUserStatus.textContent = `"${user.status}"`;
    
    // Profile
    const profileName = document.getElementById('profileName');
    if (profileName) profileName.textContent = user.name;
    
    const profilePhoto = document.getElementById('profilePhoto');
    if (profilePhoto) profilePhoto.src = user.photo;
    
    const profileStatus = document.getElementById('profileStatus');
    if (profileStatus) profileStatus.textContent = `"${user.status}"`;
    
    // Stats
    const profileViews = document.getElementById('profileViews');
    if (profileViews) profileViews.textContent = user.profileViews;
    
    const friendsCount = document.getElementById('friendsCount');
    if (friendsCount) friendsCount.textContent = user.friendsCount;
    
    const fansCount = document.getElementById('fansCount');
    if (fansCount) fansCount.textContent = user.fansCount;
}

// Logout do Supabase
async function supabaseLogout() {
    if (!supabaseClient) return;
    
    try {
        const { error } = await supabaseClient.auth.signOut();
        
        if (error) {
            console.error('Erro no logout:', error);
        }
        
        // Limpar dados locais
        localStorage.removeItem('orkutUser');
        localStorage.removeItem('orkutToken');
        localStorage.removeItem('sessionExpiry');
        
        // Redirecionar para login
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Erro no logout:', error);
        // Forçar logout local mesmo se Supabase falhar
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

// Atualizar perfil no Supabase
async function updateProfile(updates) {
    if (!supabaseClient) {
        console.warn('Supabase não disponível, usando localStorage');
        updateProfileLocally(updates);
        return;
    }
    
    try {
        const user = JSON.parse(localStorage.getItem('orkutUser') || '{}');
        
        const { data, error } = await supabaseClient
            .from('profiles')
            .update({
                ...updates,
                last_active: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .select()
            .single();
        
        if (error) {
            console.error('Erro ao atualizar perfil:', error);
            updateProfileLocally(updates);
            return;
        }
        
        // Atualizar dados locais
        const updatedUser = { ...user, ...updates };
        localStorage.setItem('orkutUser', JSON.stringify(updatedUser));
        updatePageUserInfo(updatedUser);
        
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        updateProfileLocally(updates);
    }
}

// Atualizar perfil apenas localmente (fallback)
function updateProfileLocally(updates) {
    const user = JSON.parse(localStorage.getItem('orkutUser') || '{}');
    const updatedUser = { ...user, ...updates };
    localStorage.setItem('orkutUser', JSON.stringify(updatedUser));
    updatePageUserInfo(updatedUser);
}

// Buscar posts do feed
async function getSupabaseFeed(limit = 20, offset = 0) {
    if (!supabaseClient) {
        return getFallbackFeed();
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('posts')
            .select(`
                *,
                profiles!posts_user_id_fkey(photo_url, status)
            `)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (error) {
            console.error('Erro ao buscar feed:', error);
            return getFallbackFeed();
        }
        
        return data || [];
        
    } catch (error) {
        console.error('Erro ao buscar feed:', error);
        return getFallbackFeed();
    }
}

// Feed de fallback (dados locais/mockados)
function getFallbackFeed() {
    return [
        {
            id: '1',
            user_id: 'system',
            content: '🎉 Bem-vindos ao Orkut Retrô! A nostalgia está de volta!',
            created_at: new Date().toISOString(),
            profiles: {
                photo_url: 'images/orkut.png',
                status: 'Sistema Orkut'
            }
        }
    ];
}

// Integração com sistema de autenticação original
// Sobrescrever funções originais para usar Supabase

// Integrar com handleLogin original
const originalHandleLogin = window.handleLogin;
window.handleLogin = async function(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = formData.get('remember');
    
    // Mostrar loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Entrando...';
    submitBtn.disabled = true;
    
    try {
        const result = await supabaseLogin(email, password);
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        if (result.success) {
            // Salvar dados locais para manter compatibilidade
            localStorage.setItem('orkutUser', JSON.stringify(result.data.user));
            localStorage.setItem('orkutToken', result.data.token || '');
            
            if (rememberMe) {
                localStorage.setItem('rememberEmail', email);
            }
            
            showSuccess(result.message);
            
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
            
        } else {
            showError(result.details || result.message);
        }
        
    } catch (error) {
        console.error('Erro no login:', error);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Fallback para sistema original se Supabase falhar
        if (originalHandleLogin) {
            originalHandleLogin(event);
        } else {
            showError('Erro de conexão. Tente novamente.');
        }
    }
};

// Integrar com logout original
const originalLogout = window.logout;
window.logout = async function() {
    await supabaseLogout();
};

// Verificar se já existe sessão ativa ao carregar
window.addEventListener('load', async function() {
    if (supabaseClient && getCurrentPage() !== 'index') {
        const hasSession = await checkSupabaseSession();
        
        if (!hasSession && !localStorage.getItem('orkutUser')) {
            // Não logado, redirecionar para login
            window.location.href = 'index.html';
        }
    }
});

// Função utilitária para obter página atual
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);
    return page.replace('.html', '') || 'index';
}

console.log('🔗 Integração Supabase carregada');
