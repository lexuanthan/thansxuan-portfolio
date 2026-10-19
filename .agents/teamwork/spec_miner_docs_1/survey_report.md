# BÁO CÁO KHẢO SÁT CHUYÊN ĐỀ & BỘ ĐỀ 15 CÂU HỎI TẬP HUẤN ĐOÀN – HỘI HCM-UTE
*(Survey Report & Specification for Live Interactive Training Quiz Game)*

- **Đơn vị ban hành tài liệu**: Ban Thường vụ Đoàn trường – Ban Thư ký Hội Sinh viên Trường Đại học Công nghệ Kỹ thuật TP. Hồ Chí Minh (HCM-UTE)
- **Báo cáo viên chuyên đề**: Đ/c Lê Xuân Thân (Ủy viên BCH Thành Đoàn TP.HCM, Bí thư Đoàn trường, Phó Trưởng phòng Quản trị thương hiệu và truyền thông)
- **Hồ sơ tài liệu gốc được khai thác**:
  1. `Bai_Thuyet_Trinh_Ky_nang_Xay_dung_Ke_hoach_va_To_chuc_Hoat_dong_Doan_Hoi_HCMUTE.docx` (344 đoạn văn bản nghiệp vụ chi tiết)
  2. `Chuyen_de_Ky_nang_Xay_dung_Ke_hoach_va_To_chuc_Hoat_dong_Doan_Hoi_HCMUTE_V3.pptx` (34 slide bài giảng chuẩn)
  3. `Chuyen_de_Ky_nang_Xay_dung_Ke_hoach_va_To_chuc_Hoat_dong_Doan_Hoi_HCMUTE.pptx` (Bộ slide hình ảnh thực tế đối chiếu)
- **Cơ quan thực hiện khai thác đặc tả**: Spec Miner Agent (`spec_miner_docs_1`)
- **Ngày lập**: 18/10/2026

---

## I. TỔNG QUAN NỘI DUNG TẬP HUẤN & KHUNG NĂNG LỰC CỐT LÕI

Chuyên đề tập huấn *"Kỹ năng xây dựng kế hoạch và tổ chức hoạt động Đoàn – Hội trong bối cảnh hiện nay"* được thiết kế với cấu trúc 4 học phần trọng tâm, chuyển đổi mạnh mẽ từ tư duy "hành chính phong trào bề nổi" sang "quản trị dự án sinh viên chuyên nghiệp", tích hợp triệt để chuyển đổi số và công nghệ trí tuệ nhân tạo (AI):

```
+-----------------------------------------------------------------------------------+
|                        CHUYÊN ĐỀ TẬP HUẤN CÁN BỘ ĐOÀN - HỘI                       |
|         TRƯỜNG ĐẠI HỌC CÔNG NGHỆ KỸ THUẬT TP. HỒ CHÍ MINH (HCM-UTE)              |
+-----------------------------------------------------------------------------------+
        |
        +---> PHẦN 01: BỐI CẢNH MỚI & TƯ DUY THIẾT KẾ HOẠT ĐỘNG
        |     - Quyết định 2806/QĐ-TTg: Định vị HCM-UTE & Tự chủ đại học (KPI, ROI)
        |     - Sinh viên Gen Z: Thực tế, chuộng tương tác số, đòi hỏi "Giá trị thật"
        |     - Địa bàn 168 Phường/Xã/Đặc khu mới tại TP.HCM: "Học trong dân - Làm vì dân"
        |     - Kim chỉ nam "20 Chữ Vàng": Hấp dẫn, thiết thực - Hiện đại, ngắn gọn -
        |       Linh hoạt, đa dạng - Hiệu quả, tiết kiệm - Bền vững, lan tỏa
        |
        +---> PHẦN 02: KỸ NĂNG XÂY DỰNG KẾ HOẠCH & THỦ TỤC HÀNH CHÍNH - TÀI CHÍNH
        |     - Phân cấp 3 cấp độ kế hoạch: Năm học (Chiến lược) - Đợt (Trung hạn) - Sự kiện (Tác nghiệp)
        |     - Quy hoạch gắn chu kỳ tài chính: Năm tài chính Nhà trường khóa sổ vào 31/12
        |     - Phương pháp luận lập kế hoạch: SMART + Ma trận 5W1H + Khung kiểm soát 2C + Nguồn lực 5M
        |     - Cấu trúc chuẩn 06 phần của văn bản Kế hoạch Đoàn - Hội
        |     - Quy chuẩn thể thức văn bản: Tiêu đề Đoàn không ghi Quốc hiệu; Kế hoạch Liên tịch (KHLT)
        |     - Quy trình 5 bước trình duyệt & Ký số qua hệ thống UTEOffice (mốc T-21, T-14, T-12, T-10, T+7)
        |     - Kỹ năng lập Bảng Dự trù kinh phí (DTKP), hóa đơn điện tử VAT & Hồ sơ tài trợ (Proposal)
        |
        +---> PHẦN 03: KỸ NĂNG TỔ CHỨC THỰC THI & QUẢN TRỊ RỦI RO HIỆN TRƯỜNG
        |     - Giai đoạn Trước (Pre-event): Bộ 03 Kịch bản (Tổng thể, Lời dẫn MC, Kỹ thuật Cue Sheet) & Tổng duyệt
        |     - Chiến dịch truyền thông 3 pha: Teasing (Khởi động) -> Booming (Cao điểm) -> Recap (Viral)
        |     - Giai đoạn Trong (On-site): Trưởng BTC là Stage Manager; Điều phối 04 Tổ tác chiến
        |       (Lễ tân/QR, Sân khấu/Kỹ thuật, Media tác chiến, Hậu cần/An ninh/Khán giả)
        |     - Quản trị rủi ro & Phương án dự phòng (Plan B): Thời tiết, sự cố kỹ thuật, y tế, khủng hoảng
        |     - Giai đoạn Sau (Post-event): Quy tắc vàng T+7 khép kín hồ sơ (T+1 cảm ơn, T+3 AAR, T+5 ĐRL, T+7 quyết toán)
        |
        +---> PHẦN 04: HỆ SINH THÁI CHUYỂN ĐỔI SỐ & ỨNG DỤNG AI ĐẶC THÙ TẠI HCM-UTE
              - 3 Nền tảng quản trị số: UTEOffice (Ký số), youth.hcmute.edu.vn (Quản lý đoàn viên), thiduatuoitre.hcmute.edu.vn (Thi đua)
              - Sản phẩm số hóa kỹ thuật: Thùng phiếu Laser - In 3D (chuyển giao 11+ Tỉnh/Thành Đoàn), AI Research Mentor 2026
              - Ứng dụng GenAI trong 4 khâu: Ideation -> Drafting -> Media -> Analytics
              - Nguyên tắc cốt lõi 70/30: AI làm nháp 70% tốc độ - Cán bộ Đoàn kiểm duyệt 30% bản sắc & bảo mật
```

---

## II. ĐẶC TẢ TÍNH NĂNG & QUY TẮC NGHIỆP VỤ (FEATURES DISCOVERED)

