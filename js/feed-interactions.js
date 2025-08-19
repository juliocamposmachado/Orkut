// Orkut Retrô - Sistema de Interações do Feed
// Integração completa com Supabase para posts, curtidas, comentários

// Estado global do feed
let feedState = {
    posts: [],
    loading: false,
    currentPage: 0,
    hasMore: true
};

// Inicializar sistema de feed
document.addEventListener('DOMContentLoaded', function() {
    if (getCurrentPage() === 'home') {
        initializeFeed();
        setupFeedEventListeners();
    }
});

// Inicializar feed
async function initializeFeed() {
    try {
        showFeedLoading();
        await loadInitialFeed();
        renderFeed();
        
        // Configurar auto-refresh a cada 30 segundos
        setInterval(refreshFeed, 30000);
        
    } catch (error) {
        console.error('Erro ao inicializar feed:', error);
        showFeedError();
    }
}

// Carregar feed inicial
async function loadInitialFeed() {
    try {
        const posts = await loadCompleteFeed(20, 0);
        feedState.posts = posts;
        feedState.currentPage = 0;
        feedState.hasMore = posts.length === 20;
        
        console.log('✅ Feed inicial carregado:', posts.length, 'posts');
        
    } catch (error) {
        console.error('Erro ao carregar feed inicial:', error);
        // Usar dados de fallback
        feedState.posts = getFallbackFeedPosts();
    }
}

// Dados de fallback para o feed
function getFallbackFeedPosts() {
    const user = JSON.parse(localStorage.getItem('orkutUser') || '{}');
    
    return [
        {
            id: 'welcome',
            user_id: 'system',
            content: `🎉 Bem-vindo ao Orkut Retrô, ${user.name || 'usuário'}! A nostalgia está de volta! Compartilhe suas memórias e conecte-se com seus amigos! 💜`,
            created_at: new Date().toISOString(),
            type: 'status',
            author_name: 'Orkut Retrô',
            author_photo: 'images/orkut.png',
            likes: Math.floor(Math.random() * 50) + 10,
            comments: Math.floor(Math.random() * 10) + 2
        },
        {
            id: 'tip1',
            user_id: 'system',
            content: '💡 Dica: Clique em "Nova Publicação" para compartilhar algo especial com seus amigos! Use emojis para deixar suas mensagens mais divertidas! 😄',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            type: 'tip',
            author_name: 'Sistema',
            author_photo: 'images/orkutblack.png',
            likes: Math.floor(Math.random() * 30) + 5,
            comments: Math.floor(Math.random() * 5) + 1
        }
    ];
}

// Configurar event listeners do feed
function setupFeedEventListeners() {
    // Botão de nova publicação
    const newPostBtn = document.getElementById('newPostBtn');
    if (newPostBtn) {
        newPostBtn.addEventListener('click', showNewPostModal);
    }
    
    // Formulário de nova publicação
    const newPostForm = document.getElementById('newPostForm');
    if (newPostForm) {
        newPostForm.addEventListener('submit', handleNewPost);
    }
    
    // Botão carregar mais
    const loadMoreBtn = document.querySelector('.load-more button');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePosts);
    }
    
    // Refresh do feed
    const refreshBtn = document.getElementById('refreshFeed');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshFeed);
    }
}

// Mostrar modal de nova publicação
function showNewPostModal() {
    const modal = document.getElementById('newPostModal');
    if (!modal) {
        createNewPostModal();
        return;
    }
    
    modal.classList.remove('hidden');
    const textarea = modal.querySelector('textarea');
    if (textarea) {
        textarea.focus();
    }
}

