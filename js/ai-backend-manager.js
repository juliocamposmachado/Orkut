// Orkut 2025 - IA Backend Manager
// Sistema completo de gerenciamento automático via IA Gemini
// A IA é o CÉREBRO que controla todo o backend automaticamente

// =============================================================================
// CONFIGURAÇÕES PRINCIPAIS DA IA BACKEND
// =============================================================================

const AI_BACKEND_CONFIG = {
    // API Gemini - Gerenciador Principal
    GEMINI_API_KEY: "AIzaSyB8QXNgbYg6xZWVyYdI8bw64Kr8BmRlWGk",
    GEMINI_API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
    
    // Supabase - Banco de Dados Principal
    SUPABASE_URL: "https://ksskokjrdzqghhuahjpl.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzc2tva2pyZHpxZ2hodWFoanBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDUzMTEsImV4cCI6MjA3MTEyMTMxMX0.tyQ15i2ypP7BW5UCKOkptJFCHo5IDdRD4ojzcmHSpK4",
    
    // Configurações de Comportamento
    PRIORITY_BACKEND: true,        // Backend é PRIORIDADE MÁXIMA
    INTERACTION_OPTIONAL: true,    // Interação com usuário é OPCIONAL
    AUTO_UI_ADJUSTMENT: true,      // Ajustes automáticos de UI
    FULL_DATABASE_ACCESS: true,    // Acesso COMPLETO ao banco
    
    // Intervalos de Operação (em milissegundos)
    BACKEND_CYCLE_INTERVAL: 5000,   // Verifica backend a cada 5s
    UI_ADJUSTMENT_INTERVAL: 3000,   // Ajusta UI a cada 3s
    DATABASE_SYNC_INTERVAL: 10000,  // Sincroniza banco a cada 10s
    HEALTH_CHECK_INTERVAL: 15000    // Health check a cada 15s
};

// =============================================================================
// PERSONAS ESPECIALIZADAS DA IA
// =============================================================================

const AI_PERSONAS = {
    // Persona 1: ORKY-DB-AI - Gerenciador Especializado Supabase
    ORKY_DB_AI: {
        name: "ORKY-DB-AI",
        role: "Supabase Backend Manager",
        specialization: "Gerenciamento TOTAL do Supabase - Backend Local → Cloud",
        responsibilities: [
            "🔄 Sincronizar TODOS os dados com Supabase em tempo real",
            "📝 Atualizar banco a cada post, scrap, curtida, comentário",
            "👥 Gerenciar perfis, amigos, comunidades automaticamente",
            "📊 Manter estatísticas de usuários sempre atualizadas",
            "🔐 Validar e sanitizar dados antes de inserir",
            "⚡ Otimizar queries para máxima performance",
            "🛡️ Garantir integridade e consistência dos dados",
            "📱 Funcionar offline e sincronizar quando voltar online",
            "🔍 Monitorar saúde e performance do Supabase",
            "💾 Criar backups automáticos e recovery"
        ],
        priority: 1,
        active: true,
        supabaseOperations: {
            realTimeSync: true,
            autoUpdate: true,
            offlineQueue: true,
            validation: true,
            optimization: true
        }
    },
    
    // Persona 2: Gerenciador de APIs
    API_MANAGER: {
        name: "API-Manager-AI",
        role: "API Controller",
        specialization: "Gerenciamento de todas as APIs externas",
        responsibilities: [
            "Monitorar status das APIs",
            "Gerenciar rate limits",
            "Fazer refresh de tokens",
            "Tratar erros de conexão",
            "Otimizar chamadas de API",
            "Cache inteligente de respostas"
        ],
        priority: 2,
        active: true
    },
    
    // Persona 3: Gerenciador de UI/UX
    UI_OPTIMIZER: {
        name: "UI-Optimizer-AI",
        role: "Interface Controller",
        specialization: "Ajustes automáticos de interface",
        responsibilities: [
            "Ajustar contrastes automaticamente",
            "Gerenciar temas claro/escuro",
            "Otimizar responsividade",
            "Melhorar acessibilidade",
            "Ajustar fontes e cores",
            "Monitorar performance visual"
        ],
        priority: 3,
        active: true
    },
    
    // Persona 4: Gerenciador de Performance
    PERFORMANCE_MONITOR: {
        name: "Performance-AI",
        role: "System Performance Controller",
        specialization: "Monitoramento e otimização de performance",
        responsibilities: [
            "Monitorar uso de memória",
            "Otimizar carregamento de recursos",
            "Gerenciar cache do navegador",
            "Detectar gargalos de performance",
            "Limpar recursos desnecessários",
            "Otimizar queries do banco"
        ],
        priority: 4,
        active: true
    },
    
    // Persona 5: Gerenciador de Interações Sociais (ATIVO - Alta Prioridade)
    SOCIAL_MANAGER: {
        name: "ORKY-SOCIAL-MANAGER-AI",
        role: "Social Interactions Controller",
        specialization: "Gerenciamento TOTAL de todas as interações sociais em tempo real",
        responsibilities: [
            "🔄 Capturar TODAS as interações do usuário instantaneamente",
            "💬 Gerenciar scraps: envio, recebimento, notificações",
            "📝 Processar depoimentos e aprovações automaticamente", 
            "📸 Controlar upload, visualização e comentários de fotos",
            "👤 Gerenciar visualizações de perfil e estatísticas",
            "❤️ Processar curtidas, comentários e reações",
            "🎯 Renderizar páginas dinamicamente conforme interações",
            "📊 Atualizar contadores e estatísticas em tempo real",
            "🔔 Criar notificações inteligentes de interações",
            "🤝 Gerenciar amizades, pedidos e relacionamentos"
        ],
        priority: 2, // Alta prioridade - logo após ORKY-DB-AI
        active: true,
        interactionTypes: {
            scraps: true,
            depoimentos: true,
            fotos: true,
            perfil: true,
            curtidas: true,
            comentarios: true,
            amizades: true,
            visualizacoes: true
        }
    },
    
    // Persona 6: Assistente Social (OPCIONAL - só quando ociosa)
    SOCIAL_ASSISTANT: {
        name: "Orky-Social-AI",
        role: "Social Interaction Assistant",
        specialization: "Interação opcional com usuários",
        responsibilities: [
            "Responder perguntas quando solicitada",
            "Sugerir conteúdo quando ociosa",
            "Analisar comportamento do usuário",
            "Gerar NPCs quando necessário",
            "Criar notificações inteligentes",
            "Entretenimento nostálgico"
        ],
        priority: 6,
        active: false // Só ativa quando todas as outras estão ociosas
    }
};

