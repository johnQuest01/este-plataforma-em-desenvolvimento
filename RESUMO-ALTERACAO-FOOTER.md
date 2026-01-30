# ✅ RESUMO: Botão de Destaque Alterado para Dashboard

## 🎯 Solicitação

"faça o botão em footer parar de ir como destino para tela de caixa PDV, e poder ir para tela de dashboard (tela inicial de produtos com reels e etc...)"

---

## ✅ Alteração Aplicada

### **Botão de Destaque Mudou:**

**❌ ANTES:**
- Botão com ícone `sync` (RefreshCw) ia para `/pos` (Caixa/PDV)
- Tinha destaque visual (ring azul)

**✅ DEPOIS:**
- Botão com ícone `sync` (RefreshCw) vai para `/dashboard` (Tela Inicial)
- Mantém destaque visual (ring azul)

---

## 📁 Arquivos Modificados

### **1. `config/footer.ts`** ✅

```typescript
// ANTES
{ id: 'footer_pos', icon: 'sync', isHighlight: true, route: '/pos' }
{ id: 'footer_dashboard', icon: 'verified', route: '/dashboard' }

// DEPOIS
{ id: 'footer_dashboard', icon: 'sync', isHighlight: true, route: '/dashboard' }
{ id: 'footer_pos', icon: 'verified', route: '/pos' }
```

### **2. `components/builder/ui/ButtonsFooter.tsx`** ✅

```typescript
// ANTES (linha 81-84)
const highlightItem = useMemo(() => {
    return visibleItems.find(item => item.route === '/pos' || item.isHighlight);
}, [visibleItems]);

// DEPOIS (linha 81-84)
const highlightItem = useMemo(() => {
    return visibleItems.find(item => item.route === '/dashboard' || item.isHighlight);
}, [visibleItems]);
```

---

## 🎨 Resultado Visual

```
Footer:
[Carrinho] [Favoritos] [🔄 DASHBOARD] [POS] [Inventário] [Produção]
                            ↑
                     Botão de destaque
                     Vai para /dashboard
                     (tela inicial com reels)
```

---

## ✅ Status

**✅ ALTERAÇÃO COMPLETA!**

- ✅ Botão de destaque agora vai para `/dashboard`
- ✅ Ícone `sync` no Dashboard
- ✅ Destaque visual preservado
- ✅ Botão POS agora é normal
- ✅ Todas animações preservadas
- ✅ Loop infinito funcionando

**Teste em:** `http://localhost:3000` 🚀✨
