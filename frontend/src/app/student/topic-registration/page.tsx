'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ProposeNewTopicForm } from '@/components/sprint3/propose-new-topic-form';
import { RegisterExistingTopicForm } from '@/components/sprint3/register-existing-topic-form';
import { StudentRegistrationStatusCard } from '@/components/sprint3/student-registration-status-card';
import { getAvailableProjectPeriods, type ProjectPeriodRegistration } from '@/services/project-period-registrations.service';
import { getPublishedTopics } from '@/services/topics.service';
import { cancelTopicRegistration, getMyTopicRegistrations, listSupervisorOptions, proposeNewTopic, registerExistingTopic } from '@/services/topic-registrations.service';
import type { Topic } from '@/types/sprint2';
import type { LecturerOption, TopicRegistration } from '@/types/sprint3';

export default function StudentTopicRegistrationPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [registrations, setRegistrations] = useState<TopicRegistration[]>([]);
  const [supervisors, setSupervisors] = useState<LecturerOption[]>([]);
  const [periodRegistration, setPeriodRegistration] = useState<ProjectPeriodRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRegistration = useMemo(
    () => registrations.find((item) => !['CANCELLED', 'FACULTY_REJECTED'].includes(item.status)),
    [registrations],
  );

  async function loadData() {
    try {
      setLoading(true);
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
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadData(); }, []);

  async function handleRegister(topic: Topic) {
    setSaving(true);
    try {
      await registerExistingTopic({ topicId: topic.id });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đăng ký đề tài.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePropose(input: Parameters<typeof proposeNewTopic>[0]) {
    setSaving(true);
    try {
      await proposeNewTopic(input);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi đề xuất đề tài.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(id: string) {
    setSaving(true);
    try {
      await cancelTopicRegistration(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể hủy đăng ký đề tài.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-950">Đăng ký và đề xuất đề tài</h1>
        <p className="mt-2 text-slate-600">Đề tài hiển thị theo đợt đồ án bạn đã chủ động đăng ký.</p>
      </div>
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {loading ? <div className="rounded-3xl bg-white p-6 text-sm text-slate-500">Đang tải...</div> : !periodRegistration ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-xl font-bold text-amber-950">Bạn chưa đăng ký đợt đồ án</h2>
          <p className="mt-2 text-sm text-amber-800">Hãy kiểm tra điều kiện và tự chọn một đợt đang mở trước khi đăng ký đề tài.</p>
          <Link href="/student/project-period-registration" className="mt-4 inline-flex rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white">Đến trang đăng ký đợt</Link>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            Đợt đang tham gia: <strong>{periodRegistration.projectPeriod.name}</strong> · {periodRegistration.projectPeriod.semester} · {periodRegistration.projectPeriod.academicYear}
          </div>
          <StudentRegistrationStatusCard registrations={registrations} onCancel={handleCancel} loading={saving} />
          <RegisterExistingTopicForm topics={topics} onRegister={handleRegister} loading={saving} disabled={Boolean(activeRegistration)} />
          <ProposeNewTopicForm supervisors={supervisors} onSubmit={handlePropose} loading={saving} disabled={Boolean(activeRegistration)} />
        </>
      )}
    </div>
  );
}
