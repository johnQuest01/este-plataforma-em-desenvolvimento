// components/builder/ui/StockDefinePopup.tsx

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, ChevronDown, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface StockDefinePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

type StockStatus = 'low' | 'medium' | 'high';
type InputType = 'min' | 'max';

type VisibleInputsMap = Record<StockStatus, InputType[]>;

export const StockDefinePopup = ({ isOpen, onClose }: StockDefinePopupProps) => {
  const [activeTab, setActiveTab] = useState<StockStatus>('low');
  const [isVariationMenuOpen, setIsVariationMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Estado dos valores
  const [thresholds, setThresholds] = useState({
    low: { min: 0, max: 17 },
    medium: { min: 18, max: 50 },
    high: { min: 51, max: 100 }
  });

  const [visibleInputs, setVisibleInputs] = useState<VisibleInputsMap>({
    low: ['max'],
    medium: ['min', 'max'],
    high: ['min']
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsVariationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const TABS = [
    { id: 'low', label: 'Esgotar', pillColor: '#ff4d6d' },
    { id: 'medium', label: 'Regular', pillColor: '#fb923c' },
    { id: 'high', label: 'Cheio', pillColor: '#22c55e' },
  ] as const;

  const handleAddInput = (type: InputType) => {
    setVisibleInputs(prev => {
      const currentInputs = prev[activeTab];
      if (currentInputs.includes(type)) return prev;
      return { ...prev, [activeTab]: [...currentInputs, type] };
    });
    setIsVariationMenuOpen(false);
  };

  const handleRemoveInput = (type: InputType) => {
    setVisibleInputs(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(t => t !== type)
    }));
  };

  const handleInputChange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);

    setThresholds(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: isNaN(numValue) ? 0 : numValue
      }
    }));
  };

  const handleSave = () => {
    console.log("Configuração Salva:", { activeTab, config: thresholds[activeTab] });
    onClose();
  };

  return (
    // 1. WRAPPER (OVERLAY): Ocupa 100% da tela para bloquear cliques e escurecer o fundo
    <div className="absolute inset-0 z-[200] flex flex-col justify-end">
      
      {/* Camada de fundo escuro (Backdrop) */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
      />

      {/* 2. O CARD POPUP (BOTTOM SHEET) */}
      {/* Alterado de h-full para max-h-[85%] e adicionado rounded-t-3xl */}
      <div 
        className={cn(
          "relative w-full bg-white z-10 flex flex-col rounded-t-[2rem] shadow-2xl overflow-hidden",
          "animate-in slide-in-from-bottom-full duration-300 ease-out", // Animação de subida suave
          "max-h-[85%]" // Limita a altura vertical para não cobrir tudo
        )}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Indicador Visual de "Puxar" (Visual Handle) */}
        <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full"/>
        </div>

        {/* CONTEÚDO INTERNO (Preservado tamanhos e estilos originais) */}
        <div className="flex-1 flex flex-col gap-5 p-6 pt-2 overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-start justify-between pl-1 mt-2 shrink-0">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight mb-1">
                Defina Quantidades
              </h3>
              <span className="text-sm font-medium text-gray-500">
                Regras para o estado selecionado
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 shrink-0 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-gray-600 active:scale-90 transition-transform shadow-sm hover:bg-gray-100"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center p-1.5 bg-gray-100/80 rounded-2xl gap-1 border border-gray-200/50 shrink-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all duration-200 relative overflow-hidden",
                    isActive ? "bg-white shadow-sm ring-1 ring-black/5" : "hover:bg-black/5"
                  )}
                >
                  <span className={cn(
                    "text-xs font-extrabold uppercase tracking-wider z-10 transition-colors",
                    isActive ? "text-gray-900" : "text-gray-400"
                  )}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 inset-x-0 h-0.5 bg-current opacity-10" />
                  )}
                  <div
                    className={cn("w-1.5 h-1.5 rounded-full mt-1.5 transition-transform duration-200", isActive ? "scale-100" : "scale-0")}
                    style={{ backgroundColor: tab.pillColor }}
                  />
                </button>
              );
            })}
          </div>

          {/* Inputs Area Title + Menu */}
          <div className="flex items-center justify-between relative z-50 shrink-0 mt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
              <div
                className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm"
                style={{ backgroundColor: TABS.find(t => t.id === activeTab)?.pillColor }}
              />
              <span className="text-gray-700 font-bold text-xs uppercase tracking-wide">
                {TABS.find(t => t.id === activeTab)?.label}
              </span>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsVariationMenuOpen(!isVariationMenuOpen)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all shadow-sm",
                  isVariationMenuOpen
                    ? "bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-600 ring-offset-2"
                    : "bg-white text-blue-600 border border-blue-100 hover:bg-blue-50"
                )}
              >
                Aplicar Definição
                <ChevronDown size={14} className={cn("transition-transform duration-200", isVariationMenuOpen && "rotate-180")} />
              </button>

              {/* Menu Dropdown */}
              {isVariationMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col p-2 z-[60] animate-in fade-in slide-in-from-top-1 duration-100">
                  <span className="text-[10px] font-bold text-gray-400 px-2 py-1.5 uppercase tracking-wider mb-1">
                    Adicionar Campo
                  </span>
                  <button
                    onClick={() => handleAddInput('min')}
                    disabled={visibleInputs[activeTab].includes('min')}
                    className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-left"
                  >
                    <div className="bg-blue-100 text-blue-600 p-1 rounded-md"><Plus size={12} strokeWidth={3}/></div>
                    Quantidade Mínima
                  </button>
                  <button
                    onClick={() => handleAddInput('max')}
                    disabled={visibleInputs[activeTab].includes('max')}
                    className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-left"
                  >
                    <div className="bg-blue-100 text-blue-600 p-1 rounded-md"><Plus size={12} strokeWidth={3}/></div>
                    Quantidade Máxima
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Inputs List (Scrollable if needed) */}
          <div className="flex flex-col gap-3 flex-1 min-h-[150px]">
            {visibleInputs[activeTab].length === 0 ? (
              <div
                className="flex-1 flex flex-col items-center justify-center text-center opacity-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50/50 animate-in fade-in duration-200"
              >
                <span className="text-sm font-bold text-gray-600">Nenhuma variação aplicada</span>
                <span className="text-xs text-gray-400 mt-1">Aplicar Definição</span>
              </div>
            ) : (
              <>
                {visibleInputs[activeTab].includes('max') && (
                  <VariationInput
                    key="input-max"
                    type="max"
                    value={thresholds[activeTab].max}
                    onChange={(val) => handleInputChange('max', val)}
                    onRemove={() => handleRemoveInput('max')}
                  />
                )}

                {visibleInputs[activeTab].includes('min') && (
                  <VariationInput
                    key="input-min"
                    type="min"
                    value={thresholds[activeTab].min}
                    onChange={(val) => handleInputChange('min', val)}
                    onRemove={() => handleRemoveInput('min')}
                  />
                )}
              </>
            )}
          </div>

          {/* Footer Action */}
          <div className="pt-2 pb-safe-bottom shrink-0">
            <button
              onClick={handleSave}
              className={cn(
                "w-full py-4 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all transform group relative overflow-hidden",
                "bg-[#5874f6] text-white hover:bg-[#4a63d6]"
              )}>
              <div className="flex items-center justify-center gap-2 relative z-10">
                <CheckCircle2 size={20} strokeWidth={2.5} />
                <span className="font-black text-sm uppercase tracking-widest">
                  Salvar Configuração
                </span>
              </div>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTE DE INPUT (Mantido igual) ---
