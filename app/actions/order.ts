// app/actions/order.ts
'use server';

import { deductProductStock } from './product';
import { updateCashBalance } from './cash';

// Define a estrutura de um pedido
export interface OrderData {
  id: string;
  title: string;
  total: string;
  date: string;
  status: 'approved' | 'processing' | 'refunded';
  statusLabel: string;
  itemsCount: number;
  paymentMethod?: string;
  customerName?: string;
  customerDoc?: string; // NOVO: CPF ou CNPJ
  hasInvoice?: boolean; // NOVO: Se emitiu nota
}

// Banco de dados em memória global para Pedidos
declare global {
  var __ORDERS_DB: OrderData[];
}

if (!global.__ORDERS_DB) {
  global.__ORDERS_DB = [
    { 
      id: 'ord_demo_1', 
      title: 'Conjunto Verão', 
      total: 'R$ 89,90', 
      date: 'Hoje, 10:15', 
      status: 'approved', 
      statusLabel: 'Compra Aprovada', 
      itemsCount: 1,
      paymentMethod: 'pix',
      customerName: 'Cliente Exemplo',
      hasInvoice: true
    }
  ];
}

interface CartItemInput {
  productId: string;
  quantity: number;
}

interface CreateOrderInput {
  title: string;
  total: number;
  itemsCount: number;
  items?: CartItemInput[];
  paymentMethod?: string;
  customerName?: string;
  customerDoc?: string; // NOVO
  emitInvoice?: boolean; // NOVO
}

export async function createOrderAction(data: CreateOrderInput) {
  
  // --- A. BAIXA DE ESTOQUE ---
  if (data.items && data.items.length > 0) {
    for (const item of data.items) {
      await deductProductStock(item.productId, item.quantity);
    }
  }

  // --- B. ATUALIZA CAIXA ---
  if (data.paymentMethod === 'cash') {
    updateCashBalance(data.total);
  }

  // --- C. CRIA PEDIDO ---
  const totalFormatted = `R$ ${data.total.toFixed(2).replace('.', ',')}`;

  const newOrder: OrderData = {
    id: Math.random().toString(36).substr(2, 9),
    title: data.title,
    total: totalFormatted,
    date: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
    status: 'approved',
    statusLabel: 'Venda Finalizada',
    itemsCount: data.itemsCount,
    paymentMethod: data.paymentMethod,
    customerName: data.customerName,
    customerDoc: data.customerDoc,
    hasInvoice: data.emitInvoice || false
  };

  global.__ORDERS_DB.unshift(newOrder);
  
  return { success: true, order: newOrder };
}

export async function getOrdersAction() {
  return global.__ORDERS_DB;
}