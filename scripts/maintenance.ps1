# =========================================
# 🔧 ORKUT RETRÔ - MAINTENANCE SCRIPT
# =========================================
# Scripts de manutenção e otimização
# Limpeza, monitoramento e otimização do sistema
# Data: 19 de Agosto de 2025
# =========================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("cleanup", "optimize", "monitor", "health-check", "full")]
    [string]$Operation = "health-check",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose,
    
    [Parameter(Mandatory=$false)]
    [switch]$AutoFix,
    
    [Parameter(Mandatory=$false)]
    [int]$MaxLogAge = 30,
    
    [Parameter(Mandatory=$false)]
    [int]$MaxBackupAge = 7
)

# =========================================
# CONFIGURAÇÕES GLOBAIS
# =========================================

$script:CONFIG = @{
    ProjectName = "Orkut Retrô"
    Version = "2.1.0"
    LogPath = "logs"
    TempPath = "temp"
    BackupPath = "backups"
    CachePath = "cache"
    MaxLogSize = 100MB
    MaxTempAge = 24  # horas
}

$script:COLORS = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Magenta = "Magenta"
    Cyan = "Cyan"
}

$script:HEALTH_STATUS = @{
    Healthy = 0
    Warning = 1
    Critical = 2
    Unknown = 3
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
    Write-ColorOutput "🔧 $Title" $script:COLORS.Cyan
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

function Get-Timestamp {
    return Get-Date -Format "yyyy-MM-dd HH:mm:ss"
}

function Get-DirectorySize {
    param([string]$Path)
    
    if (Test-Path $Path) {
        $size = (Get-ChildItem $Path -Recurse -File | Measure-Object -Property Length -Sum).Sum
        return @{
            Bytes = $size
            MB = [math]::Round($size / 1MB, 2)
            GB = [math]::Round($size / 1GB, 2)
        }
    }
    return @{ Bytes = 0; MB = 0; GB = 0 }
}

function Test-ServiceHealth {
    param([string]$ServiceName, [string]$TestCommand)
    
    try {
        $result = Invoke-Expression $TestCommand
        if ($LASTEXITCODE -eq 0) {
            return @{ Status = $script:HEALTH_STATUS.Healthy; Message = "$ServiceName está funcionando" }
        } else {
            return @{ Status = $script:HEALTH_STATUS.Critical; Message = "$ServiceName falhou no teste" }
        }
    } catch {
        return @{ Status = $script:HEALTH_STATUS.Unknown; Message = "$ServiceName não pôde ser testado: $($_.Exception.Message)" }
    }
}

# =========================================
# LIMPEZA DO SISTEMA
# =========================================

function Invoke-SystemCleanup {
    Write-Section "Limpeza do Sistema"
    
    $cleanupReport = @{
        StartTime = Get-Date
        FilesRemoved = 0
        SpaceFreed = 0
        Operations = @()
    }
    
    try {
        # 1. Limpar logs antigos
        $logCleanup = Remove-OldLogs
        $cleanupReport.Operations += $logCleanup
        $cleanupReport.FilesRemoved += $logCleanup.FilesRemoved
        $cleanupReport.SpaceFreed += $logCleanup.SpaceFreed
        
        # 2. Limpar arquivos temporários
        $tempCleanup = Remove-TempFiles
        $cleanupReport.Operations += $tempCleanup
        $cleanupReport.FilesRemoved += $tempCleanup.FilesRemoved
        $cleanupReport.SpaceFreed += $tempCleanup.SpaceFreed
        
        # 3. Limpar cache antigo
        $cacheCleanup = Clear-SystemCache
        $cleanupReport.Operations += $cacheCleanup
        $cleanupReport.FilesRemoved += $cacheCleanup.FilesRemoved
        $cleanupReport.SpaceFreed += $cacheCleanup.SpaceFreed
        
        # 4. Limpar backups antigos
        $backupCleanup = Remove-OldBackups
        $cleanupReport.Operations += $backupCleanup
        $cleanupReport.FilesRemoved += $backupCleanup.FilesRemoved
        $cleanupReport.SpaceFreed += $backupCleanup.SpaceFreed
        
        # 5. Limpar node_modules desnecessários
        $nodeCleanup = Clean-NodeModules
        $cleanupReport.Operations += $nodeCleanup
        
        $cleanupReport.EndTime = Get-Date
        $cleanupReport.Duration = $cleanupReport.EndTime - $cleanupReport.StartTime
        
        Write-Success "Limpeza concluída!"
        Write-Info "Arquivos removidos: $($cleanupReport.FilesRemoved)"
        Write-Info "Espaço liberado: $([math]::Round($cleanupReport.SpaceFreed / 1MB, 2)) MB"
        Write-Info "Duração: $($cleanupReport.Duration.TotalMinutes.ToString('F2')) minutos"
        
        return $cleanupReport
        
    } catch {
        Write-Error "Erro durante a limpeza: $($_.Exception.Message)"
        return $cleanupReport
    }
}

function Remove-OldLogs {
    Write-Info "Limpando logs antigos..."
    
    $operation = @{
        Name = "Log Cleanup"
        FilesRemoved = 0
        SpaceFreed = 0
        Details = @()
    }
    
    if (Test-Path $script:CONFIG.LogPath) {
        $cutoffDate = (Get-Date).AddDays(-$MaxLogAge)
        $oldLogs = Get-ChildItem $script:CONFIG.LogPath -File | Where-Object { $_.CreationTime -lt $cutoffDate }
        
        foreach ($log in $oldLogs) {
            $operation.SpaceFreed += $log.Length
            $operation.FilesRemoved++
            $operation.Details += "Removido: $($log.Name)"
            
            if ($Verbose) {
                Write-Info "Removendo log: $($log.Name)"
            }
            
            Remove-Item $log.FullName -Force
        }
        
        # Limpar logs muito grandes
        $largeLogs = Get-ChildItem $script:CONFIG.LogPath -File | Where-Object { $_.Length -gt $script:CONFIG.MaxLogSize }
        foreach ($log in $largeLogs) {
            $operation.Details += "Log truncado: $($log.Name)"
            
            # Manter apenas as últimas 1000 linhas
            $content = Get-Content $log.FullName | Select-Object -Last 1000
            Set-Content $log.FullName -Value $content
            
            if ($Verbose) {
                Write-Info "Log truncado: $($log.Name)"
            }
        }
        
        Write-Success "Logs limpos: $($operation.FilesRemoved) arquivos, $([math]::Round($operation.SpaceFreed / 1MB, 2)) MB"
    }
    
    return $operation
}

function Remove-TempFiles {
    Write-Info "Limpando arquivos temporários..."
    
    $operation = @{
        Name = "Temp Cleanup"
        FilesRemoved = 0
        SpaceFreed = 0
        Details = @()
    }
    
    $tempPaths = @(
        $script:CONFIG.TempPath,
        $env:TEMP,
        "node_modules/.cache",
        ".vercel",
        ".next",
        "dist/temp"
    )
    
    foreach ($tempPath in $tempPaths) {
        if (Test-Path $tempPath) {
            $cutoffDate = (Get-Date).AddHours(-$script:CONFIG.MaxTempAge)
            $tempFiles = Get-ChildItem $tempPath -Recurse -File -ErrorAction SilentlyContinue | 
                        Where-Object { $_.CreationTime -lt $cutoffDate }
            
            foreach ($file in $tempFiles) {
                try {
                    $operation.SpaceFreed += $file.Length
                    $operation.FilesRemoved++
                    Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue
                    
                    if ($Verbose) {
                        Write-Info "Temp removido: $($file.Name)"
                    }
                } catch {
                    $operation.Details += "Erro ao remover: $($file.Name)"
                }
            }
        }
    }
    
    Write-Success "Arquivos temporários limpos: $($operation.FilesRemoved) arquivos, $([math]::Round($operation.SpaceFreed / 1MB, 2)) MB"
    return $operation
}

function Clear-SystemCache {
    Write-Info "Limpando cache do sistema..."
    
    $operation = @{
        Name = "Cache Cleanup"
        FilesRemoved = 0
        SpaceFreed = 0
        Details = @()
    }
    
    $cachePaths = @(
        $script:CONFIG.CachePath,
        "cache",
        ".cache",
        "public/cache"
    )
    
    foreach ($cachePath in $cachePaths) {
        if (Test-Path $cachePath) {
            $cacheFiles = Get-ChildItem $cachePath -Recurse -File -ErrorAction SilentlyContinue
            
            foreach ($file in $cacheFiles) {
                try {
                    $operation.SpaceFreed += $file.Length
                    $operation.FilesRemoved++
                    Remove-Item $file.FullName -Force
                    
                    if ($Verbose) {
                        Write-Info "Cache removido: $($file.Name)"
                    }
                } catch {
                    $operation.Details += "Erro ao limpar cache: $($file.Name)"
                }
            }
        }
    }
    
    Write-Success "Cache limpo: $($operation.FilesRemoved) arquivos, $([math]::Round($operation.SpaceFreed / 1MB, 2)) MB"
    return $operation
}

function Remove-OldBackups {
    Write-Info "Limpando backups antigos..."
    
    $operation = @{
        Name = "Backup Cleanup"
        FilesRemoved = 0
        SpaceFreed = 0
        Details = @()
    }
    
    if (Test-Path $script:CONFIG.BackupPath) {
        $cutoffDate = (Get-Date).AddDays(-$MaxBackupAge)
        $oldBackups = Get-ChildItem $script:CONFIG.BackupPath -Recurse | Where-Object { $_.CreationTime -lt $cutoffDate }
        
        foreach ($backup in $oldBackups) {
            try {
                if ($backup.PSIsContainer) {
                    $size = (Get-ChildItem $backup.FullName -Recurse -File | Measure-Object -Property Length -Sum).Sum
                } else {
                    $size = $backup.Length
                }
                
                $operation.SpaceFreed += $size
                $operation.FilesRemoved++
                Remove-Item $backup.FullName -Recurse -Force
                
                $operation.Details += "Backup removido: $($backup.Name)"
                
                if ($Verbose) {
                    Write-Info "Backup removido: $($backup.Name)"
                }
            } catch {
                $operation.Details += "Erro ao remover backup: $($backup.Name)"
            }
        }
        
        Write-Success "Backups antigos limpos: $($operation.FilesRemoved) itens, $([math]::Round($operation.SpaceFreed / 1MB, 2)) MB"
    }
    
    return $operation
}

function Clean-NodeModules {
    Write-Info "Verificando node_modules desnecessários..."
    
    $operation = @{
        Name = "Node Modules Cleanup"
        FilesRemoved = 0
        SpaceFreed = 0
        Details = @()
    }
    
    # Procurar por node_modules órfãos
    $nodeModulesPaths = Get-ChildItem -Path . -Recurse -Directory -Name "node_modules" -ErrorAction SilentlyContinue
    
    foreach ($path in $nodeModulesPaths) {
        $parentDir = Split-Path $path -Parent
        $packageJsonPath = Join-Path $parentDir "package.json"
        
        # Se não tem package.json no diretório pai, pode ser órfão
        if (-not (Test-Path $packageJsonPath)) {
            $operation.Details += "Node_modules órfão encontrado: $path"
            
            if ($AutoFix) {
                try {
                    $size = Get-DirectorySize $path
                    $operation.SpaceFreed += $size.Bytes
                    $operation.FilesRemoved++
                    
                    Remove-Item $path -Recurse -Force
                    $operation.Details += "Removido: $path"
                    
                    if ($Verbose) {
                        Write-Info "Removido node_modules órfão: $path"
                    }
                } catch {
                    $operation.Details += "Erro ao remover: $path"
                }
            }
        }
    }
    
    if ($operation.FilesRemoved -gt 0) {
        Write-Success "Node_modules limpos: $($operation.FilesRemoved) diretórios, $([math]::Round($operation.SpaceFreed / 1MB, 2)) MB"
    } else {
        Write-Info "Nenhum node_modules órfão encontrado"
    }
    
    return $operation
}

# =========================================
# OTIMIZAÇÃO DO SISTEMA
# =========================================

function Invoke-SystemOptimization {
    Write-Section "Otimização do Sistema"
    
    try {
        # 1. Otimizar banco de dados
        Optimize-Database
        
        # 2. Otimizar imagens
        Optimize-Images
        
        # 3. Minificar arquivos
        Optimize-Assets
        
        # 4. Verificar dependências
        Check-Dependencies
        
        # 5. Analisar performance
        Analyze-Performance
        
        Write-Success "Otimização concluída!"
        
    } catch {
        Write-Error "Erro durante otimização: $($_.Exception.Message)"
    }
}

function Optimize-Database {
    Write-Info "Otimizando banco de dados..."
    
    if ($env:DATABASE_URL) {
        try {
            # VACUUM e ANALYZE para PostgreSQL
            $optimizeCmd = "psql `"$env:DATABASE_URL`" -c `"VACUUM ANALYZE;`""
            $result = Invoke-Expression $optimizeCmd
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Banco de dados otimizado"
            } else {
                Write-Warning "Otimização do banco falhou"
            }
        } catch {
            Write-Warning "Erro na otimização do banco: $($_.Exception.Message)"
        }
    } else {
        Write-Info "DATABASE_URL não definida - pulando otimização do banco"
    }
}

