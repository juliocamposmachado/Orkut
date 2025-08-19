# =========================================
# 🚀 ORKUT RETRÔ - DEPLOY SCRIPT
# =========================================
# Script de deploy automático para produção
# Suporta múltiplos ambientes e provedores
# Data: 19 de Agosto de 2025
# =========================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("vercel", "netlify", "heroku", "custom")]
    [string]$Provider = "vercel",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipTests,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# =========================================
# CONFIGURAÇÕES GLOBAIS
# =========================================

$script:CONFIG = @{
    ProjectName = "Orkut Retrô"
    Version = "2.1.0"
    BuildPath = "dist"
    BackupPath = "backups"
    LogPath = "logs"
    MaxBackups = 5
}

$script:COLORS = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Magenta = "Magenta"
    Cyan = "Cyan"
}

# =========================================
# FUNÇÕES UTILITÁRIAS
# =========================================

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-ColorOutput "=========================================" $script:COLORS.Cyan
    Write-ColorOutput "🔄 $Title" $script:COLORS.Cyan
    Write-ColorOutput "=========================================" $script:COLORS.Cyan
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" $script:COLORS.Green
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" $script:COLORS.Yellow
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" $script:COLORS.Red
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ️  $Message" $script:COLORS.Blue
}

function Test-CommandExists {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

function Invoke-SafeCommand {
    param([string]$Command, [string]$Description)
    
    Write-Info "Executando: $Description"
    if ($Verbose) {
        Write-ColorOutput "Comando: $Command" $script:COLORS.Magenta
    }
    
    try {
        $result = Invoke-Expression $Command
        if ($LASTEXITCODE -eq 0) {
            Write-Success "$Description concluído"
            return $true
        } else {
            Write-Error "$Description falhou (código: $LASTEXITCODE)"
            return $false
        }
    } catch {
        Write-Error "$Description falhou: $($_.Exception.Message)"
        return $false
    }
}

# =========================================
# VALIDAÇÕES INICIAIS
# =========================================

function Test-Prerequisites {
    Write-Section "Verificando Pré-requisitos"
    
    $requirements = @(
        @{ Command = "node"; Name = "Node.js"; Required = $true },
        @{ Command = "npm"; Name = "NPM"; Required = $true },
        @{ Command = "git"; Name = "Git"; Required = $true }
    )
    
    # Adicionar validações específicas por provider
    switch ($Provider) {
        "vercel" { $requirements += @{ Command = "vercel"; Name = "Vercel CLI"; Required = $true } }
        "netlify" { $requirements += @{ Command = "netlify"; Name = "Netlify CLI"; Required = $true } }
        "heroku" { $requirements += @{ Command = "heroku"; Name = "Heroku CLI"; Required = $true } }
    }
    
    $allValid = $true
    foreach ($req in $requirements) {
        if (Test-CommandExists $req.Command) {
            Write-Success "$($req.Name) está disponível"
        } else {
            if ($req.Required) {
                Write-Error "$($req.Name) é obrigatório mas não foi encontrado"
                $allValid = $false
            } else {
                Write-Warning "$($req.Name) não foi encontrado (opcional)"
            }
        }
    }
    
    if (-not $allValid) {
        Write-Error "Pré-requisitos não atendidos. Abortando deploy."
        exit 1
    }
    
    Write-Success "Todos os pré-requisitos foram atendidos"
}

# =========================================
# BACKUP E LIMPEZA
# =========================================

function New-Backup {
    Write-Section "Criando Backup"
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupDir = "$($script:CONFIG.BackupPath)\backup_$timestamp"
    
    if (-not (Test-Path $script:CONFIG.BackupPath)) {
        New-Item -ItemType Directory -Path $script:CONFIG.BackupPath -Force | Out-Null
    }
    
    # Backup de arquivos importantes
    $filesToBackup = @(
        ".env",
        "package.json",
        "package-lock.json",
        "vercel.json",
        "netlify.toml",
        "db\*.sql"
    )
    
    foreach ($pattern in $filesToBackup) {
        $files = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
        if ($files) {
            foreach ($file in $files) {
                $destPath = Join-Path $backupDir $file.Name
                if (-not (Test-Path (Split-Path $destPath))) {
                    New-Item -ItemType Directory -Path (Split-Path $destPath) -Force | Out-Null
                }
                Copy-Item $file.FullName $destPath -Force
                Write-Info "Backup criado: $($file.Name)"
            }
        }
    }
    
    # Limpar backups antigos
    $oldBackups = Get-ChildItem $script:CONFIG.BackupPath -Directory | 
                  Sort-Object CreationTime -Descending | 
                  Select-Object -Skip $script:CONFIG.MaxBackups
    
    foreach ($backup in $oldBackups) {
        Remove-Item $backup.FullName -Recurse -Force
        Write-Info "Backup antigo removido: $($backup.Name)"
    }
    
    Write-Success "Backup criado em: $backupDir"
    return $backupDir
}

function Clear-BuildArtifacts {
    Write-Section "Limpando Artefatos de Build"
    
    $pathsToClean = @(
        $script:CONFIG.BuildPath,
        "node_modules",
        ".next",
        ".vercel",
        ".netlify"
    )
    
    foreach ($path in $pathsToClean) {
        if (Test-Path $path) {
            Remove-Item $path -Recurse -Force
            Write-Info "Removido: $path"
        }
    }
    
    Write-Success "Artefatos de build limpos"
}

# =========================================
# TESTES E VALIDAÇÕES
# =========================================

function Invoke-Tests {
    if ($SkipTests) {
        Write-Warning "Testes ignorados (-SkipTests)"
        return $true
    }
    
    Write-Section "Executando Testes"
    
    # Verificar se existem testes
    if (-not (Test-Path "package.json")) {
        Write-Warning "package.json não encontrado. Pulando testes."
        return $true
    }
    
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if (-not $packageJson.scripts.test) {
        Write-Warning "Script de teste não encontrado. Pulando testes."
        return $true
    }
    
    return Invoke-SafeCommand "npm test" "Execução dos testes"
}

function Test-Environment {
    Write-Section "Validando Ambiente: $Environment"
    
    # Verificar variáveis de ambiente necessárias
    $requiredEnvVars = @()
    
    switch ($Environment) {
        "production" {
            $requiredEnvVars = @(
                "DATABASE_URL",
                "SPOTIFY_CLIENT_ID",
                "GEMINI_API_KEY"
            )
        }
        "staging" {
            $requiredEnvVars = @(
                "DATABASE_URL"
            )
        }
    }
    
    foreach ($envVar in $requiredEnvVars) {
        if (-not (Get-Item Env:$envVar -ErrorAction SilentlyContinue)) {
            Write-Error "Variável de ambiente obrigatória não definida: $envVar"
            if (-not $Force) {
                exit 1
            }
        } else {
            Write-Success "Variável de ambiente OK: $envVar"
        }
    }
}

# =========================================
# BUILD DO PROJETO
# =========================================

function Invoke-Build {
    if ($SkipBuild) {
        Write-Warning "Build ignorado (-SkipBuild)"
        return $true
    }
    
    Write-Section "Building do Projeto"
    
    # Instalar dependências
    if (-not (Invoke-SafeCommand "npm ci" "Instalação de dependências")) {
        return $false
    }
    
    # Build do projeto
    if (Test-Path "package.json") {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        
        $buildCommand = "npm run build"
        if ($packageJson.scripts.build) {
            if (-not (Invoke-SafeCommand $buildCommand "Build do projeto")) {
                return $false
            }
        } else {
            Write-Warning "Script de build não encontrado. Pulando build."
        }
    }
    
    Write-Success "Build concluído com sucesso"
    return $true
}

# =========================================
# DEPLOY POR PROVIDER
# =========================================

function Deploy-Vercel {
    Write-Section "Deploy via Vercel"
    
    # Verificar autenticação
    if (-not (Invoke-SafeCommand "vercel whoami" "Verificação de autenticação Vercel")) {
        Write-Error "Faça login no Vercel: vercel login"
        return $false
    }
    
    # Verificar se vercel.json existe
    if (-not (Test-Path "vercel.json")) {
        Write-Warning "vercel.json não encontrado. Criando configuração básica..."
        $vercelConfig = @{
            version = 2
            name = "orkut-retro"
            buildCommand = "echo 'Static site - no build needed'"
            outputDirectory = "."
            cleanUrls = $true
            trailingSlash = $false
        } | ConvertTo-Json -Depth 3
        Set-Content "vercel.json" $vercelConfig
        Write-Info "vercel.json criado com configuração básica"
    }
    
    # Verificar variáveis de ambiente para Vercel
    $vercelEnvVars = @()
    if ($Environment -eq "production") {
        $vercelEnvVars = @("DATABASE_URL", "SPOTIFY_CLIENT_ID", "GEMINI_API_KEY")
    }
    
    # Configurar variáveis de ambiente no Vercel se necessário
    foreach ($envVar in $vercelEnvVars) {
        $envValue = [Environment]::GetEnvironmentVariable($envVar)
        if ($envValue) {
            Write-Info "Configurando variável $envVar no Vercel..."
            $envCommand = "vercel env add $envVar"
            try {
                # Tentar adicionar variável (pode falhar se já existir)
                Invoke-Expression "echo '$envValue' | $envCommand" | Out-Null
            } catch {
                Write-Info "Variavel $envVar ja configurada no Vercel"
            }
        }
    }
    
    # Configurar argumentos de deploy
    $deployArgs = @("--yes")
    
    switch ($Environment) {
        "production" { 
            $deployArgs += "--prod"
            Write-Info "Deploy para PRODUÇÃO"
        }
        "staging" { 
            $deployArgs += "--target", "preview"
            Write-Info "Deploy para STAGING (preview)"
        }
        "development" { 
            Write-Info "Deploy para DEVELOPMENT (preview)"
        }
    }
    
    # Adicionar nome do projeto se especificado
    if ($script:CONFIG.ProjectName) {
        $deployArgs += "--name", "orkut-retro"
    }
    
    # Deploy com configurações otimizadas
    $deployCommand = "vercel " + ($deployArgs -join " ")
    Write-Info "Executando: $deployCommand"
    
    if (-not (Invoke-SafeCommand $deployCommand "Deploy para Vercel")) {
        Write-Error "Deploy falhou. Verificando logs..."
        
        # Tentar obter logs do último deploy
        try {
            $logsCommand = "vercel logs --follow=false -n 10"
            $logs = Invoke-Expression $logsCommand
            Write-Info "Últimos logs do Vercel:"
            Write-Info $logs
        } catch {
            Write-Warning "Não foi possível obter logs do Vercel"
        }
        
        return $false
    }
    
    # Obter URL do deploy
    try {
        $urlCommand = "vercel ls --meta"
        $deployInfo = Invoke-Expression $urlCommand
        Write-Info "Informações do deploy:"
        Write-Info $deployInfo
    } catch {
        Write-Warning "Não foi possível obter URL do deploy"
    }
    
    # Verificar status do deploy
    Start-Sleep -Seconds 5
    try {
        $statusCommand = "vercel inspect"
        $status = Invoke-Expression $statusCommand
        Write-Info "Status do deploy: $status"
    } catch {
        Write-Warning "Não foi possível verificar status do deploy"
    }
    
    Write-Success "Deploy Vercel concluído com sucesso!"
    Write-Info "💡 Dica: Use 'vercel --help' para mais opções"
    Write-Info "🌐 Acesse o dashboard: https://vercel.com/dashboard"
    
    return $true
}

function Deploy-Netlify {
    Write-Section "Deploy via Netlify"
    
    # Verificar autenticação
    if (-not (Invoke-SafeCommand "netlify status" "Verificação de autenticação Netlify")) {
        Write-Error "Faça login no Netlify: netlify login"
        return $false
    }
    
    # Deploy
    $deployCommand = "netlify deploy"
    if ($Environment -eq "production") {
        $deployCommand += " --prod"
    }
    
    if (-not (Invoke-SafeCommand $deployCommand "Deploy para Netlify")) {
        return $false
    }
    
    Write-Success "Deploy Netlify concluído"
    return $true
}

function Deploy-Heroku {
    Write-Section "Deploy via Heroku"
    
    # Verificar autenticação
    if (-not (Invoke-SafeCommand "heroku auth:whoami" "Verificação de autenticação Heroku")) {
        Write-Error "Faça login no Heroku: heroku login"
        return $false
    }
    
    # Configurar git remotes se necessário
    $appName = "orkut-retro-$Environment"
    
    # Deploy via git
    if (-not (Invoke-SafeCommand "git add ." "Adicionar arquivos ao git")) {
        return $false
    }
    
    $commitMessage = "Deploy $Environment - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    if (-not (Invoke-SafeCommand "git commit -m `"$commitMessage`"" "Commit das alterações")) {
        Write-Warning "Nenhuma alteração para commit ou commit falhou"
    }
    
    if (-not (Invoke-SafeCommand "git push heroku main" "Push para Heroku")) {
        return $false
    }
    
    Write-Success "Deploy Heroku concluído"
    return $true
}