// Criar modal de nova publicação se não existir
function createNewPostModal() {
    const modalHTML = `
        <div class="modal hidden" id="newPostModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Nova Publicação</h3>
                    <button class="close-btn" onclick="closeModal('newPostModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="newPostForm">
                        <div class="form-group">
                            <textarea id="postContent" name="content" rows="4" placeholder="O que você está pensando?" required maxlength="500"></textarea>
                            <div class="char-counter">
                                <span id="charCount">0</span>/500 caracteres
                            </div>
                        </div>
                        
                        <div class="post-options">
                            <div class="emoji-buttons">
                                <button type="button" class="emoji-btn" onclick="addEmoji('😄')">😄</button>
                                <button type="button" class="emoji-btn" onclick="addEmoji('❤️')">❤️</button>
                                <button type="button" class="emoji-btn" onclick="addEmoji('👍')">👍</button>
                                <button type="button" class="emoji-btn" onclick="addEmoji('🎉')">🎉</button>
                                <button type="button" class="emoji-btn" onclick="addEmoji('😢')">😢</button>
                                <button type="button" class="emoji-btn" onclick="addEmoji('🤔')">🤔</button>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary" id="submitPost">Publicar</button>
                            <button type="button" class="btn btn-light" onclick="closeModal('newPostModal')">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Configurar contador de caracteres
    const textarea = document.getElementById('postContent');
    const charCount = document.getElementById('charCount');
    
    textarea.addEventListener('input', function() {
        charCount.textContent = this.value.length;
    });
    
    // Configurar form
    document.getElementById('newPostForm').addEventListener('submit', handleNewPost);
    
    // Mostrar modal
    showNewPostModal();
}

// Adicionar emoji ao post
function addEmoji(emoji) {
    const textarea = document.getElementById('postContent');
    if (textarea) {
        textarea.value += emoji;
        textarea.focus();
        
        // Atualizar contador
        const charCount = document.getElementById('charCount');
        if (charCount) {
            charCount.textContent = textarea.value.length;
        }
    }
}

// Processar nova publicação
async function handleNewPost(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const content = formData.get('content').trim();
    
    if (!content) {
        showError('Por favor, escreva algo para publicar.');
        return;
    }
    
    const submitBtn = document.getElementById('submitPost');
    const originalText = submitBtn.textContent;
    
    try {
        // Mostrar loading
        submitBtn.textContent = 'Publicando...';
        submitBtn.disabled = true;
        
        // Criar post no Supabase
        const result = await createPost(content, 'status');
        
        if (result.success) {
            // Fechar modal
            closeModal('newPostModal');
            
            // Limpar formulário
            form.reset();
            document.getElementById('charCount').textContent = '0';
            
            // Recarregar feed
            await refreshFeed();
            
            showSuccess('Publicação criada com sucesso! 🎉');
            
        } else {
            showError('Erro ao criar publicação. Tente novamente.');
        }
        
    } catch (error) {
        console.error('Erro ao criar post:', error);
        showError('Erro ao criar publicação. Tente novamente.');
        
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Renderizar feed na página
function renderFeed() {
    const feedContainer = document.getElementById('feedContainer');
    if (!feedContainer) return;
    
    if (feedState.posts.length === 0) {
        showEmptyFeed();
        return;
    }
    
    feedContainer.innerHTML = '';
    
    feedState.posts.forEach(post => {
        const postElement = createPostElement(post);
        feedContainer.appendChild(postElement);
    });
    
    hideFeedLoading();
}

// Criar elemento de post
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'feed-item';
    postDiv.setAttribute('data-post-id', post.id);
    
    const timeAgo = getTimeAgo(post.created_at);
    const authorName = post.author_name || post.profiles?.name || 'Usuário';
    const authorPhoto = post.author_photo || post.profiles?.photo_url || getRandomProfileImage();
    
    postDiv.innerHTML = `
        <div class="feed-header-info">
            <img src="${authorPhoto}" alt="${authorName}" class="feed-avatar" onerror="this.src='images/orkutblack.png'">
            <div class="feed-author-info">
                <span class="feed-author">${authorName}</span>
                <span class="feed-time">${timeAgo}</span>
            </div>
        </div>
        
        <div class="feed-content">
            <p>${escapeHtml(post.content)}</p>
            ${post.media_url ? `<img src="${post.media_url}" alt="Mídia do post" class="feed-media">` : ''}
        </div>
        
        <div class="feed-actions">
            <button class="feed-action-btn like-btn" onclick="toggleLike('${post.id}')" data-liked="false">
                <span class="action-icon">❤️</span>
                <span class="action-text">Curtir</span>
                <span class="action-count">${post.likes || 0}</span>
            </button>
            <button class="feed-action-btn comment-btn" onclick="showComments('${post.id}')">
                <span class="action-icon">💬</span>
                <span class="action-text">Comentar</span>
                <span class="action-count">${post.comments || 0}</span>
            </button>
            <button class="feed-action-btn share-btn" onclick="sharePost('${post.id}')">
                <span class="action-icon">📤</span>
                <span class="action-text">Compartilhar</span>
            </button>
        </div>
        
        <div class="feed-comments hidden" id="comments-${post.id}">
            <div class="comments-list"></div>
            <div class="comment-form">
                <input type="text" placeholder="Escreva um comentário..." 
                       onkeypress="handleCommentKeypress(event, '${post.id}')">
                <button onclick="addComment('${post.id}')">Enviar</button>
            </div>
        </div>
    `;
    
    return postDiv;
}

// Curtir/descurtir post
async function toggleLike(postId) {
    const likeBtn = document.querySelector(`[data-post-id="${postId}"] .like-btn`);
    const countSpan = likeBtn.querySelector('.action-count');
    const isLiked = likeBtn.getAttribute('data-liked') === 'true';
    
    try {
        // Otimistic update
        const currentCount = parseInt(countSpan.textContent) || 0;
        const newCount = isLiked ? currentCount - 1 : currentCount + 1;
        
        countSpan.textContent = newCount;
        likeBtn.setAttribute('data-liked', !isLiked);
        likeBtn.classList.toggle('liked', !isLiked);
        
        // Tentar salvar no Supabase
        if (supabaseClient) {
            await saveLikeToSupabase(postId, !isLiked);
        }
        
        // Salvar localmente
        saveLikeLocally(postId, !isLiked, newCount);
        
    } catch (error) {
        console.error('Erro ao curtir post:', error);
        // Reverter mudança otimista
        const currentCount = parseInt(countSpan.textContent) || 0;
        const revertCount = isLiked ? currentCount + 1 : currentCount - 1;
        countSpan.textContent = revertCount;
        likeBtn.setAttribute('data-liked', isLiked);
        likeBtn.classList.toggle('liked', isLiked);
    }
}

// Salvar curtida no Supabase
async function saveLikeToSupabase(postId, isLiked) {
    const user = JSON.parse(localStorage.getItem('orkutUser') || '{}');
    
    if (isLiked) {
        // Adicionar curtida
        await supabaseClient.from('post_likes').insert({
            post_id: postId,
            user_id: user.id,
            created_at: new Date().toISOString()
        });
    } else {
        // Remover curtida
        await supabaseClient.from('post_likes')
            .delete()
            .match({ post_id: postId, user_id: user.id });
    }
}

// Salvar curtida localmente
function saveLikeLocally(postId, isLiked, newCount) {
    const likes = JSON.parse(localStorage.getItem('orkutLikes') || '{}');
    const user = JSON.parse(localStorage.getItem('orkutUser') || '{}');
    
    if (!likes[postId]) {
        likes[postId] = { count: newCount, users: [] };
    }
    
    likes[postId].count = newCount;
    
    if (isLiked) {
        if (!likes[postId].users.includes(user.id)) {
            likes[postId].users.push(user.id);
        }
    } else {
        likes[postId].users = likes[postId].users.filter(id => id !== user.id);
    }
    
    localStorage.setItem('orkutLikes', JSON.stringify(likes));
}

// Mostrar comentários
function showComments(postId) {
    const commentsDiv = document.getElementById(`comments-${postId}`);
    if (commentsDiv) {
        commentsDiv.classList.toggle('hidden');
        
        if (!commentsDiv.classList.contains('hidden')) {
            loadComments(postId);
        }
    }
}

// Carregar comentários
async function loadComments(postId) {
    const commentsList = document.querySelector(`#comments-${postId} .comments-list`);
    if (!commentsList) return;
    
    try {
        let comments = [];
        
        // Tentar carregar do Supabase
        if (supabaseClient) {
            const { data } = await supabaseClient
                .from('post_comments')
                .select('*, profiles(name, photo_url)')
                .eq('post_id', postId)
                .order('created_at', { ascending: true });
            
            comments = data || [];
        }
        
        // Carregar comentários locais
        const localComments = JSON.parse(localStorage.getItem('orkutComments') || '{}')[postId] || [];
        comments = [...comments, ...localComments];
        
        // Renderizar comentários
        commentsList.innerHTML = '';
        comments.forEach(comment => {
            const commentElement = createCommentElement(comment);
            commentsList.appendChild(commentElement);
        });
        
    } catch (error) {
        console.error('Erro ao carregar comentários:', error);
    }
}

