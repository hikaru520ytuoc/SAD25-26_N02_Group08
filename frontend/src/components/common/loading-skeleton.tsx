export function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="grid gap-4" aria-label="Đang tải dữ liệu">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-4 w-1/3 rounded bg-slate-200" />
          <div className="mt-3 h-3 w-2/3 rounded bg-slate-100" />
          <div className="mt-5 flex gap-2"><div className="h-8 w-24 rounded-xl bg-slate-100" /><div className="h-8 w-28 rounded-xl bg-slate-100" /></div>
        </div>
      ))}
    </div>
  );
}
