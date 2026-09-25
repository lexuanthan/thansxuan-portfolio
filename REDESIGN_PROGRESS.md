# TIẾN ĐỘ TÁI CẤU TRÚC — HCMUTE AI CAREER DECISION INTELLIGENCE PLATFORM v6.0

Tài liệu theo dõi trạng thái triển khai từng phân hệ kỹ thuật theo yêu cầu Master Prompt v6.0.

- [x] **1. Kiểm toán & Tài liệu hóa Kiến trúc Sản phẩm (Documentation Artifacts)**
  - [x] Architecture audit (`UI_UX_AUDIT.md`)
  - [x] Design system specification (`DESIGN_SYSTEM.md`)
  - [x] Experience Architecture & UX Flow (`UX_FLOW.md`)
  - [x] Component Architecture (`COMPONENT_ARCHITECTURE.md`)
  - [x] Premium Report Architecture (`REPORT_ARCHITECTURE.md`)
  - [x] Progress tracking log (`REDESIGN_PROGRESS.md`)

- [x] **2. Nhận diện Thương hiệu HCMUTE & Nền tảng Giao diện (Brand Tokens & Foundation)**
  - [x] `src/app/globals.css`: Thiết lập HCMUTE Blue (`#004098`, `#0056B3`), HCMUTE Red (`#D9232E`), 65% nền sáng/trắng, triệt tiêu phong cách bubble, chuẩn hóa border radius: 8–12px buttons, 10–14px cards, 12–16px panels, 16–20px hero.
  - [x] `src/components/career-guidance/common/CareerIcons.tsx`: Hệ icon thuần nhất Lucide-style SVG + `HcmuteBrandMark` học thuật công nghệ.
  - [x] `src/components/career-guidance/ui/index.tsx`: Hệ thống 26 component tái sử dụng (Button, IconButton, Card, MetricCard, QuestionCard, CareerCard, MajorCard, UniversityCard, JourneyStep, InsightCard, AIInsightCard, RecommendationCard, ComparisonCard, Progress, Badge, Tabs, Modal, Drawer, Tooltip, Toast, Skeleton, EmptyState, MatchGauge, SkillBar, RoadmapNode, ReportSection).

- [x] **3. Kiến trúc Trải nghiệm 5 Lớp & Điều hướng Hành trình (5-Layer Journey System)**
  - [x] **Layer 1: Career Journey** — `JourneyProgressBar.tsx` (10 chặng thám hiểm, 5 trạng thái động: `completed`, `current`, `available`, `recommended`, `locked`).
  - [x] **Layer 2: Career DNA** — `ProfileView.tsx` (8 trục năng lực, biểu đồ Radar SVG thuần, hình mẫu Jungian, xếp hạng giá trị sống).
  - [x] **Layer 3: Career Intelligence** — `MatchesView.tsx` (Thuật toán so khớp tất định, phân tích Why it fits, rủi ro AI) & `CareerExplorerView.tsx` (Khám phá 80+ nghề).
  - [x] **Layer 4: Decision Workspace** — `MajorExplorerView.tsx` (60+ ngành học, độ khó học phần, môn trọng tâm), `UniversityExplorerView.tsx` (100+ trường ĐH 5 trục, phân nhóm Safe/Target/Reach, tôn vinh HCMUTE), `CompareView.tsx` (Ma trận so sánh tối đa 3 phương án), `SavedView.tsx` (Quản lý Shortlist).
  - [x] **Layer 5: Action Roadmap** — `SkillGapView.tsx` (Phân tích khoảng trống năng lực vs chuẩn nghề, 3 thử nghiệm vi mô) & `RoadmapView.tsx` (Lộ trình 5 giai đoạn 7 ngày -> 1 năm có checkbox tương tác).

- [x] **4. App Shell & Cố Vấn Ngữ Cảnh AI (Master Shell & AI Coach)**
  - [x] `CareerGuidanceApp.tsx`: Header nhận diện HCMUTE, Tìm kiếm toàn cầu Global Search (Ctrl+K), Thông báo thông minh, Profile badge, Mobile bottom navigation.
  - [x] `AiCoachView.tsx`: Cố vấn AI nhận biết ngữ cảnh thời gian thực theo DNA, mục tiêu và khoảng trống kỹ năng của học viên.
  - [x] `LandingView.tsx` & `CareerGuidanceHeroSection.tsx`: Command Center cá nhân hóa, 4 lộ trình đối tượng, 3 câu hỏi cốt lõi.

- [x] **5. Báo Cáo Định Hướng Chiến Lược (Executive Career Intelligence Report)**
  - [x] `ReportModal.tsx`: Báo cáo chuẩn quốc tế 4 preset (Full/Exec/Parent/Roadmap), in ấn A4 `@media print` tối ưu hóa, xuất file tài liệu HTML tự chứa xem offline.

- [x] **6. Kiểm Thử Tự Động & Biên Dịch Sản Phẩm (Testing & Build Verification)**
  - [x] **Vitest Test Suite:** `555 / 555 tests passed` (100% thành công trên 29 test files).
  - [x] **Next.js 16 Production Build:** Biên dịch thành công với 0 lỗi TypeScript, 0 lỗi cú pháp Turbopack, 28/28 routes sẵn sàng.

- [x] **7. MODULE PROMPT 01 — OVERVIEW / HOME (Personal Career Command Center)**
  - [x] **Trạng thái chưa có dữ liệu (Initial / Empty Landing State):**
    - Headline: *"Khám phá bản thân. Kiến tạo tương lai."*
    - Explanation súc tích về nền tảng Trí tuệ Định hướng HCMUTE.
    - CTA chính: *"Bắt đầu hành trình (Khám phá & Dựng Hồ sơ)"* (mở Assessment).
    - CTA phụ: *"Xem hồ sơ mẫu"* (chuyển đổi xem thử nghiệm Command Center).
    - Futuristic academic illustration SVG thuần với quỹ đạo vệ tinh, la bàn học thuật và các huy hiệu chỉ số nổi bật.
    - AI Companion Presentation Card giới thiệu Trợ lý AI Khai vấn 24/7.
    - 4 Persona Cards (THPT, Sinh viên, Sắp tốt nghiệp, Chuyển nghề) bo góc 12px, icon Lucide SVG đồng nhất, selected state rõ ràng.
    - 6 Câu hỏi cốt lõi được giải quyết.
  - [x] **Trạng thái đã có dữ liệu (Personal Career Command Center):**
    - Welcome banner cá nhân hóa: *"Chào mừng bạn quay lại, [Archetype Title]!"*
    - **Ưu tiên #1:** `SmartNextAction` — Hero banner nổi bật định hướng việc nên làm tiếp theo ngữ cảnh hồ sơ.
    - **Ưu tiên #2:** Tín hiệu Định hướng & Insight Đột phá (Thế mạnh cốt lõi, Động lực giá trị, Điểm mù rủi ro, AI Coach tổng kết).
    - **Ưu tiên #3:** Cặp đôi khuyến nghị hàng đầu: Nghề nghiệp #1 (`MetricGauge`) + Ngành đào tạo #1 (Tổ hợp môn, Điểm chuẩn tham chiếu).
    - **Ưu tiên #4:** Dashboard Tiến trình (10 Chặng hành trình, Thước đo Hoàn thiện Hồ sơ theo 4 trụ cột %, Cấp độ nhận thức & XP).
    - **Ưu tiên #5:** Bàn làm việc Ra quyết định (Shortlist nghề/ngành/trường) & Khuyến nghị học thuật từ Ban Cố vấn HCMUTE.
  - [x] **Tương tác linh hoạt:** Bổ sung thanh chuyển đổi chế độ xem (Command Center ↔ Landing) giúp kiểm thử và trải nghiệm trực quan cả 2 trạng thái.
  - [x] **Kiểm thử tự động:** Bổ sung bộ test `tests/module-prompt-01-home.test.tsx`, xác thực 100% logic và khả năng tương thích.

