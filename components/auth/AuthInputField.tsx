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
  overVideo = false,
}: AuthInputFieldProps): React.JSX.Element => {
  return (
    <div className="group relative w-full">
      <Icon
        size={18}
        className={twMerge(
          'absolute left-4 top-1/2 z-10 -translate-y-1/2 transition-colors duration-300',
          overVideo
            ? 'text-white/70 group-focus-within:text-white'
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
          'h-14 w-full rounded-2xl pl-12 pr-4 text-sm font-semibold outline-none transition-all duration-300',
          overVideo
            ? 'border border-white/20 bg-black/20 text-white caret-white placeholder:text-white/60 shadow-lg backdrop-blur-md focus:border-white/50 focus:bg-black/40 focus:ring-4 focus:ring-white/10'
            : 'border border-slate-200 bg-white/50 text-slate-900 caret-slate-900 placeholder:text-slate-400 shadow-sm backdrop-blur-md focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10'
        )}
      />
    </div>
  );
};