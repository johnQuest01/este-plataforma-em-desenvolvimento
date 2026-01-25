# 🗑️ SISTEMA DE GERENCIAMENTO DE BANCO DE DADOS

## 📋 VISÃO GERAL

Sistema completo para gerenciar dados do aplicativo, incluindo:
- **Deletar produtos individuais**
- **Deletar categorias completas** (com todos produtos)
- **Resetar tela inicial** (remove seções dinâmicas do CMS)
- **Limpar banco de dados completo** (reset total)
- **Limpar localStorage** (dados do navegador)

---

## 🎯 ACESSO AO PAINEL

### Via Dashboard:
1. Acesse `/dashboard`
2. Clique no botão **⚙️** (canto superior direito)
3. Clique em **🗑️ Gerenciar Dados**

### Via URL Direta:
- Acesse: `/admin/database`

---

## 🛠️ FUNÇÕES DISPONÍVEIS

### 1. **Deletar Produto Individual**
```typescript
deleteProductAction(productId: string)
```

**O que faz:**
- Remove um produto específico do banco
- Remove automaticamente todas as variantes (cascade delete)
- Mantém a seção de categoria na Home

**Quando usar:**
- Produto cadastrado incorretamente
- Produto descontinuado
- Limpeza pontual de estoque

---

### 2. **Deletar Categoria Completa**
```typescript
deleteCategoryAction(category: string)
```

**O que faz:**
- Remove TODOS os produtos da categoria
- Remove automaticamente todas as variantes
- Remove o bloco da categoria da tela inicial
- Atualiza o UIConfig automaticamente

**Fluxo Interno:**
```
1. Busca todos produtos WHERE category = "X"
2. Deleta todos produtos encontrados
3. Remove bloco "cat_section_X" do UIConfig
4. Revalida páginas (/dashboard, /inventory, /)
```

**Quando usar:**
- Mudança de nicho de negócio
- Categoria criada por erro
- Limpeza de categorias antigas

**Exemplo:**
```typescript
// Deleta categoria "Modinha" e todos seus produtos
const result = await deleteCategoryAction("Modinha");
// result = { success: true, deletedCount: 5 }
```

---

### 3. **Resetar Tela Inicial**
```typescript
resetHomeLayoutAction()
```

**O que faz:**
- Remove TODAS as seções dinâmicas criadas pelo CMS
- Restaura o layout para `INITIAL_BLOCKS`
- **MANTÉM todos os produtos no banco**

**Quando usar:**
- Layout da Home está bagunçado
- Quer reorganizar seções do zero
- Testar comportamento de criação automática

**⚠️ IMPORTANTE:**
- Produtos continuam no banco
- Ao cadastrar novo produto, a seção será recriada

---

### 4. **Limpar Banco de Dados Completo**
```typescript
resetDatabaseAction()
```

**O que faz:**
- ❌ Deleta TODOS os produtos
- ❌ Deleta TODAS as variantes
- ❌ Deleta TODOS os pedidos
- ❌ Deleta TODOS os itens de produção
- ❌ Deleta TODAS as variações de produção
- ❌ Reset do UIConfig para INITIAL_BLOCKS

**Ordem de Execução:**
```
1. OrderItem.deleteMany()
2. Order.deleteMany()
3. ProductionItem.deleteMany()
4. Variation.deleteMany()
5. ProductionOrder.deleteMany()
6. ProductVariant.deleteMany()
7. Product.deleteMany()
8. UIConfig.upsert({ layout: INITIAL_BLOCKS })
```

**Retorna:**
```typescript
{
  success: true,
  stats: {
    products: 10,
    variants: 45,
    orders: 3,
    productionItems: 2
  }
}
```

**Quando usar:**
- Reset completo do sistema
- Migração de dados
- Ambiente de desenvolvimento/testes

**⚠️ ATENÇÃO:**
- **IRREVERSÍVEL!**
- Perde TODOS os dados
- Use com extrema cautela

---

### 5. **Limpar LocalStorage**
```typescript
localStorage.clear()
```

**O que faz:**
- Remove TODOS os dados salvos no navegador
- Dados de login
- Preferências do usuário
- Cache local

**Quando usar:**
- Problemas de login
- Dados corrompidos no navegador
- Testar comportamento de primeiro acesso

**⚠️ NOTA:**
- Apenas lado do cliente (navegador)
- Não afeta o banco de dados

---

## 📊 INTERFACE DO PAINEL

### Estrutura Visual:

```
┌─────────────────────────────────────┐
│  ⚠️ PAINEL DE GERENCIAMENTO         │
│  ATENÇÃO: Ações irreversíveis       │
└─────────────────────────────────────┘

┌──────────────────┬──────────────────┐
│ 📊 Resetar Tela  │ 💾 Limpar Local  │
│    Inicial       │    Storage       │
└──────────────────┴──────────────────┘

┌─────────────────────────────────────┐
│ 🔥 LIMPAR BANCO DE DADOS COMPLETO   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📦 PRODUTOS POR CATEGORIA           │
│                                      │
│ 📁 Modinha (3 produtos)  [🗑️ Del]   │
│   ├─ Blusa Rosa          [🗑️]      │
│   ├─ Calça Jeans         [🗑️]      │
│   └─ Vestido Azul        [🗑️]      │
│                                      │
│ 📁 Inverno (5 produtos)  [🗑️ Del]   │
│   ├─ Casaco              [🗑️]      │
│   └─ ...                            │
└─────────────────────────────────────┘
```

