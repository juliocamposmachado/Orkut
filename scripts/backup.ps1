# =========================================
# 💾 ORKUT RETRÔ - BACKUP SCRIPT
# =========================================
# Script de backup e manutenção de dados
# Backup automático de banco de dados e arquivos
# Data: 19 de Agosto de 2025
# =========================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("full", "incremental", "database-only", "files-only")]
    [string]$BackupType = "full",
    
    [Parameter(Mandatory=$false)]
    [string]$BackupPath = "backups",
    
    [Parameter(Mandatory=$false)]
    [int]$RetentionDays = 30,
    
    [Parameter(Mandatory=$false)]
    [switch]$Compress,
    
    [Parameter(Mandatory=$false)]
    [switch]$UploadToCloud,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# =========================================
# CONFIGURAÇÕES GLOBAIS
# =========================================

$script:CONFIG = @{
    ProjectName = "Orkut Retrô"
    Version = "2.1.0"
    DefaultBackupPath = "backups"
    MaxBackupSize = 5GB
    CompressionLevel = "Optimal"
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
    Write-ColorOutput "💾 $Title" $script:COLORS.Cyan
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
    return Get-Date -Format "yyyyMMdd_HHmmss"
}

function Get-FileSize {
    param([string]$Path)
    
    if (Test-Path $Path) {
        $size = (Get-Item $Path).Length
        return @{
            Bytes = $size
            KB = [math]::Round($size / 1KB, 2)
            MB = [math]::Round($size / 1MB, 2)
            GB = [math]::Round($size / 1GB, 2)
        }
    }
    return $null
}

function Test-DiskSpace {
    param([string]$Path, [long]$RequiredBytes)
    
    $drive = (Get-Item $Path).Root
    $freeSpace = (Get-WmiObject -Class Win32_LogicalDisk | Where-Object { $_.DeviceID -eq $drive.Name }).FreeSpace
    
    return $freeSpace -gt $RequiredBytes
}

# =========================================
# VALIDAÇÕES INICIAIS
# =========================================

function Test-Prerequisites {
    Write-Section "Validando Pré-requisitos"
    
    # Verificar se está no diretório correto
    if (-not (Test-Path "package.json")) {
        Write-Error "Execute este script no diretório raiz do projeto"
        exit 1
    }
    
    # Verificar espaço em disco
    if (-not (Test-DiskSpace (Get-Location) 1GB)) {
        Write-Warning "Pouco espaço em disco disponível"
    }
    
    # Verificar variáveis de ambiente
    if (-not $env:DATABASE_URL) {
        Write-Warning "DATABASE_URL não definida - backup de banco será ignorado"
    }
    
    Write-Success "Pré-requisitos validados"
}

function Initialize-BackupEnvironment {
    Write-Section "Inicializando Ambiente de Backup"
    
    # Criar diretório de backup se não existir
    if (-not (Test-Path $BackupPath)) {
        New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
        Write-Info "Diretório de backup criado: $BackupPath"
    }
    
    # Criar estrutura de diretórios
    $subDirs = @("database", "files", "logs", "compressed")
    foreach ($dir in $subDirs) {
        $fullPath = Join-Path $BackupPath $dir
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        }
    }
    
    Write-Success "Ambiente de backup inicializado"
}

# =========================================
# BACKUP DE BANCO DE DADOS
# =========================================