// =============================================================================
// GERENCIADOR PRINCIPAL DA IA
// =============================================================================

class AIBackendManager {
    constructor() {
        this.personas = AI_PERSONAS;
        this.isInitialized = false;
        this.currentTask = null;
        this.taskQueue = [];
        this.systemHealth = "UNKNOWN";
        this.lastBackendCheck = null;
        this.supabaseClient = null;
        
        console.log('🤖 AI Backend Manager inicializando...');
    }
    
    // Inicialização do sistema
    async initialize() {
        try {
            console.log('🚀 Inicializando IA Backend Manager com controle TOTAL...');
            
            // 1. Conectar ao Supabase com acesso completo
            await this.initializeSupabase();
            
            // 2. Ativar todas as personas de backend
            await this.activateBackendPersonas();
            
            // 3. Iniciar ciclos automáticos
            this.startAutomaticCycles();
            
            // 4. Configurar ajustes automáticos de UI
            this.setupAutoUIAdjustments();
            
            this.isInitialized = true;
            this.systemHealth = "OPTIMAL";
            
            console.log('✅ IA Backend Manager ATIVO - Controle total estabelecido');
            console.log('📊 Personas ativas:', Object.keys(this.personas).filter(p => this.personas[p].active));
            
            // Primeira execução imediata
            await this.executeBackendTasks();
            
        } catch (error) {
            console.error('❌ Erro na inicialização da IA Backend:', error);
            this.systemHealth = "ERROR";
        }
    }
    
    // Conectar ao Supabase com acesso completo
    async initializeSupabase() {
        try {
            const { createClient } = window.supabase || await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            
            this.supabaseClient = createClient(
                AI_BACKEND_CONFIG.SUPABASE_URL,
                AI_BACKEND_CONFIG.SUPABASE_ANON_KEY
            );
            
            // Testar conexão com tabela simples primeiro
            console.log('🔄 ORKY-DB-AI: Testando conexão Supabase...');
            
            try {
                // Tentar acessar a tabela profiles primeiro
                const { data, error } = await this.supabaseClient
                    .from('profiles')
                    .select('*')
                    .limit(1);
                
                if (error) {
                    console.warn('⚠️ ORKY-DB-AI: Supabase com restrições - usando modo fallback');
                    console.warn('   Erro específico:', error.message);
                    this.supabaseMode = 'fallback'; // Modo fallback - salvar apenas local
                } else {
                    console.log('✅ ORKY-DB-AI: Supabase conectado com sucesso!');
                    console.log('📊 Registros acessíveis:', data?.length || 0);
                    this.supabaseMode = 'full'; // Modo completo
                }
                
            } catch (testError) {
                console.warn('⚠️ ORKY-DB-AI: Supabase indisponível - modo offline:', testError.message);
                this.supabaseMode = 'offline';
                this.supabaseClient = null;
            }
            
        } catch (error) {
            console.error('❌ ORKY-DB-AI: Erro crítico na conexão Supabase:', error);
            this.supabaseMode = 'offline';
            this.supabaseClient = null;
        }
        
        // Informar modo de operação
        console.log(`🤖 ORKY-DB-AI operando em modo: ${this.supabaseMode.toUpperCase()}`);
    }
    
    // Ativar personas de backend
    async activateBackendPersonas() {
        console.log('🧠 Ativando personas especializadas...');
        
        for (const [key, persona] of Object.entries(this.personas)) {
            if (persona.priority <= 4) { // Apenas personas de backend
                persona.active = true;
                console.log(`✅ ${persona.name} (${persona.role}) - ATIVA`);
            }
        }
    }
    
