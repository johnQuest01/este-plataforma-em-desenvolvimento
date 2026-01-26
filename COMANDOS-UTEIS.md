# 🛠️ Comandos Úteis - PWA

## 🚀 Iniciar Servidor

### **Método 1: Script Automatizado (RECOMENDADO)**
```powershell
.\scripts\start-pwa-network.ps1
```
- ✅ Limpa processos automaticamente
- ✅ Detecta IP local
- ✅ Verifica ícones PWA
- ✅ Mostra instruções de instalação

### **Método 2: NPM Direto**
```bash
npm run dev:network
```
- Inicia servidor em `0.0.0.0:3000`
- Você precisa descobrir o IP manualmente:
  ```powershell
  ipconfig
  ```

### **Método 3: Desenvolvimento Normal**
```bash
npm run dev
```
- Apenas `localhost:3000`
- Não acessível via rede

---

## 🔧 Manutenção

### **Parar Servidor Manualmente**
```powershell
.\scripts\stop-dev-server.ps1
```

### **Limpar Service Workers (Console do Navegador)**
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
  caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
  console.log('✅ Service Workers e caches limpos');
});
```

### **Gerar Ícones PWA**
```bash
node scripts\generate-pwa-icons.js
```

### **Verificar Ícones**
```powershell
ls public\icons\*.png
```
Deve mostrar:
- `icon-192x192.png`
- `icon-512x512.png`

---

## 🔍 Debug

### **Verificar Manifest**
No navegador:
```
http://localhost:3000/manifest.json
```

### **Verificar Service Worker**
Console do navegador (F12):
```javascript
navigator.serviceWorker.getRegistrations().then(console.log);
```

### **Verificar Conexão Local**
```powershell
.\scripts\test-connection.ps1
```

### **Configurar Firewall**
Execute como **Administrador**:
```powershell
.\scripts\fix-firewall.ps1
```

---

## 📦 Build e Deploy

### **Build de Produção**
```bash
npm run build
```

### **Iniciar Produção**
```bash
npm start
```

### **Limpar Build**
```powershell
rm -r .next
npm run build
```

---

## 🧹 Limpeza Completa

### **Limpar Tudo (Cache, Node Modules, Build)**
```powershell
# Remove .next
rm -r .next

# Remove node_modules
rm -r node_modules

# Reinstala dependências
npm install

# Rebuild
npm run build
```

---

## 📊 Informações do Sistema

### **Ver IP Local**
```powershell
ipconfig
```
Procure por `IPv4 Address` em `Wi-Fi` ou `Ethernet`

### **Ver Processos Node.js**
```powershell
Get-Process -Name "node" | Select-Object Id,ProcessName,Path
```

### **Ver Porta 3000**
```powershell
Get-NetTCPConnection -LocalPort 3000 | Select-Object LocalAddress,State,OwningProcess
```

---

## 🔐 Segurança

### **Permitir Porta 3000 no Firewall**
```powershell
New-NetFirewallRule -DisplayName "Next.js Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### **Verificar Regras do Firewall**
```powershell
Get-NetFirewallRule | Where-Object {$_.DisplayName -match "Next.js"}
```

---

## 📱 Testar PWA

### **Checklist Rápido**
```powershell
# 1. Inicia servidor
.\scripts\start-pwa-network.ps1

# 2. Anota o IP exibido (ex: 192.168.1.10)

# 3. Acessa no celular
# http://192.168.1.10:3000

# 4. Aguarda card de instalação aparecer

# 5. Clica em "Instalar"
```

---

## 🆘 Comandos de Emergência

### **Matar TODOS os processos Node.js**
```powershell
Get-Process -Name "node" | Stop-Process -Force
```

### **Limpar TODAS as portas ocupadas**
```powershell
Get-NetTCPConnection -LocalPort 3000 | ForEach-Object {
  Stop-Process -Id $_.OwningProcess -Force
}
```

### **Resetar Next.js Completamente**
```powershell
# Para processos
Get-Process -Name "node" | Stop-Process -Force

# Remove locks
rm -r .next\dev -Force

# Remove cache
rm -r .next\cache -Force

# Restart
npm run dev:network
```

---

## 📚 Documentação

- **Guia Completo**: `GUIA-PWA-COMPLETO.md`
- **Início Rápido**: `INICIO-RAPIDO-PWA.md`
- **Mudanças Técnicas**: `RESUMO-MUDANCAS-PWA.md`
- **Protocolo**: `.cursorrules`

---

## 🎯 Atalhos Úteis

```powershell
# Alias para comandos frequentes (adicione ao seu perfil do PowerShell)

# Inicia PWA
function Start-PWA { .\scripts\start-pwa-network.ps1 }

# Para servidor
function Stop-Dev { .\scripts\stop-dev-server.ps1 }

# Gera ícones
function Gen-Icons { node scripts\generate-pwa-icons.js }

# Mostra IP
function Get-IP { 
  (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notmatch "^127\." -and $_.IPAddress -notmatch "^169\.254\."
  }).IPAddress 
}

# Uso:
# Start-PWA
# Stop-Dev
# Gen-Icons
# Get-IP
```

---

**Salve este arquivo para referência rápida!** 📌
