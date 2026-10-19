# Project: Live Interactive Training Quiz Game (Đoàn - Hội HCM-UTE)

## Architecture
Hệ thống trò chơi tương tác trực tiếp dạng Kahoot (Live Interactive Training Quiz Game) được thiết kế theo kiến trúc Module tách bạch, bao gồm 4 tầng chính:

```
┌────────────────────────────────────────────────────────────────────────┐
│ UI Layer (Next.js 16 App Router + Tailwind v4 + React 19)              │
│ - HostView: Màn hình máy chiếu (Lobby, QR code, 15s Timer, Bục vinh danh) │
│ - PlayerView: Giao diện mobile 4 nút màu hình học (Tam giác, Kim cương,...)│
│ - Components: QuizSound (Web Audio synth), QuizConfetti, QuizQrCode    │
├────────────────────────────────────────────────────────────────────────┤
│ Page & Integration Layer                                               │
│ - Route: /ai-tools/training-quiz & /tools/training-quiz (Next rewrite)  │
│ - Catalog: FALLBACK_AI_TOOLS (src/lib/fallback.ts)                     │
├────────────────────────────────────────────────────────────────────────┤
│ Transport & Synchronization Layer                                      │
│ - Dual-mode: Server-Sent Events (SSE) Stream + Adaptive Polling (500ms)│
│ - Route Handlers: /api/quiz/rooms, /api/quiz/rooms/[code]/*            │
│ - Room Manager Singleton: globalThis.__QUIZ_ROOMS__ (In-Memory)        │
│ - Optional Client fallback: BroadcastChannel / Supabase Realtime       │
├────────────────────────────────────────────────────────────────────────┤
│ Core Engine & Data Layer (src/lib/training-quiz/)                      │
│ - questionsData.ts: 15 câu hỏi chuẩn xác trích từ tài liệu BTV 21      │
│ - scoringEngine.ts: Tính điểm tốc độ ms + Streak bonus + Vinh danh    │
│ - roomEngine.ts: State Machine (LOBBY, ACTIVE, REVEAL, LEADERBOARD,..) │
│ - types.ts: Định nghĩa dữ liệu toàn diện                               │
└────────────────────────────────────────────────────────────────────────┘
```

