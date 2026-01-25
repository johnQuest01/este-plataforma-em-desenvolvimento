'use client';

/**
 * 🛡️ PAINEL DE GERENCIAMENTO DE BANCO DE DADOS
 * 
 * Interface administrativa para gerenciar dados do sistema:
 * - Deletar produtos individuais
 * - Deletar categorias completas
 * - Resetar tela inicial (UIConfig)
 * - Limpar banco de dados completo
 * - Limpar localStorage
 * 
 * ⚠️ AÇÕES DESTRUTIVAS - Use com cuidado!
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  Database,
  Folder,
  Package,
  LayoutDashboard,
  HardDrive
} from 'lucide-react';
import { 
  deleteProductAction, 
  deleteCategoryAction, 
  resetDatabaseAction,
  resetHomeLayoutAction,
  getProductsAction,
  ProductData
} from '@/app/actions/product';
import { LocalDB } from '@/lib/local-db';

export const DatabaseManagementPanel = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    type: 'product' | 'category' | 'resetLayout' | 'resetDatabase' | 'clearLocalStorage';
    data?: string;
  } | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await getProductsAction();
    setProducts(data);
    setIsLoading(false);
  };

  // Agrupa produtos por categoria
  const categoriesMap = products.reduce((acc, product) => {
    const cat = product.category || 'Sem Categoria';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(product);
    return acc;
  }, {} as Record<string, ProductData[]>);

  const handleDeleteProduct = async (productId: string) => {
    const result = await deleteProductAction(productId);
    if (result.success) {
      alert('✅ Produto deletado com sucesso!');
      loadProducts();
    } else {
      alert(`❌ Erro: ${result.error}`);
    }
    setShowConfirmDialog(null);
  };

  const handleDeleteCategory = async (category: string) => {
    const result = await deleteCategoryAction(category);
    if (result.success) {
      alert(`✅ Categoria "${category}" deletada! ${result.deletedCount} produtos removidos.`);
      loadProducts();
    } else {
      alert(`❌ Erro: ${result.error}`);
    }
    setShowConfirmDialog(null);
  };

  const handleResetLayout = async () => {
    const result = await resetHomeLayoutAction();
    if (result.success) {
      alert('✅ Tela inicial resetada! Recarregue a página.');
    } else {
      alert(`❌ Erro: ${result.error}`);
    }
    setShowConfirmDialog(null);
  };

  const handleResetDatabase = async () => {
    const result = await resetDatabaseAction();
    if (result.success) {
      alert(`✅ Banco de dados limpo!\n\nEstatísticas:\n- Produtos: ${result.stats?.products}\n- Variantes: ${result.stats?.variants}\n- Pedidos: ${result.stats?.orders}\n- Produção: ${result.stats?.productionItems}`);
      loadProducts();
    } else {
      alert(`❌ Erro: ${result.error}`);
    }
    setShowConfirmDialog(null);
  };

  const handleClearLocalStorage = () => {
    localStorage.clear();
    alert('✅ LocalStorage limpo! Recarregue a página.');
    setShowConfirmDialog(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle size={32} />
          <h1 className="text-2xl font-bold">Painel de Gerenciamento</h1>
        </div>
        <p className="text-white/80 text-sm">
          ⚠️ ATENÇÃO: Todas as ações abaixo são irreversíveis. Use com cuidado!
        </p>
      </div>

      {/* Ações Globais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setShowConfirmDialog({ type: 'resetLayout' })}
          className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border-2 border-blue-200"
        >
          <LayoutDashboard className="text-blue-600" size={24} />
          <div className="text-left">
            <h3 className="font-bold text-blue-900">Resetar Tela Inicial</h3>
            <p className="text-xs text-blue-600">Remove seções dinâmicas (mantém produtos)</p>
          </div>
        </button>

        <button
          onClick={() => setShowConfirmDialog({ type: 'clearLocalStorage' })}
          className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border-2 border-purple-200"
        >
          <HardDrive className="text-purple-600" size={24} />
          <div className="text-left">
            <h3 className="font-bold text-purple-900">Limpar LocalStorage</h3>
            <p className="text-xs text-purple-600">Remove dados salvos no navegador</p>
          </div>
        </button>

        <button
          onClick={() => setShowConfirmDialog({ type: 'resetDatabase' })}
          className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border-2 border-red-200 md:col-span-2"
        >
          <Database className="text-red-600" size={24} />
          <div className="text-left">
            <h3 className="font-bold text-red-900">🔥 LIMPAR BANCO DE DADOS COMPLETO</h3>
            <p className="text-xs text-red-600">Deleta TODOS produtos, pedidos e configurações</p>
          </div>
        </button>
      </div>

      {/* Lista de Categorias e Produtos */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Package size={24} />
          Produtos por Categoria
        </h2>

        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Carregando...</div>
        ) : Object.keys(categoriesMap).length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Nenhum produto cadastrado
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(categoriesMap).map(([category, categoryProducts]) => (
              <div key={category} className="border-2 border-gray-200 rounded-xl p-4">
                {/* Header da Categoria */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Folder className="text-orange-500" size={20} />
                    <h3 className="font-bold text-lg">{category}</h3>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                      {categoryProducts.length} produtos
                    </span>
                  </div>
                  <button
                    onClick={() => setShowConfirmDialog({ 
                      type: 'category', 
                      data: category 
                    })}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Trash2 size={16} />
                    Deletar Categoria
                  </button>
                </div>

                {/* Lista de Produtos */}
                <div className="space-y-2">
                  {categoryProducts.map((product) => (
                    <div 
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center">
                            <Package size={20} className="text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            {product.variants.length} variações • 
                            R$ {product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowConfirmDialog({ 
                          type: 'product', 
                          data: product.id 
                        })}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de Confirmação */}
      <AnimatePresence>
        {showConfirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowConfirmDialog(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-500" size={32} />
                <h3 className="text-xl font-bold">Confirmar Ação</h3>
              </div>

              <p className="text-gray-700 mb-6">
                {showConfirmDialog.type === 'product' && 'Tem certeza que deseja deletar este produto?'}
                {showConfirmDialog.type === 'category' && `Tem certeza que deseja deletar a categoria "${showConfirmDialog.data}" e TODOS os seus produtos?`}
                {showConfirmDialog.type === 'resetLayout' && 'Tem certeza que deseja resetar a tela inicial? Todas as seções dinâmicas serão removidas.'}
                {showConfirmDialog.type === 'resetDatabase' && '🔥 ATENÇÃO: Esta ação irá deletar TODOS os dados do sistema! Produtos, pedidos, configurações... TUDO! Esta ação é IRREVERSÍVEL!'}
                {showConfirmDialog.type === 'clearLocalStorage' && 'Tem certeza que deseja limpar o LocalStorage? Você precisará fazer login novamente.'}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (showConfirmDialog.type === 'product' && showConfirmDialog.data) {
                      handleDeleteProduct(showConfirmDialog.data);
                    } else if (showConfirmDialog.type === 'category' && showConfirmDialog.data) {
                      handleDeleteCategory(showConfirmDialog.data);
                    } else if (showConfirmDialog.type === 'resetLayout') {
                      handleResetLayout();
                    } else if (showConfirmDialog.type === 'resetDatabase') {
                      handleResetDatabase();
                    } else if (showConfirmDialog.type === 'clearLocalStorage') {
                      handleClearLocalStorage();
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
