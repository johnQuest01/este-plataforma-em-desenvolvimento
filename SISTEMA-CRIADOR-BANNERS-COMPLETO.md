# 🎨 Sistema de Criador de Banners - IMPLEMENTADO!

## 📋 Visão Geral

Sistema **Full Stack** completo para criar banners com proporções rígidas (Aspect Ratios) na Dashboard.

## 🏗️ Arquitetura Implementada

### **Stack Tecnológica:**
```
✅ Next.js 16 (App Router + Server Actions)
✅ React 19 (Client Components)
✅ Tailwind 4 (Utility-first CSS)
✅ Zod (Validação de Schema)
✅ Prisma (ORM + PostgreSQL)
✅ Framer Motion (Animações)
```

---

## 📦 Camadas Implementadas

### **1. DATABASE LAYER (Prisma Schema)**

#### **Arquivo:** `prisma/schema.prisma`

```prisma
model Banner {
  id           String   @id @default(cuid())
  title        String
  mediaType    String   // 'image' ou 'video'
  mediaUrl     String   @db.Text
  aspectRatio  String   // '16/9', '1/1', '4/5', '9/16'
  orderIndex   Int      @default(0)
  isVisible    Boolean  @default(true)
  linkUrl      String?
  description  String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([orderIndex])
  @@index([isVisible])
}
```

**Campos:**
- `id` - Identificador único (CUID)
- `title` - Título do banner
- `mediaType` - Tipo: 'image' ou 'video'
- `mediaUrl` - URL da mídia (suporta Base64)
- `aspectRatio` - Proporção: '16/9', '1/1', '4/5', '9/16'
- `orderIndex` - Ordem de exibição
- `isVisible` - Visibilidade (soft delete)
- `linkUrl` - Link de destino (opcional)
- `description` - Descrição (opcional)

**Update no UIConfig:**
```prisma
model UIConfig {
  dashboardLayout Json? // 🎨 NOVO: Layout da dashboard com banners
}
```

---

### **2. VALIDATION LAYER (Zod Schemas)**

#### **Arquivo:** `schemas/blocks/banner-creator-schema.ts`

```typescript
export const BannerCreatorSchema = z.object({
  title: z.string().min(3).max(100),
  mediaType: z.enum(['image', 'video']),
  aspectRatio: z.enum(['16/9', '1/1', '4/5', '9/16']),
  file: z.instanceof(File)
    .refine(size <= 10MB)
    .refine(validFormat),
  linkUrl: z.string().url().optional(),
  description: z.string().max(500).optional(),
});
```

**Metadados de Aspect Ratios:**
```typescript
export const ASPECT_RATIO_METADATA = {
  '16/9': {
    label: 'Full Horizontal',
    description: 'Desktop / Topo',
    icon: '🖥️',
    tailwindClass: 'aspect-[16/9]',
  },
  '1/1': {
    label: 'Quadrado',
    description: 'Feed / Stories',
    icon: '📱',
    tailwindClass: 'aspect-square',
  },
  '4/5': {
    label: 'Retrato',
    description: 'Vertical Médio (70% tela)',
    icon: '📲',
    tailwindClass: 'aspect-[4/5]',
  },
  '9/16': {
    label: 'Full Stories',
    description: 'Tela Cheia Vertical',
    icon: '📱',
    tailwindClass: 'aspect-[9/16]',
  },
};
```

---

### **3. SERVER ACTIONS LAYER**

#### **Arquivo:** `app/actions/banner.ts`

**Actions Implementadas:**

1. **`saveBannerBlock(formData: FormData)`**
   - ✅ Valida dados com Zod
   - ✅ Converte File para Base64
   - ✅ Upload via `uploadImageToCloud()`
   - ✅ Salva no banco de dados
   - ✅ Calcula `orderIndex` automaticamente
   - ✅ Revalida cache (`/dashboard` e `/`)
   - ✅ Retorna `{ success, message, data }`

2. **`getBannersAction()`**
   - ✅ Lista banners visíveis
   - ✅ Ordenados por `orderIndex`
   - ✅ Retorna `BannerData[]`

3. **`deleteBannerBlock(bannerId: string)`**
   - ✅ Valida ID com Zod
   - ✅ Remove do banco
   - ✅ Revalida cache
   - ✅ Retorna feedback de sucesso

4. **`toggleBannerVisibility(bannerId: string)`**
   - ✅ Alterna visibilidade (soft delete)
   - ✅ Revalida cache

5. **`reorderBanners(bannerIds: string[])`**
   - ✅ Atualiza ordem de múltiplos banners
   - ✅ Usa `Promise.all` para performance

---

### **4. FRONTEND LAYER (React Components)**

#### **Arquivo:** `components/builder/blocks/BannerBuilderForm.tsx`

**Componente Independente** (pode ser usado em qualquer Modal/Dialog)

