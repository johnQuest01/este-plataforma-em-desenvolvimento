import { z } from 'zod';

// Schema for a single item parsed from text
export const SmartJeansItemSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  size: z.string().min(1, "Tamanho é obrigatório"),
  quantity: z.number().int().nonnegative("Quantidade inválida"),
  reference: z.string().min(1, "Referência é obrigatória"),
});

// Input for the Server Action
export const SmartBulkRegistrationSchema = z.object({
  storeSlug: z.string().min(1),
  rawText: z.string().optional(), // For logging or reprocessing
  items: z.array(SmartJeansItemSchema)
});

// Output type for the UI to render the card
export type RegisteredProductResult = {
  id: string;
  name: string;
  reference: string;
  totalStock: number;
  imageUrl: string;
  price: number;
  variations: {
    size: string;
    color: string;
    qty: number;
  }[];
};

export type SmartBulkRegistrationInput = z.infer<typeof SmartBulkRegistrationSchema>;