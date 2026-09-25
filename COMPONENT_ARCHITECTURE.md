# KIẾN TRÚC THÀNH PHẦN (COMPONENT ARCHITECTURE)
## Nền tảng: HCMUTE AI Career Decision Intelligence Platform (Phiên bản 6.0)

---

### 1. Phân Tầng Cấu Trúc Thành Phần (Component Hierarchy)

Hệ thống được module hóa toàn diện, đảm bảo nguyên tắc DRY (Don't Repeat Yourself), nhất quán trải nghiệm trên toàn bộ 10 chặng và tương thích 100% WCAG AA:

```
src/components/career-guidance/
├── CareerGuidanceApp.tsx           # Master App Shell (Header, Navigation, Global Search, Notifications, Modals)
├── CareerGuidanceHeroSection.tsx   # Khối giới thiệu Hero HCMUTE trên Trang Chủ
│
├── common/                         # Các nguyên tử điều hướng & biểu đồ chung
│   ├── CareerIcons.tsx             # Hệ thống 30+ icon Lucide-style SVG thuần + HcmuteBrandMark
│   ├── JourneyProgressBar.tsx      # Thanh tiến trình 10 chặng sự nghiệp (5 trạng thái động)
│   ├── LevelBadge.tsx              # Huy hiệu 6 cấp bậc tiến hóa & XP
│   ├── MetricGauge.tsx             # Đồng hồ đo độ tương thích % phân tầng màu
│   ├── RadarChart.tsx              # Biểu đồ Radar SVG 8 trục Career DNA thuần
│   └── SmartNextAction.tsx         # Khối dẫn dắt thông minh cuối mỗi màn hình
│
├── ui/                             # Bộ 26 Thành phần Tái sử dụng Chuẩn hóa (Section 12)
│   └── index.tsx                   # Button, Card, MatchGauge, SkillBar, RoadmapNode, AIInsightCard, Tabs...
│
└── views/                          # 10 Màn hình trải nghiệm & Hộp thoại chức năng
    ├── LandingView.tsx             # Career Command Center (Tổng quan & 4 đối tượng)
    ├── AssessmentView.tsx          # Career Discovery Quest (7 chặng trắc nghiệm card-based)
    ├── ProfileView.tsx             # Career DNA Visual Map (8 trục năng lực & Jungian)
    ├── MatchesView.tsx             # Kết quả so khớp tất định giải thích được
    ├── CareerExplorerView.tsx      # Khám phá 80+ nghề nghiệp chuyên sâu & rủi ro AI
    ├── MajorExplorerView.tsx       # Khám phá 60+ ngành đại học & môn trọng tâm
    ├── UniversityExplorerView.tsx  # Bản đồ chọn trường 5 trục & định vị HCMUTE
    ├── CompareView.tsx             # Ma trận đối sánh trực diện đa chiều
    ├── SkillGapView.tsx            # Phân tích khoảng trống kỹ năng & 3 thử nghiệm vi mô
    ├── RoadmapView.tsx             # Kế hoạch hành động 5 giai đoạn từ 7 ngày -> 1 năm
    ├── AiCoachView.tsx             # Cố vấn AI nhận biết ngữ cảnh thời gian thực
    ├── SavedView.tsx               # Decision Workspace Shortlist (Mục đã lưu)
    ├── ReportModal.tsx             # Báo cáo Executive Career Intelligence Report (In A4 & HTML)
    ├── ConsultationModal.tsx       # Đăng ký tư vấn 1-1 chuyên sâu cùng chuyên gia
    └── OnboardingModal.tsx         # Thiết lập bối cảnh ban đầu (Cấp học, Điểm thi, Học phí)
```

---

### 2. Danh Mục 26 Thành Phần Dùng Chung (Reusable Component System)

Tất cả thành phần được triển khai tại `src/components/career-guidance/ui/index.tsx`:

| STT | Tên Component | Mục đích sử dụng | Biến thể / Thuộc tính chính |
| :---: | :--- | :--- | :--- |
| **1** | `Button` | Nút bấm thao tác chính & phụ | `variant`: primary, secondary, accent, ghost; `size`: sm, md, lg |
| **2** | `IconButton` | Nút icon thao tác nhanh | `variant`, `size`, `aria-label` bắt buộc cho a11y |
| **3** | `Card` | Khung hiển thị nội dung | Bo góc 10–14px (`rounded-[12px]`), border mỏng, shadow-soft |
| **4** | `MetricCard` | Thẻ chỉ số kèm nhãn | Hiển thị % tương thích, mức lương, điểm chuẩn, số lượng ngành |
| **5** | `QuestionCard` | Khối câu hỏi trắc nghiệm | Hỗ trợ chọn đơn / chọn đa, chỉ báo tiến độ và micro-interaction |
| **6** | `CareerCard` | Thẻ nghề nghiệp | Tiêu đề, ngành nghề, dải lương VN, rủi ro AI, nút bookmark |
| **7** | `MajorCard` | Thẻ ngành đào tạo | Mã ngành, độ khó học phần, môn trọng tâm, điểm chuẩn TB |
| **8** | `UniversityCard` | Thẻ trường đại học | Khu vực, loại hình trường, học phí, phân nhóm Safe/Target/Reach |
| **9** | `JourneyStep` | Nút bước chặng hành trình | 5 trạng thái: `completed`, `current`, `available`, `recommended`, `locked` |
| **10** | `InsightCard` | Khối đúc kết thông tin | Nổi bật nhận định then chốt về xu hướng nghề nghiệp |
| **11** | `AIInsightCard` | Hộp khuyến nghị từ AI Coach | Viền công nghệ, chỉ báo AI pulse, phân tích ưu tiên |
| **12** | `RecommendationCard` | Thẻ hành động gợi ý | Nút chuyển màn hình thông minh kế tiếp |
| **13** | `ComparisonCard` | Khối so sánh phương án | Cột so sánh trong ma trận đối đầu |
| **14** | `Progress` | Thanh đo tiến độ | Hỗ trợ màu xanh HCMUTE Blue, Emerald, hoặc Amber |
| **15** | `Badge` | Huy hiệu trạng thái | `variant`: primary, accent, success, warning, neutral |
| **16** | `Tabs` | Bộ chuyển tab tinh gọn | Bo góc 8–10px, trạng thái kích hoạt nổi bật |
| **17** | `Modal` | Hộp thoại tương tác nổi | Backdrop mờ nhẹ (`backdrop-blur-xs`), quản lý focus & phím Esc |
| **18** | `Drawer` | Ngăn kéo trượt thông tin | Dành cho hiển thị chi tiết giáo trình hoặc bộ lọc nâng cao |
| **19** | `Tooltip` | Chú thích giải nghĩa | Hiển thị định nghĩa chỉ số khi hover/focus |
| **20** | `Toast` | Thông báo nổi ngắn | Phản hồi khi lưu bookmark, sao chép liên kết, tải báo cáo |
| **21** | `Skeleton` | Khung tải nạp giả lập | Hiệu ứng shimmer nhẹ nhàng trong lúc chờ dữ liệu |
| **22** | `EmptyState` | Màn hình trạng thái trống | Thông báo chưa có dữ liệu kèm nút hành động hữu ích |
| **23** | `MatchGauge` | Đồng hồ đo tương thích | Vòng tròn SVG phân màu theo ngưỡng: >=85% xanh, 70-84% chàm |
| **24** | `SkillBar` | Thanh đo khoảng trống kỹ năng | Hiển thị mức năng lực hiện tại vs tiêu chuẩn nghề |
| **25** | `RoadmapNode` | Mốc chặng lộ trình | Checkbox tương tác, phân loại danh mục (Học, Thực hành, Dự án) |
| **26** | `ReportSection` | Khối phân đoạn báo cáo | Cấu trúc chuẩn cho in ấn A4 (tránh ngắt trang giữa chừng) |

---

### 3. App Shell & Cơ Chế Quản Lý Trạng Thái (App Shell Architecture)

* **Header:**
  * Logo nhận diện `HcmuteBrandMark` + Tên sản phẩm "HCMUTE AI Career Intelligence".
  * Tìm kiếm toàn cầu **Global Search** (Phím tắt `Ctrl + K` hoặc `Cmd + K`) tìm nhanh nghề, ngành, trường.
  * Hộp thông báo **Notifications** cập nhật thành tựu và đề xuất thông minh.
  * Hồ sơ cá nhân tóm tắt kèm cấp bậc tiến hóa & thanh XP.
  * Nút xuất báo cáo nhanh **Xuất Báo Cáo (A4 / PDF)** mở `ReportModal`.
* **Career Journey Bar:**
  * Luôn hiển thị vị trí của học viên trong toàn bộ hành trình 10 chặng.
  * Hiển thị số lượng chặng đã hoàn tất và XP tích lũy.
* **Responsive Bottom Bar (Dành cho Mobile):**
  * Tối ưu màn hình cảm ứng: Nút Khám phá, Năng lực DNA, So khớp, Lộ trình và AI Coach.
  * Vùng chạm tối thiểu `44px × 44px`.
