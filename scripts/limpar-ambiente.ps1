# Encoding UTF-8 para PowerShell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Red
Write-Host "  LIMPANDO AMBIENTE DE DESENVOLVIMENTO" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# 1. Para TODOS os processos Node.js
Write-Host "[1/3] Finalizando processos Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "   Encontrados $($nodeProcesses.Count) processo(s) Node.js" -ForegroundColor Gray
    $nodeProcesses | ForEach-Object { 
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        Write-Host "   - PID $($_.Id) finalizado" -ForegroundColor Gray
    }
    Start-Sleep -Seconds 2
    Write-Host "   Processos finalizados" -ForegroundColor Green
} else {
    Write-Host "   Nenhum processo Node.js ativo" -ForegroundColor Green
}

# 2. Remove lock files e cache do Next.js
Write-Host ""
Write-Host "[2/3] Limpando cache e lock files..." -ForegroundColor Yellow

# Lock file
if (Test-Path ".next\dev\lock") {
    Remove-Item ".next\dev\lock" -Force -ErrorAction SilentlyContinue
    Write-Host "   Lock file removido" -ForegroundColor Green
}

# Cache completo (opcional)
if (Test-Path ".next\cache") {
    Write-Host "   Limpando cache do Next.js..." -ForegroundColor Gray
    Remove-Item ".next\cache" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   Cache limpo" -ForegroundColor Green
}

# 3. Verifica portas ocupadas
Write-Host ""
Write-Host "[3/3] Verificando porta 3000..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($port3000) {
    Write-Host "   AVISO: Porta 3000 ainda ocupada" -ForegroundColor Red
    $port3000 | ForEach-Object {
        $processId = $_.OwningProcess
        Write-Host "   Finalizando processo PID $processId..." -ForegroundColor Gray
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
    Write-Host "   Porta 3000 liberada" -ForegroundColor Green
} else {
    Write-Host "   Porta 3000 livre" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  LIMPEZA CONCLUIDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Agora voce pode iniciar o servidor normalmente:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
