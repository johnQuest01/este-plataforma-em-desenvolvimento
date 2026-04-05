import { z } from 'zod';

export const ActivityButtonSchema = z.object({
  id: z.string().min(1, "O identificador do botão é obrigatório."),
  label: z.string().min(1, "O rótulo do botão é obrigatório."),
  actionRoute: z.string().min(1, "A rota de ação é obrigatória.")
});

export const ActivityHistoryBlockDataSchema = z.object({
  title: z.string().optional().default("Historico de Atividades"),
  subtitle: z.string().optional().default("Historico de Compras"),
  searchFormInputLabel: z.string().optional().default("Nome do Produto, código, valor"),
  searchFormButtonLabel: z.string().optional().default("Buscar"),
  activityButtons: z.array(ActivityButtonSchema).optional().default([
    { id: "btn_status", label: "Status de Pedido", actionRoute: "/status" },
    { id: "btn_box", label: "Meu Box Maryland", actionRoute: "/box" },
    { id: "btn_favorites", label: "Meus Favoritos", actionRoute: "/favorites" },
    { id: "btn_bag", label: "Sacola", actionRoute: "/cart" }
  ])
});

export const ActivityHistorySearchActionSchema = z.object({
  searchQueryInformation: z.string().optional(),
  searchDateInformation: z.string().optional(),
  storeIdentifier: z.string().min(1, "O identificador da loja é obrigatório.")
});

export type ActivityHistorySearchActionType = z.infer<typeof ActivityHistorySearchActionSchema>;