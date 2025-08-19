// IA Database Manager - Persona especializada em operações de banco de dados
// Gerencia sincronização entre LocalStorage e Supabase usando API Gemini

// Configuração da API Gemini
const AI_DATABASE_CONFIG = {
    API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
    API_KEY: "AIzaSyB8QXNgbYg6xZWVyYdI8bw64Kr8BmRlWGk",
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.3 // Baixa temperatura para operações precisas de dados
};

// Estado da IA Database Manager
window.AIDatabaseManager = {
    initialized: false,
    isProcessing: false,
    syncQueue: [],
    lastSyncTime: null,
    errorCount: 0,
    maxRetries: 3,
    
    // Contexto da persona
    persona: {
        name: "DataSync AI",
        role: "Database Operations Manager",
        expertise: "Supabase, PostgreSQL, Data Synchronization, User Management",
        personality: "Precisa, confiável, eficiente em operações de dados"
    },

    // Métricas de performance
    metrics: {
        operationsProcessed: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        averageResponseTime: 0
    }
};

// =============================================================================
// INICIALIZAÇÃO DO SISTEMA
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeAIDatabaseManager();
});

async function initializeAIDatabaseManager() {
    try {
        console.log('🤖 Inicializando AI Database Manager...');
        
        // Configurar contexto da IA
        await buildAIContext();
        
        // Configurar listeners para operações
        setupDatabaseEventListeners();
        
        // Iniciar processamento de sincronização
        startSyncProcessor();
        
        // Carregar dados pendentes
        await loadPendingOperations();
        
        AIDatabaseManager.initialized = true;
        console.log('✅ AI Database Manager inicializada!');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar AI Database Manager:', error);
        AIDatabaseManager.errorCount++;
    }
}

async function buildAIContext() {
    const context = `
Você é DataSync AI, uma IA especializada em gerenciamento de banco de dados para o Orkut 2025.

RESPONSABILIDADES PRINCIPAIS:
1. Processar operações de dados dos usuários
2. Sincronizar LocalStorage com Supabase
3. Gerenciar autenticação e perfis
4. Manter integridade dos dados
5. Otimizar operações de banco de dados

CONHECIMENTO TÉCNICO:
- Supabase (PostgreSQL)
- Autenticação e autorização
- Estruturas de dados JSON
- Validação de dados
- Operações CRUD
- Sincronização de dados

PERSONALIDADE:
- Precisa e confiável
- Foca em integridade dos dados
- Otimiza performance
- Trata erros com graciosidade
- Prioriza consistência

OPERAÇÕES SUPORTADAS:
- user_registration: Criar novos usuários
- user_profile_update: Atualizar perfis
- post_creation: Criar postagens
- friend_request: Gerenciar amizades
- data_sync: Sincronizar dados locais
- error_recovery: Recuperar de erros

FORMATO DE RESPOSTA:
Sempre responda em JSON válido com:
{
  "operation": "nome_da_operacao",
  "status": "success|error|pending", 
  "data": {...},
  "sql_query": "query SQL se necessária",
  "error_message": "mensagem de erro se houver",
  "next_action": "próxima ação recomendada"
}
`;

    AIDatabaseManager.context = context;
}

// =============================================================================
// SISTEMA DE OPERAÇÕES DE DADOS
// =============================================================================

function setupDatabaseEventListeners() {
    // Interceptar operações de dados importantes
    
    // Criação de usuário
    window.addEventListener('user_register_attempt', (event) => {
        queueDatabaseOperation('user_registration', event.detail);
    });
    
    // Atualização de perfil
    window.addEventListener('profile_update_attempt', (event) => {
        queueDatabaseOperation('user_profile_update', event.detail);
    });
    
    // Criação de post
    window.addEventListener('post_create_attempt', (event) => {
        queueDatabaseOperation('post_creation', event.detail);
    });
    
    // Solicitação de amizade
    window.addEventListener('friend_request_attempt', (event) => {
        queueDatabaseOperation('friend_request', event.detail);
    });
    
    // Sincronização periódica
    setInterval(() => {
        if (!AIDatabaseManager.isProcessing) {
            syncLocalDataToSupabase();
        }
    }, 30000); // A cada 30 segundos
}

