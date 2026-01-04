import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ViewProps } from "components/builder/blocks/master/viewmanager/types";

export function AuditView({ data }: ViewProps) {
  return (
    <div className="h-full p-8 overflow-y-auto custom-scrollbar space-y-4">
      {data?.issues
        .filter((issue) => issue.layer !== "DISCOVERY" && issue.layer !== "UI_PROPORTION")
        .map((issue) => (
          <div
            key={issue.id}
            className="p-6 bg-zinc-900/80 rounded-3xl border border-zinc-800 hover:border-zinc-700 transition-all flex gap-5"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                issue.severity === "CRITICAL"
                  ? "bg-red-500/10 text-red-500"
                  : "bg-amber-500/10 text-amber-500"
              )}
            >
              <AlertCircle size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase text-zinc-500 bg-zinc-950 px-2 py-1 rounded-md">
                  {issue.layer}
                </span>
                <span className="text-[10px] font-mono text-zinc-600">{issue.file}</span>
              </div>
              <h4 className="text-zinc-200 font-bold text-sm mb-2">{issue.message}</h4>
              <p className="text-xs text-zinc-400 bg-black/20 p-3 rounded-xl border border-white/5">
                💡 {issue.suggestion}
              </p>
            </div>
          </div>
        ))}
    </div>
  );
}