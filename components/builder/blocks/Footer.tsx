import React from 'react';
import { BlockConfig } from '@/types/builder';
import { ButtonsFooter } from '@/components/builder/ui/ButtonsFooter';


export const FooterBlock = ({ config }: { config: BlockConfig }) => {
  // Defesa contra dados vazios
  const items = config.data.footerItems || [];


  return (
    // Este wrapper garante que o footer fique fixo na parte inferior
    // quando renderizado fora do fluxo normal, ou no fluxo se desejado.
    // Aqui, assumimos que ele ocupará a largura total.
    <div className="w-full mt-auto">
       <ButtonsFooter items={items} style={config.style} />
    </div>
  );
};
