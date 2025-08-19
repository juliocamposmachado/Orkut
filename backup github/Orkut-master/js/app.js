// Orkut Retrô - Motor Principal da Aplicação com IA
// Sistema completo de IA assistente para gerenciar a rede social

// Configuração da IA Gemini
const AI_CONFIG = {
    API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
    API_KEY: "AIzaSyB8QXNgbYg6xZWVyYdI8bw64Kr8BmRlWGk",
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.8
};

// Estado global da aplicação
window.OrkutApp = {
    initialized: false,
    user: null,
    ai: null,
    npcs: [],
    notifications: [],
    voiceEnabled: true,
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
    console.log('🚀 Inicializando Orkut App com IA Assistente...');
    initializeOrkutApp();
});

async function initializeOrkutApp() {
    try {
        // 1. Carregar dados do usuário
        await loadUserData();
        
        // 2. Inicializar IA Assistente
        await initializeAIAssistant();
        
        // 3. Criar NPCs com IA
        await createAINPCs();
        
        // 4. Configurar interações em tempo real
        setupRealTimeInteractions();
        
        // 5. Inicializar chat da IA
        setupAIChat();
        
        // 6. Configurar monitoramento
        setupActivityMonitoring();
        
        // 7. Inicializar sistema de voz
        initializeVoiceSystem();
        
        console.log('✅ Orkut App inicializado com sucesso!');
        OrkutApp.initialized = true;
        
        // Primeira interação da IA
        setTimeout(() => {
            aiWelcomeUser();
        }, 2000);
        
    } catch (error) {
        console.error('❌ Erro ao inicializar Orkut App:', error);
        showError('Erro ao inicializar sistema de IA');
    }
}

// =============================================================================
// SISTEMA DE IA ASSISTENTE
// =============================================================================

async function initializeAIAssistant() {
    console.log('🤖 Inicializando IA Assistente...');
    
    OrkutApp.ai = {
        name: 'Orky',
        personality: 'amigável, nostálgica e divertida',
        context: '',
        conversationHistory: [],
        lastInteraction: null,
        isTyping: false,
        
        // Configurações de comportamento
        behaviors: {
            proactive: true,          // Inicia conversas
            suggestPosts: true,       // Sugere postagens
            analyzeProfile: true,     // Analisa perfil do usuário
            manageNotifications: true, // Gerencia notificações
            socialInsights: true      // Dá insights sociais
        }
    };
    
    // Criar contexto da IA baseado no usuário
    await buildAIContext();
    
    console.log('🤖 IA Assistente "Orky" inicializada!');
}

async function buildAIContext() {
    const user = OrkutApp.user;
    if (!user) return;
    
    OrkutApp.ai.context = `
Você é Orky, a assistente de IA do Orkut 2025. Características:

PERSONALIDADE:
- Nostálgica dos anos 2000
- Amigável e divertida
- Usa emojis frequentemente
- Fala de forma descontraída
- Conhece muito sobre a era do Orkut original

USUÁRIO ATUAL:
- Nome: ${user.name}
- Status: ${user.status || 'Sem status'}
- Idade: ${user.age || 'Não informada'}
- Localização: ${user.location || 'Não informada'}
- Amigos: ${user.friendsCount || 0}
- Visitas no perfil: ${user.profileViews || 0}

RESPONSABILIDADES:
1. Ajudar com navegação e funcionalidades
2. Sugerir postagens e interações
3. Criar notificações personalizadas
4. Analisar perfil e dar dicas
5. Gerenciar NPCs e interações automáticas
6. Manter o usuário engajado

REGRAS:
- Seja sempre positiva e motivadora
- Use referências dos anos 2000 quando apropriado
- Mantenha conversas curtas e objetivas
- Adapte-se ao humor e preferências do usuário
- Nunca seja invasiva ou chata
`;
}

// =============================================================================
// SISTEMA DE CHAT COM IA
// =============================================================================

