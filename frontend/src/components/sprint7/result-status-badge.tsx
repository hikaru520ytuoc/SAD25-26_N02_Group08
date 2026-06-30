import { StatusBadge } from '@/components/common/status-badge';

export function ResultStatusBadge({ status }: { status: string }) {
  return <StatusBadge value={status} />;
}
