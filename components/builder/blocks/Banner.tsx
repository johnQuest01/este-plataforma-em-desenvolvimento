'use client';

import React from 'react';
import { BlockConfig } from '@/types/builder';
import Image from 'next/image';

export const BannerBlock = ({ config }: { config: BlockConfig }) => {
  const imageUrl = (config.data?.imageUrl as string) || '';
  const linkUrl  = (config.data?.linkUrl  as string) || '';
  const altText  = (config.data?.title    as string) || 'Banner Maryland';

  const inner = (
    <div
      className="w-full overflow-hidden relative"
      style={{
        aspectRatio: '16 / 7',
        backgroundColor: config.style.bgColor || '#f3f4f6',
        border: 'none',
        borderRadius: 0,
      }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={altText}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center opacity-10">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Banner Maryland
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full p-0 m-0" style={{ backgroundColor: 'transparent' }}>
      {linkUrl ? <a href={linkUrl} className="block w-full">{inner}</a> : inner}
    </div>
  );
};