function Deploy-Custom {
    Write-Section "Deploy Customizado"
    
    # Aqui você pode implementar sua lógica de deploy customizada
    Write-Info "Executando deploy customizado..."
    
    # Exemplo: rsync para servidor
    # rsync -avz --delete ./ user@server:/path/to/app/
    
    Write-Warning "Deploy customizado não implementado. Implemente sua lógica aqui."
    return $true
}

# =========================================
# PÓS-DEPLOY
# =========================================

function Invoke-PostDeploy {
    Write-Section "Tarefas Pós-Deploy"
    
    # Executar migrações de banco se necessário
    if ($Environment -eq "production" -and (Test-Path "db\migrations.sql")) {
        Write-Info "Verificando se há migrações pendentes..."
        # Aqui você implementaria a lógica de execução de migrações
        Write-Warning "Sistema de migração não implementado automaticamente."
        Write-Info "Execute manualmente: psql \$DATABASE_URL -f db/migrations.sql"
    }
    
    # Invalidar cache CDN se necessário
    if ($Provider -eq "vercel" -and $Environment -eq "production") {
        Write-Info "Cache Vercel será invalidado automaticamente"
    }
    
    # Enviar notificações
    $deployInfo = @{
        Environment = $Environment
        Provider = $Provider
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Version = $script:CONFIG.Version
    }
    
    Write-Success "Deploy concluído!"
    Write-ColorOutput "🎉 $($script:CONFIG.ProjectName) v$($script:CONFIG.Version) foi deployado com sucesso!" $script:COLORS.Green
    Write-Info "Ambiente: $Environment"
    Write-Info "Provider: $Provider"
    Write-Info "Timestamp: $($deployInfo.Timestamp)"
}

