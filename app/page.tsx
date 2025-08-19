'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'

// Tipagem correta para os todos
interface Todo {
  id: number
  title: string
  created_at: string
}

export default function Page() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Função async separada para ser chamada dentro do useEffect
    const getTodos = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erro ao buscar todos:', error.message)
          setError(error.message)
          return
        }

        if (data) {
          setTodos(data)
        }
      } catch (err) {
        console.error('Erro inesperado:', err)
        setError('Erro inesperado ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    getTodos()
  }, [])

  const addTodo = async (title: string) => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ title }])
        .select()

      if (error) {
        console.error('Erro ao adicionar todo:', error.message)
        setError(error.message)
        return
      }

      if (data && data[0]) {
        setTodos([data[0], ...todos])
      }
    } catch (err) {
      console.error('Erro inesperado:', err)
      setError('Erro inesperado ao adicionar item')
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const title = formData.get('title') as string
    
    if (title.trim()) {
      addTodo(title.trim())
      form.reset()
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Orkut Retrô - Todos</h1>
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <a 
          href="/demo" 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#6c5ce7', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '6px',
            marginRight: '10px',
            display: 'inline-block'
          }}
        >
          🎉 Ver Demo Completo
        </a>
      </div>
      
      <h1>Orkut Retrô - Todos</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          name="title"
          placeholder="Digite um novo todo..."
          style={{ padding: '8px', marginRight: '8px', width: '300px' }}
          required
        />
        <button type="submit" style={{ padding: '8px 16px' }}>
          Adicionar
        </button>
      </form>

      {error && (
        <p style={{ color: 'red', marginBottom: '20px' }}>
          Erro: {error}
        </p>
      )}

      <h2>Lista de Todos:</h2>
      {todos.length === 0 ? (
        <p>Nenhum todo encontrado. Adicione um novo!</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id} style={{ marginBottom: '8px' }}>
              <strong>{todo.title}</strong>
              <br />
              <small>Criado em: {new Date(todo.created_at).toLocaleString('pt-BR')}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
