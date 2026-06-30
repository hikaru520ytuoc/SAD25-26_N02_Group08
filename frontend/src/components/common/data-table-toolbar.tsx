export function DataTableToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  statuses = [],
  placeholder = 'Tìm kiếm...',
}: {
  search: string;
  onSearchChange: (value: string) => void;
  status?: string;
  onStatusChange?: (value: string) => void;
  statuses?: Array<{ value: string; label: string }>;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 bg-white p-4 md:flex-row md:items-center md:justify-between">
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-900 md:max-w-md"
      />
      {onStatusChange && (
        <select
          value={status ?? 'ALL'}
          onChange={(event) => onStatusChange(event.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-900"
        >
          <option value="ALL">Tất cả trạng thái</option>
          {statuses.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      )}
    </div>
  );
}
