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
  overVideo = true,
}: AuthInputFieldProps): React.JSX.Element => {
  return (
    <div className="group relative w-full">
      <Icon
        size={16}
        className={twMerge(
          'absolute left-3.5 top-1/2 z-10 -translate-y-1/2 transition-colors duration-300',
          overVideo
            ? 'text-white/80 group-focus-within:text-white drop-shadow-md'
            : 'text-slate-500 group-focus-within:text-slate-900'
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
          'h-11 w-full rounded-xl pl-10 pr-3 text-xs font-bold outline-none transition-all duration-300',
          overVideo
            ? 'border border-white/20 bg-black/40 text-white caret-white placeholder:text-white/70 shadow-[0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-2xl focus:border-white/60 focus:bg-black/60 focus:ring-2 focus:ring-white/20'
            : 'border border-slate-200 bg-white/50 text-slate-900 caret-slate-900 placeholder:text-slate-400 shadow-sm backdrop-blur-md focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10'
        )}
      />
    </div>
  );
};