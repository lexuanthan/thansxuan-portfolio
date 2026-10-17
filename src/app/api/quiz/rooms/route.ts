import { NextResponse } from 'next/server';
import { QuizRoomManager } from '@/lib/training-quiz/roomManager';
import { QuizRoom } from '@/lib/training-quiz/roomEngine';
import {
  HostActionType,
  PlayerState,
  RoomState,
  RoomStatus,
} from '@/lib/training-quiz/types';
import {
  calculateScore,
  getFastestPlayerInQuestion,
} from '@/lib/training-quiz/scoringEngine';

const ALLOWED_ACTIONS: readonly HostActionType[] = [
  'START',
  'NEXT_QUESTION',
  'SHOW_LEADERBOARD',
  'END_GAME',
] as const;

const STATUS_ORDER: Record<RoomStatus, number> = {
  LOBBY: 0,
  QUESTION_START: 1,
  QUESTION_ACTIVE: 2,
  QUESTION_REVEAL: 3,
  LEADERBOARD: 4,
  FINAL_RESULTS: 5,
};

type RehydratableQuizRoom = QuizRoom & {
  isRehydratedShell?: boolean;
};

function getRoomProgress(status: RoomStatus, questionIndex: number): number {
  if (status === 'FINAL_RESULTS') return 1000;
  return questionIndex * 10 + (STATUS_ORDER[status] ?? 0);
}

function recomputePlayerFromAnswers(room: QuizRoom, player: PlayerState): void {
  let score = 0;
  let streak = 0;
  let maxStreak = 0;
  let correctCount = 0;
  let totalResponseTimeMs = 0;

  const answerIndices = Object.keys(player.answers || {})
    .map((k) => Number(k))
    .filter((n) => Number.isInteger(n) && n >= 0);

  const maxQuestionIdx = Math.max(
    room.currentQuestionIndex,
    ...(answerIndices.length > 0 ? answerIndices : [0])
  );

  for (let q = 0; q <= maxQuestionIdx && q < room.questions.length; q++) {
    const ans = player.answers?.[q];
    const question = room.questions[q];

    if (!ans || typeof ans.selectedIndex !== 'number' || ans.selectedIndex < 0 || ans.selectedIndex > 3) {
      const questionFinished =
        q < room.currentQuestionIndex ||
        (q === room.currentQuestionIndex &&
          room.status !== 'LOBBY' &&
          room.status !== 'QUESTION_START' &&
          room.status !== 'QUESTION_ACTIVE');
      if (questionFinished) {
        streak = 0;
      }
      continue;
    }

    const responseTimeMs = Math.max(0, Number(ans.responseTimeMs) || 0);
    const isTimeout = responseTimeMs > room.questionTimeLimitMs;
    const isCorrect = !isTimeout && ans.selectedIndex === question.correctIndex;
    const calc = calculateScore(isCorrect, responseTimeMs, streak);

    ans.isCorrect = isCorrect;
    ans.pointsEarned = calc.points;
    ans.responseTimeMs = responseTimeMs;

    score += calc.points;
    streak = calc.newStreak;
    maxStreak = Math.max(maxStreak, streak);
    if (isCorrect) {
      correctCount++;
    }
    totalResponseTimeMs += responseTimeMs;
  }

  player.score = score;
  player.streak = streak;
  player.maxStreak = maxStreak;
  player.correctCount = correctCount;
  player.totalResponseTimeMs = totalResponseTimeMs;
}

function recomputeRoomAggregates(room: QuizRoom): void {
  for (let q = 0; q <= room.currentQuestionIndex && q < room.questions.length; q++) {
    const stats = { A: 0, B: 0, C: 0, D: 0 };
    for (const p of Object.values(room.players)) {
      const ans = p.answers?.[q];
      if (ans && ans.selectedIndex >= 0 && ans.selectedIndex <= 3) {
        const key = (['A', 'B', 'C', 'D'] as const)[ans.selectedIndex];
        stats[key]++;
      }
    }
    room.statsPerQuestion[q] = stats;
  }

  if (
    room.status === 'QUESTION_REVEAL' ||
    room.status === 'LEADERBOARD' ||
    room.status === 'FINAL_RESULTS'
  ) {
    room.fastestPlayerInCurrentQuestion =
      getFastestPlayerInQuestion(room.players, room.currentQuestionIndex) ?? undefined;
  }
}

