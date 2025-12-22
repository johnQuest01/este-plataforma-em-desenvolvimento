// hooks/usePosLogic.ts
import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProductData, getProductsAction } from '@/app/actions/product';
import { createOrderAction, getOrdersAction, OrderData } from '@/app/actions/order';
import { getCashRegisterStatus, openCashRegister, closeCashRegister, CashRegisterData } from '@/app/actions/cash';
import { getReadyForStoreItemsAction, dispatchFromStoreAction, returnToProductionAction } from '@/app/actions/production';
import { CartItem, PaymentMethod, CartVariation, ProductionItemData } from '@/types/builder';

export const usePosLogic = () => {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Estados de Dados
  const [products, setProducts] = useState<ProductData[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [salesHistory, setSalesHistory] = useState<OrderData[]>([]);
  const [incomingItems, setIncomingItems] = useState<ProductionItemData[]>([]);
  
  // Estados de UI/Controle
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('pix');
  const [customerName, setCustomerName] = useState('');
  const [customerDoc, setCustomerDoc] = useState('');
  const [emitInvoice, setEmitInvoice] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modais
  const [modals, setModals] = useState({
    mobileCart: false,
    cashOpen: false,
    cashClose: false,
    history: false,
    incoming: false
  });
  
  const [cashStatus, setCashStatus] = useState<CashRegisterData | null>(null);
  const [cashInput, setCashInput] = useState('');

  const toggleModal = (modal: keyof typeof modals, value: boolean) => {
    setModals(prev => ({ ...prev, [modal]: value }));
  };

  // --- EFEITOS ---
  useEffect(() => {
    const init = async () => {
      const [prodData, status, incItems] = await Promise.all([
        getProductsAction(),
        getCashRegisterStatus(),
        getReadyForStoreItemsAction()
      ]);
      setProducts(prodData);
      setCashStatus(status);
      setIncomingItems(incItems);

      if (!status.isOpen) toggleModal('cashOpen', true);
      else setTimeout(() => searchInputRef.current?.focus(), 500);
    };
    init();
    const interval = setInterval(async () => {
      const items = await getReadyForStoreItemsAction();
      setIncomingItems(items);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- LÓGICA DE PRODUTOS ---
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const lower = searchQuery.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(lower) || p.id.toLowerCase().includes(lower));
  }, [searchQuery, products]);

  const addToCart = (product: ProductData) => {
    if (!cashStatus?.isOpen) return;
    const existingItem = cart.find(item => item.product.id === product.id);
    const variations = product.variations as unknown as CartVariation[];
    const totalStock = variations.reduce((acc, v) => acc + (v.qty || 0), 0);
    
    if ((existingItem?.quantity || 0) + 1 > totalStock) return alert("⚠️ Estoque insuficiente.");

    if (existingItem) {
      setCart(prev => prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      const defaultVar = variations[0];
      setCart(prev => [...prev, {
        cartId: Math.random().toString(36).substr(2, 9),
        product: { ...product, variations },
        quantity: 1,
        variationLabel: defaultVar ? `${defaultVar.size || ''} ${defaultVar.color || ''}`.trim() : 'Padrão'
      }]);
    }
    setSearchQuery('');
    if (window.innerWidth >= 1024) searchInputRef.current?.focus();
  };

  // --- LÓGICA DO CARRINHO ---
  const updateQty = (cartId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartId !== cartId) return item;
      const newQty = item.quantity + delta;
      const totalStock = (item.product.variations as unknown as CartVariation[]).reduce((a, v) => a + (v.qty || 0), 0);
      return (delta > 0 && newQty > totalStock) ? item : { ...item, quantity: Math.max(1, newQty) };
    }));
  };

  const removeFromCart = (cartId: string) => setCart(prev => prev.filter(i => i.cartId !== cartId));
  
  const parsePrice = (p: string) => parseFloat(p.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  const subtotal = cart.reduce((acc, item) => acc + (parsePrice(item.product.price) * item.quantity), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // --- AÇÕES DO SISTEMA ---
  const handleOpenCash = async () => {
    const res = await openCashRegister(parseFloat(cashInput.replace(',', '.') || '0'), 'Admin');
    if (res.success && res.data) {
      setCashStatus(res.data);
      toggleModal('cashOpen', false);
      setCashInput('');
    } else alert("Erro ao abrir: " + res.message);
  };

  const handleCloseCash = async () => {
    const res = await closeCashRegister(parseFloat(cashInput.replace(',', '.') || '0'));
    if (res.success) {
      alert(res.diff === 0 ? "✅ Caixa OK!" : `Diferença: R$ ${res.diff?.toFixed(2)}`);
      setCashStatus(prev => prev ? { ...prev, isOpen: false } : null);
      toggleModal('cashClose', false);
      toggleModal('cashOpen', true);
      setCashInput('');
    } else alert("Erro ao fechar.");
  };

  const handleFinishSale = async () => {
    setIsProcessing(true);
    const res = await createOrderAction({
      title: cart.length === 1 ? cart[0].product.name : `${cart[0].product.name} + ${cart.length - 1} itens`,
      total: subtotal,
      itemsCount: totalItems,
      items: cart.map(c => ({ productId: c.product.id, quantity: c.quantity })),
      paymentMethod: selectedPayment,
      customerName: customerName || 'Cliente Balcão',
      customerDoc,
      emitInvoice
    });

    if (res.success) {
      alert("✅ Venda Finalizada!");
      setCart([]);
      setCustomerName(''); setCustomerDoc('');
      setProducts(await getProductsAction());
      if (selectedPayment === 'cash' && cashStatus) {
        setCashStatus({ ...cashStatus, currentBalance: cashStatus.currentBalance + subtotal });
      }
    } else alert("❌ Erro ao finalizar.");
    setIsProcessing(false);
    toggleModal('mobileCart', false);
    searchInputRef.current?.focus();
  };

  // Retorno simplificado para a View
  return {
    state: { 
      products, filteredProducts, cart, salesHistory, incomingItems, 
      cashStatus, modals, cashInput, searchQuery, subtotal, totalItems, isProcessing,
      payment: { selected: selectedPayment, customerName, customerDoc, emitInvoice }
    },
    refs: { searchInputRef },
    actions: {
      setSearchQuery, addToCart, removeFromCart, updateQty,
      setPayment: setSelectedPayment, setCustomerName, setCustomerDoc, setEmitInvoice, setCashInput,
      toggleModal, handleOpenCash, handleCloseCash, handleFinishSale,
      openHistory: async () => { toggleModal('history', true); setSalesHistory(await getOrdersAction()); },
      refreshIncoming: async () => setIncomingItems(await getReadyForStoreItemsAction()),
      confirmArrival: async (id: string) => {
        if(confirm("Liberar?")) { await dispatchFromStoreAction(id); setIncomingItems(p => p.filter(i => i.id !== id)); setProducts(await getProductsAction()); }
      },
      returnItem: async (id: string, r: string) => {
        if((await returnToProductionAction(id, r)).success) { setIncomingItems(p => p.filter(i => i.id !== id)); alert("Devolvido!"); }
      }
    }
  };
};