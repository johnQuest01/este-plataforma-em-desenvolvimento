# 🚀 Início Rápido - PWA no Celular

## ⚠️ ORDEM CORRETA (IMPORTANTE!)

### 1️⃣ PRIMEIRO: Configure o Firewall (Uma Vez Apenas)

**Abra PowerShell como Administrador:**
- Botão direito → "Executar como administrador"

```powershell
cd "C:\Users\Bruno\mapa-para-codar-com-velocidade-fun-o"
.\fix-firewall.ps1
```

**OU configure manualmente:**
- `Win + R` → `wf.msc` → Enter
- Regras de Entrada → Nova Regra → Porta → TCP → 3000 → Permitir

### 2️⃣ SEGUNDO: Inicie o Servidor

**Em um terminal NORMAL (não precisa ser admin):**

```powershell
.\start-dev-pwa.ps1
```

**AGUARDE aparecer:**
```
✓ Ready in X.Xs
```

### 3️⃣ TERCEIRO: Use o Link no Celular

O script vai mostrar:
```
IP Local encontrado: 192.168.15.24
Para acessar no celular (mesma rede WiFi):
   http://192.168.15.24:3000
```

**No celular (mesma WiFi):**
- Abra navegador
- Digite: `http://192.168.15.24:3000`
- Instale o app quando aparecer o card

## ❌ Erro Comum

Se você executar `.\test-connection.ps1` **ANTES** de iniciar o servidor, vai dar erro!

**Correto:**
1. Configure firewall (uma vez)
2. Inicie servidor (`.\start-dev-pwa.ps1`)
3. Aguarde "✓ Ready"
4. Aí sim teste no celular

## ✅ Status Atual

Pelo teste que você fez, o servidor **não estava rodando**. 

**Solução:**
1. Execute `.\start-dev-pwa.ps1` novamente
2. Aguarde aparecer "✓ Ready"
3. Acesse `http://192.168.15.24:3000` no celular

## 🔥 Se o Link Não Funcionar no Celular

1. **Verifique se o servidor está rodando:**
   - Deve mostrar "✓ Ready" no terminal
   
2. **Configure o firewall:**
   - Execute `.\fix-firewall.ps1` como Administrador

3. **Verifique se está na mesma WiFi:**
   - IP do celular deve começar com `192.168.15.x`

4. **Use túnel público (alternativa):**
   ```powershell
   # Terminal 1
   .\start-dev-pwa.ps1
   
   # Terminal 2  
   .\start-public-tunnel.ps1
   ```
   Use o link HTTPS que aparecer (funciona de qualquer lugar)
