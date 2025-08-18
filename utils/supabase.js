import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksskokjrdzqghhuahjpl.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzc2tva2pyZHpxZ2hodWFoanBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDUzMTEsImV4cCI6MjA3MTEyMTMxMX0.tyQ15i2ypP7BW5UCKOkptJFCHo5IDdRD4ojzcmHSpK4'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Função auxiliar para lidar com erros do Supabase
export function handleSupabaseError(error) {
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
