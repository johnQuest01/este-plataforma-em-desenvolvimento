# 📱 Guia Completo: Testar PWA no Celular

## ✅ Configuração Atual

O projeto está configurado para funcionar como PWA (Progressive Web App) com:
- ✅ Manifest.json configurado (`display: "standalone"` - tela cheia)
- ✅ Ícones PWA criados (192x192 e 512x512)
- ✅ Metadata configurado no layout.tsx
- ✅ InstallPrompt component pronto
- ✅ Service Worker configurado (via @ducanh2912/next-pwa)

## 🚀 Como Testar no Celular

### Opção 1: Rede Local (Mesma WiFi) - RECOMENDADO

1. **Inicie o servidor COM PWA habilitado:**
   ```powershell
   .\start-dev-pwa.ps1
   ```
   
   Ou manualmente:
   ```powershell
   $env:ENABLE_PWA_DEV="true"
   npm run dev:network
   ```

2. **Anote o IP que aparece** (exemplo: `http://192.168.1.100:3000`)

3. **No celular (mesma rede WiFi):**
   - Abra o navegador Chrome/Edge
   - Acesse: `http://SEU_IP:3000`
   - O card de instalação deve aparecer automaticamente

### Opção 2: Acesso Público (Fora do WiFi) - Cloudflare Tunnel

1. **Inicie o servidor COM PWA:**
   ```powershell
   .\start-dev-pwa.ps1
   ```
   (Deixe rodando em um terminal)

2. **Em outro terminal, inicie o túnel:**
   ```powershell
   .\start-public-tunnel.ps1
   ```

3. **Copie o link público** que aparecerá (exemplo: `https://xxxxx.trycloudflare.com`)

4. **No celular:**
   - Abra o navegador
   - Acesse o link público
   - O card de instalação deve aparecer

### Opção 3: Ngrok (Alternativa)

1. **Inicie o servidor COM PWA:**
   ```powershell
   .\start-dev-pwa.ps1
   ```

2. **Em outro terminal:**
   ```powershell
   .\usar-ngrok.ps1
   ```

3. **Use o link ngrok** que aparecerá

## 📋 Checklist de Verificação

### No Celular, verifique:

- [ ] O site carrega corretamente
- [ ] O card "Instalar Aplicativo" aparece (pode levar 2-3 segundos)
- [ ] Ao clicar em "Instalar", o app é adicionado à tela inicial
- [ ] O ícone aparece na tela inicial
- [ ] Ao abrir o app instalado, ele abre em **tela cheia** (sem barra do navegador)
- [ ] O app funciona offline (após primeira visita)

### Se o card não aparecer:

1. **Verifique se o PWA está habilitado:**
   - O servidor deve mostrar: `ENABLE_PWA_DEV=true`
   - Verifique o console do navegador (F12) por erros

2. **Limpe o cache do navegador:**
   - Chrome: Configurações > Privacidade > Limpar dados de navegação
   - Marque "Imagens e arquivos em cache"

3. **Verifique o manifest.json:**
   - Acesse: `http://SEU_IP:3000/manifest.json`
   - Deve retornar o JSON corretamente

4. **Verifique os ícones:**
   - Acesse: `http://SEU_IP:3000/icons/icon-192x192.png`
   - Deve carregar a imagem

5. **No console do navegador (F12):**
   ```javascript
   // Verifica se o manifest está carregado
   navigator.serviceWorker.getRegistrations().then(console.log);
   
   // Verifica se o evento beforeinstallprompt está disponível
   window.addEventListener('beforeinstallprompt', (e) => {
     console.log('✅ beforeinstallprompt disponível!', e);
   });
   ```

## 🔧 Troubleshooting

### Problema: "Compilando infinitamente"
**Solução:** Use `start-dev-pwa.ps1` que configura corretamente. Se persistir, pare o servidor e limpe:
```powershell
Remove-Item -Recurse -Force .next
npm run dev:network
```

### Problema: "Card não aparece"
**Solução:** 
1. Certifique-se de usar `start-dev-pwa.ps1` (habilita PWA)
2. Acesse via HTTPS (use Cloudflare Tunnel ou ngrok)
3. Alguns navegadores só mostram em HTTPS

### Problema: "App não abre em tela cheia"
**Solução:** Verifique o manifest.json:
- `"display": "standalone"` está correto ✅
- O app deve ser instalado primeiro
- Após instalar, abra pelo ícone na tela inicial (não pelo navegador)

## 📝 Notas Importantes

- **Service Worker:** O PWA precisa do service worker registrado para funcionar completamente
- **HTTPS:** Alguns recursos PWA só funcionam em HTTPS (use túnel público)
- **Primeira visita:** O service worker é registrado na primeira visita
- **Offline:** Após primeira visita, o app funciona offline

## 🎯 Protocolo @.cursorrules

✅ **Seguido corretamente:**
- TypeScript Strict Mode
- Zero `any` types
- Componentes puros (InstallPrompt é client component separado)
- Metadata configurado conforme Next.js 16.1.1
- Manifest.json seguindo padrão W3C

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique os logs do servidor
2. Abra o DevTools no celular (Chrome: chrome://inspect)
3. Verifique erros no console
4. Confirme que `manifest.json` e ícones estão acessíveis
