// Orkut Retrô - Verificador de Inicialização
// Script para diagnosticar e verificar se todos os sistemas estão funcionando

console.log('🚀 Iniciando verificação de sistema...');

// Verificar se o SmartSave está funcionando
function checkSmartSave() {
    console.log('🔍 Verificando SmartSave...');
    
    if (typeof window.SmartSave === 'undefined') {
        console.warn('⚠️ SmartSave não encontrado!');
        return false;
    }
    
    if (typeof window.getCurrentUser !== 'function') {
        console.warn('⚠️ Função getCurrentUser não encontrada!');
        return false;
    }
    
    if (typeof window.saveProfile !== 'function') {
        console.warn('⚠️ Função saveProfile não encontrada!');
        return false;
    }
    
    // Testar criação de usuário padrão
    try {
        const testUser = window.SmartSave.createDefaultUser();
        if (!testUser || !testUser.name) {
            console.warn('⚠️ Erro ao criar usuário padrão!');
            return false;
        }
        console.log('✅ SmartSave funcionando corretamente!');
        return true;
    } catch (error) {
        console.error('❌ Erro no SmartSave:', error);
        return false;
    }
}

// Verificar se os dados do usuário estão sendo carregados
function checkUserData() {
    console.log('🔍 Verificando dados do usuário...');
    
    const user = window.getCurrentUser();
    if (!user) {
        console.warn('⚠️ Nenhum usuário encontrado!');
        return false;
    }
    
    console.log('👤 Usuário carregado:', {
        name: user.name,
        username: user.username,
        hasPhoto: !!user.photo,
        status: user.status,
        profileViews: user.profileViews
    });
    
    console.log('✅ Dados do usuário carregados com sucesso!');
    return true;
}

// Verificar se os elementos da interface estão sendo atualizados
function checkUIUpdates() {
    console.log('🔍 Verificando atualizações da interface...');
    
    const elementsToCheck = [
        'headerUserName',
        'sidebarUserName', 
        'profileName'
    ];
    
    let updatedElements = 0;
    
    elementsToCheck.forEach(id => {
        const element = document.getElementById(id);
        if (element && element.textContent && element.textContent !== 'Usuário') {
            updatedElements++;
            console.log(`✅ ${id}: ${element.textContent}`);
        } else {
            console.log(`⚠️ ${id}: não atualizado ou não encontrado`);
        }
    });
    
    if (updatedElements > 0) {
        console.log(`✅ ${updatedElements}/${elementsToCheck.length} elementos da interface atualizados!`);
        return true;
    } else {
        console.warn('⚠️ Nenhum elemento da interface foi atualizado!');
        return false;
    }
}

// Verificar conectividade com o banco (simulado)
function checkDatabaseConnection() {
    console.log('🔍 Verificando conexão com banco de dados...');
    
    // Simular verificação de conexão
    const hasConnection = navigator.onLine;
    
    if (hasConnection) {
        console.log('✅ Conexão com internet disponível');
        console.log('📡 Sistema pronto para sincronização com Supabase');
        return true;
    } else {
        console.warn('⚠️ Sem conexão com internet - funcionando offline');
        console.log('💾 Dados sendo salvos localmente');
        return false;
    }
}

// Verificar localStorage
function checkLocalStorage() {
    console.log('🔍 Verificando localStorage...');
    
    try {
        // Testar se localStorage está disponível
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        
        // Verificar dados existentes
        const userData = localStorage.getItem('orkutUser');
        const syncQueue = localStorage.getItem('smartSave_syncQueue');
        
        console.log('✅ localStorage funcionando');
        console.log('📦 Dados do usuário:', userData ? 'encontrados' : 'não encontrados');
        console.log('🔄 Fila de sincronização:', syncQueue ? 'ativa' : 'vazia');
        
        return true;
    } catch (error) {
        console.error('❌ Erro no localStorage:', error);
        return false;
    }
}

// Relatório completo do sistema
function generateSystemReport() {
    console.log('\n📋 RELATÓRIO COMPLETO DO SISTEMA');
    console.log('================================');
    
    const checks = {
        smartSave: checkSmartSave(),
        userData: checkUserData(), 
        uiUpdates: checkUIUpdates(),
        database: checkDatabaseConnection(),
        localStorage: checkLocalStorage()
    };
    
    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    
    console.log(`\n🎯 RESULTADO: ${passed}/${total} verificações aprovadas`);
    
    if (passed === total) {
        console.log('🎉 SISTEMA TOTALMENTE FUNCIONAL! 🎉');
        console.log('💜 Orkut 2025 está pronto para uso!');
        
        // Mostrar notificação de sucesso
        if (typeof showNotification === 'function') {
            showNotification(
                'Sistema Operacional! 🎉',
                'Todos os componentes estão funcionando perfeitamente',
                '💜'
            );
        }
    } else {
        console.log('⚠️ SISTEMA PARCIALMENTE FUNCIONAL');
        console.log('Alguns componentes podem não estar funcionando corretamente');
        
        // Mostrar quais verificações falharam
        Object.entries(checks).forEach(([check, passed]) => {
            if (!passed) {
                console.log(`❌ Falha em: ${check}`);
            }
        });
        
        if (typeof showNotification === 'function') {
            showNotification(
                'Sistema Parcial ⚠️',
                'Algumas funcionalidades podem estar limitadas',
                '🔧'
            );
        }
    }
    
    return { passed, total, checks };
}

// Executar verificação quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para todos os scripts carregarem
    setTimeout(() => {
        const report = generateSystemReport();
        
        // Salvar relatório para debug
        window.orkutSystemReport = report;
        
        // Adicionar informações extras ao console para debug
        console.log('\n🔧 DEBUG INFO:');
        console.log('Current page:', window.getCurrentPage ? window.getCurrentPage() : 'unknown');
        console.log('User agent:', navigator.userAgent);
        console.log('Viewport:', `${window.innerWidth}x${window.innerHeight}`);
        console.log('Local storage size:', JSON.stringify(localStorage).length + ' chars');
        
    }, 2000); // 2 segundos para garantir que tudo carregou
});

// Função para executar verificação manual
window.runSystemCheck = generateSystemReport;

console.log('✅ Verificador de sistema carregado! Digite runSystemCheck() para executar manualmente.');
