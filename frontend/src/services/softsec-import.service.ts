import { apiFetch } from '@/lib/api-client';

export type GradeImportKind = 'SUPERVISOR' | 'REVIEWER' | 'COUNCIL';
export type ImportBody = { csvBase64: string; kind: GradeImportKind; projectMappings: Record<string, string> };
export type GradePreviewRow = {
  row: number; student_id: string; project_id: string; score: number;
  status: string; message: string; registrationId?: string; nameMatch?: boolean;
};
export type GradePreview = {
  count: number; checksum: string; kind: GradeImportKind; canConfirm: boolean;
  previewToken: string | null; rows: GradePreviewRow[]; councilPolicy: string;
};
export const previewGrades = (body: ImportBody) => apiFetch<GradePreview>('/api/softsec-import/preview', {
  method: 'POST', body: JSON.stringify(body),
});
export const confirmGrades = (body: ImportBody & { previewToken: string }) =>
  apiFetch<{ imported: number; kind: GradeImportKind; checksum: string }>('/api/softsec-import/confirm', {
    method: 'POST', body: JSON.stringify(body),
  });
