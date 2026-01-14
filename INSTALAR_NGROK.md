# 🔧 Como Instalar e Usar o ngrok

## Instalação do ngrok

### Opção 1: Download Manual (Recomendado)

1. Acesse: https://ngrok.com/download
2. Baixe a versão para Windows
3. Extraia o arquivo `ngrok.exe`
4. Coloque em uma pasta (ex: `C:\ngrok\`)
5. Adicione ao PATH do Windows OU use o caminho completo

### Opção 2: Via Chocolatey (se tiver instalado)

```powershell
choco install ngrok
```

### Opção 3: Via Scoop (se tiver instalado)

```powershell
scoop install ngrok
```

## Configuração Inicial

1. Crie uma conta gratuita em: https://dashboard.ngrok.com/signup
2. Copie seu authtoken da dashboard
3. Execute no terminal:

```powershell
ngrok config add-authtoken SEU_TOKEN_AQUI
```

## Uso

1. **Inicie o servidor:**
```bash
npm run dev
```

2. **Em outro terminal, execute:**
```bash
ngrok http 3000
```

3. **Você verá algo como:**
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

4. **Use o link `https://abc123.ngrok-free.app` no celular**

## ⚠️ Problemas Comuns

### "ngrok: command not found"
- O ngrok não está no PATH
- Use o caminho completo: `C:\caminho\para\ngrok.exe http 3000`
- Ou adicione ao PATH do Windows

### "ERR_NGROK_108" ou erro de autenticação
- Você precisa configurar o authtoken primeiro
- Execute: `ngrok config add-authtoken SEU_TOKEN`

### "Tunnel session failed"
- Verifique se o servidor está rodando na porta 3000
- Verifique sua conexão com a internet

---

## 🎯 Alternativa Mais Simples: Cloudflare Tunnel

Se o ngrok der problemas, use o script `start-public-tunnel.ps1` que já está pronto!

```powershell
.\start-public-tunnel.ps1
```

Ele baixa e configura automaticamente o Cloudflare Tunnel, que é gratuito e não precisa de cadastro!
