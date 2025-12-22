// app/loading.tsx
import React from 'react';

export default function Loading() {
  return (
    <div className="w-full h-dvh bg-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Simulando o App Shell */}
      <div className="w-full h-full bg-gray-50 flex flex-col lg:max-w-[420px] lg:h-[850px] lg:rounded-[2.5rem] lg:border-[8px] lg:border-gray-900 lg:shadow-2xl relative">
        
        {/* Header Skeleton */}
        <div className="h-24 bg-gray-200 animate-pulse w-full rounded-b-3xl shrink-0" />

        {/* Content Skeleton */}
        <div className="flex-1 p-4 space-y-4 overflow-hidden">
           {/* Banner */}
           <div className="w-full aspect-[16/10] bg-gray-200 rounded-2xl animate-pulse" />
           
           {/* Bolinhas (Categorias) */}
           <div className="flex gap-4 overflow-hidden">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-20 h-20 bg-gray-200 rounded-full shrink-0 animate-pulse" />
              ))}
           </div>

           {/* Grid Produtos */}
           <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
           </div>
        </div>

        {/* Footer Skeleton */}
        <div className="h-20 bg-white border-t border-gray-200 absolute bottom-0 w-full flex justify-evenly items-center pb-4">
           {[1,2,3,4,5].map(i => (
             <div key={i} className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />
           ))}
        </div>

      </div>
    </div>
  );
}