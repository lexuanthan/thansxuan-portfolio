# HỆ THỐNG THIẾT KẾ — HCMUTE AI CAREER DECISION INTELLIGENCE PLATFORM
## Phiên bản: 6.0 (HCMUTE Academic-Tech & Future-Oriented Intelligence)
*Ngôn ngữ thị giác: Mang bản sắc HCMUTE, hiện đại, trẻ trung, năng động, sang trọng và đáng tin cậy*

---

### 1. Triết lý Bản sắc & Tỷ lệ Màu sắc (HCMUTE Brand Identity)

Màu sắc của nền tảng phản ánh tinh thần trường Đại học Sư phạm Kỹ thuật TP.HCM (HCMUTE) — cái nôi đào tạo kỹ thuật, công nghệ và đổi mới sáng tạo hàng đầu Việt Nam.

#### 1.1 Nguyên tắc Phối màu Cốt lõi
* **Xanh là nền tảng (Foundation):** Tạo cảm giác học thuật vững chãi, công nghệ tương lai và uy tín khoa học.
* **Đỏ là điểm nhấn (Accent):** Mang ngọn lửa nhiệt huyết, năng động tuổi trẻ và hành động bứt phá.
* **Trắng tạo khoảng thở (Breathing Space):** Chiếm đa số diện tích giúp giao diện thoáng đãng, sang trọng, không ngột ngạt.
* **Quy tắc bất biến:** Tuyệt đối không để giao diện biến thành "đỏ chủ đạo".

#### 1.2 Tỉ lệ Phối màu Chuẩn Hệ thống
* **65% White / Light:** Nền canvas (`#F8FAFC`, `#FFFFFF`), khoảng đệm và card bề mặt.
* **20–25% HCMUTE Blue:** Thanh điều hướng hành trình, tiêu đề, nút hành động chính, đường viền tương thích.
* **5–10% HCMUTE Red:** Huy hiệu điểm nhấn, tag trọng điểm công nghệ, chỉ báo khoảng trống quan trọng.
* **5–10% Neutral / Sky / Soft Tint:** Các màu bổ trợ xám mát, xanh da trời nhẹ và nền đỏ nhạt.

#### 1.3 Bảng mã Màu Chi tiết (Hex & CSS Tokens)
```css
/* PRIMARY: HCMUTE Academic Blue */
--color-brand-50:  #e6f0fa;
--color-brand-100: #cce0f5;
--color-brand-500: #0056b3;
--color-brand-600: #004098; /* HCMUTE Official Blue */
--color-brand-700: #00337a;
--color-brand-900: #0a2540;

/* ACCENT: HCMUTE Energetic Red */
--color-accent-red-50:  #fdf2f2;
--color-accent-red-100: #fce4e4;
--color-accent-red-500: #e53935;
--color-accent-red-600: #d9232e; /* HCMUTE Official Red */
--color-accent-red-700: #b71c1c;

/* SUPPORT & NEUTRALS */
--color-surface:       #ffffff;
--color-surface-soft:  #f8fafc;
--color-canvas:        #f1f5f9;
--color-line:          #e2e8f0;
--color-ink-900:       #0f172a;
--color-ink-700:       #334155;
--color-ink-500:       #64748b;
```

---

### 2. Hình học & Bo góc Tinh tế (Border Radius Architecture)

Giảm mạnh độ bo tròn so với các UI hoạt hình bong bóng (bubble-style) trước đây để đạt tới sự tinh gọn, chuẩn mực học thuật – kỹ thuật cao cấp:

| Thành phần giao diện | Border Radius Chuẩn v6.0 | Lớp áp dụng Tailwind |
| :--- | :--- | :--- |
| **Button / Input / Badge** | `8px – 12px` | `rounded-[8px]` hoặc `rounded-[10px]` |
| **Card / Milestone Item** | `10px – 14px` | `rounded-[12px]` |
| **Panel / Modal / Drawer** | `12px – 16px` | `rounded-[14px]` |
| **Hero Banner / Shell Shell** | `16px – 20px` | `rounded-[16px]` |

---

### 3. Hệ thống Kiểu chữ (Typography Scale)

*Font chữ chính: **Be Vietnam Pro** (kết hợp Inter / Plus Jakarta Sans).*
Độ hỗ trợ dấu tiếng Việt 100%, chuẩn xác, sắc nét trên mọi mật độ điểm ảnh.