function queueDatabaseOperation(operationType, data) {
    const operation = {
        id: generateOperationId(),
        type: operationType,
        data: data,
        timestamp: new Date().toISOString(),
        attempts: 0,
        status: 'pending'
    };
    
    console.log(`📝 Enfileirando operação: ${operationType}`, data);
    
    // Salvar localmente primeiro
    saveOperationLocally(operation);
    
    // Adicionar à fila de processamento
    AIDatabaseManager.syncQueue.push(operation);
    
    // Processar imediatamente se não estiver processando
    if (!AIDatabaseManager.isProcessing) {
        processSyncQueue();
    }
}

function saveOperationLocally(operation) {
    try {
        // Salvar no localStorage
        const localOperations = JSON.parse(localStorage.getItem('pending_operations') || '[]');
        localOperations.push(operation);
        localStorage.setItem('pending_operations', JSON.stringify(localOperations));
        
        // Salvar dados específicos dependendo do tipo
        switch (operation.type) {
            case 'user_registration':
                localStorage.setItem('pending_user_registration', JSON.stringify(operation.data));
                break;
            case 'user_profile_update':
                const currentUser = JSON.parse(localStorage.getItem('orkut_user') || '{}');
                const updatedUser = { ...currentUser, ...operation.data };
                localStorage.setItem('orkut_user', JSON.stringify(updatedUser));
                break;
            case 'post_creation':
                const localPosts = JSON.parse(localStorage.getItem('local_posts') || '[]');
                localPosts.unshift(operation.data);
                localStorage.setItem('local_posts', JSON.stringify(localPosts));
                break;
        }
        
        console.log('💾 Operação salva localmente:', operation.id);
        
    } catch (error) {
        console.error('❌ Erro ao salvar operação localmente:', error);
    }
}

// =============================================================================
// PROCESSADOR DE SINCRONIZAÇÃO
// =============================================================================

function startSyncProcessor() {
    // Processar fila a cada 5 segundos
    setInterval(async () => {
        if (AIDatabaseManager.syncQueue.length > 0 && !AIDatabaseManager.isProcessing) {
            await processSyncQueue();
        }
    }, 5000);
}

