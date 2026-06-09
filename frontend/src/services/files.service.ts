import { getAccessToken } from '@/lib/auth-storage';
import { apiFetch } from '@/lib/api-client';
import type { FileDocument, FileDocumentType } from '@/types/sprint4';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export async function uploadFile(file: File, fileType: FileDocumentType): Promise<FileDocument> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);

  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message ?? 'Upload file thất bại');
  }

  return payload.data as FileDocument;
}

export function downloadFileUrl(fileId: string) {
  return `${API_BASE_URL}/api/files/${fileId}/download`;
}

export async function getMyFiles() {
  return apiFetch<FileDocument[]>('/api/files');
}
