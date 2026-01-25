'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Camera, Type, Tag, Box, Barcode, ImageIcon, Store, 
  DollarSign, ChevronLeft, CheckCircle2, Save, ArrowRightLeft, Trash2 
} from 'lucide-react';

import { StockVariationsPopup, VariationItem } from './StockVariationsPopup';
import { StockPricePopup, ProductVisibility } from './StockPricePopup';
import { StockResupplyPopup } from './StockResupplyPopup';
import { ProductManagementPopup } from './ProductManagementPopup'; // 🧱 NOVO: Import do popup de gerenciamento
import { saveProductAction, removeProductGridBlocksAction } from '@/app/actions/product'; // 🧹 LIMPEZA
import { PRODUCT_UPDATE_EVENT } from '@/components/builder/blocks/ProductGrid';
import { fileToBase64 } from '@/utils/image-helper';
import { withGuardian } from "@/components/guardian/GuardianBeacon";

// ✅ TIPAGEM ESTRITA
interface StockRegisterViewProperties {
  onBack: () => void;
  onRegister?: (productData: { image?: string }) => void;
  isPageMode?: boolean; // Nova prop para controle de layout
}

const StockRegisterViewBase = ({ onBack, onRegister, isPageMode = false }: StockRegisterViewProperties) => {
  const [isToggleActive, setIsToggleActive] = useState(true);
  const [isVariationsOpen, setIsVariationsOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isResupplyOpen, setIsResupplyOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false); // 🧱 NOVO: Estado do popup de gerenciamento
  const [isSendingData, setIsSendingData] = useState(false);

  // 🧹 LIMPEZA AUTOMÁTICA: Remove blocos antigos de "Lançamentos da Semana" na primeira renderização
  React.useEffect(() => {
    const cleanupOldBlocks = async () => {
      try {
        const result = await removeProductGridBlocksAction();
        if (result.success && result.removedCount && result.removedCount > 0) {
          console.log(`🧹 ${result.removedCount} bloco(s) antigo(s) removido(s) automaticamente`);
        }
      } catch (error) {
        console.error('❌ Erro na limpeza automática:', error);
      }
    };
    
    cleanupOldBlocks();
  }, []); // Executa apenas uma vez na montagem

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState('R$ 0,00');
  const [productCategory, setProductCategory] = useState(""); // 🧱 CMS DINÂMICO
  const [productVisibility, setProductVisibility] = useState<ProductVisibility>('none');
  const [savedVariations, setSavedVariations] = useState<VariationItem[]>([]);
  
  const [directPhotoFile, setDirectPhotoFile] = useState<File | null>(null);
  const [directPhotoPreviewUrl, setDirectPhotoPreviewUrl] = useState<string | null>(null);

  const cameraInputReference = useRef<HTMLInputElement>(null);
  const galleryInputReference = useRef<HTMLInputElement>(null);

  const gridButtons = [
    { label: "Abastecer Estoque", icon: ArrowRightLeft, action: 'openResupply', highlight: true },
    { label: "Gerenciar Produtos", icon: Trash2, action: 'openManagement', highlight: false, isManagement: true }, // 🧱 NOVO
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
    if (action === 'openManagement') setIsManagementOpen(true); // 🧱 NOVO
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

  const handleVariationsSave = (items: VariationItem[], metadata?: { name: string; category?: string }) => {
    setSavedVariations(items);
    if (metadata?.name) {
      setProductName(metadata.name);
    }
    // 🧱 CMS DINÂMICO: Recebe categoria das variações
    if (metadata?.category) {
      setProductCategory(metadata.category);
    }
  };

  const handleConfirmRegister = async () => {
    const sanitizedName = productName.trim();
    if (!sanitizedName) return alert("⚠️ Digite o nome do produto antes de salvar!");
    
    // 🧱 CMS DINÂMICO: Valida categoria
    if (!productCategory.trim()) {
      return alert("⚠️ Selecione ou digite a categoria do produto!");
    }
    
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
        category: productCategory.trim(), // 🧱 CMS DINÂMICO
        visibility: productVisibility,
        variations: savedVariations.map(v => ({ 
          ...v, 
          name: sanitizedName,
          stock: v.qty,
          qty: v.qty
        })),
        image: finalImageBase64
      });

      if (result.success) {
        window.dispatchEvent(new Event(PRODUCT_UPDATE_EVENT));
        alert("✅ Produto Salvo com Sucesso!");
        if (onRegister && result.product) onRegister({ image: result.product.imageUrl || undefined });
        onBack();
      } else {
        alert(`❌ Erro ao salvar: ${result.error || 'Falha desconhecida'}`);
      }
    } catch (error) {
      console.error("Erro no cliente:", error);
      alert("❌ Erro de conexão ou processamento.");
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
    <div className={cn(
      "flex flex-col bg-[#eeeeee] transition-all duration-300",
      // ✅ LÓGICA HÍBRIDA: Se for PageMode, ocupa o container relativo. Se for Modal, usa absolute inset-0.
      isPageMode ? "relative w-full h-full rounded-3xl bg-white overflow-hidden" : "absolute inset-0 z-10 h-full animate-in slide-in-from-right"
    )}>
      <input type="file" ref={cameraInputReference} accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      <input type="file" ref={galleryInputReference} accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="flex-1 overflow-y-auto scrollbar-hide p-3 pb-32 space-y-2">
        {/* Header Interno (Ocultar se estiver em PageMode pois a página terá seu próprio header, ou manter estilizado) */}
        <div className={cn("bg-white rounded-2xl p-3 shadow-sm border border-gray-200 flex items-center justify-between", isPageMode && "border-none shadow-none px-0")}>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Novo Item</span>
            <h2 className="text-lg font-black text-gray-900 tracking-tight leading-none">Cadastrar</h2>
          </div>
          <button onClick={() => setIsToggleActive(!isToggleActive)} className={cn("relative w-10 h-6 rounded-full transition-all flex items-center border", isToggleActive ? "bg-[#00c853] border-[#00c853]" : "bg-gray-200 border-gray-300")}>
            <span className={cn("absolute left-[2px] bg-white w-4 h-4 rounded-full shadow-md transition-transform", isToggleActive ? "translate-x-4" : "translate-x-0")} />
          </button>
        </div>

        {directPhotoPreviewUrl && (
          <div className="relative w-full h-40 rounded-2xl overflow-hidden shadow-md border-2 border-[#5874f6] bg-gray-900">
            <Image 
              src={directPhotoPreviewUrl} 
              fill
              className="object-cover opacity-90" 
              alt="Pré-visualização" 
              sizes="(max-width: 768px) 100vw, 500px"
            />
            <div className="absolute bottom-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
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

        {/* 🧱 CMS DINÂMICO: Campo de Categoria */}
        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-200">
          <input
            type="text"
            value={productCategory}
            onChange={(event) => setProductCategory(event.target.value)}
            placeholder="CATEGORIA (ex: Camisetas, Vestidos, Calças)"
            className="w-full h-10 px-4 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-400 font-bold text-xs text-center outline-none border-2 border-transparent focus:border-[#00c853]"
          />
          <p className="text-[10px] text-gray-500 text-center mt-1 px-2">
            💡 Uma nova seção será criada automaticamente na Home se esta categoria ainda não existir
          </p>
        </div>

        {/* ✅ GRID RESPONSIVO: 2 colunas no mobile, 4 no desktop (lg) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {gridButtons.map((button, index) => {
            const isPriceSet = button.action === 'openPrice' && productPrice !== 'R$ 0,00';
            const hasVars = button.action === 'openVariations' && savedVariations.length > 0;
            const hasPhoto = (button.action === 'openCamera' || button.action === 'openGallery') && directPhotoFile !== null;
            const isManagement = button.isManagement === true; // 🧱 NOVO: Identifica botão de gerenciamento
            
            return (
              <button key={index} onClick={() => handleGridButtonClick(button.action)} className={cn("flex flex-col items-center justify-center gap-1 py-2 px-1 bg-white border border-gray-200 rounded-xl shadow-sm active:scale-95 transition-all group", (isPriceSet || hasVars || hasPhoto) && "border-[#00c853] bg-green-50/30", button.highlight && "border-orange-200 bg-orange-50/50", isManagement && "border-red-200 bg-red-50/30")}>
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", (isPriceSet || hasVars || hasPhoto) ? "bg-[#00c853] text-white" : button.highlight ? "bg-orange-100 text-orange-600" : isManagement ? "bg-red-100 text-red-600" : "bg-gray-50 text-gray-600")}>
                  <button.icon size={26} strokeWidth={button.highlight || isManagement ? 2 : 1.5} />
                </div>
                <span className="text-[11px] font-black uppercase text-gray-800">{button.label}</span>
                {(isPriceSet || hasVars) && <span className="text-[10px] font-bold text-[#00c853]">{isPriceSet ? productPrice : `${savedVariations.length} item(s)`}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer de Ações */}
      <div className={cn("absolute bottom-0 left-0 w-full p-3 pt-6 bg-gradient-to-t from-[#eeeeee] to-transparent z-20", isPageMode && "from-white rounded-b-3xl")}>
        <div className="flex gap-2">
          <button onClick={handleSafeBack} disabled={isSendingData} className="flex-1 h-14 bg-[#ff4d6d] text-white rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-[#e0435f] transition-colors">
            <ChevronLeft size={20} strokeWidth={3} /><span className="font-black text-xs uppercase">Cancelar</span>
          </button>
          <button onClick={handleConfirmRegister} disabled={isSendingData} className="flex-[2] h-14 bg-[#5874f6] text-white rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-[#4a63d8] transition-colors">
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

      {/* 🧱 NOVO: Popup de Gerenciamento de Produtos */}
      <ProductManagementPopup
        isOpen={isManagementOpen}
        onClose={() => setIsManagementOpen(false)}
        onProductDeleted={() => {
          // Dispara evento para atualizar outras telas
          window.dispatchEvent(new Event(PRODUCT_UPDATE_EVENT));
        }}
      />

      <StockPricePopup isOpen={isPriceOpen} onClose={() => setIsPriceOpen(false)} onConfirm={handlePriceConfirmation} initialPrice={productPrice} initialVisibility={productVisibility} />
    </div>
  );
};

export const StockRegisterView = withGuardian(
  StockRegisterViewBase, 
  "components/builder/ui/StockRegisterView.tsx", 
  "UI_COMPONENT",
  {
    label: "Tela de Cadastro de Produto",
    description: "Hub central para criação de novos produtos. Suporta modo Modal e Página Completa.",
    orientationNotes: `
⚠️ **Arquitetura Híbrida**:
- **isPageMode=true**: Renderiza relativo, sem animação de entrada, grid expandido (Desktop).
- **isPageMode=false**: Renderiza absoluto, com animação slide-in (Mobile/Modal).
    `,
    connectsTo: [
      { target: "components/builder/ui/StockVariationsPopup.tsx", type: "COMPONENT", description: "Modal de Variações" },
      { target: "app/actions/product.ts", type: "EXTERNAL", description: "Action: saveProductAction" }
    ],
    tags: ["Main View", "Product Management", "Hybrid UI"]
  }
);