function Optimize-Images {
    Write-Info "Verificando otimização de imagens..."
    
    $imageExtensions = @("*.jpg", "*.jpeg", "*.png", "*.gif", "*.webp")
    $largeImages = @()
    
    foreach ($ext in $imageExtensions) {
        $images = Get-ChildItem -Path . -Recurse -Include $ext -ErrorAction SilentlyContinue | 
                  Where-Object { $_.Length -gt 1MB }
        $largeImages += $images
    }
    
    if ($largeImages.Count -gt 0) {
        Write-Warning "Encontradas $($largeImages.Count) imagens grandes (>1MB)"
        
        foreach ($image in $largeImages | Select-Object -First 5) {
            $sizeMB = [math]::Round($image.Length / 1MB, 2)
            Write-Info "- $($image.Name): ${sizeMB}MB"
        }
        
        Write-Info "💡 Considere otimizar essas imagens com ferramentas como ImageOptim ou TinyPNG"
    } else {
        Write-Success "Nenhuma imagem grande encontrada"
    }
}

function Optimize-Assets {
    Write-Info "Verificando minificação de assets..."
    
    $jsFiles = Get-ChildItem -Path "js" -Filter "*.js" -ErrorAction SilentlyContinue | 
               Where-Object { -not $_.Name.Contains(".min.") }
    
    $cssFiles = Get-ChildItem -Path "css" -Filter "*.css" -ErrorAction SilentlyContinue | 
                Where-Object { -not $_.Name.Contains(".min.") }
    
    if ($jsFiles.Count -gt 0 -or $cssFiles.Count -gt 0) {
        Write-Info "Encontrados arquivos não minificados:"
        Write-Info "- JavaScript: $($jsFiles.Count) arquivos"
        Write-Info "- CSS: $($cssFiles.Count) arquivos"
        Write-Info "💡 Execute 'npm run build' para minificar os assets"
    } else {
        Write-Success "Assets otimizados"
    }
}

