// components/builder/blocks/CategorySectionBlock.tsx
'use client';

/**
 * 🧱 LEGO ARCHITECTURE: Category Section Block (CMS Dinâmico)
 * 
 * Este componente é gerado AUTOMATICAMENTE quando um produto é cadastrado
 * com uma nova categoria. É parte do sistema de "CMS Dinâmico" que permite
 * que a Home Page evolua organicamente baseada no catálogo.
 * 
 * 🎯 CONTEXTO:
 * - Bloco criado dinamicamente em `saveProductAction`
 * - Busca produtos por categoria (filterTag)
 * - Renderiza em formato de slider horizontal
 * 
 * 📦 STACK:
 * - React 19
 * - Framer Motion para animations
 * - Next.js Image para otimização
 * - TypeScript Strict Mode
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';
import { getProductsAction, ProductData } from '@/app/actions/product';
import { withGuardian } from "@/components/guardian/GuardianBeacon";
import { useSellerContext } from '@/lib/seller-context';

interface CategorySectionBlockBaseProps extends BlockComponentProps {}

const CategorySectionBlockBase = ({ config, onAction }: CategorySectionBlockBaseProps): React.JSX.Element | null => {
  const { isSellerMode, sellerSlug, sellerProducts } = useSellerContext();
  const [mdProducts, setMdProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(!isSellerMode);

  const title = config.data.title ?? config.data.categoryName ?? 'Produtos';
  const filterTag = config.data.filterTag as string | undefined;

  useEffect(() => {
    // Em modo vendedor, os produtos vêm do contexto — sem fetch extra
    if (isSellerMode) {
      setIsLoading(false);
      return;
    }

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const allProducts = await getProductsAction();

        let filtered = allProducts;
        if (filterTag) {
          filtered = allProducts.filter(product => {
            if (!product.category) return false;
            const normalizedCategory = product.category
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');
            return normalizedCategory === filterTag;
          });
        }

        setMdProducts(filtered.slice(0, 8));
      } catch (error) {
        console.error('[CategorySectionBlock] Erro ao carregar produtos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [filterTag, isSellerMode]);

  // Em modo vendedor: filtra DIRETAMENTE do contexto (sem state intermediário)
  const displayProducts: ProductData[] = isSellerMode
    ? sellerProducts
        .map((p) => ({
          id:       p.id,
          name:     p.name,
          price:    p.price,
          stock:    p.stock,
          imageUrl: p.imageUrl ?? '',
          category: p.category ?? '',
          tag:      p.tag ?? '',
          variants: [],
          isVisible: true,
        } as unknown as ProductData))
        .filter(product => {
          if (!filterTag) return true;
          if (!product.category) return false;
          const normalizedCategory = product.category
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
          return normalizedCategory === filterTag;
        })
        .slice(0, 8)
    : mdProducts;

  const handleProductClick = (product: ProductData) => {
    if (onAction) {
      // Passa o slug do contexto (funciona tanto para visitante quanto para vendedora logada)
      const sellerSuffix = isSellerMode && sellerSlug ? `?seller=${sellerSlug}` : '';
      onAction('open_product_details', product.id + (sellerSuffix ? `|${sellerSuffix}` : ''));
    }
  };

  const handleViewAllClick = () => {
    if (onAction) {
      onAction('view-category', { 
        category: title,
        filterTag: filterTag 
      });
    }
  };

  const rawBgColor = config.style.bgColor ?? 'transparent';
  const bgColor = rawBgColor === '#ffffff' ? 'transparent' : rawBgColor;
  const textColor = config.style.textColor ?? '#000000';

  // 🧱 Não renderiza se não houver produtos após carregar
  if (!isLoading && displayProducts.length === 0) {
    return null;
  }

  return (
    <section 
      // 🛡️ overflow-x-hidden: Impede que a página inteira balance horizontalmente
      className="w-full relative pt-4 pb-6 mt-2 mb-4 overflow-x-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* 🎀 BACKGROUND PINK ABSOLUTO (Efeito de Card com Limites)
          - touch-pan-y: Bloqueia arrasto horizontal no fundo pink. Só permite scroll vertical.
      */}
      <div className="absolute top-0 bottom-0 left-4 right-4 bg-pink-50 rounded-2xl shadow-sm border border-pink-100 touch-pan-y" />
      
      {/* CONTEÚDO RELATIVO (Fica por cima do background pink) */}
      <div className="relative z-10 flex flex-col w-full">
        
        {/* Header da Seção */}
        <div className="flex items-center justify-between mb-4 px-8">
          <h2 
            className="text-sm font-bold tracking-tight"
            style={{ color: textColor }}
          >
            {title}
          </h2>
          
          <button
            onClick={handleViewAllClick}
            className="flex items-center gap-1 text-[10px] font-medium hover:opacity-70 transition-opacity"
            style={{ color: config.style.accentColor ?? '#5874f6' }}
          >
            Ver todos
            <ChevronRight size={12} strokeWidth={3} />
          </button>
        </div>

        {/* Grid de Produtos */}
        {isLoading ? (
          <div className="flex overflow-x-hidden pb-2 w-full gap-3 scrollbar-hide">
            <div className="w-5 shrink-0" />
            {[...Array(4)].map((_, idx) => (
              <div 
                key={idx}
                className="bg-white border border-gray-100 shadow-sm rounded-xl p-1.5 shrink-0"
                style={{ width: '168px' }}
              >
                <div className="bg-gray-200 animate-pulse rounded-lg w-full" style={{ aspectRatio: '3/4' }} />
                <div className="bg-gray-200 animate-pulse h-3 w-3/4 mt-2 rounded-sm" />
                <div className="bg-gray-200 animate-pulse h-3 w-1/2 mt-1 rounded-sm" />
              </div>
            ))}
            <div className="w-5 shrink-0" />
          </div>
        ) : (
          /* 
            🛡️ overscroll-x-contain: Impede que o scroll do carrossel puxe a página inteira ao chegar no fim.
          */
          <div className="flex overflow-x-auto pb-4 pt-1 scrollbar-hide snap-x snap-mandatory w-full gap-3 scroll-pl-8 overscroll-x-contain">
            
            {/* Spacer Esquerdo: Mantém o alinhamento perfeito de 32px */}
            <div className="w-5 shrink-0" />

            {displayProducts.map((product, idx) => {
              const cardWidth = '168px';

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="shrink-0 snap-start bg-white rounded-xl shadow-sm border border-gray-200 p-1.5 flex flex-col"
                  style={{
                    width: cardWidth,
                    minWidth: cardWidth
                  }}
                >
                  <button
                    onClick={() => handleProductClick(product)}
                    className="w-full group text-left flex flex-col"
                  >
                    {/* Imagem do Produto */}
                    <div 
                      className="relative w-full rounded-lg overflow-hidden mb-2 bg-linear-to-br from-gray-100 to-gray-200"
                      style={{ aspectRatio: '3/4' }}
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-200 to-gray-300">
                          <ShoppingBag size={20} className="text-gray-400" />
                        </div>
                      )}
                      
                      {/* Badge de Estoque */}
                      {product.stock > 0 && (
                        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-full">
                          <span className="text-[8px] font-bold text-white leading-none">
                            {product.stock} un
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info do Produto */}
                    <div className="text-left px-1 flex flex-col w-full gap-2" style={{ minHeight: '80px' }}>
                      <h3 
                        className="text-[11px] font-medium line-clamp-3 leading-tight group-hover:opacity-70 transition-opacity"
                        style={{ color: textColor }}
                      >
                        {product.name}
                      </h3>

                      <div className="flex items-center justify-between mt-auto">
                        <p 
                          className="text-xs font-black leading-none"
                          style={{ color: config.style.accentColor ?? '#5874f6' }}
                        >
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(product.price)}
                        </p>

                        {/* 🏷️ ETIQUETA VENDIDO */}
                        {product.stock <= 0 && (
                          <div className="bg-orange-500 rounded-[4px] px-2 py-1 shrink-0 shadow-sm">
                            <span className="text-white text-[9px] font-bold uppercase leading-none block tracking-wider">
                              Vendido
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
            
            {/* Spacer Direito */}
            <div className="w-5 shrink-0" />
          </div>
        )}
      </div>
    </section>
  );
};

CategorySectionBlockBase.displayName = 'CategorySectionBlockBase';

/**
 * 🛡️ GUARDIAN: Exportação com metadados semânticos
 */
export const CategorySectionBlock = withGuardian(
  CategorySectionBlockBase,
  "components/builder/blocks/CategorySectionBlock.tsx",
  "UI_COMPONENT",
  {
    label: "Seção de Categoria (CMS Dinâmico)",
    description: "Bloco gerado automaticamente ao cadastrar produtos com nova categoria. Exibe produtos filtrados em slider horizontal com efeito de flutuação sobre um card de fundo.",
    orientationNotes: `
⚠️ **Pontos de Atenção**:
- **Geração Automática**: Criado dinamicamente por \`saveProductAction\`
- **Dependências**: \`getProductsAction\`, \`ProductData\`
- **UX**: Slider horizontal full-bleed. O fundo pink usa \`touch-pan-y\` e a section usa \`overflow-x-hidden\` para impedir que a página balance horizontalmente ao tentar arrastar o fundo. O carrossel usa \`overscroll-x-contain\` para isolar o scroll.
- **Filtro**: Usa \`filterTag\` para buscar produtos por categoria (campo Product.category)
- **Fluxo**: onAction('open-product-detail') ao clicar no produto
    `.trim(),
    connectsTo:[
      {
        target: "app/actions/product.ts",
        type: "DATABASE",
        description: "Busca produtos via getProductsAction"
      },
      {
        target: "app/actions/product.ts (saveProductAction)",
        type: "DATABASE",
        description: "Função que cria este bloco dinamicamente"
      }
    ]
  }
);