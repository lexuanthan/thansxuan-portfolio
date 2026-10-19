# BÁO CÁO KHẢO SÁT KIẾN TRÚC CODEBASE & HẠ TẦNG TEST
## Tích hợp Live Interactive Training Quiz Game (Đấu Trí Đoàn - Hội)
**Thực hiện bởi**: Codebase & Test Explorer (`explorer_codebase_1`)  
**Thời gian khảo sát**: 2026-10-18T00:14:00Z  
**Dự án**: `thansxuan-portfolio` (`c:\Users\DELL\Desktop\thansxuan-portfolio`)  

---

## 1. TỔNG QUAN HỆ THỐNG & KẾT QUẢ BASELINE VERIFICATION

Toàn bộ hệ thống kiểm thử và build hiện tại đã được chạy trực tiếp để kiểm chứng baseline trước khi tích hợp:

| Hạng mục kiểm tra | Lệnh thực thi | Kết quả thực tế | Thời gian | Trạng thái |
|---|---|---|---|---|
| **Bộ Unit & Component Test** | `npm test` (`vitest run`) | **38 test files passed**, **638 tests passed**, 0 failed | 31.2s | **PASS 100%** |
| **Kiểm tra cú pháp & Lint** | `npm run lint` (`eslint`) | 0 errors, 139 warnings (chủ yếu biến unused trong mock), exit code `0` | 14.5s | **PASS** |
| **Production Build (Next.js)** | `npm run build` (`next build`) | **28/28 routes compiled thành công**, TypeScript OK, exit code `0` | 28.9s | **PASS** |

---

## 2. KIẾN TRÚC ỨNG DỤNG & ROUTING (APP ROUTER)

### 2.1 Loại Router & Cấu trúc thư mục
- **Next.js App Router**: Thư mục nguồn nằm hoàn toàn trong `src/app/` (`layout.tsx`, `page.tsx`, `globals.css`). Không sử dụng Pages Router.
- **Phiên bản Framework**: 
  - `next`: `16.3.5` (Next.js 16 với Turbopack)
  - `react`: `19.2.8`, `react-dom`: `19.2.8` (React 19)
  - `@supabase/ssr`: `^0.5.2`, `@supabase/supabase-js`: `^2.45.0`
- **Quy ước Server Component vs Client Component**:
  - Các trang `page.tsx` là Server Component phục vụ tạo metadata SEO (`generateMetadata` hoặc `export const metadata`) và bọc giao diện trong layout chung.
  - Các thành phần tương tác chứa React hooks (`useState`, `useEffect`, `useRef`, `useSearchParams`) bắt buộc phải có chỉ thị `"use client";` ở dòng đầu tiên.
  - **Lưu ý đặc biệt Next.js 16 (`AGENTS.md`)**: Trong Next.js 16, `params` và `searchParams` trong Server Component là `Promise`. Khi Client Component cần đọc search params (ví dụ mã phòng `?room=XYZ` hoặc role `?role=player`), client component phải được bọc trong `<Suspense>` boundary để tránh làm hỏng quá trình prerender tĩnh khi chạy `next build`.

### 2.2 Hệ thống Giao diện, Màu sắc & Styling
- **Tailwind CSS v4**: Cấu hình thông qua file `src/app/globals.css` với block `@theme`:
  - **Font chữ chính**: `Be Vietnam Pro` (`--font-be-vietnam`, load qua `next/font/google` trong `src/app/layout.tsx:10-15`).
  - **HCMUTE Official Academic Blue (Primary: 20-25%)**:
    - `--color-brand-500`: `#0056b3`
    - `--color-brand-600`: `#004098` (HCMUTE Blue chính thức)
    - `--color-brand-700`: `#00337a`
  - **HCMUTE Official Energetic Red (Accent: 5-10%)**:
    - `--color-accent-red-500`: `#ef4444`
    - `--color-accent-red-600`: `#d9232e` (HCMUTE Red nhiệt huyết)
    - `--color-accent-red-700`: `#b91c1c`
  - **Nền & Bề mặt (65% White/Light Space)**:
    - Canvas: `--color-page`: `#f8fafc`
    - Card: `--color-surface`: `#ffffff`, `--color-surface-soft`: `#f1f5f9`
    - Viền: `--color-line`: `#e2e8f0`
  - **Bo góc & Đổ bóng tinh tế (Anti-bubble style)**:
    - Button/Input: `rounded-[10px]` (`--radius-btn: 0.625rem`)
    - Card: `rounded-[12px]` (`--radius-card: 0.75rem`)
    - Modal/Panel: `rounded-[16px]` (`--radius-panel: 1rem`)
    - Shadow: `shadow-soft`, `shadow-lift`, `shadow-brand`, `shadow-accent`.