**Funcionalidades:**

1. **Formulário Completo:**
   - ✅ Input de Título (validação min 3 chars)
   - ✅ Toggle Image/Video (botões visuais)
   - ✅ Seletor de Aspect Ratio (4 opções com ícones)
   - ✅ Dropzone para upload (drag & drop)
   - ✅ Link de destino (opcional)
   - ✅ Descrição (opcional, max 500 chars)

2. **"Celular Virtual" (Live Preview):**
   ```typescript
   <div className="bg-gray-900 rounded-[2.5rem] border-[8px] border-gray-800">
     <div className="aspect-[9/19.5]"> {/* Proporção de tela mobile */}
       <Image
         src={previewUrl}
         className={ASPECT_RATIO_METADATA[aspectRatio].tailwindClass}
         className="object-cover" // ✨ Crucial: mostra exatamente o crop
       />
     </div>
   </div>
   ```

3. **Feedback Visual:**
   - ✅ Badge de Aspect Ratio no preview
   - ✅ Informações do arquivo (nome, tamanho)
   - ✅ Validação em tempo real
   - ✅ Loading state ao submeter
   - ✅ Mensagens de erro

---

### **5. INTEGRATION LAYER**

#### **Arquivo:** `components/builder/ui/ProductManagementPopup.tsx`

**Integração Implementada:**

1. **Novo Estado:**
```typescript
const [showBannerBuilder, setShowBannerBuilder] = useState(false);
```

2. **Botão "Criar Novo Banner":**
```typescript
<button onClick={() => setShowBannerBuilder(true)}>
  <ImagePlus /> Criar Novo Banner
</button>
```

3. **Modal do Banner Builder:**
```typescript
{showBannerBuilder && (
  <motion.div>
    <BannerBuilderForm
      onSuccess={handleBannerCreated}
      onCancel={() => setShowBannerBuilder(false)}
    />
  </motion.div>
)}
```

4. **Handler de Sucesso:**
```typescript
const handleBannerCreated = () => {
  setShowBannerBuilder(false);
  alert('✅ Banner criado com sucesso!');
  onProductDeleted?.(); // Recarrega dashboard
};
```

---

## 🗄️ Migração do Banco de Dados

### **Executar Migração:**

```bash
# Criar migração
npx prisma migrate dev --name add_banner_model

# Gerar Prisma Client
npx prisma generate
```

### **Alternativa (Se usar Vercel):**
```bash
# Deploy automático da migração
npx prisma migrate deploy
```

---

## 🎨 UX/UI do Sistema

### **Fluxo Completo:**

```
1️⃣ Usuário clica em "Criar Novo Banner"
   ↓
2️⃣ Modal abre com formulário à esquerda + preview à direita
   ↓
3️⃣ Usuário preenche:
   - Título
   - Tipo (Imagem/Vídeo)
   - Proporção (16:9, 1:1, 4:5, 9:16)
   - Upload de arquivo (drag & drop)
   ↓
4️⃣ Preview atualiza EM TEMPO REAL no "celular virtual"
   - Mostra EXATAMENTE como ficará o crop
   - Aplica aspect-ratio selecionado
   - object-cover para corte inteligente
   ↓
5️⃣ Usuário clica "Salvar Banner"
   ↓
6️⃣ Loading state (spinner)
   ↓
7️⃣ Server Action:
   - Valida com Zod
   - Converte para Base64
   - Faz upload
   - Salva no banco
   - Revalida cache
   ↓
8️⃣ Modal fecha + Toast de sucesso
   ↓
9️⃣ Dashboard recarrega automaticamente com novo banner
```

---

## 📊 Aspect Ratios Disponíveis

### **16:9 - Full Horizontal** 🖥️
```
┌─────────────────────────────────┐
│                                 │
│         BANNER AQUI             │
│                                 │
└─────────────────────────────────┘

Uso: Desktop, Topo de página
Tela: Largura total, altura menor
```

### **1:1 - Quadrado** 📱
```
┌─────────────────┐
│                 │
│  BANNER AQUI    │
│                 │
└─────────────────┘

Uso: Feed, Stories, Instagram
Tela: Quadrado perfeito
```

### **4:5 - Retrato** 📲
```
┌─────────────┐
│             │
│             │
│   BANNER    │
│    AQUI     │
│             │
│             │
└─────────────┘

Uso: Vertical médio (70% da tela)
Tela: Boa para scroll vertical
```

### **9:16 - Full Stories** 📱
```
┌───────┐
│       │
│       │
│       │
│BANNER │
│ AQUI  │
│       │
│       │
│       │
└───────┘

Uso: Tela cheia vertical (Instagram/TikTok)
Tela: Ocupa 100% altura mobile
```

---

## 🔒 Validações Implementadas

