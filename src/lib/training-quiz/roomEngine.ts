/**
 * Headless Quiz Room State Machine & Realtime Game Engine
 * (Công tác xây dựng kế hoạch và tổ chức hoạt động Đoàn - Hội HCM-UTE)
 *
 * Implements:
 * 1. Full 6-state machine: LOBBY -> QUESTION_START -> QUESTION_ACTIVE -> QUESTION_REVEAL -> LEADERBOARD -> FINAL_RESULTS
 * 2. 15-second countdown timer for QUESTION_ACTIVE (with 3-second QUESTION_START preview)
 * 3. Instant Fast Short-Circuit: Immediately advances to QUESTION_REVEAL when all connected players submit answers
 * 4. State Sanitization: Hides correctIndex and answer leakages from players in active states
 * 5. Event subscription model for SSE / WebSockets / Polling
 */

import {
  QuizQuestion,
  PlayerState,
  PlayerAnswer,
  RoomStatus,
  RoomState,
  QuestionAnswerStats,
  FastestPlayerInfo,
  ScoringResult,
  HostActionPayload,
  SubmitAnswerPayload,
  QuizRoomEvent,
  QuizRoomEventType,
  FinalAwardsSummary,
} from './types';
import { TRAINING_QUIZ_QUESTIONS } from './questionsData';
import {
  calculateScore,
  getFastestPlayerInQuestion,
  getFinalAwards,
  getLeaderboard,
  QUESTION_TIME_LIMIT_MS,
} from './scoringEngine';

export const DEFAULT_PREVIEW_DURATION_MS = 3000;
export const DEFAULT_QUESTION_TIME_LIMIT_MS = QUESTION_TIME_LIMIT_MS; // 15000 ms

export interface QuizRoomOptions {
  roomCode: string;
  hostToken?: string;
  questions?: QuizQuestion[];
  previewDurationMs?: number;
  questionTimeLimitMs?: number;
}

export type RoomEventListener = (state: RoomState, event?: QuizRoomEvent) => void;

export class QuizRoom {
  public readonly roomCode: string;
  public readonly hostToken: string;
  public status: RoomStatus = 'LOBBY';
  public currentQuestionIndex = 0;
  public questionStartTime?: number;
  public questionDeadline?: number;
  public players: Record<string, PlayerState> = {};
  public fastestPlayerInCurrentQuestion?: FastestPlayerInfo;
  public statsPerQuestion: Record<number, QuestionAnswerStats> = {};

  public readonly questions: QuizQuestion[];
  public readonly previewDurationMs: number;
  public readonly questionTimeLimitMs: number;

  public createdAt: number;
  public lastActivityAt: number;

  private activeTimer: NodeJS.Timeout | null = null;
  private listeners: Set<RoomEventListener> = new Set();

  constructor(options: QuizRoomOptions) {
    this.roomCode = options.roomCode;
    this.hostToken = options.hostToken || this.generateToken();
    this.questions =
      options.questions && options.questions.length > 0
        ? options.questions
        : TRAINING_QUIZ_QUESTIONS;
    this.previewDurationMs = options.previewDurationMs ?? DEFAULT_PREVIEW_DURATION_MS;
    this.questionTimeLimitMs = options.questionTimeLimitMs ?? DEFAULT_QUESTION_TIME_LIMIT_MS;
    this.createdAt = Date.now();
    this.lastActivityAt = Date.now();
  }

  private generateToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  private touch(): void {
    this.lastActivityAt = Date.now();
  }

  // ==========================================
  // SUBSCRIPTION & EVENT BROADCASTING
  // ==========================================

