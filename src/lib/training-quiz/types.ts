/**
 * Types & Domain Interfaces for Live Interactive Training Quiz Game
 * (Công tác xây dựng kế hoạch và tổ chức hoạt động Đoàn - Hội HCM-UTE)
 */

export type CognitiveLevel = 'Nhận biết' | 'Thông hiểu' | 'Tình huống thực tế';

export interface QuizQuestion {
  id: number; // 1 to 15
  question: string;
  level: CognitiveLevel;
  timeLimit: number; // 15 seconds
  options: [string, string, string, string]; // exactly 4 options
  correctIndex: number; // 0, 1, 2, or 3
  explanation: string;
}

export interface PlayerAnswer {
  selectedIndex: number;
  responseTimeMs: number;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface PlayerState {
  id: string; // generated client UUID
  nickname: string;
  unit?: string; // Chi đoàn / Đơn vị
  score: number;
  streak: number;
  maxStreak: number;
  correctCount: number;
  totalResponseTimeMs: number;
  answers: Record<number, PlayerAnswer>;
  connected: boolean;
  joinedAt?: number;
}

export type RoomStatus =
  | 'LOBBY'
  | 'QUESTION_START'
  | 'QUESTION_ACTIVE'
  | 'QUESTION_REVEAL'
  | 'LEADERBOARD'
  | 'FINAL_RESULTS';

export interface FastestPlayerInfo {
  playerId: string;
  nickname: string;
  unit?: string;
  responseTimeMs: number;
  pointsEarned?: number;
}

export interface QuestionAnswerStats {
  A: number;
  B: number;
  C: number;
  D: number;
}

export interface RoomState {
  roomCode: string;
  hostToken: string;
  status: RoomStatus;
  currentQuestionIndex: number; // 0 to 14 (15 questions)
  questionStartTime?: number; // server timestamp ms
  questionDeadline?: number; // questionStartTime + 15000
  players: Record<string, PlayerState>;
  fastestPlayerInCurrentQuestion?: FastestPlayerInfo;
  statsPerQuestion?: Record<number, QuestionAnswerStats>;
}

export interface ScoringResult {
  isCorrect: boolean;
  baseScore: number;
  speedBonus: number;
  streakBonus: number;
  points: number;
  newStreak: number;
  responseTimeMs: number;
}

export interface StreakBonusTier {
  streak: number;
  bonus: number;
  badge: string;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  nickname: string;
  unit?: string;
  score: number;
  streak: number;
  correctCount: number;
  totalResponseTimeMs: number;
  previousRank?: number;
}

export interface PodiumAward {
  rank: 1 | 2 | 3;
  playerId: string;
  nickname: string;
  unit?: string;
  score: number;
  correctCount: number;
  totalResponseTimeMs: number;
}

export interface LightningAward {
  playerId: string;
  nickname: string;
  unit?: string;
  averageResponseTimeMs: number;
  correctCount: number;
}

export interface QuestionAccuracyStat {
  questionIndex: number;
  questionId: number;
  questionText: string;
  level: CognitiveLevel;
  totalAnswers: number;
  correctAnswers: number;
  accuracyRate: number; // 0 to 100 percentage
}

export interface ClassAnalytics {
  totalParticipants: number;
  averageScore: number;
  questionsStats: QuestionAccuracyStat[];
  hardestQuestion?: QuestionAccuracyStat;
  easiestQuestion?: QuestionAccuracyStat;
}

export interface FinalAwardsSummary {
  podium: PodiumAward[];
  lightningAward?: LightningAward;
  classAnalytics: ClassAnalytics;
  fullLeaderboard: LeaderboardEntry[];
}

export type HostActionType = 'START' | 'NEXT_QUESTION' | 'SHOW_LEADERBOARD' | 'END_GAME';

export interface HostActionPayload {
  hostToken: string;
  action: HostActionType;
}

export interface SubmitAnswerPayload {
  playerId: string;
  questionIndex: number;
  selectedIndex: number;
  clientTimeMs: number;
}

export interface JoinRoomPayload {
  nickname: string;
  unit?: string;
}

export interface JoinRoomResponse {
  playerId: string;
  roomState: RoomState;
}

export interface CreateRoomResponse {
  roomCode: string;
  hostToken: string;
}

export type QuizRoomEventType =
  | 'ROOM_STATE'
  | 'QUESTION_START'
  | 'QUESTION_ACTIVE'
  | 'QUESTION_REVEAL'
  | 'LEADERBOARD'
  | 'FINAL_RESULTS'
  | 'PLAYER_JOINED'
  | 'PLAYER_ANSWERED'
  | 'FAST_FORWARD_REVEAL';

export interface QuizRoomEvent {
  type: QuizRoomEventType;
  timestamp: number;
  data: unknown;
}
