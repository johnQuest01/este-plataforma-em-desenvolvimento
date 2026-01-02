// lib/utils/currency.ts
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Converte string formatada (1.250,50) para number (1250.50)
 */
export const parseBrazilianCurrency = (value: string | number | Decimal): number => {
  if (typeof value === 'number') return value;
  if (value instanceof Decimal) return value.toNumber();
  
  const cleanValue = value
    .replace(/\./g, '') // Remove pontos de milhar
    .replace(',', '.'); // Converte vírgula decimal em ponto
  
  return parseFloat(cleanValue) || 0;
};

/**
 * Formata number para String Moeda BRL
 */
export const formatCurrencyBRL = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};