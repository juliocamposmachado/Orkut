// Orkut Retrô - Feed JavaScript
// Funções para gerenciar o feed de notícias dos amigos

// Configurações do feed
const FeedConfig = {
    postsPerPage: 5,
    autoRefreshInterval: 30000, // 30 segundos
    maxCachedPosts: 50
};

// Estado do feed
let feedState = {
    currentPage: 0,
    isLoading: false,
    hasMore: true,
    posts: []
};

// Inicialização do feed
document.addEventListener('DOMContentLoaded', function() {
    if (getCurrentPage() === 'home') {
        initializeFeed();
        setupFeedEventListeners();
    }
});

// Inicializar feed
function initializeFeed() {
    loadUserInfoInSidebar();
    loadOnlineFriends();
    loadTrendingCommunities();
    loadFeedPosts();
}

// Configurar event listeners do feed
function setupFeedEventListeners() {
    // Auto-refresh do feed
    setInterval(function() {
        if (document.visibilityState === 'visible') {
            refreshFeed();
        }
    }, FeedConfig.autoRefreshInterval);

    // Scroll infinito
    window.addEventListener('scroll', debounce(handleScroll, 100));
}

// Carregar informações do usuário na sidebar
function loadUserInfoInSidebar() {
    if (!OrkutRetro.currentUser) return;

    const user = OrkutRetro.currentUser;

    // Header
    updateElement('headerUserName', user.name);
    updateElement('headerUserPhoto', user.photo, 'src');

    // Sidebar
    updateElement('sidebarUserName', user.name);
    updateElement('sidebarUserStatus', `"${user.status}"`);
    updateElement('sidebarFriendsCount', user.friendsCount);
    updateElement('sidebarProfileViews', user.profileViews);
    updateElement('sidebarUserPhoto', user.photo, 'src');
}

// Carregar amigos online
function loadOnlineFriends() {
    const container = document.getElementById('onlineFriendsList');
    if (!container) return;

    const onlineFriends = mockData.friends.filter(friend => friend.online).slice(0, 6);
    
    if (onlineFriends.length === 0) {
        container.innerHTML = '<p>Nenhum amigo online</p>';
        return;
    }

    container.innerHTML = onlineFriends.map(friend => `
        <div class="online-friend" onclick="viewProfile(${friend.id})">
            <img src="${friend.photo}" alt="${friend.name}">
            <span>${friend.name.split(' ')[0]}</span>
            <div class="online-indicator"></div>
        </div>
    `).join('');
}

// Carregar comunidades em alta
function loadTrendingCommunities() {
    const container = document.getElementById('trendingCommunitiesList');
    if (!container) return;

    const trending = mockData.communities.slice(0, 4);
    
    container.innerHTML = trending.map(community => `
        <div class="trending-community" onclick="viewCommunity(${community.id})">
            <img src="${community.image}" alt="${community.name}">
            <div class="community-info">
                <span class="name">${community.name}</span>
                <span class="members">${community.members.toLocaleString()} membros</span>
            </div>
        </div>
    `).join('');
}

// Carregar posts do feed
function loadFeedPosts() {
    const container = document.getElementById('feedContainer');
    if (!container) return;

    feedState.isLoading = true;
    container.querySelector('.loading').style.display = 'block';

    // Simular delay de carregamento
    setTimeout(() => {
        const startIndex = feedState.currentPage * FeedConfig.postsPerPage;
        const endIndex = startIndex + FeedConfig.postsPerPage;
        const postsToShow = mockData.feedPosts.slice(startIndex, endIndex);

        if (feedState.currentPage === 0) {
            container.innerHTML = '';
        }

        postsToShow.forEach(post => {
            const postElement = createFeedPostElement(post);
            container.appendChild(postElement);
        });

        feedState.posts = [...feedState.posts, ...postsToShow];
        feedState.currentPage++;
        feedState.hasMore = endIndex < mockData.feedPosts.length;
        feedState.isLoading = false;

        // Esconder loading
        const loadingElement = container.querySelector('.loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        // Atualizar botão "Carregar mais"
        updateLoadMoreButton();

    }, 1000);
}

// Criar elemento de post do feed
function createFeedPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'feed-item';
    postDiv.setAttribute('data-post-id', post.id);

    postDiv.innerHTML = `
        <div class="feed-header-info">
            <img src="${post.authorPhoto}" alt="${post.author}" class="feed-avatar">
            <div class="feed-author-info">
                <span class="feed-author">${post.author}</span>
                <span class="feed-time">${post.time}</span>
                ${post.type === 'community_post' ? '<span class="feed-type">📢 Comunidade</span>' : ''}
            </div>
        </div>
        <div class="feed-content">
            <p>${post.content}</p>
        </div>
        <div class="feed-stats">
            <span class="stat-item">❤️ ${post.likes}</span>
            <span class="stat-item">💬 ${post.comments}</span>
        </div>
        <div class="feed-actions">
            <button class="feed-action-btn ${isPostLiked(post.id) ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                ${isPostLiked(post.id) ? '❤️ Descurtir' : '🤍 Curtir'}
            </button>
            <button class="feed-action-btn" onclick="showComments(${post.id})">💬 Comentar</button>
            <button class="feed-action-btn" onclick="sharePost(${post.id})">📤 Compartilhar</button>
        </div>
    `;

    return postDiv;
}

