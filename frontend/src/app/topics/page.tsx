'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { TopicTable } from '@/components/sprint2/topic-table';
import { clearAccessToken } from '@/lib/auth-storage';
import { getMe } from '@/services/auth.service';
import { getPublishedTopics } from '@/services/topics.service';
import type { Topic } from '@/types/sprint2';

export default function StudentTopicsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const me = await getMe();
      if (!me.roles.some((role) => ['STUDENT', 'ADMIN', 'FACULTY_MANAGER'].includes(role))) {
        setError('Bạn không có quyền truy cập màn hình này.');
        return;
      }
      setItems(await getPublishedTopics());
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Không thể tải danh sách đề tài.';
      if (/đăng nhập|unauthorized|401/i.test(message)) {
        clearAccessToken();
        router.push('/login');
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const availableCount = items.filter((topic) => {
    const registered = topic.topicRegistrations?.filter((item) => !['CANCELLED', 'FACULTY_REJECTED'].includes(item.status)).length
      ?? topic._count?.topicRegistrations
      ?? 0;
    return registered < topic.maxStudents;
  }).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách đề tài đã công bố"
        description="Tra cứu đề tài theo đợt, chuyên ngành và sức chứa. Mỗi đề tài có màn hình chi tiết trước khi thực hiện đăng ký."
      />

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryStatCard label="Tổng đề tài" value={items.length} hint="Đã được Khoa công bố" />
          <SummaryStatCard label="Còn vị trí" value={availableCount} hint="Có thể tiếp nhận thêm sinh viên" />
        </div>
      )}

      {loading && <LoadingSkeleton rows={6} />}
      {!loading && error && <ErrorState message={error} onRetry={() => void load()} />}
      {!loading && !error && <TopicTable topics={items} mode="student" />}
    </div>
  );
}
