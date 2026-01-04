import React from "react";
import { History, FileCode } from "lucide-react";
import { ViewProps } from "components/builder/blocks/master/viewmanager/types";

export function HistoryView({ data }: ViewProps) {
  return (
    <div className="h-full p-8 overflow-y-auto custom-scrollbar">
      <h3 className="text-sm font-bold text-zinc-300 mb-6 uppercase tracking-wider flex items-center gap-2">
        <History size={16} /> Arquivos Recentes (24h)
      </h3>
      <div className="space-y-3">
        {data?.issues
          .filter((issue) => issue.layer === "DISCOVERY")
          .map((discovery) => (
            <div
              key={discovery.id}
              className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                  <FileCode size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-200">
                    {discovery.file.split("/").pop()}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono">{discovery.file}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                NEW
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}