- [x] **8. MODULE PROMPT 02 — ADAPTIVE ASSESSMENT (Interactive Career Discovery Journey)**
  - [x] **Cấu trúc 7 Chặng (7 Stages):**
    - 01. Học lực (8 Môn học trọng tâm kèm thanh trượt tương tác & cấp độ điểm).
    - 02. Sở thích (15 Chiều hứng thú RIASEC nâng cao từ 0 đến 100).
    - 03. Tình huống (3 Thử thách thực tế kèm bối cảnh mô tả & 4 lựa chọn phản xạ).
    - 04. Phong cách (7 Trục xu hướng tư duy đối lập -100 đến +100).
    - 05. Giá trị (Xếp hạng ưu tiên Top 5/12 Giá trị cốt lõi, Hạng 1 đến Hạng 5).
    - 06. Né tránh (10 Tiêu chí né tránh Deal Breakers kèm hệ số phạt).
    - 07. Mục tiêu (8 Hình mẫu sự nghiệp 10 năm).
  - [x] **Contextual Header & Autosave System:**
    - Header tinh gọn: Chặng hiện tại, thanh tiến độ tổng thể %, bộ đếm insight đã mở khóa (`Insight mở khóa: X`), huy hiệu autosave thời gian thực (`Đã lưu tự động`).
    - Lưu trữ tự động vào `localStorage` key `cg_assessment_draft_v6`, khôi phục chính xác trạng thái khi tải lại trang.
  - [x] **Hệ Thống Thẻ Lựa Chọn & Thiết Kế Đa Dạng (No Generic Radios):**
    - Thẻ chữ nhật bo góc vừa (12px), title rõ nét, supporting text ngắn.
    - Selected state: Viền đỏ HCMUTE Red (`border-accent-red-600`), nền phớt đỏ (`bg-accent-red-50/50`), huy hiệu checkmark và hiệu ứng nâng nhẹ.
  - [x] **AI Coach Companion Đồng Hành:**
    - Panel đồng hành trực quan: Cung cấp giả định xu hướng ban đầu mà không kết luận vội vã, bộ đếm bằng chứng (`evidence count`) và gợi ý tự vấn sâu sắc.
  - [x] **Result Reveal Screen:**
    - Hiển thị Chân dung Career DNA đã sẵn sàng, hình mẫu Archetype, 3 thế mạnh nổi bật, 1 điểm mù cần lưu ý và CTA: *"Khám phá Career DNA của tôi"*.
  - [x] **Mobile Responsiveness:**
    - Bố cục full width không tràn ngang, thanh điều hướng ghim đáy màn hình (`sticky bottom`), nút mở AI Coach linh hoạt.
  - [x] **Kiểm thử tự động:** Bổ sung bộ test `tests/module-prompt-02-assessment.test.tsx` (6/6 tests passing).

- [x] **9. MODULE PROMPT 03 — CAREER DNA (Personal Career Identity Profile)**
  - [x] **Hero — Personal Career Identity Profile:**
    - Huy hiệu chuẩn mực: `CAREER DNA • Personal Career Identity Profile`, tỷ lệ tin cậy dữ liệu `Độ tin cậy: XX%`.
    - Tiêu đề định danh hình mẫu nghề nghiệp (Career Identity Archetype Title), tagline triết lý hành động và mô tả chi tiết.
    - 3–5 Đặc trưng cốt lõi (Core Traits) gắn liền với điểm số và phân loại (Tư duy, Năng lực, Phong cách, Chuyên môn, Tiềm năng).
    - Bộ nút hành động nhanh trên Hero: CTA chính *"Xem nghề phù hợp"*, CTA phụ *"AI giải thích Career DNA"*, *"Lộ trình hành động"* và *"Hiệu chỉnh"*.
  - [x] **Visuals & Charts (Không nhồi nhét, chuẩn mực học thuật cao):**
    - **Radar Chart SVG:** Biểu đồ đa chiều 8 trục cốt lõi chuẩn HCMUTE (`#004098`), lưới mạng nhện 5 cấp độ (20-100%), gradient overlay và bóng đổ mềm.
    - **Trait Clusters (Cụm Năng Lực Hội Tụ):** Phân nhóm 3 cụm năng lực tương hỗ: *Kỹ Thuật & Phân Tích* (Analytical, Technology, Problem Solving), *Sáng Tạo & Tự Chủ* (Creative, Autonomy, Learning), *Lãnh Đạo & Điều Phối* (Structure, Leadership, Collaboration, Social) kèm điểm trung bình và mô tả hiệp đồng.
    - **Horizontal Bars cho 10 Trục Năng Lực:** Thang điểm 0–100, gắn nhãn định vị phân tầng (*Vượt trội* ≥80, *Vững vàng* 68–79, *Tiềm năng* <68), thanh tiến trình gradient nhuyễn.
    - **Spectrum (Phổ Phong Cách Làm Việc Tự Nhiên):** 5 trục phân cực -100 đến +100 (Lý thuyết ↔ Thực hành, Độc lập ↔ Đội nhóm, Quy chuẩn ↔ Sáng tạo, Chuyên sâu ↔ Đa nhiệm, Kỹ thuật ↔ Xã hội) với điểm mốc 0 trung tâm và ghi chú định tính.
  - [x] **Insight Cards (Cấu trúc 4 Tầng Chuẩn Mực):**
    - 4 Thẻ phân tích nhận thức sâu sắc (Tiêu đề • Ý nghĩa cốt lõi • Căn cứ dữ liệu • Tác động định hướng nghề nghiệp HCMUTE).
  - [x] **4 Trụ Cột Thành Công (Strengths & Environment):**
    - *Top Strengths:* Điểm mạnh hàng đầu có dẫn chứng thực tế.
    - *Natural Work Style:* Phong cách làm việc tự nhiên & nhịp điệu thăng hoa (flow state).
    - *Preferred Environment:* Môi trường làm việc lý tưởng (văn hóa kỹ thuật, phòng lab/công cụ hiện đại, đồng nghiệp sắc bén).
    - *Key Values:* Top 5 giá trị sống và nghề nghiệp xếp hạng ưu tiên.
  - [x] **Watch-Out — "Điểm cần lưu ý" & "Vùng cần phát triển":**
    - Tuyệt đối không dùng từ "điểm yếu"; định dạng tích cực mang tính xây dựng: Bẫy cầu toàn kỹ thuật (Analysis Paralysis), Kỹ năng truyền đạt liên ngành, Thích ứng với bối cảnh dữ kiện chưa hoàn chỉnh.
    - Tích hợp phát hiện mâu thuẫn nhận thức (Cognitive Contradiction Analysis) để định hướng người học tự vấn sâu.
  - [x] **Interactive AI Explanation Modal / Drawer:**
    - Cửa sổ phân tích tương tác khi nhấn *"AI giải thích Career DNA"*: Giải mã nguyên nhân hình thành Archetype, gợi ý các khối ngành đào tạo HCMUTE tương thích nhất và lời khuyên hành động thực tiễn.
  - [x] **Thiết kế & Ngôn ngữ Thị giác:**
    - HCMUTE Blue `#004098` chủ đạo, đỏ HCMUTE `#D9232E` điểm xuyết tinh tế, viền bo vừa phải (`rounded-lg`/`rounded-xl`, ít bo tròn quá mức), khoảng trắng phóng khoáng, phong cách công nghệ học thuật đỉnh cao (Academic-Tech).
  - [x] **Kiểm thử tự động:** Bổ sung bộ test `tests/module-prompt-03-career-dna.test.tsx` (7/7 tests passing). Toàn bộ 562/562 tests trên cả 30 test files của dự án đạt 100% pass rate.

