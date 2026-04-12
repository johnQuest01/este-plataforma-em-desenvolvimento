// app/actions/order.ts
'use server';

/**
 * 🧱 BLOCO LEGO: Sistema de Pedidos/Vendas (Order Management)
 * 
 * Este arquivo é como uma "caixa de peças LEGO" especializada em criar e gerenciar pedidos.
 * Cada função é uma "peça LEGO" que se encaixa perfeitamente com outras peças do sistema.
 * 
 * 📦 CONTEXTO DO APP:
 * Este é um sistema POS (Point of Sale) - como uma caixa registradora moderna.
 * Quando um cliente compra produtos na loja, este módulo:
 * 1. Cria um "pedido" (como uma nota fiscal digital)
 * 2. Baixa o estoque automaticamente (remove produtos vendidos)
 * 3. Registra tudo no banco de dados de forma segura
 * 
 * 🎯 ARQUITETURA LEGO:
 * - Cada Server Action é uma "peça LEGO" independente
 * - Elas se conectam através de tipos TypeScript (como os pinos de um LEGO)
 * - Zod é o "manual de instruções" que garante que as peças se encaixem corretamente
 */

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// --- ZOD SCHEMAS (Camada de Validação) ---
/**
 * 📋 MANUAL DE INSTRUÇÕES LEGO (Zod Schemas)
 * 
 * Zod é como o "manual de instruções" que vem com um kit LEGO.
 * Ele garante que os dados que chegam estão no formato correto antes de montar.
 * 
 * Analogia: Antes de encaixar uma peça LEGO, você verifica se ela tem o formato certo.
 * Se não tiver, você não força - retorna um erro para quem tentou encaixar errado.
 */
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
  /// ID do usuário comprador (preenchido quando o cliente está logado)
  customerId: z.string().optional(),
  /// ID do vendedor que indicou este cliente (via link de loja)
  referredBySellerId: z.string().optional(),
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

/**
 * 🧱 PEÇA LEGO PRINCIPAL: Criar Pedido/Venda
 * 
 * Esta função é como montar um "kit LEGO completo" de venda:
 * 1. Valida os dados (verifica se todas as peças estão presentes)
 * 2. Encontra ou cria a loja (garante que há um lugar para guardar o pedido)
 * 3. Cria o pedido E baixa o estoque em uma única transação (tudo ou nada)
 * 4. Atualiza o cache (diz ao Next.js para mostrar os dados atualizados)
 * 
 * 📦 CONTEXTO REAL:
 * Quando um vendedor finaliza uma venda no caixa (POS):
 * - O cliente escolheu produtos
 * - O vendedor clicou em "Finalizar Venda"
 * - Esta função cria o pedido e remove os produtos do estoque automaticamente
 * 
 * 🔒 TRANSAÇÃO ATÔMICA:
 * É como um "kit LEGO fechado" - ou monta tudo perfeitamente, ou não monta nada.
 * Se der erro em qualquer parte, tudo volta ao estado anterior (rollback).
 * Isso evita situações como: "pedido criado mas estoque não baixou" (venda fantasma).
 */
