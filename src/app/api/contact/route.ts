import { NextResponse, type NextRequest } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { looksLikeBot, normalizeContact, validateContact } from "@/lib/contact";

/**
 * Nhận lời nhắn từ form liên hệ.
 *
 * Dùng khoá công khai (anon) chứ không phải khoá bí mật: RLS trên bảng messages
 * chỉ mở đúng quyền INSERT cho khách, còn đọc thì phải đăng nhập. Kể cả người
 * ta lấy được khoá này trong mã nguồn trình duyệt cũng không xem được lời nhắn
 * của người khác.
 */

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const src = (raw ?? {}) as Record<string, unknown>;

  // Bot điền cả ô ẩn. Trả về thành công giả để chúng không dò ra cơ chế chặn.
  if (looksLikeBot(src.website)) {
    return NextResponse.json({ ok: true });
  }

  const input = normalizeContact(src);
  const errors = validateContact(input);

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  try {
    const supabase = createPublicClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Máy chủ chưa cấu hình xong, anh chị gửi email trực tiếp giúp mình nhé." },
        { status: 503 }
      );
    }

    const { error } = await supabase.from("messages").insert({
      name: input.name,
      email: input.email,
      subject: input.subject || null,
      content: input.content,
    });

    if (error) {
      return NextResponse.json(
        { error: "Chưa lưu được lời nhắn. Anh chị thử lại sau ít phút giúp mình." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Không kết nối được tới máy chủ." }, { status: 502 });
  }
}
