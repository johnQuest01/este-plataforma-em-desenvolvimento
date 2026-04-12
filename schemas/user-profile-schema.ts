import { z } from 'zod';

export const UserProfileUpdateSchema = z.object({
  userId: z.string().min(1, 'O ID do utilizador é obrigatório.'),
  fullName: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.').optional(),
  emailAddress: z.string().email('Formato de e-mail inválido.').optional(),
  phoneNumber: z.string().min(10, 'Número de telefone inválido.').optional(),
  storeAddress: z.string().min(5, 'Endereço muito curto.').optional(),
  documentNumber: z.string().min(11, 'Documento inválido.').optional(),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.').optional(),
});

export type UserProfileUpdateType = z.infer<typeof UserProfileUpdateSchema>;

export const PaymentMethodSchema = z.object({
  cardholderName: z.string().min(3, 'Nome impresso no cartão é obrigatório.'),
  cardNumber: z.string().length(16, 'O número do cartão deve ter 16 dígitos.'),
  expirationDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Use o formato MM/AA.'),
  securityCode: z.string().min(3).max(4, 'CVV inválido.'),
  institutionName: z.string().min(2, 'Nome da instituição é obrigatório.'),
  accountType: z.enum(['credit', 'debit', 'pix']),
});

export type PaymentMethodType = z.infer<typeof PaymentMethodSchema>;