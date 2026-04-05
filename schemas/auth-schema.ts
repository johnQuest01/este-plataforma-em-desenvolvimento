import { z } from 'zod';

export const UserLoginSchema = z.object({
  documentOrEmail: z.string().min(1, "O E-mail ou Documento é obrigatório."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres.")
});

export type UserLoginType = z.infer<typeof UserLoginSchema>;