### **Client-Side (React):**
```typescript
- title: min 3 chars, max 100
- file: obrigatório, max 10MB
- fileType: JPEG, PNG, WebP, GIF, MP4, WebM
- linkUrl: URL válida (opcional)
- description: max 500 chars (opcional)
```

### **Server-Side (Zod + Prisma):**
```typescript
- Zod valida TODOS os campos antes de processar
- Prisma garante tipos no banco
- Revalidação automática de cache
```

---

## 🚀 Como Testar

### **1. Executar Migração:**
```bash
cd "c:\Users\Bruno\editando-sistema-global-comercio"
npx prisma migrate dev --name add_banner_model
npx prisma generate
```

### **2. Reiniciar Servidor:**
```bash
# Se já estiver rodando, o Next.js vai recarregar automaticamente
# Caso contrário:
npm run dev
```

### **3. Acessar Dashboard:**
```
http://localhost:3000/dashboard
```

### **4. Abrir Painel Admin:**
```
Clique no ícone 🪄 (Wand2) no canto superior direito
Clique em "⚙️ Painel Admin"
```

### **5. Abrir Gerenciar Produtos:**
```
(Depende de onde está o botão no seu admin)
```

### **6. Criar Banner:**
```
1. Clique em "Criar Novo Banner" (botão azul/cyan)
2. Preencha título: "Promoção Verão"
3. Selecione tipo: "Imagem"
4. Escolha proporção: "4/5" (Retrato)
5. Faça upload de uma imagem
6. Veja preview no celular virtual →
7. Clique em "Salvar Banner"
```

---

## 🎯 Features Implementadas

### **✅ Formulário:**
- [x] Input de título (validação)
- [x] Toggle Image/Video (botões visuais)
- [x] Seletor de Aspect Ratio (4 opções com ícones)
- [x] Dropzone (drag & drop + click)
- [x] Preview de arquivo selecionado
- [x] Botão de limpar arquivo
- [x] Link de destino (opcional)
- [x] Descrição (opcional)
- [x] Loading state
- [x] Mensagens de erro

### **✅ Preview "Celular Virtual":**
- [x] Moldura de smartphone (rounded-[2.5rem])
- [x] Notch superior (entalhes)
- [x] Aspect ratio EXATO da opção selecionada
- [x] `object-cover` para crop inteligente
- [x] Badge de proporção no canto
- [x] Informações do banner (tipo, proporção, título)
- [x] Botão home indicador (na base)

### **✅ Backend:**
- [x] Server Action `saveBannerBlock`
- [x] Server Action `getBannersAction`
- [x] Server Action `deleteBannerBlock`
- [x] Server Action `toggleBannerVisibility`
- [x] Server Action `reorderBanners`
- [x] Validação Zod em todas as actions
- [x] Upload de mídia (Base64)
- [x] Persistência no PostgreSQL
- [x] Revalidação automática de cache

### **✅ Integração:**
- [x] Botão no ProductManagementPopup
- [x] Modal overlay com BannerBuilderForm
- [x] Handler de sucesso
- [x] Feedback visual (toast/alert)

---

## 📁 Arquivos Criados/Modificados

### **Novos Arquivos:**
1. ✅ `schemas/blocks/banner-creator-schema.ts` - Schema Zod + metadados
2. ✅ `app/actions/banner.ts` - Server Actions
3. ✅ `components/builder/blocks/BannerBuilderForm.tsx` - Componente formulário

### **Arquivos Modificados:**
1. ✅ `prisma/schema.prisma` - Model Banner + UIConfig.dashboardLayout
2. ✅ `components/builder/ui/ProductManagementPopup.tsx` - Botão + Modal

---

## 🔧 Comandos Necessários

### **1. Migração do Banco:**
```bash
npx prisma migrate dev --name add_banner_model
```

**O que faz:**
- Cria tabela `Banner` no PostgreSQL
- Adiciona campo `dashboardLayout` em `UIConfig`
- Gera arquivo de migração em `prisma/migrations/`

### **2. Gerar Prisma Client:**
```bash
npx prisma generate
```

**O que faz:**
- Atualiza tipos TypeScript
- Adiciona `prisma.banner` ao client
- Garante type-safety

### **3. Verificar Status:**
```bash
npx prisma migrate status
```

---

## 🎨 Interface Visual

### **Botão no ProductManagementPopup:**
```
┌────────────────────────────────────┐
│  📦 Gerenciar Produtos             │
│  10 produtos • 3 categorias        │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ 🖼️ Criar Novo Banner          │ │ ← Botão azul/cyan
│  └──────────────────────────────┘ │
└────────────────────────────────────┘
```

