import type { FinalResult } from '@/types/sprint7';
import { StudentResultCard } from './student-result-card';
export function FinalResultDetail({ result }: { result: FinalResult }) { return <StudentResultCard result={result} />; }
