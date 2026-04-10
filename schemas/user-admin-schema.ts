import { z } from 'zod';

export const DeleteRegisteredUserPayloadSchema = z.object({
  userIdentifier: z
    .string()
    .trim()
    .min(1, 'O identificador do utilizador é obrigatório.'),
});

export type DeleteRegisteredUserPayload = z.infer<typeof DeleteRegisteredUserPayloadSchema>;
