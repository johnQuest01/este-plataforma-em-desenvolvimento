# Script para iniciar o servidor de desenvolvimento COM PWA habilitado
# Isso permite testar a instalacao do app no celular
# Uso: .\start-dev-pwa.ps1

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Iniciando servidor de desenvolvimento COM PWA habilitado..." -ForegroundColor Cyan
Write-Host ""

# Verifica se ja existe um servidor Next.js rodando e para ele
$nextProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*next dev*" -or $_.Path -like "*node*"
}

if ($nextProcesses) {
    Write-Host "Parando processos Next.js existentes..." -ForegroundColor Yellow
    $nextProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    
    # Remove o arquivo de lock se existir
    $lockFile = ".\.next\dev\lock"
    if (Test-Path $lockFile) {
        Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
        Write-Host "Arquivo de lock removido." -ForegroundColor Green
    }
    Write-Host ""
}

# Descobre o IP local
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -notlike "*Loopback*" -and 
    $_.IPAddress -notlike "169.254.*" -and
    $_.IPAddress -notlike "127.*"
} | Select-Object -First 1

if ($ipAddresses) {
    $ip = $ipAddresses.IPAddress
    Write-Host "IP Local encontrado: $ip" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para acessar no celular (mesma rede WiFi):" -ForegroundColor Yellow
    $url = "http://" + $ip + ":3000"
    Write-Host ("   " + $url) -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host ""
    Write-Host "Para acesso publico (fora do WiFi), use:" -ForegroundColor Yellow
    Write-Host "   .\usar-ngrok.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Certifique-se de que:" -ForegroundColor Yellow
    Write-Host "   - O celular esta na mesma rede WiFi (para IP local)" -ForegroundColor Gray
    Write-Host "   - O firewall permite conexoes na porta 3000" -ForegroundColor Gray
    Write-Host "   - O PWA esta habilitado (ENABLE_PWA_DEV=true)" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "Nao foi possivel detectar o IP local automaticamente" -ForegroundColor Yellow
    Write-Host "   Execute 'ipconfig' para descobrir manualmente" -ForegroundColor Gray
    Write-Host ""
}

# Define a variavel de ambiente para habilitar PWA
$env:ENABLE_PWA_DEV = "true"

# Inicia o servidor
Write-Host "Iniciando servidor Next.js com PWA habilitado..." -ForegroundColor Cyan
Write-Host "   (O card de instalacao aparecera no celular)" -ForegroundColor Gray
Write-Host ""

npm run dev:network
