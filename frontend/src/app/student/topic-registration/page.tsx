'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProposeNewTopicForm } from '@/components/sprint3/propose-new-topic-form';
import { RegisterExistingTopicForm } from '@/components/sprint3/register-existing-topic-form';
import { StudentRegistrationStatusCard } from '@/components/sprint3/student-registration-status-card';
import { getPublishedTopics } from '@/services/topics.service';
import { cancelTopicRegistration, getMyTopicRegistrations, listSupervisorOptions, proposeNewTopic, registerExistingTopic } from '@/services/topic-registrations.service';
import type { Topic } from '@/types/sprint2';
import type { LecturerOption, TopicRegistration } from '@/types/sprint3';

export default function StudentTopicRegistrationPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [registrations, setRegistrations] = useState<TopicRegistration[]>([]);
  const [supervisors, setSupervisors] = useState<LecturerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeRegistration = useMemo(
    () => registrations.find((item) => !['CANCELLED', 'FACULTY_REJECTED'].includes(item.status)),
    [registrations],
  );
  const projectPeriodId = topics[0]?.projectPeriod?.id ?? registrations[0]?.projectPeriod?.id;

  async function loadData() {
    try {
      setLoading(true);
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

  useEffect(() => { loadData(); }, []);

  async function handleRegister(topic: Topic) {
    await registerExistingTopic({ topicId: topic.id, projectPeriodId: topic.projectPeriod.id });
    await loadData();
  }

  async function handlePropose(input: Parameters<typeof proposeNewTopic>[0]) {
    await proposeNewTopic(input);
    await loadData();
  }

  async function handleCancel(id: string) {
    await cancelTopicRegistration(id);
    await loadData();
  }

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-950">Đăng ký và đề xuất đề tài</h1>
          <p className="mt-2 text-slate-600">Sinh viên chỉ được có một đăng ký active trong một đợt đồ án.</p>
        </div>
        {error && <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {loading ? <div className="rounded-3xl bg-white p-6">Đang tải...</div> : (
          <>
            <StudentRegistrationStatusCard registrations={registrations} onCancel={handleCancel} loading={loading} />
            <RegisterExistingTopicForm topics={topics} onRegister={handleRegister} loading={loading} disabled={Boolean(activeRegistration)} />
            <ProposeNewTopicForm projectPeriodId={projectPeriodId} supervisors={supervisors} onSubmit={handlePropose} loading={loading} disabled={Boolean(activeRegistration) || !projectPeriodId} />
          </>
        )}
      </div>
    </>
  );
}
