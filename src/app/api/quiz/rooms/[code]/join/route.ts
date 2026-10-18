import { NextResponse } from 'next/server';
import { QuizRoomManager } from '@/lib/training-quiz/roomManager';

interface RouteContext {
  params: Promise<{ code: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { code } = await context.params;
    if (!code) {
      return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
    }

    const roomManager = QuizRoomManager.getInstance();
    const room = roomManager.getRoom(code);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.status !== 'LOBBY') {
      return NextResponse.json(
        {
          error:
            'Trò chơi đã bắt đầu! Hệ thống đã khóa phòng, không cho phép người dùng khác truy cập vào thêm.',
          roomLocked: true,
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body.nickname !== 'string' || !body.nickname.trim()) {
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
  } catch (error) {
    console.error('Error joining quiz room:', error);
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    );
  }
}
