import { StatusBadge } from '@/components/common/status-badge';

export function OutlineStatusBadge({ status }: { status?: string }) {
  return <StatusBadge value={status ?? null} />;
}
