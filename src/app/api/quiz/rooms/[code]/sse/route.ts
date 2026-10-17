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

    const encoder = new TextEncoder();
    let unsubscribe: (() => void) | null = null;
    let pingInterval: NodeJS.Timeout | null = null;
    let isClosed = false;

    const stream = new ReadableStream({
      start(controller) {
        const sendEvent = (event: string, data: unknown) => {
          if (isClosed) return;
          try {
            const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(payload));
          } catch {
            cleanup();
          }
        };

        const cleanup = () => {
          if (isClosed) return;
          isClosed = true;

          if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
          }
          if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
          }
          try {
            controller.close();
          } catch {
            // Controller might already be closed
          }
        };

        // 1. Send initial state immediately
        const initialState = room.getSanitizedState({
          hostToken,
          requestingPlayerId: playerId,
        });
        sendEvent('roomState', initialState);

        // 2. Subscribe to room events
        unsubscribe = room.subscribe((state, event) => {
          if (isClosed) return;
          const sanitized = room.getSanitizedState({
            hostToken,
            requestingPlayerId: playerId,
          });
          sendEvent('roomState', sanitized);
          if (event && event.type) {
            sendEvent(event.type, event.data ?? sanitized);
          }
        });

        // 3. Keep-alive heartbeat ping
        pingInterval = setInterval(() => {
          if (isClosed) {
            cleanup();
            return;
          }
          try {
            controller.enqueue(encoder.encode('event: ping\ndata: {}\n\n'));
          } catch {
            cleanup();
          }
        }, 15000);

        // 4. Handle client disconnection via abort signal
        request.signal?.addEventListener('abort', () => {
          cleanup();
        });
      },
      cancel() {
        if (pingInterval) {
          clearInterval(pingInterval);
          pingInterval = null;
        }
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Error opening quiz room SSE stream:', error);
    return NextResponse.json(
      { error: 'Failed to open SSE stream' },
      { status: 500 }
    );
  }
}
