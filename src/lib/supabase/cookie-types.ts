/**
 * @supabase/ssr khai báo option `cookies` là union của API mới (getAll/setAll)
 * và API cũ (get/set/remove). Với union, TypeScript không suy ra được kiểu
 * tham số của method trong object literal → báo lỗi "implicitly has an 'any' type".
 * Vì vậy phải khai báo kiểu tường minh cho tham số của setAll.
 */
export type CookieToSet = {
  name: string;
  value: string;
  // Kiểu option cookie khác nhau giữa các phiên bản Next / @supabase/ssr,
  // để lỏng ở đây cho tương thích cả hai phía.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
};
