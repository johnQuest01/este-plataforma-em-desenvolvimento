# Script para configurar o firewall do Windows para permitir conexoes na porta 3000
# Uso: .\fix-firewall.ps1

Write-Host "Configurando firewall do Windows para porta 3000..." -ForegroundColor Cyan
Write-Host ""

# Verifica se ja existe regra para porta 3000
$existingRule = Get-NetFirewallRule -DisplayName "Next.js Dev Server Port 3000" -ErrorAction SilentlyContinue

if ($existingRule) {
    Write-Host "Regra de firewall ja existe. Removendo..." -ForegroundColor Yellow
    Remove-NetFirewallRule -DisplayName "Next.js Dev Server Port 3000" -ErrorAction SilentlyContinue
}

# Cria nova regra para permitir conexoes na porta 3000
try {
    New-NetFirewallRule -DisplayName "Next.js Dev Server Port 3000" `
        -Direction Inbound `
        -LocalPort 3000 `
        -Protocol TCP `
        -Action Allow `
        -Profile Domain,Private,Public | Out-Null
    
    Write-Host "Regra de firewall criada com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "A porta 3000 agora esta aberta para conexoes externas." -ForegroundColor Green
} catch {
    Write-Host "Erro ao criar regra de firewall. Tentando metodo alternativo..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Execute manualmente no PowerShell como Administrador:" -ForegroundColor Yellow
    Write-Host 'New-NetFirewallRule -DisplayName "Next.js Dev Server Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow' -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Testando conectividade..." -ForegroundColor Cyan

# Testa se a porta esta aberta localmente
$testConnection = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue

if ($testConnection) {
    Write-Host "Porta 3000 esta respondendo localmente!" -ForegroundColor Green
} else {
    Write-Host "Porta 3000 nao esta respondendo. Certifique-se de que o servidor esta rodando." -ForegroundColor Yellow
}

Write-Host ""
