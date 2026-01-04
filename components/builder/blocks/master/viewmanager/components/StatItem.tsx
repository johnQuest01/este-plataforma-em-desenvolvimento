import React from "react";

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: number;
}

export function StatItem({
  icon: Icon,
  label,
  value
}: StatItemProps) {
  return (
    <div className="bg-black/20 p-4 flex flex-col items-center justify-center border-r border-zinc-800/50 last:border-r-0 hover:bg-zinc-800/30 transition-colors">
      <Icon size={16} className="text-zinc-400 mb-2" />
      <span className="text-sm font-black text-white">{value}</span>
      <span className="text-[8px] text-zinc-600 uppercase font-bold tracking-tighter mt-1">
        {label}
      </span>
    </div>
  );
}