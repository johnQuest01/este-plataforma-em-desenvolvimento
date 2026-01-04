import React from "react";

interface StatCardProps {
  label: string;
  value: number;
  icon?: React.ElementType;
}

export function StatCard({
  label,
  value,
  icon: Icon
}: StatCardProps) {
  return (
    <div className="p-6 bg-zinc-900/60 rounded-3xl border border-zinc-800 flex flex-col items-center justify-center text-center">
      <span className="text-3xl font-black text-white mb-1">{value}</span>
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
        {Icon && <Icon size={10} />} {label}
      </span>
    </div>
  );
}