function setupAIChat() {
    // Criar interface do chat se não existir
    if (!document.getElementById('aiChatContainer')) {
        createAIChatInterface();
    }
    
    // Configurar event listeners
    setupChatEventListeners();
}

function createAIChatInterface() {
    const chatHTML = `
    <div id="aiChatContainer" class="ai-chat-container hidden">
        <div class="ai-chat-header">
            <div class="ai-avatar">🤖</div>
            <div class="ai-info">
                <span class="ai-name">Orky - IA Assistente</span>
                <span class="ai-status" id="aiStatus">Online</span>
            </div>
            <div class="chat-controls">
                <button id="voiceToggle" class="voice-btn" title="Ativar/Desativar Voz">🔊</button>
                <button id="minimizeChat" class="minimize-btn" title="Minimizar">➖</button>
                <button id="closeChat" class="close-btn" title="Fechar">✖️</button>
            </div>
        </div>
        
        <div class="ai-chat-messages" id="aiChatMessages">
            <div class="ai-message welcome">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <strong>Orky:</strong> Oi! Sou a Orky, sua assistente de IA! Como posso ajudar você hoje? 😊
                </div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            </div>
        </div>
        
        <div class="ai-chat-input">
            <input type="text" id="aiChatInput" placeholder="Digite sua mensagem..." />
            <button id="sendMessage" class="send-btn">📤</button>
        </div>
        
        <div class="ai-suggestions" id="aiSuggestions">
            <button class="suggestion-btn" onclick="quickAsk('Como está meu perfil?')">📊 Analisar Perfil</button>
            <button class="suggestion-btn" onclick="quickAsk('Sugerir postagem')">✍️ Sugerir Post</button>
            <button class="suggestion-btn" onclick="quickAsk('Dicas de engajamento')">🚀 Dicas</button>
        </div>
    </div>
    
    <!-- Botão flutuante para abrir chat -->
    <button id="aiChatToggle" class="ai-chat-toggle" onclick="toggleAIChat()">
        <div class="chat-icon">🤖</div>
        <div class="notification-badge" id="aiNotificationBadge">0</div>
    </button>
    `;
    
    document.body.insertAdjacentHTML('beforeend', chatHTML);
}

function setupChatEventListeners() {
    const chatInput = document.getElementById('aiChatInput');
    const sendButton = document.getElementById('sendMessage');
    const voiceToggle = document.getElementById('voiceToggle');
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessageToAI();
            }
        });
    }
    
    if (sendButton) {
        sendButton.addEventListener('click', sendMessageToAI);
    }
    
    if (voiceToggle) {
        voiceToggle.addEventListener('click', toggleVoice);
    }
}

// =============================================================================
// INTERAÇÃO COM IA
// =============================================================================

async function sendMessageToAI(message = null) {
    const input = document.getElementById('aiChatInput');
    const userMessage = message || input.value.trim();
    
    if (!userMessage) return;
    
    // Limpar input
    if (input) input.value = '';
    
    // Adicionar mensagem do usuário ao chat
    addMessageToChat('user', userMessage);
    
    // Mostrar que a IA está digitando
    showAITyping();
    
    try {
        // Enviar para a API Gemini
        const response = await callGeminiAPI(userMessage);
        
        // Remover indicador de digitação
        hideAITyping();
        
        // Adicionar resposta da IA
        addMessageToChat('ai', response);
        
        // Reproduzir com voz se ativado
        if (OrkutApp.voiceEnabled) {
            speakText(response);
        }
        
        // Processar ações especiais baseadas na resposta
        await processAIActions(response, userMessage);
        
    } catch (error) {
        hideAITyping();
        addMessageToChat('ai', '❌ Ops! Tive um probleminha. Pode tentar novamente? 😅');
        console.error('Erro na API Gemini:', error);
    }
}

