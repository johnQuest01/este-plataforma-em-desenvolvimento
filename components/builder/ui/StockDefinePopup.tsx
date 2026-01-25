// components/builder/ui/StockDefinePopup.tsx

import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Plus, Trash2, CheckCircle2 } from 'lucide-react';

// 🛡️ GUARDIAN: Importação do HOC
import { withGuardian } from "@/components/guardian/GuardianBeacon";

import { cn } from '@/lib/utils';

interface StockDefinePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

type StockStatus = 'low' | 'medium' | 'high';
type InputType = 'min' | 'max';

type VisibleInputsMap = Record<StockStatus, InputType[]>;

const StockDefinePopupBase = ({ isOpen, onClose }: StockDefinePopupProps) => {
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
      const target = event.target;
      if (menuRef.current && target instanceof Node && !menuRef.current.contains(target)) {
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

  const activeTabData = TABS.find(t => t.id === activeTab) || TABS[0];

  const handleToggleInput = (type: InputType) => {
    setVisibleInputs(prev => {
      const current = prev[activeTab];
      if (current.includes(type)) {
        return {
          ...prev,
          [activeTab]: current.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          [activeTab]: [...current, type]
        };
      }
    });
  };

  const handleValueChange = (type: InputType, value: number) => {
    setThresholds(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [type]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className={cn(
          "relative bg-white w-full max-w-[380px] max-h-[75vh]",
          "rounded-3xl shadow-2xl overflow-hidden"
        )}
      >
        {/* HEADER */}
        <div className="p-5 pb-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-b from-gray-50 to-white">
          <div>
            <h2 className="text-lg font-black text-gray-900 leading-tight tracking-tight">
              Status do Estoque
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Defina os limites
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors rounded-full flex items-center justify-center active:scale-90"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* TABS */}
        <div className="p-4 pb-0 flex gap-2 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const { min, max } = thresholds[tab.id];
            const range = `${min}-${max}`;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 min-w-[100px] p-3 rounded-xl transition-all active:scale-95",
                  isActive
                    ? "bg-gray-900 shadow-lg"
                    : "bg-gray-50 hover:bg-gray-100"
                )}
              >
                <div className="flex items-center gap-2 justify-center mb-1.5">
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      isActive ? "animate-pulse" : ""
                    )}
                    style={{ backgroundColor: tab.pillColor }}
                  />
                  <span
                    className={cn(
                      "font-bold text-xs uppercase tracking-wider",
                      isActive ? "text-white" : "text-gray-500"
                    )}
                  >
                    {tab.label}
                  </span>
                </div>
                <div
                  className={cn(
                    "text-[11px] font-black",
                    isActive ? "text-gray-300" : "text-gray-400"
                  )}
                >
                  {range}
                </div>
              </button>
            );
          })}
        </div>

        {/* CONTENT */}
        <div className="p-5 space-y-4">
          {/* DROPDOWN PARA ADICIONAR CAMPOS */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsVariationMenuOpen(!isVariationMenuOpen)}
              className="w-full bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl p-3 flex items-center justify-between border border-gray-200"
            >
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Adicionar Limite
              </span>
              <ChevronDown
                size={18}
                className={cn(
                  "text-gray-400 transition-transform",
                  isVariationMenuOpen ? "rotate-180" : ""
                )}
              />
            </button>

            {isVariationMenuOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                <button
                  onClick={() => {
                    handleToggleInput('min');
                    setIsVariationMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} className="text-gray-400" />
                  Mínimo
                </button>
                <div className="w-full h-px bg-gray-100" />
                <button
                  onClick={() => {
                    handleToggleInput('max');
                    setIsVariationMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} className="text-gray-400" />
                  Máximo
                </button>
              </div>
            )}
          </div>

          {/* CAMPOS DE INPUT */}
          <div className="space-y-3">
            {visibleInputs[activeTab].includes('min') && (
              <ThresholdInput
                label="Mínimo"
                inputValue={thresholds[activeTab].min}
                onValueChange={(v) => handleValueChange('min', v)}
                onRemove={() => handleToggleInput('min')}
                pillColor={activeTabData.pillColor}
              />
            )}
            {visibleInputs[activeTab].includes('max') && (
              <ThresholdInput
                label="Máximo"
                inputValue={thresholds[activeTab].max}
                onValueChange={(v) => handleValueChange('max', v)}
                onRemove={() => handleToggleInput('max')}
                pillColor={activeTabData.pillColor}
              />
            )}
          </div>

          {/* Faixa Visualizada */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Faixa Atual
              </span>
              <span className="text-2xl font-black text-gray-900">
                {thresholds[activeTab].min} - {thresholds[activeTab].max}
              </span>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: activeTabData.pillColor }}
            >
              <CheckCircle2 size={24} className="text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-5 pt-3 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => {
              console.log('Configurações Salvas:', thresholds);
              onClose();
            }}
            className="w-full h-12 bg-[#5874f6] text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
          >
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

// 🛡️ GUARDIAN: Exportação com metadados
export const StockDefinePopup = withGuardian(
  StockDefinePopupBase,
  "components/builder/ui/StockDefinePopup.tsx",
  "POPUP",
  {
    label: "Popup de Definição de Status de Estoque",
    description: "Modal para configurar limites (min/max) que definem quando o estoque está baixo, médio ou cheio.",
    orientationNotes: `
⚠️ **Pontos de Atenção**:
- **Z-Index**: z-250 (alta prioridade)
- **UX**: Tabs para diferentes status (low, medium, high), campos dinâmicos
- **Fluxo**: Permite adicionar/remover campos de min/max para cada status
    `.trim(),
    connectsTo: []
  }
);

// --- SUB-COMPONENTE ---
interface ThresholdInputProps {
  label: string;
  inputValue: number;
  onValueChange: (value: number) => void;
  onRemove: () => void;
  pillColor: string;
}

const ThresholdInput = ({
  label,
  inputValue,
  onValueChange,
  onRemove,
  pillColor
}: ThresholdInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onValueChange(isNaN(val) ? 0 : val);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: pillColor }}
        />
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {label}
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