## Feature Inventory
Tất cả các tính năng từ giai đoạn khảo sát được ánh xạ 100% vào các mốc:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Question Bank 15 Authentic Questions | 15 câu trắc nghiệm tiếng Việt chuẩn dấu trích xuất từ tài liệu BTV 21 theo 3 cấp độ (5 Nhận biết, 5 Thông hiểu, 5 Tình huống thực tế), 15s limit, 4 options, 1 correct index, explanation chuẩn slide | M1 | survey_docs |
| 2 | Question Data Typing & Verification | TypeScript schema cho câu hỏi, kiểm thử tính toàn vẹn và hợp lệ | M1 | survey_docs |
| 3 | Precision Speed Scoring Engine | Công thức điểm phản xạ chính xác ms: 1000 * (T_remain / 15000), sai/hết giờ = 0đ | M2 | survey_realtime |
| 4 | Streak Bonus Engine | Thưởng chuỗi liên tiếp (+0, +100, +200, +300, +500), sai/timeout reset về 0 | M2 | survey_realtime |
| 5 | Deterministic Leaderboard & Tie-Breaker | Xếp hạng tích lũy: Điểm giảm dần -> Tổng thời gian phản xạ tăng dần -> Số câu đúng -> Thứ tự vào phòng | M2 | survey_realtime |
| 6 | Question-Level & Final Awards | Danh hiệu Người nhanh nhất từng câu, Giải "Tia chớp Đoàn - Hội" (Lightning Award), Bục vinh danh Top 3 Podium | M2 | survey_realtime |
| 7 | Class Analytics Generator | Thống kê tỷ lệ đúng theo từng câu, câu hỏi khó nhất/dễ nhất, điểm trung bình lớp | M2 | survey_realtime |
| 8 | Headless QuizRoom State Machine | Quản lý 6 trạng thái: LOBBY, QUESTION_START (3s), QUESTION_ACTIVE (15s), QUESTION_REVEAL, LEADERBOARD, FINAL_RESULTS | M2 | survey_realtime |
| 9 | Fast Answer Short-Circuit | Tự động ngắt giờ và chuyển sang REVEAL ngay khi 100% người chơi trong phòng nộp bài trước 15s | M2 | survey_realtime |
| 10 | Room Manager Singleton | Quản lý vòng đời phòng (Mã PIN 6 ký tự, host token, danh sách player, tự dọn phòng cũ) | M3 | survey_realtime |
| 11 | REST & SSE API Route Handlers | Các endpoint: Tạo phòng, Join phòng (không cần login), SSE stream, Submit answer, Host action | M3 | survey_codebase |
| 12 | Adaptive Polling Fallback | Đảm bảo client hoạt động trơn tru ngay cả khi mạng chặn SSE | M3 | survey_realtime |
| 13 | Host Screen UI (Projector View) | Giao diện trình chiếu: Sảnh chờ QR/PIN, câu hỏi đếm ngược 15s, biểu đồ phân bổ đáp án, vinh danh từng câu, bục Top 3 | M4 | survey_codebase |
| 14 | Player Screen UI (Mobile View) | Giao diện học viên: 4 nút màu hình học (Đỏ, Xanh dương, Vàng, Xanh lá), phản hồi tức thì, streak banner, bảng điểm | M4 | survey_codebase |
| 15 | Audio & Visual Effects | Web Audio synth phát âm thanh countdown/kết quả (0 dependency), hiệu ứng pháo hoa Confetti Top 3 | M4 | survey_codebase |
| 16 | Website & Catalog Integration | Đăng ký công cụ vào `FALLBACK_AI_TOOLS`, route `/ai-tools/training-quiz` + `/tools/training-quiz`, cập nhật test fixture `tests/fallback.test.ts` (7->8) | M4 | survey_codebase |
| 17 | E2E Testing Suite (Tiers 1-4) | Kiểm thử hộp mờ độc lập: Phủ 100% tính năng, biên, tổ hợp và kịch bản lớp học mô phỏng >=10 người chơi qua 15 câu | E2E Track | survey_all |
| 18 | Adversarial Coverage & Forensic Audit | Thử thách tải biên, chống gian lận, kiểm toán tính toàn vẹn (Auditor Clean) | M5 | survey_all |

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Xây dựng bộ test hộp mờ độc lập Tiers 1-4, xuất bản `TEST_READY.md` | none | DONE |
| M1 | Training Content & Question Bank | Data 15 câu hỏi chuẩn xác, schema TypeScript, test kiểm tra câu hỏi | none | DONE |
| M2 | Scoring & State Machine Engine | Thuật toán tính điểm ms, streak, xếp hạng, giải thưởng, headless QuizRoom & fast short-circuit | none | DONE |
| M3 | Realtime Room Sync & API Routes | API Route Handlers, In-memory Room Manager, SSE stream, Player join, Answer submission | M1, M2 | DONE |
| M4 | UI Components & Website Integration | HostView, PlayerView, Audio Synth, Confetti, QR Code, đăng ký danh mục `/ai-tools`, cập nhật `fallback.test.ts` | M1, M2, M3 | DONE |
| M5 | Final Verification & Coverage Hardening | Chạy 100% E2E tests, thử thách kiểm thử biên (Tier 5), Forensic Audit độc lập, kiểm tra build & lint | E2E, M1-M4 | DONE |

## Interface Contracts

### M1 ↔ M2/M3/M4 (Question Data Structure)
```typescript
export type CognitiveLevel = 'Nhận biết' | 'Thông hiểu' | 'Tình huống thực tế';

export interface QuizQuestion {
  id: number; // 1 to 15
  question: string;
  level: CognitiveLevel;
  timeLimit: number; // 15 seconds
  options: [string, string, string, string]; // exactly 4 options
  correctIndex: number; // 0, 1, 2, or 3
  explanation: string;
}
```

### M2 ↔ M3/M4 (Scoring & Room Engine)
```typescript
export interface PlayerState {
  id: string; // generated client UUID
  nickname: string;
  unit?: string; // Chi đoàn / Đơn vị
  score: number;
  streak: number;
  maxStreak: number;
  correctCount: number;
  totalResponseTimeMs: number;
  answers: Record<number, { selectedIndex: number; responseTimeMs: number; isCorrect: boolean; pointsEarned: number }>;
  connected: boolean;
}

export type RoomStatus = 'LOBBY' | 'QUESTION_START' | 'QUESTION_ACTIVE' | 'QUESTION_REVEAL' | 'LEADERBOARD' | 'FINAL_RESULTS';

export interface RoomState {
  roomCode: string;
  hostToken: string;
  status: RoomStatus;
  currentQuestionIndex: number; // 0 to 14 (15 questions)
  questionStartTime?: number; // server timestamp ms
  questionDeadline?: number; // questionStartTime + 15000
  players: Record<string, PlayerState>;
  fastestPlayerInCurrentQuestion?: { playerId: string; nickname: string; responseTimeMs: number };
}

export function calculateScore(isCorrect: boolean, responseTimeMs: number, currentStreak: number): { points: number; newStreak: number };
export function getLeaderboard(players: Record<string, PlayerState>): PlayerState[];
export function getFinalAwards(players: Record<string, PlayerState>, questions: QuizQuestion[]): FinalAwardsSummary;
```

