-- Inserir dados de exemplo na tabela todos
-- Execute este script após criar a tabela todos

insert into public.todos (title) values
  ('Configurar projeto Orkut Retrô'),
  ('Integrar com Supabase'),
  ('Implementar autenticação'),
  ('Criar sistema de scraps'),
  ('Adicionar comunidades'),
  ('Implementar depoimentos');

-- Verificar se os dados foram inseridos corretamente
select * from public.todos order by created_at desc;
