'use client';

import { useState } from 'react';
import { uploadFile } from '@/services/files.service';
import type { FileDocument, FileDocumentType } from '@/types/sprint4';

export function FileUpload({ fileType, onUploaded }: { fileType: FileDocumentType; onUploaded: (file: FileDocument) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxMb = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB ?? 20);
    const allowed = (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES ?? '.pdf,.doc,.docx,.ppt,.pptx,.zip').split(',').map((item) => item.trim().toLowerCase());
    const ext = file.name.includes('.') ? `.${file.name.split('.').pop()?.toLowerCase()}` : '';

    if (file.size > maxMb * 1024 * 1024) {
      setError(`File không được vượt quá ${maxMb}MB`);
      return;
    }
    if (!allowed.includes(ext)) {
      setError(`Chỉ chấp nhận: ${allowed.join(', ')}`);
      return;
    }

    try {
      setUploading(true);
      setError('');
      const uploaded = await uploadFile(file, fileType);
      setFileName(uploaded.originalName);
      onUploaded(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="file" onChange={handleChange} className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
      {uploading && <p className="text-sm text-blue-600">Đang upload...</p>}
      {fileName && <p className="text-sm text-emerald-700">Đã upload: {fileName}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
