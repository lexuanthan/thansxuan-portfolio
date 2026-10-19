# Báo Cáo Khảo Sát & Thiết Kế Kiến Trúc: Động Cơ Đồng Bộ Real-time & Tính Điểm Bấm Giờ (Kahoot-Style Quiz Engine)

> **Dự án**: Live Interactive Training Quiz Game — Trò chơi trắc nghiệm tương tác trực tiếp chuyên đề Đoàn - Hội  
> **Người thực hiện**: `explorer_realtime_1` (Realtime Sync & Scoring Engine Explorer)  
> **Người nhận**: `orchestrator_1` (Conversation ID: `fc2fb7d8-6d75-499a-bc79-478bc49f5e00`)  
> **Trạng thái**: Hoàn thành nghiên cứu & thiết kế kiến trúc kỹ thuật chi tiết  
> **Môi trường mục tiêu**: Next.js 16.3.5 (App Router), React 19.2.8, Vitest 3.0.0, TypeScript 5, Zero External Paid Cloud Services  

---

## 1. Tổng Quan Kiến Trúc & Đánh Giá Giải Pháp Đồng Bộ Thời Gian Thực (Real-time Sync)

### 1.1. Bối cảnh & Yêu cầu vận hành thực tế
Trò chơi phục vụ lớp tập huấn *"Công tác xây dựng kế hoạch và tổ chức hoạt động Đoàn - Hội"* với mô hình:
- **Giảng viên (Host)**: Sử dụng máy tính/máy chiếu để tạo phòng chơi, hiển thị mã phòng (6 ký tự) và mã QR Code. Giảng viên là người cầm trịch bấm bắt đầu, chuyển câu hỏi tuần tự từ câu 1 đến câu 15.
- **Học viên (Players)**: Sử dụng điện thoại di động (hoặc laptop) quét mã QR / nhập link, nhập Họ tên & Chi đoàn, tham gia phòng chờ (Lobby) mà **không cần đăng nhập tài khoản**.
- **Tính tức thời & Đồng bộ**: Đồng hồ đếm ngược 15 giây cho mỗi câu hỏi phải chạy nhịp nhàng đồng thời trên màn chiếu và điện thoại học viên. Khi tất cả học viên nộp bài xong, hệ thống tự động ngắt giờ (Short-circuit) và công bố đáp án ngay lập tức.
- **Ràng buộc hạ tầng**: 100% tự chủ (Self-contained), **không phụ thuộc vào dịch vụ đám mây trả phí** (như Pusher, Ably, Firebase Paid Tier), tương thích tuyệt đối với `npm run dev`, `npm run build` (`next build`), và kiểm thử tự động `npm test` (`vitest`).

---

### 1.2. Ma trận So sánh & Đánh giá các Phương án Kỹ thuật

| Tiêu chí đánh giá | Phương án A: SSE (Server-Sent Events) + REST POST (Đề xuất tối ưu) | Phương án B: WebSockets (`ws` / `socket.io` / Custom Server) | Phương án C: BroadcastChannel / WebRTC / Polling thuần |
| :--- | :--- | :--- | :--- |
| **Tính tương thích Next.js App Router** | **Xuất sắc (10/10)**: Tích hợp trực tiếp qua Route Handlers (`ReadableStream`), chạy native trên `next dev` và `next start`. | **Kém (4/10)**: Next.js App Router không hỗ trợ WS upgrade native. Cần viết `server.ts` tùy biến, phá vỡ build chuẩn. | **Kém - Trung bình (3/10)**: BroadcastChannel chỉ chạy trên cùng 1 máy (không xuyên thiết bị). WebRTC cần signaling server phức tạp. |
| **Độ trễ truyền nhận (Latency)** | **Rất thấp (< 50ms)**: Server chủ động push dữ liệu tức thì khi có sự kiện. | **Cực thấp (< 20ms)**: Full-duplex TCP stream. | Polling: trễ 500ms - 1000ms. WebRTC: thấp nhưng dễ nghẽn NAT trên Wi-Fi trường học. |
| **Hỗ trợ thiết bị di động (Mobile)** | **100%**: `EventSource` là chuẩn W3C có sẵn trên mọi trình duyệt iOS Safari & Android Chrome. | **Tốt**: Nhưng dễ bị drop socket khi thiết bị khóa màn hình hoặc chuyển app. | BroadcastChannel: **0%** trên mạng đa thiết bị. WebRTC: dễ fail trên mạng eduroam/4G CGNAT. |
| **Độ phức tạp kiểm thử Vitest** | **Cực kỳ dễ dàng & Tốc độ cao (10/10)**: Động cơ `QuizRoomManager` là TypeScript thuần, test không cần socket thật. | **Phức tạp (4/10)**: Phải khởi tạo port, quản lý vòng đời socket trong test suite. | WebRTC đòi hỏi mock RTCPeerConnection rất cồng kềnh. |
| **Chi phí hạ tầng & Vận hành** | **0 VNĐ**: Tận dụng bộ nhớ tiến trình Node.js hiện tại của website. | **0 VNĐ**: Nhưng phải quản lý thêm tiến trình/port phụ. | Phụ thuộc bên thứ 3 hoặc hạ tầng STUN/TURN. |

