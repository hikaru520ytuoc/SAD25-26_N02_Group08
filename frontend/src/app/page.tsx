'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, FileArchive, GraduationCap, Server } from 'lucide-react';
import { getBackendHealth, type HealthResponse } from '@/lib/api';

type HealthState = 'checking' | 'connected' | 'disconnected';

const upcomingModules = [
  'Auth, User & Role đã triển khai',
  'Đợt đồ án và sinh viên đủ điều kiện',
  'Đề tài và đăng ký đề tài',
  'Đề cương và tiến độ',
  'Bảo vệ, phản biện và chấm điểm',
  'Chỉnh sửa, lưu trữ và khóa hồ sơ',
];

export default function HomePage() {
  const [healthState, setHealthState] = useState<HealthState>('checking');
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const data = await getBackendHealth();
        setHealth(data);
        setHealthState('connected');
      } catch {
        setHealthState('disconnected');
      }
    }

    checkHealth();
  }, []);

  const badgeClass =
    healthState === 'connected'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      : healthState === 'checking'
        ? 'bg-amber-50 text-amber-700 ring-amber-200'
        : 'bg-rose-50 text-rose-700 ring-rose-200';

  return (
    <>
      <section className="flex flex-1 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 ring-1 ring-blue-100">
                <GraduationCap className="h-4 w-4" />
                Sprint 1 · Auth, User & Role
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
                Hệ thống quản lý đồ án tốt nghiệp
              </h1>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                Nền tảng xác thực, người dùng và phân quyền đã được bổ sung. Các nghiệp vụ đồ án như đăng ký đề tài, đề cương, bảo vệ và lưu trữ sẽ triển khai ở sprint sau.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/login"
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Đăng nhập hệ thống
                </a>
                <a
                  href={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'}/api/docs`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Mở Swagger API
                </a>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <Server className="h-6 w-6 text-slate-700" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Backend Health</p>
                  <p className="font-semibold text-slate-900">/api/health</p>
                </div>
              </div>

              <div className={`mt-5 rounded-full px-4 py-2 text-sm font-medium ring-1 ${badgeClass}`}>
                {healthState === 'checking' && 'Đang kiểm tra kết nối backend...'}
                {healthState === 'connected' && 'Backend connected'}
                {healthState === 'disconnected' && 'Backend disconnected'}
              </div>

              {health && (
                <div className="mt-4 space-y-2 rounded-xl bg-white p-4 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Service: {health.data.service}
                  </p>
                  <p className="flex items-center gap-2">
                    <Database className="h-4 w-4" /> Database: {health.data.database}
                  </p>
                  <p>Timestamp: {health.data.timestamp}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingModules.map((moduleName) => (
              <div key={moduleName} className="rounded-2xl border border-slate-200 p-5">
                <FileArchive className="mb-3 h-5 w-5 text-blue-600" />
                <h2 className="font-semibold text-slate-900">{moduleName}</h2>
                <p className="mt-2 text-sm text-slate-500">Sẽ triển khai trong các sprint tiếp theo.</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </>
  );
}
