'use server';

/**
 * 🧱 BLOCO LEGO: Sistema de Produtos (Product Management)
 * 
 * Este arquivo é como uma "caixa de peças LEGO" especializada em criar e gerenciar produtos.
 * Cada função é uma "peça LEGO" que se encaixa perfeitamente com outras peças do sistema.
 * 
 * 📦 CONTEXTO DO APP:
 * Este é um sistema POS (Point of Sale) - como uma caixa registradora moderna.
 * Quando um vendedor quer cadastrar um novo produto na loja, este módulo:
 * 1. Valida os dados do produto (nome, preço, estoque, etc.)
 * 2. Faz upload da imagem do produto para a nuvem
 * 3. Cria o produto no banco de dados com todas as variações (cores, tamanhos)
 * 4. Gera SKU (código único) para cada variação
 * 
 * 🎯 ARQUITETURA LEGO:
 * - Cada Server Action é uma "peça LEGO" independente
 * - Helpers são "peças auxiliares" que ajudam outras peças
 * - Mappers transformam dados do banco para o formato da tela
 */

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { uploadImageToCloud } from '@/lib/upload-service';
import { Prisma } from '@prisma/client';
import { parseBrazilianCurrency } from '@/lib/utils/currency';
import { z } from 'zod'; 
import { 
  CreateProductInput, 
  ProductData, 
  CreateProductInputSchema 
} from './product.schema';
import { INITIAL_BLOCKS } from '@/data/initial-state';
import { BlockConfig } from '@/types/builder';

export type { ProductData, ProductVariantData, CreateProductInput } from './product.schema';

// --- HELPERS INTERNOS ---
/**
 * 🛠️ PEÇAS LEGO AUXILIARES (Helper Functions):
 * 
 * São funções pequenas que ajudam outras funções maiores.
 * É como ter "peças LEGO especiais" que facilitam montar coisas complexas.
 * 
 * Por que separar em helpers?
 * - Reutilização: pode usar a mesma função em vários lugares
 * - Organização: código mais limpo e fácil de entender
 * - Testes: pode testar cada helper separadamente
 */

/**
 * 🔤 SERIALIZAÇÃO DE NOME DE VARIAÇÃO:
 * 
 * Transforma dados separados em uma string única.
 * É como colocar várias peças LEGO em uma caixa e escrever o nome na caixa.
 * 
 * Exemplo:
 * - Entrada: "Camiseta", cor: "Azul", tamanho: "M"
 * - Saída: "Camiseta|Azul|M|"
 * 
 * Por que fazer isso?
 * - Banco de dados precisa de um nome único para cada variação
 * - Facilita buscar variações depois
 * - Separa informações com "|" (pipe) para desmontar depois
 */
const serializeVariantName = (baseName: string, variation: { color?: string; size?: string; type?: string }): string => {
  return `${baseName}|${variation.color || 'Padrão'}|${variation.size || 'Único'}|${variation.type || ''}`;
};

/**
 * 🧱 CMS DINÂMICO: Normaliza nome de categoria para ID de bloco
 * 
 * Converte categoria legível para identificador técnico.
 * É como criar um "nome de código" para cada categoria.
 * 
 * Exemplo:
 * - Entrada: "Camisetas Femininas"
 * - Saída: "cat_section_camisetas-femininas"
 * 
 * Por que fazer isso?
 * - IDs precisam ser únicos e sem espaços
 * - Facilita buscar blocos no layout
 * - Evita duplicatas de categorias
 */
const normalizeCategoryName = (category: string): string => {
  return category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
    .replace(/^-|-$/g, ''); // Remove hífens do início e fim
};

/**
 * 🔓 DESERIALIZAÇÃO DE NOME DE VARIAÇÃO:
 * 
 * Faz o contrário da função acima: pega uma string e separa em dados.
 * É como abrir uma caixa LEGO e separar as peças por tipo.
 * 
 * Exemplo:
 * - Entrada: "Camiseta|Azul|M|"
 * - Saída: { baseName: "Camiseta", color: "Azul", size: "M", type: undefined }
 * 
 * Por que fazer isso?
 * - Quando busca do banco, vem como string única
 * - Precisa separar para mostrar na tela (cor, tamanho, etc.)
 */
