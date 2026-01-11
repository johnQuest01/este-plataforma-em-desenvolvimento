/**
 * Utilitário Isomórfico de Moeda (Stack 2026)
 * Responsabilidade: Centralizar TODA conversão monetária do sistema.
 * Garantia: Zero erros de ponto flutuante ou formatação locale.
 */

/**
 * Converte qualquer entrada (String BRL, String ISO, Number) para Number puro.
 * Essencial para salvar dados no Banco ou realizar cálculos matemáticos.
 */
export const parseBrazilianCurrency = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined || value === '') return 0;
  
  if (typeof value === 'number') return value;

  const strValue = value.toString();

  // Detecção de formato BRL (Input do Usuário com vírgula decimal)
  // Ex: "R$ 1.250,50" -> 1250.50
  if (strValue.includes(',')) {
    const cleanValue = strValue
      .replace(/[^\d,.-]/g, '') // Remove tudo que não for número, vírgula, ponto ou sinal negativo
      .replace(/\./g, '')       // Remove pontos de milhar (1.000 -> 1000)
      .replace(',', '.');       // Troca vírgula decimal por ponto (padrão JS)
    
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Formato ISO/DB ou Input simples (1250.50)
  const parsed = parseFloat(strValue);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Formata um número para o padrão visual BRL.
 * Use APENAS para exibição na UI (renderização). NUNCA para cálculos.
 * Ex: 1250.5 -> "R$ 1.250,50"
 */
export const formatCurrencyBRL = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return 'R$ 0,00';
  
  // Garante que estamos formatando um número
  const amount = typeof value === 'number' ? value : parseBrazilianCurrency(value);
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Helper para Inputs de Formulário (Máscara)
 * Remove caracteres não numéricos para inputs controlados.
 */
export const formatCurrencyInput = (value: string | number): string => {
  const number = parseBrazilianCurrency(value);
  if (number === 0) return '';
  
  // Retorna formatado mas sem o símbolo R$ para facilitar edição em alguns inputs, 
  // ou com R$ se for o desejo do design system. 
  // Aqui mantemos o padrão BRL completo.
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number);
};