### 1.3. Kiến trúc Đề xuất: "Dual-Mode SSE Push + Adaptive Polling Fallback"
Chúng tôi lựa chọn giải pháp **SSE + REST POST kết hợp Singleton State**:
1. **Kênh đẩy dữ liệu (Server-to-Client)**: `GET /api/quiz/rooms/[code]/events?playerId=...&role=...`
   - Sử dụng chuẩn `text/event-stream` trả về `ReadableStream`.
   - Server gửi các event: `ROOM_STATE`, `QUESTION_START`, `TIMER_TICK`, `PLAYER_ANSWERED`, `QUESTION_REVEAL`, `LEADERBOARD`, `FINAL_RESULTS`.
2. **Kênh điều khiển & Nộp bài (Client-to-Server)**: Các endpoint REST chuẩn (`POST /api/quiz/rooms/...`)
   - `POST /api/quiz/rooms`: Tạo phòng mới (Host).
   - `POST /api/quiz/rooms/[code]/join`: Học viên vào phòng.
   - `POST /api/quiz/rooms/[code]/action`: Host điều khiển chuyển trạng thái.
   - `POST /api/quiz/rooms/[code]/answers`: Học viên chốt đáp án kèm timestamp.
3. **Cơ chế dự phòng (Adaptive Polling Fallback)**:
   - Client Hook `useQuizRoomSync` tự động phát hiện nếu `EventSource` bị lỗi hoặc proxy chặn streaming thì tự động chuyển sang cơ chế Short-polling `GET /api/quiz/rooms/[code]/state` mỗi 500ms, đảm bảo trò chơi không bao giờ bị gián đoạn.
4. **Bộ nhớ phòng chơi (In-Memory Room Manager Singleton)**:
   - Được gắn vào `(globalThis as any).__QUIZ_ROOMS__` để dữ liệu phòng chơi không bị mất khi Next.js Fast Refresh (HMR) trong quá trình phát triển.
   - Cơ chế tự dọn dẹp (TTL Garbage Collection): Tự động xóa các phòng không có hoạt động quá 2 giờ.

---

## 2. Thiết Kế Máy Trạng Thái Trò Chơi (Game State Machine)

Hệ thống tuân thủ mô hình máy trạng thái hữu hạn (Deterministic Finite State Machine) nghiêm ngặt để đảm bảo tất cả màn hình (Host & Players) luôn đồng bộ tuyệt đối.

### 2.1. Sơ đồ Chuyển Trạng Thái (State Transition Diagram)

