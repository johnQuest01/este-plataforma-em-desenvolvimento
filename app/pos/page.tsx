'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingBag, X, ChevronLeft, PackageCheck, History, LogOut, Barcode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ACTIONS
import { ProductData, getProductsAction } from '@/app/actions/product';
import { createOrderAction, getOrdersAction } from '@/app/actions/order';
import { getCashRegisterStatus, openCashRegister, closeCashRegister, CashRegisterData } from '@/app/actions/cash';
import { getReadyForStoreItemsAction, dispatchFromStoreAction, returnToProductionAction } from '@/app/actions/production';
import { CartItem, PaymentMethod, ProductionItemData, CartVariation, CartProduct, FooterItem } from '@/types/builder'; // Import CartProduct e CartVariation

// COMPONENTES
import { CartSidebar } from './components/CartSidebar';
import { 
  OpenCashModal, 
  CloseCashModal, 
  HistoryModal, 
  IncomingItemsModal,
  HistoryOrder 
} from './components/POSModals';

export default function POSPage() {
  const router = useRouter();

  // --- ESTADOS ---
  const [products, setProducts] = useState<ProductData[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('pix');
  const [customerName, setCustomerName] = useState('');
  const [customerDoc, setCustomerDoc] = useState('');
  const [emitInvoice, setEmitInvoice] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  
  // Caixa e Modais
  const [cashStatus, setCashStatus] = useState<CashRegisterData | null>(null);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isCloseRegisterOpen, setIsCloseRegisterOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [cashInput, setCashInput] = useState('');
  
  // Typed History State
  const [salesHistory, setSalesHistory] = useState<HistoryOrder[]>([]);
  
  // Produção
  const [incomingItems, setIncomingItems] = useState<ProductionItemData[]>([]);
  const [isIncomingModalOpen, setIsIncomingModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- LOGICA E EFEITOS ---
  const fetchIncomingItems = async () => {
    try {
      const items = await getReadyForStoreItemsAction();
      setIncomingItems(items);
    } catch (e) { console.error("Erro ao buscar produção", e); }
  };

  const handleConfirmArrival = async (id: string) => {
    if(!confirm("Liberar Mercadoria para o estoque e remover da produção?")) return;
    await dispatchFromStoreAction(id);
    setIncomingItems(prev => prev.filter(i => i.id !== id));
    const prodData = await getProductsAction();
    setProducts(prodData);
    alert("✅ Mercadoria Liberada! Produto removido da Produção.");
  };

  const handleReturnToProduction = async (id: string, reason: string) => {
    try {
      const result = await returnToProductionAction(id, reason);
      if (result.success) {
        setIncomingItems(prev => prev.filter(i => i.id !== id));
        alert("↩️ Lote devolvido para a produção com sucesso!");
      } else {
        const errorMsg = (result as { message?: string }).message || 'Erro desconhecido';
        alert("❌ Erro ao devolver lote: " + errorMsg);
      }
    } catch (e) { console.error(e); alert("Erro de conexão."); }
  };

  useEffect(() => {
    const init = async () => {
      const prodData = await getProductsAction();
      setProducts(prodData);
      const status = await getCashRegisterStatus();
      setCashStatus(status);
      if (!status.isOpen) setIsCashModalOpen(true);
      else setTimeout(() => searchInputRef.current?.focus(), 500);
      fetchIncomingItems();
    };
    init();
    const interval = setInterval(fetchIncomingItems, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenCash = async () => {
    const amount = parseFloat(cashInput.replace(',', '.') || '0');
    const result = await openCashRegister(amount, 'Admin');
    if (result.success && result.data) {
      setCashStatus(result.data);
      setIsCashModalOpen(false);
      setCashInput('');
      setTimeout(() => searchInputRef.current?.focus(), 500);
    } else alert("Erro ao abrir caixa: " + result.message);
  };

  const handleCloseCash = async () => {
    const amount = parseFloat(cashInput.replace(',', '.') || '0');
    const result = await closeCashRegister(amount);
    if (result.success) {
      const diff = result.diff || 0;
      const statusMsg = diff === 0 ? "✅ Caixa bateu!" : diff > 0 ? `⚠️ Sobra: R$ ${diff.toFixed(2)}` : `❌ Falta: R$ ${Math.abs(diff).toFixed(2)}`;
      alert(`Caixa Fechado!\n\n${statusMsg}`);
      setCashStatus(prev => prev ? { ...prev, isOpen: false } : null);
      setIsCloseRegisterOpen(false);
      setIsCashModalOpen(true);
      setCashInput('');
    } else alert("Erro ao fechar caixa.");
  };

  const handleOpenHistory = async () => {
    setIsHistoryOpen(true);
    const orders = await getOrdersAction();
    
    const mappedHistory: HistoryOrder[] = orders.map(order => ({
      id: order.id,
      title: order.title,
      total: order.total,
      createdAt: order.createdAt,
      paymentMethod: order.paymentMethod,
      customerDoc: order.customerDoc || undefined,
      hasInvoice: order.hasInvoice
    }));
    
    setSalesHistory(mappedHistory);
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const lower = searchQuery.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(lower) || p.id.toLowerCase().includes(lower));
  }, [searchQuery, products]);

  const addToCart = (product: ProductData) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    const variants = product.variants || [];
    const totalStock = variants.reduce((acc: number, v) => acc + (v.stock || 0), 0);
    const currentInCart = existingItem ? existingItem.quantity : 0;

    if (currentInCart + 1 > totalStock) return alert("⚠️ Estoque insuficiente.");

    if (existingItem) {
      setCart(prev => prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      const defaultVar = variants[0];
      
      // ✅ CORREÇÃO: Mapeamento explícito para CartProduct
      const cartProduct: CartProduct = {
        id: product.id,
        name: product.name,
        // Garante que price seja number
        price: typeof product.price === 'number' ? product.price : Number(product.price),
        mainImage: product.imageUrl || '',
        // Mapeia as variações do ProductData para CartVariation
        variations: (product.variants || []).map(v => ({
            qty: v.stock,
            size: v.size || undefined,
            color: v.color || undefined
        }))
      };

      const newCartItem: CartItem = {
        cartId: Math.random().toString(36).substr(2, 9),
        product: cartProduct,
        quantity: 1,
        variationLabel: defaultVar ? defaultVar.name || 'Padrão' : 'Padrão'
      };
      setCart(prev => [...prev, newCartItem]);
    }
    setSearchQuery('');
    if (window.innerWidth >= 1024) searchInputRef.current?.focus();
  };

  const updateQty = (cartId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newQty = item.quantity + delta;
        if (delta > 0) {
          // Casting seguro pois sabemos a estrutura
          const vars = item.product.variations as CartVariation[];
          const maxStock = vars ? vars.reduce((acc, v) => acc + (v.qty || 0), 0) : 0;
          if (newQty > maxStock) return item;
        }
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  // ✅ CORREÇÃO: Cálculo direto com number
  const subtotal = cart.reduce((acc, item) => {
    // Garante que price seja tratado como number
    const price = typeof item.product.price === 'number' ? item.product.price : Number(item.product.price);
    return acc + (price * item.quantity);
  }, 0);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleFinishSale = async () => {
    if (cart.length === 0) return alert("Carrinho vazio!");
    setIsProcessing(true);
    const result = await createOrderAction({
      title: cart.length === 1 ? cart[0].product.name : `${cart[0].product.name} + ${cart.length - 1} itens`,
      total: subtotal,
      itemsCount: totalItems,
      items: cart.map(c => ({ productId: c.product.id, quantity: c.quantity })),
      paymentMethod: selectedPayment,
      customerName: customerName || 'Cliente Balcão',
      customerDoc,
      emitInvoice
    });

    if (result.success) {
      let msg = "✅ Venda Finalizada!";
      if (emitInvoice) msg += "\n📄 Nota Fiscal Emitida (Simulação).";
      alert(msg);
      setCart([]); setCustomerName(''); setCustomerDoc('');
      const updatedProducts = await getProductsAction();
      setProducts(updatedProducts);
      if (selectedPayment === 'cash' && cashStatus) setCashStatus({ ...cashStatus, currentBalance: cashStatus.currentBalance + subtotal });
    } else alert("❌ Erro ao finalizar venda.");
    setIsProcessing(false);
    setIsMobileCartOpen(false);
    searchInputRef.current?.focus();
  };

  // --- RENDER ---
  return (
    <main className="w-full h-dvh bg-[#f0f2f5] flex flex-col lg:flex-row overflow-hidden font-sans text-gray-900">
      
      {/* --- MODAIS --- */}
      <OpenCashModal isOpen={isCashModalOpen} value={cashInput} onChange={setCashInput} onConfirm={handleOpenCash} />
      <CloseCashModal isOpen={isCloseRegisterOpen} onClose={() => setIsCloseRegisterOpen(false)} value={cashInput} onChange={setCashInput} onConfirm={handleCloseCash} />
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} history={salesHistory} />
      <IncomingItemsModal isOpen={isIncomingModalOpen} onClose={() => setIsIncomingModalOpen(false)} items={incomingItems} onConfirm={handleConfirmArrival} onReturn={handleReturnToProduction} />

      {/* --- LADO ESQUERDO: PRODUTOS --- */}
      <div className="flex-1 flex flex-col h-full relative z-0">
        <header className="bg-white px-6 py-4 flex items-center justify-between shadow-sm shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/inventory')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black text-[#5874f6] tracking-tight leading-none">PDV</h1>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                {cashStatus?.isOpen ? `Op: ${cashStatus.operator}` : 'Fechado'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsIncomingModalOpen(true)} 
              className="relative flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors font-bold text-xs"
            >
              <PackageCheck size={16} /> 
              <span className="hidden lg:inline">Recebimento</span>
              {incomingItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                  {incomingItems.length}
                </span>
              )}
            </button>
            <button 
              onClick={handleOpenHistory} 
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs hover:bg-blue-100 transition-colors"
            >
              <History size={16}/> <span className="hidden sm:inline">Histórico</span>
            </button>
            <button 
              onClick={() => { setCashInput(''); setIsCloseRegisterOpen(true); }} 
              className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-xs hover:bg-red-100 transition-colors"
            >
              <LogOut size={16}/> <span className="hidden sm:inline">Fechar Caixa</span>
            </button>
          </div>
        </header>

        <div className="px-4 lg:px-6 py-4 bg-white border-b border-gray-100">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5874f6] transition-colors">
              <Barcode size={24} />
            </div>
            <input 
              ref={searchInputRef} 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              onKeyDown={(e) => { if (e.key === 'Enter' && filteredProducts.length === 1) addToCart(filteredProducts[0]); }} 
              disabled={!cashStatus?.isOpen} 
              placeholder={cashStatus?.isOpen ? "Bipar código ou digitar nome..." : "Caixa Fechado"} 
              className="w-full h-14 pl-12 pr-4 bg-gray-100 border-2 border-transparent focus:bg-white focus:border-[#5874f6] rounded-xl text-lg font-bold outline-none transition-all disabled:opacity-50" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-hide">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4 pb-24 lg:pb-0">
            {filteredProducts.map(product => {
              const variants = product.variants || [];
              const totalStock = variants.reduce((acc: number, v) => acc + (v.stock || 0), 0);
              
              return (
                <button 
                  key={product.id} 
                  onClick={() => addToCart(product)} 
                  disabled={!cashStatus?.isOpen || totalStock === 0} 
                  className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm hover:border-[#5874f6] hover:shadow-md transition-all active:scale-95 flex flex-col gap-2 group text-left h-full disabled:opacity-50"
                >
                  <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden relative">
                    {product.imageUrl ? (
                        <Image 
                          src={product.imageUrl} 
                          alt={product.name} 
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 50vw, 20vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <PackageCheck size={32}/>
                        </div>
                    )}
                    <div className={cn("absolute top-2 right-2 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm", totalStock > 0 ? "bg-black/60" : "bg-red-500")}>
                      {totalStock > 0 ? `${totalStock} un` : 'Esgotado'}
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs lg:text-sm font-bold text-gray-800 line-clamp-2 leading-tight min-h-[2.5em]">
                      {product.name}
                    </span>
                    <span className="text-sm lg:text-base font-black text-[#5874f6]">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- LADO DIREITO: CARRINHO (DESKTOP) --- */}
      <div className="hidden lg:flex w-[400px] bg-white border-l border-gray-200 flex-col shadow-2xl z-30 h-full">
        <CartSidebar 
          cart={cart} 
          total={subtotal} 
          itemsCount={totalItems} 
          onRemove={(id) => setCart(p => p.filter(i => i.cartId !== id))} 
          onUpdate={updateQty} 
          payment={selectedPayment} 
          setPayment={setSelectedPayment} 
          onFinish={handleFinishSale} 
          processing={isProcessing} 
          customerName={customerName} 
          setCustomerName={setCustomerName} 
          customerDoc={customerDoc} 
          setCustomerDoc={setCustomerDoc} 
          emitInvoice={emitInvoice} 
          setEmitInvoice={setEmitInvoice} 
        />
      </div>

      {/* --- MOBILE BAR (PDV específico) --- */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 pb-20 z-40 flex items-center justify-between shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col" onClick={() => setIsMobileCartOpen(true)}>
          <span className="text-xs font-bold text-gray-400 uppercase">Total</span>
          <span className="text-xl font-black text-gray-900">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
          </span>
        </div>
        <button 
          onClick={() => setIsMobileCartOpen(true)} 
          className="bg-[#5874f6] text-white px-6 py-3 rounded-xl font-bold shadow-lg active:scale-95 flex items-center gap-2"
        >
          <ShoppingBag size={20} /> <span>Ver Sacola</span>
        </button>
      </div>

      {/* --- DRAWER MOBILE --- */}
      <AnimatePresence>
        {isMobileCartOpen && (
          <div className="fixed inset-0 z-100 lg:hidden flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setIsMobileCartOpen(false)} 
            />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              className="bg-white w-full h-[90vh] rounded-t-4xl flex flex-col relative z-10 overflow-hidden pb-20"
            >
              <div className="p-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
                <h2 className="font-black text-lg text-gray-800 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-[#5874f6]" /> Sacola
                </h2>
                <button onClick={() => setIsMobileCartOpen(false)} className="p-2 bg-white rounded-full border shadow-sm">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col">
                <CartSidebar 
                  cart={cart} 
                  total={subtotal} 
                  itemsCount={totalItems} 
                  onRemove={(id) => setCart(p => p.filter(i => i.cartId !== id))} 
                  onUpdate={updateQty} 
                  payment={selectedPayment} 
                  setPayment={setSelectedPayment} 
                  onFinish={handleFinishSale} 
                  processing={isProcessing} 
                  customerName={customerName} 
                  setCustomerName={setCustomerName} 
                  customerDoc={customerDoc} 
                  setCustomerDoc={setCustomerDoc} 
                  emitInvoice={emitInvoice} 
                  setEmitInvoice={setEmitInvoice} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}