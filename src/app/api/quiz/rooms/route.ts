import { NextResponse } from 'next/server';
import { QuizRoomManager } from '@/lib/training-quiz/roomManager';
import { QuizRoom } from '@/lib/training-quiz/roomEngine';
import { HostActionType, RoomState } from '@/lib/training-quiz/types';

const ALLOWED_ACTIONS: readonly HostActionType[] = [
  'START',
  'NEXT_QUESTION',
  'SHOW_LEADERBOARD',
  'END_GAME',
] as const;

function rehydrateRoomFromSnapshot(
  roomManager: QuizRoomManager,
  roomCode: string,
  hostToken?: string,
  snapshot?: Partial<RoomState>
): QuizRoom | undefined {
  let room = roomManager.getRoom(roomCode);

  if (!room && hostToken) {
    const created = roomManager.createRoom({
      customCode: roomCode,
      hostToken,
    });
    room = created.room;
  }

  if (room && snapshot && hostToken && room.hostToken === hostToken) {
    // Merge any players from snapshot that are missing on a newly rehydrated instance
    if (snapshot.players && typeof snapshot.players === 'object') {
      for (const [pid, pState] of Object.entries(snapshot.players)) {
        if (!room.players[pid] && pState && typeof pState === 'object') {
          room.players[pid] = {
            ...pState,
            answers: { ...(pState.answers || {}) },
          };
        }
      }
    }
    // If the server room is still at initial LOBBY Q0 while snapshot is further ahead, sync state
    if (
      room.status === 'LOBBY' &&
      room.currentQuestionIndex === 0 &&
      snapshot.status &&
      snapshot.status !== 'LOBBY'
    ) {
      room.status = snapshot.status;
      if (typeof snapshot.currentQuestionIndex === 'number') {
        room.currentQuestionIndex = snapshot.currentQuestionIndex;
      }
      if (typeof snapshot.questionStartTime === 'number') {
        room.questionStartTime = snapshot.questionStartTime;
      }
      if (typeof snapshot.questionDeadline === 'number') {
        room.questionDeadline = snapshot.questionDeadline;
      }
      if (snapshot.fastestPlayerInCurrentQuestion) {
        room.fastestPlayerInCurrentQuestion = snapshot.fastestPlayerInCurrentQuestion;
      }
      if (snapshot.statsPerQuestion) {
        room.statsPerQuestion = { ...snapshot.statsPerQuestion };
      }
    }
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

    // 1. STATE POLL + HOST SNAPSHOT REHYDRATION
    if (op === 'state') {
      const code = typeof body.roomCode === 'string' ? body.roomCode.trim().toUpperCase() : '';
      if (!code) {
        return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
      }
      const hostToken = typeof body.hostToken === 'string' ? body.hostToken : undefined;
      const playerId = typeof body.playerId === 'string' ? body.playerId : undefined;
      const room = rehydrateRoomFromSnapshot(roomManager, code, hostToken, body.snapshot);

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
    }

    // 2. PLAYER JOIN
    if (op === 'join') {
      const code = typeof body.roomCode === 'string' ? body.roomCode.trim().toUpperCase() : '';
      if (!code) {
        return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
      }

      const room = roomManager.getRoom(code);
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

      const player = room.joinPlayer(nickname, unit);
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

      const room = rehydrateRoomFromSnapshot(roomManager, code, hostToken, body.snapshot);
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

      const room = roomManager.getRoom(code);
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

      if (!room.players[body.playerId]) {
        return NextResponse.json(
          { error: 'Player not found in room' },
          { status: 404 }
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
