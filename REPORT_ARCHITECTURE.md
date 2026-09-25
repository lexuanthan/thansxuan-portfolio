# KIẾN TRÚC BÁO CÁO CAO CẤP (REPORT ARCHITECTURE)
## HCMUTE CAREER INTELLIGENCE REPORT — EXECUTIVE SPECIFICATION
*Phiên bản: 6.0 | Chuẩn mực: Hồ sơ Chiến lược Ra Quyết định Nghề nghiệp Cá nhân Cao cấp*

---

### 1. Triết Lý Sản Phẩm Báo Cáo (Report as a Product Experience)

Báo cáo Hướng nghiệp **HCMUTE Career Intelligence Report** không đơn thuần là một thao tác "Xuất PDF" thông thường, mà là một **Trải nghiệm Sản phẩm Độc lập (Standalone Product Experience)** mang đẳng cấp học thuật và chuyên gia:
* **Tính trang trọng & Đáng tin cậy:** Định dạng chuẩn tài liệu chiến lược cá nhân (Strategic Dossier), mang bản sắc học thuật công nghệ của **Trường Đại Học Sư Phạm Kỹ Thuật TP.HCM (HCMUTE)**.
* **Tối ưu hóa In ấn A4:** Áp dụng hệ thống `@media print` chuyên biệt với `page-break-before: always;`, `avoid-break: avoid;`, kích thước lề chuẩn quốc tế `12mm × 10mm`.
* **Màu sắc in chuyên nghiệp:** 
  - Nền trắng tinh khôi (`#FFFFFF`) giúp bản in rõ nét và tiết kiệm mực in.
  - Xanh học thuật HCMUTE (`#004098`) định vị các tiêu đề mục và đường viền nhận diện.
  - Đỏ năng động HCMUTE (`#D9232E`) tạo điểm nhấn cho các khuyến nghị then chốt.

---

### 2. Cấu Trúc Hồ Sơ Báo Cáo 8 Phần Chuẩn Mực (Report Structure)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ PHẦN 1: TRANG BÌA HỒ SƠ CHIẾN LƯỢC (Official Strategy Cover)                 │
│ - Biểu trưng HcmuteBrandMark · Mã hồ sơ HCMUTE-2026-XXXX · Hình mẫu Career DNA│
│ - Độ tin cậy dữ liệu % · Gauge % Tương thích cao nhất · Ngày lập báo cáo      │
├──────────────────────────────────────────────────────────────────────────────┤
│ PHẦN 2: BẢN TÓM LƯỢC QUẢN TRỊ (Executive Summary)                            │
│ - Thế mạnh nổi bật cốt lõi · Điểm mù & Vùng thách thức cần quản trị          │
│ - Khuyến nghị hành động tức thì từ HCMUTE AI Coach                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ PHẦN 3: BẢN ĐỒ CAREER DNA & BIỂU ĐỒ RADAR 8 TRỤC                             │
│ - Biểu đồ Radar SVG 8 chiều năng lực độc lập (Phân tích, Sáng tạo, Số...)   │
│ - Bảng xếp hạng Top 5 giá trị nghề nghiệp coi trọng nhất                     │
├──────────────────────────────────────────────────────────────────────────────┤
│ PHẦN 4: TOP NGHỀ NGHIỆP TƯƠNG THÍCH NHẤT (Career Match Matrix)               │
│ - Xếp hạng Top 3 nghề phù hợp nhất · Phân tích Why it fits · Dải lương VN    │
│ - Mức độ tự động hóa AI · Lợi thế cạnh tranh độc quyền của con người          │
├──────────────────────────────────────────────────────────────────────────────┤
│ PHẦN 5: TOP NGÀNH ĐÀO TẠO ĐẠI HỌC (Academic Major Pathways)                  │
│ - Mã ngành chuẩn quốc gia · Độ khó học phần · Cường độ Toán · Điểm chuẩn TB  │
├──────────────────────────────────────────────────────────────────────────────┤
│ PHẦN 6: KẾ HOẠCH HÀNH ĐỘNG 30 / 90 / 365 NGÀY (Action Roadmap)               │
│ - 30 Ngày (Thử nghiệm vi mô) · 90 Ngày (Xây năng lực cốt lõi & Chứng chỉ)    │
│ - 365 Ngày (Sẵn sàng tuyển sinh / Tuyển dụng)                                │
├──────────────────────────────────────────────────────────────────────────────┤
│ PHẦN 7: DÀNH RIÊNG CHO PHỤ HUYNH & CỐ VẤN HỌC ĐƯỜNG                          │
│ - Phân tích đặc điểm tâm lý · Những điều nên đồng hành · Những điều cần tránh │
├──────────────────────────────────────────────────────────────────────────────┤
│ PHẦN 8: MINH BẠCH DỮ LIỆU & PHƯƠNG PHÁP LUẬN (Methodology & Ethics)          │
│ - Thuật toán so khớp tất định · Bản quyền © 2026 HCMUTE Career Intelligence  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### 3. Bốn Chế Độ Xuất Bản Linh Hoạt (Export Presets)

1. **Toàn diện (Full Dossier):** Hiển thị toàn bộ 8 phần báo cáo, phục vụ học sinh lưu trữ dài hạn và đồng hành cùng chuyên gia cố vấn.
2. **Tóm tắt (Executive Summary):** Cô đọng trang bìa, tóm lược điều hành và Top nghề/ngành khuyến nghị ngắn gọn.
3. **Phụ huynh / Mentor:** Tập trung vào Chân dung Career DNA, Điểm mạnh/Điểm mù và Lưu ý đồng hành cùng con cái.
4. **Lộ trình (Roadmap Campaign):** Trực quan hóa các cột mốc hành động cụ thể 30/90/365 ngày kèm danh mục bài học và dự án.

---

### 4. Phương Thức Phân Phối Đa Nền Tảng (Export Channels)

* **In trực tiếp / Lưu PDF A4:** Lệnh `window.print()` tích hợp CSS chuyên biệt, loại bỏ hoàn toàn các thanh công cụ điều khiển thừa thãi (`.no-print`).
* **Tải File Tài liệu Tự Chứa (.html):** Tệp HTML độc lập chứa toàn bộ cấu trúc và CSS Tailwind nhúng sẵn, mở offline trên máy tính hoặc điện thoại mà không cần kết nối Internet.
* **Mở Tab In Độc Lập:** Cơ chế `window.open` tạo trang trắng tinh khiết, loại bỏ hoàn toàn xung đột khung giao diện của trình duyệt.
