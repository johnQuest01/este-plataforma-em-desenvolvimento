// schemas/blocks/button-schema.ts
import { z } from "zod";

export const StandardButtonDataSchema = z.object({
  label: z.string().min(1, "O texto do botão é obrigatório"),
  variant: z.enum(["primary", "secondary", "outline", "danger"]).default("primary"),
  size: z.enum(["sm", "md", "lg"]).default("md"),
  actionType: z.string(), // O ID da ação que será disparada no onAction
  icon: z.string().optional(),
  fullWidthMobile: z.boolean().default(true),
});

export type StandardButtonData = z.infer<typeof StandardButtonDataSchema>;