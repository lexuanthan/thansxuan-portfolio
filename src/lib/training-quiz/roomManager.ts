/**
 * In-Memory Room Manager Singleton for Live Interactive Training Quiz Game
 * (Công tác xây dựng kế hoạch và tổ chức hoạt động Đoàn - Hội HCM-UTE)
 *
 * Manages active rooms via globalThis.__QUIZ_ROOMS__ to preserve state during
 * Next.js Fast Refresh (HMR).
 *
 * Implements:
 * 1. 6-character unique room code generator
 * 2. Room lifecycle (create, get, list, delete)
 * 3. Player join & host token authorization helpers
 * 4. Automatic TTL garbage collection for stale rooms (> 2 hours inactivity)
 */

import { QuizQuestion } from './types';
import { QuizRoom, QuizRoomOptions } from './roomEngine';
import {
  buildRoomQuestionsFromConfig,
  getActiveQuizConfig,
} from './configManager';

export const ROOM_MAX_INACTIVE_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

declare global {
  var __QUIZ_ROOMS__: Map<string, QuizRoom> | undefined;
}

export class QuizRoomManager {
  private static instance: QuizRoomManager | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;

  private constructor() {
    if (!globalThis.__QUIZ_ROOMS__) {
      globalThis.__QUIZ_ROOMS__ = new Map<string, QuizRoom>();
    }
    // Auto-cleanup check every 30 minutes in server environment
    this.startCleanupJob(30 * 60 * 1000);
  }

  public static getInstance(): QuizRoomManager {
    if (!QuizRoomManager.instance) {
      QuizRoomManager.instance = new QuizRoomManager();
    }
    return QuizRoomManager.instance;
  }

  private get store(): Map<string, QuizRoom> {
    if (!globalThis.__QUIZ_ROOMS__) {
      globalThis.__QUIZ_ROOMS__ = new Map<string, QuizRoom>();
    }
    return globalThis.__QUIZ_ROOMS__;
  }

  /**
   * Generates a 6-character alphanumeric uppercase code (e.g. "UTE202", "DOAN21").
   * Omits easily confused letters (O, 0, I, 1) for mobile readability.
   */
  public generateRoomCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    let attempts = 0;

    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      attempts++;
    } while (this.store.has(code) && attempts < 100);

    return code;
  }

  /**
   * Creates and registers a new room.
   */
  public createRoom(options?: {
    customCode?: string;
    hostToken?: string;
    questions?: QuizQuestion[];
    previewDurationMs?: number;
    questionTimeLimitMs?: number;
    fastShortCircuit?: boolean;
    baseMaxPoints?: number;
    allowPerQuestionTimeLimit?: boolean;
    programTitle?: string;
    programSubtitle?: string;
  }): { room: QuizRoom; roomCode: string; hostToken: string } {
    const roomCode = options?.customCode
      ? options.customCode.trim().toUpperCase()
      : this.generateRoomCode();

    // If room with this code already exists, dispose it first
    if (this.store.has(roomCode)) {
      this.store.get(roomCode)?.dispose();
    }

    const activeConfig = getActiveQuizConfig();
    const configuredQuestions =
      options?.questions && options.questions.length > 0
        ? options.questions
        : buildRoomQuestionsFromConfig(activeConfig);

    const roomOptions: QuizRoomOptions = {
      roomCode,
      hostToken: options?.hostToken,
      questions: configuredQuestions,
      previewDurationMs:
        options?.previewDurationMs ??
        activeConfig.gameplay.previewDurationSeconds * 1000,
      questionTimeLimitMs:
        options?.questionTimeLimitMs ??
        activeConfig.gameplay.questionTimeLimitSeconds * 1000,
      fastShortCircuit:
        options?.fastShortCircuit ?? activeConfig.gameplay.fastShortCircuit,
      baseMaxPoints:
        options?.baseMaxPoints ?? activeConfig.gameplay.baseMaxPoints,
      allowPerQuestionTimeLimit:
        options?.allowPerQuestionTimeLimit ??
        activeConfig.gameplay.allowPerQuestionTimeLimit,
      programTitle: options?.programTitle ?? activeConfig.general.title,
      programSubtitle:
        options?.programSubtitle ?? activeConfig.general.topicHighlight,
    };

    const room = new QuizRoom(roomOptions);
    this.store.set(roomCode, room);

    return {
      room,
      roomCode,
      hostToken: room.hostToken,
    };
  }

  /**
   * Retrieves an active room by code.
   */
  public getRoom(roomCode: string): QuizRoom | undefined {
    if (!roomCode) return undefined;
    return this.store.get(roomCode.trim().toUpperCase());
  }

  /**
   * Checks whether a room exists.
   */
  public hasRoom(roomCode: string): boolean {
    if (!roomCode) return false;
    return this.store.has(roomCode.trim().toUpperCase());
  }

  /**
   * Deletes and disposes a room.
   */
  public deleteRoom(roomCode: string): boolean {
    if (!roomCode) return false;
    const normalized = roomCode.trim().toUpperCase();
    const room = this.store.get(normalized);
    if (room) {
      room.dispose();
      this.store.delete(normalized);
      return true;
    }
    return false;
  }

  /**
   * Returns all active rooms.
   */
  public getAllRooms(): QuizRoom[] {
    return Array.from(this.store.values());
  }

  /**
   * Returns total count of active rooms.
   */
  public getActiveRoomCount(): number {
    return this.store.size;
  }

  /**
   * Validates whether provided hostToken is valid for the room.
   */
  public verifyHost(roomCode: string, hostToken: string): boolean {
    const room = this.getRoom(roomCode);
    if (!room) return false;
    return room.hostToken === hostToken;
  }

  /**
   * Cleans rooms inactive for longer than maxAgeMs (default: 2 hours).
   * Returns number of rooms purged.
   */
  public cleanStaleRooms(maxAgeMs: number = ROOM_MAX_INACTIVE_AGE_MS): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [code, room] of this.store.entries()) {
      if (now - room.lastActivityAt > maxAgeMs) {
        room.dispose();
        this.store.delete(code);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Starts periodic garbage collection.
   */
  public startCleanupJob(intervalMs: number): void {
    this.stopCleanupJob();
    this.cleanupTimer = setInterval(() => {
      this.cleanStaleRooms();
    }, intervalMs);

    // Unref so the interval doesn't keep node process alive in tests or CLI
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Stops periodic garbage collection.
   */
  public stopCleanupJob(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Resets all rooms (cleans store and disposes all rooms).
   * Essential for unit and integration test isolation.
   */
  public reset(): void {
    for (const room of this.store.values()) {
      room.dispose();
    }
    this.store.clear();
  }
}

export const roomManager = QuizRoomManager.getInstance();
export const quizRoomManager = roomManager; // Alias
