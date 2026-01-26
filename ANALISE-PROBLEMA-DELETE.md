# 🔍 Análise: Problema ao Deletar Categorias e Produtos

## 🔴 Problema Identificado

O usuário relata que **não consegue deletar categorias e produtos** que foram cadastrados anteriormente, mesmo com o botão de delete presente.

---

## 🕵️ Investigação

### **1. Estrutura do Schema Prisma**

```prisma
model Product {
  id              String           @id @default(cuid())
  name            String
  category        String?          // ✅ Categoria é opcional
  // ...
  orderItems      OrderItem[]      // ⚠️ RELAÇÃO
  productionItems ProductionItem[] // ⚠️ RELAÇÃO
  variants        ProductVariant[] // ✅ onDelete: Cascade
}

model ProductVariant {
  id        String   @id @default(cuid())
  // ...
  product   Product  @relation(..., onDelete: Cascade) // ✅ OK
}

model OrderItem {
  id         String  @id
  productId  String
  product    Product @relation(...) // ❌ SEM onDelete: Cascade
}

model ProductionItem {
  productId String
  product   Product @relation(...) // ❌ SEM onDelete: Cascade
}
```

### **🔑 Causa Raiz**

**Produtos não podem ser deletados** se existirem:
1. ❌ **OrderItems** vinculados (pedidos)
2. ❌ **ProductionItems** vinculados (itens de produção)

O Prisma está **bloqueando a exclusão** por causa dessas foreign keys sem `onDelete: Cascade`.

---

## 💡 Soluções

### **Solução 1: Atualizar Schema Prisma (RECOMENDADO)**

Adicionar `onDelete: Cascade` nas relações:

```prisma
model OrderItem {
  id         String  @id @default(cuid())
  productId  String
  product    Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  // ...
}

model ProductionItem {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  // ...
}
```

**Requer migração:**
```bash
npx prisma migrate dev --name add-cascade-delete
```

---

### **Solução 2: Validação Zod + Tratamento de Erros (IMEDIATA)**

Adicionar validação e tratamento de erros específicos:

```typescript
// Em product.schema.ts
export const DeleteProductInputSchema = z.object({
  productId: z.string().cuid("ID inválido"),
});

export const DeleteCategoryInputSchema = z.object({
  category: z.string().min(1, "Categoria inválida"),
});
```

**Melhorar tratamento de erro:**

```typescript
// Em product.ts
export async function deleteProductAction(productId: string) {
  try {
    // Validar entrada
    DeleteProductInputSchema.parse({ productId });

    // Verificar se há pedidos vinculados
    const orderItems = await prisma.orderItem.count({
      where: { productId }
    });

    if (orderItems > 0) {
      return { 
        success: false, 
        error: `Este produto não pode ser deletado pois está vinculado a ${orderItems} pedido(s). Delete os pedidos primeiro.` 
      };
    }

    // Verificar se há itens de produção
    const productionItems = await prisma.productionItem.count({
      where: { productId }
    });

    if (productionItems > 0) {
      return { 
        success: false, 
        error: `Este produto não pode ser deletado pois está em ${productionItems} item(ns) de produção.` 
      };
    }

    // Deletar produto
    await prisma.product.delete({
      where: { id: productId }
    });

    return { success: true };
  } catch (error) {
    // Erro de FK (código P2003)
    if (error.code === 'P2003') {
      return { 
        success: false, 
        error: 'Este produto está vinculado a outros registros e não pode ser deletado.' 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}
```

---

### **Solução 3: Cascade Delete Manual (ALTERNATIVA)**

Deletar manualmente todas as relações:

```typescript
export async function deleteProductAction(productId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Deletar OrderItems
    await tx.orderItem.deleteMany({
      where: { productId }
    });

    // 2. Deletar ProductionItems
    await tx.productionItem.deleteMany({
      where: { productId }
    });

    // 3. Deletar Variantes (já tem cascade)
    // Automático

    // 4. Deletar Produto
    await tx.product.delete({
      where: { id: productId }
    });

    return { success: true };
  });
}
```

---

## 🎯 Recomendação

**Aplicar Solução 2 + Solução 3 IMEDIATAMENTE:**

1. ✅ Adicionar validação Zod
2. ✅ Adicionar cascade delete manual nas actions
3. ✅ Melhorar mensagens de erro
4. ⏰ (Futuro) Aplicar Solução 1 com migração

**Depois, aplicar Solução 1 (migração) quando possível.**

---

## 📊 Checklist de Correção

- [ ] Adicionar schemas Zod de validação
- [ ] Implementar cascade delete manual
- [ ] Melhorar mensagens de erro
- [ ] Testar delete de produto com pedidos vinculados
- [ ] Testar delete de categoria inteira
- [ ] (Futuro) Migração para adicionar onDelete: Cascade no schema

---

## 🚀 Próximos Passos

Vou aplicar **Solução 2 + Solução 3** agora:
1. Criar schemas Zod
2. Atualizar `deleteProductAction` com cascade manual
3. Atualizar `deleteCategoryAction` com validações
4. Melhorar UI para mostrar erros claros
