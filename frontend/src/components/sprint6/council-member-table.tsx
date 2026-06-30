import { StatusBadge } from '@/components/common/status-badge';
import type { CouncilMember } from '@/types/sprint6';

const roleLabel: Record<string, string> = {
  CHAIR: 'Chủ tịch',
  SECRETARY: 'Thư ký',
  MEMBER: 'Thành viên',
};

export function CouncilMemberTable({ members = [] }: { members?: CouncilMember[] }) {
  const hasChair = members.some((member) => member.roleInCouncil === 'CHAIR');
  const hasSecretary = members.some((member) => member.roleInCouncil === 'SECRETARY');

  if (!members.length) return <p className="text-sm text-slate-500">Chưa có thành viên hội đồng.</p>;
  return (
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${hasChair && hasSecretary ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>
          {hasChair && hasSecretary ? 'Đủ cấu hình chủ tịch/thư ký' : 'Thiếu chủ tịch hoặc thư ký'}
        </span>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50"><tr><th className="p-3">Giảng viên</th><th className="p-3">Vai trò</th><th className="p-3">Mã GV</th></tr></thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-t border-slate-100">
                <td className="p-3"><p className="font-medium text-slate-900">{member.lecturer?.user?.fullName ?? member.user?.fullName ?? 'N/A'}</p><p className="text-xs text-slate-500">{member.lecturer?.user?.email ?? member.user?.email}</p></td>
                <td className="p-3"><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">{roleLabel[member.roleInCouncil] ?? member.roleInCouncil}</span></td>
                <td className="p-3 text-xs text-slate-500">{member.lecturer?.lecturerCode ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
