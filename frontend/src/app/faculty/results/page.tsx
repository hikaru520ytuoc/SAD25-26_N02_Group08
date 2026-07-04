'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, FilePlus2, Megaphone, ShieldCheck } from 'lucide-react';
import { DefenseRegistrationSelect } from '@/components/common/selects';
import { ConfirmActionModal } from '@/components/common/confirm-action-modal';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { FilterBar } from '@/components/common/filter-bar';
import { FormModal } from '@/components/common/form-modal';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { useToast } from '@/components/providers/toast-provider';
import { confirmResult, generateResult, getResults, publishResult } from '@/services/results.service';
import type { LookupOption } from '@/services/lookups.service';
import type { FinalResult } from '@/types/sprint7';

type ConfirmDraft = { resultStatus: FinalResult['resultStatus']; revisionNote: string };

export default function FacultyResultsPage() {
  const toast = useToast();
  const [items, setItems] = useState<FinalResult[]>([]);
  const [tab, setTab] = useState<'DRAFT' | 'CONFIRMED' | 'PUBLISHED'>('DRAFT');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<FinalResult | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [defenseRegistrationId, setDefenseRegistrationId] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<LookupOption | undefined>();
  const [confirmTarget, setConfirmTarget] = useState<FinalResult | null>(null);
  const [confirmDraft, setConfirmDraft] = useState<ConfirmDraft>({ resultStatus: 'PASSED', revisionNote: '' });
  const [publishTarget, setPublishTarget] = useState<FinalResult | null>(null);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  async function load() { setLoading(true); setError(''); try { setItems(await getResults()); } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải kết quả'); } finally { setLoading(false); } }
  useEffect(() => { void load(); }, []);
  const stats = useMemo(() => ({ total: items.length, draft: items.filter((item) => item.publicationStatus === 'DRAFT').length, confirmed: items.filter((item) => item.publicationStatus === 'CONFIRMED').length, published: items.filter((item) => item.publicationStatus === 'PUBLISHED').length }), [items]);
  const visible = items.filter((item) => item.publicationStatus === tab).filter((item) => { const keyword = search.trim().toLocaleLowerCase('vi'); return !keyword || [item.student?.studentCode, item.student?.user?.fullName].some((value) => value?.toLocaleLowerCase('vi').includes(keyword)); });

  async function generate() {
    if (!defenseRegistrationId) return;
    setProcessing(true); setFormError('');
    try { const created = await generateResult(defenseRegistrationId); setItems((current) => [created, ...current.filter((item) => item.id !== created.id)]); toast.success('Đã tạo kết quả', 'Điểm tổng kết được backend tính từ điểm GVHD, GVPB và hội đồng.'); setCreateOpen(false); setDefenseRegistrationId(''); setSelectedRegistration(undefined); setTab('DRAFT'); }
    catch (err) { setFormError(err instanceof Error ? err.message : 'Không thể tạo kết quả'); }
    finally { setProcessing(false); }
  }
  function openConfirm(item: FinalResult) { setConfirmTarget(item); setConfirmDraft({ resultStatus: item.resultStatus, revisionNote: item.revisionNote ?? '' }); setFormError(''); }
  async function confirm() {
    if (!confirmTarget) return;
    if (confirmDraft.resultStatus === 'PASSED_WITH_REVISION' && !confirmDraft.revisionNote.trim()) { setFormError('Vui lòng nhập yêu cầu chỉnh sửa sau bảo vệ.'); return; }
    setProcessing(true); setFormError('');
    try { const updated = await confirmResult(confirmTarget.id, { resultStatus: confirmDraft.resultStatus, revisionRequired: confirmDraft.resultStatus === 'PASSED_WITH_REVISION', revisionNote: confirmDraft.revisionNote.trim() || undefined }); setItems((current) => current.map((item) => item.id === updated.id ? updated : item)); toast.success('Đã xác nhận kết quả'); setConfirmTarget(null); setSelected((current) => current?.id === updated.id ? updated : current); setTab('CONFIRMED'); }
    catch (err) { setFormError(err instanceof Error ? err.message : 'Không thể xác nhận kết quả'); }
    finally { setProcessing(false); }
  }
  async function publish() {
    if (!publishTarget) return;
    setProcessing(true);
    try { const updated = await publishResult(publishTarget.id); setItems((current) => current.map((item) => item.id === updated.id ? updated : item)); toast.success('Đã công bố kết quả', `${updated.student?.studentCode ?? ''} – ${updated.student?.user?.fullName ?? 'Sinh viên'}`); setPublishTarget(null); setSelected((current) => current?.id === updated.id ? updated : current); setTab('PUBLISHED'); }
    catch (err) { toast.error('Không thể công bố kết quả', err instanceof Error ? err.message : undefined); }
    finally { setProcessing(false); }
  }

  return <div className="space-y-6">
    <PageHeader title="Kết quả bảo vệ" description="Tạo kết quả từ dữ liệu điểm đã hoàn tất, xác nhận kết luận và công bố cho sinh viên theo đúng workflow." actions={<button type="button" onClick={() => setCreateOpen(true)} className="primary-button"><FilePlus2 className="mr-2 h-4 w-4" />Tạo kết quả</button>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><SummaryStatCard label="Tổng kết quả" value={stats.total} /><SummaryStatCard label="Bản nháp" value={stats.draft} icon={FilePlus2} tone="amber" onClick={() => setTab('DRAFT')} /><SummaryStatCard label="Đã xác nhận" value={stats.confirmed} icon={ShieldCheck} tone="blue" onClick={() => setTab('CONFIRMED')} /><SummaryStatCard label="Đã công bố" value={stats.published} icon={Megaphone} tone="emerald" onClick={() => setTab('PUBLISHED')} /></div>
    <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2"><button type="button" onClick={() => setTab('DRAFT')} className={tab === 'DRAFT' ? 'tab-button-active' : 'tab-button'}>Bản nháp ({stats.draft})</button><button type="button" onClick={() => setTab('CONFIRMED')} className={tab === 'CONFIRMED' ? 'tab-button-active' : 'tab-button'}>Đã xác nhận ({stats.confirmed})</button><button type="button" onClick={() => setTab('PUBLISHED')} className={tab === 'PUBLISHED' ? 'tab-button-active' : 'tab-button'}>Đã công bố ({stats.published})</button></div>
    <FilterBar search={search} onSearchChange={setSearch} placeholder="Tìm mã hoặc tên sinh viên..." resultCount={visible.length} />
    {error && <ErrorState message={error} onRetry={() => void load()} />}
    {loading ? <LoadingSkeleton rows={5} /> : visible.length === 0 ? <EmptyState title="Chưa có kết quả trong nhóm này" description="Tạo kết quả hoặc chọn trạng thái khác để xem dữ liệu." /> : <div className="grid gap-4 xl:grid-cols-2">{visible.map((item) => <article key={item.id} className="section-card"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold text-slate-950">{item.student?.studentCode ?? 'Sinh viên'} – {item.student?.user?.fullName ?? 'Chưa cập nhật'}</h2><p className="mt-1 text-sm text-slate-500">Điểm tổng kết <strong className="text-slate-900">{item.finalScore.toFixed(2)}</strong></p></div><div className="flex flex-wrap gap-2"><StatusBadge value={item.resultStatus} /><StatusBadge value={item.publicationStatus} /></div></div><div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm"><Score label="GVHD" value={item.supervisorScore} /><Score label="GVPB" value={item.reviewerScore} /><Score label="Hội đồng" value={item.councilAverageScore} /></div><div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setSelected(item)} className="secondary-button"><Eye className="mr-1.5 h-4 w-4" />Xem chi tiết</button>{item.publicationStatus === 'DRAFT' && <button type="button" onClick={() => openConfirm(item)} className="primary-button"><CheckCircle2 className="mr-1.5 h-4 w-4" />Xác nhận</button>}{item.publicationStatus === 'CONFIRMED' && <button type="button" onClick={() => setPublishTarget(item)} className="primary-button"><Megaphone className="mr-1.5 h-4 w-4" />Công bố</button>}</div></article>)}</div>}

    <DetailDrawer open={Boolean(selected)} onClose={() => !processing && setSelected(null)} title={selected ? `${selected.student?.studentCode ?? ''} – ${selected.student?.user?.fullName ?? 'Chi tiết kết quả'}` : 'Chi tiết kết quả'} description="Điểm tổng kết được tính tự động, không nhập thủ công." footer={selected?.publicationStatus === 'DRAFT' ? <div className="flex justify-end"><button type="button" onClick={() => openConfirm(selected)} className="primary-button">Xác nhận kết quả</button></div> : selected?.publicationStatus === 'CONFIRMED' ? <div className="flex justify-end"><button type="button" onClick={() => setPublishTarget(selected)} className="primary-button">Công bố kết quả</button></div> : undefined}>{selected && <div className="space-y-5"><section className="section-card"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold">Kết luận</h3><div className="flex gap-2"><StatusBadge value={selected.resultStatus} /><StatusBadge value={selected.publicationStatus} /></div></div><p className="mt-4 text-5xl font-bold text-slate-950">{selected.finalScore.toFixed(2)}</p>{selected.revisionNote && <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800"><strong>Yêu cầu chỉnh sửa:</strong> {selected.revisionNote}</div>}</section><section className="section-card"><h3 className="font-bold">Chi tiết điểm</h3><div className="mt-4 grid gap-3 sm:grid-cols-3"><Score label="Điểm GVHD" value={selected.supervisorScore} /><Score label="Điểm GVPB" value={selected.reviewerScore} /><Score label="Điểm hội đồng" value={selected.councilAverageScore} /></div><p className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">Công thức: (Điểm hội đồng × 2 + Điểm GVHD + Điểm GVPB) / 4.</p></section><section className="section-card"><h3 className="font-bold">Timeline trạng thái</h3><ol className="mt-4 space-y-3 text-sm"><Timeline done label="Tạo kết quả" /><Timeline done={['CONFIRMED', 'PUBLISHED'].includes(selected.publicationStatus)} label="Xác nhận kết quả" /><Timeline done={selected.publicationStatus === 'PUBLISHED'} label="Công bố cho sinh viên" /></ol></section></div>}</DetailDrawer>

    <FormModal open={createOpen} onClose={() => !processing && setCreateOpen(false)} title="Tạo kết quả bảo vệ" description="Chỉ các hồ sơ đã đủ điểm mới xuất hiện trong danh sách." size="lg" closeDisabled={processing}><div className="space-y-5"><DefenseRegistrationSelect status="READY_FOR_COUNCIL,APPROVED_BY_REVIEWER" value={defenseRegistrationId} onChange={(value, option) => { setDefenseRegistrationId(value); setSelectedRegistration(option); }} label="Hồ sơ đủ điều kiện" />{selectedRegistration && <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-800"><p className="font-semibold">{selectedRegistration.label}</p><p>{selectedRegistration.subLabel}</p><p className="mt-2">Backend sẽ kiểm tra đủ điểm và tính finalScore theo công thức hệ thống.</p></div>}{formError && <p className="text-sm font-medium text-rose-600">{formError}</p>}<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={processing} onClick={() => setCreateOpen(false)} className="secondary-button">Hủy</button><button type="button" disabled={processing || !defenseRegistrationId} onClick={generate} className="primary-button disabled:opacity-50">{processing ? 'Đang tạo...' : 'Tạo kết quả'}</button></div></div></FormModal>
    <FormModal open={Boolean(confirmTarget)} onClose={() => !processing && setConfirmTarget(null)} title="Xác nhận kết quả" description={confirmTarget ? `${confirmTarget.student?.studentCode ?? ''} – ${confirmTarget.student?.user?.fullName ?? ''}` : undefined} size="lg" closeDisabled={processing}><div className="space-y-5"><label className="block text-sm font-semibold">Kết luận<select value={confirmDraft.resultStatus} onChange={(event) => setConfirmDraft({ ...confirmDraft, resultStatus: event.target.value as FinalResult['resultStatus'] })} className="mt-2 field-input w-full"><option value="PASSED">Đạt</option><option value="PASSED_WITH_REVISION">Đạt, cần chỉnh sửa</option><option value="FAILED">Không đạt</option></select></label>{confirmDraft.resultStatus === 'PASSED_WITH_REVISION' && <label className="block text-sm font-semibold">Yêu cầu chỉnh sửa <span className="text-rose-600">*</span><textarea rows={5} value={confirmDraft.revisionNote} onChange={(event) => setConfirmDraft({ ...confirmDraft, revisionNote: event.target.value })} className="mt-2 field-input w-full resize-y" placeholder="Nêu rõ nội dung sinh viên phải chỉnh sửa sau bảo vệ..." /></label>}{formError && <p className="text-sm font-medium text-rose-600">{formError}</p>}<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={processing} onClick={() => setConfirmTarget(null)} className="secondary-button">Hủy</button><button type="button" disabled={processing} onClick={confirm} className="primary-button disabled:opacity-50">{processing ? 'Đang xác nhận...' : 'Xác nhận kết quả'}</button></div></div></FormModal>
    <ConfirmActionModal open={Boolean(publishTarget)} onClose={() => !processing && setPublishTarget(null)} onConfirm={publish} loading={processing} title="Công bố kết quả" confirmLabel="Công bố" description={publishTarget ? <>Kết quả của <strong>{publishTarget.student?.studentCode} – {publishTarget.student?.user?.fullName}</strong> sẽ được hiển thị cho sinh viên. Điểm tổng kết: <strong>{publishTarget.finalScore.toFixed(2)}</strong>.</> : null} />
  </div>;
}
function Score({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-bold">{value.toFixed(2)}</p></div>; }
function Timeline({ done, label }: { done: boolean; label: string }) { return <li className={`flex items-center gap-3 ${done ? 'text-emerald-700' : 'text-slate-400'}`}><span className={`h-3 w-3 rounded-full ${done ? 'bg-emerald-500' : 'bg-slate-200'}`} />{label}</li>; }
