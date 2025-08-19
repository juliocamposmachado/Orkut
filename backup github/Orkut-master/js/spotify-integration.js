// Spotify Integration for Orkut Retrô 2025
// Gerenciamento completo da integração com Spotify

class SpotifyIntegration {
    constructor() {
        this.clientId = 'YOUR_SPOTIFY_CLIENT_ID'; // Configurar no painel do Spotify
        this.redirectUri = window.location.origin + '/spotify.html';
        this.scopes = [
            'streaming',
            'user-read-email',
            'user-read-private',
            'user-read-playback-state',
            'user-modify-playback-state',
            'user-read-currently-playing',
            'playlist-read-private',
            'playlist-modify-public',
            'playlist-modify-private',
            'user-top-read',
            'user-read-recently-played',
            'user-library-read'
        ].join(' ');
        
        this.accessToken = null;
        this.refreshToken = null;
        this.spotifyPlayer = null;
        this.deviceId = null;
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        // Verificar se há token nos parâmetros da URL (callback OAuth)
        this.handleCallback();
        
        // Verificar se há token salvo
        this.accessToken = localStorage.getItem('spotify_access_token');
        this.refreshToken = localStorage.getItem('spotify_refresh_token');
        
        if (this.accessToken) {
            this.initializeSpotifyFeatures();
        }
        
        // Configurar event listeners
        this.setupEventListeners();
    }

