import React from 'react';
import { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface AuthInputFieldProps {
  icon: LucideIcon;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputMode?: 'text' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  /** Campos mais claros sobre vídeo a mover (login com fundo em vídeo). */
  overVideo?: boolean;
}

export const AuthInputField = ({
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  inputMode = 'text',
  overVideo = false,
}: AuthInputFieldProps): React.JSX.Element => {
  return (
    <div className="group relative">
      <Icon
        size={16}
        className={twMerge(
          'absolute left-3.5 top-1/2 z-1 -translate-y-1/2 transition-colors',
          overVideo
            ? 'text-white/80 group-focus-within:text-white'
            : 'text-slate-600 group-focus-within:text-slate-900'
        )}
      />
      <input
        required={required}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={twMerge(
          'h-11 w-full rounded-2xl pl-10 pr-3 text-sm font-bold outline-none transition-all',
          overVideo
            ? 'border border-white/40 bg-white/25 text-white caret-white placeholder:text-white/65 shadow-[0_4px_24px_rgba(0,0,0,0.25)] backdrop-blur-xl focus:border-white/70 focus:bg-white/35 focus:ring-2 focus:ring-white/30'
            : 'border border-white/55 bg-white/35 text-slate-900 caret-slate-900 placeholder:text-slate-500/90 shadow-inner shadow-black/5 backdrop-blur-xl focus:border-white/80 focus:bg-white/55 focus:ring-2 focus:ring-white/50'
        )}
      />
    </div>
  );
};