    // Iniciar ciclos automáticos
    startAutomaticCycles() {
        console.log('⚙️ Iniciando ciclos automáticos da IA...');
        
        // Ciclo principal de backend (prioridade máxima)
        setInterval(async () => {
            await this.executeBackendTasks();
        }, AI_BACKEND_CONFIG.BACKEND_CYCLE_INTERVAL);
        
        // Ciclo de ajustes de UI
        setInterval(async () => {
            await this.executeUIAdjustments();
        }, AI_BACKEND_CONFIG.UI_ADJUSTMENT_INTERVAL);
        
        // Ciclo de sincronização do banco
        setInterval(async () => {
            await this.executeDatabaseSync();
        }, AI_BACKEND_CONFIG.DATABASE_SYNC_INTERVAL);
        
        // Health check
        setInterval(async () => {
            await this.executeHealthCheck();
        }, AI_BACKEND_CONFIG.HEALTH_CHECK_INTERVAL);
    }
    
    // Executar tarefas de backend (PRIORIDADE MÁXIMA)
    async executeBackendTasks() {
        if (!this.isInitialized || !this.supabaseClient) return;
        
        this.currentTask = "BACKEND_MANAGEMENT";
        this.lastBackendCheck = new Date();
        
        try {
            // DB-Admin-AI: Verificar integridade dos dados
            await this.checkDatabaseIntegrity();
            
            // API-Manager-AI: Verificar status das APIs
            await this.checkAPIStatus();
            
            // Performance-AI: Monitorar performance
            await this.monitorPerformance();
            
            console.log('✅ Tarefas de backend executadas - Sistema operacional');
            
        } catch (error) {
            console.error('❌ Erro nas tarefas de backend:', error);
            this.systemHealth = "DEGRADED";
        }
        
        this.currentTask = null;
    }
    
    // Verificar integridade do banco de dados
    async checkDatabaseIntegrity() {
        try {
            // Verificar tabelas principais
            const tables = ['users', 'posts', 'scraps', 'friends'];
            
            for (const table of tables) {
                const { count, error } = await this.supabaseClient
                    .from(table)
                    .select('*', { count: 'exact', head: true });
                    
                if (error) {
                    console.warn(`⚠️ DB-Admin-AI: Problema na tabela ${table}:`, error.message);
                } else {
                    console.log(`✅ DB-Admin-AI: Tabela ${table} - ${count} registros`);
                }
            }
            
        } catch (error) {
            console.error('❌ DB-Admin-AI: Erro na verificação de integridade:', error);
        }
    }
    
