# Test Infrastructure & Strategy: Live Interactive Training Quiz Game

## 1. Overview & Strategy

The **Live Interactive Training Quiz Game** is an interactive, real-time, Kahoot-style quiz application integrated into `thansxuan-portfolio` for the training topic *"Công tác xây dựng kế hoạch và tổ chức hoạt động Đoàn - Hội"* (HCM-UTE).

To guarantee rock-solid stability, precision scoring, and synchronization without paying for external cloud services, the project follows an **opaque-box, requirement-driven, 4-tier automated testing strategy** built on **Vitest** and **React Testing Library**.

### Core Testing Principles
1. **Opaque-Box & Requirement-Driven**: Tests are derived strictly from business requirements (`ORIGINAL_REQUEST.md`) and technical contracts (`PROJECT.md`). Tests exercise behavior through public interfaces rather than private implementation details.
2. **Sub-Millisecond Determinism**: Timing-sensitive logic (such as the 15-second countdown and millisecond response-time scoring) is tested using Vitest fake timers (`vi.useFakeTimers()`), enabling instant execution of complex multi-round simulations in under 500ms.
3. **Multiplayer Concurrency & Scaling**: The test suite simulates realistic concurrent classroom conditions with 10 to 15+ concurrent players answering simultaneously with varying latencies and accuracy patterns.
4. **Self-Contained & Isolated**: Every test suite cleans up its environment (resetting timers, restoring mocks, purging in-memory rooms) to prevent cross-test leakage.

---

## 2. The 4-Tier Test Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│ Tier 4: Real-World Classroom Simulation                                │
│ - 12-15 concurrent players, 15 authentic questions, room creation      │
│ - Full lifecycle: LOBBY -> Q1..Q15 -> FINAL_RESULTS (Podium & Analytics)│
├────────────────────────────────────────────────────────────────────────┤
│ Tier 3: Cross-Feature Combinations                                     │
│ - Fast Short-Circuit when 100% of connected players submit early       │
│ - Streak Bonus compounding with millisecond speed bonus                │
│ - Host state transition guards & unauthorized action rejection         │
├────────────────────────────────────────────────────────────────────────┤
│ Tier 2: Boundary & Corner Cases                                        │
│ - Exact boundary timing: 0ms, 1ms, 7500ms, 14999ms, 15000ms, 15001ms   │
│ - Multi-tier tie-breaking: identical score -> speed -> accuracy -> join│
│ - Streak resets on wrong answer / timeout                              │
│ - Empty / whitespace-only player names and late joiners                │
├────────────────────────────────────────────────────────────────────────┤
│ Tier 1: Feature Coverage (Unit & Contract Verification)                │
│ - 15 Authentic questions: 5 Nhận biết, 5 Thông hiểu, 5 Tình huống     │
│ - Question schema integrity: 4 options, valid correctIndex, 15s limit  │
│ - Speed score calculation formula & Streak bonus tiers                 │
│ - Room finite state machine transitions                                │
│ - Podium Top 3, Lightning Award, and Class Analytics calculations      │
└────────────────────────────────────────────────────────────────────────┘
```

### Tier 1: Feature Coverage (Isolated Core Logic)
Focuses on individual units of functionality in complete isolation:
- **Question Bank Verification**: Validates all 15 authentic questions extracted from the HCMUTE training slides (`spec_miner_docs_1/survey_report.md`), ensuring exactly 5 Nhận biết, 5 Thông hiểu, 5 Tình huống thực tế, 4 options each, and explanatory text citing slide materials.
- **Scoring Engine**: Evaluates `calculateScore(isCorrect, responseTimeMs, currentStreak)` against theoretical mathematical formulas.
- **Leaderboard Generation**: Evaluates `getLeaderboard(players)` to produce correct ordering and metadata.
- **Awards & Analytics**: Evaluates `getFinalAwards(players, questions)` for Top 3 Podium, Lightning Award, and class-wide statistics.

### Tier 2: Boundary & Corner Cases
Tests edge conditions, extreme limits, and negative pathways:
- **0ms Response Time**: Immediate click yields full $1000$ points + streak bonus.
- **Exact Deadline (15000ms)**: $0$ speed points earned, but marked as correct if within limit.
- **Timeout (> 15000ms)**: Yields $0$ points and resets streak to $0$.
- **Tie-Breaker Hierarchy**: Four-stage deterministic sorting:
  1. Score DESC
  2. Total Response Time ASC (fastest total reflex)
  3. Correct Answer Count DESC
  4. Room Join Timestamp ASC
- **Max Streak Transitions**: Verifies streak bonuses across $S=1$ ($+0$), $S=2$ ($+100$), $S=3$ ($+200$), $S=4$ ($+300$), $S\ge 5$ ($+500$), and instantaneous drop to $0$ upon any error.

### Tier 3: Cross-Feature Combinations
Tests complex interactions between distinct functional modules:
- **Fast Short-Circuit Trigger**: Verifies that when all active players in a room submit their answers before 15 seconds, the countdown timer is cancelled immediately and the room transitions to `QUESTION_REVEAL`.
- **Compound Scoring**: Tests how players with long streaks and variable response times interact on the leaderboard compared to fast single-answer players.
- **Host Security & State Guarding**: Verifies that actions like `START`, `NEXT_QUESTION`, `SHOW_LEADERBOARD`, and `END_GAME` cannot be called out of order or with invalid tokens.

### Tier 4: Real-World Application Scenario
End-to-end integration simulation modeling an actual training workshop:
- **Participants**: 12 diverse simulated players (including top performers, speedsters, deliberate thinkers, and struggling learners).
- **Duration**: Complete pass through all 15 questions sequentially.
- **Execution**: Automated progression via fake timers verifying state changes, fastest-per-question honors, real-time leaderboard evolution, and final podium / analytics generation.

---

## 3. Test Runner & Environment Configuration

- **Framework**: Vitest `v3.2.7`
- **Environment**: `jsdom` (with DOM & Web API polyfills)
- **Timer Management**: `vi.useFakeTimers()` for instant execution of 15-second timers and millisecond latencies.
- **Global Setup**: `tests/setup.ts` providing standard matchers and DOM cleanups.
- **Path Aliases**: `@/` mapped to `src/` via `vitest.config.ts`.

### Test Commands
```bash
# Run the complete test suite once
npm test