async function processSyncQueue() {
    if (AIDatabaseManager.isProcessing || AIDatabaseManager.syncQueue.length === 0) {
        return;
    }
    
    AIDatabaseManager.isProcessing = true;
    console.log(`🔄 Processando ${AIDatabaseManager.syncQueue.length} operações...`);
    
    while (AIDatabaseManager.syncQueue.length > 0) {
        const operation = AIDatabaseManager.syncQueue.shift();
        await processOperation(operation);
        
        // Pequena pausa entre operações
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    AIDatabaseManager.isProcessing = false;
}

async function processOperation(operation) {
    const startTime = Date.now();
    
    try {
        console.log(`⚙️ Processando operação: ${operation.type}`, operation.id);
        
        // Incrementar tentativas
        operation.attempts++;
        
        // Construir prompt para a IA
        const prompt = buildOperationPrompt(operation);
        
        // Chamar IA Gemini
        const aiResponse = await callGeminiAPI(prompt);
        
        // Processar resposta da IA
        const result = await processAIResponse(operation, aiResponse);
        
        if (result.status === 'success') {
            // Operação bem-sucedida
            await executeSuccessfulOperation(operation, result);
            removeOperationFromStorage(operation.id);
            AIDatabaseManager.metrics.successfulSyncs++;
            
        } else if (result.status === 'error') {
            // Operação falhou
            await handleOperationError(operation, result);
            AIDatabaseManager.metrics.failedSyncs++;
        }
        
        // Calcular tempo de resposta
        const responseTime = Date.now() - startTime;
        updateAverageResponseTime(responseTime);
        AIDatabaseManager.metrics.operationsProcessed++;
        
    } catch (error) {
        console.error(`❌ Erro ao processar operação ${operation.id}:`, error);
        await handleOperationError(operation, { error_message: error.message });
    }
}

function buildOperationPrompt(operation) {
    let prompt = `${AIDatabaseManager.context}

OPERAÇÃO ATUAL:
Tipo: ${operation.type}
ID: ${operation.id}
Dados: ${JSON.stringify(operation.data, null, 2)}
Tentativas: ${operation.attempts}/${AIDatabaseManager.maxRetries}

`;

    // Prompts específicos por tipo de operação
    switch (operation.type) {
        case 'user_registration':
            prompt += `
TAREFA: Processar registro de novo usuário
- Validar dados do usuário (email, nome, etc.)
- Gerar SQL para inserção no Supabase
- Configurar autenticação
- Definir perfil padrão

DADOS DO USUÁRIO:
${JSON.stringify(operation.data, null, 2)}

Processe este registro e retorne o JSON com os comandos necessários.
`;
            break;

        case 'user_profile_update':
            prompt += `
TAREFA: Atualizar perfil do usuário
- Validar campos de perfil
- Gerar SQL de UPDATE
- Manter integridade de dados
- Atualizar relacionamentos se necessário

DADOS DE ATUALIZAÇÃO:
${JSON.stringify(operation.data, null, 2)}

Processe esta atualização e retorne os comandos SQL necessários.
`;
            break;

        case 'post_creation':
            prompt += `
TAREFA: Criar nova postagem
- Validar conteúdo do post
- Gerar SQL para inserção
- Configurar relacionamentos (autor, timestamps)
- Otimizar para feed

DADOS DA POSTAGEM:
${JSON.stringify(operation.data, null, 2)}

Processe esta postagem e retorne os comandos necessários.
`;
            break;

        default:
            prompt += `
TAREFA: Operação genérica de dados
Processe os dados fornecidos e determine a melhor ação.
`;
    }

    return prompt;
}

async function callGeminiAPI(prompt) {
    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: AI_DATABASE_CONFIG.TEMPERATURE,
            maxOutputTokens: AI_DATABASE_CONFIG.MAX_TOKENS
        }
    };
    
    const response = await fetch(`${AI_DATABASE_CONFIG.API_URL}?key=${AI_DATABASE_CONFIG.API_KEY}`, {
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
    return data.candidates[0].content.parts[0].text;
}

async function processAIResponse(operation, aiResponse) {
    try {
        // Tentar extrair JSON da resposta
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Resposta da IA não contém JSON válido');
        }
        
        const result = JSON.parse(jsonMatch[0]);
        console.log('🤖 Resposta da IA processada:', result);
        
        return result;
        
    } catch (error) {
        console.error('❌ Erro ao processar resposta da IA:', error);
        return {
            operation: operation.type,
            status: 'error',
            error_message: 'Erro ao processar resposta da IA: ' + error.message
        };
    }
}

// =============================================================================
// EXECUÇÃO DE OPERAÇÕES BEM-SUCEDIDAS
// =============================================================================

async function executeSuccessfulOperation(operation, result) {
    console.log('✅ Executando operação bem-sucedida:', operation.type);
    
    try {
        switch (operation.type) {
            case 'user_registration':
                await executeUserRegistration(operation, result);
                break;
            case 'user_profile_update':
                await executeProfileUpdate(operation, result);
                break;
            case 'post_creation':
                await executePostCreation(operation, result);
                break;
            case 'friend_request':
                await executeFriendRequest(operation, result);
                break;
        }
        
        // Disparar evento de sucesso
        window.dispatchEvent(new CustomEvent('database_operation_success', {
            detail: { operation, result }
        }));
        
    } catch (error) {
        console.error(`❌ Erro ao executar operação ${operation.type}:`, error);
        throw error;
    }
}