function Check-Dependencies {
    Write-Info "Verificando dependências..."
    
    if (Test-Path "package.json") {
        try {
            # Verificar dependências desatualizadas
            $outdatedCmd = "npm outdated --json"
            $result = Invoke-Expression $outdatedCmd
            
            if ($result) {
                $outdated = $result | ConvertFrom-Json
                if ($outdated.PSObject.Properties.Count -gt 0) {
                    Write-Warning "Dependências desatualizadas encontradas:"
                    $outdated.PSObject.Properties | ForEach-Object {
                        Write-Info "- $($_.Name): $($_.Value.current) → $($_.Value.latest)"
                    }
                    Write-Info "💡 Execute 'npm update' para atualizar"
                } else {
                    Write-Success "Todas as dependências estão atualizadas"
                }
            }
            
            # Verificar vulnerabilidades
            $auditCmd = "npm audit --json"
            $auditResult = Invoke-Expression $auditCmd
            
            if ($auditResult) {
                $audit = $auditResult | ConvertFrom-Json
                if ($audit.metadata.vulnerabilities.total -gt 0) {
                    Write-Warning "Vulnerabilidades encontradas:"
                    Write-Info "- Total: $($audit.metadata.vulnerabilities.total)"
                    Write-Info "- Críticas: $($audit.metadata.vulnerabilities.critical)"
                    Write-Info "- Altas: $($audit.metadata.vulnerabilities.high)"
                    Write-Info "💡 Execute 'npm audit fix' para corrigir"
                } else {
                    Write-Success "Nenhuma vulnerabilidade encontrada"
                }
            }
            
        } catch {
            Write-Warning "Erro ao verificar dependências: $($_.Exception.Message)"
        }
    } else {
        Write-Info "package.json não encontrado - pulando verificação de dependências"
    }
}

