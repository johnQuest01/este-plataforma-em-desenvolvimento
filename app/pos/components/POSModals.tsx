import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogOut, History, X, FileText, PackageCheck, ClipboardList } from 'lucide-react';
import { ProductionItemData } from '@/types/builder';
import { IncomingStockCard } from './IncomingStockCard';

// --- INTERFACES ---

// Explicit Interface for the UI Component (Decoupled from DB)
export interface HistoryOrder {
  id: string;
  title: string;
  total: string | number;
  createdAt: string | Date; // Accepts both formats
  paymentMethod?: string;
  customerDoc?: string;
  hasInvoice?: boolean;
}

interface BaseModalProps { 
  isOpen: boolean; 
  onClose: () => void; 
}

interface CashModalProps {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onClose?: () => void;
}

// --- MODAL ABRIR CAIXA ---
export const OpenCashModal = ({ isOpen, value, onChange, onConfirm }: CashModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2"><Lock size={32} /></div>
          <h2 className="text-2xl font-black text-gray-900">Abrir Caixa</h2>
          <p className="text-sm text-gray-500">Informe o fundo de troco.</p>
          <input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0.00" autoFocus className="w-full h-12 border-2 border-gray-200 rounded-xl px-4 text-xl font-bold focus:border-[#5874f6] outline-none transition-all" />
          <button onClick={onConfirm} className="w-full h-12 bg-[#5874f6] text-white font-black uppercase rounded-xl hover:bg-blue-600 active:scale-95 transition-all shadow-lg">Iniciar</button>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- MODAL FECHAR CAIXA ---
export const CloseCashModal = ({ isOpen, onClose, value, onChange, onConfirm }: CashModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.9, opacity: 0}} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2"><LogOut size={32} /></div>
          <h2 className="text-2xl font-black text-gray-900">Fechar Caixa</h2>
          <p className="text-sm text-gray-500">Conte o dinheiro e informe o valor total.</p>
          <input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0.00" autoFocus className="w-full h-12 border-2 border-gray-200 rounded-xl px-4 text-xl font-bold focus:border-red-500 outline-none transition-all" />
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 h-12 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50">Cancelar</button>
            <button onClick={onConfirm} className="flex-1 h-12 bg-red-600 text-white font-black uppercase rounded-xl hover:bg-red-700 shadow-lg">Fechar</button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- MODAL HISTÓRICO ---
interface HistoryModalProps extends BaseModalProps {
  history: HistoryOrder[]; // Uses the strict interface
}

export const HistoryModal = ({ isOpen, onClose, history }: HistoryModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-end">
        <motion.div initial={{x: "100%"}} animate={{x: 0}} exit={{x: "100%"}} className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h2 className="font-black text-lg flex items-center gap-2"><History size={20}/> Histórico de Vendas</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={20}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f9fa]">
            {history.length === 0 ? <p className="text-center text-gray-400 mt-10">Nenhuma venda hoje.</p> : history.map(sale => (
              <div key={sale.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between font-bold text-sm">
                  <span>{sale.title}</span>
                  <span className="text-[#5874f6]">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(sale.total))}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    {new Date(sale.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <span>{sale.paymentMethod?.toUpperCase()}</span>
                </div>
                {sale.customerDoc && <div className="text-[10px] text-gray-400 mt-1">CPF: {sale.customerDoc}</div>}
                {sale.hasInvoice && <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md w-fit"><FileText size={10}/> Nota Emitida</div>}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- MODAL RECEBIMENTO (PRODUÇÃO) ---
interface IncomingItemsModalProps extends BaseModalProps {
  items: ProductionItemData[];
  onConfirm: (id: string) => void;
  onReturn: (id: string, reason: string) => void;
}

export const IncomingItemsModal = ({ isOpen, onClose, items, onConfirm, onReturn }: IncomingItemsModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm" />
        <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed left-0 top-0 h-full w-full max-w-lg bg-[#f8f9fa] shadow-2xl z-[110] border-r border-gray-200 flex flex-col">
          <div className="p-5 bg-white border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-black text-xl text-gray-900 flex items-center gap-2"><PackageCheck size={24} className="text-blue-600"/> Recebimento de Lotes</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <ClipboardList size={60} className="mb-4 opacity-50"/>
                <p className="text-base font-bold">Nenhum lote pendente</p>
                <p className="text-sm text-center">Aguardando envios da produção.</p>
              </div>
            ) : (
              items.map(item => <IncomingStockCard key={item.id} item={item} onConfirm={onConfirm} onReturn={onReturn} />)
            )}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);