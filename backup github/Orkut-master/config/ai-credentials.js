// Orkut 2025 - Credenciais Centralizadas para IA Backend Manager
// ACESSO COMPLETO: A IA Gemini tem controle total sobre todas as APIs e bancos

// =============================================================================
// CREDENCIAIS PRINCIPAIS - ACESSO TOTAL DA IA
// =============================================================================

window.AI_CREDENTIALS = {
    // ===== GOOGLE GEMINI API =====
    GEMINI: {
        API_KEY: "AIzaSyB8QXNgbYg6xZWVyYdI8bw64Kr8BmRlWGk",
        PROJECT_ID: "orkut-2025-ai",
        BASE_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
        MODEL: "gemini-1.5-flash-latest",
        MAX_TOKENS: 2000,
        TEMPERATURE: 0.8,
        TOP_P: 0.95,
        TOP_K: 40,
        SAFETY_SETTINGS: [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH", 
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
        ],
        // Permissões especiais para IA
        PERMISSIONS: {
            DATABASE_WRITE: true,
            API_MANAGEMENT: true,
            USER_DATA_ACCESS: true,
            SYSTEM_CONTROL: true,
            AUTO_DECISIONS: true
        }
    },

    // ===== SUPABASE DATABASE =====
    SUPABASE: {
        PROJECT_URL: "https://ksskokjrdzqghhuahjpl.supabase.co",
        ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzc2tva2pyZHpxZ2hodWFoanBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDUzMTEsImV4cCI6MjA3MTEyMTMxMX0.tyQ15i2ypP7BW5UCKOkptJFCHo5IDdRD4ojzcmHSpK4",
        PROJECT_ID: "ksskokjrdzqghhuahjpl",
        REGION: "us-east-1",
        
        // Tabelas que a IA pode gerenciar
        TABLES: {
            USERS: "users",
            POSTS: "posts", 
            SCRAPS: "scraps",
            FRIENDS: "friends",
            COMMUNITIES: "communities",
            MESSAGES: "messages",
            NOTIFICATIONS: "notifications",
            SETTINGS: "user_settings",
            ANALYTICS: "user_analytics"
        },
        
        // Permissões da IA no banco
        AI_PERMISSIONS: {
            SELECT: true,    // Ler dados
            INSERT: true,    // Criar registros
            UPDATE: true,    // Atualizar dados
            DELETE: true,    // Remover registros (com cuidado)
            MAINTENANCE: true, // Limpeza automática
            OPTIMIZATION: true, // Otimizar queries
            BACKUP: true,    // Fazer backups
            ANALYTICS: true  // Gerar relatórios
        }
    },

    // ===== APIS SECUNDÁRIAS =====
    EXTERNAL_APIS: {
        // Google Drive para backups
        GOOGLE_DRIVE: {
            FOLDER_ID: "1UtRjJo3J62950uPXsKR8F1FAlOSG0QzZ",
            SERVICE_ACCOUNT_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_KEY || null
        },
        
        // APIs de terceiros (futuro)
        SPOTIFY: {
            CLIENT_ID: process.env.SPOTIFY_CLIENT_ID || null,
            CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET || null
        },
        
        YOUTUBE: {
            API_KEY: process.env.YOUTUBE_API_KEY || null
        }
    },

    // ===== CONFIGURAÇÕES DE SEGURANÇA =====
    SECURITY: {
        // Rate limiting para IA
        MAX_REQUESTS_PER_MINUTE: 60,
        MAX_DB_OPERATIONS_PER_MINUTE: 100,
        
        // Operações que necessitam confirmação humana
        REQUIRE_HUMAN_APPROVAL: [
            "DELETE_USER",
            "MASS_DELETE", 
            "SCHEMA_CHANGES",
            "BACKUP_RESTORE"
        ],
        
        // Logs de segurança
        LOG_ALL_OPERATIONS: true,
        AUDIT_TRAIL: true,
        
        // Limites de recursos
        MAX_MEMORY_USAGE: "500MB",
        MAX_CPU_USAGE: "80%"
    },

    // ===== CONFIGURAÇÕES OPERACIONAIS =====
    OPERATIONS: {
        // Intervalos de operação (millisegundos)
        HEALTH_CHECK_INTERVAL: 15000,      // 15s
        DATABASE_SYNC_INTERVAL: 10000,     // 10s  
        API_STATUS_CHECK_INTERVAL: 30000,  // 30s
        PERFORMANCE_MONITOR_INTERVAL: 5000, // 5s
        UI_ADJUSTMENT_INTERVAL: 3000,      // 3s
        
        // Configurações de retry
        MAX_RETRIES: 3,
        RETRY_DELAY: 1000,
        
        // Cache
        CACHE_DURATION: 300000, // 5 minutos
        MAX_CACHE_SIZE: "50MB",
        
        // Backup automático
        AUTO_BACKUP_ENABLED: true,
        BACKUP_INTERVAL: 3600000, // 1 hora
        MAX_BACKUPS: 24 // Manter 24 backups (1 dia)
    },

    // ===== CONFIGURAÇÕES DE COMPORTAMENTO DA IA =====
    AI_BEHAVIOR: {
        // Prioridades (1 = máxima, 5 = mínima)
        PRIORITY_LEVELS: {
            DATABASE_MANAGEMENT: 1,
            API_MONITORING: 2, 
            PERFORMANCE_OPTIMIZATION: 3,
            UI_ADJUSTMENTS: 4,
            USER_INTERACTION: 5
        },
        
        // Modo de operação
        AUTO_PILOT_MODE: true,      // IA toma decisões automáticas
        PROACTIVE_MAINTENANCE: true, // IA executa manutenção preventiva
        PREDICTIVE_SCALING: true,   // IA prevê necessidades de recursos
        
        // Interação com usuários
        SOCIAL_INTERACTION_ENABLED: true,
        ONLY_WHEN_IDLE: true,       // Só interage quando ociosa
        MAX_CONVERSATION_LENGTH: 10, // Máximo de 10 mensagens por conversa
        
        // Personalidade
        PERSONALITY_TRAITS: {
            HELPFUL: 0.9,
            NOSTALGIC: 0.8,
            TECHNICAL: 0.7,
            FRIENDLY: 0.8,
            EFFICIENT: 0.95
        }
    },

    // ===== CONFIGURAÇÕES DE UI AUTOMÁTICA =====
    UI_AUTO_MANAGEMENT: {
        // Ajustes automáticos
        AUTO_CONTRAST_ADJUSTMENT: true,
        AUTO_THEME_SWITCHING: true,
        AUTO_RESPONSIVE_FIXES: true,
        AUTO_ACCESSIBILITY_IMPROVEMENTS: true,
        
        // Temas
        THEMES: {
            DARK: {
                TEXT_COLOR: "#ffffff",
                TEXT_SECONDARY: "#e0e0e0", 
                BACKGROUND: "#1a1a1a",
                BACKGROUND_SECONDARY: "#2d2d2d"
            },
            LIGHT: {
                TEXT_COLOR: "#333333",
                TEXT_SECONDARY: "#666666",
                BACKGROUND: "#ffffff", 
                BACKGROUND_SECONDARY: "#f5f5f5"
            },
            RETRO: {
                TEXT_COLOR: "#000080",
                TEXT_SECONDARY: "#4169E1",
                BACKGROUND: "#E6E6FA",
                BACKGROUND_SECONDARY: "#DDA0DD"
            }
        },
        
        // Responsividade automática
        BREAKPOINTS: {
            MOBILE: "768px",
            TABLET: "1024px", 
            DESKTOP: "1200px"
        }
    }
};

