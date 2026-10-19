## 2026-10-17T17:29:21Z

You are the Milestone 3 Worker for the Live Interactive Training Quiz Game (Realtime Room Sync & API Routes).
Your working directory is: c:\Users\DELL\Desktop\thansxuan-portfolio\.agents\teamwork\worker_m3_1
Your parent is orchestrator_1 (conversation ID: fc2fb7d8-6d75-499a-bc79-478bc49f5e00).

MANDATORY FIRST STEP:
Read the original request at: `c:\Users\DELL\Desktop\thansxuan-portfolio\.agents\teamwork\ORIGINAL_REQUEST.md`.
Read the project architecture and interface contracts at: `c:\Users\DELL\Desktop\thansxuan-portfolio\PROJECT.md`.
Read existing engine files: `src/lib/training-quiz/roomEngine.ts`, `src/lib/training-quiz/roomManager.ts`, `src/lib/training-quiz/types.ts`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You own exclusively:
- `c:\Users\DELL\Desktop\thansxuan-portfolio\src\app\api\quiz\rooms\route.ts`
- `c:\Users\DELL\Desktop\thansxuan-portfolio\src\app\api\quiz\rooms\[code]\state\route.ts`
- `c:\Users\DELL\Desktop\thansxuan-portfolio\src\app\api\quiz\rooms\[code]\sse\route.ts`
- `c:\Users\DELL\Desktop\thansxuan-portfolio\src\app\api\quiz\rooms\[code]\join\route.ts`
- `c:\Users\DELL\Desktop\thansxuan-portfolio\src\app\api\quiz\rooms\[code]\action\route.ts`
- `c:\Users\DELL\Desktop\thansxuan-portfolio\src\app\api\quiz\rooms\[code]\answer\route.ts`
- `tests/training-quiz-api.test.ts`
DO NOT modify any other files.

YOUR MISSION:
1. Implement the API Route Handlers in Next.js 16 App Router format using `QuizRoomManager.getInstance()`:
   - `POST /api/quiz/rooms`: Create a new room with optional host nickname -> returns `{ roomCode: string, hostToken: string, state: RoomState }`.
   - `GET /api/quiz/rooms/[code]/state`: Retrieve current sanitized room state (hiding `correctIndex` from players during active questions). Accepts query param `?playerId=...&hostToken=...`.
   - `GET /api/quiz/rooms/[code]/sse`: Server-Sent Events stream using `ReadableStream`. Subscribes to room events and pushes SSE messages (`event: roomState\ndata: ...\n\n` or `event: ping\n\n`). Closes cleanly on client disconnect.
   - `POST /api/quiz/rooms/[code]/join`: Join room with `{ nickname: string, unit?: string }`. Handles validation and returns `{ playerId: string, state: RoomState }`.
   - `POST /api/quiz/rooms/[code]/action`: Host controls with `{ hostToken: string, action: 'START' | 'NEXT_QUESTION' | 'SHOW_LEADERBOARD' | 'END_GAME' }`. Validates hostToken.
   - `POST /api/quiz/rooms/[code]/answer`: Player submits answer with `{ playerId: string, questionIndex: number, selectedIndex: number, clientTimeMs: number }`. Calculates score, updates streak, checks for fast short-circuit.
2. Implement comprehensive unit & integration tests in `tests/training-quiz-api.test.ts`:
   - Test creating room, joining player, fetching state, host actions, answer submissions, invalid inputs, and error handling (404 room not found, 401 unauthorized host action, 400 bad answer).
3. Run tests with `npx vitest run tests/training-quiz-api.test.ts` to ensure 100% pass.
4. Verify `npx tsc --noEmit` and `npx eslint` pass cleanly.
5. Write `progress.md` and `handoff.md` in your working directory.
6. When complete, send a message to orchestrator_1 (fc2fb7d8-6d75-499a-bc79-478bc49f5e00) with your results.