function Analyze-Performance {
    Write-Info "Analisando performance do sistema..."
    
    $performance = @{
        DiskUsage = Get-DirectorySize "."
        LogSize = Get-DirectorySize $script:CONFIG.LogPath
        BackupSize = Get-DirectorySize $script:CONFIG.BackupPath
        NodeModulesSize = Get-DirectorySize "node_modules"
    }
    
    Write-Info "Uso de disco:"
    Write-Info "- Total do projeto: $($performance.DiskUsage.MB) MB"
    Write-Info "- Logs: $($performance.LogSize.MB) MB"
    Write-Info "- Backups: $($performance.BackupSize.MB) MB"
    Write-Info "- node_modules: $($performance.NodeModulesSize.MB) MB"
    
    # Verificar uso excessivo
    if ($performance.LogSize.MB -gt 100) {
        Write-Warning "Logs ocupando muito espaço - considere limpeza"
    }
    
    if ($performance.BackupSize.GB -gt 1) {
        Write-Warning "Backups ocupando muito espaço - considere limpeza"
    }
}

# =========================================
# MONITORAMENTO DO SISTEMA
# =========================================

function Invoke-SystemMonitoring {
    Write-Section "Monitoramento do Sistema"
    
    $monitoringReport = @{
        Timestamp = Get-Date
        Services = @()
        Metrics = @()
        Alerts = @()
    }
    
    try {
        # 1. Verificar serviços
        $services = Test-SystemServices
        $monitoringReport.Services = $services
        
        # 2. Coletar métricas
        $metrics = Collect-SystemMetrics
        $monitoringReport.Metrics = $metrics
        
        # 3. Verificar alertas
        $alerts = Check-SystemAlerts $services $metrics
        $monitoringReport.Alerts = $alerts
        
        # 4. Gerar relatório
        Generate-MonitoringReport $monitoringReport
        
        return $monitoringReport
        
    } catch {
        Write-Error "Erro durante monitoramento: $($_.Exception.Message)"
        return $monitoringReport
    }
}

