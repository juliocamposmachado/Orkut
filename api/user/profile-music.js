const supabase = require('../../db/supabase');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'orkut-2025-secret-key';

/**
 * Endpoint para definir música do perfil do usuário
 * POST /api/user/profile-music
 * Headers: Authorization: Bearer <token>
 * Body: { spotify_track_id, track_name, artist_name, track_url, preview_url }
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
        // Verificar autenticação
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization token' });
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const userId = decoded.userId;
        const { spotify_track_id, track_name, artist_name, track_url, preview_url } = req.body;

        // Validar dados obrigatórios
        if (!spotify_track_id || !track_name || !artist_name) {
            return res.status(400).json({ 
                error: 'Missing required fields: spotify_track_id, track_name, artist_name' 
            });
        }

        // Atualizar música do perfil na base de dados
        const { error: updateError } = await supabase
            .from('users')
            .update({
                profile_music_spotify_id: spotify_track_id,
                profile_music_name: track_name,
                profile_music_artist: artist_name,
                profile_music_url: track_url,
                profile_music_preview_url: preview_url,
                profile_music_updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) {
            console.error('Database update error:', updateError);
            return res.status(500).json({ 
                error: 'Failed to update profile music',
                details: updateError.message 
            });
        }

        // Buscar dados atualizados do usuário para confirmação
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('username, profile_music_name, profile_music_artist')
            .eq('id', userId)
            .single();

        if (fetchError) {
            console.error('User fetch error:', fetchError);
            // Não falhar aqui, apenas logar o erro
        }

        console.log(`✅ Profile music updated for user ${user?.username || userId}: ${track_name} - ${artist_name}`);

        res.status(200).json({
            success: true,
            message: 'Profile music updated successfully',
            profile_music: {
                spotify_track_id,
                track_name,
                artist_name,
                track_url,
                preview_url
            }
        });

    } catch (error) {
        console.error('Profile music update error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
};
