# Configuração Supabase SSL

## Passos para conectar com segurança no Supabase

### 1. Obter o certificado SSL
1. Acesse seu projeto no Supabase
2. Vá em Settings → Database
3. Role para baixo até "Connection parameters"
4. Baixe o certificado SSL (geralmente `prod-ca-2021.crt`)
5. Coloque o arquivo em `certs/prod-ca-2021.crt`

### 2. Configurar a string de conexão
Use uma das strings fornecidas, adicionando `?sslmode=require` no final:

```bash
# Conexão direta (recomendada para desenvolvimento)
DATABASE_URL="postgresql://postgres:julio78451200@db.ksskokjrdzqghhuahjpl.supabase.co:5432/postgres?sslmode=require"

# Conexão via pooler (recomendada para produção)
DATABASE_URL="postgresql://postgres.ksskokjrdzqghhuahjpl:julio78451200@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

### 3. Verificar IP na whitelist
1. No painel do Supabase, vá em Settings → Database
2. Verifique se seu IP está na seção "IP Address restrictions"
3. Para desenvolvimento, você pode temporariamente adicionar `0.0.0.0/0` (não recomendado para produção)

### 4. Testar a conexão

```bash
# Definir variáveis de ambiente
$env:DATABASE_URL="sua_string_de_conexao_aqui"
$env:PORT="3000"

# Executar setup do banco
node scripts/setup_db.js

# Se bem-sucedido, iniciar o servidor
node server/index.js

# Em outro terminal, testar as funcionalidades
node scripts/test_all.js
```

## Diagnóstico de problemas comuns

### Erro de autenticação
- ✅ Verificar se a senha está correta na string de conexão
- ✅ Confirmar que o usuário postgres tem permissões
- ✅ Verificar se o projeto Supabase está ativo

### Erro de SSL
- ✅ Confirmar que o certificado está em `certs/prod-ca-2021.crt`
- ✅ Verificar se `sslmode=require` está na string de conexão
- ✅ Tentar com `sslmode=prefer` se necessário

### Erro de conexão
- ✅ Verificar se o IP está na whitelist
- ✅ Tentar a conexão direta vs pooler
- ✅ Confirmar firewall/proxy não está bloqueando

## Logs do sistema
O sistema automaticamente detecta e usa o certificado SSL quando disponível:
- Com certificado: `rejectUnauthorized: true` + certificado customizado
- Sem certificado: `rejectUnauthorized: false` (fallback)

## Estrutura final esperada:
```
Orkut2025/
├── certs/
│   ├── README.md
│   └── prod-ca-2021.crt  ← SEU CERTIFICADO AQUI
├── server/
│   ├── routes/
│   │   ├── sync.js       ← SSL configurado
│   │   └── orky.js       ← SSL configurado
│   └── schema.sql
└── scripts/
    └── setup_db.js       ← SSL configurado
```
