// app/actions/cash.ts
'use server';

export interface CashRegisterData {
  isOpen: boolean;
  openedAt: number | null;
  closedAt: number | null;
  initialAmount: number; // Fundo de troco
  currentBalance: number; // Saldo atual (dinheiro)
  operator: string;
}

// Banco de dados em memória para o Caixa
declare global {
  var __CASH_REGISTER: CashRegisterData;
}

if (!global.__CASH_REGISTER) {
  global.__CASH_REGISTER = {
    isOpen: false,
    openedAt: null,
    closedAt: null,
    initialAmount: 0,
    currentBalance: 0,
    operator: 'Admin'
  };
}

export async function getCashRegisterStatus() {
  return global.__CASH_REGISTER;
}

export async function openCashRegister(initialAmount: number, operator: string) {
  if (global.__CASH_REGISTER.isOpen) {
    return { success: false, message: 'Caixa já está aberto.' };
  }

  global.__CASH_REGISTER = {
    isOpen: true,
    openedAt: Date.now(),
    closedAt: null,
    initialAmount,
    currentBalance: initialAmount,
    operator
  };

  return { success: true, data: global.__CASH_REGISTER };
}

export async function closeCashRegister(finalAmount: number) {
  if (!global.__CASH_REGISTER.isOpen) {
    return { success: false, message: 'Caixa já está fechado.' };
  }

  const diff = finalAmount - global.__CASH_REGISTER.currentBalance;

  global.__CASH_REGISTER.isOpen = false;
  global.__CASH_REGISTER.closedAt = Date.now();
  
  // Em um sistema real, aqui você salvaria o histórico de fechamento no banco
  console.log(`🔒 Caixa Fechado. Diferença: R$ ${diff.toFixed(2)}`);

  return { success: true, diff };
}

// CORREÇÃO: Função transformada em 'async function' para cumprir regra de Server Actions
export async function updateCashBalance(amount: number) {
  if (global.__CASH_REGISTER.isOpen) {
    global.__CASH_REGISTER.currentBalance += amount;
  }
}