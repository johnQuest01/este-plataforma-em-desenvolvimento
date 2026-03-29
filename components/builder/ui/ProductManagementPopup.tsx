// components/builder/ui/ProductManagementPopup.tsx
'use client';

/**
 * 🧱 PRODUCT MANAGEMENT POPUP
 * 
 * Modal para gerenciar produtos existentes com opção de deletar.
 * Exibe lista de produtos agrupados por categoria com botão de exclusão.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Package, AlertTriangle, Loader2, ChevronDown, ChevronUp, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProductsAction, deleteProductAction, deleteCategoryAction, ProductData } from '@/app/actions/product';
import { formatCurrencyBRL } from '@/lib/utils/currency';
import Image from 'next/image';
import { withGuardian } from '@/components/guardian/GuardianBeacon';
import { BannerBuilderForm } from '@/components/builder/blocks/BannerBuilderForm';

interface ProductManagementPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onProductDeleted?: () => void;
}

const ProductManagementPopupBase = ({ isOpen, onClose, onProductDeleted }: ProductManagementPopupProps) => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const[deletingId, setDeletingId] = useState<string | null>(null);
  const[deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; type: 'product' | 'category' } | null>(null);
  
  const [showBannerBuilder, setShowBannerBuilder] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getProductsAction();
      setProducts(data ||[]);
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const productsByCategory = products.reduce<Record<string, ProductData[]>>((acc, product) => {
    const category = product.category || 'Sem Categoria';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  const categories = Object.keys(productsByCategory).sort();

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDeleteProduct = async (productId: string) => {
    setDeletingId(productId);
    try {
      const result = await deleteProductAction(productId);
      if (result.success) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        if (onProductDeleted) {
          onProductDeleted();
        }
      } else {
        alert(`Erro ao deletar produto: ${result.error || 'Desconhecido'}`);
      }
    } catch (error) {
      console.error('❌ Erro ao deletar produto:', error);
      alert('Erro ao deletar produto');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const handleDeleteCategory = async (category: string) => {
    setDeletingCategory(category);
    try {
      const result = await deleteCategoryAction(category);
      if (result.success) {
        setProducts(prev => prev.filter(p => (p.category || 'Sem Categoria') !== category));
        if (onProductDeleted) {
          onProductDeleted();
        }
      } else {
        alert(`Erro ao deletar categoria: ${result.error || 'Desconhecido'}`);
      }
    } catch (error) {
      console.error('❌ Erro ao deletar categoria:', error);
      alert('Erro ao deletar categoria');
    } finally {
      setDeletingCategory(null);
      setConfirmDelete(null);
    }
  };

  const handleBannerCreated = () => {
    setShowBannerBuilder(false);
    alert('✅ Banner criado com sucesso!');
    if (onProductDeleted) {
      onProductDeleted();
    }
  };

  // 🛡️ CORREÇÃO DE ARQUITETURA: Removido o `if (!isOpen) return null;` 
  // para permitir que o AnimatePresence execute a animação de saída (exit).
  return (
    <AnimatePresence>
      {isOpen && (
        // 🧱 AJUSTE MILIMÉTRICO: pb-12 + pb-safe-bottom
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 pb-12 pb-safe-bottom">
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            // 🧱 AJUSTE MILIMÉTRICO: y: 15 na entrada e y: 10 na saída
            initial={{ scale: 0.96, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className={cn(
              'relative bg-white rounded-3xl shadow-2xl overflow-hidden',
              // 🧱 AJUSTE MILIMÉTRICO: 82dvh e mb-4
              'w-full max-w-2xl h-[82dvh] max-h-[800px] mb-4',
              'flex flex-col will-change-transform'
            )}
          >
            {/* Header */}
            <div className="shrink-0 bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Package size={24} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black tracking-tight">Gerenciar Produtos</h2>
                  <p className="text-sm text-white/80 font-medium mt-1">
                    {products.length} produto{products.length !== 1 ? 's' : ''} • {categories.length} categoria{categories.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBannerBuilder(true)}
                className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-black hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <ImagePlus size={20} />
                Criar Novo Banner
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 size={32} className="animate-spin text-gray-400" />
                  <p className="text-sm text-gray-500 font-medium">Carregando produtos...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-60">
                  <Package size={48} className="text-gray-300" />
                  <p className="text-sm text-gray-500 font-bold">Nenhum produto cadastrado</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {categories.map(category => {
                    const categoryProducts = productsByCategory[category];
                    const isExpanded = expandedCategories.has(category);
                    const isDeletingThis = deletingCategory === category;

                    return (
                      <div key={category} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                          <button
                            onClick={() => toggleCategory(category)}
                            className="flex items-center gap-3 flex-1 text-left group"
                          >
                            {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                            <div className="flex-1">
                              <h3 className="font-black text-gray-900 text-base">{category}</h3>
                              <p className="text-xs text-gray-500 font-medium">{categoryProducts.length} produto{categoryProducts.length !== 1 ? 's' : ''}</p>
                            </div>
                          </button>
                          
                          <button
                            onClick={() => setConfirmDelete({ id: category, name: category, type: 'category' })}
                            disabled={isDeletingThis}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                            title="Deletar categoria e todos os produtos"
                          >
                            {isDeletingThis ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-2 space-y-2">
                                {categoryProducts.map(product => {
                                  const isDeleting = deletingId === product.id;
                                  
                                  return (
                                    <div
                                      key={product.id}
                                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                                    >
                                      <div className="relative w-16 h-16 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                                        {product.imageUrl ? (
                                          <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <Package size={24} className="text-gray-400" />
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-gray-900 truncate">{product.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-xs font-black text-blue-600">{formatCurrencyBRL(product.price)}</span>
                                          <span className="text-xs text-gray-400">•</span>
                                          <span className="text-xs text-gray-500 font-medium">{product.stock} un</span>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => setConfirmDelete({ id: product.id, name: product.name, type: 'product' })}
                                        disabled={isDeleting}
                                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                      >
                                        {isDeleting ? (
                                          <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                          <Trash2 size={16} />
                                        )}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Confirmation Dialog */}
          <AnimatePresence>
            {confirmDelete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[400] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 10 }}
                  className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <AlertTriangle size={24} className="text-red-600" />
                    </div>
                    <h3 className="font-black text-lg text-gray-900">Confirmar Exclusão</h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-6">
                    {confirmDelete.type === 'category' ? (
                      <>
                        Deseja realmente deletar a categoria <strong>{confirmDelete.name}</strong> e todos os seus{' '}
                        <strong>{productsByCategory[confirmDelete.id]?.length || 0} produtos</strong>?
                        <br /><br />
                        <span className="text-red-600 font-semibold">Esta ação não pode ser desfeita!</span>
                      </>
                    ) : (
                      <>
                        Deseja realmente deletar o produto <strong>{confirmDelete.name}</strong>?
                        <br /><br />
                        <span className="text-red-600 font-semibold">Esta ação não pode ser desfeita!</span>
                      </>
                    )}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        if (confirmDelete.type === 'category') {
                          handleDeleteCategory(confirmDelete.id);
                        } else {
                          handleDeleteProduct(confirmDelete.id);
                        }
                      }}
                      className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                    >
                      Deletar
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 🎨 NOVO: Banner Builder Modal com AnimatePresence para saída suave */}
          <AnimatePresence>
            {showBannerBuilder && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[500] flex items-center justify-center p-4 pb-12 pb-safe-bottom bg-black/80 backdrop-blur-sm"
                onClick={() => setShowBannerBuilder(false)}
              >
                <motion.div
                  initial={{ scale: 0.96, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.98, opacity: 0, y: 10 }}
                  transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl h-[82dvh] max-h-[800px] mb-4 flex flex-col will-change-transform"
                >
                  <div className="shrink-0 bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white relative">
                    <button
                      onClick={() => setShowBannerBuilder(false)}
                      className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <X size={20} />
                    </button>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <ImagePlus size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight">Criar Novo Banner</h2>
                        <p className="text-sm text-white/80 font-medium mt-1">
                          Proporções rígidas para mobile perfeito
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <BannerBuilderForm
                      onSuccess={handleBannerCreated}
                      onCancel={() => setShowBannerBuilder(false)}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}
    </AnimatePresence>
  );
};

ProductManagementPopupBase.displayName = 'ProductManagementPopupBase';

export const ProductManagementPopup = withGuardian(
  ProductManagementPopupBase,
  'components/builder/ui/ProductManagementPopup.tsx',
  'POPUP',
  {
    label: 'Popup de Gerenciamento de Produtos',
    description: 'Modal para visualizar e deletar produtos existentes, agrupados por categoria.',
    orientationNotes: `
⚠️ **Pontos de Atenção**:
- **Exclusão de Produto**: Deleta produto individual do banco e localStorage
- **Exclusão de Categoria**: Deleta todos os produtos da categoria + bloco da Home
- **Confirmação**: Sempre exige confirmação antes de deletar
- **Z-Index**: z-300 para sobrepor outros modais
- **Safe Area**: Utiliza pb-12 + pb-safe-bottom e 82dvh para evitar sobreposição com a Home Indicator do iOS.
    `.trim(),
    connectsTo:[
      {
        target: 'app/actions/product.ts',
        type: 'DATABASE',
        description: 'getProductsAction, deleteProductAction, deleteCategoryAction'
      }
    ]
  }
);