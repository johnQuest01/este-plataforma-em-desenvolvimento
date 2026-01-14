# Script para usar o ngrok facilmente
# Uso: .\usar-ngrok.ps1

Write-Host "Iniciando ngrok..." -ForegroundColor Cyan
Write-Host ""

# Verifica se o servidor esta rodando
$portCheck = netstat -ano | findstr ":3000" | findstr "LISTENING"
if (-not $portCheck) {
    Write-Host "AVISO: O servidor nao esta rodando na porta 3000" -ForegroundColor Yellow
    Write-Host "Execute 'npm run dev' primeiro!" -ForegroundColor Yellow
    Write-Host ""
}

$ngrokPath = "$env:USERPROFILE\ngrok\ngrok.exe"

if (-not (Test-Path $ngrokPath)) {
    Write-Host "ERRO: ngrok nao encontrado em $ngrokPath" -ForegroundColor Red
    Write-Host "Execute primeiro: .\install-ngrok.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "Iniciando tunel para http://localhost:3000" -ForegroundColor Green
Write-Host "O link publico aparecera abaixo:" -ForegroundColor Yellow
Write-Host ""

# Executa o ngrok
& $ngrokPath http 3000