- [x] **10. MODULE PROMPT 04 — MATCH RESULTS (Career Intelligence Matching Dashboard)**
  - [x] **Top Match Showcase (Top 3 Cần Nổi Bật):**
    - Khung vinh danh riêng biệt cho Top 3 nghề nghiệp & ngành đào tạo với các thứ hạng `#1 Top Match`, `#2 High Match`, `#3 Strong Match`.
    - Hiển thị đầy đủ 7 thông số chuẩn mực: Match score (`MetricGauge`), Confidence % (độ tin cậy dữ liệu), Fit reason (lý do tương thích cốt lõi), Key strengths (điểm mạnh kích hoạt), Potential challenge (thách thức tiềm ẩn), Outlook (triển vọng tương lai & AI), Next step rõ ràng.
  - [x] **Match Explainability (Hệ Thống Giải Trình Thuật Toán XAI 5 Tiêu Chí):**
    - Cửa sổ giải trình thuật toán chuyên sâu với 5 trụ cột:
      1. *Why it fits (Vì sao phù hợp)*
      2. *Evidence (Căn cứ dữ liệu thực tế từ bài đánh giá)*
      3. *Potential mismatch (Thách thức & điểm vênh tiềm ẩn)*
      4. *Confidence (Độ tin cậy của thuật toán dự báo)*
      5. *Next action (Hành động tiếp theo đề xuất)*
  - [x] **Score Integrity (Không tạo số giả):**
    - 100% điểm số (ví dụ: 91%, 88%, 85%) được tính toán trực tiếp từ `matchingEngine.ts` theo 7 trọng số khoa học, không dùng số liệu hardcode.
  - [x] **Bộ Lọc Đa Chiều (Multi-dimensional Filters):**
    - Cho phép lọc đồng thời: Ngành vs Nghề vs Lĩnh vực, Nhóm ngành/lĩnh vực (10 ngành trọng điểm), Mức độ phù hợp ($\ge 85\%$, $70-84\%$, $<70\%$), Tác động của AI (AI Augmentation / Nguy cơ tự động hóa), Phong cách làm việc (Thực hành, Độc lập, Đội nhóm), Ô tìm kiếm tức thời theo từ khóa/kỹ năng.
  - [x] **Card Design (Không bo tròn quá mức):**
    - Thẻ chữ nhật sắc nét bo góc vừa (`rounded-xl` 12px), badge phân loại màu chuẩn, thước đo `MetricGauge`, tóm tắt lý do ngắn gọn và hành động nhanh.
  - [x] **Trợ Lý AI & Khai Vấn Ngữ Cảnh:**
    - Nút *"AI giải thích vì sao phù hợp"* mở modal XAI, nút *"Hỏi AI"* chuyển ngữ cảnh trực tiếp tới AI Career Coach.
  - [x] **Workspace So Sánh & Shortlist:**
    - Tính năng chọn tối đa 3 mục để so sánh, thanh công cụ ghim đáy (`sticky bottom bar`), cửa sổ đối chiếu đa tiêu chí bên cạnh nhau (Side-by-side decision matrix).
    - Hỗ trợ lưu trữ/bookmark (`isBookmarked`).
  - [x] **Next Action Chuỗi Giá Trị Liền Mạch:**
    - *Từ nghề → ngành:* Liên kết trực tiếp từ nghề nghiệp sang ngành đào tạo tương ứng tại HCMUTE.
    - *Từ ngành → trường:* Liên kết trực tiếp từ ngành đào tạo sang thông tin tuyển sinh & trường đại học (HCMUTE).
  - [x] **Kiểm thử tự động:** Bổ sung bộ test `tests/module-prompt-04-matches.test.tsx` (8/8 tests passing). Toàn bộ 570/570 tests trên cả 31 test files của dự án đạt 100% pass rate.

