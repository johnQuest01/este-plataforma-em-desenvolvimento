import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AuthInputFieldProps {
  icon: LucideIcon;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputMode?: "text" | "numeric" | "tel" | "search" | "email" | "url";
}

export const AuthInputField = ({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  inputMode = "text"
}: AuthInputFieldProps) => {
  return (
    <div className="relative group">
      <Icon 
        size={18} 
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5874f6] transition-colors" 
      />
      <input
        required={required}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={twMerge(
          "w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl",
          "text-sm font-bold outline-none focus:border-[#5874f6] transition-all"
        )}
      />
    </div>
  );
};