```
       ┌────────────────────────┐
       │         LOBBY          │  (Host tạo phòng, hiển thị mã PIN & QR,
       └───────────┬────────────┘   học viên vào phòng chờ)
                   │ Event: HOST_START_GAME
                   ▼
       ┌────────────────────────┐
       │     QUESTION_START     │  (Đếm ngược 3 giây chuẩn bị, hiển thị câu số X,
       └───────────┬────────────┘   chủ đề & độ khó)
                   │ Auto: 3000ms Timer
                   ▼
       ┌────────────────────────┐
  ┌───►│    QUESTION_ACTIVE     │  (15 giây đếm ngược, mở nút chọn A-B-C-D)
  │    └─────┬────────────┬─────┘
  │          │            │
  │          │ Short-     │ Timeout
  │          │ circuit    │ (15000ms)
  │          ▼            ▼
  │    ┌────────────────────────┐
  │    │    QUESTION_REVEAL     │  (Hiển thị đáp án đúng, giải thích chuyên môn,
  │    └───────────┬────────────┘   thống kê chọn A-B-C-D, vinh danh người nhanh nhất)
  │                │ Event: HOST_SHOW_LEADERBOARD
  │                ▼
  │    ┌────────────────────────┐
  │    │      LEADERBOARD       │  (Bảng xếp hạng Top 5/10, hiển thị streak ngọn lửa,
  │    └─────┬────────────┬─────┘   vị trí cá nhân trên điện thoại)
  │          │            │
  │          │ If câu < 15│ If câu == 15
  │          │            │ (Hết bộ câu hỏi)
  └──────────┘            ▼
               ┌────────────────────────┐
               │     FINAL_RESULTS      │  (Bục vinh danh Top 3 Podium, giải Tia chớp,
               └────────────────────────┘   thống kê toàn bộ lớp & phân tích đề bài)
```

### 2.2. Chi tiết Định nghĩa Các Trạng Thái & Điều kiện Chuyển (Guards)

| Trạng thái | Dữ liệu Public gửi đến Client | Quyền hạn Host | Thao tác của Player | Điều kiện chuyển trạng thái tiếp theo |
| :--- | :--- | :--- | :--- | :--- |
| **`LOBBY`** | - `roomCode`, `hostName`<br>- Danh sách người chơi (`id`, `name`, `unit`)<br>- Tổng số người tham gia | Bấm nút **"Bắt đầu trò chơi"** (Khóa phòng hoặc giữ mở cho phép vào muộn) | Chờ tại sảnh, xem danh sách bạn bè cùng phòng | Host kích hoạt `HOST_START_GAME` (Yêu cầu $\ge 1$ người chơi) |
| **`QUESTION_START`** | - `questionIndex` (0 đến 14)<br>- `questionCategory` (`Nhận biết` / `Thông hiểu` / `Tình huống`)<br>- `previewCountdown`: 3 giây | Xem trước câu hỏi trên màn chiếu | Nhìn điện thoại chuẩn bị tư thế bấm nút | Hết 3000ms (tự động chuyển sang `QUESTION_ACTIVE`) |
| **`QUESTION_ACTIVE`** | - `questionText`<br>- 4 phương án lựa chọn (A, B, C, D)<br>- `timeLimitMs`: 15000<br>- `startTime`: Epoch timestamp chuẩn server<br>- `submittedCount` / `totalConnected` | Xem thời gian thực số lượng học viên đã chốt đáp án | Bấm chọn 1 trong 4 ô màu. Sau khi bấm, nút lập tức bị khóa, màn hình hiện "Đã ghi nhận!". | **Điều kiện kép (OR)**:<br>1. **Short-circuit**: Số người đã nộp $\ge$ Số người đang kết nối trong phòng.<br>2. **Timeout**: Hết 15000ms trên server timer. |
| **`QUESTION_REVEAL`** | - `correctOptionIndex`<br>- `explanation` (Nội dung bài giảng Đoàn - Hội)<br>- Phân bổ lựa chọn: `{ A: count, B: count, C: count, D: count }`<br>- `fastestPlayer`: `{ name, unit, responseTimeMs, points }` | Giảng viên dừng lại phân tích, giải thích kiến trúc kế hoạch Đoàn - Hội. Bấm **"Xem Bảng xếp hạng"**. | Xem kết quả cá nhân: Đúng/Sai, điểm nhận được, chuỗi Streak hiện tại. | Host kích hoạt `HOST_SHOW_LEADERBOARD`. |
| **`LEADERBOARD`** | - Top 5/10 bảng xếp hạng hiện tại<br>- Thay đổi vị trí (▲ tăng hạng, ▼ giảm hạng)<br>- Huy hiệu chuỗi đúng (Streak Flame 🔥)<br>- Vị trí cá nhân của từng học viên | Bấm **"Câu hỏi tiếp theo"** (hoặc **"Tổng kết chung cuộc"** nếu là câu 15) | Xem thứ hạng cá nhân và khoảng cách điểm với người phía trước | Host kích hoạt `HOST_NEXT_QUESTION`.<br>- Nếu $i < 14 \rightarrow$ `QUESTION_START`.<br>- Nếu $i = 14 \rightarrow$ `FINAL_RESULTS`. |
| **`FINAL_RESULTS`** | - Top 3 Podium (Hạng 1 - 2 - 3)<br>- Danh hiệu "Tia chớp Đoàn - Hội"<br>- Thống kê: Điểm TB lớp, Câu khó nhất, Câu dễ nhất<br>- Bảng điểm chi tiết toàn bộ học viên | Xuất báo cáo (CSV/JSON), Nút "Tạo phòng mới" | Xem bục vinh danh, hiệu ứng pháo hoa chúc mừng | Trò chơi kết thúc hoàn tất. |

