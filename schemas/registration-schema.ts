import { z } from 'zod';

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function isValidCpf(cpf: string): boolean {
  const d = onlyDigits(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== Number(d[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(d[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  return rest === Number(d[10]);
}

function isValidCnpj(cnpj: string): boolean {
  const d = onlyDigits(cnpj);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const calc = (s: string, weights: number[]) => {
    const sum = weights.reduce((acc, w, i) => acc + Number(s[i]) * w, 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  if (calc(d, w1) !== Number(d[12])) return false;
  if (calc(d, w2) !== Number(d[13])) return false;
  return true;
}

export const UserRegistrationSchema = z
  .object({
    fullName: z.string().min(3, 'O nome completo deve ter pelo menos 3 caracteres.'),
    emailAddress: z.string().email('Formato de e-mail inválido.'),
    /** WhatsApp com DDD — mínimo 10 dígitos (DDD + número). */
    phoneNumber: z
      .string()
      .transform((s) => onlyDigits(s))
      .pipe(z.string().min(10, 'Informe o WhatsApp com DDD (mínimo 10 dígitos).')),
    street: z.string().min(2, 'Informe o nome da rua ou avenida.'),
    addressNumber: z.string().optional().default(''),
    addressComplement: z.string().optional().default(''),
    district: z.string().min(2, 'Informe o bairro / vila.'),
    city: z.string().min(2, 'Informe a cidade.'),
    state: z
      .string()
      .min(2, 'Informe a UF (2 letras).')
      .max(2, 'A UF deve ter apenas 2 letras.')
      .transform((s) => s.trim().toUpperCase()),
    postalCode: z
      .string()
      .transform((s) => onlyDigits(s).slice(0, 8))
      .pipe(z.string().min(8, 'CEP inválido (8 dígitos).')),
    documentType: z.enum(['CPF', 'CNPJ']),
    documentNumber: z.string().min(11, 'O documento é inválido.'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
    /** true = vendedor(a) da plataforma; false = comprador(a) */
    registerAsSeller: z.boolean().optional().default(false),
    /** Nome da loja / empresa — usado ao registar como vendedor */
    storeName: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    const digits = onlyDigits(data.documentNumber);
    if (data.documentType === 'CPF') {
      if (digits.length !== 11) {
        ctx.addIssue({ code: 'custom', path: ['documentNumber'], message: 'CPF deve ter 11 dígitos.' });
      } else if (!isValidCpf(digits)) {
        ctx.addIssue({ code: 'custom', path: ['documentNumber'], message: 'CPF inválido.' });
      }
    } else {
      if (digits.length !== 14) {
        ctx.addIssue({ code: 'custom', path: ['documentNumber'], message: 'CNPJ deve ter 14 dígitos.' });
      } else if (!isValidCnpj(digits)) {
        ctx.addIssue({ code: 'custom', path: ['documentNumber'], message: 'CNPJ inválido.' });
      }
    }
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
