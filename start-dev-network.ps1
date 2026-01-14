# Script para iniciar o servidor de desenvolvimento acessível na rede local
# Uso: .\start-dev-network.ps1

Write-Host "🚀 Iniciando servidor de desenvolvimento em modo rede..." -ForegroundColor Cyan

# Descobre o IP local
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -notlike "*Loopback*" -and 
    $_.IPAddress -notlike "169.254.*" -and
    $_.IPAddress -notlike "127.*"
} | Select-Object -First 1

if ($ipAddresses) {
    $ip = $ipAddresses.IPAddress
    Write-Host ""
    Write-Host "✅ IP Local encontrado: $ip" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Para acessar no celular:" -ForegroundColor Yellow
    Write-Host "   http://$ip:3000" -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host ""
    Write-Host "⚠️  Certifique-se de que:" -ForegroundColor Yellow
    Write-Host "   • O celular está na mesma rede WiFi" -ForegroundColor Gray
    Write-Host "   • O firewall permite conexões na porta 3000" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "⚠️  Não foi possível detectar o IP local automaticamente" -ForegroundColor Yellow
    Write-Host "   Execute 'ipconfig' para descobrir manualmente" -ForegroundColor Gray
    Write-Host ""
}

# Inicia o servidor
Write-Host "🔄 Iniciando servidor Next.js..." -ForegroundColor Cyan
npm run dev:network