// =============================================================================
// VALIDAÇÃO DE CREDENCIAIS
// =============================================================================

function validateCredentials() {
    const required = [
        'AI_CREDENTIALS.GEMINI.API_KEY',
        'AI_CREDENTIALS.SUPABASE.PROJECT_URL',
        'AI_CREDENTIALS.SUPABASE.ANON_KEY'
    ];
    
    const missing = [];
    
    for (const path of required) {
        const value = path.split('.').reduce((obj, key) => obj?.[key], window);
        if (!value) {
            missing.push(path);
        }
    }
    
    if (missing.length > 0) {
        console.error('❌ Credenciais obrigatórias ausentes:', missing);
        return false;
    }
    
    console.log('✅ Todas as credenciais validadas - IA tem acesso completo');
    return true;
}

// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

// Obter configuração específica
window.getAIConfig = (path) => {
    return path.split('.').reduce((obj, key) => obj?.[key], window.AI_CREDENTIALS);
};

// Verificar permissão
window.hasAIPermission = (operation) => {
    const permissions = window.AI_CREDENTIALS.SUPABASE.AI_PERMISSIONS;
    const securitySettings = window.AI_CREDENTIALS.SECURITY;
    
    // Verificar se operação requer aprovação humana
    if (securitySettings.REQUIRE_HUMAN_APPROVAL.includes(operation)) {
        console.warn('⚠️ Operação requer aprovação humana:', operation);
        return false;
    }
    
    return permissions[operation] || false;
};

// Obter credencial de forma segura (sem logs)
window.getSecureCredential = (service, key) => {
    return window.AI_CREDENTIALS[service]?.[key];
};

// Rate limiting check
window.checkRateLimit = (operation) => {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const rateLimits = window.aiRateLimits || {};
    
    const currentMinute = rateLimits[minute] || { requests: 0, dbOps: 0 };
    
    const security = window.AI_CREDENTIALS.SECURITY;
    
    if (operation === 'API_REQUEST' && currentMinute.requests >= security.MAX_REQUESTS_PER_MINUTE) {
        console.warn('⚠️ Rate limit excedido para requests de API');
        return false;
    }
    
    if (operation === 'DB_OPERATION' && currentMinute.dbOps >= security.MAX_DB_OPERATIONS_PER_MINUTE) {
        console.warn('⚠️ Rate limit excedido para operações de banco');
        return false;
    }
    
    // Atualizar contadores
    if (operation === 'API_REQUEST') currentMinute.requests++;
    if (operation === 'DB_OPERATION') currentMinute.dbOps++;
    
    rateLimits[minute] = currentMinute;
    window.aiRateLimits = rateLimits;
    
    return true;
};

// =============================================================================
// INICIALIZAÇÃO
// =============================================================================

// Validar credenciais na inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', validateCredentials);
} else {
    validateCredentials();
}

// Limpar rate limits antigos a cada minuto
setInterval(() => {
    const now = Date.now();
    const currentMinute = Math.floor(now / 60000);
    const rateLimits = window.aiRateLimits || {};
    
    // Remover dados de minutos anteriores
    for (const minute in rateLimits) {
        if (parseInt(minute) < currentMinute - 2) {
            delete rateLimits[minute];
        }
    }
    
    window.aiRateLimits = rateLimits;
}, 60000);

console.log('🔐 Credenciais AI carregadas - IA tem CONTROLE TOTAL do sistema');
console.log('📊 Permissões ativas:', Object.keys(window.AI_CREDENTIALS.SUPABASE.AI_PERMISSIONS).filter(p => window.AI_CREDENTIALS.SUPABASE.AI_PERMISSIONS[p]));
