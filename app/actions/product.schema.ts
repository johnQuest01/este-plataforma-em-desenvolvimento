import { z } from 'zod';

// --- SCHEMAS DE VALIDAÇÃO (ZOD) ---

// Schema base para variante (usado tanto na criação quanto na leitura)
export const ProductVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  price: z.string().nullable().optional(),
  
  // CORREÇÃO: 'stock' é o campo do banco, mas 'qty' é o input da UI.
  // Permitimos ambos, mas garantimos que um deles exista ou tenha default.
  stock: z.number().int().nonnegative().default(0), 
  qty: z.number().int().nonnegative().default(0), // Adicionado para compatibilidade com UI

  sku: z.string().nullable().optional(),
  images: z.array(z.string()).default([]),
  color: z.string().optional(),
  size: z.string().optional(),
  type: z.string().optional(),
});

export const ProductDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.string(),
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

// Schema de Entrada para Criação (O que vem do formulário)
export const CreateProductInputSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.string().min(1, "Preço é obrigatório"),
  // Aqui usamos o ProductVariantSchema que agora aceita 'qty'
  variations: z.array(ProductVariantSchema), 
  visibility: z.string(),
  image: z.string().optional(),
  storeId: z.string().optional(),
});

export type ProductData = z.infer<typeof ProductDataSchema>;
export type ProductVariantData = z.infer<typeof ProductVariantSchema>;
export type CreateProductInput = z.infer<typeof CreateProductInputSchema>;