import { getAccessToken } from '@/lib/auth-storage';
import { ApiClientError, apiFetch } from '@/lib/api-client';
import type { FileDocument, FileDocumentType } from '@/types/sprint4';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export type FileAccessMode = 'preview' | 'download';
export type FileAccessUrl = { url: string; expiresAt: string; mode: FileAccessMode };

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
  if (!response.ok) throw new ApiClientError(response.status, payload?.errorCode ?? 'FILE_UPLOAD_FAILED', payload?.message ?? 'Upload file thất bại');
  return payload.data as FileDocument;
}

export function getFileAccessUrl(fileId: string, mode: FileAccessMode) {
  return apiFetch<FileAccessUrl>(`/api/files/${fileId}/access-url?mode=${mode}`);
}

export async function getFileBlob(fileId: string) {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/download`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  const payload = response.headers.get('content-type')?.includes('application/json') ? await response.json().catch(() => null) : null;
  if (!response.ok) throw new ApiClientError(response.status, payload?.errorCode ?? 'FILE_DOWNLOAD_FAILED', payload?.message ?? 'Không thể tải file');
  return response.blob();
}

export function getFileErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.statusCode === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    if (error.statusCode === 403) return 'Bạn không có quyền xem file này.';
    if (error.statusCode === 404) return 'File không còn tồn tại.';
    if (error.statusCode === 410) return 'Liên kết đã hết hạn. Hệ thống sẽ tạo lại liên kết.';
    if (error.statusCode >= 500) return 'Không thể mở file. Vui lòng thử lại.';
    return error.message;
  }
  return error instanceof Error ? error.message : 'Không thể mở file. Vui lòng thử lại.';
}

export function getMyFiles() {
  return apiFetch<FileDocument[]>('/api/files');
}
