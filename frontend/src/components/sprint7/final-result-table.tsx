import type { FinalResult } from '@/types/sprint7';
import { ResultStatusBadge } from './result-status-badge';

export function FinalResultTable({ results, onConfirm, onPublish }: { results: FinalResult[]; onConfirm: (id: string, status: FinalResult['resultStatus']) => Promise<void>; onPublish: (id: string) => Promise<void> }) {
  return (
    <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600"><tr><th className="p-4">Sinh viên</th><th className="p-4">Điểm</th><th className="p-4">Trạng thái</th><th className="p-4">Công bố</th><th className="p-4">Thao tác</th></tr></thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id} className="border-t"><td className="p-4 font-semibold">{result.student?.user?.fullName ?? result.studentId}</td><td className="p-4">{result.finalScore}</td><td className="p-4"><ResultStatusBadge status={result.resultStatus} /></td><td className="p-4">{result.publicationStatus}</td><td className="space-x-2 p-4"><button onClick={() => onConfirm(result.id, result.resultStatus)} className="rounded-lg border px-3 py-2 font-semibold">Confirm</button><button onClick={() => onPublish(result.id)} className="rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white">Publish</button></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
