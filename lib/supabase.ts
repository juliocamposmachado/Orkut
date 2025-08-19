import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (adicione conforme necessário)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          username: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          username: string
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          username?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          photo_url: string | null
          status: string
          age: number | null
          location: string | null
          relationship_status: string | null
          birthday: string | null
          bio: string | null
          profile_views: number
          join_date: string
          last_active: string
        }
        Insert: {
          id?: string
          user_id: string
          photo_url?: string | null
          status?: string
          age?: number | null
          location?: string | null
          relationship_status?: string | null
          birthday?: string | null
          bio?: string | null
          profile_views?: number
          join_date?: string
          last_active?: string
        }
        Update: {
          photo_url?: string | null
          status?: string
          age?: number | null
          location?: string | null
          relationship_status?: string | null
          birthday?: string | null
          bio?: string | null
          profile_views?: number
          last_active?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Função para lidar com erros do Supabase
export function handleSupabaseError(error: any): string {
  console.error('Supabase error:', error)
  
  if (error?.message?.includes('duplicate key value')) {
    return 'Este email já está cadastrado'
  }
  
  if (error?.message?.includes('invalid input syntax')) {
    return 'Dados inválidos fornecidos'
  }
  
  if (error?.message?.includes('connection')) {
    return 'Erro de conexão com o banco de dados'
  }
  
  return error?.message || 'Erro desconhecido'
}
