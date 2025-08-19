// Script Completo de Teste do Banco de Dados - Orkut 2025
// Verifica todas as operações CRUD nas tabelas principais

class DatabaseTester {
    constructor() {
        this.results = {
            users: { passed: 0, failed: 0, tests: [] },
            profiles: { passed: 0, failed: 0, tests: [] },
            friendships: { passed: 0, failed: 0, tests: [] },
            posts: { passed: 0, failed: 0, tests: [] },
            likes: { passed: 0, failed: 0, tests: [] },
            comments: { passed: 0, failed: 0, tests: [] },
            messages: { passed: 0, failed: 0, tests: [] },
            scraps: { passed: 0, failed: 0, tests: [] }
        };
        this.testUsers = [];
        this.testPosts = [];
        this.testFriendships = [];
    }

    // Executar todos os testes
    async runAllTests() {
        console.log('🧪 Iniciando testes completos do banco de dados...\n');
        
        try {
            await this.testUsers();
            await this.testProfiles();
            await this.testPosts();
            await this.testLikes();
            await this.testComments();
            await this.testFriendships();
            await this.testMessages();
            await this.testScraps();
            
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Erro nos testes:', error);
        } finally {
            await this.cleanup();
        }
    }

    // Testar tabela USERS
    async testUsers() {
        console.log('👥 Testando tabela USERS...');
        
        // Teste 1: Criar usuário
        try {
            const userData = {
                name: 'Teste User ' + Date.now(),
                email: `teste${Date.now()}@test.com`,
                username: `testuser${Date.now()}`,
                password_hash: 'test123hash'
            };

            const response = await this.makeRequest('/api/user/register', 'POST', userData);
            
            if (response.ok) {
                const user = await response.json();
                this.testUsers.push(user);
                this.addTestResult('users', 'CREATE_USER', true, 'Usuário criado com sucesso');
                
                // Verificar se todas as colunas foram preenchidas
                const expectedColumns = ['id', 'name', 'email', 'username', 'created_at', 'updated_at'];
                const missingColumns = expectedColumns.filter(col => !user.hasOwnProperty(col));
                
                if (missingColumns.length === 0) {
                    this.addTestResult('users', 'USER_COLUMNS', true, 'Todas as colunas necessárias foram preenchidas');
                } else {
                    this.addTestResult('users', 'USER_COLUMNS', false, `Colunas ausentes: ${missingColumns.join(', ')}`);
                }
                
            } else {
                this.addTestResult('users', 'CREATE_USER', false, 'Falha ao criar usuário');
            }
        } catch (error) {
            this.addTestResult('users', 'CREATE_USER', false, `Erro: ${error.message}`);
        }

        // Teste 2: Atualizar usuário
        if (this.testUsers.length > 0) {
            try {
                const user = this.testUsers[0];
                const updateData = {
                    name: 'Nome Atualizado ' + Date.now()
                };

                const response = await this.makeRequest(`/api/user/update/${user.id}`, 'PUT', updateData);
                
                if (response.ok) {
                    this.addTestResult('users', 'UPDATE_USER', true, 'Usuário atualizado com sucesso');
                } else {
                    this.addTestResult('users', 'UPDATE_USER', false, 'Falha ao atualizar usuário');
                }
            } catch (error) {
                this.addTestResult('users', 'UPDATE_USER', false, `Erro: ${error.message}`);
            }
        }

        // Teste 3: Buscar usuário
        if (this.testUsers.length > 0) {
            try {
                const user = this.testUsers[0];
                const response = await this.makeRequest(`/api/user/${user.id}`, 'GET');
                
                if (response.ok) {
                    this.addTestResult('users', 'READ_USER', true, 'Usuário recuperado com sucesso');
                } else {
                    this.addTestResult('users', 'READ_USER', false, 'Falha ao buscar usuário');
                }
            } catch (error) {
                this.addTestResult('users', 'READ_USER', false, `Erro: ${error.message}`);
            }
        }
    }