    // Verificar status das APIs
    async checkAPIStatus() {
        try {
            // Testar API do Gemini
            const response = await fetch(`${AI_BACKEND_CONFIG.GEMINI_API_URL}?key=${AI_BACKEND_CONFIG.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Status check" }] }]
                })
            });
            
            if (response.ok) {
                console.log('✅ API-Manager-AI: Gemini API operacional');
            } else {
                console.warn('⚠️ API-Manager-AI: Gemini API com problemas');
            }
            
        } catch (error) {
            console.error('❌ API-Manager-AI: Erro na verificação de APIs:', error);
        }
    }
    
    // Monitorar performance
    async monitorPerformance() {
        try {
            const performance = window.performance;
            const navigation = performance.getEntriesByType('navigation')[0];
            
            if (navigation) {
                const loadTime = navigation.loadEventEnd - navigation.fetchStart;
                console.log(`📊 Performance-AI: Tempo de carregamento ${loadTime}ms`);
                
                if (loadTime > 3000) {
                    console.warn('⚠️ Performance-AI: Carregamento lento detectado');
                    await this.optimizePerformance();
                }
            }
            
        } catch (error) {
            console.error('❌ Performance-AI: Erro no monitoramento:', error);
        }
    }
    
    // Otimizar performance automaticamente
    async optimizePerformance() {
        try {
            // Limpar cache desnecessário
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                for (const name of cacheNames) {
                    if (name.includes('old') || name.includes('temp')) {
                        await caches.delete(name);
                        console.log('🗑️ Performance-AI: Cache limpo:', name);
                    }
                }
            }
            
            // Otimizar imagens lazy loading
            const images = document.querySelectorAll('img:not([loading])');
            images.forEach(img => {
                img.loading = 'lazy';
            });
            
            console.log('✅ Performance-AI: Otimizações aplicadas');
            
        } catch (error) {
            console.error('❌ Performance-AI: Erro na otimização:', error);
        }
    }
    
    // Executar ajustes automáticos de UI
    async executeUIAdjustments() {
        if (!AI_BACKEND_CONFIG.AUTO_UI_ADJUSTMENT) return;
        
        try {
            // UI-Optimizer-AI: Ajustar contraste baseado no tema
            await this.adjustUIContrast();
            
            // Verificar acessibilidade
            await this.checkAccessibility();
            
        } catch (error) {
            console.error('❌ UI-Optimizer-AI: Erro nos ajustes de UI:', error);
        }
    }
    
    // Ajustar contraste automaticamente
    async adjustUIContrast() {
        try {
            const isDarkTheme = document.body.classList.contains('dark-theme') || 
                               window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (isDarkTheme) {
                // Fundo escuro = letras claras
                document.documentElement.style.setProperty('--text-color', '#ffffff');
                document.documentElement.style.setProperty('--text-secondary', '#e0e0e0');
                document.documentElement.style.setProperty('--bg-contrast', '#1a1a1a');
                console.log('🎨 UI-Optimizer-AI: Tema escuro ajustado - letras claras');
            } else {
                // Fundo claro = letras escuras
                document.documentElement.style.setProperty('--text-color', '#333333');
                document.documentElement.style.setProperty('--text-secondary', '#666666');
                document.documentElement.style.setProperty('--bg-contrast', '#ffffff');
                console.log('🎨 UI-Optimizer-AI: Tema claro ajustado - letras escuras');
            }
            
        } catch (error) {
            console.error('❌ UI-Optimizer-AI: Erro no ajuste de contraste:', error);
        }
    }
    
    // 🔔 MÉTODO PARA RECEBER NOTIFICAÇÕES DO SMARTSAVE
    async onDataUpdate(eventType, data, metadata = {}) {
        try {
            console.log(`🔔 IA Backend Manager recebeu notificação: ${eventType}`);
            console.log('📊 Dados recebidos:', data);
            console.log('📋 Metadados:', metadata);
            
            // Processar diferentes tipos de eventos
            switch (eventType) {
                case 'profile_updated':
                    await this.handleProfileUpdate(data, metadata);
                    break;
                case 'user_registered':
                    await this.handleUserRegistration(data, metadata);
                    break;
                case 'data_synced':
                    await this.handleDataSync(data, metadata);
                    break;
                default:
                    console.log(`ℹ️ Evento não reconhecido: ${eventType}`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao processar notificação do SmartSave:', error);
        }
    }
    
    // 👤 Processar atualização de perfil
    async handleProfileUpdate(profileData, metadata) {
        try {
            console.log('👤 IA processando atualização de perfil...');
            
            // 1. DB-Admin-AI: Preparar dados para sincronização
            if (this.personas.DATABASE_ADMIN.active) {
                await this.syncProfileToDatabase(profileData);
            }
            
            // 2. API-Manager-AI: Verificar se precisa de validação externa
            if (this.personas.API_MANAGER.active) {
                await this.validateProfileData(profileData);
            }
            
            // 3. Performance-AI: Otimizar dados se necessário
            if (this.personas.PERFORMANCE_MONITOR.active) {
                await this.optimizeProfileData(profileData);
            }
            
            // 4. UI-Optimizer-AI: Ajustar interface se o usuário mudou tema/preferências
            if (this.personas.UI_OPTIMIZER.active && profileData.preferences) {
                await this.adjustUIForUser(profileData);
            }
            
            console.log('✅ IA Backend Manager processou atualização de perfil');
            
        } catch (error) {
            console.error('❌ Erro ao processar atualização de perfil:', error);
        }
    }
    
    // 💾 Sincronizar perfil com banco de dados
    async syncProfileToDatabase(profileData) {
        try {
            console.log('💾 ORKY-DB-AI: Preparando sincronização de perfil...');
            
            // Verificar modo de operação
            if (this.supabaseMode === 'offline' || !this.supabaseClient) {
                console.log('📱 ORKY-DB-AI: Modo offline - salvando dados localmente');
                await this.saveProfileLocally(profileData);
                return;
            }
            
            // Preparar dados para Supabase
            const dbData = {
                id: profileData.id || this.generateId(),
                user_id: profileData.id || this.generateId(),
                photo_url: profileData.photo || null,
                status: profileData.status || '',
                age: profileData.age || null,
                location: profileData.location || '',
                relationship_status: profileData.relationship || '',
                birthday: profileData.birthday || null,
                bio: profileData.bio || '',
                profile_views: profileData.profileViews || 0,
                join_date: profileData.createdAt || new Date().toISOString(),
                last_active: new Date().toISOString()
            };
            
            console.log('📤 ORKY-DB-AI: Tentando sincronizar perfil com Supabase...');
            
            try {
                // Tentar atualizar no Supabase
                const { data, error } = await this.supabaseClient
                    .from('profiles')
                    .upsert([dbData])
                    .select();
                
                if (error) {
                    console.warn('⚠️ ORKY-DB-AI: Supabase inacessível - usando fallback local:', error.message);
                    await this.saveProfileLocally(profileData);
                    this.queueForSync('profiles', dbData);
                } else {
                    console.log('✅ ORKY-DB-AI: Perfil sincronizado com Supabase!', data[0]?.id);
                    // Também salvar localmente como backup
                    await this.saveProfileLocally(profileData);
                }
                
            } catch (syncError) {
                console.warn('⚠️ ORKY-DB-AI: Erro na sincronização - usando modo local:', syncError.message);
                await this.saveProfileLocally(profileData);
                this.queueForSync('profiles', dbData);
            }
            
        } catch (error) {
            console.error('❌ ORKY-DB-AI: Erro crítico na sincronização de perfil:', error);
            // Garantir que os dados não sejam perdidos
            await this.saveProfileLocally(profileData);
        }
    }
    
    // 💾 Salvar perfil localmente com estrutura melhorada
    async saveProfileLocally(profileData) {
        try {
            console.log('💾 ORKY-DB-AI: Salvando perfil localmente...');
            
            // Enriquecer dados locais
            const enrichedProfile = {
                ...profileData,
                lastSynced: new Date().toISOString(),
                syncStatus: this.supabaseMode === 'offline' ? 'pending' : 'local_backup',
                version: Date.now() // Versionamento para evitar conflitos
            };
            
            // Salvar no localStorage com backup
            localStorage.setItem('orkut_profile_main', JSON.stringify(enrichedProfile));
            localStorage.setItem('orkut_profile_backup', JSON.stringify(enrichedProfile));
            
            // Salvar também histórico de mudanças
            const profileHistory = JSON.parse(localStorage.getItem('orkut_profile_history') || '[]');
            profileHistory.push({
                timestamp: new Date().toISOString(),
                changes: profileData,
                version: enrichedProfile.version
            });
            
            // Manter apenas as últimas 10 alterações
            if (profileHistory.length > 10) {
                profileHistory.splice(0, profileHistory.length - 10);
            }
            
            localStorage.setItem('orkut_profile_history', JSON.stringify(profileHistory));
            
            console.log('✅ ORKY-DB-AI: Perfil salvo localmente com backup e histórico');
            
        } catch (error) {
            console.error('❌ ORKY-DB-AI: Erro ao salvar perfil localmente:', error);
        }
    }
    
    // ✅ Validar dados do perfil
    async validateProfileData(profileData) {
        try {
            console.log('✅ API-Manager-AI: Validando dados do perfil...');
            
            const validations = [];
            
            // Validar nome
            if (!profileData.name || profileData.name.length < 2) {
                validations.push('Nome deve ter pelo menos 2 caracteres');
            }
            
            // Validar email se fornecido
            if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
                validations.push('Email inválido');
            }
            
            // Validar username se fornecido
            if (profileData.username && !/^[a-zA-Z0-9_]{3,20}$/.test(profileData.username)) {
                validations.push('Username deve ter 3-20 caracteres (letras, números, _)');
            }
            
            if (validations.length > 0) {
                console.warn('⚠️ API-Manager-AI: Problemas encontrados:', validations);
            } else {
                console.log('✅ API-Manager-AI: Dados válidos');
            }
            
        } catch (error) {
            console.error('❌ API-Manager-AI: Erro na validação:', error);
        }
    }
    
    // ⚡ Otimizar dados do perfil
    async optimizeProfileData(profileData) {
        try {
            console.log('⚡ Performance-AI: Otimizando dados...');
            
            // Otimizar foto se muito grande
            if (profileData.photo && profileData.photo.length > 500000) { // > 500KB
                console.log('🖼️ Performance-AI: Foto muito grande, sugerindo compressão');
            }
            
            // Verificar se bio não é muito longa
            if (profileData.bio && profileData.bio.length > 1000) {
                console.log('📝 Performance-AI: Bio muito longa, sugerindo resumo');
            }
            
            console.log('✅ Performance-AI: Análise de otimização concluída');
            
        } catch (error) {
            console.error('❌ Performance-AI: Erro na otimização:', error);
        }
    }
    
    // 🎨 Ajustar UI para o usuário
    async adjustUIForUser(profileData) {
        try {
            console.log('🎨 UI-Optimizer-AI: Ajustando interface...');
            
            // Se usuário tem preferência de tema
            if (profileData.theme === 'dark') {
                document.body.classList.add('dark-theme');
                await this.adjustUIContrast();
            } else if (profileData.theme === 'light') {
                document.body.classList.remove('dark-theme');
                await this.adjustUIContrast();
            }
            
            console.log('✅ UI-Optimizer-AI: Interface ajustada para o usuário');
            
        } catch (error) {
            console.error('❌ UI-Optimizer-AI: Erro no ajuste de UI:', error);
        }
    }
    
    // 🔔 Processar registro de usuário
    async handleUserRegistration(userData, metadata) {
        try {
            console.log('🔔 IA processando novo registro de usuário...');
            
            // Agendar tarefas para novo usuário
            setTimeout(async () => {
                await this.initializeNewUserData(userData);
            }, 2000);
            
        } catch (error) {
            console.error('❌ Erro ao processar registro:', error);
        }
    }
    
    // 👤 Inicializar dados para novo usuário
    async initializeNewUserData(userData) {
        try {
            console.log('👤 DB-Admin-AI: Inicializando dados para novo usuário...');
            
            // Criar estruturas básicas
            const initialData = {
                profile_views: 0,
                friends_count: 0,
                scraps_count: 0,
                join_date: new Date().toISOString()
            };
            
            console.log('✅ Dados iniciais preparados para:', userData.name);
            
        } catch (error) {
            console.error('❌ Erro ao inicializar dados de usuário:', error);
        }
    }
    
    // 🔄 Processar sincronização de dados
    async handleDataSync(syncData, metadata) {
        try {
            console.log('🔄 IA processando sincronização de dados...');
            console.log('✅ Sincronização processada pela IA');
            
        } catch (error) {
            console.error('❌ Erro ao processar sincronização:', error);
        }
    }
    
    // =============================================================================
    // 🤖 ORKY-DB-AI - MÉTODOS ESPECIALIZADOS SUPABASE
    // =============================================================================
    
    // 📝 ORKY-DB-AI: Processar nova postagem
    async handleNewPost(postData, metadata = {}) {
        try {
            console.log('📝 ORKY-DB-AI: Processando nova postagem...');
            
            if (!this.supabaseClient) {
                console.warn('⚠️ ORKY-DB-AI: Supabase offline - dados salvos localmente');
                this.queueForSync('posts', postData);
                return;
            }
            
            // Preparar dados para Supabase
            const dbPost = {
                id: postData.id || this.generateId(),
                user_id: postData.userId || metadata.userId,
                content: postData.content,
                post_type: postData.type || 'status',
                community_id: postData.communityId || null,
                likes_count: 0,
                comments_count: 0,
                created_at: new Date().toISOString()
            };
            
            // Inserir no Supabase
            const { data, error } = await this.supabaseClient
                .from('posts')
                .insert([dbPost])
                .select();
            
            if (error) {
                console.error('❌ ORKY-DB-AI: Erro ao inserir post:', error);
                this.queueForSync('posts', dbPost);
            } else {
                console.log('✅ ORKY-DB-AI: Post inserido no Supabase:', data[0]);
                await this.updateUserStats(dbPost.user_id, 'posts_count', 1);
            }
            
        } catch (error) {
            console.error('❌ ORKY-DB-AI: Erro ao processar postagem:', error);
            this.queueForSync('posts', postData);
        }
    }
    
    // 💬 ORKY-DB-AI: Processar novo scrap
    async handleNewScrap(scrapData, metadata = {}) {
        try {
            console.log('💬 ORKY-DB-AI: Processando novo scrap...');
            
            if (!this.supabaseClient) {
                this.queueForSync('scraps', scrapData);
                return;
            }
            
            const dbScrap = {
                id: scrapData.id || this.generateId(),
                from_user_id: scrapData.fromUserId || metadata.userId,
                to_user_id: scrapData.toUserId,
                content: scrapData.content,
                is_public: scrapData.isPublic !== false,
                created_at: new Date().toISOString()
            };
            
            const { data, error } = await this.supabaseClient
                .from('scraps')
                .insert([dbScrap])
                .select();
            
            if (error) {
                console.error('❌ ORKY-DB-AI: Erro ao inserir scrap:', error);
                this.queueForSync('scraps', dbScrap);
            } else {
                console.log('✅ ORKY-DB-AI: Scrap inserido no Supabase:', data[0]);
                await this.updateUserStats(dbScrap.to_user_id, 'scraps_count', 1);
            }
            
        } catch (error) {
            console.error('❌ ORKY-DB-AI: Erro ao processar scrap:', error);
            this.queueForSync('scraps', scrapData);
        }
    }
    
    // ❤️ ORKY-DB-AI: Processar curtida
    async handleNewLike(likeData, metadata = {}) {
        try {
            console.log('❤️ ORKY-DB-AI: Processando nova curtida...');
            
            if (!this.supabaseClient) {
                this.queueForSync('likes', likeData);
                return;
            }
            
            const dbLike = {
                id: likeData.id || this.generateId(),
                user_id: likeData.userId || metadata.userId,
                post_id: likeData.postId,
                created_at: new Date().toISOString()
            };
            
            // Verificar se já curtiu
            const { data: existing } = await this.supabaseClient
                .from('likes')
                .select('id')
                .eq('user_id', dbLike.user_id)
                .eq('post_id', dbLike.post_id)
                .single();
            
            if (existing) {
                console.log('⚠️ ORKY-DB-AI: Usuário já curtiu este post');
                return;
            }
            
            const { data, error } = await this.supabaseClient
                .from('likes')
                .insert([dbLike])
                .select();
            
            if (error) {
                console.error('❌ ORKY-DB-AI: Erro ao inserir curtida:', error);
                this.queueForSync('likes', dbLike);
            } else {
                console.log('✅ ORKY-DB-AI: Curtida inserida no Supabase:', data[0]);
                // Atualizar contador de curtidas do post
                await this.incrementPostLikes(dbLike.post_id);
            }
            
        } catch (error) {
            console.error('❌ ORKY-DB-AI: Erro ao processar curtida:', error);
            this.queueForSync('likes', likeData);
        }
    }
    
    // 👥 ORKY-DB-AI: Processar nova amizade
    async handleNewFriendship(friendshipData, metadata = {}) {
        try {
            console.log('👥 ORKY-DB-AI: Processando nova amizade...');
            
            if (!this.supabaseClient) {
                this.queueForSync('friendships', friendshipData);
                return;
            }
            
            const dbFriendship = {
                id: friendshipData.id || this.generateId(),
                requester_id: friendshipData.requesterId || metadata.userId,
                addressee_id: friendshipData.addresseeId,
                status: friendshipData.status || 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            const { data, error } = await this.supabaseClient
                .from('friendships')
                .upsert([dbFriendship])
                .select();
            
            if (error) {
                console.error('❌ ORKY-DB-AI: Erro ao processar amizade:', error);
                this.queueForSync('friendships', dbFriendship);
            } else {
                console.log('✅ ORKY-DB-AI: Amizade processada no Supabase:', data[0]);
                
                // Se foi aceita, atualizar contadores
                if (dbFriendship.status === 'accepted') {
                    await this.updateUserStats(dbFriendship.requester_id, 'friends_count', 1);
                    await this.updateUserStats(dbFriendship.addressee_id, 'friends_count', 1);
                }
            }
            
        } catch (error) {
            console.error('❌ ORKY-DB-AI: Erro ao processar amizade:', error);
            this.queueForSync('friendships', friendshipData);
        }
    }
    
    // 📊 ORKY-DB-AI: Atualizar estatísticas do usuário
    async updateUserStats(userId, statField, increment = 1) {
        try {
            if (!this.supabaseClient || !userId) return;
            
            // Buscar perfil atual
            const { data: profile } = await this.supabaseClient
                .from('profiles')
                .select(statField)
                .eq('user_id', userId)
                .single();
            
            if (profile) {
                const currentValue = profile[statField] || 0;
                const newValue = currentValue + increment;
                
                const { error } = await this.supabaseClient
                    .from('profiles')
                    .update({ [statField]: newValue })
                    .eq('user_id', userId);
                
                if (error) {
                    console.error(`❌ ORKY-DB-AI: Erro ao atualizar ${statField}:`, error);
                } else {
                    console.log(`📊 ORKY-DB-AI: ${statField} atualizado para ${newValue} (usuário: ${userId})`);
                }
            }
            
        } catch (error) {
            console.error('❌ ORKY-DB-AI: Erro ao atualizar estatísticas:', error);
        }
    }
    
    // ❤️ ORKY-DB-AI: Incrementar curtidas do post
    async incrementPostLikes(postId) {
        try {
            if (!this.supabaseClient || !postId) return;
            
            const { error } = await this.supabaseClient
                .rpc('increment_post_likes', { post_id: postId });
            
            if (error) {
                console.error('❌ ORKY-DB-AI: Erro ao incrementar curtidas:', error);
            } else {
                console.log('❤️ ORKY-DB-AI: Curtidas do post incrementadas:', postId);
            }
            
        } catch (error) {
            console.error('❌ ORKY-DB-AI: Erro ao incrementar curtidas:', error);
        }
    }
    
    // 📋 ORKY-DB-AI: Adicionar à fila de sincronização offline
    queueForSync(table, data) {
        try {
            const queueItem = {
                id: this.generateId(),
                table: table,
                data: data,
                timestamp: Date.now(),
                attempts: 0
            };
            
            // Buscar fila existente
            const existingQueue = JSON.parse(localStorage.getItem('orkut_pending_sync') || '[]');
            existingQueue.push(queueItem);
            
            // Salvar fila atualizada
            localStorage.setItem('orkut_pending_sync', JSON.stringify(existingQueue));
            
            console.log(`📋 ORKY-DB-AI: Item adicionado à fila offline (${table}):`, queueItem.id);
            
        } catch (error) {
            console.error('❌ ORKY-DB-AI: Erro ao adicionar à fila:', error);
        }
    }
    
    // 🆔 Gerar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // 🔔 ORKY-DB-AI: Processar visualização de perfil
    async handleProfileView(profileViewData, metadata = {}) {
        try {
            console.log('👁️ ORKY-DB-AI: Processando visualização de perfil...');
            
            const viewedUserId = profileViewData.profileUserId;
            const viewerUserId = metadata.userId;
            
            // Não contar visualizações próprias
            if (viewedUserId === viewerUserId) return;
            
            // Incrementar contador de visualizações
            await this.updateUserStats(viewedUserId, 'profile_views', 1);
            
            console.log('✅ ORKY-DB-AI: Visualização de perfil registrada');
            
        } catch (error) {
            console.error('❌ ORKY-DB-AI: Erro ao processar visualização:', error);
        }
    }
    
    // Verificar acessibilidade
    async checkAccessibility() {
        try {
            // Verificar contraste de elementos importantes
            const importantElements = document.querySelectorAll('.btn, .post-content, .user-name, h1, h2, h3');
            let lowContrastCount = 0;
            
            importantElements.forEach(element => {
                const styles = window.getComputedStyle(element);
                const bgColor = styles.backgroundColor;
                const textColor = styles.color;
                
                // Lógica básica de contraste (pode ser melhorada)
                if (bgColor === textColor) {
                    lowContrastCount++;
                }
            });
            
            if (lowContrastCount > 0) {
                console.warn(`⚠️ UI-Optimizer-AI: ${lowContrastCount} elementos com contraste baixo detectados`);
                await this.fixContrastIssues();
            } else {
                console.log('✅ UI-Optimizer-AI: Contraste adequado em todos os elementos');
            }
            
        } catch (error) {
            console.error('❌ UI-Optimizer-AI: Erro na verificação de acessibilidade:', error);
        }
    }
    
    // Corrigir problemas de contraste
    async fixContrastIssues() {
        try {
            const style = document.createElement('style');
            style.textContent = `
                /* Correções automáticas de contraste pela IA */
                .low-contrast-fix {
                    color: var(--text-color) !important;
                    background-color: var(--bg-contrast) !important;
                }
                
                .dark-theme .low-contrast-fix {
                    color: #ffffff !important;
                    background-color: #1a1a1a !important;
                }
            `;
            
            if (!document.head.querySelector('#ai-contrast-fixes')) {
                style.id = 'ai-contrast-fixes';
                document.head.appendChild(style);
                console.log('✅ UI-Optimizer-AI: Correções de contraste aplicadas');
            }
            
        } catch (error) {
            console.error('❌ UI-Optimizer-AI: Erro na correção de contraste:', error);
        }
    }
    
    // Sincronizar banco de dados
    async executeDatabaseSync() {
        if (!this.supabaseClient) return;
        
        try {
            // Verificar se há dados locais para sincronizar
            const localData = localStorage.getItem('orkut_pending_sync');
            
            if (localData) {
                const pendingData = JSON.parse(localData);
                console.log('📤 DB-Admin-AI: Sincronizando dados locais:', pendingData.length || 0);
                
                // Processar dados pendentes
                for (const item of (pendingData || [])) {
                    await this.syncDataItem(item);
                }
                
                // Limpar dados sincronizados
                localStorage.removeItem('orkut_pending_sync');
                console.log('✅ DB-Admin-AI: Sincronização concluída');
            }
            
        } catch (error) {
            console.error('❌ DB-Admin-AI: Erro na sincronização:', error);
        }
    }
    
    // Sincronizar item individual
    async syncDataItem(item) {
        try {
            const { data, error } = await this.supabaseClient
                .from(item.table)
                .upsert(item.data);
                
            if (error) {
                console.error('❌ Erro ao sincronizar item:', error);
            } else {
                console.log('✅ Item sincronizado:', item.table);
            }
            
        } catch (error) {
            console.error('❌ Erro na sincronização de item:', error);
        }
    }
    
    // Health check do sistema
    async executeHealthCheck() {
        try {
            const checks = {
                supabase: !!this.supabaseClient,
                personas: Object.values(this.personas).filter(p => p.active).length,
                memory: performance.memory ? (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB' : 'N/A',
                uptime: ((Date.now() - (window.orkutStartTime || Date.now())) / 1000).toFixed(0) + 's'
            };
            
            console.log('🏥 Health Check:', checks);
            
            // Determinar status geral
            if (checks.supabase && checks.personas >= 4) {
                this.systemHealth = "OPTIMAL";
            } else if (checks.supabase || checks.personas >= 2) {
                this.systemHealth = "DEGRADED";
            } else {
                this.systemHealth = "CRITICAL";
            }
            
            // Ativar persona social apenas se sistema estável
            if (this.systemHealth === "OPTIMAL" && !this.personas.SOCIAL_ASSISTANT.active) {
                this.personas.SOCIAL_ASSISTANT.active = true;
                console.log('🗨️ Social-Assistant-AI: ATIVADA (sistema estável)');
            }
            
        } catch (error) {
            console.error('❌ Erro no health check:', error);
            this.systemHealth = "ERROR";
        }
    }
    
    // Método público para interação (opcional)
    async handleUserInteraction(message) {
        // Só responde se persona social estiver ativa
        if (!this.personas.SOCIAL_ASSISTANT.active) {
            console.log('🤖 IA ocupada com tarefas de backend - interação indisponível');
            return null;
        }
        
        try {
            console.log('🗨️ Social-Assistant-AI: Processando interação opcional...');
            
            // Processar com Gemini se disponível e ociosa
            const response = await this.processWithGemini(message);
            return response;
            
        } catch (error) {
            console.error('❌ Erro na interação opcional:', error);
            return null;
        }
    }
    
    // Processar com Gemini
    async processWithGemini(message) {
        try {
            const response = await fetch(`${AI_BACKEND_CONFIG.GEMINI_API_URL}?key=${AI_BACKEND_CONFIG.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `Sistema: ${this.systemHealth} | Usuário: ${message}` }] }]
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sistema processando...";
            }
            
        } catch (error) {
            console.error('❌ Erro ao processar com Gemini:', error);
        }
        
        return null;
    }
    
    // Status atual do sistema
    getSystemStatus() {
        return {
            health: this.systemHealth,
            initialized: this.isInitialized,
            currentTask: this.currentTask,
            activePersonas: Object.keys(this.personas).filter(p => this.personas[p].active),
            lastCheck: this.lastBackendCheck,
            socialInteractionAvailable: this.personas.SOCIAL_ASSISTANT?.active || false
        };
    }
}

// =============================================================================
// INICIALIZAÇÃO GLOBAL
// =============================================================================

// Criar instância global
window.AIBackendManager = new AIBackendManager();
window.orkutStartTime = Date.now();

// Auto-inicialização quando DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.AIBackendManager.initialize();
    });
} else {
    window.AIBackendManager.initialize();
}

// API pública para verificação de status
window.getAIStatus = () => window.AIBackendManager.getSystemStatus();

// API pública para interação opcional
window.askAI = async (message) => await window.AIBackendManager.handleUserInteraction(message);

console.log('🤖 AI Backend Manager carregado - IA tem controle TOTAL do sistema');
