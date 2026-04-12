# Botões Realistas — Referência de Estilo

---

## É UX ou UI?

**É os dois — mas a sensação física é 100% UI.**

| Camada | O que faz neste botão |
|--------|----------------------|
| **UI** (Interface) | Cores, sombras, borda arredondada, ícone de energia, tamanho do thumb, gradiente do trilho — tudo que você *vê* |
| **UX** (Experiência) | A decisão de usar um toggle ao invés de um checkbox; o label "Online / Offline" embaixo para confirmar o estado; o spring animation que imita física real |

A **sensação tátil** (parecer físico) vem da UI: `shadow-inner` no trilho simula profundidade, `shadow-md` no thumb cria elevação, e o `spring` do Framer Motion reproduz a inércia de uma alavanca real.

---

## O Código do Toggle (do AdminUserCard.tsx)

```tsx
// Estado
const [isOnline, setIsOnline] = useState(true);

// Trilho
<button
  onClick={() => setIsOnline(!isOnline)}
  className={cn(
    "relative w-14 h-8 rounded-full transition-colors duration-300 ease-in-out flex items-center px-1 shadow-inner",
    isOnline ? "bg-[#00c853]" : "bg-gray-200"
  )}
>
  {/* Thumb com spring physics */}
  <motion.div
    layout
    transition={{ type: "spring", stiffness: 700, damping: 30 }}
    className={cn(
      "w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center",
      isOnline ? "ml-auto" : "ml-0"
    )}
  >
    <Power size={12} className={isOnline ? "text-[#00c853]" : "text-gray-400"} strokeWidth={3} />
  </motion.div>
</button>

{/* Label confirmador de estado */}
<span className={cn(
  "text-[10px] font-bold uppercase tracking-wider transition-colors",
  isOnline ? "text-[#00c853]" : "text-gray-400"
)}>
  {isOnline ? 'Online' : 'Offline'}
</span>
```

### Por que parece físico?

| Técnica | Efeito visual/tátil |
|---------|---------------------|
| `shadow-inner` no trilho | Cria ilusão de encaixe côncavo — parece que o thumb *desliza dentro* de algo |
| `shadow-md` no thumb | Elevação — o thumb "flutua" sobre o trilho como um botão real |
| `motion.div layout` + `spring` | Inércia real: o thumb acelera, ultrapassa levemente e volta — exatamente como uma alavanca física |
| Ícone `<Power>` dentro do thumb | Reforça a leitura tátil — olhando, você já sabe que é para pressionar |
| Label abaixo | Feedback confirmatório — elimina dúvida sobre o estado atual |

---

## Prompt para Criar Botões Realistas

Use este prompt em qualquer modelo de IA (Claude, GPT, Gemini, v0.dev, etc.):

---

```
Crie um botão React interativo com aparência física/tátil usando Tailwind CSS e Framer Motion.

REGRAS DE ESTILO OBRIGATÓRIAS:
- Use shadow-inner no contêiner/trilho para simular profundidade côncava
- Use shadow-md ou shadow-lg no elemento clicável (thumb/knob) para simular elevação
- Animate com motion.div layout + transition type:"spring" stiffness:500-900 damping:25-35
- Adicione active:scale-95 ou active:shadow-sm para feedback de pressão
- Use border e border-black/10 para dar profundidade sutil à borda
- Adicione um label de texto pequeno abaixo confirmando o estado atual

VARIAÇÕES PARA CRIAR:

1. TOGGLE LIGA/DESLIGA
   - Trilho: w-14 h-8 rounded-full, shadow-inner
   - Thumb: w-6 h-6 rounded-full bg-white shadow-md
   - Cores: verde (#00c853) = ligado, cinza (#d1d5db) = desligado
   - Ícone dentro do thumb (Power, Check, etc.)

2. BOTÃO PRESSIONAR (Push Button)
   - Estado normal: shadow-[0_6px_0_rgba(0,0,0,0.25)] translateY(0)
   - Estado pressionado: shadow-[0_2px_0_rgba(0,0,0,0.25)] translateY(4px)
   - Borda inferior mais escura que a face do botão
   - Transition: duration-75 ease-in-out

3. BOTÃO DE RÁDIO FÍSICO (Radio Knob)
   - Círculo externo: sombra côncava shadow-inner bg-gray-200
   - Círculo interno: bg-white shadow-md scale menor quando inativo
   - Ao selecionar: círculo interno cresce com spring e muda de cor

4. DESLIZADOR (Slider Knob)
   - Trilho horizontal com shadow-inner
   - Knob circular com shadow-lg arrastável
   - Usando useDragControls do Framer Motion
   - Efeito de relevo no trilho com gradiente escuro→claro

5. ALAVANCA (Switch de Painel Elétrico)
   - Base retangular com shadow-inner
   - Haste com perspectiva CSS: rotateX(-20deg) → rotateX(20deg)
   - Cor de alerta quando ativo (laranja, vermelho)
   - Som simulado via navigator.vibrate([10]) no mobile

STACK RECOMENDADA:
- React + TypeScript
- Tailwind CSS
- Framer Motion (motion.div, layout, AnimatePresence)
- Lucide React para ícones dentro dos thumbs
- cn() (clsx + tailwind-merge) para classes condicionais

NÃO USE:
- CSS puro sem Tailwind
- Animações via CSS @keyframes (use Framer Motion)
- Cores hardcoded sem propósito semântico

ENTREGUE:
- Componente React completo e tipado
- Props: value, onChange, disabled?, label?
- Estado interno se não receber props externas
```

---

## Exemplos de Variações de Cores (sem alterar a mecânica)

| Tema | Trilho ativo | Thumb | Label |
|------|-------------|-------|-------|
| Verde elétrico (original) | `#00c853` | branco | `#00c853` |
| Azul Maryland | `#5874f6` | branco | `#5874f6` |
| Rosa vendedor | `#F5A5C2` | branco | `#e879a0` |
| Âmbar alerta | `#f59e0b` | branco | `#d97706` |
| Vermelho perigo | `#ef4444` | branco | `#dc2626` |
| Preto premium | `#111827` | `#f3f4f6` | `#6b7280` |

---

## Por Que Funciona Psicologicamente

O cérebro humano reconhece **affordances físicas** — pistas visuais que sugerem como interagir com um objeto. Sombras e gradientes comunicam:

- **Côncavo** (shadow-inner) → "pressione aqui dentro"
- **Elevado** (shadow-md) → "isso pode ser movido/deslizado"  
- **Spring animation** → memória muscular de objetos reais

É o mesmo princípio dos botões de teclado mecânico, interruptores de luz industriais e botões de elevador — design industrial traduzido para pixels.
