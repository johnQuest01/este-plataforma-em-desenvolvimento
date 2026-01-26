# 🚀 Início Rápido: PWA via Link Local

## 📋 Pré-requisitos

- ✅ Node.js rodando
- ✅ Projeto instalado (`npm install` já executado)
- ✅ Celular e notebook na mesma rede Wi-Fi

---

## ⚡ 3 Passos para Testar

### **1. Inicie o servidor PWA**

```powershell
# Execute no PowerShell (raiz do projeto)
.\scripts\start-pwa-network.ps1
```

**Você verá:**
```
========================================
  SERVIDOR PWA PRONTO!
========================================

Acesso pela REDE (use este no celular):
  http://192.168.X.X:3000
```

---

### **2. Abra no celular**

No navegador do celular (Chrome/Safari), acesse:
```
http://192.168.X.X:3000
```
(Use o IP que apareceu na tela)

---

### **3. Instale o app**

**Android (Chrome):**
1. Aguarde 2-3 segundos
2. Card "Instalar Aplicativo" aparece na parte inferior
3. Clique em **"Instalar"**

**iOS (Safari):**
1. Clique no botão **Compartilhar** (□↑)
2. Role para baixo
3. Clique em **"Adicionar à Tela de Início"**
4. Confirme

---

## ✅ Pronto!

Você terá:
- ✅ Ícone azul com "M" na tela inicial
- ✅ App abre em tela cheia (sem barra de endereço)
- ✅ Parece um app nativo da Play Store/App Store

---

## 🔍 Troubleshooting Rápido

### **Problema: Link não abre no celular**

1. Verifique se estão na mesma Wi-Fi
2. Execute (como Admin):
   ```powershell
   .\scripts\fix-firewall.ps1
   ```

### **Problema: Card de instalação não aparece**

1. Recarregue a página (puxe para baixo)
2. Limpe o cache do navegador
3. Tente novamente

### **Problema: App não abre em tela cheia**

1. Desinstale o app (pressione e segure → Desinstalar)
2. Reinstale seguindo os passos acima

---

## 📚 Documentação Completa

Para detalhes técnicos, consulte:
- `GUIA-PWA-COMPLETO.md` - Guia detalhado
- `RESUMO-MUDANCAS-PWA.md` - Mudanças técnicas aplicadas

---

**Dúvidas? Veja o guia completo em `GUIA-PWA-COMPLETO.md`** 📖