function Backup-Database {
    Write-Section "Backup do Banco de Dados"
    
    if (-not $env:DATABASE_URL) {
        Write-Warning "DATABASE_URL não definida - pulando backup de banco"
        return $null
    }
    
    try {
        $timestamp = Get-Timestamp
        $dbBackupFile = Join-Path $BackupPath "database\orkut_backup_$timestamp.sql"
        
        Write-Info "Criando backup do banco de dados..."
        
        # Extrair informações da URL do banco
        $dbInfo = Parse-DatabaseUrl $env:DATABASE_URL
        
        # Comando pg_dump para PostgreSQL
        $pgDumpCmd = "pg_dump"
        $pgDumpArgs = @(
            "--host=$($dbInfo.Host)",
            "--port=$($dbInfo.Port)",
            "--username=$($dbInfo.Username)",
            "--dbname=$($dbInfo.Database)",
            "--verbose",
            "--clean",
            "--no-owner",
            "--no-privileges",
            "--file=`"$dbBackupFile`""
        )
        
        # Configurar senha via variável de ambiente
        $env:PGPASSWORD = $dbInfo.Password
        
        # Executar backup
        $process = Start-Process -FilePath $pgDumpCmd -ArgumentList $pgDumpArgs -Wait -PassThru -NoNewWindow
        
        if ($process.ExitCode -eq 0) {
            $fileSize = Get-FileSize $dbBackupFile
            Write-Success "Backup do banco criado: $dbBackupFile ($($fileSize.MB) MB)"
            
            # Criar backup adicional com timestamp no nome
            $metadataFile = $dbBackupFile -replace "\.sql$", "_metadata.json"
            $metadata = @{
                timestamp = $timestamp
                database_url = $env:DATABASE_URL -replace "://[^@]+@", "://***:***@"  # Mascarar credenciais
                backup_type = $BackupType
                file_size = $fileSize
                tables_count = (Get-DatabaseTablesCount)
            } | ConvertTo-Json -Depth 3
            
            Set-Content -Path $metadataFile -Value $metadata
            
            return $dbBackupFile
        } else {
            throw "pg_dump falhou com código $($process.ExitCode)"
        }
        
    } catch {
        Write-Error "Erro no backup do banco: $($_.Exception.Message)"
        return $null
    } finally {
        # Limpar variável de senha
        Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    }
}

function Parse-DatabaseUrl {
    param([string]$DatabaseUrl)
    
    # Exemplo: postgresql://user:pass@host:port/database
    if ($DatabaseUrl -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
        return @{
            Username = $Matches[1]
            Password = $Matches[2]
            Host = $Matches[3]
            Port = $Matches[4]
            Database = $Matches[5]
        }
    }
    
    throw "URL do banco de dados inválida"
}

function Get-DatabaseTablesCount {
    try {
        # Implementar contagem de tabelas se necessário
        return "N/A"
    } catch {
        return "Error"
    }
}

# =========================================
# BACKUP DE ARQUIVOS
# =========================================

function Backup-Files {
    Write-Section "Backup de Arquivos"
    
    $timestamp = Get-Timestamp
    $filesBackupDir = Join-Path $BackupPath "files\orkut_files_$timestamp"
    
    try {
        New-Item -ItemType Directory -Path $filesBackupDir -Force | Out-Null
        
        # Lista de arquivos e diretórios importantes
        $importantPaths = @(
            "css",
            "js", 
            "api",
            "db",
            "docs",
            "*.html",
            "*.json",
            "*.md",
            ".env.example",
            "scripts"
        )
        
        $totalSize = 0
        $fileCount = 0
        
        foreach ($path in $importantPaths) {
            if ($path.Contains("*")) {
                # Arquivos com wildcard
                $files = Get-ChildItem -Path $path -ErrorAction SilentlyContinue
                foreach ($file in $files) {
                    $destPath = Join-Path $filesBackupDir $file.Name
                    Copy-Item $file.FullName $destPath -Force
                    $totalSize += $file.Length
                    $fileCount++
                    
                    if ($Verbose) {
                        Write-Info "Copiado: $($file.Name)"
                    }
                }
            } else {
                # Diretórios ou arquivos específicos
                if (Test-Path $path) {
                    $destPath = Join-Path $filesBackupDir (Split-Path $path -Leaf)
                    Copy-Item $path $destPath -Recurse -Force
                    
                    $pathSize = (Get-ChildItem $path -Recurse -File | Measure-Object -Property Length -Sum).Sum
                    $pathFileCount = (Get-ChildItem $path -Recurse -File).Count
                    
                    $totalSize += $pathSize
                    $fileCount += $pathFileCount
                    
                    if ($Verbose) {
                        Write-Info "Copiado diretório: $path ($pathFileCount arquivos)"
                    }
                }
            }
        }
        
        # Criar arquivo de manifesto
        $manifest = @{
            timestamp = $timestamp
            backup_type = $BackupType
            total_files = $fileCount
            total_size_bytes = $totalSize
            total_size_mb = [math]::Round($totalSize / 1MB, 2)
            paths_included = $importantPaths
        } | ConvertTo-Json -Depth 3
        
        $manifestFile = Join-Path $filesBackupDir "backup_manifest.json"
        Set-Content -Path $manifestFile -Value $manifest
        
        Write-Success "Backup de arquivos criado: $filesBackupDir"
        Write-Info "Total: $fileCount arquivos ($([math]::Round($totalSize / 1MB, 2)) MB)"
        
        return $filesBackupDir
        
    } catch {
        Write-Error "Erro no backup de arquivos: $($_.Exception.Message)"
        return $null
    }
}

# =========================================
# COMPRESSÃO
# =========================================

function Compress-Backup {
    param([string[]]$BackupPaths)
    
    if (-not $Compress -or $BackupPaths.Count -eq 0) {
        return $BackupPaths
    }
    
    Write-Section "Comprimindo Backups"
    
    $timestamp = Get-Timestamp
    $compressedDir = Join-Path $BackupPath "compressed"
    $compressedFiles = @()
    
    try {
        foreach ($backupPath in $BackupPaths) {
            if (-not (Test-Path $backupPath)) continue
            
            $backupName = Split-Path $backupPath -Leaf
            $compressedFile = Join-Path $compressedDir "$backupName`_$timestamp.zip"
            
            Write-Info "Comprimindo: $backupName"
            
            if (Test-Path $backupPath -PathType Container) {
                # Comprimir diretório
                Compress-Archive -Path "$backupPath\*" -DestinationPath $compressedFile -CompressionLevel $script:CONFIG.CompressionLevel
            } else {
                # Comprimir arquivo
                Compress-Archive -Path $backupPath -DestinationPath $compressedFile -CompressionLevel $script:CONFIG.CompressionLevel
            }
            
            if (Test-Path $compressedFile) {
                $originalSize = Get-FileSize $backupPath
                $compressedSize = Get-FileSize $compressedFile
                $compressionRatio = [math]::Round((1 - ($compressedSize.Bytes / $originalSize.Bytes)) * 100, 1)
                
                Write-Success "Comprimido: $compressedFile ($compressionRatio% redução)"
                $compressedFiles += $compressedFile
                
                # Remover arquivo/diretório original se compressão foi bem-sucedida
                if ($compressionRatio -gt 0) {
                    Remove-Item $backupPath -Recurse -Force
                    Write-Info "Arquivo original removido: $backupPath"
                }
            }
        }
        
        return $compressedFiles
        
    } catch {
        Write-Error "Erro na compressão: $($_.Exception.Message)"
        return $BackupPaths
    }
}

