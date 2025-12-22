import React from 'react';
import {
  ShoppingBag, Trash2, Plus, Minus, User, FileText, Printer,
  QrCode, CreditCard, Banknote, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CartItem, PaymentMethod } from '@/types/builder';

// --- SUB-COMPONENTES INTERNOS ---
const CartItemRow = ({ item, onRemove, onUpdate }: { item: CartItem, onRemove: (id: string) => void, onUpdate: (id: string, d: number) => void }) => {
    const parsePrice = (priceStr: string) => parseFloat(priceStr.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    return (
        <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                <img src={item.product.mainImage} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">{item.product.name}</span>
                    <button onClick={() => onRemove(item.cartId)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                </div>
                <div className="flex justify-between items-end mt-1">
                    <span className="text-[10px] text-gray-500 font-medium bg-gray-50 px-1.5 rounded">{item.variationLabel}</span>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-gray-100 rounded-md h-6">
                            <button onClick={() => onUpdate(item.cartId, -1)} className="w-6 flex items-center justify-center hover:bg-gray-200 rounded-l-md text-gray-600"><Minus size={12}/></button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => onUpdate(item.cartId, 1)} className="w-6 flex items-center justify-center hover:bg-gray-200 rounded-r-md text-gray-600"><Plus size={12}/></button>
                        </div>
                        <span className="text-sm font-black text-gray-900">R$ {(parsePrice(item.product.price) * item.quantity).toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PaymentButton = ({ icon: Icon, label, active, onClick }: { icon: React.ElementType, label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={cn("flex flex-col items-center justify-center py-2 rounded-xl border-2 transition-all", active ? "border-[#5874f6] bg-blue-50 text-[#5874f6]" : "border-gray-100 bg-white text-gray-400 hover:border-gray-300")}>
        <Icon size={20} strokeWidth={2} className="mb-1" />
        <span className="text-[10px] font-bold uppercase">{label}</span>
    </button>
);

// --- COMPONENTE PRINCIPAL ---
interface CartSidebarProps {
  cart: CartItem[];
  total: number;
  itemsCount: number;
  onRemove: (cartId: string) => void;
  onUpdate: (cartId: string, delta: number) => void;
  payment: PaymentMethod;
  setPayment: (method: PaymentMethod) => void;
  onFinish: () => void;
  processing: boolean;
  customerName: string;
  setCustomerName: (v: string) => void;
  customerDoc: string;
  setCustomerDoc: (v: string) => void;
  emitInvoice: boolean;
  setEmitInvoice: (v: boolean) => void;
}

export const CartSidebar = ({
  cart, total, itemsCount, onRemove, onUpdate,
  payment, setPayment, onFinish, processing,
  customerName, setCustomerName,
  customerDoc, setCustomerDoc,
  emitInvoice, setEmitInvoice,
}: CartSidebarProps) => {
  return (
    <div className="flex flex-col h-full">
      {/* PAINEL CLIENTE / NOTA */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white space-y-3">
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5874f6] transition-colors"><User size={18} /></div>
          <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nome do Cliente (Opcional)" className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold outline-none focus:border-[#5874f6] focus:bg-white transition-all" />
        </div>
        <div className="flex gap-2">
          <div className="relative group flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5874f6] transition-colors"><FileText size={18} /></div>
            <input type="text" value={customerDoc} onChange={(e) => setCustomerDoc(e.target.value)} placeholder="CPF/CNPJ" className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold outline-none focus:border-[#5874f6] focus:bg-white transition-all" />
          </div>
          <button onClick={() => setEmitInvoice(!emitInvoice)} className={cn("px-3 h-10 rounded-lg border-2 flex items-center justify-center transition-all", emitInvoice ? "bg-green-50 border-green-500 text-green-700" : "bg-gray-50 border-gray-200 text-gray-400")}>
            <Printer size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#f8f9fa]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
            <ShoppingBag size={64} className="mb-4 stroke-1" />
            <p className="font-bold">Sacola Vazia</p>
            <p className="text-xs text-center px-8">Bipe um produto para iniciar.</p>
          </div>
        ) : (
          cart.map((item) => <div key={item.cartId} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm"><CartItemRow item={item} onRemove={onRemove} onUpdate={onUpdate} /></div>)
        )}
      </div>

      <div className="bg-white p-6 border-t border-gray-200 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-10">
        <div className="mb-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Pagamento</span>
          <div className="grid grid-cols-4 gap-2">
            <PaymentButton icon={QrCode} label="Pix" active={payment === 'pix'} onClick={() => setPayment('pix')} />
            <PaymentButton icon={CreditCard} label="Crédito" active={payment === 'credit'} onClick={() => setPayment('credit')} />
            <PaymentButton icon={CreditCard} label="Débito" active={payment === 'debit'} onClick={() => setPayment('debit')} />
            <PaymentButton icon={Banknote} label="Dinheiro" active={payment === 'cash'} onClick={() => setPayment('cash')} />
          </div>
        </div>

        <div className="flex justify-between items-end mb-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Total a Pagar</span>
            <span className="text-3xl font-black text-gray-900 tracking-tight">R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md">{itemsCount} itens</span>
          </div>
        </div>

        <button onClick={onFinish} disabled={processing || cart.length === 0} className={cn("w-full h-14 bg-[#00c853] text-white rounded-xl font-black text-base uppercase tracking-widest shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 transition-all hover:bg-[#00b34a] active:scale-95 disabled:opacity-50 disabled:grayscale", processing && "animate-pulse")}>
          {processing ? "Processando..." : <><CheckCircle2 size={20} strokeWidth={3} /> {emitInvoice ? "Finalizar e Emitir Nota" : "Finalizar Venda"}</>}
        </button>
      </div>
    </div>
  );
};