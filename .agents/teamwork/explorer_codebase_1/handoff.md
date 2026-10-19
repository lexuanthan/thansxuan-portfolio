# Handoff Report: Codebase & Test Architecture Survey for Live Interactive Training Quiz Game

**Agent**: `explorer_codebase_1`  
**Working Directory**: `c:\Users\DELL\Desktop\thansxuan-portfolio\.agents\teamwork\explorer_codebase_1`  
**Recipient**: `orchestrator_1` (`fc2fb7d8-6d75-499a-bc79-478bc49f5e00`)  
**Date**: 2026-10-18T00:15:00Z  
**Handoff Type**: Hard (Investigation complete)

---

## 1. Observation

1. **Framework & Package Versions**:
   - `package.json:20-23`: `"next": "16.3.5"`, `"react": "19.2.8"`, `"react-dom": "19.2.8"`, `"@supabase/ssr": "^0.5.2"`, `"@supabase/supabase-js": "^2.45.0"`.
   - `package.json:25,38`: `"@tailwindcss/postcss": "^4.3.3"`, `"tailwindcss": "^4"`, `"vitest": "^3.0.0"`.
   - `next.config.ts:5`: `reactCompiler: true`.

2. **App Router Structure & Styling**:
   - Source code resides in `src/app/` (`layout.tsx`, `page.tsx`, `globals.css`).
   - Theme defined in `src/app/globals.css:9-68` with `@theme`:
     - Font: `--font-sans: var(--font-be-vietnam), ui-sans-serif, system-ui, sans-serif`.
     - HCMUTE Blue: `--color-brand-600: #004098`, `--color-brand-500: #0056b3`.
     - HCMUTE Red: `--color-accent-red-600: #d9232e`.
     - Radii: `--radius-btn: 0.625rem (10px)`, `--radius-card: 0.75rem (12px)`, `--radius-panel: 1rem (16px)`.

3. **Tools Catalog Mechanism**:
   - Route `/ai-tools` in `src/app/ai-tools/page.tsx:72-100` calls `getAiTools()` from `src/lib/queries.ts:50-67`.
   - Fallback data defined in `src/lib/fallback.ts:115-191` (`FALLBACK_AI_TOOLS`).
   - Data structure `AiTool` in `src/lib/types.ts:18-31` with `status_color` matching `STATUS_COLORS` and `color` matching `COLOR_PRESETS`.
   - Existing tools pattern: `/ai-tools/career-guidance`, `/ai-tools/brand-strategy`, `/ai-tools/logo-composer`, `/ai-tools/edupath`, `/ai-tools/huong-nghiep`.
   - Home page sidebar (`src/app/page.tsx:273-320`) renders top 5 tools from `getAiTools()`.

4. **Testing Baseline Execution**:
   - Running `npm run test` (`vitest run`):
     - Command output: `Test Files 38 passed (38), Tests 638 passed (638), Duration 31.20s`, Exit code: `0`.
   - Running `npm run lint` (`eslint`):
     - Command output: `139 problems (0 errors, 139 warnings)`, Exit code: `0`.
   - Running `npm run build` (`next build`):
     - Output: `Next.js 16.3.5 (Turbopack)`, `Compiled successfully in 3.5s`, `Finished TypeScript in 3.4s`, `Generating static pages using 7 workers (28/28) in 28.9s`, Exit code: `0`.

5. **Test Fixture Constraint in `tests/fallback.test.ts`**:
   - Line 48-49: `describe("FALLBACK_AI_TOOLS", () => { it("có đủ 7 tool, đều published và id không trùng", () => { expect(FALLBACK_AI_TOOLS).toHaveLength(7);`
   - Adding a new tool to `FALLBACK_AI_TOOLS` without incrementing this expectation to `8` will cause test failure.

