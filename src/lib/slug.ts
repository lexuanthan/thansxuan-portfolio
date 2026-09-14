/**
 * Chuyển chuỗi tiếng Việt thành slug an toàn cho URL và tên file.
 * Bỏ dấu, đổi đ/Đ thành d, gộp ký tự lạ thành dấu gạch ngang.
 */
export function slugify(text: string, maxLength = 80): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}
