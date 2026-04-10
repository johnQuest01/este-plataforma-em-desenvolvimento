import { z } from 'zod';

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export const UserRegistrationSchema = z.object({
  fullName: z.string().min(3, 'O nome completo deve ter pelo menos 3 caracteres.'),
  emailAddress: z.string().email('Formato de e-mail inválido.'),
  phoneNumber: z.string().min(10, 'O número de telefone é inválido.'),
  street: z.string().min(2, 'Informe o nome da rua ou avenida.'),
  addressNumber: z.string().optional().default(''),
  addressComplement: z.string().optional().default(''),
  district: z.string().min(2, 'Informe o bairro.'),
  city: z.string().min(2, 'Informe a cidade.'),
  state: z
    .string()
    .min(2, 'Informe a UF (2 letras).')
    .max(2, 'A UF deve ter 2 letras.')
    .transform((s) => s.trim().toUpperCase()),
  postalCode: z
    .string()
    .min(8, 'CEP inválido.')
    .transform((s) => onlyDigits(s).slice(0, 8)),
  documentType: z.enum(['CPF', 'CNPJ']),
  documentNumber: z.string().min(11, 'O documento é inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  registerAsSeller: z.boolean().optional().default(false),
});

export type UserRegistrationType = z.infer<typeof UserRegistrationSchema>;

/** Payload bruto antes dos transforms do Zod (entrada das server actions). */
export type UserRegistrationPayloadInput = z.input<typeof UserRegistrationSchema>;

export function buildFullAddressLine(data: z.infer<typeof UserRegistrationSchema>): string {
  const line1 = [data.street.trim(), data.addressNumber?.trim()].filter(Boolean).join(', ');
  const line2 = data.district.trim();
  const line3 = `${data.city.trim()} - ${data.state}`;
  const line4 = data.postalCode ? `CEP ${data.postalCode}` : '';
  return [line1, line2, line3, line4].filter(Boolean).join(' · ');
}
