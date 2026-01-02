/**
 * Utilitário Isomórfico de Moeda (Funciona em Server e Client)
 * Protocolo: Zero dependência de Node.js/Prisma Runtime.
 */

/**
 * Converte valores monetários para Number puro (float).
 * Lógica Híbrida:
 * 1. Se contiver vírgula (Formato BRL "1.250,50"), remove pontos de milhar e troca vírgula por ponto.
 * 2. Se não contiver vírgula (Formato ISO "1250.50" do Banco), faz parse direto.
 */
export const parseBrazilianCurrency = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;

  const strValue = value.toString();

  // Detecção de formato BRL (Input do Usuário)
  if (strValue.includes(',')) {
    const cleanValue = strValue
      .replace(/[R$\s]/g, '') // Remove R$ e espaços
      .replace(/\./g, '')     // Remove pontos de milhar (1.000 -> 1000)
      .replace(',', '.');     // Troca vírgula decimal por ponto
    
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Formato ISO/DB (1250.50)
  const parsed = parseFloat(strValue);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Formata um valor para exibição em Real Brasileiro (BRL).
 * Ex: 1250.5 -> "R$ 1.250,50"
 */
export const formatCurrencyBRL = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return 'R$ 0,00';
  
  const amount = typeof value === 'number' ? value : parseBrazilianCurrency(value);
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};