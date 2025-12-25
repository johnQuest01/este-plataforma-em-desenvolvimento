'use client';

import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Camera, 
  Type, 
  Tag, 
  Box, 
  Barcode, 
  Image as ImageIcon, 
  Store, 
  DollarSign, 
  ChevronLeft, 
  CheckCircle2, 
  Save, 
  ArrowRightLeft 
} from 'lucide-react';

import { StockVariationsPopup, VariationItem } from './StockVariationsPopup';
import { StockPricePopup, ProductVisibility } from './StockPricePopup';
import { StockResupplyPopup } from './StockResupplyPopup';
import { saveProductAction } from '@/app/actions/product';
import { PRODUCT_UPDATE_EVENT } from '@/components/builder/blocks/ProductGrid';
import { fileToBase64 } from '@/utils/image-helper';

interface StockRegisterViewProperties {
  onBack: () => void;
  onRegister?: (productData: { image?: string }) => void;
}

export const StockRegisterView = ({ onBack, onRegister }: StockRegisterViewProperties) => {
  const [isToggleActive, setIsToggleActive] = useState(true);
  const [isVariationsOpen, setIsVariationsOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isResupplyOpen, setIsResupplyOpen] = useState(false);
  const [isSendingData, setIsSendingData] = useState(false);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState('R$ 0,00');
  const [productVisibility, setProductVisibility] = useState<ProductVisibility>('none');
  const [savedVariations, setSavedVariations] = useState<VariationItem[]>([]);
  
  const [directPhotoFile, setDirectPhotoFile] = useState<File | null>(null);
  const [directPhotoPreviewUrl, setDirectPhotoPreviewUrl] = useState<string | null>(null);

  const cameraInputReference = useRef<HTMLInputElement>(null);
  const galleryInputReference = useRef<HTMLInputElement>(null);

  const gridButtons = [
    { label: "Abastecer Estoque", icon: ArrowRightLeft, action: 'openResupply', highlight: true },
    { label: "Nome do produto", icon: Type },
    { label: "Loja", icon: Store },
    { label: "Preço", icon: DollarSign, action: 'openPrice' },
    { label: "SKU", icon: Barcode },
    { label: "Apontar Camera", icon: Camera, action: 'openCamera' },
    { label: "CÓDIGO", icon: Barcode },
    { label: "Fotos", icon: ImageIcon, action: 'openGallery' },
    { label: "Variações", icon: Tag, action: 'openVariations' },
    { label: "Box", icon: Box },
  ];

  const handleGridButtonClick = (action?: string) => {
    if (action === 'openVariations') setIsVariationsOpen(true);
    if (action === 'openPrice') setIsPriceOpen(true);
    if (action === 'openResupply') setIsResupplyOpen(true);
    if (action === 'openCamera') cameraInputReference.current?.click();
    if (action === 'openGallery') galleryInputReference.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setDirectPhotoFile(selectedFile);
      setDirectPhotoPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handlePriceConfirmation = (price: string, visibility: ProductVisibility) => {
    setProductPrice(price);
    setProductVisibility(visibility);
  };

  const handleVariationsSave = (items: VariationItem[], metadata?: { name: string }) => {
    setSavedVariations(items);
    if (metadata?.name) {
      setProductName(metadata.name);
    }
  };

  const handleConfirmRegister = async () => {
    // Mantém o nome exatamente como o usuário digitou, removendo apenas espaços extras
    const sanitizedName = productName.trim();

    if (!sanitizedName) return alert("⚠️ Digite o nome do produto antes de salvar!");
    
    const hasVariationPhoto = savedVariations.some(v => v.images && v.images.length > 0);
    if (!directPhotoFile && !hasVariationPhoto) {
      if (!confirm("⚠️ O produto está sem foto. Salvar mesmo assim?")) return;
    }

    setIsSendingData(true);
    try {
      let finalImageBase64 = "";
      if (directPhotoFile) {
        finalImageBase64 = await fileToBase64(directPhotoFile);
      } else if (hasVariationPhoto) {
        const itemWithPhoto = savedVariations.find(v => v.images && v.images.length > 0);
        if (itemWithPhoto) finalImageBase64 = itemWithPhoto.images[0];
      }

      const result = await saveProductAction({
        name: sanitizedName,
        price: productPrice,
        visibility: productVisibility,
        variations: savedVariations.map(v => ({ ...v, name: sanitizedName })),
        image: finalImageBase64
      });

      if (result.success) {
        window.dispatchEvent(new Event(PRODUCT_UPDATE_EVENT));
        alert("✅ Produto Salvo com Sucesso!");
        if (onRegister && result.product) onRegister({ image: result.product.mainImage });
        onBack();
      } else alert("❌ Erro ao salvar produto.");
    } catch (error) {
      alert("❌ Erro ao processar o cadastro.");
    } finally {
      setIsSendingData(false);
    }
  };

  const handleSafeBack = () => {
    if (productName && !isSendingData) {
      if (confirm("⚠️ Você tem dados não salvos. Sair e PERDER o cadastro?")) onBack();
    } else onBack();
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col h-full bg-[#eeeeee] animate-in slide-in-from-right duration-300">
      <input type="file" ref={cameraInputReference} accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      <input type="file" ref={galleryInputReference} accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="flex-1 overflow-y-auto scrollbar-hide p-3 pb-32 space-y-2">
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-200 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Novo Item</span>
            <h2 className="text-lg font-black text-gray-900 tracking-tight leading-none">Cadastrar</h2>
          </div>
          <button onClick={() => setIsToggleActive(!isToggleActive)} className={cn("relative w-10 h-6 rounded-full transition-all flex items-center border", isToggleActive ? "bg-[#00c853] border-[#00c853]" : "bg-gray-200 border-gray-300")}>
            <span className={cn("absolute left-[2px] bg-white w-4 h-4 rounded-full shadow-md transition-transform", isToggleActive ? "translate-x-4" : "translate-x-0")} />
          </button>
        </div>

        {directPhotoPreviewUrl && (
          <div className="w-full h-40 rounded-2xl overflow-hidden shadow-md border-2 border-[#5874f6] relative bg-gray-900">
            <img src={directPhotoPreviewUrl} className="w-full h-full object-cover opacity-90" alt="Pré" />
            <div className="absolute bottom-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <CheckCircle2 size={10} /> Foto Pronta
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-200">
          <input
            type="text"
            value={productName}
            onChange={(event) => setProductName(event.target.value)}
            placeholder="DIGITE O NOME DO PRODUTO"
            className="w-full h-10 px-4 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-400 font-black text-xs text-center outline-none border-2 border-transparent focus:border-[#5874f6]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {gridButtons.map((button, index) => {
            const isPriceSet = button.action === 'openPrice' && productPrice !== 'R$ 0,00';
            const hasVars = button.action === 'openVariations' && savedVariations.length > 0;
            const hasPhoto = (button.action === 'openCamera' || button.action === 'openGallery') && directPhotoFile !== null;
            return (
              <button key={index} onClick={() => handleGridButtonClick(button.action)} className={cn("flex flex-col items-center justify-center gap-1 py-2 px-1 bg-white border border-gray-200 rounded-xl shadow-sm active:scale-95 transition-all group", (isPriceSet || hasVars || hasPhoto) && "border-[#00c853] bg-green-50/30", button.highlight && "border-orange-200 bg-orange-50/50")}>
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", (isPriceSet || hasVars || hasPhoto) ? "bg-[#00c853] text-white" : button.highlight ? "bg-orange-100 text-orange-600" : "bg-gray-50 text-gray-600")}>
                  <button.icon size={26} strokeWidth={button.highlight ? 2 : 1.5} />
                </div>
                <span className="text-[11px] font-black uppercase text-gray-800">{button.label}</span>
                {(isPriceSet || hasVars) && <span className="text-[10px] font-bold text-[#00c853]">{isPriceSet ? productPrice : `${savedVariations.length} item(s)`}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-3 pt-6 bg-gradient-to-t from-[#eeeeee] to-transparent z-20">
        <div className="flex gap-2">
          <button onClick={handleSafeBack} disabled={isSendingData} className="flex-1 h-14 bg-[#ff4d6d] text-white rounded-xl shadow-lg flex items-center justify-center gap-2">
            <ChevronLeft size={20} strokeWidth={3} /><span className="font-black text-xs uppercase">Cancelar</span>
          </button>
          <button onClick={handleConfirmRegister} disabled={isSendingData} className="flex-[2] h-14 bg-[#5874f6] text-white rounded-xl shadow-lg flex items-center justify-center gap-2">
            {isSendingData ? <span className="animate-pulse">Salvando...</span> : <><Save size={20} strokeWidth={2.5} /><span className="font-black text-sm uppercase">FINALIZAR CADASTRO</span></>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isVariationsOpen && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="absolute inset-0 z-50 bg-[#eeeeee]">
            <StockVariationsPopup
              isOpen={isVariationsOpen}
              onClose={() => setIsVariationsOpen(false)}
              onSave={handleVariationsSave}
              initialItems={savedVariations}
            />
          </motion.div>
        )}
        {isResupplyOpen && <StockResupplyPopup isOpen={isResupplyOpen} onClose={() => setIsResupplyOpen(false)} />}
      </AnimatePresence>

      <StockPricePopup isOpen={isPriceOpen} onClose={() => setIsPriceOpen(false)} onConfirm={handlePriceConfirmation} initialPrice={productPrice} initialVisibility={productVisibility} />
    </div>
  );
};