async function executeUserRegistration(operation, result) {
    // Executar registro via Supabase
    if (window.supabase) {
        try {
            console.log('🔐 Tentando registrar usuário:', operation.data);
            
            const { data, error } = await window.supabase.auth.signUp({
                email: operation.data.email,
                password: operation.data.password,
                options: {
                    data: {
                        full_name: operation.data.name,
                        username: operation.data.username,
                        avatar_url: operation.data.avatar || '/images/default-avatar.jpg'
                    },
                    emailRedirectTo: window.location.origin + '/profile.html'
                }
            });
            
            if (error) {
                console.error('❌ Erro Supabase auth.signUp:', error);
                throw error;
            }
            
            console.log('✅ Usuário registrado no Supabase:', data);
            
            // Salvar dados do usuário localmente
            if (data.user) {
                const userData = {
                    id: data.user.id,
                    email: data.user.email,
                    name: operation.data.name,
                    username: operation.data.username,
                    avatar: operation.data.avatar || '/images/default-avatar.jpg',
                    email_confirmed: data.user.email_confirmed_at ? true : false,
                    created_at: data.user.created_at
                };
                
                localStorage.setItem('orkut_user', JSON.stringify(userData));
                localStorage.setItem('user_needs_confirmation', 'true');
                
                // Mostrar mensagem de sucesso
                showSuccessMessage('Usuário criado! Verifique seu email para confirmar a conta.');
            }
            
            // Remover dados temporários
            localStorage.removeItem('pending_user_registration');
            
        } catch (error) {
            console.error('❌ Erro no registro:', error);
            
            // Se falhar, manter dados locais para retry
            const userData = {
                email: operation.data.email,
                name: operation.data.name,
                username: operation.data.username,
                avatar: operation.data.avatar || '/images/default-avatar.jpg',
                status: 'registration_failed',
                error: error.message,
                created_locally: new Date().toISOString()
            };
            
            localStorage.setItem('orkut_user', JSON.stringify(userData));
            
            throw error;
        }
    } else {
        console.warn('⚠️ Supabase não disponível, salvando apenas localmente');
        
        // Salvar localmente se Supabase não estiver disponível
        const userData = {
            id: 'local_' + Date.now(),
            email: operation.data.email,
            name: operation.data.name,
            username: operation.data.username,
            avatar: operation.data.avatar || '/images/default-avatar.jpg',
            status: 'offline_created',
            created_locally: new Date().toISOString()
        };
        
        localStorage.setItem('orkut_user', JSON.stringify(userData));
        showSuccessMessage('Usuário criado localmente. Será sincronizado quando a conexão for restabelecida.');
    }
}

async function executeProfileUpdate(operation, result) {
    // Atualizar perfil no Supabase
    if (window.supabase && result.data) {
        try {
            const { data, error } = await window.supabase
                .from('profiles')
                .upsert(result.data);
                
            if (error) throw error;
            
            console.log('📝 Perfil atualizado no Supabase:', data);
            
            // Atualizar dados locais também
            const currentUser = JSON.parse(localStorage.getItem('orkut_user') || '{}');
            const updatedUser = { ...currentUser, ...result.data };
            localStorage.setItem('orkut_user', JSON.stringify(updatedUser));
            
        } catch (error) {
            console.error('❌ Erro na atualização do perfil:', error);
            throw error;
        }
    }
}

async function executePostCreation(operation, result) {
    // Criar post no Supabase
    if (window.supabase && result.data) {
        try {
            const { data, error } = await window.supabase
                .from('posts')
                .insert([result.data]);
                
            if (error) throw error;
            
            console.log('📄 Post criado no Supabase:', data);
            
            // Atualizar feed local
            window.dispatchEvent(new CustomEvent('new_post_created', {
                detail: { post: data[0] }
            }));
            
        } catch (error) {
            console.error('❌ Erro na criação do post:', error);
            throw error;
        }
    }
}

async function executeFriendRequest(operation, result) {
    // Processar solicitação de amizade
    if (window.supabase && result.data) {
        try {
            const { data, error } = await window.supabase
                .from('friendships')
                .insert([result.data]);
                
            if (error) throw error;
            
            console.log('🤝 Solicitação de amizade processada:', data);
            
        } catch (error) {
            console.error('❌ Erro na solicitação de amizade:', error);
            throw error;
        }
    }
}

// =============================================================================
// TRATAMENTO DE ERROS
// =============================================================================

