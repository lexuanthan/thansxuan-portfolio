import { describe, it, expect } from 'vitest';
import {
  calculateScore,
  getStreakBonus,
  getStreakTier,
  getLeaderboard,
  getLeaderboardEntries,
  getFastestPlayerInQuestion,
  getFinalAwards,
} from '../src/lib/training-quiz/scoringEngine';
import { PlayerState, QuizQuestion } from '../src/lib/training-quiz/types';

describe('Training Quiz Scoring Engine', () => {
  describe('Speed Score Calculations (Millisecond Precision)', () => {
    it('awards max 1000 base points for instantaneous (0ms) response', () => {
      const result = calculateScore(true, 0, 0);
      expect(result.isCorrect).toBe(true);
      expect(result.baseScore).toBe(1000);
      expect(result.speedBonus).toBe(1000);
      expect(result.streakBonus).toBe(0);
      expect(result.points).toBe(1000);
      expect(result.newStreak).toBe(1);
    });

    it('clamps negative response times to 0ms and awards 1000 points', () => {
      const result = calculateScore(true, -500, 0);
      expect(result.isCorrect).toBe(true);
      expect(result.baseScore).toBe(1000);
      expect(result.points).toBe(1000);
      expect(result.responseTimeMs).toBe(0);
    });

    it('calculates millisecond proportional points accurately across intervals', () => {
      // At 1500ms (10% elapsed, 90% left) -> 1000 * (13500 / 15000) = 900
      const r1500 = calculateScore(true, 1500, 0);
      expect(r1500.baseScore).toBe(900);
      expect(r1500.points).toBe(900);

      // At 5000ms (10000ms left) -> 1000 * (10000 / 15000) = 667
      const r5000 = calculateScore(true, 5000, 0);
      expect(r5000.baseScore).toBe(667);
      expect(r5000.points).toBe(667);

      // At 7500ms (half time, 7500ms left) -> 1000 * (7500 / 15000) = 500
      const r7500 = calculateScore(true, 7500, 0);
      expect(r7500.baseScore).toBe(500);
      expect(r7500.points).toBe(500);

      // At 10000ms (5000ms left) -> 1000 * (5000 / 15000) = 333
      const r10000 = calculateScore(true, 10000, 0);
      expect(r10000.baseScore).toBe(333);
      expect(r10000.points).toBe(333);

      // At 14000ms (1000ms left) -> 1000 * (1000 / 15000) = 67
      const r14000 = calculateScore(true, 14000, 0);
      expect(r14000.baseScore).toBe(67);
      expect(r14000.points).toBe(67);

      // At 14999ms (1ms left) -> round(1000 * 1 / 15000) = 0
      const r14999 = calculateScore(true, 14999, 0);
      expect(r14999.baseScore).toBe(0);
      expect(r14999.points).toBe(0);
      expect(r14999.newStreak).toBe(1);
    });

    it('awards 0 points and resets streak on timeout (>= 15000ms)', () => {
      const at15000 = calculateScore(true, 15000, 3);
      expect(at15000.isCorrect).toBe(false);
      expect(at15000.points).toBe(0);
      expect(at15000.newStreak).toBe(0);

      const past15000 = calculateScore(true, 16200, 4);
      expect(past15000.isCorrect).toBe(false);
      expect(past15000.points).toBe(0);
      expect(past15000.newStreak).toBe(0);
    });

    it('awards 0 points and resets streak on incorrect answer', () => {
      const wrongFast = calculateScore(false, 800, 5);
      expect(wrongFast.isCorrect).toBe(false);
      expect(wrongFast.baseScore).toBe(0);
      expect(wrongFast.speedBonus).toBe(0);
      expect(wrongFast.streakBonus).toBe(0);
      expect(wrongFast.points).toBe(0);
      expect(wrongFast.newStreak).toBe(0);
    });
  });

  describe('Streak Bonus Tiers', () => {
    it('verifies exact bonus increments by streak level', () => {
      expect(getStreakBonus(0)).toBe(0);
      expect(getStreakBonus(1)).toBe(0);
      expect(getStreakBonus(2)).toBe(100);
      expect(getStreakBonus(3)).toBe(200);
      expect(getStreakBonus(4)).toBe(300);
      expect(getStreakBonus(5)).toBe(500);
      expect(getStreakBonus(10)).toBe(500);
    });

    it('returns proper tier metadata and badges', () => {
      expect(getStreakTier(1).badge).toBe('Streak x1');
      expect(getStreakTier(2).badge).toContain('Streak x2');
      expect(getStreakTier(3).badge).toContain('Streak x3');
      expect(getStreakTier(4).badge).toContain('Super Streak x4');
      expect(getStreakTier(5).badge).toContain('Unstoppable x5+');
    });

    it('combines speed points and streak bonuses correctly', () => {
      // 1st correct answer: streak 1 -> speed (1000ms -> 933) + 0 bonus = 933
      const step1 = calculateScore(true, 1000, 0);
      expect(step1.newStreak).toBe(1);
      expect(step1.streakBonus).toBe(0);
      expect(step1.points).toBe(933);

      // 2nd correct answer: streak 2 -> speed (3000ms -> 800) + 100 bonus = 900
      const step2 = calculateScore(true, 3000, step1.newStreak);
      expect(step2.newStreak).toBe(2);
      expect(step2.streakBonus).toBe(100);
      expect(step2.points).toBe(900);

      // 3rd correct answer: streak 3 -> speed (7500ms -> 500) + 200 bonus = 700
      const step3 = calculateScore(true, 7500, step2.newStreak);
      expect(step3.newStreak).toBe(3);
      expect(step3.streakBonus).toBe(200);
      expect(step3.points).toBe(700);

      // 4th correct answer: streak 4 -> speed (0ms -> 1000) + 300 bonus = 1300
      const step4 = calculateScore(true, 0, step3.newStreak);
      expect(step4.newStreak).toBe(4);
      expect(step4.streakBonus).toBe(300);
      expect(step4.points).toBe(1300);

      // 5th correct answer: streak 5 -> speed (0ms -> 1000) + 500 bonus = 1500
      const step5 = calculateScore(true, 0, step4.newStreak);
      expect(step5.newStreak).toBe(5);
      expect(step5.streakBonus).toBe(500);
      expect(step5.points).toBe(1500);

      // 6th correct answer: streak 6 -> speed (0ms -> 1000) + 500 bonus = 1500
      const step6 = calculateScore(true, 0, step5.newStreak);
      expect(step6.newStreak).toBe(6);
      expect(step6.streakBonus).toBe(500);
      expect(step6.points).toBe(1500);

      // 7th answer wrong: resets streak to 0
      const step7 = calculateScore(false, 500, step6.newStreak);
      expect(step7.newStreak).toBe(0);
      expect(step7.points).toBe(0);
    });
  });

  describe('Deterministic Multi-Tier Tie-Breaking', () => {
    function makePlayer(partial: Partial<PlayerState> & { id: string; nickname: string }): PlayerState {
      return {
        unit: 'Chi đoàn Cơ khí',
        score: 0,
        streak: 0,
        maxStreak: 0,
        correctCount: 0,
        totalResponseTimeMs: 0,
        answers: {},
        connected: true,
        joinedAt: 1000,
        ...partial,
      };
    }

    it('breaks ties primarily by total score descending', () => {
      const p1 = makePlayer({ id: 'p1', nickname: 'Anh A', score: 3500 });
      const p2 = makePlayer({ id: 'p2', nickname: 'Chị B', score: 4200 });
      const p3 = makePlayer({ id: 'p3', nickname: 'Em C', score: 2800 });

      const leaderboard = getLeaderboard([p1, p2, p3]);
      expect(leaderboard[0].id).toBe('p2');
      expect(leaderboard[1].id).toBe('p1');
      expect(leaderboard[2].id).toBe('p3');
    });

    it('breaks ties when scores are equal by totalResponseTimeMs ascending (faster player wins)', () => {
      const p1 = makePlayer({
        id: 'p1',
        nickname: 'Anh A',
        score: 3000,
        totalResponseTimeMs: 9500,
      });
      const p2 = makePlayer({
        id: 'p2',
        nickname: 'Chị B',
        score: 3000,
        totalResponseTimeMs: 7200, // Faster!
      });

      const leaderboard = getLeaderboard([p1, p2]);
      expect(leaderboard[0].id).toBe('p2');
      expect(leaderboard[1].id).toBe('p1');
    });

    it('breaks ties when score and time are equal by correctCount descending', () => {
      const p1 = makePlayer({
        id: 'p1',
        nickname: 'Anh A',
        score: 2500,
        totalResponseTimeMs: 6000,
        correctCount: 4, // More correct answers
      });
      const p2 = makePlayer({
        id: 'p2',
        nickname: 'Chị B',
        score: 2500,
        totalResponseTimeMs: 6000,
        correctCount: 3,
      });

      const leaderboard = getLeaderboard([p1, p2]);
      expect(leaderboard[0].id).toBe('p1');
      expect(leaderboard[1].id).toBe('p2');
    });

    it('breaks ties when score, time, and correctCount are equal by joinedAt ascending (earlier join)', () => {
      const p1 = makePlayer({
        id: 'p1',
        nickname: 'Anh A',
        score: 2000,
        totalResponseTimeMs: 5000,
        correctCount: 2,
        joinedAt: 500, // Joined earlier
      });
      const p2 = makePlayer({
        id: 'p2',
        nickname: 'Chị B',
        score: 2000,
        totalResponseTimeMs: 5000,
        correctCount: 2,
        joinedAt: 900,
      });

      const leaderboard = getLeaderboard([p2, p1]);
      expect(leaderboard[0].id).toBe('p1');
      expect(leaderboard[1].id).toBe('p2');
    });

    it('generates formatted LeaderboardEntries with sequential rank numbers', () => {
      const players = {
        p1: makePlayer({ id: 'p1', nickname: 'Thắng', score: 5000 }),
        p2: makePlayer({ id: 'p2', nickname: 'Lan', score: 6200 }),
      };

      const entries = getLeaderboardEntries(players);
      expect(entries).toHaveLength(2);
      expect(entries[0].rank).toBe(1);
      expect(entries[0].nickname).toBe('Lan');
      expect(entries[1].rank).toBe(2);
      expect(entries[1].nickname).toBe('Thắng');
    });
  });

  describe('Fastest Player Per Question', () => {
    it('identifies the fastest correct player in a question', () => {
      const players: Record<string, PlayerState> = {
        p1: {
          id: 'p1',
          nickname: 'Đức',
          unit: 'K21 Cơ khí',
          score: 1000,
          streak: 1,
          maxStreak: 1,
          correctCount: 1,
          totalResponseTimeMs: 3200,
          answers: {
            0: { selectedIndex: 1, responseTimeMs: 3200, isCorrect: true, pointsEarned: 787 },
          },
          connected: true,
        },
        p2: {
          id: 'p2',
          nickname: 'Hà',
          unit: 'K22 CNTT',
          score: 1100,
          streak: 1,
          maxStreak: 1,
          correctCount: 1,
          totalResponseTimeMs: 1450,
          answers: {
            0: { selectedIndex: 1, responseTimeMs: 1450, isCorrect: true, pointsEarned: 903 },
          },
          connected: true,
        },
        p3: {
          id: 'p3',
          nickname: 'Quân',
          unit: 'K20 Điện',
          score: 0,
          streak: 0,
          maxStreak: 0,
          correctCount: 0,
          totalResponseTimeMs: 800,
          answers: {
            0: { selectedIndex: 0, responseTimeMs: 800, isCorrect: false, pointsEarned: 0 }, // Fastest, but wrong!
          },
          connected: true,
        },
      };

      const fastest = getFastestPlayerInQuestion(players, 0);
      expect(fastest).not.toBeNull();
      expect(fastest?.playerId).toBe('p2');
      expect(fastest?.nickname).toBe('Hà');
      expect(fastest?.responseTimeMs).toBe(1450);
    });

    it('returns null if no player answered correctly', () => {
      const players: Record<string, PlayerState> = {
        p1: {
          id: 'p1',
          nickname: 'Minh',
          score: 0,
          streak: 0,
          maxStreak: 0,
          correctCount: 0,
          totalResponseTimeMs: 1200,
          answers: {
            2: { selectedIndex: 0, responseTimeMs: 1200, isCorrect: false, pointsEarned: 0 },
          },
          connected: true,
        },
      };

      const fastest = getFastestPlayerInQuestion(players, 2);
      expect(fastest).toBeNull();
    });
  });

  describe('Final Awards & Analytics Summary', () => {
    const mockQuestions: QuizQuestion[] = [
      {
        id: 1,
        question: 'Câu 1?',
        level: 'Nhận biết',
        timeLimit: 15,
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 1,
        explanation: 'Giải thích 1',
      },
      {
        id: 2,
        question: 'Câu 2?',
        level: 'Thông hiểu',
        timeLimit: 15,
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 2,
        explanation: 'Giải thích 2',
      },
      {
        id: 3,
        question: 'Câu 3?',
        level: 'Tình huống thực tế',
        timeLimit: 15,
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 3,
        explanation: 'Giải thích 3',
      },
    ];

    it('generates Top 3 Podium with .first, .second, .third properties', () => {
      const players: Record<string, PlayerState> = {
        p1: {
          id: 'p1',
          nickname: 'Vàng',
          score: 9500,
          streak: 3,
          maxStreak: 3,
          correctCount: 3,
          totalResponseTimeMs: 3000,
          answers: {
            0: { selectedIndex: 1, responseTimeMs: 1000, isCorrect: true, pointsEarned: 933 },
            1: { selectedIndex: 2, responseTimeMs: 1000, isCorrect: true, pointsEarned: 1033 },
            2: { selectedIndex: 3, responseTimeMs: 1000, isCorrect: true, pointsEarned: 1133 },
          },
          connected: true,
        },
        p2: {
          id: 'p2',
          nickname: 'Bạc',
          score: 7200,
          streak: 2,
          maxStreak: 2,
          correctCount: 2,
          totalResponseTimeMs: 4000,
          answers: {
            0: { selectedIndex: 1, responseTimeMs: 2000, isCorrect: true, pointsEarned: 867 },
            1: { selectedIndex: 2, responseTimeMs: 2000, isCorrect: true, pointsEarned: 967 },
          },
          connected: true,
        },
        p3: {
          id: 'p3',
          nickname: 'Đồng',
          score: 5100,
          streak: 1,
          maxStreak: 1,
          correctCount: 2,
          totalResponseTimeMs: 6000,
          answers: {
            0: { selectedIndex: 1, responseTimeMs: 3000, isCorrect: true, pointsEarned: 800 },
            2: { selectedIndex: 3, responseTimeMs: 3000, isCorrect: true, pointsEarned: 800 },
          },
          connected: true,
        },
        p4: {
          id: 'p4',
          nickname: 'Khuyến khích',
          score: 2000,
          streak: 0,
          maxStreak: 1,
          correctCount: 1,
          totalResponseTimeMs: 8000,
          answers: {
            0: { selectedIndex: 1, responseTimeMs: 4000, isCorrect: true, pointsEarned: 733 },
          },
          connected: true,
        },
      };

      const awards = getFinalAwards(players, mockQuestions);

      expect(awards.podium).toHaveLength(3);
      expect(awards.podium[0].nickname).toBe('Vàng');
      expect(awards.podium[0].rank).toBe(1);
      expect(awards.podium[1].nickname).toBe('Bạc');
      expect(awards.podium[1].rank).toBe(2);
      expect(awards.podium[2].nickname).toBe('Đồng');
      expect(awards.podium[2].rank).toBe(3);

      // Property access check
      expect(awards.podium.first?.nickname).toBe('Vàng');
      expect(awards.podium.second?.nickname).toBe('Bạc');
      expect(awards.podium.third?.nickname).toBe('Đồng');
    });

    it('awards Lightning Award ("Tia chớp Đoàn - Hội") to player with fastest average correct response time', () => {
      const players: Record<string, PlayerState> = {
        // Player 1: answered 2 correct, times: 2000ms, 4000ms -> avg: 3000ms
        p1: {
          id: 'p1',
          nickname: 'Player 1',
          score: 2000,
          streak: 2,
          maxStreak: 2,
          correctCount: 2,
          totalResponseTimeMs: 6000,
          answers: {
            0: { selectedIndex: 1, responseTimeMs: 2000, isCorrect: true, pointsEarned: 867 },
            1: { selectedIndex: 2, responseTimeMs: 4000, isCorrect: true, pointsEarned: 833 },
          },
          connected: true,
        },
        // Player 2: answered 2 correct, times: 1000ms, 1200ms -> avg: 1100ms (Fastest average!)
        p2: {
          id: 'p2',
          nickname: 'Tia Chớp',
          unit: 'Chi đoàn K21',
          score: 2200,
          streak: 2,
          maxStreak: 2,
          correctCount: 2,
          totalResponseTimeMs: 2200,
          answers: {
            0: { selectedIndex: 1, responseTimeMs: 1000, isCorrect: true, pointsEarned: 933 },
            1: { selectedIndex: 2, responseTimeMs: 1200, isCorrect: true, pointsEarned: 1020 },
          },
          connected: true,
        },
        // Player 3: answered fast on wrong questions (500ms), but only 1 correct at 1500ms -> avg: 1500ms
        p3: {
          id: 'p3',
          nickname: 'Player 3',
          score: 1000,
          streak: 1,
          maxStreak: 1,
          correctCount: 1,
          totalResponseTimeMs: 2000,
          answers: {
            0: { selectedIndex: 0, responseTimeMs: 500, isCorrect: false, pointsEarned: 0 },
            1: { selectedIndex: 2, responseTimeMs: 1500, isCorrect: true, pointsEarned: 900 },
          },
          connected: true,
        },
      };

      const awards = getFinalAwards(players, mockQuestions);
      expect(awards.lightningAward).toBeDefined();
      expect(awards.lightningAward?.playerId).toBe('p2');
      expect(awards.lightningAward?.nickname).toBe('Tia Chớp');
      expect(awards.lightningAward?.averageResponseTimeMs).toBe(1100);
    });

    it('calculates class analytics accurately (average score, hardest, easiest questions)', () => {
      const players: Record<string, PlayerState> = {
        p1: {
          id: 'p1',
          nickname: 'P1',
          score: 3000,
          streak: 3,
          maxStreak: 3,
          correctCount: 3,
          totalResponseTimeMs: 3000,
          answers: {
            0: { selectedIndex: 1, responseTimeMs: 1000, isCorrect: true, pointsEarned: 1000 },
            1: { selectedIndex: 2, responseTimeMs: 1000, isCorrect: true, pointsEarned: 1000 },
            2: { selectedIndex: 3, responseTimeMs: 1000, isCorrect: true, pointsEarned: 1000 },
          },
          connected: true,
        },
        p2: {
          id: 'p2',
          nickname: 'P2',
          score: 1000,
          streak: 1,
          maxStreak: 1,
          correctCount: 1,
          totalResponseTimeMs: 3000,
          answers: {
            0: { selectedIndex: 1, responseTimeMs: 1000, isCorrect: true, pointsEarned: 1000 },
            1: { selectedIndex: 0, responseTimeMs: 1000, isCorrect: false, pointsEarned: 0 },
            2: { selectedIndex: 0, responseTimeMs: 1000, isCorrect: false, pointsEarned: 0 },
          },
          connected: true,
        },
      };

      const awards = getFinalAwards(players, mockQuestions);

      expect(awards.classAnalytics.totalParticipants).toBe(2);
      expect(awards.classAnalytics.averageScore).toBe(2000); // (3000 + 1000) / 2

      // Question 0: 2/2 correct = 100% (Easiest)
      // Question 1: 1/2 correct = 50%
      // Question 2: 1/2 correct = 50%
      expect(awards.classAnalytics.easiestQuestion?.questionIndex).toBe(0);
      expect(awards.classAnalytics.easiestQuestion?.accuracyRate).toBe(100);

      // Hardest question will be question 1 or 2 (50%)
      expect(awards.classAnalytics.hardestQuestion?.accuracyRate).toBe(50);
    });
  });
});
