'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';

interface ProductInformation {
  id: string;
  name: string;
  imageUrl: string;
  isPreOrder: boolean;
  isLive: boolean;
  stockPercentage: number;
  isFavorite: boolean;
}

export const CatalogShowcaseBlock: React.FC<BlockComponentProps> = ({ config }) => {
  const { style } = config;
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categoryTags = ['Modinha', 'Feirinha', 'Casual'];
  const subCategoryTags = ['Cropped', 'Saia', 'Short', 'Calça', 'Vestido'];

  const mockProducts: ProductInformation[] = [
    {
      id: 'prod-1',
      name: 'Cropped vermelho',
      imageUrl: 'https://placehold.co/400x600/fbcfe8/000000?text=Modelo',
      isPreOrder: true,
      isLive: true,
      stockPercentage: 0,
      isFavorite: true
    },
    {
      id: 'prod-2',
      name: 'Cropped vermelho',
      imageUrl: 'https://placehold.co/400x600/fbcfe8/000000?text=Modelo',
      isPreOrder: false,
      isLive: false,
      stockPercentage: 60,
      isFavorite: true
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-screen pb-24 flex flex-col" style={{ backgroundColor: style.bgColor }}>
      
      {/* Barra de Busca */}
      <div className="px-4 pt-6 pb-4">
        <input 
          type="text" 
          placeholder="Buscar por nome ou refêrencia" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border-2 border-black rounded-full px-6 py-2 text-center font-bold text-gray-500 outline-none focus:border-[#5874f6]"
        />
      </div>

      <h2 className="text-center font-black text-black text-lg px-8 leading-tight mb-6">
        Todos os Seus Favoritos por Categorias separados por Tags
      </h2>

      {/* Tags Principais */}
      <div className="flex items-center gap-4 px-4 mb-6 overflow-x-auto scrollbar-hide">
        <span className="font-black text-black text-lg">Tags</span>
        {categoryTags.map(tag => (
          <button key={tag} className="border-2 border-black rounded-md px-4 py-1 font-bold text-black whitespace-nowrap hover:bg-gray-50">
            {tag}
          </button>
        ))}
      </div>

      {/* Sub Tags (Imagem 2) */}
      <div className="flex flex-wrap gap-2 px-4 mb-8">
        {subCategoryTags.map(tag => (
          <button key={tag} className="border-2 border-black rounded-md px-6 py-1 font-bold text-black hover:bg-gray-50">
            {tag}
          </button>
        ))}
      </div>

      {/* Banner Placeholder (Imagem 2) */}
      <div className="w-full border-y-2 border-black py-8 flex flex-col items-center justify-center mb-8 bg-white">
        <p className="text-center font-black text-black px-8 mb-6">
          Modinha (categorias após a criação cadastro de produtos aparecerão nesta tela
        </p>
        <h1 className="text-5xl font-black text-black">Banner</h1>
      </div>

      {/* Destaque 3D / Vídeo (Imagem 2) */}
      <div className="px-4 flex items-center justify-between mb-12">
        <div className="flex flex-col items-center">
          <span className="font-black text-black text-xl mb-2">Cropped</span>
          <div className="w-16 h-0.5 bg-black"></div>
        </div>
        <div className="border-2 border-black rounded-xl p-6 w-2/3 aspect-[3/4] flex flex-col items-center justify-center text-center">
          <p className="font-bold text-black mb-4">talvez aqui sera um carrocel 3d</p>
          <p className="font-black text-black mb-8">Cropped vermelho</p>
          <p className="font-bold text-black">Aqui pode ser video ou fotos do produto em destaque</p>
        </div>
      </div>

      {/* Grid de Produtos (Imagem 5) */}
      <div className="px-4 flex gap-4 overflow-x-auto scrollbar-hide pb-8">
        {mockProducts.map((product) => (
          <div key={product.id} className="min-w-[240px] border-2 border-black rounded-xl p-3 flex flex-col">
            <h3 className="text-center font-black text-black mb-2">{product.name}</h3>
            
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border-2 border-black mb-4">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              <button className="absolute bottom-3 right-3">
                <Heart className={`w-8 h-8 ${product.isFavorite ? 'fill-[#ff4d6d] text-[#ff4d6d]' : 'text-black'}`} strokeWidth={2} />
              </button>
            </div>

            {product.stockPercentage === 0 ? (
              <div className="flex flex-col gap-2">
                <button className="w-full border-2 border-black rounded-md py-1.5 font-black text-black hover:bg-gray-50">
                  Pré Venda
                </button>
                <button className="w-full border-2 border-black rounded-md py-1.5 font-black text-black hover:bg-gray-50">
                  Live
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center mt-auto">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-[#fb923c]"></div>
                  <span className="font-black text-black text-sm">Disponível Em Estoque</span>
                </div>
                <div className="w-full h-4 border-2 border-black rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#fb923c]" style={{ width: `${product.stockPercentage}%` }}></div>
                  <div className="h-full bg-white flex-1"></div>
                </div>
                <span className="font-black text-black mt-1">Estoque</span>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};