import { z } from 'zod';

export const UserPersonalInformationSchema = z.object({
  userIdentifier: z.string().min(1, "O identificador do usuário é obrigatório."),
  fullName: z.string().min(3, "O nome completo deve ter pelo menos 3 caracteres."),
  emailAddress: z.string().email("Formato de e-mail inválido."),
  phoneNumber: z.string().min(10, "O número de telefone é inválido."),
  physicalAddress: z.string().min(5, "O endereço deve ser preenchido corretamente."),
  documentNumber: z.string().min(11, "O documento é inválido."),
  documentType: z.enum(["CPF", "CNPJ"]),
  profilePictureUrl: z.string().url().optional().or(z.literal('')),
  backgroundImageUrl: z.string().url().optional().or(z.literal(''))
});

export type UserPersonalInformationType = z.infer<typeof UserPersonalInformationSchema>;

export const UpdateUserImageSchema = z.object({
  userIdentifier: z.string().min(1, "O identificador do usuário é obrigatório."),
  imageType: z.enum(["PROFILE", "BACKGROUND"]),
  imageUrl: z.string().url("A URL da imagem é inválida.")
});

export type UpdateUserImageType = z.infer<typeof UpdateUserImageSchema>;