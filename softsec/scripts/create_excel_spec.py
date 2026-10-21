from artifact_tool import Blob, SpreadsheetFile
from pathlib import Path
r=Path(__file__).resolve().parents[1]
wb=SpreadsheetFile.import_xlsx(Blob.load(str(r/'specs/Template_Software_Security_iot_gateway_spec.xlsx')))
DATA={
'ThongTin':[
 ['Truong','GiaTri'],
 ['name','thesis_grade_parser'],
 ['description','Chuong trinh C nhap diem do an tu CSV: 6 truong, 3 cot diem, toi da 100 ban ghi. Dung mot target C v0/v1 cho Kripke, static/memory, SMT/BMC va fuzzing.'],
],
'YeuCauChucNang':[
 ['ID','MoTa','DanhMuc','MucUuTien'],
 ['REQ-01','Moi ban ghi phai co 6 truong CSV dung thu tu student_id, student_name, project_id va ba dau diem.','functional','HIGH'],
 ['REQ-02','Moi dau diem phai la so huu han thuoc [0,10], khong chap nhan NaN/Inf.','functional','HIGH'],
 ['REQ-03','Khong bao gio ghi records[index] khi index >= MAX_RECORDS=100.','safety','HIGH'],
 ['REQ-04','Qua trinh nhap ket thuc SUCCESS hoac ERROR, khong co deadlock trang thai.','liveness','HIGH'],
 ['REQ-05','Khong tran bo dem sinh vien (16 byte), ten (64 byte), ma do an (16 byte).','memory','HIGH'],
 ['REQ-06','Moi lan cap phat scratch trong parse_record phai duoc free ke ca khi diem sai.','memory','HIGH'],
 ['REQ-07','Kiem tra tran uint32 truoc khi nhan so record voi sizeof(GradeRecord).','safety','HIGH'],
 ['REQ-08','Input sai bi REJECT co kiem soat; khong lam parser crash.','functional','HIGH'],
],
'YeuCauPhiChucNang':[
 ['ID','MoTa','MucUuTien'],
 ['NFR-01','Kich thuoc module C khong qua 500 dong, co 2 phien ban v0/v1.','HIGH'],
 ['NFR-02','Toi thieu 300 ca mutational fuzzing, seed co dinh 20261011.','MEDIUM'],
 ['NFR-03','Moi lan kiem chung phai co log stdout/stderr va huong dan chay lai.','HIGH'],
 ['NFR-04','Co so lieu gcov line va branch coverage cho v1 tren tap testcase.','MEDIUM'],
 ['NFR-05','Moi test bi tu choi tra exit code 2; testcase hop le tra 0.','MEDIUM'],
],
'RangBuoc':[
 ['ID','MoTa','MucUuTien'],
 ['CON-01','MAX_RECORDS=100; bat buoc index tu 0 den 99 khi ghi mang.','HIGH'],
 ['CON-02','student_id toi da 15 byte (buffer 16); student_name toi da 63 byte (buffer 64).','HIGH'],
 ['CON-03','project_id toi da 15 byte (buffer 16); MAX_LINE_BYTES=512.','HIGH'],
 ['CON-04','CSV gom dung 6 cot; parser mau khong ho tro dau phay nam trong nhay kep.','HIGH'],
 ['CON-05','supervisor_score/reviewer_score/council_score thuoc [0,10] va finite.','HIGH'],
 ['CON-06','Uint32 allocation can check count <= UINT32_MAX / sizeof(GradeRecord).','HIGH'],
 ['CON-07','Source v0 chi dung trong sandbox; tuyet doi khong goi tu backend that.','HIGH'],
],
'MoHinhTrangThai':[
 ['TrangThai','KhoiTao','Nhan','ChuyenDenCacTrangThai'],
 ['init','x','init','read_header'],
 ['read_header','', 'header','parsing, error'],
 ['parsing','', 'parsing, unchecked','validated, error, unsafe_store'],
 ['validated','', 'validated,checked','stored'],
 ['stored','', 'stored, validated,checked','parsing,success'],
 ['success','', 'success,validated,checked','success'],
 ['error','', 'error,rejected','error'],
 ['unsafe_store','', 'stored,violation,unchecked','error'],
],
'ThuocTinhAnToan':[
 ['CongThucCTL'],
 ['AG(!violation)'],
 ['AG(stored -> validated)'],
 ['AG(error -> !stored)'],
 ['EF(success)'],
 ['AG(parsing -> EF(error | success))'],
],
'LoaiTruLanNhau':[
 ['MenhDe1','MenhDe2'],
 ['validated','unchecked'],
 ['error','success'],
 ['rejected','stored'],
 ['checked','unchecked'],
 ['violation','validated'],
],
'HamSinhMa':[
 ['Ten','NgonNgu','Loai','ThamSo','KichThuocBuffer','Loi','GiaTriBiMat1','GiaTriBiMat2'],
 ['copy_student_id','c','buffer_copy','raw_student_id',16,'buffer-overflow','',''],
 ['copy_student_name','c','buffer_copy','raw_student_name',64,'buffer-overflow','',''],
 ['copy_project_id','c','buffer_copy','raw_project_id',16,'buffer-overflow','',''],
 ['alloc_grade_scratch','c','alloc_release','',108,'memory-leak','',''],
 ['count_add','c','arithmetic','a,b',1,'','',''],
],
'KiemTraSoHoc':[
 ['Ten','BienSoNguyen','DieuKien','BieuThucTran'],
 ['record_count_limit','current_records, new_records','current_records >= 0 and new_records >= 0 and current_records + new_records > 100','current_records + new_records'],
 ['student_name_length','name_bytes, terminator_bytes','name_bytes >= 0 and terminator_bytes >= 0 and name_bytes + terminator_bytes > 64','name_bytes + terminator_bytes'],
 ['student_id_length','id_bytes, terminator_bytes','id_bytes >= 0 and terminator_bytes >= 0 and id_bytes + terminator_bytes > 16','id_bytes + terminator_bytes'],
 ['grade_csv_bytes','header_bytes, record_bytes','header_bytes >= 0 and record_bytes >= 0 and header_bytes + record_bytes > 2000000000','header_bytes + record_bytes'],
 ['uint32_alloc_guard','allocated_bytes, pending_bytes','allocated_bytes >= 0 and pending_bytes >= 0 and allocated_bytes + pending_bytes > 2000000000','allocated_bytes + pending_bytes'],
],
'TestCase':[
 ['ID','YeuCauLienQuan','TieuDe','DieuKienTienQuyet','CacBuoc','KetQuaMongDoi','MucUuTien'],
 ['TC-01','REQ-01,REQ-02','Hai dong CSV hop le','tests/valid.csv','Chay build/parser_v1 tests/valid.csv\nGhi log dau ra','ACCEPT: 2 records; exit 0','HIGH'],
 ['TC-02','REQ-05,CON-02','Ten dai 120 byte','tests/long_name.csv','Chay v0 ASan\nChay v1 ASan','v0 heap-buffer-overflow; v1 REJECT exit 2','HIGH'],
 ['TC-03','REQ-03,CON-01','Dung 100 va vuot 101 ban ghi','tests/records_100.csv; tests/records_101.csv','Chay v0/v1 voi ASan\nChay Z3 kiem chung index','v0 OOB tai 100; v1 ACCEPT 100 va REJECT 101','HIGH'],
 ['TC-04','REQ-06','Ro ri tren input diem NaN','tests/invalid_score.csv','Chay v0/v1 voi LeakSanitizer','v0 leak 108 byte; v1 REJECT, khong leak trong ca thu','HIGH'],
 ['TC-05','REQ-07,CON-06','Tran phep nhan uint32','--estimate 4294967295','Chay 2 phien ban\nChay Z3','v0 wraparound, v1 REJECT; SAT/UNSAT tuong ung','HIGH'],
 ['TC-06','REQ-08,REQ-02','Diem ngoai [0,10]','tests/score_negative.csv; tests/score_above.csv','Chay v1 voi 2 input','REJECT exit 2, khong crash','HIGH'],
 ['TC-07','REQ-04,REQ-03','Kripke BMC model v0/v1','models/ mo phong','Chay scripts/check_kripke.py','v0 co witness unsafe_store; v1 khong co witness k<=10','HIGH'],
 ['TC-08','REQ-08,NFR-02','Random CSV fuzzing','seed=20261011','Chay scripts/fuzz_and_coverage.py voi 300 ca','0 unexpected_exit va 0 timeout trong mau thu','MEDIUM'],
],
}
for name, rows in DATA.items():
 s=wb.worksheets.get_item(name)
 s.get_range('A1:J45').clear({'contentsOnly':True})
 cols=max(len(x) for x in rows)
 s.get_range_by_indexes(0,0,len(rows),cols).values=[x+[None]*(cols-len(x)) for x in rows]
 hdr=s.get_range_by_indexes(0,0,1,cols)
 hdr.format={'fill':'#234067','font':{'bold':True,'color':'#FFFFFF'},'row_height':29,'wrap_text':True}
 for i in range(1,len(rows)):
  rg=s.get_range_by_indexes(i,0,1,cols)
  rg.format.wrap_text=True
  rg.format.row_height=56 if name not in ('MoHinhTrangThai','ThuocTinhAnToan','LoaiTruLanNhau') else 33
  if i%2==0:rg.format.fill='#EDF3F9'
 for c in range(cols):
  s.get_range_by_indexes(0,c,45,1).format.column_width=(68 if (name=='ThongTin' and c==1) or (name in ('YeuCauChucNang','YeuCauPhiChucNang','RangBuoc') and c==1) or (name=='TestCase' and c in [2,3,4,5]) else 25 if c>0 else 23)
 s.freeze_panes.freeze_rows(1)
output=r/'docs/Spec_thesis_grade_parser_10_sheets.xlsx'
SpreadsheetFile.export_xlsx(wb).save(str(output))
print('SAVED:',output,output.stat().st_size,'bytes')
print(wb.inspect({'kind':'sheet','include':'id,name'}).ndjson)