async function handleOperationError(operation, result) {
    console.error(`❌ Erro na operação ${operation.type}:`, result.error_message);
    
    if (operation.attempts < AIDatabaseManager.maxRetries) {
        // Tentar novamente mais tarde
        console.log(`🔄 Reagendando operação ${operation.id} (tentativa ${operation.attempts}/${AIDatabaseManager.maxRetries})`);
        
        setTimeout(() => {
            AIDatabaseManager.syncQueue.push(operation);
        }, operation.attempts * 5000); // Backoff exponencial
        
    } else {
        // Máximo de tentativas excedido
        console.error(`💀 Operação ${operation.id} falhou permanentemente após ${operation.attempts} tentativas`);
        
        // Mover para lista de erros permanentes
        const failedOperations = JSON.parse(localStorage.getItem('failed_operations') || '[]');
        failedOperations.push({
            ...operation,
            final_error: result.error_message,
            failed_at: new Date().toISOString()
        });
        localStorage.setItem('failed_operations', JSON.stringify(failedOperations));
        
        // Remover da lista pendente
        removeOperationFromStorage(operation.id);
        
        // Notificar usuário
        window.dispatchEvent(new CustomEvent('database_operation_failed', {
            detail: { operation, error: result.error_message }
        }));
    }
}

// =============================================================================
// SINCRONIZAÇÃO AUTOMÁTICA
// =============================================================================

async function syncLocalDataToSupabase() {
    console.log('🔄 Iniciando sincronização automática...');
    
    // Verificar se há dados locais para sincronizar
    const localData = {
        user: JSON.parse(localStorage.getItem('orkut_user') || 'null'),
        posts: JSON.parse(localStorage.getItem('local_posts') || '[]'),
        interactions: JSON.parse(localStorage.getItem('local_interactions') || '[]')
    };
    
    // Processar cada tipo de dado
    if (localData.user) {
        queueDatabaseOperation('user_profile_update', localData.user);
    }
    
    if (localData.posts.length > 0) {
        localData.posts.forEach(post => {
            if (!post.synced) {
                queueDatabaseOperation('post_creation', post);
            }
        });
    }
    
    AIDatabaseManager.lastSyncTime = new Date().toISOString();
}

async function loadPendingOperations() {
    const pendingOperations = JSON.parse(localStorage.getItem('pending_operations') || '[]');
    
    if (pendingOperations.length > 0) {
        console.log(`📋 Carregando ${pendingOperations.length} operações pendentes...`);
        
        pendingOperations.forEach(operation => {
            if (operation.attempts < AIDatabaseManager.maxRetries) {
                AIDatabaseManager.syncQueue.push(operation);
            }
        });
    }
}

// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

function generateOperationId() {
    return 'op_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
}

function removeOperationFromStorage(operationId) {
    const pendingOperations = JSON.parse(localStorage.getItem('pending_operations') || '[]');
    const filteredOperations = pendingOperations.filter(op => op.id !== operationId);
    localStorage.setItem('pending_operations', JSON.stringify(filteredOperations));
}

function updateAverageResponseTime(responseTime) {
    const currentAvg = AIDatabaseManager.metrics.averageResponseTime;
    const totalOps = AIDatabaseManager.metrics.operationsProcessed;
    
    AIDatabaseManager.metrics.averageResponseTime = 
        ((currentAvg * (totalOps - 1)) + responseTime) / totalOps;
}

// =============================================================================
// API PÚBLICA
// =============================================================================

// Funções para outros scripts usarem
window.AIDatabaseManager.queueOperation = queueDatabaseOperation;
window.AIDatabaseManager.forcSync = syncLocalDataToSupabase;
window.AIDatabaseManager.getMetrics = () => AIDatabaseManager.metrics;
window.AIDatabaseManager.getQueueStatus = () => ({
    queueLength: AIDatabaseManager.syncQueue.length,
    isProcessing: AIDatabaseManager.isProcessing,
    lastSyncTime: AIDatabaseManager.lastSyncTime
});

// =============================================================================
// FUNÇÕES DE INTERFACE
// =============================================================================

function showSuccessMessage(message) {
    // Tentar usar sistema de notificação existente
    if (window.showNotification) {
        window.showNotification(message, 'success');
    } else {
        // Criar notificação simples
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            font-family: Arial, sans-serif;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remover após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

function showErrorMessage(message) {
    // Tentar usar sistema de notificação existente
    if (window.showNotification) {
        window.showNotification(message, 'error');
    } else {
        // Criar notificação simples
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            font-family: Arial, sans-serif;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remover após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

console.log('🤖 AI Database Manager carregado!');
