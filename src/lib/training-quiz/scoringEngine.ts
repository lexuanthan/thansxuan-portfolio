/**
 * Scoring & Analytics Engine for Live Interactive Training Quiz Game
 * (Công tác xây dựng kế hoạch và tổ chức hoạt động Đoàn - Hội HCM-UTE)
 *
 * Implements:
 * 1. Millisecond-precision speed score: 1000 * (T_remain / 15000)
 * 2. Consecutive correct streak bonus tiers
 * 3. Deterministic leaderboard & multi-tier tie-breaking
 * 4. Fastest player per question detection
 * 5. Final awards (Top 3 Podium, Lightning Award, Class Analytics)
 */

import {
  QuizQuestion,
  PlayerState,
  ScoringResult,
  StreakBonusTier,
  LeaderboardEntry,
  FastestPlayerInfo,
  PodiumAward,
  LightningAward,
  QuestionAccuracyStat,
  ClassAnalytics,
  FinalAwardsSummary,
} from './types';

export const QUESTION_TIME_LIMIT_MS = 15000;
export const BASE_MAX_POINTS = 1000;

export const STREAK_BONUS_TIERS: StreakBonusTier[] = [
  { streak: 1, bonus: 0, badge: 'Streak x1' },
  { streak: 2, bonus: 100, badge: '🔥 Streak x2' },
  { streak: 3, bonus: 200, badge: '🔥 Streak x3' },
  { streak: 4, bonus: 300, badge: '⚡ Super Streak x4' },
  { streak: 5, bonus: 500, badge: '🌟 Unstoppable x5+' },
];

/**
 * Returns the bonus points for a given streak count.
 * streak 1 = +0
 * streak 2 = +100
 * streak 3 = +200
 * streak 4 = +300
 * streak 5+ = +500
 */
export function getStreakBonus(streak: number): number {
  if (streak <= 1) return 0;
  if (streak === 2) return 100;
  if (streak === 3) return 200;
  if (streak === 4) return 300;
  return 500;
}

/**
 * Returns the tier metadata for display (badge, bonus).
 */
export function getStreakTier(streak: number): StreakBonusTier {
  if (streak <= 1) return { streak: Math.max(0, streak), bonus: 0, badge: 'Streak x1' };
  if (streak === 2) return { streak: 2, bonus: 100, badge: '🔥 Streak x2' };
  if (streak === 3) return { streak: 3, bonus: 200, badge: '🔥 Streak x3' };
  if (streak === 4) return { streak: 4, bonus: 300, badge: '⚡ Super Streak x4' };
  return { streak, bonus: 500, badge: '🌟 Unstoppable x5+' };
}

/**
 * Calculates score for an answer based on accuracy, response time, and current streak.
 *
 * Rules:
 * - If incorrect or timeout (responseTimeMs >= 15000 or remainingTime <= 0):
 *   points = 0, newStreak = 0.
 * - If correct and responseTimeMs < 15000:
 *   remainingTimeMs = 15000 - clamp(responseTimeMs, 0, 15000)
 *   speedPoints = Math.round(1000 * (remainingTimeMs / 15000))
 *   newStreak = currentStreak + 1
 *   points = speedPoints + getStreakBonus(newStreak)
 */
export function calculateScore(
  isCorrect: boolean,
  responseTimeMs: number,
  currentStreak = 0
): ScoringResult {
  const clampedTime = Math.max(0, responseTimeMs);

  // If wrong answer or timeout
  if (!isCorrect || clampedTime >= QUESTION_TIME_LIMIT_MS) {
    return {
      isCorrect: false,
      baseScore: 0,
      speedBonus: 0,
      streakBonus: 0,
      points: 0,
      newStreak: 0,
      responseTimeMs: clampedTime,
    };
  }

  const remainingTimeMs = Math.max(0, QUESTION_TIME_LIMIT_MS - clampedTime);
  const speedBonus = Math.round(BASE_MAX_POINTS * (remainingTimeMs / QUESTION_TIME_LIMIT_MS));
  const newStreak = currentStreak + 1;
  const streakBonus = getStreakBonus(newStreak);
  const totalPoints = speedBonus + streakBonus;

  return {
    isCorrect: true,
    baseScore: speedBonus,
    speedBonus,
    streakBonus,
    points: totalPoints,
    newStreak,
    responseTimeMs: clampedTime,
  };
}

/**
 * Helper to convert dictionary or array of players to array.
 */
function toPlayerArray(players: Record<string, PlayerState> | PlayerState[]): PlayerState[] {
  if (Array.isArray(players)) return [...players];
  return Object.values(players);
}

/**
 * Generates a sorted leaderboard using deterministic multi-tier tie-breaking rules:
 * 1. Score DESC (higher score ranks higher)
 * 2. totalResponseTimeMs ASC (faster total response time ranks higher)
 * 3. correctCount DESC (more correct answers ranks higher)
 * 4. joinedAt ASC (earlier join time ranks higher)
 * 5. id ASC (lexicographical fallback for absolute determinism)
 */
