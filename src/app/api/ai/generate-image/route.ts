import { NextResponse } from "next/server";

/**
 * Tính năng sinh ảnh bằng AI đã được gỡ khỏi tool ghép logo.
 *
 * Giữ lại địa chỉ này và trả về 410 thay vì xoá hẳn file: nếu còn tab nào mở
 * bản cũ, nó sẽ nhận một câu trả lời rõ ràng thay vì lỗi 404 khó hiểu. Quan
 * trọng hơn, đường gọi tới Cloudflare bị cắt hẳn nên không còn cách nào tiêu
 * hạn mức của tài khoản nữa.
 *
 * Muốn dọn sạch, anh xoá các thư mục và file sau rồi bỏ hai biến môi trường
 * CLOUDFLARE_* trên Vercel:
 *   src/app/api/ai/    src/lib/ai/    tests/ai-prompt.test.ts    CLOUDFLARE-AI.md
 */

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { error: "Tính năng sinh ảnh bằng AI đã được gỡ khỏi công cụ này." },
    { status: 410 }
  );
}
