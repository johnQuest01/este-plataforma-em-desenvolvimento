import { z } from 'zod';

export const AuthorizedSellerMenuItemSchema = z.object({
  id: z.string(),
  iconName: z.enum(['user', 'lock', 'banknote', 'circle-dollar-sign', 'history']),
  title: z.string(),
  subtitle: z.string(),
  actionRoute: z.string(),
});

export const AuthorizedSellerMenuDataSchema = z.object({
  menuItems: z.array(AuthorizedSellerMenuItemSchema).optional(),
});

export type AuthorizedSellerMenuItemType = z.infer<typeof AuthorizedSellerMenuItemSchema>;
export type AuthorizedSellerMenuDataType = z.infer<typeof AuthorizedSellerMenuDataSchema>;