- **Khung vỏ chung (Layout Shell)**:
  - `SiteShell.tsx` (`src/components/SiteShell.tsx:10-25`): Chứa `Navbar`, `Footer`, `ViewTracker` và slot `<main className="flex-1">`.
  - Thư viện UI chung tại `src/components/ui/index.tsx`: Cung cấp `Card`, `CardHeader`, `Container`, `ButtonLink`, `Chip`, `IconTile`, `EmptyState`.

### 2.3 Cơ chế Danh mục Công cụ (Tools Catalog)
- **Đường dẫn danh mục**: `/ai-tools` (quản lý bởi `src/app/ai-tools/page.tsx:72-100`).
- **Nguồn dữ liệu**: Hàm `getAiTools()` (`src/lib/queries.ts:50-67`).
  - Truy vấn bảng `ai_tools` từ Supabase.
  - Nếu Supabase lỗi hoặc chưa tạo bảng, tự động rơi về `FALLBACK_AI_TOOLS` tại `src/lib/fallback.ts:115-191`.
- **Cấu trúc dữ liệu `AiTool`** (`src/lib/types.ts:18-31`):
  ```typescript
  export type AiTool = {
    id: string;
    title: string;
    description: string | null;
    icon: string;
    color: string;         // Preset gradient (COLOR_PRESETS)
    status: string;        // Nhãn trạng thái (ví dụ "Mới • Trực tiếp", "Sẵn sàng")
    status_color: string;  // Màu nhãn (STATUS_COLORS: "red", "green", "blue", "yellow"...)
    link_url: string | null;
    published: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
  };
  ```
- **Thẻ hiển thị (`ToolCard`)** (`src/app/ai-tools/page.tsx:14-70`):
  - Hiển thị hộp icon gradient 48x48 bo tròn `rounded-2xl`.
  - Huy hiệu trạng thái góc trên phải (`statusClassName(tool.status_color)`).
  - Tiêu đề đậm `text-ink-900`, mô tả súc tích `text-ink-500`.
  - Nút bấm liên kết "Dùng thử ngay" dẫn đến URL công cụ.
- **Vị trí hiển thị trên Trang chủ (`src/app/page.tsx:264-329`)**:
  - Khối sidebar phải "Công cụ AI hữu ích" hiển thị top 5 công cụ (`tools.slice(0, 5)`) có link trực tiếp.

---

## 3. HỆ SINH THÁI THÀNH PHẦN GIAO DIỆN & TÀI NGUYÊN

### 3.1 Thư viện Icon & Triết lý Thiết kế
- **Không cài `lucide-react`**: Dự án theo đuổi triết lý không bloat bundle, tất cả icon đều là **Native React SVG components** nét mảnh (Lucide-style) đặt trong:
  - `src/components/ui/icons.tsx` (`IconArrow`, `IconSparkle`, `IconRocket`, `IconCheck`, v.v.)
  - `src/components/career-guidance/common/CareerIcons.tsx`
- **Khuyến nghị cho Quiz Game**: Xây dựng bộ icon SVG chuyên biệt `src/components/training-quiz/common/QuizIcons.tsx` bao gồm:
  - `IconPlay`, `IconNext`, `IconTrophy`, `IconLightning`, `IconFlame` (Streak), `IconClock`, `IconUsers`, `IconQrCode`, `IconCheckCircle`, `IconXCircle`, `IconVolume2`, `IconVolumeX`, `IconCrown`, `IconMedal`.

