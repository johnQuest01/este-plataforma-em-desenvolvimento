# 📱 Guia Completo: PWA via Link Local Network

## ✅ Sistema Configurado e Pronto

Todo o app foi revisado e configurado seguindo o protocolo **@.cursorrules**:

### 🔧 Configurações Aplicadas

#### 1. **Next.js Config** (`next.config.ts`)
- ✅ PWA **SEMPRE HABILITADO** em desenvolvimento e produção
- ✅ Service Worker configurado via `@ducanh2912/next-pwa`
- ✅ Cache otimizado para assets estáticos e APIs

#### 2. **Manifest PWA** (`public/manifest.json` + `app/manifest/route.ts`)
- ✅ `display: "standalone"` - Tela cheia sem barra do navegador
- ✅ `scope: "/"` - Todo o app é parte do PWA
- ✅ Ícones 192x192 e 512x512 gerados
- ✅ Headers corretos (`application/manifest+json`)

#### 3. **Layout e Metadata** (`app/layout.tsx`)
- ✅ Meta tags para PWA (iOS, Android, Windows)
- ✅ `viewport-fit: cover` - Suporte a notch/safe areas
- ✅ `theme-color: #5874f6` - Cor da barra de status
- ✅ Apple Web App configurado

#### 4. **Componentes PWA**

**`PWAHead.tsx`**:
- ✅ Detecta modo standalone automaticamente
- ✅ Aplica classes CSS para tela cheia
- ✅ Service Worker gerenciado pelo `@ducanh2912/next-pwa`

**`InstallPrompt.tsx`**:
- ✅ Card de instalação para Android/Chrome
- ✅ Instruções manuais para iOS/Safari
- ✅ Instruções específicas por navegador (Samsung, Firefox, etc.)
- ✅ **SEM loops infinitos** - `useEffect` otimizado

#### 5. **Estilos Standalone** (`app/globals.css`)
- ✅ `@media (display-mode: standalone)` - CSS específico para PWA instalado
- ✅ `env(safe-area-inset-*)` - Suporte a áreas seguras (notch)
- ✅ Tela cheia (`100vh` e `100dvh`)
- ✅ Esconde barras de navegação do navegador

#### 6. **Componentes Principais**
- ✅ `RootLayoutShell.tsx` - PWA sempre ativo
- ✅ `ConnectionsView.tsx` - Loop infinito corrigido (state durante render)

---

## 🚀 Como Usar

### **Método 1: Script Automatizado (RECOMENDADO)**

```powershell
# Execute no PowerShell (na raiz do projeto)
.\scripts\start-pwa-network.ps1
```

**O script faz automaticamente:**
1. ✅ Para processos Next.js existentes
2. ✅ Remove lock files
3. ✅ Verifica/gera ícones PWA
4. ✅ Detecta seu IP local
5. ✅ Inicia o servidor em modo network
6. ✅ Exibe os links de acesso

**Output esperado:**
```
========================================
  SERVIDOR PWA PRONTO!
========================================

Acesso LOCAL:
  http://localhost:3000

Acesso pela REDE (use este no celular):
  http://192.168.X.X:3000

INSTRUÇÕES PARA INSTALAR O PWA:
1. Abra o link acima no navegador do celular
2. Aguarde o card de instalação aparecer
3. Clique em 'Instalar' para baixar o app
4. O app será instalado na tela inicial
```

---

### **Método 2: Comando NPM Direto**

```bash
npm run dev:network
```

**Então:**
1. Descubra seu IP local:
   ```powershell
   ipconfig
   ```
   Procure por `IPv4 Address` na seção `Wi-Fi` ou `Ethernet`

2. Acesse no celular:
   ```
   http://SEU_IP:3000
   ```

---

## 📲 Instalando o PWA no Celular

### **Android (Chrome/Samsung Browser)**

1. **Abra o link** `http://IP:3000` no navegador
2. **Aguarde 2-3 segundos** - um card aparecerá automaticamente na parte inferior
3. **Clique em "Instalar"** no card
4. **Ou use o menu**:
   - Chrome: Menu (⋮) → "Instalar app"
   - Samsung: Menu (≡) → "Adicionar página a" → "Tela inicial"

### **iOS (Safari)**

1. **Abra o link** `http://IP:3000` no Safari
2. **Clique no botão Compartilhar** (□↑)
3. **Role para baixo** e clique em **"Adicionar à Tela de Início"**
4. **Confirme** o nome e clique em "Adicionar"

---

## ✨ Verificando se Está Funcionando

### **1. Card de Instalação Aparece?**
- ✅ **Android**: Card aparece após 2-3 segundos automaticamente
- ✅ **iOS**: Instruções aparecem no card (use o botão Compartilhar)

### **2. App Instalado Corretamente?**
- ✅ Ícone azul com "M" branco aparece na tela inicial
- ✅ Nome "Loja Maryland" ou "Maryland" visível

