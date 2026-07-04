import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { ToastProvider } from '@/components/providers/toast-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hệ thống quản lý đồ án tốt nghiệp',
  description: 'Graduation Project Management System',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <ToastProvider><AppShell>{children}</AppShell></ToastProvider>
      </body>
    </html>
  );
}
