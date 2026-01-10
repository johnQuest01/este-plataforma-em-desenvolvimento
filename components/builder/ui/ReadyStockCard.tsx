'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { ProductionItemData, ProductionVariationDetail } from '@/types/builder';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  PackageCheck, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Save 
} from 'lucide-react';

interface ReadyStockCardProps {
  item: ProductionItemData;
  onReceive: (id: string) => void;
  onUpdateDetails: (id: string, variations: ProductionVariationDetail[]) => void;
  isProcessing: boolean;
}

// --- SUB-COMPONENTE: INPUT DINÂMICO ---
// Permite que o campo cresça, mas respeita o container pai
const DynamicInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = "text",
  minWidth = "60px",
  align = "left"
}: { 
  label: string, 
  value: string | number, 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
  placeholder: string,
  type?: string,
  minWidth?: string,
  align?: "left" | "center" | "right"
}) => {
  const displayValue = value === 0 && type === 'number' ? '' : value.toString();
  const ghostContent = displayValue || placeholder;

  return (
    <div className="flex flex-col group shrink-0">
      <label className={cn(
        "text-[9px] font-bold text-gray-400 uppercase mb-1 truncate select-none",
        align === "center" && "text-center",
        align === "right" && "text-right"
      )}>
        {label}
      </label>
      
      <div className="relative inline-flex items-center h-9">
        {/* SPAN FANTASMA: Define a largura baseada no texto */}
        <span 
          className="invisible whitespace-pre px-3 border border-transparent text-[11px] font-bold uppercase h-full flex items-center"
          style={{ minWidth }}
          aria-hidden="true"
        >
          {ghostContent}
        </span>

        {/* INPUT REAL */}
        <input
          type={type}
          value={displayValue}
          onChange={onChange}
          onFocus={(e) => e.target.select()}
          placeholder={placeholder}
          className={cn(
            "absolute inset-0 w-full h-full px-2 rounded-lg border border-gray-200 text-[11px] font-bold uppercase focus:border-blue-500 outline-none transition-colors bg-white shadow-sm",
            align === "center" && "text-center",
            align === "right" && "text-right"
          )}
        />
      </div>
    </div>
  );
};