### 3.2 Hiệu ứng Âm thanh (Audio & Sound Effects)
- **Không phụ thuộc file mp3 tĩnh**: Sử dụng **Web Audio API** (`new window.AudioContext()`) để tổng hợp âm thanh dạng chiptune/chime sinh động ngay trên trình duyệt:
  - Âm thanh tick-tắc đếm ngược 15s (pulse click).
  - Âm thanh 3s cuối cảnh báo khẩn trương (fast high pitch).
  - Âm thanh trả lời đúng (major chord arpeggio).
  - Âm thanh trả lời sai (low buzz tone).
  - Âm thanh vinh danh / kèn fanfare khi công bố Top 3.
  - Có nút Mute/Unmute tiện lợi trên màn hình giảng viên.
  - Hoạt động 100% offline, 0 request mạng, không bị lỗi CORS/404.

### 3.3 Hiệu ứng Pháo hoa Vinh danh (Confetti)
- Tham khảo module Canvas Studio đã có trong `src/components/composer/Stage.tsx`: Vẽ trực tiếp particle confetti trên HTML5 `<canvas>` nhẹ nhàng, rực rỡ sắc đỏ - vàng - xanh truyền thống Đoàn - Hội mà không cần cài thư viện ngoài `canvas-confetti`.

### 3.4 Mã QR Code
- Màn hình giảng viên (Host) cần chiếu mã QR để học viên quét camera vào phòng ngay.
- Có thể sử dụng module render SVG QR Code client-side độc lập hoặc thư viện chuẩn `qrcode` (`npm install qrcode @types/qrcode`) để đảm bảo sinh mã QR cục bộ không phụ thuộc Internet.

---

## 4. HẠ TẦNG ĐỒNG BỘ THỜI GIAN THỰC (REALTIME SYNC ARCHITECTURE)

