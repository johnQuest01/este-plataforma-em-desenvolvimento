# PACOTE 5 — Características do Layout Frontend
> Envie ao Google AI Studio antes de pedir qualquer nova tela.
> Este arquivo descreve COMO o aplicativo é construído visualmente, não o que ele faz.
> O AI deve gerar código seguindo estas regras, ignorando qualquer outra convenção genérica.

---

## 1. ESTRUTURA GERAL DE QUALQUER TELA

Toda tela segue este esqueleto obrigatório:

```tsx
// REGRA: Todo bloco recebe (config, onAction) via BlockComponentProps
export const MinhaNovaTelaBlock: React.FC<BlockComponentProps> = ({ config, onAction }) => {
  const { data, style } = config;

  return (
    // Container principal: largura máxima de celular, centralizado, com SCROLL
    <div
      className="w-full max-w-md mx-auto flex flex-col overflow-y-auto overscroll-contain pb-28"
      style={{
        backgroundColor: style.bgColor ?? '#ffffff',
        maxHeight: 'calc(100dvh - 4rem)',  // descontando o header fixo
      }}
    >
      {/* conteúdo da tela aqui */}
    </div>
  );
};
```

### Regras fixas do container
| Propriedade | Valor | Por quê |
|---|---|---|
| `max-w-md` | `448px` | Simula tela de celular dentro do desktop |
| `mx-auto` | centralizado | Sempre centrado horizontalmente |
| `overflow-y-auto` | scroll vertical | `html` e `body` têm `overflow: hidden` global |
| `overscroll-contain` | evita bounce iOS | Padrão do app |
| `pb-28` | 112px de padding inferior | Espaço para o footer fixo não cobrir o conteúdo |
| `maxHeight: calc(100dvh - 4rem)` | altura da viewport - header | Garante que o scroll funciona corretamente |

---

## 2. PALETA DE CORES (OBRIGATÓRIA)

```
Azul principal:   #5874f6   → botões primários, headers, links, destaques
Rosa vendedor:    #F5A5C2   → badge de vendedora autorizada Maryland
Verde sucesso:    #50E3C2   → confirmações, status positivo
Vermelho alerta:  #ff4d6d   → erros, botões destrutivos, badges críticos
Laranja aviso:    #fb923c   → estoque baixo, avisos
Fundo cinza:      #eeeeee   → fundo de seções, blocos de inventário
Fundo branco:     #ffffff   → fundo de telas de conta/detalhe
Texto principal:  text-gray-700   → valores, labels principais
Texto secundário: text-gray-400   → labels de campo, placeholders
Texto muted:      text-gray-500   → subtítulos, informações auxiliares
```

**Nunca usar `text-black font-black` para valores de dados** — é pesado demais.
Use `text-sm font-medium text-gray-700` para valores e `text-xs font-medium text-gray-400` para labels.

---

## 3. TIPOGRAFIA

### Regra geral: fontes leves para dados, mais pesadas apenas para títulos

| Uso | Classe Tailwind |
|---|---|
| Título principal da tela (H1) | `text-xl font-semibold text-gray-700` |
| Título de seção (H2) | `text-xs font-semibold text-gray-400 uppercase tracking-widest` |
| Subtítulo / descrição de card | `text-sm font-medium text-gray-500` |
| Label de campo | `text-xs font-medium text-gray-400 uppercase tracking-wider` |
| Valor de campo | `text-sm font-medium text-gray-700` |
| Valor monetário em destaque | `text-sm font-semibold text-[#5874f6]` |
| Botão primário | `text-sm font-semibold text-white` |
| Botão secundário / outline | `text-sm font-semibold text-gray-700` |
| Link / ação inline | `text-xs font-semibold text-[#5874f6]` |
| Texto de card de navegação (título) | `text-lg font-bold text-gray-800` |
| Texto de card de navegação (subtítulo) | `text-sm font-semibold text-gray-600` |

### PROIBIDO
```
❌ font-black em valores de dados
❌ text-black (preferir text-gray-700 ou text-gray-800)
❌ border-2 border-black (estilo grosseiro — usar border-gray-200 ou border-gray-100)
```

---

## 4. PADRÕES DE CARDS

### Card de navegação (menu de opções)
```tsx
// Usado em: Minha Conta, menus de seção
<motion.button
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.3, delay: index * 0.1 }}
  onClick={() => onAction?.(action)}
  className="flex w-full items-center rounded-xl border border-gray-400 bg-white p-4 text-left shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98]"
>
  <IconComponent className="h-8 w-8 text-gray-700 mr-4 shrink-0" strokeWidth={2} />
  <div className="flex flex-col">
    <span className="text-lg font-bold text-gray-800 leading-tight mb-1">{titulo}</span>
    <span className="text-sm font-semibold text-gray-600 leading-snug">{subtitulo}</span>
  </div>
</motion.button>
```

