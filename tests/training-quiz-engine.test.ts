import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QuizRoom } from '../src/lib/training-quiz/roomEngine';
import { roomManager } from '../src/lib/training-quiz/roomManager';
import { TRAINING_QUIZ_QUESTIONS } from '../src/lib/training-quiz/questionsData';
import { QuizQuestion } from '../src/lib/training-quiz/types';

describe('Training Quiz Room Engine & State Machine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    roomManager.reset();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    roomManager.reset();
  });

  describe('State Machine Progression & Timer Management', () => {
    it('initializes in LOBBY state and accepts player joins', () => {
      const room = new QuizRoom({ roomCode: 'ROOM01', hostToken: 'secret_host_123' });
      expect(room.status).toBe('LOBBY');
      expect(room.roomCode).toBe('ROOM01');
      expect(room.hostToken).toBe('secret_host_123');

      const p1 = room.joinPlayer('Nguyễn Văn A', 'Chi đoàn K21 Cơ khí');
      expect(p1.nickname).toBe('Nguyễn Văn A');
      expect(p1.unit).toBe('Chi đoàn K21 Cơ khí');
      expect(p1.score).toBe(0);
      expect(p1.streak).toBe(0);
      expect(p1.connected).toBe(true);

      const connected = room.getConnectedPlayers();
      expect(connected).toHaveLength(1);
      expect(connected[0].id).toBe(p1.id);
    });

    it('rejects startGame from unauthorized token', () => {
      const room = new QuizRoom({ roomCode: 'ROOM02', hostToken: 'correct_token' });
      room.joinPlayer('Học viên 1');

      const started = room.startGame('wrong_token');
      expect(started).toBe(false);
      expect(room.status).toBe('LOBBY');
    });

    it('transitions LOBBY -> QUESTION_START (3s preview) -> QUESTION_ACTIVE (15s countdown)', () => {
      const room = new QuizRoom({
        roomCode: 'ROOM03',
        hostToken: 'host_token',
        previewDurationMs: 3000,
        questionTimeLimitMs: 15000,
      });
      room.joinPlayer('Học viên 1');

      // Start game
      const started = room.startGame('host_token');
      expect(started).toBe(true);
      expect(room.status).toBe('QUESTION_START');
      expect(room.currentQuestionIndex).toBe(0);

      // Advance by 2999ms: still in QUESTION_START
      vi.advanceTimersByTime(2999);
      expect(room.status).toBe('QUESTION_START');

      // Advance past 3000ms: automatically transitions to QUESTION_ACTIVE
      vi.advanceTimersByTime(1);
      expect(room.status).toBe('QUESTION_ACTIVE');
      expect(room.questionStartTime).toBeDefined();
      expect(room.questionDeadline).toBe(room.questionStartTime! + 15000);
    });

    it('transitions to QUESTION_REVEAL automatically after 15 seconds timeout if players do not answer', () => {
      const room = new QuizRoom({
        roomCode: 'ROOM04',
        hostToken: 'host_token',
        previewDurationMs: 3000,
        questionTimeLimitMs: 15000,
      });
      const p1 = room.joinPlayer('Học viên 1');
      p1.streak = 3; // Had a 3-streak previously

      room.startGame('host_token');
      vi.advanceTimersByTime(3000); // Now in QUESTION_ACTIVE
      expect(room.status).toBe('QUESTION_ACTIVE');

      // Wait 15000ms timeout
      vi.advanceTimersByTime(15000);
      expect(room.status).toBe('QUESTION_REVEAL');

      // Streak should be reset to 0 because player did not answer
      expect(room.players[p1.id].streak).toBe(0);
    });

    it('transitions QUESTION_REVEAL -> LEADERBOARD -> NEXT_QUESTION -> FINAL_RESULTS', () => {
      const testQuestions: QuizQuestion[] = [
        {
          id: 1,
          question: 'Q1',
          level: 'Nhận biết',
          timeLimit: 15,
          options: ['A', 'B', 'C', 'D'],
          correctIndex: 0,
          explanation: 'E1',
        },
        {
          id: 2,
          question: 'Q2',
          level: 'Thông hiểu',
          timeLimit: 15,
          options: ['A', 'B', 'C', 'D'],
          correctIndex: 1,
          explanation: 'E2',
        },
      ];

      const room = new QuizRoom({
        roomCode: 'ROOM05',
        hostToken: 'host_token',
        questions: testQuestions,
        previewDurationMs: 3000,
      });

      const p1 = room.joinPlayer('Học viên');
      room.startGame('host_token');
      vi.advanceTimersByTime(3000); // in ACTIVE Q0

      // Player answers Q0 correctly at 1000ms
      vi.advanceTimersByTime(1000);
      room.submitAnswer({
        playerId: p1.id,
        questionIndex: 0,
        selectedIndex: 0,
        clientTimeMs: 1000,
      });

      // Because all connected players answered, fast short-circuit to REVEAL
      expect(room.status).toBe('QUESTION_REVEAL');

      // Host moves to LEADERBOARD
      const showLb = room.handleHostAction({ action: 'SHOW_LEADERBOARD', hostToken: 'host_token' });
      expect(showLb).toBe(true);
      expect(room.status).toBe('LEADERBOARD');

      // Host moves to NEXT_QUESTION -> Q1
      const nextQ = room.handleHostAction({ action: 'NEXT_QUESTION', hostToken: 'host_token' });
      expect(nextQ).toBe(true);
      expect(room.status).toBe('QUESTION_START');
      expect(room.currentQuestionIndex).toBe(1);

      vi.advanceTimersByTime(3000); // Q1 ACTIVE
      expect(room.status).toBe('QUESTION_ACTIVE');

      // Player answers Q1
      room.submitAnswer({
        playerId: p1.id,
        questionIndex: 1,
        selectedIndex: 1,
        clientTimeMs: 1000,
      });
      expect(room.status).toBe('QUESTION_REVEAL');

      room.handleHostAction({ action: 'SHOW_LEADERBOARD', hostToken: 'host_token' });
      expect(room.status).toBe('LEADERBOARD');

      // Next question from last question advances to FINAL_RESULTS
      room.handleHostAction({ action: 'NEXT_QUESTION', hostToken: 'host_token' });
      expect(room.status).toBe('FINAL_RESULTS');
    });
  });

  describe('Instant Fast Short-Circuit Logic', () => {
    it('instantly transitions to QUESTION_REVEAL as soon as all connected players submit answers', () => {
      const room = new QuizRoom({
        roomCode: 'CIRCUIT1',
        hostToken: 'host_token',
        previewDurationMs: 3000,
        questionTimeLimitMs: 15000,
      });

      const p1 = room.joinPlayer('Player 1');
      const p2 = room.joinPlayer('Player 2');
      const p3 = room.joinPlayer('Player 3');
      const p4 = room.joinPlayer('Player 4 (Disconnected)');
      room.setPlayerConnected(p4.id, false); // P4 is disconnected, should not block short-circuit!

      room.startGame('host_token');
      vi.advanceTimersByTime(3000); // ACTIVE
      expect(room.status).toBe('QUESTION_ACTIVE');

      // P1 submits at 500ms
      vi.advanceTimersByTime(500);
      room.submitAnswer({
        playerId: p1.id,
        questionIndex: 0,
        selectedIndex: 1,
        clientTimeMs: 500,
      });
      expect(room.status).toBe('QUESTION_ACTIVE'); // P2 and P3 not yet

      // P2 submits at 1200ms
      vi.advanceTimersByTime(700);
      room.submitAnswer({
        playerId: p2.id,
        questionIndex: 0,
        selectedIndex: 1,
        clientTimeMs: 1200,
      });
      expect(room.status).toBe('QUESTION_ACTIVE'); // P3 not yet

      // P3 submits at 2100ms (Total elapsed in active: 2100ms, well before 15000ms!)
      vi.advanceTimersByTime(900);
      const lastAnswer = room.submitAnswer({
        playerId: p3.id,
        questionIndex: 0,
        selectedIndex: 0,
        clientTimeMs: 2100,
      });
      expect(lastAnswer).not.toBeNull();

      // FAST SHORT-CIRCUIT: Immediately transitions to QUESTION_REVEAL!
      expect(room.status).toBe('QUESTION_REVEAL');

      // Fastest player among correct answers (P1 at 500ms vs P2 at 1200ms) is P1
      expect(room.fastestPlayerInCurrentQuestion?.playerId).toBe(p1.id);
      expect(room.fastestPlayerInCurrentQuestion?.responseTimeMs).toBe(500);
    });

    it('rejects duplicate answer submissions from the same player on the same question', () => {
      const room = new QuizRoom({ roomCode: 'DUPS1', hostToken: 'host' });
      const p1 = room.joinPlayer('P1');
      room.startGame('host');
      vi.advanceTimersByTime(3000);

      const firstAns = room.submitAnswer({
        playerId: p1.id,
        questionIndex: 0,
        selectedIndex: 1,
        clientTimeMs: 500,
      });
      expect(firstAns).not.toBeNull();

      // Second attempt on same question
      const secondAns = room.submitAnswer({
        playerId: p1.id,
        questionIndex: 0,
        selectedIndex: 2,
        clientTimeMs: 800,
      });
      expect(secondAns).toBeNull();
      expect(room.players[p1.id].answers[0].selectedIndex).toBe(1);
    });
  });

  describe('State Sanitization & Anti-Cheat', () => {
    it('masks answer details from other players during QUESTION_ACTIVE', () => {
      const room = new QuizRoom({ roomCode: 'SEC001', hostToken: 'host_secret' });
      const p1 = room.joinPlayer('Học viên A');
      const p2 = room.joinPlayer('Học viên B');

      room.startGame('host_secret');
      vi.advanceTimersByTime(3000); // in QUESTION_ACTIVE

      // P1 submits answer (selected 1, correct)
      room.submitAnswer({
        playerId: p1.id,
        questionIndex: 0,
        selectedIndex: 1,
        clientTimeMs: 1000,
      });

      // Sanitized view for P2 (who has NOT answered yet):
      const p2View = room.getSanitizedState({ requestingPlayerId: p2.id });

      // Host token must be hidden
      expect(p2View.hostToken).toBe('');

      // Fastest player must be hidden while active
      expect(p2View.fastestPlayerInCurrentQuestion).toBeUndefined();

      // P1's answer in P2's view: selectedIndex masked to -1, isCorrect = false, pointsEarned = 0
      const p1AnswerInP2View = p2View.players[p1.id].answers[0];
      expect(p1AnswerInP2View.selectedIndex).toBe(-1);
      expect(p1AnswerInP2View.isCorrect).toBe(false);
      expect(p1AnswerInP2View.pointsEarned).toBe(0);

      // Sanitized view for P1 (self view):
      const p1View = room.getSanitizedState({ requestingPlayerId: p1.id });
      // P1 can see their selectedIndex (1), but isCorrect and points are masked until reveal
      expect(p1View.players[p1.id].answers[0].selectedIndex).toBe(1);
      expect(p1View.players[p1.id].answers[0].isCorrect).toBe(false);
      expect(p1View.players[p1.id].answers[0].pointsEarned).toBe(0);

      // Host view: retains all full details
      const hostView = room.getSanitizedState({ forHost: true });
      expect(hostView.hostToken).toBe('host_secret');
      expect(hostView.players[p1.id].answers[0].selectedIndex).toBe(1);
      expect(hostView.players[p1.id].answers[0].isCorrect).toBe(true);
      expect(hostView.players[p1.id].answers[0].pointsEarned).toBeGreaterThan(0);
    });
  });

  describe('Full Classroom Simulation: 12 Concurrent Players Across 15 Questions', () => {
    it('simulates complete 15-question game with 12 students, checking short-circuit, podium, and stats', () => {
      const room = new QuizRoom({
        roomCode: 'DOAN21',
        hostToken: 'host_master_token',
        questions: TRAINING_QUIZ_QUESTIONS, // 15 authentic questions
        previewDurationMs: 100, // Speed up for simulation
        questionTimeLimitMs: 15000,
      });

      const studentProfiles = [
        { name: 'Đặng Quốc Hưng', unit: 'Chi đoàn K21 Cơ khí' },
        { name: 'Nguyễn Thị Mai', unit: 'Chi đoàn K22 CNTT' },
        { name: 'Trần Văn Nam', unit: 'Chi đoàn K21 Điện - Điện tử' },
        { name: 'Lê Hoàng Phúc', unit: 'Chi đoàn K23 Kinh tế' },
        { name: 'Phạm Thu Thảo', unit: 'Chi đoàn K22 Ngoại ngữ' },
        { name: 'Vũ Đức Trọng', unit: 'Chi đoàn K21 Xây dựng' },
        { name: 'Bùi Phương Linh', unit: 'Chi đoàn K22 Hóa học' },
        { name: 'Đỗ Minh Khang', unit: 'Chi đoàn K23 In - TT' },
        { name: 'Hoàng Gia Bảo', unit: 'Chi đoàn K20 CKL' },
        { name: 'Ngô Thanh Tùng', unit: 'Chi đoàn K22 Nhiệt - Lạnh' },
        { name: 'Dương Hải Yến', unit: 'Chi đoàn K21 Thời trang' },
        { name: 'Lý Quốc Toàn', unit: 'Chi đoàn K23 Tự động hóa' },
      ];

      const playerIds: string[] = [];
      for (const profile of studentProfiles) {
        const p = room.joinPlayer(profile.name, profile.unit);
        playerIds.push(p.id);
      }

      expect(room.getConnectedPlayers()).toHaveLength(12);

      // Start game
      room.startGame('host_master_token');

      // Loop through all 15 questions
      for (let q = 0; q < 15; q++) {
        expect(room.currentQuestionIndex).toBe(q);

        // Advance past preview duration
        vi.advanceTimersByTime(100);
        expect(room.status).toBe('QUESTION_ACTIVE');

        const currentQuestion = room.getCurrentQuestion();
        expect(currentQuestion.id).toBe(q + 1);

        // Simulate each student answering at different times
        // Students 0, 1, 2 answer very accurately and fast
        // Other students have varied response times and accuracy
        for (let s = 0; s < playerIds.length; s++) {
          const playerId = playerIds[s];
          const responseTime = 500 + s * 250; // 500ms to 3250ms

          // Advance fake timer to simulate time passing between answers
          vi.advanceTimersByTime(150);

          let selectedOption = currentQuestion.correctIndex;
          if (s >= 8 && q % 2 === 1) {
            // Some students answer incorrectly on odd questions
            selectedOption = (currentQuestion.correctIndex + 1) % 4;
          }

          room.submitAnswer({
            playerId,
            questionIndex: q,
            selectedIndex: selectedOption,
            clientTimeMs: responseTime,
          });
        }

        // Fast Short-Circuit MUST have triggered on 12th answer!
        expect(room.status).toBe('QUESTION_REVEAL');
        expect(room.fastestPlayerInCurrentQuestion).toBeDefined();

        // Host displays leaderboard
        room.handleHostAction({ action: 'SHOW_LEADERBOARD', hostToken: 'host_master_token' });
        expect(room.status).toBe('LEADERBOARD');

        // Move to next question (or finish on last question)
        room.handleHostAction({ action: 'NEXT_QUESTION', hostToken: 'host_master_token' });
      }

      // Reached FINAL_RESULTS
      expect(room.status).toBe('FINAL_RESULTS');

      const awards = room.getFinalAwards();
      expect(awards.podium).toHaveLength(3);
      expect(awards.podium[0].score).toBeGreaterThan(awards.podium[1].score);
      expect(awards.podium[1].score).toBeGreaterThan(awards.podium[2].score);

      // Verify Lightning Award exists
      expect(awards.lightningAward).toBeDefined();
      expect(awards.lightningAward?.averageResponseTimeMs).toBeGreaterThan(0);

      // Verify Class Analytics
      expect(awards.classAnalytics.totalParticipants).toBe(12);
      expect(awards.classAnalytics.questionsStats).toHaveLength(15);
      expect(awards.classAnalytics.hardestQuestion).toBeDefined();
      expect(awards.classAnalytics.easiestQuestion).toBeDefined();
    });
  });

  describe('QuizRoomManager Singleton & TTL Garbage Collection', () => {
    it('manages rooms in globalThis.__QUIZ_ROOMS__ singleton store', () => {
      const created = roomManager.createRoom({ customCode: 'MGR001' });
      expect(created.roomCode).toBe('MGR001');
      expect(roomManager.hasRoom('MGR001')).toBe(true);

      const fetched = roomManager.getRoom('MGR001');
      expect(fetched).toBe(created.room);
      expect(roomManager.getActiveRoomCount()).toBe(1);

      // Test host token verification
      expect(roomManager.verifyHost('MGR001', created.hostToken)).toBe(true);
      expect(roomManager.verifyHost('MGR001', 'bad_token')).toBe(false);

      // Test delete
      expect(roomManager.deleteRoom('MGR001')).toBe(true);
      expect(roomManager.hasRoom('MGR001')).toBe(false);
    });

    it('generates unique 6-character room codes', () => {
      const code1 = roomManager.generateRoomCode();
      const code2 = roomManager.generateRoomCode();
      expect(code1).toHaveLength(6);
      expect(code2).toHaveLength(6);
      expect(code1).toMatch(/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
      expect(code1).not.toBe(code2);
    });

    it('cleans up stale rooms older than 2 hours', () => {
      const room = roomManager.createRoom({ customCode: 'OLD001' });
      const activeRoom = roomManager.createRoom({ customCode: 'NEW001' });

      // Simulate OLD001 was last active 2.5 hours ago
      room.room.lastActivityAt = Date.now() - (2.5 * 60 * 60 * 1000);
      activeRoom.room.lastActivityAt = Date.now();

      const purged = roomManager.cleanStaleRooms(2 * 60 * 60 * 1000);
      expect(purged).toBe(1);
      expect(roomManager.hasRoom('OLD001')).toBe(false);
      expect(roomManager.hasRoom('NEW001')).toBe(true);
    });
  });
});