6. **Realtime Transport & Credentials**:
   - `.env.local:1-3` contains live `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Supabase client initialized via `createBrowserClient` in `src/lib/supabase/client.ts:8`.
   - `@supabase/supabase-js` provides `supabase.channel(...)` supporting `broadcast` and `presence`.

7. **Reference Training Materials**:
   - Directory `D:\DU LIEU DOAN TRUONG\BTV ĐOÀN TRƯỜNG 21` exists and contains:
     - `Bai_Thuyet_Trinh_Ky_nang_Xay_dung_Ke_hoach_va_To_chuc_Hoat_dong_Doan_Hoi_HCMUTE.docx` (68,857 bytes).
     - `Chuyen_de_Ky_nang_Xay_dung_Ke_hoach_va_To_chuc_Hoat_dong_Doan_Hoi_HCMUTE.pptx` (22,946,359 bytes).
     - `Chuyen_de_Ky_nang_Xay_dung_Ke_hoach_va_To_chuc_Hoat_dong_Doan_Hoi_HCMUTE_V3.pptx` (22,209,386 bytes).
   - Python environment verification: `python-docx` is installed and functional.

---

## 2. Logic Chain

1. From **Observation 1 & 2**, the project uses Next.js 16 App Router, React 19, and Tailwind v4. Any interactive game screen must use `"use client";` and must wrap client query-reading components in `<Suspense>` to avoid breaking Next.js 16 build prerendering.
2. From **Observation 3**, every internal tool follows the route format `/ai-tools/<tool-slug>` and is registered in `FALLBACK_AI_TOOLS` and optionally in the Supabase database. Therefore, the canonical route for the Quiz Game must be `/ai-tools/training-quiz` (with optional redirect/rewrite from `/tools/training-quiz`).
3. From **Observation 4 & 5**, the baseline codebase is in pristine condition (638 passing tests, 0 build errors). However, `tests/fallback.test.ts` explicitly asserts `expect(FALLBACK_AI_TOOLS).toHaveLength(7)`. Therefore, any integration updating `FALLBACK_AI_TOOLS` must update `tests/fallback.test.ts` to `8` to maintain 100% test pass rate.
4. From **Observation 6**, Supabase Realtime Channels (`broadcast` and `presence`) can power live multiplayer synchronization across host computer and mobile players. To guarantee that automated tests (`vitest`) run rapidly and 100% reliably in CI/offline without network, an in-memory/BroadcastChannel fallback driver must be provided behind a common `QuizSyncTransport` interface.
5. From **Observation 7**, the official training documents and Python extraction tools are present locally, allowing exact extraction of the 15 questions across 3 cognitive levels as specified in R1.

---

## 3. Caveats

- **Database RLS Policies**: While Supabase Realtime Broadcast does not require persisting rows to PostgreSQL tables if events are purely ephemeral broadcasts, if room states or history are saved to Supabase tables, corresponding RLS policies must allow anonymous participants to read/insert room answers.
- **Network during Training**: Mobile devices of students in the lecture hall will connect via mobile data (4G/5G) or campus Wi-Fi. Supabase Realtime Broadcast over WebSockets is resilient, but UI must display reconnecting banners if a mobile user experiences a network drop.
- **Audio Autoplay Policies**: Modern mobile browsers (iOS Safari, Android Chrome) block audio playback until user interaction. The Web Audio synthesizer must be resumed on the first user touch/tap (e.g., clicking "Tham gia" or selecting an answer).

---

## 4. Conclusion

The application architecture is completely prepared for the integration of the Live Interactive Training Quiz Game:
- **Canonical Route**: `/ai-tools/training-quiz` (with alias `/tools/training-quiz`).
- **Catalog Integration**: Add entry to `FALLBACK_AI_TOOLS` in `src/lib/fallback.ts`, update `tests/fallback.test.ts` to length 8, and add home page quick link.
- **Component Layout**: Place UI in `src/components/training-quiz/` (with `HostView.tsx`, `PlayerView.tsx`, `common/QuizIcons.tsx`, `QuizSound.ts`, `QuizConfetti.tsx`, `QuizQrCode.tsx`).
- **Engine Layout**: Place logic in `src/lib/training-quiz/` (`types.ts`, `questionsData.ts`, `scoringEngine.ts`, `roomEngine.ts`, `syncTransport.ts`).
- **Verification Baseline**: Baseline verified with 638 tests passing, 0 build errors.

Detailed technical report has been saved to:
`c:\Users\DELL\Desktop\thansxuan-portfolio\.agents\teamwork\explorer_codebase_1\survey_report.md`

---

## 5. Verification Method

To independently verify all findings in this report:
1. **Run Unit Tests**:
   ```powershell
   npm run test
   ```
   *Expected*: 38 test files passed, 638 tests passed, 0 failures.
2. **Run Linter**:
   ```powershell
   npm run lint
   ```
   *Expected*: Exit code 0 (139 non-blocking warnings, 0 errors).
3. **Run Production Build**:
   ```powershell
   npm run build
   ```
   *Expected*: Next.js 16.3.5 Turbopack builds all 28 routes with exit code 0.
4. **Inspect Files**:
   - `src/lib/fallback.ts:115` (`FALLBACK_AI_TOOLS`)
   - `tests/fallback.test.ts:49` (`toHaveLength(7)`)
   - `src/app/globals.css:9-68` (HCMUTE color palette tokens)
   - `D:\DU LIEU DOAN TRUONG\BTV ĐOÀN TRƯỜNG 21` (Training source documents)
