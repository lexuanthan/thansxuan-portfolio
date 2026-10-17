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

    const body = await request.json().catch(() => null);
    if (
      !body ||
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
  } catch (error) {
    console.error('Error submitting quiz answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}
