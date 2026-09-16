import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { postSlugFromPath } from "@/lib/views";

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
    const { error } = await supabase.from("page_views").insert({ path, referrer });

    if (error) {
      return NextResponse.json({ ok: false, reason: error.message });
    }

    /**
     * Trang bài viết thì cộng thêm vào bộ đếm riêng của bài.
     * Gọi qua hàm increment_post_views chứ không UPDATE thẳng: khách không có
     * quyền sửa bảng posts, và cũng không nên có.
     *
     * Lỗi ở bước này cố tình nuốt — chưa chạy file SQL v2 thì hàm chưa tồn
     * tại, nhưng lượt xem trang ở trên đã ghi xong rồi, không việc gì phải
     * báo hỏng cả request.
     */
    const slug = postSlugFromPath(path);
    if (slug) {
      await supabase.rpc("increment_post_views", { post_slug: slug });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, reason: "bad-request" });
  }
}