# =========================================
# UPLOAD PARA NUVEM
# =========================================

function Upload-ToCloud {
    param([string[]]$BackupFiles)
    
    if (-not $UploadToCloud -or $BackupFiles.Count -eq 0) {
        return
    }
    
    Write-Section "Upload para Nuvem"
    
    # Aqui você pode implementar upload para diferentes provedores
    # Exemplos: Azure Blob Storage, AWS S3, Google Cloud Storage
    
    try {
        foreach ($file in $BackupFiles) {
            if (-not (Test-Path $file)) continue
            
            Write-Info "Preparando upload: $(Split-Path $file -Leaf)"
            
            # Exemplo de upload (implementar conforme seu provedor)
            # Upload-ToAzureBlob -FilePath $file -ContainerName "orkut-backups"
            # Upload-ToS3 -FilePath $file -BucketName "orkut-backups"
            
            Write-Warning "Upload para nuvem não implementado. Configure seu provedor preferido."
        }
        
    } catch {
        Write-Error "Erro no upload: $($_.Exception.Message)"
    }
}

# =========================================
# LIMPEZA DE BACKUPS ANTIGOS
# =========================================

function Remove-OldBackups {
    Write-Section "Limpeza de Backups Antigos"
    
    try {
        $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
        $removed = 0
        $freedSpace = 0
        
        # Limpar backups antigos em todos os subdiretórios
        $backupSubDirs = @("database", "files", "compressed")
        
        foreach ($subDir in $backupSubDirs) {
            $dirPath = Join-Path $BackupPath $subDir
            if (-not (Test-Path $dirPath)) continue
            
            $oldFiles = Get-ChildItem $dirPath | Where-Object { $_.CreationTime -lt $cutoffDate }
            
            foreach ($file in $oldFiles) {
                $fileSize = $file.Length
                Remove-Item $file.FullName -Recurse -Force
                $removed++
                $freedSpace += $fileSize
                
                if ($Verbose) {
                    Write-Info "Removido: $($file.Name)"
                }
            }
        }
        
        if ($removed -gt 0) {
            $freedSpaceMB = [math]::Round($freedSpace / 1MB, 2)
            Write-Success "Limpeza concluída: $removed arquivo(s) removido(s) ($freedSpaceMB MB liberados)"
        } else {
            Write-Info "Nenhum backup antigo encontrado para remoção"
        }
        
    } catch {
        Write-Error "Erro na limpeza: $($_.Exception.Message)"
    }
}

# =========================================
# RELATÓRIO DE BACKUP
# =========================================