async function callGeminiAPI(userMessage) {
    // Construir histórico da conversa
    const conversationContext = OrkutApp.ai.conversationHistory
        .slice(-10) // Últimas 10 mensagens
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
    
    const prompt = `
${OrkutApp.ai.context}

HISTÓRICO DA CONVERSA:
${conversationContext}

MENSAGEM ATUAL DO USUÁRIO: ${userMessage}

Responda como Orky de forma natural, útil e amigável. Máximo 150 palavras.
`;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: AI_CONFIG.TEMPERATURE,
            maxOutputTokens: AI_CONFIG.MAX_TOKENS
        }
    };
    
    const response = await fetch(`${AI_CONFIG.API_URL}?key=${AI_CONFIG.API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Salvar na história da conversa
    OrkutApp.ai.conversationHistory.push(
        { role: 'user', content: userMessage, timestamp: new Date() },
        { role: 'ai', content: aiResponse, timestamp: new Date() }
    );
    
    return aiResponse;
}

// =============================================================================
// SISTEMA DE NPCs COM IA
// =============================================================================

async function createAINPCs() {
    console.log('👥 Criando NPCs com IA...');
    
    const npcProfiles = [
        {
            name: 'Ana Nostalgia',
            username: 'ana_2000s',
            personality: 'Apaixonada pelos anos 2000, sempre posta sobre música e filmes da época',
            interests: ['música', 'filmes', 'nostalgia', 'amizades'],
            avatar: '🎵'
        },
        {
            name: 'João Gamer',
            username: 'joao_gamer',
            personality: 'Gamer retro que adora falar sobre jogos antigos e novas descobertas',
            interests: ['jogos', 'tecnologia', 'anime', 'programação'],
            avatar: '🎮'
        },
        {
            name: 'Maria Conecta',
            username: 'maria_social',
            personality: 'Super sociável, sempre comentando e curtindo posts dos amigos',
            interests: ['amizades', 'eventos', 'fotografia', 'viagens'],
            avatar: '📸'
        }
    ];
    
    for (const profile of npcProfiles) {
        const npc = await createNPC(profile);
        OrkutApp.npcs.push(npc);
        
        // Programar atividades do NPC
        scheduleNPCActivities(npc);
    }
    
    console.log(`✅ ${OrkutApp.npcs.length} NPCs criados com IA!`);
}

async function createNPC(profile) {
    const npc = {
        ...profile,
        id: generateId(),
        photo: `https://via.placeholder.com/150x150/a855c7/ffffff?text=${profile.avatar}`,
        status: await generateNPCStatus(profile),
        lastActive: new Date(),
        activityLevel: Math.random() * 0.8 + 0.2, // 20-100% ativo
        
        // IA do NPC
        ai: {
            context: `Você é ${profile.name}, um usuário do Orkut 2025. 
                     Personalidade: ${profile.personality}
                     Interesses: ${profile.interests.join(', ')}
                     Fale como uma pessoa real dos anos 2000, seja natural e amigável.`,
            conversationHistory: []
        }
    };
    
    return npc;
}