// Verificar se post está curtido
function isPostLiked(postId) {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    return likedPosts.includes(postId);
}

// Alternar curtida do post
function toggleLike(postId) {
    let likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    const isLiked = likedPosts.includes(postId);
    
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    const likeButton = postElement.querySelector('.feed-action-btn');
    const likeStat = postElement.querySelector('.stat-item');
    
    // Encontrar o post nos dados
    const post = mockData.feedPosts.find(p => p.id === postId);
    
    if (isLiked) {
        // Remover curtida
        likedPosts = likedPosts.filter(id => id !== postId);
        post.likes--;
        likeButton.innerHTML = '🤍 Curtir';
        likeButton.classList.remove('liked');
    } else {
        // Adicionar curtida
        likedPosts.push(postId);
        post.likes++;
        likeButton.innerHTML = '❤️ Descurtir';
        likeButton.classList.add('liked');
    }
    
    // Atualizar localStorage
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    
    // Atualizar contador de likes
    likeStat.innerHTML = `❤️ ${post.likes}`;
    
    // Feedback visual
    showFeedNotification(isLiked ? 'Curtida removida!' : 'Post curtido!');
}

// Mostrar comentários
function showComments(postId) {
    // Por enquanto, apenas mostrar notificação
    showFeedNotification('Funcionalidade de comentários em breve!');
    console.log('Showing comments for post:', postId);
}

// Compartilhar post
function sharePost(postId) {
    const post = mockData.feedPosts.find(p => p.id === postId);
    if (post) {
        // Simular compartilhamento
        showFeedNotification('Post compartilhado!');
        console.log('Sharing post:', post);
    }
}

// Carregar mais posts
function loadMoreFeed() {
    if (!feedState.isLoading && feedState.hasMore) {
        loadFeedPosts();
    }
}

// Atualizar botão "Carregar mais"
function updateLoadMoreButton() {
    const loadMoreButton = document.querySelector('.load-more button');
    if (loadMoreButton) {
        if (feedState.hasMore) {
            loadMoreButton.textContent = feedState.isLoading ? 'Carregando...' : 'Carregar mais';
            loadMoreButton.disabled = feedState.isLoading;
        } else {
            loadMoreButton.textContent = 'Não há mais posts';
            loadMoreButton.disabled = true;
        }
    }
}

// Handle scroll para scroll infinito
function handleScroll() {
    if (feedState.isLoading || !feedState.hasMore) return;

    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= docHeight - 1000) {
        loadMoreFeed();
    }
}

// Refresh do feed
function refreshFeed() {
    // Simular novos posts ocasionalmente
    if (Math.random() < 0.3) { // 30% chance
        showFeedNotification('Novas atualizações disponíveis!', 'info');
    }
}

// Mostrar notificação do feed
function showFeedNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `feed-notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Remover após 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Função auxiliar para atualizar elementos
function updateElement(id, content, attribute = 'textContent') {
    const element = document.getElementById(id);
    if (element) {
        if (attribute === 'src') {
            element.src = content;
        } else {
            element[attribute] = content;
        }
    }
}

// Exportar funções para uso global
window.loadMoreFeed = loadMoreFeed;
window.toggleLike = toggleLike;
window.showComments = showComments;
window.sharePost = sharePost;