export function getLeaderboard(
  players: Record<string, PlayerState> | PlayerState[]
): PlayerState[] {
  const list = toPlayerArray(players);

  return list.sort((a, b) => {
    // 1. Score DESC
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // 2. Total response time ASC
    if (a.totalResponseTimeMs !== b.totalResponseTimeMs) {
      return a.totalResponseTimeMs - b.totalResponseTimeMs;
    }
    // 3. Correct count DESC
    if (b.correctCount !== a.correctCount) {
      return b.correctCount - a.correctCount;
    }
    // 4. Joined at ASC
    const joinA = a.joinedAt ?? 0;
    const joinB = b.joinedAt ?? 0;
    if (joinA !== joinB) {
      return joinA - joinB;
    }
    // 5. Deterministic ID fallback
    return a.id.localeCompare(b.id);
  });
}

/**
 * Returns formatted leaderboard entries with assigned ranks (1-indexed).
 */
export function getLeaderboardEntries(
  players: Record<string, PlayerState> | PlayerState[]
): LeaderboardEntry[] {
  const sorted = getLeaderboard(players);
  return sorted.map((p, index) => ({
    rank: index + 1,
    playerId: p.id,
    nickname: p.nickname,
    unit: p.unit,
    score: p.score,
    streak: p.streak,
    correctCount: p.correctCount,
    totalResponseTimeMs: p.totalResponseTimeMs,
  }));
}

/**
 * Finds the fastest player who answered correctly in a specific question.
 * Returns null if no player answered correctly.
 */
export function getFastestPlayerInQuestion(
  players: Record<string, PlayerState> | PlayerState[],
  questionIndex: number
): FastestPlayerInfo | null {
  const list = toPlayerArray(players);

  // Filter players with a correct answer on this question
  const candidates = list
    .map((player) => {
      const answer = player.answers[questionIndex];
      return { player, answer };
    })
    .filter(
      (item): item is { player: PlayerState; answer: NonNullable<typeof item.answer> } =>
        Boolean(item.answer && item.answer.isCorrect)
    );

  if (candidates.length === 0) {
    return null;
  }

  // Sort candidates by responseTimeMs ASC, then score DESC, then joinedAt ASC
  candidates.sort((a, b) => {
    if (a.answer.responseTimeMs !== b.answer.responseTimeMs) {
      return a.answer.responseTimeMs - b.answer.responseTimeMs;
    }
    if (b.player.score !== a.player.score) {
      return b.player.score - a.player.score;
    }
    const joinA = a.player.joinedAt ?? 0;
    const joinB = b.player.joinedAt ?? 0;
    if (joinA !== joinB) {
      return joinA - joinB;
    }
    return a.player.id.localeCompare(b.player.id);
  });

  const winner = candidates[0];
  return {
    playerId: winner.player.id,
    nickname: winner.player.nickname,
    unit: winner.player.unit,
    responseTimeMs: winner.answer.responseTimeMs,
    pointsEarned: winner.answer.pointsEarned,
  };
}

/**
 * Extended podium type supporting both array iteration and .first, .second, .third properties.
 */
export type ExtendedPodium = PodiumAward[] & {
  first?: PodiumAward;
  second?: PodiumAward;
  third?: PodiumAward;
};

/**
 * Extended final awards summary supporting both types.ts structure and classStats alias.
 */
export type ExtendedFinalAwardsSummary = FinalAwardsSummary & {
  classStats: {
    totalPlayers: number;
    averageScore: number;
    accuracyPerQuestion: {
      questionIndex: number;
      correctCount: number;
      totalAnswers: number;
      accuracyPercentage: number;
    }[];
    hardestQuestion?: { questionIndex: number; accuracyPercentage: number };
    easiestQuestion?: { questionIndex: number; accuracyPercentage: number };
  };
};

/**
 * Calculates final awards and statistics:
 * 1. Top 3 Podium (Rank 1, 2, 3)
 * 2. Lightning Award ("Tia chớp Đoàn - Hội") — fastest average response time among correct answers
 * 3. Class Analytics (average score, accuracy per question, hardest & easiest questions)
 * 4. Full Leaderboard
 */