function mergePlayersIntoRoom(
  room: QuizRoom,
  incomingPlayers?: Record<string, PlayerState> | null
): boolean {
  if (!incomingPlayers || typeof incomingPlayers !== 'object') return false;

  let anyModified = false;

  for (const [pid, pState] of Object.entries(incomingPlayers)) {
    if (!pid || !pState || typeof pState !== 'object') continue;

    let existing = room.players[pid];
    if (!existing) {
      existing = {
        id: pid,
        nickname:
          typeof pState.nickname === 'string' && pState.nickname.trim()
            ? pState.nickname.trim()
            : 'Người chơi',
        unit:
          typeof pState.unit === 'string' && pState.unit.trim()
            ? pState.unit.trim()
            : undefined,
        score: 0,
        streak: 0,
        maxStreak: 0,
        correctCount: 0,
        totalResponseTimeMs: 0,
        answers: {},
        connected: pState.connected ?? true,
        joinedAt: pState.joinedAt || Date.now(),
      };
      room.players[pid] = existing;
      anyModified = true;
    }

    let playerAnswersUpdated = false;
    if (pState.answers && typeof pState.answers === 'object') {
      for (const [qKey, ans] of Object.entries(pState.answers)) {
        const qIdx = Number(qKey);
        if (
          !Number.isInteger(qIdx) ||
          qIdx < 0 ||
          qIdx >= room.questions.length ||
          !ans ||
          typeof ans.selectedIndex !== 'number' ||
          ans.selectedIndex < 0 ||
          ans.selectedIndex > 3
        ) {
          continue;
        }
        const curAns = existing.answers[qIdx];
        if (!curAns || curAns.selectedIndex < 0) {
          existing.answers[qIdx] = {
            selectedIndex: ans.selectedIndex,
            responseTimeMs: Math.max(0, Number(ans.responseTimeMs) || 0),
            isCorrect: Boolean(ans.isCorrect),
            pointsEarned: Number(ans.pointsEarned) || 0,
          };
          playerAnswersUpdated = true;
          anyModified = true;
        }
      }
    }

    if (playerAnswersUpdated || (existing.score === 0 && Object.keys(existing.answers).length > 0)) {
      recomputePlayerFromAnswers(room, existing);
    }
  }

  if (anyModified) {
    recomputeRoomAggregates(room);
  }

  return anyModified;
}