  public subscribe(listener: RoomEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(type: QuizRoomEventType, data?: unknown): void {
    this.touch();
    const event: QuizRoomEvent = {
      type,
      timestamp: Date.now(),
      data: data ?? this.getState(),
    };
    const currentState = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(currentState, event);
      } catch (err) {
        console.error('QuizRoom listener error:', err);
      }
    }
  }

  private clearTimer(): void {
    if (this.activeTimer) {
      clearTimeout(this.activeTimer);
      this.activeTimer = null;
    }
  }

  // ==========================================
  // PLAYER MANAGEMENT
  // ==========================================

  public joinPlayer(nickname: string, unit?: string, customId?: string): PlayerState {
    this.touch();
    const id = customId || `p_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const trimmedNick = nickname.trim() || 'Người chơi';

    const player: PlayerState = {
      id,
      nickname: trimmedNick,
      unit: unit?.trim() || undefined,
      score: 0,
      streak: 0,
      maxStreak: 0,
      correctCount: 0,
      totalResponseTimeMs: 0,
      answers: {},
      connected: true,
      joinedAt: Date.now(),
    };

    this.players[id] = player;
    this.emit('PLAYER_JOINED', player);
    return player;
  }

  public removePlayer(playerId: string): boolean {
    this.touch();
    if (this.players[playerId]) {
      delete this.players[playerId];
      this.emit('ROOM_STATE');
      return true;
    }
    return false;
  }

  public setPlayerConnected(playerId: string, connected: boolean): void {
    this.touch();
    if (this.players[playerId]) {
      this.players[playerId].connected = connected;
      this.emit('ROOM_STATE');
    }
  }

  public getConnectedPlayers(): PlayerState[] {
    return Object.values(this.players).filter((p) => p.connected);
  }

  // ==========================================
  // STATE MACHINE & TRANSITIONS
  // ==========================================

  /**
   * Starts the game from LOBBY. Transitions to QUESTION_START (question 0).
   */
  public startGame(hostToken: string): boolean {
    if (hostToken !== this.hostToken) return false;
    if (this.status !== 'LOBBY') return false;

    this.currentQuestionIndex = 0;
    this.transitionToQuestionStart();
    return true;
  }

  /**
   * Transition to QUESTION_START: 3-second preview period before countdown.
   */
  public transitionToQuestionStart(): void {
    this.clearTimer();
    this.status = 'QUESTION_START';
    this.fastestPlayerInCurrentQuestion = undefined;
    this.questionStartTime = undefined;
    this.questionDeadline = undefined;

    // Initialize option statistics for current question
    if (!this.statsPerQuestion[this.currentQuestionIndex]) {
      this.statsPerQuestion[this.currentQuestionIndex] = { A: 0, B: 0, C: 0, D: 0 };
    }

    this.emit('QUESTION_START', {
      questionIndex: this.currentQuestionIndex,
      previewDurationMs: this.previewDurationMs,
    });

    // Auto-advance to QUESTION_ACTIVE after preview duration
    this.activeTimer = setTimeout(() => {
      this.transitionToQuestionActive();
    }, this.previewDurationMs);
  }

  /**
   * Transition to QUESTION_ACTIVE: 15-second countdown timer starts now.
   */
  public transitionToQuestionActive(): void {
    this.clearTimer();
    this.status = 'QUESTION_ACTIVE';
    this.questionStartTime = Date.now();
    this.questionDeadline = this.questionStartTime + this.questionTimeLimitMs;

    this.emit('QUESTION_ACTIVE', {
      questionIndex: this.currentQuestionIndex,
      questionStartTime: this.questionStartTime,
      questionDeadline: this.questionDeadline,
      timeLimitMs: this.questionTimeLimitMs,
    });

    // Set 15-second countdown timer for timeout
    this.activeTimer = setTimeout(() => {
      this.handleQuestionTimeout();
    }, this.questionTimeLimitMs);
  }

  /**
   * Handles timeout when 15 seconds expire without all players answering.
   */
  public handleQuestionTimeout(): void {
    if (this.status !== 'QUESTION_ACTIVE') return;

    this.clearTimer();

    // Reset streak for all connected players who did not answer
    for (const player of Object.values(this.players)) {
      if (player.connected && player.answers[this.currentQuestionIndex] === undefined) {
        player.streak = 0;
      }
    }

    this.transitionToQuestionReveal(false);
  }

  /**
   * Transition to QUESTION_REVEAL: Discloses correct option, explanations, fastest player.
   */
  public transitionToQuestionReveal(shortCircuited = false): void {
    this.clearTimer();
    this.status = 'QUESTION_REVEAL';

    // Calculate fastest player in current question
    this.fastestPlayerInCurrentQuestion =
      getFastestPlayerInQuestion(this.players, this.currentQuestionIndex) ?? undefined;

    const eventType: QuizRoomEventType = shortCircuited
      ? 'FAST_FORWARD_REVEAL'
      : 'QUESTION_REVEAL';

    this.emit(eventType, {
      questionIndex: this.currentQuestionIndex,
      correctIndex: this.getCurrentQuestion()?.correctIndex,
      fastestPlayer: this.fastestPlayerInCurrentQuestion,
      stats: this.statsPerQuestion[this.currentQuestionIndex],
      shortCircuited,
    });
  }

  /**
   * Transition to LEADERBOARD: Displays current standings.
   */
  public transitionToLeaderboard(hostToken: string): boolean {
    if (hostToken !== this.hostToken) return false;
    if (this.status !== 'QUESTION_REVEAL') return false;

    this.clearTimer();
    this.status = 'LEADERBOARD';
    this.emit('LEADERBOARD', {
      questionIndex: this.currentQuestionIndex,
      leaderboard: getLeaderboard(this.players),
    });
    return true;
  }

  /**
   * Advances to next question or final results.
   */
  public advanceNextQuestion(hostToken: string): boolean {
    if (hostToken !== this.hostToken) return false;
    if (this.status !== 'LEADERBOARD' && this.status !== 'QUESTION_REVEAL') return false;

    if (this.currentQuestionIndex + 1 < this.questions.length) {
      this.currentQuestionIndex++;
      this.transitionToQuestionStart();
      return true;
    } else {
      return this.endGame(hostToken);
    }
  }

  /**
   * Ends the game and displays final awards podium and stats.
   */
  public endGame(hostToken: string): boolean {
    if (hostToken !== this.hostToken) return false;

    this.clearTimer();
    this.status = 'FINAL_RESULTS';
    const finalAwards = getFinalAwards(this.players, this.questions);

    this.emit('FINAL_RESULTS', {
      finalAwards,
    });
    return true;
  }

  /**
   * Unified Host Action Handler.
   */
  public handleHostAction(payload: HostActionPayload): boolean {
    if (payload.hostToken !== this.hostToken) return false;

    switch (payload.action) {
      case 'START':
        return this.startGame(payload.hostToken);
      case 'SHOW_LEADERBOARD':
        return this.transitionToLeaderboard(payload.hostToken);
      case 'NEXT_QUESTION':
        return this.advanceNextQuestion(payload.hostToken);
      case 'END_GAME':
        return this.endGame(payload.hostToken);
      default:
        return false;
    }
  }

  // ==========================================
  // ANSWER SUBMISSION & FAST SHORT-CIRCUIT
  // ==========================================

  /**
   * Submits player answer.
   * If all connected players have answered, triggers instant Fast Short-Circuit!
   */
  public submitAnswer(payload: SubmitAnswerPayload): ScoringResult | null {
    this.touch();

    // 1. Validate status
    if (this.status !== 'QUESTION_ACTIVE') {
      return null;
    }

    // 2. Validate question index
    if (payload.questionIndex !== this.currentQuestionIndex) {
      return null;
    }

    // 3. Validate player existence
    const player = this.players[payload.playerId];
    if (!player) {
      return null;
    }

    // 4. Reject duplicate submissions (first submission is locked)
    if (player.answers[this.currentQuestionIndex] !== undefined) {
      return null;
    }

    // 5. Calculate response time
    const now = Date.now();
    const startTime = this.questionStartTime ?? now;
    const rawResponseTime = now - startTime;
    const responseTimeMs = Math.max(0, rawResponseTime);

    // 6. Check if past deadline
    const isTimeout =
      this.questionDeadline !== undefined && now > this.questionDeadline;

    // 7. Check correctness
    const currentQuestion = this.getCurrentQuestion();
    const isCorrect =
      !isTimeout &&
      payload.selectedIndex >= 0 &&
      payload.selectedIndex <= 3 &&
      payload.selectedIndex === currentQuestion?.correctIndex;

    // 8. Calculate score
    const result = calculateScore(isCorrect, responseTimeMs, player.streak);

    // 9. Update player state
    player.score += result.points;
    player.streak = result.newStreak;
    player.maxStreak = Math.max(player.maxStreak, result.newStreak);
    if (isCorrect) {
      player.correctCount++;
    }
    player.totalResponseTimeMs += responseTimeMs;

    const answerRecord: PlayerAnswer = {
      selectedIndex: payload.selectedIndex,
      responseTimeMs,
      isCorrect,
      pointsEarned: result.points,
    };
    player.answers[this.currentQuestionIndex] = answerRecord;

    // 10. Update distribution statistics (A, B, C, D)
    const stats = this.statsPerQuestion[this.currentQuestionIndex] || {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
    };
    const optionKey = ['A', 'B', 'C', 'D'][payload.selectedIndex] as
      | 'A'
      | 'B'
      | 'C'
      | 'D'
      | undefined;
    if (optionKey) {
      stats[optionKey] = (stats[optionKey] || 0) + 1;
    }
    this.statsPerQuestion[this.currentQuestionIndex] = stats;

    // 11. Emit player answered event
    this.emit('PLAYER_ANSWERED', {
      playerId: player.id,
      questionIndex: this.currentQuestionIndex,
      pointsEarned: result.points,
    });

    // 12. INSTANT FAST SHORT-CIRCUIT CHECK
    // If all connected players have answered before the 15-second deadline,
    // immediately advance to QUESTION_REVEAL!
    this.checkFastShortCircuit();

    return result;
  }

  /**
   * Checks whether all currently connected players have submitted an answer.
   * If so, clears the active timer and advances immediately to QUESTION_REVEAL.
   */
  public checkFastShortCircuit(): boolean {
    if (this.status !== 'QUESTION_ACTIVE') return false;

    const connectedPlayers = this.getConnectedPlayers();
    if (connectedPlayers.length === 0) return false;

    const answeredConnected = connectedPlayers.filter(
      (p) => p.answers[this.currentQuestionIndex] !== undefined
    );

    if (answeredConnected.length >= connectedPlayers.length) {
      // All connected players have answered! Trigger fast short-circuit!
      this.clearTimer();
      this.transitionToQuestionReveal(true);
      return true;
    }

    return false;
  }

  // ==========================================
  // STATE SANITIZATION & INSPECTION
  // ==========================================

  public getCurrentQuestion(): QuizQuestion {
    return this.questions[this.currentQuestionIndex];
  }

  /**
   * Returns standard internal state.
   */
  public getState(): RoomState {
    return {
      roomCode: this.roomCode,
      hostToken: this.hostToken,
      status: this.status,
      currentQuestionIndex: this.currentQuestionIndex,
      questionStartTime: this.questionStartTime,
      questionDeadline: this.questionDeadline,
      players: this.players,
      fastestPlayerInCurrentQuestion: this.fastestPlayerInCurrentQuestion,
      statsPerQuestion: this.statsPerQuestion,
    };
  }

  /**
   * Sanitized state for client views (Player or Host view).
   *
   * Security & Anti-cheat rules:
   * 1. Hides hostToken from non-host viewers.
   * 2. In QUESTION_START and QUESTION_ACTIVE:
   *    - Masks correctIndex from questions (if embedded).
   *    - Hides fastestPlayerInCurrentQuestion.
   *    - For other players' answers on the current question:
   *      Hides whether it is correct, points earned, and selectedIndex
   *      to prevent answer sniffing via network inspect tools.
   */
  public getSanitizedState(options?: {
    forHost?: boolean;
    hostToken?: string;
    requestingPlayerId?: string;
  }): RoomState {
    const isHost =
      options?.forHost === true ||
      (options?.hostToken !== undefined && options.hostToken === this.hostToken);

    const base = this.getState();

    // If host view, return full state
    if (isHost) {
      return base;
    }

    // For public / player view:
    const sanitizedPlayers: Record<string, PlayerState> = {};
    const hideActiveAnswerDetails =
      this.status === 'QUESTION_ACTIVE' || this.status === 'QUESTION_START';

    for (const [id, player] of Object.entries(this.players)) {
      const isSelf = options?.requestingPlayerId === id;

      if (!hideActiveAnswerDetails) {
        // In REVEAL, LEADERBOARD, FINAL_RESULTS: show full answer info
        sanitizedPlayers[id] = { ...player };
      } else {
        // In ACTIVE or START:
        const sanitizedAnswers = { ...player.answers };
        const currentAnswer = sanitizedAnswers[this.currentQuestionIndex];

        if (currentAnswer) {
          if (isSelf) {
            // Player can see that they selected an answer, but not isCorrect or points
            sanitizedAnswers[this.currentQuestionIndex] = {
              selectedIndex: currentAnswer.selectedIndex,
              responseTimeMs: currentAnswer.responseTimeMs,
              isCorrect: false, // masked
              pointsEarned: 0, // masked
            };
          } else {
            // Other players: completely masked
            sanitizedAnswers[this.currentQuestionIndex] = {
              selectedIndex: -1, // masked
              responseTimeMs: currentAnswer.responseTimeMs,
              isCorrect: false, // masked
              pointsEarned: 0, // masked
            };
          }
        }

        sanitizedPlayers[id] = {
          ...player,
          answers: sanitizedAnswers,
        };
      }
    }

    return {
      roomCode: this.roomCode,
      hostToken: '', // stripped for non-host
      status: this.status,
      currentQuestionIndex: this.currentQuestionIndex,
      questionStartTime: this.questionStartTime,
      questionDeadline: this.questionDeadline,
      players: sanitizedPlayers,
      fastestPlayerInCurrentQuestion: hideActiveAnswerDetails
        ? undefined
        : this.fastestPlayerInCurrentQuestion,
      statsPerQuestion: hideActiveAnswerDetails ? undefined : this.statsPerQuestion,
    };
  }

  public getFinalAwards(): FinalAwardsSummary {
    return getFinalAwards(this.players, this.questions);
  }

  public dispose(): void {
    this.clearTimer();
    this.listeners.clear();
  }
}