const parseVariantMetadata = (fullName: string) => {
  const parts = fullName.split('|');
  if (parts.length >= 3) {
    return {
      baseName: parts[0],
      color: parts[1],
      size: parts[2],
      type: parts[3] || undefined
    };
  }
  return { baseName: fullName, color: 'Padrão', size: 'Único', type: undefined };
};

/**
 * 🔄 MAPPER: Prisma → Interface da Tela
 * 
 * Transforma dados do banco de dados (Prisma) para o formato que a tela precisa.
 * É como traduzir um manual LEGO de inglês para português.
 * 
 * Por que fazer isso?
 * - Prisma retorna Decimal (tipo especial para dinheiro)
 * - Tela precisa de Number (tipo JavaScript normal)
 * - Mapper converte: Decimal → Number
 * 
 * Exemplo:
 * - Banco: price = Decimal("29.90")
 * - Tela: price = 29.90 (number)
 */
const mapToUserInterface = (product: Prisma.ProductGetPayload<{ include: { variants: true } }>): ProductData => {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    // Alterado de toString() para Number() para facilitar cálculos no front
    price: Number(product.price),
    category: product.category || undefined, // 🧱 CMS DINÂMICO: Inclui categoria
    imageUrl: product.imageUrl,
    isVisible: product.isVisible,
    stock: product.stock,
    storeId: product.storeId,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    variants: product.variants.map((variant) => {
      const metadata = parseVariantMetadata(variant.name);
      return {
        id: variant.id,
        name: metadata.baseName,
        // Alterado de toString() para Number()
        price: variant.price ? Number(variant.price) : null,
        stock: variant.stock,
        sku: variant.sku,
        images: variant.images,
        color: metadata.color,
        size: metadata.size,
        type: metadata.type,
        qty: variant.stock
      };
    })
  };
};

/**
 * 🏷️ GERADOR DE SKU (Stock Keeping Unit - Código de Produto):
 * 
 * Cria um código único para cada variação de produto.
 * É como colocar um código de barras em cada peça LEGO.
 * 
 * Exemplo:
 * - Produto: "Camiseta Básica"
 * - Variação: "Azul, Tamanho M"
 * - SKU gerado: "CAM-AZ-1234560-ABC"
 * 
 * Formato: [3 primeiras letras do produto]-[2 primeiras letras da variação]-[timestamp]-[random]
 * 
 * Por que isso é importante?
 * - Cada produto precisa de um código único
 * - Facilita controle de estoque
 * - Evita duplicatas (mesmo produto com códigos diferentes)
 */