function Test-SystemServices {
    Write-Info "Testando serviços do sistema..."
    
    $services = @()
    
    # Teste de conectividade de banco
    if ($env:DATABASE_URL) {
        $dbTest = Test-ServiceHealth "Database" "psql `"$env:DATABASE_URL`" -c `"SELECT 1;`""
        $services += @{
            Name = "PostgreSQL Database"
            Status = $dbTest.Status
            Message = $dbTest.Message
            LastCheck = Get-Date
        }
    }
    
    # Teste de Node.js
    $nodeTest = Test-ServiceHealth "Node.js" "node --version"
    $services += @{
        Name = "Node.js Runtime"
        Status = $nodeTest.Status
        Message = $nodeTest.Message
        LastCheck = Get-Date
    }
    
    # Teste de NPM
    $npmTest = Test-ServiceHealth "NPM" "npm --version"
    $services += @{
        Name = "NPM Package Manager"
        Status = $npmTest.Status
        Message = $npmTest.Message
        LastCheck = Get-Date
    }
    
    # Teste de Git
    $gitTest = Test-ServiceHealth "Git" "git --version"
    $services += @{
        Name = "Git Version Control"
        Status = $gitTest.Status
        Message = $gitTest.Message
        LastCheck = Get-Date
    }
    
    # Exibir resultados
    foreach ($service in $services) {
        $statusText = switch ($service.Status) {
            $script:HEALTH_STATUS.Healthy { "✅ Saudável" }
            $script:HEALTH_STATUS.Warning { "⚠️  Aviso" }
            $script:HEALTH_STATUS.Critical { "❌ Crítico" }
            $script:HEALTH_STATUS.Unknown { "❓ Desconhecido" }
        }
        
        Write-ColorOutput "$($service.Name): $statusText - $($service.Message)" $(
            switch ($service.Status) {
                $script:HEALTH_STATUS.Healthy { $script:COLORS.Green }
                $script:HEALTH_STATUS.Warning { $script:COLORS.Yellow }
                $script:HEALTH_STATUS.Critical { $script:COLORS.Red }
                default { $script:COLORS.Blue }
            }
        )
    }
    
    return $services
}

