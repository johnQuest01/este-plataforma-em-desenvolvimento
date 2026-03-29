import { z } from "zod";

export const AccountUpdateSchema = z.object({
  userIdentifier: z.string().cuid("Identificador de usuário inválido."),
  userName: z.string().min(2, "O nome deve conter pelo menos 2 caracteres.").nullable().optional(),
  userEmail: z.string().email("Formato de email inválido.").nullable().optional(),
  userDocument: z.string().min(11, "O documento deve conter pelo menos 11 caracteres."),
  userWhatsapp: z.string().nullable().optional(),
});

export type AccountUpdatePayload = z.infer<typeof AccountUpdateSchema>;

export interface AccountBlockData {
  userIdentifier: string;
  userName: string;
  userEmail: string;
  userDocument: string;
  userWhatsapp: string;
}

// 🛡️ TYPE GUARD: Validação estrita em tempo de execução para o BlockData
export const isAccountBlockData = (data: unknown): data is AccountBlockData => {
  if (typeof data !== 'object' || data === null) return false;
  const record = data as Record<string, unknown>;
  return (
    typeof record.userIdentifier === 'string' &&
    typeof record.userName === 'string' &&
    typeof record.userEmail === 'string' &&
    typeof record.userDocument === 'string' &&
    typeof record.userWhatsapp === 'string'
  );
};