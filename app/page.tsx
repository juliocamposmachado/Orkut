'use client'

import { useState } from 'react'
import { createClient } from '../utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [showRegister, setShowRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/home')
    }

    setLoading(false)
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    })

    if (error) {
      setError(error.message)
    } else {
      setError('Verifique seu email para confirmar a conta')
    }

    setLoading(false)
  }

  return (
    <body className="login-body">
      <div className="container">
        <header className="header">
          <div className="logo">
            <h1>orkut retrô</h1>
            <p className="tagline">conecte-se aos seus amigos e muito mais</p>
          </div>
        </header>

        <main className="main-content">
          <div className="welcome-section">
            <h2>Bem-vindo ao Orkut Retrô!</h2>
            <p>Reviva a magia das redes sociais dos anos 2000. Conecte-se com seus amigos, participe de comunidades e compartilhe seus momentos especiais!</p>
            
            <div className="features">
              <div className="feature">
                <span className="icon">👥</span>
                <h3>Conecte-se com Amigos</h3>
                <p>Encontre antigos amigos e faça novos</p>
              </div>
              <div className="feature">
                <span className="icon">💬</span>
                <h3>Scraps e Depoimentos</h3>
                <p>Deixe recados e depoimentos especiais</p>
              </div>
              <div className="feature">
                <span className="icon">🏠</span>
                <h3>Comunidades</h3>
                <p>Participe de grupos com seus interesses</p>
              </div>
            </div>
          </div>

          <div className="auth-section">
            {/* Login Form */}
            <div className={`auth-form ${showRegister ? 'hidden' : ''}`}>
              <div className="form-header">
                <h3>Faça login</h3>
                <p>Entre na sua conta</p>
              </div>
              
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="loginEmail">E-mail:</label>
                  <input type="email" id="loginEmail" name="email" required disabled={loading} />
                </div>
                
                <div className="form-group">
                  <label htmlFor="loginPassword">Senha:</label>
                  <input type="password" id="loginPassword" name="password" required disabled={loading} />
                </div>
                
                <div className="form-options">
                  <label className="checkbox-label">
                    <input type="checkbox" disabled={loading} /> Lembrar de mim
                  </label>
                  <a href="#" className="forgot-password">Esqueceu a senha?</a>
                </div>
                
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
              
              <div className="form-footer">
                <p>Não tem uma conta? <a href="#" onClick={(e) => { e.preventDefault(); setShowRegister(true); }}>Cadastre-se</a></p>
              </div>
            </div>

            {/* Register Form */}
            <div className={`auth-form ${!showRegister ? 'hidden' : ''}`}>
              <div className="form-header">
                <h3>Criar conta</h3>
                <p>Junte-se ao Orkut Retrô</p>
              </div>
              
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label htmlFor="registerName">Nome completo:</label>
                  <input type="text" id="registerName" name="name" required disabled={loading} />
                </div>
                
                <div className="form-group">
                  <label htmlFor="registerEmail">E-mail:</label>
                  <input type="email" id="registerEmail" name="email" required disabled={loading} />
                </div>
                
                <div className="form-group">
                  <label htmlFor="registerPassword">Senha:</label>
                  <input type="password" id="registerPassword" name="password" required disabled={loading} />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar senha:</label>
                  <input type="password" id="confirmPassword" name="confirmPassword" required disabled={loading} />
                </div>
                
                <div className="form-options">
                  <label className="checkbox-label">
                    <input type="checkbox" required disabled={loading} /> Aceito os <a href="#">termos de uso</a>
                  </label>
                </div>
                
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar conta'}
                </button>
              </form>
              
              <div className="form-footer">
                <p>Já tem uma conta? <a href="#" onClick={(e) => { e.preventDefault(); setShowRegister(false); }}>Faça login</a></p>
              </div>
            </div>

            {error && (
              <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                backgroundColor: error.includes('Verifique') ? '#d4edda' : '#f8d7da',
                border: `1px solid ${error.includes('Verifique') ? '#c3e6cb' : '#f5c6cb'}`,
                borderRadius: '5px',
                fontSize: '11px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
          </div>
        </main>

        <footer className="footer">
          <p>&copy; 2025 Orkut Retrô - Uma homenagem nostálgica aos anos 2000</p>
          <div className="footer-links">
            <a href="#">Sobre</a>
            <a href="#">Privacidade</a>
            <a href="#">Termos</a>
            <a href="#">Contato</a>
          </div>
        </footer>
      </div>
    </body>
  )
}