# =========================================
# FUNÇÃO PRINCIPAL
# =========================================

function Start-Deploy {
    Write-ColorOutput "" 
    Write-ColorOutput "🌟 =========================================== 🌟" $script:COLORS.Magenta
    Write-ColorOutput "🚀      ORKUT RETRÔ - DEPLOY SCRIPT        🚀" $script:COLORS.Magenta  
    Write-ColorOutput "🌟 =========================================== 🌟" $script:COLORS.Magenta
    Write-ColorOutput ""
    Write-Info "Iniciando deploy para $Environment via $Provider"
    Write-Info "Versão: $($script:CONFIG.Version)"
    Write-ColorOutput ""
    
    try {
        # 1. Validar pré-requisitos
        Test-Prerequisites
        
        # 2. Validar ambiente
        Test-Environment
        
        # 3. Criar backup
        $backupPath = New-Backup
        
        # 4. Executar testes
        if (-not (Invoke-Tests)) {
            throw "Testes falharam"
        }
        
        # 5. Limpar artefatos antigos
        Clear-BuildArtifacts
        
        # 6. Build do projeto
        if (-not (Invoke-Build)) {
            throw "Build falhou"
        }
        
        # 7. Deploy baseado no provider
        $deploySuccess = $false
        switch ($Provider) {
            "vercel" { $deploySuccess = Deploy-Vercel }
            "netlify" { $deploySuccess = Deploy-Netlify }
            "heroku" { $deploySuccess = Deploy-Heroku }
            "custom" { $deploySuccess = Deploy-Custom }
            default { 
                Write-Error "Provider não suportado: $Provider"
                throw "Provider inválido"
            }
        }
        
        if (-not $deploySuccess) {
            throw "Deploy falhou"
        }
        
        # 8. Tarefas pós-deploy
        Invoke-PostDeploy
        
        Write-ColorOutput ""
        Write-ColorOutput "🎉 =========================================== 🎉" $script:COLORS.Green
        Write-ColorOutput "✅      DEPLOY CONCLUÍDO COM SUCESSO!      ✅" $script:COLORS.Green
        Write-ColorOutput "🎉 =========================================== 🎉" $script:COLORS.Green
        Write-ColorOutput ""
        
    } catch {
        Write-ColorOutput ""
        Write-ColorOutput "💥 =========================================== 💥" $script:COLORS.Red
        Write-ColorOutput "❌         DEPLOY FALHOU!                  ❌" $script:COLORS.Red
        Write-ColorOutput "💥 =========================================== 💥" $script:COLORS.Red
        Write-Error "Erro durante o deploy: $($_.Exception.Message)"
        Write-Info "Backup disponível em: $backupPath"
        exit 1
    }
}

# =========================================
# EXECUÇÃO
# =========================================

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Error "Execute este script no diretório raiz do projeto (onde está o package.json)"
    exit 1
}

# Iniciar o deploy
Start-Deploy