### Card de item de lista (conta, produto, pedido)
```tsx
// Usado em: Formas de Pagamento, Histórico, Catálogo
<button className="w-full flex items-center gap-4 p-3.5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100 active:scale-[0.98] transition-all text-left shadow-sm">
  {/* Ícone colorido à esquerda */}
  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
    style={{ backgroundColor: brandColor + '22' }}>
    <IconComponent className="w-5 h-5" style={{ color: brandColor }} strokeWidth={1.5} />
  </div>
  {/* Texto central */}
  <div className="flex flex-col flex-1 min-w-0">
    <span className="text-sm font-semibold text-gray-700 truncate">{titulo}</span>
    <span className="text-xs text-gray-400 font-medium">{subtitulo}</span>
  </div>
  {/* Valor + seta à direita */}
  <div className="flex items-center gap-2 shrink-0">
    <span className="text-sm font-semibold text-gray-600">{valor}</span>
    <ChevronRight className="w-4 h-4 text-gray-400" />
  </div>
</button>
```

### Card de detalhes / painel interno
```tsx
// Usado em: detalhes de cartão, informações pessoais expandidas
<div className="bg-gray-50 rounded-2xl p-5 flex flex-col gap-4 border border-gray-100">
  {/* Linha separadora entre grupos de campos */}
  <div className="w-full h-px bg-gray-200" />

  {/* Campo label + valor */}
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</span>
    <span className="text-sm font-medium text-gray-700">{valor}</span>
  </div>
</div>
```

### Card "adicionar novo" (dashed border)
```tsx
// Padrão para botões de adicionar item
<button className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-dashed border-gray-200 hover:border-[#5874f6]/50 hover:bg-[#5874f6]/5 active:scale-[0.98] transition-all group">
  <div className="w-10 h-10 rounded-xl border border-gray-200 group-hover:border-[#5874f6]/40 flex items-center justify-center transition-colors">
    <Plus className="w-5 h-5 text-gray-400 group-hover:text-[#5874f6] transition-colors" strokeWidth={2} />
  </div>
  <span className="text-sm font-medium text-gray-400 group-hover:text-[#5874f6] transition-colors">
    Adicionar ...
  </span>
</button>
```

---

## 5. PADRÕES DE BOTÕES

### Botão primário (ação principal)
```tsx
<button className="flex-1 py-2.5 rounded-xl bg-[#5874f6] text-white text-sm font-semibold hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20">
  Confirmar
</button>
```

### Botão secundário / outline (ação alternativa)
```tsx
<button className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">
  Cancelar
</button>
```

### Botão destrutivo (remover, apagar)
```tsx
<button className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-400 text-sm font-semibold hover:bg-red-50 transition-colors">
  Remover
</button>
```

### Botão de link / ação inline
```tsx
<button className="text-xs font-semibold text-[#5874f6] border border-[#5874f6]/40 px-3 py-1 rounded-lg hover:bg-[#5874f6]/5 transition-colors">
  Editar
</button>
```

### Botão pill (arredondado cheio) — buscar, filtros
```tsx
<button className="bg-[#5874f6] text-white font-bold text-sm px-8 py-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-70">
  Buscar
</button>
```

### Botão grid (grade de atalhos) — 2 colunas
```tsx
<button className="flex items-center justify-center rounded-lg border border-gray-400 px-2 py-2 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
  Label
</button>
```

### Botão "voltar" no topo de tela
```tsx
<button
  onClick={() => onAction?.('GO_BACK')}
  className="flex items-center gap-0.5 p-1 -ml-3 rounded-full text-gray-700 hover:bg-gray-100 active:scale-95"
>
  <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
  <span className="text-xs font-bold">Voltar</span>
</button>
```

---

## 6. PADRÕES DE INPUTS

### Input padrão de formulário
```tsx
<div className="w-full flex flex-col gap-1">
  <label className="text-xs font-medium text-gray-500">{label}</label>
  <input
    type="text"
    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-300 focus:border-[#5874f6] focus:ring-2 focus:ring-[#5874f6]/20 focus:bg-white"
    placeholder={placeholder}
  />
</div>
```

