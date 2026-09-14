import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { CF_API_TOKEN, cfImageEndpoint, isAiConfigured } from "@/lib/ai/config";
import { normalizePrompt, normalizeSteps } from "@/lib/ai/prompt";

/**
 * Sinh ảnh nền bằng Cloudflare Workers AI (FLUX.1 schnell).
 *
 * CHỈ tài khoản đã đăng nhập mới gọi được — hạn mức miễn phí 10.000 Neuron/ngày
 * là của riêng tài khoản Cloudflare, để ngỏ cho người lạ là bị đốt sạch trong
 * vài phút. API token nằm hoàn toàn phía server, không bao giờ ra trình duyệt.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // ---- 1. Chặn người chưa đăng nhập ----
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Chưa cấu hình Supabase nên không xác thực được." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Tính năng sinh ảnh AI chỉ dành cho tài khoản quản trị đã đăng nhập." },
      { status: 401 }
    );
  }

  // ---- 2. Kiểm tra cấu hình ----
  if (!isAiConfigured) {
    return NextResponse.json(
      {
        error:
          "Chưa cấu hình Cloudflare. Cần thêm CLOUDFLARE_ACCOUNT_ID và CLOUDFLARE_API_TOKEN.",
      },
      { status: 503 }
    );
  }

  // ---- 3. Chuẩn hoá dữ liệu vào ----
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const raw = (body ?? {}) as { prompt?: unknown; steps?: unknown };
  const prompt = normalizePrompt(raw.prompt);
  const steps = normalizeSteps(raw.steps);

  if (prompt.length < 3) {
    return NextResponse.json(
      { error: "Hãy mô tả ảnh anh muốn tạo, ít nhất vài chữ." },
      { status: 400 }
    );
  }

  // ---- 4. Gọi Cloudflare ----
  try {
    const res = await fetch(cfImageEndpoint(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, steps }),
      signal: AbortSignal.timeout(55_000),
    });

    const payload = (await res.json().catch(() => null)) as {
      success?: boolean;
      result?: { image?: string };
      errors?: { code?: number; message?: string }[];
    } | null;

    if (!res.ok || !payload?.success) {
      const first = payload?.errors?.[0];
      const message = first?.message ?? `Cloudflare trả về lỗi ${res.status}`;

      // 429 = hết hạn mức Neuron miễn phí trong ngày
      const friendly =
        res.status === 429 || first?.code === 3040
          ? "Đã hết hạn mức miễn phí hôm nay. Hạn mức reset lúc 7h sáng giờ Việt Nam."
          : message;

      return NextResponse.json({ error: friendly }, { status: res.status || 502 });
    }

    const base64 = payload.result?.image;
    if (!base64) {
      return NextResponse.json(
        { error: "Cloudflare không trả về ảnh." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      image: `data:image/jpeg;base64,${base64}`,
      prompt,
      steps,
    });
  } catch (err) {
    const message =
      err instanceof Error && err.name === "TimeoutError"
        ? "Quá thời gian chờ. Thử lại với số bước thấp hơn."
        : "Không kết nối được tới Cloudflare.";
    return NextResponse.json({ error: message }, { status: 504 });
  }
}
