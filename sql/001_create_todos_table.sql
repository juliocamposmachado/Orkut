-- Criação da tabela todos
-- Execute este script no SQL Editor do Supabase Dashboard

create table if not exists public.todos (
  id serial primary key,
  title text not null,
  created_at timestamptz default now()
);

-- Habilitar Row Level Security (RLS)
alter table public.todos enable row level security;

-- Política para permitir leitura para usuários autenticados e anônimos
create policy "Todos are viewable by everyone"
  on public.todos for select
  to public
  using (true);

-- Política para permitir inserção para usuários autenticados e anônimos  
create policy "Todos can be created by everyone"
  on public.todos for insert
  to public
  with check (true);

-- Política para permitir atualização para usuários autenticados e anônimos
create policy "Todos can be updated by everyone"
  on public.todos for update
  to public
  using (true);

-- Política para permitir exclusão para usuários autenticados e anônimos
create policy "Todos can be deleted by everyone"
  on public.todos for delete
  to public
  using (true);