---

## 🔒 SEGURANÇA

### Confirmação de Ações:

Todas as ações destrutivas exigem **confirmação em modal**:

```
┌───────────────────────────────────┐
│  ⚠️ Confirmar Ação                │
│                                    │
│  Tem certeza que deseja deletar   │
│  a categoria "Modinha" e TODOS    │
│  os seus produtos?                │
│                                    │
│  [ Cancelar ]  [ Confirmar ]      │
└───────────────────────────────────┘
```

### Mensagens de Alerta:

- ✅ Sucesso: "Produto deletado com sucesso!"
- ✅ Categoria: "Categoria 'X' deletada! 5 produtos removidos."
- ❌ Erro: "Erro: [mensagem de erro detalhada]"

---

## 🔄 INTEGRAÇÃO COM CMS DINÂMICO

### Como funciona:

1. **Ao deletar produto:**
   - Produto removido do banco
   - Seção de categoria PERMANECE na Home
   - Se era o último produto, mostra "Nenhum produto nesta categoria"

2. **Ao deletar categoria:**
   - Todos produtos removidos
   - Bloco removido do UIConfig
   - Home Page atualizada automaticamente
   - Revalidação de cache (`revalidatePath`)

3. **Ao resetar layout:**
   - UIConfig resetado para `INITIAL_BLOCKS`
   - Seções dinâmicas desaparecem
   - Produtos continuam no banco
   - Ao cadastrar novo produto, seção é recriada

---

## 📁 ARQUIVOS MODIFICADOS

### Backend:
```
app/actions/product.ts
├─ deleteProductAction()
├─ deleteCategoryAction()
├─ resetDatabaseAction()
└─ resetHomeLayoutAction()
```

### Frontend:
```
components/admin/DatabaseManagementPanel.tsx
└─ Interface completa de gerenciamento

app/admin/database/page.tsx
└─ Página administrativa

app/dashboard/page.tsx
└─ Botão de acesso ao painel
```

### Database:
```
prisma/schema.prisma
├─ Product.category (campo)
├─ @@index([category])
└─ onDelete: Cascade (ProductVariant)
```

---

## 🧪 CASOS DE TESTE

### Teste 1: Deletar Produto
```typescript
// 1. Cadastre um produto
// 2. Vá para /admin/database
// 3. Clique no ícone 🗑️ do produto
// 4. Confirme
// ✅ Produto sumiu da lista
// ✅ Seção permanece na Home
```

### Teste 2: Deletar Categoria
```typescript
// 1. Cadastre 3 produtos na categoria "Teste"
// 2. Verifique que a seção "Teste" aparece na Home
// 3. Vá para /admin/database
// 4. Clique em "Deletar Categoria" do "Teste"
// 5. Confirme
// ✅ Todos 3 produtos deletados
// ✅ Seção "Teste" sumiu da Home
```

### Teste 3: Resetar Layout
```typescript
// 1. Cadastre produtos em várias categorias
// 2. Vá para /admin/database
// 3. Clique em "Resetar Tela Inicial"
// 4. Confirme
// 5. Recarregue /dashboard
// ✅ Apenas blocos originais aparecem
// ✅ Produtos ainda existem no banco
// 6. Cadastre novo produto
// ✅ Seção é recriada automaticamente
```

### Teste 4: Limpar Banco Completo
```typescript
// 1. Cadastre vários produtos
// 2. Vá para /admin/database
// 3. Clique em "LIMPAR BANCO DE DADOS COMPLETO"
// 4. Confirme (modal vermelho de alerta)
// ✅ Todas tabelas limpas
// ✅ Estatísticas exibidas
// ✅ Layout resetado
```

---

## 🚨 ERROS COMUNS

### Erro: "Produto não encontrado"
**Causa:** Produto já foi deletado  
**Solução:** Recarregue a página

### Erro: "Categoria não possui produtos"
**Causa:** Todos produtos já foram deletados  
**Solução:** A categoria é deletada apenas se houver produtos

### Erro: "UIConfig não encontrado"
**Causa:** Primeira execução do sistema  
**Solução:** Sistema cria automaticamente ao salvar primeiro produto

---

## 💡 BOAS PRÁTICAS

### ✅ FAÇA:
- Sempre confirme antes de deletar
- Use "Resetar Layout" antes de "Limpar Banco" se quiser testar
- Faça backup dos dados antes de operações destrutivas
- Teste em ambiente de desenvolvimento primeiro

### ❌ NÃO FAÇA:
- Deletar categorias em produção sem backup
- Usar "Limpar Banco" em ambiente de produção
- Deletar produtos com pedidos ativos (verificar antes)
- Executar múltiplas deleções simultâneas

---

## 🎯 ROADMAP FUTURO

### Melhorias Planejadas:
- [ ] Soft delete (marcar como deletado ao invés de remover)
- [ ] Histórico de deleções
- [ ] Restaurar produtos deletados
- [ ] Exportar dados antes de deletar
- [ ] Confirmação com senha para ações críticas
- [ ] Logs de auditoria
- [ ] Filtro de produtos para deleção em massa

---

## 📞 SUPORTE

**Em caso de dúvidas ou problemas:**
1. Verifique os logs do console
2. Revise a documentação
3. Teste em ambiente de desenvolvimento
4. Entre em contato com o administrador do sistema

---

**Desenvolvido com 💜 para gerenciamento eficiente de dados**