export const ReadyStockCard = ({ 
  item, 
  onReceive, 
  onUpdateDetails, 
  isProcessing 
}: ReadyStockCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Lazy Init
  const [editedVariations, setEditedVariations] = useState<ProductionVariationDetail[]>(() => {
    return item.variationsDetail ? JSON.parse(JSON.stringify(item.variationsDetail)) : [];
  });
  
  const [isDirty, setIsDirty] = useState(false);

  // Hash check
  const variationsHash = useMemo(() => JSON.stringify(item.variationsDetail), [item.variationsDetail]);

  useEffect(() => {
    if (item.variationsDetail) {
      setEditedVariations(prev => {
        const currentHash = JSON.stringify(prev);
        if (currentHash === variationsHash) return prev;
        return JSON.parse(variationsHash);
      });
      setIsDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, variationsHash]);

  const handleSaveChanges = () => {
    onUpdateDetails(item.id, editedVariations);
    setIsDirty(false);
  };

  const handleVariationChange = (index: number, field: keyof ProductionVariationDetail, value: string) => {
    const newVars = [...editedVariations];
    const currentItem = { ...newVars[index] };

    if (field === 'qty') {
      if (value === '') {
        currentItem.qty = 0;
      } else {
        currentItem.qty = parseInt(value, 10) || 0;
      }
    } else {
      (currentItem as Record<string, string | number | undefined>)[field] = value;
    }

    newVars[index] = currentItem;
    setEditedVariations(newVars);
    if (!isDirty) setIsDirty(true);
  };

  const isReturned = !!item.returnReason;

  return (
    <div className={cn(
      // --- CORREÇÃO DE VAZAMENTO ---
      // 1. max-w-[calc(100vw-32px)]: Limita a largura à tela do celular (menos margem)
      // 2. overflow-hidden: Corta qualquer coisa que tente sair do card
      "bg-white rounded-2xl border shadow-sm p-4 flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-md w-full min-w-0 max-w-[calc(100vw-32px)] mx-auto",
      isReturned ? "border-red-300 ring-2 ring-red-50" : "border-green-100"
    )}>
      
      {/* ALERTA DE DEVOLUÇÃO (Blindado) */}
      {isReturned && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wide flex items-start gap-2 border border-red-100 w-full">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" /> 
          <span className="flex-1 min-w-0 break-words whitespace-normal leading-relaxed">
            Retorno: {item.returnReason}
          </span>
        </div>
      )}

      {/* CABEÇALHO DO CARD */}
      <div className="flex gap-4 w-full max-w-full">
        <div className="relative w-16 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
          <Image 
            src={item.productImage} 
            alt={item.productName} 
            fill
            className="object-cover"
            sizes="64px"
          />
          <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tl-md z-10">
            {item.quantity}un
          </div>
        </div>

        {/* Info Textual Blindada (min-w-0 e break-words) */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="font-black text-gray-900 text-base uppercase leading-tight line-clamp-2 break-words">
            {item.productName}
          </h3>
          <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider flex items-center gap-1 truncate">
            <PackageCheck size={12} className="text-green-500 shrink-0" />
            Lote Pronto
          </span>
          
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="mt-2 text-[10px] font-bold text-[#5874f6] flex items-center gap-1 hover:underline w-fit"
          >
            {showDetails ? 'Ocultar Conferência' : 'Conferir & Editar'}
            {showDetails ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
          </button>
        </div>
      </div>

      {/* ÁREA DE EDIÇÃO (Blindada com Rolagem Horizontal) */}
      {showDetails && (
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 animate-in fade-in slide-in-from-top-2 w-full flex flex-col min-w-0">
          
          <div className="flex justify-between items-center mb-3 sticky left-0 z-10">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate mr-2">
              Conferência
            </span>
            {isDirty && (
              <button 
                onClick={handleSaveChanges}
                className="bg-blue-500 text-white text-[9px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm active:scale-95 transition-transform shrink-0"
              >
                <Save size={10} /> Salvar
              </button>
            )}
          </div>

          {/* CONTAINER SCROLL: Ativa rolagem horizontal se o texto for grande */}
          <div className="w-full max-w-full overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex flex-col gap-2 w-max min-w-full pr-2">
              
              {editedVariations.map((v, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 border-b border-gray-200/50 pb-2 last:border-0 last:pb-0"
                >
                  {/* CAMPO 1: TIPO (Cresce horizontalmente) */}
                  <DynamicInput 
                    label="Tipo"
                    value={v.type || ''}
                    onChange={(e) => handleVariationChange(idx, 'type', e.target.value)}
                    placeholder="Tipo"
                    minWidth="80px" 
                  />

                  {/* CAMPO 2: TAMANHO */}
                  <DynamicInput 
                    label="Tam"
                    value={v.size}
                    onChange={(e) => handleVariationChange(idx, 'size', e.target.value)}
                    placeholder="TM"
                    minWidth="35px"
                    align="center"
                  />

                  {/* CAMPO 3: COR */}
                  <DynamicInput 
                    label="Cor"
                    value={v.color}
                    onChange={(e) => handleVariationChange(idx, 'color', e.target.value)}
                    placeholder="Cor"
                    minWidth="50px"
                    align="center"
                  />

                  {/* CAMPO 4: QUANTIDADE */}
                  <DynamicInput 
                    label="Qtd"
                    value={v.qty}
                    onChange={(e) => handleVariationChange(idx, 'qty', e.target.value)}
                    placeholder="0"
                    type="number"
                    minWidth="45px"
                    align="center"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BOTÃO DE CONFIRMAÇÃO */}
      <div className="mt-auto w-full pt-2">
        <button 
          onClick={() => onReceive(item.id)}
          disabled={isProcessing}
          className="w-full h-12 bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 hover:bg-green-700 active:scale-95 transition-all"
        >
          {isProcessing ? "Processando..." : <><CheckCircle2 size={18} /> Confirmar Entrada</>}
        </button>
      </div>

    </div>
  );
};