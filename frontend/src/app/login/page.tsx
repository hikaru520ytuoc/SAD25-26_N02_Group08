import { AppShell } from '@/components/layout/app-shell';

export default function LoginPlaceholderPage() {
  return (
    <AppShell>
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/70">
          <h1 className="text-2xl font-bold text-slate-950">Login placeholder</h1>
          <p className="mt-3 text-slate-600">
            Chức năng đăng nhập sẽ được triển khai ở Sprint 1: Auth + User + Role + RBAC.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Quay lại trang chủ
          </a>
        </div>
      </div>
    </AppShell>
  );
}
