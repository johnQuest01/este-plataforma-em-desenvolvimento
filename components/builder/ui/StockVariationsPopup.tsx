'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, 
  Check, 
  Trash2, 
  X, 
  Palette, 
  Tag, 
  Type, 
  Image as ImageIcon, 
  Plus, 
  Sparkles, 
  Store, 
  Eraser, 
  Factory 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  MouseSensor, 
  TouchSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  useSortable, 
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createProductionOrderAction } from '@/app/actions/production';

export interface VariationItem {
  id: string;
  name: string;
  category: string;
  keyword: string;
  color: string;
  variation?: string; 
  type?: string;      
  size: string;
  qty: number;
  images: string[];
  stockLocations: string[];
}

interface StockVariationsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (items: VariationItem[], metadata?: { name: string }) => void;
  initialItems?: VariationItem[];
}

// Helper robusto para formatar o nome corretamente (Mantém como o usuário digitou)
const formatNameSafe = (text: string): string => {
  if (!text) return "";
  return text.trim();
};

const blobUrlToBase64 = async (url: string): Promise<string> => {
  if (!url.startsWith('blob:')) return url;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Erro ao converter imagem", e);
    return url;
  }
};

function SortablePhotoItem({ id, url, onRemove }: { id: string, url: string, onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    WebkitTouchCallout: 'none',
    touchAction: 'manipulation'
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "relative aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white group cursor-grab active:cursor-grabbing", 
        isDragging && "opacity-50 ring-2 ring-blue-500 scale-105 shadow-xl z-50"
      )} 
      {...attributes} 
      {...listeners}
    >
      <img src={url} alt="Variation" className="w-full h-full object-cover pointer-events-none" />
      <button 
        onClick={(e) => { e.stopPropagation(); onRemove(); }} 
        onPointerDown={(e) => e.stopPropagation()} 
        className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-20"
      >
        <X size={12} strokeWidth={3} />
      </button>
    </div>
  );
}

