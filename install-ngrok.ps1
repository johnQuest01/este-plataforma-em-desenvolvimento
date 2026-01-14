# Script para instalar e configurar o ngrok automaticamente
# Uso: .\install-ngrok.ps1

Write-Host "Instalando ngrok..." -ForegroundColor Cyan
Write-Host ""

# Verifica se Chocolatey esta instalado
$chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

if ($chocoInstalled) {
    Write-Host "Chocolatey detectado! Instalando via Chocolatey..." -ForegroundColor Green
    Write-Host ""
    choco install ngrok -y
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "ngrok instalado com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Proximos passos:" -ForegroundColor Yellow
        Write-Host "   1. Crie uma conta em: https://dashboard.ngrok.com/signup" -ForegroundColor Cyan
        Write-Host "   2. Copie seu authtoken da dashboard" -ForegroundColor Cyan
        Write-Host "   3. Execute: ngrok config add-authtoken SEU_TOKEN" -ForegroundColor Cyan
        exit 0
    }
}

# Verifica se Scoop esta instalado
$scoopInstalled = Get-Command scoop -ErrorAction SilentlyContinue

if ($scoopInstalled) {
    Write-Host "Scoop detectado! Instalando via Scoop..." -ForegroundColor Green
    Write-Host ""
    scoop install ngrok
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "ngrok instalado com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Proximos passos:" -ForegroundColor Yellow
        Write-Host "   1. Crie uma conta em: https://dashboard.ngrok.com/signup" -ForegroundColor Cyan
        Write-Host "   2. Copie seu authtoken da dashboard" -ForegroundColor Cyan
        Write-Host "   3. Execute: ngrok config add-authtoken SEU_TOKEN" -ForegroundColor Cyan
        exit 0
    }
}

# Metodo manual: Download direto
Write-Host "Baixando ngrok manualmente..." -ForegroundColor Cyan
Write-Host ""

# Cria diretorio para ngrok
$ngrokDir = "$env:USERPROFILE\ngrok"
if (-not (Test-Path $ngrokDir)) {
    New-Item -ItemType Directory -Path $ngrokDir | Out-Null
}

$ngrokPath = "$ngrokDir\ngrok.exe"
$zipPath = "$ngrokDir\ngrok.zip"

# URL do download do ngrok para Windows
$downloadUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"

try {
    Write-Host "   Baixando ngrok..." -ForegroundColor Gray
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath -UseBasicParsing
    
    Write-Host "   Extraindo arquivos..." -ForegroundColor Gray
    Expand-Archive -Path $zipPath -DestinationPath $ngrokDir -Force
    
    # Remove o arquivo ZIP
    Remove-Item $zipPath -Force
    
    Write-Host ""
    Write-Host "ngrok instalado em: $ngrokDir" -ForegroundColor Green
    Write-Host ""
    
    # Adiciona ao PATH da sessao atual
    $env:Path += ";$ngrokDir"
    
    # Verifica se funciona
    $ngrokVersion = & "$ngrokPath" version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "ngrok esta funcionando!" -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANTE: Para usar em novas sessoes, adicione ao PATH:" -ForegroundColor Yellow
        Write-Host "   [Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path', 'User') + ';$ngrokDir', 'User')" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "   Ou use o caminho completo: $ngrokPath" -ForegroundColor Gray
        Write-Host ""
    }
    
    Write-Host "Proximos passos:" -ForegroundColor Yellow
    Write-Host "   1. Crie uma conta gratuita em: https://dashboard.ngrok.com/signup" -ForegroundColor Cyan
    Write-Host "   2. Copie seu authtoken da dashboard" -ForegroundColor Cyan
    Write-Host "   3. Execute: ngrok config add-authtoken SEU_TOKEN" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para testar agora, execute:" -ForegroundColor Yellow
    Write-Host "   $ngrokPath http 3000" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "Erro ao baixar ngrok automaticamente" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instalacao manual:" -ForegroundColor Yellow
    Write-Host "   1. Acesse: https://ngrok.com/download" -ForegroundColor Cyan
    Write-Host "   2. Baixe a versao para Windows" -ForegroundColor Cyan
    Write-Host "   3. Extraia o ngrok.exe" -ForegroundColor Cyan
    Write-Host "   4. Coloque em uma pasta (ex: C:\ngrok\)" -ForegroundColor Cyan
    Write-Host "   5. Adicione ao PATH ou use o caminho completo" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Erro detalhado: $_" -ForegroundColor Red
    exit 1
}
