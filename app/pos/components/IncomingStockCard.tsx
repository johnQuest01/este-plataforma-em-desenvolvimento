import React, { useState } from 'react';
import { ChevronUp, ChevronDown, AlertTriangle, Undo2, Send, PackageCheck } from 'lucide-react';
import { ProductionItemData } from '@/types/builder';

interface IncomingStockCardProps {
  item: ProductionItemData;
  onConfirm: (id: string) => void;
  onReturn: (id: string, reason: string) => void;
}

export const IncomingStockCard = ({ item, onConfirm, onReturn }: IncomingStockCardProps) => {
  const [showDetails, setShowDetails] = useState(true);
  const [isReturning, setIsReturning] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  const handleReturnClick = () => {
    if (!returnReason.trim()) return alert("⚠️ Digite o motivo da devolução.");
    onReturn(item.id, returnReason);
    setIsReturning(false);
    setReturnReason("");
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-md flex flex-col gap-4 w-full min-w-0 max-w-full">
      {/* Header */}
      <div className="flex gap-4 w-full">
        <div className="w-24 h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200 relative shadow-sm">
          {item.productImage ? (
             <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
               <PackageCheck size={24} />
             </div>
          )}
          <div className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs font-black px-2 py-1 rounded-tl-lg">
            {item.quantity} un
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h4 className="font-black text-gray-900 text-lg lg:text-xl uppercase leading-tight mb-2 break-words">
            {item.productName}
          </h4>
          <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-md w-fit block mb-2 border border-orange-200">
            AGUARDANDO LIBERAÇÃO
          </span>

          {!isReturning && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-auto flex items-center gap-1.5 text-xs lg:text-sm text-gray-600 font-bold hover:text-blue-600 transition-colors bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 w-fit"
            >
              {showDetails ? "Ocultar Grade" : "Ver Grade Completa"}
              {showDetails ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </button>
          )}
        </div>
      </div>

      {/* Return Mode */}
      {isReturning ? (
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 animate-in fade-in zoom-in-95 duration-200 w-full">
          <div className="flex items-center gap-2 mb-2 text-red-600 font-black uppercase text-xs tracking-wider">
            <AlertTriangle size={16} /> Devolver para Produção
          </div>
          <textarea
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="Descreva o problema..."
            className="w-full h-20 p-3 rounded-lg border border-red-200 text-sm font-bold text-gray-800 placeholder:text-red-300 focus:outline-none focus:border-red-500 bg-white mb-3 resize-none"
          />
          <div className="flex gap-2">
            <button onClick={() => setIsReturning(false)} className="flex-1 h-10 bg-white border border-red-200 text-red-400 font-bold text-xs uppercase rounded-lg hover:bg-red-50 transition-colors">
              Cancelar
            </button>
            <button onClick={handleReturnClick} className="flex-[2] h-10 bg-red-600 text-white font-bold text-xs uppercase rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
              <Send size={14} /> Enviar
            </button>
          </div>
        </div>
      ) : (
        <>
          {showDetails && item.variationsDetail && (
            <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 flex flex-col gap-2 max-h-60 overflow-y-auto w-full">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">Conferência</span>
              {item.variationsDetail.map((v, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm w-full">
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                    <span className="bg-gray-900 text-white font-black text-sm w-8 h-8 flex items-center justify-center rounded-lg shadow-sm shrink-0">
                      {v.size}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-gray-800 uppercase leading-tight break-words whitespace-normal">{v.color}</span>
                      {v.type && <span className="text-xs text-gray-500 italic mt-0.5 break-words whitespace-normal">{v.type}</span>}
                    </div>
                  </div>
                  <span className="font-black text-base text-blue-600 shrink-0 whitespace-nowrap">{v.qty} un</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2 border-t border-gray-100 w-full">
            <button onClick={() => setIsReturning(true)} className="h-12 px-4 border-2 border-red-100 text-red-500 rounded-xl font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200 transition-colors shrink-0" title="Devolver para Produção">
              <Undo2 size={20} />
            </button>
            <button onClick={() => onConfirm(item.id)} className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 min-w-0 truncate">
              <PackageCheck size={20} className="shrink-0" /> <span className="truncate">Liberar Mercadoria</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};