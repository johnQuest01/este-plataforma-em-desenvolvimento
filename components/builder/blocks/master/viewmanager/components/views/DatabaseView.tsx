import React from "react";
import { Database, Server } from "lucide-react";
import { ViewProps } from "components/builder/blocks/master/viewmanager/types";

export function DatabaseView({ data }: ViewProps) {
  return (
    <div className="h-full p-8 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Database size={16} /> Prisma Schema Map
        </h3>
        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
          Provider: {data?.screenMetadata.database.connection}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {data?.screenMetadata.database.models.map((model: string) => (
          <div
            key={model}
            className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:border-indigo-500/50 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Server size={16} />
              </div>
              <span className="text-sm font-bold text-zinc-200">{model}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] bg-zinc-950 text-zinc-500 px-2 py-1 rounded border border-zinc-800">
                Model
              </span>
              <span className="text-[10px] bg-zinc-950 text-zinc-500 px-2 py-1 rounded border border-zinc-800">
                Server Actions Ready
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}