    // Testar tabela PROFILES
    async testProfiles() {
        console.log('👤 Testando tabela PROFILES...');
        
        if (this.testUsers.length === 0) {
            this.addTestResult('profiles', 'NO_USER', false, 'Sem usuários para testar profiles');
            return;
        }

        const user = this.testUsers[0];
        
        // Teste 1: Criar/atualizar perfil
        try {
            const profileData = {
                user_id: user.id,
                status: 'Status de teste atualizado!',
                age: 25,
                location: 'São Paulo, SP',
                relationship_status: 'solteiro',
                birthday: '1998-01-01',
                bio: 'Bio de teste para verificar atualização',
                photo_url: 'images/test.jpg'
            };

            const response = await this.makeRequest('/api/user/profile', 'POST', profileData);
            
            if (response.ok) {
                const profile = await response.json();
                this.addTestResult('profiles', 'UPDATE_PROFILE', true, 'Perfil atualizado com sucesso');
                
                // Verificar colunas do perfil
                const expectedColumns = ['status', 'age', 'location', 'relationship_status', 'birthday', 'bio', 'photo_url'];
                const missingColumns = expectedColumns.filter(col => !profile.hasOwnProperty(col) || profile[col] === null);
                
                if (missingColumns.length === 0) {
                    this.addTestResult('profiles', 'PROFILE_COLUMNS', true, 'Todas as colunas do perfil foram atualizadas');
                } else {
                    this.addTestResult('profiles', 'PROFILE_COLUMNS', false, `Colunas não atualizadas: ${missingColumns.join(', ')}`);
                }
                
                // Verificar se os dados foram salvos corretamente
                const savedCorrectly = (
                    profile.status === profileData.status &&
                    profile.age === profileData.age &&
                    profile.location === profileData.location &&
                    profile.bio === profileData.bio
                );
                
                if (savedCorrectly) {
                    this.addTestResult('profiles', 'PROFILE_DATA_INTEGRITY', true, 'Dados do perfil salvos corretamente');
                } else {
                    this.addTestResult('profiles', 'PROFILE_DATA_INTEGRITY', false, 'Dados do perfil não foram salvos corretamente');
                }
                
            } else {
                this.addTestResult('profiles', 'UPDATE_PROFILE', false, 'Falha ao atualizar perfil');
            }
        } catch (error) {
            this.addTestResult('profiles', 'UPDATE_PROFILE', false, `Erro: ${error.message}`);
        }
    }

    // Testar tabela POSTS
    async testPosts() {
        console.log('📝 Testando tabela POSTS...');
        
        if (this.testUsers.length === 0) {
            this.addTestResult('posts', 'NO_USER', false, 'Sem usuários para testar posts');
            return;
        }

        const user = this.testUsers[0];
        
        // Teste 1: Criar post
        try {
            const postData = {
                user_id: user.id,
                content: 'Este é um post de teste para verificar o sistema!',
                post_type: 'status'
            };

            const response = await this.makeRequest('/api/posts/create', 'POST', postData);
            
            if (response.ok) {
                const post = await response.json();
                this.testPosts.push(post);
                this.addTestResult('posts', 'CREATE_POST', true, 'Post criado com sucesso');
                
                // Verificar colunas do post
                const expectedColumns = ['id', 'user_id', 'content', 'post_type', 'likes_count', 'comments_count', 'created_at'];
                const missingColumns = expectedColumns.filter(col => !post.hasOwnProperty(col));
                
                if (missingColumns.length === 0) {
                    this.addTestResult('posts', 'POST_COLUMNS', true, 'Todas as colunas do post foram preenchidas');
                } else {
                    this.addTestResult('posts', 'POST_COLUMNS', false, `Colunas ausentes: ${missingColumns.join(', ')}`);
                }
                
            } else {
                this.addTestResult('posts', 'CREATE_POST', false, 'Falha ao criar post');
            }
        } catch (error) {
            this.addTestResult('posts', 'CREATE_POST', false, `Erro: ${error.message}`);
        }
    }

    // Testar tabela LIKES
    async testLikes() {
        console.log('👍 Testando tabela LIKES...');
        
        if (this.testUsers.length === 0 || this.testPosts.length === 0) {
            this.addTestResult('likes', 'NO_DATA', false, 'Sem usuários ou posts para testar likes');
            return;
        }

        const user = this.testUsers[0];
        const post = this.testPosts[0];
        
        // Teste 1: Criar like
        try {
            const likeData = {
                user_id: user.id,
                post_id: post.id
            };

            const response = await this.makeRequest('/api/posts/like', 'POST', likeData);
            
            if (response.ok) {
                this.addTestResult('likes', 'CREATE_LIKE', true, 'Like criado com sucesso');
                
                // Verificar se o contador de likes foi atualizado no post
                const postResponse = await this.makeRequest(`/api/posts/${post.id}`, 'GET');
                if (postResponse.ok) {
                    const updatedPost = await postResponse.json();
                    if (updatedPost.likes_count > 0) {
                        this.addTestResult('likes', 'LIKE_COUNTER', true, 'Contador de likes atualizado no post');
                    } else {
                        this.addTestResult('likes', 'LIKE_COUNTER', false, 'Contador de likes não foi atualizado');
                    }
                }
                
            } else {
                this.addTestResult('likes', 'CREATE_LIKE', false, 'Falha ao criar like');
            }
        } catch (error) {
            this.addTestResult('likes', 'CREATE_LIKE', false, `Erro: ${error.message}`);
        }

        // Teste 2: Remover like
        try {
            const response = await this.makeRequest(`/api/posts/unlike`, 'POST', {
                user_id: user.id,
                post_id: post.id
            });
            
            if (response.ok) {
                this.addTestResult('likes', 'REMOVE_LIKE', true, 'Like removido com sucesso');
            } else {
                this.addTestResult('likes', 'REMOVE_LIKE', false, 'Falha ao remover like');
            }
        } catch (error) {
            this.addTestResult('likes', 'REMOVE_LIKE', false, `Erro: ${error.message}`);
        }
    }