| Cấp độ | Kích thước / Chiều cao dòng | Độ đậm | Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| **Display** | 36px – 44px / 1.2 | Black (900) | Điểm số tổng quan, Tiêu đề Hero chính |
| **H1** | 24px – 28px / 1.25 | ExtraBold (800) | Tiêu đề màn hình chặng, Báo cáo |
| **H2** | 20px – 22px / 1.3 | Bold (700) | Tiêu đề khối tính năng, Nhóm kỹ năng |
| **H3** | 16px – 18px / 1.35 | Bold (700) | Tên nghề nghiệp, Tên trường ĐH |
| **Section Title** | 14px – 15px / 1.4 | SemiBold (600) | Tiêu đề phân đoạn, Nhãn tiêu chí |
| **Card Title** | 14px – 15px / 1.4 | Bold (700) | Tiêu đề thẻ con, Mục nhiệm vụ |
| **Body** | 13px – 14px / 1.55 | Regular / Medium | Văn bản phân tích, lời khuyên AI Coach |
| **Small / Caption** | 11px – 12px / 1.4 | SemiBold (600) | Thẻ tag môn học, mức lương, mã ngành |
| **Metric** | 18px – 24px / 1.1 | ExtraBold (800) | Điểm chuẩn, % tương thích, thời lượng |

---

### 4. Hệ thống Iconography & Brand Mark (Lucide-Style SVG)

* **Quy chuẩn duy nhất:** Dùng một hệ SVG Lucide-style thống nhất trong tệp `CareerIcons.tsx`.
* **Tuyệt đối không dùng emoji** làm icon điều hướng hoặc chức năng chính.
* **Biểu trưng học thuật `HcmuteBrandMark`:** Thiết kế SVG vector chuyên biệt kết hợp bánh răng kỹ thuật, trang sách học thuật, nhân AI trung tâm và góc vát cờ đỏ HCMUTE.

---

### 5. Hệ thống 26 Reusable Components (Section 12)

Tất cả 26 component được xuất khẩu và đóng gói tại `src/components/career-guidance/ui/index.tsx`:

1. `Button`: Nút bấm với 4 variant (`primary`, `secondary`, `accent`, `ghost`), 3 size (`sm`, `md`, `lg`).
2. `IconButton`: Nút bấm vuông bo góc cho thao tác nhanh (Bookmark, Đóng, Lọc).
3. `Card`: Khung thẻ bề mặt chuẩn 10-14px với hiệu ứng hover nâng nhẹ.
4. `MetricCard`: Thẻ hiển thị chỉ số đo lường kèm nhãn phụ và biểu tượng.
5. `QuestionCard`: Khối câu hỏi trắc nghiệm đánh giá năng lực & giá trị.
6. `CareerCard`: Thẻ hiển thị nghề nghiệp, mức lương, độ khớp và rủi ro AI.
7. `MajorCard`: Thẻ ngành đào tạo, độ khó học phần và môn trọng tâm.
8. `UniversityCard`: Thẻ trường đại học 5 trục và chỉ số tuyển sinh.
9. `JourneyStep`: Nút bấm chặng hành trình với 5 trạng thái động.
10. `InsightCard`: Khối thông tin đúc kết trực quan.
11. `AIInsightCard`: Hộp nhận định chuyên sâu từ AI Coach có viền công nghệ.
12. `RecommendationCard`: Khối đề xuất bước đi tiếp theo.
13. `ComparisonCard`: Khối đối sánh trực tiếp 2-3 phương án.
14. `Progress`: Thanh đo tiến độ mượt mà hỗ trợ nhiều sắc độ.
15. `Badge`: Huy hiệu trạng thái chuẩn HCMUTE Blue/Red/Emerald/Slate.
16. `Tabs`: Thanh chuyển tab tinh giản 8-10px border radius.
17. `Modal`: Hộp thoại tương tác nổi có backdrop làm mờ nhẹ.
18. `Drawer`: Khung trượt bảng điều khiển chuyên sâu.
19. `Tooltip`: Chú thích giải nghĩa thuật ngữ học thuật.
20. `Toast`: Thông báo nổi phản hồi thao tác.
21. `Skeleton`: Khung tải giả lập mượt mà không giật layout.
22. `EmptyState`: Trạng thái trống gợi ý hành động hữu ích.
23. `MatchGauge`: Đồng hồ đo tương thích hình tròn SVG phân tầng màu sắc.
24. `SkillBar`: Thanh so sánh năng lực hiện tại vs tiêu chuẩn nghề.
25. `RoadmapNode`: Nút mốc lộ trình trong sơ đồ hành động 5 giai đoạn.
26. `ReportSection`: Phân đoạn tiêu chuẩn trong hồ sơ báo cáo in ấn A4.

---

### 6. Thời gian & Phản hồi Vi mô (Micro-interactions)

* **Hover:** 150–200ms (`transition-all duration-200 ease-out`).
* **Selection:** 180–250ms (Border chuyển đổi, nhãn đổi màu tức thì).
* **Success / Completion:** 250–400ms (Hiệu ứng mở khóa thành tựu nhẹ nhàng).
* **Không dùng hiệu ứng chuyển động liên tục gây mất tập trung.**
