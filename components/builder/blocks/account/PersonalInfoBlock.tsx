'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';
import { withGuardian } from '@/components/guardian/GuardianBeacon';

function PersonalInfoBlockBase({ config, onAction }: BlockComponentProps): React.JSX.Element {
  
  // Dados simulados baseados na imagem. Em produção, viriam do config.data ou de um Hook de estado global.
  const userInformation = {
    fullName: "Bruno Aurélio Rosa Pereira",
    firstName: "Bruno",
    email: "brunoacre07@gmail.com",
    phone: "55 11 94747-2345",
    address: "Rua do pobretão, numero 001, São Paulo, Brasil, Bairro, Brás",
    document: "45.1515.22626.626",
    profilePictureUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop", // Placeholder
    backgroundImageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=720&auto=format&fit=crop" // Placeholder
  };

  const handleEditAction = (field: string) => {
    onAction?.('EDIT_FIELD', { field, blockId: config.id });
  };

  const handleChangeImageAction = (imageType: 'PROFILE' | 'BACKGROUND') => {
    onAction?.('CHANGE_IMAGE', { imageType, blockId: config.id });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto bg-white min-h-screen flex flex-col pb-24"
    >
      {/* Header com Imagens (Fundo e Perfil) */}
      <div className="relative w-full h-64 bg-gray-200 mb-20">
        {/* Imagem de Fundo */}
        <img 
          src={userInformation.backgroundImageUrl} 
          alt="Fundo da Loja" 
          className="w-full h-full object-cover"
        />
        
        {/* Botão Trocar Fundo */}
        <button 
          onClick={() => handleChangeImageAction('BACKGROUND')}
          className="absolute top-4 right-4 bg-white text-black font-bold text-sm px-4 py-1.5 border-2 border-black rounded-md shadow-sm hover:bg-gray-50 transition-colors"
        >
          Trocar
        </button>

        {/* Botão Trocar Perfil (Posicionado à direita da foto de perfil) */}
        <button 
          onClick={() => handleChangeImageAction('PROFILE')}
          className="absolute bottom-4 right-4 bg-white text-black font-bold text-sm px-4 py-1.5 border-2 border-black rounded-md shadow-sm hover:bg-gray-50 transition-colors z-10"
        >
          Trocar
        </button>

        {/* Foto de Perfil Centralizada */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-36 h-36 rounded-full border-4 border-[#e85d04] overflow-hidden bg-white shadow-lg">
            <img 
              src={userInformation.profilePictureUrl} 
              alt="Foto de Perfil" 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Badge com o Primeiro Nome */}
          <div className="mt-[-16px] bg-white border-2 border-black rounded-full px-6 py-1 shadow-sm z-10">
            <span className="text-xl font-extrabold text-black tracking-tight">
              {userInformation.firstName}
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Informações Pessoais */}
      <div className="flex flex-col px-6 gap-8">
        
        {/* Nome Completo */}
        <div className="flex items-start gap-4">
          <User className="w-7 h-7 text-black mt-1 flex-shrink-0" strokeWidth={2.5} />
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center w-full">
              <span className="text-base font-bold text-gray-400">Nome completo</span>
              <button onClick={() => handleEditAction('name')} className="bg-white text-black font-bold text-xs px-3 py-1 border-2 border-black rounded-md hover:bg-gray-50 transition-colors">
                Editar
              </button>
            </div>
            <span className="text-lg font-extrabold text-black mt-1 leading-tight">
              {userInformation.fullName}
            </span>
          </div>
        </div>

        {/* Gmail */}
        <div className="flex items-start gap-4">
          <Mail className="w-7 h-7 text-black mt-1 flex-shrink-0" strokeWidth={2.5} />
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center w-full">
              <span className="text-base font-bold text-gray-400">Gmail</span>
              <button onClick={() => handleEditAction('email')} className="bg-white text-black font-bold text-xs px-3 py-1 border-2 border-black rounded-md hover:bg-gray-50 transition-colors">
                Editar
              </button>
            </div>
            <span className="text-lg font-extrabold text-black mt-1 leading-tight">
              {userInformation.email}
            </span>
          </div>
        </div>

        {/* Numero de telefone */}
        <div className="flex items-start gap-4">
          <Phone className="w-7 h-7 text-black mt-1 flex-shrink-0" strokeWidth={2.5} />
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center w-full">
              <span className="text-base font-bold text-gray-400">Numero de telefone</span>
              <button onClick={() => handleEditAction('phone')} className="bg-white text-black font-bold text-xs px-3 py-1 border-2 border-black rounded-md hover:bg-gray-50 transition-colors">
                Editar
              </button>
            </div>
            <span className="text-lg font-extrabold text-black mt-1 leading-tight">
              {userInformation.phone}
            </span>
            <button onClick={() => handleEditAction('add_phone')} className="text-sm font-bold text-black mt-2 text-left hover:underline">
              Adicionar Numero de telefone +
            </button>
          </div>
        </div>

        {/* Endereço da loja */}
        <div className="flex items-start gap-4">
          <MapPin className="w-7 h-7 text-black mt-1 flex-shrink-0" strokeWidth={2.5} />
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center w-full">
              <span className="text-base font-bold text-gray-400">Endereço da loja</span>
              <button onClick={() => handleEditAction('address')} className="bg-white text-black font-bold text-xs px-3 py-1 border-2 border-black rounded-md hover:bg-gray-50 transition-colors">
                Editar
              </button>
            </div>
            <span className="text-lg font-extrabold text-black mt-1 leading-tight pr-4">
              {userInformation.address}
            </span>
            <button onClick={() => handleEditAction('add_address')} className="text-sm font-bold text-black mt-2 text-left hover:underline">
              Adicionar Endereço +
            </button>
          </div>
        </div>

        {/* MEI/CNPJ */}
        <div className="flex items-start gap-4">
          <Briefcase className="w-7 h-7 text-black mt-1 flex-shrink-0" strokeWidth={2.5} />
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center w-full">
              <span className="text-base font-bold text-gray-400">MEI/CNPJ</span>
              <button onClick={() => handleEditAction('document')} className="bg-white text-black font-bold text-xs px-3 py-1 border-2 border-black rounded-md hover:bg-gray-50 transition-colors">
                Editar
              </button>
            </div>
            <span className="text-lg font-extrabold text-black mt-1 leading-tight">
              {userInformation.document}
            </span>
            <button onClick={() => handleEditAction('add_document')} className="text-sm font-bold text-black mt-2 text-left hover:underline">
              Adicionar CNPJ/MEI +
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export const PersonalInfoBlock = withGuardian(
  PersonalInfoBlockBase,
  "components/builder/blocks/account/PersonalInfoBlock.tsx",
  "UI_COMPONENT",
  {
    label: "Informações Pessoais",
    description: "Tela de exibição e edição de informações pessoais do usuário.",
    tags: ["Account", "Profile", "Information"]
  }
);