export async function createOrderAction(input: CreateOrderInput) {
  // 1. Validação de Entrada (Verifica se todas as peças LEGO estão presentes)
  const result = CreateOrderSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.flatten() };
  }
  const data = result.data;

  try {
    // 2. Resolução da Loja (Lógica de Fallback Robusta)
    /**
     * 🏪 AUTO-CURA (Self-Healing):
     * Se não houver loja cadastrada, cria uma automaticamente.
     * É como ter uma "peça LEGO padrão" sempre disponível.
     * 
     * Por que isso existe?
     * - Em desenvolvimento, pode não ter loja cadastrada ainda
     * - Em produção, garante que sempre há uma loja para vincular pedidos
     * - Evita erros de "loja não encontrada" que quebrariam o sistema
     */
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
    /**
     * 🔒 TRANSAÇÃO ATÔMICA (Tudo ou Nada):
     * 
     * É como montar um kit LEGO dentro de uma "caixa fechada":
     * - Se conseguir montar tudo perfeitamente, abre a caixa e mostra o resultado
     * - Se der erro em qualquer peça, desmonta tudo e volta ao estado inicial
     * 
     * Por que isso é importante?
     * Imagine que você vendeu 3 camisetas:
     * - Se criar o pedido mas NÃO baixar o estoque → vai vender produtos que não existem mais
     * - Se baixar o estoque mas NÃO criar o pedido → produtos sumiram sem registro de venda
     * 
     * Com transação atômica: OU cria pedido E baixa estoque, OU não faz nada.
     * Isso garante que os dados sempre estão consistentes.
     */
    const newOrder = await prisma.$transaction(async (tx) => {
      
      // A. Criar o Pedido (Primeira peça LEGO do kit)
      /**
       * 📝 CRIANDO O PEDIDO:
       * É como escrever uma nota fiscal digital.
       * Registra: quem comprou, quanto pagou, quais produtos, quando foi vendido.
       */
      const order = await tx.order.create({
        data: {
          storeId: storeId,
          total: new Prisma.Decimal(data.total),
          status: 'COMPLETED',
          customerName: data.customerName,
          customerPhone: data.customerDoc,
          // Vínculo com o cliente logado (rastreia histórico de compras do cliente)
          ...(data.customerId ? { customerId: data.customerId } : {}),
          // Vínculo com o vendedor que indicou (rastreia vendas por indicação)
          ...(data.referredBySellerId ? { referredBySellerId: data.referredBySellerId } : {}),
          items: {
            create: data.items?.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: new Prisma.Decimal(0)
            }))
          }
        }
      });

      // B. Baixa de Estoque (Segunda peça LEGO do kit - Remove produtos vendidos)
      /**
       * 📦 BAIXA DE ESTOQUE:
       * Quando você vende um produto, ele precisa sair do estoque.
       * É como remover peças LEGO de uma caixa quando você usa elas.
       * 
       * Exemplo prático:
       * - Estoque tinha 10 camisetas
       * - Cliente comprou 3 camisetas
       * - Agora o estoque tem 7 camisetas (10 - 3 = 7)
       * 
       * Por que dentro da transação?
       * Se der erro aqui, o pedido também não é criado (rollback).
       * Isso evita vender produtos que não existem mais no estoque.
       */
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

    // 4. Revalidação de Cache (Atualiza as telas que mostram pedidos)
    /**
     * 🔄 REVALIDAÇÃO DE CACHE:
     * 
     * Next.js guarda dados em "cache" (memória rápida) para carregar páginas mais rápido.
     * Quando criamos um novo pedido, precisamos "atualizar" esse cache.
     * 
     * É como atualizar um catálogo LEGO:
     * - Você adicionou uma nova peça na coleção
     * - Precisa atualizar o catálogo para mostrar a nova peça
     * - Se não atualizar, o catálogo mostra dados antigos
     * 
     * Por que isso é importante?
     * Sem revalidação, o vendedor criaria um pedido mas não veria ele na lista
     * até recarregar a página manualmente.
     */
    revalidatePath('/pos');
    revalidatePath('/dashboard');

    // 4.5 Registra ActivityLog para o cliente (se logado)
    if (data.customerId) {
      const itemCount = data.items?.reduce((s, i) => s + i.quantity, 0) ?? 1;
      const description = `Comprou ${itemCount} item(s) — Total: R$ ${data.total.toFixed(2)}`;
      const metadata    = JSON.stringify({ total: data.total, itemsCount: itemCount });
      prisma.$executeRawUnsafe(
        `INSERT INTO "ActivityLog" (id, "userId", action, description, "orderId", metadata, "createdAt")
         VALUES (gen_random_uuid(), $1, 'PURCHASE', $2, $3, $4::jsonb, NOW())`,
        data.customerId, description, newOrder.id, metadata
      ).catch(() => { /* Não bloqueia a resposta se o log falhar */ });
    }

    // 5. Retorno Serializado (Sem Date objects)
    /**
     * 🔄 SERIALIZAÇÃO:
     * 
     * JavaScript tem tipos que não podem ser enviados pela internet (como Date).
     * Precisamos converter para string (ISO format) antes de enviar.
     * 
     * É como embalar um LEGO frágil:
     * - Você não envia o LEGO solto pelo correio
     * - Coloca em uma caixa (string) para proteger
     * - Quem recebe desembala e monta o LEGO novamente
     */
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

/**
 * 🧱 PEÇA LEGO: Buscar Lista de Pedidos
 * 
 * Esta função é como abrir uma "gaveta LEGO" e pegar os últimos 50 pedidos.
 * Ela busca no banco de dados e transforma os dados para o formato que a tela precisa.
 * 
 * 📦 CONTEXTO REAL:
 * Quando o vendedor abre a tela de "Histórico de Vendas":
 * - Esta função busca os últimos 50 pedidos
 * - Mostra na tela em ordem do mais recente para o mais antigo
 * - Cada pedido mostra: cliente, total, data, produtos vendidos
 */
export async function getOrdersAction(): Promise<OrderData[]> {
  try {
    const orders = await prisma.order.findMany({
      take: 50, // Pega apenas os últimos 50 pedidos (evita carregar milhares)
      orderBy: { createdAt: 'desc' }, // Do mais recente para o mais antigo
      include: { items: true } // Inclui os produtos de cada pedido
    });

    // MAPPER: Prisma -> UI Interface (Adapter Pattern)
    /**
     * 🔄 ADAPTER PATTERN (Padrão Adaptador):
     * 
     * O banco de dados retorna dados em um formato (Prisma).
     * A tela precisa de dados em outro formato (UI Interface).
     * 
     * É como um adaptador de tomada:
     * - Prisma retorna: plugue tipo A (formato do banco)
     * - UI precisa: plugue tipo B (formato da tela)
     * - Mapper adapta: transforma tipo A em tipo B
     * 
     * Por que fazer isso?
     * - Separação de responsabilidades: banco não precisa saber como a tela funciona
     * - Flexibilidade: pode mudar o banco sem quebrar a tela
     * - Tipagem estrita: TypeScript garante que os tipos estão corretos
     */
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