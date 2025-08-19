# Deploy Script para Orkut Retrô 2025
# Script para deploy manual no Vercel

Write-Host "🚀 Iniciando deploy do Orkut Retrô 2025..." -ForegroundColor Green

# Verificar se o Vercel CLI está instalado
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI detectado: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI não encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g vercel
}

# Verificar mudanças pendentes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Há mudanças não commitadas:" -ForegroundColor Yellow
    git status --short
    
    $response = Read-Host "Deseja continuar mesmo assim? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "❌ Deploy cancelado." -ForegroundColor Red
        exit 1
    }
}

# Verificar se está na branch master
$currentBranch = git branch --show-current
if ($currentBranch -ne "master") {
    Write-Host "⚠️  Você não está na branch master (atual: $currentBranch)" -ForegroundColor Yellow
    $response = Read-Host "Deseja continuar? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "❌ Deploy cancelado." -ForegroundColor Red
        exit 1
    }
}

Write-Host "📊 Informações do deploy:" -ForegroundColor Cyan
Write-Host "  Branch: $currentBranch"
Write-Host "  Último commit: $(git log -1 --pretty=format:'%h - %s')"
Write-Host "  Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')"

# Deploy para produção
Write-Host "`n🌐 Iniciando deploy para produção..." -ForegroundColor Green
try {
    vercel --prod --confirm
    Write-Host "`n✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host "🎉 Orkut Retrô 2025 está online com as últimas atualizações!" -ForegroundColor Magenta
    
    Write-Host "`n🔗 Links úteis:" -ForegroundColor Cyan
    Write-Host "  📱 Site: https://orkut-retro-2025.vercel.app"
    Write-Host "  📊 Dashboard Vercel: https://vercel.com/dashboard"
    Write-Host "  🤖 AI Status Panel: Clique no botão 🤖 no site"
    Write-Host "  🧪 Testes: https://orkut-retro-2025.vercel.app/test-ai-system.html"
    
} catch {
    Write-Host "❌ Erro durante o deploy:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "`n🎯 Deploy Summary:" -ForegroundColor Green
Write-Host "✅ Sistema AI Database Manager com Gemini API"
Write-Host "✅ Smart Sync Manager para sincronização offline"
Write-Host "✅ AI Status Panel para monitoramento"
Write-Host "✅ Sistema de testes completo"
Write-Host "🎵 Próximo: Integração com Spotify!"