### 2.3. Cơ chế Tự động Ngắt Giờ (Fast Short-Circuit Logic)
Để lớp học diễn ra sôi nổi và không bị "chết thời gian", hệ thống áp dụng cơ chế **Fast Short-Circuit**:
```typescript
// Khi nhận một câu trả lời hợp lệ từ người chơi:
room.recordAnswer(playerId, questionIndex, selectedOption, serverTimestamp);

const totalConnectedPlayers = room.getConnectedActivePlayers().length;
const totalAnswersReceived = room.getCurrentQuestionAnswers().size;

if (totalAnswersReceived >= totalConnectedPlayers && totalConnectedPlayers > 0) {
  // HỦY BỎ ngay lập tức timer đếm ngược 15 giây
  room.clearActiveTimer();
  // Chuyển ngay lập tức sang QUESTION_REVEAL
  room.transitionTo('QUESTION_REVEAL');
  room.broadcastState();
}
```

---

## 3. Thuật Toán Tính Điểm Tốc Độ Chính Xác Mili-Giây & Xếp Hạng

### 3.1. Công thức Tính Điểm Tốc Độ (Millisecond Precision Speed Scoring)

Khi học viên trả lời một câu hỏi:
- Thời gian tối đa của câu hỏi: $T_{\max} = 15\,000 \text{ ms}$ (15 giây).
- Điểm cơ bản tối đa: $P_{\text{base}} = 1\,000 \text{ điểm}$.
- Thời điểm bắt đầu câu hỏi trên server: $T_{\text{start}}$ (Epoch timestamp tính bằng ms).
- Thời điểm server nhận và xác thực đáp án: $T_{\text{submit}}$ (ms).
- Thời gian phản xạ: $\Delta t = T_{\text{submit}} - T_{\text{start}}$.
- Thời gian phản xạ hợp lệ:
  $$\Delta t_{\text{clamped}} = \max\Big(0, \min(15\,000, \Delta t)\Big)$$
- Thời gian còn lại:
  $$T_{\text{remain}} = 15\,000 - \Delta t_{\text{clamped}}$$

#### Quy tắc điểm:
1. **Nếu trả lời ĐÚNG**:
   $$P_{\text{speed}} = \text{round}\left( P_{\text{base}} \times \frac{T_{\text{remain}}}{15\,000} \right)$$
   - Trả lời ngay lập tức ($\Delta t = 0 \text{ ms}$): $1\,000 \times \frac{15000}{15000} = \mathbf{1\,000 \text{ điểm}}$.
   - Trả lời ở giây thứ 5 ($\Delta t = 5\,000 \text{ ms}$, còn 10s): $1\,000 \times \frac{10000}{15000} = \mathbf{667 \text{ điểm}}$.
   - Trả lời ở giây thứ 14 ($\Delta t = 14\,000 \text{ ms}$, còn 1s): $1\,000 \times \frac{1000}{15000} = \mathbf{67 \text{ điểm}}$.
   - Trả lời sát nút $14\,999 \text{ ms}$ (còn 1 ms): $1\,000 \times \frac{1}{15000} = \mathbf{0 \text{ hoặc } 1 \text{ điểm}}$.
