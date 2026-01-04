import { GuardianAuditResponse, ProjectFile } from "@/schemas/guardian-schema";
import { DashboardView } from "../GuardianHeader";

export interface GuardianViewManagerProps {
  view: DashboardView;
  data: GuardianAuditResponse | null;
}

export type CodeMapFilter = 'LIVE_TRACKED' | 'ALL_SCANNED';

export interface ViewProps {
  data: GuardianAuditResponse | null;
}

export interface FilesViewProps extends ViewProps {
  fileSearch: string;
  setFileSearch: (value: string) => void;
  filteredFiles: ProjectFile[];
  projectFilesCount: number;
}

export interface CodeMapViewProps extends ViewProps {
  filteredFiles: ProjectFile[];
}