const generateStockKeepingUnit = (productName: string, variationName: string, index: number): string => {
  const prefix = productName.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
  const varSuffix = variationName.substring(0, 2).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${varSuffix}-${timestamp}${index}-${random}`;
};

// --- SERVER ACTIONS ---

/**
 * 🧱 PEÇA LEGO PRINCIPAL: Salvar Produto
 * 
 * Esta função é como montar um "kit LEGO completo" de produto:
 * 1. Valida os dados (verifica se todas as peças estão presentes)
 * 2. Converte preço brasileiro (R$ 29,90) para número (29.90)
 * 3. Faz upload da imagem para a nuvem
 * 4. Encontra ou cria a loja (garante que há um lugar para guardar o produto)
 * 5. Cria o produto com todas as variações em uma transação (tudo ou nada)
 * 6. Atualiza o cache (diz ao Next.js para mostrar os dados atualizados)
 * 
 * 📦 CONTEXTO REAL:
 * Quando um vendedor cadastra um novo produto:
 * - Preenche formulário: nome, preço, descrição, imagem
 * - Adiciona variações: cores, tamanhos, tipos
 * - Clica em "Salvar"
 * - Esta função cria tudo no banco de dados
 */
export async function saveProductAction(inputData: CreateProductInput) {
  try {
    // 1. Validação Zod (Verifica se todas as peças LEGO estão presentes)
    const validatedInput = CreateProductInputSchema.parse(inputData);

    // 2. Conversão de Preço (R$ 29,90 → 29.90)
    /**
     * 💰 CONVERSÃO DE PREÇO:
     * 
     * Usuário digita: "R$ 29,90" (formato brasileiro)
     * Sistema precisa: 29.90 (número decimal)
     * 
     * É como converter medidas:
     * - Usuário pensa em "metros"
     * - Sistema trabalha em "centímetros"
     * - Converter: 1 metro = 100 centímetros
     */
    const numericPrice = parseBrazilianCurrency(validatedInput.price);
    const decimalPrice = new Prisma.Decimal(numericPrice);

    let targetStoreId = validatedInput.storeId;

    // --- LÓGICA DE AUTO-CURA (SELF-HEALING) ---
    /**
     * 🏥 AUTO-CURA (Self-Healing):
     * 
     * Se não houver loja cadastrada, cria uma automaticamente.
     * É como ter uma "peça LEGO padrão" sempre disponível.
     * 
     * Por que isso existe?
     * - Em desenvolvimento, pode não ter loja cadastrada ainda
     * - Em produção, garante que sempre há uma loja para vincular produtos
     * - Evita erros de "loja não encontrada" que quebrariam o sistema
     * 
     * Analogia:
     * É como ter um "kit LEGO de emergência" sempre pronto.
     * Se você não tem o kit que precisa, usa o de emergência.
     */
    if (!targetStoreId) {
      let store = await prisma.store.findFirst();
      
      if (!store) {
        console.log("⚠️ Nenhuma loja encontrada. Iniciando criação automática de Loja Padrão...");
        
        // 1. Garante que existe um usuário dono (Admin)
        let owner = await prisma.user.findFirst();
        if (!owner) {
            owner = await prisma.user.create({
                data: {
                    email: "admin@sistema.com",
                    name: "Admin Sistema",
                    document: "000.000.000-00", 
                }
            });
        }

        // 2. Cria a loja vinculada ao dono
        store = await prisma.store.create({
            data: {
                name: "Minha Loja Principal",
                slug: "loja-principal",
                ownerId: owner.id
            }
        });
        console.log("✅ Loja Padrão criada com sucesso:", store.id);
      }
      
      targetStoreId = store.id;
    }

    let finalImageUrl: string | null = null;
    if (validatedInput.image?.startsWith('data:image')) {
      finalImageUrl = await uploadImageToCloud(validatedInput.image, validatedInput.name);
    } else {
      finalImageUrl = validatedInput.image || `https://placehold.co/600x800/png?text=${encodeURIComponent(validatedInput.name)}`;
    }

    const totalStock = validatedInput.variations.reduce((acc, curr) => {
      const quantity = curr.qty ?? curr.stock ?? 0;
      return acc + quantity;
    }, 0);

    const createdProduct = await prisma.$transaction(async (transaction) => {
      // 1️⃣ Criar o produto com variantes
      const product = await transaction.product.create({
        data: {
          name: validatedInput.name,
          price: decimalPrice,
          category: validatedInput.category, // 🧱 CMS DINÂMICO: Salva categoria (obrigatória)
          isVisible: validatedInput.visibility === 'visible',
          stock: totalStock,
          imageUrl: finalImageUrl,
          storeId: targetStoreId as string,
          variants: {
            create: validatedInput.variations.map((variation, index) => {
              const variantStock = variation.qty ?? variation.stock ?? 0;
              
              return {
                name: serializeVariantName(validatedInput.name, variation),
                stock: variantStock,
                price: decimalPrice,
                sku: generateStockKeepingUnit(validatedInput.name, variation.color || 'VAR', index),
                images: variation.images
              };
            })
          }
        },
        include: { variants: true }
      });

      // 2️⃣ 🧱 CMS DINÂMICO: Atualizar layout da Home Page
      /**
       * 🎯 LÓGICA DE INJEÇÃO DE BLOCOS LEGO:
       * 
       * Quando um produto é cadastrado com uma nova categoria:
       * 1. Busca o layout atual da Home Page
       * 2. Verifica se já existe uma seção para esta categoria
       * 3. Se não existir, cria um novo bloco e insere após o bloco de Reels
       * 4. Salva o layout atualizado no banco
       * 
       * É como adicionar uma nova "prateleira" na loja automaticamente
       * quando você cadastra um novo tipo de produto!
       */
      
      const categoryNormalized = normalizeCategoryName(validatedInput.category);
      const categoryBlockId = `cat_section_${categoryNormalized}`;

      // Busca layout atual da Home (ou usa INITIAL_BLOCKS como fallback)
      const homeConfig = await transaction.uIConfig.findUnique({
        where: { pageSlug: 'home' }
      });

      const currentLayout: BlockConfig[] = homeConfig 
        ? (homeConfig.layout as unknown as BlockConfig[])
        : INITIAL_BLOCKS;

      // Verifica se a categoria já tem um bloco
      const categoryBlockExists = currentLayout.some(
        block => block.id === categoryBlockId
      );

      if (!categoryBlockExists) {
        console.log(`🧱 [CMS DINÂMICO] Criando nova seção para categoria: "${validatedInput.category}"`);

        // Cria o novo bloco da categoria
        const newCategoryBlock: BlockConfig = {
          id: categoryBlockId,
          type: 'category-section',
          isVisible: true,
          data: {
            title: validatedInput.category,
            filterTag: categoryNormalized,
            categoryName: validatedInput.category,
          },
          style: {
            bgColor: '#ffffff',
            textColor: '#000000',
          }
        };

        // Cria uma cópia mutável do layout para inserção
        const updatedLayout = [...currentLayout];

        // Localiza o índice do bloco de Reels (type: 'categories')
        const reelsBlockIndex = updatedLayout.findIndex(
          block => block.type === 'categories'
        );

        if (reelsBlockIndex !== -1) {
          // Insere o novo bloco logo após o Reels
          updatedLayout.splice(reelsBlockIndex + 1, 0, newCategoryBlock);
          console.log(`✅ [CMS DINÂMICO] Bloco inserido após Reels (posição ${reelsBlockIndex + 1})`);
        } else {
          // Fallback: Se não encontrar Reels, insere após o header
          const headerIndex = updatedLayout.findIndex(block => block.type === 'header');
          const insertPosition = headerIndex !== -1 ? headerIndex + 1 : 0;
          updatedLayout.splice(insertPosition, 0, newCategoryBlock);
          console.log(`⚠️ [CMS DINÂMICO] Reels não encontrado. Bloco inserido na posição ${insertPosition}`);
        }

        // Salva o layout atualizado (upsert = create ou update)
        await transaction.uIConfig.upsert({
          where: { pageSlug: 'home' },
          create: {
            pageSlug: 'home',
            layout: JSON.parse(JSON.stringify(updatedLayout)),
          },
          update: {
            layout: JSON.parse(JSON.stringify(updatedLayout)),
          },
        });

        console.log(`🎉 [CMS DINÂMICO] Layout da Home atualizado com sucesso!`);
      } else {
        console.log(`ℹ️ [CMS DINÂMICO] Categoria "${validatedInput.category}" já possui seção na Home.`);
      }

      return product;
    });

    revalidatePath('/dashboard');
    revalidatePath('/inventory');
    revalidatePath('/'); // 🧱 CMS DINÂMICO: Revalida a Home para mostrar nova seção

    return { 
      success: true, 
      product: mapToUserInterface(createdProduct) 
    };

  } catch (error) {
    console.error("❌ Erro ao salvar produto:", error);
    
    if (error instanceof z.ZodError) {
        return { success: false, error: error.issues };
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
       return { success: false, error: "Erro de duplicidade: SKU ou Nome já existem." };
    }

    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro interno no servidor." 
    };
  }
}

