# Sistema de Drag-and-Drop para Blocos Dashboard

## 📋 Visão Geral

Implementação de **Drag-and-Drop (Arrasta e Solta)** para todos os blocos da Dashboard, permitindo reordenação visual em tempo real.

## 🎯 Objetivo

Tornar os blocos renderizados na Dashboard (incluindo Banner, ProductGrid, Categories, etc.) **reordenáveis via Drag-and-Drop**, criando uma experiência de construção tipo "Lego".

## 🔧 Tecnologias Utilizadas

### **@dnd-kit**
- `@dnd-kit/core` - Core do sistema de DND
- `@dnd-kit/sortable` - Componentes sortable (reordenáveis)
- `@dnd-kit/utilities` - Utilitários CSS e transformações

### **Vantagens do @dnd-kit:**
✅ Performático (sem re-renders desnecessários)
✅ Acessibilidade nativa (suporte a teclado)
✅ Touch-friendly (funciona em mobile)
✅ TypeScript first
✅ Sem dependências de jQuery

## 📦 Arquivos Modificados

### 1. **`app/dashboard/page.tsx`**

#### **Mudanças:**
- ✅ Importado `DndContext`, `SortableContext`, `useSensor`, `useSensors`, `PointerSensor`
- ✅ Adicionado handler `handleDragEnd` para reordenar blocos
- ✅ Configurado `PointerSensor` com `activationConstraint` (8px de distância para evitar cliques acidentais)
- ✅ Envolvido `layout.content` em `DndContext` e `SortableContext`
- ✅ Substituído `BlockRenderer` por `SortableBlockRenderer`

#### **Estado Local:**
```typescript
const [blocks, setBlocks] = useState<BlockConfig[]>([]);
```

**Por quê?** 
- Permite atualização imediata do array de blocos ao soltar
- Não salva no banco (apenas visual para teste)

#### **Handler de Reordenação:**
```typescript
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  setBlocks((prevBlocks) => {
    const oldIndex = prevBlocks.findIndex((block) => block.id === active.id);
    const newIndex = prevBlocks.findIndex((block) => block.id === over.id);
    return arrayMove(prevBlocks, oldIndex, newIndex);
  });
};
```

**Fluxo:**
1. Usuário arrasta bloco `A`
2. Solta sobre bloco `B`
3. `arrayMove` reordena o array
4. React re-renderiza com nova ordem

### 2. **`components/builder/SortableBlockRenderer.tsx`** (NOVO)

#### **Responsabilidade:**
Wrapper que torna qualquer bloco arrastável.

#### **Componentes Visuais:**

##### **Handle de Arraste (🎯 Grip Icon)**
```typescript
<div
  {...attributes}
  {...listeners}
  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full 
             opacity-0 group-hover:opacity-100 
             cursor-grab active:cursor-grabbing"
>
  <GripVertical size={20} />
</div>
```

**Comportamento:**
- Visível apenas no hover (`opacity-0 group-hover:opacity-100`)
- Aparece à **esquerda do bloco**
- Cursor muda para `grab` e `grabbing`
- `touch-action: none` para evitar scroll no mobile

##### **Indicador Visual Durante Arraste**
```typescript
{isDragging && (
  <div className="absolute inset-0 border-2 border-dashed border-blue-500 
                  bg-blue-500/10 rounded-lg pointer-events-none" />
)}
```

**Comportamento:**
- Borda tracejada azul ao arrastar
- Opacidade reduzida (`opacity: 0.5`)
- `z-index: 50` para ficar acima de outros blocos

#### **Props do `useSortable`:**
- `transform` - Posição X/Y durante o arraste
- `transition` - Animação suave ao soltar
- `isDragging` - Estado booleano de arraste ativo
- `attributes` - Acessibilidade (ARIA)
- `listeners` - Event handlers (mousedown, touchstart)

### 3. **`app/dashboard/page.BACKUP.tsx`** (BACKUP)

✅ Backup do código original **antes** das mudanças de DND.

**Como restaurar:**
```bash
# Se não gostar, basta renomear:
mv page.tsx page.DND.tsx
mv page.BACKUP.tsx page.tsx
```

## 🎨 Experiência do Usuário

### **Desktop:**
1. **Hover** sobre qualquer bloco → aparece ícone 🟦 (grip) à esquerda
2. **Click + Drag** no grip → bloco fica semi-transparente
3. **Soltar** sobre outro bloco → blocos trocam de posição com animação suave

### **Mobile/Touch:**
1. **Press + Hold** (8px de arraste) → ativa DND
2. **Arrastar** → feedback visual (borda azul tracejada)
3. **Soltar** → blocos reordenados

### **Constraints (Restrições):**
- ✅ Banner pode ser arrastado para qualquer posição
- ✅ Se colocado entre produtos, empurra produtos para baixo
- ✅ Layout permanece responsivo
- ✅ Não quebra lógica nem estilo dos componentes

## 🧪 Como Testar

### **1. Iniciar Aplicação:**
```bash
npm run dev
```

### **2. Navegar para Dashboard:**
```
http://localhost:3000/dashboard
```

### **3. Testar Reordenação:**
- **Desktop**: Hover sobre Banner → arrastar grip à esquerda
- **Mobile**: Press + hold sobre Banner → arrastar

