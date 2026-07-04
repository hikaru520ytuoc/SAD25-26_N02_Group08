'use client';

import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ToastTone = 'success' | 'error' | 'info';
type ToastInput = { title: string; description?: string; tone?: ToastTone };
type ToastItem = ToastInput & { id: number };

type ToastContextValue = {
  showToast: (input: ToastInput) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((input: ToastInput) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setItems((current) => [...current.slice(-3), { ...input, id, tone: input.tone ?? 'info' }]);
    window.setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const value = useMemo<ToastContextValue>(() => ({
    showToast,
    success: (title, description) => showToast({ title, description, tone: 'success' }),
    error: (title, description) => showToast({ title, description, tone: 'error' }),
    info: (title, description) => showToast({ title, description, tone: 'info' }),
  }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-3 sm:left-auto sm:w-[420px]">
        {items.map((item) => {
          const Icon = item.tone === 'success' ? CheckCircle2 : item.tone === 'error' ? CircleAlert : Info;
          return (
            <div
              key={item.id}
              role="status"
              className={cn(
                'pointer-events-auto flex w-full gap-3 rounded-2xl border bg-white p-4 shadow-xl shadow-slate-900/10',
                item.tone === 'success' && 'border-emerald-200',
                item.tone === 'error' && 'border-rose-200',
                item.tone === 'info' && 'border-blue-200',
              )}
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', item.tone === 'success' && 'text-emerald-600', item.tone === 'error' && 'text-rose-600', item.tone === 'info' && 'text-blue-600')} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-950">{item.title}</p>
                {item.description && <p className="mt-1 text-sm leading-5 text-slate-600">{item.description}</p>}
              </div>
              <button type="button" onClick={() => dismiss(item.id)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Đóng thông báo">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