async function generateNPCStatus(profile) {
    try {
        const prompt = `
Você é ${profile.name}. Personalidade: ${profile.personality}
Interesses: ${profile.interests.join(', ')}

Crie um status do Orkut (máximo 50 caracteres) que seja nostálgico e autêntico dos anos 2000.
Apenas o status, sem explicações.
`;
        
        const response = await callGeminiAPI(prompt);
        return response.trim().replace(/"/g, '');
    } catch (error) {
        return `Revivendo os anos 2000! 💜`;
    }
}

function scheduleNPCActivities(npc) {
    // Atividade aleatória a cada 30-120 segundos
    const interval = (Math.random() * 90 + 30) * 1000;
    
    setTimeout(() => {
        performNPCActivity(npc);
        scheduleNPCActivities(npc); // Reagendar
    }, interval);
}

async function performNPCActivity(npc) {
    const activities = ['like_post', 'comment_post', 'create_post', 'visit_profile'];
    const activity = activities[Math.floor(Math.random() * activities.length)];
    
    switch (activity) {
        case 'like_post':
            await npcLikePost(npc);
            break;
        case 'comment_post':
            await npcCommentPost(npc);
            break;
        case 'create_post':
            await npcCreatePost(npc);
            break;
        case 'visit_profile':
            await npcVisitProfile(npc);
            break;
    }
}

async function npcCreatePost(npc) {
    try {
        const prompt = `
${npc.ai.context}

Crie um post curto e nostálgico para o feed do Orkut (máximo 150 caracteres).
Seja autêntico aos anos 2000, use referências da época.
Apenas o post, sem explicações.
`;
        
        const postContent = await callGeminiAPISimple(prompt);
        
        // Adicionar post ao feed
        const newPost = {
            id: generateId(),
            author: npc.name,
            authorPhoto: npc.photo,
            content: postContent.trim(),
            time: 'agora',
            likes: Math.floor(Math.random() * 15),
            comments: Math.floor(Math.random() * 5),
            type: 'status'
        };
        
        // Notificar usuário sobre nova atividade
        showAINotification(`${npc.avatar} ${npc.name} fez uma nova postagem!`, postContent);
        
        console.log(`📝 ${npc.name} criou post: ${postContent}`);
        
    } catch (error) {
        console.error(`Erro ao criar post do NPC ${npc.name}:`, error);
    }
}

// =============================================================================
// SISTEMA DE VOZ
// =============================================================================

function initializeVoiceSystem() {
    if ('speechSynthesis' in window) {
        OrkutApp.voiceEnabled = true;
        console.log('🗣️ Sistema de voz ativado');
        
        // Configurar voz preferida (português brasileiro)
        const voices = speechSynthesis.getVoices();
        OrkutApp.preferredVoice = voices.find(voice => 
            voice.lang.includes('pt-BR') || voice.lang.includes('pt')
        ) || voices[0];
    } else {
        console.warn('⚠️ Sistema de voz não suportado');
        OrkutApp.voiceEnabled = false;
    }
}

function speakText(text) {
    if (!OrkutApp.voiceEnabled || !text) return;
    
    // Limpar texto de markdown e emojis para melhor pronúncia
    const cleanText = text.replace(/[*_`#]/g, '').replace(/[🤖😊💜✨🚀]/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.voice = OrkutApp.preferredVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    speechSynthesis.speak(utterance);
}

function toggleVoice() {
    OrkutApp.voiceEnabled = !OrkutApp.voiceEnabled;
    const voiceBtn = document.getElementById('voiceToggle');
    
    if (voiceBtn) {
        voiceBtn.textContent = OrkutApp.voiceEnabled ? '🔊' : '🔇';
        voiceBtn.title = OrkutApp.voiceEnabled ? 'Desativar Voz' : 'Ativar Voz';
    }
    
    const status = OrkutApp.voiceEnabled ? 'ativada' : 'desativada';
    showAINotification('🗣️ Voz da IA', `Voz foi ${status}!`);
}

// =============================================================================
// SISTEMA DE NOTIFICAÇÕES DA IA
// =============================================================================

function showAINotification(title, message, duration = 5000) {
    const notification = {
        id: generateId(),
        title,
        message,
        timestamp: new Date(),
        type: 'ai'
    };
    
    OrkutApp.notifications.push(notification);
    displayNotification(notification);
    
    // Auto-remover após duration
    setTimeout(() => {
        removeNotification(notification.id);
    }, duration);
    
    // Atualizar badge do chat
    updateChatBadge();
}

function displayNotification(notification) {
    const notificationHTML = `
    <div class="ai-notification" id="notification-${notification.id}">
        <div class="notification-icon">🤖</div>
        <div class="notification-content">
            <strong>${notification.title}</strong>
            <p>${notification.message}</p>
            <small>${notification.timestamp.toLocaleTimeString()}</small>
        </div>
        <button class="notification-close" onclick="removeNotification('${notification.id}')">×</button>
    </div>
    `;
    
    // Verificar se container existe
    let container = document.getElementById('aiNotificationsContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'aiNotificationsContainer';
        container.className = 'ai-notifications-container';
        document.body.appendChild(container);
    }
    
    container.insertAdjacentHTML('beforeend', notificationHTML);
    
    // Animar entrada
    setTimeout(() => {
        const notificationEl = document.getElementById(`notification-${notification.id}`);
        if (notificationEl) {
            notificationEl.classList.add('show');
        }
    }, 100);
}

// =============================================================================
// MONITORAMENTO DE ATIVIDADE
// =============================================================================

function setupActivityMonitoring() {
    // Monitorar cliques
    document.addEventListener('click', trackActivity);
    
    // Monitorar mudanças de página
    window.addEventListener('popstate', trackPageChange);
    
    // Monitorar tempo na página
    setInterval(updateTimeSpent, 60000); // A cada minuto
    
    // Análise periódica
    setInterval(analyzeUserBehavior, 300000); // A cada 5 minutos
}

function trackActivity(event) {
    OrkutApp.lastActivity = new Date();
    OrkutApp.metrics.interactions++;
    
    // Detectar ações específicas
    const target = event.target;
    
    if (target.closest('.feed-action-btn')) {
        trackEngagement('feed_interaction');
    } else if (target.closest('.profile-edit-btn')) {
        trackEngagement('profile_edit');
    } else if (target.closest('.friend-action')) {
        trackEngagement('social_interaction');
    }
}

function trackEngagement(type) {
    console.log(`📊 Engajamento: ${type}`);
    
    // A IA pode reagir a diferentes tipos de engajamento
    if (Math.random() < 0.3) { // 30% de chance
        setTimeout(() => {
            reactToEngagement(type);
        }, 2000);
    }
}

async function reactToEngagement(type) {
    const reactions = {
        'feed_interaction': [
            '😊 Vi que você curtiu um post! Que tal comentar também?',
            '🚀 Você está bem ativo no feed hoje! Continue assim!',
            '💬 Engajamento é tudo! Seus amigos vão adorar.'
        ],
        'profile_edit': [
            '✨ Atualizando o perfil? Boa! Perfis completos recebem mais visitas.',
            '📝 Que legal ver você cuidando do seu perfil!',
            '🎯 Perfil atualizado = mais conexões!'
        ],
        'social_interaction': [
            '👥 Interações sociais são o coração do Orkut!',
            '🤝 Fazendo novos amigos? Isso é o espírito dos anos 2000!',
            '🎉 Sua rede social está crescendo!'
        ]
    };
    
    const messages = reactions[type] || ['Continue explorando! 🚀'];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    showAINotification('💜 Orky', message, 3000);
}

// =============================================================================
// FUNÇÕES DE INTERFACE
// =============================================================================

function toggleAIChat() {
    const chatContainer = document.getElementById('aiChatContainer');
    const toggle = document.getElementById('aiChatToggle');
    
    if (chatContainer.classList.contains('hidden')) {
        chatContainer.classList.remove('hidden');
        toggle.style.transform = 'scale(0.9)';
        
        // Focar no input
        setTimeout(() => {
            const input = document.getElementById('aiChatInput');
            if (input) input.focus();
        }, 300);
    } else {
        chatContainer.classList.add('hidden');
        toggle.style.transform = 'scale(1)';
    }
}

function addMessageToChat(sender, message) {
    const messagesContainer = document.getElementById('aiChatMessages');
    if (!messagesContainer) return;
    
    const messageClass = sender === 'user' ? 'user-message' : 'ai-message';
    const avatar = sender === 'user' ? '👤' : '🤖';
    const name = sender === 'user' ? 'Você' : 'Orky';
    
    const messageHTML = `
    <div class="${messageClass}">
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <strong>${name}:</strong> ${message}
        </div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    </div>
    `;
    
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showAITyping() {
    const messagesContainer = document.getElementById('aiChatMessages');
    if (!messagesContainer) return;
    
    const typingHTML = `
    <div class="ai-message typing" id="typingIndicator">
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </div>
    `;
    
    messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideAITyping() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// =============================================================================
// BOAS-VINDAS E INTERAÇÕES INICIAIS
// =============================================================================

async function aiWelcomeUser() {
    const user = OrkutApp.user;
    if (!user) return;
    
    const welcomeMessages = [
        `Olá ${user.name}! 😊 Bem-vindo de volta ao Orkut! Como você está se sentindo hoje?`,
        `Ei ${user.name}! 🌟 Saudades dos anos 2000? Vamos reviver essa nostalgia juntos!`,
        `${user.name}! 💜 Que bom te ver aqui! Pronto para se conectar com seus amigos?`
    ];
    
    const message = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    
    setTimeout(() => {
        showAINotification('👋 Orky te dá as boas-vindas!', message);
        
        if (OrkutApp.voiceEnabled) {
            setTimeout(() => speakText(message), 1000);
        }
    }, 1000);
    
    // Análise inicial do perfil
    setTimeout(() => {
        analyzeUserProfile();
    }, 5000);
}

async function analyzeUserProfile() {
    const user = OrkutApp.user;
    if (!user) return;
    
    try {
        const prompt = `
Analise este perfil do Orkut e dê uma dica personalizada:

Nome: ${user.name}
Status: ${user.status || 'Sem status'}
Idade: ${user.age || 'Não informada'}
Localização: ${user.location || 'Não informada'}
Amigos: ${user.friendsCount || 0}
Visitas no perfil: ${user.profileViews || 0}

Dê UMA dica específica e motivadora para melhorar o perfil ou engajamento (máximo 100 caracteres).
`;
        
        const tip = await callGeminiAPISimple(prompt);
        
        setTimeout(() => {
            showAINotification('💡 Dica da Orky', tip.trim(), 7000);
        }, 3000);
        
    } catch (error) {
        console.error('Erro na análise do perfil:', error);
    }
}

// =============================================================================
// FUNÇÕES AUXILIARES PARA NPCS
// =============================================================================

async function npcLikePost(npc) {
    try {
        console.log(`👍 ${npc.name} curtiu um post!`);
        
        // Simular curtida em post aleatório
        const likeMessage = `${npc.name} curtiu seu post!`;
        showAINotification(`${npc.avatar} Atividade do NPC`, likeMessage, 3000);
        
    } catch (error) {
        console.error(`Erro ao curtir post do NPC ${npc.name}:`, error);
    }
}

async function npcCommentPost(npc) {
    try {
        const prompt = `
${npc.ai.context}

Crie um comentário curto e autêntico para um post no Orkut (máximo 80 caracteres).
Seja natural e use a linguagem dos anos 2000.
Apenas o comentário, sem explicações.
`;
        
        const comment = await callGeminiAPISimple(prompt);
        
        console.log(`💬 ${npc.name} comentou: ${comment}`);
        showAINotification(`${npc.avatar} ${npc.name} comentou`, comment.trim(), 4000);
        
    } catch (error) {
        console.error(`Erro ao comentar post do NPC ${npc.name}:`, error);
    }
}

async function npcVisitProfile(npc) {
    try {
        console.log(`👁️ ${npc.name} visitou seu perfil!`);
        
        // Incrementar contadores se existirem
        if (window.incrementProfileViews) {
            window.incrementProfileViews();
        }
        
        // Mostrar notificação
        const visitMessage = `${npc.name} visitou seu perfil!`;
        showAINotification(`${npc.avatar} Nova visita`, visitMessage, 4000);
        
    } catch (error) {
        console.error(`Erro na visita do NPC ${npc.name}:`, error);
    }
}

// =============================================================================
// INTERAÇÕES ESPECIAIS DA IA
// =============================================================================

function setupRealTimeInteractions() {
    // Configurar interações em tempo real
    console.log('⚡ Configurando interações em tempo real...');
    
    // Detectar quando usuário entra em uma nova página
    const currentPage = getCurrentPageName();
    handlePageEntry(currentPage);
}

function getCurrentPageName() {
    const path = window.location.pathname;
    if (path.includes('home.html') || path === '/' || path === '/index.html') {
        return 'home';
    } else if (path.includes('profile.html')) {
        return 'profile';
    } else if (path.includes('friends.html')) {
        return 'friends';
    } else if (path.includes('communities.html')) {
        return 'communities';
    }
    return 'other';
}

function handlePageEntry(pageName) {
    const pageMessages = {
        'home': [
            'Bem-vindo de volta ao feed! 📰 Veja as novidades dos seus amigos!',
            'Hora de ver o que está rolando! 👀 Que tal interagir com alguns posts?',
            'O feed está cheio de conteúdo novo! ✨ Não perca as novidades!'
        ],
        'profile': [
            'Visitando seu perfil! 👤 Que tal atualizar algumas informações?',
            'Seu perfil está ótimo! 💜 Considere adicionar uma nova foto?',
            'Perfil em foco! 🎯 Seus amigos vão adorar as atualizações!'
        ],
        'friends': [
            'Gerenciando amigos! 👥 Que tal procurar por pessoas conhecidas?',
            'Área de amigos! 🤝 Reconecte-se com quem importa!',
            'Amizades são tudo! 💕 Vamos expandir sua rede social?'
        ]
    };
    
    if (pageMessages[pageName] && Math.random() < 0.4) {
        const messages = pageMessages[pageName];
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        setTimeout(() => {
            showAINotification('💜 Orky', message, 5000);
        }, 3000);
    }
}

async function processAIActions(response, userMessage) {
    // Processar ações especiais baseadas na resposta da IA
    const lowercaseResponse = response.toLowerCase();
    const lowercaseMessage = userMessage.toLowerCase();
    
    // Detectar pedidos específicos
    if (lowercaseMessage.includes('analisar perfil') || lowercaseMessage.includes('como está meu perfil')) {
        setTimeout(() => analyzeUserProfile(), 2000);
    }
    
    if (lowercaseMessage.includes('sugerir postagem') || lowercaseMessage.includes('sugerir post')) {
        setTimeout(() => suggestPost(), 2000);
    }
    
    if (lowercaseMessage.includes('dicas') || lowercaseMessage.includes('ajuda')) {
        setTimeout(() => provideTips(), 2000);
    }
}

async function suggestPost() {
    try {
        const user = OrkutApp.user;
        const prompt = `
Você é Orky, assistente do Orkut 2025. 
Sugira UMA ideia criativa de post nostálgico dos anos 2000 para o usuário ${user.name}.
Ideia deve ser específica e divertida (máximo 120 caracteres).
Apenas a sugestão, sem explicações.
`;
        
        const suggestion = await callGeminiAPISimple(prompt);
        showAINotification('✍️ Sugestão de Post', suggestion.trim(), 8000);
        
    } catch (error) {
        showAINotification('✍️ Sugestão de Post', 'Que tal falar sobre sua música favorita dos anos 2000? 🎵', 6000);
    }
}

async function provideTips() {
    const tips = [
        '💡 Dica: Perfis com fotos recebem 3x mais visitas!',
        '🚀 Dica: Comentar em posts dos amigos aumenta o engajamento!',
        '⭐ Dica: Use emojis nostálgicos para dar charme aos posts!',
        '📱 Dica: Atualize seu status regularmente para aparecer mais!',
        '🎯 Dica: Participe de comunidades para conhecer pessoas novas!'
    ];
    
    const tip = tips[Math.floor(Math.random() * tips.length)];
    showAINotification('💜 Dica da Orky', tip, 7000);
}

function trackPageChange() {
    const currentPage = getCurrentPageName();
    console.log(`📄 Mudança de página detectada: ${currentPage}`);
    handlePageEntry(currentPage);
    
    // Atualizar métricas
    OrkutApp.lastActivity = new Date();
    OrkutApp.metrics.interactions++;
}

// =============================================================================
// TRATAMENTO DE ERROS E FALLBACKS
// =============================================================================

function showError(message) {
    console.error('❌ Erro:', message);
    if (typeof showNotification === 'function') {
        showNotification('Erro', message, 'error');
    }
}

// Fallback para funções que podem não existir
if (typeof window.getCurrentUser !== 'function') {
    window.getCurrentUser = function() {
        const userData = localStorage.getItem('orkutUser');
        return userData ? JSON.parse(userData) : null;
    };
}

if (typeof window.incrementProfileViews !== 'function') {
    window.incrementProfileViews = function() {
        const currentViews = parseInt(localStorage.getItem('profileViews') || '0');
        localStorage.setItem('profileViews', (currentViews + 1).toString());
    };
}

// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

async function callGeminiAPISimple(prompt) {
    const requestBody = {
        contents: [{
            parts: [{ text: prompt }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200
        }
    };
    
    const response = await fetch(`${AI_CONFIG.API_URL}?key=${AI_CONFIG.API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

async function loadUserData() {
    // Usar SmartSave se disponível, senão localStorage
    if (typeof window.getCurrentUser === 'function') {
        OrkutApp.user = window.getCurrentUser();
    } else {
        const userData = localStorage.getItem('orkutUser');
        OrkutApp.user = userData ? JSON.parse(userData) : null;
    }
    
    // Se não há usuário, criar um padrão
    if (!OrkutApp.user || !OrkutApp.user.name) {
        OrkutApp.user = {
            name: 'Usuário Orkut',
            status: 'Revivendo os anos 2000! 💜',
            age: 25,
            location: 'Brasil',
            friendsCount: 0,
            profileViews: 0
        };
    }
    
    console.log('👤 Dados do usuário carregados:', OrkutApp.user.name);
}

function quickAsk(question) {
    sendMessageToAI(question);
    
    if (!document.getElementById('aiChatContainer').classList.contains('hidden')) {
        return;
    }
    
    toggleAIChat();
}

function updateChatBadge() {
    const badge = document.getElementById('aiNotificationBadge');
    if (badge) {
        const unreadCount = OrkutApp.notifications.filter(n => !n.read).length;
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

function removeNotification(notificationId) {
    const notificationEl = document.getElementById(`notification-${notificationId}`);
    if (notificationEl) {
        notificationEl.classList.add('fade-out');
        setTimeout(() => notificationEl.remove(), 300);
    }
    
    OrkutApp.notifications = OrkutApp.notifications.filter(n => n.id !== notificationId);
    updateChatBadge();
}

function updateTimeSpent() {
    OrkutApp.metrics.timeSpent++;
}

async function analyzeUserBehavior() {
    const now = new Date();
    const timeSinceLastActivity = now - OrkutApp.lastActivity;
    
    // Se usuário está inativo há mais de 10 minutos
    if (timeSinceLastActivity > 600000) {
        const encouragements = [
            'Ainda por aí? 😊 Que tal dar uma olhada no que seus amigos estão fazendo?',
            'Sentindo nostalgia? 💭 Vamos criar uma nova memória no Orkut!',
            'Hora de um cafézinho? ☕ Quando voltar, tenho algumas sugestões para você!'
        ];
        
        const message = encouragements[Math.floor(Math.random() * encouragements.length)];
        showAINotification('💜 Orky sente sua falta', message, 6000);
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// =============================================================================
// EXPORTAR PARA USO GLOBAL
// =============================================================================

// Funções globais para interação com a IA
window.toggleAIChat = toggleAIChat;
window.quickAsk = quickAsk;
window.sendMessageToAI = sendMessageToAI;
window.toggleVoice = toggleVoice;
window.removeNotification = removeNotification;

// API pública do OrkutApp
window.OrkutApp = OrkutApp;

console.log('🚀 Motor da IA Orkut carregado! A revolução social começou! 💜');