export function getFinalAwards(
  players: Record<string, PlayerState> | PlayerState[],
  questions: QuizQuestion[] = []
): ExtendedFinalAwardsSummary {
  const fullLeaderboard = getLeaderboardEntries(players);
  const playerList = toPlayerArray(players);

  // 1. Podium (Top 3)
  const podiumList: PodiumAward[] = fullLeaderboard.slice(0, 3).map((entry) => ({
    rank: entry.rank as 1 | 2 | 3,
    playerId: entry.playerId,
    nickname: entry.nickname,
    unit: entry.unit,
    score: entry.score,
    correctCount: entry.correctCount,
    totalResponseTimeMs: entry.totalResponseTimeMs,
  }));

  const podium = Object.assign(podiumList, {
    first: podiumList[0],
    second: podiumList[1],
    third: podiumList[2],
  }) as ExtendedPodium;

  // 2. Lightning Award ("Tia chớp Đoàn - Hội")
  // Awarded to player with fastest average response time among their correct answers
  // Must have at least 1 correct answer
  const correctEligible = playerList.filter((p) => p.correctCount > 0);

  let lightningAward: LightningAward | undefined;

  if (correctEligible.length > 0) {
    const withAvg = correctEligible.map((player) => {
      const correctAnswers = Object.values(player.answers).filter((a) => a && a.isCorrect);
      const totalCorrectTime = correctAnswers.reduce((sum, a) => sum + a.responseTimeMs, 0);
      const avg = correctAnswers.length > 0 ? totalCorrectTime / correctAnswers.length : Infinity;
      return {
        player,
        avgResponseTimeMs: Math.round(avg * 10) / 10,
        correctCount: correctAnswers.length,
      };
    });

    withAvg.sort((a, b) => {
      if (a.avgResponseTimeMs !== b.avgResponseTimeMs) {
        return a.avgResponseTimeMs - b.avgResponseTimeMs;
      }
      if (b.correctCount !== a.correctCount) {
        return b.correctCount - a.correctCount;
      }
      if (b.player.score !== a.player.score) {
        return b.player.score - a.player.score;
      }
      return a.player.id.localeCompare(b.player.id);
    });

    const winner = withAvg[0];
    lightningAward = {
      playerId: winner.player.id,
      nickname: winner.player.nickname,
      unit: winner.player.unit,
      averageResponseTimeMs: winner.avgResponseTimeMs,
      correctCount: winner.correctCount,
    };
  }

  // 3. Class Analytics
  const totalParticipants = playerList.length;
  const totalScore = playerList.reduce((sum, p) => sum + p.score, 0);
  const averageScore = totalParticipants > 0 ? Math.round(totalScore / totalParticipants) : 0;

  // Determine question count (from questions array or detected from answers)
  const questionCount = Math.max(
    questions.length,
    ...playerList.flatMap((p) => Object.keys(p.answers).map((k) => Number(k) + 1)),
    15
  );

  const questionsStats: QuestionAccuracyStat[] = [];
  const accuracyPerQuestionList: {
    questionIndex: number;
    correctCount: number;
    totalAnswers: number;
    accuracyPercentage: number;
  }[] = [];

  for (let qIndex = 0; qIndex < questionCount; qIndex++) {
    const questionMeta = questions[qIndex];
    let totalAnswers = 0;
    let correctAnswers = 0;

    for (const p of playerList) {
      const ans = p.answers[qIndex];
      if (ans !== undefined) {
        totalAnswers++;
        if (ans.isCorrect) {
          correctAnswers++;
        }
      }
    }

    const accuracyRate =
      totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

    questionsStats.push({
      questionIndex: qIndex,
      questionId: questionMeta?.id ?? qIndex + 1,
      questionText: questionMeta?.question ?? `Câu hỏi ${qIndex + 1}`,
      level: questionMeta?.level ?? 'Nhận biết',
      totalAnswers,
      correctAnswers,
      accuracyRate,
    });

    accuracyPerQuestionList.push({
      questionIndex: qIndex,
      correctCount: correctAnswers,
      totalAnswers,
      accuracyPercentage: accuracyRate,
    });
  }

  // Find hardest and easiest questions among questions with at least 1 answer (or overall)
  const activeQuestionStats = questionsStats.filter((q) => q.totalAnswers > 0);
  const candidatesForDifficulty =
    activeQuestionStats.length > 0 ? activeQuestionStats : questionsStats;

  let hardestQuestion: QuestionAccuracyStat | undefined;
  let easiestQuestion: QuestionAccuracyStat | undefined;

  if (candidatesForDifficulty.length > 0) {
    const sortedByDifficulty = [...candidatesForDifficulty].sort((a, b) => {
      if (a.accuracyRate !== b.accuracyRate) {
        return a.accuracyRate - b.accuracyRate;
      }
      return a.correctAnswers - b.correctAnswers;
    });

    hardestQuestion = sortedByDifficulty[0];
    easiestQuestion = sortedByDifficulty[sortedByDifficulty.length - 1];
  }

  const classAnalytics: ClassAnalytics = {
    totalParticipants,
    averageScore,
    questionsStats,
    hardestQuestion,
    easiestQuestion,
  };

  const classStats = {
    totalPlayers: totalParticipants,
    averageScore,
    accuracyPerQuestion: accuracyPerQuestionList,
    hardestQuestion: hardestQuestion
      ? {
          questionIndex: hardestQuestion.questionIndex,
          accuracyPercentage: hardestQuestion.accuracyRate,
        }
      : undefined,
    easiestQuestion: easiestQuestion
      ? {
          questionIndex: easiestQuestion.questionIndex,
          accuracyPercentage: easiestQuestion.accuracyRate,
        }
      : undefined,
  };

  return {
    podium,
    lightningAward,
    classAnalytics,
    classStats,
    fullLeaderboard,
  };
}