### 4.1 Nền tảng Supabase Realtime sẵn có
- Tệp cấu hình: `src/lib/supabase/client.ts:7-9` và `src/lib/supabase/config.ts:1-9`.
- Tệp `.env.local` đã có cấu hình đầy đủ `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Gói `@supabase/supabase-js` v2.45.0 đã có sẵn tính năng **Supabase Realtime Channel**:
  - `broadcast`: Gửi sự kiện từ Host -> Players (mở câu hỏi, công bố đáp án, chuyển câu) và Players -> Host (chốt đáp án, thời gian ms).
  - `presence`: Theo dõi danh sách học viên trực tuyến trong phòng chờ (Lobby).
  - **Ưu điểm lớn**: Hoạt động xuyên thiết bị (máy tính giảng viên kết nối máy chiếu, điện thoại học viên kết nối qua 4G/Wifi) mà không cần xây dựng WebSocket server riêng!

### 4.2 Thiết kế Bộ điều hợp Dual-Transport (Bảo vệ Test & Offline)
Để đảm bảo bộ test `vitest` và môi trường chạy demo offline không phụ thuộc vào kết nối mạng tới Supabase:
- Kiến trúc `QuizSyncTransport` trừu tượng với 2 driver:
  1. **SupabaseRealtimeDriver**: Kích hoạt khi chạy thực tế trên trình duyệt với Internet và Supabase credentials.
  2. **LocalMemory/BroadcastChannelDriver**: Tự động kích hoạt trong môi trường unit test `vitest` hoặc khi chạy offline, cho phép mô phỏng 10+ học viên ảo cùng tương tác đồng thời mà không gửi bất kỳ request mạng nào ra ngoài.

---

## 5. HẠ TẦNG KIỂM THỬ (TESTING INFRASTRUCTURE) & CÁC RỦI RO CẦN TRÁNH

### 5.1 Cấu hình Vitest
- Tệp cấu hình: `vitest.config.ts:1-19`.
  - Môi trường: `jsdom`.
  - Thư mục test: `tests/**/*.test.{ts,tsx}`.
  - File setup: `tests/setup.ts` (gọi `cleanup()` của `@testing-library/react` sau mỗi test).
  - Path alias: `@` trỏ tới `src/`.
- Cấu hình TypeScript: `tsconfig.json:33` loại trừ `"tests"` khỏi `next build` type-checking, giúp deploy an toàn.

### 5.2 ⚠️ PHÁT HIỆN RỦI RO QUAN TRỌNG: RÀNG BUỘC CỐ ĐỊNH TRONG `tests/fallback.test.ts`
Khi kiểm tra tệp `tests/fallback.test.ts:48-51`:
```typescript
describe("FALLBACK_AI_TOOLS", () => {
  it("có đủ 7 tool, đều published và id không trùng", () => {
    expect(FALLBACK_AI_TOOLS).toHaveLength(7);
...
```
- **Rủi ro**: Nếu thêm công cụ thứ 8 vào mảng `FALLBACK_AI_TOOLS` trong `src/lib/fallback.ts` mà quên sửa `tests/fallback.test.ts`, lệnh `npm test` sẽ **FAIL NGAY LẬP TỨC**.
- **Giải pháp**: Khi đăng ký thẻ Quiz Game vào `FALLBACK_AI_TOOLS`:
  1. Cập nhật `tests/fallback.test.ts:49` thành `expect(FALLBACK_AI_TOOLS).toHaveLength(8);` (hoặc kiểm tra `toBeGreaterThanOrEqual(7)`).
  2. Đảm bảo `status_color` thuộc tập `STATUS_COLORS` (`"red"`, `"green"`, `"blue"`, `"yellow"`, `"purple"`, `"gray"`).
  3. Đảm bảo `color` gradient thuộc tập `COLOR_PRESETS` (ví dụ `"from-orange-100 to-red-100"`).

---

## 6. ĐIỂM TÍCH HỢP & ĐỀ XUẤT CẤU TRÚC CHO QUIZ GAME

### 6.1 Đường dẫn Route URL chính thức
Dựa trên cấu trúc chuẩn của tất cả công cụ hiện tại (`/ai-tools/career-guidance`, `/ai-tools/brand-strategy`, `/ai-tools/logo-composer`, `/ai-tools/edupath`):
- **Đường dẫn chuẩn (Primary URL)**:
  ```
  /ai-tools/training-quiz
  ```
- **Đường dẫn tiện lợi (Aliases / Shortlinks)**:
  - Hỗ trợ query parameters:
    - `/ai-tools/training-quiz?mode=host` (mở ngay chế độ Giảng viên)
    - `/ai-tools/training-quiz?room=XXXXXX` (Học viên vào thẳng phòng qua mã QR)
  - Có thể tạo trang chuyển tiếp tại `src/app/tools/training-quiz/page.tsx` hoặc cấu hình rewrite trong `next.config.ts` để link `/tools/training-quiz` tự động trỏ về `/ai-tools/training-quiz`.

### 6.2 Đăng ký Thẻ Công cụ trong Tools Catalog
1. **Trong mã nguồn (`src/lib/fallback.ts:115-191`)**:
   Thêm mục công cụ với `sort_order: 1` hoặc `0` để thẻ xuất hiện ngay đầu danh mục `/ai-tools` và xuất hiện trên sidebar trang chủ:
   ```typescript
   tool(
     "training-quiz-doan-hoi",
     "Đấu trí Đoàn - Hội (Kahoot Live Quiz)",
     "Trò chơi trắc nghiệm tương tác trực tiếp 15 câu hỏi bấm giờ phục vụ tập huấn Kỹ năng Xây dựng Kế hoạch và Tổ chức Hoạt động Đoàn - Hội. Tính điểm tốc độ mili-giây, streak & vinh danh Top 3.",
     "⚡",
     "from-orange-100 to-red-100",
     1,
     "Mới • Trực tiếp",
     "red",
     "/ai-tools/training-quiz"
   )
   ```
2. **Trong thanh Quick Links trang chủ (`src/app/page.tsx:40-48`)**:
   Bổ sung link nhanh `{ href: "/ai-tools/training-quiz", label: "Đấu trí Đoàn - Hội", Icon: IconSparkle }`.
3. **Trong cơ sở dữ liệu Supabase**:
   Tạo file script SQL `supabase/them-the-tool-training-quiz.sql` để người quản trị có thể nạp vào database khi cần.

### 6.3 Đề xuất Bố cục Thư mục (Directory Layout)
Tuân thủ chặt chẽ mô hình của module `career-guidance` và `composer`:

```
src/
├── app/
│   └── ai-tools/
│       └── training-quiz/
│           └── page.tsx                      # Server Component (SEO metadata, SiteShell, Suspense)
├── components/
│   └── training-quiz/
│       ├── TrainingQuizApp.tsx               # Client container điều phối (Host/Player router)
│       ├── HostView.tsx                      # Màn hình Giảng viên / Máy chiếu
│       │   ├── HostLobby.tsx                 # Sảnh chờ, mã phòng, QR code, danh sách học viên
│       │   ├── HostQuestion.tsx              # Câu hỏi đang chiếu, đếm ngược 15s, số người đã nộp
│       │   ├── HostReveal.tsx                # Công bố đáp án đúng, giải thích bài giảng, vinh danh nhanh nhất
│       │   ├── HostLeaderboard.tsx           # Bảng xếp hạng tạm thời sau mỗi câu
│       │   └── HostPodium.tsx                # Bục vinh danh Top 3 chung cuộc, giải Tia chớp, thống kê
│       ├── PlayerView.tsx                    # Màn hình Học viên trên điện thoại
│       │   ├── PlayerJoin.tsx                # Nhập họ tên, đơn vị/chi đoàn, mã phòng
│       │   ├── PlayerLobby.tsx               # Trạng thái chờ giảng viên bắt đầu
│       │   ├── PlayerQuestion.tsx            # 4 nút chọn đáp án màu lớn (Đỏ, Xanh, Vàng, Lục)
│       │   ├── PlayerFeedback.tsx            # Phản hồi tức thì: Đúng/Sai, điểm tốc độ, streak
│       │   └── PlayerSummary.tsx             # Thứ hạng cá nhân, tổng điểm, huy hiệu đạt được
│       └── common/
│           ├── QuizIcons.tsx                 # Bộ icon SVG thuần
│           ├── QuizSound.ts                  # Web Audio API synthesizer
│           ├── QuizConfetti.tsx              # Canvas confetti
│           └── QuizQrCode.tsx                # Component tạo QR SVG
├── lib/
│   └── training-quiz/
│       ├── types.ts                          # Định nghĩa Question, Room, Player, Answer, GameState
│       ├── questionsData.ts                  # Bộ 15 câu hỏi trích xuất từ tài liệu Đoàn - Hội
│       ├── scoringEngine.ts                  # Thuật toán tính điểm tốc độ ms + streak + xếp hạng
│       ├── roomEngine.ts                     # Quản lý vòng đời phòng chơi, state transitions
│       └── syncTransport.ts                  # Bộ điều hợp Supabase Realtime + In-memory fallback
tests/
├── training-quiz-questions.test.ts           # Test kiểm tra bộ 15 câu hỏi & 3 mức độ nhận thức
├── training-quiz-scoring.test.ts             # Test thuật toán tính điểm ms, streak, tie-breaker
├── training-quiz-engine.test.ts              # Test mô phỏng toàn bộ luồng game 10 người chơi
└── training-quiz-ui.test.tsx                 # Test render HostView & PlayerView với React Testing Library
```

---

## 7. KẾT LUẬN & KIẾN NGHỊ CHO CÁC ROLE TIẾP THEO

1. **Về Nền tảng**: Hệ thống Next.js 16 + React 19 + Tailwind v4 + Vitest đang hoạt động hoàn hảo với 638 test passed và build thành công.
2. **Về Nguồn nội dung**: Bộ tài liệu gốc tại `D:\DU LIEU DOAN TRUONG\BTV ĐOÀN TRƯỜNG 21` đã sẵn sàng, `python-docx` hoạt động tốt để trích xuất đầy đủ 15 câu hỏi chính xác.
3. **Về Realtime**: Tận dụng triệt để Supabase Realtime Broadcast & Presence đã có sẵn key trong `.env.local`, kèm lớp fallback Local/BroadcastChannel để test tự động chạy độc lập, siêu tốc và ổn định tuyệt đối.
4. **Về Kiểm thử**: Luôn chạy `npm test` và `npm run build` trước khi bàn giao bất kỳ thay đổi nào. Chú ý cập nhật `tests/fallback.test.ts` khi thêm thẻ công cụ vào `FALLBACK_AI_TOOLS`.
