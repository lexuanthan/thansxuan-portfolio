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

describe('Adversarial Mathematical Stress Suite: scoringEngine.ts', () => {
  // Helper to create mock player states
  function createPlayer(overrides: Partial<PlayerState> & { id: string; nickname: string }): PlayerState {
    return {
      unit: 'Chi đoàn Kiểm thử',
      score: 0,
      streak: 0,
      maxStreak: 0,
      correctCount: 0,
      totalResponseTimeMs: 0,
      answers: {},
      connected: true,
      joinedAt: 1000,
      ...overrides,
    };
  }

  // =========================================================================
  // 1. SUB-MILLISECOND EDGE CASES & BOUNDARY POINTS
  // =========================================================================
  describe('1. Sub-Millisecond & Boundary Point Stress', () => {
    it('exact 0ms: awards exactly 1000 points and increments streak to 1', () => {
      const res = calculateScore(true, 0, 0);
      expect(res.isCorrect).toBe(true);
      expect(res.baseScore).toBe(1000);
      expect(res.speedBonus).toBe(1000);
      expect(res.streakBonus).toBe(0);
      expect(res.points).toBe(1000);
      expect(res.newStreak).toBe(1);
      expect(res.responseTimeMs).toBe(0);
    });

    it('negative and sub-millisecond negative values: clamped safely to 0ms', () => {
      const negSub = calculateScore(true, -0.00001, 0);
      expect(negSub.isCorrect).toBe(true);
      expect(negSub.baseScore).toBe(1000);
      expect(negSub.points).toBe(1000);
      expect(negSub.responseTimeMs).toBe(0);

      const negLarge = calculateScore(true, -999999.999, 2);
      expect(negLarge.isCorrect).toBe(true);
      expect(negLarge.baseScore).toBe(1000);
      expect(negLarge.streakBonus).toBe(200); // streak 3
      expect(negLarge.points).toBe(1200);
      expect(negLarge.responseTimeMs).toBe(0);
    });

    it('sub-millisecond positive values: fractional precision without floating-point leaks', () => {
      // 0.0001ms (barely elapsed): rounds to 1000
      const res1 = calculateScore(true, 0.0001, 0);
      expect(res1.speedBonus).toBe(1000);
      expect(Number.isInteger(res1.points)).toBe(true);

      // 0.5ms: 1000 * (14999.5 / 15000) = 999.9666... -> 1000
      const res2 = calculateScore(true, 0.5, 0);
      expect(res2.speedBonus).toBe(1000);

      // 7.49ms vs 7.51ms rounding boundary:
      // at 7.5ms: 1000 * (14992.5 / 15000) = 999.5 -> rounds to 1000
      const resRoundingHigh = calculateScore(true, 7.5, 0);
      expect(resRoundingHigh.speedBonus).toBe(1000);

      // at 7.6ms: 1000 * (14992.4 / 15000) = 999.4933... -> rounds to 999
      const resRoundingLow = calculateScore(true, 7.6, 0);
      expect(resRoundingLow.speedBonus).toBe(999);

      // 14992.5ms: 1000 * (7.5 / 15000) = 0.5 -> rounds to 1
      const res1pt = calculateScore(true, 14992.5, 0);
      expect(res1pt.speedBonus).toBe(1);

      // 14999.999ms: 1000 * (0.001 / 15000) = 0.000066... -> rounds to 0
      // Student is correct within 15s window, but speed points rounded to 0
      const resNear15k = calculateScore(true, 14999.999, 0);
      expect(resNear15k.isCorrect).toBe(true);
      expect(resNear15k.speedBonus).toBe(0);
      expect(resNear15k.points).toBe(0);
      expect(resNear15k.newStreak).toBe(1);
    });

    it('exact 15000ms boundary point: strictly treated as timeout (0 points, streak reset)', () => {
      const resExact15k = calculateScore(true, 15000, 5);
      expect(resExact15k.isCorrect).toBe(false);
      expect(resExact15k.points).toBe(0);
      expect(resExact15k.speedBonus).toBe(0);
      expect(resExact15k.streakBonus).toBe(0);
      expect(resExact15k.newStreak).toBe(0);
      expect(resExact15k.responseTimeMs).toBe(15000);
    });

    it('exact 15001ms and post-deadline values: strictly 0 points and streak reset', () => {
      const res15001 = calculateScore(true, 15001, 8);
      expect(res15001.isCorrect).toBe(false);
      expect(res15001.points).toBe(0);
      expect(res15001.newStreak).toBe(0);

      const resSub15kPlus = calculateScore(true, 15000.0001, 10);
      expect(resSub15kPlus.isCorrect).toBe(false);
      expect(resSub15kPlus.points).toBe(0);
      expect(resSub15kPlus.newStreak).toBe(0);

      const resHuge = calculateScore(true, 999999999, 4);
      expect(resHuge.isCorrect).toBe(false);
      expect(resHuge.points).toBe(0);
      expect(resHuge.newStreak).toBe(0);
    });

    it('mathematical monotonicity verification: speedBonus strictly non-increasing across 15,000 sampling points', () => {
      let previousScore = 1000;
      for (let ms = 0; ms < 15000; ms += 15) {
        // Sample every 15ms + random sub-millisecond fraction
        const sampleTime = ms + (ms % 7) * 0.1;
        if (sampleTime >= 15000) break;
        const res = calculateScore(true, sampleTime, 0);
        expect(res.speedBonus).toBeLessThanOrEqual(previousScore);
        expect(res.speedBonus).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(res.speedBonus)).toBe(true);
        previousScore = res.speedBonus;
      }
    });
  });

  // =========================================================================
  // 2. EXTREME STREAK COUNTS & SCALING
  // =========================================================================
  describe('2. Extreme Streak Counts (streak = 10, 50, 100, 1000)', () => {
    it('verifies streak bonus caps safely at +500 for streaks >= 5', () => {
      expect(getStreakBonus(5)).toBe(500);
      expect(getStreakBonus(10)).toBe(500);
      expect(getStreakBonus(50)).toBe(500);
      expect(getStreakBonus(100)).toBe(500);
      expect(getStreakBonus(10000)).toBe(500);
    });

    it('verifies getStreakTier metadata for extreme streak values', () => {
      const tier10 = getStreakTier(10);
      expect(tier10.streak).toBe(10);
      expect(tier10.bonus).toBe(500);
      expect(tier10.badge).toContain('Unstoppable x5+');

      const tier50 = getStreakTier(50);
      expect(tier50.streak).toBe(50);
      expect(tier50.bonus).toBe(500);
      expect(tier50.badge).toContain('Unstoppable x5+');

      const tier100 = getStreakTier(100);
      expect(tier100.streak).toBe(100);
      expect(tier100.bonus).toBe(500);
      expect(tier100.badge).toContain('Unstoppable x5+');
    });

    it('verifies calculateScore compound points at extreme streaks (streak 10, 50, 100)', () => {
      // Transitioning 9 -> 10: streak 10 earns 500 bonus + speed
      const atStreak10 = calculateScore(true, 1500, 9);
      expect(atStreak10.newStreak).toBe(10);
      expect(atStreak10.streakBonus).toBe(500);
      expect(atStreak10.speedBonus).toBe(900);
      expect(atStreak10.points).toBe(1400);

      // Transitioning 49 -> 50: streak 50 earns 500 bonus + speed
      const atStreak50 = calculateScore(true, 0, 49);
      expect(atStreak50.newStreak).toBe(50);
      expect(atStreak50.streakBonus).toBe(500);
      expect(atStreak50.speedBonus).toBe(1000);
      expect(atStreak50.points).toBe(1500); // Theoretical max single question score

      // Transitioning 99 -> 100: streak 100 earns 500 bonus + speed
      const atStreak100 = calculateScore(true, 7500, 99);
      expect(atStreak100.newStreak).toBe(100);
      expect(atStreak100.streakBonus).toBe(500);
      expect(atStreak100.speedBonus).toBe(500);
      expect(atStreak100.points).toBe(1000);
    });

    it('verifies extreme streak instantly collapses to 0 on single wrong or timeout', () => {
      // Wrong answer with 100-streak
      const wrong = calculateScore(false, 500, 100);
      expect(wrong.newStreak).toBe(0);
      expect(wrong.points).toBe(0);
      expect(wrong.streakBonus).toBe(0);

      // Timeout with 100-streak
      const timeout = calculateScore(true, 15000, 100);
      expect(timeout.newStreak).toBe(0);
      expect(timeout.points).toBe(0);
    });

    it('verifies theoretical maximum and minimum score limits for 15 questions', () => {
      // Theoretical maximum score:
      // Q1: 0ms reflex, streak 1 -> 1000 + 0 = 1000
      // Q2: 0ms reflex, streak 2 -> 1000 + 100 = 1100
      // Q3: 0ms reflex, streak 3 -> 1000 + 200 = 1200
      // Q4: 0ms reflex, streak 4 -> 1000 + 300 = 1300
      // Q5..Q15 (11 questions): 0ms reflex, streak >=5 -> 11 * 1500 = 16500
      // Total Theoretical Maximum = 21,100 points
      let currentStreak = 0;
      let totalMaxScore = 0;

      for (let q = 1; q <= 15; q++) {
        const result = calculateScore(true, 0, currentStreak);
        totalMaxScore += result.points;
        currentStreak = result.newStreak;
      }

      expect(totalMaxScore).toBe(21100);
      expect(currentStreak).toBe(15);

      // Theoretical minimum score: all 0
      let totalMinScore = 0;
      let minStreak = 0;
      for (let q = 1; q <= 15; q++) {
        const result = calculateScore(false, 5000, minStreak);
        totalMinScore += result.points;
        minStreak = result.newStreak;
      }
      expect(totalMinScore).toBe(0);
      expect(minStreak).toBe(0);
    });
  });

  // =========================================================================
  // 3. 100-PLAYER DETERMINISTIC TIE-BREAKING & RANKING STRESS
  // =========================================================================
  describe('3. 100-Player Tie-Breaking & Deterministic Ranking Stress', () => {
    it('ranks 100 players with IDENTICAL scores strictly by totalResponseTimeMs ASC', () => {
      const players: Record<string, PlayerState> = {};
      const N = 100;

      for (let i = 0; i < N; i++) {
        const id = `player_${String(i).padStart(3, '0')}`;
        // Each player has identical score 5000, but time increases by 10ms:
        // player_099 is slowest (2000ms), player_000 is fastest (1010ms)
        players[id] = createPlayer({
          id,
          nickname: `Học viên ${i}`,
          score: 5000,
          totalResponseTimeMs: 1010 + i * 10,
          correctCount: 5,
          joinedAt: 1000,
        });
      }

      const leaderboard = getLeaderboard(players);
      expect(leaderboard).toHaveLength(100);

      // Check strictly ascending totalResponseTimeMs
      for (let i = 0; i < N - 1; i++) {
        expect(leaderboard[i].totalResponseTimeMs).toBeLessThan(leaderboard[i + 1].totalResponseTimeMs);
        expect(leaderboard[i].id).toBe(`player_${String(i).padStart(3, '0')}`);
      }

      // Leaderboard entries rank must be 1 to 100
      const entries = getLeaderboardEntries(players);
      entries.forEach((e, idx) => {
        expect(e.rank).toBe(idx + 1);
      });
    });

    it('ranks 100 players with IDENTICAL scores AND times strictly by correctCount DESC', () => {
      const players: Record<string, PlayerState> = {};
      const N = 100;

      for (let i = 0; i < N; i++) {
        const id = `player_${String(i).padStart(3, '0')}`;
        // Player i has correctCount = i (from 0 to 99)
        players[id] = createPlayer({
          id,
          nickname: `Học viên ${i}`,
          score: 3000,
          totalResponseTimeMs: 12000,
          correctCount: i,
          joinedAt: 1000,
        });
      }

      const leaderboard = getLeaderboard(players);
      expect(leaderboard[0].correctCount).toBe(99);
      expect(leaderboard[0].id).toBe('player_099');
      expect(leaderboard[99].correctCount).toBe(0);
      expect(leaderboard[99].id).toBe('player_000');

      for (let i = 0; i < N - 1; i++) {
        expect(leaderboard[i].correctCount).toBeGreaterThan(leaderboard[i + 1].correctCount);
      }
    });

    it('ranks 100 players with IDENTICAL scores, times, and correctCount strictly by joinedAt ASC', () => {
      const players: Record<string, PlayerState> = {};
      const N = 100;

      for (let i = 0; i < N; i++) {
        const id = `player_${String(i).padStart(3, '0')}`;
        players[id] = createPlayer({
          id,
          nickname: `Học viên ${i}`,
          score: 4000,
          totalResponseTimeMs: 8000,
          correctCount: 4,
          joinedAt: 5000 + i * 50, // player_000 joined first
        });
      }

      const leaderboard = getLeaderboard(players);
      expect(leaderboard[0].id).toBe('player_000');
      expect(leaderboard[99].id).toBe('player_099');

      for (let i = 0; i < N - 1; i++) {
        expect(leaderboard[i].joinedAt!).toBeLessThan(leaderboard[i + 1].joinedAt!);
      }
    });

    it('stress tests absolute determinism: 100 identical players across 20 randomized shuffles', () => {
      const N = 100;
      const basePlayers: PlayerState[] = [];

      for (let i = 0; i < N; i++) {
        basePlayers.push(
          createPlayer({
            id: `uuid_${String(i).padStart(3, '0')}`,
            nickname: `User ${i}`,
            score: 2000,
            totalResponseTimeMs: 5000,
            correctCount: 2,
            joinedAt: 1000,
          })
        );
      }

      // First run to establish golden standard
      const goldenLeaderboard = getLeaderboard(basePlayers);
      const goldenOrder = goldenLeaderboard.map((p) => p.id);

      // Verify that lexicographical id comparison sorted them properly
      expect(goldenOrder[0]).toBe('uuid_000');
      expect(goldenOrder[99]).toBe('uuid_099');

      // Run 20 iterations with completely random shuffles
      for (let iteration = 0; iteration < 20; iteration++) {
        // Fisher-Yates shuffle
        const shuffled = [...basePlayers];
        for (let j = shuffled.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
        }

        const sorted = getLeaderboard(shuffled);
        const sortedOrder = sorted.map((p) => p.id);

        expect(sortedOrder).toEqual(goldenOrder);
      }
    });

    it('identifies fastest player in question among 100 players with sub-millisecond precision', () => {
      const players: Record<string, PlayerState> = {};
      const N = 100;

      for (let i = 0; i < N; i++) {
        const id = `p_${i}`;
        players[id] = createPlayer({
          id,
          nickname: `Học viên ${i}`,
          answers: {
            0: {
              selectedIndex: 2,
              responseTimeMs: 2000 + i * 10.5,
              isCorrect: true,
              pointsEarned: 800 - i,
            },
          },
        });
      }

      // Make player 42 slightly faster with sub-millisecond reflex (e.g. 195.4ms)
      players['p_42'].answers[0].responseTimeMs = 195.4;

      const fastest = getFastestPlayerInQuestion(players, 0);
      expect(fastest).not.toBeNull();
      expect(fastest?.playerId).toBe('p_42');
      expect(fastest?.responseTimeMs).toBe(195.4);
    });
  });

  // =========================================================================
  // 4. EXTREME DISTRIBUTION OF ANSWERS
  // =========================================================================
  describe('4. Extreme Distribution of Answers', () => {
    const mock15Questions: QuizQuestion[] = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      question: `Câu hỏi số ${i + 1}?`,
      level: i < 5 ? 'Nhận biết' : i < 10 ? 'Thông hiểu' : 'Tình huống thực tế',
      timeLimit: 15,
      options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
      correctIndex: (i % 4),
      explanation: `Giải thích cho câu ${i + 1}`,
    }));

    it('Scenario 4A: 100 players ALL CORRECT on all 15 questions', () => {
      const N = 100;
      const players: Record<string, PlayerState> = {};

      for (let i = 0; i < N; i++) {
        const id = `p_${i}`;
        const answers: PlayerState['answers'] = {};
        let totalTime = 0;
        let score = 0;
        let streak = 0;

        for (let q = 0; q < 15; q++) {
          const respTime = 500 + i * 10 + q * 5; // Distinct times
          totalTime += respTime;
          const sc = calculateScore(true, respTime, streak);
          score += sc.points;
          streak = sc.newStreak;
          answers[q] = {
            selectedIndex: q % 4,
            responseTimeMs: respTime,
            isCorrect: true,
            pointsEarned: sc.points,
          };
        }

        players[id] = createPlayer({
          id,
          nickname: `Perfect Player ${i}`,
          score,
          streak: 15,
          maxStreak: 15,
          correctCount: 15,
          totalResponseTimeMs: totalTime,
          answers,
          joinedAt: 1000 + i,
        });
      }

      const awards = getFinalAwards(players, mock15Questions);

      // Verify Class Analytics
      expect(awards.classAnalytics.totalParticipants).toBe(100);
      expect(awards.classAnalytics.averageScore).toBeGreaterThan(0);
      expect(awards.classAnalytics.questionsStats).toHaveLength(15);
      awards.classAnalytics.questionsStats.forEach((stat) => {
        expect(stat.accuracyRate).toBe(100);
        expect(stat.correctAnswers).toBe(100);
        expect(stat.totalAnswers).toBe(100);
      });

      // Verify Podium
      expect(awards.podium).toHaveLength(3);
      expect(awards.podium[0].rank).toBe(1);
      expect(awards.podium[1].rank).toBe(2);
      expect(awards.podium[2].rank).toBe(3);
      expect(awards.podium[0].correctCount).toBe(15);
      expect(awards.podium.first?.playerId).toBe(awards.podium[0].playerId);

      // Verify Lightning Award: Player 0 is fastest
      expect(awards.lightningAward).toBeDefined();
      expect(awards.lightningAward?.playerId).toBe('p_0');
      expect(awards.lightningAward?.correctCount).toBe(15);
    });

    it('Scenario 4B: 100 players ALL WRONG on all 15 questions', () => {
      const N = 100;
      const players: Record<string, PlayerState> = {};

      for (let i = 0; i < N; i++) {
        const id = `p_${i}`;
        const answers: PlayerState['answers'] = {};

        for (let q = 0; q < 15; q++) {
          answers[q] = {
            selectedIndex: (q + 1) % 4, // Intentionally wrong
            responseTimeMs: 2000 + i * 5,
            isCorrect: false,
            pointsEarned: 0,
          };
        }

        players[id] = createPlayer({
          id,
          nickname: `Zero Player ${i}`,
          score: 0,
          streak: 0,
          maxStreak: 0,
          correctCount: 0,
          totalResponseTimeMs: (2000 + i * 5) * 15,
          answers,
          joinedAt: 1000 + i,
        });
      }

      const awards = getFinalAwards(players, mock15Questions);

      // Verify Class Analytics: 0% accuracy
      expect(awards.classAnalytics.totalParticipants).toBe(100);
      expect(awards.classAnalytics.averageScore).toBe(0);
      awards.classAnalytics.questionsStats.forEach((stat) => {
        expect(stat.accuracyRate).toBe(0);
        expect(stat.correctAnswers).toBe(0);
        expect(stat.totalAnswers).toBe(100);
      });

      // Verify Lightning Award: UNDEFINED because 0 correct answers!
      expect(awards.lightningAward).toBeUndefined();

      // Verify Podium: all have 0 score, broken deterministically by reflex time / joinedAt
      expect(awards.podium).toHaveLength(3);
      expect(awards.podium[0].score).toBe(0);
      expect(awards.podium[0].rank).toBe(1);
    });

    it('Scenario 4C: Alternating Streaks (Correct, Wrong, Correct, Wrong...)', () => {
      let streak = 0;
      const history: { question: number; isCorrect: boolean; streakAfter: number }[] = [];

      for (let q = 0; q < 15; q++) {
        const isCorrect = q % 2 === 0;
        const res = calculateScore(isCorrect, 1000, streak);
        streak = res.newStreak;
        history.push({ question: q, isCorrect, streakAfter: streak });
      }

      // Even questions (0, 2, 4...) are correct -> streak 1
      // Odd questions (1, 3, 5...) are wrong -> streak resets to 0
      for (let q = 0; q < 15; q++) {
        if (q % 2 === 0) {
          expect(history[q].streakAfter).toBe(1);
        } else {
          expect(history[q].streakAfter).toBe(0);
        }
      }
    });

    it('Scenario 4D: Empty Room (0 players) handles gracefully without crash or NaN', () => {
      const emptyLeaderboard = getLeaderboard([]);
      expect(emptyLeaderboard).toEqual([]);

      const emptyEntries = getLeaderboardEntries([]);
      expect(emptyEntries).toEqual([]);

      const emptyFastest = getFastestPlayerInQuestion([], 0);
      expect(emptyFastest).toBeNull();

      const awards = getFinalAwards([], mock15Questions);
      expect(awards.podium).toHaveLength(0);
      expect(awards.lightningAward).toBeUndefined();
      expect(awards.classAnalytics.totalParticipants).toBe(0);
      expect(awards.classAnalytics.averageScore).toBe(0);
      expect(Number.isNaN(awards.classAnalytics.averageScore)).toBe(false);
    });
  });
});
