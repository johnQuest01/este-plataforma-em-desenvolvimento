import React from "react";
import { FolderOpen } from "lucide-react";
import { FilesViewProps } from "components/builder/blocks/master/viewmanager/types";
import { FileRow } from "components/builder/blocks/master/viewmanager/components/FileRow";
import { ProjectFile } from "@/schemas/guardian-schema";

export function FilesView({ fileSearch, setFileSearch, filteredFiles, projectFilesCount }: FilesViewProps) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FolderOpen size={16} /> Explorador Onisciente ({projectFilesCount})
        </h3>
        <input
          type="text"
          placeholder="Filtrar por nome ou caminho..."
          value={fileSearch}
          onChange={(event) => setFileSearch(event.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 w-64 placeholder:text-zinc-600"
        />
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="grid grid-cols-1 gap-2">
          {filteredFiles.map((file: ProjectFile) => (
            <FileRow key={file.path} file={file} />
          ))}
          {filteredFiles.length === 0 && (
            <div className="text-center py-10 text-zinc-500 text-xs">
              {projectFilesCount === 0
                ? "Nenhum arquivo indexado. Verifique se o servidor está rodando."
                : "Nenhum arquivo encontrado com este filtro."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}