### **4. Verificar:**
- [ ] Banner se move visualmente?
- [ ] Outros blocos se reposicionam?
- [ ] Layout não quebra?
- [ ] Scroll funciona normalmente?
- [ ] Animações suaves?

## 📊 Estrutura de Dados

### **Antes (Fixo):**
```typescript
const layout = {
  header: BlockConfig,
  footer: BlockConfig,
  content: BlockConfig[] // ORDEM FIXA do banco
}
```

### **Depois (Reordenável):**
```typescript
const [blocks, setBlocks] = useState<BlockConfig[]>([]);

// layout.content é agora DINÂMICO
const layout = useMemo(() => {
  return {
    header: blocks.find(b => b.type === 'header'),
    footer: blocks.find(b => b.type === 'footer'),
    content: blocks.filter(b => b.type !== 'footer' && b.type !== 'header')
  };
}, [blocks]); // Recalcula quando blocks muda
```

## ⚡ Performance

### **Otimizações Implementadas:**

1. **`useSensor` com Threshold:**
```typescript
useSensor(PointerSensor, {
  activationConstraint: {
    distance: 8, // Evita ativação acidental
  },
})
```

2. **Memoização do Layout:**
```typescript
const layout = useMemo(() => { /* ... */ }, [blocks]);
```

3. **Animações GPU-Accelerated:**
```typescript
transform: CSS.Transform.toString(transform), // usa translate3d
```

4. **`contentVisibility: 'auto'`** no BlockRenderer original (mantido)

## 🚀 Próximos Passos (Se Aprovar)

### **Fase 2: Persistência**
- [ ] Salvar ordem no banco de dados (`updateHomeLayoutAction`)
- [ ] Adicionar botão "Salvar Layout"
- [ ] Adicionar botão "Resetar Layout"

### **Fase 3: UX Avançada**
- [ ] Preview ao arrastar (clone visual do bloco)
- [ ] Zonas de drop destacadas (dropzones visuais)
- [ ] Animação de "swap" entre blocos
- [ ] Desfazer/Refazer (undo/redo)

### **Fase 4: Mobile Refinado**
- [ ] Aumentar área de toque do grip
- [ ] Adicionar haptic feedback (vibração)
- [ ] Melhorar indicadores visuais no mobile

## 🔄 Como Reverter

### **Se não gostar:**
```bash
# 1. Parar aplicação
Ctrl + C

# 2. Restaurar backup
cd app/dashboard
del page.tsx
ren page.BACKUP.tsx page.tsx

# 3. Deletar arquivo novo
cd ../../components/builder
del SortableBlockRenderer.tsx

# 4. Reiniciar
npm run dev
```

### **Ou via PowerShell:**
```powershell
# Restaurar tudo de uma vez
Remove-Item "app/dashboard/page.tsx"
Rename-Item "app/dashboard/page.BACKUP.tsx" "page.tsx"
Remove-Item "components/builder/SortableBlockRenderer.tsx"
```

## 📝 Notas Técnicas

### **Por que `arrayMove`?**
- Utilitário do @dnd-kit/sortable
- Mais eficiente que splice/slice manual
- Mantém referências de objetos intactas

### **Por que `closestCenter`?**
- Algoritmo de detecção de colisão
- Detecta o bloco mais próximo do centro do mouse/touch
- Alternativas: `closestCorners`, `rectIntersection`

### **Por que `verticalListSortingStrategy`?**
- Otimizado para listas verticais
- Pre-calcula posições de drop
- Alternativas: `horizontalListSortingStrategy`, `rectSortingStrategy`

### **TypeScript Strict Mode:**
✅ Todas as tipagens corretas
✅ Sem `any` ou `@ts-ignore`
✅ Props validadas em tempo de compilação

## 🎯 Resultado Esperado

**ANTES:**
```
┌─────────────┐
│   Banner    │ ← Fixo
├─────────────┤
│  Products   │ ← Fixo
├─────────────┤
│ Categories  │ ← Fixo
└─────────────┘
```

**DEPOIS:**
```
┌─────────────┐
│  Products   │ ← Arrastável
├─────────────┤
│   Banner    │ ← Arrastável (movido!)
├─────────────┤
│ Categories  │ ← Arrastável
└─────────────┘
```

## 🐛 Troubleshooting

### **Problema: Handle não aparece**
- Verificar se `group-hover:` está ativo
- Inspecionar `z-index` do handle

### **Problema: Bloco não arrasta**
- Verificar `activationConstraint` (pode estar muito alto)
- Testar sem threshold: `distance: 0`

### **Problema: Layout quebra ao arrastar**
- Verificar se `transform` está sendo aplicado
- Inspecionar CSS conflicts

### **Problema: Performance ruim**
- Reduzir número de blocos visíveis
- Verificar re-renders desnecessários (React DevTools)

## 📚 Referências

- [dnd-kit Docs](https://docs.dndkit.com/)
- [Sortable Example](https://docs.dndkit.com/presets/sortable)
- [React Performance](https://react.dev/learn/render-and-commit)

---

**Status**: ✅ Implementado e pronto para teste  
**Data**: 2026-02-14  
**Versão**: 1.0.0 (Experimental)
