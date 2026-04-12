import { z } from 'zod';

// ─── Validações ───────────────────────────────────────────────────────────────

export const AddToSellerStockSchema = z.object({
  sellerId: z.string().min(1),
  items: z.array(z.object({
    productId:   z.string().min(1),
    variantId:   z.string(),       // "" = produto sem variação
    variantName: z.string(),       // ex: "Rosa | P | Aberto"
    quantity:    z.number().int().min(1),
  })).min(1, 'Selecione ao menos uma variação.'),
});

export const UpdateSellerStockSchema = z.object({
  sellerId:    z.string().min(1),
  productId:   z.string().min(1),
  variantId:   z.string(),
  quantity:    z.number().int().min(0),
});

export const GetSellerStockSchema = z.object({
  sellerId: z.string().min(1),
});

// ─── Tipos inferidos ──────────────────────────────────────────────────────────

export type AddToSellerStockInput  = z.infer<typeof AddToSellerStockSchema>;
export type UpdateSellerStockInput = z.infer<typeof UpdateSellerStockSchema>;

// ─── DTOs ─────────────────────────────────────────────────────────────────────

/** Variação de produto, parseada do campo `name` (formato: "nome|cor|tamanho|tipo") */
export interface ProductVariantDTO {
  id:          string;
  color:       string;
  size:        string;
  type:        string;
  price:       number;
  stock:       number;
  sku:         string | null;
  label:       string;  // "Cor · Tam · Tipo" pronto para exibir
}

/** Produto do catálogo Maryland (vem da tabela Product do admin) */
export interface MarylandCatalogProductDTO {
  id:          string;
  name:        string;
  description: string | null;
  price:       number;   // preço base
  reference:   string | null;
  category:    string | null;
  imageUrl:    string | null;
  totalStock:  number;   // soma do stock de todas as variações
  isAvailable: boolean;
  createdAt:   string;
  variants:    ProductVariantDTO[];
}

/** Item no estoque pessoal da vendedora */
export interface SellerInventoryItemDTO {
  id:          string;
  quantity:    number;
  productId:   string;
  productName: string;
  variantId:   string;   // "" = sem variação
  variantName: string;   // "Rosa | P | Aberto"
  price:       number;
  imageUrl:    string | null;
  updatedAt:   string;
}
