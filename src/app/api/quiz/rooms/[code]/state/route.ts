import { NextResponse } from 'next/server';
import { QuizRoomManager } from '@/lib/training-quiz/roomManager';

interface RouteContext {
  params: Promise<{ code: string }>;
}

export async function GET(request: Request, context: RouteContext) {
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

    const url = new URL(request.url);
    const hostToken = url.searchParams.get('hostToken') || undefined;
    const playerId = url.searchParams.get('playerId') || undefined;

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
    return NextResponse.json(
      { error: 'Failed to fetch room state' },
      { status: 500 }
    );
  }
}