export async function getProductsAction(): Promise<ProductData[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { variants: true }
    });
    return products.map(mapToUserInterface);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

export async function getProductByIdAction(id: string): Promise<ProductData | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true }
    });
    return product ? mapToUserInterface(product) : null;
  } catch (error) {
    console.error("Erro ao buscar produto por ID:", error);
    return null;
  }
}

/**
 * 🗑️ DELETAR PRODUTO
 * 
 * Remove um produto específico do banco de dados.
 * Cascade delete remove automaticamente todas as variantes.
 * 
 * @param productId - ID do produto a ser deletado
 * @returns Sucesso ou erro
 */
export async function deleteProductAction(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.product.delete({
      where: { id: productId }
    });

    revalidatePath('/dashboard');
    revalidatePath('/inventory');
    revalidatePath('/');

    console.log(`✅ Produto ${productId} deletado com sucesso`);
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao deletar produto:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro ao deletar produto" 
    };
  }
}

/**
 * 🗑️ DELETAR CATEGORIA COMPLETA
 * 
 * Remove todos os produtos de uma categoria E remove o bloco da Home Page.
 * 
 * Fluxo:
 * 1. Busca todos produtos da categoria
 * 2. Deleta todos os produtos (cascade remove variantes)
 * 3. Remove o bloco da categoria do UIConfig
 * 4. Revalida páginas
 * 
 * @param category - Nome da categoria (ex: "Modinha")
 * @returns Sucesso com contagem de produtos deletados
 */