### Input de busca (dentro de barra de busca)
```tsx
<div className="flex-1 h-9 bg-white rounded-full flex items-center px-3 shadow-inner overflow-hidden">
  <Search size={16} className="text-gray-400 mr-2 shrink-0" />
  <input
    type="text"
    placeholder="Buscar..."
    className="bg-transparent border-none outline-none text-sm text-black w-full placeholder:text-gray-400"
  />
</div>
```

### Input com campo oculto (senha, dados sensíveis)
```tsx
// Sempre com botão olho ao lado
<div className="flex items-center gap-3">
  <span className="text-sm font-medium text-gray-700 tracking-widest">
    {visible ? valorReal : '••••••••'}
  </span>
  <button onClick={() => setVisible(v => !v)} className="text-gray-400 hover:text-gray-600 transition-colors">
    {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
  </button>
</div>
```

---

## 7. CABEÇALHO DE TELA (HEADER)

O header é um componente global fixo em todas as telas. **Não recria o header dentro do bloco.**
O `AccountPageClient` (ou equivalente) monta o header por cima e passa `onAction('GO_BACK')`.

```tsx
// Como o header é passado para a tela:
const headerConfig: BlockConfig = {
  id: 'header-block',
  type: 'header',
  isVisible: true,
  data: {
    title: 'Título da Tela',
    address: 'Maryland Gestão',
    showBack: true,   // true = mostra botão Voltar; false = mostra título
  },
  style: { bgColor: '#5874f6', textColor: '#ffffff' },
};

// O header já tem:
// - Barra de busca central
// - Botão de menu hambúrguer
// - Botão "← Voltar" quando showBack=true
// - Endereço/subtítulo abaixo
```

### Cabeçalho interno de seção (dentro do bloco, sem ser o header global)
```tsx
// Usado quando a tela tem seu próprio cabeçalho interno (ex: ícone + título)
<div className="flex flex-col items-center pt-8 pb-6 px-5 gap-2">
  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
    <IconComponent className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
  </div>
  <h1 className="text-base font-semibold text-gray-700">Título da Seção</h1>
</div>
```

---

## 8. SEÇÕES COM TÍTULO (divisão de conteúdo)

```tsx
// Título de seção dentro de uma tela
<h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
  Nome da Seção
</h2>

// Com ícone ao lado
<div className="flex items-center gap-2">
  <IconComponent className="w-4 h-4 text-gray-400" />
  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
    Nome da Seção
  </h2>
</div>

// Divisor horizontal entre seções
<div className="w-full h-px bg-gray-100 my-7" />
```

---

## 9. ANIMAÇÕES (FRAMER MOTION)

### Entrada de tela completa
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: 'easeOut' }}
>
```

### Entrada de lista com delay escalonado (stagger)
```tsx
// Cada item da lista entra com 0.1s de delay adicional
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.3, delay: index * 0.1 }}
>
```

### Transição entre duas telas (AnimatePresence + modo "wait")
```tsx
<AnimatePresence mode="wait">
  {!detalheAberto ? (
    <motion.div key="lista"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.22 }}
    >
      {/* lista */}
    </motion.div>
  ) : (
    <motion.div key="detalhe"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.22 }}
    >
      {/* detalhe */}
    </motion.div>
  )}
</AnimatePresence>
```

### Mostrar/ocultar elemento com animação
```tsx
// Aparece/some suavemente (botões Editar, tooltips, etc.)
<motion.div
  initial={false}
  animate={{ opacity: visivel ? 1 : 0, scale: visivel ? 1 : 0.85 }}
  transition={{ duration: 0.16, ease: 'easeOut' }}
  style={{ pointerEvents: visivel ? 'auto' : 'none' }}
>
```

### Feedback de clique em botões
```tsx
// Sempre nos botões interativos importantes
<motion.button
  whileTap={{ scale: 0.97 }}
  whileHover={{ scale: 1.01 }}
>
```

---

## 10. ESTRUTURA DE NAVEGAÇÃO ENTRE SUBPÁGINAS

O app usa **views internas** (não rotas) para navegar entre seções relacionadas.
O pattern é: um componente pai gerencia qual view está visível.

```tsx
// Exemplo: AccountPageClient
type AccountView = 'account' | 'personal-info' | 'payments' | 'history';

const [currentView, setCurrentView] = useState<AccountView>('account');
const [mountedViews, setMountedViews] = useState(new Set<AccountView>(['account']));

// Ao clicar em um card do menu → navega para a view
const handleAction = (action: string) => {
  if (action === 'navigate_personal_info') navigateTo('personal-info');
  if (action === 'navigate_payments') navigateTo('payments');
};

