import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hệ thống quản lý đồ án tốt nghiệp',
  description: 'Graduation Project Management System',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
