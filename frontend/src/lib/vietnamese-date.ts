export function parseVietnameseDate(value: string): Date | null {
  const normalized = value.trim();
  if (!normalized) return null;
  let year: number;
  let month: number;
  let day: number;
  const isoMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const localMatch = normalized.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (isoMatch) {
    year = Number(isoMatch[1]); month = Number(isoMatch[2]); day = Number(isoMatch[3]);
  } else if (localMatch) {
    day = Number(localMatch[1]); month = Number(localMatch[2]); year = Number(localMatch[3]);
  } else return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

export function toVietnameseDate(value?: string | Date | null) {
  if (!value) return '';
  const date = value instanceof Date ? value : parseVietnameseDate(value) ?? new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export function toIsoDate(value: string) {
  const date = parseVietnameseDate(value);
  if (!date) return '';
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}