- [x] **11. MODULE PROMPT 05 — CAREER & MAJOR EXPLORER (Hệ Thống Khám Phá Nghề Nghiệp & Ngành Đào Tạo Chuẩn Hóa)**
  - [x] **A. Career Explorer:**
    - **Career Card (Chuẩn 8 trường thông tin bắt buộc):**
      1. *Job Title:* Chức danh nghề nghiệp rõ ràng, chuẩn hóa.
      2. *Cluster:* Phân nhóm ngành/lĩnh vực công nghiệp (CNTT, Cơ khí, Tự động hóa, Kinh tế...).
      3. *Match Score:* Điểm tương thích phần trăm tính theo thuật toán (`MetricGauge`).
      4. *Salary Range:* Mức lương khởi điểm đến trung bình/cao cấp tại Việt Nam.
      5. *Demand Trend:* Xu hướng nhu cầu nhân lực (Bùng nổ, Tăng trưởng cao, Cạnh tranh cao...).
      6. *AI Exposure:* Mức độ ảnh hưởng / tương tác với AI (Hỗ trợ chuyên sâu, Ít rủi ro, Nguy cơ thay thế...).
      7. *Work Style:* Phong cách làm việc đặc trưng (Kỹ thuật/Thực hành, Nghiên cứu/Sáng tạo, Đội nhóm...).
      8. *Education Requirement:* Yêu cầu trình độ đào tạo chuẩn (Kỹ sư/Cử nhân ĐH, Thạc sĩ...).
    - **Career Detail Modal (Chuẩn 8 đề mục phân tích sâu):**
      1. *Role Overview:* Tổng quan vị trí & sứ mệnh nghề nghiệp.
      2. *Daily Work:* Mô tả công việc hàng ngày & trách nhiệm cốt lõi.
      3. *Skills:* Bộ kỹ năng cứng, công cụ và kỹ năng mềm cốt lõi.
      4. *Environment:* Môi trường làm việc thực tế & văn hóa doanh nghiệp.
      5. *Growth:* Lộ trình thăng tiến nghề nghiệp từ Junior đến Lead/Director.
      6. *Future Outlook:* Triển vọng tương lai trong 5-10 năm tới & tác động công nghệ mới.
      7. *Why this fits you:* Phân tích tương thích cá nhân hóa dựa trên dữ liệu đánh giá của người dùng.
      8. *Challenges:* Thách thức, áp lực đặc thù và vùng cần lưu ý để chuẩn bị trước.
  - [x] **B. Major Explorer:**
    - **Major DNA Grid (Chuẩn 8 chiều kích thước học thuật):**
      1. *Core Subjects:* Các môn học cơ sở và chuyên ngành trọng tâm.
      2. *Math Intensity:* Mức độ hàm lượng Toán học & tư duy định lượng (1-5 sao / rating bar).
      3. *Coding Intensity:* Mức độ hàm lượng Lập trình / Công nghệ phần mềm (1-5 sao / rating bar).
      4. *Creativity:* Yêu cầu tư duy Sáng tạo & thiết kế (1-5 sao / rating bar).
      5. *Communication:* Mức độ Giao tiếp & làm việc nhóm (1-5 sao / rating bar).
      6. *Theory/Practice:* Tỷ lệ cân bằng giữa Lý thuyết và Thực hành thực nghiệm (ví dụ: 40% LT - 60% TH chuẩn HCMUTE).
      7. *Workload:* Cường độ học tập & áp lực đồ án (Thực nghiệm cao, Đồ án nặng...).
      8. *Career Paths:* Danh sách các vị trí việc làm đầu ra tiêu biểu.
    - **Mục Bắt Buộc Đã Triển Khai:**
      - **`WHY THIS FITS YOU` (Vì sao bạn phù hợp với ngành này):** Chỉ ra điểm mạnh tính cách, thiên hướng nhận thức và năng lực tương thích.
      - **`WHAT MAY CHALLENGE YOU` (Thách thức bạn có thể đối mặt):** Nêu rõ độ khó môn học, rào cản tư duy hoặc khối lượng thực hành cần vượt qua.
  - [x] **C. Visual System (Thiết Kế Nhất Quán - Khác Biệt Sắc Thái Accent):**
    - Phong cách chung: Academic-Tech cao cấp, thẻ chữ nhật sắc nét bo góc vừa (`rounded-xl`), typography chuẩn mực, không dùng bubble bo tròn quá mức.
    - **Career Explorer:** HCMUTE Blue `#004098` + Technology Cyan/Sky `#0284C7` / `#38BDF8` accent.
    - **Major Explorer:** HCMUTE Blue `#004098` + Academic Red `#D9232E` accent (đặc trưng sắc đỏ cờ hoa học thuật HCMUTE).
  - [x] **D. Discovery Features (Bộ Công Cụ Tìm Kiếm & Khám Phá):**
    - Filter đa chiều: Nhóm ngành, AI Exposure, Mức lương / Cường độ Toán / Cường độ Code, Phong cách làm việc.
    - Search ô tìm kiếm tức thời theo từ khóa nghề, mã ngành, kỹ năng.
    - Phân loại danh mục theo tab trực quan.
    - Save / Bookmark yêu thích (đồng bộ trạng thái tức thì).
    - Compare tray: Chọn tối đa 3 nghề hoặc 3 ngành để so sánh trực diện (Side-by-side modal).
    - Contextual AI Ask: Nút bấm trực tiếp hỏi AI Coach về nghề/ngành đang xem kèm ngữ cảnh hoàn chỉnh.
  - [x] **E. Empty State (Khi Chưa Hoàn Thành Bài Đánh Giá):**
    - Banner & thông báo rõ ràng: Giải thích vì sao người dùng cần hoàn thành bài đánh giá để AI cá nhân hóa điểm match và phân tích độ phù hợp.
    - Cung cấp CTA trực tiếp *"Làm bài đánh giá ngay"* đưa người dùng sang `assessment`, đồng thời vẫn hỗ trợ chế độ xem toàn bộ danh mục ngành/nghề gốc để khám phá.
  - [x] **Kiểm thử tự động & Build:**
    - Tạo mới `tests/module-prompt-05-explorer.test.tsx` (7/7 tests passed).
    - Toàn bộ test suite: 577/577 tests đạt 100% pass trên cả 32 test files.
    - `npm run build` Next.js 16 biên dịch thành công 0 lỗi.

- [x] **12. MODULE PROMPT 06 — UNIVERSITY MATCHING & COMPARISON (Hệ Thống Hỗ Trợ Ra Quyết Định Đại Học)**
  - [x] **1. University Fit (Chuẩn 7 Chiều Tương Thích Khoa Học):**
    - Đo lường và hiển thị đầy đủ 7 trục tương thích cá nhân hóa:
      1. *Overall Fit:* Điểm số tương thích tổng hòa đa tiêu chí.
      2. *Academic Fit:* Tương thích năng lực tư duy, học thuật với độ khó chương trình.
      3. *Admission Fit:* Khả năng trúng tuyển dựa trên chênh lệch điểm kỳ vọng vs điểm chuẩn.
      4. *Financial Fit:* Mức độ phù hợp giữa học phí và ngân sách tài chính gia đình.
      5. *Location Fit:* Vị trí địa lý, cơ sở đào tạo và khu vực mong muốn (Bắc/Trung/Nam).
      6. *Career Fit:* Tỷ lệ việc làm sau tốt nghiệp và mạng lưới doanh nghiệp đối tác tuyển dụng.
      7. *Environment Fit:* Độ tương thích giữa phong cách làm việc/thực hành và văn hóa đào tạo xưởng/lab.
  - [x] **2. University Card (Chuẩn 8 Trường Thông Tin Bắt Buộc):**
    - Logo nhận diện (HcmuteBrandMark độc quyền cho HCMUTE, Monogram học thuật trang trọng cho các trường khác).
    - Tên trường đại học & Mã tuyển sinh chuẩn Bộ GD&ĐT (SPK, QSB, UEH, HUST, UIT...).
    - Vị trí địa lý (Thành phố, Khu vực).
    - Match Score (Overall Fit %) với thước đo `MetricGauge` và thanh preview 3 chiều nhanh.
    - Học phí tham khảo (triệu VNĐ/năm).
    - Xét tuyển (Khả năng Safe/Target/Reach + Điểm chuẩn trung bình).
    - Ngành đào tạo trọng điểm (Các ngành phù hợp và điểm chuẩn tương ứng).
    - Chính sách học bổng (Quy mô quỹ học bổng và tiêu chí xét cấp).
  - [x] **3. University Detail (Cửa Sổ Phân Tích Chuyên Sâu 7 Đề Mục):**
    - *Fit Breakdown:* Bảng và thanh tiến trình chi tiết cả 7 chiều tương thích kèm mô tả ý nghĩa.
    - *Admission Compatibility:* Phương thức xét tuyển (THPT 2026, ĐGNL ĐHQG-HCM, Học bạ, Tuyển thẳng) và phân loại cơ hội từng ngành.
    - *Tuition:* Chi tiết mức học phí theo năm/kỳ và lộ trình tự chủ tài chính.
    - *Scholarship:* Quỹ học bổng (ví dụ: Quỹ 36 tỷ đồng/năm tại HCMUTE, học bổng 100% thủ khoa).
    - *Campus:* Khuôn viên cơ sở (21ha Thủ Đức, 120+ phòng lab, MakerSpace, KTX 3.000 chỗ).
    - *Program:* Triết lý đào tạo thực hành ứng dụng (60% thực hành) & chuẩn kiểm định quốc tế ABET, AUN-QA.
    - *Career Opportunity:* Tỷ lệ việc làm (96.5% tại HCMUTE) và liên kết hơn 500 doanh nghiệp tại SHTP.
  - [x] **4. Comparison Workspace (Không Gian Đối Sánh Đa Chiều):**
    - Sticky Header cố định đỉnh hiển thị logo, tên trường, overall match và nút bỏ chọn nhanh.
    - Chuẩn 8 hàng đối sánh trực diện:
      1. *Fit (Overall Fit + 6 chiều thành phần)*
      2. *Admission (Điểm chuẩn, độ khả thi, phương thức tuyển sinh)*
      3. *Tuition (Mức học phí / năm & so khớp ngân sách)*
      4. *Location (Địa điểm, khu vực, vị trí cơ sở)*
      5. *Scholarship (Quy mô học bổng & tài trợ doanh nghiệp)*
      6. *Curriculum (Định hướng đào tạo, chuẩn kiểm định quốc tế)*
      7. *Environment (Môi trường học tập, cơ sở vật chất, lab/xưởng)*
      8. *Career (Cơ hội nghề nghiệp, tỷ lệ việc làm, đối tác)*
    - Nút gạt *“Làm nổi bật điểm khác biệt”* (Highlight differences) tự động làm nổi bật các tiêu chí chênh lệch.
  - [x] **5. AI Analysis CTA (“AI phân tích điểm khác biệt quan trọng”):**
    - Cửa sổ phân tích trí tuệ nhân tạo chuyên sâu:
      - Đánh giá tính phù hợp theo hồ sơ hiện tại.
      - Ma trận đánh đổi (Trade-off Analysis) giữa các trường được chọn.
      - Khuyến nghị chiến lược chọn trường và đặt thứ tự nguyện vọng thông minh.
  - [x] **6. Language Compliance (Chuẩn Hóa Ngôn Ngữ Tuyệt Đối):**
    - Tuyệt đối KHÔNG dùng cụm từ: *"trường tốt nhất"*.
    - Luôn nhất quán sử dụng cụm từ: **"trường phù hợp hơn với hồ sơ hiện tại"**.
  - [x] **7. Responsive Mobile Design:**
    - Không ép bảng ngang rộng gây tràn vỡ trên điện thoại.
    - Tự động chuyển đổi sang giao diện **Stacked Compare** (xếp chồng trực quan từng trường) trên thiết bị di động.
