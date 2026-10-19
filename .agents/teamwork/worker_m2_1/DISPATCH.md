## 2026-10-17T17:17:18Z
You are the Milestone 2 Worker for the Live Interactive Training Quiz Game (Scoring & Room Engine).
Your working directory is: c:\Users\DELL\Desktop\thansxuan-portfolio\.agents\teamwork\worker_m2_1
Your parent is orchestrator_1 (conversation ID: fc2fb7d8-6d75-499a-bc79-478bc49f5e00).

MANDATORY FIRST STEP:
Read the original request at: `c:\Users\DELL\Desktop\thansxuan-portfolio\.agents\teamwork\ORIGINAL_REQUEST.md`.
Read the project architecture and interface contracts at: `c:\Users\DELL\Desktop\thansxuan-portfolio\PROJECT.md`.
Read the realtime and scoring specifications from: `c:\Users\DELL\Desktop\thansxuan-portfolio\.agents\teamwork\explorer_realtime_1\survey_report.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You own exclusively:
- `c:\Users\DELL\Desktop\thansxuan-portfolio\src\lib\training-quiz\scoringEngine.ts`
- `c:\Users\DELL\Desktop\thansxuan-portfolio\src\lib\training-quiz\roomEngine.ts`
- `c:\Users\DELL\Desktop\thansxuan-portfolio\src\lib\training-quiz\roomManager.ts`
- `tests/training-quiz-scoring.test.ts`
- `tests/training-quiz-engine.test.ts`
DO NOT modify any other files.

YOUR MISSION:
1. Implement `src/lib/training-quiz/scoringEngine.ts`:
   - Millisecond-precision speed score: If correct, BasePoints (1000) * (RemainingTimeMs / 15000) + StreakBonus.
   - Streak bonus tiers: streak 1 = +0, streak 2 = +100, streak 3 = +200, streak 4 = +300, streak 5+ = +500.
   - If incorrect or timeout (remainingTime <= 0), score = 0, streak = 0.
   - Leaderboard generator with deterministic tie-breaking (score DESC, totalResponseTimeMs ASC, correctCount DESC, join order).
   - Fastest player per question award calculator.
   - Final awards: Top 3 Podium (Rank 1, 2, 3), Lightning Award ("Tia chớp Đoàn - Hội" - fastest average response time among correct answers), and class statistics (average score, accuracy per question, hardest/easiest questions).
2. Implement `src/lib/training-quiz/roomEngine.ts`:
   - Headless `QuizRoom` class managing the full 6-state state machine: `LOBBY`, `QUESTION_START`, `QUESTION_ACTIVE`, `QUESTION_REVEAL`, `LEADERBOARD`, `FINAL_RESULTS`.
   - 15-second countdown timer.
   - Instant Fast Short-Circuit: If all connected players submit answers before 15s, immediately advance to `QUESTION_REVEAL`.
   - Sanitized state method: Hides `correctIndex` from players while in `QUESTION_ACTIVE`.
3. Implement `src/lib/training-quiz/roomManager.ts`:
   - In-memory singleton attached to `globalThis.__QUIZ_ROOMS__` managing active rooms by 6-char room code, with room creation, player joining, host authorization, and auto-cleanup of stale rooms (> 2 hours).
4. Implement comprehensive unit & integration tests:
   - `tests/training-quiz-scoring.test.ts`: Verify speed scoring formula at various millisecond points, streak bonuses, penalty on wrong/timeout, tie-breaking rules, and awards.
   - `tests/training-quiz-engine.test.ts`: Verify state machine transitions, fast short-circuit, fake timer progression with `vi.useFakeTimers()`, and simulation of >= 10 concurrent players going through 15 questions.
5. Run tests with `npx vitest run tests/training-quiz-scoring.test.ts tests/training-quiz-engine.test.ts` to ensure 100% pass.
6. Write `progress.md` and `handoff.md` in your working directory.
7. When complete, send a message to orchestrator_1 (fc2fb7d8-6d75-499a-bc79-478bc49f5e00) with your results.
