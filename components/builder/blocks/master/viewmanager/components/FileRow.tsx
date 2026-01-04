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
    switch (file.type) {
      case "COMPONENT": return <Box size={14} className="text-blue-400" />;
      case "PAGE": return <Layout size={14} className="text-purple-400" />;
      case "ACTION": return <Zap size={14} className="text-amber-400" />;
      case "HOOK": return <Code size={14} className="text-emerald-400" />;
      case "PRISMA": return <Database size={14} className="text-cyan-400" />;
      case "SCHEMA": return <FileJson size={14} className="text-pink-400" />;
      case "TYPE": return <Braces size={14} className="text-orange-400" />;
      case "UTIL": return <Wrench size={14} className="text-slate-400" />;
      case "ASSET": return <ImageIcon size={14} className="text-teal-400" />;
      case "MARKDOWN": return <FileText size={14} className="text-gray-400" />;
      case "STYLE": return <Palette size={14} className="text-pink-300" />;
      case "CONFIG": return <Settings size={14} className="text-yellow-200" />;
      default: return <FileCode size={14} className="text-zinc-500" />;
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
    <div className="flex items-center justify-between p-2.5 bg-zinc-900/40 border border-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors group">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center shrink-0 border border-zinc-800">
          {getIcon()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-zinc-200 truncate group-hover:text-white transition-colors">
            {file.name}
          </p>
          <p className="text-[9px] text-zinc-500 font-mono truncate">{file.path}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[9px] text-zinc-600 font-mono">
          {(file.size / 1024).toFixed(1)} KB
        </span>
        <span
          className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase w-16 text-center",
            getBadgeColor()
          )}
        >
          {file.type}
        </span>
      </div>
    </div>
  );
});