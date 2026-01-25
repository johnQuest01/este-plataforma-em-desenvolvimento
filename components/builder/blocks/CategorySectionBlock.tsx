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
 * - Framer Motion para animações
 * - Next.js Image para otimização
 * - TypeScript Strict Mode
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';
import { getProductsAction, ProductData } from '@/app/actions/product';
import { withGuardian } from "@/components/guardian/GuardianBeacon";

interface CategorySectionBlockBaseProps extends BlockComponentProps {}

const CategorySectionBlockBase = ({ config, onAction }: CategorySectionBlockBaseProps) => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const title = config.data.title ?? config.data.categoryName ?? 'Produtos';
  const filterTag = config.data.filterTag as string | undefined;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const allProducts = await getProductsAction();
        
        // 🔍 FILTRO POR CATEGORIA:
        // Filtra produtos que têm a categoria correspondente
        let filtered = allProducts;
        
        if (filterTag) {
          filtered = allProducts.filter(product => {
            if (!product.category) return false;
            
            // Normaliza a categoria do produto para comparação
            const normalizedCategory = product.category
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');
            
            return normalizedCategory === filterTag;
          });
        }
        
        // Limita a 8 produtos
        const limited = filtered.slice(0, 8);
        
        setProducts(limited);
      } catch (error) {
        console.error('[CategorySectionBlock] Erro ao carregar produtos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [filterTag]);

  const handleProductClick = (product: ProductData) => {
    if (onAction) {
      onAction('open_product_details', product.id); // 🧱 CORRIGIDO: Padronizado para open_product_details com ID
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

  const bgColor = config.style.bgColor ?? '#ffffff';
  const textColor = config.style.textColor ?? '#000000';

  // 🧱 NOVO: Não renderiza se não houver produtos após carregar
  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section 
      className="w-full py-6 px-4"
      style={{ backgroundColor: bgColor }}
    >
      {/* Header da Seção */}
      <div className="flex items-center justify-between mb-4">
        <h2 
          className="text-2xl font-bold tracking-tight"
          style={{ color: textColor }}
        >
          {title}
        </h2>
        
        <button
          onClick={handleViewAllClick}
          className="flex items-center gap-1 text-sm font-semibold hover:opacity-70 transition-opacity"
          style={{ color: config.style.accentColor ?? '#5874f6' }}
        >
          Ver todos
          <ChevronRight size={16} strokeWidth={3} />
        </button>
      </div>

      {/* Grid de Produtos */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, idx) => (
            <div 
              key={idx}
              className="bg-gray-200 animate-pulse rounded-2xl"
              style={{ aspectRatio: '3/4' }}
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div 
          className="text-center py-12 text-gray-400"
          style={{ color: `${textColor}40` }}
        >
          <p className="text-sm">Nenhum produto nesta categoria ainda.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4 pb-2">
          <div className="flex gap-4" style={{ width: 'max-content' }}>
            {products.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                className="flex-shrink-0 w-40 sm:w-48"
              >
                <button
                  onClick={() => handleProductClick(product)}
                  className="w-full group"
                >
                  {/* Imagem do Produto */}
                  <div 
                    className="relative w-full rounded-2xl overflow-hidden mb-3 bg-gradient-to-br from-gray-100 to-gray-200"
                    style={{ aspectRatio: '3/4' }}
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                        <ShoppingBag size={32} className="text-gray-400" />
                      </div>
                    )}
                    
                    {/* Badge de Estoque */}
                    {product.stock > 0 && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                        <span className="text-[10px] font-bold text-white">
                          {product.stock} un
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info do Produto */}
                  <div className="text-left">
                    <h3 
                      className="text-sm font-semibold line-clamp-2 mb-1 group-hover:opacity-70 transition-opacity"
                      style={{ color: textColor }}
                    >
                      {product.name}
                    </h3>
                    <p 
                      className="text-base font-bold"
                      style={{ color: config.style.accentColor ?? '#5874f6' }}
                    >
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(product.price)}
                    </p>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
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
    description: "Bloco gerado automaticamente ao cadastrar produtos com nova categoria. Exibe produtos filtrados em slider horizontal.",
    orientationNotes: `
⚠️ **Pontos de Atenção**:
- **Geração Automática**: Criado dinamicamente por \`saveProductAction\`
- **Dependências**: \`getProductsAction\`, \`ProductData\`
- **UX**: Slider horizontal, cards clicáveis, loading states
- **Filtro**: Usa \`filterTag\` para buscar produtos por categoria (campo Product.category)
- **Fluxo**: onAction('open-product-detail') ao clicar no produto
    `.trim(),
    connectsTo: [
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
