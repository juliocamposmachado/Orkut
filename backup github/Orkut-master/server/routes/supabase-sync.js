const { Router } = require('express');
const { supabase } = require('../config/supabase');

const router = Router();

// Helper function to find or create user
async function findOrCreateUser(identifier) {
  try {
    let user = null;
    
    // Try to find user by different fields
    if (identifier.includes('@')) {
      // Email
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, username')
        .eq('email', identifier)
        .single();
      user = data;
    } else if (identifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // UUID
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, username')
        .eq('id', identifier)
        .single();
      user = data;
    } else {
      // Username
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, username')
        .eq('username', identifier)
        .single();
      user = data;
    }
    
    // If user doesn't exist, create a test user
    if (!user) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: identifier,
          email: `${identifier}@orky.test`,
          username: identifier,
          password_hash: 'orky_test_hash'
        })
        .select('id, name, email, username')
        .single();
      
      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }
      user = data;
    }
    
    return user;
  } catch (error) {
    console.error('findOrCreateUser error:', error);
    throw error;
  }
}

// Sync profile data
async function syncProfile(userId, payload) {
  const { name, bio, location, age } = payload || {};
  
  // Update user name if provided
  if (name) {
    await supabase
      .from('users')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', userId);
  }
  
  // Upsert profile
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      user_id: userId,
      bio: bio || '',
      location: location || '',
      age: age || null,
      last_active: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Sync status/post
async function syncStatus(userId, payload) {
  const { text } = payload || {};
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      content: text || '',
      post_type: 'status'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Sync message
async function syncMessage(fromUserId, payload) {
  const { to, subject, content } = payload || {};
  
  if (!to || !content) {
    throw new Error('Message requires "to" and "content"');
  }
  
  // Find recipient
  const toUser = await findOrCreateUser(to);
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      from_user_id: fromUserId,
      to_user_id: toUser.id,
      subject: subject || 'Sem assunto',
      content: content,
      is_read: false
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Sync community
async function syncCommunity(userId, payload) {
  const { name, category, description } = payload || {};
  
  if (!name) {
    throw new Error('Community requires "name"');
  }
  
  const { data, error } = await supabase
    .from('communities')
    .insert({
      name: name,
      description: description || '',
      category: category || 'Geral',
      creator_id: userId
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Sync scrap
async function syncScrap(fromUserId, payload) {
  const { to, content } = payload || {};
  
  if (!to || !content) {
    throw new Error('Scrap requires "to" and "content"');
  }
  
  // Find recipient
  const toUser = await findOrCreateUser(to);
  
  const { data, error } = await supabase
    .from('scraps')
    .insert({
      from_user_id: fromUserId,
      to_user_id: toUser.id,
      content: content,
      is_public: true
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Main sync endpoint
router.post('/sync', async (req, res) => {
  const { userId, type, payload } = req.body || {};
  
  if (!userId || !type) {
    return res.status(400).json({ 
      ok: false, 
      error: 'userId and type are required' 
    });
  }
  
  try {
    // Find or create user
    const user = await findOrCreateUser(userId);
    console.log('🔄 Syncing for user:', user.username, '(', user.id.substring(0, 8), '...)');
    
    let result = null;
    
    switch (type) {
      case 'profile':
        result = await syncProfile(user.id, payload);
        break;
        
      case 'status':
        result = await syncStatus(user.id, payload);
        break;
        
      case 'message':
        result = await syncMessage(user.id, payload);
        break;
        
      case 'community':
        result = await syncCommunity(user.id, payload);
        break;
        
      case 'scrap':
        result = await syncScrap(user.id, payload);
        break;
        
      default:
        return res.status(400).json({ 
          ok: false, 
          error: `Unknown sync type: ${type}` 
        });
    }
    
    res.json({ 
      ok: true, 
      userUuid: user.id,
      username: user.username,
      result: result,
      type: type
    });
    
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// Get user data
router.get('/user/:identifier', async (req, res) => {
  const { identifier } = req.params;
  
  try {
    const user = await findOrCreateUser(identifier);
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    // Get user posts
    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    res.json({
      ok: true,
      user: user,
      profile: profile,
      posts: posts || []
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// Get feed data  
router.get('/feed/:userId?', async (req, res) => {
  const { userId } = req.params;
  
  try {
    let query = supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey (
          id,
          name,
          username
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (userId) {
      const user = await findOrCreateUser(userId);
      // In a real app, this would filter by friends
      // For now, just get all posts
    }
    
    const { data: posts, error } = await query;
    
    if (error) throw error;
    
    res.json({
      ok: true,
      posts: posts || []
    });
    
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

module.exports = router;
