// schemas/jeans-registration-schema.ts
import { z } from 'zod';

/** * Mapper para converter Decimal do Prisma para Number 
 * Evita erros de serialização no Server Action 
 */
export const decimalToNumber = (value: unknown): number => {
  return value ? Number(value.toString()) : 0;
};

export interface RegisteredProductResult {
  id: string;
  name: string;
  reference: string;
  imageUrl: string;
  price: number;
  totalQty: number;
  variations: {
    size: string;
    qty: number;
    color: string;
  }[];
}

export const LinkImageSchema = z.object({
  reference: z.string().min(1, "Referência obrigatória"),
  imageUrl: z.string().url("URL inválida"),
  storeSlug: z.string()
});

export const BulkTextSchema = z.object({
  rawText: z.string().min(1, "Texto vazio"),
  storeSlug: z.string()
});

export type LinkImageInput = z.infer<typeof LinkImageSchema>;
export type BulkTextInput = z.infer<typeof BulkTextSchema>;