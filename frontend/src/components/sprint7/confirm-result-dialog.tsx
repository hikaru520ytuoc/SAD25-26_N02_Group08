import type { FinalResult } from '@/types/sprint7';
export function ConfirmResultDialog({ result, onConfirm }: { result: FinalResult; onConfirm: () => void }) { return <button onClick={onConfirm} className="rounded-xl border px-3 py-2 text-sm font-semibold">Xác nhận {result.resultStatus}</button>; }