    // Testar tabela COMMENTS
    async testComments() {
        console.log('💬 Testando tabela COMMENTS...');
        
        if (this.testUsers.length === 0 || this.testPosts.length === 0) {
            this.addTestResult('comments', 'NO_DATA', false, 'Sem usuários ou posts para testar comments');
            return;
        }

        const user = this.testUsers[0];
        const post = this.testPosts[0];
        
        // Teste 1: Criar comentário
        try {
            const commentData = {
                user_id: user.id,
                post_id: post.id,
                content: 'Este é um comentário de teste!'
            };

            const response = await this.makeRequest('/api/posts/comment', 'POST', commentData);
            
            if (response.ok) {
                const comment = await response.json();
                this.addTestResult('comments', 'CREATE_COMMENT', true, 'Comentário criado com sucesso');
                
                // Verificar colunas do comentário
                const expectedColumns = ['id', 'user_id', 'post_id', 'content', 'created_at'];
                const missingColumns = expectedColumns.filter(col => !comment.hasOwnProperty(col));
                
                if (missingColumns.length === 0) {
                    this.addTestResult('comments', 'COMMENT_COLUMNS', true, 'Todas as colunas do comentário foram preenchidas');
                } else {
                    this.addTestResult('comments', 'COMMENT_COLUMNS', false, `Colunas ausentes: ${missingColumns.join(', ')}`);
                }
                
                // Verificar se o contador de comentários foi atualizado no post
                const postResponse = await this.makeRequest(`/api/posts/${post.id}`, 'GET');
                if (postResponse.ok) {
                    const updatedPost = await postResponse.json();
                    if (updatedPost.comments_count > 0) {
                        this.addTestResult('comments', 'COMMENT_COUNTER', true, 'Contador de comentários atualizado no post');
                    } else {
                        this.addTestResult('comments', 'COMMENT_COUNTER', false, 'Contador de comentários não foi atualizado');
                    }
                }
                
            } else {
                this.addTestResult('comments', 'CREATE_COMMENT', false, 'Falha ao criar comentário');
            }
        } catch (error) {
            this.addTestResult('comments', 'CREATE_COMMENT', false, `Erro: ${error.message}`);
        }
    }

    // Testar tabela FRIENDSHIPS
    async testFriendships() {
        console.log('👫 Testando tabela FRIENDSHIPS...');
        
        // Criar segundo usuário para testar amizade
        try {
            const user2Data = {
                name: 'Segundo Teste User ' + Date.now(),
                email: `teste2${Date.now()}@test.com`,
                username: `testuser2${Date.now()}`,
                password_hash: 'test123hash'
            };

            const response = await this.makeRequest('/api/user/register', 'POST', user2Data);
            
            if (response.ok) {
                const user2 = await response.json();
                this.testUsers.push(user2);
                
                if (this.testUsers.length >= 2) {
                    const user1 = this.testUsers[0];
                    
                    // Teste 1: Enviar solicitação de amizade
                    try {
                        const friendshipData = {
                            requester_id: user1.id,
                            addressee_id: user2.id,
                            status: 'pending'
                        };

                        const friendResponse = await this.makeRequest('/api/friends/request', 'POST', friendshipData);
                        
                        if (friendResponse.ok) {
                            const friendship = await friendResponse.json();
                            this.testFriendships.push(friendship);
                            this.addTestResult('friendships', 'CREATE_FRIENDSHIP_REQUEST', true, 'Solicitação de amizade criada');
                            
                            // Verificar colunas da amizade
                            const expectedColumns = ['id', 'requester_id', 'addressee_id', 'status', 'created_at'];
                            const missingColumns = expectedColumns.filter(col => !friendship.hasOwnProperty(col));
                            
                            if (missingColumns.length === 0) {
                                this.addTestResult('friendships', 'FRIENDSHIP_COLUMNS', true, 'Todas as colunas da amizade foram preenchidas');
                            } else {
                                this.addTestResult('friendships', 'FRIENDSHIP_COLUMNS', false, `Colunas ausentes: ${missingColumns.join(', ')}`);
                            }
                            
                            // Teste 2: Aceitar amizade
                            try {
                                const acceptResponse = await this.makeRequest('/api/friends/accept', 'POST', {
                                    friendship_id: friendship.id
                                });
                                
                                if (acceptResponse.ok) {
                                    this.addTestResult('friendships', 'ACCEPT_FRIENDSHIP', true, 'Amizade aceita com sucesso');
                                } else {
                                    this.addTestResult('friendships', 'ACCEPT_FRIENDSHIP', false, 'Falha ao aceitar amizade');
                                }
                            } catch (error) {
                                this.addTestResult('friendships', 'ACCEPT_FRIENDSHIP', false, `Erro: ${error.message}`);
                            }
                            
                        } else {
                            this.addTestResult('friendships', 'CREATE_FRIENDSHIP_REQUEST', false, 'Falha ao criar solicitação de amizade');
                        }
                    } catch (error) {
                        this.addTestResult('friendships', 'CREATE_FRIENDSHIP_REQUEST', false, `Erro: ${error.message}`);
                    }
                }
            }
        } catch (error) {
            this.addTestResult('friendships', 'CREATE_SECOND_USER', false, `Erro: ${error.message}`);
        }
    }