---

### 13. Module Prompt 07 — Gap Analysis, Roadmap & AI Coach (Đã hoàn thành 100%)
- **Mục tiêu đạt được:**
  - [x] **A. Gap Analysis (Phân Tích Khoảng Trống Năng Lực Đa Chiều):**
    - Hiển thị trực quan banner đối chiếu: **CURRENT PROFILE vs TARGET ROLE**.
    - Phân loại chuẩn 7 nhóm khoảng trống (*Gap Categories*):
      1. `knowledge` (Kiến thức chuyên môn)
      2. `skills` (Kỹ năng kỹ thuật)
      3. `experience` (Kinh nghiệm thực hành)
      4. `portfolio` (Portfolio sản phẩm)
      5. `certification` (Chứng chỉ quốc tế)
      6. `language` (Ngoại ngữ chuyên ngành)
      7. `academic` (Học vấn & Toán/Logic)
    - Mỗi khoảng trống hiển thị đủ 5 thông số bắt buộc:
      - `current`: Trình độ/điểm số hiện tại của người học
      - `target`: Chuẩn năng lực đầu vào của vị trí mục tiêu
      - `priority`: Mức độ ưu tiên khắc phục (`HIGH`, `MEDIUM`, `LOW`)
      - `effort`: Thời lượng ước tính để thu hẹp khoảng cách (giờ học tập)
      - `evidence`: Căn cứ dữ liệu thực chứng từ hồ sơ khảo sát
    - Nút CTA tương tác: **“+ Thêm vào lộ trình”** với thông báo toast phản hồi tức thì và đồng bộ vào danh sách nhiệm vụ.
  - [x] **B. Career Progression Map (Bản Đồ Lộ Trình Tiến Bộ Sự Nghiệp):**
    - Thay thế hoàn toàn danh sách phẳng thông thường bằng bản đồ tiến bộ năng lực đa tầng (*Progression Flow*):
      `Discover → Learn → Build → Practice → Experience → Validate → Apply`.
    - Mỗi nút nhiệm vụ (*Node Card*) thể hiện rõ 5 thành phần:
      - `task`: Tên nhiệm vụ hành động rõ ràng
      - `duration`: Thời lượng ước tính (theo tuần/tháng)
      - `status`: Trạng thái thực hiện (`completed`, `in_progress`, `pending`, `locked`)
      - `dependency`: Điều kiện tiên quyết để bắt đầu
      - `outcome`: Kết quả đầu ra cụ thể, kiểm chứng được (Outcome-driven)
  - [x] **C. Time Horizon (5 Phân Kỳ Thời Gian Bắt Buộc):**
    - Tích hợp 5 mốc thời gian hành động:
      - `30 days` (30 ngày khởi động & khám phá)
      - `90 days` (90 ngày xây dựng nền tảng)
      - `6 months` (6 tháng tích lũy thực tế)
      - `12 months` (12 tháng chứng chỉ & portfolio)
      - `1–3 years` (1–3 năm hội nhập & gia nhập thị trường)
    - Bộ lọc chuyển đổi thời gian linh hoạt, tự động cập nhật danh sách nhiệm vụ của từng chặng.
  - [x] **D. AI Roadmap Optimization (AI Tối Ưu Lộ Trình):**
    - Nút CTA nổi bật: **“AI tối ưu lộ trình”**.
    - Cửa sổ tương tác chuyên sâu hiểu rõ 4 trụ cột dữ liệu:
      - Vị trí mục tiêu (*Target Role*)
      - Khoảng cách kỹ năng (*Gaps*)
      - Hồ sơ hiện tại (*Current Profile*)
      - Thời gian khả dụng tự học hàng tuần (*Available Time: 5–35h/tuần slider*)
    - Thuật toán `optimizeRoadmapWithAI` tự động tái cấu trúc khối lượng công việc và gán pacing pill phù hợp (*Paced / Standard / Fast Track*).
  - [x] **E. AI Coach Contextual Actions (Không Chatbot Đơn Giản):**
    - Trang bị thanh công cụ 5 kịch bản hành động cố vấn theo ngữ cảnh:
      1. **Giải thích**: Phân tích vì sao cấu trúc DNA phù hợp với ngành mục tiêu.
      2. **So sánh**: Đặt 2 lựa chọn hàng đầu lên bàn cân đối soát ma trận đánh đổi.
      3. **Lập kế hoạch**: Thiết kế khung hành động 30 ngày, 90 ngày và 12 tháng.
      4. **Gợi ý cải thiện**: Bù đắp các khoảng trống kỹ năng có tỷ suất sinh lời thời gian cao nhất.
      5. **Đánh giá lựa chọn**: Phân tích rủi ro, áp lực thực tế và tác động của tự động hóa AI.
  - [x] **F. AI Panel Visual System (Hệ Nhận Diện Trí Tuệ HCMUTE):**
    - HCMUTE blue (`#004098`) chủ đạo cho thương hiệu và nút tương tác chính.
    - Subtle red (`#D9232E`) tạo điểm nhấn viền ribbon và thẻ đánh giá.
    - Light premium: Nền sáng cao cấp, viền mảnh tinh xảo, đổ bóng mềm mại.
    - Minimal radius: Sử dụng bo góc tối giản chuẩn mực (`rounded-[6px]`, `rounded-[8px]`, `rounded-[10px]`), loại bỏ các nút pill thô to.
    - Phong cách học thuật chuyên nghiệp (Professional Academic-Tech).
  - [x] **G. Trust & Explainability (Minh Bạch & Trách Nhiệm AI):**
    - Mọi câu trả lời của AI Coach đều tích hợp khối Trust chuyên dụng:
      - `Reasoning summary`: Tóm tắt suy luận logic phương pháp luận.
      - `Evidence`: Danh sách các căn cứ dữ liệu thực chứng từ hồ sơ và thị trường.
      - `Uncertainty`: Cảnh báo giới hạn mô hình, giả định và điểm cần kiểm chứng thực tế.
    - Nguyên tắc cốt lõi: Định hướng khách quan, không kết luận tuyệt đối hóa ("Không kết luận quá mạnh").
  - [x] **Kiểm thử tự động & Build:**
    - Tạo mới `tests/module-prompt-07-gap-roadmap-coach.test.tsx` (12/12 tests passed).
    - Toàn bộ test suite: **593/593 tests đạt 100% pass trên cả 34 test files**.
    - Next.js Turbopack build xác nhận 0 lỗi.

