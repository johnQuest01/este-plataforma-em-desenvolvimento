# 📱 Guia Completo: Testar PWA no Celular - Passo a Passo

## ⚠️ IMPORTANTE: Ordem Correta de Execução

### Passo 1: Configure o Firewall (UMA VEZ APENAS)

**Execute como Administrador:**

1. Clique com botão direito no PowerShell
2. Selecione "Executar como administrador"
3. Execute:
   ```powershell
   cd "C:\Users\Bruno\mapa-para-codar-com-velocidade-fun-o"
   .\fix-firewall.ps1
   ```

**OU configure manualmente:**

1. Pressione `Win + R`
2. Digite: `wf.msc` → Enter
3. Regras de Entrada → Nova Regra → Porta → TCP → 3000 → Permitir → Finish

### Passo 2: Inicie o Servidor COM PWA

**Em um terminal NORMAL (não precisa ser admin):**

```powershell
.\start-dev-pwa.ps1
```

**Aguarde até aparecer:**
```
✓ Ready in X.Xs
```

### Passo 3: Verifique o Link

O script vai mostrar:
```
IP Local encontrado: 192.168.15.24
Para acessar no celular (mesma rede WiFi):
   http://192.168.15.24:3000
```

### Passo 4: Teste no Celular

1. **Certifique-se que o celular está na mesma WiFi**
2. **Abra o navegador no celular**
3. **Digite:** `http://192.168.15.24:3000`
4. **O app deve carregar**

### Passo 5: Instale o App

1. **Aguarde 2-3 segundos** após carregar
2. **O card "Instalar Aplicativo" deve aparecer**
3. **Clique em "Instalar" ou "Baixar"**
4. **O app será adicionado à tela inicial**

### Passo 6: Abra em Tela Cheia

1. **Feche o navegador**
2. **Abra o app pelo ícone na tela inicial**
3. **O app deve abrir em tela cheia** (sem barra do navegador)

## 🔍 Troubleshooting

### Problema: "localhost:3000 não está respondendo"

**Causa:** O servidor não está rodando

**Solução:**
1. Execute `.\start-dev-pwa.ps1`
2. Aguarde aparecer "✓ Ready"
3. Teste novamente

### Problema: "Não foi possível conectar em http://192.168.15.24:3000"

**Causa:** Firewall bloqueando OU servidor não rodando

**Solução:**
1. Verifique se o servidor está rodando (deve mostrar "✓ Ready")
2. Execute `.\fix-firewall.ps1` como Administrador
3. Teste novamente

### Problema: "Card de instalação não aparece"

**Causa:** PWA não está habilitado

**Solução:**
1. Certifique-se de usar `.\start-dev-pwa.ps1` (não `npm run dev`)
2. Verifique se aparece: `✓ (pwa) Service worker: ...`
3. Acesse via HTTPS (use Cloudflare Tunnel ou ngrok)

### Problema: "App não abre em tela cheia"

**Causa:** App não foi instalado corretamente

**Solução:**
1. Desinstale o app da tela inicial
2. Acesse novamente pelo navegador
3. Instale novamente
4. Abra pelo ícone (não pelo navegador)

## 📋 Checklist Rápido

- [ ] Firewall configurado (executado `fix-firewall.ps1` como admin)
- [ ] Servidor rodando (`start-dev-pwa.ps1` executado)
- [ ] Mensagem "✓ Ready" apareceu
- [ ] Celular na mesma WiFi
- [ ] Acessou `http://192.168.15.24:3000` no celular
- [ ] Card de instalação apareceu
- [ ] App instalado
- [ ] Abriu pelo ícone (não pelo navegador)
- [ ] App em tela cheia ✅

## 🚀 Comandos Rápidos

```powershell
# 1. Configurar firewall (como admin, uma vez apenas)
.\fix-firewall.ps1

# 2. Iniciar servidor COM PWA (terminal normal)
.\start-dev-pwa.ps1

# 3. Testar conectividade (terminal normal, servidor deve estar rodando)
.\test-connection.ps1

# 4. Parar servidor (se necessário)
.\stop-dev-server.ps1
```

## 📞 Se Nada Funcionar

1. **Verifique se o servidor está rodando:**
   ```powershell
   netstat -an | findstr ":3000"
   ```
   Deve mostrar: `TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING`

2. **Teste localhost primeiro:**
   - Abra: `http://localhost:3000` no computador
   - Se funcionar, o problema é firewall/rede
   - Se não funcionar, o servidor não está rodando

3. **Use túnel público como alternativa:**
   ```powershell
   # Terminal 1: Servidor
   .\start-dev-pwa.ps1
   
   # Terminal 2: Túnel
   .\start-public-tunnel.ps1
   ```
   Use o link HTTPS que aparecer (funciona de qualquer lugar)
