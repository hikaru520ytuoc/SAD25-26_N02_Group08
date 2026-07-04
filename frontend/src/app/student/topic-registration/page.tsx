'use client';

import { BookOpenCheck, Lightbulb, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ConfirmActionModal } from '@/components/common/confirm-action-modal';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { ProposeNewTopicForm } from '@/components/sprint3/propose-new-topic-form';
import { RegisterExistingTopicForm } from '@/components/sprint3/register-existing-topic-form';
import { StudentRegistrationStatusCard } from '@/components/sprint3/student-registration-status-card';
import { useToast } from '@/components/providers/toast-provider';
import { getAvailableProjectPeriods, type ProjectPeriodRegistration } from '@/services/project-period-registrations.service';
import { getPublishedTopics } from '@/services/topics.service';
import { cancelTopicRegistration, getMyTopicRegistrations, listSupervisorOptions, proposeNewTopic, registerExistingTopic } from '@/services/topic-registrations.service';
import type { Topic } from '@/types/sprint2';
import type { LecturerOption, TopicRegistration } from '@/types/sprint3';

type RegistrationMode = 'existing' | 'proposal';
type ConfirmState = { type: 'register'; topic: Topic } | { type: 'cancel'; registration: TopicRegistration } | null;

export default function StudentTopicRegistrationPage() {
  const toast = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [registrations, setRegistrations] = useState<TopicRegistration[]>([]);
  const [supervisors, setSupervisors] = useState<LecturerOption[]>([]);
  const [periodRegistration, setPeriodRegistration] = useState<ProjectPeriodRegistration | null>(null);
  const [mode, setMode] = useState<RegistrationMode>('existing');
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRegistration = useMemo(
    () => registrations.find((item) => !['CANCELLED', 'FACULTY_REJECTED'].includes(item.status)),
    [registrations],
  );

  async function loadData(showLoading = true) {
    try {
      if (showLoading) setLoading(true);
      const periodData = await getAvailableProjectPeriods();
      setPeriodRegistration(periodData.activeRegistration ?? null);

      if (!periodData.activeRegistration) {
        setTopics([]);
        setRegistrations(await getMyTopicRegistrations());
        setSupervisors([]);
        setError(null);
        return;
      }

      const [published, myRegs, supervisorOptions] = await Promise.all([
        getPublishedTopics(),
        getMyTopicRegistrations(),
        listSupervisorOptions(),
      ]);
      setTopics(published);
      setRegistrations(myRegs);
      setSupervisors(supervisorOptions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu đăng ký đề tài.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => { void loadData(); }, []);

  async function confirmAction() {
    if (!confirmState || saving) return;
    setSaving(true);
    try {
      if (confirmState.type === 'register') {
        const created = await registerExistingTopic({ topicId: confirmState.topic.id });
        setRegistrations((current) => [created, ...current]);
        toast.success('Đăng ký đề tài thành công', 'Hồ sơ đã được gửi vào luồng xử lý tương ứng.');
      } else {
        const updated = await cancelTopicRegistration(confirmState.registration.id);
        setRegistrations((current) => current.map((item) => item.id === updated.id ? updated : item));
        toast.success('Đã hủy đăng ký', 'Bạn có thể chọn hoặc đề xuất một đề tài khác.');
      }
      setConfirmState(null);
      await loadData(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể thực hiện thao tác.';
      toast.error('Thao tác không thành công', message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePropose(input: Parameters<typeof proposeNewTopic>[0]) {
    if (saving) return;
    setSaving(true);
    try {
      const created = await proposeNewTopic(input);
      setRegistrations((current) => [created, ...current]);
      toast.success('Đã gửi đề xuất đề tài', 'Bạn không thể tạo đăng ký thứ hai khi hồ sơ này còn hoạt động.');
      await loadData(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể gửi đề xuất đề tài.';
      toast.error('Gửi đề xuất không thành công', message);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Đăng ký đề tài" description="Chọn một đề tài đã công bố hoặc đề xuất đề tài mới trong đợt đồ án bạn đang tham gia." />

      {error && <ErrorState message={error} />}
      {loading ? <LoadingSkeleton rows={4} /> : !periodRegistration ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-xl font-bold text-amber-950">Bạn chưa đăng ký đợt đồ án</h2>
          <p className="mt-2 text-sm leading-6 text-amber-800">Hãy kiểm tra điều kiện và chọn một đợt đang mở trước khi đăng ký đề tài.</p>
          <Link href="/student/project-period-registration" className="mt-4 inline-flex rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white">Đến trang đăng ký đợt</Link>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
            Đợt đang tham gia: <strong>{periodRegistration.projectPeriod.name}</strong> · {periodRegistration.projectPeriod.semester} · {periodRegistration.projectPeriod.academicYear}
          </div>

          <StudentRegistrationStatusCard registrations={registrations} onCancel={(registration) => setConfirmState({ type: 'cancel', registration })} loading={saving} />

          {!activeRegistration && (
            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-2 shadow-sm">
              <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Hình thức đăng ký đề tài">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'existing'}
                  onClick={() => setMode('existing')}
                  className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold transition ${mode === 'existing' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-white/70'}`}
                >
                  <BookOpenCheck className="h-4 w-4" /> Đề tài có sẵn
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'proposal'}
                  onClick={() => setMode('proposal')}
                  className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold transition ${mode === 'proposal' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-white/70'}`}
                >
                  <Lightbulb className="h-4 w-4" /> Đề xuất đề tài mới
                </button>
              </div>
            </section>
          )}

          {!activeRegistration && mode === 'existing' && (
            <RegisterExistingTopicForm topics={topics} onRegister={async (topic) => setConfirmState({ type: 'register', topic })} loading={saving} />
          )}
          {!activeRegistration && mode === 'proposal' && (
            <ProposeNewTopicForm supervisors={supervisors} onSubmit={handlePropose} loading={saving} />
          )}
          {activeRegistration && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Bạn đã có một đăng ký đang hoạt động. Hai lựa chọn đăng ký mới được khóa cho đến khi hồ sơ hiện tại kết thúc hoặc được hủy hợp lệ.
            </div>
          )}
        </>
      )}

      <ConfirmActionModal
        open={Boolean(confirmState)}
        onClose={() => !saving && setConfirmState(null)}
        onConfirm={confirmAction}
        loading={saving}
        title={confirmState?.type === 'cancel' ? 'Xác nhận hủy đăng ký' : 'Xác nhận đăng ký đề tài'}
        confirmLabel={confirmState?.type === 'cancel' ? 'Hủy đăng ký' : 'Đăng ký'}
        processingLabel="Đang xử lý..."
        tone={confirmState?.type === 'cancel' ? 'danger' : 'primary'}
        description={confirmState?.type === 'cancel' ? (
          <>Bạn sắp hủy đăng ký <strong>{confirmState.registration.topic?.title ?? confirmState.registration.proposedTitle}</strong>. Sau thao tác, hồ sơ này không còn được xử lý.</>
        ) : confirmState?.type === 'register' ? (
          <>Bạn sắp đăng ký đề tài <strong>{confirmState.topic.title}</strong>. Hệ thống sẽ kiểm tra lại sức chứa trước khi ghi nhận.</>
        ) : null}
      />

      {saving && <div className="sr-only" aria-live="polite"><Loader2 className="animate-spin" />Đang xử lý</div>}
    </div>
  );
}