### M3 ↔ M4 (API Endpoints Contract)
- `POST /api/quiz/rooms`: Create room -> returns `{ roomCode: string, hostToken: string }`
- `GET /api/quiz/rooms/[code]/state`: Query room state -> returns sanitized `RoomState` (hides correctIndex while in `QUESTION_ACTIVE`)
- `GET /api/quiz/rooms/[code]/sse`: SSE stream pushing state updates
- `POST /api/quiz/rooms/[code]/join`: `{ nickname: string, unit?: string }` -> returns `{ playerId: string, roomState }`
- `POST /api/quiz/rooms/[code]/action`: `{ hostToken: string, action: 'START' | 'NEXT_QUESTION' | 'SHOW_LEADERBOARD' | 'END_GAME' }`
- `POST /api/quiz/rooms/[code]/answer`: `{ playerId: string, questionIndex: number, selectedIndex: number, clientTimeMs: number }`

## Code Layout
- `src/lib/training-quiz/`
  - `types.ts`: Toàn bộ type definitions
  - `questionsData.ts`: 15 câu hỏi chính thức bám sát tài liệu Đoàn trường BTV 21
  - `scoringEngine.ts`: Logic tính điểm ms + streak + leaderboard + awards
  - `roomEngine.ts`: Headless state machine & fast short-circuit
  - `roomManager.ts`: Quản lý kho phòng in-memory trên `globalThis.__QUIZ_ROOMS__`
- `src/app/api/quiz/`
  - `rooms/route.ts`: API tạo phòng
  - `rooms/[code]/state/route.ts`: API polling state
  - `rooms/[code]/sse/route.ts`: API SSE stream
  - `rooms/[code]/join/route.ts`: API gia nhập phòng
  - `rooms/[code]/action/route.ts`: API điều khiển Host
  - `rooms/[code]/answer/route.ts`: API nộp bài của Player
- `src/components/training-quiz/`
  - `HostView.tsx`: Màn hình máy chiếu của giảng viên
  - `PlayerView.tsx`: Màn hình điện thoại/máy tính của học viên
  - `QuizSound.ts`: Bộ tổng hợp âm thanh Web Audio API
  - `QuizConfetti.tsx`: Hiệu ứng pháo hoa vinh danh Top 3
  - `QuizQrCode.tsx`: Hiệu ứng render mã QR tham gia
  - `common/QuizShapes.tsx`: 4 khối hình học Kahoot (Đỏ, Xanh dương, Vàng, Xanh lá)
- `src/app/ai-tools/training-quiz/page.tsx`: Route chính cho ứng dụng
- `src/app/tools/training-quiz/route.ts`: Route chuyển tiếp/alias
- `src/lib/fallback.ts`: Đăng ký công cụ thứ 8 vào `FALLBACK_AI_TOOLS`
- `tests/fallback.test.ts`: Cập nhật fixture kiểm tra độ dài mảng (7 -> 8)
- `tests/`:
  - `training-quiz-questions.test.ts`: Test kiểm thử tính hợp lệ của 15 câu hỏi (10 passed)
  - `training-quiz-scoring.test.ts`: Test kiểm thử công thức ms + streak + awards (18 passed)
  - `training-quiz-engine.test.ts`: Test kiểm thử máy trạng thái & mô phỏng 10+ người chơi (12 passed)
  - `training-quiz-api.test.ts`: Test kiểm thử các API Route Handlers (33 passed)
  - `training-quiz-ui.test.ts`: Test render giao diện Host/Player (19 passed)
  - `training-quiz-e2e.test.ts`: Test tích hợp toàn trình (E2E Track - 35 passed)
  - `training-quiz-stress-scoring.test.ts`: Test tải biên toán học (Challenger 1 - 20 passed)
  - `training-quiz-challenger-stress.test.ts`: Test tải đồng thời 20-100 players (Challenger 2 - 20 passed)
  - **Tổng cộng**: 8 suites chuyên sâu (167 passed), toàn dự án 46 suites (805 passed), 100% pass!
