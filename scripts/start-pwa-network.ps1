# Encoding UTF-8 para PowerShell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INICIANDO PWA EM REDE LOCAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Para processos Node.js existentes que estejam rodando Next.js
Write-Host "[1/5] Verificando processos Node.js ativos..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -match "next" -or 
    $_.Path -match "next" -or
    (Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq 3000 })
}

if ($nodeProcesses) {
    Write-Host "   Encontrados $($nodeProcesses.Count) processo(s). Finalizando..." -ForegroundColor Red
    $nodeProcesses | ForEach-Object { 
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        Write-Host "   - PID $($_.Id) finalizado" -ForegroundColor Gray
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "   Nenhum processo ativo encontrado" -ForegroundColor Green
}

# 2. Remove lock files do Next.js
Write-Host ""
Write-Host "[2/5] Removendo arquivos de lock..." -ForegroundColor Yellow
$lockFile = ".next\dev\lock"
if (Test-Path $lockFile) {
    Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
    Write-Host "   Lock removido: $lockFile" -ForegroundColor Green
} else {
    Write-Host "   Nenhum lock encontrado" -ForegroundColor Green
}

# 3. Verifica existencia dos icones PWA
Write-Host ""
Write-Host "[3/5] Verificando icones PWA..." -ForegroundColor Yellow
$iconPath192 = "public\icons\icon-192x192.png"
$iconPath512 = "public\icons\icon-512x512.png"

if ((Test-Path $iconPath192) -and (Test-Path $iconPath512)) {
    Write-Host "   Icones PWA encontrados" -ForegroundColor Green
} else {
    Write-Host "   ATENCAO: Icones PWA ausentes. Gerando..." -ForegroundColor Red
    if (-not (Test-Path "public\icons")) {
        New-Item -ItemType Directory -Path "public\icons" -Force | Out-Null
    }
    
    # Executa script de geracao de icones
    node scripts\generate-pwa-icons.js
    Write-Host "   Icones gerados com sucesso" -ForegroundColor Green
}

# 4. Obtém o IP local da máquina
Write-Host ""
Write-Host "[4/5] Detectando endereco IP local..." -ForegroundColor Yellow
$localIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*","Ethernet*" -ErrorAction SilentlyContinue | 
    Where-Object { $_.IPAddress -notmatch "^127\." -and $_.IPAddress -notmatch "^169\.254\." } | 
    Select-Object -First 1).IPAddress

if (-not $localIP) {
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | 
        Where-Object { $_.IPAddress -notmatch "^127\." -and $_.IPAddress -notmatch "^169\.254\." } | 
        Select-Object -First 1).IPAddress
}

if ($localIP) {
    Write-Host "   IP detectado: $localIP" -ForegroundColor Green
} else {
    Write-Host "   ERRO: Nao foi possivel detectar IP local" -ForegroundColor Red
    Write-Host "   Verifique sua conexao de rede" -ForegroundColor Red
    exit 1
}

# 5. Inicia o servidor Next.js
Write-Host ""
Write-Host "[5/5] Iniciando servidor Next.js..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SERVIDOR PWA PRONTO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Acesso LOCAL:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Acesso pela REDE (use este no celular):" -ForegroundColor Cyan
Write-Host "  http://${localIP}:3000" -ForegroundColor White
Write-Host ""
Write-Host "INSTRUCOES PARA INSTALAR O PWA:" -ForegroundColor Yellow
Write-Host "1. Abra o link acima no navegador do celular" -ForegroundColor Gray
Write-Host "2. Aguarde o card de instalacao aparecer" -ForegroundColor Gray
Write-Host "3. Clique em 'Instalar' para baixar o app" -ForegroundColor Gray
Write-Host "4. O app sera instalado na tela inicial" -ForegroundColor Gray
Write-Host ""
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Red
Write-Host ""

# Define variavel de ambiente para habilitar PWA
$env:NODE_ENV = "development"

# Inicia o servidor com output em tempo real
npm run dev -- --hostname 0.0.0.0