// Criar elemento de comentário
function createCommentElement(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment-item';
    
    const authorName = comment.profiles?.name || comment.author_name || 'Usuário';
    const authorPhoto = comment.profiles?.photo_url || comment.author_photo || getRandomProfileImage();
    const timeAgo = getTimeAgo(comment.created_at);
    
    commentDiv.innerHTML = `
        <img src="${authorPhoto}" alt="${authorName}" class="comment-avatar" onerror="this.src='images/orkutblack.png'">
        <div class="comment-content">
            <div class="comment-header">
                <span class="comment-author">${authorName}</span>
                <span class="comment-time">${timeAgo}</span>
            </div>
            <p class="comment-text">${escapeHtml(comment.content)}</p>
        </div>
    `;
    
    return commentDiv;
}

// Lidar com tecla pressionada no comentário
function handleCommentKeypress(event, postId) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addComment(postId);
    }
}

// Adicionar comentário
async function addComment(postId) {
    const input = document.querySelector(`#comments-${postId} input`);
    if (!input) return;
    
    const content = input.value.trim();
    if (!content) return;
    
    try {
        const user = JSON.parse(localStorage.getItem('orkutUser') || '{}');
        
        const commentData = {
            post_id: postId,
            user_id: user.id,
            content: content,
            created_at: new Date().toISOString(),
            author_name: user.name,
            author_photo: user.photo
        };
        
        // Tentar salvar no Supabase
        if (supabaseClient) {
            await supabaseClient.from('post_comments').insert(commentData);
        }
        
        // Salvar localmente
        const localComments = JSON.parse(localStorage.getItem('orkutComments') || '{}');
        if (!localComments[postId]) localComments[postId] = [];
        localComments[postId].push(commentData);
        localStorage.setItem('orkutComments', JSON.stringify(localComments));
        
        // Limpar input
        input.value = '';
        
        // Recarregar comentários
        await loadComments(postId);
        
        // Atualizar contador de comentários
        updateCommentCount(postId, 1);
        
    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        showError('Erro ao adicionar comentário.');
    }
}

