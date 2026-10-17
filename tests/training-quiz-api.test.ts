/**
 * Comprehensive API Route Handler Test Suite for Live Interactive Training Quiz Game
 * (Công tác xây dựng kế hoạch và tổ chức hoạt động Đoàn - Hội HCM-UTE)
 *
 * Verifies Next.js 16 App Router Route Handlers:
 * 1. POST /api/quiz/rooms (Room Creation)
 * 2. GET /api/quiz/rooms/[code]/state (Sanitized & Host State Retrieval)
 * 3. POST /api/quiz/rooms/[code]/join (Player Joining & Validation)
 * 4. POST /api/quiz/rooms/[code]/action (Host Controls & Authorization)
 * 5. POST /api/quiz/rooms/[code]/answer (Player Answer Submission & Fast Short-Circuit)
 * 6. GET /api/quiz/rooms/[code]/sse (Server-Sent Events Stream & Teardown)
 * 7. Full Classroom Simulation through API Routes (10+ Players)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QuizRoomManager } from '@/lib/training-quiz/roomManager';
import { POST as createRoomRoute } from '@/app/api/quiz/rooms/route';
import { GET as getStateRoute } from '@/app/api/quiz/rooms/[code]/state/route';
import { POST as joinRoomRoute } from '@/app/api/quiz/rooms/[code]/join/route';
import { POST as actionRoute } from '@/app/api/quiz/rooms/[code]/action/route';
import { POST as answerRoute } from '@/app/api/quiz/rooms/[code]/answer/route';
import { GET as sseRoute } from '@/app/api/quiz/rooms/[code]/sse/route';

describe('Training Quiz API Route Handlers', () => {
  const roomManager = QuizRoomManager.getInstance();

  beforeEach(() => {
    roomManager.reset();
  });

  afterEach(() => {
    roomManager.reset();
  });

  // ==========================================
  // 1. POST /api/quiz/rooms
  // ==========================================
  describe('POST /api/quiz/rooms (Room Creation)', () => {
    it('creates a new room with random 6-character roomCode and hostToken', async () => {
      const req = new Request('http://localhost:3000/api/quiz/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const res = await createRoomRoute(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.roomCode).toBeDefined();
      expect(typeof data.roomCode).toBe('string');
      expect(data.roomCode).toHaveLength(6);
      expect(data.hostToken).toBeDefined();
      expect(typeof data.hostToken).toBe('string');
      expect(data.state).toBeDefined();
      expect(data.state.status).toBe('LOBBY');
      expect(data.state.currentQuestionIndex).toBe(0);
      expect(Object.keys(data.state.players)).toHaveLength(0);

      // Verify room exists in manager
      const room = roomManager.getRoom(data.roomCode);
      expect(room).toBeDefined();
      expect(room?.hostToken).toBe(data.hostToken);
    });

    it('creates a room with custom roomCode when provided', async () => {
      const req = new Request('http://localhost:3000/api/quiz/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customCode: 'ute202' }),
      });

      const res = await createRoomRoute(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.roomCode).toBe('UTE202');
      expect(roomManager.hasRoom('UTE202')).toBe(true);
    });

    it('handles empty body or non-JSON body gracefully', async () => {
      const req = new Request('http://localhost:3000/api/quiz/rooms', {
        method: 'POST',
      });

      const res = await createRoomRoute(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.roomCode).toBeDefined();
      expect(data.hostToken).toBeDefined();
    });
  });

  // ==========================================
  // 2. GET /api/quiz/rooms/[code]/state
  // ==========================================
  describe('GET /api/quiz/rooms/[code]/state (State Retrieval & Sanitization)', () => {
    it('returns 404 if room does not exist', async () => {
      const req = new Request('http://localhost:3000/api/quiz/rooms/NOT_FOUND/state');
      const res = await getStateRoute(req, {
        params: Promise.resolve({ code: 'NOT_FOUND' }),
      });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toContain('Room not found');
    });

    it('returns 400 if room code param is empty', async () => {
      const req = new Request('http://localhost:3000/api/quiz/rooms//state');
      const res = await getStateRoute(req, {
        params: Promise.resolve({ code: '' }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it('returns sanitized state for public viewer (hiding hostToken)', async () => {
      const { roomCode, hostToken } = roomManager.createRoom({ customCode: 'PUB001' });

      const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/state`);
      const res = await getStateRoute(req, {
        params: Promise.resolve({ code: roomCode }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.roomCode).toBe(roomCode);
      expect(data.status).toBe('LOBBY');
      // hostToken MUST be masked / empty for public
      expect(data.hostToken).toBe('');
      expect(data.hostToken).not.toBe(hostToken);
    });

    it('returns full unmasked state when valid hostToken is provided', async () => {
      const { roomCode, hostToken } = roomManager.createRoom({ customCode: 'HST001' });

      const req = new Request(
        `http://localhost:3000/api/quiz/rooms/${roomCode}/state?hostToken=${hostToken}`
      );
      const res = await getStateRoute(req, {
        params: Promise.resolve({ code: roomCode }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.roomCode).toBe(roomCode);
      expect(data.hostToken).toBe(hostToken);
    });

    it('sanitizes active questions: masks correct answers and points from other players during QUESTION_ACTIVE', async () => {
      const { room, roomCode } = roomManager.createRoom({ customCode: 'SNZ001' });
      const p1 = room.joinPlayer('Nguyễn Văn A');
      const p2 = room.joinPlayer('Trần Thị B');

      // Start game and move to QUESTION_ACTIVE
      room.startGame(room.hostToken);
      room.transitionToQuestionActive();

      // p1 submits answer
      room.submitAnswer({
        playerId: p1.id,
        questionIndex: 0,
        selectedIndex: 1,
        clientTimeMs: Date.now(),
      });

      // Query state as p2 (other player)
      const req = new Request(
        `http://localhost:3000/api/quiz/rooms/${roomCode}/state?playerId=${p2.id}`
      );
      const res = await getStateRoute(req, {
        params: Promise.resolve({ code: roomCode }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      // P1's answer details must be masked for P2
      const p1State = data.players[p1.id];
      expect(p1State).toBeDefined();
      expect(p1State.answers[0].selectedIndex).toBe(-1); // MASKED
      expect(p1State.answers[0].isCorrect).toBe(false); // MASKED
      expect(p1State.answers[0].pointsEarned).toBe(0); // MASKED
    });
  });

  // ==========================================
  // 3. POST /api/quiz/rooms/[code]/join
  // ==========================================
  describe('POST /api/quiz/rooms/[code]/join (Player Joining)', () => {
    it('returns 404 when joining a non-existent room', async () => {
      const req = new Request('http://localhost:3000/api/quiz/rooms/NOROOM/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'Học viên A' }),
      });

      const res = await joinRoomRoute(req, {
        params: Promise.resolve({ code: 'NOROOM' }),
      });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toContain('Room not found');
    });

    it('rejects empty or whitespace-only nickname with 400', async () => {
      const { roomCode } = roomManager.createRoom({ customCode: 'JON001' });

      for (const badNick of ['', '   ', null, undefined]) {
        const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname: badNick }),
        });

        const res = await joinRoomRoute(req, {
          params: Promise.resolve({ code: roomCode }),
        });

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain('Nickname is required');
      }
    });

    it('successfully joins room with nickname and unit, returning playerId and state', async () => {
      const { roomCode } = roomManager.createRoom({ customCode: 'JON002' });

      const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: '  Lê Văn Cường  ',
          unit: '  Chi đoàn K21 Cơ điện tử  ',
        }),
      });

      const res = await joinRoomRoute(req, {
        params: Promise.resolve({ code: roomCode }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.playerId).toBeDefined();
      expect(typeof data.playerId).toBe('string');
      expect(data.player.nickname).toBe('Lê Văn Cường');
      expect(data.player.unit).toBe('Chi đoàn K21 Cơ điện tử');
      expect(data.state).toBeDefined();
      expect(data.state.players[data.playerId]).toBeDefined();

      // Check manager state
      const room = roomManager.getRoom(roomCode);
      expect(room?.players[data.playerId].nickname).toBe('Lê Văn Cường');
    });

    it('truncates excessively long nickname and unit to safe limits (50 chars)', async () => {
      const { roomCode } = roomManager.createRoom({ customCode: 'JON003' });
      const longName = 'A'.repeat(80);
      const longUnit = 'B'.repeat(80);

      const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: longName, unit: longUnit }),
      });

      const res = await joinRoomRoute(req, {
        params: Promise.resolve({ code: roomCode }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.player.nickname).toHaveLength(50);
      expect(data.player.unit).toHaveLength(50);
    });
  });

  // ==========================================
  // 4. POST /api/quiz/rooms/[code]/action
  // ==========================================
  describe('POST /api/quiz/rooms/[code]/action (Host Controls & Authorization)', () => {
    it('returns 404 for non-existent room', async () => {
      const req = new Request('http://localhost:3000/api/quiz/rooms/NOROOM/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostToken: 'token', action: 'START' }),
      });

      const res = await actionRoute(req, {
        params: Promise.resolve({ code: 'NOROOM' }),
      });

      expect(res.status).toBe(404);
    });

    it('returns 401 when hostToken is missing or empty', async () => {
      const { roomCode } = roomManager.createRoom({ customCode: 'ACT001' });

      const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'START' }),
      });

      const res = await actionRoute(req, {
        params: Promise.resolve({ code: roomCode }),
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Host token is required');
    });

    it('returns 401 when hostToken is wrong', async () => {
      const { roomCode } = roomManager.createRoom({ customCode: 'ACT002' });

      const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostToken: 'invalid_token', action: 'START' }),
      });

      const res = await actionRoute(req, {
        params: Promise.resolve({ code: roomCode }),
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Unauthorized host token');
    });

    it('returns 400 for unknown or invalid action', async () => {
      const { roomCode, hostToken } = roomManager.createRoom({ customCode: 'ACT003' });

      const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostToken, action: 'DESTROY_ROOM' }),
      });

      const res = await actionRoute(req, {
        params: Promise.resolve({ code: roomCode }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Invalid action');
    });

    it('START: transitions room from LOBBY to QUESTION_START', async () => {
      const { roomCode, hostToken } = roomManager.createRoom({ customCode: 'ACT004' });

      const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostToken, action: 'START' }),
      });

      const res = await actionRoute(req, {
        params: Promise.resolve({ code: roomCode }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.state.status).toBe('QUESTION_START');
      expect(data.state.currentQuestionIndex).toBe(0);
    });

    it('rejects invalid state progression (e.g. START when already started) with 400', async () => {
      const { room, roomCode, hostToken } = roomManager.createRoom({ customCode: 'ACT005' });
      room.startGame(hostToken);

      const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostToken, action: 'START' }),
      });

      const res = await actionRoute(req, {
        params: Promise.resolve({ code: roomCode }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Cannot perform action');
    });

    it('SHOW_LEADERBOARD & NEXT_QUESTION & END_GAME state transitions work properly', async () => {
      const { room, roomCode, hostToken } = roomManager.createRoom({ customCode: 'ACT006' });
      room.startGame(hostToken);
      room.transitionToQuestionReveal(false);

      // Transition to LEADERBOARD
      const reqLd = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostToken, action: 'SHOW_LEADERBOARD' }),
      });
      const resLd = await actionRoute(reqLd, {
        params: Promise.resolve({ code: roomCode }),
      });
      expect(resLd.status).toBe(200);
      const dataLd = await resLd.json();
      expect(dataLd.state.status).toBe('LEADERBOARD');

      // Advance to NEXT_QUESTION
      const reqNext = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostToken, action: 'NEXT_QUESTION' }),
      });
      const resNext = await actionRoute(reqNext, {
        params: Promise.resolve({ code: roomCode }),
      });
      expect(resNext.status).toBe(200);
      const dataNext = await resNext.json();
      expect(dataNext.state.status).toBe('QUESTION_START');
      expect(dataNext.state.currentQuestionIndex).toBe(1);

      // Force END_GAME
      const reqEnd = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostToken, action: 'END_GAME' }),
      });
      const resEnd = await actionRoute(reqEnd, {
        params: Promise.resolve({ code: roomCode }),
      });
      expect(resEnd.status).toBe(200);
      const dataEnd = await resEnd.json();
      expect(dataEnd.state.status).toBe('FINAL_RESULTS');
    });
  });

  // ==========================================
  // 5. POST /api/quiz/rooms/[code]/answer
  // ==========================================
  describe('POST /api/quiz/rooms/[code]/answer (Answer Submission & Short-Circuit)', () => {
    it('returns 404 if room does not exist', async () => {
      const req = new Request('http://localhost:3000/api/quiz/rooms/NOROOM/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: 'p1',
          questionIndex: 0,
          selectedIndex: 0,
        }),
      });

      const res = await answerRoute(req, {
        params: Promise.resolve({ code: 'NOROOM' }),
      });

      expect(res.status).toBe(404);
    });

    it('returns 400 for missing or malformed payload fields', async () => {
      const { roomCode } = roomManager.createRoom({ customCode: 'ANS001' });

      const invalidPayloads = [
        {},
        { playerId: 123 },
        { playerId: 'p1' },
        { playerId: 'p1', questionIndex: 'zero', selectedIndex: 1 },
        { playerId: 'p1', questionIndex: 0, selectedIndex: 'A' },
      ];

      for (const payload of invalidPayloads) {
        const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const res = await answerRoute(req, {
          params: Promise.resolve({ code: roomCode }),
        });

        expect(res.status).toBe(400);
      }
    });

    it('returns 400 if selectedIndex is outside [0, 3]', async () => {
      const { room, roomCode } = roomManager.createRoom({ customCode: 'ANS002' });
      const p = room.joinPlayer('Học viên');

      for (const badIndex of [-1, 4, 10]) {
        const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: p.id,
            questionIndex: 0,
            selectedIndex: badIndex,
          }),
        });

        const res = await answerRoute(req, {
          params: Promise.resolve({ code: roomCode }),
        });

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain('selectedIndex');
      }
    });

    it('returns 404 if playerId does not exist in room', async () => {
      const { roomCode } = roomManager.createRoom({ customCode: 'ANS003' });

      const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: 'non_existent_player',
          questionIndex: 0,
          selectedIndex: 1,
        }),
      });

      const res = await answerRoute(req, {
        params: Promise.resolve({ code: roomCode }),
      });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toContain('Player not found');
    });

    it('returns 400 if room is not in QUESTION_ACTIVE state', async () => {
      const { room, roomCode } = roomManager.createRoom({ customCode: 'ANS004' });
      const p = room.joinPlayer('Học viên');
      // Room is in LOBBY

      const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: p.id,
          questionIndex: 0,
          selectedIndex: 0,
        }),
      });

      const res = await answerRoute(req, {
        params: Promise.resolve({ code: roomCode }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Answer rejected');
    });

    it('submits correct answer: awards points, calculates speed bonus, increments streak', async () => {
      const { room, roomCode, hostToken } = roomManager.createRoom({ customCode: 'ANS005' });
      const p = room.joinPlayer('Học viên Tinh Nhuệ');

      room.startGame(hostToken);
      room.transitionToQuestionActive();

      const currentQ = room.getCurrentQuestion();
      const correctIdx = currentQ.correctIndex;

      const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: p.id,
          questionIndex: 0,
          selectedIndex: correctIdx,
        }),
      });

      const res = await answerRoute(req, {
        params: Promise.resolve({ code: roomCode }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.result.isCorrect).toBe(true);
      expect(data.result.points).toBeGreaterThan(0);
      expect(data.result.newStreak).toBe(1);

      // Verify player state in room
      expect(p.score).toBe(data.result.points);
      expect(p.streak).toBe(1);
      expect(p.correctCount).toBe(1);
    });

    it('submits incorrect answer: awards 0 points and resets streak', async () => {
      const { room, roomCode, hostToken } = roomManager.createRoom({ customCode: 'ANS006' });
      const p = room.joinPlayer('Học viên');
      p.streak = 3; // Previously had streak

      room.startGame(hostToken);
      room.transitionToQuestionActive();

      const currentQ = room.getCurrentQuestion();
      const wrongIdx = (currentQ.correctIndex + 1) % 4;

      const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: p.id,
          questionIndex: 0,
          selectedIndex: wrongIdx,
        }),
      });

      const res = await answerRoute(req, {
        params: Promise.resolve({ code: roomCode }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.result.isCorrect).toBe(false);
      expect(data.result.points).toBe(0);
      expect(data.result.newStreak).toBe(0);
      expect(p.streak).toBe(0);
    });

    it('rejects duplicate answer submission for the same question', async () => {
      const { room, roomCode, hostToken } = roomManager.createRoom({ customCode: 'ANS007' });
      const p1 = room.joinPlayer('Học viên 1');
      room.joinPlayer('Học viên 2'); // 2 players so short-circuit doesn't immediately advance

      room.startGame(hostToken);
      room.transitionToQuestionActive();

      // First answer
      const req1 = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: p1.id,
          questionIndex: 0,
          selectedIndex: 1,
        }),
      });
      const res1 = await answerRoute(req1, {
        params: Promise.resolve({ code: roomCode }),
      });
      expect(res1.status).toBe(200);

      // Duplicate attempt
      const req2 = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: p1.id,
          questionIndex: 0,
          selectedIndex: 2,
        }),
      });
      const res2 = await answerRoute(req2, {
        params: Promise.resolve({ code: roomCode }),
      });

      expect(res2.status).toBe(400);
      const data2 = await res2.json();
      expect(data2.error).toContain('Answer rejected');
    });

    it('triggers Fast Short-Circuit when all connected players submit answers', async () => {
      const { room, roomCode, hostToken } = roomManager.createRoom({ customCode: 'FAST01' });
      const p1 = room.joinPlayer('Học viên 1');
      const p2 = room.joinPlayer('Học viên 2');

      room.startGame(hostToken);
      room.transitionToQuestionActive();
      expect(room.status).toBe('QUESTION_ACTIVE');

      // Player 1 answers -> room remains active
      const req1 = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: p1.id,
          questionIndex: 0,
          selectedIndex: 1,
        }),
      });
      await answerRoute(req1, { params: Promise.resolve({ code: roomCode }) });
      expect(room.status).toBe('QUESTION_ACTIVE');

      // Player 2 answers -> all connected players answered! Fast short-circuit triggers!
      const req2 = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: p2.id,
          questionIndex: 0,
          selectedIndex: 2,
        }),
      });
      await answerRoute(req2, { params: Promise.resolve({ code: roomCode }) });

      // Room status should have short-circuited directly to QUESTION_REVEAL
      expect(room.status).toBe('QUESTION_REVEAL');
    });
  });

  // ==========================================
  // 6. GET /api/quiz/rooms/[code]/sse
  // ==========================================
  describe('GET /api/quiz/rooms/[code]/sse (Server-Sent Events Stream)', () => {
    it('returns 404 for non-existent room', async () => {
      const req = new Request('http://localhost:3000/api/quiz/rooms/NOROOM/sse');
      const res = await sseRoute(req, {
        params: Promise.resolve({ code: 'NOROOM' }),
      });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toContain('Room not found');
    });

    it('establishes SSE stream with correct headers and initial roomState message', async () => {
      const { roomCode } = roomManager.createRoom({ customCode: 'SSE001' });

      const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/sse`);
      const res = await sseRoute(req, {
        params: Promise.resolve({ code: roomCode }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('text/event-stream; charset=utf-8');
      expect(res.headers.get('Cache-Control')).toBe('no-cache, no-transform');
      expect(res.headers.get('Connection')).toBe('keep-alive');

      const reader = res.body?.getReader();
      expect(reader).toBeDefined();

      const { value, done } = await reader!.read();
      expect(done).toBe(false);

      const chunk = new TextDecoder().decode(value);
      expect(chunk).toContain('event: roomState');
      expect(chunk).toContain('data:');
      expect(chunk).toContain('"roomCode":"SSE001"');

      // Cancel reader to close cleanly
      await reader!.cancel();
    });

    it('pushes new state updates when room state changes', async () => {
      const { room, roomCode } = roomManager.createRoom({ customCode: 'SSE002' });

      const req = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/sse`);
      const res = await sseRoute(req, {
        params: Promise.resolve({ code: roomCode }),
      });

      const reader = res.body?.getReader();
      expect(reader).toBeDefined();

      // Read initial event
      const initialChunk = await reader!.read();
      expect(initialChunk.done).toBe(false);

      // Trigger a state change: join player
      room.joinPlayer('Thành viên mới');

      // Read next event from stream
      const updateChunk = await reader!.read();
      expect(updateChunk.done).toBe(false);
      const updateText = new TextDecoder().decode(updateChunk.value);
      expect(updateText).toContain('Thành viên mới');

      await reader!.cancel();
    });

    it('handles client abort signal without throwing uncaught exceptions', async () => {
      const { roomCode } = roomManager.createRoom({ customCode: 'SSE003' });
      let abortHandler: (() => void) | null = null;
      const fakeSignal = {
        addEventListener: (event: string, handler: () => void) => {
          if (event === 'abort') abortHandler = handler;
        },
      };

      const req = {
        url: `http://localhost:3000/api/quiz/rooms/${roomCode}/sse`,
        signal: fakeSignal,
      } as unknown as Request;

      const res = await sseRoute(req, {
        params: Promise.resolve({ code: roomCode }),
      });
      expect(res.status).toBe(200);

      // Trigger abort
      expect(() => {
        if (abortHandler) abortHandler();
      }).not.toThrow();
    });
  });

  // ==========================================
  // 7. Full Classroom Simulation via API Routes
  // ==========================================
  describe('Full Classroom Simulation via API Routes (10 Players)', () => {
    it('simulates complete multi-player quiz session through HTTP API endpoints', async () => {
      // Step 1: Host creates room
      const createReq = new Request('http://localhost:3000/api/quiz/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customCode: 'CLASS1' }),
      });
      const createRes = await createRoomRoute(createReq);
      const { roomCode, hostToken } = await createRes.json();
      expect(roomCode).toBe('CLASS1');

      // Step 2: 10 players join via POST /api/quiz/rooms/[code]/join
      const playerIds: string[] = [];
      for (let i = 1; i <= 10; i++) {
        const joinReq = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nickname: `Cán bộ Đoàn ${i}`,
            unit: `Chi đoàn ${i} UTE`,
          }),
        });
        const joinRes = await joinRoomRoute(joinReq, {
          params: Promise.resolve({ code: roomCode }),
        });
        expect(joinRes.status).toBe(200);
        const joinData = await joinRes.json();
        playerIds.push(joinData.playerId);
      }
      expect(playerIds).toHaveLength(10);

      // Verify room has 10 players
      const stateReq = new Request(
        `http://localhost:3000/api/quiz/rooms/${roomCode}/state?hostToken=${hostToken}`
      );
      const stateRes = await getStateRoute(stateReq, {
        params: Promise.resolve({ code: roomCode }),
      });
      const roomState = await stateRes.json();
      expect(Object.keys(roomState.players)).toHaveLength(10);

      // Step 3: Host starts the game
      const startReq = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostToken, action: 'START' }),
      });
      const startRes = await actionRoute(startReq, {
        params: Promise.resolve({ code: roomCode }),
      });
      expect(startRes.status).toBe(200);

      const room = roomManager.getRoom(roomCode)!;
      expect(room.status).toBe('QUESTION_START');

      // Fast-forward preview to active
      room.transitionToQuestionActive();
      expect(room.status).toBe('QUESTION_ACTIVE');

      const correctIndex = room.getCurrentQuestion().correctIndex;

      // Step 4: All 10 players submit answers
      for (let i = 0; i < playerIds.length; i++) {
        // First 8 answer correctly, last 2 answer incorrectly
        const selectedIndex = i < 8 ? correctIndex : (correctIndex + 1) % 4;

        const answerReq = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: playerIds[i],
            questionIndex: 0,
            selectedIndex,
            clientTimeMs: Date.now() + i * 200,
          }),
        });

        const ansRes = await answerRoute(answerReq, {
          params: Promise.resolve({ code: roomCode }),
        });
        expect(ansRes.status).toBe(200);
      }

      // Step 5: Fast short-circuit triggers transition to QUESTION_REVEAL
      expect(room.status).toBe('QUESTION_REVEAL');
      expect(room.fastestPlayerInCurrentQuestion).toBeDefined();

      // Step 6: Host shows leaderboard
      const lbReq = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostToken, action: 'SHOW_LEADERBOARD' }),
      });
      const lbRes = await actionRoute(lbReq, {
        params: Promise.resolve({ code: roomCode }),
      });
      expect(lbRes.status).toBe(200);
      expect(room.status).toBe('LEADERBOARD');

      // Step 7: Host ends game
      const endReq = new Request(`http://localhost:3000/api/quiz/rooms/${roomCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostToken, action: 'END_GAME' }),
      });
      const endRes = await actionRoute(endReq, {
        params: Promise.resolve({ code: roomCode }),
      });
      expect(endRes.status).toBe(200);
      const endData = await endRes.json();
      expect(endData.state.status).toBe('FINAL_RESULTS');
    });
  });
});