# Run tests in watch mode during development
npm run test:watch

# Run only the E2E training quiz test suite
npx vitest run tests/training-quiz-e2e.test.ts

# Run all quiz-related test suites
npx vitest run tests/training-quiz-*.test.ts

# Full verification (tests + build)
npm run verify
```

---

## 4. Requirements Traceability Matrix

| Requirement | Acceptance Criteria | Test File | Test Tier |
|:---|:---|:---|:---:|
| **R1: 15 Questions Bank** | 15 authentic questions, 3 levels (5/5/5), 4 options, 15s limit | `training-quiz-questions.test.ts`, `training-quiz-e2e.test.ts` | Tier 1 |
| **R2: Kahoot Room Sync** | Host room creation, player lobby, 6-state transitions | `training-quiz-engine.test.ts`, `training-quiz-e2e.test.ts` | Tier 1, 3 |
| **R2: Fast Short-Circuit** | Immediate transition to reveal when all players finish early | `training-quiz-engine.test.ts`, `training-quiz-e2e.test.ts` | Tier 3 |
| **R3: Speed Scoring** | $1000 \times (T_{\text{remain}} / 15000)$, 0 on wrong/timeout | `training-quiz-scoring.test.ts`, `training-quiz-e2e.test.ts` | Tier 1, 2 |
| **R3: Streak Bonus** | +0, +100, +200, +300, +500; reset on failure | `training-quiz-scoring.test.ts`, `training-quiz-e2e.test.ts` | Tier 1, 2, 3 |
| **R3: Tie-Breaker** | Score DESC $\rightarrow$ Time ASC $\rightarrow$ Correct DESC $\rightarrow$ Join ASC | `training-quiz-scoring.test.ts`, `training-quiz-e2e.test.ts` | Tier 2 |
| **R3: Awards & Podium** | Fastest per question, Lightning Award, Top 3 Podium | `training-quiz-scoring.test.ts`, `training-quiz-e2e.test.ts` | Tier 1, 4 |
| **R3: Class Analytics** | Class average, accuracy per question, hardest/easiest questions | `training-quiz-scoring.test.ts`, `training-quiz-e2e.test.ts` | Tier 1, 4 |
| **R4: Full E2E Simulation**| $\ge 10$ players, 15 questions from start to finish | `training-quiz-e2e.test.ts` | Tier 4 |