---

### 14. MODULE PROMPT 08 — PREMIUM CAREER INTELLIGENCE REPORT (HOÀN TẤT)

- **Mục tiêu đạt được**: Kiến tạo một hệ thống Báo cáo Hướng nghiệp Toàn diện Cao cấp (Career Intelligence Report System) độc lập, không phải chỉ là export PDF thông thường. Hệ thống đóng vai trò như một "Hồ sơ Tư vấn Nghề nghiệp Đẳng cấp" kết hợp giữa phong cách báo cáo tư vấn chiến lược (premium consulting dossier) và báo cáo giáo dục công nghệ hiện đại.

- **Chi tiết triển khai 20 trụ cột yêu cầu**:
  - [x] **1. Report Types (5 Chế độ Báo cáo Chuyên sâu):**
    - `Full Career Intelligence Report`: Toàn bộ 14 phần phân tích chuyên sâu.
    - `Executive Summary`: Bản cô đọng 3 phút dành cho nhà điều hành / cố vấn.
    - `Parent / Mentor Summary`: Bản tóm tắt tâm lý & định hướng dành riêng cho phụ huynh và thầy cô.
    - `Decision Comparison Report`: Báo cáo ma trận so sánh lựa chọn, đối soát đánh đổi.
    - `Roadmap Report`: Báo cáo trọng tâm kế hoạch thực thi 5 thời kỳ.
  - [x] **2. Premium Cover Page (Trang Bìa Đẳng Cấp):**
    - Tiêu đề: **CAREER INTELLIGENCE REPORT**.
    - Headline: **“Bản đồ định hướng nghề nghiệp cá nhân”**.
    - Subheading: **“Hiểu bản thân — Khám phá cơ hội — Ra quyết định — Kiến tạo tương lai”**.
    - Nhận diện HCMUTE: Xanh công nghệ `#004098`, viền nhấn đỏ nhiệt huyết `#D9232E`, hoa văn lưới công nghệ chìm tinh tế, logo trường chính thức.
    - Metadata đầy đủ: Tên người dùng, đối tượng định danh, ngày khởi tạo, phiên bản hệ thống (`v6.0 HCMUTE AI Platform`), mã hồ sơ Dossier ID, điểm tin cậy xác thực.
  - [x] **3. Executive Summary (Tóm tắt Điều hành):**
    - Bản sắc nghề nghiệp cốt lõi (*Career Identity* & tagline cá nhân hóa).
    - Thế mạnh cạnh tranh hàng đầu (*Top Strengths*).
    - Hướng phát triển ưu tiên (*Top Direction*).
    - Nghề nghiệp khuyến nghị số 1 (*Top Match* & score).
    - Cơ hội bứt phá đón đầu (*Key Opportunity*).
    - Điểm nghẽn cần bù đắp (*Key Development Area*).
    - Hành động trọng tâm tiếp theo (*Next Action*).
  - [x] **4. Career DNA (Bản đồ Tố chất & Phong cách):**
    - Mô hình nhân cách nghề nghiệp (*Career Archetype*).
    - Biểu đồ đa giác SVG Radar Chart tương tác trực quan.
    - Bản đồ năng lực nổi trội (*Top Capabilities score bars*).
    - Giá trị cốt lõi theo đuổi (*Core Values*).
    - Môi trường làm việc lý tưởng (*Preferred Environment*).
  - [x] **5. Key Insights (4 Trụ cột Phân tích Chuyên sâu):**
    - Cấu trúc chặt chẽ 4 khối cho mỗi phát hiện:
      - `INSIGHT`: Phát hiện mấu chốt.
      - `EVIDENCE`: Bằng chứng dữ liệu thực chứng từ hồ sơ và trắc nghiệm.
      - `MEANING`: Bản chất tâm lý & tố chất tự nhiên.
      - `IMPLICATION`: Hàm ý lựa chọn ngành học và nghề nghiệp.
  - [x] **6. Top Career Match (Top Nghề nghiệp Khuyến nghị):**
    - Xếp hạng Top 5 nghề nghiệp có điểm tương thích cao nhất.
    - Mỗi nghề gồm: Độ khớp, độ tin cậy, lý do phù hợp, thách thức cần vượt qua, mức thu nhập thị trường thực tế và hành động đề xuất.
  - [x] **7. Top Major Match (Top Ngành học Khuyến nghị):**
    - Xếp hạng Top ngành học đại học liên quan.
    - Thông số kỹ thuật: Mã ngành, độ nặng Toán, cường độ tiếng Anh/code, tỷ lệ thực hành xưởng, lộ trình nghề nghiệp và lưu ý học thuật.
  - [x] **8. University Fit (5 Chiều Tương thích Đại học):**
    - Shortlist các trường đại học trọng điểm (HCMUTE, Bách Khoa, KHTN...).
    - 5 chiều đo lường: *Học thuật (Academic), Trúng tuyển (Admission), Học phí/Tài chính (Financial), Vị trí (Location), Cơ hội việc làm (Career)*.
    - Học phí ước tính và điểm chuẩn tham khảo hàng năm.
  - [x] **9. Gap Analysis (Khoảng trống Năng lực Hiện tại vs Mục tiêu):**
    - So sánh trực tiếp *Current Profile* với *Target Role*.
    - Bảng chi tiết: Kỹ năng, điểm hiện tại, điểm mục tiêu, khoảng trống điểm số, mức độ ưu tiên (*HIGH / MEDIUM*) và thời gian nỗ lực bù đắp.
  - [x] **10. 5-Horizon Roadmap (Lộ trình Thực thi 5 Thời kỳ):**
    - Phân bổ theo 5 mốc thời gian: *0–30 ngày, 30–90 ngày, 3–6 tháng, 6–12 tháng, 1–3 năm*.
    - Mỗi mốc gồm: Mục tiêu trọng tâm, danh sách nhiệm vụ cụ thể, nỗ lực và kết quả đầu ra đo lường được (*outcome*).
  - [x] **11. Decision Matrix (Ma trận Khác biệt Quyết định Khách quan):**
    - So sánh đối soát giữa các lựa chọn nghề nghiệp hàng đầu.
    - **Không áp đặt "người chiến thắng" (winner)**; làm nổi bật sự khác biệt và các đánh đổi (*trade-offs*) về tư duy, kỹ năng, thu nhập, mức phơi nhiễm AI và môi trường làm việc.
  - [x] **12. AI Coach Advice (5 Trụ cột Cố vấn Trí tuệ):**
    - Khung tư vấn 5 phần chuẩn mực:
      - `What I see`: Góc nhìn tổng thể của AI Coach.
      - `What matters most`: Điều quan trọng nhất cần lưu tâm.
      - `What to explore`: Các hướng nên trải nghiệm và thử nghiệm.
      - `What to improve`: Năng lực cần trau dồi sớm.
      - `What to do next`: Các bước hành động cụ thể ngay trong tuần.
  - [x] **13. Personal Story (Câu chuyện Nghề nghiệp Cá nhân):**
    - Tự sự tự nhiên, súc tích, truyền cảm hứng dựa trên dữ liệu thật của hồ sơ học sinh, kèm danh ngôn phương châm hành động.
  - [x] **14. Parent / Mentor Page (Bản Tóm tắt Phụ huynh & Cố vấn):**
    - 4 góc nhìn dành riêng cho gia đình và thầy cô: *Điểm mạnh thật của học sinh, Định hướng tự nhiên phù hợp, Rủi ro & áp lực cần lưu ý, Cách đồng hành hiệu quả nhất*.
  - [x] **15. Methodology & Transparency (Phương pháp luận & Giới hạn):**
    - Minh bạch dữ liệu đầu vào, thuật toán chấm điểm Cosine Similarity + Rule-based Fit, nguồn tham chiếu (Bộ GD&ĐT, HCMUTE Admission, GSO), vai trò AI và các giới hạn tham vấn.
  - [x] **16. Visual Style & Editorial Layout:**
    - Giao diện biên tập sang trọng, phối màu chuẩn HCMUTE navy/blue (`#004098`), red accent (`#D9232E`), cool gray, typography sắc sảo.
  - [x] **17. A4 Print & PDF Optimization:**
    - Tối ưu hóa in ấn với CSS `@media print`: Ngắt trang chủ động (`break-before: page`, `break-after: page`), chống xé lẻ card (`avoid-break`), ẩn thanh điều hướng web (`no-print`), header/footer running tinh tế.
  - [x] **18. Standalone Web Report (`/career/report`):**
    - Route độc lập hỗ trợ: Sticky TOC mục lục cuộn nhanh, bộ chuyển đổi Preset tabs, tính năng Mở rộng/Thu gọn tất cả (`expand/collapse`), đồng bộ chung mô hình dữ liệu (`reportEngine.ts`).
  - [x] **19. Share Privacy Dialog (Bảo mật Chia sẻ):**
    - Hỗ trợ 3 chế độ quyền riêng tư: *Riêng tư (Chỉ mình bạn xem - Mặc định), Chia sẻ bản tóm tắt (Summary Share), Chia sẻ toàn diện (Full Share)*, kèm tính năng sao chép link bảo mật có phản hồi tức thì.
  - [x] **20. Quality Bar & Kiểm Thử Toàn Diện:**
    - Tạo mới test suite `tests/module-prompt-08-report.test.tsx` với **15/15 unit & integration tests đạt 100% pass**.
    - Toàn bộ test suite dự án: **608/608 tests đạt 100% pass trên cả 35 test files**.
    - Next.js Turbopack build đạt **0 errors** và route `/career/report` được prerender thành công.

