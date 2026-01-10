// components/builder/blocks/ReadyStockListBlock.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { BlockConfig, ProductionItemData } from '@/types/builder';
import { getReadyForStoreItemsAction, dispatchFromStoreAction } from '@/app/actions/production';
import { Loader2, ClipboardList, PackageCheck, ChevronDown, ChevronUp } from 'lucide-react';

// Componente Interno do Card de Estoque Pronto
const ReadyStockCard = ({ item, onDispatch }: { item: ProductionItemData; onDispatch: (id: string) => void }) => {
    const [showDetails, setShowDetails] = useState(true);

    return (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-lg p-4 flex flex-col gap-4 transition-all hover:shadow-xl">
            <div className="flex gap-4">
                {/* Imagem do Produto */}
                <div className="relative w-24 h-32 lg:w-32 lg:h-40 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                    <Image 
                        src={item.productImage} 
                        alt={item.productName} 
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 96px, 128px"
                    />
                    <div className="absolute bottom-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-tl-md z-10">
                        {item.quantity} un
                    </div>
                </div>

                <div className="flex flex-col flex-1 min-w-0 justify-between">
                    <div>
                        <h3 className="font-black text-gray-900 text-lg lg:text-xl leading-tight uppercase mb-1">
                            {item.productName}
                        </h3>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded w-fit block mb-2">
                            CHEGOU DA PRODUÇÃO
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                            Iniciado: {item.startedAt}
                        </span>
                    </div>

                    <button 
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 mt-2 hover:bg-gray-100"
                    >
                        <span>Ver Grades ({item.variationsDetail?.length || 0})</span>
                        {showDetails ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                    </button>
                </div>
            </div>

            {/* Detalhes Expansíveis */}
            {showDetails && item.variationsDetail && (
                <div className="bg-blue-50/30 rounded-xl p-3 border border-blue-100 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Conferência de Entrada</span>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                        {item.variationsDetail.map((v, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 flex items-center justify-center bg-gray-900 text-white text-[10px] font-bold rounded">
                                        {v.size}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-700 uppercase">{v.color}</span>
                                        {v.type && <span className="text-[10px] text-gray-400 italic">{v.type}</span>}
                                    </div>
                                </div>
                                <span className="text-sm font-black text-blue-600">{v.qty} un</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Botão de Ação */}
            <button 
                onClick={() => onDispatch(item.id)}
                className="w-full h-12 bg-green-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-green-700"
            >
                <PackageCheck size={20} />
                Confirmar Recebimento
            </button>
        </div>
    );
};

export const ReadyStockListBlock = ({ config }: { config: BlockConfig }) => {
    const [items, setItems] = useState<ProductionItemData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchItems = async () => {
        try {
            const data = await getReadyForStoreItemsAction();
            setItems(data);
        } catch (error) {
            console.error("Erro ao buscar estoque pronto", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
        const interval = setInterval(fetchItems, 5000); 
        return () => clearInterval(interval);
    }, []);

    const handleDispatch = async (id: string) => {
        if(!confirm("Confirmar entrada no estoque e remover da lista de recebimento?")) return;
        
        await dispatchFromStoreAction(id);
        alert("✅ Produtos adicionados ao estoque da loja!");
        await fetchItems();
    };

    if (loading) {
        return (
            <div className="w-full py-20 flex flex-col items-center justify-center gap-2 text-gray-400">
                <Loader2 className="animate-spin" />
                <span className="text-xs font-bold uppercase">Verificando recebimentos...</span>
            </div>
        );
    }

    return (
        <div className="w-full px-4 pb-24 flex flex-col gap-4 pt-4" style={{ backgroundColor: config.style.bgColor || 'transparent' }}>
            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50 mx-4">
                    <ClipboardList size={48} className="mb-2 opacity-50"/>
                    <p className="font-bold text-sm">Nenhum lote para receber.</p>
                    <p className="text-xs text-center px-8">Aguarde a produção finalizar e enviar novos lotes.</p>
                </div>
            ) : (
                items.map(item => (
                    <ReadyStockCard key={item.id} item={item} onDispatch={handleDispatch} />
                ))
            )}
        </div>
    );
};