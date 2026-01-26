# Script para testar se o servidor esta acessivel
# Uso: .\test-connection.ps1

Write-Host "Testando conectividade do servidor..." -ForegroundColor Cyan
Write-Host ""

# Descobre o IP local
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -notlike "*Loopback*" -and 
    $_.IPAddress -notlike "169.254.*" -and
    $_.IPAddress -notlike "127.*"
} | Select-Object -First 1

if ($ipAddresses) {
    $ip = $ipAddresses.IPAddress
    Write-Host "IP Local: $ip" -ForegroundColor Green
    Write-Host ""
    
    # Testa localhost
    Write-Host "Testando localhost:3000..." -ForegroundColor Yellow
    $localTest = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue
    
    if ($localTest) {
        Write-Host "  OK - localhost:3000 esta respondendo" -ForegroundColor Green
    } else {
        Write-Host "  ERRO - localhost:3000 nao esta respondendo" -ForegroundColor Red
        Write-Host "  Certifique-se de que o servidor esta rodando!" -ForegroundColor Yellow
    }
    
    Write-Host ""
    $testUrl = "http://" + $ip + ":3000"
    Write-Host "Testando IP da rede: $testUrl" -ForegroundColor Yellow
    
    # Tenta fazer uma requisicao HTTP
    try {
        $response = Invoke-WebRequest -Uri $testUrl -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "  OK - Servidor esta acessivel em $testUrl" -ForegroundColor Green
        Write-Host "  Status Code: $($response.StatusCode)" -ForegroundColor Gray
    } catch {
        Write-Host "  ERRO - Nao foi possivel conectar em $testUrl" -ForegroundColor Red
        Write-Host "  Possiveis causas:" -ForegroundColor Yellow
        Write-Host "    1. Firewall bloqueando a porta 3000" -ForegroundColor Gray
        Write-Host "    2. Servidor nao esta escutando no IP correto" -ForegroundColor Gray
        Write-Host "    3. Celular nao esta na mesma rede WiFi" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  Solucao: Execute .\fix-firewall.ps1 como Administrador" -ForegroundColor Cyan
    }
} else {
    Write-Host "Nao foi possivel detectar o IP local" -ForegroundColor Red
}

Write-Host ""