// Atualizar contador de comentários
function updateCommentCount(postId, increment) {
    const commentBtn = document.querySelector(`[data-post-id="${postId}"] .comment-btn`);
    if (commentBtn) {
        const countSpan = commentBtn.querySelector('.action-count');
        const currentCount = parseInt(countSpan.textContent) || 0;
        countSpan.textContent = currentCount + increment;
    }
}

// Compartilhar post
function sharePost(postId) {
    // Implementação simples de compartilhamento
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    const content = postElement.querySelector('.feed-content p').textContent;
    
    if (navigator.share) {
        navigator.share({
            title: 'Orkut Retrô',
            text: content,
            url: window.location.href
        });
    } else {
        // Fallback: copiar para clipboard
        navigator.clipboard.writeText(content).then(() => {
            showSuccess('Texto copiado para a área de transferência!');
        });
    }
}

// Carregar mais posts
async function loadMorePosts() {
    if (feedState.loading || !feedState.hasMore) return;
    
    feedState.loading = true;
    const loadMoreBtn = document.querySelector('.load-more button');
    const originalText = loadMoreBtn.textContent;
    
    try {
        loadMoreBtn.textContent = 'Carregando...';
        loadMoreBtn.disabled = true;
        
        const newPosts = await loadCompleteFeed(20, feedState.posts.length);
        
        if (newPosts.length > 0) {
            feedState.posts = [...feedState.posts, ...newPosts];
            feedState.hasMore = newPosts.length === 20;
            
            // Renderizar apenas os novos posts
            const feedContainer = document.getElementById('feedContainer');
            newPosts.forEach(post => {
                const postElement = createPostElement(post);
                feedContainer.appendChild(postElement);
            });
        } else {
            feedState.hasMore = false;
            loadMoreBtn.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Erro ao carregar mais posts:', error);
        showError('Erro ao carregar mais posts.');
        
    } finally {
        feedState.loading = false;
        loadMoreBtn.textContent = originalText;
        loadMoreBtn.disabled = false;
    }
}

// Refresh do feed
async function refreshFeed() {
    try {
        showFeedLoading();
        await loadInitialFeed();
        renderFeed();
        
    } catch (error) {
        console.error('Erro ao atualizar feed:', error);
        showError('Erro ao atualizar feed.');
    }
}

// Mostrar loading do feed
function showFeedLoading() {
    const feedContainer = document.getElementById('feedContainer');
    if (feedContainer) {
        feedContainer.innerHTML = `
            <div class="feed-loading">
                <div class="loading-spinner"></div>
                <p>Carregando posts...</p>
            </div>
        `;
    }
}

// Esconder loading do feed
function hideFeedLoading() {
    const loadingDiv = document.querySelector('.feed-loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Mostrar feed vazio
function showEmptyFeed() {
    const feedContainer = document.getElementById('feedContainer');
    if (feedContainer) {
        feedContainer.innerHTML = `
            <div class="empty-feed">
                <div class="empty-icon">📝</div>
                <h3>Nenhuma publicação ainda</h3>
                <p>Seja o primeiro a compartilhar algo!</p>
                <button class="btn btn-primary" onclick="showNewPostModal()">Criar Primeira Publicação</button>
            </div>
        `;
    }
}

// Mostrar erro no feed
function showFeedError() {
    const feedContainer = document.getElementById('feedContainer');
    if (feedContainer) {
        feedContainer.innerHTML = `
            <div class="feed-error">
                <div class="error-icon">⚠️</div>
                <h3>Erro ao carregar feed</h3>
                <p>Ocorreu um erro ao carregar as publicações.</p>
                <button class="btn btn-secondary" onclick="refreshFeed()">Tentar Novamente</button>
            </div>
        `;
    }
}

// Função utilitária para calcular tempo atrás
function getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'agora';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} min atrás`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h atrás`;
    } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d atrás`;
    } else {
        return date.toLocaleDateString('pt-BR');
    }
}

// Função utilitária para escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Função utilitária para obter página atual
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);
    return page.replace('.html', '') || 'index';
}

console.log('📱 Sistema de interações do feed carregado');
