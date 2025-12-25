import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Retorna o nome do produto sem forçar formatação de maiúsculas/minúsculas,
 * apenas removendo espaços extras.
 */
export const formatProductName = (name: string) => {
  if (!name) return '';
  return name.trim();
};