function Collect-SystemMetrics {
    Write-Info "Coletando métricas do sistema..."
    
    $metrics = @{
        DiskUsage = Get-DirectorySize "."
        MemoryUsage = Get-Process -Name "node" -ErrorAction SilentlyContinue | Measure-Object -Property WorkingSet -Sum
        FileCount = (Get-ChildItem -Recurse -File | Measure-Object).Count
        LogLevel = @{
            Errors = (Get-Content "$($script:CONFIG.LogPath)/*.log" -ErrorAction SilentlyContinue | Select-String "ERROR" | Measure-Object).Count
            Warnings = (Get-Content "$($script:CONFIG.LogPath)/*.log" -ErrorAction SilentlyContinue | Select-String "WARNING" -Measure-Object).Count
        }
        LastBackup = if (Test-Path $script:CONFIG.BackupPath) { 
            (Get-ChildItem $script:CONFIG.BackupPath | Sort-Object CreationTime -Descending | Select-Object -First 1).CreationTime 
        } else { 
            $null 
        }
    }
    
    Write-Info "Métricas coletadas:"
    Write-Info "- Uso de disco: $($metrics.DiskUsage.MB) MB"
    Write-Info "- Número de arquivos: $($metrics.FileCount)"
    if ($metrics.MemoryUsage.Sum -gt 0) {
        Write-Info "- Uso de memória Node.js: $([math]::Round($metrics.MemoryUsage.Sum / 1MB, 2)) MB"
    }
    Write-Info "- Erros nos logs: $($metrics.LogLevel.Errors)"
    Write-Info "- Avisos nos logs: $($metrics.LogLevel.Warnings)"
    if ($metrics.LastBackup) {
        Write-Info "- Último backup: $($metrics.LastBackup.ToString('yyyy-MM-dd HH:mm:ss'))"
    }
    
    return $metrics
}

function Check-SystemAlerts {
    param($Services, $Metrics)
    
    Write-Info "Verificando alertas do sistema..."
    
    $alerts = @()
    
    # Alertas de serviços críticos
    foreach ($service in $Services) {
        if ($service.Status -eq $script:HEALTH_STATUS.Critical) {
            $alerts += @{
                Level = "Critical"
                Type = "Service"
                Message = "$($service.Name) está falhando: $($service.Message)"
                Timestamp = Get-Date
            }
        }
    }
    
    # Alertas de uso de disco
    if ($Metrics.DiskUsage.GB -gt 5) {
        $alerts += @{
            Level = "Warning"
            Type = "Disk"
            Message = "Projeto ocupando muito espaço: $($Metrics.DiskUsage.GB) GB"
            Timestamp = Get-Date
        }
    }
    
    # Alertas de logs com erro
    if ($Metrics.LogLevel.Errors -gt 10) {
        $alerts += @{
            Level = "Warning"
            Type = "Logs"
            Message = "Muitos erros nos logs: $($Metrics.LogLevel.Errors) erros encontrados"
            Timestamp = Get-Date
        }
    }
    
    # Alertas de backup desatualizado
    if ($Metrics.LastBackup -and $Metrics.LastBackup -lt (Get-Date).AddDays(-7)) {
        $alerts += @{
            Level = "Warning"
            Type = "Backup"
            Message = "Backup desatualizado - último backup: $($Metrics.LastBackup.ToString('yyyy-MM-dd'))"
            Timestamp = Get-Date
        }
    }
    
    # Exibir alertas
    if ($alerts.Count -gt 0) {
        Write-Warning "Alertas encontrados:"
        foreach ($alert in $alerts) {
            $icon = if ($alert.Level -eq "Critical") { "🚨" } else { "⚠️" }
            Write-ColorOutput "$icon [$($alert.Level)] $($alert.Message)" $(
                if ($alert.Level -eq "Critical") { $script:COLORS.Red } else { $script:COLORS.Yellow }
            )
        }
    } else {
        Write-Success "Nenhum alerta encontrado"
    }
    
    return $alerts
}

