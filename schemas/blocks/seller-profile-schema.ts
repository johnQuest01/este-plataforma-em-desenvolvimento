import { z } from 'zod';

export const SellerProfileBlockDataSchema = z.object({
  title: z.string().optional().default('Maryland Modas'),
  coverImageUrl: z.string().optional(),
  defaultAvatarUrl: z.string().optional(),
});

export type SellerProfileBlockDataType = z.infer<typeof SellerProfileBlockDataSchema>;

export const UpdateUserFieldSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório.'),
  field: z.enum(['name', 'email', 'whatsapp', 'address', 'document']),
  value: z.string().min(1, 'O valor não pode ser vazio.'),
});

export type UpdateUserFieldType = z.infer<typeof UpdateUserFieldSchema>;