### 1. Bảng danh mục tính năng / Quy tắc nghiệp vụ phát hiện từ tài liệu
| # | Phân loại | Tên quy tắc / Tính năng | Mô tả chi tiết | Dữ liệu đầu vào (Inputs) | Kết quả đầu ra (Outputs) | Hành vi khi lỗi / Xử lý sai phạm | Nguồn trích xuất |
|---|---|---|---|---|---|---|---|
| 1 | Tư duy | Phương châm 20 Chữ Vàng | Bộ lọc 5 tiêu chuẩn: Hấp dẫn, thiết thực - Hiện đại, ngắn gọn - Linh hoạt, đa dạng - Hiệu quả, tiết kiệm - Bền vững, lan tỏa | Ý tưởng phong trào của đơn vị | Đánh giá tính khả thi và định hướng hình thức tổ chức | Bị bác bỏ nếu mang tính hình thức, lãng phí | Slide 08-09; Docx đoạn 149-186 |
| 2 | Kế hoạch | Phân cấp 3 cấp độ Kế hoạch | Phân định Cấp 1 (Năm học), Cấp 2 (Chiến dịch/Đợt), Cấp 3 (Sự kiện đơn lẻ) | Mục tiêu, chỉ tiêu công tác năm học | Văn bản kế hoạch đúng tầm mức, phân bổ nguồn lực | Kế hoạch cấp 3 mâu thuẫn chỉ tiêu cấp 1 | Slide 11; Docx đoạn 205-224 |
| 3 | Lập kế hoạch | Ma trận SMART - 5W1H - 2C - 5M | Công thức thiết lập mục tiêu định lượng, rõ nội dung, cơ chế kiểm soát và 5 nguồn lực (Man, Money, Material, Machine/Method, Minute) | Dữ liệu khảo sát sinh viên, nguồn lực sẵn có | Bản kế hoạch chi tiết, khả thi 100% | Kế hoạch bị vỡ tiến độ do thiếu kiểm soát hoặc thiếu nguồn lực | Slide 13-14; Docx đoạn 245-280 |
| 4 | Thể thức | Chuẩn hóa Thể thức văn bản Đoàn | Góc phải ghi "ĐOÀN TNCS HỒ CHÍ MINH" (không ghi Quốc hiệu); font Times New Roman 13-14; ký "TM. BAN THƯỜNG VỤ" | Nội dung đề xuất của Ban Thường vụ | Bản văn bản đúng thể thức hành chính của Trung ương Đoàn | Trả lại văn bản, không cấp số ký hiệu nếu sai thể thức | Slide 17; Docx đoạn 321-340 |
| 5 | Thể thức | Kế hoạch Liên tịch (KHLT) | Văn bản phối hợp giữa Đoàn với Hội SV, Khoa, Phòng/Ban; tiêu đề song song hoặc dùng Quốc hiệu, 2 cột chữ ký ngang hàng | Thỏa thuận phối hợp liên đơn vị | Kế hoạch liên tịch ký hiệu ...-KHLT/ĐTN-HSV | Tranh chấp trách nhiệm thực hiện giữa các bên | Slide 17; Docx đoạn 335-342 |
| 6 | Ký số | Quy trình 5 bước UTEOffice | Mốc T-21 soạn thảo, T-14 thẩm định, T-12 ký số trên UTEOffice, T-10 phát hành liên đơn vị, T+7 đóng hồ sơ | Hồ sơ văn bản PDF, tờ trình, dự trù kinh phí | Quyết định/Kế hoạch có chữ ký số hợp lệ của Nhà trường | Nộp trễ dưới 14 ngày bị từ chối phê duyệt cơ sở vật chất | Slide 18; Docx đoạn 341-366 |
| 7 | Tài chính | Bảng Dự trù kinh phí (DTKP) | Chia 4 mục: Giải thưởng, Ấn phẩm/Truyền thông, Hậu cần/Âm thanh, Thù lao BGK/Báo cáo viên; bám sát định mức nội bộ | Danh mục nhu yếu phẩm, báo giá thị trường | Bảng DTKP đính kèm có cột nguồn kinh phí chi tiết | Không được thanh toán nếu chi vượt hoặc sai danh mục duyệt | Slide 19; Docx đoạn 367-388 |
| 8 | Tài chính | Chứng từ thanh toán hợp lệ | Bắt buộc có Hóa đơn GTGT điện tử (VAT) xuất đúng MST & Tên trường mới; danh sách ký nhận có MSSV, CCCD, STK | Hóa đơn, biên bản bàn giao, hợp đồng | Hồ sơ giải ngân thanh quyết toán hợp lệ | Hóa đơn bán lẻ viết tay bị từ chối giải ngân 100% | Slide 19; Docx đoạn 381-388 |
| 9 | Sự kiện | Bộ 03 Kịch bản trước giờ G | Gồm Kịch bản Tổng thể (Agenda), Kịch bản MC (MC Script) và Kịch bản Kỹ thuật (Technical Cue Sheet) | Chương trình khung, danh sách khách mời, timeline âm thanh/LED | Bộ điều hành đồng bộ sân khấu cho toàn bộ BTC | Lỗi khớp sân khấu: MC đọc nhưng âm thanh/LED không lên | Slide 21; Docx đoạn 407-426 |
| 10 | Sự kiện | Tổng duyệt sân khấu (Rehearsal) | Bắt buộc chạy thử âm thanh, visual LED, lời dẫn MC trên sân khấu thật trước ít nhất 1 buổi đến 1 ngày | Kịch bản Cue Sheet, file âm thanh, video | Sự kiện vận hành trơn tru không có độ trễ | Sự cố treo LED, mất tiếng micro trong chương trình chính thức | Slide 21; Docx đoạn 423-426 |
| 11 | Truyền thông | Chiến dịch truyền thông 3 pha | Pha 1 Teasing (T-10 đến T-5) -> Pha 2 Booming (T-4 đến T-1) -> Pha 3 Reminder & Recap (Trong và sau sự kiện) | Key Visual, thông tin diễn giả, minigame | Thu hút tối đa sinh viên đăng ký, lan tỏa thương hiệu | Hội trường vắng người tham dự do truyền thông sát ngày | Slide 22; Docx đoạn 427-444 |
| 12 | Điều phối | 04 Tổ tác chiến hiện trường | Gồm: (1) Đón tiếp/Lễ tân/QR, (2) Nội dung/Sân khấu/Kỹ thuật, (3) Live Media tác chiến, (4) Hậu cần/An ninh/Khán giả | Phân công nhiệm vụ cụ thể từng nhân sự | Vận hành nhịp nhàng dưới sự chỉ huy của Stage Manager | Trưởng BTC sa đà chạy việc vặt, mất quyền kiểm soát sự kiện | Slide 23; Docx đoạn 445-466 |
| 13 | Quản trị rủi ro | Kịch bản dự phòng (Plan B) | Chuẩn bị phương án thời tiết (mái che/hội trường dự phòng di dời 30p), kỹ thuật (file offline trên 2 máy tính, USB, micro dự phòng) | Dự báo thời tiết, kiểm tra thiết bị | Khắc phục sự cố trong vòng 1-3 phút | Sự kiện bị hủy hoặc gián đoạn dài khi rớt mạng Wi-Fi | Slide 26-27; Docx đoạn 503-540 |
| 14 | Hậu sự kiện | Quy tắc vàng T+7 | T+1 Thư cảm ơn & Recap; T+3 Họp rút kinh nghiệm AAR; T+5 Cập nhật ĐRL lên youth.hcmute; T+7 Quyết toán tài chính | Ảnh recap, dữ liệu điểm danh QR, chứng từ chi tiêu | Hoàn tất 100% hồ sơ pháp lý, tài chính và quyền lợi sinh viên | Khiếu nại điểm rèn luyện kéo dài, nợ chứng từ qua năm tài chính | Slide 28; Docx đoạn 541-562 |
| 15 | Chuyển đổi số | Hệ sinh thái số HCM-UTE | 3 Trụ cột: Ký số UTEOffice, Điểm danh & ĐRL youth.hcmute.edu.vn, Đánh giá thi đua thiduatuoitre.hcmute.edu.vn | Dữ liệu đoàn viên, văn bản điện tử, minh chứng | Quản trị Đoàn - Hội không giấy tờ toàn diện | Thất lạc dữ liệu giấy tờ, chậm trễ cập nhật quyền lợi SV | Slide 30; Docx đoạn 581-600 |
| 16 | AI | Nguyên tắc ứng dụng GenAI 70/30 | AI tăng tốc 70% bản nháp (ý tưởng, kịch bản, content, phân tích khảo sát); Cán bộ Đoàn kiểm duyệt 30% bản sắc & bảo mật | Câu lệnh Prompt chuẩn, bối cảnh HCM-UTE | Tiết kiệm 50% thời gian hành chính | Ảo giác AI (Hallucination), lộ lọt thông tin cá nhân SV | Slide 32-33; Docx đoạn 621-664 |

---

### 2. Các tình huống biên & Tình huống đặc biệt (Edge Cases)
| # | Tình huống / Feature | Điều kiện đầu vào cụ thể | Hành vi quan sát / Giải pháp theo tài liệu bài giảng |
|---|---|---|---|
| 1 | Rớt mạng Internet tại Hội trường | Tổ chức Talkshow, file trình chiếu lưu trên Canva/Google Drive online, mạng Wi-Fi ngắt đột ngột | MC điều phối giao lưu minigame/câu hỏi tương tác không cần mic; kỹ thuật viên chuyển sang file PowerPoint/PDF đã tải offline sẵn trên máy tính thứ 2 (hoặc USB). Tuyệt đối cấm chạy slide online ở sự kiện lớn. |
| 2 | Mưa giông khi tổ chức ngoài trời | Sự kiện tại Sân Khu A / Sân vận động gặp mưa lớn bất ngờ | Ngay lập tức kích hoạt Plan B: che chắn tủ điện công suất lớn và bàn mixer âm thanh; di dời toàn bộ đại biểu và sinh viên vào sảnh có mái che dự phòng đã được đăng ký giữ chỗ trước đó trên văn bản UTEOffice. |
| 3 | Lỗi thiết kế bản đồ Việt Nam | Poster/Backdrop tải vector từ mạng nước ngoài thiếu Hoàng Sa, Trường Sa | Quy trình kiểm duyệt 2 lớp (Trưởng ban Truyền thông -> Thường trực BTC) phát hiện và thu hồi ấn phẩm ngay lập tức; cấm tuyệt đối xuất bản ấn phẩm vi phạm chủ quyền biển đảo. |
| 4 | Trùng lịch thi học kỳ của sinh viên | Lập kế hoạch sự kiện lớn rơi vào tuần thi giữa kỳ hoặc cuối kỳ (tháng 12 hoặc tháng 5) | Kế hoạch bị từ chối phê duyệt vì không đáp ứng chỉ tiêu tham dự; phải lùi hoặc đẩy sớm lịch tổ chức để sinh viên an tâm ôn tập thi cử. |
| 5 | Lệch chu kỳ tài chính cuối năm | Kế hoạch Tháng 12 giải ngân chậm sau ngày 15/12 | Hệ thống kế toán Nhà trường khóa sổ theo năm Dương lịch (31/12); toàn bộ kinh phí chưa thanh quyết toán sẽ bị hủy dự toán hoặc thu hồi, cơ sở phải tự bù lỗ. |
| 6 | Khán giả không tương tác ở phần Q&A | MC mời đặt câu hỏi nhưng sinh viên ngại ngùng, hội trường im lặng | Kích hoạt 5-7 "câu hỏi mồi" (Seed questions) từ cán bộ nòng cốt ngồi rải rác dưới hội trường; mở mã QR Slido/Padlet trên màn hình LED để SV đặt câu hỏi ẩn danh. |

---

## III. BẢNG MA TRẬN PHÂN BỔ 15 CÂU HỎI THEO MỨC ĐỘ & HỌC PHẦN