function rehydrateRoomFromSnapshot(
  roomManager: QuizRoomManager,
  roomCode: string,
  hostToken?: string,
  snapshot?: Partial<RoomState>,
  playerSnapshot?: PlayerState,
  allowRehydrate?: boolean
): RehydratableQuizRoom | undefined {
  let room = roomManager.getRoom(roomCode) as RehydratableQuizRoom | undefined;

  if (!room && (hostToken || allowRehydrate)) {
    const created = roomManager.createRoom({
      customCode: roomCode,
      hostToken: hostToken || undefined,
    });
    room = created.room as RehydratableQuizRoom;
    if (!hostToken) {
      room.isRehydratedShell = true;
    }
  }

  if (!room) return undefined;

  // Adopt real hostToken if room was initialized as a rehydrated shell by a player request
  if (hostToken && room.isRehydratedShell && room.hostToken !== hostToken) {
    (room as { hostToken: string }).hostToken = hostToken;
    room.isRehydratedShell = false;
  }

  // Host snapshot monotonic progression + player merge
  if (snapshot && hostToken && room.hostToken === hostToken) {
    if (
      snapshot.status &&
      typeof snapshot.currentQuestionIndex === 'number'
    ) {
      const serverProgress = getRoomProgress(room.status, room.currentQuestionIndex);
      const snapProgress = getRoomProgress(snapshot.status, snapshot.currentQuestionIndex);

      if (snapProgress > serverProgress) {
        room.currentQuestionIndex = snapshot.currentQuestionIndex;
        room.status = snapshot.status;
        room.questionStartTime = snapshot.questionStartTime;
        room.questionDeadline = snapshot.questionDeadline;
      }
    }

    if (snapshot.players && typeof snapshot.players === 'object') {
      mergePlayersIntoRoom(room, snapshot.players);
      for (const p of Object.values(room.players)) {
        recomputePlayerFromAnswers(room, p);
      }
      recomputeRoomAggregates(room);
    }
  }

  // Player-carried state merge
  if (playerSnapshot && typeof playerSnapshot === 'object' && playerSnapshot.id) {
    mergePlayersIntoRoom(room, { [playerSnapshot.id]: playerSnapshot });
  }

  if (room.status === 'QUESTION_ACTIVE') {
    room.checkFastShortCircuit();
  }

  return room;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = (url.searchParams.get('roomCode') || url.searchParams.get('code') || '')
      .trim()
      .toUpperCase();

    if (!code) {
      return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
    }

    const hostToken = url.searchParams.get('hostToken') || undefined;
    const playerId = url.searchParams.get('playerId') || undefined;

    const roomManager = QuizRoomManager.getInstance();
    const room = rehydrateRoomFromSnapshot(roomManager, code, hostToken);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const state = room.getSanitizedState({
      hostToken,
      requestingPlayerId: playerId,
    });

    return NextResponse.json({
      ...state,
      state,
      roomState: state,
    });
  } catch (error) {
    console.error('Error fetching quiz room state:', error);
    return NextResponse.json({ error: 'Failed to fetch room state' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const op = typeof body?.op === 'string' ? body.op : 'create';
    const roomManager = QuizRoomManager.getInstance();

    // 1. STATE POLL + SNAPSHOT REHYDRATION
    if (op === 'state') {
      const code = typeof body.roomCode === 'string' ? body.roomCode.trim().toUpperCase() : '';
      if (!code) {
        return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
      }
      const hostToken = typeof body.hostToken === 'string' ? body.hostToken : undefined;
      const playerId = typeof body.playerId === 'string' ? body.playerId : undefined;
      const room = rehydrateRoomFromSnapshot(
        roomManager,
        code,
        hostToken,
        body.snapshot,
        body.playerSnapshot,
        Boolean(body.allowRehydrate)
      );

      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      if (body.playersSnapshot && typeof body.playersSnapshot === 'object') {
        mergePlayersIntoRoom(room, body.playersSnapshot);
      }

      const state = room.getSanitizedState({
        hostToken,
        requestingPlayerId: playerId,
      });

      return NextResponse.json({
        ...state,
        state,
        roomState: state,
      });
    }

    // 2. PLAYER JOIN
    if (op === 'join') {
      const code = typeof body.roomCode === 'string' ? body.roomCode.trim().toUpperCase() : '';
      if (!code) {
        return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
      }

      const room = rehydrateRoomFromSnapshot(
        roomManager,
        code,
        undefined,
        undefined,
        undefined,
        Boolean(body.allowRehydrate)
      );
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      if (typeof body.nickname !== 'string' || !body.nickname.trim()) {
        return NextResponse.json(
          { error: 'Nickname is required and cannot be empty' },
          { status: 400 }
        );
      }

      const nickname = body.nickname.trim().slice(0, 50);
      const unit =
        typeof body.unit === 'string' && body.unit.trim().length > 0
          ? body.unit.trim().slice(0, 50)
          : undefined;
      const customId =
        typeof body.playerId === 'string' && body.playerId.trim().length > 0
          ? body.playerId.trim()
          : undefined;

      const player = room.joinPlayer(nickname, unit, customId);
      const state = room.getSanitizedState({ requestingPlayerId: player.id });

      return NextResponse.json(
        {
          playerId: player.id,
          player,
          state,
          roomState: state,
        },
        { status: 200 }
      );
    }

    // 3. HOST ACTION
    if (op === 'action') {
      const code = typeof body.roomCode === 'string' ? body.roomCode.trim().toUpperCase() : '';
      if (!code) {
        return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
      }

      const hostToken = typeof body.hostToken === 'string' ? body.hostToken.trim() : '';
      if (!hostToken) {
        return NextResponse.json({ error: 'Host token is required' }, { status: 401 });
      }

      const room = rehydrateRoomFromSnapshot(
        roomManager,
        code,
        hostToken,
        body.snapshot,
        undefined,
        Boolean(body.allowRehydrate)
      );
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      if (hostToken !== room.hostToken) {
        return NextResponse.json({ error: 'Unauthorized host token' }, { status: 401 });
      }

      const action = body.action as HostActionType;
      if (!action || !ALLOWED_ACTIONS.includes(action)) {
        return NextResponse.json(
          { error: `Invalid action. Allowed: ${ALLOWED_ACTIONS.join(', ')}` },
          { status: 400 }
        );
      }

      const success = room.handleHostAction({
        hostToken,
        action,
      });

      if (!success) {
        return NextResponse.json(
          {
            error: `Cannot perform action "${action}" in the current room status "${room.status}"`,
          },
          { status: 400 }
        );
      }

      recomputeRoomAggregates(room);
      const state = room.getSanitizedState({ forHost: true });
      return NextResponse.json(
        {
          success: true,
          state,
          roomState: state,
        },
        { status: 200 }
      );
    }

    // 4. PLAYER SUBMIT ANSWER
    if (op === 'answer') {
      const code = typeof body.roomCode === 'string' ? body.roomCode.trim().toUpperCase() : '';
      if (!code) {
        return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
      }

      const allowRehydrate = Boolean(body.allowRehydrate);
      const room = rehydrateRoomFromSnapshot(
        roomManager,
        code,
        undefined,
        undefined,
        body.playerSnapshot,
        allowRehydrate
      );
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      if (
        typeof body.playerId !== 'string' ||
        typeof body.questionIndex !== 'number' ||
        typeof body.selectedIndex !== 'number'
      ) {
        return NextResponse.json(
          {
            error:
              'Missing or invalid fields: playerId, questionIndex, and selectedIndex are required',
          },
          { status: 400 }
        );
      }

      if (body.selectedIndex < 0 || body.selectedIndex > 3) {
        return NextResponse.json(
          { error: 'selectedIndex must be an integer between 0 and 3' },
          { status: 400 }
        );
      }

      // If allowRehydrate is enabled and a secondary instance does not have the player yet, restore player
      if (!room.players[body.playerId] && allowRehydrate && typeof body.nickname === 'string') {
        room.joinPlayer(
          body.nickname,
          typeof body.unit === 'string' ? body.unit : undefined,
          body.playerId
        );
      }

      if (!room.players[body.playerId]) {
        return NextResponse.json(
          { error: 'Player not found in room' },
          { status: 404 }
        );
      }

      // If allowRehydrate is enabled and this secondary container is behind the active question
      // or prematurely short-circuited to QUESTION_REVEAL on a partial player subset
      if (
        allowRehydrate &&
        body.questionIndex >= 0 &&
        body.questionIndex < room.questions.length &&
        room.players[body.playerId]?.answers?.[body.questionIndex] === undefined &&
        (room.currentQuestionIndex !== body.questionIndex || room.status !== 'QUESTION_ACTIVE')
      ) {
        room.currentQuestionIndex = body.questionIndex;
        room.status = 'QUESTION_ACTIVE';
        const now = Date.now();
        const startTime =
          typeof body.questionStartTime === 'number' ? body.questionStartTime : now - 1000;
        room.questionStartTime = startTime;
        room.questionDeadline = Math.max(
          now + 5000,
          typeof body.questionDeadline === 'number'
            ? body.questionDeadline
            : startTime + room.questionTimeLimitMs
        );
      }

      const clientTimeMs =
        typeof body.clientTimeMs === 'number' ? body.clientTimeMs : Date.now();

      const result = room.submitAnswer({
        playerId: body.playerId,
        questionIndex: body.questionIndex,
        selectedIndex: body.selectedIndex,
        clientTimeMs,
      });

      if (result === null) {
        return NextResponse.json(
          {
            error:
              'Answer rejected: question not active, questionIndex mismatch, or already submitted',
          },
          { status: 400 }
        );
      }

      const playerState = room.getSanitizedState({
        requestingPlayerId: body.playerId,
      });

      return NextResponse.json(
        {
          success: true,
          result,
          player: room.players[body.playerId],
          state: playerState,
          roomState: playerState,
        },
        { status: 200 }
      );
    }

    // 5. DEFAULT: CREATE ROOM
    const customCode =
      typeof body.customCode === 'string' && body.customCode.trim().length > 0
        ? body.customCode.trim().toUpperCase()
        : undefined;

    const { room, roomCode, hostToken } = roomManager.createRoom({
      customCode,
    });

    const state = room.getState();

    return NextResponse.json(
      {
        roomCode,
        hostToken,
        state,
        roomState: state,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/quiz/rooms:', error);
    return NextResponse.json(
      { error: 'Failed to process quiz room request' },
      { status: 500 }
    );
  }
}
