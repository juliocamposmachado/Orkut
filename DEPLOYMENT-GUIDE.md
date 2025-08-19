# 🚀 Orkut Retrô - Guia de Deploy e Manutenção

Este documento detalha todas as páginas estáticas e scripts criados para o projeto Orkut Retrô, incluindo instruções de uso e configuração.

## 📋 Sumário

1. [Páginas Estáticas](#-páginas-estáticas)
2. [Scripts de Deploy](#-scripts-de-deploy)
3. [Sistema de Persistência](#-sistema-de-persistência)
4. [Painel Administrativo](#-painel-administrativo)
5. [Scripts de Manutenção](#-scripts-de-manutenção)
6. [Como Usar](#-como-usar)

---

## 📄 Páginas Estáticas

### Páginas Institucionais Criadas

| Arquivo | Descrição | Funcionalidades |
|---------|-----------|-----------------|
| `termos.html` | Termos de Uso | Política legal, direitos e deveres dos usuários |
| `privacidade.html` | Política de Privacidade | LGPD compliance, como tratamos dados |
| `sobre.html` | Sobre o Projeto | História, tecnologias, roadmap |
| `contato.html` | Página de Contato | Formulário, FAQ, informações de suporte |
| `admin.html` | Painel Administrativo | Dashboard completo de administração |

### Características das Páginas

- ✅ **Design Consistente**: Seguem o padrão visual do Orkut Retrô
- ✅ **Responsivas**: Adaptam-se a diferentes tamanhos de tela
- ✅ **Acessibilidade**: Semântica HTML5 adequada
- ✅ **SEO Otimizado**: Meta tags e estrutura apropriadas
- ✅ **Navegação Intuitiva**: Links de volta e navegação clara

---

## 🚀 Scripts de Deploy

### Deploy Principal (`scripts/deploy.ps1`)

Script PowerShell completo para deploy automático.

#### Parâmetros

```powershell
# Ambientes disponíveis
-Environment development|staging|production

# Provedores suportados  
-Provider vercel|netlify|heroku|custom

# Opções
-Force          # Força deploy mesmo com avisos
-SkipTests      # Pula execução de testes
-SkipBuild      # Pula processo de build
-Verbose        # Output detalhado
```

#### Exemplos de Uso

```powershell
# Deploy básico para desenvolvimento
./scripts/deploy.ps1

# Deploy para produção na Vercel
./scripts/deploy.ps1 -Environment production -Provider vercel

# Deploy com validações rigorosas
./scripts/deploy.ps1 -Environment staging -Verbose

# Deploy forçado (pula validações)
./scripts/deploy.ps1 -Force -SkipTests
```

#### Funcionalidades

- 🔍 **Validação de Pré-requisitos**: Verifica Node.js, NPM, Git, CLIs
- 🧪 **Execução de Testes**: Roda testes antes do deploy
- 🏗️ **Build Automático**: Compila e otimiza o projeto
- 💾 **Sistema de Backup**: Backup automático antes do deploy
- 🌐 **Multi-Provider**: Suporte a Vercel, Netlify, Heroku
- 📊 **Relatórios Detalhados**: Log completo das operações
- ⚠️ **Rollback**: Backup disponível para reverter mudanças

---

## 💾 Sistema de Persistência

### Data Persistence Manager (`js/data-persistence.js`)

Sistema híbrido LocalStorage ↔ Supabase para sincronização inteligente.

#### Funcionalidades Principais

- 🔄 **Sincronização Offline-First**: Funciona sem internet
- 🗜️ **Compressão Automática**: Comprime dados grandes (>1KB)
- 📊 **Fila de Sincronização**: Queue com retry inteligente
- 🔒 **Backup Automático**: Backup diário dos dados
- ⚡ **Performance**: Cache local para acesso rápido
- 🛡️ **Segurança**: Validação e sanitização de dados

#### API Simples

```javascript
// Salvar dados
await saveData('user_profile', profileData);

// Carregar dados
const profile = await loadData('user_profile');

// Remover dados
await removeData('user_profile');

// Estatísticas
console.log(DataPersistence.getStats());

// Backup completo
const backup = await DataPersistence.createFullBackup();

// Restore
await DataPersistence.restoreFromBackup(backupData);
```

### Backup Script (`scripts/backup.ps1`)

Script automático para backup de banco de dados e arquivos.

#### Parâmetros

```powershell
# Tipos de backup
-BackupType full|incremental|database-only|files-only

# Configurações
-BackupPath "caminho/customizado"
-RetentionDays 30            # Dias para manter backups
-Compress                    # Comprimir backups
-UploadToCloud              # Upload para nuvem
-Verbose                    # Output detalhado
```

#### Exemplos

```powershell
# Backup completo
./scripts/backup.ps1 -BackupType full -Compress

# Backup apenas do banco
./scripts/backup.ps1 -BackupType database-only

# Backup com upload para nuvem
./scripts/backup.ps1 -UploadToCloud -Verbose
```

---

## 🛡️ Painel Administrativo

### Admin Dashboard (`admin.html`)

Interface web completa para administração do sistema.

#### Seções Principais

1. **📊 Dashboard**
   - Estatísticas em tempo real
   - Gráficos de atividade
   - Status do sistema

2. **👥 Gerenciamento de Usuários**
   - Lista de usuários
   - Filtros e busca
   - Ações: visualizar, editar, banir
   - Export de dados

3. **🏠 Comunidades**
   - Listagem de comunidades
   - Moderação de conteúdo
   - Estatísticas de engajamento

4. **📝 Moderação de Conteúdo**
   - Posts pendentes
   - Sistema de denúncias
   - Aprovação/rejeição

5. **🤖 Sistema de IA**
   - Configurações de IA
   - Monitoramento de operações
   - Fila de sincronização

6. **🔒 Segurança**
   - Alertas de segurança
   - IPs bloqueados
   - Tentativas de login

7. **📋 Sistema de Logs**
   - Logs em tempo real
   - Filtros por nível/fonte
   - Download de logs

8. **⚙️ Configurações**
   - Configurações gerais
   - Ações do sistema
   - Backup/restore

#### Funcionalidades

- ✅ **Interface Responsiva**: Funciona em desktop e mobile
- ✅ **Tempo Real**: Atualizações automáticas a cada 30s
- ✅ **Filtros Avançados**: Busca e filtros em todas as seções
- ✅ **Ações em Lote**: Operações em múltiplos registros
- ✅ **Segurança**: Controle de acesso por níveis
- ✅ **Relatórios**: Geração de relatórios automáticos

---

## 🔧 Scripts de Manutenção

### Maintenance Script (`scripts/maintenance.ps1`)

Sistema completo de manutenção e monitoramento.

#### Operações Disponíveis

```powershell
# Verificação de saúde
./scripts/maintenance.ps1 -Operation health-check

# Limpeza do sistema
./scripts/maintenance.ps1 -Operation cleanup

# Otimização
./scripts/maintenance.ps1 -Operation optimize

# Monitoramento
./scripts/maintenance.ps1 -Operation monitor

# Manutenção completa
./scripts/maintenance.ps1 -Operation full
```

#### Parâmetros

```powershell
-Operation cleanup|optimize|monitor|health-check|full
-Force                # Força operações sem confirmação
-Verbose              # Output detalhado
-AutoFix              # Tenta corrigir problemas automaticamente
-MaxLogAge 30         # Dias para manter logs
-MaxBackupAge 7       # Dias para manter backups
```

### Funcionalidades de Limpeza

- 🧹 **Logs Antigos**: Remove logs baseado em idade/tamanho
- 🗂️ **Arquivos Temporários**: Limpa cache e arquivos temp
- 💽 **Cache**: Limpa cache de sistema e aplicação
- 📦 **Backups Antigos**: Remove backups expirados
- 📚 **node_modules Órfãos**: Remove dependências desnecessárias

### Funcionalidades de Otimização

- 🗄️ **Banco de Dados**: VACUUM e ANALYZE do PostgreSQL
- 🖼️ **Imagens**: Detecta imagens grandes não otimizadas
- 📦 **Assets**: Verifica minificação de JS/CSS
- 🔍 **Dependências**: Verifica atualizações e vulnerabilidades
- 📊 **Performance**: Análise de uso de disco e recursos

### Monitoramento

- 🩺 **Health Check**: Verifica status de todos os serviços
- 📈 **Métricas**: Coleta métricas de sistema
- 🚨 **Alertas**: Sistema de alertas automáticos
- 📋 **Relatórios**: Geração de relatórios detalhados

---

## 🗃️ Scripts de Migração

### Database Migrations (`db/migrations.sql`)

Sistema completo de migração versionada para PostgreSQL.

#### Versões Implementadas

- **v1.0.0**: Schema inicial (usuários, posts, amizades)
- **v1.1.0**: Sistema de comunidades
- **v1.2.0**: Mensagens e scraps
- **v1.3.0**: Integração Spotify
- **v1.4.0**: Sistema de IA
- **v1.5.0**: Notificações
- **v1.6.0**: Logs interativo

#### Funcionalidades

- 🔄 **Versionamento**: Controle de versões automático
- 🛡️ **Segurança**: Verificações antes de aplicar
- 📊 **Índices**: Otimização de performance
- 👁️ **Views**: Views para relatórios
- ⚡ **Triggers**: Atualizações automáticas
- 🧹 **Limpeza**: Funções de manutenção
- 💾 **Backup**: Funções de backup integradas

#### Como Executar

```bash
# Conectar ao banco e executar
psql $DATABASE_URL -f db/migrations.sql

# Ou via script de manutenção
./scripts/maintenance.ps1 -Operation full
```

---

## 🚀 Como Usar

### 1. Configuração Inicial

```powershell
# 1. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# 2. Instalar dependências
npm install

# 3. Executar migrações
psql $DATABASE_URL -f db/migrations.sql

# 4. Verificar saúde do sistema
./scripts/maintenance.ps1 -Operation health-check
```

### 2. Deploy para Produção

```powershell
# Deploy completo para Vercel
./scripts/deploy.ps1 -Environment production -Provider vercel -Verbose

# Criar backup antes do deploy
./scripts/backup.ps1 -BackupType full -Compress

# Verificar após deploy
./scripts/maintenance.ps1 -Operation monitor
```

### 3. Manutenção Rotineira

```powershell
# Manutenção diária (automatizar via cron/task scheduler)
./scripts/maintenance.ps1 -Operation full -AutoFix

# Backup semanal
./scripts/backup.ps1 -BackupType full -Compress -UploadToCloud

# Monitoramento contínuo
./scripts/maintenance.ps1 -Operation monitor
```

### 4. Administração via Web

1. Acesse `admin.html` no navegador
2. Use as credenciais de administrador
3. Navegue pelas diferentes seções
4. Configure alertas e monitoramento

### 5. Persistência de Dados

```javascript
// No cliente (browser)
// Sistema funciona automaticamente

// Verificar status
console.log(DataPersistence.getStats());

// Criar backup manual
const backup = await DataPersistence.createFullBackup();

// Limpar dados (requer confirmação)
await DataPersistence.clearAllData('CLEAR_ALL_DATA');
```

---

## 📚 Scripts Disponíveis

| Script | Função | Uso |
|--------|--------|-----|
| `scripts/deploy.ps1` | Deploy automático | Deploy para produção |
| `scripts/backup.ps1` | Backup do sistema | Backup de dados e arquivos |
| `scripts/maintenance.ps1` | Manutenção completa | Limpeza, otimização, monitoramento |
| `js/data-persistence.js` | Persistência híbrida | Sincronização LocalStorage ↔ Supabase |
| `db/migrations.sql` | Migrações SQL | Atualizações de banco versionadas |

## 🔧 Configurações Recomendadas

### Produção

```powershell
# Variáveis de ambiente obrigatórias
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
SPOTIFY_CLIENT_ID=seu_client_id
GEMINI_API_KEY=sua_api_key
NODE_ENV=production

# Deploy
./scripts/deploy.ps1 -Environment production -Provider vercel

# Backup automático (agendar)
./scripts/backup.ps1 -BackupType full -Compress -UploadToCloud

# Manutenção automática (agendar diariamente)
./scripts/maintenance.ps1 -Operation full -AutoFix
```

### Desenvolvimento

```powershell
# Verificação rápida
./scripts/maintenance.ps1 -Operation health-check

# Deploy local
./scripts/deploy.ps1 -Environment development -SkipTests

# Limpeza rápida
./scripts/maintenance.ps1 -Operation cleanup -Verbose
```

---

## 🆘 Solução de Problemas

### Deploy Falha

1. Verificar pré-requisitos: `./scripts/maintenance.ps1 -Operation health-check`
2. Verificar variáveis de ambiente
3. Executar com `-Verbose` para detalhes
4. Usar backup para rollback se necessário

### Banco de Dados

1. Verificar conectividade: `psql $DATABASE_URL -c "SELECT 1;"`
2. Executar migrações: `psql $DATABASE_URL -f db/migrations.sql`
3. Otimizar: `./scripts/maintenance.ps1 -Operation optimize`

### Performance

1. Limpeza: `./scripts/maintenance.ps1 -Operation cleanup`
2. Verificar logs: Acessar `admin.html` → Logs
3. Monitorar: `./scripts/maintenance.ps1 -Operation monitor`

### Sincronização de Dados

1. Verificar status: `DataPersistence.getStats()`
2. Forçar sincronização: `DataPersistence.processSyncQueue()`
3. Backup manual: `DataPersistence.createFullBackup()`

---

## 🎯 Próximos Passos

1. **Automação**: Configurar cron jobs para manutenção automática
2. **Monitoramento**: Configurar alertas por email/SMS
3. **Scaling**: Configurar load balancer e CDN
4. **Analytics**: Implementar tracking avançado
5. **Testes**: Adicionar testes automatizados

---

## 📞 Suporte

Para dúvidas sobre os scripts e páginas criados:

- 📧 Email: suporte@orkutretro.com
- 📝 Issues: GitHub do projeto
- 📖 Documentação: Este guia e comentários no código

---

**✨ Todos os sistemas foram criados seguindo as melhores práticas de desenvolvimento, segurança e manutenibilidade. O Orkut Retrô está pronto para produção! 🚀**
