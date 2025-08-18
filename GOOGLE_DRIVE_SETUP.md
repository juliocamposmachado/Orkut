# Configuração do Google Drive API para Backup

Este guia explica como configurar a integração com Google Drive para fazer backup automático do banco de dados.

## 📋 Pré-requisitos

- Conta Google ativa
- Acesso ao Google Cloud Console

## 🔧 Passo a Passo

### 1. Criar Projeto no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Clique em "Novo Projeto" ou selecione um existente
3. Nomeie seu projeto (ex: "orkut-retro-backup")
4. Anote o **Project ID** que será gerado

### 2. Ativar a Google Drive API

1. No menu lateral, vá em **APIs e Serviços > Biblioteca**
2. Pesquise por "Google Drive API"
3. Clique em "Google Drive API"
4. Clique em **"ATIVAR"**

### 3. Criar Conta de Serviço

1. Vá em **APIs e Serviços > Credenciais**
2. Clique em **"+ CRIAR CREDENCIAIS"**
3. Selecione **"Conta de serviço"**
4. Preencha os dados:
   - **Nome**: orkut-backup-service
   - **ID**: orkut-backup-service (gerado automaticamente)
   - **Descrição**: Conta de serviço para backup do Orkut Retrô
5. Clique em **"CRIAR E CONTINUAR"**

### 4. Configurar Permissões

1. Na seção **"Conceder acesso à conta de serviço"**, adicione o papel:
   - **Função**: Editor (ou Administrador de dados do Drive)
2. Clique em **"CONTINUAR"**
3. Clique em **"CONCLUÍDO"**

### 5. Gerar Chave JSON

1. Na lista de contas de serviço, encontre a que você criou
2. Clique nos 3 pontos (...) e selecione **"Gerenciar chaves"**
3. Clique em **"ADICIONAR CHAVE"** > **"Criar nova chave"**
4. Selecione **"JSON"**
5. Clique em **"CRIAR"**
6. O arquivo JSON será baixado automaticamente
7. **⚠️ IMPORTANTE**: Guarde este arquivo em local seguro!

### 6. Configurar Pasta no Google Drive

1. Acesse [Google Drive](https://drive.google.com)
2. Crie uma nova pasta chamada "Orkut Backup" (ou o nome que preferir)
3. Clique com o botão direito na pasta e selecione **"Compartilhar"**
4. Compartilhe a pasta com o email da conta de serviço:
   - O email está no arquivo JSON baixado, no campo `client_email`
   - Ex: `orkut-backup-service@seu-projeto.iam.gserviceaccount.com`
5. Dê permissão de **"Editor"**
6. Copie o **ID da pasta** da URL:
   - URL: `https://drive.google.com/drive/folders/1ABC123XYZ789`
   - ID: `1ABC123XYZ789`

## 🔑 Configurar Variáveis de Ambiente

### Para Desenvolvimento Local

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e adicione:
   ```env
   # ID da pasta no Google Drive
   GOOGLE_DRIVE_FOLDER_ID=1ABC123XYZ789
   
   # Conteúdo completo do arquivo JSON das credenciais
   GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"seu-projeto","private_key_id":"..."}
   ```

### Para Produção (Vercel)

1. Acesse o painel do Vercel
2. Vá em **Settings > Environment Variables**
3. Adicione as variáveis:

   **GOOGLE_DRIVE_FOLDER_ID**
   ```
   1ABC123XYZ789
   ```

   **GOOGLE_SERVICE_ACCOUNT_KEY**
   ```json
   {"type":"service_account","project_id":"seu-projeto","private_key_id":"123","private_key":"-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n","client_email":"orkut-backup-service@seu-projeto.iam.gserviceaccount.com","client_id":"123","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/orkut-backup-service%40seu-projeto.iam.gserviceaccount.com"}
   ```

   ⚠️ **Importante**: Cole o JSON inteiro em uma única linha, sem quebras de linha.

## 🧪 Testar a Configuração

### Teste Local

1. Execute o projeto localmente:
   ```bash
   npm run dev
   ```

2. Teste o endpoint de backup:
   ```bash
   curl -X POST http://localhost:3000/api/backup?action=create
   ```

3. Verifique se apareceu um arquivo na pasta do Google Drive

### Teste em Produção

1. Acesse sua aplicação no Vercel
2. Vá para: `https://seu-app.vercel.app/api/backup?action=create`
3. Verifique o backup na pasta do Google Drive

## 📝 Estrutura do Arquivo JSON

O arquivo de credenciais deve ter esta estrutura:

```json
{
  "type": "service_account",
  "project_id": "seu-projeto-123",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "orkut-backup-service@seu-projeto.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## 🔐 Segurança

### ✅ Boas Práticas

- **Nunca** commite o arquivo JSON no Git
- Use variáveis de ambiente para credenciais
- Restrinja as permissões da conta de serviço
- Monitore o uso da API no Google Cloud Console

### 🚫 Não Fazer

- Não compartilhe as credenciais publicamente
- Não use contas pessoais para automação
- Não dê permissões excessivas à conta de serviço

## 📊 Monitoramento

### Google Cloud Console

1. Acesse **APIs e Serviços > Dashboard**
2. Monitore o uso da Google Drive API
3. Configure alertas para uso excessivo

### Logs da Aplicação

Os backups são logados no console:
```
Backup criado: /data/backup_orkut_1234567890.db
Backup enviado para Google Drive: orkut_backup_2025-01-20_1234567890.db (ID: abc123)
```

## 🔄 Backup Automático

O sistema faz backup automático diariamente. Para configurar:

### Vercel Cron (Recomendado)

1. Crie o arquivo `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/backup?action=auto",
      "schedule": "0 3 * * *"
    }
  ]
}
```

2. Isso executará backup diário às 3h da manhã (UTC)

### GitHub Actions (Alternativa)

```yaml
name: Backup Diário
on:
  schedule:
    - cron: '0 3 * * *'
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Executar Backup
        run: curl -X POST ${{ secrets.APP_URL }}/api/backup?action=auto
```

## 🆘 Solução de Problemas

### Erro: "Forbidden"
- Verifique se a pasta foi compartilhada com a conta de serviço
- Confirme o email da conta de serviço no arquivo JSON

### Erro: "Invalid credentials"
- Verifique se o JSON está formatado corretamente
- Confirme se todas as variáveis de ambiente estão definidas

### Erro: "Folder not found"
- Verifique o ID da pasta no Google Drive
- Confirme se a pasta não foi excluída

### Backup não aparece no Drive
- Verifique os logs da aplicação
- Confirme as permissões da pasta
- Teste manualmente o endpoint

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do Vercel/aplicação
2. Teste as credenciais manualmente
3. Confirme as permissões no Google Drive
4. Consulte a [documentação da Google Drive API](https://developers.google.com/drive/api/v3/about-sdk)

---

**Configuração concluída!** 🎉

Agora seu sistema fará backup automático do banco de dados para o Google Drive todos os dias.
