# Script para parar o servidor Next.js em execucao
# Uso: .\stop-dev-server.ps1

Write-Host "Parando servidor Next.js..." -ForegroundColor Yellow

# Encontra processos Node.js relacionados ao Next.js
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "Encontrados $($nodeProcesses.Count) processo(s) Node.js" -ForegroundColor Cyan
    
    # Tenta parar processos que podem ser Next.js
    $stopped = 0
    foreach ($proc in $nodeProcesses) {
        try {
            $proc | Stop-Process -Force -ErrorAction SilentlyContinue
            $stopped++
        } catch {
            # Ignora erros
        }
    }
    
    Write-Host "Parados $stopped processo(s)" -ForegroundColor Green
} else {
    Write-Host "Nenhum processo Node.js encontrado" -ForegroundColor Gray
}

# Remove arquivo de lock se existir
$lockFile = ".\.next\dev\lock"
if (Test-Path $lockFile) {
    Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
    Write-Host "Arquivo de lock removido" -ForegroundColor Green
}

Write-Host ""
Write-Host "Servidor parado com sucesso!" -ForegroundColor Green