function Generate-MonitoringReport {
    param($Report)
    
    Write-Info "Gerando relatório de monitoramento..."
    
    $reportContent = @"
========================================
RELATÓRIO DE MONITORAMENTO - ORKUT RETRÔ
========================================
Data: $($Report.Timestamp.ToString('yyyy-MM-dd HH:mm:ss'))

SERVIÇOS:
"@

    foreach ($service in $Report.Services) {
        $status = switch ($service.Status) {
            $script:HEALTH_STATUS.Healthy { "OK" }
            $script:HEALTH_STATUS.Warning { "WARNING" }
            $script:HEALTH_STATUS.Critical { "CRITICAL" }
            $script:HEALTH_STATUS.Unknown { "UNKNOWN" }
        }
        $reportContent += "`n- $($service.Name): $status - $($service.Message)"
    }
    
    $reportContent += "`n`nMÉTRICAS:"
    $reportContent += "`n- Uso de disco: $($Report.Metrics.DiskUsage.MB) MB"
    $reportContent += "`n- Número de arquivos: $($Report.Metrics.FileCount)"
    $reportContent += "`n- Erros nos logs: $($Report.Metrics.LogLevel.Errors)"
    $reportContent += "`n- Avisos nos logs: $($Report.Metrics.LogLevel.Warnings)"
    
    if ($Report.Alerts.Count -gt 0) {
        $reportContent += "`n`nALERTAS:"
        foreach ($alert in $Report.Alerts) {
            $reportContent += "`n- [$($alert.Level)] $($alert.Message)"
        }
    } else {
        $reportContent += "`n`nALERTAS: Nenhum alerta ativo"
    }
    
    # Salvar relatório
    $reportFile = "monitoring_report_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
    $reportPath = Join-Path $script:CONFIG.LogPath $reportFile
    
    if (-not (Test-Path $script:CONFIG.LogPath)) {
        New-Item -ItemType Directory -Path $script:CONFIG.LogPath -Force | Out-Null
    }
    
    Set-Content -Path $reportPath -Value $reportContent
    Write-Success "Relatório salvo em: $reportPath"
}

# =========================================
# VERIFICAÇÃO DE SAÚDE
# =========================================

