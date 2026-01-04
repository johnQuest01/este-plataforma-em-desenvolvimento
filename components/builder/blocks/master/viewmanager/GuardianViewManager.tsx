// path: src/components/builder/blocks/master/viewmanager/GuardianViewManager.tsx
"use client";

import React, { useState, useMemo } from "react";
import { ProjectFile } from "@/schemas/guardian-schema";
import { GuardianViewManagerProps } from "./types";

// Views
import { CodeMapView } from "components/builder/blocks/master/viewmanager/components/views/CodeMapView";
import { ConnectionsView } from "components/builder/blocks/master/viewmanager/components/views/ConnectionsView";
import { FilesView } from "components/builder/blocks/master/viewmanager/components/views/FilesView";
import { ScannerView } from "components/builder/blocks/master/viewmanager/components/views/ScannerView";
import { DatabaseView } from "components/builder/blocks/master/viewmanager/components/views/DatabaseView";
import { AuditView } from "components/builder/blocks/master/viewmanager/components/views/AuditView";
import { HistoryView } from "components/builder/blocks/master/viewmanager/components/views/HistoryView";

export function GuardianViewManager({ view, data }: GuardianViewManagerProps) {
  const [fileSearch, setFileSearch] = useState("");
 
  const projectFiles = useMemo(() => data?.screenMetadata.projectStructure || [], [data]);

  const filteredFiles = useMemo(() => {
    const searchLowerCase = fileSearch.toLowerCase();
    return projectFiles.filter((file: ProjectFile) =>
      file.path.toLowerCase().includes(searchLowerCase) ||
      file.name.toLowerCase().includes(searchLowerCase)
    );
  }, [projectFiles, fileSearch]);

  // ✅ VIEW: CODE_MAP
  if (view === "CODE_MAP") {
    return <CodeMapView data={data} filteredFiles={filteredFiles} />;
  }

  // --- VIEW: CONNECTIONS (ATUALIZADO: MAPA INTELIGENTE) ---
  if (view === "CONNECTIONS") {
    return <ConnectionsView data={data} />;
  }

  // --- VIEW: FILES ---
  if (view === "FILES") {
    return (
      <FilesView
        data={data}
        fileSearch={fileSearch}
        setFileSearch={setFileSearch}
        filteredFiles={filteredFiles}
        projectFilesCount={projectFiles.length}
      />
    );
  }

  // --- VIEW: SCANNER ---
  if (view === "SCANNER") {
    return <ScannerView data={data} />;
  }

  // --- VIEW: DATABASE ---
  if (view === "DATABASE") {
    return <DatabaseView data={data} />;
  }

  // --- VIEW: AUDIT ---
  if (view === "AUDIT") {
    return <AuditView data={data} />;
  }

  // --- VIEW: HISTORY ---
  if (view === "HISTORY") {
    return <HistoryView data={data} />;
  }

  return null;
}