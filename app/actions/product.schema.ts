import { z } from 'zod';

// --- SCHEMAS DE VALIDAÇÃO (ZOD) ---

// Schema base para variante (Híbrido: Aceita Input da UI e Output do Banco)
export const ProductVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  
  // ATUALIZAÇÃO: Aceita string (do input mask) OU number (do banco já convertido)
  price: z.union([z.string(), z.number()]).nullable().optional(),
  
  // Compatibilidade UI/Banco para estoque
  stock: z.number().int().nonnegative().default(0), 
  qty: z.number().int().nonnegative().default(0), 

  sku: z.string().nullable().optional(),
  images: z.array(z.string()).default([]),
  color: z.string().optional(),
  size: z.string().optional(),
  type: z.string().optional(),
});

// Schema de Dados do Produto (Output para o Frontend)
export const ProductDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  
  // ATUALIZAÇÃO: Agora é estritamente number para facilitar cálculos no front
  price: z.number(),
  
  // 🧱 CMS DINÂMICO: Categoria do produto
  category: z.string().nullable().optional(),
  
  imageUrl: z.string().nullable(),
  isVisible: z.boolean(),
  stock: z.number(),
  storeId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  
  variants: z.array(ProductVariantSchema),
  
  // Campos opcionais para compatibilidade com UI
  mainImage: z.string().optional(),
  tag: z.string().optional(),
  imageColor: z.string().optional(),
});

// Schema de Entrada para Criação (Input do Formulário)
export const CreateProductInputSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  
  // O preço principal vem como string do input mask (ex: "R$ 100,00")
  price: z.string().min(1, "Preço é obrigatório"),
  
  // 🧱 CMS DINÂMICO: Categoria para auto-geração de seções na Home
  category: z.string().min(1, "Categoria é obrigatória"),
  
  variations: z.array(ProductVariantSchema), 
  visibility: z.string(),
  image: z.string().optional(),
  storeId: z.string().optional(),
});

// Tipos inferidos automaticamente
export type ProductData = z.infer<typeof ProductDataSchema>;
export type ProductVariantData = z.infer<typeof ProductVariantSchema>;
export type CreateProductInput = z.infer<typeof CreateProductInputSchema>;

// --- SCHEMAS DE VALIDAÇÃO PARA DELETE ---

/**
 * Schema para validar exclusão de produto individual
 */
export const DeleteProductInputSchema = z.object({
  productId: z.string().cuid("ID do produto inválido"),
});

/**
 * Schema para validar exclusão de categoria completa
 */
export const DeleteCategoryInputSchema = z.object({
  category: z.string().min(1, "Nome da categoria é obrigatório"),
});

export type DeleteProductInput = z.infer<typeof DeleteProductInputSchema>;
export type DeleteCategoryInput = z.infer<typeof DeleteCategoryInputSchema>;