2. **Nếu trả lời SAI hoặc HẾT GIỜ (Timeout)**:
   $$P_{\text{speed}} = \mathbf{0 \text{ điểm}}$$

---

### 3.2. Điểm Thưởng Chuỗi Trả Lời Đúng Liên Tiếp (Streak Bonus)

Chuỗi đúng $S$ phản ánh tính ổn định và kiến thức vững chắc của cán bộ Đoàn - Hội:
- Khi trả lời **ĐÚNG**: $S_{\text{new}} = S_{\text{prev}} + 1$.
- Khi trả lời **SAI** hoặc **HẾT GIỜ**: $S_{\text{new}} = \mathbf{0}$.

Bảng điểm thưởng chuỗi:
| Chuỗi đúng liên tiếp ($S$) | Điểm thưởng cộng thêm ($\text{Bonus}$) | Huy hiệu giao diện |
| :---: | :---: | :---: |
| $S \le 1$ | $+0$ điểm | — |
| $S = 2$ | $+100$ điểm | 🔥 Streak x2 |
| $S = 3$ | $+200$ điểm | 🔥 Streak x3 |
| $S = 4$ | $+300$ điểm | ⚡ Super Streak x4 |
| $S \ge 5$ | $+500$ điểm | 🌟 Unstoppable x5+ |

**Tổng điểm câu hỏi**:
$$P_{\text{total}} = \begin{cases} P_{\text{speed}} + \text{StreakBonus}(S_{\text{new}}) & \text{khi trả lời đúng} \\ 0 & \text{khi trả lời sai / hết giờ} \end{cases}$$

---

### 3.3. Quy Tắc Phân Định Thứ Hạng & Xử Lý Hòa Điểm (Tie-Breaking Rules)
Bảng xếp hạng tổng sắp được sắp xếp đa tầng (Multi-tier sort) hoàn toàn tất định:
1. **Ưu tiên 1 (Score)**: Tổng điểm tích lũy cao hơn xếp trên (`totalScore` giảm dần).
2. **Ưu tiên 2 (Speed Tie-breaker)**: Nếu bằng điểm, người có **tổng thời gian phản xạ thấp hơn** (bấm nhanh hơn) xếp trên (`totalResponseTimeMs` tăng dần).
3. **Ưu tiên 3 (Accuracy)**: Nếu vẫn bằng nhau, người có **số câu trả lời đúng nhiều hơn** xếp trên (`correctCount` giảm dần).
4. **Ưu tiên 4 (First-come)**: Người tham gia phòng sớm hơn xếp trên (`joinedAt` tăng dần).

---

### 3.4. Hệ Thống Giải Thưởng & Thống Kê Đặc Biệt

#### A. Người Nhanh Nhất Từng Câu ("Fastest per Question")
- Điều kiện: Thuộc nhóm trả lời **ĐÚNG** câu hỏi đó.
- Công thức: Người có $\Delta t$ nhỏ nhất.
- Hiển thị trang trọng ngay trên màn hình `QUESTION_REVEAL`:
  > *"🏆 Người nhanh nhất câu 3: Nguyễn Văn A (Chi đoàn K21 Cơ khí) — 1.24 giây (+917 điểm)"*

#### B. Giải Thưởng Danh Dự "Tia Chớp Đoàn - Hội" (Lightning Award)
- Ý nghĩa: Tôn vinh học viên có phản xạ tư duy nhạy bén và tốc độ xử lý tình huống nhanh nhất toàn khóa học.
- Điều kiện xét duyệt: Trả lời đúng tối thiểu 1 câu hỏi trong suốt trò chơi.
- Công thức:
  $$\bar{t}_{\text{lightning}} = \min_{p} \left( \frac{\sum_{i \in \text{Correct}_p} \Delta t_{p, i}}{|\text{Correct}_p|} \right)$$
- Phụ tiêu chí: Nếu trùng thời gian trung bình, ưu tiên người có nhiều câu đúng hơn.

#### C. Bục Vinh Danh Top 3 (Podium)
- **Hạng 1 (Quán quân — Huy chương Vàng)**: Cúp vô địch, hiệu ứng pháo hoa, vinh danh đơn vị.
- **Hạng 2 (Á quân 1 — Huy chương Bạc)**: Bục bạc bên trái.
- **Hạng 3 (Á quân 2 — Huy chương Đồng)**: Bục đồng bên phải.

