'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  user_metadata?: {
    name?: string
  }
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/')
        return
      }
      
      setUser(user as User)
      setLoading(false)
    }

    getUser()
  }, [router, supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="loading">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <header className="main-header" style={{
        background: 'linear-gradient(135deg, var(--primary-purple), var(--primary-pink))',
        padding: '10px 0',
        boxShadow: '0 2px 10px var(--shadow-medium)',
        marginBottom: '20px'
      }}>
        <div className="header-container container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="logo">
            <h1><Link href="/home" style={{ color: 'white', textDecoration: 'none' }}>orkut</Link></h1>
          </div>
          
          <nav className="main-nav" style={{
            display: 'flex',
            gap: '20px'
          }}>
            <Link href="/home" className="nav-link active" style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }}>início</Link>
            <Link href="/profile" className="nav-link" style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: '10px'
            }}>perfil</Link>
            <Link href="/friends" className="nav-link" style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: '10px'
            }}>amigos</Link>
            <Link href="/messages" className="nav-link" style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: '10px'
            }}>mensagens</Link>
            <Link href="/communities" className="nav-link" style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: '10px'
            }}>comunidades</Link>
          </nav>
          
          <div className="user-info" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'white'
          }}>
            <img 
              src="https://via.placeholder.com/32x32/a855c7/ffffff?text=U" 
              alt="Foto do usuário" 
              className="user-photo"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%'
              }}
            />
            <span>{user?.user_metadata?.name || user?.email}</span>
            <button 
              onClick={handleLogout} 
              className="logout-link"
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >sair</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-container container">
        <div className="content-wrapper" style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr 250px',
          gap: '20px'
        }}>
          {/* Left Sidebar */}
          <aside className="left-sidebar">
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <img 
                  src="https://via.placeholder.com/80x80/a855c7/ffffff?text=U" 
                  alt="Foto do usuário"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '10px',
                    marginBottom: '10px'
                  }}
                />
                <div className="user-info">
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{user?.user_metadata?.name || 'Usuário'}</h3>
                  <p style={{ margin: '0 0 15px 0', fontSize: '11px', color: 'var(--text-light)', fontStyle: 'italic' }}>
                    "Bem-vindo ao Orkut Retrô!"
                  </p>
                </div>
                <div className="user-stats" style={{
                  display: 'flex',
                  justifyContent: 'space-around'
                }}>
                  <div className="stat">
                    <span className="number" style={{ display: 'block', fontWeight: 'bold', color: 'var(--primary-purple)' }}>0</span>
                    <span className="label" style={{ fontSize: '10px', color: 'var(--text-light)' }}>amigos</span>
                  </div>
                  <div className="stat">
                    <span className="number" style={{ display: 'block', fontWeight: 'bold', color: 'var(--primary-purple)' }}>0</span>
                    <span className="label" style={{ fontSize: '10px', color: 'var(--text-light)' }}>visitas</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Ações rápidas</h3>
              </div>
              <div className="card-body">
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '8px' }}>
                    <Link href="/profile" style={{ color: 'var(--primary-purple)', textDecoration: 'none', fontSize: '11px' }}>
                      Ver meu perfil
                    </Link>
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <Link href="/friends" style={{ color: 'var(--primary-purple)', textDecoration: 'none', fontSize: '11px' }}>
                      Procurar amigos
                    </Link>
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <Link href="/communities" style={{ color: 'var(--primary-purple)', textDecoration: 'none', fontSize: '11px' }}>
                      Encontrar comunidades
                    </Link>
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <Link href="/messages" style={{ color: 'var(--primary-purple)', textDecoration: 'none', fontSize: '11px' }}>
                      Ver mensagens
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Amigos online</h3>
              </div>
              <div className="card-body">
                <p style={{ fontSize: '11px', color: 'var(--text-light)' }}>Carregando...</p>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <section className="main-feed">
            <div className="feed-header" style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', marginBottom: '5px' }}>Últimas atualizações</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>Veja o que seus amigos estão fazendo</p>
            </div>

            {/* Welcome Message */}
            <div className="card feed-item welcome-message">
              <div className="card-body">
                <div className="feed-header-info" style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <div 
                    className="feed-avatar"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary-purple), var(--primary-pink))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      marginRight: '10px'
                    }}
                  >
                    O
                  </div>
                  <div className="feed-author-info">
                    <span className="feed-author" style={{ 
                      display: 'block', 
                      fontWeight: 'bold', 
                      fontSize: '12px' 
                    }}>Orkut Retrô</span>
                    <span className="feed-time" style={{ 
                      fontSize: '10px', 
                      color: 'var(--text-light)' 
                    }}>agora</span>
                  </div>
                </div>
                <div className="feed-content">
                  <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>🎉 Bem-vindo de volta ao Orkut!</h3>
                  <p style={{ fontSize: '12px', lineHeight: '1.5', marginBottom: '15px' }}>
                    A rede social dos anos 2000 está de volta! Reconnecte-se com seus amigos, participe de comunidades e reviva os melhores momentos da internet retrô. Que a nostalgia comece! 💜
                  </p>
                  <div className="feed-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-light" style={{ fontSize: '10px', padding: '5px 10px' }}>❤️ Curtir</button>
                    <button className="btn btn-light" style={{ fontSize: '10px', padding: '5px 10px' }}>💬 Comentar</button>
                    <button className="btn btn-light" style={{ fontSize: '10px', padding: '5px 10px' }}>📤 Compartilhar</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feed Container */}
            <div className="card">
              <div className="card-body">
                <div className="loading text-center">
                  <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>Carregando feed...</p>
                </div>
              </div>
            </div>

            {/* Load More */}
            <div className="text-center" style={{ marginTop: '20px' }}>
              <button className="btn btn-secondary">Carregar mais</button>
            </div>
          </section>

          {/* Right Sidebar */}
          <aside className="right-sidebar">
            <div className="card">
              <div className="card-header">
                <h3>Comunidades em alta</h3>
              </div>
              <div className="card-body">
                <p style={{ fontSize: '11px', color: 'var(--text-light)' }}>Carregando...</p>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Fotos recentes</h3>
              </div>
              <div className="card-body">
                <div className="photos-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '5px'
                }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="photo-item">
                      <div style={{
                        width: '100%',
                        height: '60px',
                        backgroundColor: 'var(--light-purple)',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: 'var(--text-light)'
                      }}>
                        Foto
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Aniversários</h3>
              </div>
              <div className="card-body">
                <p style={{ fontSize: '11px', color: 'var(--text-light)' }}>Nenhum aniversário hoje</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  )
}
