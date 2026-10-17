import { NextResponse } from 'next/server';
import { QuizRoomManager } from '@/lib/training-quiz/roomManager';
import { HostActionType } from '@/lib/training-quiz/types';

interface RouteContext {
  params: Promise<{ code: string }>;
}

const ALLOWED_ACTIONS: readonly HostActionType[] = [
  'START',
  'NEXT_QUESTION',
  'SHOW_LEADERBOARD',
  'END_GAME',
] as const;

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
    if (!body || typeof body.hostToken !== 'string' || !body.hostToken.trim()) {
      return NextResponse.json(
        { error: 'Host token is required' },
        { status: 401 }
      );
    }

    if (body.hostToken !== room.hostToken) {
      return NextResponse.json(
        { error: 'Unauthorized host token' },
        { status: 401 }
      );
    }

    const action = body.action as HostActionType;
    if (!action || !ALLOWED_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Allowed: ${ALLOWED_ACTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    const success = room.handleHostAction({
      hostToken: body.hostToken,
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
  } catch (error) {
    console.error('Error handling host action:', error);
    return NextResponse.json(
      { error: 'Failed to handle host action' },
      { status: 500 }
    );
  }
}
