import React from "react";
import {
  Box,
  Layout,
  Zap,
  Code,
  Database,
  FileJson,
  Braces,
  Wrench,
  Image as ImageIcon,
  FileText,
  Palette,
  Settings,
  FileCode
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectFile } from "@/schemas/guardian-schema";

export const FileRow = React.memo(function FileRow({ file }: { file: ProjectFile }) {
  const getIcon = () => {
    // Ícones maiores para mobile (18px) e menores para desktop (16px)
    // Usa classes Tailwind para tamanho responsivo
    const iconClass = "w-[18px] h-[18px] sm:w-4 sm:h-4";
    
    switch (file.type) {
      case "COMPONENT": return <Box className={cn(iconClass, "text-blue-400")} />;
      case "PAGE": return <Layout className={cn(iconClass, "text-purple-400")} />;
      case "ACTION": return <Zap className={cn(iconClass, "text-amber-400")} />;
      case "HOOK": return <Code className={cn(iconClass, "text-emerald-400")} />;
      case "PRISMA": return <Database className={cn(iconClass, "text-cyan-400")} />;
      case "SCHEMA": return <FileJson className={cn(iconClass, "text-pink-400")} />;
      case "TYPE": return <Braces className={cn(iconClass, "text-orange-400")} />;
      case "UTIL": return <Wrench className={cn(iconClass, "text-slate-400")} />;
      case "ASSET": return <ImageIcon className={cn(iconClass, "text-teal-400")} />;
      case "MARKDOWN": return <FileText className={cn(iconClass, "text-gray-400")} />;
      case "STYLE": return <Palette className={cn(iconClass, "text-pink-300")} />;
      case "CONFIG": return <Settings className={cn(iconClass, "text-yellow-200")} />;
      default: return <FileCode className={cn(iconClass, "text-zinc-500")} />;
    }
  };

  const getBadgeColor = () => {
    switch (file.type) {
      case "COMPONENT": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "PAGE": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "ACTION": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "HOOK": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "TYPE": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "UTIL": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      case "ASSET": return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      case "MARKDOWN": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      case "STYLE": return "bg-pink-500/10 text-pink-400 border-pink-500/20";
      case "CONFIG": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default: return "bg-zinc-800 text-zinc-500 border-zinc-700";
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors group gap-3">
      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
        <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-lg bg-black/40 flex items-center justify-center shrink-0 border border-zinc-800 shadow-lg">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <p className="text-sm sm:text-xs font-bold text-zinc-200 group-hover:text-white transition-colors break-words">
            {file.name}
          </p>
          <div className="flex items-start gap-2">
            <FileCode className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm sm:text-xs text-zinc-300 font-mono break-all leading-relaxed">
              {file.path}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/50 rounded-md border border-zinc-700/50">
          <Database className="w-4 h-4 text-cyan-400" />
          <span className="text-xs sm:text-[10px] text-zinc-300 font-mono font-semibold">
            {(file.size / 1024).toFixed(1)} KB
          </span>
        </div>
        <span
          className={cn(
            "text-xs sm:text-[10px] font-bold px-2 py-1 rounded border uppercase text-center",
            getBadgeColor()
          )}
        >
          {file.type}
        </span>
      </div>
    </div>
  );
});