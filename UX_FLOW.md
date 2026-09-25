# KIẾN TRÚC TRẢI NGHIỆM & HỆ THỐNG LUỒNG SẢN PHẨM (UX FLOW SYSTEM)
## Nền tảng: HCMUTE AI Career Decision Intelligence Platform (Phiên bản 6.0)

---

### 1. Triết Lý Trải Nghiệm Toàn Hệ Thống (Experience Philosophy)

Người dùng không bao giờ có cảm giác *"tôi đang làm một bài khảo sát khô khan"*, mà họ được dẫn dắt để cảm nhận trọn vẹn:
**"Tôi đang chủ động khám phá và kiến tạo tương lai nghề nghiệp của chính mình."**

Chu trình trải nghiệm 9 bước liên hoàn:
```
DISCOVER (Khám phá)
   ↓
UNDERSTAND (Thấu hiểu bản thân)
   ↓
MATCH (So khớp dữ liệu)
   ↓
EXPLORE (Khám phá ngành & nghề)
   ↓
COMPARE (Đối sánh đa chiều)
   ↓
DECIDE (Ra quyết định)
   ↓
PLAN (Lập kế hoạch hành động)
   ↓
ACT (Hành động & Thử nghiệm vi mô)
   ↓
GROW (Phát triển & Cố vấn liên tục)
```

---

### 2. Kiến Trúc Trải Nghiệm 5 Lớp (5-Layer Experience Architecture)

Mọi tính năng, màn hình và tương tác trong nền tảng đều quy về ít nhất một trong 5 lớp sau:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ LỚP 1 — CAREER JOURNEY: "Tôi đang ở đâu trong hành trình nghề nghiệp?"       │
│ (10 Chặng thám hiểm · 5 Trạng thái động · XP tích lũy · Điều hướng trực quan)│
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ LỚP 2 — CAREER DNA: "Tôi là ai & Bản sắc độc bản của tôi là gì?"             │
│ (8 Trục năng lực · Hình mẫu Jungian · Biểu đồ Radar SVG · Giá trị coi trọng)  │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ LỚP 3 — CAREER INTELLIGENCE: "Dữ liệu thị trường & Khoa học nói gì về tôi?"  │
│ (So khớp tất định 80+ nghề & 60+ ngành · Phơi nhiễm AI · Bằng chứng thực tế) │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ LỚP 4 — DECISION WORKSPACE: "Tôi đang cân nhắc & so sánh những phương án nào?"│
│ (Ma trận so sánh đối đầu · Tra cứu 100+ trường 5 trục · Shortlist Đã lưu)    │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ LỚP 5 — ACTION ROADMAP: "Tôi cần làm gì tiếp theo để hiện thực hóa mục tiêu?" │
│ (Lộ trình 5 giai đoạn 7 ngày -> 1 năm · 3 Thử nghiệm nghề vi mô · Nhiệm vụ)  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### 3. Hành Trình 10 Chặng & Máy Trạng Thái (10-Stage Career Journey State Machine)

10 chặng không hiển thị như một menu liệt kê thông thường, mà được thiết kế như một **bản đồ thám hiểm tiến trình** có 5 trạng thái động:
1. `completed`: Đã hoàn thành (đánh dấu check xanh, lưu trữ kết quả).
2. `current`: Chặng đang kích hoạt thực hiện.
3. `available`: Đã sẵn sàng truy cập.
4. `recommended`: Hệ thống gợi ý bước đi tối ưu tiếp theo dựa trên tiến độ.
5. `locked`: Chưa đủ dữ liệu đầu vào, cần hoàn tất chặng trước.

| Chặng | Tên chặng | Lớp kiến trúc | Mục tiêu hành vi cốt lõi | Smart Next Action dẫn dắt |
| :---: | :--- | :---: | :--- | :--- |
| **01** | **Khám phá bản thân** | Layer 1 | Vượt qua 7 màn trắc nghiệm tương tác card-based | 👉 *Dựng Hồ sơ Career DNA* |
| **02** | **Career DNA** | Layer 2 | Khám phá 8 trục năng lực và hình mẫu cốt lõi | 👉 *Xem Kết quả so khớp* |
| **03** | **Kết quả khớp** | Layer 3 | Xếp hạng tương thích nghề và ngành đào tạo | 👉 *Xem thị trường 80+ Nghề* |
| **04** | **Khám phá nghề** | Layer 3 | Tra cứu thị trường, dải lương, rủi ro tự động hóa AI | 👉 *Khám phá Ngành đào tạo* |
| **05** | **Khám phá ngành** | Layer 3 & 4 | Tìm hiểu giáo trình, độ khó học phần, môn trọng tâm | 👉 *Tra cứu Trường ĐH* |
| **06** | **Chọn trường** | Layer 4 | Tính điểm thi giả lập, định vị Safe/Target/Reach | 👉 *Đưa vào So sánh trực diện* |
| **07** | **So sánh** | Layer 4 | Đặt tối đa 3 nghề/ngành lên bàn cân đối đầu | 👉 *Lưu vào Decision Workspace* |
| **08** | **Khoảng trống** | Layer 4 & 5 | Nhận diện khoảng cách năng lực hiện tại vs mục tiêu | 👉 *Chuyển thành Lộ trình 5 chặng*|
| **09** | **Lộ trình** | Layer 5 | Kế hoạch hành động 5 giai đoạn có checkbox tương tác | 👉 *Hỏi ý kiến AI Coach* |
| **10** | **AI Coach** | Cross-Layer | Cố vấn ngữ cảnh thời gian thực theo từng màn hình | 👉 *Xuất Báo cáo Dossier* |

---

### 4. Khung Game Hóa Tinh Tế (Gamification Framework)

Hệ thống **không biến sản phẩm thành trò chơi giải trí**, mà áp dụng cơ chế gamification khoa học theo chuỗi:
```
JOURNEY → MISSION → DISCOVERY → INSIGHT → REWARD → DECISION → ACTION
```
* **Phần thưởng quan trọng nhất:** Không phải là điểm số ảo, mà là **“Insight được mở khóa”** (Hiểu thêm một sự thật khoa học về chính mình, giải mã lý do tại sao mình hợp hoặc không hợp với một ngành nghề).
* **Các chỉ số hỗ trợ:** Cấp bậc tiến hóa 6 level (`Khởi đầu`, `Nhận diện`, `Định hình`, `Hành động`, `Bứt phá`, `Làm chủ`), thanh tích lũy XP, huy hiệu hoàn thành chặng (Milestone badge).

---

### 5. Tương Tác Ngữ Cảnh AI Coach (Context-Aware AI Intelligence)

AI Coach không đơn thuần là chatbot hỏi đáp thông thường mà luôn **nhận biết ngữ cảnh sâu (Context-Aware)**:
* Biết người dùng đang xem nghề nào hoặc đang ở tab nào.
* Biết Chân dung Career DNA và hình mẫu tâm lý của học viên.
* Biết khoảng trống kỹ năng lớn nhất đang cần khắc phục.
* Đưa ra câu hỏi gợi ý phù hợp tức thì (Contextual Prompt Chips) mà học viên không cần tự gõ lại từ đầu.