function Invoke-HealthCheck {
    Write-Section "Verificação de Saúde do Sistema"
    
    try {
        # Status geral
        $overallHealth = $script:HEALTH_STATUS.Healthy
        $issues = @()
        
        # 1. Verificar estrutura de arquivos
        $requiredFiles = @("package.json", "index.html")
        foreach ($file in $requiredFiles) {
            if (-not (Test-Path $file)) {
                $issues += "Arquivo obrigatório não encontrado: $file"
                $overallHealth = [math]::Max($overallHealth, $script:HEALTH_STATUS.Critical)
            }
        }
        
        # 2. Verificar dependências
        if (Test-Path "package.json") {
            if (-not (Test-Path "node_modules")) {
                $issues += "node_modules não encontrado - execute 'npm install'"
                $overallHealth = [math]::Max($overallHealth, $script:HEALTH_STATUS.Warning)
            }
        }
        
        # 3. Verificar configuração
        if (-not $env:DATABASE_URL) {
            $issues += "DATABASE_URL não configurada"
            $overallHealth = [math]::Max($overallHealth, $script:HEALTH_STATUS.Warning)
        }
        
        # 4. Verificar logs de erro recentes
        if (Test-Path $script:CONFIG.LogPath) {
            $recentErrors = Get-ChildItem "$($script:CONFIG.LogPath)/*.log" -ErrorAction SilentlyContinue |
                           ForEach-Object { Get-Content $_.FullName | Select-String "ERROR" } |
                           Where-Object { $_.Line -match (Get-Date).ToString('yyyy-MM-dd') }
            
            if ($recentErrors.Count -gt 5) {
                $issues += "Muitos erros recentes nos logs: $($recentErrors.Count)"
                $overallHealth = [math]::Max($overallHealth, $script:HEALTH_STATUS.Warning)
            }
        }
        
        # 5. Verificar espaço em disco
        $diskUsage = Get-DirectorySize "."
        if ($diskUsage.GB -gt 10) {
            $issues += "Projeto muito grande: $($diskUsage.GB) GB"
            $overallHealth = [math]::Max($overallHealth, $script:HEALTH_STATUS.Warning)
        }
        
        # Resultado final
        $healthText = switch ($overallHealth) {
            $script:HEALTH_STATUS.Healthy { "✅ SAUDÁVEL" }
            $script:HEALTH_STATUS.Warning { "⚠️  COM AVISOS" }
            $script:HEALTH_STATUS.Critical { "❌ CRÍTICO" }
            default { "❓ DESCONHECIDO" }
        }
        
        Write-ColorOutput "Status geral do sistema: $healthText" $(
            switch ($overallHealth) {
                $script:HEALTH_STATUS.Healthy { $script:COLORS.Green }
                $script:HEALTH_STATUS.Warning { $script:COLORS.Yellow }
                $script:HEALTH_STATUS.Critical { $script:COLORS.Red }
                default { $script:COLORS.Blue }
            }
        )
        
        if ($issues.Count -gt 0) {
            Write-Warning "Problemas encontrados:"
            foreach ($issue in $issues) {
                Write-Info "- $issue"
            }
            
            if ($AutoFix) {
                Write-Info "Tentando corrigir problemas automaticamente..."
                # Implementar correções automáticas aqui
            }
        } else {
            Write-Success "Nenhum problema encontrado!"
        }
        
        return $overallHealth
        
    } catch {
        Write-Error "Erro durante verificação de saúde: $($_.Exception.Message)"
        return $script:HEALTH_STATUS.Unknown
    }
}

# =========================================
# FUNÇÃO PRINCIPAL
# =========================================

function Start-Maintenance {
    Write-ColorOutput ""
    Write-ColorOutput "🌟 =========================================== 🌟" $script:COLORS.Magenta
    Write-ColorOutput "🔧      ORKUT RETRÔ - MAINTENANCE SCRIPT   🔧" $script:COLORS.Magenta
    Write-ColorOutput "🌟 =========================================== 🌟" $script:COLORS.Magenta
    Write-ColorOutput ""
    Write-Info "Iniciando operação: $Operation"
    Write-Info "Versão: $($script:CONFIG.Version)"
    Write-ColorOutput ""
    
    try {
        switch ($Operation) {
            "cleanup" {
                Invoke-SystemCleanup
            }
            "optimize" {
                Invoke-SystemOptimization
            }
            "monitor" {
                Invoke-SystemMonitoring
            }
            "health-check" {
                Invoke-HealthCheck
            }
            "full" {
                Write-Info "Executando manutenção completa..."
                Invoke-HealthCheck
                Invoke-SystemCleanup
                Invoke-SystemOptimization
                Invoke-SystemMonitoring
            }
        }
        
        Write-ColorOutput ""
        Write-ColorOutput "🎉 =========================================== 🎉" $script:COLORS.Green
        Write-ColorOutput "✅      MANUTENÇÃO CONCLUÍDA COM SUCESSO! ✅" $script:COLORS.Green
        Write-ColorOutput "🎉 =========================================== 🎉" $script:COLORS.Green
        Write-ColorOutput ""
        
    } catch {
        Write-ColorOutput ""
        Write-ColorOutput "💥 =========================================== 💥" $script:COLORS.Red
        Write-ColorOutput "❌         MANUTENÇÃO FALHOU!             ❌" $script:COLORS.Red
        Write-ColorOutput "💥 =========================================== 💥" $script:COLORS.Red
        Write-Error "Erro durante a manutenção: $($_.Exception.Message)"
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

# Iniciar a manutenção
Start-Maintenance
