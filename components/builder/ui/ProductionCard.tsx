'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { ProductionItemData, ProductionVariationDetail, ProductionStep } from '@/types/builder';
import { cn } from '@/lib/utils';
import { 
  Scissors, 
  Layers, 
  Tag, 
  Package, 
  ArrowRight, 
  Truck, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Save 
} from 'lucide-react';

interface ProductionCardProps {
  item: ProductionItemData;
  onAdvance: (id: string) => void;
  onSend: (id: string) => void;
  onUpdateDetails: (id: string, variations: ProductionVariationDetail[]) => void;
  onSetStep?: (id: string, step: ProductionStep) => void;
  isProcessing: boolean;
}

// --- SUB-COMPONENTE: INPUT DINÂMICO (CRESCE COM O TEXTO) ---
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
  // Converte valor para string para o Span Fantasma medir
  const displayValue = value === 0 && type === 'number' ? '' : value.toString();
  // Se estiver vazio, usa o placeholder para garantir largura mínima
  const ghostContent = displayValue || placeholder;

  return (
    <div className="flex flex-col group shrink-0">
      <label className={cn(
        "text-[9px] font-bold text-gray-400 uppercase mb-1 truncate",
        align === "center" && "text-center",
        align === "right" && "text-right"
      )}>
        {label}
      </label>
      
      {/* CONTAINER RELATIVO: A mágica acontece aqui */}
      <div className="relative inline-flex items-center h-9">
        
        {/* 1. SPAN FANTASMA (Invisível) 
            - Ele dita a largura do container baseado no texto.
            - whitespace-pre garante que espaços contem na largura.
        */}
        <span 
          className="invisible whitespace-pre px-3 border border-transparent text-[11px] font-bold uppercase h-full flex items-center"
          style={{ minWidth }}
        >
          {ghostContent}
        </span>

        {/* 2. INPUT REAL (Absoluto) 
            - Ocupa 100% do espaço criado pelo Span.
        */}
        <input
          type={type}
          value={displayValue}
          onChange={onChange}
          onFocus={(e) => e.target.select()} // Função Select All mantida
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

export const ProductionCard = ({ 
  item, 
  onAdvance, 
  onSend, 
  onUpdateDetails, 
  onSetStep,
  isProcessing 
}: ProductionCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Inicialização Lazy do estado
  const [editedVariations, setEditedVariations] = useState<ProductionVariationDetail[]>(() => {
    return item.variationsDetail ? JSON.parse(JSON.stringify(item.variationsDetail)) : [];
  });
  
  const [isDirty, setIsDirty] = useState(false);

  // Hash para evitar renderizações desnecessárias
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

  // --- LÓGICA DE ATUALIZAÇÃO ---
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

  const STEPS = [
    { id: 'sewing', label: 'COSTURA', icon: Scissors },
    { id: 'sorting', label: 'SEPARAR', icon: Layers },
    { id: 'tagging', label: 'TAG', icon: Tag },
    { id: 'packaging', label: 'EMBALAR', icon: Package }
  ];

  const isReady = item.currentStep === 'ready';
  const isReturned = !!item.returnReason;

  return (
    <div className={cn(
      "bg-white rounded-2xl border shadow-sm p-4 flex flex-col gap-5 relative overflow-hidden transition-all hover:shadow-md lg:p-6 lg:gap-7 w-full max-w-full",
      isReturned ? "border-red-300 ring-2 ring-red-50" : "border-gray-200"
    )}>
      
      {/* ALERTA DE DEVOLUÇÃO */}
      {isReturned && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wide flex items-start gap-2 border border-red-100 w-full">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" /> 
          <span className="flex-1 min-w-0 break-words whitespace-normal leading-relaxed">
            Item Devolvido: {item.returnReason}
          </span>
        </div>
      )}

      {/* CABEÇALHO DO CARD */}
      <div className="flex gap-4 w-full">
        <div className="relative w-20 h-24 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shrink-0">
          <Image 
            src={item.productImage} 
            alt={item.productName} 
            fill
            className="object-cover"
            sizes="80px"
          />
          <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-tl-md z-10">
            {item.quantity}un
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="font-black text-gray-900 text-lg uppercase leading-tight line-clamp-2 break-words">
            {item.productName}
          </h3>
          <span className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">
            Início: {item.startedAt}
          </span>
          
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="mt-2 text-xs font-bold text-[#5874f6] flex items-center gap-1 hover:underline w-fit"
          >
            {showDetails ? 'Ocultar Grade' : 'Ver Grade & Editar'}
            {showDetails ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          </button>
        </div>
      </div>

      {/* ÁREA DE EDIÇÃO DA GRADE (ROLAGEM HORIZONTAL LIVRE) */}
      {showDetails && (
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 animate-in fade-in slide-in-from-top-2 w-full flex flex-col">
          
          <div className="flex justify-between items-center mb-3 sticky left-0 z-10">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate mr-2">
              Editar Variações
            </span>
            {isDirty && (
              <button 
                onClick={handleSaveChanges}
                className="bg-green-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm active:scale-95 transition-transform shrink-0"
              >
                <Save size={12} /> Salvar
              </button>
            )}
          </div>

          {/* CONTAINER SCROLL: Permite que o conteúdo cresça horizontalmente o quanto precisar */}
          <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
            {/* Flex-col para as linhas. w-max permite largura infinita baseada no conteúdo filho */}
            <div className="flex flex-col gap-3 w-max min-w-full pr-4">
              
              {editedVariations.map((v, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 border-b border-gray-200/50 pb-2 last:border-0 last:pb-0"
                >
                  
                  {/* CAMPO 1: TIPO (Cresce conforme digita) */}
                  <DynamicInput 
                    label="Tipo"
                    value={v.type || ''}
                    onChange={(e) => handleVariationChange(idx, 'type', e.target.value)}
                    placeholder="Tipo da Peça"
                    minWidth="100px" 
                  />

                  {/* CAMPO 2: TAMANHO (Cresce conforme digita) */}
                  <DynamicInput 
                    label="Tam"
                    value={v.size}
                    onChange={(e) => handleVariationChange(idx, 'size', e.target.value)}
                    placeholder="TM"
                    minWidth="40px"
                    align="center"
                  />

                  {/* CAMPO 3: COR (Cresce conforme digita - Ex: Azul Marinho Fosco) */}
                  <DynamicInput 
                    label="Cor"
                    value={v.color}
                    onChange={(e) => handleVariationChange(idx, 'color', e.target.value)}
                    placeholder="Cor"
                    minWidth="60px"
                    align="center"
                  />

                  {/* CAMPO 4: QUANTIDADE (Cresce se número for grande) */}
                  <DynamicInput 
                    label="Qtd"
                    value={v.qty}
                    onChange={(e) => handleVariationChange(idx, 'qty', e.target.value)}
                    placeholder="0"
                    type="number"
                    minWidth="50px"
                    align="center"
                  />

                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ESTEIRA DE PROGRESSO */}
      {!isReady && (
        <div className="flex items-center justify-between relative mt-2 w-full">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 rounded-full" />
          
          {STEPS.map((step) => {
            const isCompleted = item.stepsHistory[step.id as keyof typeof item.stepsHistory];
            const isCurrent = item.currentStep === step.id;
            const isActive = isCompleted || isCurrent; 

            return (
              <button 
                key={step.id}
                disabled={isProcessing}
                onClick={() => onSetStep && onSetStep(item.id, step.id as ProductionStep)}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all group relative",
                  isActive ? "text-[#5874f6]" : "text-gray-300"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition-all z-10",
                  isActive ? "border-[#5874f6] shadow-sm" : "border-gray-200",
                  isCurrent && "ring-4 ring-blue-50 scale-110"
                )}>
                  <step.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider">{step.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* BOTÃO DE AÇÃO */}
      <div className="mt-auto pt-2 w-full">
        {isReady ? (
          <button 
            onClick={() => onSend(item.id)}
            disabled={isProcessing}
            className="w-full h-14 bg-[#00c853] text-white rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 hover:bg-[#00b34a] active:scale-95 transition-all"
          >
            {isProcessing ? "Enviando..." : <><Truck size={20} /> Enviar para Loja</>}
          </button>
        ) : (
          <button 
            onClick={() => onAdvance(item.id)}
            disabled={isProcessing}
            className="w-full h-14 bg-[#5874f6] text-white rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:bg-blue-600 active:scale-95 transition-all"
          >
            {isProcessing ? "Salvando..." : <>Avançar Etapa <ArrowRight size={20} /></>}
          </button>
        )}
      </div>

    </div>
  );
};