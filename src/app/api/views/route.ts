import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Ghi nhận 1 lượt xem trang. Gọi từ component ViewTracker. */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ ok: false, reason: "not-configured" });
  }

  try {
    const body = (await request.json()) as { path?: string; referrer?: string };
    const path = (body.path ?? "/").slice(0, 512);
    const referrer = (body.referrer ?? "").slice(0, 512) || null;

    const supabase = await createClient();
    const { error } = await supabase
      .from("page_views")
      .insert({ path, referrer });

    if (error) {
      return NextResponse.json({ ok: false, reason: error.message });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, reason: "bad-request" });
  }
}
