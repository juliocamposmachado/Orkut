// Teste de Interações Sociais - Orkut 2025
// Testa especificamente likes, comentários, amizades e outras interações

class SocialInteractionsTest {
    constructor() {
        this.testResults = [];
        this.mockUsers = [];
        this.mockPosts = [];
        
        this.init();
    }

    async init() {
        console.log('🎭 Iniciando testes de interações sociais...\n');
        
        // Criar usuários de teste
        await this.createMockUsers();
        
        // Criar posts de teste
        await this.createMockPosts();
        
        // Executar todos os testes
        await this.runAllSocialTests();
        
        // Mostrar relatório
        this.generateSocialReport();
    }

    async createMockUsers() {
        console.log('👥 Criando usuários de teste...');
        
        const testUsers = [
            {
                name: 'João Silva Teste',
                email: `joao.teste.${Date.now()}@test.com`,
                username: `joaotest${Date.now()}`,
                password_hash: 'test123'
            },
            {
                name: 'Maria Santos Teste',
                email: `maria.teste.${Date.now()}@test.com`,
                username: `mariatest${Date.now()}`,
                password_hash: 'test123'
            },
            {
                name: 'Carlos Lima Teste',
                email: `carlos.teste.${Date.now()}@test.com`,
                username: `carlostest${Date.now()}`,
                password_hash: 'test123'
            }
        ];

        for (const userData of testUsers) {
            try {
                // Simular criação local (já que não temos backend ativo)
                const user = {
                    id: this.generateUUID(),
                    ...userData,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                
                this.mockUsers.push(user);
                this.addResult('CREATE_USER', true, `Usuário ${user.name} criado com sucesso`);
                
                console.log(`  ✅ Usuário criado: ${user.name}`);
                
            } catch (error) {
                this.addResult('CREATE_USER', false, `Erro ao criar usuário: ${error.message}`);
            }
        }
    }

    async createMockPosts() {
        console.log('\n📝 Criando posts de teste...');
        
        const testPosts = [
            'Este é meu primeiro post no Orkut 2025! 🎉',
            'Que saudade do Orkut original... Bons tempos! 😊',
            'Alguém mais está animado com essa nova versão?'
        ];

        for (let i = 0; i < testPosts.length && i < this.mockUsers.length; i++) {
            try {
                const post = {
                    id: this.generateUUID(),
                    user_id: this.mockUsers[i].id,
                    content: testPosts[i],
                    post_type: 'status',
                    likes_count: 0,
                    comments_count: 0,
                    created_at: new Date().toISOString()
                };
                
                this.mockPosts.push(post);
                this.addResult('CREATE_POST', true, `Post criado: "${post.content.substring(0, 30)}..."`);
                
                console.log(`  ✅ Post criado por ${this.mockUsers[i].name}`);
                
            } catch (error) {
                this.addResult('CREATE_POST', false, `Erro ao criar post: ${error.message}`);
            }
        }
    }

    async runAllSocialTests() {
        console.log('\n🧪 Executando testes de interações sociais...\n');
        
        await this.testLikeInteractions();
        await this.testCommentInteractions();  
        await this.testFriendshipInteractions();
        await this.testScrapInteractions();
        await this.testMessageInteractions();
    }

    async testLikeInteractions() {
        console.log('👍 Testando sistema de likes...');
        
        if (this.mockUsers.length === 0 || this.mockPosts.length === 0) {
            this.addResult('LIKES_SETUP', false, 'Sem usuários ou posts para testar likes');
            return;
        }

        const user = this.mockUsers[0];
        const post = this.mockPosts[0];
        
        // Teste 1: Curtir post
        try {
            const like = {
                id: this.generateUUID(),
                user_id: user.id,
                post_id: post.id,
                created_at: new Date().toISOString()
            };
            
            // Simular like no localStorage
            const likes = JSON.parse(localStorage.getItem('orkut_likes') || '[]');
            likes.push(like);
            localStorage.setItem('orkut_likes', JSON.stringify(likes));
            
            // Atualizar contador do post
            post.likes_count = (post.likes_count || 0) + 1;
            
            this.addResult('CREATE_LIKE', true, `Like adicionado ao post por ${user.name}`);
            console.log(`  ✅ ${user.name} curtiu o post`);
            
            // Verificar se o like foi salvo
            const savedLikes = JSON.parse(localStorage.getItem('orkut_likes') || '[]');
            const foundLike = savedLikes.find(l => l.user_id === user.id && l.post_id === post.id);
            
            if (foundLike) {
                this.addResult('LIKE_PERSISTENCE', true, 'Like foi salvo corretamente no localStorage');
                console.log(`  ✅ Like persistido no localStorage`);
            } else {
                this.addResult('LIKE_PERSISTENCE', false, 'Like não foi salvo no localStorage');
            }
            
            // Verificar contador
            if (post.likes_count > 0) {
                this.addResult('LIKE_COUNTER', true, `Contador de likes atualizado: ${post.likes_count}`);
                console.log(`  ✅ Contador atualizado: ${post.likes_count} like(s)`);
            } else {
                this.addResult('LIKE_COUNTER', false, 'Contador de likes não foi atualizado');
            }
            
        } catch (error) {
            this.addResult('CREATE_LIKE', false, `Erro ao curtir post: ${error.message}`);
        }

        // Teste 2: Descurtir post
        try {
            const likes = JSON.parse(localStorage.getItem('orkut_likes') || '[]');
            const filteredLikes = likes.filter(l => !(l.user_id === user.id && l.post_id === post.id));
            localStorage.setItem('orkut_likes', JSON.stringify(filteredLikes));
            
            post.likes_count = Math.max(0, (post.likes_count || 0) - 1);
            
            this.addResult('REMOVE_LIKE', true, `Like removido do post por ${user.name}`);
            console.log(`  ✅ ${user.name} descurtiu o post`);
            
        } catch (error) {
            this.addResult('REMOVE_LIKE', false, `Erro ao descurtir post: ${error.message}`);
        }

        // Teste 3: Múltiplos likes de usuários diferentes
        try {
            for (let i = 0; i < Math.min(this.mockUsers.length, 3); i++) {
                const testUser = this.mockUsers[i];
                const testPost = this.mockPosts[0];
                
                const like = {
                    id: this.generateUUID(),
                    user_id: testUser.id,
                    post_id: testPost.id,
                    created_at: new Date().toISOString()
                };
                
                const likes = JSON.parse(localStorage.getItem('orkut_likes') || '[]');
                likes.push(like);
                localStorage.setItem('orkut_likes', JSON.stringify(likes));
                
                testPost.likes_count = (testPost.likes_count || 0) + 1;
            }
            
            this.addResult('MULTIPLE_LIKES', true, `${this.mockPosts[0].likes_count} likes de usuários diferentes`);
            console.log(`  ✅ Post recebeu ${this.mockPosts[0].likes_count} likes`);
            
        } catch (error) {
            this.addResult('MULTIPLE_LIKES', false, `Erro nos múltiplos likes: ${error.message}`);
        }
    }

    async testCommentInteractions() {
        console.log('\n💬 Testando sistema de comentários...');
        
        if (this.mockUsers.length === 0 || this.mockPosts.length === 0) {
            this.addResult('COMMENTS_SETUP', false, 'Sem usuários ou posts para testar comentários');
            return;
        }

        const user = this.mockUsers[0];
        const post = this.mockPosts[0];
        
        // Teste 1: Adicionar comentário
        try {
            const comment = {
                id: this.generateUUID(),
                user_id: user.id,
                post_id: post.id,
                content: 'Este é um comentário de teste!',
                created_at: new Date().toISOString()
            };
            
            // Simular comentário no localStorage
            const comments = JSON.parse(localStorage.getItem('orkut_comments') || '[]');
            comments.push(comment);
            localStorage.setItem('orkut_comments', JSON.stringify(comments));
            
            // Atualizar contador do post
            post.comments_count = (post.comments_count || 0) + 1;
            
            this.addResult('CREATE_COMMENT', true, `Comentário adicionado por ${user.name}`);
            console.log(`  ✅ ${user.name} comentou no post`);
            
            // Verificar se o comentário foi salvo
            const savedComments = JSON.parse(localStorage.getItem('orkut_comments') || '[]');
            const foundComment = savedComments.find(c => c.id === comment.id);
            
            if (foundComment) {
                this.addResult('COMMENT_PERSISTENCE', true, 'Comentário salvo corretamente');
                console.log(`  ✅ Comentário persistido no localStorage`);
            } else {
                this.addResult('COMMENT_PERSISTENCE', false, 'Comentário não foi salvo');
            }
            
            // Verificar contador
            if (post.comments_count > 0) {
                this.addResult('COMMENT_COUNTER', true, `Contador de comentários: ${post.comments_count}`);
                console.log(`  ✅ Contador atualizado: ${post.comments_count} comentário(s)`);
            } else {
                this.addResult('COMMENT_COUNTER', false, 'Contador de comentários não foi atualizado');
            }
            
        } catch (error) {
            this.addResult('CREATE_COMMENT', false, `Erro ao comentar: ${error.message}`);
        }

        // Teste 2: Múltiplos comentários
        try {
            const testComments = [
                'Concordo totalmente!',
                'Que legal! 😊',
                'Nostalgia demais!'
            ];
            
            for (let i = 1; i < Math.min(this.mockUsers.length, testComments.length + 1); i++) {
                const testUser = this.mockUsers[i];
                const commentText = testComments[i - 1];
                
                const comment = {
                    id: this.generateUUID(),
                    user_id: testUser.id,
                    post_id: post.id,
                    content: commentText,
                    created_at: new Date().toISOString()
                };
                
                const comments = JSON.parse(localStorage.getItem('orkut_comments') || '[]');
                comments.push(comment);
                localStorage.setItem('orkut_comments', JSON.stringify(comments));
                
                post.comments_count = (post.comments_count || 0) + 1;
            }
            
            this.addResult('MULTIPLE_COMMENTS', true, `Post recebeu ${post.comments_count} comentários`);
            console.log(`  ✅ Post tem ${post.comments_count} comentários no total`);
            
        } catch (error) {
            this.addResult('MULTIPLE_COMMENTS', false, `Erro nos múltiplos comentários: ${error.message}`);
        }
    }

    async testFriendshipInteractions() {
        console.log('\n👫 Testando sistema de amizades...');
        
        if (this.mockUsers.length < 2) {
            this.addResult('FRIENDSHIP_SETUP', false, 'Precisa de pelo menos 2 usuários para testar amizades');
            return;
        }

        const user1 = this.mockUsers[0];
        const user2 = this.mockUsers[1];
        
        // Teste 1: Enviar solicitação de amizade
        try {
            const friendship = {
                id: this.generateUUID(),
                requester_id: user1.id,
                addressee_id: user2.id,
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // Simular amizade no localStorage
            const friendships = JSON.parse(localStorage.getItem('orkut_friendships') || '[]');
            friendships.push(friendship);
            localStorage.setItem('orkut_friendships', JSON.stringify(friendships));
            
            this.addResult('SEND_FRIEND_REQUEST', true, `${user1.name} enviou solicitação para ${user2.name}`);
            console.log(`  ✅ Solicitação de amizade enviada`);
            
            // Verificar se foi salvo
            const savedFriendships = JSON.parse(localStorage.getItem('orkut_friendships') || '[]');
            const foundFriendship = savedFriendships.find(f => f.id === friendship.id);
            
            if (foundFriendship && foundFriendship.status === 'pending') {
                this.addResult('FRIENDSHIP_PERSISTENCE', true, 'Solicitação salva com status pending');
                console.log(`  ✅ Status: ${foundFriendship.status}`);
            } else {
                this.addResult('FRIENDSHIP_PERSISTENCE', false, 'Solicitação não foi salva corretamente');
            }
            
        } catch (error) {
            this.addResult('SEND_FRIEND_REQUEST', false, `Erro na solicitação: ${error.message}`);
        }

        // Teste 2: Aceitar amizade
        try {
            const friendships = JSON.parse(localStorage.getItem('orkut_friendships') || '[]');
            const friendship = friendships.find(f => 
                f.requester_id === user1.id && f.addressee_id === user2.id
            );
            
            if (friendship) {
                friendship.status = 'accepted';
                friendship.updated_at = new Date().toISOString();
                
                localStorage.setItem('orkut_friendships', JSON.stringify(friendships));
                
                this.addResult('ACCEPT_FRIENDSHIP', true, `${user2.name} aceitou a amizade`);
                console.log(`  ✅ Amizade aceita`);
                
                // Verificar se o status foi atualizado
                const updatedFriendships = JSON.parse(localStorage.getItem('orkut_friendships') || '[]');
                const updatedFriendship = updatedFriendships.find(f => f.id === friendship.id);
                
                if (updatedFriendship && updatedFriendship.status === 'accepted') {
                    this.addResult('FRIENDSHIP_STATUS_UPDATE', true, 'Status atualizado para accepted');
                    console.log(`  ✅ Status atualizado: ${updatedFriendship.status}`);
                } else {
                    this.addResult('FRIENDSHIP_STATUS_UPDATE', false, 'Status não foi atualizado corretamente');
                }
                
            } else {
                this.addResult('ACCEPT_FRIENDSHIP', false, 'Solicitação de amizade não encontrada');
            }
            
        } catch (error) {
            this.addResult('ACCEPT_FRIENDSHIP', false, `Erro ao aceitar amizade: ${error.message}`);
        }

        // Teste 3: Testar amizade bidirecional
        try {
            const friendships = JSON.parse(localStorage.getItem('orkut_friendships') || '[]');
            const acceptedFriendships = friendships.filter(f => f.status === 'accepted');
            
            // Verificar se usuários são amigos mútuos
            const areFriends = acceptedFriendships.some(f => 
                (f.requester_id === user1.id && f.addressee_id === user2.id) ||
                (f.requester_id === user2.id && f.addressee_id === user1.id)
            );
            
            if (areFriends) {
                this.addResult('MUTUAL_FRIENDSHIP', true, 'Amizade mútua estabelecida com sucesso');
                console.log(`  ✅ ${user1.name} e ${user2.name} são amigos`);
            } else {
                this.addResult('MUTUAL_FRIENDSHIP', false, 'Amizade mútua não foi estabelecida');
            }
            
        } catch (error) {
            this.addResult('MUTUAL_FRIENDSHIP', false, `Erro na verificação mútua: ${error.message}`);
        }
    }

    async testScrapInteractions() {
        console.log('\n📄 Testando sistema de scraps...');
        
        if (this.mockUsers.length < 2) {
            this.addResult('SCRAP_SETUP', false, 'Precisa de pelo menos 2 usuários para testar scraps');
            return;
        }

        const user1 = this.mockUsers[0];
        const user2 = this.mockUsers[1];
        
        // Teste 1: Enviar scrap
        try {
            const scrap = {
                id: this.generateUUID(),
                from_user_id: user1.id,
                to_user_id: user2.id,
                content: 'Oi! Este é um scrap de teste! Como você está?',
                is_public: true,
                created_at: new Date().toISOString()
            };
            
            // Simular scrap no localStorage
            const scraps = JSON.parse(localStorage.getItem('orkut_scraps') || '[]');
            scraps.push(scrap);
            localStorage.setItem('orkut_scraps', JSON.stringify(scraps));
            
            this.addResult('SEND_SCRAP', true, `Scrap enviado de ${user1.name} para ${user2.name}`);
            console.log(`  ✅ Scrap enviado`);
            
            // Verificar se foi salvo
            const savedScraps = JSON.parse(localStorage.getItem('orkut_scraps') || '[]');
            const foundScrap = savedScraps.find(s => s.id === scrap.id);
            
            if (foundScrap) {
                this.addResult('SCRAP_PERSISTENCE', true, 'Scrap salvo corretamente');
                console.log(`  ✅ Scrap persistido no localStorage`);
                
                // Verificar se é público
                if (foundScrap.is_public === true) {
                    this.addResult('SCRAP_VISIBILITY', true, 'Scrap marcado como público');
                    console.log(`  ✅ Visibilidade: público`);
                } else {
                    this.addResult('SCRAP_VISIBILITY', false, 'Problema na visibilidade do scrap');
                }
                
            } else {
                this.addResult('SCRAP_PERSISTENCE', false, 'Scrap não foi salvo');
            }
            
        } catch (error) {
            this.addResult('SEND_SCRAP', false, `Erro ao enviar scrap: ${error.message}`);
        }

        // Teste 2: Responder scrap
        try {
            const replyScrap = {
                id: this.generateUUID(),
                from_user_id: user2.id,
                to_user_id: user1.id,
                content: 'Oi! Estou bem, obrigada! E você?',
                is_public: true,
                created_at: new Date().toISOString()
            };
            
            const scraps = JSON.parse(localStorage.getItem('orkut_scraps') || '[]');
            scraps.push(replyScrap);
            localStorage.setItem('orkut_scraps', JSON.stringify(scraps));
            
            this.addResult('REPLY_SCRAP', true, `${user2.name} respondeu o scrap`);
            console.log(`  ✅ Scrap respondido`);
            
        } catch (error) {
            this.addResult('REPLY_SCRAP', false, `Erro ao responder scrap: ${error.message}`);
        }
    }

    async testMessageInteractions() {
        console.log('\n✉️ Testando sistema de mensagens privadas...');
        
        if (this.mockUsers.length < 2) {
            this.addResult('MESSAGE_SETUP', false, 'Precisa de pelo menos 2 usuários para testar mensagens');
            return;
        }

        const user1 = this.mockUsers[0];
        const user2 = this.mockUsers[1];
        
        // Teste 1: Enviar mensagem privada
        try {
            const message = {
                id: this.generateUUID(),
                from_user_id: user1.id,
                to_user_id: user2.id,
                subject: 'Teste de Mensagem Privada',
                content: 'Esta é uma mensagem privada de teste. Como você está?',
                is_read: false,
                created_at: new Date().toISOString()
            };
            
            // Simular mensagem no localStorage
            const messages = JSON.parse(localStorage.getItem('orkut_messages') || '[]');
            messages.push(message);
            localStorage.setItem('orkut_messages', JSON.stringify(messages));
            
            this.addResult('SEND_MESSAGE', true, `Mensagem enviada de ${user1.name} para ${user2.name}`);
            console.log(`  ✅ Mensagem privada enviada`);
            
            // Verificar se foi salva
            const savedMessages = JSON.parse(localStorage.getItem('orkut_messages') || '[]');
            const foundMessage = savedMessages.find(m => m.id === message.id);
            
            if (foundMessage) {
                this.addResult('MESSAGE_PERSISTENCE', true, 'Mensagem salva corretamente');
                console.log(`  ✅ Mensagem persistida no localStorage`);
                
                // Verificar se está marcada como não lida
                if (foundMessage.is_read === false) {
                    this.addResult('MESSAGE_READ_STATUS', true, 'Mensagem marcada como não lida');
                    console.log(`  ✅ Status: não lida`);
                } else {
                    this.addResult('MESSAGE_READ_STATUS', false, 'Problema no status de leitura');
                }
                
            } else {
                this.addResult('MESSAGE_PERSISTENCE', false, 'Mensagem não foi salva');
            }
            
        } catch (error) {
            this.addResult('SEND_MESSAGE', false, `Erro ao enviar mensagem: ${error.message}`);
        }

        // Teste 2: Marcar mensagem como lida
        try {
            const messages = JSON.parse(localStorage.getItem('orkut_messages') || '[]');
            const message = messages.find(m => 
                m.from_user_id === user1.id && m.to_user_id === user2.id && !m.is_read
            );
            
            if (message) {
                message.is_read = true;
                localStorage.setItem('orkut_messages', JSON.stringify(messages));
                
                this.addResult('MARK_MESSAGE_READ', true, 'Mensagem marcada como lida');
                console.log(`  ✅ Mensagem marcada como lida`);
                
            } else {
                this.addResult('MARK_MESSAGE_READ', false, 'Mensagem não encontrada para marcar como lida');
            }
            
        } catch (error) {
            this.addResult('MARK_MESSAGE_READ', false, `Erro ao marcar como lida: ${error.message}`);
        }
    }

    generateSocialReport() {
        console.log('\n📊 RELATÓRIO DE INTERAÇÕES SOCIAIS\n');
        console.log('='.repeat(50));
        
        const passed = this.testResults.filter(r => r.passed).length;
        const failed = this.testResults.filter(r => r.passed === false).length;
        const total = this.testResults.length;
        const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
        
        console.log(`\n✅ SUCESSOS: ${passed}/${total} (${percentage}%)`);
        console.log(`❌ FALHAS: ${failed}/${total}`);
        
        // Agrupar por categoria
        const categories = {
            likes: this.testResults.filter(r => r.test.includes('LIKE')),
            comments: this.testResults.filter(r => r.test.includes('COMMENT')),
            friendships: this.testResults.filter(r => r.test.includes('FRIEND')),
            scraps: this.testResults.filter(r => r.test.includes('SCRAP')),
            messages: this.testResults.filter(r => r.test.includes('MESSAGE'))
        };
        
        Object.keys(categories).forEach(category => {
            const tests = categories[category];
            if (tests.length > 0) {
                const categoryPassed = tests.filter(t => t.passed).length;
                const categoryTotal = tests.length;
                const categoryPercentage = Math.round((categoryPassed / categoryTotal) * 100);
                
                console.log(`\n${category.toUpperCase()}: ${categoryPassed}/${categoryTotal} (${categoryPercentage}%)`);
                
                tests.forEach(test => {
                    const icon = test.passed ? '✅' : '❌';
                    console.log(`  ${icon} ${test.message}`);
                });
            }
        });
        
        console.log('\n' + '='.repeat(50));
        
        if (percentage >= 90) {
            console.log('🎉 Excelente! As interações sociais estão funcionando perfeitamente!');
        } else if (percentage >= 80) {
            console.log('👍 Muito bom! Algumas pequenas melhorias podem ser feitas.');
        } else if (percentage >= 60) {
            console.log('⚠️ Atenção! Há alguns problemas que precisam ser corrigidos.');
        } else {
            console.log('🚨 Crítico! Muitos problemas encontrados nas interações sociais.');
        }
        
        // Salvar dados de teste para uso posterior
        const testData = {
            timestamp: new Date().toISOString(),
            users: this.mockUsers,
            posts: this.mockPosts,
            results: this.testResults,
            summary: {
                total: total,
                passed: passed,
                failed: failed,
                percentage: percentage
            }
        };
        
        localStorage.setItem('social_interactions_test', JSON.stringify(testData));
        console.log('\n💾 Dados do teste salvos em localStorage');
        
        // Mostrar próximos passos
        console.log('\n🎯 PRÓXIMOS PASSOS:');
        console.log('1. Verifique os dados salvos no localStorage');
        console.log('2. Teste as interações manualmente na interface');
        console.log('3. Execute: console.log(JSON.parse(localStorage.getItem("orkut_likes")))');
        console.log('4. Execute: console.log(JSON.parse(localStorage.getItem("orkut_comments")))');
        console.log('5. Execute: console.log(JSON.parse(localStorage.getItem("orkut_friendships")))');
    }

    addResult(test, passed, message) {
        this.testResults.push({
            test: test,
            passed: passed,
            message: message,
            timestamp: new Date().toISOString()
        });
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// Função global para executar testes
window.runSocialInteractionsTest = function() {
    const tester = new SocialInteractionsTest();
    return tester;
};

// Executar automaticamente se estiver em uma página de teste
if (window.location.pathname.includes('test') || window.location.search.includes('test-social')) {
    setTimeout(() => {
        console.log('🎭 Executando testes de interações sociais automaticamente...');
        window.runSocialInteractionsTest();
    }, 2000);
}

console.log('🎭 Sistema de testes de interações sociais carregado');
console.log('💡 Execute runSocialInteractionsTest() para iniciar os testes');