| ID | Mức độ nhận thức | Học phần chuyên đề | Nội dung trọng tâm | Đáp án đúng | Thời gian |
|:---:|:---|:---|:---|:---:|:---:|
| **1** | Nhận biết | Phần 01: Bối cảnh mới & Tư duy | Phương châm "20 Chữ Vàng" trong thiết kế phong trào | B (Index 1) | 15s |
| **2** | Nhận biết | Phần 02: Kế hoạch & Thể thức | Tiêu đề góc phải văn bản đơn lẻ của Đoàn TNCS Hồ Chí Minh | C (Index 2) | 15s |
| **3** | Nhận biết | Phần 03: Tổ chức sự kiện | "Bộ 03 Kịch bản" bắt buộc trước giờ G | B (Index 1) | 15s |
| **4** | Nhận biết | Phần 03: Hậu sự kiện | Mốc T+5 trong Quy tắc vàng "T+7" khép kín quy trình | C (Index 2) | 15s |
| **5** | Nhận biết | Phần 04: Chuyển đổi số | Nền tảng số nộp minh chứng và chấm điểm thi đua | B (Index 1) | 15s |
| **6** | Thông hiểu | Phần 02: Phương pháp lập KH | Mục đích của khung kiểm soát 2C và nguồn lực 5M | B (Index 1) | 15s |
| **7** | Thông hiểu | Phần 02: Quản trị tài chính | Độ lệch giữa Năm học (T9-T8) và Năm tài chính Nhà trường (T1-T12) | B (Index 1) | 15s |
| **8** | Thông hiểu | Phần 03: Điều phối hiện trường | Vai trò Tổng Đạo diễn (Stage Manager) của Trưởng Ban Tổ chức | B (Index 1) | 15s |
| **9** | Thông hiểu | Phần 02: Quản trị tài chính | Hóa đơn bán lẻ viết tay không hợp lệ khi quyết toán tài chính | C (Index 2) | 15s |
| **10** | Thông hiểu | Phần 04: Ứng dụng AI | Ý nghĩa thực chất của nguyên tắc "70/30" khi sử dụng GenAI | C (Index 2) | 15s |
| **11** | Tình huống thực tế | Phần 02: Ký số UTEOffice | Mốc thời gian hoàn tất trình ký số văn bản trước sự kiện | C (Index 2) | 15s |
| **12** | Tình huống thực tế | Phần 03: Quản trị rủi ro | Xử lý sự cố mất kết nối mạng khi đang chiếu slide online | C (Index 2) | 15s |
| **13** | Tình huống thực tế | Phần 03: Kỷ luật truyền thông | Xử lý sự cố phát hiện đồ họa bản đồ thiếu Hoàng Sa, Trường Sa | B (Index 1) | 15s |
| **14** | Tình huống thực tế | Phần 03: Tổ chức Talkshow | Kích hoạt tương tác hội trường bằng câu hỏi mồi & QR ẩn danh | C (Index 2) | 15s |
| **15** | Tình huống thực tế | Phần 04: Quyền lợi sinh viên | Xử lý khiếu nại điểm rèn luyện đối soát trên youth.hcmute.edu.vn | B (Index 1) | 15s |

**Thống kê phân bổ:**
- Nhận biết: **5 câu (33.3%)**
- Thông hiểu: **5 câu (33.3%)**
- Tình huống thực tế: **5 câu (33.3%)**
- Tổng số câu hỏi: **15 câu (100%)**
- Thời gian trả lời mỗi câu: **15 giây**

---

## IV. BỘ ĐỀ 15 CÂU HỎI TRẮC NGHIỆM CHI TIẾT KÈM GIẢI THÍCH CHUYÊN MÔN

### CÂU HỎI 01
- **Mã câu hỏi (ID)**: 1
- **Phân loại mức độ**: Nhận biết
- **Thời gian đếm ngược**: 15 giây
- **Nội dung câu hỏi**: Theo chuyên đề tập huấn cán bộ Đoàn – Hội HCM-UTE, phương châm "20 Chữ Vàng" định hướng thiết kế và thẩm định chất lượng hoạt động bao gồm những tiêu chuẩn nào?
- **Các phương án lựa chọn**:
  - A. Tự nguyện, xung kích – Tiết kiệm, an toàn – Sáng tạo, đổi mới – Gắn kết, rộng khắp – Kịp thời, bền vững
  - B. Hấp dẫn, thiết thực – Hiện đại, ngắn gọn – Linh hoạt, đa dạng – Hiệu quả, tiết kiệm – Bền vững, lan tỏa
  - C. Đoàn kết, xung phong – Năng động, tự chủ – Kỷ cương, trách nhiệm – Hội nhập, văn minh – Thiết thực, hiệu quả
  - D. Cụ thể, khả thi – Đo lường, kịp thời – Linh hoạt, hiện đại – Tiết kiệm, an toàn – Sâu sắc, nhân văn
- **Chỉ số đáp án đúng (correctIndex)**: `1` (Phương án B)
- **Giải thích chuyên môn**: Căn cứ Slide 08 & 09 và tài liệu bài giảng, phương châm "20 Chữ Vàng" gồm 5 tiêu chuẩn cốt lõi: (1) Hấp dẫn – Thiết thực, (2) Hiện đại – Ngắn gọn, (3) Linh hoạt – Đa dạng, (4) Hiệu quả – Tiết kiệm, và (5) Bền vững – Lan tỏa. Đây là bộ lọc thẩm định mọi ý tưởng trước khi lập kế hoạch.

---

### CÂU HỎI 02
- **Mã câu hỏi (ID)**: 2
- **Phân loại mức độ**: Nhận biết
- **Thời gian đếm ngược**: 15 giây
- **Nội dung câu hỏi**: Theo quy chuẩn thể thức văn bản của Đoàn TNCS Hồ Chí Minh đối với văn bản hành chính do Đoàn trường hoặc Đoàn cơ sở ban hành độc lập, phần tiêu đề góc trên bên phải ghi nội dung gì?
- **Các phương án lựa chọn**:
  - A. CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM / Độc lập - Tự do - Hạnh phúc
  - B. ĐOÀN TNCS HỒ CHÍ MINH / BAN CHẤP HÀNH TRƯỜNG ĐH CÔNG NGHỆ KỸ THUẬT TP.HCM
  - C. ĐOÀN TNCS HỒ CHÍ MINH (in hoa, đậm, không ghi Quốc hiệu Cộng hòa XHCN Việt Nam)
  - D. TUỔI TRẺ VIỆT NAM / TIÊN PHONG - BẢN LĨNH - ĐOÀN KẾT - SÁNG TẠO
- **Chỉ số đáp án đúng (correctIndex)**: `2` (Phương án C)
- **Giải thích chuyên môn**: Căn cứ Slide 17 và Hướng dẫn thể thức văn bản Đoàn: Văn bản đơn lẻ do Đoàn ban hành độc lập ở góc phải ghi "ĐOÀN TNCS HỒ CHÍ MINH" (không ghi Quốc hiệu nước CHXHCN Việt Nam; Quốc hiệu chỉ sử dụng khi ban hành Kế hoạch Liên tịch với cơ quan chính quyền/Nhà trường).

---

### CÂU HỎI 03
- **Mã câu hỏi (ID)**: 3
- **Phân loại mức độ**: Nhận biết
- **Thời gian đếm ngược**: 15 giây
- **Nội dung câu hỏi**: Trong giai đoạn chuẩn bị trước sự kiện (Pre-event), Ban Tổ chức bắt buộc phải hoàn thiện "Bộ 03 Kịch bản" bao gồm những loại kịch bản nào?
- **Các phương án lựa chọn**:
  - A. Kịch bản Truyền thông, Kịch bản Khảo sát ý kiến và Kịch bản Họp báo
  - B. Kịch bản Tổng thể (Master Agenda), Kịch bản Lời dẫn MC (MC Script) và Kịch bản Kỹ thuật (Technical Cue Sheet)
  - C. Kịch bản Đón tiếp VIP, Kịch bản Trò chơi Minigame và Kịch bản Báo cáo quyết toán
  - D. Kịch bản Sân khấu hóa, Kịch bản Phân cảnh TikTok và Kịch bản Chấm thi giám khảo
- **Chỉ số đáp án đúng (correctIndex)**: `1` (Phương án B)
- **Giải thích chuyên môn**: Căn cứ Slide 21 và tài liệu bài giảng: Bộ 03 kịch bản bắt buộc trước giờ G gồm: (1) Kịch bản Tổng thể (Master Agenda/Timeline), (2) Kịch bản Lời dẫn MC (MC Script), và (3) Kịch bản Kỹ thuật (Technical Cue Sheet) để đồng bộ từng giây phút giữa Sân khấu – Âm thanh – Ánh sáng – Màn hình LED – Lễ tân.

---

### CÂU HỎI 04
- **Mã câu hỏi (ID)**: 4
- **Phân loại mức độ**: Nhận biết
- **Thời gian đếm ngược**: 15 giây
- **Nội dung câu hỏi**: Theo Quy tắc vàng "T+7" khép kín quy trình sau sự kiện tại HCM-UTE, mốc thời gian T+5 quy định thực hiện đầu việc nào?
- **Các phương án lựa chọn**:
  - A. Đăng bài viết Recap truyền thông và gửi Thư cảm ơn đến Nhà tài trợ, Diễn giả
  - B. Tổ chức cuộc họp rút kinh nghiệm Ban Tổ chức (After Action Review - AAR)
  - C. Rà soát, chuẩn hóa danh sách MSSV tham dự và cập nhật lên hệ thống để ghi nhận Điểm rèn luyện / CTXH
  - D. Nộp toàn bộ hồ sơ thanh quyết toán và hóa đơn điện tử về Phòng Kế hoạch - Tài chính
