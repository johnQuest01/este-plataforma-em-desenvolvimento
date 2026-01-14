# Script para criar túnel público usando Cloudflare Tunnel (sem instalação)
# Uso: .\start-public-tunnel.ps1

Write-Host "🌐 Criando túnel público com Cloudflare..." -ForegroundColor Cyan
Write-Host ""

# Verifica se o servidor está rodando
$portCheck = netstat -ano | findstr ":3000" | findstr "LISTENING"
if (-not $portCheck) {
    Write-Host "❌ Erro: O servidor não está rodando na porta 3000" -ForegroundColor Red
    Write-Host "   Execute 'npm run dev' primeiro!" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Servidor detectado na porta 3000" -ForegroundColor Green
Write-Host ""
Write-Host "📥 Baixando Cloudflare Tunnel..." -ForegroundColor Cyan

# Cria diretório temporário se não existir
$tempDir = "$env:TEMP\cloudflared"
if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir | Out-Null
}

# Verifica se já existe o executável
$cloudflaredPath = "$tempDir\cloudflared.exe"
if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "   Baixando cloudflared.exe..." -ForegroundColor Gray
    
    # URL do download direto do Cloudflare
    $downloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $cloudflaredPath -UseBasicParsing
        Write-Host "   ✅ Download concluído!" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Erro ao baixar. Tentando método alternativo..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   Por favor, baixe manualmente:" -ForegroundColor Yellow
        Write-Host "   1. Acesse: https://github.com/cloudflare/cloudflared/releases/latest" -ForegroundColor Cyan
        Write-Host "   2. Baixe: cloudflared-windows-amd64.exe" -ForegroundColor Cyan
        Write-Host "   3. Coloque em: $cloudflaredPath" -ForegroundColor Cyan
        exit 1
    }
}

Write-Host ""
Write-Host "🚀 Iniciando túnel..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 O link público aparecerá abaixo:" -ForegroundColor Yellow
Write-Host "   (Copie e cole no celular)" -ForegroundColor Gray
Write-Host ""

# Executa o cloudflared
& $cloudflaredPath tunnel --url http://localhost:3000