function New-BackupReport {
    param([string[]]$BackupFiles, [datetime]$StartTime)
    
    Write-Section "Relatório de Backup"
    
    $endTime = Get-Date
    $duration = $endTime - $StartTime
    
    $report = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        backup_type = $BackupType
        duration_minutes = [math]::Round($duration.TotalMinutes, 2)
        files_created = $BackupFiles.Count
        total_size_mb = 0
        status = "success"
        files = @()
    }
    
    foreach ($file in $BackupFiles) {
        if (Test-Path $file) {
            $fileSize = Get-FileSize $file
            $report.total_size_mb += $fileSize.MB
            $report.files += @{
                name = Split-Path $file -Leaf
                path = $file
                size_mb = $fileSize.MB
            }
        }
    }
    
    $report.total_size_mb = [math]::Round($report.total_size_mb, 2)
    
    # Salvar relatório
    $reportFile = Join-Path $BackupPath "logs\backup_report_$(Get-Timestamp).json"
    $report | ConvertTo-Json -Depth 4 | Set-Content $reportFile
    
    # Exibir resumo
    Write-ColorOutput ""
    Write-ColorOutput "📊 RESUMO DO BACKUP" $script:COLORS.Magenta
    Write-ColorOutput "==================" $script:COLORS.Magenta
    Write-Info "Tipo: $BackupType"
    Write-Info "Duração: $($report.duration_minutes) minutos"
    Write-Info "Arquivos criados: $($report.files_created)"
    Write-Info "Tamanho total: $($report.total_size_mb) MB"
    Write-Info "Relatório salvo: $reportFile"
    Write-ColorOutput ""
    
    return $reportFile
}

# =========================================
# FUNÇÃO PRINCIPAL
# =========================================

function Start-Backup {
    $startTime = Get-Date
    
    Write-ColorOutput ""
    Write-ColorOutput "🌟 =========================================== 🌟" $script:COLORS.Magenta
    Write-ColorOutput "💾      ORKUT RETRÔ - BACKUP SCRIPT       💾" $script:COLORS.Magenta
    Write-ColorOutput "🌟 =========================================== 🌟" $script:COLORS.Magenta
    Write-ColorOutput ""
    Write-Info "Iniciando backup tipo: $BackupType"
    Write-Info "Destino: $BackupPath"
    Write-ColorOutput ""
    
    try {
        # 1. Validar pré-requisitos
        Test-Prerequisites
        
        # 2. Inicializar ambiente
        Initialize-BackupEnvironment
        
        # 3. Executar backups baseado no tipo
        $backupFiles = @()
        
        switch ($BackupType) {
            "full" {
                Write-Info "Executando backup completo..."
                $dbBackup = Backup-Database
                $filesBackup = Backup-Files
                if ($dbBackup) { $backupFiles += $dbBackup }
                if ($filesBackup) { $backupFiles += $filesBackup }
            }
            "database-only" {
                Write-Info "Executando backup apenas do banco..."
                $dbBackup = Backup-Database
                if ($dbBackup) { $backupFiles += $dbBackup }
            }
            "files-only" {
                Write-Info "Executando backup apenas dos arquivos..."
                $filesBackup = Backup-Files
                if ($filesBackup) { $backupFiles += $filesBackup }
            }
            "incremental" {
                Write-Warning "Backup incremental não implementado. Executando backup completo..."
                $dbBackup = Backup-Database
                $filesBackup = Backup-Files
                if ($dbBackup) { $backupFiles += $dbBackup }
                if ($filesBackup) { $backupFiles += $filesBackup }
            }
        }
        
        # 4. Comprimir se solicitado
        if ($Compress) {
            $backupFiles = Compress-Backup $backupFiles
        }
        
        # 5. Upload para nuvem se solicitado
        if ($UploadToCloud) {
            Upload-ToCloud $backupFiles
        }
        
        # 6. Limpar backups antigos
        Remove-OldBackups
        
        # 7. Gerar relatório
        $reportFile = New-BackupReport $backupFiles $startTime
        
        Write-ColorOutput ""
        Write-ColorOutput "🎉 =========================================== 🎉" $script:COLORS.Green
        Write-ColorOutput "✅      BACKUP CONCLUÍDO COM SUCESSO!     ✅" $script:COLORS.Green
        Write-ColorOutput "🎉 =========================================== 🎉" $script:COLORS.Green
        Write-ColorOutput ""
        
    } catch {
        Write-ColorOutput ""
        Write-ColorOutput "💥 =========================================== 💥" $script:COLORS.Red
        Write-ColorOutput "❌         BACKUP FALHOU!                 ❌" $script:COLORS.Red
        Write-ColorOutput "💥 =========================================== 💥" $script:COLORS.Red
        Write-Error "Erro durante o backup: $($_.Exception.Message)"
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

# Iniciar o backup
Start-Backup