// Cada view é renderizada com display:none quando não ativa (sem remount)
<div className={currentView === 'personal-info' ? 'block' : 'hidden'}>
  <BlockRenderer config={personalInfoConfig} onAction={handleAction} />
</div>
```

**Importante:** O header recebe `showBack: currentView !== 'account'` para mostrar o botão voltar automaticamente nas subpáginas.

---

## 11. PADRÃO DE DADOS SENSÍVEIS (OLHO)

Qualquer dado que o usuário possa querer ocultar deve ter botão `Eye/EyeOff`:

```tsx
// Componente padrão para campo sensível
function SecretField({ label, visibleValue, maskedValue }: {
  label: string; visibleValue: string; maskedValue: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 font-mono tracking-wider">
          {visible ? visibleValue : maskedValue}
        </span>
        <button onClick={() => setVisible(v => !v)} className="text-gray-400 hover:text-gray-600 transition-colors">
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
```

**Campos que SEMPRE usam este padrão:** senha, CPF/CNPJ completo, número de cartão, CVV, saldo.

---

## 12. LAYOUT COM FOTO DE PERFIL / CAPA

Padrão usado nas telas de perfil de usuário e vendedor:

```tsx
// Capa escura no topo + avatar sobreposto
<div className="relative w-full h-40 bg-zinc-800 shrink-0">
  {/* Imagem de fundo */}
  <Image src={capaUrl} alt="Capa" fill className="object-cover opacity-50" sizes="100vw" />

  {/* Avatar centralizado, metade dentro / metade fora da capa */}
  <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
    <div className="relative">
      <Image
        src={fotoUrl} alt="Foto" width={112} height={112}
        className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-xl"
      />
      {/* Badge opcional de câmera para edição */}
      <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#5874f6] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
        <Camera className="w-4 h-4 text-white" />
      </button>
    </div>
  </div>
</div>

{/* Nome do usuário (badge pequeno abaixo do avatar) */}
<div className="mt-16 flex justify-center">
  <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-1 rounded-lg border border-gray-200 shadow-sm">
    {primeiroNome}
  </span>
</div>
```

---

## 13. BADGE / TAG DE VENDEDORA AUTORIZADA

Aparece apenas para usuários com `role === 'seller'` ou `isVendedor === true`:

```tsx
// Fundo rosa + nome + círculo de foto
<div className="bg-[#F5A5C2] rounded-2xl p-4 flex items-center gap-3">
  <div className="w-14 h-14 rounded-full border-2 border-white overflow-hidden shadow-md">
    <Image src={fotoUrl} alt="Foto" width={56} height={56} className="w-full h-full object-cover" />
  </div>
  <div>
    <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Vendedora Autorizada</span>
    <p className="text-base font-bold text-white">{nomeVendedora}</p>
  </div>
</div>
```

---

## 14. BOTÃO FLUTUANTE ARRASTÁVEL

Para funcionalidades opcionais que não devem ocupar espaço fixo na tela:

```tsx
// OBRIGATÓRIO: Renderizar via createPortal para não sofrer com overflow do container
import { createPortal } from 'react-dom';

// Dentro do componente:
{isClient && createPortal(
  <motion.div
    drag
    dragMomentum={false}
    dragElastic={0}
    onPointerDown={(e) => { posRef.current = { x: e.clientX, y: e.clientY }; }}
    onPointerUp={(e) => {
      const dist = Math.sqrt((e.clientX - posRef.current.x) ** 2 + (e.clientY - posRef.current.y) ** 2);
      if (dist < 8) onToggle(); // clique = distância pequena
    }}
    style={{ position: 'fixed', bottom: 96, right: 20, zIndex: 9999, touchAction: 'none' }}
    className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center bg-gray-800"
  >
    <Pencil className="w-5 h-5 text-white" />
    {/* "x" para fechar */}
    <button
      onClick={(e) => { e.stopPropagation(); onDismiss(); }}
      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-500 hover:bg-red-500 rounded-full flex items-center justify-center border-2 border-white"
    >
      <X className="w-2.5 h-2.5 text-white" strokeWidth={3} />
    </button>
  </motion.div>,
  document.body
)}
```

---

## 15. GRID DE ATALHOS (2 COLUNAS)

Padrão usado em Histórico de Atividades e telas de inventário:

```tsx
<div className="grid grid-cols-2 gap-3 w-full mb-6">
  {botoes.map((btn) => (
    <button
      key={btn.id}
      onClick={() => handleNavigation(btn.actionRoute)}
      className="flex items-center justify-center rounded-lg border border-gray-400 px-2 py-2 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
    >
      {btn.label}
    </button>
  ))}
</div>
```

---

## 16. FOOTER GLOBAL

O footer é fixo na parte inferior. **Nunca crie footer dentro de um bloco.**
O `pb-28` (112px) no container de scroll já garante que o conteúdo não fica escondido atrás do footer.

```
Altura do footer: h-20 (80px) + margem de segurança = pb-28 no container
Cor: bg-[#5874f6]
Ícones: cart, heart, sync (destaque central), verified, package-check
```

---

## 17. PADRÕES DE TELA COMPLETA — EXEMPLOS REAIS

### Tela de Menu (lista de navegação)
```
Header (cor: #5874f6) + título centralizado + lista de cards com ícone + título + subtítulo
Animação: entrada escalonada (stagger 0.1s por card)
```

### Tela de Informações Pessoais
```
Capa escura (h-40) + avatar circular (w-28) + badge do nome + lista de campos com label/valor/editar
Botão flutuante arrastável para ativar/desativar modo de edição
Scroll habilitado: maxHeight calc(100dvh - 4rem)
```

### Tela de Pagamentos
```
Ícone centralizado + título + lista de contas (card bg-gray-50) + toggle de saldo
Detalhe: AnimatePresence entre lista ↔ detalhe + cartão visual com gradiente colorido
Campos sensíveis: todos com Eye/EyeOff individual
```

### Tela de Histórico
```
Botão voltar + título + ícone central + grid 2x3 de atalhos + formulário de busca (query + período)
Estado inteligente: null = exemplo, [] = sem resultados, [...] = resultados reais
```

---

## 18. CONVENÇÕES PROIBIDAS

```
❌ <img>  →  sempre usar <Image /> de next/image
❌ font-black em textos de dados/valores
❌ border-2 border-black  →  usar border border-gray-200 ou border-gray-100
❌ min-h-screen sem overflow-y-auto  →  a página não vai rolar
❌ position: fixed dentro de overflow: auto  →  usar createPortal
❌ useState dentro de useEffect para montar portal  →  usar useSyncExternalStore
❌ onClick para detectar clique após drag  →  usar onPointerDown + onPointerUp com distância
❌ any, as any, @ts-ignore
❌ estilos inline para cores que existem no design system
```

---

## 19. EXEMPLO COMPLETO DE NOVA TELA

```tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Package } from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';

export const MinhaNovaTela: React.FC<BlockComponentProps> = ({ config, onAction }) => {
  const { data, style } = config;
  const [detalheAberto, setDetalheAberto] = useState<string | null>(null);

  return (
    <div
      className="w-full max-w-md mx-auto flex flex-col overflow-y-auto overscroll-contain pb-28"
      style={{ backgroundColor: style.bgColor ?? '#ffffff', maxHeight: 'calc(100dvh - 4rem)' }}
    >
      {/* Cabeçalho interno */}
      <div className="flex flex-col items-center pt-8 pb-6 px-5 gap-2">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <Package className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-base font-semibold text-gray-700">Minha Nova Tela</h1>
      </div>

      <AnimatePresence mode="wait">
        {!detalheAberto ? (
          <motion.div key="lista"
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}
            className="px-5 flex flex-col gap-4"
          >
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Itens
            </span>

            {/* Card de item */}
            <button
              onClick={() => setDetalheAberto('item-1')}
              className="w-full flex items-center gap-4 p-3.5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100 active:scale-[0.98] transition-all text-left shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-[#5874f6]/10 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-[#5874f6]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-semibold text-gray-700 truncate">Item Exemplo</span>
                <span className="text-xs text-gray-400 font-medium">Descrição curta</span>
              </div>
              <span className="text-sm font-semibold text-gray-600">R$ 99</span>
            </button>
          </motion.div>
        ) : (
          <motion.div key="detalhe"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.22 }}
            className="px-5 flex flex-col gap-5"
          >
            <button
              onClick={() => setDetalheAberto(null)}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 -ml-1 self-start"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>

            {/* Conteúdo do detalhe */}
            <div className="bg-gray-50 rounded-2xl p-5 flex flex-col gap-4 border border-gray-100">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Nome</span>
                <span className="text-sm font-medium text-gray-700">Item Exemplo</span>
              </div>
            </div>

            <div className="flex gap-3 pb-4">
              <button className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button className="flex-1 py-2.5 rounded-xl bg-[#5874f6] text-white text-sm font-semibold hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20">
                Confirmar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```
