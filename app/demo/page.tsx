'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase/client'

// Interfaces para os dados do Orkut
interface User {
  id: string
  name: string
  username: string
  created_at: string
}

interface Profile {
  id: string
  user_id: string
  photo_url?: string
  status?: string
  profile_views: number
}

interface Post {
  id: string
  user_id: string
  content: string
  post_type: string
  likes_count: number
  comments_count: number
  created_at: string
}

interface Scrap {
  id: string
  from_user_id: string
  to_user_id: string
  content: string
  created_at: string
  is_public: boolean
}

export default function DemoPage() {
  const [users, setUsers] = useState<User[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [scraps, setScraps] = useState<Scrap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Buscar usuários
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(5)

      if (usersError) {
        console.error('Erro ao buscar usuários:', usersError.message)
      } else if (usersData) {
        setUsers(usersData)
      }

      // Buscar perfis
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5)

      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError.message)
      } else if (profilesData) {
        setProfiles(profilesData)
      }

      // Buscar posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (postsError) {
        console.error('Erro ao buscar posts:', postsError.message)
      } else if (postsData) {
        setPosts(postsData)
      }

      // Buscar scraps
      const { data: scrapsData, error: scrapsError } = await supabase
        .from('scraps')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(5)

      if (scrapsError) {
        console.error('Erro ao buscar scraps:', scrapsError.message)
      } else if (scrapsData) {
        setScraps(scrapsData)
      }

    } catch (err) {
      console.error('Erro inesperado:', err)
      setError('Erro inesperado ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const createSampleUser = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          name: `Usuário Demo ${Date.now()}`,
          email: `demo${Date.now()}@orkut.com`,
          username: `user${Date.now()}`,
          password_hash: 'demo_hash'
        }])
        .select()

      if (error) {
        setError(error.message)
      } else if (data && data[0]) {
        setUsers([...users, data[0]])
        alert('Usuário criado com sucesso!')
      }
    } catch (err) {
      console.error('Erro ao criar usuário:', err)
      setError('Erro ao criar usuário')
    }
  }

  const createSamplePost = async () => {
    if (users.length === 0) {
      alert('Crie um usuário primeiro!')
      return
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          user_id: users[0].id,
          content: `Post demo criado em ${new Date().toLocaleString('pt-BR')} 🎉`,
          post_type: 'status'
        }])
        .select()

      if (error) {
        setError(error.message)
      } else if (data && data[0]) {
        setPosts([data[0], ...posts])
        alert('Post criado com sucesso!')
      }
    } catch (err) {
      console.error('Erro ao criar post:', err)
      setError('Erro ao criar post')
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Orkut Retrô - Demo Completo</h1>
        <p>Carregando dados...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎉 Orkut Retrô - Demo Completo</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('users')}
          style={{ 
            padding: '8px 16px', 
            marginRight: '8px',
            backgroundColor: activeTab === 'users' ? '#0070f3' : '#ccc',
            color: activeTab === 'users' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Usuários ({users.length})
        </button>
        <button 
          onClick={() => setActiveTab('profiles')}
          style={{ 
            padding: '8px 16px', 
            marginRight: '8px',
            backgroundColor: activeTab === 'profiles' ? '#0070f3' : '#ccc',
            color: activeTab === 'profiles' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Perfis ({profiles.length})
        </button>
        <button 
          onClick={() => setActiveTab('posts')}
          style={{ 
            padding: '8px 16px', 
            marginRight: '8px',
            backgroundColor: activeTab === 'posts' ? '#0070f3' : '#ccc',
            color: activeTab === 'posts' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Posts ({posts.length})
        </button>
        <button 
          onClick={() => setActiveTab('scraps')}
          style={{ 
            padding: '8px 16px', 
            marginRight: '8px',
            backgroundColor: activeTab === 'scraps' ? '#0070f3' : '#ccc',
            color: activeTab === 'scraps' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Scraps ({scraps.length})
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#ffe6e6', 
          border: '1px solid #ff9999', 
          borderRadius: '4px', 
          marginBottom: '20px',
          color: '#cc0000'
        }}>
          <strong>Erro:</strong> {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={createSampleUser}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          ➕ Criar Usuário Demo
        </button>
        <button 
          onClick={createSamplePost}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#17a2b8', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📝 Criar Post Demo
        </button>
      </div>

      {activeTab === 'users' && (
        <div>
          <h2>👥 Usuários</h2>
          {users.length === 0 ? (
            <p>Nenhum usuário encontrado. Clique em "Criar Usuário Demo" para adicionar um!</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {users.map((user) => (
                <div key={user.id} style={{ 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <h3>{user.name}</h3>
                  <p><strong>Username:</strong> @{user.username}</p>
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Criado em:</strong> {new Date(user.created_at).toLocaleString('pt-BR')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profiles' && (
        <div>
          <h2>📋 Perfis</h2>
          {profiles.length === 0 ? (
            <p>Nenhum perfil encontrado.</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {profiles.map((profile) => (
                <div key={profile.id} style={{ 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  backgroundColor: '#f0f8ff'
                }}>
                  <p><strong>Status:</strong> {profile.status || 'Sem status'}</p>
                  <p><strong>Visualizações:</strong> {profile.profile_views}</p>
                  <p><strong>User ID:</strong> {profile.user_id}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'posts' && (
        <div>
          <h2>📝 Posts</h2>
          {posts.length === 0 ? (
            <p>Nenhum post encontrado. Clique em "Criar Post Demo" para adicionar um!</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {posts.map((post) => (
                <div key={post.id} style={{ 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  backgroundColor: '#fff5f5'
                }}>
                  <p><strong>Conteúdo:</strong> {post.content}</p>
                  <p><strong>Tipo:</strong> {post.post_type}</p>
                  <p><strong>Likes:</strong> {post.likes_count} | <strong>Comentários:</strong> {post.comments_count}</p>
                  <p><strong>Criado em:</strong> {new Date(post.created_at).toLocaleString('pt-BR')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'scraps' && (
        <div>
          <h2>💬 Scraps</h2>
          {scraps.length === 0 ? (
            <p>Nenhum scrap encontrado.</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {scraps.map((scrap) => (
                <div key={scrap.id} style={{ 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  backgroundColor: '#f0fff0'
                }}>
                  <p><strong>Conteúdo:</strong> {scrap.content}</p>
                  <p><strong>Público:</strong> {scrap.is_public ? 'Sim' : 'Não'}</p>
                  <p><strong>Criado em:</strong> {new Date(scrap.created_at).toLocaleString('pt-BR')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>📊 Estatísticas</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
            <h4>{users.length}</h4>
            <p>Usuários</p>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
            <h4>{profiles.length}</h4>
            <p>Perfis</p>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
            <h4>{posts.length}</h4>
            <p>Posts</p>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
            <h4>{scraps.length}</h4>
            <p>Scraps</p>
          </div>
        </div>
      </div>
    </div>
  )
}
