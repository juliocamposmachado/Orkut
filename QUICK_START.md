# 🚀 Quick Start - Orkut Retrô Next.js

## ⚡ Passos Rápidos

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar Supabase
No painel do Supabase (https://supabase.com/dashboard/projects/ksskokjrdzqghhuahjpl), execute:

**SQL Editor → Nova Query → Cole e execute:**

**Para testar rapidamente (apenas tabela todos):**
```sql
create table if not exists public.todos (
  id serial primary key,
  title text not null,
  created_at timestamptz default now()
);

alter table public.todos enable row level security;
create policy "Todos are viewable by everyone" on public.todos for select to public using (true);
create policy "Todos can be created by everyone" on public.todos for insert to public with check (true);
```

**Para schema completo (todas as tabelas do Orkut):**
```sql
-- Execute todo o conteúdo do arquivo sql/001_create_todos_table.sql
-- Depois execute o SQL completo que você forneceu com todas as tabelas
```

### 3. Atualizar .env.local
**IMPORTANTE**: Substitua `[SENHA]` pela senha real do seu banco:
```bash
# Abra o arquivo .env.local e troque [SENHA] pela senha do seu projeto Supabase
```

### 4. Executar
```bash
npm run dev
```

### 5. Testar
- Acesse: http://localhost:3000
- Adicione alguns todos
- Verifique se não há erros no console

## 🔧 Correções Implementadas

✅ **Async/Await correto**: Função `getTodos()` declarada como `async` dentro do `useEffect`
✅ **React Keys**: Cada `<li>` tem `key={todo.id}` único  
✅ **Propriedades corretas**: `{todo.title}` em vez de `{todo}`
✅ **Tipagem completa**: Interface `Todo` com `id`, `title`, `created_at`
✅ **Tratamento de erros**: `{ data, error }` do Supabase tratados
✅ **Porta correta**: DATABASE_URL usa porta 6543 (Pooler)

## 🐛 Se der erro...

**Erro de conexão Supabase?**
- Verifique se a URL e ANON_KEY estão corretas no `.env.local`
- Execute o SQL para criar a tabela `todos`

**Erro de build?**
```bash
npm run db:generate
```

**Erro 500?**
- Confira se a senha no `DATABASE_URL` está correta
- Teste a conexão no painel do Supabase

## 📞 Deploy Vercel

1. Configure as mesmas variáveis de ambiente no painel da Vercel
2. Execute `npm run build` para testar
3. Deploy automático via Git

---
*Projeto migrado com sucesso de site estático para Next.js 14 + Supabase + Prisma*
