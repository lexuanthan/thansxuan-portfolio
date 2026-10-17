/**
 * End-to-End (E2E) Test Suite: Live Interactive Training Quiz Game
 * (Công tác xây dựng kế hoạch và tổ chức hoạt động Đoàn - Hội HCM-UTE)
 *
 * 4-Tier Opaque-Box Requirement-Driven Testing:
 * - Tier 1: Feature Coverage (isolated core logic: questions, scoring, streaks, awards)
 * - Tier 2: Boundary & Corner Cases (timeouts, 0ms response, tie scores, streak resets, edge inputs)
 * - Tier 3: Cross-Feature Combinations (instant fast short-circuit, speed vs streak interplay, host security)
 * - Tier 4: Real-World Application Scenario (simulation of >= 10 concurrent players going through 15 questions)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CognitiveLevel,
  QuizQuestion,
  PlayerState,
  RoomStatus,
  RoomState,
  ScoringResult,
  LeaderboardEntry,
  PodiumAward,
  LightningAward,
  ClassAnalytics,
  FinalAwardsSummary,
} from '../src/lib/training-quiz/types';
import { TRAINING_QUIZ_QUESTIONS } from '../src/lib/training-quiz/questionsData';
import {
  calculateScore,
  getStreakBonus,
  getLeaderboard,
  getLeaderboardEntries,
  getFastestPlayerInQuestion,
  getFinalAwards,
  QUESTION_TIME_LIMIT_MS,
  BASE_MAX_POINTS,
} from '../src/lib/training-quiz/scoringEngine';
import {
  QuizRoom,
  DEFAULT_PREVIEW_DURATION_MS,
  DEFAULT_QUESTION_TIME_LIMIT_MS,
} from '../src/lib/training-quiz/roomEngine';
import { QuizRoomManager } from '../src/lib/training-quiz/roomManager';

describe('Live Interactive Training Quiz Game — E2E Suite', () => {
  let manager: QuizRoomManager;

  beforeEach(() => {
    vi.useFakeTimers();
    manager = QuizRoomManager.getInstance();
    // Clean up any remaining rooms in store
    manager.getAllRooms().forEach((r) => manager.deleteRoom(r.roomCode));
  });

  afterEach(() => {
    manager.getAllRooms().forEach((r) => manager.deleteRoom(r.roomCode));
    vi.useRealTimers();
  });

  // =========================================================================
  // TIER 1: FEATURE COVERAGE (ISOLATED CORE LOGIC)
  // =========================================================================
  describe('Tier 1: Feature Coverage', () => {
    describe('1.1 Question Bank Content & Specification (R1)', () => {
      it('should provide exactly 15 authentic questions strictly extracted from BTV 21 training slides', () => {
        expect(TRAINING_QUIZ_QUESTIONS).toBeDefined();
        expect(TRAINING_QUIZ_QUESTIONS.length).toBe(15);
      });

      it('should have IDs strictly 1 through 15 in sequential order', () => {
        TRAINING_QUIZ_QUESTIONS.forEach((q, idx) => {
          expect(q.id).toBe(idx + 1);
        });
      });

      it('should have perfectly balanced cognitive levels: 5 Nhận biết, 5 Thông hiểu, 5 Tình huống thực tế', () => {
        const counts: Record<CognitiveLevel, number> = {
          'Nhận biết': 0,
          'Thông hiểu': 0,
          'Tình huống thực tế': 0,
        };
        TRAINING_QUIZ_QUESTIONS.forEach((q) => {
          counts[q.level]++;
        });
        expect(counts['Nhận biết']).toBe(5);
        expect(counts['Thông hiểu']).toBe(5);
        expect(counts['Tình huống thực tế']).toBe(5);
      });

      it('should adhere to strict question schema: 15s limit, 4 options, valid correctIndex, authentic explanations', () => {
        TRAINING_QUIZ_QUESTIONS.forEach((q) => {
          expect(q.timeLimit).toBe(15);
          expect(q.options.length).toBe(4);
          expect(q.correctIndex).toBeGreaterThanOrEqual(0);
          expect(q.correctIndex).toBeLessThan(4);
          expect(typeof q.question).toBe('string');
          expect(q.question.length).toBeGreaterThan(15);
          expect(typeof q.explanation).toBe('string');
          expect(q.explanation.length).toBeGreaterThan(20);
        });
      });
    });

    describe('1.2 Precision Speed Scoring Formula (R3)', () => {
      it('should award maximum 1000 speed points at 0ms reflex time', () => {
        const res = calculateScore(true, 0, 0);
        expect(res.isCorrect).toBe(true);
        expect(res.speedBonus).toBe(1000);
        expect(res.points).toBe(1000);
        expect(res.newStreak).toBe(1);
      });

      it('should award 667 points at 5000ms response time (10s remaining)', () => {
        // 1000 * (10000 / 15000) = 666.666... -> 667
        const res = calculateScore(true, 5000, 0);
        expect(res.isCorrect).toBe(true);
        expect(res.speedBonus).toBe(667);
        expect(res.points).toBe(667);
      });

      it('should award 500 points at 7500ms response time (half time)', () => {
        // 1000 * (7500 / 15000) = 500
        const res = calculateScore(true, 7500, 0);
        expect(res.isCorrect).toBe(true);
        expect(res.speedBonus).toBe(500);
        expect(res.points).toBe(500);
      });

      it('should award 67 points at 14000ms response time (1s remaining)', () => {
        // 1000 * (1000 / 15000) = 66.666... -> 67
        const res = calculateScore(true, 14000, 0);
        expect(res.isCorrect).toBe(true);
        expect(res.speedBonus).toBe(67);
        expect(res.points).toBe(67);
      });

      it('should award 0 points when answer is incorrect regardless of speed', () => {
        const resFast = calculateScore(false, 300, 3);
        expect(resFast.isCorrect).toBe(false);
        expect(resFast.points).toBe(0);
        expect(resFast.newStreak).toBe(0);

        const resSlow = calculateScore(false, 8000, 2);
        expect(resSlow.isCorrect).toBe(false);
        expect(resSlow.points).toBe(0);
        expect(resSlow.newStreak).toBe(0);
      });
    });

    describe('1.3 Streak Bonus Escalation Tiers (R3)', () => {
      it('should award +0 bonus for streak 1', () => {
        expect(getStreakBonus(1)).toBe(0);
        const res = calculateScore(true, 5000, 0);
        expect(res.streakBonus).toBe(0);
        expect(res.points).toBe(667);
      });

      it('should award +100 bonus for streak 2', () => {
        expect(getStreakBonus(2)).toBe(100);
        const res = calculateScore(true, 5000, 1);
        expect(res.streakBonus).toBe(100);
        expect(res.points).toBe(767); // 667 + 100
      });

      it('should award +200 bonus for streak 3', () => {
        expect(getStreakBonus(3)).toBe(200);
        const res = calculateScore(true, 5000, 2);
        expect(res.streakBonus).toBe(200);
        expect(res.points).toBe(867); // 667 + 200
      });

      it('should award +300 bonus for streak 4', () => {
        expect(getStreakBonus(4)).toBe(300);
        const res = calculateScore(true, 5000, 3);
        expect(res.streakBonus).toBe(300);
        expect(res.points).toBe(967); // 667 + 300
      });

      it('should award +500 bonus for streak 5 and beyond', () => {
        expect(getStreakBonus(5)).toBe(500);
        expect(getStreakBonus(10)).toBe(500);
        const res = calculateScore(true, 5000, 4);
        expect(res.streakBonus).toBe(500);
        expect(res.points).toBe(1167); // 667 + 500
      });
    });

    describe('1.4 Room State Machine Lifecycle (R2)', () => {
      it('should progress smoothly through all 6 states in the state machine', () => {
        const { room, hostToken } = manager.createRoom({ customCode: 'DEMO01' });
        expect(room.status).toBe('LOBBY');

        room.joinPlayer('Học viên A', 'Chi đoàn K21');
        room.joinPlayer('Học viên B', 'Chi đoàn K22');

        // Start -> QUESTION_START
        const started = room.startGame(hostToken);
        expect(started).toBe(true);
        expect(room.status).toBe('QUESTION_START');

        // After 3s preview -> QUESTION_ACTIVE
        vi.advanceTimersByTime(3000);
        expect(room.status).toBe('QUESTION_ACTIVE');

        // Transition to reveal
        room.transitionToQuestionReveal();
        expect(room.status).toBe('QUESTION_REVEAL');

        // Host opens leaderboard
        const showLobby = room.transitionToLeaderboard(hostToken);
        expect(showLobby).toBe(true);
        expect(room.status).toBe('LEADERBOARD');

        // End game -> FINAL_RESULTS
        const ended = room.endGame(hostToken);
        expect(ended).toBe(true);
        expect(room.status).toBe('FINAL_RESULTS');
      });
    });

    describe('1.5 Leaderboard & Special Awards Calculations (R3)', () => {
      it('should calculate Top 3 Podium and Lightning Award correctly', () => {
        const dummyPlayers: Record<string, PlayerState> = {
          p1: {
            id: 'p1',
            nickname: 'Nguyễn Văn A',
            score: 5000,
            streak: 3,
            maxStreak: 3,
            correctCount: 4,
            totalResponseTimeMs: 8000,
            answers: {
              0: { selectedIndex: 1, responseTimeMs: 2000, isCorrect: true, pointsEarned: 1000 },
              1: { selectedIndex: 2, responseTimeMs: 2000, isCorrect: true, pointsEarned: 1100 },
              2: { selectedIndex: 1, responseTimeMs: 2000, isCorrect: true, pointsEarned: 1200 },
              3: { selectedIndex: 2, responseTimeMs: 2000, isCorrect: true, pointsEarned: 1700 },
            },
            connected: true,
            joinedAt: 100,
          },
          p2: {
            id: 'p2',
            nickname: 'Trần Thị B',
            score: 4500,
            streak: 2,
            maxStreak: 2,
            correctCount: 3,
            totalResponseTimeMs: 3600,
            answers: {
              // Average correct response time: (1200 + 1000 + 1400) / 3 = 1200ms -> Faster than p1!
              0: { selectedIndex: 1, responseTimeMs: 1200, isCorrect: true, pointsEarned: 1500 },
              1: { selectedIndex: 2, responseTimeMs: 1000, isCorrect: true, pointsEarned: 1500 },
              2: { selectedIndex: 1, responseTimeMs: 1400, isCorrect: true, pointsEarned: 1500 },
            },
            connected: true,
            joinedAt: 200,
          },
          p3: {
            id: 'p3',
            nickname: 'Lê Văn C',
            score: 3000,
            streak: 1,
            maxStreak: 1,
            correctCount: 2,
            totalResponseTimeMs: 6000,
            answers: {
              0: { selectedIndex: 1, responseTimeMs: 3000, isCorrect: true, pointsEarned: 1500 },
              1: { selectedIndex: 2, responseTimeMs: 3000, isCorrect: true, pointsEarned: 1500 },
            },
            connected: true,
            joinedAt: 300,
          },
          p4: {
            id: 'p4',
            nickname: 'Phạm Thị D',
            score: 1000,
            streak: 0,
            maxStreak: 1,
            correctCount: 1,
            totalResponseTimeMs: 9000,
            answers: {
              0: { selectedIndex: 1, responseTimeMs: 9000, isCorrect: true, pointsEarned: 1000 },
            },
            connected: true,
            joinedAt: 400,
          },
        };

        const awards = getFinalAwards(dummyPlayers, TRAINING_QUIZ_QUESTIONS);

        // Podium Top 3
        expect(awards.podium.length).toBe(3);
        expect(awards.podium[0].nickname).toBe('Nguyễn Văn A');
        expect(awards.podium[0].rank).toBe(1);
        expect(awards.podium[1].nickname).toBe('Trần Thị B');
        expect(awards.podium[1].rank).toBe(2);
        expect(awards.podium[2].nickname).toBe('Lê Văn C');
        expect(awards.podium[2].rank).toBe(3);

        // Lightning Award: Trần Thị B has fastest average correct response time (1200ms vs 2000ms)
        expect(awards.lightningAward).toBeDefined();
        expect(awards.lightningAward?.nickname).toBe('Trần Thị B');
        expect(awards.lightningAward?.averageResponseTimeMs).toBe(1200);

        // Class Analytics
        expect(awards.classAnalytics.totalParticipants).toBe(4);
        expect(awards.classAnalytics.averageScore).toBe((5000 + 4500 + 3000 + 1000) / 4);
      });
    });
  });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES
  // =========================================================================
  describe('Tier 2: Boundary & Corner Cases', () => {
    describe('2.1 Millisecond Boundary Thresholds', () => {
      it('should handle exact 0ms response time as maximum valid reflex', () => {
        const res = calculateScore(true, 0, 0);
        expect(res.speedBonus).toBe(1000);
        expect(res.points).toBe(1000);
      });

      it('should handle 1ms response time', () => {
        // 1000 * (14999 / 15000) = 999.9333... -> 1000
        const res = calculateScore(true, 1, 0);
        expect(res.speedBonus).toBe(1000);
      });

      it('should handle last-millisecond response at 14999ms', () => {
        // 1000 * (1 / 15000) = 0.0666... -> 0
        const res = calculateScore(true, 14999, 0);
        expect(res.speedBonus).toBe(0);
        expect(res.points).toBe(0);
        expect(res.isCorrect).toBe(true);
      });

      it('should reject or award 0 for exact deadline at 15000ms', () => {
        const res = calculateScore(true, 15000, 0);
        expect(res.points).toBe(0);
        expect(res.isCorrect).toBe(false);
      });

      it('should strictly award 0 points for any timeout past 15000ms', () => {
        const res = calculateScore(true, 15001, 2);
        expect(res.points).toBe(0);
        expect(res.isCorrect).toBe(false);
        expect(res.newStreak).toBe(0);
      });
    });

    describe('2.2 Deterministic Multi-Tier Tie-Breaking Hierarchy', () => {
      it('should break ties by totalResponseTimeMs ASC when scores are equal', () => {
        const players: Record<string, PlayerState> = {
          pSlow: {
            id: 'pSlow',
            nickname: 'Chậm hơn',
            score: 2500,
            streak: 2,
            maxStreak: 2,
            correctCount: 2,
            totalResponseTimeMs: 8000,
            answers: {},
            connected: true,
            joinedAt: 100,
          },
          pFast: {
            id: 'pFast',
            nickname: 'Nhanh hơn',
            score: 2500,
            streak: 2,
            maxStreak: 2,
            correctCount: 2,
            totalResponseTimeMs: 4000,
            answers: {},
            connected: true,
            joinedAt: 200,
          },
        };

        const sorted = getLeaderboard(players);
        expect(sorted[0].id).toBe('pFast');
        expect(sorted[1].id).toBe('pSlow');
      });

      it('should break ties by correctCount DESC when score and time are identical', () => {
        const players: Record<string, PlayerState> = {
          pFewerCorrect: {
            id: 'p1',
            nickname: 'Ít đúng hơn',
            score: 2000,
            streak: 1,
            maxStreak: 1,
            correctCount: 2,
            totalResponseTimeMs: 5000,
            answers: {},
            connected: true,
            joinedAt: 100,
          },
          pMoreCorrect: {
            id: 'p2',
            nickname: 'Nhiều đúng hơn',
            score: 2000,
            streak: 1,
            maxStreak: 1,
            correctCount: 3,
            totalResponseTimeMs: 5000,
            answers: {},
            connected: true,
            joinedAt: 200,
          },
        };

        const sorted = getLeaderboard(players);
        expect(sorted[0].id).toBe('p2');
        expect(sorted[1].id).toBe('p1');
      });

      it('should break ties by joinedAt ASC when score, time, and correctCount are identical', () => {
        const players: Record<string, PlayerState> = {
          pLate: {
            id: 'pLate',
            nickname: 'Vào sau',
            score: 1000,
            streak: 1,
            maxStreak: 1,
            correctCount: 1,
            totalResponseTimeMs: 3000,
            answers: {},
            connected: true,
            joinedAt: 5000,
          },
          pEarly: {
            id: 'pEarly',
            nickname: 'Vào trước',
            score: 1000,
            streak: 1,
            maxStreak: 1,
            correctCount: 1,
            totalResponseTimeMs: 3000,
            answers: {},
            connected: true,
            joinedAt: 1000,
          },
        };

        const sorted = getLeaderboard(players);
        expect(sorted[0].id).toBe('pEarly');
        expect(sorted[1].id).toBe('pLate');
      });
    });

    describe('2.3 Streak Resets and Negative Pathways', () => {
      it('should immediately reset a streak of 5 back to 0 upon a single wrong answer', () => {
        // Correct answers up to streak 5
        let currentStreak = 0;
        for (let i = 0; i < 5; i++) {
          const res = calculateScore(true, 2000, currentStreak);
          currentStreak = res.newStreak;
        }
        expect(currentStreak).toBe(5);

        // Wrong answer
        const wrongRes = calculateScore(false, 1500, currentStreak);
        expect(wrongRes.newStreak).toBe(0);
        expect(wrongRes.points).toBe(0);

        // Next correct answer starts streak back at 1 (+0 bonus)
        const nextRes = calculateScore(true, 3000, wrongRes.newStreak);
        expect(nextRes.newStreak).toBe(1);
        expect(nextRes.streakBonus).toBe(0);
      });

      it('should reject answer submission if question is not in QUESTION_ACTIVE state', () => {
        const { room } = manager.createRoom({ customCode: 'ERR001' });
        const player = room.joinPlayer('Test Player');

        // Currently in LOBBY
        const subInLobby = room.submitAnswer({
          playerId: player.id,
          questionIndex: 0,
          selectedIndex: 1,
          clientTimeMs: 1000,
        });
        expect(subInLobby).toBeNull();
      });

      it('should reject duplicate submissions from the same player in a single question', () => {
        const { room, hostToken } = manager.createRoom({ customCode: 'ERR002' });
        const player = room.joinPlayer('Player 1');
        room.startGame(hostToken);
        vi.advanceTimersByTime(3000); // Now in QUESTION_ACTIVE

        // First answer
        const first = room.submitAnswer({
          playerId: player.id,
          questionIndex: 0,
          selectedIndex: 1,
          clientTimeMs: 1000,
        });
        expect(first).not.toBeNull();

        // Second answer in same question should be rejected
        const second = room.submitAnswer({
          playerId: player.id,
          questionIndex: 0,
          selectedIndex: 2,
          clientTimeMs: 2000,
        });
        expect(second).toBeNull();
      });
    });

    describe('2.4 Edge Inputs and Graceful Degradation', () => {
      it('should handle empty or whitespace-only nicknames gracefully with fallback', () => {
        const { room } = manager.createRoom();
        const p1 = room.joinPlayer('   ');
        expect(p1.nickname).toBe('Người chơi');

        const p2 = room.joinPlayer('Đồng chí Tuấn ⚡');
        expect(p2.nickname).toBe('Đồng chí Tuấn ⚡');
      });

      it('should handle a question where NO player answers correctly', () => {
        const dummyPlayers: Record<string, PlayerState> = {
          p1: {
            id: 'p1',
            nickname: 'P1',
            score: 0,
            streak: 0,
            maxStreak: 0,
            correctCount: 0,
            totalResponseTimeMs: 3000,
            answers: {
              0: { selectedIndex: 0, responseTimeMs: 3000, isCorrect: false, pointsEarned: 0 },
            },
            connected: true,
          },
        };

        const fastest = getFastestPlayerInQuestion(dummyPlayers, 0);
        expect(fastest).toBeNull();

        const awards = getFinalAwards(dummyPlayers, TRAINING_QUIZ_QUESTIONS);
        expect(awards.lightningAward).toBeUndefined();
      });
    });
  });

  // =========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS
  // =========================================================================
  describe('Tier 3: Cross-Feature Combinations', () => {
    describe('3.1 Instant Fast Short-Circuit Logic (R2, R4)', () => {
      it('should immediately short-circuit to QUESTION_REVEAL when all connected players answer early', () => {
        const { room, hostToken } = manager.createRoom({ customCode: 'SHORT1' });
        const p1 = room.joinPlayer('Player 1');
        const p2 = room.joinPlayer('Player 2');
        const p3 = room.joinPlayer('Player 3');

        room.startGame(hostToken);
        vi.advanceTimersByTime(3000); // To QUESTION_ACTIVE
        expect(room.status).toBe('QUESTION_ACTIVE');

        // Player 1 answers at 1000ms
        vi.advanceTimersByTime(1000);
        room.submitAnswer({ playerId: p1.id, questionIndex: 0, selectedIndex: 1, clientTimeMs: 1000 });
        expect(room.status).toBe('QUESTION_ACTIVE');

        // Player 2 answers at 2500ms
        vi.advanceTimersByTime(1500);
        room.submitAnswer({ playerId: p2.id, questionIndex: 0, selectedIndex: 1, clientTimeMs: 2500 });
        expect(room.status).toBe('QUESTION_ACTIVE');

        // Player 3 (last connected player) answers at 4000ms
        vi.advanceTimersByTime(1500);
        room.submitAnswer({ playerId: p3.id, questionIndex: 0, selectedIndex: 1, clientTimeMs: 4000 });

        // Instantly short-circuited to QUESTION_REVEAL without waiting for the full 15 seconds!
        expect(room.status).toBe('QUESTION_REVEAL');
        expect(room.fastestPlayerInCurrentQuestion?.playerId).toBe(p1.id);
      });

      it('should disregard disconnected players when evaluating short-circuit condition', () => {
        const { room, hostToken } = manager.createRoom({ customCode: 'SHORT2' });
        const p1 = room.joinPlayer('Player 1');
        const p2 = room.joinPlayer('Player 2 (Disconnected)');

        // Disconnect p2
        room.setPlayerConnected(p2.id, false);

        room.startGame(hostToken);
        vi.advanceTimersByTime(3000);

        // Only p1 is connected. As soon as p1 answers, short-circuit must fire!
        vi.advanceTimersByTime(2000);
        room.submitAnswer({ playerId: p1.id, questionIndex: 0, selectedIndex: 1, clientTimeMs: 2000 });

        expect(room.status).toBe('QUESTION_REVEAL');
      });
    });

    describe('3.2 Speed Bonus vs. Streak Bonus Compound Interplay', () => {
      it('should properly weigh high speed against accumulated streaks', () => {
        // Player A: answers very fast (1000ms) with streak 1 -> speed 933 + streak 0 = 933
        const resA = calculateScore(true, 1000, 0);
        expect(resA.points).toBe(933);

        // Player B: answers moderately (6000ms) with streak 4 -> speed 600 + streak 300 = 900
        const resB = calculateScore(true, 6000, 3);
        expect(resB.points).toBe(900);

        // Player C: answers slower (9000ms) with streak 5+ -> speed 400 + streak 500 = 900
        const resC = calculateScore(true, 9000, 4);
        expect(resC.points).toBe(900);

        // Player A beats B and C due to raw speed
        expect(resA.points).toBeGreaterThan(resB.points);
        expect(resB.points).toBe(resC.points);
      });
    });

    describe('3.3 Host Security & State Sanitization', () => {
      it('should reject host actions if provided hostToken is invalid', () => {
        const { room } = manager.createRoom({ customCode: 'SEC001' });
        const player = room.joinPlayer('Học viên');

        const badAction = room.handleHostAction({
          hostToken: 'INVALID_TOKEN',
          action: 'START',
        });
        expect(badAction).toBe(false);
        expect(room.status).toBe('LOBBY');
      });

      it('should sanitize state to hide correctIndex from non-host players during QUESTION_ACTIVE', () => {
        const { room, hostToken } = manager.createRoom({ customCode: 'SEC002' });
        const p1 = room.joinPlayer('Học viên 1');
        const p2 = room.joinPlayer('Học viên 2');

        room.startGame(hostToken);
        vi.advanceTimersByTime(3000); // QUESTION_ACTIVE

        // P1 submits answer
        room.submitAnswer({ playerId: p1.id, questionIndex: 0, selectedIndex: 1, clientTimeMs: 1500 });

        // Sanitized state for P2
        const p2State = room.getSanitizedState({ forHost: false, viewerPlayerId: p2.id });
        expect(p2State.hostToken).toBe(''); // Host token hidden

        // In sanitized state, P1's answer details are masked so P2 cannot inspect network response
        const maskedAnswer = p2State.players[p1.id]?.answers[0];
        expect(maskedAnswer?.isCorrect).toBe(false);
        expect(maskedAnswer?.pointsEarned).toBe(0);
        expect(maskedAnswer?.selectedIndex).toBe(-1);
      });
    });
  });

  // =========================================================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIO (>= 10 PLAYERS FULL SIMULATION)
  // =========================================================================
  describe('Tier 4: Real-World Application Scenario (Classroom Simulation)', () => {
    it('should successfully run a full 15-question quiz with 12 concurrent players to final podium and analytics', () => {
      // 1. Create room
      const { room, hostToken, roomCode } = manager.createRoom({
        customCode: 'HCMUTE',
      });
      expect(roomCode).toBe('HCMUTE');
      expect(room.status).toBe('LOBBY');

      // 2. 12 Diverse participants join
      interface SimulatedPlayerSpec {
        id: string;
        name: string;
        unit: string;
        reflexMs: number;
        accuracyRatio: number; // probability of correct answer
      }

      const roster: SimulatedPlayerSpec[] = [
        { id: 'u01', name: 'Nguyễn Văn An', unit: 'Chi đoàn K21 CNTT', reflexMs: 1200, accuracyRatio: 1.0 }, // 100% correct, fast
        { id: 'u02', name: 'Trần Thị Bích', unit: 'Chi đoàn K21 Quản trị', reflexMs: 2500, accuracyRatio: 0.93 }, // 14/15 correct
        { id: 'u03', name: 'Lê Hoàng Long', unit: 'Chi đoàn K22 Cơ khí', reflexMs: 650, accuracyRatio: 0.85 }, // Lightning reflex!
        { id: 'u04', name: 'Phạm Minh Đức', unit: 'Chi đoàn K21 Điện - Điện tử', reflexMs: 3800, accuracyRatio: 0.8 },
        { id: 'u05', name: 'Đỗ Khánh Vy', unit: 'Chi đoàn K22 May thời trang', reflexMs: 4500, accuracyRatio: 0.73 },
        { id: 'u06', name: 'Vũ Gia Huy', unit: 'Chi đoàn K20 Xây dựng', reflexMs: 7200, accuracyRatio: 0.8 },
        { id: 'u07', name: 'Bùi Thu Hà', unit: 'Chi đoàn K23 Ngoại ngữ', reflexMs: 5500, accuracyRatio: 0.67 },
        { id: 'u08', name: 'Đặng Quốc Bảo', unit: 'Chi đoàn K22 Tự động hóa', reflexMs: 2800, accuracyRatio: 0.6 },
        { id: 'u09', name: 'Ngô Thanh Tùng', unit: 'Chi đoàn K21 In - Truyền thông', reflexMs: 8200, accuracyRatio: 0.53 },
        { id: 'u10', name: 'Lý Mỹ Duyên', unit: 'Chi đoàn K23 Kinh tế', reflexMs: 9100, accuracyRatio: 0.47 },
        { id: 'u11', name: 'Hồ Văn Cường', unit: 'Chi đoàn K22 Nhiệt lạnh', reflexMs: 6000, accuracyRatio: 0.4 },
        { id: 'u12', name: 'Trịnh Kim Ngân', unit: 'Chi đoàn K21 Công nghệ Hóa', reflexMs: 10500, accuracyRatio: 0.33 },
      ];

      const players: PlayerState[] = roster.map((spec) =>
        room.joinPlayer(spec.name, spec.unit, spec.id)
      );
      expect(Object.keys(room.players).length).toBe(12);

      // 3. Host starts game
      room.handleHostAction({ hostToken, action: 'START' });
      expect(room.status).toBe('QUESTION_START');

      // 4. Loop through ALL 15 QUESTIONS
      for (let qIndex = 0; qIndex < 15; qIndex++) {
        expect(room.currentQuestionIndex).toBe(qIndex);

        // Advance 3s preview timer -> transitions to QUESTION_ACTIVE
        vi.advanceTimersByTime(DEFAULT_PREVIEW_DURATION_MS);
        expect(room.status).toBe('QUESTION_ACTIVE');

        const currentQuestion = TRAINING_QUIZ_QUESTIONS[qIndex];
        expect(currentQuestion.id).toBe(qIndex + 1);

        // Sort players by reflexMs ASC so they submit in realistic chronological order
        const sortedByReflex = [...roster].sort((a, b) => a.reflexMs - b.reflexMs);
        let elapsed = 0;

        sortedByReflex.forEach((playerSpec) => {
          const delta = playerSpec.reflexMs - elapsed;
          if (delta > 0) {
            vi.advanceTimersByTime(delta);
            elapsed = playerSpec.reflexMs;
          }

          const willBeCorrect =
            playerSpec.id === 'u01' || // u01 always correct
            (qIndex + playerSpec.reflexMs) % 10 < playerSpec.accuracyRatio * 10;

          const chosenOption = willBeCorrect
            ? currentQuestion.correctIndex
            : (currentQuestion.correctIndex + 1) % 4;

          room.submitAnswer({
            playerId: playerSpec.id,
            questionIndex: qIndex,
            selectedIndex: chosenOption,
            clientTimeMs: playerSpec.reflexMs,
          });
        });

        // Fast Short-Circuit activates immediately once all 12 players have submitted!
        expect(room.status).toBe('QUESTION_REVEAL');

        // Fastest player in this question is detected
        const fastestInQ = room.fastestPlayerInCurrentQuestion;
        if (fastestInQ) {
          expect(fastestInQ.responseTimeMs).toBeGreaterThanOrEqual(0);
        }

        // Host reviews answers and opens LEADERBOARD
        room.handleHostAction({ hostToken, action: 'SHOW_LEADERBOARD' });
        expect(room.status).toBe('LEADERBOARD');

        // Verify leaderboard is sorted strictly descending by score
        const lb = getLeaderboard(room.players);
        for (let i = 0; i < lb.length - 1; i++) {
          expect(lb[i].score).toBeGreaterThanOrEqual(lb[i + 1].score);
        }

        // Advance to next question (or end game if last question)
        if (qIndex < 14) {
          room.handleHostAction({ hostToken, action: 'NEXT_QUESTION' });
          expect(room.status).toBe('QUESTION_START');
        } else {
          room.handleHostAction({ hostToken, action: 'END_GAME' });
          expect(room.status).toBe('FINAL_RESULTS');
        }
      }

      // 5. Verify Final Results (Podium, Lightning Award, Class Analytics)
      const finalState = room.getState();
      expect(finalState.status).toBe('FINAL_RESULTS');

      const awards = getFinalAwards(room.players, TRAINING_QUIZ_QUESTIONS);

      // Verify Podium
      expect(awards.podium.length).toBe(3);
      expect(awards.podium[0].rank).toBe(1);
      expect(awards.podium[1].rank).toBe(2);
      expect(awards.podium[2].rank).toBe(3);

      // Rank 1 should be Nguyễn Văn An (perfect score + solid speed)
      expect(awards.podium[0].nickname).toBe('Nguyễn Văn An');
      expect(awards.podium[0].correctCount).toBe(15);
      expect(awards.podium[0].score).toBeGreaterThan(awards.podium[1].score);

      // Verify Lightning Award ("Tia chớp Đoàn - Hội")
      expect(awards.lightningAward).toBeDefined();
      // Lê Hoàng Long (u03) has the fastest reflex (~650ms) among correct answers
      expect(awards.lightningAward?.nickname).toBe('Lê Hoàng Long');
      expect(awards.lightningAward?.averageResponseTimeMs).toBeLessThan(1000);

      // Verify Class Analytics
      const analytics = awards.classAnalytics;
      expect(analytics.totalParticipants).toBe(12);
      expect(analytics.averageScore).toBeGreaterThan(0);
      expect(analytics.questionsStats.length).toBe(15);

      // Verify hardest and easiest questions are computed
      expect(analytics.hardestQuestion).toBeDefined();
      expect(analytics.easiestQuestion).toBeDefined();

      // Clean up room
      manager.deleteRoom(roomCode);
      expect(manager.hasRoom(roomCode)).toBe(false);
    });
  });
});
