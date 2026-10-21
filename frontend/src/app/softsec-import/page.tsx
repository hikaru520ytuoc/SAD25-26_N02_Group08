'use client';

import { useState } from 'react';
import { confirmGrades, previewGrades, type GradeImportKind, type GradePreview, type ImportBody } from '@/services/softsec-import.service';

async function asBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength > 512 * 101) throw new Error('File CSV vượt giới hạn 51.712 byte');
  let binary = '';
  for (let i = 0; i < bytes.length; i += 4096) binary += String.fromCharCode(...bytes.subarray(i, i + 4096));
  return btoa(binary);
}

export default function SecureGradeCsvImport() {
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<GradeImportKind>('SUPERVISOR');
  const [mappingsText, setMappingsText] = useState('{}');
  const [body, setBody] = useState<ImportBody | null>(null);
  const [preview, setPreview] = useState<GradePreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  async function loadPreview() {
    if (!file) { setMessage('Hãy chọn tệp CSV trước.'); return; }
    setLoading(true); setPreview(null); setMessage(''); setSuccess(false);
    try {
      const parsed = JSON.parse(mappingsText) as Record<string, string>;
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error('Mapping phải là JSON object');
      const payload: ImportBody = { csvBase64: await asBase64(file), kind, projectMappings: parsed };
      const response = await previewGrades(payload);
      setBody(payload); setPreview(response);
      setMessage(response.canConfirm ? 'CSV hợp lệ và đủ điều kiện nhập đầu điểm đã chọn.' : 'Đã phân tích: cần xử lý các dòng chưa đủ điều kiện trước khi xác nhận.');
    } catch (e) {setMessage(e instanceof Error ? e.message : 'Không thể kiểm tra CSV');}
    finally {setLoading(false);}
  }

  async function confirm() {
    if (!preview?.canConfirm || !preview.previewToken || !body) return;
    if (!window.confirm(`Xác nhận nhập ${preview.count} bản ghi điểm ${body.kind}? Thao tác sẽ ghi dữ liệu theo một transaction.`)) return;
    setLoading(true);setSuccess(false);setMessage('');
    try {
      const res=await confirmGrades({...body,previewToken:preview.previewToken});
      setSuccess(true);setMessage(`Đã nhập ${res.imported} điểm ${res.kind} thành công. Mã SHA-256: ${res.checksum}`);
      setPreview(null);
    } catch(e) {setMessage(e instanceof Error?e.message:'Không thể xác nhận nhập');}
    finally {setLoading(false);}
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Nhập điểm CSV an toàn — An toàn phần mềm</h1>
        <p className="mt-2 text-sm text-slate-600">Mã C độc lập kiểm tra đúng 6 trường, giới hạn bộ đệm và 100 bản ghi. Bước xem trước hoàn toàn không ghi cơ sở dữ liệu.</p>
      </header>

      <section className="grid gap-4 rounded-xl border bg-white p-6 shadow-sm md:grid-cols-2">
        <label className="block text-sm font-medium">Tệp CSV (UTF-8, tối đa 100 bản ghi)
          <input type="file" accept=".csv,text/csv" className="mt-2 block w-full rounded border p-3" onChange={e=>{setFile(e.target.files?.[0]??null);setPreview(null);}} />
        </label>
        <label className="block text-sm font-medium">Loại điểm cần xử lý
          <select className="mt-2 block w-full rounded border p-3" value={kind} onChange={e=>{setKind(e.target.value as GradeImportKind);setPreview(null);}}>
            <option value="SUPERVISOR">Điểm giảng viên hướng dẫn</option>
            <option value="REVIEWER">Điểm giảng viên phản biện</option>
            <option value="COUNCIL">Điểm hội đồng — chỉ xem trước</option>
          </select>
        </label>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Ánh xạ mã đồ án CSV → Topic UUID có thật trong database</label>
          <p className="mb-2 text-xs text-slate-500">Ví dụ: {`{"DA001":"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"}`}. Không tự đoán UUID. Nếu chưa có mapping, bạn vẫn có thể xem lỗi CSV và trạng thái đối chiếu.</p>
          <textarea rows={4} value={mappingsText} onChange={e=>{setMappingsText(e.target.value);setPreview(null);}} className="w-full rounded border p-3 font-mono text-xs" spellCheck={false}/>
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-3">
          <button disabled={loading||!file} onClick={loadPreview} className="rounded bg-blue-700 px-5 py-2 font-semibold text-white disabled:opacity-50">{loading?'Đang xử lý…':'Kiểm tra và xem trước'}</button>
          {preview?.canConfirm&&<button disabled={loading} onClick={confirm} className="rounded bg-green-700 px-5 py-2 font-semibold text-white disabled:opacity-50">Xác nhận ghi điểm theo quyền</button>}
        </div>
        {message&&<p role="status" className={`md:col-span-2 rounded p-3 text-sm ${success?'bg-green-50 text-green-800':'bg-amber-50 text-amber-900'}`}>{message}</p>}
      </section>
      {preview&&<section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">Kết quả phân tích {preview.count} dòng</h2>
          <span className="text-xs text-slate-600">Loại điểm: {preview.kind} — {preview.canConfirm?'Có thể xác nhận':'Chưa được xác nhận'}</span></div>
        <p className="mb-4 break-all font-mono text-xs text-slate-500">SHA-256: {preview.checksum}</p>
        {preview.kind==='COUNCIL'&&<p className="mb-3 rounded bg-red-50 p-3 text-sm text-red-800">Không cho phép ghi council_score. Điểm hội đồng được lưu theo từng thành viên; CSV sáu cột không cung cấp danh tính người chấm.</p>}
        <div className="overflow-x-auto"><table className="min-w-full border-collapse text-left text-sm"><thead className="bg-slate-100"><tr>{['Dòng','Mã SV','Mã đồ án','Điểm','Trạng thái','Chi tiết'].map(x=><th className="border-b p-2" key={x}>{x}</th>)}</tr></thead>
          <tbody>{preview.rows.map(r=><tr key={r.row}><td className="border-b p-2">{r.row}</td><td className="border-b p-2">{r.student_id}</td><td className="border-b p-2">{r.project_id}</td><td className="border-b p-2">{r.score}</td><td className="border-b p-2 font-mono text-xs">{r.status}</td><td className="border-b p-2">{r.message}{r.nameMatch===false&&' (Cảnh báo: tên khác hồ sơ DB)'}</td></tr>)}</tbody>
        </table></div>
      </section>}
    </main>
  );
}
