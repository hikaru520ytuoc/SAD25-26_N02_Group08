'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { DefenseScheduleForm } from '@/components/sprint6/defense-schedule-form';
import { DefenseScheduleTable } from '@/components/sprint6/defense-schedule-table';
import { createDefenseSchedule, getDefenseSchedules } from '@/services/defense-schedules.service';
import type { DefenseScheduleValues } from '@/schemas/sprint6.schema';
import type { DefenseSchedule } from '@/types/sprint6';

export default function FacultyDefenseSchedulesPage() {
  const [items, setItems] = useState<DefenseSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setItems(await getDefenseSchedules());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải lịch bảo vệ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function submit(values: DefenseScheduleValues) {
    await createDefenseSchedule(values);
    await load();
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader title="Lập lịch bảo vệ" description="Chỉ xếp lịch cho hồ sơ đã sẵn sàng. Backend kiểm tra hội đồng tối đa 6 đề tài, trùng phòng, trùng hội đồng và trùng thành viên hội đồng." />
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          Nếu một giảng viên nằm ở hai hội đồng, hệ thống sẽ chặn lịch mới khi khoảng thời gian bị giao nhau theo điều kiện: newStartTime &lt; existingEndTime và newEndTime &gt; existingStartTime.
        </div>
        <DefenseScheduleForm onSubmit={submit} />
        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}
        <DefenseScheduleTable schedules={items} />
      </div>
    </>
  );
}