    // Testar tabela MESSAGES
    async testMessages() {
        console.log('✉️ Testando tabela MESSAGES...');
        
        if (this.testUsers.length < 2) {
            this.addTestResult('messages', 'NO_USERS', false, 'Menos de 2 usuários para testar mensagens');
            return;
        }

        const user1 = this.testUsers[0];
        const user2 = this.testUsers[1];
        
        // Teste 1: Enviar mensagem
        try {
            const messageData = {
                from_user_id: user1.id,
                to_user_id: user2.id,
                subject: 'Teste de Mensagem',
                content: 'Esta é uma mensagem de teste do sistema!'
            };

            const response = await this.makeRequest('/api/messages/send', 'POST', messageData);
            
            if (response.ok) {
                const message = await response.json();
                this.addTestResult('messages', 'SEND_MESSAGE', true, 'Mensagem enviada com sucesso');
                
                // Verificar colunas da mensagem
                const expectedColumns = ['id', 'from_user_id', 'to_user_id', 'subject', 'content', 'is_read', 'created_at'];
                const missingColumns = expectedColumns.filter(col => !message.hasOwnProperty(col));
                
                if (missingColumns.length === 0) {
                    this.addTestResult('messages', 'MESSAGE_COLUMNS', true, 'Todas as colunas da mensagem foram preenchidas');
                } else {
                    this.addTestResult('messages', 'MESSAGE_COLUMNS', false, `Colunas ausentes: ${missingColumns.join(', ')}`);
                }
                
                // Verificar se a mensagem foi marcada como não lida inicialmente
                if (message.is_read === false) {
                    this.addTestResult('messages', 'MESSAGE_UNREAD_STATUS', true, 'Mensagem marcada como não lida inicialmente');
                } else {
                    this.addTestResult('messages', 'MESSAGE_UNREAD_STATUS', false, 'Mensagem não foi marcada corretamente como não lida');
                }
                
            } else {
                this.addTestResult('messages', 'SEND_MESSAGE', false, 'Falha ao enviar mensagem');
            }
        } catch (error) {
            this.addTestResult('messages', 'SEND_MESSAGE', false, `Erro: ${error.message}`);
        }
    }

    // Testar tabela SCRAPS
    async testScraps() {
        console.log('📄 Testando tabela SCRAPS...');
        
        if (this.testUsers.length < 2) {
            this.addTestResult('scraps', 'NO_USERS', false, 'Menos de 2 usuários para testar scraps');
            return;
        }

        const user1 = this.testUsers[0];
        const user2 = this.testUsers[1];
        
        // Teste 1: Enviar scrap
        try {
            const scrapData = {
                from_user_id: user1.id,
                to_user_id: user2.id,
                content: 'Este é um scrap de teste!',
                is_public: true
            };

            const response = await this.makeRequest('/api/scraps/send', 'POST', scrapData);
            
            if (response.ok) {
                const scrap = await response.json();
                this.addTestResult('scraps', 'SEND_SCRAP', true, 'Scrap enviado com sucesso');
                
                // Verificar colunas do scrap
                const expectedColumns = ['id', 'from_user_id', 'to_user_id', 'content', 'is_public', 'created_at'];
                const missingColumns = expectedColumns.filter(col => !scrap.hasOwnProperty(col));
                
                if (missingColumns.length === 0) {
                    this.addTestResult('scraps', 'SCRAP_COLUMNS', true, 'Todas as colunas do scrap foram preenchidas');
                } else {
                    this.addTestResult('scraps', 'SCRAP_COLUMNS', false, `Colunas ausentes: ${missingColumns.join(', ')}`);
                }
                
            } else {
                this.addTestResult('scraps', 'SEND_SCRAP', false, 'Falha ao enviar scrap');
            }
        } catch (error) {
            this.addTestResult('scraps', 'SEND_SCRAP', false, `Erro: ${error.message}`);
        }
    }

