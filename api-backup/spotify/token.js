const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

// Configurações do Spotify App - devem ser definidas como variáveis de ambiente
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.error('⚠️  Spotify Client ID e Client Secret devem ser configurados nas variáveis de ambiente');
}

/**
 * Endpoint para troca de código de autorização por tokens de acesso
 * POST /api/spotify/token
 * Body: { code: string, redirect_uri: string }
 */
module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { code, redirect_uri } = req.body;

        if (!code || !redirect_uri) {
            return res.status(400).json({ 
                error: 'Missing required fields: code, redirect_uri' 
            });
        }

        // Parâmetros para troca do código por tokens
        const tokenParams = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirect_uri
        });

        // Credenciais codificadas em base64
        const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

        // Fazer requisição para o Spotify
        const spotifyResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`
            },
            body: tokenParams.toString()
        });

        if (!spotifyResponse.ok) {
            const errorData = await spotifyResponse.json();
            console.error('Spotify token exchange error:', errorData);
            return res.status(400).json({ 
                error: 'Failed to exchange code for tokens',
                details: errorData 
            });
        }

        const tokens = await spotifyResponse.json();

        // Log para debug (sem expor tokens sensíveis em produção)
        console.log('✅ Spotify tokens exchanged successfully');

        // Retornar tokens para o cliente
        res.status(200).json({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_in: tokens.expires_in,
            token_type: tokens.token_type,
            scope: tokens.scope
        });

    } catch (error) {
        console.error('Token exchange error:', error);
        res.status(500).json({ 
            error: 'Internal server error during token exchange',
            message: error.message 
        });
    }
};