- **Chỉ số đáp án đúng (correctIndex)**: `2` (Phương án C)
- **Giải thích chuyên môn**: Căn cứ Slide 28: Quy tắc T+7 phân định: T+1 gửi Thư cảm ơn & đăng bài Recap trong 24h; T+3 họp rút kinh nghiệm BTC (AAR); T+5 chuẩn hóa danh sách MSSV cập nhật lên youth.hcmute.edu.vn để bảo đảm quyền lợi ĐRL/CTXH cho sinh viên; T+7 hoàn tất hồ sơ quyết toán kinh phí.

---

### CÂU HỎI 05
- **Mã câu hỏi (ID)**: 5
- **Phân loại mức độ**: Nhận biết
- **Thời gian đếm ngược**: 15 giây
- **Nội dung câu hỏi**: Trong hệ sinh thái chuyển đổi số của Đoàn – Hội HCM-UTE, nền tảng nào đóng vai trò tiếp nhận minh chứng và đánh giá xếp loại thi đua định kỳ của các cơ sở trực thuộc?
- **Các phương án lựa chọn**:
  - A. youth.hcmute.edu.vn
  - B. thiduatuoitre.hcmute.edu.vn
  - C. nhatro.hcmute.edu.vn
  - D. UTEOffice (qlvb.hcmute.edu.vn)
- **Chỉ số đáp án đúng (correctIndex)**: `1` (Phương án B)
- **Giải thích chuyên môn**: Căn cứ Slide 30 và tài liệu bài giảng: Ba nền tảng số cốt lõi gồm: UTEOffice (trình ký số văn bản hành chính Nhà trường), youth.hcmute.edu.vn (quản lý hồ sơ đoàn viên, đăng ký sự kiện, điểm danh QR, điểm rèn luyện), và thiduatuoitre.hcmute.edu.vn (số hóa nộp minh chứng và chấm điểm thi đua cơ sở).

---

### CÂU HỎI 06
- **Mã câu hỏi (ID)**: 6
- **Phân loại mức độ**: Thông hiểu
- **Thời gian đếm ngược**: 15 giây
- **Nội dung câu hỏi**: Khi xây dựng kế hoạch hoạt động Đoàn – Hội, yếu tố "2C" và "5M" bổ sung cho ma trận "5W1H" nhằm mục đích trọng tâm nào?
- **Các phương án lựa chọn**:
  - A. Tăng số lượng trang văn bản để thuyết phục các đơn vị tài trợ doanh nghiệp
  - B. Thiết lập cơ chế kiểm soát tiến độ, tiêu chí nghiệm thu (2C) và bảo đảm cân đối đầy đủ 5 nguồn lực thực thi (5M)
  - C. Phân chia quyền hạn giữa Đoàn Thanh niên và Hội Sinh viên trong các hoạt động liên tịch
  - D. Giúp chuyển đổi toàn bộ nội dung kế hoạch thành mã lệnh tự động hóa trên hệ thống máy chủ
- **Chỉ số đáp án đúng (correctIndex)**: `1` (Phương án B)
- **Giải thích chuyên môn**: Căn cứ Slide 14: 5W1H định hình khung nội dung (Làm gì, Ở đâu, Khi nào...), còn 2C (Control - Kiểm soát tiến độ & Check - Nghiệm thu/Bảng kiểm) và 5M (Man, Money, Material, Machine/Method, Minute) bảo đảm cơ chế giám sát chất lượng và cân đối đầy đủ 5 nguồn lực cốt lõi để kế hoạch không bị vỡ trận khi thực thi.

---

### CÂU HỎI 07
- **Mã câu hỏi (ID)**: 7
- **Phân loại mức độ**: Thông hiểu
- **Thời gian đếm ngược**: 15 giây
- **Nội dung câu hỏi**: Tại sao cán bộ Đoàn – Hội HCM-UTE cần đặc biệt lưu ý sự khác biệt giữa "Năm học" và "Năm tài chính" khi lập dự trù kinh phí cho các hoạt động trong Học kỳ I?
- **Các phương án lựa chọn**:
  - A. Vì sinh viên chỉ đóng Đoàn phí vào Học kỳ II nên Học kỳ I không được phép chi tiêu ngân sách
  - B. Vì năm tài chính Nhà trường tính theo năm Dương lịch (khóa sổ vào tháng 12), đòi hỏi các hoạt động HK1 phải hoàn tất dự trù và thanh quyết toán trước mốc này
  - C. Vì mọi hoạt động trong Học kỳ I bắt buộc phải sử dụng 100% nguồn tài trợ xã hội hóa từ doanh nghiệp
  - D. Vì Phòng Kế hoạch - Tài chính chỉ tiếp nhận hồ sơ thanh toán duy nhất 1 lần vào cuối năm học (tháng 8)
- **Chỉ số đáp án đúng (correctIndex)**: `1` (Phương án B)
- **Giải thích chuyên môn**: Căn cứ Slide 12: Năm học kéo dài từ tháng 9 đến tháng 8 năm sau, nhưng năm tài chính của Nhà trường tính theo năm Dương lịch (tháng 1 đến tháng 12). Vào khoảng giữa/cuối tháng 12, Nhà trường khóa sổ quyết toán năm tài chính, nên các hoạt động HK1 (đặc biệt tháng 11, 12 và chuẩn bị Xuân Tình Nguyện) phải khẩn trương hoàn thành hồ sơ giải ngân trước khi hệ thống khóa sổ.

---

### CÂU HỎI 08
- **Mã câu hỏi (ID)**: 8
- **Phân loại mức độ**: Thông hiểu
- **Thời gian đếm ngược**: 15 giây
- **Nội dung câu hỏi**: Trong thời gian diễn ra một sự kiện lớn tại Hội trường, tại sao Trưởng Ban Tổ chức (hoặc Tổng Đạo diễn / Stage Manager) không nên trực tiếp tham gia chạy các việc sự vụ (như bê nước, chỉnh slide, đón khách)?
- **Các phương án lựa chọn**:
  - A. Vì quy định lễ tân không cho phép Trưởng Ban Tổ chức xuất hiện trước mặt khách mời
  - B. Để tập trung giữ vị trí bao quát toàn cảnh, giữ liên lạc bộ đàm/mạng nội bộ điều phối nhịp nhàng 4 Tổ tác chiến và xử lý kịp thời các tình huống phát sinh
  - C. Vì Trưởng Ban Tổ chức chỉ chịu trách nhiệm ở khâu viết kế hoạch, khâu thực hiện thuộc về các Phó Bí thư Đoàn
  - D. Để dành toàn bộ thời gian chụp ảnh kỷ niệm và đăng bài trực tiếp lên các kênh mạng xã hội cá nhân
- **Chỉ số đáp án đúng (correctIndex)**: `1` (Phương án B)
- **Giải thích chuyên môn**: Căn cứ Slide 23: Nguyên tắc điều phối hiện trường là "Một người chỉ huy – Bốn mũi giáp công". Trưởng BTC đóng vai trò Tổng Đạo diễn bao quát toàn bộ sự kiện, liên lạc chỉ đạo 4 Tổ trưởng (Lễ tân, Sân khấu, Media, Hậu cần/An ninh). Nếu sa đà vào chạy việc vặt, người chỉ huy sẽ mất góc nhìn tổng quan và không thể xử lý khi xảy ra sự cố đột xuất.

---

### CÂU HỎI 09
- **Mã câu hỏi (ID)**: 9
- **Phân loại mức độ**: Thông hiểu
- **Thời gian đếm ngược**: 15 giây
- **Nội dung câu hỏi**: Khoản chi nào sau đây từ nguồn kinh phí hỗ trợ của Nhà trường/Đoàn trường bị coi là KHÔNG HỢP LỆ khi nộp hồ sơ quyết toán tài chính?
- **Các phương án lựa chọn**:
  - A. Hóa đơn điện tử VAT mua văn phòng phẩm có đầy đủ thông tin pháp nhân và Mã số thuế của Trường ĐH Công nghệ Kỹ thuật TP.HCM
  - B. Phiếu chi tiền thưởng có danh sách ký nhận đầy đủ Họ tên, MSSV, tên giải thưởng và chữ ký sống của sinh viên đạt giải
  - C. Hóa đơn bán lẻ viết tay mua vật tư trang trí tại cửa hàng tạp hóa kèm theo chữ ký của người đi mua hàng
  - D. Hợp đồng kinh tế và Biên bản nghiệm thu thanh lý dịch vụ thuê âm thanh ánh sáng kèm hóa đơn điện tử
- **Chỉ số đáp án đúng (correctIndex)**: `2` (Phương án C)
- **Giải thích chuyên môn**: Căn cứ Slide 19: Quy chế chi tiêu nội bộ quy định mọi khoản mua sắm hàng hóa, dịch vụ thanh toán từ ngân sách phải có Hóa đơn điện tử GTGT (VAT) xuất đúng tên pháp nhân và MST của Trường ĐH Công nghệ Kỹ thuật TP.HCM kèm biên bản nghiệm thu. Hóa đơn bán lẻ viết tay không có giá trị pháp lý để Phòng Kế hoạch - Tài chính giải ngân quyết toán.

---

