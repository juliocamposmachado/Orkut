const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

// Configurações do Spotify App
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

/**
 * Endpoint para renovar tokens de acesso do Spotify
 * POST /api/spotify/refresh
 * Body: { refresh_token: string }
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
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(400).json({ 
                error: 'Missing required field: refresh_token' 
            });
        }

        if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
            return res.status(500).json({ 
                error: 'Spotify configuration missing' 
            });
        }

        // Parâmetros para renovação do token
        const refreshParams = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refresh_token
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
            body: refreshParams.toString()
        });

        if (!spotifyResponse.ok) {
            const errorData = await spotifyResponse.json();
            console.error('Spotify token refresh error:', errorData);
            return res.status(400).json({ 
                error: 'Failed to refresh token',
                details: errorData 
            });
        }

        const tokens = await spotifyResponse.json();

        // Log para debug
        console.log('✅ Spotify token refreshed successfully');

        // Retornar novo token de acesso
        res.status(200).json({
            access_token: tokens.access_token,
            token_type: tokens.token_type,
            expires_in: tokens.expires_in,
            scope: tokens.scope,
            // Alguns refresh podem retornar um novo refresh_token
            ...(tokens.refresh_token && { refresh_token: tokens.refresh_token })
        });

    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ 
            error: 'Internal server error during token refresh',
            message: error.message 
        });
    }
};