### **3. Tela Cheia (Standalone Mode)?**
Quando abrir o app instalado:
- ✅ **NÃO** aparece a barra de endereço do navegador
- ✅ **NÃO** aparecem botões de navegação (voltar/avançar)
- ✅ App ocupa 100% da tela
- ✅ Barra de status do sistema com cor `#5874f6` (azul)

---

## 🔍 Troubleshooting

### **Problema 1: Card de instalação não aparece**

**Causas possíveis:**
- App já está instalado
- Service Worker não foi registrado
- Manifest não foi carregado

**Solução:**
```javascript
// Cole no Console do navegador (F12 → Console):
navigator.serviceWorker.getRegistrations().then(r => console.log('SW:', r));
fetch('/manifest.json').then(r => r.json()).then(console.log);
```

Se o Service Worker não aparecer:
1. Recarregue a página (F5)
2. Limpe o cache (Ctrl+Shift+Delete)
3. Feche e abra o navegador novamente

---

### **Problema 2: App não abre em tela cheia**

**Solução:**
1. Desinstale o app (pressione e segure o ícone → Desinstalar)
2. Limpe o cache do navegador
3. Acesse novamente `http://IP:3000`
4. Reinstale o app

---

### **Problema 3: Ícone não aparece ou aparece quebrado**

**Solução:**
```powershell
# Regere os ícones
node scripts\generate-pwa-icons.js

# Verifique se foram criados
ls public\icons\*.png
```

Você deve ver:
- `icon-192x192.png`
- `icon-512x512.png`

---

### **Problema 4: Servidor não aceita conexões da rede**

**Verifique o Firewall do Windows:**
```powershell
# Execute como Administrador
.\scripts\fix-firewall.ps1
```

Ou manualmente:
1. Painel de Controle → Firewall do Windows
2. Configurações Avançadas → Regras de Entrada
3. Nova Regra → Porta → TCP → 3000 → Permitir conexão

---

## 📋 Checklist de Validação

Antes de testar no celular, verifique:

- [ ] `npm run dev:network` ou `.\scripts\start-pwa-network.ps1` rodando
- [ ] IP local detectado corretamente (não `127.0.0.1`)
- [ ] Firewall permite conexões na porta 3000
- [ ] Celular conectado na **mesma rede Wi-Fi** do notebook
- [ ] Link `http://IP:3000` abre no navegador do celular
- [ ] Ícones existem em `public/icons/` (192x192 e 512x512)
- [ ] Manifest acessível em `http://IP:3000/manifest.json`

---

## 🎯 Arquitetura PWA (Protocolo @.cursorrules)

### **Seguindo Lego Architecture:**

```typescript
// ✅ CORRETO: Zero any, TypeScript Strict, Componente Puro
export function PWAHead(): null {
  useEffect(() => {
    // Lógica isolada, sem side effects diretos
  }, []);
  return null;
}

// ✅ CORRETO: Estado gerenciado corretamente
export const InstallPrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Inicialização assíncrona (evita cascading renders)
    const init = () => {
      setTimeout(() => setIsVisible(true), 2000);
    };
    init();
  }, []); // ✅ SEM dependências = SEM loops
  
  return isVisible ? <Card /> : null;
};
```

### **Service Worker:**
- ✅ Gerenciado automaticamente por `@ducanh2912/next-pwa`
- ✅ **NUNCA** registre manualmente (`navigator.serviceWorker.register()`)
- ✅ Configurado em `next.config.ts` com `workboxOptions`

### **Manifest:**
- ✅ Servido via API Route (`app/manifest/route.ts`)
- ✅ Headers corretos (`application/manifest+json`)
- ✅ Cache de 1 hora (`max-age=3600`)

---

## 📚 Referências

- **Next.js PWA**: [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa)
- **Web App Manifest**: [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- **Workbox**: [Google Developers](https://developers.google.com/web/tools/workbox)
- **Protocol @.cursorrules**: `C:\Users\Bruno\mapa-para-codar-com-velocidade-fun-o\.cursorrules`

---

## 🛠️ Manutenção

### **Limpar Service Workers Antigos:**
```javascript
// Cole no Console do navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
  console.log('Service Workers limpos');
});
```

### **Forçar Atualização do Manifest:**
```powershell
# Altere a versão no manifest
# Incremente "version" em public/manifest.json e app/manifest/route.ts
```

### **Rebuild Completo:**
```powershell
# Remove .next e node_modules
rm -r .next
rm -r node_modules

# Reinstala
npm install

# Rebuild
npm run build
```

---

## ✅ Resultado Final

Após seguir este guia, você terá:

1. ✅ App PWA instalável via link local `http://IP:3000`
2. ✅ Tela cheia (standalone) como app nativo
3. ✅ Ícone personalizado na tela inicial
4. ✅ Sem loops infinitos de compilação
5. ✅ Service Worker funcionando offline
6. ✅ Compatível com Android, iOS, Windows

**Pronto para testes em qualquer dispositivo mobile!** 📱🚀
