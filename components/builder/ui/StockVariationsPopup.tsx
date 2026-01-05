'use client';

import React, { useState, useRef, useEffect } from 'react';

// 🛡️ GUARDIAN: Importação do HOC
import { withGuardian } from "@/components/guardian/GuardianBeacon";

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
  Factory,
  Box,
  Layers 
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

// --- Types ---

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

interface DraftState {
  name: string;
  category: string;
  keyword: string;
  color: string;
  type: string; 
  types: string[]; 
  images: string[];
  stockLocations: string[];
}

// --- Helpers ---

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

// --- Sub-components (Lego Architecture) ---

const MiniPreviewCard = ({ draft, sizePreview }: { draft: DraftState, sizePreview?: string }) => {
  const hasImage = draft.images.length > 0;
  const hasName = draft.name.trim().length > 0;
  const hasColor = draft.color.trim().length > 0;
  const hasCategory = draft.category.trim().length > 0;
  const hasKeyword = draft.keyword.trim().length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 relative">
        {hasImage ? (
          <img src={draft.images[0]} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon size={20} className="text-gray-300" />
        )}
        {sizePreview && (
          <div className="absolute bottom-0 right-0 bg-[#5874f6] text-white text-[9px] font-black px-1.5 py-0.5 rounded-tl-md">
            {sizePreview}
          </div>
        )}
      </div>

      <div className="flex flex-col min-w-0 gap-0.5">
        <span className={cn("text-xs font-bold truncate", hasName ? "text-gray-900" : "text-gray-400 italic")}>
          {hasName ? draft.name : "Produto sem nome"}
        </span>
        
        <div className="flex items-center gap-1.5">
          <span className={cn("w-2 h-2 rounded-full", hasColor ? "bg-blue-500" : "bg-gray-300")} />
          <span className={cn("text-[10px] font-medium truncate", hasColor ? "text-gray-600" : "text-gray-400")}>
            {hasColor ? draft.color : "Cor indefinida"}
          </span>
        </div>

        {(hasCategory || hasKeyword) && (
            <div className="flex items-center gap-1.5 mt-0.5 overflow-hidden">
                {hasCategory && (
                    <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                        {draft.category}
                    </span>
                )}
                {hasKeyword && (
                    <span className="text-[9px] text-gray-400 italic truncate">
                        #{draft.keyword}
                    </span>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

function SortablePhotoItem({ id, url, onRemove }: { id: string, url: string, onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
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
        className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-20 hover:bg-red-50"
      >
        <X size={12} strokeWidth={3} />
      </button>
    </div>
  );
}

// --- Main Component (Renomeado para Base) ---

const StockVariationsPopupBase = ({ isOpen, onClose, onSave, initialItems = [] }: StockVariationsPopupProps) => {
  const [variations, setVariations] = useState<VariationItem[]>(initialItems);
  
  const [draft, setDraft] = useState<DraftState>(() => {
    const lastItem = initialItems.length > 0 ? initialItems[initialItems.length - 1] : null;
    return {
      name: lastItem?.name || "",
      category: lastItem?.category || "",
      keyword: lastItem?.keyword || "",
      color: lastItem?.color || "",
      type: lastItem?.variation || lastItem?.type || "",
      types: [], 
      images: lastItem?.images || [],
      stockLocations: lastItem?.stockLocations || ['Loja Principal']
    };
  });

  const [availableStocks, setAvailableStocks] = useState<string[]>(['Loja Principal', 'Depósito', 'Vitrine']);
  const [newStockName, setNewStockName] = useState("");
  const [qtyModalOpen, setQtyModalOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<string | null>(null);
  const [tempQty, setTempQty] = useState("");
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
        setDraft({
          name: last.name,
          category: last.category,
          keyword: last.keyword,
          color: last.color,
          type: last.variation || last.type || "",
          types: [],
          images: last.images,
          stockLocations: last.stockLocations
        });
      }
    }
  }, [isOpen, initialItems]);

  if (!isOpen) return null;

  const updateDraft = <K extends keyof DraftState>(field: K, value: DraftState[K]) => {
    setDraft(prev => ({ ...prev, [field]: value }));

    if (field === 'name' || field === 'category' || field === 'keyword') {
      setVariations(prev => prev.map(item => ({
        ...item,
        [field]: value as string 
      })));
    }

    if (field === 'images') {
       setVariations(prev => prev.map(item => {
           if (item.color === draft.color) {
               return { ...item, images: value as string[] };
           }
           return item;
       }));
    }
  };

  const handleAddType = () => {
    if (draft.type.trim() && !draft.types.includes(draft.type.trim())) {
        updateDraft('types', [...draft.types, draft.type.trim()]);
        updateDraft('type', ''); 
    }
  };

  const handleRemoveType = (typeToRemove: string) => {
      updateDraft('types', draft.types.filter(t => t !== typeToRemove));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const remainingSlots = 20 - draft.images.length;
      const filesToAdd = files.slice(0, remainingSlots);
      const newPhotoUrls = filesToAdd.map(file => URL.createObjectURL(file));
      
      updateDraft('images', [...draft.images, ...newPhotoUrls]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePhoto = (urlToRemove: string) => {
    updateDraft('images', draft.images.filter(url => url !== urlToRemove));
  };

  const handleDragEndPhotos = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = draft.images.indexOf(active.id as string);
      const newIndex = draft.images.indexOf(over?.id as string);
      updateDraft('images', arrayMove(draft.images, oldIndex, newIndex));
    }
  };

  const handleCreateStock = () => {
    const trimmed = newStockName.trim();
    if (!trimmed) return;
    
    if (!availableStocks.includes(trimmed)) {
      setAvailableStocks(prev => [...prev, trimmed]);
    }
    if (!draft.stockLocations.includes(trimmed)) {
      updateDraft('stockLocations', [...draft.stockLocations, trimmed]);
    }
    setNewStockName("");
  };

  const toggleStockSelection = (stock: string) => {
    const current = draft.stockLocations;
    const newSelection = current.includes(stock) 
      ? current.filter(s => s !== stock) 
      : [...current, stock];
    updateDraft('stockLocations', newSelection);
  };

  const handleSizeClick = (sizeLabel: string) => {
    if (draft.stockLocations.length === 0) {
      updateDraft('stockLocations', ['Loja Principal']);
    }

    const existingIndex = variations.findIndex(v => 
      v.size === sizeLabel && 
      v.color === draft.color && 
      v.name === draft.name
    );

    if (existingIndex >= 0) {
       setVariations(prev => prev.filter((_, idx) => idx !== existingIndex));
       return;
    }

    setEditingSize(sizeLabel);
    setTempQty("");
    setQtyModalOpen(true);
  };

  const handleConfirmQty = () => {
    const qty = parseInt(tempQty);
    
    if (editingSize && !isNaN(qty) && qty > 0) {
      const typesToUse = draft.types.length > 0 ? draft.types : [draft.type];

      const newItems: VariationItem[] = typesToUse.map(typeVal => ({
        id: Math.random().toString(36).substr(2, 9),
        name: draft.name || "Produto Sem Nome", 
        color: draft.color || "Única",          
        category: draft.category,
        keyword: draft.keyword,
        variation: typeVal,
        type: typeVal,
        stockLocations: [...draft.stockLocations],
        images: [...draft.images],
        size: editingSize!,
        qty: qty,
      }));

      setVariations(prev => [...prev, ...newItems]);
    }
    setQtyModalOpen(false);
    setEditingSize(null);
  };

  const handleAddNew = () => {
    setDraft(prev => ({
      ...prev,
      color: "", 
      type: "", 
      types: [], 
      images: [] 
    }));
  };

  const handleRemoveItem = (id: string) => {
    setVariations(prev => prev.filter(v => v.id !== id));
  };

  const handleSaveAll = async () => {
    if (!onSave) return;
    setIsSaving(true);
    
    const formattedName = formatNameSafe(draft.name);

    const processedVariations = await Promise.all(variations.map(async (v) => {
      const imagesToProcess = v.images.length > 0 ? v.images : draft.images;
      const processedImages = await Promise.all(imagesToProcess.map(async (img) => {
        return await blobUrlToBase64(img);
      }));

      return { 
        ...v, 
        name: formattedName || v.name, 
        images: processedImages 
      };
    }));

    onSave(processedVariations, { name: formattedName });
    setIsSaving(false);
    onClose();
  };

  const handleSendToProduction = async () => {
    if (variations.length === 0) return alert("⚠️ Adicione variações antes de enviar.");
    if (!confirm("Confirma o envio para Produção?")) return;
    
    setIsSendingToProduction(true);
    try {
        let mainImage = draft.images[0] || ""; 
        if (!mainImage && variations.length > 0) mainImage = variations[0].images[0] || "";
        
        mainImage = await blobUrlToBase64(mainImage);
        
        const result = await createProductionOrderAction({
            productName: formatNameSafe(draft.name) || "Produto",
            image: mainImage,
            variations: variations.map(v => ({ ...v, name: formatNameSafe(draft.name) || v.name }))
        });
        
        if (result.success) alert("✅ Enviado para Produção!");
        else alert("❌ Erro ao enviar.");
    } catch (error) {
        alert("Erro técnico ao enviar.");
    } finally {
        setIsSendingToProduction(false);
    }
  };

  const formatQty = (num: number) => num >= 1000 ? (num / 1000).toFixed(1).replace('.0', '') + 'k' : num.toString();

  return (
    <div className="flex flex-col h-full bg-[#eeeeee] relative overflow-hidden">
      
      <div className="bg-white px-4 py-3 shadow-sm z-10 flex items-center justify-between shrink-0">
        <div>
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Editor de Variações</span>
           <h2 className="text-lg font-black text-gray-900 tracking-tight leading-none">Novo Cadastro</h2>
        </div>
        <div className="hidden md:block">
           <MiniPreviewCard draft={draft} />
        </div>
      </div>

      <div className={cn("flex-1 scrollbar-hide p-3 pb-80 space-y-3", qtyModalOpen ? "overflow-hidden" : "overflow-y-auto")}>
        
        <div className="md:hidden">
           <MiniPreviewCard draft={draft} />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-600">1</div>
             <span className="text-xs font-black text-gray-900 uppercase tracking-wide">Dados do Produto</span>
          </div>

          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              value={draft.name} 
              onChange={(e) => updateDraft('name', e.target.value)} 
              placeholder="Nome do Produto (Ex: Jeans Skinny)" 
              className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#5874f6] focus:bg-white transition-all" 
            />
            
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Tag size={16} /></div>
                    <input type="text" value={draft.category} onChange={(e) => updateDraft('category', e.target.value)} placeholder="Categoria" className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#5874f6] focus:bg-white transition-all" />
                </div>
                <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Type size={16} /></div>
                    <input type="text" value={draft.keyword} onChange={(e) => updateDraft('keyword', e.target.value)} placeholder="Palavra-chave" className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#5874f6] focus:bg-white transition-all" />
                </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col gap-3">
           <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-xs font-black text-blue-600">2</div>
                <span className="text-xs font-black text-gray-900 uppercase tracking-wide">Cor & Mídia</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400">{draft.images.length}/20 fotos</span>
           </div>

           <div className="flex gap-3 flex-col md:flex-row">
              <div className="flex-1 space-y-3">
                  <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Palette size={16} /></div>
                      <input type="text" value={draft.color} onChange={(e) => updateDraft('color', e.target.value)} placeholder="Cor (Ex: Azul Marinho)" className="w-full h-11 bg-blue-50/30 border border-blue-100 rounded-xl pl-10 pr-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#5874f6] focus:bg-white transition-all" />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                          <div className="relative flex-1">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Sparkles size={16} /></div>
                              <input 
                                type="text" 
                                value={draft.type} 
                                onChange={(e) => updateDraft('type', e.target.value)} 
                                onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
                                placeholder="Detalhe (Opcional)" 
                                className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#5874f6] focus:bg-white transition-all" 
                              />
                          </div>
                          <button onClick={handleAddType} className="h-11 px-3 bg-gray-100 text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-200 transition-colors flex items-center justify-center">
                              <Plus size={20} />
                          </button>
                      </div>
                      
                      {draft.types.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                              {draft.types.map((type, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-1">
                                      {type}
                                      <button onClick={() => handleRemoveType(type)} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                                  </span>
                              ))}
                          </div>
                      )}
                  </div>
              </div>

              <div className="flex-1">
                 {draft.images.length === 0 ? (
                    <div onClick={() => fileInputRef.current?.click()} className="h-[100px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group">
                        <Plus size={20} className="text-gray-400 mb-1" />
                        <span className="text-xs font-bold text-gray-500">Adicionar Fotos</span>
                    </div>
                 ) : (
                    <div className="h-[100px] overflow-y-auto pr-1">
                       <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndPhotos}>
                        <SortableContext items={draft.images} strategy={rectSortingStrategy}>
                          <div className="grid grid-cols-4 gap-2">
                            {draft.images.map((url) => (
                              <SortablePhotoItem key={url} id={url} url={url} onRemove={() => handleRemovePhoto(url)} />
                            ))}
                            {draft.images.length < 20 && (
                               <button onClick={() => fileInputRef.current?.click()} className="aspect-square border border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-400">
                                  <Plus size={16} />
                               </button>
                            )}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                 )}
                 <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleFileSelect} disabled={draft.images.length >= 20} />
              </div>
           </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col gap-4">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-600">3</div>
             <span className="text-xs font-black text-gray-900 uppercase tracking-wide">Grade & Estoque</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
              {availableStocks.map((stock) => (
                  <button key={stock} onClick={() => toggleStockSelection(stock)} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all active:scale-95 flex items-center gap-1.5", draft.stockLocations.includes(stock) ? "bg-blue-50 border-[#5874f6] text-[#5874f6]" : "bg-white border-gray-200 text-gray-500")}>
                    {draft.stockLocations.includes(stock) && <Check size={10} strokeWidth={4} />}
                    {stock}
                  </button>
              ))}
              <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 border border-gray-200 focus-within:border-gray-400 transition-colors">
                  <Plus size={12} className="text-gray-400" />
                  <input 
                    type="text" 
                    value={newStockName} 
                    onChange={(e) => setNewStockName(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateStock()}
                    placeholder="Novo Local" 
                    className="w-20 h-7 bg-transparent text-[10px] font-bold text-gray-900 outline-none"
                  />
              </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {sizes.map((size) => {
              const registeredItem = variations.find(v => 
                 v.size === size && 
                 v.color.toLowerCase() === draft.color.toLowerCase() && 
                 v.name.toLowerCase() === draft.name.toLowerCase()
              );
              
              return (
                <div key={size} className="flex flex-col items-center gap-1">
                  <button onClick={() => handleSizeClick(size)} className={cn("w-12 h-12 rounded-xl font-black text-sm border flex items-center justify-center relative transition-all active:scale-90", registeredItem ? "bg-[#5874f6] text-white border-[#5874f6] shadow-md shadow-blue-500/20" : "bg-white text-gray-900 border-gray-200 hover:border-blue-300")}>
                    {size}
                    {registeredItem && (<div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"><Check size={8} strokeWidth={4} className="text-white"/></div>)}
                  </button>
                  <span className={cn("text-[10px] font-bold h-4 uppercase", registeredItem ? "text-[#5874f6]" : "text-transparent")}>{registeredItem ? formatQty(registeredItem.qty) : "."}</span>
                </div>
              );
            })}
          </div>
        </div>

        {variations.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col gap-3">
            <span className="text-xs font-black text-gray-900 uppercase tracking-wide">Itens Prontos ({variations.length})</span>
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
              {variations.slice().reverse().map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-xl flex shrink-0 items-center justify-center overflow-hidden relative shadow-sm">
                      {item.images && item.images.length > 0 ? <img src={item.images[0]} alt="Mini" className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-gray-300" />}
                      <div className="absolute bottom-0 right-0 bg-gray-900 text-white text-[10px] font-black px-1.5 py-0.5 rounded-tl-lg">{item.size}</div>
                    </div>
                    <div className="flex flex-col justify-center gap-1 truncate">
                      <span className="text-sm font-black text-gray-900 truncate leading-tight">{item.name}</span>
                      <div className="flex flex-col gap-0.5">
                         <span className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-blue-200"></span>
                            {item.color}
                         </span>
                         {item.type && <span className="text-xs text-gray-500">{item.type}</span>}
                         <span className="text-xs font-medium text-gray-400">Quantidade: <strong className="text-gray-900">{item.qty}</strong></span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveItem(item.id)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <div className="absolute bottom-0 left-0 w-full p-3 pt-4 bg-[#eeeeee] z-20 flex flex-col gap-2 border-t border-gray-200/50 backdrop-blur-sm">
        <button onClick={handleAddNew} className="w-full h-11 bg-white border border-gray-300 text-gray-900 rounded-xl shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-[0.98] transition-all">
            <Layers size={16} /> <span className="text-xs font-bold uppercase">Adicionar Novo (Manter Dados)</span>
        </button>

        <button onClick={handleSendToProduction} disabled={isSendingToProduction} className="w-full h-11 bg-gray-900 text-white rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-black transition-colors active:scale-[0.98]">
            {isSendingToProduction ? <span className="animate-pulse text-xs font-bold">Enviando...</span> : <><Factory size={16} /> <span className="text-xs font-bold uppercase">Enviar para Produção</span></>}
        </button>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-12 bg-white text-gray-900 border border-gray-200 rounded-xl shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-[0.98] transition-all">
            <ChevronLeft size={18} strokeWidth={2.5} />
            <span className="font-black text-xs uppercase">Voltar</span>
          </button>
          <button onClick={handleSaveAll} disabled={isSaving} className="flex-[2] h-12 bg-[#5874f6] text-white rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all">
            {isSaving ? <span className="animate-pulse">Salvando...</span> : <><Check size={18} strokeWidth={3} /><span className="font-black text-sm uppercase">Salvar Tudo</span></>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {qtyModalOpen && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-gray-900/40 p-6 pb-60 touch-none cursor-default">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white w-full max-w-[280px] rounded-2xl shadow-2xl p-5 flex flex-col items-center gap-4 relative overflow-hidden">
               <div className="w-full flex items-center gap-3 p-2 bg-gray-50 rounded-xl mb-1">
                   {draft.images.length > 0 ? (
                       <img src={draft.images[0]} className="w-8 h-8 rounded-lg object-cover bg-white border border-gray-200" />
                   ) : (
                       <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center"><Box size={14} className="text-gray-300"/></div>
                   )}
                   <div className="flex flex-col leading-none">
                       <span className="text-[10px] font-bold text-gray-500 uppercase">Adicionando</span>
                       <span className="text-xs font-black text-gray-900">{editingSize}</span>
                   </div>
                   <div className="ml-auto">
                       <button onClick={() => setQtyModalOpen(false)} className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-300"><X size={12} strokeWidth={3}/></button>
                   </div>
               </div>

              <div className="flex flex-col items-center w-full gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quantidade</label>
                  <input type="number" value={tempQty} onChange={(e) => setTempQty(e.target.value)} placeholder="0" autoFocus className="w-full h-14 border-2 border-gray-100 focus:border-[#5874f6] rounded-xl text-center text-3xl font-black text-gray-900 outline-none transition-all bg-gray-50 focus:bg-white" />
              </div>
              
              <button onClick={handleConfirmQty} className="w-full h-12 bg-[#00c853] text-white rounded-xl font-black text-sm uppercase shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                 <Check size={20} strokeWidth={3} /> Confirmar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 📚 ESTUDO: 4. Exportação com a "Etiqueta Inteligente"
// Adicionamos o 4º argumento com os metadados para o Guardian OS.
export const StockVariationsPopup = withGuardian(
  StockVariationsPopupBase, 
  "components/builder/ui/StockVariationsPopup.tsx", 
  "POPUP",
  {
    label: "Editor de Variações de Estoque",
    description: "Modal crítico para gerenciamento de grade de cores, tamanhos e envio para produção.",
    orientationNotes: `
⚠️ **Pontos de Atenção**:
- **Z-Index**: Deve sobrepor o Header (z-50).
- **Dependências**: Utiliza 'createProductionOrderAction' para persistência.
- **UX**: Implementa Drag-and-Drop para ordenação de fotos.
- **Fluxo**: Geralmente invocado via 'StockRegisterView'.
    `.trim(),
    connectsTo: [
      { 
        target: "components/views/StockRegisterView.tsx", 
        type: "COMPONENT", 
        description: "Componente Pai (Invocador Principal)" 
      },
      { 
        target: "app/actions/production.ts", 
        type: "EXTERNAL", 
        description: "Server Action: createProductionOrderAction" 
      }
    ],
    tags: ["Inventory", "Production", "Complex Form"]
  }
);
