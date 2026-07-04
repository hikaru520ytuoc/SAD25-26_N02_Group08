import { Check, Circle, Lock } from 'lucide-react';

export type WorkflowStep = { key: string; label: string; description?: string };

export function WorkflowStepper({ steps, currentIndex, locked = false }: { steps: WorkflowStep[]; currentIndex: number; locked?: boolean }) {
  return <div className="flex gap-3 overflow-x-auto pb-1">{steps.map((step, index) => { const done = locked || index < currentIndex; const active = !locked && index === currentIndex; return <div key={step.key} className="flex min-w-[140px] items-start gap-2"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ${done ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : active ? 'bg-blue-600 text-white ring-blue-600' : 'bg-slate-50 text-slate-400 ring-slate-200'}`}>{locked ? <Lock className="h-4 w-4" /> : done ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}</span><span><strong className={`block text-xs ${active ? 'text-blue-700' : done ? 'text-emerald-700' : 'text-slate-500'}`}>{step.label}</strong>{step.description && <small className="mt-1 block text-[11px] leading-4 text-slate-400">{step.description}</small>}</span></div>; })}</div>;
}
