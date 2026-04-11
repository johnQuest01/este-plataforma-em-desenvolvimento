'use client';

import React from 'react';
import Image from 'next/image';
import { UserData, isSellerUser } from '@/lib/local-db';
import { cn } from '@/lib/utils';

interface AuthorizedSellerBadgeProps {
  user: UserData;
  className?: string;
}

export function AuthorizedSellerBadge({ user, className }: AuthorizedSellerBadgeProps) {
  if (!isSellerUser(user)) {
    return null;
  }

  const displayName = typeof user.name === 'string' && user.name.trim().length > 0 ? user.name.trim() : 'Usuário';
  const firstName =
    displayName.split(/\s+/).find((part) => part.length > 0) ?? displayName;

  const nameGender =
    typeof user.nameGender === 'string' &&
    (user.nameGender === 'feminino' || user.nameGender === 'masculino')
      ? user.nameGender
      : 'masculino';

  const sellerNoun = nameGender === 'feminino' ? 'Vendedora' : 'Vendedor';
  const statusLabel = nameGender === 'feminino' ? 'Ativa' : 'Ativo';

  const photoUrl =
    typeof user.profilePictureUrl === 'string' && user.profilePictureUrl.trim().length > 0
      ? user.profilePictureUrl.trim()
      : null;

  return (
    <div
      className={cn(
        'relative w-full min-h-[168px] rounded-3xl shadow-lg overflow-hidden bg-white',
        className
      )}
    >
      {/* Faixa rosa no topo (altura fixa para % não colapsar) */}
      <div className="h-14 bg-[#F5A5C2] w-full absolute top-0 left-0" aria-hidden />

      {/* Container principal */}
      <div className="relative flex flex-col items-center pt-6 pb-3">
        {/* Avatar circular — foto do perfil ou ilustração */}
        <div className="relative z-10 mb-3">
          <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-gray-800 bg-white">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={`Foto de perfil de ${displayName}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <svg
                width="96"
                height="96"
                viewBox="0 0 96 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full"
                aria-hidden
              >
                <rect width="96" height="60" fill="#87CEEB" />
                <ellipse cx="30" cy="25" rx="12" ry="8" fill="white" opacity="0.9" />
                <path d="M0 60 L30 50 L60 60 L96 55 L96 96 L0 96 Z" fill="#90EE90" />
                <path d="M40 60 L60 55 L80 60 L96 58 L96 96 L40 96 Z" fill="#7CCD7C" />
              </svg>
            )}
          </div>
        </div>

        <div className="relative z-10 w-[90%] max-w-[300px] rounded-2xl bg-[#F5A5C2] px-4 py-3 shadow-sm">
          <p className="text-center text-[15px] font-bold leading-snug text-gray-900">
            {sellerNoun}{' '}
            <span className="font-extrabold">{firstName}</span>
            <span className="font-semibold text-gray-800"> · </span>
            <span className="inline-block rounded-lg bg-[#50E3C2] px-2 py-0.5 text-xs font-bold text-white">
              {statusLabel}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