    // OAuth2 Flow
    async connectToSpotify() {
        const state = this.generateRandomString(16);
        localStorage.setItem('spotify_auth_state', state);
        
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            scope: this.scopes,
            redirect_uri: this.redirectUri,
            state: state,
            show_dialog: 'true'
        });

        window.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
    }

    handleCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        
        if (error) {
            console.error('Spotify auth error:', error);
            this.showMessage('Erro na autorização do Spotify', 'error');
            return;
        }
        
        if (code && state) {
            const storedState = localStorage.getItem('spotify_auth_state');
            if (state === storedState) {
                this.exchangeCodeForTokens(code);
            } else {
                console.error('State mismatch in Spotify auth');
                this.showMessage('Erro de segurança na autorização', 'error');
            }
            
            // Limpar URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    async exchangeCodeForTokens(code) {
        try {
            const response = await fetch('/api/spotify/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    redirect_uri: this.redirectUri
                })
            });

            if (response.ok) {
                const tokens = await response.json();
                this.accessToken = tokens.access_token;
                this.refreshToken = tokens.refresh_token;
                
                localStorage.setItem('spotify_access_token', this.accessToken);
                localStorage.setItem('spotify_refresh_token', this.refreshToken);
                
                this.showMessage('Conectado ao Spotify com sucesso!', 'success');
                this.initializeSpotifyFeatures();
            } else {
                throw new Error('Failed to exchange code for tokens');
            }
        } catch (error) {
            console.error('Token exchange error:', error);
            this.showMessage('Erro ao conectar com o Spotify', 'error');
        }
    }

    async refreshAccessToken() {
        if (!this.refreshToken) return false;
        
        try {
            const response = await fetch('/api/spotify/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refresh_token: this.refreshToken
                })
            });

            if (response.ok) {
                const tokens = await response.json();
                this.accessToken = tokens.access_token;
                localStorage.setItem('spotify_access_token', this.accessToken);
                return true;
            }
        } catch (error) {
            console.error('Token refresh error:', error);
        }
        
        return false;
    }

    // Inicialização das funcionalidades do Spotify
    async initializeSpotifyFeatures() {
        if (this.isInitialized) return;
        
        try {
            // Carregar SDK do Spotify
            await this.loadSpotifySDK();
            
            // Configurar UI para estado conectado
            this.updateUIForConnectedState();
            
            // Buscar dados do usuário
            const userProfile = await this.getUserProfile();
            if (userProfile) {
                this.displayUserProfile(userProfile);
            }
            
            // Inicializar Web Playback SDK
            await this.initializeWebPlayback();
            
            // Carregar playlists e músicas em alta
            this.loadUserPlaylists();
            this.loadTrendingSongs();
            this.loadUserStats();
            
            // Iniciar monitoramento de música atual
            this.startCurrentlyPlayingMonitor();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Failed to initialize Spotify features:', error);
            this.showMessage('Erro ao inicializar funcionalidades do Spotify', 'error');
        }
    }

    async loadSpotifySDK() {
        return new Promise((resolve, reject) => {
            if (window.Spotify) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://sdk.scdn.co/spotify-player.js';
            script.onload = () => {
                window.onSpotifyWebPlaybackSDKReady = () => {
                    resolve();
                };
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async initializeWebPlayback() {
        if (!window.Spotify || !this.accessToken) return;
        
        const player = new Spotify.Player({
            name: 'Orkut 2025 Web Player',
            getOAuthToken: (cb) => {
                cb(this.accessToken);
            },
            volume: 0.5
        });

        // Configurar event listeners do player
        player.addListener('ready', ({ device_id }) => {
            console.log('Spotify player ready with Device ID', device_id);
            this.deviceId = device_id;
            this.showMessage('Player do Spotify carregado!', 'success');
        });

        player.addListener('not_ready', ({ device_id }) => {
            console.log('Device has gone offline', device_id);
        });

        player.addListener('player_state_changed', (state) => {
            if (state) {
                this.updateNowPlaying(state.track_window.current_track);
            }
        });

        // Conectar ao player
        const connected = await player.connect();
        if (connected) {
            this.spotifyPlayer = player;
            console.log('Successfully connected to Spotify player');
        }
    }

    // API Calls do Spotify
    async makeSpotifyAPICall(endpoint, options = {}) {
        const url = `https://api.spotify.com/v1${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (response.status === 401) {
                // Token expirado, tentar refresh
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    // Tentar novamente com o novo token
                    headers.Authorization = `Bearer ${this.accessToken}`;
                    return await fetch(url, { ...options, headers });
                } else {
                    this.logout();
                    throw new Error('Authentication failed');
                }
            }

            return response;
        } catch (error) {
            console.error('Spotify API call failed:', error);
            throw error;
        }
    }

    async getUserProfile() {
        try {
            const response = await this.makeSpotifyAPICall('/me');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to get user profile:', error);
        }
        return null;
    }

    async getUserPlaylists() {
        try {
            const response = await this.makeSpotifyAPICall('/me/playlists?limit=20');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to get user playlists:', error);
        }
        return null;
    }

    async getUserTopTracks() {
        try {
            const response = await this.makeSpotifyAPICall('/me/top/tracks?limit=10&time_range=medium_term');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to get top tracks:', error);
        }
        return null;
    }

    async getCurrentlyPlaying() {
        try {
            const response = await this.makeSpotifyAPICall('/me/player/currently-playing');
            if (response.ok && response.status !== 204) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to get currently playing:', error);
        }
        return null;
    }

    // Funcionalidades Nostálgicas
    async createNostalgicPlaylist(era = '2000s') {
        const playlistName = `🎵 Nostálgia ${era} - Orkut 2025`;
        const description = `Uma playlist nostálgica criada automaticamente pelo Orkut 2025 com hits dos ${era}`;
        
        try {
            const userProfile = await this.getUserProfile();
            if (!userProfile) return;
            
            // Criar playlist
            const createResponse = await this.makeSpotifyAPICall(`/users/${userProfile.id}/playlists`, {
                method: 'POST',
                body: JSON.stringify({
                    name: playlistName,
                    description: description,
                    public: false
                })
            });
            
            if (createResponse.ok) {
                const playlist = await createResponse.json();
                
                // Buscar músicas nostálgicas baseadas na era
                const nostalgicTracks = await this.findNostalgicTracks(era);
                
                if (nostalgicTracks.length > 0) {
                    // Adicionar músicas à playlist
                    await this.makeSpotifyAPICall(`/playlists/${playlist.id}/tracks`, {
                        method: 'POST',
                        body: JSON.stringify({
                            uris: nostalgicTracks.map(track => track.uri)
                        })
                    });
                }
                
                this.showMessage(`Playlist "${playlistName}" criada com sucesso!`, 'success');
                this.loadUserPlaylists(); // Recarregar playlists
                return playlist;
            }
        } catch (error) {
            console.error('Failed to create nostalgic playlist:', error);
            this.showMessage('Erro ao criar playlist nostálgica', 'error');
        }
        
        return null;
    }

    async findNostalgicTracks(era) {
        // Definir termos de busca baseados na era
        const searchTerms = {
            '2000s': ['year:2000-2009', 'rock', 'pop', 'rnb', 'hip-hop'],
            '1990s': ['year:1990-1999', 'grunge', 'alternative', 'pop', 'dance'],
            '1980s': ['year:1980-1989', 'new wave', 'synth-pop', 'rock', 'pop'],
            '2010s': ['year:2010-2019', 'indie', 'electronic', 'pop', 'hip-hop']
        };
        
        const terms = searchTerms[era] || searchTerms['2000s'];
        const tracks = [];
        
        try {
            for (const term of terms.slice(1)) { // Pular o ano, usar como filtro
                const query = `${term} ${terms[0]}`;
                const response = await this.makeSpotifyAPICall(
                    `/search?q=${encodeURIComponent(query)}&type=track&limit=10`
                );
                
                if (response.ok) {
                    const data = await response.json();
                    tracks.push(...data.tracks.items);
                }
            }
        } catch (error) {
            console.error('Failed to find nostalgic tracks:', error);
        }
        
        // Remover duplicatas e limitar
        const uniqueTracks = tracks.filter((track, index, self) => 
            index === self.findIndex(t => t.id === track.id)
        ).slice(0, 30);
        
        return uniqueTracks;
    }

    async shareTrackToFeed(track, message = '') {
        try {
            const postData = {
                type: 'music',
                content: message || `🎵 Ouvindo agora: ${track.name} - ${track.artists[0].name}`,
                spotify_track_id: track.id,
                spotify_embed_url: `https://open.spotify.com/embed/track/${track.id}`,
                timestamp: new Date().toISOString()
            };
            
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify(postData)
            });
            
            if (response.ok) {
                this.showMessage('Música compartilhada no seu perfil!', 'success');
                // Atualizar feed se estiver visível
                if (typeof updateFeed === 'function') {
                    updateFeed();
                }
            } else {
                throw new Error('Failed to share track');
            }
        } catch (error) {
            console.error('Failed to share track:', error);
            this.showMessage('Erro ao compartilhar música', 'error');
        }
    }

    async setProfileMusic(track) {
        try {
            const response = await fetch('/api/user/profile-music', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    spotify_track_id: track.id,
                    track_name: track.name,
                    artist_name: track.artists[0].name,
                    track_url: track.external_urls.spotify,
                    preview_url: track.preview_url
                })
            });
            
            if (response.ok) {
                this.showMessage('Música do perfil atualizada!', 'success');
            } else {
                throw new Error('Failed to set profile music');
            }
        } catch (error) {
            console.error('Failed to set profile music:', error);
            this.showMessage('Erro ao definir música do perfil', 'error');
        }
    }

    // UI Updates
    updateUIForConnectedState() {
        const connectionCard = document.getElementById('spotify-connection');
        if (connectionCard) {
            connectionCard.innerHTML = `
                <div class="feed-content spotify-connected">
                    <h3>✅ Conectado ao Spotify</h3>
                    <p>Todas as funcionalidades musicais estão ativas!</p>
                    <div class="connected-features">
                        <button class="btn btn-sm" onclick="spotifyIntegration.createNostalgicPlaylist('2000s')">
                            Playlist 2000s
                        </button>
                        <button class="btn btn-sm" onclick="spotifyIntegration.openShareMusicModal()">
                            Compartilhar Música
                        </button>
                        <button class="btn btn-sm" onclick="spotifyIntegration.openProfileMusicModal()">
                            Música do Perfil
                        </button>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="spotifyIntegration.logout()" style="margin-top: 15px;">
                        Desconectar
                    </button>
                </div>
            `;
        }
        
        // Mostrar player se estiver oculto
        const playerContainer = document.getElementById('spotify-player-container');
        if (playerContainer) {
            playerContainer.style.display = 'block';
        }
    }

    displayUserProfile(profile) {
        // Atualizar informações do usuário nas barras laterais
        const musicStats = document.getElementById('music-stats');
        if (musicStats) {
            musicStats.innerHTML = `
                <p>Perfil: <strong>${profile.display_name}</strong></p>
                <p>Seguidores: <strong>${profile.followers.total.toLocaleString()}</strong></p>
                <p>Plano: <strong>${profile.product}</strong></p>
                <p>País: <strong>${profile.country}</strong></p>
            `;
        }
    }

    updateNowPlaying(track) {
        if (!track) return;
        
        const nowPlayingInfo = document.getElementById('nowPlayingInfo');
        if (nowPlayingInfo) {
            nowPlayingInfo.innerHTML = `
                <div class="now-playing-track">
                    <img src="${track.album.images[2]?.url || track.album.images[0]?.url}" alt="${track.name}">
                    <div class="now-playing-info">
                        <strong>${track.name}</strong>
                        <span>${track.artists.map(a => a.name).join(', ')}</span>
                    </div>
                </div>
            `;
        }
        
        // Atualizar widget flutuante se existir
        this.updateFloatingWidget(track);
    }

    updateFloatingWidget(track) {
        let widget = document.querySelector('.floating-music-widget');
        if (!widget) {
            widget = document.createElement('div');
            widget.className = 'floating-music-widget';
            document.body.appendChild(widget);
        }
        
        widget.innerHTML = `
            🎵 ${track.name.substring(0, 20)}${track.name.length > 20 ? '...' : ''}<br>
            <small>${track.artists[0].name}</small>
        `;
        
        widget.classList.add('show');
        widget.onclick = () => this.openSpotifyApp(track);
        
        // Ocultar após 5 segundos
        setTimeout(() => {
            if (widget.classList.contains('show')) {
                widget.classList.remove('show');
            }
        }, 5000);
    }

    async loadUserPlaylists() {
        try {
            const playlistsData = await this.getUserPlaylists();
            if (playlistsData && playlistsData.items) {
                this.displayPlaylists(playlistsData.items.slice(0, 4));
            }
        } catch (error) {
            console.error('Failed to load playlists:', error);
        }
    }

    displayPlaylists(playlists) {
        const playlistGrid = document.querySelector('.playlist-grid');
        if (playlistGrid) {
            playlistGrid.innerHTML = playlists.map(playlist => `
                <div class="playlist-item" onclick="spotifyIntegration.openPlaylist('${playlist.id}')">
                    <img src="${playlist.images[0]?.url || 'images/default-playlist.png'}" 
                         alt="${playlist.name}" width="50" height="50">
                    <span>${playlist.name.substring(0, 15)}${playlist.name.length > 15 ? '...' : ''}</span>
                </div>
            `).join('');
        }
    }

    async loadTrendingSongs() {
        try {
            const topTracks = await this.getUserTopTracks();
            if (topTracks && topTracks.items) {
                this.displayTrendingSongs(topTracks.items.slice(0, 5));
            }
        } catch (error) {
            console.error('Failed to load trending songs:', error);
        }
    }

    displayTrendingSongs(tracks) {
        const trendingSongs = document.querySelector('.trending-songs');
        if (trendingSongs) {
            trendingSongs.innerHTML = tracks.map(track => `
                <div class="song-item" onclick="spotifyIntegration.playTrack('${track.id}')">
                    <img src="${track.album.images[2]?.url || track.album.images[0]?.url}" 
                         alt="${track.name}" width="30" height="30">
                    <div>
                        <strong>${track.name}</strong>
                        <p>${track.artists[0].name}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    async loadUserStats() {
        try {
            const topTracks = await this.getUserTopTracks();
            const playlists = await this.getUserPlaylists();
            
            const statsContainer = document.getElementById('music-stats');
            if (statsContainer && topTracks && playlists) {
                const currentStats = statsContainer.innerHTML;
                statsContainer.innerHTML = currentStats + `
                    <hr>
                    <p>Top Músicas: <strong>${topTracks.items.length}</strong></p>
                    <p>Playlists: <strong>${playlists.total}</strong></p>
                    <p>Última Atualização: <strong>Agora</strong></p>
                `;
            }
        } catch (error) {
            console.error('Failed to load user stats:', error);
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Botão de conexão
        const connectBtn = document.getElementById('connectSpotifyBtn');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.connectToSpotify());
        }
        
        // Botões de ação musical da barra lateral
        document.addEventListener('click', (e) => {
            if (e.target.matches('.music-action[data-action="connect"]')) {
                this.connectToSpotify();
            } else if (e.target.matches('.music-action[data-action="create-playlist"]')) {
                this.createNostalgicPlaylist('2000s');
            } else if (e.target.matches('.music-action[data-action="share-music"]')) {
                this.openShareMusicModal();
            } else if (e.target.matches('.music-action[data-action="set-profile-music"]')) {
                this.openProfileMusicModal();
            }
        });
    }

    // Monitoramento de música atual
    startCurrentlyPlayingMonitor() {
        setInterval(async () => {
            const currentTrack = await this.getCurrentlyPlaying();
            if (currentTrack && currentTrack.is_playing) {
                this.updateNowPlaying(currentTrack.item);
            }
        }, 30000); // Verificar a cada 30 segundos
    }

    // Utility Methods
    openSpotifyApp(track) {
        if (track && track.external_urls && track.external_urls.spotify) {
            window.open(track.external_urls.spotify, '_blank');
        }
    }

    openPlaylist(playlistId) {
        window.open(`https://open.spotify.com/playlist/${playlistId}`, '_blank');
    }

    async playTrack(trackId) {
        if (this.spotifyPlayer && this.deviceId) {
            try {
                await this.makeSpotifyAPICall(`/me/player/play?device_id=${this.deviceId}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        uris: [`spotify:track:${trackId}`]
                    })
                });
            } catch (error) {
                console.error('Failed to play track:', error);
                // Fallback: abrir no Spotify
                window.open(`https://open.spotify.com/track/${trackId}`, '_blank');
            }
        } else {
            // Abrir no Spotify se player não estiver disponível
            window.open(`https://open.spotify.com/track/${trackId}`, '_blank');
        }
    }

    openShareMusicModal() {
        // Implementar modal para compartilhar música
        const modal = this.createModal('Compartilhar Música', `
            <div class="share-music-form">
                <input type="text" id="searchMusic" placeholder="Buscar música..." class="form-control mb-3">
                <div id="searchResults"></div>
                <textarea id="shareMessage" placeholder="Escreva algo sobre a música..." class="form-control mb-3"></textarea>
                <button onclick="spotifyIntegration.searchAndShareMusic()" class="btn btn-primary">Compartilhar</button>
            </div>
        `);
        
        modal.show();
    }

    openProfileMusicModal() {
        // Implementar modal para definir música do perfil
        const modal = this.createModal('Música do Perfil', `
            <div class="profile-music-form">
                <p>Escolha uma música para aparecer no seu perfil:</p>
                <input type="text" id="searchProfileMusic" placeholder="Buscar música..." class="form-control mb-3">
                <div id="profileMusicResults"></div>
                <button onclick="spotifyIntegration.searchAndSetProfileMusic()" class="btn btn-primary">Definir como Música do Perfil</button>
            </div>
        `);
        
        modal.show();
    }

    createModal(title, content) {
        // Criar modal simples para as funcionalidades
        const modalHtml = `
            <div class="modal-backdrop" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1001; display: flex; align-items: center; justify-content: center;">
                <div class="modal-dialog" style="background: white; border-radius: 10px; padding: 20px; max-width: 500px; width: 90%;">
                    <div class="modal-header" style="margin-bottom: 15px;">
                        <h3>${title}</h3>
                        <button onclick="this.closest('.modal-backdrop').remove()" style="float: right; border: none; background: none; font-size: 20px;">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        const modalElement = document.createElement('div');
        modalElement.innerHTML = modalHtml;
        document.body.appendChild(modalElement.firstElementChild);
        
        return {
            show: () => {}, // Modal já é mostrado
            hide: () => document.querySelector('.modal-backdrop')?.remove()
        };
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `spotify-message ${type}`;
        messageDiv.textContent = message;
        
        // Adicionar ao container de mensagens ou ao topo da página
        const container = document.querySelector('.main-content') || document.body;
        container.insertBefore(messageDiv, container.firstChild);
        
        // Remover após 5 segundos
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    generateRandomString(length) {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let text = '';
        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    logout() {
        // Limpar tokens e dados
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_auth_state');
        
        this.accessToken = null;
        this.refreshToken = null;
        this.isInitialized = false;
        
        // Desconectar player
        if (this.spotifyPlayer) {
            this.spotifyPlayer.disconnect();
            this.spotifyPlayer = null;
        }
        
        this.showMessage('Desconectado do Spotify', 'success');
        
        // Recarregar página para resetar UI
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.spotifyIntegration = new SpotifyIntegration();
});

// Funções globais para compatibilidade
function connectToSpotify() {
    if (window.spotifyIntegration) {
        window.spotifyIntegration.connectToSpotify();
    }
}

function createNostalgicPlaylist(era) {
    if (window.spotifyIntegration) {
        window.spotifyIntegration.createNostalgicPlaylist(era);
    }
}

function shareCurrentMusic() {
    if (window.spotifyIntegration) {
        window.spotifyIntegration.openShareMusicModal();
    }
}

function setProfileMusic() {
    if (window.spotifyIntegration) {
        window.spotifyIntegration.openProfileMusicModal();
    }
}

function logoutSpotify() {
    if (window.spotifyIntegration) {
        window.spotifyIntegration.logout();
    }
}