export async function deleteCategoryAction(category: string): Promise<{ 
  success: boolean; 
  deletedCount?: number;
  error?: string 
}> {
  try {
    const result = await prisma.$transaction(async (transaction) => {
      // 1️⃣ Deletar todos produtos (cascade deleta variantes automaticamente)
      const deleteResult = await transaction.product.deleteMany({
        where: { category }
      });

      // 2️⃣ Remover bloco da categoria do UIConfig
      const categoryNormalized = normalizeCategoryName(category);
      const categoryBlockId = `cat_section_${categoryNormalized}`;

      const homeConfig = await transaction.uIConfig.findUnique({
        where: { pageSlug: 'home' }
      });

      if (homeConfig) {
        const currentLayout: BlockConfig[] = homeConfig.layout as unknown as BlockConfig[];
        
        // Remove o bloco da categoria
        const updatedLayout = currentLayout.filter(
          block => block.id !== categoryBlockId
        );

        // Atualiza o layout
        await transaction.uIConfig.update({
          where: { pageSlug: 'home' },
          data: {
            layout: JSON.parse(JSON.stringify(updatedLayout))
          }
        });

        console.log(`🧱 [CMS DINÂMICO] Bloco de categoria "${category}" removido da Home`);
      }

      return deleteResult.count;
    });

    revalidatePath('/dashboard');
    revalidatePath('/inventory');
    revalidatePath('/');

    console.log(`✅ Categoria "${category}" deletada: ${result} produtos removidos`);
    return { success: true, deletedCount: result };
  } catch (error) {
    console.error("❌ Erro ao deletar categoria:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro ao deletar categoria" 
    };
  }
}

/**
 * 🧹 LIMPAR TUDO (RESET COMPLETO)
 * 
 * Remove TODOS os dados do sistema:
 * - Todos produtos e variantes
 * - Todos pedidos
 * - Todos itens de produção
 * - Reset do UIConfig para INITIAL_BLOCKS
 * 
 * ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!
 * 
 * Para limpar localStorage, use no cliente:
 * ```typescript
 * localStorage.clear();
 * ```
 * 
 * @returns Sucesso com contagens de itens deletados
 */