export const StockVariationsPopup = ({ isOpen, onClose, onSave, initialItems = [] }: StockVariationsPopupProps) => {
  const [variations, setVariations] = useState<VariationItem[]>(initialItems);
  const lastItem = initialItems.length > 0 ? initialItems[initialItems.length - 1] : null;

  const [currentName, setCurrentName] = useState(lastItem?.name || "");
  const [currentCategory, setCurrentCategory] = useState(lastItem?.category || "");
  const [currentKeyword, setCurrentKeyword] = useState(lastItem?.keyword || "");
  const [currentColor, setCurrentColor] = useState(lastItem?.color || "");
  const [currentType, setCurrentType] = useState(lastItem?.variation || lastItem?.type || "");
  const [selectedStocks, setSelectedStocks] = useState<string[]>(lastItem?.stockLocations || ['Loja Principal']);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>(lastItem?.images || []);

  const [availableStocks, setAvailableStocks] = useState<string[]>(['Loja Principal', 'Depósito', 'Vitrine']);
  const [newStockName, setNewStockName] = useState("");

  const [qtyModalOpen, setQtyModalOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<string | null>(null);
  const [tempQty, setTempQty] = useState("");
  const [errorShake, setErrorShake] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingToProduction, setIsSendingToProduction] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizes = ['PP', 'P', 'M', 'G', 'GG', 'XG'];

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (isOpen) {
      setVariations(initialItems);
      if (initialItems.length > 0) {
        const last = initialItems[initialItems.length - 1];
        if (!currentName) setCurrentName(last.name);
        if (!currentCategory) setCurrentCategory(last.category);
        if (!currentKeyword) setCurrentKeyword(last.keyword);
        if (!currentColor) setCurrentColor(last.color);
        if (currentPhotos.length === 0) setCurrentPhotos(last.images);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (variations.length === 0) return;
    setVariations(prev => prev.map(item => ({
      ...item,
      name: currentName,
      category: currentCategory,
      keyword: currentKeyword,
    })));
  }, [currentName, currentCategory, currentKeyword]);

  const activeVariationsForCurrentContext = useMemo(() => {
    return variations.filter(v => 
      v.name.toLowerCase() === currentName.trim().toLowerCase() &&
      v.color.toLowerCase() === currentColor.trim().toLowerCase() &&
      (v.variation || v.type || '').toLowerCase() === currentType.trim().toLowerCase()
    );
  }, [variations, currentName, currentColor, currentType]);

  if (!isOpen) return null;

  const formatQty = (num: number) => num >= 1000 ? (num / 1000).toFixed(1).replace('.0', '') + 'k' : num.toString();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const remainingSlots = 20 - currentPhotos.length;
      const filesToAdd = files.slice(0, remainingSlots);
      const newPhotoUrls = filesToAdd.map(file => URL.createObjectURL(file));
      setCurrentPhotos(prev => [...prev, ...newPhotoUrls]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePhoto = (urlToRemove: string) => {
    setCurrentPhotos(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleClearPhotos = () => {
    if (confirm("Limpar todas as fotos deste lote?")) {
      setCurrentPhotos([]);
    }
  };

  const handleDragEndPhotos = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setCurrentPhotos((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over?.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCreateStock = () => {
    if (!newStockName.trim()) return;
    if (!availableStocks.includes(newStockName.trim())) {
      setAvailableStocks(prev => [...prev, newStockName.trim()]);
    }
    if (!selectedStocks.includes(newStockName.trim())) {
      setSelectedStocks(prev => [...prev, newStockName.trim()]);
    }
    setNewStockName("");
  };

  const toggleStockSelection = (stock: string) => {
    setSelectedStocks(prev => 
      prev.includes(stock) ? prev.filter(s => s !== stock) : [...prev, stock]
    );
  };

  const handleSizeClick = (sizeLabel: string) => {
    if (!currentName.trim() || !currentColor.trim() || !currentCategory.trim() || !currentKeyword.trim()) {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      alert("⚠️ Preencha Nome, Cor, Categoria e Palavra-chave antes de selecionar o tamanho.");
      return;
    }

    if (selectedStocks.length === 0) {
      alert("⚠️ Selecione pelo menos um local de estoque!");
      return;
    }

    const existingIndex = variations.findIndex(
      v => 
        v.name.toLowerCase() === currentName.trim().toLowerCase() &&
        v.color.toLowerCase() === currentColor.trim().toLowerCase() &&
        (v.variation || '').toLowerCase() === currentType.trim().toLowerCase() &&
        v.size === sizeLabel
    );

    if (existingIndex >= 0) {
      setVariations(prev => prev.filter((_, idx) => idx !== existingIndex));
      return;
    }

    setEditingSize(sizeLabel);
    setTempQty("");
    setQtyModalOpen(true);
  };

  const handleConfirmQty = async () => {
    const qty = parseInt(tempQty);
    if (editingSize && currentName && currentColor && !isNaN(qty) && qty > 0) {
      const newItem: VariationItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: currentName.trim(),
        color: currentColor.trim(),
        category: currentCategory.trim(),
        keyword: currentKeyword.trim(),
        variation: currentType.trim(),
        type: currentType.trim(), 
        stockLocations: [...selectedStocks],
        images: [...currentPhotos],
        size: editingSize,
        qty: qty,
      };
      setVariations(prev => [...prev, newItem]);
    }
    setQtyModalOpen(false);
    setEditingSize(null);
  };

  const handleRemoveItem = (id: string) => {
    setVariations(prev => prev.filter(v => v.id !== id));
  };

  const handleSaveAll = async () => {
    if (!onSave) return;
    setIsSaving(true);
    
    const formattedName = formatNameSafe(currentName);

    const processedVariations = await Promise.all(variations.map(async (v) => {
      const processedImages = await Promise.all(v.images.map(async (img) => {
        return await blobUrlToBase64(img);
      }));
      return { 
        ...v, 
        name: formattedName,
        images: processedImages 
      };
    }));

    onSave(processedVariations, { name: formattedName });
    
    setIsSaving(false);
    onClose();
  };

  const handleSendToProduction = async () => {
    if (variations.length === 0) return alert("⚠️ Adicione variações antes de enviar.");
    if (!confirm("Confirma o envio deste lote para a tela de Produção?")) return;
    setIsSendingToProduction(true);
    try {
        let mainImage = currentPhotos.length > 0 ? currentPhotos[0] : (variations[0].images[0] || "");
        mainImage = await blobUrlToBase64(mainImage);
        const result = await createProductionOrderAction({
            productName: formatNameSafe(currentName) || variations[0].name,
            image: mainImage,
            variations: variations.map(v => ({ ...v, name: formatNameSafe(currentName) }))
        });
        if (result.success) alert("✅ Enviado para a Produção!");
        else alert("❌ Erro ao enviar.");
    } catch (error) {
        alert("Erro técnico ao enviar.");
    } finally {
        setIsSendingToProduction(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#eeeeee] relative overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide p-3 pb-32 space-y-3">
        
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Cadastro Rápido</span>
            <h2 className="text-lg font-black text-gray-900 tracking-tight leading-none">Gerenciar Variações</h2>
          </div>
        </div>

        <div className={cn("bg-white rounded-2xl p-4 shadow-sm border flex flex-col gap-3", errorShake ? "border-red-400 ring-2 ring-red-100" : "border-gray-200")}>
          <div className="flex items-center justify-between">
            <span className={cn("text-xs font-black uppercase tracking-wide", errorShake ? "text-red-500" : "text-gray-900")}>1. Defina o Produto</span>
          </div>

          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              value={currentName} 
              onChange={(e) => setCurrentName(e.target.value)} 
              placeholder="Nome (Ex: Jeans Skinny)" 
              className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#5874f6] focus:bg-white transition-all" 
            />
            
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Tag size={16} /></div>
                    <input type="text" value={currentCategory} onChange={(e) => setCurrentCategory(e.target.value)} placeholder="Categoria" className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#5874f6] focus:bg-white transition-all" />
                </div>
                <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Type size={16} /></div>
                    <input type="text" value={currentKeyword} onChange={(e) => setCurrentKeyword(e.target.value)} placeholder="Palavra-chave" className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#5874f6] focus:bg-white transition-all" />
                </div>
            </div>

            <div className="w-full h-px bg-gray-100 my-1"></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Variação Atual (Lote)</span>

            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Palette size={16} /></div>
                <input type="text" value={currentColor} onChange={(e) => setCurrentColor(e.target.value)} placeholder="Cor (Ex: Azul Marinho, Vermelho...)" className="w-full h-11 bg-blue-50/50 border border-blue-100 rounded-xl pl-10 pr-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#5874f6] focus:bg-white transition-all" />
            </div>

            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Sparkles size={16} /></div>
                <input type="text" value={currentType} onChange={(e) => setCurrentType(e.target.value)} placeholder="Tipo/Detalhe (Ex: Com Gliter) - Opcional" className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#5874f6] focus:bg-white transition-all" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-gray-900 uppercase tracking-wide">2. Fotos (Para a cor atual)</span>
            {currentPhotos.length > 0 && (
                <button onClick={handleClearPhotos} className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md hover:bg-red-100 transition-colors">
                    <Eraser size={12} /> Limpar
                </button>
            )}
            <span className="text-[10px] font-bold text-gray-400 ml-auto">{currentPhotos.length}/20</span>
          </div>
          <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-[4/3] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group relative overflow-hidden">
            <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-gray-600 z-10 p-4 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-1"><Plus size={24} strokeWidth={3} className="text-gray-400" /></div>
              <h4 className="text-sm font-bold text-gray-800 leading-tight">Adicionar fotos para<br/><span className="text-[#5874f6]">{currentColor || 'esta variação'}</span></h4>
            </div>
            <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleFileSelect} disabled={currentPhotos.length >= 20} />
          </div>
          {currentPhotos.length > 0 && (
            <div className="mt-2 select-none">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndPhotos}>
                <SortableContext items={currentPhotos} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-5 gap-2 touch-manipulation">
                    {currentPhotos.map((url) => (
                      <SortablePhotoItem key={url} id={url} url={url} onRemove={() => handleRemovePhoto(url)} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-4">
          <span className="text-xs font-black text-gray-900 uppercase tracking-wide">3. Local de Estoque</span>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Store size={16} /></div>
                <input type="text" value={newStockName} onChange={(e) => setNewStockName(e.target.value)} placeholder="Novo local..." className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#5874f6] focus:bg-white transition-all" onKeyDown={(e) => e.key === 'Enter' && handleCreateStock()} />
              </div>
              <button onClick={handleCreateStock} className="h-10 px-4 bg-gray-900 text-white rounded-xl shadow-sm active:scale-95 transition-transform flex items-center justify-center"><Plus size={20} strokeWidth={3} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableStocks.map((stock) => (
                  <button key={stock} onClick={() => toggleStockSelection(stock)} className={cn("px-3 py-2 rounded-lg text-xs font-bold border transition-all active:scale-95 flex items-center gap-1.5", selectedStocks.includes(stock) ? "bg-blue-50 border-[#5874f6] text-[#5874f6]" : "bg-white border-gray-200 text-gray-500")}>
                    {selectedStocks.includes(stock) && <Check size={12} strokeWidth={4} />}
                    {stock}
                  </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-4">
          <span className="text-xs font-black text-gray-900 uppercase tracking-wide">4. Selecione os Tamanhos</span>
          <div className="flex flex-wrap gap-3">
            {sizes.map((size) => {
              const registeredItem = activeVariationsForCurrentContext.find(v => v.size === size);
              return (
                <div key={size} className="flex flex-col items-center gap-1">
                  <button onClick={() => handleSizeClick(size)} className={cn("w-12 h-12 rounded-xl font-black text-sm border flex items-center justify-center relative transition-all", registeredItem ? "bg-[#5874f6] text-white border-[#5874f6]" : "bg-white text-gray-900 border-gray-200")}>
                    {size}
                    {registeredItem && (<div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white" />)}
                  </button>
                  <span className={cn("text-[10px] font-bold h-4 uppercase", registeredItem ? "text-[#5874f6]" : "text-transparent")}>{registeredItem ? formatQty(registeredItem.qty) : "."}</span>
                </div>
              );
            })}
          </div>
        </div>

        {variations.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <span className="text-xs font-black text-gray-900 uppercase tracking-wide">Resumo ({variations.length})</span>
            <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
              {variations.slice().reverse().map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex shrink-0 items-center justify-center overflow-hidden relative">
                      {item.images && item.images.length > 0 ? <img src={item.images[0]} alt="Mini" className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-gray-300" />}
                      <div className="absolute bottom-0 right-0 bg-gray-900/80 text-white text-[9px] font-black px-1 rounded-tl-md">{item.size}</div>
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-gray-900 truncate leading-tight">{item.name}</span>
                      <span className="text-[10px] font-bold text-gray-600 uppercase">{item.color} - {item.qty} un</span>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveItem(item.id)} className="w-8 h-8 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full p-3 pt-4 bg-[#eeeeee] z-20 flex flex-col gap-2">
        <button onClick={handleSendToProduction} disabled={isSendingToProduction} className="w-full h-11 bg-gray-900 text-white rounded-xl shadow-md flex items-center justify-center gap-2">
            {isSendingToProduction ? <span className="animate-pulse">Enviando...</span> : <><Factory size={18} /><span>Enviar para Produção</span></>}
        </button>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-12 bg-[#ff4d6d] text-white rounded-xl shadow-lg flex items-center justify-center gap-2">
            <ChevronLeft size={20} strokeWidth={3} />
            <span className="font-black text-xs uppercase">Voltar</span>
          </button>
          <button onClick={handleSaveAll} disabled={isSaving} className="flex-[2] h-12 bg-[#5874f6] text-white rounded-xl shadow-lg flex items-center justify-center gap-2">
            {isSaving ? <span className="animate-pulse">Salvando...</span> : <><Check size={20} strokeWidth={3} /><span className="font-black text-sm uppercase">Salvar Tudo</span></>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {qtyModalOpen && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-gray-900/20 backdrop-blur-[2px] p-6">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-white w-full max-w-[280px] rounded-xl border border-black shadow-2xl p-5 flex flex-col items-center gap-4">
              <h3 className="text-base font-bold text-black">Qtd. para {currentColor} ({editingSize})</h3>
              <input type="number" value={tempQty} onChange={(e) => setTempQty(e.target.value)} placeholder="0" autoFocus className="w-full h-12 border border-gray-400 rounded-lg text-center text-xl font-bold text-gray-900 outline-none" />
              <button onClick={handleConfirmQty} className="w-full h-11 bg-[#00c853] text-white rounded-lg font-bold text-sm uppercase">Confirmar</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};