import type { CouncilMember } from '@/types/sprint6';

export function CouncilMemberTable({ members = [] }: { members?: CouncilMember[] }) {
  if (!members.length) return <p className="text-sm text-slate-500">Chưa có thành viên hội đồng.</p>;
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50"><tr><th className="p-3">Giảng viên</th><th className="p-3">Vai trò</th><th className="p-3">Lecturer ID</th></tr></thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-t">
              <td className="p-3">{member.lecturer?.user?.fullName ?? member.user?.fullName ?? 'N/A'}</td>
              <td className="p-3"><span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">{member.roleInCouncil}</span></td>
              <td className="p-3 font-mono text-xs">{member.lecturerId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
