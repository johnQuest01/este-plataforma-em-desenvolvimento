import { z } from "zod";

// Enum base para temas
export const ThemePreferenceSchema = z.enum(["light", "dark", "system"]);

// Alias para compatibilidade com a Action (GuardianTheme)
export const GuardianTheme = ThemePreferenceSchema;
export type GuardianTheme = z.infer<typeof GuardianTheme>;

// Schema para atualização de tema (usado na Action)
export const UpdateThemeSchema = z.object({
  theme: GuardianTheme,
});

// Schema completo de preferências do usuário
export const UserPreferencesSchema = z.object({
  theme: ThemePreferenceSchema,
  reducedMotion: z.boolean().default(false),
});

export type ThemePreference = z.infer<typeof ThemePreferenceSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;