### CÂU HỎI 10
- **Mã câu hỏi (ID)**: 10
- **Phân loại mức độ**: Thông hiểu
- **Thời gian đếm ngược**: 15 giây
- **Nội dung câu hỏi**: Nguyên tắc cốt lõi "70/30" khi cán bộ Đoàn – Hội ứng dụng Trí tuệ nhân tạo tạo sinh (GenAI) vào công tác xây dựng kế hoạch và truyền thông là gì?
- **Các phương án lựa chọn**:
  - A. AI thực hiện 70% nội dung chương trình thực tế trên sân khấu, cán bộ Đoàn chỉ điều hành 30% còn lại
  - B. Dành 70% kinh phí tổ chức cho công nghệ AI và 30% kinh phí cho các hoạt động truyền thống
  - C. Tận dụng AI tạo sinh để tăng tốc 70% khối lượng soạn thảo bản nháp sơ bộ, nhưng cán bộ Đoàn phải dành 30% công sức kiểm duyệt chính xác về thể thức, chính trị và số liệu thực tế
  - D. Đăng tải 70% bài viết do AI viết lên Fanpage và 30% bài viết tự viết lên website Đoàn trường
- **Chỉ số đáp án đúng (correctIndex)**: `2` (Phương án C)
- **Giải thích chuyên môn**: Căn cứ Slide 32, 33: Nguyên tắc thực chiến là AI hỗ trợ 70% tốc độ tham mưu và khởi tạo bản nháp (brainstorm, dàn ý, khung kịch bản), nhưng cán bộ Đoàn phải trực tiếp kiểm duyệt 30% quan trọng nhất bao gồm tính chuẩn xác chính trị, thể thức văn bản, định mức nội bộ HCM-UTE và tuyệt đối bảo mật dữ liệu sinh viên.

---

### CÂU HỎI 11
- **Mã câu hỏi (ID)**: 11
- **Phân loại mức độ**: Tình huống thực tế
- **Thời gian đếm ngược**: 15 giây
- **Nội dung câu hỏi**: Đoàn Khoa dự kiến tổ chức Hội thi Học thuật vào ngày Thứ Bảy (ngày 25 của tháng). Theo quy chuẩn quy trình 5 bước tại HCM-UTE, đồng chí Bí thư Đoàn Khoa cần hoàn tất việc trình ký số Kế hoạch và Dự trù kinh phí trên hệ thống UTEOffice Nhà trường muộn nhất vào thời điểm nào?
- **Các phương án lựa chọn**:
  - A. Chiều Thứ Sáu (ngày 24) – trước sự kiện 01 ngày để tránh thay đổi nhân sự
  - B. Ngày 20 của tháng (mốc T-5) – ngay sau khi đăng bài truyền thông trên mạng xã hội
  - C. Ngày 11 đến ngày 13 của tháng (mốc T-12 đến T-14) – trước ngày diễn ra sự kiện tối thiểu 2 tuần
  - D. Ngay trong ngày diễn ra sự kiện (ngày 25) để trình Ban Giám hiệu ký trực tiếp tại Hội trường
- **Chỉ số đáp án đúng (correctIndex)**: `2` (Phương án C)
- **Giải thích chuyên môn**: Căn cứ Slide 18, 34: Quy trình chuẩn quy định mốc T-14 nộp hồ sơ thẩm định và T-12 khởi tạo trình ký số trên UTEOffice Nhà trường (hoàn tất ký số trước sự kiện tối thiểu 2 tuần) để kịp chuyển văn bản đã ký số ở mốc T-10 cho Phòng Quản trị CSVC mở hội trường, máy lạnh, LED và Tổ Bảo vệ bố trí an ninh. Việc nộp sát ngày sẽ bị từ chối phê duyệt.

---

### CÂU HỎI 12
- **Mã câu hỏi (ID)**: 12
- **Phân loại mức độ**: Tình huống thực tế
- **Thời gian đếm ngược**: 15 giây
- **Nội dung câu hỏi**: Đang trong chương trình Talkshow có 400 sinh viên tại Hội trường lớn Khu A, mạng Wi-Fi hội trường đột ngột bị mất kết nối khiến slide thuyết trình lưu trên Canva online không thể tải được. Ban Tổ chức cần áp dụng ngay phương án dự phòng (Plan B) chuẩn mực nào?
- **Các phương án lựa chọn**:
  - A. Tuyên bố tạm dừng chương trình 30 phút để chờ bộ phận mạng khôi phục đường truyền
  - B. Yêu cầu toàn bộ sinh viên trong hội trường tắt 4G trên điện thoại để nhường băng thông cho máy tính ban tổ chức
  - C. MC chủ động giao lưu/kéo giãn thời gian trong khi kỹ thuật chuyển sang file trình chiếu đã tải offline sẵn trên máy tính thứ 2 (hoặc USB dự phòng)
  - D. Hủy bỏ phần trình chiếu slide và yêu cầu diễn giả chỉ phát biểu chay không cần hình ảnh
- **Chỉ số đáp án đúng (correctIndex)**: `2` (Phương án C)
- **Giải thích chuyên môn**: Căn cứ Slide 26: Nguyên tắc an toàn kỹ thuật là không bao giờ chạy sự kiện bằng cách mở file online (Canva, Drive, YouTube); toàn bộ slide/video phải được tải sẵn offline trên ít nhất 02 máy tính độc lập kèm USB dự phòng. Khi gặp sự cố mạng, kỹ thuật chuyển ngay sang file offline trên máy dự phòng, đồng thời MC điều phối giao lưu khéo léo để chương trình không bị gián đoạn.

---

### CÂU HỎI 13
- **Mã câu hỏi (ID)**: 13
- **Phân loại mức độ**: Tình huống thực tế
- **Thời gian đếm ngược**: 15 giây
- **Nội dung câu hỏi**: Trong quá trình thiết kế Backdrop sân khấu và Poster truyền thông cho Ngày hội Thanh niên, một Cộng tác viên Ban Truyền thông sử dụng đồ họa vector bản đồ Việt Nam tải từ website thiết kế nước ngoài. Trước khi xuất bản in ấn và trình chiếu trên màn hình LED, Trưởng Ban Tổ chức phát hiện bản đồ thiếu quần đảo Hoàng Sa và Trường Sa. Cách xử lý ĐÚNG ĐẮN VÀ CHUẨN MỰC NHẤT là gì?
- **Các phương án lựa chọn**:
  - A. Vẫn cho in ấn và trình chiếu bình thường vì đây chỉ là hình ảnh minh họa cách điệu nghệ thuật
  - B. Đình chỉ phát hành ngay lập tức, yêu cầu thay thế bằng bản đồ chuẩn có đầy đủ chủ quyền Hoàng Sa, Trường Sa và thực hiện quy trình kiểm duyệt 2 lớp trước khi in/chiếu
  - C. Chờ đến sau sự kiện mới họp rút kinh nghiệm và nhắc nhở riêng bạn cộng tác viên thiết kế
  - D. Dùng bút màu vẽ thêm hai quần đảo trực tiếp lên bạt in sau khi đã thi công xong trên sân khấu
- **Chỉ số đáp án đúng (correctIndex)**: `1` (Phương án B)
- **Giải thích chuyên môn**: Căn cứ Slide 27: Vấn đề chủ quyền quốc gia (Hoàng Sa - Trường Sa), tên trường mới và biểu trưng Đoàn - Hội là nguyên tắc chính trị bất di bất dịch. Mọi ấn phẩm sai sót chủ quyền biển đảo đều vi phạm nghiêm trọng và phải bị đình chỉ ngay lập tức, sửa chữa chuẩn xác và bắt buộc tuân thủ quy trình kiểm duyệt 2 lớp (Trưởng ban Truyền thông rà soát kỹ thuật -> Thường trực BTC duyệt nội dung) trước khi xuất bản.

---

### CÂU HỎI 14
- **Mã câu hỏi (ID)**: 14
- **Phân loại mức độ**: Tình huống thực tế
- **Thời gian đếm ngược**: 15 giây
- **Nội dung câu hỏi**: Khi tổ chức buổi Tọa đàm định hướng nghề nghiệp, sau khi Diễn giả kết thúc phần chia sẻ, MC mở phần "Hỏi đáp cùng Diễn giả" nhưng dưới hội trường sinh viên e ngại và chưa có ai giơ tay đặt câu hỏi. Ban Tổ chức nên triển khai giải pháp nào đã được chuẩn bị trước trong kịch bản?
- **Các phương án lựa chọn**:
  - A. Tuyên bố kết thúc sớm chương trình vì sinh viên không có nhu cầu hỏi thêm
  - B. Điểm danh ngẫu nhiên mã số sinh viên theo danh sách lớp để chỉ định đứng lên đặt câu hỏi bắt buộc
  - C. Kích hoạt 5–7 "câu hỏi mồi" (Seed questions) đã chuẩn bị trước cho các cán bộ nòng cốt ngồi dưới hội trường đặt câu hỏi, kết hợp mở mã QR Slido/Padlet trên màn hình LED để SV gửi câu hỏi ẩn danh
  - D. Yêu cầu Diễn giả tự đặt câu hỏi và tự trả lời để lấp đầy thời lượng còn lại của chương trình
- **Chỉ số đáp án đúng (correctIndex)**: `2` (Phương án C)
- **Giải thích chuyên môn**: Căn cứ Slide 24 và tài liệu bài giảng: Để giải quyết tình trạng "chết sân khấu" ở phần Q&A, Ban Nội dung luôn chuẩn bị sẵn 5–7 câu hỏi mồi (Seed questions) giao trước cho cán bộ Đoàn nòng cốt ngồi rải rác dưới hội trường phát biểu mào đầu, đồng thời hiển thị mã QR trên màn hình LED để các bạn sinh viên rụt rè có thể gửi câu hỏi ẩn danh qua điện thoại một cách thoải mái.