export async function resetDatabaseAction(): Promise<{ 
  success: boolean; 
  stats?: {
    products: number;
    variants: number;
    orders: number;
    productionItems: number;
  };
  error?: string 
}> {
  try {
    const stats = await prisma.$transaction(async (transaction) => {
      // 1️⃣ Deletar todos OrderItems (dependência de Order e Product)
      await transaction.orderItem.deleteMany({});

      // 2️⃣ Deletar todos Orders
      const ordersDeleted = await transaction.order.deleteMany({});

      // 3️⃣ Deletar todos ProductionItems
      const productionItemsDeleted = await transaction.productionItem.deleteMany({});

      // 4️⃣ Deletar todos Variations (dependência de ProductionOrder)
      await transaction.variation.deleteMany({});

      // 5️⃣ Deletar todos ProductionOrders
      await transaction.productionOrder.deleteMany({});

      // 6️⃣ Deletar todos ProductVariants (cascade automático, mas explícito para contar)
      const variantsDeleted = await transaction.productVariant.deleteMany({});

      // 7️⃣ Deletar todos Products
      const productsDeleted = await transaction.product.deleteMany({});

      // 8️⃣ Reset do UIConfig para INITIAL_BLOCKS
      await transaction.uIConfig.upsert({
        where: { pageSlug: 'home' },
        create: {
          pageSlug: 'home',
          layout: JSON.parse(JSON.stringify(INITIAL_BLOCKS))
        },
        update: {
          layout: JSON.parse(JSON.stringify(INITIAL_BLOCKS))
        }
      });

      console.log('🧱 [CMS DINÂMICO] UIConfig resetado para INITIAL_BLOCKS');

      return {
        products: productsDeleted.count,
        variants: variantsDeleted.count,
        orders: ordersDeleted.count,
        productionItems: productionItemsDeleted.count
      };
    });

    revalidatePath('/dashboard');
    revalidatePath('/inventory');
    revalidatePath('/');

    console.log('✅ Sistema resetado com sucesso:', stats);
    return { success: true, stats };
  } catch (error) {
    console.error("❌ Erro ao resetar sistema:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro ao resetar sistema" 
    };
  }
}

/**
 * 🧹 LIMPAR APENAS UIConfig (Resetar tela inicial)
 * 
 * Remove todas as seções dinâmicas criadas pelo CMS.
 * Mantém os produtos no banco, apenas limpa a Home Page.
 * 
 * @returns Sucesso ou erro
 */
export async function resetHomeLayoutAction(): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.uIConfig.upsert({
      where: { pageSlug: 'home' },
      create: {
        pageSlug: 'home',
        layout: JSON.parse(JSON.stringify(INITIAL_BLOCKS))
      },
      update: {
        layout: JSON.parse(JSON.stringify(INITIAL_BLOCKS))
      }
    });

    revalidatePath('/dashboard');
    revalidatePath('/');

    console.log('✅ Layout da Home resetado para INITIAL_BLOCKS');
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao resetar layout:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro ao resetar layout" 
    };
  }
}

/**
 * 🧹 REMOVER BLOCOS DE "LANÇAMENTOS DA SEMANA"
 * 
 * Remove todos os blocos do tipo 'product-grid' (Lançamentos da Semana) do layout.
 * Mantém apenas blocos de categoria dinâmica (category-section).
 * 
 * Por que isso existe?
 * - A área "Lançamentos da Semana" foi removida do design
 * - Produtos devem aparecer apenas em suas categorias específicas
 * - Esta função limpa blocos antigos que possam estar no banco
 * 
 * @returns Sucesso ou erro com contagem de blocos removidos
 */
export async function removeProductGridBlocksAction(): Promise<{
  success: boolean;
  removedCount?: number;
  error?: string;
}> {
  try {
    const homeConfig = await prisma.uIConfig.findUnique({
      where: { pageSlug: 'home' }
    });

    if (!homeConfig) {
      return { 
        success: true, 
        removedCount: 0,
        error: "Nenhuma configuração de Home encontrada" 
      };
    }

    const currentLayout: BlockConfig[] = homeConfig.layout as unknown as BlockConfig[];
    
    // Filtra removendo todos os blocos do tipo 'product-grid'
    const filteredLayout = currentLayout.filter(
      block => block.type !== 'product-grid'
    );

    const removedCount = currentLayout.length - filteredLayout.length;

    if (removedCount > 0) {
      await prisma.uIConfig.update({
        where: { pageSlug: 'home' },
        data: {
          layout: JSON.parse(JSON.stringify(filteredLayout))
        }
      });

      revalidatePath('/dashboard');
      revalidatePath('/');

      console.log(`🧹 [LIMPEZA] ${removedCount} bloco(s) 'product-grid' removido(s) com sucesso`);
    } else {
      console.log('ℹ️ [LIMPEZA] Nenhum bloco product-grid encontrado para remover');
    }

    return { 
      success: true, 
      removedCount 
    };

  } catch (error) {
    console.error("❌ Erro ao remover blocos product-grid:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao limpar blocos"
    };
  }
}