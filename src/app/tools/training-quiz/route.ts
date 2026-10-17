import { NextRequest, NextResponse } from 'next/server';

/**
 * Route Alias / Redirect:
 * /tools/training-quiz -> /ai-tools/training-quiz
 * Preserves all search parameters (e.g. ?mode=player&room=UTE202)
 */
export function GET(request: NextRequest) {
  const targetUrl = new URL('/ai-tools/training-quiz', request.url);

  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  return NextResponse.redirect(targetUrl, 307);
}
