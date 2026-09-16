/**
 * Tách đường dẫn để biết một lượt xem có thuộc về bài viết nào không.
 * Để riêng khỏi route API cho dễ kiểm thử.
 */

const POST_PREFIX = "/bai-viet/";

/**
 * "/bai-viet/cong-cu-ai" → "cong-cu-ai"
 * Mọi đường dẫn khác → null.
 *
 * Cắt bỏ query và hash trước khi so khớp: ViewTracker gửi pathname nên
 * thường không có, nhưng đây là dữ liệu từ trình duyệt gửi lên nên không
 * tin tưởng tuyệt đối được.
 */
export function postSlugFromPath(path: string): string | null {
  if (typeof path !== "string") return null;

  const clean = path.split("?")[0].split("#")[0];
  if (!clean.startsWith(POST_PREFIX)) return null;

  const rest = clean.slice(POST_PREFIX.length);

  // Chỉ nhận đúng một đoạn: "/bai-viet/abc/def" không phải trang bài viết.
  if (rest === "" || rest.includes("/")) return null;

  // decodeURIComponent ném lỗi với chuỗi % hỏng (ví dụ "%E0%A4%A") — dùng
  // nguyên bản thay vì để cả request lăn ra chết vì một lượt xem.
  try {
    return decodeURIComponent(rest);
  } catch {
    return rest;
  }
}