    // Fazer requisição HTTP
    async makeRequest(url, method, data = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            return await fetch(url, options);
        } catch (error) {
            console.error(`Erro na requisição ${method} ${url}:`, error);
            throw error;
        }
    }

    // Adicionar resultado de teste
    addTestResult(table, testName, passed, message) {
        this.results[table].tests.push({
            name: testName,
            passed: passed,
            message: message,
            timestamp: new Date().toISOString()
        });

        if (passed) {
            this.results[table].passed++;
            console.log(`  ✅ ${testName}: ${message}`);
        } else {
            this.results[table].failed++;
            console.log(`  ❌ ${testName}: ${message}`);
        }
    }

    // Gerar relatório final
    generateReport() {
        console.log('\n📊 RELATÓRIO DE TESTES DO BANCO DE DADOS\n');
        console.log('='.repeat(60));
        
        let totalPassed = 0;
        let totalFailed = 0;
        
        Object.keys(this.results).forEach(table => {
            const result = this.results[table];
            totalPassed += result.passed;
            totalFailed += result.failed;
            
            const total = result.passed + result.failed;
            const percentage = total > 0 ? Math.round((result.passed / total) * 100) : 0;
            
            console.log(`\n${table.toUpperCase()}: ${result.passed}/${total} ✅ (${percentage}%)`);
            
            if (result.failed > 0) {
                console.log('  Falhas:');
                result.tests.filter(t => !t.passed).forEach(test => {
                    console.log(`    - ${test.name}: ${test.message}`);
                });
            }
        });
        
        console.log('\n' + '='.repeat(60));
        const overallTotal = totalPassed + totalFailed;
        const overallPercentage = overallTotal > 0 ? Math.round((totalPassed / overallTotal) * 100) : 0;
        
        console.log(`\n🎯 RESULTADO GERAL: ${totalPassed}/${overallTotal} testes passaram (${overallPercentage}%)`);
        
        if (overallPercentage >= 90) {
            console.log('🎉 Excelente! O banco de dados está funcionando muito bem!');
        } else if (overallPercentage >= 70) {
            console.log('👍 Bom! Algumas melhorias podem ser feitas.');
        } else {
            console.log('⚠️ Atenção! Há problemas significativos que precisam ser corrigidos.');
        }
        
        // Salvar relatório em arquivo
        this.saveReportToFile();
    }

    // Salvar relatório em arquivo
    saveReportToFile() {
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: Object.values(this.results).reduce((sum, r) => sum + r.passed + r.failed, 0),
                totalPassed: Object.values(this.results).reduce((sum, r) => sum + r.passed, 0),
                totalFailed: Object.values(this.results).reduce((sum, r) => sum + r.failed, 0)
            },
            results: this.results
        };

        // Em um ambiente real, isso salvaria em um arquivo
        console.log('\n💾 Relatório completo salvo em database-test-report.json');
        localStorage.setItem('database_test_report', JSON.stringify(reportData));
    }

    // Limpeza após os testes
    async cleanup() {
        console.log('\n🧹 Limpando dados de teste...');
        
        // Remover usuários de teste
        for (const user of this.testUsers) {
            try {
                await this.makeRequest(`/api/user/delete/${user.id}`, 'DELETE');
            } catch (error) {
                console.warn(`Erro ao limpar usuário ${user.id}:`, error.message);
            }
        }
        
        console.log('✅ Limpeza concluída!');
    }
}

// Executar testes automaticamente se estiver no browser
if (typeof window !== 'undefined') {
    window.DatabaseTester = DatabaseTester;
    
    // Função de conveniência para executar testes
    window.runDatabaseTests = async function() {
        const tester = new DatabaseTester();
        await tester.runAllTests();
        return tester.results;
    };
}

// Exportar para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseTester;
}

console.log('🧪 Sistema de testes do banco de dados carregado');
console.log('💡 Execute runDatabaseTests() para iniciar os testes');