#### D. Thống Kê Phân Tích Toàn Lớp (Class Analytics)
- Điểm trung bình cả lớp: $\frac{\sum P}{N}$.
- Tỷ lệ trả lời đúng theo từng câu: $\frac{N_{\text{correct}}}{N} \times 100\%$.
- **"Câu hỏi thách thức nhất" (Hardest Question)**: Câu có tỷ lệ trả lời đúng thấp nhất (cần giảng viên lưu ý ôn tập kỹ hơn).
- **"Câu hỏi xuất sắc nhất" (Easiest Question)**: Câu có tỷ lệ trả lời đúng cao nhất.

---

## 4. Thiết Kế Kiểm Thử Tự Động Với Vitest & Mô Phỏng Nhiều Người Chơi (Testability)

### 4.1. Kiến Trúc Tách Biệt Động Cơ (Headless Engine Pattern)
Để kiểm thử đạt tốc độ tối đa và không phụ thuộc vào hạ tầng mạng, toàn bộ logic phòng chơi được gói gọn trong module TypeScript thuần `QuizRoom`:
```
src/lib/quiz/
├── types.ts          # Interfaces, Enums, Event DTOs
├── scoring.ts        # Thuật toán tính điểm tốc độ, streak, tie-breaking (Pure Functions)
├── QuizRoom.ts       # Finite State Machine & Quản lý vòng đời phòng chơi
└── roomManager.ts    # In-memory Store Singleton & Event Dispatcher
```

### 4.2. Chiến Lược Kiểm Thử Unit Test (Scoring & State Machine)
Sử dụng `vi.useFakeTimers()` trong Vitest:
- **Test tốc độ mili-giây**:
  - Bấm ở 0ms $\rightarrow$ 1000 điểm.
  - Bấm ở 7500ms $\rightarrow$ 500 điểm.
  - Bấm ở 15000ms $\rightarrow$ 0 điểm.
  - Bấm ở 15001ms $\rightarrow$ Quá hạn, 0 điểm.
- **Test chuỗi đúng (Streak)**:
  - 1 câu đúng $\rightarrow$ Streak 1 (+0đ).
  - 2 câu đúng liên tiếp $\rightarrow$ Streak 2 (+100đ).
  - 5 câu đúng liên tiếp $\rightarrow$ Streak 5 (+500đ).
  - Câu thứ 6 sai $\rightarrow$ Điểm 0, Streak reset về 0.
- **Test phân định hòa điểm**:
  - Người A (3000đ, tổng thời gian 8500ms) vs Người B (3000đ, tổng thời gian 7200ms) $\rightarrow$ Người B xếp trên Người A.

### 4.3. Kịch Bản Kiểm Thử Tích Hợp Mô Phỏng $\ge 10$ Người Chơi Đồng Thời
Một bài test tích hợp hoàn chỉnh sẽ mô phỏng:
1. Tạo 1 phòng chơi mới.
2. Cho 12 người chơi ảo (Player 1 đến Player 12) cùng `join` vào phòng.
3. Host bắt đầu game $\rightarrow$ Chuyển qua `QUESTION_START` (3s) $\rightarrow$ `QUESTION_ACTIVE`.
4. Mô phỏng 12 người chơi nộp đáp án với các độ trễ ngẫu nhiên từ $800 \text{ ms}$ đến $9\,500 \text{ ms}$:
   - Kiểm tra **Fast Short-Circuit**: Ngay khi người thứ 12 nộp bài ở $9\,500 \text{ ms}$, phòng chơi **tự động chuyển sang `QUESTION_REVEAL`** mà không cần đợi đến $15\,000 \text{ ms}$.
5. Kiểm tra người nhanh nhất câu đó được xác định chính xác là người có timestamp thấp nhất trong nhóm trả lời đúng.
6. Cho Host chuyển tiếp qua đủ 15 câu hỏi.
7. Kiểm tra màn hình `FINAL_RESULTS`:
   - Xác định đúng Top 3 Podium.
   - Xác định đúng danh hiệu "Tia chớp Đoàn - Hội".
   - Tính toán chính xác câu dễ nhất, câu khó nhất.
