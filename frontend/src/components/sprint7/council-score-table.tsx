import type { CouncilMember } from '@/types/sprint6';
import type { CouncilScore, ScoreSummary } from '@/types/sprint7';
import type { CouncilScoreValues } from '@/schemas/sprint7.schema';
import { CouncilScoreForm } from './council-score-form';
import { ScoreSummaryCard } from './score-summary-card';

export function CouncilScoreTable({ scheduleId, members, scores, summary, onSubmit }: { scheduleId: string; members: CouncilMember[]; scores: CouncilScore[]; summary: ScoreSummary | null; onSubmit: (values: CouncilScoreValues) => Promise<void> }) {
  return (
    <div className="space-y-4">
      <ScoreSummaryCard summary={summary} />
      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600"><tr><th className="p-3">Thành viên</th><th className="p-3">Vai trò</th><th className="p-3">Điểm hiện tại</th><th className="p-3">Nhập điểm</th></tr></thead>
          <tbody>
            {members.map((member) => {
              const score = scores.find((item) => item.councilMemberId === member.id);
              return <tr key={member.id} className="border-t"><td className="p-3 font-semibold">{member.lecturer?.user?.fullName ?? member.user?.fullName ?? member.lecturerId}</td><td className="p-3">{member.roleInCouncil}</td><td className="p-3">{score ? `${score.score} ${score.comment ? `- ${score.comment}` : ''}` : 'Chưa có'}</td><td className="p-3"><CouncilScoreForm defenseScheduleId={scheduleId} councilMemberId={member.id} onSubmit={onSubmit} /></td></tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