const VariationInput = ({ type, value, onChange, onRemove }: {
  type: 'min' | 'max',
  value: number,
  onChange: (v: string) => void,
  onRemove: () => void
}) => {
  const isMax = type === 'max';
  const label = isMax ? 'Quantidade Máxima' : 'Quantidade Mínima';
  const borderColor = isMax ? 'focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-400' : 'focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-400';
  const bgColor = isMax ? 'focus-within:bg-red-50' : 'focus-within:bg-green-50';

  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    if (value !== parseInt(inputValue || '0')) {
      setInputValue(value.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInputValue(newVal);
    onChange(newVal);
  };

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex items-center justify-between shadow-sm mx-1 animate-in fade-in slide-in-from-bottom-2 duration-150",
        borderColor, bgColor
      )}
    >
      <div className="flex flex-col gap-0.5">
        <span className={cn("text-[11px] font-extrabold uppercase tracking-wider", isMax ? "text-red-600/70" : "text-green-600/70")}>
          {label}
        </span>
        <span className="text-xs font-medium text-gray-400 leading-none">
          {isMax ? 'Estoque abaixo de:' : 'Estoque acima de:'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="number"
            value={inputValue}
            onChange={handleChange}
            placeholder="0"
            className="w-20 outline-none font-black text-2xl text-gray-800 bg-transparent text-right p-0 border-none focus:ring-0 placeholder:text-gray-200"
          />
        </div>

        <div className="w-px h-8 bg-gray-100 mx-1"></div>

        <button
          onClick={onRemove}
          className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};