---

### CÂU HỎI 15
- **Mã câu hỏi (ID)**: 15
- **Phân loại mức độ**: Tình huống thực tế
- **Thời gian đếm ngược**: 15 giây
- **Nội dung câu hỏi**: Sau khi Ngày hội kết thúc được 04 ngày (mốc T+4), một số sinh viên phản ánh đã tham gia sự kiện và quét mã QR check-in nhưng chưa thấy tên trong danh sách ghi nhận Điểm rèn luyện. Đồng chí phụ trách mảng dữ liệu Đoàn – Hội cần thực hiện thao tác nào để xử lý thỏa đáng trước hạn T+5?
- **Các phương án lựa chọn**:
  - A. Từ chối giải quyết vì cho rằng sinh viên đã tự ý rời sự kiện sớm hoặc làm mất dữ liệu cá nhân
  - B. Đối soát dữ liệu điểm danh trên cổng youth.hcmute.edu.vn (thời gian quét, mã vạch, camera/ảnh check-in), lọc trùng và bổ sung chuẩn xác danh sách MSSV trước khi chốt cổng ở ngày T+5
  - C. Đợi đến cuối học kỳ khi Nhà trường xét điểm rèn luyện toàn diện mới tổng hợp và giải quyết khiếu nại một lần
  - D. Cộng điểm rèn luyện tự do cho tất cả các sinh viên nhắn tin khiếu nại mà không cần kiểm tra lại lịch sử điểm danh
- **Chỉ số đáp án đúng (correctIndex)**: `1` (Phương án B)
- **Giải thích chuyên môn**: Căn cứ Slide 28, 30: Mốc T+5 là thời hạn chuẩn hóa và cập nhật chính thức dữ liệu tham gia lên cổng youth.hcmute.edu.vn. Khi có phản hồi, cán bộ phụ trách phải đối soát nhật ký quét mã/check-in trên hệ thống để bảo đảm quyền lợi chính đáng cho sinh viên, giải quyết dứt điểm trước khi chốt danh sách nộp về Trường ở mốc T+7.

---

## V. ĐẶC TẢ TYPESCRIPT / JSON SẴN SÀNG CHO HỆ THỐNG CODE

Dưới đây là mã TypeScript định nghĩa kiểu dữ liệu và hằng số dữ liệu (15 câu hỏi) hoàn chỉnh, tương thích 100% với môi trường Next.js/TypeScript của dự án:

```typescript
export type CognitiveLevel = 'Nhận biết' | 'Thông hiểu' | 'Tình huống thực tế';

export interface QuizQuestion {
  id: number;
  question: string;
  level: CognitiveLevel;
  timeLimit: number; // 15 seconds
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export const TRAINING_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Theo chuyên đề tập huấn cán bộ Đoàn – Hội HCM-UTE, phương châm "20 Chữ Vàng" định hướng thiết kế và thẩm định chất lượng hoạt động bao gồm những tiêu chuẩn nào?',
    level: 'Nhận biết',
    timeLimit: 15,
    options: [
      'Tự nguyện, xung kích – Tiết kiệm, an toàn – Sáng tạo, đổi mới – Gắn kết, rộng khắp – Kịp thời, bền vững',
      'Hấp dẫn, thiết thực – Hiện đại, ngắn gọn – Linh hoạt, đa dạng – Hiệu quả, tiết kiệm – Bền vững, lan tỏa',
      'Đoàn kết, xung phong – Năng động, tự chủ – Kỷ cương, trách nhiệm – Hội nhập, văn minh – Thiết thực, hiệu quả',
      'Cụ thể, khả thi – Đo lường, kịp thời – Linh hoạt, hiện đại – Tiết kiệm, an toàn – Sâu sắc, nhân văn',
    ],
    correctIndex: 1,
    explanation: 'Căn cứ Slide 08 & 09 và tài liệu bài giảng, phương châm "20 Chữ Vàng" gồm 5 tiêu chuẩn cốt lõi: (1) Hấp dẫn – Thiết thực, (2) Hiện đại – Ngắn gọn, (3) Linh hoạt – Đa dạng, (4) Hiệu quả – Tiết kiệm, và (5) Bền vững – Lan tỏa. Đây là bộ lọc thẩm định mọi ý tưởng trước khi lập kế hoạch.',
  },
  {
    id: 2,
    question: 'Theo quy chuẩn thể thức văn bản của Đoàn TNCS Hồ Chí Minh đối với văn bản hành chính do Đoàn trường hoặc Đoàn cơ sở ban hành độc lập, phần tiêu đề góc trên bên phải ghi nội dung gì?',
    level: 'Nhận biết',
    timeLimit: 15,
    options: [
      'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM / Độc lập - Tự do - Hạnh phúc',
      'ĐOÀN TNCS HỒ CHÍ MINH / BAN CHẤP HÀNH TRƯỜNG ĐH CÔNG NGHỆ KỸ THUẬT TP.HCM',
      'ĐOÀN TNCS HỒ CHÍ MINH (in hoa, đậm, không ghi Quốc hiệu Cộng hòa XHCN Việt Nam)',
      'TUỔI TRẺ VIỆT NAM / TIÊN PHONG - BẢN LĨNH - ĐOÀN KẾT - SÁNG TẠO',
    ],
    correctIndex: 2,
    explanation: 'Căn cứ Slide 17 và Hướng dẫn thể thức văn bản Đoàn: Văn bản đơn lẻ do Đoàn ban hành độc lập ở góc phải ghi "ĐOÀN TNCS HỒ CHÍ MINH" (không ghi Quốc hiệu nước CHXHCN Việt Nam; Quốc hiệu chỉ sử dụng khi ban hành Kế hoạch Liên tịch với cơ quan chính quyền/Nhà trường).',
  },
  {
    id: 3,
    question: 'Trong giai đoạn chuẩn bị trước sự kiện (Pre-event), Ban Tổ chức bắt buộc phải hoàn thiện "Bộ 03 Kịch bản" bao gồm những loại kịch bản nào?',
    level: 'Nhận biết',
    timeLimit: 15,
    options: [
      'Kịch bản Truyền thông, Kịch bản Khảo sát ý kiến và Kịch bản Họp báo',
      'Kịch bản Tổng thể (Master Agenda), Kịch bản Lời dẫn MC (MC Script) và Kịch bản Kỹ thuật (Technical Cue Sheet)',
      'Kịch bản Đón tiếp VIP, Kịch bản Trò chơi Minigame và Kịch bản Báo cáo quyết toán',
      'Kịch bản Sân khấu hóa, Kịch bản Phân cảnh TikTok và Kịch bản Chấm thi giám khảo',
    ],
    correctIndex: 1,
    explanation: 'Căn cứ Slide 21 và tài liệu bài giảng: Bộ 03 kịch bản bắt buộc trước giờ G gồm: (1) Kịch bản Tổng thể (Master Agenda/Timeline), (2) Kịch bản Lời dẫn MC (MC Script), và (3) Kịch bản Kỹ thuật (Technical Cue Sheet) để đồng bộ từng giây phút giữa Sân khấu – Âm thanh – Ánh sáng – Màn hình LED – Lễ tân.',
  },
  {
    id: 4,
    question: 'Theo Quy tắc vàng "T+7" khép kín quy trình sau sự kiện tại HCM-UTE, mốc thời gian T+5 quy định thực hiện đầu việc nào?',
    level: 'Nhận biết',
    timeLimit: 15,
    options: [
      'Đăng bài viết Recap truyền thông và gửi Thư cảm ơn đến Nhà tài trợ, Diễn giả',
      'Tổ chức cuộc họp rút kinh nghiệm Ban Tổ chức (After Action Review - AAR)',
      'Rà soát, chuẩn hóa danh sách MSSV tham dự và cập nhật lên hệ thống để ghi nhận Điểm rèn luyện / CTXH',
      'Nộp toàn bộ hồ sơ thanh quyết toán và hóa đơn điện tử về Phòng Kế hoạch - Tài chính',
    ],
    correctIndex: 2,
    explanation: 'Căn cứ Slide 28: Quy tắc T+7 phân định: T+1 gửi Thư cảm ơn & đăng bài Recap trong 24h; T+3 họp rút kinh nghiệm BTC (AAR); T+5 chuẩn hóa danh sách MSSV cập nhật lên youth.hcmute.edu.vn để bảo đảm quyền lợi ĐRL/CTXH cho sinh viên; T+7 hoàn tất hồ sơ quyết toán kinh phí.',
  },
  {
    id: 5,
    question: 'Trong hệ sinh thái chuyển đổi số của Đoàn – Hội HCM-UTE, nền tảng nào đóng vai trò tiếp nhận minh chứng và đánh giá xếp loại thi đua định kỳ của các cơ sở trực thuộc?',
    level: 'Nhận biết',
    timeLimit: 15,
    options: [
      'youth.hcmute.edu.vn',
      'thiduatuoitre.hcmute.edu.vn',
      'nhatro.hcmute.edu.vn',
      'UTEOffice (qlvb.hcmute.edu.vn)',
    ],
    correctIndex: 1,
    explanation: 'Căn cứ Slide 30 và tài liệu bài giảng: Ba nền tảng số cốt lõi gồm: UTEOffice (trình ký số văn bản hành chính Nhà trường), youth.hcmute.edu.vn (quản lý hồ sơ đoàn viên, đăng ký sự kiện, điểm danh QR, điểm rèn luyện), và thiduatuoitre.hcmute.edu.vn (số hóa nộp minh chứng và chấm điểm thi đua cơ sở).',
  },
  {
    id: 6,
    question: 'Khi xây dựng kế hoạch hoạt động Đoàn – Hội, yếu tố "2C" và "5M" bổ sung cho ma trận "5W1H" nhằm mục đích trọng tâm nào?',
    level: 'Thông hiểu',
    timeLimit: 15,
    options: [
      'Tăng số lượng trang văn bản để thuyết phục các đơn vị tài trợ doanh nghiệp',
      'Thiết lập cơ chế kiểm soát tiến độ, tiêu chí nghiệm thu (2C) và bảo đảm cân đối đầy đủ 5 nguồn lực thực thi (5M)',
      'Phân chia quyền hạn giữa Đoàn Thanh niên và Hội Sinh viên trong các hoạt động liên tịch',
      'Giúp chuyển đổi toàn bộ nội dung kế hoạch thành mã lệnh tự động hóa trên hệ thống máy chủ',
    ],
    correctIndex: 1,
    explanation: 'Căn cứ Slide 14: 5W1H định hình khung nội dung (Làm gì, Ở đâu, Khi nào...), còn 2C (Control - Kiểm soát tiến độ & Check - Nghiệm thu/Bảng kiểm) và 5M (Man, Money, Material, Machine/Method, Minute) bảo đảm cơ chế giám sát chất lượng và cân đối đầy đủ 5 nguồn lực cốt lõi để kế hoạch không bị vỡ trận khi thực thi.',
  },
  {
    id: 7,
    question: 'Tại sao cán bộ Đoàn – Hội HCM-UTE cần đặc biệt lưu ý sự khác biệt giữa "Năm học" và "Năm tài chính" khi lập dự trù kinh phí cho các hoạt động trong Học kỳ I?',
    level: 'Thông hiểu',
    timeLimit: 15,
    options: [
      'Vì sinh viên chỉ đóng Đoàn phí vào Học kỳ II nên Học kỳ I không được phép chi tiêu ngân sách',
      'Vì năm tài chính Nhà trường tính theo năm Dương lịch (khóa sổ vào tháng 12), đòi hỏi các hoạt động HK1 phải hoàn tất dự trù và thanh quyết toán trước mốc này',
      'Vì mọi hoạt động trong Học kỳ I bắt buộc phải sử dụng 100% nguồn tài trợ xã hội hóa từ doanh nghiệp',
      'Vì Phòng Kế hoạch - Tài chính chỉ tiếp nhận hồ sơ thanh toán duy nhất 1 lần vào cuối năm học (tháng 8)',
    ],
    correctIndex: 1,
    explanation: 'Căn cứ Slide 12: Năm học kéo dài từ tháng 9 đến tháng 8 năm sau, nhưng năm tài chính của Nhà trường tính theo năm Dương lịch (tháng 1 đến tháng 12). Vào khoảng giữa/cuối tháng 12, Nhà trường khóa sổ quyết toán năm tài chính, nên các hoạt động HK1 (đặc biệt tháng 11, 12 và chuẩn bị Xuân Tình Nguyện) phải khẩn trương hoàn thành hồ sơ giải ngân trước khi hệ thống khóa sổ.',
  },
  {
    id: 8,
    question: 'Trong thời gian diễn ra một sự kiện lớn tại Hội trường, tại sao Trưởng Ban Tổ chức (hoặc Tổng Đạo diễn / Stage Manager) không nên trực tiếp tham gia chạy các việc sự vụ (như bê nước, chỉnh slide, đón khách)?',
    level: 'Thông hiểu',
    timeLimit: 15,
    options: [
      'Vì quy định lễ tân không cho phép Trưởng Ban Tổ chức xuất hiện trước mặt khách mời',
      'Để tập trung giữ vị trí bao quát toàn cảnh, giữ liên lạc bộ đàm/mạng nội bộ điều phối nhịp nhàng 4 Tổ tác chiến và xử lý kịp thời các tình huống phát sinh',
      'Vì Trưởng Ban Tổ chức chỉ chịu trách nhiệm ở khâu viết kế hoạch, khâu thực hiện thuộc về các Phó Bí thư Đoàn',
      'Để dành toàn bộ thời gian chụp ảnh kỷ niệm và đăng bài trực tiếp lên các kênh mạng xã hội cá nhân',
    ],
    correctIndex: 1,
    explanation: 'Căn cứ Slide 23: Nguyên tắc điều phối hiện trường là "Một người chỉ huy – Bốn mũi giáp công". Trưởng BTC đóng vai trò Tổng Đạo diễn bao quát toàn bộ sự kiện, liên lạc chỉ đạo 4 Tổ trưởng (Lễ tân, Sân khấu, Media, Hậu cần/An ninh). Nếu sa đà vào chạy việc vặt, người chỉ huy sẽ mất góc nhìn tổng quan và không thể xử lý khi xảy ra sự cố đột xuất.',
  },
  {
    id: 9,
    question: 'Khoản chi nào sau đây từ nguồn kinh phí hỗ trợ của Nhà trường/Đoàn trường bị coi là KHÔNG HỢP LỆ khi nộp hồ sơ quyết toán tài chính?',
    level: 'Thông hiểu',
    timeLimit: 15,
    options: [
      'Hóa đơn điện tử VAT mua văn phòng phẩm có đầy đủ thông tin pháp nhân và Mã số thuế của Trường ĐH Công nghệ Kỹ thuật TP.HCM',
      'Phiếu chi tiền thưởng có danh sách ký nhận đầy đủ Họ tên, MSSV, tên giải thưởng và chữ ký sống của sinh viên đạt giải',
      'Hóa đơn bán lẻ viết tay mua vật tư trang trí tại cửa hàng tạp hóa kèm theo chữ ký của người đi mua hàng',
      'Hợp đồng kinh tế và Biên bản nghiệm thu thanh lý dịch vụ thuê âm thanh ánh sáng kèm hóa đơn điện tử',
    ],
    correctIndex: 2,
    explanation: 'Căn cứ Slide 19: Quy chế chi tiêu nội bộ quy định mọi khoản mua sắm hàng hóa, dịch vụ thanh toán từ ngân sách phải có Hóa đơn điện tử GTGT (VAT) xuất đúng tên pháp nhân và MST của Trường ĐH Công nghệ Kỹ thuật TP.HCM kèm biên bản nghiệm thu. Hóa đơn bán lẻ viết tay không có giá trị pháp lý để Phòng Kế hoạch - Tài chính giải ngân quyết toán.',
  },
  {
    id: 10,
    question: 'Nguyên tắc cốt lõi "70/30" khi cán bộ Đoàn – Hội ứng dụng Trí tuệ nhân tạo tạo sinh (GenAI) vào công tác xây dựng kế hoạch và truyền thông là gì?',
    level: 'Thông hiểu',
    timeLimit: 15,
    options: [
      'AI thực hiện 70% nội dung chương trình thực tế trên sân khấu, cán bộ Đoàn chỉ điều hành 30% còn lại',
      'Dành 70% kinh phí tổ chức cho công nghệ AI và 30% kinh phí cho các hoạt động truyền thống',
      'Tận dụng AI tạo sinh để tăng tốc 70% khối lượng soạn thảo bản nháp sơ bộ, nhưng cán bộ Đoàn phải dành 30% công sức kiểm duyệt chính xác về thể thức, chính trị và số liệu thực tế',
      'Đăng tải 70% bài viết do AI viết lên Fanpage và 30% bài viết tự viết lên website Đoàn trường',
    ],
    correctIndex: 2,
    explanation: 'Căn cứ Slide 32, 33: Nguyên tắc thực chiến là AI hỗ trợ 70% tốc độ tham mưu và khởi tạo bản nháp (brainstorm, dàn ý, khung kịch bản), nhưng cán bộ Đoàn phải trực tiếp kiểm duyệt 30% quan trọng nhất bao gồm tính chuẩn xác chính trị, thể thức văn bản, định mức nội bộ HCM-UTE và tuyệt đối bảo mật dữ liệu sinh viên.',
  },
  {
    id: 11,
    question: 'Đoàn Khoa dự kiến tổ chức Hội thi Học thuật vào ngày Thứ Bảy (ngày 25 của tháng). Theo quy chuẩn quy trình 5 bước tại HCM-UTE, đồng chí Bí thư Đoàn Khoa cần hoàn tất việc trình ký số Kế hoạch và Dự trù kinh phí trên hệ thống UTEOffice Nhà trường muộn nhất vào thời điểm nào?',
    level: 'Tình huống thực tế',
    timeLimit: 15,
    options: [
      'Chiều Thứ Sáu (ngày 24) – trước sự kiện 01 ngày để tránh thay đổi nhân sự',
      'Ngày 20 của tháng (mốc T-5) – ngay sau khi đăng bài truyền thông trên mạng xã hội',
      'Ngày 11 đến ngày 13 của tháng (mốc T-12 đến T-14) – trước ngày diễn ra sự kiện tối thiểu 2 tuần',
      'Ngay trong ngày diễn ra sự kiện (ngày 25) để trình Ban Giám hiệu ký trực tiếp tại Hội trường',
    ],
    correctIndex: 2,
    explanation: 'Căn cứ Slide 18, 34: Quy trình chuẩn quy định mốc T-14 nộp hồ sơ thẩm định và T-12 khởi tạo trình ký số trên UTEOffice Nhà trường (hoàn tất ký số trước sự kiện tối thiểu 2 tuần) để kịp chuyển văn bản đã ký số ở mốc T-10 cho Phòng Quản trị CSVC mở hội trường, máy lạnh, LED và Tổ Bảo vệ bố trí an ninh. Việc nộp sát ngày sẽ bị từ chối phê duyệt.',
  },
  {
    id: 12,
    question: 'Đang trong chương trình Talkshow có 400 sinh viên tại Hội trường lớn Khu A, mạng Wi-Fi hội trường đột ngột bị mất kết nối khiến slide thuyết trình lưu trên Canva online không thể tải được. Ban Tổ chức cần áp dụng ngay phương án dự phòng (Plan B) chuẩn mực nào?',
    level: 'Tình huống thực tế',
    timeLimit: 15,
    options: [
      'Tuyên bố tạm dừng chương trình 30 phút để chờ bộ phận mạng khôi phục đường truyền',
      'Yêu cầu toàn bộ sinh viên trong hội trường tắt 4G trên điện thoại để nhường băng thông cho máy tính ban tổ chức',
      'MC chủ động giao lưu/kéo giãn thời gian trong khi kỹ thuật chuyển sang file trình chiếu đã tải offline sẵn trên máy tính thứ 2 (hoặc USB dự phòng)',
      'Hủy bỏ phần trình chiếu slide và yêu cầu diễn giả chỉ phát biểu chay không cần hình ảnh',
    ],
    correctIndex: 2,
    explanation: 'Căn cứ Slide 26: Nguyên tắc an toàn kỹ thuật là không bao giờ chạy sự kiện bằng cách mở file online (Canva, Drive, YouTube); toàn bộ slide/video phải được tải sẵn offline trên ít nhất 02 máy tính độc lập kèm USB dự phòng. Khi gặp sự cố mạng, kỹ thuật chuyển ngay sang file offline trên máy dự phòng, đồng thời MC điều phối giao lưu khéo léo để chương trình không bị gián đoạn.',
  },
  {
    id: 13,
    question: 'Trong quá trình thiết kế Backdrop sân khấu và Poster truyền thông cho Ngày hội Thanh niên, một Cộng tác viên Ban Truyền thông sử dụng đồ họa vector bản đồ Việt Nam tải từ website thiết kế nước ngoài. Trước khi xuất bản in ấn và trình chiếu trên màn hình LED, Trưởng Ban Tổ chức phát hiện bản đồ thiếu quần đảo Hoàng Sa và Trường Sa. Cách xử lý ĐÚNG ĐẮN VÀ CHUẨN MỰC NHẤT là gì?',
    level: 'Tình huống thực tế',
    timeLimit: 15,
    options: [
      'Vẫn cho in ấn và trình chiếu bình thường vì đây chỉ là hình ảnh minh họa cách điệu nghệ thuật',
      'Đình chỉ phát hành ngay lập tức, yêu cầu thay thế bằng bản đồ chuẩn có đầy đủ chủ quyền Hoàng Sa, Trường Sa và thực hiện quy trình kiểm duyệt 2 lớp trước khi in/chiếu',
      'Chờ đến sau sự kiện mới họp rút kinh nghiệm và nhắc nhở riêng bạn cộng tác viên thiết kế',
      'Dùng bút màu vẽ thêm hai quần đảo trực tiếp lên bạt in sau khi đã thi công xong trên sân khấu',
    ],
    correctIndex: 1,
    explanation: 'Căn cứ Slide 27: Vấn đề chủ quyền quốc gia (Hoàng Sa - Trường Sa), tên trường mới và biểu trưng Đoàn - Hội là nguyên tắc chính trị bất di bất dịch. Mọi ấn phẩm sai sót chủ quyền biển đảo đều vi phạm nghiêm trọng và phải bị đình chỉ ngay lập tức, sửa chữa chuẩn xác và bắt buộc tuân thủ quy trình kiểm duyệt 2 lớp (Trưởng ban Truyền thông rà soát kỹ thuật -> Thường trực BTC duyệt nội dung) trước khi xuất bản.',
  },
  {
    id: 14,
    question: 'Khi tổ chức buổi Tọa đàm định hướng nghề nghiệp, sau khi Diễn giả kết thúc phần chia sẻ, MC mở phần "Hỏi đáp cùng Diễn giả" nhưng dưới hội trường sinh viên e ngại và chưa có ai giơ tay đặt câu hỏi. Ban Tổ chức nên triển khai giải pháp nào đã được chuẩn bị trước trong kịch bản?',
    level: 'Tình huống thực tế',
    timeLimit: 15,
    options: [
      'Tuyên bố kết thúc sớm chương trình vì sinh viên không có nhu cầu hỏi thêm',
      'Điểm danh ngẫu nhiên mã số sinh viên theo danh sách lớp để chỉ định đứng lên đặt câu hỏi bắt buộc',
      'Kích hoạt 5–7 "câu hỏi mồi" (Seed questions) đã chuẩn bị trước cho các cán bộ nòng cốt ngồi dưới hội trường đặt câu hỏi, kết hợp mở mã QR Slido/Padlet trên màn hình LED để SV gửi câu hỏi ẩn danh',
      'Yêu cầu Diễn giả tự đặt câu hỏi và tự trả lời để lấp đầy thời lượng còn lại của chương trình',
    ],
    correctIndex: 2,
    explanation: 'Căn cứ Slide 24 và tài liệu bài giảng: Để giải quyết tình trạng "chết sân khấu" ở phần Q&A, Ban Nội dung luôn chuẩn bị sẵn 5–7 câu hỏi mồi (Seed questions) giao trước cho cán bộ Đoàn nòng cốt ngồi rải rác dưới hội trường phát biểu mào đầu, đồng thời hiển thị mã QR trên màn hình LED để các bạn sinh viên rụt rè có thể gửi câu hỏi ẩn danh qua điện thoại một cách thoải mái.',
  },
  {
    id: 15,
    question: 'Sau khi Ngày hội kết thúc được 04 ngày (mốc T+4), một số sinh viên phản ánh đã tham gia sự kiện và quét mã QR check-in nhưng chưa thấy tên trong danh sách ghi nhận Điểm rèn luyện. Đồng chí phụ trách mảng dữ liệu Đoàn – Hội cần thực hiện thao tác nào để xử lý thỏa đáng trước hạn T+5?',
    level: 'Tình huống thực tế',
    timeLimit: 15,
    options: [
      'Từ chối giải quyết vì cho rằng sinh viên đã tự ý rời sự kiện sớm hoặc làm mất dữ liệu cá nhân',
      'Đối soát dữ liệu điểm danh trên cổng youth.hcmute.edu.vn (thời gian quét, mã vạch, camera/ảnh check-in), lọc trùng và bổ sung chuẩn xác danh sách MSSV trước khi chốt cổng ở ngày T+5',
      'Đợi đến cuối học kỳ khi Nhà trường xét điểm rèn luyện toàn diện mới tổng hợp và giải quyết khiếu nại một lần',
      'Cộng điểm rèn luyện tự do cho tất cả các sinh viên nhắn tin khiếu nại mà không cần kiểm tra lại lịch sử điểm danh',
    ],
    correctIndex: 1,
    explanation: 'Căn cứ Slide 28, 30: Mốc T+5 là thời hạn chuẩn hóa và cập nhật chính thức dữ liệu tham gia lên cổng youth.hcmute.edu.vn. Khi có phản hồi, cán bộ phụ trách phải đối soát nhật ký quét mã/check-in trên hệ thống để bảo đảm quyền lợi chính đáng cho sinh viên, giải quyết dứt điểm trước khi chốt danh sách nộp về Trường ở mốc T+7.',
  },
];
```

