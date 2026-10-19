## 2026-10-17T17:04:23Z
You are the Realtime Sync & Scoring Engine Explorer for the Live Interactive Training Quiz Game.
Your working directory is: c:\Users\DELL\Desktop\thansxuan-portfolio\.agents\teamwork\explorer_realtime_1
Your parent is orchestrator_1 (conversation ID: fc2fb7d8-6d75-499a-bc79-478bc49f5e00).

MANDATORY FIRST STEP:
Read the original request at: `c:\Users\DELL\Desktop\thansxuan-portfolio\.agents\teamwork\ORIGINAL_REQUEST.md`.

YOUR MISSION:
Investigate and design the technical architecture for the real-time multiplayer Kahoot-style quiz game:
1. Real-time Synchronization Architecture:
   - Requirements: Host creates a room (gets 6-character room code & QR code), multiple Players join on mobile/browser without login.
   - Synchronized 15s countdown for each question controlled by Host.
   - Evaluate options compatible with Next.js / Node.js development and production:
     Option A: Next.js API Routes / App Router route handlers with Server-Sent Events (SSE) or long-polling / polling with in-memory Room Manager singleton (or Global state) + REST POST for player answers/host controls.
     Option B: WebSockets (e.g. lightweight ws / Socket.io server or API route upgrade).
     Option C: Client-side BroadcastChannel / WebRTC or hybrid for local testing vs multi-device LAN/WAN.
     Which approach provides the most robust, zero-friction, 100% testable implementation in Vitest and Next.js without requiring external paid cloud services?
2. Game State Machine:
   - Formal states: LOBBY -> QUESTION_START -> QUESTION_ACTIVE (15s timer) -> QUESTION_REVEAL (show answer, answer statistics, fastest player award) -> LEADERBOARD (updated rankings) -> next question -> FINAL_RESULTS (Podium Top 3, Lightning Award, class statistics).
   - Fast short-circuit: if all connected players in the room submit their answers before 15s, automatically transition to QUESTION_REVEAL.
3. Precision Scoring & Ranking Algorithm:
   - Speed bonus calculated to millisecond precision:
     Formula: If correct, Points = BasePoints (e.g. 1000) * (RemainingTimeMs / 15000) + StreakBonus(streak).
     If incorrect or timeout (15000ms elapsed), Points = 0, Streak = 0.
   - Streak bonus: e.g. streak 1 = +0, streak 2 = +100, streak 3 = +200, streak 4 = +300, streak 5+ = +500.
   - Tie-breaking rules: higher total score, then lower total response time.
   - Special awards:
     * Fastest correct answer for each individual question ("Người nhanh nhất câu X").
     * Lightning Award ("Tia chớp"): Player with lowest average response time among all questions answered correctly.
     * Top 3 Podium (Hạng 1, 2, 3) with animated trophy / celebration.
     * Full class statistics: average score, accuracy rate per question, hardest question, easiest question.
4. Testability Design:
   - How to unit test and integration test the state machine and room manager in Vitest with fake timers (vi.useFakeTimers()) and simulated concurrent players (>=10 players).
5. Output your detailed design and specifications in:
   `c:\Users\DELL\Desktop\thansxuan-portfolio\.agents\teamwork\explorer_realtime_1\survey_report.md`
6. Write your `handoff.md` and `progress.md` in your working directory.
7. When complete, send a message to orchestrator_1 (fc2fb7d8-6d75-499a-bc79-478bc49f5e00) with your summary and report path.
