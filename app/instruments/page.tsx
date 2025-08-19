import { createClient } from '../../utils/supabase/server'

export default async function Instruments() {
  const supabase = await createClient()
  const { data: instruments } = await supabase.from("instruments").select()

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎻 Instrumentos - Teste Oficial Supabase</h1>
      <p>Esta página demonstra a integração Next.js + Supabase conforme documentação oficial.</p>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #dee2e6', 
        borderRadius: '8px', 
        padding: '1rem',
        marginTop: '1rem'
      }}>
        <h2>📊 Dados do Supabase:</h2>
        <pre style={{ 
          backgroundColor: '#ffffff', 
          padding: '1rem', 
          borderRadius: '4px',
          border: '1px solid #e9ecef',
          overflow: 'auto'
        }}>
          {JSON.stringify(instruments, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.9em', color: '#6c757d' }}>
        <p>✅ Cliente Supabase SSR configurado</p>
        <p>✅ Tabela 'instruments' criada</p>
        <p>✅ Dados carregados server-side</p>
        <p>✅ Configuração conforme documentação oficial</p>
      </div>
    </div>
  )
}