---

## VI. BẢNG KIỂM TRA ĐỐI CHIẾU TIÊU CHÍ CHẤP NHẬN (ACCEPTANCE CRITERIA AUDIT)

| Tiêu chuẩn chấp nhận | Kết quả kiểm tra | Đánh giá |
|---|---|:---:|
| Đúng 15 câu hỏi trắc nghiệm tiếng Việt chuẩn xác | Đúng 15 câu (ID 1 đến 15), tiếng Việt chuẩn dấu Unicode, không lỗi chính tả | **ĐẠT (15/15)** |
| Trích xuất từ tài liệu thực tế `D:\DU LIEU DOAN TRUONG\BTV ĐOÀN TRƯỜNG 21` | Toàn bộ câu hỏi trích xuất từ 34 Slide và 344 đoạn DOCX bài giảng chính thức của Đ/c Lê Xuân Thân | **ĐẠT (100% tài liệu thật)** |
| Phân bổ 3 mức độ nhận thức | 5 câu Nhận biết (33.3%), 5 câu Thông hiểu (33.3%), 5 câu Tình huống thực tế (33.3%) | **ĐẠT (Cân bằng 1:1:1)** |
| Đầy đủ cấu trúc trường dữ liệu | Mỗi câu có `id`, `question`, `level`, `timeLimit: 15`, `options` (đúng 4 chuỗi), `correctIndex` (0-3), `explanation` | **ĐẠT (100% khớp schema)** |
| Thời gian đếm ngược 15 giây | Tất cả 15 câu đều có thuộc tính `timeLimit: 15` | **ĐẠT (15s cố định)** |
| Giải thích ngắn bám sát bài giảng | Mỗi câu đều có phần giải thích chuyên môn trích dẫn chính xác số Slide, căn cứ thực tiễn | **ĐẠT** |
| Định dạng TypeScript / JSON sẵn sàng | Cung cấp mã TypeScript đầy đủ kiểu dữ liệu, sẵn sàng import trực tiếp vào module quiz game | **ĐẠT** |
