/**
 * Challenger 2: Empirical Stress Test Suite for Live Interactive Training Quiz Game
 *
 * Scope:
 * 1. Concurrency Simulation: 20, 50, and 100 concurrent players in a single room
 * 2. Race Conditions: Simultaneous submissions at exact same millisecond & duplicate submission races
 * 3. Fast Short-Circuit: Instant transition, timer cancellation, and disconnected player handling
 * 4. Authorization & State Machine Integrity: Out-of-sequence transitions & invalid tokens
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QuizRoom } from '../src/lib/training-quiz/roomEngine';
import { roomManager } from '../src/lib/training-quiz/roomManager';
import { TRAINING_QUIZ_QUESTIONS } from '../src/lib/training-quiz/questionsData';
import { QuizRoomEvent } from '../src/lib/training-quiz/types';
import { POST as joinRoomRoute } from '../src/app/api/quiz/rooms/[code]/join/route';
import { POST as actionRoute } from '../src/app/api/quiz/rooms/[code]/action/route';
import { POST as answerRoute } from '../src/app/api/quiz/rooms/[code]/answer/route';

describe('Challenger 2 — Empirical Concurrency & State Machine Stress Suite', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    roomManager.reset();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    roomManager.reset();
  });

  // =========================================================================
  // MISSION ITEM 1: CONCURRENT PLAYERS SIMULATION (20, 50, 100 PLAYERS)
  // =========================================================================
  describe('Mission 1: Scale & Concurrency (20, 50, 100 Concurrent Players)', () => {
    it('simulates 20 concurrent players through 15 sequential questions with varied behavior', () => {
      const room = new QuizRoom({
        roomCode: 'STRESS20',
        hostToken: 'host_stress_20',
        questions: TRAINING_QUIZ_QUESTIONS,
        previewDurationMs: 50,
        questionTimeLimitMs: 15000,
      });

      // 1. Join 20 players
      const playerIds: string[] = [];
      for (let i = 1; i <= 20; i++) {
        const player = room.joinPlayer(`Player_${i.toString().padStart(2, '0')}`, `Chi đoàn ${i}`);
        playerIds.push(player.id);
      }

      expect(room.getConnectedPlayers()).toHaveLength(20);
      expect(Object.keys(room.players)).toHaveLength(20);

      // 2. Start game
      expect(room.startGame('host_stress_20')).toBe(true);

      // 3. Play through all 15 questions
      for (let q = 0; q < 15; q++) {
        expect(room.currentQuestionIndex).toBe(q);
        expect(room.status).toBe('QUESTION_START');

        vi.advanceTimersByTime(50); // Preview expires -> QUESTION_ACTIVE
        expect(room.status).toBe('QUESTION_ACTIVE');

        const currentQ = room.getCurrentQuestion();

        // 20 players submit answers with distinct response times
        for (let i = 0; i < 20; i++) {
          const playerId = playerIds[i];
          const responseTime = 300 + i * 200; // 300ms to 4100ms
          vi.advanceTimersByTime(50);

          // Top 10 always correct, bottom 10 make errors on odd questions
          const isCorrectChoice = i < 10 || q % 2 === 0;
          const choice = isCorrectChoice
            ? currentQ.correctIndex
            : (currentQ.correctIndex + 1) % 4;

          const res = room.submitAnswer({
            playerId,
            questionIndex: q,
            selectedIndex: choice,
            clientTimeMs: responseTime,
          });
          expect(res).not.toBeNull();
        }

        // Fast short-circuit MUST trigger on 20th answer
        expect(room.status).toBe('QUESTION_REVEAL');
        expect(room.fastestPlayerInCurrentQuestion).toBeDefined();
        expect(room.fastestPlayerInCurrentQuestion?.playerId).toBe(playerIds[0]);

        // Option stats sum must equal 20
        const stats = room.statsPerQuestion[q];
        expect(stats.A + stats.B + stats.C + stats.D).toBe(20);

        // Advance to next question
        expect(room.handleHostAction({ action: 'SHOW_LEADERBOARD', hostToken: 'host_stress_20' })).toBe(true);
        expect(room.status).toBe('LEADERBOARD');

        expect(room.handleHostAction({ action: 'NEXT_QUESTION', hostToken: 'host_stress_20' })).toBe(true);
      }

      expect(room.status).toBe('FINAL_RESULTS');

      const awards = room.getFinalAwards();
      expect(awards.fullLeaderboard).toHaveLength(20);
      expect(awards.podium).toHaveLength(3);
      expect(awards.podium[0].score).toBeGreaterThanOrEqual(awards.podium[1].score);
      expect(awards.podium[1].score).toBeGreaterThanOrEqual(awards.podium[2].score);
      expect(awards.classAnalytics.totalParticipants).toBe(20);
      expect(awards.classAnalytics.questionsStats).toHaveLength(15);
    });

    it('simulates 50 concurrent players with massive tie-breaker resolution and full distribution', () => {
      const room = new QuizRoom({
        roomCode: 'STRESS50',
        hostToken: 'host_stress_50',
        questions: TRAINING_QUIZ_QUESTIONS,
        previewDurationMs: 50,
      });

      const playerIds: string[] = [];
      for (let i = 1; i <= 50; i++) {
        const p = room.joinPlayer(`Learner_${i}`, `Đơn vị ${(i % 5) + 1}`);
        playerIds.push(p.id);
      }

      expect(room.getConnectedPlayers()).toHaveLength(50);
      room.startGame('host_stress_50');
      vi.advanceTimersByTime(50); // ACTIVE

      // All 50 players submit answers
      for (let i = 0; i < 50; i++) {
        // Group players into 5 cohorts picking options 0, 1, 2, 3
        const selected = i % 4;
        const res = room.submitAnswer({
          playerId: playerIds[i],
          questionIndex: 0,
          selectedIndex: selected,
          clientTimeMs: 1000 + (i % 10) * 100,
        });
        expect(res).not.toBeNull();
      }

      expect(room.status).toBe('QUESTION_REVEAL');
      const stats = room.statsPerQuestion[0];
      expect(stats.A + stats.B + stats.C + stats.D).toBe(50);

      // Verify Leaderboard calculation for 50 players: strictly non-increasing score
      room.transitionToLeaderboard('host_stress_50');
      expect(room.getState().status).toBe('LEADERBOARD');
      const sanitized = room.getSanitizedState();
      expect(Object.keys(sanitized.players)).toHaveLength(50);

      const awards = room.getFinalAwards();
      expect(awards.fullLeaderboard).toHaveLength(50);
      for (let i = 0; i < 49; i++) {
        const curr = awards.fullLeaderboard[i];
        const next = awards.fullLeaderboard[i + 1];
        expect(curr.score).toBeGreaterThanOrEqual(next.score);
        if (curr.score === next.score) {
          expect(curr.totalResponseTimeMs).toBeLessThanOrEqual(next.totalResponseTimeMs);
        }
      }
    });

    it('simulates 100 concurrent players in a single room: memory integrity, stats, and awards', () => {
      const room = new QuizRoom({
        roomCode: 'STR100',
        hostToken: 'host_stress_100',
        questions: TRAINING_QUIZ_QUESTIONS,
        previewDurationMs: 50,
      });

      const playerIds: string[] = [];
      for (let i = 1; i <= 100; i++) {
        const p = room.joinPlayer(`Player100_${i.toString().padStart(3, '0')}`, `Khoa ${i % 10}`);
        playerIds.push(p.id);
      }

      expect(room.getConnectedPlayers()).toHaveLength(100);
      expect(Object.keys(room.players)).toHaveLength(100);

      room.startGame('host_stress_100');
      vi.advanceTimersByTime(50);
      expect(room.status).toBe('QUESTION_ACTIVE');

      const q = room.getCurrentQuestion();

      // All 100 players submit rapidly
      for (let i = 0; i < 100; i++) {
        const isCorrect = i % 3 !== 0; // ~66% accuracy
        const choice = isCorrect ? q.correctIndex : (q.correctIndex + 1) % 4;

        const res = room.submitAnswer({
          playerId: playerIds[i],
          questionIndex: 0,
          selectedIndex: choice,
          clientTimeMs: 500 + i * 20,
        });
        expect(res).not.toBeNull();
      }

      // Fast short-circuit triggers immediately on 100th submission
      expect(room.status).toBe('QUESTION_REVEAL');
      expect(room.fastestPlayerInCurrentQuestion).toBeDefined();

      const stats = room.statsPerQuestion[0];
      expect(stats.A + stats.B + stats.C + stats.D).toBe(100);

      // Verify Final Awards handles 100 players without stack overflow or performance bottlenecks
      const awards = room.getFinalAwards();
      expect(awards.fullLeaderboard).toHaveLength(100);
      expect(awards.classAnalytics.totalParticipants).toBe(100);
      expect(awards.podium).toHaveLength(3);
      expect(awards.podium[0].rank).toBe(1);
      expect(awards.podium[1].rank).toBe(2);
      expect(awards.podium[2].rank).toBe(3);
    });
  });

  // =========================================================================
  // MISSION ITEM 2: RACE CONDITIONS (EXACT SAME MS & DUPLICATE SUBMISSIONS)
  // =========================================================================
  describe('Mission 2: Race Conditions & Simultaneous Submissions', () => {
    it('handles 50 players submitting at the EXACT same millisecond without state corruption or tie-break crash', () => {
      const room = new QuizRoom({
        roomCode: 'RACE01',
        hostToken: 'host_race',
        questions: TRAINING_QUIZ_QUESTIONS,
        previewDurationMs: 50,
      });

      const playerIds: string[] = [];
      for (let i = 0; i < 50; i++) {
        const p = room.joinPlayer(`RacePlayer_${i}`);
        playerIds.push(p.id);
      }

      room.startGame('host_race');
      vi.advanceTimersByTime(50); // ACTIVE

      const q = room.getCurrentQuestion();

      // All 50 players submit at the exact same millisecond
      // Same Date.now() time tick, same responseTime
      const results = playerIds.map((id) =>
        room.submitAnswer({
          playerId: id,
          questionIndex: 0,
          selectedIndex: q.correctIndex,
          clientTimeMs: 1234,
        })
      );

      // Every single submission must succeed
      expect(results.every((r) => r !== null && r.isCorrect)).toBe(true);

      // Room transitioned to REVEAL
      expect(room.status).toBe('QUESTION_REVEAL');

      // Fastest player must be deterministically chosen
      expect(room.fastestPlayerInCurrentQuestion).toBeDefined();
      expect(room.fastestPlayerInCurrentQuestion?.responseTimeMs).toBeDefined();

      // Verify deterministic ordering in leaderboard
      const awards = room.getFinalAwards();
      expect(awards.fullLeaderboard).toHaveLength(50);
      // All have the same score and response time, so IDs must be sorted lexicographically
      for (let i = 0; i < 49; i++) {
        const a = awards.fullLeaderboard[i];
        const b = awards.fullLeaderboard[i + 1];
        expect(a.score).toBe(b.score);
        // Tie-breaker: joinedAt ASC or id ASC
        if (a.totalResponseTimeMs === b.totalResponseTimeMs) {
          expect(a.playerId.localeCompare(b.playerId)).toBeLessThanOrEqual(0);
        }
      }
    });

    it('rejects concurrent duplicate submissions from the same player (double-click / race condition)', () => {
      const room = new QuizRoom({ roomCode: 'RACE02', hostToken: 'host_race' });
      const p1 = room.joinPlayer('RapidClicker');
      const p2 = room.joinPlayer('OtherPlayer');
      expect(p2.connected).toBe(true);

      room.startGame('host_race');
      vi.advanceTimersByTime(3000);

      // Player 1 fires 5 simultaneous submissions in parallel
      const attempts = [0, 1, 2, 3, 1].map((choice, idx) =>
        room.submitAnswer({
          playerId: p1.id,
          questionIndex: 0,
          selectedIndex: choice,
          clientTimeMs: 500 + idx * 10,
        })
      );

      // Exactly ONE submission must succeed
      const successfulAttempts = attempts.filter((r) => r !== null);
      const rejectedAttempts = attempts.filter((r) => r === null);

      expect(successfulAttempts).toHaveLength(1);
      expect(rejectedAttempts).toHaveLength(4);

      // Check that Player 1 has only one answer recorded
      expect(room.players[p1.id].answers[0]).toBeDefined();
      expect(room.players[p1.id].answers[0].selectedIndex).toBe(0); // first choice was locked
      expect(room.players[p1.id].correctCount).toBeLessThanOrEqual(1);
    });

    it('rejects submissions arriving after room transitioned out of QUESTION_ACTIVE (late arrivals)', () => {
      const room = new QuizRoom({ roomCode: 'RACE03', hostToken: 'host_race' });
      const p1 = room.joinPlayer('P1');
      const p2 = room.joinPlayer('P2');

      room.startGame('host_race');
      vi.advanceTimersByTime(3000); // ACTIVE

      // P1 submits -> 1/2 answered
      expect(
        room.submitAnswer({
          playerId: p1.id,
          questionIndex: 0,
          selectedIndex: 1,
          clientTimeMs: 500,
        })
      ).not.toBeNull();
      expect(room.status).toBe('QUESTION_ACTIVE');

      // P2 submits -> 2/2 answered -> triggers fast short-circuit!
      expect(
        room.submitAnswer({
          playerId: p2.id,
          questionIndex: 0,
          selectedIndex: 1,
          clientTimeMs: 800,
        })
      ).not.toBeNull();
      expect(room.status).toBe('QUESTION_REVEAL');

      // Now a lagging or retry submission arrives for P1
      const lateSubmission = room.submitAnswer({
        playerId: p1.id,
        questionIndex: 0,
        selectedIndex: 2,
        clientTimeMs: 900,
      });
      expect(lateSubmission).toBeNull();
    });

    it('rejects submissions past the 15-second deadline and assigns 0 points with streak reset', () => {
      const room = new QuizRoom({
        roomCode: 'RACE04',
        hostToken: 'host_race',
        questionTimeLimitMs: 15000,
      });
      const p1 = room.joinPlayer('SlowPoke');
      p1.streak = 4; // Prior streak

      room.startGame('host_race');
      vi.advanceTimersByTime(3000); // ACTIVE

      // Advance past deadline (15001 ms)
      vi.advanceTimersByTime(15001);

      // Timeout already triggered, status transitioned to REVEAL
      expect(room.status).toBe('QUESTION_REVEAL');

      // Any submission now must be rejected
      const res = room.submitAnswer({
        playerId: p1.id,
        questionIndex: 0,
        selectedIndex: room.getCurrentQuestion().correctIndex,
        clientTimeMs: 15001,
      });
      expect(res).toBeNull();
      expect(room.players[p1.id].streak).toBe(0);
    });
  });

  // =========================================================================
  // MISSION ITEM 3: FAST SHORT-CIRCUIT UNDER RAPID SUBMISSIONS
  // =========================================================================
  describe('Mission 3: Fast Short-Circuit & Rapid Submissions', () => {
    it('cancels the 15s timer immediately upon short-circuit so handleQuestionTimeout never fires', () => {
      const room = new QuizRoom({
        roomCode: 'SHORT01',
        hostToken: 'host_short',
        previewDurationMs: 1000,
        questionTimeLimitMs: 15000,
      });

      const p1 = room.joinPlayer('FastP1');
      const p2 = room.joinPlayer('FastP2');
      p1.streak = 2;
      p2.streak = 2;

      room.startGame('host_short');
      vi.advanceTimersByTime(1000); // ACTIVE
      expect(room.status).toBe('QUESTION_ACTIVE');

      // Both players answer in 400ms
      vi.advanceTimersByTime(400);
      room.submitAnswer({
        playerId: p1.id,
        questionIndex: 0,
        selectedIndex: room.getCurrentQuestion().correctIndex,
        clientTimeMs: 400,
      });
      room.submitAnswer({
        playerId: p2.id,
        questionIndex: 0,
        selectedIndex: room.getCurrentQuestion().correctIndex,
        clientTimeMs: 400,
      });

      // Immediate short-circuit
      expect(room.status).toBe('QUESTION_REVEAL');

      // Host advances to LEADERBOARD
      room.handleHostAction({ action: 'SHOW_LEADERBOARD', hostToken: 'host_short' });
      expect(room.status).toBe('LEADERBOARD');

      // Now fast forward 15,000ms. If the timer wasn't cancelled, handleQuestionTimeout
      // would fire and overwrite status or reset streaks!
      vi.advanceTimersByTime(15000);

      // Status must STILL be LEADERBOARD, not reverted to QUESTION_REVEAL
      expect(room.status).toBe('LEADERBOARD');
      // Streaks must remain intact (now 3)
      expect(room.players[p1.id].streak).toBe(3);
      expect(room.players[p2.id].streak).toBe(3);
    });

    it('emits FAST_FORWARD_REVEAL event with shortCircuited flag set to true', () => {
      const room = new QuizRoom({ roomCode: 'SHORT02', hostToken: 'host_short' });
      const p1 = room.joinPlayer('SoloPlayer');

      const events: QuizRoomEvent[] = [];
      room.subscribe((_, event) => {
        if (event) events.push(event);
      });

      room.startGame('host_short');
      vi.advanceTimersByTime(3000);

      room.submitAnswer({
        playerId: p1.id,
        questionIndex: 0,
        selectedIndex: room.getCurrentQuestion().correctIndex,
        clientTimeMs: 600,
      });

      const revealEvent = events.find((e) => e.type === 'FAST_FORWARD_REVEAL');
      expect(revealEvent).toBeDefined();
      expect((revealEvent?.data as Record<string, unknown>).shortCircuited).toBe(true);
    });

    it('triggers short-circuit cleanly when disconnected players exist without waiting for them', () => {
      const room = new QuizRoom({ roomCode: 'SHORT03', hostToken: 'host_short' });
      const p1 = room.joinPlayer('Online1');
      const p2 = room.joinPlayer('Online2');
      const p3 = room.joinPlayer('Offline1');
      const p4 = room.joinPlayer('Offline2');

      // Disconnect p3 and p4
      room.setPlayerConnected(p3.id, false);
      room.setPlayerConnected(p4.id, false);

      expect(room.getConnectedPlayers()).toHaveLength(2);

      room.startGame('host_short');
      vi.advanceTimersByTime(3000);

      // P1 answers
      room.submitAnswer({
        playerId: p1.id,
        questionIndex: 0,
        selectedIndex: 0,
        clientTimeMs: 500,
      });
      expect(room.status).toBe('QUESTION_ACTIVE');

      // P2 answers -> All connected players (2 of 2) answered!
      room.submitAnswer({
        playerId: p2.id,
        questionIndex: 0,
        selectedIndex: 0,
        clientTimeMs: 600,
      });

      // Should short-circuit immediately without waiting for p3 and p4
      expect(room.status).toBe('QUESTION_REVEAL');
      expect(room.players[p3.id].answers[0]).toBeUndefined();
      expect(room.players[p4.id].answers[0]).toBeUndefined();
    });

    it('gracefully handles checkFastShortCircuit when room has 0 connected players', () => {
      const room = new QuizRoom({ roomCode: 'SHORT04', hostToken: 'host_short' });
      const p1 = room.joinPlayer('Ghost');
      room.setPlayerConnected(p1.id, false);

      room.startGame('host_short');
      vi.advanceTimersByTime(3000);

      // Check short circuit with 0 connected players
      const shortCircuited = room.checkFastShortCircuit();
      expect(shortCircuited).toBe(false);
      expect(room.status).toBe('QUESTION_ACTIVE');
    });
  });

  // =========================================================================
  // MISSION ITEM 4: AUTHORIZATION, TOKENS, AND OUT-OF-SEQUENCE TRANSITIONS
  // =========================================================================
  describe('Mission 4: Authorization, Token Validation & Sequence Guards', () => {
    it('strictly denies host actions with invalid, empty, or mismatched tokens', () => {
      const room = new QuizRoom({ roomCode: 'AUTH01', hostToken: 'super_secret_host_key' });
      room.joinPlayer('Student');

      // 1. Invalid tokens on startGame
      expect(room.startGame('wrong_key')).toBe(false);
      expect(room.startGame('')).toBe(false);
      expect(room.startGame('SUPER_SECRET_HOST_KEY')).toBe(false); // Case-sensitive
      expect(room.status).toBe('LOBBY');

      // 2. Start game with valid token
      expect(room.startGame('super_secret_host_key')).toBe(true);
      vi.advanceTimersByTime(3000); // ACTIVE
      vi.advanceTimersByTime(15000); // REVEAL
      expect(room.status).toBe('QUESTION_REVEAL');

      // 3. Invalid token on handleHostAction
      expect(
        room.handleHostAction({
          action: 'SHOW_LEADERBOARD',
          hostToken: 'bad_token',
        })
      ).toBe(false);
      expect(room.status).toBe('QUESTION_REVEAL');

      expect(
        room.handleHostAction({
          action: 'NEXT_QUESTION',
          hostToken: '',
        })
      ).toBe(false);
      expect(room.status).toBe('QUESTION_REVEAL');

      expect(
        room.handleHostAction({
          action: 'END_GAME',
          hostToken: 'another_wrong_token',
        })
      ).toBe(false);
      expect(room.status).toBe('QUESTION_REVEAL');

      // 4. Valid hostToken succeeds
      expect(
        room.handleHostAction({
          action: 'SHOW_LEADERBOARD',
          hostToken: 'super_secret_host_key',
        })
      ).toBe(true);
      expect(room.status).toBe('LEADERBOARD');
    });

    it('rejects state machine transitions executed out of sequence', () => {
      const room = new QuizRoom({ roomCode: 'SEQ01', hostToken: 'host_key' });
      room.joinPlayer('Student');

      // Cannot go to LEADERBOARD from LOBBY
      expect(room.transitionToLeaderboard('host_key')).toBe(false);
      expect(room.status).toBe('LOBBY');

      // Cannot advance next question from LOBBY
      expect(room.advanceNextQuestion('host_key')).toBe(false);
      expect(room.status).toBe('LOBBY');

      // Start game
      expect(room.startGame('host_key')).toBe(true);
      expect(room.status).toBe('QUESTION_START');

      // Cannot startGame again when already started
      expect(room.startGame('host_key')).toBe(false);

      // Cannot go to LEADERBOARD from QUESTION_START
      expect(room.transitionToLeaderboard('host_key')).toBe(false);

      vi.advanceTimersByTime(3000); // Now in QUESTION_ACTIVE
      expect(room.status).toBe('QUESTION_ACTIVE');

      // Cannot go to LEADERBOARD from QUESTION_ACTIVE
      expect(room.transitionToLeaderboard('host_key')).toBe(false);

      // Cannot skip to NEXT_QUESTION from QUESTION_ACTIVE
      expect(room.advanceNextQuestion('host_key')).toBe(false);
      expect(room.status).toBe('QUESTION_ACTIVE');
    });

    it('rejects answer submissions executed during invalid room states', () => {
      const room = new QuizRoom({ roomCode: 'SEQ02', hostToken: 'host_key' });
      const p1 = room.joinPlayer('Student');

      // 1. Submit during LOBBY -> rejected
      expect(
        room.submitAnswer({
          playerId: p1.id,
          questionIndex: 0,
          selectedIndex: 0,
          clientTimeMs: 100,
        })
      ).toBeNull();

      // 2. Submit during QUESTION_START -> rejected
      room.startGame('host_key');
      expect(room.status).toBe('QUESTION_START');
      expect(
        room.submitAnswer({
          playerId: p1.id,
          questionIndex: 0,
          selectedIndex: 0,
          clientTimeMs: 100,
        })
      ).toBeNull();

      // Advance to QUESTION_ACTIVE -> accepted
      vi.advanceTimersByTime(3000);
      expect(room.status).toBe('QUESTION_ACTIVE');
      const valid = room.submitAnswer({
        playerId: p1.id,
        questionIndex: 0,
        selectedIndex: 0,
        clientTimeMs: 500,
      });
      expect(valid).not.toBeNull();

      // 3. Submit during QUESTION_REVEAL -> rejected
      expect(room.status).toBe('QUESTION_REVEAL');
      expect(
        room.submitAnswer({
          playerId: p1.id,
          questionIndex: 0,
          selectedIndex: 0,
          clientTimeMs: 600,
        })
      ).toBeNull();

      // 4. Submit during LEADERBOARD -> rejected
      room.transitionToLeaderboard('host_key');
      expect(room.status).toBe('LEADERBOARD');
      expect(
        room.submitAnswer({
          playerId: p1.id,
          questionIndex: 0,
          selectedIndex: 0,
          clientTimeMs: 700,
        })
      ).toBeNull();

      // 5. Submit during FINAL_RESULTS -> rejected
      room.endGame('host_key');
      expect(room.status).toBe('FINAL_RESULTS');
      expect(
        room.submitAnswer({
          playerId: p1.id,
          questionIndex: 0,
          selectedIndex: 0,
          clientTimeMs: 800,
        })
      ).toBeNull();
    });

    it('validates questionIndex, playerId, and selectedIndex boundaries on submitAnswer', () => {
      const room = new QuizRoom({ roomCode: 'BOUND01', hostToken: 'host_key' });
      const p1 = room.joinPlayer('Student');

      room.startGame('host_key');
      vi.advanceTimersByTime(3000); // QUESTION_ACTIVE at Q0

      // 1. Wrong question index (future question 5 or negative -1)
      expect(
        room.submitAnswer({
          playerId: p1.id,
          questionIndex: 5,
          selectedIndex: 0,
          clientTimeMs: 500,
        })
      ).toBeNull();

      expect(
        room.submitAnswer({
          playerId: p1.id,
          questionIndex: -1,
          selectedIndex: 0,
          clientTimeMs: 500,
        })
      ).toBeNull();

      // 2. Non-existent player ID
      expect(
        room.submitAnswer({
          playerId: 'ghost_player_9999',
          questionIndex: 0,
          selectedIndex: 0,
          clientTimeMs: 500,
        })
      ).toBeNull();

      // 3. Out-of-bounds selectedIndex (e.g. -1, 4, 99)
      // Note: submission is recorded, but receives 0 points, isCorrect: false
      const outOfBounds = room.submitAnswer({
        playerId: p1.id,
        questionIndex: 0,
        selectedIndex: 4,
        clientTimeMs: 500,
      });
      expect(outOfBounds).not.toBeNull();
      expect(outOfBounds?.isCorrect).toBe(false);
      expect(outOfBounds?.points).toBe(0);
      expect(outOfBounds?.newStreak).toBe(0);
    });

    it('gracefully ends game and rejects further transitions once FINAL_RESULTS is reached', () => {
      const room = new QuizRoom({
        roomCode: 'END01',
        hostToken: 'host_key',
        questions: TRAINING_QUIZ_QUESTIONS.slice(0, 2), // 2 questions
        previewDurationMs: 10,
      });
      room.joinPlayer('P1');

      room.startGame('host_key');
      vi.advanceTimersByTime(10); // Q0 Active
      room.submitAnswer({ playerId: room.getConnectedPlayers()[0].id, questionIndex: 0, selectedIndex: 0, clientTimeMs: 100 });
      room.handleHostAction({ action: 'SHOW_LEADERBOARD', hostToken: 'host_key' });

      // Move to Q1
      room.handleHostAction({ action: 'NEXT_QUESTION', hostToken: 'host_key' });
      vi.advanceTimersByTime(10); // Q1 Active
      room.submitAnswer({ playerId: room.getConnectedPlayers()[0].id, questionIndex: 1, selectedIndex: 0, clientTimeMs: 100 });
      room.handleHostAction({ action: 'SHOW_LEADERBOARD', hostToken: 'host_key' });

      // Next question after last question transitions to FINAL_RESULTS
      expect(room.handleHostAction({ action: 'NEXT_QUESTION', hostToken: 'host_key' })).toBe(true);
      expect(room.status).toBe('FINAL_RESULTS');

      // Attempting to advance beyond FINAL_RESULTS must fail
      expect(room.advanceNextQuestion('host_key')).toBe(false);
      expect(room.handleHostAction({ action: 'NEXT_QUESTION', hostToken: 'host_key' })).toBe(false);
      expect(room.status).toBe('FINAL_RESULTS');
    });
  });

  // =========================================================================
  // MISSION ITEM 5: API ROUTE CONCURRENCY, PROMISE.ALL & FUZZING
  // =========================================================================
  describe('Mission 5: API Route Concurrency, Promise.all & Attack Fuzzing', () => {
    it('handles 50 concurrent player joins via POST /api/quiz/rooms/[code]/join simultaneously', async () => {
      const { roomCode } = roomManager.createRoom({ customCode: 'APIJOIN50' });

      // Fire 50 concurrent HTTP requests via joinRoomRoute
      const joinPromises = Array.from({ length: 50 }, (_, i) => {
        const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nickname: `BatchUser_${i + 1}`,
            unit: `Đơn vị ${(i % 5) + 1}`,
          }),
        });
        return joinRoomRoute(req, { params: Promise.resolve({ code: roomCode }) });
      });

      const responses = await Promise.all(joinPromises);
      expect(responses).toHaveLength(50);
      expect(responses.every((r) => r.status === 200)).toBe(true);

      const jsonResults = await Promise.all(responses.map((r) => r.json()));
      const playerIds = jsonResults.map((j) => j.playerId);
      const uniqueIds = new Set(playerIds);
      expect(uniqueIds.size).toBe(50);

      const room = roomManager.getRoom(roomCode);
      expect(room?.getConnectedPlayers()).toHaveLength(50);
    });

    it('handles 50 concurrent answer submissions via POST /api/quiz/rooms/[code]/answer with short-circuit', async () => {
      const { room, roomCode, hostToken } = roomManager.createRoom({ customCode: 'APIANS50' });

      // Join 50 players directly
      const playerIds: string[] = [];
      for (let i = 1; i <= 50; i++) {
        const p = room.joinPlayer(`Learner_${i}`);
        playerIds.push(p.id);
      }

      room.startGame(hostToken);
      room.transitionToQuestionActive();
      expect(room.status).toBe('QUESTION_ACTIVE');

      const correctIndex = room.getCurrentQuestion().correctIndex;

      // 50 concurrent answer requests fired via Promise.all
      const answerPromises = playerIds.map((playerId, i) => {
        const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId,
            questionIndex: 0,
            selectedIndex: i % 2 === 0 ? correctIndex : (correctIndex + 1) % 4,
            clientTimeMs: 1000 + i * 20,
          }),
        });
        return answerRoute(req, { params: Promise.resolve({ code: roomCode }) });
      });

      const responses = await Promise.all(answerPromises);
      expect(responses).toHaveLength(50);
      expect(responses.every((r) => r.status === 200)).toBe(true);

      // Fast short-circuit triggered on 50th answer!
      expect(room.status).toBe('QUESTION_REVEAL');
    });

    it('rejects concurrent duplicate submissions on API route: 1 success, N-1 rejected with 400', async () => {
      const { room, roomCode, hostToken } = roomManager.createRoom({ customCode: 'APIDUP01' });
      const p1 = room.joinPlayer('DupSpammer');
      room.joinPlayer('OtherPlayer'); // 2 players so p1 does not trigger short circuit immediately

      room.startGame(hostToken);
      room.transitionToQuestionActive();

      // Fire 10 parallel answer submissions for p1
      const spamPromises = Array.from({ length: 10 }, (_, i) => {
        const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: p1.id,
            questionIndex: 0,
            selectedIndex: i % 4,
          }),
        });
        return answerRoute(req, { params: Promise.resolve({ code: roomCode }) });
      });

      const responses = await Promise.all(spamPromises);
      const statuses = responses.map((r) => r.status);
      const successCount = statuses.filter((s) => s === 200).length;
      const rejectCount = statuses.filter((s) => s === 400).length;

      expect(successCount).toBe(1);
      expect(rejectCount).toBe(9);
    });

    it('fuzzes host action endpoint with hostile payloads and verifies strict 400/401 rejections', async () => {
      const { roomCode, hostToken } = roomManager.createRoom({ customCode: 'APIATK01' });

      const hostileRequests = [
        { body: null, expectedStatus: 401 },
        { body: {}, expectedStatus: 401 },
        { body: { hostToken: '' }, expectedStatus: 401 },
        { body: { hostToken: 'hacker_key', action: 'START' }, expectedStatus: 401 },
        { body: { hostToken, action: 'DROP_TABLE' }, expectedStatus: 400 },
        { body: { hostToken, action: 'start' }, expectedStatus: 400 }, // case sensitive
        { body: { hostToken, action: 'SHOW_LEADERBOARD' }, expectedStatus: 400 }, // out of order (LOBBY)
        { body: { hostToken, action: 'NEXT_QUESTION' }, expectedStatus: 400 }, // out of order (LOBBY)
      ];

      for (const item of hostileRequests) {
        const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: item.body ? JSON.stringify(item.body) : undefined,
        });

        const res = await actionRoute(req, { params: Promise.resolve({ code: roomCode }) });
        expect(res.status).toBe(item.expectedStatus);
      }
    });
  });
});
