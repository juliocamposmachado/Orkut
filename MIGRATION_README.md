# 🔄 Migração para PostgreSQL (Supabase)

Este guia explica como migrar seu Orkut Retrô de SQLite para PostgreSQL usando Supabase.

## ✅ O que foi configurado

1. **Arquivo .env**: Criado com suas credenciais do Supabase
2. **database.js**: Atualizado para usar PostgreSQL em vez de SQLite
3. **package.json**: Adicionada dependência `pg` para PostgreSQL
4. **Script de migração**: Criado em `scripts/migrate-to-postgres.js`

## 🚀 Passos para completar a migração

### 1. Instalar dependências
```bash
npm install
```

### 2. Testar conexão com Supabase
O arquivo `.env` já está configurado com sua string de conexão:
```
DATABASE_URL=postgresql://postgres.ksskokjrdzqghhuahjpl:julio78451200@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
```

### 3. Executar a migração (opcional)
Se você já tem dados no SQLite, execute:
```bash
node scripts/migrate-to-postgres.js
```

### 4. Verificar se funciona
Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 🔧 URLs de conexão disponíveis

Você forneceu 3 URLs diferentes. A configuração atual usa a versão pooled na porta 6543:

1. **Atual (recomendada)**: `postgresql://postgres.ksskokjrdzqghhuahjpl:julio78451200@aws-1-sa-east-1.pooler.supabase.com:6543/postgres`
2. **Direta**: `postgresql://postgres:julio78451200@db.ksskokjrdzqghhuahjpl.supabase.co:5432/postgres`
3. **Pooled 5432**: `postgresql://postgres.ksskokjrdzqghhuahjpl:julio78451200@aws-1-sa-east-1.pooler.supabase.com:5432/postgres`

Se tiver problemas de conexão, você pode trocar no arquivo `.env`.

## 📋 Principais mudanças

### Tipos de dados
- **SQLite**: `TEXT`, `INTEGER`, `DATETIME`, `BOOLEAN` (0/1)
- **PostgreSQL**: `VARCHAR`, `UUID`, `TIMESTAMP`, `BOOLEAN` (true/false)

### IDs únicos
- Agora usa UUIDs em vez de strings simples
- Geração automática via `uuid_generate_v4()`

### Queries
- Parâmetros agora usam `$1, $2, $3` em vez de `?`
- Timestamps usam `CURRENT_TIMESTAMP` do PostgreSQL

## 🚨 Importante

1. **Backup**: O SQLite original não será removido automaticamente
2. **Teste**: Verifique se todas as funcionalidades funcionam antes de remover o SQLite
3. **Performance**: PostgreSQL oferece melhor performance para múltiplos usuários
4. **Escalabilidade**: Supabase permite escalar conforme necessário

## 🛠️ Troubleshooting

### Erro de conexão
```
Erro ao conectar com o banco de dados
```
**Solução**: Verifique se as credenciais no `.env` estão corretas

### Erro de SSL
```
SSL connection required
```
**Solução**: A configuração já inclui SSL para produção

### Tabelas não encontradas
```
relation "users" does not exist
```
**Solução**: As tabelas são criadas automaticamente na primeira execução

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs no console
2. Confirme as credenciais do Supabase
3. Teste as URLs de conexão alternativas

Boa sorte com a migração! 🎉