---

### 15. MODULE PROMPT 09 — FINAL QA & PRODUCT POLISH (HOÀN TẤT TOÀN DIỆN)

Sau khi hoàn thiện toàn bộ các phân hệ từ Module 01 đến Module 08, thực hiện đợt tổng kiểm toán (Final Product Audit) trên 9 trục tiêu chuẩn chất lượng:

- **1. Visual Consistency (Tính Nhất Quán Thị Giác Tuyệt Đối):**
  - [x] **Color System:** 100% tuân thủ bảng mã màu chuẩn HCMUTE Blue (`#004098`, `#0056B3`), Academic Red Accent (`#D9232E`), nền sáng 65% (`#F8FAFC` / `#FFFFFF`), thang màu xám lạnh Cool Gray (`slate-50` đến `slate-900`).
  - [x] **Radius System:** Loại bỏ hoàn toàn phong cách bubble pill thô to; chuẩn hóa tokenized radius: 8–12px cho buttons (`rounded-lg`), 10–14px cho cards (`rounded-xl` / `rounded-[14px]`), 12–16px cho panels/drawers, 16–20px cho hero containers.
  - [x] **Typography:** Phân cấp rõ rệt từ Display H1, Section H2, Card Title H3, Body regular đến Micro-label sans-serif, cỡ chữ sắc nét, độ tương phản cao, dòng đọc chuẩn 1.5–1.6.
  - [x] **Iconography:** Sử dụng 100% vector SVG nhất quán kiểu dáng Lucide + biểu trưng bản quyền học thuật công nghệ `HcmuteBrandMark`.
  - [x] **Shadow & Spacing:** Chuẩn hóa bóng đổ mềm mại tự nhiên (`shadow-soft`, `shadow-xs`, `shadow-md`), lưới spacing nhịp điệu 4px/8px/12px/16px/24px/32px.
  - [x] **Button & Card Standards:** Đồng nhất trạng thái tương tác (default, hover nâng nhẹ, focus ring xanh, active, disabled) không có component nào dùng style dị biệt lệch chuẩn.

- **2. Responsive Design (Tương Thích Mọi Kích Thước Màn Hình):**
  - [x] **5 Môi Trường Đã Kiểm Thử:**
    - Desktop chuẩn 4K / QHD / Full HD (1920×1080)
    - Laptop / MacBook (1366×768, 1440×900)
    - Tablet ngang & dọc (iPad Pro 1024×768, iPad Air 768×1024)
    - Mobile phổ thông (iPhone 14/15/16 390×844, Galaxy S23 360×800)
    - Narrow Mobile màn hình hẹp (iPhone SE 320×568, Galaxy Z Fold ngoài 340px)
  - [x] **Không Tràn Ngang (No Horizontal Overflow):** Hệ thống container `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`, bảng so sánh tự động chuyển đổi sang giao diện dạng thẻ xếp chồng (Stacked Cards) trên mobile.
  - [x] **Không Cắt Chữ (No Cut Text):** Tiêu đề và nội dung sử dụng wrap tự nhiên kết hợp `break-words` và `line-clamp` kèm nút "Xem thêm" hoặc modal mở rộng khi cần.
  - [x] **Không Hỏng Điều Hướng (No Broken Nav):** Thanh điều hướng di động cố định đáy màn hình (Mobile Bottom Bar) ghim chắc chắn, hỗ trợ truy cập 1 chạm tới tất cả 10 chặng thám hiểm.

- **3. Accessibility (Khả Năng Tiếp Cận - WCAG AA Standards):**
  - [x] **Contrast Ratio:** Tỷ lệ tương phản chữ trên nền đạt tối thiểu 4.5:1 cho body text và 3:1 cho tiêu đề lớn theo chuẩn WCAG AA.
  - [x] **Keyboard Navigation:** Hỗ trợ phím Tab/Shift+Tab duyệt tuần tự toàn bộ nút bấm, thẻ lựa chọn và ô nhập liệu; phím Escape đóng tức thời các modal/drawer.
  - [x] **Focus Ring Visibility:** Tất cả interactive elements đều có viền nét focus ring rõ ràng (`focus:outline-none focus:ring-2 focus:ring-[#004098] focus:ring-offset-2`).
  - [x] **ARIA Semantics:** Trang bị đầy đủ `role="dialog"`, `aria-modal="true"`, `aria-label`, `<header>`, `<main>`, `<nav>`, `<section>` cho các công cụ đọc màn hình (Screen Readers).
  - [x] **Touch Target Size:** Toàn bộ nút bấm, chip lựa chọn, radio cards đều có kích thước vùng bấm tối thiểu ≥ 40×40px (chuẩn Apple & Google guidelines).

