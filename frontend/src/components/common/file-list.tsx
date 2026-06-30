import { FileCard, type FileCardData } from './file-card';
import { EmptyState } from './empty-state';

export function FileList({ files }: { files: FileCardData[] }) {
  if (!files.length) return <EmptyState title="Chưa có file" description="Các file đã nộp sẽ hiển thị tại đây." />;
  return <div className="space-y-3">{files.map((file, index) => <FileCard key={file.id ?? index} file={file} />)}</div>;
}
