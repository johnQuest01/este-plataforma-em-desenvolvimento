import { z } from 'zod';

export const UserRegistrationSchema = z.object({
  fullName: z.string().min(3, "O nome completo deve ter pelo menos 3 caracteres."),
  emailAddress: z.string().email("Formato de e-mail inválido."),
  phoneNumber: z.string().min(10, "O número de telefone é inválido."),
  physicalAddress: z.string().min(5, "O endereço deve ser preenchido corretamente."),
  documentType: z.enum(["CPF", "CNPJ"]),
  documentNumber: z.string().min(11, "O documento é inválido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres.")
});

export type UserRegistrationType = z.infer<typeof UserRegistrationSchema>;