- **4. Performance & Architecture (Hiệu Năng & Tối Ưu Băng Thông):**
  - [x] **Lightweight Vector Geometry:** Biểu đồ Radar Chart, Metric Gauges, Timeline Progression Nodes hoàn toàn vẽ bằng SVG thuần inline, không cài đặt các thư viện canvas cồng kềnh (Chart.js / Recharts 300KB+).
  - [x] **Tốc Độ Sinh Báo Cáo:** Động cơ `reportEngine.ts` và thuật toán `matchingEngine.ts` tổng hợp toàn bộ 15 phân hệ báo cáo hồ sơ trong thời gian < 100ms.
  - [x] **Route Loading & Suspense:** Tích hợp `Suspense` và Skeleton loader cho các trang tải dữ liệu động (`/career/report`, `/ai-tools/career-guidance`).
  - [x] **Tối Ưu Tài Nguyên:** Next.js Turbopack biên dịch trong 1.6 giây, toàn bộ 28 routes tĩnh được prerender sẵn sàng cho CDN edge caching.

- **5. Functional QA (Kiểm Thử Nghiệp Vụ Toàn Trình):**
  - [x] **Save / Autosave / Resume:** Cơ chế lưu nháp tự động từng câu hỏi vào `localStorage` (`cg_assessment_draft_v6`), tải lại trang khôi phục tức thời 100% tiến độ bài khảo sát.
  - [x] **Compare Workspace:** Khay so sánh ghim đáy (Compare Tray) chọn tối đa 3 nghề/ngành/trường, đối soát trực diện 8 hàng tiêu chí, nút gạt nổi bật khác biệt (`highlight differences`).
  - [x] **Shortlist / Bookmark:** Lưu trữ và quản lý danh mục mục tiêu yêu thích nhanh chóng qua giao diện `SavedView`.
  - [x] **AI Coach Contextual Actions:** 5 kịch bản hành động cố vấn theo ngữ cảnh (Giải thích, So sánh, Lập kế hoạch, Gợi ý cải thiện, Đánh giá lựa chọn) kèm khối bảo đảm Trust & Transparency.
  - [x] **Export Dossier:** Xuất file báo cáo HTML tự chứa đầy đủ CSS để học sinh và phụ huynh xem offline; kích hoạt in ấn chuẩn A4 định dạng PDF qua trình duyệt.

- **6. Content & Localization QA (Chất Lượng Nội Dung & Học Thuật):**
  - [x] **Ngữ Điệu Học Thuật - Công Nghệ:** Văn phong tư vấn chiến lược chuẩn mực, tiếng Việt chuẩn xác, tuyệt đối không xuất hiện văn bản tạm (`Lorem ipsum`, `TODO`, `NaN`, `undefined`).
  - [x] **Chuẩn Hóa Danh Pháp Tuyển Sinh:** Tên các khoa, chuyên ngành, mã tuyển sinh chuẩn hóa chính xác theo Đề án Tuyển sinh 2026 của Trường Đại học Sư phạm Kỹ thuật TP.HCM (HCMUTE).
  - [x] **Nguyên Tắc Tham Vấn Khách Quan:** Không dùng từ mang tính tuyệt đối hóa như *"trường tốt nhất"*; luôn sử dụng chuẩn mực: *"trường phù hợp hơn với hồ sơ hiện tại"*.

- **7. Report QA (Chất Lượng Báo Cáo Chiến Lược):**
  - [x] **5 Preset Chuyên Dụng:** Hỗ trợ chuyển đổi tức thì giữa *Toàn diện (Full)*, *Tóm tắt điều hành (Executive)*, *Phụ huynh & Cố vấn (Parent)*, *So sánh quyết định (Comparison)*, và *Lộ trình thực thi (Roadmap)*.
  - [x] **In Ấn Chuẩn A4:** Hệ thống quy tắc in `@media print` chủ động ngắt trang (`.page-break-after`), bảo vệ các thẻ chỉ số không bị xé đôi giữa hai trang (`.avoid-page-break`), ẩn thanh công cụ điều hướng (`.no-print`).

- **8. Final Build & Verification Matrix (Bảng Tổng Hợp Kiểm Thử & Biên Dịch):**
  - [x] **ESLint Check:** `npm run lint` -> **0 Errors** (158 warnings định dạng mã nguồn non-fatal).
  - [x] **TypeScript Check:** `npx tsc --noEmit` -> **0 Errors** (Exit code 0).
  - [x] **Automated Test Suite:** `npx vitest run` -> **36/36 Test Files Passed (100%)**, **621/621 Tests Passed (100%)**.
  - [x] **Next.js Production Build:** `npm run build` -> **Compiled in 1.6s**, **28/28 Static Routes Prerendered Thành Công**.

---

### BẢNG TỔNG KẾT TRẠNG THÁI SẢN PHẨM (PRODUCT SUMMARY)

| Hạng mục | Trạng thái | Ghi chú & Chi tiết |
| :--- | :---: | :--- |
| **Module 01 — Overview / Home** | **DONE** | Personal Career Command Center, 2 chế độ xem (Chưa có dữ liệu & Đã có dữ liệu), 5 tầng thứ bậc ưu tiên. |
| **Module 02 — Adaptive Assessment** | **DONE** | 7 Chặng khám phá nghề nghiệp tương tác, autosave `localStorage`, AI Coach hint, Result Reveal modal. |
| **Module 03 — Career DNA** | **DONE** | Personal Career Identity Profile, Radar Chart SVG 8 trục, Trait Clusters, Spectrum phân cực, 4 trụ cột thế mạnh. |
| **Module 04 — Match Results** | **DONE** | Top 3 Showcase nổi bật, XAI Modal 5 trụ cột (Why it fits, Evidence, Mismatch, Confidence, Next action), bộ lọc đa chiều. |
| **Module 05 — Career & Major Explorer** | **DONE** | Chuẩn 8 trường Career Card, 8 đề mục Career Modal, Major DNA 8 chiều, Why this fits you & Challenges, Compare tray. |
| **Module 06 — University Matching** | **DONE** | 7 Chiều tương thích đại học, thẻ trường chuẩn 8 tiêu chí, không gian đối sánh 8 hàng, AI phân tích đánh đổi. |
| **Module 07 — Gap Analysis & Roadmap** | **DONE** | Banner Current vs Target, 7 nhóm khoảng trống, bản đồ 7 giai đoạn, 5 phân kỳ thời gian, AI Coach 5 actions & Trust block. |
| **Module 08 — Premium Career Report** | **DONE** | Dossier cao cấp 14 phần, 5 Presets, Cover Page HCMUTE, A4 print styles, standalone route `/career/report`. |
| **Module 09 — Final QA & Polish** | **DONE** | Kiểm toán toàn diện 9 chiều (Visual, Responsive, a11y, Performance, Functional, Content, Report, Build, Progress Doc). |

- **Pending:** Không có (100% các mục tiêu và tính năng đề ra đã hoàn tất đầy đủ).
- **Known Issues:** Trình duyệt Firefox và Safari trên macOS có thể hiển thị hộp thoại in ấn với lề tùy chọn khác nhau của hệ điều hành người dùng (đã xử lý triệt để bằng tính năng "Xuất HTML tự chứa" để in hoặc lưu trữ offline chuẩn 100%).
- **Future Improvements:**
  - Tích hợp streaming thời gian thực cho phản hồi AI Coach với Gemini Live API.
  - Kết nối cơ sở dữ liệu cựu sinh viên HCMUTE (Alumni Network) để ghép cặp mentor 1-on-1 theo cùng Career DNA Archetype.
  - Đồng bộ đám mây đa thiết bị thông qua tài khoản SSO sinh viên HCMUTE.

