// app/actions/order.ts
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// --- ZOD SCHEMAS (Camada de Validação) ---
const OrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
});

const CreateOrderSchema = z.object({
  title: z.string(),
  total: z.number(),
  itemsCount: z.number(),
  items: z.array(OrderItemSchema).optional(),
  paymentMethod: z.string().optional(),
  customerName: z.string().optional(),
  customerDoc: z.string().optional(),
  emitInvoice: z.boolean().optional(),
});

// --- STRICT TYPES (Contrato de Dados) ---

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// Interface exata esperada pela UI (Zero-Any)
export interface OrderData {
  id: string;
  title: string;
  total: number;
  status: string;
  statusLabel: string;
  paymentMethod: string;
  createdAt: string; // ISO String para serialização segura
  itemsCount: number;
  customerName?: string | null;
  customerDoc?: string | null;
  hasInvoice?: boolean;
}

// --- ACTIONS ---

export async function createOrderAction(input: CreateOrderInput) {
  // 1. Validação de Entrada
  const result = CreateOrderSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.flatten() };
  }
  const data = result.data;

  try {
    // 2. Resolução da Loja (Lógica de Fallback Robusta)
    const defaultStore = await prisma.store.findFirst({ select: { id: true } });
    
    let storeId = defaultStore?.id;
    if (!storeId) {
       // Criação de loja padrão caso não exista (Ambiente Dev/First Run)
       const newStore = await prisma.store.create({
         data: { 
            name: "Loja Principal", 
            slug: "main-store-" + Date.now(), 
            owner: { 
              connectOrCreate: { 
                where: { document: "00000000000" }, 
                create: { document: "00000000000", role: "admin" } 
              } 
            } 
         }
       });
       storeId = newStore.id;
    }

    // 3. TRANSAÇÃO ATÔMICA (Pedido + Baixa de Estoque)
    const newOrder = await prisma.$transaction(async (tx) => {
      
      // A. Criar o Pedido
      const order = await tx.order.create({
        data: {
          storeId: storeId,
          total: new Prisma.Decimal(data.total),
          status: 'COMPLETED',
          customerName: data.customerName,
          // Nota: Mapeando Doc para Phone temporariamente pois o Schema não tem customerDoc
          customerPhone: data.customerDoc, 
          items: {
            create: data.items?.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: new Prisma.Decimal(0) // Preço deve ser buscado do produto em prod
            }))
          }
        }
      });

      // B. Baixa de Estoque (Controle Rígido)
      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }

      return order;
    });

    // 4. Revalidação de Cache
    revalidatePath('/pos');
    revalidatePath('/dashboard');

    // 5. Retorno Serializado (Sem Date objects)
    return { 
      success: true, 
      order: {
        id: newOrder.id,
        total: Number(newOrder.total),
        status: newOrder.status,
        createdAt: newOrder.createdAt.toISOString()
      }
    };

  } catch (error) {
    console.error("❌ Falha Crítica ao Criar Pedido:", error);
    return { success: false, message: "Erro ao processar venda no banco de dados." };
  }
}

export async function getOrdersAction(): Promise<OrderData[]> {
  try {
    const orders = await prisma.order.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });

    // MAPPER: Prisma -> UI Interface (Adapter Pattern)
    return orders.map(order => ({
      id: order.id,
      title: order.customerName || `Venda #${order.id.slice(-4).toUpperCase()}`,
      total: Number(order.total),
      status: order.status,
      statusLabel: order.status === 'COMPLETED' ? 'Venda Finalizada' : 'Pendente',
      paymentMethod: 'PIX', // Placeholder: Adicionar campo ao Schema futuramente
      createdAt: order.createdAt.toISOString(), // Resolve erro de tipagem Date vs string
      itemsCount: order.items.reduce((acc, item) => acc + item.quantity, 0),
      customerName: order.customerName,
      customerDoc: order.customerPhone,
      hasInvoice: true // Mock
    }));

  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return [];
  }
}