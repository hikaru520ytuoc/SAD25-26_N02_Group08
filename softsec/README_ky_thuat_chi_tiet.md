# Chủ đề 5 — End-to-end Software Security: thesis_grade_parser

## Tên và phạm vi

Một chương trình C duy nhất xử lý **file CSV nhập điểm đồ án tốt nghiệp** với 6 trường: `student_id,student_name,project_id,supervisor_score,reviewer_score,council_score`. Ba đầu điểm phải là số hữu hạn trong khoảng [0, 10], tối đa 100 sinh viên/file. Không có chức năng tính điểm tổng kết. **Không kết nối backend/web hiện tại**; toàn bộ chương trình này là đối tượng kiểm chứng độc lập theo đúng Chủ đề 5.

- `src/source_original.c`: nguồn chung của chương trình.
- `src/thesis_grade_parser_v0.c`: sinh ra từ nguồn gốc, cố ý giữ lỗi C để thử nghiệm **chỉ trong sandbox**.
- `src/thesis_grade_parser_v1.c`: cùng chương trình đã vá.
- `config/spec.json` → `scripts/generate_config.py` → `src/parser_config.h` sinh **các hằng số C**, không tự sinh thuật toán parser.
- `docs/Spec_thesis_grade_parser_10_sheets.xlsx`: mẫu input Excel 10 sheet, theo tài liệu hướng dẫn Spec Verification Lab. **Chưa xác nhận chạy trong GUI Windows `SecLabFramework.exe`**. `HamSinhMa` theo loại `buffer_copy / alloc_release / arithmetic` của ứng dụng mẫu, có vai trò minh họa sinh hàm; không phải tự động sinh ra toàn bộ `thesis_grade_parser.c`.
- `docs/BaoCao_ChuDe5_ThucNghiem.pdf`: báo cáo đã đối chiếu log thật, có bản Word tương ứng.

## Chạy lại toàn bộ (Ubuntu/Linux)

Yêu cầu: Python 3, clang (sanitizer), gcc/gcov và runtime **libz3.so**. Có thể dùng `sudo apt install clang gcc libz3-4` nếu máy chưa có công cụ. Bộ kiểm tra SMT sử dụng API C thực của libz3 qua Python `ctypes`, không cần gói `z3-solver` trên PyPI.

```bash
cd ATPM_ChuDe5_ThucThi
chmod +x scripts/run_pipeline.sh
./scripts/run_pipeline.sh
```

Chương trình chạy tất cả các bước theo thứ tự, ghi log dưới `results/`. Trên Linux, sanitizer có thể dừng tiến trình v0 với trạng thái lỗi — **đó là hành vi dự kiến**. Script vẫn tiếp tục chạy các bước còn lại và kiểm tra nội dung log bằng các assertion. Không dùng bản v0 trên máy chủ hoặc cho file không đáng tin cậy ngoài sandbox.

### Bốn chương, cùng một target

| Chương | Script / Module | Kết quả được ghi |
|---|---|---|
| 1 — Kripke | `scripts/check_kripke.py`, **`toolkit/kripke.py`** lấy từ `softsec-toolkit/ch1_models` | `results/03_kripke_bmc.log` |
| 2 — Static / Memory | **`toolkit/pattern_scanner.py`** từ `softsec-toolkit/ch2_memsafe`, Clang ASan/UBSan/LSan | `04_static_scan.log`, `05_v0_*`, `05_v1_*` |
| 3 — SMT/BMC | `scripts/check_smt_z3.py` chạy Z3 **SMT-LIB2 thật**, BMC trên mô hình hữu hạn ở chương 1 | `06_smt_z3.log`, `03_kripke_bmc.log` |
| 4 — Fuzzing | `scripts/fuzz_and_coverage.py`: seeded black-box mutation và kiểm thử định hướng nhánh bằng witness từ Z3 | `07_fuzz.log`, `08_gcov.log` |

**Không nhầm lẫn:** `check_kripke.py` là duyệt Kripke và truy đường đi hữu hạn, **không phải CBMC kiểm chứng toàn mã C**. Kiểm thử có witness Z3 là **branch-directed white-box testing**, **không phải** hệ thống concolic KLEE tự động. Các kết quả Z3 chỉ chứng minh những ràng buộc toán học đã trích từ mã, không phải toàn bộ an toàn phần mềm.

## Các kết quả kiểm thử xác nhận trong môi trường tạo file

- `v0` tên 120 byte: ASan `heap-buffer-overflow`; `v1` từ chối.
- `v0` 101 dòng: UBSan index 100 OOB + ASan `global-buffer-overflow`; `v1` từ chối.
- `v0` điểm `nan`: LSan báo leak **108 byte**; `v1` từ chối mà không tái hiện leak.
- `v0` uint32 multiply: wraparound; `v1` chặn trước phép nhân.
- SMT-Z3: v0 SAT với `idx=100`; v1 UNSAT cho điều kiện đồng thời `idx<100 ∧ idx≥100`.
- v1: **20 ca hồi quy** đạt mã thoát kỳ vọng. Random black-box: **300 ca**, seed **20261011**, **0** unexpected exit/timeout; 137 accept/163 reject.
- gcov v1 cho corpus đã chọn: **93,41%** lines executed, **73,08%** branch directions taken at least once.

Các số này là kết quả máy chạy, không được hiểu là bằng chứng an toàn tuyệt đối. Môi trường khác có thể khác chút về thời gian, địa chỉ ASan hoặc nhánh do bộ biên dịch.

## Cách đọc kết quả

```bash
cat results/03_kripke_bmc.log
cat results/04_static_scan.log
head -25 results/05_v0_long_name.log
head -15 results/05_v0_records_101.log
cat results/06_smt_z3.log
cat results/07_fuzz.log
cat results/08_gcov.log
cat results/09_regression.log
```

## Giới hạn chức năng của CSV

Parser minh họa đọc CSV giản lược có đúng 6 trường, **không hỗ trợ dấu phẩy bên trong cặp dấu nháy hoặc newline trong chuỗi quoted**. Độ dài trường chữ được đo bằng **byte** (độ dài UTF-8 có dấu không trùng số ký tự). Khi nâng cấp thực tế, cần dùng thư viện CSV chuẩn, validation nghiệp vụ, quản lý quyền và giới hạn tài nguyên tiến trình trước khi tích hợp NestJS.

## Tính trung thực của nguồn và tài liệu

Các script `toolkit/kripke.py` và `toolkit/pattern_scanner.py` được sao chép từ `softsec-toolkit.zip` do lớp cung cấp; logic mở rộng dùng để kiểm chứng chương trình nhóm tự viết. Hướng dẫn của giảng viên: `BTL_01_HuongDan_DeTai.pdf`, `BTL_02_HuongDan_BaoCao.pdf`, `Hướng dẫn tạo Spec file dạng excel.pdf`.

AI có hỗ trợ thiết kế mã, test, và viết báo cáo. Nhóm phải **chạy lại trên máy nộp**, tự kiểm tra log, bổ sung MSSV và chú thích mức độ hỗ trợ trước khi nộp chính thức.