8. Toàn bộ kịch bản 15 câu x 12 người chơi chạy xong trong **< 300ms** trên Vitest nhờ fake timers!

---

## 5. Bản Thiết Kế Giao Diện Tối Ưu (UI/UX Blueprint)

### 5.1. Màn Hình Giảng Viên (Host View - Tối ưu cho Máy Chiếu & Màn Hình Lớn)
- **Tỷ lệ 16:9 widescreen**: Độ tương phản cao, phông chữ lớn, dễ nhìn từ khoảng cách 15-20 mét trong hội trường.
- **Mã PIN & QR Code**: Nổi bật ngay góc trên cùng hoặc toàn màn hình trong pha Lobby.
- **Đồng hồ đếm ngược sinh động**: Vòng tròn SVG đếm lùi với màu chuyển sắc (Xanh $\rightarrow$ Vàng $\rightarrow$ Đỏ khi còn dưới 5 giây) kèm hiệu ứng tích tắc âm thanh (Web Audio API không cần tải file ngoài).
- **Thanh tiến độ phản hồi**: Thanh hiển thị số lượng học viên đã trả lời (ví dụ: `28 / 30 học viên đã nộp bài`).
- **Màu sắc 4 đáp án nhận diện chuẩn Kahoot**:
  - Phương án A: Đỏ (Tam giác ▲)
  - Phương án B: Xanh dương (Hình thoi ◆)
  - Phương án C: Vàng (Tròn ●)
  - Phương án D: Xanh lá (Vuông ■)

### 5.2. Màn Hình Học Viên (Player View - Tối ưu cho Điện Thoại Di Động)
- **Giao diện chạm ngón tay cái (Thumb-zone friendly)**:
  - 4 nút bấm lớn chiếm trọn nửa dưới màn hình với 4 màu và biểu tượng hình học tương ứng.
  - Phản hồi rung nhẹ (Haptic Feedback qua `navigator.vibrate` nếu trình duyệt hỗ trợ) và hiệu ứng đổi màu ngay khi ngón tay chạm vào đáp án.
- **Trạng thái nộp bài rõ ràng**:
  - Ngay khi bấm: Nút đã chọn sáng viền, 3 nút còn lại mờ đi, hiển thị thông báo "Đã nhận câu trả lời! Hãy chờ kết quả trên màn chiếu...".
- **Màn hình công bố kết quả cá nhân**:
  - Hiện thẻ lớn: "CHÍNH XÁC! 🎉" (kèm số điểm nhận được và chuỗi Streak) hoặc "TIẾC QUÁ! 😢" (kèm giải thích ngắn).

---

## 6. Lộ Trình Triển Khai Cho Nhóm Kỹ Thuật (Action Plan)

Dựa trên thiết kế kiến trúc này, nhóm triển khai có thể chia thành 3 mũi nhọn độc lập:
1. **Mũi nhọn 1 (Core Engine & Tests)**:
   - Viết `src/lib/quiz/types.ts`, `scoring.ts`, `QuizRoom.ts`, `roomManager.ts`.
   - Viết trọn bộ unit test `tests/quiz-scoring.test.ts` và integration test `tests/quiz-room-lifecycle.test.ts`.
2. **Mũi nhọn 2 (API Handlers & Data Contract)**:
   - Xây dựng `src/app/api/quiz/rooms/...` (Create, Join, Events SSE, Answers, Action).
   - Viết client hook `useQuizRoomSync.ts` hỗ trợ SSE + Polling fallback.
3. **Mũi nhọn 3 (UI Components & Pages)**:
   - Xây dựng trang Host (`/ai-tools/training-quiz/host`).
   - Xây dựng trang Player (`/ai-tools/training-quiz/play` và `/ai-tools/training-quiz/join`).
   - Tích hợp thẻ truy cập vào danh mục `src/lib/fallback.ts` và trang `src/app/ai-tools/page.tsx`.

---
*Báo cáo được lập bởi `explorer_realtime_1` — Sẵn sàng bàn giao cho `orchestrator_1` và các sub-agent triển khai.*
