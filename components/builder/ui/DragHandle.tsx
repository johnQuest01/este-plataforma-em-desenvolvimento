import React from 'react';
import { GripVertical } from 'lucide-react';
import { DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

interface DragHandleProps {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
}

export const DragHandle = ({ attributes, listeners }: DragHandleProps) => {
  return (
    <button
      {...attributes}
      {...listeners}
      className="pointer-events-auto w-12 h-12 bg-white text-blue-600 rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing transform transition-transform hover:scale-110 active:scale-95 border border-gray-100"
      style={{ touchAction: 'none' }} // CRUCIAL: Bloqueia scroll nativo apenas no botão
      aria-label="Arrastar bloco"
      type="button"
    >
      <GripVertical size={24} />
    </button>
  );
};