### **Modal do Banner Builder:**
```
┌─────────────────────────────────────────────────────┐
│  🖼️ Criar Novo Banner                        [X]    │
│  Proporções rígidas para mobile perfeito            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  FORMULÁRIO (Esquerda)      PREVIEW (Direita)      │
│  ┌──────────────────┐      ┌──────────────┐        │
│  │ Título: [____]   │      │  📱 CELULAR  │        │
│  │ Tipo: ⚫ Imagem  │      │  ┌────────┐  │        │
│  │ Proporção:       │      │  │ BANNER │  │        │
│  │  🖥️ 16:9         │      │  │ PREVIEW│  │        │
│  │  📱 1:1          │      │  │  AQUI  │  │        │
│  │  📲 4:5 ✅       │      │  │        │  │        │
│  │  📱 9:16         │      │  └────────┘  │        │
│  │ Upload: [Drag]   │      │              │        │
│  └──────────────────┘      └──────────────┘        │
│                                                     │
│  [Cancelar]  [Salvar Banner]                       │
└─────────────────────────────────────────────────────┘
```

---

## 💡 Fluxo de Dados

### **Client → Server → Database:**

```typescript
// 1. Client submete formulário
<form onSubmit={handleSubmit}>
  ↓
// 2. Cria FormData
const formData = new FormData();
formData.append('title', 'Banner X');
formData.append('file', file);
  ↓
// 3. Chama Server Action
const result = await saveBannerBlock(formData);
  ↓
// 4. Server valida com Zod
const validated = BannerCreatorSchema.parse(data);
  ↓
// 5. Converte File → Base64
const base64 = await fileToBase64(file);
  ↓
// 6. Upload
const url = await uploadImageToCloud(base64, title);
  ↓
// 7. Salva no Prisma
await prisma.banner.create({ data: {...} });
  ↓
// 8. Revalida cache
revalidatePath('/dashboard');
  ↓
// 9. Retorna resultado
return { success: true, message: 'OK' };
  ↓
// 10. Client fecha modal + toast
onSuccess();
```

---

## 🧪 Testes de Validação

### **Teste 1: Título Curto**
```
Input: "ab"
Esperado: ❌ "Título deve ter no mínimo 3 caracteres"
```

### **Teste 2: Arquivo Grande**
```
Input: arquivo.jpg (15MB)
Esperado: ❌ "Arquivo deve ter no máximo 10MB"
```

### **Teste 3: Formato Inválido**
```
Input: documento.pdf
Esperado: ❌ "Formato inválido. Use JPEG, PNG..."
```

### **Teste 4: URL Inválida**
```
Input link: "not-a-url"
Esperado: ❌ "URL inválida"
```

### **Teste 5: Sucesso**
```
Input: Todos os campos válidos
Esperado: ✅ "Banner criado com sucesso!"
```

---

## 🔄 Próximos Passos (Fase 2)

### **Após Aprovação:**
- [ ] Listar banners criados na Dashboard
- [ ] Editar banner existente
- [ ] Deletar banner com confirmação
- [ ] Reordenar banners (drag & drop)
- [ ] Toggle visibilidade (olho aberto/fechado)
- [ ] Estatísticas de cliques (analytics)
- [ ] Cropper manual (ajuste fino da imagem)
- [ ] Filtros e efeitos (blur, brightness, contrast)

---

## 🚀 Status Atual

```
✅ Database Schema: CRIADO
✅ Zod Schemas: CRIADO
✅ Server Actions: IMPLEMENTADAS (5 actions)
✅ Frontend Component: CRIADO
✅ Integration: IMPLEMENTADA
⏳ Migração: AGUARDANDO EXECUÇÃO
⏳ Teste: AGUARDANDO USUÁRIO
```

---

## 📝 Checklist de Implementação

### **Backend:**
- [x] Model Banner no Prisma
- [x] Field dashboardLayout em UIConfig
- [x] Schema Zod completo
- [x] Action saveBannerBlock
- [x] Action getBannersAction
- [x] Action deleteBannerBlock
- [x] Action toggleBannerVisibility
- [x] Action reorderBanners
- [x] Validação de File
- [x] Upload de mídia
- [x] Revalidação de cache

### **Frontend:**
- [x] Componente BannerBuilderForm
- [x] Input de título
- [x] Toggle Image/Video
- [x] Seletor de Aspect Ratio (4 opções)
- [x] Dropzone (drag & drop)
- [x] Preview "Celular Virtual"
- [x] Aspect ratio no preview
- [x] object-cover no preview
- [x] Validação client-side
- [x] Loading states
- [x] Mensagens de erro
- [x] Botões de ação

### **Integração:**
- [x] Botão em ProductManagementPopup
- [x] Modal overlay
- [x] Handler de sucesso
- [x] Import do componente

---

## 🎉 SISTEMA COMPLETO IMPLEMENTADO!

**Status:** ✅ Código pronto, aguardando migração do banco.

**Próximo passo:** Executar comando de migração.
